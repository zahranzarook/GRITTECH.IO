// GRIT member area: sign in / create account, then a personal dashboard.
// Stage 1: accounts, profile, free Academy area.
// Stage 2 (payments) fills users/{uid}/purchases; services fill users/{uid}/projects;
// Stage 3 (courses) fills users/{uid}/enrollments. The dashboard already reads all three.
import { auth, db, isConfigured } from './firebase.js';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, sendEmailVerification,
  updateProfile, signOut,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore/lite';

// ---------------------------------------------------------------
// Content that is not per-user (moves to Firestore when the catalogue is live)
// ---------------------------------------------------------------
const FREE_DOWNLOADS = [
  { id: 'starter-prompts', title: 'Starter Prompt Pack', type: 'Prompt pack', icon: 'i-prompt' },
  { id: 'html-starter', title: 'HTML + Tailwind Starter', type: 'Starter file', icon: 'i-file' },
  { id: 'launch-checklist', title: 'Website Launch Checklist', type: 'Checklist', icon: 'i-check' },
];

const COURSES = [
  { id: 'ai-agents', title: 'Build Your First AI Agent', lessons: 8 },
  { id: 'tactile-ui', title: 'Tactile UI & Design Systems', lessons: 10 },
  { id: 'saas-mvp', title: 'Ship Your First SaaS MVP', lessons: 12 },
];

const PROJECT_STAGES = ['Brief', 'Quote', 'Build', 'Review', 'Live'];

// ---------------------------------------------------------------
// State
// ---------------------------------------------------------------
const params = new URLSearchParams(location.search);
const DEMO = import.meta.env.DEV && params.has('demo');
let state = { user: null, profile: null, purchases: [], projects: [], enrollments: {} };
let authMode = params.get('mode') === 'signup' ? 'signup' : 'signin';
let currentTab = params.get('tab') || 'overview';

const $ = id => document.getElementById(id);
const icon = (id, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"/></svg>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = ts => {
  const d = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};
const firstName = () => (state.profile?.name || state.user?.displayName || state.user?.email || '').split(/[ @]/)[0];
const initials = () => (state.profile?.name || state.user?.email || '?').split(/[ @.]/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const isPro = () => state.profile?.plan === 'pro';

function show(view) {
  ['view-loading', 'view-auth', 'view-dashboard', 'view-setup'].forEach(v => $(v).classList.toggle('hidden', v !== view));
  $('nav-signout').classList.toggle('hidden', view !== 'view-dashboard');
}

let toastTimer;
function toast(msg) {
  $('toast-message').textContent = msg;
  $('toast-box').classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast-box').classList.add('hidden'), 4200);
}

// ---------------------------------------------------------------
// Auth view
// ---------------------------------------------------------------
const AUTH_ERRORS = {
  'auth/invalid-credential': 'That email and password don\'t match. Try again or reset your password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/email-already-in-use': 'There\'s already an account with this email. Sign in instead.',
  'auth/weak-password': 'Use at least 8 characters for your password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a minute and try again.',
  'auth/popup-closed-by-user': 'The Google window was closed before signing in.',
  'auth/network-request-failed': 'Network problem. Check your connection and try again.',
  'auth/unauthorized-domain': 'Google sign-in isn\'t enabled on this address yet. Use email instead.',
};
const authError = e => AUTH_ERRORS[e?.code] || 'Something went wrong. Please try again.';

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === 'signup';
  document.querySelectorAll('#auth-tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.mode === mode ? 'true' : 'false'));
  $('auth-title').textContent = signup ? 'Create your free account.' : 'Welcome back.';
  $('auth-sub').textContent = signup ? 'Free downloads, your purchases and your projects, all in one place.' : 'Sign in to your purchases, projects and Academy.';
  $('field-name').classList.toggle('hidden', !signup);
  $('a-name').required = signup;
  $('a-password').autocomplete = signup ? 'new-password' : 'current-password';
  $('auth-submit').textContent = signup ? 'Create Free Account →' : 'Sign In →';
  $('forgot-link').classList.toggle('hidden', signup);
  $('auth-error').classList.add('hidden');
}

function showAuthError(msg) {
  $('auth-error').textContent = msg;
  $('auth-error').classList.remove('hidden');
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = $('a-email').value.trim();
  const password = $('a-password').value;
  const btn = $('auth-submit');
  btn.disabled = true;
  try {
    if (authMode === 'signup') {
      if (password.length < 8) throw { code: 'auth/weak-password' };
      const name = $('a-name').value.trim();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await ensureProfile(cred.user, name);
      sendEmailVerification(cred.user).catch(() => {});
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    showAuthError(authError(err));
  } finally {
    btn.disabled = false;
  }
}

async function handleGoogle() {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err) {
    showAuthError(authError(err));
  }
}

async function handleForgot() {
  const email = $('a-email').value.trim();
  if (!email) { showAuthError('Type your email above, then tap "Forgot password?" again.'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    toast('If that email has an account, a reset link is on its way.');
  } catch (err) {
    showAuthError(authError(err));
  }
}

// ---------------------------------------------------------------
// Data
// ---------------------------------------------------------------
async function ensureProfile(user, name) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const profile = { name: name || user.displayName || '', email: user.email, plan: 'free', createdAt: serverTimestamp() };
  await setDoc(ref, profile);
  return profile;
}

async function loadMemberData(user) {
  state.profile = await ensureProfile(user);
  const sub = async (name, order) => {
    try {
      const snap = await getDocs(order ? query(collection(db, 'users', user.uid, name), orderBy(order, 'desc')) : collection(db, 'users', user.uid, name));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { return []; }
  };
  const [purchases, projects, enrollments] = await Promise.all([
    sub('purchases', 'purchasedAt'), sub('projects', 'updatedAt'), sub('enrollments'),
  ]);
  state.purchases = purchases;
  state.projects = projects;
  state.enrollments = Object.fromEntries(enrollments.map(e => [e.id, e]));
}

function loadDemoData() {
  state.user = { uid: 'demo', email: 'zahran@example.com', displayName: 'Zahran', emailVerified: false };
  state.profile = { name: 'Zahran', email: 'zahran@example.com', plan: 'free', createdAt: new Date() };
  state.purchases = [
    { id: 'o1', title: 'Obsidian Core UI Kit', category: 'UI Elements', price: 79, licence: 'Commercial', purchasedAt: new Date('2026-11-20') },
    { id: 'o2', title: 'Nexus SaaS Theme', category: 'Theme', price: 59, licence: 'Personal', purchasedAt: new Date('2026-11-02') },
  ];
  state.projects = [{ id: 'p1', title: 'Clinic booking website', type: 'Website', stage: 2, updatedAt: new Date('2026-11-24'), note: 'Homepage design ready for your review.' }];
  state.enrollments = { 'ai-agents': { progress: 3 } };
}

// ---------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------
const TABS = ['overview', 'purchases', 'projects', 'academy', 'settings'];

function renderDashboard() {
  $('dash-name').textContent = firstName() || 'there';
  $('dash-avatar').textContent = initials();
  $('dash-plan').textContent = isPro() ? 'Pro member' : 'Free member';
  $('verify-banner').classList.toggle('hidden', !!state.user?.emailVerified);
  selectTab(TABS.includes(currentTab) ? currentTab : 'overview');
}

function selectTab(tab) {
  currentTab = tab;
  document.querySelectorAll('#dash-tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false'));
  const render = { overview: renderOverview, purchases: renderPurchases, projects: renderProjects, academy: renderAcademy, settings: renderSettings }[tab];
  $('dash-panel').innerHTML = render();
  if (tab === 'settings') bindSettings();
  history.replaceState(null, '', tab === 'overview' ? location.pathname + (DEMO ? '?demo' : '') : `?tab=${tab}${DEMO ? '&demo' : ''}`);
}

const emptyState = (ic, title, text, cta, href) => `
  <div class="mt-well p-10 text-center space-y-4">
    <span class="mt-key mx-auto text-industrialLime">${icon(ic)}</span>
    <h3 class="font-display font-bold text-lg text-softWhite">${title}</h3>
    <p class="text-sm text-softWhite/70 max-w-sm mx-auto">${text}</p>
    <a href="${href}" class="mt-btn mt-btn--primary mt-btn--sm">${cta}</a>
  </div>`;

const sectionHead = (title, sub) => `
  <div class="mb-6"><h2 class="font-display font-bold text-2xl text-softWhite">${title}</h2>${sub ? `<p class="text-sm text-softWhite/70 mt-1">${sub}</p>` : ''}</div>`;

function courseProgress(c) {
  const done = state.enrollments[c.id]?.progress || 0;
  return { done, pct: Math.round((done / c.lessons) * 100) };
}

function renderOverview() {
  const active = state.projects.filter(p => (p.stage ?? 0) < PROJECT_STAGES.length - 1).length;
  const started = COURSES.filter(c => courseProgress(c).done > 0);
  const tile = (label, value, sub, tab) => `
    <button type="button" data-goto="${tab}" class="mt-well mt-lift p-6 text-left space-y-2 w-full">
      <span class="mt-label block">${label}</span>
      <span class="font-display font-bold text-4xl text-softWhite block">${value}</span>
      <span class="text-sm text-softWhite/60">${sub}</span>
    </button>`;
  const next = started[0];
  return `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      ${tile('Purchases', state.purchases.length, state.purchases.length ? 'Ready to download' : 'Nothing yet', 'purchases')}
      ${tile('Active projects', active, active ? 'In progress with GRIT' : 'No active projects', 'projects')}
      ${tile('Academy', started.length, started.length ? 'Courses in progress' : 'Start with a free download', 'academy')}
    </div>

    ${next ? `
      <div class="mt-row mt-6 flex-col sm:flex-row items-start sm:items-center justify-between">
        <div class="flex items-center gap-4 w-full">
          <span class="mt-key !w-11 shrink-0 text-industrialLime">${icon('i-learn')}</span>
          <div class="flex-1 space-y-2">
            <div class="flex justify-between gap-4"><span class="font-display font-bold text-softWhite">Continue: ${esc(next.title)}</span><span class="font-mono text-xs text-industrialSage">${courseProgress(next).done}/${next.lessons} lessons</span></div>
            <div class="mt-meter" style="--v:${courseProgress(next).pct}%"><span></span></div>
          </div>
        </div>
      </div>` : ''}

    <div class="mt-8">
      <span class="mt-label block mb-4">Quick actions</span>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/#store" class="mt-row mt-lift"><span class="mt-key !w-11 shrink-0 text-industrialLime">${icon('i-bag')}</span><span class="font-display font-bold text-softWhite">Browse the Store</span></a>
        <a href="/#services" class="mt-row mt-lift"><span class="mt-key !w-11 shrink-0 text-industrialLime">${icon('i-web')}</span><span class="font-display font-bold text-softWhite">Start a Project</span></a>
        <button type="button" data-goto="academy" class="mt-row mt-lift text-left"><span class="mt-key !w-11 shrink-0 text-industrialLime">${icon('i-down')}</span><span class="font-display font-bold text-softWhite">Free Downloads</span></button>
      </div>
    </div>`;
}

function renderPurchases() {
  if (!state.purchases.length) {
    return sectionHead('Purchases', 'Themes, UI kits and files you buy appear here, ready to download any time.') +
      emptyState('i-bag', 'No purchases yet', 'When you buy from the GRIT Store, your files and licences live here.', 'Browse the Store →', '/#store');
  }
  return sectionHead('Purchases', 'Download your files any time. Links are created fresh each time.') + `
    <div class="space-y-3">
      ${state.purchases.map(p => `
        <div class="mt-row flex-col sm:flex-row items-start sm:items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="mt-key !w-11 shrink-0 text-industrialLime">${icon('i-file')}</span>
            <div>
              <span class="font-mono text-[10px] uppercase tracking-wider text-industrialLime block">${esc(p.category || 'Product')}</span>
              <h3 class="font-display font-bold text-base text-softWhite">${esc(p.title)}</h3>
              <p class="text-xs text-industrialSage">${fmtDate(p.purchasedAt)}${p.licence ? ` · ${esc(p.licence)} licence` : ''}</p>
            </div>
          </div>
          <button type="button" data-download="${esc(p.id)}" class="mt-btn mt-btn--primary mt-btn--sm shrink-0">${icon('i-down', 'ico')} Download</button>
        </div>`).join('')}
    </div>`;
}

function renderProjects() {
  if (!state.projects.length) {
    return sectionHead('Projects', 'Websites, apps and AI work we build for you, with live progress.') +
      emptyState('i-web', 'No projects yet', 'Start a project and follow every step here: brief, quote, build, review, launch.', 'Start a Project →', '/#services');
  }
  return sectionHead('Projects', 'Follow every stage of your build.') + `
    <div class="space-y-4">
      ${state.projects.map(p => {
        const stage = Math.min(p.stage ?? 0, PROJECT_STAGES.length - 1);
        return `
        <div class="mt-plate p-6 space-y-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span class="font-mono text-[10px] uppercase tracking-wider text-industrialLime block">${esc(p.type || 'Project')}</span>
              <h3 class="font-display font-bold text-xl text-softWhite">${esc(p.title)}</h3>
            </div>
            <span class="mt-pill mt-pill--accent !py-1 !px-3 !text-[10px]">${PROJECT_STAGES[stage]}</span>
          </div>
          <div class="mt-meter" style="--v:${((stage + 1) / PROJECT_STAGES.length) * 100}%"><span></span></div>
          <div class="grid grid-cols-5 gap-1 font-mono text-[10px] uppercase tracking-wider">
            ${PROJECT_STAGES.map((s, i) => `<span class="${i <= stage ? 'text-softWhite' : 'text-industrialSage/60'}">${s}</span>`).join('')}
          </div>
          ${p.note ? `<p class="mt-well p-4 text-sm text-softWhite/80">${esc(p.note)}</p>` : ''}
          <p class="text-xs text-industrialSage">Updated ${fmtDate(p.updatedAt)}</p>
        </div>`;
      }).join('')}
    </div>`;
}

function renderAcademy() {
  const pro = isPro();
  return sectionHead('Academy', pro ? 'Your Pro membership: every course and file.' : 'Your free downloads are below. Full courses come with Pro.') + `
    <span class="mt-label block mb-4">Free downloads</span>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      ${FREE_DOWNLOADS.map(d => `
        <div class="mt-well p-5 space-y-4">
          <span class="mt-key !w-11 text-industrialLime">${icon(d.icon)}</span>
          <div>
            <span class="font-mono text-[10px] uppercase tracking-wider text-industrialSage block">${d.type}</span>
            <h3 class="font-display font-bold text-base text-softWhite">${d.title}</h3>
          </div>
          <button type="button" data-free="${d.id}" class="w-full mt-btn mt-btn--sm">${icon('i-down', 'ico')} Download</button>
        </div>`).join('')}
    </div>

    <div class="flex items-center justify-between mb-4">
      <span class="mt-label">Courses</span>
      ${pro ? '' : '<span class="mt-pill !py-1 !px-3 !text-[10px]">Pro · Coming soon</span>'}
    </div>
    <div class="space-y-3">
      ${COURSES.map(c => {
        const { done, pct } = courseProgress(c);
        return `
        <div class="mt-row ${pro || done ? '' : 'opacity-60'}">
          <span class="mt-key !w-11 shrink-0 text-industrialLime">${icon(pro || done ? 'i-play' : 'i-lock')}</span>
          <div class="flex-1 space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-display font-bold text-softWhite">${c.title}</span>
              <span class="font-mono text-xs text-industrialSage shrink-0">${done}/${c.lessons} lessons</span>
            </div>
            <div class="mt-meter" style="--v:${pct}%"><span></span></div>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${pro ? '' : `
      <div class="mt-row mt-6 flex-col sm:flex-row items-start sm:items-center justify-between">
        <div><h3 class="font-display font-bold text-base text-softWhite">Want the full courses?</h3><p class="text-sm text-softWhite/70">Join the Pro waitlist and we'll tell you first.</p></div>
        <button type="button" id="pro-waitlist" class="mt-btn mt-btn--primary mt-btn--sm shrink-0">Join the Pro Waitlist →</button>
      </div>`}`;
}

function renderSettings() {
  const verified = state.user?.emailVerified;
  return sectionHead('Settings') + `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form id="profile-form" class="mt-plate p-6 space-y-5">
        <span class="mt-label block">Profile</span>
        <div><label for="s-name" class="mt-label block mb-2">Name</label><input id="s-name" name="name" type="text" required maxlength="80" value="${esc(state.profile?.name)}" class="mt-input" /></div>
        <div>
          <label for="s-email" class="mt-label block mb-2">Email</label>
          <input id="s-email" type="email" value="${esc(state.user?.email)}" disabled class="mt-input opacity-70" />
          <p class="text-xs mt-2 ${verified ? 'text-industrialLime' : 'text-industrialSage'}">${verified ? 'Verified' : 'Not verified yet'}</p>
        </div>
        <button type="submit" class="mt-btn mt-btn--primary mt-btn--sm">Save Changes</button>
      </form>

      <div class="mt-plate p-6 space-y-4">
        <span class="mt-label block">Account</span>
        <div class="mt-row justify-between">
          <div><h3 class="font-display font-bold text-sm text-softWhite">Plan</h3><p class="text-xs text-industrialSage">${isPro() ? 'Pro' : 'Free'}</p></div>
          ${isPro() ? '' : '<span class="mt-pill !py-1 !px-3 !text-[10px]">Pro coming soon</span>'}
        </div>
        <div class="mt-row justify-between">
          <div><h3 class="font-display font-bold text-sm text-softWhite">Password</h3><p class="text-xs text-industrialSage">We'll email you a reset link.</p></div>
          <button type="button" id="s-reset" class="mt-btn mt-btn--sm">Send Link</button>
        </div>
        <div class="mt-row justify-between">
          <div><h3 class="font-display font-bold text-sm text-softWhite">Sign out</h3><p class="text-xs text-industrialSage">On this device.</p></div>
          <button type="button" id="s-signout" class="mt-btn mt-btn--sm">Sign Out</button>
        </div>
        <p class="text-xs text-industrialSage">Member since ${fmtDate(state.profile?.createdAt)}. To delete your account, email hello@grittech.io.</p>
      </div>
    </div>`;
}

function bindSettings() {
  $('profile-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('s-name').value.trim();
    if (!name) return;
    try {
      if (!DEMO) {
        await updateProfile(auth.currentUser, { displayName: name });
        await updateDoc(doc(db, 'users', state.user.uid), { name });
      }
      state.profile.name = name;
      $('dash-name').textContent = firstName();
      $('dash-avatar').textContent = initials();
      toast('Saved.');
    } catch { toast('Could not save. Please try again.'); }
  });
  $('s-reset').addEventListener('click', async () => {
    try { if (!DEMO) await sendPasswordResetEmail(auth, state.user.email); toast('Reset link sent to your email.'); }
    catch { toast('Could not send the link. Please try again.'); }
  });
  $('s-signout').addEventListener('click', doSignOut);
}

async function doSignOut() {
  if (DEMO) { location.href = '/account/'; return; }
  await signOut(auth);
}

// Delegated clicks inside the dashboard
document.addEventListener('click', e => {
  const t = e.target.closest('[data-goto],[data-download],[data-free],#pro-waitlist');
  if (!t) return;
  if (t.dataset.goto) selectTab(t.dataset.goto);
  else if (t.dataset.download) toast('Downloads switch on when the store goes live.');
  else if (t.dataset.free) toast('This download is being finished. We\'ll email you when it\'s ready.');
  else if (t.id === 'pro-waitlist') toast('You\'re on the Pro waitlist.');
});

// ---------------------------------------------------------------
// Boot
// ---------------------------------------------------------------
function init() {
  document.querySelectorAll('#auth-tabs button').forEach(b => b.addEventListener('click', () => setAuthMode(b.dataset.mode)));
  document.querySelectorAll('#dash-tabs button').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.tab)));
  $('auth-form').addEventListener('submit', handleAuthSubmit);
  $('google-btn').addEventListener('click', handleGoogle);
  $('forgot-link').addEventListener('click', handleForgot);
  $('nav-signout').addEventListener('click', doSignOut);
  $('verify-resend').addEventListener('click', async () => {
    try { if (!DEMO) await sendEmailVerification(auth.currentUser); toast('Verification email sent.'); }
    catch { toast('Please wait a minute before asking again.'); }
  });
  setAuthMode(authMode);

  if (DEMO) { loadDemoData(); show('view-dashboard'); renderDashboard(); return; }
  if (!isConfigured) { show('view-setup'); return; }

  onAuthStateChanged(auth, async user => {
    if (!user) { state = { user: null, profile: null, purchases: [], projects: [], enrollments: {} }; show('view-auth'); return; }
    show('view-loading');
    state.user = user;
    try {
      await loadMemberData(user);
    } catch {
      state.profile = { name: user.displayName || '', email: user.email, plan: 'free' };
      toast('Some account details could not load. Please refresh.');
    }
    show('view-dashboard');
    renderDashboard();
  });
}

init();
