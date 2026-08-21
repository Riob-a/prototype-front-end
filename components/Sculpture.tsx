"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, Text3D, Center, Edges, useProgress } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";
import * as THREE from "three";

// Served locally from /public/fonts. Currently set to Panchang Bold — the
// other two options (unbounded-black.json, helvetiker-regular.json) are
// sitting in that same folder if you want to switch.
const FONT_URL = "/fonts/panchang-bold.json";

const LABELS = [
  { text: "WORKS", id: "wing-i" },
  { text: "MEDIA", id: "wing-ii" },
  { text: "ARTIST", id: "wing-iii" },
  { text: "VISIT", id: "wing-iv" },
];

const ORBIT_RADIUS = 1.7;
const ORBIT_SPEED = 0.25;

function MetallicSphere({
  onToggleTheme,
  theme,
}: {
  onToggleTheme?: () => void;
  theme: "dark" | "light";
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const { scale } = useSpring({
    scale: hovered ? 1.08 : 1,
    config: {
      mass: 1.4,
      tension: 210,
      friction: 18,
    },
  });
  const clickRotation = useRef(0);
  const clickVelocity = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Normal rotation
    meshRef.current.rotation.y +=
      delta * (hovered ? 0.55 : 0.18);

    meshRef.current.rotation.x += delta * 0.04;

    // Click rotation impulse
    if (clickVelocity.current > 0) {
      meshRef.current.rotation.y +=
        delta * clickVelocity.current;

      clickVelocity.current *= Math.pow(0.08, delta);

      if (clickVelocity.current < 0.01) {
        clickVelocity.current = 0;
      }
    }

    clickRotation.current = meshRef.current.rotation.y;
  });

  const handleClick = (e: any) => {
    e.stopPropagation();

    setActive((v) => !v);

    // Give the sphere a strong rotational impulse
    clickVelocity.current = 7;

    onToggleTheme?.();
  };

  return (
    <a.group
      ref={meshRef}
      scale={scale}
    >
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={handleClick}
      >
        <icosahedronGeometry args={[1.35, 8]} />
        <meshPhysicalMaterial
          depthWrite={false}
          color={theme === "dark" ? "#ffffff" : "#050505"}
          metalness={1}
          roughness={0.15}
          envMapIntensity={1.4}
          transparent
          ior={1.5}
          transmission={1}
          opacity={0.3}
          thickness={0.5}
        />
      </mesh>

      <mesh renderOrder={10}>
        <icosahedronGeometry args={[1.36, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
        <Edges
          threshold={1}
          color={theme === "dark" ? "#000000" : "#edebeb"}
          lineWidth={1}
        />
      </mesh>
    </a.group>
  );
}

// Purely presentational: hover spring (scale/color) + click. Position is
// NOT computed here — the parent owns a single shared clock and moves every
// label from one place, so pausing one label can never desync it from the
// others (which is what caused the overlap-on-resume bug).
function OrbitLabel({
  text,
  onSelect,
  onHoverChange,
  groupRef,
}: {
  text: string;
  onSelect: () => void;
  onHoverChange: (hovered: boolean) => void;
  groupRef: (el: THREE.Group | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const { scale, color } = useSpring({
    scale: hovered ? 1.3 : 1,
    color: hovered ? "#d9c2ff" : "#f3eefb",
    config: { tension: 260, friction: 20 },
  });

  return (
    <a.group
      ref={groupRef}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHoverChange(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHoverChange(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <Center>
        <Text3D
          font={FONT_URL}
          size={0.10}
          height={0.1}
          curveSegments={6}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.015}
          bevelSegments={3}
        >
          {text}
          <a.meshStandardMaterial
            color={color}
            metalness={0.6}
            roughness={0.3}
          />
        </Text3D>
      </Center>
    </a.group>
  );
}

// Owns the one shared clock all labels orbit on, and the imperative
// per-frame position update for all of them. Pausing is a single global
// flag (any label hovered), so spacing between labels never drifts.
// function OrbitingLabels({ onNavigate }: { onNavigate: (id: string) => void }) {
//   const groupRefs = useRef<(THREE.Group | null)[]>([]);
//   const sharedTime = useRef(0);
//   const hoveredCount = useRef(0);
//   const { camera } = useThree();

//   useFrame((_, delta) => {
//     if (hoveredCount.current === 0) {
//       sharedTime.current += delta;
//     }
//     LABELS.forEach((_, i) => {
//       const group = groupRefs.current[i];
//       if (!group) return;
//       const baseAngle = (i / LABELS.length) * Math.PI * 2;
//       const angle = baseAngle + sharedTime.current * ORBIT_SPEED;
//       group.position.set(
//         Math.cos(angle) * ORBIT_RADIUS,
//         Math.sin(sharedTime.current * 0.2 - i) * 0.2,
//         Math.sin(angle) * ORBIT_RADIUS
//       );
//       group.lookAt(camera.position);
//     });
//   });

//   return (
//     <Suspense fallback={null}>
//       {LABELS.map((label, i) => (
//         <OrbitLabel
//           key={label.id}
//           text={label.text}
//           onSelect={() => onNavigate(label.id)}
//           onHoverChange={(isHovered) => {
//             hoveredCount.current += isHovered ? 1 : -1;
//           }}
//           groupRef={(el) => {
//             groupRefs.current[i] = el;
//           }}
//         />
//       ))}
//     </Suspense>
//   );
// }
function SculptureLoader({
  onProgress,
  onReady,
}: {
  onProgress: (progress: number) => void;
  onReady: () => void;
}) {
  const { progress, active } = useProgress();
  const [minimumTimePassed, setMinimumTimePassed] = useState(false);
  const [ready, setReady] = useState(false);

  // Minimum loading-screen display time
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinimumTimePassed(true);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);

  // Send actual Three.js loading progress to page.tsx
  useEffect(() => {
    onProgress(progress);
  }, [progress, onProgress]);

  // Decide when the sphere is genuinely ready
  useEffect(() => {
    if (
      !active &&
      progress >= 100 &&
      minimumTimePassed &&
      !ready
    ) {
      setReady(true);

      // Give Three.js a couple of frames to render
      // the completed sphere before removing the loader.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onReady();
        });
      });
    }
  }, [
    active,
    progress,
    minimumTimePassed,
    ready,
    onReady,
  ]);

  return null;
}

export default function Sculpture({
  onNavigate = () => { },
  onToggleTheme,
  theme,
  onReady,
  onProgress,
}: {
  onNavigate?: (id: string) => void;
  onToggleTheme?: () => void;
  theme: "dark" | "light";
  onReady?: () => void;
  onProgress?: (progress: number) => void;
}) {

  return (
    <div style={{ width: "100%", height: "100%", cursor: "pointer" }}>
      <Canvas
        camera={{ position: [0, 0.4, 5.6], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <SculptureLoader
          onProgress={(progress) => onProgress?.(progress)}
          onReady={() => onReady?.()}
        />

        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />

          <MetallicSphere
            onToggleTheme={onToggleTheme}
            theme={theme}
          />

          <Environment
            files="/hdri/potsdamer_platz_1k.hdr"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
