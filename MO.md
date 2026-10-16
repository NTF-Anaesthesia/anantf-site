# mo.anantf.com

The MO address. A small Cloudflare Worker serves the `mo/` folder at the root of `mo.anantf.com`; `anantf.com` itself
stays on GitHub Pages, untouched. Nothing here changes how the rest of the site is hosted, so Dr Chew Shi Hao's pages
(exams, regional, popliteal) are not affected.

| Address | Served from |
|---|---|
| `mo.anantf.com/` | `mo/index.html`, the landing page for new MOs |
| `mo.anantf.com/guide/` | `mo/guide/`, the MO guide (installs as its own app on this address) |
| `mo.anantf.com/test/` | `babymo/`, the Baby MO test (installs as its own app on this address). `/babymo/` forwards here |
| `mo.anantf.com/assets/`, `/fonts/`, `/ana-ntf-monogram.svg` | the shared app kit, fonts and logo mark, as in the repo |
| `mo.anantf.com/qbank/js/bank.js`, `/qbank/bank/`, `/qbank/papers/`, `/qbank/img/` | the question bank's data and code the Baby MO test reads (the qbank app itself stays on anantf.com) |
| any other path (`/babymo/`, `/spinal/`, `/airway.html` …) | redirects (302) to the same path on `anantf.com` |

`anantf.com/mo/`, `anantf.com/mo/guide/` and `anantf.com/babymo/` keep working on GitHub Pages (the same files), so old links and
phones that installed either app there are fine. The guide links its own kit and fonts as `../../assets/…`, which resolves correctly on both
addresses.

## How it works

- `worker/routes.js` maps an address to a folder (pure functions, tested by `node worker/test/routes.test.mjs`);
  `worker/sites.js` is the Worker; `wrangler.jsonc` is its config (Worker name `anantf-mo`); `.assetsignore` limits what
  Cloudflare uploads to `mo/`, `babymo/`, `qbank/`, `assets/`, `fonts/` and the logo mark (routes.js decides what is served).
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
3. **For the Baby MO test only:** in the Firebase console, project `ntf-mo-portal` → **Authentication → Settings →
   Authorized domains → Add domain** → `mo.anantf.com`. Until then faculty Google sign-in fails on `mo.anantf.com/test/` (MOs
   signing in with the passphrase use anonymous sign-in and don't need it). If the project's API key is restricted by website in
   Google Cloud (Credentials), add `mo.anantf.com/*` there too. The guide has no sign-in and needs nothing.

Check: `mo.anantf.com/` shows the landing page, `/guide/` the guide, `/test/` the Baby MO test (`?demo` works without Firebase;
sign in as faculty once the domain is added), `/babymo/` forwards to `/test/`, and `anantf.com/` still answers from GitHub Pages
as before.

## Moving the Baby MO test here (16 Oct 2026)

- Nothing in `babymo/` changed: it links its files relatively, so it works at `anantf.com/babymo/` and `mo.anantf.com/test/` alike
  and needs no re-stamp. `worker/test/routes.test.mjs` checks that every file its service worker installs is served here.
- It is a different address, so a phone has its own copy and storage: MOs sign in again with the passphrase there (results are
  in Firestore either way); an installed copy at the old address keeps working. Tell new intakes to use `mo.anantf.com/test/`.
- Faculty "Suggest a change" links go to the qbank app (`../qbank/#/q/<id>?suggest`), which stays on `anantf.com`: from
  `mo.anantf.com/test/` they forward there.

## Not done

- The question bank app stays on `anantf.com/qbank/` (department-wide).
- `anantf.com/mo/` and `anantf.com/babymo/` are not redirected to `mo.anantf.com`: installed apps live at the old addresses.
