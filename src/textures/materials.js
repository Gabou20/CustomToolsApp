import {MeshPhysicalMaterial, MeshStandardMaterial} from 'three';

const rubyMaterial = new MeshStandardMaterial({ 
    color: '#5e0e2a', 
    metalness: 0, 
    roughness: 0, 
    transparent: true,
    opacity: 0.9 });

const synthRubyMaterial = new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transmission: 1.0,
    thickness: 0.5,            // ← was 3.5, much smaller
    ior: 1.77,
    attenuationColor: 0xaa1144,
    attenuationDistance: 1.0,  // ← was 0.4, larger means less absorption
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
});

const ceramicMaterial = new MeshStandardMaterial({ 
    color: 0xefebe2,
    metalness: 0,
    roughness: 0.35,
  });

const steelMaterial = new MeshStandardMaterial({ 
    color: '#c8c8c8', 
    metalness: 1.0, 
    roughness: 0.25 })

const carbonMaterial = new MeshStandardMaterial({ 
    color: '#444343', 
    metalness: 0.9, 
    roughness: 0.25 })

const siliconNitrideMaterial = new MeshStandardMaterial({
    color: '#3a3a3a',
    metalness: 0.1,
    roughness: 0.4,
  });

const zirconiaMaterial = new MeshStandardMaterial({
    color: 0xf2ede2,
    metalness: 0,
    roughness: 0.3,
});

// Tungsten carbide — dark metallic gray, polished
const tungstenCarbideMaterial = new MeshStandardMaterial({
    color: 0x6e6e74,
    metalness: 0.9,
    roughness: 0.2,
});

// Diamond — fully transparent with high IOR for sparkle
const diamondMaterial = new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 1.0,
    thickness: 2.0,
    ior: 2.4,
    attenuationColor: 0xffffff,
    attenuationDistance: 10,
    clearcoat: 1.0,
    clearcoatRoughness: 0,
});

// Titanium — slightly warm silver
const titaniumMaterial = new MeshStandardMaterial({
    color: 0xb8b0a8,
    metalness: 1.0,
    roughness: 0.35,
});

export const shaftMaterials = {
    Ceramic: ceramicMaterial,
    Steel: steelMaterial,
    Carbon: carbonMaterial,
    Tungsten: tungstenCarbideMaterial,
    Titanium: titaniumMaterial};

export const ballMaterials = {
    Ruby: rubyMaterial,
    Ceramic: ceramicMaterial,
    Steel: steelMaterial,
    SiliconNitride: siliconNitrideMaterial,
    Zirconia: zirconiaMaterial,
    Tungsten: tungstenCarbideMaterial,
    Diamond: diamondMaterial};

export function getBallMaterial(name)
{
    return ballMaterials[name]
}

export function getShaftMaterial(name)
{
    return shaftMaterials[name]
}