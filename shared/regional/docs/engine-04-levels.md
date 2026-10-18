Part of the regional engine guide; index: ../INDEX.md

## 4. Levels

| Level | `getLevel()` | Shows |
|---|---|---|
| MO | `mo` | tier 1 |
| Resident | `resident` | tiers 1–2 |
| Consultant | `consultant` | everything (the default when nothing is saved) |

- **Tagging.** Any element can carry `data-tier="1|2|3"`; untagged content always shows. `renderBlock` tags block
  sections by default (`DEFAULT_TIERS`); data overrides with `tiers: {key: n}`, `{tier, html}` items, `tier` on
  extra sections and chapters, and `safety: true`. Table of defaults: [`DATA.md` §2b](data-02b-levels-mo-resident-consultant.md#2b-levels-mo--resident--consultant).
- **Safety rule.** Doses, the LAST line, complications and the "If it goes wrong" guides are always tier 1
  (`SAFETY_KEYS = ['dose', 'complications', 'wrong']`, enforced in `block.js` and checked by `levels.mjs` and
  `data.mjs`). You may move safety content down a tier, never up. Extra sections that carry a dose an MO may give or
  look after on the ward (catheter regimens, a separate injection offered in an MO-visible scan viewer, drug choice when
  the dose box gives volume only) are made MO level (`safety: true` or `tier: 1`), as `#sap-ribs`, `#peri-drugs` and
  `#sciatic-pfcn` are.
- **Persistence.** `localStorage['ra-level']`, shared by every regional page; spinal's old keys
  (`spinal-level`, `spinal-tier`) migrate once. Never put the level in a URL.
- **Relaxing.** A deep link or search result to hidden content raises the level for that view only (`relaxFor`,
  never saved); hint lines offer "Show all" and "Back to MO".
- **API** (frozen): `getLevel`, `setLevel(l, {save})`, `onLevel(fn) → unsubscribe`, `mountLevelControl(host)`,
  `mountLevelPicker(host)`, `relaxFor(el)`, `applyLevel()`, `countHidden(root)`, `hiddenHint(root)`, `tierOf(el)`,
  `tierMax()`, `hasChosenLevel()`, `withScrollAnchor(fn)`, `tierBadge(t)`, `TIER_NAMES`, `LEVELS`.
- Pages not built by `bootPage` call `applyLevel()` once and `mountLevelControl(host)` in their bar.
  `body[data-tier-max]` drives the hiding in `css/levels.css`.

---
