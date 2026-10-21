// The virtual LCD (800 x 272 virtual px, --u = 100cqw / 800): every screen is HTML drawn from the pump state.
// Static parts are rebuilt when the screen's shape changes; live numbers are patched through data-f each frame.
// Look is modelled on the reference photo (main running view); other screens are inferred (docs/PUMP.md).
import { PumpState, Run, Sample, WAKE_CE, ce, cp, doseRate, minutesLeft, predict, rateMlH, summaryFor, plannedBolus, timeToFall, timeToTarget, TARGET_MIN, TARGET_MAX } from './sim';
import { PRESETS } from './presets';

export const LCD_W = 800, LCD_H = 272;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Absolute box in virtual px. */
const a = (x: number, y: number, w: number, h: number, cls: string, html = '', extra = '') =>
  `<div class="a ${cls}" style="--x:${x};--y:${y};--w:${w};--h:${h}${extra}">${html}</div>`;
const t = (x: number, y: number, w: number, fs: number, cls: string, html: string, extra = '') =>
  `<div class="a tx ${cls}" style="--x:${x};--y:${y};--w:${w};--h:${fs * 1.3};--fs:${fs}${extra}">${html}</div>`;
const btn = (x: number, y: number, w: number, h: number, act: string, cls: string, html: string, extra = '') =>
  `<button type="button" class="a k ${cls}" data-act="${act}" style="--x:${x};--y:${y};--w:${w};--h:${h}${extra}">${html}</button>`;

const fmt = (x: number, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '--');
export const hms = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const minText = (m: number | null) => (m == null ? '> 6 h' : m < 1 ? `${Math.round(m * 60)} s` : `${fmt(m, 1)} min`);

// soft-key bar: y 212-272 (60 virtual px, so the keys are at least 44 CSS px on a desktop pump)
const PILL = '<svg class="pill" viewBox="0 0 60 24" aria-hidden="true"><rect x="1" y="1" width="58" height="22" rx="11" fill="#e8a235"/><path d="M22 6 15 12l7 6M34 6l-7 6 7 6M46 6l-7 6 7 6" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function softBar(left: [string, string] | null, right: [string, string] | null, rightCls = '') {
  return `<div class="a bar" style="--x:0;--y:212;--w:800;--h:60"></div>` +
    (left ? btn(0, 212, 250, 60, left[0], 'sk sk-l', esc(left[1])) : '') +
    (right ? btn(250, 212, 550, 60, right[0], `sk sk-r ${rightCls}`, (rightCls.includes('sk-amber') ? PILL : '') + esc(right[1])) : '');
}
const title = (text: string) => a(0, 0, 800, 40, 'ttl', esc(text));

function rows(items: [string, string, string?][], y = 48, h = 58) {
  return items.map(([act, label, sub], i) =>
    btn(20, y + i * (h + 4), 760, h, act, 'row', `<span class="row-l">${esc(label)}</span>${sub ? `<span class="row-s">${esc(sub)}</span>` : ''}<span class="row-c"></span>`)).join('');
}

function keypad(y = 34) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', 'del'];
  const x0 = 424, w = 90, h = 56, g = 3;
  return keys.map((k, i) => btn(x0 + (i % 4) * (w + g), y + Math.floor(i / 4) * (h + g), w, h, `key:${k}`, 'kp' + (k === 'del' ? ' kp-del' : ''), k === 'del' ? '&#9003;' : k)).join('');
}

function message(st: PumpState) {
  if (!st.message) return '';
  return a(140, 86, 520, 90, 'msg', `<span>${esc(st.message)}</span>`);
}

// ---------------------------------------------------------------- the screens
function offScreen() { return ''; }

function selfTest(st: PumpState) {
  const f = Math.min(1, Math.max(0, 1 - (st.selfTestEnd - st.wall) / st.settings.selfTestSec));
  return t(0, 70, 800, 40, 'c brand', 'Space<sup>plus</sup> Perfusor') + t(0, 120, 800, 20, 'c dim', 'TCI teaching emulator') +
    a(250, 170, 300, 14, 'pbar', `<i style="width:${(f * 100).toFixed(0)}%"></i>`) + t(0, 196, 800, 18, 'c dim', 'Self-test');
}

function syringe(st: PumpState) {
  return title('Syringe') +
    a(60, 70, 300, 110, 'syr', '<i class="syr-b"></i><i class="syr-p"></i><i class="syr-n"></i>') +
    t(400, 70, 380, 26, '', `${st.settings.syringeMl} mL syringe recognised`) +
    t(400, 110, 380, 20, 'dim', 'Generic 50 mL, Luer lock') +
    t(400, 140, 380, 20, 'dim', 'Check the clamp and plunger holder') +
    softBar(null, ['ok', 'OK']);
}

const drug = () => title('Drug library') + rows([['row:10', 'Propofol 1%', '10 mg / 1 mL'], ['row:20', 'Propofol 2%', '20 mg / 1 mL']]) + softBar(['back', 'BACK'], null);
const mode = () => title('Application mode') + rows([['row:standard', 'Standard', 'mL/h'], ['row:tci', 'TCI', 'target-controlled infusion']]) + softBar(['back', 'BACK'], null);
const standard = () => title('Standard mode') + t(40, 80, 720, 24, '', 'Standard mode (mL/h) is not part of this emulator.') + t(40, 120, 720, 22, 'dim', 'Go back and choose TCI.') + softBar(['back', 'BACK'], ['ok', 'OK']);
const model = () => title('TCI model: propofol') + rows([['row:schnider', 'Schnider', 'effect site, ke0 0.456 /min'], ['row:eleveld', 'Eleveld', 'effect site, general purpose']]) + softBar(['back', 'BACK'], null);
const opioid = () => title('Eleveld: opioid co-administration?') + rows([['row:yes', 'Yes', 'with an opioid'], ['row:no', 'No', 'propofol alone']]) + softBar(['back', 'BACK'], null);

function patient(st: PumpState) {
  const cards = PRESETS.map((p, i) => {
    const x = 20 + (i % 3) * 256, y = 48 + Math.floor(i / 3) * 84;
    return btn(x, y, 248, 80, `preset:${p.id}`, 'card', `<span class="card-t">${esc(p.name)}</span><span class="card-s">${p.patient.sex === 'M' ? 'Male' : 'Female'} ${p.patient.age} y, ${p.patient.height} cm, ${p.patient.weight} kg</span>`);
  }).join('');
  const custom = btn(20 + 256, 48 + 84, 248, 80, 'row:custom', 'card card-c', `<span class="card-t">Custom</span><span class="card-s">enter sex, age, height, weight</span>`);
  void st;
  return title('Patient') + cards + custom + softBar(['back', 'BACK'], null);
}

function custom(st: PumpState) {
  const c = st.custom;
  const names = ['Sex', 'Age (y)', 'Height (cm)', 'Weight (kg)'];
  const vals = [c.sex === 'M' ? 'Male' : c.sex === 'F' ? 'Female' : '--', c.values[0] || '--', c.values[1] || '--', c.values[2] || '--'];
  const list = names.map((n, i) => {
    const active = c.field === i;
    const v = active && i > 0 ? (st.buffer || '') + '<span class="caret"></span>' : esc(vals[i]);
    return a(20, 48 + i * 42, 380, 38, 'fld' + (active ? ' fld-a' : ''), `<span class="fld-n">${n}</span><span class="fld-v">${v}</span>`);
  }).join('');
  const right = c.field === 0
    ? btn(424, 60, 180, 70, 'sex:M', 'kp' + (c.sex === 'M' ? ' kp-on' : ''), 'Male') + btn(612, 60, 180, 70, 'sex:F', 'kp' + (c.sex === 'F' ? ' kp-on' : ''), 'Female')
    : keypad();
  return title('Patient data') + list + right + message(st) + softBar(['back', 'BACK'], ['ok', c.field === 3 ? 'OK' : 'NEXT']);
}

function summary(st: PumpState) {
  const s = st.setup, p = s.patient, sm = summaryFor(s, st.settings);
  const left = [
    ['Model', s.model === 'schnider' ? 'Schnider' : `Eleveld, opioid ${s.opioid ? 'yes' : 'no'}`],
    ['Patient', `${p.sex === 'M' ? 'Male' : 'Female'} ${p.age} y, ${p.height} cm, ${p.weight} kg`],
    ['BMI', fmt(sm.bmi, 1)],
    [s.model === 'schnider' ? 'LBM (James)' : 'FFM (Al-Sallami)', `${fmt(s.model === 'schnider' ? sm.lbm : sm.ffm, 1)} kg`],
    ['Dosing weight', `${fmt(sm.dosingWeight, 1)} kg${sm.dosingWeight !== p.weight ? ' (adjusted)' : ''}`],
  ].map(([k, v], i) => a(20, 46 + i * 33, 390, 30, 'kv', `<span class="kv-k">${esc(k)}</span><span class="kv-v">${esc(v)}</span>`)).join('');
  const w = sm.warnings;
  const box = sm.refused
    ? `<b class="v-stop">Model not available for this patient</b>${w.filter((x) => x.level === 'stop').map((x) => `<span>${esc(x.text)}</span>`).join('')}`
    : w.length ? `<b class="v-warn">Check patient data</b>${w.map((x) => `<span>${esc(x.text)}</span>`).join('')}` : '<b class="v-ok">Patient data within the model range</b>';
  return title(`Patient summary`) + left + a(424, 46, 360, 168, 'vbox' + (sm.refused ? ' vbox-stop' : w.length ? ' vbox-warn' : ' vbox-ok'), box) +
    softBar(['back', 'BACK'], sm.refused ? null : ['ok', 'OK']);
}

function targetEntry(st: PumpState, change: boolean) {
  const buf = st.buffer;
  const v = parseFloat(buf);
  const b = Number.isFinite(v) && v >= TARGET_MIN && v <= TARGET_MAX && !change ? plannedBolus(st.setup, st.settings, Math.round(v * 10) / 10) : null;
  return title(change ? 'Change target' : 'Target') +
    t(20, 52, 390, 22, 'lbl', 'Target Ce (effect site)') +
    a(20, 80, 390, 72, 'big', `<span class="big-v">${esc(buf || '0.0')}<span class="caret"></span></span><span class="big-u">&micro;g/mL</span>`) +
    t(20, 160, 390, 18, 'dim', `${TARGET_MIN} to ${TARGET_MAX} in 0.1 steps`) +
    (b ? t(20, 186, 390, 18, 'dim', `Bolus about ${fmt(b.mg, 0)} mg (${fmt(b.ml, 1)} mL)`) : '') +
    keypad() + message(st) + softBar(['back', 'BACK'], ['ok', st.confirmHigh ? 'CONFIRM' : 'OK'], st.confirmHigh ? 'sk-amber' : '');
}

function ready(st: PumpState) {
  const tg = st.pendingTarget;
  const b = plannedBolus(st.setup, st.settings, tg);
  const s = st.setup;
  return title('TCI ready') +
    a(20, 46, 760, 60, 'kv kv-big', `<span class="kv-k">Target Ce</span><span class="kv-v">${fmt(tg, 1)} &micro;g/mL</span>`) +
    a(20, 110, 760, 34, 'kv', `<span class="kv-k">Induction bolus</span><span class="kv-v" data-f="plan">${fmt(b.mg, 0)} mg = ${fmt(b.ml, 1)} mL of ${s.conc / 10}%, over ${fmt(b.sec, 0)} s (${st.settings.maxRateMlH} mL/h${b.capped ? ', then held at the plasma limit' : ''})</span>`) +
    a(20, 146, 760, 34, 'kv', `<span class="kv-k">Model</span><span class="kv-v">${s.model === 'schnider' ? 'Schnider' : `Eleveld, opioid ${s.opioid ? 'yes' : 'no'}`}; plasma overshoot ${st.settings.cpMaxRatio * 100}%</span>`) +
    t(20, 190, 760, 18, 'dim', 'Press START to begin the infusion') +
    softBar(['back', 'BACK'], ['start', 'START'], 'sk-green');
}

// --- running views
const label = (x: number, y: number, w: number, text: string) => t(x, y, w, 24, 'c lbl', text);

function statusColumn(st: PumpState, run: Run) {
  return a(8, 10, 86, 40, 'runled' + (run.paused || run.empty ? ' runled-off' : ''), '') +
    a(8, 54, 86, 24, 'batt', `<i></i><span>12h</span>`) +
    t(8, 92, 88, 22, 'c mono', `<span data-f="elapsed">${hms(run.t)}</span>`) +
    a(8, 130, 86, 50, 'gauge', '<i></i><span>12</span>') +
    t(8, 184, 88, 16, 'c dim', 'mmHg');
}

function mainView(st: PumpState, run: Run) {
  const s = st.setup;
  const pre = st.alarm === 'prealarm';
  const hh = pre ? 40 : 64; // header shrinks to make room for the pre-alarm band (inferred layout)
  const header = run.empty
    ? a(100, 6, 510, hh, 'drug drug-alarm', `<b>Syringe empty</b><span>Propofol ${s.conc} mg / 1 mL</span>`)
    : run.paused
      ? a(100, 6, 510, hh, 'drug drug-pause', `<b>Propofol</b><span>STOPPED. ${s.conc} mg / 1 mL</span>`)
      : a(100, 6, 510, hh, `drug${pre ? ' drug-s' : ''}`, `<b>Propofol</b><span>${s.conc} mg / 1 mL</span>`);
  const band = pre
    ? a(100, 48, 510, 22, 'pre', `<span data-f="pre">${preText(run, s.conc)}</span>`) + btn(540, 48, 70, 22, 'ack', 'pre-ok', 'OK')
    : '';
  const tci = a(100, 74, 170, 56, 'cell', `<span class="lbl">Target Ce</span><span class="val val-m" data-f="target">${fmt(run.target, 1)}</span>`) +
    a(270, 74, 170, 56, 'cell', `<span class="lbl">Ce</span><span class="val val-m" data-f="ce">${fmt(ce(run), 2)}</span>`) +
    a(440, 74, 170, 56, 'cell cell-last', `<span class="lbl">Cp</span><span class="val val-m" data-f="cp">${fmt(cp(run), 2)}</span>`);
  const amounts = a(100, 132, 255, 62, 'cell', `<span class="lbl">Infused Amount</span><span class="val" data-f="infused">${fmt(run.infusedMg, 2)}<small> mg</small></span>`) +
    a(355, 132, 255, 62, 'cell cell-last', `<span class="lbl">Remaining Volume</span><span class="val" data-f="remain">${fmt(run.remainingMl, 2)}<small> / ${st.settings.syringeMl} mL</small></span>`);
  // bolus strip: its own row under the numerals, never over them (induction, catch-up or raised-target bolus)
  const strip = run.inBolus && !run.paused && !run.empty
    ? a(100, 193, 510, 18, 'ind', `<i data-f="indbar" style="width:${pct(run)}%"></i><span data-f="ind">${bolusText(run, s.conc)}</span>`)
    : a(100, 193, 510, 18, 'ind ind-idle', '');
  const r = rateMlH(run, s.conc);
  const right = a(614, 6, 186, 204, 'flow', `${label(0, 6, 186, 'Flow Rate')}<span class="flow-v" data-f="rate">${rateHtml(r)}</span><span class="flow-u">mL/h</span><i class="flow-d"></i><span class="flow-dose" data-f="dose">${fmt(doseRate(run), 1)} <small>mg/kg/h</small></span>`);
  const rightKey: [string, string] = run.paused && !run.empty ? ['start', 'START'] : ['target', 'CHANGE TARGET'];
  return statusColumn(st, run) + header + band + tci + amounts + strip + right + message(st) +
    softBar(['view', 'CHANGE VIEW'], rightKey, run.paused && !run.empty ? 'sk-green' : 'sk-amber');
}
const pct = (run: Run) => Math.min(100, (100 * run.bolusGivenMg) / Math.max(1e-9, run.bolusPlannedMg)).toFixed(1);
const bolusText = (run: Run, conc: number) => `${run.inInduction ? 'Bolus' : 'New bolus'} ${fmt(run.bolusGivenMg / conc, 1)} / ${fmt(run.bolusPlannedMg / conc, 1)} mL`;
const preText = (run: Run, conc: number) => { const m = minutesLeft(run, conc); return `Syringe nearly empty${Number.isFinite(m) ? `, about ${Math.max(1, Math.round(m))} min left` : ''}`; };
export function rateHtml(r: number) {
  const s = r.toFixed(1);
  const [i, d] = s.split('.');
  return `${i}<small>.${d}</small>`;
}

function trendView(st: PumpState, run: Run) {
  const s = st.setup;
  return statusColumn(st, run) +
    a(100, 6, 510, 28, 'ttl2', `Trend: Cp, Ce and target (&micro;g/mL)`) +
    a(100, 36, 510, 172, 'trend', `<canvas class="trend-c" width="510" height="180"></canvas>`) +
    a(614, 6, 186, 204, 'flow', `${label(0, 6, 186, 'Flow Rate')}<span class="flow-v" data-f="rate">${rateHtml(rateMlH(run, s.conc))}</span><span class="flow-u">mL/h</span><i class="flow-d"></i><span class="flow-dose"><small>Ce</small> <span data-f="ce">${fmt(ce(run), 2)}</span></span>`) +
    message(st) + softBar(['view', 'CHANGE VIEW'], ['target', 'CHANGE TARGET'], 'sk-amber');
}

function detailsView(st: PumpState, run: Run) {
  const s = st.setup, p = s.patient;
  const ttt = timeToTarget(st), dec = timeToFall(run, WAKE_CE);
  const items: [string, string, string?][] = [
    ['Model', s.model === 'schnider' ? 'Schnider' : `Eleveld, opioid ${s.opioid ? 'yes' : 'no'}`],
    ['Patient', `${p.sex === 'M' ? 'M' : 'F'} ${p.age} y, ${p.height} cm, ${p.weight} kg${run.dosingWeight !== p.weight ? ` (dosing ${fmt(run.dosingWeight, 1)} kg)` : ''}`],
    ['ke0', `${fmt(run.pk.ke0, 3)} /min`],
    ['V1 / CL', `${fmt(run.pk.v1, 2)} L / ${fmt(run.pk.cl1, 2)} L/min`],
    ['Time to target', ttt == null ? '> 30 min' : ttt === 0 ? 'at target' : minText(ttt), 'ttt'],
    [`Decrement time to Ce ${WAKE_CE.toFixed(1)}`, dec === 0 ? 'now' : minText(dec), 'dec'],
    ['Plasma overshoot', `${st.settings.cpMaxRatio * 100}% (Cp up to ${fmt(st.settings.cpMaxRatio * run.target, 1)})`],
    ['Max rate', `${st.settings.maxRateMlH} mL/h; update every ${st.settings.updateSec} s`],
  ];
  const list = items.map(([k, v, f], i) => a(100 + (i % 2) * 352, 40 + Math.floor(i / 2) * 42, 344, 40, 'kv kv-s', `<span class="kv-k">${esc(k)}</span><span class="kv-v"${f ? ` data-f="${f}"` : ''}>${esc(v)}</span>`)).join('');
  return statusColumn(st, run) + a(100, 6, 700, 28, 'ttl2', 'TCI details') + list + message(st) +
    softBar(['view', 'CHANGE VIEW'], ['target', 'CHANGE TARGET'], 'sk-amber');
}

function confirmOff() {
  return a(140, 50, 520, 150, 'dlg', `<b>Switch off?</b><span>The case ends and the TCI data are lost.</span>`) +
    softBar(['back', 'NO'], ['ok', 'YES, SWITCH OFF']);
}

function emptyScreen(st: PumpState, run: Run) {
  return a(0, 0, 800, 40, 'ttl ttl-alarm', 'Alarm: syringe empty') +
    t(40, 60, 720, 26, '', 'Delivery stopped. The TCI model keeps running.') +
    a(40, 96, 720, 34, 'kv', `<span class="kv-k">Ce now</span><span class="kv-v" data-f="ce">${fmt(ce(run), 2)} &micro;g/mL (falling)</span>`) +
    a(40, 132, 720, 34, 'kv', `<span class="kv-k">Infused</span><span class="kv-v" data-f="infused">${fmt(run.infusedMg, 1)} mg</span>`) +
    a(40, 172, 720, 44, 'tx dim wrap', 'Replace the syringe, then press START to resume TCI. The pump gives a catch-up bolus if Ce has fallen.', ';--fs:18') +
    softBar(null, ['replace', 'REPLACE SYRINGE'], 'sk-amber') + (st.message ? message(st) : '');
}

// ---------------------------------------------------------------- render
export function shapeKey(st: PumpState): string {
  const r = st.run;
  return [st.screen, st.view, st.alarm, st.message ?? '', st.custom.field, st.custom.sex, st.buffer, st.confirmHigh,
    r ? `${r.paused}|${r.empty}|${r.inInduction}|${r.inBolus}|${r.target}|${r.syringes}` : '', st.settings.servin, st.settings.maxRateMlH, st.setup.presetId, st.pendingTarget].join('/');
}

export function screenHtml(st: PumpState): string {
  const r = st.run;
  switch (st.screen) {
    case 'off': return offScreen();
    case 'selftest': return selfTest(st);
    case 'syringe': return syringe(st);
    case 'drug': return drug();
    case 'mode': return mode();
    case 'standard': return standard();
    case 'model': return model();
    case 'opioid': return opioid();
    case 'patient': return patient(st);
    case 'custom': return custom(st);
    case 'summary': return summary(st);
    case 'target': return targetEntry(st, false);
    case 'ready': return ready(st);
    case 'changeTarget': return targetEntry(st, true);
    case 'confirmOff': return confirmOff();
    case 'empty': return r ? emptyScreen(st, r) : '';
    case 'run': return r ? (st.view === 1 ? mainView(st, r) : st.view === 2 ? trendView(st, r) : detailsView(st, r)) : '';
  }
}

/** Patch the live numbers without rebuilding the screen. */
export function patchLive(st: PumpState, root: HTMLElement) {
  const r = st.run;
  const set = (f: string, html: string) => { const el = root.querySelector<HTMLElement>(`[data-f="${f}"]`); if (el && el.innerHTML !== html) el.innerHTML = html; };
  if (st.screen === 'selftest') {
    const f = Math.min(1, Math.max(0, 1 - (st.selfTestEnd - st.wall) / st.settings.selfTestSec));
    const bar = root.querySelector<HTMLElement>('.pbar i'); if (bar) bar.style.width = `${(f * 100).toFixed(0)}%`;
    return;
  }
  if (!r) return;
  const s = st.setup;
  set('elapsed', hms(r.t));
  set('ce', st.screen === 'empty' ? `${fmt(ce(r), 2)} &micro;g/mL (falling)` : fmt(ce(r), 2));
  set('cp', fmt(cp(r), 2));
  set('target', fmt(r.target, 1));
  set('rate', rateHtml(rateMlH(r, s.conc)));
  set('dose', `${fmt(doseRate(r), 1)} <small>mg/kg/h</small>`);
  set('infused', st.screen === 'empty' ? `${fmt(r.infusedMg, 1)} mg` : `${fmt(r.infusedMg, 2)}<small> mg</small>`);
  set('remain', `${fmt(r.remainingMl, 2)}<small> / ${st.settings.syringeMl} mL</small>`);
  if (r.inBolus) {
    set('ind', bolusText(r, s.conc));
    const bar = root.querySelector<HTMLElement>('[data-f="indbar"]'); if (bar) bar.style.width = `${pct(r)}%`;
  }
  if (st.alarm === 'prealarm') set('pre', preText(r, s.conc));
  if (st.screen === 'run' && st.view === 3) {
    const ttt = timeToTarget(st), dec = timeToFall(r, WAKE_CE);
    set('ttt', ttt == null ? '> 30 min' : ttt === 0 ? 'at target' : minText(ttt));
    set('dec', dec === 0 ? 'now' : minText(dec));
  }
}

/** Trend canvas (view 2): last 20 min of Cp (dashed) and Ce (solid), the target line and a 5 min prediction. */
export function drawTrend(st: PumpState, canvas: HTMLCanvasElement, prediction: Sample[]) {
  const r = st.run;
  if (!r) return;
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const cssW = canvas.clientWidth || 510, cssH = canvas.clientHeight || 180;
  const W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  const g = canvas.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, cssW, cssH);
  const span = 20 * 60, ahead = 5 * 60;
  const t0 = Math.max(0, r.t - span), t1 = Math.max(r.t + ahead, span + ahead);
  const tStart = r.t < span ? 0 : t0;
  const L = Math.round(cssW * 0.075), R = 6, T = 8, B = Math.round(cssH * 0.12);
  const pts = r.samples.filter((q) => q.t >= tStart);
  const yMax = Math.max(1, r.target * 1.25, ...pts.map((q) => Math.max(q.ce, Math.min(q.cp, r.target * 3))), ...prediction.map((q) => q.ce)) * 1.08;
  const px = (tt: number) => L + ((cssW - L - R) * (tt - tStart)) / (t1 - tStart);
  const py = (v: number) => T + (cssH - T - B) * (1 - Math.min(v, yMax) / yMax);
  const fs = Math.max(0.07 * cssH, 19 * (cssW / 510)); g.font = `${fs}px Hind, Arial, sans-serif`;
  g.fillStyle = '#9fb6c6'; g.strokeStyle = '#2d3a44'; g.lineWidth = 1;
  const step = yMax > 8 ? 4 : yMax > 4 ? 2 : 1;
  for (let v = 0; v <= yMax; v += step) {
    g.beginPath(); g.moveTo(L, py(v)); g.lineTo(cssW - R, py(v)); g.stroke();
    g.textAlign = 'right'; g.fillText(String(v), L - 4, py(v) + 4);
  }
  g.textAlign = 'center';
  const mStep = 5 * 60;
  for (let tt = Math.ceil(tStart / mStep) * mStep; tt <= t1; tt += mStep) {
    g.beginPath(); g.moveTo(px(tt), T); g.lineTo(px(tt), cssH - B); g.stroke();
    if (px(tt) < cssW - R - 30) g.fillText(`${Math.round(tt / 60)}`, px(tt), cssH - 4);
  }
  g.textAlign = 'right'; g.fillText('min', cssW - R, cssH - 4);
  // target (step line)
  g.strokeStyle = '#e8c547'; g.setLineDash([4, 3]); g.lineWidth = 1.2;
  g.beginPath();
  pts.forEach((q, i) => { if (i === 0) g.moveTo(px(q.t), py(q.target)); else g.lineTo(px(q.t), py(q.target)); });
  g.lineTo(px(t1), py(r.target)); g.stroke();
  // now line
  g.setLineDash([]); g.strokeStyle = '#6a7d8c'; g.beginPath(); g.moveTo(px(r.t), T); g.lineTo(px(r.t), cssH - B); g.stroke();
  const line = (arr: Sample[], key: 'cp' | 'ce', color: string, dash: number[], width: number) => {
    if (arr.length < 2) return;
    g.strokeStyle = color; g.setLineDash(dash); g.lineWidth = width; g.beginPath();
    arr.forEach((q, i) => { if (i === 0) g.moveTo(px(q.t), py(q[key])); else g.lineTo(px(q.t), py(q[key])); });
    g.stroke();
  };
  line(pts, 'cp', '#8fd3f4', [5, 3], 1.5);
  line(pts, 'ce', '#ffffff', [], 2);
  const pred = [{ t: r.t, cp: cp(r), ce: ce(r), target: r.target, rateMlH: 0 }, ...prediction];
  line(pred, 'cp', '#8fd3f4', [2, 3], 1);
  line(pred, 'ce', '#ffffff', [2, 3], 1.2);
  g.setLineDash([]);
  g.textAlign = 'left'; const ly = T + fs; g.fillStyle = '#8fd3f4'; g.fillText('Cp', L + 4, ly); g.fillStyle = '#fff'; g.fillText('Ce', L + 4 + fs * 1.8, ly); g.fillStyle = '#e8c547'; g.fillText('target', L + 4 + fs * 3.6, ly);
}

export const predictionFor = (st: PumpState) => predict(st, 5);
