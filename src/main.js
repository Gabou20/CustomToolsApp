import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadOBJ } from './loaders/objLoader.js';
import GUI from 'lil-gui';
import './style.css';
import { createDimensionsMenu } from './menus/dimensionsMenu.js';

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

// A test cube so we know things are working
// ─── Parameters (the source of truth) ───────────────────────────
const params = {
  shaftDiameter: 2.0,
  shaftLength: 3.0,
  ballDiameter: 2.0,
  ballMaterial: 'ruby',
  shaftColor: '#888888',
  ballColor: '#aa5533',
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

  const geometry = new THREE.BoxGeometry(params.ballDiameter, params.ballDiameter, params.ballDiameter);
  const material = new THREE.MeshStandardMaterial({ color: params.ballColor });
  const cube = new THREE.Mesh(geometry, material);

  assembly.add(cube);
  scene.add(assembly);
}

rebuildAssembly();

// GUI — pass it the params and tell it what to do on change
createDimensionsMenu(params, rebuildAssembly);

// Grid helper to give a sense of space
const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
scene.add(grid);

// Orbit controls — drag to rotate, scroll to zoom, right-click to pano
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

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