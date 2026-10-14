// Offline copy of the Baby MO test, so it opens from the home screen with no signal and a test already open keeps working.
// Lessons from the logbook and prewarming apps (anawj.com), applied here:
//  - One cache per version, filled all at once on install (all or nothing), so the page never runs with some files from
//    one version and some from another. An install that fails leaves the working version in place.
//  - VERSION is the hash of the files listed in SHELL (see tools/stamp.mjs); test/version.test.mjs fails if it is stale.
//  - Network first, so online you always get the newest files; the cache is for no signal or a slow signal.
//  - A new version takes over by itself (skipWaiting) and never reloads the page: the page decides when it is safe.
//  - Only this app's caches are deleted (prefix), and only Baby MO's own address is handled (Firebase, fonts: network).

const VERSION = 'babymo-2026-10-14-4301b10c';
const NET_WAIT = 3000; // ms before falling back to the cached copy
const SHELL = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'js/app.js', 'js/logic.js', 'js/store.js', 'js/local.js', 'js/cloud.js', 'js/firebase-config.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  // addAll fails as a whole if any file is missing, which is what we want: keep the old version rather than a broken one
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

// The page can ask a waiting worker to take over.
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('babymo-') && k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    // the page itself is cached under the folder, whatever the query or #route (demo links, ?emu, etc.)
    const shell = req.mode === 'navigate' && /\/(index\.html)?$/.test(url.pathname);
    const key = shell ? './' : req;
    const cached = () => cache.match(key, { ignoreSearch: req.mode === 'navigate' });
    const net = fetch(req).then(res => {
      if (res.ok && res.type === 'basic') cache.put(key, res.clone());
      return res;
    });
    // slow network: show the cached copy rather than wait (the fetch still refreshes the cache for next time)
    const slow = new Promise(r => setTimeout(r, NET_WAIT)).then(cached).then(hit => hit || net);
    slow.catch(() => {}); // offline: handled below
    try {
      return await Promise.race([net, slow]);
    } catch (err) {
      const hit = await cached() || (shell && await cache.match('./'));
      if (hit) return hit;
      throw err;
    }
  })());
});
