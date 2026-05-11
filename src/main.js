import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadOBJ } from './loaders/objLoader.js';
import GUI from 'lil-gui';
import './style.css';
import { createDimensionsMenu } from './menus/dimensionsMenu.js';
import { ballMaterials, shaftMaterials, getBallMaterial, getShaftMaterial } from './textures/materials.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { CSG } from 'three-csg-ts';
import { addDimensionsToGroup, createDimension } from './technicalDrawing.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { addExportMenu } from './menus/exportButton.js';

// Set up: dimensions go on layer 1, default geometry stays on layer 0
const DIMENSION_LAYER = 1;

// Scene
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x1a1a1a);
scene.background = null;
//scene.fog = new THREE.Fog('#ffff', 20, 100);

// camera3D
const aspect = window.innerWidth / window.innerHeight;
const zoom = 15;
const camera3D = new THREE.OrthographicCamera(
  -aspect * zoom,
  aspect * zoom,
  zoom,
  -zoom,
  0.1,
  1000
);
camera3D.layers.set(0);
//camera3D.layers.enable(DIMENSION_LAYER);
camera3D.position.set(3, 3, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
document.querySelector('#app').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 1.0;

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

//-------------------------------------------------------------------
// Apply geometry translation and accumulate offset
//
// Parameter geometry      : The geometry to translate
// Parameter currentOffset : the current offset
// Parameter material      : the geometry offset to accumulate
//
// Return : The accumulated offset
//===================================================================
function accumulateTranslationGeometry(geometry, currentOffset, offset) {
  // Translate the geometry
  geometry.translate(0, currentOffset, 0);

  // Accumulate translation offset
  return currentOffset + offset;
}

//-------------------------------------------------------------------
// Get the screw assembly relative to the current offset
//
// Parameter size          : Connector size
// Parameter currentOffset : the current offset
// Parameter material      : the screw material
//
// Return : The screw assembly
//===================================================================
function getScrewAssembly(size, currentOffset, material) {
  const m3PinDiameter = 1.7 * size/3;
  const m3PinLength = 0.8 * size/3;
  const m3ScrewDiameter = 2 * size/3;
  const m3ScrewLength = 1.4 * size/3;
  
  let assembly = new THREE.Group();
  var offset = currentOffset

  // Pin
  const geometry = new THREE.CylinderGeometry(m3PinDiameter/2, m3PinDiameter/2, m3PinLength);
  offset = accumulateTranslationGeometry( geometry, offset, m3PinLength/2);
  assembly.add(new THREE.Mesh(geometry, material));

  // Bottom screw
  const bevelLength = m3ScrewDiameter - m3PinDiameter;
  const bottomGeometry = new THREE.CylinderGeometry(m3ScrewDiameter/2, m3PinDiameter/2, bevelLength/2);
  offset = accumulateTranslationGeometry( bottomGeometry, offset + bevelLength/4, bevelLength/4);
  assembly.add(new THREE.Mesh(bottomGeometry, material));

  // Screw
  const screwLength = m3ScrewLength - 2 * bevelLength;
  const screwGeometry = new THREE.CylinderGeometry(m3ScrewDiameter/2, m3ScrewDiameter/2, screwLength);
  offset = accumulateTranslationGeometry( screwGeometry, offset + screwLength/2, screwLength/2);
  assembly.add(new THREE.Mesh(screwGeometry, material));

  // Top screw
  const topGeometry = new THREE.CylinderGeometry(m3PinDiameter/2, m3ScrewDiameter/2, bevelLength/2);
  offset = accumulateTranslationGeometry( topGeometry, offset + bevelLength/4, bevelLength/4);
  assembly.add(new THREE.Mesh(topGeometry, material));

  return assembly;
}

// ─── Parameters (the source of truth) ───────────────────────────

const params = {
  connectorType: 'M3',
  fixtureDiameter: 3,
  fixtureLength: 5,
  shaftMaterial: 'Steel',
  shaftDiameter: 2,
  shaftLength: 16,
  endType: 'Ball',
  ballMaterial: 'Ruby',
  ballDiameter: 3,
  diskThickness: 0.5
};

// Assembly + rebuild logic
let assembly = new THREE.Group();
scene.add(assembly);

let dimensions = new THREE.Group();
scene.add(dimensions);

function disposeAllElementsInGroup(group)
{
  while (group.children.length > 0) {
  const child = group.children[0];
  group.remove(child);
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
}

function rebuildAssembly() {
console.log('rebuilding with params:', { ...params });

  if (params.connectorType == 'M5') {
    params.fixtureDiameter = 5;
  }
  else if (params.connectorType == 'M4') {
    params.fixtureDiameter = 4;
  }
  else if (params.connectorType == 'M2') {
    params.fixtureDiameter = 2;
  }
  else {
    params.fixtureDiameter = 3;
  }

  // Dispose old geometry/materials to avoid memory leaks
  disposeAllElementsInGroup(assembly);
  disposeAllElementsInGroup(dimensions);

  var offset = 0;
  const shankLength = params.shaftLength - params.fixtureLength;
  const fixtureCylinderLength = 3;
  const fixtureConeLength = params.fixtureLength - fixtureCylinderLength;

  // Tip
  var geometry;
  if ( params.endType == 'Disk' ) {
    geometry = new THREE.CylinderGeometry(params.ballDiameter/2, params.ballDiameter/2, params.diskThickness);
  }
  else {
    geometry = new THREE.SphereGeometry(params.ballDiameter/2);
  }
  offset = accumulateTranslationGeometry( geometry, offset, params.ballDiameter/2);
  const tip = new THREE.Mesh(geometry, getBallMaterial(params.ballMaterial));
  assembly.add(tip);

  // Shaft
  const geometry2 = new THREE.CylinderGeometry(params.shaftDiameter/2, params.shaftDiameter/2, shankLength);
  offset = accumulateTranslationGeometry(geometry2, offset + shankLength/2 - params.ballDiameter/2, shankLength/2);
  const shaft = new THREE.Mesh(geometry2, getShaftMaterial(params.shaftMaterial));
  assembly.add(shaft);

  // Fixture cone
  const geometry3 = new THREE.CylinderGeometry(params.fixtureDiameter/2, params.shaftDiameter/2, fixtureConeLength);
  offset = accumulateTranslationGeometry(geometry3, offset + fixtureConeLength/2, fixtureConeLength/2);
  const fixture = new THREE.Mesh(geometry3, getShaftMaterial("Steel"));

  // Fixture cylinder
  const geometry4 = new THREE.CylinderGeometry(params.fixtureDiameter/2, params.fixtureDiameter/2, fixtureCylinderLength);
  offset = accumulateTranslationGeometry(geometry4, offset + fixtureCylinderLength/2, fixtureCylinderLength/2);
  const fixtureTop = new THREE.Mesh(geometry4, getShaftMaterial("Steel"));
  
  const holeGeometry = new THREE.CylinderGeometry(0.5, 0.5, params.fixtureDiameter*2);
  holeGeometry.rotateX(Math.PI / 2);
  accumulateTranslationGeometry(holeGeometry, offset - fixtureCylinderLength/2, 0);
  const hole = new THREE.Mesh(holeGeometry, new THREE.MeshStandardMaterial());

    // Complete fixture
  const completeFixtureAddition = CSG.union(fixture, fixtureTop);
  const completeFixture = CSG.subtract(completeFixtureAddition, hole);

  assembly.add(completeFixture);

  // Add screw
  assembly.add(getScrewAssembly(params.fixtureDiameter, offset, getShaftMaterial("Steel") ));

  scene.add(assembly);

  // Add dimension annotations
  addDimensionsToGroup(dimensions, shaft, completeFixture, tip, DIMENSION_LAYER)

  dimensions.layers.set(DIMENSION_LAYER);
  scene.add(dimensions);
}

// GUI — pass it the params and tell it what to do on change
let gui = createDimensionsMenu(params, rebuildAssembly);
addExportMenu(gui, params);

// Orbit controls — drag to rotate, scroll to zoom, right-click to pano
const controls = new OrbitControls(camera3D, renderer.domElement);
controls.enableDamping = true;

// Allow full vertical orbit
controls.minPolarAngle = -Infinity;
controls.maxPolarAngle = Infinity;

rebuildAssembly();
frameObject(assembly, camera3D, controls, 0.8);

// Handle window resize
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  const zoom = 15;
  camera3D.left   = -aspect * zoom;
  camera3D.right  =  aspect * zoom;
  camera3D.top    =  zoom;
  camera3D.bottom = -zoom;
  camera3D.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
// function animate() {
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera3D);
// }

// New orthographic camera for the technical drawing
const camera2D = new THREE.OrthographicCamera(-50, 50, 80, -80, 0.1, 1000);
camera2D.position.set(0, 0, 200);   // looking down +Z axis
camera2D.lookAt(0, 0, 0);
// 2D camera sees both layers
camera2D.layers.enable(0);
camera2D.layers.enable(DIMENSION_LAYER);

renderer.autoClear = false;   // set this ONCE, outside animate (e.g. right after creating the renderer)

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  const w = window.innerWidth;
  const h = window.innerHeight;

  // ─── Main: 3D view full-screen ───
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, w, h);
  camera3D.updateProjectionMatrix();
  renderer.clear();                       // clear the whole canvas
  renderer.render(scene, camera3D);

  // ─── Inset: small 2D drawing in the top-right corner ───
  const insetWidth = 350;
  const insetHeight = h;
  // Bottom-right
  const insetX = w - insetWidth - 20;
  const insetY = (h-250)/2 - insetHeight/2;
    // Bottom-left
  //const insetX = 20;
  //const insetY = 0;

  renderer.setViewport(insetX, insetY, insetWidth, insetHeight);
  renderer.setScissor(insetX, insetY, insetWidth, insetHeight);
  renderer.setScissorTest(true);

  renderer.setClearColor(0x1a1a1a, 0);   // dark gray
  renderer.clear();                      // clears scissor region only (color + depth)

  const aspect2D = insetWidth / insetHeight;
  const viewSize = 30;
  camera2D.left = -viewSize * aspect2D;
  camera2D.right = viewSize * aspect2D;
  camera2D.top = viewSize;
  camera2D.bottom = -viewSize;

  const partBox = new THREE.Box3().setFromObject(assembly);
  const partCenter = partBox.getCenter(new THREE.Vector3());
  camera2D.position.x = partCenter.x;
  camera2D.position.y = partCenter.y - 3;

  camera2D.updateProjectionMatrix();

  renderer.clearDepth();                  // clear depth so inset draws on top
  renderer.render(scene, camera2D);
  renderer.setClearColor(0x000000, 0);   // reset for next frame
}

animate();