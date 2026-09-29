import * as THREE from "three";
import { createPlantMesh } from "./plantMesh.js";

export const GRID_SIZE = 8;
export const TILE_SIZE = 1;
export const TILE_GAP = 0.08;
export const STAGE_COUNT = 4;
export const STAGE_SECONDS = 3.5;

const DIRT_EMPTY = 0x9a6b3a;
const DIRT_PLANTED = 0x7a522c;

function tileWorldOffset() {
  return ((GRID_SIZE - 1) * (TILE_SIZE + TILE_GAP)) / 2;
}

export function tilePosition(x, z) {
  const offset = tileWorldOffset();
  const step = TILE_SIZE + TILE_GAP;
  return {
    x: x * step - offset,
    z: z * step - offset,
  };
}

export function createFarm(scene) {
  const tiles = [];
  const cells = [];
  const dirtGeometry = new THREE.BoxGeometry(TILE_SIZE, 0.18, TILE_SIZE);

  for (let z = 0; z < GRID_SIZE; z += 1) {
    cells[z] = [];
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const group = new THREE.Group();
      const pos = tilePosition(x, z);
      group.position.set(pos.x, 0, pos.z);
      group.userData = { type: "tile", x, z };

      const dirt = new THREE.Mesh(dirtGeometry, new THREE.MeshLambertMaterial({ color: DIRT_EMPTY }));
      dirt.position.y = 0.09;
      dirt.receiveShadow = true;
      dirt.castShadow = false;
      group.add(dirt);
      scene.add(group);

      const cell = {
        status: "empty",
        stage: -1,
        elapsed: 0,
        group,
        dirt,
        plant: null,
      };
      cells[z][x] = cell;
      tiles.push(group);
    }
  }

  function setDirtColor(cell, planted) {
    cell.dirt.material.color.setHex(planted ? DIRT_PLANTED : DIRT_EMPTY);
  }

  function replacePlant(cell, stage) {
    if (cell.plant) {
      cell.group.remove(cell.plant);
      cell.plant.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      cell.plant = null;
    }
    if (stage < 0) return;
    cell.plant = createPlantMesh(stage);
    cell.plant.position.y = 0.18;
    cell.group.add(cell.plant);
  }

  function plantOn(x, z) {
    const cell = cells[z][x];
    if (cell.status !== "empty") return false;
    cell.status = "growing";
    cell.stage = 0;
    cell.elapsed = 0;
    setDirtColor(cell, true);
    replacePlant(cell, 0);
    return true;
  }

  function harvest(x, z) {
    const cell = cells[z][x];
    if (cell.status !== "ready") return false;
    cell.status = "empty";
    cell.stage = -1;
    cell.elapsed = 0;
    setDirtColor(cell, false);
    replacePlant(cell, -1);
    return true;
  }

  function update(dt) {
    for (let z = 0; z < GRID_SIZE; z += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const cell = cells[z][x];
        if (cell.status !== "growing") continue;
        cell.elapsed += dt;
        const nextStage = Math.min(STAGE_COUNT - 1, Math.floor(cell.elapsed / STAGE_SECONDS));
        if (nextStage !== cell.stage) {
          cell.stage = nextStage;
          replacePlant(cell, cell.stage);
        }
        if (cell.stage >= STAGE_COUNT - 1) {
          cell.status = "ready";
        }
      }
    }
  }

  return { tiles, cells, plantOn, harvest, update };
}

export function findTileFromHit(object) {
  let current = object;
  while (current) {
    if (current.userData?.type === "tile") return current.userData;
    current = current.parent;
  }
  return null;
}
