import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1e34);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Postprocessing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(
  new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,
    0.6,
    0.85
  )
);

// Responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Lights
scene.add(new THREE.AmbientLight(0x7dd3ff, 0.6));

const keyLight = new THREE.DirectionalLight(0x7dd3ff, 2);
keyLight.position.set(2, 4, 3);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
rimLight.position.set(-3, 2, -3);
scene.add(rimLight);

// Load GLB
let mascot;
const loader = new GLTFLoader();
loader.load('./assets/pokemon_substitute_plushie.glb', (gltf) => {
  mascot = gltf.scene;
  mascot.scale.set(1.5, 1.5, 1.5);
  scene.add(mascot);
});

// Ring group
const ringGroup = new THREE.Group();
scene.add(ringGroup);

// Load font and create ring text
const fontLoader = new FontLoader();
fontLoader.load(
  'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json',
  (font) => {
    const textGeo = new TextGeometry("COMING SOON • ", {
      font: font,
      size: 0.25,
      height: 0.02,
    });

    const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const radius = 2;
    const count = 24;

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(textGeo, textMat);
      const angle = (i / count) * Math.PI * 2;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.lookAt(0, 0, 0);
      ringGroup.add(mesh);
    }

    ringGroup.rotation.x = Math.PI / 2.8;
  }
);

// Perfect 5s loop
const clock = new THREE.Clock();
const LOOP_DURATION = 5;

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();
  const progress = (t % LOOP_DURATION) / LOOP_DURATION;

  if (mascot) {
    mascot.position.y = Math.sin(progress * Math.PI * 2) * 0.15;
  }

  ringGroup.rotation.y = progress * Math.PI * 2;

  composer.render();
}

animate();