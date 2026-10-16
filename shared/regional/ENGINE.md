# Regional anaesthesia app: engine guide

How the regional anaesthesia app is built, so you can maintain and extend it without reading all the code first.
The full data schema (every block, scene and coverage field, page template, levels detail) is in
[`DATA.md`](DATA.md); this guide links to it rather than repeating it. Test details are in
[`test/regional/README.md`](../../test/regional/README.md).

Static ES modules, no build step, no CDN. Everything is plain files served by GitHub Pages, with one root service worker,
`/regional-sw.js`, for offline use (regional paths only; §6 "Stamp the offline worker").

---

## 1. What the app is

A teaching app for ultrasound-guided regional anaesthesia at NTF Anaesthesia, for MOs, residents and consultants.
Every page is unlisted and `noindex`; the owner shares the links personally (don't link them from the homepage).

| Page | URL | Built with |
|---|---|---|
| Front door | `/blocks/` | its own script, reading `registry.js`, `ops/` and `data/decisions.js` (no clinical text of its own); app version lines at the foot |
| Dose calculator | `/blocks/calculator/` | its own `calculator.js`, mounting `lacalc.js` |
| Settings | `/blocks/settings/` | its own `settings.js`: level, "Hide the bar while scrolling down", "Press / to search", app version lines (§2 "App frame") |
| Truncal landing + 3 pages | `/truncal/`, `back/`, `chest-wall/`, `abdominal-wall/` | landing chooser + engine (`bootPage`) |
| Head and neck landing + 5 pages | `/head-neck/`, `cervical/`, `scalp/`, `face/`, `airway/`, `eye/` | landing chooser + engine |
| Lower-limb landing + 4 pages | `/lower-limb/`, `hip/`, `knee/`, `foot-ankle/`, `thigh/` | landing chooser + engine; Dr Chew Shi Hao's animations from `lower-limb/anim/` |
| Upper-limb landing + 3 pages | `/upper-limb/`, `shoulder/`, `arm/`, `forearm-hand/` | landing chooser + engine |
| Brachial plexus app | `/brachial-plexus/` | its own app (own scan teacher, 3D, diagram); uses the engine's levels and status colours |
| Neuraxial | `/spinal/` | its own app; uses the engine's levels |
| Anatomy in 3D | `/plexus/` | plexus explorer (cervical, brachial, lumbar, sacral); uses levels and status colours |
| Hub card | `/regional.html` | static page; the only public way in |

All of them share one app bar (with a Settings item), one credit line in the page footer ("Created by Dr Koh Wenjun and Dr Chew Shi Hao, NTF Anaesthesia", Dr Chew
Shi Hao linked to https://chewshihao.com/) and one **MO · Res · Con** level control (§4).

---

## 2. Architecture

### Modules in `shared/regional/js/`

| Module | Owns |
|---|---|
| `shell.js` | `bootPage(config)`: the sticky app bar, hub ("I need to…" tiles and chapter list), one chapter at a time, hash routing and deep links, search box, level hints, pager, heading tidy-up, credit (`DEFAULT_CREDIT`). Sets `body[data-tb-ready="true"]` and fires `tb-ready` / `tb-chapter` |
| `block.js` | `renderBlock(block, host)`: one block chapter from data, section order, default tiers (`DEFAULT_TIERS`, `SAFETY_KEYS`, `MO_PEARLS`), dose box + `LAST_LINE`, "Anatomy in 3D" card (lazy `mountExplorer`), "Watch the animation" disclosure |
| `scan.js` | `mountScan(host, scene, {blockId, coverage})`: the scan teacher. Four steps (Scan, Identify, Needle, Inject), views Ultrasound / Diagram / Real, needle and LA animation, tappable structures and chip legend, "See in 3D", "Test me", coverage chips, sticky stage and swipe on phones |
| `scene.js` | scene geometry: shape constructors `E P PS L`, `prepare`, spline and plane helpers, LA spread / tent profiles, `warpY` |
| `bmode.js` | the simulated B-mode image for a scene (`LOOK` defaults, §5). Built once per `scene.id`, in phases off idle time (`buildBModeAsync`), deterministic (random seed from the scene id) |
| `diagram.js` | the idealised labelled diagram of the same scene (`COL` colours) |
| `realscan.js` | the "Real" view: open-licence images from `shared/us/`, label pills, colour-key fills, needle / LA overlay, "Your scan" (a local image, never uploaded) |
| `dermatomes.js` | torso coverage map `coverageMap`, torso probe inset `probeInset`, `OUTLINE` |
| `figures/head.js`, `figures/leg.js`, `figures/arm.js` | head, leg and arm figure providers: coverage maps, probe insets, view figures (§3.3) |
| `levels.js` | the level system (§4) |
| `status.js` | status colours and line styles (target, covers, variable, spares), `INJECTION`, `LA`; twin of `css/status.css` |
| `registry.js` | one entry per block across every region (§3.5) |
| `ops/ops-*.js` | the operations behind each "which block for which operation" chooser (§3.6) |
| `la.js` | local anaesthetic dose data and pure maths, no DOM (node imports it): `AGENTS` (mg/kg plain and with adrenaline, and an absolute mg ceiling), `NOTES`, `FORMULAS`, `maxMg`, `mgFromMl`, `mlForMg`, `bmi`, `leanBodyWeight` (Janmahasatian), `idealBodyWeight` (Devine), `doseWeight` (lean weight when BMI ≥ 30), `combinedFraction`, `fractionStatus`, `parseDose`, `doseQuery`, `parseQuery` |
| `lacalc.js` | `mountLaCalc(host, prefill)`: the dose calculator form; styles in `css/lacalc.css` (prefix `lc-`) |
| `decide.js` | the "If it goes wrong" guides: `mountGuide(host, guide, {idPrefix, headingLevel})`, `guideList(ids, {idPrefix, headingLevel, lazy})`, `openGuideFromHash()`, `ensureDecideCss()` (links `css/decide.css`, prefix `ra-dg-`). No imports |
| `data/decisions.js` | the guide data (§3.8): `GUIDES`, `GUIDE_ORDER`, `CORE_GUIDES`, `EXTRA_GUIDES`, `guidesFor(id, region, extra)`, `validateGuide` |
| `appnav.js` | the app frame (§2 "App frame"): `initAppFeel({bar, search})` (bar auto-hide, "/" and Ctrl+K, speculation rules), `mountRail({main, label, items, spy})` (desktop rail), `headingItems()`, `settingsItem(cls)` / `settingsButton(cls)`, `REGION_NAV` / `TOOL_NAV` (the rail's site map), `getAutoHide` / `setAutoHide`, `getSlash` / `setSlash`, `SETTINGS_URL`. No imports. Always imported as `appnav.js?v=20261017` |
| `offline.js` | `registerOffline()` registers `/regional-sw.js` once the page has loaded and gone quiet; `mountAppVersion(host)` draws the version lines at the foot of `/blocks/`. Always imported as `offline.js?v=20261016` |
| `search.js` | page search index and synonyms |
| `ui.js` | DOM helpers (`el`, `sv`, `fill`, `callout`, `table`, `details`, `stepper`, …) |
| `refs.js` | kept for old data; renders nothing (the pages carry no citations) |

CSS in `shared/regional/css/`: `regional.css` (all shared `tb-` styles; imports `levels.css` and `appnav.css`),
`appnav.css` (desktop frame and rail, bar auto-hide, the plain bar `.ra-sbar` of the region landings, cross-document view
transitions; also imported by `truncal/landing.css` and linked by `spinal/` and `brachial-plexus/`), `scan.css` and
`realscan.css` (linked by the scan modules themselves), `status.css`, `levels.css`, `lacalc.css`, `decide.css` (linked by
`decide.js`).

`shared/regional/tools/stamp.mjs` stamps the offline worker `/regional-sw.js` (§6).

### Data flow on a block page

```
<page>/index.html ── js/page.js?v=… ── bootPage(config)                     shell.js
                                         ├─ chapter.render(sec)             page's own content (anatomy, planners)
                                         └─ chapter.block ─ renderBlock()   block.js
                                              ├─ dose box, coverage map (coverage.map or dermatomes.coverageMap)
                                              ├─ Anatomy in 3D card ─(tap)─ plexus/js/explorer.js mountExplorer()
                                              ├─ Watch ─(open)─ iframe lower-limb/anim/?embed=1#<anim>/<variant>
                                              └─ scene ─ mountScan()        scan.js
                                                   ├─ Ultrasound: bmode.buildBModeAsync(scene)  (cached per scene.id)
                                                   ├─ Diagram:    diagram.buildDiagram(scene)
                                                   └─ Real:       realscan.loadRealScans(blockId, scene)
                                                                  → scene.realScans | REAL_SCANS | shared/us/<region>/sources.json
```

A page folder holds `index.html`, `page.css` (optional, page prefix such as `aw-`), and `js/page.js`, `js/blocks.js`
(block data), `js/scenes.js` (scene data) and any page-only chapters (`anatomy.js`, planners). Region landings
(`truncal/landing.js`, `head-neck/landing.js`, `lower-limb/landing.js`, `upper-limb/landing.js`) render the chooser
from `ops/`. For an extra scan viewer inside a section, `lower-limb/knee`, `head-neck/scalp` and `head-neck/airway` have
a local `extraScan(scene, blockId)` helper in their `js/blocks.js`.

### Outside the engine

- **brachial-plexus/** keeps its own scan teacher (`js/ultrasound.js`, `SCENES_MM`), 3D viewer and real scans
  (`brachial-plexus/us/`, `js/real-scans.js`); the upper-limb engine pages carry the same blocks. It imports
  `levels.js` and `status.js` from the engine and links `css/status.css` and `css/levels.css`.
- **spinal/** imports `levels.js` (its old tiers map to MO / Resident / Consultant; "Pearls only" is Consultant only)
  and links `css/levels.css`. It also imports `realscan.js` (which loads `scan.css` and `realscan.css` itself) for the
  neuraxial real scans at `#us-real`; `spinal/css/ultrasound.css` styles `.ra-rs .tb-btn` because spinal doesn't load
  `regional.css`. Its in-chapter topic navigation is `spinal/js/topics.js`.
- **plexus/** uses `levels.js`, `status.js` and `regional.css`. `plexus/js/explorer.js` is also loaded on demand by
  block pages. Pages without a `three` import map get the explorer in an iframe of `plexus/index.html?embed=1`.
- **three.js** r160 and its Draco decoder live in `shared/vendor/three-r160/`, reached only through the import maps
  in `brachial-plexus/index.html` and `plexus/index.html`. No other page loads three.js until "Open here" is tapped.
- **Animations**: `lower-limb/anim/` is Dr Chew Shi Hao's frozen engine. Don't edit it. Block data reaches it through
  `watch`; `lower-limb/shared/js/anim.js` (`animFigure`) is for sections outside block data. See
  [`lower-limb/shared/LEG.md`](../../lower-limb/shared/LEG.md).

### App frame (desktop layout, page changes, Settings)

Every regional page calls `initAppFeel({bar, search})` once; the engine block pages, `spinal/`, the calculator and
Settings also call `mountRail()` (`js/appnav.js`, styles `css/appnav.css`). Phones and tablets (below 1024 px) look as
before, apart from the Settings entry and the plain app bar on the region landings.

- **Frame (≥ 1024 px).** DESIGN.md's column: the app bar, breadcrumbs, `<main>` and the foot keep the site's width
  (`--site-width` 1240 px, `--site-gutter` 56 px; `--ra-frame-w` / `--ra-frame-g` point at them), so they line up with
  the site header (`.ntf-header`), which is not changed: it scrolls away and only the app bar sticks (≤ 56 px). The
  header has `position: relative; z-index: 60` (regional.css, landing.css, spinal, brachial-plexus, plexus) so its
  phone menu opens above the sticky bar and the page. `brachial-plexus/` and `plexus/` keep their own layouts, without
  a rail (they need the room for the 3D model and diagram); the region landings and `/blocks/` have no rail either
  (their operation chooser needs the full column).
- **Rail (≥ 1024 px).** `mountRail` wraps `<main>` in `.ra-frame` (a two-column grid inside the 1240 px column) with
  `nav.ra-rail` on the left: this page's chapters or sections ("On this page"), then this region's landing and pages,
  the other regions, and the tools (all blocks, dose calculator, Anatomy in 3D, Settings), from `REGION_NAV` /
  `TOOL_NAV`. The current page is `aria-current="page"`, the current chapter or section `aria-current="location"`
  (blush with a wine edge, as in the chapter menu). Engine pages and `spinal/` follow `body[data-chapter]`; Settings
  follows the section in view (`spy: true`). The rail is sticky under the bar, scrolls itself when taller than the
  window (never the page), and carries the chapters' `data-tier`, so the level hides the same entries as the chapter
  menu. Its column is reserved in CSS before the script runs (not on `/blocks/` or the landings), so the page never
  jumps sideways. With the rail, the bar shows the chapter menu (the current chapter's name) instead of repeating the
  chapters inline. The document stays the scroller.
- **Scan teacher width.** The scan teacher is a container (`container: ra-scan`): two columns (image + 320 px panel)
  only when its own box is at least 780 px wide (and the window at least 1000 px, as before), so beside the rail it is
  one column at 1024 px and two from about 1360 px; in a box under 620 px the image, steps, step text and
  Back · Play · Next come first, then the structures, coverage chips and probe. It stays in the page flow.
- **Page changes.** `@view-transition { navigation: auto }` in `appnav.css`: moving between regional pages, the site
  header (`ra-site-header`) and the app bar (`ra-appbar`: `#tb-bar`, `#sp-bar`, `#bp-bar`, `.ra-sbar`) stay put and the
  rest cross-fades in 160 ms. Off under `prefers-reduced-motion`; browsers without it (Firefox) just change page.
  `initAppFeel` adds a `<script type="speculationrules">` (only where `HTMLScriptElement.supports('speculationrules')`):
  links to regional pages on this site are **prefetched** (never prerendered: a prerendered page would run its scan
  canvases and 3D models in the background and could show a level chosen after it was rendered) on hover or press
  (`moderate`); never `lower-limb/anim/`, same-page `#` links, downloads or new-tab links.
- **Settings (`/blocks/settings/`).** Reached from every app bar: a row in the chapter / block / plexus menu
  (`settingsItem`), a bar button where the bar has no menu at that width (`settingsButton`: the landings' `.ra-sbar`,
  the calculator, `brachial-plexus/` from 1180 px (an icon, so the block chips keep their room), `plexus/` while its four
  plexuses are inline), and the rail's tools.
  It holds the level control (the same `mountLevelControl`), **"Hide the bar while scrolling down"** (`localStorage`
  `ra-autohide` = `on` / `off`; off by default), **"Press / to search"** (`ra-slash`; on unless `off`) and the app
  version lines (also still at the foot of `/blocks/`). Every read and write is in try/catch.
- **Bar auto-hide** (`ra-autohide` on). `initAppFeel` puts `.ra-appbar` on the bar. Scrolling down (more than 24 px,
  once the bar has stuck) sets `html[data-ra-bar=hidden]` and `--ra-bar-now: 0px`; the bar slides up 200 ms (instant
  with reduced motion). Any scroll up, the top of the page, focus inside the bar, or an open menu or search sheet brings
  it back. Only the reader's own scrolling hides it (a wheel, a finger moving the page, a scroll key or the scrollbar
  in the last 400 ms): scrolls the page makes itself (deep links, chapter changes, a scan step or Play reflowing the
  text, scroll anchoring) never do, and taps, a finger on a scan image or 3D canvas, hash and chapter changes keep it
  for a moment more. Everything that sticks
  under the bar uses `top: var(--ra-bar-now, var(--ra-bar, 56px))` and moves with it: the rail, the
  phone scan column (`scan.css`), the `/blocks/` and landing operation lists and `spinal/`'s figure splits. Use the
  same for anything new that sticks.
- **Keyboard.** "/" (not while typing in a box, and not when turned off in Settings) and Ctrl+K / Cmd+K open or focus
  the page's search (engine pages, `/blocks/`, `spinal/`, `plexus/`); pages without search ignore them. On a scan
  teacher, the left and right arrow keys change step on the image and on the step buttons (focus follows; Home / End).

Added to the home screen (`display-mode: standalone`), `appnav.css` hides the NTF Anaesthesia site header and the breadcrumbs, so only the app bar shows (owner, 16 Oct 2026). No manifest is published yet, so this only applies where a browser opens the page standalone.

### Shims at old paths

`truncal/shared/js/*.js`, `truncal/shared/css/truncal.css`, `head-neck/shared/js/head.js` and
`lower-limb/shared/js/leg.js` are one-line re-exports, so old cached pages keep working. **Never import through
them**, and don't delete them (`static.mjs` and `deeplinks.mjs` check both).

### Cache-busting (`?v=`)

- Entry points carry `?v=YYYYMMDD`: `js/page.js?v=…` and `regional.css?v=…` in each page, and `landing.js?v=…` on
  landings. Bump them when you change what they load. `static.mjs` allows digits only in `js/page.js?v=`, so for a
  second bump on the same day use the next date, not a letter suffix.
- **Stateful modules must load under one URL per page**, or they run twice and split their state. `levels.js` and
  `figures/head.js` are always imported as `…?v=20261015`, `offline.js` as `…?v=20261016` and `appnav.js` as
  `…?v=20261017`, from every module and every app. If you bump one, change
  every import of it in the same commit (grep for the file name). Other engine modules import each other without a
  query. `smoke.mjs` fails on a stateful module loaded under two URLs.
- Never write `?v=…?v=…` (`static.mjs` checks).
- `plexus/js/explorer.js` has its own `V` constant for its dynamic imports (data files, viewer, diagram); bump it when
  you change those files, together with the `explorer.js?v=` in `plexus/index.html` and `plexus/js/app.js`.

---

## 3. Data formats

### 3.1 Block

Full schema: [`DATA.md` §3](DATA.md#3-block-schema-renderblock). Text fields are trusted HTML.

```js
{ id: 'peng', title: 'PENG block', kicker: 'Hip', summary: '…', indications: ['…'],
  glance: { position: '…', probe: '…', needle: '…' },
  scene: SCENES.peng,
  position: '…', equipment: '…', landmarks: '…', approach: '…', sonoanatomy: '…', target: '…',
  dose: { volume: '20 ml', conc: '0.2%', drug: 'ropivacaine', note: '…' },
  coverage: { map: legCoverageMap, side: 'unilateral', areas: [{ zones: ['hip-ant'], density: 'dense' }], summary: '…' },
  complications: ['…'], wrong: ['pneumo'],   // extra "If it goes wrong" guides (§3.8); false hides the section
  pearls: ['…', { safety: true, html: '…' }],
  sections: [{ id: 'consultant', title: 'Consultant corner', html: '…' }],
  watch: { anim: 'peng', caption: '…' }, anatomy3d: { plexus: 'lumbar', block: 'peng' },
  exam: [{ source: 'Practice question', q: '…', points: ['…'] }] }
```

Each dose box ends with "Check the dose for this patient", a link to `/blocks/calculator/?agent=&pct=&ml=&adr=`. It is
prefilled only when the dose names exactly one agent and gives one strength and one volume (no ranges, no ml/kg);
`dose.calc: false` hides it. Block dose text is still free text (§9).

### 3.2 Scene (scan viewer)

Full schema: [`DATA.md` §4](DATA.md#4-scene-schema-scan-viewer). Millimetres; `x` across, `y` depth; superficial to deep.
The scan teacher reads two optional fields on any layer, line or shape:

```js
{ id: 'fn', kind: 'nerve', label: 'Femoral nerve', short: 'FN', shape: E(18, 12, 3, 1.6),
  desc: 'Hyperechoic, triangular, lateral to the artery under fascia iliaca.',  // shown when tapped (reuse the block's sonoanatomy wording)
  ids: ['lumbar:n-femoral'] }                                                   // "See in 3D" → /plexus/#plexus=lumbar&el=n-femoral
```

`ids` use `<plexus>:<elementId>` (`brachial:<id>` opens the brachial app); they must exist in the plexus data
(`data.mjs` checks). "Test me" appears when at least three structures are labelled. Other scene options used by
other regions: `scene.probeInset` (figure provider), `scene.image: 'diagram'` (no ultrasound, e.g. eye blocks),
`scene.stepTitles`, `scene.realScans`, `scene.realRegion` (which `shared/us/` folder to read).

### 3.3 Coverage and figure providers

The coverage map and probe inset come from a provider chosen in the data:

| Region | Coverage map | Probe inset | Zones and coordinates |
|---|---|---|---|
| Trunk (default) | `coverageMap` (`dermatomes.js`, used when `coverage.map` is absent) | `probeInset` (default) | levels T2–L1 and torso zones: [`DATA.md` §5](DATA.md#5-coverage-schema-dermatome-map) |
| Head and neck | `coverage.map: headCoverageMap` | `scene.probeInset: headProbeInset` | `ZONES`, `OUTLINE` in `figures/head.js` |
| Lower limb | `coverage.map: legCoverageMap` | `scene.probeInset: legProbeInset` | `ZONES`, `GROUPS`, `LANDMARKS`, `VIEWS` in `figures/leg.js`; listed in `LEG.md` |
| Upper limb | `coverage.map: armCoverageMap` | `scene.probeInset: armProbeInset` | `ZONES`, `GROUPS`, `LANDMARKS` in `figures/arm.js`, written once in front-view coordinates; the back view mirrors them |

`coverage.map: false` gives text only. Density (`dense`, `moderate`, `patchy`) maps to status colours through
`DENSITY_STATUS` in `status.js`, and is shown by fill, pattern and words. The scan's Inject step builds its
Blocked / Variable / Spared chips from the same `coverage`.

### 3.4 Real scans (`shared/us/<region>/sources.json`)

Folders: `truncal`, `head-neck`, `lower-limb`, `neuraxial`, `upper-limb` (19 images; multi-panel figures cropped). Each
`sources.json` is an array, one entry per image file in the same folder. The `neuraxial` entries are matched by
`blockId` alone (`pso`, `sacrum`, `transverse`, `articular`, `lamina`, `caudal`) with no `view` field, because spinal
calls `loadRealScans(blockId, { realRegion: 'neuraxial' })` with no scene; they are grouped in `REAL_GROUPS` in
`spinal/js/sections/ultrasound.js`.

```json
{
  "file": "peng-1.jpg", "block": "peng", "blockId": "peng", "page": "lower-limb/hip/",
  "articleTitle": "…", "authors": "Cui X, Cheng Z, Zhang T, et al.", "journal": "BMC Anesthesiology", "year": 2024,
  "doi": "10.1186/…", "articleUrl": "https://pmc.ncbi.nlm.nih.gov/articles/PMC…/", "pmcid": "PMC…", "figure": "Fig. 1",
  "licence": "CC BY 4.0", "licenceUrl": "https://creativecommons.org/licenses/by/4.0/", "licenceQuote": "…exact licence text from the article…",
  "credit": "Cui X, Cheng Z, Zhang T, et al. BMC Anesthesiology 2024, Fig. 1. CC BY 4.0. Labels on the image are the authors'.",
  "caption": "Our plain-English caption.", "originalCaption": "The authors' caption.", "alt": "…",
  "orientation": { "left": "medial", "right": "lateral" },
  "burnedInLabels": "FA, PS, AIIS, IPE; dashed needle path",  "modifications": "Cropped; re-saved as optimised JPEG.",
  "view": ["ll-kn-obtd"], "blockIds": ["obt-distal"], "injection": "ql3",
  "needle": [[0.7, 0.06], [0.535, 0.525]], "la": [[0.5, 0.5], [0.56, 0.5], [0.55, 0.56]],
  "labels": [
    { "text": "Femoral artery", "kind": "artery", "x": 0.3, "y": 0.39, "tx": 0.22, "ty": 0.24, "shape": [[0.317, 0.39], …] },
    { "text": "Psoas tendon", "kind": "tendon", "x": 0.47, "y": 0.46, "shape": [[…]], "block": true },
    { "text": "AIIS", "kind": "bone", "x": 0.66, "y": 0.37, "line": [[…]], "desc": "…", "elementId": "…" }
  ]
}
```

| Field | Meaning |
|---|---|
| `blockId`, `blockIds`, `view` | Which viewer shows it: `blockId === blockId` (and, if `view` is given, the scene id is in it), or `<blockId>-<view> === blockId` for sub-views such as `ankle-dpn` |
| `injection` | id or ids: shown only while that injection point is chosen (if none match, all show) |
| `credit` | the line shown under the image (required; an entry without `src` and `credit` is dropped) |
| `orientation` | `{left, right}` words (or a text) shown on the image |
| `burnedInLabels` / `authorLabels` | the image already carries the authors' labels, so only the tapped structure gets a pill. `authorLabels: false` overrides (e.g. the authors used only numbers) |
| `needle` | the needle path the authors show (fractions, tip last) |
| `la` | polygon of where the local anaesthetic goes (≥ 3 points) |
| `labels[]` | `x, y` the point on the structure; `tx, ty` where the pill sits (a leader joins them); `shape` polygon fill or `line` open line; `kind` sets the clinical colour (`nerve`, `artery`, `vein`, `muscle`, `fascia`, `bone`, `pleura`, `tendon`, `ligament`, `cartilage`, `fat`, `fluid`, `shadow`, `la`, `needle`, `point` = target, `other`); `block: true` puts it in "Block view" (the colour key's "On" and Block view fill only `block: true` labels plus nerves, arteries, needle and local anaesthetic, so a vein needs `block: true` to fill); `desc` one line when tapped; `ids` / `elementId` for "See in 3D" (an `elementId` without a colon means `brachial:`) |

All coordinates are fractions (0–1) of the image width and height. Labels with the same `text` are one structure.
The colour code (`COLOURS` in `realscan.js`) is clinical: never recolour it to the brand.

### 3.5 Registry entry (`registry.js`)

```js
esp: { title: 'Erector spinae plane block',      // the page's own block title, word for word
       region: 'trunk',                          // upper-limb | trunk | head-neck | lower-limb | neuraxial (REGIONS)
       url: '/truncal/back/#ch-esp',             // site-absolute, must hit a real anchor
       aliases: ['ESPB', 'erector spinae'],      // ops keys, abbreviations; never another entry's id
       anatomy3d: { plexus: 'lumbar', block: 'femoral' },   // or { app: 'brachial-plexus', block, tab? }; optional
       watch: { anim: 'popliteal' } }            // optional
```

API: `REGIONS`, `REGISTRY`, `getBlock`, `resolveId`, `blocksIn`, `allBlocks`, `blockUrl`, `anatomyLink`. The block
data's own `anatomy3d` / `watch` win over the registry. Details: [`DATA.md` §9](DATA.md#block-registry-jsregistryjs).

### 3.6 Operations (`ops/`)

Each of `ops-truncal.js`, `ops-headneck.js`, `ops-lowerlimb.js`, `ops-upperlimb.js` exports `REGION`, `OPS`,
`BLOCK_LINKS`, `BLOCK_NAMES`, `PAGE_NAMES`, `blockHref(key, base)` and a coverage-figure function (`truncalCoverageMap`,
`headNeckCoverageMap`, `lowerLimbCoverageMap`, `upperLimbCoverageMap`); head-neck, lower-limb and upper-limb also export
`LINKS` (key → `[href, link text, page]`). The schema is in the comment at the top of each file; they differ slightly
(truncal draws dermatome ranges, the others zones; upper limb uses the lower-limb schema). Upper-limb links can reach
other regions (`scp` → head-neck, `clavipectoral` → truncal). A lower-limb operation:

```js
{ id: 'hipfx', region: 'hip', name: 'Hip fracture: emergency department and positioning for spinal',
  line: 'In one line…', cover: 'Area to cover…',
  map: { views: ['front'], areas: [{ zones: ['hip-ant', 'femur'], density: 'dense' }] },
  groups: [{ label: 'Recommended', items: [{ name: 'Supra-inguinal fascia iliaca block', dose: '40 ml of 0.2% ropivacaine (80 mg)', blocks: ['fib'], why: '…' }] },
           { label: 'Not recommended', items: [ … ] }],
  misses: ['…'], notes: ['…'], more: ['hipsteps'] }
```

The region landing and `/blocks/` both read this data: edit an operation once. Deep link `#op-<id>` on the landing,
`#op-<region>-<id>` on `/blocks/`.

### 3.7 Plexus datasets (`plexus/js/data/<plexus>.js`)

One default-exported object per plexus (cervical, brachial, lumbar, sacral). The brachial file builds its elements and
block lists from `brachial-plexus/js/data.js`, so both apps teach the same thing.

```js
export default {
  id: 'lumbar', name: 'Lumbar plexus', tab: 'Lumbar', side: 'right',
  levels: ['T12', 'L1', …], levelColours: { L1: '#1f6f8b', … }, intro: '…',
  model: { glb: 'model/lumbar.glb', nerves: 'model/lumbar-nerves.json' },   // brachial: frame 'gltf', mirrorX, nerveGlb, meshes
  views: { front: { label: 'Front', target: [x, y, z], position: [x, y, z] }, … }, defaultView: 'front',
  elements: { 'n-femoral': { name, short, kind: 'root|division|trunk|cord|terminal|branch|related', roots: ['L2', …], parents: [ids], motor, sensory, notes }, … },
  order: [element ids, diagram and list order],
  diagram: { viewBox, columns: [{ x0, x1, label, sub }], regions, geom: { 'n-femoral': { d: ['M… path'], w: 's|m|l|xl', dash?, label: { x, y, anchor, kind, text? } } } },
  blocks: { femoral: { name, short, summary, landmarks, target: [ids], covers: [ids], variable: [ids], spares: [ids],
                       band: { x0, x1, y0, y1 }, view: { target, position }, marker: [x, y, z] } },
  blockOrder: [block ids], credits: 'model credit line',
};
```

Element and block ids are what `#plexus=…&el=…&block=…` links, scene `ids` and registry `anatomy3d` refer to.
`target` and `covers` must not overlap; every root must be in `levels` (`data.mjs` checks).

### 3.8 "If it goes wrong" guides (`data/decisions.js`)

Step-by-step decision guides (LAST, high block, pneumothorax, phrenic palsy, pain on injection, vascular puncture,
block not working, nerve injury), rendered by `decide.js` one step at a time. All tier 1. The schema is in the comment at
the top of the file:

```js
{ id: 'last', title: '…', short: '…', tier: 1, when: 'html', start: 'q1',
  steps: { q1: { ask: 'Question?', help: 'html', yes: 'a1', no: 'q2' },          // yes / no
           q2: { ask: '…', choices: [{ label: '…', to: 'a2' }] },                  // other answers
           a1: { do: 'Action', html: '…', tone: 'danger', next: 'q2' } } }         // tone danger | warn | ok; no next = end
```

- Every block gets `CORE_GUIDES`; `EXTRA_GUIDES` lists which block ids get each extra guide, and the neuraxial region
  always gets `high` (`guidesFor`). Block data can add
  more with `wrong: [ids]` or hide the section with `wrong: false`.
- The section sits after Complications at `#<block>-wrong`, each guide at `#<block>-wrong-<guide>`; on `/blocks/` they
  are at `#wrong` and `#wrong-<guide>` (which opens it).
- **brachial-plexus/** shows `guidesFor(<block>, 'upper-limb')` in the Block guide tab, after Complications (MO level),
  ids `<block>-wrong-<guide>`; the app's own `#block=…&tab=…` hash is unchanged (guides have no deep link there).
- **spinal/** shows the neuraxial set without "pain on injection" (its paraesthesia tree covers that) at the end of
  Troubleshooting: heading `#ts-wrong` (in the Topics list), each guide at `#ts-wrong-<guide>` (which opens it).
- Apps that don't load `regional.css` wrap the list in `.ra-dg-host`: `decide.css` gives it the engine tokens and the
  `tb-btn` / `tb-details` styles, and the app may map the tokens to its own (spinal does, so its dark mode follows).
- To add a guide: add it to `GUIDES` and `GUIDE_ORDER`, map it in `EXTRA_GUIDES` (or `CORE_GUIDES`), and run `data.mjs`
  (`validateGuide`: every step reachable, every target exists, no loops, an end).

---

## 4. Levels

| Level | `getLevel()` | Shows |
|---|---|---|
| MO | `mo` | tier 1 |
| Resident | `resident` | tiers 1–2 |
| Consultant | `consultant` | everything (the default when nothing is saved) |

- **Tagging.** Any element can carry `data-tier="1|2|3"`; untagged content always shows. `renderBlock` tags block
  sections by default (`DEFAULT_TIERS`); data overrides with `tiers: {key: n}`, `{tier, html}` items, `tier` on
  extra sections and chapters, and `safety: true`. Table of defaults: [`DATA.md` §2b](DATA.md#2b-levels-mo--resident--consultant).
- **Safety rule.** Doses, the LAST line, complications and the "If it goes wrong" guides are always tier 1
  (`SAFETY_KEYS = ['dose', 'complications', 'wrong']`, enforced in `block.js` and checked by `levels.mjs` and
  `data.mjs`). You may move safety content down a tier, never up. Extra sections that carry a dose an MO may give or
  look after on the ward (catheter regimens, a separate injection offered in an MO-visible scan viewer, drug choice when
  the dose box gives volume only) are made MO level (`safety: true` or `tier: 1`), as `#sap-ribs`, `#peri-drugs` and
  `#sciatic-pfcn` are.
- **Persistence.** `localStorage['ra-level']`, shared by every regional page; spinal's old keys
  (`spinal-level`, `spinal-tier`) migrate once. Never put the level in a URL.
- **Relaxing.** A deep link or search result to hidden content raises the level for that view only (`relaxFor`,
  never saved); hint lines offer "Show all" and "Back to MO".
- **API** (frozen): `getLevel`, `setLevel(l, {save})`, `onLevel(fn) → unsubscribe`, `mountLevelControl(host)`,
  `mountLevelPicker(host)`, `relaxFor(el)`, `applyLevel()`, `countHidden(root)`, `hiddenHint(root)`, `tierOf(el)`,
  `tierMax()`, `hasChosenLevel()`, `withScrollAnchor(fn)`, `tierBadge(t)`, `TIER_NAMES`, `LEVELS`.
- Pages not built by `bootPage` call `applyLevel()` once and `mountLevelControl(host)` in their bar.
  `body[data-tier-max]` drives the hiding in `css/levels.css`.

---

## 5. Ultrasound look

### The `LOOK` object (`bmode.js`)

The simulated image is built from three mm-unit layers painted from the scene (diffuse echo, specular reflectors,
attenuation), then speckle, point-spread blur, depth gain, noise, log compression and a grey map. `LOOK` holds the
defaults:

| Key | Value | What it does |
|---|---|---|
| `sy`, `sx` | 0.17, 0.24 | speckle point-spread sigma, axial and lateral at the focus (lateral wider, so grain streaks sideways) |
| `spy` | 0.11 | axial blur of specular reflectors (fascia, bone, needle), kept thin so lines stay crisp |
| `cs` | 2.8 | specular gain relative to diffuse scatter |
| `looks` | 2 | compounded speckle realisations |
| `srk`, `srx`, `sry` | 0.6, 0.45, 0.3 | edge-preserving speckle reduction: mix and kernel |
| `iw`, `dr` | 1.4, 28 | log compression reference and dynamic range (dB) |
| `curve`, `knee` | 9-point curve, 0.3 | grey map after compression: dark toe (fluid, fat and shadow are black), even mid-tones, soft shoulder |
| `att` | 0.36 | attenuation over the image depth |
| `near`, `nearW` | 0.5, 0.05 | bright near field (skin and dermis) and how fast it decays |
| `enh` | 0.16 | posterior enhancement under fluid, per mm |
| `noise` | 0.016 | electronic noise floor |
| `skin`, `skinSp`, `derm` | 0.85, 0.12, 0.4 | entry echo, its specular part, the dermis band |
| `mDens`, `mLen`, `mS0`, `mS1`, `mSp` | 1.8, [1, 4.5], 0.25, 0.5, 0.22 | muscle striations: density, length, echo range, specular part |

Per-scene overrides: `scene.dr`, `scene.att`, `scene.enh`, `scene.gain`, `scene.psf` (coarser speckle for curvilinear
scenes), `scene.pxmm` (resolution). Change `LOOK` only to change the look of every scan; change a scene to fix one.

### Target statistics

Measured on modern high-frequency linear-probe scans (grey 0–255, image field only, median across images):

| Measure | Target |
|---|---|
| Percentiles | P5 ≈ 1, P25 ≈ 12, P50 ≈ 38, P75 ≈ 70, P95 ≈ 157, P99 ≈ 202 |
| Mean, SD | 48, 49 (a dark image with strong contrast) |
| Near-black (< 20) | about 31% (fluid, vessels, fat lobules, acoustic shadow) |
| Very bright (> 180) | about 2.4% (fascia, bone cortex, tendon, needle) |
| Speckle grain | autocorrelation half-width ≈ 3.4% of the image width × 1.9% of the height (fine horizontal streaks, not round blobs) |

Qualitatively: crisp thin bright fascia; dark fat lobules with bright septa; honeycomb peripheral nerves; jet-black
vessels with posterior enhancement; bright bone cortex with full black shadow; pure grey, no tint or vignette.

### Re-measuring after a change

1. Serve the repo (`python3 -m http.server 8765`) and, with Playwright, open a few block pages (for example
   `lower-limb/foot-ankle/#popliteal-step-identify`, `lower-limb/hip/`, `truncal/back/#esp-step-identify`,
   `head-neck/cervical/`), wait for `body[data-tb-ready="true"]`, turn labels off and screenshot the ultrasound canvas
   at 390 and 1440 px.
2. Measure each capture in greyscale: percentiles, mean, SD, fraction < 20 and > 180, and the speckle half-width
   (FFT autocorrelation of the mean-subtracted central half of the image; the first lag where it drops below 0.5,
   as a fraction of width and height). For example:

   ```python
   import numpy as np; from PIL import Image
   g = np.asarray(Image.open(f).convert('L'), float); H, W = g.shape
   pct = np.percentile(g, [5, 25, 50, 75, 95, 99]); dark, bright = (g < 20).mean(), (g > 180).mean()
   c = g[H//4:3*H//4, W//4:3*W//4]; c = c - c.mean()
   F = np.fft.fft2(c, s=(2*c.shape[0], 2*c.shape[1])); ac = np.real(np.fft.ifft2(F*np.conj(F))); ac /= ac[0, 0]
   hx = np.argmax(ac[0, :c.shape[1]] < .5) / W; hy = np.argmax(ac[:c.shape[0], 0] < .5) / H
   ```
3. Take the median across captures and match the targets within about ±15%, with the same sideways grain.
4. Look at the result at phone size: labels, needle and LA must stay readable. Never change scene anatomy, labels or
   the needle and spread logic to hit a number.

The brachial plexus app has its own renderer (`brachial-plexus/js/ultrasound.js`); keep the two looking alike.

---

## 6. How-tos

### Add a block to an existing page

1. Add its scene to `js/scenes.js` (unique `id` with the page prefix; [`DATA.md` §4](DATA.md#4-scene-schema-scan-viewer)),
   with `desc` and, where the plexus data has the nerve, `ids` on the key structures.
2. Add the block object to `js/blocks.js` ([`DATA.md` §3](DATA.md#3-block-schema-renderblock)); use the region's
   figure provider for `coverage.map` and `scene.probeInset`.
3. Add a chapter `{ id: 'ch-<blockId>', title, short, desc, block }` in `js/page.js`, and a tile if it answers a
   common need.
4. Add a registry entry (§3.5) and, if operations should point at it, a link key in the region's ops module.
5. Bump `js/page.js?v=` in the page and run the tests (§7).

### Add a region page

1. Copy `truncal/abdominal-wall/` (the reference page) and change title, description, breadcrumbs and paths
   ([`DATA.md` §1](DATA.md#1-page-template-truncalpageindexhtml)). Keep `noindex` and the footer credit.
2. Write `js/page.js` with `bootPage({…, backLabel, backShort})`.
3. Link it from its region landing; add it to `PAGES` (and `PAGES_BY_REGION`) in `blocks/blocks.js` and to its
   region's `pages` in `REGION_NAV` (`js/appnav.js`, the desktop rail). A brand-new
   region also needs a `REGIONS` entry in `registry.js`, an ops module, a figure provider and a `shared/us/` folder.
4. Add it to `PAGES` and `ENGINE_PAGES` in `test/regional/lib.mjs` so the smoke, deep-link, level and data suites
   cover it. A new page has no baseline lines, so parity has nothing to keep for it.
5. Don't link it from the homepage.

### Add a real scan with overlay

1. **Licence.** Open licences only: CC BY or CC BY-SA (what every current image uses), or the department's own
   de-identified scans with the owner's agreement. No NoDerivatives licences (we crop and overlay), ask the owner before
   using NonCommercial, and never use textbook, NYSORA, slide-deck, app or watermarked images. Copy the licence text
   into `licenceQuote` and the link into `licenceUrl`.
2. Crop to the scan, remove any patient or hospital details, save as an optimised JPEG (about 1200–1600 px wide) as
   `shared/us/<region>/<block>-<n>.jpg`, and record what you changed in `modifications`.
3. Add the entry to that folder's `sources.json` (§3.4). The `credit` is one line:
   `Authors. Journal Year, Fig. n. Licence.` plus "Labels on the image are the authors'." when they are burned in.
4. Trace `labels` (point, pill position, `shape` or `line`) yourself by looking at the image, using only names the
   block's sonoanatomy uses. Add `needle` and `la` when the authors show them, `block: true` on the target structures.
5. Open the block, choose "Real", check every pill and fill at 390 px and 1440 px, and run the tests.

Finding images: search Europe PMC for open-access articles (`OPEN_ACCESS:y AND LICENSE:"cc by"`) and read the figure
captions and licence from its full-text XML (`/europepmc/webservices/rest/PMC…/fullTextXML`). The PMC article pages
often refuse scripts, but the PMC open-access bucket serves the same figure files and the article XML with its
`ali:license_ref` (`https://pmc-oa-opendata.s3.amazonaws.com/PMC….1/<figure file>`). Keep each label's `text` to about
26 characters: the colour-key chips do not wrap beside the image. Labels are painted in order, so list a large target
area (`kind: 'point'`) before the nerve and artery inside it.

Upper-limb engine pages read `shared/us/upper-limb/`; the brachial plexus app still shows its own copies from
`brachial-plexus/us/`.

### Stamp the offline worker

After changing anything in the regional folders, or the shared `assets/`, `fonts/` or logo files they load, run
`node shared/regional/tools/stamp.mjs`. It rewrites the file lists and two hashes in `/regional-sw.js`: `VERSION`
(date + hash, shown at the foot of `/blocks/`) and `MEDIA` (pictures, models, three.js; a new `MEDIA` makes phones
download those again). `--check` only checks; `test/regional/version.test.mjs` fails when it is out of date. The worker
answers only the regional paths and the shared site files they load; everything else (home, `mo/`, `qbank/`,
`babymo/`, `exams/`) passes straight through. `regional.html` doesn't register it but is served offline once saved.

### Add a plexus dataset

1. Add `plexus/js/data/<id>.js` (§3.7) and its model files in `plexus/model/` (GLB plus nerve paths JSON), with a
   `credits` line for the model's source and licence.
2. Add the plexus to `PLEXUSES` in `plexus/js/explorer.js` (anatomical order) and bump its `V` and the
   `explorer.js?v=` references.
3. Add the id to the plexus list in `test/regional/data.mjs`, then point block data (`anatomy3d`), registry entries and
   scene `ids` at its elements and blocks.

### Add an operation to the chooser

1. Add an entry to `OPS` in the region's `shared/regional/js/ops/ops-*.js`, following the schema comment at the top.
2. Every key in `groups[].items[].blocks` (and `more`) must exist in that file's links; doses must match the block
   pages word for word (`data.mjs` checks; a reviewed difference goes in `test/regional/data-allow.json` with a reason).
3. Check it on the region landing (`#op-<id>`) and on `/blocks/` (`#op-<region>-<id>`).

---

## 7. Tests

Serve the repo on port 8765, then `node test/regional/run-all.mjs` (all suites plus the `mo/` and `babymo/` suites).
`--gate=main` runs static, version, smoke and deep links; `--only=<ids>` and `--pages=…` narrow a run. Run it after any change
to a regional page or the engine. Details: [`test/regional/README.md`](../../test/regional/README.md).

| Suite | Checks |
|---|---|
| `la.test.mjs` | dose maths in `la.js` (no browser): maxima, mg ↔ ml, lean and ideal weight, combined fraction, dose-box parsing |
| `static.mjs` | no imports through shims, old vendor path gone, every relative import exists, `noindex`, no "FRCA", no service worker except `/regional-sw.js` registered through `offline.js` (the worker is loaded in a sandbox: it must answer the regional paths and leave the others alone), no personal contacts, `?v=` once on entry points (digits only in `page.js?v=`), allow-lists valid |
| `version.test.mjs` | `regional-sw.js` file lists, `VERSION` and `MEDIA` match the files (`stamp.mjs` fixes it) |
| `data.mjs` | registry and ops links resolve, aliases unique, tiers 1–3, dose and complications never above tier 1, plexus data sound, scene `ids` exist, dose consistency between pages, ops, planners and animations, no `cite(`; every guide sound and tier 1, every block gets the core guides and its required extras, the LAST guide carries the lipid and adrenaline doses |
| `smoke.mjs` | every page in `PAGES` (25, including `blocks/calculator/` and `blocks/settings/`) at 390 and 1440 px: no console or page errors or failed requests, no horizontal overflow, every scan through 4 steps × each view, credit line, no service worker other than `/regional-sw.js`, lazy three.js and animation iframes, one instance per stateful module; polish targets with `--strict` |
| `deeplinks.mjs` | every `#ch-*`, `#<block>-step-*`, `#<block>-inj-*`, `#op-*`, app state hashes, redirects, shims, `edit.html?page=` |
| `levels.mjs` | one level control per page, correct hiding per level, hints, MO always shows dose, LAST, complications, the "If it goes wrong" section (core guides, nothing above tier 1, the LAST guide steps forward) and scan, persistence never in the URL, spinal migration, relaxing |
| `appframe.mjs` | the app frame: Settings page (defaults, saving, level control, version lines), Settings reachable from every kind of app bar at 390 and 1440, bar ≤ 56 px, auto-hide off by default and working when on (scroll down / up, top, open menu, phone scan column follows), a page's own scrolling never hides it, rail at 1024 / 1180 / 1440 on the pages that have one and none at 390 or on the landings and `/blocks/`, the bar lined up with the site header, no overflow, the document scrolls, the scan teacher in the page flow, "/" and Ctrl+K, arrow keys on the step buttons, speculation rules (prefetch only), view-transition names (none with reduced motion) |
| `parity.mjs` | at Consultant, every line of the baseline text is still on its page, and doses are identical (guide text isn't captured; `data.mjs` covers it) |
| `offline.e2e.mjs` | its own server: `/blocks/` installs the worker and shows the version; with no signal block pages, `spinal/` and `lower-limb/` render; home and `mo/` are not answered; "Get the latest version" removes only the regional caches |

**Baseline rules.** `test/regional/baseline/` is the content captured before the harmonisation.
`smoke.mjs --baseline` rewrites it: only ever **before** a change, **never to make a failing test pass**. Reviewed
differences go in `parity-allow.json` / `data-allow.json`, each with a reason, in the PR that needs them, and never to
let a clinical change through.

---

## 8. Ownership

| Part | Owner (Claude Code session) |
|---|---|
| The regional app: engine (`shared/regional/`, `shared/us/`), `blocks/`, `lower-limb/`, `plexus/`, `test/regional/` | "Lower limb blocks" session |
| `spinal/` content | spinal session |
| `brachial-plexus/` content | brachial plexus session |
| `truncal/` content | truncal session |
| `head-neck/` content | head and neck session |
| `lower-limb/anim/`, `popliteal-animation/`, `exams/` | Dr Chew Shi Hao (don't edit without his say-so) |

Content owners edit their own pages' data freely but use the shared engine. **Any change to `shared/regional/`
(modules, CSS, `LOOK`, registry, ops schema) goes through the regional app owner**, because it changes every page.
The usual site rules apply: branch and pull request, browser check, tests green, credits and `noindex` kept.

---

## 9. Known limits and backlog

In rough priority order. Done on 17 Oct 2026: the desktop layout (rail, container queries for the scan teacher), view
transitions and prefetch between pages, the Settings page with "Hide the bar while scrolling down" and the "/" key
(§2 "App frame"). Done since 15 Oct 2026: upper-limb blocks on the engine with their chooser and real scans,
offline use (`/regional-sw.js`), the dose calculator and structured maxima (`la.js`), the "If it goes wrong" guides
(on the engine blocks, `/blocks/`, and since 17 Oct 2026 the brachial plexus app and `spinal/`), a `var(--ra-bar, 56px)`
fallback everywhere the bar height is used (Firefox ESR 115 has no `:has()`, which sets it),
spinal topic navigation and real scans, and the scalp, glossopharyngeal and V2/V3 diagram and ultrasound scenes
(`hn-sc-temple`, `hn-aw-gpn`, `hn-fa-deep`, `hn-sc-atn`, `hn-aw-gpus`, `hn-fa-ppf`).

1. **Brachial plexus app still has its own scan teacher.** `brachial-plexus/js/ultrasound.js` keeps its own 7
   `SCENES_MM`, renderer and `brachial-plexus/us/` scans; the same blocks are now on the upper-limb engine pages. The
   app has no link to them yet, and the cervical plexus chooser's "brachial plexus" link still goes to the app.
2. **No single-page app.** Pages are separate; a `#/block/<id>` app with redirect stubs is not built (offline use is).
3. **Block dose text is free text.** The calculator has structured maxima, but dose text is still repeated in the
   block, glance, ops, planners and animation headers and kept in step by `data.mjs`. Next step: structured
   `{agent, pct, ml}` dose fields.
4. **Long spinal chapters are not split** into per-topic screens; they have in-chapter topic navigation
   (`spinal/js/topics.js`).
5. **Real scans: one image only for some blocks.** On 16 Oct 2026, 20 images were added: costoclavicular,
   suprascapular, axillary nerve and median nerve in the forearm (two each), ulnar nerve in the forearm and radial nerve
   at the elbow (one each), auriculotemporal and peristyloid glossopharyngeal (two each), pterygopalatine fossa (one),
   inferomedial genicular, proximal obturator and transgluteal sciatic (one each), and transverse paravertebral (two more).
   Still one image: `pvb`, `parasternal`, `rsb`, `iih`, `scp`, `dcp`, `saphenous`, `sciatic`, `genicular` (SMGN),
   `gen-slgn`, `gen-imgn`, `acb-canal`, `obturator`, `sciatic-tg`, `ulnar-forearm`, `radial-elbow`, `ppf` (the ulnar,
   radial and sciatic-tg images are photographs of the screen; replace them when a cleaner open-licence scan turns up).
   No real scan, by design for now: the diagram-only scenes (scalp block at the temple, intraoral glossopharyngeal,
   maxillary and mandibular nerves at the coronoid notch, peribulbar and sub-Tenon's, below-knee saphenous field block,
   wrist block). Searched without success on 16 Oct 2026 (Europe PMC, open-access CC BY): a second superficial cervical
   plexus, rectus sheath and ilioinguinal image.
6. **Animations** for iPACK, genicular, obturator, saphenous and sciatic blocks (Dr Chew Shi Hao's call).
7. Problems inside `lower-limb/anim/`, `popliteal-animation/` and `exams/` are reported to Dr Chew Shi Hao, not fixed.
