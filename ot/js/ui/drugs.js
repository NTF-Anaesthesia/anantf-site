// The Drugs tab (DESIGN.md, "Screens"): boluses with doses worked out for this synthetic patient, infusions, and TCI
// for propofol and remifentanil. Every control writes through sim.act(); nothing here changes the model directly.
// Syringe-label colours follow ISO 26825 by class (induction agents yellow, benzodiazepines orange, opioids blue),
// always with the class written too, so colour is never the only signal.

import { DRUGS } from '../model/drugs.js';
import { PUMP_MODELS } from '../model/pump.js';
import { pumpView } from '../model/pump.js';

const CLASS = {
  induction: ['Induction agent', '#ffd200'], benzo: ['Benzodiazepine', '#f68d2e'], opioid: ['Opioid', '#79c7e3'],
  nmb: ['Neuromuscular blocker', '#ff5a5a'],
  // reversal agents: red and white diagonal stripes
  reversal: ['Reversal agent', '#ff5a5a', 'repeating-linear-gradient(135deg,#ff5a5a 0 6px,#fff 6px 12px)'],
  vasopressor: ['Vasopressor', '#d38ee0'],
  hypotensive: ['Hypotensive agent', '#d38ee0', 'repeating-linear-gradient(135deg,#d38ee0 0 6px,#fff 6px 12px)'],
  anticholinergic: ['Anticholinergic', '#7fc65a'],
};
const round = (x, to) => Math.max(to, Math.round(x / to) * to);

// what each drug row offers [D: usual adult doses, shown as choices, not advice]
const ROWS = [
  { id: 'propofol', cls: 'induction', bolus: w => [round(w * 1, 10), round(w * 2, 10)], unit: 'mg', inf: { unit: 'mg/kg/h', def: 6, step: 0.5 }, tci: { unit: 'mcg/mL', def: 4, step: 0.1 } },
  { id: 'ketamine', more: true, cls: 'induction', bolus: w => [round(w * 0.5, 5), round(w * 1, 10)], unit: 'mg' },
  { id: 'midazolam', more: true, cls: 'benzo', bolus: () => [1, 2], unit: 'mg' },
  { id: 'fentanyl', cls: 'opioid', bolus: () => [25, 50, 100], unit: 'mcg' },
  { id: 'alfentanil', more: true, cls: 'opioid', bolus: () => [250, 500], unit: 'mcg' },
  { id: 'remifentanil', cls: 'opioid', unit: 'mcg', inf: { unit: 'mcg/kg/min', def: 0.1, step: 0.05 }, tci: { unit: 'ng/mL', def: 3, step: 0.5 } },
  { id: 'rocuronium', cls: 'nmb', bolus: w => [round(w * 0.6, 5), round(w * 1.2, 5)], unit: 'mg' },
  { id: 'suxamethonium', more: true, cls: 'nmb', bolus: w => [round(w * 1, 10), round(w * 1.5, 10)], unit: 'mg' },
  { id: 'sugammadex', cls: 'reversal', bolus: w => [round(w * 2, 10), round(w * 4, 10), round(w * 16, 50)], unit: 'mg' },
  // neostigmine: 2.5 mg, or 50 mcg/kg up to the 5 mg maximum (MODEL.md section 2)
  { id: 'neostigmine', more: true, cls: 'reversal', bolus: w => [...new Set([2.5, Math.min(5, round(w * 0.05, 0.5))])], unit: 'mg' },
];
// the Circulation tab's drugs (M2.3)
export const CIRC_ROWS = [
  { id: 'phenylephrine', cls: 'vasopressor', bolus: () => [50, 100], unit: 'mcg', inf: { unit: 'mcg/min', def: 25, step: 5 } },
  { id: 'ephedrine', cls: 'vasopressor', bolus: () => [3, 6], unit: 'mg' },
  { id: 'noradrenaline', cls: 'vasopressor', bolus: () => [5, 10], unit: 'mcg', inf: { unit: 'mcg/kg/min', def: 0.05, step: 0.01 } },
  { id: 'adrenaline', cls: 'vasopressor', bolus: () => [10, 50, 100, 1000], unit: 'mcg', inf: { unit: 'mcg/min', def: 2, step: 1 } },
  { id: 'vasopressin', more: true, cls: 'vasopressor', bolus: () => [1, 2], unit: 'units' },
  { id: 'atropine', cls: 'anticholinergic', bolus: () => [300, 600], unit: 'mcg' },
  { id: 'glycopyrrolate', more: true, cls: 'anticholinergic', bolus: () => [200, 400], unit: 'mcg' },
  { id: 'esmolol', cls: 'hypotensive', bolus: w => [round(w * 0.5, 5)], unit: 'mg', inf: { unit: 'mcg/kg/min', def: 100, step: 25 } },
  { id: 'labetalol', more: true, cls: 'hypotensive', bolus: () => [5, 10], unit: 'mg' },
  { id: 'gtn', more: true, cls: 'hypotensive', bolus: () => [50, 100], unit: 'mcg', inf: { unit: 'mcg/min', def: 25, step: 5 } },
];
const MODEL_NAME = { schnider: 'Schnider', marsh: 'Marsh (ke0 1.2)', marsh026: 'Marsh (ke0 0.26)', minto: 'Minto' };

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = x => (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2));

export class DrugsPanel {
  // rows: the drug rows to show; extras: the TOF buttons and the "Given" list (the Drugs tab only)
  constructor(root, sim, onAct, { rows = ROWS, extras = true } = {}) {
    this.root = root; this.sim = sim; this.onAct = onAct; this.rows = rows; this.extras = extras;
    const w = sim.state.patient.weightKg;
    const main = rows.filter(r => !r.more), more = rows.filter(r => r.more);
    root.innerHTML = `<p class="hint">Doses worked out for this synthetic patient (${esc(w)} kg). Choices to practise with, not advice.</p>` + main.map(r => this.row(r, w)).join('') +
      // the less common drugs fold away so the usual ones fit on a phone screen
      (more.length ? `<details class="more-drugs"><summary>More drugs: ${more.map(r => esc(DRUGS[r.id].name)).join(', ')}</summary>${more.map(r => this.row(r, w)).join('')}</details>` : '') + (!extras ? '' :
      `<section class="drug" style="--tag:#c9a7ff" aria-labelledby="dn-tof"><h3 id="dn-tof">Neuromuscular monitor <span class="cls">TOF every 15 s at the thumb</span></h3>` +
      `<div class="act"><button type="button" data-tof="now">TOF now</button><button type="button" data-tof="ptc">Post-tetanic count</button></div></section>` +
      `<h3 class="sub">Given</h3><ol class="given" id="given"><li class="none">Nothing yet</li></ol>`);
    root.addEventListener('click', e => this.click(e));
  }

  row(r, w) {
    const d = DRUGS[r.id], [label, colour, img] = CLASS[r.cls], id = r.id;
    let h = `<section class="drug" style="--tag:${colour}${img ? `;--tagimg:${img}` : ''}" aria-labelledby="dn-${id}"><h3 id="dn-${id}">${esc(d.name)} <span class="cls">${label}</span></h3>`;
    if (r.bolus) {
      h += `<div class="act">${r.bolus(w).map(x => `<button type="button" data-bolus="${id}" data-dose="${x}" data-unit="${r.unit}">${x} ${r.unit}</button>`).join('')}` +
        `<label class="dose"><span class="sr">${esc(d.name)} dose in ${r.unit}</span><input type="number" inputmode="decimal" min="0" step="any" id="bd-${id}" placeholder="${r.unit}"></label>` +
        `<button type="button" data-give="${id}" data-unit="${r.unit}">Give</button></div>`;
    }
    if (r.inf) {
      h += `<div class="act"><label>Infusion <input type="number" inputmode="decimal" min="0" step="${r.inf.step}" id="inf-${id}" value="${r.inf.def}"> ${esc(r.inf.unit)}</label>` +
        `<button type="button" data-inf="${id}" data-unit="${esc(r.inf.unit)}">Run</button><button type="button" data-infstop="${id}">Stop</button></div>` +
        `<p class="state" id="inf-state-${id}"></p>`;
    }
    if (r.tci) {
      const models = PUMP_MODELS[id];
      h += `<div class="act"><label>TCI <select id="tm-${id}">${models.map(m => `<option value="${m}">${MODEL_NAME[m]}</option>`).join('')}</select></label>` +
        `<label><span class="sr">Target site</span><select id="ts-${id}"><option value="effect">Effect site</option><option value="plasma">Plasma</option></select></label>` +
        `<label>Target <input type="number" inputmode="decimal" min="0" step="${r.tci.step}" id="tt-${id}" value="${r.tci.def}"> ${esc(r.tci.unit)}</label>` +
        `<button type="button" data-tci="${id}">Set</button><button type="button" data-tcistop="${id}">Stop</button></div>` +
        `<p class="state" id="tci-state-${id}"></p>`;
    }
    return h + '</section>';
  }

  act(a) { this.sim.act(a); this.onAct(a); }
  num(id) { const v = parseFloat(document.getElementById(id).value); return Number.isFinite(v) && v >= 0 ? v : null; }

  click(e) {
    const b = e.target.closest('button');
    if (!b) return;
    const ds = b.dataset;
    if (ds.bolus) this.act({ type: 'bolus', drug: ds.bolus, dose: +ds.dose, unit: ds.unit, route: 'iv' });
    else if (ds.give) { const v = this.num(`bd-${ds.give}`); if (v) this.act({ type: 'bolus', drug: ds.give, dose: v, unit: ds.unit, route: 'iv' }); }
    else if (ds.inf) { const v = this.num(`inf-${ds.inf}`); if (v != null) this.act({ type: 'infusion', drug: ds.inf, rate: v, unit: ds.unit }); }
    else if (ds.infstop) this.act({ type: 'infusion', drug: ds.infstop, rate: 0, unit: 'mg/h' });
    else if (ds.tci) {
      const v = this.num(`tt-${ds.tci}`);
      if (v != null) this.act({ type: 'tci', drug: ds.tci, model: document.getElementById(`tm-${ds.tci}`).value, mode: document.getElementById(`ts-${ds.tci}`).value, target: v });
    } else if (ds.tcistop) this.act({ type: 'tci', drug: ds.tcistop, stop: true });
    else if (ds.tof) this.act({ type: 'tof', do: ds.tof });
  }

  // running infusions and pumps, and the list of what was given (DOM writes only when text changes)
  update(state) {
    const set = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
    for (const r of this.rows) {
      if (r.inf) {
        const running = (state.log.filter(e => e.kind === 'action' && e.action.type === 'infusion' && e.action.drug === r.id).at(-1) || {}).action;
        set(document.getElementById(`inf-state-${r.id}`), running && running.rate > 0 ? `Running ${running.rate} ${running.unit}` : '');
      }
      if (r.tci) {
        const v = pumpView(state, r.id), el = document.getElementById(`tci-state-${r.id}`);
        if (!v) set(el, '');
        else {
          const sel = document.getElementById(`tm-${r.id}`);
          if (sel.value !== v.model) sel.value = v.model;
          sel.disabled = v.ml > 0; // a running pump keeps its model
          set(el, v.target > 0 ? `${MODEL_NAME[v.model]}, ${v.mode === 'plasma' ? 'plasma' : 'effect site'} target ${v.target} ${r.tci.unit}: pump predicts Ce ${fmt(v.predCe)}, ${fmt(v.mlH)} mL/h, ${fmt(v.ml)} mL given` : `Stopped: ${fmt(v.ml)} mL given`);
        }
      }
    }
    if (!this.extras) return;
    const given = state.log.filter(e => e.kind === 'action' && ['bolus', 'infusion', 'tci'].includes(e.action.type)).slice(-6).reverse();
    const ol = document.getElementById('given');
    const html = given.length ? given.map(e => `<li><span class="when">${clock(e.t)}</span> ${esc(describe(e.action))}</li>`).join('') : '<li class="none">Nothing yet</li>';
    if (ol.innerHTML !== html) ol.innerHTML = html;
  }
}

const clock = t => { const s = Math.max(0, Math.floor(t)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
export function describe(a) {
  const n = DRUGS[a.drug] ? DRUGS[a.drug].name : a.drug;
  if (a.type === 'bolus') return `${n} ${a.dose} ${a.unit}`;
  if (a.type === 'infusion') return a.rate > 0 ? `${n} infusion ${a.rate} ${a.unit}` : `${n} infusion stopped`;
  if (a.type === 'tci') return a.stop ? `${n} TCI stopped` : `${n} TCI ${MODEL_NAME[a.model] || ''} ${a.mode === 'plasma' ? 'plasma' : 'effect site'} ${a.target}`;
  return a.type;
}
