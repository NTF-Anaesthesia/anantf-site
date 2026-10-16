/* Head and neck blocks landing page: "Which block for which operation" chooser.
   The operations, block links and head figure live in /shared/regional/js/ops/ops-headneck.js (shared with /blocks/).
   No sources or references are shown (as on the truncal pages). */
import { registerOffline } from '../shared/regional/js/offline.js?v=20261016'; // the regional offline worker (regional-sw.js)
import { OPS, LINKS, headNeckCoverageMap } from '../shared/regional/js/ops/ops-headneck.js?v=20261015';
import { initAppFeel } from '../shared/regional/js/appnav.js?v=20261026'; // app bar auto-hide (Settings), keys, prefetch

/* ------------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function blockLinks(keys) {
  const links = [...new Set(keys)].filter((k) => LINKS[k]);
  if (!links.length) return '';
  return links.map((k) => {
    const [href, name, page] = LINKS[k];
    return `<a class="tb-opt-page" href="${href}">Open ${esc(name)} on the ${esc(page)} page <span aria-hidden="true">→</span></a>`;
  }).join('');
}

function render(op, announce) {
  const body = $('#tb-result-body');
  const groups = op.groups.map((g) => `
    <h4 class="tb-opt-h">${esc(g.label)}</h4>
    <ul class="tb-opts">${g.items.map((it) => `
      <li class="tb-opt">
        <div class="tb-opt-main"><span class="tb-opt-name">${esc(it.name)}</span></div>
        ${it.why ? `<p class="tb-opt-why">${esc(it.why)}</p>` : ''}
        <div class="tb-opt-links">${blockLinks(it.blocks)}</div>
      </li>`).join('')}
    </ul>`).join('');
  const notes = op.notes.map((n) => `<li>${esc(n.text)}</li>`).join('');
  body.innerHTML = `
    <h3 class="tb-res-title" id="tb-res-title" tabindex="-1">${esc(op.name)}</h3>
    <div class="tb-res-grid${op.map ? '' : ' tb-res-grid--text'}">
      ${op.map ? '<div class="tb-fig hn-fig-slot"></div>' : ''}
      <div class="tb-res-text">
        <dl class="tb-facts">
          <div><dt>Area to cover</dt><dd><span class="tb-val">${esc(op.cover.text)}</span></dd></div>
        </dl>
        <h4 class="tb-sub">Block options</h4>
        ${groups}
        <h4 class="tb-sub">Practical notes</h4>
        <ul class="tb-notes">${notes}</ul>
      </div>
    </div>`;
  if (op.map) $('.hn-fig-slot', body).append(headNeckCoverageMap(op));
  if (announce) $('#tb-status').textContent = `${op.name}. Area to cover: ${op.cover.text}.`;
}

/* On a phone the result sits below the list of operations: bring its title into view (no focus move, so arrow keys
   keep working in the radio group). Nothing moves when the title is already on screen. */
function revealResult() {
  const t = $('#tb-res-title');
  if (!t) return;
  const r = t.getBoundingClientRect();
  if (r.top >= 0 && r.top <= innerHeight * 0.6) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

function init() {
  const list = $('#tb-ops');
  if (!list) return;
  list.innerHTML = OPS.map((op, i) => `
    <label class="tb-op"><input type="radio" name="tb-op" value="${op.id}"${i === 0 ? ' checked' : ''}><span>${esc(op.name)}</span></label>`).join('');
  let start = OPS[0];
  const m = location.hash.match(/^#op-([\w-]+)$/);
  if (m) { const f = OPS.find((o) => o.id === m[1]); if (f) start = f; }
  list.querySelector(`input[value="${start.id}"]`).checked = true;
  render(start, false);
  if (m && start.id === m[1]) requestAnimationFrame(() => $('#tb-res-title')?.scrollIntoView({ block: 'start' }));
  list.addEventListener('change', (e) => {
    const op = OPS.find((o) => o.id === e.target.value);
    if (!op) return;
    render(op, true);
    revealResult();
    try { history.replaceState(null, '', '#op-' + op.id); } catch (_) { /* file:// or sandbox */ }
  });
}

init();
registerOffline();

/* ------------------------------------------------------------------ app frame: the bar (Settings; auto-hide if turned on there).
   No desktop rail here: the operation chooser needs the full width of the page (ENGINE.md §2). */
initAppFeel({ bar: document.getElementById('ra-sbar') });
