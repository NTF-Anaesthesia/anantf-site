// Rhythm and the ECG (MODEL.md section 6). An atrial clock, an AV node and a ventricular clock drive the beats that
// the circulation turns into stroke volumes (cardio.js). Sinus follows the baroreflex heart period (cv.hp); every
// other rhythm runs at its own rate. Beat times are exact numbers (not rounded to steps), so PR intervals, grouped
// beating and the atrial kick resolve. The ECG itself is drawn for display only (ui/synth.js) from the per-beat
// morphology here plus the continuous baseline (AF, flutter, VF, torsades, asystole, marching P waves).
//
// Contract (read by cardio.js, monitor.js and ui/synth.js):
//   rh.rhythm   the mode id ('sinus', 'af', 'vt', 'vf', …)
//   rh.label    the display name
//   rh.events   the ventricular beats inside this step: { t, rr, morph } (morph names the QRS shape for the ECG)
//   rh.next     the next ventricular beat's time (known ahead, so the monitor draws a beat before its QRS). For a
//               non-perfusing rhythm with no beats (VF, torsades, asystole) it is parked far ahead.
//   rh.output   mechanical effectiveness 0..1 of the rhythm (cardio multiplies cardiac output by it): 1 sinus, less
//               for the fast and poorly-filled rhythms, 0 for VF, asystole and PEA
//   rh.perfusing whether the rhythm makes a pulse (false for VF, torsades, asystole, PEA)
//   rh.base     the continuous ECG baseline for the renderer: null, 'af', 'flutter', 'vf', 'torsades', 'asystole',
//               'sine' (the hyperkalaemia sine wave) or 'pwave' (independent P waves at rh.atrialRate)
//   rh.atrialRate  atrial rate /min for the 'pwave' and 'flutter' baselines
//   rh.since    model time the current rhythm began (VF coarsens to fine over minutes from here)
//
// Change the rhythm with the action { type: 'rhythm', to: '<id>' } (ui/main.js, the Patient tab). The scenarios
// (M4) drive it the same way.

const JITTER = 0.015;   // sinus beat-to-beat SD as a fraction of the period [D] (resting HRV is a few %)
const AF_IRREG = 0.6;   // AF: full width of the beat-to-beat scatter as a fraction of the mean interval [D]
const FAR = 1e7;        // where a non-perfusing rhythm parks its "next beat" so no QRS is drawn

// The rhythms. rate /min is the ventricular rate (or escape rate); atrialRate the atrial rate; ratio the AV
// conduction ratio (conduct all but one in each group); cycle the Wenckebach group length. output and perfusing are
// the circulation's response. Rates are clinical ranges [V]; the mapping to output is our design [D, MODEL.md 6].
export const CATALOG = {
  sinus:      { label: 'Sinus rhythm',                         clock: 'sinus',  qrs: 'sinus',      output: 1,    perfusing: true },
  brady:      { label: 'Sinus bradycardia',                    clock: 'fixed',  rate: 45,  qrs: 'sinus',      output: 1,    perfusing: true },
  tachy:      { label: 'Sinus tachycardia',                    clock: 'fixed',  rate: 120, qrs: 'sinus',      output: 0.95, perfusing: true },
  junctional: { label: 'Junctional rhythm',                    clock: 'fixed',  rate: 50,  qrs: 'narrow-nop', output: 0.85, perfusing: true },
  av1:        { label: 'First-degree AV block',                clock: 'sinus',  qrs: 'sinus-pr',   output: 1,    perfusing: true },
  wenckebach: { label: 'Second-degree block, Wenckebach',      clock: 'wenck',  atrialRate: 75, cycle: 4, qrs: 'narrow-nop', base: 'pwave', output: 0.85, perfusing: true },
  mobitz2:    { label: 'Second-degree block, Mobitz II',       clock: 'mobitz', atrialRate: 75, ratio: 3, qrs: 'narrow-nop', base: 'pwave', output: 0.8,  perfusing: true },
  chb:        { label: 'Complete heart block',                 clock: 'fixed',  rate: 38,  atrialRate: 75, qrs: 'wide', base: 'pwave', output: 0.6,  perfusing: true },
  af:         { label: 'Atrial fibrillation',                  clock: 'af',     rate: 130, qrs: 'narrow-nop', base: 'af',    output: 0.85, perfusing: true },
  flutter:    { label: 'Atrial flutter',                       clock: 'flutter', atrialRate: 300, ratio: 2, qrs: 'narrow-nop', base: 'flutter', output: 0.9, perfusing: true },
  svt:        { label: 'Supraventricular tachycardia',         clock: 'fixed',  rate: 180, qrs: 'narrow-nop', output: 0.6,  perfusing: true },
  bigeminy:   { label: 'Ventricular bigeminy',                 clock: 'bigem',  qrs: 'sinus',      output: 0.75, perfusing: true },
  vt:         { label: 'Ventricular tachycardia',              clock: 'fixed',  rate: 180, qrs: 'wide',       output: 0.35, perfusing: true },
  paced:      { label: 'Paced rhythm',                         clock: 'fixed',  rate: 70,  qrs: 'paced',      output: 0.85, perfusing: true },
  torsades:   { label: 'Torsades de pointes',                  clock: 'none',   base: 'torsades', output: 0,    perfusing: false },
  vf:         { label: 'Ventricular fibrillation',             clock: 'none',   base: 'vf',       output: 0,    perfusing: false },
  pea:        { label: 'Pulseless electrical activity',        clock: 'fixed',  rate: 40,  qrs: 'narrow-nop', output: 0,    perfusing: false },
  asystole:   { label: 'Asystole',                             clock: 'none',   base: 'asystole', output: 0,    perfusing: false },
  // hyperkalaemia stages (the ECG is insensitive to potassium, Montague 2008 [V]; the morphologies are the classic
  // teaching progression [S/D]): peaked T, then a wide QRS with a flat P, then the sine wave
  hyperk1:    { label: 'Hyperkalaemia: peaked T waves',        clock: 'sinus',  qrs: 'peakedt',    output: 1,    perfusing: true },
  hyperk2:    { label: 'Hyperkalaemia: wide QRS',              clock: 'sinus',  qrs: 'wide-nop',   output: 0.9,  perfusing: true },
  hyperk3:    { label: 'Hyperkalaemia: sine wave',             clock: 'fixed',  rate: 48,  qrs: 'wide-nop',   base: 'sine', output: 0.5, perfusing: true },
};

// a fresh rhythm state from its id, clocks starting at time t
function build(id, t, hp) {
  const c = CATALOG[id] || CATALOG.sinus;
  const perf = c.perfusing;
  const vp = c.clock === 'sinus' ? hp : c.rate ? 60 / c.rate : hp; // first ventricular period
  const na = c.atrialRate ? 60 / c.atrialRate : 0;
  return {
    rhythm: id, label: c.label, qrs: c.qrs || 'sinus', base: c.base || null,
    output: c.output, perfusing: perf, atrialRate: c.atrialRate || 0,
    clock: c.clock, rate: c.rate || 0, ratio: c.ratio || 0, cycle: c.cycle || 0,
    since: t, events: [],
    next: c.clock !== 'none' ? t + vp : FAR,  // PEA has beats (no pulse); only VF/torsades/asystole have none
    last: t,
    na: na ? t + na : 0, ai: 0, phase: 0, // atrial clock, group index, bigeminy phase
  };
}

export const rhythm = {
  name: 'rh',
  init(state) {
    const hp = state.cv ? state.cv.hp : 60 / 72;
    return build('sinus', 0, hp);
  },
  step(prev, ctx) {
    let r = prev.rh;
    const hp = prev.cv ? prev.cv.hp : 60 / 72;
    // an action changes the rhythm: rebuild the clocks from now
    let acted = false;
    for (const a of ctx.actions) if (a.type === 'rhythm' && CATALOG[a.to]) { r = build(a.to, ctx.t, hp); acted = true; }
    // resuscitation (resus.js) drives the rhythm too: a successful shock converts to an organised rhythm, and pacing
    // that reaches the capture threshold drives a paced rhythm. A direct rhythm action this step takes precedence.
    const res = prev.resus;
    if (!acted && res) {
      if (res.convert && CATALOG[res.convert]) r = build(res.convert, ctx.t, hp);
      else if (res.pace && res.pace.capturing && r.rhythm !== 'paced') r = build('paced', ctx.t, hp);
    }

    const events = [];
    let { next, last, na, ai, phase } = r;
    const jitter = () => 1 + JITTER * ctx.normal('rhythm');

    if (r.clock === 'none') {
      // no ventricular beats; the baseline is drawn by the renderer. next stays parked.
      return r.events.length ? { ...r, events } : r;
    }

    if (r.clock === 'sinus' || r.clock === 'fixed' || r.clock === 'af') {
      const base = r.clock === 'sinus' ? null : 60 / r.rate;
      while (next <= ctx.t) {
        events.push({ t: next, rr: next - last, morph: r.qrs });
        last = next;
        const p = r.clock === 'sinus' ? hp * jitter()
          : r.clock === 'af' ? base * (1 + AF_IRREG * (ctx.rand('rhythm') - 0.5))
          : base * jitter();
        next = next + Math.max(0.2, p);
      }
    } else if (r.clock === 'bigem') {
      // sinus beat, then an early wide PVC, then a compensatory pause (phase 0 -> 1 -> back) [D]
      while (next <= ctx.t) {
        const pvc = phase === 1;
        events.push({ t: next, rr: next - last, morph: pvc ? 'wide' : 'sinus' });
        last = next;
        const full = hp * jitter();
        next = next + (phase === 0 ? 0.42 * full : 1.58 * full); // early PVC, then a pause so the pair fills ~2 cycles
        phase = phase === 0 ? 1 : 0;
      }
    } else if (r.clock === 'flutter') {
      // atrial sawtooth at atrialRate (drawn by the baseline); conduct every ratio-th flutter wave
      const Ta = 60 / r.atrialRate;
      while (na <= ctx.t) {
        ai = (ai + 1) % r.ratio;
        if (ai === 0) { events.push({ t: na, rr: na - last, morph: r.qrs }); last = na; }
        na = na + Ta;
      }
      next = last + r.ratio * Ta;
    } else if (r.clock === 'wenck' || r.clock === 'mobitz') {
      // the atria march at atrialRate (drawn as P waves); the AV node drops a beat each group
      const Ta = 60 / r.atrialRate;
      const drop = r.clock === 'wenck'
        ? i => i === r.cycle - 1                         // Wenckebach: drop the last of the group
        : i => i === r.ratio - 1;                        // Mobitz II: fixed ratio, drop one each group
      const groupLen = r.clock === 'wenck' ? r.cycle : r.ratio;
      const prOf = i => r.clock === 'wenck' ? 0.16 + 0.06 * i : 0.18; // PR lengthens through a Wenckebach group
      while (na <= ctx.t) {
        if (!drop(ai)) { const t = na + prOf(ai); events.push({ t, rr: t - last, morph: r.qrs }); last = t; }
        ai = (ai + 1) % groupLen;
        na = na + Ta;
      }
      // predict the next conducted beat so the monitor's rate reads right
      let j = ai, n = na, nx = FAR;
      for (let k = 0; k < groupLen + 1; k++) { if (!drop(j)) { nx = n + prOf(j); break; } j = (j + 1) % groupLen; n += Ta; }
      next = nx;
    }

    // return a fresh slice whenever anything changed, including when this step has no beats but the last one did (so
    // rh.events is cleared and cardio does not re-emit it); otherwise the unchanged previous slice
    const changed = events.length || prev.rh.events.length || next !== prev.rh.next || na !== prev.rh.na || ai !== prev.rh.ai || phase !== prev.rh.phase || r !== prev.rh;
    return changed ? { ...r, events, next, last, na, ai, phase } : prev.rh;
  },
  rebase(r, off) {
    const shift = x => (x >= FAR ? x : x - off);
    return {
      ...r, since: r.since - off, next: shift(r.next), last: r.last - off, na: r.na ? r.na - off : 0,
      events: r.events.map(e => ({ ...e, t: e.t - off })),
    };
  },
};
