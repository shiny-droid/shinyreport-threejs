import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x061628);
scene.fog = new THREE.Fog(0x061628, 15, 40);

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

// POSTPROCESSING
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.8, // strength
  0.5, // radius
  0.85 // threshold
);
composer.addPass(bloom);

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// HDRI
new RGBELoader().load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

// LIGHTING
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x66ccff, 3);
rimLight.position.set(-5, 5, -6);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0x88ddff, 6, 20);
fillLight.position.set(0, 4, 6);
scene.add(fillLight);

// FLOOR
const floorGeo = new THREE.CircleGeometry(12, 64);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x0a223a,
  metalness: 0.8,
  roughness: 0.3
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// PARTICLES
const particlesGeo = new THREE.BufferGeometry();
const particleCount = 200;
const positions = [];

for (let i = 0; i < particleCount; i++) {
  positions.push(
    (Math.random() - 0.5) * 30,
    Math.random() * 10,
    (Math.random() - 0.5) * 30
  );
}

particlesGeo.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(positions, 3)
);

const particlesMat = new THREE.PointsMaterial({
  color: 0x66ccff,
  size: 0.05,
  transparent: true,
  opacity: 0.6
});

const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// MODEL
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

  mascot.traverse((child) => {
    if (child.isMesh) {

      const name = child.name.toLowerCase();

      if (name.includes("eye")) {

        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x000000,
          metalness: 1,
          roughness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0,
          envMapIntensity: 2
        });

      } else {

        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0.6, 0.85, 1),
          metalness: 0,
          roughness: 0.2,
          transmission: 0.7,
          thickness: 4,
          transparent: true,
          opacity: 1,
          ior: 1.25,
          clearcoat: 0.4,
          clearcoatRoughness: 0.3,
          attenuationColor: new THREE.Color(0.6, 0.85, 1),
          attenuationDistance: 2,
          envMapIntensity: 1.5
        });

      }
    }
  });

  scene.add(mascot);
});

// ANIMATION
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (mascot) {
    mascot.position.y = 1.2 + Math.sin(t * 0.8) * 0.25;
  }

  particles.rotation.y += 0.0005;

  composer.render();
}

animate();