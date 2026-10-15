# Tiers, key points and citations (API for section modules)

```js
import { el, cite, tier, keyPoints, callout } from '../ui.js?v=1';
```

## Tiers
- `tier(node, n)` sets `data-tier="1|2|3"` and returns the node. Or set `el.dataset.tier` yourself.
- Tag whole blocks (paragraph group, callout, table, figure, details, tree, card, list item), never single words.
  Untagged blocks always show. A tagged block inside a tagged block is fine (a tier-3 item inside a tier-1 card).
- The page shows tiers cumulatively: MO = tier 1, Resident = 1-2, Consultant = 1-3 (the default when no level is saved).

| Tier | Level | Who | Examples |
|---|---|---|---|
| 1 | MO | MOPEX level, first supervised spinals | step list of the technique; "stop and get help" red flags; the ultrasound viewer |
| 2 | Resident | up to the MMed exam | why the block spreads higher in pregnancy-like states (reasoning); viva points; guideline detail |
| 3 | Consultant | subspecialty and consultant pearls | fine needle-handling tips for a calcified spine; limits of the evidence |

Safety actions (what to do now, when to stop, what to check on the ward) are always tier 1, so an MO sees them.
Tiers may be promoted to meet this rule but never demoted.

The level explanation lives once, on the hub (ch-home). Don't repeat it in chapters.
Badges ("Resident", "Consultant") are drawn by CSS (base.css) on the first block of a run only: never on tier-1 blocks,
on a block nested in or straight after a block of the same tier, on table cells, key points or the ward card list.
Consultant pearls are `callout('key', { title: 'Consultant pearl: …' })` tagged tier 3.

## Key points (every section)
`root.prepend(keyPoints(['one-line point', …]))` (5-8 items, plain sentences; optional `{title}`).
It is tier 1, styled by base.css. Put it first in your mount.


## Citations
`cite('id')` is silent for unknown ids (renders nothing, no warning), so deleting an entry is safe.
Allowed ids: `asra2025`, `esaic2022`, `aagbi2013`, `uppal2023`, `iso80369-6` (core, in refs.js);
`cx-ichd3`, `ts-qrh2023`, `cx-qrh310`, `tq-asa2016`, `tq-klein2021`, `tq-campbell2014`, `pp-griffiths2021`;
product labels only inside drug-dose tables or dose lines: `tq-hpra-heavy`, `tq-sg-heavy`, `tq-sg-plain`,
`tq-prilotekal`, `cx-marcain-smpc`, `ts-smpc-*`.
Remove every other `cite(...)` but keep the sentence, and delete unused entries from your `export const refs`.

## Search
`registerSearch([{ title, text, id }])` (from `ui.js`) adds text the page scan can't see (tree nodes, canvas labels). `id` must be an element that exists. Call it in `mount()`. See V3-SHELL.md.

## Levels (reader-facing)
The level comes from the shared regional level system, `../../shared/regional/js/levels.js` (plan §5), the same one the
other regional block pages use. Import it with exactly `'../../shared/regional/js/levels.js?v=20261015'` from `js/`
(as app.js and search.js do) so every module shares one instance.
- MO = tier 1; Resident = tiers 1-2; Consultant = everything. Saved in localStorage `ra-level` (shared with the other
  regional pages); spinal's old `spinal-level` / `spinal-tier` keys migrate once (1 → MO, 2 → Resident, adv/all/3 → Consultant).
  Never put in the URL.
- `body[data-level]` holds `mo|resident|consultant`; `body[data-tier-max]` holds 1|2|3 (modules may read it, e.g. troubleshooting.js).
- **Pearls only** (Consultant level only, never saved): a switch at the top of each chapter. Each section then shows a
  digest of its tier-3 blocks (app.js `buildDigests`); the ward card and references stay whole. `body[data-pearls-only="true"]`.
- Each chapter shows "n items hidden at MO level · Show all" when the level hides something (levels.js `hiddenHint`).
- Deep links and search results to hidden content raise the level for this page view only (`relaxFor`), with a
  "Back to MO" button under the level control.
