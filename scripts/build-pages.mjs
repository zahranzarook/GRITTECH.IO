// Builds the service and store pages from src/data.js, and refreshes the homepage tiles.
// Shared chrome (head, icon sprite, nav, footer, cart, toast) is taken from index.html so every page stays in sync.
// Runs automatically before `npm run dev` and `npm run build`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SERVICES, STORE } from '../src/data.js';

const HOME = 'index.html';
let home = readFileSync(HOME, 'utf8');

const grab = (re, what) => {
  const m = home.match(re);
  if (!m) throw new Error(`build-pages: could not find ${what} in index.html`);
  return m[0];
};
// Point in-page links at the homepage (only <a> tags; SVG <use href="#icon"> must stay as is).
const absolute = html => html.replace(/(<a\b[^>]*?\shref=")#/g, '$1/#');

const headBase = grab(/^[\s\S]*?<\/head>/, 'head')
  .replace(/<title>[\s\S]*?<\/title>/, '<title>__TITLE__</title>')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="__DESC__" />');
const sprite = grab(/ {2}<svg width="0" height="0"[\s\S]*?<\/svg>\n/, 'icon sprite');
const nav = absolute(grab(/ {2}<!-- =+\s+NAV[\s\S]*?(?=\n {2}<main>)/, 'nav'));
const footer = absolute(grab(/ {2}<footer[\s\S]*?<\/footer>/, 'footer'));
const cart = grab(/ {2}<!-- Cart -->[\s\S]*?(?=\n\n {2}<div id="toast-box")/, 'cart drawer');
const toast = grab(/ {2}<div id="toast-box"[\s\S]*?<\/div>\n {2}<\/div>|<div id="toast-box"[\s\S]*?<\/p>\n {2}<\/div>/, 'toast');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ico = (id, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"/></svg>`;

// Cover slot: an image or looping video when `media` is set, otherwise the engraved placeholder.
function media(src, icon, label, extra = '') {
  if (/\.(mp4|webm)$/i.test(src)) return `<div class="mt-media ${extra}"><video src="${src}" autoplay muted loop playsinline></video></div>`;
  if (src) return `<div class="mt-media ${extra}"><img src="${src}" alt="" loading="lazy" /></div>`;
  return `<div class="mt-media ${extra}" data-media="">${ico(icon, 'ico')}<span class="mt-media__label">${label}</span></div>`;
}

function tiles(items, base, label) {
  return items.map((it, i) => `
          <a href="${base}/${it.slug}/" class="mt-tile mt-plate mt-lift p-4 flex flex-col gap-4 ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}">
            ${media(it.media, it.icon, label)}
            <div class="px-2 pb-2 space-y-2">
              <div class="flex items-center justify-between">
                <span class="mt-label text-industrialLime">${String(i + 1).padStart(2, '0')}</span>
                <span class="mt-tile__arrow" aria-hidden="true">→</span>
              </div>
              <h3 class="font-display font-bold text-xl text-softWhite">${esc(it.name)}</h3>
              <p class="text-sm text-softWhite/70">${esc(it.card)}</p>
            </div>
          </a>`).join('');
}

function miniTiles(items, base, current) {
  return items.filter(it => it.slug !== current).map(it => `
        <a href="${base}/${it.slug}/" class="mt-row mt-lift">
          <span class="mt-key !w-11 shrink-0 text-industrialLime">${ico(it.icon)}</span>
          <span class="font-display font-bold text-softWhite">${esc(it.name)}</span>
          <span class="ml-auto mt-tile__arrow" aria-hidden="true">→</span>
        </a>`).join('');
}

// --- Homepage tiles -------------------------------------------------------
const region = (name, html) => {
  const re = new RegExp(`(<!-- @tiles:${name} -->)[\\s\\S]*?(\\s*<!-- /@tiles:${name} -->)`);
  if (!re.test(home)) throw new Error(`build-pages: missing @tiles:${name} markers in index.html`);
  home = home.replace(re, `$1${html}$2`);
};
region('services', tiles(SERVICES, '/services', 'Cover soon'));
region('store', tiles(STORE, '/store', 'Preview soon'));
writeFileSync(HOME, home);

// --- Page shell -----------------------------------------------------------
function page({ title, desc, route, body, extra = '' }) {
  const navActive = nav.replace(`data-route="${route}" class="nav-item"`, `data-route="${route}" class="nav-item active"`);
  return `${headBase.replace('__TITLE__', esc(title)).replace('__DESC__', esc(desc))}
<body class="selection:bg-industrialLime selection:text-obsidian">

${sprite}
${navActive}

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
${body}
  </main>

${footer}

${cart}
${extra}
${toast}

  <script type="module" src="/src/page.js"></script>
</body>
</html>
`;
}

const crumb = (section, href, name) => `
    <nav class="font-mono text-[11px] uppercase tracking-wider text-industrialSage mb-8" aria-label="Breadcrumb">
      <a href="/" class="hover:text-softWhite">Home</a> <span class="mx-2">/</span>
      <a href="${href}" class="hover:text-softWhite">${section}</a> <span class="mx-2">/</span>
      <span class="text-industrialLime">${esc(name)}</span>
    </nav>`;

// --- Service pages --------------------------------------------------------
for (const s of SERVICES) {
  const body = `${crumb('Services', '/#services', s.name)}

    <section class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-20 border-b border-softWhite/10">
      <div class="lg:col-span-6 space-y-6">
        <span class="mt-pill">${ico(s.icon, 'ico text-industrialLime')}${esc(s.name)}</span>
        <h1 class="mt-h1 text-4xl sm:text-6xl text-softWhite">${esc(s.title)}</h1>
        <p class="text-lg sm:text-xl text-softWhite/75 max-w-xl">${esc(s.tagline)}</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="/?start=${s.key}" class="mt-btn mt-btn--primary">Start a Project →</a>
          <a href="#approach" class="mt-btn">How We Work</a>
        </div>
      </div>
      <div class="lg:col-span-6">
        <div class="mt-window">
          <div class="mt-window__bar"><i></i><i></i><i></i><span class="font-mono text-[11px] text-industrialSage ml-2">${esc(s.name)}</span></div>
          ${media(s.media, s.icon, 'Cover soon', '!rounded-none !shadow-none !border-0')}
        </div>
      </div>
    </section>

    <section class="py-20 border-b border-softWhite/10">
      <span class="mt-label text-industrialLime block mb-3">What we build</span>
      <h2 class="mt-h2 text-3xl sm:text-4xl text-softWhite mb-10">Everything you need, built properly.</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${s.build.map(([ic, name, text]) => `
        <div class="mt-well p-6 space-y-3">
          <span class="mt-key !w-11 text-industrialLime">${ico(ic)}</span>
          <h3 class="font-display font-bold text-lg text-softWhite">${esc(name)}</h3>
          <p class="text-sm text-softWhite/70">${esc(text)}</p>
        </div>`).join('')}
      </div>
    </section>

    <section id="approach" class="py-20 border-b border-softWhite/10 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div class="lg:col-span-4 space-y-4">
        <span class="mt-label text-industrialLime block">How we approach it</span>
        <h2 class="mt-h2 text-3xl sm:text-4xl text-softWhite">Step by step, with you at every stage.</h2>
        <p class="text-softWhite/70">You always know what's happening next, and nothing goes live until you're happy.</p>
      </div>
      <ol class="lg:col-span-8 space-y-3">
        ${s.steps.map(([name, text], i) => `
        <li class="mt-row">
          <span class="mt-key !w-11 shrink-0 font-mono text-xs font-bold text-industrialLime">${String(i + 1).padStart(2, '0')}</span>
          <div><h3 class="font-display font-bold text-base text-softWhite">${esc(name)}</h3><p class="text-sm text-softWhite/70">${esc(text)}</p></div>
        </li>`).join('')}
      </ol>
    </section>

    <section class="py-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="mt-plate p-8 space-y-5">
        <span class="mt-label text-industrialLime block">Included</span>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-softWhite/85">
          ${s.included.map(x => `<li class="flex items-center gap-3">${ico('i-check', 'ico text-industrialLime')}${esc(x)}</li>`).join('')}
        </ul>
      </div>
      <div class="mt-plate p-8 space-y-5 flex flex-col">
        <span class="mt-label text-industrialLime block">Ideal for</span>
        <p class="text-lg text-softWhite/85 flex-1">${esc(s.idealFor)}</p>
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="/?start=${s.key}" class="mt-btn mt-btn--primary">Get a Free Quote →</a>
          <a href="tel:+971545605512" class="mt-btn">Call +971 54 560 5512</a>
        </div>
      </div>
    </section>

    <section class="pt-6">
      <span class="mt-label block mb-4">Other services</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${miniTiles(SERVICES, '/services', s.slug)}
      </div>
    </section>`;
  mkdirSync(`services/${s.slug}`, { recursive: true });
  writeFileSync(`services/${s.slug}/index.html`, page({ title: `${s.name} — GRIT Technologies`, desc: s.tagline, route: 'services', body }));
}

// --- Store pages ----------------------------------------------------------
const productModal = `
  <div id="product-modal" class="mt-modal hidden" role="dialog" aria-modal="true">
    <div id="product-modal-content" class="mt-plate max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"></div>
  </div>
`;

for (const c of STORE) {
  const body = `${crumb('Store', '/#store', c.name)}

    <section class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-16 border-b border-softWhite/10">
      <div class="lg:col-span-6 space-y-6">
        <span class="mt-pill">${ico(c.icon, 'ico text-industrialLime')}${esc(c.name)}</span>
        <h1 class="mt-h1 text-4xl sm:text-6xl text-softWhite">${esc(c.title)}</h1>
        <p class="text-lg sm:text-xl text-softWhite/75 max-w-xl">${esc(c.tagline)}</p>
        <ul class="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-industrialSage">
          ${c.perks.map(p => `<li class="flex items-center gap-2">${ico('i-check', 'ico text-industrialLime')}${esc(p)}</li>`).join('')}
        </ul>
      </div>
      <div class="lg:col-span-6">${media(c.media, c.icon, 'Preview soon')}</div>
    </section>

    <section class="py-12">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <p id="product-count" class="font-mono text-xs uppercase tracking-wider text-industrialSage"></p>
        <div class="flex flex-col sm:flex-row gap-3 sm:w-auto w-full">
          <label for="store-search" class="sr-only">Search ${esc(c.name)}</label>
          <input type="search" id="store-search" placeholder="Search ${esc(c.name.toLowerCase())}…" class="mt-input font-mono text-xs sm:w-64" />
          <label for="store-sort" class="sr-only">Sort</label>
          <select id="store-sort" class="mt-input font-mono text-xs sm:w-48">
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>
      </div>
      <div id="product-grid" data-cat="${c.cat}" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"></div>

      <div class="mt-row justify-between flex-col sm:flex-row items-start sm:items-center mt-10">
        <div><h2 class="font-display font-bold text-base text-softWhite">More ${esc(c.name.toLowerCase())} are on the way.</h2><p class="text-sm text-softWhite/70">Create a free account and we'll tell you when new ones land.</p></div>
        <a href="/account/?mode=signup" class="mt-btn mt-btn--sm shrink-0">Get Notified →</a>
      </div>
    </section>

    <section class="py-12 border-t border-softWhite/10">
      <span class="mt-label text-industrialLime block mb-6">Every purchase includes</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="mt-well p-5 space-y-2"><span class="mt-key !w-11 text-industrialLime">${ico('i-down')}</span><h3 class="font-display font-bold text-softWhite">Instant download</h3><p class="text-sm text-softWhite/70">Files are in your account right after checkout.</p></div>
        <div class="mt-well p-5 space-y-2"><span class="mt-key !w-11 text-industrialLime">${ico('i-file')}</span><h3 class="font-display font-bold text-softWhite">Clear licence</h3><p class="text-sm text-softWhite/70">Use it for yourself or for clients.</p></div>
        <div class="mt-well p-5 space-y-2"><span class="mt-key !w-11 text-industrialLime">${ico('i-auto')}</span><h3 class="font-display font-bold text-softWhite">Free updates</h3><p class="text-sm text-softWhite/70">Download new versions any time.</p></div>
        <div class="mt-well p-5 space-y-2"><span class="mt-key !w-11 text-industrialLime">${ico('i-mail')}</span><h3 class="font-display font-bold text-softWhite">Real support</h3><p class="text-sm text-softWhite/70"><a href="mailto:orders@grittech.io" class="hover:text-softWhite">orders@grittech.io</a></p></div>
      </div>
    </section>

    <section class="pt-10">
      <span class="mt-label block mb-4">More in the store</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${miniTiles(STORE, '/store', c.slug)}
      </div>
    </section>`;
  mkdirSync(`store/${c.slug}`, { recursive: true });
  writeFileSync(`store/${c.slug}/index.html`, page({ title: `${c.name} — GRIT Store`, desc: c.tagline, route: 'store', body, extra: productModal }));
}

console.log(`build-pages: ${SERVICES.length} service pages, ${STORE.length} store pages, homepage tiles refreshed.`);
