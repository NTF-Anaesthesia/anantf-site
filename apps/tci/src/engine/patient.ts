// Body-size formulas. Pure functions, no DOM.
export type Sex = 'M' | 'F';

export interface Patient {
  sex: Sex;
  age: number; // years
  height: number; // cm
  weight: number; // kg
}

export const REF_PATIENT: Patient = { sex: 'M', age: 35, height: 170, weight: 70 };

export const bmi = (p: Patient) => p.weight / (p.height / 100) ** 2;

/** James 1976 lean body mass (used by Schnider 1998). Peaks, then falls, as weight rises at fixed height. */
export function jamesLbm(p: Patient): number {
  const r = p.weight / p.height;
  return p.sex === 'M' ? 1.1 * p.weight - 128 * r * r : 1.07 * p.weight - 148 * r * r;
}

/** Weight at which James LBM peaks for this height and sex (dLBM/dW = 0). */
export function jamesPeakWeight(p: Pick<Patient, 'sex' | 'height'>): number {
  const h2 = p.height * p.height;
  return p.sex === 'M' ? (1.1 * h2) / (2 * 128) : (1.07 * h2) / (2 * 148);
}

/** Al-Sallami 2015 fat-free mass (used by Eleveld 2018). */
export function alSallamiFfm(p: Patient): number {
  const b = bmi(p);
  if (p.sex === 'M') {
    return (0.88 + (1 - 0.88) / (1 + (p.age / 13.4) ** -12.7)) * ((9270 * p.weight) / (6680 + 216 * b));
  }
  return (1.11 + (1 - 1.11) / (1 + (p.age / 7.1) ** -1.1)) * ((9270 * p.weight) / (8780 + 244 * b));
}

/** Devine ideal body weight (kg). */
export function devineIbw(p: Pick<Patient, 'sex' | 'height'>): number {
  const inchesOver5ft = p.height / 2.54 - 60;
  return (p.sex === 'M' ? 50 : 45.5) + 2.3 * inchesOver5ft;
}

/** Adjusted body weight: IBW + 0.4 x (TBW - IBW). */
export function adjustedBw(p: Patient, factor = 0.4): number {
  const ibw = devineIbw(p);
  return ibw + factor * (p.weight - ibw);
}
