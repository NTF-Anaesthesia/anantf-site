// Syringe pumps and target-controlled infusion (MODEL.md section 2, "The pump is not the patient"). Each pump keeps its
// own predicted model (Schnider, Marsh or Minto with no between-patient variation), stepped with the same dt and the
// rate it delivered, so the prediction and the patient's true level differ as they do in theatre. pk.js reads
// pump[drug].rate as an infusion into the patient.
//
// Controller [D]: every 10 s choose the rate for the next 10 s, clamped to [0, maximum], by superposition (the free
// course with no drug added plus the course of a unit-rate 10 s infusion):
// - plasma mode: the rate that brings predicted plasma to the target at the end of the 10 s;
// - effect-site mode, in two phases: while loading (in the manner of Shafer & Gregg 1992) the rate whose predicted
//   effect-site peak reaches the target, none while the effect site is already heading there; once the predicted
//   effect site has reached the target (where plasma and effect site are equal), hold the plasma at the target, which
//   keeps the effect site there with a smooth rate. Peak-targeting alone alternates between bursts and zero.
// A raised target loads again; a lower one stops the pump until the prediction falls to it, then holds (a pump cannot
// take drug out).

import { MODELS, rates, advance, empty } from './pk.js';
import { DRUGS } from './drugs.js';

export const UPDATE = 10;        // s between rate decisions [D] (prototype: 10 s and 1 s gave the same course)
const HORIZON = 600;             // s looked ahead for the effect-site peak
const PDT = 1;                   // s step of the controller's look-ahead
export const PUMP_MODELS = {     // drug -> models a trainee can pick, the first is the default [D]
  propofol: ['schnider', 'marsh', 'marsh026'],
  remifentanil: ['minto'],
};
// syringe concentration (drug amount per mL) and maximum rate (mL/h) [D: confirm with NUH pumps]
export const SYRINGE = { propofol: { perMl: 10, maxMlH: 1200 }, remifentanil: { perMl: 50, maxMlH: 1200 } };

function modelRates(model, patient) {
  const m = model === 'marsh' ? MODELS.marsh(patient, 1.2) : model === 'marsh026' ? MODELS.marsh(patient, 0.26) : MODELS[model](patient);
  return rates(m); // no patient multipliers: the pump only knows the published model
}

// free course and unit-rate response over the horizon, both starting from the current prediction
function courses(k, s, seconds) {
  const n = Math.round(seconds / PDT), free = new Array(n), unit = new Array(n);
  let f = s, u = empty(k);
  for (let i = 0; i < n; i++) {
    f = advance(k, f, 0, PDT / 60);
    u = advance(k, u, i * PDT < UPDATE ? 1 : 0, PDT / 60);
    free[i] = f; unit[i] = u;
  }
  return { free, unit };
}

// the rate (amount/min) for the next UPDATE seconds. phase (effect mode): 'load' or 'hold'
export function chooseRate(k, s, mode, target, max, phase = 'load') {
  if (!(target > 0)) return 0;
  if (mode === 'plasma' || phase === 'hold') {
    const { free, unit } = courses(k, s, UPDATE), i = free.length - 1;
    const r = (target * k.V1 - free[i].a1) / unit[i].a1;
    return r < 0 ? 0 : r > max ? max : r;
  }
  const { free, unit } = courses(k, s, HORIZON);
  const peakAt = r => { let m = 0; for (let i = 0; i < free.length; i++) { const c = free[i].ce + r * unit[i].ce; if (c > m) m = c; } return m; };
  if (peakAt(0) >= target) return 0;
  if (peakAt(max) <= target) return max;
  let lo = 0, hi = max;
  for (let it = 0; it < 40; it++) { const mid = (lo + hi) / 2; if (peakAt(mid) < target) lo = mid; else hi = mid; }
  return lo;
}

export const pump = {
  name: 'pump',
  init() { return {}; },
  step(prev, ctx) {
    const pumps = prev.pump, p = prev.patient, t = ctx.t, dtMin = ctx.dt / 60;
    let out = null;
    const set = (id, v) => { if (!out) out = { ...pumps }; out[id] = v; };
    for (const a of ctx.actions) {
      if (a.type !== 'tci' || !SYRINGE[a.drug]) continue;
      const cur = (out && out[a.drug]) || pumps[a.drug];
      if (a.stop) { if (cur) set(a.drug, { ...cur, target: 0, rate: 0, next: t }); continue; }
      const model = PUMP_MODELS[a.drug].includes(a.model) ? a.model : (cur ? cur.model : PUMP_MODELS[a.drug][0]);
      // a running pump keeps its model: its prediction is built on it (real pumps lock the model too)
      const keep = cur && cur.model !== model ? cur.model : model;
      const mode = a.mode === 'plasma' ? 'plasma' : 'effect';
      const k = cur && cur.model === keep ? cur.k : modelRates(keep, p);
      const syr = SYRINGE[a.drug];
      set(a.drug, {
        model: keep, mode, target: Math.max(0, +a.target || 0), k,
        max: (syr.maxMlH / 60) * syr.perMl, perMl: syr.perMl,
        pred: cur ? cur.pred : empty(k), rate: cur ? cur.rate : 0, given: cur ? cur.given : 0,
        next: t, // decide at once
        // a raised target (or a new pump) loads; otherwise keep holding
        phase: cur && cur.phase === 'hold' && mode === cur.mode && +a.target <= cur.target ? 'hold' : 'load',
      });
      if (cur && cur.model !== model) ctx.log({ kind: 'note', text: `${DRUGS[a.drug].name} pump keeps the ${cur.model} model` });
    }
    const src = out || pumps;
    for (const id in src) {
      const u = src[id];
      // the prediction follows what the pump delivered over this step
      const pred = advance(u.k, u.pred, u.rate, dtMin);
      let rate = u.rate, next = u.next;
      let phase = u.phase;
      if (u.mode === 'effect' && pred.ce >= u.target * 0.995) phase = 'hold'; // reached (or above, after a lower target)
      if (phase === 'hold' && pred.ce > u.target * 1.005) { rate = 0; next = t; }  // wait for it to fall to the target
      else if (t >= u.next - 1e-9) { rate = chooseRate(u.k, pred, u.mode, u.target, u.max, phase); next = t + UPDATE; }
      set(id, { ...u, pred, rate, next, phase, given: u.given + u.rate * dtMin });
    }
    return out || pumps;
  },
};

// what the pump shows: predicted plasma and effect site, rate in mL/h, volume given in mL
export function pumpView(state, id) {
  const u = state.pump[id];
  if (!u) return null;
  return { model: u.model, mode: u.mode, target: u.target, predCp: u.pred.a1 / u.k.V1, predCe: u.pred.ce, mlH: (u.rate / u.perMl) * 60, ml: u.given / u.perMl };
}
