import * as THREE from "three";

function rng(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function paintGlow(ctx, x, y, radius, color) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function createNebulaTexture() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0c0724";
  ctx.fillRect(0, 0, width, height);

  const band = ctx.createLinearGradient(0, 0, 0, height * 0.7);
  band.addColorStop(0, "#5b1d9a");
  band.addColorStop(0.12, "#e05aa8");
  band.addColorStop(0.28, "#7a3ad4");
  band.addColorStop(0.45, "#2f6adf");
  band.addColorStop(0.62, "#1a1048");
  band.addColorStop(1, "#0c0724");
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, width, height * 0.7);

  const nebulae = [
    { x: 0.22, y: 0.1, r: 160, color: "rgba(80, 180, 255, 0.55)" },
    { x: 0.48, y: 0.08, r: 190, color: "rgba(255, 110, 180, 0.6)" },
    { x: 0.72, y: 0.12, r: 170, color: "rgba(170, 100, 255, 0.55)" },
    { x: 0.9, y: 0.16, r: 140, color: "rgba(50, 220, 210, 0.4)" },
    { x: 0.4, y: 0.04, r: 100, color: "rgba(255, 210, 130, 0.35)" },
  ];

  for (const cloud of nebulae) {
    const x = cloud.x * width;
    const y = cloud.y * height;
    paintGlow(ctx, x, y, cloud.r, cloud.color);
    if (x < cloud.r) paintGlow(ctx, x + width, y, cloud.r, cloud.color);
    if (x > width - cloud.r) paintGlow(ctx, x - width, y, cloud.r, cloud.color);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function createStarField() {
  const count = 1800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const rand = rng(42042);

  for (let i = 0; i < count; i += 1) {
    const radius = 40 + rand() * 8;
    const theta = rand() * Math.PI * 0.72;
    const phi = rand() * Math.PI * 2;
    const i3 = i * 3;
    positions[i3] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i3 + 1] = radius * Math.cos(theta);
    positions[i3 + 2] = radius * Math.sin(theta) * Math.sin(phi);

    const tint = rand();
    if (tint < 0.14) {
      colors[i3] = 0.65;
      colors[i3 + 1] = 0.82;
      colors[i3 + 2] = 1;
    } else if (tint < 0.24) {
      colors[i3] = 1;
      colors[i3 + 1] = 0.84;
      colors[i3 + 2] = 0.58;
    } else {
      colors[i3] = 1;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
}

export function addGalaxySky(scene) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(50, 48, 32),
    new THREE.MeshBasicMaterial({
      map: createNebulaTexture(),
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    }),
  );
  sky.name = "galaxySky";
  scene.add(sky);

  const stars = createStarField();
  stars.name = "galaxyStars";
  scene.add(stars);
  return sky;
}
