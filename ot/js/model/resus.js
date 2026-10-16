// Resuscitation (MODEL.md section 13): chest compressions, defibrillation, transcutaneous pacing and return of
// circulation. This system owns the arrest "devices" and the decisions; the circulation (cardio.js) reads
// `resus.cprFrac` as its output during a non-perfusing rhythm, and the rhythm (rhythm.js) reads `resus.convert`
// (a successful shock → an organised rhythm) and `resus.pacing.capturing` (pacing captures → a paced rhythm). All [D]
// unless stated, calibrated to the CPR targets in MODEL.md section 8.
//
// Actions:
//   { type: 'cpr', on, quality }    quality 'poor' | 'good' | 'excellent' (start/stop compressions)
//   { type: 'defib', joules }       deliver a shock (only a shockable rhythm can convert)
//   { type: 'pace', on, mA }        transcutaneous pacing at mA milliamps
//   { type: 'amiodarone' }          mark amiodarone given (raises shock success after repeated shocks; the drug
//                                   itself arrives with the scenario drugs, M4.0)

// fraction of a normal cardiac output that compressions produce, by quality (MODEL.md section 8): poor ~0.1, typical
// ~0.2-0.25, excellent ~0.3-0.35 [D]
export const CPR_QUAL = { poor: 0.10, good: 0.23, excellent: 0.33 };
const BUILD_ON = 25, BUILD_OFF = 8;   // s: coronary-perfusion build-up while compressing, decay on a pause
const SHOCKABLE = new Set(['vf', 'vt', 'torsades']);

// probability a shock converts a shockable rhythm (MODEL.md section 13): high in the first minute of VF, falling a few
// percent a minute; better with good perfusion (a built-up CPR) before the shock; amiodarone helps after repeated
// shocks. A pure function so a test can read the curve. [D, U for the shape]
export function shockSuccess(rh, resus, tNow) {
  if (!rh || !SHOCKABLE.has(rh.rhythm)) return 0;
  const tVF = Math.max(0, (tNow - rh.since) / 60);                 // minutes in the arrhythmia
  const base = Math.max(0.15, 0.9 - 0.09 * tVF);                   // first-minute ~0.9, falling ~9%/min
  const perf = 0.55 + 0.45 * (resus ? resus.buildup : 0);          // perfusion before the shock
  const amio = resus && resus.amio && resus.defib.shocks >= 3 ? 1.25 : 1;
  return Math.min(0.97, base * perf * amio);
}

export const resus = {
  name: 'resus',
  init(state) {
    return {
      cpr: false, quality: 'good', buildup: 0, cprFrac: 0, amio: false,
      defib: { charge: 200, shocks: 0, lastOutcome: '', lastT: -999 },
      pace: { on: false, mA: 0, threshold: state.patient ? state.patient.paceThresh : 70, capturing: false },
      convert: null, // a rhythm id for rhythm.js to switch to this step (successful shock); one-step pulse
    };
  },
  step(prev, ctx) {
    const r = prev.resus, dt = ctx.dt;
    let { cpr, quality, buildup, amio } = r;
    let defib = r.defib, pace = r.pace, convert = null;
    const rh = prev.rh;

    for (const a of ctx.actions) {
      if (a.type === 'cpr') { cpr = !!a.on; if (a.quality && CPR_QUAL[a.quality] != null) quality = a.quality; }
      else if (a.type === 'amiodarone') { amio = true; }
      else if (a.type === 'defib') {
        const shocks = defib.shocks + 1;
        const charge = a.joules || defib.charge;
        if (rh && SHOCKABLE.has(rh.rhythm)) {
          const p = shockSuccess(rh, { buildup, amio, defib: { shocks } }, ctx.t);
          const ok = ctx.rand('defib') < p;
          convert = ok ? 'sinus' : null;
          defib = { charge, shocks, lastOutcome: ok ? 'converted to a rhythm' : 'no change', lastT: ctx.t };
          ctx.log({ kind: 'defib', joules: charge, outcome: defib.lastOutcome });
        } else {
          defib = { charge, shocks, lastOutcome: 'not a shockable rhythm', lastT: ctx.t };
          ctx.log({ kind: 'defib', joules: charge, outcome: defib.lastOutcome });
        }
      } else if (a.type === 'pace') {
        pace = { ...pace, on: !!a.on, mA: a.mA != null ? a.mA : pace.mA };
      }
    }
    // capture: pacing at or above the patient's threshold drives the ventricles (rhythm.js switches to paced)
    const capturing = pace.on && pace.mA >= pace.threshold;
    if (capturing !== pace.capturing) pace = { ...pace, capturing };

    // coronary-perfusion build-up: rises while compressing, falls on a pause. cprFrac is the output fraction now.
    const tau = cpr ? BUILD_ON : BUILD_OFF;
    buildup = buildup + ((cpr ? 1 : 0) - buildup) * (dt / tau);
    const cprFrac = cpr ? CPR_QUAL[quality] * (0.6 + 0.4 * buildup) : 0;

    return { ...r, cpr, quality, buildup, cprFrac, amio, defib, pace, convert };
  },
  rebase(r, off) {
    return { ...r, convert: null, defib: { ...r.defib, lastT: r.defib.lastT - off } };
  },
  trend(r) { return { cprFrac: r.cprFrac }; },
};
