# OT simulator: cardiovascular model and waveform synthesis (research notes)

> Research notes from the OT simulator planning session (14 Oct 2026), compiled by AI research agents from published
> sources, paraphrased and cited; nothing here is clinically reviewed. The curated spec is `../MODEL.md`; these notes
> keep the detail (PMIDs, what could not be checked). Open-source projects named here were read for ideas and to
> cross-check numbers only; no code from them is used.

Research for the planning document. 14 Oct 2026. Pressures in mmHg. A number marked **[verify]** came from memory
or a secondary source and was not checked against the primary text in this session. A number marked **[design]** is a
calibration choice, not something from the literature.

## Summary of recommendations

1. **Model:** use a hybrid design.
   - A **mean-value lumped circulation** steps at dt 0.1 s. It is Guyton/Magder venous return with explicit stressed
     and unstressed volumes in 3 compliances (systemic arteries, systemic veins, pulmonary).
   - The atria are solved algebraically.
   - **Each beat** draws its stroke volume from ventricular–arterial coupling (ESPVR/EDPVR). The beats come from an
     event-driven rhythm engine.
   - **Waveforms are synthesised for display only**, at 125–250 Hz, from each beat's parameters. Nothing in the
     renderer feeds back into the model.
   - Do not use a pulsatile time-varying-elastance model: it needs about 0.5–5 ms explicit steps, or an implicit
     solver at 20 ms as in Pulse.
2. **Baroreflex:** use Ursino's (1998) structure, simplified. Filtered MAP goes into one sigmoid, which gives a
   sympathetic drive s and a vagal drive v. Four effectors follow, each a pure delay plus a first-order lag: heart
   period, SVR, venous unstressed volume, and Ees.
   - Heart period is T0 + vagal term − sympathetic term, with T0 the intrinsic heart rate.
   - Anaesthetics scale the sigmoid gain and the sympathetic tone, and shift the set point.
   - A β-blocker scales the sympathetic heart-period and Ees limbs; atropine scales the vagal limb.
3. **Haemorrhage and fluids:**
   - Bleed whole blood at the current Hct out of the venous compartment.
   - Infused crystalloid follows Hahn's volume kinetics: two compartments with MAP-dependent rate constants. Colloid
     stays in the plasma, with a half-life of 2–3 h. Blood adds red cells.
   - Hb is the Hb mass divided by the blood volume.
   - PPV is not computed directly. It emerges from per-beat SV under cyclic pleural pressure, a pulmonary transit
     delay, and the slope of the Starling curve.
4. **ECG:** use template beats built from sums of Gaussian kernels, with closed-form timings in ms, driven by
   separate atrial and ventricular clocks with an AV-node state machine. VF, AF f-waves, flutter and torsades get
   their own generators. Do not use the ECGSYN ODE.
5. **ABP and pleth:**
   - A per-beat half-sine ejection drives a 3-element Windkessel *renderer* at 2–4 ms substeps, using the model's own
     R, C and SV.
   - A second-order filter models the site transfer. A second second-order filter models the catheter-transducer
     (adjustable fn and ζ, plus a flush test).
   - The pleth is a two-Gaussian pulse, delayed after the R wave, with its amplitude tied to the perfusion index (PI).
6. **Monitor:**
   - Use Philips-like colours on black. Agents follow the ISO 5360 bottle colours. Alarms follow IEC 60601-1-8
     (visual and auditory).
   - The default limits are Philips-like factory values. NIBP measurements take about 30 s, and the OR default
     interval is 5 min.
   - The SpO2 tone uses log steps, which we choose ourselves: no standard sets them.

---

## 1. Model choice

### Recommendation

Use the **(c) hybrid** design, built on an **(a)-type mean-value core**. The reasons are below.

- **dt 0.1 s is about 8 steps per beat at 72/min.** Pulsatile time-varying elastance (TVE) cannot run at that step.
  Published TVE engines use 0.5 ms (Explain) or 20 ms (Pulse, with an implicit circuit solver). TVE could run as
  1 ms substeps inside each 0.1 s tick: a phone can do that, and it stays deterministic. The cost is real, though:
  - stiffness and valve logic;
  - beat-to-beat tuning for every rhythm;
  - harder calibration of the slow physiology (drugs, fluids) against MAP, CO and CVP targets.
- **Precedent.** HumMod, the largest Guyton-lineage model at about 5000 variables, is non-pulsatile (Hester 2011).
  The teaching monitors that inspired this request draw synthetic waveforms from beat parameters (see §7).
- **What the learner sees comes from per-beat quantities**: SV, HR, MAP, PP, PPV and rhythm. A per-beat SV computed
  from ventricular–arterial coupling gives:
  - preload, contractility and afterload effects, and EF;
  - PVC and AF beat-to-beat variation;
  - PPV.

  None of these need a pulsatile solver.

### Options compared

| Option | Examples | Step | Pros | Cons for us |
|---|---|---|---|---|
| (a) Mean-value lumped (Guyton VR + Starling) | HumMod (Hester 2011); classic Guyton/Coleman | s to min | Cheap, stable at 0.1 s, easy to calibrate to MAP/CO/CVP; stressed/unstressed volume is explicit | No waveforms or beat-to-beat effects unless they are added |
| (b) Pulsatile TVE + Windkessel | Ursino 1998; HPS/METI lineage (van Meurs 1997; Goodwin 2004 infant model); Explain (0.5 ms); Pulse/BioGears (20 ms implicit circuit) | 0.5–5 ms explicit; 20 ms implicit | Waveforms, PV loops and valve disease all emerge | Substeps, stiffness, valve logic, calibration effort; MAP numerics become noisy |
| (c) Hybrid: mean core + per-beat SV + display synthesis | Infirmary Integrated, patient-monitor-engine (§7) | 0.1 s model; 2–8 ms renderer | Deterministic, cheap; arrhythmia → mechanics; monitor-real waveforms | Waveform details (notch, damping) are synthesised, not emergent |

The Nottingham Physiology Simulator (Hardman 1998) is validated for respiratory and gas-exchange components. Its
validation paper does not describe a cardiovascular dynamic model. It takes cardiac output as an input.

### Core structure

There are three compliant compartments, with total volume conserved exactly:

- systemic arteries (`sa`);
- systemic veins (`sv`), which can optionally be split into splanchnic (slow) and peripheral (fast) beds;
- pulmonary (`p`).

The heart is two "per-beat pumps".

```
P_x = (V_x − Vu_x) / C_x                              (linear; clamp V_x ≥ 0)
Q_sys = (P_sa − P_sv) / SVR                           (systemic arteriolar flow)
Q_vr  = (P_sv − max(P_ra, P_collapse)) / R_vr         (venous return; P_collapse = 0 spontaneous, ≈ Ppl under IPPV)
Q_rv  = HR · SV_rv(P_ra − Ppl)  ;  Q_lv = HR · SV_lv(P_la − Ppl, Ees, Ea)
dV_sa/dt = Q_lv − Q_sys
dV_sv/dt = Q_sys − Q_vr + infusions − losses
dV_p /dt = Q_rv − Q_lv
```

- **Solve P_ra and P_la algebraically** each step: find P_ra so that `Q_vr(P_ra) = Q_rv(P_ra)`, and likewise for
  P_la. A small atrial compliance would be too stiff for explicit Euler at 0.1 s. Bisection with a fixed 20 iterations
  is deterministic.
- **Per-beat SV.** The rhythm engine fires a ventricular event. SV is computed from preload at that moment, then
  delivered evenly over the following RR interval as mean flow. The 0.1 s MAP stays smooth, and the renderer adds the
  pulsatility.
- **Ventricular–arterial coupling** (Sunagawa 1983; Kelly 1992):
  - `EDV = V0d + ln(1 + EDP_tm/A)/β` (EDPVR)
  - `Ea ≈ R_total/T` (Ea(PV) = Pes/SV in Kelly 1992)
  - `SV = (EDV − V0) · Ees/(Ees + Ea)`
  - `EF = Ees/(Ees+Ea)`

  This gives preload (Frank–Starling), contractility (Ees) and afterload (Ea) effects from one formula. Two options
  can be added:
  - filling-time loss, `EDV_eff = EDV_min + (EDV − EDV_min)(1 − e^(−t_dia/τ_f))`, with τ_f about 0.15–0.2 s
    **[design]**;
  - atrial kick, +15–25% of EDV when a P wave precedes the QRS by 80–250 ms **[verify: textbook figure]**.
- **Time constants at dt 0.1 s:**
  - arterial τ = SVR·C_sa ≈ 0.95 mmHg·s/mL × 1.5 mL/mmHg ≈ 1.4 s;
  - venous drainage τ = C_sv·R_vr ≈ 125 × 0.06 ≈ 7.5 s. Magder (2016) gives 20–24 s for splanchnic beds and 4–6 s for
    peripheral beds.

  Explicit Euler is stable, since dt/τ ≤ 0.07. Exact exponential updates are more robust.
- **Determinism caveats:**
  - Use a seeded PRNG (sfc32/mulberry32), never `Math.random`. Explain forbids it too.
  - Update in a fixed order, driven by sim time, never by the frame rate.
  - ECMA-262 leaves `Math.exp/sin/pow/log` *implementation-approximated*. Bitwise identity across browsers is
    therefore not guaranteed if those functions feed the state. Either compare golden tests with a tolerance, or use
    our own polynomial approximations in the state update. +, −, ×, ÷ and sqrt are exact under IEEE 754.

### Default parameters, 70 kg adult (awake, supine, spontaneous breathing)

| Quantity | Default | Range / note | Source |
|---|---|---|---|
| Total blood volume | 70 mL/kg = 4900 mL | Men 70–75, women about 65 mL/kg | Textbook **[verify]** |
| Stressed volume (whole circulation) | 1400 mL (20 mL/kg, about 28%) | 25–30% of TBV; 20.2 ± 1.0 mL/kg measured at circulatory arrest | Magder & De Varennes 1998; Magder 2016 |
| Mean systemic filling pressure | 10 mmHg | 7–10 classic awake; 18.8 ± 4.5 in ventilated post-cardiac-surgery patients (inspiratory-hold method); 14.5 head-up; 29.1 after 0.5 L colloid | Magder 2016 (its 70 kg example: Vs 1400, MCFP 10); Maas 2009 |
| Total vascular compliance | 140 mL/mmHg (2 mL/mmHg/kg) | Maas 2009: 0.98 mL/mmHg/kg (ventilated). Magder's example implies ~140 mL/mmHg (+1 L stressed → MCFP 10 → 17) | Magder 2016; Maas 2009 |
| Venous compliance C_sv | 120–125 mL/mmHg | Veins about 30× (Gelman) to 40× (Magder) as compliant as arteries; about 70% of blood volume | Gelman 2008; Magder 2016 |
| Arterial compliance C_sa | 1.5 mL/mmHg | 1.0–2.0; PP ≈ SV/C as a crude check | Stergiopulos 1999; Segers 2008 **[verify value]** |
| Pulmonary compliance C_p | 20 mL/mmHg | About 1/7 of systemic | Magder 2016 |
| Venous return gradient (MSFP − RAP) | 5–6 mmHg | Normal 4–8 mmHg | Magder 2016 |
| Resistance to venous return R_vr | 1.0 mmHg·min/L (0.06 mmHg·s/mL) | (10 − 4)/5.4 ≈ 1.1 | Derived |
| HR / SV / CO | 72 / 75 mL / 5.4 L/min | CI about 3 L/min/m² | Textbook; Pulse validation: HR 72, SV 80, CO 5.8, MAP 95, 114/74 |
| MAP, SBP/DBP | 90; 120/75 (radial may read 125/72) | — | — |
| CVP (RAP) | 4 | 2–8 | — |
| PAP / LAP (PAWP) | 22/10 (mean 15) / 8–9 | — | — |
| SVR | (90−4)/5.4 ≈ 15.9 WU ≈ 1270 dyn·s·cm⁻⁵ | Normal 800–1200 dyn ≈ **10–15** mmHg·min/L (÷80) | Unit conversion |
| PVR | (15−9)/5.4 ≈ 1.1 WU (90 dyn) | — | — |
| LV Ees / Ea / EF | 1.8 mmHg/mL / 1.3–1.5 / 0.55–0.6 | Chen 1998: Ees = 0.91·Ea + 0.53; the ratio is age-independent | Chen 1998; Kelly 1992 |
| LV EDPVR | A 0.165 mmHg, β 0.03 /mL, V0d 10 mL → EDV 140 at EDP 8; V0(ESPVR) 5 mL → SV ≈ 76 | Starling slope about 2.3 mL/mmHg at EDP 8 and about 6 at EDP 3 | **[design]** |
| RV Ees / Ea | 0.6 / 0.33 mmHg/mL → EF about 0.64 | — | **[design / verify]** |
| Splanchnic share of flow | 40% (two-bed option) | Splanchnic τ 20–24 s; peripheral τ 4–6 s | Magder 2016 |

**Note on SVR units.** The request's "1000–1200 dyn·s·cm⁻⁵ ≈ 15–20 mmHg·min/L" is off. Wood units = dyn·s·cm⁻⁵ ÷ 80,
so 1000–1200 dyn is 12.5–15 WU. The defaults above give 15.9 WU, which is on the high side of normal. That is fine for
an older theatre patient; for a young adult, lower it.

**Calibration recipe.** Fix the targets (MAP, CO, CVP, PAP, LAP and MSFP), then *solve* for the unstressed volumes
Vu_x so that steady state hits them. Do not hand-tune Vu.

**Sources:**
- Magder S. Volume and its relationship to cardiac output and venous return. *Crit Care* 2016;20:271. PMID
  27613307. doi:10.1186/s13054-016-1438-7.
- Magder S, De Varennes B. Clinical death and the measurement of stressed vascular volume. *Crit Care Med*
  1998;26:1061–4. PMID 9635656.
- Gelman S. Venous function and central venous pressure. *Anesthesiology* 2008;108:735–48. PMID 18362606.
- Maas JJ et al. *Crit Care Med* 2009;37:912–8. PMID 19237896.
- Schipke JD et al. Static filling pressure in patients during induced VF. *Am J Physiol Heart* 2003;285:H2510–5. PMID
  12907428. Even 13 s of VF gave no equilibrium: arterial 24 mmHg, CVP 11. Arterial pressure fell with τ 2.9 s and CVP
  rose with τ 3.6 s, which is useful for arrest dynamics.
- Sunagawa K et al. *Am J Physiol* 1983;245:H773–80. PMID 6638199.
- Kelly RP et al. *Circulation* 1992;86:513–21. PMID 1638719.
- Chen CH et al. *J Am Coll Cardiol* 1998;32:1221–7. PMID 9809929.
- Hester RL et al. HumMod. *Front Physiol* 2011;2:12. PMID 21647209.
- van Meurs WL, Good ML, Lampotang S. Functional anatomy of full-scale patient simulators. *J Clin Monit*
  1997;13:317–24. PMID 9338846.
- Goodwin JA et al. A model for educational simulation of infant cardiovascular physiology. *Anesth Analg*
  2004;99:1655–64. PMID 15562049. It is derived from an existing adult pulsatile model with baroreflex.
- Hardman JG et al. *Br J Anaesth* 1998;81:327–32. PMID 9861113.
- Pulse cardiovascular and nervous methodology (pulse.kitware.com, v4.4). The heart is TVE with a double Hill function
  (Stergiopulos); the engine time step is 20 ms.

---

## 2. Baroreflex

### Recommendation

Use Ursino's architecture, simplified to one afferent sigmoid and four effectors with delays. Each delay is a ring
buffer of D/dt slots.

```
MAP_f' = (MAP − MAP_f)/τ_a                         τ_a ≈ 2 s (Ursino τp 2.076 s; optional rate term τz 6.37 s)
s = 1/(1 + exp((MAP_f − P_set)/k)),  v = 1 − s    k ≈ 12 mmHg × (1/g_anaes)        [design; Ursino ka = 11.758]
Heart period  T  = T0 + a_v·v_eff(t−0.2 s, τ1.5 s) − a_s·s_eff(t−2 s, τ2 s)
SVR = SVR0·(1 + G_R·(s−0.5)) via delay 2 s, τ 6 s
Vu_sv = Vu0 − G_V·(s−0.5)     via delay 5 s, τ 20 s
Ees = Ees0·(1 + G_E·(s−0.5))  via delay 2 s, τ 8 s
```

**Heart-period defaults [design]:**
- T0 = 60/IHR, where the intrinsic heart rate IHR = 118.1 − 0.57·age (Jose & Collison 1970) **[verify formula
  constants]**. For age 35, IHR ≈ 98 and T0 ≈ 0.61 s. Ursino's T0 is 0.58 s.
- a_v = 0.69 s and a_s = 0.22 s give:
  - HR 72 at s = v = 0.5;
  - a reflex range of about 47–158/min;
  - resting baroreflex sensitivity (a_v + a_s)/(4k) ≈ **19 ms/mmHg**.

  This matches the awake human pressor-test value of 22.5 ± 17 ms/mmHg (Tanaka 1999).

**Effector gains [design]:**
- G_R ≈ 0.6–1.0, i.e. SVR ±30–50%.
- G_V ≈ 1000–1400 mL, i.e. ±500–700 mL, about ±7–10 mL/kg. Magder 2016: moderate sympathetic activation recruits
  about 10 mL/kg; extreme activation up to 18 mL/kg. Ursino's sensitivity analysis found venous unstressed-volume
  control is the **largest** contributor to the early response to haemorrhage.
- G_E ≈ 0.6 (±30%).
- **Resetting (optional, from Pulse):** after 7 min of more than ±5% deviation, the set point moves 35% of the way
  toward the current MAP.

### Ursino 1998 parameters (for reference)

Partly corroborated: the heart-period and Emax effector values match Kana's 2010 reproduction of Ursino & Magosso.
The rest **[verify against Ursino 1998 Tables 2–3]**.

| Block | Parameter | Value |
|---|---|---|
| Afferent (carotid sinus) | Pn, ka, fmin, fmax, τz, τp | 92 mmHg, 11.758 mmHg, 2.52 and 47.78 spikes/s, 6.37 s, 2.076 s **[verify]** |
| Sympathetic efferent | fes∞, fes0, fes,min, kes | 2.10, 16.11, 2.66 spikes/s, 0.0675 s **[verify]** |
| Vagal efferent | fev0, fev∞, kev, fcs0 | 3.2, 6.3, 7.06, 25 spikes/s **[verify]** |
| Heart period (sympathetic) | G, τ, D | −0.13 s/(spikes/s), 2 s, 2 s (Kana Table 2.5.10 ✓) |
| Heart period (vagal) | G, τ, D | 0.09 s/(spikes/s), 1.5 s, 0.2 s (✓) |
| Emax LV | G, τ, D | 0.475 mmHg/mL/(spikes/s), 8 s, 2 s (✓); RV 0.282 **[verify]** |
| Resistance (splanchnic / extrasplanchnic) | G, τ, D | 0.695 / 0.53 mmHg·s/mL, 6 s, 2 s **[verify]**. Ursino & Magosso 2000 used D 5 s, per Kana |
| Unstressed volume (splanchnic / extrasplanchnic veins) | G, τ, D | −265.4 / −132.5 mL, 20 s, 5 s **[verify]** |
| Heart period at rest without control | T0 | 0.58 s (✓, Tlałka 2024 Table 1) |

**Pulse's alternative** (adapted from Ottesen 1997):
- η_s = [1 + (P/P_set)^ν]⁻¹ with ν = 4.
- First-order effectors on HR, elastance, R and compliance.
- Saturation at a sympathetic fraction of 0.78; a "last-ditch" response at 40–45 mmHg, with effectiveness collapsing
  below 40.
- The page gives no numeric τ or gains.
- Pulse validation for a 10% bleed over 30 s, read at 200 s: HR +~30%, CO −15–20%, SVR +10–15%.
- Pulse does not track unstressed volume, and lists this as a limitation. We should track it.

### Anaesthetics, β-blockade and atropine

| Agent | Human evidence | Model mapping [design] |
|---|---|---|
| Isoflurane | HR baroreflex slopes fall progressively from awake to 1.0 and 1.5 MAC. Depression is less than with halothane or enflurane (Kotrly 1984) | g_anaes = 1/(1 + (MAC/0.9)^1.5) → about 0.5 at 1 MAC; sympathetic tone ×(1 − 0.3·MAC) |
| Sevoflurane | BRS 22.5 ms/mmHg awake vs about 4.4–6.2 at 2% Et + 67% N2O; still depressed 20 min after extubation (Tanaka 1999) | At about 1–1.2 MAC, g ≈ 0.25; recovery lags awakening by minutes |
| Propofol | Induction: MSNA −76%; forearm vascular resistance and BP fall; cardiac and sympathetic baroslopes reduced, especially for hypotension (Ebert 1992). Steady propofol/N2O: HR baroreflex sensitivity *preserved* but **reset** to lower pressures (Cullen 1987) | Set point −10 to −20 mmHg; sympathetic tone × (1 − 0.7·E); g ≈ 0.5–0.8; E = effect-site effect fraction |
| Etomidate | MSNA, SVR and baroslopes preserved (Ebert 1992) | Little change |
| Opioids | Morphine/diazepam/N2O (Kotrly 1984b, PMID 6496994) **[verify findings]** | Vagal bias up (bradycardia), modest g reduction |
| β1-blocker | Blocks sympathetic chronotropy and inotropy; α-mediated SVR and venoconstriction intact | Scale a_s and G_E by (1 − b); no effect on G_R and G_V → haemorrhage tachycardia blunted but MAP defence partly kept |
| Atropine / glycopyrrolate | Vagal block → HR rises toward IHR (about 100–110 in young adults; lower with age) | Scale a_v by (1 − m) |
| Atropine + β-blocker | Complete autonomic blockade → HR = IHR (the Jose & Collison method) | Both scales → T = T0 |

**Sources:**
- Ursino M. Interaction between carotid baroregulation and the pulsating heart: a mathematical model. *Am J Physiol*
  1998;275:H1733–47. PMID 9815081. doi:10.1152/ajpheart.1998.275.5.H1733.
- Kana M. *Mathematical models of cardiovascular control by the autonomic nervous system*. PhD thesis, CTU Prague,
  2010. arXiv:1901.05071. Tables 2.5.10–2.5.14 give Ursino & Magosso values.
- Tlałka K et al. ICCS 2024. doi:10.1007/978-3-031-63772-8_17. A sensitivity analysis of Ursino's baroreflex: the
  set point Pn is the most influential factor.
- Pulse Nervous Methodology (Ottesen JT, *J Math Biol* 1997).
- Jose AD, Collison D. *Cardiovasc Res* 1970;4:160–7. PMID 4192616.
- Kotrly KJ et al. *Anesthesiology* 1984;60:173–9. PMID 6696251.
- Tanaka M, Nishikawa T. *Br J Anaesth* 1999;82:350–4. PMID 10434814.
- Cullen PM et al. *Anesth Analg* 1987;66:1115–20. PMID 3499095.
- Ebert TJ et al. *Anesthesiology* 1992;76:725–33. PMID 1575340.

---

## 3. Haemorrhage, fluids, Hb and PPV

### Recommendation

- **Bleeding** removes whole blood at the current Hct from V_sv. Bleeding from V_sa would distort arterial pressure at
  0.1 s.
- **The reflex response emerges from the baroreflex** (§2). It is not scripted by ATLS class.
- **Fluids** use Hahn's volume kinetics, with excess volumes in mL:
  - `dv1/dt = R_inf − (k12 + k10)·v1 + k21·v2`
  - `dv2/dt = k12·v1 − k21·v2`
  - Here v1 adds to plasma, and so to V_sv.
- **Hb** = M_Hb/BV.

### ATLS classes (9th/10th edition) and real-world caveats

| Class | Loss (% / mL, 70 kg) | HR | SBP | Pulse pressure | Base deficit (10th ed., from Mutschler 2013) |
|---|---|---|---|---|---|
| I | <15% / <750 | Normal (<100) | Normal | Normal | 0 to −2 mmol/L |
| II | 15–30% / 750–1500 | Normal or ↑ (100–120) | Normal | ↓ | −2 to −6 |
| III | 31–40% / 1500–2000 | ↑ (120–140) | Normal or ↓ | ↓ | −6 to −10 |
| IV | >40% / >2000 | ↑↑ (>140) or paradoxical ↓ | ↓↓ | ↓ | < −10 |

The HR bands are the 9th-edition numbers **[verify against the current ATLS manual]**.

**Real-world caveats:**
- Only **9.3%** of 36,504 trauma patients matched the ATLS combination of HR, SBP and GCS. Tachycardia was weak
  (Mutschler, *Resuscitation* 2013).
- In conscious mammals, haemorrhage is **biphasic**. In the first phase, baroreflex vasoconstriction holds MAP. At
  about **30%** loss, a sudden second phase follows: sympathetic withdrawal, relative or absolute bradycardia, and a
  profound fall in pressure (Schadt & Ludbrook 1991).
- Pulse's validation against Guyton's data: MAP holds to about 20% loss, with a last-ditch plateau from about 35% to
  45%.

**Model targets [design]:**

| Loss | Awake | Under GA |
|---|---|---|
| 10% | HR +0–10, MAP −0–5 | Hypotension (MAP −10–20%) |
| 20% | HR +15–25, MAP −5–10, PP ↓ | Earlier hypotension, from about 10–15% loss |
| About 30% | Optional switch to the "decompensation" phase (vagal surge, SVR collapse); Class III picture | — |
| >40% | MAP <60, PEA risk | — |

Under GA, the HR rise is smaller and Vu recruitment is reduced, because the sympathetic tone is lower. Weiskopf 1984
(swine, PMID 6696255) is supporting animal data **[not read]**.

### Crystalloid, colloid, blood (Hahn)

- **Crystalloid:**
  - While infusing, plasma expansion is **50–60%** of the infused volume. It falls to **15–20%** within 30 min after
    the infusion ends (awake).
  - Distribution completes in 25–30 min.
  - Small volumes (250–500 mL) barely leave the plasma. More than 1 L given fast recruits a slow "third space", and
    the half-life becomes much longer (14 h vs 30 min).
- **GA and MAP.** During GA, **MAP drives the rate constants**. The intravascular half-life ln2/(k12+k10) is 15 min at
  MAP 110 but **80 min at MAP 60**; the elimination half-life ln2/k10 is 77 vs 737 min (Hahn 2021). Derived defaults:
  - **k12 ≈ 0.037/min and k10 ≈ 0.009/min at MAP 110;**
  - **k12 ≈ 0.008/min and k10 ≈ 0.001/min at MAP 60;**
  - interpolate between the two (non-linearly);
  - set k21 ≈ 0 during induction-related hypotension (Hahn 2021). Awake k21 ≈ 0.5·k12 **[design / verify]**.
- **Calibration example (Hahn 2021).** 1 L of Ringer's over 30 min at induction with MAP 70: **83% stays
  intravascular** and Hb falls from 150 to 129 g/L. The conventional assumption is +150 mL of blood volume, giving
  144 g/L.
- **Colloid (HES/albumin):** no distribution phase; intravascular half-life 2–3 h, so k10 ≈ 0.004–0.006/min. It goes
  straight into v1.
- **Blood:** red cells plus plasma, staying intravascular. PRBC Hct is about 0.55–0.65 **[verify for the local
  product]**.
- **Hb.** Track `M_Hb` (g) and `BV`. Bleeding ΔV removes `Hb·ΔV`, crystalloid adds volume only, and PRBC adds
  `Hb_unit·V`. Hct follows the red-cell volume divided by BV. Transcapillary refill after haemorrhage can reuse k21
  toward plasma when v1 < 0 **[design]**.

### PPV: definition, thresholds and how to model it

- **Definition:** PPV = (PPmax − PPmin)/((PPmax + PPmin)/2) over one breath.
- **Thresholds:**
  - Michard 2000 (septic, ventilated): **13%** separated responders from non-responders with sensitivity 94% and
    specificity 96%. Responders 24 ± 9% vs non-responders 7 ± 3%.
  - Under GA (Cannesson 2011, n = 413): a **grey zone of 9–13%** in about 25% of patients; AUC 0.89 vs 0.57 for CVP.
  - PPV is reliable only with **VT ≥ 8 mL/kg** (De Backer 2005), a closed chest, sinus rhythm and controlled
    ventilation.
  - Pleth: **PVI >14%** predicted responders (Cannesson 2008).
- **Model (emergent):**
  1. Under IPPV, pleural pressure is `Ppl(t) = Ppl_ee + f_tr·(Paw(t) − PEEP)`, with transmission f_tr ≈ 0.3–0.5
     (≈ C_L/(C_L + C_cw)) **[design / verify]**.
  2. Raised Ppl raises absolute P_ra, which lowers venous return (P_sv − P_ra) and RV preload.
  3. Pulmonary buffering and transit delay mean LV preload falls about **2–3 beats (~2 s)** later.
  4. Early inspiration also squeezes pulmonary blood toward the LV (a small in-phase rise).
  5. SV_lv per beat comes from the EDPVR slope at the operating point. So PPV is small when the patient is
     normovolaemic and large when hypovolaemic.

  Raised abdominal pressure partly raises MSFP. Magder: a pleural rise of 10 mmHg would abolish the 4–8 mmHg
  venous-return gradient without pulmonary buffering.
- **Calibration targets:**
  - normovolaemic, VT 8 mL/kg: PPV 5–10%;
  - after about 15–20% loss under GA: PPV 15–25%;
  - spontaneous breathing reverses the sign (inspiratory SBP fall 2–5 mmHg; >10 mmHg in tamponade);
  - PVI ≈ PPV × 1.1–1.3 (patient-monitor-engine's engineering value **[ENG]**).

**Sources:**
- Mutschler M et al. *Resuscitation* 2013;84:309–13. PMID 22835498.
- Mutschler M et al. *Crit Care* 2013;17:R42. PMID 23497602. doi:10.1186/cc12555.
- Schadt JC, Ludbrook J. *Am J Physiol* 1991;260:H305–18. PMID 1671735.
- Hahn RG. *Anesthesiology* 2010;113:470–81. PMID 20613481.
- Hahn RG. Understanding volume kinetics. *Acta Anaesthesiol Scand* 2020;64:570–8. PMID 31863457.
- Hahn RG. *Perioper Med* 2021. PMID 34629113. doi:10.1186/s13741-021-00204-5.
- Hahn RG. *Front Physiol* 2024;15:1439035. PMID 39263627.
- Michard F et al. *Am J Respir Crit Care Med* 2000;162:134–8. PMID 10903232.
- Michard F. Changes in arterial pressure during mechanical ventilation. *Anesthesiology* 2005;103:419–28. PMID
  16052125.
- Cannesson M et al. *Anesthesiology* 2011;115:231–41. PMID 21705869.
- De Backer D et al. *Intensive Care Med* 2005;31:517–23. PMID 15754196.
- Cannesson M et al. *Br J Anaesth* 2008;101:200–6. PMID 18522935.

---

## 4. Rhythms and ECG synthesis

### Recommendation

Use **template beats** that are sums of Gaussian kernels, evaluated in closed form per display sample. The timings
are in ms from each event. A **rhythm engine** drives them:

- an atrial clock (sinus, AF, flutter, ectopic or none);
- an AV-node state (1:1, first-degree, Wenckebach, Mobitz II, fixed ratio, dissociated, AF integrate-and-fire);
- a ventricular clock (conducted, escape junctional 40–60 or ventricular 20–40, ectopic focus VT/torsades,
  PVC/bigeminy, paced);
- a refractory period.

Each ventricular event also fires the **mechanical beat** that gives SV in §1. With SV ≈ 0 the event is PEA.

**Why not ECGSYN** (McSharry 2003):
- It is an ODE in phase angle that needs integration at about 256–512 Hz (`sfint` 512 by default).
- The whole beat stretches with RR, so PR and QT do not follow rate rules unless corrected.
- Dissociated P and QRS (complete heart block, AF, VT with AV dissociation) do not fit its single-oscillator design.
- The reference code is **GPL**. Reimplementing the published equations is fine; copying the code is not.

The template approach is what Explain (MIT) and patient-monitor-engine (MIT) use.

### Seed kernels, lead II at 60/min

These are engineering seeds from patient-monitor-engine's design brief, labelled **[ENG]** there. τ is the time from
QRS onset.

| Wave | τ (ms) | σ (ms) | Amplitude (mV) |
|---|---|---|---|
| P | −PR + 45 (−115) | 22 | 0.15 |
| Q | 12 | 8 | −0.08 |
| R | 40 | 10 | 1.1 |
| S | 62 | 9 | −0.25 |
| T | QT − 60 (≈340) | 45 rise / 30 fall (asymmetric, two half-Gaussians) | 0.30 |
| U (optional) | QT + 70 | 35 | 0.03 |

**Rate rules:**
- QT = QTc·RR^(1/3) (Fridericia; QTc 400 ms). Bazett is acceptable.
- PR shortens slightly with rate: 160 ms at 60/min, minimum about 110 ms.
- QRS stays nearly fixed.
- At about 150/min the P wave should ride on the T wave naturally, not as a special case.

**HRV (awake):**
- RSA 30–60 ms; LF (0.1 Hz) 20–40 ms; jitter 10–20 ms.
- Under GA, multiply these by 0.2–0.4.

### Rhythm list (what the monitor should draw)

| Rhythm | Parameters | Mechanics |
|---|---|---|
| Sinus, sinus brady (<60), sinus tachy (>100) | PR 120–200 (160), QRS 80–100, QTc 400–440 | Normal; filling-time loss at high rate |
| Junctional / accelerated junctional | 40–60 / 60–100; P absent or inverted, close to the QRS | Loses atrial kick (SV −15–25% **[verify]**) |
| AF | No P; f-waves 5–9 Hz, 0.02–0.15 mV (2–4 random-phase sinusoids or templates); irregular RR from the Lian 2006 AV-node integrate-and-fire model, or gamma RR (CV 0.15–0.25, RR_min 0.25–0.3 s) | Per-beat SV follows the preceding RR, so short RR gives a pulse deficit; no kick |
| Atrial flutter | Sawtooth 250–350/min, 0.1–0.3 mV; 2:1 or 4:1 | — |
| SVT (AVNRT) | 150–250, regular, narrow, P hidden | Short filling → SV ↓ |
| VT (monomorphic) | 120–250 (default about 170); QRS 140–200 ms, discordant T; AV dissociation (P waves march through) | SV ↓ 30–70% **[design]** → with pulse or pulseless |
| Torsades | 200–250/min, amplitude envelope cos(2πt/T), T = 5–20 beats; preceded by long QT | SV ≈ 0–20% |
| VF | Dominant frequency about 5 Hz. Early induced VF in ICD patients: 4.9–5.2 Hz (Bonnes 2015). Coarse 0.5–1 mV decaying to fine <0.2 mV over minutes; 4 AR(2) resonators or sinusoids at f·{0.8, 1, 1.25, 1.6} with random amplitude modulation | SV 0; arterial pressure decays to about 24 mmHg in about 13 s (Schipke 2003) |
| Asystole / P-wave asystole | Isoelectric line plus small noise; P only (ventricular standstill) | SV 0 |
| PEA | Any organised rhythm | SV ≈ 0 (pseudo-PEA: small SV shows on the arterial line) |
| AV blocks | 1st (PR >200); Mobitz I (PR_n grows by Δ(1−r^(n−1))/(1−r), Δ 60–120, r 0.5; groups 3:2–5:4); Mobitz II (fixed PR, dropped QRS); 2:1; 3rd (dissociation + escape) | Escape-rate CO |
| PVC, bigeminy, trigeminy, couplets | Wide 120–160 ms, no P, coupling 40–80% of RR, full compensatory pause (the SA clock is not reset); PAC resets it | PVC SV small (depends on coupling); post-pause beat larger |
| Paced | Spike plus wide QRS; capture threshold | — |
| ST changes (ischaemia) | ST offset 0.1–0.3 mV between the J point and the T wave (elevation or depression, lead-specific: II vs V5); T inversion; ST numeric at J+60/80 ms | Optional Ees ↓ |
| Hyperkalaemia | Staged: tall narrow T (amplitude ×2–3, σ ↓) → PR ↑ and P flattening → QRS widening → sine wave → VF or asystole | Mattu 2000; ECG is **insensitive** for K⁺ (Montague 2008), so tie stages loosely to K⁺ |

Device chain:
- band-pass in monitor mode 0.5–40 Hz; diagnostic 0.05–150 Hz;
- notch;
- QRS detector on the *displayed* lead. Tall T waves and artefact then cause realistic double-counting.

**Sources:**
- McSharry PE, Clifford GD, Tarassenko L, Smith LA. A dynamical model for generating synthetic electrocardiogram
  signals. *IEEE Trans Biomed Eng* 2003;50:289–94. PMID 12669985.
- Lian J, Müssig D, Lang V. *IEEE Trans Biomed Eng* 2006. PMID 16916085.
- Bonnes JL et al. *Resuscitation* 2015;86:95–9. PMID 25449343.
- Mattu A et al. *Am J Emerg Med* 2000;18:721–9. PMID 11043630.
- Montague BT et al. *Clin J Am Soc Nephrol* 2008;3:324–30. PMID 18235147.
- Explain `Heart.md`: Gaussian ECG; AV-block, escape, VT and PVC modes.
- patient-monitor-engine `docs/DESIGN-BRIEF.md` §4.1, §5.

---

## 5. Arterial and pleth waveform synthesis

### Recommendation

Use a **display-only Windkessel renderer** for each beat.

1. At each mechanical beat, inject `Q(t) = Qpk·sin(πt/LVET)^κ` (κ 1–1.3) with ∫Q = SV. Add a 15–25 ms backflow bump
   for the incisura.
2. Feed it into a 3-element Windkessel (Zc, C, R) integrated at 2–4 ms (RK2/RK4):

   ```
   C·dPc/dt = Q − (Pc − P_sv)/R ;  P_ao = Pc + Zc·Q
   ```

   Use R = model SVR, C = model C_sa (optionally pressure-dependent), and Zc ≈ 0.03–0.06 mmHg·s/mL. This keeps the
   renderer consistent with the model's MAP. Add a slow offset correction (τ about 5 s) for drift.
3. **Site transfer, aorta to radial:** a second-order filter (f 4–8 Hz, ζ 0.2–0.4) delayed by the pulse transit time,
   so radial SBP is 5–20 mmHg above aortic. This is an [ENG] value.
4. **Catheter-transducer:** `H(s) = ωn²/(s² + 2ζωn s + ωn²)`, discretised with the bilinear transform (prewarped) at
   ≥250 Hz.
   - Default fn 20 Hz, ζ 0.45. Real lines run about 10–25 Hz with ζ 0.2–0.4.
   - **Underdamping** raises SBP and lowers DBP, keeping MAP. **Overdamping** narrows PP, keeping MAP.
   - **Flush test:** a step to about 300 mmHg, then ringing at fn that decays according to ζ. fn is the speed divided
     by the distance between peaks; ζ comes from the amplitude ratio (Gardner 1981; Saugel 2020).
   - Underdamping or resonance was found in **30.7%** of 300 cardiovascular patients, with invasive SBP 28.5 mmHg
     above NIBP (Romagnoli 2014).
5. **Line events:** zeroing (flat 0), levelling (0.74 mmHg/cm; 10 cm gives 7.5 mmHg), sampling, disconnection,
   damping (bubble or clot), and an NIBP cuff on the same arm.
6. **Numerics:** SBP and DBP are the per-beat maximum and minimum after the filters. MAP is the beat integral.
   Average over 4–8 beats and update at 1 Hz.

**Seeds** (patient-monitor-engine §4.2, [ENG]/[VERIFY]):
- LVET ≈ 413 − 1.7·HR ms (Weissler; men).
- R-wave to upstroke delay: radial 150–220 ms; finger PPG foot 200–300 ms.

The alternative is a parametric template: upstroke, notch, then exponential diastolic decay with τ = R·C. It is
cheaper, but AF, PVCs and pauses need special cases. The Windkessel renderer gives them for free.

### Pleth (SpO2) waveform

- **One pulse per mechanical beat** at t_R + PAT_finger, so pulse deficit and PEA follow automatically.
- **Shape:** two Gaussians, from Tang 2020 ("excellent" pulse): a1 1.0, θ1 −1.5161, b1 0.6303; a2 0.1999, θ2 0.8186,
  b2 1.0225 (θ in radians over the beat phase).
  - Vasoconstriction: a2/a1 of about 0.1–0.2, no notch.
  - Vasodilation: a2/a1 of about 0.4–0.6.
- **Amplitude** ∝ PI × (SV/SV0).
- **PI:**
  - Healthy adults: median **1.4%**, IQR 0.7–3.0, range 0.3–10 (Philips Viridia). PI <1.4 indicated poor peripheral
    perfusion in ICU patients (Lima 2002).
  - Modelled PI rises with GA vasodilation and falls with vasoconstrictors, hypothermia and hypovolaemia.
  - Show a "low perfusion" message below about 0.3% **[ENG]**.
- **Respiratory amplitude modulation** uses the same per-beat SV, so PVI emerges.
- **SpO2 device chain:**
  - circulation delay: finger about 10–20 s (longer when CO is low or the patient is vasoconstricted); ear about 5 s;
  - averaging about 8–10 s;
  - display update every 1–2 s.

  These are engineering values from patient-monitor-engine, not primary data **[verify]**.

**Sources:**
- Gardner RM. *Anesthesiology* 1981;54:227–36. PMID 7469106.
- Romagnoli S et al. *Crit Care* 2014;18:644. PMID 25433536.
- Saugel B et al. How to measure blood pressure using an arterial catheter: a systematic 5-step approach. *Crit Care*
  2020. doi:10.1186/s13054-020-02859-w.
- Stergiopulos N et al. *Am J Physiol* 1999;276:H81–8. PMID 9887020.
- Segers P et al. *Proc Inst Mech Eng H* 2008;222:417–28. PMID 18595354.
- Tang Q et al. Synthetic photoplethysmogram generation using two Gaussian functions. *Sci Rep* 2020. PMID 32807897.
  doi:10.1038/s41598-020-69076-x.
- Lima AP et al. *Crit Care Med* 2002;30:1210–3. PMID 12072670.
- Allen J. Photoplethysmography and its application in clinical physiological measurement. *Physiol Meas*
  2007;28:R1–39. PMID 17322588.

---

## 6. Monitor conventions

### Colours

**No agreed standard exists.** An APSF Q&A says schemes vary between and even within institutions, and are
configurable. Use a Philips-like default on black. The table is from patient-monitor-engine §6.8, which summarises
Philips documentation.

| Parameter | Default | Note |
|---|---|---|
| ECG / HR | Green | Universal convention |
| SpO2 / pleth / PR | Cyan | APSF's example institution used yellow |
| ABP | Red | — |
| NIBP | Red or white (some profiles magenta) | — |
| CVP | Blue (lighten to about #5AA9FF for contrast on black) or cyan | — |
| PAP | Yellow | — |
| CO2 / awRR | Yellow, or white in some OR profiles | Pick white if sevoflurane is yellow, to avoid a clash |
| Temp | Green or white | — |
| Alarm bars | Red / yellow / cyan (low and INOP) | GE and Mindray are similar |

**Agents.** No monitor-display colour standard was found, so this is unverified. The convention follows the ISO 5360
agent-specific bottle and vaporiser colour code: **halothane red, enflurane orange, isoflurane purple, sevoflurane
yellow, desflurane blue** (methoxyflurane green).

Related standards:
- **ISO 32:1977** governs gas cylinder colours. O2 is white internationally (green in the US), N2O blue, and air
  black/white (yellow in the US). Some monitors let you choose the O2/N2O/air scheme **[verify per vendor]**.
- **ISO 26825:2020** governs *syringe* label colours by drug class, not monitors:
  - induction agents yellow; benzodiazepines orange; opioids blue;
  - neuromuscular blockers fluorescent red; reversal agents red/white;
  - vasopressors violet; local anaesthetics grey; anticholinergics green; antiemetics salmon.

  These follow ASTM D4774/ISO 26825 **[verify the exact list]**.
- **ISO 80601-2-55:2018** (respiratory gas monitors) governs the monitor. Whether it mandates display colours could
  not be checked: the standard is paywalled.

### Layouts

These are described from typical screens and were not checked against current manuals.

- **Philips IntelliVue MX800, GE CARESCAPE B650, Dräger Infinity Delta/M540 and Mindray BeneVision** all share one
  pattern:
  - a black background;
  - a top line with patient category and alarm/INOP messages, colour-coded by priority;
  - stacked waveform lanes on the left two-thirds;
  - numerics on the right in the same colour and row as their wave;
  - the NIBP box with a timestamp, "Auto 5 min" and a countdown;
  - soft keys along the bottom.
- **A typical theatre profile:** ECG II and V5, ABP, Pleth, CVP or PAP, CO2, agent and airway pressure lanes.
  Numerics: HR, ABP S/D (M), SpO2/PR (PI), CVP mean, EtCO2/FiCO2/awRR, agents Et/Fi with MAC, NIBP, Temp and BIS.
- **Sweep speeds:** ECG, ABP and pleth 25 mm/s; CO2 and resp 6.25 mm/s.
- **At 390 px wide:** 25 mm/s is about 94 CSS px/s, so about 4 s of ECG fits across. Use 3–4 lanes (ECG, ABP, Pleth,
  CO2) with a compact numeric column (about 30%) or a numeric grid below. Landscape reproduces the full monitor.

### Alarms: IEC 60601-1-8:2006 + AMD1:2012 + AMD2:2020

| Priority | Visual | Auditory (the classic "IEC" set) |
|---|---|---|
| High | **Red, flashing 1.4–2.8 Hz, 20–60% on** | **10 pulses**: two groups of 5, each in a 3+2 rhythm. Pulse duration td 75–200 ms; spacing x 50–125 ms (gaps x, x, 2x+td, x); groups 0.35–1.30 s apart; bursts repeat every **2.5–15 s** |
| Medium | **Yellow, flashing 0.4–0.8 Hz, 20–60% on** | **3 pulses**: td 125–250 ms, spacing 125–250 ms; bursts repeat every 2.5–30 s |
| Low | **Cyan or yellow, steady** | **1–2 pulses**, optional repeat (>15 s) |

**Rules for all pulses:**
- fundamental 150–1000 Hz, with ≥4 harmonics in 300–4000 Hz within ±15 dB of the fundamental;
- rise time 10–20% of td;
- no more than 10 dB difference between pulses in a burst;
- priorities 3–6 dB apart (a practical recommendation).

The burst timings match the IEC ranges as reproduced in patient-monitor-engine §6.4 and the Har-El standard notes.
The visual specification comes from a patent reproducing the standard's table (US20110080294), so treat it as
secondary.

**AMD2:2020** no longer recommends the old melody scheme (for example cardiac "c-e-g" medium, "c-e-g—g-C" high). It
introduces **auditory icons** by category (for example a "lup-dup" heartbeat for cardiovascular) mixed with
**auditory pointers** that encode priority. Pointer effective pulse durations: high 25–75 ms, medium 90–200 ms, low
400–600 ms (PUI Audio application note, secondary). Either the classic set or icons is defensible. The classic set is
what most installed monitors still sound like **[verify]**.

**Implementation notes:**
- Use Web Audio `PeriodicWave` with harmonics 1–5.
- 2 Hz flashing is under the WCAG 2.3.1 limit of three flashes per second. Keep the flashing area small, and give
  `prefers-reduced-motion` a steady alternative.
- Silence for 90 s or 2 min; pause for 3 min **[vendor-specific]**.

### Default alarm limits (Philips factory, adult)

These come via patient-monitor-engine §6.8 and need checking against the IntelliVue IFU **[verify]**. GE and Mindray
tables were not retrieved: the Mindray DPM 4 sheet found is a blank template.

| Parameter | Low–high |
|---|---|
| HR / pulse | 50–120 |
| SpO2 | 90–100 (desaturation 80) |
| NBP S / M / D | 90–160 / 60–110 / 50–90 |
| ABP S / M / D | 90–160 / 70–110 / 50–90 |
| CVP mean | 0–10 |
| awRR | 8–30; apnoea 20 s |
| EtCO2 | 30–50; imCO2 high 4 |
| Temp | 36–39 °C |
| Asystole / pause | 4 s / 2 s |

**Delays:** SpO2 limits 10 s; arrhythmia analysis is often off in anaesthesia profiles.

### NIBP

- **ASA:** arterial BP and HR evaluated **at least every 5 min** (Standards for Basic Anesthetic Monitoring; last
  amended 2010, reaffirmed 2020). The AAGBI 2021 guideline covers UK and Ireland minimum monitoring (Klein 2021).
- **Auto intervals:** typically 1, 2, 2.5, 3, 5, 10, 15, 20, 30, 45, 60 and 120 min; STAT mode repeats measurements
  for 5 min.
- **Measurement:** about **30 s** adult (inflation to about 165 mmHg, then step deflation), maximum 180 s.
- **Errors:** they emerge from sampling true beats (AF, respiratory variation, motion). The validation criterion is
  mean ±5 mmHg, SD ≤8 (ISO 81060-2 / AAMI; **[verify edition]**).

### SpO2 pulse tone

- **No standard pitch mapping was found.** ISO 80601-2-61:2017, now superseded by a 2026 edition, was not readable.
- **Loeb, Brecknell & Sanderson 2016** surveyed 21 oximeters:
  - fundamentals at 100% ranged 479–921 Hz; at 1%, 38–404 Hz;
  - steps were linear in 6 models and logarithmic in 6;
  - only 6 models changed pitch at every 1% step; 5 stopped falling below a cutoff;
  - loudness also changes with saturation.
- 67% of volunteers detected a single 1% step (Schulte & Block 1992).
- Enhanced sonifications (tremolo plus brightness bands) improve range detection (Paterson 2017, 2020). This could be
  an optional "enhanced tone" setting.
- **[design]:** `f = 880·1.0293^(SpO2−100)`, i.e. half a semitone per 1%:
  - 90% → 659 Hz; 80% → 494; 70% → 370; 1% → about 50 Hz (within Loeb's range);
  - change pitch at every 1% step, with no floor cutoff;
  - a short tone (about 30–50 ms with harmonics) on each pleth upstroke.

**Sources:**
- IEC 60601-1-8:2006/AMD1:2012/AMD2:2020; Har-El 60601-1-8 notes; PUI Audio app note (Farnell 4425559);
  US20110080294A1 (patent reproducing the visual table).
- APSF Q&A "Colors for ECG tracings, SpO2 …" (apsf.org).
- Loeb RG et al. *Anesth Analg* 2016;122:1395–403. PMID 27028772. doi:10.1213/ANE.0000000000001240.
- Schulte GT, Block FE. *J Clin Monit* 1992;8:198–200. PMID 1494925.
- Paterson E et al. *Br J Anaesth* 2017;119:1224–30. PMID 29045578.
- Paterson E et al. *Br J Anaesth* 2020;125:826–34. PMID 32682554.
- Klein AA et al. *Anaesthesia* 2021;76:1212–23. PMID 34013531.
- ASA Standards for Basic Anesthetic Monitoring.
- ISO 5360:2016; ISO 32:1977; ISO 26825:2020; ISO 80601-2-55:2018 (titles and scope only).

---

## 7. Open-source projects to borrow *ideas* from

| Project | What it is | Language | Licence | Worth borrowing (ideas) |
|---|---|---|---|---|
| **Explain engine** (github.com/explain-labs/explain-engine; Zenodo 10.5281/zenodo.21389097) | Whole-body neonatal and adult cardiorespiratory engine by Tim Antonius | JS ES modules, Web Worker, no dependencies | **MIT** (© 2026 Tim Antonius) | TVE heart at **0.5 ms** (`modeling_stepsize` 0.0005); conduction state machine (AV block modes, escape pacemaker, VT, `trigger_pvc()`); Gaussian ECG; forbids `Math.random`; factor system for drug/ANS effects. The patient-monitor-engine brief calls Explain "unlicensed", but the repo now has an MIT LICENSE |
| **patient-monitor-engine** (github.com/samhv-dev/patient-monitor-engine) | Simulated monitor engine (ECG, IBP, NIBP, SpO2, EtCO2) | TypeScript, Web Worker + Canvas2D | **MIT** (pre-release) | Its `docs/DESIGN-BRIEF.md` is the closest match to our plan: kernels, Windkessel renderer, transducer filter, NIBP cycle, IEC alarm timings, vendor-default tables, licence hygiene. Many values are tagged [ENG]/[VERIFY] |
| **Infirmary Integrated** (github.com/tanjera/infirmary-integrated) | Monitor, defibrillator, 12-lead, IABP and CTG simulator; about 29 rhythms | C# (.NET) | **Apache-2.0** | Rhythm list and vertex-table waveforms (the NOTICE file is required if data is copied) |
| **Pulse Physiology Engine** (pulse.kitware.com) | Whole-body engine, BioGears lineage | C++ | **Apache-2.0** | Cardiovascular, nervous and haemorrhage methodology pages and validation tables (§1–3); 20 ms step |
| **BioGears** | Pulse's predecessor | C++ | Apache-2.0 **[verify]** | Same as Pulse |
| **HumMod** (hummod.org) | Guyton-lineage integrative model, 5000 variables, XML | C# / XML | Unclear | Mean-value relationships |
| **ECGSYN** (physionet.org/content/ecgsyn) | McSharry dynamical ECG | C / Matlab / Java | **GPL** | Read the paper only; do not copy code |
| **NeuroKit2** | `ecg_simulate`, `ppg_simulate` | Python | MIT | PPG landmarks. Its ECGSYN-derived simulator inherits the GPL question, so avoid it |
| **PhysioNet RCVSIM** (Mukkamala & Cohen) | Lumped pulsatile cardiovascular model with baroreflex and respiration | C / Matlab | GPL **[verify]** | Parameter tables (ideas only) |
| **CellML / Physiome repository** | E.g. Heldt 2002 orthostatic lumped model; baroreflex models | CellML | Per model (often CC BY) | Parameter tables |
| van Meurs & Antonius 2018 "explanatory models" tutorial | TGA teaching model; software on Dropbox | — | Article CC BY 4.0; software unstated | Teaching framing (the diagram and the model side by side). *Adv Simul* 2018;3:27. doi:10.1186/s41077-018-0085-2 |

---

## Uncertain (check before relying on these)

1. **Ursino 1998 values** not corroborated in this session:
   - afferent: Pn, ka, fmin, fmax;
   - efferent: fes∞, fes0, kes, fev0, fev∞, kev, fcs0;
   - SVR gains and delay (2 s in Ursino 1998 vs 5 s in Ursino & Magosso 2000);
   - unstressed-volume gains −265.4 / −132.5 mL;
   - RV Emax 0.282.

   Only the HR (sympathetic and vagal) and LV Emax effector G/τ/D, and T0 = 0.58 s, were cross-checked, against Kana
   2010 and Tlałka 2024.
2. **Intrinsic HR formula** (118.1 − 0.57·age). The abstract was not available; it is widely quoted.
3. **Human MSFP and compliance:**
   - Awake values of 7–10 mmHg come from animal and indirect data.
   - Ventilated ICU measurements are much higher (Maas 2009: 18.8 mmHg; C 0.98 mL/mmHg/kg).
   - The 140 mL/mmHg default is inferred from Magder's worked example.
4. **Arterial compliance (1.5 mL/mmHg), Zc, and LVET formula constants** (Weissler) were not checked in primary
   sources.
5. **LV/RV Ees, EDPVR A and β, atrial-kick share (15–25%) and filling-time τ** are design values.
6. **Hahn rate constants.** The k12/k10 values are derived from the half-lives reported in Hahn 2021 (MAP-dependent).
   k21 is a design value. The micro-constants in Hahn's tables were not seen.
7. **ATLS** 10th-edition wording and base-deficit columns. The HR bands are from the 9th edition and reproductions.
8. **Anaesthetic gain multipliers** (g_anaes vs MAC or propofol effect). They are calibrated to BRS data, not
   literature formulas. The two propofol studies disagree: Ebert 1992 found slopes reduced; Cullen 1987 found them
   preserved but reset.
9. **Pleural pressure transmission f_tr (0.3–0.5) and transit delay (2–3 beats).** These are physiology-textbook
   values, not verified here.
10. **Monitor colours and default limits.**
    - The Philips defaults come from a secondary source (patient-monitor-engine).
    - GE, Dräger and Mindray layouts and colours were not checked against manuals.
    - No standard was found that mandates agent colours on monitors, so ISO 5360 is a convention.
    - The clauses of ISO 80601-2-55 and ISO 80601-2-61 were not readable.
11. **IEC 60601-1-8.**
    - The visual flash rates come from a patent reproducing Table 2.
    - The auditory timings come from secondary reproductions.
    - The AMD2:2020 pointer durations come from a vendor note.
12. **ISO 26825 colour list** (from memory) and **ISO 81060-2** NIBP criteria (mean ±5, SD ≤8; current edition not
    checked).
13. **SpO2 tone mapping** is our own design. Vendor step sizes (Philips, Masimo, Nellcor) are not public in the
    abstracts read.
14. **Licences.** BioGears (Apache-2.0) and RCVSIM (GPL) are from memory. The Explain licence was added in 2026: check
    the history if copying anything.
15. **The Nottingham Physiology Simulator's cardiovascular component.** Its structure and step size were not found;
    only the respiratory validation was read.
16. **DOIs not shown** for Michard 2000, McSharry 2003 and Lian 2006 were not confirmed. The PMIDs above are
    confirmed.
