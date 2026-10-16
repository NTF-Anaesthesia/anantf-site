// Neuromuscular drugs (MODEL.md section 2): rocuronium, sugammadex, suxamethonium and neostigmine. Called by pk.js,
// which owns the state (pk.nm). Amounts in mg (neostigmine in mcg); concentrations in mg/L = mcg/mL (neostigmine
// mcg/L = ng/mL). Rate constants per minute.

const MW_ROC = 609.7;      // g/mol, rocuronium bromide (label) [V]
const MW_SGX = 2178;       // g/mol, sugammadex (label) [V]
const KD = 0.0559;         // µmol/L, rocuronium-sugammadex complex (Kleijn 2011, in vitro) [V]

// rocuronium effect sites [D, tuned in M1.3 against the label and the sugammadex and neostigmine trials, all read on
// acceleromyography like the TOF readout in pd.js]: one directional ke0 (0.2 while the site fills: 80% block at about
// 1.0 min, label; 0.9 while it empties: sugammadex reversal times); Ce50 at the thumb 0.95 mcg/mL, Hill 3.5. The other
// sites scale the Ce50 (diaphragm x 1.9 [V ratio, Cantineau 1994], upper-airway dilators x 0.7 [D], larynx x 1.73
// [V ratio, Plaud 1995]) and the ke0 (larynx and diaphragm equilibrate faster: t1/2ke0 2.7 vs 4.4 min, Plaud 1995)
export const ROC = { ke0On: 0.2, ke0Off: 0.9, ce50: 0.95, hill: 3.5 };
export const SITES = {
  thumb: { ce50: 1, ke0: 1 },
  diaphragm: { ce50: 1.9, ke0: 4.4 / 2.7 },
  upperAirway: { ce50: 0.7, ke0: 1 },
  larynx: { ce50: 1.73, ke0: 4.4 / 2.7 },
};
// suxamethonium, Roy 2002: V 0.038 L/kg, hydrolysis 0.97/min [V]; ke0 0.29, Ce50 0.825 mcg/mL, Hill 4 [D, tuned to
// Lee 2009: T1 10% 7.1 min, T1 90% 10.9 min after 1 mg/kg]. Phase II from 3 mg/kg total, complete by 5 [V, Lee 1975]
export const SUX = { vPerKg: 0.038, k: 0.97, ke0: 0.29, ce50: 0.825, hill: 4 };
// sugammadex [D]: distributes with rocuronium's volumes and inter-compartment clearance; cleared renally at
// 0.088 L/min (Kleijn: complex PK = free sugammadex PK; t1/2 about 2 h) [V for CL]
const SGX_CL = 0.088;
// neostigmine [D]: one compartment, 0.7 L/kg, elimination t1/2 80 min; effect site ke0 0.65 (peak about 7 min after
// a bolus: MODEL.md 5-10 min); it raises rocuronium's Ce50 by up to 2 times, half at 20 ng/mL, tuned to Kopman 2005
// (50 mcg/kg at TOF count 1) and Blobner 2010 (50 mcg/kg at T2: TOFR 0.9 in 18.6 min). The ceiling is what makes it
// slow from a deep block (Jones 2008: 50 min; the model 32 min, a known miss)
export const NEO = { vPerKg: 0.7, k: 0.693 / 80, ke0: 0.65, ec50: 20, max: 2 };

export function rocKinetics(weightKg) {
  // Kleijn 2011 [V]: V1 4.73, V2 6.76 L per 70 kg; CL 0.269, Q2 0.279 L/min x (W/70)^0.75
  const w = weightKg / 70, V1 = 4.73 * w, V2 = 6.76 * w;
  const w075 = w / Math.sqrt(Math.sqrt(w)); // w^0.75 = w / w^0.25 (exact: sqrt only)
  return { V1, V2, CL: 0.269 * w075, Q2: 0.279 * w075 };
}

// free rocuronium (µmol/L) from totals R and S (µmol/L): the root of r^2 + (S - R + KD) r - KD R = 0, written so it
// never subtracts two near-equal numbers
export function freeRoc(R, S) {
  if (R <= 0) return 0;
  const b = S - R + KD, d = Math.sqrt(b * b + 4 * KD * R);
  return b >= 0 ? (2 * KD * R) / (b + d) : (d - b) / 2;
}

export const emptyNm = () => ({
  roc: { a1: 0, a2: 0, ce: { thumb: 0, diaphragm: 0, upperAirway: 0, larynx: 0 } },
  sgx: { s1: 0, s2: 0 },
  sux: { a: 0, ce: 0, total: 0 },
  neo: { a: 0, ce: 0 },
});

// one step of dtMin minutes. add: amounts given this step { rocuronium (mg), suxamethonium (mg), sugammadex (mg),
// neostigmine (mcg) }. Returns a new nm (pure).
export function stepNm(nm, add, p, dtMin) {
  const kin = rocKinetics(p.weightKg);
  const { roc, sgx, sux, neo } = nm;
  // binding equilibrium in the central compartment (both drugs share V1)
  const R = (roc.a1 / kin.V1) * (1000 / MW_ROC), S = (sgx.s1 / kin.V1) * (1000 / MW_SGX);
  const rFree = freeRoc(R, S), cplx = R - rFree; // µmol/L
  const freeA1 = (rFree * kin.V1 * MW_ROC) / 1000, cplxRocA = (cplx * kin.V1 * MW_ROC) / 1000; // mg
  const freeS1 = Math.max(0, sgx.s1 - (cplx * kin.V1 * MW_SGX) / 1000);
  const cpFree = freeA1 / kin.V1; // mcg/mL
  // rocuronium: free drug distributes and is cleared; the complex leaves at the sugammadex clearance
  const k12 = kin.Q2 / kin.V1, k21 = kin.Q2 / kin.V2, k10 = kin.CL / kin.V1, kS = SGX_CL / kin.V1;
  const fR = k12 * freeA1 - k21 * roc.a2;
  const a1 = roc.a1 + (-k10 * freeA1 - kS * cplxRocA - fR) * dtMin + (add.rocuronium || 0);
  const a2 = roc.a2 + fR * dtMin;
  // sugammadex: free drug distributes; free and complexed are cleared renally
  const fS = k12 * freeS1 - k21 * sgx.s2;
  const s1 = sgx.s1 + (-kS * sgx.s1 - fS) * dtMin + (add.sugammadex || 0);
  const s2 = sgx.s2 + fS * dtMin;
  // effect sites follow free plasma rocuronium, faster while emptying
  const ce = {};
  for (const site in SITES) {
    const c = roc.ce[site], k = (cpFree > c ? ROC.ke0On : ROC.ke0Off) * SITES[site].ke0;
    ce[site] = c + k * (cpFree - c) * dtMin;
  }
  // suxamethonium: hydrolysed in plasma (the patient's cholinesterase scales the rate)
  const V = SUX.vPerKg * p.weightKg, suxCp = sux.a / V;
  const suxN = {
    a: sux.a - SUX.k * (p.che ?? 1) * sux.a * dtMin + (add.suxamethonium || 0),
    ce: sux.ce + SUX.ke0 * (suxCp - sux.ce) * dtMin,
    total: sux.total + (add.suxamethonium || 0),
  };
  // neostigmine
  const Vn = NEO.vPerKg * p.weightKg, neoCp = neo.a / Vn;
  const neoN = { a: neo.a - NEO.k * neo.a * dtMin + (add.neostigmine || 0), ce: neo.ce + NEO.ke0 * (neoCp - neo.ce) * dtMin };
  return {
    roc: { a1: Math.max(0, a1), a2: Math.max(0, a2), ce, cpFree },
    sgx: { s1: Math.max(0, s1), s2: Math.max(0, s2), free: freeS1 / kin.V1 },
    sux: suxN, neo: neoN,
  };
}
