#!/usr/bin/env python3
"""Numerical oracle for the TCI emulator (propofol: Eleveld, Schnider, Marsh).

Rebuilt 21 Oct 2026 from the primary papers (see ../docs/REFERENCES.md); the original seed file was not available.
Every constant carries a source tag. The TypeScript engine (../src/engine) uses a different exact method
(analytic poly-exponential); this file uses the matrix exponential (eigendecomposition of the 4x4 system),
so the two cross-check each other.

Units: mg, L, min, kg, cm, years. Concentrations mg/L (= ug/mL).

    python3 tci_ref.py              # print the check table
    python3 tci_ref.py --golden F   # write golden JSON for the Vitest suite
"""
from __future__ import annotations

import json
import math
import sys
from dataclasses import dataclass, asdict

import numpy as np


@dataclass
class Patient:
    sex: str  # 'M' or 'F'
    age: float  # years
    height: float  # cm
    weight: float  # kg

    @property
    def bmi(self) -> float:
        return self.weight / (self.height / 100) ** 2


@dataclass
class PK:
    v1: float
    v2: float
    v3: float
    cl1: float
    cl2: float
    cl3: float
    ke0: float

    @property
    def k(self):
        return dict(k10=self.cl1 / self.v1, k12=self.cl2 / self.v1, k13=self.cl3 / self.v1,
                    k21=self.cl2 / self.v2, k31=self.cl3 / self.v3, ke0=self.ke0)


# ---------------------------------------------------------------- body size

def james_lbm(p: Patient) -> float:
    """James 1976 lean body mass, as used by Schnider 1998."""
    h = p.height
    if p.sex == 'M':
        return 1.1 * p.weight - 128 * (p.weight / h) ** 2
    return 1.07 * p.weight - 148 * (p.weight / h) ** 2


def alsallami_ffm(p: Patient) -> float:
    """Al-Sallami 2015 fat-free mass, as used by Eleveld 2018 (eq. in Eleveld appendix)."""
    a, w, bmi = p.age, p.weight, p.bmi
    if p.sex == 'M':
        return (0.88 + (1 - 0.88) / (1 + (a / 13.4) ** -12.7)) * (9270 * w / (6680 + 216 * bmi))
    return (1.11 + (1 - 1.11) / (1 + (a / 7.1) ** -1.1)) * (9270 * w / (8780 + 244 * bmi))


# ---------------------------------------------------------------- models

ELEVELD = dict(  # Eleveld 2018 BJA 120:942, Table 2 (PK) and Table 3 (PD)
    t1=6.28, t2=25.5, t3=273, t4=1.79, t5=1.75, t6=1.11,
    t8=42.3, t9=9.06, t10=-0.0156, t11=-0.00286, t12=33.6, t13=-0.0138, t14=68.3,
    t15=2.10, t16=1.30, t17=1.42, t18=0.68,
    ke0_art=0.146, ke0_ven=1.24, ce50=3.08, ce50_age=-0.00635,
)
REF = Patient('M', 35, 170, 70)


def _sig(x, e50, lam):
    return x ** lam / (x ** lam + e50 ** lam)


def eleveld(p: Patient, opioid: bool = True, sampling: str = 'arterial', weight: float | None = None) -> PK:
    """Eleveld 2018. `weight` overrides the dosing weight (used for the reported BMI>30 adjustment mode)."""
    T = ELEVELD
    w = p.weight if weight is None else weight
    q = Patient(p.sex, p.age, p.height, w)
    # Supplement NONMEM code: PMA weeks = AGE*52 + 40 (52 wk/y), also used for Q3 maturation
    pma = p.age * 52 + 40
    pma_ref = REF.age * 52 + 40
    f_age = lambda x: math.exp(x * (p.age - REF.age))
    f_op = (lambda x: math.exp(x * p.age)) if opioid else (lambda x: 1.0)
    f_central = lambda x: _sig(x, T['t12'], 1)
    f_clmat = lambda x: _sig(x, T['t8'], T['t9'])
    f_q3mat = lambda x: _sig(x, T['t14'], 1)
    ffm, ffm_ref = alsallami_ffm(q), alsallami_ffm(REF)

    v1 = T['t1'] * f_central(w) / f_central(REF.weight)
    if sampling == 'venous':
        v1 = v1 * (1 + T['t17'] * (1 - f_central(w)))
    v2 = T['t2'] * w / REF.weight * f_age(T['t10'])
    v3 = T['t3'] * ffm / ffm_ref * f_op(T['t13'])
    cl_ref = T['t4'] if p.sex == 'M' else T['t15']
    cl1 = cl_ref * (w / REF.weight) ** 0.75 * f_clmat(pma) / f_clmat(pma_ref) * f_op(T['t11'])
    cl2 = T['t5'] * (v2 / T['t2']) ** 0.75 * (1 + T['t16'] * (1 - f_q3mat(pma)))
    if sampling == 'venous':
        cl2 = cl2 * T['t18']
    cl3 = T['t6'] * (v3 / T['t3']) ** 0.75 * f_q3mat(pma) / f_q3mat(pma_ref)
    ke0 = (T['ke0_art'] if sampling == 'arterial' else T['ke0_ven']) * (w / 70) ** -0.25
    return PK(v1, v2, v3, cl1, cl2, cl3, ke0)


def eleveld_ce50(p: Patient) -> float:
    return ELEVELD['ce50'] * math.exp(ELEVELD['ce50_age'] * (p.age - REF.age))


def schnider(p: Patient) -> PK:
    """Schnider 1998 Anesthesiology 88:1170 (PK) with ke0 0.456/min from Schnider 1999 90:1502."""
    lbm = james_lbm(p)
    v1 = 4.27
    v2 = 18.9 - 0.391 * (p.age - 53)
    v3 = 238
    cl1 = 1.89 + 0.0456 * (p.weight - 77) - 0.0681 * (lbm - 59) + 0.0264 * (p.height - 177)
    cl2 = 1.29 - 0.024 * (p.age - 53)
    cl3 = 0.836
    return PK(v1, v2, v3, cl1, cl2, cl3, 0.456)


def marsh(p: Patient, ke0: float = 0.26) -> PK:
    """Marsh 1991 BJA 67:41. ke0 0.26/min (Diprifusor) or 1.2/min (modified Marsh, Struys 2000)."""
    v1 = 0.228 * p.weight
    k10, k12, k13, k21, k31 = 0.119, 0.112, 0.0419, 0.055, 0.0033
    v2 = v1 * k12 / k21
    v3 = v1 * k13 / k31
    return PK(v1, v2, v3, k10 * v1, k12 * v1, k13 * v1, ke0)


# ---------------------------------------------------------------- exact solver

class System:
    """x = [A1, A2, A3 (mg), Ce (mg/L)], input u (mg/min) into A1. Exact for piecewise-constant u."""

    def __init__(self, pk: PK):
        k = pk.k
        self.pk = pk
        self.M = np.array([
            [-(k['k10'] + k['k12'] + k['k13']), k['k21'], k['k31'], 0],
            [k['k12'], -k['k21'], 0, 0],
            [k['k13'], 0, -k['k31'], 0],
            [k['ke0'] / pk.v1, 0, 0, -k['ke0']],
        ])
        lam, V = np.linalg.eig(self.M)
        self.lam, self.V, self.Vi = lam.real, V.real, np.linalg.inv(V).real
        self.b = np.array([1.0, 0, 0, 0])

    def step(self, x, u, dt):
        e = np.exp(self.lam * dt)
        ex = self.V @ np.diag(e) @ self.Vi
        # integral_0^dt e^{M s} ds b = V diag((e-1)/lam) Vi b
        g = self.V @ np.diag((e - 1) / self.lam) @ self.Vi @ self.b
        return ex @ x + g * u

    def cp(self, x):
        return x[0] / self.pk.v1


def ce_curve(sys_: System, dose, dur, t_end=20.0, dt=1 / 60):
    """Dose (mg) given at a constant rate over `dur` min (0 = instantaneous). Returns t, cp, ce arrays."""
    x = np.zeros(4)
    if dur == 0:
        x[0] = dose
    ts, cps, ces = [0.0], [sys_.cp(x)], [x[3]]
    t = 0.0
    while t < t_end - 1e-12:
        h = dt
        if dur > 0 and t < dur < t + h:
            h = dur - t
        u = dose / dur if (dur > 0 and t < dur - 1e-12) else 0.0
        x = sys_.step(x, u, h)
        t += h
        ts.append(t); cps.append(sys_.cp(x)); ces.append(x[3])
    return np.array(ts), np.array(cps), np.array(ces)


def peak_ce(sys_: System, dose, dur):
    """Peak Ce and its time, refined by golden-section search on the exact solution."""
    def ce_at(t):
        x = np.zeros(4)
        if dur == 0:
            x[0] = dose
            return sys_.step(x, 0, t)[3]
        if t <= dur:
            return sys_.step(x, dose / dur, t)[3]
        x = sys_.step(x, dose / dur, dur)
        return sys_.step(x, 0, t - dur)[3]
    grid = np.linspace(1e-4, 30, 3001)
    vals = [ce_at(t) for t in grid]
    i = int(np.argmax(vals))
    a, b = grid[max(i - 1, 0)], grid[min(i + 1, len(grid) - 1)]
    gr = (math.sqrt(5) - 1) / 2
    for _ in range(80):
        c, d = b - gr * (b - a), a + gr * (b - a)
        if ce_at(c) > ce_at(d):
            b = d
        else:
            a = c
    t = (a + b) / 2
    return ce_at(t), t


def ce_bolus(pk: PK, target: float, rate_mg_min: float | None = None):
    """Shafer & Gregg 1992: bolus whose PEAK Ce equals the target. Linear in dose, so scale a unit bolus.
    With a rate limit the bolus duration depends on the dose, so iterate to a fixed point."""
    s = System(pk)
    dose = target / peak_ce(s, 1.0, 0)[0]
    if rate_mg_min:
        for _ in range(60):
            new = target / peak_ce(s, 1.0, dose / rate_mg_min)[0]
            if abs(new - dose) < 1e-9:
                break
            dose = new
    pk_ce, tpk = peak_ce(s, dose, dose / rate_mg_min if rate_mg_min else 0)
    return dose, tpk


def cp_bolus(pk: PK, target: float) -> float:
    """Plasma targeting: bolus that brings Cp to target instantly (V1 x target)."""
    return pk.v1 * target


def matched_target(pk_from: PK, target: float, pk_to: PK, rate=None) -> float:
    """Target on model B that gives the same induction bolus as `target` on model A (linearity)."""
    d_from = ce_bolus(pk_from, target, rate)[0]
    d_to_unit = ce_bolus(pk_to, 1.0, rate)[0] if not rate else None
    if not rate:
        return d_from / d_to_unit
    # rate-limited: bolus is not exactly linear in target; bisect
    lo, hi = 0.1, 40.0
    for _ in range(100):
        mid = (lo + hi) / 2
        if ce_bolus(pk_to, mid, rate)[0] < d_from:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


# ---------------------------------------------------------------- checks

GOLDEN = [  # user-supplied expectations (Eleveld Ce4 opioid on, Schnider Ce4, matched Schnider Ce)
    (Patient('M', 35, 170, 70), 171, 71, 9.66),
    (Patient('M', 20, 175, 70), 189, 75, 10.09),
    (Patient('M', 70, 170, 70), 140, 62, 9.03),
    (Patient('M', 85, 168, 65), 122, 57, 8.56),
    (Patient('F', 40, 160, 55), 141, 69, 8.11),
    (Patient('F', 70, 160, 60), 129, 63, 8.18),
    (Patient('M', 40, 170, 50), 127, 68, 7.49),
    (Patient('M', 40, 175, 120), 253, 83, 12.16),
    (Patient('F', 45, 160, 100), 220, 84, 10.41),
]


def table(sampling='arterial'):
    rows = []
    for p, e_exp, s_exp, m_exp in GOLDEN:
        e = ce_bolus(eleveld(p, True, sampling), 4)[0]
        s = ce_bolus(schnider(p), 4)[0]
        m = matched_target(eleveld(p, True, sampling), 4, schnider(p))
        rows.append((p, e, e_exp, s, s_exp, m, m_exp))
    return rows


def golden_json():
    out = {"generated": "tci_ref.py", "units": "mg, L, min", "cases": []}
    pts = [g[0] for g in GOLDEN] + [Patient('F', 25, 165, 60), Patient('M', 60, 180, 90)]
    for p in pts:
        case = {"patient": asdict(p), "lbm_james": james_lbm(p), "ffm_alsallami": alsallami_ffm(p)}
        models = {
            "eleveld_opioid": eleveld(p, True), "eleveld_no_opioid": eleveld(p, False),
            "eleveld_venous_opioid": eleveld(p, True, 'venous'),
            "schnider": schnider(p), "marsh_026": marsh(p, 0.26), "marsh_12": marsh(p, 1.2),
        }
        for name, pk in models.items():
            s = System(pk)
            d4, tpk = ce_bolus(pk, 4)
            t, cp, ce = ce_curve(s, d4, 0, t_end=10, dt=0.5)
            case[name] = {
                "pk": asdict(pk), "ce4_bolus": d4, "ce4_tpeak": tpk, "cp4_bolus": cp_bolus(pk, 4),
                "unit_peak_ce": peak_ce(s, 1.0, 0)[0],
                "curve_t": t.tolist(), "curve_cp": cp.tolist(), "curve_ce": ce.tolist(),
                "ce4_bolus_rate1200mlh_1pct": ce_bolus(pk, 4, 200.0)[0],  # 1200 mL/h of 10 mg/mL = 200 mg/min
            }
        case["matched_schnider_from_eleveld4"] = matched_target(models["eleveld_opioid"], 4, models["schnider"])
        case["matched_eleveld_from_schnider4"] = matched_target(models["schnider"], 4, models["eleveld_opioid"])
        out["cases"].append(case)
    return out


def _round(x, sig=10):
    """Round floats to `sig` significant figures so the file is stable across numpy/BLAS builds."""
    if isinstance(x, float):
        return float(f'{x:.{sig}g}')
    if isinstance(x, dict):
        return {k: _round(v, sig) for k, v in x.items()}
    if isinstance(x, list):
        return [_round(v, sig) for v in x]
    return x


if __name__ == '__main__':
    if '--golden' in sys.argv:
        path = sys.argv[sys.argv.index('--golden') + 1]
        with open(path, 'w') as f:
            json.dump(_round(golden_json()), f, indent=1)
        print('wrote', path)
        sys.exit(0)
    for sampling in ('arterial', 'venous'):
        print(f'--- Eleveld {sampling}')
        worst = 0
        for p, e, ee, s, se, m, me in table(sampling):
            de, ds, dm = (e - ee) / ee, (s - se) / se, (m - me) / me
            worst = max(worst, abs(de), abs(ds), abs(dm))
            print(f'{p.sex} {p.age:>3.0f}y {p.height:.0f}cm {p.weight:.0f}kg  E {e:6.1f} ({ee})  S {s:5.1f} ({se})  '
                  f'match {m:5.2f} ({me})  err {de:+.2%} {ds:+.2%} {dm:+.2%}')
        print(f'worst {worst:.2%}')
    e_off = ce_bolus(eleveld(REF, False), 4)[0]
    print(f'Eleveld opioid off, reference: {e_off:.1f} mg (expect about 187)')
