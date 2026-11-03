
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070c0a);
scene.fog = new THREE.FogExp2(0x070c0a, 0.035);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 100
);

camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'low-power'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.HemisphereLight(0x8cae9d, 0x101713, 2));

const light = new THREE.PointLight(0x28a878, 25, 20);
light.position.set(0, 3, -3);
scene.add(light);

// Environment
const room = new THREE.Group();
scene.add(room);

function createBox(group, x, y, z, w, h, d, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      metalness: 0.3
    })
  );

  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x17221d,
  roughness: 0.7
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 25),
  floorMaterial
);

floor.rotation.x = -Math.PI / 2;
floor.position.z = -5;
room.add(floor);

// Walls
createBox(room, -8, 2, -5, 0.4, 4, 25, 0x18241f);
createBox(room, 8, 2, -5, 0.4, 4, 25, 0x18241f);
createBox(room, 0, 4, -5, 16, 0.3, 25, 0x101a16);

// Corridor details
for (let i = 0; i < 7; i++) {
  createBox(room, -7.75, 2.8, -i * 3, 0.08, 0.06, 1, 0x27a778);
  createBox(room, 7.75, 2.8, -i * 3, 0.08, 0.06, 1, 0x27a778);
}

// Memory version
const memory = new THREE.Group();
scene.add(memory);

createBox(memory, 0, 0.15, -5, 16, 0.3, 25, 0x315044);
createBox(memory, -8, 2, -5, 0.4, 4, 25, 0x294a3a);
createBox(memory, 8, 2, -5, 0.4, 4, 25, 0x294a3a);

for (let i = 0; i < 5; i++) {
  const pillar = createBox(
    memory, -4 + i * 2, 1.5, -4 - i * 3,
    0.5, 3, 0.5, 0x8caa91
  );
}

memory.visible = false;

// Movement
const keys = {};

window.addEventListener('keydown', e => {
  keys[e.code] = true;

  if (e.code === 'KeyQ') {
    memory.visible = !memory.visible;
    room.visible = !memory.visible;

    document.querySelector('#state').textContent =
      memory.visible ? 'MEMORY STATE' : 'PRESENT STATE';
  }
});

window.addEventListener('keyup', e => {
  keys[e.code] = false;
});

let yaw = 0;
let pitch = 0;
let locked = false;

renderer.domElement.addEventListener('click', () => {
  if (document.querySelector('#hud').style.display === 'block') {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('mousemove', e => {
  if (!locked) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;

  pitch = Math.max(-1.4, Math.min(1.4, pitch));
});

// Start game
document.querySelector('#start').addEventListener('click', () => {
  document.querySelector('#overlay').style.display = 'none';
  document.querySelector('#hud').style.display = 'block';
  renderer.domElement.requestPointerLock();
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Game loop
const direction = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  direction.set(
    Number(keys.KeyD) - Number(keys.KeyA),
    0,
    Number(keys.KeyS) - Number(keys.KeyW)
  );

  if (direction.length() > 0) {
    direction.normalize();
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

    const speed = keys.ShiftLeft ? 0.11 : 0.055;
    camera.position.addScaledVector(direction, speed);
  }

  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -7, 7);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -17, 7);
  camera.position.y = 1.7;

  renderer.render(scene, camera);
}

animate();
