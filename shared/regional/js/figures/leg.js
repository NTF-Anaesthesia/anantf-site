// Lower-limb blocks: original, schematic drawings of the right lower limb for coverage maps, probe insets and
// anatomy figures. Drop-in partners of the truncal dermatome map (../dermatomes.js), like
// figures/head.js:
//   legCoverageMap(coverage, {id, title})   -> <figure class="tb-cov ll-cov"> (pass as coverage.map in a block)
//   legProbeInset(probe, opts)              -> small limb SVG with the probe or the needle entry points (scene.probeInset)
//   legFigure(view, {zones, density, points, labels, tint}) -> one view as an <svg>, for anatomy chapters
//   legViewsFigure({views, key, caption})   -> several views side by side with a numbered key (anatomy chapters)
// Views (see LEG.md): 'front' and 'back' (viewBox 0 0 160 420), 'sole' (0 0 120 200) and 'dorsum' (0 0 120 200, the
// top of the foot, toes at the top, medial on the viewer's left; an addition to LEG.md for the foot zones).
// Zones are schematic areas of skin (cutaneous) or deep structures (joint and bone, drawn as outlined, cross-hatched
// glyphs labelled "deep"). Density is shown by fill strength, pattern and words, never by colour alone.
import { el, sv } from '../ui.js';
import { DENSITY } from '../dermatomes.js';

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
// Continue a path through pts (pts[0] is the current point) with a smooth open curve.
const smoothOn = (pts) => smooth(pts, false).replace(/^M[^C]*/, '');
const f1 = (n) => +n.toFixed(2);
/** A row of toes as rounded tips. toes: [[xl, xr, tipY]], dir -1 = tips up (sole, dorsum), +1 = tips down (front view);
 *  cleft: [y] depth of each cleft after a toe. fx maps x (for mirrored views). Returns path segments from the first toe's base. */
function toeRow(toes, dir, clefts, fx = (x) => x) {
  let d = '';
  toes.forEach(([xl, xr, tip], i) => {
    const rx = (xr - xl) / 2, ry = dir < 0 ? rx * 1.05 : Math.min(rx * 0.55, 4.5);
    const yb = tip - dir * ry;
    d += ` L${f1(fx(xl))} ${f1(yb)} A${f1(rx)} ${f1(ry)} 0 0 ${(dir < 0) === (fx(1) > fx(0)) ? 1 : 0} ${f1(fx(xr))} ${f1(yb)}`;
    if (i < toes.length - 1) {
      const c = clefts[i], nx = toes[i + 1][0];
      d += ` L${f1(fx(xr))} ${f1(c - dir * 1.2)} Q${f1(fx((xr + nx) / 2))} ${f1(c + (dir < 0 ? 2.4 : -2.4))} ${f1(fx(nx))} ${f1(c - dir * 1.2)}`;
    }
  });
  return d;
}
const poly = (pts) => `M${pts.map((p) => p.join(' ')).join(' L')}Z`;

// ---------------------------------------------------------------- outlines (original drawings)
// The anatomical contour is an open curve (stroked); the cut edges (waist, midline, ankle) close the shape unstroked.
const FRONT_LEG_LAT = [[34, 2], [30, 20], [22, 44], [15, 70], [12, 96], [13, 120], [17, 150], [21, 185], [26, 220], [31, 250],
  [34, 270], [34, 286], [37, 300], [42, 316], [45, 334], [48, 352], [52, 370], [54, 384], [51, 393], [49, 401], [52, 408], [55, 410]];
const FRONT_LEG_MED = [[121, 412], [121, 406], [117, 400], [111, 394], [108, 386], [110, 370], [115, 350], [120, 330], [121, 312],
  [118, 299], [121, 287], [124, 272], [127, 250], [133, 220], [140, 185], [146, 152], [151, 126], [155, 110], [158, 102]];
// Toes seen end-on from the front, lateral to medial: [left x, right x, lowest point].
const FRONT_TOES = [[55, 65.5, 414], [66, 77, 416.5], [77.5, 89, 418.5], [89.5, 101.5, 419.5], [102, 121, 421]];
const BACK_CONTOUR = [[126, 2], [131, 20], [139, 44], [146, 70], [149, 96], [147, 120], [143, 150], [139, 185], [134, 220],
  [129, 250], [126, 270], [126, 286], [123, 300], [118, 316], [115, 334], [112, 352], [108, 370], [106, 384], [110, 394],
  [108, 404], [103, 412], [92, 418.5], [80, 420], [68, 418.5], [57, 412], [52, 404], [50, 394], [54, 384], [52, 370],
  [47, 350], [42, 330], [40, 312], [42, 299], [39, 287], [36, 272], [33, 250], [27, 220], [20, 185], [14, 152], [9, 126],
  [5, 110], [2, 102]];
// Sole of the right foot, toes at the top, medial (big toe) on the viewer's right. Toes lateral to medial: [xl, xr, tip].
const SOLE_TOES = [[19.5, 32, 46], [32, 44.5, 36], [44.5, 57.5, 28], [57.5, 71.5, 22], [71.5, 100.5, 9]];
const SOLE_CLEFTS = [55, 48, 43, 41];
const SOLE_LAT = [[60, 197], [44, 193], [36, 181], [32, 160], [27, 135], [21, 110], [18, 88], [18, 72], [19, 64]];
const SOLE_MED = [[100, 23], [103, 34], [105, 48], [106, 62], [104, 84], [99, 104], [96, 125], [95, 145], [92, 165], [86, 183], [75, 194], [60, 197]];
// The top of the foot is drawn from the same toes, mirrored (medial on the viewer's left), with the ankle at the bottom.
const DORSUM_LAT = [[24, 200], [22, 192], [18, 184], [23, 170], [26, 152], [24, 132], [20, 110], [17, 88], [18, 72], [19, 64]];
const DORSUM_MED = [[100, 23], [103, 34], [105, 48], [106, 62], [104, 84], [100, 108], [98, 130], [98, 150], [100, 166], [104, 176], [100, 188], [96, 200]];
const m120 = (x) => 120 - x;
const footPath = (lat, med, fx, closed) => {
  const L = lat.map(([x, y]) => [fx(x), y]), M = med.map(([x, y]) => [fx(x), y]);
  return `M${L[0].join(' ')}${smoothOn(L)}${toeRow(SOLE_TOES, -1, SOLE_CLEFTS, fx)} L${M[0].join(' ')}${smoothOn(M)}${closed ? 'Z' : ''}`;
};
const FRONT_PATH = `M34 2${smoothOn(FRONT_LEG_LAT)}${toeRow(FRONT_TOES, 1, [415, 417, 418, 419])} L${FRONT_LEG_MED[0].join(' ')}${smoothOn(FRONT_LEG_MED)}`;

export const OUTLINE = {
  front: { contour: FRONT_PATH, fill: `${FRONT_PATH} L158 2 Z` },
  back: { contour: smooth(BACK_CONTOUR, false), fill: `${smooth(BACK_CONTOUR, false)} L2 2 Z` },
  sole: { contour: footPath(SOLE_LAT, SOLE_MED, (x) => x, true), fill: footPath(SOLE_LAT, SOLE_MED, (x) => x, true) },
  dorsum: { contour: footPath(DORSUM_LAT, DORSUM_MED, m120, false), fill: `${footPath(DORSUM_LAT, DORSUM_MED, m120, false)} Z` },
};
const VB = { front: [0, 0, 160, 420], back: [0, 0, 160, 420], sole: [0, 0, 120, 200], dorsum: [0, 0, 120, 200] };
const VIEW_NAMES = { front: 'Front', back: 'Back', sole: 'Sole', dorsum: 'Top of the foot' };
const VIEW_ORDER = ['front', 'back', 'sole', 'dorsum'];
// Where "Lat" and "Med" sit (bottom corners, clear of the outline).
const SIDES = {
  front: [['Lat', 4, 372, 'start'], ['Med', 156, 372, 'end']],
  back: [['Med', 4, 372, 'start'], ['Lat', 156, 372, 'end']],
  sole: [['Lat', 9, 150, 'middle', -90], ['Med', 111, 150, 'middle', 90]],
  dorsum: [['Med', 9, 150, 'middle', -90], ['Lat', 111, 150, 'middle', 90]],
};

// ---------------------------------------------------------------- landmarks
export const LANDMARKS = {
  front: {
    'iliac-crest': [40, 10], asis: [38, 40], aiis: [50, 58], 'inguinal-crease-mid': [92, 70], 'inguinal-ligament-lat': [62, 58],
    'pubic-tubercle': [140, 72], 'greater-trochanter': [22, 100], 'femoral-triangle-apex': [110, 150],
    'mid-thigh-medial': [112, 190], 'distal-thigh-medial': [112, 230], 'adductor-hiatus': [110, 245], patella: [78, 282],
    'knee-medial': [112, 285], 'knee-lateral': [42, 285], 'tibial-tuberosity': [82, 312], 'fibular-head': [42, 305],
    'mid-calf-anterior': [80, 345], 'mid-calf-lateral': [52, 350], 'ankle-anterior': [80, 392], 'medial-malleolus': [104, 392],
    'lateral-malleolus': [56, 396], 'dorsum-foot': [80, 408],
  },
  back: {
    'iliac-crest': [118, 10], buttock: [96, 60], 'ischial-tuberosity': [52, 105], 'greater-trochanter': [140, 95],
    'gluteal-fold': [84, 118], subgluteal: [92, 130], 'mid-thigh-posterior': [86, 190], 'popliteal-apex': [84, 250],
    'popliteal-crease': [82, 282], 'fibular-head': [118, 300], 'mid-calf-posterior': [80, 330], achilles: [82, 385],
    'medial-malleolus': [56, 392], 'lateral-malleolus': [106, 394], heel: [80, 412],
  },
  sole: { heel: [60, 185], 'medial-arch': [86, 120], 'lateral-border': [24, 120], ball: [60, 60], toes: [60, 20] },
  dorsum: {
    'ankle-anterior': [60, 190], 'medial-malleolus': [20, 180], 'lateral-malleolus': [99, 186], 'first-web': [46, 46],
    'dorsalis-pedis': [50, 128], 'mid-dorsum': [62, 110], 'lateral-border': [97, 110], 'medial-border': [22, 110],
  },
};
const LANDMARK_NAMES = {
  'iliac-crest': 'Iliac crest', asis: 'ASIS', aiis: 'AIIS', 'inguinal-crease-mid': 'Femoral pulse', 'inguinal-ligament-lat': 'Inguinal ligament',
  'pubic-tubercle': 'Pubic tubercle', 'greater-trochanter': 'Greater trochanter', 'femoral-triangle-apex': 'Apex of the femoral triangle',
  'mid-thigh-medial': 'Mid-thigh', 'distal-thigh-medial': 'Distal thigh', 'adductor-hiatus': 'Adductor hiatus', patella: 'Patella',
  'knee-medial': 'Medial knee', 'knee-lateral': 'Lateral knee', 'tibial-tuberosity': 'Tibial tuberosity', 'fibular-head': 'Fibular head',
  'mid-calf-anterior': 'Mid-calf', 'mid-calf-lateral': 'Lateral calf', 'ankle-anterior': 'Front of the ankle',
  'medial-malleolus': 'Medial malleolus', 'lateral-malleolus': 'Lateral malleolus', 'dorsum-foot': 'Dorsum of the foot',
  buttock: 'Buttock', 'ischial-tuberosity': 'Ischial tuberosity', 'gluteal-fold': 'Gluteal fold', subgluteal: 'Subgluteal',
  'mid-thigh-posterior': 'Back of the thigh', 'popliteal-apex': 'Apex of the popliteal fossa', 'popliteal-crease': 'Popliteal crease',
  'mid-calf-posterior': 'Calf', achilles: 'Achilles tendon', heel: 'Heel', 'medial-arch': 'Medial arch', 'lateral-border': 'Lateral border',
  ball: 'Ball of the foot', toes: 'Toes', 'first-web': 'First web space', 'dorsalis-pedis': 'Dorsalis pedis pulse',
  'mid-dorsum': 'Dorsum', 'medial-border': 'Medial border',
};
const at = (view, a) => (Array.isArray(a) ? a : LANDMARKS[view]?.[a] || null);

const INK = '#8f8574';
const FAINT = '#cbbda6';
function landmarks(g, view) {
  const line = { fill: 'none', stroke: INK, 'stroke-width': 1, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const dash = { ...line, 'stroke-dasharray': '3 2.5' };
  const dot = { ...line, 'stroke-dasharray': '0.1 3', 'stroke-width': 1.4 };
  const form = { fill: 'none', stroke: FAINT, 'stroke-width': 0.9, 'stroke-linecap': 'round' };
  const pt = (x, y, r = 1.9) => sv('circle', { cx: x, cy: y, r, fill: INK }, g);
  if (view === 'front') {
    // muscle forms (very faint): rectus femoris, vastus medialis, tibialis anterior
    sv('path', { d: 'M62 96 Q66 180 74 262 M104 214 Q124 238 112 270 Q100 276 92 270 M60 316 Q62 350 76 384', ...form }, g);
    sv('path', { d: 'M158 4 V100', ...dot }, g);                                                   // midline
    sv('path', { d: 'M40 10 Q30 18 32 30 Q34 37 38 40', ...dash }, g);                            // iliac crest to ASIS
    sv('path', { d: 'M38 40 Q60 56 92 65 Q120 71 140 72', ...line }, g);                          // inguinal ligament
    sv('path', { d: 'M38 42 Q74 92 110 150 Q120 196 118 246 Q117 266 114 284', ...dash }, g);    // sartorius, medial border
    sv('path', { d: 'M140 74 Q126 110 110 150', ...dash }, g);                                    // adductor longus, medial border
    pt(38, 40); pt(140, 72);                                                                      // ASIS, pubic tubercle
    sv('ellipse', { cx: 78, cy: 282, rx: 10.5, ry: 13, ...line }, g);                             // patella
    sv('path', { d: 'M78 306 Q82 309 86 306', ...line }, g);                                      // tibial tuberosity
    sv('path', { d: 'M83 316 Q85 350 92 384', ...dot }, g);                                       // tibial crest
    pt(42, 305);                                                                                  // fibular head
    sv('path', { d: 'M107 386 Q111 392 107 398', ...line }, g);                                   // medial malleolus
    sv('path', { d: 'M53 389 Q49 396 53 403', ...line }, g);                                      // lateral malleolus
  } else if (view === 'back') {
    sv('path', { d: 'M76 100 Q66 150 68 250 M92 100 Q100 150 98 250 M58 300 Q60 340 72 372 M104 300 Q100 340 90 372', ...form }, g); // hamstrings, gastrocnemius heads
    sv('path', { d: 'M2 4 V100', ...dot }, g);                                                    // midline
    sv('path', { d: 'M2 40 Q5 80 4 106', ...line }, g);                                          // natal cleft
    sv('path', { d: 'M118 10 Q100 4 82 6 Q60 10 40 20', ...dash }, g);                            // iliac crest
    sv('path', { d: 'M6 110 Q40 124 84 120 Q112 116 128 104', ...line }, g);                      // gluteal fold
    pt(52, 105); pt(140, 95);                                                                     // ischial tuberosity, greater trochanter
    sv('path', { d: 'M84 250 L114 282 L82 316 L50 282 Z', ...dash }, g);                          // popliteal fossa
    sv('path', { d: 'M46 282 Q82 287 118 282', ...line }, g);                                     // popliteal crease
    pt(118, 300);                                                                                 // fibular head
    sv('path', { d: 'M76 352 Q78 380 74 404 M88 352 Q86 380 90 404', ...line }, g);               // Achilles tendon
    sv('path', { d: 'M53 387 Q49 394 53 401', ...line }, g);                                      // medial malleolus
    sv('path', { d: 'M107 389 Q111 396 107 403', ...line }, g);                                   // lateral malleolus
  } else if (view === 'sole') {
    sv('path', { d: 'M24 68 Q60 50 104 60', ...form }, g);                                        // metatarsal heads
    sv('path', { d: 'M38 164 Q60 152 86 162', ...form }, g);                                      // front of the heel pad
    sv('path', { d: 'M57 156 Q50 100 41 38', ...dash }, g);                                       // medial / lateral plantar divide
  } else if (view === 'dorsum') {
    sv('path', { d: 'M24 182 Q60 190 98 190', ...dash }, g);                                      // ankle joint line
    sv('path', { d: 'M18 172 Q14 180 18 188', ...line }, g);                                      // medial malleolus
    sv('path', { d: 'M100 178 Q104 186 100 194', ...line }, g);                                   // lateral malleolus
    sv('path', { d: 'M44 186 Q40 120 36 40', ...dot }, g);                                        // extensor hallucis longus tendon
    sv('path', { d: 'M18 66 Q22 62 26 66 M24 68 Q60 50 104 60', ...form }, g);                    // metatarsal heads
  }
}

// ---------------------------------------------------------------- zones
// Shared borders, so neighbouring territories meet without gaps or double shading.
const F_LFCN = [[50, 64], [54, 96], [58, 140], [60, 220], [58, 278], [56, 292]];  // front: LFCN | femoral anterior cutaneous
const F_CREST = [[84, 317], [86, 345], [89, 370], [94, 388]];                     // front: along the tibial crest
const B_SAPH = [[56, 318], [62, 350], [68, 380], [70, 398]];                      // back: saphenous | sural
const D_LAT = [[95, 56], [96, 64], [97, 80], [95, 100], [92, 130], [89, 160], [86, 200]]; // dorsum: SPN | sural
const D_MED = [[0, 116], [18, 120], [27, 132], [30, 150], [30, 170], [32, 200]];              // dorsum: saphenous | SPN (saphenous stops at the medial midfoot)
const D_TIPS = [[0, 21], [48.5, 21], [48.5, 32], [62.5, 32], [62.5, 38], [75.5, 38], [75.5, 46], [88, 46], [88, 56], [120, 56]]; // dorsum: toe tips
const S_LAT = [[25, 40], [24, 56], [23, 72], [26, 100], [29, 130], [32, 162], [34, 186], [40, 200]];          // sole: sural edge
const S_HEEL = [[32, 162], [60, 155], [120, 160]];                                                            // sole: heel pad
const rev = (a) => a.slice().reverse();

// Each zone: name and area (legend), and one polygon (or a list of polygons) per view. `lab` = label anchor per view.
export const ZONES = {
  // Cutaneous
  lfcn: { name: 'Lateral femoral cutaneous (L2–L3)', short: 'LFCN', area: 'the outer (lateral) thigh, from just below the anterior superior iliac spine to above the knee',
    front: [[20, 62], [44, 60], ...F_LFCN, [30, 294], [0, 250], [0, 70]],
    back: [[124, 104], [150, 96], [160, 140], [160, 240], [140, 252], [126, 250], [127, 200], [128, 140]],
    lab: { front: [33, 190], back: [141, 170] } },
  'femoral-ant': { name: 'Anterior cutaneous branches of the femoral nerve (intermediate and medial femoral cutaneous, L2–L3)', short: 'Femoral',
    area: 'the front and inner side of the thigh, down to the knee',
    front: [[54, 96], [68, 96], [90, 104], [116, 98], [120, 108], [128, 124], [146, 128], [160, 134], [160, 162], [124, 166], [120, 215],
      [122, 262], [160, 262], [160, 280], [118, 284], [96, 292], [80, 298], [64, 296], ...rev(F_LFCN).slice(0, 5)],
    back: [[[0, 118], [10, 116], [22, 140], [28, 160], [4, 165], [0, 160]], [[0, 264], [36, 262], [40, 284], [0, 286]]],
    lab: { front: [90, 200] } },
  genitofemoral: { name: 'Genitofemoral, femoral branch (L1–L2)', short: 'GF', area: 'a small area of skin over the femoral triangle, just below the inguinal ligament',
    front: [[64, 60], [92, 68.5], [116, 73], [116, 98], [90, 104], [68, 96], [52, 72]],
    lab: { front: [91, 88] } },
  ilioinguinal: { name: 'Ilioinguinal (L1)', short: 'II', area: 'the upper inner thigh beside the genitals',
    front: [[116, 73], [141, 75], [160, 84], [160, 134], [146, 128], [128, 124], [120, 108], [116, 98]],
    lab: { front: [138, 104] } },
  obturator: { name: 'Obturator, cutaneous branch (L2–L4)', short: 'Obt', area: 'a variable patch of the lower inner thigh; small or absent in many people',
    front: [[124, 166], [160, 162], [160, 262], [122, 262], [120, 215]],
    back: [[0, 165], [28, 160], [32, 200], [36, 262], [0, 264]],
    lab: { front: [133, 214], back: [16, 214] } },
  pfcn: { name: 'Posterior femoral cutaneous (S1–S3)', short: 'PFCN', area: 'the back of the thigh, the popliteal fossa and the upper calf; the lower buttock (inferior cluneal branches)',
    back: [[10, 116], [40, 112], [84, 116], [128, 104], [128, 140], [127, 200], [126, 250], [124, 296], [116, 318], [84, 326], [56, 318],
      [44, 300], [40, 284], [36, 262], [32, 200], [28, 160], [22, 140]],
    lab: { back: [80, 190] } },
  'saphenous-knee': { name: 'Saphenous, infrapatellar branch (L3–L4)', short: 'Saph', area: 'the skin below and on the inner side of the kneecap',
    front: [[64, 296], [80, 298], [96, 292], [118, 284], [160, 280], [160, 318], [118, 315], [84, 317], [70, 312]],
    back: [[0, 286], [40, 284], [44, 300], [36, 312], [0, 312]],
    lab: { front: [102, 304] } },
  'saphenous-leg': { name: 'Saphenous (L3–L4)', short: 'Saph', area: 'the inner (medial) side of the leg',
    front: [...F_CREST.slice(0, 3), [96, 386], [160, 386], [160, 318], [118, 315]],
    back: [[0, 312], [36, 312], [44, 300], [56, 318], ...B_SAPH.slice(1, 3), [54, 386], [0, 386]],
    lab: { front: [104, 352], back: [46, 350] } },
  'saphenous-foot': { name: 'Saphenous, at the ankle', short: 'Saph', area: 'the medial malleolus and the inner side of the foot, usually ending at the medial midfoot (it reaches the big toe in only a few people)',
    front: [[89, 370], [96, 386], [160, 386], [160, 412], [116, 412], [110, 402], [102, 393], [94, 388]],
    back: [[0, 386], [54, 386], [68, 380], [70, 390], [64, 396], [56, 404], [0, 404]],
    dorsum: [...D_MED, [0, 200]],
    lab: { dorsum: [23, 140, -90] } },
  'lat-cut-calf': { name: 'Lateral sural cutaneous (lateral cutaneous nerve of the calf; common peroneal)', short: 'Lat sural', area: 'the outer side of the upper leg',
    front: [[0, 294], [30, 294], [56, 292], [64, 296], [70, 312], [84, 317], [86, 345], [60, 348], [40, 352], [0, 352]],
    back: [[116, 318], [124, 296], [160, 296], [160, 352], [108, 352]],
    lab: { front: [56, 326], back: [128, 330] } },
  'sup-peroneal-leg': { name: 'Superficial peroneal (superficial fibular), in the leg', short: 'SPN', area: 'the front and outer side of the lower leg',
    front: [[40, 352], [60, 348], [86, 345], [89, 370], [94, 388], [62, 390], [52, 386], [46, 368]],
    lab: { front: [70, 368] } },
  'sural-calf': { name: 'Sural (S1–S2), in the calf', short: 'Sural', area: 'the back and outer side of the lower calf',
    front: [[0, 352], [40, 352], [46, 368], [52, 386], [0, 386]],
    back: [[56, 318], [84, 326], [116, 318], [108, 352], [160, 352], [160, 390], [70, 390], [68, 380], [62, 350]],
    lab: { back: [92, 352] } },
  'sural-foot': { name: 'Sural, at the ankle', short: 'Sural', area: 'the lateral malleolus, the outer heel and the outer side of the foot to the little toe',
    front: [[0, 386], [52, 386], [62, 390], [60, 400], [56, 412], [56, 423], [0, 423]],
    back: [[88, 390], [160, 390], [160, 421], [94, 421], [96, 404]],
    sole: [[0, 40], ...S_LAT, [0, 200]],
    dorsum: [[120, 56], ...D_LAT, [120, 200]],
    lab: { dorsum: [97, 140, 90], sole: [22, 120, -90] } },
  'sup-peroneal': { name: 'Superficial peroneal (superficial fibular)', short: 'SPN', area: 'most of the top of the foot and toes, except the first web space',
    front: [[62, 390], [94, 388], [102, 393], [110, 402], [116, 412], [160, 412], [160, 423], [108, 423], [105, 410], [97, 410], [95, 423], [56, 423], [56, 412], [60, 400]],
    dorsum: [[0, 20], [41, 20], [41, 46], [45, 58], [52, 58], [55, 46], [54, 32], ...D_TIPS.slice(3, 9), ...D_LAT, ...rev(D_MED)],
    lab: { dorsum: [70, 110] } },
  'deep-peroneal': { name: 'Deep peroneal (deep fibular)', short: 'DPN', area: 'the first web space, between the big and second toes',
    front: [[97, 410], [105, 410], [108, 423], [95, 423]],
    dorsum: [[41, 20], [48.5, 20], [48.5, 32], [54, 32], [55, 46], [52, 58], [45, 58], [41, 46]],
    lab: { dorsum: [46, 54] } },
  'tibial-sole': { name: 'Medial and lateral plantar (tibial)', short: 'Plantar', area: 'the sole and the undersides of the toes, and the nail beds (medial plantar: the inner sole and 3½ toes; lateral plantar: the rest)',
    sole: [[25, 0], [120, 0], [120, 160], ...rev(S_HEEL).slice(1), ...rev(S_LAT).slice(3)],
    dorsum: [[0, 0], [120, 0], ...rev(D_TIPS)],
    lab: { sole: [68, 112] } },
  calcaneal: { name: 'Medial calcaneal branches (tibial)', short: 'Calc', area: 'the heel',
    sole: [...S_HEEL, [120, 200], [40, 200], [34, 186]],
    back: [[56, 404], [64, 396], [70, 390], [88, 390], [96, 404], [94, 421], [50, 421]],
    lab: { sole: [62, 182] } },
  cluneal: { name: 'Cluneal nerves (superior L1–L3, middle S1–S3; inferior from the posterior femoral cutaneous)', short: 'Cluneal', area: 'the buttock',
    back: [[0, 0], [130, 0], [138, 40], [148, 80], [128, 104], [84, 116], [40, 112], [10, 116], [0, 112]],
    lab: { back: [62, 60] } },
  // Deep structures (joint and bone glyphs)
  'hip-ant': { deep: true, name: 'Hip joint, anterior capsule', short: 'Hip', area: 'deep: articular branches of the femoral, obturator and (when present) accessory obturator nerves',
    front: 'capsule', lab: { front: [96, 120] } },
  'hip-post': { deep: true, name: 'Hip joint, posterior capsule', short: 'Hip', area: 'deep: nerve to quadratus femoris, sciatic and superior gluteal branches',
    back: 'capsule', lab: { back: [58, 68] } },
  'knee-ant': { deep: true, name: 'Knee joint, anterior and anteromedial capsule', short: 'Knee', area: 'deep: femoral branches (nerves to the vasti, saphenous), the common peroneal laterally and the obturator medially (variable)',
    front: 'knee', lab: { front: [134, 302] } },
  'knee-post': { deep: true, name: 'Knee joint, posterior capsule', short: 'Knee', area: 'deep: popliteal plexus (tibial nerve and the posterior obturator), with common peroneal branches',
    back: 'knee', lab: { back: [134, 266] } },
  femur: { deep: true, name: 'Femur', short: 'Femur', area: 'deep: femoral, sciatic and obturator branches (varies along the bone)',
    front: 'femur', back: 'femur', lab: { front: [96, 172], back: [62, 172] } },
  tibia: { deep: true, name: 'Tibia', short: 'Tibia', area: 'deep: mainly sciatic branches (tibial and deep peroneal)',
    front: 'tibia', back: 'tibia', lab: { front: [118, 332], back: [42, 332] } },
  'ankle-joint': { deep: true, name: 'Ankle joint', short: 'Ankle', area: 'deep: deep peroneal and tibial branches, with saphenous, superficial peroneal and sural contributions',
    front: 'ankle', back: 'ankle', dorsum: 'ankle', lab: { front: [24, 398], back: [136, 398], dorsum: [60, 172] } },
  'foot-bones': { deep: true, name: 'Bones and joints of the foot', short: 'Foot', area: 'deep: tibial (plantar nerves) and deep peroneal',
    front: 'foot', sole: 'foot', dorsum: 'foot', lab: { front: [134, 392], sole: [62, 104], dorsum: [64, 96] } },
};
// Composite zones (painted from their parts) and groups (shorthand in `zones`).
const PARTS = { sural: ['sural-calf', 'sural-foot'] };
ZONES.sural = { name: 'Sural (S1–S2)', short: 'Sural', area: 'the back and outer side of the lower calf, the lateral malleolus, the outer heel and the outer side of the foot to the little toe' };
export const GROUPS = {
  saphenous: ['saphenous-knee', 'saphenous-leg', 'saphenous-foot'],
  femoral: ['femoral-ant', 'saphenous-knee', 'saphenous-leg', 'saphenous-foot'],
  'sciatic-below-knee': ['lat-cut-calf', 'sup-peroneal-leg', 'sural', 'sup-peroneal', 'deep-peroneal', 'tibial-sole', 'calcaneal'],
  ankle: ['saphenous-foot', 'sural-foot', 'sup-peroneal', 'deep-peroneal', 'tibial-sole', 'calcaneal'],
};
const GROUP_INFO = {
  saphenous: { name: 'Saphenous (L3–L4)', area: 'the skin below and inside the kneecap, the inner side of the leg, the medial malleolus and the inner side of the foot' },
};
// Deep glyph shapes in each view's coordinates. Hip: femoral head under the mid-inguinal point, neck to the trochanter.
const HIP_CAPSULE = [[80, 74], [90, 79], [92, 90], [84, 98], [66, 104], [48, 110], [38, 106], [40, 96], [56, 90], [70, 80]];
const DEEP = {
  front: {
    capsule: () => smooth(HIP_CAPSULE),
    femur: () => smooth([[42, 108], [50, 106], [66, 180], [80, 262], [72, 266], [58, 182]]),
    knee: () => smooth([[56, 272], [80, 266], [108, 272], [116, 288], [106, 302], [80, 304], [60, 300], [52, 288]]),
    tibia: () => smooth([[78, 310], [92, 310], [94, 350], [98, 384], [88, 386], [82, 350]]),
    ankle: () => smooth([[60, 388], [80, 385], [102, 388], [100, 396], [80, 398], [62, 397]]),
    foot: () => smooth([[60, 401], [80, 399], [104, 402], [110, 412], [80, 415], [56, 413]]),
  },
  back: {
    capsule: () => smooth(HIP_CAPSULE.map(([x, y]) => [160 - x, y])),
    femur: () => smooth([[118, 108], [110, 106], [94, 180], [80, 262], [88, 266], [102, 182]]),
    knee: () => smooth([[52, 276], [82, 270], [110, 276], [114, 290], [82, 296], [50, 290]]),
    tibia: () => smooth([[82, 310], [68, 310], [66, 350], [62, 384], [72, 386], [78, 350]]),
    ankle: () => smooth([[58, 388], [80, 386], [102, 388], [100, 396], [80, 398], [60, 396]]),
  },
  sole: { foot: () => smooth([[30, 70], [62, 60], [100, 66], [96, 110], [90, 150], [60, 152], [36, 156], [30, 110]]) },
  dorsum: {
    foot: () => smooth([[20, 66], [58, 60], [92, 70], [92, 110], [88, 150], [60, 160], [30, 156], [26, 110]]),
    ankle: () => smooth([[26, 178], [60, 182], [96, 182], [96, 192], [60, 194], [26, 190]]),
  },
};

const leaves = (z) => (PARTS[z] ? PARTS[z] : [z]);
const expandNames = (zones) => [...new Set((zones || []).flatMap((z) => GROUPS[z] || [z]))];
const expandLeaves = (zones) => [...new Set(expandNames(zones).flatMap(leaves))];
const zoneShapes = (z, view) => {
  const s = ZONES[z]?.[view]; if (!s) return [];
  if (typeof s === 'string') return [{ deep: true, d: DEEP[view][s]() }];
  const list = Array.isArray(s[0][0]) ? s : [s];
  return list.map((p) => ({ d: poly(p) }));
};
// `views` on every zone: the views it appears in.
for (const [k, z] of Object.entries(ZONES)) z.views = VIEW_ORDER.filter((v) => leaves(k).some((p) => ZONES[p]?.[v]));
export const VIEWS = VIEW_ORDER;

// Distinct muted tints for atlas-style figures (`tint: true`), with labels. Not used for density.
const TINT = {
  lfcn: '#d9c7a0', 'femoral-ant': '#c9d6b4', genitofemoral: '#e3c7c0', ilioinguinal: '#d8cbe0', obturator: '#b9cfd6', pfcn: '#d6c0d8',
  'saphenous-knee': '#a9cbb8', 'saphenous-leg': '#a9cbb8', 'saphenous-foot': '#a9cbb8', 'lat-cut-calf': '#e0bfa4', 'sup-peroneal-leg': '#c7c2e3',
  'sural-calf': '#e4d29e', 'sural-foot': '#e4d29e', 'sup-peroneal': '#c7c2e3', 'deep-peroneal': '#e4a9a0', 'tibial-sole': '#b8c6e4', calcaneal: '#d9b8a3',
  cluneal: '#ddd3bd',
};

// ---------------------------------------------------------------- painting
let patSeq = 0;
function defs(svg) {
  patSeq += 1;
  const id = (n) => `lld-${n}-${patSeq}`;
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

/** Paint one view into `g`. opts: {areas:[{zones, density}], tint, labels, points, fills, sides} */
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
      const key = `${z}`; if (seen.has(key) && !opts.tint) continue; seen.add(key);
      for (const s of zoneShapes(z, view)) {
        if (s.deep) { deepDraw.push({ z, d: s.d, density: a.density }); continue; }
        const fill = opts.tint ? (TINT[z] || '#ddd') : (fills[a.density] || fills.moderate);
        sv('path', { d: s.d, fill, 'fill-opacity': !opts.tint && a.density === 'dense' ? 0.78 : 1, stroke: '#fbf9f4', 'stroke-width': 0.7, 'stroke-linejoin': 'round' }, zg);
      }
    }
  }
  landmarks(g, view);
  // Deep structures: density fill, ink cross-hatch, solid outline.
  deepDraw.forEach(({ d, density }) => {
    const dg = sv('g', { class: 'll-deep' }, g);
    sv('path', { d, fill: '#fbf9f4', stroke: 'none' }, dg);
    sv('path', { d, fill: fills[density] || fills.moderate, 'fill-opacity': density === 'dense' ? 0.78 : 1, stroke: 'none' }, dg);
    sv('path', { d, fill: fills.deep, stroke: '#183f63', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, dg);
  });
  sv('path', { d: OUTLINE[view].contour, fill: 'none', stroke: '#55534d', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, g);
  // "deep" tags
  if (opts.deepTags !== false) {
    const tagged = new Set();
    deepDraw.forEach(({ z }) => {
      if (tagged.has(z)) return; tagged.add(z);
      const p = ZONES[z].lab?.[view]; if (!p) return;
      text(g, p[0], p[1] + 5, opts.labels ? `${ZONES[z].short}, deep` : 'deep', { size: opts.tagSize || 18, fill: '#183f63', weight: 600, italic: true });
    });
  }
  if (opts.labels) {
    const lab = sv('g', { class: 'll-labels' }, g);
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
    // Sizes chosen so the labels stay at 12px or more where a coverage map is drawn narrowest (phones, three views).
    (SIDES[view] || []).forEach(([t, x, y, anchor, rot]) => text(sg, x, y, t, { size: opts.sideSize || (rot ? 17.5 : 18), anchor, rot, fill: '#6b655b', weight: 500 }));
  }
  (opts.points || []).forEach((pnt, i) => {
    const p = at(view, pnt.at || pnt); if (!p) return;
    const pg = sv('g', { class: 'll-pt' }, g);
    const n = pnt.n;
    sv('circle', { cx: p[0], cy: p[1], r: n ? 7.5 : (opts.pointR || 4), fill: '#633d3c', stroke: '#fffaf0', 'stroke-width': 1.5 }, pg);
    if (n) text(pg, p[0], p[1] + 4.2, String(n), { size: 11.5, fill: '#fffaf0', weight: 700, halo: false });
    if (pnt.line) sv('path', { d: smooth(pnt.line.map((q) => at(view, q)), false), fill: 'none', stroke: '#633d3c', 'stroke-width': 2.2, 'stroke-dasharray': '5 3', 'stroke-linecap': 'round' }, pg);
    if (pnt.label && opts.pointLabels) {
      const q = pnt.lab || [p[0] + 9, p[1]];
      text(pg, q[0], q[1] + 4.5, pnt.label, { size: 13, anchor: pnt.anchor || 'start', fill: '#272722' });
    }
    void i;
  });
}

function areasFrom(opts) {
  if (opts.areas) return opts.areas;
  if (opts.zones) return [{ zones: opts.zones, density: opts.density || 'dense' }];
  return [];
}

/**
 * legFigure(view, {zones, density = 'dense', areas?, points?: [{at, n?, label?, lab?, line?}], labels?: true | [landmark name |
 *   {at, text, lab?, anchor?}], tint?: true, label?}) -> <svg class="ll-fig-svg">.
 * labels: true writes each zone's short name on it; an array also labels landmarks. tint: true colours each nerve territory
 * differently (an atlas-style map; say which is which in the text or with labels).
 */
export function legFigure(view = 'front', opts = {}) {
  const [x, y, w, h] = VB[view] || VB.front;
  const svg = sv('svg', { viewBox: `${x} ${y} ${w} ${h}`, class: `ll-fig-svg ll-fig-svg--${view}`, role: 'img', 'aria-label': opts.label || `${VIEW_NAMES[view]} of the right lower limb` });
  const fills = defs(svg);
  paintView(svg, view, { ...opts, areas: areasFrom(opts), fills, pointLabels: true });
  return svg;
}

/**
 * legCoverageMap(coverage, {id, title}) -> <figure class="tb-cov ll-cov">. Use as `coverage.map` in a block.
 * coverage = {views?: ['front','back','sole','dorsum'], areas: [{zones, density}], summary}. Views default to those that show any
 * shaded zone. The foot views stack in one column beside the leg views.
 */
export function legCoverageMap(cov, { id, title } = {}) {
  const used = expandLeaves((cov.areas || []).flatMap((a) => a.zones));
  const views = (cov.views || VIEW_ORDER.filter((v) => used.some((z) => ZONES[z]?.[v]))).filter((v) => VB[v]);
  const fig = el('figure', { class: 'tb-cov ll-cov', id });
  const legViews = views.filter((v) => v === 'front' || v === 'back');
  const footViews = views.filter((v) => v === 'sole' || v === 'dorsum');
  const cols = [...legViews.map(() => '160fr'), ...(footViews.length ? ['120fr'] : [])];
  const grid = el('div', { class: `ll-cov-views ll-cov-views--${cols.length}`, style: `grid-template-columns:${cols.join(' ')}` });
  const one = (v) => {
    const [x, y, w, h] = VB[v];
    const svg = sv('svg', { viewBox: `${x} ${y} ${w} ${h}`, class: 'll-cov-svg', 'aria-hidden': 'true' });
    paintView(svg, v, { areas: cov.areas, fills: defs(svg) });
    return el('div', { class: 'll-cov-view' }, svg, el('p', { class: 'll-cov-vname', text: VIEW_NAMES[v] }));
  };
  legViews.forEach((v) => grid.append(one(v)));
  if (footViews.length) grid.append(el('div', { class: 'll-cov-foot' }, ...footViews.map(one)));
  const words = (cov.areas || []).map((a) => `${expandNames(a.zones).map((z) => ZONES[z]?.name || z).join(', ')}: ${DENSITY[a.density]?.label || a.density}`).join('. ');
  fig.append(el('div', { class: 'tb-cov-stage', role: 'img', 'aria-label': `Coverage map${title ? ` for ${title}` : ''}, right lower limb. ${cov.summary || ''} ${words}.` }, grid));
  const legend = el('ul', { class: 'tb-cov-legend', 'aria-label': 'Key' });
  const dens = new Set((cov.areas || []).map((a) => a.density));
  for (const k of ['dense', 'moderate', 'patchy']) {
    if (!dens.has(k)) continue;
    legend.append(el('li', {}, el('span', { class: `tb-cov-sw tb-cov-sw--${k}`, 'aria-hidden': 'true' }), el('span', { text: `${DENSITY[k].label}: ${DENSITY[k].text}` })));
  }
  if (used.some((z) => ZONES[z]?.deep)) legend.append(el('li', {}, el('span', { class: 'tb-cov-sw ll-cov-sw--deep', 'aria-hidden': 'true' }), el('span', { text: 'Outlined, cross-hatched shapes marked “deep”: joint or bone, not skin' })));
  legend.append(el('li', { class: 'tb-cov-note', text: 'The right lower limb. Areas are schematic: nerve territories vary and overlap.' }));
  const zl = el('ul', { class: 'll-cov-zones', 'aria-label': 'Nerves and areas' });
  const names = [];
  (cov.areas || []).forEach((a) => (a.zones || []).forEach((z) => {
    if (GROUP_INFO[z]) { if (!names.includes(z)) names.push(z); return; }
    (GROUPS[z] || [z]).forEach((m) => { if (!names.includes(m)) names.push(m); });
  }));
  names.forEach((z) => { const info = GROUP_INFO[z] || ZONES[z]; if (info) zl.append(el('li', {}, el('strong', { text: info.name }), `: ${info.area}`)); });
  fig.append(el('figcaption', {}, legend, zl));
  return fig;
}

/**
 * Small limb view with the probe drawn on it, or the needle entry points of a landmark block.
 * probe = {view, at: landmark name | [x, y], angle (0 = across the limb, 90 = along it), label, marker?, needle?: [dx, dy],
 *          points?: [{at, label, view?}]}. Also accepts {x, y} like the truncal inset. The view is cropped around the probe.
 */
export function legProbeInset(probe = {}, opts = {}) {
  const view0 = VB[probe.view] ? probe.view : 'front';
  const pos = probe.at != null ? at(view0, probe.at) : (probe.x != null ? [probe.x, probe.y] : null);
  const pts = (probe.points || []).map((p) => {
    const v = VB[p.view] ? p.view : view0;
    return { view: v, xy: at(v, Array.isArray(p) ? p : p.at), label: p.label };
  }).filter((p) => p.xy);
  const byView = new Map();
  if (pos || !pts.length) byView.set(view0, []);
  pts.forEach((p) => { if (!byView.has(p.view)) byView.set(p.view, []); byView.get(p.view).push(p); });
  // Crop each view around what it shows.
  const multi = byView.size > 1;
  const panels = [...byView.entries()].map(([v, list]) => {
    const [, , w, h] = VB[v];
    const xy = [...list.map((p) => p.xy), ...(v === view0 && pos ? [pos] : [])];
    if (h <= 200 && !multi) return { v, list, box: [0, 0, w, h] };
    const ys = xy.map((p) => p[1]), xs = xy.map((p) => p[0]);
    const lo = ys.length ? Math.min(...ys) : h / 2, hi = ys.length ? Math.max(...ys) : h / 2;
    const H = Math.min(h, Math.max(multi ? 110 : 200, hi - lo + (multi ? 50 : 90)));
    const top = Math.max(0, Math.min(h - H, (lo + hi) / 2 - H / 2));
    if (!multi) return { v, list, box: [0, top, w, H] };
    const xl = Math.min(...xs), xr = Math.max(...xs);
    const Wd = Math.min(w, Math.max(80, xr - xl + 40));
    const left = Math.max(0, Math.min(w - Wd, (xl + xr) / 2 - Wd / 2));
    return { v, list, box: [left, top, Wd, H] };
  });
  const gap = 10;
  const W = panels.reduce((s, p) => s + p.box[2], 0) + gap * (panels.length - 1);
  const H = Math.max(...panels.map((p) => p.box[3]));
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tb-probe-svg ll-probe-svg', role: 'img',
    'aria-label': `${pts.length ? 'Needle entry' : 'Probe position'}: ${probe.label || pts.map((p) => p.label).filter(Boolean).join(', ')}` });
  const fills = defs(svg);
  let ox = 0;
  panels.forEach(({ v, list, box }) => {
    const inner = sv('svg', { x: ox, y: 0, width: box[2], height: box[3], viewBox: box.join(' '), overflow: 'hidden' }, svg);
    paintView(inner, v, { fills, sides: false, deepTags: false });
    // Lat / Med at the top corners of the crop, in large type. The inset is drawn 80–96 px wide, so a 160-unit leg
    // view is scaled by 0.5–0.6: 25 units keeps the letters at 12.5 px or more on phones.
    const s = SIDES[v];
    if (s && !multi) {
      const tg = sv('g', {}, inner);
      const k = 25;
      // A wider halo than the default: at this size the outline would otherwise show through the letters.
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

/**
 * legViewsFigure({id, title, views: [{view, zones?, density?, areas?, points?, labels?, tint?, caption?}], key?: [HTML], caption?: HTML})
 * -> <figure class="ll-fig">: views side by side (points numbered with `n` match the numbered key), for anatomy chapters.
 */
export function legViewsFigure({ id, title, views = [], key = [], caption, label } = {}) {
  const fig = el('figure', { class: 'll-fig', id });
  if (title) fig.append(el('p', { class: 'll-fig-title', text: title }));
  const cols = views.map((v) => `${VB[v.view]?.[2] || 160}fr`).join(' ');
  const stage = el('div', { class: `ll-fig-stage ll-fig-stage--${views.length}`, style: `--ll-cols:${cols}`, role: 'img', 'aria-label': label || title || 'Diagram' });
  views.forEach((v) => {
    const svg = legFigure(v.view, v);
    svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('role');
    stage.append(el('figure', {}, svg, el('figcaption', { text: v.caption || VIEW_NAMES[v.view] })));
  });
  fig.append(stage);
  const cap = el('figcaption', {});
  if (key.length) { const ol = el('ol', { class: 'll-key' }); key.forEach((k) => { const li = el('li'); li.insertAdjacentHTML('beforeend', `<span>${k}</span>`); ol.append(li); }); cap.append(ol); }
  if (caption) cap.insertAdjacentHTML('beforeend', `<p>${caption}</p>`);
  if (cap.childNodes.length) fig.append(cap);
  return fig;
}
