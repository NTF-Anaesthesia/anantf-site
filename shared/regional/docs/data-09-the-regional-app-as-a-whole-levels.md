Part of the regional data guide; index: ../INDEX.md

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
must point at a real anchor (`shared/regional/test/data.mjs` checks both). Block data's own `anatomy3d` / `watch` win over the
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
  `shared/us/<region>/sources.json` (fields in [`ENGINE.md` §3.4](engine-03-data-formats.md#34-real-scans-sharedusregionsourcesjson)).
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
regions (registry + operations + pages + the region pages' synonyms; its guide and planner results open `/blocks/safety/#wrong-<guide>` and `#doses`), Part I "Tools" (four rows), the region Parts and, at the foot, the app version lines (`mountAppVersion` from `offline.js`). The
dose calculator is the Dose calculator half of `/blocks/safety/` (`safety.js` mounting `lacalc.js`; the old `/blocks/calculator/` page only redirects there with its query). Settings is `/blocks/settings/`
(`settings.js`): the level control, "Hide the bar while scrolling down" (`ra-autohide`, off by default), "Press / to
search" (`ra-slash`, on by default) and the same app version lines.
- Deep links: `#op-<region>-<id>` (e.g. `#op-lower-limb-hipfx`); a bare `#op-<id>` works when the id is unique.
- A new region page or planner: add it to `PAGES` in `blocks.js`, to its region's `pages` in `REGION_NAV`
  (`js/appnav.js`, the desktop rail) and, if it is a new region, to `REGIONS` in the registry. A new operation: add it
  to the region's ops module only.

### Tests
`node shared/regional/test/run-all.mjs` runs every suite (dose maths, static, offline worker stamp, smoke, deep links, levels,
data, content parity against the baseline, the app frame, offline) plus the `mo/` and `babymo/` suites; see `shared/regional/test/README.md`. Run it after any change to a regional page.
