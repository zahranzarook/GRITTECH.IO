// GRIT UI library, batch 1. Each element is self-contained: html + css + js run inside its own preview frame,
// and "Copy code" gives exactly this. Class names are prefixed per element so pasted snippets don't clash.
// stage = preview background. industry = filter group.
export const ELEMENTS = [
  {
    id: 'magnetic-button', name: 'Magnetic Button', industry: 'General', tags: ['Pointer physics', 'Button'], stage: '#0f1012',
    desc: 'A call-to-action that leans toward the cursor with spring physics. The label moves further than the button for depth.',
    html: `<button class="gm-btn"><span class="gm-btn__label">Get started →</span></button>`,
    css: `.gm-btn{position:relative;padding:22px 40px;border:0;border-radius:999px;background:#f4f1ea;color:#111;font:600 17px system-ui,sans-serif;cursor:pointer;will-change:transform;box-shadow:0 20px 40px -18px rgba(244,241,234,.5)}
.gm-btn__label{display:inline-block;will-change:transform}`,
    js: `document.querySelectorAll('.gm-btn').forEach(function (b) {
  var l = b.querySelector('.gm-btn__label'), x = 0, y = 0, tx = 0, ty = 0, raf;
  function loop() { x += (tx - x) * .15; y += (ty - y) * .15;
    b.style.transform = 'translate(' + x + 'px,' + y + 'px)'; l.style.transform = 'translate(' + x * .5 + 'px,' + y * .5 + 'px)';
    if (Math.abs(tx - x) + Math.abs(ty - y) > .1) raf = requestAnimationFrame(loop); else raf = 0; }
  function go() { if (!raf) raf = requestAnimationFrame(loop); }
  addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    var near = Math.hypot(dx, dy) < 160; tx = near ? dx * .35 : 0; ty = near ? dy * .35 : 0; go(); });
  addEventListener('pointerleave', function () { tx = ty = 0; go(); });
});`,
  },
  {
    id: 'liquid-toggle', name: 'Liquid Toggle', industry: 'General', tags: ['Toggle', 'Micro-interaction'], stage: '#e9ecef',
    desc: 'A switch whose knob stretches like liquid as it travels, then settles with a bounce.',
    html: `<label class="gl-tog"><input type="checkbox" checked><span class="gl-tog__track"><span class="gl-tog__knob"></span></span><span class="gl-tog__txt">Dark mode</span></label>`,
    css: `.gl-tog{display:inline-flex;align-items:center;gap:14px;font:600 16px system-ui,sans-serif;color:#1a1d21;cursor:pointer}
.gl-tog input{position:absolute;opacity:0}
.gl-tog__track{position:relative;width:76px;height:40px;border-radius:99px;background:#cfd4da;box-shadow:inset 0 2px 6px rgba(0,0,0,.15);transition:background .4s}
.gl-tog__knob{position:absolute;top:4px;left:4px;width:32px;height:32px;border-radius:99px;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.2);transition:left .45s cubic-bezier(.5,1.6,.4,1),width .25s ease}
.gl-tog input:checked+.gl-tog__track{background:#5b5bf7}
.gl-tog input:checked+.gl-tog__track .gl-tog__knob{left:40px}
.gl-tog:active .gl-tog__knob{width:44px}
.gl-tog input:checked:active+.gl-tog__track .gl-tog__knob{left:28px}
.gl-tog input:focus-visible+.gl-tog__track{outline:2px solid #5b5bf7;outline-offset:3px}`,
    js: ``,
  },
  {
    id: 'spotlight-card', name: 'Spotlight Card', industry: 'General', tags: ['Card', 'Pointer', 'Glow'], stage: '#08090b',
    desc: 'A card with a soft light that follows the cursor and lights up its border.',
    html: `<div class="gs-card"><span class="gs-card__k">Pro plan</span><h3>Everything you need to launch.</h3><p>Unlimited projects, priority support and custom domains.</p><b>$29<small>/mo</small></b></div>`,
    css: `.gs-card{--x:50%;--y:50%;position:relative;width:320px;padding:28px;border-radius:22px;background:#121417;color:#e8eaed;font:15px/1.5 system-ui,sans-serif;overflow:hidden;isolation:isolate}
.gs-card::before{content:'';position:absolute;inset:0;z-index:-1;background:radial-gradient(300px circle at var(--x) var(--y),rgba(120,140,255,.22),transparent 60%)}
.gs-card::after{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;background:radial-gradient(240px circle at var(--x) var(--y),rgba(140,160,255,.9),rgba(255,255,255,.08) 60%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.gs-card__k{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8f9bff}
.gs-card h3{margin:10px 0 6px;font-size:22px;line-height:1.2}
.gs-card p{margin:0 0 18px;color:#9aa0a8}
.gs-card b{font-size:34px}.gs-card small{font-size:14px;color:#9aa0a8}`,
    js: `document.querySelectorAll('.gs-card').forEach(function (c) {
  c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect();
    c.style.setProperty('--x', e.clientX - r.left + 'px'); c.style.setProperty('--y', e.clientY - r.top + 'px'); });
});`,
  },
  {
    id: 'ripple-button', name: 'Ripple Button', industry: 'General', tags: ['Button', 'Click feedback'], stage: '#fff6ee',
    desc: 'Material-style ink ripple that starts exactly where you tap.',
    html: `<button class="gr-btn">Book now</button>`,
    css: `.gr-btn{position:relative;overflow:hidden;padding:18px 44px;border:0;border-radius:16px;background:#ff5a1f;color:#fff;font:700 16px system-ui,sans-serif;cursor:pointer;transition:transform .15s}
.gr-btn:active{transform:scale(.97)}
.gr-btn i{position:absolute;border-radius:50%;background:rgba(255,255,255,.45);transform:scale(0);animation:gr-rip .6s ease-out forwards;pointer-events:none}
@keyframes gr-rip{to{transform:scale(1);opacity:0}}`,
    js: `document.querySelectorAll('.gr-btn').forEach(function (b) {
  b.addEventListener('pointerdown', function (e) { var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2, i = document.createElement('i');
    i.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(i); setTimeout(function () { i.remove(); }, 650); });
});`,
  },
  {
    id: 'glow-border-cta', name: 'Rotating Glow Border', industry: 'General', tags: ['Button', 'Gradient', 'CSS only'], stage: '#050507',
    desc: 'A conic-gradient border that spins around the button. Pure CSS.',
    html: `<a class="gg-cta" href="#"><span>Start free trial</span></a>`,
    css: `@property --gg-a{syntax:'<angle>';initial-value:0deg;inherits:false}
.gg-cta{--gg-a:0deg;position:relative;display:inline-block;padding:2px;border-radius:999px;background:conic-gradient(from var(--gg-a),#ff4d8d,#7c5cff,#28d7ff,#b6ff5c,#ff4d8d);animation:gg-spin 3s linear infinite;text-decoration:none}
.gg-cta span{display:block;padding:18px 36px;border-radius:999px;background:#0b0b0f;color:#fff;font:600 16px system-ui,sans-serif}
.gg-cta::after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:inherit;filter:blur(18px);opacity:.6}
@keyframes gg-spin{to{--gg-a:360deg}}`,
    js: ``,
  },
  {
    id: 'burst-like', name: 'Burst Like Button', industry: 'General', tags: ['Icon button', 'Particles'], stage: '#fff',
    desc: 'A heart that pops and throws particles when liked. The count rolls up.',
    html: `<button class="gb-like" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg><span>128</span></button>`,
    css: `.gb-like{position:relative;display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border:1.5px solid #eee;border-radius:99px;background:#fff;font:700 16px system-ui,sans-serif;color:#222;cursor:pointer}
.gb-like svg{width:26px;height:26px;fill:none;stroke:#222;stroke-width:2;transition:fill .2s,stroke .2s}
.gb-like[aria-pressed=true] svg{fill:#ff2d55;stroke:#ff2d55;animation:gb-pop .45s cubic-bezier(.3,1.8,.5,1)}
@keyframes gb-pop{0%{transform:scale(.4)}100%{transform:scale(1)}}
.gb-like i{position:absolute;left:33px;top:50%;width:6px;height:6px;border-radius:50%;pointer-events:none;animation:gb-fly .6s ease-out forwards}
@keyframes gb-fly{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0)}}`,
    js: `document.querySelectorAll('.gb-like').forEach(function (b) {
  var n = b.querySelector('span');
  b.addEventListener('click', function () {
    var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); n.textContent = +n.textContent + (on ? 1 : -1);
    if (!on) return;
    for (var k = 0; k < 10; k++) { var i = document.createElement('i'), a = k / 10 * Math.PI * 2, d = 26 + Math.random() * 14;
      i.style.cssText = '--dx:' + Math.cos(a) * d + 'px;--dy:' + Math.sin(a) * d + 'px;background:' + ['#ff2d55', '#ffb020', '#7c5cff'][k % 3];
      b.appendChild(i); setTimeout(function (x) { x.remove(); }.bind(null, i), 650); }
  });
});`,
  },
  {
    id: 'add-to-cart-stepper', name: 'Add-to-Cart Stepper', industry: 'Restaurant', tags: ['E-commerce', 'Morph'], stage: '#f6efe6',
    desc: 'An "Add" button that morphs into a quantity stepper. Numbers roll up and down.',
    html: `<div class="gc-add"><button class="gc-add__btn" data-add>Add</button><div class="gc-add__step"><button data-d="-1" aria-label="Less">−</button><span class="gc-add__n"><b>1</b></span><button data-d="1" aria-label="More">+</button></div></div>`,
    css: `.gc-add{position:relative;width:150px;height:52px;font:700 16px system-ui,sans-serif}
.gc-add button{border:0;cursor:pointer;font:inherit}
.gc-add__btn,.gc-add__step{position:absolute;inset:0;border-radius:99px;transition:opacity .25s,transform .4s cubic-bezier(.3,1.5,.5,1)}
.gc-add__btn{background:#1d1a17;color:#fff}
.gc-add__step{display:flex;align-items:center;justify-content:space-between;padding:0 6px;background:#e8572a;color:#fff;opacity:0;transform:scale(.6);pointer-events:none}
.gc-add.is-on .gc-add__btn{opacity:0;transform:scale(1.2);pointer-events:none}
.gc-add.is-on .gc-add__step{opacity:1;transform:none;pointer-events:auto}
.gc-add__step button{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:20px}
.gc-add__n{position:relative;height:24px;overflow:hidden;min-width:24px;text-align:center}
.gc-add__n b{display:block;line-height:24px}
.gc-add__n b.up{animation:gc-up .3s ease}.gc-add__n b.dn{animation:gc-dn .3s ease}
@keyframes gc-up{from{transform:translateY(100%)}}@keyframes gc-dn{from{transform:translateY(-100%)}}`,
    js: `document.querySelectorAll('.gc-add').forEach(function (w) {
  var n = 1, b = w.querySelector('.gc-add__n b');
  w.querySelector('[data-add]').onclick = function () { n = 1; b.textContent = 1; w.classList.add('is-on'); };
  w.querySelectorAll('[data-d]').forEach(function (x) { x.onclick = function () {
    var d = +x.dataset.d; n += d; if (n < 1) { w.classList.remove('is-on'); return; }
    b.textContent = n; b.className = ''; void b.offsetWidth; b.className = d > 0 ? 'up' : 'dn'; }; });
});`,
  },
  {
    id: 'spice-slider', name: 'Spice Level Slider', industry: 'Restaurant', tags: ['Range', 'Form'], stage: '#1a1412',
    desc: 'A range slider for spice level. Chillies light up and the label changes as you drag.',
    html: `<div class="gp-spice"><div class="gp-spice__top"><span>Spice level</span><b>Medium</b></div><div class="gp-spice__chili"><i>🌶</i><i>🌶</i><i>🌶</i><i>🌶</i><i>🌶</i></div><input type="range" min="0" max="4" value="2" aria-label="Spice level"></div>`,
    css: `.gp-spice{width:300px;padding:22px;border-radius:22px;background:#241c19;color:#f3eadf;font:15px system-ui,sans-serif}
.gp-spice__top{display:flex;justify-content:space-between;margin-bottom:14px}.gp-spice__top b{color:#ff7a45;transition:color .3s}
.gp-spice__chili{display:flex;justify-content:space-between;margin-bottom:12px;font-size:26px}
.gp-spice__chili i{font-style:normal;filter:grayscale(1);opacity:.35;transform:scale(.85);transition:all .35s cubic-bezier(.3,1.6,.5,1)}
.gp-spice__chili i.on{filter:none;opacity:1;transform:scale(1.1)}
.gp-spice input{width:100%;height:8px;-webkit-appearance:none;appearance:none;border-radius:9px;background:linear-gradient(90deg,#ffb347,#ff3d1f) 0/var(--p,50%) 100% no-repeat,#3a2e2a;outline:none}
.gp-spice input::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 0 0 6px rgba(255,90,40,.25);cursor:grab}
.gp-spice input::-moz-range-thumb{width:26px;height:26px;border:0;border-radius:50%;background:#fff;cursor:grab}`,
    js: `document.querySelectorAll('.gp-spice').forEach(function (w) {
  var r = w.querySelector('input'), b = w.querySelector('b'), c = w.querySelectorAll('i'), L = ['No spice', 'Mild', 'Medium', 'Hot', 'Fire 🔥'];
  function paint() { var v = +r.value; b.textContent = L[v]; r.style.setProperty('--p', v / 4 * 100 + '%');
    c.forEach(function (x, i) { x.classList.toggle('on', i <= v && v > 0); }); }
  r.addEventListener('input', paint); paint();
});`,
  },
  {
    id: 'sliding-tabs', name: 'Sliding Menu Tabs', industry: 'Restaurant', tags: ['Tabs', 'Navigation'], stage: '#f4efe7',
    desc: 'Category tabs with a pill that glides to the selected tab. Works with keyboard arrows.',
    html: `<div class="gt-tabs" role="tablist"><span class="gt-tabs__ink"></span><button role="tab" aria-selected="true">Starters</button><button role="tab">Mains</button><button role="tab">Grill</button><button role="tab">Desserts</button></div>`,
    css: `.gt-tabs{position:relative;display:inline-flex;gap:4px;padding:6px;border-radius:99px;background:#fff;box-shadow:0 10px 30px -12px rgba(0,0,0,.2);font:600 15px system-ui,sans-serif}
.gt-tabs button{position:relative;z-index:1;height:44px;padding:0 20px;border:0;border-radius:99px;background:none;color:#3b332d;cursor:pointer;font:inherit;transition:color .3s}
.gt-tabs button[aria-selected=true]{color:#fff}
.gt-tabs__ink{position:absolute;top:6px;height:44px;border-radius:99px;background:#1d1a17;transition:left .5s cubic-bezier(.3,1.3,.4,1),width .5s cubic-bezier(.3,1.3,.4,1)}`,
    js: `document.querySelectorAll('.gt-tabs').forEach(function (t) {
  var ink = t.querySelector('.gt-tabs__ink'), tabs = [].slice.call(t.querySelectorAll('[role=tab]'));
  function sel(b) { tabs.forEach(function (x) { x.setAttribute('aria-selected', x === b); x.tabIndex = x === b ? 0 : -1; });
    ink.style.left = b.offsetLeft + 'px'; ink.style.width = b.offsetWidth + 'px'; }
  tabs.forEach(function (b, i) { b.onclick = function () { sel(b); };
    b.onkeydown = function (e) { var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (k) { var n = tabs[(i + k + tabs.length) % tabs.length]; sel(n); n.focus(); } }; });
  sel(t.querySelector('[aria-selected=true]'));
});`,
  },
  {
    id: 'tilt-property-card', name: '3D Tilt Property Card', industry: 'Real estate', tags: ['3D', 'Card', 'Pointer'], stage: '#e8ecf1',
    desc: 'A listing card that tilts in 3D toward the cursor, with a moving glare and lifted details.',
    html: `<article class="gk-card"><div class="gk-card__img"><span class="gk-card__tag">For sale</span></div><div class="gk-card__body"><b>AED 3,450,000</b><h3>Marina Vista, 2 bed</h3><p>Dubai Marina · 1,420 sq ft · Sea view</p></div><span class="gk-card__glare"></span></article>`,
    css: `.gk-wrap{perspective:900px}
.gk-card{position:relative;width:300px;border-radius:22px;background:#fff;overflow:hidden;font:15px system-ui,sans-serif;color:#14213d;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s;box-shadow:0 30px 50px -30px rgba(20,33,61,.5)}
.gk-card__img{position:relative;height:190px;background:linear-gradient(180deg,#8ec5fc,#e0c3fc 55%,#f9d7a7 56%,#e6b980);}
.gk-card__img::before{content:'';position:absolute;left:30px;bottom:0;width:60px;height:130px;background:#2b3a55;box-shadow:70px 30px 0 -5px #3d5175,140px -10px 0 0 #1f2b41,200px 40px 0 -10px #4a5f86;border-radius:6px 6px 0 0}
.gk-card__tag{position:absolute;top:14px;left:14px;padding:6px 12px;border-radius:99px;background:#fff;font-size:12px;font-weight:700;transform:translateZ(30px)}
.gk-card__body{padding:18px 20px 22px;transform:translateZ(40px)}
.gk-card__body b{font-size:20px;color:#0a6cff}.gk-card__body h3{margin:6px 0 4px;font-size:18px}.gk-card__body p{margin:0;color:#6b7690;font-size:13px}
.gk-card__glare{position:absolute;inset:0;background:radial-gradient(circle at var(--gx,50%) var(--gy,0%),rgba(255,255,255,.45),transparent 50%);opacity:0;transition:opacity .3s;pointer-events:none}
.gk-card:hover .gk-card__glare{opacity:1}`,
    js: `document.querySelectorAll('.gk-card').forEach(function (c) {
  if (!c.parentElement.classList.contains('gk-wrap')) { var w = document.createElement('div'); w.className = 'gk-wrap'; c.before(w); w.appendChild(c); }
  c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.transform = 'rotateY(' + (x - .5) * 18 + 'deg) rotateX(' + (.5 - y) * 16 + 'deg)';
    c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%'); });
  c.addEventListener('pointerleave', function () { c.style.transform = ''; });
});`,
  },
  {
    id: 'mortgage-calculator', name: 'Mortgage Mini-Calculator', industry: 'Real estate', tags: ['Calculator', 'Range', 'Numbers'], stage: '#0d1b2a',
    desc: 'Drag the price, deposit and term. The monthly payment counts smoothly to the new value.',
    html: `<div class="gq-calc"><span class="gq-calc__k">Monthly payment</span><b class="gq-calc__out">AED 0</b>
<label>Property price <em data-v="price"></em><input type="range" name="price" min="500000" max="10000000" step="50000" value="2500000"></label>
<label>Deposit <em data-v="dep"></em><input type="range" name="dep" min="20" max="60" value="25"></label>
<label>Term <em data-v="term"></em><input type="range" name="term" min="5" max="25" value="25"></label>
<small>At 4.5% a year. Example only.</small></div>`,
    css: `.gq-calc{width:320px;padding:24px;border-radius:24px;background:#13263b;color:#e6eef7;font:14px system-ui,sans-serif;box-shadow:0 30px 60px -30px #000}
.gq-calc__k{color:#8aa3bf;font-size:12px;letter-spacing:.1em;text-transform:uppercase}
.gq-calc__out{display:block;margin:4px 0 18px;font-size:36px;font-variant-numeric:tabular-nums;color:#62d2a2}
.gq-calc label{display:block;margin-bottom:14px}.gq-calc em{float:right;font-style:normal;font-weight:700}
.gq-calc input{width:100%;margin-top:8px;accent-color:#62d2a2}
.gq-calc small{color:#8aa3bf}`,
    js: `document.querySelectorAll('.gq-calc').forEach(function (w) {
  var out = w.querySelector('.gq-calc__out'), shown = 0, target = 0, f = function (n) { return Math.round(n).toLocaleString('en'); };
  function calc() { var P = +w.querySelector('[name=price]').value, d = +w.querySelector('[name=dep]').value, y = +w.querySelector('[name=term]').value;
    w.querySelector('[data-v=price]').textContent = 'AED ' + f(P); w.querySelector('[data-v=dep]').textContent = d + '%'; w.querySelector('[data-v=term]').textContent = y + ' years';
    var L = P * (1 - d / 100), r = .045 / 12, n = y * 12; target = L * r / (1 - Math.pow(1 + r, -n)); tick(); }
  var raf; function tick() { cancelAnimationFrame(raf); (function s() { shown += (target - shown) * .18; out.textContent = 'AED ' + f(shown); if (Math.abs(target - shown) > 1) raf = requestAnimationFrame(s); else out.textContent = 'AED ' + f(target); })(); }
  w.addEventListener('input', calc); calc();
});`,
  },
  {
    id: 'size-picker', name: 'Size Picker', industry: 'Fashion', tags: ['E-commerce', 'Selector'], stage: '#f3f0eb',
    desc: 'Size buttons with a sliding highlight, sold-out states and a low-stock hint.',
    html: `<div class="gz-size"><div class="gz-size__top"><span>Size</span><a href="#">Size guide</a></div><div class="gz-size__row"><span class="gz-size__ink"></span><button>XS</button><button>S</button><button>M</button><button disabled>L</button><button>XL</button></div><p class="gz-size__note">Select a size</p></div>`,
    css: `.gz-size{width:320px;font:14px system-ui,sans-serif;color:#141414}
.gz-size__top{display:flex;justify-content:space-between;margin-bottom:10px;font-weight:600}.gz-size__top a{color:#141414}
.gz-size__row{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.gz-size__row button{position:relative;z-index:1;height:50px;border:1px solid #d6d1c9;border-radius:12px;background:transparent;font:600 15px system-ui,sans-serif;cursor:pointer;transition:color .3s,border-color .3s}
.gz-size__row button:hover{border-color:#141414}
.gz-size__row button.on{color:#fff;border-color:transparent}
.gz-size__row button:disabled{color:#b8b2a8;cursor:not-allowed;background:linear-gradient(to top right,transparent 48%,#d6d1c9 49% 51%,transparent 52%)}
.gz-size__ink{position:absolute;top:0;height:50px;border-radius:12px;background:#141414;opacity:0;transition:left .4s cubic-bezier(.3,1.3,.4,1),opacity .3s}
.gz-size__note{min-height:20px;margin:10px 0 0;color:#6e675d;transition:color .3s}.gz-size__note.low{color:#d14b2a}`,
    js: `document.querySelectorAll('.gz-size').forEach(function (w) {
  var ink = w.querySelector('.gz-size__ink'), note = w.querySelector('.gz-size__note'), stock = { XS: 12, S: 2, M: 8, XL: 1 };
  w.querySelectorAll('button:not(:disabled)').forEach(function (b) { b.onclick = function () {
    w.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    ink.style.cssText = 'left:' + b.offsetLeft + 'px;width:' + b.offsetWidth + 'px;opacity:1';
    var s = stock[b.textContent]; note.textContent = s < 3 ? 'Only ' + s + ' left in ' + b.textContent : 'In stock, ships tomorrow'; note.classList.toggle('low', s < 3); }; });
});`,
  },
  {
    id: 'swatch-morph', name: 'Colour Swatch Preview', industry: 'Fashion', tags: ['E-commerce', 'Colour', 'Morph'], stage: '#faf8f5',
    desc: 'Pick a colour and the product preview blob morphs and recolours smoothly.',
    html: `<div class="gw-sw"><div class="gw-sw__blob"></div><div class="gw-sw__info"><b>Linen Overshirt</b><span class="gw-sw__name">Sand</span><div class="gw-sw__dots"><button style="--c:#d8c3a5" aria-label="Sand" class="on"></button><button style="--c:#6b7f5e" aria-label="Olive"></button><button style="--c:#2f3e5c" aria-label="Navy"></button><button style="--c:#b5523b" aria-label="Rust"></button></div></div></div>`,
    css: `.gw-sw{display:flex;align-items:center;gap:26px;font:15px system-ui,sans-serif;color:#1c1b19}
.gw-sw__blob{--c:#d8c3a5;width:170px;height:170px;background:var(--c);border-radius:42% 58% 63% 37%/45% 41% 59% 55%;box-shadow:inset -20px -20px 40px rgba(0,0,0,.15),0 30px 40px -24px var(--c);transition:background .6s,box-shadow .6s;animation:gw-morph 8s ease-in-out infinite}
@keyframes gw-morph{50%{border-radius:58% 42% 38% 62%/57% 61% 39% 43%;transform:rotate(12deg)}}
.gw-sw__info b{display:block;font-size:19px}.gw-sw__name{color:#7a7368;font-size:13px}
.gw-sw__dots{display:flex;gap:10px;margin-top:14px}
.gw-sw__dots button{width:30px;height:30px;border-radius:50%;border:0;background:var(--c);cursor:pointer;box-shadow:0 0 0 2px #fff,0 0 0 3px transparent;transition:box-shadow .3s,transform .3s}
.gw-sw__dots button:hover{transform:scale(1.1)}.gw-sw__dots button.on{box-shadow:0 0 0 3px #fff,0 0 0 5px var(--c)}`,
    js: `document.querySelectorAll('.gw-sw').forEach(function (w) {
  var blob = w.querySelector('.gw-sw__blob'), name = w.querySelector('.gw-sw__name');
  w.querySelectorAll('.gw-sw__dots button').forEach(function (b) { b.onclick = function () {
    w.querySelectorAll('.gw-sw__dots button').forEach(function (x) { x.classList.toggle('on', x === b); });
    blob.style.setProperty('--c', b.style.getPropertyValue('--c')); name.textContent = b.getAttribute('aria-label'); }; });
});`,
  },
  {
    id: 'flight-route-card', name: 'Flight Route Card', industry: 'Travel', tags: ['SVG animation', 'Card'], stage: '#0b1020',
    desc: 'A plane flies along a dashed arc between two airports. The swap button flips the route with a spin.',
    html: `<div class="gf-card"><div class="gf-card__row"><div><b data-a>DXB</b><span data-ac>Dubai</span></div><button class="gf-card__swap" aria-label="Swap">⇄</button><div class="gf-card__r"><b data-b>LHR</b><span data-bc>London</span></div></div>
<svg class="gf-card__arc" viewBox="0 0 300 70"><path id="gfp" d="M10 60 Q150 -20 290 60" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2" stroke-dasharray="4 6"/><circle cx="10" cy="60" r="4" fill="#ffb547"/><circle cx="290" cy="60" r="4" fill="#ffb547"/><g class="gf-card__plane"><path d="M-8 0 L8 0 M0 0 L-4 -6 M0 0 L-4 6 M5 0 L3 -3 M5 0 L3 3" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g></svg>
<div class="gf-card__row gf-card__meta"><span>7h 25m · Non-stop</span><b>AED 2,140</b></div></div>`,
    css: `.gf-card{width:340px;padding:22px;border-radius:24px;background:linear-gradient(160deg,#18234a,#0e1530);color:#fff;font:14px system-ui,sans-serif;box-shadow:0 30px 60px -30px #000}
.gf-card__row{display:flex;align-items:center;justify-content:space-between}
.gf-card__row b{display:block;font-size:30px;letter-spacing:-.02em}.gf-card__row span{color:#8d9bc4;font-size:13px}.gf-card__r{text-align:right}
.gf-card__swap{width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;font-size:18px;cursor:pointer;transition:transform .5s cubic-bezier(.3,1.5,.5,1)}
.gf-card__arc{width:100%;margin:8px 0}.gf-card__plane{offset-path:path('M10 60 Q150 -20 290 60');animation:gf-fly 3.2s ease-in-out infinite}
@keyframes gf-fly{from{offset-distance:0%}to{offset-distance:100%}}
.gf-card__meta{padding-top:14px;border-top:1px solid rgba(255,255,255,.12)}.gf-card__meta b{font-size:18px;color:#ffb547}`,
    js: `document.querySelectorAll('.gf-card').forEach(function (c) {
  var s = c.querySelector('.gf-card__swap'), r = 0;
  s.onclick = function () { r += 180; s.style.transform = 'rotate(' + r + 'deg)';
    ['', 'c'].forEach(function (k) { var a = c.querySelector('[data-a' + k + ']'), b = c.querySelector('[data-b' + k + ']'), t = a.textContent; a.textContent = b.textContent; b.textContent = t; }); };
});`,
  },
  {
    id: 'passenger-counter', name: 'Passenger Selector', industry: 'Travel', tags: ['Dropdown', 'Stepper', 'Form'], stage: '#eef2f8',
    desc: 'A dropdown with adult, child and infant counters and a live summary.',
    html: `<div class="gx-pax"><button class="gx-pax__btn" aria-expanded="false"><span>Travellers</span><b>2 adults</b></button><div class="gx-pax__pop"><div data-k="adults" data-min="1"><span>Adults<small>12+ years</small></span><button data-d="-1">−</button><output>2</output><button data-d="1">+</button></div><div data-k="children" data-min="0"><span>Children<small>2–11</small></span><button data-d="-1">−</button><output>0</output><button data-d="1">+</button></div><div data-k="infants" data-min="0"><span>Infants<small>Under 2</small></span><button data-d="-1">−</button><output>0</output><button data-d="1">+</button></div></div></div>`,
    css: `.gx-pax{position:relative;width:300px;font:14px system-ui,sans-serif;color:#0c1533}
.gx-pax__btn{display:grid;width:100%;padding:14px 18px;border:1px solid #d5dbe8;border-radius:16px;background:#fff;text-align:left;cursor:pointer;font:inherit}
.gx-pax__btn span{font-size:12px;color:#66708a}.gx-pax__btn b{font-size:16px}
.gx-pax__pop{position:absolute;left:0;right:0;top:calc(100% + 8px);padding:8px 18px;border-radius:18px;background:#fff;box-shadow:0 30px 50px -20px rgba(12,21,51,.35);opacity:0;transform:translateY(-8px) scale(.98);transform-origin:top;pointer-events:none;transition:all .3s cubic-bezier(.2,.8,.2,1)}
.gx-pax.open .gx-pax__pop{opacity:1;transform:none;pointer-events:auto}
.gx-pax__pop div{display:flex;align-items:center;gap:10px;padding:12px 0}.gx-pax__pop div+div{border-top:1px solid #edf0f6}
.gx-pax__pop span{flex:1;font-weight:600}.gx-pax__pop small{display:block;font-weight:400;color:#66708a;font-size:12px}
.gx-pax__pop button{width:34px;height:34px;border-radius:50%;border:1px solid #d5dbe8;background:#fff;font-size:18px;cursor:pointer}
.gx-pax__pop button:disabled{opacity:.3;cursor:not-allowed}
.gx-pax__pop output{min-width:18px;text-align:center;font-weight:700}`,
    js: `document.querySelectorAll('.gx-pax').forEach(function (w) {
  var btn = w.querySelector('.gx-pax__btn'), sum = btn.querySelector('b');
  btn.onclick = function () { var o = w.classList.toggle('open'); btn.setAttribute('aria-expanded', o); };
  function paint() { var t = []; w.querySelectorAll('[data-k]').forEach(function (r) { var n = +r.querySelector('output').textContent;
    r.querySelector('[data-d="-1"]').disabled = n <= +r.dataset.min; if (n) t.push(n + ' ' + (n === 1 ? r.dataset.k.replace(/ren$|s$/, '') : r.dataset.k)); });
    sum.textContent = t.join(', '); }
  w.querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { var o = b.parentNode.querySelector('output'); o.textContent = Math.max(0, +o.textContent + +b.dataset.d); paint(); }; });
  document.addEventListener('click', function (e) { if (!w.contains(e.target)) { w.classList.remove('open'); btn.setAttribute('aria-expanded', false); } });
  paint();
});`,
  },
  {
    id: 'time-slot-picker', name: 'Time Slot Picker', industry: 'Salon & clinic', tags: ['Booking', 'Selector'], stage: '#fbf3f5',
    desc: 'A booking picker with day pills and time slots. Taken slots are struck through; the selection springs in.',
    html: `<div class="gy-slot"><div class="gy-slot__days"></div><div class="gy-slot__times"></div><button class="gy-slot__go" disabled>Choose a time</button></div>`,
    css: `.gy-slot{width:340px;padding:20px;border-radius:24px;background:#fff;box-shadow:0 30px 60px -30px rgba(120,40,70,.35);font:14px system-ui,sans-serif;color:#2b1820}
.gy-slot__days{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:16px}
.gy-slot__days button{display:grid;padding:8px 0;border:0;border-radius:14px;background:#f7eef1;cursor:pointer;font:inherit;transition:all .3s}
.gy-slot__days button small{font-size:11px;color:#9a7c86}.gy-slot__days button b{font-size:18px}
.gy-slot__days button.on{background:#c2185b;color:#fff}.gy-slot__days button.on small{color:#f8c6d8}
.gy-slot__times{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:16px}
.gy-slot__times button{height:40px;border:1px solid #ecdde2;border-radius:12px;background:#fff;font:600 13px system-ui,sans-serif;cursor:pointer;transition:all .3s cubic-bezier(.3,1.5,.5,1)}
.gy-slot__times button:disabled{color:#cdb9c0;text-decoration:line-through;cursor:not-allowed}
.gy-slot__times button.on{background:#2b1820;color:#fff;border-color:#2b1820;transform:scale(1.05)}
.gy-slot__go{width:100%;height:50px;border:0;border-radius:14px;background:#c2185b;color:#fff;font:700 15px system-ui,sans-serif;cursor:pointer;transition:opacity .3s}
.gy-slot__go:disabled{opacity:.4;cursor:default}`,
    js: `document.querySelectorAll('.gy-slot').forEach(function (w) {
  var D = w.querySelector('.gy-slot__days'), T = w.querySelector('.gy-slot__times'), go = w.querySelector('.gy-slot__go'), now = new Date(), day = 0, times = ['10:00', '11:00', '12:30', '14:00', '15:30', '17:00', '18:00', '19:30', '20:30'];
  for (var i = 0; i < 5; i++) { var d = new Date(now); d.setDate(d.getDate() + i);
    D.insertAdjacentHTML('beforeend', '<button data-i="' + i + '"' + (i ? '' : ' class="on"') + '><small>' + d.toLocaleDateString('en', { weekday: 'short' }) + '</small><b>' + d.getDate() + '</b></button>'); }
  function slots() { T.innerHTML = times.map(function (t, k) { return '<button' + ((k * 5 + day * 3) % 4 === 0 ? ' disabled' : '') + '>' + t + '</button>'; }).join(''); go.disabled = true; go.textContent = 'Choose a time'; }
  D.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; day = +b.dataset.i; D.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); slots(); };
  T.onclick = function (e) { var b = e.target.closest('button'); if (!b || b.disabled) return; T.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); go.disabled = false; go.textContent = 'Book ' + b.textContent; };
  go.onclick = function () { go.textContent = '✓ Booked'; };
  slots();
});`,
  },
  {
    id: 'rating-stars', name: 'Rating Stars', industry: 'Salon & clinic', tags: ['Rating', 'Feedback', 'Form'], stage: '#fff',
    desc: 'Hover to preview, click to rate. Stars fill in sequence and the label explains the score.',
    html: `<div class="gv-rate"><div class="gv-rate__stars" role="radiogroup" aria-label="Rating"><button role="radio" aria-label="1 star">★</button><button role="radio" aria-label="2 stars">★</button><button role="radio" aria-label="3 stars">★</button><button role="radio" aria-label="4 stars">★</button><button role="radio" aria-label="5 stars">★</button></div><p class="gv-rate__txt">Tap to rate your visit</p></div>`,
    css: `.gv-rate{text-align:center;font:15px system-ui,sans-serif;color:#2a2a2a}
.gv-rate__stars{display:flex;gap:6px}
.gv-rate__stars button{border:0;background:none;font-size:46px;line-height:1;color:#e4e4e4;cursor:pointer;transition:color .2s,transform .35s cubic-bezier(.3,1.8,.5,1)}
.gv-rate__stars button.hot{color:#ffc24b}.gv-rate__stars button.on{color:#ffb000;transform:scale(1.12)}
.gv-rate__txt{min-height:22px;margin:10px 0 0;font-weight:600}`,
    js: `document.querySelectorAll('.gv-rate').forEach(function (w) {
  var s = [].slice.call(w.querySelectorAll('button')), t = w.querySelector('.gv-rate__txt'), val = 0, L = ['Tap to rate your visit', 'Not great', 'Could be better', 'Good', 'Really good', 'Loved it!'];
  function paint(n, hot) { s.forEach(function (b, i) { b.classList.toggle('hot', hot && i < n); b.classList.toggle('on', !hot && i < n); b.style.transitionDelay = hot ? '0ms' : i * 50 + 'ms'; }); t.textContent = L[n]; }
  s.forEach(function (b, i) { b.onmouseenter = function () { paint(i + 1, true); }; b.onclick = function () { val = i + 1; s.forEach(function (x, k) { x.setAttribute('aria-checked', k === i); }); paint(val, false); }; });
  w.onmouseleave = function () { paint(val, false); };
});`,
  },
  {
    id: 'progress-ring', name: 'Activity Ring', industry: 'Fitness', tags: ['SVG', 'Progress', 'Count-up'], stage: '#0a0a0a',
    desc: 'An activity ring that fills with a glowing gradient. Tap the button to log activity and watch it count up.',
    html: `<div class="gn-ring"><svg viewBox="0 0 120 120"><defs><linearGradient id="gnG" x1="0" x2="1"><stop offset="0" stop-color="#b6ff3c"/><stop offset="1" stop-color="#21e6c1"/></linearGradient></defs><circle cx="60" cy="60" r="50" class="gn-ring__bg"/><circle cx="60" cy="60" r="50" class="gn-ring__fg"/></svg><div class="gn-ring__txt"><b>0</b><span>of 600 kcal</span></div><button class="gn-ring__add">+ 120 kcal workout</button></div>`,
    css: `.gn-ring{position:relative;display:grid;justify-items:center;gap:18px;font:14px system-ui,sans-serif;color:#fff}
.gn-ring svg{width:200px;height:200px;transform:rotate(-90deg);filter:drop-shadow(0 0 14px rgba(120,255,140,.35))}
.gn-ring circle{fill:none;stroke-width:12;stroke-linecap:round}.gn-ring__bg{stroke:#1f2a1f}
.gn-ring__fg{stroke:url(#gnG);stroke-dasharray:314;stroke-dashoffset:314;transition:stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)}
.gn-ring__txt{position:absolute;top:0;height:200px;display:grid;place-content:center;text-align:center}
.gn-ring__txt b{font-size:44px;font-variant-numeric:tabular-nums}.gn-ring__txt span{color:#8b8b8b}
.gn-ring__add{padding:12px 20px;border:0;border-radius:99px;background:#b6ff3c;color:#0a0a0a;font:700 14px system-ui,sans-serif;cursor:pointer;transition:transform .2s}.gn-ring__add:active{transform:scale(.95)}`,
    js: `document.querySelectorAll('.gn-ring').forEach(function (w) {
  var fg = w.querySelector('.gn-ring__fg'), b = w.querySelector('b'), v = 0, shown = 0, goal = 600;
  function set(n) { v = n; fg.style.strokeDashoffset = 314 * (1 - Math.min(1, v / goal)); var from = shown, t0 = performance.now();
    (function s(t) { var k = Math.min(1, (t - t0) / 900); shown = Math.round(from + (v - from) * (1 - Math.pow(1 - k, 3))); b.textContent = shown; if (k < 1) requestAnimationFrame(s); })(t0); }
  w.querySelector('.gn-ring__add').onclick = function () { set(v >= goal ? 0 : v + 120); };
  setTimeout(function () { set(240); }, 300);
});`,
  },
  {
    id: 'hold-to-confirm', name: 'Hold to Confirm', industry: 'Fitness', tags: ['Button', 'Press & hold'], stage: '#16161a',
    desc: 'Press and hold to confirm. The fill tracks your press and releases if you let go early.',
    html: `<button class="gh-hold"><span class="gh-hold__fill"></span><span class="gh-hold__txt">Hold to end workout</span></button>`,
    css: `.gh-hold{position:relative;width:280px;height:62px;overflow:hidden;border:0;border-radius:18px;background:#2a2a31;color:#fff;font:700 16px system-ui,sans-serif;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none}
.gh-hold__fill{position:absolute;inset:0;background:linear-gradient(90deg,#ff3d6e,#ff8a3d);transform:scaleX(0);transform-origin:left}
.gh-hold__txt{position:relative}
.gh-hold.done{animation:gh-ok .5s cubic-bezier(.3,1.6,.5,1)}@keyframes gh-ok{50%{transform:scale(1.05)}}`,
    js: `document.querySelectorAll('.gh-hold').forEach(function (b) {
  var f = b.querySelector('.gh-hold__fill'), t = b.querySelector('.gh-hold__txt'), p = 0, dir = 0, last = 0, label = t.textContent;
  function loop(now) { var dt = (now - last) / 1000; last = now; p = Math.max(0, Math.min(1, p + dir * dt * (dir > 0 ? .75 : 2.5)));
    f.style.transform = 'scaleX(' + p + ')';
    if (p >= 1) { dir = 0; t.textContent = '✓ Workout saved'; b.classList.add('done'); setTimeout(function () { p = 0; f.style.transform = 'scaleX(0)'; t.textContent = label; b.classList.remove('done'); }, 1600); return; }
    if (dir > 0 || p > 0) requestAnimationFrame(loop); }
  function start(d) { dir = d; last = performance.now(); requestAnimationFrame(loop); }
  b.addEventListener('pointerdown', function () { start(1); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) { b.addEventListener(e, function () { if (dir > 0) start(-1); }); });
});`,
  },
  {
    id: 'orbit-loader', name: 'Orbit Loader', industry: 'Loading', tags: ['Loader', 'CSS only'], stage: '#0d0f14',
    desc: 'Three dots orbiting at different speeds with trailing glow. Pure CSS, ready for any loading state.',
    html: `<div class="go-load" role="status" aria-label="Loading"><i></i><i></i><i></i><span>Loading</span></div>`,
    css: `.go-load{position:relative;width:96px;height:96px;font:600 12px system-ui,sans-serif;color:#8c94a8}
.go-load i{position:absolute;inset:0;border-radius:50%;animation:go-spin 1.6s cubic-bezier(.6,.1,.4,.9) infinite}
.go-load i::before{content:'';position:absolute;top:0;left:50%;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#7c5cff;box-shadow:0 0 16px #7c5cff}
.go-load i:nth-child(2){inset:14px;animation-duration:1.2s;animation-direction:reverse}.go-load i:nth-child(2)::before{background:#28d7ff;box-shadow:0 0 16px #28d7ff;width:10px;height:10px;margin-left:-5px}
.go-load i:nth-child(3){inset:28px;animation-duration:.9s}.go-load i:nth-child(3)::before{background:#b6ff5c;box-shadow:0 0 16px #b6ff5c;width:8px;height:8px;margin-left:-4px}
.go-load span{position:absolute;top:110px;left:50%;transform:translateX(-50%);letter-spacing:.2em;text-transform:uppercase;animation:go-fade 1.6s ease-in-out infinite}
@keyframes go-spin{to{transform:rotate(360deg)}}@keyframes go-fade{50%{opacity:.35}}`,
    js: ``,
  },
];
