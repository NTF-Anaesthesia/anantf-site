Part of the regional data guide; index: ../INDEX.md

## 3. Block schema (`renderBlock`)

All text fields are **trusted HTML strings** (or arrays of HTML strings rendered as a list). Don't add citations:
`cite()` from `shared/regional/js/refs.js` still exists but renders nothing.

| Field | Type | Rendered as |
|---|---|---|
| `id` | string, lowercase, no spaces | prefix for all ids (`tap` → `#tap-dose`) |
| `title` | string | chapter `h2` |
| `kicker` | string | small capitals line above the title |
| `summary` | HTML | lead paragraph |
| `indications` | HTML[] | "Use it for" chips |
| `glance` | `{position, probe, needle, dose, covers}` | "At a glance" strip; `dose`/`covers` default from `dose` and `coverage.summary` |
| `intro` | HTML | optional prose before the viewer |
| `scene` | Scene (§4) | the scan viewer |
| `position`, `equipment`, `landmarks`, `approach`, `sonoanatomy`, `target` | HTML or HTML[] | sections in this order; `landmarksTitle` renames "Landmarks and scanning" |
| `dose` | `{volume, conc, drug, per, note, calc?}` or `{html, note, calc?}` | dose box: "20–30 ml of dilute 0.3% ropivacaine per side" + note + LAST reminder (a `source` field is ignored), then "Check the dose for this patient" (`#<id>-dose-check`), a link to `/blocks/calculator/?agent=&pct=&ml=&adr=`. The link is prefilled only when the dose names exactly one agent with one strength and one volume (no ranges, no ml/kg); `calc: false` leaves it out |
| `last` | string | override the LAST line (default: "Keep the total dose within the maximum for the patient’s weight, especially with bilateral blocks or when combining blocks.") |
| `coverage` | Coverage (§5) | map + "Covers" + Mechanism + "How dense, how reliable" + "What it misses" |
| `complications` | HTML or HTML[] | section |
| `wrong` | guide id[] or `false` | "If it goes wrong" section, after complications, always tier 1: the core guides plus those `EXTRA_GUIDES` in `js/data/decisions.js` gives this block id or region, plus any ids listed here; `false` hides it. Anchors `#<id>-wrong` and `#<id>-wrong-<guide>`; it links to `/blocks/safety/`. Guide schema: [`ENGINE.md` §3.8](engine-03-data-formats.md#38-if-it-goes-wrong-guides-datadecisionsjs) |
| `pearls` | HTML[] | "Practical pearls" list |
| `sections` | `[{id, title, html, render(sec), tier?, safety?}]` | extra sections, inserted before the exam corner |
| `rapid` | HTML or HTML[] | "The 20-second version" key box under the header (tier 1) |
| `tiers` | `{key: 1\|2\|3}` | override the default tier of a top-level section (see §2b) |
| `anatomy3d` | `{plexus, block?, el?, brachialApp?}` or `{app: 'brachial-plexus', block, el?, tab?}`; `false` = none | "Anatomy in 3D" card: a link to `/plexus/#plexus=…&block=…` (or `/brachial-plexus/#block=…&tab=…`) and, for `plexus`, an "Open here" button that imports `plexus/js/explorer.js` (`mountExplorer`) only when tapped. With `plexus`, `brachialApp: {block?, el?, tab?}` adds an "Open in the brachial plexus app" link next to it (upper-limb pages). Falls back to `registry.js` (`getBlock(id).anatomy3d`) when absent |
| `watch` | `{anim, variant?, caption?, label?}`; `false` = none | "Watch it done" disclosure for Dr Chew Shi Hao's animation (`lower-limb/anim/?embed=1#anim/variant`). The iframe is made on first open and removed on close; one per page. Falls back to `registry.js` |
| `exam` | `[{source, q, points[], id?}]` | Exam corner; `source` is the exam name only ("MMed OSCE 2025", "Practice question"), no provenance in brackets; `points` sit in a "Model answer points" disclosure |

Doses: keep the values as they are. Paravertebral: **0.3–0.5%** ropivacaine.
