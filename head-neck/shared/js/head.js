// Head and neck blocks: original, simplified head and neck figures for coverage maps, probe insets and
// injection-point diagrams. Drop-in partners of the truncal dermatome map (../../truncal/shared/js/dermatomes.js):
//   headCoverageMap(coverage, {id, title}) -> <figure class="tb-cov"> (pass as coverage.map in a block)
//   headProbeInset(probe, opts)            -> small head SVG with the probe or the needle entry points (scene.probeInset)
//   headFigure(view, {zones, points, density}) -> one view as an SVG, for anatomy chapters
// Views (each viewBox 0 0 200 260): 'front' (face; patient's right on the viewer's left), 'side' (the patient's
// right side, face to the viewer's right), 'back' (patient's right on the viewer's right), 'airway' (midline
// sagittal section, face to the viewer's right). Zones are schematic areas of skin or mucosa supplied by one nerve.
// Density is shown three ways (fill strength, pattern, words), never by colour alone, as on the truncal maps.
import { el, sv } from '../../../truncal/shared/js/ui.js';
import { DENSITY } from '../../../truncal/shared/js/dermatomes.js';

const CX = 100;

function smooth(pts, closed = true) {
  const n = pts.length; let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const q0 = closed || i > 0 ? p0 : p1, q3 = closed || i < n - 2 ? p3 : p2;
    const c1 = [p1[0] + (p2[0] - q0[0]) / 6, p1[1] + (p2[1] - q0[1]) / 6], c2 = [p2[0] - (q3[0] - p1[0]) / 6, p2[1] - (q3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return `${d}${closed ? 'Z' : ''}`;
}
const poly = (pts) => `M${pts.map((p) => p.join(' ')).join(' L')}Z`;
const mirrorPts = (pts) => pts.map(([x, y]) => [2 * CX - x, y]);
const mirrorHalf = (half) => [...half, ...mirrorPts(half).reverse()];

// ---------------------------------------------------------------- outlines
const FRONT_HALF = [[100, 8], [74, 12], [56, 24], [46, 44], [42, 66], [43, 88], [46, 108], [51, 128], [58, 146], [66, 160], [70, 174], [70, 196], [62, 212], [38, 225], [16, 235], [6, 249], [4, 260]];
const BACK_HALF = [[100, 8], [74, 12], [56, 24], [46, 44], [42, 66], [43, 88], [46, 108], [54, 126], [64, 140], [72, 152], [70, 176], [66, 198], [50, 214], [24, 228], [8, 240], [4, 260]];
const SIDE = [[96, 10], [126, 14], [148, 28], [160, 48], [163, 66], [166, 76], [161, 86], [170, 96], [181, 107], [167, 113], [170, 122], [166, 128], [169, 135], [165, 147], [165, 158], [152, 166], [128, 172], [124, 192], [127, 214], [136, 232], [150, 248], [154, 260], [38, 260], [40, 246], [48, 228], [58, 206], [60, 180], [56, 158], [44, 138], [32, 116], [26, 90], [28, 60], [40, 34], [64, 16]];
const EAR_FRONT = [[43, 82], [36, 80], [33, 92], [35, 108], [41, 118], [46, 112]];
const EAR_SIDE = [[100, 80], [90, 81], [84, 94], [85, 110], [93, 123], [103, 117], [105, 98]];

export const OUTLINE = {
  front: smooth(mirrorHalf(FRONT_HALF)),
  back: smooth(mirrorHalf(BACK_HALF)),
  side: smooth(SIDE),
  airway: smooth(SIDE),
};

const INK = '#8f8574';
function landmarks(g, view) {
  const line = { fill: 'none', stroke: INK, 'stroke-width': 1, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const dash = { ...line, 'stroke-dasharray': '3 2.5' };
  if (view === 'front') {
    for (const s of [1, -1]) {
      const X = (x) => (s > 0 ? x : 2 * CX - x);
      sv('path', { d: smooth(s > 0 ? EAR_FRONT : mirrorPts(EAR_FRONT), false), ...line }, g);
      sv('path', { d: `M${X(64)} 74 Q${X(76)} 68 ${X(92)} 74`, ...line }, g);                  // eyebrow
      sv('path', { d: `M${X(68)} 87 Q${X(78)} 81 ${X(90)} 87 Q${X(78)} 92 ${X(68)} 87`, ...line }, g); // eye
      sv('path', { d: `M${X(58)} 146 Q${X(70)} 166 ${X(100)} 176`, ...line }, g);            // jaw line
      sv('path', { d: `M${X(52)} 124 L${X(94)} 228`, ...dash }, g);                            // SCM
      sv('path', { d: `M${X(96)} 231 Q${X(70)} 222 ${X(38)} 226`, ...line }, g);               // clavicle
    }
    sv('path', { d: 'M97 86 L93 120 Q100 127 107 120', ...line }, g);                          // nose
    sv('path', { d: 'M88 146 Q100 150 112 146', ...line }, g);                                 // mouth
    sv('path', { d: 'M95 194 L100 199 L105 194', ...line }, g);                                // thyroid notch
    sv('path', { d: 'M94 207 H106', ...line }, g);                                             // cricoid
  } else if (view === 'back') {
    for (const s of [1, -1]) {
      const pts = s > 0 ? EAR_FRONT : mirrorPts(EAR_FRONT);
      sv('path', { d: smooth(pts, false), ...line }, g);
    }
    sv('path', { d: 'M62 116 Q80 106 100 110 Q120 106 138 116', ...line }, g);               // superior nuchal line
    sv('circle', { cx: CX, cy: 111, r: 2.4, fill: INK }, g);                                  // external occipital protuberance
    [[52, 122], [148, 122]].forEach(([x, y]) => sv('circle', { cx: x, cy: y, r: 2, fill: INK }, g)); // mastoid tips
    sv('path', { d: `M${CX} 150 V250`, ...dash }, g);                                          // spinous processes
    sv('circle', { cx: CX, cy: 206, r: 2.2, fill: INK }, g);                                  // C7
  } else if (view === 'side') {
    sv('path', { d: smooth(EAR_SIDE, false), ...line }, g);                                    // ear
    sv('path', { d: 'M140 76 Q152 70 163 74', ...line }, g);                                   // eyebrow
    sv('path', { d: 'M146 87 Q153 83 160 87 Q153 90 146 87', ...line }, g);                   // eye
    sv('path', { d: 'M106 96 Q124 92 142 94', ...line }, g);                                  // zygomatic arch
    sv('path', { d: 'M104 120 Q108 140 112 152 Q138 160 162 158', ...line }, g);              // ramus and jaw line
    sv('path', { d: 'M84 128 L134 230', ...dash }, g);                                         // SCM, posterior border
    sv('path', { d: 'M96 124 L148 226', ...dash }, g);                                         // SCM, anterior border
    sv('path', { d: 'M134 232 Q104 226 74 232', ...line }, g);                                 // clavicle
    sv('path', { d: 'M126 184 L131 188 L126 192', ...line }, g);                              // thyroid prominence
    sv('circle', { cx: 86, cy: 126, r: 2, fill: INK }, g);                                    // mastoid tip
    sv('circle', { cx: 33, cy: 113, r: 2, fill: INK }, g);                                    // external occipital protuberance
  } else if (view === 'airway') {
    sv('path', { d: 'M122 106 L164 110', ...line, 'stroke-width': 2.2 }, g);                  // hard palate
    sv('path', { d: 'M122 106 Q118 116 112 122', ...line, 'stroke-width': 2.2 }, g);          // soft palate
    sv('path', { d: 'M114 158 Q108 150 108 141', ...line, 'stroke-width': 2.2 }, g);          // epiglottis
    sv('path', { d: 'M110 180 L122 178', ...line, 'stroke-width': 2.2 }, g);                  // vocal cords
    sv('path', { d: AW.tongue, ...line }, g);                                                  // tongue outline
    sv('path', { d: 'M128 160 h6', ...line, 'stroke-width': 3 }, g);                          // hyoid
    sv('path', { d: 'M124 168 L127 182 M126 188 L128 196', ...line, 'stroke-width': 2.4 }, g); // thyroid and cricoid cartilages
  }
}

// Airway section: soft-tissue spaces painted under the zones, outlines on top.
const AW = {
  nasal: smooth([[122, 80], [150, 80], [168, 94], [176, 104], [164, 108], [122, 106]]),
  pharynx: smooth([[100, 92], [110, 84], [122, 80], [122, 106], [112, 122], [112, 134], [116, 150], [106, 158], [104, 200], [108, 250], [98, 250], [96, 200], [96, 130]]),
  larynx: smooth([[106, 158], [114, 154], [120, 166], [122, 178], [124, 210], [126, 250], [112, 250], [110, 210], [110, 180], [105, 168]]),
  tongue: smooth([[116, 150], [112, 132], [120, 116], [140, 112], [160, 116], [166, 124], [156, 132], [140, 140], [128, 150]]),
};
function airwayBase(g) {
  const space = { fill: '#fbf7f1', stroke: 'none' };
  sv('path', { d: AW.nasal, ...space }, g); sv('path', { d: AW.pharynx, ...space }, g); sv('path', { d: AW.larynx, ...space }, g);
  sv('path', { d: AW.tongue, fill: '#e9c7b9', stroke: 'none' }, g);
}
function airwayWalls(g) {
  const w = { fill: 'none', stroke: INK, 'stroke-width': 1 };
  sv('path', { d: AW.nasal, ...w }, g); sv('path', { d: AW.pharynx, ...w }, g); sv('path', { d: AW.larynx, ...w }, g);
}

// ---------------------------------------------------------------- zones (patient's right side)
// Each zone: name, nerve and the area it supplies (shown in the legend), and one polygon per view.
export const ZONES = {
  supraorbital: { name: 'Supraorbital (V1)', area: 'forehead and scalp back to the vertex',
    front: [[100, 8], [100, 30], [88, 30], [86, 72], [64, 72], [54, 62], [50, 44], [57, 24], [76, 11]],
    side: [[70, 14], [96, 10], [126, 14], [148, 28], [158, 46], [160, 66], [162, 74], [142, 72], [128, 62], [112, 40], [92, 26]],
    back: [[100, 8], [80, 10], [90, 22], [100, 24]] },
  supratrochlear: { name: 'Supratrochlear (V1)', area: 'the middle of the forehead',
    front: [[100, 30], [88, 30], [86, 72], [92, 80], [100, 82]],
    side: [[158, 46], [163, 66], [166, 76], [162, 74], [160, 66]] },
  zygomaticotemporal: { name: 'Zygomaticotemporal (V2)', area: 'a small patch of temple beside the eyebrow',
    front: [[54, 62], [64, 72], [60, 84], [47, 80], [46, 64]],
    side: [[142, 72], [128, 62], [120, 70], [124, 86], [140, 86]] },
  auriculotemporal: { name: 'Auriculotemporal (V3)', area: 'the temple and the front of the ear',
    front: [[50, 44], [54, 62], [46, 64], [47, 80], [44, 96], [42, 80], [42, 64], [46, 44]],
    side: [[128, 62], [112, 40], [92, 26], [84, 40], [92, 62], [100, 80], [105, 98], [110, 110], [118, 102], [124, 86], [120, 70]] },
  infraorbital: { name: 'Infraorbital (V2)', area: 'lower eyelid, cheek, side of the nose and upper lip',
    front: [[66, 92], [88, 92], [93, 104], [92, 122], [100, 130], [100, 142], [86, 142], [72, 134], [62, 120], [60, 104]],
    side: [[140, 86], [158, 88], [170, 97], [178, 107], [167, 113], [170, 122], [160, 125], [144, 118], [134, 102]] },
  mental: { name: 'Mental (V3)', area: 'lower lip and chin',
    front: [[100, 146], [100, 176], [86, 172], [78, 164], [80, 152], [88, 148]],
    side: [[166, 128], [169, 135], [165, 147], [165, 158], [152, 157], [150, 140], [160, 127]] },
  gan: { name: 'Great auricular (C2–C3)', area: 'angle of the jaw, over the parotid, most of the ear',
    front: [[46, 104], [58, 110], [64, 130], [66, 156], [58, 146], [51, 128]],
    side: [[86, 98], [84, 112], [87, 126], [98, 140], [110, 154], [124, 152], [124, 132], [116, 114], [108, 114], [104, 104], [96, 96]],
    back: [[146, 126], [154, 108], [160, 118], [152, 136], [138, 140]] },
  lon: { name: 'Lesser occipital (C2)', area: 'the scalp behind and above the ear',
    side: [[66, 62], [80, 58], [92, 68], [88, 84], [84, 100], [84, 112], [87, 126], [72, 132], [60, 112], [60, 80]],
    back: [[140, 40], [154, 48], [158, 66], [157, 88], [154, 108], [146, 126], [124, 122], [124, 90], [130, 60]] },
  gon: { name: 'Greater occipital (C2)', area: 'the back of the scalp up to the vertex',
    side: [[70, 14], [92, 26], [84, 40], [80, 58], [66, 62], [60, 80], [60, 112], [72, 132], [56, 136], [44, 138], [32, 116], [26, 90], [28, 60], [40, 34], [64, 16]],
    back: [[100, 24], [90, 22], [80, 10], [100, 8], [126, 12], [144, 24], [140, 40], [130, 60], [124, 90], [124, 122], [116, 140], [100, 144]] },
  tcn: { name: 'Transverse cervical (C2–C3)', area: 'the front of the neck',
    front: [[100, 178], [84, 172], [70, 174], [70, 196], [64, 210], [100, 214]],
    side: [[152, 166], [128, 172], [124, 192], [127, 214], [116, 214], [104, 178], [112, 160], [126, 154], [150, 159]] },
  scn: { name: 'Supraclavicular (C3–C4)', area: 'lower neck, over the clavicle, top of the shoulder and upper chest',
    front: [[64, 210], [62, 212], [38, 225], [16, 235], [6, 249], [4, 260], [100, 260], [100, 214]],
    side: [[127, 214], [136, 232], [150, 248], [154, 260], [38, 260], [40, 246], [48, 228], [58, 206], [104, 206], [116, 214]],
    back: [[134, 196], [150, 214], [176, 228], [192, 240], [196, 260], [130, 260], [126, 214]] },
  // Airway mucosa (view 'airway' only)
  nose: { name: 'Nasal cavity (V1 anterior ethmoidal, V2 palatine)', area: 'nasal mucosa and septum',
    airway: [[122, 80], [150, 80], [168, 94], [176, 104], [164, 108], [122, 106]] },
  tongue: { name: 'Anterior two-thirds of the tongue (V3 lingual)', area: 'front of the tongue',
    airway: [[124, 114], [140, 112], [160, 116], [166, 124], [156, 132], [140, 140], [128, 146]] },
  oropharynx: { name: 'Oropharynx (IX glossopharyngeal, X pharyngeal)', area: 'back of the tongue, vallecula, tonsils, pharyngeal walls; the gag reflex',
    airway: [[98, 100], [110, 108], [114, 118], [124, 114], [128, 146], [116, 150], [112, 156], [104, 156], [97, 130]] },
  supraglottis: { name: 'Larynx above the cords (X internal superior laryngeal)', area: 'back of the epiglottis, aryepiglottic folds, arytenoids',
    airway: [[105, 162], [110, 150], [116, 152], [120, 166], [122, 178], [110, 180]] },
  subglottis: { name: 'Vocal cords and below (X recurrent laryngeal)', area: 'cords, subglottis and trachea',
    airway: [[110, 180], [122, 178], [124, 210], [126, 250], [112, 250], [110, 210]] },
};
const GROUPS = {
  scalp: ['supraorbital', 'supratrochlear', 'zygomaticotemporal', 'auriculotemporal', 'lon', 'gon'],
  superficialCervical: ['gan', 'lon', 'tcn', 'scn'],
  face: ['supraorbital', 'supratrochlear', 'infraorbital', 'mental'],
  airway: ['nose', 'tongue', 'oropharynx', 'supraglottis', 'subglottis'],
};
const expand = (zones) => [...new Set((zones || []).flatMap((z) => GROUPS[z] || [z]))];
// The airway section is shown zoomed in on the pharynx and larynx.
const VB = { front: '0 0 200 260', side: '0 0 200 260', back: '0 0 200 260', airway: '86 72 100 130' };
const VIEW_NAMES = { front: 'Front', side: 'Right side', back: 'Back', airway: 'Airway, midline section' };

let patSeq = 0;
function defs(svg) {
  patSeq += 1;
  const id = (n) => `hnd-${n}-${patSeq}`;
  const d = sv('defs', {}, svg);
  const h = sv('pattern', { id: id('hatch'), width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
  sv('rect', { width: 6, height: 6, fill: 'rgba(44,116,179,.32)' }, h);
  sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#1d4f7c', 'stroke-width': 2 }, h);
  const p = sv('pattern', { id: id('dots'), width: 6, height: 6, patternUnits: 'userSpaceOnUse' }, d);
  sv('rect', { width: 6, height: 6, fill: 'rgba(44,116,179,.12)' }, p);
  sv('circle', { cx: 3, cy: 3, r: 1.1, fill: '#1d4f7c' }, p);
  return { dense: '#2c74b3', moderate: `url(#${id('hatch')})`, patchy: `url(#${id('dots')})`, clip: id('clip') };
}

/** Paint one view into an <svg>. areas = [{zones, density}], side 'unilateral' (patient's right) | 'bilateral'. */
function paintView(svg, view, { areas = [], side = 'unilateral', points = [] } = {}) {
  const fills = defs(svg);
  const clipId = `${fills.clip}-${view}`;
  const cp = sv('clipPath', { id: clipId }, svg);
  sv('path', { d: OUTLINE[view] }, cp);
  sv('path', { d: OUTLINE[view], fill: '#f1e7d8', stroke: 'none' }, svg);
  if (view === 'airway') airwayBase(svg);
  const zg = sv('g', { 'clip-path': `url(#${clipId})` }, svg);
  const both = side === 'bilateral' && (view === 'front' || view === 'back');
  for (const a of areas) {
    for (const z of expand(a.zones)) {
      const pts = ZONES[z]?.[view]; if (!pts) continue;
      const fill = fills[a.density] || fills.moderate;
      // Polygons are drawn on the patient's right: viewer-left on the front, viewer-right on the back.
      const sets = both ? [pts, mirrorPts(pts)] : [pts];
      for (const s of sets) sv('path', { d: poly(s), fill, 'fill-opacity': a.density === 'dense' ? 0.78 : 1, stroke: 'none' }, zg);
    }
  }
  if (view === 'airway') airwayWalls(svg);
  landmarks(svg, view);
  sv('path', { d: OUTLINE[view], fill: 'none', stroke: '#55534d', 'stroke-width': 1.3 }, svg);
  points.forEach((p) => {
    const g = sv('g', { class: 'hn-pt' }, svg);
    sv('circle', { cx: p.at[0], cy: p.at[1], r: p.n ? 7 : 3.6, fill: '#633d3c', stroke: '#fffaf0', 'stroke-width': 1.4 }, g);
    if (p.n) sv('text', { x: p.at[0], y: p.at[1] + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: '#fffaf0', 'font-family': 'NTF Sans, Inter, sans-serif', text: String(p.n) }, g);
    if (p.line) sv('path', { d: smooth(p.line, false), fill: 'none', stroke: '#633d3c', 'stroke-width': 2.2, 'stroke-dasharray': '5 3', 'stroke-linecap': 'round' }, g);
  });
}

/** One view as an <svg> (for anatomy figures). opts: {areas, side, points:[{at:[x,y], n?, line?}], label} */
export function headFigure(view, opts = {}) {
  const svg = sv('svg', { viewBox: VB[view], class: 'hn-fig-svg', role: 'img', 'aria-label': opts.label || VIEW_NAMES[view] });
  paintView(svg, view, opts);
  return svg;
}

/**
 * headCoverageMap(coverage) -> <figure class="tb-cov hn-cov">. Use as `coverage.map` in a block.
 * coverage = {side, views?: ['front','side','back'|'airway'], areas: [{zones: ['infraorbital'] or a group, density}], summary, caption?}
 * Groups: scalp, superficialCervical, face, airway. Views default to those that show any shaded zone.
 */
export function headCoverageMap(cov, { id, title } = {}) {
  const used = expand((cov.areas || []).flatMap((a) => a.zones));
  const views = cov.views || ['front', 'side', 'back', 'airway'].filter((v) => used.some((z) => ZONES[z]?.[v]));
  const fig = el('figure', { class: 'tb-cov hn-cov', id });
  const grid = el('div', { class: `hn-cov-views hn-cov-views--${views.length}` });
  const words = (cov.areas || []).map((a) => `${expand(a.zones).map((z) => ZONES[z]?.name || z).join(', ')}: ${DENSITY[a.density]?.label || a.density}`).join('. ');
  views.forEach((v) => {
    const svg = sv('svg', { viewBox: VB[v], class: 'hn-cov-svg', 'aria-hidden': 'true' });
    paintView(svg, v, { areas: cov.areas, side: cov.side });
    grid.append(el('div', { class: 'hn-cov-view' }, svg, el('p', { class: 'hn-cov-vname', text: VIEW_NAMES[v] })));
  });
  const stage = el('div', { class: 'tb-cov-stage', role: 'img', 'aria-label': `Coverage map${title ? ` for ${title}` : ''}. ${cov.summary || ''} ${words}.` }, grid);
  fig.append(stage);
  const legend = el('ul', { class: 'tb-cov-legend', 'aria-label': 'Key' });
  const dens = new Set((cov.areas || []).map((a) => a.density));
  for (const k of ['dense', 'moderate', 'patchy']) {
    if (!dens.has(k)) continue;
    legend.append(el('li', {}, el('span', { class: `tb-cov-sw tb-cov-sw--${k}`, 'aria-hidden': 'true' }), el('span', { text: `${DENSITY[k].label}: ${DENSITY[k].text}` })));
  }
  const side = cov.side === 'bilateral' ? 'Shown on both sides (bilateral blocks).' : cov.side === 'midline' ? 'Midline structures.' : 'One side shown (the patient’s right).';
  legend.append(el('li', { class: 'tb-cov-note', text: `${side} Areas are schematic: nerve territories vary and overlap.` }));
  const zl = el('ul', { class: 'hn-cov-zones', 'aria-label': 'Nerves and areas' });
  used.forEach((z) => { if (ZONES[z]) zl.append(el('li', {}, el('strong', { text: ZONES[z].name }), `: ${ZONES[z].area}`)); });
  fig.append(el('figcaption', {}, legend, zl));
  return fig;
}

/**
 * Small head with the probe drawn on it, or the needle entry points of a landmark block.
 * probe = {view, x, y, angle (deg, 0 = horizontal on the figure), label, marker?, points?: [[x, y], …]}.
 * Coordinates are in the 200 x 260 view; 30 units is about one linear probe footprint.
 */
export function headProbeInset(probe, opts = {}) {
  const view = probe.view || 'side';
  const svg = sv('svg', { viewBox: '0 0 200 260', class: 'tb-probe-svg hn-probe-svg', role: 'img', 'aria-label': `${probe.points ? 'Needle entry' : 'Probe position'}: ${probe.label || ''}` });
  paintView(svg, view, {});
  if (probe.x != null) {
    const pr = sv('g', { transform: `translate(${probe.x} ${probe.y}) rotate(${probe.angle || 0})` }, svg);
    sv('rect', { x: -15, y: -4.5, width: 30, height: 9, fill: '#272722', stroke: '#fffaf0', 'stroke-width': 1.2 }, pr);
    const mk = probe.marker || opts.marker || 'left';
    sv('circle', { cx: mk === 'right' ? 11 : -11, cy: 0, r: 2.2, fill: '#fffaf0' }, pr);
  }
  (probe.points || []).forEach(([x, y]) => {
    sv('circle', { cx: x, cy: y, r: 6, fill: '#633d3c', stroke: '#fffaf0', 'stroke-width': 1.6 }, svg);
  });
  return svg;
}

/**
 * viewsFigure({id, title, views: [{view, points?, areas?, side?, caption?}], key?: [HTML], caption?: HTML})
 * -> <figure class="hn-fig">: views side by side (points numbered with `n` match the numbered key), for anatomy chapters.
 */
export function viewsFigure({ id, title, views = [], key = [], caption, label } = {}) {
  const fig = el('figure', { class: 'hn-fig', id });
  if (title) fig.append(el('p', { class: 'hn-fig-title', text: title }));
  const stage = el('div', { class: 'hn-fig-stage', style: `--hn-cols:${views.length}`, role: 'img', 'aria-label': label || title || 'Diagram' });
  views.forEach((v) => {
    const svg = headFigure(v.view, { areas: v.areas, side: v.side, points: v.points });
    svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('role');
    stage.append(el('figure', {}, svg, el('figcaption', { text: v.caption || VIEW_NAMES[v.view] })));
  });
  fig.append(stage);
  const cap = el('figcaption', {});
  if (key.length) { const ol = el('ol', { class: 'hn-key' }); key.forEach((k) => { const li = el('li'); li.insertAdjacentHTML('beforeend', `<span>${k}</span>`); ol.append(li); }); cap.append(ol); }
  if (caption) cap.insertAdjacentHTML('beforeend', `<p>${caption}</p>`);
  if (cap.childNodes.length) fig.append(cap);
  return fig;
}
