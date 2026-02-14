//////////////////////////////
// SCENE
//////////////////////////////

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth/window.innerHeight,
  0.1,
  100
);

camera.position.set(0,1.2,4);

const renderer = new THREE.WebGLRenderer({
  antialias:true,
  alpha:true
});

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.body.appendChild(renderer.domElement);

//////////////////////////////
// LIGHTS
//////////////////////////////

scene.add(new THREE.AmbientLight(0xffffff,1));

const keyLight = new THREE.DirectionalLight(0xffffff,2);
keyLight.position.set(5,5,5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x66ccff,3);
rimLight.position.set(-5,3,-5);
scene.add(rimLight);

//////////////////////////////
// LOAD MODEL
//////////////////////////////

const loader = new THREE.GLTFLoader();

loader.load(
  "substitute.glb",
  function(gltf){

    const model = gltf.scene;
    scene.add(model);

    // AUTO CENTER
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x,size.y,size.z);
    const scale = 2 / maxDim;
    model.scale.setScalar(scale);

    model.position.y = 0.8;
    model.rotation.y = Math.PI * 1.8;

    // CRYSTAL MATERIAL
    model.traverse(function(child){
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
          clearcoatRoughness:0,
          reflectivity:1
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

//////////////////////////////
// ANIMATE
//////////////////////////////

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}

animate();

//////////////////////////////
// RESPONSIVE
//////////////////////////////

window.addEventListener("resize",function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
