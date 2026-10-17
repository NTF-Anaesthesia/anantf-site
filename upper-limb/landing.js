/* Upper-limb blocks landing page: "Which block for which operation" chooser.
   The operations, block links and arm figure live in /shared/regional/js/ops/ops-upperlimb.js (shared with /blocks/).
   No sources or references are shown on the page (as on the other region landings). */
import { LINKS as L, OP_REGIONS as REGIONS, OPS, upperLimbCoverageMap } from '../shared/regional/js/ops/ops-upperlimb.js?v=20261016';
import { initAppFeel } from '../shared/regional/js/appnav.js?v=20261026'; // app bar auto-hide (Settings), keys, prefetch

/* ------------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function links(keys) {
  const ks = [...new Set(keys || [])].filter((k) => L[k]);
  return ks.map((k) => {
    const [href, name, page] = L[k];
    return `<a class="tb-opt-page" href="${href}">${esc(name[0].toUpperCase() + name.slice(1))} <span class="ul-opt-pg">(${esc(page)})</span> <span aria-hidden="true">→</span></a>`;
  }).join('');
}

function render(op, announce) {
  const body = $('#tb-result-body');
  const groups = op.groups.map((g) => `
    <h4 class="tb-opt-h${/^Not/.test(g.label) ? ' ul-opt-h--no' : ''}">${esc(g.label)}</h4>
    <ul class="tb-opts">${g.items.map((it) => `
      <li class="tb-opt">
        <div class="tb-opt-main"><span class="tb-opt-name">${esc(it.name)}</span></div>
        ${it.dose ? `<p class="ul-opt-dose"><span class="ul-opt-k">Dose</span> ${esc(it.dose)}</p>` : ''}
        ${it.why ? `<p class="tb-opt-why">${esc(it.why)}</p>` : ''}
        ${it.blocks && it.blocks.length ? `<div class="tb-opt-links">${links(it.blocks)}</div>` : ''}
      </li>`).join('')}
    </ul>`).join('');
  const li = (arr) => arr.map((t) => `<li>${esc(t)}</li>`).join('');
  body.innerHTML = `
    <h3 class="tb-res-title" id="tb-res-title" tabindex="-1">${esc(op.name)}</h3>
    <p class="ul-line"><span class="ul-line-k">In one line</span>${esc(op.line)}</p>
    <div class="tb-res-grid${op.map ? '' : ' tb-res-grid--text'}">
      ${op.map ? '<div class="tb-fig ul-fig-slot"></div>' : ''}
      <div class="tb-res-text">
        <dl class="tb-facts">
          <div><dt>Area to cover</dt><dd><span class="tb-val">${esc(op.cover)}</span></dd></div>
          ${op.tq ? `<div><dt>Tourniquet</dt><dd><span class="ul-dd">${esc(op.tq)}</span></dd></div>` : ''}
        </dl>
        <h4 class="tb-sub">Block options</h4>
        ${groups}
        <h4 class="tb-sub">What they miss</h4>
        <ul class="tb-notes ul-miss">${li(op.misses)}</ul>
        <h4 class="tb-sub">Practical notes</h4>
        <ul class="tb-notes">${li(op.notes)}</ul>
        ${op.more ? `<div class="tb-opt-links ul-more">${links(op.more)}</div>` : ''}
      </div>
    </div>`;
  const fig = upperLimbCoverageMap(op);
  if (fig) $('.ul-fig-slot', body).append(fig);
  if (announce) $('#tb-status').textContent = `${op.name}. ${op.line}`;
}

function init() {
  const list = $('#tb-ops');
  if (!list) return;
  list.innerHTML = REGIONS.map(([r, label]) => {
    const ops = OPS.filter((o) => o.region === r);
    return `<p class="ul-ops-region" aria-hidden="true">${esc(label)}</p>` + ops.map((op) => `
    <label class="tb-op"><input type="radio" name="tb-op" value="${op.id}"><span>${esc(op.name)}</span></label>`).join('');
  }).join('');
  let start = OPS[0];
  const m = location.hash.match(/^#op-([\w-]+)$/);
  if (m) { const f = OPS.find((o) => o.id === m[1]); if (f) start = f; }
  list.querySelector(`input[value="${start.id}"]`).checked = true;
  render(start, false);
  // A deep link to an operation (#op-<id>) lands on its result, not the top of the page.
  if (m) requestAnimationFrame(() => document.getElementById('tb-res-title')?.scrollIntoView({ block: 'start', behavior: 'auto' }));
  window.addEventListener('hashchange', () => {
    const h = location.hash.match(/^#op-([\w-]+)$/);
    const f = h && OPS.find((o) => o.id === h[1]);
    if (!f) return;
    list.querySelector(`input[value="${f.id}"]`).checked = true;
    render(f, true);
    document.getElementById('tb-res-title')?.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
  // On one-column layouts the result sits below the list: bring it into view after a tap or click (not while
  // arrowing through the radios with the keyboard, which would scroll the group away).
  let byPointer = false;
  list.addEventListener('pointerdown', () => { byPointer = true; });
  list.addEventListener('keydown', () => { byPointer = false; });
  list.addEventListener('change', (e) => {
    const op = OPS.find((o) => o.id === e.target.value);
    if (!op) return;
    render(op, true);
    try { history.replaceState(null, '', '#op-' + op.id); } catch (_) { /* file:// or sandbox */ }
    if (byPointer && window.matchMedia('(max-width:1100px)').matches) {
      const t = $('#tb-res-title');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      t?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  });
}

init();

/* ------------------------------------------------------------------ app frame: the bar (Settings; auto-hide if turned on there).
   No desktop rail here: the operation chooser needs the full width of the page (ENGINE.md §2). */
initAppFeel({ bar: document.getElementById('ra-sbar') });
