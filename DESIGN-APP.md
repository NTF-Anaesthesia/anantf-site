# NTF Anaesthesia app design language

The phone version of `DESIGN.md`, for installable web apps (anything with a service worker or a home-screen icon:
`babymo/`, `mo/`, `qbank/` and later ones). The aim: opened from the home screen, an app should feel like a native
iOS or Android app, and still be plainly NTF. The kit is `assets/app/app.css`; every component is shown in
`assets/app/specimen.html`. Teaching pages and the website keep `DESIGN.md`.

## What carries over, and what changes

**NTF identity (unchanged):** the palette (paper, ink, muted, wine, blush, hairline), one wine accent, Fraunces for
titles (never bold), Inter for everything else, JetBrains Mono for doses, timers and values, light only, nothing
under 12px, plain British English, sentence case, no emoji, the safe arrows only. Clinical colours (nerves yellow,
arteries red, veins blue, correct green, incorrect red, warning amber) keep their meaning.

**What changes, and why:**

| Website (`DESIGN.md`) | App (`DESIGN-APP.md`) | Why |
|---|---|---|
| Square edges everywhere | Soft corners on touchable and floating things (8–22px) | On a phone, a rounded, filled shape says "you can press this". Every native list, button, sheet and switch on iOS and Android is rounded; a square app reads as a web page in a frame, however good the behaviour. Text, rules and the palette carry the identity instead. |
| Rules, not boxes | Grouped inset lists: raised surface sections on a warm ground | The iOS Settings / Material list pattern is the strongest single "this is an app" cue. |
| One paper ground | Two layers: ground `#f1ede4`, surface `#fbfaf6` | Gives grouped sections and cards their edge without borders or shadows. |
| Page title 44–72px | Large title 34px that collapses into a 44px bar | Matches the iOS large title; leaves room for content at 390px. |
| Header, crumbs, footer | Top bar, bottom tab bar, sheets, toasts | Native navigation; the site header is not shown inside an installed app. |
| Hover states | Press states within 100ms; hover only with a mouse | Phones have no hover; feedback on touch is what feels native. |
| Focus offset 4px | Focus offset 2px (inset −3px in rows) | So the ring isn't clipped by rounded sections. |

**Dark mode: no, for now.** `DESIGN.md` is light only and the apps match it (pin `data-theme="light"`,
`color-scheme: light`). The tokens are all custom properties, so a dark set could be added later in one block if
the owner wants it for night theatre lists; that is the owner's decision, not a default.

**Where this departs from the qbank/Baby MO spec** (`design-spec.md`, 15 Oct 2026): that spec keeps square edges
on every object and relies on behaviour alone. This language keeps all of its behaviour (bars, sheets, safe areas,
history, press feedback, offline) and its tokens for correct, incorrect and warning, but adds the shape and layering
that native apps share: rounded controls, grouped inset sections on a ground, a raised segmented thumb rather than a
wine-filled segment, an iOS-style switch, pill chips, a blush indicator behind the active tab, translucent blurred
bars, and spring-like curves. Its components map one to one onto the kit's classes, so the apps can adopt it without
changing structure.

## Tokens

All on `:root` in `app.css`, prefixed `--app-`.

**Colour.** ground `#f1ede4`; surface `#fbfaf6` (rows, cards, sheets, choices); paper `#f7f5ef` (plain reading
screens); inset `#eee9df` (explanation panels); fill `#e6e1d6` (tracks, skeletons, segmented background); pressed
`#e9e5dc` (on surface) and `#e3ded3` (on ground); blush `#e8ded7` (selected); ink `#272722`, ink-soft `#504e47`,
muted `#55534d`; wine `#633d3c`, wine-press `#4b2e2d`, ivory `#fffaf0`; line `#d7d2c8`, line-strong `#8f8574`,
control `#827b6d`. Clinical: ok `#1f6b3a` on `#e3efe4`, bad `#a3262a` on `#f6e1df`, warn `#7a4f00` on `#f5ead2`.
Bars are surface at 84% with `backdrop-filter: saturate(1.6) blur(18px)` (solid surface where unsupported).

**Type.** `1rem = 17px`. On touch devices, iOS Dynamic Type sets the root size (`font: -apple-system-body`), and
Android's font size scales it too, so use the tokens, never fixed pixels.

| Token | Size / line | Font | Use |
|---|---|---|---|
| large | 34 / 1.2, −0.02em | Fraunces 400 | Screen title |
| title1 | 28 | Fraunces 400 | Score in a ring |
| title2 | 22 / 1.25 | Fraunces 400 | Card titles, empty states, in-content headings |
| headline | 17, 600 | Inter | Bar and sheet titles |
| body | 17 / 1.47 (reading 1.6) | Inter | Rows, choices, buttons (600), text |
| callout | 16 | Inter | Spare |
| subhead | 15 / 1.45 | Inter | Secondary row text, chips, segments, toasts |
| footnote | 13 / 1.45 | Inter | Section footers |
| caption | 12, capitals 600, +0.07em | Inter | Section headers, kickers, badges, tab labels |

Inputs are at least 16px so iOS never zooms. Numbers use tabular figures.

**Space.** 4px grid: 4, 8, 12, 16, 20, 24, 32. Side gutter 16px (24px from 768px).

**Shape.** 6px badges; 8px row icon tiles and segment thumbs; 12px buttons, inputs, choices, toasts, panels; 14px
grouped sections and cards; 22px top corners of sheets; full round for switches, chips, pills, tab indicator,
progress, the grabber. Corners nest: something inside a 14px card is 12px or less.

**Elevation.** None on content. A thumb shadow on the segmented thumb and switch knob; one float shadow for sheets
and toasts.

## Layout at 390×844

- `<html class="app">`, `<body class="app-body app-has-tabbar">` (or `app-has-toolbar` in a task).
  `viewport-fit=cover`; manifest `display: standalone`, `theme_color` and `background_color` `#f1ede4`.
- Top: `.app-bar`, sticky, safe-area top padding, 44px row: leading (back), centred inline title, trailing actions.
  Transparent at rest; once the large title scrolls under it, it gains the blurred surface and a hairline and its
  title fades in (`.is-collapsed`, set by an IntersectionObserver on `.app-large-title`).
- Content: `.app-main`, max 680px, 16px gutters plus side safe areas, bottom padding clears the tab bar.
- Bottom: `.app-tabbar`, 52px plus the home-indicator inset, 2 to 5 tabs. Hidden during a test or practice
  session; a `.app-toolbar` (Back, Flag, Next) takes its place.
- Nothing scrolls sideways except a chip row. Test at 390×844, 360×780 and 320×640.

**Larger screens.** From 768px the gutter is 24px and sheets become centred dialogs (no grabber). From 1024px the
tab bar becomes a 96px left rail and content stays a centred 680px column. Never stretch rows to full desktop width.

## Components

All in `app.css`, all shown in `specimen.html`.

- **Large title** `.app-large-title` (h1) plus optional `.app-large-sub`.
- **Top bar** `.app-bar > .app-bar-row > .app-bar-lead / .app-bar-title / .app-bar-trail`. Buttons
  `.app-bar-btn` (44×44, wine, fade to 45% on press); back is `.app-bar-btn.app-back` with the parent screen's name.
  `.app-bar--solid` for always-solid bars (sessions).
- **Tab bar** `nav.app-tabbar > .app-tabbar-inner > a.app-tab[aria-current="page"]`, each a 24px line icon in
  `.app-tab-icon` over a 12px label. Active: wine label, 600, and a blush pill behind the icon (shape and colour,
  never colour alone). Optional `.app-tab-badge` count.
- **Grouped list** `.app-section > .app-section-header + ul.app-list > li > .app-row` + `.app-section-footer`.
  Row anatomy: `.app-row-icon` (30px blush tile; `--ink`, `--bad`), `.app-row-body` (`.app-row-title` 17,
  `.app-row-sub` 15 muted, `--clamp` for two lines), `.app-row-value`, `.app-badge`, `.app-row-chevron` or a
  `.app-switch`. Rows are `a`, `button` or `label` (the whole row is the target), at least 50px. Hairlines are
  inset to the text and half a pixel on retina. Variants: `--action` (wine), `--danger` (red). States: rest,
  pressed (instant fill), focus.
- **Card** `.app-card` (surface, 14px, 16px padding), `.app-card-title`, `.app-card-actions`. `--accent` is the
  wine card for the one main call to action on a screen; at most one per screen.
- **Buttons** `.app-btn` + `--primary` (wine), `--secondary` (blush, wine text), `--outline`, `--plain`,
  `--danger`; `--block` full width, `--compact` 44px. Default 50px, 17px 600. Pressed: scale 0.97 and a darker
  fill. Disabled: 40% and `disabled` or `aria-disabled`. Rows of buttons: `.app-btn-row`; stacks: `.app-btn-stack`.
  One primary per screen.
- **Answer choices** `.app-choices > button.app-choice > .app-choice-letter + .app-choice-text (+ .app-choice-tag)`.
  At least 56px, text wraps and stays selectable. States: rest, pressed, `.is-selected` (blush, 2px wine, filled
  letter), `.is-correct` (green fill and border, a short pop), `.is-incorrect` (red, a short shake), `.is-answer`
  (green border on surface: the right answer after a miss), `.is-dimmed` (the rest: muted text, no fill, a
  hairline border; never opacity, which took the text below 4.5:1). After feedback add
  `.is-locked` to the group. Always pair colour with words: the tag ("Yours", "Answer", "Correct") and the
  accessible name ("B, Thyromental distance, your answer, incorrect").
- **Segmented control** `fieldset.app-segmented > legend + label.app-seg > input[type=radio] + span`. 2 to 4
  segments, one row, 44px. Selected: a raised surface thumb with wine 600 text. Radios give arrow-key use for free.
- **Switch** `input[type=checkbox][role=switch].app-switch`, 51×31, wine when on, knob stretches while pressed. Put
  it in a `label.app-row` so the whole row toggles.
- **Radio rows** `label.app-row > input[type=radio]` in a section: use instead of a segmented control when there
  are more than 4 options or any label is long (a segmented control holds 2 to 4 short ones).
- **Chips** `.app-chips > button.app-chip[aria-pressed]`, optional `.app-chip-count`. One row that scrolls
  sideways and bleeds to the screen edge; 36px pill drawn inside a 44px target. On: blush, wine border, tick. After a label on the
  same line use `.app-chips--inline` (bleeds right only). Don't put the site's older `.chip` class on the same
  element: page CSS such as `assets/couture-app.css` paints a square fill behind the pill.
- **Badges and pills** `.app-badge` (`--ink`, `--ok`, `--bad`, `--warn`), `.app-pill` (counters such as "Q 3/10",
  timers with `.app-mono`).
- **Fields** `label.app-field > .app-field-label + .app-input`, `aria-invalid="true"` plus `.app-field-error`.
- **Progress** `progress.app-progress` (4px, wine, `--ok`); `.app-ring` with an SVG (`pathLength="100"`, set
  `--app-ring: 80`) and `.app-ring-label`; `--ok` for a pass. The ring draws once, 700ms.
- **Bottom sheet** `dialog.app-sheet` opened with `showModal()` (focus trap and Esc for free) >
  `.app-sheet-grabber`, `.app-sheet-head` (title centred, Done/Close at the right), `.app-sheet-body` (scrolls),
  `.app-sheet-foot` (sticky actions above the safe area). Detents: `--medium` (55dvh), `--large` (92dvh), or fit
  content. Tap the backdrop or drag the head down past 120px (or flick) to close; focus returns to the opener.
  Each sheet pushes a history entry so Android back closes it.
- **Toast** `.app-toast[role=status]` with `.app-toast-text` and an optional `.app-toast-action` (Undo); add
  `.is-visible` for 4 seconds. Sits above the tab bar or toolbar.
- **Panel** `.app-panel` for explanations and notes.
- **Empty state** `.app-empty` > `.app-empty-icon`, `.app-empty-title`, `.app-empty-text`, one button.
- **Skeleton** `.app-skeleton` (`--title`, `--line`, `--short`, `--tile`) inside real row shapes; `aria-busy` on the
  list. No spinners.

## Behaviour

- **Native basics (in the kit):** no tap highlight, `touch-action: manipulation` (no 300ms delay),
  `user-select: none` and no callout on controls, `overscroll-behavior-y: contain` (no accidental pull-to-refresh,
  bounce kept), `100dvh`, safe areas on every edge bar.
- **iOS press states:** add `document.addEventListener('touchstart', () => {}, {passive: true})` once, or iOS
  ignores `:active`.
- **History:** every pushed screen and every sheet is a history entry (hash routes), so the iOS edge swipe and
  Android back always work. No dead ends in standalone mode.
- **Haptics:** `navigator.vibrate(10)` on answer feedback where supported (Android); nothing on iOS.
- Respond within 100ms of every tap; save state on every tap so a killed app resumes where it was.

## Motion

| What | Duration | Curve |
|---|---|---|
| Press in | 90ms | standard `cubic-bezier(.2,0,0,1)` |
| Fades, tab switch, chip/segment change | 150ms | standard |
| Switch knob, choice pop | 250ms | iOS `cubic-bezier(.32,.72,0,1)` / emphasised decelerate `cubic-bezier(.05,.7,.1,1)` |
| Push and pop screens | 350ms | iOS curve; new screen slides from the right, old one shifts 30% left and dims |
| Sheet up and down | 420ms | iOS curve; backdrop fades to 38% ink |
| Toast in / out | 420ms / 250ms | emphasised decelerate / accelerate `cubic-bezier(.3,0,.8,.15)` |
| Score ring | 700ms, once | emphasised decelerate |

Screen pushes use `document.startViewTransition` with `html[data-nav="push" | "pop" | "tab"]`; without it,
swap instantly. **Reduced motion:** every duration token drops to about zero, the skeleton stops shimmering, and the
push becomes a plain swap. No confetti, no sounds, no looping animation.

## Accessibility

- WCAG 2.2 AA: text 4.5:1 (every token pair above passes), controls 3:1 against their background (control borders,
  switch track border).
- Targets at least 44×44: rows 50, buttons 50 (compact 44; `--small` is 36 drawn, 44 to tap, for dense toolbars), segments 44, chips 44, bar buttons 44, tabs 52.
- Focus visible on everything: 2px wine ring, 2px offset; inset inside rows and tabs.
- Landmarks: `header` bar, `main`, `nav` tab bar with `aria-current="page"`. Icon buttons have `aria-label`;
  toggles use `aria-pressed`; switches `role="switch"`; the toast `role="status"`; sheets are labelled dialogs.
- State is never colour alone: tick on chips, tags on choices, indicator shape on tabs, words for screen readers.
- Holds at 200% text size and with iOS larger text (the rows grow; nothing truncates silently).
- axe clean (no serious or critical) at 390, 360 and 320px and on desktop.

## Do and don't

**Do**
- Use the kit's classes; add app-specific CSS only for content (figures, diagrams).
- Keep one primary button and at most one accent card per screen.
- Put settings and lists in grouped sections; put long reading on `paper` with `.app-text`.
- Give every screen a large title (top level) or a back button (pushed).
- End settings with the app-version lines from `AGENTS.md`, as rows.

**Don't**
- Don't use square-edged controls or the site header inside an app; don't use rounded corners on the website.
- Don't add colours beyond the tokens, a dark theme, gradients, or drop shadows on content.
- Don't use teal, blue or purple as interface colours, or recolour clinical codes.
- Don't put more than five tabs in the tab bar, or more than four segments in a control.
- Don't use hover-only affordances, spinners, emoji, or text under 12px.

## Kit notes from adopting apps (15 Oct 2026)

- The bar title is hidden (not only faded) until the large title scrolls away; add `.app-bar--instant` to the bar for
  one frame when the screen changes. Back labels truncate at 44vw and the bar title at 34vw, so neither wraps.
- The `hidden` attribute always hides a kit component (for example a tab bar hidden during a test).
- Clinical callouts, step lists, tables and monitor strips are app-specific: build them in the app's CSS from the kit's
  tokens rather than adding one-off components here.
