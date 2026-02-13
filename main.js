import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://esm.sh/three@0.160.0/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071a2c);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 14);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// POSTPROCESSING
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.4,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloom);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// 🔥 ILUMINACIÓN CINEMÁTICA

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x88ccff, 3);
rimLight.position.set(-5, 4, -6);
scene.add(rimLight);

const pointGlow = new THREE.PointLight(0x66ccff, 8, 15);
pointGlow.position.set(0, 2, 0);
scene.add(pointGlow);

// MODEL
let mascot;
const loader = new GLTFLoader();

loader.load('./assets/pokemon_substitute_plushie.glb', (gltf) => {

  mascot = gltf.scene;

  const box = new THREE.Box3().setFromObject(mascot);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 6 / maxDim;
  mascot.scale.setScalar(scale);

  box.setFromObject(mascot);
  const center = new THREE.Vector3();
  box.getCenter(center);
  mascot.position.sub(center);

  mascot.rotation.y = Math.PI + THREE.MathUtils.degToRad(135);

  // 🔥 MATERIAL CRISTAL
  mascot.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: 0x99ddff,
        metalness: 0,
        roughness: 0.05,
        transmission: 1,
        thickness: 1.5,
        transparent: true,
        opacity: 0.9,
        clearcoat: 1,
        clearcoatRoughness: 0,
        ior: 1.5,
      });
    }
  });

  scene.add(mascot);
});

// ANIMACIÓN
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (mascot) {
    mascot.position.y = Math.sin(t * 0.8) * 0.25;
  }

  composer.render();
}

animate();