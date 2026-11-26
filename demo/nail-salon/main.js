// LUMI — page logic: try-on, menu, looks, shop, bag and booking.
import { createStudio, bottleImages } from './studio.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const aed = n => `AED ${n.toLocaleString('en-AE')}`;
const BASE = '/demo/nail-salon/looks/';
const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromKey = k => new Date(k + 'T00:00:00');

// ---------------- data ----------------
// nail = polish colour, bg = the colour field behind the hand
const SHADES = [
  { id: 'porcelain', no: '01', name: 'Porcelain', nail: '#efe4de', bg: '#e8ddd6', desc: 'A milky, barely-there white.' },
  { id: 'ballet', no: '02', name: 'Ballet', nail: '#e9bdb7', bg: '#e6c7c1', desc: 'The soft pink of a pointe shoe.' },
  { id: 'blush', no: '03', name: 'Blush', nail: '#f19ab0', bg: '#f2b1c1', desc: 'Sheer, sweet and always right.' },
  { id: 'cerise', no: '04', name: 'Cerise', nail: '#c8103f', bg: '#c8113f', desc: 'A lit-from-within raspberry red.' },
  { id: 'flamingo', no: '05', name: 'Flamingo', nail: '#ff3d8f', bg: '#f0428e', desc: 'Loud, glossy, unapologetic pink.' },
  { id: 'orchid', no: '06', name: 'Orchid', nail: '#b03ae8', bg: '#9d3ad6', desc: 'Electric violet with a pink heart.' },
  { id: 'lilac', no: '07', name: 'Lilac', nail: '#b49cf0', bg: '#bba8ee', desc: 'Pastel lavender, cool and calm.' },
  { id: 'rouge', no: '08', name: 'Rouge', nail: '#ad0f1c', bg: '#9a0d1a', desc: 'The classic red, nothing less.' },
  { id: 'garnet', no: '09', name: 'Garnet', nail: '#6a0d27', bg: '#5a0b21', desc: 'Deep wine for long evenings.' },
  { id: 'plum', no: '10', name: 'Plum', nail: '#44123f', bg: '#3a1036', desc: 'Inky plum, nearly black.' },
  { id: 'cocoa', no: '11', name: 'Cocoa', nail: '#5b3427', bg: '#4c2c22', desc: 'Warm chocolate brown.' },
  { id: 'noir', no: '12', name: 'Noir', nail: '#17111a', bg: '#1c171d', desc: 'Pure gloss black.' },
];
const FINISHES = [
  { id: 'gloss', name: 'Gloss', svc: 'Gel manicure', price: 160, min: 50 },
  { id: 'matte', name: 'Matte', svc: 'Matte gel manicure', price: 175, min: 55 },
  { id: 'chrome', name: 'Chrome', svc: 'Chrome gel manicure', price: 210, min: 65 },
  { id: 'glitter', name: 'Glitter', svc: 'Glitter gel manicure', price: 195, min: 60 },
  { id: 'jelly', name: 'Jelly', svc: 'Jelly gel manicure', price: 170, min: 55 },
  { id: 'french', name: 'French', svc: 'French gel manicure', price: 190, min: 60 },
];
const SERVICES = {
  Hands: [
    { id: 'classic', name: 'Classic manicure', text: 'Shape, cuticle care and regular polish.', price: 90, min: 35 },
    { id: 'gel', name: 'Gel manicure', text: 'Three weeks of chip-free shine, any shade.', price: 160, min: 50 },
    { id: 'biab', name: 'BIAB builder gel', text: 'Strengthens and grows natural nails.', price: 230, min: 75 },
    { id: 'acrylic', name: 'Acrylic extensions', text: 'Full set in any shape and length.', price: 280, min: 90 },
    { id: 'chrome', name: 'Chrome & glazed', text: 'The glazed-donut finish.', price: 210, min: 65 },
  ],
  Feet: [
    { id: 'spa-pedi', name: 'Spa pedicure', text: 'Soak, scrub, mask and massage.', price: 150, min: 50 },
    { id: 'gel-pedi', name: 'Gel pedicure', text: 'Spa pedicure finished in gel.', price: 190, min: 60 },
  ],
  Extras: [
    { id: 'art', name: 'Nail art', text: 'Hand-painted details, gems and foils.', price: 60, min: 20, from: true },
    { id: 'removal', name: 'Gentle removal', text: 'Soak-off with nourishing care.', price: 50, min: 20 },
    { id: 'paraffin', name: 'Paraffin wax', text: 'Deep hydration wrap.', price: 45, min: 15 },
  ],
};
const ALL_SERVICES = Object.values(SERVICES).flat();
const LOOKS = [
  { shade: 'cerise', skin: 'fair', pose: 3, finish: 'gloss', title: 'Cerise' },
  { shade: 'lilac', skin: 'deep', pose: 2, finish: 'gloss', title: 'Lilac' },
  { shade: 'noir', skin: 'fair', pose: 4, finish: 'gloss', title: 'Noir' },
  { shade: 'ballet', skin: 'deep', pose: 1, finish: 'gloss', title: 'Ballet' },
];
const ARTISTS = [
  { id: 'any', name: 'First available', role: 'Fastest slot', ini: '✦', g: '#b8a7a0' },
  { id: 'maya', name: 'Maya', role: 'Shape & BIAB', ini: 'M', g: '#c8113f' },
  { id: 'sofia', name: 'Sofia', role: 'Nail art', ini: 'S', g: '#9d3ad6' },
  { id: 'noor', name: 'Noor', role: 'Chrome & French', ini: 'N', g: '#5a0b21' },
];
const shadeById = id => SHADES.find(s => s.id === id);
const inkFor = hex => { const n = parseInt(hex.slice(1), 16); const l = (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; return l > 0.62 ? '#17121a' : '#fbf7f4'; };

// ---------------- toast ----------------
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2400); }

// ---------------- try-on ----------------
const look = { shade: shadeById('cerise'), finish: FINISHES[0], skin: 'fair', pose: 1 };
let studio = null;
let bottles = {};

// Where each pose sits in the hero canvas (device pixels).
function layout(m, W, H) {
  const ar = m.w / m.h, wide = W / H > 1;
  if (wide) {
    if (m.anchor === 'bottom') { const h = H * 1.02, w = h * ar; return [W * 0.62 - w / 2, H - h, w, h]; }
    // arm enters from the right edge: size it so the nails land near the middle of the frame
    const h = H * 1.2, w = h * ar;
    return [W - w, Math.min(0, H * 0.5 - m.nails[1] * h), w, h];
  }
  // phones: the top of the hero carries the text (with a soft fade), the hand sits below it
  if (m.anchor === 'bottom') { const h = H * 0.6, w = h * ar; return [W / 2 - w / 2, H - h, w, h]; }
  const h = H * 0.74, w = h * ar;
  return [W - w, H * 0.63 - m.nails[1] * h, w, h];
}

function paintInfo(animate = true) {
  const s = look.shade;
  document.documentElement.style.setProperty('--bg', s.bg);
  document.documentElement.style.setProperty('--ink', inkFor(s.bg));
  $('meta[name="theme-color"]').content = s.bg;
  $('#shadeNo').textContent = `N°${s.no}`;
  const nm = $('#shadeName');
  nm.style.setProperty('--len', s.name.length);
  if (animate) nm.innerHTML = [...s.name].map((c, i) => `<span class="ch" style="animation-delay:${i * 35}ms">${c}</span>`).join('');
  $('#shadeDesc').textContent = s.desc;
  $$('.bottle').forEach(b => b.classList.toggle('is-on', b.dataset.id === s.id));
  $$('#finishes button').forEach(b => b.classList.toggle('is-on', b.dataset.id === look.finish.id));
  $$('#skins button').forEach(b => b.classList.toggle('is-on', b.dataset.skin === look.skin));
  $$('.hero__angles button').forEach(b => b.classList.toggle('is-on', +b.dataset.pose === look.pose));
  $('#sumSwatch').style.setProperty('--sw', s.nail);
  $('#sumLookText').textContent = `${s.name} · ${look.finish.name}`;
}

function setShade(s, { scroll = false } = {}) {
  const changed = s.id !== look.shade.id;
  look.shade = s;
  if (changed) { studio && studio.colour(s); paintInfo(); }
  centerBottle(true);
  if (scroll) $('#shades').scrollIntoView({ behavior: 'smooth' });
  renderSummary();
}
function setPose(i) {
  if (i === look.pose) return;
  const dir = i > look.pose ? 1 : -1;
  look.pose = i; studio && studio.pose(i, dir); paintInfo(false);
}

$('#finishes').innerHTML = FINISHES.map(f => `<button type="button" data-id="${f.id}">${f.name}</button>`).join('');
$('#finishes').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  look.finish = FINISHES.find(f => f.id === b.dataset.id); studio && studio.finish(look.finish.id); paintInfo(false); renderSummary();
});
$('#skins').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  look.skin = b.dataset.skin; studio && studio.skin(look.skin); paintInfo(false);
});
$('.hero__angles').addEventListener('click', e => { const b = e.target.closest('[data-pose]'); if (b) setPose(+b.dataset.pose); });

// drag / swipe to turn
(() => {
  const c = $('#studio'); let x0 = null;
  c.addEventListener('pointerdown', e => { x0 = e.clientX; });
  addEventListener('pointerup', e => {
    if (x0 === null) return; const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) setPose(((look.pose - 1 + (dx < 0 ? 1 : -1) + 4) % 4) + 1);
  });
  addEventListener('keydown', e => {
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight') setPose(look.pose % 4 + 1);
    if (e.key === 'ArrowLeft') setPose((look.pose + 2) % 4 + 1);
  });
})();

// lineup
$('#lineup').innerHTML = SHADES.map(s => `
  <button type="button" class="bottle" data-id="${s.id}" role="option" aria-label="${s.name}">
    <div class="bottle--ph"></div><span>${s.no} ${s.name}</span>
  </button>`).join('');
function centerBottle(smooth) {
  const row = $('#lineup'), b = $(`.bottle[data-id="${look.shade.id}"]`);
  if (!b || row.scrollWidth <= row.clientWidth) return;
  row.scrollTo({ left: b.offsetLeft + b.offsetWidth / 2 - row.clientWidth / 2, behavior: smooth ? 'smooth' : 'auto' });
}
$('#lineup').addEventListener('click', e => { const b = e.target.closest('.bottle'); if (b) setShade(shadeById(b.dataset.id)); });

$('#addShade').addEventListener('click', () => addToBag(`polish-${look.shade.id}`));
$('#bookShade').addEventListener('click', () => {
  booking.services = new Set(['gel']); renderBooking(); goStep(1);
  $('#book').scrollIntoView({ behavior: 'smooth' }); toast(`${look.shade.name} ${look.finish.name.toLowerCase()} added to your booking`);
});

// header turns solid once past the hero
new IntersectionObserver(([e]) => $('.head').classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe($('.hero'));

async function bootStudio() {
  const canvas = $('#studio');
  try {
    studio = await createStudio(canvas, { base: BASE, layout });
    studio.colour(look.shade, true);
    studio.finish(look.finish.id);
    await studio.ready(look.skin, look.pose);
    canvas.classList.add('is-ready');
  } catch (err) {
    console.error(err);
    canvas.remove();
  }
}

// ---------------- recoloured imagery (CPU, once) ----------------
const metaP = fetch(BASE + 'looks.json').then(r => r.json());
const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
async function renderLook(l) {
  const meta = await metaP; const m = meta[l.skin === 'fair' ? 'fairA' : 'deepA'][l.pose - 1];
  const [p, n] = await Promise.all([img(`${BASE}${l.skin}-${l.pose}.webp`), img(`${BASE}${l.skin}-${l.pose}-nails.png`)]);
  const w = Math.round(m.w / 2), h = Math.round(m.h / 2);
  const rd = im => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h); return x.getImageData(0, 0, w, h); };
  const P = rd(p), N = rd(n), o = P.data;
  const s = shadeById(l.shade);
  const hx = v => { const n2 = parseInt(v.slice(1), 16); return [(n2 >> 16 & 255) / 255, (n2 >> 8 & 255) / 255, (n2 & 255) / 255].map(c => c ** 2.2); };
  const nail = hx(s.nail), bg = hx(s.bg), white = m.white ** 2.2;
  const L = c => (c / 255) ** 2.2, S = c => 255 * Math.min(1, Math.max(0, c)) ** (1 / 2.2);
  for (let i = 0; i < o.length; i += 4) {
    const a = o[i + 3] / 255;
    // canvas hands back premultiplied-then-unpremultiplied colour; fully clear pixels lose it, so treat them as white
    const r = a > 0.01 ? L(o[i]) : white, g = a > 0.01 ? L(o[i + 1]) : white, b = a > 0.01 ? L(o[i + 2]) : white;
    let hr = r, hg = g, hb = b;
    const mk = N.data[i + 1] / 255;
    if (mk > 0.004) {
      const sv = N.data[i] / 255 * 2, d = Math.min(sv, 1.08) ** 1.35, sp = Math.max(0, Math.min(1, (sv - 1.04) / .5)) ** 1.4 * .85;
      hr = r * (1 - mk) + (nail[0] * d + sp) * mk; hg = g * (1 - mk) + (nail[1] * d + sp) * mk; hb = b * (1 - mk) + (nail[2] * d + sp) * mk;
    }
    o[i] = S(bg[0] * (1 - a) + hr * a); o[i + 1] = S(bg[1] * (1 - a) + hg * a); o[i + 2] = S(bg[2] * (1 - a) + hb * a); o[i + 3] = 255;
  }
  const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').putImageData(P, 0, 0);
  return new Promise(r => c.toBlob(b => r(URL.createObjectURL(b)), 'image/webp', .88));
}

// ---------------- menu ----------------
$('#menuList').innerHTML = Object.entries(SERVICES).map(([g, list]) => `
  <div class="menu__group reveal"><h3>${g}</h3>
    ${list.map(s => `<div class="row" data-book="${s.id}" role="button" tabindex="0">
      <b>${s.name}</b><small>${s.min} min</small><strong>${s.from ? 'from ' : ''}${s.price}</strong>
      <p>${s.text}</p><em>Book →</em></div>`).join('')}
  </div>`).join('');
$('#menuList').addEventListener('click', e => {
  const r = e.target.closest('[data-book]'); if (!r) return;
  booking.services = new Set([r.dataset.book]); renderBooking(); goStep(1);
  $('#book').scrollIntoView({ behavior: 'smooth' });
});

// ---------------- looks ----------------
$('#lookGrid').innerHTML = LOOKS.map((l, i) => {
  const s = shadeById(l.shade);
  return `<figure class="look reveal" style="--c:${s.bg};--i:${inkFor(s.bg)};transition-delay:${i * 90}ms">
    <button type="button" class="look__img" data-i="${i}" aria-label="Try ${l.title}"></button>
    <figcaption><b>${l.title}</b><span>${l.skin === 'fair' ? 'Fair' : 'Deep'} · Try on</span></figcaption></figure>`;
}).join('');
$('#lookGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-i]'); if (!b) return;
  const l = LOOKS[b.dataset.i];
  look.skin = l.skin; studio && studio.skin(l.skin);
  look.finish = FINISHES.find(f => f.id === l.finish); studio && studio.finish(l.finish);
  setPose(l.pose); setShade(shadeById(l.shade), { scroll: true }); paintInfo(false);
});

// ---------------- shop + bag ----------------
const polish = id => { const s = shadeById(id); return { id: `polish-${id}`, shade: id, name: `${s.name} gel polish`, sub: `N°${s.no} · 12 ml`, price: 55 }; };
const PRODUCTS = ['cerise', 'ballet', 'orchid', 'noir'].map(polish);
const productById = id => polish(id.slice(7));
const tint = hex => { const n = parseInt(hex.slice(1), 16); const mix = c => Math.round(c + (240 - c) * 0.8); return `rgb(${mix(n >> 16 & 255)},${mix(n >> 8 & 255)},${mix(n & 255)})`; };
$('#shopGrid').innerHTML = PRODUCTS.map((p, i) => `
  <article class="item reveal" style="transition-delay:${i * 80}ms">
    <div class="item__img" style="--t:${tint(shadeById(p.shade).nail)}"><img alt="${p.name}" data-bottle="${p.shade}"><button type="button" class="item__add" data-add="${p.id}">Add to bag</button></div>
    <div class="item__meta"><div><b>${p.name}</b><br><span>${p.sub}</span></div><b>${aed(p.price)}</b></div>
  </article>`).join('');
$('#shopGrid').addEventListener('click', e => { const a = e.target.closest('[data-add]'); if (a) addToBag(a.dataset.add); });

const bag = new Map();
function addToBag(id) { bag.set(id, (bag.get(id) || 0) + 1); renderBag(); toast(`${productById(id).name} — added to bag`); }
function renderBag() {
  let total = 0, count = 0;
  $('#bagList').innerHTML = bag.size ? [...bag].map(([id, q]) => {
    const p = productById(id); total += p.price * q; count += q;
    return `<li><div class="bag__img" style="--t:${tint(shadeById(p.shade).nail)}">${bottles[p.shade] ? `<img alt="" src="${bottles[p.shade]}">` : ''}</div>
      <div><b>${p.name}</b><small>${aed(p.price)}</small></div>
      <div class="qty"><button type="button" data-q="${id}" data-d="-1" aria-label="Less">−</button><span>${q}</span><button type="button" data-q="${id}" data-d="1" aria-label="More">+</button></div></li>`;
  }).join('') : '<li class="bag__empty">Your bag is empty</li>';
  $('#bagTotal').textContent = aed(total); $('#bagCount').textContent = count;
}
$('#bagList').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const q = (bag.get(b.dataset.q) || 0) + +b.dataset.d; q > 0 ? bag.set(b.dataset.q, q) : bag.delete(b.dataset.q); renderBag();
});
const drawer = $('#bag');
const openBag = open => { drawer.classList.toggle('is-open', open); drawer.setAttribute('aria-hidden', !open); };
$('#bagBtn').addEventListener('click', () => openBag(true));
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]')) openBag(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') openBag(false); });
$('#checkout').addEventListener('click', () => toast(bag.size ? 'Demo store — checkout connects when this theme goes live' : 'Your bag is empty'));

// ---------------- booking ----------------
const booking = { step: 1, services: new Set(['gel']), artist: null, date: null, time: null };
function bookingItems() {
  return [...booking.services].map(id => id === 'gel'
    ? { id, name: `${look.finish.svc} — ${look.shade.name}`, price: look.finish.price, min: look.finish.min }
    : ALL_SERVICES.find(x => x.id === id));
}
function renderBooking() {
  const opt = s => `<button type="button" class="opt ${booking.services.has(s.id) ? 'is-on' : ''}" data-svc="${s.id}">
    <span class="opt__check"></span><span><b>${s.name}</b><small>${s.min} min${s.id === 'gel' ? ' · your try-on look' : ''}</small></span>
    <span class="opt__price">${s.from ? 'from ' : ''}${aed(s.price)}</span></button>`;
  $('#bookServices').innerHTML = Object.entries(SERVICES).map(([g, l]) => `<p class="optlist__head">${g}</p>${l.map(opt).join('')}`).join('');
  $('#bookArtists').innerHTML = ARTISTS.map(a => `<button type="button" class="artist ${booking.artist === a.id ? 'is-on' : ''}" data-artist="${a.id}">
    <span class="artist__av" style="--g:${a.g}">${a.ini}</span><b>${a.name}</b><small>${a.role}</small></button>`).join('');
  const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  $('#bookDates').innerHTML = days.map(d => {
    const k = dayKey(d);
    return `<button type="button" class="date ${booking.date === k ? 'is-on' : ''}" data-date="${k}"><small>${d.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('en-GB', { month: 'short' })}</small></button>`;
  }).join('');
  const slots = []; for (let h = 10; h < 22; h++) for (const m of [0, 30]) slots.push(`${String(h).padStart(2, '0')}:${m ? '30' : '00'}`);
  const seed = booking.date ? +booking.date.replaceAll('-', '') : 1, now = new Date(), today = dayKey(now);
  $('#bookTimes').innerHTML = booking.date ? slots.map((t, i) => {
    const taken = (booking.date === today && +t.slice(0, 2) <= now.getHours()) || (seed * (i + 7)) % 5 === 0 || (fromKey(booking.date).getDay() === 5 && +t.slice(0, 2) < 14);
    return `<button type="button" class="time ${booking.time === t ? 'is-on' : ''}" data-time="${t}" ${taken ? 'disabled' : ''}>${t}</button>`;
  }).join('') : '<p>Choose a day to see open times.</p>';
  renderSummary();
}
function renderSummary() {
  const items = bookingItems();
  const total = items.reduce((a, s) => a + s.price, 0), mins = items.reduce((a, s) => a + s.min, 0);
  $('#sumList').innerHTML = items.length ? items.map(s => `<li><span>${s.name}</span><span>${aed(s.price)}</span></li>`).join('') : '<li class="muted">Choose a treatment</li>';
  $('#sumLook').hidden = !booking.services.has('gel');
  $('#sumArtist').textContent = booking.artist ? ARTISTS.find(a => a.id === booking.artist).name : '—';
  $('#sumWhen').textContent = booking.date && booking.time ? `${fromKey(booking.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, ${booking.time}` : '—';
  $('#sumDur').textContent = mins ? `${Math.floor(mins / 60) ? Math.floor(mins / 60) + ' h ' : ''}${mins % 60 ? mins % 60 + ' min' : ''}` : '—';
  $('#sumTotal').textContent = aed(total);
  const ok = { 1: booking.services.size > 0, 2: !!booking.artist, 3: !!(booking.date && booking.time), 4: true }[booking.step];
  $('#nextStep').disabled = booking.step < 5 && !ok;
  $('#nextStep').textContent = booking.step === 4 ? `Confirm · ${aed(total)}` : 'Continue';
  $('#prevStep').disabled = booking.step === 1;
  $('.summary__nav').hidden = booking.step === 5;
}
function goStep(n) {
  booking.step = n;
  $$('.pane').forEach(p => p.classList.toggle('is-on', +p.dataset.pane === n));
  $$('#steps li').forEach((li, i) => { li.classList.toggle('is-on', i + 1 === n); li.classList.toggle('is-done', i + 1 < n); });
  renderSummary();
}
$('#bookServices').addEventListener('click', e => { const b = e.target.closest('[data-svc]'); if (!b) return; booking.services.has(b.dataset.svc) ? booking.services.delete(b.dataset.svc) : booking.services.add(b.dataset.svc); b.classList.toggle('is-on'); renderSummary(); });
$('#bookArtists').addEventListener('click', e => { const b = e.target.closest('[data-artist]'); if (!b) return; booking.artist = b.dataset.artist; renderBooking(); });
$('#bookDates').addEventListener('click', e => { const b = e.target.closest('[data-date]'); if (!b) return; booking.date = b.dataset.date; booking.time = null; renderBooking(); });
$('#bookTimes').addEventListener('click', e => { const b = e.target.closest('[data-time]'); if (!b || b.disabled) return; booking.time = b.dataset.time; renderBooking(); });
$('#prevStep').addEventListener('click', () => goStep(Math.max(1, booking.step - 1)));
$('#nextStep').addEventListener('click', () => {
  if (booking.step < 4) return goStep(booking.step + 1);
  const f = $('#bookForm'); let bad = false;
  ['name', 'phone'].forEach(n => { const i = f.elements[n]; const w = n === 'phone' ? i.value.replace(/\D/g, '').length < 7 : !i.value.trim(); i.parentElement.classList.toggle('is-bad', w); bad ||= w; });
  if (bad) return toast('Please add your name and mobile number');
  $('#doneName').textContent = f.elements.name.value.trim().split(' ')[0];
  $('#doneRef').textContent = 'LUMI-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  const who = $('#sumArtist').textContent;
  $('#doneText').textContent = `${$('#sumWhen').textContent} with ${who === 'First available' ? 'our first available artist' : who}. A confirmation is on its way by SMS.`;
  goStep(5);
});
$('#bookAgain').addEventListener('click', () => { Object.assign(booking, { services: new Set(['gel']), artist: null, date: null, time: null }); $('#bookForm').reset(); renderBooking(); goStep(1); });
$('#addCal').addEventListener('click', () => {
  const [h, m] = booking.time.split(':').map(Number); const start = fromKey(booking.date); start.setHours(h, m);
  const end = new Date(start.getTime() + bookingItems().reduce((a, s) => a + s.min, 0) * 60000);
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lumi//Booking//EN', 'BEGIN:VEVENT', `UID:${$('#doneRef').textContent}@lumi.demo`, `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:Lumi Nail Lounge — ${bookingItems().map(s => s.name).join(', ')}`, 'LOCATION:Villa 12, Al Wasl Road, Jumeirah 1, Dubai', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'lumi-appointment.ics'; a.click();
});

// ---------------- boot ----------------
$('#year').textContent = new Date().getFullYear();
$$('.head__nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

paintInfo();
renderBag();
renderBooking();
bootStudio();

// bottles and looks are recoloured from the same photographs once the hero is up
bottleImages(BASE, SHADES).then(urls => {
  bottles = urls;
  $$('.bottle').forEach(b => { const ph = b.querySelector('.bottle--ph'); if (ph) ph.outerHTML = `<img alt="" src="${urls[b.dataset.id]}">`; });
  $$('[data-bottle]').forEach(i => { i.src = urls[i.dataset.bottle]; });
  renderBag();
  requestAnimationFrame(() => centerBottle(false));
});
(async () => {
  for (const [i, l] of LOOKS.entries()) {
    const url = await renderLook(l);
    $(`.look__img[data-i="${i}"]`).innerHTML = `<img alt="${l.title} nails" src="${url}">`;
  }
})();
