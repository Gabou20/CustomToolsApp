import {MeshStandardMaterial} from 'three';

const rubyMaterial = new MeshStandardMaterial({ color: '#5e0e2a', 
                                                        metalness: 0, 
                                                        roughness: 0, 
                                                        transparent: true,
                                                        opacity: 0.9 });

const ceramicMaterial = new MeshStandardMaterial({ color: '#fceeda', 
                                                        metalness: 0.3, 
                                                        roughness: 0.3, 
                                                        transparent: false, 
                                                        opacity: 0.8 });

const steelMaterial = new MeshStandardMaterial({ color: '#c8c8c8', 
                                                        metalness: 1.0, 
                                                        roughness: 0.25 })

const carbonMaterial = new MeshStandardMaterial({ color: '#444343', 
                                                        metalness: 0.9, 
                                                        roughness: 0.25 })

export const shaftMaterials = {Ceramic: ceramicMaterial,
                        Steel: steelMaterial,
                        Carbon: carbonMaterial};

export const ballMaterials = {Ruby: rubyMaterial,
                    Ceramic: ceramicMaterial,
                    Steel: steelMaterial};

export function getBallMaterial(name)
{
    return ballMaterials[name]
}

export function getShaftMaterial(name)
{
    return shaftMaterials[name]
}