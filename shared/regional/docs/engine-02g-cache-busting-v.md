Part of the regional engine guide; index: ../INDEX.md

### Cache-busting (`?v=`)

- Entry points carry `?v=YYYYMMDD`: `js/page.js?v=…` and `regional.css?v=…` in each page, and `landing.js?v=…` on
  landings. Bump them when you change what they load. Under `blocks/`, `pagebar.js?v=` and `chooser.js?v=` (shared by `/blocks/`, Safety, Indication and Ultrasound) follow the same date. `static.mjs` allows digits only in `js/page.js?v=`, so for a
  second bump on the same day use the next date, not a letter suffix.
- **Stateful modules must load under one URL per page**, or they run twice and split their state. `levels.js` and
  `figures/head.js` are always imported as `…?v=20261015`, `offline.js` as `…?v=20261016`, `appnav.js` as `…?v=20261026` and `skin.js` as
  `…?v=20261018`, from every module and every app. `skin-app.css` is one URL on every page (`?v=20261026`); bump it on every page that links it. If you bump one, change
  every import of it in the same commit (grep for the file name). Other engine modules import each other without a
  query. `smoke.mjs` fails on a stateful module loaded under two URLs.
- Never write `?v=…?v=…` (`static.mjs` checks).
- `plexus/js/explorer.js` has its own `V` constant for its dynamic imports (data files, viewer, diagram); bump it when
  you change those files, together with the `explorer.js?v=` in `plexus/index.html` and `plexus/js/app.js`.

---
