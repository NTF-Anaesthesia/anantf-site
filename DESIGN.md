# NTF Anaesthesia design language

The default look for every new or edited page on anantf.com. Warm paper, ink text, one wine accent,
square edges and hairline rules. Light only. The popliteal block page (`ra.html`) is the reference
for interactive teaching apps.

The full design system (brand book, tokens, component previews, logos and illustrations) is the
"NTF Anaesthesia" Design System artifact: https://claude.ai/artifact/ToxR5xJfay9WZuScHZxTVp
(private to its owner; this file holds everything needed to build a page).

## Rules

- **Light only.** No dark theme, no theme toggle, no `prefers-color-scheme: dark` styles. Pin apps with
  `<html data-theme="light">` and `<meta name="color-scheme" content="light">`.
- **One accent.** Wine `#633d3c` for links, actions, the current item, selected states and the focus
  ring. No teal, blue or purple interface colours.
- **Square.** `border-radius: 0` on cards, buttons, panels, inputs and tags. Only true circles (dots,
  step numbers, the round email button) stay round.
- **Rules, not boxes.** Structure comes from 1px `#d7d2c8` hairlines. Shadows only on things that
  float (dropdown menus, the mobile drawer).
- **Readable.** Body 17px, nothing below 12px (12px only for short capitalised labels), running text
  at least 15px, body lines within 68ch, links underlined or otherwise not signalled by colour alone.
- **Teaching colours stay.** Anatomy, ultrasound and block-status colours are clinical codes: nerves
  yellow, arteries red, veins blue; danger and warning colours keep their meaning. Don't recolour them
  to the brand or to sepia.
- Plain English, British spelling, sentence case for titles, verb-first links ending in ↗, no emoji.

## Colours

| Token | Value | Use |
|---|---|---|
| paper | `#f7f5ef` | Page ground, header, footer, controls |
| submenu (inset) | `#eee9df` | Inset panels: key points, notes, panel headers |
| panel | `#eeece5` | Quiet filled surfaces, form panels |
| card | `#efede6` | Resource-feature blocks |
| banner | `#f0e7d8` | Behind ETHER illustrations |
| cover | `#f3ece1` | Homepage landing cover |
| hover | `#e9e5dc` | Hover fill (rows at 40%) |
| blush | `#e8ded7` | Selected item, with a wine border |
| ink | `#272722` | Headings and body text (13.8:1) |
| ink-soft | `#504e47` | Secondary copy close to ink |
| muted | `#55534d` | Leads, descriptions, breadcrumbs, footer (7.1:1) |
| wine | `#633d3c` | The accent (8.5:1) |
| wine-hover | `#4b2e2d` | Hover on wine fills |
| ivory | `#fffaf0` | Text on ink or wine |
| line | `#d7d2c8` | Hairline rules (decorative) |
| line-strong | `#8f8574` | Link underlines, badge borders (3:1) |
| control-line | `#827b6d` | Borders of controls and inputs |

Selected states, as on `ra.html`: a solid wine fill with ivory text (tabs, Play), or blush with a wine
border (a chosen item). Unselected controls are outlined in `line` on paper.

## Type

Fonts are in `fonts/`: Fraunces (`fraunces-roman.woff2`, `fraunces-italic.woff2`) for headings,
Inter (`inter.woff2`) for everything else, JetBrains Mono (`jetbrains-mono.woff2`) for doses and values.
The shared stylesheets expose them as `NTF Serif`, `NTF Sans` and `NTF Mono`.

| Style | Font | Size / line height | Tracking |
|---|---|---|---|
| display (homepage) | Fraunces 400 | 96px / 1.05, clamp(54px, 6.4vw, 96px) | -0.035em |
| page title | Fraunces 400 | 72px / 1.1, clamp(44px, 5.5vw, 72px) | -0.03em |
| banner title | Fraunces 400 | 60px / 1.1 | -0.03em |
| section (h2) | Fraunces 400 | 34px / 1.2 | -0.02em |
| card (h3) | Fraunces 400 | 28px / 1.2 | -0.01em |
| lead | Inter | 19px / 1.6, max 42ch | |
| body | Inter | 17px / 1.65, max 68ch | |
| small text | Inter | 15px / 1.6 | |
| nav, actions, buttons | Inter (actions 500) | 15px | |
| meta, footer | Inter | 14px / 1.7 | |
| breadcrumbs | Inter | 13px | |
| kicker (capitals) | Inter | 12px / 1.5 | 0.08em |
| mono | JetBrains Mono | 15px | |

Never bold the serif. Headings use `text-wrap: balance`.

## Layout and components

- Content max 1240px with 56px side gutters (22px below 760px). Sections padded 36px; card grids gap
  30px; two-column gap 48px. Every link, summary and button at least 44px tall.
- Reuse the shared chrome and classes in `assets/` (`site-shell.css`, `header-nav.css`,
  `editorial-layout.css`): `ntf-header`, `ntf-footer`, `ntf-crumbs`, `page-hero`, `ether-banner`,
  `page-section`, `page-kicker`, `page-lead`, `page-grid`, `page-card`, `page-link`, `source-badge`.
- Page cards are ruled top and bottom, not boxed. The resource library is rows, not tiles.
- ETHER illustrations (`assets/ether-*.webp`) sit on `banner` with `mix-blend-mode: multiply`, faded in
  from the copy side, always `alt=""`.
- Focus ring: 2px solid wine, offset 4px. Respect `prefers-reduced-motion`.
