// Gas exchange, oxygen and CO2 (MODEL.md section 8; prototype in research/prototypes.md). One alveolar store of volume
// FRC holding O2, CO2 and N2 (agents and N2O join in M2.5), ventilated continuously at the alveolar ventilation resp.js
// sets; the breath-by-breath capnogram is drawn by synth.js from breath events. Net flux rule: the net uptake is
// replaced by bulk inflow of the airway-opening gas while the airway is open; with no ventilation and an obstructed
// airway the store shrinks (floored).
//
// Blood: end-capillary O2 content from PAO2 (Severinghaus 1979), shunt mixes venous blood in, a venous and tissue O2
// pool (Fick). CO2: a body store of 59 mL/mmHg exchanging with the alveolar gas, so apnoea gives a first-minute jump as
// the alveolus equilibrates with venous CO2 and then +VCO2/59 mmHg a minute (Stock 1989).
// Units: mL and mL/min (BTPS for gas), mmHg, contents mL O2 per L of blood.

import { exp } from './fmath.js';

export const PB = 760, PH2O = 47, PDRY = PB - PH2O;
export const GAS = {
  vo2PerKg: 3.5,          // mL/kg/min awake [V]; about -30% asleep (Jakobsson 2021) [V]
  gaVo2: 0.9,
  rq: 0.8,
  shuntAwake: 0.03, shuntGa: 0.08, shuntTau: 10, // min for atelectasis to develop asleep [D]
  peepShunt: 0.004,       // shunt fraction recovered per cmH2O of PEEP [D]
  vaO2: 1.6,              // L: arterial and pulmonary-capillary blood holding O2 (buffers SaO2) [D]
  vvO2: 3.6,              // L: venous and tissue blood holding O2 [D] (5.2 L together, prototype)
  co2Cap: 0.84,           // mL/kg/mmHg body CO2 store (59 mL/mmHg at 70 kg) [D, prototype]
  co2Gap: 6,              // mmHg venous-alveolar CO2 difference at rest, which sets the exchange conductance [D]
  vdAlv: 0.06,            // alveolar dead-space fraction: EtCO2 = PACO2 x (1 - vdAlv) [D]
  flowKnee: 5.0,          // L/min: CO2 clearance follows pulmonary blood flow, saturating at about the resting output
                          // (steady-state EtCO2 is set by VCO2/VA and is flow-independent, so normal and anaesthetised
                          // patients are unaffected; only the low output of arrest and CPR lowers EtCO2) [D]
  stagQ: 2.0, stagRate: 0.6, // L/min knee and per-min rate for arterial-venous O2 stagnation at arrest (SpO2 falls) [D]
};

// Severinghaus 1979 [V]: saturation (0-1) from PO2 (mmHg)
export const sat = p => (p > 0 ? 1 / (23400 / (p * p * p + 150 * p) + 1) : 0);
// O2 content, mL/L, from PO2 and Hb (g/L)
export const content = (p, hb) => 1.34 * hb * sat(p) + 0.03 * p;
// PO2 from content by bisection (contents rise monotonically with PO2)
export function po2Of(c, hb) {
  let lo = 0, hi = 700;
  if (content(hi, hb) <= c) return hi;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (content(m, hb) < c) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

export const gas = {
  name: 'gas',
  init(state) {
    const p = state.patient, frc = p.frc0 * 1000;
    const vo2 = GAS.vo2PerKg * p.weightKg, vco2 = vo2 * GAS.rq;
    // resting state breathing air: PACO2 40, PAO2 from the alveolar gas equation
    const paco2 = 40, pao2 = 0.2093 * PDRY - paco2 * (0.2093 + (1 - 0.2093) / GAS.rq);
    const fa = { o2: pao2 / PDRY, co2: paco2 / PDRY };
    fa.n2 = 1 - fa.o2 - fa.co2;
    const hb = state.cv ? state.cv.hb : p.hb0, q = state.cv ? state.cv.co : 5.4;
    const cc = content(pao2, hb), sh = GAS.shuntAwake;
    const ca = (1 - sh) * cc + sh * (cc - vo2 / q);        // arterial content
    const cvv = ca - vo2 / q;                              // mixed venous content (Fick)
    return {
      vl: frc, fa, vo2, vco2, shunt: sh,
      Qa: ca * GAS.vaO2, Qv: cvv * GAS.vvO2, pvco2: paco2 + GAS.co2Gap,
      fi: { o2: 0.2093, co2: 0, n2: 0.7907 },
      pao2: po2Of(ca, hb), sao2: 0, svo2: 0, paco2, etco2: paco2 * (1 - GAS.vdAlv), pAO2: pao2,
    };
  },
  step(prev, ctx) {
    const g = prev.gas, p = prev.patient, dt = ctx.dt / 60; // min
    const hb = prev.cv.hb, q = Math.max(0.05, prev.cv.co);     // L/min
    const r = prev.resp || { va: 4230, open: true, fio2: 0.21 };
    const asleep = prev.pd && prev.pd.asleep;
    // metabolism (VO2 falls asleep), shunt (atelectasis asleep, PEEP recruits)
    // VO2 scales with a metabolic weight (IBW plus part of the excess), so an obese patient's demand rises less than
    // their weight (about 290 mL/min at 130 kg, MODEL.md section 8) [D]
    const metW = p.ibw + 0.3 * Math.max(0, p.weightKg - p.ibw);
    const vo2 = GAS.vo2PerKg * metW * (asleep ? GAS.gaVo2 : 1) * (p.vo2Scale || 1), vco2 = vo2 * GAS.rq;
    const shTarget = Math.max(0.02, (asleep ? GAS.shuntGa : GAS.shuntAwake) + (p.shuntAdd || 0) + (r.shuntAdd || 0) - GAS.peepShunt * (r.peep || 0));
    const shunt = g.shunt + (shTarget - g.shunt) * (dt / GAS.shuntTau);
    // inspired gas at the airway opening
    const fi = { o2: r.fio2 ?? 0.2093, co2: 0 };
    fi.n2 = 1 - fi.o2;
    // blood: pulmonary end-capillary from the alveolar gas; two O2 pools (arterial buffers SaO2, venous feeds the lung)
    const PAO2 = g.fa.o2 * PDRY, PACO2 = g.fa.co2 * PDRY;
    const cc = content(PAO2, hb), ca = g.Qa / GAS.vaO2, cv = g.Qv / GAS.vvO2;
    const ccLung = (1 - shunt) * cc + shunt * cv;                       // content leaving the lung (shunt admixture)
    const o2Up = Math.max(0, q * (1 - shunt) * (cc - cv));              // mL/min from the lung into the blood
    // CO2: body store <-> alveolus, conductance set so the resting gap is co2Gap; CO2 reaches the lung only as fast as
    // the pulmonary blood flow carries it, so low output (arrest, CPR) lowers EtCO2 — the clinical CPR feedback
    const fFlow = Math.min(1, q / GAS.flowKnee);
    const gCo2 = (GAS.vo2PerKg * GAS.rq * p.weightKg) / GAS.co2Gap;
    const co2Out = fFlow * gCo2 * (g.pvco2 - PACO2);                     // mL/min into the lung
    const pvco2 = g.pvco2 + ((vco2 - co2Out) / (GAS.co2Cap * p.weightKg)) * dt;
    // the lung store: alveolar ventilation out at alveolar fractions, in at inspired fractions plus the net uptake
    const va = r.open ? r.va : 0;
    const net = o2Up - co2Out;                                            // net volume leaving the gas
    const inflow = r.open ? va + net : 0, out = va;
    const amt = { o2: g.fa.o2 * g.vl, co2: g.fa.co2 * g.vl, n2: g.fa.n2 * g.vl };
    amt.o2 += (inflow * fi.o2 - out * g.fa.o2 - o2Up) * dt;
    amt.co2 += (inflow * fi.co2 - out * g.fa.co2 + co2Out) * dt;
    amt.n2 += (inflow * fi.n2 - out * g.fa.n2) * dt;
    for (const k in amt) if (amt[k] < 0) amt[k] = 0;
    // an obstructed lung collapses as gas is absorbed (absorption atelectasis): the volume is just the gas left, never
    // scaled up (that would fabricate oxygen). A small floor keeps the fractions well-defined.
    let vl = amt.o2 + amt.co2 + amt.n2;
    const fa = vl > 1 ? { o2: amt.o2 / vl, co2: amt.co2 / vl, n2: amt.n2 / vl } : { o2: 0, co2: 0, n2: 1 };
    vl = Math.max(vl, 1);
    // arterial pool: blood arrives from the lung at ccLung, leaves to the tissues at the arterial content; venous and
    // tissue pool: receives what the tissues did not consume and returns it to the lung
    let Qa = Math.max(0, g.Qa + (q * ccLung - q * ca) * dt);
    let Qv = Math.max(0, g.Qv + (q * ca - vo2 - q * cv) * dt);
    // stagnation at very low cardiac output (arrest): with almost no flow the arterial and venous pools equilibrate as
    // the tissues keep extracting oxygen, so SaO2 falls over minutes; compressions or a restored rhythm bring flow
    // back and it recovers. Zero above a low output, so the apnoea and steady-state behaviour is unchanged. [D]
    const stag = GAS.stagRate * Math.max(0, 1 - q / GAS.stagQ);
    if (stag > 0) {
      const ceq = (Qa + Qv) / (GAS.vaO2 + GAS.vvO2), mix = Math.min(1, stag * dt);
      Qa += (ceq * GAS.vaO2 - Qa) * mix;
      Qv += (ceq * GAS.vvO2 - Qv) * mix;
    }
    const pao2 = po2Of(ca, hb), paco2 = fa.co2 * PDRY;
    return {
      ...g, vl, fa, vo2, vco2, shunt, Qa, Qv, pvco2, fi,
      pAO2: fa.o2 * PDRY, pao2, sao2: sat(pao2) * 100, svo2: sat(po2Of(cv, hb)) * 100, paco2,
      etco2: va > 0 ? paco2 * (1 - GAS.vdAlv) : g.etco2 * exp(-dt / 0.05), // with no ventilation EtCO2 reads nothing
      etO2: fa.o2 * 100,
    };
  },
  trend(g) { return { sao2: g.sao2, paco2: g.paco2, pao2: g.pao2 }; },
};
