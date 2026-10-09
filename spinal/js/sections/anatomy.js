// spinal/ — section 01 "Anatomy for neuraxial block".
// Figures are drawn by js/anatomy/* (sagittal plate, landmarks, baricity, dermatomes) using js/anatomy/kit.js.
import { el, callout, tier, keyPoints, segmented, figure, table, whenVisible, onResize, reducedMotion, onThemeChange, registerSearch } from '../ui.js?v=1';
import { createSagittal, drawInset, LAYERS, hitStep } from '../anatomy/sagittal.js';
import { buildLandmarksSVG, levelButtons, levelInfo, LEVELS } from '../anatomy/landmarks.js';
import { createBaricity } from '../anatomy/baricity.js';
import { buildDermSVG, STOPS } from '../anatomy/dermatomes.js';
import { buildVertebral, buildMeninges } from '../anatomy/structure.js';
import { buildFibres, buildHeights } from '../anatomy/fibres.js';
import { buildCsfFacts, buildPhysiology, buildSpread } from '../anatomy/physiology.js';

export const meta = { id: 'anatomy', prefix: 'an', title: 'Anatomy and physiology of neuraxial block' };

// No module-level references: only major guidelines are cited on this page.
export const refs = {};

// ------------------------------------------------------------------ layer content
const STEP = {
  skin: {
    name: 'Skin and subcutaneous fat',
    depth: 'Fat thickness is the main reason total depth varies.',
    feel: 'A little resistance at the skin, then soft, low resistance through fat.',
    why: 'Infiltrate local anaesthetic. In obesity the spinous processes are harder to feel and everything sits deeper.',
  },
  supra: {
    name: 'Supraspinous ligament',
    depth: 'Just deep to the fat, joining the tips of the spinous processes.',
    feel: 'Firm and gritty.',
    why: 'Often calcified in older patients, which makes the midline hard going. The paramedian approach avoids it.',
  },
  inter: {
    name: 'Interspinous ligament',
    depth: 'Fills the gap between neighbouring spinous processes.',
    feel: 'Steady, firm resistance. The needle is gripped and stays upright when you let go.',
    why: 'If the needle flops sideways you are probably off the midline, in fat or paraspinal muscle. Bone at a shallow depth is usually spinous process: withdraw and redirect.',
  },
  flavum: {
    name: 'Ligamentum flavum',
    depth: 'Typically about 4–6 cm from the skin in an adult of normal build; deeper with a higher BMI.',
    feel: 'Dense, leathery, often gritty. Resistance rises, then gives as the needle passes through.',
    why: 'This yellow, elastic ligament bridges the laminae. Passing it is the loss of resistance used to find the epidural space.',
  },
  epidural: {
    name: 'Epidural space',
    depth: 'Only a few millimetres deep in the lumbar midline.',
    feel: 'A give, or loss of resistance, as the needle leaves the flavum.',
    why: 'Contains fat, the valveless epidural venous plexus and nerve roots. Blood in the hub usually means a vein: reposition before going further.',
  },
  dura: {
    name: 'Dura and arachnoid',
    depth: 'Just beyond the epidural space.',
    feel: 'Often a distinct click or “pop”, clearer with a pencil-point needle.',
    why: 'The arachnoid lies against the dura; between them is a potential subdural space, one cause of a patchy block. The hole left in the dura is what causes post-dural puncture headache.',
  },
  csf: {
    name: 'Subarachnoid space (CSF)',
    depth: 'Below the conus it holds only CSF and the cauda equina roots.',
    feel: 'Free flow of clear CSF at the hub confirms the needle tip is in place.',
    why: 'The roots float and tend to move away from a blunt needle. Sharp pain or paraesthesia means stop and withdraw slightly; never inject while the patient reports pain.',
  },
  muscle: {
    name: 'Paraspinal muscle (paramedian)',
    depth: 'Entry about 1 cm lateral to the midline, often about 1 cm caudal, beside the lower spinous process of the space.',
    feel: 'Softer, less defined resistance than the midline ligaments.',
    why: 'The needle aims medially and cephalad, through erector spinae, so the supraspinous and interspinous ligaments are bypassed. In the sagittal figure the shaft is drawn faint where it lies lateral to the midline.',
  },
  lamina: {
    name: 'Lamina, then walk off it',
    depth: 'Bone at about the expected depth of the ligamentum flavum.',
    feel: 'Hard bony contact.',
    why: 'Contact with the lamina confirms depth. Walk the needle off its upper edge, cephalad and medially, into the interlaminar gap. Useful when the ligaments are calcified or the patient cannot flex.',
  },
};

// ------------------------------------------------------------------ mount
export function mount(root) {
  const rm = reducedMotion();
  const api = {};

  root.append(
    keyPoints([
      'Go in at L3–4 or L4–5, never higher than your best estimate of L3–4. The cord can end as low as L3, and the space you feel is often higher than the one you think.',
      'Midline path: skin, fat, supraspinous and interspinous ligaments, ligamentum flavum, dura, then CSF. Paramedian skips the two midline ligaments.',
      'Free-flowing clear CSF confirms the tip is in the right place. Pain or paraesthesia on insertion or injection: stop and withdraw. Blood or no CSF: reposition, do not inject.',
      'Adult cord ends at about L1 (T12 to L3). Dural sac ends at about S2. In a baby both end lower (cord about L3, sac about S3–S4).',
      'Block order: sympathetic, cold, pain, touch, motor. The sympathetic block is typically two or more segments above the pinprick level; cold reads about two segments above pinprick.',
      'Landmarks: T4 nipples, T6 xiphisternum, T10 umbilicus, L1 inguinal ligament, S2–S4 perineum. Hip and TURP need T10, Caesarean T4.',
      'Most effects come from sympathetic block: venodilatation, fall in pressure, slow heart rate, active gut, heat loss. The diaphragm is spared.',
      'Baricity and posture decide where the drug goes. Less lumbosacral CSF (obesity, pregnancy, raised abdominal pressure) gives a higher block from the same dose.',
    ]),
    el('p', { class: 'sp-lead', text: 'The spine and what the needle passes, where the cord and dural sac end, how to choose a level, how the drug spreads in CSF, the nerve fibres and dermatomes, and what the block does to the body.' }),
    el('ul', { class: 'sp-jump', html: '<li><a href="#an-vertebral">Spine and canal</a></li><li><a href="#an-layers">Layers</a></li><li><a href="#an-landmarks">Landmarks and levels</a></li><li><a href="#an-conus">Cord, meninges, blood supply</a></li><li><a href="#an-csf">CSF, baricity, spread</a></li><li><a href="#an-fibres">Fibres and regression</a></li><li><a href="#an-dermatomes">Dermatomes, myotomes, heights</a></li><li><a href="#an-physiology">Physiology of the block</a></li>' }),
  );

  root.append(buildVertebral());

  // ================================================================ 1. Layers
  const s1 = el('div', { class: 'an-sub', id: 'an-layers' });
  s1.append(el('h3', { text: 'Layers the needle passes' }));
  s1.append(tier(el('p', { class: 'sp-prose', html: 'Step through the layers of a midline spinal at L3–4. Switch to <strong>Paramedian</strong> to see the needle enter beside the midline and reach the ligamentum flavum without crossing the midline ligaments.' }), 1));

  const f1 = figure({ id: 'an-fig-layers', num: '1.1', aspect: 'auto', caption: 'Midline sagittal section of the lumbar spine, T12 to S3, approximately to scale. Head to the left, skin at the top. The inset is a transverse section through L3–4. Select a layer below, use the arrow keys, or tap the figure.' });
  const grid = el('div', { class: 'an-sag-grid' });
  const mainWrap = el('div', { class: 'an-sag-main' });
  const cv = el('canvas', { role: 'img', 'aria-label': 'Sagittal section of the lumbar spine with a spinal needle at L3–4.' });
  mainWrap.append(cv);
  const insetWrap = el('div', { class: 'an-sag-inset' });
  const cvi = el('canvas', { role: 'img', 'aria-label': 'Transverse section at L3–4 comparing midline and paramedian needle paths.' });
  insetWrap.append(cvi);
  grid.append(mainWrap, insetWrap);
  f1.stage.append(grid);
  const sag = createSagittal(cv);

  let mode = 'midline', step = 0;
  const seg = segmented([{ value: 'midline', label: 'Midline' }, { value: 'paramedian', label: 'Paramedian' }], { label: 'Approach', value: 'midline', onChange: (v) => setMode(v) });
  seg.id = 'an-paramedian';
  f1.controls.append(seg);

  // stepper
  const stepper = el('div', { class: 'an-stepper', id: 'an-stepper' });
  const prev = el('button', { type: 'button', class: 'sp-btn an-step-prev', 'aria-label': 'Previous layer', html: '<span aria-hidden="true">←</span> Prev' });
  const next = el('button', { type: 'button', class: 'sp-btn sp-btn--primary an-step-next', 'aria-label': 'Next layer', html: 'Next <span aria-hidden="true">→</span>' });
  const count = el('span', { class: 'an-count', 'aria-hidden': 'true', text: '1 / 7' });
  const nav = el('div', { class: 'an-step-nav' }, prev, count, next);
  const list = el('ol', { class: 'an-steplist', 'aria-label': 'Layers, outside to inside' });
  const panel = el('div', { class: 'an-steppanel' });
  stepper.append(nav, el('div', { class: 'an-step-body' }, list, panel));

  function renderList() {
    list.textContent = '';
    LAYERS[mode].forEach((k, i) => {
      const b = el('button', { type: 'button', class: 'an-stepbtn', id: `an-layer-${k}`, 'aria-current': i === step ? 'step' : null },
        el('span', { class: 'an-stepnum', 'aria-hidden': 'true', text: String(i + 1) }), el('span', { text: STEP[k].name }));
      b.addEventListener('click', () => go(i, true));
      list.append(el('li', {}, b));
    });
  }
  const panels = {};
  Object.keys(STEP).forEach((k) => {
    const d = STEP[k];
    const pn = el('div', { class: 'an-steppane', dataset: { key: k }, hidden: true },
      el('p', { class: 'an-stepkicker' }),
      el('p', { class: 'an-stepname', text: d.name }),
      el('dl', { class: 'an-stepdl' },
        el('dt', { text: 'Where' }), el('dd', { text: d.depth }),
        el('dt', { text: 'What you feel' }), el('dd', { text: d.feel }),
        el('dt', { text: 'Why it matters' }), el('dd', { text: d.why })));
    panels[k] = pn;
    panel.append(pn);
  });
  function renderPanel() {
    const k = LAYERS[mode][step];
    Object.entries(panels).forEach(([key, pn]) => { pn.hidden = key !== k; });
    panels[k].querySelector('.an-stepkicker').textContent = `Layer ${step + 1} of 7 · ${mode === 'midline' ? 'Midline' : 'Paramedian'}`;
  }
  function sync(focusBtn, instant) {
    renderList(); renderPanel();
    count.textContent = `${step + 1} / 7`;
    const ae = document.activeElement;
    if (step === 6 && ae === next) prev.focus();
    if (step === 0 && ae === prev) next.focus();
    prev.disabled = step === 0; next.disabled = step === 6;
    const k = LAYERS[mode][step], d = STEP[k];
    const text = `Layer ${step + 1} of 7: ${d.name}. ${d.feel}`;
    f1.describe(text);
    cv.setAttribute('aria-label', `Sagittal section of the lumbar spine. ${mode === 'midline' ? 'Midline' : 'Paramedian'} needle at L3–4, tip in: ${d.name}.`);
    sag.set(mode, step, instant || rm);
    drawInsetNow();
    const act = list.children[step];
    if (act && list.scrollWidth > list.clientWidth + 2) list.scrollLeft = Math.max(0, act.offsetLeft - list.offsetLeft - 16);
    if (focusBtn) act?.firstChild?.focus({ preventScroll: true });
    return text;
  }
  // The figure's describe() region is aria-live, so it carries the announcement (no second announce()).
  function go(i, fromUser, focus = false) {
    step = Math.max(0, Math.min(6, i));
    sync(focus);
  }
  function setMode(v) {
    mode = v; seg.set(v);
    const t = sync(false);
    f1.describe(`${v === 'midline' ? 'Midline' : 'Paramedian'} approach. ${t}`);
  }
  prev.addEventListener('click', () => go(step - 1, true));
  next.addEventListener('click', () => go(step + 1, true));
  stepper.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const inList = list.contains(document.activeElement);
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !inList) return;
    e.preventDefault();
    const d = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
    go(step + d, true, inList);
  });
  cv.addEventListener('click', (e) => {
    const r = cv.getBoundingClientRect();
    const [x, y] = sag.toLogical(e.clientX - r.left, e.clientY - r.top);
    const i = hitStep(x, y);
    if (i >= 0) go(i, true);
  });
  cv.addEventListener('pointermove', (e) => {
    const r = cv.getBoundingClientRect();
    const [x, y] = sag.toLogical(e.clientX - r.left, e.clientY - r.top);
    cv.style.cursor = hitStep(x, y) >= 0 ? 'pointer' : 'default';
  });

  function drawInsetNow() { const w = insetWrap.clientWidth; if (w > 0) drawInset(cvi, w, mode, LAYERS[mode][step]); }
  let shown = false;
  const layout = () => { const w = mainWrap.clientWidth; if (w > 0) sag.resize(w); drawInsetNow(); };
  onResize(grid, layout);
  whenVisible(f1.fig, () => { if (shown) return; shown = true; layout(); sag.fadeIn(rm); });
  onThemeChange(layout);

  tier(f1.fig, 1); tier(stepper, 1);
  s1.append(f1.fig, stepper);
  sync(false, true);

  s1.append(
    tier(el('div', { class: 'an-feel', id: 'an-feel' },
      el('h4', { text: 'Ligaments and layers in the order the needle meets them' }),
      table({
        caption: 'Midline spinal, outside in',
        head: ['Layer', 'What you feel', 'What to do'],
        rows: [
          [{ html: 'Skin and fat', th: true }, 'Slight resistance at the skin, then soft', 'Infiltrate. Keep the introducer upright and in the midline.'],
          [{ html: 'Supraspinous ligament', th: true }, 'Firm, gritty', 'Advance slowly.'],
          [{ html: 'Interspinous ligament', th: true }, 'Steady, firm. The needle stands up by itself', 'If it flops sideways you are off the midline.'],
          [{ html: 'Ligamentum flavum', th: true }, 'Dense, leathery. Resistance rises, then gives', 'Advance a millimetre or two at a time.'],
          [{ html: 'Epidural space', th: true }, 'A give', 'Blood in the hub: reposition.'],
          [{ html: 'Dura and arachnoid', th: true }, 'Often a click or pop', 'Remove the stylet and watch the hub.'],
          [{ html: 'Subarachnoid space', th: true }, 'Nothing: CSF appears at the hub', 'Free flow of clear CSF: attach the syringe, aspirate, inject slowly.'],
        ],
      }),
      tier(el('p', { class: 'sp-prose', html: '<strong>Ligament facts.</strong> The supraspinous ligament joins the tips of the spinous processes (thin in the lumbar spine, and may calcify). The interspinous ligament is a thin sheet between them. The ligamentum flavum is a yellow elastic ligament joining the laminae, thickest in the lumbar region; its two halves meet in the midline and may leave a small gap.' }), 2),
      el('p', { class: 'sp-prose', html: '<strong>Bone early:</strong> withdraw and redirect. <strong>Bone deep:</strong> note the depth, then walk off the lamina. <strong>Blood or no CSF:</strong> reposition, do not inject. <strong>Pain or paraesthesia:</strong> stop and withdraw.' })), 1),
    tier(callout('key', { title: 'Depth', body: '<p>The skin-to-epidural distance is typically about <span class="sp-num">4–6 cm</span> in an adult of normal build and is mostly set by the thickness of subcutaneous fat. It can be much deeper with a high BMI, so a longer needle may be needed. The CSF lies only a few millimetres beyond the epidural space.</p>' }), 1),
    tier(el('div', {}, el('h4', { id: 'an-paramedian-h', text: 'Paramedian approach' }),
    el('p', { class: 'sp-prose', html: 'Enter beside the midline, near the lower spinous process of the chosen space, and aim medially and cephalad. The first ligament you meet is the ligamentum flavum. This helps when the midline ligaments are calcified, the patient cannot flex well or the midline gap is narrow. The entry point and angles are given once, with the practical steps, in <a href="#sx-paramedian">The paramedian approach</a>.' })), 2),
    tier(callout('pearl', { title: 'Calcified or rotated spine', body: '<p>When the midline will not open, the paramedian route works because the needle meets the ligamentum flavum from the side, where the gap between laminae is wider. Bone at the expected depth means you are on lamina; small changes in the cephalad angle, not more force, find the gap. Rotation or scoliosis moves the midline gap away from the spinous processes you can see, so palpate for the gap and expect to adjust the angle. Ultrasound can show the rotation and the best entry point before you start.</p>' }), 3),
  );
  root.append(s1);

  // ================================================================ 2. Landmarks and levels
  const s2 = el('div', { class: 'an-sub', id: 'an-landmarks' });
  s2.append(el('h3', { text: 'Surface landmarks and choosing a level' }));
  s2.append(tier(el('p', { class: 'sp-prose', html: 'Palpation is less accurate than most of us think. In an MRI study, anaesthetists named a marked lumbar space correctly only <span class="sp-num">29%</span> of the time; in <span class="sp-num">51%</span> the mark was one space higher than they believed, and the error ranged from one space below to four above. Accuracy was worse in obese patients and higher on the back. The cord itself can end as low as the upper third of L3, and conus injury has followed spinals that went in higher than the anaesthetist believed.' }), 2));

  const f2 = figure({ id: 'an-tuffier-fig', num: '1.2', plate: 'paper', aspect: 'auto', caption: 'Back view, schematic. Tuffier’s line joins the tops of the iliac crests. Choose a level to see what lies there; turn on the overlay to see where the conus and dural sac usually end.' });
  const land = buildLandmarksSVG();
  const landGrid = el('div', { class: 'an-land-grid' });
  const info = el('div', { class: 'an-land-info' });
  let curLevel = 'L3–4';
  const btns = levelButtons((id, sticky) => pickLevel(id, sticky));
  const ovBtn = el('button', { type: 'button', class: 'sp-btn an-ov-btn', 'aria-pressed': 'true', text: 'Conus and dural sac overlay' });
  ovBtn.addEventListener('click', () => { const on = ovBtn.getAttribute('aria-pressed') !== 'true'; ovBtn.setAttribute('aria-pressed', String(on)); land.overlay.style.display = on ? '' : 'none'; });
  landGrid.append(el('div', { class: 'an-land-art' }, land.svg), el('div', { class: 'an-land-side' }, el('p', { class: 'an-land-label', id: 'an-land-label', text: 'Level' }), btns, info));
  btns.setAttribute('aria-labelledby', 'an-land-label');
  f2.stage.append(landGrid);
  f2.controls.append(ovBtn);
  const infoPanes = {};
  LEVELS.forEach((l) => {
    const pn = el('div', { class: 'an-land-pane', hidden: true, html: `<p class="an-land-lvl">${l.id}</p><p>${levelInfo(l.id)}</p>` });
    infoPanes[l.id] = pn; info.append(pn);
  });
  function pickLevel(id, sticky) {
    if (sticky) curLevel = id;
    const l = LEVELS.find((q) => q.id === id);
    const h = l.kind === 'body' ? 28 : 20;
    land.hl.setAttribute('y', l.y - h / 2); land.hl.setAttribute('height', h);
    btns.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.level === id ? 'true' : 'false'));
    Object.entries(infoPanes).forEach(([k, pn]) => { pn.hidden = k !== id; });
    f2.describe(`${id}: ${infoPanes[id].textContent.slice(id.length).replace(/\[\d+(,\s*\d+)*\]/g, '')}`);
  }
  land.bands.addEventListener('pointerover', (e) => { const id = e.target.dataset?.level; if (id) pickLevel(id, false); });
  land.bands.addEventListener('pointerleave', () => pickLevel(curLevel, false));
  land.bands.addEventListener('click', (e) => { const id = e.target.dataset?.level; if (id) pickLevel(id, true); });
  pickLevel('L3–4', true);
  tier(f2.fig, 2);
  s2.append(f2.fig);

  s2.append(
    tier(el('p', { class: 'sp-prose', id: 'an-tuffier', html: '<strong>Tuffier’s line</strong> (the intercristal line) is traditionally said to cross the L4 body or the L4–5 space. It is an unreliable guide to level: a starting point, not proof.' }), 1),
    tier(el('p', { class: 'sp-prose', html: 'Other landmarks: the posterior superior iliac spines (the dimples above the buttocks) lie at about S2; the 12th rib attaches to T12.' }), 2),
    tier(el('div', { id: 'an-surface-special' },
      el('h4', { text: 'Surface anatomy in the elderly and the obese' }),
      el('p', { class: 'sp-prose', html: 'In the obese, subcutaneous fat hides the spinous processes and the iliac crests. The midline can be found by the gluteal cleft and the vertebra prominens, and by feeling for the groove between the paraspinal muscles. Sit the patient up: the midline is easier to see and the fat falls away from it. Use a longer needle and expect a greater depth.' }),
      el('p', { class: 'sp-prose', html: 'In the elderly, ligaments are calcified, the spine is often kyphotic or scoliotic, and the interlaminar gaps are narrower. Flexion is limited, so the midline may be hard to open. The paramedian approach is often easier.' }),
      el('p', { class: 'sp-prose', html: 'In both groups, Tuffier’s line is even less reliable. The crests are hard to feel, the line is easily misplaced, and the space you choose may be higher than you think. Aim for L4–5 or L3–4 and not higher. Ultrasound to count the spaces and measure the depth is most useful here.' })), 2),
    tier(callout('warn', { title: 'Aim low', body: `<p>In a series of seven patients with conus damage after spinal or combined spinal-epidural anaesthesia with pencil-point needles, the space was usually believed to be L2–3 and every patient felt pain as the needle went in. MRI showed a syrinx in the conus. Because the conus can be low and the chosen space is often higher than intended, the needle should not go in above L3.</p>` }), 1),
    tier(callout('key', { title: 'Which space to use', body: '<p>Choose L3–4 or L4–5. Palpate the crests, count, then pick the space below your estimate, not above. If the landmarks are poor, ultrasound can confirm the level.</p>' }), 1),
  );
  root.append(s2);

  // ================================================================ 3. Cord, meninges, blood supply
  root.append(buildMeninges());

  // ================================================================ 4. CSF and baricity
  const s4 = el('div', { class: 'an-sub', id: 'an-csf' });
  s4.append(el('h3', { text: 'CSF, baricity and spread' }));
  s4.append(
    tier(el('p', { class: 'sp-prose', text: 'Less CSF in the lumbosacral sac means less dilution of the drug and a higher block.' }), 1),
    buildCsfFacts(),
  );

  const sb = el('div', { id: 'an-baricity', class: 'an-baricity' });
  sb.append(tier(el('h4', { text: 'Baricity' }), 1));
  sb.append(tier(el('p', { class: 'sp-prose', html: `<strong>Baricity</strong> is the density of the injected solution divided by the density of CSF, both at <span class="sp-num">37 °C</span>. A solution at <span class="sp-num">1.0</span> is isobaric; above it is hyperbaric and sinks; below it is hypobaric and floats. To behave predictably in everyone, a solution needs a baricity above about <span class="sp-num">1.0010</span> (hyperbaric) or below about <span class="sp-num">0.9990</span> (hypobaric). Glucose makes a solution hyperbaric. Baricity and the patient’s position after injection are the main things you control; the full list of factors follows the figure.` }), 2));

  const f3 = figure({ id: 'an-fig-baricity', num: '1.3', aspect: 'auto', caption: 'Supine patient, head to the left, curves exaggerated. Dots show where a solution injected at L3–4 tends to go. A teaching model, not a simulation of real CSF flow.' });
  const cvb = el('canvas', { role: 'img', 'aria-label': 'Supine spinal curves with a hyperbaric solution spreading from L3–4.' });
  f3.stage.append(cvb);
  const bar = createBaricity(cvb);
  const BTEXT = {
    hyper: 'Hyperbaric: the solution runs downhill from the lumbar peak. Most flows cephalad and pools in the thoracic kyphosis, so a supine block commonly reaches the mid-thoracic dermatomes (around T4–T6); some runs caudally into the sacral sac.',
    iso: 'Isobaric: little effect of gravity. The solution stays closer to the injection site, so spread depends more on dose, volume and the patient, and is less predictable.',
    hypo: 'Hypobaric: the solution floats to the highest part of the canal, which in the supine position is the lumbar lordosis. Hypobaric solutions are mainly used with the operative side uppermost.',
  };
  const bOut = el('p', { class: 'an-bar-out', text: BTEXT.hyper });
  const bSeg = segmented([{ value: 'hyper', label: 'Hyperbaric' }, { value: 'iso', label: 'Isobaric' }, { value: 'hypo', label: 'Hypobaric' }], {
    label: 'Baricity', value: 'hyper', onChange: (v) => { bar.setMode(v, rm); bOut.textContent = BTEXT[v]; f3.describe(BTEXT[v]); cvb.setAttribute('aria-label', `Supine spinal curves. ${BTEXT[v]}`); },
  });
  const replay = el('button', { type: 'button', class: 'sp-btn an-replay', text: 'Replay' });
  replay.addEventListener('click', () => bar.replay(rm));
  f3.controls.append(bSeg, replay);
  f3.fig.insertBefore(bOut, f3.caption);
  let barShown = false;
  onResize(f3.stage, () => { const w = f3.stage.clientWidth; if (w) bar.resize(w); });
  whenVisible(f3.fig, () => { bar.visible(true); if (!barShown) { barShown = true; const w = f3.stage.clientWidth; if (w) bar.resize(w); bar.setMode('hyper', rm); } }, () => bar.visible(false));
  f3.describe(BTEXT.hyper);
  tier(f3.fig, 2);
  sb.append(f3.fig);
  sb.append(
    tier(el('ul', { class: 'an-list', html: '<li>Lying supine, the highest point of the lumbar curve is around L3–4 and the lowest point of the thoracic curve is around T5–6.</li><li>Sitting for a few minutes after a hyperbaric injection keeps the block low, in the sacral roots (a saddle block).</li><li>Turning lateral for a few minutes after a hyperbaric injection favours the dependent side.</li>' }), 1),
    tier(el('p', { class: 'sp-prose', html: '“Plain” bupivacaine is often described as isobaric but is slightly hypobaric at body temperature.' }), 2),
    tier(callout('pearl', { body: '<p>Two things you control most: baricity and posture. A slow injection of a small volume of a glucose-containing solution, then supine, gives the most predictable spread.</p>' }), 1),
    tier(callout('pearl', { title: 'Spinal curves differ from the textbook', body: '<p>The textbook pooling point (the trough of the thoracic kyphosis, around T5–6) assumes a typical spine. An exaggerated kyphosis or a scoliosis moves the lowest point of the curve, so a hyperbaric solution may settle at a different level and give a block higher or lower than expected. The same applies to table tilt: its effect depends on where the curves lie relative to the horizontal. In these patients give the dose in increments if the technique allows, and watch the level rise before the surgeon starts.</p>' }), 3),
  );
  s4.append(sb);
  s4.append(buildSpread());
  root.append(s4);

  // ================================================================ 4b. Fibres, differential block, regression
  root.append(buildFibres());

  // ================================================================ 5. Dermatomes
  const s5 = el('div', { class: 'an-sub', id: 'an-dermatomes' });
  s5.append(el('h3', { text: 'Dermatomes, myotomes and block height' }));
  s5.append(tier(el('p', { class: 'sp-prose', text: 'Test the block in the same way each time and say which modality you used. Cold is lost at a higher level than pinprick, and pinprick higher than light touch, so a cold level typically reads about two segments above a pinprick level (it varies).' }), 1));
  const f4 = figure({ id: 'an-fig-dermatomes', num: '1.4', aspect: 'auto', caption: 'Front view, schematic. Hatched area: sensory block for the chosen level. Dotted band above it: sympathetic block, typically two or more segments higher (drawn as two).' });
  const derm = buildDermSVG();
  const dGrid = el('div', { class: 'an-derm-grid' });
  const dOut = el('div', { class: 'an-derm-out', 'aria-live': 'polite' });
  dGrid.append(el('div', { class: 'an-derm-art' }, derm.svg), dOut);
  f4.stage.append(dGrid);
  const rangeId = 'an-derm-range';
  const range = el('input', { type: 'range', id: rangeId, min: '0', max: String(STOPS.length - 1), step: '1', value: '3', class: 'an-range' });
  const rangeLbl = el('label', { for: rangeId, class: 'an-range-label', html: 'Sensory block up to <strong class="sp-num">T10</strong>' });
  const ticks = el('div', { class: 'an-range-ticks', 'aria-hidden': 'true' }, ...STOPS.map((s) => el('span', { text: s.label.split('–')[0] })));
  f4.controls.append(el('div', { class: 'an-range-wrap' }, rangeLbl, range, ticks));
  function setStop(i) {
    const s = STOPS[i];
    derm.set(s.id);
    range.setAttribute('aria-valuetext', `${s.label}, ${s.where}`);
    rangeLbl.innerHTML = `Sensory block up to <strong class="sp-num">${s.label}</strong>`;
    dOut.innerHTML = '';
    dOut.append(
      el('p', { class: 'an-derm-lvl', text: s.label }),
      el('p', { class: 'an-derm-where', text: `Landmark: ${s.where}` }),
      el('p', { class: 'an-derm-h', text: 'Typically enough for' }),
      el('ul', {}, ...s.ops.map((o) => el('li', { text: o }))),
    );
    if (s.note) dOut.append(el('p', { class: 'an-derm-note', text: s.note }));
    if (/^T/.test(s.id)) dOut.append(el('p', { class: 'an-derm-legend', html: '<span class="an-derm-key an-derm-key--sym" aria-hidden="true"></span>Dotted band: sympathetic block, typically two or more segments above the sensory level. Motor block sits about 2 segments below it.' }));
    f4.describe(`Block to ${s.label} (${s.where}). Typically enough for: ${s.ops.join('; ')}.`);
  }
  range.addEventListener('input', () => setStop(Number(range.value)));
  setStop(3);
  tier(f4.fig, 1);
  s5.append(f4.fig);
  s5.append(buildHeights());
  root.append(s5);
  root.append(buildPhysiology());

  // ------------------------------------------------------------------ search (canvas / hidden content)
  registerSearch([
    ...STOPS.map((st) => ({ title: `Block to ${st.label} (${st.where})`, text: `${st.ops.join('. ')}. ${st.note || ''}`, id: 'an-fig-dermatomes' })),
    ...Object.values(BTEXT).map((t, i) => ({ title: ['Hyperbaric solution spread', 'Isobaric solution spread', 'Hypobaric solution spread'][i], text: t, id: 'an-fig-baricity' })),
    ...Object.values(STEP).map((d) => ({ title: `Layer: ${d.name}`, text: `${d.depth} ${d.feel} ${d.why}`, id: 'an-stepper' })),
    ...LEVELS.map((l) => ({ title: `Spinal level ${l.id}`, text: levelInfo(l.id), id: 'an-tuffier-fig' })),
  ]);


  // ------------------------------------------------------------------ deep links
  api.reveal = (hashId) => {
    if (hashId === 'an-paramedian' || hashId === 'an-paramedian-h') { setMode('paramedian'); return true; }
    const m = /^an-layer-(\w+)$/.exec(hashId);
    if (m) {
      let i = LAYERS[mode].indexOf(m[1]);
      if (i < 0) { const other = mode === 'midline' ? 'paramedian' : 'midline'; i = LAYERS[other].indexOf(m[1]); if (i >= 0) { mode = other; seg.set(other); } }
      if (i >= 0) { go(i, false); return true; }
    }
    return Boolean(document.getElementById(hashId));
  };
  return api;
}
