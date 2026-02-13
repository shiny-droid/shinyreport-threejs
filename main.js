import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://esm.sh/three@0.160.0/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x061b2f);
scene.fog = new THREE.Fog(0x061b2f, 10, 40);

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 14);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// Postprocessing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.8,
  0.6,
  0.85
));

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Lights
scene.add(new THREE.AmbientLight(0x7dd3ff, 0.8));

const keyLight = new THREE.DirectionalLight(0x7dd3ff, 3);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 2);
rimLight.position.set(-5, 4, -5);
scene.add(rimLight);

// Reflective floor
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x0b2d4d,
  metalness: 0.8,
  roughness: 0.3
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3;
scene.add(floor);

// Load GLB
let mascot;
const loader = new GLTFLoader();

loader.load('./assets/pokemon_substitute_plushie.glb', (gltf) => {
  mascot = gltf.scene;

  // glass material override
  mascot.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0,
        roughness: 0,
        transmission: 1,
        thickness: 1.2,
        clearcoat: 1,
        clearcoatRoughness: 0
      });
    }
  });

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

  scene.add(mascot);
});

// Ring
const ringGroup = new THREE.Group();
scene.add(ringGroup);

const fontLoader = new FontLoader();
fontLoader.load(
  'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
  (font) => {

    const textGeo = new TextGeometry("COMING SOON • ", {
      font: font,
      size: 0.6,
      height: 0.08
    });

    const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const radius = 8;
    const count = 16;

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(textGeo, textMat);
      const angle = (i / count) * Math.PI * 2;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.lookAt(0, 0, 0);
      ringGroup.add(mesh);
    }

    ringGroup.rotation.x = Math.PI / 3;
  }
);

// Animation
const clock = new THREE.Clock();
const LOOP_DURATION = 5;

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();
  const progress = (t % LOOP_DURATION) / LOOP_DURATION;

  if (mascot) {
    mascot.position.y = Math.sin(progress * Math.PI * 2) * 0.5;
  }

  ringGroup.rotation.y = progress * Math.PI * 2;

  composer.render();
}

animate();