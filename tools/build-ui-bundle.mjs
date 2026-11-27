// Builds the GRIT UI Bundle download: every element, ready for every major platform.
//   node tools/build-ui-bundle.mjs            → downloads/grit-ui-bundle/ (+ Figma-ready SVG/PNG via tools/figma_export.py)
// Output is a paid download, so it goes to downloads/ (git-ignored, never deployed). This script is the versioned source.
//
// Per element (elements/<id>/):
//   index.html      standalone working page (open it in a browser)
//   embed.html      one paste-in block for WordPress, Webflow, Shopify, Wix, Framer, Squarespace
//   markup.html / style.css / script.js   the same code split into three files
//   <id>.js         Web Component <grit-<id>> for any framework or site builder
//   <Name>.jsx      React / Next.js component     <Name>.vue   Vue / Nuxt component
//   figma/          <id>.svg (editable layers) + <id>@2x.png (added by figma_export.py)
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from 'fs';
import { ELEMENTS } from '../src/elements/batch1.js';
import { ELEMENTS2 } from '../src/elements/batch2.js';
import { ELEMENTS3 } from '../src/elements/batch3.js';

const ALL = [...ELEMENTS3, ...ELEMENTS, ...ELEMENTS2];
const OUT = 'downloads/grit-ui-bundle';
const VERSION = new Date().toISOString().slice(0, 10);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/images`, { recursive: true });
mkdirSync(`${OUT}/elements`, { recursive: true });
mkdirSync(`${OUT}/vendor`, { recursive: true });

// ---------- libraries: GSAP + Lenis ship inside the bundle so pages work offline too ----------
const VENDOR = {
  'https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js': 'node_modules/gsap/dist/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/ScrollTrigger.min.js': 'node_modules/gsap/dist/ScrollTrigger.min.js',
  'https://cdn.jsdelivr.net/npm/lenis@1.3.29/dist/lenis.min.js': 'node_modules/lenis/dist/lenis.min.js',
};
for (const [, local] of Object.entries(VENDOR)) copyFileSync(local, `${OUT}/vendor/${local.split('/').pop()}`);
const vendorName = u => { if (!VENDOR[u]) throw new Error('Library not vendored: ' + u); return VENDOR[u].split('/').pop(); };

// ---------- images: every photo an element uses ships inside the bundle ----------
const IMG_RE = /https:\/\/grittech\.io\/(demo\/([a-z0-9-]+)\/img|media)\/([A-Za-z0-9._\/-]+\.(?:webp|jpg|jpeg|png|svg|mp4))/g;
const flat = (dir, file) => `${dir ? dir + '-' : ''}${file.replace(/\//g, '-')}`;
const images = new Map(); // url -> flat name
for (const e of ALL) for (const src of [e.html, e.css, e.js]) for (const m of (src || '').matchAll(IMG_RE)) {
  const name = flat(m[2], m[3]);
  images.set(m[0], name);
}
for (const [url, name] of images) {
  const local = 'public/' + url.replace('https://grittech.io/', '');
  if (!existsSync(local)) throw new Error('Missing image for bundle: ' + local);
  copyFileSync(local, `${OUT}/images/${name}`);
}
const withImages = (s, base) => (s || '').replace(IMG_RE, (u) => base + images.get(u));

const pascal = id => id.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const libTags = (e, local) => (e.libs || []).map(u => `<script src="${local ? local + vendorName(u) : u}"></script>`).join('\n');
const usesImages = e => IMG_RE.test([e.html, e.css, e.js].join('')) && !(IMG_RE.lastIndex = 0);
const head = (e, extra = '') => `<!-- ${e.name} · GRIT UI Bundle v${VERSION} · grittech.io
     ${e.desc}${extra} -->`;
const imgNote = '\n     Photos: upload the files from the bundle\'s /images folder to your site and keep (or update) the "images/" paths below.';

for (const e of ALL) {
  const dir = `${OUT}/elements/${e.id}`;
  mkdirSync(`${dir}/figma`, { recursive: true });
  const img = usesImages(e);
  const tag = `grit-${e.id}`;
  const Name = pascal(e.id);

  // 1) standalone page
  writeFileSync(`${dir}/index.html`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e.name} · GRIT UI</title>
${head(e)}
<style>html,body{margin:0;min-height:100%}body{${e.full ? '' : 'min-height:100vh;display:grid;place-items:center;'}background:${e.stage};-webkit-font-smoothing:antialiased}
${withImages(e.css, '../../images/')}</style>
${libTags(e, '../../vendor/')}
</head><body>
<div class="grit-root">${withImages(e.html, '../../images/')}</div>
<script>
${withImages(e.js, '../../images/')}
</script>
</body></html>
`);

  // 2) single paste-in block for site builders
  writeFileSync(`${dir}/embed.html`, `${head(e, img ? imgNote : '')}
<style>
${withImages(e.css, 'images/')}
</style>
${withImages(e.html, 'images/')}
${e.libs ? '<!-- Loads GSAP + Lenis from jsDelivr. To self-host, use the copies in the bundle\'s /vendor folder. -->\n' + libTags(e) + '\n' : ''}${e.js ? `<script>\n${withImages(e.js, 'images/')}\n</script>\n` : ''}`);

  // 3) split files
  writeFileSync(`${dir}/markup.html`, `${head(e, img ? imgNote : '')}\n${withImages(e.html, 'images/')}\n`);
  writeFileSync(`${dir}/style.css`, `/* ${e.name} · GRIT UI Bundle · grittech.io */\n${withImages(e.css, 'images/')}\n`);
  writeFileSync(`${dir}/script.js`, `// ${e.name} · GRIT UI Bundle · grittech.io${e.libs ? '\n// Needs: ' + e.libs.join(', ') : ''}\n${e.js || '// CSS only: no JavaScript needed.'}\n`.replace(IMG_RE, u => 'images/' + images.get(u)));

  // 4) Web Component: self-contained, scoped to its own instance, cleans up its timers.
  const ASSET = '__GRIT_ASSETS__';
  writeFileSync(`${dir}/${e.id}.js`, `// <${tag}> · ${e.name} · GRIT UI Bundle v${VERSION} · grittech.io
// Works in plain HTML, React, Next.js, Vue, Nuxt, Svelte, Angular, Astro, WordPress, Webflow, Shopify and more.
// Usage: <script type="module" src="${e.id}.js"></script>  then  <${tag}${img ? ' assets="/images/"' : ''}></${tag}>
${img ? '// assets = the folder where you put the bundle\'s /images files (default "images/").\n' : ''}${e.libs ? '// Loads GSAP + Lenis from jsDelivr. To self-host, add vendor="/vendor/" pointing at the bundle\'s /vendor files.\n' : ''}const CSS = ${JSON.stringify(withImages(e.css, ASSET))};
const HTML = ${JSON.stringify(withImages(e.html, ASSET))};
const LIBS = ${JSON.stringify(e.libs || [])};
function run(document, setTimeout, setInterval) {
${withImages(e.js, ASSET) || '  // CSS only'}
}
const loaded = {};
function lib(src) {
  return loaded[src] || (loaded[src] = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s);
  }));
}
class GritElement extends HTMLElement {
  async connectedCallback() {
    if (this._on) return; this._on = true;
    const base = this.getAttribute('assets') || 'images/';
    const fix = s => s.split('${ASSET}').join(base.endsWith('/') ? base : base + '/');
    if (!document.querySelector('style[data-grit="${e.id}"]')) {
      const st = document.createElement('style'); st.dataset.grit = '${e.id}'; st.textContent = fix(CSS); document.head.appendChild(st);
    }
    this.style.display = '${e.full ? 'block' : 'inline-block'}';
    this.innerHTML = fix(HTML);
    const vend = this.getAttribute('vendor');
    for (const src of LIBS) await lib(vend ? vend.replace(/[/]?$/, '/') + src.split('/').pop() : src);
    const root = this, timers = this._timers = [];
    const doc = new Proxy(document, { get(t, p) {
      if (p === 'querySelector' || p === 'querySelectorAll') return root[p].bind(root);
      if (p === 'getElementById') return id => root.querySelector('#' + CSS_ESC(id));
      const v = Reflect.get(t, p); return typeof v === 'function' ? v.bind(t) : v;
    } });
    const st = (f, ms) => { const id = setTimeout(f, ms); timers.push(['t', id]); return id; };
    const si = (f, ms) => { const id = setInterval(f, ms); timers.push(['i', id]); return id; };
    run(doc, st, si);
  }
  disconnectedCallback() {
    (this._timers || []).forEach(([k, id]) => (k === 'i' ? clearInterval(id) : clearTimeout(id)));
    this._on = false;
  }
}
const CSS_ESC = s => (window.CSS && CSS.escape ? CSS.escape(s) : s);
if (!customElements.get('${tag}')) customElements.define('${tag}', GritElement);
`);

  // 5) React / Next.js
  writeFileSync(`${dir}/${Name}.jsx`, `'use client';
// ${e.name} · GRIT UI Bundle · React 18+/19 and Next.js (App or Pages router)
// Copy this file and ${e.id}.js into your project, then: import ${Name} from './${Name}';  <${Name}${img ? ' assets="/images/"' : ''} />
import { useEffect } from 'react';

export default function ${Name}({ assets = '/images/', ...props }) {
  useEffect(() => { import('./${e.id}.js'); }, []);
  return <${tag} assets={assets} {...props} />;
}
`);

  // 6) Vue / Nuxt
  writeFileSync(`${dir}/${Name}.vue`, `<!-- ${e.name} · GRIT UI Bundle · Vue 3 and Nuxt 3
     Copy this file and ${e.id}.js into your project. In vite.config add:
     vue({ template: { compilerOptions: { isCustomElement: tag => tag.startsWith('grit-') } } }) -->
<script setup>
import { onMounted } from 'vue';
defineProps({ assets: { type: String, default: '/images/' } });
onMounted(() => import('./${e.id}.js'));
</script>

<template>
  <${tag} :assets="assets" />
</template>
`);
}

// ---------- local gallery to browse the bundle ----------
const groups = [...new Set(ALL.map(e => e.industry))];
writeFileSync(`${OUT}/index.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GRIT UI Bundle</title>
<style>body{margin:0;padding:40px 24px;background:#0f1012;color:#ecedf0;font:15px/1.5 system-ui,sans-serif}main{max-width:1000px;margin:auto}h1{margin:0 0 4px}p{color:#9a9ca3}h2{margin:32px 0 10px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#a3c96a}ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}a{display:block;padding:14px 16px;border-radius:12px;background:#17181b;border:1px solid #26282d;color:#fff;text-decoration:none}a:hover{border-color:#a3c96a}small{display:block;color:#8b8e96;margin-top:2px}</style></head>
<body><main><h1>GRIT UI Bundle</h1><p>${ALL.length} elements · v${VERSION} · open any element to see it working. Setup for each platform is in README.md.</p>
${groups.map(g => `<h2>${g}</h2><ul>${ALL.filter(e => e.industry === g).map(e => `<li><a href="elements/${e.id}/index.html">${e.name}<small>${e.desc}</small></a></li>`).join('')}</ul>`).join('\n')}
</main></body></html>
`);

// ---------- README ----------
writeFileSync(`${OUT}/README.md`, `# GRIT UI Bundle  ·  v${VERSION}

${ALL.length} interactive elements from grittech.io, ready for every major platform, and Figma-ready.
Open **index.html** to browse every element working in your browser.

## What's inside each element folder (\`elements/<name>/\`)

| File | Use it for |
|---|---|
| \`index.html\` | A complete working page. Open it to see the element. |
| \`embed.html\` | One block to paste into WordPress, Webflow, Shopify, Wix, Framer or Squarespace. |
| \`markup.html\`, \`style.css\`, \`script.js\` | The same code as three files for hand-coded sites. |
| \`<name>.js\` | Web Component (\`<grit-name>\`): works in any framework or site builder. |
| \`<Name>.jsx\` | React and Next.js component. |
| \`<Name>.vue\` | Vue and Nuxt component. |
| \`figma/<name>.svg\` | Figma-ready: drag the SVG into Figma to get editable layers. |
| \`figma/<name>@2x.png\` | Pixel-perfect design reference. |

Photos used by elements are in **/images**. Upload them with your site and keep the \`images/\` paths, or point them at your own photos.

## Platform setup

**Plain HTML / any static site**: copy \`embed.html\` into your page, or link \`style.css\` and \`script.js\` and paste \`markup.html\`.

**React / Next.js**: copy \`<Name>.jsx\` and \`<name>.js\` into your components folder, put the images in \`/public/images\`, then
\`\`\`jsx
import ShredderDelete from './components/ShredderDelete';
<ShredderDelete />
\`\`\`
The component is client-only ('use client'), so it is safe with the Next.js App Router.

**Vue / Nuxt**: copy \`<Name>.vue\` and \`<name>.js\`, and tell Vue that \`grit-\` tags are custom elements (see the comment at the top of the .vue file).

**Svelte / SvelteKit, Angular, Astro, Solid, Qwik**: import \`<name>.js\` once (client side) and use the tag:
\`\`\`html
<grit-shredder-delete></grit-shredder-delete>
\`\`\`
Angular: add \`CUSTOM_ELEMENTS_SCHEMA\` to your component. Astro: \`<script>import './shredder-delete.js'</script>\`.

**WordPress (Gutenberg, Elementor, Divi, Bricks)**: add a *Custom HTML* block (Elementor: *HTML* widget) and paste \`embed.html\`. Upload photos to the Media Library and replace the \`images/...\` paths with their URLs.

**Webflow**: add an *Embed* element and paste \`embed.html\`. Upload photos to Assets and update the paths.

**Shopify**: Online Store → Customize → *Custom Liquid* section, paste \`embed.html\`. Upload photos under Content → Files.

**Wix**: *Embed Code → Embed HTML*, paste \`index.html\` with images uploaded and paths updated.

**Framer**: *Embed* component → HTML, paste \`embed.html\`.

**Squarespace**: *Code* block, paste \`embed.html\`.

**Figma**: drag \`figma/<name>.svg\` onto the canvas. Text, shapes, colours, gradients and photos come in as editable layers. 3D tilts, animations and a few small icons import simplified, so keep the @2x PNG beside it as the exact visual reference.

Elements marked *Scroll & Motion* use GSAP and Lenis (both free). The standalone pages use the copies in **/vendor**, so they work offline. Embeds and the Web Component load them from jsDelivr by default; to self-host, upload /vendor and add \`vendor="/vendor/"\` to the tag.

## Licence
See LICENCE.txt. Use in unlimited personal and client projects. Don't resell or share the files themselves.

Questions: hello@grittech.io · grittech.io
`);

writeFileSync(`${OUT}/LICENCE.txt`, `GRIT UI Bundle · Licence
GRIT Technologies FZE LLC · grittech.io

Full access: every file in this download is yours to use, source included.
Use it in unlimited personal and client projects, commercial ones included, and change anything you like.
One rule: don't resell, redistribute or share the files themselves as a template, kit or download.
Photos in /images are included for use with these elements on your projects.
`);

console.log(`Bundle: ${ALL.length} elements, ${images.size} images → ${OUT}`);
