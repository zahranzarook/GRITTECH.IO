// Cover slideshows: cross-fades the images inside every [data-slides] frame.
// Tiles advance on their own; page heroes also get dots and arrows.
// Respects reduced-motion (no auto-advance) and pauses when off screen or while hovered.
const INTERVAL = 4500;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    if (reduceMotion || timer || !visible || hovered) return;
    timer = setInterval(() => show(current + 1), INTERVAL);
  };

  dots.forEach((d, n) => d.addEventListener('click', e => { e.preventDefault(); stop(); show(n); start(); }));
  frame.querySelector('[data-prev]')?.addEventListener('click', e => { e.preventDefault(); stop(); show(current - 1); start(); });
  frame.querySelector('[data-next]')?.addEventListener('click', e => { e.preventDefault(); stop(); show(current + 1); start(); });
  frame.addEventListener('mouseenter', () => { hovered = true; stop(); });
  frame.addEventListener('mouseleave', () => { hovered = false; start(); });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    // Stagger tiles so they don't all change at the same moment.
    if (visible) setTimeout(start, (index % 5) * 700); else stop();
  }, { threshold: 0.3 }).observe(frame);
}

document.querySelectorAll('[data-slides]').forEach(setup);
