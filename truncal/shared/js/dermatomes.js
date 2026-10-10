// Truncal blocks: original, simplified front and back torso figures with T2–L1 dermatome bands.
//   coverageMap(coverage, {id}) -> <figure> with the two figures, shaded levels, legend and a text summary
//   probeInset({view, x, y, angle, label}) -> small torso SVG showing where the probe sits
// Density is shown three ways (fill strength, pattern, words), never by colour alone. Schema: DATA.md ("coverage").
import { el, sv } from './ui.js';

export const LEVELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'L1'];
// Midline centre (y) of each band on the front figure; viewBox per figure is 170 x 300, midline x = 85.
const CENTRE = [62, 80, 96, 111, 126, 141, 156, 171, 188, 204, 220, 240];
const CX = 85;
const ZONES = {
  front: { mid: [0, 14], ant: [14, 33], lat: [33, 62] },
  back: { med: [0, 22], lat: [22, 62] },
};
const GROUPS = {
  midline: ['front-mid'], anterior: ['front-mid', 'front-ant'], anterolateral: ['front-mid', 'front-ant', 'front-lat'],
  lateral: ['front-lat', 'back-lat'], posterior: ['back-med', 'back-lat'], all: ['front-mid', 'front-ant', 'front-lat', 'back-med', 'back-lat'],
};
export const DENSITY = {
  dense: { label: 'Dense', text: 'reliable' },
  moderate: { label: 'Moderate', text: 'usually adequate' },
  patchy: { label: 'Variable', text: 'patchy, not reliable' },
};

// ---------------------------------------------------------------- outlines (original drawings)
function smoothPath(pts, closed = true) {
  const n = pts.length; let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return `${d}${closed ? 'Z' : ''}`;
}
const mirror = (half) => [...half, ...half.slice().reverse().map(([x, y]) => [2 * CX - x, y])];
const HALF_FRONT = [[95, 6], [100, 20], [118, 27], [140, 33], [150, 44], [146, 62], [134, 74], [134, 100], [131, 140], [126, 176], [131, 212], [137, 244], [131, 268], [104, 284], [88, 292]];
const HALF_BACK = [[95, 6], [100, 20], [118, 27], [140, 33], [150, 44], [146, 62], [134, 74], [135, 100], [132, 140], [127, 176], [132, 212], [138, 246], [136, 276], [112, 292], [88, 290]];
export const OUTLINE = { front: smoothPath(mirror(HALF_FRONT)), back: smoothPath(mirror(HALF_BACK)) };

function landmarks(g, view) {
  const line = { fill: 'none', stroke: '#8f8574', 'stroke-width': 1, 'stroke-linecap': 'round' };
  if (view === 'front') {
    sv('path', { d: 'M88 31 Q108 30 128 37 M82 31 Q62 30 42 37', ...line }, g);                       // clavicles
    sv('path', { d: 'M85 128 Q66 140 52 158 Q47 166 46 174 M85 128 Q104 140 118 158 Q123 166 124 174', ...line, 'stroke-dasharray': '3 2' }, g); // costal margins
    sv('path', { d: 'M50 236 Q62 252 77 268 M120 236 Q108 252 93 268', ...line }, g);                // inguinal ligaments
    sv('path', { d: `M${CX} 130 V268`, ...line, 'stroke-dasharray': '1 3' }, g);                    // linea alba
    [[60, 96], [110, 96]].forEach(([x, y]) => sv('circle', { cx: x, cy: y, r: 2.2, fill: '#8f8574' }, g)); // nipples
    sv('circle', { cx: CX, cy: 188, r: 2.4, fill: 'none', stroke: '#8f8574', 'stroke-width': 1.2 }, g); // umbilicus
    [[50, 236], [120, 236]].forEach(([x, y]) => sv('circle', { cx: x, cy: y, r: 1.8, fill: '#8f8574' }, g)); // ASIS
  } else {
    sv('path', { d: `M${CX} 14 V268`, ...line, 'stroke-dasharray': '2 3' }, g);                       // spinous processes
    sv('path', { d: 'M68 50 L63 141 L36 63 Z M102 50 L107 141 L134 63 Z', ...line, 'stroke-linejoin': 'round' }, g); // scapulae
    sv('path', { d: 'M40 230 Q58 220 78 226 M130 230 Q112 220 92 226', ...line }, g);                // iliac crests
    sv('circle', { cx: CX, cy: 18, r: 2.4, fill: '#8f8574' }, g);                                     // C7 vertebra prominens
  }
}

// ---------------------------------------------------------------- bands
const RISE = { front: -16, back: 7 };
function boundaryY(view, k, x) {
  // k = 0..12: boundary above LEVELS[k] (k = 12 is the lower edge of L1).
  const yMid = k === 0 ? CENTRE[0] - 9 : k === 12 ? CENTRE[11] + 14 : (CENTRE[k - 1] + CENTRE[k]) / 2;
  const t = Math.min(1, Math.abs(x - CX) / 60);
  return yMid + RISE[view] * Math.pow(t, 1.6);
}
function bandPath(view, li, side, [a, b]) {
  const top = [], bot = [];
  for (let dx = a; dx <= b + 0.01; dx += 2) {
    const x = CX + side * dx;
    top.push([x, boundaryY(view, li, x)]); bot.push([x, boundaryY(view, li + 1, x)]);
  }
  const pts = top.concat(bot.reverse());
  return `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')}Z`;
}

function expandZones(zones) { return [...new Set((zones || ['all']).flatMap((z) => GROUPS[z] || [z]))]; }
function levelRange(spec) {
  if (Array.isArray(spec)) {
    if (spec.length === 2 && LEVELS.includes(spec[0]) && LEVELS.includes(spec[1]) && LEVELS.indexOf(spec[1]) > LEVELS.indexOf(spec[0]) + 1) return LEVELS.slice(LEVELS.indexOf(spec[0]), LEVELS.indexOf(spec[1]) + 1);
    return spec;
  }
  return [spec];
}

let patSeq = 0;
function defs(svg) {
  patSeq += 1;
  const id = (n) => `tbd-${n}-${patSeq}`;
  const d = sv('defs', {}, svg);
  const h = sv('pattern', { id: id('hatch'), width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
  sv('rect', { width: 6, height: 6, fill: 'rgba(44,116,179,.32)' }, h);
  sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#1d4f7c', 'stroke-width': 2 }, h);
  const p = sv('pattern', { id: id('dots'), width: 6, height: 6, patternUnits: 'userSpaceOnUse' }, d);
  sv('rect', { width: 6, height: 6, fill: 'rgba(44,116,179,.12)' }, p);
  sv('circle', { cx: 3, cy: 3, r: 1.1, fill: '#1d4f7c' }, p);
  return { dense: '#2c74b3', moderate: `url(#${id('hatch')})`, patchy: `url(#${id('dots')})`, clip: id('clip') };
}

function figureSvg(view, cov, fills, { labels = true } = {}) {
  const g = sv('g', {});
  const clipId = `${fills.clip}-${view}`;
  const cp = sv('clipPath', { id: clipId }, g);
  sv('path', { d: OUTLINE[view] }, cp);
  sv('path', { d: OUTLINE[view], fill: '#f1e7d8', stroke: 'none' }, g);
  const bands = sv('g', { 'clip-path': `url(#${clipId})` }, g);
  // faint band lines for every level
  for (let k = 0; k <= 12; k++) {
    let d = ''; for (let x = 20; x <= 150; x += 3) d += `${x === 20 ? 'M' : 'L'}${x} ${boundaryY(view, k, x).toFixed(1)}`;
    sv('path', { d, fill: 'none', stroke: '#cfc5b3', 'stroke-width': 0.8 }, bands);
  }
  const sides = cov.side === 'bilateral' ? [-1, 1] : [view === 'front' ? -1 : 1]; // unilateral: patient's right
  for (const area of cov.areas || []) {
    const zs = expandZones(area.zones).filter((z) => z.startsWith(view));
    for (const lv of levelRange(area.levels)) {
      const li = LEVELS.indexOf(lv); if (li < 0) continue;
      for (const z of zs) {
        const range = ZONES[view][z.split('-')[1]]; if (!range) continue;
        for (const s of sides) {
          const fill = fills[area.density] || fills.moderate;
          sv('path', { d: bandPath(view, li, s, range), fill, 'fill-opacity': area.density === 'dense' ? 0.78 : 1, stroke: 'none' }, bands);
        }
      }
    }
  }
  landmarks(g, view);
  sv('path', { d: OUTLINE[view], fill: 'none', stroke: '#55534d', 'stroke-width': 1.3 }, g);
  if (labels) {
    // Level labels on the left margin (every level, small) for the front; key landmarks for the back.
    // Sizes are in viewBox units; the map is drawn at >= 0.9 px per unit, so 14 units renders at >= 12 px.
    const lab = sv('g', { 'font-family': 'NTF Mono, JetBrains Mono, monospace', 'font-size': 14, fill: '#55534d' }, g);
    if (view === 'front') {
      LEVELS.forEach((lv, i) => { if (i % 2 === 0 || lv === 'L1') sv('text', { x: 19, y: CENTRE[i] + 5, 'text-anchor': 'end', text: lv }, lab); });
    } else {
      sv('text', { x: 142, y: 23, text: 'C7' }, lab);
      sv('text', { x: 140, y: 146, text: 'T7' }, lab);
    }
    const side = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 14, fill: '#55534d' }, g);
    const [l, r] = view === 'front' ? ['R', 'L'] : ['L', 'R'];
    sv('text', { x: 16, y: 298, text: l }, side); sv('text', { x: 146, y: 298, text: r }, side);
  }
  return g;
}

const LANDMARK_KEY = 'Landmarks: nipple T4, xiphoid T6, umbilicus T10, inguinal ligament L1; inferior angle of the scapula T7, vertebra prominens C7.';

/**
 * coverageMap(coverage) → <figure class="tb-cov">.
 * coverage = {side:'unilateral'|'bilateral', areas:[{levels:['T10','T12'] or ['T10','T11'], zones:['anterolateral'], density:'dense'|'moderate'|'patchy'}],
 *             summary, mechanism, density (text), caption}
 */
export function coverageMap(cov, { id, title } = {}) {
  const fig = el('figure', { class: 'tb-cov', id });
  const svg = sv('svg', { viewBox: '0 0 370 330', class: 'tb-cov-svg', role: 'img' });
  const fills = defs(svg);
  const front = figureSvg('front', cov, fills); front.setAttribute('transform', 'translate(10 24)'); svg.append(front);
  const back = figureSvg('back', cov, fills); back.setAttribute('transform', 'translate(195 24)'); svg.append(back);
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 14, fill: '#272722', 'text-anchor': 'middle' }, svg);
  sv('text', { x: 95, y: 16, text: 'Front' }, t); sv('text', { x: 280, y: 16, text: 'Back' }, t);
  const words = (cov.areas || []).map((a) => `${levelRange(a.levels).join(', ').replace(/^(\w+),.*, (\w+)$/, '$1 to $2')} ${expandZones(a.zones).map((z) => z.replace('front-', 'front ').replace('back-', 'back ')).join(', ')}: ${DENSITY[a.density]?.label || a.density}, ${DENSITY[a.density]?.text || ''}`);
  svg.setAttribute('aria-label', `Dermatome coverage map${title ? ` for ${title}` : ''}. ${cov.summary || ''} ${words.join('. ')}.`);
  fig.append(el('div', { class: 'tb-cov-stage' }, svg));
  const legend = el('ul', { class: 'tb-cov-legend', 'aria-label': 'Key' });
  const used = new Set((cov.areas || []).map((a) => a.density));
  for (const k of ['dense', 'moderate', 'patchy']) {
    if (!used.has(k)) continue;
    legend.append(el('li', {}, el('span', { class: `tb-cov-sw tb-cov-sw--${k}`, 'aria-hidden': 'true' }), el('span', { text: `${DENSITY[k].label}: ${DENSITY[k].text}` })));
  }
  legend.append(el('li', { class: 'tb-cov-note', text: cov.side === 'bilateral' ? 'Shown on both sides (bilateral blocks).' : 'One side shown (the patient’s right). Midline incisions need the block on both sides.' }));
  const cap = el('figcaption', {});
  cap.append(legend, el('p', { class: 'tb-cov-lm', text: LANDMARK_KEY }));
  fig.append(cap);
  return fig;
}

/**
 * Small torso with the probe drawn on it. probe = {view:'front'|'back', x, y, angle (deg, 0 = transverse), label,
 * marker?: 'left'|'right'}. The dot (the probe's orientation marker) sits on the probe's left end (in the inset's
 * own frame before rotation) when the image marker is screen-left, on its right end when it is screen-right.
 * `opts.marker` is the scene's orient.marker; probe.marker overrides it.
 */
export function probeInset(probe, opts = {}) {
  const view = probe.view === 'back' ? 'back' : 'front';
  const svg = sv('svg', { viewBox: '0 0 170 300', class: 'tb-probe-svg', role: 'img', 'aria-label': `Probe position: ${probe.label || ''}` });
  const g = sv('g', {}, svg);
  sv('path', { d: OUTLINE[view], fill: '#f1e7d8', stroke: '#55534d', 'stroke-width': 1.4 }, g);
  landmarks(g, view);
  const pr = sv('g', { transform: `translate(${probe.x} ${probe.y}) rotate(${probe.angle || 0})` }, g);
  sv('rect', { x: -15, y: -4.5, width: 30, height: 9, fill: '#272722', stroke: '#fffaf0', 'stroke-width': 1.2 }, pr);
  const mk = probe.marker || opts.marker || 'left';
  sv('circle', { cx: mk === 'right' ? 11 : -11, cy: 0, r: 2.2, fill: '#fffaf0' }, pr);
  if (probe.needle) {
    const [nx, ny] = probe.needle;
    sv('line', { x1: probe.x + nx, y1: probe.y + ny, x2: probe.x, y2: probe.y, stroke: '#633d3c', 'stroke-width': 2, 'stroke-dasharray': '4 2' }, g);
  }
  // The inset is drawn about 80–96 px wide (0.47–0.56 px per unit), so 26 units renders at >= 12 px.
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 26, 'font-weight': 500, fill: '#55534d' }, svg);
  const [l, r] = view === 'front' ? ['R', 'L'] : ['L', 'R'];
  sv('text', { x: 2, y: 296, text: l }, t); sv('text', { x: 168, y: 296, 'text-anchor': 'end', text: r }, t);
  return svg;
}
