// Upload site media to Cloudflare R2 (same paths as on the site), skipping files that are already there unchanged.
// Needs: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET (kept in GitHub secrets, never in code).
// Usage: node tools/sync-media.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) { console.error('sync-media: missing R2_* environment variables'); process.exit(1); }
const s3 = new S3Client({ region: 'auto', endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY } });
const TYPES = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2' };

const files = [];
const walk = d => readdirSync(d).forEach(n => { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : TYPES[extname(n).toLowerCase()] && files.push(p); });
walk('public/media');
readdirSync('public/demo').forEach(demo => { try { walk(join('public/demo', demo, 'img')); } catch { /* demo without images */ } });

let up = 0, same = 0;
for (const f of files) {
  const Key = relative('public', f).split('\\').join('/');
  const Body = readFileSync(f), md5 = createHash('md5').update(Body).digest('hex');
  try { const h = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key })); if (h.ETag?.replace(/"/g, '') === md5) { same++; continue; } } catch { /* new file */ }
  await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key, Body, ContentType: TYPES[extname(f).toLowerCase()], CacheControl: 'public, max-age=604800, stale-while-revalidate=86400' }));
  up++;
}
console.log(`sync-media: ${up} uploaded, ${same} unchanged (${files.length} files)`);
