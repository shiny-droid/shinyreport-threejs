const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);



// BACKGROUND
const textureLoader = new THREE.TextureLoader();
textureLoader.load("assets/background.png", (texture) => {
  scene.background = texture;
});



// LIGHTS
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const light1 = new THREE.PointLight(0x88ccff, 3, 20);
light1.position.set(5, 5, 5);
scene.add(light1);

const light2 = new THREE.PointLight(0x00ffff, 2, 20);
light2.position.set(-5, 3, 5);
scene.add(light2);



// LOAD MODEL
const loader = new THREE.GLTFLoader();

loader.load("assets/substitute.glb", (gltf) => {
  const model = gltf.scene;

  model.scale.set(1.2, 1.2, 1.2);
  model.position.set(0, 0.8, 0);
  model.rotation.y = -Math.PI * 0.75;

  model.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: 0x88ffff,
        metalness: 0,
        roughness: 0,
        transmission: 1,
        thickness: 1.5,
        transparent: true,
        opacity: 0.5,
        ior: 1.4,
        clearcoat: 1,
        clearcoatRoughness: 0,
        emissive: 0x66ffff,
        emissiveIntensity: 0.4
      });
    }
  });

  scene.add(model);
});



// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



// ANIMATION
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
