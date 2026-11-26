// GRIT live-demo bar shown on top of every theme / app demo. Not part of the product itself.
const CSS = `
.gritbar{position:relative;z-index:9999;display:flex;align-items:center;gap:10px;padding:8px 12px;background:#101211;color:#e9ece7;font:500 12px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;border-bottom:1px solid rgba(233,236,231,.08)}
.gritbar__tag{flex:none;padding:4px 9px;border-radius:99px;background:#83a94b;color:#101211;font:700 10px ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase}
.gritbar__text{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#c5cbc3}
.gritbar__text b{color:#e9ece7;font-weight:600}
.gritbar a{flex:none;padding:6px 12px;border-radius:99px;border:1px solid rgba(233,236,231,.18);color:#e9ece7;text-decoration:none;white-space:nowrap}
.gritbar a.is-main{background:#a3c96a;border-color:#a3c96a;color:#101211;font-weight:600}
.gritbar a:hover{border-color:#a3c96a}
.gritbar button{flex:none;width:26px;height:26px;border:0;border-radius:50%;background:transparent;color:#8d958a;font-size:18px;cursor:pointer}
@media (max-width:640px){.gritbar__text{display:none}.gritbar{justify-content:flex-end}.gritbar__tag{margin-right:auto}}
`;
export function demobar({ name, kind = 'theme', buy, start = 'web' }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const bar = document.createElement('div');
  bar.className = 'gritbar';
  bar.innerHTML = `<span class="gritbar__tag">Live demo</span>
    <span class="gritbar__text">${name} by <b>GRIT Technologies</b></span>
    ${buy ? `<a class="is-main" href="${buy}">Get this ${kind}</a>` : ''}
    <a ${buy ? '' : 'class="is-main"'} href="/?start=${start}">${buy ? 'We build it · theme free' : 'Build one for me'}</a>
    <button type="button" aria-label="Hide demo bar">×</button>`;
  bar.querySelector('button').onclick = () => bar.remove();
  document.body.prepend(bar);
}
