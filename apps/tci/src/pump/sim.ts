// The pump as a pure state machine plus a real-time TCI run, no DOM. Every number the screen shows comes from here,
// and every PK number comes from the shared engine (src/engine): nothing is duplicated.
// Which steps are evidence, inferred or unknown is tabulated in docs/PUMP.md; the comments here mark "inferred".
import {
  MODELS, Modes, Patient, PKParams, PUMP_DEFAULTS, PumpSettings, RateKind, State, Warning, alSallamiFfm, bmi, buildModes,
  ceBolus, ceOf, cpOf, eleveldPk, jamesLbm, jamesPeakWeight, matchTargetPump, pumpInduction, rateDetail, rateFor,
  reportedSpacePlusWeight, schniderPk, step, zeroState,
} from '../engine';
import { PRESETS, presetById } from './presets';

export type ModelChoice = 'schnider' | 'eleveld';
export type ScreenId =
  | 'off' | 'selftest' | 'syringe' | 'drug' | 'mode' | 'standard' | 'model' | 'opioid' | 'patient' | 'custom'
  | 'summary' | 'target' | 'ready' | 'run' | 'changeTarget' | 'confirmOff' | 'empty';
export type View = 1 | 2 | 3;
export type Alarm = 'none' | 'prealarm' | 'empty';

export interface Setup { conc: 10 | 20; model: ModelChoice; opioid: boolean; patient: Patient; presetId: string | null }
export interface Settings {
  maxRateMlH: number; // 800 default (VERIFIED on the department's pump, 21 Oct 2026); 1200 and 1800 as teaching options
  cpMaxRatio: number; // plasma overshoot limit, 4 = 400% (VERIFIED)
  updateSec: number; // controller update interval (10 s, unverified)
  syringeMl: number; // 50 mL syringe
  servin: boolean; // reported Space Plus BMI > 30 Eleveld behaviour (Servin adjusted weight), reported, unverified
  selfTestSec: number;
  prealarmMin: number; // syringe nearly empty pre-alarm, minutes of drug left at the current rate (5, inferred)
}

export interface Sample { t: number; cp: number; ce: number; target: number; rateMlH: number }

export interface Run {
  pk: PKParams; m: Modes; s: State;
  t: number; // s since Start
  target: number; // ug/mL
  rateMgMin: number; // rate in force now
  nextUpdate: number; // s
  rMax: number; // mg/min
  infusedMg: number;
  remainingMl: number;
  plannedBolusMg: number; // the pump's induction dose (engine pumpInduction: max rate, then the plasma cap)
  bolusSec: number; // its duration
  kind: RateKind; // why the controller chose the current rate
  inductionGivenMg: number;
  inInduction: boolean;
  dosingWeight: number;
  samples: Sample[]; // every SAMPLE_S seconds, for the trend
  paused: boolean;
  empty: boolean;
  waitingToFall: boolean; // target lowered: rate 0 until the predicted Ce falls to it
  targetSetAt: number; // s, last target change
  lastRate: number; // mg/min, last rate from the controller
  syringes: number;
  prealarmed: boolean; // pre-alarm showing (clears by itself when the time left rises, or on OK / replace)
  prealarmAck: boolean; // acknowledged on the screen: stays quiet until the syringe is replaced (inferred)
  bolusGivenMg: number; // drug given in the current bolus phase (induction or a later catch-up / target-raise bolus)
  bolusPlannedMg: number; // what the controller will give in this bolus phase (engine, from the current state)
  inBolus: boolean; // controller kind is 'induction' (max rate or held at the plasma limit)
}

export interface CustomEntry { field: 0 | 1 | 2 | 3; sex: 'M' | 'F' | null; values: [string, string, string] } // age, height, weight

export interface PumpState {
  screen: ScreenId;
  prev: ScreenId; // screen to return to from confirmOff
  wall: number; // s of real time, for the self-test and messages
  selfTestEnd: number;
  setup: Setup;
  settings: Settings;
  custom: CustomEntry;
  buffer: string; // keypad entry
  confirmHigh: boolean;
  view: View;
  run: Run | null;
  alarm: Alarm;
  message: string | null;
  messageUntil: number;
  beeps: number; // counter: the page plays a sound when it changes
  simT: number; // total simulated seconds since power on
  pendingTarget: number; // target entered, before Start
}

export const SAMPLE_S = 5;
export const TARGET_MIN = 0.5, TARGET_MAX = 8, TARGET_CONFIRM = 6;
export const WAKE_CE = PUMP_DEFAULTS.decrementCe; // decrement (wake-up) Ce, VERIFIED 1.0

export const DEFAULT_SETTINGS: Settings = {
  maxRateMlH: PUMP_DEFAULTS.maxRateMlH, cpMaxRatio: PUMP_DEFAULTS.cpMaxRatio, updateSec: PUMP_DEFAULTS.updateSec,
  syringeMl: 50, servin: false, selfTestSec: 2, prealarmMin: 5,
};

export function initialState(settings: Partial<Settings> = {}): PumpState {
  return {
    screen: 'off', prev: 'off', wall: 0, selfTestEnd: 0,
    setup: { conc: 10, model: 'eleveld', opioid: true, patient: { ...PRESETS[0].patient }, presetId: PRESETS[0].id },
    settings: { ...DEFAULT_SETTINGS, ...settings },
    custom: { field: 0, sex: null, values: ['', '', ''] },
    buffer: '', confirmHigh: false, view: 1, run: null, alarm: 'none', message: null, messageUntil: 0, beeps: 0, simT: 0, pendingTarget: 0,
  };
}

// ---------------------------------------------------------------- derived numbers (all from the engine)
export const validPatient = (p: Patient) => p.age >= 1 && p.age <= 120 && p.height >= 100 && p.height <= 230 && p.weight >= 20 && p.weight <= 250;

/** Dosing weight: total body weight, or Servin adjusted weight for Eleveld at BMI > 30 when the firmware toggle is on. */
export function dosingWeight(setup: Setup, settings: Settings): number {
  if (setup.model === 'eleveld' && settings.servin) return reportedSpacePlusWeight(setup.patient) ?? setup.patient.weight;
  return setup.patient.weight;
}

export function pkFor(setup: Setup, settings: Settings): PKParams {
  if (setup.model === 'schnider') return schniderPk(setup.patient);
  const w = dosingWeight(setup, settings);
  return eleveldPk(setup.patient, { opioid: setup.opioid, weightOverride: w !== setup.patient.weight ? w : undefined });
}

export function otherModelPk(setup: Setup, settings: Settings): PKParams {
  return pkFor({ ...setup, model: setup.model === 'schnider' ? 'eleveld' : 'schnider' }, settings);
}

export interface Summary {
  bmi: number; lbm: number; ffm: number; peak: number; warnings: Warning[]; refused: boolean; dosingWeight: number;
}
export function summaryFor(setup: Setup, settings: Settings): Summary {
  const p = setup.patient;
  const warnings = MODELS[setup.model].check(p);
  return {
    bmi: bmi(p), lbm: jamesLbm(p), ffm: alSallamiFfm(p), peak: jamesPeakWeight(p), warnings,
    refused: warnings.some((w) => w.level === 'stop'), dosingWeight: dosingWeight(setup, settings),
  };
}

export const rMaxFor = (setup: Setup, settings: Settings) => (settings.maxRateMlH * setup.conc) / 60; // mg/min
export const pumpSettings = (setup: Setup, settings: Settings): PumpSettings =>
  ({ concMgMl: setup.conc, maxRateMlH: settings.maxRateMlH, updateSec: settings.updateSec, cpMaxRatio: settings.cpMaxRatio });

/** Induction dose the pump will give for this target: the engine's pumpInduction (max rate, then the plasma cap).
 *  `capped` is true when part of the bolus runs below the maximum rate because Cp is held at the plasma limit. */
export function plannedBolus(setup: Setup, settings: Settings, target: number) {
  const pk = pkFor(setup, settings);
  const b = pumpInduction(pk, target, pumpSettings(setup, settings));
  const tPeakMin = ceBolus(pk, target, rMaxFor(setup, settings)).tPeak;
  const capped = b.mg < (rMaxFor(setup, settings) * b.sec) / 60 - 1e-6;
  return { mg: b.mg, ml: b.mg / setup.conc, sec: b.sec, pk, tPeakMin, capped };
}

/** Drug the controller will give in the bolus phase that starts from the run's current state (same stepping as the run). */
export function bolusFromNow(st: PumpState, run: Run): number {
  let s = run.s, mg = 0;
  const dt = dtMin(st);
  for (let i = 0; i < 120; i++) {
    const d = rateDetail('Ce', run.m, s, run.target, dt, run.rMax, st.settings.cpMaxRatio * run.target);
    if (d.kind !== 'induction') break;
    mg += d.r * dt;
    s = step(run.m, s, d.r, dt);
  }
  return mg;
}

/** Same patient, other model: its bolus for this Ce, and the target on it that matches this model's bolus. */
export function comparison(setup: Setup, settings: Settings, target: number) {
  const a = pkFor(setup, settings), b = otherModelPk(setup, settings), r = rMaxFor(setup, settings);
  const other: ModelChoice = setup.model === 'schnider' ? 'eleveld' : 'schnider';
  const otherSetup = { ...setup, model: other };
  const refused = summaryFor(otherSetup, settings).refused;
  const ps = pumpSettings(setup, settings);
  void r;
  return {
    other, refused,
    thisMg: pumpInduction(a, target, ps).mg,
    otherMg: pumpInduction(b, target, ps).mg,
    matched: matchTargetPump(a, target, b, ps),
  };
}

// ---------------------------------------------------------------- the run
export function startRun(setup: Setup, settings: Settings, target: number, remainingMl?: number): Run {
  const b = plannedBolus(setup, settings, target);
  return {
    pk: b.pk, m: buildModes(b.pk), s: zeroState(), t: 0, target, rateMgMin: 0, nextUpdate: 0, rMax: rMaxFor(setup, settings),
    infusedMg: 0, remainingMl: remainingMl ?? settings.syringeMl, plannedBolusMg: b.mg, bolusSec: b.sec, inductionGivenMg: 0,
    kind: 'off', inInduction: true, dosingWeight: dosingWeight(setup, settings), samples: [], paused: false, empty: false, waitingToFall: false,
    targetSetAt: 0, lastRate: 0, syringes: 1, prealarmed: false, prealarmAck: false,
    bolusGivenMg: 0, bolusPlannedMg: b.mg, inBolus: true,
  };
}

const dtMin = (st: PumpState) => st.settings.updateSec / 60;

function controller(st: PumpState, run: Run) {
  return rateDetail('Ce', run.m, run.s, run.target, dtMin(st), run.rMax, st.settings.cpMaxRatio * run.target);
}

/** Advance the run by `sec` simulated seconds. Exact integration between controller updates. */
export function advanceRun(st: PumpState, sec: number): void {
  const run = st.run;
  if (!run) return;
  const conc = st.setup.conc;
  let left = sec;
  while (left > 1e-9) {
    if (run.t >= run.nextUpdate - 1e-9) {
      // controller update (every updateSec; inferred interval). Induction is every interval the controller calls
      // 'induction' from the start (max rate, then the plasma cap), exactly as the engine's pumpInduction counts it.
      if (run.paused || run.empty) { run.rateMgMin = 0; run.kind = 'off'; }
      else {
        const d = controller(st, run);
        run.lastRate = d.r;
        run.rateMgMin = d.r;
        run.kind = d.kind;
        if (run.inInduction && d.kind !== 'induction') run.inInduction = false;
        if (run.waitingToFall && d.r > 0) run.waitingToFall = false;
        if (d.kind === 'induction' && !run.inBolus) { run.inBolus = true; run.bolusGivenMg = 0; run.bolusPlannedMg = bolusFromNow(st, run); }
        if (d.kind !== 'induction') run.inBolus = false;
      }
      run.nextUpdate = run.t + st.settings.updateSec;
    }
    let chunk = Math.min(left, run.nextUpdate - run.t);
    if (chunk <= 0) chunk = left;
    // syringe limit
    let u = run.rateMgMin;
    if (u > 0) {
      const mlNeeded = (u * chunk) / 60 / conc;
      if (mlNeeded > run.remainingMl + 1e-12) {
        chunk = Math.max(0, (run.remainingMl * conc * 60) / u);
        if (chunk < 1e-6) { // empty now
          run.empty = true; run.rateMgMin = 0; run.remainingMl = 0; u = 0;
          if (st.alarm !== 'empty') { st.alarm = 'empty'; st.screen = 'empty'; st.beeps++; }
          chunk = Math.min(left, run.nextUpdate - run.t);
          if (chunk <= 0) chunk = left;
        }
      }
    }
    run.s = step(run.m, run.s, u, chunk / 60);
    const mg = (u * chunk) / 60;
    run.infusedMg += mg;
    run.remainingMl -= mg / conc;
    if (run.inInduction) run.inductionGivenMg += mg;
    if (run.inBolus) run.bolusGivenMg += mg;
    if (run.remainingMl < 1e-9) run.remainingMl = 0;
    run.t += chunk;
    st.simT += chunk;
    left -= chunk;
    // trend samples
    const last = run.samples[run.samples.length - 1];
    if (!last || run.t - last.t >= SAMPLE_S - 1e-9) {
      run.samples.push({ t: run.t, cp: cpOf(run.m, run.s), ce: ceOf(run.m, run.s), target: run.target, rateMlH: (u * 60) / conc });
    }
    // pre-alarm: minutes of drug left at the current rate (inferred threshold). Not judged during any bolus phase
    // (induction, catch-up or a raised target: the maximum rate would always read under 5 min with a full syringe),
    // and it clears by itself when the time left rises above the threshold again.
    const minLeft = u > 0 ? (run.remainingMl * conc) / u : Infinity;
    const low = !run.inBolus && run.kind !== 'induction' && u > 0 && run.remainingMl > 0 && minLeft <= st.settings.prealarmMin;
    if (low && !run.prealarmed && !run.prealarmAck) { run.prealarmed = true; st.alarm = 'prealarm'; st.beeps++; }
    if (run.prealarmed && !low && minLeft > st.settings.prealarmMin * 1.2) { run.prealarmed = false; if (st.alarm === 'prealarm') st.alarm = 'none'; }
  }
}

/** Minutes of drug left at the rate now (Infinity at rate 0). */
export const minutesLeft = (run: Run, conc: number) => (run.rateMgMin > 0 ? (run.remainingMl * conc) / run.rateMgMin : Infinity);
export const rateMlH = (run: Run, conc: number) => (run.rateMgMin * 60) / conc;
export const ce = (run: Run) => ceOf(run.m, run.s);
export const cp = (run: Run) => cpOf(run.m, run.s);
export const doseRate = (run: Run) => (run.rateMgMin * 60) / run.dosingWeight; // mg/kg/h on the dosing weight (inferred)

/** Minutes until Ce falls to `level` with no drug (decrement time); null if it is already below or takes over 6 h. */
export function timeToFall(run: Run, level: number): number | null {
  if (ceOf(run.m, run.s) <= level) return 0;
  let s = run.s;
  const h = 5 / 60;
  for (let t = 0; t < 360; t += h) {
    s = step(run.m, s, 0, h);
    if (ceOf(run.m, s) <= level) return t + h;
  }
  return null;
}

/** Controller run forward from the current state (no change to the run): samples every update, `min` minutes. */
export function predict(st: PumpState, min: number): Sample[] {
  const run = st.run;
  if (!run) return [];
  const out: Sample[] = [];
  let s = run.s, t = run.t;
  const dt = dtMin(st);
  const toBoundary = run.nextUpdate - run.t;
  let u = run.rateMgMin;
  if (toBoundary > 1e-9) { s = step(run.m, s, u, toBoundary / 60); t += toBoundary; }
  const n = Math.round((min * 60) / st.settings.updateSec);
  for (let i = 0; i < n; i++) {
    u = run.paused || run.empty ? 0 : rateFor('Ce', run.m, s, run.target, dt, run.rMax, st.settings.cpMaxRatio * run.target);
    out.push({ t, cp: cpOf(run.m, s), ce: ceOf(run.m, s), target: run.target, rateMlH: (u * 60) / st.setup.conc });
    s = step(run.m, s, u, dt);
    t += st.settings.updateSec;
  }
  out.push({ t, cp: cpOf(run.m, s), ce: ceOf(run.m, s), target: run.target, rateMlH: 0 });
  return out;
}

/** Minutes until the predicted Ce is within 1% of the target under the controller (0 if there now). */
export function timeToTarget(st: PumpState): number | null {
  const run = st.run;
  if (!run) return null;
  const now = ceOf(run.m, run.s);
  if (Math.abs(now - run.target) <= 0.01 * run.target) return 0;
  const p = predict(st, 30);
  for (const q of p) if (Math.abs(q.ce - run.target) <= 0.01 * run.target) return (q.t - run.t) / 60;
  return null;
}

// ---------------------------------------------------------------- key and touch actions
function say(st: PumpState, text: string, sec = 4) { st.message = text; st.messageUntil = st.wall + sec; }

function goOff(st: PumpState) {
  const keep = st.settings;
  Object.assign(st, initialState(), { settings: keep });
}

function parseBuffer(b: string): number { const n = parseFloat(b); return Number.isFinite(n) ? n : NaN; }

function keypad(st: PumpState, c: string, maxLen = 5) {
  if (c === 'del') st.buffer = st.buffer.slice(0, -1);
  else if (c === '.') { if (!st.buffer.includes('.')) st.buffer = (st.buffer || '0') + '.'; }
  else if (/^\d$/.test(c) && st.buffer.length < maxLen) st.buffer = st.buffer === '0' ? c : st.buffer + c;
  st.confirmHigh = false;
}

function acceptTarget(st: PumpState, next: ScreenId): boolean {
  const v = parseBuffer(st.buffer);
  if (!(v >= TARGET_MIN && v <= TARGET_MAX)) { say(st, `Target ${TARGET_MIN} to ${TARGET_MAX} µg/mL`); st.beeps++; return false; }
  const t = Math.round(v * 10) / 10;
  if (t > TARGET_CONFIRM && !st.confirmHigh) { st.confirmHigh = true; say(st, `Target above ${TARGET_CONFIRM} µg/mL: press OK again to confirm`, 8); return false; }
  st.confirmHigh = false;
  if (next === 'ready') { st.pendingTarget = t; st.screen = 'ready'; return true; }
  // change target during a run
  const run = st.run!;
  const old = run.target;
  run.target = t;
  run.targetSetAt = run.t;
  run.nextUpdate = run.t; // recompute at once (inferred: the pump reacts immediately)
  run.waitingToFall = t < old;
  if (t > old) { run.inInduction = false; run.inBolus = false; } // a raised target starts a new bolus phase, counted from here
  st.screen = 'run';
  st.message = null;
  return true;
}

/** Apply a hardware key or a touch on the screen. Actions: power, home, stop, start, ok, back, view, target,
 *  replace, row:<id>, key:<c>, sex:<M|F>, preset:<id>, load:<json> (teaching panel). Mutates and returns the state. */
export function act(st: PumpState, a: string): PumpState {
  const sc = st.screen;
  if (a === 'power') {
    if (sc === 'off') { st.screen = 'selftest'; st.selfTestEnd = st.wall + st.settings.selfTestSec; st.beeps++; return st; }
    if (sc === 'selftest') return st;
    if (sc === 'confirmOff') { st.screen = st.prev; return st; }
    st.prev = sc; st.screen = 'confirmOff'; return st;
  }
  if (sc === 'off' || sc === 'selftest') return st;
  if (a === 'home') {
    if (sc === 'confirmOff') { st.screen = st.prev; return st; }
    if (st.run) { if (st.alarm === 'empty' && st.run.empty) { st.screen = 'empty'; return st; } st.screen = 'run'; st.view = 1; return st; }
    if (sc !== 'syringe') st.screen = 'drug'; // inferred: Home during set-up returns to the drug library
    return st;
  }
  if (a === 'stop') {
    if (st.run && !st.run.paused) { st.run.paused = true; st.run.rateMgMin = 0; st.run.nextUpdate = st.run.t; st.run.inBolus = false; if (sc !== 'empty') st.screen = 'run'; }
    return st;
  }
  switch (sc) {
    case 'confirmOff':
      if (a === 'ok') goOff(st); else if (a === 'back') st.screen = st.prev;
      return st;
    case 'syringe':
      if (a === 'ok') st.screen = 'drug';
      return st;
    case 'drug':
      if (a === 'row:10' || a === 'row:20') { st.setup.conc = a === 'row:10' ? 10 : 20; st.screen = 'mode'; }
      else if (a === 'back') st.screen = 'syringe';
      return st;
    case 'mode':
      if (a === 'row:tci') st.screen = 'model';
      else if (a === 'row:standard') st.screen = 'standard';
      else if (a === 'back') st.screen = 'drug';
      return st;
    case 'standard':
      if (a === 'ok' || a === 'back') st.screen = 'mode';
      return st;
    case 'model':
      if (a === 'row:schnider') { st.setup.model = 'schnider'; st.screen = 'patient'; }
      else if (a === 'row:eleveld') { st.setup.model = 'eleveld'; st.screen = 'opioid'; }
      else if (a === 'back') st.screen = 'mode';
      return st;
    case 'opioid':
      if (a === 'row:yes' || a === 'row:no') { st.setup.opioid = a === 'row:yes'; st.screen = 'patient'; }
      else if (a === 'back') st.screen = 'model';
      return st;
    case 'patient': {
      if (a.startsWith('preset:')) {
        const p = presetById(a.slice(7));
        if (p) { st.setup.patient = { ...p.patient }; st.setup.presetId = p.id; st.screen = 'summary'; }
      } else if (a === 'row:custom') { st.custom = { field: 0, sex: st.setup.patient.sex, values: ['', '', ''] }; st.buffer = ''; st.screen = 'custom'; }
      else if (a === 'back') st.screen = st.setup.model === 'eleveld' ? 'opioid' : 'model';
      return st;
    }
    case 'custom': {
      const c = st.custom;
      if (a === 'sex:M' || a === 'sex:F') { c.sex = a.slice(4) as 'M' | 'F'; return st; }
      if (a.startsWith('key:')) { keypad(st, a.slice(4), 5); return st; }
      if (a === 'back') {
        if (c.field === 0) st.screen = 'patient';
        else { c.field = (c.field - 1) as 0 | 1 | 2 | 3; st.buffer = c.field === 0 ? '' : c.values[c.field - 1]; }
        return st;
      }
      if (a === 'ok') {
        if (c.field === 0) { if (!c.sex) { say(st, 'Choose sex'); st.beeps++; return st; } c.field = 1; st.buffer = c.values[0]; return st; }
        const v = parseBuffer(st.buffer);
        const lim: [number, number][] = [[1, 120], [100, 230], [20, 250]];
        const [lo, hi] = lim[c.field - 1];
        if (!(v >= lo && v <= hi)) { say(st, `Enter ${lo} to ${hi}`); st.beeps++; return st; }
        c.values[c.field - 1] = String(v);
        if (c.field < 3) { c.field = (c.field + 1) as 1 | 2 | 3; st.buffer = c.values[c.field - 1]; return st; }
        st.setup.patient = { sex: c.sex!, age: +c.values[0], height: +c.values[1], weight: +c.values[2] };
        st.setup.presetId = null;
        st.screen = 'summary';
      }
      return st;
    }
    case 'summary': {
      const sm = summaryFor(st.setup, st.settings);
      if (a === 'ok') { if (sm.refused) { st.beeps++; return st; } st.buffer = ''; st.confirmHigh = false; st.screen = 'target'; }
      else if (a === 'back') st.screen = 'patient';
      return st;
    }
    case 'target':
      if (a.startsWith('key:')) keypad(st, a.slice(4), 3);
      else if (a === 'ok') acceptTarget(st, 'ready');
      else if (a === 'back') st.screen = 'summary';
      return st;
    case 'ready':
      if (a === 'start') {
        st.run = startRun(st.setup, st.settings, st.pendingTarget || TARGET_MIN);
        st.screen = 'run'; st.view = 1; st.alarm = 'none'; st.message = null;
      } else if (a === 'back') { st.buffer = String(st.pendingTarget || ''); st.screen = 'target'; }
      return st;
    case 'run':
      if (!st.run) return st;
      if (a === 'view') st.view = (st.view === 3 ? 1 : st.view + 1) as View;
      else if (a === 'ack' && st.alarm === 'prealarm') { st.alarm = 'none'; st.run.prealarmAck = true; } // OK on the band acknowledges it without pausing (inferred)
      else if (a === 'target') { st.buffer = String(st.run.target); st.confirmHigh = false; st.screen = 'changeTarget'; }
      else if (a === 'start' && st.run.paused && !st.run.empty) { st.run.paused = false; st.run.nextUpdate = st.run.t; st.run.inBolus = false; }
      return st;
    case 'changeTarget':
      if (a.startsWith('key:')) keypad(st, a.slice(4), 3);
      else if (a === 'ok') acceptTarget(st, 'run');
      else if (a === 'back') { st.screen = 'run'; st.message = null; }
      return st;
    case 'empty':
      if (!st.run) return st;
      if (a === 'replace') { st.run.remainingMl = st.settings.syringeMl; st.run.empty = false; st.run.paused = true; st.run.prealarmed = false; st.run.prealarmAck = false; st.run.inBolus = false; st.run.syringes++; st.alarm = 'none'; st.screen = 'run'; st.run.nextUpdate = st.run.t; }
      return st;
  }
  return st;
}

/** Advance real time by `wallDt` seconds and simulated time by `simDt` seconds. */
export function tick(st: PumpState, wallDt: number, simDt: number): void {
  st.wall += wallDt;
  if (st.message && st.wall > st.messageUntil) st.message = null;
  if (st.screen === 'selftest' && st.wall >= st.selfTestEnd) st.screen = 'syringe';
  if (st.run && simDt > 0) advanceRun(st, simDt);
}

/** Teaching panel: load a scenario (patient and model) and jump to the summary screen. */
export function loadScenario(st: PumpState, presetId: string, model: ModelChoice, opioid = true, conc: 10 | 20 = 10): void {
  const p = presetById(presetId);
  if (!p) return;
  if (st.screen === 'off') { act(st, 'power'); st.wall = st.selfTestEnd; tick(st, 0, 0); }
  if (st.screen === 'selftest') { st.wall = st.selfTestEnd; tick(st, 0, 0); }
  st.run = null; st.alarm = 'none'; st.message = null;
  st.setup = { conc, model, opioid, patient: { ...p.patient }, presetId: p.id };
  st.screen = 'summary';
}

/** Plain-English line for the teaching panel. */
export function nowLine(st: PumpState): string {
  const r = st.run;
  switch (st.screen) {
    case 'off': return 'The pump is off. Press the On/Off key.';
    case 'selftest': return 'Self-test: the pump checks its motor, sensors and alarm sounder.';
    case 'syringe': return 'The clamp has recognised a 50 mL syringe. Confirm it.';
    case 'drug': return 'Drug library: choose the propofol concentration in the syringe. The pump will dose in mg.';
    case 'mode': return 'Application mode: Standard runs a plain mL/h rate; TCI lets the model choose the rate for a target concentration.';
    case 'standard': return 'Standard mode is not part of this emulator.';
    case 'model': return 'Schnider (fixed V1, James LBM) or Eleveld (general-purpose, sex, age, height, weight).';
    case 'opioid': return 'Eleveld asks whether an opioid is given: with one, clearance and V3 fall with age, so the pump gives less drug.';
    case 'patient': return 'Pick a teaching patient or enter your own. The covariates set every rate constant.';
    case 'custom': return 'Entering patient data on the pump keypad.';
    case 'summary': {
      const sm = summaryFor(st.setup, st.settings);
      return sm.refused ? 'Schnider is refused: James LBM has passed its peak for this height, and clearance would fall as weight rises.'
        : `Patient accepted. BMI ${sm.bmi.toFixed(1)}; the model will use ${st.setup.model === 'schnider' ? 'James LBM' : 'Al-Sallami FFM'} ${(st.setup.model === 'schnider' ? sm.lbm : sm.ffm).toFixed(1)} kg.`;
    }
    case 'target': return 'Enter the effect-site target (0.5 to 8 µg/mL, 0.1 steps). Above 6 the pump asks you to confirm.';
    case 'ready': return 'The pump shows the induction bolus it will give: the dose whose peak Ce equals the target, at the maximum rate (then held at the plasma limit).';
    case 'confirmOff': return 'Switching off ends the case; the pump asks you to confirm.';
    case 'empty': return 'Syringe empty: the pump has stopped. The model keeps running, so Ce is falling. Replace the syringe and press START.';
  }
  if (!r) return '';
  if (r.paused) return `Paused: no drug is running. Ce ${ce(r).toFixed(2)} and falling. START resumes TCI, with a catch-up bolus if Ce has dropped.`;
  const conc = st.setup.conc;
  if (r.inInduction) return `Induction: ${(r.inductionGivenMg / conc).toFixed(1)} of ${(r.plannedBolusMg / conc).toFixed(1)} mL${r.rateMgMin >= r.rMax * 0.999 ? ' at the maximum rate' : ' holding Cp at the 400% plasma limit'}. Cp overshoots (up to 4 x target) so that Ce peaks exactly at the target.`;
  if (r.inBolus) return `New bolus ${(r.bolusGivenMg / conc).toFixed(1)} of ${(r.bolusPlannedMg / conc).toFixed(1)} mL${r.rateMgMin >= r.rMax * 0.999 ? ' at the maximum rate' : ' holding Cp at the 400% plasma limit'}: the target was raised or Ce had fallen, so the pump loads the effect site again.`;
  if (r.waitingToFall) { const t = timeToTarget(st); return `Target lowered: rate 0 until the predicted Ce falls to ${r.target.toFixed(1)}${t != null && t > 0 ? ` (about ${t.toFixed(1)} min)` : ''}.`; }
  if (r.rateMgMin === 0 && ce(r) < r.target * 0.99) { const t = timeToTarget(st); return `Bolus complete: rate 0 while Ce (${ce(r).toFixed(2)}) rises to its peak at the target${t != null && t > 0 ? ` in about ${t.toFixed(1)} min` : ''}. Maintenance starts at the peak.`; }
  if (ce(r) < r.target * 0.95) return `Rate ${rateMlH(r, conc).toFixed(1)} mL/h: Ce ${ce(r).toFixed(2)} rising to the target.`;
  return `Maintenance: the rate falls as the peripheral compartments fill (${rateMlH(r, st.setup.conc).toFixed(1)} mL/h now). Ce held at ${r.target.toFixed(1)}.`;
}

export { PRESETS };
export type { Warning, Patient };
