import * as THREE from "three";

const STEM = 0x4a7c3a;
const LEAF = 0x6db35a;
const SEED = 0x7a4e2a;
const FRUIT = 0xd94c3d;

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function addMesh(group, geometry, material, x, y, z, rx = 0, rz = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, 0, rz);
  mesh.castShadow = true;
  group.add(mesh);
}

/** Low-Poly-Pflanze in 4 Stufen: Saat, Spross, klein, erntereif. */
export function createPlantMesh(stage) {
  const group = new THREE.Group();
  group.name = "plant";

  if (stage === 0) {
    addMesh(group, new THREE.SphereGeometry(0.08, 6, 5), mat(SEED), 0, 0.08, 0);
    return group;
  }

  if (stage === 1) {
    addMesh(group, new THREE.CylinderGeometry(0.03, 0.04, 0.22, 5), mat(STEM), 0, 0.16, 0);
    addMesh(
      group,
      new THREE.ConeGeometry(0.08, 0.14, 5),
      mat(LEAF),
      0.05,
      0.28,
      0,
      0,
      -0.7,
    );
    return group;
  }

  if (stage === 2) {
    addMesh(group, new THREE.CylinderGeometry(0.04, 0.055, 0.42, 5), mat(STEM), 0, 0.26, 0);
    addMesh(group, new THREE.ConeGeometry(0.12, 0.2, 5), mat(LEAF), 0.1, 0.4, 0.02, 0, -0.85);
    addMesh(group, new THREE.ConeGeometry(0.11, 0.18, 5), mat(LEAF), -0.08, 0.36, 0.06, 0, 0.8);
    addMesh(group, new THREE.ConeGeometry(0.1, 0.16, 5), mat(LEAF), 0.02, 0.38, -0.1, 0.7, 0);
    return group;
  }

  addMesh(group, new THREE.CylinderGeometry(0.05, 0.07, 0.58, 6), mat(STEM), 0, 0.34, 0);
  addMesh(group, new THREE.ConeGeometry(0.16, 0.26, 5), mat(LEAF), 0.14, 0.52, 0.04, 0, -0.9);
  addMesh(group, new THREE.ConeGeometry(0.15, 0.24, 5), mat(LEAF), -0.12, 0.5, 0.08, 0, 0.85);
  addMesh(group, new THREE.ConeGeometry(0.14, 0.22, 5), mat(LEAF), 0.04, 0.56, -0.12, 0.75, 0);
  addMesh(group, new THREE.SphereGeometry(0.09, 6, 5), mat(FRUIT), 0.1, 0.42, 0.08);
  addMesh(group, new THREE.SphereGeometry(0.08, 6, 5), mat(FRUIT), -0.08, 0.38, -0.04);
  addMesh(group, new THREE.SphereGeometry(0.07, 6, 5), mat(FRUIT), 0.02, 0.48, -0.1);
  return group;
}
