/* spinal/js/anatomy/landmarks.js — Fig 1.2: back-view schematic of surface landmarks and spinal levels. SVG, original drawing. Levels are buttons (HTML) mirrored by hover/click bands in the SVG. */
import { el, cite } from '../ui.js?v=1';

const NS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs = {}, ...kids) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  kids.forEach((k) => n.append(k instanceof Node ? k : document.createTextNode(String(k))));
  return n;
};

const CX = 210;
const STEP = 46;
const Y0 = 66; // T12 centre
const VERT = ['T12', 'L1', 'L2', 'L3', 'L4', 'L5', 'S1', 'S2'];
const vy = (i) => Y0 + i * STEP; // spinous-process centre for vertebra i
// level list: vertebrae and the interspaces between them (T12 to S2)
const IDS = ['T12', 'T12–L1', 'L1', 'L1–2', 'L2', 'L2–3', 'L3', 'L3–4', 'L4', 'L4–5', 'L5', 'L5–S1', 'S1', 'S2'];
export const LEVELS = IDS.map((id, i) => {
  const space = id.includes('–');
  const vi = VERT.indexOf(space ? id.split('–')[0] : id);
  return { id, kind: space ? 'space' : 'body', y: space ? vy(vi) + STEP / 2 : vy(vi) };
});

const INFO = {
  'T12': () => `The 12th ribs attach here. In a minority of adults the conus ends as high as the middle of T12.${cite('an-saifuddin1998')}`,
  'T12–L1': () => 'Spinal cord. Never a level for spinal anaesthesia.',
  'L1': () => `Average position of the conus tip: the lower third of L1 (range middle of T12 to upper third of L3).${cite('an-saifuddin1998')}`,
  'L1–2': () => `Just below the average conus tip (lower third of L1); in a minority the cord still lies here. Not a spinal level.${cite('an-saifuddin1998')}`,
  'L2': () => `The cord ended below L1 in 19% of patients in one MRI study.${cite('broadbent2000')}`,
  'L2–3': () => `Avoid. The conus can reach this level, and the space you palpate is often higher than you think, so an intended L2–3 may really be L1–2.${cite('broadbent2000', 'reynolds2001')}`,
  'L3': () => `The lowest conus position in a large adult MRI series was the upper third of L3.${cite('an-saifuddin1998')}`,
  'L3–4': () => 'A usual choice for spinal anaesthesia: below the conus in almost all adults, with only cauda equina roots in the dural sac.',
  'L4': () => 'Tuffier’s (intercristal) line traditionally crosses the L4 body or the L4–5 space, but it is an unreliable guide to level.',
  'L4–5': () => 'Also commonly used. Cauda equina only. If Tuffier’s line is at L4–5, this is the space on the line.',
  'L5': () => 'Cauda equina within the dural sac.',
  'L5–S1': () => 'The largest lumbar interlaminar gap. Useful when the higher spaces are narrow or calcified.',
  'S1': () => 'The dural sac continues into the sacral canal.',
  'S2': () => 'The dural sac usually ends at about S2. The posterior superior iliac spines (the dimples) lie at about this level.',
};
export const levelInfo = (id) => (INFO[id] ? INFO[id]() : '');

export function buildLandmarksSVG() {
  const svg = S('svg', { viewBox: '0 0 420 470', class: 'an-land-svg', role: 'img', 'aria-label': 'Back view of the lower back showing the iliac crests, Tuffier’s line, the posterior superior iliac spines and the lumbar spinous processes.' });
  const defs = S('defs');
  defs.append(S('pattern', { id: 'an-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, S('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#633d3c', 'stroke-width': 1.4, 'stroke-opacity': 0.55 })));
  svg.append(defs);
  // torso outline (waist to buttocks)
  svg.append(S('path', { d: 'M70 0 C66 70 58 120 50 170 C40 236 34 290 44 350 C52 400 70 440 96 470 L324 470 C350 440 368 400 376 350 C386 290 380 236 370 170 C362 120 354 70 350 0 Z', fill: '#e7c0a3', stroke: '#2b1e18', 'stroke-width': 1.5 }));
  // natal cleft and buttock curves
  svg.append(S('path', { d: `M${CX} 420 L${CX} 470 M120 470 C150 440 190 430 ${CX} 420 C230 430 270 440 300 470`, fill: 'none', stroke: 'rgba(43,30,24,.55)', 'stroke-width': 1.2 }));
  // 12th ribs
  svg.append(S('path', { d: `M${CX - 30} ${Y0 + 4} C${CX - 70} ${Y0 + 14} ${CX - 110} ${Y0 + 34} ${CX - 140} ${Y0 + 62} M${CX + 30} ${Y0 + 4} C${CX + 70} ${Y0 + 14} ${CX + 110} ${Y0 + 34} ${CX + 140} ${Y0 + 62}`, fill: 'none', stroke: '#b6a684', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  svg.append(S('path', { d: `M${CX - 30} ${Y0 + 4} C${CX - 70} ${Y0 + 14} ${CX - 110} ${Y0 + 34} ${CX - 140} ${Y0 + 62} M${CX + 30} ${Y0 + 4} C${CX + 70} ${Y0 + 14} ${CX + 110} ${Y0 + 34} ${CX + 140} ${Y0 + 62}`, fill: 'none', stroke: '#ece2cc', 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  // iliac crests: tops at Tuffier's line (≈ L4 lower body / L4–5)
  const tuff = vy(4) + 14;
  const crest = (dir) => `M${CX + dir * 44} ${vy(7) + 4} C${CX + dir * 70} ${vy(6)} ${CX + dir * 92} ${tuff + 40} ${CX + dir * 120} ${tuff + 6} C${CX + dir * 136} ${tuff - 6} ${CX + dir * 160} ${tuff - 4} ${CX + dir * 172} ${tuff + 20}`;
  [-1, 1].forEach((d) => {
    svg.append(S('path', { d: crest(d), fill: 'none', stroke: '#b6a684', 'stroke-width': 7, 'stroke-linecap': 'round' }));
    svg.append(S('path', { d: crest(d), fill: 'none', stroke: '#ece2cc', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  });
  // PSIS dimples (~S2)
  [-1, 1].forEach((d) => svg.append(S('circle', { cx: CX + d * 44, cy: vy(7) + 4, r: 6, fill: '#d29e80', stroke: '#2b1e18', 'stroke-width': 1.2 })));
  // overlay group (conus + sac), drawn under the spinous processes
  const ov = S('g', { class: 'an-land-overlay', 'aria-hidden': 'true' });
  const sacEnd = vy(7) + 6;
  ov.append(S('path', { d: `M${CX - 13} -2 L${CX - 13} ${sacEnd - 26} Q${CX} ${sacEnd + 4} ${CX + 13} ${sacEnd - 26} L${CX + 13} -2 Z`, fill: '#cfe4ea', stroke: '#8f7aa6', 'stroke-width': 1.6 }));
  const conusY = vy(1) + 12; // lower third of L1
  ov.append(S('path', { d: `M${CX - 8} -2 L${CX - 8} ${conusY - 26} Q${CX} ${conusY + 6} ${CX + 8} ${conusY - 26} L${CX + 8} -2 Z`, fill: '#efd2bb', stroke: '#2b1e18', 'stroke-width': 1.2 }));
  for (let i = -2; i <= 2; i++) ov.append(S('path', { d: `M${CX + i * 2} ${conusY - 6} C${CX + i * 3} ${conusY + 60} ${CX + i * 4} ${sacEnd - 80} ${CX + i * 2} ${sacEnd - 12}`, fill: 'none', stroke: '#a85f37', 'stroke-width': 1 }));
  // conus range bracket (mid T12 to upper third L3), right side
  const rx = CX + 62, top = vy(0), bot = vy(3) - 10;
  ov.append(S('rect', { x: rx - 6, y: top, width: 12, height: bot - top, fill: 'url(#an-hatch)', stroke: '#633d3c', 'stroke-width': 1.4 }));
  ov.append(S('line', { x1: rx - 12, x2: rx + 12, y1: conusY, y2: conusY, stroke: '#633d3c', 'stroke-width': 2.5 }));
  ov.append(lbl(rx + 18, top + 10, 'Conus tip range', 'start', 600));
  ov.append(lbl(rx + 18, top + 26, 'mid T12 – upper L3', 'start'));
  ov.append(lbl(rx + 18, conusY + 4, '— mean: lower L1', 'start'));
  ov.append(S('line', { x1: CX + 16, x2: rx + 12, y1: sacEnd - 8, y2: sacEnd - 8, stroke: '#633d3c', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }));
  ov.append(lbl(rx + 18, sacEnd - 4, 'Dural sac ends ~S2', 'start'));
  svg.append(ov);
  // level hit bands (pointer only; keyboard uses the buttons)
  const bands = S('g', { class: 'an-land-bands' });
  LEVELS.forEach((l) => {
    const h = l.kind === 'body' ? 26 : 20;
    const b = S('rect', { x: CX - 120, y: l.y - h / 2, width: 240, height: h, fill: 'transparent', 'data-level': l.id, class: 'an-land-band' });
    bands.append(b);
  });
  // highlight band
  const hl = S('rect', { class: 'an-land-hl', x: CX - 34, y: 0, width: 68, height: 20, fill: 'rgba(99,61,60,.14)', stroke: '#633d3c', 'stroke-width': 2.5 });
  svg.append(hl);
  // spinous processes
  VERT.forEach((v, i) => {
    if (i >= 6) { // sacral: median crest tubercles
      svg.append(S('ellipse', { cx: CX, cy: vy(i), rx: 10, ry: 8, fill: '#ece2cc', stroke: '#2b1e18', 'stroke-width': 1.2 }));
    } else svg.append(S('rect', { x: CX - 13, y: vy(i) - 12, width: 26, height: 24, rx: 6, fill: '#ece2cc', stroke: '#2b1e18', 'stroke-width': 1.4 }));
    svg.append(lbl(CX - 24, vy(i) + 4, v, 'end', 500, true));
  });
  // Tuffier's line
  svg.append(S('line', { x1: CX - 190, x2: CX + 190, y1: tuff, y2: tuff, stroke: '#2b1e18', 'stroke-width': 1.6, 'stroke-dasharray': '7 5' }));
  svg.append(pillT(24, tuff - 14, 'Tuffier’s line'));
  svg.append(pillT(CX - 186, vy(7) + 26, 'PSIS dimples ≈ S2'));
  svg.append(pillT(30, Y0 + 52, '12th rib'));
  svg.append(bands);
  return { svg, hl, bands, overlay: ov };

  function lbl(x, y, t, anchor = 'start', w = 500, mono = false) {
    return S('text', { x, y, 'paint-order': 'stroke', stroke: 'rgba(244,236,225,.92)', 'stroke-width': 4, 'stroke-linejoin': 'round', 'text-anchor': anchor, 'font-size': mono ? 12.5 : 13, 'font-weight': w, 'font-family': mono ? '"NTF Mono","JetBrains Mono",ui-monospace,monospace' : 'Inter,"NTF Sans",system-ui,sans-serif', fill: '#2b1e18' }, t);
  }
  function pillT(x, y, t) {
    const g = S('g', { 'aria-hidden': 'true' });
    const w = t.length * 6.7 + 16;
    g.append(S('rect', { x, y: y - 11, width: w, height: 22, rx: 11, fill: 'rgba(251,247,241,.93)', stroke: 'rgba(43,30,24,.25)' }));
    g.append(S('text', { x: x + 8, y: y + 4.5, 'font-size': 12.5, 'font-weight': 500, 'font-family': 'Inter,"NTF Sans",system-ui,sans-serif', fill: '#2b1e18' }, t));
    return g;
  }
}

export function levelButtons(onPick) {
  const list = el('ul', { class: 'an-levels', role: 'list' });
  LEVELS.forEach((l) => {
    const b = el('button', { type: 'button', class: ['an-level', l.kind === 'space' ? 'an-level--space' : ''], 'aria-pressed': 'false', dataset: { level: l.id }, text: l.id });
    b.addEventListener('click', () => onPick(l.id, true));
    b.addEventListener('focus', () => onPick(l.id, false));
    list.append(el('li', {}, b));
  });
  return list;
}
