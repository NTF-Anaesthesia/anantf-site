// Which folder of this repo each public address serves. Pure functions, no Cloudflare APIs, so worker/test/routes.test.mjs
// can check them in Node. worker/sites.js is the Worker that uses them.
//
// Only mo.anantf.com goes through the Worker (MO.md). anantf.com itself stays on GitHub Pages and ignores all of this.
// A host in SITES is served only from its own folder plus the shared files below, so it can never reach another app's
// files. Any other host (the PR previews on workers.dev) serves the files as they are.

// host -> { root: 'mo/' }: the folder served at the address's root (the folder's own name works too: /mo/ is the same page)
export const SITES = {
  'mo.anantf.com': { root: 'mo/' },
};

// The folders and files every site host serves as they are: the shared app kit (styles), the fonts and the logo mark.
// The guide links them as ../../assets/app/app.css, which resolves to /assets/app/app.css on both anantf.com/mo/guide/
// and mo.anantf.com/guide/.
export const SHARED = ['/assets/', '/fonts/', '/ana-ntf-monogram.svg'];

// On any host not in SITES, /_sites/<host>/<path> serves <path> as that host would, so the mapping can be tried on a
// PR preview before the real address exists: <preview>/_sites/mo.anantf.com/
const TRY = '/_sites/';

// -> { file } (a path inside the repo, or a folder ending in "/"), { redirect } (a public path to send the browser to),
//    { notFound: true }
export function resolve(host, pathname) {
  const out = route(host, pathname);
  // an encoded slash, dot or backslash, or a leftover ".." could point the asset lookup out of the folder: refuse
  return out.file != null && /%2e|%2f|%5c|\\|(^|\/)\.\.?(\/|$)/i.test(out.file) ? { notFound: true } : out;
}

function route(host, pathname) {
  host = String(host || '').toLowerCase().replace(/:\d+$/, '');
  let site = SITES[host], p = pathname;
  if (!site && p.startsWith(TRY)) {
    const rest = p.slice(TRY.length), slash = rest.indexOf('/');
    const h = (slash < 0 ? rest : rest.slice(0, slash)).toLowerCase();
    if (SITES[h]) {
      if (slash < 0) return { redirect: `${TRY}${h}/` };
      const base = `${TRY}${h}`;
      const out = route(h, rest.slice(slash));
      return out.redirect ? { redirect: base + out.redirect } : out;
    }
  }
  if (!site) return { file: p.replace(/^\//, '') };   // every other host: the files as they are
  for (const s of SHARED) {
    if (s.endsWith('/')) {
      if (p === s.slice(0, -1)) return { redirect: s };
      if (p.startsWith(s)) return { file: p.slice(1) };
    } else if (p === s) return { file: p.slice(1) };
  }
  const own = '/' + site.root;
  if (p === own.slice(0, -1)) return { redirect: own };
  if (p.startsWith(own)) return { file: site.root + p.slice(own.length) };
  return { file: site.root + p.replace(/^\//, '') };
}

// Where a site host sends an address its own folder doesn't have: the same path on anantf.com (the guide links to the
// regional pages, the Baby MO test and the airway page that way).
export const APEX = 'https://anantf.com';
export const isSite = host => !!SITES[String(host || '').toLowerCase().replace(/:\d+$/, '')];
