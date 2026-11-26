import { demobar } from '../../src/demo/demobar.js';
import { smooth, revealHeadings, rise, gsap, reduced } from '../../src/demo/motion.js';
import { CATS, DIET, MENU, AR, CATS_AR, DIET_AR } from './menu.js';
import { i18n } from '../../src/demo/i18n.js';
import { DICT } from './ar.js';

demobar({ name: 'Ember & Salt — restaurant theme', buy: '/store/website-themes/ember-restaurant/', start: 'web' });

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const ICON = { veg: ['🌿', 'Vegetarian'], spicy: ['🌶', 'Spicy'], gf: ['GF', 'Gluten-free'], df: ['DF', 'Dairy-free'] };
let L = 'en';
const tr = (en, ar) => (L === 'ar' ? ar : en);
const nm = d => tr(d.name, AR[d.id][0]);
const ds = d => tr(d.desc, AR[d.id][1]);
const addonName = (d, n) => tr(n, AR[d.id][2][d.addons.findIndex(a => a[0] === n)] || n);
const catName = k => tr(CATS.find(c => c[0] === k)[1], CATS_AR[k]);
const dietName = k => tr(ICON[k][1], DIET_AR[k]);
const IMG = id => `/demo/restaurant/img/${id}.webp`;
const artOf = d => `<img src="${IMG(d.id)}" alt="${nm(d)}" loading="lazy" decoding="async">`;
const aed = n => (L === 'ar' ? `${n} د.إ` : `AED ${n}`);

let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600); }

// ---------- Hero: plate + embers ----------
const by = id => MENU.find(d => d.id === id);
const plate = $('#heroPlate');
plate.innerHTML = [['hummus', 'main', 1], ['burrata', 'b', 2.2], ['lemonade', 'c', 3]]
  .map(([id, k, depth]) => `<div class="hp hp--${k}" data-depth="${depth}"><img src="${IMG(id)}" alt="" fetchpriority="${k === 'main' ? 'high' : 'auto'}"></div>`).join('');
// Smooth pointer parallax + scroll drift
let mx = 0, my = 0, cx = 0, cy = 0;
addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
(function loop() {
  cx += (mx - cx) * .06; cy += (my - cy) * .06;
  plate.querySelectorAll('.hp').forEach(el => { const d = +el.dataset.depth; el.style.translate = `${cx * 26 * d}px ${cy * 26 * d}px`; });
  requestAnimationFrame(loop);
})();

(function embers() {
  const c = $('#embers'), x = c.getContext('2d');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let W, H, P = [];
  const size = () => { const r = c.getBoundingClientRect(); W = c.width = r.width * devicePixelRatio; H = c.height = r.height * devicePixelRatio; };
  size(); addEventListener('resize', size);
  const spawn = () => ({ x: W * (.45 + Math.random() * .5), y: H + 10, vx: (Math.random() - .5) * .6, vy: -(0.6 + Math.random() * 1.6) * devicePixelRatio, r: (0.8 + Math.random() * 2.2) * devicePixelRatio, life: 0, max: 220 + Math.random() * 260 });
  for (let i = 0; i < 70; i++) { const p = spawn(); p.y = Math.random() * H; P.push(p); }
  let vis = true;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(c);
  (function tick(t) {
    requestAnimationFrame(tick);
    if (!vis) return;
    x.clearRect(0, 0, W, H);
    x.globalCompositeOperation = 'lighter';
    for (const p of P) {
      p.life++; p.x += p.vx + Math.sin((p.life + p.max) * .03) * .4; p.y += p.vy;
      const a = Math.max(0, 1 - p.life / p.max);
      x.fillStyle = `rgba(${240},${110 + a * 80 | 0},${40},${a * .9})`;
      x.beginPath(); x.arc(p.x, p.y, p.r * (0.5 + a), 0, 7); x.fill();
      if (p.life > p.max || p.y < -10) Object.assign(p, spawn());
    }
  })();
})();

// ---------- Menu ----------
const state = { cat: 'small', diet: new Set(), q: '' };
const basket = new Map(); // key → { d, qty, add: [names], unit }

const tabs = $('#tabs');
tabs.insertAdjacentHTML('beforeend', CATS.map(([k, n]) => `<button type="button" role="tab" data-cat="${k}" aria-selected="${k === state.cat}">${n}</button>`).join(''));
function moveInk() {
  const b = tabs.querySelector('[aria-selected="true"]');
  $('#tabInk').style.cssText = `width:${b.offsetWidth}px;transform:translateX(${b.offsetLeft}px)`;
}
tabs.addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  state.cat = b.dataset.cat; state.q = ''; $('#search').value = '';
  tabs.querySelectorAll('[data-cat]').forEach(x => x.setAttribute('aria-selected', x === b));
  b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  moveInk(); render();
});
addEventListener('resize', moveInk);
document.fonts?.ready.then(moveInk);

const paintDiet = () => { $('#diet').innerHTML = DIET.map(([k]) => `<button type="button" class="chip" data-diet="${k}" aria-pressed="${state.diet.has(k)}"><i>${ICON[k][0]}</i>${dietName(k)}</button>`).join(''); };
paintDiet();
$('#diet').addEventListener('click', e => {
  const b = e.target.closest('[data-diet]'); if (!b) return;
  const k = b.dataset.diet, on = !state.diet.has(k);
  on ? state.diet.add(k) : state.diet.delete(k);
  b.setAttribute('aria-pressed', on); render();
});
$('#search').addEventListener('input', e => { state.q = e.target.value.trim().toLowerCase(); render(); });

const qtyOf = id => [...basket.values()].filter(l => l.d.id === id).reduce((s, l) => s + l.qty, 0);
function control(d) {
  const q = qtyOf(d.id);
  return q ? `<div class="mini" data-mini="${d.id}"><button type="button" data-dec="${d.id}" aria-label="Remove one">−</button><output>${q}</output><button type="button" data-inc="${d.id}" aria-label="Add one">+</button></div>`
    : `<button type="button" class="add" data-quick="${d.id}" aria-label="Add ${d.name}">+</button>`;
}
function render() {
  const list = MENU.filter(d => (state.q ? (d.name + ' ' + d.desc + ' ' + AR[d.id][0] + ' ' + AR[d.id][1]).toLowerCase().includes(state.q) : d.cat === state.cat) && [...state.diet].every(t => d.tags.includes(t)));
  $('#grid').innerHTML = list.length ? list.map((d, i) => `
    <article class="card" tabindex="0" data-open="${d.id}" style="animation-delay:${i * 60}ms">
      <div class="card__art">${artOf(d)}${d.sig ? `<span class="card__sig">${tr('Signature', 'طبق مميّز')}</span>` : ''}</div>
      <h3>${nm(d)}</h3>
      <p>${ds(d)}</p>
      <div class="card__foot">
        <span class="price">${L === 'ar' ? `${d.price}<small> د.إ</small>` : `<small>AED</small>${d.price}`}</span>
        <span class="icons">${d.tags.map(t => `<span title="${dietName(t)}">${ICON[t][0]}</span>`).join('')}</span>
        ${control(d)}
      </div>
    </article>`).join('') : `<div class="empty">${tr('No dishes match those filters. Try removing one.', 'لا توجد أطباق تطابق هذه الفلاتر. جرّب إزالة أحدها.')}</div>`;
}
function refreshControls() { $$('.card').forEach(c => { const d = MENU.find(m => m.id === c.dataset.open); c.querySelector('.add, .mini').outerHTML = control(d); }); }

// ---------- Basket ----------
function addLine(d, qty = 1, addons = []) {
  const key = d.id + '|' + addons.join(',');
  const unit = d.price + addons.reduce((s, n) => s + (d.addons.find(a => a[0] === n)?.[1] || 0), 0);
  const l = basket.get(key) || { d, qty: 0, add: addons, unit };
  l.qty += qty;
  l.qty > 0 ? basket.set(key, l) : basket.delete(key);
  paintBasket();
}
function paintBasket() {
  const n = [...basket.values()].reduce((s, l) => s + l.qty, 0);
  const c = $('#basketCount'); c.textContent = n; c.classList.add('bump'); setTimeout(() => c.classList.remove('bump'), 300);
  const sub = [...basket.values()].reduce((s, l) => s + l.qty * l.unit, 0);
  const fee = pickup || !sub ? 0 : 9;
  $('#subtotal').textContent = aed(sub); $('#fee').textContent = aed(fee); $('#total').textContent = aed(sub + fee);
  $('#feeRow').style.display = pickup ? 'none' : '';
  $('#basketItems').innerHTML = basket.size ? [...basket].map(([k, l]) => `
    <div class="line">${artOf(l.d)}<div><b>${nm(l.d)}</b><small>${l.add.length ? l.add.map(n => addonName(l.d, n)).join('، ') + ' · ' : ''}${aed(l.unit)}</small></div>
      <div class="mini"><button type="button" data-line="${k}" data-d="-1" aria-label="Less">−</button><output>${l.qty}</output><button type="button" data-line="${k}" data-d="1" aria-label="More">+</button></div></div>`).join('')
    : `<p class="muted" style="text-align:center;padding:40px 0">${tr('Your order is empty.<br>Add something from the fire.', 'طلبك فارغ.<br>أضف شيئاً من الشواية.')}</p>`;
  refreshControls();
}
function fly(fromEl, d) {
  const r = fromEl.getBoundingClientRect(), t = $('#basketBtn').getBoundingClientRect();
  const f = document.createElement('div'); f.className = 'fly'; f.innerHTML = artOf(d);
  f.style.left = r.left + r.width / 2 - 27 + 'px'; f.style.top = r.top + r.height / 2 - 27 + 'px';
  document.body.append(f);
  requestAnimationFrame(() => { f.style.transform = `translate(${t.left + t.width / 2 - r.left - r.width / 2}px,${t.top + t.height / 2 - r.top - r.height / 2}px) scale(.3) rotate(220deg)`; f.style.opacity = '.4'; });
  setTimeout(() => f.remove(), 800);
}
let pickup = false;
segment($('#mode'), i => { pickup = i === 1; paintBasket(); });
const open = el => { el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); };
const close = el => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); };
$('#basketBtn').onclick = () => open($('#basket'));
$('#checkout').onclick = () => {
  if (!basket.size) return toast(tr('Add a dish first', 'أضف طبقاً أولاً'));
  const no = 1000 + Math.floor(Math.random() * 9000);
  basket.clear(); paintBasket();
  $('#basketItems').innerHTML = `<div class="done"><div class="done__tick">✓</div><h3>${tr('Order', 'الطلب')} #${no}</h3><p class="muted">${pickup ? tr('Ready for pick-up in about 20 minutes.', 'جاهز للاستلام خلال 20 دقيقة تقريباً.') : tr('Arriving in about 35 minutes.', 'يصل خلال 35 دقيقة تقريباً.')}</p>
    <ol class="track">${(L === 'ar' ? ['تم استلام الطلب', 'على الشواية', pickup ? 'جاهز عند الكاونتر' : 'في الطريق إليك', pickup ? 'تم الاستلام' : 'تم التوصيل'] : ['Order received', 'On the grill', pickup ? 'Ready at the counter' : 'Out for delivery', pickup ? 'Collected' : 'Delivered']).map((s, i) => `<li${i === 0 ? ' class="is-done"' : ''}>${s}</li>`).join('')}</ol></div>`;
  $$('.track li').forEach((li, i) => setTimeout(() => li.classList.add('is-done'), i * 1400));
};

// ---------- Dish sheet ----------
let cur, curQty = 1;
function openDish(d) {
  cur = d; curQty = 1;
  $('#dArt').innerHTML = artOf(d);
  $('#dCat').textContent = catName(d.cat);
  $('#dName').textContent = nm(d);
  $('#dDesc').textContent = ds(d);
  $('#dMeta').innerHTML = [`${d.kcal} ${tr('kcal', 'سعرة')}`, d.spice ? `<span class="spice">${'🌶'.repeat(d.spice)}</span>` : tr('Not spicy', 'غير حار'), ...d.tags.filter(t => t !== 'spicy').map(dietName)].map(x => `<span>${x}</span>`).join('');
  $('#dAddons').innerHTML = d.addons.map(([n, p]) => `<label class="addon"><input type="checkbox" value="${n}"><span>${addonName(d, n)}</span><b>${p ? '+ ' + aed(p) : tr('Free', 'مجاناً')}</b></label>`).join('');
  $('#dQty output').textContent = 1;
  priceBtn(); open($('#dishSheet'));
}
function priceBtn() {
  const extra = $$('#dAddons input:checked').reduce((s, i) => s + cur.addons.find(a => a[0] === i.value)[1], 0);
  $('#dAdd').textContent = `${tr('Add', 'أضف')} ${curQty} · ${aed((cur.price + extra) * curQty)}`;
}
$('#dAddons').addEventListener('change', priceBtn);
$('#dQty').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; curQty = Math.max(1, curQty + +b.dataset.d); $('#dQty output').textContent = curQty; priceBtn(); });
$('#dAdd').onclick = () => { fly($('#dArt'), cur); addLine(cur, curQty, $$('#dAddons input:checked').map(i => i.value)); close($('#dishSheet')); toast(tr(`${cur.name} added`, `تمت إضافة ${nm(cur)}`)); };

// ---------- Delegated clicks ----------
document.addEventListener('click', e => {
  const t = e.target;
  const q = t.closest('[data-quick]'), inc = t.closest('[data-inc]'), dec = t.closest('[data-dec]'), ln = t.closest('[data-line]');
  if (q) { const d = MENU.find(m => m.id === q.dataset.quick); fly(q, d); addLine(d); return; }
  if (inc) { const d = MENU.find(m => m.id === inc.dataset.inc); fly(inc, d); addLine(d); return; }
  if (dec) { const d = MENU.find(m => m.id === dec.dataset.dec); const k = [...basket.keys()].reverse().find(k => k.startsWith(d.id + '|')); if (k) { basket.get(k).qty--; if (!basket.get(k).qty) basket.delete(k); paintBasket(); } return; }
  if (ln) { const l = basket.get(ln.dataset.line); l.qty += +ln.dataset.d; if (l.qty < 1) basket.delete(ln.dataset.line); paintBasket(); return; }
  const o = t.closest('[data-open]'); if (o) { openDish(MENU.find(m => m.id === o.dataset.open)); return; }
  if (t.closest('[data-close]') || t.classList.contains('sheet') || t.classList.contains('drawer')) $$('.sheet, .drawer').forEach(close);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('.sheet, .drawer').forEach(close);
  if (e.key === 'Enter' && e.target.matches('[data-open]')) openDish(MENU.find(m => m.id === e.target.dataset.open));
});

// ---------- Booking ----------
function segment(el, cb) { el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; [...el.children].forEach(x => x.classList.toggle('is-on', x === b)); cb?.([...el.children].indexOf(b)); }); }
segment($('#seating'));
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const today = new Date();
$('#days').innerHTML = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return `<button type="button" class="${i ? '' : 'is-on'}" data-i="${i}" data-dow="${d.getDay()}"><span></span><b>${d.getDate()}</b></button>`; }).join('');
const paintDays = () => $$('#days button').forEach((b, i) => { b.querySelector('span').textContent = i ? tr(DAYS[b.dataset.dow], DAYS_AR[b.dataset.dow]) : tr('Today', 'اليوم'); });
paintDays();
const TIMES = ['12:30', '13:30', '14:30', '18:00', '19:00', '19:30', '20:00', '20:30', '21:30', '22:30'];
function slots(day) {
  const full = new Set(TIMES.filter((_, i) => (i * 7 + day * 3) % 5 === 0));
  $('#slots').innerHTML = TIMES.map(t => `<button type="button" ${full.has(t) ? 'disabled' : ''}>${t}</button>`).join('');
}
slots(0);
segment($('#days'), i => slots(i));
segment($('#slots'));
let guests = 2;
$('[data-stepper]').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; guests = Math.min(8, Math.max(1, guests + +b.dataset.d)); $('#guests').textContent = guests; });
$('#bookForm').addEventListener('submit', e => {
  e.preventDefault();
  const time = $('#slots .is-on')?.textContent;
  if (!time) return toast(tr('Pick a time', 'اختر وقتاً'));
  const day = $('#days .is-on');
  const f = e.target;
  f.innerHTML = `<div class="done"><div class="done__tick">✓</div><h3>${tr(`See you soon, ${f.name.value.split(' ')[0]}.`, `نراك قريباً يا ${f.name.value.split(' ')[0]}.`)}</h3><p class="muted">${tr(`Table for ${guests}`, `طاولة لـ ${guests}`)} · ${day.querySelector('span').textContent} ${day.querySelector('b').textContent} ${tr('at', 'الساعة')} ${time}<br>${$('#seating .is-on')?.textContent || ''} · ${tr('confirmation sent by SMS', 'تم إرسال التأكيد برسالة نصية')}</p></div>`;
});

// ---------- Count-up stats ----------
const countIO = new IntersectionObserver((es, o) => es.forEach(e => {
  if (!e.isIntersecting) return;
  o.unobserve(e.target);
  const end = +e.target.dataset.count, t0 = performance.now();
  (function step(t) { const k = Math.min(1, (t - t0) / 1400); e.target.textContent = Math.round(end * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); })(t0);
}), { threshold: .6 });
$$('[data-count]').forEach(el => countIO.observe(el));

render();
paintBasket();
moveInk();

// ---------- Smooth motion ----------
smooth();
revealHeadings('.hero h1', { immediate: true });
revealHeadings('h2');
rise('.story__stats li, .hours, .book__form, .visit .map, .book__chef');
if (!reduced) {
  gsap.from('.hp', { scale: .4, rotate: -40, autoAlpha: 0, duration: 1.4, ease: 'expo.out', stagger: .12, delay: .1 });
  gsap.from('.lead, .hero__cta, .hero__facts li', { y: 24, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: .08, delay: .5 });
  gsap.to('#heroPlate', { yPercent: 18, scale: .86, rotate: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.story__media', { clipPath: 'inset(14% 10% 14% 10% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.story', start: 'top 85%', end: 'top 15%', scrub: true } });
  gsap.fromTo('.story__media img', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.book__chef img', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.book__chef', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.visit .map img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom top', scrub: true } });
}

// ---------- Language (EN / Arabic) ----------
const lang = i18n({ key: 'ember-lang', mount: $('.head__end'), dict: DICT, onChange: l => {
  L = l;
  $$('#tabs [data-cat]').forEach(b => { b.textContent = catName(b.dataset.cat); });
  paintDiet(); render(); paintBasket(); paintDays(); requestAnimationFrame(moveInk);
} });
lang.start();
