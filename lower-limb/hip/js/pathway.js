// Hip page: the hip fracture pathway chapter (emergency department to ward), with an interactive fracture chooser.
// Original schematic drawing of the proximal femur (SVG). No citations on the page; sources are in the notes file.
import { el, sv, fill, keyPoints, callout, table, steps, registerSearch } from '../../../shared/regional/js/ui.js';

const FRACTURES = [
  {
    id: 'intra-d', short: 'Displaced intracapsular', zone: 'neck',
    title: 'Displaced intracapsular (Garden III–IV)',
    op: 'Arthroplasty: cemented hemiarthroplasty, or total hip arthroplasty for fit, independently mobile patients.',
    incision: 'Anterolateral (lateral thigh, LFCN territory) or posterior (buttock).',
    block: '<a href="#ch-peng">PENG</a> + <a href="#ch-lfcn">LFCN</a> (joint + incision, quadriceps spared), or <a href="#ch-fib">supra-inguinal fascia iliaca</a>. Posterior approach: ask for surgical infiltration of the posterior capsule and wound.',
    note: 'Cemented stem: plan for bone cement implantation syndrome.',
  },
  {
    id: 'intra-u', short: 'Undisplaced intracapsular', zone: 'neck',
    title: 'Undisplaced intracapsular (Garden I–II)',
    op: 'Internal fixation (cannulated screws or a sliding hip screw), or arthroplasty in some older patients.',
    incision: 'Small lateral thigh incision below the trochanter.',
    block: '<a href="#ch-fib">Supra-inguinal fascia iliaca</a> (femoral + LFCN), or PENG + LFCN. Pain after fixation is often modest.',
    note: '',
  },
  {
    id: 'inter', short: 'Intertrochanteric', zone: 'troch',
    title: 'Intertrochanteric (trochanteric, above and including the lesser trochanter)',
    op: 'Sliding hip screw (extramedullary) for most; intramedullary nail for reverse oblique patterns.',
    incision: 'Lateral thigh, over and below the greater trochanter.',
    block: '<a href="#ch-fib">Supra-inguinal fascia iliaca</a> covers the lateral thigh and much of the femur. Before surgery, a 20 ml <a href="#ch-peng">PENG</a> also eases pain on movement (fluid can spread down over the front of the joint).',
    note: 'Extracapsular fractures bleed more than intracapsular ones.',
  },
  {
    id: 'sub', short: 'Subtrochanteric', zone: 'sub',
    title: 'Subtrochanteric (within about 5 cm below the lesser trochanter)',
    op: 'Intramedullary nail.',
    incision: 'Above the greater trochanter for the entry point, plus stab incisions down the lateral thigh for locking screws.',
    block: '<a href="#ch-fib">Supra-inguinal fascia iliaca</a> or <a href="#ch-femoral">femoral nerve block</a> (femoral shaft); PENG alone is not enough.',
    note: 'Expect more blood loss and a longer operation.',
  },
];

function femurFigure() {
  const svg = sv('svg', { viewBox: '0 0 300 360', class: 'hp-fig-svg hp-femur-svg', role: 'img', 'aria-labelledby': 'hp-fem-t hp-fem-d' });
  sv('title', { id: 'hp-fem-t', text: 'Proximal femur: where the fracture is' }, svg);
  sv('desc', { id: 'hp-fem-d', text: 'Front view of the right proximal femur, lateral on the left. The dashed line is the capsule, attached along the intertrochanteric line. Fractures inside it are intracapsular (femoral neck); between the trochanters, intertrochanteric; below the lesser trochanter, subtrochanteric. The highlighted zone changes with the fracture chosen.' }, svg);
  const g = sv('g', {}, svg);
  // acetabulum hint
  sv('path', { d: 'M150 18 C200 10 252 30 270 70', fill: 'none', stroke: '#9c8a64', 'stroke-width': 3 }, g);
  // femur outline (head medial = right)
  const femur = 'M206 46 C238 46 258 74 252 102 C248 122 232 134 214 136 C200 150 180 168 166 180 C164 200 166 214 172 226 C174 254 166 290 160 350 L102 350 C98 300 96 250 94 210 C82 196 70 172 64 140 C60 116 70 96 88 92 C104 88 116 98 124 112 C140 116 160 116 176 106 C176 76 186 50 206 46 Z';
  sv('path', { d: femur, fill: '#efe5cf', stroke: '#8f8574', 'stroke-width': 1.6 }, g);
  // zones (highlightable)
  const zones = {
    neck: 'M176 106 C190 96 210 98 222 112 C224 126 216 134 214 136 C200 150 184 164 168 176 C160 166 156 150 160 134 C162 122 168 112 176 106 Z',
    troch: 'M124 112 C140 116 160 116 176 106 C168 120 160 140 164 166 L166 180 C164 200 166 214 172 226 L100 226 C90 200 76 176 70 150 C74 128 98 108 124 112 Z',
    sub: 'M100 226 L172 226 C174 254 168 280 164 300 L98 300 C96 276 96 250 100 226 Z',
  };
  const zEls = {};
  for (const [k, d] of Object.entries(zones)) zEls[k] = sv('path', { d, class: `hp-fz hp-fz--${k}`, fill: 'rgba(161,42,28,0)', stroke: 'none' }, g);
  // capsule (dashed), attached along the intertrochanteric line in front
  sv('path', { d: 'M150 60 C150 90 154 116 160 130 C164 150 166 170 168 182 C190 168 214 150 238 128 C262 110 262 70 240 50', fill: 'none', stroke: '#633d3c', 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, g);
  // trochanters
  sv('circle', { cx: 176, cy: 214, r: 9, fill: '#e3d6bb', stroke: '#8f8574' }, g); // lesser (medial)
  const t = sv('g', { 'font-family': 'NTF Sans, Inter, sans-serif', 'font-size': 14, fill: '#272722' }, svg);
  sv('text', { x: 230, y: 92, 'text-anchor': 'middle', text: 'Head' }, t);
  sv('text', { x: 8, y: 62, text: 'Greater' }, t); sv('text', { x: 8, y: 78, text: 'trochanter' }, t);
  sv('text', { x: 192, y: 232, text: 'Lesser' }, t); sv('text', { x: 192, y: 248, text: 'trochanter' }, t);
  sv('text', { x: 246, y: 160, fill: '#633d3c', 'font-size': 13, text: 'Capsule' }, t);
  sv('text', { x: 8, y: 352, 'font-family': 'NTF Mono, JetBrains Mono, monospace', 'font-size': 12.5, fill: '#55534d', text: 'LATERAL' }, svg);
  return { svg, zEls };
}

function chooser() {
  const wrap = el('figure', { class: 'hp-fx', id: 'hp-fx' });
  wrap.append(el('p', { class: 'hp-fig-title', text: 'Pick the fracture: operation, incision, block' }));
  const { svg, zEls } = femurFigure();
  const seg = el('div', { class: 'hp-fx-seg', role: 'group', 'aria-label': 'Fracture type' });
  const out = el('div', { class: 'hp-fx-out', 'aria-live': 'polite' });
  const btns = FRACTURES.map((f) => {
    const b = el('button', { type: 'button', class: 'tb-seg-btn', 'aria-pressed': 'false', id: `hp-fx-${f.id}`, 'data-activate': '1', 'data-scroll-to': 'hp-fx', text: f.short });
    b.addEventListener('click', () => pick(f.id));
    seg.append(b);
    return b;
  });
  function pick(id) {
    const f = FRACTURES.find((x) => x.id === id) || FRACTURES[0];
    btns.forEach((b, i) => b.setAttribute('aria-pressed', FRACTURES[i].id === f.id ? 'true' : 'false'));
    Object.entries(zEls).forEach(([k, p]) => p.classList.toggle('is-on', k === f.zone));
    out.replaceChildren();
    out.append(el('p', { class: 'hp-fx-title', text: f.title }));
    const dl = el('dl', { class: 'hp-fx-dl' });
    [['Operation', f.op], ['Incision', f.incision], ['Block', f.block], ...(f.note ? [['Also', f.note]] : [])]
      .forEach(([k, v]) => dl.append(el('div', {}, el('dt', { text: k }), fill(el('dd'), v))));
    out.append(dl);
  }
  const grid = el('div', { class: 'hp-fx-grid' }, el('div', { class: 'hp-fig-stage hp-fx-fig' }, svg), el('div', {}, seg, out));
  wrap.append(grid, fill(el('figcaption'), 'Schematic. Intracapsular fractures can disrupt the blood supply to the head (hence arthroplasty when displaced); extracapsular fractures heal well with fixation but bleed more.'));
  pick('intra-d');
  return wrap;
}

export function renderPathway(sec) {
  sec.append(el('h2', { id: 'hp-path-h', text: 'Hip fracture: the regional pathway' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'From the emergency department to the ward: when to block, which block for which operation, and how blocks fit with spinal anaesthesia, delirium prevention and early walking.'));
  sec.append(keyPoints([
    'Treat pain <strong>immediately</strong> on arrival, including in people with dementia. Reassess within 30 minutes.',
    'Offer a <strong>nerve block in the emergency department</strong> (fascia iliaca or femoral) and again <strong>at surgery</strong> if at least 6 hours have passed.',
    'A block <strong>before positioning</strong> for spinal reduces the need for sedation and IV opioid.',
    'Blocks reduce pain on movement, <strong>delirium</strong> and probably chest infection. They are not a substitute for early surgery (day of or day after admission).',
    'Match the block to the operation: <strong>arthroplasty → PENG + LFCN</strong> (or fascia iliaca); <strong>fixation → fascia iliaca</strong>.',
  ]));

  sec.append(el('h3', { id: 'hp-path-steps', text: 'Step by step' }));
  sec.append(steps([
    { title: 'Emergency department', body: '<p>Regular paracetamol, titrated opioid, and a <strong>fascia iliaca block</strong> (supra- or infra-inguinal) or <strong>femoral nerve block</strong> by trained staff, ideally with ultrasound. Assess pain on movement, not only at rest; in dementia use an observational pain score. NSAIDs are best avoided in frail older patients.</p>' },
    { title: 'Before theatre', body: '<p>Correct what can be corrected quickly (fluids, electrolytes, anaemia, anticoagulation) without delaying surgery. On an anticoagulant or antiplatelet drug, choose the block by depth and compressibility: femoral and infra-inguinal fascia iliaca are superficial and compressible; the supra-inguinal approach and PENG are deeper and need more thought; spinal and lumbar plexus blocks follow the neuraxial timings (ASRA and European guidance). Check when the first block was given and how much local anaesthetic it used: count it towards the total.</p>' },
    { title: 'Positioning for spinal', body: '<p>Give (or repeat) the block <strong>20–30 minutes before</strong> moving the patient. Sitting, or lateral with the fractured side down for a unilateral hyperbaric spinal, both become tolerable. If more is needed, a small titrated dose of a short-acting analgesic is better than heavy sedation.</p>' },
    { title: 'In theatre', body: '<p>Spinal or general anaesthesia (the outcomes are similar; offer a choice), with <strong>age-appropriate, lower doses</strong>, a nerve block, minimal or no sedation and careful blood pressure control. For a cemented stem, brief the team about cementing.</p>' },
    { title: 'After', body: '<p>Paracetamol, opioid rescue, and a plan for when the block wears off. Mobilise on the day after surgery: a motor-sparing block (PENG + LFCN) helps; after a fascia iliaca or femoral block, check quadriceps strength before standing. Continuous catheters are rarely needed and may slow mobilisation.</p>' },
  ]));

  sec.append(el('h3', { id: 'hp-path-choose', text: 'Which block for which fracture' }));
  sec.append(chooser());

  sec.append(el('h3', { id: 'hp-path-fixarth', text: 'Fixation or arthroplasty: why it matters for the block' }));
  sec.append(table({
    head: ['', 'Arthroplasty (displaced intracapsular)', 'Fixation (extracapsular, undisplaced)'],
    rows: [
      [{ th: true, html: 'Main pain' }, 'Capsule and joint; lateral or posterior wound', 'Lateral thigh wound, femur, fracture site below the capsule'],
      [{ th: true, html: 'Best fit' }, 'PENG + LFCN; fascia iliaca as an alternative', 'Supra-inguinal fascia iliaca (femoral + LFCN)'],
      [{ th: true, html: 'Quadriceps' }, 'Spared with PENG + LFCN', 'Weak with fascia iliaca or femoral'],
      [{ th: true, html: 'Watch for' }, 'Bone cement implantation syndrome', 'Blood loss (nails, subtrochanteric)'],
    ],
  }));

  sec.append(el('h3', { id: 'hp-path-evidence', text: 'Delirium, opioids and outcomes' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<ul>
<li><strong>Nerve blocks versus none</strong> (a large systematic review of randomised trials): less pain on movement within 30 minutes (about 2.5 points on a 0–10 scale), <strong>less delirium</strong> (about 1 case prevented for every 12 patients blocked), probably <strong>less chest infection</strong> (about 1 in 7) and earlier first mobilisation. No proven effect on death or myocardial infarction, because the trials were too small to show one.</li>
<li><strong>Delirium prophylaxis:</strong> in one trial, a fascia iliaca block on admission reduced delirium in patients at intermediate risk, though not in the highest-risk group.</li>
<li><strong>Spinal or general?</strong> A large North American trial found no difference in death or inability to walk at 60 days, or in delirium. Choose by the patient; what matters is good technique, low doses, avoiding hypotension, and a block either way.</li>
<li><strong>Opioid sparing</strong> matters most in the frail: opioids add to delirium, constipation, nausea and falls.</li>
</ul>`));

  sec.append(callout('warn', {
    title: 'Bone cement implantation syndrome',
    body: '<p>After cemented hemiarthroplasty, about 1 in 5 patients have some cardiorespiratory upset, about 1 in 50 a severe reaction and about 1 in 200 a cardiac arrest. Identify high-risk patients (frail, poor heart function, pulmonary hypertension), agree roles at the team brief, and watch the blood pressure closely at cementing, with vasopressor ready. The surgeon washes and dries the canal and uses a cement gun with retrograde filling.</p>',
  }));

  sec.append(callout('note', {
    title: 'Guidance in brief',
    body: '<p>The 2020 Association of Anaesthetists guideline recommends single-shot nerve blocks in the emergency department and at surgery (at least 6 hours apart), femoral or fascia iliaca blocks (the latter possibly better for the incision), ultrasound guidance, and routine use of blocks with spinal or general anaesthesia. It judged pericapsular techniques (including PENG) not yet formally assessed in hip fracture and suggested them for posterior approaches; trials since have compared PENG favourably with fascia iliaca and femoral blocks. NICE advises surgery on the day of or the day after admission, cemented implants for arthroplasty, a sliding hip screw for most trochanteric fractures and a nail for subtrochanteric ones.</p>',
  }));

  sec.append(el('h3', { id: 'hp-path-exam', text: 'Exam corner' }));
  const box = el('div', { class: 'tb-exam' });
  [
    {
      source: 'Practice question',
      q: '<p>An 80-year-old woman is admitted with a fractured neck of femur after a fall. How would you optimise her pain before surgery?</p>',
      points: [
        'Assess pain on arrival, 30 minutes after analgesia, hourly until settled, then routinely; use an observational tool if cognitively impaired.',
        'Immediate analgesia even with dementia; enough to allow investigations and passive movement.',
        'Regular paracetamol; titrated opioid; a nerve block (fascia iliaca or femoral) by trained staff, ideally ultrasound-guided.',
        'Avoid NSAIDs in the frail older patient.',
        'Repeat the block at surgery if 6 hours or more have passed; count the total local anaesthetic dose.',
        'Do not let the block delay surgery: aim for the day of or after admission.',
      ],
    },
    {
      source: 'Practice question',
      q: '<p>Compare the PENG block and the supra-inguinal fascia iliaca block for a patient with a hip fracture.</p>',
      points: [
        'PENG: on bone under the psoas tendon between the AIIS and the IPE; femoral and accessory obturator articular branches; 20 ml; quadriceps usually spared; no skin.',
        'Supra-inguinal fascia iliaca: under fascia iliaca above the inguinal ligament, spreading into the iliac fossa; femoral nerve and LFCN; 40 ml; quadriceps weak; covers the anterior and lateral thigh skin.',
        'Analgesia before surgery: similar in trials.',
        'Choose PENG (+ LFCN) for arthroplasty and early walking; fascia iliaca for fixation, femoral shaft fractures, or one block to do everything.',
        'Neither reliably blocks the obturator nerve or the posterior capsule.',
      ],
    },
    {
      source: 'Practice question',
      q: '<p>After a cemented hemiarthroplasty under spinal, your patient becomes agitated in recovery and pulls out her cannula. How do you manage her?</p>',
      points: [
        'Safety first: call for help, protect the patient, ABC, oxygen; check glucose.',
        'Look for causes: hypoxia, hypotension, pain (is the block wearing off?), urinary retention, drugs (opioids, anticholinergics), sepsis, electrolytes, alcohol withdrawal, a new stroke; bone cement implantation syndrome if early.',
        'Use a delirium screen (for example 4AT); treat the cause; non-drug measures first (glasses, hearing aids, family, reorientation).',
        'Small dose of an antipsychotic only if dangerous and other measures fail; avoid benzodiazepines unless withdrawal.',
        'Prevention: good analgesia with blocks, opioid sparing, avoid deep sedation, early mobilisation, orthogeriatric care.',
      ],
    },
  ].forEach((q, i) => {
    const art = el('article', { class: 'tb-exam-q', id: `hp-path-exam-${i + 1}` });
    art.append(el('p', { class: 'tb-exam-src', text: q.source }), fill(el('div', { class: 'tb-exam-text' }), q.q));
    const d = el('details', { class: 'tb-details tb-exam-ans' });
    const ul = el('ul', { class: 'tb-exam-pts' }); q.points.forEach((p) => ul.append(fill(el('li'), p)));
    d.append(el('summary', { text: 'Model answer points' }), ul);
    art.append(d); box.append(art);
  });
  sec.append(box);

  registerSearch([
    { title: 'Fracture chooser: intracapsular, intertrochanteric, subtrochanteric', text: 'Garden displaced undisplaced intracapsular intertrochanteric subtrochanteric hemiarthroplasty total hip dynamic hip screw sliding hip screw DHS nail fixation', id: 'hp-fx' },
    { title: 'Bone cement implantation syndrome', text: 'BCIS cement cemented hemiarthroplasty arrest hypotension', id: 'hp-path-evidence' },
    { title: 'Delirium and nerve blocks', text: 'delirium confusion opioid sparing REGAIN spinal general', id: 'hp-path-evidence' },
  ]);
}
