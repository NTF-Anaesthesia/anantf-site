/* Truncal blocks landing page: "Which block for which operation" chooser and the at-a-glance table.
   The operations, block links and torso figure live in /shared/regional/js/ops/ops-truncal.js (shared with /blocks/). */
import { registerOffline } from '../shared/regional/js/offline.js?v=20261016'; // the regional offline worker (regional-sw.js)
import { OPS, BLOCK_LINKS, BLOCK_NAMES, PAGE_NAMES, truncalCoverageMap } from '../shared/regional/js/ops/ops-truncal.js?v=20261015';
import { initAppFeel } from '../shared/regional/js/appnav.js?v=20261026'; // app bar auto-hide (Settings), keys, prefetch

export { BLOCK_LINKS };
window.BLOCK_LINKS = BLOCK_LINKS;

/* ------------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function blockLinks(keys) {
  const seen = new Set();
  const links = keys.filter(k => BLOCK_LINKS[k] && !seen.has(BLOCK_LINKS[k]) && seen.add(BLOCK_LINKS[k]));
  if (!links.length) return '<span class="tb-opt-page tb-opt-page--none">Not on these pages</span>';
  return links.map(k => {
    const href = BLOCK_LINKS[k], page = PAGE_NAMES[href.split('#')[0]] || href;
    return `<a class="tb-opt-page" href="${href}">Open ${esc(BLOCK_NAMES[k] || k)} on the ${esc(page)} page <span aria-hidden="true">→</span></a>`;
  }).join('');
}

const figure = op => truncalCoverageMap(op);

/* ------------------------------------------------------------------ render */
function render(op, announce) {
  const body = $('#tb-result-body');
  const groups = op.groups.map(g => `
    <h4 class="tb-opt-h">${esc(g.label)}</h4>
    <ul class="tb-opts">${g.items.map(it => `
      <li class="tb-opt">
        <div class="tb-opt-main"><span class="tb-opt-name">${esc(it.name)}</span></div>
        ${it.why ? `<p class="tb-opt-why">${esc(it.why)}</p>` : ''}
        <div class="tb-opt-links">${blockLinks(it.blocks)}</div>
      </li>`).join('')}
    </ul>`).join('');
  const notes = op.notes.map(n => `<li>${esc(n.text)}</li>`).join('');
  body.innerHTML = `
    <h3 class="tb-res-title" id="tb-res-title" tabindex="-1">${esc(op.name)}${op.brief ? ' <span class="tb-brief">Brief</span>' : ''}</h3>
    <div class="tb-res-grid">
      <figure class="tb-fig">
        ${figure(op)}
        <figcaption>
          <ul class="tb-legend">
            <li><span class="tb-sw tb-sw--spread" aria-hidden="true"></span>Dermatomes to cover${op.side === 'one' ? ' (one side, either)' : ' (both sides)'}</li>
            ${op.single.levels.length ? '<li><span class="tb-sw tb-sw--inj" aria-hidden="true"></span>Single-shot level</li>' : ''}
            ${(op.marks || []).length ? '<li><span class="tb-sw tb-sw--cut" aria-hidden="true"></span>Incision or ports (schematic)</li>' : ''}
          </ul>
          ${op.cover.example ? `<p class="tb-fig-note">${esc(op.cover.example)}</p>` : ''}
          <p class="tb-fig-note">Schematic, front view. Nipple about T4, xiphoid T6, umbilicus T10, groin L1.</p>
        </figcaption>
      </figure>
      <div class="tb-res-text">
        <dl class="tb-facts">
          <div><dt>Dermatomes to cover</dt><dd><span class="tb-val">${esc(op.cover.text)}</span>${op.cover.derivedNote ? `<span class="tb-dnote">${esc(op.cover.derivedNote)}</span>` : ''}</dd></div>
          <div><dt>Single-shot level</dt><dd><span class="tb-val">${esc(op.single.text)}</span></dd></div>
          <div><dt>Sides</dt><dd><span class="tb-val">${op.side === 'one' ? 'One side' : 'Both sides'}</span></dd></div>
        </dl>
        <h4 class="tb-sub">Block options</h4>
        ${groups}
        <h4 class="tb-sub">Practical notes</h4>
        <ul class="tb-notes">${notes}</ul>
      </div>
    </div>`;
  if (announce) {
    $('#tb-status').textContent = `${op.name}. Dermatomes to cover: ${op.cover.text}. Single-shot level: ${op.single.text}.`;
  }
}

/* "All operations at a glance": one row per operation, from each operation's own glance wording. */
function glanceTable() {
  const body = $('#tb-glance-body');
  if (!body) return;
  body.innerHTML = OPS.map(op => `
          <tr><th scope="row"><a href="#op-${op.id}">${esc(op.glance.name)}</a></th><td>${esc(op.glance.cover)}</td><td>${esc(op.glance.single)}</td></tr>`).join('') + '\n        ';
}

function init() {
  glanceTable();
  const list = $('#tb-ops');
  if (!list) return;
  list.innerHTML = OPS.map((op, i) => `
    <label class="tb-op"><input type="radio" name="tb-op" value="${op.id}"${i === 0 ? ' checked' : ''}><span>${esc(op.name)}</span></label>`).join('');
  const fromHash = () => { const m = location.hash.match(/^#op-([\w-]+)$/); return m ? OPS.find(o => o.id === m[1]) : null; };
  const start = fromHash() || OPS[0];
  list.querySelector(`input[value="${start.id}"]`).checked = true;
  render(start, false);
  if (start !== OPS[0] || fromHash()) requestAnimationFrame(() => $('#tb-res-title')?.scrollIntoView({ block: 'start', behavior: 'auto' }));

  // On one-column layouts the result sits below the list: bring it into view after a tap (not while arrowing
  // through the radios with the keyboard, which would scroll the group away).
  const stacked = matchMedia('(max-width: 1100px)');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const reveal = () => {
    const t = $('#tb-res-title');
    if (!t || !stacked.matches) return;
    const r = t.getBoundingClientRect();
    if (r.top < 0 || r.top > innerHeight * 0.6) t.scrollIntoView({ block: 'start', behavior: still.matches ? 'auto' : 'smooth' });
  };
  let pointer = false;
  list.addEventListener('pointerdown', () => { pointer = true; });
  list.addEventListener('keydown', () => { pointer = false; });
  list.addEventListener('change', e => {
    const op = OPS.find(o => o.id === e.target.value);
    if (!op) return;
    render(op, true);
    try { history.replaceState(null, '', '#op-' + op.id); } catch (_) { /* file:// or sandbox */ }
    if (pointer) reveal();
    pointer = false;
  });
  // Links to #op-<id> on this page (the at-a-glance table, or a pasted link) pick that operation.
  window.addEventListener('hashchange', () => {
    const op = fromHash();
    if (!op) return;
    const input = list.querySelector(`input[value="${op.id}"]`);
    if (input && !input.checked) { input.checked = true; render(op, true); }
    const t = $('#tb-res-title');
    if (t) { t.scrollIntoView({ block: 'start', behavior: 'auto' }); t.focus({ preventScroll: true }); }
  });
}

init();
registerOffline();

/* ------------------------------------------------------------------ app frame: the bar (Settings; auto-hide if turned on there).
   No desktop rail here: the operation chooser needs the full width of the page (ENGINE.md §2). */
initAppFeel({ bar: document.getElementById('ra-sbar') });
