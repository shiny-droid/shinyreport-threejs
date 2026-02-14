<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ShinyReport</title>

<style>
body{
  margin:0;
  overflow:hidden;
  background:#000;
}
#bg{
  position:fixed;
  inset:0;
  background:url("background.png") center/cover no-repeat;
  filter:blur(15px) brightness(0.7);
  transform:scale(1.1);
  z-index:-1;
}
</style>
</head>
<body>

<div id="bg"></div>

<script type="module">

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth/window.innerHeight,
  0.1,
  100
);

camera.position.set(0,1.5,4);

const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

//////////////////////
// LUCES FUERTES
//////////////////////

scene.add(new THREE.AmbientLight(0xffffff,1));

const keyLight = new THREE.DirectionalLight(0xffffff,2);
keyLight.position.set(5,5,5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x66ccff,3);
rimLight.position.set(-5,3,-5);
scene.add(rimLight);

//////////////////////
// CARGA MODELO
//////////////////////

const loader = new GLTFLoader();

loader.load(
  "substitute.glb",   // ← asegúrate que el nombre es EXACTO
  function(gltf){

    const model = gltf.scene;
    scene.add(model);

    // Auto centrar
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x,size.y,size.z);
    const scale = 2 / maxDim;
    model.scale.setScalar(scale);

    model.position.y = 1;
    model.rotation.y = Math.PI * 1.8;

    // MATERIAL CRISTAL
    model.traverse((child)=>{
      if(child.isMesh){
        child.material = new THREE.MeshPhysicalMaterial({
          color:0x88ccff,
          metalness:0,
          roughness:0.05,
          transmission:1,
          thickness:1.5,
          transparent:true,
          opacity:1,
          ior:1.45,
          clearcoat:1,
          envMapIntensity:1.5
        });
      }
    });

    console.log("Modelo cargado correctamente");
  },
  undefined,
  function(error){
    console.error("Error cargando modelo:", error);
  }
);

//////////////////////
// ANIMACIÓN
//////////////////////

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();

//////////////////////
// RESPONSIVE
//////////////////////

window.addEventListener("resize",()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

</script>
</body>
</html>
