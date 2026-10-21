// Pump-level behaviour layered over the models: the reported Space Plus BMI>30 weight substitution, and the
// variants the calibration screen compares. Status of every item is in docs/RESEARCH_NOTES.md.
import { ModelId, ModelOptions, eleveldPk, marshPk, schniderPk } from './models';
import { Patient, adjustedBw, bmi, devineIbw } from './patient';
import { PKParams, ceBolus, cpBolus } from './solver';
import { TargetMode } from './tci';

/**
 * Reported, unverified (Milliet 2025 letter; ANZCA alert): for BMI > 30 the Space Plus is reported to replace total
 * body weight with an adjusted weight in the Eleveld model. Servin's adjusted weight (Devine IBW + 0.4 x excess),
 * substituted for weight in every Eleveld covariate, reproduces the letter's index case (pump 162 mg; this
 * formula 163 mg; total body weight 191 mg). The exact formula and which covariates it enters are not published.
 */
export function reportedSpacePlusWeight(p: Patient): number | null {
  if (bmi(p) <= 30) return null;
  return adjustedBw(p, 0.4);
}

export interface Variant {
  id: string;
  label: string;
  status: 'model' | 'reported' | 'hypothesis';
  pk: (p: Patient) => PKParams;
}

export function variantsFor(model: ModelId, opioid: boolean): Variant[] {
  if (model === 'eleveld') {
    const o: ModelOptions = { opioid };
    return [
      { id: 'tbw', label: 'Eleveld, total body weight (as published)', status: 'model', pk: (p) => eleveldPk(p, o) },
      { id: 'servin', label: 'Eleveld, Servin adjusted weight if BMI > 30 (reported Space Plus)', status: 'reported',
        pk: (p) => eleveldPk(p, { ...o, weightOverride: reportedSpacePlusWeight(p) ?? undefined }) },
      { id: 'servin-all', label: 'Eleveld, Servin adjusted weight at any BMI', status: 'hypothesis',
        pk: (p) => eleveldPk(p, { ...o, weightOverride: adjustedBw(p, 0.4) }) },
      { id: 'ibw', label: 'Eleveld, ideal body weight (Devine)', status: 'hypothesis', pk: (p) => eleveldPk(p, { ...o, weightOverride: devineIbw(p) }) },
      { id: 'other-opioid', label: `Eleveld, opioid ${opioid ? 'off' : 'on'} (wrong flag)`, status: 'hypothesis', pk: (p) => eleveldPk(p, { opioid: !opioid }) },
      { id: 'venous', label: 'Eleveld, venous parameters and ke0', status: 'hypothesis', pk: (p) => eleveldPk(p, { ...o, sampling: 'venous' }) },
    ];
  }
  if (model === 'schnider') return [{ id: 'schnider', label: 'Schnider (James LBM)', status: 'model', pk: schniderPk }];
  return [
    { id: 'marsh-026', label: 'Marsh, ke0 0.26/min', status: 'model', pk: (p) => marshPk(p, { ke0: 0.26 }) },
    { id: 'marsh-12', label: 'Marsh, ke0 1.2/min (modified)', status: 'model', pk: (p) => marshPk(p, { ke0: 1.2 }) },
  ];
}

export function inductionDose(pk: PKParams, mode: TargetMode, target: number, rateMgMin?: number): number {
  return mode === 'Cp' ? cpBolus(pk, target) : ceBolus(pk, target, rateMgMin).dose;
}

/** Solve for the dosing weight that makes the Eleveld bolus equal `doseMg` (for the calibration screen). */
export function impliedEleveldWeight(p: Patient, opioid: boolean, target: number, doseMg: number, rateMgMin?: number): number | null {
  const f = (w: number) => ceBolus(eleveldPk(p, { opioid, weightOverride: w }), target, rateMgMin).dose - doseMg;
  let lo = 10, hi = 300;
  if (f(lo) > 0 || f(hi) < 0) return null;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Pump settings used by the emulator. Defaults are placeholders for the Space Plus until confirmed on a real pump
 * (see RESEARCH_NOTES.md, real-pump test questions).
 */
export const PUMP_DEFAULTS = {
  concMgMl: 10,
  maxRateMlH: 1200,
  updateSec: 10,
  instantBolus: true, // the matcher's golden values assume an instantaneous bolus
};
