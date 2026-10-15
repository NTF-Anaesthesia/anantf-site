// Cervical, lumbar and sacral plexus teaching page: the app bar (home, plexus and block picker, copy link, level),
// URL state (#plexus=…&el=…&block=…), the first-visit level picker and Escape. The explorer itself (3D, diagram,
// details) is explorer.js, which block pages also use.
//
// ?embed=1 (used by explorer.js on pages without a three.js import map) shows the explorer alone, for an iframe.

import { mountExplorer, PLEXUSES, DEFAULT_PLEXUS, validPlexusId } from './explorer.js?v=20261015';
import { applyLevel, mountLevelControl, mountLevelPicker } from '../../shared/regional/js/levels.js?v=20261015';

// Where the Home button goes. Change here when the regional front door (/blocks/) is live.
const HOME = { href: '../regional.html', label: 'Regional', aria: 'Back to Regional anaesthesia' };

const $ = (id) => document.getElementById(id);
const embed = new URLSearchParams(location.search).has('embed');
if (embed) document.body.classList.add('px-embed');

applyLevel();

const ui = {
  bar: $('px-bar'), home: $('px-home'), pick: $('px-pick'), pickPlexus: $('px-pick-plexus'), pickBlock: $('px-pick-block'),
  panel: $('px-picker'), tabs: $('plexus-tabs'), chips: $('block-chips'), share: $('btn-share'), shareMenu: $('btn-share-menu'),
  shareStatus: $('share-status'), level: $('px-level'), mount: $('explorer'), credit: $('data-credit'), lead: $('px-lead'),
};

// ------------------------------------------------------------------ home link
if (embed) {
  // In an iframe: the home button opens this view as the full page.
  ui.home.href = location.pathname + location.hash;
  ui.home.target = '_top';
  ui.home.setAttribute('aria-label', 'Open the full plexus page');
  ui.home.querySelector('span').textContent = 'Full page';
  ui.home.classList.add('is-out');
} else {
  ui.home.href = HOME.href;
  ui.home.setAttribute('aria-label', HOME.aria);
  ui.home.querySelector('span').textContent = HOME.label;
}

// ------------------------------------------------------------------ level
if (!embed) {
  mountLevelControl(ui.level);
  const pickerHost = $('px-level-picker');
  if (pickerHost) mountLevelPicker(pickerHost, { onDone: () => pickerHost.remove() });
} else ui.level.remove();

// ------------------------------------------------------------------ URL state
function readHash() {
  const p = new URLSearchParams(location.hash.replace(/^#/, ''));
  const plexus = p.get('plexus');
  return { plexus: validPlexusId(plexus) ? plexus : DEFAULT_PLEXUS, el: p.get('el'), block: p.get('block') };
}
function writeHash(s) {
  if (!s.plexus) return;
  const p = new URLSearchParams();
  p.set('plexus', s.plexus);
  if (s.el) p.set('el', s.el);
  if (s.block) p.set('block', s.block);
  const next = `#${p.toString()}`;
  if (location.hash !== next) history.replaceState(null, '', next);
  if (embed) ui.home.href = location.pathname + next;
}

// ------------------------------------------------------------------ picker menu (phones and tablets)
const wide = window.matchMedia('(min-width: 900px)');
function setMenu(open, { focus = false } = {}) {
  const isOpen = !ui.panel.classList.contains('is-closed');
  if (wide.matches) { ui.panel.classList.remove('is-closed'); ui.pick.setAttribute('aria-expanded', 'false'); return; }
  if (open === isOpen) return;
  ui.panel.classList.toggle('is-closed', !open);
  ui.pick.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('px-menu-open', open);
  if (open) {
    const top = Math.max(0, ui.bar.getBoundingClientRect().bottom);
    ui.panel.style.maxHeight = `${Math.max(220, Math.round(window.innerHeight - top - 12))}px`;
    (ui.panel.querySelector('[aria-pressed="true"]') || ui.panel.querySelector('button'))?.focus({ preventScroll: true });
  } else if (focus) ui.pick.focus({ preventScroll: true });
}
const syncMode = () => { ui.panel.classList.toggle('is-closed', !wide.matches); ui.pick.setAttribute('aria-expanded', 'false'); document.body.classList.remove('px-menu-open'); };
wide.addEventListener?.('change', syncMode);
syncMode();
ui.pick.addEventListener('click', () => setMenu(ui.panel.classList.contains('is-closed')));
document.addEventListener('pointerdown', (e) => {
  if (wide.matches || ui.panel.classList.contains('is-closed')) return;
  if (!ui.panel.contains(e.target) && !ui.pick.contains(e.target)) setMenu(false);
});
ui.panel.addEventListener('focusout', (e) => {
  if (wide.matches || !e.relatedTarget) return;
  if (!ui.panel.contains(e.relatedTarget) && !ui.pick.contains(e.relatedTarget)) setMenu(false);
});

function paintPick(s) {
  ui.pickPlexus.textContent = s.plexusTab || PLEXUSES.find((p) => p.id === s.plexus)?.tab || '';
  ui.pickBlock.textContent = s.blockShort || 'Pick a block';
  ui.pick.setAttribute('aria-label', `${s.plexusName || 'Plexus'}${s.blockName ? `, ${s.blockName}` : ', no block chosen'}. Change plexus or block`);
}

// ------------------------------------------------------------------ explorer
const first = readHash();
const ex = mountExplorer(ui.mount, {
  plexus: first.plexus, block: first.block, el: first.el,
  tabsHost: ui.tabs, chipsHost: ui.chips, creditHost: ui.credit, legacyIds: true,
  onChange(s) {
    writeHash(s);
    paintPick(s);
    if (s.plexusName) document.title = `${s.plexusName}${s.blockName ? `: ${s.blockShort}` : ''} for regional anaesthesia`;
  },
  onBlockPick() { setMenu(false); },
});

window.addEventListener('hashchange', () => {
  const h = readHash();
  ex.setPlexus(h.plexus, { block: h.block, el: h.el });
});

document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (!wide.matches && !ui.panel.classList.contains('is-closed')) { setMenu(false, { focus: true }); return; }
  if (ev.target.closest?.('input, textarea, select, .px-v3-menu')) return;
  // Escape clears the selected nerve and the block together.
  const s = ex.state();
  if (s.el || s.block) ex.clear();
});

// ------------------------------------------------------------------ copy link
let shareTimer = 0;
async function copyLink(btn) {
  const url = location.href.replace(/[?&]embed=1/, '');
  let ok = false;
  try { await navigator.clipboard.writeText(url); ok = true; } catch {
    const ta = document.createElement('textarea');
    ta.value = url; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
  }
  ui.shareStatus.textContent = ok ? 'Link copied' : 'Copy the address from the address bar';
  for (const b of [ui.share, ui.shareMenu]) b?.classList.remove('is-done');
  btn.classList.toggle('is-done', ok);
  const span = btn.querySelector('span');
  const was = btn === ui.share ? 'Copy link' : 'Copy link to this view';
  if (span) span.textContent = ok ? 'Link copied' : was;
  clearTimeout(shareTimer);
  shareTimer = setTimeout(() => {
    ui.share.querySelector('span').textContent = 'Copy link';
    ui.shareMenu.querySelector('span').textContent = 'Copy link to this view';
    for (const b of [ui.share, ui.shareMenu]) b.classList.remove('is-done');
    ui.shareStatus.textContent = '';
  }, 2200);
}
ui.share.addEventListener('click', () => copyLink(ui.share));
ui.shareMenu.addEventListener('click', () => copyLink(ui.shareMenu));
