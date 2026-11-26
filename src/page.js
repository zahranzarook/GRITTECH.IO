// Shared behaviour for the service and store pages: nav, cart, product grid and details.
import { PRODUCTS, STORE } from './data.js';
import './slides.js';

const $ = id => document.getElementById(id);
const icon = (id, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"/></svg>`;
const SIGNUP = '/account/?mode=signup&tab=academy';
const catOf = key => STORE.find(c => c.cat === key);

// ---- Nav -----------------------------------------------------------------
window.toggleMobileMenu = () => $('mobile-menu').classList.toggle('hidden');
window.openProjectModal = (key = '') => { location.href = '/?start=' + encodeURIComponent(key); };

// ---- Toast ---------------------------------------------------------------
let toastTimer;
function toast(msg) {
  $('toast-message').textContent = msg;
  $('toast-box').classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast-box').classList.add('hidden'), 4200);
}

// ---- Cart (shared with the homepage via localStorage; simulated until payments are live) ----
const CART_KEY = 'grit-cart';
const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const writeCart = items => { try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage unavailable */ } };

function updateCartUI() {
  const cart = readCart();
  const count = $('cart-count');
  count.textContent = cart.length;
  count.classList.toggle('hidden', cart.length === 0);
  $('cart-items-list').innerHTML = cart.length === 0
    ? `<p class="font-mono text-xs text-industrialSage py-8 text-center">Your cart is empty.</p>`
    : cart.map(p => `
      <div class="mt-well p-3.5 flex items-center justify-between gap-3">
        <div>
          <span class="font-mono text-[10px] text-industrialLime block">${p.categoryLabel}</span>
          <span class="font-display font-semibold text-sm text-softWhite">${p.title}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-mono text-sm text-softWhite font-bold">$${p.price}</span>
          <button type="button" data-remove="${p.id}" class="text-industrialSage hover:text-softWhite" aria-label="Remove ${p.title}">${icon('i-close', 'ico')}</button>
        </div>
      </div>`).join('');
  const total = cart.reduce((s, p) => s + p.price, 0);
  $('cart-total').textContent = `$${Number.isInteger(total) ? total : total.toFixed(2)}`;
}

window.toggleCartDrawer = () => $('cart-drawer').classList.toggle('hidden');
window.removeFromCart = id => { writeCart(readCart().filter(p => p.id !== id)); updateCartUI(); };
window.checkoutCart = () => {
  if (!readCart().length) { toast('Your cart is empty.'); return; }
  writeCart([]);
  updateCartUI();
  window.toggleCartDrawer();
  toast('Thanks! Your download links are on their way.');
};

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const cart = readCart();
  if (cart.some(x => x.id === id)) { toast(`${p.title} is already in your cart.`); return; }
  cart.push({ id: p.id, title: p.title, price: p.price, categoryLabel: catOf(p.cat)?.name || '' });
  writeCart(cart);
  updateCartUI();
  toast(`Added ${p.title} to your cart.`);
}

// ---- Store grid -----------------------------------------------------------
const grid = $('product-grid');
const priceLabel = p => (p.price === 0 ? 'Free' : `$${p.price}`);
const productUrl = p => `/store/${catOf(p.cat)?.slug}/${p.id}/`;
const buyButton = (p, big = false) => p.price === 0
  ? `<a href="${SIGNUP}" class="${big ? '' : 'flex-1 '}mt-btn mt-btn--primary${big ? '' : ' mt-btn--sm'}">${big ? 'Download Free →' : 'Download'}</a>`
  : `<button type="button" data-add="${p.id}" class="${big ? '' : 'flex-1 '}mt-btn mt-btn--primary${big ? '' : ' mt-btn--sm'}">${big ? 'Add to Cart →' : 'Add to Cart'}</button>`;
const badgeOf = p => p.badge || (p.price === 0 ? 'Free' : '');

// Filters live in the URL (?tag=WebGL&format=HTML&price=free) so tag links on product pages land pre-filtered.
const params = new URLSearchParams(location.search);
const picked = { tag: new Set(params.getAll('tag')), format: new Set(params.getAll('format')), price: new Set(params.getAll('price')) };
const inCat = () => PRODUCTS.filter(p => p.cat === grid.dataset.cat);

function counts(list, key) {
  const m = new Map();
  list.forEach(p => (p[key] || []).forEach(v => m.set(v, (m.get(v) || 0) + 1)));
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
function checkbox(group, value, n) {
  return `<label class="mt-check"><input type="checkbox" data-filter="${group}" value="${value}" ${picked[group].has(value) ? 'checked' : ''} /><span>${value}</span><em>${n}</em></label>`;
}
function renderFilters() {
  const box = $('store-filters');
  if (!box) return;
  const list = inCat();
  const free = list.filter(p => p.price === 0).length;
  const group = (title, body) => body ? `<div class="space-y-1.5"><span class="mt-label block mb-2">${title}</span>${body}</div>` : '';
  box.innerHTML = [
    group('Tags', counts(list, 'tags').map(([v, n]) => checkbox('tag', v, n)).join('')),
    group('Formats', counts(list, 'formats').map(([v, n]) => checkbox('format', v, n)).join('')),
    group('Price', (free ? checkbox('price', 'Free', free) : '') + (list.length - free ? checkbox('price', 'Paid', list.length - free) : '')),
  ].join('');
}
function syncUrl() {
  const q = new URLSearchParams();
  for (const [k, set] of Object.entries(picked)) set.forEach(v => q.append(k, v));
  const s = $('store-search')?.value.trim();
  if (s) q.set('q', s);
  history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
}

function card(p) {
  const cat = catOf(p.cat);
  const img = p.media?.[0];
  const badge = badgeOf(p);
  return `
    <article class="mt-tile mt-plate mt-lift p-5 flex flex-col gap-4">
      <div class="mt-media" ${img ? '' : 'data-media=""'}>
        ${img ? `<img src="${img}" alt="${p.title} preview" loading="lazy" decoding="async" />` : `${icon(cat.icon, 'ico')}<span class="mt-media__label">Preview soon</span>`}
        ${badge ? `<span class="mt-badge">${badge}</span>` : ''}
      </div>
      <div class="space-y-2 flex-1">
        <div class="flex items-start justify-between gap-4">
          <h3 class="font-display font-bold text-lg text-softWhite"><a href="${productUrl(p)}" class="mt-tile__link">${p.title}</a></h3>
          <span class="font-display font-bold text-lg ${p.price === 0 ? 'text-industrialLime' : 'text-softWhite'}">${priceLabel(p)}</span>
        </div>
        <p class="text-sm text-softWhite/70">${p.summary}</p>
        <p class="font-mono text-[10px] uppercase tracking-wider text-industrialSage">${(p.formats || []).join(' · ')} <span class="mx-1">/</span> By GRIT</p>
      </div>
      <div class="flex flex-wrap gap-1.5">${(p.tags || []).slice(0, 4).map(t => `<span class="mt-tag">${t}</span>`).join('')}</div>
      <div class="flex items-center gap-3">
        ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="flex-1 mt-btn mt-btn--sm">Live Demo ↗</a>` : `<a href="${productUrl(p)}" class="flex-1 mt-btn mt-btn--sm">Details</a>`}
        ${buyButton(p)}
      </div>
    </article>`;
}

function renderProducts() {
  if (!grid) return;
  const q = ($('store-search')?.value || '').toLowerCase().trim();
  const sort = $('store-sort')?.value || 'featured';
  const has = (set, vals) => !set.size || [...set].some(v => vals.includes(v));
  let list = inCat().filter(p =>
    [p.title, p.summary, ...(p.tags || []), ...(p.formats || [])].join(' ').toLowerCase().includes(q)
    && has(picked.tag, p.tags || []) && has(picked.format, p.formats || [])
    && has(picked.price, [p.price === 0 ? 'Free' : 'Paid']));
  const by = {
    popular: (a, b) => (b.pop || 0) - (a.pop || 0),
    newest: (a, b) => (b.added || '').localeCompare(a.added || ''),
    az: (a, b) => a.title.localeCompare(b.title),
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
  }[sort];
  if (by) list = [...list].sort(by);
  const active = picked.tag.size + picked.format.size + picked.price.size;
  $('product-count').textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}${active ? ` · ${active} filter${active > 1 ? 's' : ''}` : ''}`;
  $('store-clear')?.classList.toggle('hidden', !active && !q);
  grid.innerHTML = list.length ? list.map(card).join('')
    : `<div class="col-span-full mt-well p-10 text-center font-mono text-sm text-industrialSage">Nothing matches those filters yet.</div>`;
}

// ---- Events --------------------------------------------------------------
document.addEventListener('click', e => {
  const t = e.target.closest('[data-add],[data-remove],[data-close-modal]');
  if (t?.dataset.add) addToCart(t.dataset.add);
  else if (t?.dataset.remove) window.removeFromCart(t.dataset.remove);
  else if (t?.hasAttribute('data-close-modal')) t.closest('.mt-modal')?.classList.add('hidden');
  else if (e.target.classList?.contains('mt-modal')) e.target.classList.add('hidden');
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.mt-modal').forEach(m => m.classList.add('hidden'));
  $('cart-drawer').classList.add('hidden');
});
document.addEventListener('change', e => {
  const f = e.target.dataset?.filter;
  if (!f) return;
  picked[f][e.target.checked ? 'add' : 'delete'](e.target.value);
  syncUrl(); renderProducts();
});
$('store-clear')?.addEventListener('click', e => {
  e.preventDefault();
  Object.values(picked).forEach(set => set.clear());
  if ($('store-search')) $('store-search').value = '';
  syncUrl(); renderFilters(); renderProducts();
});
if ($('store-search') && params.get('q')) $('store-search').value = params.get('q');
$('store-search')?.addEventListener('input', () => { syncUrl(); renderProducts(); });
$('store-sort')?.addEventListener('change', renderProducts);

updateCartUI();
if (grid) {
  renderFilters(); renderProducts();
  // Phones: start with the filter panel folded so products come first (open if a filter is already set).
  const panel = $('store-filters')?.closest('details');
  if (panel && matchMedia('(max-width: 1023px)').matches && !location.search) panel.open = false;
}
