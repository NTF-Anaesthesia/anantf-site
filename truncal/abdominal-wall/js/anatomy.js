// Abdominal wall: anatomy chapter (T6–L1 innervation). Original schematic drawings (SVG).
import { el, sv, fill, keyPoints, callout, table, registerSearch } from '../../shared/js/ui.js';
import { cite } from '../../shared/js/refs.js';
import { OUTLINE } from '../../shared/js/dermatomes.js';

const NERVE = '#e2b21c', NERVE_EDGE = '#7a5c00', LA = '#2c74b3';

function crossSection() {
  const svg = sv('svg', { viewBox: '0 0 760 300', class: 'aw-fig-svg', role: 'img', 'aria-labelledby': 'aw-xs-t aw-xs-d' });
  sv('title', { id: 'aw-xs-t', text: 'Course of a lower thoracic nerve through the abdominal wall' }, svg);
  sv('desc', { id: 'aw-xs-d', text: 'Schematic of one side of the abdominal wall laid out flat, from the spine on the left to the midline on the right. The nerve leaves the spine, runs between internal oblique and transversus abdominis, gives off a lateral cutaneous branch near the mid-axillary line, then passes behind rectus and pierces it to reach the midline skin. Numbered points mark where the quadratus lumborum, lateral TAP and rectus sheath injections are made.' }, svg);
  const g = sv('g', {}, svg);
  const rect = (x, y, w, h, fillC, stroke) => sv('rect', { x, y, width: w, height: h, fill: fillC, stroke: stroke || 'none', 'stroke-width': 1 }, g);
  // background deep (extraperitoneal) and skin/fat
  rect(30, 80, 700, 94, '#f1dca6');
  rect(30, 40, 700, 6, '#e7c0a3');
  rect(30, 46, 700, 34, '#f3e2bf');
  rect(30, 174, 700, 53, '#f1dca6');
  sv('path', { d: 'M236 186 H730', stroke: '#6f6a3a', 'stroke-width': 2.4 }, g);
  rect(236, 187, 494, 40, '#e9c9b6');
  // posterior muscles: erector spinae and QL
  sv('path', { d: 'M30 80 H150 Q160 140 150 200 H30 Z', fill: '#d49a88', stroke: '#a8695a' }, g);
  sv('path', { d: 'M150 110 Q205 105 236 130 Q240 165 225 186 Q185 196 152 186 Q160 150 150 110 Z', fill: '#cf9282', stroke: '#a8695a' }, g);
  // lateral wall: EO, IO, TA, tapering into aponeuroses at the linea semilunaris
  sv('path', { d: 'M200 80 H545 Q560 80 575 84 L575 88 Q560 92 545 110 H230 Q215 95 200 80 Z', fill: '#d49a88', stroke: '#a8695a' }, g);
  sv('path', { d: 'M236 110 H545 Q560 112 575 90 L575 96 Q560 140 545 150 H240 Q238 130 236 110 Z', fill: '#c9897a', stroke: '#a8695a' }, g);
  sv('path', { d: 'M238 150 H545 Q560 152 575 160 L575 166 Q560 172 545 172 H232 Q236 160 238 150 Z', fill: '#bf7d6e', stroke: '#a8695a' }, g);
  // rectus sheath and rectus
  sv('path', { d: 'M575 80 H730 V86 H575 Z', fill: '#efe5cf', stroke: '#9d8c6a' }, g);
  sv('path', { d: 'M580 88 Q650 82 728 90 V158 Q650 164 580 156 Z', fill: '#d49a88', stroke: '#a8695a' }, g);
  sv('path', { d: 'M575 160 H730 V167 H575 Z', fill: '#efe5cf', stroke: '#9d8c6a' }, g);
  sv('path', { d: 'M232 174 H730', stroke: '#8b7a58', 'stroke-width': 1.4, 'stroke-dasharray': '5 3' }, g);
  // vertebra
  sv('rect', { x: 30, y: 210, width: 46, height: 40, fill: '#ece2cc', stroke: '#9c8a64' }, g);
  // nerve (yellow) with edge
  const nerve = (d, w = 4) => { sv('path', { d, fill: 'none', stroke: NERVE_EDGE, 'stroke-width': w + 2, 'stroke-linecap': 'round' }, g); sv('path', { d, fill: 'none', stroke: NERVE, 'stroke-width': w, 'stroke-linecap': 'round' }, g); };
  nerve('M76 228 C130 230 170 205 205 186 S236 156 260 151 H560 Q572 152 580 158 H640 Q660 158 664 120 Q668 80 672 46');
  nerve('M362 151 Q368 110 380 80 Q384 60 388 46', 3);           // lateral cutaneous branch
  nerve('M76 222 Q70 160 60 120 Q56 80 52 46', 3);               // dorsal ramus
  // injection points
  const inj = (n, x, y) => { sv('circle', { cx: x, cy: y, r: 11, fill: LA, stroke: '#fff', 'stroke-width': 2 }, g); sv('text', { x, y: y + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#fff', text: n }, g); };
  inj('1', 168, 112); inj('2', 440, 151); inj('3', 610, 158);
  // labels
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 13, fill: '#272722' }, svg);
  const lab = (x, y, s, anchor = 'start') => sv('text', { x, y, 'text-anchor': anchor, text: s }, t);
  lab(84, 66, 'Subcutaneous fat'); lab(250, 100, 'External oblique'); lab(250, 136, 'Internal oblique'); lab(250, 166, 'Transversus abdominis');
  lab(612, 128, 'Rectus'); lab(250, 212, 'Peritoneum and bowel'); lab(76, 140, 'Erector'); lab(76, 156, 'spinae');
  lab(166, 160, 'QL'); lab(84, 244, 'Spinal nerve');
  lab(392, 34, 'Lateral cutaneous branch'); lab(728, 34, 'Anterior cutaneous branch', 'end');
  const s = sv('g', { 'font-family': 'NTF Mono, JetBrains Mono, monospace', 'font-size': 12, fill: '#55534d' }, svg);
  sv('text', { x: 36, y: 284, text: 'POSTERIOR' }, s); sv('text', { x: 362, y: 284, 'text-anchor': 'middle', text: 'MID-AXILLARY LINE' }, s);
  sv('text', { x: 575, y: 284, 'text-anchor': 'middle', text: 'LINEA SEMILUNARIS' }, s); sv('text', { x: 728, y: 284, 'text-anchor': 'end', text: 'MIDLINE' }, s);
  [362, 575].forEach((x) => sv('line', { x1: x, x2: x, y1: 262, y2: 270, stroke: '#55534d' }, svg));
  return svg;
}

function frontEntry() {
  const svg = sv('svg', { viewBox: '0 0 340 310', class: 'aw-fig-svg aw-fig-svg--front', role: 'img', 'aria-labelledby': 'aw-fe-t aw-fe-d' });
  sv('title', { id: 'aw-fe-t', text: 'Where the nerves enter the transversus abdominis plane' }, svg);
  sv('desc', { id: 'aw-fe-d', text: 'Front view of the trunk, right side drawn. T6 to T9 enter the plane under the costal margin, medial to the linea semilunaris. T10 to T12 are already in the plane in the mid-axillary line, where the lateral TAP is done. L1 enters medial to the anterior superior iliac spine.' }, svg);
  const g = sv('g', { transform: 'translate(0 4)' }, svg);
  sv('path', { d: OUTLINE.front, fill: '#f1e7d8', stroke: '#55534d', 'stroke-width': 1.3 }, g);
  const line = { fill: 'none', stroke: '#8f8574', 'stroke-width': 1 };
  sv('path', { d: 'M85 128 Q66 140 52 158 Q47 166 46 174', ...line, 'stroke-dasharray': '3 2' }, g);
  sv('path', { d: 'M50 236 Q62 252 77 268', ...line }, g);
  sv('path', { d: 'M85 130 V268', ...line, 'stroke-dasharray': '1 3' }, g);
  sv('path', { d: 'M70 150 Q66 200 70 250', ...line, 'stroke-dasharray': '4 3' }, g); // linea semilunaris (approx.)
  sv('circle', { cx: 85, cy: 188, r: 2.4, fill: 'none', stroke: '#8f8574', 'stroke-width': 1.2 }, g);
  sv('circle', { cx: 50, cy: 236, r: 2, fill: '#8f8574' }, g);
  // zones
  sv('rect', { x: 34, y: 180, width: 16, height: 46, fill: 'rgba(44,116,179,.25)', stroke: LA, 'stroke-width': 1.2 }, g);
  sv('path', { d: 'M82 134 Q68 144 58 156 L64 162 Q74 150 86 141 Z', fill: 'rgba(44,116,179,.25)', stroke: LA, 'stroke-width': 1.2 }, g);
  sv('circle', { cx: 56, cy: 232, r: 6, fill: 'rgba(44,116,179,.25)', stroke: LA, 'stroke-width': 1.2 }, g);
  // nerves
  const CEN = { T6: 126, T7: 141, T8: 156, T9: 171, T10: 188, T11: 204, T12: 220 };
  for (const [lv, y] of Object.entries(CEN)) {
    const upper = ['T6', 'T7', 'T8', 'T9'].includes(lv);
    const d = `M40 ${y - 16} Q60 ${y - 8} ${upper ? 66 : 62} ${y - 3} T84 ${y}`;
    sv('path', { d, fill: 'none', stroke: NERVE_EDGE, 'stroke-width': 3.2 }, g);
    sv('path', { d, fill: 'none', stroke: NERVE, 'stroke-width': 2 }, g);
    const ex = upper ? 66 : 44, ey = upper ? y - 3 : y - 15;
    sv('circle', { cx: ex, cy: ey, r: 2.6, fill: '#272722' }, g);
  }
  const l1 = 'M40 222 Q48 230 56 238 Q66 254 80 270';
  sv('path', { d: l1, fill: 'none', stroke: NERVE_EDGE, 'stroke-width': 3.2 }, g);
  sv('path', { d: l1, fill: 'none', stroke: NERVE, 'stroke-width': 2 }, g);
  sv('circle', { cx: 57, cy: 239, r: 2.6, fill: '#272722' }, g);
  // labels on the right-hand side
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 12, fill: '#272722' }, svg);
  const lab = (y, s, x = 176) => sv('text', { x, y, text: s }, t);
  const lead = (x1, y1, x2, y2) => sv('line', { x1, y1, x2, y2, stroke: '#55534d', 'stroke-width': 0.8 }, svg);
  lab(140, 'T6–T9 enter under the'); lab(155, 'costal margin, medially'); lead(172, 140, 86, 145);
  lab(194, 'T10–T12: already in the'); lab(209, 'plane at the mid-axillary'); lab(224, 'line (lateral TAP zone)'); lead(172, 200, 52, 200);
  lab(258, 'L1 enters medial to'); lab(273, 'the ASIS'); lead(172, 258, 62, 240);
  const k = sv('g', { 'font-family': 'NTF Mono, JetBrains Mono, monospace', 'font-size': 11, fill: '#55534d' }, svg);
  sv('text', { x: 176, y: 34, text: 'Dots: where each nerve' }, k);
  sv('text', { x: 176, y: 49, text: 'enters the plane.' }, k);
  sv('text', { x: 176, y: 64, text: 'Blue: injection zones.' }, k);
  sv('text', { x: 20, y: 304, text: 'R' }, k);
  return svg;
}

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'anat-h', text: 'Abdominal wall innervation, T6–L1' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'Every abdominal wall block is a decision about <em>which nerves</em> you can reach <em>where</em>. Learn the course of the nerves and the choice of block follows.'));
  sec.append(keyPoints([
    `The anterior abdominal wall is supplied by the anterior rami of T6–T12 and L1. T7–T12 run between internal oblique and transversus abdominis.${cite('tsai2017')}`,
    'Each nerve gives a lateral cutaneous branch near the mid-axillary line, then continues forward to pierce the rectus sheath and supply the midline skin.',
    `T6–T9 enter the plane medially, under the costal margin: a <strong>subcostal TAP</strong> catches them.${cite('tsai2017', 'fernandez2025')}`,
    `A <strong>lateral TAP</strong> catches T10–T12 and only covers to T10.${cite('deck')}`,
    `L1 (iliohypogastric and ilioinguinal) generally only enters the plane medial to the ASIS, so the lateral TAP misses the groin.${cite('deck')}`,
    'All of these blocks are somatic: none treats visceral pain.',
  ]));

  const f1 = el('figure', { class: 'aw-fig', id: 'anat-course' });
  f1.append(el('p', { class: 'aw-fig-title', text: 'The course of a lower thoracic nerve' }), el('div', { class: 'aw-fig-stage aw-fig-stage--wide', tabindex: '0', role: 'region', 'aria-label': 'Nerve course diagram (scrolls sideways on small screens)' }, crossSection()));
  const legend = el('ol', { class: 'aw-legend' });
  legend.append(fill(el('li'), '<strong>Quadratus lumborum</strong> (type 1 shown): posterior, around QL. <a href="#ch-ql">QL block</a>'));
  legend.append(fill(el('li'), '<strong>Lateral TAP</strong>: between IO and TA at the mid-axillary line. <a href="#ch-tap">Lateral TAP</a>'));
  legend.append(fill(el('li'), '<strong>Rectus sheath</strong>: behind rectus, in front of the posterior sheath. <a href="#ch-rsb">Rectus sheath block</a>'));
  f1.append(el('figcaption', {}, el('p', { text: 'One side of the wall laid out flat: the spine on the left, the midline on the right. Not to scale. Numbered points are injection sites:' }), legend));
  sec.append(f1);

  sec.append(el('h3', { id: 'anat-entry', text: 'Where each nerve enters the plane' }));
  const f2 = el('figure', { class: 'aw-fig aw-fig--split' });
  f2.append(el('div', { class: 'aw-fig-stage' }, frontEntry()));
  f2.append(el('figcaption', {}, table({
    head: ['Nerves', 'Where they enter the TAP plane', 'Block that reaches them'],
    rows: [
      [{ th: true, html: 'T6–T9' }, `Under the costal margin, medial to the linea semilunaris${cite('tsai2017', 'fernandez2025')}`, '<a href="#ch-subcostal">Subcostal TAP</a>; <a href="#ch-rsb">rectus sheath</a> (midline branches)'],
      [{ th: true, html: 'T10–T12' }, 'Already in the plane in the lateral wall', '<a href="#ch-tap">Lateral TAP</a>'],
      [{ th: true, html: 'L1 (iliohypogastric, ilioinguinal)' }, `Medial to the ASIS, near the anterior iliac crest${cite('deck', 'tsai2017')}`, '<a href="#ch-iih">Ilioinguinal and iliohypogastric block</a>'],
      [{ th: true, html: 'Lateral cutaneous branches' }, 'Leave around the mid-axillary line', 'Missed by an anterior TAP; <a href="#ch-ql">QL</a> or back blocks may reach them'],
    ],
  })));
  sec.append(f2);

  sec.append(el('h3', { id: 'anat-groin', text: 'Why a lateral TAP misses the groin and the upper abdomen' }));
  sec.append(callout('pearl', {
    title: 'Two sentences for the viva',
    body: `<p>The lateral TAP is done in the mid-axillary line, where only T10–T12 are in the plane, so it covers the wall below the umbilicus and only to T10.${cite('deck')} The upper nerves enter the plane medially under the costal margin (use a subcostal TAP), and L1 only enters medial to the ASIS (use an ilioinguinal and iliohypogastric block).${cite('deck')}</p>`,
  }));

  sec.append(el('h3', { id: 'anat-choose', text: 'Which block for which incision' }));
  sec.append(table({
    head: ['Operation', 'Levels to cover (deck slide 147)', 'Abdominal wall options on this page'],
    rows: [
      [{ th: true, html: 'Hepatectomy, upper abdominal' }, 'T6–T10 bilaterally', 'Bilateral <a href="#ch-subcostal">subcostal TAP</a> ± <a href="#ch-rsb">rectus sheath</a> for a midline wound'],
      [{ th: true, html: 'Lower midline, hemicolectomy' }, 'T8–T12 bilaterally', 'Bilateral <a href="#ch-rsb">rectus sheath</a> (catheters for laparotomy) or <a href="#ch-tap">lateral TAP</a>'],
      [{ th: true, html: 'Nephrectomy' }, 'T8–T12', '<a href="#ch-ql">QL</a>; or back blocks (<a href="../back/">Back page</a>)'],
      [{ th: true, html: 'Open inguinal hernia' }, 'T10–L2', '<a href="#ch-iih">Ilioinguinal and iliohypogastric</a> + surgical infiltration'],
    ],
  }));
  sec.append(fill(el('p', { class: 'aw-note' }), `Levels are from the deck’s paravertebral table (slide 147).${cite('deck')} Abdominal wall blocks treat somatic pain only; for visceral pain consider neuraxial or paravertebral techniques.`));

  registerSearch([
    { title: 'Nerve course diagram', text: 'lateral cutaneous branch anterior cutaneous branch dorsal ramus spinal nerve between internal oblique and transversus abdominis', id: 'anat-course' },
  ]);
}
