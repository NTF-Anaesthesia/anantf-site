// Upper-limb blocks: original, schematic drawings of the right upper limb (with the shoulder, the side of the neck and
// the upper chest) for coverage maps and probe insets. Drop-in partner of figures/leg.js and figures/head.js:
//   armCoverageMap(coverage, {id, title})   -> <figure class="tb-cov ul-cov"> (pass as coverage.map in a block)
//   armProbeInset(probe, opts)              -> small limb SVG with the probe or the needle entry points (scene.probeInset)
//   armFigure(view, {zones, density, areas, points, labels, tint}) -> one view as an <svg>, for anatomy chapters
// Views: 'front' (anatomical position, palm forward; the patient's right side, so the thumb and the shoulder are on the
// viewer's left and the midline on the right) and 'back' (the same limb seen from behind: midline on the left).
// Both are viewBox 0 0 180 430. Zones and landmarks are authored once in front-view coordinates; the back view is
// their mirror image (x -> 180 - x), so "lateral" is always the small-x side in the data below.
// Zones are schematic areas of skin (cutaneous) or deep structures (joint and bone, drawn as outlined, cross-hatched
// glyphs labelled "deep"). Density is shown by fill strength, pattern and words, never by colour alone.
// Styles: upper-limb/shared/css/upperlimb.css (ul- prefix).
import { el, sv } from '../ui.js';
import { DENSITY } from '../dermatomes.js';

const W = 180;
const H = 430;
const mx = (x) => W - x;

// ---------------------------------------------------------------- geometry helpers
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
const smoothOn = (pts) => smooth(pts, false).replace(/^M[^C]*/, '');
const f1 = (n) => +n.toFixed(2);
const poly = (pts) => `M${pts.map((p) => p.map(f1).join(' ')).join(' L')}Z`;
const mirrorPts = (pts) => pts.map(([x, y]) => [mx(x), y]);

/** Fingers as rounded tips pointing down: [[xl, xr, tipY]], clefts [y]. fx maps x (mirrored view). */
function fingerRow(fingers, clefts, fx) {
  let d = '';
  fingers.forEach(([xl, xr, tip], i) => {
    const rx = (xr - xl) / 2, ry = rx * 1.1, yb = tip - ry;
    const a = fx(xl), b = fx(xr);
    d += ` L${f1(a)} ${f1(yb)} A${f1(rx)} ${f1(ry)} 0 0 ${b > a ? 0 : 1} ${f1(b)} ${f1(yb)}`;
    if (i < fingers.length - 1) {
      const c = clefts[i], nx = fingers[i + 1][0];
      d += ` L${f1(b)} ${f1(c + 1.2)} Q${f1(fx((xr + nx) / 2))} ${f1(c - 2.4)} ${f1(fx(nx))} ${f1(c + 1.2)}`;
    }
  });
  return d;
}

// ---------------------------------------------------------------- outline (original drawing, front-view coordinates)
// Lateral contour from the side of the neck, over the shoulder, down the arm and forearm to the thumb.
const LAT = [[150, 0], [148, 24], [138, 40], [112, 47], [82, 51], [58, 54], [44, 58], [34, 64], [27, 78], [24, 96], [25, 116],
  [27, 136], [29, 160], [31, 186], [33, 208], [31, 228], [32, 250], [36, 280], [40, 306], [43, 324], [41, 334], [34, 345],
  [27, 357], [23, 368], [22, 376]];
// Inner border of the thumb back to the first web space.
const THUMB_IN = [[22, 376], [27, 381], [33, 375], [39, 366], [45, 360], [47, 362]];
// Index, middle, ring and little fingers (palm forward): [left x, right x, tip y].
const FINGERS = [[46, 57, 404], [57.5, 68, 410], [68.5, 78, 405], [78.5, 87, 395]];
const CLEFTS = [376, 378, 376];
// Medial contour from the little finger back up to the axilla and the side of the chest.
const MED = [[87, 386], [88, 368], [88, 350], [86, 338], [83, 328], [84, 300], [86, 270], [89, 240], [91, 214], [90, 190],
  [89, 160], [89, 135], [91, 114], [98, 118], [104, 132], [106, 150]];

function outlinePath(fx) {
  const L = LAT.map(([x, y]) => [fx(x), y]);
  const T = THUMB_IN.map(([x, y]) => [fx(x), y]);
  const M = MED.map(([x, y]) => [fx(x), y]);
  return `M${L[0].join(' ')}${smoothOn(L)}${smoothOn(T)}${fingerRow(FINGERS, CLEFTS, fx)} L${M[0].join(' ')}${smoothOn(M)}`;
}
const FRONT_PATH = outlinePath((x) => x);
const BACK_PATH = outlinePath(mx);

export const OUTLINE = {
  front: { contour: FRONT_PATH, fill: `${FRONT_PATH} L${W} 150 L${W} 0 Z` },
  back: { contour: BACK_PATH, fill: `${BACK_PATH} L0 150 L0 0 Z` },
};
const VB = { front: [0, 0, W, H], back: [0, 0, W, H] };
const VIEW_NAMES = { front: 'Front', back: 'Back' };
const VIEW_ORDER = ['front', 'back'];
// Where "Lat" and "Med" sit (bottom corners, clear of the outline).
const SIDES = {
  front: [['Lat', 4, 424, 'start'], ['Med', 176, 424, 'end']],
  back: [['Med', 4, 424, 'start'], ['Lat', 176, 424, 'end']],
};

// ---------------------------------------------------------------- landmarks (front-view coordinates; back is mirrored)
const LM = {
  front: {
    cricoid: [174, 16], interscalene: [158, 22], 'lower-neck': [150, 36], 'supraclavicular-fossa': [116, 49],
    'clavicle-mid': [110, 57], 'sternal-notch': [176, 60], acromion: [44, 58], coracoid: [64, 70], infraclavicular: [70, 76],
    costoclavicular: [104, 66], axilla: [86, 120], 'mid-arm': [60, 160], 'lateral-elbow': [40, 200], antecubital: [62, 212],
    'medial-epicondyle': [90, 212], 'mid-forearm': [64, 262], 'forearm-ulnar': [80, 262], 'forearm-radial': [44, 262],
    wrist: [62, 324], 'wrist-median': [64, 324], 'wrist-ulnar': [80, 322], 'wrist-radial': [44, 322], palm: [64, 346],
  },
  back: {
    'scapular-spine': [94, 74], 'supraspinous-fossa': [98, 64], 'suprascapular-notch': [80, 66], acromion: [44, 60],
    'posterior-deltoid': [40, 100], 'quadrilateral-space': [56, 104], 'posterior-arm': [62, 160], olecranon: [62, 212],
    'posterior-forearm': [62, 262], 'wrist-dorsum': [60, 324], 'first-web': [42, 352], snuffbox: [40, 330],
  },
};
export const LANDMARKS = {
  front: LM.front,
  back: Object.fromEntries(Object.entries(LM.back).map(([k, [x, y]]) => [k, [mx(x), y]])),
};
const LANDMARK_NAMES = {
  cricoid: 'Cricoid', interscalene: 'Interscalene groove (C6)', 'lower-neck': 'Lower neck', 'supraclavicular-fossa': 'Supraclavicular fossa',
  'clavicle-mid': 'Clavicle', 'sternal-notch': 'Sternal notch', acromion: 'Acromion', coracoid: 'Coracoid process',
  infraclavicular: 'Below the coracoid', costoclavicular: 'Below the mid-clavicle', axilla: 'Axilla', 'mid-arm': 'Mid-arm',
  'lateral-elbow': 'Lateral elbow', antecubital: 'Antecubital fossa', 'medial-epicondyle': 'Medial epicondyle',
  'mid-forearm': 'Mid-forearm', 'forearm-ulnar': 'Ulnar side of the forearm', 'forearm-radial': 'Radial side of the forearm',
  wrist: 'Wrist', 'wrist-median': 'Wrist, median', 'wrist-ulnar': 'Wrist, ulnar', 'wrist-radial': 'Wrist, radial', palm: 'Palm',
  'scapular-spine': 'Spine of the scapula', 'supraspinous-fossa': 'Supraspinous fossa', 'suprascapular-notch': 'Suprascapular notch',
  'posterior-deltoid': 'Posterior deltoid', 'quadrilateral-space': 'Quadrilateral space', 'posterior-arm': 'Back of the arm',
  olecranon: 'Olecranon', 'posterior-forearm': 'Back of the forearm', 'wrist-dorsum': 'Back of the wrist', 'first-web': 'First web space',
  snuffbox: 'Anatomical snuffbox',
};
const at = (view, a) => (Array.isArray(a) ? a : LANDMARKS[view]?.[a] || null);

const INK = '#8f8574';
const FAINT = '#cbbda6';
function landmarks(g, view) {
  const line = { fill: 'none', stroke: INK, 'stroke-width': 1, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const dash = { ...line, 'stroke-dasharray': '3 2.5' };
  const dot = { ...line, 'stroke-dasharray': '0.1 3', 'stroke-width': 1.4 };
  const form = { fill: 'none', stroke: FAINT, 'stroke-width': 0.9, 'stroke-linecap': 'round' };
  const P = (pts) => (view === 'back' ? mirrorPts(pts) : pts);
  const path = (pts, attrs, closed = false) => sv('path', { d: smooth(P(pts), closed), ...attrs }, g);
  const pt = ([x, y], r = 1.9) => sv('circle', { cx: view === 'back' ? mx(x) : x, cy: y, r, fill: INK }, g);
  if (view === 'front') {
    sv('path', { d: `M${W - 2} 2 V148`, ...dot }, g);                                         // midline
    path([[150, 6], [160, 26], [172, 52]], form);                                           // sternocleidomastoid
    path([[46, 58], [80, 53], [110, 57], [140, 64], [174, 58]], line);                      // clavicle
    path([[60, 62], [70, 90], [86, 112]], form);                                            // deltopectoral groove
    path([[92, 114], [112, 92], [140, 84]], dash);                                          // anterior axillary fold (pectoralis major)
    pt([64, 70]);                                                                           // coracoid
    path([[36, 210], [62, 216], [88, 212]], line);                                          // elbow crease
    path([[44, 324], [62, 328], [82, 326]], line);                                          // wrist crease
    path([[46, 336], [52, 352], [62, 360]], form);                                          // thenar crease
  } else {
    sv('path', { d: 'M2 2 V148', ...dot }, g);                                              // midline (spine)
    path([[48, 62], [62, 70], [126, 66], [124, 96], [118, 148], [96, 128], [74, 104], [60, 86]], dash, true); // scapula
    path([[46, 62], [70, 70], [96, 74], [124, 80]], line);                                  // spine of the scapula
    path([[34, 66], [44, 100], [58, 110]], form);                                           // posterior deltoid
    pt([62, 212], 2.4);                                                                     // olecranon
    path([[44, 324], [62, 326], [80, 326]], line);                                          // wrist
  }
}

// ---------------------------------------------------------------- zones (front-view coordinates)
// Each zone: name and area (legend), one polygon (or a list) per view, `lab` = label anchor per view. Shapes are clipped
// to the outline, so they may overreach it.
export const ZONES = {
  cape: { name: 'Supraclavicular nerves (C3–C4, cervical plexus)', short: 'Cape', area: 'the “cape”: skin over the clavicle, the top of the shoulder and the upper chest',
    front: [[146, 36], [150, 28], [180, 38], [180, 84], [140, 84], [110, 80], [80, 76], [60, 72], [42, 72], [20, 74], [20, 60], [40, 50], [100, 44]],
    back: [[146, 36], [150, 28], [180, 38], [180, 74], [140, 70], [100, 66], [70, 66], [44, 70], [20, 74], [20, 60], [40, 50], [100, 44]],
    lab: { front: [120, 68], back: [mx(110), 58] } },
  'upper-lat-arm': { name: 'Superior lateral cutaneous nerve of the arm (axillary nerve)', short: 'Axillary', area: 'the “regimental badge” over the lower deltoid',
    front: [[16, 72], [60, 72], [60, 100], [61, 140], [16, 140]],
    back: [[16, 72], [44, 70], [62, 80], [66, 100], [64, 140], [16, 140]],
    lab: { front: [40, 110], back: [mx(42), 112] } },
  'lower-lat-arm': { name: 'Inferior lateral cutaneous nerve of the arm (radial nerve)', short: 'Radial', area: 'the lower lateral arm',
    front: [[16, 140], [61, 140], [60, 150], [56, 176], [52, 212], [16, 214]],
    back: [[16, 140], [64, 140], [60, 150], [56, 176], [54, 212], [16, 214]],
    lab: { front: [36, 178] } },
  'post-arm': { name: 'Posterior cutaneous nerve of the arm (radial nerve)', short: 'Radial', area: 'the back of the arm',
    back: [[62, 80], [80, 104], [82, 150], [80, 212], [54, 212], [56, 176], [60, 150], [64, 140], [66, 100]],
    lab: { back: [mx(70), 172] } },
  'upper-med-arm': { name: 'Intercostobrachial nerve (T2)', short: 'ICBN', area: 'the axilla and the upper inner arm (not part of the brachial plexus)',
    front: [[60, 72], [112, 78], [112, 150], [60, 150], [61, 140], [60, 100]],
    back: [[62, 80], [112, 90], [112, 150], [82, 150], [80, 104]],
    lab: { front: [80, 132] } },
  'lower-med-arm': { name: 'Medial cutaneous nerve of the arm (medial cord)', short: 'MCNA', area: 'the lower inner arm',
    front: [[60, 150], [112, 150], [112, 216], [52, 212], [56, 176]],
    back: [[82, 150], [112, 150], [112, 216], [80, 212]],
    lab: { front: [78, 192] } },
  'lat-forearm': { name: 'Lateral cutaneous nerve of the forearm (musculocutaneous nerve)', short: 'LCNF', area: 'the lateral (thumb side) forearm',
    front: [[16, 214], [52, 212], [58, 240], [60, 280], [60, 326], [16, 330]],
    back: [[16, 214], [46, 214], [50, 260], [56, 326], [16, 330]],
    lab: { front: [46, 268, -90] } },
  'med-forearm': { name: 'Medial cutaneous nerve of the forearm (medial cord)', short: 'MCNF', area: 'the medial (little finger side) forearm',
    front: [[52, 212], [112, 216], [112, 330], [60, 326], [60, 280], [58, 240]],
    back: [[80, 214], [112, 216], [112, 330], [72, 326], [76, 260]],
    lab: { front: [74, 268, -90] } },
  'post-forearm': { name: 'Posterior cutaneous nerve of the forearm (radial nerve)', short: 'Radial', area: 'the back of the forearm',
    back: [[46, 214], [80, 214], [76, 260], [72, 326], [56, 326], [50, 260]],
    lab: { back: [mx(63), 268] } },
  'palm-lat': { name: 'Median nerve', short: 'Median', area: 'the lateral palm and the palmar side of the thumb, index, middle and half the ring finger (with their nail beds)',
    front: [[0, 326], [60, 326], [74, 328], [73.5, 360], [73.5, 430], [0, 430]],
    back: [[44, 388], [73.5, 388], [73.5, 430], [44, 430]],
    lab: { front: [54, 350] } },
  'dorsum-lat-hand': { name: 'Superficial branch of the radial nerve', short: 'Radial', area: 'the back of the lateral hand and thumb (first web space)',
    back: [[0, 326], [56, 326], [74, 328], [73.5, 360], [73.5, 388], [44, 388], [44, 430], [0, 430]],
    lab: { back: [mx(56), 348] } },
  'ulnar-hand': { name: 'Ulnar nerve', short: 'Ulnar', area: 'the medial hand and the little finger and half the ring finger, front and back',
    front: [[74, 328], [112, 330], [112, 430], [73.5, 430], [73.5, 360]],
    back: [[74, 328], [112, 330], [112, 430], [73.5, 430], [73.5, 360]],
    lab: { front: [84, 362, -90], back: [mx(84), 362, 90] } },
  // Deep structures (joint and bone glyphs)
  'shoulder-joint': { deep: true, name: 'Shoulder joint', short: 'Shoulder', area: 'deep: suprascapular nerve (most of the joint, posterior and superior), axillary and lateral pectoral nerves (anterior and inferior)',
    front: 'shoulder', back: 'shoulder', lab: { front: [34, 50], back: [mx(34), 50] } },
  clavicle: { deep: true, name: 'Lateral clavicle', short: 'Clavicle', area: 'deep: mixed cervical plexus (supraclavicular nerves) and brachial plexus (nerve to subclavius, suprascapular, lateral pectoral) supply',
    front: 'clavicle', lab: { front: [140, 52] } },
  'humerus-prox': { deep: true, name: 'Proximal humerus', short: 'Humerus', area: 'deep: axillary, musculocutaneous and radial nerves',
    front: 'humerusProx', back: 'humerusProx', lab: { front: [80, 104], back: [mx(80), 104] } },
  'humerus-dist': { deep: true, name: 'Mid and distal humerus', short: 'Humerus', area: 'deep: radial and musculocutaneous nerves',
    front: 'humerusDist', back: 'humerusDist', lab: { front: [110, 172], back: [mx(110), 172] } },
  elbow: { deep: true, name: 'Elbow joint', short: 'Elbow', area: 'deep: musculocutaneous, radial, median and ulnar nerves',
    front: 'elbow', back: 'elbow', lab: { front: [112, 214], back: [mx(112), 214] } },
  'forearm-bones': { deep: true, name: 'Radius and ulna', short: 'Forearm', area: 'deep: median, radial (posterior interosseous), ulnar and musculocutaneous nerves',
    front: 'forearm', back: 'forearm', lab: { front: [108, 276], back: [mx(108), 276] } },
  'wrist-hand': { deep: true, name: 'Wrist and hand', short: 'Wrist', area: 'deep: median (anterior interosseous), ulnar and radial (posterior interosseous) nerves',
    front: 'wrist', back: 'wrist', lab: { front: [108, 348], back: [mx(108), 348] } },
};
export const GROUPS = {
  hand: ['palm-lat', 'dorsum-lat-hand', 'ulnar-hand'],
  'forearm-skin': ['lat-forearm', 'med-forearm', 'post-forearm'],
  'arm-skin': ['upper-lat-arm', 'lower-lat-arm', 'post-arm', 'lower-med-arm'],
  humerus: ['humerus-prox', 'humerus-dist'],
};
const GROUP_INFO = {};

// Deep glyph shapes in front-view coordinates (mirrored for the back).
const DEEP = {
  shoulder: [[32, 66], [46, 61], [60, 66], [62, 80], [50, 88], [36, 84]],
  clavicle: [[50, 55], [80, 50], [110, 54], [140, 61], [172, 56], [173, 62], [140, 67], [110, 61], [80, 57], [52, 61]],
  humerusProx: [[38, 86], [52, 88], [55, 140], [44, 140]],
  humerusDist: [[44, 142], [55, 142], [59, 196], [45, 196]],
  elbow: [[38, 200], [60, 198], [82, 202], [84, 218], [60, 222], [40, 218]],
  forearm: [[42, 226], [78, 228], [74, 318], [50, 318]],
  wrist: [[46, 326], [78, 328], [82, 362], [48, 364]],
};

const leaves = (z) => [z];
const expandNames = (zones) => [...new Set((zones || []).flatMap((z) => GROUPS[z] || [z]))];
const expandLeaves = (zones) => [...new Set(expandNames(zones).flatMap(leaves))];
const zoneShapes = (z, view) => {
  const s = ZONES[z]?.[view]; if (!s) return [];
  const fx = view === 'back' ? mirrorPts : (p) => p;
  if (typeof s === 'string') return [{ deep: true, d: smooth(fx(DEEP[s])) }];
  const list = Array.isArray(s[0][0]) ? s : [s];
  return list.map((p) => ({ d: poly(fx(p)) }));
};
for (const [k, z] of Object.entries(ZONES)) z.views = VIEW_ORDER.filter((v) => leaves(k).some((p) => ZONES[p]?.[v]));
export const VIEWS = VIEW_ORDER;

// Distinct muted tints for atlas-style figures (`tint: true`). Not used for density.
const TINT = {
  cape: '#ddd3bd', 'upper-lat-arm': '#d9c7a0', 'lower-lat-arm': '#c7c2e3', 'post-arm': '#c7c2e3', 'upper-med-arm': '#e3c7c0',
  'lower-med-arm': '#b9cfd6', 'lat-forearm': '#c9d6b4', 'med-forearm': '#a9cbb8', 'post-forearm': '#c7c2e3', 'palm-lat': '#e4d29e',
  'dorsum-lat-hand': '#c7c2e3', 'ulnar-hand': '#e4a9a0',
};

// ---------------------------------------------------------------- painting
let patSeq = 0;
function defs(svg) {
  patSeq += 1;
  const id = (n) => `uld-${n}-${patSeq}`;
  const d = sv('defs', {}, svg);
  const h = sv('pattern', { id: id('hatch'), width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
  sv('rect', { width: 6, height: 6, fill: 'rgba(44,116,179,.32)' }, h);
  sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#1d4f7c', 'stroke-width': 2 }, h);
  const p = sv('pattern', { id: id('dots'), width: 6, height: 6, patternUnits: 'userSpaceOnUse' }, d);
  sv('rect', { width: 6, height: 6, fill: 'rgba(44,116,179,.12)' }, p);
  sv('circle', { cx: 3, cy: 3, r: 1.1, fill: '#1d4f7c' }, p);
  const x = sv('pattern', { id: id('deep'), width: 4, height: 4, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-45)' }, d);
  sv('line', { x1: 0, y1: 0, x2: 0, y2: 4, stroke: '#183f63', 'stroke-width': 0.9, 'stroke-opacity': 0.75 }, x);
  return { dense: '#2c74b3', moderate: `url(#${id('hatch')})`, patchy: `url(#${id('dots')})`, deep: `url(#${id('deep')})`, clip: id('clip') };
}

const SANS = 'NTF Sans, Inter, sans-serif';
function text(parent, x, y, t, { size = 13, anchor = 'middle', fill = '#3f3b34', weight = 500, halo = true, italic = false, rot = 0 } = {}) {
  return sv('text', { x, y, transform: rot ? `rotate(${rot} ${x} ${y - size * 0.35})` : null, 'text-anchor': anchor, 'font-size': size, 'font-weight': weight, 'font-family': SANS, fill,
    'font-style': italic ? 'italic' : null, stroke: halo ? '#fbf9f4' : null, 'stroke-width': halo ? 3 : null,
    'stroke-linejoin': 'round', 'paint-order': 'stroke', text: t }, parent);
}

/** Paint one view into `g`. opts: {areas:[{zones, density}], tint, labels, points, fills, sides, deepTags} */
function paintView(g, view, opts = {}) {
  const fills = opts.fills;
  const clipId = `${fills.clip}-${view}-${(patSeq += 1)}`;
  const cp = sv('clipPath', { id: clipId }, g);
  sv('path', { d: OUTLINE[view].fill }, cp);
  sv('path', { d: OUTLINE[view].fill, fill: '#f1e7d8', stroke: 'none' }, g);
  const zg = sv('g', { 'clip-path': `url(#${clipId})` }, g);
  const areas = opts.areas || [];
  const deepDraw = [];
  const seen = new Set();
  for (const a of areas) {
    for (const z of expandLeaves(a.zones)) {
      if (seen.has(z) && !opts.tint) continue; seen.add(z);
      for (const s of zoneShapes(z, view)) {
        if (s.deep) { deepDraw.push({ z, d: s.d, density: a.density }); continue; }
        const fill = opts.tint ? (TINT[z] || '#ddd') : (fills[a.density] || fills.moderate);
        sv('path', { d: s.d, fill, 'fill-opacity': !opts.tint && a.density === 'dense' ? 0.78 : 1, stroke: '#fbf9f4', 'stroke-width': 0.7, 'stroke-linejoin': 'round' }, zg);
      }
    }
  }
  landmarks(g, view);
  deepDraw.forEach(({ d, density }) => {
    const dg = sv('g', { class: 'ul-deep' }, g);
    sv('path', { d, fill: '#fbf9f4', stroke: 'none' }, dg);
    sv('path', { d, fill: fills[density] || fills.moderate, 'fill-opacity': density === 'dense' ? 0.78 : 1, stroke: 'none' }, dg);
    sv('path', { d, fill: fills.deep, stroke: '#183f63', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, dg);
  });
  sv('path', { d: OUTLINE[view].contour, fill: 'none', stroke: '#55534d', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, g);
  if (opts.deepTags !== false) {
    const tagged = new Set();
    deepDraw.forEach(({ z }) => {
      if (tagged.has(z)) return; tagged.add(z);
      const p = ZONES[z].lab?.[view]; if (!p) return;
      text(g, p[0], p[1] + 5, opts.labels ? `${ZONES[z].short}, deep` : 'deep', { size: opts.tagSize || 16, fill: '#183f63', weight: 600, italic: true });
    });
  }
  if (opts.labels) {
    const lab = sv('g', { class: 'ul-labels' }, g);
    const done = new Set();
    for (const a of areas) for (const z of expandLeaves(a.zones)) {
      if (ZONES[z]?.deep || done.has(z)) continue; done.add(z);
      const p = ZONES[z]?.lab?.[view]; if (!p) continue;
      text(lab, p[0], p[1] + 4.5, ZONES[z].short, { size: opts.labelSize || 13, weight: 600, fill: '#272722', rot: p[2] || 0 });
    }
    if (Array.isArray(opts.labels)) opts.labels.forEach((l) => {
      const item = typeof l === 'string' ? { at: l, text: LANDMARK_NAMES[l] || l } : l;
      const p = at(view, item.at); if (!p) return;
      const q = item.lab || p;
      if (item.lab) sv('path', { d: `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`, stroke: '#55534d', 'stroke-width': 0.8, fill: 'none' }, lab);
      sv('circle', { cx: p[0], cy: p[1], r: 1.8, fill: '#55534d' }, lab);
      text(lab, q[0] + (item.anchor === 'end' ? -3 : item.anchor === 'middle' ? 0 : 3), q[1] + 4.5, item.text, { size: opts.labelSize || 13, anchor: item.anchor || 'start', fill: '#272722' });
    });
  }
  if (opts.sides !== false) {
    const sg = sv('g', { 'aria-hidden': 'true' }, g);
    (SIDES[view] || []).forEach(([t, x, y, anchor]) => text(sg, x, y, t, { size: opts.sideSize || 18, anchor, fill: '#6b655b', weight: 500 }));
  }
  (opts.points || []).forEach((pnt) => {
    const p = at(view, pnt.at || pnt); if (!p) return;
    const pg = sv('g', { class: 'ul-pt' }, g);
    const n = pnt.n;
    sv('circle', { cx: p[0], cy: p[1], r: n ? 7.5 : (opts.pointR || 4), fill: '#633d3c', stroke: '#fffaf0', 'stroke-width': 1.5 }, pg);
    if (n) text(pg, p[0], p[1] + 4.2, String(n), { size: 11.5, fill: '#fffaf0', weight: 700, halo: false });
    if (pnt.label && opts.pointLabels) {
      const q = pnt.lab || [p[0] + 9, p[1]];
      text(pg, q[0], q[1] + 4.5, pnt.label, { size: 13, anchor: pnt.anchor || 'start', fill: '#272722' });
    }
  });
}

function areasFrom(opts) {
  if (opts.areas) return opts.areas;
  if (opts.zones) return [{ zones: opts.zones, density: opts.density || 'dense' }];
  return [];
}

/** armFigure(view, {zones, density, areas?, points?, labels?, tint?, label?}) -> <svg class="ul-fig-svg">. */
export function armFigure(view = 'front', opts = {}) {
  const [x, y, w, h] = VB[view] || VB.front;
  const svg = sv('svg', { viewBox: `${x} ${y} ${w} ${h}`, class: `ul-fig-svg ul-fig-svg--${view}`, role: 'img', 'aria-label': opts.label || `${VIEW_NAMES[view]} of the right upper limb` });
  const fills = defs(svg);
  paintView(svg, view, { ...opts, areas: areasFrom(opts), fills, pointLabels: true });
  return svg;
}

/**
 * armCoverageMap(coverage, {id, title}) -> <figure class="tb-cov ul-cov">. Use as `coverage.map` in a block.
 * coverage = {views?: ['front','back'], areas: [{zones, density}], summary, misses?}. Views default to those that show
 * any shaded zone.
 */
export function armCoverageMap(cov, { id, title } = {}) {
  const used = expandLeaves((cov.areas || []).flatMap((a) => a.zones));
  const views = (cov.views || VIEW_ORDER.filter((v) => used.some((z) => ZONES[z]?.[v]))).filter((v) => VB[v]);
  const fig = el('figure', { class: 'tb-cov ul-cov', id });
  const grid = el('div', { class: `ul-cov-views ul-cov-views--${views.length}` });
  views.forEach((v) => {
    const [x, y, w, h] = VB[v];
    const svg = sv('svg', { viewBox: `${x} ${y} ${w} ${h}`, class: 'ul-cov-svg', 'aria-hidden': 'true' });
    paintView(svg, v, { areas: cov.areas, fills: defs(svg) });
    grid.append(el('div', { class: 'ul-cov-view' }, svg, el('p', { class: 'ul-cov-vname', text: VIEW_NAMES[v] })));
  });
  const words = (cov.areas || []).map((a) => `${expandNames(a.zones).map((z) => ZONES[z]?.name || z).join(', ')}: ${DENSITY[a.density]?.label || a.density}`).join('. ');
  fig.append(el('div', { class: 'tb-cov-stage', role: 'img', 'aria-label': `Coverage map${title ? ` for ${title}` : ''}, right upper limb. ${cov.summary || ''} ${words}.` }, grid));
  const legend = el('ul', { class: 'tb-cov-legend', 'aria-label': 'Key' });
  const dens = new Set((cov.areas || []).map((a) => a.density));
  for (const k of ['dense', 'moderate', 'patchy']) {
    if (!dens.has(k)) continue;
    legend.append(el('li', {}, el('span', { class: `tb-cov-sw tb-cov-sw--${k}`, 'aria-hidden': 'true' }), el('span', { text: `${DENSITY[k].label}: ${DENSITY[k].text}` })));
  }
  if (used.some((z) => ZONES[z]?.deep)) legend.append(el('li', {}, el('span', { class: 'tb-cov-sw ul-cov-sw--deep', 'aria-hidden': 'true' }), el('span', { text: 'Outlined, cross-hatched shapes marked “deep”: joint or bone, not skin' })));
  legend.append(el('li', { class: 'tb-cov-note', text: 'The right upper limb. Areas are schematic: nerve territories vary and overlap.' }));
  const zl = el('ul', { class: 'ul-cov-zones', 'aria-label': 'Nerves and areas' });
  const names = [];
  (cov.areas || []).forEach((a) => (a.zones || []).forEach((z) => { (GROUPS[z] || [z]).forEach((m) => { if (!names.includes(m)) names.push(m); }); }));
  names.forEach((z) => { const info = GROUP_INFO[z] || ZONES[z]; if (info) zl.append(el('li', {}, el('strong', { text: info.name }), `: ${info.area}`)); });
  fig.append(el('figcaption', {}, legend, zl));
  return fig;
}

/**
 * Small limb view with the probe drawn on it, or the needle entry points of a landmark block.
 * probe = {view, at: landmark name | [x, y], angle (0 = across the limb or neck, 90 = along it), label, marker?,
 *          needle?: [dx, dy], points?: [{at, label, view?}]}. The view is cropped around the probe.
 */
export function armProbeInset(probe = {}, opts = {}) {
  const view0 = VB[probe.view] ? probe.view : 'front';
  const pos = probe.at != null ? at(view0, probe.at) : (probe.x != null ? [probe.x, probe.y] : null);
  const pts = (probe.points || []).map((p) => {
    const v = VB[p.view] ? p.view : view0;
    return { view: v, xy: at(v, Array.isArray(p) ? p : p.at), label: p.label };
  }).filter((p) => p.xy);
  const byView = new Map();
  if (pos || !pts.length) byView.set(view0, []);
  pts.forEach((p) => { if (!byView.has(p.view)) byView.set(p.view, []); byView.get(p.view).push(p); });
  const multi = byView.size > 1;
  const panels = [...byView.entries()].map(([v, list]) => {
    const [, , w, h] = VB[v];
    const xy = [...list.map((p) => p.xy), ...(v === view0 && pos ? [pos] : [])];
    const ys = xy.map((p) => p[1]), xs = xy.map((p) => p[0]);
    const lo = ys.length ? Math.min(...ys) : h / 2, hi = ys.length ? Math.max(...ys) : h / 2;
    const Hh = Math.min(h, Math.max(multi ? 120 : 190, hi - lo + (multi ? 50 : 90)));
    const top = Math.max(0, Math.min(h - Hh, (lo + hi) / 2 - Hh / 2));
    if (!multi) return { v, list, box: [0, top, w, Hh] };
    const xl = Math.min(...xs), xr = Math.max(...xs);
    const Wd = Math.min(w, Math.max(90, xr - xl + 40));
    const left = Math.max(0, Math.min(w - Wd, (xl + xr) / 2 - Wd / 2));
    return { v, list, box: [left, top, Wd, Hh] };
  });
  const gap = 10;
  const Wt = panels.reduce((s, p) => s + p.box[2], 0) + gap * (panels.length - 1);
  const Ht = Math.max(...panels.map((p) => p.box[3]));
  const svg = sv('svg', { viewBox: `0 0 ${Wt} ${Ht}`, class: 'tb-probe-svg ul-probe-svg', role: 'img',
    'aria-label': `${pts.length ? 'Needle entry' : 'Probe position'}: ${probe.label || pts.map((p) => p.label).filter(Boolean).join(', ')}` });
  const fills = defs(svg);
  let ox = 0;
  panels.forEach(({ v, list, box }) => {
    const inner = sv('svg', { x: ox, y: 0, width: box[2], height: box[3], viewBox: box.join(' '), overflow: 'hidden' }, svg);
    paintView(inner, v, { fills, sides: false, deepTags: false });
    const s = SIDES[v];
    if (s && !multi) {
      const tg = sv('g', {}, inner);
      const k = 26;
      text(tg, box[0] + 3, box[1] + k, s[0][0], { size: k, anchor: 'start', fill: '#55534d', weight: 600 }).setAttribute('stroke-width', 7.5);
      text(tg, box[0] + box[2] - 3, box[1] + k, s[1][0], { size: k, anchor: 'end', fill: '#55534d', weight: 600 }).setAttribute('stroke-width', 7.5);
    }
    if (v === view0 && pos) {
      if (probe.needle) {
        const [nx, ny] = probe.needle;
        sv('line', { x1: pos[0] + nx, y1: pos[1] + ny, x2: pos[0], y2: pos[1], stroke: '#633d3c', 'stroke-width': 2.4, 'stroke-dasharray': '4 2' }, inner);
      }
      const pr = sv('g', { transform: `translate(${pos[0]} ${pos[1]}) rotate(${probe.angle || 0})` }, inner);
      sv('rect', { x: -15, y: -4.5, width: 30, height: 9, rx: 1, fill: '#272722', stroke: '#fffaf0', 'stroke-width': 1.2 }, pr);
      const mk = probe.marker || opts.marker || 'left';
      sv('circle', { cx: mk === 'right' ? 11 : -11, cy: 0, r: 2.2, fill: '#fffaf0' }, pr);
    }
    list.forEach((p) => sv('circle', { cx: p.xy[0], cy: p.xy[1], r: multi ? 7 : 6, fill: '#633d3c', stroke: '#fffaf0', 'stroke-width': 1.8 }, inner));
    ox += box[2] + gap;
  });
  return svg;
}
