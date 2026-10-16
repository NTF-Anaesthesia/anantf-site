// Drug cards: doses worked out for the patient's weight, the volume to draw up, and the patient panel that sets the weight.
import { md, esc } from './md.js';
import { bodyWeights, doseFor, volumeFor, infusionFor, fmt, WEIGHT_NAMES, okNum } from './calc.js';
import { patient, setPatient, clearPatient } from './store.js';
import { DRUGS, DRUG_GROUPS } from './data/drugs.js';

export const drugById = Object.assign(Object.create(null), Object.fromEntries(DRUGS.map(d => [d.id, d])));
export const weightsNow = () => bodyWeights(patient());

// ISO 26825 user-applied syringe label colours (approximate screen colours)
export const LABELS = {
  induction: { name: 'Induction agents', css: 'background:#ffe14d' },
  benzo: { name: 'Benzodiazepines', css: 'background:#ff8a1f' },
  opioid: { name: 'Opioids', css: 'background:#6cc4ea' },
  nmb: { name: 'Muscle relaxants', css: 'background:#ff5a5f' },
  reversal: { name: 'Muscle relaxant reversal', css: 'background:repeating-linear-gradient(135deg,#ff5a5f 0 5px,#fff 5px 10px)' },
  anticholinergic: { name: 'Anticholinergics', css: 'background:#9fd25b' },
  vasopressor: { name: 'Vasopressors', css: 'background:#d7bde2' },
  hypotensive: { name: 'Hypotensive agents', css: 'background:repeating-linear-gradient(135deg,#b48ac7 0 5px,#fff 5px 10px)' },
  la: { name: 'Local anaesthetics', css: 'background:#b5ab95' },
  antiemetic: { name: 'Antiemetics', css: 'background:#f4c3a5' },
  other: { name: 'Other drugs', css: 'background:#fff' },
};

export function labelChip(d) {
  const l = LABELS[d.label];
  return l ? `<span class="chip-label" style="${l.css}" title="Syringe label: ${esc(l.name)}" aria-hidden="true"></span>` : '<span class="chip-label none" aria-hidden="true"></span>';
}

const range = (a, b) => (fmt(a) === fmt(b) ? fmt(a) : `${fmt(a)}–${fmt(b)}`);
// a prescribed value is shown exactly as written in the data; only worked-out amounts are rounded
const asWritten = (a, b) => (b == null || a === b ? String(a) : `${a}–${b}`);
const short = basis => WEIGHT_NAMES[basis].split(' ')[0];
function fallbackNote(dose, r) {
  if (!r.fallback) return '';
  const want = esc(WEIGHT_NAMES[dose.weight]);
  return `<span class="dl-warn">${r.why === 'child' ? `Worked out on total weight: ${want} is for adults.` : `Worked out on total weight: set height and sex for ${want}.`}</span>`;
}

/** One dose line, worked out for the weights `w` if it is per kg. */
export function doseLine(d, dose, w = weightsNow()) {
  const label = `<span class="dl-label">${md(dose.label || 'Dose')}</span>`;
  if (dose.text) return `<li>${label}<span class="dl-dose">${md(dose.text)}</span>${dose.note ? `<span class="dl-note">${md(dose.note)}</span>` : ''}</li>`;
  const per = Array.isArray(dose.per) ? dose.per : [];
  const perText = `${asWritten(per[0], per[1])} ${dose.unit}`;
  let calc = '';
  if (dose.infusion) {
    const ic = d.infusionConc || d.conc;
    const r = ic ? infusionFor(dose, w, ic) : null;
    if (r) {
      const on = !r.perKg ? '' : dose.weight && dose.weight !== 'TBW' && !r.fallback ? ` on ${short(r.basis)} weight ${fmt(r.kg)} kg` : ` for ${fmt(r.kg)} kg`;
      calc = `<span class="dl-calc">= <b>${range(r.lo, r.hi)} mL/h</b> at ${fmt(ic.value)} ${esc(ic.unit)}${on}</span>${fallbackNote(dose, r)}`;
    }
  } else {
    const r = doseFor(dose, w);
    if (r) {
      const vlo = volumeFor(r.min, r.unit, d.conc), vhi = volumeFor(r.max, r.unit, d.conc);
      const vol = vlo != null ? ` = <b>${range(vlo, vhi)} mL</b>` : '';
      const basis = dose.weight && dose.weight !== 'TBW' && !r.fallback ? ` on ${short(r.basis)} weight ${fmt(r.kg)} kg` : ` for ${fmt(r.kg)} kg`;
      calc = `<span class="dl-calc">= <b>${range(r.min, r.max)} ${r.unit}</b>${vol}${basis}${r.capped ? ` (capped at ${dose.max.value} ${esc(dose.max.unit)})` : ''}</span>${fallbackNote(dose, r)}`;
    }
  }
  const basisNote = dose.weight && dose.weight !== 'TBW' && !calc ? ` <span class="app-muted">(${esc(WEIGHT_NAMES[dose.weight])})</span>` : '';
  return `<li>${label}<span class="dl-dose"><span class="v">${esc(perText)}</span>${basisNote}${dose.max ? ` <span class="app-muted">max ${dose.max.value} ${esc(dose.max.unit)}</span>` : ''}</span>${calc}${dose.note ? `<span class="dl-note">${md(dose.note)}</span>` : ''}</li>`;
}

/** A full drug card. `full` adds notes, cautions and local practice; `level: 1` makes the name the page's h1 (the drug's
 * own screen), and `panel` is HTML (the patient panel) placed under the heading. */
export function drugCard(d, { full = true, link = false, level = 3, panel = '', w = weightsNow() } = {}) {
  if (!d) return '';
  const g = DRUG_GROUPS[d.group]?.name || '';
  const name = link ? `<a href="#/drugs/${esc(d.id)}">${esc(d.name)}</a>` : esc(d.name);
  const hn = level === 1 ? 'h1' : 'h3', sub = level === 1 ? 'h2' : 'h4';
  // on the drug's own screen the name is the large title, so the card keeps just the syringe label and other names
  const head = level === 1
    ? `<header class="druglabel">${labelChip(d)}<p class="app-muted app-small">${d.aka?.length ? `Also called ${esc(d.aka.join(', '))}. ` : ''}${d.label && LABELS[d.label] ? `Syringe label: ${esc(LABELS[d.label].name.toLowerCase())}.` : ''}</p></header>`
    : `<header>${labelChip(d)}<div><h3>${name}</h3><p class="app-muted app-small">${esc(d.cls || g)}${d.aka?.length ? ` · also ${esc(d.aka.join(', '))}` : ''}</p></div></header>`;
  return `<article class="drugcard${level === 1 ? ' page' : ''}" data-drugcard="${esc(d.id)}">
  ${head}${panel}
  <dl class="facts">${d.presentation ? `<dt>Comes as</dt><dd>${md(d.presentation)}</dd>` : ''}${d.prep ? `<dt>Draw up</dt><dd>${md(d.prep)}${d.conc ? ` → <span class="v">${fmt(d.conc.value)} ${esc(d.conc.unit)}</span>` : ''}</dd>` : ''}${d.infusionPrep ? `<dt>Infusion</dt><dd>${md(d.infusionPrep)}${d.infusionConc ? ` → <span class="v">${fmt(d.infusionConc.value)} ${esc(d.infusionConc.unit)}</span>` : ''}</dd>` : ''}${d.onset ? `<dt>Onset</dt><dd>${md(d.onset)}</dd>` : ''}${d.duration ? `<dt>Lasts</dt><dd>${md(d.duration)}</dd>` : ''}</dl>
  <ul class="doses">${(d.doses || []).map(x => doseLine(d, x, w)).join('')}</ul>
  ${full && d.local ? `<div class="callout local" role="note"><p class="callout-t">At NTFGH</p><p>${md(d.local)}</p></div>` : ''}
  ${full && d.notes?.length ? `<${sub} class="sub4">Notes</${sub}><ul class="list">${d.notes.map(n => `<li>${md(n)}</li>`).join('')}</ul>` : ''}
  ${full && d.cautions?.length ? `<${sub} class="sub4">Cautions</${sub}><ul class="list">${d.cautions.map(n => `<li>${md(n)}</li>`).join('')}</ul>` : ''}
</article>`;
}

/** Compact dose table for several drugs (topic `drugs` blocks, crisis cards). */
export function drugTable(ids, title = '', w = weightsNow()) {
  const ds = ids.map(id => drugById[id]).filter(Boolean);
  return `<div class="drugtable-in">${title ? `<h3>${md(title)}</h3>` : ''}<ul class="dtable">${ds.map(d => `<li>${labelChip(d)}<div><a class="dname" href="#/drugs/${esc(d.id)}">${esc(d.name)}</a><ul class="doses">${(d.doses || []).slice(0, 3).map(x => doseLine(d, x, w)).join('')}</ul></div></li>`).join('')}</ul></div>`;
}

// ---------------------------------------------------------------- the patient panel
export function patientSummary() {
  const p = patient(), w = bodyWeights(p);
  if (w.tbw == null) return '<span>No weight set: doses show per kg</span>';
  const bits = [`<b>${fmt(w.tbw)} kg</b>`];
  if (p.height) bits.push(`${fmt(p.height)} cm`);
  if (p.sex) bits.push(p.sex === 'm' ? 'male' : 'female');
  if (w.bmi != null) bits.push(`BMI ${fmt(w.bmi)}`);
  return `<span>${bits.join(' · ')}</span>`;
}

export function patientPanel() {
  const p = patient(), w = bodyWeights(p);
  return `<section class="patient" aria-label="Patient weight for doses">
  <div class="patient-row"><p class="patient-sum" id="patient-sum" aria-live="polite">${patientSummary()}</p><button type="button" class="app-btn app-btn--secondary app-btn--compact" id="patient-edit" aria-expanded="false" aria-controls="patient-form">${w.tbw == null ? 'Set weight' : 'Change'}</button></div>
  <form id="patient-form" class="patient-form" hidden novalidate>
    <div class="mo-fields three">
      <label class="app-field"><span class="app-field-label">Weight (kg)</span><input class="app-input" id="p-weight" type="number" inputmode="decimal" min="0.5" max="400" step="0.1" value="${p.weight ?? ''}"></label>
      <label class="app-field"><span class="app-field-label">Height (cm)</span><input class="app-input" id="p-height" type="number" inputmode="decimal" min="40" max="250" step="1" value="${p.height ?? ''}"></label>
      <fieldset class="app-segmented"><legend>Sex</legend><label class="app-seg"><input type="radio" name="p-sex" value="m"${p.sex === 'm' ? ' checked' : ''}><span>Male</span></label><label class="app-seg"><input type="radio" name="p-sex" value="f"${p.sex === 'f' ? ' checked' : ''}><span>Female</span></label></fieldset>
    </div>
    <p class="app-muted app-small">Height and sex give ideal, lean and adjusted weight. Kept on this tab only, and cleared after 6 hours.</p>
    <p class="err" id="p-err" role="alert" hidden></p>
    <div class="app-btn-row"><button type="submit" class="app-btn app-btn--primary">Use for doses</button><button type="button" class="app-btn app-btn--outline" id="p-clear">Clear</button></div>
  </form>
  ${w.tbw != null ? weightsLine(w) : ''}
</section>`;
}

export function weightsLine(w) {
  if (w.lbw == null) return '<p class="app-muted app-small weights-line">Add height and sex for ideal and lean weight.</p>';
  const bits = [w.ibw != null ? `Ideal <span class="v">${fmt(w.ibw)} kg</span>` : '', `lean <span class="v">${fmt(w.lbw)} kg</span>`, w.abw != null ? `adjusted <span class="v">${fmt(w.abw)} kg</span>` : ''].filter(Boolean);
  return `<p class="app-muted app-small weights-line">${bits.join(' · ')}</p>${w.warnings.map(x => `<p class="app-small warn-text weights-line">${esc(x)}</p>`).join('')}`;
}

/** Wire a patient panel inside root; onChange redraws whatever shows doses. */
export function wirePatient(root, onChange) {
  const form = root.querySelector('#patient-form'), edit = root.querySelector('#patient-edit');
  if (!form) return;
  edit.addEventListener('click', () => {
    form.hidden = !form.hidden; edit.setAttribute('aria-expanded', String(!form.hidden));
    if (!form.hidden) form.querySelector('#p-weight').focus();
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const num = id => { const v = form.querySelector(id).value.trim(); return v === '' ? null : Number(v); };
    const weight = num('#p-weight'), height = num('#p-height'), sex = form.querySelector('input[name=p-sex]:checked')?.value || null;
    const err = form.querySelector('#p-err');
    const bad = weight == null || !okNum(weight, 0.5, 400) ? 'Enter a weight between 0.5 and 400 kg.' : height != null && !okNum(height, 40, 250) ? 'Enter a height between 40 and 250 cm, or leave it empty.' : '';
    if (bad) { err.textContent = bad; err.hidden = false; return; }
    err.hidden = true;
    setPatient({ weight, height, sex });
    onChange?.(`Doses worked out for ${fmt(weight)} kg.`);
  });
  form.querySelector('#p-clear').addEventListener('click', () => { clearPatient(); onChange?.('Weight cleared: doses show per kg.'); });
}
