// Retired. The MO guide moved from anantf.com/mo/ to anantf.com/mo/guide/ (15 Oct 2026) and anantf.com/mo/ is now a landing page.
// Phones that installed the guide at the old address still run the old worker; this replacement is how they leave it:
// it clears only the old mo- caches, removes itself and reloads open pages. Saved progress (localStorage) is untouched, and
// the guide installs its own worker under /mo/guide/. Keep this file while old installs may still exist; do not stamp it.
const VERSION = 'mo-retired';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('mo-')) await caches.delete(k);
    await self.registration.unregister();
    const open = await self.clients.matchAll({ type: 'window' });
    for (const c of open) c.navigate(c.url).catch(() => {});
  })());
});
