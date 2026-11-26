import { demobar } from '../../src/demo/demobar.js';
import { CATS, RESTAURANTS, PROMOS } from './data.js';

demobar({ name: 'bite. — food ordering app demo', start: 'app' });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const aed = n => `AED ${n.toFixed(n % 1 ? 2 : 0)}`;
const artOf = it => `<img src="/demo/restaurant/img/${it.id}.webp" alt="${it.name}" loading="lazy" decoding="async">`;
const cover = r => `<img class="cover" src="/demo/app-food/img/rest-${r.id}.webp" alt="${r.name}" loading="lazy" decoding="async">`;
const ICO = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/></svg>',
};

// ---------- Fit phone to the window ----------
function fit() {
  const p = $('#phone');
  if (innerWidth <= 900) { p.style.transform = ''; return; }
  p.style.transform = `scale(${Math.min(1, (innerHeight - 44 - 40) / 868)})`;
}
fit(); addEventListener('resize', fit);
setInterval(() => { const d = new Date(); $('#clock').textContent = `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`; }, 10000);

// ---------- Navigation stack ----------
const screens = $('#screens');
let stack = [];
function make(html, cls = '') { const s = document.createElement('section'); s.className = 'screen ' + cls; s.innerHTML = html; return s; }
function push(el, { dark = false } = {}) {
  el.classList.add('is-right'); el.dataset.dark = dark;
  screens.append(el); el.getBoundingClientRect();
  stack.at(-1)?.classList.add('is-under');
  el.classList.remove('is-right');
  stack.push(el); chrome();
}
function back() {
  if (stack.length < 2) return;
  const top = stack.pop(); top.classList.add('is-right');
  stack.at(-1).classList.remove('is-under');
  setTimeout(() => top.remove(), 520); chrome();
}
function root(el) {
  stack.forEach(s => { s.classList.add('is-fade'); setTimeout(() => s.remove(), 400); });
  el.classList.add('is-fade'); screens.append(el); el.getBoundingClientRect(); el.classList.remove('is-fade');
  stack = [el]; chrome();
}
function chrome() {
  const top = stack.at(-1), kind = top?.dataset.kind;
  $('.status').classList.toggle('is-dark', top?.dataset.dark === 'true');
  $('#tabbar').classList.toggle('is-hidden', ['rest', 'checkout', 'track'].includes(kind));
  paintBar();
}
document.addEventListener('click', e => { if (e.target.closest('[data-back]')) back(); });
let tt; function toast(m) { const t = $('#atoast'); t.textContent = m; t.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 1800); }

// ---------- Basket ----------
const basket = { rest: null, lines: [] };
const count = () => basket.lines.reduce((s, l) => s + l.qty, 0);
const subtotal = () => basket.lines.reduce((s, l) => s + l.qty * l.unit, 0);
function add(rest, item, qty = 1, opts = [], unit = item.price) {
  if (basket.rest && basket.rest.id !== rest.id) { basket.lines = []; toast(`New basket from ${rest.name}`); }
  basket.rest = rest;
  const key = item.id + '|' + opts.join(',');
  const l = basket.lines.find(x => x.key === key);
  l ? (l.qty += qty) : basket.lines.push({ key, item, qty, opts, unit });
  const bar = $('#basketbar'); bar.classList.remove('bump'); bar.getBoundingClientRect(); bar.classList.add('bump');
  paintBar(); refreshPlus();
}
function paintBar() {
  const n = count(), kind = stack.at(-1)?.dataset.kind, bar = $('#basketbar');
  bar.classList.toggle('is-on', n > 0 && ['home', 'rest', 'search'].includes(kind));
  bar.style.bottom = kind === 'rest' ? '24px' : '';
  bar.innerHTML = `<div><span>${n}</span>View basket</div><b>${aed(subtotal())}</b>`;
}
$('#basketbar').onclick = () => push(checkout());
function refreshPlus() { $$('[data-plus]').forEach(p => { const n = basket.lines.filter(l => l.item.id === p.dataset.plus).reduce((s, l) => s + l.qty, 0); p.classList.toggle('has', n > 0); p.textContent = n || '+'; }); }

// ---------- Screens ----------
let cat = 'all';
const favs = new Set(['green']);
function restCard(r) {
  const items = r.menu.flatMap(m => m[1]);
  return `<button class="rest press" data-rest="${r.id}">
    <div class="rest__art" style="background:${r.color}">
      ${cover(r)}
      <span class="rest__promo">${r.promo}</span>
      <span class="rest__fav ${favs.has(r.id) ? 'is-on' : ''}" data-fav="${r.id}" role="button" aria-label="Save">${ICO.heart}</span>
    </div>
    <h3>${r.name}</h3>
    <div class="meta"><span><b>★ ${r.rating}</b> (${r.reviews})</span><span>${r.cuisine}</span></div>
    <div class="meta"><span>🛵 ${r.time} min</span><span>${r.fee ? 'AED ' + r.fee + ' delivery' : '<b style="color:var(--ok)">Free delivery</b>'}</span></div>
  </button>`;
}
function home() {
  const s = make(`
    <div class="loc"><div><small>Deliver to</small><b>Marina Gate 2, Dubai</b></div><button class="icon-btn press" aria-label="Profile" data-go="profile">${ICO.search.replace('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>')}</button></div>
    <div class="h1 pad" style="margin-top:14px">What are you<br>craving today?</div>
    <button class="search press" data-go="search" style="width:calc(100% - 40px)">${ICO.search}<span>Search dishes or restaurants</span></button>
    <div class="cats" id="cats">${CATS.map(([k, n, e]) => `<button class="cat press ${k === cat ? 'is-on' : ''}" data-cat="${k}"><span>${e}</span>${n}</button>`).join('')}</div>
    <div class="h2 pad">Offers for you</div>
    <div class="promos">${PROMOS.map(([t, sub, c, rid]) => { const r = RESTAURANTS.find(x => x.id === rid); return `<button class="promo press" data-rest="${rid}" style="background:${c}"><b>${t}</b><small>${sub}</small>${artOf(r.menu[0][1][0])}</button>`; }).join('')}</div>
    <div class="h2 pad">Popular near you <small>See all</small></div>
    <div class="pad" id="rlist"></div>`);
  s.dataset.kind = 'home';
  const list = () => { $('#rlist', s).innerHTML = RESTAURANTS.filter(r => cat === 'all' || r.cat === cat).map(restCard).join('') || '<p class="sub">No restaurants in this category yet.</p>'; };
  list();
  $('#cats', s).addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; $$('.cat', s).forEach(c => c.classList.toggle('is-on', c === b)); list(); });
  return s;
}
function restaurant(r) {
  const s = make(`
    <div class="hero" style="background:${r.color}">
      ${cover(r)}
      <div class="hero__top"><button class="icon-btn press" data-back aria-label="Back">${ICO.back}</button><div class="row"><button class="icon-btn press" aria-label="Share">${ICO.share}</button><button class="icon-btn press rest__fav ${favs.has(r.id) ? 'is-on' : ''}" data-fav="${r.id}" aria-label="Save">${ICO.heart}</button></div></div>
    </div>
    <div class="info">
      <h2>${r.name}</h2>
      <div class="meta"><span><b>★ ${r.rating}</b> (${r.reviews} ratings)</span><span>${r.cuisine}</span></div>
      <div class="row" style="margin-top:12px;flex-wrap:wrap;gap:6px"><span class="pill">🛵 ${r.time} min</span><span class="pill">${r.fee ? 'AED ' + r.fee + ' delivery' : 'Free delivery'}</span><span class="pill" style="background:var(--acc-2);color:var(--acc)">🏷 ${r.promo}</span></div>
    </div>
    <div class="mtabs" id="mtabs">${r.menu.map(([t], i) => `<button class="${i ? '' : 'is-on'}" data-sec="${i}">${t}</button>`).join('')}</div>
    <div class="pad">${r.menu.map(([t, items], i) => `<div class="h2" id="sec${i}" data-secblock="${i}">${t}</div>${items.map(it => `
      <button class="item press" data-item="${it.id}">
        <div class="item__txt"><b>${it.name}</b><p>${it.desc}</p><span class="price">${aed(it.price)}</span>${it.pop ? '<span class="tag">Popular</span>' : ''}</div>
        <div class="item__art">${artOf(it)}<span class="plus" data-plus="${it.id}" data-quick="${it.id}" role="button" aria-label="Quick add">+</span></div>
      </button>`).join('')}`).join('')}</div>`);
  s.dataset.kind = 'rest';
  const items = r.menu.flatMap(m => m[1]);
  s.addEventListener('click', e => {
    const q = e.target.closest('[data-quick]'); if (q) { e.stopPropagation(); add(r, items.find(i => i.id === q.dataset.quick)); return; }
    const it = e.target.closest('[data-item]'); if (it) { openItem(r, items.find(i => i.id === it.dataset.item)); return; }
    const sec = e.target.closest('[data-sec]'); if (sec) { s.scrollTo({ top: $('#sec' + sec.dataset.sec, s).offsetTop - 60, behavior: 'smooth' }); }
  });
  s.addEventListener('scroll', () => {
    const blocks = $$('[data-secblock]', s); let cur = 0;
    blocks.forEach(b => { if (b.offsetTop - 80 <= s.scrollTop) cur = +b.dataset.secblock; });
    $$('#mtabs button', s).forEach(b => b.classList.toggle('is-on', +b.dataset.sec === cur));
  }, { passive: true });
  setTimeout(refreshPlus);
  return s;
}
function openItem(r, it) {
  const sizes = [['Regular', 0], ['Large', Math.round(it.price * .3)]];
  const extras = (it.addons || [['Extra sauce', 4], ['Make it spicy', 0], ['No onions', 0]]).slice(0, 3);
  let qty = 1, size = 0, ex = new Set();
  const sheet = $('#sheet');
  sheet.innerHTML = `<div class="sheet__panel"><div class="grab"></div>
    <div class="sheet__art">${artOf(it)}</div>
    <h2 class="h1" style="font-size:24px;margin-top:16px">${it.name}</h2><p class="sub">${it.desc}</p>
    <div class="opt"><h4>Size <small>Required</small></h4>${sizes.map(([n, p], i) => `<button class="choice ${i ? '' : 'is-on'}" data-size="${i}"><i></i><span>${n}</span><b>${p ? '+ ' + aed(p) : ''}</b></button>`).join('')}</div>
    <div class="opt"><h4>Extras <small>Optional</small></h4>${extras.map(([n, p], i) => `<button class="choice box" data-ex="${i}"><i></i><span>${n}</span><b>${p ? '+ ' + aed(p) : 'Free'}</b></button>`).join('')}</div>
    <div class="buy"><div class="qty"><button data-q="-1" aria-label="Less">−</button><output>1</output><button data-q="1" aria-label="More">+</button></div><button class="cta" data-addit></button></div>
  </div>`;
  const unit = () => it.price + sizes[size][1] + [...ex].reduce((s, i) => s + extras[i][1], 0);
  const paint = () => { $('output', sheet).textContent = qty; $('[data-addit]', sheet).textContent = `Add ${qty} · ${aed(unit() * qty)}`; };
  paint();
  sheet.classList.add('is-on');
  sheet.onclick = e => {
    if (e.target === sheet) return sheet.classList.remove('is-on');
    const sz = e.target.closest('[data-size]'), x = e.target.closest('[data-ex]'), q = e.target.closest('[data-q]');
    if (sz) { size = +sz.dataset.size; $$('[data-size]', sheet).forEach(b => b.classList.toggle('is-on', b === sz)); }
    if (x) { const i = +x.dataset.ex; ex.has(i) ? ex.delete(i) : ex.add(i); x.classList.toggle('is-on'); }
    if (q) qty = Math.max(1, qty + +q.dataset.q);
    if (e.target.closest('[data-addit]')) {
      const opts = [sizes[size][0], ...[...ex].map(i => extras[i][0])].filter(o => o !== 'Regular');
      add(r, it, qty, opts, unit()); sheet.classList.remove('is-on'); toast(`${it.name} added`); return;
    }
    paint();
  };
}
function checkout() {
  const r = basket.rest;
  let tip = 5, pay = 0, when = 0;
  const s = make(`<div class="topbar"><button class="icon-btn press" data-back aria-label="Back">${ICO.back}</button><h2>Checkout</h2></div>
    <div class="pad" id="co"></div>`);
  s.dataset.kind = 'checkout';
  function paint() {
    if (!basket.lines.length) { $('#co', s).innerHTML = `<div class="empty"><b>🧺</b>Your basket is empty.</div>`; return; }
    const sub = subtotal(), fee = r.fee, service = +(sub * .05).toFixed(2), total = sub + fee + service + tip;
    $('#co', s).innerHTML = `
      <div class="h2" style="margin-top:10px">${r.name}</div>
      <div class="card">${basket.lines.map((l, i) => `<div class="line">${artOf(l.item)}<div><b>${l.item.name}</b><small>${l.opts.join(', ') || 'Regular'} · ${aed(l.unit)}</small></div>
        <div class="qty"><button data-l="${i}" data-d="-1" aria-label="Less">−</button><output>${l.qty}</output><button data-l="${i}" data-d="1" aria-label="More">+</button></div></div>`).join('')}</div>
      <div class="h2">Deliver to</div>
      <div class="card addr"><span class="addr__map"></span><div><b>Marina Gate 2, Apt 1805</b><br><small class="sub">Dubai Marina · Leave at door</small></div></div>
      <div class="h2">When</div>
      <div class="chips">${['Now · ' + r.time + ' min', 'Schedule'].map((t, i) => `<button class="chip ${i === when ? 'is-on' : ''}" data-when="${i}">${t}</button>`).join('')}</div>
      <div class="h2">Tip your rider</div>
      <div class="chips">${[0, 3, 5, 10].map(t => `<button class="chip ${t === tip ? 'is-on' : ''}" data-tip="${t}">${t ? 'AED ' + t : 'None'}</button>`).join('')}</div>
      <div class="h2">Pay with</div>
      <div class="pay">${['Apple Pay', 'Visa •••• 4417', 'Cash on delivery'].map((p, i) => `<button class="choice ${i === pay ? 'is-on' : ''}" data-pay="${i}"><i></i><span>${p}</span></button>`).join('')}</div>
      <div class="card" style="margin-top:18px">
        <div class="sum"><span>Subtotal</span><span>${aed(sub)}</span></div>
        <div class="sum"><span>Delivery</span><span>${fee ? aed(fee) : 'Free'}</span></div>
        <div class="sum"><span>Service fee</span><span>${aed(service)}</span></div>
        <div class="sum"><span>Tip</span><span>${aed(tip)}</span></div>
        <div class="sum total"><span>Total</span><span>${aed(total)}</span></div>
      </div>
      <div class="foot"><button class="cta" data-place>Place order · ${aed(total)}</button></div>`;
  }
  paint();
  s.addEventListener('click', e => {
    const l = e.target.closest('[data-l]'), t = e.target.closest('[data-tip]'), p = e.target.closest('[data-pay]'), w = e.target.closest('[data-when]');
    if (l) { const line = basket.lines[+l.dataset.l]; line.qty += +l.dataset.d; if (!line.qty) basket.lines.splice(+l.dataset.l, 1); if (!basket.lines.length) basket.rest = basket.rest; refreshPlus(); }
    if (t) tip = +t.dataset.tip;
    if (p) pay = +p.dataset.pay;
    if (w) when = +w.dataset.when;
    if (e.target.closest('[data-place]')) {
      const order = { no: 2000 + Math.floor(Math.random() * 7000), rest: r, items: count(), total: e.target.closest('[data-place]').textContent.split('· ')[1] };
      orders.unshift(order); basket.lines = []; basket.rest = null;
      push(track(order), { dark: false }); return;
    }
    if (l || t || p || w) paint();
  });
  return s;
}
const orders = [];
function track(o) {
  const route = [[60, 300], [60, 220], [150, 220], [150, 130], [250, 130], [250, 70], [320, 70]];
  const d = 'M' + route.map(p => p.join(' ')).join(' L');
  const s = make(`
    <div class="map"><svg viewBox="0 0 390 380" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="g" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#dcd7ce" stroke-width="1"/></pattern></defs>
      <rect width="390" height="380" fill="url(#g)"/>
      <rect x="170" y="150" width="60" height="50" rx="8" fill="#d6ead0"/><rect x="40" y="40" width="90" height="70" rx="10" fill="#d6ead0"/><path d="M0 330 Q 200 290 390 340 V380 H0Z" fill="#cfe3ee"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="var(--ink)" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="60" cy="300" r="10" fill="${o.rest.color}"/><circle cx="320" cy="70" r="12" fill="var(--acc)"/><circle cx="320" cy="70" r="22" fill="none" stroke="var(--acc)" stroke-opacity=".3" stroke-width="6"/>
    </svg><div class="rider" id="rider">🛵</div>
      <div class="hero__top" style="top:60px"><button class="icon-btn press" data-home aria-label="Close">${ICO.back}</button></div></div>
    <div class="card eta">
      <div class="sub">Order #${o.no} · ${o.rest.name}</div>
      <div class="eta__big" id="eta">Preparing</div>
      <div class="bar"><i id="bar"></i></div>
      <ol class="steps">${['Order confirmed', 'Restaurant is preparing', 'Rider picked up your order', 'Arriving now', 'Delivered. Enjoy!'].map((t, i) => `<li data-st="${i}">${t}</li>`).join('')}</ol>
      <div class="courier"><img class="avatar" src="/demo/app-food/img/avatar-rider.webp" alt="Ahmed K."><div style="flex:1"><b>Ahmed K.</b><br><small class="sub">★ 4.9 · Honda PCX · D 41270</small></div><button class="icon-btn press" aria-label="Call">📞</button></div>
    </div>`);
  s.dataset.kind = 'track';
  const rider = $('#rider', s), map = $('.map', s);
  const place = k => {
    const seg = Math.min(route.length - 2, Math.floor(k * (route.length - 1))), f = k * (route.length - 1) - seg;
    const [x1, y1] = route[seg], [x2, y2] = route[seg + 1];
    // the SVG uses "slice": same scale both ways, centred
    const cw = map.clientWidth, ch = map.clientHeight, k2 = Math.max(cw / 390, ch / 380);
    rider.style.left = (cw - 390 * k2) / 2 + (x1 + (x2 - x1) * f) * k2 + 'px';
    rider.style.top = (ch - 380 * k2) / 2 + (y1 + (y2 - y1) * f) * k2 + 'px';
  };
  let t = 0; place(0);
  const total = 16;
  const timer = setInterval(() => {
    if (!s.isConnected) return clearInterval(timer);
    t++;
    const k = Math.min(1, t / total), st = k >= 1 ? 4 : k > .75 ? 3 : k > .3 ? 2 : k > .1 ? 1 : 0;
    $$('[data-st]', s).forEach(li => li.classList.toggle('is-on', +li.dataset.st <= st));
    $('#bar', s).style.width = k * 100 + '%';
    $('#eta', s).textContent = k >= 1 ? 'Delivered' : st < 2 ? 'Preparing your food' : `Arriving in ${Math.max(1, Math.round((1 - k) * 12))} min`;
    if (st >= 2) place((k - .3) / .7);
    if (k >= 1) { clearInterval(timer); toast('Delivered. Enjoy your meal!'); }
  }, 900);
  $$('[data-st]', s)[0].classList.add('is-on');
  s.addEventListener('click', e => { if (e.target.closest('[data-home]')) { setTab('orders'); } });
  return s;
}
function search() {
  const all = RESTAURANTS.flatMap(r => r.menu.flatMap(m => m[1].map(it => ({ r, it }))));
  const uniq = [...new Map(all.map(x => [x.r.id + x.it.id, x])).values()];
  const s = make(`<div class="pad"><div class="h1">Search</div></div>
    <label class="search">${ICO.search}<input id="q" placeholder="Try pizza, sushi, hummus…" autocomplete="off"></label>
    <div class="pad" id="res"></div>`);
  s.dataset.kind = 'search';
  const paint = q => {
    const hits = q ? uniq.filter(({ r, it }) => (it.name + r.name + r.cuisine).toLowerCase().includes(q)) : uniq.filter(x => x.it.pop);
    $('#res', s).innerHTML = `<div class="h2">${q ? hits.length + ' results' : 'Trending in Dubai Marina'}</div>` + hits.map(({ r, it }) => `
      <button class="item press" data-r="${r.id}" data-i="${it.id}"><div class="item__txt"><b>${it.name}</b><p>${r.name} · ${r.time} min</p><span class="price">${aed(it.price)}</span></div><div class="item__art">${artOf(it)}</div></button>`).join('');
  };
  paint('');
  $('#q', s).addEventListener('input', e => paint(e.target.value.trim().toLowerCase()));
  s.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) { const r = RESTAURANTS.find(x => x.id === b.dataset.r); push(restaurant(r), { dark: true }); setTimeout(() => openItem(r, r.menu.flatMap(m => m[1]).find(i => i.id === b.dataset.i)), 450); } });
  setTimeout(() => $('#q', s)?.focus({ preventScroll: true }), 500);
  return s;
}
function ordersScreen() {
  const past = [...orders, { no: 1874, rest: RESTAURANTS[2], items: 2, total: 'AED 101', done: true }, { no: 1650, rest: RESTAURANTS[3], items: 1, total: 'AED 48', done: true }];
  const s = make(`<div class="pad"><div class="h1">Orders</div>${past.map((o, i) => `
    <div class="card" style="margin-top:14px"><div class="row"><div class="item__art" style="width:62px;height:62px;border-radius:16px">${artOf(o.rest.menu[0][1][0])}</div>
      <div style="flex:1"><b>${o.rest.name}</b><br><small class="sub">#${o.no} · ${o.items} item${o.items > 1 ? 's' : ''} · ${o.total}</small></div>
      <span class="pill" style="${o.done ? '' : 'background:var(--acc-2);color:var(--acc)'}">${o.done ? 'Delivered' : 'Live'}</span></div>
      <button class="cta ${o.done ? 'cta--dark' : ''}" style="height:46px;margin-top:12px;width:100%" data-o="${i}">${o.done ? 'Reorder' : 'Track order'}</button></div>`).join('')}</div>`);
  s.dataset.kind = 'orders';
  s.addEventListener('click', e => { const b = e.target.closest('[data-o]'); if (!b) return; const o = past[+b.dataset.o]; o.done ? push(restaurant(o.rest), { dark: true }) : push(track(o)); });
  return s;
}
function profile() {
  const s = make(`<div class="pad"><div class="row" style="margin-top:10px;gap:14px"><img class="avatar" style="width:64px;height:64px" src="/demo/app-food/img/avatar-user.webp" alt="Sara M."><div><div class="h1" style="font-size:24px;margin:0">Sara M.</div><span class="sub">+971 50 000 0000</span></div></div>
    <div class="card" style="margin-top:20px;background:var(--ink);color:#fff"><div class="row" style="justify-content:space-between"><div><small style="opacity:.7">bite. credits</small><div style="font-size:28px;font-weight:800">AED 42.50</div></div><span class="pill" style="background:var(--acc);color:#fff">Gold member</span></div></div>
    <div class="card" style="margin-top:14px">${['Saved addresses', 'Payment methods', 'Favourites', 'Offers & vouchers', 'Help centre', 'Language · English / عربي'].map(x => `<div class="line" style="justify-content:space-between"><span>${x}</span><span class="sub">›</span></div>`).join('')}</div></div>`);
  s.dataset.kind = 'profile';
  return s;
}

// ---------- Tabs & global clicks ----------
const TABS = { home, search, orders: ordersScreen, profile };
function setTab(t) { $$('#tabbar [data-tab]').forEach(b => b.classList.toggle('is-on', b.dataset.tab === t)); root(TABS[t]()); }
$('#tabbar').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
document.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) { e.stopPropagation(); const id = fav.dataset.fav; favs.has(id) ? favs.delete(id) : favs.add(id); $$(`[data-fav="${id}"]`).forEach(f => f.classList.toggle('is-on', favs.has(id))); toast(favs.has(id) ? 'Saved to favourites' : 'Removed from favourites'); return; }
  const r = e.target.closest('[data-rest]'); if (r) { push(restaurant(RESTAURANTS.find(x => x.id === r.dataset.rest)), { dark: true }); return; }
  const go = e.target.closest('[data-go]'); if (go) setTab(go.dataset.go);
}, true);

// Splash, then home
const splash = document.createElement('div');
splash.className = 'splash'; splash.innerHTML = '<b>bite<span>.</span></b>';
$('#app').append(splash);
root(home());
setTimeout(() => { splash.classList.add('is-out'); setTimeout(() => splash.remove(), 700); }, 1100);
