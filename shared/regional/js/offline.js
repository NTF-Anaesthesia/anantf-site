// Offline use of the regional anaesthesia app: registers /regional-sw.js (the only service worker the regional pages
// may register; see the comment at the top of that file) and paints the "App version" line and the "Not updating? Get
// the latest version" button at the foot of /blocks/.
//
// Import it under one URL everywhere (offline.js?v=20261016) and call registerOffline() once the page has started.
// The worker is registered after the page has loaded and gone quiet, so it never slows the first paint.

const SW_URL = new URL('../../../regional-sw.js', import.meta.url);
const SCOPE = new URL('../../../', import.meta.url);
const PREFIX = 'regional-';
const VERSION_RE = /^regional-(\d{4}-\d{2}-\d{2})-([0-9a-f]{8})$/;

const supported = () => 'serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname));
const isOurs = (reg) => {
  const w = reg && (reg.active || reg.waiting || reg.installing);
  return !!w && new URL(w.scriptURL).pathname === SW_URL.pathname;
};

let started = false;
/** Register the regional worker (once per page), after load and idle time. Never throws. */
export function registerOffline() {
  if (started || !supported()) return;
  started = true;
  const go = () => {
    navigator.serviceWorker.register(SW_URL.href, { scope: SCOPE.href }).then((reg) => {
      const check = () => reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
      addEventListener('online', check);
    }).catch(() => { /* private window, blocked storage: the pages still work online */ });
  };
  const later = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 1500));
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });
}

/** The saved version, as "2026-10-16 (3f9a2c1d)", or '' when nothing is saved yet. */
export async function savedVersion() {
  try {
    const k = (await caches.keys()).find((x) => VERSION_RE.test(x));
    if (!k) return '';
    const m = k.match(VERSION_RE);
    return `${m[1]} (${m[2]})`;
  } catch { return ''; }
}

/**
 * Fill the app version block: host holds [data-appver-line], a [data-appver-btn] button and a [data-appver-msg]
 * status line. The version line stays hidden until a copy is saved.
 */
export function mountAppVersion(host) {
  if (!host) return;
  const line = host.querySelector('[data-appver-line]');
  const btn = host.querySelector('[data-appver-btn]');
  const msg = host.querySelector('[data-appver-msg]');
  const paint = async () => {
    const v = await savedVersion();
    if (line) { line.textContent = v ? `App version ${v}` : ''; line.hidden = !v; }
  };
  paint();
  if (supported()) navigator.serviceWorker.ready.then(() => setTimeout(paint, 300)).catch(() => {});
  btn?.addEventListener('click', () => getLatest(btn, msg));
}

/**
 * "Not updating? Get the latest version": checks for signal first, then removes only the regional worker and the
 * regional- caches, and reloads. The saved level (ra-level) and the other apps' workers and caches are never touched.
 */
async function getLatest(btn, msg) {
  btn.disabled = true; btn.setAttribute('aria-disabled', 'true');
  if (msg) msg.textContent = 'Checking for signal…';
  try {
    const url = new URL(SW_URL); url.searchParams.set('fresh', Date.now());
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    if ('serviceWorker' in navigator) for (const reg of await navigator.serviceWorker.getRegistrations()) if (isOurs(reg)) await reg.unregister();
    if ('caches' in window) for (const k of await caches.keys()) if (k.startsWith(PREFIX)) await caches.delete(k);
    if (msg) msg.textContent = 'Getting the latest version…';
    location.reload();
  } catch {
    if (msg) msg.textContent = 'No signal: nothing was changed. Try again with signal.';
    btn.disabled = false; btn.removeAttribute('aria-disabled');
  }
}
