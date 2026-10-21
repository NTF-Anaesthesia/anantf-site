// Engine vs the Python oracle (oracle/tci_ref.py, matrix exponential) and the owner's golden table.
import { describe, expect, test } from 'vitest';
import golden from './golden.json';
import {
  Patient, PKParams, alSallamiFfm, ceBolus, cpBolus, doseCurve, eleveldPk, jamesLbm, marshPk, matchTarget, peakCe,
  buildModes, schniderPk,
} from '../src/engine';

const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-12);
type Case = (typeof golden.cases)[number];
const pkOf = (name: string, p: Patient): PKParams => {
  switch (name) {
    case 'eleveld_opioid': return eleveldPk(p, { opioid: true });
    case 'eleveld_no_opioid': return eleveldPk(p, { opioid: false });
    case 'eleveld_venous_opioid': return eleveldPk(p, { opioid: true, sampling: 'venous' });
    case 'schnider': return schniderPk(p);
    case 'marsh_026': return marshPk(p, { ke0: 0.26 });
    case 'marsh_12': return marshPk(p, { ke0: 1.2 });
  }
  throw new Error(name);
};
const MODELS = ['eleveld_opioid', 'eleveld_no_opioid', 'eleveld_venous_opioid', 'schnider', 'marsh_026', 'marsh_12'] as const;

describe('matches the Python oracle (4 significant figures or better)', () => {
  for (const c of golden.cases as Case[]) {
    const p = c.patient as Patient;
    const id = `${p.sex} ${p.age}y ${p.height}cm ${p.weight}kg`;
    test(`${id}: body size`, () => {
      expect(rel(jamesLbm(p), c.lbm_james)).toBeLessThan(1e-9);
      expect(rel(alSallamiFfm(p), c.ffm_alsallami)).toBeLessThan(1e-9);
    });
    for (const name of MODELS) {
      test(`${id}: ${name}`, () => {
        const g = (c as unknown as Record<string, any>)[name];
        const pk = pkOf(name, p);
        for (const k of ['v1', 'v2', 'v3', 'cl1', 'cl2', 'cl3', 'ke0'] as const) expect(rel(pk[k], g.pk[k])).toBeLessThan(1e-9);
        expect(rel(ceBolus(pk, 4).dose, g.ce4_bolus)).toBeLessThan(1e-5);
        expect(Math.abs(ceBolus(pk, 4).tPeak - g.ce4_tpeak)).toBeLessThan(1e-3);
        expect(rel(cpBolus(pk, 4), g.cp4_bolus)).toBeLessThan(1e-9);
        expect(rel(peakCe(buildModes(pk), 1).v, g.unit_peak_ce)).toBeLessThan(1e-6);
        expect(rel(ceBolus(pk, 4, 200).dose, g.ce4_bolus_rate1200mlh_1pct)).toBeLessThan(1e-4);
        const cur = doseCurve(pk, g.ce4_bolus, 0, 10, 0.5);
        g.curve_t.forEach((t: number, i: number) => {
          expect(Math.abs(cur.t[i] - t)).toBeLessThan(1e-9);
          expect(Math.abs(cur.cp[i] - g.curve_cp[i])).toBeLessThan(1e-4 * Math.max(1, g.curve_cp[i]));
          expect(Math.abs(cur.ce[i] - g.curve_ce[i])).toBeLessThan(1e-4 * Math.max(1, g.curve_ce[i]));
        });
      });
    }
    test(`${id}: matched targets`, () => {
      expect(rel(matchTarget(eleveldPk(p), 4, schniderPk(p)), c.matched_schnider_from_eleveld4)).toBeLessThan(1e-5);
      expect(rel(matchTarget(schniderPk(p), 4, eleveldPk(p)), c.matched_eleveld_from_schnider4)).toBeLessThan(1e-5);
    });
  }
});

// Owner's table (rounded to whole mg and 2 decimals). Tolerance 0.5%, or half the last printed digit where the
// rounding alone exceeds 0.5% (Schnider F 40 y: 69.5 mg printed as 69).
const TABLE: [Patient, number, number, number][] = [
  [{ sex: 'M', age: 35, height: 170, weight: 70 }, 171, 71, 9.66],
  [{ sex: 'M', age: 20, height: 175, weight: 70 }, 189, 75, 10.09],
  [{ sex: 'M', age: 70, height: 170, weight: 70 }, 140, 62, 9.03],
  [{ sex: 'M', age: 85, height: 168, weight: 65 }, 122, 57, 8.56],
  [{ sex: 'F', age: 40, height: 160, weight: 55 }, 141, 69, 8.11],
  [{ sex: 'F', age: 70, height: 160, weight: 60 }, 129, 63, 8.18],
  [{ sex: 'M', age: 40, height: 170, weight: 50 }, 127, 68, 7.49],
  [{ sex: 'M', age: 40, height: 175, weight: 120 }, 253, 83, 12.16],
  [{ sex: 'F', age: 45, height: 160, weight: 100 }, 220, 84, 10.41],
];
const near = (got: number, want: number, unit: number) => Math.abs(got - want) <= Math.max(0.005 * want, unit / 2 + 1e-9);

describe("owner's golden table: Eleveld Ce 4 (opioid on), Schnider Ce 4, matched Schnider Ce", () => {
  for (const [p, e, s, m] of TABLE) {
    test(`${p.sex} ${p.age}y ${p.height}cm ${p.weight}kg`, () => {
      expect(near(ceBolus(eleveldPk(p, { opioid: true }), 4).dose, e, 1)).toBe(true);
      expect(near(ceBolus(schniderPk(p), 4).dose, s, 1)).toBe(true);
      expect(near(matchTarget(eleveldPk(p), 4, schniderPk(p)), m, 0.01)).toBe(true);
    });
  }
  test('Eleveld opioid off, reference patient: about 187 mg', () => {
    expect(near(ceBolus(eleveldPk({ sex: 'M', age: 35, height: 170, weight: 70 }, { opioid: false }), 4).dose, 187, 1)).toBe(true);
  });
  test('reported Space Plus case (Milliet 2025): TBW 192 mg (TivaTrainer), pump 162 mg', async () => {
    const { adjustedBw } = await import('../src/engine');
    const p: Patient = { sex: 'M', age: 63, height: 173, weight: 100 };
    expect(Math.abs(ceBolus(eleveldPk(p), 4).dose - 192)).toBeLessThan(2);
    expect(Math.abs(ceBolus(eleveldPk(p, { weightOverride: adjustedBw(p) }), 4).dose - 162)).toBeLessThan(2);
  });
});
