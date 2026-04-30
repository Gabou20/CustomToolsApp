import GUI from 'lil-gui';
import { ballMaterials, shaftMaterials } from '../textures/materials.js';

// Constants
const step = 0.05;
const minDiameter = step;
const maxDiameter = 10.0;
const minLenght = step;
const maxLenght = 50.0;

/**
 * Build the part configurator GUI.
 *
 * @param {object} params - The shared params object the GUI will mutate.
 * @param {() => void} onChange - Called whenever any control changes.
 * @returns {GUI} The lil-gui instance, in case the caller wants to extend it.
 */
export function createDimensionsMenu(params, onChange) {
  const gui = new GUI({ title: 'Part Configurator', width: 300 });

  const shaftFolder = gui.addFolder('Shaft');
  shaftFolder.add(params, 'shaftMaterial', Object.keys(shaftMaterials))
  .name('Shaft material')
  .onChange(onChange);

  shaftFolder.add(params, 'shaftDiameter', minDiameter, maxDiameter, step)
  .name('Shaft diameter (mm)')
  .onChange(onChange);

  shaftFolder.add(params, 'shaftLength', minLenght, maxLenght, step)
  .name('Shaft length (mm)')
  .onChange(onChange);

  const ballFolder = gui.addFolder('Ball');
  ballFolder.add(params, 'ballMaterial', Object.keys(ballMaterials))
  .name('Ball material')
  .onChange(onChange);

  ballFolder.add(params, 'ballDiameter', minDiameter, maxDiameter, step)
  .name('Ball diameter (mm)')
  .onChange(onChange);

  return gui;
}