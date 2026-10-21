// TCI controller: recomputes the infusion rate every update interval to reach and hold a Cp or Ce target.
// Ce mode follows Shafer & Gregg 1992: choose the rate for the next interval so that the predicted PEAK Ce equals
// the target, never exceeding the pump's maximum rate. Cp mode: reach the target at the end of the interval.
import { Modes, PKParams, State, buildModes, ceOf, cpOf, step, zeroState, maximise } from './solver';

export type TargetMode = 'Ce' | 'Cp';

export interface PumpSettings {
  concMgMl: number; // 10 mg/mL (1%) or 20 mg/mL (2%)
  maxRateMlH: number; // pump maximum rate for this syringe
  updateSec: number; // controller update interval
}

export interface TargetChange { t: number; target: number } // t in min

export interface SimResult {
  t: number[]; cp: number[]; ce: number[];
  rateMlH: number[]; // rate in force over [t_i, t_i+1)
  cumMg: number[];
  inductionMg: number; // mg given in the first run at maximum rate
  inductionSec: number;
}

const HORIZON = 12; // min, look-ahead for the Ce peak

function predictedPeak(m: Modes, s: State, r: number, dt: number): number {
  const sAfter = step(m, s, r, dt);
  const f = (t: number) => (t <= dt ? ceOf(m, step(m, s, r, t)) : ceOf(m, step(m, sAfter, 0, t - dt)));
  // Peak over [dt, dt + HORIZON]: the rate chosen now can only shape Ce from the end of this interval on.
  // (Including t < dt made the controller chatter in maintenance, switching between 0 and a high rate.)
  const n = 96;
  const at = (i: number) => dt + (HORIZON * i) / n;
  let best = 0, bv = -Infinity;
  for (let i = 0; i <= n; i++) {
    const v = f(at(i));
    if (v > bv) { bv = v; best = i; }
  }
  if (best === 0) return bv;
  const tt = maximise(f, at(best - 1), at(Math.min(best + 1, n)), 40);
  return Math.max(bv, f(tt));
}

export function rateFor(mode: TargetMode, m: Modes, s: State, target: number, dt: number, rMax: number): number {
  if (target <= 0) return 0;
  // Ce mode, maintenance: once Ce is at the target and would fall without drug, hold Cp at the target.
  // At the Ce peak Cp equals Ce, so the hand-over is seamless; a pure peak-Ce rule here oscillates between steps.
  const ce = ceOf(m, s);
  const ceFalling = ceOf(m, step(m, s, 0, dt)) <= ce;
  const holdCp = mode === 'Ce' && ceFalling && Math.abs(ce - target) <= 0.01 * target;
  if (mode === 'Cp' || holdCp) {
    const free = cpOf(m, step(m, s, 0, dt));
    const unit = cpOf(m, step(m, zeroState(), 1, dt));
    return Math.min(rMax, Math.max(0, (target - free) / unit));
  }
  if (predictedPeak(m, s, 0, dt) >= target) return 0;
  if (predictedPeak(m, s, rMax, dt) <= target) return rMax;
  let lo = 0, hi = rMax;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (predictedPeak(m, s, mid, dt) < target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export function simulate(pk: PKParams, mode: TargetMode, schedule: TargetChange[], pump: PumpSettings, tEnd: number): SimResult {
  const m = buildModes(pk);
  const dt = pump.updateSec / 60;
  const rMax = (pump.maxRateMlH * pump.concMgMl) / 60; // mg/min
  const sched = [...schedule].sort((a, b) => a.t - b.t);
  const out: SimResult = { t: [], cp: [], ce: [], rateMlH: [], cumMg: [], inductionMg: 0, inductionSec: 0 };
  let s = zeroState(), t = 0, cum = 0, inInduction = true;
  const n = Math.round(tEnd / dt);
  for (let i = 0; i <= n; i++) {
    t = i * dt;
    let target = 0;
    for (const c of sched) if (c.t <= t + 1e-9) target = c.target;
    const r = i < n ? rateFor(mode, m, s, target, dt, rMax) : 0;
    out.t.push(t); out.cp.push(cpOf(m, s)); out.ce.push(ceOf(m, s));
    out.rateMlH.push((r * 60) / pump.concMgMl); out.cumMg.push(cum);
    if (inInduction && target > 0) {
      if (r > 0) { out.inductionMg += r * dt; out.inductionSec += pump.updateSec * (r / rMax); }
      if (r < rMax * 0.999) inInduction = false;
    }
    if (i < n) { s = step(m, s, r, dt); cum += r * dt; }
  }
  return out;
}
