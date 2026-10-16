// Vasoactive drugs (MODEL.md section 5, "Vasoactive drugs"; research/pd.md section 6): receptor activations from each
// drug's effect-site level, mapped onto the circulation by cardio.js. Activations combine as independent fractions
// (1 - product of (1 - a)). [D for every EC50 and gain here unless marked; the targets they were tuned to are in
// test/vaso.test.mjs.] Levels are in ng/mL (vasopressin mU/L).
//
// Receptors: a1 (arterial and venous constriction), b1 (rate and contractility), b2 (arterial dilation), v1
// (vasopressin), mb (muscarinic block), vt (low-dose atropine vagotonia), bb (beta block), ab (alpha block),
// no (nitrate: venous more than arterial dilation), rel (noradrenaline release, ephedrine, from a store).

// per drug: receptor -> [Emax, EC50]
export const RECEPTORS = {
  phenylephrine: { a1: [1, 6] },                                     // EC50 3-6 (prototype), saturating
  noradrenaline: { a1: [1, 1.5], b1: [0.3, 6] },                     // 8-10 mcg about phenylephrine 100 (Ngan Kee 2017)
  adrenaline: { b1: [1, 0.4], b2: [0.9, 0.2], a1: [1, 2.5] },          // beta at low, alpha at high levels (Clutter 1980)
  vasopressin: { v1: [1, 40] },                                      // mU/L
  metaraminol: { a1: [0.8, 60], b1: [0.15, 200] },                   // off by default (not on the HSA register)
  ephedrine: { a1: [0.15, 150], b1: [0.2, 100], rel: [1, 15] },      // mostly indirect
  atropine: { mb: [1, 2], vt: [0.12, 0.4] },                         // biphasic: brief slowing at low doses [U]
  glycopyrrolate: { mb: [1, 3] },
  esmolol: { bb: [0.85, 250] },
  labetalol: { bb: [0.8, 25], ab: [0.7, 60] },                       // alpha:beta about 1:7 [U]
  gtn: { no: [1, 0.5] },
};
// what noradrenaline released by ephedrine acts as (per unit of release) and how the store depletes and refills
const REL_AS_NA = { a1: 0.8, b1: 0.4 };
export const STORE = { use: 0.35, refillMin: 30 }; // fraction used per minute at full release; refill time constant

const sat = (c, ec50) => (c > 0 ? c / (c + ec50) : 0);

// activations from effect-site levels (ce: drug -> level) and the noradrenaline store (0-1)
export function activations(ce, store = 1) {
  const keep = { a1: 1, b1: 1, b2: 1, v1: 1, mb: 1, vt: 1, bb: 1, ab: 1, no: 1, rel: 1 };
  for (const drug in RECEPTORS) {
    const c = ce[drug] || 0;
    if (!(c > 0)) continue;
    for (const r in RECEPTORS[drug]) {
      const [emax, ec50] = RECEPTORS[drug][r];
      keep[r] *= 1 - emax * sat(c, ec50);
    }
  }
  const A = {};
  for (const r in keep) A[r] = 1 - keep[r];
  // released noradrenaline depends on what is left in the store
  const rel = A.rel * store;
  A.a1 = 1 - (1 - A.a1) * (1 - REL_AS_NA.a1 * rel);
  A.b1 = 1 - (1 - A.b1) * (1 - REL_AS_NA.b1 * rel);
  A.relNow = rel;
  return A;
}

// the effect on the circulation [D]: multipliers and shifts cardio.js applies
export function vasoEffects(A) {
  return {
    svr: (1 + 1.0 * A.a1 + 0.8 * A.v1) * (1 - 0.5 * A.b2) * (1 - 0.3 * A.no) * (1 - 0.4 * A.ab),
    vu: -150 * A.a1 - 100 * A.v1 + 600 * A.no,       // mL of venous unstressed volume (constriction lowers it)
    hrSym: 1 - A.bb,                                   // scales the sympathetic heart-period limb
    b1: A.b1,                                          // direct beta-1 drive on the heart period and Ees
    ees: (1 + 0.5 * A.b1) * (1 - 0.3 * A.bb),
    vagal: 1 - A.mb,                                   // scales vagal drive (atropine, glycopyrrolate)
    vt: A.vt * (1 - A.mb),                             // low-dose vagotonia
  };
}

// one step of the noradrenaline store
export const stepStore = (store, relNow, dtMin) => Math.min(1, Math.max(0, store - STORE.use * relNow * dtMin + ((1 - store) / STORE.refillMin) * dtMin));
