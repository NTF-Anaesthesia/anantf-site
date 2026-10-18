Part of the regional data guide; index: ../INDEX.md

## 6. Other helpers (`shared/regional/js/ui.js`, `bmode.js`)
`stepper({steps:[{short, title, body}], idPrefix, scrollTo, onStep(i), label})` → `{el, go(i), keys(el), current}`: the
scan viewer's step-through look for your own figures (step buttons `#<idPrefix>-step-<n>` are deep links, Back / Next,
`onStep` redraws your figure, `keys(fig)` adds left/right arrow keys). Optional; local steppers keep working.
`bmode.js` also exports `buildBModeAsync(scene)` (phased build, yields to the browser), `isBuilt(scene)` and
`shadowDepthAt(scene, xMm)`; `scene.js` `warpY(prof, x, y)` accepts an array of profiles.
`el(tag, attrs, …children)`, `sv(tag, attrs, parent)`, `fill(node, html)`, `callout('key'|'warn'|'pearl'|'note',
{title, body})`, `keyPoints([…])`, `steps([{title, body}])`, `table({head, rows, caption, stack})` (cells: HTML or
`{th:true, html}`), `details({summary, body})`, `registerSearch([{title, text, id}])` for text inside SVG/canvas.
Use `tb-` classes from `regional.css`; prefix page-only classes (`bk-`, `cw-`, `aw-`).
