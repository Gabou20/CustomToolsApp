import {MeshStandardMaterial} from 'three';

const materials = {Ruby: new MeshStandardMaterial({ color: '#5e0e2a', 
                                                        metalness: 0, 
                                                        roughness: 0, 
                                                        transparent: true,
                                                        opacity: 0.9 }),
                    Ceramic: new MeshStandardMaterial({ color: '#fceeda', 
                                                        metalness: 0.3, 
                                                        roughness: 0.3, 
                                                        transparent: false, 
                                                        opacity: 0.8 }),
                    Steel: new MeshStandardMaterial({ color: '#ffffff', 
                                                        metalness: 1.0, 
                                                        roughness: 0.05 })};

export function getBallMaterials()
{
    return materials;
}

export function getMaterial(name)
{
    return materials[name]
}