// Circulation (MODEL.md section 5): a mean-value core stepped at dt, with each beat's stroke volume latched at the beat.
// Three compartments (systemic arteries, systemic veins, pulmonary), P = (V - Vu)/C floored at 0. Every flow is
// computed once per step and moved from its source to its destination (flux transfer), capped at the volume
// available, so blood volume is conserved to rounding. Units: mL, mmHg, s; resistances mmHg·s/mL.
//
// Each step the atrial pressures are solved by bisection so venous return matches what the ventricle would eject
// from that filling (Starling); at each beat (rhythm.js, previous step) the stroke volumes are latched from the
// pressure-loaded end-systolic relation SV = EDV - V0 - (P_downstream - Ppl)/Ees and delivered as SV/RR until the
// next beat. Pulse pressure is display-only (PP = 0.9·SV/Ca).
//
// Baroreflex (Ursino 1998, simplified): filtered MAP -> sigmoid -> sympathetic s and vagal v = 1 - s -> heart period,
// SVR, venous unstressed volume and Ees, each through a delay and a first-order lag. Drug and stimulus drives act on
// s, v and the effectors.

import { exp, log } from './fmath.js';
import { ceREq } from './pd.js';
import { initFluids, fluidActions, stepFluids, hbOf } from './fluids.js';
import { RECEPTORS, activations, vasoEffects, stepStore } from './vaso.js';

// defaults (MODEL.md section 5 and the prototype) [S/D]
export const CV = {
  map: 90, co: 5.4, hr: 72, cvp: 4, lap: 8, pp: 12,      // targets for the default patient
  Ca: 1.5, Cv: 125, Cp: 25,                             // mL/mmHg
  Rvr: 0.06,                                            // venous return resistance
  fracA: 750 / 4900, fracP: 600 / 4900,                 // share of blood volume in the arteries, the lungs
  lv: { V0d: 10, beta: 0.03, V0: 5, Ees: 1.58 },        // LV: EDPVR offset, stiffness, ESPVR intercept, elastance
  rv: { V0d: 40, beta: 0.025, V0: 50, Ees: 0.6 },
  ppFactor: 0.9,                                        // pulse pressure = 0.9·SV/Ca (display) [D]
  fillTau: 0.08, tSys: 0.3,                             // s: diastolic filling time constant, systole [D]
};
// baroreflex [V for the HR and Ees limbs, D for the rest]: sigmoid width k; heart period T0 + aV·v - aS·s (aV, aS
// solved per patient so resting HR is 72 at 40 y with T0 from the intrinsic rate); effector delay (s), lag (s), gain
export const BARO = {
  k: 12, tauMap: 2,
  aV: 0.66, aS: 0.2525,
  hpV: [0.2, 1.5], hpS: [2, 2], svr: [2, 6, 1.0], vu: [5, 20, 2000], ees: [2, 8, 0.6],
};
const HIST_S = 5; // s of sympathetic drive kept for the delays
// opioid vagal gain (HR about 60 at remifentanil 4-8 ng/mL with propofol at P_TOL 0.9, van den Berg 2021) and the
// stimulus gain (laryngoscopy at P_TOL 0.9: SBP +19 to +32, HR +6 to +10) [D, calibrated in M2.1]
export const TUNE = { vagal: 1.0, auto: 1.4 };


// end-diastolic volume from the transmural filling pressure (EDPVR), clamped so the log is defined
export const edv = (side, A, ptm) => side.V0d + log(1 + Math.max(ptm, -0.9 * A) / A) / side.beta;

// the propofol, opioid, volatile and stimulus drives on the circulation [D, MODEL.md section 5]
export function drives(prev) {
  const d = prev.pk ? prev.pk.d : {}, ceH = d.propofol && d.propofol.ceH ? d.propofol.ceH : 0;
  const ceR = ceREq(d.remifentanil ? d.remifentanil.ce : 0, d.fentanyl ? d.fentanyl.ce : 0);
  // propofol, haemodynamic effect site; C50 falls with age so the elderly fall further (Kazama 1999) [D]
  const eP = ceH / (ceH + 1.0 / (1 + 0.02 * Math.max(0, prev.patient.age - 40)));
  const eR = ceR / (ceR + 2.0);                       // opioid, saturating [D]
  const mac = (prev.vol && prev.vol.mac ? prev.vol.mac : 0) + (prev.patient.macStub || 0); // macStub: a test hook
  const m = Math.min(1, mac / 1.6);
  const vmac = Math.min(2, mac); // volatile vasodilation and depression, capped [D]
  // vasoactive drugs (vaso.js) at their effect sites
  const ce = {};
  for (const id in RECEPTORS) if (d[id]) ce[id] = d[id].ce;
  const A = activations(ce, prev.cv ? prev.cv.store ?? 1 : 1), V = vasoEffects(A);
  return {
    eP, eR, mac, A, V,
    symScale: 1 - 0.3 * eP,                           // sympathetic tone (MSNA falls at induction, Ebert 1992)
    svr: (1 - 0.15 * eP) * (1 - 0.075 * eR) * (1 - 0.2 * vmac) * V.svr,
    vu: 100 * eP + V.vu,
    ees: (1 - 0.1 * eP) * (1 - 0.1 * vmac) * V.ees,
    setShift: -15 * eP - 14 * vmac,  // volatiles reset the baroreflex lower too [D]
    gHR: (1 - 0.75 * m) * (1 - 0.3 * eP),             // reflex gain on the heart-period limbs
    gVasc: (1 - 0.5 * m) * (1 - 0.3 * eP),            // milder, on the vascular limbs
    vagal: TUNE.vagal * eR,                         // opioid vagal tone, upstream of the reflex
    auto: prev.pd ? prev.pd.auto : 0,                 // stimulus (pd.js)
    awake: !(prev.pd && prev.pd.asleep),
  };
}

// solve the atrial pressure on one side: venous return (Pup - P)/R equals what the ventricle ejects from that
// filling, SV(P)/RR. Bisection on [lo, Pup], 20 iterations; flow-limited at lo when the heart could pump more.
function solveAtrium(side, A, ees, Pup, R, Pdown, ppl, rr, fill, lo) {
  const sv = P => Math.max(0, fill * (edv(side, A, P - ppl) - side.V0d) + side.V0d - side.V0 - Math.max(0, Pdown - ppl) / ees);
  const g = P => (Pup - P) / R - sv(P) / rr;
  if (!(Pup > lo) || g(lo) <= 0) {
    const P = Math.max(lo, Math.min(Pup, lo));
    return { P, sv: Math.max(0, Math.min(sv(P), ((Pup - P) / R) * rr)) };
  }
  let a = lo, b = Pup;
  for (let i = 0; i < 20; i++) { const mid = (a + b) / 2; if (g(mid) > 0) a = mid; else b = mid; }
  const P = (a + b) / 2;
  return { P, sv: ((Pup - P) / R) * rr };
}

// a lag towards a target with time constant tau
const lag = (x, target, dt, tau) => x + (target - x) * (dt / tau);

export const cardio = {
  name: 'cv',
  init(state) {
    const p = state.patient, BV = p.bloodVol0 * 1000;
    const rr = 60 / CV.hr, sv = (CV.co * 1000) / 60 * rr, q = sv / rr;
    const Va = BV * CV.fracA, Vp = BV * CV.fracP, Vv = BV - Va - Vp;
    const Psv = CV.cvp + CV.Rvr * q;
    const lvEdv = sv + CV.lv.V0 + CV.map / CV.lv.Ees, rvEdv = sv + CV.rv.V0 + CV.pp / CV.rv.Ees;
    const fill0 = 1 - exp(-(rr - CV.tSys) / CV.fillTau);
    // the patient's heart-period amplitudes: resting HR 72 from their own intrinsic rate (MODEL.md section 5)
    const T0 = 60 / p.ihr, f = (2 * (rr - T0)) / (BARO.aV - BARO.aS);
    const fixed = {
      Vua: Va - CV.map * CV.Ca, Vuv: Vv - Psv * CV.Cv, Vup: Vp - CV.pp * CV.Cp,
      Rsys: (CV.map - Psv) / q, Rpv: (CV.pp - CV.lap) / q,
      // EDPVR constants so the targets close (filling is normalised to 1 at the resting rate)
      Alv: CV.lap / (exp(CV.lv.beta * (lvEdv - CV.lv.V0d)) - 1),
      Arv: CV.cvp / (exp(CV.rv.beta * (rvEdv - CV.rv.V0d)) - 1),
      T0, aV: BARO.aV * f, aS: BARO.aS * f, k: BARO.k / p.baroGain, fill0, edv0: lvEdv, set: CV.map,
    };
    return {
      fx: fixed, Va, Vv, Vp,
      svL: sv, svR: sv, rr, hp: rr, mapF: CV.map,
      sHist: new Array(Math.round(HIST_S / state.dt) + 1).fill(0.5),
      eff: { hpV: 0.5, hpS: 0.5, svr: 0.5, vu: 0.5, ees: 0.5 },
      hr: CV.hr, map: CV.map, sbp: 0, dbp: 0, cvp: CV.cvp, lap: CV.lap, co: CV.co, svr: 0, edvL: lvEdv, s: 0.5, dc: 0,
      fl: initFluids(p), bloodVol: BV, hb: p.hb0,
    };
  },
  step(prev, ctx) {
    const c = prev.cv, fx = c.fx, dt = ctx.dt, D = drives(prev);
    const ppl = prev.resp && prev.resp.pplMmHg ? prev.resp.pplMmHg : 0;
    // effectors (lagged drives), applied
    const Rsys = fx.Rsys * (1 + BARO.svr[2] * (c.eff.svr - 0.5)) * D.svr;
    const Vuv = fx.Vuv - BARO.vu[2] * (c.eff.vu - 0.5) + D.vu;
    const eesL = CV.lv.Ees * (1 + BARO.ees[2] * (c.eff.ees - 0.5)) * D.ees, eesR = CV.rv.Ees * (1 + BARO.ees[2] * (c.eff.ees - 0.5)) * D.ees;
    // pressures
    const Psa = Math.max(0, (c.Va - fx.Vua) / CV.Ca), Psv = Math.max(0, (c.Vv - Vuv) / CV.Cv), Pp = Math.max(0, (c.Vp - fx.Vup) / CV.Cp) + ppl;
    // filling and the atria (solved with the current beat interval)
    const fill = Math.min(1, (1 - exp(-Math.max(0.05, c.rr - CV.tSys) / CV.fillTau)) / fx.fill0);
    const R = solveAtrium(CV.rv, fx.Arv, eesR, Psv, CV.Rvr, Pp, ppl, c.rr, fill, ppl);
    const L = solveAtrium(CV.lv, fx.Alv, eesL, Pp, fx.Rpv, Psa, ppl, c.rr, fill, 0);
    // the rhythm's mechanical effectiveness (rhythm.js): 1 for sinus, less for the fast and poorly-filled rhythms,
    // 0 for VF, asystole and PEA. A non-perfusing rhythm makes an output only through chest compressions
    // (resus.js, resus.cprFrac); without compressions the arterial pressure decays (the Schipke curve) [D]
    const rhOut = prev.rh && prev.rh.output != null ? prev.rh.output : 1;
    const perfusing = !(prev.rh && prev.rh.perfusing === false);
    const cprFrac = prev.resus ? prev.resus.cprFrac : 0;
    const out = perfusing ? rhOut : cprFrac;
    // beats in the previous step latch new stroke volumes and the interval
    let svL = c.svL, svR = c.svR, rr = c.rr, edvL = c.edvL;
    const beats = prev.rh ? prev.rh.events : [];
    for (const b of beats) {
      rr = Math.max(0.25, b.rr || rr);
      svR = R.sv; svL = L.sv;
      edvL = edv(CV.lv, fx.Alv, L.P - ppl);
      const pp = (CV.ppFactor * svL * out) / CV.Ca;
      ctx.emit({ kind: 'beat', t: b.t, rr, morph: b.morph || 'sinus', sv: svL * out, sbp: Psa + (2 / 3) * pp, dbp: Psa - pp / 3 });
    }
    // flows over this step (mL), capped at what is available; gated by the rhythm's effectiveness
    const qL = Math.min((svL * out / rr) * dt, Math.max(0, c.Vp - 1)), qR = Math.min((svR * out / rr) * dt, Math.max(0, c.Vv - 1));
    // arterial drainage. In a non-perfusing rhythm with no compressions, arteriolar tone is kept, so the arterial
    // pressure decays slowly towards the mean filling pressure (Schipke 2003: about 24 mmHg at 13 s) rather than
    // collapsing at once; once compressions (or any perfusing rhythm) produce flow, drainage is normal again [D].
    const arrest = !perfusing && cprFrac <= 0;
    const qS = Math.min(Math.max(0, (Psa - Psv) / (arrest ? Rsys * 6 : Rsys)) * dt, Math.max(0, c.Va - 1));
    // fluids in and blood out through the veins (fluids.js)
    const F = stepFluids(fluidActions(c.fl, ctx.actions), c.Va + c.Vv + c.Vp, c.Vv, Psa, dt);
    const Va = c.Va + qL - qS, Vv = c.Vv + qS - qR + F.dV, Vp = c.Vp + qR - qL;
    const bloodVol = Va + Vv + Vp;

    // baroreflex: filtered MAP, sigmoid, delays and lags
    const mapF = lag(c.mapF, Psa, dt, BARO.tauMap);
    let s = 1 / (1 + exp((mapF - (fx.set + D.setShift)) / fx.k));
    // decompensation of the empty ventricle (awake only) [D]
    const dc = D.awake ? 1 / (1 + exp((edvL - 0.53 * fx.edv0) / 1.5)) : 0;
    const sHist = c.sHist.slice(1); sHist.push(s);
    const sAt = delay => sHist[sHist.length - 1 - Math.round(delay / dt)];
    // anaesthetic blunting scales each limb's deviation from rest; propofol scales sympathetic tone; the empty
    // ventricle withdraws sympathetic drive from the HR and SVR limbs and adds vagal drive; opioids add vagal tone
    // a stimulus adds sympathetic drive on top of the (blunted) reflex, calibrated to the laryngoscopy response [D]
    const center = (x, g) => Math.min(1, 0.5 + g * (x - 0.5) + TUNE.auto * D.auto);
    const symp = (delay, g) => center(sAt(delay), g) * D.symScale;
    const vag = Math.max(0, 1 - center(sAt(BARO.hpV[0]), D.gHR));
    const vagHR = Math.min(1, vag + D.vagal * (1 - vag) + 0.7 * dc);
    const eff = {
      hpV: lag(c.eff.hpV, vagHR, dt, BARO.hpV[1]),
      hpS: lag(c.eff.hpS, symp(BARO.hpS[0], D.gHR) * (1 - 0.8 * dc), dt, BARO.hpS[1]),
      svr: lag(c.eff.svr, symp(BARO.svr[0], D.gVasc) * (1 - 0.8 * dc), dt, BARO.svr[1]),
      vu: lag(c.eff.vu, symp(BARO.vu[0], D.gVasc), dt, BARO.vu[1]),
      ees: lag(c.eff.ees, symp(BARO.ees[0], D.gVasc), dt, BARO.ees[1]),
    };
    // heart period: intrinsic period, slowed by vagal and quickened by sympathetic drive
    // drugs act on the lagged limbs: muscarinic block scales vagal drive, beta block the sympathetic drive, beta-1
    // agonists add to it (vaso.js)
    const hp = Math.max(0.3, fx.T0 + fx.aV * Math.min(1, eff.hpV * D.V.vagal + D.V.vt) - fx.aS * (eff.hpS * D.V.hrSym + D.V.b1));
    const store = stepStore(c.store ?? 1, D.A.relNow, dt / 60);
    const pp = (CV.ppFactor * svL * out) / CV.Ca, co = (svL * out / rr) * 0.06;
    return {
      ...c, Va, Vv, Vp, svL, svR, rr, hp, mapF, sHist, eff, edvL, s, dc, fl: F.fl, bloodVol, hb: hbOf(F.fl, bloodVol), store,
      hr: 60 / rr, map: Psa, sbp: Psa + (2 / 3) * pp, dbp: Psa - pp / 3, cvp: R.P, lap: L.P, pa: Pp, co,
      svr: co > 0 ? ((Psa - R.P) / co) : 0, // Wood units (mmHg·min/L)
    };
  },
  rebase(c) { return c; },
  trend(c) { return { hr: c.hr, sbp: c.sbp, dbp: c.dbp, map: c.map, co: c.co, cvp: c.cvp, hb: c.hb, bloodVol: c.bloodVol }; },
};

// total blood volume in the circulation, mL (tests)
export const bloodVolume = c => c.Va + c.Vv + c.Vp;
