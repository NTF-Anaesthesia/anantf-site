// Regional anaesthesia app: the parts every regional page shares around its own app bar (ENGINE.md §2 "App frame").
//
//   initAppFeel({bar, search})  once per page: the page's sticky app bar (bar) and a function that opens or focuses its
//                               search (search, optional). Turns on, for this page:
//                                 - "Hide the bar while scrolling down" (Settings; localStorage 'ra-autohide', off by default)
//                                 - the keyboard: "/" (unless turned off in Settings; 'ra-slash') and Ctrl+K / Cmd+K focus search
//                                 - speculation rules: same-site regional links are prefetched / prerendered on hover
//                                   (Chromium only; nothing happens in browsers without them)
//   mountRail({main, groups})   desktop navigation rail (≥ 1024 px, css/appnav.css): this page's chapters or sections,
//                               then this region's pages, the other regions and the tools. Wraps <main> in .ra-frame.
//   settingsItem(cls)           <li><a> "Settings" for an app bar menu; settingsButton(cls) the same as a bar button
//   getAutoHide/setAutoHide, getSlash/setSlash, SETTINGS_URL, REGION_NAV, TOOL_NAV, regionOf(path)
//
// No imports and no state outside this module: import it as appnav.js?v=20261017 everywhere (one instance per page).
// Cross-document view transitions are pure CSS (@view-transition in css/appnav.css).

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
export const TOOL_NAV = Object.freeze([['All regional blocks', 'blocks/'], ['Dose calculator', 'blocks/calculator/'], ['Anatomy in 3D', 'plexus/'], ['Settings', 'blocks/settings/']]);

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
  l.href = new URL('../css/appnav.css?v=20261017', import.meta.url).href;
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
  group('Tools', TOOL_NAV.map(([t, h]) => ({ href: R(h), text: t, current: path === h })), 'ra-rail-g--tools');

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
    || [...bar.querySelectorAll('[role="dialog"], .tb-sheet, .sp-sheet')].some((d) => !d.hidden && d.getClientRects().length);
  const show = () => { if (!hidden) return; hidden = false; html.removeAttribute('data-ra-bar'); html.style.removeProperty('--ra-bar-now'); };
  const hide = () => { if (hidden) return; hidden = true; html.dataset.raBar = 'hidden'; html.style.setProperty('--ra-bar-now', '0px'); };
  AH = { show };
  addEventListener('scroll', () => {
    const y = scrollY; const dy = y - lastY; lastY = y;
    if (!getAutoHide()) { show(); return; }
    if (y <= naturalTop() + 2) { show(); down = 0; return; } // at the top of the page
    if (dy < -1) { show(); down = 0; return; } // any scroll up brings it back
    if (touching || now() < quietUntil || busy()) { down = 0; return; }
    if (dy > 0) { down += dy; if (down > 24) hide(); }
  }, { passive: true });
  // Programmatic jumps (deep links, chapter changes) and anything a tap or key press makes reflow (a scan step, a
  // disclosure) are not the reader scrolling down: keep the bar where it is for a moment.
  const SCROLL_KEYS = new Set([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End']);
  document.addEventListener('click', () => quiet(), true);
  document.addEventListener('keydown', (e) => { if (!SCROLL_KEYS.has(e.key) || e.target.closest?.('input,textarea,select,[contenteditable],.tb-scan,[role="group"]')) quiet(); }, true);
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
    const typing = !!e.target.closest?.('input,textarea,select,[contenteditable=""],[contenteditable="true"]');
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); search(); return; }
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && getSlash()) { e.preventDefault(); search(); }
  });
}

// ------------------------------------------------------------------ speculation rules (prefetch / prerender)
function initSpeculation() {
  if (typeof HTMLScriptElement === 'undefined' || typeof HTMLScriptElement.supports !== 'function' || !HTMLScriptElement.supports('speculationrules')) return;
  if (document.querySelector('script[type="speculationrules"][data-ra]')) return;
  const base = ROOT.pathname;
  const light = ['blocks/', 'truncal/', 'head-neck/', 'lower-limb/', 'upper-limb/', 'spinal/'];
  const heavy = ['brachial-plexus/', 'plexus/']; // three.js and models: fetch the page, never run it in the background
  const pat = (dirs) => ({ or: dirs.map((d) => ({ href_matches: `${base}${d}*`, relative_to: 'document' })) });
  const notHere = { not: { selector_matches: 'a[href^="#"], a[download], a[target="_blank"], [rel~="nofollow"] a' } };
  const notAnim = { not: { href_matches: `${base}lower-limb/anim/*`, relative_to: 'document' } };
  const rules = {
    prerender: [{ source: 'document', where: { and: [pat(light), notHere, notAnim] }, eagerness: 'moderate' }],
    prefetch: [{ source: 'document', where: { and: [pat(heavy), notHere] }, eagerness: 'moderate' }],
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
  // A page prerendered before the reader changed a setting: read the settings again when it is shown.
  document.addEventListener('prerenderingchange', () => { delete memory[KEY_AUTOHIDE]; delete memory[KEY_SLASH]; syncAutoHide(); }, { once: true });
}
