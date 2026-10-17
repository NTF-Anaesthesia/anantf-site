// Anatomy in 3D (cervical, brachial, lumbar and sacral plexuses): the page around the explorer. The regional app bar
// (back to /blocks/, plexus menu, search, copy link, MO · Res · Con level), URL state (#plexus=…&el=…&block=…), the
// first-visit level picker and Escape. The explorer itself (plexus tabs, block chips, 3D, diagram, details) is
// explorer.js, which block pages also use.
//
// ?embed=1 (used by explorer.js on pages without a three.js import map) shows the explorer alone, for an iframe.

import { registerOffline } from '../../shared/regional/js/offline.js?v=20261016'; // the regional offline worker (regional-sw.js)
import { mountExplorer, PLEXUSES, DEFAULT_PLEXUS, validPlexusId } from './explorer.js?v=20261015d';
import { applyLevel, mountLevelControl, mountLevelPicker } from '../../shared/regional/js/levels.js?v=20261015';
import { initAppFeel, settingsItem, settingsButton } from '../../shared/regional/js/appnav.js?v=20261026'; // Settings, bar auto-hide, keys, prefetch

const V = '20261015c';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const embed = new URLSearchParams(location.search).has('embed');
if (embed) document.body.classList.add('px-embed');

applyLevel();

const ui = {
  bar: $('tb-bar'), home: $('px-home'), pick: $('px-pick'), pickCur: $('px-pick-cur'), menu: $('px-picker'), wrap: $('px-chmenu'),
  chlist: $('tb-chlist'), share: $('tb-share'), shareMenu: $('btn-share-menu'), shareStatus: $('share-status'), level: $('px-level'),
  mount: $('explorer'), credit: $('data-credit'),
  searchOpen: $('tb-search-open'), sheet: $('tb-sheet'), q: $('tb-sheet-q'), res: $('tb-sheet-res'), resStatus: $('tb-sheet-status'), sheetClose: $('tb-sheet-close'),
};

// ------------------------------------------------------------------ home link
if (embed) {
  // In an iframe: the home button opens this view as the full page.
  ui.home.href = location.pathname + location.hash;
  ui.home.target = '_top';
  ui.home.setAttribute('aria-label', 'Open the full Anatomy in 3D page');
  ui.home.querySelector('span').textContent = 'Full page';
  ui.home.classList.add('is-out');
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

// ------------------------------------------------------------------ plexus menu (the regional bar's chapter menu)
const closeMenu = (refocus) => {
  if (ui.menu.hidden) return;
  ui.menu.hidden = true;
  ui.pick.setAttribute('aria-expanded', 'false');
  if (refocus) ui.pick.focus();
};
ui.pick.addEventListener('click', () => {
  if (!ui.menu.hidden) { closeMenu(); return; }
  closeSearch();
  ui.menu.hidden = false;
  ui.pick.setAttribute('aria-expanded', 'true');
  ui.menu.style.maxHeight = `${Math.max(200, Math.round(innerHeight - Math.max(0, ui.bar.getBoundingClientRect().bottom) - 12))}px`;
  (ui.menu.querySelector('a[aria-current]') || ui.menu.querySelector('a, button')).focus();
});
ui.menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
ui.wrap.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !ui.menu.hidden) { e.preventDefault(); e.stopPropagation(); closeMenu(true); return; }
  if (ui.menu.hidden || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
  const items = [...ui.menu.querySelectorAll('a, button')].filter((n) => n.getClientRects().length);
  const i = items.indexOf(document.activeElement);
  e.preventDefault();
  const n = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)));
  items[n].focus();
});
ui.wrap.addEventListener('focusout', (e) => { if (!ui.wrap.contains(e.relatedTarget)) closeMenu(); });
document.addEventListener('pointerdown', (e) => {
  if (!ui.wrap.contains(e.target)) closeMenu();
  if (!ui.sheet.hidden && !ui.sheet.contains(e.target) && !ui.searchOpen.contains(e.target) && !ui.wrap.contains(e.target)) closeSearch();
});

// Wide screens show the four plexuses inline; when they don't fit next to the tools, the menu instead.
const fitBar = () => { ui.bar.classList.remove('tb-bar--menu'); if (ui.chlist.getClientRects().length && ui.chlist.scrollWidth > ui.chlist.clientWidth + 1) ui.bar.classList.add('tb-bar--menu'); };
addEventListener('resize', fitBar);
document.fonts?.ready?.then(fitBar);
fitBar();

function paintBar(s) {
  const p = PLEXUSES.find((x) => x.id === s.plexus);
  ui.pickCur.innerHTML = `${esc(s.plexusTab || p?.tab || '')}${s.blockShort ? `<span class="px-cur-block"> · ${esc(s.blockShort)}</span>` : ''}`;
  ui.pick.setAttribute('aria-label', `${s.plexusName || 'Plexus'}${s.blockName ? `, ${s.blockName}` : ''}. Choose a plexus`);
  for (const a of document.querySelectorAll('.tb-chnav a[data-ch], #px-chmenu a[data-ch]')) { // (the menu may sit in the row under the bar on phones in the app look)
    if (a.dataset.ch === s.plexus) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
}

// ------------------------------------------------------------------ explorer
const first = readHash();
const ex = mountExplorer(ui.mount, {
  plexus: first.plexus, block: first.block, el: first.el,
  creditHost: ui.credit, legacyIds: true,
  onChange(s) {
    writeHash(s);
    paintBar(s);
    if (s.plexusName) document.title = `${s.plexusName}${s.blockName ? `: ${s.blockShort}` : ''} — Anatomy in 3D — NTF Anaesthesia`;
  },
});

window.addEventListener('hashchange', () => {
  const h = readHash();
  ex.setPlexus(h.plexus, { block: h.block, el: h.el });
});

document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (!ui.sheet.hidden) { closeSearch(true); return; }
  if (ev.target.closest?.('input, textarea, select, .px-v3-menu, .tb-chmenu')) return;
  // Escape clears the selected nerve and the block together.
  const s = ex.state();
  if (s.el || s.block) ex.clear();
});

// ------------------------------------------------------------------ search (nerves and blocks in every plexus)
let index = null;
async function loadIndex() {
  if (index) return index;
  const rows = [];
  await Promise.all(PLEXUSES.map(async (p) => {
    try {
      const d = (await import(`./data/${p.id}.js?v=${V}`)).default;
      for (const id of d.blockOrder || Object.keys(d.blocks || {})) {
        const b = d.blocks[id];
        rows.push({ plexus: p, kind: 'Block', title: b.name || id, hash: `plexus=${p.id}&block=${id}`, text: [b.name, b.short, id].join(' ') });
      }
      for (const id of d.order || Object.keys(d.elements || {})) {
        const e = d.elements[id];
        if (!e) continue;
        rows.push({ plexus: p, kind: e.kind === 'related' ? 'Related nerve' : 'Nerve', title: e.name || id, hash: `plexus=${p.id}&el=${id}`, text: [e.name, e.short, (e.roots || []).join(' ')].join(' ') });
      }
    } catch (err) { console.warn(`[plexus] search could not load ${p.id}`, err); }
  }));
  const order = PLEXUSES.map((p) => p.id);
  rows.sort((a, b) => order.indexOf(a.plexus.id) - order.indexOf(b.plexus.id));
  index = rows;
  return rows;
}
const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[–—-]/g, ' ');
async function runSearch() {
  const q = norm(ui.q.value).trim();
  if (!q) { ui.res.replaceChildren(); ui.resStatus.textContent = ''; return; }
  const rows = await loadIndex();
  const words = q.split(/\s+/);
  const hits = rows.filter((r) => { const t = norm(`${r.text} ${r.plexus.name}`); return words.every((w) => t.includes(w)); })
    .sort((a, b) => (norm(b.title).startsWith(words[0]) - norm(a.title).startsWith(words[0])) || (a.kind === 'Block' ? -1 : 0) - (b.kind === 'Block' ? -1 : 0))
    .slice(0, 30);
  if (norm(ui.q.value).trim() !== q) return;
  ui.res.innerHTML = hits.length
    ? hits.map((r) => `<li><a class="tb-sres" href="#${esc(r.hash)}"><span class="tb-sres-t">${esc(r.title)}</span><span class="tb-sres-c">${esc(r.plexus.name)} · ${esc(r.kind)}</span></a></li>`).join('')
    : '<li class="tb-sres-none">No results. Try a nerve, a root (for example C5) or a block.</li>';
  ui.resStatus.textContent = hits.length ? `${hits.length} result${hits.length === 1 ? '' : 's'}` : 'No results';
}
function openSearch() {
  closeMenu();
  ui.sheet.hidden = false;
  ui.searchOpen.setAttribute('aria-expanded', 'true');
  ui.q.focus();
  loadIndex();
}
function closeSearch(refocus) {
  if (ui.sheet.hidden) return;
  ui.sheet.hidden = true;
  ui.searchOpen.setAttribute('aria-expanded', 'false');
  if (refocus) ui.searchOpen.focus();
}
ui.searchOpen.addEventListener('click', () => (ui.sheet.hidden ? openSearch() : closeSearch()));
ui.sheetClose.addEventListener('click', () => closeSearch(true));
ui.bar.querySelector('.tb-chmenu-search').addEventListener('click', () => openSearch());
ui.q.addEventListener('input', runSearch);
ui.res.addEventListener('click', (e) => {
  if (!e.target.closest('a')) return;
  closeSearch();
  ui.mount.scrollIntoView({ block: 'start', behavior: 'auto' });
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
  const span = btn.querySelector('span');
  if (span && ok) span.textContent = btn === ui.share ? 'Copied' : 'Link copied';
  clearTimeout(shareTimer);
  shareTimer = setTimeout(() => {
    ui.share.querySelector('span').textContent = 'Copy link';
    ui.shareMenu.querySelector('span').textContent = 'Copy link to this view';
    ui.shareStatus.textContent = '';
  }, 2200);
}
ui.share.addEventListener('click', () => copyLink(ui.share));
// Settings: a row in the plexus menu, and a bar button while the four plexuses are listed in the bar (regional.css).
// "/" and Ctrl+K / Cmd+K open search; the bar may hide while scrolling down (Settings); prefetch (appnav.js).
ui.bar.querySelector('.tb-chmenu-extra')?.append(settingsItem('tb-chmenu-act'));
ui.share.before(settingsButton('tb-tool tb-bar-btn'));
initAppFeel({ bar: embed ? null : ui.bar, search: openSearch });
ui.shareMenu.addEventListener('click', () => copyLink(ui.shareMenu));
registerOffline();
