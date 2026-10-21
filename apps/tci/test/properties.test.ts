// Conservation, linearity, monotonicity and controller behaviour.
import { describe, expect, test } from 'vitest';
import {
  Patient, amounts, bolus, buildModes, ceBolus, cpOf, eleveldPk, marshPk, schniderPk, simulate, step, zeroState, ceOf,
  matchTarget, reportedSpacePlusWeight, jamesPeakWeight,
} from '../src/engine';

const P: Patient = { sex: 'F', age: 58, height: 162, weight: 74 };
const PKS = { eleveld: eleveldPk(P), schnider: schniderPk(P), marsh: marshPk(P, { ke0: 1.2 }) };

describe('mass balance', () => {
  for (const [name, pk] of Object.entries(PKS)) {
    test(`${name}: amount in body + eliminated = dose given`, () => {
      const m = buildModes(pk);
      let s = zeroState(), given = 0, elim = 0;
      const dt = 1 / 60;
      for (let i = 0; i < 60 * 90; i++) {
        const u = i < 60 ? 150 : i < 3000 ? 8 : 0; // 1 min fast, then infusion, then off
        // eliminated over the step: integral of CL1*Cp, by Simpson on the exact solution
        const mid = step(m, s, u, dt / 2), end = step(m, s, u, dt);
        elim += (pk.cl1 * dt / 6) * (cpOf(m, s) + 4 * cpOf(m, mid) + cpOf(m, end));
        s = end; given += u * dt;
      }
      const [a1, a2, a3] = amounts(m, s);
      expect(Math.abs(a1 + a2 + a3 + elim - given) / given).toBeLessThan(1e-6);
    });
    test(`${name}: central amount is V1 x Cp, effect site never ahead at t=0`, () => {
      const m = buildModes(pk);
      const s = bolus(zeroState(), 100);
      expect(Math.abs(amounts(m, s)[0] - 100)).toBeLessThan(1e-9);
      expect(Math.abs(ceOf(m, s))).toBeLessThan(1e-9);
      expect(Math.abs(cpOf(m, s) * pk.v1 - 100)).toBeLessThan(1e-9);
    });
  }
});

describe('linearity and monotonicity', () => {
  for (const [name, pk] of Object.entries(PKS)) {
    test(`${name}: bolus is linear in target (instant bolus)`, () => {
      const d1 = ceBolus(pk, 1).dose;
      for (const t of [0.5, 2, 4, 7.5]) expect(Math.abs(ceBolus(pk, t).dose / (t * d1) - 1)).toBeLessThan(1e-9);
    });
    test(`${name}: Ce and Cp scale linearly with dose`, () => {
      const m = buildModes(pk);
      const a = step(m, bolus(zeroState(), 50), 0, 2.3), b = step(m, bolus(zeroState(), 150), 0, 2.3);
      expect(Math.abs(ceOf(m, b) / ceOf(m, a) - 3)).toBeLessThan(1e-9);
      expect(Math.abs(cpOf(m, b) / cpOf(m, a) - 3)).toBeLessThan(1e-9);
    });
    test(`${name}: rate-limited bolus is larger and monotonic in target`, () => {
      let prev = 0;
      for (const t of [1, 2, 3, 4, 6, 8]) {
        const d = ceBolus(pk, t, 200).dose;
        expect(d).toBeGreaterThan(prev);
        expect(d).toBeGreaterThanOrEqual(ceBolus(pk, t).dose - 1e-9);
        prev = d;
      }
    });
  }
  test('Eleveld bolus rises with weight, falls with age; opioid lowers it', () => {
    const at = (p: Partial<Patient>, opioid = true) => ceBolus(eleveldPk({ ...P, ...p }, { opioid }), 4).dose;
    expect(at({ weight: 90 })).toBeGreaterThan(at({ weight: 60 }));
    expect(at({ age: 80 })).toBeLessThan(at({ age: 30 }));
    expect(at({}, true)).toBeLessThan(at({}, false));
  });
  test('matching is an inverse pair', () => {
    const x = matchTarget(PKS.eleveld, 4, PKS.schnider);
    expect(Math.abs(matchTarget(PKS.schnider, x, PKS.eleveld) - 4)).toBeLessThan(1e-6);
  });
});

describe('TCI controller', () => {
  const pump = { concMgMl: 10, maxRateMlH: 1200, updateSec: 10 };
  test('Ce mode: peak Ce equals target, no overshoot, holds in maintenance', () => {
    const r = simulate(PKS.eleveld, 'Ce', [{ t: 0, target: 4 }], pump, 30);
    const max = Math.max(...r.ce);
    expect(max).toBeLessThan(4 * 1.002);
    expect(max).toBeGreaterThan(4 * 0.998);
    for (let i = r.t.findIndex((t) => t > 6); i < r.t.length; i++) expect(Math.abs(r.ce[i] - 4)).toBeLessThan(0.02);
    expect(Math.max(...r.rateMlH)).toBeLessThanOrEqual(1200 + 1e-9);
    // induction amount matches the rate-limited analytic bolus within one update interval of drug
    expect(Math.abs(r.inductionMg - ceBolus(PKS.eleveld, 4, 200).dose)).toBeLessThan(200 / 6);
  });
  test('Cp mode reaches and holds the plasma target', () => {
    const r = simulate(PKS.schnider, 'Cp', [{ t: 0, target: 3 }], pump, 20);
    const i = r.t.findIndex((t) => t > 2);
    for (let k = i; k < r.t.length; k++) expect(Math.abs(r.cp[k] - 3)).toBeLessThan(1e-6);
  });
  test('lower target stops the pump until the level falls', () => {
    const r = simulate(PKS.eleveld, 'Ce', [{ t: 0, target: 4 }, { t: 10, target: 2 }], pump, 30);
    const i = r.t.findIndex((t) => t >= 10);
    expect(r.rateMlH[i]).toBe(0);
    // it restarts before Ce reaches 2, early enough that Ce bottoms out at the target (within 1%)
    const resumed = r.rateMlH.findIndex((x, k) => k > i && x > 0);
    expect(resumed).toBeGreaterThan(i + 6);
    expect(Math.min(...r.ce.slice(i))).toBeGreaterThan(2 * 0.99);
    expect(Math.abs(r.ce[r.ce.length - 1] - 2)).toBeLessThan(0.02);
  });
});

describe('BMI and body-size guards', () => {
  test('reported Space Plus weight applies only above BMI 30', () => {
    expect(reportedSpacePlusWeight({ sex: 'M', age: 40, height: 180, weight: 97 })).toBeNull(); // BMI 29.9
    expect(reportedSpacePlusWeight({ sex: 'M', age: 40, height: 180, weight: 98 })).not.toBeNull();
  });
  test('James LBM peaks at BMI 43.0 (male) and 36.1 (female) at any height', () => {
    for (const h of [150, 170, 190]) {
      expect(Math.abs(jamesPeakWeight({ sex: 'M', height: h }) / (h / 100) ** 2 - 42.97)).toBeLessThan(0.01);
      expect(Math.abs(jamesPeakWeight({ sex: 'F', height: h }) / (h / 100) ** 2 - 36.15)).toBeLessThan(0.01);
    }
  });
});
