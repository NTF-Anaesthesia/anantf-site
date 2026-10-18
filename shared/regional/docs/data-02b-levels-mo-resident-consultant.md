Part of the regional data guide; index: ../INDEX.md

## 2b. Levels (MO / Resident / Consultant)

`shared/regional/js/levels.js` (styles in `css/levels.css`, imported by `regional.css`). Levels are cumulative:
MO shows tier 1, Resident tiers 1–2, Consultant everything. Any element may carry `data-tier="1|2|3"`; untagged
elements always show. The reader's choice is saved in `localStorage['ra-level']` (spinal's old keys migrate once) and
never goes in the URL. With nothing saved the level is **Consultant** (everything shows).

The shell: mounts the control in the bar, shows a one-time "How much detail do you want?" picker on the hub, adds a
"n items hidden at MO level in this chapter · Show all" line under each chapter's header (Show all raises the level for
this view only), and relaxes the level (never saved) when a deep link or a search result points at hidden content. While
relaxed, that hint line reads "Showing Consultant content for this view · Back to MO" (on wide screens the bar has a
"Back to MO" button too; on phones the hint is the only one, so nothing covers the text). The hub's chapter list has
the same hint when the level hides chapters. If the reader lowers the level while reading a chapter it hides, the
chapter is replaced by a short "Hidden at your level · Show it" card (never a blank page). Search lists hidden matches
with "(Resident)" / "(Consultant)" after the chapter name, and links to the matched text itself, so opening one shows it.

Import `levels.js` (and `figures/head.js`) as `…/levels.js?v=20261015` from every module, as the engine, spinal,
brachial-plexus, plexus and /blocks/ do: a second URL would load a second copy with its own level state.

API (frozen): `getLevel()`, `setLevel(l, {save})`, `onLevel(fn) → unsubscribe`, `mountLevelControl(host)`,
`relaxFor(el)`, `withScrollAnchor(fn)`, `countHidden(root)`, `applyLevel()`; helpers `tierOf(el)`, `tierMax()`,
`hasChosenLevel()`, `mountLevelPicker(host)`, `hiddenHint(root)`, `tierBadge(t)`, `TIER_NAMES`.

**Default tiers in `renderBlock`** (so blocks are tiered with no data edits):

| Tier | Sections |
|---|---|
| 1 MO | header, summary, "Use it for", at a glance, `rapid`, `intro`, scan viewer, position, equipment, **dose box + LAST line**, **complications**, **If it goes wrong**, the **first 3 pearls**, `warning`, any section with `safety: true`, extra sections titled "Contraindications…" |
| 2 Resident | landmarks, approach, sonoanatomy, target, coverage, Anatomy in 3D, Watch the animation, remaining pearls, exam corner, other extra `sections[]` |
| 3 Consultant | extra sections with id `consultant`, `frontier`, `catheter(s)`, `nerve-stim…`, `landmark(s)`, `approaches`, `alt`, or titled "Consultant corner", "Frontier…", "Catheters", "Nerve stimulat…", "Alternative: …", "Landmark technique…", "Before ultrasound: landmark…" |

Overrides, in data:
- `tiers: { approach: 1, exam: 3 }` on a block changes a top-level section's tier.
- `{ id, title, html, tier: 3 }` or `safety: true` on an extra section.
- Any section value or list item may be `{ tier: n, html }` (or `{ safety: true, html }`) instead of a plain string:
  a pearl `{ safety: true, html: '…' }` is promoted to MO. Plain strings inherit their section's tier.
- `exam: [{ q, points, tier: 3 }]`.
- **Safety rule:** `dose`, `complications` and `wrong` (the "If it goes wrong" guides) are always tier 1, whatever the
  data says (`SAFETY_KEYS`, enforced in `block.js` and by `shared/regional/test/levels.mjs` and `data.mjs`). Region pages may
  promote, never demote, safety content. An extra section that carries a dose an MO may give or look after (a catheter
  regimen, a separate injection in an MO-visible scan viewer) should be MO level too (`safety: true` or `tier: 1`).

Badges ("Resident", "Consultant") are added by the engine on the first section of each run of that tier, as their own
line above the heading. Long prose sections at tier 2–3 (more than 3 paragraphs, prose only) keep their first paragraph
and fold the rest into a "Read more: <title>" disclosure; deep links and search open it.
