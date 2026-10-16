// Regional anaesthesia app: page shell (plan §4). Builds the one sticky app bar (home, chapter menu, search, copy
// link, MO · Res · Con level control), the hub ("I need to…" tiles + chapter list), one chapter at a time with hash
// routing (browser Back/Forward work), level hints, search and the pager.
// Usage (see shared/regional/DATA.md):  import { bootPage } from '../../../shared/regional/js/shell.js';  bootPage({ ...config });
import { $, $$, el, fill, announce } from './ui.js';
import { attachSearch, buildIndex, addSynonyms } from './search.js';
import { renderBlock } from './block.js';
import { registerOffline } from './offline.js?v=20261016'; // the regional offline worker (regional-sw.js)
import { initAppFeel, mountRail, settingsItem } from './appnav.js?v=20261026'; // desktop rail, Settings, bar auto-hide, keys, prefetch
import { applyLevel, mountLevelControl, mountLevelPicker, hiddenHint, relaxFor, onLevel, tierOf, tierMax, setLevel, getLevel, LEVELS, TIER_NAMES } from './levels.js?v=20261015'; // same URL as brachial-plexus, plexus, spinal and /blocks/: one level state per page

/** Site root, from this module's URL (works at any page depth and on a local server). */
const ROOT = new URL('../../../', import.meta.url).href;
/** The /blocks/ front door (WP11). Set to true once /blocks/ is live, so every page links to it by default. */
const FRONT_DOOR_READY = true;
export const DEFAULT_CREDIT = 'Created by Dr Koh Wenjun and <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>, NTF Anaesthesia';

const ICON = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5.5h4V20"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>',
};

const clampI = (v, a, b) => Math.max(a, Math.min(b, v));

/** Replace a heading element with another level, keeping attributes, children and listeners on children. */
function retag(node, tag, cls) {
  const n = document.createElement(tag);
  for (const a of node.attributes) n.setAttribute(a.name, a.value);
  if (cls) n.classList.add(cls);
  while (node.firstChild) n.append(node.firstChild);
  node.replaceWith(n);
  return n;
}

/**
 * After a chapter renders: give it one visible h1 (its title) and merge stacked kickers.
 * Chapters are authored with an h2 title and h3/h4 sub-headings. With one h2, every heading moves up a level
 * (h2 -> h1, h3 -> h2, h4 -> h3) and keeps its look through a tb-hv<n> class (n = the authored level).
 * With several h2s, only the first becomes the h1.
 */
function tidyChapter(sec) {
  if (!sec.querySelector('h1')) {
    const h2s = [...sec.querySelectorAll('h2')];
    if (h2s.length) {
      if (h2s.length === 1) {
        for (const h of [...sec.querySelectorAll('h3,h4,h5')]) {
          const lv = +h.tagName[1];
          retag(h, `h${lv - 1}`, `tb-hv${lv}`);
        }
      }
      retag(h2s[0], 'h1', 'tb-ch-title');
    }
  }
  // "Chapter n of m · Page" and a block's own kicker straight after it: show one line.
  const k = sec.querySelector(':scope > .tb-ch-kicker');
  const next = sec.querySelector(':scope > .tb-bhead > .tb-eyebrow:first-child') || (k?.nextElementSibling?.matches('.tb-eyebrow') ? k.nextElementSibling : null);
  if (k && next && !k.dataset.merged) {
    k.textContent = `${k.textContent.split(' · ')[0]} · ${next.textContent}`;
    k.dataset.merged = '1';
    next.remove();
  }
}

const decode = (h) => { try { return decodeURIComponent((h || '').replace(/^#/, '')); } catch { return (h || '').replace(/^#/, ''); } };

/** The breadcrumb's parent link (the region landing), e.g. {text: 'Truncal blocks', href: '../'}. */
function crumbParent() {
  const links = $$('.ntf-crumbs a');
  const a = links[links.length - 1];
  return a ? { text: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') } : null;
}

/** Shorter placeholder for phones: the first two examples only ("Search, e.g. ESP, SCTL, T7, dose" → "Search, e.g. ESP, SCTL"). */
const shortPlaceholder = (p) => { const parts = String(p).split(','); return parts.length > 3 ? parts.slice(0, 3).join(',') : p; };

/**
 * Insert the "n items hidden at MO level · Show all" hint near the top of a chapter. It hides itself when nothing is
 * hidden; while a deep link has raised the level it reads "Showing … content for this view · Back to MO".
 */
function addHint(sec) {
  const hint = hiddenHint(sec, { label: 'in this chapter' });
  const after = sec.querySelector(':scope > .tb-bhead') || sec.querySelector(':scope > h1') || sec.querySelector(':scope > .tb-ch-kicker');
  if (after) after.after(hint); else sec.prepend(hint);
}

/**
 * bootPage(config): see DATA.md for every field.
 * config = { title, eyebrow, lead, tiles:[{title, desc, href}], chapters:[{id, title, short, desc, tier?, block?, render?}],
 *            synonyms:[[…]], searchPlaceholder, hubExtra,
 *            backLabel, backShort, backHref, home, level }
 */
export async function bootPage(cfg) {
  const main = $('#main');
  const barHost = $('#tb-bar');
  if (!main) throw new Error('regional shell: <main id="main"> is missing');
  document.body.classList.add('tb-app', 'ra-app', 'tb-booting');
  const useLevel = cfg.level !== false;
  if (useLevel) applyLevel();
  if (cfg.synonyms) addSynonyms(cfg.synonyms);
  const BASE_TITLE = document.title;
  const parent = crumbParent();
  const backHref = cfg.backHref || parent?.href || '../';
  const backShort = cfg.backShort || parent?.text || 'All blocks';
  const backLabel = cfg.backLabel || `See all ${(parent?.text || 'blocks in this region').replace(/^[A-Z](?![A-Z])/, (c) => c.toLowerCase())} and the block chooser`;
  const home = cfg.home === false ? null : (typeof cfg.home === 'string' ? cfg.home : (FRONT_DOOR_READY ? `${ROOT}blocks/` : null));

  // ------------------------------------------------------------ chapter list
  // (cfg.refs / cfg.refsIntro are ignored: these pages no longer show a References chapter.)
  const chs = (cfg.chapters || []).map((c) => ({ ...c, id: c.id || (c.block ? `ch-${c.block.id}` : `ch-${Math.random().toString(36).slice(2, 7)}`) }));

  // ------------------------------------------------------------ hub
  const placeholder = cfg.searchPlaceholder || 'Search this page';
  const phone = matchMedia('(max-width: 480px)');
  const ph = () => (phone.matches ? shortPlaceholder(placeholder) : placeholder);
  const hub = el('section', { class: 'tb-chapter', id: 'ch-home', dataset: { title: 'Hub' }, 'aria-labelledby': 'tb-home-h' });
  const hubIn = el('div', { class: 'tb-hub' });
  if (cfg.eyebrow) hubIn.append(el('p', { class: 'tb-eyebrow', text: cfg.eyebrow }));
  hubIn.append(el('h1', { id: 'tb-home-h', text: cfg.title || BASE_TITLE }));
  if (cfg.lead) hubIn.append(fill(el('p', { class: 'tb-lead' }), cfg.lead));
  if (useLevel) mountLevelPicker(hubIn);
  const hubQ = el('input', { type: 'search', class: 'tb-search-input', id: 'tb-hub-q', placeholder: ph(), autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Search this page' });
  const hubRes = el('ul', { class: 'tb-sresults', id: 'tb-hub-res' });
  hubIn.append(el('div', { class: 'tb-search-row tb-hub-search', role: 'search' }, hubQ), hubRes);
  if ((cfg.tiles || []).length) {
    hubIn.append(el('h2', { class: 'tb-hub-h', id: 'hub-need', text: 'I need to…' }));
    const ul = el('ul', { class: 'tb-tiles' });
    cfg.tiles.forEach((t) => ul.append(el('li', {}, el('a', { class: 'tb-tile', href: t.href }, el('span', { class: 'tb-tile-t', text: t.title }), t.desc ? el('span', { class: 'tb-tile-d', text: t.desc }) : null))));
    hubIn.append(ul);
  }
  hubIn.append(el('h2', { class: 'tb-hub-h', id: 'hub-chapters', text: 'Chapters' }));
  const hubCh = el('ol', { class: 'tb-hubch' });
  const tierAttr = (c) => (c.tier === 2 || c.tier === 3 ? { 'data-tier': String(c.tier) } : {});
  chs.forEach((c) => hubCh.append(el('li', tierAttr(c), el('a', { href: `#${c.id}` }, el('span', { class: 'tb-hubch-t', text: c.title }), c.desc ? el('span', { class: 'tb-hubch-d', text: c.desc }) : null))));
  hubIn.append(hubCh);
  // At MO (or Resident) some chapters drop out of this list: say so, with "Show all".
  if (useLevel) hubCh.before(hiddenHint(hubCh, { label: 'in this list', relaxed: false }));
  if (cfg.hubExtra) { const x = el('div', { class: 'tb-hub-extra' }); fill(x, typeof cfg.hubExtra === 'function' ? cfg.hubExtra() : cfg.hubExtra); hubIn.append(x); }
  const back = el('p', { class: 'tb-hub-back' }, el('a', { href: backHref }, `${backLabel} `, el('span', { 'aria-hidden': 'true', text: '→' })));
  if (home) back.append(el('br'), el('a', { href: home }, 'All regional blocks ', el('span', { 'aria-hidden': 'true', text: '→' })));
  hubIn.append(back);
  hub.append(hubIn);
  main.textContent = '';
  main.append(hub);

  // ------------------------------------------------------------ chapters
  const sections = new Map();
  chs.forEach((c, i) => {
    const sec = el('section', { class: 'tb-chapter', id: c.id, dataset: { title: c.title }, ...tierAttr(c) });
    sec.append(el('p', { class: 'tb-ch-kicker', text: `Chapter ${i + 1} of ${chs.length} · ${cfg.title || ''}` }));
    sections.set(c.id, sec);
    main.append(sec);
  });

  // ------------------------------------------------------------ sticky bar + search sheet
  // Wide screens: an inline list of chapter links. Narrow screens: a disclosure button that opens the same
  // links as a menu (a <select> would jump chapters on every arrow key press).
  const chlist = el('ol', { class: 'tb-chlist', id: 'tb-chlist' });
  const menuList = el('ol', { class: 'tb-chmenu-list' }, el('li', {}, el('a', { href: '#ch-home', dataset: { ch: 'ch-home' }, text: 'Hub (start here)' })));
  chs.forEach((c) => {
    chlist.append(el('li', tierAttr(c), el('a', { href: `#${c.id}`, dataset: { ch: c.id }, text: c.short || c.title })));
    menuList.append(el('li', tierAttr(c), el('a', { href: `#${c.id}`, dataset: { ch: c.id }, text: c.title })));
  });
  // Extra rows under the chapters: copy link (phones: the bar has no room for it), the region landing, the front door.
  const menuShare = el('button', { type: 'button', class: 'tb-chmenu-act tb-chmenu-share', html: `${ICON.link}<span>Copy link to this page</span>` });
  // Very narrow phones: search moves from the bar into this menu, so the bar has room to name the chapter.
  const menuSearch = el('button', { type: 'button', class: 'tb-chmenu-act tb-chmenu-search', html: `${ICON.search}<span>Search this page</span>` });
  const menuExtra = el('ul', { class: 'tb-chmenu-extra' },
    el('li', { class: 'tb-chmenu-search-li' }, menuSearch),
    el('li', { class: 'tb-chmenu-share-li' }, menuShare),
    el('li', {}, el('a', { class: 'tb-chmenu-act', href: backHref, html: `${ICON.back}<span></span>` })),
    home ? el('li', {}, el('a', { class: 'tb-chmenu-act', href: home, html: `${ICON.home}<span>All regional blocks</span>` })) : null,
    settingsItem('tb-chmenu-act'));
  menuExtra.querySelector(`a[href="${CSS.escape(backHref)}"] span`).textContent = backShort;
  const menuLabel = el('span', { class: 'tb-chmenu-cur', text: 'Hub' });
  const menuBtn = el('button', { type: 'button', class: 'tb-chmenu-btn', id: 'tb-chmenu-btn', 'aria-expanded': 'false', 'aria-controls': 'tb-chmenu' },
    el('span', { class: 'tb-chmenu-k', text: 'Chapter' }), menuLabel, el('span', { class: 'tb-chmenu-caret', 'aria-hidden': 'true' }));
  const menu = el('div', { class: 'tb-chmenu-panel', id: 'tb-chmenu', hidden: true }, menuList, menuExtra);
  const chmenu = el('div', { class: 'tb-chmenu' }, menuBtn, menu);
  const closeMenu = (refocus = false) => { if (menu.hidden) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); if (refocus) menuBtn.focus(); };
  menuBtn.addEventListener('click', () => {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true');
    fitBelowBar(menu);
    (menuList.querySelector('a[aria-current]') || menuList.querySelector('a')).focus();
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  menuShare.addEventListener('click', () => { copyLink(menuShare); });
  menuSearch.addEventListener('click', () => { closeMenu(); openSearch(); });
  chmenu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { e.preventDefault(); closeMenu(true); return; }
    if (menu.hidden || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const links = $$('a,button', menu).filter((n) => n.getClientRects().length); const i = links.indexOf(document.activeElement);
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : clampI(i + (e.key === 'ArrowDown' ? 1 : -1), 0, links.length - 1);
    links[n].focus();
  });
  chmenu.addEventListener('focusout', (e) => { if (!chmenu.contains(e.relatedTarget)) closeMenu(); });
  document.addEventListener('pointerdown', (e) => { if (!chmenu.contains(e.target)) closeMenu(); });
  // Home: on a chapter it goes to this page's hub; on the hub it goes back to the region landing (backShort).
  const homeLink = el('a', { class: 'tb-bar-home', id: 'tb-home-link', href: '#ch-home', 'aria-label': 'Back to the hub', html: `${ICON.home}<span>Hub</span>` });
  const searchBtn = el('button', { type: 'button', class: 'tb-tool tb-bar-btn', id: 'tb-search-open', 'aria-expanded': 'false', 'aria-controls': 'tb-sheet', html: `${ICON.search}<span>Search</span>` });
  const shareStatus = el('span', { id: 'tb-share-status', class: 'tb-sr', role: 'status', 'aria-live': 'polite' });
  const shareBtn = el('button', { type: 'button', class: 'tb-tool tb-bar-btn', id: 'tb-share', 'aria-describedby': 'tb-share-status', html: `${ICON.link}<span>Copy link</span>` });
  const levelHost = el('div', { class: 'tb-bar-level' });
  const bar = barHost || el('div', { id: 'tb-bar' });
  bar.className = 'tb-bar';
  bar.textContent = '';
  const inner = el('div', { class: 'tb-bar-inner site-container' },
    el('nav', { class: 'tb-chnav', 'aria-label': 'Chapters' }, homeLink, chlist, chmenu),
    searchBtn, shareBtn, shareStatus, useLevel ? levelHost : null);
  bar.append(inner);
  if (!barHost) main.before(bar);
  if (useLevel) mountLevelControl(levelHost);
  // Desktop (≥ 1024 px): the same chapters in a rail beside the page, with this region's pages and the other regions.
  mountRail({ main, label: 'On this page', items: [{ href: '#ch-home', text: 'Hub (start here)', id: 'ch-home' }, ...chs.map((c) => ({ href: `#${c.id}`, text: c.title, id: c.id, tier: c.tier === 2 || c.tier === 3 ? c.tier : null }))] });
  const sheetQ = el('input', { type: 'search', class: 'tb-search-input', id: 'tb-sheet-q', placeholder: ph(), autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Search this page' });
  const sheetRes = el('ul', { class: 'tb-sresults', id: 'tb-sheet-res' });
  const sheetClose = el('button', { type: 'button', class: 'tb-tool', text: 'Close' });
  const sheet = el('div', { class: 'tb-sheet', id: 'tb-sheet', role: 'dialog', 'aria-label': 'Search this page', hidden: true },
    el('div', { class: 'tb-sheet-inner site-container' }, el('div', { class: 'tb-search-row' }, sheetQ, sheetClose), sheetRes));
  // The sheet hangs from the bottom of the sticky bar (position:absolute inside it), so it never covers the bar.
  bar.append(sheet);
  phone.addEventListener?.('change', () => { hubQ.placeholder = ph(); sheetQ.placeholder = ph(); });
  if (!$('#tb-live')) document.body.append(el('div', { id: 'tb-live', class: 'tb-sr', 'aria-live': 'polite', 'aria-atomic': 'true' }));

  /** Keep a panel that hangs from the bar inside the viewport (the bar may not be stuck to the top yet). */
  function fitBelowBar(panel) {
    const bottom = Math.max(0, bar.getBoundingClientRect().bottom);
    panel.style.maxHeight = `${Math.max(200, Math.round(window.innerHeight - bottom - 12))}px`;
  }

  // copy link
  let shareTimer = 0;
  async function copyLink(btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(location.href); ok = true; } catch {
      try { const ta = el('textarea', { readonly: true, style: { position: 'fixed', opacity: '0', top: '0' } }); ta.value = location.href; document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch { ok = false; }
    }
    const label = btn.querySelector('span');
    const was = btn === shareBtn ? 'Copy link' : 'Copy link to this page';
    shareStatus.textContent = ok ? 'Link copied' : 'Copy the address bar to share this page';
    label.textContent = ok ? (btn === shareBtn ? 'Copied' : 'Link copied') : was;
    clearTimeout(shareTimer);
    shareTimer = setTimeout(() => { shareBtn.querySelector('span').textContent = 'Copy link'; menuShare.querySelector('span').textContent = 'Copy link to this page'; shareStatus.textContent = ''; }, 2200);
  }
  shareBtn.addEventListener('click', () => copyLink(shareBtn));

  // Wide screens show the chapters inline; if they don't fit next to the tools, fall back to the menu.
  const fitChapters = () => {
    bar.classList.remove('tb-bar--menu');
    if (chlist.getClientRects().length && chlist.scrollWidth > chlist.clientWidth + 1) bar.classList.add('tb-bar--menu');
  };
  window.addEventListener('resize', fitChapters);
  document.fonts?.ready?.then(fitChapters);

  // ------------------------------------------------------------ level stub
  // The reader lowers the level while reading a chapter that level hides: say so in place (no blank page).
  const stubTitle = el('h1', { class: 'tb-ch-title', tabindex: '-1' });
  const stubText = el('p', { class: 'tb-lead tb-lead--small' });
  const stubShow = el('button', { type: 'button', class: 'tb-btn tb-btn--primary' });
  const stub = el('div', { class: 'ra-ch-stub', id: 'ra-ch-stub', hidden: true },
    el('p', { class: 'tb-ch-kicker', text: 'Hidden at your level' }), stubTitle, stubText,
    el('div', { class: 'ra-ch-stub-actions' }, stubShow, el('a', { class: 'tb-btn', href: '#ch-home', text: 'Back to the hub' })));
  main.append(stub);
  stubShow.addEventListener('click', () => {
    const t = current ? tierOf(current) : 1;
    setLevel({ 1: 'mo', 2: 'resident', 3: 'consultant' }[t] || 'consultant', { save: false, anchor: false });
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  function syncStub() {
    if (!useLevel) return;
    const t = current && current !== hub ? tierOf(current) : 1;
    const hide = t > tierMax();
    stub.hidden = !hide;
    if (!hide) return;
    stubTitle.textContent = current.dataset.title || '';
    stubText.textContent = `This chapter is ${TIER_NAMES[t]} level, so the ${LEVELS[getLevel()].name} level hides it. Show it for this view (your saved level stays the same), or go back to the hub.`;
    stubShow.textContent = `Show it (${TIER_NAMES[t]})`;
  }

  // ------------------------------------------------------------ routing
  const chapters = [hub, ...chs.map((c) => sections.get(c.id))];
  const byId = new Map(chapters.map((c) => [c.id, c]));
  let current = null;
  const paintNav = () => {
    $$('a', chlist).concat($$('a', menuList)).forEach((a) => { if (a.dataset.ch === current?.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    menuLabel.textContent = current?.id === 'ch-home' || !current ? 'Hub' : (chs.find((c) => c.id === current.id)?.short || current.dataset.title);
    const atHub = current?.id === 'ch-home';
    homeLink.href = atHub ? backHref : '#ch-home';
    homeLink.setAttribute('aria-label', atHub ? `Back to ${backShort}` : 'Back to the hub');
    homeLink.innerHTML = atHub ? `${ICON.back}<span></span>` : `${ICON.home}<span>Hub</span>`;
    if (atHub) homeLink.querySelector('span').textContent = backShort;
    homeLink.classList.toggle('tb-bar-home--back', atHub);
  };
  const kickResize = () => { requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); setTimeout(() => window.dispatchEvent(new Event('resize')), 150); };
  function showChapter(ch) {
    if (!ch || ch === current) return false;
    current = ch;
    chapters.forEach((c) => c.classList.toggle('is-current', c === ch));
    document.body.dataset.chapter = ch.id;
    document.title = ch.id === 'ch-home' ? BASE_TITLE : `${ch.dataset.title} — ${BASE_TITLE}`;
    paintNav();
    syncStub();
    document.dispatchEvent(new CustomEvent('tb-chapter', { detail: { id: ch.id } }));
    kickResize();
    return true;
  }

  const shown = (n) => !!n && n.getClientRects().length > 0 && !n.closest('[hidden]');
  const openAncestors = (n) => { for (let p = n.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) p.open = true; };

  async function goToHash(hash, { initial = false } = {}) {
    let id = decode(hash) || 'ch-home';
    if (byId.has(id)) {
      const ch = byId.get(id);
      if (useLevel) relaxFor(ch);
      showChapter(ch);
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (!initial) { const h = ch.querySelector('h1') || ch.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } announce(`${ch.dataset.title}`); }
      return;
    }
    let target = document.getElementById(id);
    // Old links to the removed References chapter (#ch-refs, #ref-…) or any unknown chapter land on the hub.
    if (!target) { if (/^(ch-|ref-)/.test(id)) { showChapter(hub); window.scrollTo({ top: 0, behavior: 'instant' }); } return; }
    // A deep link (or search result) to something the reader's level hides: show it for this view only.
    if (useLevel) relaxFor(target);
    const changed = showChapter(target.closest('.tb-chapter'));
    if (changed) window.scrollTo({ top: 0, behavior: 'instant' });
    openAncestors(target);
    if (!shown(target) && !target.dataset.activate) return;
    const scrollEl = (target.dataset.scrollTo && document.getElementById(target.dataset.scrollTo)) || target;
    requestAnimationFrame(() => {
      // No smooth programmatic scrolling: these pages are long and a smooth jump across them is slow on phones.
      scrollEl.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (target.dataset.activate) target.click();
      if (!initial) {
        const f = target.matches('a,button,input,select,textarea,summary,[tabindex]') ? target : scrollEl;
        if (!f.matches('a,button,input,select,textarea,summary,[tabindex]')) f.setAttribute('tabindex', '-1');
        f.focus({ preventScroll: true });
      }
      settle(scrollEl);
    });
  }
  // Content above the target can finish laying out after the jump; re-align a few times unless the reader scrolls.
  function settle(t) {
    let cancelled = false;
    const stop = () => { cancelled = true; };
    const evs = ['wheel', 'touchstart', 'keydown', 'mousedown'];
    evs.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
    const pad = (parseFloat(getComputedStyle(t).scrollMarginTop) || 0) + (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
    [400, 900].forEach((ms, i, all) => setTimeout(() => {
      if (!cancelled && Math.abs(t.getBoundingClientRect().top - pad) > 24) t.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (i === all.length - 1) evs.forEach((e) => window.removeEventListener(e, stop));
    }, ms));
  }
  window.addEventListener('hashchange', () => goToHash(location.hash));
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    if (a.hash && a.hash === location.hash) { e.preventDefault(); goToHash(a.hash); }
    else if (a.getAttribute('href') === '#ch-home' && !location.hash) { e.preventDefault(); goToHash('#ch-home'); }
  });

  // ------------------------------------------------------------ search wiring
  const closeSheet = (refocus = false) => { if (sheet.hidden) return; sheet.hidden = true; searchBtn.setAttribute('aria-expanded', 'false'); if (refocus) searchBtn.focus(); };
  attachSearch(sheetQ, sheetRes, { onPick: () => closeSheet(), onEscape: () => closeSheet(true) });
  attachSearch(hubQ, hubRes);
  sheetClose.addEventListener('click', () => closeSheet(true));
  const openSearch = () => {
    if (current?.id === 'ch-home') { hubQ.scrollIntoView({ block: 'center' }); hubQ.focus(); return; }
    closeMenu();
    sheet.hidden = false; searchBtn.setAttribute('aria-expanded', 'true'); fitBelowBar(sheet); sheetQ.focus();
  };
  searchBtn.addEventListener('click', () => { if (!sheet.hidden) closeSheet(); else openSearch(); });
  // "/" (unless turned off in Settings: WCAG 2.1.4) and Ctrl+K / Cmd+K open search; the bar may hide while scrolling
  // down (Settings, off by default); regional links are prefetched on hover (appnav.js).
  initAppFeel({ bar, search: openSearch });
  window.addEventListener('hashchange', () => { closeSheet(); closeMenu(); });

  // ------------------------------------------------------------ render chapters
  {
    const id0 = decode(location.hash);
    const direct = byId.get(id0) || document.getElementById(id0)?.closest('.tb-chapter');
    showChapter(direct || hub);
  }
  for (const [i, c] of chs.entries()) {
    const sec = sections.get(c.id);
    try {
      if (c.block) renderBlock(c.block, sec, { pageTitle: cfg.title });
      if (typeof c.render === 'function') await c.render(sec);
      tidyChapter(sec);
      if (useLevel) addHint(sec);
    } catch (err) {
      console.error(`[regional] chapter ${c.id} failed`, err);
      sec.append(el('p', { class: 'tb-mount-error', text: 'This part didn’t load. Reload the page.' }));
    }
    const prev = i === 0 ? { id: 'ch-home', title: 'Hub' } : chs[i - 1];
    const next = chs[i + 1];
    const pager = el('nav', { class: 'tb-pager', 'aria-label': 'Chapter navigation' });
    pager.append(el('a', { class: 'tb-pager-a tb-pager-prev', href: `#${prev.id}` }, el('small', { text: 'Previous' }), el('span', { text: prev.title })));
    pager.append(el('a', { class: 'tb-pager-a tb-pager-hub', href: '#ch-home' }, el('small', { text: 'Back to' }), el('span', { text: 'Hub' })));
    if (next) pager.append(el('a', { class: 'tb-pager-a tb-pager-next', href: `#${next.id}` }, el('small', { text: 'Next' }), el('span', { text: next.title })));
    sec.append(pager);
  }
  main.querySelectorAll('sup.tb-cite').forEach((s) => s.remove()); // citations are switched off (refs.js is a stub)
  try { buildIndex(); } catch (err) { console.error('[regional] search index failed', err); }
  document.body.classList.remove('tb-booting');
  document.body.classList.add('tb-chapters-on');
  document.body.dataset.tbReady = 'true';
  registerOffline();
  document.dispatchEvent(new CustomEvent('tb-ready'));
  await goToHash(location.hash, { initial: true });
  fitChapters();
  // A level change shows or hides content: canvases and the chapter list re-measure.
  if (useLevel) onLevel(() => { syncStub(); kickResize(); fitChapters(); });
  kickResize();
}
