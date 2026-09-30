"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";

/* =========================================================
   ANIMATED PROCEDURAL SCULPTURE
   ========================================================= */

function AnimatedLathe() {
  const materialRef = useRef();

  /*
   * Mouse position sent to the shader.
   */
  const mouse = useRef(
    new THREE.Vector2(0, 0)
  );

  /*
   * Morph state.
   *
   * 0 = original form
   * 1 = second form
   */
  const morph = useRef(0);
  const morphTarget = useRef(0);

  const SEGMENTS = 95;
  const PROFILE_POINTS = 150;

  const HEIGHT = 8;

  const OUTER_RADIUS = 1.8;
  const WALL_THICKNESS = 0.42;

  const INNER_RADIUS =
    OUTER_RADIUS -
    WALL_THICKNESS;


  /* =======================================================
     GEOMETRY
     ======================================================= */

  const geometry = useMemo(() => {

    const points = [];


    /*
     * OUTER WALL
     */
    for (
      let i = 0;
      i <= PROFILE_POINTS;
      i++
    ) {

      const y =
        (i / PROFILE_POINTS) *
        HEIGHT;

      points.push(
        new THREE.Vector2(
          OUTER_RADIUS,
          y
        )
      );
    }


    /*
     * INNER WALL
     *
     * Reverse direction so the lathe creates
     * the hollow wall correctly.
     */
    for (
      let i = PROFILE_POINTS;
      i >= 0;
      i--
    ) {

      const y =
        (i / PROFILE_POINTS) *
        HEIGHT;

      points.push(
        new THREE.Vector2(
          INNER_RADIUS,
          y
        )
      );
    }


    return new THREE.LatheGeometry(
      points,
      SEGMENTS
    );

  }, []);


  /* =======================================================
     SHADERS
     ======================================================= */

  const shader = useMemo(() => {

    return {

      uniforms: {

        uTime: {
          value: 0,
        },

        uMouse: {
          value:
            new THREE.Vector2(0, 0),
        },

        uMorph: {
          value: 0,
        },

        uOuterRadius: {
          value: OUTER_RADIUS,
        },

        uInnerRadius: {
          value: INNER_RADIUS,
        },

        uHeight: {
          value: HEIGHT,
        },

      },


      /* ===================================================
         VERTEX SHADER
         =================================================== */

      vertexShader: `

        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uMorph;

        uniform float uOuterRadius;
        uniform float uInnerRadius;
        uniform float uHeight;


        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vHeight;
        varying float vNoise;

        /*
         * 0 = outer surface
         * 1 = inner surface
         */
        varying float vIsInner;


        /* =================================================
           NOISE
           ================================================= */

        float hash(vec2 p) {

          return fract(
            sin(
              dot(
                p,
                vec2(
                  127.1,
                  311.7
                )
              )
            )
            *
            43758.5453123
          );

        }


        float noise(vec2 p) {

          vec2 i =
            floor(p);

          vec2 f =
            fract(p);


          f =
            f *
            f *
            (
              3.0 -
              2.0 *
              f
            );


          float a =
            hash(i);

          float b =
            hash(
              i +
              vec2(1.0, 0.0)
            );

          float c =
            hash(
              i +
              vec2(0.0, 1.0)
            );

          float d =
            hash(
              i +
              vec2(1.0, 1.0)
            );


          return mix(
            mix(
              a,
              b,
              f.x
            ),

            mix(
              c,
              d,
              f.x
            ),

            f.y
          );

        }


        /* =================================================
           FORM A
           ================================================= */

        float formA(
          float y
        ) {

          float normalizedY =
            y /
            uHeight;


          float body =
            1.0
            +
            sin(
              y *
              0.85
            )
            *
            0.35

            +

            sin(
              y *
              1.7
            )
            *
            0.18;


          float taper =
            sin(
              normalizedY *
              3.14159
            );


          body *=
            0.82
            +
            taper *
            0.22;


          return body;

        }


        /* =================================================
           FORM B
           ================================================= */

        float formB(
          float y
        ) {

          float normalizedY =
            y /
            uHeight;


          float body =
            0.85

            +

            sin(
              y *
              1.2
            )
            *
            0.45

            +

            cos(
              y *
              2.4
            )
            *
            0.15;


          float waist =
            1.0
            -
            exp(
              -pow(
                (
                  normalizedY -
                  0.5
                )
                *
                5.0,

                2.0
              )
            )
            *
            0.3;


          body *=
            waist;


          return body;

        }


        /* =================================================
           BASE SCULPTURE RADIUS
           ================================================= */

        float sculptRadius(
          float y,
          float originalRadius
        ) {

          float midRadius =
            (
              uOuterRadius +
              uInnerRadius
            )
            *
            0.5;


          float isInner =
            step(
              originalRadius,
              midRadius
            );


          float baseA =
            formA(y);

          float baseB =
            formB(y);


          float baseForm =
            mix(
              baseA,
              baseB,
              uMorph
            );


          float wave1 =
            sin(
              y *
              2.5
              +
              uTime *
              1.5
            )
            *
            0.30;


          float wave2 =
            sin(
              y *
              5.0
              -
              uTime *
              2.0
            )
            *
            0.13;


          float wave3 =
            cos(
              y *
              1.3
              +
              uTime *
              0.8
            )
            *
            0.18;


          float breathing =
            sin(
              uTime *
              1.2
            )
            *
            0.12;


          float pinch =
            sin(
              y *
              3.0
              -
              uTime *
              1.8
            )
            *
            0.16;


          float n =
            noise(
              vec2(
                y *
                0.8,

                uTime *
                0.15
              )
            );


          n =
            (
              n -
              0.5
            )
            *
            0.22;


          float deformation =
            baseForm
            +
            wave1
            +
            wave2
            +
            wave3
            +
            breathing
            +
            pinch
            +
            n;


          float thicknessWave =
            sin(
              y *
              2.0
              +
              uTime *
              1.1
            )
            *
            0.10;


          float dynamicThickness =
            0.42
            +
            thicknessWave;


          float outerRadius =
            deformation;


          float innerRadius =
            deformation -
            dynamicThickness;


          float finalRadius =
            mix(
              outerRadius,
              innerRadius,
              isInner
            );


          return max(
            finalRadius,
            0.15
          );

        }


        /* =================================================
           COMPLETE DEFORMED POSITION
           ================================================= */

        vec3 getDeformedPosition(
          float y,
          float originalRadius,
          float baseAngle
        ) {

          float radius =
            sculptRadius(
              y,
              originalRadius
            );


          float twist =
            sin(
              y *
              1.15
              +
              uTime *
              0.55
            )
            *
            0.45;


          twist *=
            0.5
            +
            (
              y /
              uHeight
            )
            *
            0.7;


          float angle =
            baseAngle +
            twist;


          vec3 p =
            vec3(

              cos(angle) *
              radius,

              y,

              sin(angle) *
              radius

            );


          float verticalWave =
            sin(
              y *
              2.0
              +
              uTime *
              1.2
            )
            *
            0.08;


          p.y +=
            verticalWave;


          float cursorX =
            uMouse.x *
            3.5;


          float cursorY =
            (
              uMouse.y *
              0.5
              +
              0.5
            )
            *
            uHeight;


          float horizontalDistance =
            abs(
              p.x -
              cursorX
            );


          float verticalDistance =
            abs(
              p.y -
              cursorY
            );


          float distanceToCursor =
            sqrt(

              horizontalDistance *
              horizontalDistance

              +

              verticalDistance *
              verticalDistance

            );


          float influenceRadius =
            4.0;


          float influence =
            1.0 -
            smoothstep(
              0.0,
              influenceRadius,
              distanceToCursor
            );


          influence =
            influence *
            influence *
            (
              3.0 -
              2.0 *
              influence
            );


          float normalizedY =
            y /
            uHeight;


          float bottomProtection =
            smoothstep(
              0.0,
              0.18,
              normalizedY
            );


          float topProtection =
            smoothstep(
              1.0,
              0.82,
              normalizedY
            );


          float endProtection =
            bottomProtection *
            topProtection;


          influence *=
            endProtection;


          float attraction =
            influence *
            0.55;


          p.x +=
            (
              cursorX -
              p.x
            )
            *
            attraction;


          float radialPull =
            influence *
            0.65;


          vec2 radialDirection =
            normalize(
              vec2(
                p.x,
                p.z
              )
            );


          p.x +=
            radialDirection.x *
            radialPull;


          p.z +=
            radialDirection.y *
            radialPull;


          float verticalBend =
            influence
            *
            (
              cursorY -
              p.y
            )
            *
            0.18;


          p.y +=
            verticalBend;


          float broadBend =
            sin(
              distanceToCursor *
              1.5
            )
            *
            influence
            *
            0.10;


          p.x +=
            broadBend *
            radialDirection.x;


          p.z +=
            broadBend *
            radialDirection.y;


          float ripple =
            sin(
              distanceToCursor *
              4.0
              -
              uTime *
              2.5
            );


          ripple *=
            influence *
            0.08;


          p.x +=
            radialDirection.x *
            ripple;


          p.z +=
            radialDirection.y *
            ripple;


          return p;

        }


        /* =================================================
           MAIN
           ================================================= */

        void main() {

          float y =
            position.y;


          float originalRadius =
            length(
              position.xz
            );


          float midRadius =
            (
              uOuterRadius +
              uInnerRadius
            )
            *
            0.5;


          vIsInner =
            step(
              originalRadius,
              midRadius
            );


          float baseAngle =
            atan(
              position.z,
              position.x
            );


          vec3 deformedPosition =
            getDeformedPosition(
              y,
              originalRadius,
              baseAngle
            );


          float epsilonY =
            0.012;


          float epsilonAngle =
            0.006;


          vec3 positionDown =
            getDeformedPosition(
              y -
              epsilonY,

              originalRadius,

              baseAngle
            );


          vec3 positionUp =
            getDeformedPosition(
              y +
              epsilonY,

              originalRadius,

              baseAngle
            );


          vec3 positionAround =
            getDeformedPosition(
              y,

              originalRadius,

              baseAngle +
              epsilonAngle
            );


          vec3 tangentY =
            positionUp -
            positionDown;


          vec3 tangentAround =
            positionAround -
            deformedPosition;


          vec3 deformedNormal =
            normalize(
              cross(
                tangentAround,
                tangentY
              )
            );


          vNormal =
            normalize(
              normalMatrix *
              deformedNormal
            );


          vPosition =
            deformedPosition;


          vHeight =
            y /
            uHeight;


          vNoise =
            noise(
              vec2(
                y *
                0.8,

                uTime *
                0.1
              )
            );


          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(
              deformedPosition,
              1.0
            );

        }

      `,


      /* ===================================================
         FRAGMENT SHADER
         =================================================== */

      fragmentShader: `

        uniform float uTime;


        varying vec3 vNormal;
        varying vec3 vPosition;

        varying float vHeight;
        varying float vNoise;

        varying float vIsInner;


        void main() {

          /* =================================================
             NORMAL
             ================================================= */

          vec3 normal =
            normalize(
              vNormal
            );


          /* =================================================
             VIEW DIRECTION
             ================================================= */

          vec3 viewDirection =
            normalize(
              cameraPosition -
              vPosition
            );


          /* =================================================
             FRONT / BACK
             ================================================= */

          float viewFacing =
            dot(
              normal,
              viewDirection
            );


          float frontFacing =
            smoothstep(
              0.0,
              0.45,
              viewFacing
            );


          float backFacing =
            1.0 -
            frontFacing;


          /* =================================================
             SURFACE TYPE
             ================================================= */

          float inner =
            smoothstep(
              0.0,
              1.0,
              vIsInner
            );


          float outer =
            1.0 -
            inner;


          /* =================================================
             VIEW-FACING NORMAL
             ================================================= */

          vec3 lightingNormal =
            normal;


          if (
            dot(
              lightingNormal,
              viewDirection
            ) < 0.0
          ) {

            lightingNormal =
              -lightingNormal;

          }


          /* =================================================
             MAIN STUDIO LIGHT
             ================================================= */

          vec3 lightDirection =
            normalize(
              vec3(
                5.0,
                8.0,
                5.0
              )
            );


          float diffuse =
            max(
              dot(
                lightingNormal,
                lightDirection
              ),
              0.0
            );


          /* =================================================
             SECONDARY LIGHT
             ================================================= */

          vec3 secondaryLight =
            normalize(
              vec3(
                -4.0,
                3.0,
                -5.0
              )
            );


          float secondary =
            max(
              dot(
                lightingNormal,
                secondaryLight
              ),
              0.0
            );


          /* =================================================
             CAVITY LIGHT
             ================================================= */

          vec3 cavityLight =
            normalize(
              vec3(
                0.0,
                4.0,
                -3.0
              )
            );


          float cavityDiffuse =
            max(
              dot(
                lightingNormal,
                cavityLight
              ),
              0.0
            );


          /* =================================================
             BACK FILL
             ================================================= */

          vec3 backLight =
            normalize(
              vec3(
                -2.0,
                2.0,
                -4.0
              )
            );


          float backFill =
            max(
              dot(
                lightingNormal,
                backLight
              ),
              0.0
            );


          /* =================================================
             FRESNEL
             ================================================= */

          float viewDot =
            max(
              dot(
                lightingNormal,
                viewDirection
              ),
              0.0
            );


          /*
           * Sharper Fresnel response.
           *
           * This keeps the metallic reflection concentrated
           * near the grazing edges instead of producing a
           * broad purple stripe.
           */
          float fresnel =
            pow(
              1.0 -
              viewDot,
              5.5
            );


          /* =================================================
             OUTER COLOR
             ================================================= */

          vec3 outerBottom =
            vec3(
              0.045,
              0.025,
              0.060
            );


          vec3 outerTop =
            vec3(
              0.30,
              0.16,
              0.40
            );


          vec3 outerColor =
            mix(
              outerBottom,
              outerTop,
              vHeight
            );


          /* =================================================
             INNER COLOR
             ================================================= */

          vec3 innerBottom =
            vec3(
              0.018,
              0.008,
              0.028
            );


          vec3 innerTop =
            vec3(
              0.12,
              0.045,
              0.17
            );


          vec3 innerColor =
            mix(
              innerBottom,
              innerTop,
              vHeight
            );


          /* =================================================
             SELECT SURFACE COLOR
             ================================================= */

          vec3 baseColor =
            mix(
              outerColor,
              innerColor,
              inner
            );


          /* =================================================
             SURFACE VARIATION
             ================================================= */

          baseColor +=
            vec3(
              vNoise *
              0.045
            );


          /* =================================================
             OUTER LIGHTING
             ================================================= */

          float outerLighting =
            0.28

            +

            diffuse *
            0.62

            +

            secondary *
            0.25

            +

            backFill *
            0.12;


          /* =================================================
             INNER LIGHTING
             ================================================= */

          float innerLighting =
            0.16

            +

            diffuse *
            0.25

            +

            secondary *
            0.10

            +

            cavityDiffuse *
            0.18

            +

            backFill *
            0.06;


          /* =================================================
             CAVITY DEPTH
             ================================================= */

          float cavityDepth =
            inner *
            (
              1.0 -
              fresnel
            );


          innerLighting *=
            1.0 -
            cavityDepth *
            0.28;


          /* =================================================
             COMBINE LIGHTING
             ================================================= */

          float lighting =
            mix(
              outerLighting,
              innerLighting,
              inner
            );


          vec3 color =
            baseColor *
            lighting;


          /* =================================================
             METALLIC COLORS
             ================================================= */

          /*
           * Darker metallic violet.
           *
           * Previously:
           * vec3(0.72, 0.42, 0.95)
           *
           * Now considerably darker so the Fresnel
           * reads as reflected metal instead of glow.
           */
          vec3 outerMetal =
            vec3(
              0.48,
              0.26,
              0.68
            );


          vec3 innerMetal =
            vec3(
              0.24,
              0.075,
              0.36
            );


          vec3 metalColor =
            mix(
              outerMetal,
              innerMetal,
              inner
            );


          /* =================================================
             METALLIC FRESNEL
             ================================================= */

          /*
           * Reduced intensity.
           *
           * This is the primary change responsible for
           * suppressing the bright purple streak.
           */
          color +=
            metalColor
            *
            fresnel
            *
            mix(
              0.30,
              0.12,
              inner
            );


          /* =================================================
             FRONT HIGHLIGHT
             ================================================= */

          float frontHighlight =
            pow(
              frontFacing,
              3.0
            );


          color +=
            vec3(
              0.18,
              0.08,
              0.24
            )
            *
            frontHighlight
            *
            outer
            *
            0.18;


          /* =================================================
             BACK SURFACE
             ================================================= */

          float backShade =
            backFacing
            *
            outer
            *
            0.20;


          color *=
            1.0 -
            backShade;


          /* =================================================
             INNER CAVITY RIM
             ================================================= */

          float cavityRim =
            fresnel
            *
            inner
            *
            0.8;


          color +=
            vec3(
              0.30,
              0.08,
              0.45
            )
            *
            cavityRim
            *
            0.35;


          /* =================================================
             OUTER METALLIC RIM
             ================================================= */

          float outerRim =
            fresnel *
            outer;


          color +=
            vec3(
              0.55,
              0.28,
              0.72
            )
            *
            outerRim
            *
            0.18;


          /* =================================================
             VERTICAL RIM
             ================================================= */

          float verticalRim =
            pow(
              1.0 -
              abs(
                lightingNormal.y
              ),
              4.0
            );


          color +=
            vec3(
              0.22,
              0.10,
              0.30
            )
            *
            verticalRim
            *
            mix(
              0.55,
              0.25,
              inner
            );


          /* =================================================
             SUBTLE PULSE
             ================================================= */

          float pulse =
            0.97
            +
            sin(
              uTime *
              1.5
            )
            *
            0.03;


          color *=
            pulse;


          /* =================================================
             MINIMUM VALUE
             ================================================= */

          color =
            max(
              color,
              vec3(
                0.008,
                0.004,
                0.012
              )
            );


          /* =================================================
             OUTPUT
             ================================================= */

          gl_FragColor =
            vec4(
              color,
              1.0
            );

        }

      `,

    };

  }, []);


  /* =======================================================
     ANIMATION LOOP
     ======================================================= */

  useFrame(
    ({
      clock,
      pointer,
    }) => {

      if (
        !materialRef.current
      ) {
        return;
      }


      const time =
        clock.getElapsedTime();


      /* ---------------------------------------------------
         SMOOTH MOUSE
         --------------------------------------------------- */

      mouse.current.x +=
        (
          pointer.x -
          mouse.current.x
        )
        *
        0.08;


      mouse.current.y +=
        (
          pointer.y -
          mouse.current.y
        )
        *
        0.08;


      /* ---------------------------------------------------
         SMOOTH MORPH
         --------------------------------------------------- */

      morph.current +=
        (
          morphTarget.current -
          morph.current
        )
        *
        0.035;


      /* ---------------------------------------------------
         UPDATE SHADER
         --------------------------------------------------- */

      materialRef.current
        .uniforms
        .uTime
        .value =
        time;


      materialRef.current
        .uniforms
        .uMouse
        .value
        .copy(
          mouse.current
        );


      materialRef.current
        .uniforms
        .uMorph
        .value =
        morph.current;

    }
  );


  /* =======================================================
     CLICK TO MORPH
     ======================================================= */

  const handleClick = () => {

    morphTarget.current =
      morphTarget.current === 0
        ? 1
        : 0;

  };


  /* =======================================================
     MESH
     ======================================================= */

  return (

    <mesh
      geometry={geometry}
      onClick={handleClick}
    >

      <shaderMaterial

        ref={materialRef}

        uniforms={
          shader.uniforms
        }

        vertexShader={
          shader.vertexShader
        }

        fragmentShader={
          shader.fragmentShader
        }

        side={
          THREE.DoubleSide
        }

      />

    </mesh>

  );

}


/* =========================================================
   SCENE
   ========================================================= */

export default function Experimental() {

  return (
    <div className="experimental-stage">

      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [0, 4, 13],
          fov: 38,
        }}
      >

        <color
          attach="background"
          args={["#191919"]}
        />

        <AnimatedLathe />

        <OrbitControls
          target={[0, 4, 0]}
          enablePan
          enableZoom:false
          enableRotate
          minDistance={5}
          maxDistance={22}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI - 0.25}
        />
      </Canvas>

    </div>
  );

}
