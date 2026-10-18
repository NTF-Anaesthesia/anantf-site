# Regional anaesthesia app: QA suites

Tests for the regional pages (truncal, head-neck, lower-limb, upper-limb, brachial-plexus, plexus, spinal, blocks/,
blocks/calculator/ and regional.html), the dose maths and the offline worker `/regional-sw.js`. They run in a real browser against a local copy of the site. Nothing here is published as a
page; `harness.html` is a blank page the suites use to load the app's modules.

## Running them

```sh
cd <repo> && python3 -m http.server 8765        # in one terminal (or in the background)
node shared/regional/test/run-all.mjs                   # every suite + the mo/ and babymo/ suites, one summary
node shared/regional/test/run-all.mjs --gate=main       # after each merge to main: static + version + smoke + deeplinks
node shared/regional/test/<suite>.mjs --pages=truncal/back/,spinal/   # one suite, some pages
```

Needs the global Playwright with Chromium. For the accessibility check in `smoke.mjs`, set
`AXE=/path/to/axe-core/axe.min.js` (or install `axe-core` globally); without it that check is skipped and says so.

| Suite | What it checks (plan §11) | Typical time |
|---|---|---|
| `la.test.mjs` | No browser. The dose maths in `shared/regional/js/la.js`: maxima (mg/kg and the mg ceiling), mg ↔ ml, BMI, lean and ideal body weight, the weight used, combined fraction of the maximum, and parsing a block's dose box into the calculator link | 1 s |
| `static.mjs` | No imports through the old-path shims, no old vendor path, every relative import exists, noindex on every page, no "FRCA", no service worker except `/regional-sw.js` (registered only through `shared/regional/js/offline.js`; the worker is loaded in a sandbox and must answer the regional paths and leave home, `mo/`, `qbank/`, `babymo/`, `exams/` and the rest alone), no personal e-mails or phone numbers, `?v=` on entry points (never doubled), allow-lists valid | 1 s |
| `data.mjs` | `registry.js` entries resolve; ops block keys and links resolve; tiers are 1–3; **dose and complications never above tier 1 in data**; plexus target/covers disjoint, roots within levels; scene `ids` exist; **dose consistency** (ml × % = mg; glance = dose box; ops, thigh planner and animation index doses appear on the block's page); no `cite(`; **"If it goes wrong" guides**: every guide sound (all steps reachable, targets exist, no loops, an end), every guide and step tier 1, every registry and engine block gets the core guides, the required extras reach their blocks, the LAST guide has the lipid doses and the 1 microgram/kg adrenaline dose; the upper-limb ops file and its arm zones | 10 s |
| `smoke.mjs` | Every page in `PAGES` in `lib.mjs` (25, including the upper-limb pages, `blocks/calculator/` and `blocks/settings/`) × 390/1440: console and page errors, responses ≥ 400, failed requests, horizontal overflow (chapter menu open, every chapter), every scan through 4 steps × each view, credit line, no "FRCA", no service worker other than `/regional-sw.js`, no three.js before "Open here", no animation iframe before "Watch", plexus canvas count after fast tab switching, one module instance per stateful engine file; polish targets (text < 12 px, tap targets < 44 px, one sticky bar ≤ 56 px, scan on screen after Next, axe serious/critical, < 2.5 s to interactive) reported, and failed with `--strict` | 3–4 min |
| `deeplinks.mjs` | Fresh loads of every `#ch-*`, `#<block>-step-*`, `#<block>-inj-*` and `#op-*`: the right chapter shows and the target is on screen, clear of the bar; every same-site `#` link on every regional page resolves; brachial and plexus state hashes; the spinal anchors mo/ uses; the `ra.html` / `draft-ra.html` / `popliteal.html` redirects; every shim re-exports its target; `edit.html?page=` for each page | 3 min |
| `levels.mjs` | One MO · Res · Con control (44 px) per page; each level hides exactly the tiers above it; hidden-count hints are right and "Show all" is temporary; **at MO every block shows its dose box, LAST line, complications, scan and "If it goes wrong" section** (with the core guides and nothing above tier 1; its LAST guide opens and moves forward a step); level kept across reloads and apps and never in the URL; spinal's old keys migrate; deep links and search results relax without saving; spinal "Pearls only" only at Consultant | 2 min |
| `version.test.mjs` | The offline worker `regional-sw.js` is stamped: its SHELL / SITE / SITE_MEDIA lists, VERSION and MEDIA match the files (`node shared/regional/tools/stamp.mjs` fixes it) | 1 s |
| `offline.e2e.mjs` | Starts its own server: `/blocks/` installs the worker and shows "App version …"; a block page; the homepage and `/mo/` are not answered by it and `mo/` keeps its own worker; with no signal `/blocks/`, block pages (opened or only precached), `spinal/` and `lower-limb/` render after a reload, and the homepage is not served; "Get the latest version" changes nothing with no signal, and with signal removes only the regional caches (level and other apps kept) | 30 s |
| `appframe.mjs` | The app frame (`shared/regional/js/appnav.js`): `/blocks/settings/` (noindex, credit, level control, "Hide the bar while scrolling down" off and "Press / to search" on by default, both saved, app version lines); Settings reachable from the app bar of every kind of regional page at 390 and 1440 px and the bar ≤ 56 px; auto-hide off by default (the bar never moves) and, when on, away on a scroll down, back on a scroll up and at the top, kept while a menu is open, the phone scan column following it; a scroll the page makes itself never hides it; the desktop rail at 1024 / 1180 / 1440 on the block pages, `spinal/`, the calculator and Settings (current item marked, follows chapter changes) and none at 390 or on the landings and `/blocks/`; the app bar lined up with the site header; no horizontal overflow and the document scrolls; the scan teacher in the page flow; "/" and Ctrl+K open search (not "/" in a box or when turned off); arrow keys on the step buttons; speculation rules (prefetch only, never the animation player); view-transition names, none with reduced motion | 1 min |
| `skin.mjs` | The two looks (website and app; `shared/regional/js/skin.js`, `css/skin-app.css`): every page carries the same inline skin script and links the skin sheet, every rule of the sheet is under `html[data-skin="app"]`; skin resolution (plain visit = website look; home screen (matchMedia stubbed) = app look; `/blocks/?app` for that tab only; an explicit "web" or "app" beats both; blocked storage); in the app look on nine pages × 390/1440: no console errors or overflow, five tabs with one current, a 52px bottom bar or 96px rail, site header, breadcrumbs and desktop rail hidden, bar ≤ 56px, ground colour; Search and Guides tabs; polish in the app look on eight pages × 390/1440 (no text under 12px, no button or block link under 44px, every link and button 4.5:1 against what is behind it); the text of `<main>` identical in both looks (width-dependent scan and 3D labels excepted); the website look has no tab bar and square controls | 3 min |
| `parity.mjs` | At Consultant, every text line of the WP0 baseline is still on its page and the dose / volume / concentration strings are identical. Text is read before any guide is opened, so guide text is checked by `data.mjs` instead; pages added since (upper limb, calculator) have no baseline | 2 min |

`run-all.mjs --out=<dir>` keeps each suite's full log and a JSON result.

## Baseline and allow-lists

- `baseline/` holds the WP0 capture (text per chapter, scan step text, dose strings, smoke results) taken before any
  harmonisation. `node shared/regional/test/smoke.mjs --baseline` rewrites it: only ever before a change, never to make a test
  pass.
- `parity-allow.json` lists the reviewed differences from the baseline (renamed titles, removed dock text, citation lists
  the owner asked to hide). Each entry says why. `renames` allow a line to go only when its renamed version is on the
  page. Add entries in the PR that needs them, and never to let a clinical change through.
- `data-allow.json` lists reviewed dose differences between a block page and the ops / planner / animation data
  (`{"doses": [{"key": "<allow key printed by data.mjs>", "why": "…"}]}`).
- Every suite runs in the website look, as a visitor gets it. `RA_SKIN=app node shared/regional/test/<suite>.mjs` runs it in the app look
  (smoke, deeplinks and levels pass in both; parity differs only in letter case, because the website look sets some headings in capitals).
