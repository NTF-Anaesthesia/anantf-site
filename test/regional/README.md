# Regional anaesthesia app: QA suites

Tests for the regional pages (truncal, head-neck, lower-limb, brachial-plexus, plexus, spinal, regional.html and,
once it exists, blocks/). They run in a real browser against a local copy of the site. Nothing here is published as a
page; `harness.html` is a blank page the suites use to load the app's modules.

## Running them

```sh
cd <repo> && python3 -m http.server 8765        # in one terminal (or in the background)
node test/regional/run-all.mjs                   # every suite + the mo/ and babymo/ suites, one summary
node test/regional/run-all.mjs --gate=main       # after each merge to main: static + smoke + deeplinks
node test/regional/<suite>.mjs --pages=truncal/back/,spinal/   # one suite, some pages
```

Needs the global Playwright with Chromium. For the accessibility check in `smoke.mjs`, set
`AXE=/path/to/axe-core/axe.min.js` (or install `axe-core` globally); without it that check is skipped and says so.

| Suite | What it checks (plan §11) | Typical time |
|---|---|---|
| `static.mjs` | No imports through the old-path shims, no old vendor path, every relative import exists, noindex on every page, no "FRCA", no service worker except `/regional-sw.js` (registered only through `shared/regional/js/offline.js`; the worker is loaded in a sandbox and must answer the regional paths and leave home, `mo/`, `qbank/`, `babymo/`, `exams/` and the rest alone), no personal e-mails or phone numbers, `?v=` on entry points (never doubled), allow-lists valid | 1 s |
| `data.mjs` | `registry.js` entries resolve; ops block keys and links resolve; tiers are 1–3; **dose and complications never above tier 1 in data**; plexus target/covers disjoint, roots within levels; scene `ids` exist; **dose consistency** (ml × % = mg; glance = dose box; ops, thigh planner and animation index doses appear on the block's page); no `cite(` | 10 s |
| `smoke.mjs` | 19 pages × 390/1440: console and page errors, responses ≥ 400, failed requests, horizontal overflow (chapter menu open, every chapter), every scan through 4 steps × each view, credit line, no "FRCA", no service worker other than `/regional-sw.js`, no three.js before "Open here", no animation iframe before "Watch", plexus canvas count after fast tab switching, one module instance per stateful engine file; polish targets (text < 12 px, tap targets < 44 px, one sticky bar ≤ 56 px, scan on screen after Next, axe serious/critical, < 2.5 s to interactive) reported, and failed with `--strict` | 3–4 min |
| `deeplinks.mjs` | Fresh loads of every `#ch-*`, `#<block>-step-*`, `#<block>-inj-*` and `#op-*`: the right chapter shows and the target is on screen, clear of the bar; every same-site `#` link on every regional page resolves; brachial and plexus state hashes; the spinal anchors mo/ uses; the `ra.html` / `draft-ra.html` / `popliteal.html` redirects; every shim re-exports its target; `edit.html?page=` for each page | 3 min |
| `levels.mjs` | One MO · Res · Con control (44 px) per page; each level hides exactly the tiers above it; hidden-count hints are right and "Show all" is temporary; **at MO every block shows its dose box, LAST line, complications and scan**; level kept across reloads and apps and never in the URL; spinal's old keys migrate; deep links and search results relax without saving; spinal "Pearls only" only at Consultant | 2 min |
| `version.test.mjs` | The offline worker `regional-sw.js` is stamped: its SHELL / SITE / SITE_MEDIA lists, VERSION and MEDIA match the files (`node shared/regional/tools/stamp.mjs` fixes it) | 1 s |
| `offline.e2e.mjs` | Starts its own server: `/blocks/` installs the worker and shows "App version …"; a block page; the homepage and `/mo/` are not answered by it and `mo/` keeps its own worker; with no signal `/blocks/`, block pages (opened or only precached), `spinal/` and `lower-limb/` render after a reload, and the homepage is not served; "Get the latest version" changes nothing with no signal, and with signal removes only the regional caches (level and other apps kept) | 30 s |
| `parity.mjs` | At Consultant, every text line of the WP0 baseline is still on its page and the dose / volume / concentration strings are identical | 2 min |

`run-all.mjs --out=<dir>` keeps each suite's full log and a JSON result.

## Baseline and allow-lists

- `baseline/` holds the WP0 capture (text per chapter, scan step text, dose strings, smoke results) taken before any
  harmonisation. `node test/regional/smoke.mjs --baseline` rewrites it: only ever before a change, never to make a test
  pass.
- `parity-allow.json` lists the reviewed differences from the baseline (renamed titles, removed dock text, citation lists
  the owner asked to hide). Each entry says why. `renames` allow a line to go only when its renamed version is on the
  page. Add entries in the PR that needs them, and never to let a clinical change through.
- `data-allow.json` lists reviewed dose differences between a block page and the ops / planner / animation data
  (`{"doses": [{"key": "<allow key printed by data.mjs>", "why": "…"}]}`).
