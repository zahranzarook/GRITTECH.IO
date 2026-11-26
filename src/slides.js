import './magnet.js';
// Cover slideshows: cross-fades the images inside every [data-slides] frame.
// Every slideshow advances on its own and has arrows and dots.
// Respects reduced-motion (no auto-advance), pauses off screen and while a mouse hovers; swipe on touch.
const INTERVAL = 4500;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function setup(frame, index) {
  const slides = [...frame.querySelectorAll('.mt-slide')];
  if (slides.length < 2) return;
  const dots = [...frame.querySelectorAll('[data-dot]')];
  let current = 0;
  let timer = null;
  let visible = false;
  let hovered = false;

  const show = i => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
    dots.forEach((d, n) => d.setAttribute('aria-current', n === current ? 'true' : 'false'));
  };
  const stop = () => { clearTimeout(timer); timer = null; };
  // A video slide stays up for its full length (at least one loop) before moving on.
  const wait = () => { const s = slides[current]; return s.tagName === 'VIDEO' && s.duration ? Math.max(INTERVAL, s.duration * 1000) : INTERVAL; };
  const start = () => {
    if (reduceMotion || timer || !visible || hovered) return;
    timer = setTimeout(function tick() { show(current + 1); timer = setTimeout(tick, wait()); }, wait());
  };

  dots.forEach((d, n) => d.addEventListener('click', e => { e.preventDefault(); stop(); show(n); start(); }));
  frame.querySelector('[data-prev]')?.addEventListener('click', e => { e.preventDefault(); stop(); show(current - 1); start(); });
  frame.querySelector('[data-next]')?.addEventListener('click', e => { e.preventDefault(); stop(); show(current + 1); start(); });
  // Pause on hover only with a real mouse (on touch screens a tap would "hover" forever and freeze the slides).
  if (canHover) {
    frame.addEventListener('mouseenter', () => { hovered = true; stop(); });
    frame.addEventListener('mouseleave', () => { hovered = false; start(); });
  }

  // Swipe on touch screens (on a tile the whole card is the swipe area).
  const zone = frame.closest('.mt-tile') || frame;
  let x0 = null, y0 = null;
  zone.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  zone.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { stop(); show(current + (dx < 0 ? 1 : -1)); start(); }
  }, { passive: true });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    // Stagger tiles so they don't all change at the same moment.
    if (visible) setTimeout(start, (index % 5) * 700); else stop();
  }, { threshold: 0.3 }).observe(frame);
}

document.querySelectorAll('[data-slides]').forEach(setup);
