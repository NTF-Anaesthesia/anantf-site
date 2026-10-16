// Waveform samples from beat and breath events (DESIGN.md, "Beats, breaths and the waveforms"). UI only: it may use
// Math freely, and the model never reads it.
//
// A source holds sorted beat and breath events on one display clock. At 1x they are the model's own events; at 5x and
// 20x a FastSource makes its own at wall-clock pace from the model's current rate and values, so a heart rate of 70
// still looks like 70 on the screen. The shapes below are our own simple templates (sums of bell curves), drawn to look
// like a lead II ECG, a finger pleth and a capnogram; they carry no diagnostic detail. [D]

const g = (x, c, w) => Math.exp(-((x - c) * (x - c)) / (2 * w * w));

// first index with arr[i].t > t (binary search)
function upper(arr, t) {
  let lo = 0, hi = arr.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].t <= t) lo = mid + 1; else hi = mid; }
  return lo;
}

// ECG lead II in mV around a beat at time 0 (the R peak), by morphology (rhythm.js sets morph on each beat); the T
// and QT stretch a little with the beat-to-beat interval. These are our own simple templates [D]: a normal P-QRS-T,
// a P-less narrow complex, a broad ventricular complex with a discordant T, a paced spike, and the hyperkalaemia
// shapes (peaked T, broad QRS). No diagnostic detail.
function ecgBeat(x, rr, morph) {
  const s = Math.sqrt(Math.min(1.5, Math.max(0.3, rr)));
  const P = (c, ctr) => c * g(x, ctr, 0.022);
  const narrow = -0.08 * g(x, -0.028, 0.007) + 1.05 * g(x, 0, 0.0095) - 0.22 * g(x, 0.026, 0.009);
  const broad = -0.10 * g(x, -0.02, 0.02) + 0.95 * g(x, 0.012, 0.028) - 0.35 * g(x, 0.065, 0.03);
  const T = (c, w, ctr) => c * g(x, ctr * s, w * s);
  switch (morph) {
    case 'sinus-pr':   return P(0.12, -0.27) + narrow + T(0.28, 0.05, 0.24);   // long PR (first-degree block)
    case 'narrow-nop': return narrow + T(0.28, 0.05, 0.24);                     // no P (junctional, AF, flutter, SVT, PEA)
    case 'wide':       return broad + T(-0.45, 0.07, 0.15);                     // ventricular: broad, discordant T
    case 'wide-nop':   return broad + T(0.40, 0.08, 0.17);                      // hyperkalaemia: broad QRS into the T
    case 'paced':      return 1.10 * g(x, -0.02, 0.0025) + broad + T(-0.45, 0.07, 0.15); // pacing spike then broad QRS
    case 'peakedt':    return P(0.12, -0.16) + narrow + T(0.60, 0.028, 0.22);   // hyperkalaemia: tall, peaked T
    default:           return P(0.12, -0.16) + narrow + T(0.28, 0.05, 0.24);    // sinus
  }
}

// the continuous baseline for the disorganised rhythms and the independent P waves (rhythm.js rh.base); drawn under
// the beats. b = { type, since, atrialRate, now } (now and since are model time, for the VF coarse->fine envelope)
function ecgBase(b, t) {
  const TAU = (n, hz, ph = 0) => n * Math.sin(2 * Math.PI * hz * t + ph);
  switch (b.type) {
    case 'af':       return TAU(0.04, 6.3) + TAU(0.025, 9.7, 1.1);               // fine fibrillatory waves
    case 'flutter': { const f = (t * b.atrialRate) / 60; return -0.16 * (2 * (f - Math.floor(f)) - 1); } // sawtooth
    case 'vf': { const env = 0.12 + 0.4 * Math.exp(-Math.max(0, b.now - b.since) / 240); // coarse, fining over minutes
      return env * (Math.sin(2 * Math.PI * 4.3 * t) + 0.7 * Math.sin(2 * Math.PI * 6.9 * t + 0.7) + 0.5 * Math.sin(2 * Math.PI * 9.1 * t + 2)); }
    case 'torsades': return 0.45 * Math.abs(Math.sin(2 * Math.PI * 0.3 * t)) * Math.sin(2 * Math.PI * 4 * t); // twisting
    case 'asystole': return 0.015 * Math.sin(0.5 * t) + 0.01 * Math.sin(0.13 * t); // a faint wander
    case 'sine':     return 0.18 * Math.sin(2 * Math.PI * 0.8 * t);              // hyperkalaemia undulation
    case 'pwave': { const f = (t * b.atrialRate) / 60, frac = f - Math.floor(f); return 0.14 * g(frac < 0.5 ? frac : frac - 1, 0, 0.05); }
    default:         return 0;
  }
}

export function ecg(src, t) {
  let v = src.base ? ecgBase(src.base, t) : 0;
  const b = src.beats, i = upper(b, t + 0.3);
  for (let k = Math.max(0, i - 3); k < i; k++) if (b[k].t < 1e6) v += ecgBeat(t - b[k].t, b[k].rr, b[k].morph);
  return v;
}

// pleth: arrives about 0.25 s after the R wave at the finger; amplitude follows the pulse pressure [D]
const PTT = 0.25;
function plethBeat(x) {
  if (x < 0) return 0;
  const up = x < 0.12 ? g(x, 0.12, 0.05) : Math.exp(-(x - 0.12) / 0.32);
  return up + 0.12 * g(x, 0.36, 0.04) * Math.exp(-x / 0.6);
}
export function pleth(src, t) {
  const b = src.beats, i = upper(b, t - PTT);
  let v = 0;
  for (let k = Math.max(0, i - 4); k < i; k++) {
    const pp = Math.max(0, b[k].sbp - b[k].dbp);
    v += plethBeat(t - PTT - b[k].t) * Math.min(1.3, pp / 45);
  }
  return v;
}

// capnogram, mmHg: a breath event starts inspiration (CO2 falls to zero), expiration starts after ti: a steep
// upstroke, then a plateau rising slowly to the end-tidal value
export function co2(src, t) {
  const br = src.breaths, i = upper(br, t) - 1;
  if (i < 0) return 0;
  const b = br[i], x = t - b.t;
  if (x < b.ti) {
    const prevEt = i > 0 ? br[i - 1].etco2 : b.etco2;
    return prevEt * Math.exp(-x / 0.06);
  }
  const e = x - b.ti, exp = Math.max(0.5, b.cycle - b.ti);
  const up = 1 / (1 + Math.exp(-(e - 0.18) / 0.04));
  return b.etco2 * up * (0.9 + 0.1 * Math.min(1, e / exp));
}

// --- event sources ------------------------------------------------------------------------------------------------

// the model's events (1x): the ring plus the events the model already knows are next (exact times kept in state)
export function modelSource(state) {
  const beats = [], breaths = [];
  for (const e of state.ev.ring) (e.kind === 'beat' ? beats : e.kind === 'breath' ? breaths : []).push(e);
  const c = state.cv, rh = state.rh;
  beats.push({ t: rh.next, rr: c.hp, morph: rh.qrs, sbp: c.sbp, dbp: c.dbp });
  const r = state.resp;
  if (r.rr > 0) breaths.push({ t: r.nextBreath, cycle: r.cycle, ti: r.mech ? r.mech.ti : r.cycle / 3, etco2: state.gas.etco2 });
  return { beats, breaths, base: rhythmBase(state) };
}

// the continuous-baseline descriptor for the renderer (rhythm.js rh.base), or null when the rhythm has none
function rhythmBase(state) {
  const rh = state.rh;
  return rh && rh.base ? { type: rh.base, since: rh.since, atrialRate: rh.atrialRate, now: state.t } : null;
}

// small seeded generator for the fast-mode beat jitter (UI only)
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// fast mode (5x, 20x): events at real pace on the display clock, starting from the model's history at the switch
export class FastSource {
  constructor(state, t0, seed = 1) {
    const m = modelSource(state);
    this.beats = m.beats.filter(e => e.t <= t0);
    this.breaths = m.breaths.filter(e => e.t <= t0);
    this.base = m.base;
    this.rand = mulberry32(seed);
    this.nextBeat = Math.max(t0, m.beats[m.beats.length - 1].t);
    this.nextBreath = Math.max(t0, m.breaths[m.breaths.length - 1].t);
  }
  // make events up to display time t + lookahead, from the model's current values and rhythm
  advance(state, t) {
    const c = state.cv, rh = state.rh, until = t + 0.4;
    this.base = rhythmBase(state);
    const none = rh && rh.clock === 'none';        // VF, torsades, asystole: no discrete beats
    const morph = rh ? rh.qrs : 'sinus';
    const period = () => (rh && rh.rate && rh.clock !== 'sinus' ? 60 / rh.rate : c.hp);
    if (none) this.nextBeat = Math.max(this.nextBeat, until);
    while (!none && this.nextBeat <= until) {
      const rr = period() * (1 + 0.02 * (this.rand() - 0.5));
      this.beats.push({ t: this.nextBeat, rr, morph, sbp: c.sbp, dbp: c.dbp });
      this.nextBeat += rr;
    }
    const r = state.resp;
    if (!(r.rr > 0)) this.nextBreath = Math.max(this.nextBreath, until); // apnoea: no breaths
    while (r.rr > 0 && this.nextBreath <= until) {
      const cycle = 60 / r.rr;
      this.breaths.push({ t: this.nextBreath, cycle, ti: r.mech ? r.mech.ti : cycle / 3, etco2: state.gas.etco2 });
      this.nextBreath += cycle;
    }
    // keep about a minute of history (more than any lane shows)
    if (this.beats.length > 400) this.beats.splice(0, this.beats.length - 300);
    if (this.breaths.length > 100) this.breaths.splice(0, this.breaths.length - 60);
  }
}
