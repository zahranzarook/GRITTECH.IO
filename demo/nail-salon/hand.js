// Lumi — 3D try-on hand.
// Loads a rigged hand, poses it, bakes it into a static mesh, then grows
// five nails that hug the real fingertip surface. Shade, finish and shape can be
// changed live; the polish bottle beside the hand follows the shade.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const FINGERS = ['thumb', 'index-finger', 'middle-finger', 'ring-finger', 'pinky-finger'];

// Relaxed, elegant pose (radians, negative = curl toward the palm).
const POSE = {
  'index-finger':  [-0.04, -0.08, -0.05],
  'middle-finger': [-0.06, -0.10, -0.06],
  'ring-finger':   [-0.10, -0.14, -0.08],
  'pinky-finger':  [-0.16, -0.18, -0.10],
};
const SPREAD = { 'index-finger': -0.05, 'middle-finger': 0.0, 'ring-finger': 0.06, 'pinky-finger': 0.14 };

// Nail width as a share of finger width, nail length share of the distal segment.
const NAIL = {
  thumb:           { w: 0.86, start: 0.2 },
  'index-finger':  { w: 0.84, start: 0.2 },
  'middle-finger': { w: 0.84, start: 0.2 },
  'ring-finger':   { w: 0.84, start: 0.22 },
  'pinky-finger':  { w: 0.82, start: 0.24 },
};

// Half-width multiplier along the nail (v: 0 = cuticle, 1 = free edge tip).
const SHAPES = {
  square:   v => cuticle(v) * (v > 0.94 ? Math.sqrt(Math.max(0, 1 - ((v - 0.94) / 0.06) ** 2)) * 0.25 + 0.75 : 1),
  oval:     v => cuticle(v) * (v > 0.62 ? Math.sqrt(Math.max(0, 1 - ((v - 0.62) / 0.38) ** 2)) : 1),
  almond:   v => cuticle(v) * (v > 0.5 ? Math.max(0, 1 - ((v - 0.5) / 0.5) ** 1.7) ** 0.75 : 1),
  stiletto: v => cuticle(v) * (v > 0.35 ? Math.max(0, 1 - (v - 0.35) / 0.65) ** 0.95 : 1),
  coffin:   v => cuticle(v) * (v > 0.5 ? 1 - 0.42 * ((v - 0.5) / 0.5) : 1) * (v > 0.97 ? 0.6 + 0.4 * (1 - (v - 0.97) / 0.03) : 1),
};
// free-edge length past the fingertip, as a share of the distal segment
const LENGTHS = { square: 0.15, oval: 0.3, almond: 0.55, stiletto: 0.9, coffin: 0.7 };
function cuticle(v) { const c = 0.16; return v < c ? Math.sqrt(Math.max(0, 1 - ((c - v) / c) ** 2)) * 0.9 + 0.1 : 1; }

export async function createHandStage(canvas, { url, onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 10);
  camera.position.set(0, 0, 0.62);

  scene.add(new THREE.HemisphereLight(0xfff0fb, 0x6b3a8f, 0.55));
  const key = new THREE.DirectionalLight(0xfff4ee, 1.8); key.position.set(-0.6, 1, 1.2); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff7ad9, 1.5); rim.position.set(1.2, 0.4, -0.8); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xb18cff, 1.2); fill.position.set(-1.2, -0.6, 0.4); scene.add(fill);

  // ---------- hand ----------
  const gltf = await new GLTFLoader().loadAsync(url);
  let skinned;
  gltf.scene.traverse(o => { if (o.isSkinnedMesh) skinned = o; });
  const bone = name => gltf.scene.getObjectByName(name);

  // The joints are siblings (not a hierarchy), so curling a joint means rotating
  // it and every joint after it in the chain around its own position.
  const chain = f => (f === 'thumb'
    ? ['metacarpal', 'phalanx-proximal', 'phalanx-distal', 'tip']
    : ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip']).map(j => bone(`${f}-${j}`));
  function bend(f, from, axis, angle) {
    const js = chain(f), pivotJ = js[from];
    const ax = axis.clone().applyQuaternion(pivotJ.quaternion).normalize();
    const q = new THREE.Quaternion().setFromAxisAngle(ax, angle);
    for (let k = from; k < js.length; k++) {
      const j = js[k];
      if (k > from) j.position.sub(pivotJ.position).applyQuaternion(q).add(pivotJ.position);
      j.quaternion.premultiply(q);
    }
  }
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);
  for (const f of Object.keys(POSE)) {
    const [a, b, c] = POSE[f];
    bend(f, 1, Y, SPREAD[f]);
    bend(f, 1, X, a); bend(f, 2, X, b); bend(f, 3, X, c);
  }
  bend('thumb', 1, X, -0.08); bend('thumb', 2, X, -0.12);
  bend('thumb', 1, new THREE.Vector3(0, 0, 1), -0.55);
  gltf.scene.updateMatrixWorld(true);
  skinned.skeleton.update();

  // Bake the posed skin into a static, smoothed mesh.
  const src = skinned.geometry;
  const pos = src.attributes.position, v = new THREE.Vector3();
  const baked = new THREE.BufferGeometry();
  const arr = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i); skinned.applyBoneTransform(i, v); v.applyMatrix4(skinned.matrixWorld);
    arr.set([v.x, v.y, v.z], i * 3);
  }
  baked.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  baked.setIndex(src.index.clone());
  let geo = mergeVertices(baked, 1e-5);
  geo.computeVertexNormals();

  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xdc9474, roughness: 0.55, metalness: 0, envMapIntensity: 0.35,
    sheen: 0.35, sheenColor: new THREE.Color(0xff9fb8), sheenRoughness: 0.5,
    clearcoat: 0.05, clearcoatRoughness: 0.6,
  });
  const skin = new THREE.Mesh(geo, skinMat);

  // Joint frames for the nails, in the same (world == hand-local) space.
  const frames = FINGERS.map(f => {
    const d = bone(`${f}-phalanx-distal`), t = bone(`${f}-tip`);
    const p0 = d.getWorldPosition(new THREE.Vector3()), p1 = t.getWorldPosition(new THREE.Vector3());
    const q = d.getWorldQuaternion(new THREE.Quaternion());
    const fwd = p1.clone().sub(p0).normalize();
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    up.sub(fwd.clone().multiplyScalar(up.dot(fwd))).normalize();
    const side = new THREE.Vector3().crossVectors(fwd, up).normalize();
    return { f, p0, p1, fwd, up, side, len: p0.distanceTo(p1) };
  });

  // Rest the hand: back of hand toward the camera, fingers up and leaning left.
  const hand = new THREE.Group();
  hand.add(skin);
  const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0));
  const rest = new THREE.Quaternion().setFromRotationMatrix(basis);
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, -0.38, 0.38, 'YXZ'));
  rest.premultiply(tilt);
  const pivot = new THREE.Group(); pivot.add(hand); scene.add(pivot);
  hand.quaternion.copy(rest);
  // centre on the knuckles/fingers, wrist drifts off the bottom edge
  const mid = frames[2].p0.clone().lerp(bone('wrist').getWorldPosition(new THREE.Vector3()), 0.42);
  hand.position.copy(mid.applyQuaternion(rest).multiplyScalar(-1));
  hand.position.y -= 0.012;
  hand.position.x += 0.012;

  // ---------- nails ----------
  const ray = new THREE.Raycaster();
  // Per finger, a small mesh with only the fingertip triangles keeps raycasts cheap.
  const gp = geo.attributes.position, gi = geo.index.array;
  const seg = new THREE.Line3(), cpt = new THREE.Vector3(), ctr = new THREE.Vector3();
  frames.forEach(fr => {
    seg.set(fr.p0.clone().addScaledVector(fr.fwd, -0.01), fr.p1.clone().addScaledVector(fr.fwd, 0.02));
    const keep = [];
    for (let k = 0; k < gi.length; k += 3) {
      ctr.set(0, 0, 0);
      for (let m = 0; m < 3; m++) ctr.add(cpt.fromBufferAttribute(gp, gi[k + m]));
      ctr.multiplyScalar(1 / 3);
      seg.closestPointToPoint(ctr, true, cpt);
      if (cpt.distanceTo(ctr) < 0.016) keep.push(gi[k], gi[k + 1], gi[k + 2]);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', gp); g.setIndex(keep);
    fr.hit = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  });
  let hitMesh = null;
  function surfaceHit(origin, dir) {
    ray.set(origin, dir); ray.far = 0.08;
    const h = ray.intersectObject(hitMesh, false)[0];
    return h ? h.point : null;
  }

  function fingerHalfWidth(fr) {
    hitMesh = fr.hit;
    const c = fr.p0.clone().lerp(fr.p1, 0.35);
    const a = surfaceHit(c, fr.side), b = surfaceHit(c, fr.side.clone().negate());
    return a && b ? a.distanceTo(b) / 2 : 0.0075;
  }

  const NU = 14, NV = 30;
  function buildNail(fr, shape) {
    const cfg = NAIL[fr.f];
    hitMesh = fr.hit;
    const W = fingerHalfWidth(fr) * cfg.w;
    const prof = SHAPES[shape];
    if (fr.tipSkin === undefined) {
      const hit = surfaceHit(fr.p1.clone().addScaledVector(fr.fwd, -0.002), fr.fwd);
      fr.tipSkin = hit ? hit.distanceTo(fr.p1) : 0.004;
    }
    const total = fr.len * (1 - cfg.start) + fr.tipSkin + fr.len * LENGTHS[shape];
    // 1) sample the skin height under a grid that follows the nail outline
    const H = [], AX = [], HW = [];
    const prev = Array(NU + 1).fill(null), free = Array(NU + 1).fill(false), freeAt = Array(NU + 1).fill(0);
    for (let j = 0; j <= NV; j++) {
      const vv = j / NV;
      const along = fr.len * cfg.start + total * vv;
      const axis = fr.p0.clone().addScaledVector(fr.fwd, along);
      const hw = W * prof(vv);
      AX.push(axis); HW.push(hw);
      const row = [];
      for (let i = 0; i <= NU; i++) {
        const u = (i / NU) * 2 - 1;
        let h = null;
        if (!free[i]) {
          const o = axis.clone().addScaledVector(fr.side, u * hw).addScaledVector(fr.up, 0.04);
          const p = surfaceHit(o, fr.up.clone().negate());
          if (p) h = p.sub(axis).dot(fr.up);
          // once the skin curves away over the fingertip, the nail carries on as a free edge
          if (h === null || (prev[i] !== null && h < prev[i] - 0.0006)) { free[i] = true; freeAt[i] = along; }
        }
        if (free[i]) {
          const base = prev[i] ?? 0.006;
          h = base - (along - freeAt[i]) * 0.12;
        } else prev[i] = h;
        row.push(h);
      }
      H.push(row);
    }
    // 2) smooth the heights so the low-poly skin facets don't show through the polish
    for (let it = 0; it < 6; it++) {
      const S = H.map(r => r.slice());
      for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
        const n = [H[j][i], H[Math.max(0, j - 1)][i], H[Math.min(NV, j + 1)][i], H[j][Math.max(0, i - 1)], H[j][Math.min(NU, i + 1)]];
        S[j][i] = n.reduce((a, b) => a + b, 0) / n.length;
      }
      H.splice(0, H.length, ...S);
    }
    const top = [], uvs = [];
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
      const u = (i / NU) * 2 - 1;
      const dome = 0.00055 + 0.0006 * (1 - u * u);
      top.push(AX[j].clone().addScaledVector(fr.side, u * HW[j]).addScaledVector(fr.up, H[j][i] + dome));
      uvs.push((u + 1) / 2, j / NV);
    }
    // thickness: underside follows the top, lowered along the local normal
    const g = new THREE.BufferGeometry();
    const n = top.length;
    const P = new Float32Array(n * 2 * 3), UV = new Float32Array(n * 2 * 2);
    top.forEach((p, k) => {
      P.set([p.x, p.y, p.z], k * 3);
      const q = p.clone().addScaledVector(fr.up, -0.0009);
      P.set([q.x, q.y, q.z], (n + k) * 3);
      UV.set([uvs[k * 2], uvs[k * 2 + 1]], k * 2); UV.set([uvs[k * 2], uvs[k * 2 + 1]], (n + k) * 2);
    });
    const idx = [], id = (i, j, b = 0) => b * n + j * (NU + 1) + i;
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
      idx.push(id(i, j), id(i + 1, j), id(i + 1, j + 1), id(i, j), id(i + 1, j + 1), id(i, j + 1));
      idx.push(id(i, j, 1), id(i + 1, j + 1, 1), id(i + 1, j, 1), id(i, j, 1), id(i, j + 1, 1), id(i + 1, j + 1, 1));
    }
    const wall = (a, b) => idx.push(a, b, b + n, a, b + n, a + n);
    for (let j = 0; j < NV; j++) { wall(id(0, j + 1), id(0, j)); wall(id(NU, j), id(NU, j + 1)); }
    for (let i = 0; i < NU; i++) { wall(id(i, 0), id(i + 1, 0)); wall(id(i + 1, NV), id(i, NV)); }
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // ---------- finishes ----------
  const texCache = {};
  function frenchTex(tipHex) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#f6d6d3'; x.fillRect(0, 0, 64, 256);
    x.fillStyle = tipHex; x.beginPath();
    x.moveTo(0, 256 * 0.66); x.quadraticCurveTo(32, 256 * 0.86, 64, 256 * 0.66); x.lineTo(64, 256); x.lineTo(0, 256); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; return t;
  }
  function glitterTex() {
    if (texCache.glitter) return texCache.glitter;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 260; i++) {
      const s = Math.random() * 3 + 2; const l = Math.random() < 0.5 ? 255 : 200 + Math.random() * 55;
      x.fillStyle = `rgb(${l},${l},${l})`;
      x.save(); x.translate(Math.random() * 128, Math.random() * 128); x.rotate(Math.random() * Math.PI);
      x.fillRect(-s / 2, -s / 2, s, s); x.restore();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 2);
    return (texCache.glitter = t);
  }

  const FINISH = {
    gloss:   { roughness: 0.18, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.02, opacity: 1 },
    jelly:   { roughness: 0.08, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.0, opacity: 0.72 },
    matte:   { roughness: 0.62, metalness: 0.0, clearcoat: 0, clearcoatRoughness: 1, opacity: 1 },
    chrome:  { roughness: 0.1,  metalness: 1.0, clearcoat: 1, clearcoatRoughness: 0.02, opacity: 1 },
    glitter: { roughness: 0.35, metalness: 0.75, clearcoat: 1, clearcoatRoughness: 0.03, opacity: 1 },
    french:  { roughness: 0.16, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.02, opacity: 1 },
  };

  const state = { hex: '#c2185b', finish: 'gloss', shape: 'almond' };
  const nails = frames.map(fr => {
    const m = new THREE.MeshPhysicalMaterial({ color: state.hex, side: THREE.FrontSide, envMapIntensity: 0.5 });
    const mesh = new THREE.Mesh(buildNail(fr, state.shape), m);
    hand.add(mesh);
    return { fr, mesh, from: new THREE.Color(state.hex), to: new THREE.Color(state.hex), t0: 0, delay: 0, glint: 0 };
  });

  function applyFinish() {
    const f = FINISH[state.finish];
    nails.forEach(n => {
      const m = n.mesh.material;
      Object.assign(m, { roughness: f.roughness, metalness: f.metalness, clearcoat: f.clearcoat, clearcoatRoughness: f.clearcoatRoughness });
      m.transparent = f.opacity < 1; m.opacity = f.opacity; m.depthWrite = f.opacity >= 1;
      if (m.map && m.map !== texCache.glitter) m.map.dispose();
      m.map = state.finish === 'glitter' ? glitterTex() : state.finish === 'french' ? frenchTex(state.hex) : null;
      m.needsUpdate = true;
    });
  }

  // ---------- polish bottle ----------
  const bottle = new THREE.Group();
  const glassPts = [[0, 0], [0.019, 0], [0.023, 0.004], [0.024, 0.03], [0.021, 0.04], [0.009, 0.046], [0.0085, 0.052], [0, 0.052]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(glassPts, 48), new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 1, thickness: 0.004, ior: 1.5, clearcoat: 1, transparent: true, opacity: 0.55,
  }));
  const liquidPts = [[0, 0.003], [0.0175, 0.003], [0.0205, 0.006], [0.0212, 0.03], [0.018, 0.037], [0, 0.037]].map(([x, y]) => new THREE.Vector2(x, y));
  const liquidMat = new THREE.MeshPhysicalMaterial({ color: state.hex, roughness: 0.15, clearcoat: 1 });
  const liquid = new THREE.Mesh(new THREE.LatheGeometry(liquidPts, 48), liquidMat);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0105, 0.05, 40), new THREE.MeshPhysicalMaterial({ color: 0x241433, roughness: 0.25, clearcoat: 1, metalness: 0.2 }));
  cap.position.y = 0.075;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0104, 0.0012, 12, 40), new THREE.MeshStandardMaterial({ color: 0xe9c27a, metalness: 1, roughness: 0.25 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.051;
  bottle.add(liquid, glass, cap, ring);
  bottle.scale.setScalar(1.05);
  scene.add(bottle);

  // ---------- sparkles ----------
  const sparkTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,220,250,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(31, 2, 2, 60); x.fillRect(2, 31, 60, 2);
    const t = new THREE.CanvasTexture(c); return t;
  })();
  const sparks = [];
  function burst(n) {
    const box = new THREE.Box3().setFromObject(n.mesh); const c = box.getCenter(new THREE.Vector3());
    for (let i = 0; i < 2; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.position.copy(c).add(new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0.006));
      s.scale.setScalar(0.0001); s.userData = { born: performance.now(), max: 0.005 + Math.random() * 0.005, d: Math.random() * 0.15 };
      scene.add(s); sparks.push(s);
    }
  }

  // ---------- layout + interaction ----------
  let layout = 'wide';
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    layout = w / h < 0.9 ? 'tall' : 'wide';
    camera.position.set(layout === 'tall' ? 0.004 : -0.004, 0, layout === 'tall' ? 0.5 : 0.43);
    camera.updateProjectionMatrix();
    bottle.position.set(layout === 'tall' ? 0.06 : 0.082, layout === 'tall' ? -0.07 : -0.06, -0.03);
  }
  new ResizeObserver(resize).observe(canvas); resize();

  const target = { yaw: 0, pitch: 0 }, cur = { yaw: 0, pitch: 0 };
  let dragging = false, lastX = 0, lastY = 0, idleAt = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    target.yaw = THREE.MathUtils.clamp(target.yaw + (e.clientX - lastX) * 0.01, -1.1, 1.1);
    target.pitch = THREE.MathUtils.clamp(target.pitch + (e.clientY - lastY) * 0.006, -0.5, 0.5);
    lastX = e.clientX; lastY = e.clientY; idleAt = performance.now();
  });
  const end = () => { dragging = false; idleAt = performance.now(); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }).observe(canvas);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();
  let running = false;
  function loop() {
    if (running) return; running = true;
    const tick = () => {
      if (!visible) { running = false; return; }
      const now = performance.now(), t = (now - start) / 1000;
      if (!dragging && now - idleAt > 2500) { target.yaw *= 0.985; target.pitch *= 0.985; }
      cur.yaw += (target.yaw - cur.yaw) * 0.12; cur.pitch += (target.pitch - cur.pitch) * 0.12;
      const sway = reduce ? 0 : Math.sin(t * 0.6) * 0.07;
      pivot.rotation.set(cur.pitch + (reduce ? 0 : Math.sin(t * 0.45) * 0.03), cur.yaw + sway, 0);
      bottle.rotation.y = t * 0.35; bottle.position.y += reduce ? 0 : Math.sin(t * 1.1) * 0.00006;

      nails.forEach(n => {
        const k = THREE.MathUtils.clamp((now - n.t0 - n.delay) / 450, 0, 1);
        const e = k * k * (3 - 2 * k);
        n.mesh.material.color.copy(n.from).lerp(n.to, e);
        if (state.finish === 'french') n.mesh.material.color.set(0xffffff);
        n.mesh.material.emissive.setScalar(n.glint * Math.sin(Math.PI * e) * 0.35);
        if (k > 0 && k < 1 && !n.burst) { n.burst = true; if (n.sparkle) burst(n); }
      });
      const lk = THREE.MathUtils.clamp((now - liquid.userData.t0) / 600, 0, 1) || 1;
      if (liquid.userData.from) liquidMat.color.copy(liquid.userData.from).lerp(liquid.userData.to, lk);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const p = ((now - s.userData.born) / 1000 - s.userData.d) / 0.6;
        if (p < 0) continue;
        s.scale.setScalar(s.userData.max * Math.sin(Math.PI * Math.min(p, 1)) + 0.0001);
        s.material.rotation += 0.05;
        if (p >= 1) { scene.remove(s); s.material.dispose(); sparks.splice(i, 1); }
      }
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
    tick();
  }

  applyFinish();
  loop();
  onReady && onReady();

  return {
    setShade(hex) {
      if (hex === state.hex) return;
      state.hex = hex;
      const now = performance.now();
      nails.forEach((n, i) => {
        n.from.copy(n.mesh.material.color); n.to.set(hex); n.t0 = now; n.delay = i * 80; n.glint = 1; n.burst = false; n.sparkle = true;
        if (state.finish === 'french') n.from.set(hex);
      });
      liquid.userData = { from: liquidMat.color.clone(), to: new THREE.Color(hex), t0: now };
      if (state.finish === 'french') applyFinish();
    },
    setFinish(name) { if (!FINISH[name]) return; state.finish = name; applyFinish(); nails.forEach(n => { n.t0 = performance.now(); n.delay = 0; n.glint = 0.6; n.burst = false; n.sparkle = false; n.from.copy(n.to); }); },
    setShape(name) {
      if (!SHAPES[name]) return; state.shape = name;
      nails.forEach((n, i) => { n.mesh.geometry.dispose(); n.mesh.geometry = buildNail(n.fr, name); n.t0 = performance.now(); n.delay = i * 60; n.glint = 0.6; n.burst = false; n.sparkle = false; n.from.copy(n.to); });
    },
    get state() { return { ...state }; },
  };
}
