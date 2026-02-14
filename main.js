import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

////////////////////////
// LUCES FUERTES DEBUG
////////////////////////

scene.add(new THREE.AmbientLight(0xffffff, 3));

const light1 = new THREE.DirectionalLight(0xffffff, 5);
light1.position.set(5, 5, 5);
scene.add(light1);

////////////////////////
// GRID PARA VER CENTRO
////////////////////////

const grid = new THREE.GridHelper(10, 10);
scene.add(grid);

////////////////////////
// LOAD MODEL
////////////////////////

const loader = new GLTFLoader();

loader.load(
  "assets/substitute.glb",
  (gltf) => {

    console.log("MODELO CARGADO");

    const model = gltf.scene;
    scene.add(model);

    // ESCALA SIMPLE
    model.scale.set(1,1,1);

    model.position.set(0,0,0);

    // MATERIAL BÁSICO DEBUG (SIN CRISTAL)
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x00ff00
        });
      }
    });

  },
  undefined,
  (error) => {
    console.error("ERROR CARGANDO:", error);
  }
);

////////////////////////
// ANIMATE
////////////////////////

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

////////////////////////
// RESIZE
////////////////////////

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
