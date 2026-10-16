// The synthetic patient (MODEL.md section 1): covariates from the profile, and the between-patient variation drawn
// once from the seed's `patient` sub-stream. Static for the run: no step function.

import { exp } from './fmath.js';

export const DEFAULT_PROFILE = { age: 40, sex: 'M', weightKg: 70, heightCm: 170 };

export const bmiOf = (w, h) => w / ((h / 100) * (h / 100));

// James 1976 lean body mass (Schnider, Minto) [V]
export function jamesLbm(sex, w, h) {
  const r = w / h;
  return sex === 'F' ? 1.07 * w - 148 * r * r : 1.1 * w - 128 * r * r;
}

// the weight at which James LBM peaks for this height (it falls beyond: the "James paradox", Absalom 2009)
export function jamesPeakWeight(sex, h) {
  const a = sex === 'F' ? 1.07 : 1.1, b = sex === 'F' ? 148 : 128;
  return (a * h * h) / (2 * b);
}

// LBM for the PK covariates: above BMI 35 (women) or 42 (men) use the LBM at the James peak, as pumps restrict
// Schnider there [D]
export function pkLbm(sex, w, h) {
  const limit = sex === 'F' ? 35 : 42;
  return bmiOf(w, h) > limit ? jamesLbm(sex, Math.min(w, jamesPeakWeight(sex, h)), h) : jamesLbm(sex, w, h);
}

export const mosteller = (w, h) => Math.sqrt((h * w) / 3600);                       // m², Mosteller 1987 [V]
export const devine = (sex, h) => (sex === 'F' ? 45.5 : 50) + 0.9055 * (h - 152.4); // kg, Devine 1974 [V]

// blood volume, L: 70 mL/kg (women 65) [S, Nadler]; above BMI 25 indexed by 1/sqrt(BMI/25), the Lemmens 2006 form
// made continuous at a normal BMI [S/D]
export function bloodVolume(sex, w, h) {
  const base = sex === 'F' ? 65 : 70, b = bmiOf(w, h);
  return (w * (b > 25 ? base / Math.sqrt(b / 25) : base)) / 1000;
}

// FRC as the O2 store, L: 30 mL/kg of IBW; obesity lowers it (MODEL.md section 1) [D, calibrated to apnoea targets]
export function frc(sex, w, h) {
  const b = bmiOf(w, h), f = b > 25 ? Math.max(0.5, 1 - 0.025 * (b - 25)) : 1;
  return (0.030 * devine(sex, h) * f);
}

export const intrinsicHr = age => 118.1 - 0.57 * age; // Jose & Collison 1970 [V]

const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

// draw: { uniform(), normal() } from the patient sub-stream. profile.fixed overrides any drawn value.
export function makePatient(profile = {}, draw) {
  const p = { ...DEFAULT_PROFILE, ...profile };
  const { age, sex, weightKg: w, heightCm: h } = p;
  const fixed = p.fixed || {};
  const out = {
    age, sex, weightKg: w, heightCm: h,
    bmi: bmiOf(w, h),
    lbm: pkLbm(sex, w, h),
    bsa: mosteller(w, h),
    ibw: devine(sex, h),
    bloodVol0: bloodVolume(sex, w, h),
    frc0: frc(sex, w, h),
    hb0: p.hb0 ?? (sex === 'F' ? 135 : 150),
    // plasma cholinesterase activity as a fraction of normal: scales suxamethonium hydrolysis (heterozygous about 0.5,
    // homozygous atypical about 0.01; MODEL.md section 2) [D]
    che: p.che ?? 1,
    macStub: p.macStub ?? 0,
    // variation (MODEL.md section 1); the order of draws is fixed so a seed always gives the same patient
    q: draw.uniform(),
    pkV1: exp(0.25 * draw.normal()),
    pkCL: exp(0.25 * draw.normal()),
    baroGain: clamp(1 + 0.25 * draw.normal(), 0.5, 1.5),
    ihr: intrinsicHr(age) * clamp(1 + 0.075 * draw.normal(), 0.85, 1.15),
    // transcutaneous pacing capture threshold, mA (MODEL.md section 13; about 50-90 mA [U]). Drawn last so the
    // earlier draws, and every patient already fixed in a test, are unchanged.
    paceThresh: clamp(70 + 15 * draw.normal(), 45, 95),
  };
  for (const k of ['q', 'pkV1', 'pkCL', 'baroGain', 'ihr', 'paceThresh']) if (fixed[k] != null) out[k] = fixed[k];
  return out;
}
