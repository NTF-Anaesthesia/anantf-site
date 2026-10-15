// Hip page: anatomy chapter (the lumbar plexus in the groin and thigh; hip joint innervation; why PENG works).
// Original schematic drawings (SVG), not traced from any published figure. Clinical colours: nerves yellow, arteries red,
// veins blue, local anaesthetic blue.
import { el, sv, fill, keyPoints, callout, table, registerSearch } from '../../../shared/regional/js/ui.js';
import * as LEG from '../../../shared/regional/js/figures/leg.js';

const NERVE = '#e2b21c', NERVE_EDGE = '#7a5c00', ART = '#c0392b', VEIN = '#2f5d9e', LA = '#2c74b3';
const INK = '#272722', MUTED = '#55534d';

function nervePath(g, d, w = 4, dash) {
  sv('path', { d, fill: 'none', stroke: NERVE_EDGE, 'stroke-width': w + 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...(dash ? { 'stroke-dasharray': dash } : {}) }, g);
  sv('path', { d, fill: 'none', stroke: NERVE, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...(dash ? { 'stroke-dasharray': dash } : {}) }, g);
}
function marker(g, n, x, y) {
  sv('circle', { cx: x, cy: y, r: 11, fill: LA, stroke: '#fff', 'stroke-width': 2 }, g);
  sv('text', { x, y: y + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, fill: '#fff', text: String(n) }, g);
}

// ------------------------------------------------------------------ figure 1: lumbar plexus into the thigh
// Front view of the right side of the pelvis: patient's right (lateral) on the viewer's left, midline on the right.
function plexusFigure() {
  const svg = sv('svg', { viewBox: '0 0 360 440', class: 'hp-fig-svg', role: 'img', 'aria-labelledby': 'hp-plx-t hp-plx-d' });
  sv('title', { id: 'hp-plx-t', text: 'The lumbar plexus from the psoas to the thigh, right side, front view' }, svg);
  sv('desc', { id: 'hp-plx-d', text: 'Schematic front view of the right half of the pelvis, lateral on the left, the midline on the right. Psoas runs down from the lumbar spine and iliacus fills the iliac fossa; both pass under the inguinal ligament. The femoral nerve and the lateral femoral cutaneous nerve leave the lateral border of psoas and cross iliacus under fascia iliaca (shaded). The LFCN passes under the ligament near the anterior superior iliac spine; the femoral nerve passes under it lateral to the femoral artery and vein. The obturator nerve leaves the medial border of psoas and runs in the pelvis to the obturator foramen. Numbered points: 1 supra-inguinal fascia iliaca, 2 femoral nerve, 3 infra-inguinal fascia iliaca, 4 PENG, 5 LFCN.' }, svg);
  const g = sv('g', {}, svg);
  // fascia iliaca compartment (shaded) over iliacus and psoas
  sv('path', { d: 'M48 236 C40 180 58 120 110 100 C170 82 240 92 268 120 L300 40 L318 44 L296 180 C288 230 270 270 254 300 L214 306 C170 300 120 292 74 282 Z', fill: 'rgba(44,116,179,.10)', stroke: 'none' }, g);
  // iliac crest and ilium outline
  sv('path', { d: 'M46 238 C34 190 46 130 96 102 C150 76 228 84 266 116', fill: 'none', stroke: '#9c8a64', 'stroke-width': 3 }, g);
  // lumbar vertebrae
  [[28, 'L1'], [62, 'L2'], [96, 'L3'], [130, 'L4'], [164, 'L5']].forEach(([y, t]) => {
    sv('rect', { x: 306, y, width: 46, height: 28, fill: '#ece2cc', stroke: '#9c8a64' }, g);
    sv('text', { x: 329, y: y + 19, 'text-anchor': 'middle', 'font-size': 13, fill: MUTED, text: t }, g);
  });
  // sacrum / pubis (schematic)
  sv('path', { d: 'M306 196 L352 196 L352 250 L330 262 L306 240 Z', fill: '#ece2cc', stroke: '#9c8a64' }, g);
  sv('path', { d: 'M232 306 C252 300 290 304 318 318 L322 340 C300 334 268 330 244 334 Z', fill: '#ece2cc', stroke: '#9c8a64' }, g);
  sv('ellipse', { cx: 284, cy: 366, rx: 22, ry: 15, fill: '#f7f5ef', stroke: '#9c8a64' }, g); // obturator foramen
  // iliacus (fan) and psoas
  sv('path', { d: 'M60 228 C58 170 80 130 120 116 C170 102 226 108 252 132 C246 190 236 250 222 300 L176 300 C140 294 104 280 72 262 Z', fill: '#d49a88', stroke: '#a8695a', opacity: 0.85 }, g);
  sv('path', { d: 'M306 40 C292 90 274 140 262 190 C252 236 238 276 226 306 L204 304 C214 270 226 230 236 190 C248 140 268 90 290 36 Z', fill: '#c9897a', stroke: '#a8695a' }, g);
  // thigh below the ligament: iliopsoas continuing, sartorius
  sv('path', { d: 'M176 300 L226 306 C222 340 214 380 206 430 L170 430 C170 380 172 340 176 300 Z', fill: '#c9897a', stroke: '#a8695a', opacity: 0.9 }, g);
  sv('path', { d: 'M52 244 C70 300 110 360 160 430 L136 430 C92 368 60 310 44 252 Z', fill: '#d8a796', stroke: '#a8695a' }, g);
  // inguinal ligament
  sv('path', { d: 'M46 240 L314 318', stroke: '#6f6a3a', 'stroke-width': 2.4, 'stroke-dasharray': '7 4' }, g);
  // bones of interest
  sv('circle', { cx: 46, cy: 240, r: 6, fill: '#ece2cc', stroke: '#6f6a3a', 'stroke-width': 1.6 }, g); // ASIS
  sv('circle', { cx: 92, cy: 286, r: 5, fill: '#ece2cc', stroke: '#6f6a3a', 'stroke-width': 1.6 }, g); // AIIS
  sv('circle', { cx: 202, cy: 316, r: 5, fill: '#ece2cc', stroke: '#6f6a3a', 'stroke-width': 1.6 }, g); // IPE
  // vessels: external iliac to femoral (artery lateral to vein), on the medial side of psoas
  sv('path', { d: 'M286 180 C270 230 250 280 240 320 C236 360 236 400 236 430', fill: 'none', stroke: VEIN, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
  sv('path', { d: 'M276 176 C258 228 236 280 226 318 C222 360 222 400 222 430', fill: 'none', stroke: ART, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
  // nerves
  nervePath(g, 'M300 66 C282 72 268 82 260 96 C220 108 150 140 100 190 C74 216 62 238 58 252 C54 290 52 360 46 432', 3); // LFCN (L2–L3)
  nervePath(g, 'M304 96 C292 112 274 132 262 150 C252 164 240 178 230 196 C222 226 212 266 200 300 C195 330 190 380 188 432', 4.5); // femoral (L2–L4): inside psoas, out at its lateral border, then down the psoas–iliacus groove
  nervePath(g, 'M306 116 C304 150 300 190 296 230 C292 280 288 320 284 362', 3.5, '7 4'); // obturator, in the pelvis
  // articular branches of the femoral nerve to the hip (from above the ligament, between AIIS and IPE)
  nervePath(g, 'M207 264 C192 282 170 296 146 304', 1.6);
  // block sites
  marker(g, 1, 112, 232); marker(g, 2, 182, 376); marker(g, 3, 126, 300); marker(g, 4, 150, 316); marker(g, 5, 78, 268);
  // labels
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 14, fill: INK, stroke: '#fbf9f4', 'stroke-width': 3, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, svg);
  const lab = (x, y, s, anchor = 'start', extra = {}) => sv('text', { x, y, 'text-anchor': anchor, text: s, ...extra }, t);
  sv('path', { d: 'M52 292 L86 287', stroke: '#6f6a3a', 'stroke-width': 1 }, g); // AIIS leader
  lab(150, 168, 'Iliacus'); lab(254, 74, 'Psoas', 'end');
  lab(12, 226, 'ASIS'); lab(50, 297, 'AIIS', 'end'); lab(188, 334, 'IPE', 'end', { 'font-size': 13 });
  lab(94, 136, 'Fascia iliaca', 'start', { fill: '#1d4f7c', 'font-style': 'italic' });
  lab(300, 280, 'Inguinal', 'start', { 'font-size': 13 }); lab(300, 296, 'ligament', 'start', { 'font-size': 13 });
  lab(56, 420, 'LFCN', 'start', { 'font-weight': 600 });
  lab(182, 404, 'Femoral', 'end', { 'font-weight': 600 });
  lab(262, 396, 'Obturator', 'start', { 'font-weight': 600 });
  lab(244, 428, 'FA FV', 'start', { 'font-size': 13, fill: MUTED });
  const k = sv('g', { 'font-family': 'NTF Mono, JetBrains Mono, monospace', 'font-size': 12.5, fill: MUTED }, svg);
  sv('text', { x: 12, y: 18, text: 'LATERAL' }, k); sv('text', { x: 300, y: 18, 'text-anchor': 'end', text: 'MIDLINE →' }, k);
  return svg;
}

// ------------------------------------------------------------------ figure 2: the hip capsule from the front
// Right hip, front view: lateral (greater trochanter, AIIS) on the viewer's left, medial (pubis) on the right.
function capsuleFigure() {
  const svg = sv('svg', { viewBox: '0 0 360 340', class: 'hp-fig-svg', role: 'img', 'aria-labelledby': 'hp-cap-t hp-cap-d' });
  sv('title', { id: 'hp-cap-t', text: 'Nerves of the anterior hip capsule and the PENG target, right hip, front view' }, svg);
  sv('desc', { id: 'hp-cap-d', text: 'Front view of the right hip, lateral on the left. The capsule (dashed) runs from the acetabular rim to the intertrochanteric line. Above the joint, between the anterior inferior iliac spine (lateral) and the iliopubic eminence (medial), the psoas tendon crosses the bone; high articular branches of the femoral nerve reach the upper capsule there, and the accessory obturator nerve, when present, crosses the eminence. Obturator branches reach the lower, inner capsule near the inferomedial acetabulum. The PENG injection site is the shaded area under the psoas tendon between the two bony landmarks.' }, svg);
  const g = sv('g', {}, svg);
  const BONE = { fill: '#ece2cc', stroke: '#9c8a64', 'stroke-width': 1.5 };
  // ilium (above) and superior pubic ramus (medial)
  sv('path', { d: 'M18 30 C70 18 150 22 214 40 C250 50 280 72 300 98 L352 116 L352 150 L300 140 C286 128 266 120 246 118 C226 98 196 92 168 96 C150 98 132 102 118 108 C96 110 74 100 58 88 C40 72 24 52 18 30 Z', ...BONE }, g);
  // femur: head, neck, greater and lesser trochanters, shaft
  sv('path', { d: 'M232 150 C232 178 216 196 196 204 C178 222 160 240 150 256 C152 272 156 300 160 340 L96 340 C92 300 86 262 78 236 C64 226 56 204 64 186 C72 170 92 168 104 178 C124 176 146 170 168 158 C176 134 200 120 218 124 C228 132 232 140 232 150 Z', fill: '#efe5cf', stroke: '#9c8a64', 'stroke-width': 1.5 }, g);
  sv('circle', { cx: 162, cy: 268, r: 9, fill: '#e3d6bb', stroke: '#9c8a64' }, g); // lesser trochanter
  // capsule (dashed): acetabular rim to the intertrochanteric line
  sv('path', { d: 'M128 112 C112 140 104 170 108 196 C112 220 128 238 150 250 C176 236 204 214 226 196 C246 176 252 140 240 120', fill: 'rgba(241,231,216,.55)', stroke: '#633d3c', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, g);
  // PENG target zone on bone between AIIS and IPE
  sv('path', { d: 'M124 104 C150 94 196 92 236 106 L232 122 C198 110 156 110 128 120 Z', fill: 'rgba(44,116,179,.34)', stroke: LA, 'stroke-width': 1.4 }, g);
  // psoas tendon: over the groove between AIIS and IPE, then over the capsule to the lesser trochanter
  sv('path', { d: 'M200 8 C196 50 190 90 186 120 C182 170 174 220 164 262', fill: 'none', stroke: '#b9a684', 'stroke-width': 13, 'stroke-linecap': 'round', opacity: 0.6 }, g);
  // nerves
  nervePath(g, 'M150 8 C152 40 154 70 156 100 M156 92 C146 98 138 106 134 116 M156 96 C166 102 172 110 176 120', 2.4); // femoral articular
  nervePath(g, 'M266 8 C262 40 252 80 244 102 C238 116 230 126 220 134', 2.2, '6 3'); // accessory obturator
  nervePath(g, 'M346 214 C318 216 284 212 256 204 M312 216 C296 230 270 238 244 236', 2.4); // obturator articular
  // landmarks
  sv('circle', { cx: 118, cy: 108, r: 6, fill: '#fffaf0', stroke: '#6f6a3a', 'stroke-width': 1.6 }, g);
  sv('circle', { cx: 246, cy: 112, r: 6, fill: '#fffaf0', stroke: '#6f6a3a', 'stroke-width': 1.6 }, g);
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 14, fill: INK, stroke: '#fbf9f4', 'stroke-width': 3, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, svg);
  const lab = (x, y, s, anchor = 'start', extra = {}) => sv('text', { x, y, 'text-anchor': anchor, text: s, ...extra }, t);
  lab(110, 134, 'AIIS', 'end'); lab(256, 146, 'IPE');
  lab(140, 20, 'Femoral n.', 'end', { 'font-size': 13 }); lab(140, 36, 'high branches', 'end', { 'font-size': 13, fill: MUTED });
  lab(276, 26, 'Accessory', 'start', { 'font-size': 13 }); lab(276, 42, 'obturator', 'start', { 'font-size': 13 });
  lab(352, 250, 'Obturator n.', 'end', { 'font-size': 13 }); lab(352, 266, 'inferomedial', 'end', { 'font-size': 13, fill: MUTED });
  lab(182, 258, 'Psoas tendon', 'start', { 'font-size': 13, fill: MUTED }); sv('line', { x1: 179, y1: 254, x2: 170, y2: 252, stroke: MUTED, 'stroke-width': 1 }, t);
  lab(6, 150, 'Greater', 'start', { 'font-size': 13, fill: MUTED }); lab(6, 166, 'trochanter', 'start', { 'font-size': 13, fill: MUTED }); sv('line', { x1: 40, y1: 171, x2: 62, y2: 186, stroke: MUTED, 'stroke-width': 1 }, t);
  lab(176, 296, 'Lesser trochanter', 'start', { 'font-size': 13, fill: MUTED });
  lab(246, 186, 'Capsule', 'start', { 'font-size': 13, fill: '#633d3c' });
  sv('text', { x: 24, y: 84, 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 14, fill: '#1d4f7c', 'font-style': 'italic', 'font-weight': 600, text: 'PENG' }, svg);
  sv('line', { x1: 64, y1: 88, x2: 128, y2: 110, stroke: '#1d4f7c', 'stroke-width': 1 }, svg);
  sv('text', { x: 352, y: 332, 'text-anchor': 'end', 'font-family': 'NTF Mono, JetBrains Mono, monospace', 'font-size': 12.5, fill: MUTED, text: 'MEDIAL →' }, svg);
  return svg;
}

function figure(id, title, svg, caption, legend) {
  const f = el('figure', { class: 'hp-fig', id });
  f.append(el('p', { class: 'hp-fig-title', text: title }), el('div', { class: 'hp-fig-stage' }, svg));
  if (legend) f.append(legend);
  if (caption) f.append(fill(el('figcaption'), caption));
  return f;
}

function skinFigure() {
  // Cutaneous territories around the hip, from the shared leg figure (if it is available).
  if (typeof LEG.legFigure !== 'function') return null;
  try {
    const svg = LEG.legFigure('front', { zones: ['lfcn', 'femoral-ant', 'obturator', 'genitofemoral', 'ilioinguinal', 'saphenous'], tint: true, labels: true, sideSize: 14, label: 'Front of the right lower limb with the skin territories of the LFCN, femoral (anterior thigh and saphenous), obturator, genitofemoral and ilioinguinal nerves.' });
    if (!svg) return null;
    return figure('hp-fig-skin', 'Skin of the front of the thigh: who supplies what', svg,
      'Schematic, right leg, front view. LFCN: lateral thigh. Femoral (intermediate and medial cutaneous nerves): anterior and medial thigh; saphenous: medial knee, leg and ankle. Obturator: a variable patch of the distal medial thigh. Genitofemoral and ilioinguinal: small areas just below the inguinal ligament. Territories overlap and vary.');
  } catch (e) { return null; }
}

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'hp-anat-h', text: 'Anatomy: the lumbar plexus and the hip' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'Every hip block is a choice of <em>which branch</em> of the lumbar plexus to catch, <em>where</em>. Learn where the nerves cross the groin and which of them supply the joint, and the choice of block follows.'));
  sec.append(keyPoints([
    'The <strong>lumbar plexus</strong> (L1–L4, with T12) forms inside psoas. The three nerves that matter here: <strong>femoral</strong> (L2–L4), <strong>lateral femoral cutaneous</strong> (L2–L3) and <strong>obturator</strong> (L2–L4).',
    'Femoral and LFCN leave the <strong>lateral</strong> border of psoas and run on iliacus <strong>under fascia iliaca</strong>. The obturator leaves the <strong>medial</strong> border and runs in the pelvis, outside the fascia iliaca compartment.',
    'At the groin the femoral nerve is <strong>lateral to the artery and outside the femoral sheath</strong>; the LFCN passes under the inguinal ligament near the ASIS.',
    'The <strong>anterior hip capsule</strong> (most of the joint’s sensory supply) is supplied by the femoral, obturator and accessory obturator nerves; the <strong>posterior capsule</strong> by the nerve to quadratus femoris, sciatic and superior gluteal branches.',
    'Hip pain is often felt in the <strong>knee</strong>: the femoral and obturator nerves supply both joints.',
  ]));

  // --- lumbar plexus figure
  sec.append(el('h3', { id: 'hp-anat-plexus', text: 'From psoas to the thigh' }));
  const legend = el('ol', { class: 'hp-legend' });
  [
    '<a href="#ch-fib">Supra-inguinal fascia iliaca</a>: above the ligament, over the AIIS, into the iliac fossa.',
    '<a href="#ch-femoral">Femoral nerve block</a>: at the crease, lateral to the artery.',
    '<a href="#femoral-inj-fiib">Infra-inguinal fascia iliaca</a>: below the ligament, lateral third.',
    '<a href="#ch-peng">PENG</a>: on bone under the psoas tendon, between the AIIS and the iliopubic eminence (IPE).',
    '<a href="#ch-lfcn">LFCN block</a>: 1–2 cm below and medial to the ASIS.',
  ].forEach((h) => legend.append(fill(el('li'), h)));
  sec.append(figure('hp-fig-plexus', 'The lumbar plexus crossing the groin (right side, front view)', plexusFigure(),
    'Schematic, not to scale. Blue shading: the fascia iliaca compartment over iliacus and psoas. Dashed nerve: the obturator nerve, deep in the pelvis. The thin branch from the femoral nerve to the hip leaves above the ligament.', legend));

  sec.append(table({
    caption: 'The nerves that matter for hip blocks',
    head: ['Nerve', 'Roots', 'Course at the hip', 'Muscles', 'Skin', 'Hip joint'],
    rows: [
      [{ th: true, html: 'Femoral' }, 'L2–L4 (posterior divisions)', 'Lateral border of psoas; groove between psoas and iliacus, under fascia iliaca; under the ligament lateral to the artery; divides within a few centimetres', 'Iliacus, pectineus, sartorius, quadriceps', 'Anterior and medial thigh; saphenous to the medial leg and ankle', 'Anterior capsule (high branches between AIIS and IPE)'],
      [{ th: true, html: 'Lateral femoral cutaneous' }, 'L2–L3', 'Lateral border of psoas; across iliacus under fascia iliaca; under (or through) the ligament near the ASIS; fascia lata tunnel between sartorius and TFL', 'None (sensory)', 'Lateral thigh', 'None'],
      [{ th: true, html: 'Obturator' }, 'L2–L4 (anterior divisions)', 'Medial border of psoas; pelvic side wall; obturator canal; anterior and posterior divisions', 'Adductors (not the hamstring part of adductor magnus), gracilis, obturator externus', 'Variable patch of distal medial thigh', 'Anterior and inferomedial capsule'],
      [{ th: true, html: 'Accessory obturator' }, 'L3–L4', 'Medial border of psoas; over the superior pubic ramus near the IPE (present in a minority to about half of people)', 'Pectineus (some)', 'None', 'Anterior capsule, when present'],
      [{ th: true, html: 'Genitofemoral' }, 'L1–L2', 'Anterior surface of psoas; femoral branch in the femoral sheath', 'Cremaster (genital branch)', 'Small area below the inguinal ligament', 'None'],
    ],
  }));
  const sk = skinFigure();
  if (sk) sec.append(sk);

  // --- hip joint innervation
  sec.append(el('h3', { id: 'hp-anat-hip', text: 'Who supplies the hip joint' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p><strong>Hilton’s law:</strong> a nerve that supplies a muscle crossing a joint also supplies the joint. So the hip gets branches from the femoral, obturator and sciatic territories, and the pattern varies between people.</p>
<ul><li><strong>Anterior capsule</strong> (the main source of pain after fracture and arthroplasty): femoral nerve (high articular branches that leave the nerve above the inguinal ligament; classically also from the nerve to rectus femoris), obturator nerve, and the accessory obturator nerve when present.</li>
<li><strong>Posterior capsule</strong>: nerve to quadratus femoris (the main supply), with branches from the sciatic nerve and the superior gluteal nerve (and in some studies the inferior gluteal nerve).</li>
<li><strong>Overlying skin</strong>: LFCN laterally; subcostal and iliohypogastric branches over the iliac crest and trochanter; cluneal nerves over the buttock.</li></ul>`));
  sec.append(figure('hp-fig-capsule', 'The anterior capsule and the PENG target (right hip, front view)', capsuleFigure(),
    'Schematic. In cadavers, femoral nerve branches to the capsule pass between the AIIS and the IPE in nearly all specimens; the accessory obturator, when present, crosses the eminence; obturator branches reach the capsule further down and in, near the inferomedial acetabulum.'));

  sec.append(el('h3', { id: 'hp-anat-peng', text: 'Why PENG works (and what it doesn’t do)' }));
  sec.append(callout('key', {
    title: 'The logic in four lines',
    body: `<ol><li>The femoral and accessory obturator branches to the anterior capsule cross the bone <strong>between the AIIS and the iliopubic eminence</strong>, under the psoas tendon.</li>
<li>Local anaesthetic placed <strong>on that bone, under the tendon</strong>, catches them before they reach the capsule, while the femoral nerve trunk lies more superficially, on iliopsoas under fascia iliaca.</li>
<li>So the joint is numbed and the <strong>quadriceps usually works</strong>. The skin is not numbed (no cutaneous nerve runs there).</li>
<li>The obturator branches arrive lower and further in, so they are caught inconsistently, and the posterior capsule not at all.</li></ol>`,
  }));
  sec.append(table({
    caption: 'Which block reaches which nerve',
    head: ['Block', 'Femoral', 'LFCN', 'Obturator', 'Quadriceps', 'Skin'],
    rows: [
      [{ th: true, html: '<a href="#ch-peng">PENG</a>' }, 'Articular branches', 'No', 'Inconsistent', 'Usually spared', 'No'],
      [{ th: true, html: '<a href="#ch-fib">Supra-inguinal fascia iliaca</a>' }, 'Yes', 'Yes', 'Sometimes, not reliable', 'Weak', 'Anterior and lateral thigh'],
      [{ th: true, html: '<a href="#femoral-inj-fiib">Infra-inguinal fascia iliaca</a>' }, 'Yes', 'Variable', 'Rare', 'Weak', 'Anterior thigh, ± lateral'],
      [{ th: true, html: '<a href="#ch-femoral">Femoral</a>' }, 'Yes', 'Rarely', 'Rarely', 'Weak', 'Anterior and medial thigh'],
      [{ th: true, html: '<a href="#ch-lfcn">LFCN</a>' }, 'No', 'Yes', 'No', 'Spared', 'Lateral thigh'],
    ],
  }));
  sec.append(fill(el('p', { class: 'tb-prose' }), 'Other lower-limb nerves on their own pages: the <a href="../knee/#ch-obturator">obturator nerve block</a> and the <a href="../knee/#ch-adductor-canal">femoral triangle and adductor canal block</a> (knee), and the <a href="../thigh/#ch-sciatic">subgluteal and transgluteal sciatic blocks</a> with the <a href="../thigh/#ch-amputation">amputation planner</a> (thigh).'));
  sec.append(callout('pearl', {
    title: 'For the viva',
    body: '<p>“The anterior hip capsule is supplied by the femoral, obturator and accessory obturator nerves; the posterior capsule by the nerve to quadratus femoris, with sciatic and superior gluteal branches. A PENG block puts local anaesthetic under the psoas tendon between the AIIS and the iliopubic eminence, where the femoral and accessory obturator articular branches run, so it treats capsular pain while sparing the quadriceps. It doesn’t cover the skin, so for arthroplasty I add an LFCN block.”</p>',
  }));
  sec.append(callout('note', {
    title: 'Deeper options (for completeness)',
    body: '<p>The <strong>lumbar plexus (psoas) block</strong>, including the ultrasound “shamrock” view, blocks the femoral, LFCN and obturator nerves at their origin. It is a deep block with risks of epidural spread, retroperitoneal haematoma and toxicity; it has largely been replaced by the anterior blocks on this page for hip surgery.</p>',
  }));

  registerSearch([
    { title: 'Lumbar plexus figure: psoas to thigh', text: 'lumbar plexus psoas iliacus femoral nerve LFCN obturator genitofemoral inguinal ligament fascia iliaca compartment ASIS AIIS IPE', id: 'hp-fig-plexus' },
    { title: 'Hip capsule innervation figure', text: 'hip joint capsule innervation femoral obturator accessory obturator articular branches PENG target Hilton', id: 'hp-fig-capsule' },
    { title: 'Posterior hip capsule', text: 'nerve to quadratus femoris sciatic superior gluteal posterior capsule', id: 'hp-anat-hip' },
  ]);
}
