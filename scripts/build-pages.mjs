// Builds the service and store pages from src/data.js, and refreshes the homepage tiles.
// Shared chrome (head, icon sprite, nav, footer, cart, toast) is taken from index.html so every page stays in sync.
// Runs automatically before `npm run dev` and `npm run build`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SERVICES, STORE, PRODUCTS } from '../src/data.js';
import { FAQ_GROUPS } from '../src/faq.js';

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

// Cover slot: a slideshow when `media` is a list, one image/video when it's a path, otherwise the engraved placeholder.
const SLIDE_NAMES = ['Overview', 'Features', 'Examples', 'How it works'];
const srcset = src => (/\.webp$/i.test(src) ? ` srcset="${src.replace(/\.webp$/i, '-800.webp')} 800w, ${src} 1376w" sizes="(min-width: 1024px) 50vw, 100vw"` : '');
function slide(src, alt, active) {
  if (/\.(mp4|webm)$/i.test(src)) return `<video class="mt-slide${active ? ' is-active' : ''}" src="${src}" autoplay muted loop playsinline aria-label="${esc(alt)}"></video>`;
  return `<img class="mt-slide${active ? ' is-active' : ''}" src="${src}"${srcset(src)} alt="${esc(alt)}" loading="lazy" decoding="async" />`;
}
function media(src, icon, label, extra = '', { name = '', controls = false } = {}) {
  const list = Array.isArray(src) ? src : (src ? [src] : []);
  if (!list.length) return `<div class="mt-media ${extra}" data-media="">${ico(icon, 'ico')}<span class="mt-media__label">${label}</span></div>`;
  const imgs = list.map((s, i) => slide(s, `${name} ${SLIDE_NAMES[i] || ''}`.trim(), i === 0)).join('');
  if (list.length === 1) return `<div class="mt-media ${extra}">${imgs}</div>`;
  const dots = list.map((_, i) => controls
    ? `<button type="button" data-dot aria-label="Show slide ${i + 1}" aria-current="${i === 0}"></button>`
    : `<span data-dot aria-hidden="true" aria-current="${i === 0}"></span>`).join('');
  const arrows = controls
    ? `<button type="button" class="mt-slides__arrow mt-slides__arrow--prev" data-prev aria-label="Previous slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5"/></svg></button><button type="button" class="mt-slides__arrow mt-slides__arrow--next" data-next aria-label="Next slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5L16 12l-6.5 6.5"/></svg></button>`
    : '';
  return `<div class="mt-media mt-slides ${extra}" data-slides>${imgs}${arrows}<div class="mt-slides__dots">${dots}</div></div>`;
}

function tiles(items, base, label) {
  // A card, not one big link: the slideshow arrows/dots are real buttons, and the title link
  // stretches over the rest of the card so clicking anywhere else still opens the page.
  return items.map((it, i) => `
          <article class="mt-tile mt-plate mt-lift p-4 flex flex-col gap-4 ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}">
            ${media(it.media, it.icon, label, '', { name: it.name, controls: true })}
            <div class="px-2 pb-2 space-y-2">
              <div class="flex items-center justify-between">
                <span class="mt-label text-industrialLime">${String(i + 1).padStart(2, '0')}</span>
                <span class="mt-tile__arrow" aria-hidden="true">→</span>
              </div>
              <h3 class="font-display font-bold text-xl text-softWhite"><a href="${base}/${it.slug}/" class="mt-tile__link">${esc(it.name)}</a></h3>
              <p class="text-sm text-softWhite/70">${esc(it.card)}</p>
            </div>
          </article>`).join('');
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
function page({ title, desc, route, body, extra = '', head = '' }) {
  const navActive = nav.replace(`data-route="${route}" class="nav-item"`, `data-route="${route}" class="nav-item active"`);
  return `${headBase.replace('__TITLE__', esc(title)).replace('__DESC__', esc(desc)).replace('</head>', head ? `${head}
</head>` : '</head>')}
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
          ${media(s.media, s.icon, 'Cover soon', '!rounded-none !shadow-none !border-0', { name: s.name, controls: true })}
        </div>
      </div>
    </section>

${s.demos ? `
    <section class="py-16 border-b border-softWhite/10">
      <span class="mt-label text-industrialLime block mb-3">Live demos</span>
      <h2 class="mt-h2 text-3xl sm:text-4xl text-softWhite mb-8">Try one before you talk to us.</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${s.demos.map(([n, t, href, img]) => `
        <article class="mt-tile mt-plate mt-lift p-4 flex flex-col gap-4">
          <div class="mt-media"><img src="${img}" alt="${esc(n)} demo" loading="lazy" decoding="async" /><span class="mt-badge">Live demo</span></div>
          <div class="px-2 pb-2 flex items-center justify-between gap-4">
            <div><h3 class="font-display font-bold text-xl text-softWhite"><a href="${href}" target="_blank" rel="noopener" class="mt-tile__link">${esc(n)}</a></h3><p class="text-sm text-softWhite/70">${esc(t)}</p></div>
            <span class="mt-tile__arrow" aria-hidden="true">↗</span>
          </div>
        </article>`).join('')}
      </div>
    </section>` : ''}
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
const SITE = 'https://grittech.io';
const priceText = p => (p.price === 0 ? 'Free' : `$${p.price}`);
const catBy = key => STORE.find(c => c.cat === key);
const productHref = p => `/store/${catBy(p.cat).slug}/${p.id}/`;

const HOW = [
  ['Preview it live', 'Open the live demo and click around before you buy. What you see is what you get.'],
  ['Check out once', 'Pay once, no subscription. Your files are in your account straight away.'],
  ['Make it yours', 'Swap in your logo, colours and content with the setup guide, then publish.'],
];
const FAQ = [
  ['Is this a one-time payment?', 'Yes. You pay once and keep the files, including every update to that product.'],
  ['Can I use it commercially?', 'Yes. You get full access and full commercial rights: use it for your business, your clients and anything you sell. Just don\'t resell the files themselves.'],
  ['Do I need to know how to code?', 'Themes come with a step-by-step setup guide. If you\'d rather not touch code, we can set it up for you as a service.'],
  ['What if something doesn\'t work?', 'Email orders@grittech.io and a real person will help you fix it.'],
  ['Can you customise it for my business?', 'Yes. Every theme can be tailored by our team. Start a project and tell us what you need.'],
];

const howItWorks = `
    <section class="py-12 border-t border-softWhite/10">
      <span class="mt-label text-industrialLime block mb-6">How it works</span>
      <ol class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${HOW.map(([n, t], i) => `
        <li class="mt-row !items-start">
          <span class="mt-key !w-11 shrink-0 font-mono text-xs font-bold text-industrialLime">${String(i + 1).padStart(2, '0')}</span>
          <div><h3 class="font-display font-bold text-base text-softWhite">${esc(n)}</h3><p class="text-sm text-softWhite/70">${esc(t)}</p></div>
        </li>`).join('')}
      </ol>
    </section>`;

const faq = `
    <section class="py-12 border-t border-softWhite/10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-4 space-y-3">
        <span class="mt-label text-industrialLime block">Questions</span>
        <h2 class="mt-h2 text-3xl text-softWhite">Before you buy.</h2>
        <p class="text-sm text-softWhite/70">Read the full <a href="/licence/" class="text-industrialLime hover:text-softWhite">licence</a> or email <a href="mailto:orders@grittech.io" class="hover:text-softWhite">orders@grittech.io</a>.</p>
      </div>
      <div class="lg:col-span-8 space-y-3">
        ${FAQ.map(([q, a]) => `
        <details class="mt-faq mt-well p-5"><summary class="font-display font-bold text-softWhite">${esc(q)}</summary><p class="text-sm text-softWhite/70 pt-3">${esc(a)}</p></details>`).join('')}
      </div>
    </section>`;

const includes = `
    <section class="py-12 border-t border-softWhite/10">
      <span class="mt-label text-industrialLime block mb-6">Every purchase includes</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="mt-well p-5 space-y-2"><span class="mt-key !w-11 text-industrialLime">${ico('i-down')}</span><h3 class="font-display font-bold text-softWhite">Instant download</h3><p class="text-sm text-softWhite/70">Files are in your account right after checkout.</p></div>
        <div class="mt-well p-5 space-y-2"><span class="mt-key !w-11 text-industrialLime">${ico('i-file')}</span><h3 class="font-display font-bold text-softWhite">Commercial rights</h3><p class="text-sm text-softWhite/70">Full access, use it for anything. <a href="/licence/" class="text-industrialLime hover:text-softWhite">Read it</a></p></div>
        <div class="mt-well p-5 space-y-2"><span class="mt-key !w-11 text-industrialLime">${ico('i-auto')}</span><h3 class="font-display font-bold text-softWhite">Free updates</h3><p class="text-sm text-softWhite/70">Download new versions any time.</p></div>
        <div class="mt-well p-5 space-y-2"><span class="mt-key !w-11 text-industrialLime">${ico('i-mail')}</span><h3 class="font-display font-bold text-softWhite">Real support</h3><p class="text-sm text-softWhite/70"><a href="mailto:orders@grittech.io" class="hover:text-softWhite">orders@grittech.io</a></p></div>
      </div>
    </section>`;

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
      <div class="lg:col-span-6">${media(c.media, c.icon, 'Preview soon', '', { name: c.name, controls: true })}</div>
    </section>

    <section class="py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside class="lg:col-span-3" aria-label="Filters">
        <details class="mt-plate p-5 lg:sticky lg:top-24 group" open>
          <summary class="flex items-center justify-between cursor-pointer list-none lg:pointer-events-none">
            <span class="mt-label text-industrialLime">Filter</span>
            <button type="button" id="store-clear" class="hidden font-mono text-[11px] uppercase tracking-wider text-industrialSage hover:text-softWhite lg:pointer-events-auto">Clear all</button>
          </summary>
          <div id="store-filters" class="space-y-6 pt-5"></div>
        </details>
      </aside>
      <div class="lg:col-span-9">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <p id="product-count" class="font-mono text-xs uppercase tracking-wider text-industrialSage"></p>
          <div class="flex flex-col sm:flex-row gap-3 sm:w-auto w-full">
            <label for="store-search" class="sr-only">Search ${esc(c.name)}</label>
            <input type="search" id="store-search" placeholder="Search name, tag or format…" class="mt-input font-mono text-xs sm:w-64" />
            <label for="store-sort" class="sr-only">Sort</label>
            <select id="store-sort" class="mt-input font-mono text-xs sm:w-48">
              <option value="featured">Featured</option>
              <option value="popular">Most popular</option>
              <option value="newest">Newest</option>
              <option value="az">A to Z</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>
        <div id="product-grid" data-cat="${c.cat}" class="grid grid-cols-1 md:grid-cols-2 gap-7"></div>

        <div class="mt-row justify-between flex-col sm:flex-row items-start sm:items-center mt-10">
          <div><h2 class="font-display font-bold text-base text-softWhite">More ${esc(c.name.toLowerCase())} are on the way.</h2><p class="text-sm text-softWhite/70">Create a free account and we'll tell you when new ones land.</p></div>
          <a href="/account/?mode=signup" class="mt-btn mt-btn--sm shrink-0">Get Notified →</a>
        </div>
      </div>
    </section>
${howItWorks}
${includes}
${faq}

    <section class="pt-10">
      <span class="mt-label block mb-4">More in the store</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${miniTiles(STORE, '/store', c.slug)}
      </div>
    </section>`;
  const items = PRODUCTS.filter(p => p.cat === c.cat);
  const ld = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${c.name} — GRIT Store`, url: `${SITE}/store/${c.slug}/`,
    hasPart: items.map(p => ({ '@type': 'Product', name: p.title, url: SITE + productHref(p) })) };
  mkdirSync(`store/${c.slug}`, { recursive: true });
  writeFileSync(`store/${c.slug}/index.html`, page({ title: `${c.name} — GRIT Store`, desc: c.tagline, route: 'store', body,
    head: `  <link rel="canonical" href="${SITE}/store/${c.slug}/" />\n  <script type="application/ld+json">${JSON.stringify(ld)}</script>` }));
}

// --- Product pages --------------------------------------------------------
const tagLinks = (p, key, param) => (p[key] || []).map(v => `<a href="/store/${catBy(p.cat).slug}/?${param}=${encodeURIComponent(v)}" class="mt-tag">${esc(v)}</a>`).join('');
function related(p) {
  const score = q => (q.cat === p.cat ? 2 : 0) + (q.tags || []).filter(t => (p.tags || []).includes(t)).length;
  return PRODUCTS.filter(q => q.id !== p.id).sort((a, b) => score(b) - score(a)).slice(0, 3);
}
for (const p of PRODUCTS) {
  const c = catBy(p.cat);
  const badge = p.badge || (p.price === 0 ? 'Free' : '');
  const buy = p.price === 0
    ? `<a href="/account/?mode=signup&tab=academy" class="mt-btn mt-btn--primary">Download Free →</a>`
    : `<button type="button" data-add="${p.id}" class="mt-btn mt-btn--primary">Add to Cart — ${priceText(p)}</button>`;
  const meta = [
    ['Category', `<a href="/store/${c.slug}/" class="hover:text-industrialLime">${esc(c.name)}</a>`],
    ['Formats', esc((p.formats || []).join(', '))],
    ['Works with', esc(p.compatibility)],
    ...(p.version ? [['Version', esc(p.version)]] : []),
    ['Updated', new Date(p.added + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })],
    ['Made by', 'GRIT Technologies'],
    ['Licence', `<a href="/licence/" class="hover:text-industrialLime">Full access + commercial rights</a>`],
  ];
  const body = `
    <nav class="font-mono text-[11px] uppercase tracking-wider text-industrialSage mb-8" aria-label="Breadcrumb">
      <a href="/" class="hover:text-softWhite">Home</a> <span class="mx-2">/</span>
      <a href="/#store" class="hover:text-softWhite">Store</a> <span class="mx-2">/</span>
      <a href="/store/${c.slug}/" class="hover:text-softWhite">${esc(c.name)}</a> <span class="mx-2">/</span>
      <span class="text-industrialLime">${esc(p.title)}</span>
    </nav>

    <section class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-16 border-b border-softWhite/10">
      <div class="lg:col-span-7">
        <div class="mt-window">
          <div class="mt-window__bar"><i></i><i></i><i></i><span class="font-mono text-[11px] text-industrialSage ml-2">${esc(p.demo ? 'grittech.io' + p.demo : p.title)}</span></div>
          ${media(p.media, c.icon, 'Preview soon', '!rounded-none !shadow-none !border-0', { name: p.title, controls: true })}
        </div>
      </div>
      <div class="lg:col-span-5 space-y-6">
        <div class="flex flex-wrap items-center gap-2">
          <span class="mt-pill">${ico(c.icon, 'ico text-industrialLime')}${esc(c.name)}</span>
          ${badge ? `<span class="mt-pill mt-pill--accent"><span class="mt-pill__dot"></span>${esc(badge)}</span>` : ''}
        </div>
        <h1 class="mt-h1 text-4xl sm:text-5xl text-softWhite">${esc(p.title)}</h1>
        <p class="text-lg text-softWhite/75">${esc(p.summary)}</p>
        <div class="flex items-baseline gap-3">
          <span class="font-display font-bold text-4xl ${p.price === 0 ? 'text-industrialLime' : 'text-softWhite'}">${priceText(p)}</span>
          <span class="font-mono text-[11px] uppercase tracking-wider text-industrialSage">${p.price === 0 ? 'with a free account' : 'one-time · USD'}</span>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          ${buy}
          ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="mt-btn">Live Demo ↗</a>` : ''}
        </div>
        <dl class="mt-well p-5 grid grid-cols-[auto,1fr] gap-x-6 gap-y-2.5 text-sm">
          ${meta.map(([k, v]) => `<dt class="mt-label">${k}</dt><dd class="text-softWhite/85">${v}</dd>`).join('')}
        </dl>
        <div class="flex flex-wrap gap-1.5">${tagLinks(p, 'tags', 'tag')}</div>
      </div>
    </section>

    <section class="py-16 border-b border-softWhite/10 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div class="lg:col-span-7 space-y-4">
        <span class="mt-label text-industrialLime block">About this ${esc(c.name.toLowerCase().replace(/s$/, ''))}</span>
        <h2 class="mt-h2 text-2xl sm:text-3xl text-softWhite">${esc(p.seo || p.title)}</h2>
        <p class="text-base text-softWhite/75 leading-relaxed">${esc(p.about || p.summary)}</p>
        ${p.notes ? `<ul class="space-y-2 pt-2 text-sm text-softWhite/70">${p.notes.map(n => `<li class="flex items-center gap-3">${ico('i-check', 'ico text-industrialSage')}${esc(n)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="lg:col-span-5 mt-plate p-7 space-y-4 self-start">
        <span class="mt-label text-industrialLime block">What's included</span>
        <ul class="space-y-2.5 text-sm text-softWhite/85">${p.features.map(f => `<li class="flex items-center gap-3">${ico('i-check', 'ico text-industrialLime')}${esc(f)}</li>`).join('')}</ul>
        <div class="pt-3 border-t border-softWhite/10 flex flex-wrap gap-1.5">${tagLinks(p, 'formats', 'format')}</div>
      </div>
    </section>
${includes}
${faq}

    <section class="pt-10">
      <span class="mt-label block mb-4">You might also like</span>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${related(p).map(q => `
        <a href="${productHref(q)}" class="mt-row mt-lift">
          <span class="mt-key !w-11 shrink-0 text-industrialLime">${ico(catBy(q.cat).icon)}</span>
          <span><span class="font-display font-bold text-softWhite block">${esc(q.title)}</span><span class="font-mono text-[11px] text-industrialSage">${priceText(q)} · ${esc(catBy(q.cat).name)}</span></span>
          <span class="ml-auto mt-tile__arrow" aria-hidden="true">→</span>
        </a>`).join('')}
      </div>
    </section>`;
  const url = SITE + productHref(p);
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: p.title, description: p.about || p.summary, url,
    category: c.name, brand: { '@type': 'Brand', name: 'GRIT Technologies' }, keywords: (p.tags || []).join(', '),
    ...(p.media?.[0] ? { image: SITE + p.media[0] } : {}),
    offers: { '@type': 'Offer', price: String(p.price), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url } };
  const og = [['og:type', 'product'], ['og:title', p.seo || p.title], ['og:description', p.summary], ['og:url', url], ...(p.media?.[0] ? [['og:image', SITE + p.media[0]]] : [])]
    .map(([k, v]) => `  <meta property="${k}" content="${esc(v)}" />`).join('\n');
  mkdirSync(`store/${c.slug}/${p.id}`, { recursive: true });
  writeFileSync(`store/${c.slug}/${p.id}/index.html`, page({ title: `${p.seo || p.title} — GRIT Store`, desc: p.about || p.summary, route: 'store', body,
    head: `  <link rel="canonical" href="${url}" />\n${og}\n  <script type="application/ld+json">${JSON.stringify(ld)}</script>` }));
}

// --- Licence page ---------------------------------------------------------
const LICENCE = [
  ['Full access', ['Every file in the download is yours, source included.', 'Use it in unlimited projects.', 'Change anything you like.']],
  ['Commercial rights', ['Use it for your business or your clients.', 'Sell the websites, apps and designs you build with it.', 'No attribution needed.']],
  ['One rule', ['Don\'t resell or share the files themselves as a template, kit or download.']],
];
mkdirSync('licence', { recursive: true });
writeFileSync('licence/index.html', page({ title: 'Licence — GRIT Store', desc: 'Full access and commercial rights on every GRIT store product.', route: 'store', body: `${crumb('Store', '/#store', 'Licence')}
    <section class="max-w-3xl space-y-6 pb-12">
      <h1 class="mt-h1 text-4xl sm:text-5xl text-softWhite">One simple licence.</h1>
      <p class="text-lg text-softWhite/75">We build everything in the GRIT store ourselves, so once you buy, you get full access and full commercial rights. Pay once, use it forever.</p>
    </section>
    <section class="grid grid-cols-1 md:grid-cols-3 gap-5 pb-12">
      ${LICENCE.map(([h, items]) => `
      <div class="mt-plate p-7 space-y-4">
        <span class="mt-label text-industrialLime block">${esc(h)}</span>
        <ul class="space-y-2.5 text-sm text-softWhite/85">${items.map(x => `<li class="flex gap-3">${ico('i-check', 'ico text-industrialLime shrink-0 mt-0.5')}${esc(x)}</li>`).join('')}</ul>
      </div>`).join('')}
    </section>
    <p class="font-mono text-xs text-industrialSage">GRIT Technologies FZE LLC · Questions: <a href="mailto:orders@grittech.io" class="hover:text-softWhite">orders@grittech.io</a></p>` }));

// --- UI Library gallery ---------------------------------------------------
{
  const body = `
    <nav class="font-mono text-[11px] uppercase tracking-wider text-industrialSage mb-8" aria-label="Breadcrumb">
      <a href="/" class="hover:text-softWhite">Home</a> <span class="mx-2">/</span>
      <a href="/store/ui-elements/" class="hover:text-softWhite">UI Elements</a> <span class="mx-2">/</span>
      <span class="text-industrialLime">Library</span>
    </nav>
    <section class="max-w-3xl space-y-5 pb-10">
      <span class="mt-pill">${ico('i-grid', 'ico text-industrialLime')}GRIT UI Library</span>
      <h1 class="mt-h1 text-4xl sm:text-6xl text-softWhite">Interactive UI, ready to paste.</h1>
      <p class="text-lg text-softWhite/75">Buttons, cards, pickers and calculators for real industries. Everything below is live: play with it, then copy self-contained HTML, CSS and JavaScript.</p>
    </section>
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
      <div id="ui-filters" class="flex flex-wrap gap-2"></div>
      <div class="flex items-center gap-3">
        <span id="ui-count" class="font-mono text-xs uppercase tracking-wider text-industrialSage whitespace-nowrap"></span>
        <input type="search" id="ui-search" placeholder="Search elements…" class="mt-input font-mono text-xs sm:w-64" aria-label="Search elements" />
      </div>
    </div>
    <div id="ui-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"></div>
    <section class="mt-16 mt-row justify-between flex-col sm:flex-row items-start sm:items-center">
      <div><h2 class="font-display font-bold text-base text-softWhite">Need a custom element for your brand?</h2><p class="text-sm text-softWhite/70">We design and build interactive UI for websites and apps.</p></div>
      <a href="/?start=web" class="mt-btn mt-btn--sm shrink-0">Start a Project →</a>
    </section>`;
  mkdirSync('store/ui-elements/library', { recursive: true });
  writeFileSync('store/ui-elements/library/index.html', page({
    title: 'GRIT UI Library: Interactive UI Elements by Industry — Copy-Paste HTML, CSS & JS',
    desc: 'Live, interactive UI elements for restaurants, real estate, fashion, travel, salons and fitness. Copy self-contained HTML, CSS and JavaScript with one click.',
    route: 'store', body, extra: '  <script type="module" src="/src/ui-gallery.js"></script>',
    head: `  <link rel="canonical" href="${SITE}/store/ui-elements/library/" />` }));
}

// --- Guides & FAQ (SEO help centre) ---------------------------------------
{
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ_GROUPS.flatMap(g => g.qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))) };
  const body = `${crumb('Home', '/', 'Guides & FAQ').replace(/<a href="\/" class="hover:text-softWhite">Home<\/a> <span class="mx-2">\/<\/span>\s*/, '')}
    <section class="max-w-3xl space-y-6 pb-12 border-b border-softWhite/10">
      <span class="mt-pill">${ico('i-learn', 'ico text-industrialLime')}Guides &amp; FAQ</span>
      <h1 class="mt-h1 text-4xl sm:text-6xl text-softWhite">Websites, apps &amp; digital assets: your questions answered.</h1>
      <p class="text-lg text-softWhite/75">Straight answers on AI tools like ChatGPT, Claude and Google Antigravity, building a website or app in Dubai and the UAE, using AI in your business, making video ads, and finding themes, UI elements and 3D assets.</p>
      <nav class="flex flex-wrap gap-2" aria-label="Topics">
        ${FAQ_GROUPS.map(g => `<a href="#${g.id}" class="mt-tag">${esc(g.title)}</a>`).join('')}
      </nav>
    </section>
    ${FAQ_GROUPS.map(g => `
    <section id="${g.id}" class="py-14 border-b border-softWhite/10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-4 space-y-4">
        <h2 class="mt-h2 text-2xl sm:text-3xl text-softWhite lg:sticky lg:top-28">${esc(g.title)}</h2>
      </div>
      <div class="lg:col-span-8 space-y-3">
        ${g.qa.map(([q, a], i) => `
        <details class="mt-faq mt-well p-5"${i === 0 ? ' open' : ''}><summary><h3 class="font-display font-bold text-softWhite text-base">${esc(q)}</h3></summary><p class="text-sm sm:text-base text-softWhite/75 leading-relaxed pt-3">${esc(a)}</p></details>`).join('')}
        <a href="${g.more[0]}" class="inline-flex items-center gap-2 pt-3 font-mono text-[11px] uppercase tracking-wider text-industrialSage hover:text-industrialLime">${esc(g.more[1])} <span aria-hidden="true">→</span></a>
      </div>
    </section>`).join('')}

    <section class="pt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="mt-plate p-8 space-y-4">
        <span class="mt-label text-industrialLime block">Still have a question?</span>
        <p class="text-softWhite/80">Ask us directly. We usually reply the same day.</p>
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="/#contact" class="mt-btn mt-btn--primary">Ask a Question →</a>
          <a href="tel:+971545605512" class="mt-btn">+971 54 560 5512</a>
        </div>
      </div>
      <div class="mt-plate p-8 space-y-4">
        <span class="mt-label text-industrialLime block">Do it yourself</span>
        <p class="text-softWhite/80">Themes, UI elements and project files with full commercial rights.</p>
        <a href="/store/website-themes/" class="mt-btn self-start">Browse the Store →</a>
      </div>
    </section>`;
  mkdirSync('faq', { recursive: true });
  writeFileSync('faq/index.html', page({
    title: 'Web Design, App Development & 3D Assets FAQ: Dubai, UAE | GRIT Technologies',
    desc: 'AI tools like ChatGPT, Claude and Google Antigravity explained, plus how to create a website or app in Dubai and the UAE, use AI in your business, make video ads, and download website themes, UI elements and 3D assets. Clear answers from GRIT Technologies.',
    route: 'faq', body,
    head: `  <link rel="canonical" href="${SITE}/faq/" />\n  <meta property="og:title" content="Web Design, App Development &amp; 3D Assets FAQ: Dubai, UAE" />\n  <meta property="og:url" content="${SITE}/faq/" />\n  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>` }));
}

console.log(`build-pages: ${SERVICES.length} service pages, ${STORE.length} store pages, ${PRODUCTS.length} product pages, licence, FAQ, homepage tiles refreshed.`);
