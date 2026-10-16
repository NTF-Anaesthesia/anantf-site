// spinal/ page controller: chapters + routing, search, share, levels, section mounts, references, deep links.
// Levels come from the shared regional level system (../../shared/regional/js/levels.js, plan §5): MO / Resident /
// Consultant, cumulative, saved as 'ra-level' (spinal's old 'spinal-level' / 'spinal-tier' migrate once), plus the
// "Pearls only" digest at Consultant level. The specifier below must stay identical in every spinal module that imports
// levels.js (search.js), so they share one module instance.
import { registerOffline } from '../../shared/regional/js/offline.js?v=20261016'; // the regional offline worker (regional-sw.js)
import { initAppFeel, mountRail, settingsItem } from '../../shared/regional/js/appnav.js?v=20261026'; // desktop rail, Settings, bar auto-hide, keys, prefetch
import { $, $$, el, announce } from './ui.js?v=1';
import { registerRefs, finalise } from './refs.js?v=1';
import { attachSearch, buildIndex } from './search.js?v=5';
import { initTopics } from './topics.js?v=1';
import {
  applyLevel, getLevel, onLevel, mountLevelControl, mountLevelPicker, relaxFor as relaxLevel,
  getPearlsOnly, setPearlsOnly, hiddenHint,
} from '../../shared/regional/js/levels.js?v=20261015';


// Light mode only: the page is pinned with <html data-theme="light">.
applyLevel(); // before anything mounts, so hidden tiers never flash

// ---------------------------------------------------------------- copy link (bar button; on phones a row in the chapter menu)
const shareBtn = $('#sp-share');
const menuShareBtn = $('#sp-menu-share');
let shareTimer = 0;
async function copyLink(btn) {
  const status = $('#sp-share-status');
  let ok = false;
  try { await navigator.clipboard.writeText(location.href); ok = true; } catch {
    try {
      const ta = el('textarea', { readonly: true, style: { position: 'fixed', opacity: '0', top: '0', left: '0' } });
      ta.value = location.href;
      document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove();
    } catch { ok = false; }
  }
  if (status) status.textContent = ok ? 'Link copied' : 'Copy the address bar to share this page';
  const span = btn.querySelector('span');
  if (span) span.textContent = ok ? (btn === shareBtn ? 'Copied' : 'Link copied') : (btn === shareBtn ? 'Copy link' : 'Copy link to this page');
  clearTimeout(shareTimer);
  shareTimer = setTimeout(() => {
    const s1 = shareBtn?.querySelector('span'); if (s1) s1.textContent = 'Copy link';
    const s2 = menuShareBtn?.querySelector('span'); if (s2) s2.textContent = 'Copy link to this page';
    if (status) status.textContent = '';
  }, 2200);
}
shareBtn?.addEventListener('click', () => copyLink(shareBtn));
menuShareBtn?.addEventListener('click', () => copyLink(menuShareBtn));

// ---------------------------------------------------------------- chapters
const chapters = $$('main .sp-chapter');
const chapterById = new Map(chapters.map((c) => [c.id, c]));
const ALIAS = { sixty: 'ch-card', populations: 'ch-technique', quiz: 'ch-exam' }; // retired ids that still route somewhere sensible
const prefixChapter = new Map(); // module prefix -> chapter element
const BASE_TITLE = 'Spinal anaesthesia — NTF Anaesthesia';
let current = null;
let topics = null; // in-chapter topic navigation (topics.js), set up once the sections have mounted

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

// Bar: wide screens show the chapters inline; narrower screens (or when they don't fit) a "Chapter" disclosure menu
// clamped to the viewport. The menu also carries "Copy link" on phones and the way back to the Regional hub.
const bar = $('#sp-bar');
// Settings (level, hiding the bar, keyboard, app version) from the chapter menu; on desktop (≥ 1024 px) the chapters
// in a rail beside the page, with the other regions and the tools (shared/regional/js/appnav.js).
$('.sp-chmenu-extra')?.append(settingsItem('sp-chmenu-act'));
mountRail({ label: 'On this page', items: $$('.sp-chapter[id]').map((c) => ({ href: `#${c.id}`, text: c.id === 'ch-home' ? 'Hub (start here)' : (c.dataset.title || c.id), id: c.id, tier: Number(c.dataset.tier) > 1 ? Number(c.dataset.tier) : null })) });
const chlist = $('#sp-chlist');
const menuWrap = $('#sp-chmenu-wrap');
const menuBtn = $('#sp-chmenu-btn');
const menu = $('#sp-chmenu');
const menuCur = $('#sp-chmenu-cur');
const HOME_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5.5h4V20"/></svg>';
const BACK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const REGION = { href: '../regional.html', short: 'Regional', label: 'Regional anaesthesia' };
const SHORT = Object.fromEntries($$('#sp-chlist a').map((a) => [a.dataset.ch, a.textContent.trim()]));
// Phones: the chapter name has about 70px at 360px wide, so a few chapters get a shorter name there.
const PHONE_SHORT = { 'ch-pharm': 'Drugs', 'ch-backs': 'Backs/US', 'ch-trouble': 'Trouble', 'ch-complications': 'Aftercare', 'ch-exam': 'Exam', 'ch-refs': 'Refs' };
const narrow = matchMedia('(max-width: 420px)');
narrow.addEventListener?.('change', () => paintChapterNav());

function fitBelowBar(panel) {
  const bottom = Math.max(0, bar.getBoundingClientRect().bottom);
  panel.style.maxHeight = `${Math.max(200, Math.round(window.innerHeight - bottom - 12))}px`;
}
function closeMenu(refocus = false) {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
  if (refocus) menuBtn.focus();
}
if (menu && menuBtn) {
  menuBtn.addEventListener('click', () => {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    fitBelowBar(menu);
    ($('a[aria-current]', menu) || $('a', menu)).focus();
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  menuWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { e.preventDefault(); closeMenu(true); return; }
    if (menu.hidden || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const items = $$('a,button', menu).filter((n) => n.getClientRects().length);
    const i = items.indexOf(document.activeElement);
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : Math.min(items.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)));
    items[n]?.focus();
  });
  menuWrap.addEventListener('focusout', (e) => { if (!menuWrap.contains(e.relatedTarget)) closeMenu(); });
  document.addEventListener('pointerdown', (e) => { if (!menuWrap.contains(e.target)) closeMenu(); });
}
// Wide screens show the chapters inline; if they don't fit next to the tools, fall back to the menu.
function fitChapters() {
  if (!bar || !chlist) return;
  bar.classList.remove('sp-bar--menu');
  if (chlist.getClientRects().length && chlist.scrollWidth > chlist.clientWidth + 1) bar.classList.add('sp-bar--menu');
}
window.addEventListener('resize', fitChapters);
document.fonts?.ready?.then(fitChapters);

function paintChapterNav() {
  $$('#sp-chlist a, #sp-chmenu a[data-ch]').forEach((a) => {
    if (a.dataset.ch === current?.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (menuCur) menuCur.textContent = !current || current.id === 'ch-home' ? 'Hub' : ((narrow.matches && PHONE_SHORT[current.id]) || SHORT[current.id] || current.dataset.title);
  // Home: on a chapter it goes to the hub; on the hub it goes back to the Regional anaesthesia page.
  const home = $('#sp-home-link');
  if (!home) return;
  const atHub = current?.id === 'ch-home';
  home.href = atHub ? REGION.href : '#ch-home';
  home.setAttribute('aria-label', atHub ? `Back to ${REGION.label}` : 'Back to the hub');
  home.innerHTML = `${atHub ? BACK_ICON : HOME_ICON}<span></span>`;
  home.querySelector('span').textContent = atHub ? REGION.short : 'Hub';
  home.classList.toggle('sp-bar-home--back', atHub);
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
  topics?.setChapter(ch);
  kickResize();
  return true;
}

// ---------------------------------------------------------------- level (tier)
// MO = tier 1, Resident = tiers 1-2, Consultant = everything (levels.js sets body[data-level] and body[data-tier-max]).
// "Pearls only" (Consultant level only, never saved): each section shows a digest of its tier-3 blocks instead.

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

/** Build (or rebuild) the "Pearls only" digest: every tier-3 block in a section, copied into one list. */
function buildDigests() {
  $$('main .sp-section').forEach((sec) => {
    if (sec.id === 'references' || sec.id === 'card') return;
    sec.querySelector(':scope > .sp-adv-digest')?.remove();
    const items = $$('[data-tier="3"]', sec).filter((n) => !n.parentElement.closest('[data-tier="3"]'));
    const box = el('div', { class: 'sp-adv-digest' });
    if (!items.length) {
      box.append(el('p', { class: 'sp-adv-empty', text: 'No consultant pearls in this section. Turn off Pearls only to read it.' }));
    } else {
      items.forEach((n) => {
        const copy = n.cloneNode(true);
        [copy, ...copy.querySelectorAll('[data-tier]')].forEach((x) => x.removeAttribute('data-tier'));
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

// Per chapter, under the kicker: "n items hidden at MO level · Show all" (MO and Resident), or the
// "Pearls only" switch (Consultant, in chapters that have consultant pearls), under the chapter's first heading.
const chapterTools = []; // {chapter, hint, pearls, btn, note}
let pearlsOn = false;
function paintPearls() {
  const atCon = getLevel() === 'consultant';
  chapterTools.forEach((t) => {
    if (!t.pearls) return;
    t.pearls.hidden = !atCon || !t.chapter.querySelector('[data-tier="3"]');
    t.btn.setAttribute('aria-pressed', String(getPearlsOnly()));
    t.note.textContent = getPearlsOnly()
      ? 'Showing only the consultant pearls, section by section.'
      : 'Show just the consultant pearls in this chapter.';
  });
}
function togglePearls() {
  const on = !getPearlsOnly();
  if (on && document.body.dataset.spReady) buildDigests();
  pearlsOn = on;
  setPearlsOnly(on);
  requestAnimationFrame(() => topics?.refresh());
}
function addChapterTools(chapter) {
  const hint = hiddenHint(chapter, { label: 'in this chapter' });
  const t = { chapter, hint };
  // The hidden-count hint is chapter-wide, so it sits under the chapter kicker.
  chapter.querySelector(':scope > .sp-ch-kicker')?.after(el('div', { class: 'sp-ch-tools' }, hint));
  if (chapter.id !== 'ch-card' && chapter.id !== 'ch-refs') {
    t.btn = el('button', { type: 'button', class: 'sp-pearls-btn', 'aria-pressed': 'false', on: { click: togglePearls } }, 'Pearls only');
    t.note = el('span', { class: 'sp-pearls-note' });
    t.pearls = el('p', { class: 'sp-pearls', hidden: true }, t.btn, t.note);
    // The "Pearls only" switch goes under the chapter's first heading, so it reads as part of this chapter.
    const h = chapter.querySelector(':scope > .sp-section > h2');
    if (h) h.after(el('div', { class: 'sp-ch-tools sp-ch-tools--pearls' }, t.pearls));
    else chapter.querySelector(':scope > .sp-ch-tools')?.append(t.pearls);
  }
  chapterTools.push(t);
}
chapters.forEach((c) => { if (c.id !== 'ch-home') addChapterTools(c); });

onLevel((lv) => {
  // Leaving Consultant ends "Pearls only" (it is never remembered).
  if (lv !== 'consultant' && pearlsOn) { pearlsOn = false; setPearlsOnly(false, { announce: false }); return; }
  if (lv === 'consultant') pearlsOn = getPearlsOnly();
  paintPearls();
  fitChapters();
  kickResize();
  requestAnimationFrame(() => topics?.refresh());
});

mountLevelControl($('#sp-bar-level'));
mountLevelPicker($('#sp-level-picker'));

/** A deep link or search result to something the current level hides: show it for this view only (never saved). */
function relaxFor(target) {
  if (!target) return false;
  // In "Pearls only" the ward card, references, hub and chapter or section headings stay visible: no need to relax.
  if (getPearlsOnly() && (target.closest('.sp-adv-digest,#references,#card,.sp-hub') || target.matches('.sp-chapter,.sp-section,h2,.sp-ch-kicker'))) return false;
  return relaxLevel(target);
}

// ---------------------------------------------------------------- deep links
const mods = ['card', 'anatomy', 'pharm', 'technique', 'spines', 'ultrasound', 'troubleshooting', 'complications', 'exam'];
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
    // Never a smooth programmatic scroll: the chapters are very long, and a smooth jump across them is slow and janky.
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
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
  // "/" (unless turned off in Settings) and Ctrl+K / Cmd+K open search; the bar may hide while scrolling down (Settings).
  initAppFeel({ bar, search: openSearch });
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
  const loaded = await Promise.allSettled(mods.map((m) => import(`./sections/${m}.js?v=5`)));
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
  if (getPearlsOnly()) buildDigests();
  chapterTools.forEach((t) => t.hint.refresh?.());
  paintPearls();
  fitChapters();
  try { buildIndex(); } catch (err) { console.error('[spinal] search index failed', err); }
  try { topics = initTopics(chapters); topics.setChapter(current); } catch (err) { console.error('[spinal] topic list failed', err); }
  document.body.classList.remove('sp-booting');
  document.body.classList.add('sp-chapters-on');
  document.body.dataset.spReady = 'true';
  document.dispatchEvent(new CustomEvent('sp-ready'));
  await goToHash(location.hash, { initial: true });
  kickResize();
}

boot();
registerOffline();
