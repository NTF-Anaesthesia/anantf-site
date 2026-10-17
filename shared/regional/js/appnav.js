// Regional anaesthesia app: the parts every regional page shares around its own app bar (ENGINE.md §2 "App frame").
//
//   initAppFeel({bar, search})  once per page: the page's sticky app bar (bar) and a function that opens or focuses its
//                               search (search, optional). Turns on, for this page:
//                                 - "Hide the bar while scrolling down" (Settings; localStorage 'ra-autohide', off by default)
//                                 - the keyboard: "/" (unless turned off in Settings; 'ra-slash') and Ctrl+K / Cmd+K focus search
//                                 - speculation rules: same-site regional links are prefetched on hover (never prerendered;
//                                   Chromium only; nothing happens in browsers without them)
//   mountRail({main, groups})   desktop navigation rail (≥ 1024 px, css/appnav.css): this page's chapters or sections,
//                               then this region's pages, the other regions and the tools. Wraps <main> in .ra-frame.
//   settingsItem(cls)           <li><a> "Settings" for an app bar menu; settingsButton(cls) the same as a bar button
//   getAutoHide/setAutoHide, getSlash/setSlash, SETTINGS_URL, REGION_NAV, TOOL_NAV, regionOf(path)
//   (app look) initAppFeel also draws, while html[data-skin="app"]: the bottom tab bar (a left rail from 1024 px) with
//   five topic tabs (Blocks, 3D anatomy, Ultrasound, Indication, Settings); a Safety button and, where the page's bar has
//   no search of its own, a search button in the top bar (mountBarActions); and, below 480 px, the chapter menu moved out
//   of the bar into a row under it (so the bar holds back, search, Safety and the level control at 360 px). See js/skin.js
//   and css/skin-app.css (ENGINE.md §2 "Skins").
//
// Its only import is skin.js, under one URL everywhere: import this module as appnav.js?v=20261026 (one instance per page).
// Cross-document view transitions are pure CSS (@view-transition in css/appnav.css).

import { getSkin, onSkin } from './skin.js?v=20261018';

const ROOT = new URL('../../../', import.meta.url);
const R = (p) => new URL(p, ROOT).href;
export const SETTINGS_URL = R('blocks/settings/');

const KEY_AUTOHIDE = 'ra-autohide';
const KEY_SLASH = 'ra-slash';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private window: the choice lasts for this page only */ } },
};
const memory = {};
/** "Hide the bar while scrolling down": off unless the reader turned it on. */
export const getAutoHide = () => (memory[KEY_AUTOHIDE] ?? store.get(KEY_AUTOHIDE)) === 'on';
export function setAutoHide(on) {
  memory[KEY_AUTOHIDE] = on ? 'on' : 'off';
  store.set(KEY_AUTOHIDE, memory[KEY_AUTOHIDE]);
  syncAutoHide();
}
/** "/" focuses search: on unless the reader turned it off (WCAG 2.1.4: a single-key shortcut can be turned off). */
export const getSlash = () => (memory[KEY_SLASH] ?? store.get(KEY_SLASH)) !== 'off';
export function setSlash(on) { memory[KEY_SLASH] = on ? 'on' : 'off'; store.set(KEY_SLASH, memory[KEY_SLASH]); }

// ------------------------------------------------------------------ site map (paths from the site root)
export const REGION_NAV = Object.freeze([
  { id: 'upper-limb', title: 'Upper limb', label: 'Upper-limb blocks', href: 'upper-limb/', pages: [['Shoulder', 'upper-limb/shoulder/'], ['Arm', 'upper-limb/arm/'], ['Forearm and hand', 'upper-limb/forearm-hand/'], ['Brachial plexus app', 'brachial-plexus/']] },
  { id: 'trunk', title: 'Trunk', label: 'Truncal blocks', href: 'truncal/', pages: [['Back', 'truncal/back/'], ['Chest wall', 'truncal/chest-wall/'], ['Abdominal wall', 'truncal/abdominal-wall/']] },
  { id: 'head-neck', title: 'Head and neck', label: 'Head and neck blocks', href: 'head-neck/', pages: [['Cervical plexus', 'head-neck/cervical/'], ['Scalp and occipital', 'head-neck/scalp/'], ['Face', 'head-neck/face/'], ['Airway', 'head-neck/airway/'], ['Eye', 'head-neck/eye/']] },
  { id: 'lower-limb', title: 'Lower limb', label: 'Lower-limb blocks', href: 'lower-limb/', pages: [['Hip', 'lower-limb/hip/'], ['Knee', 'lower-limb/knee/'], ['Foot and ankle', 'lower-limb/foot-ankle/'], ['Thigh and amputation', 'lower-limb/thigh/']] },
  { id: 'neuraxial', title: 'Neuraxial', label: 'Neuraxial', href: 'spinal/', pages: [] },
]);
// The same four tools as Part I of /blocks/ (each once, same names), then Settings.
export const TOOL_NAV = Object.freeze([['All regional blocks', 'blocks/'], ['Emergency guides and dose calculator', 'blocks/safety/'], ['Which block for which operation', 'blocks/indication/'], ['Ultrasound anatomy', 'blocks/ultrasound/'], ['Anatomy in 3D', 'plexus/'], ['Settings', 'blocks/settings/']]);

/** This page's path from the site root, e.g. 'truncal/back/'. */
const here = () => {
  const p = decodeURIComponent(location.pathname);
  const r = decodeURIComponent(ROOT.pathname);
  return (p.startsWith(r) ? p.slice(r.length) : p.replace(/^\//, '')).replace(/index\.html$/, '');
};
/** The region a page belongs to (its entry in REGION_NAV), or null for /blocks/, /plexus/ and the tools. */
export function regionOf(path = here()) {
  return REGION_NAV.find((r) => path === r.href || path.startsWith(r.href) || r.pages.some(([, h]) => path.startsWith(h))) || null;
}

// ------------------------------------------------------------------ icons and small DOM helpers
const ICON_SETTINGS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/></svg>';
function make(tag, attrs = {}, text) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) n.setAttribute(k, v === true ? '' : String(v));
  if (text != null) n.textContent = text;
  return n;
}
const onSettings = () => here() === 'blocks/settings/';

/** "Settings" as a row of an app bar menu (the bar's chapter or block menu). cls: the menu's row class. */
export function settingsItem(cls = 'tb-chmenu-act') {
  const li = make('li', { class: 'ra-settings-li' });
  const a = make('a', { class: `${cls} ra-settings-link`, href: SETTINGS_URL });
  a.innerHTML = `${ICON_SETTINGS}<span>Settings</span>`;
  if (onSettings()) a.setAttribute('aria-current', 'page');
  li.append(a);
  return li;
}
/** "Settings" as a bar button (icon; the word shows where the bar has room). cls: the bar's button classes. */
export function settingsButton(cls = 'tb-tool tb-bar-btn') {
  const a = make('a', { class: `${cls} ra-settings-btn`, href: SETTINGS_URL, 'aria-label': 'Settings' });
  a.innerHTML = `${ICON_SETTINGS}<span aria-hidden="true">Settings</span>`;
  if (onSettings()) a.setAttribute('aria-current', 'page');
  return a;
}

/** appnav.css comes with regional.css, the landings' CSS, spinal and brachial-plexus; a page (or a stale cached
 *  stylesheet) without it gets it linked here, so the rail never shows unstyled. */
function ensureCss() {
  if (typeof document === 'undefined' || document.querySelector('link[data-ra-css="appnav"]')) return;
  if (getComputedStyle(document.documentElement).getPropertyValue('--ra-frame-w').trim()) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL('../css/appnav.css?v=20261018', import.meta.url).href;
  l.dataset.raCss = 'appnav';
  document.head.append(l);
}

// ------------------------------------------------------------------ desktop rail
/** Rail items from a page's own headings (region landings): [{href:'#id', text, id}] for each visible h2[id] in root. */
export function headingItems(root = document.getElementById('main'), sel = 'h2[id]') {
  return [...(root?.querySelectorAll(sel) || [])].filter((h) => !h.closest('[hidden],details:not([open])')).map((h) => ({ href: `#${h.id}`, text: h.textContent.replace(/\s+/g, ' ').trim(), id: h.id }));
}
/**
 * mountRail({main, label, items, spy, groups}) → {setCurrent(id)} or null.
 *   items: this page's chapters or sections [{href:'#ch-esp', text, id?, tier?}]; label: their heading ('On this page').
 *   spy: true marks the section in view while scrolling (landings, /blocks/); otherwise the current chapter follows
 *        body[data-chapter] (the engine shell and spinal set it).
 * The rail lists, after the page's own items: this region's landing and pages, the other regions, and the tools.
 * Below 1024 px it is not shown (the app bar's menu does the same job).
 */
export function mountRail({ main = document.getElementById('main'), label = 'On this page', items = [], spy = false } = {}) {
  if (!main || document.querySelector('.ra-rail')) return null;
  ensureCss();
  const path = here();
  const region = regionOf(path);
  const rail = make('nav', { class: 'ra-rail', 'aria-label': 'Regional anaesthesia' });
  const inner = make('div', { class: 'ra-rail-in' });
  rail.append(inner);
  const group = (title, rows, cls = '') => {
    if (!rows.length) return null;
    const g = make('div', { class: `ra-rail-g${cls ? ` ${cls}` : ''}` });
    if (title) g.append(make('p', { class: 'ra-rail-k' }, title));
    const ul = make(cls.includes('ra-rail-g--page') ? 'ol' : 'ul', { class: 'ra-rail-list' });
    for (const r of rows) {
      const li = make('li', r.tier ? { 'data-tier': String(r.tier) } : {});
      const a = make('a', { href: r.href, ...(r.id ? { 'data-rail': r.id } : {}) }, r.text);
      if (r.current) a.setAttribute('aria-current', 'page');
      li.append(a);
      ul.append(li);
    }
    g.append(ul);
    inner.append(g);
    return g;
  };
  const pageRows = items.map((it) => ({ href: it.href, text: it.text, id: it.id || it.href.replace(/^#/, ''), tier: it.tier }));
  group(label, pageRows, 'ra-rail-g--page');
  if (region) {
    const rows = [{ href: R(region.href), text: region.pages.length ? `${region.label}: overview` : region.label, current: path === region.href }]
      .concat(region.pages.map(([t, h]) => ({ href: R(h), text: t, current: path.startsWith(h) })));
    if (rows.length > 1) group(region.title, rows);
  }
  group(region ? 'Other regions' : 'Regions', REGION_NAV.filter((r) => r !== region).map((r) => ({ href: R(r.href), text: r.title })));
  group('Tools', TOOL_NAV.map(([t, h, also]) => ({ href: R(h), text: t, current: path === h || path === also })), 'ra-rail-g--tools'); // a row's optional third item is a page that is the same tool (the stand-alone calculator)

  const frame = make('div', { class: 'ra-frame' });
  main.before(frame);
  frame.append(rail, main);
  document.body.classList.add('ra-has-rail');

  const links = [...inner.querySelectorAll('a[data-rail]')];
  let cur = null;
  /** Keep the current item in view inside the rail (the rail scrolls itself, never the page). */
  const reveal = (a) => {
    if (!a || !rail.clientHeight) return;
    const top = a.offsetTop; const h = a.offsetHeight;
    if (top < rail.scrollTop + 8 || top + h > rail.scrollTop + rail.clientHeight - 8) rail.scrollTop = Math.max(0, top - rail.clientHeight / 3);
  };
  const setCurrent = (id) => {
    if (id === cur) return;
    cur = id;
    for (const a of links) { if (a.dataset.rail === id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }
    reveal(links.find((a) => a.dataset.rail === id));
  };
  if (spy) {
    const secs = links.map((a) => document.getElementById(a.dataset.rail)).filter(Boolean);
    let raf = 0;
    const paint = () => {
      raf = 0;
      if (!secs.length) return;
      const line = 120;
      let on = secs[0];
      for (const s of secs) if (s.getBoundingClientRect().top <= line) on = s;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) on = secs[secs.length - 1];
      setCurrent(on.id);
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    paint();
  } else {
    const sync = () => setCurrent(document.body.dataset.chapter || 'ch-home');
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-chapter'] });
    sync();
  }
  return { setCurrent, rail };
}

// ------------------------------------------------------------------ app look: the bottom tab bar (left rail from 1024 px)
// Rendered only while html[data-skin="app"] (so the website look has no extra element) and removed again when the reader
// switches back in Settings. Five topic tabs, every one reachable from every regional page. Search and Safety are in the
// top bar (mountBarActions), not here.
const TAB_SVG = {
  blocks: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  anatomy: '<path d="M12 3 4.5 7.3v9.4L12 21l7.5-4.3V7.3L12 3z"/><path d="m4.5 7.3 7.5 4.3 7.5-4.3M12 11.6V21"/>',
  ultrasound: '<path d="M12 3.5 3.8 17.2a11.6 11.6 0 0 0 16.4 0L12 3.5z"/><path d="M7.4 12.6a6.4 6.4 0 0 0 9.2 0"/>',
  indication: '<rect x="5" y="4" width="14" height="17" rx="2.6"/><path d="M9 4V2.8h6V4M8.5 10h7M8.5 14h7M8.5 17.5h4"/>',
  settings: '<path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>',
};
/** id, label, path from the site root. */
export const TABS = Object.freeze([
  ['blocks', 'Blocks', 'blocks/'],
  ['anatomy', '3D anatomy', 'plexus/'],
  ['ultrasound', 'Ultrasound', 'blocks/ultrasound/'],
  ['indication', 'Indication', 'blocks/indication/'],
  ['settings', 'Settings', 'blocks/settings/'],
]);
/** Which tab the current page belongs to: Settings, Anatomy in 3D, and the Ultrasound and Indication screens have their
 *  own; every other page (the front door, the region landings, every block page, spinal, the brachial plexus app, the
 *  calculator and Safety) is Blocks. A block page reached from Ultrasound or Indication is Blocks, not that tab. Exactly one. */
export function currentTab(path = here()) {
  if (path === 'blocks/settings/') return 'settings';
  if (path === 'plexus/') return 'anatomy';
  if (path === 'blocks/ultrasound/') return 'ultrasound';
  if (path === 'blocks/indication/') return 'indication';
  return 'blocks';
}
let TAB_BAR = null;
function mountTabBar() {
  if (TAB_BAR || typeof document === 'undefined' || !document.body) return;
  // An iframe (the explorer inside a block page) and the embedded explorer are not the app's screen: no tab bar there.
  try { if (window.top !== window.self) return; } catch { return; }
  if (document.body.classList.contains('px-embed')) return;
  const nav = make('nav', { class: 'ra-tabbar', 'aria-label': 'Regional anaesthesia app' });
  const inner = make('div', { class: 'ra-tabbar-in' });
  const cur = currentTab();
  for (const [id, label, href] of TABS) {
    const t = make('a', { class: 'ra-tab', href: R(href), 'data-tab': id });
    t.innerHTML = `<span class="ra-tab-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${TAB_SVG[id]}</svg></span><span class="ra-tab-label">${label}</span>`;
    if (id === cur) t.setAttribute('aria-current', 'page');
    inner.append(t);
  }
  nav.append(inner);
  // Keyboard and screen-reader order follows the picture: the bottom bar comes last in the page; from 1024 px the bar is a
  // rail down the left, so it comes first (after the skip link), and Tab does not have to cross the whole page to reach it.
  const wide = typeof matchMedia === 'function' ? matchMedia('(min-width: 1024px)') : null;
  const place = () => {
    if (wide?.matches) { const skip = document.querySelector('body > a[href="#main"]'); if (skip) skip.after(nav); else document.body.prepend(nav); }
    else document.body.append(nav);
  };
  place();
  wide?.addEventListener?.('change', place);
  TAB_BAR = { nav, off: () => wide?.removeEventListener?.('change', place) };
}
function unmountTabBar() {
  if (!TAB_BAR) return;
  TAB_BAR.off?.();
  TAB_BAR.nav.remove();
  TAB_BAR = null;
}

// ------------------------------------------------------------------ app look: the top bar's search and Safety buttons
// Every regional page's bar, in the app look: the page's own search button (engine pages, /blocks/, spinal, Anatomy in
// 3D) or, where the bar has none (the region landings, the calculator, Settings, the brachial plexus app, Safety …), a
// search button that goes to the search box on /blocks/; and a red "Safety" button to /blocks/safety/ (emergency guides
// and the dose calculator). Both are added by script while the app look is on and removed when it is off, so the website
// look's bar is exactly what it was. Below 480 px the chapter / block / plexus menu moves out of the bar into a row under
// it (the bar then holds back, search, Safety and the level control, which is all that fits at 360 px); it moves back
// when the window is wider or the website look is chosen.
const SEARCH_BTN = '#tb-search-open,#sp-search-open';
const MENU_SEL = '.tb-chmenu,.sp-chmenu,.bp-blockmenu';
const LEVEL_SEL = '.tb-bar-level,.sp-bar-level,.bp-level';
export const SAFETY_URL = R('blocks/safety/');
const BAR_SVG = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  safety: '<path d="M12 3.8 2.9 19.2h18.2L12 3.8z"/><path d="M12 10v4.2M12 16.9v.01"/>',
};
let BAR_ACT = null;
function mountBarActions(bar, search) {
  if (BAR_ACT || !bar) return;
  const inner = bar.querySelector(':scope > .tb-bar-inner, :scope > .ra-sbar-inner, :scope > .sp-bar-inner, :scope > .bp-bar-inner') || bar;
  const added = [];
  const level = inner.querySelector(LEVEL_SEL);
  const put = (n) => { added.push(n); if (level) level.before(n); else inner.append(n); };
  if (!inner.querySelector(SEARCH_BTN)) {
    const b = make('button', { class: 'ra-bact ra-bsearch', type: 'button', 'aria-label': 'Search' });
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${BAR_SVG.search}</svg>`;
    b.addEventListener('click', () => { if (typeof search === 'function') search(); else location.href = `${R('blocks/')}#search`; });
    put(b);
  }
  const s = make('a', { class: 'ra-bact ra-safety', href: SAFETY_URL });
  s.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${BAR_SVG.safety}</svg><span>Safety</span>`;
  if (here() === 'blocks/safety/') s.setAttribute('aria-current', 'page');
  put(s);

  // The menu row under the bar on phones.
  const menu = inner.querySelector(MENU_SEL);
  let row = null; let home = null; let mq = null; let place = null;
  if (menu) {
    home = { parent: menu.parentElement, next: menu.nextSibling };
    row = make('div', { class: 'ra-titlerow' });
    mq = matchMedia('(max-width: 479.98px)');
    place = () => {
      if (mq.matches) { if (menu.parentElement !== row) { bar.after(row); row.append(menu); } }
      else if (menu.parentElement === row) { home.parent.insertBefore(menu, home.next && home.next.parentNode === home.parent ? home.next : null); row.remove(); }
    };
    mq.addEventListener?.('change', place);
    place();
  }
  BAR_ACT = { off() {
    added.forEach((n) => n.remove());
    if (menu) { mq.removeEventListener?.('change', place); if (menu.parentElement === row) home.parent.insertBefore(menu, home.next && home.next.parentNode === home.parent ? home.next : null); row.remove(); }
  } };
}
function unmountBarActions() { if (BAR_ACT) { BAR_ACT.off(); BAR_ACT = null; } }

// ------------------------------------------------------------------ app look: the large title collapses into the bar
// While the page's first heading (the large title) is showing, the bar is transparent on the ground; once the title has
// scrolled under it the bar gets its blurred surface and hairline (css/skin-app.css, html[data-ra-collapsed]). One
// IntersectionObserver on the visible h1, re-aimed when the chapter changes. A page with no visible h1 is always collapsed.
let LT = null;
function mountLargeTitle() {
  if (LT || typeof IntersectionObserver === 'undefined' || typeof document === 'undefined') return;
  const html = document.documentElement;
  let io = null; let target = null; let raf = 0; let forced = false;
  const barH = () => { const b = document.querySelector('.ra-appbar, .ra-sbar'); return b ? Math.round(b.getBoundingClientRect().height) : 0; };
  // Under 480px the chapter menu is a row under the bar: the bar gets its surface once that row has scrolled under it.
  const pick = () => { const row = document.querySelector('.ra-titlerow'); if (row && row.getClientRects().length) return row; for (const h of document.querySelectorAll('h1')) { if (!h.closest('.ra-appbar, .ra-sbar, .ra-tabbar, dialog') && h.getClientRects().length) return h; } return null; };
  const set = (c) => html.toggleAttribute('data-ra-collapsed', c);
  const aim = () => {
    raf = 0;
    const t = pick();
    if (t === target && io && !forced) return;
    forced = false;
    io?.disconnect(); io = null; target = t;
    if (!t) { set(true); return; }
    io = new IntersectionObserver(([e]) => {
      // An entry with no root bounds is the observer's answer for an element that has just been moved in the page (the
      // desktop rail re-parents <main>): look again at once, on a fresh observer.
      if (!e.rootBounds) { forced = true; soon(); return; }
      set(!e.isIntersecting && e.boundingClientRect.bottom <= barH() + 2);
    }, { rootMargin: `-${barH()}px 0px 0px 0px` });
    io.observe(t);
  };
  const soon = (force) => { if (force === true) forced = true; if (!raf) raf = requestAnimationFrame(aim); };
  const mo = new MutationObserver((list) => { if (list.some((m) => m.type === 'childList' || m.target.matches?.('.tb-chapter, main, [hidden]'))) soon(); });
  const main = document.getElementById('main') || document.body;
  mo.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  const on = ['hashchange', 'tb-chapter', 'tb-ready', 'resize', 'load'];
  const again = () => soon();
  for (const ev of on) addEventListener(ev, again);
  document.addEventListener('tb-chapter', again);
  const timer = setTimeout(() => soon(true), 400); // after the page has finished building itself
  aim();
  LT = { off() { clearTimeout(timer); io?.disconnect(); mo.disconnect(); for (const ev of on) removeEventListener(ev, again); document.removeEventListener('tb-chapter', again); html.removeAttribute('data-ra-collapsed'); } };
}
function unmountLargeTitle() { if (!LT) return; LT.off(); LT = null; }

// ------------------------------------------------------------------ auto-hide
let AH = null;
function syncAutoHide() {
  const on = getAutoHide();
  document.documentElement.toggleAttribute('data-ra-autohide', on);
  if (!on) AH?.show();
}

function initAutoHide(bar) {
  const html = document.documentElement;
  let lastY = scrollY; let down = 0; let hidden = false; let quietUntil = 0; let touching = false;
  const now = () => performance.now();
  const quiet = (ms = 500) => { quietUntil = Math.max(quietUntil, now() + ms); };
  /** Where the bar sits before it sticks (just under the site header and breadcrumbs). */
  const naturalTop = () => { let p = bar.previousElementSibling; while (p && !p.getClientRects().length) p = p.previousElementSibling; return p ? p.getBoundingClientRect().bottom + scrollY : 0; };
  const busy = () => bar.contains(document.activeElement)
    || !!bar.querySelector('[aria-expanded="true"]')
    || !!document.querySelector('.ra-titlerow [aria-expanded="true"]')
    || [...bar.querySelectorAll('[role="dialog"], .tb-sheet, .sp-sheet')].some((d) => !d.hidden && d.getClientRects().length);
  const show = () => { if (!hidden) return; hidden = false; html.removeAttribute('data-ra-bar'); html.style.removeProperty('--ra-bar-now'); };
  const hide = () => { if (hidden) return; hidden = true; html.dataset.raBar = 'hidden'; html.style.setProperty('--ra-bar-now', '0px'); };
  AH = { show };
  // Only the reader scrolling hides the bar: a wheel, a finger moving the page, a scroll key or the scrollbar in the last
  // moment. Scrolls the page makes itself (deep links, chapter changes, a scan step or Play changing the height of the
  // text, scroll anchoring) never hide it, so the bar and the sticky scan image don't move on their own.
  let userAt = -1e9;
  const user = () => { userAt = now(); };
  addEventListener('wheel', user, { passive: true, capture: true });
  addEventListener('touchmove', user, { passive: true, capture: true });
  let dragging = false; // the scrollbar (a press on the page's own edge)
  addEventListener('pointerdown', (e) => { if (e.target === html) { dragging = true; user(); } }, { passive: true, capture: true });
  addEventListener('pointerup', () => { dragging = false; }, { passive: true, capture: true });
  addEventListener('scroll', () => {
    const y = scrollY; const dy = y - lastY; lastY = y;
    if (!getAutoHide()) { show(); return; }
    if (y <= naturalTop() + 2) { show(); down = 0; return; } // at the top of the page
    if (dy < -1) { show(); down = 0; return; } // any scroll up brings it back
    if (touching || now() < quietUntil || (!dragging && now() - userAt > 400) || busy()) { down = 0; return; }
    if (dy > 0) { down += dy; if (down > 24) hide(); }
  }, { passive: true });
  // Programmatic jumps (deep links, chapter changes) and anything a tap or key press makes reflow (a scan step, a
  // disclosure) are not the reader scrolling down: keep the bar where it is for a moment.
  const SCROLL_KEYS = new Set([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End']);
  document.addEventListener('click', () => quiet(), true);
  document.addEventListener('keydown', (e) => { if (!SCROLL_KEYS.has(e.key) || e.target.closest?.('input,textarea,select,[contenteditable],.tb-scan,[role="group"]')) quiet(); else user(); }, true);
  // A finger on a scan image (swipe to step) or a 3D model is not a page scroll.
  document.addEventListener('touchstart', (e) => { if (e.target.closest?.('.tb-scan-stage,.ra-scan-col,canvas,[data-ra-keepbar]')) touching = true; }, { passive: true, capture: true });
  const untouch = () => { if (touching) { touching = false; quiet(450); } };
  document.addEventListener('touchend', untouch, { passive: true, capture: true });
  document.addEventListener('touchcancel', untouch, { passive: true, capture: true });
  addEventListener('hashchange', () => { quiet(700); show(); });
  document.addEventListener('tb-chapter', () => { quiet(700); show(); });
  addEventListener('resize', () => quiet(300));
  bar.addEventListener('focusin', show);
  // A menu or the search sheet opening (aria-expanded flips) shows the bar too.
  new MutationObserver(() => { if (busy()) show(); }).observe(bar, { subtree: true, attributes: true, attributeFilter: ['aria-expanded', 'hidden'] });
  addEventListener('storage', (e) => { if (e.key === KEY_AUTOHIDE) { delete memory[KEY_AUTOHIDE]; syncAutoHide(); } });
  syncAutoHide();
}

// ------------------------------------------------------------------ keyboard
function initKeys(search) {
  if (typeof search !== 'function') return;
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    const t = e.target;
    const typing = !!(t?.isContentEditable || t?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'));
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); search(); return; }
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && getSlash()) { e.preventDefault(); search(); }
  });
}

// ------------------------------------------------------------------ speculation rules (prefetch)
// Prefetch only, never prerender: a prerendered page would run its scripts in the background (scan canvases, 3D models,
// the level picker) and could show a level or setting chosen after it was rendered. Prefetching just fetches the next
// page's HTML from this site when the reader hovers or presses on a link to another regional page.
function initSpeculation() {
  if (typeof HTMLScriptElement === 'undefined' || typeof HTMLScriptElement.supports !== 'function' || !HTMLScriptElement.supports('speculationrules')) return;
  if (document.querySelector('script[type="speculationrules"][data-ra]')) return;
  const base = ROOT.pathname;
  const dirs = ['blocks/', 'truncal/', 'head-neck/', 'lower-limb/', 'upper-limb/', 'spinal/', 'brachial-plexus/', 'plexus/'];
  const rules = {
    prefetch: [{
      source: 'document',
      where: { and: [
        { or: dirs.map((d) => ({ href_matches: `${base}${d}*`, relative_to: 'document' })) },
        // not the animation player (Dr Chew Shi Hao's, shown in an iframe), links within this page, downloads or new tabs
        { not: { href_matches: `${base}lower-limb/anim/*`, relative_to: 'document' } },
        { not: { selector_matches: 'a[href^="#"], a[download], a[target="_blank"], [rel~="nofollow"]' } },
      ] },
      eagerness: 'moderate',
    }],
  };
  const s = document.createElement('script');
  s.type = 'speculationrules';
  s.dataset.ra = '';
  s.textContent = JSON.stringify(rules);
  document.head.append(s);
}

// ------------------------------------------------------------------ one call per page
let started = false;
/**
 * initAppFeel({bar, search}): bar = the page's sticky regional app bar; search = open or focus this page's search.
 * Safe to call on any regional page, once; every part is harmless where the browser lacks it.
 */
export function initAppFeel({ bar = null, search = null } = {}) {
  if (started) return;
  started = true;
  ensureCss();
  try { initSpeculation(); } catch { /* never block the page */ }
  initKeys(search);
  if (bar) { bar.classList.add('ra-appbar'); initAutoHide(bar); } else syncAutoHide();
  // The app look's tab bar and bar buttons: drawn while html[data-skin="app"] on every regional page, and live when Settings switches the look.
  const sync = (skin) => {
    try { if (skin === 'app') { mountTabBar(); mountBarActions(bar, search); mountLargeTitle(); } else { unmountTabBar(); unmountBarActions(); unmountLargeTitle(); } } catch (err) { console.error('[appnav] tab bar', err); }
  };
  sync(getSkin());
  onSkin(sync);
  // A page prerendered before the reader changed a setting: read the settings again when it is shown.
  document.addEventListener('prerenderingchange', () => { delete memory[KEY_AUTOHIDE]; delete memory[KEY_SLASH]; syncAutoHide(); }, { once: true });
}
