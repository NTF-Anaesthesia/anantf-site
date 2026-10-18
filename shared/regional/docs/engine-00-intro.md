Part of the regional engine guide; index: ../INDEX.md

# Regional anaesthesia app: engine guide

How the regional anaesthesia app is built, so you can maintain and extend it without reading all the code first.
The full data schema (every block, scene and coverage field, page template, levels detail) is in
[`DATA.md`](../DATA.md); this guide links to it rather than repeating it. Test details are in
[`shared/regional/test/README.md`](../test/README.md).

Static ES modules, no build step, no CDN. Everything is plain files served by GitHub Pages, with one root service worker,
`/regional-sw.js`, for offline use (regional paths only; §6 "Stamp the offline worker").

---
