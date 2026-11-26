// Top-down dish illustrations drawn as SVG, so food themes and app demos need no photos.
// dish({ plate, base, swirl, items: [{ shape, color, n, size, r }], seed }) → SVG string.
let uid = 0;
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296;
}
const hash = str => [...String(str)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

function shape(k, x, y, s, rot, color, R) {
  const t = `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})"`;
  switch (k) {
    case 'leaf': return `<g ${t}><ellipse rx="${s}" ry="${s * 0.42}" fill="${color}"/><path d="M${-s * .85} 0H${s * .85}" stroke="rgba(0,0,0,.18)" stroke-width="${Math.max(.6, s * .08)}"/></g>`;
    case 'slice': return `<g ${t}><path d="M${-s} 0A${s} ${s} 0 0 1 ${s} 0Z" fill="${color}"/><path d="M${-s * .78} -1A${s * .78} ${s * .78} 0 0 1 ${s * .78} -1" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="${s * .12}"/></g>`;
    case 'cube': return `<g ${t}><rect x="${-s}" y="${-s}" width="${s * 2}" height="${s * 2}" rx="${s * .35}" fill="${color}"/><rect x="${-s * .7}" y="${-s * .75}" width="${s * .9}" height="${s * .5}" rx="${s * .2}" fill="rgba(255,255,255,.22)"/></g>`;
    case 'ring': return `<g ${t}><ellipse rx="${s}" ry="${s * .8}" fill="none" stroke="${color}" stroke-width="${Math.max(1.2, s * .22)}"/></g>`;
    case 'grain': return `<g ${t}><ellipse rx="${s}" ry="${s * .45}" fill="${color}"/></g>`;
    case 'drizzle': return `<g ${t}><path d="M${-s * 2} 0q${s * .7} ${-s} ${s * 1.4} 0t${s * 1.4} 0t${s * 1.4} 0" fill="none" stroke="${color}" stroke-width="${Math.max(1.4, s * .32)}" stroke-linecap="round"/></g>`;
    case 'citrus': return `<g ${t}><circle r="${s}" fill="${color}"/><circle r="${s * .82}" fill="rgba(255,255,255,.55)"/>${[0, 60, 120, 180, 240, 300].map(a => `<path d="M0 0L${(Math.cos(a * Math.PI / 180) * s * .78).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * s * .78).toFixed(1)}" stroke="${color}" stroke-width="${s * .1}"/>`).join('')}</g>`;
    case 'skewer': return `<g ${t}><path d="M${-s * 3.2} 0H${s * 3.2}" stroke="#8a6a46" stroke-width="${s * .22}" stroke-linecap="round"/>${[-2, -0.7, 0.6, 1.9].map(i => `<rect x="${(i * s) - s * .55}" y="${-s * .62}" width="${s * 1.1}" height="${s * 1.24}" rx="${s * .3}" fill="${color}"/>`).join('')}</g>`;
    default: return `<g ${t}><circle r="${s}" fill="${color}"/><circle cx="${-s * .3}" cy="${-s * .3}" r="${s * .32}" fill="rgba(255,255,255,.28)"/></g>`;
  }
}

export function dish({ plate = '#f4efe7', rim, base, baseR = 56, swirl, items = [], seed = 'x', bowl = false, glass = false }) {
  const id = `d${++uid}`;
  const R = rng(hash(seed));
  const out = [];
  out.push(`<defs>
    <radialGradient id="${id}p" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></radialGradient>
    <radialGradient id="${id}s" r=".5"><stop offset=".6" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}f" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient>
  </defs>`);
  out.push(`<ellipse cx="106" cy="112" rx="98" ry="96" fill="url(#${id}s)"/>`);
  if (glass) {
    out.push(`<circle cx="100" cy="100" r="74" fill="${plate}" opacity=".35"/><circle cx="100" cy="100" r="74" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="4"/>`);
    out.push(`<circle cx="100" cy="100" r="66" fill="${base}"/><circle cx="100" cy="100" r="66" fill="url(#${id}f)"/>`);
  } else {
    out.push(`<circle cx="100" cy="100" r="92" fill="${plate}"/>`);
    out.push(`<circle cx="100" cy="100" r="${bowl ? 80 : 74}" fill="${rim || 'rgba(0,0,0,.05)'}"/>`);
    out.push(`<circle cx="100" cy="100" r="92" fill="url(#${id}p)"/>`);
    if (base) out.push(`<circle cx="100" cy="100" r="${baseR}" fill="${base}"/><circle cx="100" cy="100" r="${baseR}" fill="url(#${id}f)"/>`);
  }
  if (swirl) {
    let d = 'M100 100';
    for (let a = 0; a < Math.PI * 7; a += .35) { const r = a * (baseR - 8) / (Math.PI * 7); d += `L${(100 + Math.cos(a) * r).toFixed(1)} ${(100 + Math.sin(a) * r).toFixed(1)}`; }
    out.push(`<path d="${d}" fill="none" stroke="${swirl}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`);
  }
  for (const it of items) {
    const n = it.n || 1, lim = it.r ?? 44;
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, r = it.center ? 0 : Math.sqrt(R()) * lim;
      const s = (it.size || 6) * (0.8 + R() * 0.4);
      const col = Array.isArray(it.color) ? it.color[i % it.color.length] : it.color;
      out.push(shape(it.shape || 'dot', 100 + Math.cos(a) * r, 100 + Math.sin(a) * r, s, R() * 360, col, R));
    }
  }
  if (!glass) out.push(`<path d="M42 58A70 70 0 0 1 96 22" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>`);
  return `<svg viewBox="0 0 210 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${out.join('')}</svg>`;
}
