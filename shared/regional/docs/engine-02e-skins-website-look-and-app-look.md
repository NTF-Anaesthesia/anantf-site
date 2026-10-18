Part of the regional engine guide; index: ../INDEX.md

### Skins (website look and app look)

The same pages, content, levels, doses, anchors and hashes in two looks (owner, 16 Oct 2026): the **website look**
(`DESIGN.md`, as the pages always were) and the **app look** (`DESIGN-APP.md`, like the MO guide and Baby MO: soft corners,
grouped lists on a warm ground, a blurred bar that is 98% opaque (`--app-bar`; text scrolling under it must not show through, owner 17 Oct 2026), a bottom tab bar that becomes a 96 px left rail from 1024 px). Only the
skin differs; nothing in the data or the engine's DOM depends on it.

- **Which look.** `html[data-skin]` is `app` or `web`, set before first paint by one inline `<script>` in the `<head>` of every
  regional page (the same text on all of them: copy it from `truncal/abdominal-wall/index.html`; `skin.mjs` checks it) and
  again by `js/skin.js`. The reader's choice is `localStorage` `ra-skin`: **`auto`** (default), `app` or `web`, set in
  Settings ▸ Look and applied at once, no reload. With `auto` the app look is used only when the block app is *opened*:
  from the home screen (`display-mode: standalone`, or `navigator.standalone` on older iPhones), or through the block-app
  link `/blocks/?app`, which sets `sessionStorage` `ra-in-app` for that tab (so the rest of that visit is the app look;
  a new tab, a shared deep link or a plain visit is the website look). An explicit choice always wins. Every storage
  read and write is in try/catch (blocked storage: website look). `?app` does nothing on any other page.
- **The skin sheet.** `css/skin-app.css` is linked from every regional page and **every rule in it is under
  `html[data-skin="app"]`**, so the website look is byte-for-byte what it was (`skin.mjs` fails on a loose rule, and
  on any `@container`, `@font-face` or other at-rule that is not `@media`, `@supports` or `@layer`; the before and after
  screenshots of the pages are identical). It holds the `--app-*` tokens (copied from `assets/app/app.css`, which is
  stamped into other apps and is not linked here), the ground (`#f1ede4`) and surface (`#fbfaf6`: the engine's
  `--tb-paper` becomes the surface), and, in this order, the sections listed in the "Components" table below. Add
  app-look rules there, never to the shared CSS; never recolour clinical colours; keep every rule in `html[data-skin="app"]`
  (write `html[data-skin="app"] body.tb-app …` for the engine pages, `body:is(.tb-app,.spinal-app)` where the `sp-` twin
  has the same component, `body.bd-app`, `body.lc-app`, `body.st-app`, `body.spinal-app`, `body.plexus-app:not(.px)`
  (brachial) and `body.px` (plexus) for the pages with their own CSS). Don't select by `#id` inside a `:is()` (it raises the
  whole selector to ID weight: use `.sp-bar` and `.bp-bar`, not `#sp-bar`).
- **The frame.** In the app look `--site-gutter` is 16 px (24 px from 768 px) and `--site-width` is 752 / 768 px, so the
  engine pages, spinal, the calculator and Settings are a centred 720 px reading column (`.site-container` and the bar use
  the same variables, so they line up); `/blocks/` and the landings use 1048 px, plexus 1240 px (the website look's width, so its two panes and the bar line up), brachial 1344 px (its diagram
  must stay at least 760 px wide beside the 3D model, or `bpd` switches to its narrow layout and the text differs).
  From 1024 px the scan teacher and the wide tables of an engine page break out of the column to 880 px (`margin-inline:
  -80px`); the 96 px tab rail is `body` padding. **Large title:** the page's first visible `h1` is 34 px Fraunces; the bar
  is transparent on the ground while it shows, then (html `data-ra-collapsed`, set by `mountLargeTitle` in `appnav.js`
  from one `IntersectionObserver` on that `h1`, re-aimed when the chapter changes) a blurred surface with a hairline,
  drawn by `::before` on the bar (not the bar itself: a `backdrop-filter` on the bar would trap the `position: fixed` search
  sheet inside it), and the bar title of the landings, calculator and Settings fades in. The bar is icon-only at every
  width; the chapter menu is the title.
- **Components.** All in `skin-app.css`; every one is the website look's markup with new CSS, no new elements:

  | Part of the file | Components (selectors it restyles) |
  |---|---|
  | 1 tokens and frame | `--app-*`, `--site-gutter`, `--site-width` per page |
  | 2 ground and bars | the bar surface, icon buttons, chapter / block menu button and panel, the level control (`.ra-level-seg`), sheets that open from the bar |
  | 3 large title and type | `h1` title, kickers (`.tb-eyebrow`, `.tb-ch-kicker`, `.sp-eyebrow`…), `.tb-lead`, `h3` / `.tb-hv3` (title2), `h4` (headline), tier badges, hidden-level hint |
  | 4 controls | `.tb-btn` / `.sp-btn` (outline, `--primary` wine), `.tb-seg` + `.tb-seg-btn` and `.sp-seg` (segmented control with a raised thumb), focus rings |
  | 5 tab bar, 6 settings | `.ra-tabbar`, `.ra-tab`, the 96 px rail; `.st-*` grouped lists, the three-way Look control, switches |
  | 7 chapter hub and lists | `.tb-hub*`, `.tb-tiles` / `.sp-tiles` and `.tb-hubch` / `.sp-hubch` (grouped lists with chevrons), `.tb-pager` (Previous / Next button row), the level picker, `.ra-a3d`, `.ra-watch` |
  | 8 block chapter | `.tb-ind-list` (pills), `.tb-glance` (grouped rows), `.tb-bsec`, `.tb-layers`, `.tb-dose` (the one accent card, mono values; `.tb-dose-last` a warning panel), `.tb-cov*`, `.tb-bsec--complications` (warning panel), `.tb-pearls`, `.tb-exam*` |
  | 9 callouts, tables, folds | `.tb-callout` / `.sp-callout` (`--warn` bad, `--pearl`, `--note`), `.tb-keypoints`, `.tb-steps`, `.tb-table-wrap` and `.sp-table-wrap` (rounded, scroll inside), `.tb-details` / `.sp-details` and `.ra-more` (rows with a chevron) |
  | 10 scan teacher and real scans | `.tb-scan` card, `.tb-scan-views`, `.tb-scan-labbtn` (chip), `.tb-scan-steps` (button row), `.tb-scan-text`, `.tb-scan-nav`, `.ra-scan-chip` (pills), `.ra-scan-test`, `.ra-cov-chips`, `.ra-rs-*` (the Real view: picker, key as a grouped list with switches, `.ra-rs-switch`) |
  | 11 guides | `.ra-dg-item` (folds), `.ra-dg-step*` (panels in the clinical colours), `.ra-dg-choice` (answer buttons) |
  | 12 search and menus | `.tb-sheet` / `.sp-sheet` (bottom sheet on phones, centred dialog from 768 px; a wide `box-shadow` dims the page), `.tb-sresults`, the chapter menu panel as a bottom sheet below 768 px |
  | 13 `/blocks/` and the landings | `.bd-*` (contents rows, folds, A to Z, chooser chips and rows, result lists), `.tb-hero`, `.tb-section`, `.tb-cards`, `.tb-op` (choice buttons), `.tb-facts`, `.tb-opts` |
  | 14 calculator | `.lc-*`: box cards, filled inputs, segmented sex control, the adrenaline switch, agent rows, the result card (`data-status` near / over: amber and red with words and an icon), links list |
  | 15 spinal | `.sp-*` chrome, `.sp-jump` (grouped list), `.sp-tabs`, `.ts-choice`, the boxed cards (`.tq-*`, `.cx-*`, `.sx-*`, `.cd-*`, `.ts-*`), the Topics button and sheet |
  | 16 brachial plexus | `.top`, `.panel*`, `.tabs`, `.chip`, `.bpus-*`, `.bpd-*`, `.v3d-*`, `.cv-*` (frames and controls; canvases and clinical colours untouched) |
  | 17 plexus | `body.px` column and title (the page already uses the app kit's pieces) |
  | 18 foot | `.tb-foot`, `.sp-foot`, `.foot`, `.ntf-footer` |
  | 19 page-local widgets | the choosers, planners and figure frames defined in single pages' own CSS (hip fracture chooser, knee plan, thigh planner, foot and ankle panels, back quiz, `*-fig-stage` frames, the spinal pager, real-scan picker, neuro check, tier badges), mono-capital labels as captions, fields, the brachial bar order, scroll padding above the tab bar, `max-height` of sheets (`!important`: the page scripts set it inline) |
  | 20 review fixes | small corrections found by looking at every page type at 390, 768 and 1440 px: links inside the wine dose card are ivory, hub chapters are a grouped list like the lists above them, planner choices are a two-column grid on a phone, plexus kickers and level buttons in the shared type, the brachial bar is 56px, the page clears the tab bar by 16px more than its height |
  | 21 phase 3 | the bar's `.ra-bact` buttons (search, Safety) and `.ra-titlerow`; the three new screens: Safety (`body.sf-app`: segmented control, panels), Indication (the `/blocks/` chooser rules), Ultrasound anatomy (`.us-*`: region chips, grouped lists with thumbnails) |

- **Tab bar.** `initAppFeel` (appnav.js) draws `nav.ra-tabbar` while the app look is on and removes it when it is off, so the
  website look has no extra element. Five topic tabs (16 Oct 2026, decided with the owner): **Blocks** (`/blocks/`), **3D anatomy**
  (`/plexus/`), **Ultrasound** (`/blocks/ultrasound/`), **Indication** (`/blocks/indication/`) and **Settings**. The current tab
  (`currentTab(path)`) is the page's area: Settings, Anatomy in 3D, and the Ultrasound and Indication screens have their own;
  every other page (the front door, the landings, every engine page, `spinal/`, `brachial-plexus/`, the calculator, Safety) is
  Blocks, so a block page reached from Ultrasound or Indication is Blocks again. Exactly one has `aria-current="page"`, a blush
  pill behind the icon and a semibold wine label. Line icons, 12px labels, 52 px plus the home-indicator inset; the page's
  bottom padding clears it (reserved in CSS, so nothing jumps). From 1024 px it is a 96 px rail, `body` gets 96 px of left padding, and the desktop
  navigation rail (`mountRail`, still built) is hidden: a page's chapters are in the app bar's chapter menu, as they
  already are wherever the rail was. No tab bar in an iframe or `body.px-embed` (the embedded explorer). Reading order follows
  the picture: the bottom bar is the last element of `body`; from 1024 px (a rail down the left) `mountTabBar` moves it to just
  after the skip link, and back when the window narrows. The five labels share the width, so at 360 px "3D anatomy" (semibold when
  current) must fit without an ellipsis (no side padding on a tab; at 320 px the current tab is not semibold and the letters are a
  little tighter): `audit` any new label at 320 and 360.
- **The top bar (app look).** On every regional page the bar holds: back (or home) as before, the chapter / block / plexus menu
  (as the title), a **search** button (44 px; the page's own search button where it has one, otherwise `.ra-bsearch`, which goes to
  `/blocks/#search`), the red **Safety** button (`a.ra-safety`: the word and a warning-triangle icon, danger colour pair, 44 px, to
  `/blocks/safety/`) and the level control where the page has one. `mountBarActions` in `appnav.js` adds the two buttons by script
  while the app look is on and removes them when it is off, so the website look's bar is exactly what it was (no Safety button
  there). Below 480 px the menu does not fit beside four 44 px targets at 360 px, so the same `.tb-chmenu` / `.sp-chmenu` /
  `.bp-blockmenu` element moves into `div.ra-titlerow` under the bar (not sticky; the bar then gets its surface once that row has
  scrolled under it) and moves back when the window is wider or the look is switched. Page code must not look the menu up inside
  the bar (`bar.querySelector('.tb-chmenu…')`): use `document`. The bar's Settings button is hidden in the app look (Settings is a tab).
  Where the bar also holds the level control (`.lc-bar`: Safety, Indication, Ultrasound, the calculator) the page name in the bar
  is hidden below 480 px (it would be "S…"); the tab, the large title and the Safety button say where you are, so keep the bar
  titles short ("Indication", "Ultrasound") for the wider windows. At 320 px the bar's side padding is 3px and the Safety button
  tighter (everything stays 44 px).
- **The bar and the header.** In the app look the NTF site header and the breadcrumbs are hidden on every regional page
  (the app is the whole screen); the website look keeps them, in a browser tab and (if chosen in Settings) on the home
  screen too. `appnav.css` still hides them in home-screen mode for a page that has no skin yet (script blocked). Still one
  sticky bar at the top (≤ 56 px at 390 px); the tab bar is a bottom bar and does not count. Anything that sticks under the
  bar still uses `top: var(--ra-bar-now, var(--ra-bar, 56px))`.
- **Adding a regional page.** Put the skin script and the `skin-app.css` link in its `<head>` (§DATA.md 1), call
  `initAppFeel` as before; a new component class needs a rule in `skin-app.css` (in the right section) so it has an app look.
- **Checks.** `shared/regional/test/skin.mjs` (resolution, tab bar, frame, same text in both looks) and the website-look screenshots
  of ten pages at 390 and 1440 px (`ra-skin=web`, before and after: they must be pixel-identical). Light only, nothing under
  12 px, targets at least 44 px, focus rings visible, reduced motion respected, no emoji.
