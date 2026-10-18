Part of the regional engine guide; index: ../INDEX.md

## 7. Tests

Serve the repo on port 8765, then `node shared/regional/test/run-all.mjs` (all suites plus the `mo/` and `babymo/` suites).
`--gate=main` runs static, version, smoke and deep links; `--only=<ids>` and `--pages=…` narrow a run. Run it after any change
to a regional page or the engine. Details: [`shared/regional/test/README.md`](../test/README.md).

| Suite | Checks |
|---|---|
| `la.test.mjs` | dose maths in `la.js` (no browser): maxima, mg ↔ ml, lean and ideal weight, combined fraction, dose-box parsing |
| `static.mjs` | no imports through shims, old vendor path gone, every relative import exists, `noindex`, no "FRCA", no service worker except `/regional-sw.js` registered through `offline.js` (the worker is loaded in a sandbox: it must answer the regional paths and leave the others alone), no personal contacts, `?v=` once on entry points (digits only in `page.js?v=`), allow-lists valid |
| `version.test.mjs` | `regional-sw.js` file lists, `VERSION` and `MEDIA` match the files (`stamp.mjs` fixes it) |
| `data.mjs` | registry and ops links resolve, aliases unique, tiers 1–3, dose and complications never above tier 1, plexus data sound, scene `ids` exist, dose consistency between pages, ops, planners and animations, no `cite(`; every guide sound and tier 1, every block gets the core guides and its required extras, the LAST guide carries the lipid and adrenaline doses |
| `smoke.mjs` | every page in `PAGES` (27, including `blocks/settings/`, `blocks/safety/`, `blocks/indication/` and `blocks/ultrasound/`) at 390 and 1440 px: no console or page errors or failed requests, no horizontal overflow, every scan through 4 steps × each view, credit line, no service worker other than `/regional-sw.js`, lazy three.js and animation iframes, one instance per stateful module; polish targets with `--strict` |
| `deeplinks.mjs` | every `#ch-*`, `/blocks/indication/#op-<every operation>` and `#chooser`, the `/blocks/#chooser` and `/blocks/#op-…` redirects, the `/blocks/#wrong`, `#wrong-<guide>` and `#doses` redirects (target on screen, guide open), `/blocks/safety/` (`#last`, `#wrong-<guide>`, `#doses`, `#calculator`, a prefilled query), `#<block>-step-*`, `#<block>-inj-*`, `#op-*`, app state hashes, redirects, shims, `edit.html?page=` |
| `levels.mjs` | one level control per page, correct hiding per level, hints, MO always shows dose, LAST, complications, the "If it goes wrong" section (core guides, nothing above tier 1, the LAST guide steps forward) and scan, persistence never in the URL, spinal migration, relaxing |
| `appframe.mjs` | the app frame: Settings page (defaults, saving, level control, version lines), Settings reachable from every kind of app bar at 390 and 1440, bar ≤ 56 px, auto-hide off by default and working when on (scroll down / up, top, open menu, phone scan column follows), a page's own scrolling never hides it, rail at 1024 / 1180 / 1440 on the pages that have one and none at 390 or on the landings and `/blocks/`, the bar lined up with the site header, no overflow, the document scrolls, the scan teacher in the page flow, "/" and Ctrl+K, arrow keys on the step buttons, speculation rules (prefetch only), view-transition names (none with reduced motion), the Look control in Settings (Automatic by default, App look and Website look switch at once and are saved, the rail lists Look first) |
| `skin.mjs` | the two looks: every page has the one inline skin script and links `skin-app.css`, every `skin-app.css` rule is under `html[data-skin="app"]`; skin resolution (a plain visit is the website look; home screen (stubbed `display-mode: standalone`), `/blocks/?app` for that tab only, an explicit choice beating both, blocked storage); in the app look on twelve pages at 390 and 1440: no console errors, no overflow, the five topic tabs with the right one current, 12px labels, a bottom bar (52px) or 96px rail, site header, breadcrumbs and desktop rail hidden, bar ≤ 56px; the top bar on fifteen pages at 360, 390 and 1440 (Safety button with the word, danger colours, 44px, to `/blocks/safety/`; a 44px search button that opens the page's own search or `/blocks/#search`; nothing outside the window; the website look has neither, the look switches live) and the Safety button opening `/blocks/safety/` on the guides; polish in the app look on eight pages (no text under 12px, no button or block link under 44px, every link and button 4.5:1 against what is behind it); the text of `<main>` identical in both looks (scan and 3D labels that follow the width excepted); the website look unchanged (no tab bar, square controls, paper ground). `RA_SKIN=app node shared/regional/test/<suite>.mjs` runs `smoke`, `deeplinks`, `levels`, `appframe` and the others in the app look |
| `parity.mjs` | at Consultant, every line of the baseline text is still on its page, and doses are identical (guide text isn't captured; `data.mjs` covers it) |
| `offline.e2e.mjs` | its own server: `/blocks/` installs the worker and shows the version; with no signal block pages, `spinal/` and `lower-limb/` render; home and `mo/` are not answered; "Get the latest version" removes only the regional caches |

**Baseline rules.** `shared/regional/test/baseline/` is the content captured before the harmonisation.
`smoke.mjs --baseline` rewrites it: only ever **before** a change, **never to make a failing test pass**. Reviewed
differences go in `parity-allow.json` / `data-allow.json`, each with a reason, in the PR that needs them, and never to
let a clinical change through.

---
