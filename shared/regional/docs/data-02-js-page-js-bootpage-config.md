Part of the regional data guide; index: ../INDEX.md

## 2. `js/page.js`: `bootPage(config)`

```js
import { bootPage } from '../../../shared/regional/js/shell.js';
import { BLOCKS } from './blocks.js';
bootPage({
  title: 'Chest wall blocks',                       // hub h1 and chapter kickers
  eyebrow: 'Regional anaesthesia · Truncal blocks',
  lead: 'One sentence.',                            // HTML allowed
  searchPlaceholder: 'Search, e.g. PECS, serratus',
  tiles: [{ title: 'Cover a mastectomy', desc: 'PECS II set-up', href: '#ch-pecs' }, …],  // "I need to…" tiles
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy', short: 'Anatomy', desc: 'Hub list text', render: (sec) => { … } },
    { id: 'ch-sap', title: 'Serratus anterior plane block', short: 'Serratus', desc: '…', block: BLOCKS[0] },
  ],
  synonyms: [['sap', 'serratus']],                 // optional extra search synonym rows
  hubExtra: '<p>optional HTML appended to the hub</p>',
  // App shell options (all optional):
  backLabel: 'See all lower-limb blocks and the operation chooser',  // hub link back to the region landing
  backShort: 'Lower-limb blocks',                   // bar Home label on the hub (default: the breadcrumb's last link)
  backHref: '../',                                  // region landing (default: the breadcrumb's last link)
  home: '/blocks/',                                 // the front door link; false = none (default: on once /blocks/ is live)
  level: true,                                      // false = no level control, no tier hiding, no hints
});
```

- **Defaults.** `backLabel` defaults to "See all <breadcrumb parent, lower case> and the block chooser"; the hub
  shows no credit (it is in each page's footer; `DEFAULT_CREDIT` is still exported). Don't patch the hub link text from page code (the old `fixHubBack()`): set `backLabel`.
- **One sticky bar.** Inside app pages the site header scrolls away (`body.tb-app .ntf-header{position:static}`) and only
  `#tb-bar` sticks (56 px; CSS variable `--ra-bar` on `:root`). Deep-link targets land just below it
  (`scroll-padding-top` / `scroll-margin-top: calc(var(--ra-bar) + 8px)`); stick your own sticky things at
  `top: var(--ra-bar-now, var(--ra-bar, 56px))`, so they move up with the bar when the reader has turned on "Hide the
  bar while scrolling down" (Settings; `--ra-bar-now` is `0px` while the bar is away). Programmatic jumps never
  smooth-scroll.
- **Bar contents.** Home (on a chapter: this page's hub; on the hub: ← the region landing, `backShort`), Chapter ▾
  (inline links at ≥ 1240 px when they fit, else the menu), Search, Copy link (on phones ≤ 600 px it moves into the
  chapter menu, which then spans the bar width), and the level control. The chapter menu also lists the region landing,
  (when set) the front door and **Settings** (`/blocks/settings/`). On phones the breadcrumb collapses to one
  "← <region>" line. From 1024 px the chapters are also in the rail beside the page, so the bar shows the chapter menu
  (the current chapter's name) rather than repeating the list inline.
- **Bar in the app look (16 Oct 2026).** The same bar gains, by script (`appnav.js`, not in the page data): a Safety button
  (red, to `/blocks/safety/`) and, where the bar has no search, a search button; below 480 px the chapter menu moves into a row
  under the bar (`.ra-titlerow`). Nothing to configure. The website look's bar is unchanged. Don't look the chapter menu up
  inside `#tb-bar` in page code (use `document`).
- **Desktop.** From 1024 px: the rail (this page's chapters, the region's pages, the other regions, the tools) inside
  the site's 1240 px column; nothing to set in the data.
- **Chapter `tier`.** `{ id, title, …, tier: 3 }` tags the chapter, its hub entry and its menu entries; a link or search
  result into it relaxes the level for that view.

- A chapter has either `block` (rendered by `renderBlock`) or `render(sec)` (your own content; you add the `h2`), or both.
- **Headings.** Author every chapter as **h2 title > h3 > h4** (as now). After it renders, the shell gives the chapter
  one visible `h1`: with a single `h2`, every heading moves up one level (h2 → h1, h3 → h2, h4 → h3) and keeps its look
  through the classes `tb-ch-title`, `tb-hv3`, `tb-hv4` (the authored level); with several `h2`s only the first becomes
  the `h1`. Ids and attributes are kept, so `aria-labelledby` and deep links still work. In page CSS, style headings by
  class or id rather than by tag (`.tb-chapter>h3` in page CSS no longer matches; the shared CSS now covers the 48px
  top margin those rules gave).
- **Kickers.** A `.tb-eyebrow` that starts a chapter (a block's `kicker`, or one you add before your `h2`) is merged into
  the "Chapter n of m" line, so there is one kicker: "Chapter 2 of 7 · Back · Paraspinal fascial plane".
- **No sources or references.** The owner asked for these pages to carry no citation numbers, source tags,
  "Sources." lines or References chapter, and no attribution in the prose ("the teaching slides give…",
  "(teaching slide 147)", "et al."). Write the content plainly. Named guidelines may appear as content
  ("PROSPECT recommends…"). `refs` / `refsIntro` in the config are ignored.
- Sticky bar: Hub link and chapters are one `nav`; on screens under 1240 px the chapters are a disclosure menu
  (`#tb-chmenu-btn`), not a `<select>`. Search opens with Ctrl+K / Cmd+K, or "/" when not typing in a box (the reader
  can turn "/" off in Settings, WCAG 2.1.4).
- Old deep links to the removed References chapter (`#ch-refs`, `#ref-…`) land on the hub.
- Chapter ids must start `ch-`. A block chapter should be `ch-<blockId>`.

### Routing and deep links
- `#ch-x` shows that chapter. Any other hash is an element id: the shell shows the chapter that contains it, opens
  `<details>` ancestors and scrolls. Browser Back/Forward work. Empty hash = hub.
- An element with `data-activate` is **clicked** after scrolling, and `data-scroll-to="<id>"` scrolls to that element
  instead. The scan viewer uses this, so these deep links work for every block with a scene:
  - `#<blockId>-step-scan`, `#<blockId>-step-identify`, `#<blockId>-step-needle`, `#<blockId>-step-inject`
  - `#<blockId>-inj-<injectionId>` (selects that injection, e.g. `#ql-inj-ql3`)
- Section ids made by the block renderer: `#<id>-position`, `-equipment`, `-landmarks`, `-approach`, `-sonoanatomy`,
  `-target`, `-dose`, `-dose-check`, `-coverage`, `-anatomy3d`, `-watch` (`-watch-anim` is the disclosure), `-complications`,
  `-wrong` (each guide `-wrong-<guide>`), `-pearls`, `-exam`, `-<sectionId>` (extra sections), `-scan` (the viewer), `-covmap`, `-exam-1…`.
- A deep link to content the reader's level hides shows it for that view (see §2b).
- Cross-page links: `../back/#esp-step-needle` etc.
- Ready signal for tests: `body[data-tb-ready="true"]`; event `tb-ready`; `tb-chapter` fires on chapter change.
