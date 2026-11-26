// Lumi Nail Lounge — page logic (try-on picker, services, looks, shop, bag, booking).
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const aed = n => `AED ${n.toLocaleString('en-AE')}`;
const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromKey = k => new Date(k + 'T00:00:00');

// ---------------- data ----------------
const SHADES = [
  { c: 'Pinks', name: 'Bubblegum Kiss', hex: '#ff6fb5' },
  { c: 'Pinks', name: 'Rose Quartz', hex: '#f4a6c1' },
  { c: 'Pinks', name: 'Hot Flamingo', hex: '#ff2d8a' },
  { c: 'Pinks', name: 'Raspberry', hex: '#c2185b' },
  { c: 'Berries', name: 'Velvet Berry', hex: '#8e1b4f' },
  { c: 'Berries', name: 'Cherry Cola', hex: '#6e0f2a' },
  { c: 'Berries', name: 'Classic Red', hex: '#c8102e' },
  { c: 'Berries', name: 'Coral Pop', hex: '#ff6b5e' },
  { c: 'Lilacs', name: 'Lilac Cloud', hex: '#c7a8ff' },
  { c: 'Lilacs', name: 'Violet Dream', hex: '#8b5cf6' },
  { c: 'Lilacs', name: 'Orchid', hex: '#d946ef' },
  { c: 'Lilacs', name: 'Midnight Plum', hex: '#3b1450' },
  { c: 'Nudes', name: 'Ballet Nude', hex: '#f1c7bd' },
  { c: 'Nudes', name: 'Latte', hex: '#c9937a' },
  { c: 'Nudes', name: 'Milk Bath', hex: '#f6efeb' },
  { c: 'Nudes', name: 'Champagne', hex: '#e7c98f' },
];
const COLLECTIONS = ['All', ...new Set(SHADES.map(s => s.c))];
const FINISHES = [
  { id: 'gloss', name: 'Gloss', svc: 'Gel manicure', price: 160, min: 50, lasts: '3 weeks' },
  { id: 'jelly', name: 'Jelly', svc: 'Jelly gel manicure', price: 170, min: 55, lasts: '3 weeks' },
  { id: 'matte', name: 'Matte', svc: 'Matte gel manicure', price: 175, min: 55, lasts: '3 weeks' },
  { id: 'chrome', name: 'Chrome', svc: 'Chrome gel manicure', price: 210, min: 65, lasts: '3 weeks' },
  { id: 'glitter', name: 'Glitter', svc: 'Glitter gel manicure', price: 195, min: 60, lasts: '3 weeks' },
  { id: 'french', name: 'French', svc: 'French gel manicure', price: 190, min: 60, lasts: '3 weeks' },
];
const SHAPES = [
  { id: 'almond', name: 'Almond', ext: 0 },
  { id: 'oval', name: 'Oval', ext: 0 },
  { id: 'square', name: 'Square', ext: 0 },
  { id: 'coffin', name: 'Coffin', ext: 120 },
  { id: 'stiletto', name: 'Stiletto', ext: 120 },
];
const SERVICES = {
  hands: [
    { id: 'classic', icon: '💅', name: 'Classic manicure', text: 'Shape, cuticle care, hand massage and regular polish.', price: 90, min: 35 },
    { id: 'gel', icon: '✨', name: 'Gel manicure', text: 'Chip-free shine for three weeks, any shade from our wall.', price: 160, min: 50, tag: 'Most booked' },
    { id: 'biab', icon: '💎', name: 'BIAB builder gel', text: 'Strengthens natural nails and grows them long, zero lifting.', price: 230, min: 75 },
    { id: 'acrylic', icon: '🌸', name: 'Acrylic extensions', text: 'Full set in your favourite shape and length.', price: 280, min: 90 },
    { id: 'chrome', icon: '🪩', name: 'Chrome & glazed', text: 'The glazed-donut finish everyone asks about.', price: 210, min: 65, tag: 'Trending' },
    { id: 'removal', icon: '🫧', name: 'Gentle removal', text: 'Soak-off of gel or acrylic with nourishing care.', price: 50, min: 20 },
  ],
  feet: [
    { id: 'spa-pedi', icon: '🦶', name: 'Spa pedicure', text: 'Warm soak, scrub, callus care, mask and massage.', price: 150, min: 50, tag: 'Relaxing' },
    { id: 'gel-pedi', icon: '✨', name: 'Gel pedicure', text: 'Our spa pedicure finished with long-wear gel.', price: 190, min: 60 },
    { id: 'express-pedi', icon: '⚡', name: 'Express pedicure', text: 'Tidy, shape and polish when you are short on time.', price: 95, min: 30 },
  ],
  extras: [
    { id: 'art', icon: '🎨', name: 'Nail art', text: 'Hand-painted details, gems, foils or charms.', price: 60, min: 20, from: true },
    { id: 'paraffin', icon: '🕯️', name: 'Paraffin wax', text: 'Deep hydration wrap for hands or feet.', price: 45, min: 15 },
    { id: 'massage', icon: '🌿', name: 'Extended massage', text: '15 extra minutes of hand and arm massage.', price: 55, min: 15 },
  ],
};
const LOOKS = [
  { name: 'Glazed Donut', hex: '#f6efeb', finish: 'chrome', shape: 'almond', a: '#f7e9ff', b: '#d9b8ff', tag: 'Viral' },
  { name: 'Velvet Berry', hex: '#8e1b4f', finish: 'matte', shape: 'square', a: '#ffb2d6', b: '#8e1b4f' },
  { name: 'Lilac Jelly', hex: '#c7a8ff', finish: 'jelly', shape: 'oval', a: '#efe2ff', b: '#a77bff' },
  { name: 'Bridal French', hex: '#ffffff', finish: 'french', shape: 'almond', a: '#ffe8f2', b: '#f2b8cf', tag: 'Bridal' },
  { name: 'Pink Sparkle', hex: '#ff2d8a', finish: 'glitter', shape: 'coffin', a: '#ffc3df', b: '#ff2d8a' },
  { name: 'Cherry Chrome', hex: '#6e0f2a', finish: 'chrome', shape: 'stiletto', a: '#ff8fb1', b: '#4a0a1d' },
];
const PRODUCTS = [
  { id: 'p-rasp', name: 'Gel polish — Raspberry', sub: '12 ml · UV/LED', price: 55, hex: '#c2185b', tryon: true, badge: 'Bestseller' },
  { id: 'p-lilac', name: 'Gel polish — Lilac Cloud', sub: '12 ml · UV/LED', price: 55, hex: '#c7a8ff', tryon: true },
  { id: 'p-berry', name: 'Gel polish — Velvet Berry', sub: '12 ml · UV/LED', price: 55, hex: '#8e1b4f', tryon: true },
  { id: 'p-nude', name: 'Gel polish — Ballet Nude', sub: '12 ml · UV/LED', price: 55, hex: '#f1c7bd', tryon: true, badge: 'New' },
  { id: 'p-top', name: 'Diamond top coat', sub: 'High shine · 12 ml', price: 50, hex: '#f4effa', clear: true },
  { id: 'p-oil', name: 'Rose cuticle oil', sub: 'Pen · 5 ml', price: 45, hex: '#ffb3cf', pen: true },
  { id: 'p-kit', name: 'At-home gel kit', sub: 'Lamp + 3 shades', price: 249, hex: '#8b5cf6', kit: true, badge: 'Gift' },
  { id: 'p-press', name: 'Press-on set — Glazed', sub: '24 nails · reusable', price: 89, hex: '#f6efeb', press: true },
];
const ARTISTS = [
  { id: 'any', name: 'First available', role: 'Fastest slot', ini: '✦', g: 'linear-gradient(135deg,#c7a8ff,#ff9fd0)' },
  { id: 'maya', name: 'Maya', role: 'Shape & BIAB', ini: 'M', rating: '4.9', g: 'linear-gradient(135deg,#8b5cf6,#d946ef)' },
  { id: 'sofia', name: 'Sofia', role: 'Nail art', ini: 'S', rating: '5.0', g: 'linear-gradient(135deg,#d946ef,#ff4fa3)' },
  { id: 'noor', name: 'Noor', role: 'Chrome & French', ini: 'N', rating: '4.9', g: 'linear-gradient(135deg,#ff4fa3,#ff9f7a)' },
];

// ---------------- toast ----------------
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600); }

// ---------------- try-on state ----------------
const look = { shade: SHADES[3], finish: FINISHES[0], shape: SHAPES[0] };
let stage = null;

function bottleSVG(p) {
  const id = 'g' + Math.random().toString(36).slice(2, 7);
  if (p.pen) return `<svg viewBox="0 0 60 120"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect x="22" y="8" width="16" height="22" rx="4" fill="#e9c27a"/><rect x="20" y="30" width="20" height="80" rx="9" fill="${p.hex}"/><rect x="20" y="30" width="20" height="80" rx="9" fill="url(#${id})"/><text x="30" y="78" font-family="serif" font-style="italic" font-size="9" fill="#fff" text-anchor="middle" transform="rotate(-90 30 78)">lumi.</text></svg>`;
  if (p.kit) return `<svg viewBox="0 0 120 100"><rect x="6" y="40" width="108" height="52" rx="16" fill="#fff"/><path d="M14 60a46 30 0 0 1 92 0z" fill="url(#k${id})"/><defs><linearGradient id="k${id}" x1="0" x2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#ff4fa3"/></linearGradient></defs><rect x="30" y="8" width="14" height="30" rx="5" fill="#c2185b"/><rect x="53" y="4" width="14" height="34" rx="5" fill="#c7a8ff"/><rect x="76" y="8" width="14" height="30" rx="5" fill="#f1c7bd"/><text x="60" y="84" font-family="serif" font-style="italic" font-size="14" fill="#2b0f3f" text-anchor="middle">lumi.</text></svg>`;
  if (p.press) return `<svg viewBox="0 0 120 100"><rect x="6" y="10" width="108" height="80" rx="18" fill="#fff"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${16 + i * 19}" y="${26 + (i % 2) * 6}" width="14" height="30" rx="7" fill="${p.hex}" stroke="#e7d6f7"/><ellipse cx="${20 + i * 19}" cy="${33 + (i % 2) * 6}" rx="2.5" ry="5" fill="#fff" opacity=".9"/>`).join('')}<text x="60" y="80" font-family="serif" font-style="italic" font-size="13" fill="#2b0f3f" text-anchor="middle">glazed</text></svg>`;
  const liquid = p.clear ? 'rgba(255,255,255,.55)' : p.hex;
  return `<svg viewBox="0 0 80 130"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".25" stop-color="#fff" stop-opacity=".1"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient></defs>
    <rect x="29" y="4" width="22" height="46" rx="6" fill="#2b0f3f"/><rect x="32" y="8" width="4" height="38" rx="2" fill="#fff" opacity=".25"/>
    <rect x="27" y="48" width="26" height="5" rx="2.5" fill="#e9c27a"/>
    <path d="M14 66c0-8 8-13 26-13s26 5 26 13v46c0 9-6 14-26 14s-26-5-26-14z" fill="rgba(255,255,255,.55)" stroke="rgba(255,255,255,.9)" stroke-width="2"/>
    <path d="M17 72c0-6 7-10 23-10s23 4 23 10v39c0 7-5 11-23 11s-23-4-23-11z" fill="${liquid}"/>
    <path d="M14 66c0-8 8-13 26-13s26 5 26 13v46c0 9-6 14-26 14s-26-5-26-14z" fill="url(#${id})"/>
    <text x="40" y="100" font-family="Georgia,serif" font-style="italic" font-size="13" fill="${p.clear ? '#2b0f3f' : '#fff'}" text-anchor="middle" opacity=".9">lumi.</text></svg>`;
}

function renderPicker() {
  const col = $('#collections');
  col.innerHTML = COLLECTIONS.map((c, i) => `<button type="button" class="${i === 0 ? 'is-active' : ''}" data-col="${c}">${c}</button>`).join('');
  col.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', col).forEach(x => x.classList.toggle('is-active', x === b));
    $$('.swatch').forEach(s => { s.hidden = b.dataset.col !== 'All' && s.dataset.col !== b.dataset.col; });
  });
  $('#swatches').innerHTML = SHADES.map(s => `<button type="button" class="swatch" role="option" style="--c:${s.hex}" data-hex="${s.hex}" data-col="${s.c}" aria-label="${s.name}" title="${s.name}"></button>`).join('');
  $('#swatches').addEventListener('click', e => { const b = e.target.closest('.swatch'); if (b) setLook({ shade: SHADES.find(s => s.hex === b.dataset.hex) }); });
  $('#finishes').innerHTML = FINISHES.map(f => `<button type="button" class="chip" data-id="${f.id}">${f.name}</button>`).join('');
  $('#finishes').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setLook({ finish: FINISHES.find(f => f.id === b.dataset.id) }); });
  $('#shapes').innerHTML = SHAPES.map(f => `<button type="button" class="chip" data-id="${f.id}">${f.name}</button>`).join('');
  $('#shapes').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setLook({ shape: SHAPES.find(f => f.id === b.dataset.id) }); });
}

function lookPrice() { return look.finish.price + look.shape.ext; }
function lookName() { return `${look.shade.name} · ${look.finish.name} · ${look.shape.name}`; }

function setLook(next, { scroll = false } = {}) {
  const prev = { ...look };
  Object.assign(look, next);
  $$('.swatch').forEach(s => s.classList.toggle('is-active', s.dataset.hex === look.shade.hex));
  $$('#finishes .chip').forEach(c => c.classList.toggle('is-active', c.dataset.id === look.finish.id));
  $$('#shapes .chip').forEach(c => c.classList.toggle('is-active', c.dataset.id === look.shape.id));
  $('#shadeName').textContent = look.shade.name;
  $('#lookTitle').textContent = look.finish.svc + (look.shape.ext ? ' + extensions' : '');
  $('#lookMeta').textContent = `${look.finish.min + (look.shape.ext ? 30 : 0)} min · lasts ${look.finish.lasts}`;
  $('#lookPrice').textContent = aed(lookPrice());
  $$('.look__nails').forEach(n => { n.style.setProperty('--n', look.shade.hex); n.dataset.shape = look.shape.id; n.dataset.finish = look.finish.id; });
  $('#sumLookText').textContent = `Look: ${lookName()}`;
  if (stage) {
    if (prev.finish.id !== look.finish.id) stage.setFinish(look.finish.id);
    if (prev.shape.id !== look.shape.id) stage.setShape(look.shape.id);
    if (prev.shade.hex !== look.shade.hex) stage.setShade(look.shade.hex);
  }
  if (scroll) $('#tryon').scrollIntoView({ behavior: 'smooth' });
}

// ---------------- 3D stage ----------------
async function bootStage() {
  const canvas = $('#handCanvas');
  const test = document.createElement('canvas');
  if (!(test.getContext('webgl2') || test.getContext('webgl'))) return stageFallback();
  try {
    const { createHandStage } = await import('./hand.js');
    stage = await createHandStage(canvas, { url: '/demo/nail-salon/hand.glb', framesUrl: '/demo/nail-salon/hand-frames.json' });
    stage.setShape(look.shape.id); stage.setFinish(look.finish.id); stage.setShade(look.shade.hex);
    $('#stageLoading').classList.add('is-done');
    const hide = () => $('#stageHint').classList.add('is-gone');
    canvas.addEventListener('pointerdown', hide, { once: true });
    setTimeout(hide, 7000);
  } catch (err) {
    console.error(err); stageFallback();
  }
}
function stageFallback() {
  $('#stageLoading').classList.add('is-done'); $('#stageHint').remove();
  $('#handCanvas').insertAdjacentHTML('afterend', '<div class="stage__fallback"><div><div class="look__nails" style="transform:scale(3);margin-bottom:40px"><i></i><i></i><i></i><i></i><i></i></div>Your look updates here as you pick.</div></div>');
  setLook({});
}
// Only start WebGL once the hero is (nearly) on screen.
new IntersectionObserver((en, ob) => { if (en[0].isIntersecting) { ob.disconnect(); bootStage(); } }, { rootMargin: '200px' }).observe($('#handCanvas'));

// ---------------- services ----------------
function renderServices(tab = 'hands') {
  $('#serviceGrid').innerHTML = SERVICES[tab].map((s, i) => `
    <article class="svc glass" style="animation-delay:${i * 60}ms">
      ${s.tag ? `<span class="svc__tag">${s.tag}</span>` : ''}
      <div class="svc__icon" aria-hidden="true">${s.icon}</div>
      <h3>${s.name}</h3><p>${s.text}</p>
      <div class="svc__foot"><div class="svc__price">${s.from ? '<small style="margin:0 6px 0 0">from</small>' : ''}${aed(s.price)}<small>${s.min} min</small></div>
      <button class="btn btn--ghost btn--sm" type="button" data-book="${s.id}">Book</button></div>
    </article>`).join('');
}
$('#serviceTabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return;
  $$('.tab').forEach(t => t.classList.toggle('is-active', t === b)); renderServices(b.dataset.tab);
});
$('#serviceGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-book]'); if (!b) return;
  booking.services = new Set([b.dataset.book]); goStep(1); renderBooking();
  $('#book').scrollIntoView({ behavior: 'smooth' });
});

// ---------------- looks ----------------
$('#lookGrid').innerHTML = LOOKS.map((l, i) => `
  <button type="button" class="lookcard reveal" data-i="${i}" data-finish="${l.finish}" style="--a:${l.a};--b:${l.b};--n:${l.hex}">
    <div class="lookcard__bg"></div>
    <div class="lookcard__nails"><i></i><i></i><i></i><i></i></div>
    ${l.tag ? `<em>${l.tag}</em>` : ''}
    <b>${l.name}</b><span>${FINISHES.find(f => f.id === l.finish).name} · ${SHAPES.find(s => s.id === l.shape).name} — Try it on →</span>
  </button>`).join('');
$('#lookGrid').addEventListener('click', e => {
  const b = e.target.closest('.lookcard'); if (!b) return;
  const l = LOOKS[b.dataset.i];
  const shade = SHADES.find(s => s.hex === l.hex) || { name: l.name, hex: l.hex };
  setLook({ shade, finish: FINISHES.find(f => f.id === l.finish), shape: SHAPES.find(s => s.id === l.shape) }, { scroll: true });
  toast(`Trying on ${l.name} ✦`);
});

// ---------------- shop + bag ----------------
$('#shopGrid').innerHTML = PRODUCTS.map(p => `
  <article class="product glass reveal">
    <div class="product__img">${p.badge ? `<span class="product__badge">${p.badge}</span>` : ''}${bottleSVG(p)}</div>
    <h3>${p.name}</h3><p>${p.sub}</p>
    <div class="product__row"><span class="product__price">${aed(p.price)}</span>
      <div class="product__actions">
        ${p.tryon ? `<button class="btn btn--ghost" type="button" data-try="${p.hex}">Try on</button>` : ''}
        <button class="btn btn--glossy" type="button" data-add="${p.id}">Add</button>
      </div></div>
  </article>`).join('');

const bag = new Map();
function renderBag() {
  const list = $('#bagList');
  let total = 0, count = 0;
  list.innerHTML = bag.size ? [...bag].map(([id, q]) => {
    const p = PRODUCTS.find(x => x.id === id); total += p.price * q; count += q;
    return `<li><div class="bag__img">${bottleSVG(p)}</div><div><b>${p.name}</b><small>${aed(p.price)}</small></div>
      <div class="qty"><button type="button" data-q="${id}" data-d="-1" aria-label="Less">−</button><span>${q}</span><button type="button" data-q="${id}" data-d="1" aria-label="More">+</button></div></li>`;
  }).join('') : '<li class="bag__empty">Your bag is empty — the shine is waiting ✦</li>';
  $('#bagTotal').textContent = aed(total);
  const c = $('#bagCount'); c.textContent = count; c.classList.toggle('has', count > 0);
}
$('#shopGrid').addEventListener('click', e => {
  const t = e.target.closest('[data-try]');
  if (t) { const s = SHADES.find(x => x.hex === t.dataset.try); setLook({ shade: s }, { scroll: true }); toast(`Trying on ${s.name} ✦`); return; }
  const a = e.target.closest('[data-add]'); if (!a) return;
  bag.set(a.dataset.add, (bag.get(a.dataset.add) || 0) + 1); renderBag();
  const c = $('#bagCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  toast('Added to your bag');
});
$('#bagList').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const q = (bag.get(b.dataset.q) || 0) + +b.dataset.d;
  q > 0 ? bag.set(b.dataset.q, q) : bag.delete(b.dataset.q); renderBag();
});
const drawer = $('#bag');
const openBag = open => { drawer.classList.toggle('is-open', open); drawer.setAttribute('aria-hidden', !open); };
$('#bagBtn').addEventListener('click', () => openBag(true));
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]')) openBag(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') openBag(false); });
$('#checkout').addEventListener('click', () => toast(bag.size ? 'Demo store — checkout connects when this theme goes live.' : 'Add something pretty first ✦'));

// ---------------- booking ----------------
const ALL_SERVICES = Object.values(SERVICES).flat();
const booking = { step: 1, services: new Set(['gel']), artist: null, date: null, time: null, withLook: true };

function bookingItems() {
  const items = [...booking.services].map(id => ALL_SERVICES.find(s => s.id === id));
  // the try-on look replaces a plain gel manicure with the exact finish + shape picked
  if (booking.withLook && booking.services.has('gel')) {
    const i = items.findIndex(s => s.id === 'gel');
    items[i] = { id: 'gel', name: look.finish.svc, price: look.finish.price, min: look.finish.min };
    if (look.shape.ext) items.push({ id: 'ext', name: `${look.shape.name} extensions`, price: look.shape.ext, min: 30 });
  }
  return items;
}

function renderBooking() {
  const opt = s => `
    <button type="button" class="opt ${booking.services.has(s.id) ? 'is-active' : ''}" data-svc="${s.id}">
      <span class="opt__check">✓</span><span><b>${s.name}</b><small>${s.min} min${s.id === 'gel' ? ' · uses your try-on look' : ''}</small></span>
      <span class="opt__price">${s.from ? 'from ' : ''}${aed(s.price)}</span>
    </button>`;
  $('#bookServices').innerHTML = Object.entries(SERVICES).map(([k, list]) => `<p class="optlist__head">${k}</p>${list.map(opt).join('')}`).join('');
  $('#bookArtists').innerHTML = ARTISTS.map(a => `
    <button type="button" class="artist ${booking.artist === a.id ? 'is-active' : ''}" data-artist="${a.id}">
      <span class="artist__av" style="--g:${a.g}">${a.ini}</span><b>${a.name}</b><small>${a.role}</small>${a.rating ? `<span>★ ${a.rating}</span>` : ''}
    </button>`).join('');

  const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  $('#bookDates').innerHTML = days.map(d => {
    const key = dayKey(d);
    return `<button type="button" class="date ${booking.date === key ? 'is-active' : ''}" data-date="${key}"><small>${d.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('en-GB', { month: 'short' })}</small></button>`;
  }).join('');
  const slots = []; for (let h = 10; h < 22; h++) for (const m of [0, 30]) slots.push(`${String(h).padStart(2, '0')}:${m ? '30' : '00'}`);
  const seed = booking.date ? +booking.date.replaceAll('-', '') : 1;
  const now = new Date(), today = dayKey(now);
  $('#bookTimes').innerHTML = booking.date ? slots.map((t, i) => {
    const past = booking.date === today && +t.slice(0, 2) <= now.getHours();
    const taken = past || ((seed * (i + 7)) % 5 === 0) || (booking.date && fromKey(booking.date).getDay() === 5 && +t.slice(0, 2) < 14);
    return `<button type="button" class="time ${booking.time === t ? 'is-active' : ''}" data-time="${t}" ${taken ? 'disabled' : ''}>${t}</button>`;
  }).join('') : '<p class="sub" style="margin:0">Pick a day to see open times.</p>';
  renderSummary();
}

function renderSummary() {
  const items = bookingItems();
  const total = items.reduce((a, s) => a + s.price, 0), mins = items.reduce((a, s) => a + s.min, 0);
  $('#sumList').innerHTML = items.length ? items.map(s => `<li><span>${s.name}</span><b>${aed(s.price)}</b></li>`).join('') : '<li class="muted">No treatment yet</li>';
  $('#sumLook').hidden = !(booking.withLook && booking.services.has('gel'));
  $('#sumArtist').textContent = booking.artist ? ARTISTS.find(a => a.id === booking.artist).name : '—';
  $('#sumWhen').textContent = booking.date && booking.time ? `${fromKey(booking.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, ${booking.time}` : '—';
  $('#sumDur').textContent = mins ? `${Math.floor(mins / 60) ? Math.floor(mins / 60) + ' h ' : ''}${mins % 60 ? mins % 60 + ' min' : ''}` : '—';
  $('#sumTotal').textContent = aed(total);
  const ok = { 1: booking.services.size > 0, 2: !!booking.artist, 3: !!(booking.date && booking.time), 4: true }[booking.step];
  $('#nextStep').disabled = booking.step < 5 && !ok;
  $('#nextStep').textContent = booking.step === 4 ? `Confirm · ${aed(total)}` : 'Continue';
  $('#prevStep').disabled = booking.step === 1 || booking.step === 5;
  $('.summary__nav').hidden = booking.step === 5;
}

function goStep(n) {
  booking.step = n;
  $$('.pane').forEach(p => p.classList.toggle('is-active', +p.dataset.pane === n));
  $$('#steps li').forEach((li, i) => { li.classList.toggle('is-active', i + 1 === n); li.classList.toggle('is-done', i + 1 < n); });
  renderSummary();
}

$('#bookServices').addEventListener('click', e => {
  const b = e.target.closest('[data-svc]'); if (!b) return;
  booking.services.has(b.dataset.svc) ? booking.services.delete(b.dataset.svc) : booking.services.add(b.dataset.svc);
  b.classList.toggle('is-active'); renderSummary();
});
$('#bookArtists').addEventListener('click', e => { const b = e.target.closest('[data-artist]'); if (!b) return; booking.artist = b.dataset.artist; renderBooking(); });
$('#bookDates').addEventListener('click', e => { const b = e.target.closest('[data-date]'); if (!b) return; booking.date = b.dataset.date; booking.time = null; renderBooking(); });
$('#bookTimes').addEventListener('click', e => { const b = e.target.closest('[data-time]'); if (!b || b.disabled) return; booking.time = b.dataset.time; renderBooking(); });
$('#prevStep').addEventListener('click', () => goStep(Math.max(1, booking.step - 1)));
$('#nextStep').addEventListener('click', () => {
  if (booking.step < 4) return goStep(booking.step + 1);
  const f = $('#bookForm'); let bad = false;
  ['name', 'phone'].forEach(n => { const i = f.elements[n]; const wrong = n === 'phone' ? i.value.replace(/\D/g, '').length < 7 : !i.value.trim(); i.parentElement.classList.toggle('is-bad', wrong); bad ||= wrong; });
  if (bad) return toast('Please add your name and mobile number');
  const name = f.elements.name.value.trim().split(' ')[0];
  $('#doneName').textContent = name;
  $('#doneRef').textContent = 'LUMI-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  $('#doneText').textContent = `See you ${$('#sumWhen').textContent} with ${$('#sumArtist').textContent === 'First available' ? 'our first available artist' : $('#sumArtist').textContent}. A confirmation is on its way by SMS.`;
  goStep(5);
});
$('#bookAgain').addEventListener('click', () => { Object.assign(booking, { services: new Set(['gel']), artist: null, date: null, time: null }); $('#bookForm').reset(); renderBooking(); goStep(1); });
$('#addCal').addEventListener('click', () => {
  const [h, m] = booking.time.split(':').map(Number);
  const start = fromKey(booking.date); start.setHours(h, m);
  const mins = bookingItems().reduce((a, s) => a + s.min, 0);
  const end = new Date(start.getTime() + mins * 60000);
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lumi//Booking//EN', 'BEGIN:VEVENT', `UID:${$('#doneRef').textContent}@lumi.demo`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:Lumi Nail Lounge — ${bookingItems().map(s => s.name).join(', ')}`, 'LOCATION:Villa 12, Al Wasl Road, Jumeirah 1, Dubai', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'lumi-appointment.ics'; a.click();
});
$('#bookLook').addEventListener('click', () => {
  booking.services.add('gel'); booking.withLook = true; goStep(1); renderBooking();
  $('#book').scrollIntoView({ behavior: 'smooth' }); toast(`${look.shade.name} look added to your booking`);
});

// ---------------- misc ----------------
$$('#navLinks a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
$('#year').textContent = new Date().getFullYear();
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

$('#skins').addEventListener('click', e => {
  const b = e.target.closest('[data-skin]'); if (!b) return;
  $$('.skin').forEach(x => x.classList.toggle('is-active', x === b));
  stage && stage.setSkin(b.dataset.skin);
});

renderPicker();
setLook({});
renderServices();
renderBag();
renderBooking();
