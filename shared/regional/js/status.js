// Regional anaesthesia app: block-status colours and line styles (plan §8), one set for the engine coverage maps,
// brachial-plexus and plexus. Status is shown by colour AND line style together, so it never relies on colour alone.
// CSS twin: ../css/status.css (same values as custom properties). Change a colour here and there, nowhere else.
// Owner sign-off pending on the colours (target dark green with a wine halo, variable orange dashed).
//
//   STATUS                       { target, covers, variable, spares } -> {color, label, width, dash, opacity, halo?, hatch?}
//   STATUS_ORDER                 ['target', 'covers', 'variable', 'spares']
//   STATUS_COLOURS               { target: '#166534', ... } (drop-in for plexus/js/diagram.js STATUS_COLOURS)
//   INJECTION, LA                injection marker and local anaesthetic colours
//   statusStyle(status, {scale}) -> SVG attributes { stroke, 'stroke-width', 'stroke-dasharray', 'stroke-opacity' }
//   applyStatus(svgEl, status)   sets those attributes and data-status on an SVG element
//   statusCssVars()              -> 'name:value;…' string of the CSS custom properties (for inline style / shadow roots)
//   ensureStatusCss()            adds <link rel=stylesheet href=…/css/status.css> once (pages need not link it)
//   DENSITY_STATUS               coverage density -> status: dense/moderate -> covers, patchy -> variable
//   coverageFills(svg, prefix?)  adds <defs> patterns to an SVG coverage map and returns
//                                { dense, moderate, patchy } fill values: dense solid green, moderate green stipple,
//                                patchy (variable) orange hatch. Pair with class "tb-cov--st" on the figure so the
//                                legend swatches (status.css) match.

export const STATUS = Object.freeze({
  target: Object.freeze({ color: '#166534', label: 'Target', width: 3, dash: null, opacity: 1, halo: '#633d3c' }),
  covers: Object.freeze({ color: '#16a34a', label: 'Covered', width: 2, dash: null, opacity: 1 }),
  variable: Object.freeze({ color: '#c2410c', label: 'Variable', width: 2, dash: '6 4', opacity: 1, hatch: true }),
  spares: Object.freeze({ color: '#94a3b8', label: 'Spared', width: 1.5, dash: '3 4', opacity: 0.55 }),
});
export const STATUS_ORDER = Object.freeze(['target', 'covers', 'variable', 'spares']);
export const STATUS_COLOURS = Object.freeze(Object.fromEntries(STATUS_ORDER.map((k) => [k, STATUS[k].color])));

/** Injection marker: ink with an ivory ring. */
export const INJECTION = Object.freeze({ fill: '#1f1a17', ring: '#fffaf0' });
/** Local anaesthetic: the engine scan's LA blue (scan.js LA_FILL / LA_EDGE), for diagrams and the 3D LA blobs. */
export const LA = Object.freeze({ color: '#409ede', fill: 'rgba(64,158,222,0.78)', edge: '#1d5f96' });

export function statusStyle(status, { scale = 1 } = {}) {
  const s = STATUS[status];
  if (!s) return {};
  const out = { stroke: s.color, 'stroke-width': String(s.width * scale) };
  if (s.dash) out['stroke-dasharray'] = s.dash.split(' ').map((n) => String(Number(n) * scale)).join(' ');
  if (s.opacity !== 1) out['stroke-opacity'] = String(s.opacity);
  return out;
}

export function applyStatus(svgEl, status, opts) {
  if (!svgEl) return svgEl;
  for (const a of ['stroke-dasharray', 'stroke-opacity']) svgEl.removeAttribute(a);
  for (const [k, v] of Object.entries(statusStyle(status, opts))) svgEl.setAttribute(k, v);
  if (STATUS[status]) svgEl.setAttribute('data-status', status); else svgEl.removeAttribute('data-status');
  return svgEl;
}

export function statusCssVars() {
  const v = STATUS_ORDER.map((k) => `--ra-st-${k}:${STATUS[k].color}`);
  v.push(`--ra-st-halo:${STATUS.target.halo}`, `--ra-inj:${INJECTION.fill}`, `--ra-inj-ring:${INJECTION.ring}`, `--ra-la:${LA.color}`);
  return v.join(';');
}

/** Add the status stylesheet once, resolved next to this module (no page edits needed). */
export function ensureStatusCss() {
  if (typeof document === 'undefined' || document.querySelector('link[data-ra-css="status"]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL('../css/status.css', import.meta.url).href;
  l.dataset.raCss = 'status';
  document.head.append(l);
}

export const DENSITY_STATUS = Object.freeze({ dense: 'covers', moderate: 'covers', patchy: 'variable' });

let fillSeq = 0;
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (parent) parent.append(n);
  return n;
}
/** Status fills for a coverage map. Dense: solid covers green. Moderate: covers green stipple. Patchy: variable orange hatch. */
export function coverageFills(svg, prefix = 'rast') {
  fillSeq += 1;
  const id = (n) => `${prefix}-${n}-${fillSeq}`;
  const d = svgEl('defs', {}, svg);
  const dots = svgEl('pattern', { id: id('mod'), width: 6, height: 6, patternUnits: 'userSpaceOnUse' }, d);
  svgEl('rect', { width: 6, height: 6, fill: 'rgba(22,163,74,.30)' }, dots);
  svgEl('circle', { cx: 3, cy: 3, r: 1.3, fill: STATUS.target.color }, dots);
  const hatch = svgEl('pattern', { id: id('var'), width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
  svgEl('rect', { width: 6, height: 6, fill: 'rgba(194,65,12,.16)' }, hatch);
  svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: STATUS.variable.color, 'stroke-width': 2 }, hatch);
  return { dense: STATUS.covers.color, moderate: `url(#${id('mod')})`, patchy: `url(#${id('var')})`, defs: d };
}
