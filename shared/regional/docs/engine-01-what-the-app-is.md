Part of the regional engine guide; index: ../INDEX.md

## 1. What the app is

A teaching app for ultrasound-guided regional anaesthesia at NTF Anaesthesia, for MOs, residents and consultants.
Every page is unlisted and `noindex`; the owner shares the links personally (don't link them from the homepage).

| Page | URL | Built with |
|---|---|---|
| Front door | `/blocks/` | its own script, reading `registry.js`, `ops/` (through `chooser.js`) and `data/decisions.js` (no clinical text of its own); app version lines at the foot. Part I "Tools" has four rows, each once (owner, 17 Oct 2026: "too many repeats"): Emergency guides and dose calculator (to `/blocks/safety/`, with the red LAST emergency steps as a sub-line link to `safety/#wrong-last`), Which block for which operation, Ultrasound anatomy, Anatomy in 3D (`#anatomy3d`, the four plexus links inline); no Settings row (the bar and the Settings tab have it), no guide rows, no dose fold. The Index is the A to Z only. Old hashes redirect (inline script in the head, plus `hashchange`, hash kept): `#chooser` and `#op-…` to `indication/`; `#wrong`, `#wrong-<guide>` and `#doses` to `safety/` |
| Dose calculator (old address) | `/blocks/calculator/` | a stub that redirects to `/blocks/safety/#calculator` with its query kept (merged into Safety on 17 Oct 2026); not in the test page lists |
| Safety | `/blocks/safety/` | its own `safety.js`: a segmented control "Emergency guides \| Dose calculator". The guides are `guideList(GUIDE_ORDER)` from `decide.js` (every guide, LAST first and red; the only list of them, `/blocks/` no longer draws them), the calculator is `mountLaCalc` (the one calculator, prefilled by the query; the old `/blocks/calculator/` redirects here). `#last`, `#wrong`, `#wrong-<guide>` open the guides half; `#calculator` and `#doses` the calculator half. Under the calculator, "Planners and total-dose limits" (`#doses`; the old "Maximum dose and planners" fold of `/blocks/`: block combinations, amputation planner, topical lidocaine, LAST). The two segment names are not repeated as headings (the panels' `h2` are screen-reader only). `/blocks/#wrong`, `#wrong-<guide>` and `#doses` redirect here; `/blocks/calculator/` and the "Check the dose" links are unchanged. The "Every guide on one page" links on block pages, `spinal/` and `brachial-plexus/` go to `/blocks/safety/` |
| Indication | `/blocks/indication/` | "Which block for which operation": the chooser moved out of the Index of `/blocks/`. `blocks/chooser.js` (data from `ops/`, `mountChooser`) is shared with `/blocks/`'s search; `#chooser` and `#op-<region>-<id>`; `/blocks/#chooser` and `/blocks/#op-…` redirect here (inline script in the head of `/blocks/`, plus `hashchange`), hash kept. `open(key,{scroll})` scrolls the page itself (`window.scrollTo` to the row's `scroll-margin-top`), not `scrollIntoView`: the operation lists are `overflow:hidden`, which makes them scroll containers, and the first operation ended up under the bar. In the app look the result is one column at every width (the page column is 1048px at most beside the rail) |
| Ultrasound anatomy | `/blocks/ultrasound/` | its own `ultrasound.js`: every ultrasound-guided block by region (registry titles, the first sentence of the scene's own `view` text, a thumbnail from `shared/us/<region>/sources.json` via `loadRealScans`), linking to `#<block>-scan`; Neuraxial lists `spinal/`'s real scans by view. No clinical text of its own |
| Settings | `/blocks/settings/` | its own `settings.js`: the look (Automatic · App look · Website look, §2 "Skins"), level, "Hide the bar while scrolling down", "Press / to search", app version lines (§2 "App frame") |
| Truncal landing + 3 pages | `/truncal/`, `back/`, `chest-wall/`, `abdominal-wall/` | landing chooser + engine (`bootPage`) |
| Head and neck landing + 5 pages | `/head-neck/`, `cervical/`, `scalp/`, `face/`, `airway/`, `eye/` | landing chooser + engine |
| Lower-limb landing + 4 pages | `/lower-limb/`, `hip/`, `knee/`, `foot-ankle/`, `thigh/` | landing chooser + engine; Dr Chew Shi Hao's animations from `lower-limb/anim/` |
| Upper-limb landing + 3 pages | `/upper-limb/`, `shoulder/`, `arm/`, `forearm-hand/` | landing chooser + engine |
| Brachial plexus app | `/brachial-plexus/` | its own app (own scan teacher, 3D, diagram); uses the engine's levels and status colours |
| Neuraxial | `/spinal/` | its own app; uses the engine's levels |
| Anatomy in 3D | `/plexus/` | plexus explorer (cervical, brachial, lumbar, sacral); uses levels and status colours |
| Hub card | `/regional.html` | static page; the only public way in |

All of them share one app bar (with a Settings item), one credit line in the page footer ("Created by Dr Koh Wenjun and Dr Chew Shi Hao, NTF Anaesthesia", Dr Chew
Shi Hao linked to https://chewshihao.com/) and one **MO · Res · Con** level control (§4).

---
