// The regional anaesthesia app now lives at https://regional.anantf.com. This file stays so that phones which saved the
// old offline copy here pick up this version: it removes the old worker and its caches (only those with the prefix
// regional-) and sends the open pages to the new address. Keep this file for good.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('regional-')) await caches.delete(k);
    await self.registration.unregister();
    const open = await self.clients.matchAll({ type: 'window' });
    for (const c of open) {
      const u = new URL(c.url);
      // pages of the old app go to the same path on the new address; other pages of anantf.com stay where they are
      const own = /^\/(?:regional\.html|ra\.html|draft-ra\.html|popliteal\.html|(?:plexus|brachial-plexus|popliteal|popliteal-animation|spinal|truncal|head-neck|upper-limb|lower-limb|blocks)\/)/.test(u.pathname);
      if (own) c.navigate(`https://regional.anantf.com${u.pathname === '/regional.html' ? '/' : u.pathname}${u.search}${u.hash}`).catch(() => {});
    }
  })());
});
// no fetch handler: every request goes to the network
