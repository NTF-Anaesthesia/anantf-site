# Regional anaesthesia app: engine guide

How the regional anaesthesia app is built, so you can maintain and extend it without reading all the code first.
The full data schema (every block, scene and coverage field, page template, levels detail) is in
[`DATA.md`](DATA.md); this guide links to it rather than repeating it. Test details are in
[`test/regional/README.md`](../../test/regional/README.md).

Static ES modules, no build step, no CDN, no service worker. Everything is plain files served by GitHub Pages.

---

## 1. What the app is

A teaching app for ultrasound-guided regional anaesthesia at NTF Anaesthesia, for MOs, residents and consultants.
Every page is unlisted and `noindex`; the owner shares the links personally (don't link them from the homepage).

| Page | URL | Built with |
|---|---|---|
| Front door | `/blocks/` | its own script, reading `registry.js` and `ops/` (no clinical text of its own) |
| Truncal landing + 3 pages | `/truncal/`, `back/`, `chest-wall/`, `abdominal-wall/` | landing chooser + engine (`bootPage`) |
| Head and neck landing + 5 pages | `/head-neck/`, `cervical/`, `scalp/`, `face/`, `airway/`, `eye/` | landing chooser + engine |
| Lower-limb landing + 4 pages | `/lower-limb/`, `hip/`, `knee/`, `foot-ankle/`, `thigh/` | landing chooser + engine; Dr Chew Shi Hao's animations from `lower-limb/anim/` |
| Upper limb | `/brachial-plexus/` | its own app (own scan teacher, 3D, diagram); uses the engine's levels and status colours |
| Neuraxial | `/spinal/` | its own app; uses the engine's levels |
| Anatomy in 3D | `/plexus/` | plexus explorer (cervical, brachial, lumbar, sacral); uses levels and status colours |
| Hub card | `/regional.html` | static page; the only public way in |

All of them share one app bar, one credit line ("Created by Dr Koh Wenjun and Dr Chew Shi Hao, NTF Anaesthesia", Dr Chew
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
| `figures/head.js`, `figures/leg.js` | head and leg figure providers: coverage maps, probe insets, view figures (§3.3) |
| `levels.js` | the level system (§4) |
| `status.js` | status colours and line styles (target, covers, variable, spares), `INJECTION`, `LA`; twin of `css/status.css` |
| `registry.js` | one entry per block across every region (§3.5) |
| `ops/ops-*.js` | the operations behind each "which block for which operation" chooser (§3.6) |
| `search.js` | page search index and synonyms |
| `ui.js` | DOM helpers (`el`, `sv`, `fill`, `callout`, `table`, `details`, `stepper`, …) |
| `refs.js` | kept for old data; renders nothing (the pages carry no citations) |

CSS in `shared/regional/css/`: `regional.css` (all shared `tb-` styles; imports `levels.css`), `scan.css` and
`realscan.css` (linked by the scan modules themselves), `status.css`, `levels.css`.

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
(`truncal/landing.js`, `head-neck/landing.js`, `lower-limb/landing.js`) render the chooser from `ops/`.

### Outside the engine

- **brachial-plexus/** keeps its own scan teacher (`js/ultrasound.js`, `SCENES_MM`), 3D viewer and real scans
  (`brachial-plexus/us/`, `js/real-scans.js`). It imports `levels.js` and `status.js` from the engine and links
  `css/status.css` and `css/levels.css`.
- **spinal/** imports `levels.js` (its old tiers map to MO / Resident / Consultant; "Pearls only" is Consultant only)
  and links `css/levels.css`.
- **plexus/** uses `levels.js`, `status.js` and `regional.css`. `plexus/js/explorer.js` is also loaded on demand by
  block pages. Pages without a `three` import map get the explorer in an iframe of `plexus/index.html?embed=1`.
- **three.js** r160 and its Draco decoder live in `shared/vendor/three-r160/`, reached only through the import maps
  in `brachial-plexus/index.html` and `plexus/index.html`. No other page loads three.js until "Open here" is tapped.
- **Animations**: `lower-limb/anim/` is Dr Chew Shi Hao's frozen engine. Don't edit it. Block data reaches it through
  `watch`; `lower-limb/shared/js/anim.js` (`animFigure`) is for sections outside block data. See
  [`lower-limb/shared/LEG.md`](../../lower-limb/shared/LEG.md).

### Shims at old paths

`truncal/shared/js/*.js`, `truncal/shared/css/truncal.css`, `head-neck/shared/js/head.js` and
`lower-limb/shared/js/leg.js` are one-line re-exports, so old cached pages keep working. **Never import through
them**, and don't delete them (`static.mjs` and `deeplinks.mjs` check both).

### Cache-busting (`?v=`)

- Entry points carry `?v=YYYYMMDD` (with a letter suffix for same-day bumps): `js/page.js?v=…` and
  `regional.css?v=…` in each page, and `landing.js?v=…` on landings. Bump them when you change what they load.
- **Stateful modules must load under one URL per page**, or they run twice and split their state. `levels.js` and
  `figures/head.js` are always imported as `…?v=20261015`, from every module and every app. If you bump one, change
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
  complications: ['…'], pearls: ['…', { safety: true, html: '…' }],
  sections: [{ id: 'consultant', title: 'Consultant corner', html: '…' }],
  watch: { anim: 'peng', caption: '…' }, anatomy3d: { plexus: 'lumbar', block: 'peng' },
  exam: [{ source: 'Practice question', q: '…', points: ['…'] }] }
```

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

`coverage.map: false` gives text only. Density (`dense`, `moderate`, `patchy`) maps to status colours through
`DENSITY_STATUS` in `status.js`, and is shown by fill, pattern and words. The scan's Inject step builds its
Blocked / Variable / Spared chips from the same `coverage`.

### 3.4 Real scans (`shared/us/<region>/sources.json`)

Folders: `truncal`, `head-neck`, `lower-limb`, `neuraxial`, `upper-limb` (empty). Each `sources.json` is an array, one
entry per image file in the same folder:

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
| `labels[]` | `x, y` the point on the structure; `tx, ty` where the pill sits (a leader joins them); `shape` polygon fill or `line` open line; `kind` sets the clinical colour (`nerve`, `artery`, `vein`, `muscle`, `fascia`, `bone`, `pleura`, `tendon`, `ligament`, `cartilage`, `fat`, `fluid`, `shadow`, `la`, `needle`, `point` = target, `other`); `block: true` puts it in "Block view"; `desc` one line when tapped; `ids` / `elementId` for "See in 3D" (an `elementId` without a colon means `brachial:`) |

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

Each of `ops-truncal.js`, `ops-headneck.js`, `ops-lowerlimb.js` exports `REGION`, `OPS`, `BLOCK_LINKS`, `BLOCK_NAMES`,
`PAGE_NAMES`, `blockHref(key, base)` and a coverage-figure function (`truncalCoverageMap`, `headNeckCoverageMap`,
`lowerLimbCoverageMap`); head-neck and lower-limb also export `LINKS` (key → `[href, link text, page]`). The schema
is in the comment at the top of each file; the three differ slightly (truncal draws dermatome ranges, the others
zones). A lower-limb operation:

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
- **Safety rule.** Doses, the LAST line and complications are always tier 1 (`SAFETY_KEYS`, enforced in `block.js`
  and checked by `levels.mjs` and `data.mjs`). You may move safety content down a tier, never up.
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
   ([`DATA.md` §1](DATA.md#1-page-template-truncalpageindexhtml)). Keep `noindex`, the credit and the disclaimer.
2. Write `js/page.js` with `bootPage({…, backLabel, backShort})`.
3. Link it from its region landing; add it to `PAGES` (and `PAGES_BY_REGION`) in `blocks/blocks.js`. A brand-new
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

Upper-limb images currently live in `brachial-plexus/us/` and are shown by that app's own viewer;
`shared/us/upper-limb/` is empty until the brachial scenes move to the engine.

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
`--gate=main` runs static, smoke and deep links; `--only=<ids>` and `--pages=…` narrow a run. Run it after any change
to a regional page or the engine. Details: [`test/regional/README.md`](../../test/regional/README.md).

| Suite | Checks |
|---|---|
| `static.mjs` | no imports through shims, old vendor path gone, every relative import exists, `noindex`, no "FRCA", no service worker, no personal contacts, `?v=` once on entry points, allow-lists valid |
| `data.mjs` | registry and ops links resolve, aliases unique, tiers 1–3, dose and complications never above tier 1, plexus data sound, scene `ids` exist, dose consistency between pages, ops, planners and animations, no `cite(` |
| `smoke.mjs` | every page at 390 and 1440 px: no console or page errors or failed requests, no horizontal overflow, every scan through 4 steps × each view, credit line, lazy three.js and animation iframes, one instance per stateful module; polish targets with `--strict` |
| `deeplinks.mjs` | every `#ch-*`, `#<block>-step-*`, `#<block>-inj-*`, `#op-*`, app state hashes, redirects, shims, `edit.html?page=` |
| `levels.mjs` | one level control per page, correct hiding per level, hints, MO always shows dose, LAST, complications and scan, persistence never in the URL, spinal migration, relaxing |
| `parity.mjs` | at Consultant, every line of the baseline text is still on its page, and doses are identical |

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

In rough priority order:

1. **Brachial scenes not on the engine.** `brachial-plexus/js/ultrasound.js` keeps its own 7 `SCENES_MM` and renderer;
   port them to the scene schema, then move its real scans into `shared/us/upper-limb/` (empty today).
2. **No single-page app and no offline use.** Pages are separate; a `#/block/<id>` app with redirect stubs and a
   service worker (on the `mo/` pattern) is not built. Regional pages must not register a service worker until then.
3. **No structured dose data.** Dose text is repeated in the block, glance, ops, planners and animation headers and
   kept in step by `data.mjs`; no shared local anaesthetic calculator yet.
4. **No decision trees** per block (failed block, LAST, vascular puncture): new clinical prose needing owner review.
5. **No upper-limb operations in the chooser** (needs new clinical content); the very long spinal chapters are not
   split into per-topic screens.
6. **Real scans are thin.** Upper limb has none in `shared/us/`; the `neuraxial/` images are not shown yet because
   `spinal/` has no engine scan viewer; several blocks have one image or none.
7. **New scenes and animations.** Diagram scenes for the scalp, glossopharyngeal and deep V2/V3 blocks; animations
   for iPACK, genicular, obturator, saphenous and sciatic blocks (Dr Chew Shi Hao's call).
8. Problems inside `lower-limb/anim/`, `popliteal-animation/` and `exams/` are reported to Dr Chew Shi Hao, not fixed.
