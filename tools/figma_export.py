"""Figma files for the store downloads: editable SVG layers + pixel-perfect PNG references.

Run after `node tools/build-ui-bundle.mjs`:
  npx vite &                                   # dev server on :5173 (themes are exported from it)
  python3 tools/figma_export.py                # elements + themes
  python3 tools/figma_export.py elements       # just the UI bundle
  python3 tools/figma_export.py themes         # just the themes
Output:
  downloads/grit-ui-bundle/elements/<id>/figma/<id>.svg and <id>@2x.png
  downloads/themes/<theme>/figma/<page>-desktop.svg/.png and -mobile.svg/.png
SVGs are made with dom-to-svg: drag one into Figma and text, shapes, colours and gradients arrive as editable layers.
"""
import asyncio, sys, os, glob, subprocess, pathlib
from playwright.async_api import async_playwright
from record_lib import fonts, cdn, BASE
ROOT = pathlib.Path(__file__).resolve().parent.parent
BUNDLE = ROOT / 'downloads/grit-ui-bundle'
D2S = '/tmp/grit-d2s.js'
THEMES = {'ember-restaurant': [('home', '/demo/restaurant/')], 'atlas-travel': [('home', '/demo/travel/')]}

def build_d2s():
    cache = ROOT / 'node_modules/.cache'; cache.mkdir(parents=True, exist_ok=True)
    entry = cache / 'grit-d2s-entry.js'
    # Photos are embedded as JPEG (Figma imports them as image fills) and cropped like CSS object-fit: cover.
    entry.write_text("""import { elementToSVG, inlineResources } from 'dom-to-svg';
window.__toSVG = async (el) => {
  // Visible box of every photo: clipped by any overflow-hidden parent (with its corner radius).
  const NS = 'http://www.w3.org/2000/svg', clips = {};
  el.querySelectorAll('img').forEach(img => {
    let r = img.getBoundingClientRect(), v = { x: r.left, y: r.top, r: r.right, b: r.bottom }, rad = 0;
    for (let p = img.parentElement; p && p !== el.parentElement; p = p.parentElement) {
      const cs = getComputedStyle(p); if (cs.overflow === 'visible' && cs.overflowX === 'visible') continue;
      const q = p.getBoundingClientRect(); v = { x: Math.max(v.x, q.left), y: Math.max(v.y, q.top), r: Math.min(v.r, q.right), b: Math.min(v.b, q.bottom) };
      if (!rad) rad = parseFloat(cs.borderTopLeftRadius) || 0;
    }
    const key = img.currentSrc || img.src; (clips[key] = clips[key] || []).push({ v, rad, cover: getComputedStyle(img).objectFit === 'cover' });
  });
  const s = elementToSVG(el);
  let n = 0;
  for (const im of s.querySelectorAll('image')) {
    const href = im.getAttribute('href') || im.getAttribute('xlink:href'), list = clips[href]; if (!list || !list.length) continue;
    const { v, rad, cover } = list.shift(); if (cover) im.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const cp = document.createElementNS(NS, 'clipPath'), id = 'photo-clip-' + (++n), rect = document.createElementNS(NS, 'rect');
    cp.id = id; Object.entries({ x: v.x, y: v.y, width: Math.max(0, v.r - v.x), height: Math.max(0, v.b - v.y), rx: rad }).forEach(([k, val]) => rect.setAttribute(k, val));
    cp.appendChild(rect); s.documentElement.insertBefore(cp, s.documentElement.firstChild);
    const g = document.createElementNS(NS, 'g'); g.setAttribute('clip-path', 'url(#' + id + ')'); im.parentNode.insertBefore(g, im); g.appendChild(im);
  }
  await inlineResources(s.documentElement);
  for (const im of s.querySelectorAll('image')) {
    const href = im.getAttribute('href') || im.getAttribute('xlink:href'); if (!href || href.startsWith('data:')) continue;
    let data;
    try {
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = href; await img.decode();
      const c = document.createElement('canvas'), k = Math.min(1, 1600 / img.naturalWidth); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      const x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
      // transparent photos (cut-out dishes) stay PNG; everything else becomes a lighter JPEG
      const px = x.getImageData(0, 0, c.width, c.height).data; let alpha = false;
      for (let i = 3; i < px.length; i += 4 * 97) if (px[i] < 250) { alpha = true; break; }
      data = c.toDataURL(alpha ? 'image/png' : 'image/jpeg', .86);
    } catch (err) { console.warn('figma-export image failed', href, String(err)); continue; }
    im.removeAttributeNS('http://www.w3.org/1999/xlink', 'href'); im.removeAttribute('xlink:href'); im.setAttribute('href', data); im.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', data);
  }
  return new XMLSerializer().serializeToString(s);
};""")
    subprocess.run(['npx', 'esbuild', str(entry), '--bundle', '--format=iife', f'--outfile={D2S}', '--log-level=error'], check=True, cwd=ROOT)

async def ctx_for(b, w, h, scale=2):
    c = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=scale)
    await c.route('https://fonts.googleapis.com/**', fonts); await c.route('https://fonts.gstatic.com/**', fonts)
    await c.route('https://cdn.jsdelivr.net/**', cdn)
    return c

# Before converting: bake computed SVG paints into attributes (CSS variables don't survive),
# and swap range sliders for plain shapes so they import as a track and thumb.
PREP = """() => {
  document.querySelectorAll('svg *').forEach(n => { const cs = getComputedStyle(n);
    if (n.tagName === 'stop') { n.setAttribute('stop-color', cs.stopColor); n.setAttribute('stop-opacity', cs.stopOpacity); return; }
    if (cs.fill) { n.setAttribute('fill', cs.fill); if (!cs.fill.startsWith('url')) n.style.fill = cs.fill; } if (cs.stroke && cs.stroke !== 'none') n.setAttribute('stroke', cs.stroke);
    if (cs.opacity !== '1') n.setAttribute('opacity', cs.opacity); });
  document.querySelectorAll('input[type=range]').forEach(r => {
    const w = r.offsetWidth || 200, k = (r.value - r.min) / (r.max - r.min), a = getComputedStyle(r).accentColor, c = a === 'auto' ? '#3b82f6' : a;
    const d = document.createElement('div'); d.style.cssText = 'position:relative;height:16px;width:' + w + 'px;margin:' + getComputedStyle(r).margin;
    d.innerHTML = '<div style="position:absolute;left:0;right:0;top:6px;height:4px;border-radius:4px;background:rgba(128,128,128,.35)"></div>'
      + '<div style="position:absolute;left:0;top:6px;height:4px;border-radius:4px;width:' + k * 100 + '%;background:' + c + '"></div>'
      + '<div style="position:absolute;top:0;width:16px;height:16px;border-radius:50%;left:calc(' + k * 100 + '% - 8px);background:' + c + '"></div>';
    r.replaceWith(d); });
}"""

async def canvases_to_images(pg):
    import base64
    for c in await pg.query_selector_all('canvas'):
        bb = await c.bounding_box()
        if not bb or bb['width'] < 2 or bb['height'] < 2: continue
        data = 'data:image/png;base64,' + base64.b64encode(await c.screenshot(omit_background=True)).decode()
        await c.evaluate("""(c, d) => { const i = document.createElement('img'), cs = getComputedStyle(c);
          i.src = d; i.className = c.className; i.alt = '';
          for (const k of ['position','top','left','right','bottom','inset','zIndex','opacity','pointerEvents','transform','borderRadius','display']) i.style[k] = cs[k];
          i.style.width = c.getBoundingClientRect().width + 'px'; i.style.height = c.getBoundingClientRect().height + 'px'; c.replaceWith(i); }""", data)

async def bake_gradients(pg):
    """Radial/conic gradients don't convert to SVG; capture each such background as an image instead."""
    import base64
    n = await pg.evaluate("""() => { let i = 0; document.querySelectorAll('*').forEach(e => { const b = getComputedStyle(e).backgroundImage;
      if (/radial-gradient|conic-gradient/.test(b) && e.getBoundingClientRect().width > 1) e.dataset.bake = ++i; }); return i; }""")
    if not n: return
    await pg.add_style_tag(content="[data-baking]{color:transparent!important;border-color:transparent!important;box-shadow:none!important}[data-baking] *{visibility:hidden!important}")
    for i in range(1, n + 1):
        h = await pg.query_selector(f'[data-bake="{i}"]')
        if not h: continue
        await h.evaluate("e => e.setAttribute('data-baking', '')")
        try: data = 'data:image/png;base64,' + base64.b64encode(await h.screenshot(omit_background=True)).decode()
        except Exception: data = None
        await h.evaluate("""(e, d) => { e.removeAttribute('data-baking'); if (!d) return;
          e.style.backgroundImage = 'url(' + d + ')'; e.style.backgroundSize = '100% 100%'; e.style.backgroundPosition = '0 0'; e.style.backgroundRepeat = 'no-repeat'; }""", data)
    await pg.evaluate('window.lenis ? lenis.scrollTo(0,{immediate:true}) : scrollTo(0,0)'); await pg.wait_for_timeout(500)

async def svg_of(pg, selector):
    pg.on('console', lambda m: print('  ', m.text) if 'figma-export' in m.text else None)
    await canvases_to_images(pg)
    await bake_gradients(pg)
    await pg.evaluate(PREP)
    await pg.add_script_tag(path=D2S)
    return await pg.evaluate("async s => await window.__toSVG(document.querySelector(s))", selector)

async def elements(b):
    # serve over http so photos can be embedded into the SVGs
    srv = subprocess.Popen(['python3', '-m', 'http.server', '8765', '--bind', '127.0.0.1'], cwd=BUNDLE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    await asyncio.sleep(1)
    c = await ctx_for(b, 1280, 800)
    pg = await c.new_page()
    for d in sorted(glob.glob(str(BUNDLE / 'elements/*/'))):
        eid = os.path.basename(d.rstrip('/')); out = pathlib.Path(d) / 'figma'; out.mkdir(exist_ok=True)
        await pg.goto(f'http://127.0.0.1:8765/elements/{eid}/index.html'); await pg.wait_for_timeout(1200)
        full = await pg.evaluate("getComputedStyle(document.body).display !== 'grid'")
        sel = '.grit-root' if full else '.grit-root > *'
        if full: await pg.screenshot(path=str(out / f'{eid}@2x.png'))
        else:
            bb = await (await pg.query_selector(sel)).bounding_box(); p = 32
            await pg.screenshot(path=str(out / f'{eid}@2x.png'), clip={'x': max(0, bb['x'] - p), 'y': max(0, bb['y'] - p), 'width': bb['width'] + 2 * p, 'height': bb['height'] + 2 * p})
        (out / f'{eid}.svg').write_text(await svg_of(pg, sel))
        print('element', eid)
    await c.close(); srv.terminate()

async def themes(b):
    for tid, pages in THEMES.items():
        out = ROOT / f'downloads/themes/{tid}/figma'; out.mkdir(parents=True, exist_ok=True)
        for name, url in pages:
            for label, w, h in [('desktop', 1440, 900), ('mobile', 390, 844)]:
                c = await ctx_for(b, w, h, scale=1 if label == 'desktop' else 2); pg = await c.new_page()
                await pg.goto(BASE + url, wait_until='networkidle')
                await pg.evaluate("document.querySelector('.gritbar')?.remove(); document.documentElement.style.scrollBehavior='auto'")
                # scroll through once so reveal-on-scroll sections are visible, then back to the top
                hgt = await pg.evaluate('document.documentElement.scrollHeight')
                for y in range(0, hgt, 500): await pg.evaluate(f'window.lenis ? lenis.scrollTo({y},{{immediate:true}}) : scrollTo(0,{y})'); await pg.wait_for_timeout(120)
                await pg.evaluate('window.lenis ? lenis.scrollTo(0,{immediate:true}) : scrollTo(0,0)'); await pg.wait_for_timeout(600)
                await pg.screenshot(path=str(out / f'{name}-{label}.png'), full_page=True)
                (out / f'{name}-{label}.svg').write_text(await svg_of(pg, 'body'))
                await c.close(); print('theme', tid, name, label)

async def main():
    which = sys.argv[1:] or ['elements', 'themes']
    build_d2s()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--allow-file-access-from-files'])
        if 'elements' in which: await elements(b)
        if 'themes' in which: await themes(b)
        await b.close()
asyncio.run(main())
