let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 1.5, 4);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Background
new THREE.TextureLoader().load(
  './assets/background.png',
  function(texture) {
    texture.encoding = THREE.sRGBEncoding;
    scene.background = texture;
  }
);

// Luces
let ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

let light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 5);
scene.add(light);

// Loader
let loader = new THREE.GLTFLoader();

loader.load(
  './assets/substitute.glb',
  function(gltf) {

    let model = gltf.scene;

    model.scale.set(1.2, 1.2, 1.2);
    model.position.y = 0.5;
    model.rotation.y = -Math.PI / 2;

    scene.add(model);

    animate();
  },
  undefined,
  function(error) {
    console.error(error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Responsive
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
