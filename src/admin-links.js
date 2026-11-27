// /admin/links/: create a one-off Ziina payment link (packages, services, deposits). Admins only; the Worker checks.
import { payCall } from './pay.js';

const $ = id => document.getElementById(id);
$('al-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = $('al-go'); btn.disabled = true; btn.textContent = 'Creating…';
  $('al-out').classList.add('hidden');
  try {
    const r = await payCall('/admin/link', { amount: $('al-amount').value, currency: $('al-cur').value, message: $('al-msg').value, test: $('al-test').checked });
    $('al-url').value = r.url;
    $('al-note').textContent = r.test ? 'Test link: no real money moves.' : 'Live link: send it to your client.';
    $('al-out').classList.remove('hidden');
  } catch (err) {
    $('al-err').textContent = err.signin ? 'Sign in with your admin account first (Account page).' : err.message;
    $('al-err').classList.remove('hidden');
    setTimeout(() => $('al-err').classList.add('hidden'), 6000);
  } finally { btn.disabled = false; btn.textContent = 'Create payment link'; }
});
$('al-copy').addEventListener('click', async () => { await navigator.clipboard.writeText($('al-url').value); $('al-copy').textContent = 'Copied ✓'; setTimeout(() => ($('al-copy').textContent = 'Copy'), 1600); });
