// Lumi — photoreal try-on.
// Real photographs of a hand in four poses. Each pose ships with a nail map
// (R = nail shading from the original glossy nude polish, G = nail mask,
// B = French-tip mask). A small WebGL shader repaints only the nails, floods
// the backdrop with the shade's colour (keeping the photo's real shadows) and
// cross-fades between poses.

const VERT = `
attribute vec2 p; varying vec2 v;
void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `
precision highp float;
varying vec2 v;
uniform vec2 uRes;
uniform vec3 uBgA, uBgB, uNailA, uNailB;
uniform float uSweep, uTime;
uniform vec4 uFin;   // gloss, matte, chrome, glitter
uniform vec2 uFin2;  // jelly, french
uniform sampler2D tPhoto0, tNail0, tPhoto1, tNail1;
uniform vec4 uRect0, uRect1;   // x, y, w, h in px (top-left origin)
uniform vec3 uTx0, uTx1;       // alpha, offsetX, scale
uniform float uWhite0, uWhite1;

vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
vec3 srgb(vec3 c){ return pow(clamp(c, 0., 1.), vec3(1. / 2.2)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

// the paint "curtain": new colour sweeps down the frame
float sweepMix(vec2 px){ float y = px.y / uRes.y; return smoothstep(y - .12, y, uSweep * 1.12); }

void layer(sampler2D tp, sampler2D tn, vec4 rect, vec3 tx, float white, vec2 px,
           inout vec3 bgMul, inout vec4 hand){
  if (tx.x <= 0.001) return;
  vec2 c = rect.xy + rect.zw * .5;
  vec2 q = (px - vec2(tx.y, 0.) - c) / tx.z + c;
  vec2 uv = (q - rect.xy) / rect.zw;
  if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) return;
  vec4 ph = texture2D(tp, uv);
  vec4 nm = texture2D(tn, uv);
  vec3 photo = lin(ph.rgb);
  // background: the photo's own soft shadows (stored in the nail map's alpha) darken the colour field
  vec2 e = min(uv, 1. - uv);
  float edge = smoothstep(0., .06, min(e.x, e.y));
  float sh = mix(1., pow(nm.a, 2.2), edge);
  bgMul *= mix(1., sh, tx.x * (1. - ph.a));
  // nails
  float m = smoothstep(.08, .55, nm.g);
  vec3 col = photo;
  if (m > .001) {
    float s = nm.r * 2.;
    float k = sweepMix(px);
    vec3 paint = lin(mix(uNailA, uNailB, k));
    float diffuse = pow(clamp(s, 0., 1.08), 1.35);
    float spec = pow(clamp((s - 1.04) / .5, 0., 1.), 1.4);
    vec3 n = paint * diffuse + vec3(spec) * .85 * uFin.x;                               // gloss
    vec3 matte = paint * mix(.82, 1.02, clamp(s, 0., 1.)) + vec3(.012);                 // matte
    float band = .5 + .5 * cos(s * 7.5 + uv.y * 9.);
    vec3 chrome = mix(paint * .12, mix(paint, vec3(1.), .55), band * band) + vec3(spec) * 1.1;
    float g = hash(floor(uv * rect.zw / 1.6));
    float tw = .5 + .5 * sin(uTime * 3. + g * 40.);
    vec3 glitter = paint * (.5 + .55 * diffuse) + vec3(step(.965, g) * tw) * .9 + paint * step(.82, hash(floor(uv * rect.zw / 2.4) + 7.)) * .45 * tw + vec3(spec) * .5;
    vec3 jelly = mix(photo, paint * (.6 + .6 * diffuse), .62) + vec3(spec) * .8;
    vec3 tipc = paint * diffuse + vec3(spec) * .6;
    vec3 french = mix(photo * vec3(1., .93, .93), tipc, nm.b);
    vec3 r = n;
    r = mix(r, matte, uFin.y);
    r = mix(r, chrome, uFin.z);
    r = mix(r, glitter, uFin.w);
    r = mix(r, jelly, uFin2.x);
    r = mix(r, french, uFin2.y);
    col = mix(photo, r, m);
  }
  float a = ph.a * tx.x;
  hand.rgb = mix(hand.rgb, col, a);
  hand.a = hand.a + a * (1. - hand.a);
}

void main(){
  vec2 px = vec2(v.x, 1. - v.y) * uRes;
  vec3 bgMul = vec3(1.);
  vec4 hand = vec4(0.);
  layer(tPhoto0, tNail0, uRect0, uTx0, uWhite0, px, bgMul, hand);
  layer(tPhoto1, tNail1, uRect1, uTx1, uWhite1, px, bgMul, hand);
  vec3 bg = lin(mix(uBgA, uBgB, sweepMix(px))) * bgMul;
  gl_FragColor = vec4(srgb(mix(bg, hand.rgb, hand.a)), 1.);
}`;

const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const FIN = { gloss: [1, 0, 0, 0, 0, 0], matte: [0, 1, 0, 0, 0, 0], chrome: [1, 0, 1, 0, 0, 0], glitter: [1, 0, 0, 1, 0, 0], jelly: [1, 0, 0, 0, 1, 0], french: [1, 0, 0, 0, 0, 1] };

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export async function createStudio(canvas, { base, layout }) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) throw new Error('no webgl');
  const meta = await (await fetch(base + 'looks.json')).json();

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = new Proxy({}, { get: (c, k) => c[k] ?? (c[k] = gl.getUniformLocation(prog, k)) });
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

  function tex(img) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  const cache = {};
  async function pose(skin, i) {
    const key = `${skin}-${i}`;
    if (!cache[key]) cache[key] = Promise.all([loadImage(`${base}${key}.webp`), loadImage(`${base}${key}-nails.png`)])
      .then(([p, n]) => ({ photo: tex(p), nail: tex(n), m: meta[skin === 'fair' ? 'fairA' : 'deepA'][i - 1] }));
    return cache[key];
  }

  const st = {
    skin: 'fair', pose: 1,
    bgA: [1, 1, 1], bgB: [1, 1, 1], nailA: [1, 1, 1], nailB: [1, 1, 1], sweep: 1, sweepT0: 0,
    fin: FIN.gloss.slice(), finTo: FIN.gloss.slice(),
    slots: [null, null], tx: [[1, 0, 1], [0, 0, 1]], t0: 0, dur: 950, dir: 1, animating: false,
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    kick();
  }

  function rectFor(m) {
    const W = canvas.width, H = canvas.height;
    const r = layout(m, W, H);   // page decides where each pose sits
    return r;
  }

  let raf = 0;
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    let busy = false;
    // pose transition
    if (st.animating) {
      const k = Math.min(1, (now - st.t0) / st.dur), e = ease(k), d = 46 * st.dir * (canvas.width / canvas.clientWidth);
      st.tx[0] = [1 - e, -d * e, 1 - .025 * e];
      st.tx[1] = [e, d * (1 - e), 1.035 - .035 * e];
      if (k >= 1) { st.slots = [st.slots[1], null]; st.tx = [[1, 0, 1], [0, 0, 1]]; st.animating = false; }
      busy = true;
    }
    // colour sweep
    if (st.sweep < 1) { st.sweep = Math.min(1, (now - st.sweepT0) / 900); busy = true; }
    // finish blend
    for (let i = 0; i < 6; i++) { const d = st.finTo[i] - st.fin[i]; if (Math.abs(d) > .002) { st.fin[i] += d * .18; busy = true; } else st.fin[i] = st.finTo[i]; }
    if (st.fin[3] > .01) busy = true;   // glitter twinkles

    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform3fv(U.uBgA, st.bgA); gl.uniform3fv(U.uBgB, st.bgB);
    gl.uniform3fv(U.uNailA, st.nailA); gl.uniform3fv(U.uNailB, st.nailB);
    gl.uniform1f(U.uSweep, ease(st.sweep)); gl.uniform1f(U.uTime, now / 1000);
    gl.uniform4f(U.uFin, st.fin[0], st.fin[1], st.fin[2], st.fin[3]); gl.uniform2f(U.uFin2, st.fin[4], st.fin[5]);
    st.slots.forEach((s, i) => {
      const P = U['tPhoto' + i], N = U['tNail' + i];
      gl.activeTexture(gl.TEXTURE0 + i * 2); gl.bindTexture(gl.TEXTURE_2D, s ? s.photo : null); gl.uniform1i(P, i * 2);
      gl.activeTexture(gl.TEXTURE1 + i * 2); gl.bindTexture(gl.TEXTURE_2D, s ? s.nail : null); gl.uniform1i(N, i * 2 + 1);
      const r = s ? rectFor(s.m) : [0, 0, 1, 1];
      gl.uniform4f(U['uRect' + i], r[0], r[1], r[2], r[3]);
      gl.uniform3f(U['uTx' + i], s ? st.tx[i][0] : 0, st.tx[i][1], st.tx[i][2]);
      gl.uniform1f(U['uWhite' + i], s ? s.m.white : 1);
    });
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (busy && visible) kick();
  }

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);

  let req = 0;
  async function show(skin, i, dir = 1) {
    const my = ++req;
    st.skin = skin; st.pose = i;
    const p = await pose(skin, i);
    if (my !== req) return;   // a newer request won while this one was loading
    if (!st.slots[0]) { st.slots[0] = p; kick(); return; }
    if (st.animating) { st.slots = [st.slots[1], null]; }
    st.slots[1] = p; st.dir = dir; st.t0 = performance.now(); st.animating = true; kick();
    // warm the neighbours
    [1, 2, 3, 4].forEach(n => pose(skin, n));
  }

  resize();
  return {
    async ready(skin, i) { await show(skin, i); },
    pose(i, dir) { if (i !== st.pose) show(st.skin, i, dir); },
    skin(s) { if (s !== st.skin) show(s, st.pose, 1); },
    colour({ nail, bg }, instant = false) {
      const nn = hex(nail), bb = hex(bg);
      if (instant) { st.nailA = st.nailB = nn; st.bgA = st.bgB = bb; st.sweep = 1; kick(); return; }
      // freeze the current mix as the start, sweep to the new colour
      const k = ease(st.sweep);
      st.nailA = st.nailA.map((v, j) => v + (st.nailB[j] - v) * k);
      st.bgA = st.bgA.map((v, j) => v + (st.bgB[j] - v) * k);
      st.nailB = nn; st.bgB = bb; st.sweep = 0; st.sweepT0 = performance.now(); kick();
    },
    finish(name) { st.finTo = (FIN[name] || FIN.gloss).slice(); kick(); },
    get pose_() { return st.pose; },
  };
}

// Recolour the product bottle once per shade (CPU, tiny image) for the lineup.
export async function bottleImages(base, shades) {
  const [img, liq] = await Promise.all([loadImage(base + 'bottle.webp'), loadImage(base + 'bottle-liquid.png')]);
  const w = img.naturalWidth, h = img.naturalHeight;
  const read = im => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0); return x.getImageData(0, 0, w, h); };
  const P = read(img), L = read(liq);
  const toLin = c => Math.pow(c / 255, 2.2), toS = c => Math.round(255 * Math.pow(Math.min(1, Math.max(0, c)), 1 / 2.2));
  const out = {};
  for (const s of shades) {
    const c = hex(s.nail), o = new ImageData(new Uint8ClampedArray(P.data), w, h), d = o.data;
    for (let i = 0; i < d.length; i += 4) {
      const m = L.data[i + 1] / 255; if (m < .004) continue;
      const sh = L.data[i] / 255 * 2, diff = Math.pow(Math.min(sh, 1.08), 1.35), spec = Math.pow(Math.max(0, Math.min(1, (sh - 1.04) / .5)), 1.4) * .85;
      for (let k = 0; k < 3; k++) {
        const v = Math.pow(c[k], 2.2) * diff + spec;
        d[i + k] = toS(toLin(d[i + k]) * (1 - m) + v * m);
      }
    }
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').putImageData(o, 0, 0);
    out[s.id] = await new Promise(r => cv.toBlob(b => r(URL.createObjectURL(b)), 'image/webp', .9));
  }
  return out;
}
