// Fluids, blood and bleeding (MODEL.md section 5, "Fluids and blood"): pure helpers that cardio.js calls each step, so
// the circulation's volumes stay in one slice and blood volume is accounted for exactly.
//
// Intravascular volume is the three circulation compartments; what enters or leaves goes through the veins.
// - Crystalloid: Hahn's volume kinetics as flows. The infused excess still in the circulation (cx) leaves to the
//   interstitium at k12 and as urine at k10 per minute, both rising with MAP (k12 0.037 and k10 0.009 at MAP 110;
//   0.008 and 0.001 at MAP 60) [S, from Hahn 2021 half-lives]; return from the interstitium is about 0 under
//   anaesthesia (k21 0) [S/D]. Check: 1 L over 30 min at MAP 70 leaves about 80% in the circulation, Hb 150 -> 129.
// - Colloid stays, leaving with a half-life of 2.5 h [S].
// - Red cells in additive solution: 280 mL, haematocrit 0.6 (about 56 g of haemoglobin) [S].
// - Bleeding removes whole blood from the veins: volume and haemoglobin in proportion, and the crystalloid and colloid
//   excess with it.
// Haemoglobin is tracked as a mass; Hb (g/L) = mass / blood volume.

export const PRODUCTS = {
  crystalloid: { name: 'Crystalloid', mlPerMin: 50 },        // a fast drip or pressure bag [D]
  colloid: { name: 'Colloid', mlPerMin: 50 },
  rbc: { name: 'Red cells', unitMl: 280, hbG: 56, mlPerMin: 28 }, // a unit over about 10 min [D]
};
const COLLOID_K = 0.693 / 150; // /min
const MCHC = 333;              // g/L of red cells: Hb = haematocrit x 333 [S]

const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
export function hahnRates(map) {
  const f = clamp01((map - 60) / 50);
  return { k12: 0.008 + 0.029 * f, k10: 0.001 + 0.008 * f };
}

export function initFluids(patient) {
  const bv = patient.bloodVol0 * 1000;
  return { hbMass: (patient.hb0 * bv) / 1000, cx: 0, colloid: 0, isf: 0, urine: 0, bled: 0, given: {}, running: [], bleedRate: 0 };
}

// read the actions for fluids and bleeding: { type: 'fluid', product, ml }, { type: 'bleed', mlPerMin } or { ml }
export function fluidActions(fl, actions) {
  let out = fl;
  for (const a of actions) {
    if (a.type === 'fluid' && PRODUCTS[a.product] && a.ml > 0) {
      out = { ...out, running: [...out.running, { product: a.product, left: a.product === 'rbc' ? PRODUCTS.rbc.unitMl * Math.max(1, Math.round(a.ml / PRODUCTS.rbc.unitMl)) : a.ml }] };
    } else if (a.type === 'fluid' && a.stop) {
      out = { ...out, running: out.running.filter(r => r.product !== a.stop) };
    } else if (a.type === 'bleed') {
      if (a.mlPerMin != null) out = { ...out, bleedRate: Math.max(0, a.mlPerMin) };
      if (a.ml > 0) out = { ...out, bleedNow: (out.bleedNow || 0) + a.ml };
    }
  }
  return out;
}

// one step: returns the new fluid state and dV, the change to the venous volume (mL). bv = current blood volume
export function stepFluids(fl, bv, venous, map, dt) {
  const dtMin = dt / 60;
  let dV = 0, cx = fl.cx, colloid = fl.colloid, hbMass = fl.hbMass;
  const given = { ...fl.given }, running = [];
  for (const r of fl.running) {
    const p = PRODUCTS[r.product], ml = Math.min(r.left, p.mlPerMin * dtMin);
    dV += ml;
    given[r.product] = (given[r.product] || 0) + ml;
    if (r.product === 'crystalloid') cx += ml;
    else if (r.product === 'colloid') colloid += ml;
    else if (r.product === 'rbc') hbMass += (p.hbG * ml) / p.unitMl;
    if (r.left - ml > 1e-9) running.push({ ...r, left: r.left - ml });
  }
  // crystalloid leaves to the interstitium and as urine; colloid slowly
  const { k12, k10 } = hahnRates(map);
  const toIsf = Math.min(cx, cx * k12 * dtMin), toUrine = Math.min(cx - toIsf, cx * k10 * dtMin), colOut = colloid * COLLOID_K * dtMin;
  cx -= toIsf + toUrine; colloid -= colOut;
  dV -= toIsf + toUrine + colOut;
  // bleeding: whole blood from the veins, capped at what the veins hold above a small residue
  const want = fl.bleedRate * dtMin + (fl.bleedNow || 0);
  const bled = Math.max(0, Math.min(want, venous - 50));
  if (bled > 0) {
    const f = bled / bv;
    hbMass -= hbMass * f; cx -= cx * f; colloid -= colloid * f;
    dV -= bled;
  }
  return {
    fl: { ...fl, cx, colloid, hbMass, given, running, isf: fl.isf + toIsf + colOut, urine: fl.urine + toUrine, bled: fl.bled + bled, bleedNow: 0 },
    dV,
  };
}

export const hbOf = (fl, bvMl) => (fl.hbMass * 1000) / bvMl;
export const hctOf = (fl, bvMl) => hbOf(fl, bvMl) / MCHC;
