Part of the regional engine guide; index: ../INDEX.md

## 6. How-tos

### Add a block to an existing page

1. Add its scene to `js/scenes.js` (unique `id` with the page prefix; [`DATA.md` §4](data-04-scene-schema-scan-viewer.md#4-scene-schema-scan-viewer)),
   with `desc` and, where the plexus data has the nerve, `ids` on the key structures.
2. Add the block object to `js/blocks.js` ([`DATA.md` §3](data-03-block-schema-renderblock.md#3-block-schema-renderblock)); use the region's
   figure provider for `coverage.map` and `scene.probeInset`.
3. Add a chapter `{ id: 'ch-<blockId>', title, short, desc, block }` in `js/page.js`, and a tile if it answers a
   common need.
4. Add a registry entry (§3.5) and, if operations should point at it, a link key in the region's ops module.
5. Bump `js/page.js?v=` in the page and run the tests (§7).

### Add a region page

1. Copy `truncal/abdominal-wall/` (the reference page) and change title, description, breadcrumbs and paths
   ([`DATA.md` §1](data-01-page-template-truncal-page-index-html.md#1-page-template-truncalpageindexhtml)). Keep `noindex` and the footer credit.
2. Write `js/page.js` with `bootPage({…, backLabel, backShort})`.
3. Link it from its region landing; add it to `PAGES` (and `PAGES_BY_REGION`) in `blocks/blocks.js` and to its
   region's `pages` in `REGION_NAV` (`js/appnav.js`, the desktop rail). A brand-new
   region also needs a `REGIONS` entry in `registry.js`, an ops module, a figure provider and a `shared/us/` folder.
4. Add it to `PAGES` and `ENGINE_PAGES` in `shared/regional/test/lib.mjs` so the smoke, deep-link, level and data suites
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
download those again). `--check` only checks; `shared/regional/test/version.test.mjs` fails when it is out of date. The worker
answers only the regional paths and the shared site files they load; everything else (home, `mo/`, `qbank/`,
`babymo/`, `exams/`) passes straight through. `regional.html` doesn't register it but is served offline once saved.

### Add a plexus dataset

1. Add `plexus/js/data/<id>.js` (§3.7) and its model files in `plexus/model/` (GLB plus nerve paths JSON), with a
   `credits` line for the model's source and licence.
2. Add the plexus to `PLEXUSES` in `plexus/js/explorer.js` (anatomical order) and bump its `V` and the
   `explorer.js?v=` references.
3. Add the id to the plexus list in `shared/regional/test/data.mjs`, then point block data (`anatomy3d`), registry entries and
   scene `ids` at its elements and blocks.

### Add an operation to the chooser

1. Add an entry to `OPS` in the region's `shared/regional/js/ops/ops-*.js`, following the schema comment at the top.
2. Every key in `groups[].items[].blocks` (and `more`) must exist in that file's links; doses must match the block
   pages word for word (`data.mjs` checks; a reviewed difference goes in `shared/regional/test/data-allow.json` with a reason).
3. Check it on the region landing (`#op-<id>`) and on `/blocks/` (`#op-<region>-<id>`).

---
