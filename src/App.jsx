import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, Html, Center } from "@react-three/drei";

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

function WaistRing({ waistY = 0.2 }) {
  const mesh = useRef();
  const tex = useComingSoonTexture();

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.9; // gira alrededor de la cintura
    tex.offset.x -= delta * 0.25; // corre el texto
  });

  return (
    <mesh
      ref={mesh}
      position={[0, waistY, 0]}
      // CLAVE: el toro debe estar en XZ (hueco en Y) => aro alrededor de la cintura
      rotation={[Math.PI / 2, 0, 0]}
    >
      {/* más pequeño y controlado */}
      <torusGeometry args={[0.55, 0.06, 32, 256]} />
      <meshStandardMaterial
        map={tex}
        transparent
        opacity={1}
        roughness={0.22}
        metalness={0.1}
        emissive={new THREE.Color("#ffffff")}
        emissiveIntensity={0.75}
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

        // Cristal MÁS visible (evita que se vea negro)
        obj.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#e6f6ff"),
          roughness: 0.08,
          metalness: 0.0,
          transmission: 1.0,
          thickness: 0.7,
          ior: 1.35,
          transparent: true,
          opacity: 0.98,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
          envMapIntensity: 1.8,
          emissive: new THREE.Color("#bfe9ff"),
          emissiveIntensity: 0.08
        });
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = -0.15 + Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
    group.current.rotation.y = state.clock.elapsedTime * 0.18;
  });

  return (
    <group ref={group}>
      {/* Center centra el GLB y evita piezas “fuera” */}
      <Center>
        {/* Ajusta scale si lo quieres más grande/pequeño */}
        <primitive object={scene} scale={0.9} />
        <WaistRing waistY={0.18} />
      </Center>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 2]} intensity={1.4} />
      <pointLight position={[-3, 1.5, 2]} intensity={1.1} />
      <pointLight position={[0, -2.5, 3]} intensity={1.0} />

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

      <fog attach="fog" args={["#0b2233", 4.0, 14]} />
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
          camera={{ position: [0, 0.35, 5.0], fov: 34 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.15;
          }}
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
