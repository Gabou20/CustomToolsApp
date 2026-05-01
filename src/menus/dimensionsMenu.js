import GUI from 'lil-gui';
import { ballMaterials, shaftMaterials } from '../textures/materials.js';

// Constants
const step = 0.05;
const minDiameter = step;
const maxDiameter = 10.0;
const minLenght = 5;
const maxLenght = 100.0;

const connectorType = {
  M2: 2,
  M3: 3,
  M4: 4,
  M5: 5
};

const endType = {
  Ball: 0,
  Disk: 1
};

/**
 * Build the part configurator GUI.
 *
 * @param {object} params - The shared params object the GUI will mutate.
 * @param {() => void} onChange - Called whenever any control changes.
 * @returns {GUI} The lil-gui instance, in case the caller wants to extend it.
 */
export function createDimensionsMenu(params, onChange) {
  const gui = new GUI({ title: 'Part Configurator', width: 300 });

  const connectorFolder = gui.addFolder('Connector');
  connectorFolder.add(params, 'connectorType', Object.keys(connectorType))
  .name('Type')
  .onChange(onChange);

  // Forward declarations so onChange callbacks can reference these
  let fixtureLengthController;
  let ballDiameterController;

  const shaftFolder = gui.addFolder('Shaft');

  fixtureLengthController = shaftFolder
    .add(params, 'fixtureLength', 3.5, maxLenght, step)
    .name('Fixture length (mm)')
    .onChange(onChange);

  shaftFolder.add(params, 'shaftLength', minLenght, maxLenght, step)
    .name('Shaft length (mm)')
    .onChange(() => {
      fixtureLengthController.max(params.shaftLength);
      if (params.fixtureLength > params.shaftLength) {
        params.fixtureLength = params.shaftLength;
        fixtureLengthController.updateDisplay();
      }
      onChange();
    });

  shaftFolder.add(params, 'shaftDiameter', minDiameter, maxDiameter, step)
    .name('Shaft diameter (mm)')
    .onChange(() => {
      ballDiameterController.min(params.shaftDiameter);
      if (params.ballDiameter < params.shaftDiameter) {
        params.ballDiameter = params.shaftDiameter;
        ballDiameterController.updateDisplay();
      }
      onChange();
    });

  shaftFolder.add(params, 'shaftMaterial', Object.keys(shaftMaterials))
    .name('Shaft material')
    .onChange(onChange);

  const ballFolder = gui.addFolder('Stylus end');

  ballFolder.add(params, 'endType', Object.keys(endType))
  .name('Type')
  .onChange(onChange);
 
  ballDiameterController = ballFolder
    .add(params, 'ballDiameter', minDiameter, maxDiameter, step)
    .name('Diameter (mm)')
    .onChange(onChange);

  ballFolder.add(params, 'ballMaterial', Object.keys(ballMaterials))
    .name('Material')
    .onChange(onChange);
 
  ballFolder.add(params, 'diskThickness', minDiameter, maxDiameter/8, step)
    .name('Disk thickness (mm)')
    .onChange(onChange);

  // Apply initial constraints
  fixtureLengthController.max(params.shaftLength);
  if (params.fixtureLength > params.shaftLength) {
    params.fixtureLength = params.shaftLength;
    fixtureLengthController.updateDisplay();
    onChange();
  }

  ballDiameterController.min(params.shaftDiameter);
  if (params.ballDiameter < params.shaftDiameter) {
    params.ballDiameter = params.shaftDiameter;
    ballDiameterController.updateDisplay();
    onChange();
  }

  return gui;
}