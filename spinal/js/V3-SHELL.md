# V3 shell: chapters, routing, search (for content helpers)

The page is a hub plus nine chapters. Only one chapter is visible at a time.

## Chapters (index.html)
| Chapter id | Title | Sections inside (section id > mount id) |
|---|---|---|
| `ch-home` | Hub | in index.html (first-visit level picker, search, tiles, chapter list, level key) |
| `ch-card` | Ward card | `#card` > `#mount-card` (`sections/card.js`, prefix `cd`) |
| `ch-anatomy` | Anatomy & physiology | `#anatomy` > `#mount-anatomy` |
| `ch-pharm` | Pharmacology | `#pharm` > `#mount-pharm` (`sections/pharm.js`, prefix `ph`) |
| `ch-technique` | Technique | `#technique` > `#mount-technique` (populations merged in) |
| `ch-backs` | Difficult backs & ultrasound | `#spines` > `#mount-spines`, `#ultrasound` > `#mount-ultrasound` |
| `ch-trouble` | Troubleshooting | `#troubleshooting` > `#mount-troubleshooting` |
| `ch-complications` | Complications & aftercare | `#complications` > `#mount-complications` |
| `ch-exam` | Exam (MMed) | `#exam` > `#mount-exam` (`sections/exam.js`, prefix `ex`) |
| `ch-refs` | References | `#references` (list `#sp-refs` filled by refs.js) |

Each section has an `h2` (`#<id>-h`) already in index.html: modules should not add another h2 for the same thing.
Every section module exports `meta` and `mount(root)` and is loaded by app.js (`mods` list) as `./sections/<name>.js?v=N`
(bump N in app.js when a section changes). The ward card loads its own `css/card.css`.

## Routing (app.js)
- `#ch-x` shows that chapter and scrolls to the top. Empty hash = hub.
- Any other hash is an element id: the shell shows the chapter that contains it, relaxes the level if the target is hidden by it
  (not saved to localStorage), calls the module's `reveal(id)` (looked up by the id prefix before the first `-`), selects any hidden
  tab panel that holds it, opens `<details>`, then scrolls. If the element does not exist yet, `meta.prefix` of each module maps
  the prefix to its chapter so `reveal()` can create it.
- Aliases: `#sixty` -> `ch-card`, `#populations` -> `ch-technique`, `#quiz` -> `ch-exam`.
- `#ref-*` ids are in `ch-refs`, so every citation link routes there. `#cite-*` back-links route to the citing chapter.
- Uses real hash changes, so browser Back/Forward work. `body[data-chapter]` holds the current chapter id.
- Hidden chapters are display:none after boot. While mounting they sit off-screen at full width, so measuring at mount works.
  After every chapter change the shell fires `window` `resize` (twice). Use `onResize()` / `resize` listeners for canvases.
- Programmatic scrolling is always instant (no smooth scrolling on these long chapters). Targets land just below the
  sticky bar (`html` `scroll-padding-top: calc(var(--ra-bar) + 8px)`, `--ra-bar` = 56px).
- Print shows only the current chapter (`.is-current`); header, bar, chapter tools and pager are hidden.

## App bar (index.html + app.js)
The one sticky bar, the same layout as the regional block pages (`shared/regional`, plan §4). The site header is
static (`body.spinal-app .ntf-header{position:static}`), so the bar is the only sticky element, 56px tall.
- Home: on a chapter, "Hub" (`#ch-home`); on the hub, "← Regional" (`../regional.html`).
- Chapters: inline links (`#sp-chlist`) from 1240px when they fit; otherwise the "Chapter ▾" disclosure menu
  (`#sp-chmenu-btn` / `#sp-chmenu`), clamped to the viewport, which also holds "Copy link" on phones and the Regional link.
- Search (`#sp-search-open`; the sheet `#sp-sheet` hangs from the bar), Copy link (`#sp-share`, hidden on phones),
  and the MO · Res · Con level control (`#sp-bar-level`, mounted by levels.js `mountLevelControl`).

## Playwright
`await page.goto('http://localhost:PORT/spinal/#ch-anatomy'); await page.waitForSelector('body[data-sp-ready="true"]');`
For a deep link: `.../spinal/#ts-dry-tap` (wait ~1.6 s for it to settle). `body[data-level]` is `mo|resident|consultant`;
set it with `page.click('.ra-level-btn[data-level="mo"]')` (saved), or `localStorage.setItem('ra-level', 'mo')` before load.
Pearls only: `page.click('.sp-chapter.is-current .sp-pearls-btn')` at Consultant level.

## Search
- `import { registerSearch } from '../ui.js?v=1'` then `registerSearch([{ title: 'Dry tap: step 1', text: 'Did you wait long enough...', id: 'ts-dry-tap-t1' }])`.
  `id` must exist in the DOM (link target). Call during `mount()`.
- The shell indexes every `h2,h3,h4,p,li,td,th,summary,figcaption,dt,dd` in all chapters after mounts (hidden tab panels
  and hidden tiers too), gives headings without ids an id `srch-h-N`, and links each result to the nearest id. One result per heading.
- Level-aware: a result the current level hides is tagged "(Resident)" or "(Consultant)"; opening it shows it for this
  page view only (never saved).
- Synonyms are in `js/search.js` (`SYN`). Add a row to teach it a new equivalence.

## Hub tile targets (these ids MUST exist)
`tq-prep`, `tq-drugs`, `tq-anticoag`, `ts-dry-tap`, `ts-hypotension`, `sx-scoliosis`, `cx-pdph`, `ch-card`, `ch-exam`.
All exist today. If you rename one, keep the old id.

## CSS utilities (css/base.css)
- `.sp-grid` (1 column on phone, auto-fill 240px columns from 600px), `.sp-grid--2`, `.sp-grid--3`
- `.sp-box` surface box, `.sp-scroll-x` (overflow-x:auto wrapper), `.sp-nowrap`
- `.sp-table-wrap` / `ui.table()` for tables (stacks on phone by default)
- Tiles on the hub: `.sp-tile`; chapter pager: `.sp-pager`; search results: `.sp-sres`.

## Levels
See TIERS.md. The level explanation (MO / Resident / Consultant, and Pearls only) is shown once on the hub; the level
control is in the app bar on every chapter. Under each chapter kicker, `.sp-ch-tools` holds the hidden-count hint
(MO, Resident) or the Pearls only switch (Consultant). In Pearls only, `#card` and `#references` stay fully visible;
other sections show a digest of their tier-3 blocks.

## Emergency card (troubleshooting)
`#ts-first`: the steps and the four "what to give" boxes always show; the dose table (`#ts-doses`) and the "Which
column?" note sit in `<details id="ts-first-more">`, open on wide screens and closed on phones (≤760px). Deep links to
`#ts-doses` open it; printing opens it.
