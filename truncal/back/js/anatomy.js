// Back: anatomy chapter (paravertebral space, counting levels, A–E label exercise), the landmark paravertebral
// stepper, and the level table (teaching slide 147). All figures are original schematic drawings (SVG).
import { el, sv, fill, keyPoints, callout, table, registerSearch, announce, reducedMotion } from '../../shared/js/ui.js';
import { cite } from '../../shared/js/refs.js';
import { OUTLINE } from '../../shared/js/dermatomes.js';

const NERVE = '#f2c230', NERVE_EDGE = '#8a6a00', ART = '#c0392b', VEIN = '#2f63b0';
const BONE = '#ece2cc', BONE_EDGE = '#9c8a64', MUSCLE = '#d49a88', MUSCLE_EDGE = '#a8695a', PLEURA = '#5b6f99', LIG = '#7c6845';
const SANS = 'NTF Sans, Inter, sans-serif', MONO = 'NTF Mono, JetBrains Mono, monospace';
const D = cite('deck');
const N = cite('notes');

// ---------------------------------------------------------------- paravertebral space, transverse (axial) section
// Right side, posterior at the top (as on a transverse ultrasound image), midline on the left.
const ANSWERS = {
  A: { label: 'Dorsal ramus of spinal nerve', at: [266, 126], m: [212, 118] },
  B: { label: 'Internal intercostal membrane', at: [762, 200], m: [800, 206] },
  C: { label: 'External intercostal muscle', at: [762, 182], m: [800, 174] },
  D: { label: 'Parietal pleura', at: [762, 228], m: [800, 240] },
  E: { label: 'Transverse process', at: [318, 172], m: [330, 136] },
};

function paraSection(mode, idp) {
  const letters = mode === 'letters';
  const svg = sv('svg', { viewBox: '0 -10 1090 470', class: 'bk-fig-svg bk-fig-svg--xs', role: 'img', 'aria-labelledby': `${idp}-t ${idp}-d` });
  sv('title', { id: `${idp}-t`, text: letters ? 'Exam diagram: name the structures marked A to E' : 'The thoracic paravertebral space in cross-section' }, svg);
  sv('desc', { id: `${idp}-d`, text: letters
    ? 'Transverse section of the right side of a thoracic vertebra, posterior at the top. Letter A is on the nerve branch running backwards towards the erector spinae; B on the thin membrane running laterally from the tip of the transverse process; C on the muscle layer just superficial to it; D on the membrane lining the chest wall in front of the space; E on the bony bar projecting laterally from the vertebra.'
    : 'Transverse section of the right side of a thoracic vertebra, posterior at the top and the vertebra on the left. The paravertebral space is a wedge beside the vertebral body: the parietal pleura in front and laterally, the superior costotransverse ligament medially and the internal intercostal membrane laterally behind, and the vertebral body, disc and intervertebral foramen medially. The spinal nerve leaves the foramen and divides into a dorsal ramus, which runs backwards, and a ventral ramus (the intercostal nerve), which runs laterally between the internal intercostal membrane and the pleura. The sympathetic chain lies in front of the nerve, joined to it by rami communicantes; the intercostal artery and vein run with the nerve.' }, svg);
  const g = sv('g', {}, svg);
  const P = (d, f, s, w = 1.2, extra = {}) => sv('path', { d, fill: f, stroke: s, 'stroke-width': w, ...extra }, g);
  const PLEURA_D = 'M240 318 Q262 312 300 296 Q400 252 480 236 Q580 228 760 228';
  // skin, fat, trapezius
  P('M0 18 H760 V30 H0 Z', '#e7c0a3', '#b98d6e');
  P('M0 30 H760 V52 H0 Z', '#f3e2bf', 'none');
  P('M0 52 H760 V80 H0 Z', MUSCLE, MUSCLE_EDGE);
  // erector spinae
  P('M150 80 H420 Q460 82 470 112 Q470 140 420 152 Q360 160 300 152 Q240 146 200 150 Q160 152 150 140 Z', MUSCLE, MUSCLE_EDGE);
  // external intercostal muscle (laterally, superficial to the IIM)
  P('M352 176 Q450 166 560 166 Q660 168 760 172 V198 Q660 194 560 196 Q450 198 352 196 Z', '#c9897a', MUSCLE_EDGE);
  // lung, then the paravertebral space (wedge) bounded by the pleura
  P(`${PLEURA_D} V440 H262 Q232 380 240 318 Z`, '#e3dce6', 'none');
  P('M236 228 L344 198 Q420 202 480 206 L480 236 Q400 252 300 296 Q262 312 240 318 Q226 278 236 228 Z', '#f6ead0', '#8f8574', 1.2, { 'stroke-dasharray': '5 3' });
  P(PLEURA_D, 'none', PLEURA, 3);
  // vertebra: body, canal, lamina and spinous process, pedicle and transverse process
  P('M60 300 Q60 250 120 240 Q190 236 222 268 Q240 300 226 352 Q200 400 130 404 Q64 400 60 340 Z', BONE, BONE_EDGE, 1.6);
  P('M150 236 Q176 210 196 196 Q214 186 232 178 L340 158 Q352 158 352 170 Q352 182 338 186 L240 210 Q214 220 196 238 Z', BONE, BONE_EDGE, 1.6);
  P('M150 196 Q140 160 128 128 L116 90 Q112 82 104 84 Q97 88 99 96 L104 132 Q108 170 92 196', BONE, BONE_EDGE, 1.6);
  sv('ellipse', { cx: 120, cy: 214, rx: 26, ry: 16, fill: '#fbf7ef', stroke: BONE_EDGE }, g);
  sv('ellipse', { cx: 120, cy: 214, rx: 13, ry: 9, fill: '#f6e9b9', stroke: '#b99a3a' }, g);
  // rib neck and head (just above this plane, dotted)
  P('M226 300 Q270 262 330 196 Q350 186 372 196 Q400 214 470 214', 'none', BONE_EDGE, 1, { 'stroke-dasharray': '3 4', opacity: 0.7 });
  // SCTL (medial) continuous with the IIM (lateral): the posterior wall of the space
  P('M236 228 L344 198', 'none', LIG, 3.4);
  P('M344 198 Q420 200 480 204 Q560 200 760 200', 'none', LIG, 2.4);
  // sympathetic chain with rami communicantes
  P('M250 290 Q258 272 262 252 M242 290 Q246 270 252 254', 'none', NERVE_EDGE, 1.4);
  sv('ellipse', { cx: 246, cy: 296, rx: 9, ry: 7, fill: NERVE, stroke: NERVE_EDGE, 'stroke-width': 1.2 }, g);
  // spinal nerve, ventral ramus (intercostal nerve) between the IIM and the pleura, dorsal ramus backwards
  const nerve = (d, w = 6, extra = {}) => { P(d, 'none', NERVE_EDGE, w + 2, { 'stroke-linecap': 'round', ...extra }); P(d, 'none', NERVE, w, { 'stroke-linecap': 'round', ...extra }); };
  nerve('M196 246 Q228 248 258 246 Q300 236 360 222 Q440 214 520 214 Q640 213 752 214', 6);
  nerve('M262 244 Q262 224 263 212', 4);
  nerve('M263 212 Q264 186 266 160', 4, { 'stroke-dasharray': '6 5', opacity: 0.75 });
  nerve('M266 160 Q268 130 272 100', 4);
  // intercostal artery and vein beside the nerve
  sv('circle', { cx: 300, cy: 254, r: 6, fill: ART, stroke: '#7d1d14' }, g);
  sv('circle', { cx: 318, cy: 258, r: 6, fill: VEIN, stroke: '#163f7a' }, g);

  const t = sv('g', { 'font-family': SANS, 'font-size': 18, fill: '#272722' }, svg);
  const lines = sv('g', { stroke: '#55534d', 'stroke-width': 1 }, svg);
  const lead = (x1, y1, x2, y2) => { sv('line', { x1, y1, x2, y2 }, lines); sv('circle', { cx: x2, cy: y2, r: 2.4, fill: '#272722', stroke: 'none' }, lines); };
  const lab = (x, y, s, anchor = 'start') => sv('text', { x, y, 'text-anchor': anchor, text: s }, t);
  const k = sv('g', { 'font-family': MONO, 'font-size': 18, fill: '#55534d' }, svg);
  sv('text', { x: 10, y: 10, text: 'POSTERIOR (SKIN)' }, k);
  sv('text', { x: 10, y: 454, text: 'ANTERIOR' }, k);
  lab(300, 106, 'Erector spinae'); lab(300, 72, 'Trapezius'); lab(80, 330, 'Vertebral body'); lab(660, 320, 'Lung');
  if (letters) {
    for (const [L, a] of Object.entries(ANSWERS)) {
      sv('line', { x1: a.m[0], y1: a.m[1], x2: a.at[0], y2: a.at[1], stroke: '#633d3c', 'stroke-width': 1.4 }, svg);
      sv('circle', { cx: a.m[0], cy: a.m[1], r: 16, fill: '#633d3c', stroke: '#fffaf0', 'stroke-width': 2 }, svg);
      sv('text', { x: a.m[0], y: a.m[1] + 6, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 18, 'font-weight': 600, fill: '#fffaf0', text: L }, svg);
    }
  } else {
    lab(790, 172, 'External intercostal muscle'); lead(786, 168, 762, 182);
    lab(790, 198, 'Internal intercostal membrane'); lead(786, 194, 762, 200);
    lab(790, 224, 'Intercostal nerve'); lead(786, 220, 754, 214);
    lab(790, 250, 'Parietal pleura'); lead(786, 246, 762, 228);
    lab(300, 140, 'Transverse process'); lead(330, 144, 330, 166);
    lab(256, 104, 'Dorsal ramus', 'end'); lead(258, 108, 270, 112);
    lab(380, 322, 'Paravertebral space'); lead(378, 318, 420, 232);
    lab(380, 350, 'Intercostal artery and vein'); lead(378, 346, 322, 262);
    lab(380, 378, 'SCTL (continuous with the IIM)'); lead(378, 374, 292, 214);
    lab(128, 430, 'Sympathetic chain and rami communicantes'); lead(250, 418, 246, 304);
  }
  return svg;
}

// Wide figures keep a minimum width (so their text stays at least 12px) and scroll sideways on small screens.
// This adds a visible hint and edge fades whenever there is more to see.
function scrollWrap(stage) {
  const hint = el('p', { class: 'bk-scroll-hint', 'aria-hidden': 'true', text: 'Scroll sideways to see the whole diagram →' });
  const box = el('div', { class: 'bk-scroll' }, stage);
  const update = () => {
    const over = stage.scrollWidth > stage.clientWidth + 2;
    hint.hidden = !over;
    box.classList.toggle('is-left', over && stage.scrollLeft > 2);
    box.classList.toggle('is-right', over && stage.scrollLeft + stage.clientWidth < stage.scrollWidth - 2);
  };
  stage.addEventListener('scroll', update, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(stage);
  requestAnimationFrame(update);
  return el('div', { class: 'bk-scroll-wrap' }, hint, box);
}

// ---------------------------------------------------------------- counting levels on the back
function countingFigure() {
  const svg = sv('svg', { viewBox: '0 0 390 310', class: 'bk-fig-svg', role: 'img', 'aria-labelledby': 'bk-cnt-t bk-cnt-d' });
  sv('title', { id: 'bk-cnt-t', text: 'Surface landmarks for counting thoracic levels' }, svg);
  sv('desc', { id: 'bk-cnt-d', text: 'Back view of the trunk. The most prominent spinous process at the base of the neck is C7, the vertebra prominens. A line joining the inferior angles of the scapulae crosses the T7 spinous process. Probe positions for the erector spinae and paravertebral blocks are about 2 to 3 cm lateral to the spinous processes at T5.' }, svg);
  const g = sv('g', {}, svg);
  sv('path', { d: OUTLINE.back, fill: '#f1e7d8', stroke: '#55534d', 'stroke-width': 1.3 }, g);
  const line = { fill: 'none', stroke: '#8f8574', 'stroke-width': 1.1 };
  sv('path', { d: 'M85 14 V268', ...line, 'stroke-dasharray': '2 3' }, g);
  sv('path', { d: 'M68 50 L63 141 L36 63 Z M102 50 L107 141 L134 63 Z', ...line, 'stroke-linejoin': 'round' }, g);
  for (let y = 30; y <= 236; y += 15.2) sv('rect', { x: 82.5, y, width: 5, height: 3.2, fill: '#b9ad97' }, g);
  sv('circle', { cx: 85, cy: 18, r: 3.6, fill: '#633d3c' }, g);
  sv('path', { d: 'M56 141 H114', stroke: '#633d3c', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, g);
  [[63, 141], [107, 141]].forEach(([x, y]) => sv('circle', { cx: x, cy: y, r: 3, fill: '#633d3c' }, g));
  // probe positions (right side = viewer right on the back)
  sv('rect', { x: 95, y: 99, width: 7, height: 24, fill: '#272722' }, g);
  sv('rect', { x: 110, y: 99, width: 7, height: 24, fill: 'none', stroke: '#272722', 'stroke-width': 1.4 }, g);
  const t = sv('g', { 'font-family': SANS, 'font-size': 15, fill: '#272722' }, svg);
  const lab = (x, y, s) => sv('text', { x, y, text: s }, t);
  const lead = (x1, y1, x2, y2) => sv('line', { x1, y1, x2, y2, stroke: '#55534d', 'stroke-width': 0.9 }, svg);
  lab(180, 23, 'C7: vertebra prominens'); lead(176, 18, 90, 18);
  lab(180, 96, 'T5: probe 2–3 cm lateral'); lab(180, 114, 'Filled: paravertebral'); lab(180, 132, 'Outline: ESP'); lead(176, 100, 118, 108);
  lab(180, 164, 'Inferior angle of'); lab(180, 182, 'scapula = T7'); lead(176, 160, 110, 141);
  const k = sv('g', { 'font-family': MONO, 'font-size': 15, fill: '#55534d' }, svg);
  sv('text', { x: 10, y: 304, text: 'L' }, k); sv('text', { x: 150, y: 304, text: 'R' }, k);
  sv('text', { x: 180, y: 236, text: 'Back view.' }, k); sv('text', { x: 180, y: 256, text: 'Not to scale.' }, k);
  return svg;
}

// ---------------------------------------------------------------- A–E label exercise (teaching slide 145)
function labelExercise() {
  const wrap = el('div', { class: 'bk-quiz' });
  wrap.append(scrollWrap(el('div', { class: 'bk-fig-stage bk-fig-stage--wide', tabindex: '0', role: 'region', 'aria-label': 'Exam diagram A to E (scrolls sideways on small screens)' }, paraSection('letters', 'bk-ex'))));
  const options = Object.values(ANSWERS).map((a) => a.label).sort();
  const form = el('form', { class: 'bk-quiz-form', 'aria-label': 'Name the structures A to E', on: { submit: (e) => { e.preventDefault(); check(); } } });
  const rows = Object.entries(ANSWERS).map(([L, a]) => {
    const id = `bk-ex-${L}`;
    const sel = el('select', { id, class: 'bk-quiz-sel' }, el('option', { value: '', text: 'Choose…' }), ...options.map((o) => el('option', { value: o, text: o })));
    const res = el('span', { class: 'bk-quiz-res', 'aria-live': 'polite' });
    sel.addEventListener('change', () => { res.textContent = ''; res.className = 'bk-quiz-res'; });
    const row = el('div', { class: 'bk-quiz-row' }, el('label', { for: id, class: 'bk-quiz-k' }, el('span', { class: 'bk-quiz-letter', 'aria-hidden': 'true', text: L }), el('span', { class: 'tb-sr', text: `Structure ${L}` })), sel, res);
    form.append(row);
    return { L, a, sel, res };
  });
  const score = el('p', { class: 'bk-quiz-score', role: 'status' });
  const checkBtn = el('button', { type: 'submit', class: 'tb-btn tb-btn--primary', text: 'Check answers' });
  const showBtn = el('button', { type: 'button', class: 'tb-btn', text: 'Show answers', on: { click: () => { rows.forEach((r) => { r.sel.value = r.a.label; }); check(); } } });
  const resetBtn = el('button', { type: 'button', class: 'tb-btn', text: 'Reset', on: { click: () => { rows.forEach((r) => { r.sel.value = ''; r.res.textContent = ''; r.res.className = 'bk-quiz-res'; }); score.textContent = ''; } } });
  form.append(el('div', { class: 'bk-quiz-actions' }, checkBtn, showBtn, resetBtn), score);
  function check() {
    let n = 0;
    rows.forEach((r) => {
      const ok = r.sel.value === r.a.label;
      if (ok) n += 1;
      r.res.className = `bk-quiz-res ${ok ? 'is-ok' : 'is-no'}`;
      r.res.textContent = ok ? 'Correct' : (r.sel.value ? `Not quite: ${r.a.label}` : `Answer: ${r.a.label}`);
    });
    score.textContent = `${n} of 5 correct.`;
    announce(`${n} of 5 correct`);
  }
  wrap.append(form);
  return wrap;
}

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'anat-h', text: 'The paravertebral space and counting levels' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'Both back blocks aim at the same nerves. The paravertebral block puts the local anaesthetic in the space where they leave the spine; the erector spinae plane block puts it behind the transverse process and relies on it spreading forwards.'));
  sec.append(keyPoints([
    `A <strong>triangular wedge</strong> on either side of the vertebral column.${D}`,
    `<strong>Anterolateral border:</strong> the parietal pleura (with the endothoracic fascia). <strong>Posterior border:</strong> the superior costotransverse ligament (SCTL) medially and the internal intercostal membrane (IIM) laterally. <strong>Medial border:</strong> the vertebral body, disc and intervertebral foramen.${D}`,
    `<strong>Contents:</strong> the spinal nerves (ventral rami, which become the intercostal nerves, and dorsal rami), the sympathetic chain with its grey and white rami communicantes, the intercostal vessels, fat and lymphatics.${cite('deck', 'batra2011', 'karmakar2001')} <span class="bk-flag"><strong>Wording corrected, for confirmation:</strong> teaching slide 144 lists “dorsal rami of intercostal nerves”. The department teaching notes list the contents as the spinal (intercostal) nerves with their anterior and posterior rami, and describe the intercostal nerves as the anterior (ventral) primary rami,${N} so we have written the contents as above.</span>`,
    `The <strong>SCTL</strong> runs from the upper border of the neck of each rib up to the transverse process of the vertebra above,${N} so it slopes: this is why the sagittal in-plane needle goes caudal to cranial.${D}`,
    `It communicates with the spaces above and below, with the intercostal space laterally and with the epidural space medially, which explains multi-level, intercostal and epidural spread.${cite('batra2011')}`,
  ]));

  const f1 = el('figure', { class: 'bk-fig', id: 'anat-section' });
  f1.append(el('p', { class: 'bk-fig-title', text: 'Cross-section: the right paravertebral space' }), scrollWrap(el('div', { class: 'bk-fig-stage bk-fig-stage--wide', tabindex: '0', role: 'region', 'aria-label': 'Paravertebral space diagram (scrolls sideways on small screens)' }, paraSection('labels', 'bk-xs'))));
  f1.append(fill(el('figcaption'), 'Posterior at the top, as on a transverse ultrasound image; the vertebra is on the left. The dashed wedge is the paravertebral space. The SCTL (medially) and the IIM (laterally) form one continuous posterior wall. The rib neck (dotted) lies just above this plane, and the dorsal ramus is dashed where it passes just below the transverse process. Not to scale.'));
  sec.append(f1);

  sec.append(el('h3', { id: 'anat-two', text: 'Where each block puts the local anaesthetic' }));
  sec.append(table({
    head: ['Block', 'Needle tip', 'Relation to the SCTL / IIM'],
    rows: [
      [{ th: true, html: '<a href="#ch-esp">Erector spinae plane</a>' }, `On the transverse process, deep to erector spinae${D}`, 'Behind it: relies on spread forwards'],
      [{ th: true, html: '<a href="#esp-mtp">MTP</a>' }, `Halfway between the back of the transverse process and the pleura${cite('costache2017')}`, 'Behind it: no pop needed'],
      [{ th: true, html: '<a href="#ch-pvb">Paravertebral</a>' }, `In the space, below the SCTL (sagittal) or the IIM (transverse)${D}`, 'Through it: pop, pleura pushed down'],
    ],
  }));

  sec.append(el('h3', { id: 'anat-count', text: 'Counting levels' }));
  const f2 = el('figure', { class: 'bk-fig bk-fig--split' });
  f2.append(el('div', { class: 'bk-fig-stage' }, countingFigure()));
  const cap = el('figcaption');
  cap.append(fill(el('ul', { class: 'bk-list' }), `<li><strong>C7, the vertebra prominens</strong>: the most prominent spinous process at the base of the neck. Count down from it.${D}</li><li><strong>The inferior angle (tip) of the scapula is T7</strong>, with the arms by the side.${D}</li><li><strong>Ultrasound from the first rib:</strong> start parasagittal high in the back, beside the C7 spinous process, to find the first rib, then slide caudally and count each rib down to the level you want.${D}</li><li><strong>The root (medial end) of the spine of the scapula is at about T3.</strong>${N}</li><li>On ultrasound you can also count up from the <strong>12th rib</strong>.${N}</li><li>Confirm the level on ultrasound by counting ribs before you mark the skin.</li>`));
  f2.append(cap);
  sec.append(f2);

  // Exam corner for the anatomy chapter
  const ex = el('section', { class: 'tb-bsec tb-bsec--examcorner', id: 'anat-exam', 'aria-labelledby': 'anat-exam-h' });
  ex.append(el('h3', { id: 'anat-exam-h', text: 'Exam corner' }));
  const q = el('article', { class: 'tb-exam-q bk-exam-q' });
  q.append(el('p', { class: 'tb-exam-src', text: 'Exam question (teaching slide 145)' }));
  q.append(fill(el('div', { class: 'tb-exam-text' }), '<p>Name the structures marked <strong>A to E</strong> on this diagram of the paravertebral region.</p>'));
  q.append(labelExercise());
  ex.append(q);
  const q2 = el('article', { class: 'tb-exam-q' });
  q2.append(el('p', { class: 'tb-exam-src', text: 'Practice question (based on teaching slide 144)' }));
  q2.append(fill(el('div', { class: 'tb-exam-text' }), '<p>Describe the boundaries and contents of the thoracic paravertebral space.</p>'));
  const d = el('details', { class: 'tb-details tb-exam-ans' });
  d.append(el('summary', { text: 'Model answer points' }), fill(el('ul', { class: 'tb-exam-pts' }), '<li>A triangular wedge on either side of the vertebral column.</li><li>Anterolateral: parietal pleura.</li><li>Posterior: SCTL medially, IIM laterally (continuous with each other).</li><li>Medial: vertebral body, disc and intervertebral foramen.</li><li>Contents: spinal nerves (ventral rami, which become the intercostal nerves, and dorsal rami), sympathetic chain with grey and white rami communicantes, intercostal vessels, fat, lymphatics.</li>'));
  q2.append(d);
  ex.append(el('div', { class: 'tb-exam' }, q, q2));
  sec.append(ex);

  registerSearch([
    { title: 'Counting levels: scapula', text: 'spine of scapula T3 twelfth rib 12th rib count up', id: 'anat-count' },
    { title: 'Paravertebral space diagram', text: 'dorsal ramus ventral ramus intercostal nerve sympathetic chain rami communicantes intercostal artery vein parietal pleura superior costotransverse ligament internal intercostal membrane external intercostal muscle transverse process vertebral body', id: 'anat-section' },
    { title: 'Counting levels', text: 'vertebra prominens C7 inferior angle of scapula T7 tip of scapula first rib count ribs', id: 'anat-count' },
    { title: 'Name A to E (exam)', text: 'label exercise dorsal ramus internal intercostal membrane external intercostal muscle parietal pleura transverse process', id: 'anat-exam' },
  ]);
}

// ---------------------------------------------------------------- landmark paravertebral technique (teaching slide 148)
const LM_STEPS = [
  { title: 'Mark the skin', short: 'Mark', body: `At the level you want, mark a point <strong>2 cm lateral to the spinous process</strong>.${D}` },
  { title: 'Contact the transverse process', short: 'Bone', body: `Insert a <strong>Tuohy needle perpendicular</strong> to the skin until it <strong>contacts the transverse process at about 4 cm</strong>.${D} If there is no bone by then, stop and reassess: you may be between transverse processes.` },
  { title: 'Walk off the bone', short: 'Walk off', body: `Withdraw a little and <strong>walk off the transverse process superiorly or inferiorly</strong>.${D}` },
  { title: 'Pop and loss of resistance', short: 'Pop', body: `Advance with a loss-of-resistance syringe (saline or air) until you feel the <strong>pop of the SCTL</strong> with loss of resistance.${D} <strong>Don’t advance more than 1.5 cm further</strong> past the depth of the transverse process.${D} Aspirate, then inject in increments.` },
];

function landmarkFigure() {
  const svg = sv('svg', { viewBox: '0 -24 720 412', class: 'bk-fig-svg', role: 'img', 'aria-labelledby': 'bk-lm-t bk-lm-d' });
  sv('title', { id: 'bk-lm-t', text: 'Landmark paravertebral technique' }, svg);
  const desc = sv('desc', { id: 'bk-lm-d', text: '' }, svg);
  const S = 40; // px per cm
  const skin = 40, tpTop = skin + 4 * S, tpBot = tpTop + 28, maxD = tpTop + 1.5 * S;
  const g = sv('g', {}, svg);
  // inset: back view strip with spinous processes and the mark
  const ins = sv('g', { transform: 'translate(16 52)' }, g);
  sv('rect', { x: 0, y: 0, width: 150, height: 210, fill: '#f1e7d8', stroke: '#8f8574' }, ins);
  for (let y = 18; y < 200; y += 44) sv('rect', { x: 52, y, width: 14, height: 22, fill: '#ece2cc', stroke: '#9c8a64' }, ins);
  sv('line', { x1: 59, y1: 6, x2: 59, y2: 204, stroke: '#8f8574', 'stroke-dasharray': '2 3' }, ins);
  const mark = sv('g', { class: 'bk-lm-mark' }, ins);
  sv('path', { d: 'M131 102 l8 8 M139 102 l-8 8', stroke: '#633d3c', 'stroke-width': 2.2 }, mark);
  sv('path', { d: 'M59 126 H135', stroke: '#272722', 'stroke-width': 1 }, mark);
  sv('path', { d: 'M59 121 V131 M135 121 V131', stroke: '#272722', 'stroke-width': 1 }, mark);
  sv('text', { x: 97, y: 150, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 17, fill: '#272722', text: '2 cm' }, mark);
  sv('text', { x: 75, y: 232, 'text-anchor': 'middle', 'font-family': MONO, 'font-size': 16, fill: '#55534d', text: 'FROM BEHIND' }, ins);

  // section: parasagittal through the mark, cranial on the left
  const X0 = 200, X1 = 704;
  const sec = sv('g', {}, g);
  sv('rect', { x: X0, y: skin - 12, width: X1 - X0, height: 12, fill: '#e7c0a3' }, sec);
  sv('rect', { x: X0, y: skin, width: X1 - X0, height: tpTop - skin - 4, fill: MUSCLE, opacity: 0.55 }, sec);
  sv('rect', { x: X0, y: tpTop - 4, width: X1 - X0, height: 300 - tpTop + 4, fill: '#eadcc6' }, sec);
  // transverse processes: upper (cranial, left) and lower (caudal, right), SCTL between
  // the neck of the rib below lies just deep to its transverse process; the SCTL runs from the lower border of
  // the transverse process above down to the neck of that rib
  sv('ellipse', { cx: 500, cy: tpBot + 10, rx: 38, ry: 14, fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, sec);
  sv('rect', { x: 236, y: tpTop, width: 104, height: 28, fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.6 }, sec);
  sv('rect', { x: 470, y: tpTop, width: 104, height: 28, fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.6 }, sec);
  sv('path', { d: `M338 ${tpBot - 1} Q404 ${tpBot - 1} 464 ${tpBot + 5}`, fill: 'none', stroke: LIG, 'stroke-width': 3.4 }, sec);
  sv('path', { d: `M${X0} 312 Q360 300 520 306 T${X1} 304`, fill: 'none', stroke: PLEURA, 'stroke-width': 3 }, sec);
  sv('rect', { x: X0, y: 314, width: X1 - X0, height: 52, fill: '#e3dce6' }, sec);
  // depth guides
  const guide = sv('g', { 'font-family': SANS, 'font-size': 17, fill: '#272722' }, sec);
  const brk = (x, y1, y2, text, cls) => {
    const b = sv('g', { class: cls }, guide);
    sv('path', { d: `M${x - 6} ${y1} H${x + 6} M${x} ${y1} V${y2} M${x - 6} ${y2} H${x + 6}`, stroke: '#272722', 'stroke-width': 1.2, fill: 'none' }, b);
    sv('text', { x: x + 10, y: (y1 + y2) / 2 + 4, text }, b);
    return b;
  };
  brk(600, skin, tpTop, 'about 4 cm', 'bk-lm-d4');
  brk(600, tpTop, maxD, '1.5 cm max', 'bk-lm-d15');
  sv('line', { x1: X0, y1: maxD, x2: X1, y2: maxD, stroke: '#a12a1c', 'stroke-width': 1.2, 'stroke-dasharray': '5 4', class: 'bk-lm-d15' }, guide);
  const L = sv('g', { 'font-family': SANS, 'font-size': 17, fill: '#272722' }, svg);
  sv('text', { x: 288, y: tpTop + 20, 'text-anchor': 'middle', text: 'TP above' }, L);
  sv('text', { x: 522, y: tpTop + 20, 'text-anchor': 'middle', text: 'TP' }, L);
  sv('text', { x: 206, y: tpBot + 23, text: 'SCTL (to the rib below)' }, L);
  sv('text', { x: 470, y: tpBot + 56, text: 'Neck of rib below' }, L);
  sv('text', { x: 214, y: 346, text: 'Pleura and lung' }, L);
  sv('text', { x: 214, y: skin + 28, text: 'Erector spinae' }, L);
  const k = sv('g', { 'font-family': MONO, 'font-size': 16, fill: '#55534d' }, svg);
  sv('text', { x: X0, y: 380, text: 'SECTION THROUGH THE MARK · CRANIAL ←' }, k);
  // needle
  const needle = sv('g', { class: 'bk-lm-needle' }, svg);
  const ghost = sv('line', { stroke: '#8f8574', 'stroke-width': 3, 'stroke-dasharray': '6 5', opacity: 0 }, svg);
  const shaft = sv('line', { stroke: '#4a4e57', 'stroke-width': 5, 'stroke-linecap': 'round' }, needle);
  const core = sv('line', { stroke: '#d6d9df', 'stroke-width': 1.6 }, needle);
  const hub = sv('rect', { width: 16, height: 22, fill: '#633d3c' }, needle);
  const tipDot = sv('circle', { r: 4.5, fill: '#272722' }, needle);
  const pool = sv('ellipse', { rx: 30, ry: 6, fill: 'rgba(64,158,222,0.7)', stroke: '#1d5f96', opacity: 0 }, svg);
  const pop = sv('text', { 'font-family': SANS, 'font-size': 17, 'font-weight': 600, fill: '#1d4f7c', text: 'Pop + loss of resistance', opacity: 0 }, svg);
  const entry = [522, skin];
  const tips = [null, [522, tpTop], [462, tpTop + 6], [450, tpTop + 38]];  // step 4: about 1 cm past the TP, well short of the 1.5 cm limit
  let cur = null;
  function place(tip, t = 1) {
    const from = cur || tip;
    const x = from[0] + (tip[0] - from[0]) * t, y = from[1] + (tip[1] - from[1]) * t;
    const dx = x - entry[0], dy = y - entry[1], len = Math.hypot(dx, dy) || 1;
    const hx = entry[0] - (dx / len) * 34, hy = entry[1] - (dy / len) * 34;
    [shaft, core].forEach((s) => { s.setAttribute('x1', hx); s.setAttribute('y1', hy); s.setAttribute('x2', x); s.setAttribute('y2', y); });
    const ang = Math.atan2(dy, dx) * 180 / Math.PI - 90;
    hub.setAttribute('transform', `translate(${hx} ${hy}) rotate(${ang}) translate(-8 -22)`);
    tipDot.setAttribute('cx', x); tipDot.setAttribute('cy', y);
  }
  const DESCS = [
    'Step 1: the skin is marked 2 cm lateral to the spinous process at the chosen level.',
    'Step 2: the Tuohy needle goes in perpendicular to the skin and touches the transverse process at about 4 cm.',
    'Step 3: the needle is withdrawn slightly and walked off the cranial edge of the transverse process.',
    'Step 4: the needle passes through the superior costotransverse ligament with a pop and loss of resistance, no more than 1.5 cm deeper than the transverse process, and local anaesthetic is deposited below the ligament.',
  ];
  let raf = 0;
  function show(i) {
    desc.textContent = DESCS[i];
    svg.querySelectorAll('.bk-lm-mark').forEach((n) => n.setAttribute('opacity', i === 0 ? '1' : '0.45'));
    svg.querySelectorAll('.bk-lm-d4').forEach((n) => n.setAttribute('opacity', i >= 1 ? '1' : '0'));
    svg.querySelectorAll('.bk-lm-d15').forEach((n) => n.setAttribute('opacity', i >= 3 ? '1' : '0'));
    needle.setAttribute('opacity', i === 0 ? '0' : '1');
    ghost.setAttribute('opacity', i === 3 || i === 2 ? '0.8' : '0');
    if (i >= 2) { ghost.setAttribute('x1', entry[0]); ghost.setAttribute('y1', entry[1]); ghost.setAttribute('x2', tips[1][0]); ghost.setAttribute('y2', tips[1][1]); }
    pool.setAttribute('opacity', '0'); pop.setAttribute('opacity', '0');
    cancelAnimationFrame(raf);
    if (i === 0) { cur = null; return; }
    const target = tips[i];
    if (!cur || reducedMotion()) { cur = target; place(target); finish(i); return; }
    const start = performance.now(), from = cur;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      cur = from; place(target, e);
      if (t < 1) raf = requestAnimationFrame(tick); else { cur = target; finish(i); }
    };
    raf = requestAnimationFrame(tick);
  }
  function finish(i) {
    if (i === 3) {
      pool.setAttribute('cx', tips[3][0] + 4); pool.setAttribute('cy', tips[3][1] + 5); pool.setAttribute('opacity', '1');
      pop.setAttribute('x', 214); pop.setAttribute('y', tpTop + 92); pop.setAttribute('opacity', '1');
    }
  }
  return { svg, show };
}

export function renderLandmark(sec) {
  sec.append(el('p', { class: 'tb-eyebrow', text: 'Back · Thoracic paravertebral' }));
  sec.append(el('h2', { id: 'pvblm-h', text: 'Thoracic paravertebral block: landmark technique' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), `The classic technique without ultrasound, from the teaching slides.${D} Step through it below. The ultrasound approaches (<a href="#ch-pvb">sagittal</a> and <a href="#ch-pvbt">transverse</a>) let you see the pleura move; this one relies on depth and feel.`));
  const fig = landmarkFigure();
  const wrap = el('figure', { class: 'bk-lm', id: 'pvblm-fig' });
  const stage = el('div', { class: 'bk-fig-stage bk-fig-stage--wide', tabindex: '0', role: 'region', 'aria-label': 'Landmark technique diagram (scrolls sideways on small screens)' }, fig.svg);
  const list = el('ol', { class: 'tb-scan-steps bk-lm-steps', 'aria-label': 'Steps' });
  const text = el('div', { class: 'tb-scan-text bk-lm-text', 'aria-live': 'polite' });
  let cur = 0;
  const btns = LM_STEPS.map((s, i) => {
    const b = el('button', { type: 'button', class: 'tb-scan-step', id: `pvblm-step-${i + 1}`, dataset: { activate: '1', scrollTo: 'pvblm-fig' }, on: { click: () => go(i) } },
      el('span', { class: 'tb-scan-step-n', 'aria-hidden': 'true', text: String(i + 1) }), el('span', { text: s.short }));
    list.append(el('li', {}, b));
    return b;
  });
  const prev = el('button', { type: 'button', class: 'tb-btn', text: 'Back', on: { click: () => go(Math.max(0, cur - 1)) } });
  const next = el('button', { type: 'button', class: 'tb-btn tb-btn--primary', text: 'Next', on: { click: () => go(Math.min(LM_STEPS.length - 1, cur + 1)) } });
  function go(i) {
    cur = i;
    btns.forEach((b, k) => { b.setAttribute('aria-current', k === i ? 'step' : 'false'); b.classList.toggle('is-done', k < i); });
    text.innerHTML = '';
    text.append(el('p', { class: 'tb-scan-text-k', text: `Step ${i + 1} of ${LM_STEPS.length} · ${LM_STEPS[i].title}` }));
    text.append(fill(el('div', { class: 'tb-scan-text-b' }), `<p>${LM_STEPS[i].body}</p>`));
    prev.disabled = i === 0; next.disabled = i === LM_STEPS.length - 1;
    fig.show(i);
    // On narrow screens the figure scrolls sideways: keep the part that matters for this step in view.
    if (stage.scrollWidth > stage.clientWidth + 4) stage.scrollTo({ left: i === 0 ? 0 : stage.scrollWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(LM_STEPS.length - 1, cur + 1)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, cur - 1)); }
  });
  const panel = el('div', { class: 'bk-lm-panel' }, list, text, el('div', { class: 'tb-scan-nav bk-lm-nav' }, prev, next));
  wrap.append(el('div', { class: 'bk-lm-grid' }, scrollWrap(stage), panel), el('figcaption', { class: 'bk-fig-note', text: 'Schematic parasagittal section through the skin mark, cranial on the left. Not to scale.' }));
  sec.append(wrap);
  go(0);
  // the teaching slides' values and the cited variation
  sec.append(el('h3', { id: 'pvblm-notes', text: 'Notes' }));
  sec.append(fill(el('ul', { class: 'bk-list' }), `<li>Dose as for the ultrasound approaches: <strong>20 ml of 0.3–0.5% ropivacaine</strong>.${D} (The teaching slide reads “0.3–5%”; we have assumed 0.3–0.5% pending the slides’ owner’s confirmation.)</li><li>Some descriptions mark 2.5–3 cm lateral to the spinous process and walk off caudally, also stopping within 1.5 cm.${cite('batra2011')}</li><li><strong>Finding the mark by feel:</strong> put your middle finger on the tip of the spinous process; the finger beside it, on the side to be blocked, marks the entry point about 2 cm lateral. The transverse process is usually 3–4 cm deep and the space about 1 cm beyond it.${N} Measure the depth on ultrasound first if you can.</li><li><strong>Note the depth of the transverse process</strong> before you walk off: it tells you where to stop.${N}</li><li>A sudden, <strong>complete</strong> loss of resistance, rather than a subtle give, suggests the needle has entered the pleura.${N}</li><li>Failed block was about 1 in 10, and pneumothorax 0.5%, in a prospective series of landmark blocks.${cite('lonnqvist1995')} See the <a href="#pvb-complications">complications list</a>.</li><li>Keep the total dose within the maximum for the patient’s weight, especially with bilateral blocks.</li>`));
  registerSearch([{ title: 'Landmark paravertebral technique', text: 'tuohy loss of resistance 2 cm lateral spinous process 4 cm transverse process walk off 1.5 cm pop sctl finger', id: 'pvblm-fig' }]);
}

// ---------------------------------------------------------------- levels (teaching slide 147)
export function renderLevels(sec) {
  sec.append(el('h2', { id: 'levels-h', text: 'Which level for which operation' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), `The teaching slides’ table of levels to block from the back, with the level for a single shot.${D} Use it for paravertebral blocks, and as a guide to where to aim an erector spinae plane block.`));
  sec.append(table({
    id: 'levels-table',
    caption: 'Levels to block and single-shot level (teaching slide 147)',
    head: ['Operation', 'Levels to block', 'Single-shot level'],
    rows: [
      [{ th: true, html: 'Sternotomy' }, 'T2–T6 bilaterally', 'T4'],
      [{ th: true, html: 'Mastectomy' }, 'T2–T6', 'T4'],
      [{ th: true, html: 'Thoracotomy, VATS' }, 'T2–T9', 'T5–T6'],
      [{ th: true, html: 'Rib fractures' }, 'Level of the fracture', 'Level of the fracture'],
      [{ th: true, html: 'Hepatectomy, upper abdominal' }, 'T6–T10 bilaterally', 'T8'],
      [{ th: true, html: 'Nephrectomy' }, 'T8–T12', 'T10'],
      [{ th: true, html: 'Lower midline, hemicolectomy' }, 'T8–T12 bilaterally', 'T10'],
      [{ th: true, html: 'Open inguinal hernia' }, 'T10–L2', 'T11–L1'],
    ],
  }));
  sec.append(callout('warn', { title: 'Bilateral blocks', body: '<p>“Bilaterally” means two injections and twice the dose. Keep the total dose within the maximum for the patient’s weight. Bilateral paravertebral blocks block the sympathetic chain on both sides: watch the blood pressure.</p>' }));
  sec.append(fill(el('p', { class: 'bk-note' }), 'For abdominal wall alternatives see the <a href="../abdominal-wall/">abdominal wall page</a>; for chest wall alternatives (serratus, PECS) see the <a href="../chest-wall/">chest wall page</a>. The <a href="../">truncal blocks landing page</a> has a chooser across all three pages.'));
}

// ---------------------------------------------------------------- related blocks (brief; department teaching notes)
export function renderRelated(sec) {
  sec.append(el('h2', { id: 'related-h', text: 'Related blocks and alternatives' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), `Other ways to cover the chest wall from the back or the side, in brief. These blocks have no scan viewer on this page.${N}`));

  sec.append(el('h3', { id: 'related-tea', text: 'Thoracic epidural' }));
  sec.append(fill(el('ul', { class: 'bk-list' }), `<li>The traditional gold standard for open thoracotomy, and the regional technique with the longest evidence for rib fractures.${N}</li><li>Blocks both sides, so hypotension is more common; it needs high-dependency monitoring.${N} Compared with a thoracic epidural, a paravertebral block causes less hypotension and urinary retention.${cite('feray2022')}</li><li>For VATS, the PROSPECT guideline recommends a paravertebral or erector spinae plane block as first choice and a serratus anterior plane block as second choice; it does not recommend a thoracic epidural.${cite('feray2022')}</li><li>For rib fractures, paravertebral, erector spinae plane, intercostal and serratus anterior blocks or catheters may work as well as an epidural in suitable patients, with fewer and less serious complications.${N}</li>`));

  sec.append(el('h3', { id: 'related-icnb', text: 'Intercostal nerve block' }));
  sec.append(fill(el('ul', { class: 'bk-list' }), `<li>The intercostal nerve runs under its rib with the vein and artery: <strong>vein, artery, nerve</strong> from top to bottom, so the nerve is lowest. Lateral to the angle of the rib it lies between the internal and innermost intercostal muscles.${N}</li><li><strong>Where:</strong> lateral to the angle of the rib (about 7 cm from the midline), where the groove is deepest, and proximal to the mid-axillary line, before the lateral cutaneous branch leaves. Medial to the angle there is only the internal intercostal membrane, with no internal intercostal muscle.${N}</li><li><strong>How:</strong> linear probe parasagittal over the ribs; in-plane, caudal to cranial; tip in the internal intercostal muscle, above the pleura. Each level needs its own injection (the teaching notes give 2–5 ml per level).${N}</li><li><strong>Watch:</strong> systemic absorption is high, so add up the dose across levels; pneumothorax (under 1%). Surgeons often do it under direct vision during VATS.${N}</li>`));

  sec.append(el('h3', { id: 'related-itp', text: 'Intertransverse process and other “paravertebral by proxy” blocks' }));
  sec.append(fill(el('ul', { class: 'bk-list' }), `<li>These put the local anaesthetic <strong>behind</strong> the SCTL and rely on it reaching the paravertebral space: away from the pleura, so felt to be safer than a paravertebral block.${N}</li><li><strong>MTP (intertransverse process) block:</strong> see the <a href="#esp-mtp">MTP variant</a>.</li><li><strong>Retrolaminar block</strong> belongs to the same group.${N}</li><li><strong>Thoracolumbar interfascial plane (TLIP) block:</strong> a more targeted block than ESP for lumbar spine surgery. Classic (medial) approach: between multifidus and longissimus. Modified (lateral) approach: between longissimus and iliocostalis.${N}</li>`));

  sec.append(el('h3', { id: 'related-ipb', text: 'Interpleural block' }));
  sec.append(fill(el('ul', { class: 'bk-list' }), `<li>Local anaesthetic between the parietal and visceral pleura, giving a one-sided block over several thoracic dermatomes.${N}</li><li>The space is found by its <strong>negative pressure</strong>: for example a hanging drop drawn in, a falling column of fluid, or an air-filled syringe plunger drawn in.${N}</li>`));

  sec.append(fill(el('p', { class: 'bk-note' }), 'Serratus anterior and PECS blocks are on the <a href="../chest-wall/">chest wall page</a>.'));
  registerSearch([
    { title: 'Thoracic epidural vs back blocks', text: 'epidural TEA PROSPECT VATS rib fractures hypotension urinary retention', id: 'related-tea' },
    { title: 'Intercostal nerve block', text: 'intercostal ICNB angle of rib vein artery nerve VAN costal groove innermost', id: 'related-icnb' },
    { title: 'Intertransverse process blocks', text: 'ITP MTP retrolaminar TLIP thoracolumbar interfascial multifidus longissimus iliocostalis paravertebral by proxy', id: 'related-itp' },
    { title: 'Interpleural block', text: 'interpleural intrapleural negative pressure hanging drop', id: 'related-ipb' },
  ]);
}
