// /checkout/success/: Ziina sends the buyer back here with ?pi=<payment id>.
// We ask the payments Worker to confirm the payment (it checks with Ziina directly), then show the downloads.
import { payCall, download } from './pay.js';

const $ = id => document.getElementById(id);
const q = new URLSearchParams(location.search);
const pi = q.get('pi');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const show = (title, text, html = '') => { $('co-title').textContent = title; $('co-text').textContent = text; $('co-body').innerHTML = html; };
function toast(msg) { const b = $('toast-box'); $('toast-message').textContent = msg; b.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(() => b.classList.add('hidden'), 4200); }

async function run() {
  if (!pi) return show('No order to show', 'If you just paid, open your account to find your downloads.', '<a href="/account/?tab=purchases" class="mt-btn mt-btn--primary">Go to my purchases →</a>');
  if (q.get('cancelled') || q.get('failed')) {
    return show(q.get('failed') ? 'The payment didn\'t go through' : 'Checkout cancelled', 'Nothing was charged. Your cart is still saved, so you can try again any time.',
      '<button type="button" onclick="toggleCartDrawer()" class="mt-btn mt-btn--primary">Open cart</button> <a href="/#store" class="mt-btn">Back to the store</a>');
  }
  for (let i = 0; i < 12; i++) {
    let r;
    try { r = await payCall('/confirm', { pi }); }
    catch (e) {
      if (e.signin) return show('Sign in to see your order', 'Your order is saved to your account.', `<a href="/account/?tab=purchases" class="mt-btn mt-btn--primary">Sign in →</a>`);
      return show('We couldn\'t check this order', e.message, '<a href="/account/?tab=purchases" class="mt-btn mt-btn--primary">Go to my purchases →</a>');
    }
    if (r.status === 'completed') {
      localStorage.setItem('grit-cart', '[]');
      return show('Payment received. Thank you!', `Your files are ready${r.test ? ' (test payment)' : ''}. They're also saved in your account, so you can download them again any time.`,
        `<div class="space-y-3">${r.items.map(it => `<div class="mt-row justify-between gap-4"><span class="font-display font-bold text-softWhite">${esc(it.title)}</span><button type="button" data-dl="${esc(it.id)}" class="mt-btn mt-btn--primary mt-btn--sm">Download</button></div>`).join('')}</div>
         <p class="mt-6"><a href="/account/?tab=purchases" class="text-industrialLime hover:text-softWhite font-mono text-sm">Go to my purchases →</a></p>`);
    }
    if (['failed', 'canceled'].includes(r.status)) return show('The payment didn\'t go through', 'Nothing was charged. Your cart is still saved.', '<button type="button" onclick="toggleCartDrawer()" class="mt-btn mt-btn--primary">Open cart</button>');
    show('Confirming your payment…', 'This usually takes a few seconds.');
    await new Promise(res => setTimeout(res, 2500));
  }
  show('Still confirming your payment', 'Your bank is taking a little longer. We\'ll add the files to your account as soon as it clears.', '<a href="/account/?tab=purchases" class="mt-btn mt-btn--primary">Go to my purchases →</a>');
}
document.addEventListener('click', e => { const b = e.target.closest('[data-dl]'); if (b) download(b.dataset.dl, toast); });
run();
