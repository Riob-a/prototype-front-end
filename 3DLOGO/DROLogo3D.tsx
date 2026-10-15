"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Center, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Requires: three, @react-three/fiber, @react-three/drei
 * Asset:    /public/dro-logo.svg  (use dro-logo-clean.svg: plain fills, no <style>/<metadata>)
 * Path order in the SVG: 1st path = globe, 2nd path = triangle monogram.
 */

type ModelProps = {
  svgUrl?: string;
  /** Extrusion depth in SVG units (the SVG is 2048 wide). Globe and triangle share it, so the faces are flush. */
  depth?: number;
  globeColor?: string;
  triangleColor?: string;
  /** Fires once the SVG is loaded and the meshes are mounted (use it to release your page loader). */
  onReady?: () => void;
  /** Click/tap on the logo (drags don't count). Use it for the light/dark toggle the sphere used to do. */
  onToggleTheme?: () => void;
};

/** Just the mesh group: drop this inside an existing <Canvas> (e.g. your Sculpture scene). */
export function DROLogo3DModel({
  svgUrl = "/dro-logo-clean.svg",
  depth = 80,
  globeColor = "#e8453c",
  triangleColor = "#161616",
  onReady,
  onToggleTheme,
}: ModelProps) {
  const svg = useLoader(SVGLoader, svgUrl);

  const globeMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
        color: globeColor,
        metalness: 0.7,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 1.08,
        envMapIntensity: 1.2,
      }),
    [] // colours are updated below without rebuilding the material
  );
  const triMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
        color: triangleColor,
        metalness: 0.5,
        roughness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 1.05,
        envMapIntensity: 1.2,
      }),
    []
  );
  useEffect(() => void globeMat.color.set(globeColor), [globeColor, globeMat]);
  useEffect(() => void triMat.color.set(triangleColor), [triangleColor, triMat]);

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
    // SVG's Y axis points down, so flip Y; scale 2048 SVG units to ~3 scene units.
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
  );
}

type Props = ModelProps & {
  autoRotate?: boolean;
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
  tier = "high",
  fallbackSrc = "/dro-logo.svg",
  className,
  style,
  ...model
}: Props) {
  if (tier === "low") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fallbackSrc}
        alt="DRO logo"
        className={className}
        onClick={model.onToggleTheme}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          cursor: model.onToggleTheme ? "pointer" : undefined,
          ...style,
        }}
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
        <Suspense fallback={null}>
          <DROLogo3DModel {...model} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  );
}