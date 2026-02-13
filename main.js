import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1e34);

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
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// LIGHTING (correcto y equilibrado)

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const key = new THREE.DirectionalLight(0xffffff, 1.5);
key.position.set(5, 10, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x88ccff, 1.2);
rim.position.set(-5, 5, -5);
scene.add(rim);

// LOAD MODEL
let mascot;
const loader = new GLTFLoader();

loader.load('./assets/pokemon_substitute_plushie.glb', (gltf) => {

  mascot = gltf.scene;

  // scale automático
  const box = new THREE.Box3().setFromObject(mascot);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 6 / maxDim;
  mascot.scale.setScalar(scale);

  // centrar
  box.setFromObject(mascot);
  const center = new THREE.Vector3();
  box.getCenter(center);
  mascot.position.sub(center);

  // rotación perfil izquierda
  mascot.rotation.y = Math.PI + THREE.MathUtils.degToRad(180);

  scene.add(mascot);
});

// ANIMATE
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (mascot) {
    mascot.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.25;
  }

  renderer.render(scene, camera);
}

animate();