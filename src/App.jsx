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
    ctx.font = "700 140px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    ctx.textBaseline = "middle";

    const phrase = "COMING SOON   ";
    let x = 0;
    const y = c.height / 2;
    const w = ctx.measureText(phrase).width;

    while (x < c.width + w) {
      ctx.fillText(phrase, x, y);
      x += w;
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1.15, 1);
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function Ring() {
  const mesh = useRef();
  const tex = useComingSoonTexture();

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.55;
    tex.offset.x -= delta * 0.18;
  });

  return (
    <mesh ref={mesh} position={[0, 0.05, 0]} rotation={[Math.PI / 2.05, 0, 0]}>
      <torusGeometry args={[1.65, 0.12, 32, 256]} />
      <meshStandardMaterial
        map={tex}
        transparent
        opacity={1}
        roughness={0.28}
        metalness={0.15}
        emissive={new THREE.Color("#ffffff")}
        emissiveIntensity={0.55}
      />
    </mesh>
  );
}

function Plush() {
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
          envMapIntensity: 1.25
        });
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.position.y = 0.02 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    group.current.rotation.y += delta * 0.22;
  });

  return (
    <group ref={group} position={[0, -0.15, 0]} scale={1.35}>
      <primitive object={scene} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
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
        <Plush />
        <Ring />
      </Suspense>

      <fog attach="fog" args={["#0b2233", 3.5, 10]} />
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
          camera={{ position: [0, 0.55, 4.2], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </div>

      <div className="bottomText">
        <div className="title">SHINYREPORT</div>
        <div className="links">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload("/assets/substitute.glb");
