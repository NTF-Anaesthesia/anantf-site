Part of the regional data guide; index: ../INDEX.md

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
