// Offline copy of the regional anaesthesia app (blocks/, truncal/, head-neck/, lower-limb/, brachial-plexus/, plexus/,
// spinal/ and the shared engine), so the pages open in theatre with no signal once they have been opened with signal.
//
// Why it sits at the site root: GitHub Pages cannot send a Service-Worker-Allowed header, so a worker can only claim
// the folder it is served from. The app spans several top-level folders, so the worker lives at /regional-sw.js with
// scope "/". It ONLY answers requests for the regional paths below (claims()); for everything else (the homepage, mo/,
// qbank/, babymo/, exams/, …) it returns without calling respondWith, so the browser fetches them as if there were no
// worker. mo/, qbank/ and babymo/ register their own workers with their own folder as scope; a narrower scope always
// wins, so those apps keep their own workers, and their caches (mo-, qbank-, babymo-) are never touched here.
//
//  - VERSION is a hash of every file in SHELL and SITE plus this file (shared/regional/tools/stamp.mjs writes the lists
//    and the hash; test/regional/version.test.mjs fails when it is stale). MEDIA is a hash of the pictures, models and
//    three.js files: when one of them changes, the picture and model cache is dropped and refilled on use.
//  - Install precaches SHELL and SITE all at once (all or nothing). Big 3D models, three.js, scans and pictures
//    (including the site pictures in SITE_MEDIA) are not precached: they are kept the first time they are used
//    (cache first).
//  - Pages (navigations, including the animation iframe): network first, falling back to the saved copy when there is
//    no signal or the network takes more than a few seconds.
//  - Scripts and styles with ?v=: stale-while-revalidate. Without ?v= (and site files outside the regional folders):
//    network first with the saved copy as fallback, so with signal nothing ever runs older than the live site.
//  - A new version takes over by itself (skipWaiting + claim) and never reloads a page.
//  - Only this app's caches (prefix regional-) are deleted.

const VERSION = 'regional-2026-10-16-cf80409b';
const MEDIA = 'regional-media-d46db001';
const SHELL = ['blocks/', 'blocks/blocks.css', 'blocks/blocks.js', 'blocks/calculator/', 'blocks/calculator/calculator.js', 'blocks/chooser.js', 'blocks/indication/', 'blocks/indication/indication.js', 'blocks/pagebar.js', 'blocks/pages.css', 'blocks/safety/', 'blocks/safety/safety.js', 'blocks/settings/', 'blocks/settings/settings.css', 'blocks/settings/settings.js', 'blocks/ultrasound/', 'blocks/ultrasound/ultrasound.js', 'brachial-plexus/', 'brachial-plexus/css/app.css', 'brachial-plexus/css/coverage.css', 'brachial-plexus/css/diagram.css', 'brachial-plexus/css/shell.css', 'brachial-plexus/css/ultrasound.css', 'brachial-plexus/css/viewer3d.css', 'brachial-plexus/js/app.js', 'brachial-plexus/js/bus.js', 'brachial-plexus/js/coverage.js', 'brachial-plexus/js/data.js', 'brachial-plexus/js/diagram.js', 'brachial-plexus/js/real-scans.js', 'brachial-plexus/js/ultrasound.js', 'brachial-plexus/js/viewer3d.js', 'brachial-plexus/us/sources.json', 'head-neck/', 'head-neck/airway/', 'head-neck/airway/js/blocks.js', 'head-neck/airway/js/page.js', 'head-neck/airway/js/scenes.js', 'head-neck/airway/js/topical.js', 'head-neck/cervical/', 'head-neck/cervical/js/anatomy.js', 'head-neck/cervical/js/blocks.js', 'head-neck/cervical/js/page.js', 'head-neck/cervical/js/scenes.js', 'head-neck/eye/', 'head-neck/eye/js/anatomy.js', 'head-neck/eye/js/blocks.js', 'head-neck/eye/js/page.js', 'head-neck/eye/js/scenes.js', 'head-neck/face/', 'head-neck/face/js/anatomy.js', 'head-neck/face/js/blocks.js', 'head-neck/face/js/page.js', 'head-neck/face/js/scenes.js', 'head-neck/landing.css', 'head-neck/landing.js', 'head-neck/scalp/', 'head-neck/scalp/js/anatomy.js', 'head-neck/scalp/js/blocks.js', 'head-neck/scalp/js/page.js', 'head-neck/scalp/js/scenes.js', 'head-neck/shared/css/headneck.css', 'head-neck/shared/js/head.js', 'lower-limb/', 'lower-limb/anim/', 'lower-limb/anim/ra/adductor-canal.js', 'lower-limb/anim/ra/ankle.js', 'lower-limb/anim/ra/engine.js', 'lower-limb/anim/ra/femoral.js', 'lower-limb/anim/ra/fib.js', 'lower-limb/anim/ra/lfcn.js', 'lower-limb/anim/ra/peng.js', 'lower-limb/anim/ra/popliteal.js', 'lower-limb/foot-ankle/', 'lower-limb/foot-ankle/js/anatomy.js', 'lower-limb/foot-ankle/js/blocks.js', 'lower-limb/foot-ankle/js/page.js', 'lower-limb/foot-ankle/js/scenes.js', 'lower-limb/foot-ankle/page.css', 'lower-limb/hip/', 'lower-limb/hip/js/anatomy.js', 'lower-limb/hip/js/blocks.js', 'lower-limb/hip/js/page.js', 'lower-limb/hip/js/pathway.js', 'lower-limb/hip/js/scenes.js', 'lower-limb/hip/page.css', 'lower-limb/knee/', 'lower-limb/knee/js/anatomy.js', 'lower-limb/knee/js/blocks.js', 'lower-limb/knee/js/page.js', 'lower-limb/knee/js/scenes.js', 'lower-limb/knee/js/strategy.js', 'lower-limb/knee/page.css', 'lower-limb/landing.css', 'lower-limb/landing.js', 'lower-limb/shared/css/lowerlimb.css', 'lower-limb/shared/js/anim.js', 'lower-limb/shared/js/leg.js', 'lower-limb/thigh/', 'lower-limb/thigh/js/anatomy.js', 'lower-limb/thigh/js/blocks.js', 'lower-limb/thigh/js/page.js', 'lower-limb/thigh/js/planner.js', 'lower-limb/thigh/js/scenes.js', 'lower-limb/thigh/page.css', 'plexus/', 'plexus/css/plexus.css', 'plexus/js/app.js', 'plexus/js/bus.js', 'plexus/js/data/brachial.js', 'plexus/js/data/cervical.js', 'plexus/js/data/lumbar.js', 'plexus/js/data/sacral.js', 'plexus/js/diagram.js', 'plexus/js/explorer.js', 'plexus/js/viewer3d.js', 'regional.html', 'shared/regional/css/appnav.css', 'shared/regional/css/decide.css', 'shared/regional/css/lacalc.css', 'shared/regional/css/levels.css', 'shared/regional/css/realscan.css', 'shared/regional/css/regional.css', 'shared/regional/css/scan.css', 'shared/regional/css/skin-app.css', 'shared/regional/css/status.css', 'shared/regional/js/appnav.js', 'shared/regional/js/block.js', 'shared/regional/js/bmode.js', 'shared/regional/js/data/decisions.js', 'shared/regional/js/decide.js', 'shared/regional/js/dermatomes.js', 'shared/regional/js/diagram.js', 'shared/regional/js/figures/arm.js', 'shared/regional/js/figures/head.js', 'shared/regional/js/figures/leg.js', 'shared/regional/js/la.js', 'shared/regional/js/lacalc.js', 'shared/regional/js/levels.js', 'shared/regional/js/offline.js', 'shared/regional/js/ops/ops-headneck.js', 'shared/regional/js/ops/ops-lowerlimb.js', 'shared/regional/js/ops/ops-truncal.js', 'shared/regional/js/ops/ops-upperlimb.js', 'shared/regional/js/realscan.js', 'shared/regional/js/refs.js', 'shared/regional/js/registry.js', 'shared/regional/js/scan.js', 'shared/regional/js/scene.js', 'shared/regional/js/search.js', 'shared/regional/js/shell.js', 'shared/regional/js/skin.js', 'shared/regional/js/status.js', 'shared/regional/js/ui.js', 'shared/us/head-neck/sources.json', 'shared/us/lower-limb/sources.json', 'shared/us/neuraxial/sources.json', 'shared/us/truncal/sources.json', 'shared/us/upper-limb/sources.json', 'spinal/', 'spinal/css/anatomy.css', 'spinal/css/base.css', 'spinal/css/card.css', 'spinal/css/complications.css', 'spinal/css/pharm.css', 'spinal/css/spines.css', 'spinal/css/technique.css', 'spinal/css/topics.css', 'spinal/css/troubleshooting.css', 'spinal/css/ultrasound.css', 'spinal/js/anatomy/baricity.js', 'spinal/js/anatomy/dermatomes.js', 'spinal/js/anatomy/fibres.js', 'spinal/js/anatomy/kit.js', 'spinal/js/anatomy/landmarks.js', 'spinal/js/anatomy/physiology.js', 'spinal/js/anatomy/sagittal.js', 'spinal/js/anatomy/structure.js', 'spinal/js/app.js', 'spinal/js/complications/connectors.js', 'spinal/js/complications/neurocheck.js', 'spinal/js/complications/pdph-tree.js', 'spinal/js/refs.js', 'spinal/js/search.js', 'spinal/js/sections/anatomy.js', 'spinal/js/sections/card.js', 'spinal/js/sections/complications.js', 'spinal/js/sections/exam.js', 'spinal/js/sections/pharm.js', 'spinal/js/sections/spines.js', 'spinal/js/sections/technique.js', 'spinal/js/sections/troubleshooting.js', 'spinal/js/sections/ultrasound.js', 'spinal/js/spines/figures.js', 'spinal/js/spines/panels.js', 'spinal/js/spines/paramedian.js', 'spinal/js/technique/anticoag-data.js', 'spinal/js/technique/figures.js', 'spinal/js/technique/pops.js', 'spinal/js/technique/widgets.js', 'spinal/js/topics.js', 'spinal/js/troubleshooting/redirect.js', 'spinal/js/troubleshooting/tree.js', 'spinal/js/troubleshooting/trees.js', 'spinal/js/ui.js', 'spinal/js/ultrasound/bmode.js', 'spinal/js/ultrasound/diagram.js', 'spinal/js/ultrasound/scenes.js', 'spinal/js/ultrasound/viewer.js', 'truncal/', 'truncal/abdominal-wall/', 'truncal/abdominal-wall/js/anatomy.js', 'truncal/abdominal-wall/js/blocks.js', 'truncal/abdominal-wall/js/page.js', 'truncal/abdominal-wall/js/scenes.js', 'truncal/abdominal-wall/page.css', 'truncal/back/', 'truncal/back/js/anatomy.js', 'truncal/back/js/blocks.js', 'truncal/back/js/page.js', 'truncal/back/js/scenes.js', 'truncal/back/page.css', 'truncal/chest-wall/', 'truncal/chest-wall/js/anatomy.js', 'truncal/chest-wall/js/blocks.js', 'truncal/chest-wall/js/page.js', 'truncal/chest-wall/js/scenes.js', 'truncal/chest-wall/page.css', 'truncal/landing.css', 'truncal/landing.js', 'truncal/shared/css/truncal.css', 'truncal/shared/js/block.js', 'truncal/shared/js/bmode.js', 'truncal/shared/js/dermatomes.js', 'truncal/shared/js/diagram.js', 'truncal/shared/js/refs.js', 'truncal/shared/js/scan.js', 'truncal/shared/js/scene.js', 'truncal/shared/js/search.js', 'truncal/shared/js/shell.js', 'truncal/shared/js/ui.js', 'upper-limb/', 'upper-limb/arm/', 'upper-limb/arm/js/blocks.js', 'upper-limb/arm/js/page.js', 'upper-limb/arm/js/scenes.js', 'upper-limb/forearm-hand/', 'upper-limb/forearm-hand/js/blocks.js', 'upper-limb/forearm-hand/js/page.js', 'upper-limb/forearm-hand/js/scenes.js', 'upper-limb/landing.css', 'upper-limb/landing.js', 'upper-limb/shared/css/upperlimb.css', 'upper-limb/shoulder/', 'upper-limb/shoulder/js/blocks.js', 'upper-limb/shoulder/js/page.js', 'upper-limb/shoulder/js/scenes.js'];
const SITE_MEDIA = ['assets/ether-navigation.webp', 'assets/ether-study.webp', 'assets/ether-teaching.webp', 'assets/ether-team.webp', 'assets/regional-axillary-block.jpg', 'assets/ultrasound-teaching.png'];
const SITE = ['ana-ntf-logo.svg', 'ana-ntf-monogram.svg', 'assets/app/app.css', 'assets/banner-framing.css', 'assets/couture-app.css', 'assets/couture.css', 'assets/editorial-layout.css', 'assets/header-nav.css', 'assets/lower-limb.css', 'assets/navigation.css', 'assets/navigation.js', 'assets/site-shell.css', 'assets/source-media.css', 'assets/source-media.js', 'fonts/fraunces-italic.woff2', 'fonts/fraunces-roman.woff2', 'fonts/inter.woff2', 'fonts/jetbrains-mono.woff2'];

const ROOT = new URL('./', self.location).pathname; // "/" on anantf.com
// Folders (and single pages) that belong to the regional app. Nothing outside these, SITE and SITE_MEDIA is answered.
const PREFIXES = ['blocks/', 'truncal/', 'head-neck/', 'lower-limb/', 'upper-limb/', 'brachial-plexus/', 'plexus/', 'spinal/', 'shared/regional/', 'shared/us/', 'shared/vendor/three-r160/'].map((p) => ROOT + p);
const PAGES = ['regional.html'].map((p) => ROOT + p);
const SITE_PATHS = new Set(SITE.map((u) => ROOT + u)); // precached
const SITE_MEDIA_PATHS = new Set(SITE_MEDIA.map((u) => ROOT + u)); // kept on first use
const MEDIA_RE = /\.(?:png|jpe?g|webp|gif|avif|svg|glb|gltf|bin|wasm|mp4|webm|ktx2)$/i;

/** True when this worker answers a request for this path (same origin, GET only; see the fetch handler). */
function claims(pathname) {
  if (pathname === ROOT + 'regional-sw.js') return false; // the worker itself (update checks, "Get the latest version")
  return PREFIXES.some((p) => pathname.startsWith(p)) || PAGES.includes(pathname) || SITE_PATHS.has(pathname) || SITE_MEDIA_PATHS.has(pathname);
}
/** How a claimed request is answered: 'page' | 'media' | 'versioned' | 'fresh'. */
function strategy(url, mode) {
  const p = url.pathname;
  if (mode === 'navigate') return 'page';
  if (p.startsWith(ROOT + 'shared/vendor/three-r160/') || p.includes('/model/') || (MEDIA_RE.test(p) && !SITE_PATHS.has(p))) return 'media';
  if (url.searchParams.has('v') && /\.(?:js|css)$/.test(p) && !SITE_PATHS.has(p)) return 'versioned';
  return 'fresh';
}
/** The cache key of a page: no query, no hash, and "…/index.html" saved as "…/". */
function pageKey(url) {
  return url.origin + url.pathname.replace(/\/index\.html$/, '/');
}

self.addEventListener('install', (e) => {
  const all = [...SHELL, ...SITE].map((u) => new Request(ROOT + u, { cache: 'reload' }));
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(all)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('regional-') && k !== VERSION && k !== MEDIA) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !claims(url.pathname)) return;
  if (req.headers.has('range')) return; // partial (video) requests: leave them to the browser
  const how = strategy(url, req.mode);
  if (how === 'page') e.respondWith(page(req, url));
  else if (how === 'media') e.respondWith(cacheFirst(req));
  else if (how === 'versioned') e.respondWith(staleWhileRevalidate(req, e));
  else e.respondWith(networkFirst(req, req.url));
});

const usable = (res) => res && res.ok && res.type === 'basic' && !res.redirected;
// A saved response that came through a redirect cannot answer a navigation: copy it into a plain one.
const plain = async (res) => (res && res.redirected ? new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers }) : res);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Network first; the saved copy when the network fails or is slower than `slow` ms and a copy exists. */
async function networkFirst(req, key, slow = 4000) {
  const cache = await caches.open(VERSION);
  const net = fetch(req).then(async (res) => {
    if (usable(res)) await cache.put(key, res.clone());
    return res;
  });
  net.catch(() => {}); // a late failure after the saved copy was served is not an error
  const saved = () => cache.match(key).then((hit) => hit || cache.match(key, { ignoreSearch: true }));
  const timeout = wait(slow).then(async () => (await saved()) || net);
  try {
    return await Promise.race([net, timeout]);
  } catch {
    const hit = await saved();
    if (hit) return hit;
    throw new Error('offline and not saved');
  }
}

async function page(req, url) {
  const key = pageKey(url);
  try {
    return await plain(await networkFirst(req, key));
  } catch {
    return new Response(OFFLINE_PAGE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function staleWhileRevalidate(req, e) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) {
    e.waitUntil(fetch(req).then((res) => (usable(res) ? cache.put(req, res) : null)).catch(() => {}));
    return hit;
  }
  // Not yet saved under this ?v=: fetch it (and keep it); with no signal, the precached copy of the same file.
  return networkFirst(req, req.url);
}

async function cacheFirst(req) {
  const cache = await caches.open(MEDIA);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (usable(res)) await cache.put(req, res.clone());
  return res;
}

const OFFLINE_PAGE = `<!doctype html><html lang="en-GB" data-theme="light"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light"><title>Offline — Regional blocks</title>
<style>body{margin:0;background:#f7f5ef;color:#272722;font:17px/1.65 system-ui,sans-serif}main{max-width:68ch;padding:48px 22px}
h1{font:400 34px/1.2 Georgia,serif;margin:0 0 14px}p{margin:0 0 14px}a{color:#633d3c;text-underline-offset:4px;display:inline-block;padding:10px 0}</style>
</head><body><main><h1>No signal</h1><p>This page has not been saved on this phone yet. Pages of the regional anaesthesia app
are saved once you have opened them with signal.</p><p><a href="${ROOT}blocks/">Open the regional blocks front door</a></p></main></body></html>`;
