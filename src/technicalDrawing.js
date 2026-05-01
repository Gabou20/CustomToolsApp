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

    const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        toneMapped: false,
        fog: false,
    });

    const isVertical = Math.abs(end.y - start.y) > Math.abs(end.x - start.x);

    // Extension lines (perpendicular ticks at endpoints)
    const ext1 = new THREE.BufferGeometry().setFromPoints([start, startOffset]);
    group.add(new THREE.Line(ext1, lineMat));

    const ext2 = new THREE.BufferGeometry().setFromPoints([end, endOffset]);
    group.add(new THREE.Line(ext2, lineMat));

    // Dimension line, split into two segments with a gap for the text
    const midpoint = new THREE.Vector3().lerpVectors(startOffset, endOffset, 0.5);
    const lineDirection = new THREE.Vector3().subVectors(endOffset, startOffset).normalize();

    let textGap = 2;
    if (!isVertical)
    {
        textGap = label.length * 0.5;   // rough estimate based on character count
    }
    const gapStart = new THREE.Vector3().copy(midpoint).addScaledVector(lineDirection, -textGap);
    const gapEnd   = new THREE.Vector3().copy(midpoint).addScaledVector(lineDirection,  textGap);

    // Left segment: from startOffset to gapStart
    const seg1 = new THREE.BufferGeometry().setFromPoints([startOffset, gapStart]);
    group.add(new THREE.Line(seg1, lineMat));

    // Right segment: from gapEnd to endOffset
    const seg2 = new THREE.BufferGeometry().setFromPoints([gapEnd, endOffset]);
    group.add(new THREE.Line(seg2, lineMat));

    if (!isVertical)
    {
        const labelDirection = perp.clone().normalize();
        const labelOffsetDistance = 1.5;   // distance from line to label
        const labelPos = new THREE.Vector3().copy(midpoint).addScaledVector(labelDirection, labelOffsetDistance);
        group.add(createTextSprite(label, labelPos));
    }
    else
    {
        // Label in the gap (transparent background so it works on any bg)
        group.add(createTextSprite(label, midpoint));
    }
    group.traverse(child => child.layers.set(layer));
    return group;
}

function createTextSprite(text, position) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // No background fill — canvas stays transparent

  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Dark outline for readability on any background
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(text, 128, 32);

  // White fill on top
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    toneMapped: false,
    fog: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(15, 4, 1);
  return sprite;
}

function createLeaderAnnotation(target, labelOffset, label, layer) {
    const group = new THREE.Group();

    const labelPos = new THREE.Vector3().addVectors(target, labelOffset);

    // Shorten the line so it stops before reaching the label
    const textGap = label.length * 0.5;   // rough: half a unit per character
    const direction = labelOffset.clone().normalize();
    const shortenedOffset = labelOffset.clone().sub(direction.multiplyScalar(textGap));
    const lineEnd = new THREE.Vector3().addVectors(target, shortenedOffset);

    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false, fog: false });
    const lineGeom = new THREE.BufferGeometry().setFromPoints([target, lineEnd]);
    group.add(new THREE.Line(lineGeom, lineMat));

    // Text at label position
    group.add(createTextSprite(label, labelPos));

    group.traverse(child => child.layers.set(layer));
    return group;
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
    const shaftAnnotationOffset = 10 + shaftRightX - shaftLeftX;
    group.add(createDimension(shaftBottom, shaftTop, shaftAnnotationOffset, `${completeShaftLength.toFixed(1)} mm`, layer));

    const target = new THREE.Vector3(shaftRightX, shaftTopY * 0.5, 0);
    const offset = new THREE.Vector3(8, 0, 0);   // 8 units to the right
    group.add(createLeaderAnnotation(target, offset, `Ø${(shaftRightX - shaftLeftX).toFixed(1)} mm`, layer));

    const fixtureBottom = new THREE.Vector3(-fixtureRightX - 2, fixtureBottomY, 0);
    const fixtureTop    = new THREE.Vector3(-fixtureRightX - 2, fixtureTopY, 0);
    const fixtureAnnotationOffset = 10 + fixtureRightX - fixtureLeftX;
    group.add(createDimension(fixtureBottom, fixtureTop, -fixtureAnnotationOffset, `${(fixtureTopY - fixtureBottomY).toFixed(1)} mm`, layer));

    const ballBox = new THREE.Box3().setFromObject(tip);
    const ballRightX = ballBox.max.x;
    const ballLeftX  = ballBox.min.x;

    const ballLeft  = new THREE.Vector3(ballLeftX, ballBox.min.y, 0);
    const ballRight = new THREE.Vector3(ballRightX, ballBox.min.y, 0);
    group.add(createDimension(ballLeft, ballRight, -3, `Ø${(ballRightX - ballLeftX).toFixed(1)} mm`, layer));
}