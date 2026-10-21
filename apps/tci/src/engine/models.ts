// Propofol PK-PD models behind one interface. Constants are sourced in docs/REFERENCES.md (ref keys in `src`).
import { PKParams } from './solver';
import { Patient, REF_PATIENT, alSallamiFfm, bmi, jamesLbm, jamesPeakWeight } from './patient';

export type ModelId = 'eleveld' | 'schnider' | 'marsh';
export type Sampling = 'arterial' | 'venous';

export interface ModelOptions {
  opioid?: boolean; // Eleveld: opioid co-administration
  sampling?: Sampling; // Eleveld: arterial (default, as pumps implement) or venous
  ke0?: number; // Marsh: 0.26 or 1.2 /min
  weightOverride?: number; // dosing weight used in place of total body weight (BMI>30 mode)
}

export interface Warning { level: 'info' | 'warn' | 'stop'; text: string; src?: string }

export interface Model {
  id: ModelId;
  name: string;
  drug: 'propofol';
  covariates: (keyof Patient)[];
  src: string[]; // reference keys
  pk(p: Patient, o?: ModelOptions): PKParams;
  check(p: Patient, o?: ModelOptions): Warning[];
}

// ---------------------------------------------------------------- Eleveld 2018
export const ELEVELD = {
  t1: 6.28, t2: 25.5, t3: 273, t4: 1.79, t5: 1.75, t6: 1.11,
  t8: 42.3, t9: 9.06, t10: -0.0156, t11: -0.00286, t12: 33.6, t13: -0.0138, t14: 68.3,
  t15: 2.10, t16: 1.30, t17: 1.42, t18: 0.68,
  ke0Art: 0.146, ke0Ven: 1.24, ce50: 3.08, ce50Age: -0.00635,
} as const;

const sig = (x: number, e50: number, lam: number) => x ** lam / (x ** lam + e50 ** lam);

export function eleveldPk(p: Patient, o: ModelOptions = {}): PKParams {
  const T = ELEVELD;
  const opioid = o.opioid ?? true;
  const venous = o.sampling === 'venous';
  const w = o.weightOverride ?? p.weight;
  const q: Patient = { ...p, weight: w };
  const R = REF_PATIENT;
  // Supplement NONMEM code: PMA weeks = AGE*52 + 40; Q3 maturation uses the same argument.
  const pma = p.age * 52 + 40, pmaRef = R.age * 52 + 40;
  const fAge = (x: number) => Math.exp(x * (p.age - R.age));
  const fOp = (x: number) => (opioid ? Math.exp(x * p.age) : 1);
  const fCentral = (x: number) => sig(x, T.t12, 1);
  const fClMat = (x: number) => sig(x, T.t8, T.t9);
  const fQ3Mat = (x: number) => sig(x, T.t14, 1);
  let v1 = (T.t1 * fCentral(w)) / fCentral(R.weight);
  if (venous) v1 *= 1 + T.t17 * (1 - fCentral(w));
  const v2 = ((T.t2 * w) / R.weight) * fAge(T.t10);
  const v3 = ((T.t3 * alSallamiFfm(q)) / alSallamiFfm(R)) * fOp(T.t13);
  const clRef = p.sex === 'M' ? T.t4 : T.t15;
  const cl1 = clRef * (w / R.weight) ** 0.75 * (fClMat(pma) / fClMat(pmaRef)) * fOp(T.t11);
  let cl2 = T.t5 * (v2 / T.t2) ** 0.75 * (1 + T.t16 * (1 - fQ3Mat(pma)));
  if (venous) cl2 *= T.t18;
  const cl3 = (T.t6 * (v3 / T.t3) ** 0.75 * fQ3Mat(pma)) / fQ3Mat(pmaRef);
  const ke0 = (venous ? T.ke0Ven : T.ke0Art) * (w / 70) ** -0.25;
  return { v1, v2, v3, cl1, cl2, cl3, ke0 };
}

export const eleveldCe50 = (p: Patient) => ELEVELD.ce50 * Math.exp(ELEVELD.ce50Age * (p.age - REF_PATIENT.age));

// ---------------------------------------------------------------- Schnider 1998/1999
export function schniderPk(p: Patient): PKParams {
  const lbm = jamesLbm(p);
  return {
    v1: 4.27,
    v2: 18.9 - 0.391 * (p.age - 53),
    v3: 238,
    cl1: 1.89 + 0.0456 * (p.weight - 77) - 0.0681 * (lbm - 59) + 0.0264 * (p.height - 177),
    cl2: 1.29 - 0.024 * (p.age - 53),
    cl3: 0.836,
    ke0: 0.456,
  };
}

// ---------------------------------------------------------------- Marsh 1991
export const MARSH = { v1PerKg: 0.228, k10: 0.119, k12: 0.112, k13: 0.0419, k21: 0.055, k31: 0.0033 } as const;

export function marshPk(p: Patient, o: ModelOptions = {}): PKParams {
  const M = MARSH;
  const v1 = M.v1PerKg * (o.weightOverride ?? p.weight);
  return {
    v1, v2: (v1 * M.k12) / M.k21, v3: (v1 * M.k13) / M.k31,
    cl1: M.k10 * v1, cl2: M.k12 * v1, cl3: M.k13 * v1,
    ke0: o.ke0 ?? 0.26,
  };
}

// ---------------------------------------------------------------- validity
// Data ranges from the source papers; pump input limits live in pump.ts.
function common(p: Patient): Warning[] {
  const w: Warning[] = [];
  if (!(p.age > 0 && p.height > 0 && p.weight > 0)) w.push({ level: 'stop', text: 'Enter age, height and weight.' });
  return w;
}

export const MODELS: Record<ModelId, Model> = {
  eleveld: {
    id: 'eleveld', name: 'Eleveld', drug: 'propofol', covariates: ['sex', 'age', 'height', 'weight'],
    src: ['eleveld2018'],
    pk: eleveldPk,
    check(p) {
      const w = common(p);
      const b = bmi(p);
      if (p.age > 88) w.push({ level: 'warn', text: `Age ${p.age} y: above the oldest subjects in the Eleveld data (88 y).`, src: 'eleveld2018' });
      if (p.weight > 160) w.push({ level: 'warn', text: `Weight ${p.weight} kg: above the heaviest subjects in the Eleveld data (160 kg).`, src: 'eleveld2018' });
      if (b > 30) w.push({ level: 'info', text: `BMI ${b.toFixed(1)}: see the Eleveld BMI above 30 setting for the reported Space Plus weight adjustment (unverified).`, src: 'anzca2025' });
      return w;
    },
  },
  schnider: {
    id: 'schnider', name: 'Schnider', drug: 'propofol', covariates: ['sex', 'age', 'height', 'weight'],
    src: ['schnider1998', 'schnider1999', 'james1976'],
    pk: (p) => schniderPk(p),
    check(p) {
      const w = common(p);
      const lbm = jamesLbm(p);
      const peak = jamesPeakWeight(p);
      if (p.weight > peak) w.push({ level: 'stop', text: `James LBM is past its peak (${peak.toFixed(0)} kg at this height): LBM now falls as weight rises, and clearance becomes unreliable.`, src: 'james1976' });
      else if (p.weight > 0.8 * peak) w.push({ level: 'warn', text: `Weight is ${(100 * p.weight / peak).toFixed(0)}% of the James LBM peak (${peak.toFixed(0)} kg): LBM is flattening.`, src: 'james1976' });
      if (lbm <= 0) w.push({ level: 'stop', text: 'James LBM is zero or negative.' });
      if (p.age < 26 || p.age > 81) w.push({ level: 'warn', text: `Age ${p.age} y: outside the Schnider 1998 volunteers (26 to 81 y).`, src: 'schnider1998' });
      if (p.weight < 44 || p.weight > 123) w.push({ level: 'warn', text: `Weight ${p.weight} kg: outside the Schnider 1998 volunteers (44 to 123 kg).`, src: 'schnider1998' });
      return w;
    },
  },
  marsh: {
    id: 'marsh', name: 'Marsh', drug: 'propofol', covariates: ['weight'],
    src: ['marsh1991', 'struys2000'],
    pk: marshPk,
    check(p) {
      const w = common(p);
      if (p.age > 60) w.push({ level: 'info', text: 'Marsh ignores age: older patients get the same weight-scaled dose.', src: 'marsh1991' });
      if (bmi(p) > 30) w.push({ level: 'warn', text: 'Marsh scales every volume to total body weight: large doses in obesity.', src: 'marsh1991' });
      return w;
    },
  },
};
