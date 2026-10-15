// Offline copy of the MO guide, so it opens from the home screen in theatre with no signal.
// Same rules as the Baby MO test (../babymo/sw.js), learned in the logbook and prewarming apps:
//  - One cache per version, filled all at once on install (all or nothing): the page never runs on a mix of two versions,
//    and an install that fails leaves the working version in place.
//  - VERSION is a hash of every file in SHELL and SITE (tools/stamp.mjs writes both, and the hash); test/version.test.mjs
//    fails if it is stale, so a phone always gets the new files.
//  - Cache first for the files in SHELL and SITE: a page always runs on one version (never half old, half new modules), and
//    opens at once with a weak signal. New files arrive as a new VERSION: the page checks for one when it opens, when it
//    comes to the front and every 10 minutes, and reloads into it when that is safe (app.js).
//  - A new version takes over by itself (skipWaiting) and never reloads the page: the page decides when it is safe.
//  - Only this app's caches (prefix mo-) are deleted. SITE is the shared site header, styles and fonts outside this folder.

const VERSION = 'mo-2026-10-15-c6300ae9';
const SHELL = ['./', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'index.html', 'js/app.js', 'js/calc.js', 'js/content/cases.js', 'js/content/emergence.js', 'js/content/emergencies.js', 'js/content/good.js', 'js/content/index.js', 'js/content/induction.js', 'js/content/maintenance.js', 'js/content/pacu.js', 'js/content/pain-aps.js', 'js/content/patients.js', 'js/content/preop.js', 'js/content/regional.js', 'js/content/sedation.js', 'js/content/setup.js', 'js/content/start.js', 'js/data/cards.js', 'js/data/crises.js', 'js/data/drugs-core.js', 'js/data/drugs-more.js', 'js/data/drugs.js', 'js/data/scenarios.js', 'js/drugs-ui.js', 'js/figures.js', 'js/md.js', 'js/practice.js', 'js/render.js', 'js/search.js', 'js/store.js', 'js/tools.js', 'js/ui.js', 'manifest.webmanifest', 'style.css'];
const SITE = ['../ana-ntf-monogram.svg', '../assets/app/app.css', '../fonts/fraunces-roman.woff2', '../fonts/inter.woff2', '../fonts/jetbrains-mono.woff2'];

self.addEventListener('install', e => {
  const all = [...SHELL, ...SITE].map(u => new Request(u, { cache: 'reload' }));
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(all)).then(() => self.skipWaiting()));
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('mo-') && k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

const sitePaths = new Set(SITE.map(u => new URL(u, self.location).pathname));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const inScope = url.pathname.startsWith(new URL(self.registration.scope).pathname);
  const site = sitePaths.has(url.pathname);
  if (!inScope && !site) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    // the page itself is cached under the folder, whatever the query or #route; site files whatever their ?v=
    const shell = req.mode === 'navigate' && /\/(index\.html)?$/.test(url.pathname);
    const key = shell ? './' : site ? url.pathname : req;
    const hit = await cache.match(key, { ignoreSearch: shell || site });
    if (hit) return hit;
    // not part of this version (or the cache was cleared): straight to the network, and not kept, so the version cache
    // only ever holds the files it was installed with
    return fetch(req);
  })());
});
