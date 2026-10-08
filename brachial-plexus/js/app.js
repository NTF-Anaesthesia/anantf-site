// App shell: wires the modules to the shared bus, renders the block guide,
// and keeps the URL hash (#block=axillary&el=cord-post&tab=guide) in sync.
// Author: Dr Koh Wenjun, NTF Anaesthesia.

import { bus } from './bus.js';
import {
  ELEMENTS, LEVELS, LEVEL_MNEMONIC, BLOCKS, BLOCK_ORDER, BLOCK_ORDER_ADVANCED,
  BLOCK_SUMMARY, BLOCK_SUMMARY_ALL, DISCLAIMER, blockStatus,
} from './data.js';

window.bpBus = bus; // handy for debugging in the console

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LEVEL_NAME = Object.fromEntries(LEVELS.map((l) => [l.id, l.name]));
LEVEL_NAME.collateral = 'Collateral branch';
LEVEL_NAME.related = 'Related nerve (outside the plexus)';
const STATUS_TEXT = { target: 'Injection target', covers: 'Blocked', variable: 'Variably blocked', spares: 'Usually spared' };
const shortBlockName = (b) => b.name.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+block\s*$/i, '').trim();
const spinalText = (list = []) => (list.length > 1 ? `${list[0]}–${list[list.length - 1]}` : list[0] || '');

// ---------------------------------------------------------------- footer text
$('#disclaimer').textContent = DISCLAIMER;


// ---------------------------------------------------------------- URL hash state
const TABS = ['ultrasound', 'guide', 'coverage'];
let currentTab = 'ultrasound';

function readHash() {
  const h = new URLSearchParams(location.hash.replace(/^#/, ''));
  const block = h.get('block');
  const el = h.get('el');
  const tab = h.get('tab');
  return {
    block: block && BLOCKS[block] ? block : null,
    el: el && ELEMENTS[el] ? el : null,
    tab: TABS.includes(tab) ? tab : null,
  };
}

let hashTimer = 0;
function writeHash() {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    const p = new URLSearchParams();
    if (bus.state.block) p.set('block', bus.state.block);
    if (bus.state.selected) p.set('el', bus.state.selected);
    if (currentTab !== 'ultrasound') p.set('tab', currentTab);
    const s = p.toString();
    const url = location.pathname + location.search + (s ? `#${s}` : '');
    if (url !== location.pathname + location.search + location.hash) history.replaceState(null, '', url);
  }, 80);
}

// Seed bus.state from the URL before any module mounts (modules read bus.state on mount).
const initial = readHash();
if (initial.block) bus.state.block = initial.block;
if (initial.el) bus.state.selected = initial.el;

window.addEventListener('hashchange', () => {
  const h = readHash();
  if (h.block !== bus.state.block) bus.emit('block', { id: h.block, source: 'url' });
  if (h.el !== bus.state.selected) bus.emit('select', { id: h.el, source: 'url' });
  if (h.tab && h.tab !== currentTab) selectTab(h.tab, false);
});

// ---------------------------------------------------------------- block chips
const chipsEl = $('#block-chips');
const chipDef = (id) => ({ id, label: shortBlockName(BLOCKS[id]), sub: LEVEL_NAME[BLOCKS[id].level], advanced: !!BLOCKS[id].advanced });
const chipDefs = [
  { id: null, label: 'None', sub: 'Anatomy' },
  ...BLOCK_ORDER.map(chipDef),
  { group: 'Advanced' },
  ...BLOCK_ORDER_ADVANCED.filter((id) => BLOCKS[id]).map(chipDef),
];
for (const c of chipDefs) {
  if (c.group) {
    // Visual divider + label between the core four and the advanced variants
    // (stays inside the one scrollable row on phones).
    const g = document.createElement('span');
    g.className = 'chip-group-label';
    g.id = 'chip-group-advanced';
    g.textContent = c.group;
    chipsEl.append(g);
    continue;
  }
  const b = document.createElement('button');
  b.type = 'button';
  b.className = c.advanced ? 'chip chip--advanced' : 'chip';
  b.dataset.block = c.id || '';
  b.innerHTML = `<span class="chip-main">${esc(c.label)}</span><span class="chip-sub">${esc(c.sub)}</span>`;
  if (c.advanced) b.setAttribute('aria-describedby', 'chip-group-advanced');
  b.addEventListener('click', () => bus.emit('block', { id: c.id, source: 'app' }));
  chipsEl.append(b);
}
function syncChips() {
  for (const b of chipsEl.querySelectorAll('.chip')) {
    const on = (b.dataset.block || null) === (bus.state.block || null);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    // Keep the active chip visible in the scrollable row (phones: advanced chips sit off-screen).
    if (on && chipsEl.scrollWidth > chipsEl.clientWidth + 1) {
      const x = (node) => node.getBoundingClientRect().left - chipsEl.getBoundingClientRect().left + chipsEl.scrollLeft;
      const left = x(b), right = left + b.offsetWidth, view = chipsEl.clientWidth;
      if (left < chipsEl.scrollLeft || right > chipsEl.scrollLeft + view) {
        // Advanced chip: show the 'Advanced' label too when it fits; otherwise centre the chip.
        const g = b.classList.contains('chip--advanced') ? chipsEl.querySelector('.chip-group-label') : null;
        const gl = g ? x(g) - 6 : null;
        chipsEl.scrollLeft = gl !== null && right - gl <= view ? gl : Math.max(0, left - (view - b.offsetWidth) / 2);
      }
    }
  }
  document.body.dataset.block = bus.state.block || '';
}

// ---------------------------------------------------------------- theme + share
const themeBtn = $('#btn-theme');
const THEMES = ['auto', 'light', 'dark'];
function currentTheme() { return document.documentElement.dataset.theme || 'auto'; }
function paintThemeBtn() {
  const t = currentTheme();
  themeBtn.querySelector('.theme-label').textContent = t[0].toUpperCase() + t.slice(1);
  themeBtn.setAttribute('aria-label', `Colour theme: ${t === 'auto' ? 'automatic (follows your device)' : t}. Activate to change.`);
}
themeBtn.addEventListener('click', () => {
  const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
  if (next === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = next;
  try { if (next === 'auto') localStorage.removeItem('bp-theme'); else localStorage.setItem('bp-theme', next); } catch { /* storage may be blocked */ }
  paintThemeBtn();
});
paintThemeBtn();

$('#btn-share').addEventListener('click', async () => {
  const status = $('#share-status');
  clearTimeout(hashTimer);
  writeHash();
  await new Promise((r) => setTimeout(r, 100));
  let ok = false;
  try { await navigator.clipboard.writeText(location.href); ok = true; } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = location.href; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove();
    } catch { ok = false; }
  }
  status.textContent = ok ? 'Link copied' : 'Copy the address bar to share this view';
  $('#btn-share span').textContent = ok ? 'Copied' : 'Copy link';
  setTimeout(() => { $('#btn-share span').textContent = 'Copy link'; status.textContent = ''; }, 2200);
});

// ---------------------------------------------------------------- collapsible panels
for (const btn of document.querySelectorAll('.collapse-btn')) {
  btn.addEventListener('click', () => {
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.hidden = !open;
    btn.closest('.panel').classList.toggle('is-collapsed', !open);
  });
}
// Panel titles also toggle on phones (bigger target).
for (const h of document.querySelectorAll('.panel-head h2')) {
  h.addEventListener('click', () => { if (window.matchMedia('(max-width: 899px)').matches) h.parentElement.querySelector('.collapse-btn')?.click(); });
}

// ---------------------------------------------------------------- module mounting
const instances = {};
async function mountModule(name, path, containerSel, ...args) {
  const container = $(containerSel);
  try {
    const mod = await import(path);
    instances[name] = mod.mount(container, bus, ...args);
  } catch (err) {
    console.error(`[app] ${name} failed to load`, err);
    container.innerHTML = `<p class="mount-error">This view could not be loaded (${esc(err?.message || err)}). Try reloading the page.</p>`;
  }
}

// ---------------------------------------------------------------- tabs
const tabButtons = TABS.map((t) => $(`#tab-${t}`));
const lazy = {
  ultrasound: () => mountModule('ultrasound', './ultrasound.js', '#mount-ultrasound'),
  coverage: () => mountModule('coverage', './coverage.js', '#mount-coverage', { heading: false }),
  guide: () => renderGuide(),
};
const mounted = new Set();
function selectTab(tab, focus = false) {
  if (!TABS.includes(tab)) return;
  currentTab = tab;
  tabButtons.forEach((b, i) => {
    const on = TABS[i] === tab;
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
    $(`#tp-${TABS[i]}`).hidden = !on;
  });
  if (!mounted.has(tab)) { mounted.add(tab); lazy[tab](); }
  if (focus) $(`#tab-${tab}`).focus();
  writeHash();
}
tabButtons.forEach((b, i) => {
  b.addEventListener('click', () => selectTab(TABS[i]));
  b.addEventListener('keydown', (e) => {
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = TABS.length - 1;
    if (j !== null) { e.preventDefault(); selectTab(TABS[j], true); }
  });
});

// ---------------------------------------------------------------- block guide
const guideEl = $('#mount-guide');

function idChip(id, extra = '') {
  const el = ELEMENTS[id];
  if (!el) return '';
  const sel = bus.state.selected === id ? ' is-selected' : '';
  return `<button type="button" class="id-chip${extra}${sel}" data-sel="${esc(id)}" title="${esc(el.name)}">${esc(el.short || el.name)}</button>`;
}

function elementCard() {
  const id = bus.state.selected;
  const el = ELEMENTS[id];
  if (!el) {
    return `<div class="card el-card el-card--empty"><p class="muted">Select a nerve in any view (or a chip below) to see its roots, branches and what it supplies.</p></div>`;
  }
  const st = bus.state.block ? blockStatus(bus.state.block, id) : null;
  const b = BLOCKS[bus.state.block];
  let stText = '';
  if (b) {
    let label = st ? STATUS_TEXT[st] : 'Not involved at this level';
    if (b.sideEffectIds?.includes(id)) label += ' (side effect)';
    if (b.separateInjectionIds?.includes(id)) label += ' (needs a separate injection)';
    stText = `<p class="el-status" data-status="${esc(st || 'none')}"><span class="dot" aria-hidden="true"></span>${esc(shortBlockName(b))}: ${esc(label)}</p>`;
  }
  const parents = el.parents.map((p) => idChip(p)).join('');
  const children = el.children.map((c) => idChip(c)).join('');
  return `<div class="card el-card">
    <div class="el-head">
      <div><p class="eyebrow">${esc(LEVEL_NAME[el.level] || el.level)}</p><h3>${esc(el.name)}</h3></div>
      <div class="spinal">${el.spinal.map((s) => `<span class="spinal-chip">${esc(s)}</span>`).join('')}</div>
    </div>
    ${stText}
    <dl class="kv">
      ${parents ? `<div><dt>Arises from</dt><dd class="chip-row">${parents}</dd></div>` : ''}
      ${children ? `<div><dt>Gives</dt><dd class="chip-row">${children}</dd></div>` : ''}
      <div><dt>Motor</dt><dd>${esc(el.motor)}</dd></div>
      <div><dt>Sensory</dt><dd>${esc(el.sensory)}</dd></div>
      ${el.notes ? `<div><dt>Teaching point</dt><dd>${esc(el.notes)}</dd></div>` : ''}
    </dl>
    <button type="button" class="link-btn" data-sel="">Clear selection</button>
  </div>`;
}

function overviewHTML() {
  const levels = LEVELS.map((l, i) => {
    const adv = BLOCK_ORDER_ADVANCED.filter((bid) => BLOCKS[bid]?.level === l.id);
    const blocks = [...(l.blockIds || []), ...adv].map((bid) => `<button type="button" class="btn-ghost${BLOCKS[bid].advanced ? ' btn-ghost--advanced' : ''}" data-block="${esc(bid)}">${esc(BLOCKS[bid].name)}${BLOCKS[bid].advanced ? ' <span class="adv-tag">Advanced</span>' : ''}</button>`).join('');
    return `<li class="card level-card" style="--level-colour:${esc(l.color)}">
      <div class="level-head"><span class="level-num" aria-hidden="true">${i + 1}</span><h4>${esc(l.name)} <span class="count">× ${l.count}</span></h4></div>
      <p><strong>Where:</strong> ${esc(l.location)}</p>
      <p><strong>Ultrasound landmark:</strong> ${esc(l.landmark)}</p>
      <ul class="facts">${l.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <div class="chip-row">${l.ids.map((id) => idChip(id)).join('')}</div>
      ${blocks ? `<div class="level-blocks"><span class="muted small">Blocked here:</span> ${blocks}</div>` : ''}
    </li>`;
  }).join('');
  const row = (r) => `<tr${r.advanced ? ' class="row-advanced"' : ''}>
      <th scope="row"><button type="button" class="link-btn" data-block="${esc(r.id)}">${esc(shortBlockName(BLOCKS[r.id]))}</button>${r.relatedTo && BLOCKS[r.relatedTo] ? `<span class="row-variant">Variant of ${esc(shortBlockName(BLOCKS[r.relatedTo]).toLowerCase())}</span>` : ''}</th>
      <td>${esc(LEVEL_NAME[r.level])}</td><td>${esc(r.needle)}</td><td>${esc(r.volume)}</td><td>${esc(r.approach)}</td><td>${esc(r.indications)}</td></tr>`;
  const advRows = BLOCK_SUMMARY_ALL.filter((r) => r.advanced);
  const rows = BLOCK_SUMMARY.map(row).join('') +
    (advRows.length ? `<tr class="group-row"><th scope="rowgroup" colspan="6">Advanced blocks <span class="muted">(variants of the core four; volumes from published studies, not the deck)</span></th></tr>${advRows.map(row).join('')}` : '');
  return `<div class="guide-grid">
    <div class="guide-main">
      <h3 class="guide-title">How the plexus is organised</h3>
      <p class="mnemonic"><strong>${esc(LEVEL_MNEMONIC.text)}</strong>: ${esc(LEVEL_MNEMONIC.meaning)}<br><span class="muted">${esc(LEVEL_MNEMONIC.blocks)}</span></p>
      <ol class="levels">${levels}</ol>
      <h3 class="guide-title">The blocks at a glance</h3>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Comparison of the core and advanced blocks">
        <table class="summary">
          <thead><tr><th scope="col">Block</th><th scope="col">Plexus level</th><th scope="col">Needle</th><th scope="col">Volume</th><th scope="col">Approach</th><th scope="col">Typical indications</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    ${asideHTML()}
  </div>`;
}

function blockHTML(b) {
  const list = (arr) => `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const chips = (ids, cls) => ids.filter((id) => ELEMENTS[id]).map((id) => idChip(id, ` ${cls}`)).join('');
  const sideEffect = (b.sideEffectIds || []).map((id) => ELEMENTS[id]?.name).filter(Boolean);
  const separate = (b.separateInjectionIds || []).map((id) => ELEMENTS[id]?.name).filter(Boolean);
  const steps = [
    ['Position the patient', esc(b.position)],
    ['Scan', `${esc(b.probe)}<br><span class="muted">${esc(b.landmark)}</span>`],
    ['Identify the sonoanatomy', list(b.sonoanatomy)],
    ['Advance the needle', `${esc(b.approach)}<br><strong>Target:</strong> ${esc(b.needleTarget)}`],
    ['Deposit local anaesthetic', `${esc(b.laDeposition)}<br><strong>Volume${b.advanced ? '' : ' (deck)'}:</strong> ${esc(b.volume)}`],
  ];
  const core = b.advanced && BLOCKS[b.relatedTo];
  const coreName = core ? shortBlockName(core) : '';
  // 'Why choose this' text: an explicit data field if present, otherwise the
  // first exam answer (each advanced block's Q1 is the "why / how it differs" question).
  const why = core ? (b.whyChoose || b.examQs?.[0]?.a || '') : '';
  const variantHTML = core ? `
        <p class="note variant-note"><span class="adv-tag">Advanced</span> <span>Variant of the <button type="button" class="link-btn" data-block="${esc(core.id)}">${esc(coreName.toLowerCase())} block</button>. Learn that one first; this page covers what changes.</span></p>
        ${why ? `<div class="why-box"><p class="why-title">Why choose this over ${esc(coreName.toLowerCase())}?</p><p>${esc(why)}</p></div>` : ''}` : '';
  // Core blocks: point to their advanced variants (blocks whose relatedTo is this one).
  const variants = b.advanced ? [] : Object.keys(BLOCKS).filter((id) => BLOCKS[id].advanced && BLOCKS[id].relatedTo === b.id);
  const variantsHTML = variants.length ? `
        <div class="jump-row variants-row"><span class="muted">Advanced variants:</span> ${variants.map((id) => `<button type="button" class="btn-ghost btn-ghost--advanced" data-block="${esc(id)}">${esc(shortBlockName(BLOCKS[id]))} <span class="adv-tag">Advanced</span></button>`).join(' ')}</div>` : '';
  const sources = (b.sources || []).length ? `
      <h4>Sources</h4>
      <ul class="sources">${b.sources.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>` : esc(s.label)}</li>`).join('')}</ul>` : '';
  return `<div class="guide-grid">
    <div class="guide-main">
      <div class="block-head">
        <p class="eyebrow">Targets the ${esc((LEVEL_NAME[b.level] || '').toLowerCase())}</p>
        <h3>${esc(b.name)}</h3>${variantHTML}
        <div class="facts-row">
          <span class="fact"><span class="muted">Needle</span> ${esc(b.needle.length)} ${esc(b.needle.type.toLowerCase())}, ${esc(b.needle.plane.toLowerCase())}, ${esc(b.needle.direction.toLowerCase())}</span>
          <span class="fact"><span class="muted">Volume</span> ${esc(b.volume)}</span>
        </div>
        <div class="jump-row">
          <button type="button" class="btn-ghost" data-tab="ultrasound">Watch it on ultrasound</button>
          <button type="button" class="btn-ghost" data-tab="coverage">See the coverage map</button>
        </div>
        ${variantsHTML}
      </div>

      <h4>Set-up</h4>
      <dl class="kv kv-grid">
        <div><dt>Position</dt><dd>${esc(b.position)}</dd></div>
        <div><dt>Equipment</dt><dd>${esc(b.equipment)}</dd></div>
        <div><dt>Probe</dt><dd>${esc(b.probe)}</dd></div>
        <div><dt>Landmark</dt><dd>${esc(b.landmark)}</dd></div>
      </dl>

      <h4>Performing the block</h4>
      <ol class="steps">${steps.map(([t, d]) => `<li><p class="step-title">${esc(t)}</p><div>${d}</div></li>`).join('')}</ol>

      <h4>Coverage</h4>
      <p>${esc(b.coverageText)}</p>
      <dl class="kv cover-lists">
        <div><dt><span class="dot st-target" aria-hidden="true"></span>Injection target</dt><dd class="chip-row">${chips(b.targetIds, 'st-target')}</dd></div>
        <div><dt><span class="dot st-covers" aria-hidden="true"></span>Blocked</dt><dd class="chip-row">${chips(b.covers, 'st-covers')}</dd></div>
        ${b.variable.length ? `<div><dt><span class="dot st-variable" aria-hidden="true"></span>Variable</dt><dd class="chip-row">${chips(b.variable, 'st-variable')}</dd></div>` : ''}
        ${b.spares.length ? `<div><dt><span class="dot st-spares" aria-hidden="true"></span>Usually spared</dt><dd class="chip-row">${chips(b.spares, 'st-spares')}</dd></div>` : ''}
      </dl>
      ${sideEffect.length ? `<p class="note note-warn"><strong>Expected side effect:</strong> ${esc(sideEffect.join(', '))} block.</p>` : ''}
      ${separate.length ? `<p class="note"><strong>Needs a separate injection:</strong> ${esc(separate.join(', '))}.</p>` : ''}

      <h4>Indications</h4>
      <p>${esc(b.indications)}</p>

      <h4>Complications</h4>
      ${list(b.complications)}

      <h4>Pearls</h4>
      ${list(b.pearls)}

      <h4>Exam questions</h4>
      <div class="qa">${(b.examQs || []).map((x, i) => `<details><summary><span class="q-num">Q${i + 1}</span> ${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}</div>
${sources}
    </div>
    ${asideHTML()}
  </div>`;
}

function asideHTML() {
  return `<aside class="guide-side${bus.state.selected ? ' has-selection' : ''}" aria-label="Selected structure">${asideInner()}</aside>`;
}
function asideInner() {
  return `<h3 class="guide-title" tabindex="-1">Selected structure</h3><div class="guide-card" aria-live="polite">${elementCard()}</div>`;
}

/** On 'select', update only the selected-structure card and the chip states, so
 *  keyboard focus and the scroll position stay where they are. */
function updateGuideSelection() {
  if (!mounted.has('guide')) return;
  const side = guideEl.querySelector('.guide-side');
  if (!side) { renderGuide(); return; }
  const sel = bus.state.selected;
  guideEl.querySelectorAll('.guide-main .id-chip').forEach((c) => c.classList.toggle('is-selected', c.dataset.sel === sel));
  const active = document.activeElement;
  const refocus = side.contains(active) ? (active.dataset?.sel ?? null) : undefined;
  side.innerHTML = asideInner();
  side.classList.toggle('has-selection', !!sel);
  if (refocus !== undefined) {
    const again = refocus ? side.querySelector(`[data-sel="${CSS.escape(refocus)}"]`) : null;
    (again || side.querySelector('.guide-title'))?.focus?.({ preventScroll: true });
  }
}

let openQs = new Set();
function renderGuide() {
  if (!mounted.has('guide')) return;
  // Remember which exam answers were open so a re-render (e.g. after a select) keeps them.
  openQs = new Set([...guideEl.querySelectorAll('.qa details')].map((d, i) => (d.open ? i : -1)).filter((i) => i >= 0));
  const b = BLOCKS[bus.state.block];
  const key = b ? b.id : '';
  if (guideEl.dataset.key !== key) openQs.clear();
  guideEl.dataset.key = key;
  guideEl.innerHTML = b ? blockHTML(b) : overviewHTML();
  guideEl.querySelectorAll('.qa details').forEach((d, i) => { if (openQs.has(i)) d.open = true; });
}

guideEl.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.sel !== undefined) {
    const id = t.dataset.sel || null;
    bus.emit('select', { id: id && id === bus.state.selected ? null : id, source: 'guide' });
  } else if (t.dataset.block) {
    bus.emit('block', { id: t.dataset.block, source: 'guide' });
  } else if (t.dataset.tab) {
    selectTab(t.dataset.tab, true);
  }
});
guideEl.addEventListener('pointerover', (e) => {
  if (e.pointerType && e.pointerType !== 'mouse') return; // touch: taps select, never hover
  const t = e.target.closest('[data-sel]');
  if (t && t.dataset.sel) bus.emit('hover', { id: t.dataset.sel, source: 'guide' });
});
guideEl.addEventListener('pointerout', (e) => {
  const t = e.target.closest('[data-sel]');
  if (t && t.dataset.sel && !t.contains(e.relatedTarget)) bus.emit('hover', { id: null, source: 'guide' });
});

// ---------------------------------------------------------------- bus wiring
bus.on('block', () => { syncChips(); renderGuide(); writeHash(); });
bus.on('select', () => { updateGuideSelection(); writeHash(); });

// ---------------------------------------------------------------- boot
syncChips();
// Web fonts change chip widths; re-run so the active chip stays in view on phones.
document.fonts?.ready?.then(() => syncChips()).catch(() => {});
mountModule('viewer3d', './viewer3d.js', '#mount-3d');
mountModule('diagram', './diagram.js', '#mount-diagram');
selectTab(initial.tab || 'ultrasound');
