# V3 shell: chapters, routing, search (for content helpers)

The page is a hub plus nine chapters. Only one chapter is visible at a time.

## Chapters (index.html)
| Chapter id | Title | Sections inside (section id > mount id) |
|---|---|---|
| `ch-home` | Hub | built by the shell (tiles, search, chapter list, level key) |
| `ch-card` | Ward card | `#card` > `#mount-card` (`sections/card.js`, prefix `cd`) |
| `ch-anatomy` | Anatomy & physiology | `#anatomy` > `#mount-anatomy` |
| `ch-pharm` | Pharmacology | `#pharm` > `#mount-pharm` (`sections/pharm.js`, prefix `ph`) |
| `ch-technique` | Technique | `#technique` > `#mount-technique` (populations merged in) |
| `ch-backs` | Difficult backs & ultrasound | `#spines` > `#mount-spines`, `#ultrasound` > `#mount-ultrasound` |
| `ch-trouble` | Troubleshooting | `#troubleshooting` > `#mount-troubleshooting` |
| `ch-complications` | Complications & aftercare | `#complications` > `#mount-complications` |
| `ch-exam` | Exam (FRCA) & quiz | `#exam` > `#mount-exam` (`sections/exam.js`, prefix `ex`), `#quiz` > `#mount-quiz` |
| `ch-refs` | References | `#references` (list `#sp-refs` filled by refs.js) |

Each section has an `h2` (`#<id>-h`) already in index.html: modules should not add another h2 for the same thing.
The `populations` module is no longer loaded by app.js (`mods` list). `css/populations.css` is still linked in index.html
(the technique helper: remove the link from index.html only if the file is deleted, and tell the shell helper).
Stub modules `card.js`, `pharm.js`, `exam.js` export `meta` and `mount(root)`; replace them.

## Routing (app.js)
- `#ch-x` shows that chapter and scrolls to the top. Empty hash = hub.
- Any other hash is an element id: the shell shows the chapter that contains it, relaxes the level if the target is hidden by it
  (not saved to localStorage), calls the module's `reveal(id)` (looked up by the id prefix before the first `-`), selects any hidden
  tab panel that holds it, opens `<details>`, then scrolls. If the element does not exist yet, `meta.prefix` of each module maps
  the prefix to its chapter so `reveal()` can create it.
- Aliases: `#sixty` -> `ch-card`, `#populations` -> `ch-technique`.
- `#ref-*` ids are in `ch-refs`, so every citation link routes there. `#cite-*` back-links route to the citing chapter.
- Uses real hash changes, so browser Back/Forward work. `body[data-chapter]` holds the current chapter id.
- Hidden chapters are display:none after boot. While mounting they sit off-screen at full width, so measuring at mount works.
  After every chapter change the shell fires `window` `resize` (twice). Use `onResize()` / `resize` listeners for canvases.
- Print shows only the current chapter (`.is-current`); dock, header, bar and pager are hidden.

## Playwright
`await page.goto('http://localhost:PORT/spinal/#ch-anatomy'); await page.waitForSelector('body[data-sp-ready="true"]');`
For a deep link: `.../spinal/#ts-dry-tap` (wait ~1.6 s for it to settle). `body[data-level]` is `1|2|adv|all`; set it with
`page.click('.sp-level-btn[data-level="adv"]')`.

## Search
- `import { registerSearch } from '../ui.js?v=1'` then `registerSearch([{ title: 'Dry tap: step 1', text: 'Did you wait long enough...', id: 'ts-dry-tap-t1' }])`.
  `id` must exist in the DOM (link target). Call during `mount()`.
- The shell indexes every `h2,h3,h4,p,li,td,th,summary,figcaption,dt,dd` in all chapters after mounts (hidden tab panels too),
  gives headings without ids an id `srch-h-N`, and links each result to the nearest id. One result per heading.
- Synonyms are in `js/search.js` (`SYN`). Add a row to teach it a new equivalence.

## Hub tile targets (these ids MUST exist)
`tq-prep`, `tq-drugs`, `tq-anticoag`, `ts-dry-tap`, `ts-hypotension`, `sx-scoliosis`, `cx-pdph`, `quiz`, `ch-card`, `ch-exam`.
All exist today. If you rename one, keep the old id.

## CSS utilities (css/base.css)
- `.sp-grid` (1 column on phone, auto-fill 240px columns from 600px), `.sp-grid--2`, `.sp-grid--3`
- `.sp-box` surface box, `.sp-scroll-x` (overflow-x:auto wrapper), `.sp-nowrap`
- `.sp-table-wrap` / `ui.table()` for tables (stacks on phone by default)
- Tiles on the hub: `.sp-tile`; chapter pager: `.sp-pager`; search results: `.sp-sres`.

## Levels
The level explanation (MO / Resident / Advanced / All) is shown once on the hub. The dock buttons stay on every chapter.
In Advanced, `#card`, `#quiz` and `#references` stay fully visible; other sections show a digest of their tier-3 blocks.
