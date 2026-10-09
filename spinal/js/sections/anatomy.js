// spinal/ — section 01 "Anatomy for neuraxial block". Owner: B2.
// Figures are drawn by js/anatomy/* (sagittal plate, landmarks, baricity, dermatomes) using js/anatomy/kit.js.
import { el, callout, cite, segmented, figure, table, announce, whenVisible, onResize, reducedMotion, onThemeChange } from '../ui.js?v=1';
import { createSagittal, drawInset, LAYERS, hitStep } from '../anatomy/sagittal.js';
import { buildLandmarksSVG, levelButtons, levelInfo, LEVELS } from '../anatomy/landmarks.js';
import { createBaricity } from '../anatomy/baricity.js';
import { buildDermSVG, STOPS } from '../anatomy/dermatomes.js';

export const meta = { id: 'anatomy', prefix: 'an', title: 'Anatomy for neuraxial block' };

// Module references (each checked on PubMed / Europe PMC on 9 Oct 2026).
export const refs = {
  'an-saifuddin1998': {
    label: 'Saifuddin 1998',
    text: 'Saifuddin A, Burnett SJ, White J. The variation of position of the conus medullaris in an adult population: a magnetic resonance imaging study. <i>Spine</i> 1998;23:1452–6.',
    url: 'https://doi.org/10.1097/00007632-199807010-00005',
  },
  'an-carpenter1998': {
    label: 'Carpenter 1998',
    text: 'Carpenter RL, Hogan QH, Liu SS, Crane B, Moore J. Lumbosacral cerebrospinal fluid volume is the primary determinant of sensory block extent and duration during spinal anesthesia. <i>Anesthesiology</i> 1998;89:24–9.',
    url: 'https://doi.org/10.1097/00000542-199807000-00007',
  },
  'an-hogan1996': {
    label: 'Hogan 1996',
    text: 'Hogan QH, Prost R, Kulier A, Taylor ML, Liu S, Mark L. Magnetic resonance imaging of cerebrospinal fluid volume and the influence of body habitus and abdominal pressure. <i>Anesthesiology</i> 1996;84:1341–9.',
    url: 'https://doi.org/10.1097/00000542-199606000-00010',
  },
  'an-margetis-csf': {
    label: 'Margetis 2025',
    text: 'Margetis K, Baker S. Physiology, cerebral spinal fluid. In: <i>StatPearls</i>. Treasure Island (FL): StatPearls Publishing; 2025. PMID 30085549.',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK519007/',
  },
  'an-hocking2006': {
    label: 'Hocking 2006',
    text: 'Hocking G. Spinal anaesthetic spread. <i>Anaesthesia Tutorial of the Week</i> 37. World Federation of Societies of Anaesthesiologists; 28 November 2006.',
    url: 'https://resources.wfsahq.org/atotw/spinal-anaesthetic-spread-anaesthesia-tutorial-of-the-week-37/',
  },
};

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
    el('p', { class: 'sp-lead', text: 'What the needle passes, where the cord and dural sac end, how to choose a level, and how the injected drug moves in the CSF.' }),
    el('ul', { class: 'sp-jump', html: '<li><a href="#an-layers">Layers</a></li><li><a href="#an-landmarks">Landmarks and levels</a></li><li><a href="#an-conus">Conus and dural sac</a></li><li><a href="#an-csf">CSF and baricity</a></li><li><a href="#an-dermatomes">Dermatomes</a></li>' }),
  );

  // ================================================================ 1. Layers
  const s1 = el('div', { class: 'an-sub', id: 'an-layers' });
  s1.append(el('h3', { text: 'Layers the needle passes' }));
  s1.append(el('p', { class: 'sp-prose', html: 'Step through the layers of a midline spinal at L3–4. Switch to <strong>Paramedian</strong> to see the needle enter beside the midline and reach the ligamentum flavum without crossing the midline ligaments.' }));

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
  function go(i, fromUser, focus = false) {
    step = Math.max(0, Math.min(6, i));
    const t = sync(focus);
    if (fromUser) announce(t);
  }
  function setMode(v) {
    mode = v; seg.set(v);
    const t = sync(false);
    announce(`${v === 'midline' ? 'Midline' : 'Paramedian'} approach. ${t}`);
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

  s1.append(f1.fig, stepper);
  sync(false, true);

  s1.append(
    callout('key', { title: 'Depth', body: '<p>The skin-to-epidural distance is typically about <span class="sp-num">4–6 cm</span> in an adult of normal build and is mostly set by the thickness of subcutaneous fat. It can be much deeper with a high BMI, so a longer needle may be needed. The CSF lies only a few millimetres beyond the epidural space.</p>' }),
    el('h4', { id: 'an-paramedian-h', text: 'Paramedian approach' }),
    el('p', { class: 'sp-prose', html: 'Enter about <span class="sp-num">1 cm</span> lateral to the midline (often about <span class="sp-num">1 cm</span> caudal too), next to the lower spinous process of the chosen space. Aim medially and cephalad (roughly <span class="sp-num">10–15°</span>). If you meet lamina, note the depth and walk off its upper edge into the gap. The first ligament you meet is the ligamentum flavum. This helps when the midline ligaments are calcified, the patient cannot flex well, or the midline gap is narrow.' }),
    callout('pearl', { body: '<p>Midline order, outside in: skin, subcutaneous fat, supraspinous ligament, interspinous ligament, ligamentum flavum, epidural space, dura, arachnoid, subarachnoid space. Paramedian: skin, fat, paraspinal muscle, ligamentum flavum, then the same.</p>' }),
  );
  root.append(s1);

  // ================================================================ 2. Landmarks and levels
  const s2 = el('div', { class: 'an-sub', id: 'an-landmarks' });
  s2.append(el('h3', { text: 'Surface landmarks and choosing a level' }));
  s2.append(el('p', { class: 'sp-prose', html: 'Palpation is less accurate than most of us think. In an MRI study, anaesthetists named a marked lumbar space correctly only <span class="sp-num">29%</span> of the time; in <span class="sp-num">51%</span> the mark was one space higher than they believed, and the error ranged from one space below to four above. Accuracy was worse in obese patients and higher on the back.' + cite('broadbent2000') + ' The cord itself can end as low as the upper third of L3' + cite('an-saifuddin1998') + ', and conus injury has followed spinals that went in higher than the anaesthetist believed.' + cite('reynolds2001') }));

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
  s2.append(f2.fig);

  s2.append(
    el('p', { class: 'sp-prose', id: 'an-tuffier', html: '<strong>Tuffier’s line</strong> (the intercristal line) is traditionally said to cross the L4 body or the L4–5 space. It is an unreliable guide to level' + cite('reynolds2001') + ': imaging studies show it varies with sex, age and build. Treat it as a starting point, not proof of level.' }),
    el('p', { class: 'sp-prose', html: 'Other landmarks: the posterior superior iliac spines (the dimples above the buttocks) lie at about S2; the 12th rib attaches to T12.' }),
    callout('warn', { title: 'Aim low', body: `<p>In a series of seven patients with conus damage after spinal or combined spinal-epidural anaesthesia with pencil-point needles, the space was usually believed to be L2–3 and every patient felt pain as the needle went in. MRI showed a syrinx in the conus. Because the conus can be low and the chosen space is often higher than intended, the needle should not go in above L3.${cite('reynolds2001')}</p>` }),
    callout('policy', { title: 'Preferred interspace', body: '<p>This page teaches L3–4 or below. Confirm the departmental preference, and consider ultrasound to confirm the level when landmarks are poor.</p>' }),
  );
  root.append(s2);

  // ================================================================ 3. Conus and dural sac
  const s3 = el('div', { class: 'an-sub', id: 'an-conus' });
  s3.append(el('h3', { text: 'Where the cord and dural sac end' }));
  s3.append(table({
    caption: 'Adult conus and dural sac',
    head: ['Structure', 'Usual level', 'Range or note'],
    rows: [
      [{ html: 'Conus medullaris (tip of the cord)', th: true }, `Lower third of L1 (mean)${cite('an-saifuddin1998')}`, `Middle of T12 to upper third of L3 in 504 adult MRI scans${cite('an-saifuddin1998')}`],
      [{ html: 'Conus below L1', th: true }, '—', `<span class="sp-num">19%</span> of 100 patients in an MRI study${cite('broadbent2000')}`],
      [{ html: 'Dural sac', th: true }, 'About S2', 'Most often S2; a minority end at S3'],
      [{ html: 'Cauda equina', th: true }, 'Below the conus', 'Lumbar and sacral roots floating in CSF, which is why spinals are done below the conus'],
    ],
  }));
  s3.append(callout('pearl', { body: '<p>Cord ends around L1–2 in most adults (range T12 to L3); dural sac ends around S2. Spinal anaesthesia goes in at L3–4 or below, where the sac holds only CSF and roots.</p>' }));
  root.append(s3);

  // ================================================================ 4. CSF and baricity
  const s4 = el('div', { class: 'an-sub', id: 'an-csf' });
  s4.append(el('h3', { text: 'CSF and baricity' }));
  s4.append(
    el('p', { class: 'sp-prose', html: `An adult has about <span class="sp-num">150 mL</span> of CSF, about <span class="sp-num">125 mL</span> of it in the subarachnoid spaces. Most is made by the choroid plexus, at roughly <span class="sp-num">400–600 mL</span> a day.${cite('an-margetis-csf')} Its density at body temperature is about <span class="sp-num">1.0003 g/mL</span>.` }),
    el('p', { class: 'sp-prose', html: `The volume of CSF in the lumbosacral sac varies a lot between people: <span class="sp-num">28–81 mL</span> in 25 volunteers, less in the more obese and less again with abdominal compression.${cite('an-hogan1996')} In a volunteer study it correlated with peak block height and duration, and was the most important single factor found for how far a spinal spreads.${cite('an-carpenter1998')} Less lumbosacral CSF means less dilution and a higher block. This is one reason the same dose behaves differently in different patients.` }),
  );

  const sb = el('div', { id: 'an-baricity', class: 'an-baricity' });
  sb.append(el('h4', { text: 'Baricity' }));
  sb.append(el('p', { class: 'sp-prose', html: `<strong>Baricity</strong> is the density of the injected solution divided by the density of CSF, both at <span class="sp-num">37 °C</span>. A solution at <span class="sp-num">1.0</span> is isobaric; above it is hyperbaric and sinks; below it is hypobaric and floats. To behave predictably in everyone, a solution needs a baricity above about <span class="sp-num">1.0010</span> (hyperbaric) or below about <span class="sp-num">0.9990</span> (hypobaric). Glucose makes a solution hyperbaric. Baricity and the patient’s position after injection are the main determinants of spread; most other factors have small, unpredictable effects.${cite('an-hocking2006', 'hocking2004')}` }));

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
  sb.append(f3.fig);
  sb.append(
    el('ul', { class: 'an-list', html: '<li>Lying supine, the highest point of the lumbar curve is around L3–4 and the lowest point of the thoracic curve is around T5–6.</li><li>Sitting for a few minutes after a hyperbaric injection keeps the block low, in the sacral roots (a saddle block).</li><li>Turning lateral for a few minutes after a hyperbaric injection favours the dependent side.</li><li>“Plain” bupivacaine is often described as isobaric but is slightly hypobaric at body temperature.</li>' }),
    callout('pearl', { body: '<p>Two things you control most: baricity and posture. A slow injection of a small volume of a glucose-containing solution, then supine, gives the most predictable spread.' + cite('an-hocking2006') + '</p>' }),
  );
  s4.append(sb);
  root.append(s4);

  // ================================================================ 5. Dermatomes
  const s5 = el('div', { class: 'an-sub', id: 'an-dermatomes' });
  s5.append(el('h3', { text: 'Dermatomes and block height' }));
  s5.append(el('p', { class: 'sp-prose', text: 'Test the block in the same way each time and say which modality you used. Cold is lost at a higher level than pinprick, and pinprick higher than light touch, so a cold level usually reads a segment or two above a pinprick level.' }));
  const f4 = figure({ id: 'an-fig-dermatomes', num: '1.4', aspect: 'auto', caption: 'Front view, schematic. Hatched area: sensory block for the chosen level. Dotted band above it: approximate extra sympathetic block.' });
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
    if (/^T/.test(s.id)) dOut.append(el('p', { class: 'an-derm-legend', html: '<span class="an-derm-key an-derm-key--sym" aria-hidden="true"></span>Dotted band: sympathetic block, roughly 2 segments above the sensory level. Motor block sits roughly 2 segments below it.' }));
    f4.describe(`Block to ${s.label} (${s.where}). Typically enough for: ${s.ops.join('; ')}.`);
  }
  range.addEventListener('input', () => setStop(Number(range.value)));
  setStop(3);
  s5.append(f4.fig);
  s5.append(
    callout('policy', { title: 'Block-height targets', body: '<p>These are approximate, commonly taught targets for non-obstetric surgery. Confirm local targets, especially for knee arthroplasty with a tourniquet, hip surgery and TURP.</p>' }),
    el('h4', { text: 'Differential block' }),
    el('p', { class: 'sp-prose', text: 'Small and myelinated fibres block at lower concentrations, and the concentration falls with distance from the injection site. So the sympathetic block extends roughly two segments above the pinprick level, and the motor block sits roughly two segments below it. Recovery is broadly in the reverse order.' }),
    callout('pearl', { body: '<p>Landmarks: T4 nipples, T6 xiphisternum, T10 umbilicus, L1 inguinal ligament, S2–S4 perineum. Sympathetic about 2 segments above sensory; motor about 2 below.</p>' }),
  );
  root.append(s5);

  root.append(callout('key', { title: 'Summary', body: '<ul><li>Go in at L3–4 or below: the conus can be low, and the space you choose is often higher than you think.</li><li>The needle passes skin, fat, supraspinous and interspinous ligaments, ligamentum flavum, epidural space, dura and arachnoid. Paramedian skips the two midline ligaments.</li><li>Baricity and posture drive spread; lumbosacral CSF volume explains much of the variation between patients.</li><li>Check the level with cold or pinprick against dermatome landmarks and record the modality.</li></ul>' }));

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
