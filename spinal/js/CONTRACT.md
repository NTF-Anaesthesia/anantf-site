# spinal/ builder contract (temporary; deleted before merge)

DESIGN.md is binding. This is a short summary of the shared code that B1 owns, so you can build your section against it.

## Files you own

- `js/sections/<section>.js`: your module (the stub here is a placeholder, so overwrite it)
- `css/<section>.css`: your styles (already linked from index.html with `?v=1`)
- `js/<section>/*.js`: private helpers (e.g. `js/anatomy/kit.js`, `js/troubleshooting/tree.js`)

Don't edit `index.html`, `css/base.css`, `js/app.js`, `js/ui.js` or `js/refs.js`. Ask B1 instead.

## Module interface

```js
import { el, callout, cite } from '../ui.js?v=1';   // ALWAYS import with ?v=1 (see "Imports")

export const meta = { id: 'technique', prefix: 'tq', title: 'Performing a spinal' };
export const refs = {               // optional; ids MUST start with your prefix
  'tq-smith2020': { label: 'Smith 2020', text: 'Smith A, … <i>Journal</i> 2020;1:1–2.', url: 'https://doi.org/…' },
};
export function mount(root) {       // root = #mount-technique. Sync or async.
  root.append(el('p', { text: 'Hello' }));
  return { reveal(hashId) { /* open the tab/details/tree holding hashId */ return true; } };   // optional
}
```

- Render only inside `root`. The one exception is `#sp-live`, through `announce()`.
- app.js imports all 7 modules with `Promise.allSettled`, calls `registerRefs(mod.refs)` for every module first and then `mount(root)`. If yours throws, only your section shows "This part didn't load. Reload the page."
- After every mount has settled, app.js calls `finalise()` (numbers the citations), sets `body[data-sp-ready="true"]` and fires `document` event `sp-ready`.
- Deep links: give every addressable thing a real id that starts with your prefix (`#tq-positioning`). If the URL hash starts with your prefix and the element isn't visible (because it's inside a closed `<details>`, a hidden tab or a tree), app.js calls `reveal(hashId)` and then scrolls to it. If `reveal` is missing, app.js still opens any closed `<details>` ancestors.

## Imports (important)

Import shared modules with exactly these URLs: `'../ui.js?v=1'` and `'../refs.js?v=1'` from `js/sections/`, or `'../ui.js?v=1'` from `js/<section>/`.
A different query string creates a second copy of the module, and then your citations won't find the registered references.
Your own private files can be imported without a query string.

## Prefix rules

- Shared: `sp-`. Yours: anatomy `an-`, technique `tq-`, ultrasound `us-`, troubleshooting `ts-`, complications `cx-`, populations `pp-`, quiz `qz-`.
- This applies to classes, ids, data-attributes and CSS custom properties.
- Every selector in `css/<section>.css` starts with `.spinal-app .<prefix>-` or `#<prefix>-`, with no bare element selectors.
  Don't use `.card .note .warn .tabs .tab .active .wrap .row .bar .stage .progress .top .foot .eyebrow .page-* .reveal`.
- Colours come only from tokens: `--sp-*` for UI, `--an-*` for the anatomy plate and `--us-*` for ultrasound (all defined on `body.spinal-app` in base.css).
  Never read `--bg --ink --muted --line --accent`: couture.css pins them to light.
- For specificity: base.css styles headings as `.spinal-app main h3`. To restyle a heading, use `.spinal-app main .tq-x`.
- Square corners, no shadows, touch targets of at least 44×44px, transitions of 200ms or less (base.css disables them under reduced motion).

## ui.js API

```js
import { $, $$, esc, el, announce, callout, steps, table, tabs, segmented, figure, details,
         setupCanvas, whenVisible, onResize, reducedMotion, isDark, onThemeChange, token,
         uniqueId, cite, citeEl } from '../ui.js?v=1';
```

| export | signature | returns |
|---|---|---|
| `$`, `$$` | `(sel, root=document)` | Element or null / Array |
| `esc` | `(s)` | HTML-escaped string |
| `el` | `(tag, attrs={}, ...children)` | HTMLElement |
| `announce` | `(text)` | writes `#sp-live` (polite) |
| `callout` | `(kind, {title?, body})`, where kind is `key`, `warn`, `pearl` or `policy` | `<aside class="sp-callout …" role="note">` |
| `steps` | `([{title, body?, tag?, id?}])` | `<ol class="sp-steps">` |
| `table` | `({caption, head, rows, stack=true, id, className})` | `<div class="sp-table-wrap">` |
| `tabs` | `(host, [{id, label, sub?, panel}], {label, initial, onChange})` | `{select(id, focus?), current()}` |
| `segmented` | `([{value, label}], {label, value, onChange})` | `<div role="group">` with `.set(v)` and `.value` |
| `figure` | `({id, num, title?, caption, plate='paper' \| 'us' \| 'none', aspect='16/9' \| 'auto'})` | `{fig, stage, controls, caption, describe(text)}` |
| `details` | `({id, summary, body, open=false})` | `<details class="sp-details">` |
| `setupCanvas` | `(canvas, cssW, cssH)` | 2D context in CSS px (DPR aware); call it again on resize |
| `whenVisible` | `(el, onEnter, onLeave?)` | disconnect function |
| `onResize` | `(el, fn(rect))` | disconnect function (ResizeObserver, one call per frame) |
| `reducedMotion` | `()` | boolean |
| `isDark` | `()` | boolean (toggle or OS) |
| `onThemeChange` | `(fn(dark))` | unsubscribe function |
| `token` | `('--sp-ink')` | computed value string |
| `cite` | `(...ids)` | HTML string `<sup class="sp-cite">…</sup>` |
| `citeEl` | `(...ids)` | the same, as an Element |

Wherever a parameter says "body", "title", "caption", a table cell or a label, it accepts **either an HTML string (trusted literals only) or a Node**.

### Examples

```js
// el: attributes, events and children
const btn = el('button', { type: 'button', class: 'tq-go', 'aria-pressed': 'false', on: { click: go } }, 'Start');
root.append(el('p', { html: `Use <span class="sp-dose">2.5–3 mL 0.5% heavy bupivacaine</span>.${cite('hocking2004')}` }));

// callout (the kind label "Warning", "Key point", "Exam pearl" or "Check local policy" is added for you)
root.append(callout('policy', { title: 'Anticoagulation intervals', body: `<p>Follow the NTF protocol.${cite('asra2025','esaic2022')}</p>` }));

// steps
root.append(steps([
  { id: 'tq-prep', title: 'Prepare', body: '<p>Check, consent, monitor.</p>', tag: '5 min' },
  { title: 'Position', body: 'Sitting or lateral.' },
]));

// table (stacked into cards at ≤640px by default; stack:false gives a scrolling grid)
root.append(table({ caption: 'Needle types', head: ['Needle', 'Tip', 'PDPH'], rows: [[{ html: 'Whitacre', th: true }, 'Pencil point', 'Lower']] }));

// tabs
const t = tabs(host, [
  { id: 'tq-sitting', label: 'Sitting', sub: 'Easier midline', panel: el('p', { text: '…' }) },
  { id: 'tq-lateral', label: 'Lateral', panel: '<p>…</p>' },
], { label: 'Position', onChange: (id) => {} });
t.select('tq-lateral');

// segmented
const seg = segmented([{ value: 'mid', label: 'Midline' }, { value: 'para', label: 'Paramedian' }], { label: 'Approach', value: 'mid', onChange: draw });
f.controls.append(seg);

// figure + canvas
const f = figure({ id: 'an-fig-layers', num: '1.1', caption: 'Layers the needle passes.', plate: 'paper', aspect: '16/9' });
const cv = el('canvas', { role: 'img', 'aria-label': 'Sagittal section of the lumbar spine' });
f.stage.append(cv); root.append(f.fig);
const draw = () => { const r = f.stage.getBoundingClientRect(); const ctx = setupCanvas(cv, r.width, r.height); /* … */ };
whenVisible(f.fig, draw); onResize(f.stage, draw); onThemeChange(draw);
f.describe('Layer 5 of 7: epidural space.');

// details
root.append(details({ id: 'cx-pdph-more', summary: 'Why pencil-point needles help', body: '<p>…</p>' }));

// cite
el('p', { html: `Failed spinal is common.${cite('fettes2009')}` });
para.append(citeEl('nap3', 'reynolds2001'));
```

Doses, depths and numbers go in `<span class="sp-dose">` or `<span class="sp-num">` (mono, tabular). For a small mono chip, use `<span class="sp-chip">2 min</span>`.
Generic buttons are `.sp-btn` and `.sp-btn--primary`. The figure layout at 1100px and wider is `.sp-split` (prose column + `.sp-split-fig`, which is sticky).

## Core reference ids (refs.js)

`asra2025 esaic2022 aagbi2013 nap3 fettes2009 hocking2004 broadbent2000 reynolds2001 perlas2016 chin2011 uppal2023 zaric2009 iso80369-6`
are verified against PubMed and Crossref (see `refs-verification.md` in the scratchpad). Reuse them; don't duplicate them. Before you add a module ref, check it on PubMed or doi.org, and never invent one.
An unknown id renders `[?]` and logs a `console.warn`, which fails the test.

## Testing

```sh
python3 -m http.server 8801 --directory /home/user/anantf-site   # in the background
```
Then use Playwright (`require('/opt/node22/lib/node_modules/playwright')`, `executablePath: '/opt/pw-browsers/chromium'`) to load
`http://localhost:8801/spinal/`, wait for `body[data-sp-ready="true"]`, and check:
- there are no console errors or warnings
- `document.documentElement.scrollWidth <= innerWidth` at 390px
- both themes work: `colorScheme: 'dark'` and clicking `#sp-theme` (Auto → Light → Dark)
- deep links work: `/spinal/#<your-id>` reveals and scrolls to the target
- keyboard-only use works

Take screenshots at 1440 and 390 in light and dark, and look at them.
