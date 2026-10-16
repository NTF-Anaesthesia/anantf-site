# Regional blocks: shared engine, data schema and page wiring

For the architecture, data flow, ultrasound look, how-tos, tests, ownership and backlog, start with
[`ENGINE.md`](ENGINE.md). This file is the full data schema.

Everything in `shared/regional/` (moved from `truncal/shared/` on 15 Oct 2026) is used by the truncal pages
(`truncal/back/`, `truncal/chest-wall/`, `truncal/abdominal-wall/`), the head and neck, lower-limb and upper-limb pages.
**Pages do not edit `shared/regional/`**: they supply data. `truncal/abdominal-wall/` is the
reference implementation: copy its structure.

```
shared/regional/
  css/regional.css    all shared styles (prefix tb-; was truncal.css). Page-only styles go in <page>/page.css with a page prefix.
  js/shell.js         bootPage(config): hub, chapters, hash routing, the one sticky app bar (home, chapter menu, search,
                      copy link, MO · Res · Con level control), level hints, search, pager
  js/block.js         renderBlock(block, host): one block chapter from a data object (called by the shell)
  js/scan.js          mountScan(host, scene, {blockId}): the interactive scan viewer (called by block.js)
  js/scene.js         scene geometry, shape constructors E/P/PS/L, LA spread and tissue warp
  js/bmode.js         simulated B-mode ultrasound from a scene (cached per scene id; built in phases off idle time)
  js/diagram.js       idealised labelled diagram from the same scene
  js/dermatomes.js    coverageMap(coverage), probeInset(probe), OUTLINE (torso outlines) — original drawings
  js/refs.js          cite() / citeEl(): kept for old data, render nothing (no sources or references on these pages)
  js/search.js        page search + synonyms (addSynonyms via config.synonyms)
  js/ui.js            el, sv, fill, callout, keyPoints, steps, stepper, table, details, registerSearch, …
  js/levels.js        MO / Resident / Consultant level system (getLevel, setLevel, onLevel, mountLevelControl, …)
  js/status.js        block-status colours and line styles (target, covers, variable, spares), shared with
                      brachial-plexus/ and plexus/; css/status.css holds the same tokens as CSS variables
  js/registry.js      block id → {title, region, url, aliases, anatomy3d?, watch?} across all regions
  js/realscan.js      the "Real" scan view (open-licence images with label pills)
  js/figures/         head.js (head and neck figures), leg.js (lower-limb figures), arm.js (upper-limb figures)
  js/la.js, lacalc.js local anaesthetic dose maths (no DOM) and the dose calculator form (/blocks/calculator/)
  js/decide.js        the "If it goes wrong" decision guides; their data is js/data/decisions.js
  js/offline.js       registers the offline worker /regional-sw.js; app version lines on /blocks/
  css/levels.css      level control and tier hiding (body[data-tier-max] hides [data-tier] above it)
```

The old paths (`truncal/shared/js/*.js`, `truncal/shared/css/truncal.css`, `head-neck/shared/js/head.js`,
`lower-limb/shared/js/leg.js`) are one-line re-export shims so cached pages keep working. Don't import through them.

Static ES modules, no build step, no CDN. Import with relative paths, e.g. `../../../shared/regional/js/shell.js` from `truncal/<page>/js/`.

---

## 1. Page template (`truncal/<page>/index.html`)

Copy `truncal/abdominal-wall/index.html` and change only: `<title>`, `<meta name="description">`, the last
breadcrumb (`<span aria-current="page">Chest wall</span>`), and `page.css` if you have one. Keep:

- `<html lang="en-GB" data-theme="light">`, `<meta name="robots" content="noindex, nofollow">`, `<meta name="color-scheme" content="light">`
- the site header (`ntf-header`, links `../../…`), breadcrumbs **Resources / Regional anaesthesia / Truncal blocks / <Page>**
  (`../../resources.html`, `../../regional.html`, `../`)
- `<div id="tb-bar"></div>` (the shell fills it), `<main id="main" class="site-container">` (the shell fills it; a
  `<noscript>` inside is fine), `<div id="tb-live" class="tb-sr" aria-live="polite" aria-atomic="true"></div>`
- the `tb-foot` block (the credit **"Created by Dr Koh Wenjun and <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>,
  NTF Anaesthesia"**, only here at the foot of the page and never at the top, with a link back to `../`; no "for
  education only" notice, since the app is for the department's own juniors), then `ntf-footer`
- `<body class="tb-app">`, stylesheets `../../assets/navigation.css`, `site-shell.css`, `header-nav.css`,
  `../../shared/regional/css/regional.css?v=20261017` (it imports `appnav.css`: desktop frame and rail, bar auto-hide,
  view transitions), and `<script type="module" src="js/page.js?v=20261017"></script>`
- nothing else for the desktop layout: the shell wraps `<main>` in `.ra-frame` with the rail (ENGINE.md §2 "App frame")

## 2. `js/page.js`: `bootPage(config)`

```js
import { bootPage } from '../../../shared/regional/js/shell.js';
import { BLOCKS } from './blocks.js';
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
  synonyms: [['sap', 'serratus']],                 // optional extra search synonym rows
  hubExtra: '<p>optional HTML appended to the hub</p>',
  // App shell options (all optional):
  backLabel: 'See all lower-limb blocks and the operation chooser',  // hub link back to the region landing
  backShort: 'Lower-limb blocks',                   // bar Home label on the hub (default: the breadcrumb's last link)
  backHref: '../',                                  // region landing (default: the breadcrumb's last link)
  home: '/blocks/',                                 // the front door link; false = none (default: on once /blocks/ is live)
  level: true,                                      // false = no level control, no tier hiding, no hints
});
```

- **Defaults.** `backLabel` defaults to "See all <breadcrumb parent, lower case> and the block chooser"; the hub
  shows no credit (it is in each page's footer; `DEFAULT_CREDIT` is still exported). Don't patch the hub link text from page code (the old `fixHubBack()`): set `backLabel`.
- **One sticky bar.** Inside app pages the site header scrolls away (`body.tb-app .ntf-header{position:static}`) and only
  `#tb-bar` sticks (56 px; CSS variable `--ra-bar` on `:root`). Deep-link targets land just below it
  (`scroll-padding-top` / `scroll-margin-top: calc(var(--ra-bar) + 8px)`); stick your own sticky things at
  `top: var(--ra-bar-now, var(--ra-bar, 56px))`, so they move up with the bar when the reader has turned on "Hide the
  bar while scrolling down" (Settings; `--ra-bar-now` is `0px` while the bar is away). Programmatic jumps never
  smooth-scroll.
- **Bar contents.** Home (on a chapter: this page's hub; on the hub: ← the region landing, `backShort`), Chapter ▾
  (inline links at ≥ 1240 px when they fit, else the menu), Search, Copy link (on phones ≤ 600 px it moves into the
  chapter menu, which then spans the bar width), and the level control. The chapter menu also lists the region landing,
  (when set) the front door and **Settings** (`/blocks/settings/`). On phones the breadcrumb collapses to one
  "← <region>" line. From 1024 px the chapters are also in the rail beside the page, so the bar shows the chapter menu
  (the current chapter's name) rather than repeating the list inline.
- **Desktop.** From 1024 px: the rail (this page's chapters, the region's pages, the other regions, the tools) inside
  the site's 1240 px column; nothing to set in the data.
- **Chapter `tier`.** `{ id, title, …, tier: 3 }` tags the chapter, its hub entry and its menu entries; a link or search
  result into it relaxes the level for that view.

- A chapter has either `block` (rendered by `renderBlock`) or `render(sec)` (your own content; you add the `h2`), or both.
- **Headings.** Author every chapter as **h2 title > h3 > h4** (as now). After it renders, the shell gives the chapter
  one visible `h1`: with a single `h2`, every heading moves up one level (h2 → h1, h3 → h2, h4 → h3) and keeps its look
  through the classes `tb-ch-title`, `tb-hv3`, `tb-hv4` (the authored level); with several `h2`s only the first becomes
  the `h1`. Ids and attributes are kept, so `aria-labelledby` and deep links still work. In page CSS, style headings by
  class or id rather than by tag (`.tb-chapter>h3` in page CSS no longer matches; the shared CSS now covers the 48px
  top margin those rules gave).
- **Kickers.** A `.tb-eyebrow` that starts a chapter (a block's `kicker`, or one you add before your `h2`) is merged into
  the "Chapter n of m" line, so there is one kicker: "Chapter 2 of 7 · Back · Paraspinal fascial plane".
- **No sources or references.** The owner asked for these pages to carry no citation numbers, source tags,
  "Sources." lines or References chapter, and no attribution in the prose ("the teaching slides give…",
  "(teaching slide 147)", "et al."). Write the content plainly. Named guidelines may appear as content
  ("PROSPECT recommends…"). `refs` / `refsIntro` in the config are ignored.
- Sticky bar: Hub link and chapters are one `nav`; on screens under 1240 px the chapters are a disclosure menu
  (`#tb-chmenu-btn`), not a `<select>`. Search opens with Ctrl+K / Cmd+K, or "/" when not typing in a box (the reader
  can turn "/" off in Settings, WCAG 2.1.4).
- Old deep links to the removed References chapter (`#ch-refs`, `#ref-…`) land on the hub.
- Chapter ids must start `ch-`. A block chapter should be `ch-<blockId>`.

### Routing and deep links
- `#ch-x` shows that chapter. Any other hash is an element id: the shell shows the chapter that contains it, opens
  `<details>` ancestors and scrolls. Browser Back/Forward work. Empty hash = hub.
- An element with `data-activate` is **clicked** after scrolling, and `data-scroll-to="<id>"` scrolls to that element
  instead. The scan viewer uses this, so these deep links work for every block with a scene:
  - `#<blockId>-step-scan`, `#<blockId>-step-identify`, `#<blockId>-step-needle`, `#<blockId>-step-inject`
  - `#<blockId>-inj-<injectionId>` (selects that injection, e.g. `#ql-inj-ql3`)
- Section ids made by the block renderer: `#<id>-position`, `-equipment`, `-landmarks`, `-approach`, `-sonoanatomy`,
  `-target`, `-dose`, `-dose-check`, `-coverage`, `-anatomy3d`, `-watch` (`-watch-anim` is the disclosure), `-complications`,
  `-wrong` (each guide `-wrong-<guide>`), `-pearls`, `-exam`, `-<sectionId>` (extra sections), `-scan` (the viewer), `-covmap`, `-exam-1…`.
- A deep link to content the reader's level hides shows it for that view (see §2b).
- Cross-page links: `../back/#esp-step-needle` etc.
- Ready signal for tests: `body[data-tb-ready="true"]`; event `tb-ready`; `tb-chapter` fires on chapter change.

## 2b. Levels (MO / Resident / Consultant)

`shared/regional/js/levels.js` (styles in `css/levels.css`, imported by `regional.css`). Levels are cumulative:
MO shows tier 1, Resident tiers 1–2, Consultant everything. Any element may carry `data-tier="1|2|3"`; untagged
elements always show. The reader's choice is saved in `localStorage['ra-level']` (spinal's old keys migrate once) and
never goes in the URL. With nothing saved the level is **Consultant** (everything shows).

The shell: mounts the control in the bar, shows a one-time "How much detail do you want?" picker on the hub, adds a
"n items hidden at MO level in this chapter · Show all" line under each chapter's header (Show all raises the level for
this view only), and relaxes the level (never saved) when a deep link or a search result points at hidden content. While
relaxed, that hint line reads "Showing Consultant content for this view · Back to MO" (on wide screens the bar has a
"Back to MO" button too; on phones the hint is the only one, so nothing covers the text). The hub's chapter list has
the same hint when the level hides chapters. If the reader lowers the level while reading a chapter it hides, the
chapter is replaced by a short "Hidden at your level · Show it" card (never a blank page). Search lists hidden matches
with "(Resident)" / "(Consultant)" after the chapter name, and links to the matched text itself, so opening one shows it.

Import `levels.js` (and `figures/head.js`) as `…/levels.js?v=20261015` from every module, as the engine, spinal,
brachial-plexus, plexus and /blocks/ do: a second URL would load a second copy with its own level state.

API (frozen): `getLevel()`, `setLevel(l, {save})`, `onLevel(fn) → unsubscribe`, `mountLevelControl(host)`,
`relaxFor(el)`, `withScrollAnchor(fn)`, `countHidden(root)`, `applyLevel()`; helpers `tierOf(el)`, `tierMax()`,
`hasChosenLevel()`, `mountLevelPicker(host)`, `hiddenHint(root)`, `tierBadge(t)`, `TIER_NAMES`.

**Default tiers in `renderBlock`** (so blocks are tiered with no data edits):

| Tier | Sections |
|---|---|
| 1 MO | header, summary, "Use it for", at a glance, `rapid`, `intro`, scan viewer, position, equipment, **dose box + LAST line**, **complications**, **If it goes wrong**, the **first 3 pearls**, `warning`, any section with `safety: true`, extra sections titled "Contraindications…" |
| 2 Resident | landmarks, approach, sonoanatomy, target, coverage, Anatomy in 3D, Watch the animation, remaining pearls, exam corner, other extra `sections[]` |
| 3 Consultant | extra sections with id `consultant`, `frontier`, `catheter(s)`, `nerve-stim…`, `landmark(s)`, `approaches`, `alt`, or titled "Consultant corner", "Frontier…", "Catheters", "Nerve stimulat…", "Alternative: …", "Landmark technique…", "Before ultrasound: landmark…" |

Overrides, in data:
- `tiers: { approach: 1, exam: 3 }` on a block changes a top-level section's tier.
- `{ id, title, html, tier: 3 }` or `safety: true` on an extra section.
- Any section value or list item may be `{ tier: n, html }` (or `{ safety: true, html }`) instead of a plain string:
  a pearl `{ safety: true, html: '…' }` is promoted to MO. Plain strings inherit their section's tier.
- `exam: [{ q, points, tier: 3 }]`.
- **Safety rule:** `dose`, `complications` and `wrong` (the "If it goes wrong" guides) are always tier 1, whatever the
  data says (`SAFETY_KEYS`, enforced in `block.js` and by `test/regional/levels.mjs` and `data.mjs`). Region pages may
  promote, never demote, safety content. An extra section that carries a dose an MO may give or look after (a catheter
  regimen, a separate injection in an MO-visible scan viewer) should be MO level too (`safety: true` or `tier: 1`).

Badges ("Resident", "Consultant") are added by the engine on the first section of each run of that tier, as their own
line above the heading. Long prose sections at tier 2–3 (more than 3 paragraphs, prose only) keep their first paragraph
and fold the rest into a "Read more: <title>" disclosure; deep links and search open it.

## 3. Block schema (`renderBlock`)

All text fields are **trusted HTML strings** (or arrays of HTML strings rendered as a list). Don't add citations:
`cite()` from `shared/regional/js/refs.js` still exists but renders nothing.

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
| `dose` | `{volume, conc, drug, per, note, calc?}` or `{html, note, calc?}` | dose box: "20–30 ml of dilute 0.3% ropivacaine per side" + note + LAST reminder (a `source` field is ignored), then "Check the dose for this patient" (`#<id>-dose-check`), a link to `/blocks/calculator/?agent=&pct=&ml=&adr=`. The link is prefilled only when the dose names exactly one agent with one strength and one volume (no ranges, no ml/kg); `calc: false` leaves it out |
| `last` | string | override the LAST line (default: "Keep the total dose within the maximum for the patient’s weight, especially with bilateral blocks or when combining blocks.") |
| `coverage` | Coverage (§5) | map + "Covers" + Mechanism + "How dense, how reliable" + "What it misses" |
| `complications` | HTML or HTML[] | section |
| `wrong` | guide id[] or `false` | "If it goes wrong" section, after complications, always tier 1: the core guides plus those `EXTRA_GUIDES` in `js/data/decisions.js` gives this block id or region, plus any ids listed here; `false` hides it. Anchors `#<id>-wrong` and `#<id>-wrong-<guide>`; it links to `/blocks/#wrong`. Guide schema: [`ENGINE.md` §3.8](ENGINE.md#38-if-it-goes-wrong-guides-datadecisionsjs) |
| `pearls` | HTML[] | "Practical pearls" list |
| `sections` | `[{id, title, html, render(sec), tier?, safety?}]` | extra sections, inserted before the exam corner |
| `rapid` | HTML or HTML[] | "The 20-second version" key box under the header (tier 1) |
| `tiers` | `{key: 1\|2\|3}` | override the default tier of a top-level section (see §2b) |
| `anatomy3d` | `{plexus, block?, el?, brachialApp?}` or `{app: 'brachial-plexus', block, el?, tab?}`; `false` = none | "Anatomy in 3D" card: a link to `/plexus/#plexus=…&block=…` (or `/brachial-plexus/#block=…&tab=…`) and, for `plexus`, an "Open here" button that imports `plexus/js/explorer.js` (`mountExplorer`) only when tapped. With `plexus`, `brachialApp: {block?, el?, tab?}` adds an "Open in the brachial plexus app" link next to it (upper-limb pages). Falls back to `registry.js` (`getBlock(id).anatomy3d`) when absent |
| `watch` | `{anim, variant?, caption?, label?}`; `false` = none | "Watch it done" disclosure for Dr Chew Shi Hao's animation (`lower-limb/anim/?embed=1#anim/variant`). The iframe is made on first open and removed on close; one per page. Falls back to `registry.js` |
| `exam` | `[{source, q, points[], id?}]` | Exam corner; `source` is the exam name only ("MMed OSCE 2025", "Practice question"), no provenance in brackets; `points` sit in a "Model answer points" disclosure |

Doses: keep the values as they are. Paravertebral: **0.3–0.5%** ropivacaine.

## 4. Scene schema (scan viewer)

Units are **millimetres**. `x` runs across the screen from the left edge (0 … `width`); `y` is depth from the skin
(0 … `depth`). Order everything **superficial to deep**. Both views (simulated ultrasound and diagram) are drawn from
the same data, so labels, needle and spread line up.

```js
import { E, P, PS, L } from '../../../shared/regional/js/scene.js';
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
- **Out-of-plane needle:** set `entry` within about 0.5 mm of `tip`, so only the bright tip dot shows (as in `hn-fa-ppf`).
- **A second scan viewer inside a section:** `lower-limb/knee`, `head-neck/scalp` and `head-neck/airway` have a local
  `extraScan(scene, blockId)` helper in `js/blocks.js`; use it as a section's `render` (e.g.
  `render: extraScan(SCENES.atn, 'atn')`), so its deep links are `#<blockId>-step-*`.

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

## 6. Other helpers (`shared/regional/js/ui.js`, `bmode.js`)
`stepper({steps:[{short, title, body}], idPrefix, scrollTo, onStep(i), label})` → `{el, go(i), keys(el), current}`: the
scan viewer's step-through look for your own figures (step buttons `#<idPrefix>-step-<n>` are deep links, Back / Next,
`onStep` redraws your figure, `keys(fig)` adds left/right arrow keys). Optional; local steppers keep working.
`bmode.js` also exports `buildBModeAsync(scene)` (phased build, yields to the browser), `isBuilt(scene)` and
`shadowDepthAt(scene, xMm)`; `scene.js` `warpY(prof, x, y)` accepts an array of profiles.
`el(tag, attrs, …children)`, `sv(tag, attrs, parent)`, `fill(node, html)`, `callout('key'|'warn'|'pearl'|'note',
{title, body})`, `keyPoints([…])`, `steps([{title, body}])`, `table({head, rows, caption, stack})` (cells: HTML or
`{th:true, html}`), `details({summary, body})`, `registerSearch([{title, text, id}])` for text inside SVG/canvas.
Use `tb-` classes from `regional.css`; prefix page-only classes (`bk-`, `cw-`, `aw-`).

## 7. Checklist before handing over
- `python3 -m http.server` from the repo root; open `/truncal/<page>/`.
- Playwright at 390 and 1440 px: no console errors, `document.documentElement.scrollWidth <= innerWidth`,
  click every `#<id>-step-*` and look at the screenshots in both views; check labels don't collide at 390 px.
- Anatomy: layer order superficial → deep; `orient` words match the needle direction text.

## 8. Hooks for other sections (used by `head-neck/`)
The engine is also used by `head-neck/`, which imports these modules by relative path (`../../../shared/regional/js/…`).
Changes here affect both sections: check `head-neck/` pages too. Three opt-in fields, ignored when absent:
- `coverage.map`: a function with the same arguments as `coverageMap(coverage, {id, title})` that returns the map
  figure (e.g. `headCoverageMap` from `shared/regional/js/figures/head.js`), or `false` for no map (text only).
- `scene.probeInset`: a function with the same arguments as `probeInset(probe, opts)` for a different body outline;
  `probe.key` renames the "Probe" caption (e.g. "Needle entry").
- `scene.image: 'diagram'`: a schematic section with no simulated ultrasound (landmark blocks such as eye blocks); the
  Ultrasound/Diagram switch is hidden. `scene.stepTitles` renames the four steps (e.g. `['Landmarks', …]`).

---

## 9. The regional app as a whole (levels, registry, scan teacher, figures, `/blocks/`)

The engine pages, `brachial-plexus/`, `plexus/`, `spinal/` and the front door `blocks/` form one app: the same app bar,
the same credit line in the page footer ("Created by Dr Koh Wenjun and Dr Chew Shi Hao, NTF Anaesthesia" with
Dr Chew Shi Hao linked to https://chewshihao.com/), the same level control and the same status colours.

### Levels outside the engine
The rules are in §2b. Pages that are not built by `bootPage` (`brachial-plexus/`, `plexus/`, `spinal/`, `blocks/`) use
the same module: call `applyLevel()` once, `mountLevelControl(host)` in their bar, and tag content with `data-tier`.
Their mapping (plan §5): brachial plexus MO = core blocks, set-up, the 5 steps, complications; Resident = sonoanatomy,
coverage, exam questions, levels table; Consultant = the Advanced blocks (superior trunk, costoclavicular, RAPTIR) and
"why choose". Plexus: "Blocks that reach it" is tier 1, element and block notes tier 2. Spinal: its old tiers carry over
(1 MO, 2 Resident, 3 Consultant; "Pearls only" at Consultant). Never put the level in a URL; deep links call `relaxFor`.
Safety content (dose, LAST, complications) is tier 1 everywhere.

### Block registry (`js/registry.js`)
One entry per block across every region, keyed by the block id used in the page data and in `#ch-<id>` /
`#<id>-step-<key>` links (brachial plexus blocks use that app's ids, `#block=<id>`):

```js
esp: { title: 'Erector spinae plane block',     // the page's own block title, word for word
       region: 'trunk',                         // REGIONS id: upper-limb, trunk, head-neck, lower-limb, neuraxial
       url: '/truncal/back/#ch-esp',            // site-absolute
       aliases: ['ESPB', 'erector spinae'],     // ops-module keys, abbreviations, other names (for /blocks/ search)
       anatomy3d: { plexus: 'lumbar', block: 'femoral', el? }   // or { app: 'brachial-plexus', block, tab? }; optional
       watch: { anim, variant? } }              // Dr Chew Shi Hao's animation (lower-limb/anim/); optional
```
API: `REGIONS`, `REGISTRY`, `getBlock(idOrAlias)`, `resolveId(idOrAlias)`, `blocksIn(region)`, `allBlocks()`,
`blockUrl(idOrAlias, base?)`, `anatomyLink(idOrAlias)`. An alias may not equal another entry's id, and every `url`
must point at a real anchor (`test/regional/data.mjs` checks both). Block data's own `anatomy3d` / `watch` win over the
registry. **When you add a block to any region, add its registry entry**, or it will be missing from `/blocks/` search
and the region cards there.

### Operation data (`js/ops/`)
`ops-truncal.js`, `ops-headneck.js`, `ops-lowerlimb.js`, `ops-upperlimb.js` hold the operations behind each region's "Which block for which
operation" chooser and the merged chooser on `/blocks/` (data only, plus each region's coverage-figure function). Each
exports `REGION {id, title, path}`, `OPS`, `BLOCK_LINKS` (head-neck, lower-limb and upper-limb also `LINKS`: key → [href, name]), `BLOCK_NAMES`, `PAGE_NAMES` and `blockHref(key, base)`; the
operation schema is in the comment at the top of each file. Links are relative to the region folder. Every block key
in `groups[].items[].blocks` must exist in that file's links (`data.mjs` checks). Edit an operation here once and both
the region landing and `/blocks/` change.

### Scan teacher fields (`js/scan.js`, `js/realscan.js`)
All optional; existing scenes work unchanged.
- `ids: ['<plexus>:<elementId>', …]` on a layer, line or shape: tapping it shows "See in 3D →"
  (`/plexus/#plexus=…&el=…`, or `/brachial-plexus/#el=…` for `brachial:`). The ids must exist in the plexus data.
- `desc: 'one line'` on a layer, line or shape: shown when the structure is tapped. Use wording that already exists in
  that block's sonoanatomy text.
- The "Structures in this view" chip legend is built from every labelled layer, line and shape (`label`, `short`).
  "Test me" (tier 2) appears when at least three structures are labelled.
- Coverage chips (Blocked / Variable / Spared) at the Inject step come from the block's `coverage`; nothing to add.
- `scene.realScans: [{ src, credit, licence, sourceUrl?, orientation?, alt?, caption?, labels: [{ text, x, y, tx?, ty?,
  ids? }] }]` (or `REAL_SCANS[blockId]` in `realscan.js`): adds the "Real" view. Open-licence images only, each with its
  credit and licence; label positions are fractions (0–1) of the image. Images by region and their licences are in
  `shared/us/<region>/sources.json` (fields in [`ENGINE.md` §3.4](ENGINE.md#34-real-scans-sharedusregionsourcesjson)).
  The colour key's "On" setting and Block view fill only labels with `block: true` plus nerves, arteries, needle and
  local anaesthetic: give a vein `block: true` if it should fill (as the internal jugular vein on the cervical images).
- Status colours and line styles (target, covers, variable, spares; injection marker; LA blue) come from `js/status.js`
  and `css/status.css`. Don't hard-code them in pages; a colour change is one line there.

### Figures (`js/figures/`)
- `head.js`: `headFigure(view, opts)`, `headCoverageMap(cov, {id, title})` (use as `coverage.map`),
  `headProbeInset(probe, opts)` (use as `scene.probeInset`), `viewsFigure({…})`, `OUTLINE`, `ZONES`.
- `leg.js`: `legFigure(view, opts)`, `legCoverageMap(cov, {id, title})`, `legProbeInset(probe, opts)`,
  `legViewsFigure({…})`, `OUTLINE`, `LANDMARKS`, `ZONES`, `GROUPS`, `VIEWS` (zone names in `lower-limb/shared/LEG.md`).
- `arm.js`: `armFigure(view, opts)`, `armCoverageMap(cov, {id, title})` (use as `coverage.map`),
  `armProbeInset(probe, opts)` (use as `scene.probeInset`), `OUTLINE`, `LANDMARKS`, `ZONES`, `GROUPS`, `VIEWS`. Zones
  and landmarks are written once in front-view coordinates; the back view mirrors them.
- The torso figures stay in `js/dermatomes.js`. SVG text must render at 12 px or more at 390 px wide.
- `head-neck/shared/js/head.js` and `lower-limb/shared/js/leg.js` are re-export shims; import from `figures/`.

### `/blocks/` (the front door)
`blocks/index.html`, `blocks.js`, `blocks.css`; noindex, linked only from `regional.html`. It writes no clinical text:
operations, block names and links come from `js/ops/` and `js/registry.js`, and its page list (`PAGES` in `blocks.js`)
points at existing chapters. It holds the level picker, the "I need to…" tiles, the merged chooser, search across
regions (registry + operations + pages + the region pages' synonyms), the "If it goes wrong" guides (`#wrong`,
`#wrong-<guide>`), the region cards and, at the foot, the app version lines (`mountAppVersion` from `offline.js`). The
dose calculator is `/blocks/calculator/` (`calculator.js` mounting `lacalc.js`). Settings is `/blocks/settings/`
(`settings.js`): the level control, "Hide the bar while scrolling down" (`ra-autohide`, off by default), "Press / to
search" (`ra-slash`, on by default) and the same app version lines.
- Deep links: `#op-<region>-<id>` (e.g. `#op-lower-limb-hipfx`); a bare `#op-<id>` works when the id is unique.
- A new region page or planner: add it to `PAGES` in `blocks.js`, to its region's `pages` in `REGION_NAV`
  (`js/appnav.js`, the desktop rail) and, if it is a new region, to `REGIONS` in the registry. A new operation: add it
  to the region's ops module only.

### Tests
`node test/regional/run-all.mjs` runs every suite (dose maths, static, offline worker stamp, smoke, deep links, levels,
data, content parity against the baseline, the app frame, offline) plus the `mo/` and `babymo/` suites; see `test/regional/README.md`. Run it after any change to a regional page.
