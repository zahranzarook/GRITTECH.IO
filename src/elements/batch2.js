// GRIT UI library, batch 2: Scroll & Motion. Built on GSAP + ScrollTrigger and Lenis (smooth scroll), loaded from jsDelivr.
// Each element is its own smooth-scrolling box so it works anywhere: drop it into a page section, or make it full screen.
// `full: true` → the preview frame shows it edge to edge (no centring/scaling).
const CDN = ['https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js', 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/ScrollTrigger.min.js', 'https://cdn.jsdelivr.net/npm/lenis@1.3.29/dist/lenis.min.js'];
const IMG = 'https://grittech.io/demo';
// Shared setup each snippet repeats (so every snippet stays copy-paste on its own).
const SETUP = sel => `var box = document.querySelector('${sel}');
gsap.registerPlugin(ScrollTrigger);
var lenis = new Lenis({ wrapper: box, content: box.firstElementChild, lerp: .09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
ScrollTrigger.defaults({ scroller: box });`;
const HINT = '<p class="sm-hint">Scroll inside ↓</p>';
const BASE = sel => `${sel}{position:relative;height:100vh;overflow:auto;overscroll-behavior:contain;scrollbar-width:none}${sel}::-webkit-scrollbar{display:none}
${sel} .sm-hint{position:sticky;top:12px;z-index:5;width:max-content;margin:0 12px 0 auto;padding:6px 12px;border-radius:99px;background:rgba(0,0,0,.55);color:#fff;font:600 11px system-ui,sans-serif;letter-spacing:.06em;backdrop-filter:blur(6px)}`;

export const ELEMENTS2 = [
  {
    id: 'scroll-text-fill', name: 'Scroll Text Fill', industry: 'Scroll & Motion', tags: ['GSAP', 'Lenis', 'Typography'], stage: '#0e0e10', full: true, libs: CDN,
    desc: 'A statement paragraph that lights up word by word as you scroll, with Lenis smooth scrolling.',
    html: `<div class="sm-fill"><div>${HINT}<div class="sm-fill__pad"></div><p class="sm-fill__txt">We design websites that feel effortless. Every scroll, every hover and every tap is tuned so your customers glide from first look to booking.</p><div class="sm-fill__pad"></div></div></div>`,
    css: `${BASE('.sm-fill')}
.sm-fill__pad{height:42vh}
.sm-fill__txt{max-width:760px;margin:0 auto;padding:0 28px;font:600 clamp(26px,5vw,46px)/1.15 system-ui,sans-serif;letter-spacing:-.02em;color:#f2f2f2}
.sm-fill__txt span{opacity:.14}`,
    js: `${SETUP('.sm-fill')}
var p = box.querySelector('.sm-fill__txt');
p.innerHTML = p.textContent.split(' ').map(function (w) { return '<span>' + w + '</span>'; }).join(' ');
gsap.to(p.querySelectorAll('span'), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 35%', scrub: true } });`,
  },
  {
    id: 'pinned-horizontal-gallery', name: 'Pinned Horizontal Gallery', industry: 'Scroll & Motion', tags: ['GSAP', 'Pin', 'Gallery'], stage: '#070b1a', full: true, libs: CDN,
    desc: 'The section pins while photo cards slide sideways as you scroll down, each photo drifting inside its frame.',
    html: `<div class="sm-hg"><div>${HINT}<h3 class="sm-hg__h">Destinations</h3><section class="sm-hg__pin"><div class="sm-hg__track">
<figure><img src="${IMG}/travel/img/london.webp" alt="London"><figcaption>London</figcaption></figure>
<figure><img src="${IMG}/travel/img/paris.webp" alt="Paris"><figcaption>Paris</figcaption></figure>
<figure><img src="${IMG}/travel/img/tokyo.webp" alt="Tokyo"><figcaption>Tokyo</figcaption></figure>
<figure><img src="${IMG}/travel/img/istanbul.webp" alt="Istanbul"><figcaption>Istanbul</figcaption></figure>
<figure><img src="${IMG}/travel/img/bali.webp" alt="Bali"><figcaption>Bali</figcaption></figure>
</div></section><div style="height:60vh"></div></div></div>`,
    css: `${BASE('.sm-hg')}
.sm-hg__h{margin:20vh 0 4vh;text-align:center;font:400 clamp(32px,6vw,60px) Georgia,serif;color:#fff}
.sm-hg__pin{height:100vh;display:flex;align-items:center;overflow:hidden}
.sm-hg__track{display:flex;gap:18px;padding:0 6vw;width:max-content}
.sm-hg figure{position:relative;flex:none;width:min(46vw,260px);aspect-ratio:3/4;margin:0;border-radius:18px;overflow:hidden}
.sm-hg img{position:absolute;inset:0 -12%;width:124%;height:100%;object-fit:cover}
.sm-hg figcaption{position:absolute;left:14px;bottom:12px;color:#fff;font:400 26px Georgia,serif;text-shadow:0 2px 10px rgba(0,0,0,.5)}`,
    js: `${SETUP('.sm-hg')}
var track = box.querySelector('.sm-hg__track');
var dist = function () { return track.scrollWidth - box.clientWidth; };
var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: '.sm-hg__pin', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true } });
box.querySelectorAll('.sm-hg img').forEach(function (img) {
  gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentNode, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
});`,
  },
  {
    id: 'clip-image-reveal', name: 'Clip-path Image Reveal', industry: 'Scroll & Motion', tags: ['GSAP', 'Image', 'Reveal'], stage: '#141110', full: true, libs: CDN,
    desc: 'A photo opens from a rounded window to full bleed while it slowly zooms out. The headline rises over it.',
    html: `<div class="sm-clip"><div>${HINT}<div style="height:45vh"></div><section class="sm-clip__sec"><div class="sm-clip__media"><img src="${IMG}/restaurant/img/story-grill.webp" alt="Charcoal grill"></div><h3>No gas. No shortcuts.<br><em>Just fire.</em></h3></section><div style="height:60vh"></div></div></div>`,
    css: `${BASE('.sm-clip')}
.sm-clip__sec{position:relative;height:100vh;display:grid;place-items:center;isolation:isolate}
.sm-clip__media{position:absolute;inset:0;z-index:-1;overflow:hidden}
.sm-clip__media img{width:100%;height:100%;object-fit:cover}
.sm-clip__media::after{content:'';position:absolute;inset:0;background:rgba(20,17,16,.45)}
.sm-clip h3{margin:0;text-align:center;color:#f3eadf;font:400 clamp(30px,6vw,64px)/1 Georgia,serif}
.sm-clip em{color:#ff7a45}`,
    js: `${SETUP('.sm-clip')}
gsap.fromTo('.sm-clip__media', { clipPath: 'inset(18% 14% 18% 14% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.sm-clip__sec', start: 'top 90%', end: 'top 10%', scrub: true } });
gsap.fromTo('.sm-clip__media img', { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.sm-clip__sec', start: 'top bottom', end: 'bottom top', scrub: true } });
gsap.from('.sm-clip h3', { y: 60, autoAlpha: 0, ease: 'power3.out', scrollTrigger: { trigger: '.sm-clip__sec', start: 'top 40%', end: 'top 5%', scrub: true } });`,
  },
  {
    id: 'parallax-photo-grid', name: 'Parallax Photo Grid', industry: 'Scroll & Motion', tags: ['GSAP', 'Parallax', 'Grid'], stage: '#f4efe7', full: true, libs: CDN,
    desc: 'Three columns of photos moving at different speeds for real depth. Great for menus, lookbooks and portfolios.',
    html: `<div class="sm-px"><div>${HINT}<div class="sm-px__grid">
<div class="sm-px__col" data-speed="-12"><img src="${IMG}/restaurant/img/hummus.webp" alt=""><img src="${IMG}/restaurant/img/burrata.webp" alt=""></div>
<div class="sm-px__col" data-speed="14"><img src="${IMG}/restaurant/img/shortrib.webp" alt=""><img src="${IMG}/restaurant/img/kunafa.webp" alt=""></div>
<div class="sm-px__col" data-speed="-6"><img src="${IMG}/restaurant/img/fattoush.webp" alt=""><img src="${IMG}/restaurant/img/lemonade.webp" alt=""></div>
</div></div></div>`,
    css: `${BASE('.sm-px')}
.sm-px__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4vw;padding:30vh 6vw 50vh}
.sm-px__col{display:grid;gap:4vw}
.sm-px img{width:100%;aspect-ratio:1;object-fit:contain;filter:drop-shadow(0 18px 20px rgba(60,35,15,.25))}`,
    js: `${SETUP('.sm-px')}
box.querySelectorAll('.sm-px__col').forEach(function (c) {
  gsap.to(c, { yPercent: +c.dataset.speed, ease: 'none', scrollTrigger: { trigger: '.sm-px__grid', start: 'top bottom', end: 'bottom top', scrub: true } });
  c.querySelectorAll('img').forEach(function (img) { gsap.fromTo(img, { rotate: -25 }, { rotate: 25, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } }); });
});`,
  },
  {
    id: 'stacking-cards', name: 'Stacking Cards', industry: 'Scroll & Motion', tags: ['GSAP', 'Sticky', 'Cards'], stage: '#101214', full: true, libs: CDN,
    desc: 'Cards stick and stack as you scroll; the ones underneath shrink and dim. Perfect for services, steps or pricing.',
    html: `<div class="sm-stack"><div>${HINT}<div class="sm-stack__list">
<article style="--c:#e8572a"><span>01</span><h4>Discover</h4><p>We learn your business, your customers and your goals.</p></article>
<article style="--c:#4f7dff"><span>02</span><h4>Design</h4><p>Original design, built around what makes you different.</p></article>
<article style="--c:#83a94b"><span>03</span><h4>Build</h4><p>Fast, responsive and smooth on every screen.</p></article>
<article style="--c:#c2185b"><span>04</span><h4>Launch</h4><p>We go live together and keep improving.</p></article>
</div><div style="height:40vh"></div></div></div>`,
    css: `${BASE('.sm-stack')}
.sm-stack__list{padding:12vh 6vw 0}
.sm-stack article{position:sticky;top:12vh;height:62vh;max-height:340px;margin:0 auto 6vh;max-width:520px;padding:28px;border-radius:26px;background:var(--c);color:#fff;font:15px system-ui,sans-serif;transform-origin:center top;box-shadow:0 -20px 40px -20px rgba(0,0,0,.6)}
.sm-stack span{font:700 13px ui-monospace,monospace;opacity:.7}
.sm-stack h4{margin:10px 0 8px;font:700 clamp(30px,6vw,48px)/1 system-ui,sans-serif;letter-spacing:-.03em}
.sm-stack p{max-width:320px;margin:0;font-size:16px;opacity:.9}`,
    js: `${SETUP('.sm-stack')}
var cards = box.querySelectorAll('.sm-stack article');
cards.forEach(function (c, i) {
  if (i === cards.length - 1) return;
  gsap.to(c, { scale: .9, filter: 'brightness(.6)', ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top 12%', scrub: true } });
});`,
  },
  {
    id: 'velocity-marquee', name: 'Velocity Marquee', industry: 'Scroll & Motion', tags: ['Lenis', 'Marquee', 'Typography'], stage: '#e8ff5a', full: true, libs: CDN,
    desc: 'An endless text marquee that speeds up, reverses and leans with your scroll speed. Uses Lenis velocity.',
    html: `<div class="sm-mq"><div>${HINT}<div style="height:30vh"></div><div class="sm-mq__row"><div class="sm-mq__track">Websites ✦ Apps ✦ AI ✦ Video ✦ Branding ✦ </div></div><div class="sm-mq__row sm-mq__row--b"><div class="sm-mq__track">Built in Dubai ✦ Built to move ✦ </div></div><div style="height:90vh"></div></div></div>`,
    css: `${BASE('.sm-mq')}
.sm-mq .sm-hint{background:rgba(0,0,0,.8)}
.sm-mq__row{position:sticky;top:28vh;overflow:hidden;white-space:nowrap;padding:8px 0}
.sm-mq__row--b{top:52vh;background:#111;color:#e8ff5a}
.sm-mq__track{display:inline-block;font:800 clamp(40px,9vw,86px)/1 system-ui,sans-serif;letter-spacing:-.04em;color:inherit;will-change:transform}`,
    js: `${SETUP('.sm-mq')}
box.querySelectorAll('.sm-mq__track').forEach(function (t) { t.textContent = t.textContent.repeat(4); });
var tracks = box.querySelectorAll('.sm-mq__track'), x = [0, 0], dir = 1, skew = 0;
gsap.ticker.add(function () {
  var v = lenis.velocity || 0; if (Math.abs(v) > .3) dir = v > 0 ? 1 : -1;
  skew += (gsap.utils.clamp(-12, 12, v * -.6) - skew) * .1;
  tracks.forEach(function (t, i) {
    var w = t.scrollWidth / 4; x[i] -= (1 + Math.abs(v) * .5) * dir * (i ? -1 : 1);
    x[i] = ((x[i] % w) - w) % w;
    t.style.transform = 'translateX(' + x[i] + 'px) skewX(' + skew + 'deg)';
  });
});`,
  },
  {
    id: 'scrub-stats', name: 'Scroll-scrubbed Stats', industry: 'Scroll & Motion', tags: ['GSAP', 'Numbers', 'Progress'], stage: '#0d1b2a', full: true, libs: CDN,
    desc: 'Numbers count and bars fill exactly in step with your scroll, forwards and backwards.',
    html: `<div class="sm-st"><div>${HINT}<div style="height:50vh"></div><section class="sm-st__sec"><h4>Results that move</h4>
<div class="sm-st__row"><b data-to="98">0</b><span>% visa approval rate</span><i data-w="98"></i></div>
<div class="sm-st__row"><b data-to="12400">0</b><span>applications handled</span><i data-w="80"></i></div>
<div class="sm-st__row"><b data-to="60">0</b><span>countries covered</span><i data-w="60"></i></div>
</section><div style="height:60vh"></div></div></div>`,
    css: `${BASE('.sm-st')}
.sm-st__sec{max-width:520px;margin:0 auto;padding:0 24px;color:#e6eef7;font:15px system-ui,sans-serif}
.sm-st h4{margin:0 0 22px;font:700 clamp(26px,5vw,40px) system-ui,sans-serif;letter-spacing:-.02em}
.sm-st__row{position:relative;display:flex;align-items:baseline;gap:14px;padding:16px 0 20px;border-bottom:1px solid rgba(255,255,255,.1)}
.sm-st__row b{min-width:4.2ch;font:800 clamp(34px,7vw,56px)/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#62d2a2}
.sm-st__row span{color:#8aa3bf}
.sm-st__row i{position:absolute;left:0;bottom:-1px;height:3px;width:0;background:linear-gradient(90deg,#62d2a2,#4f7dff);border-radius:3px}`,
    js: `${SETUP('.sm-st')}
var tl = gsap.timeline({ scrollTrigger: { trigger: '.sm-st__sec', start: 'top 75%', end: 'bottom 40%', scrub: true } });
box.querySelectorAll('.sm-st__row').forEach(function (r, i) {
  var b = r.querySelector('b'), o = { v: 0 }, to = +b.dataset.to;
  tl.to(o, { v: to, ease: 'none', onUpdate: function () { b.textContent = Math.round(o.v).toLocaleString('en'); } }, i * .3)
    .to(r.querySelector('i'), { width: r.querySelector('i').dataset.w + '%', ease: 'none' }, i * .3);
});`,
  },
];
