// Retired. This app moved to mo.anantf.com (23 Oct 2026). Phones that installed it here still run the old worker; this
// replacement is how they leave it: it clears only the old mo- caches, removes itself and reloads open pages
// (the page then forwards to the new address). Saved progress (localStorage) is untouched. Keep this file while old
// installs may still exist; do not stamp it.
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
