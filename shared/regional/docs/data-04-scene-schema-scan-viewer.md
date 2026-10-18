Part of the regional data guide; index: ../INDEX.md

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
