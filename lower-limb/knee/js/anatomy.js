// Knee page: anatomy chapter (the femoral nerve's branches down the thigh, the four quadrants of the anterior capsule,
// the popliteal plexus at the back, and the skin). Original schematic drawings (SVG), not traced from any published figure.
// Clinical colours: nerves yellow, arteries red, veins blue, local anaesthetic blue.
import { el, sv, fill, keyPoints, callout, table, registerSearch } from '../../../shared/regional/js/ui.js';
import { legViewsFigure } from '../../../shared/regional/js/figures/leg.js';

const NERVE = '#e2b21c', NERVE_EDGE = '#7a5c00', ART = '#c0392b', VEIN = '#2f5d9e', LA = '#2c74b3';
const INK = '#272722', MUTED = '#55534d', BONE = '#efe5cf', BONE_EDGE = '#9c8a64', MUSCLE = '#d8a796', MUSCLE_EDGE = '#a8695a';
const SANS = 'NTF Sans, Inter, sans-serif', MONO = 'NTF Mono, JetBrains Mono, monospace';

function nervePath(g, d, w = 3.2, dash, cls) {
  const a = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...(dash ? { 'stroke-dasharray': dash } : {}) };
  const grp = sv('g', cls ? { class: cls } : {}, g);
  sv('path', { d, stroke: NERVE_EDGE, 'stroke-width': w + 2, ...a }, grp);
  sv('path', { d, stroke: NERVE, 'stroke-width': w, ...a }, grp);
  return grp;
}
function vessel(g, d, col, w) { return sv('path', { d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); }
function marker(g, n, x, y, cls) {
  const m = sv('g', { class: `kn-mk${cls ? ` ${cls}` : ''}` }, g);
  sv('circle', { cx: x, cy: y, r: 11, fill: LA, stroke: '#fff', 'stroke-width': 2 }, m);
  sv('text', { x, y: y + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, fill: '#fff', 'font-family': SANS, text: String(n) }, m);
  return m;
}
function labels(svg, size = 14) {
  const t = sv('g', { 'font-family': SANS, 'font-size': size, fill: INK, stroke: '#fbf9f4', 'stroke-width': 3, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, svg);
  return (x, y, s, anchor = 'start', extra = {}) => sv('text', { x, y, 'text-anchor': anchor, text: s, ...extra }, t);
}
function sideTags(svg, left, right, y, w) {
  const k = sv('g', { 'font-family': MONO, 'font-size': 12.5, fill: MUTED }, svg);
  sv('text', { x: 10, y, text: left }, k); sv('text', { x: w - 10, y, 'text-anchor': 'end', text: right }, k);
}
function figure(id, title, svg, caption, legend) {
  const f = el('figure', { class: 'kn-fig', id });
  f.append(el('p', { class: 'kn-fig-title', text: title }), el('div', { class: 'kn-fig-stage' }, svg));
  if (legend) f.append(legend);
  if (caption) f.append(fill(el('figcaption'), caption));
  return f;
}
function legendList(items) {
  const ol = el('ol', { class: 'kn-legend' });
  items.forEach((h) => ol.append(fill(el('li'), h)));
  return ol;
}

// ------------------------------------------------------------------ figure 1: down the thigh
// Front view of the right thigh: lateral on the viewer's left, medial on the right.
function thighFigure() {
  const W = 360, H = 480;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kn-fig-svg', role: 'img', 'aria-labelledby': 'kn-th-t kn-th-d' });
  sv('title', { id: 'kn-th-t', text: 'From the groin to the knee: the femoral triangle, the adductor canal and the saphenous nerve, right thigh, front view' }, svg);
  sv('desc', { id: 'kn-th-d', text: 'Schematic front view of the right thigh, lateral on the left, medial on the right. Sartorius runs from the anterior superior iliac spine at the top left diagonally to the medial knee. Adductor longus runs from the pubis at the top right down and outwards. The femoral triangle is bounded by the inguinal ligament, the medial border of sartorius and the medial border of adductor longus; its apex is where those two borders meet. Below the apex, under sartorius, is the adductor canal, ending at the adductor hiatus where the femoral artery passes backwards. The saphenous nerve runs lateral to the artery in the triangle, crosses in front of it in the canal to its medial side, leaves the canal and runs to the medial knee, giving the infrapatellar branch. The nerve to vastus medialis runs lateral to the saphenous nerve into vastus medialis and on to the knee capsule. Numbered points: 1 femoral triangle block just above the apex, 2 adductor canal block, 3 the distal canal near the hiatus, where injectate can reach the popliteal fossa.' }, svg);
  const g = sv('g', {}, svg);
  // thigh outline and knee
  sv('path', { d: 'M24 26 C60 18 250 30 330 70 C336 160 318 300 300 420 C296 446 290 470 286 480 L92 480 C88 430 70 330 52 230 C40 160 26 90 24 26 Z', fill: '#f1e7d8', stroke: '#c9bea9', 'stroke-width': 1.4 }, g);
  // vastus medialis (lower medial thigh)
  sv('path', { d: 'M124 262 C170 270 212 300 236 352 C252 388 252 420 236 444 C204 452 168 446 142 430 C126 380 118 320 124 262 Z', fill: MUSCLE, stroke: MUSCLE_EDGE, opacity: 0.75 }, g);
  // adductor longus (from pubis down and out to the femur)
  sv('path', { d: 'M248 70 L312 80 C290 130 254 182 214 226 C200 248 190 272 182 300 L170 296 C176 260 190 220 206 190 C224 150 240 110 248 70 Z', fill: '#cf9a89', stroke: MUSCLE_EDGE, opacity: 0.9 }, g);
  // femoral triangle shading
  const ft = sv('path', { class: 'kn-ft', d: 'M86 44 L312 80 C290 130 254 182 214 226 L208 232 C170 170 128 104 86 44 Z', fill: 'rgba(44,116,179,.10)', stroke: 'none' }, g);
  void ft;
  // inguinal ligament
  sv('path', { d: 'M40 30 L314 80', stroke: '#6f6a3a', 'stroke-width': 2.2, 'stroke-dasharray': '7 4' }, g);
  // femoral vessels: artery (and vein medial to it in the triangle)
  vessel(g, 'M190 58 C196 110 206 170 220 226', VEIN, 7);
  vessel(g, 'M176 56 C182 110 194 170 206 224 C214 262 226 306 240 352', ART, 6);
  sv('path', { d: 'M240 352 C246 372 250 392 252 408', fill: 'none', stroke: ART, 'stroke-width': 5, 'stroke-dasharray': '4 4', opacity: 0.8 }, g);
  // sartorius (over the canal): ASIS to medial knee
  sv('path', { class: 'kn-sart', d: 'M30 24 L76 30 C130 110 190 190 240 262 C268 310 290 370 304 430 L270 440 C254 380 230 320 200 270 C150 200 90 120 30 24 Z', fill: MUSCLE, stroke: MUSCLE_EDGE, opacity: 0.62 }, g);
  // nerves
  nervePath(g, 'M160 56 C162 100 174 160 196 214 C206 238 214 250 226 262 C236 276 244 300 252 330 C262 366 278 400 290 430 C294 444 298 460 300 478', 2.6); // saphenous
  nervePath(g, 'M268 418 C252 432 228 444 196 452', 1.8); // infrapatellar branch
  nervePath(g, 'M156 58 C150 110 152 170 166 230 C172 260 178 290 186 330 C194 370 206 404 218 428', 2.4, null); // nerve to vastus medialis
  // patella
  sv('ellipse', { cx: 160, cy: 456, rx: 26, ry: 20, fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.4 }, g);
  // apex and hiatus markers
  sv('circle', { cx: 210, cy: 228, r: 4.5, fill: '#fffaf0', stroke: '#633d3c', 'stroke-width': 2 }, g);
  sv('circle', { cx: 242, cy: 356, r: 4.5, fill: '#fffaf0', stroke: '#633d3c', 'stroke-width': 2 }, g);
  marker(g, 1, 192, 196); marker(g, 2, 222, 296); marker(g, 3, 266, 352);
  const lab = labels(svg);
  lab(48, 20, 'ASIS'); lab(346, 60, 'Pubic tubercle', 'end', { 'font-size': 13 });
  lab(106, 166, 'Sartorius', 'end', { fill: '#7a3a2c' });
  lab(300, 150, 'Adductor', 'end', { 'font-size': 13, fill: '#7a3a2c' }); lab(300, 166, 'longus', 'end', { 'font-size': 13, fill: '#7a3a2c' });
  lab(232, 100, 'Femoral', 'middle', { fill: '#1d4f7c', 'font-style': 'italic' }); lab(232, 116, 'triangle', 'middle', { fill: '#1d4f7c', 'font-style': 'italic' });
  lab(226, 232, 'Apex', 'start', { 'font-weight': 600 });
  lab(254, 268, 'Adductor', 'start', { 'font-size': 13, fill: '#1d4f7c', 'font-style': 'italic' }); lab(254, 284, 'canal', 'start', { 'font-size': 13, fill: '#1d4f7c', 'font-style': 'italic' });
  lab(252, 382, 'Hiatus', 'start', { 'font-size': 13, 'font-weight': 600 });
  lab(132, 320, 'Vastus', 'start', { 'font-size': 13, fill: '#7a3a2c' }); lab(132, 336, 'medialis', 'start', { 'font-size': 13, fill: '#7a3a2c' });
  lab(10, 286, 'N. to vastus', 'start', { 'font-size': 13, 'font-weight': 600 }); lab(10, 302, 'medialis', 'start', { 'font-size': 13, 'font-weight': 600 });
  // leader from the label to the nerve to vastus medialis
  sv('path', { d: 'M68 297 L176 286', stroke: MUTED, 'stroke-width': 1.1, fill: 'none' }, svg);
  sv('circle', { cx: 177.6, cy: 285.8, r: 2.6, fill: INK }, svg);
  lab(196, 471, 'Infrapatellar', 'start', { 'font-size': 12.5 });
  lab(136, 70, 'Saphenous n.', 'end', { 'font-size': 13, 'font-weight': 600 });
  // leader to the saphenous nerve where it has separated from the nerve to vastus medialis
  sv('path', { d: 'M126 76 L167 124', stroke: MUTED, 'stroke-width': 1.1, fill: 'none' }, svg);
  sv('circle', { cx: 168, cy: 125.5, r: 2.6, fill: INK }, svg);
  lab(176, 44, 'FA', 'middle', { 'font-size': 12.5, fill: ART }); lab(198, 44, 'FV', 'middle', { 'font-size': 12.5, fill: VEIN });
  lab(160, 461, 'Patella', 'middle', { 'font-size': 12.5, fill: MUTED });
  sideTags(svg, 'LATERAL', 'MEDIAL', H - 8, W);
  return svg;
}

// ------------------------------------------------------------------ figure 2: the anterior capsule in four quadrants
function frontKneeFigure() {
  const W = 360, H = 400;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kn-fig-svg', role: 'img', 'aria-labelledby': 'kn-fk-t kn-fk-d' });
  sv('title', { id: 'kn-fk-t', text: 'Nerves of the anterior knee capsule in four quadrants, right knee, front view' }, svg);
  sv('desc', { id: 'kn-fk-d', text: 'Front view of the right knee, lateral on the left, medial on the right. The capsule is divided into four quadrants by the midline and the joint line. Superomedial: nerve to vastus medialis, nerve to vastus intermedius and the superomedial genicular nerve, which runs on the bone at the junction of the femoral shaft and medial condyle with its artery. Superolateral: nerve to vastus lateralis, nerve to vastus intermedius, the superolateral genicular nerve and common peroneal branches. Inferolateral: the inferolateral genicular nerve above the fibular head and the recurrent peroneal nerve below the lateral tibial condyle. Inferomedial: the inferomedial genicular nerve on the tibia deep to the medial collateral ligament, and sometimes the infrapatellar branch of the saphenous nerve. Blue numbered points are genicular block targets: 1 superomedial, 2 superolateral, 3 inferomedial, 4 nerve to vastus intermedius, 5 recurrent peroneal.' }, svg);
  const g = sv('g', {}, svg);
  // bones: femur flaring into condyles, tibia, fibula
  sv('path', { d: 'M140 0 L220 0 L222 110 C236 130 262 140 266 170 C268 188 258 200 244 204 L116 204 C102 200 92 188 94 170 C98 140 124 130 138 110 Z', fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.5 }, g);
  sv('path', { d: 'M110 216 L250 216 C262 222 266 236 254 250 C238 264 226 272 222 290 L220 400 L148 400 L146 290 C142 270 120 262 106 250 C96 238 98 222 110 216 Z', fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.5 }, g);
  sv('path', { d: 'M82 250 C92 240 108 244 110 258 C110 270 100 276 96 290 L96 400 L80 400 L80 290 C74 276 74 260 82 250 Z', fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.3 }, g);
  // patella and patellar tendon
  sv('ellipse', { cx: 180, cy: 150, rx: 30, ry: 36, fill: '#f7f0e2', stroke: BONE_EDGE, 'stroke-width': 1.5 }, g);
  sv('path', { d: 'M168 184 L164 262 L196 262 L192 184 Z', fill: '#e8dcc0', stroke: BONE_EDGE, 'stroke-width': 1 }, g);
  // quadrant guides
  sv('path', { d: 'M180 20 L180 300 M50 210 L310 210', stroke: '#633d3c', 'stroke-width': 1.4, 'stroke-dasharray': '6 5', fill: 'none' }, g);
  // MCL (medial, right) as a band
  sv('path', { d: 'M262 150 C270 190 268 230 252 290', stroke: '#b9a684', 'stroke-width': 9, fill: 'none', opacity: 0.7, 'stroke-linecap': 'round' }, g);
  // genicular arteries on bone
  vessel(g, 'M300 108 C280 112 252 118 226 116', ART, 2.2);
  vessel(g, 'M60 108 C80 112 108 118 134 116', ART, 2.2);
  vessel(g, 'M300 286 C282 276 266 266 246 258', ART, 2.2);
  // nerves
  nervePath(g, 'M310 92 C290 100 256 110 228 114', 2.2); // SMGN
  nervePath(g, 'M50 92 C70 100 104 110 132 114', 2.2); // SLGN
  nervePath(g, 'M312 300 C292 290 270 276 248 262', 2.2); // IMGN
  nervePath(g, 'M56 206 C72 204 92 202 108 204', 2.2); // ILGN (above the fibular head)
  nervePath(g, 'M84 296 C100 288 120 278 138 268', 2.2); // recurrent peroneal
  nervePath(g, 'M262 30 C256 52 244 80 226 100', 2.4); // NVM
  nervePath(g, 'M180 4 C180 40 180 70 180 104', 2.2, '5 3'); // NVI (deep, in the midline)
  nervePath(g, 'M100 30 C106 54 118 80 136 100', 2.4); // NVL
  nervePath(g, 'M340 214 C300 226 250 240 206 246', 1.8, '3 3'); // infrapatellar branch (mostly skin)
  // block targets
  marker(g, 1, 232, 132); marker(g, 2, 128, 132); marker(g, 3, 240, 280); marker(g, 4, 180, 96); marker(g, 5, 124, 292);
  // quadrant names
  const q = sv('g', { 'font-family': MONO, 'font-size': 12.5, fill: '#633d3c', 'font-weight': 600, stroke: '#fbf9f4', 'stroke-width': 3, 'paint-order': 'stroke' }, svg);
  sv('text', { x: 352, y: 20, 'text-anchor': 'end', text: 'SUPEROMEDIAL' }, q); sv('text', { x: 8, y: 20, text: 'SUPEROLATERAL' }, q);
  sv('text', { x: 352, y: 356, 'text-anchor': 'end', text: 'INFEROMEDIAL' }, q); sv('text', { x: 8, y: 356, text: 'INFEROLATERAL' }, q);
  const lab = labels(svg, 13);
  lab(300, 80, 'SMGN', 'start', { 'font-weight': 600 }); lab(8, 80, 'SLGN', 'start', { 'font-weight': 600 });
  lab(274, 60, 'NVM', 'start', { 'font-weight': 600 }); lab(88, 60, 'NVL', 'end', { 'font-weight': 600 }); lab(186, 70, 'NVI', 'start', { 'font-weight': 600 });
  lab(300, 318, 'IMGN', 'start', { 'font-weight': 600 }); lab(8, 196, 'ILGN', 'start', { 'font-weight': 600 }); lab(8, 312, 'Rec. peroneal', 'start', { 'font-weight': 600 });
  lab(352, 205, 'Infrapatellar', 'end', { 'font-size': 12.5 });
  lab(276, 178, 'MCL', 'start', { 'font-size': 12.5, fill: MUTED });
  lab(180, 156, 'Patella', 'middle', { 'font-size': 12.5, fill: MUTED });
  lab(102, 380, 'Fibula', 'start', { 'font-size': 12.5, fill: MUTED });
  sideTags(svg, 'LATERAL', 'MEDIAL', H - 8, W);
  return svg;
}

// ------------------------------------------------------------------ figure 3: the popliteal plexus (back of the knee)
// Back view of the right knee: medial on the viewer's left, lateral on the right.
function backKneeFigure() {
  const W = 360, H = 400;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kn-fig-svg', role: 'img', 'aria-labelledby': 'kn-bk-t kn-bk-d' });
  sv('title', { id: 'kn-bk-t', text: 'The popliteal plexus and the iPACK target, right knee, back view' }, svg);
  sv('desc', { id: 'kn-bk-d', text: 'Back view of the right knee, medial on the left, lateral on the right. The femur flares into the two condyles above the joint line. The popliteal artery runs down the middle on the back of the femur and capsule, with the popliteal vein beside and behind it and the tibial nerve most superficial. The common peroneal nerve leaves the tibial nerve high in the fossa and runs laterally along biceps femoris to the fibular neck. The genicular branch of the posterior division of the obturator nerve comes down with the artery through the adductor hiatus. Articular branches from the tibial nerve and the obturator branch form the popliteal plexus around the vessels on the posterior capsule. The iPACK target is the space between the artery and the back of the femur just above the condyles.' }, svg);
  const g = sv('g', {}, svg);
  // femur, condyles, tibia (back view)
  sv('path', { d: 'M136 0 L224 0 L226 140 C252 156 286 166 290 200 C292 222 280 236 262 238 L206 238 C196 228 186 222 180 222 C174 222 164 228 154 238 L98 238 C80 236 68 222 70 200 C74 166 108 156 134 140 Z', fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.5 }, g);
  sv('path', { d: 'M92 252 L268 252 C282 262 280 280 264 292 C246 304 232 312 226 330 L222 400 L140 400 L136 330 C130 312 112 302 98 292 C82 282 80 262 92 252 Z', fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.5 }, g);
  sv('path', { d: 'M262 286 C274 276 294 280 296 294 C296 306 288 312 284 326 L284 400 L268 400 L268 326 C262 312 256 298 262 286 Z', fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.3 }, g);
  // posterior capsule band
  sv('path', { d: 'M90 214 C130 206 230 206 270 214 L270 262 C230 256 130 256 90 262 Z', fill: 'rgba(122,92,0,.10)', stroke: '#9c8a64', 'stroke-dasharray': '4 3' }, g);
  // hamstrings at the sides
  sv('path', { d: 'M20 0 L96 0 C100 60 96 120 80 170 C70 200 58 220 44 236 L20 236 Z', fill: MUSCLE, stroke: MUSCLE_EDGE, opacity: 0.6 }, g);
  sv('path', { d: 'M264 0 L340 0 L340 250 C320 248 306 240 300 226 C292 180 276 110 264 0 Z', fill: MUSCLE, stroke: MUSCLE_EDGE, opacity: 0.6 }, g);
  // iPACK target zone (between the artery and the femur, just above the condyles)
  sv('ellipse', { class: 'kn-ipack-zone', cx: 182, cy: 158, rx: 52, ry: 18, fill: 'rgba(44,116,179,.30)', stroke: LA, 'stroke-width': 1.5 }, g);
  // vessels
  vessel(g, 'M168 0 C170 80 174 160 176 230 C178 290 180 340 182 400', ART, 7);
  vessel(g, 'M186 0 C188 80 192 160 194 230 C196 290 198 340 200 400', VEIN, 7);
  vessel(g, 'M176 226 C182 222 192 220 198 222', ART, 2); // middle genicular artery
  // nerves: sciatic dividing; tibial central, CPN lateral
  nervePath(g, 'M190 0 C196 40 202 80 204 120 C206 180 204 240 204 320 C204 360 204 380 204 400', 4.4); // tibial (superficial)
  nervePath(g, 'M198 30 C226 70 256 130 276 190 C284 220 288 250 290 300', 3.4); // CPN
  // posterior obturator genicular branch: down with the artery
  nervePath(g, 'M150 0 C156 60 162 120 168 180 C170 196 172 206 172 214', 2, '6 3');
  // popliteal plexus branches to the capsule
  nervePath(g, 'M204 150 C196 176 188 196 184 214', 1.6);
  nervePath(g, 'M204 196 C214 206 226 212 238 216', 1.6);
  nervePath(g, 'M204 200 C186 206 170 210 150 216', 1.6);
  nervePath(g, 'M282 220 C270 222 260 222 252 220', 1.6); // CPN articular (some people)
  const lab = labels(svg, 13);
  lab(28, 120, 'Semimem-', 'start', { fill: '#7a3a2c' }); lab(28, 136, 'branosus', 'start', { fill: '#7a3a2c' });
  lab(334, 90, 'Biceps', 'end', { fill: '#7a3a2c' }); lab(334, 106, 'femoris', 'end', { fill: '#7a3a2c' });
  lab(214, 46, 'Tibial n.', 'start', { 'font-weight': 600 });
  lab(298, 316, 'CPN', 'start', { 'font-weight': 600 });
  lab(110, 50, 'Posterior', 'end', { 'font-size': 12.5, 'font-weight': 600 }); lab(110, 65, 'obturator br.', 'end', { 'font-size': 12.5, 'font-weight': 600 });
  sv('path', { d: 'M112 58 L152 60', stroke: MUTED, 'stroke-width': 1, fill: 'none' }, svg);
  lab(160, 98, 'Popliteal a.', 'end', { 'font-size': 12.5, fill: ART });
  lab(118, 176, 'iPACK', 'end', { 'font-size': 14, 'font-weight': 600, fill: '#1d4f7c', 'font-style': 'italic' });
  lab(100, 286, 'Popliteal plexus', 'start', { 'font-size': 12.5 });
  sv('path', { d: 'M150 274 L176 234', stroke: MUTED, 'stroke-width': 1, fill: 'none' }, svg);
  lab(76, 206, 'Medial', 'middle', { 'font-size': 12.5, fill: MUTED }); lab(76, 221, 'condyle', 'middle', { 'font-size': 12.5, fill: MUTED });
  lab(284, 206, 'Lateral', 'middle', { 'font-size': 12.5, fill: MUTED }); lab(284, 221, 'condyle', 'middle', { 'font-size': 12.5, fill: MUTED });
  sideTags(svg, 'MEDIAL', 'LATERAL', H - 8, W);
  return svg;
}

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'kn-anat-h', text: 'Anatomy: who supplies the knee' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'The knee has no single nerve. The <strong>femoral</strong> nerve supplies the front, the <strong>sciatic</strong> (tibial and common peroneal) the back and sides, and the <strong>obturator</strong> the back and inner side. Every knee block is a choice of which of these to catch, and which muscles you can afford to weaken.'));
  sec.append(keyPoints([
    '<strong>Hilton’s law:</strong> the nerves to the muscles that cross the knee also supply the joint: femoral (quadriceps), sciatic (hamstrings, gastrocnemius) and obturator (adductors, gracilis).',
    '<strong>Front:</strong> the nerves to the three vasti, the saphenous nerve (infrapatellar branch) and the genicular nerves, in four quadrants.',
    '<strong>Back:</strong> the <strong>popliteal plexus</strong>, from the tibial nerve and the posterior division of the obturator nerve, around the popliteal vessels.',
    '<strong>Skin of a midline incision:</strong> intermediate and medial femoral cutaneous nerves (femoral) and the infrapatellar branch of the saphenous nerve.',
    'The <strong>motor-sparing problem:</strong> the nerves to the vasti that supply the joint also drive the quadriceps. Blocking them high weakens the leg; blocking low or at the joint spares it.',
  ]));

  // --- the thigh
  sec.append(el('h3', { id: 'kn-anat-thigh', text: 'Down the thigh: the femoral branches to the knee' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>The femoral nerve divides within a few centimetres of the inguinal ligament. The branches that matter for the knee run down the <strong>femoral triangle</strong> together with the femoral artery:</p>
<ul><li><strong>Saphenous nerve</strong> (L3–L4, sensory): lateral to the artery in the triangle, crosses <strong>in front of it from lateral to medial</strong> in the adductor canal, leaves through the vastoadductor membrane, gives the <strong>infrapatellar branch</strong> (skin below and inside the kneecap, sometimes the inferomedial capsule) and runs down the medial leg to the medial malleolus and the inner foot.</li>
<li><strong>Nerve to vastus medialis</strong>: lateral to the saphenous nerve, often in its own fascial sheath; it supplies the muscle and the <strong>superomedial capsule</strong>. It may enter the upper canal.</li>
<li><strong>Nerves to vastus intermedius and lateralis</strong>: deep and lateral, out of reach of a canal injection; they supply the superolateral and suprapatellar capsule.</li>
<li><strong>Anterior femoral cutaneous nerves</strong> (intermediate and medial): pierce fascia lata high in the thigh and run superficial to sartorius to the skin over the front of the knee.</li></ul>`));
  sec.append(figure('kn-fig-thigh', 'The femoral triangle, the adductor canal and the saphenous nerve (right thigh, front view)', thighFigure(),
    'Schematic, not to scale. Shaded: the femoral triangle (inguinal ligament, medial border of sartorius, medial border of adductor longus). Open circles: the apex and the adductor hiatus. Sartorius is drawn see-through so the canal underneath shows.',
    legendList([
      '<a href="#ch-adductor-canal">Femoral triangle block</a> just above the apex: saphenous nerve and nerve to vastus medialis.',
      '<a href="#adductor-canal-canal">Adductor canal block</a> below the apex: the purest saphenous block.',
      'Distal canal near the hiatus: fluid can run through to the popliteal plexus at the back of the knee.',
    ])));
  sec.append(table({
    caption: 'The adductor canal at a glance',
    head: ['', 'Femoral triangle', 'Adductor canal'],
    rows: [
      [{ th: true, html: 'Extent' }, 'Inguinal ligament to the apex', 'Apex to the adductor hiatus'],
      [{ th: true, html: 'Roof' }, 'Fascia lata', 'Sartorius over the vastoadductor membrane'],
      [{ th: true, html: 'Lateral' }, 'Medial border of sartorius', 'Vastus medialis'],
      [{ th: true, html: 'Medial or floor' }, 'Medial border of adductor longus; floor iliopsoas, pectineus, adductor longus', 'Adductor longus (above), adductor magnus (below)'],
      [{ th: true, html: 'Saphenous nerve' }, 'Lateral to the artery', 'Crosses in front of the artery to its medial side'],
      [{ th: true, html: 'Other contents' }, 'Femoral nerve branches, vein medial to the artery', 'Nerve to vastus medialis (upper part), vein behind the artery, descending genicular artery near the end'],
    ],
  }));

  // --- front of the knee
  sec.append(el('h3', { id: 'kn-anat-front', text: 'The front of the knee: four quadrants' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), '<p>Cadaver dissections divide the anterior capsule into four quadrants, each supplied by its own set of nerves with little overlap. All the articular branches except the nerves to vastus lateralis and medialis run <strong>on the periosteum</strong>, mostly beside a genicular artery: that is why a few millilitres on the bone (a genicular block) works, and why the arteries are the ultrasound landmarks.</p>'));
  sec.append(figure('kn-fig-front', 'Nerves of the anterior capsule (right knee, front view)', frontKneeFigure(),
    'Schematic. Dashed lines divide the quadrants (the midline and the joint line). Red: genicular arteries on the bone. The nerve to vastus intermedius (dashed) runs deep, on the front of the femur. The infrapatellar branch of the saphenous nerve is mostly a skin nerve.',
    legendList([
      'Superomedial genicular nerve: under vastus medialis, at the junction of shaft and medial condyle.',
      'Superolateral genicular nerve: under vastus lateralis, at the junction of shaft and lateral condyle.',
      'Inferomedial genicular nerve: on the tibia under the medial collateral ligament.',
      'Nerve to vastus intermedius: on the front of the femur above the patella (expanded target).',
      'Recurrent peroneal nerve: anterolateral tibia below the lateral condyle (expanded target).',
    ])));
  sec.append(table({
    caption: 'Anterior capsule: nerves by quadrant, and the block that reaches them',
    head: ['Quadrant', 'Nerves', 'Reached by'],
    rows: [
      [{ th: true, html: 'Superomedial' }, 'Nerve to vastus medialis, nerve to vastus intermedius, superomedial genicular', 'Femoral triangle block (nerve to vastus medialis); genicular block; femoral nerve block'],
      [{ th: true, html: 'Superolateral' }, 'Nerve to vastus lateralis, nerve to vastus intermedius, superolateral genicular, common peroneal branches', 'Genicular block; femoral nerve block (vasti); not an adductor canal block'],
      [{ th: true, html: 'Inferolateral' }, 'Inferolateral genicular, recurrent peroneal', 'Expanded genicular targets; sciatic block'],
      [{ th: true, html: 'Inferomedial' }, 'Inferomedial genicular; sometimes the infrapatellar branch of the saphenous', 'Genicular block; adductor canal block (saphenous)'],
    ],
  }));

  // --- back of the knee
  sec.append(el('h3', { id: 'kn-anat-back', text: 'The back of the knee: the popliteal plexus' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>In dissections, the posterior capsule is supplied in every specimen by articular branches of the <strong>tibial nerve</strong> (across the whole capsule) and of the <strong>posterior division of the obturator nerve</strong> (superomedially, overlapping the tibial), and in about half by the <strong>common peroneal</strong> nerve laterally. The obturator branch comes down with the femoral artery through the adductor hiatus. Together these form the <strong>popliteal plexus</strong> around the popliteal vessels and the middle genicular artery.</p>
<p>Two ways in without blocking the sciatic trunk: <a href="#ch-ipack">iPACK</a> from behind (fluid between the artery and the femur) and the <strong>popliteal plexus block</strong> from the front (fluid in the distal adductor canal running through the hiatus).</p>`));
  sec.append(figure('kn-fig-back', 'The popliteal plexus and the iPACK target (right knee, back view)', backKneeFigure(),
    'Schematic, back view (medial on the left). The tibial nerve is the most superficial structure in the fossa, then the vein, then the artery on the bone. The iPACK fluid sits deep to the artery, on the back of the femur just above the condyles, away from the nerve trunks.'));

  // --- skin
  const skin = legViewsFigure({
    id: 'kn-fig-skin',
    views: [
      { view: 'front', zones: ['lfcn', 'femoral-ant', 'obturator', 'saphenous-knee', 'saphenous-leg', 'lat-cut-calf', 'sup-peroneal-leg'], tint: true, labels: true, caption: 'Front' },
      { view: 'back', zones: ['pfcn', 'obturator', 'saphenous-knee', 'saphenous-leg', 'lat-cut-calf', 'sural-calf'], tint: true, labels: true, caption: 'Back' },
    ],
    caption: 'Schematic, right leg. A midline knee incision crosses the anterior femoral cutaneous (femoral) territory above and the infrapatellar branch of the saphenous nerve below. The back of the knee is posterior femoral cutaneous (sacral plexus). “Lat sural” is the lateral cutaneous nerve of the calf (lateral sural cutaneous nerve, from the common peroneal). Territories overlap and vary.',
    label: 'Front and back of the right leg with the skin territories around the knee: lateral femoral cutaneous, anterior femoral cutaneous, obturator, saphenous (infrapatellar and leg), lateral cutaneous nerve of the calf (lateral sural), superficial peroneal, posterior femoral cutaneous and sural.',
  });
  sec.append(el('h3', { id: 'kn-anat-skin', text: 'The skin around the knee' }));
  sec.append(skin);

  sec.append(callout('pearl', {
    title: 'For the viva',
    body: '<p>“The knee is supplied by the femoral, sciatic and obturator nerves. Anteriorly, the capsule is innervated in four quadrants by the nerves to the vasti, the genicular nerves, the recurrent peroneal nerve and the infrapatellar branch of the saphenous nerve. Posteriorly, the popliteal plexus is formed by articular branches of the tibial nerve and the posterior division of the obturator nerve. For a knee replacement I want the joint covered without weakening the quadriceps: an adductor canal or distal femoral triangle block for the anteromedial knee, with periarticular infiltration, or iPACK when the back of the capsule is not infiltrated.”</p>',
  }));

  registerSearch([
    { title: 'Femoral triangle and adductor canal figure', text: 'femoral triangle apex adductor canal hiatus sartorius adductor longus saphenous nerve crossing nerve to vastus medialis infrapatellar branch vastoadductor membrane', id: 'kn-fig-thigh' },
    { title: 'Anterior knee capsule quadrants figure', text: 'superomedial superolateral inferomedial inferolateral genicular nerve SMGN SLGN IMGN ILGN recurrent peroneal fibular nerve to vastus intermedius lateralis medialis', id: 'kn-fig-front' },
    { title: 'Popliteal plexus figure', text: 'popliteal plexus tibial nerve posterior obturator genicular branch common peroneal posterior capsule iPACK middle genicular artery', id: 'kn-fig-back' },
    { title: 'Skin around the knee', text: 'skin incision anterior femoral cutaneous intermediate medial infrapatellar saphenous posterior femoral cutaneous lateral cutaneous nerve of the calf', id: 'kn-fig-skin' },
  ]);
}
