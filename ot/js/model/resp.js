// Breathing (MODEL.md section 7): spontaneous breathing driven by CO2 and depressed by drugs, and the ventilator
// (volume control, pressure control) with closed-form pressures within each breath. Gas exchange uses the continuous
// alveolar ventilation set here (gas.js); breath events feed the capnogram and the monitor's rate. Pleural pressure
// through each breath goes to the circulation (pulse pressure variation emerges there).
// The airway (airway.js) decides how much of the breath reaches the alveoli (aw.toLungs), the inspired-O2 dilution at
// a leaky mask (aw.entrain) and one-lung ventilation (aw.oneLung); a patent airway leaves the breathing unchanged.

import { exp, pow, sin } from './fmath.js';
import { ceREq } from './pd.js';

export const RESP = {
  vdPerKg: 2,               // mL/kg anatomical dead space [D]
  rr0: 14,                  // awake rate [D]
  compliance: 60,           // mL/cmH2O total respiratory compliance under GA (band 50-80) [V/D]
  rAirway: 2,               // cmH2O/L/s native airway [D]
  tubeK1: 4, tubeK2: 6.01,  // 7.5 mm tube, Rohrer (Flevari 2011 K2) [V K2, D K1]
  pplFrac: 0.4,             // pleural pressure = 0.4 x alveolar pressure (Lansdorp 2014: 0.33-0.55) [V]
  cmH2OtoMmHg: 1 / 1.36,
  // Bouillon drive [V where cited]: C50s propofol 1.33 mcg/mL, remifentanil 0.92 ng/mL, fentanyl 2.3 ng/mL; synergy
  // and slope [D]; CO2 gain F 4.3 flattened by drug effect, Feff = F (1 - E)^1.5 [D]; PeCO2 follows PaCO2 at
  // 0.93/min [V]; apnoeic threshold PaCO2,0 - 4 + kAT E PaCO2,0 [D]
  c50P: 1.33, c50R: 0.92, c50F: 2.3, synergy: 1.0, gamma: 1.5, F: 4.3, ke0CO2: 0.93, kAT: 0.115, pa0: 40, opioidAT: 2,
};

// drug depression of breathing, E (0-1) [V C50s, D combination]
export function driveE(prev) {
  const d = prev.pk ? prev.pk.d : {}, ce = id => (d[id] ? d[id].ce : 0);
  const p = ce('propofol') / RESP.c50P, r = ce('remifentanil') / RESP.c50R, f = ce('fentanyl') / RESP.c50F;
  const sevo = prev.vol && prev.vol.mac ? prev.vol.mac / 1.2 : 0; // volatile term [D, M2.5]
  const u = p + r + f + RESP.synergy * p * (r + f) + sevo;
  return u > 0 ? 1 - 1 / (1 + pow(u, RESP.gamma)) : 0;
}

// within-breath alveolar pressure (cmH2O) at time x into a breath of the ventilator
function palv(m, x) {
  if (x < m.ti) return m.peepTot + (m.vt / m.c) * (x / m.ti);
  return m.peepTot + (m.vt / m.c) * exp(-(x - m.ti) / m.tau);
}

// ventilator mechanics for a breath (closed form) [V formulas]
export function ventBreath(set, c, rAw) {
  const cycle = 60 / set.rr, ti = (cycle * set.ie) / (1 + set.ie), te = cycle - ti;
  let vt = set.vt;
  const rTot = rAw + RESP.tubeK1;
  const tau0 = (rTot * c) / 1000;
  if (set.mode === 'pc') vt = set.pinsp * c * (1 - exp(-ti / tau0));
  const flow = vt / 1000 / ti;                       // L/s
  const r = rTot + RESP.tubeK2 * flow, tau = (r * c) / 1000;
  const e = exp(-te / tau), autoPeep = e < 1 ? ((vt / c) * e) / (1 - e) : 0;
  const peepTot = set.peep + (autoPeep > 0.05 ? autoPeep : 0);
  return {
    cycle, ti, vt, c, tau, peepTot, autoPeep,
    ppeak: peepTot + flow * r + vt / c, pplat: peepTot + vt / c,
  };
}

export const resp = {
  name: 'resp',
  init(state) {
    const p = state.patient, vd = RESP.vdPerKg * p.weightKg;
    const vco2 = 3.5 * p.weightKg * 0.8, va0 = (863 * vco2) / RESP.pa0;
    const vt0 = va0 / RESP.rr0 + vd;
    return {
      mode: 'spont', set: { vt: Math.round(7 * p.ibw / 10) * 10, rr: 12, peep: 5, ie: 0.5, pinsp: 15, fio2: 0.21, o2: 0.21 },
      vd, vt0, ve0: vt0 * RESP.rr0, pe: RESP.pa0, apnoea: false,
      vt: vt0, rr: RESP.rr0, mv: (vt0 * RESP.rr0) / 1000, va: va0, ppeak: 0, pplat: 0, peep: 0, autoPeep: 0,
      compliance: RESP.compliance, resistance: RESP.rAirway, spont: true, pplMmHg: 0, open: true, fio2: 0.21,
      nextBreath: 60 / RESP.rr0, breathT: 0, cycle: 60 / RESP.rr0, ti: 20 / RESP.rr0, mech: null,
    };
  },
  step(prev, ctx) {
    const r = prev.resp, t = ctx.t, dt = ctx.dt;
    let set = r.set, mode = r.mode;
    for (const a of ctx.actions) {
      if (a.type === 'vent') {
        if (['spont', 'vc', 'pc'].includes(a.mode)) mode = a.mode;
        set = { ...set };
        for (const k of ['vt', 'rr', 'peep', 'ie', 'pinsp', 'fio2']) if (a[k] != null && Number.isFinite(+a[k])) set[k] = +a[k];
      } else if (a.type === 'o2' && a.fio2 != null) set = { ...set, o2: Math.min(1, Math.max(0.21, +a.fio2)) };
    }
    // the drive follows PaCO2 (effect site) in every mode
    const paco2 = prev.gas ? prev.gas.paco2 : RESP.pa0;
    const pe = r.pe + (paco2 - r.pe) * (dt / 60) * RESP.ke0CO2;
    const out = { ...r, set, mode, pe };
    const strength = prev.pd && prev.pd.nmb ? prev.pd.nmb.diaphragm : 1;
    if (mode === 'spont') {
      // apnoeic threshold, shifted further by opioids (a fixed shift that saturates) [D]
      const d = prev.pk.d, ceR = ceREq(d.remifentanil ? d.remifentanil.ce : 0, d.fentanyl ? d.fentanyl.ce : 0);
      const E = driveE(prev), at = RESP.pa0 - 4 + RESP.kAT * E * RESP.pa0 + (RESP.opioidAT * ceR) / (ceR + 1);
      const feff = RESP.F * pow(1 - E, 1.5);
      const apnoea = pe < at || strength < 0.05;
      let ve = apnoea ? 0 : r.ve0 * (1 - E) * pow(Math.max(0.01, pe / RESP.pa0), feff) * strength;
      ve = Math.min(ve, r.ve0 * 6);
      const vt = ve > 0 ? r.vt0 * pow(ve / r.ve0, 0.35) : 0, rr = vt > 0 ? ve / vt : 0;
      Object.assign(out, {
        apnoea, vt, rr, mv: ve / 1000, va: Math.max(0, vt - r.vd) * rr, spont: true, fio2: set.o2,
        ppeak: 0, pplat: 0, peep: 0, autoPeep: 0, mech: null,
      });
    } else {
      const m = ventBreath({ ...set, mode }, RESP.compliance * (prev.patient.complianceScale || 1), RESP.rAirway * (prev.patient.resistanceScale || 1));
      Object.assign(out, {
        apnoea: false, vt: m.vt, rr: set.rr, mv: (m.vt * set.rr) / 1000, va: Math.max(0, m.vt - r.vd) * set.rr, spont: false,
        fio2: set.fio2, ppeak: m.ppeak, pplat: m.pplat, peep: set.peep, autoPeep: m.autoPeep, mech: m,
        compliance: m.c, resistance: RESP.rAirway + RESP.tubeK1,
      });
    }
    // breath timing: exact times; a breath starts when the clock passes nextBreath
    const cycle = out.rr > 0 ? 60 / out.rr : 0;
    let next = r.nextBreath, breathT = r.breathT;
    if (cycle === 0) next = t + 1; // no breaths while apnoeic
    else {
      if (next > t + cycle) next = t + Math.min(cycle, 2); // a first breath soon after apnoea ends
      while (next <= t) {
        breathT = next;
        const ti = out.mech ? out.mech.ti : cycle / 3;
        ctx.emit({ kind: 'breath', t: next, cycle, ti, vt: out.vt, etco2: prev.gas ? prev.gas.etco2 : 38, ppeak: out.ppeak });
        next += cycle;
      }
    }
    // pleural pressure now (mmHg): positive pressure follows alveolar pressure; spontaneous breaths pull it down a little
    const x = t - breathT;
    let ppl = 0;
    if (out.mech) ppl = RESP.pplFrac * palv(out.mech, x) * RESP.cmH2OtoMmHg;
    else if (cycle > 0 && x < cycle / 3) ppl = -2 * sin((3.141592653589793 * x) / (cycle / 3)) * (out.vt / r.vt0);
    // the airway (airway.js) scales the delivered alveolar ventilation, dilutes the inspired O2 at a leaky mask, and
    // adds a one-lung shunt. A patent airway (toLungs 1, entrain 0, oneLung false) leaves everything unchanged.
    const aw = prev.aw, toLungs = aw ? aw.toLungs : 1;
    if (aw && aw.entrain > 0) out.fio2 = out.fio2 * (1 - aw.entrain) + 0.21 * aw.entrain;
    out.va *= toLungs;
    out.mv *= toLungs;
    out.shuntAdd = aw && aw.oneLung ? 0.25 : 0;
    const open = toLungs > 0.01;
    return { ...out, nextBreath: next, breathT, cycle, pplMmHg: ppl, open };
  },
  rebase(r, off) { return { ...r, nextBreath: r.nextBreath - off, breathT: r.breathT - off }; },
  trend(r) { return { rr: r.rr, mv: r.mv }; },
};
