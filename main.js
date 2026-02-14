<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ShinyReport</title>

<style>
  body {
    margin: 0;
    overflow: hidden;
    background: #000;
  }

  #bg {
    position: fixed;
    inset: 0;
    background: url("background.png") center/cover no-repeat;
    filter: blur(20px) brightness(0.7);
    transform: scale(1.1);
    z-index: -1;
  }
</style>
</head>

<body>
<div id="bg"></div>

<script type="module">

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 5);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

//////////////////////////////
// HDRI para cristal real
//////////////////////////////

new RGBELoader()
.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
function(texture){
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

//////////////////////////////
// LUCES
//////////////////////////////

const light1 = new THREE.DirectionalLight(0xffffff, 2);
light1.position.set(5,5,5);
scene.add(light1);

const rim = new THREE.DirectionalLight(0x66ccff, 3);
rim.position.set(-5,3,-5);
scene.add(rim);

scene.add(new THREE.AmbientLight(0xffffff,0.4));

//////////////////////////////
// CARGA MODELO
//////////////////////////////

const loader = new GLTFLoader();

loader.load("substitute.glb", (gltf)=>{

  const model = gltf.scene;
  scene.add(model);

  model.scale.set(2.2,2.2,2.2);
  model.position.y = 0.8;
  model.rotation.y = Math.PI * 1.75; // mira hacia izquierda

  model.traverse((child)=>{
    if(child.isMesh){

      child.material = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0,
        roughness: 0,
        transmission: 1,
        thickness: 2,
        transparent: true,
        opacity: 1,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0,
        reflectivity: 1,
        envMapIntensity: 2
      });

      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

});

//////////////////////////////
// ANIMACIÓN SUAVE
//////////////////////////////

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();

//////////////////////////////
// RESPONSIVE
//////////////////////////////

window.addEventListener("resize",()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

</script>
</body>
</html>
