// GRIT UI library, batch 3: playful, modern elements for the industries that run the UAE —
// cars, gold, perfume, cafés, property, tourism, delivery, finance, events and business services.
// Same rules as batch 1: self-contained html + css + js, class names prefixed per element.
// Positions are measured with offsetTop/offsetLeft (not getBoundingClientRect) so they stay right
// when the preview frame scales the element down on small screens.
export const ELEMENTS3 = [
  {
    id: 'shredder-delete', name: 'Shredder Delete Button', industry: 'General', tags: ['Button', 'Delete', 'Delight'], stage: '#f4f4f5',
    desc: 'A compact delete button that shreds itself: the label slides down through a slot in the button and falls out below as curling strips.',
    html: `<div class="gx-shred"><button class="gx-shred__btn" type="button"><span class="gx-shred__teeth" aria-hidden="true"></span><span class="gx-shred__lbl"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Delete</span></button><span class="gx-shred__out" aria-hidden="true"></span></div>`,
    css: `.gx-shred{position:relative;display:inline-block;font-family:system-ui,sans-serif}
.gx-shred__btn{position:relative;display:block;width:132px;height:44px;padding:0;border:0;border-radius:12px;background:#1f2024;overflow:hidden;cursor:pointer;box-shadow:0 1px 0 rgba(255,255,255,.08) inset,0 8px 18px -10px rgba(229,72,77,.7);transition:transform .15s}
.gx-shred__btn:active{transform:scale(.97)}
.gx-shred__btn:focus-visible{outline:2px solid #e5484d;outline-offset:3px}
.gx-shred__lbl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;background:#e5484d;color:#fff;font:600 15px/1 system-ui,sans-serif;letter-spacing:.01em}
.gx-shred__lbl svg{width:17px;height:17px}
.gx-shred__lbl.is-done{background:#2a2c31;color:#d6d8de}
.gx-shred__teeth{position:absolute;left:8px;right:8px;bottom:5px;height:3px;border-radius:2px;background:repeating-linear-gradient(90deg,#55575e 0 4px,transparent 4px 6px);opacity:0;transition:opacity .2s}
.gx-shred.is-on .gx-shred__teeth{opacity:1}
.gx-shred.is-on .gx-shred__btn{animation:gx-shred-buzz .06s linear infinite}
.gx-shred__out{position:absolute;left:0;right:0;top:100%;height:140px;clip-path:inset(0 -60px -60px -60px);pointer-events:none}
.gx-shred__strip{position:absolute;left:0;top:-44px;width:132px;height:44px}
@keyframes gx-shred-buzz{50%{transform:translate(.5px,-.3px)}}`,
    js: `document.querySelectorAll('.gx-shred').forEach(function (w) {
  var btn = w.querySelector('.gx-shred__btn'), lbl = w.querySelector('.gx-shred__lbl'), out = w.querySelector('.gx-shred__out'), busy = false, N = 10;
  var label = lbl.innerHTML;
  btn.addEventListener('click', function () {
    if (busy) return; busy = true; w.classList.add('is-on');
    var H = btn.offsetHeight, W = btn.offsetWidth, D = H + 2, T = 650;
    // The face slides down out of the button; slices of it emerge below at the same speed.
    lbl.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + D + 'px)' }], { duration: T, easing: 'linear', fill: 'forwards' });
    for (var i = 0; i < N; i++) {
      var s = lbl.cloneNode(true), a = i / N * 100, b = 100 - (i + 1) / N * 100;
      s.classList.add('gx-shred__strip'); s.style.cssText = 'top:' + (-H) + 'px;width:' + W + 'px;height:' + H + 'px;border-radius:0;clip-path:inset(0 ' + b + '% 0 ' + a + '%)';
      out.appendChild(s);
      var spread = (i - (N - 1) / 2) * 2.6, rot = (Math.random() - .5) * 26, sag = Math.random() * 8;
      s.animate([
        { transform: 'translate(0,0)', opacity: 1, easing: 'linear' },
        { transform: 'translate(' + spread + 'px,' + (D + sag) + 'px) rotate(' + rot * .3 + 'deg)', opacity: 1, offset: .55, easing: 'cubic-bezier(.5,0,.9,.6)' },
        { transform: 'translate(' + spread * 2 + 'px,' + (D + 60 + Math.random() * 30) + 'px) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: T / .55, fill: 'forwards' });
    }
    setTimeout(function () {
      w.classList.remove('is-on');
      lbl.getAnimations().forEach(function (an) { an.cancel(); });
      lbl.classList.add('is-done'); lbl.innerHTML = 'Deleted ✓';
      lbl.animate([{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }], { duration: 350, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    }, T + 60);
    setTimeout(function () {
      out.innerHTML = ''; lbl.classList.remove('is-done'); lbl.innerHTML = label;
      lbl.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
      busy = false;
    }, 2600);
  });
});`,
  },
  {
    id: 'paper-plane-send', free: true, name: 'Paper Plane Send', industry: 'General', tags: ['Button', 'Form', 'Delight'], stage: '#e9f1ff',
    desc: 'The send button folds its label into a paper plane that loops away, then confirms with a tick.',
    html: `<button class="gp-send" type="button"><span class="gp-send__txt">Send message</span><svg class="gp-send__plane" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 11.5 22 3l-6.5 18-3.8-7.6L2 11.5Z" fill="#fff" stroke="#1d4fd8" stroke-width="1.2" stroke-linejoin="round"/><path d="m11.7 13.4 3.6-4.1" stroke="#2f6bff" stroke-width="1.4"/></svg><span class="gp-send__done">Sent ✓</span></button>`,
    css: `.gp-send{position:relative;width:210px;height:58px;border:0;border-radius:16px;background:#2f6bff;color:#fff;font:700 16px system-ui,sans-serif;cursor:pointer;overflow:visible;box-shadow:0 16px 30px -14px #2f6bff;transition:background .35s,transform .15s}
.gp-send:active{transform:scale(.97)}
.gp-send:focus-visible{outline:2px solid #2f6bff;outline-offset:4px}
.gp-send__txt,.gp-send__done{position:absolute;inset:0;display:grid;place-items:center;transition:opacity .25s,transform .35s}
.gp-send__done{opacity:0;transform:translateY(8px)}
.gp-send__plane{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px;opacity:0;pointer-events:none;filter:drop-shadow(0 6px 8px rgba(29,79,216,.35))}
.gp-send.is-sending .gp-send__txt{opacity:0;transform:scale(.6)}
.gp-send.is-sent{background:#18a957;box-shadow:0 16px 30px -14px #18a957}
.gp-send.is-sent .gp-send__done{opacity:1;transform:none}
.gp-send.is-sent .gp-send__txt{opacity:0;transform:scale(.6)}`,
    js: `document.querySelectorAll('.gp-send').forEach(function (b) {
  var p = b.querySelector('.gp-send__plane'), busy = false;
  b.addEventListener('click', function () {
    if (busy) return; busy = true; b.classList.add('is-sending');
    p.animate([
      { opacity: 0, transform: 'scale(.2) rotate(0deg)' },
      { opacity: 1, transform: 'scale(1.1) rotate(-10deg)', offset: .18 },
      { opacity: 1, transform: 'translate(-40px,-30px) rotate(-60deg)', offset: .4 },
      { opacity: 1, transform: 'translate(10px,-70px) rotate(20deg)', offset: .62 },
      { opacity: 0, transform: 'translate(190px,-150px) rotate(35deg) scale(.6)' }
    ], { duration: 1300, easing: 'cubic-bezier(.4,0,.3,1)' });
    setTimeout(function () { b.classList.remove('is-sending'); b.classList.add('is-sent'); }, 1150);
    setTimeout(function () { b.classList.remove('is-sent'); busy = false; }, 3200);
  });
});`,
  },
  {
    id: 'gold-rate-calculator', name: 'Gold Price Calculator', industry: 'Gold & jewellery', tags: ['Calculator', 'Live rate', 'Numbers'], stage: '#14110b',
    desc: 'Pick the karat and weight and see the price with making charges and VAT, with a shimmering gold bar and a ticking rate.',
    html: `<div class="gg-gold">
<div class="gg-gold__top"><div class="gg-gold__bar" aria-hidden="true"><i></i><b>999.9</b></div>
<div><small>Rate per gram <em class="gg-gold__live">● live sample</em></small><strong class="gg-gold__rate">AED 0.00</strong><span class="gg-gold__chg">▲ 0.00</span></div></div>
<div class="gg-gold__k" role="radiogroup" aria-label="Karat"><button type="button" data-k="24" aria-pressed="false">24K</button><button type="button" data-k="22" aria-pressed="true">22K</button><button type="button" data-k="21" aria-pressed="false">21K</button><button type="button" data-k="18" aria-pressed="false">18K</button></div>
<label class="gg-gold__w">Weight <output>10 g</output><input type="range" min="1" max="100" value="10"></label>
<dl class="gg-gold__sum"><div><dt>Gold</dt><dd class="gg-g">0</dd></div><div><dt>Making (AED 18/g)</dt><dd class="gg-m">0</dd></div><div><dt>VAT 5% on making</dt><dd class="gg-v">0</dd></div><div class="gg-gold__tot"><dt>Total</dt><dd class="gg-t">0</dd></div></dl></div>`,
    css: `.gg-gold{width:330px;padding:20px;border-radius:20px;background:linear-gradient(160deg,#221c10,#151209);border:1px solid rgba(230,190,100,.18);color:#f3ead6;font-family:system-ui,sans-serif}
.gg-gold__top{display:flex;gap:16px;align-items:center}
.gg-gold__bar{position:relative;flex:none;width:74px;height:46px;border-radius:6px;background:linear-gradient(135deg,#8a6420,#f6d77a 40%,#c99a3b 60%,#f3d27a 80%,#9b7024);transform:perspective(200px) rotateX(28deg);overflow:hidden;display:grid;place-items:center;box-shadow:0 12px 20px -8px rgba(240,190,80,.45)}
.gg-gold__bar b{font:800 11px system-ui,sans-serif;color:rgba(80,55,10,.75);letter-spacing:.08em}
.gg-gold__bar i{position:absolute;top:-20%;bottom:-20%;width:30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);transform:skewX(-20deg);animation:gg-shine 2.8s ease-in-out infinite}
.gg-gold small{display:block;font-size:11px;color:#b9ab8a}.gg-gold__live{font-style:normal;color:#e0b75a;margin-left:4px}
.gg-gold__rate{display:block;font:800 24px system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#f6d77a}
.gg-gold__chg{font-size:12px;font-weight:700;color:#6fcf97}.gg-gold__chg.dn{color:#eb6b57}
.gg-gold__k{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:16px 0 12px}
.gg-gold__k button{padding:9px 0;border-radius:10px;border:1px solid rgba(230,190,100,.25);background:transparent;color:#e8dcc0;font:700 13px system-ui,sans-serif;cursor:pointer;transition:all .2s}
.gg-gold__k button[aria-pressed=true]{background:linear-gradient(#f6d77a,#c99a3b);color:#2a1d05;border-color:transparent}
.gg-gold__w{display:block;font-size:13px;color:#cfc2a3}.gg-gold__w output{float:right;font-weight:700;color:#fff}
.gg-gold__w input{width:100%;margin:8px 0 6px;accent-color:#e0b75a}
.gg-gold__sum{margin:8px 0 0;font-size:13px}.gg-gold__sum div{display:flex;justify-content:space-between;padding:5px 0;color:#bfb293}
.gg-gold__sum dd{margin:0;font-variant-numeric:tabular-nums;color:#f3ead6}
.gg-gold__tot{margin-top:4px;border-top:1px dashed rgba(230,190,100,.3);padding-top:9px!important}
.gg-gold__tot dt,.gg-gold__tot dd{font:800 17px system-ui,sans-serif;color:#f6d77a!important}
@keyframes gg-shine{0%{left:-40%}60%,100%{left:120%}}`,
    js: `document.querySelectorAll('.gg-gold').forEach(function (g) {
  // Sample rates (AED per gram) for the demo. Replace base24 with your live feed.
  var base24 = 318.5, k = 22, w = 10, MAKING = 18, shown = 0, prev = base24;
  var rateEl = g.querySelector('.gg-gold__rate'), chg = g.querySelector('.gg-gold__chg'), range = g.querySelector('input'), out = g.querySelector('output');
  var f = function (n) { return 'AED ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  function rate() { return base24 * k / 24; }
  function calc() {
    var r = rate(), gold = r * w, mk = MAKING * w, vat = mk * .05, tot = gold + mk + vat;
    rateEl.textContent = f(r); out.textContent = w + ' g';
    g.querySelector('.gg-g').textContent = f(gold); g.querySelector('.gg-m').textContent = f(mk); g.querySelector('.gg-v').textContent = f(vat);
    var from = shown, t0 = performance.now(), el = g.querySelector('.gg-t');
    (function step(t) { var p = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - p, 3); shown = from + (tot - from) * e; el.textContent = f(shown); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  g.querySelectorAll('[data-k]').forEach(function (b) {
    b.addEventListener('click', function () { g.querySelectorAll('[data-k]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); k = +b.dataset.k; calc(); });
  });
  range.addEventListener('input', function () { w = +range.value; calc(); });
  setInterval(function () {
    prev = base24; base24 = Math.max(300, base24 + (Math.random() - .48) * 0.9);
    var d = (base24 - prev) * k / 24; chg.textContent = (d >= 0 ? '▲ ' : '▼ ') + Math.abs(d).toFixed(2); chg.classList.toggle('dn', d < 0); calc();
  }, 2400);
  calc();
});`,
  },
  {
    id: 'skyline-day-night', free: true, name: 'Skyline Day/Night Toggle', industry: 'Real estate', tags: ['Toggle', 'SVG', 'Theme'], stage: '#dfe7ef',
    desc: 'A theme switch with a city skyline: the sun sets, the sky turns to night, stars come out and the windows light up one by one.',
    html: `<button class="gn-sky" type="button" role="switch" aria-checked="false" aria-label="Night mode"><svg viewBox="0 0 300 150" aria-hidden="true"><defs><linearGradient id="gn-sky" x1="0" y1="0" x2="0" y2="1"><stop class="gn-sky__s1" offset="0"/><stop class="gn-sky__s2" offset="1"/></linearGradient></defs>
<rect width="300" height="150" fill="url(#gn-sky)"/><g class="gn-sky__stars"></g><circle class="gn-sky__sun" cx="70" cy="44" r="16" fill="#ffd36b"/><circle class="gn-sky__moon" cx="230" cy="170" r="12" fill="#f4f1e6"/>
<g class="gn-sky__city"></g><rect y="138" width="300" height="12" class="gn-sky__sea"/></svg><span class="gn-sky__lbl">Day</span></button>`,
    css: `.gn-sky{position:relative;width:320px;padding:10px;border:0;border-radius:24px;background:#fff;box-shadow:0 22px 40px -24px rgba(20,30,50,.45);cursor:pointer;--s1:#7ec3ff;--s2:#dff2ff;--b:#5a6b80;--sea:#7aa6c9}
.gn-sky svg{display:block;width:100%;border-radius:16px}
.gn-sky__s1{stop-color:var(--s1);transition:stop-color 1.2s}.gn-sky__s2{stop-color:var(--s2);transition:stop-color 1.2s}
.gn-sky__sun,.gn-sky__moon{transition:transform 1.4s cubic-bezier(.5,0,.3,1)}
.gn-sky__stars circle{opacity:0;transition:opacity 1s}
.gn-sky__city rect.b{fill:var(--b);transition:fill 1.2s}.gn-sky__city rect.w{fill:#ffd98a;opacity:0;transition:opacity .4s}
.gn-sky__sea{fill:var(--sea);transition:fill 1.2s}
.gn-sky__lbl{position:absolute;left:22px;top:20px;padding:5px 10px;border-radius:99px;background:rgba(255,255,255,.75);font:700 11px system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#1d2633;transition:all .6s}
.gn-sky[aria-checked=true]{--s1:#0a1230;--s2:#3a2c5c;--b:#141a2c;--sea:#121a33;background:#121626}
.gn-sky[aria-checked=true] .gn-sky__sun{transform:translateY(120px)}
.gn-sky[aria-checked=true] .gn-sky__moon{transform:translateY(-140px)}
.gn-sky[aria-checked=true] .gn-sky__stars circle{opacity:.9}
.gn-sky[aria-checked=true] .gn-sky__city rect.w.on{opacity:1}
.gn-sky[aria-checked=true] .gn-sky__lbl{background:rgba(255,255,255,.12);color:#fff}
.gn-sky:focus-visible{outline:2px solid #5b7cff;outline-offset:4px}`,
    js: `document.querySelectorAll('.gn-sky').forEach(function (t) {
  var NS = 'http://www.w3.org/2000/svg', city = t.querySelector('.gn-sky__city'), stars = t.querySelector('.gn-sky__stars'), x = 6;
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  for (var i = 0; i < 40; i++) stars.appendChild(el('circle', { cx: Math.random() * 300, cy: Math.random() * 80, r: Math.random() * 1.2 + .3, fill: '#fff' }));
  stars.querySelectorAll('circle').forEach(function (s) { s.style.transitionDelay = (Math.random() * .9 + .5) + 's'; });
  // A row of towers, with one tall spire in the middle.
  while (x < 294) {
    var tall = x > 130 && x < 150, w = tall ? 16 : 14 + Math.random() * 18, h = tall ? 118 : 30 + Math.random() * 62;
    if (tall) city.appendChild(el('path', { d: 'M' + (x + w / 2) + ' ' + (138 - h - 18) + 'L' + (x + w) + ' ' + (138 - h) + 'H' + x + 'Z', style: 'fill:var(--b);transition:fill 1.2s' }));
    city.appendChild(el('rect', { x: x, y: 138 - h, width: w, height: h, class: 'b' }));
    for (var yy = 138 - h + 6; yy < 134; yy += 8) for (var xx = x + 3; xx < x + w - 4; xx += 6)
      if (Math.random() > .35) { var wnd = el('rect', { x: xx, y: yy, width: 3, height: 4, class: 'w' + (Math.random() > .25 ? ' on' : '') }); wnd.style.transitionDelay = (.6 + Math.random() * 1.6) + 's'; city.appendChild(wnd); }
    x += w + 2 + Math.random() * 3;
  }
  t.addEventListener('click', function () { var on = t.getAttribute('aria-checked') !== 'true'; t.setAttribute('aria-checked', on); t.querySelector('.gn-sky__lbl').textContent = on ? 'Night' : 'Day'; });
});`,
  },
  {
    id: 'floor-view-picker', name: 'Floor & View Picker', industry: 'Real estate', tags: ['Slider', 'Property', 'Photo', 'Pricing'], stage: '#0e1a24',
    desc: 'Drag up a real glass tower to choose a floor. The window view rises from the park to the city to the sea, and the price per square foot climbs with it.',
    html: `<div class="gv-pick"><div class="gv-pick__tower"><img src="https://grittech.io/demo/realestate/img/tower.webp" alt="Residential glass tower" draggable="false"><span class="gv-pick__band"><b>24</b></span></div>
<div class="gv-pick__main"><div class="gv-pick__view"><img src="https://grittech.io/demo/realestate/img/view-park.webp" alt="Park view"><img src="https://grittech.io/demo/realestate/img/view-city.webp" alt="City view"><img src="https://grittech.io/demo/realestate/img/view-sea.webp" alt="Sea and skyline view"><span class="gv-pick__tag">City view</span></div>
<div class="gv-pick__info"><div><small>Floor</small><b class="gv-f">24</b></div><div><small>Unit</small><b class="gv-u">2 BR</b></div><div><small>AED / sq ft</small><b class="gv-p">2,150</b></div></div>
<p class="gv-pick__hint">Drag the tower or the slider</p><input class="gv-pick__slider" type="range" min="1" max="80" value="24" aria-label="Floor"></div></div>`,
    css: `.gv-pick{display:flex;gap:16px;width:410px;padding:16px;border-radius:22px;background:#13222f;border:1px solid rgba(255,255,255,.07);color:#e7eef5;font-family:system-ui,sans-serif;box-shadow:0 30px 60px -30px #000}
.gv-pick__tower{position:relative;flex:none;width:96px;height:300px;border-radius:14px;overflow:hidden;background:#1a2b39;touch-action:none;cursor:ns-resize}
.gv-pick__tower img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;user-select:none;-webkit-user-drag:none}
.gv-pick__band{position:absolute;left:0;right:0;height:10px;background:rgba(83,211,163,.35);box-shadow:0 0 0 1px #53d3a3,0 0 18px rgba(83,211,163,.8);transition:bottom .12s}
.gv-pick__band b{position:absolute;right:4px;top:-22px;padding:2px 6px;border-radius:6px;background:#53d3a3;color:#08261b;font:800 11px system-ui}
.gv-pick__main{flex:1;min-width:0}
.gv-pick__view{position:relative;height:170px;border-radius:14px;overflow:hidden;background:#1a2b39}
.gv-pick__view img{position:absolute;left:0;top:-15%;width:100%;height:130%;object-fit:cover;opacity:0;transition:opacity .25s;will-change:transform,opacity}
.gv-pick__view::after{content:'';position:absolute;inset:0;border-radius:14px;box-shadow:inset 0 0 0 5px #0f1a24;background:linear-gradient(90deg,transparent calc(50% - 2px),#0f1a24 calc(50% - 2px) calc(50% + 2px),transparent calc(50% + 2px))}
.gv-pick__tag{position:absolute;left:12px;bottom:12px;z-index:1;padding:5px 10px;border-radius:99px;background:rgba(10,18,26,.7);backdrop-filter:blur(6px);font:700 11px system-ui;letter-spacing:.06em}
.gv-pick__info{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 6px}
.gv-pick__info small{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8aa0b3}
.gv-pick__info b{font-size:17px;font-variant-numeric:tabular-nums}
.gv-pick__hint{margin:2px 0 4px;font-size:11px;color:#6f8597}
.gv-pick__slider{width:100%;accent-color:#53d3a3}`,
    js: `document.querySelectorAll('.gv-pick').forEach(function (t) {
  var band = t.querySelector('.gv-pick__band'), views = t.querySelectorAll('.gv-pick__view img'), tag = t.querySelector('.gv-pick__tag'),
    inputs = t.querySelectorAll('input[type=range]'), PEAK = [1, 38, 80], NAMES = ['Park view', 'City view', 'Sea & skyline view'];
  function up(f) {
    f = Math.max(1, Math.min(80, Math.round(f)));
    inputs.forEach(function (i) { i.value = f; });
    var k = (f - 1) / 79;
    band.style.bottom = (6 + k * 82) + '%'; band.querySelector('b').textContent = f;
    // Cross-fade between the three photos; the camera rises with the floor.
    var best = 0;
    views.forEach(function (im, i) {
      var d = Math.abs(f - PEAK[i]), span = i === 1 ? 30 : 37, o = Math.max(0, 1 - d / span);
      im.style.opacity = o; im.style.transform = 'translateY(' + (k * 12 - 6) + '%) scale(' + (1.04 - k * .04) + ')';
      if (o > views[best].style.opacity) best = i;
    });
    tag.textContent = NAMES[best];
    t.querySelector('.gv-f').textContent = f;
    t.querySelector('.gv-u').textContent = f > 70 ? 'Penthouse' : f > 45 ? '3 BR' : f > 15 ? '2 BR' : '1 BR';
    t.querySelector('.gv-p').textContent = Math.round(1850 + f * 12.5 + (f > 60 ? (f - 60) * 18 : 0)).toLocaleString('en-US');
  }
  inputs.forEach(function (i) { i.addEventListener('input', function () { up(+i.value); }); });
  var tower = t.querySelector('.gv-pick__tower'), drag = false;
  function at(e) { var b = tower.getBoundingClientRect(), k = 1 - (e.clientY - b.top) / b.height; up(1 + ((k - .06) / .82) * 79); }
  tower.addEventListener('pointerdown', function (e) { e.preventDefault(); drag = true; tower.setPointerCapture(e.pointerId); at(e); });
  tower.addEventListener('pointermove', function (e) { if (drag) at(e); });
  tower.addEventListener('pointerup', function () { drag = false; });
  up(24);
});`,
  },
  {
    id: 'delivery-tracker', name: 'Live Delivery Tracker', industry: 'Delivery', tags: ['SVG path', 'Progress', 'Live'], stage: '#eef1f4',
    desc: 'A rider moves along the route on a mini map while the order steps tick through and the ETA counts down.',
    html: `<div class="gd-trk"><svg class="gd-trk__map" viewBox="0 0 320 150" aria-hidden="true">
<path d="M0 40h320M0 110h320M70 0v150M190 0v150M260 0v150" stroke="#e2e6eb" stroke-width="10"/>
<path class="gd-trk__route" d="M30 128C70 128 70 110 120 110S190 80 190 60 230 30 290 26" fill="none" stroke="#c9d1db" stroke-width="4" stroke-dasharray="2 7" stroke-linecap="round"/>
<path class="gd-trk__done" d="M30 128C70 128 70 110 120 110S190 80 190 60 230 30 290 26" fill="none" stroke="#ff5a36" stroke-width="4" stroke-linecap="round"/>
<circle cx="30" cy="128" r="7" fill="#1d2430"/><g transform="translate(290 26)"><circle r="11" fill="#ff5a36" opacity=".2"/><circle r="6" fill="#ff5a36"/></g>
<g class="gd-trk__rider"><circle r="12" fill="#fff" stroke="#ff5a36" stroke-width="2"/><path d="M-6 3h4l3-5h4M2 -2l3 5" stroke="#1d2430" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="-6" cy="4" r="2.4" fill="#1d2430"/><circle cx="6" cy="4" r="2.4" fill="#1d2430"/></g></svg>
<div class="gd-trk__eta"><small>Arriving in</small><b class="gd-trk__t">12:00</b></div>
<ol class="gd-trk__steps"><li>Order placed</li><li>Preparing</li><li>On the way</li><li>Delivered</li></ol><button class="gd-trk__again" type="button">Replay</button></div>`,
    css: `.gd-trk{position:relative;width:340px;padding:16px;border-radius:22px;background:#fff;box-shadow:0 22px 44px -26px rgba(20,30,45,.45);font-family:system-ui,sans-serif;color:#1d2430}
.gd-trk__map{display:block;width:100%;border-radius:14px;background:#f6f8fa}
.gd-trk__eta{position:absolute;left:26px;top:24px;padding:8px 12px;border-radius:12px;background:#1d2430;color:#fff}
.gd-trk__eta small{display:block;font-size:10px;color:#9aa4b2;letter-spacing:.08em}.gd-trk__eta b{font-size:18px;font-variant-numeric:tabular-nums}
.gd-trk__steps{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:14px 0 0;padding:0;list-style:none;counter-reset:s}
.gd-trk__steps li{position:relative;padding-top:16px;font-size:11px;font-weight:600;color:#9aa4b2;text-align:center;transition:color .3s}
.gd-trk__steps li::before{content:'';position:absolute;left:0;right:0;top:4px;height:4px;border-radius:4px;background:#e2e6eb;transition:background .4s}
.gd-trk__steps li.on{color:#1d2430}.gd-trk__steps li.on::before{background:#ff5a36}
.gd-trk__again{position:absolute;right:26px;top:128px;padding:6px 10px;border:0;border-radius:10px;background:rgba(29,36,48,.08);font:600 11px system-ui;color:#1d2430;cursor:pointer}`,
    js: `document.querySelectorAll('.gd-trk').forEach(function (d) {
  var path = d.querySelector('.gd-trk__done'), rider = d.querySelector('.gd-trk__rider'), L = path.getTotalLength(), steps = d.querySelectorAll('li'), tEl = d.querySelector('.gd-trk__t'), raf;
  path.style.strokeDasharray = L;
  function run() {
    cancelAnimationFrame(raf); var t0 = performance.now(), DUR = 9000;
    (function step(t) {
      var k = Math.min(1, (t - t0) / DUR), m = Math.max(0, (k - .22) / .78), pt = path.getPointAtLength(m * L);
      path.style.strokeDashoffset = L * (1 - m); rider.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
      var secs = Math.round(720 * (1 - k)); tEl.textContent = Math.floor(secs / 60) + ':' + ('0' + secs % 60).slice(-2);
      var s = k < .1 ? 0 : k < .22 ? 1 : k < 1 ? 2 : 3; steps.forEach(function (li, i) { li.classList.toggle('on', i <= s); });
      if (k === 1) tEl.textContent = 'Here!';
      if (k < 1) raf = requestAnimationFrame(step);
    })(t0);
  }
  d.querySelector('.gd-trk__again').addEventListener('click', run); run();
});`,
  },
  {
    id: 'desert-safari-picker', name: 'Desert Safari Picker', industry: 'Tourism', tags: ['Booking', 'SVG', 'Scene'], stage: '#f6e9d6',
    desc: 'Choose morning dunes, sunset BBQ or an overnight camp and the desert scene changes its sky, sun and stars to match.',
    html: `<div class="gs-saf"><svg class="gs-saf__scene" viewBox="0 0 340 140" aria-hidden="true"><defs><linearGradient id="gs-sky" x1="0" y1="0" x2="0" y2="1"><stop class="gs-saf__a" offset="0"/><stop class="gs-saf__b" offset="1"/></linearGradient></defs>
<rect width="340" height="140" fill="url(#gs-sky)"/><g class="gs-saf__stars" fill="#fff"></g><circle class="gs-saf__sun" r="15"/>
<path class="gs-saf__d1" d="M0 96C60 70 110 78 170 92S280 70 340 84V140H0z"/><path class="gs-saf__d2" d="M0 118C70 96 140 104 200 116S300 104 340 110V140H0z"/>
<g class="gs-saf__camp"><path d="M232 116l14-20 14 20z" fill="#5b3a26"/><circle cx="268" cy="116" r="3" fill="#ffb347"/></g></svg>
<div class="gs-saf__opts" role="radiogroup"></div>
<div class="gs-saf__ft"><div class="gs-saf__step"><button type="button" data-d="-1" aria-label="Fewer guests">−</button><span><b class="gs-saf__n">2</b> guests</span><button type="button" data-d="1" aria-label="More guests">+</button></div><b class="gs-saf__tot">AED 360</b></div></div>`,
    css: `.gs-saf{width:360px;padding:16px;border-radius:22px;background:#fffaf2;box-shadow:0 22px 44px -26px rgba(110,70,20,.5);font-family:system-ui,sans-serif;color:#3b2615;--a:#9fd3f2;--b:#f7e6c4;--sun:#ffe38a;--d1:#e3b375;--d2:#d29a56}
.gs-saf__scene{display:block;width:100%;border-radius:14px}
.gs-saf__a{stop-color:var(--a);transition:stop-color 1s}.gs-saf__b{stop-color:var(--b);transition:stop-color 1s}
.gs-saf__sun{fill:var(--sun);transition:transform 1.1s cubic-bezier(.5,0,.3,1),fill 1s}
.gs-saf__d1{fill:var(--d1);transition:fill 1s}.gs-saf__d2{fill:var(--d2);transition:fill 1s}
.gs-saf__stars circle,.gs-saf__camp{opacity:0;transition:opacity 1s}
.gs-saf[data-p="2"] .gs-saf__stars circle,.gs-saf[data-p="2"] .gs-saf__camp{opacity:1}
.gs-saf[data-p="1"]{--a:#f08a5d;--b:#ffd29a;--sun:#ff9b4a;--d1:#d98a4e;--d2:#b86b35}
.gs-saf[data-p="2"]{--a:#0d1330;--b:#3b2b55;--sun:#f4f1e6;--d1:#4a3550;--d2:#2f2238}
.gs-saf__opts{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0}
.gs-saf__opts button{padding:9px 6px;border-radius:12px;border:1px solid #ecd9bd;background:#fff;text-align:left;font:600 12px/1.25 system-ui,sans-serif;color:#3b2615;cursor:pointer;transition:all .2s}
.gs-saf__opts button small{display:block;font-weight:500;color:#8b6f55;margin-top:2px}
.gs-saf__opts button[aria-checked=true]{background:#3b2615;border-color:#3b2615;color:#fff}.gs-saf__opts button[aria-checked=true] small{color:#e3cdb3}
.gs-saf__ft{display:flex;justify-content:space-between;align-items:center}
.gs-saf__step{display:flex;align-items:center;gap:10px;font-size:13px}
.gs-saf__step button{width:30px;height:30px;border-radius:50%;border:1px solid #ecd9bd;background:#fff;font-size:16px;cursor:pointer;color:#3b2615}
.gs-saf__tot{font-size:19px;font-variant-numeric:tabular-nums}`,
    js: `document.querySelectorAll('.gs-saf').forEach(function (s) {
  var P = [['Morning dunes', '7–11 am', 180, 60, 50], ['Sunset BBQ', '3–9 pm', 260, 270, 70], ['Overnight camp', 'Stay under stars', 520, 260, 28]];
  var p = 0, n = 2, opts = s.querySelector('.gs-saf__opts'), sun = s.querySelector('.gs-saf__sun'), stars = s.querySelector('.gs-saf__stars');
  for (var i = 0; i < 34; i++) { var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', Math.random() * 340); c.setAttribute('cy', Math.random() * 70); c.setAttribute('r', Math.random() + .3); c.style.transitionDelay = Math.random() * .8 + 's'; stars.appendChild(c); }
  opts.innerHTML = P.map(function (o, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '">' + o[0] + '<small>' + o[1] + ' · AED ' + o[2] + '</small></button>'; }).join('');
  function up() {
    s.dataset.p = p; sun.style.transform = 'translate(' + P[p][3] + 'px,' + P[p][4] + 'px)';
    s.querySelector('.gs-saf__n').textContent = n; s.querySelector('.gs-saf__tot').textContent = 'AED ' + (P[p][2] * n).toLocaleString('en-US');
  }
  opts.querySelectorAll('button').forEach(function (b, i) { b.addEventListener('click', function () { p = i; opts.querySelectorAll('button').forEach(function (x, j) { x.setAttribute('aria-checked', j === i); }); up(); }); });
  s.querySelectorAll('[data-d]').forEach(function (b) { b.addEventListener('click', function () { n = Math.min(12, Math.max(1, n + +b.dataset.d)); up(); }); });
  up();
});`,
  },
  {
    id: 'ticket-tear', name: 'Tear-off Event Ticket', industry: 'Events', tags: ['Drag', 'Ticket', 'Delight'], stage: '#15121c',
    desc: 'An event ticket whose stub you drag (or tap) to tear along the perforation. The stub falls away and the ticket stamps itself checked in.',
    html: `<div class="gt-tix"><div class="gt-tix__main"><small>Live at the Arena · Dubai</small><b>Desert Nights<br>Festival</b><div class="gt-tix__meta"><span>FRI 12 DEC</span><span>GATE 4</span><span>ROW F · 21</span></div><span class="gt-tix__stamp">Checked in</span></div>
<div class="gt-tix__stub" role="button" tabindex="0" aria-label="Tear off ticket stub"><span>ADMIT<br>ONE</span><i>drag ↓</i></div><button class="gt-tix__reset" type="button">New ticket</button></div>`,
    css: `.gt-tix{position:relative;display:flex;width:360px;height:160px;font-family:system-ui,sans-serif;filter:drop-shadow(0 22px 24px rgba(0,0,0,.45))}
.gt-tix__main,.gt-tix__stub{position:relative;background:linear-gradient(135deg,#ff6a3d,#e0367a);color:#fff}
.gt-tix__main{flex:1;padding:18px 20px;border-radius:16px 0 0 16px;mask:radial-gradient(circle 9px at 100% 0,#0000 98%,#000) top right/100% 51% no-repeat,radial-gradient(circle 9px at 100% 100%,#0000 98%,#000) bottom right/100% 51% no-repeat}
.gt-tix__main small{font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.85}
.gt-tix__main b{display:block;margin:6px 0 12px;font:800 22px/1.05 system-ui,sans-serif}
.gt-tix__meta{display:flex;gap:12px;font:700 10px system-ui;letter-spacing:.1em;opacity:.9}
.gt-tix__stub{flex:none;width:86px;border-radius:0 16px 16px 0;border-left:2px dashed rgba(255,255,255,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:grab;touch-action:none;transform-origin:0 0;user-select:none}
.gt-tix__stub span{font:800 15px/1.1 system-ui;text-align:center;letter-spacing:.1em}.gt-tix__stub i{font:600 10px system-ui;font-style:normal;opacity:.8}
.gt-tix__stub:focus-visible{outline:2px solid #fff;outline-offset:-6px}
.gt-tix__stamp{position:absolute;right:16px;bottom:16px;padding:5px 10px;border:2.5px solid #fff;border-radius:6px;font:800 13px system-ui;letter-spacing:.12em;text-transform:uppercase;transform:rotate(-12deg) scale(2);opacity:0;transition:all .35s cubic-bezier(.3,1.6,.5,1)}
.gt-tix.is-torn .gt-tix__stamp{opacity:1;transform:rotate(-12deg) scale(1)}
.gt-tix__reset{position:absolute;left:50%;bottom:-46px;transform:translateX(-50%);padding:7px 14px;border:1px solid rgba(255,255,255,.25);border-radius:99px;background:none;color:#fff;font:600 12px system-ui;cursor:pointer;opacity:0;transition:opacity .3s}
.gt-tix.is-torn .gt-tix__reset{opacity:1}`,
    js: `document.querySelectorAll('.gt-tix').forEach(function (t) {
  var stub = t.querySelector('.gt-tix__stub'), y0 = 0, dy = 0, drag = false, torn = false;
  function tear() {
    if (torn) return; torn = true;
    stub.animate([{ transform: stub.style.transform || 'rotate(0)' }, { transform: 'translate(30px,260px) rotate(38deg)', opacity: 0 }], { duration: 750, easing: 'cubic-bezier(.5,0,.8,.6)', fill: 'forwards' });
    t.querySelector('.gt-tix__main').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 200 });
    setTimeout(function () { t.classList.add('is-torn'); }, 250);
  }
  stub.addEventListener('pointerdown', function (e) { if (torn) return; drag = true; y0 = e.clientY; dy = 0; stub.setPointerCapture(e.pointerId); stub.style.cursor = 'grabbing'; });
  stub.addEventListener('pointermove', function (e) { if (!drag) return; dy = Math.max(0, e.clientY - y0); stub.style.transform = 'rotate(' + Math.min(24, dy / 3) + 'deg)'; if (dy > 70) { drag = false; tear(); } });
  stub.addEventListener('pointerup', function () { if (!drag) return; drag = false; stub.style.cursor = ''; if (dy < 6) tear(); else { stub.animate([{ transform: stub.style.transform }, { transform: 'rotate(0)' }], { duration: 400, easing: 'cubic-bezier(.3,1.6,.5,1)' }); stub.style.transform = ''; } });
  stub.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tear(); } });
  t.querySelector('.gt-tix__reset').addEventListener('click', function () { torn = false; t.classList.remove('is-torn'); stub.getAnimations().forEach(function (a) { a.cancel(); }); stub.style.transform = '';
    stub.animate([{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'none' }], { duration: 400 }); });
});`,
  },
  {
    id: 'approval-stamp', name: 'Approval Stamp Submit', industry: 'Business services', tags: ['Button', 'Form', 'Status'], stage: '#e9e6df',
    desc: 'Submit an application and a rubber stamp slams down with an ink “APPROVED” mark. Made for visa, PRO and document services.',
    html: `<div class="ga-doc"><div class="ga-doc__paper"><div class="ga-doc__hd"><b>Visa application</b><span>Ref · GT-2026-0418</span></div>
<ul><li><i></i>Passport copy</li><li><i></i>Emirates ID</li><li><i></i>Photo, white background</li><li><i></i>Tenancy contract</li></ul>
<div class="ga-doc__ink" aria-hidden="true">APPROVED<small>GRIT · DUBAI</small></div><div class="ga-doc__stamp" aria-hidden="true"><span></span></div></div>
<button class="ga-doc__btn" type="button">Submit application</button></div>`,
    css: `.ga-doc{width:320px;font-family:system-ui,sans-serif}
.ga-doc__paper{position:relative;padding:20px 20px 16px;border-radius:12px;background:#fffefb;box-shadow:0 1px 0 #e7e2d6,0 20px 40px -24px rgba(60,50,30,.45);color:#262420}
.ga-doc__hd{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:10px;border-bottom:1px solid #eee8db}
.ga-doc__hd b{font-size:16px}.ga-doc__hd span{font-size:11px;color:#8b8578}
.ga-doc ul{margin:10px 0 0;padding:0;list-style:none}.ga-doc li{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:13px;color:#4a463e}
.ga-doc li i{width:16px;height:16px;border-radius:5px;background:#1f9d6a;position:relative}.ga-doc li i::after{content:'';position:absolute;left:5px;top:2px;width:4px;height:8px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
.ga-doc__ink{position:absolute;right:18px;top:62px;padding:8px 14px;border:4px double #c8312b;border-radius:8px;color:#c8312b;font:900 22px/1 system-ui,sans-serif;letter-spacing:.12em;text-align:center;transform:rotate(-14deg);opacity:0;mix-blend-mode:multiply;-webkit-mask:repeating-radial-gradient(circle at 30% 40%,#000 0 2px,rgba(0,0,0,.75) 2px 3px);mask:repeating-radial-gradient(circle at 30% 40%,#000 0 2px,rgba(0,0,0,.75) 2px 3px)}
.ga-doc__ink small{display:block;margin-top:3px;font:700 8px system-ui;letter-spacing:.3em}
.ga-doc__stamp{position:absolute;right:40px;top:-120px;width:84px;height:110px;opacity:0;pointer-events:none}
.ga-doc__stamp::before{content:'';position:absolute;left:30px;top:0;width:24px;height:54px;border-radius:12px 12px 4px 4px;background:linear-gradient(90deg,#5a3d2a,#8d6447,#5a3d2a)}
.ga-doc__stamp span{position:absolute;left:0;bottom:0;width:84px;height:56px;border-radius:8px;background:linear-gradient(#3a3d44,#22242a);box-shadow:inset 0 -6px 0 #c8312b}
.ga-doc.is-done .ga-doc__ink{opacity:.9}
.ga-doc__btn{width:100%;margin-top:14px;padding:14px;border:0;border-radius:12px;background:#262420;color:#fff;font:700 15px system-ui,sans-serif;cursor:pointer;transition:background .3s}
.ga-doc.is-done .ga-doc__btn{background:#1f9d6a}`,
    js: `document.querySelectorAll('.ga-doc').forEach(function (d) {
  var st = d.querySelector('.ga-doc__stamp'), paper = d.querySelector('.ga-doc__paper'), btn = d.querySelector('.ga-doc__btn'), busy = false;
  btn.addEventListener('click', function () {
    if (busy) return; busy = true; btn.textContent = 'Reviewing…';
    st.animate([
      { opacity: 0, transform: 'translateY(-40px) rotate(-14deg) scale(1.3)' },
      { opacity: 1, transform: 'translateY(0) rotate(-14deg) scale(1.3)', offset: .35 },
      { opacity: 1, transform: 'translateY(178px) rotate(-14deg) scale(1)', offset: .62 },
      { opacity: 1, transform: 'translateY(170px) rotate(-14deg) scale(1)', offset: .72 },
      { opacity: 0, transform: 'translateY(-60px) rotate(-14deg) scale(1.2)' }
    ], { duration: 1500, easing: 'cubic-bezier(.5,0,.4,1)' });
    setTimeout(function () { d.classList.add('is-done'); btn.textContent = 'Approved ✓';
      paper.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(3px) scale(.995)' }, { transform: 'translateY(0)' }], { duration: 180 }); }, 930);
    setTimeout(function () { d.classList.remove('is-done'); btn.textContent = 'Submit application'; busy = false; }, 4200);
  });
});`,
  },
];
