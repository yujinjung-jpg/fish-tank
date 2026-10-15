import * as THREE from './three.module.min.js';

const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const PIX = 4;
const V = 0.55;
const TW = 12;
const TD = 7;
const TH = 16;
const WL = 14;
const BND = { x: 10, y0: 2.8, y1: 12.4, z: 5 };
const GC = TW * 4;
const GRW = TD * 4;
const AC = 32;
const AR = 20;
const ALGAE_RATE = 1 / 56;

const SPECIES = {
  gold: { name: '금붕어', speed: 2.2, sw: '#ff8a3d' },
  guppy: { name: '구피', speed: 3, sw: 'linear-gradient(90deg,#7fb8ff 50%,#ff8fd0 50%)' },
  puffer: { name: '복어', speed: 1.6, sw: '#ffd84d' },
  clown: { name: '흰동가리', speed: 2.6, sw: 'repeating-linear-gradient(90deg,#ff8a2a 0 8px,#fff 8px 12px)' },
  jelly: { name: '해파리', speed: 0.8, sw: '#ffb3d9' }
};
const PRESETS = {
  pastel: ['#ffd1dc', '#c9f0e1', '#fff1b8', '#d8ccff', '#ffffff'],
  sand: ['#f3dfb5', '#e8cf9c', '#fbecc9', '#d9bd88'],
  rainbow: ['#ff8fa3', '#ffd166', '#8fe3bf', '#8cc8ff', '#c3a6ff'],
  night: ['#3b3f5c', '#2e3250', '#55597a', '#1f2238']
};
const BRUSH = ['#ffffff', '#ffd1dc', '#ffb3c6', '#fff1b8', '#ffd166', '#c9f0e1', '#8fe3bf', '#cfe3ff', '#8cc8ff', '#d8ccff', '#f3dfb5', '#8a8fa8', '#3b3f5c'];
const ROCKS = ['#a8a3b5', '#c9b8a6', '#8f9aa8', '#d6c7e8', '#7d8a7a'];
const GREENS = [['#5cc98a', '#8fe3a8'], ['#4fb3a0', '#7fd8c2'], ['#6fcf70', '#a8e89a'], ['#9b7fe0', '#c9b3ff'], ['#f2b134', '#ffd97a']];
const CORALS = [['#ff8fb1', '#ffd1dc'], ['#ff9f7a', '#ffd0b5'], ['#b07cff', '#e0ccff'], ['#ffd166', '#fff1b8'], ['#5ec4ff', '#c9ecff']];
const KINDS = {
  pebble: { cat: 'rock', name: '조약돌', pal: ROCKS },
  boulder: { cat: 'rock', name: '큰 바위', pal: ROCKS },
  stack: { cat: 'rock', name: '돌탑', pal: ROCKS },
  arch: { cat: 'rock', name: '돌 아치', pal: ROCKS },
  kelp: { cat: 'plant', name: '해초', pal: GREENS, sway: true },
  grass: { cat: 'plant', name: '풀', pal: GREENS, sway: true },
  bush: { cat: 'plant', name: '덤불', pal: GREENS, sway: true },
  coral: { cat: 'plant', name: '산호', pal: CORALS },
  anemone: { cat: 'plant', name: '말미잘', pal: CORALS, sway: true },
  castle: { cat: 'deco', name: '성', pal: ['#f6c9d8', '#cfe3ff', '#fff1b8'] },
  house: { cat: 'deco', name: '버섯집', pal: ['#e85a5a', '#7fb8ff', '#b07cff'] },
  boat: { cat: 'deco', name: '난파선', pal: ['#c98f52', '#e8a3b5', '#8cc8ff'] },
  chest: { cat: 'deco', name: '보물상자', pal: ['#a8723b'], bubbles: 2.6 },
  airstone: { cat: 'deco', name: '기포돌', pal: ['#a8a3b5', '#c9b8a6'], bubbles: 1.1 },
  shell: { cat: 'deco', name: '조개', pal: ['#ffc4d6', '#c9f0e1', '#fff1b8'] },
  star: { cat: 'deco', name: '불가사리', pal: ['#ff9f7a', '#ffd166', '#ff8fb1'] }
};
const SIZES = [0.7, 1, 1.4];
const TABS = [['rock', '돌'], ['plant', '수초'], ['deco', '장식'], ['gravel', '자갈']];
const THEMES = {
    auto: { name: '실제 시간' },
    sky: { name: '파란 하늘', bg: '#bfe3ff', wall: ['#7fbfff', '#d6eeff', 'sky'], table: '#e8d5b0', hemi: 1.5, sun: 1.6, sunC: '#ffffff', tank: 0, lamp: 0 },
    cream: { name: '크림', bg: '#fffbea', wall: ['#fffbea', '#fffbea', 'plain'], table: '#d9b48a', hemi: 1.4, sun: 1.6, sunC: '#ffffff', tank: 0, lamp: 0 },
    mint: { name: '민트', bg: '#d8efe4', wall: ['#d8efe4', '#d8efe4', 'plain'], table: '#e8d5b0', hemi: 1.4, sun: 1.6, sunC: '#ffffff', tank: 0, lamp: 0 },
    skyblue: { name: '하늘색', bg: '#d6e9fb', wall: ['#d6e9fb', '#d6e9fb', 'plain'], table: '#c9a77d', hemi: 1.4, sun: 1.6, sunC: '#ffffff', tank: 0, lamp: 0 },
    apricot: { name: '노을빛', bg: '#f3cdb2', wall: ['#f3cdb2', '#f3cdb2', 'plain'], table: '#b9845a', hemi: 1.1, sun: 1.3, sunC: '#ffc58f', tank: 2, lamp: 0 },
    navy: { name: '남색 밤', bg: '#2a2f4f', wall: ['#2c3354', '#2c3354', 'plain'], table: '#5a4636', hemi: 0.5, sun: 0.2, sunC: '#9fb4ff', tank: 10, lamp: 0 },
    day: { name: '줄무늬', bg: '#f6e7d6', wall: ['#f3dcc8', '#f8e8da', 'stripe'], table: '#c99560', hemi: 1.4, sun: 1.6, sunC: '#ffffff', tank: 0, lamp: 0 },
    night: { name: '별무늬 밤', bg: '#2a2f4f', wall: ['#2f3558', '#ffe9a8', 'stars'], table: '#5a4636', hemi: 0.5, sun: 0.2, sunC: '#9fb4ff', tank: 10, lamp: 0 },
    cozy: { name: '아늑한 방', bg: '#4a3426', wall: ['#7a5236', '#a8724a', 'plaid'], table: '#6f4526', hemi: 0.75, sun: 0.5, sunC: '#ffb870', tank: 5, lamp: 14 },
    pastel: { name: '땡땡이', bg: '#fde4ec', wall: ['#fde4ec', '#ffffff', 'dots'], table: '#fff3dc', hemi: 1.6, sun: 1.4, sunC: '#ffffff', tank: 0, lamp: 0 },
    forest: { name: '잎사귀', bg: '#d6ecc9', wall: ['#cfe8c0', '#9ccc8c', 'leaves'], table: '#a8723b', hemi: 1.3, sun: 1.5, sunC: '#fff6d8', tank: 0, lamp: 0 }
  };

let ST;
try { ST = JSON.parse(localStorage.getItem('tank') || '{}'); } catch (e) { ST = {}; }
ST = Object.assign({ fish: [{ id: 1, type: 'gold', name: '몽이', fed: 0 }, { id: 2, type: 'guppy', name: '콩이', fed: 0 }], gravel: 'pastel', muted: false, theme: 'auto' }, ST);
if (!ST.items) {
  const D = ST.deco || { plants: true, castle: true, shell: true, chest: true };
  ST.items = [];
  const add = (kind, x, z, c) => ST.items.push({ id: Math.random(), kind, x, z, r: 0, s: 1, c: c || 0 });
  if (D.plants) { add('kelp', -9.5, -4.5, 0); add('kelp', -7.5, -5.5, 1); add('kelp', 8.5, -5, 2); add('grass', 5, 4.5, 0); }
  if (D.castle) add('castle', -2, -3.5);
  if (D.shell) add('shell', 5, 1);
  if (D.rock) add('boulder', 1, 4);
  if (D.chest) add('chest', TW - 3, -TD + 2.5);
}
function fillGravel(name) {
  const pal = PRESETS[name] || PRESETS.pastel;
  ST.gc = Array.from({ length: GC * GRW }, () => pal[Math.floor(Math.random() * pal.length)]);
}
if (!Array.isArray(ST.gc) || ST.gc.length !== GC * GRW) fillGravel(ST.gravel);
if (!ST.algae) {
  ST.algae = {};
  ['front', 'back', 'left', 'right'].forEach(w => { ST.algae[w] = new Array(AC * AR).fill(0); });
  ST.algaeAt = ST.lastClean || Date.now();
}
const save = () => {
  const out = Object.assign({}, ST, { algae: {} });
  Object.keys(ST.algae).forEach(w => { out.algae[w] = ST.algae[w].map(v => Math.round(v * 100) / 100); });
  localStorage.setItem('tank', JSON.stringify(out));
};
let saveT = null;
const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(save, 400); };

let toastT;
function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 1800);
}

let ac = null;
let nbuf = null;
let hum = null;
function A() {
  if (!ac) {
    ac = new AudioContext();
    nbuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = nbuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(f, t, dur, o) {
  if (ST.muted) return;
  const c = A();
  const s = c.currentTime + t;
  const os = c.createOscillator();
  const g = c.createGain();
  os.type = o.type || 'sine';
  os.frequency.setValueAtTime(f, s);
  if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, s + dur);
  g.gain.setValueAtTime(0.0001, s);
  g.gain.exponentialRampToValueAtTime(o.v, s + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
  os.connect(g);
  g.connect(c.destination);
  os.start(s);
  os.stop(s + dur + 0.05);
}
function noise(t, dur, o) {
  if (ST.muted) return;
  const c = A();
  const s = c.currentTime + t;
  const src = c.createBufferSource();
  src.buffer = nbuf;
  const f = c.createBiquadFilter();
  f.type = o.type;
  f.Q.value = o.q || 1;
  f.frequency.setValueAtTime(o.f, s);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, s + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, s);
  g.gain.exponentialRampToValueAtTime(o.v, s + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
  src.connect(f);
  f.connect(g);
  g.connect(c.destination);
  src.start(s, Math.random());
  src.stop(s + dur + 0.05);
}
const AU = {
  blip() { tone(rnd(320, 700), 0, 0.09, { to: rnd(800, 1300), v: 0.025 }); },
  plop() { tone(520, 0, 0.12, { to: 180, v: 0.09 }); noise(0, 0.08, { type: 'lowpass', f: 900, v: 0.05 }); },
  gulp() { tone(240, 0, 0.1, { to: 560, v: 0.08, type: 'triangle' }); },
  chirp() { tone(900, 0, 0.12, { to: 1400, v: 0.06, type: 'triangle' }); tone(1350, 0.1, 0.12, { to: 1800, v: 0.05, type: 'triangle' }); },
  click() { tone(680, 0, 0.06, { to: 420, v: 0.06, type: 'triangle' }); },
  splash() { noise(0, 0.35, { type: 'bandpass', f: 1200, to: 500, q: 0.8, v: 0.12 }); },
  stone() { tone(160, 0, 0.12, { to: 90, v: 0.12 }); noise(0, 0.06, { type: 'lowpass', f: 600, v: 0.08 }); },
  brush() { noise(0, 0.05, { type: 'bandpass', f: rnd(2000, 3500), q: 2, v: 0.04 }); },
  squeak() {
    const f = rnd(1400, 2000);
    tone(f, 0, 0.07, { to: f * 1.25, v: 0.035, type: 'triangle' });
    noise(0, 0.05, { type: 'bandpass', f: 3500, q: 3, v: 0.03 });
  },
  shine() { [1568, 2093, 2637].forEach((f, k) => tone(f, k * 0.07, 0.4, { v: 0.06, type: 'triangle' })); }
};
function syncHum() {
  if (ST.muted && hum) { hum.stop(); hum = null; return; }
  if (ST.muted || hum) return;
  const c = A();
  const src = c.createBufferSource();
  src.buffer = nbuf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 380;
  const g = c.createGain();
  g.gain.value = 0.02;
  src.connect(f);
  f.connect(g);
  g.connect(c.destination);
  src.start();
  hum = src;
}

const cv = $('#cv');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false });
renderer.setPixelRatio(1);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f6e7d6');
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);
function resize() {
  renderer.setSize(Math.ceil(innerWidth / PIX), Math.ceil(innerHeight / PIX), false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const hemi = new THREE.HemisphereLight(0xfff4e6, 0x8a6a4c, 1.4);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(10, 30, 20);
scene.add(sun);
const tankLight = new THREE.PointLight(0x9fdcff, 0, 40, 1);
tankLight.position.set(0, WL + 3, 0);
scene.add(tankLight);
const lamp = new THREE.PointLight(0xffb870, 0, 70, 1);
lamp.position.set(-20, 18, 10);
scene.add(lamp);

const MATS = {};
function mat(c, o) {
  const k = c + JSON.stringify(o || {});
  if (!MATS[k]) MATS[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  return MATS[k];
}
const GEO = {};
function box(parent, x, y, z, sx, sy, sz, c, o) {
  const key = sx + ',' + sy + ',' + sz;
  if (!GEO[key]) GEO[key] = new THREE.BoxGeometry(sx * V, sy * V, sz * V);
  const m = new THREE.Mesh(GEO[key], mat(c, o));
  m.position.set(x * V, y * V, z * V);
  parent.add(m);
  return m;
}
const sh = (hex, amt) => '#' + new THREE.Color(hex).lerp(new THREE.Color(amt < 0 ? 0x000000 : 0xffffff), Math.abs(amt)).getHexString();

const table = new THREE.Mesh(new THREE.BoxGeometry(160, 2, 80), mat('#c99560'));
table.position.set(0, -1, 0);
scene.add(table);
const wall = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), mat('#f3dcc8'));
wall.position.set(0, 60, -40);
scene.add(wall);

const tank = new THREE.Group();
scene.add(tank);
const glass = new THREE.Mesh(new THREE.BoxGeometry(TW * 2 + 0.4, TH, TD * 2 + 0.4), new THREE.MeshLambertMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide }));
glass.position.y = TH / 2;
glass.renderOrder = 3;
tank.add(glass);
const waterMat = new THREE.MeshLambertMaterial({ color: 0x5ec8ff, transparent: true, opacity: 0.2, depthWrite: false });
const water = new THREE.Mesh(new THREE.BoxGeometry(TW * 2, WL - 0.8, TD * 2), waterMat);
water.position.y = 0.8 + (WL - 0.8) / 2;
water.renderOrder = 2;
tank.add(water);
const surface = new THREE.Mesh(new THREE.PlaneGeometry(TW * 2, TD * 2), new THREE.MeshLambertMaterial({ color: 0xc8f0ff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
surface.rotation.x = -Math.PI / 2;
surface.position.y = WL;
surface.renderOrder = 4;
tank.add(surface);
const rimMat = mat('#ff9fb6');
const base = new THREE.Mesh(new THREE.BoxGeometry(TW * 2 + 1.4, 0.8, TD * 2 + 1.4), rimMat);
base.position.y = 0.4;
tank.add(base);
[TD + 0.25, -TD - 0.25].forEach(z => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(TW * 2 + 1, 0.5, 0.5), rimMat);
  m.position.set(0, TH, z);
  tank.add(m);
});
[TW + 0.25, -TW - 0.25].forEach(x => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, TD * 2 + 1), rimMat);
  m.position.set(x, TH, 0);
  tank.add(m);
});

const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const AG_COLS = ['#6fa86a', '#87b86b', '#5d9a7a', '#7fae5a'];
const algaeWalls = [];
const CY = 0.8 + (WL - 0.8) / 2;
[
  { id: 'front', w: TW * 2, pos: [0, CY, TD + 0.1], ry: 0 },
  { id: 'back', w: TW * 2, pos: [0, CY, -TD - 0.1], ry: Math.PI },
  { id: 'left', w: TD * 2, pos: [-TW - 0.1, CY, 0], ry: -Math.PI / 2 },
  { id: 'right', w: TD * 2, pos: [TW + 0.1, CY, 0], ry: Math.PI / 2 }
].forEach((def, wi) => {
  const c = document.createElement('canvas');
  c.width = AC * 4;
  c.height = AR * 4;
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(def.w, WL - 0.8), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  m.position.set(def.pos[0], def.pos[1], def.pos[2]);
  m.rotation.y = def.ry;
  m.renderOrder = 5;
  m.userData = { wall: def.id, canvas: c, tex: tex, wi: wi, wasClean: false };
  tank.add(m);
  algaeWalls.push(m);
});
const weightOf = (wi, i) => {
  const col = i % AC;
  const row = Math.floor(i / AC);
  const coarse = hash(wi * 97 + Math.floor(col / 4) * 13 + Math.floor(row / 4) * 7);
  const edge = 0.7 + 0.6 * Math.abs(row - AR / 2) / (AR / 2);
  return (0.3 + hash(wi * 1000 + i)) * (0.4 + coarse) * edge;
};
function drawAlgae(m) {
  const x = m.userData.canvas.getContext('2d');
  const arr = ST.algae[m.userData.wall];
  x.clearRect(0, 0, AC * 4, AR * 4);
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v < 0.12) continue;
    const col = i % AC;
    const row = Math.floor(i / AC);
    x.globalAlpha = Math.min(0.85, (v - 0.12) * 1.1);
    x.fillStyle = AG_COLS[Math.floor(hash(i + m.userData.wi * 50) * AG_COLS.length)];
    x.fillRect(col * 4, row * 4, 4, 4);
    if (v > 0.5) {
      x.fillStyle = '#4a7a4a';
      x.fillRect(col * 4 + Math.floor(hash(i) * 3), row * 4 + Math.floor(hash(i + 9) * 3), 1, 1);
    }
  }
  x.globalAlpha = 1;
  m.userData.tex.needsUpdate = true;
}
function growAlgae() {
  const now = Date.now();
  const hours = Math.max(0, (now - (ST.algaeAt || now)) / 3600000);
  ST.algaeAt = now;
  if (hours > 0) algaeWalls.forEach(m => {
    const arr = ST.algae[m.userData.wall];
    for (let i = 0; i < arr.length; i++) arr[i] = Math.min(1, arr[i] + hours * ALGAE_RATE * weightOf(m.userData.wi, i));
  });
  algaeWalls.forEach(drawAlgae);
  applyWater();
  saveSoon();
}
function dirtLevel() {
  let s = 0;
  let n = 0;
  Object.values(ST.algae).forEach(arr => arr.forEach(v => { s += v; n++; }));
  return n ? s / n : 0;
}
const CLEAN = new THREE.Color('#5ec8ff');
const DIRTY = new THREE.Color('#8faf6a');
function applyWater() {
  const dirt = clamp(dirtLevel() * 1.3, 0, 1);
  waterMat.color.copy(CLEAN).lerp(DIRTY, dirt);
  waterMat.opacity = 0.2 + 0.18 * dirt;
}

let gravel = null;
const tmpC = new THREE.Color();
function buildGravel() {
  if (gravel) tank.remove(gravel);
  gravel = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial(), GC * GRW);
  const o = new THREE.Object3D();
  let i = 0;
  for (let a = 0; a < GC; a++) for (let b = 0; b < GRW; b++) {
    const h = rnd(0.8, 1.6);
    o.position.set(-TW + 0.25 + a * 0.5, h * 0.25 + 0.6, -TD + 0.25 + b * 0.5);
    o.scale.set(1, h, 1);
    o.updateMatrix();
    gravel.setMatrixAt(i, o.matrix);
    gravel.setColorAt(i, tmpC.set(ST.gc[i]));
    i++;
  }
  tank.add(gravel);
}
function recolorGravel() {
  for (let i = 0; i < GC * GRW; i++) gravel.setColorAt(i, tmpC.set(ST.gc[i]));
  gravel.instanceColor.needsUpdate = true;
}

const BUILD = {
  pebble(g, p) {
    box(g, 0, 0.4, 0, 1.6, 0.8, 1.2, p);
    box(g, 1.3, 0.3, 0.6, 1, 0.6, 0.9, sh(p, 0.12));
    box(g, -1, 0.3, -0.5, 1.1, 0.6, 1, sh(p, -0.1));
  },
  boulder(g, p) {
    box(g, 0, 1, 0, 4, 2, 3, p);
    box(g, 0.3, 2.4, -0.2, 3, 1, 2.4, sh(p, 0.08));
    box(g, -0.4, 3.2, 0, 1.8, 0.8, 1.6, sh(p, 0.15));
    box(g, 1.8, 0.6, 1, 1.2, 1.2, 1.2, sh(p, -0.1));
  },
  stack(g, p) {
    box(g, 0, 0.4, 0, 3.2, 0.8, 2.4, p);
    box(g, 0.2, 1.2, 0, 2.4, 0.8, 1.8, sh(p, 0.08));
    box(g, -0.1, 1.9, 0, 1.6, 0.6, 1.3, sh(p, 0.15));
    box(g, 0.1, 2.5, 0, 1, 0.5, 0.8, sh(p, 0.22));
  },
  arch(g, p) {
    box(g, -2, 1.5, 0, 1.4, 3, 1.6, p);
    box(g, 2, 1.5, 0, 1.4, 3, 1.6, p);
    box(g, 0, 3.4, 0, 5.4, 1, 1.8, sh(p, 0.1));
    box(g, -1.3, 2.7, 0, 0.8, 0.6, 1.6, sh(p, 0.05));
    box(g, 1.3, 2.7, 0, 0.8, 0.6, 1.6, sh(p, 0.05));
  },
  kelp(g, p) {
    for (let k = 0; k < 15; k++) {
      box(g, Math.sin(k * 0.7) * 0.5, k + 0.5, 0, 1, 1, 1, k % 2 ? p[0] : p[1]);
      if (k % 3 === 1) box(g, Math.sin(k * 0.7) * 0.5 + (k % 2 ? 1 : -1), k + 0.5, 0, 1, 0.6, 0.6, p[1]);
    }
  },
  grass(g, p) {
    [[-1, 0, 4], [0, 0.5, 6], [1, -0.4, 5], [0.4, 1, 3], [-0.6, -0.8, 4]].forEach(([x, z, h]) => {
      for (let k = 0; k < h; k++) box(g, x + Math.sin(k * 0.9) * 0.2, k * 0.8 + 0.4, z, 0.4, 0.8, 0.4, k % 2 ? p[0] : p[1]);
    });
  },
  bush(g, p) {
    [[0, 1, 0, 2.4], [1, 1.6, 0.5, 1.8], [-1, 1.4, -0.4, 2], [0.2, 2.6, 0, 1.8], [-0.6, 2.2, 0.8, 1.4]].forEach(([x, y, z, s], i) => box(g, x, y, z, s, s, s, i % 2 ? p[0] : p[1]));
  },
  coral(g, p) {
    box(g, 0, 1.5, 0, 0.8, 3, 0.8, p[0]);
    [[-1, 3, 0, 2], [1, 3.4, 0.3, 2.4], [-0.4, 4.4, -0.4, 1.6]].forEach(([x, y, z, h]) => {
      box(g, x / 2, y - 0.6, z, Math.abs(x) + 0.3, 0.6, 0.6, p[0]);
      box(g, x, y + h / 2 - 0.4, z, 0.6, h, 0.6, p[0]);
      box(g, x, y + h - 0.2, z, 0.8, 0.5, 0.8, p[1]);
    });
  },
  anemone(g, p) {
    box(g, 0, 0.6, 0, 2, 1.2, 2, p[0]);
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * Math.PI * 2;
      box(g, Math.cos(a) * 0.7, 1.8, Math.sin(a) * 0.7, 0.3, 1.6, 0.3, p[1]);
    }
    box(g, 0, 2.2, 0, 0.3, 2, 0.3, p[1]);
  },
  castle(g, p) {
    for (let y = 0; y < 6; y++) box(g, 0, y + 0.5, 0, 6, 1, 4, y % 2 ? p : sh(p, 0.3));
    [-3, 3].forEach(tx => {
      for (let y = 0; y < 9; y++) box(g, tx, y + 0.5, 0, 2, 1, 2, y % 2 ? sh(p, -0.12) : p);
      box(g, tx, 9.5, 0, 2.6, 1, 2.6, sh(p, -0.25));
    });
    box(g, 0, 1.5, 2.05, 2, 3, 0.2, '#5a3a4a');
    box(g, -3, 6, 1.05, 0.8, 1, 0.2, '#5a3a4a');
    box(g, 3, 6, 1.05, 0.8, 1, 0.2, '#5a3a4a');
    box(g, 3, 11, 0, 0.2, 2, 0.2, '#8a6a4c');
    box(g, 3.8, 11.6, 0, 1.4, 0.8, 0.2, '#ff6b8a');
  },
  house(g, p) {
    box(g, 0, 1.5, 0, 2.4, 3, 2.4, '#fff3dc');
    box(g, 0, 3.6, 0, 4.4, 1.4, 4.4, p);
    box(g, 0, 4.6, 0, 3, 0.8, 3, p);
    box(g, 1, 3.8, 2.21, 0.6, 0.6, 0.1, '#ffffff');
    box(g, -1.2, 3.4, 2.21, 0.5, 0.5, 0.1, '#ffffff');
    box(g, 0.2, 4.8, 1.51, 0.5, 0.5, 0.1, '#ffffff');
    box(g, 0, 1, 1.25, 1, 2, 0.1, '#8a5a3b');
    box(g, 0, 2.4, 1.25, 0.7, 0.5, 0.1, '#ffe28a');
  },
  boat(g, p) {
    const b = new THREE.Group();
    b.rotation.z = 0.25;
    g.add(b);
    box(b, 0, 0.8, 0, 7, 1.2, 2.6, p);
    box(b, 0, 1.6, 0, 6, 0.6, 2.2, sh(p, -0.15));
    box(b, -3.6, 1.4, 0, 0.6, 1.6, 2.6, p);
    box(b, 0, 3.5, 0, 0.4, 5, 0.4, '#8a6a4c');
    box(b, 0.8, 4, 0, 1.6, 2, 0.15, '#fff8ef');
  },
  chest(g, p) {
    box(g, 0, 0.75, 0, 3, 1.5, 2, p);
    box(g, 0, 1.9, 0, 3.2, 0.8, 2.2, sh(p, 0.15));
    box(g, 0, 1.2, 1.05, 0.6, 0.6, 0.2, '#ffd23f');
  },
  airstone(g, p) {
    box(g, 0, 0.4, 0, 1.2, 0.8, 1.2, p);
    box(g, 0, 0.9, 0, 0.6, 0.3, 0.6, sh(p, 0.2));
  },
  shell(g, p) {
    for (let k = 0; k < 7; k++) {
      const e = 3 - Math.abs(k - 3);
      const h = 1.2 + e * 0.45;
      box(g, (k - 3) * 0.55, 0.4 + h / 2, 0, 0.55, h, 1.4, k % 2 ? p : sh(p, 0.35));
      box(g, (k - 3) * 0.55, 0.4 + h - 0.1, 0.72, 0.3, 0.2, 0.1, sh(p, 0.5));
    }
    box(g, 0, 0.65, 0, 1.6, 0.5, 1.7, sh(p, -0.15));
  },
  star(g, p) {
    box(g, 0, 1.1, 0, 1.6, 1.4, 1.6, p);
    box(g, 0, 1.9, 0, 0.8, 0.3, 0.8, sh(p, 0.15));
    for (let k = 0; k < 5; k++) {
      const arm = new THREE.Group();
      arm.rotation.y = -(k / 5 * Math.PI * 2);
      box(arm, 1.3, 0.95, 0, 1.4, 1, 0.9, p);
      box(arm, 2.3, 0.8, 0, 0.8, 0.7, 0.6, p);
      box(arm, 2.8, 0.7, 0, 0.4, 0.5, 0.4, sh(p, 0.1));
      box(arm, 1.1, 1.5, 0, 0.3, 0.15, 0.3, sh(p, 0.4));
      box(arm, 2.2, 1.2, 0, 0.25, 0.12, 0.25, sh(p, 0.4));
      g.add(arm);
    }
  }
};

const decor = new THREE.Group();
tank.add(decor);
const groups = new Map();
let sources = [];
function buildItem(it) {
  const old = groups.get(it.id);
  if (old) decor.remove(old);
  const k = KINDS[it.kind];
  if (!k) return;
  const g = new THREE.Group();
  BUILD[it.kind](g, k.pal[it.c % k.pal.length]);
  g.position.set(it.x, 1, it.z);
  g.rotation.y = it.r * Math.PI / 2;
  g.scale.setScalar(SIZES[it.s] || 1);
  g.userData = { item: it, ph: Math.random() * 6, sway: !!k.sway };
  decor.add(g);
  groups.set(it.id, g);
}
function updateSources() {
  sources = ST.items.filter(it => KINDS[it.kind] && KINDS[it.kind].bubbles).map(it => new THREE.Vector3(it.x, 1 + KINDS[it.kind].bubbles * V * SIZES[it.s], it.z));
}
function buildAll() {
  decor.clear();
  groups.clear();
  ST.items.forEach(buildItem);
  updateSources();
}
setInterval(() => { if (ac && !ST.muted && sources.length && Math.random() < 0.55) AU.blip(); }, 700);

const bubbles = [];
const bubbleMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false });
const bubbleGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
function addBubble(at) {
  const m = new THREE.Mesh(bubbleGeo, bubbleMat);
  m.position.copy(at);
  m.userData = { sp: rnd(1.5, 2.6), ph: rnd(0, 6), x0: at.x, extra: false };
  tank.add(m);
  bubbles.push(m);
  return m;
}

function eye(g, x, y, z, s) {
  box(g, x, y, z, 0.55 * s, 0.55 * s, 0.2, '#ffffff');
  box(g, x + 0.12 * s, y - 0.02, z + Math.sign(z) * 0.08, 0.28 * s, 0.3 * s, 0.15, '#222222');
}
function makeFish(type) {
  const g = new THREE.Group();
  const tail = new THREE.Group();
  let tx = -1.5;
  let ty = 0;
  if (type === 'gold') {
    box(g, 0, 0, 0, 3, 2, 2, '#ff8a3d');
    box(g, 1.75, -0.15, 0, 0.7, 1.6, 1.8, '#ff9d55');
    box(g, 0, -0.8, 0, 2.6, 0.5, 1.9, '#ffd0a0');
    box(g, -0.2, 1.25, 0, 1.4, 0.6, 0.3, '#ff6a2a');
    box(g, 0.3, -1.1, 0.9, 0.8, 0.4, 0.3, '#ff6a2a');
    box(g, 0.3, -1.1, -0.9, 0.8, 0.4, 0.3, '#ff6a2a');
    eye(g, 1.7, 0.35, 1, 1);
    eye(g, 1.7, 0.35, -1, 1);
    box(g, 1.5, -0.35, 1.02, 0.4, 0.25, 0.1, '#ff9fb6');
    box(g, 1.5, -0.35, -1.02, 0.4, 0.25, 0.1, '#ff9fb6');
    box(tail, -0.7, 0.55, 0, 1.4, 1.1, 0.3, '#ff6a2a');
    box(tail, -0.7, -0.55, 0, 1.4, 1.1, 0.3, '#ff6a2a');
    box(tail, -1.5, 0.9, 0, 0.6, 0.7, 0.3, '#ffb070');
    box(tail, -1.5, -0.9, 0, 0.6, 0.7, 0.3, '#ffb070');
  }
  if (type === 'guppy') {
    box(g, 0, 0, 0, 2.2, 1.2, 1.2, '#7fb8ff');
    box(g, 0, -0.45, 0, 2, 0.4, 1.1, '#d6ecff');
    eye(g, 1.05, 0.2, 0.6, 0.8);
    eye(g, 1.05, 0.2, -0.6, 0.8);
    box(g, -0.2, 0.8, 0, 1, 0.4, 0.2, '#b07cff');
    box(tail, -0.6, 0.6, 0, 1.2, 0.8, 0.2, '#ff8fd0');
    box(tail, -0.6, -0.2, 0, 1.2, 0.8, 0.2, '#b07cff');
    box(tail, -1.5, 0.3, 0, 0.8, 1.6, 0.2, '#ffd166');
    tx = -1.1;
  }
  if (type === 'puffer') {
    box(g, 0, 0, 0, 2.6, 2.4, 2.4, '#ffd84d');
    box(g, 0, -1, 0, 2.4, 0.5, 2.2, '#fff3c4');
    [[0, 1.4, 0], [-0.8, 1.3, 0.8], [0.8, 1.3, -0.8], [0, 0.4, 1.35], [0, 0.4, -1.35], [-1.2, 0.6, 0], [0.6, -0.6, 1.3], [0.6, -0.6, -1.3]].forEach(([x, y, z]) => box(g, x, y, z, 0.35, 0.35, 0.35, '#e0b030'));
    eye(g, 1.25, 0.4, 1.2, 1.3);
    eye(g, 1.25, 0.4, -1.2, 1.3);
    box(g, 1.35, -0.45, 0, 0.2, 0.3, 0.6, '#ff9f7a');
    box(tail, -0.4, 0, 0, 0.8, 1, 0.3, '#f2c230');
    tx = -1.3;
  }
  if (type === 'clown') {
    box(g, 0, 0, 0, 3, 1.8, 1.6, '#ff8a2a');
    [1, -0.6].forEach(x => {
      box(g, x, 0, 0, 0.45, 1.9, 1.7, '#ffffff');
      box(g, x - 0.28, 0, 0, 0.12, 1.9, 1.72, '#222222');
      box(g, x + 0.28, 0, 0, 0.12, 1.9, 1.72, '#222222');
    });
    eye(g, 1.5, 0.3, 0.8, 0.9);
    eye(g, 1.5, 0.3, -0.8, 0.9);
    box(g, 0, 1.15, 0, 1.6, 0.5, 0.3, '#ff8a2a');
    box(tail, -0.6, 0, 0, 1.2, 1.6, 0.3, '#ff8a2a');
    box(tail, -1.25, 0, 0, 0.2, 1.6, 0.3, '#222222');
  }
  if (type === 'jelly') {
    const o = { transparent: true, opacity: 0.78 };
    box(g, 0, 0, 0, 2.4, 1.2, 2.4, '#ffb3d9', o);
    box(g, 0, 0.9, 0, 1.6, 0.8, 1.6, '#ffc9e4', o);
    eye(g, 1.2, 0.1, 0.5, 0.7);
    eye(g, 1.2, 0.1, -0.5, 0.7);
    [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7], [0, 0]].forEach(([x, z]) => box(tail, x, -1.2, z, 0.25, 2.4, 0.25, '#ffd6ea', o));
    tx = 0;
    ty = -0.6;
  }
  tail.position.set(tx * V, ty * V, 0);
  g.add(tail);
  return { g, tail };
}

const fishes = [];
const sizeOf = d => 1 + Math.min(0.6, (d.fed || 0) * 0.02);
function pickTarget(f) { f.target.set(rnd(-BND.x, BND.x), rnd(BND.y0, BND.y1), rnd(-BND.z, BND.z)); }
function spawnFish(d) {
  const m = makeFish(d.type);
  const f = { data: d, obj: m.g, tail: m.tail, vel: new THREE.Vector3(1, 0, 0), target: new THREE.Vector3(), t: rnd(0, 10), heading: 0, s: sizeOf(d) };
  f.obj.scale.setScalar(f.s);
  f.obj.position.set(rnd(-BND.x, BND.x), rnd(BND.y0, BND.y1), rnd(-BND.z, BND.z));
  f.obj.traverse(o => { o.userData.fish = f; });
  tank.add(f.obj);
  pickTarget(f);
  fishes.push(f);
}
const lerpAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

const foods = [];
const foodGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
function dropFood(x, z) {
  for (let k = 0; k < 4; k++) {
    const m = new THREE.Mesh(foodGeo, mat(['#c98f52', '#e0a868', '#a8723b'][k % 3]));
    m.position.set(clamp(x + rnd(-1, 1), -TW + 1, TW - 1), WL - 0.2, clamp(z + rnd(-1, 1), -TD + 1, TD - 1));
    tank.add(m);
    foods.push({ mesh: m, life: 25, ph: rnd(0, 6) });
  }
  AU.plop();
}
function removeFood(fd) {
  tank.remove(fd.mesh);
  const i = foods.indexOf(fd);
  if (i >= 0) foods.splice(i, 1);
}
const pops = [];
const heartGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
function heart(p) {
  const g = new THREE.Group();
  ['.X.X.', 'XXXXX', '.XXX.', '..X..'].forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch !== 'X') return;
    const m = new THREE.Mesh(heartGeo, mat('#ff5a7a'));
    m.position.set((c - 2) * 0.22, -r * 0.22, 0);
    g.add(m);
  }));
  g.position.copy(p).add(new THREE.Vector3(0, 1.6, 0));
  tank.add(g);
  pops.push({ g, t: 0, life: 1, vy: 1.2 });
}
const sparkGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
function sparkle(p) {
  for (let k = 0; k < 3; k++) {
    const m = new THREE.Mesh(sparkGeo, mat(Math.random() < 0.5 ? '#ffffff' : '#fff1b8'));
    m.position.copy(p).add(new THREE.Vector3(rnd(-0.6, 0.6), rnd(-0.6, 0.6), 0));
    tank.add(m);
    pops.push({ g: m, t: 0, life: 0.6, vy: 1.5 });
  }
}
function eat(f, fd) {
  removeFood(fd);
  f.data.fed = (f.data.fed || 0) + 1;
  f.s = sizeOf(f.data);
  f.obj.scale.setScalar(f.s);
  saveSoon();
  AU.gulp();
  if (window.TANK && TANK.onEat) TANK.onEat(f);
  if (Math.random() < 0.5) heart(f.obj.position);
}
function updateFish(f, dt, now) {
  const pos = f.obj.position;
  let target = f.target;
  let speed = SPECIES[f.data.type].speed * (f.mul === undefined ? 1 : f.mul);
  if (foods.length) {
    let best = null;
    let bd = 1e9;
    foods.forEach(fd => { const d = fd.mesh.position.distanceTo(pos); if (d < bd) { bd = d; best = fd; } });
    target = best.mesh.position;
    speed *= 1.8;
    if (bd < 0.9 * f.s) eat(f, best);
  }
  const to = target.clone().sub(pos);
  if (target === f.target && to.length() < 1) pickTarget(f);
  f.vel.lerp(to.normalize().multiplyScalar(speed), Math.min(1, dt * 1.6));
  pos.addScaledVector(f.vel, dt);
  pos.set(clamp(pos.x, -BND.x, BND.x), clamp(pos.y, BND.y0, BND.y1), clamp(pos.z, -BND.z, BND.z));
  if (f.data.type === 'jelly') {
    f.obj.scale.set(f.s, f.s * (1 + Math.sin(now * 3 + f.t) * 0.08), f.s);
    f.tail.rotation.z = Math.sin(now * 3 + f.t) * 0.25;
  } else {
    f.heading = lerpAngle(f.heading, Math.atan2(-f.vel.z, f.vel.x), Math.min(1, dt * 4));
    f.obj.rotation.y = f.heading;
    f.obj.rotation.z = clamp(f.vel.y * 0.25, -0.4, 0.4);
    f.tail.rotation.y = Math.sin(now * (6 + speed * 2) + f.t) * 0.5;
  }
}
let tagState = null;
function poke(f) {
  f.vel.y = 5;
  heart(f.obj.position);
  AU.chirp();
  tagState = { f, until: performance.now() + 1600 };
  $('#tag').textContent = f.data.name;
  $('#tag').classList.remove('hidden');
  if (window.TANK && TANK.onPoke) TANK.onPoke(f);
}

const marker = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffd86b, transparent: true, opacity: 0.5, depthWrite: false }));
marker.rotation.x = -Math.PI / 2;
marker.visible = false;
tank.add(marker);
const bbox = new THREE.Box3();
const bsize = new THREE.Vector3();
const bcen = new THREE.Vector3();
let edit = false;
let scrub = false;
let tab = 'rock';
let sel = null;
const brush = { c: BRUSH[1], r: 1 };
function updateMarker() {
  if (!sel) { marker.visible = false; return; }
  bbox.setFromObject(groups.get(sel.id));
  bbox.getSize(bsize);
  bbox.getCenter(bcen);
  marker.position.set(bcen.x, 1.15, bcen.z);
  marker.scale.set(bsize.x + 0.8, bsize.z + 0.8, 1);
  marker.visible = true;
}
function select(it) {
  sel = it;
  $('#eSel').classList.toggle('hidden', !it);
  updateMarker();
}
function addItem(kind) {
  if (ST.items.length >= 40) return toast('장식이 꽉 찼어요!');
  const it = { id: Math.random(), kind, x: rnd(-5, 5), z: rnd(-3, 3), r: 0, s: 1, c: 0 };
  ST.items.push(it);
  buildItem(it);
  updateSources();
  select(it);
  save();
  if (KINDS[kind].cat === 'rock') AU.stone(); else AU.plop();
}
$('#sRot').addEventListener('click', () => { if (!sel) return; sel.r = (sel.r + 1) % 4; buildItem(sel); updateMarker(); save(); AU.click(); });
$('#sSize').addEventListener('click', () => { if (!sel) return; sel.s = (sel.s + 1) % 3; buildItem(sel); updateSources(); updateMarker(); save(); AU.click(); });
$('#sCol').addEventListener('click', () => { if (!sel) return; sel.c = (sel.c + 1) % KINDS[sel.kind].pal.length; buildItem(sel); save(); AU.click(); });
$('#sDel').addEventListener('click', () => {
  if (!sel) return;
  const g = groups.get(sel.id);
  if (g) decor.remove(g);
  groups.delete(sel.id);
  ST.items = ST.items.filter(x => x !== sel);
  updateSources();
  select(null);
  save();
  AU.splash();
});

function renderTray() {
  const tabs = $('#eTabs');
  tabs.innerHTML = '';
  TABS.forEach(([k, label]) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = tab === k ? 'on' : '';
    b.addEventListener('click', () => { tab = k; select(null); AU.click(); renderTray(); });
    tabs.append(b);
  });
  const done = document.createElement('button');
  done.className = 'done';
  done.textContent = '완료';
  done.addEventListener('click', exitEdit);
  tabs.append(done);
  const items = $('#eItems');
  items.innerHTML = '';
  if (tab === 'gravel') {
    BRUSH.forEach(c => {
      const b = document.createElement('button');
      b.className = 'swc' + (brush.c === c ? ' on' : '');
      b.style.background = c;
      b.addEventListener('click', () => { brush.c = c; AU.click(); renderTray(); });
      items.append(b);
    });
    items.append(Object.assign(document.createElement('span'), { className: 'gap' }));
    [[0, '작게'], [1, '보통'], [2, '크게']].forEach(([r, label]) => {
      const b = document.createElement('button');
      b.className = 'it' + (brush.r === r ? ' on' : '');
      b.textContent = label;
      b.addEventListener('click', () => { brush.r = r; AU.click(); renderTray(); });
      items.append(b);
    });
    items.append(Object.assign(document.createElement('span'), { className: 'gap' }));
    Object.keys(PRESETS).forEach(k => {
      const b = document.createElement('button');
      b.className = 'swc';
      b.title = '한 번에 깔기';
      b.style.background = `linear-gradient(135deg, ${PRESETS[k].join(',')})`;
      b.addEventListener('click', () => { ST.gravel = k; fillGravel(k); recolorGravel(); save(); AU.stone(); });
      items.append(b);
    });
    return;
  }
  Object.keys(KINDS).filter(k => KINDS[k].cat === tab).forEach(k => {
    const pal = KINDS[k].pal[0];
    const b = document.createElement('button');
    b.className = 'it';
    b.innerHTML = `<i style="background:${Array.isArray(pal) ? pal[0] : pal}"></i>${KINDS[k].name}`;
    b.addEventListener('click', () => addItem(k));
    items.append(b);
  });
}
function enterEdit() {
  edit = true;
  document.body.classList.add('editing');
  $('#hud').classList.add('hidden');
  $('#edit').classList.remove('hidden');
  renderTray();
}
function exitEdit() {
  edit = false;
  select(null);
  document.body.classList.remove('editing');
  $('#hud').classList.remove('hidden');
  $('#edit').classList.add('hidden');
  save();
  AU.click();
}
function paintAt(i) {
  const a = Math.floor(i / GRW);
  const b = i % GRW;
  const r = brush.r;
  for (let da = -r; da <= r; da++) for (let db = -r; db <= r; db++) {
    if (da * da + db * db > r * r + 0.5) continue;
    const aa = a + da;
    const bb = b + db;
    if (aa < 0 || bb < 0 || aa >= GC || bb >= GRW) continue;
    const idx = aa * GRW + bb;
    ST.gc[idx] = brush.c;
    gravel.setColorAt(idx, tmpC.set(brush.c));
  }
  gravel.instanceColor.needsUpdate = true;
  saveSoon();
}

function paintScrubBar() {
  const pct = Math.round((1 - clamp(dirtLevel(), 0, 1)) * 100);
  $('#scPct').textContent = `✨ ${pct}%`;
  $('#scBar').style.width = pct + '%';
}
function enterScrub() {
  scrub = true;
  document.body.classList.add('scrubbing');
  $('#hud').classList.add('hidden');
  $('#scrub').classList.remove('hidden');
  algaeWalls.forEach(m => { m.userData.wasClean = ST.algae[m.userData.wall].every(v => v < 0.12); });
  paintScrubBar();
}
function exitScrub() {
  scrub = false;
  document.body.classList.remove('scrubbing');
  $('#hud').classList.remove('hidden');
  $('#scrub').classList.add('hidden');
  save();
  AU.click();
}
let lastSqueak = 0;
function scrubAt(hit) {
  const m = hit.object;
  const arr = ST.algae[m.userData.wall];
  const c0 = Math.floor(hit.uv.x * AC);
  const r0 = Math.floor((1 - hit.uv.y) * AR);
  let changed = false;
  for (let dc = -2; dc <= 2; dc++) for (let dr = -2; dr <= 2; dr++) {
    const c = c0 + dc;
    const r = r0 + dr;
    if (c < 0 || r < 0 || c >= AC || r >= AR) continue;
    const d = Math.hypot(dc, dr);
    if (d > 2.3) continue;
    const i = r * AC + c;
    if (arr[i] <= 0) continue;
    arr[i] = Math.max(0, arr[i] - 0.35 * (1 - d / 3));
    changed = true;
  }
  const now = performance.now();
  if (now - lastSqueak > 85) {
    lastSqueak = now;
    AU.squeak();
    sparkle(tank.worldToLocal(hit.point.clone()));
  }
  if (!changed) return;
  drawAlgae(m);
  applyWater();
  paintScrubBar();
  saveSoon();
  const clean = arr.every(v => v < 0.12);
  if (clean && !m.userData.wasClean) {
    m.userData.wasClean = true;
    AU.shine();
    toast('반짝 ✨');
  }
}

const TEXM = {};
function wallMat(w) {
    const key = w.join('|');
    if (TEXM[key]) return TEXM[key];
    if (w[2] === 'plain') {
        TEXM[key] = new THREE.MeshBasicMaterial({ color: w[0] });
      return TEXM[key];
    }
    const c = document.createElement('canvas');
    const x = c.getContext('2d');
    if (w[2] === 'sky') {
      c.width = 160;
      c.height = 80;
      const g = x.createLinearGradient(0, 0, 0, 80);
      g.addColorStop(0, w[0]);
      g.addColorStop(1, w[1]);
      x.fillStyle = g;
      x.fillRect(0, 0, 160, 80);
      x.fillStyle = '#ffffff';
      [[22, 14, 1], [70, 8, 0.8], [118, 20, 1.2], [96, 38, 0.7], [40, 44, 0.9]].forEach(([cx, cy, s]) => {
        x.fillRect(cx - 9 * s, cy, 18 * s, 4 * s);
        x.fillRect(cx - 6 * s, cy - 3 * s, 10 * s, 4 * s);
        x.fillRect(cx - 1 * s, cy - 5 * s, 7 * s, 5 * s);
      });
      const t = new THREE.CanvasTexture(c);
      t.magFilter = THREE.NearestFilter;
      t.minFilter = THREE.NearestFilter;
      t.colorSpace = THREE.SRGBColorSpace;
      TEXM[key] = new THREE.MeshBasicMaterial({ map: t });
      return TEXM[key];
    }
    c.width = 32;
    c.height = 32;
    x.fillStyle = w[0];
    x.fillRect(0, 0, 32, 32);
    x.fillStyle = w[1];
    if (w[2] === 'stripe') { x.fillRect(0, 0, 6, 32); x.fillRect(16, 0, 6, 32); }
    if (w[2] === 'dots') [[8, 8], [24, 24]].forEach(([a, b]) => { x.fillRect(a - 2, b - 3, 4, 6); x.fillRect(a - 3, b - 2, 6, 4); });
    if (w[2] === 'stars') [[5, 6], [20, 3], [27, 18], [12, 22], [3, 28]].forEach(([a, b], i) => { x.fillRect(a, b, 1, 1); if (i % 2 === 0) { x.fillRect(a - 1, b, 3, 1); x.fillRect(a, b - 1, 1, 3); } });
    if (w[2] === 'plaid') { x.globalAlpha = 0.5; x.fillRect(0, 12, 32, 6); x.fillRect(12, 0, 6, 32); x.globalAlpha = 0.25; x.fillStyle = '#000000'; x.fillRect(0, 26, 32, 2); x.fillRect(26, 0, 2, 32); x.globalAlpha = 1; }
    if (w[2] === 'leaves') [[8, 10], [24, 22], [22, 6], [6, 26]].forEach(([a, b]) => { x.fillRect(a - 1, b - 3, 2, 6); x.fillRect(a - 3, b - 1, 6, 2); });
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(40, 20);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    TEXM[key] = new THREE.MeshBasicMaterial({ map: t });
    return TEXM[key];
  }
  function currentTheme() {
    if (ST.theme !== 'auto' && THEMES[ST.theme]) return THEMES[ST.theme];
    const h = new Date().getHours();
    if (h < 6 || h >= 19) return THEMES.navy;
    if (h >= 17) return THEMES.apricot;
    return THEMES.sky;
  }
function applyTheme() {
  const th = currentTheme();
  scene.background.set(th.bg);
  wall.material = wallMat(th.wall);
  table.material = mat(th.table);
  hemi.intensity = th.hemi;
  sun.intensity = th.sun;
  sun.color.set(th.sunC);
  tankLight.intensity = th.tank;
  lamp.intensity = th.lamp;
  document.body.style.background = th.bg;
}

const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
const hitP = new THREE.Vector3();
let camA = 0;
let camH = 14;
let camR = 52;
let mode = null;
let drag = null;
let lastBrush = 0;
function setRay(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
}
function findItem(o) {
  while (o) { if (o.userData && o.userData.item) return o.userData.item; o = o.parent; }
  return null;
}
cv.addEventListener('pointerdown', e => {
  A();
  syncHum();
  cv.setPointerCapture(e.pointerId);
  setRay(e);
  if (scrub) {
    const h = ray.intersectObjects(algaeWalls);
    if (h.length) { mode = 'scrub'; scrubAt(h[0]); return; }
  }
  if (edit && tab === 'gravel') {
    const h = ray.intersectObject(gravel);
    if (h.length) { mode = 'paint'; paintAt(h[0].instanceId); AU.brush(); return; }
  }
  if (edit) {
    const h = ray.intersectObjects(decor.children, true);
    const it = h.length ? findItem(h[0].object) : null;
    if (it) { select(it); mode = 'item'; AU.click(); return; }
    select(null);
  }
  mode = 'cam';
  drag = { x: e.clientX, y: e.clientY, a: camA, h: camH, moved: false };
});
cv.addEventListener('pointermove', e => {
  if (mode === 'scrub') {
    setRay(e);
    const h = ray.intersectObjects(algaeWalls);
    if (h.length) scrubAt(h[0]);
    return;
  }
  if (mode === 'paint') {
    setRay(e);
    const h = ray.intersectObject(gravel);
    if (h.length) paintAt(h[0].instanceId);
    const now = performance.now();
    if (now - lastBrush > 90) { lastBrush = now; AU.brush(); }
    return;
  }
  if (mode === 'item' && sel) {
    setRay(e);
    if (ray.ray.intersectPlane(floor, hitP)) {
      sel.x = clamp(hitP.x, -TW + 1.5, TW - 1.5);
      sel.z = clamp(hitP.z, -TD + 1.5, TD - 1.5);
      const g = groups.get(sel.id);
      g.position.x = sel.x;
      g.position.z = sel.z;
      updateMarker();
    }
    return;
  }
  if (mode === 'cam' && drag) {
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (drag.moved) {
      camA = clamp(drag.a - dx * 0.005, -1.3, 1.3);
      camH = clamp(drag.h + dy * 0.06, 3, 45);
    }
  }
});
cv.addEventListener('pointerup', e => {
  if (mode === 'cam' && drag && !drag.moved && !edit && !scrub) clickAt(e);
  if (mode === 'item') { updateSources(); save(); AU.stone(); }
  if (mode === 'paint' || mode === 'scrub') save();
  mode = null;
  drag = null;
});
cv.addEventListener('wheel', e => { camR = clamp(camR + e.deltaY * 0.03, 24, 110); }, { passive: true });
function clickAt(e) {
    setRay(e);
    const hits = ray.intersectObjects(fishes.map(f => f.obj), true);
    if (hits.length && hits[0].object.userData.fish) return poke(hits[0].object.userData.fish);
    const sh2 = ray.intersectObject(surface);
    if (sh2.length) {
      const p = tank.worldToLocal(sh2[0].point.clone());
      return dropFood(p.x, p.z);
    }
    if (window.TANK && TANK.onTap) TANK.onTap(e);
  }

const modal = $('#modal');
const mBody = $('#mBody');
const closeModal = () => { modal.classList.add('hidden'); AU.click(); };
$('#mClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
function openAdd() {
  let pick = 'gold';
  mBody.innerHTML = `<h2>🐟 친구 데려오기</h2><div class="grid" id="spList"></div>
    <input id="nm" maxlength="8" placeholder="이름"><button class="go" id="goAdd">데려오기</button>
    <h3>우리 어항</h3><div id="myFish"></div>`;
  Object.keys(SPECIES).forEach(k => {
    const b = document.createElement('button');
    b.className = 'opt' + (k === pick ? ' on' : '');
    b.innerHTML = `<i style="background:${SPECIES[k].sw}"></i>${SPECIES[k].name}`;
    b.addEventListener('click', () => { pick = k; AU.click(); $('#spList').querySelectorAll('.opt').forEach(x => x.classList.toggle('on', x === b)); });
    $('#spList').append(b);
  });
  const paintList = () => {
    const box2 = $('#myFish');
    box2.innerHTML = '';
    ST.fish.forEach(d => {
      const r = document.createElement('div');
      r.className = 'row-f';
      r.innerHTML = '<span></span><button>보내주기</button>';
      r.querySelector('span').textContent = `${d.name} · ${SPECIES[d.type].name}`;
      r.querySelector('button').addEventListener('click', () => {
        ST.fish = ST.fish.filter(x => x.id !== d.id);
        const f = fishes.find(x => x.data.id === d.id);
        if (f) { tank.remove(f.obj); fishes.splice(fishes.indexOf(f), 1); }
        save();
        AU.splash();
        paintList();
      });
      box2.append(r);
    });
  };
  $('#goAdd').addEventListener('click', () => {
    if (ST.fish.length >= 10) return toast('어항이 꽉 찼어요!');
    const name = $('#nm').value.trim() || SPECIES[pick].name;
    const d = { id: Date.now(), type: pick, name: name, fed: 0 };
    ST.fish.push(d);
    save();
    spawnFish(d);
    AU.splash();
    toast(`${name} 어서 와요!`);
    $('#nm').value = '';
    paintList();
  });
  paintList();
  modal.classList.remove('hidden');
}
function openTheme() {
  mBody.innerHTML = '<h2>🏠 배경</h2><div class="grid" id="thList"></div>';
  Object.keys(THEMES).forEach(k => {
    const th = k === 'auto' ? currentTheme() : THEMES[k];
    const b = document.createElement('button');
    b.className = 'opt big' + (ST.theme === k ? ' on' : '');
    const sw = k === 'auto' ? 'linear-gradient(90deg,#f6e7d6 33%,#f1c3a3 33% 66%,#2a2f4f 66%)' : `linear-gradient(135deg, ${th.wall[0]} 50%, ${th.wall[1]} 50%)`;
    b.innerHTML = `<i style="background:${sw}"></i>${THEMES[k].name}`;
    b.addEventListener('click', () => {
      ST.theme = k;
      save();
      applyTheme();
      AU.click();
      $('#thList').querySelectorAll('.opt').forEach(x => x.classList.toggle('on', x === b));
    });
    $('#thList').append(b);
  });
  modal.classList.remove('hidden');
}

$('#bFeed').addEventListener('click', () => { A(); syncHum(); dropFood(rnd(-8, 8), rnd(-4, 4)); });
$('#bAdd').addEventListener('click', () => { A(); AU.click(); openAdd(); });
$('#bDeco').addEventListener('click', () => { A(); AU.click(); enterEdit(); });
$('#bClean').addEventListener('click', () => { A(); AU.click(); enterScrub(); });
$('#bTheme').addEventListener('click', () => { A(); AU.click(); openTheme(); });
$('#scDone').addEventListener('click', exitScrub);
const muteBtn = $('#bMute');
const paintMute = () => { muteBtn.textContent = ST.muted ? '🔇' : '🔊'; };
muteBtn.addEventListener('click', () => { ST.muted = !ST.muted; save(); A(); syncHum(); paintMute(); });
paintMute();

buildGravel();
buildAll();
ST.fish.forEach(spawnFish);
growAlgae();
applyTheme();
save();
setInterval(() => { applyTheme(); growAlgae(); }, 60000);

window.TANK = {
    THREE, scene, camera, renderer, cv, tank, fishes, foods, removeFood, ST, save, saveSoon, toast, tone, noise, AU,
    rnd, clamp, box, mat, V, TW, TD, TH, WL, BND, AC, AR, SPECIES, algaeWalls, drawAlgae, applyWater, paintScrubBar,
    sparkle, heart, spawnFish, sizeOf, currentTheme, ray, setRay, decor, hooks: [],
    get edit() { return edit; },
    get scrub() { return scrub; }
  };
const clock = new THREE.Clock();
const tmp = new THREE.Vector3();
let bubbleT = 0;
function loop() {
  const dt = Math.min(0.05, clock.getDelta());
  const now = clock.elapsedTime;
  camera.position.set(Math.sin(camA) * camR, camH, Math.cos(camA) * camR);
  camera.lookAt(0, 7, 0);
  fishes.forEach(f => updateFish(f, dt, now));
  for (let i = foods.length - 1; i >= 0; i--) {
    const fd = foods[i];
    fd.mesh.position.y = Math.max(1.1, fd.mesh.position.y - dt * 1.1);
    fd.mesh.position.x += Math.sin(now * 2 + fd.ph) * dt * 0.3;
    fd.life -= dt;
    if (fd.life <= 0) removeFood(fd);
  }
  bubbleT += dt;
  const want = sources.length ? 10 + 6 * Math.min(3, sources.length) : 0;
  if (bubbleT > 0.25 && bubbles.filter(b => !b.userData.extra).length < want) {
    bubbleT = 0;
    addBubble(sources[Math.floor(Math.random() * sources.length)]);
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.position.y += b.userData.sp * dt;
    b.position.x = b.userData.x0 + Math.sin(now * 3 + b.userData.ph) * 0.25;
    if (b.position.y > WL) {
      if (b.userData.extra || !sources.length) { tank.remove(b); bubbles.splice(i, 1); }
      else {
        const s = sources[Math.floor(Math.random() * sources.length)];
        b.position.copy(s);
        b.userData.x0 = s.x;
      }
    }
  }
  decor.children.forEach(g => { if (g.userData.sway) g.rotation.z = Math.sin(now * 1.2 + g.userData.ph) * 0.08; });
  for (let i = pops.length - 1; i >= 0; i--) {
    const h = pops[i];
    h.t += dt;
    h.g.position.y += dt * h.vy;
    h.g.scale.setScalar(Math.max(0.01, 1 - h.t / h.life));
    if (h.t >= h.life) { tank.remove(h.g); pops.splice(i, 1); }
  }
  if (tagState) {
    if (performance.now() > tagState.until || !fishes.includes(tagState.f)) {
      $('#tag').classList.add('hidden');
      tagState = null;
    } else {
      tmp.copy(tagState.f.obj.position).add(new THREE.Vector3(0, 1.8 * tagState.f.s, 0)).project(camera);
      $('#tag').style.left = ((tmp.x + 1) / 2 * innerWidth) + 'px';
      $('#tag').style.top = ((1 - tmp.y) / 2 * innerHeight) + 'px';
    }
  }
  TANK.hooks.forEach(h => h(dt, now));
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();