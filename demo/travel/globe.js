// Dotted 3D globe on a 2D canvas: land dots, flight arcs from home, drag with inertia, smooth focus.
const RAD = Math.PI / 180;
const vec = ([lon, lat]) => [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];
function slerp(a, b, t) {
  const d = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), s = Math.sin(d) || 1;
  const k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}

export function createGlobe(canvas, { dots, home, dests, color = '#7fd1ff', arc = '#ffb547' }) {
  const ctx = canvas.getContext('2d');
  const land = [];
  for (let i = 0; i < dots.length; i += 2) land.push(vec([dots[i] / 10, dots[i + 1] / 10]));
  const H = vec(home.ll);
  const D = dests.map(d => ({ ...d, v: vec(d.ll), phase: Math.random() }));
  let W, Hh, R, cx, cy, dpr;
  let lon = -home.ll[0] + 20, lat = 18, vLon = 0.04, vLat = 0, target = null, active = null, drag = null, idle = 0;

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = canvas.width = r.width * dpr; Hh = canvas.height = r.height * dpr;
    R = Math.min(W, Hh) * 0.42; cx = W / 2; cy = Hh / 2;
  }
  size(); addEventListener('resize', size);

  // rotate: Y by lon, then X by lat → screen
  function proj(v) {
    const cl = Math.cos(lon * RAD), sl = Math.sin(lon * RAD), cp = Math.cos(lat * RAD), sp = Math.sin(lat * RAD);
    const x = v[0] * cl + v[2] * sl, z1 = -v[0] * sl + v[2] * cl;
    const y = v[1] * cp - z1 * sp, z = v[1] * sp + z1 * cp;
    return [cx + x * R, cy - y * R, z, x, y];
  }

  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; target = null; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
    vLon = dx * 0.25; vLat = dy * 0.25; lon += vLon; lat = Math.max(-60, Math.min(60, lat + vLat));
  });
  const up = () => { drag = null; idle = 0; canvas.style.cursor = 'grab'; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  let vis = true;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(canvas);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function frame(t) {
    requestAnimationFrame(frame);
    if (!vis) return;
    // motion
    if (target) {
      let d = ((target[0] - lon + 540) % 360) - 180;
      lon += d * 0.06; lat += (target[1] - lat) * 0.06;
      if (Math.abs(d) < .05 && Math.abs(target[1] - lat) < .05) target = null;
    } else if (!drag) {
      vLon *= 0.94; vLat *= 0.9; lon += vLon; lat = Math.max(-60, Math.min(60, lat + vLat));
      if (++idle > 90 && !still) lon += 0.06;
    }
    ctx.clearRect(0, 0, W, Hh);
    // atmosphere + sphere
    let g = ctx.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.35);
    g.addColorStop(0, 'rgba(90,170,255,.28)'); g.addColorStop(1, 'rgba(90,170,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, 7); ctx.fill();
    g = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    g.addColorStop(0, '#1b2c5c'); g.addColorStop(1, '#070c1f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    // dots
    const ds = 1.35 * dpr * (R / 260);
    for (const v of land) {
      const [x, y, z] = proj(v);
      if (z < -0.15) continue;
      if (z < 0) { ctx.fillStyle = 'rgba(127,209,255,.08)'; ctx.fillRect(x, y, ds * .6, ds * .6); continue; }
      ctx.globalAlpha = 0.25 + z * 0.75;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, ds * (0.6 + z * 0.5), 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // arcs
    const T = t / 1000;
    for (const d of D) {
      const on = active === d.id, steps = 48;
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const k = i / steps, p = slerp(H, d.v, k), h = 1 + Math.sin(Math.PI * k) * (on ? .32 : .2);
        pts.push(proj([p[0] * h, p[1] * h, p[2] * h]));
      }
      const visible = p => p[2] > 0 || Math.hypot(p[3], p[4]) > 1;
      ctx.lineWidth = (on ? 2.4 : 1.2) * dpr; ctx.strokeStyle = on ? arc : 'rgba(255,181,71,.45)';
      ctx.beginPath(); let pen = false;
      for (const p of pts) { if (visible(p)) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; }
      ctx.stroke();
      // moving plane dot
      const k = (T * (on ? .45 : .22) + d.phase) % 1, p = pts[Math.round(k * steps)];
      if (visible(p)) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], (on ? 3.2 : 2) * dpr, 0, 7); ctx.fill(); }
      // pin
      const e = pts[steps];
      if (e[2] > 0) {
        ctx.fillStyle = on ? arc : 'rgba(255,181,71,.9)';
        ctx.beginPath(); ctx.arc(e[0], e[1], (on ? 5 : 3) * dpr, 0, 7); ctx.fill();
        if (on) {
          const pr = ((T * 1.2) % 1);
          ctx.strokeStyle = `rgba(255,181,71,${1 - pr})`; ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath(); ctx.arc(e[0], e[1], (5 + pr * 18) * dpr, 0, 7); ctx.stroke();
          ctx.font = `600 ${13 * dpr}px Manrope, system-ui, sans-serif`;
          const label = `${d.label || d.city}`, w = ctx.measureText(label).width + 20 * dpr;
          ctx.fillStyle = 'rgba(7,12,31,.85)'; ctx.beginPath(); ctx.roundRect(e[0] + 12 * dpr, e[1] - 14 * dpr, w, 28 * dpr, 14 * dpr); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.fillText(label, e[0] + 22 * dpr, e[1] + 5 * dpr);
        }
      }
    }
    // home
    const h = proj(H);
    if (h[2] > 0) {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(h[0], h[1], 4.5 * dpr, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = dpr; ctx.beginPath(); ctx.arc(h[0], h[1], 9 * dpr, 0, 7); ctx.stroke();
    }
  }
  requestAnimationFrame(frame);
  canvas.style.cursor = 'grab';

  return {
    labels(fn) { D.forEach(d => { d.label = fn(d.id); }); },
    focus(id) {
      const d = D.find(x => x.id === id); if (!d) return;
      active = id;
      // aim between home and destination so the whole arc is in view
      const mid = slerp(H, d.v, .62);
      target = [-Math.atan2(mid[0], mid[2]) / RAD, Math.asin(mid[1]) / RAD * .8];
    },
  };
}
