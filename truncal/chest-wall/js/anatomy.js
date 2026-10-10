// Chest wall: anatomy chapter (innervation of the chest wall). Original schematic drawings (SVG).
import { el, sv, fill, keyPoints, callout, table, registerSearch } from '../../shared/js/ui.js';
import { cite } from '../../shared/js/refs.js';
import { OUTLINE } from '../../shared/js/dermatomes.js';

const NERVE = '#e2b21c', NERVE_EDGE = '#7a5c00', LA = '#2c74b3', ART = '#c0392b';
const MUS = '#d49a88', MUS_D = '#c9897a', MUS_E = '#a8695a', FAT = '#f3e2bf', SKIN = '#e7c0a3', BONE = '#ece2cc', BONE_E = '#9c8a64';

/** One intercostal space laid out flat, from the spine (left) to the sternum (right). */
function crossSection() {
  const svg = sv('svg', { viewBox: '0 0 780 330', class: 'cw-fig-svg', role: 'img', 'aria-labelledby': 'cw-xs-t cw-xs-d' });
  sv('title', { id: 'cw-xs-t', text: 'Course of an intercostal nerve and where each chest wall block puts the local anaesthetic' }, svg);
  sv('desc', { id: 'cw-xs-d', text: 'Schematic of one intercostal space laid out flat, from the spine on the left to the sternum on the right. The nerve leaves the spine, gives a dorsal ramus to the back, runs forward between the intercostal muscles, gives a lateral cutaneous branch at the mid-axillary line that pierces serratus anterior and divides into anterior and posterior branches, then ends as an anterior cutaneous branch beside the sternum. Latissimus dorsi covers serratus posteriorly; pectoralis minor and major cover it anteriorly. Numbered points: 1 interpectoral, 2 pectoserratus, 3 superficial serratus, 4 deep serratus, 5 superficial parasternal, 6 deep parasternal.' }, svg);
  const g = sv('g', {}, svg);
  const path = (d, f, s = MUS_E, extra = {}) => sv('path', { d, fill: f, stroke: s, 'stroke-width': 1, ...extra }, g);
  // skin, fat
  sv('rect', { x: 20, y: 40, width: 740, height: 6, fill: SKIN }, g);
  sv('rect', { x: 20, y: 46, width: 740, height: 36, fill: FAT }, g);
  // lung and pleura
  sv('rect', { x: 20, y: 82, width: 716, height: 68, fill: '#eadcc6' }, g);
  sv('rect', { x: 90, y: 194, width: 646, height: 46, fill: '#e3dce6' }, g);
  sv('path', { d: 'M90 194 H736', stroke: '#5b6f99', 'stroke-width': 2.6 }, g);
  // intercostal muscles (external, internal, innermost) from the angle of the rib to the sternum
  sv('rect', { x: 90, y: 150, width: 646, height: 44, fill: MUS_D }, g);
  sv('path', { d: 'M90 165 H736 M90 180 H736', stroke: MUS_E, 'stroke-width': 1 }, g);
  for (let x = 96; x < 730; x += 9) sv('path', { d: `M${x} 152 l6 11 M${x + 4} 167 l-6 11`, stroke: 'rgba(120,55,42,.35)', 'stroke-width': 1 }, g);
  // transversus thoracis beside the sternum
  path('M640 194 Q690 184 736 182 V194 Z', '#bf7d6e');
  // erector spinae and vertebra
  path('M20 82 H150 Q166 140 150 196 H20 Z', MUS);
  sv('rect', { x: 22, y: 200, width: 52, height: 44, fill: BONE, stroke: BONE_E }, g);
  // latissimus dorsi (posterior, tapering to the mid-axillary line)
  path('M120 82 H360 Q400 84 440 90 Q400 96 360 100 H150 Q136 92 120 82 Z', MUS);
  // serratus anterior on the ribs, from behind the mid-axillary line to the anterior chest
  path('M250 150 Q252 120 280 101 H560 Q600 112 610 150 Z', MUS_D);
  // pectoralis minor and major
  path('M470 124 Q480 104 500 98 H590 Q612 104 616 124 Z', MUS);
  path('M450 82 H740 V150 H640 Q625 112 600 98 H500 Q470 92 450 82 Z', MUS);
  // sternum
  sv('rect', { x: 736, y: 82, width: 24, height: 112, fill: BONE, stroke: BONE_E }, g);
  // internal thoracic artery, on transversus thoracis
  sv('circle', { cx: 712, cy: 189, r: 4.5, fill: ART, stroke: '#7d1d14' }, g);
  // nerves
  const nerve = (d, w = 4) => { sv('path', { d, fill: 'none', stroke: NERVE_EDGE, 'stroke-width': w + 2, 'stroke-linecap': 'round' }, g); sv('path', { d, fill: 'none', stroke: NERVE, 'stroke-width': w, 'stroke-linecap': 'round' }, g); };
  nerve('M74 222 C100 220 106 190 130 184 H700 Q716 184 718 170 Q720 120 716 46');   // intercostal nerve + anterior cutaneous branch
  nerve('M70 214 Q60 160 56 120 Q54 80 52 46', 3);                                 // dorsal ramus
  nerve('M400 184 Q402 130 404 80 Q404 66 406 60', 3);                             // lateral cutaneous branch
  nerve('M406 62 Q380 54 344 50', 2.6); nerve('M406 62 Q432 54 468 50', 2.6);       // its posterior and anterior divisions
  nerve('M548 99 H596', 2.4);                                                       // pectoral nerves (interpectoral plane)
  nerve('M300 100.5 H330', 2.4); nerve('M346 100.5 H376', 2.4);                     // thoracodorsal, long thoracic
  // injection points
  const inj = (n, x, y) => { sv('circle', { cx: x, cy: y, r: 10.5, fill: LA, stroke: '#fff', 'stroke-width': 2 }, g); sv('text', { x, y: y + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#fff', text: n }, g); };
  inj('1', 498, 97); inj('2', 592, 124); inj('3', 428, 100); inj('4', 452, 150); inj('5', 676, 150); inj('6', 668, 188);
  // labels
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 13, fill: '#272722' }, svg);
  const lab = (x, y, s, anchor = 'start') => sv('text', { x, y, 'text-anchor': anchor, text: s }, t);
  lab(80, 66, 'Subcutaneous fat'); lab(74, 130, 'Erector'); lab(74, 146, 'spinae');
  lab(168, 95, 'Latissimus dorsi'); lab(262, 132, 'Serratus anterior');
  lab(516, 119, 'Pec minor'); lab(650, 112, 'Pec major'); lab(110, 175, 'Intercostal muscles');
  lab(110, 222, 'Pleura and lung'); lab(80, 262, 'Spinal nerve and dorsal ramus');
  lab(410, 36, 'Lateral cutaneous branch'); lab(758, 34, 'Anterior cutaneous branch', 'end');
  lab(704, 258, 'Internal thoracic artery', 'end'); sv('path', { d: 'M706 252 L712 196', stroke: '#55534d', 'stroke-width': 0.8 }, svg);
  lab(640, 210, 'Transversus thoracis', 'end'); sv('path', { d: 'M642 206 L668 192', stroke: '#55534d', 'stroke-width': 0.8 }, svg);
  const small = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 12, fill: '#55534d' }, svg);
  sv('text', { x: 548, y: 92, text: 'Pectoral nerves' }, small);
  sv('text', { x: 286, y: 116, text: 'TD' }, small); sv('text', { x: 350, y: 116, text: 'LT' }, small);
  const s = sv('g', { 'font-family': 'NTF Mono, JetBrains Mono, monospace', 'font-size': 12, fill: '#55534d' }, svg);
  sv('text', { x: 24, y: 300, text: 'SPINE' }, s); sv('text', { x: 404, y: 300, 'text-anchor': 'middle', text: 'MID-AXILLARY LINE' }, s);
  sv('text', { x: 756, y: 300, 'text-anchor': 'end', text: 'STERNUM' }, s);
  sv('line', { x1: 404, x2: 404, y1: 278, y2: 288, stroke: '#55534d' }, svg);
  return svg;
}

/** Front view: where the lateral and anterior cutaneous branches surface, and which blocks reach them. */
function frontView() {
  const svg = sv('svg', { viewBox: '0 0 340 310', class: 'cw-fig-svg', role: 'img', 'aria-labelledby': 'cw-fv-t cw-fv-d' });
  sv('title', { id: 'cw-fv-t', text: 'Where the cutaneous branches surface on the front of the chest' }, svg);
  sv('desc', { id: 'cw-fv-d', text: 'Front view of the trunk, patient’s right side drawn. Lateral cutaneous branches of T2 to T6 surface along the mid-axillary line, where serratus and PECS II act. Anterior cutaneous branches surface beside the sternum, where the parasternal blocks act. The skin between them, the medial breast, is partly supplied by the anterior cutaneous branches.' }, svg);
  const g = sv('g', { transform: 'translate(0 4)' }, svg);
  sv('path', { d: OUTLINE.front, fill: '#f1e7d8', stroke: '#55534d', 'stroke-width': 1.3 }, g);
  const line = { fill: 'none', stroke: '#8f8574', 'stroke-width': 1 };
  sv('path', { d: 'M82 31 Q62 30 42 37', ...line }, g);                                   // right clavicle
  sv('path', { d: 'M85 128 Q66 140 52 158 Q47 166 46 174', ...line, 'stroke-dasharray': '3 2' }, g);
  sv('rect', { x: 80, y: 36, width: 10, height: 92, fill: 'none', stroke: '#8f8574', 'stroke-dasharray': '2 2' }, g); // sternum
  sv('circle', { cx: 60, cy: 96, r: 2.2, fill: '#8f8574' }, g);                           // nipple
  // zones
  sv('rect', { x: 36, y: 52, width: 18, height: 84, fill: 'rgba(44,116,179,.25)', stroke: LA, 'stroke-width': 1.2 }, g);
  sv('rect', { x: 70, y: 52, width: 10, height: 84, fill: 'rgba(44,116,179,.25)', stroke: LA, 'stroke-width': 1.2 }, g);
  // nerves: each level runs from the flank to the sternum; dots where branches surface
  const CEN = { T2: 62, T3: 80, T4: 96, T5: 111, T6: 126 };
  for (const y of Object.values(CEN)) {
    const d = `M40 ${y - 12} Q56 ${y - 4} 70 ${y - 1} T80 ${y}`;
    sv('path', { d, fill: 'none', stroke: NERVE_EDGE, 'stroke-width': 3, opacity: 0.9 }, g);
    sv('path', { d, fill: 'none', stroke: NERVE, 'stroke-width': 1.8 }, g);
    sv('circle', { cx: 44, cy: y - 10, r: 2.6, fill: '#272722' }, g);
    sv('circle', { cx: 78, cy: y - 0.3, r: 2.6, fill: '#272722' }, g);
  }
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 12, fill: '#272722' }, svg);
  const lab = (y, s, x = 166) => sv('text', { x, y, text: s }, t);
  const lead = (x1, y1, x2, y2) => sv('line', { x1, y1, x2, y2, stroke: '#55534d', 'stroke-width': 0.8 }, svg);
  lab(84, 'Lateral cutaneous branches'); lab(99, 'surface at the mid-axillary'); lab(114, 'line: serratus, PECS II'); lead(162, 92, 54, 92);
  lab(156, 'Anterior cutaneous branches'); lab(171, 'surface beside the sternum:'); lab(186, 'parasternal blocks'); lead(162, 160, 80, 118);
  lab(222, 'Between the two (the medial'); lab(237, 'breast): partly anterior'); lab(252, 'cutaneous, so PECS and'); lab(267, 'serratus may miss it');
  lead(162, 226, 66, 104);
  const k = sv('g', { 'font-family': 'NTF Mono, JetBrains Mono, monospace', 'font-size': 11, fill: '#55534d' }, svg);
  sv('text', { x: 166, y: 34, text: 'T2–T6, right side.' }, k);
  sv('text', { x: 166, y: 49, text: 'Dots: branches surface.' }, k);
  sv('text', { x: 166, y: 64, text: 'Blue: block zones.' }, k);
  sv('text', { x: 20, y: 304, text: 'R' }, k);
  return svg;
}

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'anat-h', text: 'Chest wall innervation' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'Every chest wall block catches the nerves at one point on their way round the chest. Know where each branch leaves the intercostal nerve, and you know what each block can and cannot cover.'));
  sec.append(keyPoints([
    `The chest wall skin is supplied by the <strong>intercostal nerves</strong> (the breast mainly by T4–T6, the axilla by T2 through the intercostobrachial nerve).${cite('atotw346')}`,
    `Each intercostal nerve gives a <strong>lateral cutaneous branch</strong> near the mid-axillary line, which pierces the intercostal muscles and serratus anterior and divides into anterior and posterior branches.${cite('atotw427', 'mehta2023')}`,
    `It then continues forward and ends as an <strong>anterior cutaneous branch</strong> beside the sternum.${cite('atotw427')} Serratus and PECS II act on the lateral branches, so the <strong>sternum and medial chest need a parasternal block</strong>.`,
    `The muscles have their own nerves: <strong>lateral pectoral (C5–C7) and medial pectoral (C8–T1)</strong> to the pectoral muscles, <strong>long thoracic (C5–C7)</strong> to serratus anterior, <strong>thoracodorsal (C6–C8)</strong> to latissimus dorsi.${cite('atotw346')}`,
    `The upper chest just below the clavicle is supplied by the <strong>supraclavicular nerves</strong> (C3–C4), which none of these blocks reach.${cite('atotw346')}`,
    'The back (dorsal rami) needs a block from the back: see the <a href="../back/">back page</a>.',
  ]));

  const f1 = el('figure', { class: 'cw-fig', id: 'anat-course' });
  f1.append(el('p', { class: 'cw-fig-title', text: 'The course of an intercostal nerve, and where each block injects' }),
    el('div', { class: 'cw-fig-stage cw-fig-stage--wide', tabindex: '0', role: 'region', 'aria-label': 'Nerve course diagram (scrolls sideways on small screens)' }, crossSection()));
  const legend = el('ol', { class: 'cw-legend' });
  legend.append(fill(el('li'), '<strong>Interpectoral</strong> (PECS I): pectoral nerves. <a href="#ch-pecs">PECS</a>'));
  legend.append(fill(el('li'), '<strong>Pectoserratus</strong> (second injection of PECS II): lateral branches as they run forward, intercostobrachial. <a href="#pecs-twostage">Two-stage PECS II</a>'));
  legend.append(fill(el('li'), '<strong>Superficial serratus</strong>: between latissimus dorsi and serratus, with the thoracodorsal (TD) and long thoracic (LT) nerves. <a href="#ch-sap">Serratus</a>'));
  legend.append(fill(el('li'), '<strong>Deep serratus</strong>: between serratus and the rib.'));
  legend.append(fill(el('li'), '<strong>Superficial parasternal</strong>: between pectoralis major and the intercostal muscles. <a href="#ch-parasternal">Parasternal</a>'));
  legend.append(fill(el('li'), '<strong>Deep parasternal</strong> (transversus thoracis plane): next to the internal thoracic artery and the pleura.'));
  f1.append(el('figcaption', {}, el('p', { text: 'One intercostal space laid out flat: the spine on the left, the sternum on the right. Not to scale; the intercostobrachial nerve is the lateral cutaneous branch of T2. Numbered points are injection sites:' }), legend));
  sec.append(f1);

  sec.append(el('h3', { id: 'anat-why', text: 'Why the sternum needs a parasternal block' }));
  const f2 = el('figure', { class: 'cw-fig cw-fig--split' });
  f2.append(el('div', { class: 'cw-fig-stage' }, frontView()));
  f2.append(el('figcaption', {}, table({
    head: ['Nerve', 'Supplies', 'Block that reaches it'],
    rows: [
      [{ th: true, html: 'Lateral cutaneous branches, T2–T6 (and below)' }, `Lateral chest wall; lateral breast${cite('atotw427')}`, '<a href="#ch-sap">Serratus</a>, <a href="#ch-pecs">PECS II</a> (pectoserratus)'],
      [{ th: true, html: 'Intercostobrachial (T2)' }, `The axilla${cite('atotw346')}`, `PECS II, superficial serratus${cite('atotw427', 'blanco2012')}`],
      [{ th: true, html: 'Anterior cutaneous branches, T2–T6' }, `Skin beside the sternum, medial breast, sternum${cite('atotw427', 'he2026')}`, '<a href="#ch-parasternal">Parasternal</a> (superficial or deep)'],
      [{ th: true, html: 'Lateral and medial pectoral' }, `Pectoralis major and minor (no skin)${cite('atotw346')}`, `<a href="#ch-pecs">PECS I</a> (interpectoral)${cite('atotw346')}`],
      [{ th: true, html: 'Long thoracic and thoracodorsal' }, `Serratus anterior; latissimus dorsi${cite('atotw346')}`, `Superficial serratus${cite('atotw427', 'atotw346')}`],
      [{ th: true, html: 'Supraclavicular (C3–C4)' }, `Upper chest below the clavicle${cite('atotw346')}`, 'None of these: not a chest wall plane block'],
      [{ th: true, html: 'Dorsal rami' }, 'The back', '<a href="../back/#ch-esp">ESP</a>, <a href="../back/#ch-pvb">paravertebral</a>'],
    ],
  })));
  sec.append(f2);
  sec.append(callout('pearl', {
    title: 'Two sentences for the viva',
    body: `<p>Serratus and PECS II block the lateral cutaneous branches around the mid-axillary line, so they cover the lateral chest and the lateral breast but spare the anterior cutaneous branches beside the sternum.${cite('atotw427', 'mehta2023')} The medial breast and the sternum need a parasternal block (or surgical infiltration), and the back needs an ESP or paravertebral block.${cite('sherwin2018', 'mehta2023')}</p>`,
  }));

  sec.append(el('h3', { id: 'anat-choose', text: 'Which block for which chest operation' }));
  sec.append(table({
    head: ['Operation', 'Levels to cover; single-shot level (deck slide 147)', 'Chest wall options on this page'],
    rows: [
      [{ th: true, html: 'Mastectomy' }, 'T2–T6; T4', `<a href="#ch-pecs">PECS II</a> or <a href="#ch-sap">serratus</a> (superficial or deep): equal single-shot options with ESP, paravertebral and infiltration${cite('desai2026')}`],
      [{ th: true, html: 'Thoracotomy, VATS' }, 'T2–T9; T5–T6', `<a href="#ch-sap">Serratus</a> as a second choice for VATS; first choice is paravertebral or ESP (<a href="../back/">back page</a>)${cite('feray2022')}`],
      [{ th: true, html: 'Rib fractures' }, 'The level of the fractures', `<a href="#sap-ribs">Serratus</a> catheter for fractures in the front two-thirds; ESP or paravertebral catheter otherwise${cite('williams2020')}`],
      [{ th: true, html: 'Sternotomy (brief: no cardiac surgery at NTF)' }, 'T2–T6 on both sides; T4', '<a href="#ch-parasternal">Parasternal</a>, both sides'],
    ],
  }));
  sec.append(fill(el('p', { class: 'cw-note' }), `Levels are from the deck’s level table (slide 147).${cite('deck')} The <a href="../">truncal blocks landing page</a> has a chooser across all three pages.`));

  sec.append(el('h3', { id: 'cw-others', text: 'Others' }));
  sec.append(fill(el('p', {}), `<strong>Clavipectoral block</strong> for clavicle fracture (deck slide 127).${cite('deck')} Not covered further here.`));

  registerSearch([
    { title: 'Intercostal nerve course diagram', text: 'lateral cutaneous branch anterior cutaneous branch dorsal ramus pectoral nerves long thoracic thoracodorsal internal thoracic artery transversus thoracis injection points', id: 'anat-course' },
    { title: 'Clavipectoral block', text: 'clavipectoral block clavicle fracture', id: 'cw-others' },
  ]);
}
