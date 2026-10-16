// The Cloudflare Worker behind mo.anantf.com (MO.md) and the PR previews. It serves the repo's files (the static assets,
// bound as ASSETS; .assetsignore keeps the upload to the MO folder, the app kit and the fonts) and decides which folder an
// address may see (routes.js). No data, no storage, no secrets: just files.
// wrangler.jsonc: "run_worker_first" sends every request here.
import { resolve, isSite, APEX } from './routes.js';

const NOINDEX = 'noindex, nofollow';

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    const url = new URL(request.url);
    const r = resolve(url.hostname, url.pathname);
    if (r.redirect) return redirect(url, r.redirect);
    if (r.notFound) return notFound();

    // a folder (address ending in "/") serves its index.html
    let file = r.file;
    if (file === '' || file.endsWith('/')) file += 'index.html';
    let res = await asset(env, url, file);
    if (res.status === 404 && !/\.[^/]+$/.test(file)) {
      // no such file, but a folder of that name: send the browser to the address with a "/" (as GitHub Pages does)
      const dir = await asset(env, url, file + '/index.html');
      if (dir.status === 200) return redirect(url, url.pathname + '/');
    }
    if (res.status === 404) {
      // not in this site's folder: on the real address it is a page of anantf.com (spinal/, babymo/, airway.html ...)
      if (isSite(url.hostname)) return Response.redirect(APEX + url.pathname + url.search, 302);
      return notFound();
    }
    res = new Response(res.body, res);
    res.headers.set('X-Robots-Tag', NOINDEX);
    return res;
  },
};

const asset = (env, url, file) => env.ASSETS.fetch(new Request(new URL('/' + file, url), { method: 'GET' }));
const redirect = (url, path) => Response.redirect(new URL(path + url.search, url).toString(), 301);
const notFound = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': NOINDEX } });
