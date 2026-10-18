# Head and neck blocks notes

Lasting decisions for `head-neck/` (anantf.com/head-neck/). Engine and schema: `shared/regional/ENGINE.md` and `DATA.md`.

## What it is

Five pages on the shared regional engine: `cervical/`, `scalp/`, `face/`, `airway/`, `eye/`, plus a landing page with an
operation chooser. Content comes from Dr Koh's regional anaesthesia teaching notes; gaps are filled from published
sources, but no citations, source tags or reference lists are shown (owner's rule for the regional pages).
Published and unlisted (noindex): card on Regional, link from the Airway page. Not on the homepage.

## Rules and lessons

- Content is mine (`head-neck/**`); the engine, `shared/regional/js/figures/` and the real scans are the regional session's:
  ask before changing them. Head figures live in `shared/regional/js/figures/head.js`.
- Doses, the LAST line, complications and "If it goes wrong" guides are always MO level (tier 1). A section that carries
  a dose (e.g. the eye drugs section) needs `safety: true`, or `levels.mjs` warns.
- Real scans and colour key are data in `shared/us/head-neck/sources.json`; a vein or artery only fills with the key on
  if its label has `block: true`.
- Label overlaps in the simulated scans are fixed by moving `lab` / `at` in the scene, checked at 390 px.
- After any change under `head-neck/`: `node shared/regional/tools/stamp.mjs`, then `node shared/regional/test/run-all.mjs`.
- Never edit the engine to suit one page; use the opt-in hooks (`coverage.map`, `scene.probeInset`, `scene.image`).
