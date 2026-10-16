// Drug catalogue (MODEL.md section 2): data, no logic. Each drug names its PK model (pk.js MODELS) and the units
// its amounts and concentrations are kept in. Amounts are in `amount` (mg or mcg) and concentrations in `amount`
// per litre, so mg/L reads as mcg/mL and mcg/L as ng/mL (the units the papers use).
//
// Later PRs add presentations for the pump (M1.2), the neuromuscular drugs (M1.3), vasoactive drugs (M2.3) and the
// scenario drugs (M4.0).

export const DRUGS = {
  propofol:     { name: 'Propofol',     amount: 'mg',  conc: 'mcg/mL', model: 'schnider', haemo: true },   // [V] Schnider 1998, 1999
  remifentanil: { name: 'Remifentanil', amount: 'mcg', conc: 'ng/mL',  model: 'minto' },                   // [V] Minto 1997
  fentanyl:     { name: 'Fentanyl',     amount: 'mcg', conc: 'ng/mL',  model: 'shafer' },                  // [V] Shafer 1990; ke0 owner question 8
  alfentanil:   { name: 'Alfentanil',   amount: 'mcg', conc: 'ng/mL',  model: 'maitre' },                  // [V] Maitre 1987
  midazolam:    { name: 'Midazolam',    amount: 'mcg', conc: 'ng/mL',  model: 'albrecht' },                // [V] Albrecht 1999
  ketamine:     { name: 'Ketamine',     amount: 'mg',  conc: 'mcg/mL', model: 'domino' },                  // PK [S] Domino 1982; ke0 [D]
  // neuromuscular drugs: kinetics in nmb.js (M1.3)
  rocuronium:    { name: 'Rocuronium',    amount: 'mg',  conc: 'mcg/mL', model: 'nmb' },                   // [V] Kleijn 2011 PK
  suxamethonium: { name: 'Suxamethonium', amount: 'mg',  conc: 'mcg/mL', model: 'nmb' },                   // [V] Roy 2002 PK
  sugammadex:    { name: 'Sugammadex',    amount: 'mg',  conc: 'mcg/mL', model: 'nmb' },                   // [V] Kleijn 2011
  neostigmine:   { name: 'Neostigmine',   amount: 'mcg', conc: 'ng/mL',  model: 'nmb' },                   // effect model [D]
  // vasoactive drugs (M2.3): PK in pk.js MODELS [D unless marked], receptor effects in vaso.js
  phenylephrine: { name: 'Phenylephrine', amount: 'mcg', conc: 'ng/mL', model: 'anderson', delayS: 20 }, // Anderson 2017 [V] + front end [D]
  noradrenaline: { name: 'Noradrenaline', amount: 'mcg', conc: 'ng/mL', model: 'nora' },   // t1/2 1-2 min [V]
  adrenaline:    { name: 'Adrenaline',    amount: 'mcg', conc: 'ng/mL', model: 'adre' },   // t1/2 2-3 min [V]
  vasopressin:   { name: 'Vasopressin',   amount: 'mU',  conc: 'mU/L',  model: 'vaso' },
  metaraminol:   { name: 'Metaraminol',   amount: 'mcg', conc: 'ng/mL', model: 'meta', hidden: true }, // not on the HSA register
  ephedrine:     { name: 'Ephedrine',     amount: 'mcg', conc: 'ng/mL', model: 'ephe' },   // t1/2 3-6 h [V]
  atropine:      { name: 'Atropine',      amount: 'mcg', conc: 'ng/mL', model: 'atro' },   // t1/2 2-5 h [V]
  glycopyrrolate:{ name: 'Glycopyrrolate',amount: 'mcg', conc: 'ng/mL', model: 'glyc' },
  esmolol:       { name: 'Esmolol',       amount: 'mcg', conc: 'ng/mL', model: 'esmo' },   // t1/2 9 min, CL 285 mL/kg/min [V]
  labetalol:     { name: 'Labetalol',     amount: 'mcg', conc: 'ng/mL', model: 'labe' },   // t1/2 about 4 h [V]
  gtn:           { name: 'GTN',           amount: 'mcg', conc: 'ng/mL', model: 'gtn' },    // t1/2 2-3 min [V]
};

// mass units relative to a microgram, and vasopressin's units relative to a milliunit (a drug's own amount unit
// decides which family applies)
const MASS = { g: 1e6, mg: 1e3, mcg: 1, ng: 1e-3 };
const UNITS = { units: 1e3, mU: 1 };
const family = d => (d.amount in UNITS ? UNITS : MASS);

// a dose in the unit given ('mg', 'mcg', 'mg/kg', 'mcg/kg') as an amount in the drug's own unit
export function doseAmount(drug, dose, unit, weightKg) {
  const d = DRUGS[drug];
  if (!d) throw new Error(`unknown drug ${drug}`);
  const [mass, per] = unit.split('/'), F = family(d);
  if (!(mass in F) || (per && per !== 'kg')) throw new Error(`unknown dose unit ${unit}`);
  return (dose * (per ? weightKg : 1) * F[mass]) / F[d.amount];
}

// an infusion rate ('mg/h', 'mcg/min', 'mg/kg/h', 'mcg/kg/min', ...) as the drug's own amount per minute
export function rateAmount(drug, rate, unit, weightKg) {
  const d = DRUGS[drug];
  if (!d) throw new Error(`unknown drug ${drug}`);
  const parts = unit.split('/'), mass = parts[0], time = parts[parts.length - 1], perKg = parts.length === 3 && parts[1] === 'kg', F = family(d);
  if (!(mass in F) || !(time === 'h' || time === 'min') || (parts.length === 3 && !perKg) || parts.length > 3) throw new Error(`unknown rate unit ${unit}`);
  return (rate * (perKg ? weightKg : 1) * F[mass]) / F[d.amount] / (time === 'h' ? 60 : 1);
}
