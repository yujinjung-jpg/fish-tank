const T = window.TANK;
const { THREE, tank, fishes, foods, ST, rnd, clamp, box, mat, V, TW, TD, WL, BND, AC, AR, SPECIES } = T;
const V3 = THREE.Vector3;
const $ = s => document.querySelector(s);
const ms = () => performance.now();
const todayKey = () => new Date().toDateString();
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return w + ((c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28) ? a : b); };
const lerpA = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
const WH = WL - 0.8;
const MONTH = new Date().getMonth() + 1;
const SIZES = [0.7, 1, 1.4];

ST.pearls = ST.pearls || 0;
ST.helpers = ST.helpers || [];
ST.eggs = ST.eggs || [];
ST.dex = ST.dex || {};
ST.owned = ST.owned || {};
ST.light = ST.light || 'none';
ST.lastPearl = ST.lastPearl || Date.now();

const SND = {
  knock() {
    T.tone(180, 0, 0.08, { to: 120, v: 0.18 });
    T.noise(0, 0.05, { type: 'lowpass', f: 900, v: 0.12 });
    T.tone(170, 0.14, 0.08, { to: 115, v: 0.15 });
    T.noise(0.14, 0.05, { type: 'lowpass', f: 900, v: 0.1 });
  },
  yawn() { T.tone(520, 0, 0.6, { to: 260, v: 0.05, type: 'triangle' }); },
  pearl() { [1318.5, 1760, 2349].forEach((f, k) => T.tone(f, k * 0.06, 0.35, { v: 0.06, type: 'triangle' })); },
  cheer() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, k) => T.tone(f, k * 0.08, 0.5, { v: 0.08, type: 'triangle' })); },
  shutter() { T.noise(0, 0.05, { type: 'highpass', f: 2000, v: 0.25 }); T.noise(0.08, 0.06, { type: 'bandpass', f: 1200, v: 0.18 }); },
  munch() { T.tone(rnd(900, 1300), 0, 0.04, { v: 0.015 }); },
  paper() { T.noise(0, 0.25, { type: 'bandpass', f: 2200, q: 0.8, v: 0.06 }); }
};

const css = document.createElement('style');
css.textContent = `
  .pearls { position: fixed; top: 16px; right: 18px; z-index: 5; display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 16px; background: rgba(255,250,240,.9); font-size: 22px; color: #3b2a1c; box-shadow: 0 4px 0 rgba(0,0,0,.1); }
  .pearls i, .price i { display: inline-block; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, #f3e9ff 50%, #cfc0e0); box-shadow: 0 0 6px #fff; }
  .price i { width: 14px; height: 14px; }
  .friends { position: fixed; top: 16px; left: 16px; z-index: 5; display: flex; flex-direction: column; gap: 6px; max-height: 70vh; overflow-y: auto; }
  .fr { display: flex; flex-direction: column; align-items: flex-start; padding: 4px 12px; border: none; border-radius: 12px; background: rgba(255,250,240,.88); cursor: pointer; font-family: inherit; color: #3b2a1c; box-shadow: 0 3px 0 rgba(0,0,0,.1); text-align: left; }
  .fr b { font-size: 18px; font-weight: normal; }
  .fr small { font-size: 12px; color: #ff6b8a; letter-spacing: 1px; }
  body.editing .friends, body.scrubbing .friends, body.editing .pearls, body.scrubbing .pearls { display: none; }
  .focus-clock { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 6; display: flex; align-items: center; gap: 10px; padding: 6px 16px; border-radius: 18px; background: rgba(255,250,240,.92); font-size: 30px; color: #3b2a1c; box-shadow: 0 4px 0 rgba(0,0,0,.1); }
  .focus-clock button { width: 30px; height: 30px; border: none; border-radius: 50%; background: #f3e3c3; cursor: pointer; }
  body.focusing .hud, body.focusing .friends { opacity: .3; transition: opacity .4s; }
  body.focusing .hud:hover, body.focusing .friends:hover { opacity: 1; }
  .note { margin-top: 8px; padding: 20px 22px; border-radius: 6px; background: repeating-linear-gradient(transparent 0 31px, rgba(140,100,60,.2) 31px 32px), #fffdf3; font-size: 24px; line-height: 32px; color: #3b2a1c; box-shadow: inset 0 0 20px rgba(160,120,60,.15); }
  .flash { position: fixed; inset: 0; z-index: 30; background: #fff; pointer-events: none; animation: flash .4s forwards; }
  @keyframes flash { to { opacity: 0; } }
  .shop-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 4px; border-bottom: 1px dashed #ead9bd; font-size: 19px; color: #3b2a1c; }
  .shop-row small { display: block; font-size: 14px; color: #8a6a4c; }
  .price { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border: none; border-radius: 12px; background: #ffe9b0; cursor: pointer; font-family: inherit; font-size: 18px; color: #3b2a1c; box-shadow: 0 3px 0 #e2cba5; white-space: nowrap; }
  .price.on { background: #c9f0e1; }
  .dex-row { display: flex; align-items: center; gap: 8px; padding: 6px 2px; font-size: 19px; color: #3b2a1c; }
  .dex-row span { display: inline-block; width: 18px; height: 18px; border-radius: 6px; }
  .dex-row em { margin-left: auto; font-style: normal; font-size: 15px; color: #8a6a4c; }
`;
document.head.append(css);

const pearlBox = document.createElement('div');
pearlBox.className = 'pearls';
pearlBox.innerHTML = '<i></i><span id="pCount">0</span>';
document.body.append(pearlBox);
const paintPearls = () => { $('#pCount').textContent = ST.pearls; };
paintPearls();
const friendsBox = document.createElement('div');
friendsBox.className = 'friends';
document.body.append(friendsBox);
const clockBox = document.createElement('div');
clockBox.className = 'focus-clock hidden';
clockBox.innerHTML = '<span id="fTime">25:00</span><button id="fStop" title="그만하기">✕</button>';
document.body.append(clockBox);
function hudBtn(icon, title, fn) {
  const b = document.createElement('button');
  b.textContent = icon;
  b.title = title;
  b.addEventListener('click', () => { T.AU.click(); fn(); });
  $('#bMute').before(b);
}
hudBtn('🐚', '진주 상점', () => openShop('shop'));
hudBtn('⏳', '집중 타이머', openFocus);
hudBtn('📷', '사진', takePhoto);
const mBody = $('#mBody');
const showModal = () => $('#modal').classList.remove('hidden');

const fx = [];
function addFx(obj, life, vy) { tank.add(obj); fx.push({ obj, t: 0, life, vy }); }
const zGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
function zzz(p) {
  const g = new THREE.Group();
  ['XXX', '..X', '.X.', 'X..', 'XXX'].forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch !== 'X') return;
    const m = new THREE.Mesh(zGeo, mat('#ffffff'));
    m.position.set((c - 1) * 0.12, -r * 0.12, 0);
    g.add(m);
  }));
  g.position.copy(p).add(new V3(0.6, 1, 0));
  addFx(g, 2, 0.6);
}

function addLove(f, v) { f.data.love = Math.min(100, (f.data.love || 0) + v); T.saveSoon(); }
const heartsOf = f => { const lv = Math.floor((f.data.love || 0) / 20); return '♥'.repeat(lv) + '♡'.repeat(5 - lv); };
function tintFish(f) {
  const v = f.data.variant;
  if (!v) return;
  f.obj.traverse(m => {
    if (!m.isMesh) return;
    const hsl = {};
    m.material.color.getHSL(hsl);
    if (hsl.s < 0.15) return;
    m.material = m.material.clone();
    m.material.color.offsetHSL(v, 0, 0);
  });
}
function babyFactor(d) { return d.baby ? 0.5 + Math.min(0.5, (d.fed || 0) * 0.025) : 1; }
function applyBaby(f) {
  if (f.data.baby && (f.data.fed || 0) >= 20) {
    f.data.baby = false;
    T.toast(`🎉 ${josa(f.data.name, '이', '가')} 다 컸어요!`);
    SND.cheer();
  }
  f.s = T.sizeOf(f.data) * babyFactor(f.data);
  f.obj.scale.setScalar(f.s);
}
function prepFish(f) {
  f.prepped = true;
  f.data.love = f.data.love || 0;
  tintFish(f);
  applyBaby(f);
  ST.dex[`${f.data.type}:${Math.round((f.data.variant || 0) * 100)}`] = true;
  if (MONTH === 12) {
    const hat = new THREE.Group();
    box(hat, 0, 0, 0, 1.4, 0.3, 1.4, '#ffffff');
    box(hat, 0, 0.45, 0, 1.1, 0.6, 1.1, '#e53935');
    box(hat, -0.2, 0.95, 0, 0.7, 0.5, 0.7, '#e53935');
    box(hat, -0.5, 1.25, 0, 0.35, 0.35, 0.35, '#ffffff');
    hat.position.set(0.6 * V, (f.data.type === 'jelly' ? 1.5 : 1.2) * V, 0);
    f.obj.add(hat);
    f.hat = hat;
    hat.visible = ST.season !== false;
  }
}

let night = false;
function checkNight() {
  const th = T.currentTheme();
  const h = new Date().getHours();
  const was = night;
  night = th.sun <= 0.3 || h >= 23 || h < 6;
  if (night && !was) T.toast('💤 물고기들이 잠들 시간이에요');
}
checkNight();
setInterval(checkNight, 5000);
const isAsleep = (f, n) => night && !(f.awake > n);
const home = f => new V3(Math.sin(f.t) * 8, 3.2 + (f.t % 1), Math.cos(f.t * 1.3) * 3.5);
const offsetOf = f => new V3(Math.sin(f.t * 3) * 1.5, Math.cos(f.t * 2) * 1, Math.sin(f.t) * 0.8);
function inside(p) {
  return new V3(clamp(p.x * 0.85, -BND.x, BND.x), clamp(p.y, BND.y0, BND.y1), clamp(p.z * 0.7, -BND.z, BND.z));
}

let curious = null;
let follow = null;
let lastFollow = 0;
T.onTap = e => {
  if (T.edit || T.scrub) return;
  T.setRay(e);
  const h = T.ray.intersectObjects(T.algaeWalls);
  if (!h.length) return;
  const p = tank.worldToLocal(h[0].point.clone());
  SND.knock();
  T.sparkle(p);
  const n = ms();
  curious = { p: inside(p), until: n + 3500 };
  fishes.forEach(f => {
    f.awake = n + 8000;
    if (!(f.tapCd > n)) { f.tapCd = n + 5000; addLove(f, 0.5); }
  });
};
T.cv.addEventListener('pointermove', e => {
  if (e.buttons || T.edit || T.scrub) return;
  const n = ms();
  if (n - lastFollow < 60) return;
  lastFollow = n;
  T.setRay(e);
  const h = T.ray.intersectObjects(T.algaeWalls);
  follow = h.length ? { p: inside(tank.worldToLocal(h[0].point.clone())), until: n + 700 } : null;
});
T.onEat = f => { addLove(f, 1); if (f.data.baby) applyBaby(f); };
T.onPoke = f => {
  const n = ms();
  if (isAsleep(f, n)) SND.yawn();
  f.awake = n + 15000;
  if (!(f.pokeCd > n)) { f.pokeCd = n + 8000; addLove(f, 3); }
  $('#tag').textContent = `${f.data.name} ${heartsOf(f)}`;
};
function callFish(f) {
  if ((f.data.love || 0) < 20) return T.toast(`${josa(f.data.name, '은', '는')} 아직 낯가려요 (♥ 하나부터)`);
  f.called = ms() + 6000;
  f.awake = ms() + 15000;
  T.AU.chirp();
}
function renderFriends() {
  friendsBox.innerHTML = '';
  const n = ms();
  fishes.forEach(f => {
    const b = document.createElement('button');
    b.className = 'fr';
    b.innerHTML = '<b></b><small></small>';
    b.querySelector('b').textContent = (isAsleep(f, n) ? '💤 ' : '') + f.data.name;
    b.querySelector('small').textContent = heartsOf(f);
    b.addEventListener('click', () => callFish(f));
    friendsBox.append(b);
  });
}
renderFriends();
setInterval(renderFriends, 2000);

function makeSnail() {
  const g = new THREE.Group();
  box(g, 0, 0.3, -0.3, 2.4, 0.6, 0.6, '#e8dcc0');
  box(g, 1.2, 0.8, -0.3, 0.5, 1, 0.5, '#e8dcc0');
  box(g, 1.2, 1.5, -0.15, 0.15, 0.7, 0.15, '#d8ccb0');
  box(g, 1.2, 1.9, -0.15, 0.25, 0.25, 0.25, '#222222');
  box(g, 1.35, 1.5, -0.45, 0.15, 0.6, 0.15, '#d8ccb0');
  box(g, 1.35, 1.85, -0.45, 0.22, 0.22, 0.22, '#222222');
  box(g, -0.2, 1.1, -0.6, 1.6, 1.6, 1, '#e8a3b5');
  box(g, -0.2, 1.1, -0.05, 1, 1, 0.1, '#f6c9d8');
  box(g, -0.2, 1.1, 0, 0.4, 0.4, 0.1, '#c98fb0');
  return g;
}
function makeShrimp() {
  const g = new THREE.Group();
  box(g, 0.6, 0.5, 0, 1, 0.7, 0.7, '#ff9f7a');
  box(g, -0.3, 0.55, 0, 1, 0.65, 0.65, '#ffb08f');
  box(g, -1.1, 0.5, 0, 0.8, 0.55, 0.55, '#ff9f7a');
  box(g, -1.7, 0.4, 0, 0.5, 0.45, 0.45, '#ffb08f');
  box(g, -2.1, 0.35, 0, 0.3, 0.6, 0.8, '#ff7f5a');
  box(g, 1.05, 0.8, 0.25, 0.2, 0.2, 0.2, '#222222');
  box(g, 1.05, 0.8, -0.25, 0.2, 0.2, 0.2, '#222222');
  box(g, 1.7, 1, 0.15, 1.4, 0.08, 0.08, '#ff7f5a');
  box(g, 1.7, 1, -0.15, 1.4, 0.08, 0.08, '#ff7f5a');
  for (let k = 0; k < 4; k++) {
    box(g, 0.4 - k * 0.4, 0.1, 0.25, 0.08, 0.3, 0.08, '#ff7f5a');
    box(g, 0.4 - k * 0.4, 0.1, -0.25, 0.08, 0.3, 0.08, '#ff7f5a');
  }
  return g;
}
const WALLS = {
  front: { o: new V3(-TW, 0.8, TD - 0.12), r: new V3(1, 0, 0), n: new V3(0, 0, 1), w: TW * 2 },
  back: { o: new V3(TW, 0.8, -TD + 0.12), r: new V3(-1, 0, 0), n: new V3(0, 0, -1), w: TW * 2 },
  left: { o: new V3(-TW + 0.12, 0.8, -TD), r: new V3(0, 0, 1), n: new V3(-1, 0, 0), w: TD * 2 },
  right: { o: new V3(TW - 0.12, 0.8, TD), r: new V3(0, 0, -1), n: new V3(1, 0, 0), w: TD * 2 }
};
const basisM = new THREE.Matrix4();
const UP = new V3(0, 1, 0);
function placeOnWall(o, wall, s, y) {
  const W = WALLS[wall];
  o.position.copy(W.o).addScaledVector(W.r, s).add(new V3(0, y, 0));
  basisM.makeBasis(W.r, UP, W.n);
  o.quaternion.setFromRotationMatrix(basisM);
}
const cellOf = (wall, s, y) => [clamp(Math.floor(s / WALLS[wall].w * AC), 0, AC - 1), clamp(Math.floor((1 - y / WH) * AR), 0, AR - 1)];
const wallMesh = w => T.algaeWalls.find(m => m.userData.wall === w);
const dirtyWalls = new Set();
const helpers = [];
function buildHelper(h) {
  if (h.type === 'snail') {
    const W = new THREE.Group();
    const S = makeSnail();
    W.add(S);
    W.userData.kind = 'helper';
    W.userData.helper = h;
    tank.add(W);
    if (!h.wall) h.wall = ['front', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
    if (h.s === undefined) { h.s = rnd(2, WALLS[h.wall].w - 2); h.y = rnd(1, WH - 1); h.a = rnd(0, 6.28); }
    helpers.push({ h, W, S, eatT: 0, steerT: 0 });
  } else {
    const W = makeShrimp();
    W.userData.kind = 'helper';
    W.userData.helper = h;
    tank.add(W);
    if (h.x === undefined) { h.x = rnd(-8, 8); h.z = rnd(-4, 4); }
    helpers.push({ h, W, tgt: new V3(rnd(-9, 9), 1.1, rnd(-5, 5)), heading: 0 });
  }
}
ST.helpers.forEach(buildHelper);
function updateSnail(o, dt) {
  const h = o.h;
  const W = WALLS[h.wall];
  const arr = ST.algae[h.wall];
  o.steerT -= dt;
  if (o.steerT <= 0) {
    o.steerT = 2.5;
    const [c0, r0] = cellOf(h.wall, h.s, h.y);
    let best = 0.15;
    let ba = h.a + rnd(-0.8, 0.8);
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * Math.PI * 2;
      const c = c0 + Math.round(Math.cos(a) * 3);
      const r = r0 - Math.round(Math.sin(a) * 3);
      if (c < 0 || r < 0 || c >= AC || r >= AR) continue;
      if (arr[r * AC + c] > best) { best = arr[r * AC + c]; ba = a; }
    }
    h.a = ba;
  }
  h.s += Math.cos(h.a) * 0.35 * dt;
  h.y += Math.sin(h.a) * 0.35 * dt;
  if (h.s < 0.8 || h.s > W.w - 0.8) { h.a = Math.PI - h.a; h.s = clamp(h.s, 0.8, W.w - 0.8); }
  if (h.y < 0.6 || h.y > WH - 0.8) { h.a = -h.a; h.y = clamp(h.y, 0.6, WH - 0.8); }
  placeOnWall(o.W, h.wall, h.s, h.y);
  const left = Math.cos(h.a) < 0;
  o.S.scale.x = left ? -1 : 1;
  o.S.rotation.z = left ? h.a - Math.PI : h.a;
  o.eatT -= dt;
  if (o.eatT <= 0) {
    o.eatT = 0.5;
    const [c0, r0] = cellOf(h.wall, h.s, h.y);
    let ate = false;
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
      const c = c0 + dc;
      const r = r0 + dr;
      if (c < 0 || r < 0 || c >= AC || r >= AR) continue;
      const i = r * AC + c;
      if (arr[i] > 0) { arr[i] = Math.max(0, arr[i] - 0.06); ate = true; }
    }
    if (ate) { dirtyWalls.add(h.wall); if (Math.random() < 0.3) SND.munch(); }
  }
}
function updateShrimp(o, dt, t) {
  const h = o.h;
  let tgt = o.tgt;
  const low = foods.filter(fd => fd.mesh.position.y < 1.5);
  if (low.length) {
    let best = null;
    let bd = 1e9;
    low.forEach(fd => { const d = Math.hypot(fd.mesh.position.x - h.x, fd.mesh.position.z - h.z); if (d < bd) { bd = d; best = fd; } });
    tgt = best.mesh.position;
    if (bd < 0.6) { T.removeFood(best); SND.munch(); }
  }
  const dx = tgt.x - h.x;
  const dz = tgt.z - h.z;
  const d = Math.hypot(dx, dz);
  if (tgt === o.tgt && d < 0.5) o.tgt.set(rnd(-9, 9), 1.1, rnd(-5, 5));
  if (d > 0.05) {
    h.x += dx / d * 0.9 * dt;
    h.z += dz / d * 0.9 * dt;
    o.heading = lerpA(o.heading, Math.atan2(-dz, dx), Math.min(1, dt * 5));
  }
  h.x = clamp(h.x, -TW + 1, TW - 1);
  h.z = clamp(h.z, -TD + 1, TD - 1);
  o.W.position.set(h.x, 1.05 + Math.abs(Math.sin(t * 9)) * 0.05, h.z);
  o.W.rotation.y = o.heading;
}

const eggGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const dotGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const eggObjs = [];
function buildEgg(e) {
  const g = new THREE.Group();
  [[0, 0, 0], [0.35, 0.05, 0.2], [-0.3, 0.05, 0.15], [0.1, 0.3, -0.2], [-0.15, 0.32, 0.25], [0.3, 0.3, -0.1]].forEach(([x, y, z]) => {
    const m = new THREE.Mesh(eggGeo, mat('#fff1b8', { transparent: true, opacity: 0.85 }));
    m.position.set(x, y, z);
    g.add(m);
    const d = new THREE.Mesh(dotGeo, mat('#ff9f7a'));
    d.position.set(x, y, z);
    g.add(d);
  });
  g.position.set(e.x, 1.3, e.z);
  g.userData.kind = 'egg';
  g.userData.egg = e;
  tank.add(g);
  eggObjs.push({ e, g });
}
ST.eggs.forEach(buildEgg);
function layEgg(type, variant, hatchMs) {
  const plants = ST.items.filter(it => ['kelp', 'grass', 'bush', 'coral', 'anemone'].includes(it.kind));
  const p = plants.length ? plants[Math.floor(Math.random() * plants.length)] : null;
  const e = { id: Math.random(), type, variant, at: Date.now(), hatchMs, x: p ? clamp(p.x + rnd(-1.2, 1.2), -10, 10) : rnd(-8, 8), z: p ? clamp(p.z + rnd(-1, 1), -5, 5) : rnd(-4, 4) };
  ST.eggs.push(e);
  buildEgg(e);
  T.save();
  T.toast(`🥚 ${SPECIES[type].name} 알이 생겼어요!`);
}
function eggCheck() {
  const day = todayKey();
  if (ST.eggDay === day) return;
  ST.eggDay = day;
  Object.keys(SPECIES).forEach(sp => {
    const pals = fishes.filter(f => f.data.type === sp && !f.data.baby && (f.data.love || 0) >= 40);
    if (pals.length < 2 || ST.eggs.some(e => e.type === sp)) return;
    if (fishes.length + ST.eggs.length >= 10) return;
    if (Math.random() < 0.6) layEgg(sp, rnd(-0.06, 0.06), 20 * 3600000);
  });
  T.saveSoon();
}
function hatchCheck() {
  const now = Date.now();
  eggObjs.slice().forEach(o => {
    if (now - o.e.at < o.e.hatchMs || fishes.length >= 10) return;
    tank.remove(o.g);
    eggObjs.splice(eggObjs.indexOf(o), 1);
    ST.eggs = ST.eggs.filter(x => x !== o.e);
    const d = { id: Date.now() + Math.random(), type: o.e.type, name: '아기 ' + SPECIES[o.e.type].name, fed: 0, love: 40, baby: true, variant: o.e.variant };
    ST.fish.push(d);
    T.spawnFish(d);
    T.save();
    SND.cheer();
    T.toast(`🐣 ${SPECIES[o.e.type].name} 아기가 태어났어요!`);
  });
}
setTimeout(eggCheck, 4000);
setInterval(eggCheck, 3600000);
setInterval(hatchCheck, 5000);

const pearls = [];
const pearlGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
function pearlSpot() {
  const chests = ST.items.filter(it => it.kind === 'chest');
  const shells = ST.items.filter(it => it.kind === 'shell');
  const list = chests.length ? chests : shells;
  if (list.length) {
    const it = list[Math.floor(Math.random() * list.length)];
    return new V3(it.x + rnd(-0.4, 0.4), 1.3 + (it.kind === 'chest' ? 2.4 : 3.2) * V * SIZES[it.s], it.z + rnd(-0.3, 0.3));
  }
  return new V3(rnd(-9, 9), 1.4, rnd(-5, 5));
}
function spawnPearl() {
  if (pearls.length >= 3) return;
  const m = new THREE.Mesh(pearlGeo, mat('#fffaf0', { emissive: 0x555555 }));
  m.position.copy(pearlSpot());
  m.userData = { kind: 'pearl', base: m.position.y, ph: rnd(0, 6) };
  tank.add(m);
  pearls.push(m);
}
function accruePearls() {
  const gap = 45 * 60000;
  const n = Math.floor((Date.now() - ST.lastPearl) / gap);
  if (n <= 0) return;
  ST.lastPearl += n * gap;
  for (let k = 0; k < Math.min(n, 3); k++) spawnPearl();
  T.saveSoon();
}
accruePearls();
setInterval(accruePearls, 60000);
function collectPearl(m) {
  tank.remove(m);
  pearls.splice(pearls.indexOf(m), 1);
  ST.pearls++;
  paintPearls();
  T.sparkle(m.position);
  SND.pearl();
  T.save();
}

const NOTES = [
  '오늘도 와줘서 고마워! 보글보글 💙',
  '물이 반짝반짝해서 기분 좋아~',
  '천천히 해도 괜찮아. 우리도 천천히 헤엄치거든 🐟',
  '오늘 하루도 수고했어. 꼬리로 토닥토닥',
  '밥 맛있었어! 내일도 놀러 와',
  '나 오늘 성 뒤에서 숨바꼭질했다? 아무도 못 찾았어 히히',
  '잠깐 쉬어가도 돼. 같이 멍 때리자 ~',
  '너는 생각보다 훨씬 잘하고 있어. 진짜야!'
];
let bottle = null;
function makeBottle() {
  const g = new THREE.Group();
  const glass = { transparent: true, opacity: 0.55 };
  box(g, 0, 0, 0, 1.2, 2.2, 1.2, '#bfe8ff', glass);
  box(g, 0, 1.4, 0, 0.6, 0.7, 0.6, '#bfe8ff', glass);
  box(g, 0, 1.95, 0, 0.6, 0.4, 0.6, '#c98f52');
  box(g, 0, 0, 0, 0.6, 1.4, 0.6, '#fff3dc');
  box(g, 0, 0.2, 0, 0.65, 0.2, 0.65, '#ff8fb1');
  return g;
}
function spawnBottle() {
  if (bottle || ST.lastBottle === todayKey()) return;
  const g = makeBottle();
  g.userData.kind = 'bottle';
  g.position.set(rnd(-7, 7), WL, rnd(-3, 3));
  tank.add(g);
  bottle = { g, ph: rnd(0, 6) };
  T.AU.plop();
}
setTimeout(spawnBottle, rnd(20000, 60000));
function openBottle() {
  const f = fishes.length ? fishes[Math.floor(Math.random() * fishes.length)] : null;
  tank.remove(bottle.g);
  bottle = null;
  ST.lastBottle = todayKey();
  T.save();
  SND.paper();
  mBody.innerHTML = '<h2></h2><div class="note"></div>';
  mBody.querySelector('h2').textContent = f ? `💌 ${josa(f.data.name, '이', '가')} 보낸 쪽지` : '💌 쪽지';
  mBody.querySelector('.note').textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
  showModal();
}

T.cv.addEventListener('pointerdown', e => {
  if (T.edit || T.scrub) return;
  const list = pearls.concat(eggObjs.map(o => o.g), bottle ? [bottle.g] : [], helpers.map(o => o.W));
  if (!list.length) return;
  T.setRay(e);
  const hit = T.ray.intersectObjects(list, true)[0];
  if (!hit) return;
  e.stopImmediatePropagation();
  let o = hit.object;
  while (o && !o.userData.kind) o = o.parent;
  if (!o) return;
  const k = o.userData.kind;
  if (k === 'pearl') collectPearl(o);
  if (k === 'bottle') openBottle();
  if (k === 'egg') {
    const eg = o.userData.egg;
    const hrs = Math.max(1, Math.ceil((eg.hatchMs - (Date.now() - eg.at)) / 3600000));
    T.toast(`🥚 ${hrs}시간쯤 뒤에 태어나요`);
    o.userData.wig = 0.6;
    T.AU.click();
  }
  if (k === 'helper') {
    T.sparkle(o.position);
    T.AU.chirp();
    T.toast(o.userData.helper.type === 'snail' ? '느릿느릿 냠냠 🐌' : '종종종 🦐');
  }
}, true);

const floaters = [];
const snowflakes = [];
function floater(obj) {
  obj.position.set(rnd(-10, 10), WL + 0.08, rnd(-5, 5));
  obj.userData.ph = rnd(0, 6);
  tank.add(obj);
  floaters.push(obj);
}
function flat(color, w, d) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), mat(color));
  m.rotation.y = rnd(0, 6);
  return m;
}
const leafGeo = new THREE.BoxGeometry(0.2, 0.06, 0.2);
function leaf(color) {
  const g = new THREE.Group();
  ['..X..', 'X.X.X', 'XXXXX', 'XXXXX', '.XXX.', '..X..'].forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch !== 'X') return;
    const m = new THREE.Mesh(leafGeo, mat(c === 2 ? sh2(color) : color));
    m.position.set((c - 2) * 0.2, 0, (r - 2.5) * 0.2);
    g.add(m);
  }));
  const stem = new THREE.Mesh(leafGeo, mat('#8a5a3b'));
  stem.position.set(0, 0, 0.75);
  g.add(stem);
  g.rotation.y = rnd(0, 6);
  return g;
}
function sh2(hex) { return '#' + new THREE.Color(hex).lerp(new THREE.Color(0x000000), 0.18).getHexString(); }
if ([9, 10, 11].includes(MONTH)) for (let k = 0; k < 10; k++) floater(leaf(['#f2994a', '#e85a5a', '#f2c94c', '#d9772f'][k % 4]));
if ([9, 10, 11].includes(MONTH)) for (let k = 0; k < 10; k++) floater(flat(['#f2994a', '#e85a5a', '#f2c94c', '#c97a3a'][k % 4], 0.8, 0.5));
if ([6, 7, 8].includes(MONTH)) {
  const duck = new THREE.Group();
  box(duck, 0, 0.5, 0, 2, 1.2, 1.6, '#ffd84d');
  box(duck, 0.9, 1.5, 0, 1, 1, 1, '#ffd84d');
  box(duck, 1.55, 1.4, 0, 0.5, 0.3, 0.5, '#ff9f3a');
  box(duck, 1.2, 1.7, 0.45, 0.2, 0.2, 0.1, '#222222');
  box(duck, 1.2, 1.7, -0.45, 0.2, 0.2, 0.1, '#222222');
  box(duck, -1.1, 0.9, 0, 0.4, 0.5, 0.6, '#ffd84d');
  floater(duck);
  const melon = new THREE.Group();
  box(melon, 0, 0.15, 0, 2, 0.3, 1.4, '#ff6b6b');
  box(melon, 0, 0.15, -0.75, 2, 0.3, 0.2, '#4caf50');
  box(melon, 0, 0.15, -0.6, 2, 0.3, 0.1, '#fff3dc');
  [[-0.5, 0.2], [0.3, 0.3], [0.6, -0.1]].forEach(([x, z]) => box(melon, x, 0.32, z, 0.15, 0.05, 0.2, '#222222'));
  floater(melon);
}
if ([12, 1, 2].includes(MONTH)) {
  for (let k = 0; k < 40; k++) {
    const m = new THREE.Mesh(zGeo, mat('#ffffff'));
    m.position.set(rnd(-TW + 1, TW - 1), rnd(1, WL), rnd(-TD + 1, TD - 1));
    m.userData.ph = rnd(0, 6);
    tank.add(m);
    snowflakes.push(m);
  }
}
const SEASON_ICON = [3, 4, 5].includes(MONTH) ? '🌸' : [6, 7, 8].includes(MONTH) ? '🦆' : [9, 10, 11].includes(MONTH) ? '🍂' : '❄️';
function applySeason() {
  const on = ST.season !== false;
  floaters.forEach(o => { o.visible = on; });
  snowflakes.forEach(m => { m.visible = on; });
  fishes.forEach(f => { if (f.hat) f.hat.visible = on; });
}
applySeason();
$('#bTheme').addEventListener('click', () => {
  const h = document.createElement('h3');
  h.textContent = '계절 장식';
  const b = document.createElement('button');
  b.className = 'opt';
  b.style.cssText = 'width:100%;flex-direction:row;justify-content:center;font-size:20px';
  const paint = () => {
    const on = ST.season !== false;
    b.textContent = `${SEASON_ICON} ${on ? '켜짐' : '꺼짐'}`;
    b.classList.toggle('on', on);
  };
  b.addEventListener('click', () => {
    ST.season = ST.season === false;
    applySeason();
    T.save();
    T.AU.click();
    paint();
  });
  paint();
  mBody.append(h, b);
});
const LIGHTS = { none: ['끄기', null, 0], purple: ['보라', '#b07cff', 2], pink: ['분홍', '#ff8fd0', 2], mint: ['민트', '#7fe3c4', 2], gold: ['노랑', '#ffd166', 2] };
const led = new THREE.PointLight(0xffffff, 0, 34, 1);
led.position.set(0, WL - 1, 0);
tank.add(led);
function applyLight() {
  const L = LIGHTS[ST.light] || LIGHTS.none;
  if (!L[1]) { led.intensity = 0; return; }
  led.color.set(L[1]);
  led.intensity = 9;
}
applyLight();

function buy(price, fn) {
  if (ST.pearls < price) return T.toast('진주가 부족해요');
  ST.pearls -= price;
  paintPearls();
  fn();
  T.save();
  SND.pearl();
}
function openShop(tab) {
  mBody.innerHTML = '<h2>🐚 진주 상점</h2><div class="tabs" id="shTabs"></div><div id="shBody" style="margin-top:12px"></div>';
  [['shop', '상점'], ['light', '조명'], ['dex', '도감']].forEach(([k, label]) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = tab === k ? 'on' : '';
    b.addEventListener('click', () => { T.AU.click(); openShop(k); });
    $('#shTabs').append(b);
  });
  const body = $('#shBody');
  const row = (title, sub, price, label, fn, on) => {
    const r = document.createElement('div');
    r.className = 'shop-row';
    r.innerHTML = '<div><span></span><small></small></div><button class="price"></button>';
    r.querySelector('span').textContent = title;
    r.querySelector('small').textContent = sub;
    const b = r.querySelector('button');
    if (label) b.textContent = label; else b.innerHTML = `<i></i>${price}`;
    if (on) b.classList.add('on');
    b.addEventListener('click', fn);
    body.append(r);
  };
  if (tab === 'shop') {
    row('달팽이', '유리 이끼를 조금씩 먹어줘요', 3, null, () => {
      if (ST.helpers.length >= 4) return T.toast('도우미는 4마리까지예요');
      buy(3, () => { const h = { id: Math.random(), type: 'snail' }; ST.helpers.push(h); buildHelper(h); T.toast('🐌 달팽이가 왔어요!'); });
    });
    row('새우', '바닥에 떨어진 먹이를 주워 먹어요', 3, null, () => {
      if (ST.helpers.length >= 4) return T.toast('도우미는 4마리까지예요');
      buy(3, () => { const h = { id: Math.random(), type: 'shrimp' }; ST.helpers.push(h); buildHelper(h); T.toast('🦐 새우가 왔어요!'); });
    });
    row('무지개 알', '희귀한 색 아기가 1시간 뒤에 태어나요', 8, null, () => {
      if (fishes.length + ST.eggs.length >= 10) return T.toast('어항이 꽉 찼어요!');
      const types = Object.keys(SPECIES);
      buy(8, () => layEgg(types[Math.floor(Math.random() * types.length)], rnd(0.25, 0.75), 3600000));
    });
  }
  if (tab === 'light') {
    Object.keys(LIGHTS).forEach(k => {
      const [name, , price] = LIGHTS[k];
      const owned = k === 'none' || ST.owned['light_' + k];
      row(name + (k === 'none' ? '' : ' 조명'), owned ? (ST.light === k ? '켜져 있어요' : '눌러서 켜기') : '진주로 사기', price, owned ? (ST.light === k ? '사용 중' : '켜기') : null, () => {
        const apply = () => { ST.light = k; applyLight(); T.save(); openShop('light'); };
        if (owned) { T.AU.click(); apply(); }
        else buy(price, () => { ST.owned['light_' + k] = true; apply(); });
      }, ST.light === k);
    });
  }
  if (tab === 'dex') {
    Object.keys(SPECIES).forEach(sp => {
      const vars = Object.keys(ST.dex).filter(key => key.startsWith(sp + ':')).map(key => Number(key.split(':')[1]) / 100);
      const r = document.createElement('div');
      r.className = 'dex-row';
      r.innerHTML = `<b style="font-weight:normal;min-width:70px"></b>${vars.map(v => `<span style="background:${SPECIES[sp].sw};filter:hue-rotate(${Math.round(v * 360)}deg)"></span>`).join('')}<em></em>`;
      r.querySelector('b').textContent = vars.length ? SPECIES[sp].name : '???';
      r.querySelector('em').textContent = `${vars.length}종`;
      body.append(r);
    });
  }
  showModal();
}

let focus = null;
function openFocus() {
  if (focus) return stopFocus();
  mBody.innerHTML = '<h2>⏳ 집중 타이머</h2><div class="grid" id="fMins"></div><button class="go" id="fGo" style="margin-top:14px">시작</button>';
  let pick = 25;
  [15, 25, 50].forEach(mn => {
    const b = document.createElement('button');
    b.className = 'opt' + (mn === pick ? ' on' : '');
    b.textContent = mn + '분';
    b.addEventListener('click', () => { pick = mn; T.AU.click(); $('#fMins').querySelectorAll('.opt').forEach(x => x.classList.toggle('on', x === b)); });
    $('#fMins').append(b);
  });
  $('#fGo').addEventListener('click', () => {
    $('#modal').classList.add('hidden');
    focus = { end: Date.now() + pick * 60000, min: pick };
    clockBox.classList.remove('hidden');
    document.body.classList.add('focusing');
    T.toast('천천히, 함께 집중해요 🐟');
  });
  showModal();
}
function stopFocus() {
  focus = null;
  clockBox.classList.add('hidden');
  document.body.classList.remove('focusing');
  document.title = '작은 어항 🐠';
}
$('#fStop').addEventListener('click', () => { stopFocus(); T.AU.click(); });
function finishFocus() {
  const reward = Math.max(1, Math.round(focus.min / 12));
  stopFocus();
  ST.pearls += reward;
  paintPearls();
  T.save();
  fishes.forEach(f => { f.vel.y = 5; f.awake = ms() + 15000; T.heart(f.obj.position); });
  SND.cheer();
  T.toast(`🎉 수고했어요! 진주 +${reward}`);
}

function takePhoto() {
  T.renderer.render(T.scene, T.camera);
  const src = T.cv.toDataURL('image/png');
  const flash = document.createElement('div');
  flash.className = 'flash';
  document.body.append(flash);
  setTimeout(() => flash.remove(), 450);
  SND.shutter();
  const img = new Image();
  img.onload = () => {
    const sc = 3;
    const w = img.width * sc;
    const h = img.height * sc;
    const c = document.createElement('canvas');
    c.width = w + 60;
    c.height = h + 130;
    const x = c.getContext('2d');
    x.fillStyle = '#fffaf0';
    x.fillRect(0, 0, c.width, c.height);
    x.imageSmoothingEnabled = false;
    x.drawImage(img, 30, 30, w, h);
    const d = new Date();
    x.fillStyle = '#5a3d24';
    x.font = '40px Gaegu';
    x.fillText('작은 어항 🐠', 30, h + 92);
    x.font = '28px Gaegu';
    x.textAlign = 'right';
    x.fillText(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`, c.width - 30, h + 92);
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `tiny-tank-${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}-${d.getHours()}${d.getMinutes()}.png`;
    a.click();
    T.toast('📷 사진을 저장했어요');
  };
  img.src = src;
}
const zCss = document.createElement('style');
zCss.textContent = `
  .zbub { position: fixed; z-index: 4; padding: 2px 10px; border-radius: 12px; background: #fffaf0; font-size: 18px; color: #6a7bb5; white-space: nowrap; pointer-events: none; box-shadow: 0 3px 0 rgba(0,0,0,.15); transform: translate(-50%, -100%); animation: zfloat 2s ease-in-out infinite; }
  .zbub::after { content: ''; position: absolute; left: 50%; bottom: -6px; margin-left: -6px; border: 6px solid transparent; border-bottom: 0; border-top-color: #fffaf0; }
  @keyframes zfloat { 0%, 100% { transform: translate(-50%, -100%); } 50% { transform: translate(-50%, calc(-100% - 5px)); } }
  body.editing .zbub, body.scrubbing .zbub { display: none; }
`;
document.head.append(zCss);
const zBubs = new Map();
const zTmp = new V3();
function updateBubbles(n, fed, t) {
  fishes.forEach(f => {
    let el = zBubs.get(f);
    const show = isAsleep(f, n) && !fed && !f.called;
    if (!show) { if (el) el.style.display = 'none'; return; }
    if (!el) {
      el = document.createElement('div');
      el.className = 'zbub';
      el.style.animationDelay = `-${(f.t % 2).toFixed(2)}s`;
      document.body.append(el);
      zBubs.set(f, el);
    }
    zTmp.copy(f.obj.position).add(new V3(0, 1.8 * f.s, 0)).project(T.camera);
    if (zTmp.z > 1) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.style.left = ((zTmp.x + 1) / 2 * innerWidth) + 'px';
    el.style.top = ((1 - zTmp.y) / 2 * innerHeight) + 'px';
    el.textContent = ['z', 'zz', 'zzZ'][Math.floor((t * 1.2 + f.t) % 3)];
  });
  zBubs.forEach((el, f) => { if (!fishes.includes(f)) { el.remove(); zBubs.delete(f); } });
}
let redrawT = 0;

T.hooks.push((dt, t) => {
  const n = ms();
  const fed = foods.length > 0;
  let followers = [];
  if (follow && follow.until > n) {
    followers = fishes.filter(f => !isAsleep(f, n)).sort((a, b) => a.obj.position.distanceTo(follow.p) - b.obj.position.distanceTo(follow.p)).slice(0, 2);
  }
  const steer = (f, p, mul) => {
    f.target.copy(p);
    f.mul = fed ? 1 : (f.obj.position.distanceTo(p) < 1.5 ? 0 : mul);
  };
  fishes.forEach(f => {
    if (!f.prepped) prepFish(f);
    f.mul = 1;
    const asleep = isAsleep(f, n);
    if (f.called && f.called > n) {
      f.target.set(0, 7, TD - 2.5);
      f.mul = 1.8;
      if (f.obj.position.distanceTo(f.target) < 1.6) {
        f.called = 0;
        f.spin = 0.8;
        f.spinA = 0;
        T.heart(f.obj.position);
        T.AU.chirp();
        addLove(f, 1);
      }
    } else if (curious && curious.until > n && !asleep) {
      steer(f, curious.p.clone().add(offsetOf(f)), 1.5);
    } else if (followers.includes(f)) {
      steer(f, follow.p.clone().add(offsetOf(f).multiplyScalar(0.5)), 0.9);
    } else if (asleep) {
      steer(f, home(f), 0.3);
      f.zT = (f.zT === undefined ? rnd(1, 3) : f.zT) - dt;
      if (f.zT <= 0 && !fed) { f.zT = rnd(2.5, 4.5); zzz(f.obj.position); }
    }
    if (focus) f.mul *= 0.6;
    if (f.spin > 0) {
      f.spin -= dt;
      f.spinA += dt * 14;
      f.obj.rotation.y = (f.heading || 0) + f.spinA;
    }
  });
  updateBubbles(n, fed, t);
  helpers.forEach(o => { if (o.h.type === 'snail') updateSnail(o, dt); else updateShrimp(o, dt, t); });
  redrawT += dt;
  if (redrawT > 0.8 && dirtyWalls.size) {
    redrawT = 0;
    dirtyWalls.forEach(w => T.drawAlgae(wallMesh(w)));
    dirtyWalls.clear();
    T.applyWater();
    if (T.scrub) T.paintScrubBar();
    T.saveSoon();
  }
  eggObjs.forEach(o => {
    const left = o.e.hatchMs - (Date.now() - o.e.at);
    const wig = o.g.userData.wig || 0;
    o.g.rotation.z = (left < o.e.hatchMs * 0.2 || wig > 0) ? Math.sin(t * 12) * 0.12 : 0;
    if (wig > 0) o.g.userData.wig = wig - dt;
  });
  pearls.forEach(m => {
    m.position.y = m.userData.base + Math.sin(t * 2 + m.userData.ph) * 0.12;
    m.rotation.y += dt;
  });
  if (bottle) {
    const p = bottle.g.position;
    if (p.y > 1.7) p.y = Math.max(1.7, p.y - dt * 0.8);
    bottle.g.rotation.z = 1.3 + Math.sin(t * 2 + bottle.ph) * 0.15;
  }
  floaters.forEach(o => {
    const ph = o.userData.ph;
    o.position.x = clamp(o.position.x + Math.sin(t * 0.3 + ph) * dt * 0.4, -TW + 1, TW - 1);
    o.position.z = clamp(o.position.z + Math.cos(t * 0.25 + ph) * dt * 0.3, -TD + 1, TD - 1);
    o.position.y = WL + 0.08 + Math.sin(t * 1.5 + ph) * 0.05;
    o.rotation.y += dt * 0.2;
  });
  snowflakes.forEach(m => {
    m.position.y -= dt * 0.5;
    m.position.x += Math.sin(t + m.userData.ph) * dt * 0.2;
    if (m.position.y < 1.1) m.position.y = WL - 0.2;
  });
  for (let i = fx.length - 1; i >= 0; i--) {
    const e = fx[i];
    e.t += dt;
    e.obj.position.y += dt * e.vy;
    e.obj.scale.setScalar(Math.max(0.01, 1 - e.t / e.life));
    if (e.t >= e.life) { tank.remove(e.obj); fx.splice(i, 1); }
  }
  if (focus) {
    const left = Math.max(0, focus.end - Date.now());
    const mm = String(Math.floor(left / 60000)).padStart(2, '0');
    const ss = String(Math.floor(left % 60000 / 1000)).padStart(2, '0');
    $('#fTime').textContent = `${mm}:${ss}`;
    document.title = `⏳ ${mm}:${ss} · 작은 어항`;
    if (left <= 0) finishFocus();
  }
});
console.log('✅ fun.js ready!');