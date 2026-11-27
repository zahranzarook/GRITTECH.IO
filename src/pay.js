// Checkout + downloads: talks to the GRIT payments Worker (pay.grittech.io), which holds the Ziina key.
// Firebase loads only when it's needed (on checkout or download), so store pages stay light.
export const PAY = 'https://pay.grittech.io';

async function currentUser() {
  const { auth } = await import('./firebase.js');
  if (!auth) return null;
  await auth.authStateReady();
  return auth.currentUser;
}

export async function payCall(path, body = {}) {
  const user = await currentUser();
  if (!user) { const e = new Error('Please sign in first.'); e.signin = true; throw e; }
  const r = await fetch(PAY + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await user.getIdToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'The payment service is unavailable right now. Please try again shortly.');
  return data;
}

// Cart → Ziina's secure payment page. Signed-out visitors sign in first; their cart is kept.
export async function startCheckout(ids, toast = () => {}) {
  if (!ids.length) { toast('Your cart is empty.'); return; }
  try {
    toast('Opening secure checkout…');
    const { url } = await payCall('/checkout', { items: ids });
    location.href = url;
  } catch (e) {
    if (e.signin) {
      toast('Sign in or create a free account to check out. Your cart is saved.');
      setTimeout(() => { location.href = '/account/?next=checkout'; }, 1400);
    } else toast(e.message);
  }
}

export async function download(productId, toast = () => {}) {
  try {
    toast('Preparing your download…');
    const { url } = await payCall('/download', { product: productId });
    location.href = url;
  } catch (e) { toast(e.message); }
}

// The homepage cart is plain inline script, so expose checkout globally too.
window.gritCheckout = startCheckout;
