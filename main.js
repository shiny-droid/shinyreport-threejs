import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://esm.sh/three@0.160.0/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1e34);

// Camera
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 14);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1));

const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x88ccff, 2);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

let mascot;
let orbitGroup = new THREE.Group();
scene.add(orbitGroup);

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

  // 🔥 Rotación total: +45° más
  mascot.rotation.y = Math.PI + THREE.MathUtils.degToRad(90);

  scene.add(mascot);

  createCurvedRing();
});

function createCurvedRing() {

  const fontLoader = new FontLoader();

  fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    (font) => {

      const text = "COMING SOON";
      const letters = text.split("");

      const radius = 5.5;
      const totalAngle = Math.PI; // arco más compacto
      const startAngle = -totalAngle / 2;

      letters.forEach((letter, i) => {

        const geo = new TextGeometry(letter, {
          font: font,
          size: 0.6,
          height: 0.05,
        });

        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geo, mat);

        // 🔥 menos espacio entre letras
        const angle = startAngle + (i / (letters.length - 1)) * totalAngle;

        mesh.position.x = Math.sin(angle) * radius;
        mesh.position.z = Math.cos(angle) * radius;

        mesh.rotation.y = angle;

        // 🔥 altura brazos
        mesh.position.y = 1.1;

        orbitGroup.add(mesh);
      });
    }
  );
}

// Animation
const clock = new THREE.Clock();
const LOOP_DURATION = 10; // 🔥 más lento (10 segundos)

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();
  const progress = (t % LOOP_DURATION) / LOOP_DURATION;

  if (mascot) {
    mascot.position.y = Math.sin(progress * Math.PI * 2) * 0.25;
  }

  orbitGroup.rotation.y = progress * Math.PI * 2;

  renderer.render(scene, camera);
}

animate();