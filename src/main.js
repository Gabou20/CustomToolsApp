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
//const geometry = new THREE.BoxGeometry(1, 1, 1);
//const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
//const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);
const geometry = new THREE.SphereGeometry(0.2);
const material = new THREE.MeshStandardMaterial({ color: 0xff0044, metalness: 0.6, roughness: 0.3, transparent:true, opacity: 0.8 });
const tip = new THREE.Mesh(geometry, material);
scene.add(tip);
const geometry2 = new THREE.CylinderGeometry(0.1, 0.1, 1);
const material2 = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.3 });
geometry2.translate(0, 0.6, 0)
const shank = new THREE.Mesh(geometry2, material2);
scene.add(shank);
const geometry3 = new THREE.CylinderGeometry(0.13, 0.1, 0.25);
geometry3.translate(0, 1.2, 0)
const fixture = new THREE.Mesh(geometry3, material2);
scene.add(fixture);
const geometry4 = new THREE.CylinderGeometry(0.13, 0.13, 0.25);
geometry4.translate(0, 1.425, 0)
const fixtureTop = new THREE.Mesh(geometry4, material2);
scene.add(fixtureTop);

// Grid helper to give a sense of space
//const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
//scene.add(grid);

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