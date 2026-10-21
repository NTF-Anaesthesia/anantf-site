// TCI controller: recomputes the infusion rate every update interval to reach and hold a Cp or Ce target.
// Ce mode follows Shafer & Gregg 1992: choose the rate for the next interval so that the predicted PEAK Ce equals
// the target, never exceeding the pump's maximum rate. Cp mode: reach the target at the end of the interval.
// Optional plasma overshoot limit (Ce mode): predicted Cp never exceeds cpMaxRatio x target. The department's
// Space plus is set to 400% (cpMaxRatio 4), observed 21 Oct 2026: with the cap the induction runs at the maximum
// rate until Cp reaches the cap, then holds Cp at the cap until the predicted Ce peak reaches the target.
import { Modes, PKParams, State, buildModes, ceOf, cpOf, step, zeroState, maximise } from './solver';

export type TargetMode = 'Ce' | 'Cp';

export interface PumpSettings {
  concMgMl: number; // 10 mg/mL (1%) or 20 mg/mL (2%)
  maxRateMlH: number; // pump maximum rate for this syringe
  updateSec: number; // controller update interval
  cpMaxRatio?: number; // Ce mode: plasma overshoot limit as a multiple of the target (4 = 400%); none if omitted
}

/** Why the controller chose this rate: induction (bolus phase, at max rate or the plasma cap), maintenance, or waiting. */
export type RateKind = 'off' | 'induction' | 'maintenance' | 'wait';

export interface TargetChange { t: number; target: number } // t in min

export interface SimResult {
  t: number[]; cp: number[]; ce: number[];
  rateMlH: number[]; // rate in force over [t_i, t_i+1)
  cumMg: number[];
  inductionMg: number; // mg given from the start until the induction phase ends (pump stops or holds)
  inductionSec: number; // duration of the induction phase (s)
  kind: RateKind[]; // controller state for each interval
  capped: boolean[]; // interval rate chosen by the plasma overshoot cap (predicted Cp reaches cpMax at its end)
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

/** The controller's choice for one interval. `capped` is true only when the rate was set by the plasma overshoot
 *  limit (rCap below rMax, so the predicted Cp reaches cpMax at the end of the interval): a partial top-up interval
 *  in the bisection below is not capped, Cp stays under the limit. */
export function rateDetail(mode: TargetMode, m: Modes, s: State, target: number, dt: number, rMax: number, cpMax?: number): { r: number; kind: RateKind; capped: boolean } {
  if (target <= 0) return { r: 0, kind: 'off', capped: false };
  // Ce mode, maintenance: once Ce is at the target and would fall without drug, hold Cp at the target.
  // At the Ce peak Cp equals Ce, so the hand-over is seamless; a pure peak-Ce rule here oscillates between steps.
  const ce = ceOf(m, s);
  const ceFalling = ceOf(m, step(m, s, 0, dt)) <= ce;
  const holdCp = mode === 'Ce' && ceFalling && Math.abs(ce - target) <= 0.01 * target;
  const cpFree = cpOf(m, step(m, s, 0, dt));
  const cpUnit = cpOf(m, step(m, zeroState(), 1, dt));
  const toCp = (c: number) => Math.min(rMax, Math.max(0, (c - cpFree) / cpUnit));
  if (mode === 'Cp' || holdCp) {
    const r = toCp(target);
    return { r, kind: r > 0 || cpFree <= target ? 'maintenance' : 'wait', capped: false };
  }
  if (predictedPeak(m, s, 0, dt) >= target) return { r: 0, kind: 'wait', capped: false };
  // plasma overshoot limit: the most this interval may give without Cp exceeding the cap at its end
  const rCap = cpMax !== undefined ? toCp(cpMax) : rMax;
  if (predictedPeak(m, s, rCap, dt) <= target) return { r: rCap, kind: 'induction', capped: rCap < rMax - 1e-9 };
  let lo = 0, hi = rCap;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (predictedPeak(m, s, mid, dt) < target) lo = mid; else hi = mid;
  }
  return { r: (lo + hi) / 2, kind: 'induction', capped: false };
}

export function rateFor(mode: TargetMode, m: Modes, s: State, target: number, dt: number, rMax: number, cpMax?: number): number {
  return rateDetail(mode, m, s, target, dt, rMax, cpMax).r;
}

export function simulate(pk: PKParams, mode: TargetMode, schedule: TargetChange[], pump: PumpSettings, tEnd: number,
  opts: { stopAfterInduction?: boolean } = {}): SimResult {
  const m = buildModes(pk);
  const dt = pump.updateSec / 60;
  const rMax = (pump.maxRateMlH * pump.concMgMl) / 60; // mg/min
  const sched = [...schedule].sort((a, b) => a.t - b.t);
  const out: SimResult = { t: [], cp: [], ce: [], rateMlH: [], cumMg: [], inductionMg: 0, inductionSec: 0, kind: [], capped: [] };
  let s = zeroState(), t = 0, cum = 0, inInduction = true;
  const n = Math.round(tEnd / dt);
  for (let i = 0; i <= n; i++) {
    t = i * dt;
    let target = 0;
    for (const c of sched) if (c.t <= t + 1e-9) target = c.target;
    const cpMax = mode === 'Ce' && pump.cpMaxRatio ? pump.cpMaxRatio * target : undefined;
    const d = i < n ? rateDetail(mode, m, s, target, dt, rMax, cpMax) : { r: 0, kind: 'off' as RateKind, capped: false };
    const r = d.r;
    out.t.push(t); out.cp.push(cpOf(m, s)); out.ce.push(ceOf(m, s));
    out.rateMlH.push((r * 60) / pump.concMgMl); out.cumMg.push(cum); out.kind.push(d.kind); out.capped.push(d.capped);
    if (inInduction && target > 0) {
      if (d.kind === 'induction') { out.inductionMg += r * dt; out.inductionSec += pump.updateSec; }
      else inInduction = false;
    }
    if (opts.stopAfterInduction && !inInduction) break;
    if (i < n) { s = step(m, s, r, dt); cum += r * dt; }
  }
  return out;
}

/** The pump's induction dose for a Ce target: drug given until it first stops or switches to maintenance.
 *  `capped`: some interval was held at the plasma overshoot limit (Cp reached cpMax); a slower final top-up interval
 *  alone does not count. `tPeakMin`: when Ce peaks in the same stepped run (refined between the update grid points). */
export function pumpInduction(pk: PKParams, target: number, pump: PumpSettings): { mg: number; sec: number; capped: boolean; tPeakMin: number } {
  const r = simulate(pk, 'Ce', [{ t: 0, target }], pump, 20);
  const n = r.kind.findIndex((k) => k !== 'induction');
  const ind = n < 0 ? r.kind.length : n;
  const capped = r.capped.slice(0, ind).some(Boolean);
  let best = 0;
  for (let i = 1; i < r.ce.length; i++) if (r.ce[i] > r.ce[best]) best = i;
  let tPeakMin = r.t[best];
  if (best > 0 && best < r.ce.length - 1) { // parabolic refinement between the grid points
    const y0 = r.ce[best - 1], y1 = r.ce[best], y2 = r.ce[best + 1], den = y0 - 2 * y1 + y2;
    if (den < 0) tPeakMin += (0.5 * (y0 - y2) / den) * (r.t[best] - r.t[best - 1]);
  }
  return { mg: r.inductionMg, sec: r.inductionSec, capped, tPeakMin };
}

/** Target on model B whose pump induction dose equals model A's at targetA (same pump settings). */
export function matchTargetPump(pkA: PKParams, targetA: number, pkB: PKParams, pump: PumpSettings): number {
  const dA = pumpInduction(pkA, targetA, pump).mg;
  let lo = 0.05, hi = 40;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (pumpInduction(pkB, mid, pump).mg < dA) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
