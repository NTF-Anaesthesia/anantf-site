Part of the regional engine guide; index: ../INDEX.md

### App frame (desktop layout, page changes, Settings)

Every regional page calls `initAppFeel({bar, search})` once; the engine block pages, `spinal/`, the calculator and
Settings also call `mountRail()` (`js/appnav.js`, styles `css/appnav.css`). Phones and tablets (below 1024 px) look as
before, apart from the Settings entry and the plain app bar on the region landings.

- **Frame (≥ 1024 px).** DESIGN.md's column: the app bar, breadcrumbs, `<main>` and the foot keep the site's width
  (`--site-width` 1240 px, `--site-gutter` 56 px; `--ra-frame-w` / `--ra-frame-g` point at them), so they line up with
  the site header (`.ntf-header`), which is not changed: it scrolls away and only the app bar sticks (≤ 56 px). The
  header has `position: relative; z-index: 60` (regional.css, landing.css, spinal, brachial-plexus, plexus) so its
  phone menu opens above the sticky bar and the page. `brachial-plexus/` and `plexus/` keep their own layouts, without
  a rail (they need the room for the 3D model and diagram); the region landings and `/blocks/` have no rail either
  (their operation chooser needs the full column).
- **Rail (≥ 1024 px).** `mountRail` wraps `<main>` in `.ra-frame` (a two-column grid inside the 1240 px column) with
  `nav.ra-rail` on the left: this page's chapters or sections ("On this page"), then this region's landing and pages,
  the other regions, and the tools (all blocks, then the same four tools as Part I of `/blocks/`: Emergency guides and dose calculator, Which block for which operation, Ultrasound anatomy, Anatomy in 3D; then Settings), from `REGION_NAV` /
  `TOOL_NAV`. The current page is `aria-current="page"`, the current chapter or section `aria-current="location"`
  (blush with a wine edge, as in the chapter menu). Engine pages and `spinal/` follow `body[data-chapter]`; Settings
  follows the section in view (`spy: true`). The rail is sticky under the bar, scrolls itself when taller than the
  window (never the page), and carries the chapters' `data-tier`, so the level hides the same entries as the chapter
  menu. Its column is reserved in CSS before the script runs (not on `/blocks/` or the landings), so the page never
  jumps sideways. With the rail, the bar shows the chapter menu (the current chapter's name) instead of repeating the
  chapters inline. The document stays the scroller.
- **Scan teacher width.** The scan teacher is a container (`container: ra-scan`): two columns (image + 320 px panel)
  only when its own box is at least 780 px wide (and the window at least 1000 px, as before), so beside the rail it is
  one column at 1024 px and two from about 1360 px; in a box under 620 px the image, steps, step text and
  Back · Play · Next come first, then the structures, coverage chips and probe. It stays in the page flow.
- **Page changes.** `@view-transition { navigation: auto }` in `appnav.css`: moving between regional pages, the site
  header (`ra-site-header`) and the app bar (`ra-appbar`: `#tb-bar`, `#sp-bar`, `#bp-bar`, `.ra-sbar`) stay put and the
  rest cross-fades in 160 ms. Off under `prefers-reduced-motion`; browsers without it (Firefox) just change page.
  `initAppFeel` adds a `<script type="speculationrules">` (only where `HTMLScriptElement.supports('speculationrules')`):
  links to regional pages on this site are **prefetched** (never prerendered: a prerendered page would run its scan
  canvases and 3D models in the background and could show a level chosen after it was rendered) on hover or press
  (`moderate`); never `lower-limb/anim/`, same-page `#` links, downloads or new-tab links.
- **Settings (`/blocks/settings/`).** Reached from every app bar: a row in the chapter / block / plexus menu
  (`settingsItem`), a bar button where the bar has no menu at that width (`settingsButton`: the landings' `.ra-sbar`,
  the calculator, `brachial-plexus/` from 1180 px (an icon, so the block chips keep their room), `plexus/` while its four
  plexuses are inline), and the rail's tools.
  It holds the level control (the same `mountLevelControl`), **"Hide the bar while scrolling down"** (`localStorage`
  `ra-autohide` = `on` / `off`; off by default), **"Press / to search"** (`ra-slash`; on unless `off`) and the app
  version lines (also still at the foot of `/blocks/`). Every read and write is in try/catch.
- **Bar auto-hide** (`ra-autohide` on). `initAppFeel` puts `.ra-appbar` on the bar. Scrolling down (more than 24 px,
  once the bar has stuck) sets `html[data-ra-bar=hidden]` and `--ra-bar-now: 0px`; the bar slides up 200 ms (instant
  with reduced motion). Any scroll up, the top of the page, focus inside the bar, or an open menu or search sheet brings
  it back. Only the reader's own scrolling hides it (a wheel, a finger moving the page, a scroll key or the scrollbar
  in the last 400 ms): scrolls the page makes itself (deep links, chapter changes, a scan step or Play reflowing the
  text, scroll anchoring) never do, and taps, a finger on a scan image or 3D canvas, hash and chapter changes keep it
  for a moment more. Everything that sticks
  under the bar uses `top: var(--ra-bar-now, var(--ra-bar, 56px))` and moves with it: the rail, the
  phone scan column (`scan.css`), the `/blocks/` and landing operation lists and `spinal/`'s figure splits. Use the
  same for anything new that sticks.
- **Keyboard.** "/" (not while typing in a box, and not when turned off in Settings) and Ctrl+K / Cmd+K open or focus
  the page's search (engine pages, `/blocks/`, `spinal/`, `plexus/`); pages without search ignore them. On a scan
  teacher, the left and right arrow keys change step on the image and on the step buttons (focus follows; Home / End).

Added to the home screen (`display-mode: standalone`), the app look is on (§2 "Skins"), which hides the NTF Anaesthesia site header and the breadcrumbs, so only the app bar and the tab bar show (owner, 16 Oct 2026; `appnav.css` keeps hiding them in home-screen mode only for a page that has no skin yet). The app is installable: `blocks/manifest.webmanifest` (id and start `/blocks/`, scope `/`, standalone, paper colours; icons in `blocks/icons/`, an "RA" mark in the MO guide's style) is linked from every regional page, which also gives each page a theme colour and an Apple touch icon. `/blocks/settings/` explains how to add it and shows an Install button where the browser offers one. `static.mjs` checks the manifest and the links.
