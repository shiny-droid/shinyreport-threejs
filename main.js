import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04101c);
scene.fog = new THREE.Fog(0x04101c, 15, 40);

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
renderer.toneMappingExposure = 1.8;
document.body.appendChild(renderer.domElement);

// POST PROCESSING
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.6,
  0.6,
  0.6
);
composer.addPass(bloom);

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// LIGHTING
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

const rimLight = new THREE.DirectionalLight(0x00ccff, 3);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

// PARTICLES
const particlesGeo = new THREE.BufferGeometry();
const particleCount = 250;
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
  color: 0x00ccff,
  size: 0.05,
  transparent: true,
  opacity: 0.6
});

const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// LOAD MODEL
let mascot;
const loader = new GLTFLoader();

loader.load('./assets/pokemon_substitute_plushie.glb', (gltf) => {

  mascot = gltf.scene;

  // SCALE
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

        child.material = new THREE.MeshBasicMaterial({
          color: 0xffffff
        });

      } else {

        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0.2, 0.8, 1.0),
          metalness: 0,
          roughness: 0,
          transmission: 0,
          transparent: true,
          opacity: 0.35,
          emissive: new THREE.Color(0.2, 0.9, 1.0),
          emissiveIntensity: 2.0,
          clearcoat: 0
        });

      }
    }
  });

  scene.add(mascot);

  // HALO
  const haloGeo = new THREE.RingGeometry(3.5, 4.5, 64);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x00ccff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });

  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 1.2;
  scene.add(halo);

  mascot.userData.halo = halo;
});

// ANIMATION
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (mascot) {
    mascot.position.y = 1.2 + Math.sin(t * 1.2) * 0.25;
    mascot.userData.halo.rotation.z += 0.01;
  }

  particles.rotation.y += 0.0005;

  composer.render();
}

animate();
