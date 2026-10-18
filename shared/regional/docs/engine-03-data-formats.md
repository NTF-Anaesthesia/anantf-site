Part of the regional engine guide; index: ../INDEX.md

## 3. Data formats

### 3.1 Block

Full schema: [`DATA.md` §3](data-03-block-schema-renderblock.md#3-block-schema-renderblock). Text fields are trusted HTML.

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

Each dose box ends with "Check the dose for this patient", a link to `/blocks/safety/?agent=&pct=&ml=&adr=#calculator`. It is
prefilled only when the dose names exactly one agent and gives one strength and one volume (no ranges, no ml/kg);
`dose.calc: false` hides it. Block dose text is still free text (§9).

### 3.2 Scene (scan viewer)

Full schema: [`DATA.md` §4](data-04-scene-schema-scan-viewer.md#4-scene-schema-scan-viewer). Millimetres; `x` across, `y` depth; superficial to deep.
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
| Trunk (default) | `coverageMap` (`dermatomes.js`, used when `coverage.map` is absent) | `probeInset` (default) | levels T2–L1 and torso zones: [`DATA.md` §5](data-05-coverage-schema-dermatome-map.md#5-coverage-schema-dermatome-map) |
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
data's own `anatomy3d` / `watch` win over the registry. Details: [`DATA.md` §9](data-09-the-regional-app-as-a-whole-levels.md#block-registry-jsregistryjs).

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
  are at `blocks/safety/#wrong` and `#wrong-<guide>` (which opens it; `/blocks/#wrong…` redirects there).
- **brachial-plexus/** shows `guidesFor(<block>, 'upper-limb')` in the Block guide tab, after Complications (MO level),
  ids `<block>-wrong-<guide>`; the app's own `#block=…&tab=…` hash is unchanged (guides have no deep link there).
- **spinal/** shows the neuraxial set without "pain on injection" (its paraesthesia tree covers that) at the end of
  Troubleshooting: heading `#ts-wrong` (in the Topics list), each guide at `#ts-wrong-<guide>` (which opens it).
- Apps that don't load `regional.css` wrap the list in `.ra-dg-host`: `decide.css` gives it the engine tokens and the
  `tb-btn` / `tb-details` styles, and the app may map the tokens to its own (spinal does, so its dark mode follows).
- To add a guide: add it to `GUIDES` and `GUIDE_ORDER`, map it in `EXTRA_GUIDES` (or `CORE_GUIDES`), and run `data.mjs`
  (`validateGuide`: every step reachable, every target exists, no loops, an end).

---
