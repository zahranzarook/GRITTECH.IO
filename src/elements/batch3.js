// GRIT UI library, batch 3: playful, modern elements for the industries that run the UAE —
// cars, gold, perfume, cafés, property, tourism, delivery, finance, events and business services.
// Same rules as batch 1: self-contained html + css + js, class names prefixed per element.
// Positions are measured with offsetTop/offsetLeft (not getBoundingClientRect) so they stay right
// when the preview frame scales the element down on small screens.
export const ELEMENTS3 = [
  {
    id: 'shredder-delete', name: 'Shredder Delete Button', industry: 'General', tags: ['Button', 'Delete', 'Delight'], stage: '#ecebe6',
    desc: 'Press delete and the word is fed through a paper shredder: it slides into the slot and falls out below in curling strips.',
    html: `<div class="gx-shred"><button class="gx-shred__btn" type="button" aria-label="Delete">
<span class="gx-shred__face"><span class="gx-shred__lbl">Delete</span></span><span class="gx-shred__led"></span><span class="gx-shred__slot"></span></button>
<div class="gx-shred__out" aria-hidden="true"></div><p class="gx-shred__msg" role="status"></p></div>`,
    css: `.gx-shred{position:relative;display:flex;flex-direction:column;align-items:center;width:260px;height:250px;font-family:system-ui,sans-serif}
.gx-shred__btn{position:relative;width:200px;height:78px;padding:0;border:0;border-radius:18px 18px 10px 10px;background:linear-gradient(#3a3d44,#22242a);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 18px 30px -14px rgba(0,0,0,.6);cursor:pointer}
.gx-shred__btn:focus-visible{outline:2px solid #e4573d;outline-offset:4px}
.gx-shred__face{position:absolute;inset:10px 14px 9px;overflow:hidden;display:grid;place-items:center}
.gx-shred__lbl{display:inline-block;padding:9px 20px;border-radius:3px;background:#f7f3ea;color:#c23a26;font:800 20px/1 system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 2px 0 rgba(0,0,0,.15);white-space:nowrap}
.gx-shred__led{position:absolute;right:12px;top:8px;width:7px;height:7px;border-radius:50%;background:#5c5f66;transition:background .2s,box-shadow .2s}
.gx-shred__slot{position:absolute;left:10px;right:10px;bottom:6px;height:5px;border-radius:3px;background:repeating-linear-gradient(90deg,#0b0c0e 0 6px,#2b2e34 6px 8px)}
.gx-shred.is-on .gx-shred__btn{animation:gx-shred-buzz .06s linear infinite}
.gx-shred.is-on .gx-shred__led{background:#ff4b2b;box-shadow:0 0 10px #ff4b2b}
.gx-shred__out{position:absolute;left:0;right:0;top:72px;height:180px;clip-path:inset(0 -40px -40px -40px);pointer-events:none}
.gx-shred__strip{position:absolute;margin:0}
.gx-shred__msg{position:absolute;bottom:0;margin:0;font:600 13px system-ui,sans-serif;color:#55575c;opacity:0;transition:opacity .3s}
.gx-shred__msg.on{opacity:1}
@keyframes gx-shred-buzz{50%{transform:translate(.6px,-.4px)}}`,
    js: `document.querySelectorAll('.gx-shred').forEach(function (w) {
  var btn = w.querySelector('.gx-shred__btn'), face = w.querySelector('.gx-shred__face'), lbl = w.querySelector('.gx-shred__lbl'),
    out = w.querySelector('.gx-shred__out'), msg = w.querySelector('.gx-shred__msg'), busy = false, N = 11;
  btn.addEventListener('click', function () {
    if (busy) return; busy = true; w.classList.add('is-on');
    // Where the label sits relative to the slot (out's top edge), measured unscaled.
    var lw = lbl.offsetWidth, lh = lbl.offsetHeight,
      left = btn.offsetLeft + face.offsetLeft + lbl.offsetLeft,
      startTop = btn.offsetTop + face.offsetTop + lbl.offsetTop - out.offsetTop,
      D = -startTop + lh + 6, T = 900;
    lbl.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + D + 'px)' }], { duration: T, easing: 'linear', fill: 'forwards' });
    for (var i = 0; i < N; i++) {
      var s = lbl.cloneNode(true), a = i / N * 100, b = 100 - (i + 1) / N * 100;
      s.classList.add('gx-shred__strip');
      s.style.cssText = 'left:' + left + 'px;top:' + startTop + 'px;width:' + lw + 'px;clip-path:inset(0 ' + b + '% 0 ' + a + '%)';
      out.appendChild(s);
      var spread = (i - (N - 1) / 2) * 4, rot = (Math.random() - .5) * 22, sag = Math.random() * 10;
      s.animate([
        { transform: 'translate(0,0)', opacity: 1, easing: 'linear' },
        { transform: 'translate(' + spread + 'px,' + (D + sag) + 'px) rotate(' + rot * .3 + 'deg)', opacity: 1, offset: .5714, easing: 'cubic-bezier(.5,0,.9,.6)' },
        { transform: 'translate(' + spread * 2 + 'px,' + (D + 70 + Math.random() * 40) + 'px) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: T * 1.75, fill: 'forwards' });
    }
    setTimeout(function () { w.classList.remove('is-on'); msg.textContent = 'Deleted. Nothing left to recover.'; msg.classList.add('on'); }, T + 80);
    setTimeout(function () {
      out.innerHTML = ''; msg.classList.remove('on');
      lbl.getAnimations().forEach(function (an) { an.cancel(); });
      lbl.animate([{ transform: 'translateY(-60px)' }, { transform: 'translateY(0)' }], { duration: 500, easing: 'cubic-bezier(.3,1.5,.5,1)' });
      busy = false;
    }, 3200);
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
.gp-send.is-sent .gp-send__done{opacity:1;transform:none}`,
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
    id: 'split-flap-board', name: 'Split-Flap Departures', industry: 'Travel', tags: ['Typography', 'Airport', 'Live data'], stage: '#101114',
    desc: 'An airport departures board whose letters clatter through the alphabet to the next destination, like the real flaps at the gate.',
    html: `<div class="gf-board"><div class="gf-board__head"><b>DEPARTURES</b><span>DXB · Terminal 3</span></div>
<div class="gf-board__cols"><span>TIME</span><span>FLIGHT</span><span>TO</span><span>GATE</span></div>
<div class="gf-board__rows"></div></div>`,
    css: `.gf-board{width:400px;padding:16px;border-radius:14px;background:#1b1c20;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 24px 40px -20px #000;font-family:ui-monospace,Menlo,monospace;color:#f2c94c}
.gf-board__head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;color:#fff}
.gf-board__head b{font-size:15px;letter-spacing:.2em}.gf-board__head span{font-size:11px;color:#8a8d94}
.gf-board__cols,.gf-row{display:grid;grid-template-columns:64px 74px 1fr 40px;gap:8px;align-items:center}
.gf-board__cols{font-size:10px;letter-spacing:.14em;color:#6f727a;margin-bottom:6px}
.gf-row{margin-top:7px}
.gf-cells{display:flex;gap:2px}
.gf-c{position:relative;width:17px;height:24px;display:grid;place-items:center;border-radius:3px;background:linear-gradient(#26272c 50%,#202125 50%);font-size:15px;font-weight:700;line-height:1;overflow:hidden}
.gf-c::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:#0c0d0f}
.gf-c.flip{animation:gf-flip .07s linear}
.gf-row .gf-st{grid-column:1/-1;font-size:10px;letter-spacing:.14em;color:#6fcf97;margin-top:-2px}
.gf-row .gf-st.late{color:#eb5757}
@keyframes gf-flip{50%{transform:scaleY(.15)}}`,
    js: `(function () {
  var A = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
  var DEST = ['LONDON', 'MUMBAI', 'RIYADH', 'CAIRO', 'ISTANBUL', 'TBILISI', 'MALE', 'NAIROBI', 'PARIS', 'BAKU', 'COLOMBO', 'MUSCAT'];
  var ST = ['BOARDING', 'ON TIME', 'GATE OPEN', 'FINAL CALL', 'DELAYED'];
  document.querySelectorAll('.gf-board').forEach(function (bd) {
    var rows = bd.querySelector('.gf-board__rows'), data = [['08:40', 'GT201', 'LONDON', 'B7'], ['09:15', 'GT455', 'MUMBAI', 'A2'], ['09:55', 'GT612', 'CAIRO', 'C4']];
    function cells(n) { var h = '<span class="gf-cells">'; for (var i = 0; i < n; i++) h += '<span class="gf-c"> </span>'; return h + '</span>'; }
    rows.innerHTML = data.map(function () { return '<div class="gf-row">' + cells(5) + cells(5) + cells(8) + cells(2) + '<span class="gf-st">ON TIME</span></div>'; }).join('');
    function set(group, text) {
      var cs = group.querySelectorAll('.gf-c'); text = (text + '        ').slice(0, cs.length).toUpperCase();
      cs.forEach(function (c, i) {
        var target = text[i], steps = 0;
        (function tick() {
          var cur = c.textContent; if (cur === target || steps > 40) { c.textContent = target; return; }
          var k = A.indexOf(cur); c.textContent = A[(k + 1) % A.length]; steps++;
          c.classList.remove('flip'); void c.offsetWidth; c.classList.add('flip');
          setTimeout(tick, 34 + i * 2);
        })();
      });
    }
    function paint(r, d) {
      var g = rows.children[r].querySelectorAll('.gf-cells');
      set(g[0], d[0]); set(g[1], d[1]); set(g[2], d[2]); set(g[3], d[3]);
      var st = rows.children[r].querySelector('.gf-st'), s = ST[Math.floor(Math.random() * ST.length)];
      st.textContent = s; st.classList.toggle('late', s === 'DELAYED' || s === 'FINAL CALL');
    }
    data.forEach(function (d, r) { setTimeout(function () { paint(r, d); }, r * 250); });
    var turn = 0;
    setInterval(function () {
      var r = turn % 3; turn++;
      var d = data[r], m = (parseInt(d[0].slice(3)) + 35) % 60, h = (parseInt(d[0]) + (m < 35 ? 1 : 0)) % 24;
      d[0] = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
      d[1] = 'GT' + (100 + Math.floor(Math.random() * 899));
      d[2] = DEST[Math.floor(Math.random() * DEST.length)];
      d[3] = 'ABC'[Math.floor(Math.random() * 3)] + (1 + Math.floor(Math.random() * 9));
      paint(r, d);
    }, 2600);
  });
})();`,
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
    id: 'car-paint-configurator', name: 'Car Paint Configurator', industry: 'Automotive', tags: ['Configurator', 'SVG', 'E-commerce'], stage: '#e7e8ea',
    desc: 'Pick a paint and it sweeps across the car body with a glossy reflection, the car rolls a little and the price updates.',
    html: `<div class="gc-car"><div class="gc-car__top"><div><small>2026 Coupe GT</small><b class="gc-car__name">Pearl White</b></div><strong class="gc-car__price">AED 189,000</strong></div>
<svg class="gc-car__svg" viewBox="0 0 330 130" aria-hidden="true"><defs>
<linearGradient id="gc-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
<clipPath id="gc-wipe"><rect class="gc-car__wipe" x="0" y="0" width="0" height="130"/></clipPath></defs>
<ellipse cx="165" cy="112" rx="150" ry="7" fill="rgba(0,0,0,.18)"/>
<g class="gc-car__body">
<path class="gc-car__paint" d="M22 92c-3-14 4-22 20-25l52-9c18-17 44-30 80-30 32 0 50 12 72 27l38 6c16 3 23 11 22 31z" fill="#f2f1ec"/>
<path class="gc-car__paint2" clip-path="url(#gc-wipe)" d="M22 92c-3-14 4-22 20-25l52-9c18-17 44-30 80-30 32 0 50 12 72 27l38 6c16 3 23 11 22 31z" fill="#f2f1ec"/>
<path d="M22 92c-3-14 4-22 20-25l52-9c18-17 44-30 80-30 32 0 50 12 72 27l38 6c16 3 23 11 22 31z" fill="url(#gc-gloss)"/>
<path d="M104 57c16-14 38-22 66-22 24 0 39 8 55 20z" fill="#1d2430" opacity=".88"/><path d="M168 35v22" stroke="#c9ccd2" stroke-width="3"/>
<path d="M286 72h14M30 74h12" stroke="#f6c453" stroke-width="4" stroke-linecap="round"/></g>
<g class="gc-car__wheel" style="transform-origin:84px 94px"><circle cx="84" cy="94" r="19" fill="#17191d"/><circle cx="84" cy="94" r="11" fill="#9aa0a8"/><path class="gc-car__spokes" d="M84 83v22M73 94h22M76 86l16 16M92 86l-16 16" stroke="#5d636b" stroke-width="2.5"/></g>
<g class="gc-car__wheel" style="transform-origin:258px 94px"><circle cx="258" cy="94" r="19" fill="#17191d"/><circle cx="258" cy="94" r="11" fill="#9aa0a8"/><path class="gc-car__spokes" d="M258 83v22M247 94h22M250 86l16 16M266 86l-16 16" stroke="#5d636b" stroke-width="2.5"/></g></svg>
<div class="gc-car__sw" role="radiogroup" aria-label="Paint"></div></div>`,
    css: `.gc-car{width:360px;padding:18px;border-radius:22px;background:#fff;box-shadow:0 24px 50px -28px rgba(20,25,35,.45);font-family:system-ui,sans-serif;color:#15181d}
.gc-car__top{display:flex;justify-content:space-between;align-items:flex-end}
.gc-car__top small{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7b818a}
.gc-car__name{display:block;font-size:18px;margin-top:2px}.gc-car__price{font-size:17px;font-variant-numeric:tabular-nums}
.gc-car__svg{display:block;width:100%;margin:6px 0 10px;overflow:visible}
.gc-car__body{transition:transform .6s cubic-bezier(.3,1.4,.5,1)}
.gc-car__sw{display:flex;gap:10px;justify-content:center}
.gc-car__sw button{position:relative;width:34px;height:34px;border-radius:50%;border:0;cursor:pointer;box-shadow:inset 0 -6px 10px rgba(0,0,0,.25),inset 0 4px 8px rgba(255,255,255,.4);transition:transform .2s}
.gc-car__sw button::after{content:'';position:absolute;inset:-5px;border-radius:50%;border:2px solid #15181d;opacity:0;transform:scale(.8);transition:all .25s}
.gc-car__sw button[aria-pressed=true]::after{opacity:1;transform:none}
.gc-car__sw button:hover{transform:translateY(-2px)}`,
    js: `document.querySelectorAll('.gc-car').forEach(function (c) {
  var P = [['Pearl White', '#f2f1ec', 0], ['Desert Sand', '#c9a878', 4500], ['Gulf Blue', '#1f4e8c', 4500], ['Racing Red', '#b3121f', 6800], ['Midnight Black', '#121317', 3200], ['Oasis Green', '#2f5d4a', 6800]];
  var base = 189000, sw = c.querySelector('.gc-car__sw'), p1 = c.querySelector('.gc-car__paint'), p2 = c.querySelector('.gc-car__paint2'),
    wipe = c.querySelector('.gc-car__wipe'), body = c.querySelector('.gc-car__body'), wheels = c.querySelectorAll('.gc-car__wheel'), price = c.querySelector('.gc-car__price'), cur = 0, anim;
  sw.innerHTML = P.map(function (p, i) { return '<button type="button" aria-label="' + p[0] + '" aria-pressed="' + (i === 0) + '" style="background:' + p[1] + '"></button>'; }).join('');
  sw.querySelectorAll('button').forEach(function (b, i) {
    b.addEventListener('click', function () {
      if (i === cur) return; cur = i;
      sw.querySelectorAll('button').forEach(function (x, j) { x.setAttribute('aria-pressed', j === i); });
      c.querySelector('.gc-car__name').textContent = P[i][0];
      price.textContent = 'AED ' + (base + P[i][2]).toLocaleString('en-US');
      p2.setAttribute('fill', P[i][1]);
      cancelAnimationFrame(anim); var t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / 700), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; wipe.setAttribute('width', 330 * e);
        if (k < 1) anim = requestAnimationFrame(step); else { p1.setAttribute('fill', P[i][1]); wipe.setAttribute('width', 0); } })(t0);
      body.style.transform = 'translateX(6px) rotate(-.6deg)'; setTimeout(function () { body.style.transform = ''; }, 260);
      wheels.forEach(function (w) { w.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(225deg)' }, { transform: 'rotate(180deg)' }], { duration: 700, easing: 'ease-out' }); });
    });
  });
});`,
  },
  {
    id: 'perfume-mist', name: 'Perfume Notes & Mist', industry: 'Perfume & oud', tags: ['Canvas', 'Particles', 'Product'], stage: '#1a1416',
    desc: 'A fragrance card with top, heart and base notes. Tap a note or the bottle and it sprays a soft mist in that note’s colour.',
    html: `<div class="gm-scent"><div class="gm-scent__stage"><canvas class="gm-scent__mist"></canvas>
<button class="gm-scent__bottle" type="button" aria-label="Spray"><span class="gm-scent__cap"></span><span class="gm-scent__neck"></span><span class="gm-scent__glass"><em>NOIR<br>OUD</em></span></button></div>
<div class="gm-scent__notes"><p><small>Top</small><button type="button" data-c="232,190,90">Saffron</button><button type="button" data-c="240,220,140">Bergamot</button></p>
<p><small>Heart</small><button type="button" data-c="226,110,140">Taif rose</button><button type="button" data-c="250,245,230">Jasmine</button></p>
<p><small>Base</small><button type="button" data-c="140,90,60">Oud</button><button type="button" data-c="210,140,60">Amber</button></p></div></div>`,
    css: `.gm-scent{display:flex;gap:18px;align-items:center;width:390px;padding:20px;border-radius:22px;background:radial-gradient(120% 90% at 20% 20%,#3a2a2e,#1c1517);color:#f4e9e2;font-family:system-ui,sans-serif;box-shadow:0 24px 50px -26px #000}
.gm-scent__stage{position:relative;flex:none;width:130px;height:210px}
.gm-scent__mist{position:absolute;left:-40px;top:-40px;width:230px;height:200px;pointer-events:none}
.gm-scent__bottle{position:absolute;left:28px;bottom:0;width:74px;height:150px;padding:0;border:0;background:none;cursor:pointer}
.gm-scent__cap{position:absolute;left:23px;top:0;width:28px;height:26px;border-radius:4px;background:linear-gradient(90deg,#6b4a2a,#d8a861,#7c5630)}
.gm-scent__neck{position:absolute;left:30px;top:24px;width:14px;height:12px;background:#c9b9a6}
.gm-scent__glass{position:absolute;left:0;right:0;top:34px;bottom:0;border-radius:14px 14px 18px 18px;background:linear-gradient(110deg,rgba(255,255,255,.28),rgba(255,255,255,.04) 40%,rgba(255,255,255,.14));border:1px solid rgba(255,255,255,.3);box-shadow:inset 0 -46px 0 rgba(140,80,40,.55);display:grid;place-items:center}
.gm-scent__glass em{font:700 11px/1.3 Georgia,serif;font-style:normal;letter-spacing:.2em;text-align:center;color:#f7e6cc}
.gm-scent__bottle:active .gm-scent__cap{transform:translateY(3px)}
.gm-scent__notes p{margin:0 0 12px}.gm-scent__notes small{display:block;margin-bottom:5px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#a99389}
.gm-scent__notes button{margin:0 5px 5px 0;padding:6px 11px;border-radius:99px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);color:#f4e9e2;font:600 12px system-ui,sans-serif;cursor:pointer;transition:all .2s}
.gm-scent__notes button.on,.gm-scent__notes button:hover{background:rgba(var(--c),.22);border-color:rgba(var(--c),.8)}`,
    js: `document.querySelectorAll('.gm-scent').forEach(function (s) {
  var cv = s.querySelector('canvas'), x = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), parts = [], raf = 0;
  cv.width = 230 * dpr; cv.height = 200 * dpr; x.scale(dpr, dpr);
  // nozzle position inside the canvas (bottle cap, right edge)
  var NX = 40 + 28 + 52, NY = 40 + 210 - 150 + 8;
  function spray(rgb) {
    for (var i = 0; i < 70; i++) parts.push({ x: NX, y: NY, vx: 1.2 + Math.random() * 2.6, vy: -1.4 + Math.random() * 1.6, r: 2 + Math.random() * 3, life: 1, c: rgb });
    if (!raf) raf = requestAnimationFrame(loop);
    var cap = s.querySelector('.gm-scent__cap'); cap.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(4px)' }, { transform: 'translateY(0)' }], { duration: 220 });
  }
  function loop() {
    x.clearRect(0, 0, 230, 200);
    parts = parts.filter(function (p) { return p.life > 0; });
    parts.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vx *= .965; p.vy = p.vy * .97 - .015; p.r += .45; p.life -= .012;
      var g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, 'rgba(' + p.c + ',' + (p.life * .22) + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
      x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
    });
    raf = parts.length ? requestAnimationFrame(loop) : 0;
  }
  s.querySelectorAll('[data-c]').forEach(function (b) {
    b.style.setProperty('--c', b.dataset.c);
    b.addEventListener('click', function () { s.querySelectorAll('[data-c]').forEach(function (o) { o.classList.toggle('on', o === b); }); spray(b.dataset.c); });
  });
  s.querySelector('.gm-scent__bottle').addEventListener('click', function () { spray('245,225,200'); });
  setTimeout(function () { spray('232,190,90'); }, 500);
});`,
  },
  {
    id: 'karak-pour', name: 'Karak Order Pour', industry: 'Café', tags: ['SVG', 'Order', 'Delight'], stage: '#f3e7d8',
    desc: 'Choose size and sugar, hit order and the tea pours into the cup with a rising wave and steam.',
    html: `<div class="gk-chai"><svg class="gk-chai__cup" viewBox="0 0 160 170" aria-hidden="true"><defs><clipPath id="gk-in"><path d="M30 46h100l-12 98a14 14 0 0 1-14 12H56a14 14 0 0 1-14-12z"/></clipPath></defs>
<path class="gk-chai__stream" d="M80 -6V150" stroke="#b9773e" stroke-width="7" stroke-linecap="round" stroke-dasharray="160 160" stroke-dashoffset="160"/>
<g clip-path="url(#gk-in)"><g class="gk-chai__tea" style="transform:translateY(120px)"><path class="gk-chai__wave" d="M-80 50q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0v130h-320z" fill="#c4874d"/><rect x="-80" y="70" width="400" height="120" fill="#b87a42"/></g></g>
<path d="M30 46h100l-12 98a14 14 0 0 1-14 12H56a14 14 0 0 1-14-12z" fill="none" stroke="#3a2a1d" stroke-width="5" stroke-linejoin="round"/>
<path d="M128 64c22-2 26 30 4 38" fill="none" stroke="#3a2a1d" stroke-width="5"/>
<g class="gk-chai__steam" fill="none" stroke="#8b6b52" stroke-width="3" stroke-linecap="round" opacity="0"><path d="M66 38c-8-10 8-14 0-26"/><path d="M84 38c-8-10 8-14 0-26"/><path d="M102 38c-8-10 8-14 0-26"/></g></svg>
<div class="gk-chai__ui"><b>Karak chai</b><div class="gk-chai__row" data-g="size"><button type="button" aria-pressed="false" data-v="0">S</button><button type="button" aria-pressed="true" data-v="1">M</button><button type="button" aria-pressed="false" data-v="2">L</button></div>
<div class="gk-chai__row" data-g="sugar"><button type="button" aria-pressed="false" data-v="0">No sugar</button><button type="button" aria-pressed="true" data-v="1">Regular</button><button type="button" aria-pressed="false" data-v="2">Extra</button></div>
<button class="gk-chai__go" type="button">Order · <span>AED 3</span></button></div></div>`,
    css: `.gk-chai{display:flex;gap:18px;align-items:center;width:370px;padding:18px;border-radius:22px;background:#fffaf3;box-shadow:0 22px 44px -26px rgba(80,45,15,.5);font-family:system-ui,sans-serif;color:#3a2a1d}
.gk-chai__cup{flex:none;width:130px;overflow:visible}
.gk-chai__tea{transition:transform 1.6s cubic-bezier(.3,.1,.3,1)}
.gk-chai__wave{animation:gk-wave 1.4s linear infinite}
.gk-chai__steam path{animation:gk-steam 2s ease-in-out infinite}.gk-chai__steam path:nth-child(2){animation-delay:.4s}.gk-chai__steam path:nth-child(3){animation-delay:.8s}
.gk-chai__ui b{display:block;font-size:17px;margin-bottom:10px}
.gk-chai__row{display:flex;gap:5px;margin-bottom:8px}
.gk-chai__row button{flex:1;padding:8px 6px;border-radius:10px;border:1px solid #e3d2bd;background:#fff;color:#5a4330;font:600 12px system-ui,sans-serif;cursor:pointer;transition:all .2s}
.gk-chai__row button[aria-pressed=true]{background:#3a2a1d;border-color:#3a2a1d;color:#fff}
.gk-chai__go{width:100%;margin-top:4px;padding:12px;border:0;border-radius:12px;background:#c4874d;color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer;transition:background .3s}
.gk-chai__go:disabled{background:#9a6634;cursor:default}.gk-chai__go.is-ready{background:#2f8f5b}
@keyframes gk-wave{to{transform:translateX(80px)}}
@keyframes gk-steam{0%{opacity:0;transform:translateY(6px)}40%{opacity:.8}100%{opacity:0;transform:translateY(-12px)}}`,
    js: `document.querySelectorAll('.gk-chai').forEach(function (c) {
  var size = 1, PRICE = [2, 3, 4], cup = c.querySelector('.gk-chai__cup'), tea = c.querySelector('.gk-chai__tea'), stream = c.querySelector('.gk-chai__stream'),
    steam = c.querySelector('.gk-chai__steam'), go = c.querySelector('.gk-chai__go');
  function sizeUp() { cup.style.transform = 'scale(' + [.84, .94, 1.04][size] + ')'; cup.style.transition = 'transform .4s cubic-bezier(.3,1.5,.5,1)'; go.querySelector('span').textContent = 'AED ' + PRICE[size]; }
  c.querySelectorAll('.gk-chai__row').forEach(function (row) {
    row.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { row.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); if (row.dataset.g === 'size') { size = +b.dataset.v; sizeUp(); } });
    });
  });
  go.addEventListener('click', function () {
    go.disabled = true; go.textContent = 'Pouring…';
    stream.animate([{ strokeDashoffset: 160 }, { strokeDashoffset: 0, offset: .2 }, { strokeDashoffset: 0, offset: .8 }, { strokeDashoffset: -160 }], { duration: 1900 });
    tea.style.transform = 'translateY(0)';
    setTimeout(function () { steam.style.opacity = 1; go.classList.add('is-ready'); go.textContent = 'Ready · enjoy'; }, 1800);
    setTimeout(function () { tea.style.transition = 'none'; tea.style.transform = 'translateY(120px)'; void tea.offsetWidth; tea.style.transition = ''; steam.style.opacity = 0;
      go.disabled = false; go.classList.remove('is-ready'); go.innerHTML = 'Order · <span>AED ' + PRICE[size] + '</span>'; }, 4600);
  });
  sizeUp();
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
    id: 'floor-view-picker', name: 'Floor & View Picker', industry: 'Real estate', tags: ['Slider', 'Property', 'Pricing'], stage: '#0e1a24',
    desc: 'Slide up the tower to choose a floor. The window view rises from street to sea and the price per square foot climbs with it.',
    html: `<div class="gv-tower"><div class="gv-tower__bld" aria-hidden="true"><div class="gv-tower__lvl"></div></div>
<div class="gv-tower__main"><div class="gv-tower__view" aria-hidden="true"><div class="gv-tower__scene"><i class="gv-sea"></i><i class="gv-city"></i><i class="gv-park"></i></div><span class="gv-tower__frame"></span></div>
<div class="gv-tower__info"><div><small>Floor</small><b class="gv-f">24</b></div><div><small>View</small><b class="gv-v">City</b></div><div><small>AED / sq ft</small><b class="gv-p">2,150</b></div></div>
<input class="gv-tower__range" type="range" min="1" max="80" value="24" aria-label="Floor"></div></div>`,
    css: `.gv-tower{display:flex;gap:16px;width:380px;padding:18px;border-radius:22px;background:#13222f;border:1px solid rgba(255,255,255,.06);color:#e7eef5;font-family:system-ui,sans-serif}
.gv-tower__bld{position:relative;flex:none;width:44px;height:230px;border-radius:8px 8px 2px 2px;background:repeating-linear-gradient(#22384a 0 2px,#1a2d3c 2px 5px);clip-path:polygon(30% 0,70% 0,100% 6%,100% 100%,0 100%,0 6%)}
.gv-tower__lvl{position:absolute;left:0;right:0;height:6px;background:#53d3a3;box-shadow:0 0 12px #53d3a3;transition:bottom .15s}
.gv-tower__main{flex:1}
.gv-tower__view{position:relative;height:130px;border-radius:14px;overflow:hidden;background:linear-gradient(#7fc3ec,#d8eefa)}
.gv-tower__scene{position:absolute;inset:0;transition:transform .2s}
.gv-tower__scene i{position:absolute;left:-10%;right:-10%}
.gv-sea{top:62%;height:60%;background:linear-gradient(#2a7fb0,#1d5f88)}
.gv-city{top:50%;height:22%;background:linear-gradient(90deg,#5b6f82 0 6%,transparent 6% 8%,#4d6275 8% 13%,transparent 13% 15%,#6b8093 15% 19%,transparent 19% 22%,#56697c 22% 30%,transparent 30% 33%,#4a5e70 33% 37%,transparent 37% 40%,#61768a 40% 47%,transparent 47% 50%,#506477 50% 58%,transparent 58% 61%,#5f7488 61% 66%,transparent 66% 69%,#4b5f72 69% 76%,transparent 76% 79%,#5a6e81 79% 86%,transparent 86% 88%,#52667a 88% 96%,transparent 96%);clip-path:polygon(0 30%,4% 0,8% 40%,15% 10%,22% 50%,30% 5%,40% 35%,50% 0,58% 45%,66% 15%,76% 40%,86% 8%,96% 30%,100% 20%,100% 100%,0 100%)}
.gv-park{top:68%;height:80%;background:linear-gradient(#5f9c63,#3d7542)}
.gv-tower__frame{position:absolute;inset:0;border:6px solid #0f1a24;border-radius:14px;background:linear-gradient(90deg,transparent 49%,#0f1a24 49% 51%,transparent 51%)}
.gv-tower__info{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 8px}
.gv-tower__info small{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8aa0b3}
.gv-tower__info b{font-size:16px;font-variant-numeric:tabular-nums}
.gv-tower__range{width:100%;accent-color:#53d3a3}`,
    js: `document.querySelectorAll('.gv-tower').forEach(function (t) {
  var r = t.querySelector('.gv-tower__range'), lvl = t.querySelector('.gv-tower__lvl'), scene = t.querySelector('.gv-tower__scene'),
    park = t.querySelector('.gv-park'), sea = t.querySelector('.gv-sea'), city = t.querySelector('.gv-city');
  function up() {
    var f = +r.value, k = (f - 1) / 79;
    lvl.style.bottom = (k * 94) + '%';
    // As you go up, the ground drops out of view and the sea and skyline open up.
    scene.style.transform = 'translateY(' + (k * 48) + 'px)';
    park.style.top = (68 + k * 40) + '%'; sea.style.top = (62 - k * 6) + '%'; city.style.transform = 'scaleY(' + (1 - k * .45) + ')'; city.style.transformOrigin = 'bottom';
    var v = f < 12 ? 'Park' : f < 40 ? 'City' : f < 62 ? 'City & sea' : 'Sea & skyline';
    t.querySelector('.gv-f').textContent = f; t.querySelector('.gv-v').textContent = v;
    t.querySelector('.gv-p').textContent = Math.round(1850 + f * 12.5 + (f > 60 ? (f - 60) * 18 : 0)).toLocaleString('en-US');
  }
  r.addEventListener('input', up); up();
});`,
  },
  {
    id: 'holo-pay-card', name: 'Holographic Tap-to-Pay', industry: 'Finance', tags: ['3D', 'Card', 'Payment', 'Pointer'], stage: '#0b0c10',
    desc: 'A bank card with a holographic sheen that follows the pointer. Tap to pay and it glides to the reader, ripples and confirms.',
    html: `<div class="gh-pay"><div class="gh-pay__card"><div class="gh-pay__holo"></div><span class="gh-pay__chip"></span><span class="gh-pay__nfc">)))</span><b class="gh-pay__num">•••• •••• •••• 4417</b><div class="gh-pay__ft"><span>Z. ZAROOK</span><span>09/29</span></div></div>
<div class="gh-pay__reader"><i></i><i></i><i></i><span class="gh-pay__ok">✓</span></div><button class="gh-pay__btn" type="button">Tap to pay AED 48.00</button></div>`,
    css: `.gh-pay{display:flex;flex-direction:column;align-items:center;gap:16px;width:330px;font-family:system-ui,sans-serif;perspective:900px}
.gh-pay__card{position:relative;width:290px;height:180px;border-radius:18px;padding:20px;box-sizing:border-box;background:linear-gradient(135deg,#1c1f2b,#2b2f45 55%,#14161f);color:#e9ecf6;overflow:hidden;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.3,1.2,.5,1);box-shadow:0 30px 50px -24px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.12)}
.gh-pay__holo{position:absolute;inset:-50%;background:conic-gradient(from var(--a,0deg) at var(--x,50%) var(--y,50%),#ff7ad9,#7af0ff,#b6ff7a,#ffe27a,#ff7ad9);mix-blend-mode:color-dodge;opacity:.28;filter:blur(18px)}
.gh-pay__chip{position:absolute;left:22px;top:56px;width:40px;height:30px;border-radius:6px;background:linear-gradient(135deg,#a37b2c,#f2d483,#b68a35)}
.gh-pay__nfc{position:absolute;left:72px;top:58px;font:700 18px system-ui;letter-spacing:-3px;color:rgba(255,255,255,.6)}
.gh-pay__num{position:absolute;left:22px;bottom:46px;font:600 17px ui-monospace,Menlo,monospace;letter-spacing:.08em}
.gh-pay__ft{position:absolute;left:22px;right:22px;bottom:18px;display:flex;justify-content:space-between;font:600 11px system-ui;letter-spacing:.12em;color:#aab0c6}
.gh-pay__reader{position:relative;width:70px;height:70px;border-radius:50%;background:#1a1c24;display:grid;place-items:center}
.gh-pay__reader i{position:absolute;inset:0;border-radius:50%;border:2px solid #4fd1a5;opacity:0}
.gh-pay.is-paying .gh-pay__reader i{animation:gh-ring 1s ease-out infinite}.gh-pay.is-paying .gh-pay__reader i:nth-child(2){animation-delay:.3s}.gh-pay.is-paying .gh-pay__reader i:nth-child(3){animation-delay:.6s}
.gh-pay__ok{font:800 26px system-ui;color:#4fd1a5;transform:scale(0);transition:transform .4s cubic-bezier(.3,1.8,.5,1)}
.gh-pay.is-paid .gh-pay__ok{transform:scale(1)}.gh-pay.is-paid .gh-pay__reader{background:rgba(79,209,165,.14)}
.gh-pay__btn{width:100%;padding:14px;border:0;border-radius:14px;background:#f1f3f9;color:#10121a;font:700 15px system-ui,sans-serif;cursor:pointer;transition:background .3s,color .3s}
.gh-pay.is-paid .gh-pay__btn{background:#4fd1a5}
@keyframes gh-ring{from{transform:scale(.6);opacity:.9}to{transform:scale(1.6);opacity:0}}`,
    js: `document.querySelectorAll('.gh-pay').forEach(function (p) {
  var card = p.querySelector('.gh-pay__card'), holo = p.querySelector('.gh-pay__holo'), btn = p.querySelector('.gh-pay__btn'), busy = false;
  card.addEventListener('pointermove', function (e) {
    if (busy) return;
    var b = card.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    card.style.transform = 'rotateY(' + (x - .5) * 22 + 'deg) rotateX(' + (.5 - y) * 18 + 'deg)';
    holo.style.setProperty('--x', x * 100 + '%'); holo.style.setProperty('--y', y * 100 + '%'); holo.style.setProperty('--a', x * 180 + 'deg'); holo.style.opacity = .5;
  });
  card.addEventListener('pointerleave', function () { if (!busy) card.style.transform = ''; holo.style.opacity = ''; });
  btn.addEventListener('click', function () {
    if (busy) return; busy = true; btn.textContent = 'Hold near reader…';
    card.style.transform = 'translateY(60px) rotateX(58deg) scale(.82)'; p.classList.add('is-paying');
    setTimeout(function () { p.classList.remove('is-paying'); p.classList.add('is-paid'); btn.textContent = 'Paid AED 48.00'; card.style.transform = ''; }, 1700);
    setTimeout(function () { p.classList.remove('is-paid'); btn.textContent = 'Tap to pay AED 48.00'; busy = false; }, 4200);
  });
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
