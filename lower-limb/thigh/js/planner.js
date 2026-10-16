// Thigh page: the amputation planner chapter (pick the operation and the blocks, see which nerves are covered on the
// leg and on a mid-thigh cross-section, and count the local anaesthetic dose against a weight-based ceiling), and the
// whole-limb "block combinations" chapter. Doses: Dr Chew Shi Hao's for his blocks; literature doses for the sciatic,
// posterior femoral cutaneous and obturator blocks (sources in the notes file). Prefix th-.
import { el, sv, fill, keyPoints, callout, table, details, registerSearch, announce } from '../../../shared/regional/js/ui.js';
import { legFigure, legViewsFigure } from '../../../shared/regional/js/figures/leg.js';
import { thighSection } from './anatomy.js?v=20261015';
import { tierBadge } from '../../../shared/regional/js/levels.js?v=20261015'; // same URL as the shell: one level state per page

const MAX_MG_KG = 3; // ropivacaine: a commonly used ceiling; local policy and the patient decide
const WINE = '#633d3c';

// Nerve keys: sci = sciatic above the thigh cut (also covers below the knee), sbk = sciatic below the knee only,
// pfcn, fem = femoral (anterior thigh skin, quadriceps, femur, saphenous), saph = saphenous only, lfcn, obt.
const NERVE_INFO = {
  sci: { name: 'Sciatic nerve (above the cut)', short: 'Sciatic', what: 'hamstrings, the back of the femur, everything below the knee' },
  sbk: { name: 'Sciatic nerve, below the knee', short: 'Sciatic', what: 'the leg below the knee except the saphenous strip: skin, muscle, tibia and fibula' },
  pfcn: { name: 'Posterior femoral cutaneous nerve', short: 'PFCN', what: 'skin of the back of the thigh and the popliteal fossa (the posterior flap)' },
  fem: { name: 'Femoral nerve', short: 'Femoral', what: 'front of the thigh, quadriceps, much of the femur, and the saphenous nerve' },
  saph: { name: 'Saphenous nerve', short: 'Saphenous', what: 'the inner side of the leg and the anteromedial tibia' },
  lfcn: { name: 'Lateral femoral cutaneous nerve', short: 'LFCN', what: 'skin of the outer thigh' },
  obt: { name: 'Obturator nerve', short: 'Obturator', what: 'adductors, part of the femur, a variable patch of inner thigh skin' },
};

// conc in %, vol in ml; mg = vol × conc × 10
const BLOCKS = [
  { id: 'tg', name: 'Sciatic, transgluteal', href: '#sciatic-ap-tg', covers: { sci: 1, pfcn: 0.7 }, vol: 20, conc: 0.5, note: 'Often catches the posterior femoral cutaneous nerve as well (more often than subgluteal).' },
  { id: 'sg', name: 'Sciatic, subgluteal', href: '#ch-sciatic', covers: { sci: 1, pfcn: 0.4 }, vol: 20, conc: 0.5, note: 'Often misses the posterior femoral cutaneous nerve.' },
  { id: 'ant', name: 'Sciatic, anterior (supine)', href: '#sciatic-ap-ant', covers: { sci: 1 }, vol: 20, conc: 0.5, note: 'Misses the posterior femoral cutaneous nerve.' },
  { id: 'pop', name: 'Sciatic, popliteal', href: '../foot-ankle/#ch-popliteal', covers: { sbk: 1 }, vol: 15, conc: 0.4, note: 'Below the knee only.' },
  { id: 'pfcn', name: 'Posterior femoral cutaneous', href: '#sciatic-pfcn', covers: { pfcn: 1 }, vol: 5, conc: 0.5 },
  { id: 'fem', name: 'Femoral', href: '../hip/#ch-femoral', covers: { fem: 1, saph: 1 }, vol: 15, conc: 0.4 },
  { id: 'fib', name: 'Fascia iliaca (supra-inguinal)', href: '../hip/#ch-fib', covers: { fem: 1, saph: 1, lfcn: 1, obt: 0.3 }, vol: 40, conc: 0.2, note: 'Femoral and LFCN by volume; the obturator only sometimes. 0.2% is an analgesic strength.' },
  { id: 'lfcn', name: 'Lateral femoral cutaneous', href: '../hip/#ch-lfcn', covers: { lfcn: 1 }, vol: 5, conc: 0.2 },
  { id: 'obt', name: 'Obturator', href: '../knee/#ch-obturator', covers: { obt: 1 }, vol: 10, conc: 0.5 },
  { id: 'acb', name: 'Adductor canal (saphenous)', href: '../knee/#ch-adductor-canal', covers: { saph: 1 }, vol: 10, conc: 0.4 },
];
const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));
const SCIATIC = ['tg', 'sg', 'ant', 'pop']; // alternative levels of the one sciatic nerve
const VOLS = [5, 10, 15, 20, 25, 30, 40];
const CONCS = [0.2, 0.375, 0.4, 0.5];

const OPS = [
  { id: 'aka', name: 'Above-knee', title: 'Above-knee (transfemoral) amputation', needs: ['sci', 'pfcn', 'fem', 'lfcn', 'obt'], cut: 200,
    preset: { tg: [15, 0.5], fem: [15, 0.4], lfcn: [5, 0.2], obt: [10, 0.375] },
    note: 'Five nerves cross a mid-thigh cut. The suggested set trims the doses so that four blocks fit under the ceiling for most adults: transgluteal sciatic (which often catches the posterior femoral cutaneous nerve) at 15 ml of 0.5% (a smaller volume keeps the block dense), femoral (15 ml of 0.4%) and LFCN (5 ml of 0.2%) at their standard doses, and obturator at 0.375% (slower and less dense than 0.5%). A teaching set: agree your own with a consultant. Plan sedation as well: almost every patient in published series had some.' },
  { id: 'tk', name: 'Through-knee', title: 'Through-knee amputation (knee disarticulation)', needs: ['sci', 'pfcn', 'fem', 'lfcn', 'obt'], cut: 286,
    preset: { sg: [15, 0.5], pfcn: [5, 0.375], fem: [15, 0.4], lfcn: [5, 0.2], obt: [10, 0.375] },
    note: 'The knee capsule takes femoral, obturator and sciatic branches; the skin round the knee is femoral (front), saphenous (infrapatellar), LFCN (outer distal thigh) and the posterior femoral cutaneous nerve (popliteal fossa). Here a subgluteal sciatic block with its own posterior femoral cutaneous injection.' },
  { id: 'bka', name: 'Below-knee', title: 'Below-knee (transtibial) amputation, no thigh tourniquet', needs: ['sbk', 'saph'], cut: 326,
    preset: { pop: [15, 0.4], acb: [10, 0.4] },
    note: 'Two nerves: the sciatic (at the popliteal fossa) and the saphenous (adductor canal). The usual vascular amputation, often with no tourniquet. A femoral block instead of the adductor canal adds the anterior thigh and quadriceps, useful only if a thigh tourniquet is used, and then with a sciatic block above the cuff and an obturator block.' },
  { id: 'bkt', name: 'Below-knee + thigh cuff', title: 'Below-knee amputation with a thigh tourniquet', needs: ['sci', 'fem', 'obt'], cut: 326, cuff: 150,
    preset: { sg: [15, 0.5], fem: [15, 0.4], obt: [10, 0.375] },
    note: 'A thigh tourniquet hurts from ischaemic muscle and nerve compression deep to the cuff, so it needs every nerve of the thigh blocked above the cuff, and even then it is tolerated for a limited time. Ask whether the surgeon needs it; vascular amputations often do without. The LFCN (skin under the outer part of the cuff) and the posterior femoral cutaneous nerve (skin under the back of the cuff) are optional; add them if the cuff is high or the time long.' },
];

const mg = (vol, conc) => vol * conc * 10;
const fmt = (n) => (Math.round(n * 10) / 10).toString().replace(/\.0$/, '');
const pct = (n) => `${fmt(n * 100)}%`.replace('.', '.');

function legMap(view, levels, gaps, op) {
  const areas = [];
  const add = (zones, v) => { if (v >= 1) areas.push({ zones, density: 'dense' }); else if (v > 0) areas.push({ zones, density: 'patchy' }); };
  const sciV = levels.sci || 0, sbkV = Math.max(levels.sbk || 0, sciV);
  add(['sciatic-below-knee', 'tibia', 'ankle-joint', 'foot-bones'], sbkV);
  add(['knee-post'], sciV);
  add(['pfcn'], levels.pfcn || 0);
  add(['femoral-ant', 'knee-ant'], levels.fem || 0);
  add(['saphenous'], Math.max(levels.saph || 0, levels.fem || 0));
  add(['lfcn'], levels.lfcn || 0);
  add(['obturator'], levels.obt || 0);
  const femurV = Math.min(levels.fem || 0, levels.sci || 0, levels.obt || 0);
  if (femurV >= 1) areas.push({ zones: ['femur'], density: 'dense' }); else if ((levels.fem || 0) + (levels.sci || 0) + (levels.obt || 0) > 0) areas.push({ zones: ['femur'], density: 'patchy' });
  const svg = legFigure(view, { areas, deepTags: false, label: `${view === 'front' ? 'Front' : 'Back'} of the right lower limb, shaded where the chosen blocks reach` });
  // the cut (and a cuff)
  const y = op.cut;
  const g = sv('g', { class: 'th-cut' }, svg);
  sv('line', { x1: 0, y1: y, x2: 160, y2: y, stroke: WINE, 'stroke-width': 2.6, 'stroke-dasharray': '7 4' }, g);
  sv('text', { x: view === 'front' ? 3 : 157, y: y - 5, 'text-anchor': view === 'front' ? 'start' : 'end', 'font-size': 14, 'font-weight': 700, 'font-family': 'NTF Sans, Inter, sans-serif', fill: WINE, stroke: '#fbf9f4', 'stroke-width': 3, 'paint-order': 'stroke', text: 'Cut' }, g);
  if (op.cuff) {
    sv('rect', { x: 4, y: op.cuff - 9, width: 152, height: 18, fill: 'rgba(39,39,34,.16)', stroke: '#272722', 'stroke-width': 1.2, 'stroke-dasharray': '3 2' }, g);
    sv('text', { x: 80, y: op.cuff + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, 'font-family': 'NTF Sans, Inter, sans-serif', fill: '#272722', stroke: '#fbf9f4', 'stroke-width': 3, 'paint-order': 'stroke', text: 'Cuff' }, g);
  }
  void gaps;
  return svg;
}

function planner() {
  const wrap = el('figure', { class: 'th-plan', id: 'th-plan' });
  wrap.append(el('p', { class: 'th-fig-title', text: 'Build the block set' }));
  const opSeg = el('div', { class: 'tb-seg th-plan-ops', role: 'group', 'aria-label': 'Operation' });
  const presetBtn = el('button', { type: 'button', class: 'tb-btn th-plan-preset', text: 'Use the suggested set' });
  const clearBtn = el('button', { type: 'button', class: 'tb-btn th-plan-clear', text: 'Clear' });
  const weight = el('input', { type: 'number', id: 'th-plan-wt', min: '30', max: '150', step: '1', value: '70', inputmode: 'numeric', class: 'th-plan-wt' });
  const wlab = el('label', { for: 'th-plan-wt', class: 'th-plan-wlab', text: 'Weight (kg, lean)' });
  const top = el('div', { class: 'th-plan-top' }, el('div', { class: 'th-plan-w' }, wlab, weight), presetBtn, clearBtn);
  const grid = el('div', { class: 'th-plan-grid' });
  const figs = el('div', { class: 'th-plan-figs' });
  const legs = el('div', { class: 'th-plan-legs' });
  const xs = thighSection();
  const xsWrap = el('div', { class: 'th-plan-xs' }, xs.svg, el('p', { class: 'th-plan-xs-cap', text: 'Mid-thigh cross-section: blue = blocked, hatched = sometimes, wine = a gap the cut will find.' }));
  figs.append(legs, xsWrap);
  const side = el('div', { class: 'th-plan-side' });
  const blockList = el('div', { class: 'th-plan-blocks', role: 'group', 'aria-label': 'Blocks' });
  const out = el('div', { class: 'th-plan-out', 'aria-live': 'polite' });
  side.append(el('p', { class: 'th-plan-k', text: 'Blocks, volume and strength (ropivacaine)' }), blockList, out);
  grid.append(figs, side);
  wrap.append(opSeg, top, grid);

  const state = { op: 'aka', on: {}, dose: {} };
  BLOCKS.forEach((b) => { state.dose[b.id] = [b.vol, b.conc]; });

  // block rows
  const rows = {};
  BLOCKS.forEach((b) => {
    const cb = el('input', { type: 'checkbox', id: `th-pb-${b.id}`, class: 'th-pb-cb' });
    const vs = el('select', { 'aria-label': `${b.name}: volume`, class: 'th-pb-sel' }, ...VOLS.map((v) => el('option', { value: String(v), text: `${v} ml` })));
    const cs = el('select', { 'aria-label': `${b.name}: concentration`, class: 'th-pb-sel' }, ...CONCS.map((c) => el('option', { value: String(c), text: `${c}%` })));
    const mgOut = el('span', { class: 'th-pb-mg' });
    const row = el('div', { class: 'th-pb' },
      el('label', { for: `th-pb-${b.id}`, class: 'th-pb-lab' }, cb, el('span', { class: 'th-pb-name', text: b.name })),
      el('div', { class: 'th-pb-dose' }, vs, el('span', { class: 'th-pb-x', 'aria-hidden': 'true', text: '×' }), cs, mgOut),
      el('a', { href: b.href, class: 'th-pb-link', text: 'How', 'aria-label': `How to do the ${b.name} block` }));
    cb.addEventListener('change', () => { state.on[b.id] = cb.checked; update(); });
    vs.addEventListener('change', () => { state.dose[b.id][0] = +vs.value; update(); });
    cs.addEventListener('change', () => { state.dose[b.id][1] = +cs.value; update(); });
    rows[b.id] = { row, cb, vs, cs, mgOut };
    blockList.append(row);
  });
  weight.addEventListener('input', () => update());

  const opBtns = OPS.map((o) => el('button', { type: 'button', class: 'tb-seg-btn', id: `th-plan-op-${o.id}`, 'aria-pressed': 'false', text: o.name, dataset: { activate: '1', scrollTo: 'th-plan' }, on: { click: () => { state.op = o.id; applyPreset(); } } }));
  opBtns.forEach((b) => opSeg.append(b));
  presetBtn.addEventListener('click', applyPreset);
  clearBtn.addEventListener('click', () => { state.on = {}; update(); });

  function applyPreset() {
    const op = OPS.find((o) => o.id === state.op);
    state.on = {};
    BLOCKS.forEach((b) => { state.dose[b.id] = [b.vol, b.conc]; });
    Object.entries(op.preset).forEach(([id, d]) => { state.on[id] = true; state.dose[id] = [...d]; });
    update();
  }

  function update() {
    const op = OPS.find((o) => o.id === state.op);
    opBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(OPS[i].id === op.id)));
    // levels
    const lv = {};
    let total = 0;
    BLOCKS.forEach((b) => {
      const r = rows[b.id]; const on = !!state.on[b.id]; const [v, c] = state.dose[b.id];
      r.cb.checked = on; r.vs.value = String(v); r.cs.value = String(c);
      r.row.classList.toggle('is-on', on);
      const m = mg(v, c);
      r.mgOut.textContent = `${fmt(m)} mg`;
      if (!on) return;
      total += m;
      for (const [k, val] of Object.entries(b.covers)) lv[k] = Math.max(lv[k] || 0, val);
    });
    if (lv.sci) lv.sbk = Math.max(lv.sbk || 0, lv.sci);
    if (lv.fem) lv.saph = Math.max(lv.saph || 0, lv.fem);
    const status = op.needs.map((k) => ({ k, v: lv[k] || 0 }));
    const gaps = status.filter((s) => s.v === 0).map((s) => s.k);
    // figures
    legs.replaceChildren(
      el('figure', { class: 'th-plan-leg' }, legMap('front', lv, gaps, op), el('figcaption', { text: 'Front' })),
      el('figure', { class: 'th-plan-leg' }, legMap('back', lv, gaps, op), el('figcaption', { text: 'Back' })),
    );
    const xsLevels = { sci: lv.sci || 0, pfcn: lv.pfcn || 0, fem: lv.fem || 0, lfcn: lv.lfcn || 0, obt: lv.obt || 0 };
    const xsGaps = gaps.map((g) => (g === 'sbk' ? 'sci' : g === 'saph' ? 'fem' : g));
    xs.set(xsLevels, xsGaps);
    xsWrap.hidden = op.id === 'bka';
    // dose
    // Weight: the planner counts 30–150 kg (lean). Say so when the box is empty or outside that range, rather than
    // silently counting another weight.
    const raw = String(weight.value).trim();
    const typed = raw === '' ? NaN : Number(raw);
    const wt = Number.isFinite(typed) && typed > 0 ? Math.max(30, Math.min(150, typed)) : 70;
    const warns = [];
    if (!Number.isFinite(typed) || typed <= 0) warns.push(`<strong>No weight entered.</strong> Counting for 70 kg: enter the patient’s lean weight.`);
    else if (wt !== typed) warns.push(`<strong>${fmt(typed)} kg is outside the planner’s range (30–150 kg).</strong> Counting for ${fmt(wt)} kg: work out this patient’s ceiling separately.`);
    weight.setAttribute('aria-invalid', String(warns.length > 0));
    // Alternative sciatic approaches: one nerve, so one approach. Both doses still count.
    const sciOn = SCIATIC.filter((id) => state.on[id]).map((id) => byId[id].name.replace(/^Sciatic, /, ''));
    if (sciOn.length > 1) warns.push(`<strong>${sciOn.length} sciatic approaches are switched on</strong> (${sciOn.join(', ')}). They are alternative levels for the same nerve: choose one. Every dose switched on is counted.`);
    const max = wt * MAX_MG_KG;
    const frac = total / max;
    const nerveRows = status.map(({ k, v }) => {
      const info = NERVE_INFO[k];
      const cls = v >= 1 ? 'ok' : v > 0 ? 'part' : 'gap';
      const word = v >= 1 ? 'Covered' : v >= 0.7 ? 'Often' : v > 0 ? 'Sometimes' : 'Gap';
      return `<li class="th-st th-st--${cls}"><span class="th-st-tag">${word}</span><span><strong>${info.name}</strong>: ${info.what}</span></li>`;
    }).join('');
    const notes = BLOCKS.filter((b) => state.on[b.id] && b.note).map((b) => `<li>${b.name}: ${b.note}</li>`).join('');
    const over = frac > 1;
    const barW = Math.min(100, frac * 100);
    out.replaceChildren();
    fill(out, `<p class="th-plan-k">${op.title}</p>
<ul class="th-st-list">${nerveRows}</ul>
${warns.map((w) => `<p class="th-plan-warn" role="note">${w}</p>`).join('')}<div class="th-dose ${over ? 'is-over' : frac > 0.85 ? 'is-near' : ''}">
  <p class="th-dose-l"><span>Total ropivacaine</span> <strong>${fmt(total)} mg</strong> <span class="th-dose-of">of ${fmt(max)} mg (${MAX_MG_KG} mg/kg × ${fmt(wt)} kg)</span></p>
  <div class="th-dose-bar" role="img" aria-label="${fmt(frac * 100)} percent of the ceiling"><span style="width:${barW}%"></span></div>
  <p class="th-dose-msg">${total === 0 ? 'Choose blocks to count the dose.' : over ? '<strong>Over the ceiling.</strong> Lower the volume or strength, drop a block, or replace part with a short-acting drug (and count that too).' : frac > 0.85 ? '<strong>Close to the ceiling.</strong> Leave nothing for surgical infiltration; consider a lower strength.' : 'Within the ceiling. Remember any surgical infiltration counts too.'}</p>
</div>
<p class="th-plan-note">${op.note}</p>${notes ? `<ul class="th-plan-bnotes">${notes}</ul>` : ''}`);
    out.classList.remove('th-anim-in'); void out.offsetWidth; out.classList.add('th-anim-in');
    announce(`${op.name}: ${gaps.length ? `${gaps.length} gap${gaps.length > 1 ? 's' : ''}` : 'all nerves covered'}; total ${fmt(total)} milligrams${warns.length ? `. ${warns.length} warning${warns.length > 1 ? 's' : ''}` : ''}`);
  }
  applyPreset();
  wrap.append(fill(el('figcaption'), `Choose an operation: the suggested set loads; then switch blocks on and off and change the doses. The leg shows what is numb (solid = dense, dotted = patchy) and where the surgeon cuts. The ceiling used here is <strong>${MAX_MG_KG} mg/kg of ropivacaine</strong>, a commonly used figure: use lean weight, and aim lower in the frail, in heart failure and in liver disease. Toxicity from several blocks adds up. A teaching tool, not a prescription.`));
  registerSearch([{ title: 'Amputation planner: dose calculator', text: 'amputation AKA BKA above knee below knee through knee planner dose calculator maximum dose ropivacaine mg/kg weight sciatic femoral obturator LFCN posterior femoral cutaneous tourniquet', id: 'th-plan' }]);
  return wrap;
}

// ================================================================== amputation chapter
// The chapter is tier 1 (MO) so the planner, the dose ceiling and the lipid line always show; its background,
// catheter and exam parts are Resident and its consultant and frontier layers Consultant, as on the block chapters.
const tierPart = (host, tier, badge = true) => {
  const box = el('div', { class: 'th-amp-part', 'data-tier': String(tier) });
  if (badge) { const b = tierBadge(tier); if (b) box.append(b); }
  host.append(box);
  return box;
};

export function renderAmputation(sec) {
  sec.append(el('h2', { id: 'th-amp-h', text: 'Amputation planner: above and below the knee under nerve blocks' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'The patient is often the sickest on the list: septic, on dual antiplatelets or anticoagulants, with a poor heart. Nerve blocks keep the blood pressure where it is and avoid the airway and the spine. The price is <strong>more needles, more milligrams and a plan for every nerve</strong>.'));
  sec.append(keyPoints([
    '<strong>Below the knee: two nerves.</strong> Popliteal sciatic + saphenous (adductor canal) or femoral.',
    '<strong>Above the knee: five nerves.</strong> Sciatic, posterior femoral cutaneous, femoral, lateral femoral cutaneous, obturator.',
    'Skip the obturator and the LFCN and the patient will need much more sedation: the medial and lateral thigh will hurt.',
    'Count the milligrams before the first needle. Trim the strength, not the nerves.',
    'A thigh tourniquet under blocks alone is a big ask: avoid it if you can.',
    'Ask the surgeon to place a catheter in the sciatic nerve sheath before dividing it.',
  ], { title: 'Rapid fire' }));

  const who = tierPart(sec, 2);
  who.append(el('h3', { id: 'th-amp-who', text: 'Who, and why blocks' }));
  who.append(fill(el('div', { class: 'tb-prose' }), `<ul>
<li><strong>The patient</strong>: diabetic, vasculopathic, often septic from wet gangrene; ischaemic heart disease and heart failure; renal impairment; on antiplatelets or anticoagulants after failed revascularisation; high opioid use for ischaemic rest pain. Surgery is source control: it rarely waits.</li>
<li><strong>Spinal</strong> is excellent when allowed, but sepsis, dual antiplatelets or anticoagulation often rule it out. <strong>General anaesthesia</strong> in a septic patient with a poor heart risks haemodynamic collapse.</li>
<li><strong>Peripheral nerve blocks</strong> keep the circulation stable, are compatible with most anticoagulation at superficial sites, and give hours of analgesia afterwards. In a Singapore series of ASA IV patients having above-knee amputation under blocks, about nine in ten needed no conversion to general or spinal anaesthesia; nearly all had some sedation, and those given only femoral and sciatic blocks needed more of it than those who also had the obturator (and LFCN) blocked.</li>
<li><strong>Arterial line</strong> if septic or haemodynamically unstable; group and save or crossmatch, as blood loss depends on the level and on whether a tourniquet is used.</li></ul>`));

  sec.append(el('h3', { id: 'th-amp-plan', text: 'The planner' }));
  sec.append(planner());

  sec.append(el('h3', { id: 'th-amp-how', text: 'Doing it: an above-knee amputation under blocks' }));
  sec.append(fill(el('ol', { class: 'th-steps' }), `<li><strong>Plan the dose first.</strong> Weigh the patient (lean weight), choose the set, write down the milligrams for each block. Have lipid emulsion in the room.</li>
<li><strong>Sciatic first</strong> if the patient can be turned: it is the slowest. Transgluteal (more often catches the posterior femoral cutaneous nerve) or subgluteal plus its own posterior femoral cutaneous injection. Can’t turn? The <a href="#sciatic-ap-ant">anterior approach</a> supine, or lift the leg (hip and knee flexed) for a subgluteal view from below.</li>
<li><strong>Then supine, one position</strong>: <a href="../hip/#ch-femoral">femoral</a>, <a href="../hip/#ch-lfcn">lateral femoral cutaneous</a>, <a href="../knee/#ch-obturator">obturator</a> (proximal, or both divisions distally). A supra-inguinal <a href="../hip/#ch-fib">fascia iliaca</a> covers femoral and LFCN together but does not reliably reach the obturator.</li>
<li><strong>Test each territory</strong> at 20–30 minutes: front, outer, inner and back of the thigh at the level of the cut; foot movement for the sciatic.</li>
<li><strong>Sedation plan</strong>: titrated, airway-safe, with oxygen and capnography. Ketamine in small doses suits the opioid-tolerant. The surgeon can infiltrate a patchy area, within the dose.</li>
<li><strong>Before the sciatic nerve is divided</strong>, ask for a perineural catheter in its sheath (or place your own) for the days after.</li></ol>`));
  sec.append(callout('warn', {
    title: 'Gaps that will show',
    body: '<ul><li><strong>Back of the thigh</strong> (posterior flap): posterior femoral cutaneous nerve missed by a subgluteal or anterior sciatic block.</li><li><strong>Inner thigh and adductors</strong>: obturator. Femoral and fascia iliaca blocks do not reliably reach it.</li><li><strong>Outer thigh</strong>: lateral femoral cutaneous.</li><li><strong>The femur</strong>: supplied by all three big nerves; sawing hurts unless femoral, sciatic and obturator are all blocked.</li></ul>',
  }));

  sec.append(el('h3', { id: 'th-amp-bka', text: 'Below-knee amputation' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<ul>
<li><strong>Popliteal sciatic + saphenous</strong> covers the skin, muscles, tibia and fibula below the knee. The saphenous block can be at the <a href="../knee/#ch-adductor-canal">adductor canal</a>; a <a href="../hip/#ch-femoral">femoral</a> block does the same and also numbs the anterior thigh.</li>
<li>Block the popliteal sciatic nerve at or above the division so the <strong>lateral sural cutaneous</strong> branch (outer upper calf, the lateral end of the incision) is included.</li>
<li>A long posterior flap can reach the territory of the posterior femoral cutaneous nerve high on the calf in some people: if the top of the flap is sensate, the surgeon infiltrates or you add a posterior femoral cutaneous injection.</li>
<li><strong>Anticoagulated patient</strong>: the popliteal fossa and adductor canal are superficial and compressible, which is why this is often the anaesthetic of choice when spinal is not allowed.</li>
<li><strong>Guillotine (staged) amputation</strong> for sepsis, then a formal amputation days later: a catheter placed at the first operation can serve both.</li></ul>`));

  sec.append(el('h3', { id: 'th-amp-tq', text: 'Tourniquets' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), '<p>Vascular surgeons often amputate without a tourniquet; orthopaedic and trauma surgeons often use one. Tourniquet pain is a deep, ischaemic pain that builds with time; it needs <strong>all the nerves of the limb blocked above the cuff</strong> (sciatic, femoral, obturator, and the skin under the cuff) and even then is tolerated only for a limited period. For a below-knee amputation under a popliteal block, a <strong>calf or no tourniquet</strong> fits the block; a thigh cuff does not. The <a href="../foot-ankle/#fa-anat-tq">tourniquet guide</a> on the foot and ankle page has more.</p>'));

  const cath = tierPart(sec, 2);
  cath.append(el('h3', { id: 'th-amp-catheters', text: 'Catheters and phantom limb pain' }));
  cath.append(fill(el('div', { class: 'tb-prose' }), `<p><strong>Three kinds of pain</strong> follow an amputation: <strong>wound (residual limb) pain</strong>, which settles with healing; <strong>phantom sensations</strong>, which nearly everyone has; and <strong>phantom limb pain</strong>, pain felt in the missing part. About <strong>six in ten</strong> amputees report phantom pain at some point. Risk factors: severe pain before the amputation, a more proximal (above-knee) amputation, persistent stump pain, a lower-limb amputation and early phantom sensations. Mechanisms run from the cut nerve (neuroma, ectopic firing) through spinal sensitisation to cortical reorganisation.</p>
<ul>
<li><strong>Perineural catheters</strong> (most often placed by the surgeon in the sciatic or tibial nerve sheath, infusing for several days): pooled studies show <strong>lower pain scores</strong> after surgery; the opioid-sparing effect disappears when only randomised trials are counted; there is <strong>no demonstrated effect</strong> on phantom pain, chronic stump pain or mortality. Low risk, cheap, and patients are comfortable: worth doing, but don’t promise to prevent phantom pain.</li>
<li>A double-blind trial of perineural levobupivacaine 0.125% (a 10 ml bolus, then 8 ml an hour for four days) after above- and below-knee amputation found no difference in phantom pain at six months, but was underpowered; high early morphine use went with worse phantom pain later. A large UK multicentre trial of surgeon-placed catheters (several hundred patients) has been recruiting; results are awaited.</li>
<li><strong>Pre-emptive epidural</strong> analgesia started the day before and continued after amputation did not prevent phantom or stump pain in a randomised trial.</li>
<li><strong>Treating established phantom pain</strong>: a six-day ambulatory perineural infusion of ropivacaine (sciatic and femoral, or brachial plexus) reduced established phantom pain a month later in a multicentre placebo-controlled trial, with little benefit left at a year.</li>
<li>For the ward: regular paracetamol, an NSAID only if the kidneys allow, opioid by need (not by habit), and early pain team input. Gabapentinoids have not been shown to prevent phantom pain. Address pain before the operation: it is the strongest risk factor you can still change.</li></ul>`));
  // The catheter set-up carries a bolus and infusion the ward looks after (and counts in the daily dose): MO level.
  const cathHow = tierPart(sec, 1, false);
  cathHow.append(details({
    id: 'th-amp-cath-how', summary: 'How a surgeon-placed sciatic catheter is usually set up',
    body: '<p>Before the sciatic nerve is divided, the surgeon passes a catheter (an epidural catheter works) into the <strong>nerve sheath</strong>, proximally for several centimetres, and brings it out through the skin away from the wound. A bolus (for example 10 ml of 0.125–0.25% bupivacaine-family local anaesthetic) is given before the end of the operation, then an infusion of a few millilitres an hour of a dilute solution for three to five days. Count it in the daily dose, label it clearly as a perineural line, and agree who removes it.</p>',
  }));

  // Deeper layers as the block chapters show them: a section with its heading, the body in a collapsed disclosure.
  const layer = (id, title, summary, html, badge) => {
    const s = el('section', { class: `tb-bsec tb-bsec--${id.replace('th-amp-', '')}`, id, 'aria-labelledby': `${id}-h`, 'data-tier': '3' });
    if (badge) s.append(tierBadge(3));
    s.append(el('h3', { id: `${id}-h`, text: title }));
    s.append(details({ summary, body: html }));
    sec.append(s);
  };
  layer('th-amp-consultant', 'Consultant corner', 'Five subspecialty points', `<ul>
<li><strong>Mix to save milligrams?</strong> Many series used a long-acting drug mixed with lidocaine or mepivacaine for a faster onset and less long-acting drug. The toxicities <strong>add</strong>: count each drug as a fraction of its own maximum and keep the sum below one. Mixing shortens the block.</li>
<li><strong>Lumbar plexus instead of three blocks?</strong> A lumbar plexus (psoas compartment) block covers the femoral and LFCN, and usually the obturator, in one injection, and with a parasacral or transgluteal sciatic it is the textbook anaesthetic for an above-knee amputation. It is deep, close to the epidural space and the kidney, and non-compressible: a poor choice in the anticoagulated, which is most of these patients.</li>
<li><strong>Bilateral amputations</strong>: block and operate on one side at a time, and do the second side’s blocks only when the dose allows; or use a different anaesthetic for the second side.</li>
<li><strong>Oedema and infection</strong> make the image poor and spread unpredictable: use the stimulator as well, scan away from infected tissue, and prefer levels above the infection.</li>
<li><strong>Delirium, mortality and goals of care</strong>: thirty-day mortality after major amputation is high (in the Singapore series, about one in eight at 30 days and nearly half at a year). Blocks avoid opioid-heavy recovery, which helps with delirium; agree ceilings of care before the day.</li>
</ul>`, true);
  layer('th-amp-frontier', 'Frontier: what’s new', 'Four things that are new or being tested', `<ul>
<li><strong>Targeted muscle reinnervation</strong>: surgeons join the cut nerve end to a motor branch of a nearby muscle instead of letting it form a neuroma. In a small randomised trial in amputees with established neuroma or phantom pain, it was favoured over excising and burying the nerve; it is increasingly done at the primary amputation. <strong>Regenerative peripheral nerve interfaces</strong> (the nerve end wrapped in a small free muscle graft) are an alternative nerve-end operation; they were not part of that trial.</li>
<li><strong>Percutaneous peripheral nerve stimulation</strong> of the sciatic and femoral nerves for 60 days reduced chronic post-amputation pain in a small placebo-controlled trial, with benefit at 12 months in most of those treated.</li>
<li><strong>Cryoneurolysis</strong> of the sciatic and femoral nerves did not reduce established phantom pain in a multicentre sham-controlled trial; a 2026 pilot freezing all four thigh nerves in above-knee amputees also found no benefit.</li>
<li><strong>Ambulatory catheters</strong>: the six-day infusion trial suggests a window to treat established phantom pain at home; whether an early, longer perineural infusion can prevent it is the question the current catheter trials are answering.</li>
</ul>`);

  const qs = [
    { source: 'MMed OSCE 2020', q: 'Which nerves need to be blocked for an above-knee amputation?', points: [
      'Sciatic nerve (above the cut: subgluteal, transgluteal, parasacral or anterior), for the hamstrings, the back of the femur and everything below.',
      'Posterior femoral cutaneous nerve, for the skin of the back of the thigh (posterior flap): caught at the transgluteal or parasacral level, or blocked separately.',
      'Femoral nerve, for the front of the thigh, quadriceps and much of the femur.',
      'Lateral femoral cutaneous nerve, for the outer thigh.',
      'Obturator nerve, for the adductors, part of the femur and a variable patch of inner thigh skin.',
    ] },
    { source: 'Practice question', q: 'A 74-year-old with wet gangrene of the foot, on aspirin and clopidogrel, with an ejection fraction of 25%, is listed for a below-knee amputation tonight. Outline your anaesthetic plan.', points: [
      'Assess: sepsis severity, fluid status, heart failure, renal function, glucose, potassium, coagulation and the antiplatelet timing; goals of care.',
      'Neuraxial is generally avoided on dual antiplatelet therapy; general anaesthesia risks haemodynamic instability.',
      'Plan: ultrasound-guided popliteal sciatic + saphenous (adductor canal) or femoral block, superficial and compressible, with light sedation; arterial line if septic.',
      'Dose: count the total (for example popliteal 15 ml 0.4% + adductor canal 10 ml 0.4% ropivacaine = 100 mg); lipid emulsion available.',
      'No thigh tourniquet (or a calf one); ask the surgeon for a sciatic sheath catheter.',
      'Postoperative: HDU if needed, multimodal analgesia, pain team, delirium prevention; discuss phantom pain.',
    ] },
    { source: 'Practice question', q: 'What is phantom limb pain? How common is it, who gets it, and does a perineural catheter prevent it?', points: [
      'Pain felt in the amputated part, distinct from residual limb (stump) pain and from non-painful phantom sensations.',
      'About six in ten amputees report it at some point.',
      'Risk factors: severe pre-amputation pain, proximal (above-knee) level, persistent stump pain, lower-limb amputation, early phantom sensations.',
      'Mechanisms: peripheral (neuroma, ectopic firing), spinal (central sensitisation), supraspinal (cortical reorganisation).',
      'Perineural catheters lower early pain scores; no proven effect on phantom pain or chronic stump pain. Pre-emptive epidural did not prevent it in a randomised trial.',
      'Treatment of established pain: multimodal and neuropathic agents, mirror therapy and rehabilitation; a six-day perineural infusion reduced established phantom pain at four weeks in one trial; targeted muscle reinnervation for neuroma-related pain.',
    ] },
  ];
  // Same markup as the block chapters' exam corner (shared/regional/js/block.js), so both look alike.
  const exSec = el('section', { class: 'tb-bsec tb-bsec--exam tb-bsec--examcorner', id: 'th-amp-exam', 'aria-labelledby': 'th-amp-exam-h', 'data-tier': '2' });
  exSec.append(tierBadge(2));
  exSec.append(el('h3', { id: 'th-amp-exam-h', text: 'Exam corner' }));
  const list = el('div', { class: 'tb-exam' });
  qs.forEach((x, i) => {
    const art = el('article', { class: 'tb-exam-q', id: `th-amp-exam-${i + 1}` });
    art.append(el('p', { class: 'tb-exam-src', text: x.source }), fill(el('div', { class: 'tb-exam-text' }), `<p>${x.q}</p>`));
    const d = el('details', { class: 'tb-details tb-exam-ans' });
    d.append(el('summary', { text: 'Model answer points' }), fill(el('ul', { class: 'tb-exam-pts' }), x.points.map((p) => `<li>${p}</li>`).join('')));
    art.append(d);
    list.append(art);
  });
  exSec.append(list);
  sec.append(exSec);
  registerSearch([{ title: 'Phantom limb pain and perineural catheters', text: 'phantom limb pain stump residual limb pain perineural catheter sciatic sheath catheter levobupivacaine epidural pre-emptive cryoneurolysis targeted muscle reinnervation TMR peripheral nerve stimulation', id: 'th-amp-catheters' }]);
}

// ================================================================== block combinations for the whole limb
const COMBOS = [
  { op: 'Hip fracture: emergency department analgesia', blocks: [['Supra-inguinal fascia iliaca', '../hip/#ch-fib', 40, 0.2]], alt: 'or PENG 20 ml 0.2% (40 mg)' },
  { op: 'Hip arthroplasty or hemiarthroplasty', blocks: [['PENG', '../hip/#ch-peng', 20, 0.2], ['Lateral femoral cutaneous', '../hip/#ch-lfcn', 5, 0.2]] },
  { op: 'Femoral shaft fracture, thigh surgery (front)', blocks: [['Femoral', '../hip/#ch-femoral', 15, 0.4]], alt: 'or fascia iliaca for the lateral thigh too' },
  { op: 'Knee replacement (with surgeon infiltration)', blocks: [['Adductor canal, single shot', '../knee/#ch-adductor-canal', 10, 0.4]], alt: 'plus the surgeon’s periarticular infiltration (counts too)' },
  { op: 'Knee replacement (no infiltration)', blocks: [['Femoral triangle, three targets', '../knee/#adductor-canal-tkr', 25, 0.2], ['iPACK', '../knee/#ch-ipack', 20, 0.2]] },
  { op: 'Knee surgery under blocks alone (thigh cuff)', blocks: [['Sciatic, subgluteal', '#ch-sciatic', 20, 0.5], ['Femoral', '../hip/#ch-femoral', 15, 0.4]], alt: 'add obturator for a long cuff time' },
  { op: 'Ankle fracture fixation, calf cuff', blocks: [['Popliteal sciatic', '../foot-ankle/#ch-popliteal', 15, 0.4], ['Saphenous (below the knee)', '../foot-ankle/#ch-saphenous', 5, 0.5]] },
  { op: 'Forefoot (bunion, toes), ankle cuff', blocks: [['Ankle block', '../foot-ankle/#ch-ankle', 17, 0.5]] },
  { op: 'Below-knee amputation, no thigh cuff', blocks: [['Popliteal sciatic', '../foot-ankle/#ch-popliteal', 15, 0.4], ['Adductor canal', '../knee/#ch-adductor-canal', 10, 0.4]] },
  { op: 'Below-knee amputation, thigh cuff', blocks: [['Sciatic, subgluteal', '#ch-sciatic', 15, 0.5], ['Femoral', '../hip/#ch-femoral', 15, 0.4], ['Obturator', '../knee/#ch-obturator', 10, 0.375]] },
  { op: 'Above-knee amputation', blocks: [['Sciatic, transgluteal', '#sciatic-ap-tg', 15, 0.5], ['Femoral', '../hip/#ch-femoral', 15, 0.4], ['Lateral femoral cutaneous', '../hip/#ch-lfcn', 5, 0.2], ['Obturator', '../knee/#ch-obturator', 10, 0.375]] },
];

export function renderCombinations(sec) {
  sec.append(el('h2', { id: 'th-cmb-h', text: 'Block combinations for the whole lower limb' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'One table for the whole leg: the operation, the blocks that cover it, and what they add up to. Each block links to its chapter. Doses are this section’s standard doses; in the big sets a few are trimmed (15 ml for the sciatic, 0.375% for the obturator) so that the set fits the ceiling.'));
  sec.append(keyPoints([
    'Every block’s milligrams add up, and so does the surgeon’s infiltration.',
    'Ceiling here: 3 mg/kg ropivacaine (210 mg at 70 kg). Less in the frail, heart and liver failure.',
    'Pick the most distal block that covers the operation and the cuff: less weakness, less drug.',
    'Big sets: trim the strength, not the nerves; or stage the blocks (one side, then the other).',
  ], { title: 'Rapid fire' }));
  const rows = COMBOS.map((c) => {
    const total = c.blocks.reduce((s, b) => s + mg(b[2], b[3]), 0);
    const blocks = c.blocks.map(([n, h, v, k]) => `<a href="${h}">${n}</a>: ${v} ml ${k}% (${fmt(mg(v, k))} mg)`).join('<br>') + (c.alt ? `<br><span class="th-cmb-alt">${c.alt}</span>` : '');
    return [{ th: true, html: c.op }, blocks, `<strong>${fmt(total)} mg</strong>`, `${Math.round((total / 210) * 100)}%`];
  });
  sec.append(table({ caption: 'Operation → blocks → total ropivacaine', head: ['Operation', 'Blocks (ropivacaine)', 'Total', 'Of 210 mg (70 kg)'], rows, id: 'th-cmb-table' }));
  sec.append(callout('note', {
    title: 'Surgical infiltration counts',
    body: 'Periarticular infiltration for a knee replacement commonly uses several hundred milligrams of ropivacaine on its own. If the surgeon infiltrates, agree the total beforehand: the block dose may need to come down, or the infiltration does.',
  }));
  sec.append(legViewsFigure({
    id: 'th-cmb-fig', title: 'Which nerve, which block',
    views: [
      { view: 'front', tint: true, labels: true, areas: [{ zones: ['lfcn', 'femoral-ant', 'obturator', 'saphenous', 'lat-cut-calf', 'sup-peroneal-leg'], density: 'dense' }], caption: 'Front' },
      { view: 'back', tint: true, labels: true, areas: [{ zones: ['cluneal', 'pfcn', 'lfcn', 'obturator', 'sural', 'lat-cut-calf', 'saphenous-leg', 'calcaneal'], density: 'dense' }], caption: 'Back' },
    ],
    caption: '<ul class="th-cmb-key"><li><strong>LFCN</strong>: <a href="../hip/#ch-lfcn">LFCN block</a> or <a href="../hip/#ch-fib">supra-inguinal fascia iliaca</a>.</li><li><strong>Femoral</strong> (front of the thigh) and <strong>Saph</strong> (saphenous): <a href="../hip/#ch-femoral">femoral</a>, <a href="../hip/#ch-fib">fascia iliaca</a>; saphenous alone at the <a href="../knee/#ch-adductor-canal">adductor canal</a> or <a href="../foot-ankle/#ch-saphenous">below the knee</a>.</li><li><strong>Obt</strong>: <a href="../knee/#ch-obturator">obturator block</a> (not reliably by fascia iliaca).</li><li><strong>PFCN</strong>: <a href="#sciatic-pfcn">its own block</a>, or a <a href="#sciatic-ap-tg">transgluteal</a> or <a href="#sciatic-ap-ps">parasacral</a> sciatic block.</li><li><strong>Below the knee</strong> (lateral calf, SPN, sural, sole, heel): sciatic at any level (<a href="../foot-ankle/#ch-popliteal">popliteal</a>, <a href="#ch-sciatic">subgluteal</a>); the foot alone by <a href="../foot-ankle/#ch-ankle">ankle block</a>.</li><li><strong>Cluneal</strong> (buttock): not a limb block; the inferior cluneal nerves come from the posterior femoral cutaneous nerve.</li></ul><p>Schematic skin territories of the right lower limb. Joints and bones: hip (femoral, obturator, sciatic and gluteal branches), knee (femoral, obturator, sciatic), ankle and foot (sciatic, with the saphenous medially).</p>',
  }));
  registerSearch([{ title: 'Block combinations for the lower limb', text: 'combination total dose hip fracture knee replacement TKR ankle fracture bunion BKA AKA amputation thigh tourniquet PENG fascia iliaca femoral adductor canal iPACK popliteal ankle obturator sciatic', id: 'th-cmb-table' }]);
}
