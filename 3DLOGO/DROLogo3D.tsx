"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Center, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Requires: three, @react-three/fiber, @react-three/drei
 * Asset:    /public/dro-logo.svg  (use dro-logo-clean.svg: plain fills, no <style>/<metadata>)
 * Path order in the SVG: 1st path = globe, 2nd path = triangle monogram.
 */

/**
 * Lets colour props be CSS variables, e.g. globeColor="var(--brass)".
 * Re-reads when <html data-theme> changes. Use values THREE can parse
 * (hex, rgb(), hsl(), named); modern formats like oklch() are not supported.
 */
function useCssColor(value: string) {
  const [resolved, setResolved] = useState(value.startsWith("var(") ? "#e8453c" : value);
  useEffect(() => {
    if (!value.startsWith("var(")) {
      setResolved(value);
      return;
    }
    const name = value.slice(4, -1).split(",")[0].trim();
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      if (v) setResolved(v);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [value]);
  return resolved;
}

/**
 * Low-tier fallback. An <img> can't be recoloured by CSS, so this fetches the
 * SVG, swaps the hardcoded fills for CSS custom properties and inlines it.
 * Colours can be hex or CSS variables (e.g. "var(--brass)") and follow the theme.
 * Path order: 1st path = globe, 2nd path = triangle.
 */
function StaticLogo({
  src,
  globeColor,
  triangleColor,
  className,
  onClick,
  style,
}: {
  src: string;
  globeColor: string;
  triangleColor: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        let i = 0;
        const out = text
          .replace(/<\?xml[^>]*\?>/g, "")
          .replace(/<svg\b/, '<svg style="width:100%;height:100%;display:block"')
          .replace(/<path\b([^>]*?)(\/?)>/g, (_m, attrs: string, close: string) => {
            const v = i++ === 0 ? "--dro-globe" : "--dro-tri";
            const cleaned = attrs.replace(/\sfill="[^"]*"/, "");
            return `<path${cleaned} style="fill:var(${v})"${close}>`;
          });
        setMarkup(out);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      role="img"
      aria-label="DRO logo"
      className={className}
      onClick={onClick}
      style={
        {
          "--dro-globe": globeColor,
          "--dro-tri": triangleColor,
          width: "100%",
          height: "100%",
          cursor: onClick ? "pointer" : undefined,
          ...style,
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

type ModelProps = {
  svgUrl?: string;
  /** Extrusion depth in SVG units (the SVG is 2048 wide). Globe and triangle share it, so the faces are flush. */
  depth?: number;
  globeColor?: string;
  triangleColor?: string;
  /** Gentle pointer-following sway and float instead of a full spin (the front face stays readable). */
  sway?: boolean;
  /** Fires once the SVG is loaded and the meshes are mounted (use it to release your page loader). */
  onReady?: () => void;
  /** Click/tap on the logo (drags don't count). Use it for the light/dark toggle the sphere used to do. */
  onToggleTheme?: () => void;
};

/** Just the mesh group: drop this inside an existing <Canvas> (e.g. your Sculpture scene). */
export function DROLogo3DModel({
  svgUrl = "/dro-logo-clean.svg",
  depth = 60,
  globeColor = "#e8453c",
  triangleColor = "#161616",
  sway = true,
  onReady,
  onToggleTheme,
}: ModelProps) {
  const svg = useLoader(SVGLoader, svgUrl);
  const globeCol = useCssColor(globeColor);
  const triCol = useCssColor(triangleColor);
  const swayRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = swayRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const targetY = sway ? Math.sin(t * 0.6) * 0.5 + state.pointer.x * 0.3 : 0;
    const targetX = sway ? Math.sin(t * 0.4) * 0.12 - state.pointer.y * 0.2 : 0;
    // ease toward the target so pointer moves feel smooth
    g.rotation.y += (targetY - g.rotation.y) * 0.08;
    g.rotation.x += (targetX - g.rotation.x) * 0.08;
    g.position.y = sway ? Math.sin(t) * 0.05 : 0;
  });

  const globeMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
        color: globeColor,
        metalness: 0.3,
        roughness: 0.45,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.6,
      }),
    [] // colours are updated below without rebuilding the material
  );
  const triMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
        color: triangleColor,
        metalness: 0.4,
        roughness: 0.25,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.4,
      }),
    []
  );
  useEffect(() => {
    try {
      globeMat.color.set(globeCol);
    } catch {}
  }, [globeCol, globeMat]);
  useEffect(() => {
    try {
      triMat.color.set(triCol);
    } catch {}
  }, [triCol, triMat]);

  // Shapes only depend on the SVG; geometry is rebuilt when depth changes.
  const shapes = useMemo(
    () => svg.paths.map((p) => SVGLoader.createShapes(p)),
    [svg]
  );

  const geometries = useMemo(
    () =>
      shapes.map((group) =>
        group.map(
          (shape) =>
            new THREE.ExtrudeGeometry(shape, {
              depth,
              bevelEnabled: true,
              bevelThickness: 6,
              bevelSize: 3,
              bevelSegments: 4,
              curveSegments: 6,
            })
        )
      ),
    [shapes, depth]
  );

  useEffect(
    () => () => geometries.forEach((g) => g.forEach((geo) => geo.dispose())),
    [geometries]
  );
  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      globeMat.dispose();
      triMat.dispose();
    },
    [globeMat, triMat]
  );

  return (
    <group ref={swayRef}>
    {/* SVG's Y axis points down, so flip Y; scale 2048 SVG units to ~3 scene units. */}
    <group
      scale={[0.0015, -0.0015, 0.0015]}
      onClick={onToggleTheme}
      onPointerOver={() => {
        if (onToggleTheme) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <Center>
        {geometries.map((group, i) =>
          group.map((geo, j) => (
            <mesh key={`${i}-${j}`} geometry={geo} material={i === 0 ? globeMat : triMat} />
          ))
        )}
      </Center>
    </group>
    </group>
  );
}

type Props = ModelProps & {
  /** Animate the logo (sway, or spin if motion="spin"). Set false for a still logo. */
  autoRotate?: boolean;
  /** "sway" = gentle pointer-following tilt (default). "spin" = full 360 turntable. */
  motion?: "sway" | "spin";
  /** Pass the result of your detectDeviceTier() here; "low" renders the static fallback instead of WebGL. */
  tier?: "low" | "mid" | "high";
  /** Static image shown on low-tier devices (e.g. a PNG/SVG export of the logo). */
  fallbackSrc?: string;
  className?: string;
  style?: React.CSSProperties;
};

/** Self-contained canvas version. */
export default function DROLogo3D({
  autoRotate = true,
  motion = "sway",
  tier = "high",
  fallbackSrc = "/dro-logo-clean.svg",
  className,
  style,
  ...model
}: Props) {
  if (tier === "low") {
    return (
      <StaticLogo
        src={fallbackSrc}
        globeColor={model.globeColor ?? "#e8453c"}
        triangleColor={model.triangleColor ?? "#161616"}
        className={"logo"}
        onClick={model.onToggleTheme}
        style={style}
      />
    );
  }

  return (
    <div className={className} style={{ width: "100%", height: "100%", ...style }}>
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 35 }}
        dpr={tier === "mid" ? 1.5 : [1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <hemisphereLight args={[0xffffff, 0x555555, 0.35]} />
        {/* Studio reflections generated in code (no HDR download). Shiny materials need something to reflect. */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={4} position={[0, 5, -5]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
          <Lightformer form="ring" intensity={3} position={[0, -3, 3]} scale={4} />
        </Environment>
        <directionalLight position={[3, 4, 6]} intensity={1.1} />
        <directionalLight position={[-4, -1.5, -4.5]} intensity={0.5} />
        {/* warm rim light behind the logo to separate its edge from a dark wall */}
        <directionalLight position={[0, 2, -5]} intensity={1.5} color="#ffd9b0" />
        <Suspense fallback={null}>
          <DROLogo3DModel {...model} sway={autoRotate && motion === "sway"} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          autoRotate={autoRotate && motion === "spin"}
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  );
}