// GRIT payments: pay.grittech.io (Cloudflare Worker)
//
// The Ziina key and the Firebase service account live only here, as Worker secrets.
// Prices come from catalog.json, generated from src/data.js at deploy time, so a buyer can never change a price.
//
//   POST /checkout      (signed-in member)  { items: [productId] }            -> { url }  Ziina payment page
//   POST /confirm       (signed-in member)  { pi }                            -> order status; grants purchases once paid
//   POST /webhook       (Ziina)             payment_intent.status.updated     -> grants purchases once paid
//   POST /download      (signed-in member)  { product }                       -> { url }  short-lived file link
//   GET  /file/:token                                                         -> the zip from the private R2 bucket
//   POST /admin/link    (admin member)      { amount, currency, message }     -> { url }  one-off payment link
//   GET  /health
//
// Products with `includes: [ids]` are packages/bundles: buying one grants every included product.
// A product is sellable when its price > 0, it isn't a placeholder, and every file it grants exists in R2 as <id>.zip.
// Requests from preview links and localhost create Ziina *test* payments.
import CATALOG from './catalog.json';

const PROJECT = 'grittech-io';
const SITE = 'https://grittech.io';
const ZIINA = 'https://api-v2.ziina.com/api';
const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const ZIINA_IPS = ['3.29.184.186', '3.29.190.95', '20.233.47.127', '13.202.161.181'];
const LIVE_ORIGINS = ['https://grittech.io', 'https://www.grittech.io'];
const TEST_ORIGIN = /^(https:\/\/grittech-io(--[a-z0-9-]+)?\.web\.app|https:\/\/grittech-io\.firebaseapp\.com|http:\/\/localhost:\d+)$/;

const enc = new TextEncoder();
const PRODUCTS = Object.fromEntries(CATALOG.map(p => [p.id, p]));

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const allowed = LIVE_ORIGINS.includes(origin) || TEST_ORIGIN.test(origin);
    const cors = allowed ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Vary': 'Origin' } : {};
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors } });
    const fail = (status, error) => json({ error }, status);
    try {
      const path = url.pathname;
      if (path === '/health') return json({ ok: true, products: CATALOG.length });
      if (path === '/webhook' && req.method === 'POST') return await webhook(req, env, ctx);
      if (path.startsWith('/file/') && req.method === 'GET') return await file(path.slice(6), env);
      if (req.method !== 'POST') return fail(404, 'Not found');
      if (!allowed) return fail(403, 'Origin not allowed');
      const test = !LIVE_ORIGINS.includes(origin);
      const site = test ? origin : SITE;
      const user = await member(req);
      if (!user) return fail(401, 'Please sign in first.');
      const body = await req.json().catch(() => ({}));
      if (path === '/checkout') return json(await checkout(body, user, env, { test, site }));
      if (path === '/confirm') return json(await confirm(body.pi, user, env));
      if (path === '/download') return json(await downloadLink(body.product, user, env));
      if (path === '/admin/link') return json(await adminLink(body, user, env, { test: test || body.test === true, site }));
      return fail(404, 'Not found');
    } catch (e) {
      if (e instanceof UserError) return fail(e.status, e.message);
      console.error(e && e.stack || e);
      return fail(500, 'Something went wrong. Please try again or email orders@grittech.io.');
    }
  },
};

class UserError extends Error { constructor(status, message) { super(message); this.status = status; } }

// ---------- catalogue ----------
const grants = p => (p.includes && p.includes.length ? p.includes : [p.id]);
async function sellable(p, env) {
  if (!p || p.placeholder || !(p.price > 0)) return false;
  for (const id of grants(p)) if (!(await env.DOWNLOADS.head(`${id}.zip`))) return false;
  return true;
}

// ---------- checkout ----------
async function checkout({ items }, user, env, { test, site }) {
  const ids = [...new Set(Array.isArray(items) ? items.map(String) : [])].slice(0, 20);
  if (!ids.length) throw new UserError(400, 'Your cart is empty.');
  const products = ids.map(id => PRODUCTS[id]);
  if (products.some(p => !p)) throw new UserError(400, 'Something in your cart is no longer in the store. Please remove it and try again.');
  const notReady = [];
  for (const p of products) if (!(await sellable(p, env))) notReady.push(p.title);
  if (notReady.length) throw new UserError(409, `${notReady.join(', ')} ${notReady.length > 1 ? 'are' : 'is'} still being packaged for download. Remove ${notReady.length > 1 ? 'them' : 'it'} to check out the rest, or email orders@grittech.io.`);
  const cents = products.reduce((s, p) => s + Math.round(p.price * 100), 0);
  const ret = `${site}/checkout/success/?pi={PAYMENT_INTENT_ID}`;
  const pi = await ziina(env, 'POST', '/payment_intent', {
    amount: cents, currency_code: 'USD', test,
    message: `GRIT Store: ${products.map(p => p.title).join(', ')}`.slice(0, 200),
    success_url: ret, cancel_url: ret + '&cancelled=1', failure_url: ret + '&failed=1',
  });
  await fsSet(env, `orders/${pi.id}`, {
    uid: user.uid, email: user.email || '', items: ids, amount: cents, currency: 'USD', test,
    status: 'pending', fulfilled: false, createdAt: new Date(),
  });
  return { url: pi.redirect_url, pi: pi.id };
}

// ---------- fulfilment (idempotent; used by /confirm and /webhook) ----------
async function fulfil(env, piId) {
  const order = await fsGet(env, `orders/${piId}`);
  if (!order) return null;
  if (order.fulfilled) return order;
  const pi = await ziina(env, 'GET', `/payment_intent/${encodeURIComponent(piId)}`);
  if (pi.status !== 'completed') {
    if (pi.status !== order.status) await fsSet(env, `orders/${piId}`, { ...order, status: pi.status });
    return { ...order, status: pi.status };
  }
  if (Number(pi.amount) !== Number(order.amount) || String(pi.currency_code).toUpperCase() !== order.currency) throw new Error(`Amount mismatch on ${piId}`);
  const now = new Date();
  for (const id of order.items) {
    const p = PRODUCTS[id]; if (!p) continue;
    for (const gid of grants(p)) {
      const g = PRODUCTS[gid] || p;
      await fsSet(env, `users/${order.uid}/purchases/${gid}`, {
        productId: gid, title: g.title, category: g.category, price: g.price, licence: 'Commercial',
        orderId: piId, viaBundle: gid !== id ? p.title : '', test: !!order.test, purchasedAt: now,
      });
    }
  }
  const done = { ...order, status: 'completed', fulfilled: true, paidAt: now };
  await fsSet(env, `orders/${piId}`, done);
  return done;
}

async function confirm(piId, user, env) {
  if (!piId || typeof piId !== 'string') throw new UserError(400, 'Missing order.');
  const order = await fsGet(env, `orders/${piId}`);
  if (!order || order.uid !== user.uid) throw new UserError(404, 'We couldn\'t find that order on your account.');
  const now = await fulfil(env, piId);
  return { status: now.status, items: order.items.flatMap(id => grants(PRODUCTS[id] || { id })).map(id => ({ id, title: PRODUCTS[id]?.title || id })), test: !!order.test };
}

// ---------- webhook ----------
async function webhook(req, env, ctx) {
  const ip = req.headers.get('CF-Connecting-IP') || '';
  const raw = await req.text();
  if (!ZIINA_IPS.includes(ip)) return new Response('forbidden', { status: 403 });
  const sig = (req.headers.get('X-Hmac-Signature') || '').toLowerCase();
  const expected = await hmacHex(await webhookSecret(env), raw);
  if (!sig || !timingSafeEqual(sig, expected)) return new Response('bad signature', { status: 401 });
  const evt = JSON.parse(raw);
  if (evt.event === 'payment_intent.status.updated' && evt.data?.id) ctx.waitUntil(fulfil(env, evt.data.id).catch(e => console.error('webhook fulfil', e)));
  return new Response('ok');
}
// The webhook secret is derived from the Ziina key, so there is one fewer secret to manage.
// .github/workflows/payments.yml registers the webhook with the same derivation.
async function webhookSecret(env) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(env.ZIINA_API_KEY + ':grit-webhook'))); }

// ---------- downloads ----------
async function downloadLink(productId, user, env) {
  if (!productId || typeof productId !== 'string') throw new UserError(400, 'Missing product.');
  const bought = await fsGet(env, `users/${user.uid}/purchases/${productId}`);
  if (!bought) throw new UserError(403, 'This product isn\'t on your account.');
  if (!(await env.DOWNLOADS.head(`${productId}.zip`))) throw new UserError(404, 'This file is being updated. Please try again in a few minutes.');
  const payload = b64url(enc.encode(JSON.stringify({ p: productId, u: user.uid, e: Date.now() + 10 * 60 * 1000 })));
  return { url: `https://pay.grittech.io/file/${payload}.${await hmacHex(await fileKey(env), payload)}` };
}
async function file(token, env) {
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !timingSafeEqual(sig, await hmacHex(await fileKey(env), payload))) return new Response('Link not valid', { status: 403 });
  const { p, e } = JSON.parse(new TextDecoder().decode(unb64url(payload)));
  if (Date.now() > e) return new Response('This download link has expired. Open your account to get a fresh one.', { status: 410 });
  const obj = await env.DOWNLOADS.get(`${p}.zip`);
  if (!obj) return new Response('File not found', { status: 404 });
  return new Response(obj.body, { headers: {
    'Content-Type': 'application/zip', 'Content-Length': String(obj.size),
    'Content-Disposition': `attachment; filename="${p}.zip"`, 'Cache-Control': 'private, no-store',
  } });
}
async function fileKey(env) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(env.ZIINA_API_KEY + ':grit-files'))); }

// ---------- admin: one-off payment links for packages, services, deposits ----------
async function adminLink({ amount, currency = 'AED', message = '' }, user, env, { test, site }) {
  const admins = String(env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  if (!user.email_verified || !admins.includes(String(user.email).toLowerCase())) throw new UserError(403, 'Admins only.');
  const cur = String(currency).toUpperCase();
  if (!['AED', 'USD', 'EUR', 'GBP', 'SAR', 'QAR', 'INR'].includes(cur)) throw new UserError(400, 'Unsupported currency.');
  const value = Math.round(Number(amount) * 100);
  if (!(value >= 100) || value > 100000000) throw new UserError(400, 'Enter an amount of at least 1.');
  const pi = await ziina(env, 'POST', '/payment_intent', {
    amount: value, currency_code: cur, test, message: String(message).slice(0, 200) || 'GRIT Technologies',
    success_url: `${site}/checkout/thanks/`, cancel_url: `${site}/checkout/thanks/?cancelled=1`, failure_url: `${site}/checkout/thanks/?failed=1`,
  });
  await fsSet(env, `links/${pi.id}`, { amount: value, currency: cur, message: String(message), test, createdBy: user.email, createdAt: new Date() });
  return { url: pi.redirect_url, pi: pi.id, test };
}

// ---------- Ziina ----------
async function ziina(env, method, path, body) {
  const r = await fetch(ZIINA + path, { method, headers: { Authorization: `Bearer ${env.ZIINA_API_KEY}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { console.error('ziina', path, r.status, JSON.stringify(data)); throw new UserError(502, 'The payment service is unavailable right now. Please try again shortly.'); }
  return data;
}

// ---------- Firebase: verify the member's ID token ----------
let jwks = null, jwksAt = 0;
async function member(req) {
  const h = req.headers.get('Authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  const [hd, pl, sg] = token.split('.');
  if (!hd || !pl || !sg) return null;
  const header = JSON.parse(new TextDecoder().decode(unb64url(hd)));
  const c = JSON.parse(new TextDecoder().decode(unb64url(pl)));
  const now = Date.now() / 1000;
  if (header.alg !== 'RS256' || c.aud !== PROJECT || c.iss !== `https://securetoken.google.com/${PROJECT}` || !c.sub || c.exp < now || c.iat > now + 300) return null;
  if (!jwks || Date.now() - jwksAt > 3600e3) {
    jwks = await (await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')).json(); jwksAt = Date.now();
  }
  const jwk = jwks.keys.find(k => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, unb64url(sg), enc.encode(`${hd}.${pl}`));
  return ok ? { uid: c.sub, email: c.email || '', email_verified: !!c.email_verified } : null;
}

// ---------- Firestore REST (service account) ----------
let gTok = null, gExp = 0;
async function google(env) {
  if (gTok && Date.now() < gExp - 60e3) return gTok;
  const sa = JSON.parse(env.FIREBASE_SA);
  const iat = Math.floor(Date.now() / 1000);
  const head = b64url(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = b64url(enc.encode(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat + 3600 })));
  const pem = sa.private_key.replace(/-----[^-]+-----|\s/g, '');
  const key = await crypto.subtle.importKey('pkcs8', unb64(pem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = b64url(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(`${head}.${claims}`))));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${head}.${claims}.${sig}` });
  const t = await r.json();
  if (!t.access_token) throw new Error('Google auth failed: ' + JSON.stringify(t));
  gTok = t.access_token; gExp = Date.now() + t.expires_in * 1000;
  return gTok;
}
const toFs = v => v === null || v === undefined ? { nullValue: null }
  : v instanceof Date ? { timestampValue: v.toISOString() }
  : typeof v === 'boolean' ? { booleanValue: v }
  : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : Array.isArray(v) ? { arrayValue: { values: v.map(toFs) } }
  : typeof v === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toFs(x)])) } }
  : { stringValue: String(v) };
const fromFs = f => 'stringValue' in f ? f.stringValue : 'integerValue' in f ? Number(f.integerValue) : 'doubleValue' in f ? f.doubleValue
  : 'booleanValue' in f ? f.booleanValue : 'timestampValue' in f ? new Date(f.timestampValue) : 'nullValue' in f ? null
  : 'arrayValue' in f ? (f.arrayValue.values || []).map(fromFs) : 'mapValue' in f ? Object.fromEntries(Object.entries(f.mapValue.fields || {}).map(([k, x]) => [k, fromFs(x)])) : null;
async function fsGet(env, path) {
  const r = await fetch(`${FS}/${path}`, { headers: { Authorization: `Bearer ${await google(env)}` } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Firestore get ${path}: ${r.status} ${await r.text()}`);
  const d = await r.json();
  return Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, fromFs(v)]));
}
async function fsSet(env, path, data) {
  const r = await fetch(`${FS}/${path}`, { method: 'PATCH', headers: { Authorization: `Bearer ${await google(env)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toFs(v)])) }) });
  if (!r.ok) throw new Error(`Firestore set ${path}: ${r.status} ${await r.text()}`);
}

// ---------- small crypto helpers ----------
function b64url(bytes) { let s = ''; bytes.forEach(b => (s += String.fromCharCode(b))); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64(s) { const bin = atob(s); return Uint8Array.from(bin, c => c.charCodeAt(0)); }
function unb64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); return unb64(s + '==='.slice((s.length + 3) % 4)); }
function hex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function hmacHex(secret, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
}
function timingSafeEqual(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
