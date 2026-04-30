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

// ─── Parameters (the source of truth) ───────────────────────────
const params = {
  shaftDiameter: 0.2,
  shaftLength: 1,
  ballDiameter: 0.2,
  ballMaterial: 'ruby',
  shaftColor: '#ffffff',
  ballColor: '#ff0044',
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

  const geometry = new THREE.SphereGeometry(params.ballDiameter/2);
  const material = new THREE.MeshStandardMaterial({ color: params.ballColor, metalness: 0.6, roughness: 0.3, transparent:true, opacity: 0.8 });
  const tip = new THREE.Mesh(geometry, material);
  assembly.add(tip);
  const geometry2 = new THREE.CylinderGeometry(params.shaftDiameter/2, params.shaftDiameter/2, params.shaftLength);
  const material2 = new THREE.MeshStandardMaterial({ color: params.shaftColor, metalness: 0.8, roughness: 0.3 });
  geometry2.translate(0, 0.6, 0)
  const shank = new THREE.Mesh(geometry2, material2);
  assembly.add(shank);
  const geometry3 = new THREE.CylinderGeometry(0.13, params.shaftDiameter/2, 0.25);
  geometry3.translate(0, 1.2, 0)
  const fixture = new THREE.Mesh(geometry3, material2);
  assembly.add(fixture);
  const geometry4 = new THREE.CylinderGeometry(0.13, 0.13, 0.25);
  geometry4.translate(0, 1.425, 0)
  const fixtureTop = new THREE.Mesh(geometry4, material2);
  assembly.add(fixtureTop);

  scene.add(assembly);
}

rebuildAssembly();

// GUI — pass it the params and tell it what to do on change
createDimensionsMenu(params, rebuildAssembly);

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