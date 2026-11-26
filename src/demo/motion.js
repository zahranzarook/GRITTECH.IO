// Shared smooth-motion layer for GRIT demos: Lenis smooth scrolling + GSAP ScrollTrigger.
// Everything switches off when the visitor prefers reduced motion.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export { gsap, ScrollTrigger };

export function smooth() {
  if (reduced) return null;
  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -70 }, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
  return lenis;
}

// Split a heading into words and lift them in, line by line, when it scrolls into view.
export function revealHeadings(sel, { immediate = false } = {}) {
  document.querySelectorAll(sel).forEach(h => {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.append(w); return; }
          const o = document.createElement('span'); o.className = 'rw';
          const i = document.createElement('span'); i.className = 'rw__i'; i.textContent = w;
          o.append(i); frag.append(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(h);
    if (reduced) return;
    gsap.from(h.querySelectorAll('.rw__i'), {
      yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.045,
      scrollTrigger: immediate ? undefined : { trigger: h, start: 'top 85%' },
      delay: immediate ? 0.15 : 0,
    });
  });
}

// Fade/lift any elements in as they enter.
export function rise(sel, opts = {}) {
  if (reduced) return;
  ScrollTrigger.batch(sel, {
    start: 'top 88%',
    onEnter: els => gsap.fromTo(els, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true, ...opts }),
  });
}

export const MOTION_CSS = `.rw{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}.rw__i{display:inline-block;will-change:transform}`;
const st = document.createElement('style'); st.textContent = MOTION_CSS; document.head.append(st);
