import './style.css';
import {
  MODELS, ModelId, Patient, PKParams, TargetChange, TargetMode, adjustedBw, alSallamiFfm, bmi, buildModes, ceBolus,
  cpBolus, devineIbw, doseCurve, eleveldCe50, eleveldPk, impliedEleveldWeight, jamesLbm, jamesPeakWeight, marshPk,
  matchTarget, reportedSpacePlusWeight, schniderPk, simulate, variantsFor, PUMP_DEFAULTS, Warning, peakOf, ceAfterDose,
} from './engine';
import { lineChart, Series } from './ui/chart';
import REFS from './refs.generated.json';

// ---------------------------------------------------------------- state
interface Sched { t: number; target: number }
interface AppState {
  patient: Patient;
  opioid: boolean;
  target: number;
  from: ModelId;
  to: ModelId;
  bmiMode: boolean; // apply the reported Space Plus BMI>30 adjustment to Eleveld
  marshKe0: number;
  pumpModel: ModelId;
  pumpMode: TargetMode;
  schedule: Sched[];
  scrub: number; // min
  concMgMl: number;
  maxRateMlH: number;
  updateSec: number;
  instantBolus: boolean;
  calModel: ModelId;
  calDose: string;
  calUnit: 'mg' | 'mL';
  theme: 'system' | 'light' | 'dark';
}

const DEFAULTS: AppState = {
  patient: { sex: 'M', age: 35, height: 170, weight: 70 },
  opioid: true, target: 4, from: 'eleveld', to: 'schnider', bmiMode: false, marshKe0: 1.2,
  pumpModel: 'eleveld', pumpMode: 'Ce', schedule: [{ t: 0, target: 4 }, { t: 15, target: 3 }, { t: 30, target: 3.5 }],
  scrub: 2, concMgMl: PUMP_DEFAULTS.concMgMl, maxRateMlH: PUMP_DEFAULTS.maxRateMlH, updateSec: PUMP_DEFAULTS.updateSec,
  instantBolus: PUMP_DEFAULTS.instantBolus, calModel: 'eleveld', calDose: '', calUnit: 'mg', theme: 'system',
};

function load(): AppState {
  try {
    const raw = localStorage.getItem('tci-state');
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw), patient: { ...DEFAULTS.patient, ...JSON.parse(raw).patient } };
  } catch { /* storage unavailable: defaults */ }
  return structuredClone(DEFAULTS);
}
const S: AppState = load();
function save() {
  try { localStorage.setItem('tci-state', JSON.stringify(S)); } catch { /* ignore */ }
}

// ---------------------------------------------------------------- helpers
const NAMES: Record<ModelId, string> = { eleveld: 'Eleveld', schnider: 'Schnider', marsh: 'Marsh' };
const fmt = (x: number, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '–');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rateMgMin = () => (S.instantBolus ? undefined : (S.maxRateMlH * S.concMgMl) / 60);
const validPatient = (p: Patient) => p.age > 0 && p.height > 50 && p.weight > 1;

function pkFor(model: ModelId, p: Patient = S.patient, opioid = S.opioid): PKParams {
  if (model === 'eleveld') {
    const w = S.bmiMode ? reportedSpacePlusWeight(p) : null;
    return eleveldPk(p, { opioid, weightOverride: w ?? undefined });
  }
  if (model === 'schnider') return schniderPk(p);
  return marshPk(p, { ke0: S.marshKe0 });
}
function modelLabel(m: ModelId) {
  if (m === 'eleveld') return `Eleveld (opioid ${S.opioid ? 'on' : 'off'}${S.bmiMode && bmi(S.patient) > 30 ? ', BMI>30 adjusted' : ''})`;
  if (m === 'marsh') return `Marsh (ke0 ${S.marshKe0})`;
  return 'Schnider';
}
function warnings(models: ModelId[]): Warning[] {
  const seen = new Set<string>();
  const out: Warning[] = [];
  for (const m of models) for (const w of MODELS[m].check(S.patient)) {
    if (seen.has(w.text)) continue;
    seen.add(w.text);
    out.push({ ...w, text: `${NAMES[m]}: ${w.text}` });
  }
  return out;
}
const warnList = (ws: Warning[]) => ws.length ? `<ul class="tci-warn">${ws.map((w) => `<li class="${w.level}">${esc(w.text)}${w.src ? ` <a href="#/refs?k=${w.src}">source</a>` : ''}</li>`).join('')}</ul>` : '';

function seg(name: string, legend: string, options: [string, string][], value: string) {
  return `<fieldset class="app-segmented"><legend class="app-sr">${legend}</legend>${options.map(([v, l]) =>
    `<label class="app-seg"><input type="radio" name="${name}" value="${v}" ${v === value ? 'checked' : ''}><span>${l}</span></label>`).join('')}</fieldset>`;
}
function num(name: string, label: string, value: number, attrs = '') {
  return `<label class="app-field"><span class="app-field-label">${label}</span><input class="app-input" name="${name}" type="number" inputmode="decimal" value="${value}" ${attrs}></label>`;
}
function switchRow(name: string, title: string, sub: string, on: boolean) {
  return `<label class="app-row"><span class="app-row-body"><span class="app-row-title">${title}</span>${sub ? `<span class="app-row-sub">${sub}</span>` : ''}</span><input type="checkbox" role="switch" class="app-switch" name="${name}" ${on ? 'checked' : ''}></label>`;
}

const DISCLAIMER = `<p class="tci-disclaimer"><strong>Education and planning only.</strong> Not a substitute for the pump display or clinical judgement. Same bolus does not mean same effect.</p>`;

function patientForm() {
  const p = S.patient;
  return `<section class="app-section"><h2 class="app-section-header">Patient</h2><div class="app-card">
    ${seg('sex', 'Sex', [['M', 'Male'], ['F', 'Female']], p.sex)}
    <div class="tci-grid" style="margin-top:12px">
      ${num('age', 'Age (y)', p.age, 'min="1" max="110" step="1"')}
      ${num('height', 'Height (cm)', p.height, 'min="100" max="230" step="1"')}
      ${num('weight', 'Weight (kg)', p.weight, 'min="20" max="250" step="0.5"')}
    </div>
    <p class="app-small app-muted" id="derived" style="margin:12px 0 0"></p>
  </div>
  <ul class="app-list" style="margin-top:8px">${switchRow('opioid', 'Opioid co-administration', 'Eleveld covariate: lowers clearance and V3 with age', S.opioid)}</ul></section>`;
}
function derivedText() {
  const p = S.patient;
  if (!validPatient(p)) return 'Enter age, height and weight.';
  const pk = jamesPeakWeight(p);
  return `BMI <b>${fmt(bmi(p))}</b> · James LBM <b>${fmt(jamesLbm(p))}</b> kg (peaks at ${fmt(pk, 0)} kg) · Al-Sallami FFM <b>${fmt(alSallamiFfm(p))}</b> kg · IBW ${fmt(devineIbw(p))} · ABW ${fmt(adjustedBw(p))} kg`;
}
function patientLine() {
  const p = S.patient;
  return `<a class="app-row" href="#/match"><span class="app-row-body"><span class="app-row-title tci-pt"><b>${p.sex === 'M' ? 'Male' : 'Female'}</b> ${p.age} y · ${p.height} cm · ${p.weight} kg · BMI ${fmt(bmi(p))}</span><span class="app-row-sub">Opioid ${S.opioid ? 'on' : 'off'}${S.bmiMode ? ' · BMI>30 mode on' : ''} · change on Match</span></span><span class="app-row-chevron"></span></a>`;
}

// ---------------------------------------------------------------- screens
type Screen = { title: string; tab: string; html: () => string; update?: () => void; back?: [string, string] };

const matchScreen: Screen = {
  title: 'Bolus matcher', tab: 'match',
  html: () => `${DISCLAIMER}${patientForm()}
    <section class="app-section"><h2 class="app-section-header">Match</h2><div class="app-card">
      ${seg('dir', 'Direction', [['eleveld>schnider', 'Eleveld → Schnider'], ['schnider>eleveld', 'Schnider → Eleveld']], `${S.from}>${S.to}`)}
      <div style="margin-top:12px"><span class="app-field-label" id="tl">Effect-site target on the starting model (µg/mL)</span>
      <div class="tci-stepper" role="group" aria-labelledby="tl"><button class="app-btn app-btn--secondary" data-act="tdown" aria-label="Lower target">−</button>
      <input class="app-input" name="target" type="number" inputmode="decimal" step="0.1" min="0.5" max="12" value="${S.target}" aria-labelledby="tl">
      <button class="app-btn app-btn--secondary" data-act="tup" aria-label="Raise target">+</button></div></div>
    </div><div id="out"></div></section>`,
  update() {
    const out = document.getElementById('out')!;
    document.getElementById('derived')!.innerHTML = derivedText();
    if (!validPatient(S.patient) || !(S.target > 0)) { out.innerHTML = ''; return; }
    const r = rateMgMin();
    const a = pkFor(S.from), b = pkFor(S.to);
    const bolA = ceBolus(a, S.target, r);
    const matched = matchTarget(a, S.target, b, r);
    const rows = (['eleveld', 'schnider', 'marsh'] as ModelId[]).map((m) => {
      const pk = pkFor(m);
      const bo = ceBolus(pk, S.target, r);
      return `<tr class="${m === S.from ? 'is-current' : ''}"><td>${modelLabel(m)}</td><td class="mono">${fmt(bo.dose, 0)}</td><td class="mono">${fmt(bo.dose / S.concMgMl, 1)}</td><td class="mono">${fmt(bo.tPeak, 2)}</td></tr>`;
    }).join('');
    out.innerHTML = `<div class="app-card app-card--accent tci-answer" aria-live="polite">
        <span class="app-kicker" style="color:inherit;opacity:.9">${NAMES[S.from]} Ce ${fmt(S.target, 1)} gives the same bolus as</span>
        <span class="tci-answer-big" data-testid="matched">${NAMES[S.to]} Ce ${fmt(matched, 2)}</span>
        <span class="tci-answer-sub">Induction bolus ${fmt(bolA.dose, 0)} mg (${fmt(bolA.dose / S.concMgMl, 1)} mL of ${S.concMgMl / 10}%)${r ? `, over ${fmt(bolA.duration * 60, 0)} s` : ', given instantly'}</span>
      </div>
      ${warnList(warnings([S.from, S.to]))}
      <h3 class="app-section-header" style="margin-top:16px">Bolus for Ce ${fmt(S.target, 1)} on each model</h3>
      <div class="tci-table-wrap"><table class="tci-table"><thead><tr><th>Model</th><th>mg</th><th>mL</th><th>Peak (min)</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="app-section-footer">Peak Ce equals the target (Shafer and Gregg). The matched target only matches the induction bolus; maintenance rates and the time course differ. ${S.instantBolus ? 'Bolus treated as instantaneous.' : `Bolus at ${S.maxRateMlH} mL/h.`} <a href="#/assumptions">Assumptions</a></p>`;
  },
};

function simResult() {
  const pk = pkFor(S.pumpModel);
  const sched: TargetChange[] = S.schedule.filter((s) => Number.isFinite(s.t) && Number.isFinite(s.target));
  const tEnd = Math.max(45, ...sched.map((s) => s.t + 15));
  return { pk, sim: simulate(pk, S.pumpMode, sched, { concMgMl: S.concMgMl, maxRateMlH: S.maxRateMlH, updateSec: S.updateSec }, tEnd), tEnd };
}
let simCache: { key: string; v: ReturnType<typeof simResult> } | null = null;
function simCached() {
  const key = JSON.stringify([S.patient, S.opioid, S.bmiMode, S.marshKe0, S.pumpModel, S.pumpMode, S.schedule, S.concMgMl, S.maxRateMlH, S.updateSec]);
  if (simCache?.key !== key) simCache = { key, v: simResult() };
  return simCache.v;
}
const mmss = (min: number) => `${Math.floor(min)}:${String(Math.round((min % 1) * 60) % 60).padStart(2, '0')}`;

const pumpScreen: Screen = {
  title: 'Pump', tab: 'pump',
  html: () => `${DISCLAIMER}<ul class="app-list" style="margin-bottom:16px">${patientLine()}
    <li><a class="app-row" href="pump/"><span class="app-row-body"><span class="app-row-title">Open the pump emulator</span><span class="app-row-sub">Operate a Space plus Perfusor running propofol TCI: keys, menus, bolus, alarms</span></span><span class="app-row-chevron"></span></a></li></ul>
    <section class="app-section"><div class="app-card">
      ${seg('pumpModel', 'Model', [['eleveld', 'Eleveld'], ['schnider', 'Schnider'], ['marsh', 'Marsh']], S.pumpModel)}
      <div style="margin-top:12px">${seg('pumpMode', 'Targeting', [['Ce', 'Effect site (Ce)'], ['Cp', 'Plasma (Cp)']], S.pumpMode)}</div>
      <div style="margin-top:12px" class="${S.pumpModel === 'marsh' ? '' : 'tci-hidden'}">${seg('marshKe0', 'Marsh ke0', [['0.26', 'ke0 0.26'], ['1.2', 'ke0 1.2']], String(S.marshKe0))}</div>
    </div></section>
    <div id="lcd"></div>
    <label class="app-field"><span class="app-field-label">Time on the pump: <span id="scrubv">${mmss(S.scrub)}</span></span>
      <input type="range" name="scrub" min="0" max="60" step="${1 / 6}" value="${S.scrub}" style="width:100%;min-height:44px;accent-color:var(--app-wine)"></label>
    <div id="simchart"></div>
    <section class="app-section"><h2 class="app-section-header">Target changes (maintenance)</h2><div class="app-card"><div class="tci-sched" id="sched">${S.schedule.map((s, i) => `
      <div class="tci-sched-row">${num(`st${i}`, 'From (min)', s.t, 'min="0" step="1"')}${num(`sv${i}`, `${S.pumpMode} target`, s.target, 'min="0" step="0.1"')}
      <button class="app-btn app-btn--plain app-btn--compact" data-act="del${i}" aria-label="Remove row ${i + 1}" ${i === 0 ? 'disabled' : ''}>×</button></div>`).join('')}</div>
      <div class="app-btn-row" style="margin-top:12px"><button class="app-btn app-btn--secondary" data-act="addrow">Add target change</button></div></div>
      <p class="app-section-footer">The emulator recomputes the rate every ${S.updateSec} s. A lower target stops the pump until the predicted level falls. Max rate ${S.maxRateMlH} mL/h (settings).</p></section>`,
  update() {
    if (!validPatient(S.patient)) { document.getElementById('lcd')!.innerHTML = '<p class="app-panel">Enter age, height and weight on Match.</p>'; document.getElementById('simchart')!.innerHTML = ''; return; }
    const { sim, tEnd } = simCached();
    const i = Math.min(sim.t.length - 1, Math.round((S.scrub * 60) / S.updateSec));
    let target = 0;
    for (const c of S.schedule) if (c.t <= S.scrub + 1e-9) target = c.target;
    const lcd = document.getElementById('lcd')!;
    const ml = sim.cumMg[i] / S.concMgMl;
    lcd.innerHTML = `<div class="tci-lcd" role="group" aria-label="Pump-style display">
      <div class="tci-lcd-top"><span>${NAMES[S.pumpModel]} · ${S.pumpMode} mode · propofol ${S.concMgMl / 10}%</span><span>${mmss(sim.t[i])}</span></div>
      <div class="tci-lcd-main">
        <div><span class="tci-lcd-k">Target ${S.pumpMode}</span><span class="tci-lcd-v">${fmt(target, 1)} <small>µg/mL</small></span></div>
        <div><span class="tci-lcd-k">Rate</span><span class="tci-lcd-v">${fmt(sim.rateMlH[i], 1)} <small>mL/h</small></span></div>
        <div><span class="tci-lcd-k">Cp</span><span class="tci-lcd-v">${fmt(sim.cp[i], 2)}</span></div>
        <div><span class="tci-lcd-k">Ce</span><span class="tci-lcd-v">${fmt(sim.ce[i], 2)}</span></div>
      </div>
      <div class="tci-lcd-bar"><span>Bolus ${fmt(sim.inductionMg, 0)} mg / ${fmt(sim.inductionMg / S.concMgMl, 1)} mL</span><span>Total ${fmt(ml, 1)} mL</span></div>
      ${sim.rateMlH[i] === 0 && target > 0 ? `<div class="tci-lcd-bar tci-lcd-warn"><span>${(S.pumpMode === 'Ce' ? sim.ce[i] : sim.cp[i]) < target ? `Rate 0: ${S.pumpMode} rising to target` : 'Paused: waiting for the level to fall'}</span></div>` : ''}
    </div><p class="app-section-footer" style="margin-top:-8px">Generic pump-style display for teaching; not the manufacturer's screen.</p>`;
    document.getElementById('scrubv')!.textContent = mmss(S.scrub);
    const sc = document.querySelector<HTMLInputElement>('input[name=scrub]')!;
    sc.max = String(tEnd);
    const tgt: Series = { label: 'Target', x: [], y: [], color: 'var(--app-muted)', dash: '2 4', width: 1.5, step: true };
    for (const tt of sim.t) { let v = 0; for (const c of S.schedule) if (c.t <= tt + 1e-9) v = c.target; tgt.x.push(tt); tgt.y.push(v); }
    document.getElementById('simchart')!.innerHTML =
      lineChart([{ label: 'Cp', x: sim.t, y: sim.cp, color: 'var(--tci-cp)', dash: '6 4' }, { label: 'Ce', x: sim.t, y: sim.ce, color: 'var(--tci-ce)' }, tgt], [], { xLabel: 'min', yLabel: 'µg/mL', xMax: tEnd, cursorX: S.scrub, height: 210 }) +
      lineChart([{ label: 'Rate mL/h', x: sim.t, y: sim.rateMlH, color: 'var(--tci-alt)', step: true, width: 2 }], [], { xLabel: 'min', yLabel: 'mL/h', xMax: tEnd, cursorX: S.scrub, height: 150 });
  },
};

const curvesScreen: Screen = {
  title: 'Curves', tab: 'curves',
  html: () => `${DISCLAIMER}<ul class="app-list" style="margin-bottom:16px">${patientLine()}</ul>
    <div class="app-card"><div class="tci-field-row">${num('target', 'Ce target (µg/mL)', S.target, 'min="0.5" max="12" step="0.1"')}</div></div>
    <ul class="app-list" style="margin-bottom:16px">${switchRow('opioid', 'Opioid co-administration (Eleveld)', '', S.opioid)}</ul>
    <div id="out"></div>`,
  update() {
    const out = document.getElementById('out')!;
    if (!validPatient(S.patient) || !(S.target > 0)) { out.innerHTML = ''; return; }
    const r = rateMgMin();
    const cols: Record<ModelId, string> = { eleveld: 'var(--tci-ce)', schnider: 'var(--tci-cp)', marsh: 'var(--tci-alt)' };
    const series: Series[] = [], markers = [] as { x: number; y: number; label: string; color: string }[];
    const rows: string[] = [];
    let cpSeries: Series[] = [];
    for (const m of ['eleveld', 'schnider', 'marsh'] as ModelId[]) {
      const pk = pkFor(m);
      const b = ceBolus(pk, S.target, r);
      const c = doseCurve(pk, b.dose, b.duration, 12, 1 / 30);
      series.push({ label: `${NAMES[m]} Ce`, x: c.t, y: c.ce, color: cols[m], dash: m === 'schnider' ? '7 4' : m === 'marsh' ? '2 3' : undefined });
      const mm = buildModes(pk);
      const pkk = peakOf((t) => ceAfterDose(mm, b.dose, b.duration, t));
      markers.push({ x: pkk.t, y: pkk.v, label: '', color: cols[m] });
      const cpMax = Math.max(...c.cp);
      rows.push(`<tr><td>${modelLabel(m)}</td><td class="mono">${fmt(b.dose, 0)}</td><td class="mono">${fmt(pkk.t, 2)}</td><td class="mono">${fmt(cpMax, 1)}</td><td class="mono">${fmt(pk.ke0, 3)}</td></tr>`);
      if (m === S.from) cpSeries = [{ label: `${NAMES[m]} Cp`, x: c.t, y: c.cp, color: 'var(--tci-cp)', dash: '6 4' }, { label: `${NAMES[m]} Ce`, x: c.t, y: c.ce, color: 'var(--tci-ce)' }];
    }
    const ce50 = eleveldCe50(S.patient);
    out.innerHTML = `<h2 class="app-section-header">Ce after each model's own Ce ${fmt(S.target, 1)} bolus</h2>
      <div class="app-card">${lineChart(series, markers, { xLabel: 'min', yLabel: 'Ce µg/mL', xMax: 12, hLine: { y: S.target, label: 'target' } })}<p class="app-section-footer" style="padding:6px 0 0">Dots mark each peak; times in the table.</p></div>
      <div class="tci-table-wrap"><table class="tci-table"><thead><tr><th>Model</th><th>mg</th><th>Peak min</th><th>Cp max</th><th>ke0</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>
      <h2 class="app-section-header">${NAMES[S.from]}: Cp overshoot during the bolus</h2>
      <div class="app-card">${lineChart(cpSeries, [], { xLabel: 'min', yLabel: 'µg/mL', xMax: 12, hLine: { y: S.target, label: 'target' } })}</div>
      <p class="app-section-footer">Eleveld Ce50 for this age: ${fmt(ce50, 2)} µg/mL (BIS 47 in the Eleveld PD model). Each model's Ce is on its own scale; the numbers are not interchangeable.</p>`;
  },
};

const AGES = [20, 30, 40, 50, 60, 70, 80, 90];
const WTS = [45, 55, 65, 75, 85, 100, 120, 140];
const exploreScreen: Screen = {
  title: 'Sensitivity', tab: 'explore',
  html: () => `${DISCLAIMER}<ul class="app-list" style="margin-bottom:16px">${patientLine()}</ul>
    <p class="app-small app-muted">Matched ${NAMES[S.to]} Ce for ${NAMES[S.from]} Ce ${fmt(S.target, 1)}. Sex and height from the patient; age and weight vary.</p>
    <div id="out"></div>`,
  update() {
    const out = document.getElementById('out')!;
    if (!validPatient(S.patient)) { out.innerHTML = ''; return; }
    const r = rateMgMin();
    const p0 = S.patient;
    const val = (age: number, weight: number) => {
      const p = { ...p0, age, weight };
      return matchTarget(pkFor(S.from, p), S.target, pkFor(S.to, p), r);
    };
    const grid = AGES.map((a) => WTS.map((w) => val(a, w)));
    const flat = grid.flat().filter(Number.isFinite);
    const lo = Math.min(...flat), hi = Math.max(...flat);
    const col = (v: number) => {
      const f = hi > lo ? (v - lo) / (hi - lo) : 0.5;
      return `color-mix(in oklab, var(--app-wine) ${Math.round(12 + 80 * f)}%, var(--app-surface))`;
    };
    const ink = (v: number) => ((hi > lo ? (v - lo) / (hi - lo) : 0) > 0.55 ? 'var(--app-ivory)' : 'var(--app-ink)');
    let heat = `<div class="tci-heat" style="grid-template-columns:44px repeat(${WTS.length},minmax(0,1fr))" role="table" aria-label="Heat map of matched target, age by weight">`;
    heat += `<div class="hd">y \\ kg</div>${WTS.map((w) => `<div class="hd">${w}</div>`).join('')}`;
    AGES.forEach((a, i) => {
      heat += `<div class="hd">${a}</div>` + WTS.map((w, j) => {
        const v = grid[i][j];
        const peak = S.from === 'schnider' || S.to === 'schnider' ? w > jamesPeakWeight(p0) : false;
        return `<div style="background:${col(v)};color:${ink(v)}" title="${a} y, ${w} kg">${fmt(v, 1)}${peak ? '*' : ''}</div>`;
      }).join('');
    });
    heat += '</div>';
    const sensRow = (label: string, p: Patient) => {
      const ea = ceBolus(pkFor(S.from, p), S.target, r).dose, eb = ceBolus(pkFor(S.to, p), S.target, r).dose;
      return `<tr><td>${label}</td><td class="mono">${fmt(ea, 0)}</td><td class="mono">${fmt(eb, 0)}</td><td class="mono">${fmt(matchTarget(pkFor(S.from, p), S.target, pkFor(S.to, p), r), 2)}</td></tr>`;
    };
    const head = `<thead><tr><th></th><th>${NAMES[S.from].slice(0, 4)}. mg</th><th>${NAMES[S.to].slice(0, 4)}. mg</th><th>Match</th></tr></thead>`;
    out.innerHTML = `<div class="app-card">${heat}<div class="tci-scale"><span>${fmt(lo, 1)}</span><span class="bar" style="background:linear-gradient(90deg,${col(lo)},${col(hi)})"></span><span>${fmt(hi, 1)}</span></div>
      <p class="app-section-footer" style="padding:8px 0 0">* past the James LBM peak for this height: Schnider clearance unreliable.</p></div>
      <h2 class="app-section-header">Age (weight ${p0.weight} kg)</h2>
      <div class="tci-table-wrap"><table class="tci-table">${head}<tbody>${AGES.map((a) => sensRow(`${a} y`, { ...p0, age: a })).join('')}</tbody></table></div>
      <h2 class="app-section-header">Weight (age ${p0.age} y)</h2>
      <div class="tci-table-wrap"><table class="tci-table">${head}<tbody>${WTS.map((w) => sensRow(`${w} kg`, { ...p0, weight: w })).join('')}</tbody></table></div>`;
  },
};

const calibrateScreen: Screen = {
  title: 'Calibrate', tab: 'more', back: ['#/more', 'More'],
  html: () => `${DISCLAIMER}<ul class="app-list" style="margin-bottom:16px">${patientLine()}</ul>
    <p class="app-small">Set the same patient, model and Ce target on a real pump. Type the induction bolus the pump displays.</p>
    <div class="app-card">${seg('calModel', 'Model', [['eleveld', 'Eleveld'], ['schnider', 'Schnider'], ['marsh', 'Marsh']], S.calModel)}
      <div class="tci-field-row" style="margin-top:12px">${num('target', 'Ce target', S.target, 'min="0.5" step="0.1"')}
      <label class="app-field"><span class="app-field-label">Pump bolus</span><input class="app-input" name="calDose" type="number" inputmode="decimal" value="${esc(S.calDose)}" placeholder="e.g. 162"></label></div>
      <div style="margin-top:12px">${seg('calUnit', 'Unit', [['mg', 'mg'], ['mL', `mL of ${S.concMgMl / 10}%`]], S.calUnit)}</div></div>
    <div id="out"></div>`,
  update() {
    const out = document.getElementById('out')!;
    const d = parseFloat(S.calDose);
    const r = rateMgMin();
    if (!validPatient(S.patient) || !(S.target > 0)) { out.innerHTML = ''; return; }
    const mg = Number.isFinite(d) ? (S.calUnit === 'mL' ? d * S.concMgMl : d) : NaN;
    const rows = variantsFor(S.calModel, S.opioid).map((v) => {
      const dose = ceBolus(v.pk(S.patient), S.target, r).dose;
      const diff = Number.isFinite(mg) ? (100 * (mg - dose)) / dose : NaN;
      const tag = v.status === 'reported' ? 'app-badge--warn' : v.status === 'hypothesis' ? '' : 'app-badge--ink';
      return { diff, html: `<tr><td style="white-space:normal">${esc(v.label)} <span class="app-badge ${tag}">${v.status}</span></td><td class="mono">${fmt(dose, 0)}</td><td class="mono">${Number.isFinite(diff) ? (diff > 0 ? '+' : '') + fmt(diff, 1) + '%' : '–'}</td></tr>` };
    });
    const best = rows.filter((x) => Number.isFinite(x.diff)).sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))[0];
    const implied = S.calModel === 'eleveld' && Number.isFinite(mg) ? impliedEleveldWeight(S.patient, S.opioid, S.target, mg, r) : null;
    out.innerHTML = `<div class="tci-table-wrap"><table class="tci-table"><thead><tr><th>Variant</th><th>mg</th><th>Pump vs</th></tr></thead><tbody>${rows.map((x) => x.html).join('')}</tbody></table></div>
      ${best ? `<p class="app-panel">Closest: ${Math.abs(best.diff) < 2 ? 'within 2%' : `${fmt(Math.abs(best.diff), 1)}% away`}. ${implied ? `The pump's bolus equals Eleveld with a dosing weight of <b>${fmt(implied, 1)} kg</b> (entered ${S.patient.weight} kg; Servin ABW ${fmt(adjustedBw(S.patient), 1)} kg).` : ''}</p>` : ''}
      <p class="app-section-footer">Rounding on the pump display limits agreement to about ±1 mg. ${S.instantBolus ? 'Bolus treated as instantaneous; set the pump rate in Settings to compare rate-limited boluses.' : ''} Record each comparison in the test log (Assumptions → real-pump questions).</p>`;
  },
};

const REF_ITEMS = (REFS as { refs: { key: string; title: string; fields: Record<string, string>; body: string }[] }).refs;
const ASSUMPTIONS = (REFS as { assumptions: { key: string; title: string; fields: Record<string, string>; body: string }[] }).assumptions;
const linkify = (s: string) => esc(s).replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1" rel="noopener">$1</a>')
  .replace(/\[([a-z0-9]+)\]/g, (_m, k) => (REF_ITEMS.some((r) => r.key === k) ? `<a href="#/refs?k=${k}">[${k}]</a>` : `[${k}]`));

const EQUATIONS = [
  { title: 'Eleveld 2018 PK (arterial)', src: 'eleveld2018', text: `V1 = 6.28 · fcentral(W)/fcentral(70); fcentral(x) = x/(x+33.6)
V2 = 25.5 · W/70 · exp(−0.0156·(age−35))
V3 = 273 · FFM/FFMref · exp(−0.0138·age) [opioid]
CL = 1.79 (M) or 2.10 (F) · (W/70)^0.75 · fCLmat(PMA)/fCLmat(PMAref) · exp(−0.00286·age) [opioid]
Q2 = 1.75 · (V2/25.5)^0.75 · (1 + 1.30·(1 − fQ3mat))
Q3 = 1.11 · (V3/273)^0.75 · fQ3mat/fQ3mat,ref
fCLmat = PMA^9.06/(PMA^9.06 + 42.3^9.06); fQ3mat = A/(A+68.3), A = age in weeks; PMA = age·52.143 + 40
ke0 = 0.146 · (W/70)^−0.25 /min` },
  { title: 'Al-Sallami FFM', src: 'alsallami2015', text: `Male: (0.88 + 0.12/(1+(age/13.4)^−12.7)) · 9270·W/(6680 + 216·BMI)
Female: (1.11 − 0.11/(1+(age/7.1)^−1.1)) · 9270·W/(8780 + 244·BMI)` },
  { title: 'Schnider 1998 PK, ke0 1999', src: 'schnider1998', text: `V1 = 4.27; V2 = 18.9 − 0.391·(age−53); V3 = 238 L
CL1 = 1.89 + 0.0456·(W−77) − 0.0681·(LBM−59) + 0.0264·(H−177)
CL2 = 1.29 − 0.024·(age−53); CL3 = 0.836 L/min; ke0 = 0.456 /min` },
  { title: 'James LBM', src: 'james1976', text: `Male 1.1·W − 128·(W/H)²; female 1.07·W − 148·(W/H)²  (H in cm)
Peaks at W = 1.1·H²/256 (male), 1.07·H²/296 (female)` },
  { title: 'Marsh 1991', src: 'marsh1991', text: `V1 = 0.228·W L; k10 0.119, k12 0.112, k13 0.0419, k21 0.055, k31 0.0033 /min
ke0 0.26 /min (original) or 1.2 /min (modified, Struys 2000)` },
  { title: 'Effect-site bolus', src: 'shafer1992', text: `Bolus D such that max over t of Ce(t) = target.
Linear system: D = target / peak Ce of a 1 mg bolus.` },
  { title: 'Reported Space Plus BMI > 30 (inferred)', src: 'milliet2025', text: `W' = IBW + 0.4·(W − IBW), IBW Devine = 50 (M) or 45.5 (F) + 0.9055·(H − 152.4)
W' replaces W in every Eleveld covariate when BMI > 30. Reported, unverified.` },
];

const refsScreen: Screen = {
  title: 'References', tab: 'more', back: ['#/more', 'More'],
  html: () => `<h2 class="app-section-header">Equations</h2>${EQUATIONS.map((e) => `<div class="app-card"><p class="app-row-title" style="margin:0">${esc(e.title)} <a href="#/refs?k=${e.src}">[${e.src}]</a></p><pre class="tci-eq">${esc(e.text)}</pre></div>`).join('')}
    <h2 class="app-section-header">Sources</h2>${REF_ITEMS.map((r) => `<div class="app-card tci-ref" id="ref-${r.key}">
      <p style="margin:0 0 4px"><b>[${r.key}]</b> <span class="app-badge ${r.fields.status === 'VERIFIED' ? 'app-badge--ok' : r.fields.status === 'UNVERIFIED' ? 'app-badge--bad' : 'app-badge--warn'}">${esc(r.fields.status ?? '')}</span></p>
      <p style="margin:0">${linkify(r.fields.cite ?? r.title)}</p>
      ${r.fields.doi ? `<p style="margin:4px 0 0">DOI <a href="https://doi.org/${esc(r.fields.doi)}" rel="noopener">${esc(r.fields.doi)}</a>${r.fields.pmid ? ` · PMID ${esc(r.fields.pmid)}` : ''}</p>` : ''}
      ${r.fields.url ? `<p style="margin:4px 0 0">${linkify(r.fields.url)}</p>` : ''}
      ${r.fields.used ? `<p class="app-muted" style="margin:4px 0 0">Used for: ${esc(r.fields.used)}</p>` : ''}
      <p class="app-muted" style="margin:4px 0 0">Checked ${esc(r.fields.checked ?? '')}</p></div>`).join('')}`,
  update() {
    const k = new URLSearchParams(location.hash.split('?')[1] ?? '').get('k');
    if (k) document.getElementById(`ref-${k}`)?.scrollIntoView({ block: 'start' });
  },
};

const assumptionsScreen: Screen = {
  title: 'Assumptions', tab: 'more', back: ['#/more', 'More'],
  html: () => `${DISCLAIMER}${ASSUMPTIONS.map((a) => `<div class="app-card"><p class="app-row-title" style="margin:0 0 6px">${esc(a.title)} ${a.fields.status ? `<span class="app-badge ${a.fields.status === 'VERIFIED' ? 'app-badge--ok' : 'app-badge--warn'}">${esc(a.fields.status)}</span>` : ''}</p><p class="app-small" style="margin:0">${linkify(a.body)}</p></div>`).join('')}`,
};

const settingsScreen: Screen = {
  title: 'Settings', tab: 'more', back: ['#/more', 'More'],
  html: () => `<section class="app-section"><h2 class="app-section-header">Look</h2><div class="app-card">${seg('theme', 'Theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], S.theme)}</div></section>
    <section class="app-section"><h2 class="app-section-header">Syringe and pump</h2><div class="app-card">
      ${seg('conc', 'Propofol', [['10', '1% (10 mg/mL)'], ['20', '2% (20 mg/mL)']], String(S.concMgMl))}
      <div class="tci-field-row" style="margin-top:12px">${num('maxRate', 'Max rate (mL/h)', S.maxRateMlH, 'min="50" max="2000" step="50"')}${num('updateSec', 'Update every (s)', S.updateSec, 'min="1" max="60" step="1"')}</div></div>
      <ul class="app-list" style="margin-top:8px">${switchRow('instantBolus', 'Instantaneous bolus in the matcher', 'Off: the bolus runs at the max rate, as a pump gives it', S.instantBolus)}</ul>
      <p class="app-section-footer">Space Plus values are unconfirmed defaults; see Assumptions.</p></section>
    <section class="app-section"><h2 class="app-section-header">BMI above 30 mode</h2>
      <ul class="app-list">${switchRow('bmiMode', 'Reproduce the reported Space Plus adjustment', 'Eleveld only, BMI > 30: Servin adjusted weight replaces total body weight. Reported, unverified.', S.bmiMode)}</ul></section>
    <section class="app-section"><h2 class="app-section-header">Model options</h2><div class="app-card">${seg('marshKe0', 'Marsh ke0', [['0.26', 'Marsh ke0 0.26'], ['1.2', 'Marsh ke0 1.2']], String(S.marshKe0))}</div></section>
    <ul class="app-list"><li><button class="app-row app-row--danger" data-act="reset"><span class="app-row-body"><span class="app-row-title">Reset all inputs</span></span></button></li></ul>
    <p class="tci-foot">App version ${__APP_VERSION__}</p>`,
};

const moreScreen: Screen = {
  title: 'More', tab: 'more',
  html: () => `${DISCLAIMER}<ul class="app-list">
    ${[['pump/', 'Pump emulator', 'Operate a Space plus Perfusor running propofol TCI (Schnider, Eleveld)'],
       ['#/calibrate', 'Calibrate against a real pump', 'Type the pump’s bolus; compare with each model variant'],
       ['#/assumptions', 'Assumptions', 'What the emulator assumes, what is unverified, what to test on a pump'],
       ['#/refs', 'References and equations', 'Sources with DOIs and check dates'],
       ['#/settings', 'Settings', 'Theme, syringe, pump rate, BMI above 30 mode']]
      .map(([h, t, s]) => `<li><a class="app-row" href="${h}"><span class="app-row-body"><span class="app-row-title">${t}</span><span class="app-row-sub">${s}</span></span><span class="app-row-chevron"></span></a></li>`).join('')}
  </ul>
  <p class="tci-foot">Propofol models: Eleveld 2018, Schnider 1998/1999, Marsh 1991. Built for teaching at NTF Anaesthesia by <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>. Contact contact@anantf.com.</p>`,
};

const SCREENS: Record<string, Screen> = {
  match: matchScreen, pump: pumpScreen, curves: curvesScreen, explore: exploreScreen, more: moreScreen,
  calibrate: calibrateScreen, refs: refsScreen, assumptions: assumptionsScreen, settings: settingsScreen,
};

const ICONS: Record<string, string> = {
  match: '<path d="M4 7h11M11 3l4 4-4 4M20 17H9M13 13l-4 4 4 4"/>',
  pump: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8v5H8zM8 16h3M13 16h3"/>',
  curves: '<path d="M3 20h18M4 17c3-12 6-12 8-6s4 6 8 3"/>',
  explore: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
};
const TABS: [string, string][] = [['match', 'Match'], ['pump', 'Pump'], ['curves', 'Curves'], ['explore', 'Explore'], ['more', 'More']];

// ---------------------------------------------------------------- render and events
function applyTheme() {
  const el = document.documentElement;
  if (S.theme === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', S.theme);
  try { if (S.theme === 'system') localStorage.removeItem('tci-theme'); else localStorage.setItem('tci-theme', S.theme); } catch { /* ignore */ }
}

let current: Screen = matchScreen;
function route() {
  const name = (location.hash.replace(/^#\/?/, '').split('?')[0] || 'match');
  current = SCREENS[name] ?? matchScreen;
  const root = document.getElementById('root')!;
  root.innerHTML = `<header class="app-bar app-bar--inline"><div class="app-bar-row"><div class="app-bar-lead">${current.back ? `<a class="app-bar-btn app-back" href="${current.back[0]}">${current.back[1]}</a>` : ''}</div><h1 class="app-bar-title">${esc(current.title)}</h1><div class="app-bar-trail"></div></div></header>
    <main class="app-main" id="main">${current.back ? '' : `<h1 class="app-large-title" aria-hidden="true" style="margin-top:4px">${esc(current.title)}</h1>`}${current.html()}</main>
    <nav class="app-tabbar" aria-label="Sections"><div class="app-tabbar-inner">${TABS.map(([id, label]) =>
      `<a class="app-tab" href="#/${id}" ${current.tab === id ? 'aria-current="page"' : ''}><span class="app-tab-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[id]}</svg></span>${label}</a>`).join('')}</div></nav>`;
  current.update?.();
  window.scrollTo(0, 0);
}

function readNumber(v: string) { const n = parseFloat(v); return Number.isFinite(n) ? n : NaN; }

function onInput(e: Event) {
  const el = e.target as HTMLInputElement;
  if (!el.name) return;
  const v = el.value;
  let rerender = false;
  switch (el.name) {
    case 'sex': S.patient.sex = v as 'M' | 'F'; break;
    case 'age': case 'height': case 'weight': S.patient[el.name] = readNumber(v); break;
    case 'opioid': S.opioid = el.checked; break;
    case 'bmiMode': S.bmiMode = el.checked; break;
    case 'instantBolus': S.instantBolus = el.checked; break;
    case 'target': S.target = readNumber(v); break;
    case 'dir': [S.from, S.to] = v.split('>') as [ModelId, ModelId]; break;
    case 'pumpModel': S.pumpModel = v as ModelId; rerender = true; break;
    case 'pumpMode': S.pumpMode = v as TargetMode; rerender = true; break;
    case 'marshKe0': S.marshKe0 = parseFloat(v); break;
    case 'scrub': S.scrub = parseFloat(v); break;
    case 'conc': S.concMgMl = parseFloat(v); break;
    case 'maxRate': S.maxRateMlH = readNumber(v) || PUMP_DEFAULTS.maxRateMlH; break;
    case 'updateSec': S.updateSec = Math.max(1, readNumber(v) || PUMP_DEFAULTS.updateSec); break;
    case 'theme': S.theme = v as AppState['theme']; applyTheme(); break;
    case 'calModel': S.calModel = v as ModelId; break;
    case 'calDose': S.calDose = v; break;
    case 'calUnit': S.calUnit = v as 'mg' | 'mL'; rerender = true; break;
    default: {
      const m = el.name.match(/^s([tv])(\d+)$/);
      if (m) { const row = S.schedule[+m[2]]; if (row) row[m[1] === 't' ? 't' : 'target'] = readNumber(v); }
    }
  }
  save();
  if (rerender) { const y = scrollY; route(); scrollTo(0, y); } else current.update?.();
}

function onClick(e: Event) {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!b) return;
  const a = b.dataset.act!;
  const y = scrollY;
  if (a === 'tup' || a === 'tdown') {
    S.target = Math.max(0.5, Math.round(((S.target || 0) + (a === 'tup' ? 0.1 : -0.1)) * 10) / 10);
    const inp = document.querySelector<HTMLInputElement>('input[name=target]');
    if (inp) inp.value = String(S.target);
    save(); current.update?.(); return;
  }
  if (a === 'addrow') { const last = S.schedule[S.schedule.length - 1]; S.schedule.push({ t: (last?.t ?? 0) + 10, target: last?.target ?? 3 }); }
  if (a.startsWith('del')) S.schedule.splice(+a.slice(3), 1);
  if (a === 'reset') Object.assign(S, structuredClone(DEFAULTS));
  save(); applyTheme(); route(); scrollTo(0, y);
}

document.addEventListener('input', onInput);
document.addEventListener('change', (e) => { if ((e.target as HTMLInputElement).type === 'radio' || (e.target as HTMLInputElement).type === 'checkbox') onInput(e); });
document.addEventListener('click', onClick);
document.addEventListener('touchstart', () => {}, { passive: true });
window.addEventListener('hashchange', route);
applyTheme();
route();
// keep the derived cpBolus import referenced for Cp targeting docs
void cpBolus;
