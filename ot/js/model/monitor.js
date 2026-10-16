// What the monitor reports (DESIGN.md, "Monitor and alarms"; MODEL.md section 9): the model's values turned into
// displayed numbers, in simulated time so the display behaves the same at every speed. M0.2: averaging and the NIBP
// cycle; M1.3: the TOF module. Sensor delays come with gas.js (M2.4); limits and alarms with M3.3.
//
// Like every subsystem it reads the previous step (Jacobi), so it sees a beat or breath one step (0.1 s) after the
// model has it: the same lag as a real monitor's beat detector, and far below its averaging.

const HR_BEATS = 4;     // HR: mean of the last 4 beat-to-beat intervals [D]
const RR_BREATHS = 4;   // respiratory rate: mean of the last 4 breaths [D]
const SPO2_TAU = 4;     // s: exponential average, about an 8 s window [D] (monitors average over 8-10 s)
const SAT_HIST = 91;    // s of arterial saturation kept for the finger probe's delay
const PROBE_DELAY = 25; // s finger transport delay at the resting cardiac output, longer when output falls (MODEL.md 8) [S/D]
const NO_BREATH = 30;   // s without a breath before the rate and EtCO2 show nothing [D]
const TEMP_TAU = 10;    // s [D]
export const NIBP_TAKES = 30;  // s from cuff start to a reading [D] (about 30 s on real monitors)
export const NIBP_CYCLES = [0, 1, 2, 2.5, 3, 5, 10, 15]; // minutes, 0 = manual
export const TOF_EVERY = 15;   // s between automatic trains of four [D] (monitors offer 15 s to 15 min)
const PTC_LOCK = 120;          // s: a post-tetanic count potentiates the twitches, so wait before the next [D]

const push = (arr, x, n) => { const a = arr.concat([x]); return a.length > n ? a.slice(a.length - n) : a; };
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;

// --- alarms (M3.3): per-parameter limits, three IEC 60601-1-8 priorities, an onset debounce and a 2-minute silence.
// Evaluated here in simulated time, so onset timing is identical at every speed, and logged on each on/off transition.
// The default limits and priorities are our design choice [D]; the owner reviews them, and M3.3 slice 2 lets the
// trainee change them. A parameter alarms low or high (never both at once); NIBP uses the last reading, temp the core.
export const SILENCE = 120;                               // s an alarm silence (audio pause) lasts [D]
const ONSET = { high: 3, medium: 5, low: 10 };            // s a breach must persist before the alarm latches [D]
export const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };
export const ALARM_LIMITS = {
  spo2:   { lo: 90, loPr: 'high', loMsg: 'SpO₂ low' },
  hr:     { lo: 45, hi: 130, loPr: 'medium', hiPr: 'medium', loMsg: 'Heart rate low', hiMsg: 'Heart rate high' },
  etco2:  { lo: 25, hi: 60, loPr: 'medium', hiPr: 'medium', loMsg: 'EtCO₂ low', hiMsg: 'EtCO₂ high' },
  rr:     { lo: 6, hi: 30, loPr: 'medium', hiPr: 'low', loMsg: 'Respiratory rate low', hiMsg: 'Respiratory rate high' },
  nibpSys:{ lo: 85, hi: 180, loPr: 'medium', hiPr: 'medium', loMsg: 'Systolic BP low', hiMsg: 'Systolic BP high' },
  temp:   { lo: 35, hi: 38.5, loPr: 'medium', hiPr: 'low', loMsg: 'Temperature low', hiMsg: 'Temperature high' },
};
const alarmKey = a => a.param + a.dir;

// Technical alarms (M3.3 slice 2): not a numeric breach but a sensor/airway condition, from the other slices' previous
// step. "No CO₂" fires when the ventilator is delivering breaths but almost no CO₂ comes back (an oesophageal tube, a
// disconnection, or no pulmonary blood flow in an arrest) — the key teaching signal. "SpO₂ no pulse" fires in a
// non-perfusing rhythm, when a pulse oximeter cannot read; it then replaces the SpO₂ numeric alarm. [D]
const NON_PERFUSING = new Set(['vf', 'torsades', 'asystole', 'pea']);
const TECHNICAL = [
  { key: 'noco2', priority: 'high', dir: 't', msg: 'No CO₂ — check the tube and circuit',
    test: (out, prev) => prev.resp && prev.resp.mode !== 'spont' && out.etco2 < 2 },
  { key: 'spo2sig', priority: 'medium', dir: 't', msg: 'SpO₂ — no pulse detected',
    test: (out, prev) => !!(prev.rh && NON_PERFUSING.has(prev.rh.base)) },
];

// evaluate the alarms against the freshly-computed displayed values and the previous step; mutates
// out.{breach,alarms,silencedUntil}
function evalAlarms(out, prev, ctx, t) {
  const m = prev.mon;
  let silencedUntil = m.silencedUntil || 0;
  for (const a of ctx.actions) if (a.type === 'alarmSilence') silencedUntil = a.off ? 0 : t + SILENCE;

  const vals = { spo2: out.spo2, hr: out.hr, etco2: out.etco2, rr: out.rr, nibpSys: out.nibp.last ? out.nibp.last.sys : null, temp: out.temp };
  const breach = { ...(m.breach || {}) }, active = [];
  // technical alarms first, so an active one can suppress a numeric alarm that cannot be trusted
  const techOn = {};
  for (const T of TECHNICAL) {
    const on = T.test(out, prev);
    if (!on) { delete breach[T.key]; continue; }
    const was = breach[T.key], since = was ? was.since : t;
    breach[T.key] = { dir: T.dir, since };
    if (t - since >= ONSET[T.priority]) { active.push({ param: T.key, dir: T.dir, priority: T.priority, msg: T.msg, since, tech: true }); techOn[T.key] = true; }
  }
  for (const p in ALARM_LIMITS) {
    if (p === 'spo2' && techOn.spo2sig) { delete breach[p]; continue; } // no numeric SpO₂ alarm with no pulse to read
    const L = ALARM_LIMITS[p], v = vals[p];
    let dir = null, pr = null, msg = null;
    if (v == null || Number.isNaN(v)) { delete breach[p]; continue; }
    if (L.lo != null && L.loPr && v < L.lo) { dir = 'lo'; pr = L.loPr; msg = L.loMsg; }
    else if (L.hi != null && L.hiPr && v > L.hi) { dir = 'hi'; pr = L.hiPr; msg = L.hiMsg; }
    if (!dir) { delete breach[p]; continue; }
    const was = breach[p], since = was && was.dir === dir ? was.since : t;
    breach[p] = { dir, since };
    if (t - since >= ONSET[pr]) active.push({ param: p, dir, priority: pr, msg, since });
  }
  const prevKeys = new Set((m.alarms || []).map(alarmKey)), nowKeys = new Set(active.map(alarmKey));
  for (const a of active) if (!prevKeys.has(alarmKey(a))) ctx.log({ kind: 'alarm', param: a.param, dir: a.dir, priority: a.priority, msg: a.msg, tech: !!a.tech, state: 'on' });
  for (const a of (m.alarms || [])) if (!nowKeys.has(alarmKey(a))) ctx.log({ kind: 'alarm', param: a.param, dir: a.dir, priority: a.priority, msg: a.msg, tech: !!a.tech, state: 'off' });
  out.breach = breach; out.alarms = active; out.silencedUntil = silencedUntil;
}

export const monitor = {
  name: 'mon',
  init(state) {
    return {
      hr: state.cv ? state.cv.hr : 72, spo2: state.gas ? state.gas.sao2 : 98, etco2: state.gas ? state.gas.etco2 : 38,
      rr: state.resp ? state.resp.rr : 14, temp: state.temp ? state.temp.core : 36.8,
      rrs: [], cycles: [], seenBeat: state.rh ? state.rh.next : 0, seenBreath: state.resp ? state.resp.breathT : 0,
      // SpO2 history, one sample a second, for the oximeter's transport delay
      sat: new Array(SAT_HIST).fill(state.gas ? state.gas.sao2 : 98), satT: 0,
      // NIBP: cycle in minutes (0 = manual); start = when the running measurement began (null when idle)
      nibp: { cycle: 5, start: null, next: 0, last: null },
      // TOF at the adductor pollicis: count, ratio (count 4 only), when; a PTC on request when the count is 0
      tof: { count: 4, ratio: 1, t: 0, next: 0, ptc: null, ptcT: null },
      // alarms (M3.3): the active alarm list, the per-parameter breach timers (for the onset debounce) and when the
      // audio is silenced until
      alarms: [], breach: {}, silencedUntil: 0,
    };
  },
  step(prev, ctx) {
    const m = prev.mon, dt = ctx.dt, t = ctx.t;
    const out = { ...m };
    // a beat happened when the model's next ventricular event time moved on. VF and torsades have no countable beats
    // (HR reads nothing), asystole reads 0; a rhythm change resyncs without recording a bogus interval.
    const rh = prev.rh, base = rh ? rh.base : null;
    if (base === 'vf' || base === 'torsades') { out.hr = NaN; out.rrs = []; out.seenBeat = rh.next; }
    else if (base === 'asystole') { out.hr = 0; out.rrs = []; out.seenBeat = rh.next; }
    else if (rh && rh.next !== m.seenBeat) {
      const d = rh.next - m.seenBeat;
      if (rh.next < 1e6 && d > 0 && d < 6) {
        out.rrs = push(m.rrs, d, HR_BEATS);
        out.hr = 60 / mean(out.rrs);
      }
      out.seenBeat = rh.next;
    }
    const rs = prev.resp, g = prev.gas;
    if (rs && rs.breathT !== m.seenBreath) {
      out.cycles = push(m.cycles, rs.breathT - m.seenBreath, RR_BREATHS);
      out.rr = 60 / mean(out.cycles);
      out.etco2 = g.etco2; // end-tidal: the value at the end of the breath just finished
      out.seenBreath = rs.breathT;
    }
    if (rs && t - rs.breathT > NO_BREATH) { out.rr = 0; out.etco2 = 0; out.cycles = []; }
    // SpO2: arterial saturation delayed by the transport to the finger (longer with low output), then averaged
    let sat = m.sat, satT = m.satT;
    if (g && t - satT >= 1) { sat = sat.slice(1); sat.push(g.sao2); satT = t; }
    const delay = Math.min(SAT_HIST - 1, Math.round(PROBE_DELAY * Math.min(3, 5.4 / Math.max(0.5, prev.cv ? prev.cv.co : 5.4))));
    const seen = sat[SAT_HIST - 1 - delay];
    out.sat = sat; out.satT = satT;
    out.spo2 = m.spo2 + (seen - m.spo2) * (dt / SPO2_TAU);
    out.temp = m.temp + ((prev.temp ? prev.temp.core : 36.8) - m.temp) * (dt / TEMP_TAU);

    // NIBP: actions first, then the cycle, then a running measurement finishing
    let n = m.nibp;
    for (const a of ctx.actions) {
      if (a.type !== 'nibp') continue;
      // a manual start restarts the cycle timer, as on most monitors [D]
      if (a.do === 'start' && n.start == null) n = { ...n, start: t, next: n.cycle ? t + n.cycle * 60 : 0 };
      else if (a.do === 'stop') n = { ...n, start: null };
      if (a.cycle != null && NIBP_CYCLES.includes(a.cycle)) n = { ...n, cycle: a.cycle, next: a.cycle ? t + a.cycle * 60 : 0 };
    }
    if (n.cycle && n.start == null && t >= n.next) n = { ...n, start: t, next: t + n.cycle * 60 };
    if (n.start != null && t - n.start >= NIBP_TAKES) {
      const cv = prev.cv;
      n = { ...n, start: null, last: { sys: cv.sbp, dia: cv.dbp, map: cv.map, t } };
      ctx.log({ kind: 'nibp', sys: Math.round(cv.sbp), dia: Math.round(cv.dbp), map: Math.round(cv.map) });
    }
    if (n !== m.nibp) out.nibp = n;

    // TOF every 15 s, or now on request; PTC on request (meaningful only with no TOF response)
    const nb = prev.pd ? prev.pd.nmb : null;
    if (nb) {
      let tof = m.tof;
      const now = ctx.actions.some(a => a.type === 'tof' && a.do === 'now'), ptcAsk = ctx.actions.some(a => a.type === 'tof' && a.do === 'ptc');
      if (now || t >= tof.next) tof = { ...tof, count: nb.tofCount, ratio: nb.tofr, t, next: t + TOF_EVERY };
      if (ptcAsk && (tof.ptcT == null || t - tof.ptcT >= PTC_LOCK)) {
        tof = { ...tof, ptc: nb.tofCount === 0 ? nb.ptc : null, ptcT: t };
        ctx.log({ kind: 'ptc', ptc: nb.tofCount === 0 ? nb.ptc : null });
      }
      if (tof !== m.tof) out.tof = tof;
    }
    evalAlarms(out, prev, ctx, t);
    return out;
  },
  rebase(m, off) {
    const n = m.nibp, breach = {};
    for (const p in m.breach) breach[p] = { ...m.breach[p], since: m.breach[p].since - off };
    return {
      ...m, seenBeat: m.seenBeat - off, seenBreath: m.seenBreath - off, satT: m.satT - off,
      nibp: { ...n, start: n.start == null ? null : n.start - off, next: Math.max(0, n.next - off), last: n.last && { ...n.last, t: n.last.t - off } },
      tof: { ...m.tof, t: m.tof.t - off, next: Math.max(0, m.tof.next - off), ptcT: m.tof.ptcT == null ? null : m.tof.ptcT - off },
      alarms: m.alarms.map(a => ({ ...a, since: a.since - off })), breach, silencedUntil: Math.max(0, m.silencedUntil - off),
    };
  },
};
