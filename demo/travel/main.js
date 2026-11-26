import { demobar } from '../../src/demo/demobar.js';
import { createGlobe } from './globe.js';
import { smooth, revealHeadings, rise, gsap, ScrollTrigger, reduced } from '../../src/demo/motion.js';
import LAND from './land.js';
import { HOME, DEST, NATIONS, FREE, TYPES, CHECK } from './data.js';
import { i18n } from '../../src/demo/i18n.js';
import { DICT, DEST_AR, NATIONS_AR, TYPES_AR, CHECK_AR, HL_AR } from './ar.js';

let L = 'en';
const tr = (en, ar) => (L === 'ar' ? ar : en);
const f = (d, k) => (L === 'ar' ? DEST_AR[d.id][k] : d[k]);
const aed = n => tr(`AED ${n}`, `${n} د.إ`);

demobar({ name: 'Atlas — travel & visa agency theme', buy: '/store/website-themes/atlas-travel/', start: 'web' });

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let toastT;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600); };

// ---------- Globe + city pills ----------
const globe = createGlobe($('#globe'), { dots: LAND, home: HOME, dests: DEST });
const paintPills = () => { const on = $('#pills .is-on')?.dataset.d; $('#pills').innerHTML = DEST.slice(0, 6).map(d => `<button type="button" data-d="${d.id}" class="${d.id === on ? 'is-on' : ''}">${f(d, 'city')}</button>`).join(''); globe.labels(id => f(DEST.find(x => x.id === id), 'city')); };
paintPills();
$('#pills').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (b) pick(b.dataset.d, true); });

// ---------- Visa checker ----------
function paintSelects() {
  const keep = [$('#nation').value, $('#dest').value, $('#leadDest').value];
  $('#nation').innerHTML = NATIONS.map(n => `<option value="${n}">${tr(n, NATIONS_AR[n])}</option>`).join('');
  const destOpts = DEST.map(d => `<option value="${d.id}">${f(d, 'country')}</option>`).join('');
  $('#dest').innerHTML = destOpts;
  $('#leadDest').innerHTML = `<option value="">${tr('Where are you going?', 'إلى أين ستسافر؟')}</option>` + destOpts;
  if (keep[0]) [$('#nation').value, $('#dest').value, $('#leadDest').value] = keep;
}
paintSelects();
function pick(id, fromPill) {
  $('#dest').value = id;
  $$('#pills button').forEach(b => b.classList.toggle('is-on', b.dataset.d === id));
  globe.focus(id);
  showResult();
}
function showResult() {
  const d = DEST.find(x => x.id === $('#dest').value), n = $('#nation').value;
  const free = (FREE[n] || []).includes(d.id);
  $('#result').outerHTML = `<div class="result" id="result" aria-live="polite">
    <p class="tag">${f(d, 'city')}، ${f(d, 'country')} ${free ? `<i class="free">${tr('No visa needed', 'لا تحتاج تأشيرة')}</i>` : `<i>${f(d, 'visa')}</i>`}</p>
    <div><span>${tr('Processing', 'مدة المعالجة')}</span><b>${free ? tr('Not required', 'غير مطلوبة') : f(d, 'days')}</b></div>
    <div><span>${tr('Documents', 'المستندات')}</span><b>${free ? tr('Passport only', 'الجواز فقط') : tr(d.docs + ' items', d.docs + ' مستندات')}</b></div>
    <div><span>${tr('Service from', 'الخدمة من')}</span><b>${free ? '—' : aed(d.from)}</b></div>
    <a href="#contact" class="btn btn--amber" data-apply="${d.id}">${free ? tr('Plan the trip', 'خطط لرحلتك') : tr('Start application', 'ابدأ الطلب')}</a>
    <p class="demo">${tr('Sample information for this demo.', 'معلومات تجريبية لهذا العرض.')} ${f(d, 'note')}.</p>
  </div>`;
}
$('#nation').addEventListener('change', showResult);
$('#dest').addEventListener('change', e => pick(e.target.value));
document.addEventListener('click', e => { const a = e.target.closest('[data-apply]'); if (a) $('#leadDest').value = a.dataset.apply; });
pick('uk');

// ---------- Marquee ----------
const HL = ['12,400+ visas processed', '98% approval rate', '60+ countries', 'Reply in 30 minutes', 'Documents checked by specialists', 'Passport pick-up & drop-off', 'Open 7 days'];
const paintMarquee = () => { const H = L === 'ar' ? HL_AR : HL; $('#marquee').innerHTML = [...H, ...H].map(h => `<span>${h}</span>`).join(''); };
paintMarquee();

// ---------- Postcards (generated art, 3D tilt) ----------
function postcard(d) {
  return `<article class="pc" tabindex="0" data-pc="${d.id}">
    <div class="pc__bg"><img src="/demo/travel/img/${d.img}.webp" alt="${d.city}" loading="lazy" decoding="async"></div>
    <span class="pc__code">${d.code}</span>
    <div class="pc__body"><h3>${d.city}</h3><p>${d.country} · ${d.visa}</p>
      <div class="pc__row"><span>${d.days}</span><b>from AED ${d.from}</b></div></div>
    <span class="pc__glare"></span>
  </article>`;
}
const rail = $('#rail');
rail.innerHTML = DEST.map(postcard).join('');
const paintCards = () => $$('.pc').forEach(c => {
  const d = DEST.find(x => x.id === c.dataset.pc);
  c.querySelector('h3').textContent = f(d, 'city');
  c.querySelector('.pc__body p').textContent = `${f(d, 'country')} · ${f(d, 'visa')}`;
  c.querySelector('.pc__row span').textContent = f(d, 'days');
  c.querySelector('.pc__row b').textContent = tr(`from AED ${d.from}`, `من ${d.from} د.إ`);
});
rail.addEventListener('pointermove', e => {
  const c = e.target.closest('.pc'); if (!c || e.pointerType !== 'mouse') return;
  const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
  c.style.transform = `rotateY(${(x - .5) * 16}deg) rotateX(${(.5 - y) * 14}deg) translateY(-6px)`;
  c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
  c.querySelector('.pc__bg').style.transform = `translate(${(x - .5) * -16}px, ${(y - .5) * -16}px)`;
});
rail.addEventListener('pointerout', e => { const c = e.target.closest('.pc'); if (c && !c.contains(e.relatedTarget)) { c.style.transform = ''; c.querySelector('.pc__bg').style.transform = ''; } });
rail.addEventListener('click', e => { const c = e.target.closest('[data-pc]'); if (c) { pick(c.dataset.pc); $('#checker').scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
$$('[data-scroll]').forEach(b => b.onclick = () => rail.scrollBy({ left: +b.dataset.scroll * 320, behavior: 'smooth' }));

// ---------- Visa types ----------
let vcur = 0;
const T = i => (L === 'ar' ? TYPES_AR[i] : TYPES[i]);
const paintVtabs = () => { $('#vtabs').innerHTML = TYPES.map((_, i) => `<button type="button" role="tab" class="${i === vcur ? 'is-on' : ''}" data-t="${i}">${T(i)[0]} <span>${T(i)[1].split(/[,،]/)[0].replace(/\.$/, '')}</span></button>`).join(''); };
paintVtabs();
function vt(i) {
  vcur = i;
  const en = TYPES[i][0], [n, d, docs] = T(i);
  $$('#vtabs button').forEach(b => b.classList.toggle('is-on', +b.dataset.t === i));
  $('#vpanel').innerHTML = `<figure class="vpanel__img"><img src="/demo/travel/img/visa-${en.toLowerCase()}.webp" alt="${n}"></figure><p class="eyebrow">${tr(`${n} visa`, `تأشيرة ${n}`)}</p><h3>${d}</h3><ul>${docs.map(x => `<li>${x}</li>`).join('')}</ul><a href="#contact" class="btn">${tr(`Get a ${n.toLowerCase()} visa quote`, `اطلب عرض سعر لتأشيرة ${n}`)}</a>`;
}
$('#vtabs').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) vt(+b.dataset.t); });
vt(0);

// ---------- Steps: scroll-linked progress ----------
const steps = $('#steps'), fill = $('#stepFill'), lis = $$('#steps li');
function onScroll() {
  const r = steps.getBoundingClientRect(), vh = innerHeight;
  const k = Math.max(0, Math.min(1, (vh * .6 - r.top) / r.height));
  fill.style.height = k * 100 + '%';
  lis.forEach(li => li.classList.toggle('is-in', li.getBoundingClientRect().top < vh * .65));
  $('#head').classList.toggle('is-light', $('.dest').getBoundingClientRect().top < 70 && $('.how').getBoundingClientRect().top > 70 || $('.docs').getBoundingClientRect().top < 70);
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// ---------- Checklist ring ----------
$('#list').innerHTML = CHECK.map((c, i) => `<li><label><input type="checkbox" data-c="${i}"><i>✓</i><span>${c}</span></label></li>`).join('');
const paintList = () => $$('#list span').forEach((sp, i) => { sp.textContent = tr(CHECK[i], CHECK_AR[i]); });
$('#list').addEventListener('change', () => {
  const n = $$('#list input:checked').length, k = n / CHECK.length;
  $('#ringFg').style.strokeDashoffset = 327 * (1 - k);
  $('#ringFg').style.stroke = k === 1 ? '#3ddc97' : '';
  $('#ringPct').textContent = Math.round(k * 100) + '%';
  if (k === 1) toast(tr('All set. You\'re ready to apply!', 'كل شيء جاهز. يمكنك التقديم الآن!'));
});

// ---------- Lead form ----------
$('#lead').addEventListener('submit', e => {
  e.preventDefault();
  const fm = e.target;
  fm.innerHTML = `<div style="padding:20px 0"><h3 style="font:400 40px/1 var(--serif)">${tr(`Thanks, ${fm.name.value.split(' ')[0]}.`, `شكراً يا ${fm.name.value.split(' ')[0]}.`)}</h3><p class="muted">${tr('A specialist will WhatsApp you within 30 minutes.', 'سيتواصل معك مختص عبر واتساب خلال 30 دقيقة.')}</p></div>`;
});

// ---------- Smooth motion ----------
smooth();
revealHeadings('.hero h1', { immediate: true });
revealHeadings('h2');
rise('.vtabs button, .list li, .lead-form > *');
if (!reduced) {
  gsap.from('.hero .eyebrow, .lead, .checker', { y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: .1, delay: .4 });
  gsap.from('.hero__globe', { scale: .8, autoAlpha: 0, duration: 1.6, ease: 'expo.out', delay: .1 });
  gsap.to('.hero__globe', { yPercent: 14, scale: .92, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  // Destinations: pin the section and scroll the postcards sideways (desktop)
  gsap.matchMedia().add('(min-width: 981px)', () => {
    const r = $('#rail');
    r.classList.add('is-pinned');
    const dist = () => r.scrollWidth - innerWidth;
    const tw = gsap.to(r, { x: () => (document.documentElement.dir === 'rtl' ? dist() : -dist()), ease: 'none', scrollTrigger: { trigger: '.dest', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
    gsap.utils.toArray('.pc__bg img').forEach(img => gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: img.closest('.pc'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
    return () => r.classList.remove('is-pinned');
  });
  gsap.fromTo('.contact__card', { clipPath: 'inset(10% 6% round 36px)' }, { clipPath: 'inset(0% 0% round 36px)', ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 90%', end: 'top 30%', scrub: true } });
}

// ---------- Language (EN / Arabic) ----------
const lang = i18n({ key: 'atlas-lang', mount: $('#head'), before: $('#head > .btn'), dict: DICT, onChange: l => {
  L = l;
  paintPills(); paintSelects(); showResult(); paintMarquee(); paintCards(); paintVtabs(); vt(vcur); paintList();
  ScrollTrigger.refresh();
} });
lang.start();
