# Truncal blocks: shared engine, data schema and page wiring

Everything in `truncal/shared/` is used by all three region pages (`truncal/back/`, `truncal/chest-wall/`,
`truncal/abdominal-wall/`). **Pages do not edit `shared/`**: they supply data. `truncal/abdominal-wall/` is the
reference implementation: copy its structure.

```
truncal/shared/
  css/truncal.css     all shared styles (prefix tb-). Page-only styles go in <page>/page.css with a page prefix.
  js/shell.js         bootPage(config): hub, chapters, hash routing, sticky bar, search, copy link, pager, references
  js/block.js         renderBlock(block, host): one block chapter from a data object (called by the shell)
  js/scan.js          mountScan(host, scene, {blockId}): the interactive scan viewer (called by block.js)
  js/scene.js         scene geometry, shape constructors E/P/PS/L, LA spread and tissue warp
  js/bmode.js         simulated B-mode ultrasound from a scene (cached per scene id; built in phases off idle time)
  js/diagram.js       idealised labelled diagram from the same scene
  js/dermatomes.js    coverageMap(coverage), probeInset(probe), OUTLINE (torso outlines) — original drawings
  js/refs.js          registerRefs, cite('id'), citeEl, renderRefs
  js/search.js        page search + synonyms (addSynonyms via config.synonyms)
  js/ui.js            el, sv, fill, callout, keyPoints, steps, stepper, table, details, registerSearch, …
```

Static ES modules, no build step, no CDN. Import with relative paths, e.g. `../../shared/js/shell.js`.

---

## 1. Page template (`truncal/<page>/index.html`)

Copy `truncal/abdominal-wall/index.html` and change only: `<title>`, `<meta name="description">`, the last
breadcrumb (`<span aria-current="page">Chest wall</span>`), and `page.css` if you have one. Keep:

- `<html lang="en-GB" data-theme="light">`, `<meta name="robots" content="noindex, nofollow">`, `<meta name="color-scheme" content="light">`
- the site header (`ntf-header`, links `../../…`), breadcrumbs **Resources / Regional anaesthesia / Truncal blocks / <Page>**
  (`../../resources.html`, `../../regional.html`, `../`)
- `<div id="tb-bar"></div>` (the shell fills it), `<main id="main" class="site-container">` (the shell fills it; a
  `<noscript>` inside is fine), `<div id="tb-live" class="tb-sr" aria-live="polite" aria-atomic="true"></div>`
- the `tb-foot` block (disclaimer **"For education only. Follow local guidelines and senior advice; check doses for
  each patient."** and the credit **"Created by Dr Koh Wenjun and <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>,
  NTF Anaesthesia"**, link back to `../`), then `ntf-footer`
- `<body class="tb-app">`, stylesheets `../../assets/navigation.css`, `site-shell.css`, `header-nav.css`,
  `../shared/css/truncal.css`, and `<script type="module" src="js/page.js?v=1"></script>`

## 2. `js/page.js`: `bootPage(config)`

```js
import { bootPage } from '../../shared/js/shell.js';
import { BLOCKS, REFS } from './blocks.js';
bootPage({
  title: 'Chest wall blocks',                       // hub h1 and chapter kickers
  eyebrow: 'Regional anaesthesia · Truncal blocks',
  lead: 'One sentence.',                            // HTML allowed
  searchPlaceholder: 'Search, e.g. PECS, serratus',
  tiles: [{ title: 'Cover a mastectomy', desc: 'PECS II set-up', href: '#ch-pecs' }, …],  // "I need to…" tiles
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy', short: 'Anatomy', desc: 'Hub list text', render: (sec) => { … } },
    { id: 'ch-sap', title: 'Serratus anterior plane block', short: 'Serratus', desc: '…', block: BLOCKS[0] },
  ],
  refs: REFS,                                       // [{id, text (HTML), url, label}] — numbered in this order
  refsIntro: 'Optional sentence above the reference list.',
  synonyms: [['sap', 'serratus']],                 // optional extra search synonym rows
  hubExtra: '<p>optional HTML appended to the hub</p>',
});
```

- A chapter has either `block` (rendered by `renderBlock`) or `render(sec)` (your own content; you add the `h2`), or both.
- **Headings.** Author every chapter as **h2 title > h3 > h4** (as now). After it renders, the shell gives the chapter
  one visible `h1`: with a single `h2`, every heading moves up one level (h2 → h1, h3 → h2, h4 → h3) and keeps its look
  through the classes `tb-ch-title`, `tb-hv3`, `tb-hv4` (the authored level); with several `h2`s only the first becomes
  the `h1`. Ids and attributes are kept, so `aria-labelledby` and deep links still work. In page CSS, style headings by
  class or id rather than by tag (`.tb-chapter>h3` in page CSS no longer matches; the shared CSS now covers the 48px
  top margin those rules gave).
- **Kickers.** A `.tb-eyebrow` that starts a chapter (a block's `kicker`, or one you add before your `h2`) is merged into
  the "Chapter n of m" line, so there is one kicker: "Chapter 2 of 7 · Back · Paraspinal fascial plane".
- Reader-facing wording: say "teaching slides" (prose) or "Slides" (tags), not "deck".
- Sticky bar: Hub link and chapters are one `nav`; on screens under 1240 px the chapters are a disclosure menu
  (`#tb-chmenu-btn`), not a `<select>`. Search opens with Ctrl+K / Cmd+K (no single-key shortcut). The hub shows the
  disclaimer under the credit.
- `ch-refs` (References) is appended automatically when `refs` is non-empty.
- Chapter ids must start `ch-`. A block chapter should be `ch-<blockId>`.

### Routing and deep links
- `#ch-x` shows that chapter. Any other hash is an element id: the shell shows the chapter that contains it, opens
  `<details>` ancestors and scrolls. Browser Back/Forward work. Empty hash = hub.
- An element with `data-activate` is **clicked** after scrolling, and `data-scroll-to="<id>"` scrolls to that element
  instead. The scan viewer uses this, so these deep links work for every block with a scene:
  - `#<blockId>-step-scan`, `#<blockId>-step-identify`, `#<blockId>-step-needle`, `#<blockId>-step-inject`
  - `#<blockId>-inj-<injectionId>` (selects that injection, e.g. `#ql-inj-ql3`)
- Section ids made by the block renderer: `#<id>-position`, `-equipment`, `-landmarks`, `-approach`, `-sonoanatomy`,
  `-target`, `-dose`, `-coverage`, `-complications`, `-pearls`, `-exam`, `-<sectionId>` (extra sections),
  `-scan` (the viewer), `-covmap`, `-exam-1…`.
- Cross-page links: `../back/#esp-step-needle` etc.
- Ready signal for tests: `body[data-tb-ready="true"]`; event `tb-ready`; `tb-chapter` fires on chapter change.

## 3. Block schema (`renderBlock`)

All text fields are **trusted HTML strings** (or arrays of HTML strings rendered as a list). Use `cite('id')` inside
strings (from `shared/js/refs.js`): it renders `[n]` linked to the reference list. Unknown ids render nothing.

| Field | Type | Rendered as |
|---|---|---|
| `id` | string, lowercase, no spaces | prefix for all ids (`tap` → `#tap-dose`) |
| `title` | string | chapter `h2` |
| `kicker` | string | small capitals line above the title |
| `summary` | HTML | lead paragraph |
| `indications` | HTML[] | "Use it for" chips |
| `glance` | `{position, probe, needle, dose, covers}` | "At a glance" strip; `dose`/`covers` default from `dose` and `coverage.summary` |
| `intro` | HTML | optional prose before the viewer |
| `scene` | Scene (§4) | the scan viewer |
| `position`, `equipment`, `landmarks`, `approach`, `sonoanatomy`, `target` | HTML or HTML[] | sections in this order; `landmarksTitle` renames "Landmarks and scanning" |
| `dose` | `{volume, conc, drug, per, source, note}` or `{html, source, note}` | dose box: "20–30 ml of dilute 0.3% ropivacaine per side" + source line + LAST reminder |
| `last` | string | override the LAST line (default: "Keep the total dose within the maximum for the patient’s weight, especially with bilateral blocks or when combining blocks.") |
| `coverage` | Coverage (§5) | map + "Covers" + Mechanism + "How dense, how reliable" + "What it misses" |
| `complications` | HTML or HTML[] | section |
| `pearls` | HTML[] | "Practical pearls" list |
| `sections` | `[{id, title, html, render(sec)}]` | extra sections, inserted before the exam corner |
| `exam` | `[{source, q, points[], id?}]` | Exam corner; `points` sit in a "Model answer points" disclosure |
| `sources` | HTML | "Sources." line at the end |

Doses: use the deck value exactly; mark gap-fill values with `cite()` to a real reference in `source`.
Paravertebral: write **0.3–0.5%** ropivacaine (deck typo "0.3–5%").

## 4. Scene schema (scan viewer)

Units are **millimetres**. `x` runs across the screen from the left edge (0 … `width`); `y` is depth from the skin
(0 … `depth`). Order everything **superficial to deep**. Both views (simulated ultrasound and diagram) are drawn from
the same data, so labels, needle and spread line up.

```js
import { E, P, PS, L } from '../../shared/js/scene.js';
{
  id: 'cw-sap',                    // unique across the site (cache key) — prefix with your page: bk-, cw-, aw-
  title: 'Serratus anterior: …',   // viewer heading
  width: 45, depth: 40,            // field of view (mm). Linear probe ≈ 40–50 × 30–45; curvilinear ≈ 80–90 × 80–90
  focus: 20,                       // focal depth (mm)
  skin: 1.2,                       // dermis thickness (mm)
  psf: 1,                          // point-spread scale: 1 linear probe; ~2–2.2 curvilinear (coarser speckle)
  pxmm: 16,                        // optional B-mode resolution (default min(16, 720/width)); use 8 for 80–90 mm scenes
  att: 0.009, gain: 1, dr: 40,     // optional: depth attenuation per mm, overall gain, dynamic range (dB)
  view: 'Plain-English description of the plane, side and probe orientation.',
  orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },   // shown on the image; any words (Medial/Lateral/…)
  alt: 'Optional extra sentence for screen readers.',
  layers: [ … ], lines: [ … ], shapes: [ … ],
  target: { at: [x, y], r: 2 },    // dashed ring shown from step 2 (per-injection `target` overrides)
  injections: [ … ],               // one or more needle paths; >1 shows a chooser (`injectionLabel` = chooser title)
  steps: { scan, identify, needle, inject },   // HTML for the four steps (per-injection `steps` override per key)
  probe: { view: 'front'|'back', x, y, angle, label },  // probe inset on the torso (see §5 coordinates); the marker dot
                                                       // sits on the probe end matching orient.marker (override: probe.marker 'left'|'right')
}
```

### `layers` — horizontal tissue bands, superficial → deep
Each layer gives only its **deep border** `bottom`; its top is the previous layer's bottom (the first layer starts at
`skin`). A number means a flat border. A border shallower than the layer's top is clamped, so a layer can **taper to
zero** (aponeuroses meeting at the linea semilunaris, a muscle that only exists on one side of the image).

```js
{ id: 'esm', kind: 'muscle', label: 'Erector spinae', short: 'ESM', bottom: [[0, 30], [45, 31]],
  smooth: true,        // Catmull-Rom through the points (false = straight segments)
  echo: 0.14,          // mean echogenicity 0–1 (muscle ≈ 0.11–0.17, fat-deep ≈ 0.3–0.45)
  stri: 0,             // fibre direction in degrees (0 = along the screen; parasagittal ESM ≈ 0–10)
  dens: 0.4,           // striation density
  edge: 0.95,          // brightness of the deep border (fascia); 0 = none
  edgeW: 0.4,          // border thickness (mm)
  labelX: 36, at: [x, y], lab: [x, y], nolabel: false }
```
Layer kinds: `fat` (subcutaneous: dark lobules, bright septa), `muscle`, `aponeurosis` (bright fibrillar band, also
`tendon`/`ligament` as bands), `fat-deep` / `connective` (mid-grey mottled), `bowel`, `liver` / `organ`, `kidney`,
`fluid`, `lung` (as a band), `cartilage` (hypoechoic, mild attenuation), `none` (not painted), `label` (not painted and
no border line; just a label).

### `lines` — interfaces drawn as bright reflectors (x-sorted polylines)
```js
{ id: 'pleura', kind: 'pleura', label: 'Pleura', pts: [[0, 32], [20, 31], [45, 33]], sliding: true, w: 0.55 }
```
Kinds: `pleura` (bright line, **lung artefact painted below** to the bottom: A-line reverberations, comet tails;
`sliding: true` adds a shimmer animation), `peritoneum`, `fascia`, `ligament` (thicker), `bone` (bright line with
shadow), or any other word (= fascia). Options: `amp` (0–1), `w` (mm), `gaps` (dropouts), `vary`.

### `shapes` — discrete structures, any orientation
```js
{ id: 'tp5', kind: 'bone', label: 'T5 transverse process', short: 'T5 TP',
  shape: PS([10, 22], [18, 21.5], [18.5, 26], [9.5, 26]), at: [14, 22], lab: [14, 17] }
```
Shape constructors: `E(cx, cy, rx, ry, rotDeg)` ellipse; `P(...pts)` smoothed closed polygon; `PS(...pts)` sharp
polygon (square-shouldered transverse process, rib cortex); `L(w, ...pts)` open polyline of width `w` mm.
`shape` may be an array (several pieces, one label).

| kind | ultrasound | diagram |
|---|---|---|
| `bone` (P/PS/E) | bright **probe-facing (upper) surface only** (flat tops bright, steep flanks dim) + **black acoustic shadow** from the surface down to the bottom of the image, across the shape's width | near-white with stipple and a dark outline |
| `bone` (L) | bright line + the same full shadow (thin cortex, rib or vertebral body surface) | near-white line, dark edges |
| `cartilage` (P/E) | hypoechoic, fine speckle, thin bright upper surface, **no full shadow** (mild attenuation only): costal cartilage | pale grey-green, outlined |
| `label` | **not painted**. Its label is drawn (italic, dashed chip); a closed `shape` is outlined with a dashed line in both views (an `L(...)` shape as a dashed line) while labels are on. `outline: false` = label only. Use for "ESP plane", "Paravertebral space" | dashed outline |
| `muscle`, `aponeurosis`, `fat-deep`, `connective`, `bowel`, `liver`, `organ`, `fluid`, `lung` | as layers | as layers |
| `kidney` | hypoechoic with bright capsule | organ colour |
| `artery` / `vein` | anechoic lumen, bright wall, posterior enhancement | red / blue (clinical code) |
| `nerve` | hypoechoic with bright rim | yellow (clinical code) |
| `fascia`, `ligament`, `membrane` with `L(...)` | bright oblique/vertical reflector (e.g. **SCTL**, **IIM**, TLF) | brown line |

Paint order: layers → non-bony shapes → layer borders → lines → bones, cartilage, vessels, nerves (on top).
`noShadow` is ignored (shadows are only in the ultrasound view).

**Acoustic shadow rule (ultrasound view).** Everything deeper than a bone's upper surface, within the bone's horizontal
extent, is black (faint noise only): pleura, lung artefact, other lines and shapes, LA. You don't need to stop the
pleura line at the ribs; draw it continuous and the shadow hides it. The pleural-sliding shimmer is limited to the
pleura line's own x-range and skips shadowed columns; it runs for about 5 s after a step change or while playing,
stops on Pause, and never runs with reduced motion.

`kind: 'none'` still works as before (not painted in ultrasound; outlined thinly in the diagram); prefer `kind: 'label'`
for label-only regions.

### Labels
Every layer/line/shape with `label` is labelled unless `nolabel: true`. Overlay text is 12 px; SVG figures you draw
should render text at 12 px or more at 390 px (in a ~360-unit-wide viewBox use about 13–14 units). `short` is used when the image is narrower
than 520 px (and in the key under the viewer). `at` = the point the label refers to (default: middle of a layer at
`labelX` or 80% width; a point on a line; the centroid of a shape). `lab` = where the text sits; if it differs from
`at` a leader line is drawn. Keep `lab` inside the image and away from other labels; check at 390 px.

### `injections` — needle path and local anaesthetic spread
```js
{ id: 'esp', label: 'T5 transverse process',
  entry: [-14, 0],        // where the needle starts (mm). Off-screen x (<0 or >width) = enters from that edge.
                          // Left edge = needle from the screen-left side (e.g. cranial → caudal if orient.left is Cranial).
  tip: [22, 24.5],        // final tip position (in the plane, usually on the bone or under the ligament)
  target: { at: [22, 24.5], r: 2 },     // optional per-injection target ring
  pop: { label: 'Pop: through the SCTL', plane: 'sctl-line-or-layer', tent: 1.4, width: 4 },  // optional tent + pop
  spread: {
    along: 'esm',         // the plane: a layer id (its deep border), 'layerId:top', a line id, or a polyline [[x,y]…]
    x0: 4, x1: 40,        // final extent along the screen (cranial–caudal in a parasagittal view)
    from: 22,             // where spread starts (default tip x)
    thick: 4,             // max thickness (mm)
    up: 1,                // share of the thickness that LIFTS the tissue above (1 = ESP lifts erector spinae;
                          //   0 = everything below is pushed down, e.g. pleura pushed down in paravertebral)
    above: 8,             // how much tissue above is compressed (mm)
    shape: 0.9 },         // lens profile exponent
  steps: { needle: '…', inject: '…' } }   // optional per-injection step text
```
**Several spreads at once (optional fields on an injection):**
- `spreads: [spread, …]`: extra spreads (same fields as `spread`) that open together with `spread` on Inject, e.g. one
  needle pass that fills two planes.
- `keep: ['otherInjectionId', …]`: the spreads of those injections are shown **already open** (full size) from the
  Needle step of this injection, e.g. PECS II stage 2 `keep: ['pecs1']` keeps the interpectoral pool visible while the
  pectoserratus injection is done. Their warps add up (labels, target ring and pleura follow all of them).

The viewer animates the needle in-plane from `entry` to `tip` (bright shaft with reverberation lines in ultrasound,
steel needle with bevel in the diagram). On **Inject**, the LA opens along the plane over ~2.8 s: tissue above the
plane is compressed upward by `up × thickness`, everything below is shifted down by the rest, and the gap is drawn
anechoic (ultrasound) or blue (diagram). Labels, the target ring and sliding pleura follow the warp.
With `pop`, the needle presses on `pop.plane` (tenting it down) then pops through, with the `pop.label` flash.

Recipes:
- **ESP (parasagittal):** layers trapezius → rhomboid major → erector spinae (`edge` bright) → `connective`; TPs as
  `PS` bone shapes under ESM; `spread.along: 'esm'`, `up: 1` (ESM lifted off the TPs); needle from `entry` on the
  cranial or caudal edge.
- **Paravertebral (parasagittal):** TPs as `PS` bones; SCTL as `shapes` kind `ligament` with `L(0.7, …)` sloping
  between TPs; pleura as a `lines` entry with `sliding: true`; `pop: { plane: [[…],[…]] }` on the SCTL;
  `spread.along` a polyline just under the SCTL, `up: 0` (pleura pushed down); needle **caudal → cranial**.
- **Transverse paravertebral:** TP bone medially, IIM as a `ligament` line continuous with the SCTL, pleura line.
- **Chest wall:** layers pec major → pec minor → serratus anterior → intercostals; ribs as `PS`/`E` bone shapes
  (rounded hyperechoic tops with shadows) with pleura `lines` between and below.

## 5. Coverage schema (dermatome map)

```js
coverage: {
  side: 'unilateral' | 'bilateral',        // unilateral is drawn on the patient's right
  areas: [ { levels: ['T10', 'T12'],         // two levels = inclusive range T10–T12; other lists are taken as given
             zones: ['anterior'],            // see below
             density: 'dense' | 'moderate' | 'patchy' } ],
  summary: 'T10–T12, …',                   // "Covers:" line and the at-a-glance strip
  mechanism: HTML, density: HTML, misses: HTML,
}
```
Levels: `T2`…`T12`, `L1`. Zones: `front-mid` (paramedian strip), `front-ant`, `front-lat` (flank), `back-med`,
`back-lat`; groups: `midline`, `anterior` (= mid + ant), `anterolateral`, `lateral` (front-lat + back-lat),
`posterior` (back-med + back-lat), `all`. Density is shown by fill strength **and** pattern (solid / hatched / dotted)
**and** words in the legend.

Torso coordinates (for `scene.probe`): each figure is 170 × 300, midline x = 85; patient's right is viewer-left on the
front, viewer-right on the back. Band centres at the midline: T2 62, T4 96 (nipples), T6 126 (xiphoid), T7 141 (scapula
tip on the back), T10 188 (umbilicus), T12 220, L1 240. Flank edge ≈ x 40/130 at the waist; ASIS (50, 236).
`angle` 0 = transverse probe, 90 = parasagittal; negative angles rotate anticlockwise.

## 6. Other helpers (`shared/js/ui.js`, `bmode.js`)
`stepper({steps:[{short, title, body}], idPrefix, scrollTo, onStep(i), label})` → `{el, go(i), keys(el), current}`: the
scan viewer's step-through look for your own figures (step buttons `#<idPrefix>-step-<n>` are deep links, Back / Next,
`onStep` redraws your figure, `keys(fig)` adds left/right arrow keys). Optional; local steppers keep working.
`bmode.js` also exports `buildBModeAsync(scene)` (phased build, yields to the browser), `isBuilt(scene)` and
`shadowDepthAt(scene, xMm)`; `scene.js` `warpY(prof, x, y)` accepts an array of profiles.
`el(tag, attrs, …children)`, `sv(tag, attrs, parent)`, `fill(node, html)`, `callout('key'|'warn'|'pearl'|'note',
{title, body})`, `keyPoints([…])`, `steps([{title, body}])`, `table({head, rows, caption, stack})` (cells: HTML or
`{th:true, html}`), `details({summary, body})`, `registerSearch([{title, text, id}])` for text inside SVG/canvas.
Use `tb-` classes from `truncal.css`; prefix page-only classes (`bk-`, `cw-`, `aw-`).

## 7. Checklist before handing over
- `python3 -m http.server` from the repo root; open `/truncal/<page>/`.
- Playwright at 390 and 1440 px: no console errors, `document.documentElement.scrollWidth <= innerWidth`,
  click every `#<id>-step-*` and look at the screenshots in both views; check labels don't collide at 390 px.
- Anatomy: layer order superficial → deep; `orient` words match the needle direction text.

## 8. Hooks for other sections (used by `head-neck/`)
The engine is also used by `head-neck/`, which imports these modules by relative path (`../../../truncal/shared/js/…`).
Changes here affect both sections: check `head-neck/` pages too. Three opt-in fields, ignored when absent:
- `coverage.map`: a function with the same arguments as `coverageMap(coverage, {id, title})` that returns the map
  figure (e.g. `headCoverageMap` from `head-neck/shared/js/head.js`), or `false` for no map (text only).
- `scene.probeInset`: a function with the same arguments as `probeInset(probe, opts)` for a different body outline;
  `probe.key` renames the "Probe" caption (e.g. "Needle entry").
- `scene.image: 'diagram'`: a schematic section with no simulated ultrasound (landmark blocks such as eye blocks); the
  Ultrasound/Diagram switch is hidden. `scene.stepTitles` renames the four steps (e.g. `['Landmarks', …]`).
