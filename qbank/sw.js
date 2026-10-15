// Offline copy of the qbank app, so it opens from the home screen with no signal and practice keeps working.
// Lessons from Baby MO, the MO guide and the anawj.com apps:
//  - One cache per version, filled all at once on install (all or nothing): the app's files (SHELL), the shared app kit
//    and the fonts it loads (SITE: ../assets/app/app.css, ../fonts/) and the questions and papers (DATA). An install that fails leaves the working version in place.
//  - VERSION, SHELL, SITE and DATA are written by tools/stamp.mjs (a hash of every file); test/version.test.mjs fails
//    if they are stale.
//  - The app's own files: cache first, so a page always runs on one version, never half old and half new.
//  - The questions and papers: network first (with a short wait), so a corrected question arrives without a new
//    release; the cached copy is used with no signal or a slow one.
//  - A new version takes over by itself (skipWaiting) and never reloads the page: the page decides when it is safe.
//  - Only this app's caches (prefix qbank-) are deleted.

const VERSION = 'qbank-2026-10-15-3250dc19';
const NET_WAIT = 2500; // ms before falling back to the cached questions
const SHELL = ['./', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'index.html', 'js/app.js', 'js/bank.js', 'js/practice.js', 'manifest.webmanifest', 'ui/qbank.css', 'ui/ui.js'];
const SITE = ['../assets/app/app.css', '../fonts/fraunces-roman.woff2', '../fonts/inter.woff2', '../fonts/jetbrains-mono.woff2'];
const DATA = ['bank/questions.json', 'papers.json', 'papers/babymo.json', 'sources.json'];

self.addEventListener('install', e => {
  const all = [...SHELL, ...SITE, ...DATA].map(u => new Request(u, { cache: 'reload' }));
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(all)).then(() => self.skipWaiting()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('qbank-') && k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

const abs = p => new URL(p, self.registration.scope).pathname;
const SCOPE = new URL(self.registration.scope).pathname;
const SITE_PATHS = new Set(SITE.map(abs));
const isData = p => p.startsWith(SCOPE + 'bank/') || p.startsWith(SCOPE + 'papers/') || p.startsWith(SCOPE + 'img/') || p === SCOPE + 'sources.json' || p === SCOPE + 'papers.json';

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const p = url.pathname;
  if (!p.startsWith(SCOPE) && !SITE_PATHS.has(p)) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (isData(p)) {
      const cached = () => cache.match(req, { ignoreSearch: true });
      const net = fetch(req).then(res => { if (res.ok && res.type === 'basic') cache.put(req, res.clone()); return res; });
      const slow = new Promise(r => setTimeout(r, NET_WAIT)).then(cached).then(hit => hit || net);
      slow.catch(() => {});
      try { return await Promise.race([net, slow]); } catch (err) { const hit = await cached(); if (hit) return hit; throw err; }
    }
    // the page itself, whatever the query or #route
    const shell = req.mode === 'navigate' && /\/(index\.html)?$/.test(p);
    const hit = await cache.match(shell ? './' : req, { ignoreSearch: true });
    if (hit) return hit;
    return fetch(req);
  })());
});
