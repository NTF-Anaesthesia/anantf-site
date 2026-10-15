// Calculators and builders (CONTENT.md, "TOOLS"). Each tool draws its own form and works out its answer as you type.
// The sums are in calc.js (tested); this file is only the forms.
import { md, esc } from './md.js';
import * as C from './calc.js';
import { patient } from './store.js';
import { drugById, doseLine, labelChip, weightsNow } from './drugs-ui.js';

const { fmt } = C;
const num = v => { const s = String(v ?? '').trim(); return s === '' ? null : Number(s); };
const range = (a, b) => (fmt(a) === fmt(b) ? fmt(a) : `${fmt(a)}–${fmt(b)}`);
let seq = 0;

/** A labelled number box. */
function field(id, label, unit, value = '', attrs = '') {
  return `<label for="${id}">${label}${unit ? ` <span class="muted">${unit}</span>` : ''}<input id="${id}" type="number" inputmode="decimal" value="${value ?? ''}" ${attrs}></label>`;
}
/** A row of buttons that act as one choice (radio). */
function seg(name, legend, opts, value) {
  return `<fieldset class="seg"><legend>${legend}</legend><div class="segrow">${opts.map(([v, t]) => `<label class="segopt"><input type="radio" name="${name}" value="${esc(v)}"${String(v) === String(value) ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div></fieldset>`;
}
/** Yes/no items as tick boxes. */
function ticks(name, items) {
  return `<fieldset class="ticks"><legend class="visually-hidden">${name}</legend>${items.map(([k, t]) => `<label class="tick"><input type="checkbox" name="${name}" value="${k}"><span>${md(t)}</span></label>`).join('')}</fieldset>`;
}
const val = (host, name) => host.querySelector(`input[name="${name}"]:checked`)?.value ?? null;
const checked = (host, name) => Object.fromEntries([...host.querySelectorAll(`input[name="${name}"]`)].map(i => [i.value, i.checked]));
const out = html => `<div class="tool-out" role="status" aria-live="polite">${html}</div>`;
const P = () => patient();
const sexOpts = [['m', 'Male'], ['f', 'Female']];

/** Each tool: title, group, summary, form(prefix) → HTML, calc(host, prefix) → result HTML. */
export const TOOLS = {
  weights: {
    title: 'Weight, BMI and dosing weights', group: 'dosing',
    summary: 'BMI, ideal, lean and adjusted body weight from weight, height and sex.',
    form: p => `<div class="three">${field(`${p}w`, 'Weight', 'kg', P().weight, 'min="1" max="400" step="0.1"')}${field(`${p}h`, 'Height', 'cm', P().height, 'min="100" max="250"')}${seg(`${p}s`, 'Sex', sexOpts, P().sex)}</div>`,
    calc: (h, p) => {
      const w = C.bodyWeights({ weight: num(h.querySelector(`#${p}w`).value), height: num(h.querySelector(`#${p}h`).value), sex: val(h, `${p}s`) });
      if (w.tbw == null) return '<p class="muted">Enter the weight.</p>';
      if (w.bmi == null) return '<p class="muted">Add height and sex.</p>';
      const band = w.bmi < 18.5 ? 'underweight' : w.bmi < 25 ? 'normal' : w.bmi < 30 ? 'overweight' : w.bmi < 40 ? 'obese' : 'severely obese (40 or more)';
      return `<dl class="result"><dt>BMI</dt><dd><b>${fmt(w.bmi)}</b> kg/m² <span class="muted">${band}</span></dd><dt>Ideal body weight</dt><dd><b>${fmt(w.ibw)}</b> kg</dd><dt>Lean body weight</dt><dd><b>${fmt(w.lbw)}</b> kg</dd><dt>Adjusted body weight</dt><dd><b>${fmt(w.abw)}</b> kg</dd></dl>${w.warnings.map(x => `<p class="warn-text">${esc(x)}</p>`).join('')}<p class="muted small">Ideal: Devine. Lean: Janmahasatian. Adjusted: ideal + 0.4 × (total − ideal). See [obesity](#/learn/patients/obesity) for which drug uses which weight.</p>`;
    },
  },

  rsi: {
    title: 'RSI drug sheet', group: 'dosing',
    summary: 'Pre-calculated doses and volumes for a rapid sequence induction.',
    form: p => `<div class="three">${field(`${p}w`, 'Weight', 'kg', P().weight, 'min="1" max="400" step="0.1"')}${field(`${p}h`, 'Height', 'cm', P().height, 'min="100" max="250"')}${seg(`${p}s`, 'Sex', sexOpts, P().sex)}</div>
      ${seg(`${p}ind`, 'Induction agent', [['propofol', 'Propofol'], ['ketamine', 'Ketamine'], ['etomidate', 'Etomidate'], ['thiopentone', 'Thiopentone']], 'propofol')}
      ${seg(`${p}nmb`, 'Muscle relaxant', [['suxamethonium', 'Suxamethonium'], ['rocuronium', 'Rocuronium']], 'suxamethonium')}`,
    calc: (h, p) => {
      const w = C.bodyWeights({ weight: num(h.querySelector(`#${p}w`).value), height: num(h.querySelector(`#${p}h`).value), sex: val(h, `${p}s`) });
      if (w.tbw == null) return '<p class="muted">Enter the weight.</p>';
      const pick = (id, label = 'RSI') => { const d = drugById[id]; if (!d) return ''; const dose = d.doses.find(x => x.label === label) || d.doses.find(x => x.per); return dose ? `<li class="rsi-row">${labelChip(d)}<div><strong>${esc(d.name)}</strong><ul class="doses">${doseLine(d, dose, w)}</ul></div></li>` : ''; };
      const nmb = val(h, `${p}nmb`);
      return `<ul class="dtable">${pick(val(h, `${p}ind`))}${pick('fentanyl')}${pick(nmb)}${nmb === 'rocuronium' ? pick('sugammadex', 'Immediate reversal') : ''}</ul>
      <p class="muted small">Doses are a starting point your consultant will adjust: less for the elderly, frail or shocked. Check each syringe against the label with a second person.</p>`;
    },
  },

  'la-max': {
    title: 'Local anaesthetic maximum dose', group: 'dosing',
    summary: 'The most local anaesthetic for this patient, in mg and in mL at a given strength.',
    form: p => `<div class="three">${field(`${p}w`, 'Weight', 'kg', P().weight, 'min="1" max="400" step="0.1"')}${field(`${p}h`, 'Height', 'cm', P().height, 'min="100" max="250"')}${seg(`${p}s`, 'Sex', sexOpts, P().sex)}</div>
      <label for="${p}d">Drug<select id="${p}d">${Object.entries(C.LA).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('')}</select></label>
      ${seg(`${p}pc`, 'Strength', [['0.25', '0.25%'], ['0.375', '0.375%'], ['0.5', '0.5%'], ['1', '1%'], ['2', '2%']], '0.5')}`,
    calc: (h, p) => {
      const w = C.bodyWeights({ weight: num(h.querySelector(`#${p}w`).value), height: num(h.querySelector(`#${p}h`).value), sex: val(h, `${p}s`) });
      const r = C.laMax({ drug: h.querySelector(`#${p}d`).value, w, percent: num(val(h, `${p}pc`)) });
      if (!r) return '<p class="muted">Enter the weight.</p>';
      const d = C.LA[h.querySelector(`#${p}d`).value];
      return `<dl class="result"><dt>Maximum</dt><dd><b>${fmt(r.mg)} mg</b>${r.capped ? ` <span class="muted">(the ${d.cap} mg ceiling)</span>` : ''}</dd><dt>At ${esc(val(h, `${p}pc`))}%</dt><dd><b>${fmt(r.ml)} mL</b> <span class="muted">(${fmt(r.mgml)} mg/mL)</span></dd><dt>Based on</dt><dd>${d.mgkg} mg/kg × ${fmt(r.kg)} kg ${r.basis === 'LBW' ? 'lean body weight (BMI 30 or more)' : 'total body weight'}</dd></dl>
      <aside class="callout warn"><p class="callout-t">Caution</p><ul><li>Doses of different local anaesthetics add up: if you use two, the total must stay under the limit.</li><li>This is a ceiling, not a target. Use the least that works; take more care in the elderly, frail, and in heart, liver or kidney disease.</li><li>Know the signs of toxicity and where the lipid is: [local anaesthetic toxicity](#/crisis/last).</li></ul></aside>`;
    },
  },

  infusions: {
    title: 'Infusion rates', group: 'dosing',
    summary: 'Turn a dose (mcg/kg/min, U/h) into mL/h at the standard strength, and back.',
    form: p => {
      const opts = INFUSIONS.filter(x => drugById[x.id]).map(x => `<option value="${x.id}">${esc(drugById[x.id].name)}</option>`).join('');
      return `${field(`${p}w`, 'Weight', 'kg', P().weight, 'min="1" max="400" step="0.1"')}<label for="${p}d">Drug<select id="${p}d">${opts}</select></label>
      <p class="muted small" id="${p}conc"></p>
      <div class="two">${field(`${p}dose`, 'Dose', `<span id="${p}unit"></span>`, '', 'min="0" step="any"')}${field(`${p}rate`, 'Rate', 'mL/h', '', 'min="0" step="any"')}</div>`;
    },
    calc: (h, p, ev) => {
      const id = h.querySelector(`#${p}d`).value, spec = INFUSIONS.find(x => x.id === id), d = drugById[id], ic = d?.infusionConc || d?.conc;
      if (!spec || !ic) return '<p class="muted">Choose a drug.</p>';
      h.querySelector(`#${p}unit`).textContent = spec.unit;
      h.querySelector(`#${p}conc`).innerHTML = `Standard strength: ${md(d.infusionPrep || d.prep || '')} → <span class="v">${fmt(ic.value)} ${esc(ic.unit)}</span>`;
      const weight = num(h.querySelector(`#${p}w`).value), dose = h.querySelector(`#${p}dose`), rate = h.querySelector(`#${p}rate`);
      if (ev?.target === h.querySelector(`#${p}d`)) { dose.value = ''; rate.value = ''; }
      const args = { unit: spec.unit, weight, conc: ic };
      if (spec.unit.includes('/kg/') && !C.okNum(weight, 0.5, 400)) return '<p class="muted">Enter the weight.</p>';
      if (ev?.target === rate && num(rate.value) != null) { const x = C.infusionDose({ ...args, rate: num(rate.value) }); dose.value = x == null ? '' : C.nice(x); }
      else if (num(dose.value) != null) { const x = C.infusionRate({ ...args, dose: num(dose.value) }); rate.value = x == null ? '' : C.nice(x); }
      const lo = C.infusionRate({ ...args, dose: spec.range[0] }), hi = C.infusionRate({ ...args, dose: spec.range[1] });
      return `<p>Usual range <span class="v">${spec.range[0]}–${spec.range[1]} ${esc(spec.unit)}</span> = <b>${range(lo, hi)} mL/h</b>${spec.unit.includes('/kg/') ? ` for ${fmt(weight)} kg` : ''}.</p>${spec.note ? `<p class="muted small">${md(spec.note)}</p>` : ''}`;
    },
  },

  fluids: {
    title: 'Maintenance fluids and fasting deficit', group: 'fluids',
    summary: 'The 4-2-1 rule, and the deficit after fasting.',
    form: p => `<div class="two">${field(`${p}w`, 'Weight', 'kg', P().weight, 'min="1" max="400" step="0.1"')}${field(`${p}f`, 'Hours fasted', 'h', '', 'min="0" max="72" step="0.5"')}</div>`,
    calc: (h, p) => {
      const w = num(h.querySelector(`#${p}w`).value), m = C.maintenance421(w);
      if (m == null) return '<p class="muted">Enter the weight.</p>';
      const hrs = num(h.querySelector(`#${p}f`).value), def = C.fastingDeficit(w, hrs);
      return `<dl class="result"><dt>Maintenance</dt><dd><b>${fmt(m)} mL/h</b> <span class="muted">(${fmt(m * 24)} mL a day)</span></dd>${def != null ? `<dt>Fasting deficit</dt><dd><b>${fmt(def)} mL</b> <span class="muted">${fmt(m)} × ${fmt(hrs)} h</span></dd>` : ''}</dl>
      <p class="muted small">4 mL/kg/h for the first 10 kg, 2 for the next 10, 1 for each kg after that. Adults who drank clear fluids until 2 hours before rarely have a real deficit; replace losses and give maintenance, not the whole sum at once.</p>`;
    },
  },

  abl: {
    title: 'Allowable blood loss', group: 'fluids',
    summary: 'How much blood can be lost before reaching a chosen haematocrit.',
    form: p => `${field(`${p}w`, 'Weight', 'kg', P().weight, 'min="0.5" max="400" step="0.1"')}<label for="${p}g">Patient<select id="${p}g">${Object.entries(C.BLOOD_VOLUME).map(([k, v]) => `<option value="${k}"${k === (P().sex === 'f' ? 'woman' : 'man') ? ' selected' : ''}>${esc(v.label)} (${v.mlkg} mL/kg)</option>`).join('')}</select></label>
      <div class="two">${field(`${p}a`, 'Starting haematocrit', '%', '', 'min="10" max="70" step="0.5"')}${field(`${p}b`, 'Lowest acceptable', '%', '', 'min="10" max="70" step="0.5"')}</div>`,
    calc: (h, p) => {
      const r = C.abl({ weight: num(h.querySelector(`#${p}w`).value), group: h.querySelector(`#${p}g`).value, hctStart: num(h.querySelector(`#${p}a`).value), hctTarget: num(h.querySelector(`#${p}b`).value) });
      if (!r) return '<p class="muted">Enter the weight and both haematocrits.</p>';
      return `<dl class="result"><dt>Blood volume</dt><dd><b>${fmt(r.ebv)} mL</b></dd><dt>Allowable loss</dt><dd><b>${fmt(r.abl)} mL</b></dd></dl><p class="muted small">ABL = blood volume × (start − lowest) ÷ start. Haemoglobin works in place of haematocrit. A guide only: watch the patient, the surgery and the trend.</p>`;
    },
  },

  convert: {
    title: 'Percent, ratio and mg/mL', group: 'dosing',
    summary: '1% = 10 mg/mL; 1:1000 = 1 mg/mL. Convert either way.',
    form: p => `<div class="two">${field(`${p}pc`, 'Percent strength', '%', '', 'min="0" step="any"')}${field(`${p}r`, 'Ratio 1 in', '', '', 'min="1" step="any"')}</div>`,
    calc: (h, p) => {
      const pc = num(h.querySelector(`#${p}pc`).value), r = num(h.querySelector(`#${p}r`).value);
      const lines = [];
      if (pc != null) lines.push(`<dt>${fmt(pc)}%</dt><dd><b>${fmt(C.percentToMgMl(pc))} mg/mL</b></dd>`);
      if (r != null) { const m = C.ratioToMgMl(r); lines.push(`<dt>1:${r.toLocaleString('en-GB')}</dt><dd><b>${fmt(m)} mg/mL</b> = ${fmt(m * 1000)} mcg/mL</dd>`); }
      return `${lines.length ? `<dl class="result">${lines.join('')}</dl>` : ''}<table class="mini"><caption>Worth knowing</caption><tbody>
        <tr><th scope="row">Lignocaine 1%</th><td>10 mg/mL</td></tr><tr><th scope="row">Lignocaine 2%</th><td>20 mg/mL</td></tr>
        <tr><th scope="row">Bupivacaine 0.5%</th><td>5 mg/mL</td></tr><tr><th scope="row">Ropivacaine 0.75%</th><td>7.5 mg/mL</td></tr>
        <tr><th scope="row">Adrenaline 1:1000</th><td>1 mg/mL</td></tr><tr><th scope="row">Adrenaline 1:10,000</th><td>100 mcg/mL</td></tr>
        <tr><th scope="row">Adrenaline 1:200,000</th><td>5 mcg/mL</td></tr></tbody></table>`;
    },
  },

  stopbang: {
    title: 'STOP-BANG', group: 'scores',
    summary: 'Screening for obstructive sleep apnoea before surgery.',
    form: p => ticks(`${p}i`, [['snore', '**S**nore loudly (heard through a closed door)'], ['tired', '**T**ired, fatigued or sleepy in the day'], ['observed', '**O**bserved to stop breathing or choke in sleep'], ['pressure', 'High blood **p**ressure, treated or not'], ['bmi', '**B**MI over 35'], ['age', '**A**ge over 50'], ['neck', '**N**eck circumference over 40 cm'], ['male', 'Male **g**ender']]),
    calc: (h, p) => {
      const r = C.stopBang(checked(h, `${p}i`));
      return `<p class="score-line"><b>${r.score} of 8</b>: <span class="band ${r.band}">${r.band} risk</span> of moderate to severe sleep apnoea</p><p class="muted small">0–2 low, 3–4 intermediate, 5–8 high. Also high if 2 or more of the first four plus male, BMI over 35 or a large neck. Tell your consultant about intermediate or high scores: they change the plan for opioids, sedation and where the patient goes after.</p>`;
    },
  },

  apfel: {
    title: 'PONV risk (Apfel)', group: 'scores',
    summary: 'Simplified risk of nausea and vomiting after a general anaesthetic.',
    form: p => ticks(`${p}i`, [['female', 'Female'], ['nonSmoker', 'Non-smoker'], ['history', 'Past PONV or motion sickness'], ['opioids', 'Opioids likely after surgery']]),
    calc: (h, p) => {
      const r = C.apfel(checked(h, `${p}i`));
      return `<p class="score-line"><b>${r.score} of 4</b>: about <b>${r.risk}%</b> risk of PONV</p><p class="muted small">Risk with 0, 1, 2, 3, 4 factors: 10, 21, 39, 61, 79%. More factors, more prevention: see [PONV](#/learn/pacu/ponv).</p>`;
    },
  },

  rcri: {
    title: 'Revised Cardiac Risk Index', group: 'scores',
    summary: 'Six-item estimate of heart complications after non-cardiac surgery.',
    form: p => ticks(`${p}i`, [['surgery', 'High-risk surgery: inside the chest or abdomen, or vascular above the groin'], ['ihd', 'Ischaemic heart disease'], ['hf', 'Heart failure'], ['cvd', 'Stroke or TIA'], ['insulin', 'Diabetes treated with insulin'], ['creatinine', 'Creatinine over `177 µmol/L`']]),
    calc: (h, p) => {
      const r = C.rcri(checked(h, `${p}i`));
      return `<p class="score-line"><b>${r.score} point${r.score === 1 ? '' : 's'}</b>: about <b>${r.risk}%</b> risk of heart attack, cardiac arrest or death within 30 days</p><p class="muted small">Risks by points (0, 1, 2, 3 or more): 3.9, 6.0, 10.1, 15%. A score of 1 or more, or poor effort tolerance, is worth a word with your consultant.</p>`;
    },
  },

  aldrete: {
    title: 'PACU discharge score (modified Aldrete)', group: 'scores',
    summary: 'Five signs scored 0–2; ready for the ward at 9 or more.',
    form: p => ALDRETE.map(([k, t, o]) => seg(`${p}${k}`, t, o.map((x, i) => [i, `${i}: ${x}`]))).join(''),
    calc: (h, p) => {
      const r = C.aldrete(Object.fromEntries(ALDRETE.map(([k]) => [k, val(h, `${p}${k}`) == null ? null : +val(h, `${p}${k}`)])));
      if (!r.complete) return '<p class="muted">Score all five.</p>';
      return `<p class="score-line"><b>${r.score} of 10</b>: ${r.ready ? '<span class="band low">meets the score for discharge</span>' : '<span class="band high">not ready</span>'}</p><p class="muted small">Also needed: pain and nausea controlled, no bleeding, the anaesthetic chart and orders complete, and at least 30 minutes in PACU. The score is one part of the decision, not all of it.</p>`;
    },
  },

  paeds: {
    title: "Children's quick sheet", group: 'dosing',
    summary: 'Weight estimate, tube and airway sizes and key doses by age.',
    form: p => `<div class="two">${field(`${p}y`, 'Age', 'years', '', 'min="1" max="14" step="1"')}${field(`${p}m`, 'or age under 1', 'months', '', 'min="0" max="11" step="1"')}</div>${field(`${p}w`, 'Weight if known', 'kg', '', 'min="0.5" max="80" step="0.1"')}`,
    calc: (h, p) => {
      const years = num(h.querySelector(`#${p}y`).value), months = num(h.querySelector(`#${p}m`).value);
      const est = C.paedsWeight({ months, years });
      const w = num(h.querySelector(`#${p}w`).value) ?? est;
      if (!C.okNum(w, 0.5, 80)) return '<p class="muted">Enter the age or the weight.</p>';
      const t = years != null ? C.paedsTube(years) : null;
      const kg = x => fmt(x * w);
      return `<dl class="result"><dt>Weight</dt><dd><b>${fmt(w)} kg</b>${num(h.querySelector(`#${p}w`).value) == null ? ' <span class="muted">estimated</span>' : ''}</dd>
        ${t ? `<dt>Tracheal tube</dt><dd>cuffed <b>${fmt(t.cuffed)}</b> mm, uncuffed ${fmt(t.uncuffed)} mm; oral length about <b>${fmt(t.oral)} cm</b> at the lips</dd>` : ''}
        <dt>LMA size</dt><dd><b>${C.lmaSize(w)}</b></dd>
        <dt>Maintenance</dt><dd>${fmt(C.maintenance421(w))} mL/h</dd></dl>
        <table class="mini"><caption>Doses for ${fmt(w)} kg</caption><tbody>
        <tr><th scope="row">Adrenaline (cardiac arrest)</th><td>10 mcg/kg = <b>${kg(10)} mcg</b></td></tr>
        <tr><th scope="row">Atropine</th><td>20 mcg/kg = <b>${kg(20)} mcg</b></td></tr>
        <tr><th scope="row">Suxamethonium</th><td>2 mg/kg = <b>${kg(2)} mg</b></td></tr>
        <tr><th scope="row">Fluid bolus</th><td>10 mL/kg = <b>${kg(10)} mL</b> balanced crystalloid</td></tr>
        <tr><th scope="row">Glucose for low sugar</th><td>2 mL/kg of 10% = <b>${kg(2)} mL</b></td></tr>
        <tr><th scope="row">Defibrillation</th><td>4 J/kg = <b>${kg(4)} J</b></td></tr>
        <tr><th scope="row">Paracetamol</th><td>15 mg/kg = <b>${kg(15)} mg</b></td></tr></tbody></table>
        <p class="muted small">Weight estimate (APLS): under 1 year (0.5 × months) + 4; 1–5 years (2 × age) + 8; 6–12 years (3 × age) + 7. Weigh the child whenever you can. Children are anaesthetised with a consultant: use this to prepare and to check.</p>`;
    },
  },

  premed: {
    title: 'Premed summary', group: 'builders',
    summary: 'Turn your pre-op review into a short summary to tell your consultant.',
    form: p => `<p class="muted small">Do not type names or record numbers here. Nothing is saved.</p>
      ${PREMED.map(([k, t, ph]) => `<label for="${p}${k}">${t}<textarea id="${p}${k}" rows="${k === 'pmh' || k === 'plan' ? 3 : 1}" placeholder="${esc(ph)}"></textarea></label>`).join('')}`,
    calc: (h, p) => builderOut(h, p, PREMED),
  },

  handover: {
    title: 'PACU handover', group: 'builders',
    summary: 'The handover to the PACU team, in the order they expect it.',
    form: p => `<p class="muted small">Do not type names or record numbers here. Nothing is saved.</p>
      ${HANDOVER.map(([k, t, ph]) => `<label for="${p}${k}">${t}<textarea id="${p}${k}" rows="1" placeholder="${esc(ph)}"></textarea></label>`).join('')}`,
    calc: (h, p) => builderOut(h, p, HANDOVER),
  },
};

const ALDRETE = [
  ['activity', 'Activity', ['moves no limbs', 'moves 2 limbs', 'moves 4 limbs']],
  ['breathing', 'Breathing', ['apnoeic', 'shallow or limited', 'deep breaths and coughs']],
  ['circulation', 'Blood pressure', ['over 50% from baseline', '20–50% from baseline', 'within 20% of baseline']],
  ['consciousness', 'Consciousness', ['not responding', 'rousable to voice', 'fully awake']],
  ['spo2', 'Oxygen saturation', ['under 90% with oxygen', 'over 90% with oxygen', 'over 92% on room air']],
];

/** Infusions offered by the infusion tool: the drug's `infusionConc` (or `conc`) in drugs.js is the standard strength. */
export const INFUSIONS = [
  { id: 'noradrenaline', unit: 'mcg/kg/min', range: [0.01, 0.2] },
  { id: 'adrenaline', unit: 'mcg/kg/min', range: [0.01, 0.2] },
  { id: 'vasopressin', unit: 'U/h', range: [0.6, 2.4] },
  { id: 'dexmedetomidine', unit: 'mcg/kg/h', range: [0.2, 0.7] },
  { id: 'phenylephrine', unit: 'mcg/min', range: [10, 100], note: 'Phenylephrine infusions are made up by pharmacy or as your consultant asks: check the strength on the syringe.' },
];

const PREMED = [
  ['who', 'Patient', '68-year-old man, 82 kg'],
  ['op', 'Operation and surgeon', 'Laparoscopic cholecystectomy, first case'],
  ['asa', 'ASA', 'ASA 3'],
  ['pmh', 'Problems that matter', 'Hypertension, type 2 diabetes on insulin, OSA on CPAP'],
  ['meds', 'Medicines and allergies', 'Amlodipine, insulin glargine; NKDA'],
  ['airway', 'Airway', 'Mallampati 3, mouth opening 3 fingers, full neck movement'],
  ['ix', 'Results', 'Hb 13.2, K 4.1, creatinine 98, HbA1c 7.9%, ECG sinus rhythm'],
  ['fast', 'Fasting', 'Fasted from midnight'],
  ['plan', 'Plan and issues to flag', 'GA with ETT; insulin plan; CPAP to bring; ward bed after PACU'],
];
const HANDOVER = [
  ['who', 'Patient', '30-year-old man, NKDA, ASA 2 (smoker, BMI 33)'],
  ['op', 'Operation', 'Right ankle ORIF'],
  ['anaes', 'Anaesthetic', 'GA with LMA, popliteal sciatic block'],
  ['analg', 'Pain relief given', 'IV paracetamol, parecoxib, morphine 5 mg'],
  ['ae', 'Antiemetics', 'Dexamethasone and ondansetron'],
  ['fluids', 'Fluids and losses', '1.5 L Hartmann’s; minimal blood loss'],
  ['issues', 'Problems during the case', 'None'],
  ['watch', 'What to watch for', 'Block wearing off overnight: start oral analgesia'],
  ['dispo', 'Where next', 'General ward'],
];

function builderOut(h, p, fields) {
  const lines = fields.map(([k, t]) => [t, h.querySelector(`#${p}${k}`).value.trim()]).filter(([, v]) => v);
  if (!lines.length) return '<p class="muted">Fill in what you know; the summary builds here.</p>';
  const text = lines.map(([t, v]) => `${t}: ${v}`).join('\n');
  return `<pre class="built" id="${p}text">${esc(text)}</pre><div class="row"><button type="button" class="btn" data-copy="${p}text">Copy</button></div>`;
}

/** Draw a tool into host. */
export function mountTool(host, id) {
  const t = TOOLS[id];
  if (!t) { host.innerHTML = ''; return; }
  const p = `t${++seq}-`;
  host.innerHTML = `<form class="tool" novalidate data-toolid="${esc(id)}" onsubmit="return false">${t.form(p)}${out('')}</form>`;
  const form = host.querySelector('form'), o = host.querySelector('.tool-out');
  const run = ev => { try { o.innerHTML = md2(t.calc(form, p, ev)); } catch (e) { o.innerHTML = '<p class="err">Could not work this out.</p>'; console.error(e); } };
  form.addEventListener('input', run);
  form.addEventListener('change', run);
  form.addEventListener('click', async e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const text = form.querySelector('#' + b.dataset.copy)?.textContent || '';
    try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; } catch { b.textContent = 'Select and copy'; }
    setTimeout(() => { b.textContent = 'Copy'; }, 2000);
  });
  run();
}

// tool results may contain [words](#/route) links written in plain strings: render those, leave the HTML alone
function md2(html) {
  return html.replace(/\[([^\]]+)\]\((#\/[^)\s]+)\)/g, (_, w, href) => `<a href="${esc(href)}">${w}</a>`);
}

export const TOOL_GROUPS = { dosing: 'Doses and weights', fluids: 'Fluids and blood', scores: 'Scores', builders: 'Summaries to copy' };
export { weightsNow };
