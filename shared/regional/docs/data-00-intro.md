Part of the regional data guide; index: ../INDEX.md

# Regional blocks: shared engine, data schema and page wiring

For the architecture, data flow, ultrasound look, how-tos, tests, ownership and backlog, start with
[`ENGINE.md`](../ENGINE.md). This file is the full data schema.

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
  js/la.js, lacalc.js local anaesthetic dose maths (no DOM) and the dose calculator form (the Dose calculator half of /blocks/safety/)
  js/decide.js        the "If it goes wrong" decision guides; their data is js/data/decisions.js
  js/offline.js       registers the offline worker /regional-sw.js; app version lines on /blocks/
  (blocks/)           chooser.js (operation data + the chooser component, shared by /blocks/ search and /blocks/indication/),
                      pagebar.js (the bar of the small screens), safety/, indication/ and ultrasound/ (each with its own script)
  css/levels.css      level control and tier hiding (body[data-tier-max] hides [data-tier] above it)
```

The old paths (`truncal/shared/js/*.js`, `truncal/shared/css/truncal.css`, `head-neck/shared/js/head.js`,
`lower-limb/shared/js/leg.js`) are one-line re-export shims so cached pages keep working. Don't import through them.

Static ES modules, no build step, no CDN. Import with relative paths, e.g. `../../../shared/regional/js/shell.js` from `truncal/<page>/js/`.

---
