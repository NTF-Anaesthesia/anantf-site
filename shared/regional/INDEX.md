# Regional anaesthesia app: index

Start here, then open only the one piece your task needs. `ENGINE.md` and `DATA.md` are now short stubs that point to the pieces in `docs/`.

## What the app is

The regional anaesthesia app is the set of teaching pages for regional blocks: upper limb, lower limb, truncal, head and neck, the neuraxial page in `spinal/`, the plexus explorer in `plexus/`, and the front door at `blocks/`. They share one engine in `shared/regional/`: a block template, levels (MO · Resident · Consultant), an ultrasound scene viewer with real scans from `shared/us/`, a block registry, the dose calculator, "If it goes wrong" guides, and an app frame with two looks and an offline service worker (`regional-sw.js`). Doses, LAST lines and "If it goes wrong" guides are always MO level.

## Task → read this

| Task | Read |
|---|---|
| How the code fits together | [engine-02](docs/engine-02-architecture.md) and its parts 02a–02g |
| Add a block to an existing page | [engine-06](docs/engine-06-how-tos.md), then [data-03](docs/data-03-block-schema-renderblock.md) |
| Add a region page | [engine-06](docs/engine-06-how-tos.md), then [data-01](docs/data-01-page-template-truncal-page-index-html.md) and [data-02](docs/data-02-js-page-js-bootpage-config.md) |
| Add a real scan with overlay | [engine-06](docs/engine-06-how-tos.md), then [engine-03](docs/engine-03-data-formats.md) §3.4 and [data-04](docs/data-04-scene-schema-scan-viewer.md) |
| Doses and the calculator | [engine-02a](docs/engine-02a-modules-in-shared-regional-js.md) (`la.js`, `lacalc.js`), then [data-03](docs/data-03-block-schema-renderblock.md) (dose boxes) |
| "If it goes wrong" guides | [engine-03](docs/engine-03-data-formats.md) §3.8 |
| Levels | [engine-04](docs/engine-04-levels.md), then [data-02b](docs/data-02b-levels-mo-resident-consultant.md) |
| App frame, skins | [engine-02d](docs/engine-02d-app-frame-desktop-layout-page-changes.md), [engine-02e](docs/engine-02e-skins-website-look-and-app-look.md) |
| Offline worker and stamp | [engine-06](docs/engine-06-how-tos.md) ("Stamp the offline worker") |
| Plexus 3D | [engine-03](docs/engine-03-data-formats.md) §3.7, then [engine-06](docs/engine-06-how-tos.md) ("Add a plexus dataset") |
| Ultrasound look | [engine-05](docs/engine-05-ultrasound-look.md) |
| Tests | [engine-07](docs/engine-07-tests.md) |
| Folder map | [layout](docs/layout.md) |
| Backlog, next steps | [STATUS.md](STATUS.md), then [engine-09](docs/engine-09-known-limits-and-backlog.md) |

## Session checklist

1. Read this index, then one piece only.
2. After any change, run `node shared/regional/tools/stamp.mjs`, then `node shared/regional/test/run-all.mjs`.
3. Take screenshots only for visual changes: one, at viewport size.
4. Don't read `shared/vendor/`, the images in `shared/us/`, or the test baselines.
