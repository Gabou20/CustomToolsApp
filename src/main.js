import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadOBJ } from './loaders/objLoader.js';
import GUI from 'lil-gui';
import './style.css';
import { createDimensionsMenu } from './menus/dimensionsMenu.js';
import { getBallMaterials, getMaterial } from './textures/ballMaterials.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 3, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.querySelector('#app').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 1;   // half-strength

new HDRLoader().load(
  '/hdri/monochrome_studio_02_4k.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  },
  undefined,
  (error) => {
    console.error('HDRI failed to load:', error);
  }
);

// Function to adjust camera to object
function frameObject(object, camera, controls, padding = 1.5) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  // Aim controls at the model's center
  controls.target.copy(center);

  // Position camera at a diagonal, scaled by model size
  const distance = size * padding;
  camera.position.set(
    center.x + distance,
    center.y + distance,
    center.z + distance
  );

  // Adjust near/far to comfortably contain the model
  camera.near = size / 100;
  camera.far = size * 100;
  camera.updateProjectionMatrix();

  controls.update();
}

function accumulateTranslationGeometry(geometry, currentOffset, offset) {
  // Translate the geometry
  geometry.translate(0, currentOffset, 0);

  // Accumulate translation offset
  return currentOffset + offset;
}

// ─── Parameters (the source of truth) ───────────────────────────

const params = {
  fixtureDiameter: 3,
  fixtureLength: 5,
  shaftDiameter: 2,
  shaftLength: 16,
  ballDiameter: 3,
  ballMaterial: 'Ruby',
};

// Assembly + rebuild logic
let assembly = new THREE.Group();
scene.add(assembly);

function rebuildAssembly() {
console.log('rebuilding with params:', { ...params });

  // Dispose old geometry/materials to avoid memory leaks
    while (assembly.children.length > 0) {
    const child = assembly.children[0];
    assembly.remove(child);
    if (child.isMesh) {
      child.geometry.dispose();
      // Material can be a single material or an array
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }

  var offset = 0;

  // Tip
  const geometry = new THREE.SphereGeometry(params.ballDiameter/2);
  offset = accumulateTranslationGeometry( geometry, offset, params.ballDiameter/2);
  const tip = new THREE.Mesh(geometry, getMaterial(params.ballMaterial));
  assembly.add(tip);

  // Shaft
  const geometry2 = new THREE.CylinderGeometry(params.shaftDiameter/2, params.shaftDiameter/2, params.shaftLength);
  offset = accumulateTranslationGeometry(geometry2, offset + params.shaftLength/2 - params.ballDiameter/2, params.shaftLength/2);
  const shaft = new THREE.Mesh(geometry2, getMaterial("Steel"));
  assembly.add(shaft);

  // Fixture
  const geometry3 = new THREE.CylinderGeometry(params.fixtureDiameter/2, params.shaftDiameter/2, params.fixtureLength/2);
  offset = accumulateTranslationGeometry(geometry3, offset + params.fixtureLength/4, params.fixtureLength/2);
  const fixture = new THREE.Mesh(geometry3, getMaterial("Steel"));
  assembly.add(fixture);

  // Fixture top
  const geometry4 = new THREE.CylinderGeometry(params.fixtureDiameter/2, params.fixtureDiameter/2, params.fixtureLength/2);
  offset = accumulateTranslationGeometry(geometry4, offset, params.fixtureLength/2);
  const fixtureTop = new THREE.Mesh(geometry4, getMaterial("Steel"));
  assembly.add(fixtureTop);

  scene.add(assembly);
}

// GUI — pass it the params and tell it what to do on change
createDimensionsMenu(params, rebuildAssembly);

// Orbit controls — drag to rotate, scroll to zoom, right-click to pano
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

rebuildAssembly();
frameObject(assembly, camera, controls);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();