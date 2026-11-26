// After `vite build`: point heavy files (images, videos, 3D models) at the media CDN instead of Firebase Hosting.
// Runs only when MEDIA_BASE is set (e.g. https://media.grittech.io); otherwise does nothing, so the site keeps
// serving media itself. Files are uploaded to Cloudflare R2 with tools/sync-media.mjs using the same paths.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE = (process.env.MEDIA_BASE || '').replace(/\/$/, '');
if (!BASE) { console.log('media-cdn: MEDIA_BASE not set, media stays on Firebase Hosting.'); process.exit(0); }

const DIRS = '(media|demo/[a-z0-9-]+/img)';
const abs = new RegExp(`https://grittech\\.io/${DIRS}/`, 'g');
const rel = new RegExp(`(["'\`(\\s,=])/${DIRS}/`, 'g');
let files = 0, hits = 0;
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) { if (!['media', 'img'].includes(n)) walk(p); continue; }
    if (!/\.(html|js|css)$/.test(n)) continue;
    const s = readFileSync(p, 'utf8');
    let c = 0;
    const out = s.replace(abs, (_, dir) => (c++, `${BASE}/${dir}/`)).replace(rel, (_, pre, dir) => (c++, `${pre}${BASE}/${dir}/`));
    if (c) { writeFileSync(p, out); files++; hits += c; }
  }
})('dist');
console.log(`media-cdn: ${hits} media links in ${files} files now point to ${BASE}`);
