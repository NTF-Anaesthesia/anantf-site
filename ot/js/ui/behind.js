// "Behind the monitor" (DESIGN.md, "Screens"): what a real monitor cannot show. The pump's predicted levels beside
// this patient's true ones, so the trainee sees that the same model does not fit every patient. Later PRs add MAC,
// cardiac output, SVR, PaO2 and the response-surface probabilities.

import { DRUGS } from '../model/drugs.js';
import { cp, ce } from '../model/pk.js';
import { pumpView } from '../model/pump.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f = x => (x == null ? '–' : x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2));

const pct = x => `${Math.round(x * 100)}%`;
function nmbHtml(state) {
  const nm = state.pk.nm, b = state.pd.nmb;
  if (!nm) return '';
  return `<table class="behind"><caption class="sr">Neuromuscular block</caption>
<thead><tr><th scope="col">Muscle strength</th><th scope="col">Thumb</th><th scope="col">Diaphragm</th><th scope="col">Upper airway</th><th scope="col">Larynx</th></tr></thead>
<tbody><tr><th scope="row">Twitch (T1)</th><td>${pct(b.t1)}</td><td>${pct(b.diaphragm)}</td><td>${pct(b.upperAirway)}</td><td>${pct(b.larynx)}</td></tr>
<tr><th scope="row">Rocuronium Ce (mcg/mL)</th><td>${f(nm.roc.ce.thumb)}</td><td>${f(nm.roc.ce.diaphragm)}</td><td>${f(nm.roc.ce.upperAirway)}</td><td>${f(nm.roc.ce.larynx)}</td></tr></tbody></table>
<p class="hint">Free rocuronium in plasma ${f(nm.roc.cpFree || 0)} mcg/mL; free sugammadex ${f(nm.sgx.free || 0)} mcg/mL; suxamethonium Ce ${f(nm.sux.ce)} mcg/mL.${b.phase2 > 0 ? ' Suxamethonium phase II block.' : ''}${b.neoFactor > 1.01 ? ` Neostigmine has raised rocuronium's Ce50 ${b.neoFactor.toFixed(1)} times.` : ''} The diaphragm needs about twice the thumb's level (it recovers first); the upper-airway muscles are more sensitive than the thumb.</p>`;
}

function hypnosisHtml(state) {
  const p = state.pd;
  if (!p || !Object.keys(state.pk.d).length) return '';
  const row = (k, label) => `<tr><th scope="row">${label}</th><td>${pct(p.pNoMove[k])}</td></tr>`;
  return `<table class="behind"><caption class="sr">Depth of anaesthesia</caption>
<thead><tr><th scope="col">In a population at these levels</th><th scope="col">No response</th></tr></thead>
<tbody><tr><th scope="row">To voice (asleep)</th><td>${pct(p.pAsleep)}</td></tr>${row('laryngoscopy', 'To laryngoscopy')}${row('incision', 'To skin incision')}${row('intubation', 'To intubation')}</tbody></table>
<p class="hint">This patient: ${p.asleep ? 'asleep' : 'awake'}. BIS-like index ${Math.round(p.bisLike)} (a real monitor needs a processed-EEG module). Autonomic response to stimulation ${pct(p.auto)}.</p>`;
}

function circHtml(state) {
  const c = state.cv;
  if (!c) return '';
  const r = x => Math.round(x);
  return `<table class="behind"><caption class="sr">Circulation</caption>
<thead><tr><th scope="col">Circulation</th><th scope="col">Now</th></tr></thead>
<tbody><tr><th scope="row">Cardiac output (L/min)</th><td>${c.co.toFixed(1)}</td></tr>
<tr><th scope="row">Stroke volume (mL)</th><td>${r(c.svL)}</td></tr>
<tr><th scope="row">Arterial pressure (mmHg)</th><td>${r(c.sbp)}/${r(c.dbp)} (${r(c.map)})</td></tr>
<tr><th scope="row">CVP / LAP (mmHg)</th><td>${c.cvp.toFixed(1)} / ${c.lap.toFixed(1)}</td></tr>
<tr><th scope="row">SVR (Wood units)</th><td>${c.svr.toFixed(1)}</td></tr>
<tr><th scope="row">Baroreflex sympathetic drive</th><td>${pct(c.s)}</td></tr>
<tr><th scope="row">Blood volume (mL)</th><td>${r(c.bloodVol)}</td></tr>
<tr><th scope="row">Haemoglobin (g/L)</th><td>${r(c.hb)}</td></tr>
<tr><th scope="row">Blood lost (mL)</th><td>${r(c.fl.bled)}</td></tr></tbody></table>
<p class="hint">The monitor shows only heart rate and the cuff pressure. Underneath, pressure is output times resistance, and the baroreflex pushes heart rate, vessel tone and venous capacity to hold it.</p>`;
}

export function behindHtml(state) {
  const ids = Object.keys(state.pk.d);
  if (!ids.length) return circHtml(state) + (state.pk.nm ? nmbHtml(state) : '<p class="hint">No drugs given yet.</p>');
  const rows = ids.map(id => {
    const v = pumpView(state, id);
    return `<tr><th scope="row">${esc(DRUGS[id].name)}</th><td>${f(v && v.predCp)}</td><td>${f(v && v.predCe)}</td><td>${f(cp(state, id))}</td><td>${f(ce(state, id))}</td><td>${esc(DRUGS[id].conc)}</td></tr>`;
  }).join('');
  return `<table class="behind"><caption class="sr">Predicted and true drug levels</caption>
<thead><tr><th scope="col">Drug</th><th scope="col">Pump Cp</th><th scope="col">Pump Ce</th><th scope="col">True Cp</th><th scope="col">True Ce</th><th scope="col">Unit</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="hint">Cp is the plasma level, Ce the effect site (the brain). The pump knows only its published model; this patient differs, as real patients do.</p>${hypnosisHtml(state)}${nmbHtml(state)}${circHtml(state)}`;
}
