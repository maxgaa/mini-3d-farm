import "./style.css";
import * as THREE from "three";
import { createFarm, findTileFromHit, GRID_SIZE, TILE_SIZE, TILE_GAP } from "./farm.js";
import { addGalaxySky } from "./galaxySky.js";

const canvas = document.querySelector("#game");
if (!canvas) {
  throw new Error("Canvas element #game not found");
}
const harvestEl = document.querySelector("#harvest-count");
const statusHintEl = document.querySelector("#status-hint");

function setStatusHint(message) {
  if (statusHintEl) statusHintEl.textContent = message ?? "";
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x050014);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050014);
addGalaxySky(scene);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 11.5, 9.5);
camera.lookAt(0, 0, 0);

const hemi = new THREE.HemisphereLight(0xc8b4ff, 0x6b4a2a, 0.8);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff4d6, 1.15);
sun.position.set(6, 12, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 2;
sun.shadow.camera.far = 28;
sun.shadow.camera.left = -10;
sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10;
sun.shadow.camera.bottom = -10;
sun.shadow.normalBias = 0.02;
sun.shadow.bias = -0.0005;
scene.add(sun);

const groundSize = GRID_SIZE * (TILE_SIZE + TILE_GAP) + 4;
const ground = new THREE.Mesh(
  new THREE.BoxGeometry(groundSize, 0.2, groundSize),
  new THREE.MeshLambertMaterial({ color: 0x5d8a46 }),
);
ground.position.y = -0.12;
ground.receiveShadow = true;
scene.add(ground);

const farm = createFarm(scene);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let harvestCount = 0;
const clock = new THREE.Clock();

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(farm.tiles, true);
  if (hits.length === 0) return;

  const tile = findTileFromHit(hits[0].object);
  if (!tile) return;

  const cell = farm.cells[tile.z][tile.x];
  if (cell.status === "empty") {
    farm.plantOn(tile.x, tile.z);
    setStatusHint("");
    return;
  }
  if (cell.status === "growing") {
    setStatusHint("Noch nicht erntereif");
    return;
  }
  if (cell.status === "ready" && farm.harvest(tile.x, tile.z)) {
    harvestCount += 1;
    if (harvestEl) harvestEl.textContent = String(harvestCount);
    setStatusHint("");
  }
}

function tick() {
  const dt = Math.min(clock.getDelta(), 0.1);
  farm.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

window.addEventListener("resize", onResize);
canvas.addEventListener("click", onClick);
tick();
