// Offline copy of the Baby MO test, so it opens from the home screen with no signal and a test already open keeps working.
// Lessons from the logbook and prewarming apps (anawj.com), applied here:
//  - One cache per version, filled all at once on install (all or nothing), so the page never runs with some files from
//    one version and some from another. An install that fails leaves the working version in place.
//  - VERSION is the hash of the files in SHELL and SITE (see tools/stamp.mjs); test/version.test.mjs fails if it is stale.
//  - Network first, so online you always get the newest files; the cache is for no signal or a slow signal.
//  - A new version WAITS (no skipWaiting on install). The page tells it to take over (message 'skipWaiting') only when it
//    is safe: never during a test or while someone is typing (js/app.js, "safe updates").
//  - Only this app's caches are deleted (prefix), and only Baby MO's own files are handled (Firebase, Google: network).
//  - SITE: shared files outside this folder that the app needs (fonts, the question bank's code). DATA: the question bank
//    and the paper (../qbank/), precached too but not part of the hash: they change often and are always fetched fresh
//    when there is a signal, so a bank change never needs a new Baby MO version.

const VERSION = 'babymo-2026-10-15-f9b3988f';
const NET_WAIT = 3000; // ms before falling back to the cached copy
const SHELL = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'js/app.js', 'js/logic.js', 'js/ui.js', 'js/store.js', 'js/local.js', 'js/cloud.js', 'js/firebase-config.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];
const SITE = ['../qbank/js/bank.js', '../fonts/inter.woff2', '../fonts/fraunces-roman.woff2', '../fonts/jetbrains-mono.woff2', '../ana-ntf-monogram.svg'];
const DATA = ['../qbank/bank/questions.json', '../qbank/papers/babymo.json'];

const abs = u => new URL(u, self.location).href;
const OUTSIDE = new Set([...SITE, ...DATA].map(u => new URL(u, self.location).pathname));
const IMG = new URL('../qbank/img/', self.location).pathname;   // question pictures: cached as they are seen

self.addEventListener('install', e => {
  // addAll fails as a whole if any file is missing, which is what we want: keep the old version rather than a broken one
  e.waitUntil(caches.open(VERSION).then(c => c.addAll([...SHELL, ...SITE, ...DATA].map(u => new Request(abs(u), { cache: 'reload' })))));
});

// The page asks a waiting worker to take over when it is safe.
self.addEventListener('message', e => { if (e.data === 'skipWaiting') e.waitUntil(self.skipWaiting()); });   // waitUntil: the worker must not be stopped before it takes over

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
  const inScope = url.pathname.startsWith(new URL(self.registration.scope).pathname);
  const outside = OUTSIDE.has(url.pathname) || url.pathname.startsWith(IMG);
  if (!inScope && !outside) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    // the page itself is cached under the folder, whatever the query or #route (demo links, ?emu, etc.); files outside
    // the folder by their path, whatever their ?v=
    const shell = req.mode === 'navigate' && /\/(index\.html)?$/.test(url.pathname);
    const key = shell ? abs('./') : outside ? abs(url.pathname) : req;
    const cached = () => cache.match(key, { ignoreSearch: shell || outside });
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
      const hit = await cached() || (shell && await cache.match(abs('./')));
      if (hit) return hit;
      throw err;
    }
  })());
});
