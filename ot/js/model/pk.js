// Intravenous pharmacokinetics (MODEL.md section 2): mammillary models with up to three compartments and an effect
// site, stepped by explicit Euler at the model's dt (the prototype matched RK4 at 0.01 s to 2-3 decimals). Rate
// constants are per minute. Boluses enter the central compartment at once; infusions run in the drug's amount per
// minute, plus whatever the syringe pumps deliver (pump.js, read from the previous step). M1.3 adds rocuronium,
// suxamethonium and sugammadex.
//
// State: pk.p[drug] (parameters, fixed for the run), pk.d[drug] = { a1, a2, a3 (amounts), ce, ceH? }, pk.inf[drug]
// (amount/min). Others read cp and ce through cp(state, drug) and ce(state, drug).

import { DRUGS, doseAmount, rateAmount } from './drugs.js';
import { pkLbm } from './patient.js';
import { emptyNm, stepNm } from './nmb.js';

const LN2 = 0.6931471805599453;

// --- the published models: volumes (L), clearances (L/min), ke0 (/min) ---------------------------------------------

export const MODELS = {
  // propofol, Schnider 1998 (PK), 1999 (ke0 0.456) [V]; LBM capped at the James peak in obesity (patient.js)
  schnider(p) {
    const lbm = pkLbm(p.sex, p.weightKg, p.heightCm);
    return {
      V1: 4.27, V2: 18.9 - 0.391 * (p.age - 53), V3: 238,
      CL1: 1.89 + 0.0456 * (p.weightKg - 77) - 0.0681 * (lbm - 59) + 0.0264 * (p.heightCm - 177),
      CL2: 1.29 - 0.024 * (p.age - 53), CL3: 0.836, ke0: 0.456,
      // haemodynamic effect site, t1/2 by age band (Kazama 1999) [V]
      keH: LN2 / (p.age < 40 ? 5.7 : p.age < 60 ? 5.9 : p.age < 70 ? 8.9 : 10.2),
    };
  },
  // propofol, Marsh 1991 (the pump's option, M1.2); ke0 1.2 (Struys 2000) or 0.26 [V]
  marsh(p, ke0 = 1.2) {
    const V1 = 0.228 * p.weightKg;
    return fromK(V1, { k10: 0.119, k12: 0.112, k13: 0.0419, k21: 0.055, k31: 0.0033 }, ke0);
  },
  // remifentanil, Minto 1997 [V]
  minto(p) {
    const lbm = pkLbm(p.sex, p.weightKg, p.heightCm), a = p.age - 40, l = lbm - 55;
    return {
      V1: 5.1 - 0.0201 * a + 0.072 * l, V2: 9.82 - 0.0811 * a + 0.108 * l, V3: 5.42,
      CL1: 2.6 - 0.0162 * a + 0.0191 * l, CL2: 2.05 - 0.0301 * a, CL3: 0.076 - 0.00113 * a,
      ke0: 0.595 - 0.007 * a,
    };
  },
  // fentanyl, Shafer 1990 (the STANPUMP set) [V]; ke0 0.147 (time to peak 3.2 min) [V, disputed: owner question 8]
  shafer() { return fromK(6.09, { k10: 0.0827, k12: 0.471, k13: 0.225, k21: 0.102, k31: 0.006 }, 0.147); },
  // alfentanil, Maitre 1987 [V]: V1 0.111 L/kg (women x 1.15); clearance and k31 fall after 40 y (as opentiva) [S]
  maitre(p) {
    const V1 = 0.111 * p.weightKg * (p.sex === 'F' ? 1.15 : 1), over = Math.max(0, p.age - 40);
    return fromK(V1, { k10: (0.356 - 0.00269 * over) / V1, k12: 0.104, k13: 0.017, k21: 0.0673, k31: 0.0126 - 0.000113 * over }, 0.77);
  },
  // midazolam, Albrecht 1999, young adult set [V]; ke0 0.11 (time to peak about 6 min here: recorded, not tuned)
  albrecht() { return fromK(7.9, { k10: 0.399 / 7.9, k12: 0.19, k13: 0.065, k21: 0.06, k31: 0.0083 }, 0.11); },
  // ketamine, Domino 1982 as in opentiva [S]; ke0 0.652 for a time to peak about 1 min [D]
  domino(p) { return fromK(0.063 * p.weightKg, { k10: 0.438, k12: 0.592, k13: 0.59, k21: 0.247, k31: 0.0146 }, 0.652); },
};

// vasoactive drugs (M2.3) [D unless marked]: volumes scale with weight, clearances with weight^0.75
const w = p => p.weightKg / 70, w75 = p => w(p) / Math.sqrt(Math.sqrt(w(p)));
const vc = (V1, V2, V3, CL1, CL2, CL3, ke0) => ({ V1, V2, V3, CL1, CL2, CL3, ke0 });
Object.assign(MODELS, {
  // phenylephrine: Anderson 2017 2-compartment (CL 160 L/h, V1 13.3 L, Q 25.3 L/h, V2 225 L) [V] with V1 split into a
  // 5 L blood front end exchanging at 3 L/min with 8.3 L (prototype); ke0 1.5
  anderson: p => vc(5 * w(p), 8.3 * w(p), 225 * w(p), 2.67 * w75(p), 3 * w75(p), 0.42 * w75(p), 1.0),
  // noradrenaline: CL 3 L/min (Beloeil 2005) [V] from a 5 L blood volume (plasma t1/2 about 1.2 min: SmPC 1-2), so
  // an infusion is gone 1-2 min after stopping
  nora: p => vc(5 * w(p), 0, 0, 3 * w75(p), 0, 0, 2),
  adre: p => vc(13 * w(p), 0, 0, 3.64 * w(p), 0, 0, 2),            // CL 52 mL/kg/min, t1/2 2.5 min (Clutter) [V]
  vaso: p => vc(10 * w(p), 0, 0, 0.46 * w75(p), 0, 0, 1.5),        // t1/2 about 15 min; onset 1-2 min
  meta: p => vc(40 * w(p), 0, 0, 0.7 * w75(p), 0, 0, 0.5),         // lasts 20-60 min
  ephe: p => vc(210 * w(p), 0, 0, 0.6 * w75(p), 0, 0, 0.5),        // t1/2 about 4 h; onset 1-2 min
  atro: p => vc(91 * w(p), 0, 0, 0.35 * w75(p), 0, 0, 1),          // Vd 1.3 L/kg, t1/2 3 h (Hinderling); HR peak 2-4 min
  glyc: p => vc(42 * w(p), 0, 0, 0.39 * w75(p), 0, 0, 0.6),        // HR peak 2-5 min, lasts 2-3 h
  esmo: p => vc(15 * w(p), 245 * w(p), 0, 20 * w75(p), 3 * w75(p), 0, 1),  // t1/2 9 min, distribution 2 min [V]
  labe: p => vc(100 * w(p), 560 * w(p), 0, 1.9 * w75(p), 3 * w75(p), 0, 0.6), // maximum by 5 min
  gtn: p => vc(15 * w(p), 180 * w(p), 0, 54 * w75(p), 10 * w75(p), 0, 0.6),   // CL up to 3270 L/h [V]; onset 1-3 min
});

// rate-constant models as volumes and clearances, so every model takes the patient multipliers the same way
function fromK(V1, k, ke0) {
  return {
    V1, V2: k.k21 ? (k.k12 * V1) / k.k21 : 0, V3: k.k31 ? (k.k13 * V1) / k.k31 : 0,
    CL1: k.k10 * V1, CL2: k.k12 * V1, CL3: k.k13 * V1, ke0,
  };
}

// volumes and clearances as rate constants. vary: the patient's own multipliers on V1 and clearance (MODEL.md
// section 1; the pump's prediction uses none, so it differs from the true level)
export function rates(m, vary = { pkV1: 1, pkCL: 1 }) {
  const V1 = m.V1 * vary.pkV1, CL1 = m.CL1 * vary.pkCL;
  const out = {
    V1, k10: CL1 / V1, k12: m.CL2 / V1, k13: m.CL3 / V1,
    k21: m.V2 ? m.CL2 / m.V2 : 0, k31: m.V3 ? m.CL3 / m.V3 : 0, ke0: m.ke0,
  };
  if (m.keH) out.keH = m.keH;
  return out;
}

// one Euler step of dtMin minutes; returns new amounts and effect sites (pure: s is not changed)
export function advance(k, s, inRate, dtMin) {
  const cp = s.a1 / k.V1;
  const f12 = k.k12 * s.a1 - k.k21 * s.a2, f13 = k.k13 * s.a1 - k.k31 * s.a3;
  const out = {
    a1: s.a1 + (inRate - k.k10 * s.a1 - f12 - f13) * dtMin,
    a2: s.a2 + f12 * dtMin,
    a3: s.a3 + f13 * dtMin,
    ce: s.ce + k.ke0 * (cp - s.ce) * dtMin,
  };
  if (k.keH) out.ceH = s.ceH + k.keH * (cp - s.ceH) * dtMin;
  return out;
}

export const empty = k => (k.keH ? { a1: 0, a2: 0, a3: 0, ce: 0, ceH: 0 } : { a1: 0, a2: 0, a3: 0, ce: 0 });

// --- the subsystem ----------------------------------------------------------------------------------------------

export const pk = {
  name: 'pk',
  init(state) {
    const p = {};
    for (const id in DRUGS) if (MODELS[DRUGS[id].model]) p[id] = rates(MODELS[DRUGS[id].model](state.patient), state.patient);
    return { p, d: {}, inf: {}, nm: null, pend: [] };
  },
  step(prev, ctx) {
    const s = prev.pk, wt = prev.patient.weightKg, dtMin = ctx.dt / 60;
    let inf = s.inf, pend = s.pend || [];
    const add = {};
    const nmAdd = {};
    for (const a of ctx.actions) {
      if (a.type === 'bolus' && a.route === 'iv' && DRUGS[a.drug] && DRUGS[a.drug].model === 'nmb') {
        nmAdd[a.drug] = (nmAdd[a.drug] || 0) + doseAmount(a.drug, a.dose, a.unit, wt);
        continue;
      }
      if (!(a.drug in s.p)) continue;
      if (a.type === 'bolus' && a.route === 'iv') {
        const amt = doseAmount(a.drug, a.dose, a.unit, wt);
        // a transit delay from the cannula to the central circulation (phenylephrine, prototype) [D]
        if (DRUGS[a.drug].delayS) pend = [...pend, { drug: a.drug, amt, at: ctx.t + DRUGS[a.drug].delayS }];
        else add[a.drug] = (add[a.drug] || 0) + amt;
      }
      else if (a.type === 'infusion') {
        inf = { ...inf };
        if (a.rate > 0) inf[a.drug] = rateAmount(a.drug, a.rate, a.unit, wt); else delete inf[a.drug];
      }
    }
    // delayed boluses that arrive this step
    if (pend.length) {
      for (const x of pend) if (x.at <= ctx.t + 1e-9) add[x.drug] = (add[x.drug] || 0) + x.amt;
      pend = pend.filter(x => x.at > ctx.t + 1e-9);
    }
    const d = {}, pumps = prev.pump || {};
    for (const id in s.p) {
      const cur = s.d[id], fromPump = pumps[id] ? pumps[id].rate : 0;
      if (!cur && !add[id] && !inf[id] && !fromPump) continue; // a drug never given costs nothing
      const k = s.p[id];
      const nx = advance(k, cur || empty(k), (inf[id] || 0) + fromPump, dtMin);
      if (add[id]) nx.a1 += add[id];
      d[id] = nx;
    }
    // neuromuscular drugs (nmb.js): stepped once any has been given
    const nm = s.nm || Object.keys(nmAdd).length ? stepNm(s.nm || emptyNm(), nmAdd, prev.patient, dtMin) : null;
    return { ...s, d, inf, nm, pend };
  },
  trend(s) {
    const out = {};
    for (const id in s.d) out[`cp_${id}`] = s.d[id].a1 / s.p[id].V1;
    return out;
  },
};

// concentrations in the drug's conc unit (0 for a drug never given)
export const cp = (state, id) => (state.pk.d[id] ? state.pk.d[id].a1 / state.pk.p[id].V1 : 0);
export const ce = (state, id) => (state.pk.d[id] ? state.pk.d[id].ce : 0);
export const ceHaemo = (state, id) => (state.pk.d[id] && state.pk.d[id].ceH != null ? state.pk.d[id].ceH : 0);
