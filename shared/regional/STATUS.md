# Regional app: status (17 Oct 2026)

**State.** Everything built so far is merged to `main` (pull request 147) and live; nothing is half-done in the code. The branch
`release/regional-app-v2` keeps this version. All 13 suites in `node shared/regional/test/run-all.mjs` pass.

**Next steps, in rough order** (the full backlog is in `ENGINE.md` §9):
1. Real scan view on phones: after tapping Next the image can sit just above the screen. Fix by docking the picture or moving
   the step buttons (the website look has the same failure on one knee scan).
2. Brachial diagram: the clickable SVG points are 20 to 38 px tall; they need 44 px targets (the code is in `brachial-plexus/`).
3. Animations for iPACK, genicular, obturator, saphenous and sciatic blocks: Dr Chew Shi Hao's call.
4. The brachial app still has its own scan teacher (`brachial-plexus/js/ultrasound.js`); port it to the engine scene schema.
5. Dose text is free text; structured `{agent, pct, ml}` dose fields would let the calculator and dose boxes share one source.
6. Not built: a single-page app (`#/block/<id>`).
