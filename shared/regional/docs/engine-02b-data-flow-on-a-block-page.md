Part of the regional engine guide; index: ../INDEX.md

### Data flow on a block page

```
<page>/index.html ── js/page.js?v=… ── bootPage(config)                     shell.js
                                         ├─ chapter.render(sec)             page's own content (anatomy, planners)
                                         └─ chapter.block ─ renderBlock()   block.js
                                              ├─ dose box, coverage map (coverage.map or dermatomes.coverageMap)
                                              ├─ Anatomy in 3D card ─(tap)─ plexus/js/explorer.js mountExplorer()
                                              ├─ Watch ─(open)─ iframe lower-limb/anim/?embed=1#<anim>/<variant>
                                              └─ scene ─ mountScan()        scan.js
                                                   ├─ Ultrasound: bmode.buildBModeAsync(scene)  (cached per scene.id)
                                                   ├─ Diagram:    diagram.buildDiagram(scene)
                                                   └─ Real:       realscan.loadRealScans(blockId, scene)
                                                                  → scene.realScans | REAL_SCANS | shared/us/<region>/sources.json
```

A page folder holds `index.html`, `page.css` (optional, page prefix such as `aw-`), and `js/page.js`, `js/blocks.js`
(block data), `js/scenes.js` (scene data) and any page-only chapters (`anatomy.js`, planners). Region landings
(`truncal/landing.js`, `head-neck/landing.js`, `lower-limb/landing.js`, `upper-limb/landing.js`) render the chooser
from `ops/`. For an extra scan viewer inside a section, `lower-limb/knee`, `head-neck/scalp` and `head-neck/airway` have
a local `extraScan(scene, blockId)` helper in their `js/blocks.js`.
