Part of the regional data guide; index: ../INDEX.md

## 1. Page template (`truncal/<page>/index.html`)

Copy `truncal/abdominal-wall/index.html` and change only: `<title>`, `<meta name="description">`, the last
breadcrumb (`<span aria-current="page">Chest wall</span>`), and `page.css` if you have one. Keep:

- `<html lang="en-GB" data-theme="light">`, `<meta name="robots" content="noindex, nofollow">`, `<meta name="color-scheme" content="light">`
- the site header (`ntf-header`, links `../../…`), breadcrumbs **Resources / Regional anaesthesia / Truncal blocks / <Page>**
  (`../../resources.html`, `../../regional.html`, `../`)
- `<div id="tb-bar"></div>` (the shell fills it), `<main id="main" class="site-container">` (the shell fills it; a
  `<noscript>` inside is fine), `<div id="tb-live" class="tb-sr" aria-live="polite" aria-atomic="true"></div>`
- the `tb-foot` block (the credit **"Created by Dr Koh Wenjun and <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>,
  NTF Anaesthesia"**, only here at the foot of the page and never at the top, with a link back to `../`; no "for
  education only" notice, since the app is for the department's own juniors), then `ntf-footer`
- `<body class="tb-app">`, stylesheets `../../assets/navigation.css`, `site-shell.css`, `header-nav.css`,
  `../../shared/regional/css/regional.css?v=20261018` (it imports `appnav.css`: desktop frame and rail, bar auto-hide,
  view transitions), and `<script type="module" src="js/page.js?v=20261026"></script>`
- **the two looks** (ENGINE.md §2 "Skins"): the one-line inline skin script right after the `robots` meta (copy it from
  `truncal/abdominal-wall/index.html`; the same text on every regional page, `shared/regional/test/skin.mjs` checks it) and, after
  your own stylesheets and just before the manifest link,
  `<link rel="stylesheet" href="../../shared/regional/css/skin-app.css?v=20261026">`
- nothing else for the desktop layout: the shell wraps `<main>` in `.ra-frame` with the rail (ENGINE.md §2 "App frame")
