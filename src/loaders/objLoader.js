import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

/**
 * Load an OBJ file and return the resulting Group.
 *
 * @param {string} url - Path to the .obj file (e.g. '/models/part.obj')
 * @param {object} [options]
 * @param {THREE.Material} [options.material] - Material to apply to all meshes.
 *        Defaults to a neutral gray MeshStandardMaterial.
 * @param {(progress: number) => void} [options.onProgress] - Callback with 0–1 progress.
 * @returns {Promise<THREE.Group>} Resolves with the loaded object.
 */
export function loadOBJ(url, options = {}) {
  const {
    material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.6,
    }),
    onProgress,
  } = options;

  const loader = new OBJLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (object) => {
        // OBJ has no materials by default — apply the chosen one
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = material;
          }
        });
        resolve(object);
      },
      (xhr) => {
        if (onProgress && xhr.total) {
          onProgress(xhr.loaded / xhr.total);
        }
      },
      (error) => reject(error)
    );
  });
}