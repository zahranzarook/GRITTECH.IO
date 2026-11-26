// Magnetic background field (Matte Tactile): a grid of fine engraved dots behind the page.
// With a mouse, dots near the cursor are pulled toward it like iron filings and light up lime, then settle back.
// Touch screens and reduced motion get the same dot texture, static. Buttons and tiles never move.
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GAP = 24, R = 230, PULL = 22;

const c = document.createElement('canvas');
c.setAttribute('aria-hidden', 'true');
c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
document.body.prepend(c);
const x = c.getContext('2d');
let W = 0, H = 0, dpr = 1, dots = [];

function size() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
  dots = [];
  const ox = (W % GAP) / 2, oy = (H % GAP) / 2;
  for (let yy = oy; yy <= H; yy += GAP) for (let xx = ox; xx <= W; xx += GAP) dots.push(xx, yy);
  draw();
}

// pointer (smoothed) and field strength (fades in near the cursor, out when it leaves or stops)
let tx = -1e4, ty = -1e4, px = -1e4, py = -1e4, s = 0, ts = 0, raf = 0, idle;

function draw() {
  x.clearRect(0, 0, W, H);
  // engraved base dots: a dark pit with a faint light rim
  x.fillStyle = 'rgba(0,0,0,.35)';
  x.beginPath();
  for (let i = 0; i < dots.length; i += 2) { x.moveTo(dots[i] + 1.9, dots[i + 1] + .6); x.arc(dots[i] + .6, dots[i + 1] + .6, 1.3, 0, 6.283); }
  x.fill();
  x.fillStyle = 'rgba(233,236,231,.07)';
  x.beginPath();
  for (let i = 0; i < dots.length; i += 2) {
    const d = Math.hypot(dots[i] - px, dots[i + 1] - py);
    if (s > .01 && d < R) continue;
    x.moveTo(dots[i] + 1.1, dots[i + 1]); x.arc(dots[i], dots[i + 1], 1.1, 0, 6.283);
  }
  x.fill();
  if (s < .01) return;
  // magnetised dots near the cursor
  for (let i = 0; i < dots.length; i += 2) {
    const dx = px - dots[i], dy = py - dots[i + 1], d = Math.hypot(dx, dy);
    if (d >= R) continue;
    const k = (1 - d / R) ** 1.5 * s, m = d ? Math.min(PULL * k, d * .6) / d : 0;
    const X = dots[i] + dx * m, Y = dots[i + 1] + dy * m;
    x.fillStyle = `rgba(${Math.round(233 - 70 * k)},${Math.round(236 - 35 * k)},${Math.round(231 - 125 * k)},${.08 + .85 * k})`;
    x.beginPath(); x.arc(X, Y, 1.1 + 1.7 * k, 0, 6.283); x.fill();
  }
}

function tick() {
  px += (tx - px) * .2; py += (ty - py) * .2; s += (ts - s) * .12;
  draw();
  raf = Math.abs(ts - s) > .005 || Math.abs(tx - px) > .3 || Math.abs(ty - py) > .3 ? requestAnimationFrame(tick) : 0;
}

size();
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 120); });

if (fine && !still) {
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    if (s < .01) { px = e.clientX; py = e.clientY; }
    tx = e.clientX; ty = e.clientY; ts = 1;
    clearTimeout(idle); idle = setTimeout(() => { ts = .35; if (!raf) raf = requestAnimationFrame(tick); }, 1800);
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { ts = 0; if (!raf) raf = requestAnimationFrame(tick); });
}
