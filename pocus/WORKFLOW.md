# POCUS source-to-lecture workflow

This workflow was run on 19 October 2026 for the standalone RV lecture and supplied course files. It is an editorial and validation workflow, not a scheduled task.

1. Inventory the supplied PPTX/PDF files and compare their teaching sequence with the existing lecture. Extract PPTX slide text, notes and relationships; resolve each notes slide through its relationship target. Record original source slide/page for every retained asset.
2. Map material to learning questions and existing sections. Preserve named anchors and legacy numeric routes. Add a standalone route when the lecture should be usable independently; put it in the hub and series navigation.
3. Verify clinical changes against primary guidance. Distinguish source answers from new interpretation. Record corrections and omissions in `REVIEW.md`.
4. Extract original media from the PPTX archive. Keep raw files outside the public repository. Crop scanner identifiers, mask residual overlays, remove audio/source metadata, convert to H.264/yuv420p with faststart, and create metadata-free posters. Do not change playback speed. Inspect initial and later frames before publishing. Use the source figures rather than generated clinical imagery.
5. Record filename, slide/page, permission evidence, processing and SHA-256 for every derivative. For this expansion the catalog is `media/course-2026/manifest.json`; earlier media remain in `media/media-attributions.json`. Credit SCCM at every point of use. Embedded PDF videos cannot be recovered from a static PDF.
6. Run the checks below. Test desktop and narrow-screen layout, chapter controls, deep links, answer reveals, measurement presets and native video playback. Check that videos pause when leaving a section and that the console has no application errors.
7. Recheck main against the baseline, create a focused branch/PR, inspect the diff and validation result, squash merge, and verify the public route after GitHub Pages deployment. Follow the repository's merge instructions without adding another approval gate.

```sh
python3 pocus/test/content.py
python3 pocus/test/source-review.py
node --test pocus/test/model.test.cjs
```

## This run

- Standalone RV: eight chapters, 23 existing clinical cines, FAC/TAPSE lab, five clip questions, references and author credit.
- Source expansion: 21 sections across basics, cardiac acquisition, lung and cases; 62 additional cines with posters and seven PDF figures.
- Existing shock, eFAST, DVT and haemodynamics checked structurally; their content and simulations retained.
- Source review checks enforce coverage, attribution, hashes, absence of unreferenced new media, video attributes and unique static IDs.
- Clinical owner review remains distinct from source mapping, numerical tests and browser QA.
