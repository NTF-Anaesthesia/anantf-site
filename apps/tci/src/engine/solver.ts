// Exact solver for a 3-compartment mammillary model with an effect site.
// Method: analytic poly-exponential (residues of the Laplace transfer functions). Each exponential mode i
// carries one state s_i with s_i' = -lambda_i s_i + u, which is integrated exactly for piecewise-constant u.
// Concentrations and amounts are fixed linear combinations of the mode states. No DOM.

export interface PKParams {
  v1: number; v2: number; v3: number; // L
  cl1: number; cl2: number; cl3: number; // L/min
  ke0: number; // /min
}

export interface Modes {
  lam: [number, number, number, number]; // lambda1..3 (disposition), lambda4 = ke0
  cp: number[]; // Cp = sum cp[i] * s[i], mg/L per mg
  ce: number[]; // Ce = sum ce[i] * s[i]
  a1: number[]; a2: number[]; a3: number[]; // compartment amounts (mg) per mode
}

export type State = [number, number, number, number];
export const zeroState = (): State => [0, 0, 0, 0];

function cubicRoots(a2: number, a1: number, a0: number): [number, number, number] {
  // Roots of x^3 - a2 x^2 + a1 x - a0 = 0 (three real positive roots for a mammillary model).
  const p = a1 - (a2 * a2) / 3;
  const q = (-2 * a2 ** 3) / 27 + (a2 * a1) / 3 - a0;
  const r = Math.sqrt(-(p * p * p) / 27);
  const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r)))) / 3;
  const m = 2 * Math.cbrt(r);
  const roots = [0, 1, 2].map((k) => m * Math.cos(phi + (2 * Math.PI * k) / 3) + a2 / 3);
  roots.sort((x, y) => y - x);
  return roots as [number, number, number];
}

export function buildModes(pk: PKParams): Modes {
  const k10 = pk.cl1 / pk.v1, k12 = pk.cl2 / pk.v1, k13 = pk.cl3 / pk.v1;
  const k21 = pk.cl2 / pk.v2, k31 = pk.cl3 / pk.v3;
  const a2 = k10 + k12 + k13 + k21 + k31;
  const a1 = k10 * k31 + k21 * k31 + k21 * k13 + k10 * k21 + k31 * k12;
  const a0 = k10 * k21 * k31;
  const L = cubicRoots(a2, a1, a0);
  // Guard the degenerate case ke0 == lambda_i (residue formula divides by ke0 - lambda_i).
  let ke0 = pk.ke0;
  for (const l of L) if (Math.abs(ke0 - l) < 1e-9 * Math.max(1, l)) ke0 *= 1 + 1e-7;
  const a1c: number[] = [], a2c: number[] = [], a3c: number[] = [], cp: number[] = [], ce: number[] = [];
  for (let i = 0; i < 3; i++) {
    const li = L[i];
    let den = 1;
    for (let j = 0; j < 3; j++) if (j !== i) den *= L[j] - li;
    a1c.push(((k21 - li) * (k31 - li)) / den);
    a2c.push((k12 * (k31 - li)) / den);
    a3c.push((k13 * (k21 - li)) / den);
    cp.push(a1c[i] / pk.v1);
    ce.push(((a1c[i] / pk.v1) * ke0) / (ke0 - li));
  }
  ce.push(-(ce[0] + ce[1] + ce[2]));
  for (const arr of [a1c, a2c, a3c, cp]) arr.push(0);
  return { lam: [L[0], L[1], L[2], ke0], cp, ce, a1: a1c, a2: a2c, a3: a3c };
}

/** Advance the state by dt minutes with constant input u (mg/min). Exact. */
export function step(m: Modes, s: State, u: number, dt: number): State {
  const out = zeroState();
  for (let i = 0; i < 4; i++) {
    const l = m.lam[i];
    const e = Math.exp(-l * dt);
    out[i] = s[i] * e + (u * (1 - e)) / l;
  }
  return out;
}

/** Add an instantaneous bolus (mg). */
export function bolus(s: State, dose: number): State {
  return [s[0] + dose, s[1] + dose, s[2] + dose, s[3] + dose];
}

const dot = (c: number[], s: State) => c[0] * s[0] + c[1] * s[1] + c[2] * s[2] + c[3] * s[3];
export const cpOf = (m: Modes, s: State) => dot(m.cp, s);
export const ceOf = (m: Modes, s: State) => dot(m.ce, s);
export const amounts = (m: Modes, s: State) => [dot(m.a1, s), dot(m.a2, s), dot(m.a3, s)] as const;

/** Ce at time t after a dose given at constant rate over `dur` minutes (dur 0 = instantaneous), from zero. */
export function ceAfterDose(m: Modes, dose: number, dur: number, t: number): number {
  if (dur <= 0) return ceOf(m, step(m, bolus(zeroState(), dose), 0, t));
  if (t <= dur) return ceOf(m, step(m, zeroState(), dose / dur, t));
  return ceOf(m, step(m, step(m, zeroState(), dose / dur, dur), 0, t - dur));
}

/** Golden-section maximiser of f on [a, b]. */
export function maximise(f: (t: number) => number, a: number, b: number, iters = 90): number {
  const g = (Math.sqrt(5) - 1) / 2;
  let c = b - g * (b - a), d = a + g * (b - a), fc = f(c), fd = f(d);
  for (let k = 0; k < iters; k++) {
    if (fc > fd) { b = d; d = c; fd = fc; c = b - g * (b - a); fc = f(c); }
    else { a = c; c = d; fc = fd; d = a + g * (b - a); fd = f(d); }
  }
  return (a + b) / 2;
}

/** Peak of a unimodal-after-onset curve: coarse scan, then golden section around the best sample. */
export function peakOf(f: (t: number) => number, tMax = 30, n = 600): { t: number; v: number } {
  let best = 0, bv = -Infinity;
  for (let i = 1; i <= n; i++) {
    const t = (tMax * i) / n;
    const v = f(t);
    if (v > bv) { bv = v; best = i; }
  }
  const t = maximise(f, (tMax * (best - 1)) / n, (tMax * Math.min(best + 1, n)) / n);
  return { t, v: f(t) };
}

export function peakCe(m: Modes, dose: number, dur = 0) {
  return peakOf((t) => ceAfterDose(m, dose, dur, t));
}

/**
 * Effect-site targeted induction bolus (Shafer & Gregg 1992): the dose whose PEAK Ce equals the target.
 * Linear in dose, so a unit bolus is scaled. With a rate limit (mg/min) the duration depends on the dose: iterate.
 */
export function ceBolus(pk: PKParams | Modes, target: number, rateMgMin?: number) {
  const m = 'lam' in pk ? pk : buildModes(pk);
  let dose = target / peakCe(m, 1, 0).v;
  if (rateMgMin && rateMgMin > 0) {
    for (let k = 0; k < 60; k++) {
      const next = target / peakCe(m, 1, dose / rateMgMin).v;
      if (Math.abs(next - dose) < 1e-10) { dose = next; break; }
      dose = next;
    }
  }
  const dur = rateMgMin ? dose / rateMgMin : 0;
  const pkk = peakCe(m, dose, dur);
  return { dose, tPeak: pkk.t, duration: dur };
}

/** Plasma-targeted bolus: fills V1 to target. */
export const cpBolus = (pk: PKParams, target: number) => pk.v1 * target;

/** Target on model B whose induction bolus equals model A's bolus at targetA. */
export function matchTarget(pkA: PKParams, targetA: number, pkB: PKParams, rateMgMin?: number): number {
  const dA = ceBolus(pkA, targetA, rateMgMin).dose;
  if (!rateMgMin) return dA / ceBolus(pkB, 1).dose;
  const mB = buildModes(pkB);
  let lo = 0.05, hi = 60;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (ceBolus(mB, mid, rateMgMin).dose < dA) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export interface Curve { t: number[]; cp: number[]; ce: number[] }

/** Cp and Ce after one dose (mg) given over `dur` minutes, sampled every dt to tEnd. */
export function doseCurve(pk: PKParams, dose: number, dur: number, tEnd = 20, dt = 1 / 12): Curve {
  const m = buildModes(pk);
  const out: Curve = { t: [], cp: [], ce: [] };
  let s = dur > 0 ? zeroState() : bolus(zeroState(), dose);
  let t = 0;
  out.t.push(0); out.cp.push(cpOf(m, s)); out.ce.push(ceOf(m, s));
  while (t < tEnd - 1e-12) {
    let h = dt;
    if (dur > 0 && t < dur && t + h > dur) h = dur - t;
    const u = dur > 0 && t < dur - 1e-12 ? dose / dur : 0;
    s = step(m, s, u, h);
    t += h;
    out.t.push(t); out.cp.push(cpOf(m, s)); out.ce.push(ceOf(m, s));
  }
  return out;
}
