import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/RGBELoader.js';

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
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 🔥 HDRI ENVIRONMENT
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

// LIGHTING SUAVE
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const key = new THREE.DirectionalLight(0xffffff, 2);
key.position.set(5, 10, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x88ccff, 2);
rim.position.set(-5, 5, -5);
scene.add(rim);

// LOAD MODEL
let mascot;
const loader = new GLTFLoader();

loader.load('./assets/pokemon_substitute_plushie.glb', (gltf) => {

  mascot = gltf.scene;

  const box = new THREE.Box3().setFromObject(mascot);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 4.8 / maxDim;
  mascot.scale.setScalar(scale);

  box.setFromObject(mascot);
  const center = new THREE.Vector3();
  box.getCenter(center);
  mascot.position.sub(center);

  mascot.position.y += 1.2;

  mascot.rotation.y = Math.PI + THREE.MathUtils.degToRad(225);

  // 🔥 MATERIAL CRISTAL REAL
  mascot.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: 0x99ddff,
        metalness: 0,
        roughness: 0.05,
        transmission: 1,
        thickness: 2,
        transparent: true,
        opacity: 1,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0,
        envMapIntensity: 1.5
      });
    }
  });

  scene.add(mascot);
});

// FLOAT
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (mascot) {
    mascot.position.y += Math.sin(clock.getElapsedTime() * 0.8) * 0.002;
  }

  renderer.render(scene, camera);
}

animate();