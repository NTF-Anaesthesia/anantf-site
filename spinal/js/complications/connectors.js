// Schematic Luer vs NRFit connector figure (B6). Original drawing; schematic, not to scale.

import { el } from '../ui.js?v=1';

const NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  kids.forEach((k) => n.append(typeof k === 'string' ? document.createTextNode(k) : k));
  return n;
}

// Geometry: a syringe tip (male) on the left and a hub (female) on the right.
// Luer tips are drawn wider than NRFit tips; each fits only its own hub.
const W = { luer: 14, nrfit: 8 };

let pid = 0;
let curPat = '';
const fillFor = (kind) => (kind === 'nrfit' ? `url(#${curPat})` : null);

function syringe(kind, x) {
  const w = W[kind];
  const cy = 60;
  const g = s('g', { class: `cx-con-male cx-con--${kind}` });
  g.append(s('rect', { x: x - 86, y: cy - 22, width: 62, height: 44, class: 'cx-con-body', fill: fillFor(kind) }));
  g.append(s('rect', { x: x - 24, y: cy - 14, width: 10, height: 28, class: 'cx-con-body', fill: fillFor(kind) }));
  g.append(s('path', { d: `M${x - 14} ${cy - w / 2 - 1} L${x + 30} ${cy - w / 2 + 1} L${x + 30} ${cy + w / 2 - 1} L${x - 14} ${cy + w / 2 + 1} Z`, class: 'cx-con-tip', fill: fillFor(kind) }));
  return g;
}

function hub(kind, x) {
  const w = W[kind];
  const cy = 60;
  const g = s('g', { class: `cx-con-female cx-con--${kind}` });
  // outer collar with a socket cut into its left face
  g.append(s('path', {
    d: `M${x} ${cy - 22} H${x + 56} V${cy + 22} H${x} V${cy + w / 2 + 1} H${x + 34} V${cy - w / 2 - 1} H${x} Z`,
    class: 'cx-con-body',
    fill: fillFor(kind),
  }));
  g.append(s('line', { x1: x + 56, y1: cy, x2: x + 92, y2: cy, class: 'cx-con-line' }));
  return g;
}

function mark(ok, x, y) {
  return ok
    ? s('path', { d: `M${x - 8} ${y} l6 6 l11 -13`, class: 'cx-con-ok' })
    : s('path', { d: `M${x - 8} ${y - 8} l16 16 M${x + 8} ${y - 8} l-16 16`, class: 'cx-con-bad' });
}

function panel({ male, female, ok, title, sub }) {
  const svg = s('svg', { viewBox: '0 0 260 150', class: 'cx-con-svg', role: 'img', 'aria-label': `${title}: ${ok ? 'connects' : 'will not connect'}. ${sub}` });
  pid += 1;
  curPat = `cx-con-hatch-${pid}`;
  svg.append(s('defs', {}, s('pattern', { id: curPat, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    s('rect', { width: 6, height: 6, class: 'cx-con-hatch-bg' }),
    s('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'cx-con-hatch-line' }))));
  const hubX = ok ? 150 : 162;
  // inserted (fits) or stopped short (doesn't fit)
  const tipX = ok ? hubX + 4 : hubX - 34;
  svg.append(s('g', {}, syringe(male, tipX), hub(female, hubX)));
  if (!ok) svg.append(s('line', { x1: hubX - 4, y1: 32, x2: hubX - 4, y2: 88, class: 'cx-con-stop' }));
  svg.append(mark(ok, 130, 118));
  svg.append(s('text', { x: 146, y: 123, class: 'cx-con-verdict' }, ok ? 'Connects' : 'Will not connect'));
  return el('figure', { class: `cx-con-panel ${ok ? 'cx-con-panel--ok' : 'cx-con-panel--bad'}` },
    svg,
    el('figcaption', { class: 'cx-con-cap' }, el('strong', { text: title }), el('span', { text: sub })));
}

/** Three-panel schematic. Returns the grid element (put it in a ui.figure stage with aspect 'auto'). */
export function connectorsFigure() {
  const wrap = el('div', { class: 'cx-con-grid' });
  wrap.append(
    panel({ male: 'luer', female: 'luer', ok: true, title: 'Luer syringe → Luer IV port', sub: 'The ordinary IV connection.' }),
    panel({ male: 'luer', female: 'nrfit', ok: false, title: 'Luer syringe → NRFit spinal needle', sub: 'An IV syringe can’t reach the neuraxial needle.' }),
    panel({ male: 'nrfit', female: 'nrfit', ok: true, title: 'NRFit syringe → NRFit spinal needle', sub: 'Neuraxial drugs go only through neuraxial connectors.' }),
  );
  const key = el('p', { class: 'cx-con-key' },
    el('span', { class: 'cx-con-swatch cx-con-swatch--luer', 'aria-hidden': 'true' }), el('span', { text: 'Luer (plain)' }),
    el('span', { class: 'cx-con-swatch cx-con-swatch--nrfit', 'aria-hidden': 'true' }), el('span', { text: 'NRFit (hatched)' }));
  return el('div', { class: 'cx-con' }, wrap, key);
}
