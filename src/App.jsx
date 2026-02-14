import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, Html } from "@react-three/drei";

function useComingSoonTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 256;
    const ctx = c.getContext("2d");

    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font =
      "700 140px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    ctx.textBaseline = "middle";

    const phrase = "COMING SOON   ";
    const y = c.height / 2;
    const w = ctx.measureText(phrase).width;

    for (let x = 0; x < c.width + w; x += w) ctx.fillText(phrase, x, y);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1.2, 1);
    tex.anisotropy = 8;
    return tex;
  }, []);
}

function WaistRing({ waistY = 0.25 }) {
  const mesh = useRef();
  const tex = useComingSoonTexture();

  useFrame((_, delta) => {
    if (!mesh.current) return;
    // gira alrededor de la cintura (eje Y local del muñeco)
    mesh.current.rotation.y += delta * 0.9;
    // “scroll” del texto
    tex.offset.x -= delta * 0.25;
  });

  return (
    <mesh
      ref={mesh}
      // cintura (ajusta waistY si queda alto/bajo)
      position={[0, waistY, 0]}
      // un pelín inclinado como en la referencia
      rotation={[0.12, 0, 0]}
    >
      {/* MÁS PEQUEÑO */}
      <torusGeometry args={[0.55, 0.06, 32, 256]} />
      <meshStandardMaterial
        map={tex}
        transparent
        opacity={1}
        roughness={0.25}
        metalness={0.1}
        emissive={new THREE.Color("#ffffff")}
        emissiveIntensity={0.65}
      />
    </mesh>
  );
}

function PlushWithRing() {
  const { scene } = useGLTF("/assets/substitute.glb");
  const group = useRef();

  useMemo(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;

        obj.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#d7f0ff"),
          roughness: 0.12,
          metalness: 0.0,
          transmission: 1.0,
          thickness: 0.9,
          ior: 1.35,
          transparent: true,
          opacity: 0.98,
          clearcoat: 1,
          clearcoatRoughness: 0.18,
          envMapIntensity: 1.25,
        });
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;
    // flotación suave
    group.current.position.y = -0.25 + Math.sin(state.clock.elapsedTime * 1.2) * 0.035;
    // rotación lenta del muñeco (el aro gira aparte)
    group.current.rotation.y = state.clock.elapsedTime * 0.18;
  });

  return (
    <group ref={group} position={[0, 0, 0]} scale={1.0}>
      {/* El GLB */}
      <primitive object={scene} />
      {/* El aro ES HIJO del muñeco */}
      <WaistRing waistY={0.18} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.35} />
      <pointLight position={[-3, 1.5, 2]} intensity={1.2} />
      <pointLight position={[0, -2.5, 3]} intensity={0.9} />

      <Suspense
        fallback={
          <Html center style={{ color: "white", opacity: 0.8, fontWeight: 600 }}>
            Loading…
          </Html>
        }
      >
        <Environment preset="city" />
        <PlushWithRing />
      </Suspense>

      <fog attach="fog" args={["#0b2233", 4.0, 12]} />
    </>
  );
}

export default function App() {
  return (
    <div className="page">
      <div className="bg" />
      <div className="bgOverlay" />

      <div className="canvasWrap">
        <Canvas
          dpr={[1, 2]}
          // Cámara más centrada y más lejos (para que no se corte)
          camera={{ position: [0, 0.35, 5.2], fov: 34 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </div>

      <div className="bottomText">
        <div className="title">SHINYREPORT</div>
        <div className="links">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer">
            TikTok
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">
            YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload("/assets/substitute.glb");
