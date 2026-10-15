# MO guide: how the content is written

Everything the app teaches is data in `js/content/*.js` (learn modules) and `js/data/*.js` (drugs, crisis cards,
scenarios, flashcards). The engine in `js/` draws it. To change a page, edit the data; you never touch HTML.
`node mo/test/content.test.mjs` checks every file against the rules below (ids, links, drug and tool names, banned
words), so run it after any edit.

## Voice and rules

- Plain English, British spelling (anaesthesia, haemorrhage, oesophagus, colour, centre, litre, programme,
  recognise, organise), sentence case for titles, short sentences, second person ("you"). Explain each acronym the
  first time it appears in a topic, e.g. "post-anaesthesia care unit (PACU)".
- Write as the department: "At NTFGH we…". No "check local policy" (this is the local guide), no citations or
  reference lists. "Ask your consultant" and "call for help" are the department's own rules for baby MOs and stay.
- Numbers: use the handbook's local doses and dilutions where it gives them (`HANDBOOK` below). Put doses and values in
  backticks so they show in the mono font: `` `1–2 mg/kg` ``, `` `0.5 mL` ``. Use an en dash for ranges (1–2), a
  space before units (`5 mg`, `10 mL`, `37 °C`), `mcg` for micrograms (never µg or mcg/kg/hr: write `mcg/kg/h`), `mL`.
- Adults unless a topic says otherwise. Never present a dose without its unit and route when the route is not obvious.
- No administrative content (rosters, leave, MC, who to email), no personal names, no phone numbers, no patient
  details. Examples use invented patients ("a 68-year-old man").
- No emoji. Arrows only from → ← ↑ ↓ (never ↗ ↘ ↔ ↩ ▶).

## Inline text

Any `text` field may use:

| Write | Shows |
|---|---|
| `**words**` | bold |
| `` `5 mg` `` | value in the mono font |
| `[words](#/drugs/propofol)` | a link. Inside the app: `#/learn/<module>/<topic>`, `#/drugs/<id>`, `#/tools/<id>`, `#/crisis/<id>`, `#/practice/scenario/<id>`, `#/practice/cards/<deck>`. Other site pages: `../spinal/#tq-anticoag`, `../airway.html`. Outside: full `https://` address |

Nothing else (no HTML: it is shown as text).

## A learn module (`js/content/<module>.js`)

```js
export default {
  id: 'preop',                       // kebab-case, unique, same as the file name
  title: 'Pre-op assessment',
  group: 'before',                   // see GROUPS in js/content/index.js
  summary: 'One sentence shown in the module list.',
  topics: [
    {
      id: 'airway',                  // unique inside the module
      title: 'Airway assessment',
      level: 'core',                 // core = handbook and first-month essentials; beyond = extension
      summary: 'One sentence shown in the topic list.',
      blocks: [ /* see below */ ],
    },
  ],
};
```

Each topic is one screen on a phone: aim for 300–900 words. Start every topic with a `key` block.

## Blocks

| `t` | Fields | Use |
|---|---|---|
| `key` | `items: [text]` | 3–7 key points, first block of every topic |
| `p` | `text` | a paragraph |
| `h` | `text` | a subheading inside the topic |
| `list` | `items: [text]`, `ordered?: true` | bullet or numbered list |
| `steps` | `items: [text \| {title, text}]` | a procedure done in order (numbered, with a step badge) |
| `table` | `head: [text]`, `rows: [[text]]`, `caption?`, `rowHead?: true` | small reference table (keep ≤ 4 columns for phones) |
| `callout` | `kind`, `title?`, `text?`, `items?: [text]` | `stop` (red: never / call for help now), `warn` (amber: caution), `local` (how we do it at NTFGH), `tip` (a pearl), `note` (aside) |
| `dl` | `items: [{term, def}]` | words and what they mean |
| `script` | `title`, `lines: [text]` | words to say (counselling, handover, closed-loop calls) |
| `compare` | `cols: [{title, items: [text]}]` | 2–3 columns side by side (pros and cons, A vs B) |
| `check` | `id`, `title`, `items: [text]` | a tickable checklist; ticks are saved on the phone. `id` unique across the app |
| `quiz` | `id`, `items: [{q, options: [text], answer: n \| [n…], explain}]` | check-yourself questions (answer = index from 0; an array means "select all"). `id` unique across the app |
| `drug` | `id` | a drug card with doses worked out for the patient's weight |
| `drugs` | `ids: [id]`, `title?` | a compact dose table for several drugs |
| `tool` | `id` | a calculator inline (ids in TOOLS below) |
| `crisis` | `id` | a link card to a crisis card |
| `scenario` | `id` | a link card to a practice scenario |
| `figure` | `id`, `caption` | a drawing from `js/figures.js` (ids in FIGURES below) |
| `details` | `title`, `blocks: [block]` | a collapsed "more" section (no `key`, `check` or `quiz` inside) |
| `links` | `title?`, `items: [{text, href, note?}]` | related pages |

## Drugs (`js/data/drugs.js`)

```js
{
  id: 'propofol', name: 'Propofol', aka: ['Diprivan'],
  group: 'induction',                 // see DRUG_GROUPS in drugs.js
  label: 'induction',                 // syringe label colour (ISO 26825): induction, benzo, opioid, nmb, reversal,
                                      // anticholinergic, vasopressor, hypotensive, la, antiemetic, other; omit if none
  cls: 'Intravenous anaesthetic',
  presentation: '200 mg in 20 mL ampoule',
  prep: 'Draw up neat',                // how to draw it up; local dilution from the handbook where given
  conc: { value: 10, unit: 'mg/mL' },  // concentration in the syringe after prep (used to work out mL); omit if none
  infusionPrep: '4 mg in 50 mL',       // only for drugs also run as an infusion at a different strength
  infusionConc: { value: 0.08, unit: 'mg/mL' },  // used by `infusion: true` doses and the infusion calculator
  doses: [
    { label: 'Induction', per: [1, 2], unit: 'mg/kg', weight: 'TBW', note: 'Less in the elderly and frail.' },
    { label: 'Bolus', text: '50–100 mcg' },                                   // a fixed dose
    { label: 'Infusion', per: [0.01, 0.2], unit: 'mcg/kg/min', infusion: true },
    { label: 'Max', per: [3], unit: 'mg/kg', max: { value: 200, unit: 'mg' } }, // optional ceiling
  ],
  onset: '30–45 s', duration: '5–10 min',
  notes: [text], cautions: [text], local: text, source: 'handbook' | 'beyond',
}
```

`per` is `[min, max]` or `[single]`. Units: `mg/kg`, `mcg/kg`, `mL/kg`, `U/kg`, `mmol/kg`, `g/kg`, `J/kg` (a bolus: the app
works out the amount and, with `conc`, the mL), or with `infusion: true`: `mcg/kg/min`, `mcg/kg/h`, `mg/kg/h`, `mcg/min`,
`mg/h`, `U/h`, `U/min`, `mL/kg/h` (the app works out mL/h). Anything else (fixed doses, TCI targets in ng/mL or
mcg/mL, percentages) goes in `text`. `weight` is `TBW` (total), `IBW` (ideal), `LBW` (lean) or `ABW` (adjusted); the app
uses the patient's height to work out IBW/LBW/ABW and falls back to total weight with a warning if no height is set.

## Crisis cards (`js/data/crises.js`)

```js
{
  id: 'anaphylaxis', title: 'Anaphylaxis', summary: 'one line',
  recognise: [text],                   // what you see
  steps: [{ title: 'Immediately', items: [text] }, { title: 'Then', items: [text] }],
  doses: [{ label: 'Adrenaline IV', text: '`50 mcg` (0.5 mL of 1:10,000), repeat…', drug?: 'adrenaline' }],
  pitfalls: [text], after: [text], related: ['crisis-id'],
}
```

The app always shows "Call for help. Say the problem out loud." first: don't repeat it as step 1.

## Scenarios (`js/data/scenarios.js`)

```js
{
  id: 'desat-induction', title: 'Falling saturation after induction', setting: 'Elective list, 08:40',
  level: 'core', summary: 'one line', start: 'a',
  nodes: {
    a: { text, vitals?: { HR, BP, SpO2, EtCO2, RR, T }, choices: [
      { text, next: 'b', good: true, feedback: 'why' },
      { text, next: 'a', good: false, feedback: 'why not' },   // next may loop back
    ] },
    end: { text, end: true, outcome: 'good' | 'ok' | 'bad' },
  },
  debrief: [text],
}
```

## Flashcards (`js/data/cards.js`)

`DECKS = [{ id, title, summary }]`, `CARDS = [{ id, deck, front, back }]`. One fact per card; the front is a question.

## TOOLS (ids for `tool` blocks and `#/tools/<id>`)

`weights` (BMI, ideal, lean and adjusted weight), `rsi` (RSI drug sheet), `la-max` (local anaesthetic maximum dose),
`infusions` (vasopressor and sedation infusion rates), `fluids` (4-2-1 maintenance and fasting deficit), `abl`
(allowable blood loss), `convert` (percent, ratio and mg/mL), `stopbang`, `apfel` (PONV risk), `rcri` (cardiac risk),
`aldrete` (PACU discharge score), `paeds` (children's quick sheet), `premed` (premed summary builder), `handover`
(PACU handover builder).

## FIGURES (ids for `figure` blocks)

`mallampati`, `airway-tests` (thyromental distance, mouth opening, upper lip bite), `drug-drawers` (the trolley's
drawers), `syringe-labels` (label colours), `circle-system` (breathing circuit and machine flow), `tof` (train-of-four
patterns), `capnography` (normal and abnormal capnograph shapes), `lma` (supraglottic airway in place).

## HANDBOOK

The department's MO handbook (4th edition, 2026) is the local source of truth for doses, dilutions and rules. It is
not in this repo (internal document). Where the guide teaches something the handbook does not say, mark the topic
`level: 'beyond'` or keep it inside a `beyond` topic.
