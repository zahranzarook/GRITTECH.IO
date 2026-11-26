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
  $('cart-total').textContent = `$${cart.reduce((s, p) => s + p.price, 0)}`;
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
const buyButton = (p, big = false) => p.price === 0
  ? `<a href="${SIGNUP}" class="${big ? '' : 'flex-1 '}mt-btn mt-btn--primary${big ? '' : ' mt-btn--sm'}">${big ? 'Download Free →' : 'Download'}</a>`
  : `<button type="button" data-add="${p.id}" class="${big ? '' : 'flex-1 '}mt-btn mt-btn--primary${big ? '' : ' mt-btn--sm'}">${big ? 'Add to Cart →' : 'Add to Cart'}</button>`;

function renderProducts() {
  if (!grid) return;
  const cat = catOf(grid.dataset.cat);
  const q = ($('store-search')?.value || '').toLowerCase();
  const sort = $('store-sort')?.value || 'featured';
  let list = PRODUCTS.filter(p => p.cat === grid.dataset.cat && (p.title + ' ' + p.summary).toLowerCase().includes(q));
  if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
  $('product-count').textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;

  grid.innerHTML = list.length ? list.map(p => `
    <article class="mt-plate mt-lift p-5 flex flex-col gap-5">
      <div class="mt-media" data-media="">${icon(cat.icon, 'ico')}<span class="mt-media__label">Preview soon</span></div>
      <div class="space-y-2 flex-1">
        <div class="flex items-start justify-between gap-4">
          <h3 class="font-display font-bold text-lg text-softWhite">${p.title}</h3>
          <span class="font-display font-bold text-lg ${p.price === 0 ? 'text-industrialLime' : 'text-softWhite'}">${priceLabel(p)}</span>
        </div>
        <p class="text-sm text-softWhite/70">${p.summary}</p>
      </div>
      <div class="flex items-center gap-3">
        <button type="button" data-details="${p.id}" class="flex-1 mt-btn mt-btn--sm">Details</button>
        ${buyButton(p)}
      </div>
    </article>`).join('')
    : `<div class="col-span-full mt-well p-10 text-center font-mono text-sm text-industrialSage">Nothing matches that search yet.</div>`;
}

function openProductPreview(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const cat = catOf(p.cat);
  $('product-modal-content').innerHTML = `
    <div class="flex items-center justify-between pb-4 mb-5 border-b border-softWhite/10">
      <div><span class="mt-label text-industrialLime">${cat.name}</span><h3 class="font-display font-bold text-2xl text-softWhite">${p.title}</h3></div>
      <button type="button" data-close-modal class="mt-key mt-key--round !w-10" aria-label="Close">${icon('i-close')}</button>
    </div>
    <div class="space-y-5">
      <div class="mt-media" data-media="">${icon(cat.icon, 'ico')}<span class="mt-media__label">Preview soon</span></div>
      <p class="text-base text-softWhite/80">${p.summary}</p>
      <ul class="space-y-2.5 text-sm text-softWhite/85">${p.features.map(f => `<li class="flex items-center gap-3">${icon('i-check', 'ico text-industrialLime')}${f}</li>`).join('')}</ul>
      <div class="mt-well p-4 font-mono text-xs"><span class="mt-label block mb-1">Works with</span><span class="text-softWhite">${p.compatibility}</span></div>
      <div class="pt-4 border-t border-softWhite/10 flex items-center justify-between gap-4">
        <span class="font-display font-bold text-3xl ${p.price === 0 ? 'text-industrialLime' : 'text-softWhite'}">${priceLabel(p)}</span>
        ${buyButton(p, true)}
      </div>
    </div>`;
  $('product-modal').classList.remove('hidden');
}

// ---- Events --------------------------------------------------------------
document.addEventListener('click', e => {
  const t = e.target.closest('[data-add],[data-details],[data-remove],[data-close-modal]');
  if (t?.dataset.add) { addToCart(t.dataset.add); $('product-modal')?.classList.add('hidden'); }
  else if (t?.dataset.details) openProductPreview(t.dataset.details);
  else if (t?.dataset.remove) window.removeFromCart(t.dataset.remove);
  else if (t?.hasAttribute('data-close-modal')) $('product-modal').classList.add('hidden');
  else if (e.target.classList?.contains('mt-modal')) e.target.classList.add('hidden');
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.mt-modal').forEach(m => m.classList.add('hidden'));
  $('cart-drawer').classList.add('hidden');
});
$('store-search')?.addEventListener('input', renderProducts);
$('store-sort')?.addEventListener('change', renderProducts);

updateCartUI();
renderProducts();
