import { demobar } from '../../src/demo/demobar.js';
import { createGlobe } from './globe.js';
import LAND from './land.js';
import { HOME, DEST, NATIONS, FREE, TYPES, CHECK } from './data.js';

demobar({ name: 'Atlas — travel & visa agency theme', buy: '/store/website-themes/atlas-travel/', start: 'web' });

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let toastT;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600); };

// ---------- Globe + city pills ----------
const globe = createGlobe($('#globe'), { dots: LAND, home: HOME, dests: DEST });
$('#pills').innerHTML = DEST.slice(0, 6).map(d => `<button type="button" data-d="${d.id}">${d.city}</button>`).join('');
$('#pills').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (b) pick(b.dataset.d, true); });

// ---------- Visa checker ----------
$('#nation').innerHTML = NATIONS.map(n => `<option>${n}</option>`).join('');
const destOpts = DEST.map(d => `<option value="${d.id}">${d.country}</option>`).join('');
$('#dest').innerHTML = destOpts;
$('#leadDest').innerHTML = `<option value="">Where are you going?</option>` + destOpts;
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
    <p class="tag">${d.city}, ${d.country} ${free ? '<i class="free">No visa needed</i>' : `<i>${d.visa}</i>`}</p>
    <div><span>Processing</span><b>${free ? 'Not required' : d.days}</b></div>
    <div><span>Documents</span><b>${free ? 'Passport only' : d.docs + ' items'}</b></div>
    <div><span>Service from</span><b>${free ? '—' : 'AED ' + d.from}</b></div>
    <a href="#contact" class="btn btn--amber" data-apply="${d.id}">${free ? 'Plan the trip' : 'Start application'}</a>
    <p class="demo">Sample information for this demo. ${d.note}.</p>
  </div>`;
}
$('#nation').addEventListener('change', showResult);
$('#dest').addEventListener('change', e => pick(e.target.value));
document.addEventListener('click', e => { const a = e.target.closest('[data-apply]'); if (a) $('#leadDest').value = a.dataset.apply; });
pick('uk');

// ---------- Marquee ----------
const HL = ['12,400+ visas processed', '98% approval rate', '60+ countries', 'Reply in 30 minutes', 'Documents checked by specialists', 'Passport pick-up & drop-off', 'Open 7 days'];
$('#marquee').innerHTML = [...HL, ...HL].map(h => `<span>${h}</span>`).join('');

// ---------- Postcards (generated art, 3D tilt) ----------
function postcard(d, i) {
  const [h1, h2] = d.hue;
  let seed = i * 97 + 13; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const hill = (y, amp, col) => { let p = `M0 ${y}`; for (let x = 0; x <= 300; x += 30) p += ` Q${x + 15} ${y - amp * r()} ${x + 30} ${y - amp * .3 * r()}`; return `<path d="${p} V240 H0Z" fill="${col}"/>`; };
  let sky = ''; for (let k = 0; k < 14; k++) { const w = 10 + r() * 16, hgt = 30 + r() * 80, x = 20 + k * 19; sky += `<rect x="${x}" y="${170 - hgt}" width="${w}" height="${hgt + 10}" rx="2" fill="hsl(${h1} 45% 22% / .55)"/>`; }
  return `<article class="pc" tabindex="0" data-pc="${d.id}">
    <div class="pc__bg" style="background:linear-gradient(170deg,hsl(${h1} 70% 62%),hsl(${h2} 80% 66%))">
      <span class="pc__sun"></span>
      <svg class="pc__hills" viewBox="0 0 300 240" preserveAspectRatio="none" aria-hidden="true">${sky}${hill(150, 40, `hsl(${h1} 45% 38% / .65)`)}${hill(185, 30, `hsl(${h1} 50% 24% / .8)`)}${hill(215, 20, `hsl(${h1} 55% 14%)`)}</svg>
    </div>
    <span class="pc__code">${d.code}</span>
    <div class="pc__body"><h3>${d.city}</h3><p>${d.country} · ${d.visa}</p>
      <div class="pc__row"><span>${d.days}</span><b>from AED ${d.from}</b></div></div>
    <span class="pc__glare"></span>
  </article>`;
}
const rail = $('#rail');
rail.innerHTML = DEST.map(postcard).join('');
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
$('#vtabs').innerHTML = TYPES.map(([n, d], i) => `<button type="button" role="tab" class="${i ? '' : 'is-on'}" data-t="${i}">${n} <span>${d.split(',')[0]}</span></button>`).join('');
function vt(i) {
  const [n, d, docs] = TYPES[i];
  $$('#vtabs button').forEach(b => b.classList.toggle('is-on', +b.dataset.t === i));
  $('#vpanel').innerHTML = `<p class="eyebrow">${n} visa</p><h3>${d}</h3><ul>${docs.map(x => `<li>${x}</li>`).join('')}</ul><a href="#contact" class="btn">Get a ${n.toLowerCase()} visa quote</a>`;
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
$('#list').addEventListener('change', () => {
  const n = $$('#list input:checked').length, k = n / CHECK.length;
  $('#ringFg').style.strokeDashoffset = 327 * (1 - k);
  $('#ringFg').style.stroke = k === 1 ? '#3ddc97' : '';
  $('#ringPct').textContent = Math.round(k * 100) + '%';
  if (k === 1) toast('All set. You\'re ready to apply!');
});

// ---------- Lead form ----------
$('#lead').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  f.innerHTML = `<div style="padding:20px 0"><h3 style="font:400 40px/1 var(--serif)">Thanks, ${f.name.value.split(' ')[0]}.</h3><p class="muted">A specialist will WhatsApp you within 30 minutes.</p></div>`;
});
