// ============================================================================
// TRUNG THU 3D - ĐÊM TRĂNG ĐOÀN VIÊN & LỒNG ĐÈN HOA ĐĂNG
// ============================================================================

const container = document.getElementById("webgl-container");
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  ) || window.innerWidth < 768;

// SCENE & ATMOSPHERE
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060312, 0.0075);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  isMobile ? 60 : 45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const DEFAULT_CAM_POS = isMobile
  ? new THREE.Vector3(0, 12, 45)
  : new THREE.Vector3(0, 10, 40);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 6.0, 0);

camera.position.copy(DEFAULT_CAM_POS);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: !isMobile,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.32;
container.appendChild(renderer.domElement);

// CONTROLS
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 + 0.05;
controls.minDistance = 8;
controls.maxDistance = 90;
controls.target.copy(DEFAULT_CAM_TARGET);

// LIGHTS
const ambientLight = new THREE.AmbientLight(0x2a103d, 1.35);
scene.add(ambientLight);

const treeLight = new THREE.PointLight(0xffb6c1, 2.6, 45);
treeLight.position.set(0, 8, 0);
scene.add(treeLight);

const warmLight = new THREE.PointLight(0xffaa33, 2.0, 32);
warmLight.position.set(0, -2, 0);
scene.add(warmLight);

// ============================================================================
// ÁNH TRĂNG TRÒN (3D FULL MOON) HOÀNG GIA LUNG LINH & MÂY BỒNG BỀNH
// ============================================================================
const moonGroup = new THREE.Group();
const MOON_POS = new THREE.Vector3(isMobile ? 12 : 18, isMobile ? 31 : 28, -40);
moonGroup.position.copy(MOON_POS);
scene.add(moonGroup);

// Ánh trăng chiếu rọi từ trên cao xuống đảo và tán hoa đào
const moonLight = new THREE.DirectionalLight(0xfffae6, 1.45);
moonLight.position.copy(MOON_POS);
moonLight.target.position.set(0, 5, 0);
scene.add(moonLight);
scene.add(moonLight.target);

// Ánh sáng điểm tỏa ấm áp từ vầng trăng
const moonCoronaLight = new THREE.PointLight(0xffe6a3, 1.6, 105);
moonCoronaLight.position.copy(MOON_POS);
scene.add(moonCoronaLight);

// Hàm tạo texture hào quang mềm mại (Radial Glow Canvas)
function createGlowTexture(innerCol, midCol, outerCol) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, innerCol);
  grad.addColorStop(0.35, midCol);
  grad.addColorStop(0.7, outerCol);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 64, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

// 1. Tải Texture Mặt Trăng Rằm Tuyệt Mỹ (100% An toàn CORS trên file:// & http://)
const moonTextureSource =
  typeof TEXTURES_DATA !== "undefined" && TEXTURES_DATA.moon
    ? TEXTURES_DATA.moon
    : "./assets/moon.jpg";

const moonTex = new THREE.TextureLoader().load(moonTextureSource);

// 2. Vầng Trăng Tròn hoàn hảo với CircleGeometry (tuyệt đối không có viền vuông!), fog: false để không bị sương mù làm xám!
const moonGeo = new THREE.CircleGeometry(11.2, 64);
const moonMat = new THREE.MeshBasicMaterial({
  map: moonTex,
  transparent: true,
  alphaTest: 0.005,
  fog: false, // Tuyệt đối không bị sương mù làm giảm độ tương phản!
  depthWrite: false,
  side: THREE.DoubleSide,
});
const moonMesh = new THREE.Mesh(moonGeo, moonMat);
moonGroup.add(moonMesh);

// 3. Vầng Hào Quang Kim Sắc Rực Rỡ (Inner Bright Corona)
const moonCoronaSpriteMat = new THREE.SpriteMaterial({
  map: createGlowTexture(
    "rgba(255, 245, 200, 0.95)",
    "rgba(255, 205, 75, 0.55)",
    "rgba(255, 140, 30, 0)",
  ),
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  fog: false,
  depthWrite: false,
});
const moonCoronaSprite = new THREE.Sprite(moonCoronaSpriteMat);
moonCoronaSprite.scale.set(40, 40, 1);
moonGroup.add(moonCoronaSprite);

// 4. Hào Quang Tím Lam Mộng Mơ (Outer Ethereal Twilight Haze)
const moonOuterHazeMat = new THREE.SpriteMaterial({
  map: createGlowTexture(
    "rgba(255, 230, 160, 0.4)",
    "rgba(215, 175, 255, 0.22)",
    "rgba(120, 70, 200, 0)",
  ),
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  fog: false,
  depthWrite: false,
});
const moonOuterHaze = new THREE.Sprite(moonOuterHazeMat);
moonOuterHaze.scale.set(58, 58, 1);
moonGroup.add(moonOuterHaze);

// 5. Mây đêm bồng bềnh lướt qua ánh trăng (Drifting Night Clouds)
const cloudsGroup = new THREE.Group();
scene.add(cloudsGroup);

function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 256, 64);

  const grad = ctx.createRadialGradient(128, 32, 8, 128, 32, 110);
  grad.addColorStop(0, "rgba(255, 245, 230, 0.35)");
  grad.addColorStop(0.4, "rgba(230, 210, 245, 0.2)");
  grad.addColorStop(0.8, "rgba(180, 150, 220, 0.06)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.ellipse(128, 32, 110, 26, 0, 0, Math.PI * 2);
  ctx.ellipse(90, 30, 60, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(165, 34, 70, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

const cloudTexture = createCloudTexture();
const clouds = [];
const cloudCount = 5;

for (let i = 0; i < cloudCount; i++) {
  const cGeo = new THREE.PlaneGeometry(28 + Math.random() * 12, 7 + Math.random() * 3);
  const cMat = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.4 + Math.random() * 0.25,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const cMesh = new THREE.Mesh(cGeo, cMat);

  const startX = 10 + Math.random() * 45;
  const startY = 24 + Math.random() * 10;
  const startZ = -34 - Math.random() * 10;
  cMesh.position.set(startX, startY, startZ);

  cloudsGroup.add(cMesh);
  clouds.push({
    mesh: cMesh,
    speed: 0.25 + Math.random() * 0.35,
    initialY: startY,
    floatSpeed: 0.6 + Math.random() * 0.5,
    id: i,
  });
}

// ============================================================================
// ISLAND & SCENERY
// ============================================================================
const islandGroup = new THREE.Group();
scene.add(islandGroup);

const islandGeo = new THREE.CylinderGeometry(
  8.5,
  2.2,
  7.5,
  isMobile ? 32 : 48,
  12,
);
const posAttr = islandGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const vx = posAttr.getX(i);
  const vy = posAttr.getY(i);
  const vz = posAttr.getZ(i);

  const distFromCenter = Math.sqrt(vx * vx + vz * vz);
  const noise =
    Math.sin(vx * 0.8) * Math.cos(vz * 0.8) * 0.6 +
    Math.sin(vx * 1.8 + vz * 1.5) * 0.3;

  if (vy > 0) {
    posAttr.setY(i, vy + noise * (1.0 - distFromCenter / 12));
  } else {
    posAttr.setX(i, vx + (Math.random() - 0.5) * 1.4);
    posAttr.setZ(i, vz + (Math.random() - 0.5) * 1.4);
  }
}
islandGeo.computeVertexNormals();

const islandMat = new THREE.MeshStandardMaterial({
  color: 0x3d231b,
  roughness: 0.85,
  flatShading: true,
});
const islandMesh = new THREE.Mesh(islandGeo, islandMat);
islandGroup.add(islandMesh);

const topGeo = new THREE.CylinderGeometry(8.6, 7.8, 0.8, isMobile ? 32 : 48, 4);
const topPos = topGeo.attributes.position;
for (let i = 0; i < topPos.count; i++) {
  const vx = topPos.getX(i);
  const vy = topPos.getY(i);
  const vz = topPos.getZ(i);
  const noise = Math.sin(vx * 0.9) * Math.cos(vz * 0.9) * 0.5;
  topPos.setY(i, vy + noise * 0.4);
}
topGeo.computeVertexNormals();
const topMat = new THREE.MeshStandardMaterial({
  color: 0x22130e,
  roughness: 0.9,
  flatShading: true,
});
const topMesh = new THREE.Mesh(topGeo, topMat);
topMesh.position.y = 3.6;
islandGroup.add(topMesh);

// STONE PLATFORM
const stoneMat = new THREE.MeshStandardMaterial({
  color: 0x4a4d52,
  roughness: 0.85,
  metalness: 0.1,
  flatShading: true,
});

const mainStonePlatformGeo = new THREE.CylinderGeometry(2.5, 3.0, 0.15, 6);
const mainStonePlatform = new THREE.Mesh(mainStonePlatformGeo, stoneMat);
mainStonePlatform.position.set(0, 3.9, 0);
islandGroup.add(mainStonePlatform);

const rockCount = 3;
for (let i = 0; i < rockCount; i++) {
  const rockGeo = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.25, 0);
  const rockMesh = new THREE.Mesh(rockGeo, stoneMat);

  const angle = (i / rockCount) * Math.PI * 2 + 0.5;
  const dist = 3.8 + Math.random() * 2.0;

  rockMesh.position.set(Math.cos(angle) * dist, 3.9, Math.sin(angle) * dist);
  rockMesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );
  islandGroup.add(rockMesh);
}

// TREE TRUNK & BRANCHES
const treeGroup = new THREE.Group();
treeGroup.position.set(0, 4.0, 0);
islandGroup.add(treeGroup);

// ============================================================================
// ÁNH SÁNG NHỊP THỞ HUYỀN ẢO DƯỚI GỐC CÂY (MYSTICAL BREATHING LIGHT AT TREE BASE)
// ============================================================================
// 1. Nguồn sáng điểm phát ra từ lòng gốc cây (Màu hồng đào tiên cảnh & ánh vàng ấm)
const treeBaseBreathingLight = new THREE.PointLight(0xff77a9, 3.2, 22);
treeBaseBreathingLight.position.set(0, 0.45, 0);
treeGroup.add(treeBaseBreathingLight);

const treeWarmBreathingLight = new THREE.PointLight(0xffb84d, 2.2, 16);
treeWarmBreathingLight.position.set(0, 0.25, 0);
treeGroup.add(treeWarmBreathingLight);

// 2. Vầng hào quang tỏa tròn trên mặt đất dưới gốc cây (Root Aura Disk)
function createRootAuraTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255, 230, 180, 0.95)");
  grad.addColorStop(0.25, "rgba(255, 140, 180, 0.75)");
  grad.addColorStop(0.55, "rgba(230, 90, 160, 0.35)");
  grad.addColorStop(0.85, "rgba(180, 60, 220, 0.12)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

const rootAuraGeo = new THREE.PlaneGeometry(8.2, 8.2);
const rootAuraMat = new THREE.MeshBasicMaterial({
  map: createRootAuraTexture(),
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const rootAuraMesh = new THREE.Mesh(rootAuraGeo, rootAuraMat);
rootAuraMesh.rotation.x = -Math.PI / 2;
rootAuraMesh.position.set(0, 0.05, 0);
treeGroup.add(rootAuraMesh);

// 3. Vòng tròn năng lượng lan tỏa nhịp thở (Outer breathing pulse wave)
const rootAuraRingGeo = new THREE.RingGeometry(1.2, 4.8, 32);
const rootAuraRingMat = new THREE.MeshBasicMaterial({
  map: createRootAuraTexture(),
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const rootAuraRing = new THREE.Mesh(rootAuraRingGeo, rootAuraRingMat);
rootAuraRing.rotation.x = -Math.PI / 2;
rootAuraRing.position.set(0, 0.08, 0);
treeGroup.add(rootAuraRing);

// 4. Đom đóm phát sáng bay lượn huyền ảo quanh gốc cây
const fireflyCount = 28;
const fireflyGeo = new THREE.BufferGeometry();
const fireflyPositions = new Float32Array(fireflyCount * 3);
const fireflyData = [];

for (let i = 0; i < fireflyCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.8 + Math.random() * 3.2;
  const y = 0.2 + Math.random() * 2.2;
  fireflyPositions[i * 3] = Math.cos(angle) * radius;
  fireflyPositions[i * 3 + 1] = y;
  fireflyPositions[i * 3 + 2] = Math.sin(angle) * radius;

  fireflyData.push({
    baseAngle: angle,
    radius: radius,
    baseY: y,
    speed: 0.4 + Math.random() * 0.8,
    floatSpeed: 1.2 + Math.random() * 1.5,
    pulseSpeed: 2.0 + Math.random() * 2.5,
    pulsePhase: Math.random() * Math.PI * 2,
  });
}
fireflyGeo.setAttribute("position", new THREE.BufferAttribute(fireflyPositions, 3));

function createFireflyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 220, 1)");
  grad.addColorStop(0.3, "rgba(255, 210, 100, 0.8)");
  grad.addColorStop(0.7, "rgba(255, 120, 160, 0.3)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

const fireflyMat = new THREE.PointsMaterial({
  size: 0.55,
  map: createFireflyTexture(),
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const fireflyParticles = new THREE.Points(fireflyGeo, fireflyMat);
treeGroup.add(fireflyParticles);

const trunkMat = new THREE.MeshStandardMaterial({
  color: 0x2b140e,
  roughness: 0.85,
});

const trunkCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.15, 2.5, -0.1),
  new THREE.Vector3(-0.1, 5.0, 0.1),
  new THREE.Vector3(0.0, 7.5, 0.0),
]);

const trunkGeo = new THREE.TubeGeometry(trunkCurve, 32, 0.28, 8, false);
const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
treeGroup.add(trunkMesh);

const branchClusters = [];
const mainBranchCount = 12;
for (let i = 0; i < mainBranchCount; i++) {
  const angle = (i / mainBranchCount) * Math.PI * 2 + Math.random() * 0.3;
  const h = 3.0 + Math.random() * 4.0;
  const startP = trunkCurve.getPointAt(h / 7.5);
  const len = 3.0 + Math.random() * 2.2;

  const endP = new THREE.Vector3(
    startP.x + Math.cos(angle) * len,
    startP.y + 0.8 + Math.random() * 1.0,
    startP.z + Math.sin(angle) * len,
  );

  const midP = new THREE.Vector3().addVectors(startP, endP).multiplyScalar(0.5);
  midP.y += 0.4;

  const bCurve = new THREE.CatmullRomCurve3([startP, midP, endP]);
  const bGeo = new THREE.TubeGeometry(bCurve, 10, 0.09, 6, false);
  const bMesh = new THREE.Mesh(bGeo, trunkMat);
  treeGroup.add(bMesh);

  branchClusters.push({ center: endP, radius: 3.2 + Math.random() * 1.0 });
}

// CHERRY BLOSSOM CANOPY
const particleCount = isMobile ? 22000 : 38000;
const blossomGeo = new THREE.BufferGeometry();
const blossomPos = new Float32Array(particleCount * 3);
const blossomColors = new Float32Array(particleCount * 3);

const colorDustyPink = new THREE.Color(0xe8a2a8);
const colorSoftPink = new THREE.Color(0xf0b6bc);
const colorPaleRose = new THREE.Color(0xf7d1d5);
const colorSoftWhite = new THREE.Color(0xfdf0f2);

const clusters = [
  { center: new THREE.Vector3(0, 9.5, 0), radius: 6.2 },
  { center: new THREE.Vector3(0, 7.5, 0), radius: 7.0 },
  { center: new THREE.Vector3(0, 5.5, 0), radius: 6.0 },
  ...branchClusters,
];

for (let i = 0; i < particleCount; i++) {
  const c = clusters[Math.floor(Math.random() * clusters.length)];

  const u = Math.random();
  const r = Math.pow(u, 0.65) * c.radius;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  const x = c.center.x + r * Math.sin(phi) * Math.cos(theta);
  const y = c.center.y + r * Math.sin(phi) * Math.sin(theta) * 0.8;
  const z = c.center.z + r * Math.cos(phi);

  blossomPos[i * 3] = x;
  blossomPos[i * 3 + 1] = y;
  blossomPos[i * 3 + 2] = z;

  const heightFactor = THREE.MathUtils.clamp((y - 3) / 7, 0, 1);
  const randC = Math.random();
  let col;

  if (heightFactor < 0.3) {
    col = randC < 0.6 ? colorDustyPink : colorSoftPink;
  } else if (heightFactor < 0.7) {
    col =
      randC < 0.4
        ? colorSoftPink
        : randC < 0.8
          ? colorPaleRose
          : colorDustyPink;
  } else {
    col = randC < 0.5 ? colorSoftWhite : colorPaleRose;
  }

  blossomColors[i * 3] = col.r;
  blossomColors[i * 3 + 1] = col.g;
  blossomColors[i * 3 + 2] = col.b;
}

blossomGeo.setAttribute("position", new THREE.BufferAttribute(blossomPos, 3));
blossomGeo.setAttribute("color", new THREE.BufferAttribute(blossomColors, 3));

function createParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.4, "rgba(240,182,188,0.65)");
  grad.addColorStop(1, "rgba(240,182,188,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

const blossomMat = new THREE.PointsMaterial({
  size: isMobile ? 0.5 : 0.42,
  vertexColors: true,
  map: createParticleTexture(),
  transparent: true,
  opacity: 0.78,
  blending: THREE.NormalBlending,
  depthWrite: false,
});

const blossomParticles = new THREE.Points(blossomGeo, blossomMat);
treeGroup.add(blossomParticles);

// RABBITS (THỎ NGỌC TĂNG ĐỘNG)
function createRabbit() {
  const group = new THREE.Group();
  const rabbitMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.5,
  });

  const bodyGeo = new THREE.SphereGeometry(0.5, 12, 12);
  bodyGeo.scale(0.8, 1, 0.9);
  const bodyMesh = new THREE.Mesh(bodyGeo, rabbitMat);
  bodyMesh.position.y = 0.4;
  group.add(bodyMesh);

  const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
  const headMesh = new THREE.Mesh(headGeo, rabbitMat);
  headMesh.position.set(0, 0.85, 0.2);
  group.add(headMesh);

  const earGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.5, 8);
  const earLeft = new THREE.Mesh(earGeo, rabbitMat);
  earLeft.position.set(-0.12, 1.25, 0.18);
  earLeft.rotation.z = 0.15;
  earLeft.rotation.x = -0.1;
  group.add(earLeft);

  const earRight = earLeft.clone();
  earRight.position.x = 0.12;
  earRight.rotation.z = -0.15;
  group.add(earRight);

  return group;
}

const rabbits = [];
for (let i = 0; i < 4; i++) {
  const rabbitMesh = createRabbit();
  islandGroup.add(rabbitMesh);

  rabbits.push({
    mesh: rabbitMesh,
    orbitRadius: 2.8 + Math.random() * 3.2,
    orbitSpeed: (0.12 + Math.random() * 0.15) * (i % 2 === 0 ? 1 : -1),
    phase: (i / 4) * Math.PI * 2,
    baseY: 4.05,
    hopSpeed: 4.5 + Math.random() * 2.0,
    hopHeight: 0.15,
    scale: 0.75 + Math.random() * 0.25,
  });
  rabbits[i].mesh.scale.setScalar(rabbits[i].scale);
}

function updateRabbits(time) {
  rabbits.forEach((r) => {
    const angle = r.phase + time * r.orbitSpeed;
    const sign = Math.sign(r.orbitSpeed) || 1;

    const x = Math.cos(angle) * r.orbitRadius;
    const z = Math.sin(angle) * r.orbitRadius;
    const hop = Math.abs(Math.sin(time * r.hopSpeed)) * r.hopHeight;

    r.mesh.position.set(x, r.baseY + hop, z);

    const dx = -Math.sin(angle) * sign;
    const dz = Math.cos(angle) * sign;
    r.mesh.rotation.y = Math.atan2(dx, dz);
  });
}

// ============================================================================
// DANH SÁCH LỜI CHÚC TRUNG THU PHONG PHÚ & HÌNH ẢNH ĐƯỢC MỞ RỘNG (28 LỜI CHÚC)
// ============================================================================
const wishList = [
  {
    title: "✦ Đoàn Viên Ấm Áp ✦",
    text: "Chúc cậu và gia đình một mùa Trung Thu đoàn viên sum họp, tràn ngập tiếng cười hạnh phúc và an khang thịnh vượng!",
    img: "./assets/4.png",
    badge: "✦ Sum Vầy ✦",
  },
  {
    title: "✦ Nguyện Ước Trăng Rằm ✦",
    text: "Đêm nay trăng tròn vành vạnh giữa trời cao, cầu chúc cho mọi nguyện ước ấp ủ bấy lâu của cậu đều trở thành hiện thực rực rỡ.",
    img: "./assets/5.png",
    badge: "✦ Nguyện Ước ✦",
  },
  {
    title: "✦ Ánh Trăng Tri Kỷ ✦",
    text: "Trăng dưới nước là trăng trên trời, người trước mắt là người trong tim. Chúc cho tình cảm của chúng mình mãi luôn bền chặt và ngọt ngào.",
    img: "./assets/6.png",
    badge: "✦ Tri Kỷ ✦",
  },
  {
    title: "✦ Tâm Hồn Trong Trẻo ✦",
    text: "Chúc cậu luôn giữ mãi nụ cười hồn nhiên, trái tim trong trẻo và ngập tràn năng lượng tích cực như ánh trăng rằm mùa thu.",
    img: "./assets/7.png",
    badge: "✦ Tinh Khôi ✦",
  },
  {
    title: "✦ Vạn Sự Cát Tường ✦",
    text: "Trung Thu an lành, vạn sự như ý, công việc hanh thông, học tập thăng tiến và mỗi bước đi đều có may mắn mỉm cười!",
    img: "./assets/8.png",
    badge: "✦ May Mắn ✦",
  },
  {
    title: "✦ Đêm Trăng Ngọt Ngào ✦",
    text: "Chúc riêng cậu một đêm hội trăng rằm thật lãng mạn, nhận được thật nhiều yêu thương và những điều bất ngờ ngọt lịm.",
    img: "./assets/9.png",
    badge: "✦ Ngọt Ngào ✦",
  },
  {
    title: "✦ Bình An Thư Thái ✦",
    text: "Sức khỏe dồi dào, thân tâm an lạc, miệng luôn nở nụ cười rạng rỡ, mọi muộn phiền tan biến theo làn gió thu mát lành.",
    img: "./assets/1.jpg",
    badge: "✦ An Nhiên ✦",
  },
  {
    title: "✦ Hương Sắc Mùa Thu ✦",
    text: "Bánh dẻo ngọt bùi, bánh nướng thơm lừng, trà sen ấm áp. Chúc cuộc sống của cậu luôn thi vị và đong đầy dư vị ngọt ngào!",
    img: "./assets/2.jpg",
    badge: "✦ Thi Vị ✦",
  },
  {
    title: "✦ Hoa Đăng Thắp Sáng ✦",
    text: "Mỗi chiếc đèn lồng thả lên trời cao mang theo ngàn lời chúc tốt lành nhất dành tặng cậu: Luôn được chở che và yêu thương trọn vẹn.",
    img: "./assets/3.jpg",
    badge: "✦ Thắp Sáng ✦",
  },
  {
    title: "✦ Nụ Cười Toả Nắng ✦",
    text: "Gửi đến cậu vạn vì sao lấp lánh trên dải ngân hà: Chúc cậu mỗi ngày thức dậy đều tràn ngập niềm vui và yêu đời thiết tha!",
    img: "./assets/4.png",
    badge: "✦ Rạng Rỡ ✦",
  },
  {
    title: "✦ Duyên Lành Tương Phùng ✦",
    text: "Gặp được cậu giữa nhân gian rộng lớn là một điều diệu kỳ. Cảm ơn cậu đã xuất hiện và thắp sáng những khoảnh khắc dịu dàng nhất.",
    img: "./assets/5.png",
    badge: "✦ Yêu Thương ✦",
  },
  {
    title: "✦ Vững Bước Tương Lai ✦",
    text: "Chúc cậu luôn có đủ dũng khí để chạm tới ước mơ, có đủ kiên định để vượt qua thử thách và luôn tự hào về chính bản thân mình.",
    img: "./assets/6.png",
    badge: "✦ Tự Tin ✦",
  },
  {
    title: "✦ Giấc Mơ Bình Yên ✦",
    text: "Ánh trăng vàng dịu dắt lối yêu thương, ru êm giấc ngủ đêm rằm. Chúc cậu luôn có những giấc mơ tuyệt đẹp và thức dậy với nụ cười.",
    img: "./assets/7.png",
    badge: "✦ Yên Bình ✦",
  },
  {
    title: "✦ Hội Trăng Rộn Rã ✦",
    text: "Gió thu mơn man, hương hoa cúc thoảng đưa, chúc cậu có một mùa lễ hội rực rỡ sắc màu, cùng bạn bè phá cỗ rộn rã tiếng cười!",
    img: "./assets/8.png",
    badge: "✦ Phá Cỗ ✦",
  },
  {
    title: "✦ Khoảnh Khắc Giản Dị ✦",
    text: "Dù cuộc sống ngoài kia có hối hả, mong cậu vẫn luôn tìm thấy sự bình yên, ấm áp trong từng khoảnh khắc giản dị bên người thương.",
    img: "./assets/9.png",
    badge: "✦ Ấm Áp ✦",
  },
  {
    title: "✦ May Mắn Nhân Đôi ✦",
    text: "Chúc cậu tiền tài như ý, may mắn gõ cửa mỗi ngày, gặp gỡ toàn những người chân thành và luôn được chở che trong sự dịu dàng.",
    img: "./assets/1.jpg",
    badge: "✦ Cát Tường ✦",
  },
  {
    title: "✦ Kỷ Niệm Thơ Ngây ✦",
    text: "Nhớ về tuổi thơ rước đèn ông sao, chúc cậu mãi giữ được sự hồn nhiên, tinh khôi và trái tim luôn biết rung cảm trước cái đẹp.",
    img: "./assets/2.jpg",
    badge: "✦ Tuổi Thơ ✦",
  },
  {
    title: "✦ Thảnh Thơi Tự Tại ✦",
    text: "Mong cậu như vầng trăng rằm trên đỉnh non cao: luôn tỏa sáng tĩnh lặng, an nhiên tự tại, chẳng bận lòng bởi những bụi trần.",
    img: "./assets/3.jpg",
    badge: "✦ Tự Tại ✦",
  },
  {
    title: "✦ Ngọn Lửa Hy Vọng ✦",
    text: "Hãy để ánh nến lung linh trong lồng đèn xua tan đi mọi âu lo, thắp sáng niềm tin và mở lối cho những điều kỳ diệu ghé thăm cậu.",
    img: "./assets/4.png",
    badge: "✦ Niềm Tin ✦",
  },
  {
    title: "✦ Hạnh Phúc Đong Đầy ✦",
    text: "Chúc cậu một mùa trăng bội thu nụ cười, ấm áp vòng tay bè bạn và ngập tràn hạnh phúc trong từng hơi thở của mùa thu.",
    img: "./assets/5.png",
    badge: "✦ Hạnh Phúc ✦",
  },
  {
    title: "✦ Ánh Sáng Kỳ Diệu ✦",
    text: "Trời thu biếc, trăng thu sáng, chúc cậu vạn điều may mắn, triệu niềm vui bất ngờ và tỷ sự hanh thông rạng ngời!",
    img: "./assets/6.png",
    badge: "✦ Rạng Ngời ✦",
  },
  {
    title: "✦ Chân Tình Dưới Trăng ✦",
    text: "Mong rằng năm tháng có đổi thay, cậu vẫn luôn là người đáng yêu nhất, được trân trọng và nâng niu như báu vật quý giá.",
    img: "./assets/7.png",
    badge: "✦ Trân Quý ✦",
  },
  {
    title: "✦ Tỏa Sáng Độc Bản ✦",
    text: "Cậu sinh ra là để tỏa sáng theo cách riêng của mình. Hãy tự tin sải bước và đón nhận mùa Trung Thu rực rỡ nhất nhé!",
    img: "./assets/8.png",
    badge: "✦ Toả Sáng ✦",
  },
  {
    title: "✦ Bến Đỗ Bình Yên ✦",
    text: "Không cầu mong cuộc đời không giông bão, chỉ chúc cậu qua bao thăng trầm vẫn luôn mỉm cười an yên và có chốn về bình yên.",
    img: "./assets/9.png",
    badge: "✦ Che Chở ✦",
  },
  {
    title: "✦ Đoàn Tụ Sum Vầy ✦",
    text: "Tết Trung Thu là tết đoàn viên, mong cho những ai xa quê đều tìm về bến đỗ ấm áp, sum họp cùng những người thương yêu nhất.",
    img: "./assets/1.jpg",
    badge: "✦ Đoàn Viên ✦",
  },
  {
    title: "✦ Khắc Ghi Kỷ Niệm ✦",
    text: "Hương hoa sữa thoang thoảng, ánh trăng vàng lung linh, chúc cậu có một đêm hội trăng rằm thật đáng nhớ và ngập tràn cảm xúc.",
    img: "./assets/2.jpg",
    badge: "✦ Kỷ Niệm ✦",
  },
  {
    title: "✦ Ước Nguyện Bay Xa ✦",
    text: "Thả một lời chúc lên trời đêm bao la, mong mọi điều tốt đẹp nhất trong vũ trụ này sẽ luôn tìm đến và ở lại bên cạnh cậu.",
    img: "./assets/3.jpg",
    badge: "✦ Hy Vọng ✦",
  },
  {
    title: "✦ Vẹn Tròn Hạnh Phúc ✦",
    text: "Trăng tròn là lúc sum vầy, chúc cuộc sống của cậu mãi vẹn tròn như ánh trăng rằm tháng Tám, rạng rỡ và tràn đầy tình yêu!",
    img: "./assets/4.png",
    badge: "✦ Viên Mãn ✦",
  },
];

// ============================================================================
// HỆ THỐNG LỒNG ĐÈN 3D CAO CẤP VỚI HÌNH ẢNH & HIỆU ỨNG LUNG LINH
// ============================================================================
const lanternsGroup = new THREE.Group();
scene.add(lanternsGroup);

const lanterns = [];
const interactiveObjects = [];

// Hàm lấy URI ảnh (Ưu tiên Base64 từ TEXTURES_DATA để vượt qua rào cản CORS của file://)
function getImageUri(imgSrc, id) {
  if (typeof TEXTURES_DATA !== "undefined") {
    const num = ((id !== undefined ? id : 0) % 9) + 1;
    if (TEXTURES_DATA["img" + num]) {
      return TEXTURES_DATA["img" + num];
    }
  }
  return imgSrc;
}

const lanternTextureCache = {};

function createIlluminatedLanternTexture(imgSrc, id) {
  const cacheKey = imgSrc + "_" + (id % 9);
  if (lanternTextureCache[cacheKey]) {
    return lanternTextureCache[cacheKey];
  }

  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");

  function drawLanternBackground() {
    ctx.clearRect(0, 0, 384, 384);

    // Gradient giấy lụa đỏ thắm - vàng cam ấm
    const bgGrad = ctx.createRadialGradient(192, 192, 30, 192, 192, 220);
    bgGrad.addColorStop(0, "#ffe8a3");
    bgGrad.addColorStop(0.35, "#ff9e1b");
    bgGrad.addColorStop(0.7, "#d90429");
    bgGrad.addColorStop(1, "#6a040f");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 384, 384);

    // Họa tiết viền chỉ vàng cổ điển
    ctx.strokeStyle = "rgba(255, 223, 0, 0.85)";
    ctx.lineWidth = 5;
    ctx.strokeRect(12, 12, 360, 360);

    ctx.strokeStyle = "rgba(255, 235, 120, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 344, 344);

    // Khung tròn trung tâm phát sáng
    ctx.save();
    ctx.strokeStyle = "rgba(255, 215, 0, 0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(192, 192, 150, 0, Math.PI * 2);
    ctx.stroke();

    // Hào quang nến bên trong
    const innerCandle = ctx.createRadialGradient(192, 192, 0, 192, 192, 150);
    innerCandle.addColorStop(0, "rgba(255, 255, 240, 0.7)");
    innerCandle.addColorStop(0.5, "rgba(255, 210, 80, 0.35)");
    innerCandle.addColorStop(1, "rgba(255, 100, 0, 0)");
    ctx.fillStyle = innerCandle;
    ctx.beginPath();
    ctx.arc(192, 192, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawLanternBackground();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);

  // Tải hình ảnh thật vào texture (Sử dụng Base64 data URI)
  const imgUri = getImageUri(imgSrc, id);
  const img = new Image();

  // Không đặt crossOrigin khi dùng Data URI hoặc giao thức file: để tránh lỗi CORS
  if (!imgUri.startsWith("data:") && window.location.protocol !== "file:") {
    img.crossOrigin = "anonymous";
  }

  function renderImageOnCanvas() {
    drawLanternBackground();

    ctx.save();
    ctx.beginPath();
    ctx.arc(192, 192, 142, 0, Math.PI * 2);
    ctx.clip();

    const minDim = Math.min(img.width, img.height);
    const sx = (img.width - minDim) / 2;
    const sy = (img.height - minDim) / 2;
    ctx.drawImage(img, sx, sy, minDim, minDim, 50, 50, 284, 284);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(192, 192, 142, 0, Math.PI * 2);
    ctx.stroke();

    const cornerSize = 36;
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(16, 16, cornerSize, 6);
    ctx.fillRect(16, 16, 6, cornerSize);
    ctx.fillRect(368 - cornerSize, 16, cornerSize, 6);
    ctx.fillRect(362, 16, 6, cornerSize);
    ctx.fillRect(16, 368 - cornerSize, 6, cornerSize);
    ctx.fillRect(16, 362, cornerSize, 6);
    ctx.fillRect(368 - cornerSize, 362, cornerSize, 6);
    ctx.fillRect(362, 368 - cornerSize, 6, cornerSize);
    ctx.restore();

    texture.needsUpdate = true;
  }

  img.onload = renderImageOnCanvas;
  img.src = imgUri;

  if (img.complete && img.naturalWidth > 0) {
    renderImageOnCanvas();
  }

  lanternTextureCache[cacheKey] = texture;
  return texture;
}

// Hào quang nến lung linh
function createLanternGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 250, 220, 0.95)");
  grad.addColorStop(0.3, "rgba(255, 170, 40, 0.65)");
  grad.addColorStop(0.65, "rgba(230, 57, 70, 0.25)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

const lanternGlowTex = createLanternGlowTexture();

const goldLanternMat = new THREE.MeshStandardMaterial({
  color: 0xffd700,
  metalness: 0.8,
  roughness: 0.25,
  emissive: 0x553300,
  emissiveIntensity: 0.2,
});

// Mô hình lồng đèn Lục Giác Cung Đình
function createDetailedLanternMesh(imgSrc, id) {
  const group = new THREE.Group();

  // A. Thân lồng đèn phát sáng ép lụa
  const lanternTex = createIlluminatedLanternTexture(imgSrc, id);
  const bodyGeo = new THREE.CylinderGeometry(0.72, 0.58, 1.55, 6, 1, false);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: lanternTex,
    emissive: 0xff8811,
    emissiveIntensity: 0.85,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // B. Khung cột mạ vàng 6 góc
  const ribGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.58, 6);
  for (let r = 0; r < 6; r++) {
    const ribAngle = (r / 6) * Math.PI * 2;
    const ribMesh = new THREE.Mesh(ribGeo, goldLanternMat);
    const rx = Math.cos(ribAngle) * 0.65;
    const rz = Math.sin(ribAngle) * 0.65;
    ribMesh.position.set(rx, 0, rz);
    group.add(ribMesh);
  }

  // C. Mái ngói cong cổ điển
  const roofTier1Geo = new THREE.CylinderGeometry(0.85, 0.74, 0.12, 6);
  const roofTier1 = new THREE.Mesh(roofTier1Geo, goldLanternMat);
  roofTier1.position.y = 0.82;
  group.add(roofTier1);

  const roofTier2Geo = new THREE.ConeGeometry(0.78, 0.35, 6);
  const roofTier2 = new THREE.Mesh(roofTier2Geo, goldLanternMat);
  roofTier2.position.y = 1.02;
  group.add(roofTier2);

  const topFinialGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const topFinial = new THREE.Mesh(topFinialGeo, goldLanternMat);
  topFinial.position.y = 1.25;
  group.add(topFinial);

  const topRingGeo = new THREE.TorusGeometry(0.1, 0.025, 8, 16);
  const topRing = new THREE.Mesh(topRingGeo, goldLanternMat);
  topRing.position.y = 1.38;
  group.add(topRing);

  // D. Bệ đáy dưới
  const baseTierGeo = new THREE.CylinderGeometry(0.62, 0.76, 0.12, 6);
  const baseTier = new THREE.Mesh(baseTierGeo, goldLanternMat);
  baseTier.position.y = -0.82;
  group.add(baseTier);

  const bottomFinialGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const bottomFinial = new THREE.Mesh(bottomFinialGeo, goldLanternMat);
  bottomFinial.position.y = -0.92;
  group.add(bottomFinial);

  // E. Tua rua đung đưa theo gió
  const tasselGroup = new THREE.Group();
  tasselGroup.position.set(0, -0.96, 0);

  const beadGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const beadMat = new THREE.MeshStandardMaterial({
    color: 0xd90429,
    roughness: 0.2,
  });
  const beadMesh = new THREE.Mesh(beadGeo, beadMat);
  beadMesh.position.y = -0.1;
  tasselGroup.add(beadMesh);

  const fringeGeo = new THREE.CylinderGeometry(0.07, 0.14, 0.75, 8);
  const fringeMat = new THREE.MeshStandardMaterial({
    color: 0xc1121f,
    roughness: 0.6,
  });
  const fringeMesh = new THREE.Mesh(fringeGeo, fringeMat);
  fringeMesh.position.y = -0.52;
  tasselGroup.add(fringeMesh);

  const tagGeo = new THREE.PlaneGeometry(0.25, 0.65);
  const tagMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    side: THREE.DoubleSide,
  });
  const tag = new THREE.Mesh(tagGeo, tagMat);
  tag.position.set(0, -0.65, 0);
  tasselGroup.add(tag);

  group.add(tasselGroup);

  // F. Ngọn nến thắp sáng bên trong
  const flameGeo = new THREE.SphereGeometry(0.14, 8, 8);
  flameGeo.scale(0.8, 1.4, 0.8);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xfffae0,
  });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.y = -0.1;
  group.add(flame);

  // G. Hào quang lung linh
  const spriteMat = new THREE.SpriteMaterial({
    map: lanternGlowTex,
    color: 0xffc436,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Sprite(spriteMat);
  glow.scale.set(3.8, 3.8, 1);
  group.add(glow);

  // H. Vùng tương tác
  const hitGeo = new THREE.SphereGeometry(1.9, 8, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  group.add(hitMesh);

  return {
    group,
    hitMesh,
    glow,
    flame,
    tasselGroup,
    bodyMat,
  };
}

// Khởi tạo các lồng đèn rải rác
const lanternCount = isMobile ? 24 : 36;
for (let i = 0; i < lanternCount; i++) {
  const wishData = wishList[i % wishList.length];
  const imgSrc = wishData.img;

  const lanternObj = createDetailedLanternMesh(imgSrc, i);
  const lantern = lanternObj.group;

  const radius = 9.5 + Math.random() * 26;
  const angle = Math.random() * Math.PI * 2;
  const y = -1.5 + Math.random() * 32;

  lantern.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

  lantern.userData = {
    speedY: 0.009 + Math.random() * 0.013,
    swingSpeed: 0.75 + Math.random() * 1.1,
    initialX: lantern.position.x,
    initialZ: lantern.position.z,
    wish: wishData.text,
    wishTitle: wishData.title,
    badge: wishData.badge,
    imgUrl: wishData.img,
    id: i,
    glowSprite: lanternObj.glow,
    flameMesh: lanternObj.flame,
    tasselGroup: lanternObj.tasselGroup,
    bodyMat: lanternObj.bodyMat,
  };

  const sc = 0.8 + Math.random() * 0.45;
  lantern.scale.set(sc, sc, sc);

  lanternObj.hitMesh.userData.parentLantern = lantern;

  lanternsGroup.add(lantern);
  lanterns.push(lantern);
  interactiveObjects.push(lanternObj.hitMesh);
}

// ============================================================================
// CÁNH HOA ĐÀO RƠI & SAO ĐÊM
// ============================================================================
const fallingPetalsCount = isMobile ? 90 : 180;
const petalsGeo = new THREE.BufferGeometry();
const petalsPos = new Float32Array(fallingPetalsCount * 3);
const petalsData = [];

for (let i = 0; i < fallingPetalsCount; i++) {
  petalsPos[i * 3] = (Math.random() - 0.5) * 38;
  petalsPos[i * 3 + 1] = Math.random() * 36;
  petalsPos[i * 3 + 2] = (Math.random() - 0.5) * 38;

  petalsData.push({
    speedY: 0.02 + Math.random() * 0.03,
  });
}

petalsGeo.setAttribute("position", new THREE.BufferAttribute(petalsPos, 3));
const petalsMat = new THREE.PointsMaterial({
  size: isMobile ? 0.35 : 0.3,
  color: 0xf7d1d5,
  transparent: true,
  opacity: 0.78,
  map: createParticleTexture(),
  blending: THREE.NormalBlending,
  depthWrite: false,
});

const petalsParticles = new THREE.Points(petalsGeo, petalsMat);
scene.add(petalsParticles);

// ============================================================================
// HỆ THỐNG NGÔI SAO SÁNG LẤP LÁNH & SAO BĂNG TRÊN BẦU TRỜI ĐÊM (BRIGHT STARS)
// ============================================================================

// 1. Texture ngôi sao 4 cánh phát sáng lấp lánh (Sparkling Star Canvas)
function createSparkleStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  // Hào quang tỏa tròn
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.18, "rgba(255, 245, 190, 0.9)");
  grad.addColorStop(0.45, "rgba(255, 215, 110, 0.45)");
  grad.addColorStop(0.8, "rgba(200, 160, 255, 0.12)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  // Tia sao 4 cánh lấp lánh (4-point Diamond Sparkle)
  ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
  ctx.beginPath();
  ctx.moveTo(32, 28);
  ctx.lineTo(62, 32);
  ctx.lineTo(32, 36);
  ctx.lineTo(2, 32);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(28, 32);
  ctx.lineTo(32, 2);
  ctx.lineTo(36, 32);
  ctx.lineTo(32, 62);
  ctx.closePath();
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

const sparkleStarTex = createSparkleStarTexture();

// 2. Tầng 1: Các Ngôi Sao Lớn Phát Sáng & Nhấp Nháy (Bright Sparkling Stars)
const brightStarCount = isMobile ? 220 : 380;
const brightStarGeo = new THREE.BufferGeometry();
const brightStarPos = new Float32Array(brightStarCount * 3);
const brightStarColors = new Float32Array(brightStarCount * 3);
const brightStarBaseColors = [];
const brightStarTwinkleData = [];

const starPalettes = [
  new THREE.Color(0xffffff), // Trắng kim cương
  new THREE.Color(0xfff3b0), // Vàng kim tinh khôi
  new THREE.Color(0xffd700), // Hoàng kim rực rỡ
  new THREE.Color(0xffccd5), // Hồng ngọc mùa thu
  new THREE.Color(0xcbe3fb), // Xanh băng dạ quang
];

for (let i = 0; i < brightStarCount; i++) {
  // Phân bổ trên vòm trời cao 360 độ
  const radius = 70 + Math.random() * 85;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(0.08 + Math.random() * 0.92);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi) + 4;
  const z = radius * Math.sin(phi) * Math.sin(theta);

  brightStarPos[i * 3] = x;
  brightStarPos[i * 3 + 1] = y;
  brightStarPos[i * 3 + 2] = z;

  const col = starPalettes[Math.floor(Math.random() * starPalettes.length)];
  brightStarBaseColors.push(col.clone());

  brightStarColors[i * 3] = col.r;
  brightStarColors[i * 3 + 1] = col.g;
  brightStarColors[i * 3 + 2] = col.b;

  brightStarTwinkleData.push({
    speed: 1.5 + Math.random() * 3.5,
    phase: Math.random() * Math.PI * 2,
  });
}

brightStarGeo.setAttribute("position", new THREE.BufferAttribute(brightStarPos, 3));
brightStarGeo.setAttribute("color", new THREE.BufferAttribute(brightStarColors, 3));

const brightStarMat = new THREE.PointsMaterial({
  size: isMobile ? 1.45 : 1.85,
  map: sparkleStarTex,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
scene.add(new THREE.Points(brightStarGeo, brightStarMat));

// 3. Tầng 2: Dải Ngân Hà Sao Nền Dày Đặc (Deep Cosmic Starfield)
const deepStarCount = isMobile ? 1200 : 2400;
const deepStarGeo = new THREE.BufferGeometry();
const deepStarPos = new Float32Array(deepStarCount * 3);
for (let i = 0; i < deepStarCount; i++) {
  const r = 85 + Math.random() * 95;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(-0.2 + Math.random() * 1.2);

  deepStarPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  deepStarPos[i * 3 + 1] = r * Math.cos(phi) + 2;
  deepStarPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}
deepStarGeo.setAttribute("position", new THREE.BufferAttribute(deepStarPos, 3));
const deepStarMat = new THREE.PointsMaterial({
  color: 0xfffaea,
  size: isMobile ? 0.48 : 0.6,
  transparent: true,
  opacity: 0.85,
});
scene.add(new THREE.Points(deepStarGeo, deepStarMat));

// 4. Tầng 3: Sao Băng Vụt Qua Bầu Trời Đêm (Shooting Stars)
const shootingStars = [];
let nextShootingStarTime = 2.5;

function spawnShootingStar() {
  const pCount = 16;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(pCount * 3);
  const col = new Float32Array(pCount * 3);

  const startX = (Math.random() - 0.5) * 80 + 15;
  const startY = 32 + Math.random() * 18;
  const startZ = -35 - Math.random() * 35;

  const dir = new THREE.Vector3(-1.8, -0.9, 0.4).normalize();
  const speed = 70 + Math.random() * 40;

  for (let i = 0; i < pCount; i++) {
    pos[i * 3] = startX;
    pos[i * 3 + 1] = startY;
    pos[i * 3 + 2] = startZ;

    const alpha = 1.0 - (i / pCount);
    col[i * 3] = 1.0 * alpha;
    col[i * 3 + 1] = 0.95 * alpha;
    col[i * 3 + 2] = 0.8 * alpha;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

  const mat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });

  const line = new THREE.Line(geo, mat);
  scene.add(line);

  shootingStars.push({
    line,
    head: new THREE.Vector3(startX, startY, startZ),
    dir,
    speed,
    life: 1.1,
    pCount,
  });
}

function updateShootingStars(delta, time) {
  if (time > nextShootingStarTime) {
    spawnShootingStar();
    nextShootingStarTime = time + 4.0 + Math.random() * 4.5;
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const s = shootingStars[i];
    s.life -= delta * 1.25;
    s.head.addScaledVector(s.dir, s.speed * delta);

    const pos = s.line.geometry.attributes.position.array;
    for (let j = s.pCount - 1; j > 0; j--) {
      pos[j * 3] = pos[(j - 1) * 3];
      pos[j * 3 + 1] = pos[(j - 1) * 3 + 1];
      pos[j * 3 + 2] = pos[(j - 1) * 3 + 2];
    }
    pos[0] = s.head.x;
    pos[1] = s.head.y;
    pos[2] = s.head.z;

    s.line.geometry.attributes.position.needsUpdate = true;
    s.line.material.opacity = Math.max(0, s.life);

    if (s.life <= 0) {
      scene.remove(s.line);
      s.line.geometry.dispose();
      s.line.material.dispose();
      shootingStars.splice(i, 1);
    }
  }
}

// ============================================================================
// HIỆU ỨNG PHÁO HOA KHI CHẠM VÀO ĐÈN
// ============================================================================
let fireworks = [];
function createFirework(pos) {
  const pCount = 65;
  const pGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(pCount * 3);
  const pColors = new Float32Array(pCount * 3);
  const velocities = [];

  const fwColors = [
    new THREE.Color(0xffd700),
    new THREE.Color(0xff4d6d),
    new THREE.Color(0xffb703),
    new THREE.Color(0xffe5b4),
  ];

  for (let i = 0; i < pCount; i++) {
    pPositions[i * 3] = pos.x;
    pPositions[i * 3 + 1] = pos.y;
    pPositions[i * 3 + 2] = pos.z;

    const chosenColor = fwColors[Math.floor(Math.random() * fwColors.length)];
    pColors[i * 3] = chosenColor.r;
    pColors[i * 3 + 1] = chosenColor.g;
    pColors[i * 3 + 2] = chosenColor.b;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.09 + Math.random() * 0.14;

    velocities.push(
      new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi),
      ),
    );
  }

  pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.38,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const pMesh = new THREE.Points(pGeo, pMat);
  scene.add(pMesh);

  fireworks.push({ mesh: pMesh, velocities: velocities, life: 1.0 });
}

// ============================================================================
// HỆ THỐNG ÂM NHẠC TỰ ĐỘNG PHÁT (AUTOPLAY SYSTEM)
// ============================================================================
const bgm = document.getElementById("bgm");
const audioBtn = document.getElementById("audio-btn");
const audioHintToast = document.getElementById("audioHintToast");
let isAudioPlaying = false;
let hasUserInteracted = false;

function updateAudioUI(playing) {
  isAudioPlaying = playing;
  if (playing) {
    audioBtn.classList.add("playing");
    audioBtn.innerHTML =
      '<i class="fas fa-volume-up"></i><span class="music-wave" id="musicWave"><span></span><span></span><span></span></span>';
    audioBtn.setAttribute("title", "Tạm dừng nhạc");
    if (audioHintToast) {
      audioHintToast.classList.remove("show");
    }
  } else {
    audioBtn.classList.remove("playing");
    audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    audioBtn.setAttribute("title", "Bật nhạc Trung Thu");
  }
}

function startBackgroundMusic() {
  if (!bgm) return;
  bgm.volume = 0.85;

  const playPromise = bgm.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        updateAudioUI(true);
        removeUnlockEvents();
      })
      .catch((err) => {
        console.log("Autoplay waiting for user gesture:", err);
        if (!hasUserInteracted && audioHintToast) {
          setTimeout(() => {
            if (!isAudioPlaying) {
              audioHintToast.classList.add("show");
            }
          }, 600);
        }
      });
  }
}

startBackgroundMusic();
window.addEventListener("load", startBackgroundMusic);
document.addEventListener("DOMContentLoaded", startBackgroundMusic);

function handleFirstInteraction() {
  hasUserInteracted = true;
  if (!isAudioPlaying) {
    startBackgroundMusic();
  }
}

const unlockEvents = ["pointerdown", "touchstart", "click", "keydown", "wheel"];
function addUnlockEvents() {
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleFirstInteraction, {
      capture: true,
      passive: true,
    });
  });
}

function removeUnlockEvents() {
  unlockEvents.forEach((evt) => {
    window.removeEventListener(evt, handleFirstInteraction, { capture: true });
  });
}
addUnlockEvents();

audioBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (isAudioPlaying) {
    bgm.pause();
    updateAudioUI(false);
  } else {
    bgm.play().then(() => updateAudioUI(true)).catch(() => {});
  }
});

// ============================================================================
// TƯƠNG TÁC CHẠM LỒNG ĐÈN & MODAL LỜI CHÚC
// ============================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// ============================================================================
// HỆ THỐNG TÙY BIẾN TÊN NGƯỜI NHẬN LỜI CHÚC (RECIPIENT CUSTOMIZATION)
// ============================================================================
let recipientName = localStorage.getItem("trungThuRecipient") || "Cậu";

const welcomeModal = document.getElementById("welcomeModal");
const welcomeForm = document.getElementById("welcomeForm");
const userNameInput = document.getElementById("userNameInput");
const startAppBtn = document.getElementById("startAppBtn");
const skipNameBtn = document.getElementById("skipNameBtn");
const nameBtn = document.getElementById("name-btn");
const clickHint = document.getElementById("clickHint");

function updateRecipientName(newName) {
  recipientName = newName && newName.trim() ? newName.trim() : "Cậu";
  localStorage.setItem("trungThuRecipient", recipientName);

  if (clickHint) {
    clickHint.innerHTML = `<span>🏮 Chạm vào lồng đèn để xem lời chúc gửi ${recipientName} lung linh 🏮</span>`;
  }
}

if (userNameInput && recipientName !== "Cậu") {
  userNameInput.value = recipientName;
}

updateRecipientName(recipientName);

function startExperience() {
  if (userNameInput) {
    updateRecipientName(userNameInput.value);
  }
  if (welcomeModal) {
    welcomeModal.classList.remove("active");
  }
  createFirework(new THREE.Vector3(0, 10, 0));
  setTimeout(() => createFirework(new THREE.Vector3(4, 12, -4)), 200);
  setTimeout(() => createFirework(new THREE.Vector3(-4, 11, -3)), 400);

  startBackgroundMusic();
}

if (welcomeForm) {
  welcomeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    startExperience();
  });
}

if (startAppBtn) {
  startAppBtn.addEventListener("click", (e) => {
    e.preventDefault();
    startExperience();
  });
}

if (skipNameBtn) {
  skipNameBtn.addEventListener("click", (e) => {
    e.preventDefault();
    updateRecipientName("Cậu");
    if (welcomeModal) welcomeModal.classList.remove("active");
    startBackgroundMusic();
  });
}

if (nameBtn) {
  nameBtn.addEventListener("click", () => {
    if (welcomeModal) {
      if (userNameInput) {
        userNameInput.value = recipientName !== "Cậu" ? recipientName : "";
      }
      welcomeModal.classList.add("active");
      setTimeout(() => userNameInput && userNameInput.focus(), 300);
    }
  });
}

// Hàm thay thế đại từ xưng hô "cậu/Cậu" nghệ thuật và mượt mà
function formatWishText(text, name) {
  if (!text) return "";
  const n = (name || "Cậu").trim();
  if (n === "Cậu" || n === "cậu") return text;

  let res = text;
  res = res.replace(/Chúc cậu/g, "Chúc " + n);
  res = res.replace(/chúc cậu/g, "chúc " + n);
  res = res.replace(/Mong cậu/g, "Mong " + n);
  res = res.replace(/mong cậu/g, "mong " + n);
  res = res.replace(/Gửi đến cậu/g, "Gửi đến " + n);
  res = res.replace(/gửi đến cậu/g, "gửi đến " + n);
  res = res.replace(/Gặp được cậu/g, "Gặp được " + n);
  res = res.replace(/gặp được cậu/g, "gặp được " + n);
  res = res.replace(/Cậu sinh ra/g, n + " sinh ra");
  res = res.replace(/cậu sinh ra/g, n + " sinh ra");
  res = res.replace(/ở lại bên cạnh cậu/g, "ở lại bên cạnh " + n);
  res = res.replace(/bên cạnh cậu/g, "bên cạnh " + n);
  res = res.replace(/cho cậu/g, "cho " + n);
  res = res.replace(/tới cậu/g, "tới " + n);
  res = res.replace(/về cậu/g, "về " + n);
  res = res.replace(/với cậu/g, "với " + n);
  res = res.replace(/của cậu/g, "của " + n);
  res = res.replace(/riêng cậu/g, "riêng " + n);
  res = res.replace(/dành tặng cậu/g, "dành tặng " + n);
  res = res.replace(/ghé thăm cậu/g, "ghé thăm " + n);
  res = res.replace(/dõi theo cậu/g, "dõi theo " + n);
  res = res.replace(/yêu thương cậu/g, "yêu thương " + n);
  res = res.replace(/nhường cho cậu/g, "nhường cho " + n);
  res = res.replace(/trong lòng cậu/g, "trong lòng " + n);
  res = res.replace(/con đường cậu đi/g, "con đường " + n + " đi");
  res = res.replace(/\bcậu\b/gi, n);
  return res;
}

let cameraTransition = null;
let selectedLantern = null;
let currentWishIndex = 0;

function animateCameraTo(targetPosition, targetLookAt, duration = 800) {
  cameraTransition = {
    startTime: performance.now(),
    duration: duration,
    startPos: camera.position.clone(),
    endPos: targetPosition.clone(),
    startLook: controls.target.clone(),
    endLook: targetLookAt.clone(),
  };
}

function stopCameraTransition() {
  cameraTransition = null;
}

// Bắt đầu thao tác xoay chuột hoặc ngón tay -> Hủy ngay mọi chuyển động tự động của Camera để người dùng quay tự do 360 độ
controls.addEventListener("start", stopCameraTransition);
window.addEventListener("pointerdown", stopCameraTransition, { passive: true });

const wishModal = document.getElementById("wishModal");
const wishTitle = document.getElementById("wishTitle");
const wishTag = document.getElementById("wishTag");
const wishText = document.getElementById("wishText");
const wishImage = document.getElementById("wishImage");
const imageBadge = document.getElementById("imageBadge");
const closeWishBtn = document.getElementById("closeWishBtn");
const resetCamBtn = document.getElementById("reset-cam-btn");

let pointerDownPos = { x: 0, y: 0 };

function onPointerDown(event) {
  pointerDownPos.x =
    event.clientX || (event.touches && event.touches[0].clientX) || 0;
  pointerDownPos.y =
    event.clientY || (event.touches && event.touches[0].clientY) || 0;
}

function displayWishAtIndex(index) {
  currentWishIndex = (index + wishList.length) % wishList.length;
  const wish = wishList[currentWishIndex];

  wishTitle.textContent = "Thông Điệp Gửi " + recipientName;
  wishTag.textContent = wish.badge || "✦ Trung Thu An Lành ✦";
  wishText.textContent = `"${formatWishText(wish.text, recipientName)}"`;

  const imgNum = (currentWishIndex % 9) + 1;
  const imgSrc =
    typeof TEXTURES_DATA !== "undefined" && TEXTURES_DATA["img" + imgNum]
      ? TEXTURES_DATA["img" + imgNum]
      : wish.img;
  wishImage.src = imgSrc;

  if (imageBadge) {
    imageBadge.textContent = `${currentWishIndex + 1} / ${wishList.length}`;
  }
}

let savedCamPos = null;
let savedCamTarget = null;

function onPointerUp(event) {
  if (
    event.target.closest(".top-bar") ||
    event.target.closest(".wish-modal") ||
    event.target.closest(".welcome-modal") ||
    event.target.closest(".audio-hint-toast")
  ) {
    return;
  }

  const clientX =
    event.clientX ||
    (event.changedTouches && event.changedTouches[0].clientX) ||
    0;
  const clientY =
    event.clientY ||
    (event.changedTouches && event.changedTouches[0].clientY) ||
    0;

  const distMoved = Math.hypot(
    clientX - pointerDownPos.x,
    clientY - pointerDownPos.y,
  );
  if (distMoved > 8) return;

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, false);

  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    selectedLantern = hitMesh.userData.parentLantern || hitMesh.parent;
    const lPos = selectedLantern.position;

    // Lưu lại vị trí góc nhìn của người dùng trước khi zoom vào đèn lồng
    savedCamPos = camera.position.clone();
    savedCamTarget = controls.target.clone();

    createFirework(lPos);

    const offset = new THREE.Vector3()
      .subVectors(camera.position, lPos)
      .normalize()
      .multiplyScalar(6.0);
    const targetPos = new THREE.Vector3().addVectors(lPos, offset);
    const targetLook = lPos.clone();

    animateCameraTo(targetPos, targetLook, 800);

    const lanternId = selectedLantern.userData.id;
    displayWishAtIndex(lanternId % wishList.length);

    setTimeout(() => {
      wishModal.classList.add("active");
    }, 280);
  }
}

window.addEventListener("pointerdown", onPointerDown, { passive: true });
window.addEventListener("pointerup", onPointerUp, { passive: true });

function resetCamera() {
  animateCameraTo(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET, 800);
  selectedLantern = null;
  savedCamPos = null;
  savedCamTarget = null;
}

resetCamBtn.addEventListener("click", () => {
  resetCamera();
});

function closeWishCard(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  wishModal.classList.remove("active");

  // Tự động lùi góc nhìn camera quay trở lại vị trí ngắm cảnh ban đầu một cách mượt mà
  const backCamPos = savedCamPos ? savedCamPos.clone() : DEFAULT_CAM_POS.clone();
  const backCamLook = savedCamTarget ? savedCamTarget.clone() : DEFAULT_CAM_TARGET.clone();
  animateCameraTo(backCamPos, backCamLook, 850);

  selectedLantern = null;
  savedCamPos = null;
  savedCamTarget = null;
}

closeWishBtn.addEventListener("click", closeWishCard);
closeWishBtn.addEventListener("touchend", closeWishCard);

wishModal.addEventListener("click", (e) => {
  if (e.target === wishModal) closeWishCard(e);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeWishCard();
});

// ============================================================================
// VÒNG LẶP RENDER & ANIMATION HOÀN CHỈNH
// ============================================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // 1. Cập nhật lồng đèn bay lượn & đung đưa theo gió
  lanterns.forEach((lantern) => {
    lantern.position.y += lantern.userData.speedY;
    lantern.position.x =
      lantern.userData.initialX +
      Math.sin(time * lantern.userData.swingSpeed + lantern.userData.id) * 0.45;
    lantern.position.z =
      lantern.userData.initialZ +
      Math.cos(time * lantern.userData.swingSpeed + lantern.userData.id) * 0.45;

    lantern.rotation.y += 0.007;

    if (lantern.userData.tasselGroup) {
      const swayZ = Math.sin(time * 2.2 + lantern.userData.id) * 0.16;
      const swayX = Math.cos(time * 1.8 + lantern.userData.id) * 0.14;
      lantern.userData.tasselGroup.rotation.z = swayZ;
      lantern.userData.tasselGroup.rotation.x = swayX;
    }

    const flicker = Math.sin(time * 6 + lantern.userData.id * 1.5) * 0.08;
    if (lantern.userData.glowSprite) {
      lantern.userData.glowSprite.scale.set(
        3.8 + flicker * 2,
        3.8 + flicker * 2,
        1,
      );
      lantern.userData.glowSprite.material.opacity = 0.72 + flicker;
    }
    if (lantern.userData.bodyMat) {
      lantern.userData.bodyMat.emissiveIntensity = 0.85 + flicker * 0.4;
    }

    if (lantern.position.y > 32) {
      lantern.position.y = -3.5;
    }
  });

  // 2. Mây đêm bồng bềnh lướt qua ánh trăng
  clouds.forEach((c) => {
    c.mesh.position.x -= delta * c.speed;
    c.mesh.position.y = c.initialY + Math.sin(time * c.floatSpeed + c.id) * 0.4;
    if (c.mesh.position.x < -20) {
      c.mesh.position.x = 65;
    }
  });

  // 3. Mặt trăng luôn hướng về camera & hào quang kim sắc thở nhẹ nhàng
  if (moonMesh) {
    moonMesh.quaternion.copy(camera.quaternion);
  }
  if (moonCoronaSprite) {
    const pulse = 40 + Math.sin(time * 0.9) * 2.0;
    moonCoronaSprite.scale.set(pulse, pulse, 1);
  }
  if (moonOuterHaze) {
    const pulse2 = 58 + Math.sin(time * 0.7) * 2.5;
    moonOuterHaze.scale.set(pulse2, pulse2, 1);
  }

  // 4. Cánh hoa đào rơi lững lờ
  const pPos = petalsGeo.attributes.position.array;
  for (let i = 0; i < fallingPetalsCount; i++) {
    pPos[i * 3 + 1] -= petalsData[i].speedY;
    pPos[i * 3] += Math.sin(time + i) * 0.012;
    pPos[i * 3 + 2] += Math.cos(time + i) * 0.012;

    if (pPos[i * 3 + 1] < -3) {
      pPos[i * 3 + 1] = 30;
      pPos[i * 3] = (Math.random() - 0.5) * 38;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 38;
    }
  }
  petalsGeo.attributes.position.needsUpdate = true;

  // 5. Cập nhật các hạt pháo hoa lấp lánh
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const fw = fireworks[i];
    fw.life -= delta * 1.25;
    const posArr = fw.mesh.geometry.attributes.position.array;

    for (let j = 0; j < fw.velocities.length; j++) {
      posArr[j * 3] += fw.velocities[j].x;
      posArr[j * 3 + 1] += fw.velocities[j].y;
      posArr[j * 3 + 2] += fw.velocities[j].z;
      fw.velocities[j].y -= delta * 0.04;
    }
    fw.mesh.geometry.attributes.position.needsUpdate = true;
    fw.mesh.material.opacity = Math.max(0, fw.life);

    if (fw.life <= 0) {
      scene.remove(fw.mesh);
      fireworks.splice(i, 1);
    }
  }

  // 6. Đảo bay xoay nhẹ nhàng
  islandGroup.rotation.y = Math.sin(time * 0.15) * 0.05;

  // 6.1. HIỆU ỨNG ÁNH SÁNG NHỊP THỞ DƯỚI GỐC CÂY (BREATHING LIGHT EFFECT)
  const breath = Math.sin(time * 1.8) * 0.5 + 0.5; // Chu kỳ nhịp thở nhịp nhàng
  const breathWave = Math.sin(time * 1.8 - 0.5) * 0.5 + 0.5;

  if (treeBaseBreathingLight) {
    treeBaseBreathingLight.intensity = 1.6 + breath * 2.8;
  }
  if (treeWarmBreathingLight) {
    treeWarmBreathingLight.intensity = 1.0 + breath * 1.8;
  }
  if (rootAuraMesh) {
    const s = 1.0 + breath * 0.22;
    rootAuraMesh.scale.set(s, s, 1);
    rootAuraMesh.material.opacity = 0.55 + breath * 0.38;
  }
  if (rootAuraRing) {
    const sRing = 1.0 + breathWave * 0.32;
    rootAuraRing.scale.set(sRing, sRing, 1);
    rootAuraRing.material.opacity = 0.3 + breathWave * 0.45;
  }

  // Cập nhật vị trí & độ sáng đom đóm thần tiên quanh gốc cây
  if (fireflyParticles) {
    const ffPos = fireflyGeo.attributes.position.array;
    for (let i = 0; i < fireflyCount; i++) {
      const fd = fireflyData[i];
      const curAngle = fd.baseAngle + time * fd.speed * 0.3;
      const curRadius = fd.radius + Math.sin(time * fd.floatSpeed + i) * 0.25;
      ffPos[i * 3] = Math.cos(curAngle) * curRadius;
      ffPos[i * 3 + 1] = fd.baseY + Math.sin(time * fd.floatSpeed + i * 2) * 0.35;
      ffPos[i * 3 + 2] = Math.sin(curAngle) * curRadius;
    }
    fireflyGeo.attributes.position.needsUpdate = true;
    const ffPulse = Math.sin(time * 3.0) * 0.2 + 0.8;
    fireflyMat.opacity = 0.75 + ffPulse * 0.25;
  }

  // 7. Thỏ ngọc nhảy quanh đảo
  updateRabbits(time);

  // 8. Chuyển động mượt mà của Camera khi chọn lồng đèn hoặc đổi góc nhìn (Tự động kết thúc sau duration, không kéo ngược camera khi người dùng xoay)
  if (cameraTransition) {
    const elapsed = performance.now() - cameraTransition.startTime;
    const p = Math.min(1.0, elapsed / cameraTransition.duration);
    const ease = 1 - Math.pow(1 - p, 3);

    camera.position.lerpVectors(cameraTransition.startPos, cameraTransition.endPos, ease);
    controls.target.lerpVectors(cameraTransition.startLook, cameraTransition.endLook, ease);

    if (p >= 1.0) {
      cameraTransition = null;
    }
  }

  // 9. Cập nhật ánh sáng lấp lánh lung linh của các vì sao lớn
  if (brightStarGeo) {
    const colArr = brightStarGeo.attributes.color.array;
    for (let i = 0; i < brightStarCount; i++) {
      const td = brightStarTwinkleData[i];
      const brightness = 0.5 + 0.5 * Math.sin(time * td.speed + td.phase);
      const base = brightStarBaseColors[i];
      colArr[i * 3] = base.r * brightness;
      colArr[i * 3 + 1] = base.g * brightness;
      colArr[i * 3 + 2] = base.b * brightness;
    }
    brightStarGeo.attributes.color.needsUpdate = true;
  }

  // 10. Cập nhật sao băng vụt qua trời đêm
  updateShootingStars(delta, time);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// CẬP NHẬT KÍCH THƯỚC TRÌNH DUYỆT (RESPONSIVE RESIZE)
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.fov = width < 768 ? 60 : 45;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, width < 768 ? 1.5 : 2),
  );
});
