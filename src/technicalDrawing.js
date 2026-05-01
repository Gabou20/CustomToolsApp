import * as THREE from 'three';

import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

export function createDimension(start, end, offset, label, layer) {
  const group = new THREE.Group();

  // Direction perpendicular to the dimension, scaled by offset
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const perp = new THREE.Vector3(-direction.y, direction.x, 0).multiplyScalar(offset);

  const startOffset = new THREE.Vector3().addVectors(start, perp);
  const endOffset = new THREE.Vector3().addVectors(end, perp);

  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });

  // Extension line from start to startOffset
  const ext1 = new THREE.BufferGeometry().setFromPoints([start, startOffset]);
  group.add(new THREE.Line(ext1, lineMat));

  // Extension line from end to endOffset
  const ext2 = new THREE.BufferGeometry().setFromPoints([end, endOffset]);
  group.add(new THREE.Line(ext2, lineMat));

  // The dimension line itself
  const dimLine = new THREE.BufferGeometry().setFromPoints([startOffset, endOffset]);
  group.add(new THREE.Line(dimLine, lineMat));

  // Label as a text sprite
  group.add(createTextSprite(label, new THREE.Vector3().lerpVectors(startOffset, endOffset, 0.5)));

  group.traverse(child => child.layers.set(layer));
  return group;
}

function createTextSprite(text, position, height = 2) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;   // ← key fix

  const material = new THREE.SpriteMaterial({
    map: texture,
    toneMapped: false,                          // ← key fix
  });

  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(15, 4, 1);
  return sprite;
}

export function addDimensionsToGroup(group, shaft, fixture, tip, layer)
{
    const shaftBox = new THREE.Box3().setFromObject(shaft);
    const shaftBottomY = shaftBox.min.y;
    const shaftTopY    = shaftBox.max.y;
    const shaftLeftX   = shaftBox.min.x;
    const shaftRightX  = shaftBox.max.x;

    const fixtureBox = new THREE.Box3().setFromObject(fixture);
    const fixtureBottomY = fixtureBox.min.y;
    const fixtureTopY    = fixtureBox.max.y;
    const fixtureLeftX   = fixtureBox.min.x;
    const fixtureRightX  = fixtureBox.max.x;

    const completeShaftLength = shaftTopY - shaftBottomY + fixtureTopY - fixtureBottomY;

    const shaftBottom = new THREE.Vector3(shaftRightX + 2, shaftBottomY, 0);
    const shaftTop    = new THREE.Vector3(shaftRightX + 2, shaftTopY + fixtureTopY - fixtureBottomY, 0);
    const shaftAnnotationOffset = 12 + shaftRightX - shaftLeftX;
    group.add(createDimension(shaftBottom, shaftTop, shaftAnnotationOffset, `${completeShaftLength.toFixed(1)} mm`, layer));

    const fixtureBottom = new THREE.Vector3(-fixtureRightX - 2, fixtureBottomY, 0);
    const fixtureTop    = new THREE.Vector3(-fixtureRightX - 2, fixtureTopY, 0);
    const fixtureAnnotationOffset = 12 + fixtureRightX - fixtureLeftX;
    group.add(createDimension(fixtureBottom, fixtureTop, -fixtureAnnotationOffset, `${(fixtureTopY - fixtureBottomY).toFixed(1)} mm`, layer));

    const ballBox = new THREE.Box3().setFromObject(tip);
    const ballRightX = ballBox.max.x;
    const ballLeftX  = ballBox.min.x;

    const ballLeft  = new THREE.Vector3(ballLeftX, ballBox.min.y, 0);
    const ballRight = new THREE.Vector3(ballRightX, ballBox.min.y, 0);
    group.add(createDimension(ballLeft, ballRight, -4, `Ø${(ballRightX - ballLeftX).toFixed(1)} mm`, layer));
}