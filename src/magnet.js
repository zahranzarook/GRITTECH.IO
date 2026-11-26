// Matte Tactile pointer effects (desktop mouse/trackpad only; off on touch screens and with reduced motion):
// 1) Magnetic buttons: buttons and round keys lean toward the cursor with a spring.
// 2) Light behind the matte: a soft lime glow follows the cursor across tiles and rows.
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (fine && !still) {
  const MAG = '.mt-btn, .mt-key--round, .mt-nav .mt-key';
  const SPOT = '.mt-plate, .mt-row';
  const live = new Map(); // el -> {x, y, tx, ty}
  let px = -1e4, py = -1e4, raf = 0, spot = null;

  const tick = () => {
    raf = 0;
    // pull targets near the pointer
    document.querySelectorAll(MAG).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = px - cx, dy = py - cy, reach = Math.max(r.width, r.height) * 0.6 + 40;
      const near = Math.abs(dx) < reach && Math.abs(dy) < reach;
      const s = live.get(el) || { x: 0, y: 0, tx: 0, ty: 0 };
      s.tx = near ? dx * 0.22 : 0; s.ty = near ? dy * 0.3 : 0;
      if (near || s.x || s.y) live.set(el, s);
    });
    let moving = false;
    live.forEach((s, el) => {
      s.x += (s.tx - s.x) * 0.18; s.y += (s.ty - s.y) * 0.18;
      if (Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05) { s.x = s.tx; s.y = s.ty; } else moving = true;
      el.style.translate = s.x || s.y ? `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px` : '';
      if (!s.x && !s.y && !s.tx && !s.ty) live.delete(el);
    });
    if (moving) raf = requestAnimationFrame(tick);
  };

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    px = e.clientX; py = e.clientY;
    // light behind the matte surface under the cursor
    const el = e.target.closest?.(SPOT);
    if (spot && spot !== el) spot.classList.remove('mt-spot');
    spot = el;
    if (el) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sx', `${px - r.left}px`);
      el.style.setProperty('--sy', `${py - r.top}px`);
      el.classList.add('mt-spot');
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { px = py = -1e4; spot?.classList.remove('mt-spot'); if (!raf) raf = requestAnimationFrame(tick); });
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
}
