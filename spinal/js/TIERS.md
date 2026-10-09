# Tiers, key points and citations (API for section modules)

```js
import { el, cite, tier, keyPoints, callout } from '../ui.js?v=1';
```

## Tiers
- `tier(node, n)` sets `data-tier="1|2|3"` and returns the node. Or set `el.dataset.tier` yourself.
- Tag whole blocks (paragraph group, callout, table, figure, details, tree, card, list item), never single words.
  Untagged blocks always show. A tagged block inside a tagged block is fine (a tier-3 item inside a tier-1 card).
- The page shows tiers cumulatively: MO = tier 1, Resident = 1-2, Advanced = 1-3 (default).

| Tier | Label | Who | Examples |
|---|---|---|---|
| 1 | MO | MOPEX level, first supervised spinals | step list of the technique; "stop and get help" red flags |
| 2 | Resident | up to the MMed exam | why the block spreads higher in pregnancy-like states (reasoning); viva points; guideline detail |
| 3 | Advanced | subspecialty and consultant pearls | fine needle-handling tips for a calcified spine; limits of the evidence |

Badges ("MO", "Resident", "Advanced") are drawn by CSS on tagged blocks and hidden in Quick read.

## Key points (every section)
`root.prepend(keyPoints(['one-line point', …]))` (5-8 items, plain sentences; optional `{title}`).
It is tier 1, styled by base.css, and stays visible in Quick read. Put it first in your mount.

## Quick read
`body[data-quick="on"]` hides everything inside sections except `h2`, `h3`, `.sp-kicker`, `.sp-keypoints`
and anything with `data-quick="keep"` (including its children). Use `data-quick="keep"` only for something
a reader in a hurry must see (the 60 s block uses it). Headings are shown, so make `h3` text meaningful.
Deep links and your `reveal()` still work: app.js turns Quick read off / raises the level if the target is hidden.

## Citations
`cite('id')` is silent for unknown ids (renders nothing, no warning), so deleting an entry is safe.
Allowed ids: `asra2025`, `esaic2022`, `aagbi2013`, `uppal2023`, `iso80369-6` (core, in refs.js);
`cx-ichd3`, `ts-qrh2023`, `cx-qrh310`, `tq-asa2016`, `tq-klein2021`, `tq-campbell2014`, `pp-griffiths2021`;
product labels only inside drug-dose tables or dose lines: `tq-hpra-heavy`, `tq-sg-heavy`, `tq-sg-plain`,
`tq-prilotekal`, `tq-ampres`, `cx-marcain-smpc`, `ts-smpc-*`.
Remove every other `cite(...)` but keep the sentence, and delete unused entries from your `export const refs`.
