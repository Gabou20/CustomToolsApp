import GUI from 'lil-gui';
import { getBallMaterials } from '../textures/ballMaterials.js';

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
  const gui = new GUI({ title: 'Part Configurator' });

  const shaftFolder = gui.addFolder('Shaft');
  shaftFolder.add(params, 'shaftDiameter', minDiameter, maxDiameter, step).onChange(onChange);
  shaftFolder.add(params, 'shaftLength', minLenght, maxLenght, step).onChange(onChange);

  const ballFolder = gui.addFolder('Ball');
  ballFolder.add(params, 'ballMaterial', Object.keys(getBallMaterials())).onChange(onChange);
  ballFolder.add(params, 'ballDiameter', minDiameter, maxDiameter, step).onChange(onChange);

  return gui;
}