// Regional anaesthesia app: the two skins (ENGINE.md §2 "Skins").
//
// The same pages and the same content are shown in one of two looks:
//   'web'  the website look (DESIGN.md: paper, square edges, hairlines, the NTF site header and breadcrumbs)
//   'app'  the app look (DESIGN-APP.md: soft corners, grouped lists on a warm ground, translucent bars, a bottom tab bar
//          that becomes a left rail from 1024 px; css/skin-app.css, every rule under html[data-skin="app"])
//
// The reader's preference is localStorage 'ra-skin': 'auto' (default) | 'app' | 'web'. With 'auto' the app look is used
// only when the block app is opened as an app: from the home screen (display-mode: standalone), or through the block-app
// link (/blocks/?app, which sets sessionStorage 'ra-in-app' for this tab). Anywhere else (a shared deep link, a normal
// visit) it is the website look. Content, levels, doses, anchors and hashes are the same in both.
//
// An inline script in every regional page's <head> (the same text on every page; ENGINE.md has it, shared/regional/test/skin.mjs
// checks it) sets html[data-skin] before first paint; this module does the same on import (so a stale page without the
// script still gets a skin), and is what Settings and the app frame call. No imports. Import it as skin.js?v=20261018.
// Every read and write is in try/catch: a private window or blocked storage just means 'auto' and a skin that lasts for
// this page.

export const SKIN_KEY = 'ra-skin';
export const IN_APP_KEY = 'ra-in-app';
export const SKIN_PREFS = Object.freeze(['auto', 'app', 'web']);

let memory = null; // a choice made while storage is blocked: lasts for this page
const listeners = new Set();

/** The saved preference: 'auto' (default), 'app' or 'web'. */
export function getSkinPref() {
  try { const v = localStorage.getItem(SKIN_KEY); if (SKIN_PREFS.includes(v)) return v; } catch { return memory || 'auto'; }
  return memory || 'auto';
}

/** True when the block app was opened as an app: added to the home screen, or through the block-app link in this tab. */
export function openedAsApp() {
  try {
    if (/\/blocks\/(?:index\.html)?$/.test(location.pathname) && /[?&]app(?:[=&]|$)/.test(location.search)) sessionStorage.setItem(IN_APP_KEY, '1');
  } catch { /* storage blocked */ }
  try { if (matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) return true; } catch { /* no matchMedia */ }
  try { return !!sessionStorage.getItem(IN_APP_KEY); } catch { return false; }
}

/** The skin a preference gives right now: 'app' or 'web'. An explicit choice always wins; 'auto' follows openedAsApp(). */
export function resolveSkin(pref = getSkinPref()) {
  if (pref === 'app' || pref === 'web') return pref;
  return openedAsApp() ? 'app' : 'web';
}

/** The skin in use on this page ('app' or 'web'), as set on <html>. */
export const getSkin = () => (document.documentElement.dataset.skin === 'app' ? 'app' : 'web');

/** Set html[data-skin] from the preference; tells onSkin() listeners when it changed. Returns the skin. */
export function applySkin() {
  const was = document.documentElement.dataset.skin;
  const now = resolveSkin();
  try { document.querySelector('meta[name="theme-color"]')?.setAttribute('content', now === 'app' ? '#f1ede4' : '#f7f5ef'); } catch { /* none */ }
  if (was !== now) {
    document.documentElement.dataset.skin = now;
    for (const fn of [...listeners]) { try { fn(now); } catch (err) { console.error('[skin]', err); } }
    try { document.dispatchEvent(new CustomEvent('ra-skin', { detail: { skin: now } })); } catch { /* old browser */ }
  }
  return now;
}

/** Choose 'auto' | 'app' | 'web' (saved on this device) and switch the page at once, without a reload. */
export function setSkinPref(pref) {
  if (!SKIN_PREFS.includes(pref)) return getSkin();
  memory = pref;
  try { localStorage.setItem(SKIN_KEY, pref); } catch { /* private window: lasts for this page only */ }
  return applySkin();
}

/** Call fn(skin) whenever the skin changes. Returns an unsubscribe function. */
export function onSkin(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// Another tab changed the preference: follow it. Pages restored from the back/forward cache re-read it too.
if (typeof addEventListener === 'function') {
  addEventListener('storage', (e) => { if (e.key === SKIN_KEY || e.key === null) { memory = null; applySkin(); } });
  addEventListener('pageshow', (e) => { if (e.persisted) applySkin(); });
}
if (typeof document !== 'undefined') applySkin();
