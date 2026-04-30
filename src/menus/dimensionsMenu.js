import GUI from 'lil-gui';

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
  shaftFolder.add(params, 'shaftDiameter', 0.2, 2.0, 0.05).onChange(onChange);
  shaftFolder.add(params, 'shaftLength', 1.0, 100.0, 0.1).onChange(onChange);
  shaftFolder.addColor(params, 'shaftColor').onChange(onChange);

  const ballFolder = gui.addFolder('Ball');
  ballFolder.add(params, 'ballMaterial', ['ruby', 'ceramic']).onChange(onChange);
  ballFolder.add(params, 'ballDiameter', 0.1, 10.0, 0.05).onChange(onChange);
  ballFolder.addColor(params, 'ballColor').onChange(onChange);

  return gui;
}