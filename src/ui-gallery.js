// UI Library gallery: live previews in sandboxed frames, industry filters, search, copy/view code.
import { ELEMENTS } from './elements/batch1.js';

const $ = id => document.getElementById(id);
const grid = $('ui-grid');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const snippet = e => `<!-- ${e.name} · GRIT UI Library · grittech.io -->
<style>
${e.css}
</style>

${e.html}
${e.js ? `\n<script>\n${e.js}\n</script>\n` : ''}`;
const doc = e => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{height:100%;margin:0}body{display:grid;place-items:center;background:${e.stage};overflow:hidden;-webkit-font-smoothing:antialiased}${e.css}</style></head><body><div id="fit">${e.html}</div><script>${e.js}<\/script><script>(function(){var f=document.getElementById('fit');function k(){f.style.transform='';var r=f.getBoundingClientRect(),s=Math.min(1,(innerHeight-28)/r.height,(innerWidth-28)/r.width);f.style.transform='scale('+s+')';}addEventListener('resize',k);setTimeout(k,30);})();<\/script></body></html>`;

const industries = [...new Set(ELEMENTS.map(e => e.industry))];
let industry = new URLSearchParams(location.search).get('industry') || 'All', q = '';

$('ui-count').textContent = `${ELEMENTS.length} elements`;
$('ui-filters').innerHTML = ['All', ...industries].map(i => {
  const n = i === 'All' ? ELEMENTS.length : ELEMENTS.filter(e => e.industry === i).length;
  return `<button type="button" class="mt-pill ui-chip" data-ind="${i}" aria-pressed="${i === industry}">${i} <em>${n}</em></button>`;
}).join('');

const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const f = en.target; io.unobserve(f);
  f.srcdoc = doc(ELEMENTS.find(e => e.id === f.dataset.el));
}), { rootMargin: '300px' });

function render() {
  const list = ELEMENTS.filter(e => (industry === 'All' || e.industry === industry) && [e.name, e.desc, e.industry, ...e.tags].join(' ').toLowerCase().includes(q));
  grid.innerHTML = list.length ? list.map(e => `
    <article class="mt-plate p-3 flex flex-col gap-4 ui-card" id="${e.id}">
      <div class="ui-stage" style="background:${e.stage}">
        <iframe data-el="${e.id}" title="${e.name} live preview" sandbox="allow-scripts" loading="lazy"></iframe>
        <span class="mt-badge">${e.js ? 'Interactive' : 'CSS only'}</span>
      </div>
      <div class="px-2 space-y-2 flex-1">
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-display font-bold text-lg text-softWhite">${e.name}</h3>
          <span class="mt-tag">${e.industry}</span>
        </div>
        <p class="text-sm text-softWhite/70">${e.desc}</p>
        <div class="flex flex-wrap gap-1.5 pt-1">${e.tags.map(t => `<span class="font-mono text-[10px] uppercase tracking-wider text-industrialSage">#${t.replace(/\s+/g, '')}</span>`).join(' ')}</div>
      </div>
      <div class="flex gap-2 px-2 pb-2">
        <button type="button" class="mt-btn mt-btn--sm flex-1" data-view="${e.id}">View code</button>
        <button type="button" class="mt-btn mt-btn--primary mt-btn--sm flex-1" data-copy="${e.id}">Copy code</button>
      </div>
      <pre class="ui-code hidden" data-code="${e.id}"><code>${esc(snippet(e))}</code></pre>
    </article>`).join('')
    : `<div class="col-span-full mt-well p-10 text-center font-mono text-sm text-industrialSage">Nothing matches that yet.</div>`;
  grid.querySelectorAll('iframe').forEach(f => io.observe(f));
}

function toast(msg) {
  const box = $('toast-box'); if (!box) return;
  $('toast-message').textContent = msg; box.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => box.classList.add('hidden'), 2400);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select();
    const ok = document.execCommand('copy'); t.remove(); return ok;
  }
}

document.addEventListener('click', async e => {
  const chip = e.target.closest('[data-ind]');
  if (chip) {
    industry = chip.dataset.ind;
    document.querySelectorAll('[data-ind]').forEach(c => c.setAttribute('aria-pressed', c === chip));
    history.replaceState(null, '', industry === 'All' ? location.pathname : `?industry=${encodeURIComponent(industry)}`);
    render(); return;
  }
  const c = e.target.closest('[data-copy]');
  if (c) {
    const el = ELEMENTS.find(x => x.id === c.dataset.copy);
    if (await copy(snippet(el))) { c.textContent = 'Copied ✓'; toast(`${el.name} copied. Paste it into any HTML page.`); setTimeout(() => (c.textContent = 'Copy code'), 1800); }
    return;
  }
  const v = e.target.closest('[data-view]');
  if (v) { const pre = grid.querySelector(`[data-code="${v.dataset.view}"]`); const open = pre.classList.toggle('hidden'); v.textContent = open ? 'View code' : 'Hide code'; }
});
$('ui-search').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });
render();
