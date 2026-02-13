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
renderer.toneMappingExposure = 1.3;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// HDRI ENVIRONMENT
new RGBELoader().load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

// LIGHTING (orgánico y suave)

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x88ccff, 2);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0x99ddff, 4, 20);
fillLight.position.set(0, 4, 6);
scene.add(fillLight);

// LOAD MODEL
let mascot;
const loader = new GLTFLoader();

loader.load('./assets/pokemon_substitute_plushie.glb', (gltf) => {

  mascot = gltf.scene;

  // Auto scale (más pequeño)
  const box = new THREE.Box3().setFromObject(mascot);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 4.8 / maxDim;
  mascot.scale.setScalar(scale);

  // Center
  box.setFromObject(mascot);
  const center = new THREE.Vector3();
  box.getCenter(center);
  mascot.position.sub(center);

  // Más arriba
  mascot.position.y += 1.2;

  // Perfil izquierda
  mascot.rotation.y = Math.PI + THREE.MathUtils.degToRad(225);

  // MATERIAL ORGÁNICO
  mascot.traverse((child) => {
    if (child.isMesh) {

      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.65, 0.85, 1.0),
        metalness: 0,
        roughness: 0.25,
        transmission: 0.65,
        thickness: 4.0,
        transparent: true,
        opacity: 1,
        ior: 1.25,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        attenuationColor: new THREE.Color(0.6, 0.85, 1),
        attenuationDistance: 2.5,
        envMapIntensity: 1.2
      });

    }
  });

  scene.add(mascot);
});

// FLOAT ANIMATION
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (mascot) {
    mascot.position.y += Math.sin(clock.getElapsedTime() * 0.8) * 0.002;
  }

  renderer.render(scene, camera);
}

animate();