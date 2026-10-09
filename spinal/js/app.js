// spinal/ page controller: chapters + routing, search, share, levels, section mounts, references, deep links.
import { $, $$, el, announce } from './ui.js?v=1';
import { registerRefs, finalise } from './refs.js?v=1';
import { attachSearch, buildIndex } from './search.js?v=3';


// Light mode only: the page is pinned with <html data-theme="light">.

// ---------------------------------------------------------------- copy link
const shareBtn = $('#sp-share');
let shareTimer = 0;
shareBtn?.addEventListener('click', async () => {
  const status = $('#sp-share-status');
  const span = shareBtn.querySelector('span');
  let ok = false;
  try { await navigator.clipboard.writeText(location.href); ok = true; } catch {
    try {
      const ta = el('textarea', { readonly: true, style: { position: 'fixed', opacity: '0', top: '0', left: '0' } });
      ta.value = location.href;
      document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove();
    } catch { ok = false; }
  }
  status.textContent = ok ? 'Link copied' : 'Copy the address bar to share this page';
  span.textContent = ok ? 'Copied' : 'Copy link';
  clearTimeout(shareTimer);
  shareTimer = setTimeout(() => { span.textContent = 'Copy link'; status.textContent = ''; }, 2200);
});

// ---------------------------------------------------------------- chapters
const chapters = $$('main .sp-chapter');
const chapterById = new Map(chapters.map((c) => [c.id, c]));
const ALIAS = { sixty: 'ch-card', populations: 'ch-technique' }; // retired ids that still route somewhere sensible
const prefixChapter = new Map(); // module prefix -> chapter element
const BASE_TITLE = 'Spinal anaesthesia — NTF Anaesthesia';
let current = null;

// Chapter kicker and previous/next buttons.
chapters.forEach((c, i) => {
  if (c.id === 'ch-home') return;
  c.prepend(el('p', { class: 'sp-ch-kicker', text: `Chapter ${i} of ${chapters.length - 1} · ${c.dataset.title}` }));
  const prev = chapters[i - 1];
  const next = chapters[i + 1];
  const pager = el('nav', { class: 'sp-pager', 'aria-label': 'Chapter navigation' });
  pager.append(el('a', { class: 'sp-pager-a sp-pager-prev', href: `#${prev.id}` }, el('small', { text: 'Previous' }), el('span', { text: prev.id === 'ch-home' ? 'Hub' : prev.dataset.title })));
  pager.append(el('a', { class: 'sp-pager-a sp-pager-hub', href: '#ch-home' }, el('small', { text: 'Back to' }), el('span', { text: 'Hub' })));
  if (next) pager.append(el('a', { class: 'sp-pager-a sp-pager-next', href: `#${next.id}` }, el('small', { text: 'Next' }), el('span', { text: next.dataset.title })));
  c.append(pager);
});

const chSelect = $('#sp-chselect');
function paintChapterNav() {
  $$('#sp-chlist a').forEach((a) => {
    if (a.dataset.ch === current?.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (chSelect && current) chSelect.value = current.id;
  const home = $('#sp-home-link');
  if (home) home.toggleAttribute('hidden', current?.id === 'ch-home');
}

function kickResize() {
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
}

/** Make `ch` the visible chapter. Returns true if it changed. */
function showChapter(ch) {
  if (!ch || ch === current) return false;
  current = ch;
  chapters.forEach((c) => c.classList.toggle('is-current', c === ch));
  document.body.dataset.chapter = ch.id;
  document.title = ch.id === 'ch-home' ? BASE_TITLE : `${ch.dataset.title} — ${BASE_TITLE}`;
  paintChapterNav();
  kickResize();
  return true;
}

chSelect?.addEventListener('change', () => { location.hash = chSelect.value; });

// ---------------------------------------------------------------- level (tier)
// Levels: '1' MO only, '2' MO + Resident, 'adv' Advanced pearls only (a digest per section), 'all' everything.
const LEVELS = {
  1: { name: 'MO', tier: 1, hint: 'MO: MOPEX level. Showing what you need for your first supervised spinals.' },
  2: { name: 'Resident', tier: 2, hint: 'Resident: everything up to the MMed exam (MO and Resident).' },
  adv: { name: 'Advanced', tier: 3, hint: 'Advanced: subspecialty detail and consultant pearls only, collected section by section.' },
  all: { name: 'All', tier: 3, hint: 'All: everything on the page, from MO basics to consultant pearls.' },
};
const controls = $('#sp-controls');
const levelBtns = controls ? $$('.sp-level-btn', controls) : [];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage may be blocked */ } },
};
const level = () => (LEVELS[document.body.dataset.level] ? document.body.dataset.level : 'all');
const tierMax = () => LEVELS[level()].tier;

function paintControls() {
  const lv = level();
  levelBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === lv)));
  const hint = $('#sp-level-hint');
  if (hint) hint.textContent = LEVELS[lv].hint;
}

/** Text that says where a pearl comes from: the open panel or tab, and the nearest heading above it. */
function contextFor(node, section) {
  const parts = [];
  const panel = node.closest('[role="tabpanel"],[data-panel-title]');
  if (panel && section.contains(panel)) {
    const lab = panel.dataset.panelTitle || (panel.getAttribute('aria-labelledby') && document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent)
      || panel.getAttribute('aria-label');
    if (lab) parts.push(lab.trim());
  }
  for (let n = node; n && n !== section; n = n.parentElement) {
    let p = n.previousElementSibling;
    while (p && !p.matches('h3,h4,.sp-h4')) p = p.previousElementSibling;
    if (p) { parts.push(p.textContent.trim()); break; }
  }
  return [...new Set(parts)].filter(Boolean).join(' · ');
}

/** Build (or rebuild) the Advanced digest: every tier-3 block in a section, copied into one list. */
function buildDigests() {
  $$('main .sp-section').forEach((sec) => {
    if (sec.id === 'references' || sec.id === 'quiz' || sec.id === 'card') return;
    sec.querySelector(':scope > .sp-adv-digest')?.remove();
    const items = $$('[data-tier="3"]', sec).filter((n) => !n.parentElement.closest('[data-tier="3"]'));
    const box = el('div', { class: 'sp-adv-digest' });
    if (!items.length) {
      box.append(el('p', { class: 'sp-adv-empty', text: 'No Advanced material in this section. Choose All or Resident to read it.' }));
    } else {
      items.forEach((n) => {
        const copy = n.cloneNode(true);
        copy.removeAttribute('data-tier');
        [copy, ...copy.querySelectorAll('[id]')].forEach((x) => x.removeAttribute('id'));
        copy.querySelectorAll('[aria-controls],[aria-labelledby],[aria-describedby]').forEach((x) => {
          x.removeAttribute('aria-controls'); x.removeAttribute('aria-labelledby'); x.removeAttribute('aria-describedby');
        });
        copy.querySelectorAll('[hidden]').forEach((x) => x.removeAttribute('hidden'));
        const ctx = contextFor(n, sec);
        box.append(el('div', { class: 'sp-adv-item' }, ...(ctx ? [el('p', { class: 'sp-adv-from', text: ctx })] : []), copy));
      });
    }
    sec.append(box);
  });
}

/** Keep the heading the reader is looking at where it was while content above it appears or disappears. */
function withScrollAnchor(change) {
  const line = window.innerHeight * 0.3;
  const heads = $$('main h2, main h3').filter((h) => h.getClientRects().length);
  let anchor = null;
  for (const h of heads) if (h.getBoundingClientRect().top <= line) anchor = h;
  anchor = anchor || heads.find((h) => h.getBoundingClientRect().top > 0) || null;
  const before = anchor ? anchor.getBoundingClientRect().top : 0;
  change();
  if (anchor && anchor.getClientRects().length) {
    const delta = anchor.getBoundingClientRect().top - before;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
  } else {
    const sec = anchor?.closest('.sp-section');
    if (sec) window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - line, behavior: 'instant' });
  }
}

function applyFilters({ lv = level() } = {}, { save = true, say = false, keepView = true } = {}) {
  const change = () => {
    if (lv === 'adv' && document.body.dataset.spReady) buildDigests();
    document.body.dataset.level = lv;
    document.body.dataset.tierMax = String(LEVELS[lv].tier);
    paintControls();
  };
  if (keepView && document.body.dataset.spReady) withScrollAnchor(change); else change();
  if (save) store.set('spinal-level', lv);
  if (say) announce(`Level ${LEVELS[lv].name}. ${LEVELS[lv].hint}`);
}

{
  const saved = store.get('spinal-level');
  const legacy = { 1: '1', 2: '2', 3: 'all' }[store.get('spinal-tier')];
  const lv = LEVELS[saved] ? saved : (legacy || 'all');
  document.body.dataset.level = lv;
  document.body.dataset.tierMax = String(LEVELS[lv].tier);
  paintControls();
  if (controls) controls.hidden = false;
  levelBtns.forEach((b) => b.addEventListener('click', () => applyFilters({ lv: b.dataset.level }, { say: true })));
}

/** A deep link to something the current filters hide: relax the filters just enough to show it. */
function relaxFor(target) {
  if (!target) return false;
  let need = 1;
  for (let p = target; p; p = p.parentElement) if (p.dataset?.tier) need = Math.max(need, Number(p.dataset.tier) || 1);
  let lv = level();
  if (lv === 'adv') { if (!target.closest('.sp-adv-digest,#quiz,#references,#card,.sp-hub') && !target.matches('.sp-chapter,.sp-section,h2,.sp-kicker')) lv = 'all'; }
  else if (need > tierMax()) lv = need === 2 ? '2' : 'all';
  if (lv === level()) return false;
  applyFilters({ lv }, { keepView: false, save: false }); // a deep link never overwrites the saved level
  announce('Level changed to show the linked item.');
  return true;
}

// ---------------------------------------------------------------- deep links
const mods = ['card', 'anatomy', 'pharm', 'technique', 'spines', 'ultrasound', 'troubleshooting', 'complications', 'exam', 'quiz'];
const revealers = new Map(); // prefix -> reveal(hashId)

function isShown(node) { return !!node && node.getClientRects().length > 0 && !node.closest('[hidden]'); }

function openAncestors(node) {
  for (let p = node.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) p.open = true;
}

/** Generic reveal: select the tab of any hidden tab panel that contains the target. */
function revealTabs(node) {
  for (let p = node.parentElement; p; p = p.parentElement) {
    if (p.getAttribute('role') === 'tabpanel' && p.hidden) {
      const tab = document.getElementById(p.getAttribute('aria-labelledby') || '');
      if (tab) tab.click();
    }
  }
}

const decode = (h) => { try { return decodeURIComponent((h || '').replace(/^#/, '')); } catch { return (h || '').replace(/^#/, ''); } };

async function goToHash(hash, { initial = false } = {}) {
  let id = decode(hash);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!id) id = 'ch-home';
  if (ALIAS[id] && !document.getElementById(id)) id = ALIAS[id];

  // Whole chapter.
  if (chapterById.has(id)) {
    const ch = chapterById.get(id);
    showChapter(ch);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!initial) {
      const h = ch.querySelector('h1,h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      announce(`${ch.dataset.title} chapter`);
    }
    return;
  }

  let target = document.getElementById(id);
  const chapter = target?.closest('.sp-chapter') || prefixChapter.get(id.split('-')[0]);
  const changed = showChapter(chapter);
  if (changed) window.scrollTo({ top: 0, behavior: 'instant' });
  relaxFor(target);
  if (!isShown(target)) {
    const prefix = id.split('-')[0];
    const reveal = revealers.get(prefix);
    if (reveal) {
      try { await reveal(id); } catch (err) { console.error('[spinal] reveal failed', err); }
    }
    target = document.getElementById(id);
    relaxFor(target);
    if (target && !isShown(target)) { revealTabs(target); openAncestors(target); }
  }
  if (!target || !isShown(target)) return;
  // Wait a frame so layout from reveal() is settled.
  requestAnimationFrame(() => {
    target.scrollIntoView({ block: 'start', behavior: initial || changed || reduce ? 'instant' : 'smooth' });
    if (!initial) {
      if (!target.matches('a,button,input,select,textarea,summary,[tabindex]')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    settleOn(target);
  });
}

// Figures above the target can finish laying out after the jump and push it down.
// Re-align a few times over the next ~1.5 s, unless the reader starts scrolling.
function settleOn(target) {
  let cancelled = false;
  const stop = () => { cancelled = true; };
  const evs = ['wheel', 'touchstart', 'keydown', 'mousedown'];
  evs.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  [450, 900, 1500].forEach((ms, i, all) => setTimeout(() => {
    if (!cancelled && Math.abs(target.getBoundingClientRect().top - pad) > 24) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    if (i === all.length - 1) evs.forEach((e) => window.removeEventListener(e, stop));
  }, ms));
}
window.addEventListener('hashchange', () => goToHash(location.hash));
// Clicking a link to the hash we are already on fires no hashchange; route it ourselves.
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href^="#"]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  if (a.hash && a.hash === location.hash) { e.preventDefault(); goToHash(a.hash); }
  else if (a.getAttribute('href') === '#ch-home' && !location.hash) { e.preventDefault(); goToHash('#ch-home'); }
});

// ---------------------------------------------------------------- search
{
  const sheet = $('#sp-sheet');
  const openBtn = $('#sp-search-open');
  const sheetQ = $('#sp-sheet-q');
  const hubQ = $('#sp-hub-q');
  const closeSheet = (refocus = false) => {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    openBtn?.setAttribute('aria-expanded', 'false');
    if (refocus) openBtn?.focus();
  };
  if (sheet && sheetQ) attachSearch(sheetQ, $('#sp-sheet-res'), { onPick: () => closeSheet(), onEscape: () => closeSheet(true) });
  if (hubQ) attachSearch(hubQ, $('#sp-hub-res'));
  $('#sp-sheet-close')?.addEventListener('click', () => closeSheet(true));
  const openSearch = () => {
    if (current?.id === 'ch-home' && hubQ) { hubQ.scrollIntoView({ block: 'center' }); hubQ.focus(); return; }
    if (!sheet) return;
    sheet.hidden = false;
    openBtn?.setAttribute('aria-expanded', 'true');
    sheetQ.focus();
  };
  openBtn?.addEventListener('click', () => { if (sheet && !sheet.hidden) closeSheet(); else openSearch(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.closest?.('input,textarea,select,[contenteditable]')) { e.preventDefault(); openSearch(); }
  });
  window.addEventListener('hashchange', () => closeSheet());
}

// ---------------------------------------------------------------- mount sections
function mountError(host, name, err) {
  console.error(`[spinal] ${name} failed to load`, err);
  if (!host) return;
  host.textContent = '';
  host.append(el('p', { class: 'sp-mount-error', text: 'This part didn\'t load. Reload the page.' }));
}

async function boot() {
  // Start on the right chapter straight away. Hidden chapters are laid out off-screen while mounting,
  // so widgets that measure their width at mount still see the real width.
  {
    const id0 = decode(location.hash);
    const direct = chapterById.get(id0) || chapterById.get(ALIAS[id0]) || document.getElementById(id0)?.closest('.sp-chapter');
    if (direct) showChapter(direct); else if (!id0) showChapter(chapterById.get('ch-home'));
  }
  const loaded = await Promise.allSettled(mods.map((m) => import(`./sections/${m}.js?v=1`)));
  // Register every module's refs before any mount, so cross-section citations resolve.
  loaded.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    try { registerRefs(r.value.refs); } catch (err) { console.error(`[spinal] refs for ${mods[i]} rejected`, err); }
  });
  const mounts = loaded.map(async (r, i) => {
    const name = mods[i];
    const id = r.status === 'fulfilled' && r.value.meta?.id ? r.value.meta.id : name;
    const host = document.getElementById(`mount-${id}`) || document.getElementById(`mount-${name}`);
    if (r.status !== 'fulfilled') { mountError(host, name, r.reason); return; }
    const mod = r.value;
    try {
      if (typeof mod.mount !== 'function') throw new Error('module has no mount()');
      const prefix = mod.meta?.prefix;
      if (prefix && host?.closest('.sp-chapter')) prefixChapter.set(prefix, host.closest('.sp-chapter'));
      const api = await mod.mount(host);
      if (prefix && api && typeof api.reveal === 'function') revealers.set(prefix, api.reveal.bind(api));
      if (prefix && typeof mod.reveal === 'function' && !revealers.has(prefix)) revealers.set(prefix, mod.reveal);
    } catch (err) { mountError(host, name, err); }
  });
  await Promise.allSettled(mounts);
  try { finalise(); } catch (err) { console.error('[spinal] references failed', err); }
  if (level() === 'adv') buildDigests();
  try { buildIndex(); } catch (err) { console.error('[spinal] search index failed', err); }
  document.body.classList.remove('sp-booting');
  document.body.classList.add('sp-chapters-on');
  document.body.dataset.spReady = 'true';
  document.dispatchEvent(new CustomEvent('sp-ready'));
  await goToHash(location.hash, { initial: true });
  kickResize();
}

boot();
