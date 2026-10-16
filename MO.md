# mo.anantf.com

The MO address. A small Cloudflare Worker serves the `mo/` folder at the root of `mo.anantf.com`; `anantf.com` itself
stays on GitHub Pages, untouched. Nothing here changes how the rest of the site is hosted, so Dr Chew Shi Hao's pages
(exams, regional, popliteal) are not affected.

| Address | Served from |
|---|---|
| `mo.anantf.com/` | `mo/index.html`, the landing page for new MOs |
| `mo.anantf.com/guide/` | `mo/guide/`, the MO guide (installs as its own app on this address) |
| `mo.anantf.com/assets/`, `/fonts/`, `/ana-ntf-monogram.svg` | the shared app kit, fonts and logo mark, as in the repo |
| any other path (`/babymo/`, `/spinal/`, `/airway.html` …) | redirects (302) to the same path on `anantf.com` |

`anantf.com/mo/` and `anantf.com/mo/guide/` keep working on GitHub Pages (the same files), so old links and phones that
installed the guide there are fine. The guide links its own kit and fonts as `../../assets/…`, which resolves correctly on both
addresses.

## How it works

- `worker/routes.js` maps an address to a folder (pure functions, tested by `node worker/test/routes.test.mjs`);
  `worker/sites.js` is the Worker; `wrangler.jsonc` is its config (Worker name `anantf-mo`); `.assetsignore` limits what
  Cloudflare uploads to `mo/`, `assets/`, `fonts/` and the logo mark.
- The Worker adds `X-Robots-Tag: noindex, nofollow`. No data, no storage, no secrets.
- PR previews: once Workers Builds is connected, each PR gets a preview link; try the mapping at
  `<preview>/_sites/mo.anantf.com/` (and `/guide/`).
- Service workers: the guide's worker is scoped to `/guide/` on each address, and its cache is per address. A change to
  `assets/app/` still means `node mo/guide/tools/stamp.mjs` (and the other apps' stamps), exactly as before.
- Cost: Cloudflare's free plan (100,000 Worker requests a day); only this one address uses it.

## The owner's Cloudflare clicks (once, after this is merged)

`anantf.com`'s DNS is already on Cloudflare (nameservers `*.ns.cloudflare.com`), so this needs no DNS move.

1. <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Import a repository** (Workers Builds) → choose
   `NTF-Anaesthesia/anantf-site` (install the Cloudflare GitHub app on that repo if asked). Worker name **`anantf-mo`**
   (it must match `wrangler.jsonc`), production branch `main`, leave the build command empty and the deploy command
   `npx wrangler deploy`.
2. When the first build has finished: **Workers & Pages** → `anantf-mo` → **Settings** → **Domains & Routes** → **Add** →
   **Custom domain** → `mo.anantf.com` → **Add domain**. Cloudflare creates the DNS record and certificate itself (a few
   minutes).
3. Nothing in Firebase: the guide has no sign-in. (Moving the Baby MO test here would need `mo.anantf.com` added to the
   `ntf-mo-portal` authorised domains; not done.)

Check: `mo.anantf.com/` shows the landing page, `/guide/` the guide, `/babymo/` forwards to `anantf.com/babymo/`, and
`anantf.com/` still answers from GitHub Pages as before.

## Not done

- Baby MO and the question bank stay on `anantf.com` (the landing page links to Baby MO there). Moving Baby MO would be
  `'/test/': 'babymo/'` in `worker/routes.js` plus the Firebase authorised domain and its own service worker move.
- `anantf.com/mo/` is not redirected to `mo.anantf.com`: installed apps live at the old address.
