// Volatile agents and N2O (MODEL.md section 3): the circle circuit (fresh gas, vaporiser, rebreathing), uptake into
// three tissue groups (De Wolf 2012 Gas Man), the agent effect sites and the age-adjusted MAC fraction. Owns vol.fi
// (inspired fraction), vol.ce (effect-site fraction), vol.pv (mixed venous), vol.mac; pd.js, resp.js, cardio.js and
// gas.js read these. Continuous ventilation; the agent waveform is drawn in synth.js.
//
// Everything is a fraction of an atmosphere (2% sevoflurane = 0.02). λbg is blood:gas; the tissue coefficients are
// tissue:blood (so tissue:gas = λbg x tissue:blood), at 37 C [V, Yasuda 1989]. Volumes L, flows L/min.

import { pow10 } from './fmath.js';

export const AGENTS = {
  sevoflurane: { name: 'Sevoflurane', lb: 0.65, brain: 1.7, muscle: 3.1, fat: 47.5, mac40: 0.018, ke0: 0.48, max: 8 },
  desflurane: { name: 'Desflurane', lb: 0.42, brain: 1.3, muscle: 2.0, fat: 27.2, mac40: 0.066, ke0: (0.48 * 1.3) / 1.7, max: 18 },
  isoflurane: { name: 'Isoflurane', lb: 1.4, brain: 1.6, muscle: 2.9, fat: 44.9, mac40: 0.0117, ke0: (0.48 * 1.6) / 1.7, max: 5 },
  nitrous: { name: 'Nitrous oxide', lb: 0.47, brain: 1.1, muscle: 1.2, fat: 2.3, mac40: 1.04, ke0: (0.48 * 1.1) / 1.7, max: 0.75 },
};
const GROUPS = [
  { k: 'vrg', tb: 'brain', vol: 6, flow: 0.758 },   // vessel-rich group
  { k: 'mus', tb: 'muscle', vol: 33, flow: 0.18 },
  { k: 'fat', tb: 'fat', vol: 14.5, flow: 0.06 },
];
export const CIRCUIT = 8;
export const macAt = (mac40, age) => mac40 * pow10(-0.00269 * (age - 40)); // Mapleson 1996 [V]

const empty = () => { const t = {}; for (const id in AGENTS) t[id] = { fc: 0, fa: 0, ce: 0, vrg: 0, mus: 0, fat: 0 }; return t; };

export const volatile = {
  name: 'vol',
  init() { return { t: empty(), dial: {}, fgf: { o2: 1, air: 0, n2o: 0 }, mac: 0, fi: {}, ce: {}, pv: {} }; },
  step(prev, ctx) {
    const v = prev.vol, p = prev.patient, dt = ctx.dt / 60; // min
    const q = prev.cv ? prev.cv.co : 5.4;
    const r = prev.resp || { va: 4000 };
    const va = Math.max(0.01, r.va) / 1000, frc = p.frc0 || 2;
    let dial = v.dial, fgf = v.fgf;
    for (const a of ctx.actions) {
      if (a.type === 'vaporiser' && AGENTS[a.agent]) dial = { ...dial, [a.agent]: Math.max(0, Math.min(AGENTS[a.agent].max, +a.dial || 0)) };
      else if (a.type === 'fgf') fgf = { o2: Math.max(0, +a.o2 || 0), air: Math.max(0, +a.air || 0), n2o: Math.max(0, +a.n2o || 0) };
    }
    const fgfTotal = Math.max(0.01, fgf.o2 + fgf.air + fgf.n2o);
    // first pass: each agent's blood uptake and tissue update, and the circuit fraction
    const up = {}, grpAll = {}, fc = {};
    for (const id in AGENTS) {
      const ag = AGENTS[id], s = v.t[id], Pa = s.fa, grp = {};
      let uptake = 0; // L agent/min into blood
      for (const g of GROUPS) {
        const Pg = s[g.k];
        grp[g.k] = Pg + (q * g.flow * (Pa - Pg)) / (g.vol * ag[g.tb]) * dt;
        uptake += q * g.flow * ag.lb * (Pa - Pg);
      }
      up[id] = uptake; grpAll[id] = grp;
      const fresh = id === 'nitrous' ? fgf.n2o / fgfTotal : (dial[id] || 0) / 100;
      const overflow = Math.max(0, fgfTotal - Math.max(0, uptake));
      fc[id] = Math.max(0, s.fc + (fgfTotal * fresh + va * Pa - overflow * s.fc - va * s.fc) / CIRCUIT * dt);
    }
    // the concentration effect: total gas taken up is replaced by extra inspired inflow (mostly N2O)
    let totalUp = 0; for (const id in up) totalUp += Math.max(0, up[id]);
    const t = {}, fi = {}, ce = {}, pv = {}, macParts = {};
    for (const id in AGENTS) {
      const ag = AGENTS[id], s = v.t[id], Pa = s.fa;
      const fa = Math.max(0, Pa + ((va + totalUp) * fc[id] - va * Pa - up[id]) / frc * dt);
      const cePP = s.ce + ag.ke0 * (Pa - s.ce) * dt;
      t[id] = { fc: fc[id], fa, ce: cePP, ...grpAll[id] };
      fi[id] = fc[id]; ce[id] = cePP; pv[id] = grpAll[id].vrg;
      macParts[id] = cePP / macAt(ag.mac40, p.age);
    }
    let mac = 0; for (const id in macParts) mac += macParts[id];
    return { t, dial, fgf, mac, fi, ce, pv };
  },
  trend(v) { return { mac: v.mac }; },
};
