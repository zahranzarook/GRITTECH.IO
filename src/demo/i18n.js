// Tiny EN/AR switcher for GRIT demos: flips dir=rtl, swaps static text by selector, loads Arabic fonts on demand,
// remembers the choice, and lets the page re-render its dynamic parts through onChange(lang).
const FONTS = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';
const CSS = `
.lang-btn{display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:40px;padding:0 12px;border-radius:99px;border:1px solid currentColor;background:transparent;color:inherit;font:600 13px/1 'IBM Plex Sans Arabic',system-ui,sans-serif;cursor:pointer;opacity:.85;transition:opacity .2s,transform .2s}
.lang-btn:hover{opacity:1}.lang-btn:active{transform:scale(.95)}
html[dir=rtl] body{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif}
html[dir=rtl] h1,html[dir=rtl] h2,html[dir=rtl] h3{font-family:'Amiri','IBM Plex Sans Arabic',serif;letter-spacing:0}
html[dir=rtl] i,html[dir=rtl] em{font-style:normal}
html[dir=rtl] .eyebrow,html[dir=rtl] legend{letter-spacing:0;text-transform:none}
`;
export function i18n({ key, mount, before, dict, onChange }) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  let lang = 'en';
  try { lang = localStorage.getItem(key) || 'en'; } catch { /* storage unavailable */ }
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'lang-btn';
  btn.setAttribute('aria-label', 'Switch language');
  before ? before.before(btn) : mount.prepend(btn);
  let fontsAdded = false;
  function apply(l) {
    lang = l;
    if (l === 'ar' && !fontsAdded) { const ln = document.createElement('link'); ln.rel = 'stylesheet'; ln.href = FONTS; document.head.append(ln); fontsAdded = true; }
    document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    for (const [sel, ar, attr] of dict) {
      document.querySelectorAll(sel).forEach(el => {
        const k = attr ? 'en_' + attr.replace(/-/g, '_') : 'en_html';
        if (!(k in el.dataset)) el.dataset[k] = attr ? (el.getAttribute(attr) || '') : el.innerHTML;
        const v = l === 'ar' ? ar : el.dataset[k];
        attr ? el.setAttribute(attr, v) : (el.innerHTML = v);
      });
    }
    btn.textContent = l === 'ar' ? 'EN' : 'عربي';
    try { localStorage.setItem(key, l); } catch { /* storage unavailable */ }
    onChange?.(l);
  }
  btn.onclick = () => apply(lang === 'ar' ? 'en' : 'ar');
  return { lang: () => lang, t: (en, ar) => (lang === 'ar' ? ar : en), start: () => apply(lang) };
}
