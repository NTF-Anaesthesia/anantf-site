// Pure calculations for the MO guide (no page code), so node can test them: node mo/guide/test/calc.test.mjs
// Every function takes plain numbers and returns plain numbers or objects. Units are in the names.

/** Round to a sensible number of figures for a dose or volume shown to a person. */
export function nice(x) {
  if (x == null || !Number.isFinite(x)) return null;
  const a = Math.abs(x);
  const dp = a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 1 : a >= 0.1 ? 2 : 3;
  const f = 10 ** dp;
  return Math.round(x * f) / f;
}

/** Format a number for display: nice(), no trailing zeros, thousands as plain digits. */
export function fmt(x) {
  const n = nice(x);
  return n == null ? '–' : String(n);
}

export const okNum = (x, lo, hi) => typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi;

// ---------------------------------------------------------------- body size
/**
 * BMI, ideal body weight (Devine), lean body weight (Janmahasatian 2005) and adjusted body weight (IBW + 0.4 × excess).
 * weight in kg, height in cm, sex 'm' | 'f'. Missing height gives only total weight. Devine is extended below 152 cm
 * (it loses about 0.9 kg per cm) down to 120 cm, with a warning under 150 cm; below 120 cm (children) there is no
 * ideal or adjusted weight.
 */
export function bodyWeights({ weight, height, sex } = {}) {
  const out = { tbw: null, bmi: null, ibw: null, lbw: null, abw: null, warnings: [], why: 'no-height' };
  if (!okNum(weight, 0.3, 400)) return out;
  out.tbw = weight;
  if (!okNum(height, 40, 250) || !(sex === 'm' || sex === 'f')) return out;
  out.why = null;
  const m = height / 100;
  out.bmi = weight / (m * m);
  if (height >= 120) {
    out.ibw = Math.max(1, (sex === 'f' ? 45.5 : 50) + 0.91 * (height - 152.4));
    if (out.ibw > weight) out.ibw = weight; // never dose above the real weight
    if (height < 150) out.warnings.push('Ideal weight is less certain under 150 cm: check doses with your consultant.');
  } else { out.why = 'child'; out.warnings.push('Ideal and adjusted weight formulas are for adults: use the children\'s quick sheet.'); }
  out.lbw = sex === 'f' ? (9270 * weight) / (8780 + 244 * out.bmi) : (9270 * weight) / (6680 + 216 * out.bmi);
  out.abw = out.ibw == null ? null : out.ibw + 0.4 * Math.max(0, weight - out.ibw);
  return out;
}

export const WEIGHT_NAMES = { TBW: 'total body weight', IBW: 'ideal body weight', LBW: 'lean body weight', ABW: 'adjusted body weight' };

/** The weight to dose on for a given basis, falling back to total body weight (with a flag) when height is unknown. */
export function dosingWeight(basis, w) {
  const key = { TBW: 'tbw', IBW: 'ibw', LBW: 'lbw', ABW: 'abw' }[basis || 'TBW'] || 'tbw';
  if (w[key] != null) return { kg: w[key], basis: basis || 'TBW', fallback: false };
  return { kg: w.tbw, basis: 'TBW', fallback: (basis || 'TBW') !== 'TBW', why: w.why || 'no-height' };
}

// ---------------------------------------------------------------- doses and volumes
const PER = { 'mg/kg': 'mg', 'mcg/kg': 'mcg', 'mL/kg': 'mL', 'U/kg': 'U', 'mmol/kg': 'mmol', 'g/kg': 'g', 'J/kg': 'J' };

/**
 * A weight-based dose for one patient. dose = { per: [min, max?], unit: 'mg/kg', weight: 'TBW', max?: { value, unit } }.
 * Returns { min, max, unit, kg, basis, fallback, capped } or null if it isn't a per-kg bolus dose or there is no weight.
 */
export function doseFor(dose, w) {
  const unit = PER[dose?.unit];
  if (!unit || !Array.isArray(dose.per) || w?.tbw == null) return null;
  const dw = dosingWeight(dose.weight, w);
  let min = dose.per[0] * dw.kg, max = (dose.per[1] ?? dose.per[0]) * dw.kg, capped = false;
  const cap = dose.max ? convertAmount(dose.max.value, dose.max.unit, unit) : null;
  if (cap != null) {
    if (max > cap) { max = cap; capped = true; }
    if (min > cap) { min = cap; capped = true; }
  }
  return { min, max, unit, kg: dw.kg, basis: dw.basis, fallback: dw.fallback, why: dw.why, capped };
}

const MASS = { g: 1e6, mg: 1000, mcg: 1, ng: 0.001 }; // in mcg

/** An amount in one unit expressed in another (g, mg, mcg, ng convert; anything else only to itself). null if they don't. */
export function convertAmount(value, from, to) {
  if (!Number.isFinite(value)) return null;
  if (from === to) return value;
  if (MASS[from] && MASS[to]) return (value * MASS[from]) / MASS[to];
  return null;
}

/** mL that holds `amount` of `unit` at concentration conc = { value, unit: 'mg/mL' | 'mcg/mL' | 'U/mL' | 'mmol/mL' }. */
export function volumeFor(amount, unit, conc) {
  if (!conc || !Number.isFinite(amount) || !(conc.value > 0)) return null;
  const [cu, per] = String(conc.unit).split('/');
  if (per !== 'mL') return null;
  if (MASS[unit] && MASS[cu]) return (amount * MASS[unit]) / (conc.value * MASS[cu]);
  if (unit === cu) return amount / conc.value;
  return null;
}

// ---------------------------------------------------------------- infusions
/** Infusion dose units understood by infusionRate / infusionDose, as [amount unit, per kg?, per minute?]. */
const INF = {
  'mcg/kg/min': ['mcg', true, true], 'mcg/kg/h': ['mcg', true, false], 'mg/kg/h': ['mg', true, false],
  'mcg/min': ['mcg', false, true], 'mg/h': ['mg', false, false], 'U/h': ['U', false, false], 'U/min': ['U', false, true],
  'mL/kg/h': ['mL', true, false],
};

/** mL/h for a dose rate. conc as in volumeFor. */
export function infusionRate({ dose, unit, weight, conc }) {
  const u = INF[unit];
  if (!u || !Number.isFinite(dose) || dose < 0) return null;
  if (u[1] && !okNum(weight, 0.3, 400)) return null;
  const perHour = dose * (u[1] ? weight : 1) * (u[2] ? 60 : 1);
  if (u[0] === 'mL') return perHour;
  return volumeFor(perHour, u[0], conc);
}

/** An infusion dose range in mL/h for one patient, on the dose's weight basis. null if it can't be worked out. */
export function infusionFor(dose, w, conc) {
  if (!dose?.infusion || !Array.isArray(dose.per) || !INF[dose.unit]) return null;
  const perKg = INF[dose.unit][1];
  let dw = { kg: null, basis: 'TBW', fallback: false };
  if (perKg) { if (w?.tbw == null) return null; dw = dosingWeight(dose.weight, w); }
  const lo = infusionRate({ dose: dose.per[0], unit: dose.unit, weight: dw.kg, conc });
  const hi = infusionRate({ dose: dose.per[1] ?? dose.per[0], unit: dose.unit, weight: dw.kg, conc });
  if (lo == null || hi == null) return null;
  return { lo, hi, perKg, kg: dw.kg, basis: dw.basis, fallback: dw.fallback, why: dw.why };
}

/** The dose rate a given mL/h delivers (the inverse of infusionRate). */
export function infusionDose({ rate, unit, weight, conc }) {
  const one = infusionRate({ dose: 1, unit, weight, conc });
  if (!one || !Number.isFinite(rate)) return null;
  return rate / one;
}

// ---------------------------------------------------------------- fluids and blood
/** Hourly maintenance by the 4-2-1 rule (mL/h). */
export function maintenance421(weight) {
  if (!okNum(weight, 0.3, 400)) return null;
  return 4 * Math.min(weight, 10) + 2 * Math.min(Math.max(weight - 10, 0), 10) + 1 * Math.max(weight - 20, 0);
}

/** Fasting deficit = hourly maintenance × hours fasted (mL). */
export function fastingDeficit(weight, hours) {
  const m = maintenance421(weight);
  if (m == null || !okNum(hours, 0, 72)) return null;
  return m * hours;
}

/** Estimated blood volume, mL/kg. */
export const BLOOD_VOLUME = {
  preterm: { label: 'Premature baby', mlkg: 95 },
  neonate: { label: 'Term newborn', mlkg: 90 },
  infant: { label: 'Infant (under 1 year)', mlkg: 80 },
  child: { label: 'Child (1–12 years)', mlkg: 75 },
  man: { label: 'Adult man', mlkg: 70 },
  woman: { label: 'Adult woman', mlkg: 65 },
};

/** Allowable blood loss = EBV × (Hct start − Hct lowest acceptable) / Hct start. Hct as % or fraction (same for both). */
export function abl({ weight, group, hctStart, hctTarget }) {
  const g = BLOOD_VOLUME[group];
  if (!g || !okNum(weight, 0.3, 400) || !(hctStart > 0) || !(hctTarget >= 0)) return null;
  const ebv = g.mlkg * weight;
  if (hctTarget >= hctStart) return { ebv, abl: 0 };
  return { ebv, abl: (ebv * (hctStart - hctTarget)) / hctStart };
}

// ---------------------------------------------------------------- local anaesthetics
/** Maximum doses (mg/kg on the dosing weight, and a ceiling in mg) as taught in the department. */
export const LA = {
  lignocaine: { name: 'Lignocaine (lidocaine)', mgkg: 3, cap: 200 },
  'lignocaine-adr': { name: 'Lignocaine with adrenaline', mgkg: 7, cap: 500 },
  bupivacaine: { name: 'Bupivacaine (plain or heavy)', mgkg: 2, cap: 150 },
  levobupivacaine: { name: 'Levobupivacaine', mgkg: 2, cap: 150 },
  ropivacaine: { name: 'Ropivacaine', mgkg: 3, cap: 200 },
};

/**
 * Maximum local anaesthetic for one patient. Dosing weight is total body weight, or lean body weight when the BMI is 30
 * or more (needs height). percent (e.g. 0.5 for 0.5%) gives the most mL at that strength. 1% = 10 mg/mL.
 */
export function laMax({ drug, w, percent }) {
  const d = LA[drug];
  if (!d || w?.tbw == null) return null;
  const obese = w.bmi != null && w.bmi >= 30 && w.lbw != null;
  const kg = obese ? w.lbw : w.tbw;
  const byWeight = d.mgkg * kg;
  const mg = Math.min(byWeight, d.cap);
  const mgml = percent > 0 ? percent * 10 : null;
  return { mg, byWeight, capped: byWeight > d.cap, kg, basis: obese ? 'LBW' : 'TBW', mgml, ml: mgml ? mg / mgml : null };
}

// ---------------------------------------------------------------- strengths
/** Percent strength to mg/mL (1% = 1 g per 100 mL = 10 mg/mL). */
export const percentToMgMl = p => (Number.isFinite(p) ? p * 10 : null);
/** Ratio strength 1:x (g per mL) to mg/mL: 1:1000 = 1 mg/mL, 1:10,000 = 0.1 mg/mL, 1:200,000 = 5 mcg/mL. */
export const ratioToMgMl = x => (x > 0 ? 1000 / x : null);

// ---------------------------------------------------------------- scores
/** STOP-BANG: 8 yes/no items → score and obstructive sleep apnoea risk band. items: { snore, tired, observed, pressure, bmi, age, neck, male } */
export function stopBang(items = {}) {
  const keys = ['snore', 'tired', 'observed', 'pressure', 'bmi', 'age', 'neck', 'male'];
  const score = keys.reduce((s, k) => s + (items[k] ? 1 : 0), 0);
  const stop = ['snore', 'tired', 'observed', 'pressure'].reduce((s, k) => s + (items[k] ? 1 : 0), 0);
  let band = score >= 5 ? 'high' : score >= 3 ? 'intermediate' : 'low';
  if (band === 'intermediate' && stop >= 2 && (items.male || items.bmi || items.neck)) band = 'high';
  return { score, band };
}

/** Apfel simplified PONV score: female, non-smoker, history of PONV or motion sickness, postoperative opioids. */
export function apfel(items = {}) {
  const score = ['female', 'nonSmoker', 'history', 'opioids'].reduce((s, k) => s + (items[k] ? 1 : 0), 0);
  return { score, risk: [10, 21, 39, 61, 79][score] };
}

/**
 * Revised Cardiac Risk Index (Lee): high-risk surgery, ischaemic heart disease, heart failure, cerebrovascular disease,
 * insulin-treated diabetes, creatinine > 177 µmol/L. Risk of myocardial infarction, cardiac arrest or death at 30 days
 * from the 2017 Canadian guideline (Duceppe): 0 → 3.9%, 1 → 6.0%, 2 → 10.1%, 3 or more → 15%.
 */
export function rcri(items = {}) {
  const score = ['surgery', 'ihd', 'hf', 'cvd', 'insulin', 'creatinine'].reduce((s, k) => s + (items[k] ? 1 : 0), 0);
  return { score, risk: [3.9, 6.0, 10.1, 15.0][Math.min(score, 3)] };
}

/** Modified Aldrete score: activity, breathing, circulation, consciousness, oxygen saturation, each 0–2. Ready at 9 or more with no 0. */
export function aldrete(items = {}) {
  const keys = ['activity', 'breathing', 'circulation', 'consciousness', 'spo2'];
  const vals = keys.map(k => items[k]);
  if (vals.some(v => ![0, 1, 2].includes(v))) return { score: null, ready: false, complete: false };
  const score = vals.reduce((s, v) => s + v, 0);
  return { score, ready: score >= 9 && !vals.includes(0), complete: true };
}

// ---------------------------------------------------------------- children
/** APLS weight estimate. Age in months (under 1 year) or years. */
export function paedsWeight({ months, years }) {
  if (okNum(months, 0, 11.99) && !(years >= 1)) return 0.5 * months + 4;
  if (okNum(years, 1, 5)) return 2 * years + 8;
  if (okNum(years, 6, 12)) return 3 * years + 7;
  return null;
}

/** Tracheal tube sizes for a child of `years` (2 years and over): internal diameter (mm) and oral/nasal length at the lips/nose (cm). */
export function paedsTube(years) {
  if (!okNum(years, 2, 14)) return null;
  return { cuffed: years / 4 + 3.5, uncuffed: years / 4 + 4, oral: years / 2 + 12, nasal: years / 2 + 15 };
}

/** Supraglottic airway (LMA) size by weight in kg. */
export function lmaSize(weight) {
  if (!okNum(weight, 0.5, 400)) return null;
  if (weight < 5) return '1';
  if (weight < 10) return '1.5';
  if (weight < 20) return '2';
  if (weight < 30) return '2.5';
  if (weight < 50) return '3';
  if (weight < 70) return '4';
  return '5';
}
