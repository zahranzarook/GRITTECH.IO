// Light on the matte background: a soft lime light follows the cursor across the page background,
// with a slower, wider sheen trailing behind it like light moving over matte cloth.
// It sits behind all content (tiles, buttons and text never change). Mouse only; off on touch and reduced motion.
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (fine && !still) {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.className = 'mt-bglight';
  document.body.prepend(el);

  let tx = innerWidth / 2, ty = innerHeight / 3, a = { x: tx, y: ty }, b = { x: tx, y: ty }, on = 0, ton = 0, raf = 0;
  const tick = () => {
    a.x += (tx - a.x) * .14; a.y += (ty - a.y) * .14;      // light: follows closely
    b.x += (tx - b.x) * .035; b.y += (ty - b.y) * .035;    // sheen: drifts behind, like cloth catching up
    on += (ton - on) * .06;
    el.style.setProperty('--ax', a.x + 'px'); el.style.setProperty('--ay', a.y + 'px');
    el.style.setProperty('--bx', b.x + 'px'); el.style.setProperty('--by', b.y + 'px');
    el.style.opacity = on.toFixed(3);
    const moving = Math.abs(tx - b.x) + Math.abs(ty - b.y) > .5 || Math.abs(ton - on) > .005;
    raf = moving ? requestAnimationFrame(tick) : 0;
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; tx = e.clientX; ty = e.clientY; ton = 1; go(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { ton = 0; go(); });
}
