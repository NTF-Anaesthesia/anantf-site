# PK/PD parameter sets for a teaching anaesthesia simulator

> Research notes from the OT simulator planning session (14 Oct 2026), compiled by AI research agents from published
> sources, paraphrased and cited; nothing here is clinically reviewed. The curated spec is `../MODEL.md`; these notes
> keep the detail (PMIDs, what could not be checked). "Planning check" means a throwaway integration done during
> planning, not code in this repo. Open-source libraries named here were read to cross-check numbers only; no code
> from them is used.

Research note for a planning document. All parameters are from published population models; a teaching
simulator (synthetic patient, JavaScript) would implement the 3-compartment mammillary model plus an
effect-site compartment driven by `ke0`. Numbers are cross-checked against two independent open-source
reference implementations of these models:

- **opentiva** v1.1.2 (Python TCI library; `opentiva/*.py`), which stores each model's `pmid`/`doi`.
- **Python_Anesthesia_Simulator** v1.0.0 (`pk_models.py`), an independent reimplementation.

Both agree on every shared value below except where flagged. I re-derived the sanity numbers (times to
peak effect, context-sensitive half-times) with a planning-check RK4 integration of the 3-compartment + effect-site
ODEs, so those are model predictions, not transcribed, and are reproducible.

Convention: rate constants in min⁻¹; volumes in L; propofol conc µg/mL ≡ mg/L; opioid conc ng/mL.
Micro-rate form: k10 = CL1/V1, k12 = CL2/V1, k13 = CL3/V1, k21 = CL2/V2, k31 = CL3/V3.

---

## 1. Propofol — Marsh (1991)

**Primary source:** Marsh B, White M, Morton N, Kenny GNC. *Pharmacokinetic model driven infusion of
propofol in children.* Br J Anaesth 1991;67(1):41–48. **PMID 1859758**, DOI 10.1093/bja/67.1.41.
(Verified title/authors/journal via PubMed. The adult parameter set actually used in TCI is an adaptation of
the Gepts 1987 data; the rate constants are fixed, only V1–V3 scale with weight — confirmed by Absalom et al.
2009, below.)

Weight-proportional volumes; fixed rate constants. For a 70 kg adult:

| Parameter | Value | Unit |
|---|---|---|
| V1 | 0.228 × wt (= 15.96 L @70 kg) | L |
| V2 | 0.463 × wt (= 32.4 L) | L |
| V3 | 2.893 × wt (= 202.5 L) | L |
| k10 | 0.119 | min⁻¹ |
| k12 | 0.112 | min⁻¹ |
| k13 | 0.0419 | min⁻¹ |
| k21 | 0.055 | min⁻¹ |
| k31 | 0.0033 | min⁻¹ |
| ke0 (original "Diprifusor") | **0.26** | min⁻¹ |
| ke0 ("modified Marsh") | **1.2** (some sources 1.21) | min⁻¹ |

- Both opentiva (`MarshDiprifusor`, `MarshModified`) and Python_Anesthesia_Simulator use exactly these rate
  constants, V-coefficients 0.228/0.463/2.893, and the two ke0 values 0.26 and 1.2.
- **ke0 = 0.26 min⁻¹** is the value embedded in the commercial Diprifusor; confirmed as the Marsh/Diprifusor
  value by the effect-site-TCI comparison literature (t½ke0 ≈ 2.6 min).
- **ke0 = 1.2 min⁻¹ ("modified Marsh")** source: **Struys MM, De Smet T, Depoorter B, et al.** *Comparison of
  plasma compartment versus two methods for effect compartment–controlled target-controlled infusion for
  propofol.* Anesthesiology 2000;92(2):399–406. **PMID 10691226.** In brief: a biophase model combining
  **Marsh kinetics and a time-to-peak-effect of 1.6 min** best predicted the BIS time course; the authors chose ke0
  so that a bolus peaks at 1.6 min, which gives a t½ke0 of 34 s, i.e. ke0 ≈ 1.2 min⁻¹. So Struys 2000 is the correct citation for the fast ke0, and it is defined by TTPE =
  1.6 min, not by the rounded number.

**Context for the ke0 split** (secondary, for the planning doc): Absalom AR, Mani V, De Smet T, Struys MMRF.
*Pharmacokinetic models for propofol — defining and illuminating the devil in the detail.* Br J Anaesth
2009;103(1):26–37. **PMID 19520702**, DOI 10.1093/bja/aep143. Confirms Marsh = adapted Gepts model, fixed rate
constants, weight-proportional volumes/clearances.

**Uncertain / disagreeing**
- ke0 "1.2" vs "1.21": the literature uses both; 1.21 is the value that reproduces TTPE = 1.6 min almost
  exactly (planning check: ke0 1.2189 → 1.60 min). Use 1.2 and state TTPE ≈ 1.6 min, or use 1.21 explicitly.
- k31: opentiva uses 0.0033; the older jsTCI code uses 0.0031. Published Marsh/Diprifusor value is 0.0033 —
  use that.
- Marsh has **no age/height input at all**; only weight. In plasma-target mode the large fixed V1 gives large
  induction doses — a teaching point worth surfacing.

---

## 2. Propofol — Schnider (1998 PK / 1999 PD)

**PK primary source:** Schnider TW, Minto CF, Gambus PL, Andresen C, Goodale DB, Shafer SL, Youngs EJ. *The
influence of method of administration and covariates on the pharmacokinetics of propofol in adult
volunteers.* Anesthesiology 1998;88(5):1170–82. **PMID 9605675**, DOI 10.1097/00000542-199805000-00006.

**PD / ke0 primary source:** Schnider TW, Minto CF, Shafer SL, Gambus PL, Andresen C, Goodale DB, Youngs EJ.
*The influence of age on propofol pharmacodynamics.* Anesthesiology 1999;90(6):1502–16. **PMID 10360845.**
The abstract (checked) gives the plasma–effect-site equilibration rate constant as **0.456 min⁻¹**, with a predicted
time to peak effect after a bolus of 1.7 min and an observed one of 1.6 min.

Covariate equations (identical in opentiva `Schnider` and Python_Anesthesia_Simulator; LBM by the **James
1976** formula):

| Parameter | Equation | Note |
|---|---|---|
| V1 | 4.27 | L, fixed |
| V2 | 18.9 − 0.391 × (age − 53) | L |
| V3 | 238 | L, fixed |
| CL1 (metabolic) | 1.89 + 0.0456 × (wt − 77) − 0.0681 × (LBM − 59) + 0.0264 × (ht − 177) | L/min |
| CL2 | 1.29 − 0.024 × (age − 53) | L/min |
| CL3 | 0.836 | L/min |
| k10 | CL1/V1 | min⁻¹ |
| k12 | CL2/V1 | min⁻¹ |
| k13 | CL3/V1 (fixed ~0.196) | min⁻¹ |
| k21 | CL2/V2 | min⁻¹ |
| k31 | CL3/V3 (fixed 0.0035) | min⁻¹ |
| ke0 | **0.456** | min⁻¹ |

**LBM — James formula** (as implemented in both libraries):
- male: LBM = 1.1 × wt − 128 × (wt/ht)²
- female: LBM = 1.07 × wt − 148 × (wt/ht)²   (wt kg, ht cm)

For a 40 y, 70 kg, 170 cm male: James LBM = 55.3 kg; CL1 = 1.64 L/min; k10 = 0.384; k12 = 0.375; k13 = 0.196;
k21 = 0.067; k31 = 0.0035; V2 = 24.0 L. (computed in planning)

**The James LBM paradox (obese patients)** — confirmed by Absalom 2009 (PMID 19520702), which warns that in
morbid obesity the LBM equation gives paradoxical values and so far too high maintenance rates. The James LBM
function is non-monotonic: it peaks and then *falls* as weight rises. The turning point (computed in planning): for a 170 cm male LBM is maximal at ≈124 kg and decreases above that
(e.g. male 170 cm: 100 kg → LBM 65.7; 150 kg → 65.3; 180 kg → 54.5). For a 160 cm female the peak is ≈92 kg,
after which LBM drops steeply (160 kg → 23 kg). Because Schnider CL1 contains a **−0.0681 × (LBM − 59)** term,
a falling LBM pushes CL1 *up* (170 cm male: CL1 1.64 → 2.30 → 5.24 L/min from 70 → 100 → 160 kg), giving
dangerously high maintenance rates. Practical guard: most TCI pumps block the Schnider model above BMI ~35
(female)/42 (male) — opentiva encodes exactly these BMI caps. Schnider should be run in **effect-site mode**
(small fixed V1 otherwise gives trivial induction boluses).

**Uncertain / disagreeing**
- V2 age term: opentiva uses (age − **52**); Python_Anesthesia_Simulator and the original paper use
  (age − **53**). The difference is ~0.4 L — negligible — but the paper value is 53. Use **53**.
- ke0 0.456 is from the 1999 PD paper's canonical-univariate EEG analysis; it is faster than earlier estimates.
  TTPE ≈ 1.6–1.7 min (planning check: 1.52 min at age 40; note TTPE rises with age: 1.45 min @25 y, 1.71 min @75 y
  because V2/CL2 change, even though ke0 is fixed).

---

## 3. Propofol — Eleveld (2018) [headline only]

**Primary source:** Eleveld DJ, Colin P, Absalom AR, Struys MMRF. *Pharmacokinetic–pharmacodynamic model for
propofol for broad application in anaesthesia and sedation.* Br J Anaesth 2018;120(5):942–959.
**PMID 29661412**, DOI 10.1016/j.bja.2018.01.018.

- **Practical to implement? Yes.** It is a closed-form allometric model — more covariate terms than
  Schnider, but all are explicit algebra (no tables, no iteration). Both reference libraries implement it in
  ~40 lines. Worth it for a teaching simulator precisely because it spans neonate→elderly→obese with one model.
- **Structure:** 3-compartment + effect site. Reference individual = 35 y, 70 kg, 170 cm male, no concomitant
  anaesthetic: **V1 6.28 L, V2 25.5 L, V3 273 L, CL 1.79, Q2 1.75, Q3 1.11 L/min, ke0 0.146 min⁻¹** (these
  exact reference values are stated in the paper's abstract — verified). Covariates: weight (sigmoidal
  maturation for V1/CL), age, post-menstrual age, height, sex, and presence/absence of opioids (opioids shrink
  V3 and CL). Size via **Al-Sallami fat-free mass** (not James). Fat-free mass drives V3.
- **ke0 = 0.146 × (wt/70)^−0.25** (arterial sampling); the venous variant is 1.24 × (wt/70)^−0.25. Ce50 ≈
  3.08 µg/mL with a small age effect (×exp(−0.00635×(age−35))). Planning check, reference adult: TTPE ≈ 2.9 min.
- Full θ₁–θ₁₈ constants are listed in opentiva `propofol.Eleveld` and Python_Anesthesia_Simulator (both match:
  V1ref 6.28, V2ref 25.5, V3ref 273, CLref male 1.79/female 2.10, Q2ref 1.75, Q3ref 1.11, maturation E50 42.3
  wk, slope 9.06, etc.) — copy from either if implementing.

**Uncertain** — the full PD (BIS) Ce50/γ/baseline values I could not verify line-by-line against the paper
(journal full text was paywalled; Europe PMC had no OA copy). Reference PK + ke0 are solid. If the PD layer is
needed, pull the exact Ce50/γ table from BJA 2018 directly.

---

## 4. Remifentanil — Minto (1997) + Eleveld (2017) headline

**Primary source:** Minto CF, Schnider TW, Egan TD, Youngs E, Lemmens HJM, Gambus PL, Billard V, Hoke JF,
Moore KHP, Hermann DJ, Muir KT, Mandema JW, Shafer SL. *Influence of age and gender on the pharmacokinetics
and pharmacodynamics of remifentanil. I. Model development.* Anesthesiology 1997;86(1):10–23. **PMID 9009935**,
DOI 10.1097/00000542-199701000-00004.

Covariate equations (opentiva `Minto` and Python_Anesthesia_Simulator identical; LBM = **James**):

| Parameter | Equation |
|---|---|
| V1 | 5.1 − 0.0201 × (age − 40) + 0.072 × (LBM − 55) |
| V2 | 9.82 − 0.0811 × (age − 40) + 0.108 × (LBM − 55) |
| V3 | 5.42 |
| CL1 | 2.6 − 0.0162 × (age − 40) + 0.0191 × (LBM − 55) |
| CL2 | 2.05 − 0.0301 × (age − 40) |
| CL3 | 0.076 − 0.00113 × (age − 40) |
| k10,k12,k13 | CLn/V1 |
| k21 = CL2/V2, k31 = CL3/V3 | |
| ke0 | **0.595 − 0.007 × (age − 40)** min⁻¹ |

For 40 y, 70 kg, 170 cm male: V1 5.12, V2 9.85, CL1 2.61, k10 0.509, k12 0.400, k13 0.0148, k21 0.208,
k31 0.014, ke0 0.595. TTPE ≈ 1.4–1.6 min (planning check 1.43 min). ke0 falls with age → slower onset in elderly
(planning check: 1.23 min @20 y, 2.26 min @80 y).

**Eleveld remifentanil (2017) headline:** Eleveld DJ, Proost JH, Vereecke H, Absalom AR, Olofsen E, Vuyk J,
Struys MMRF. *An allometric model of remifentanil pharmacokinetics and pharmacodynamics.* Anesthesiology
2017;126(6):1005–1018. **PMID 28509794**, DOI 10.1097/ALN.0000000000001634. Reference 35 y, 70 kg male:
**V1 5.81, V2 8.82, V3 5.03 L, CL 2.58, Q2 1.72, Q3 0.124 L/min, ke0 1.09 min⁻¹** (decreases with age)
(verified from abstract). Allometric size = Al-Sallami FFM; covariates weight, age, sex. The paper reports it
outperforms Minto across a wide age/weight range; practical to implement (closed-form, in both libraries).

**Uncertain / disagreeing**
- The Minto *simple* (no-covariate) model has different numbers (V1 4.98 L, ke0 0.516 min⁻¹) — do **not** mix
  these with the covariate set. The covariate set above is the one TCI pumps use.
- Minto applies only for age ≥12, weight ≥30 kg (opentiva limits).

---

## 5. Fentanyl — Shafer (1990) as used in STANPUMP

**Primary source:** Shafer SL, Varvel JR, Aziz N, Scott JC. *Pharmacokinetics of fentanyl administered by
computer-controlled infusion pump.* Anesthesiology 1990;73(6):1091–1102. **PMID 2248388**,
DOI 10.1097/00000542-199012000-00005.

Parameter set as implemented in opentiva `fentanyl.Shafer` (fixed, not weight-scaled below 80 kg):

| Parameter | Value | Unit |
|---|---|---|
| V1 | 6.09 | L |
| k10 | 0.0827 | min⁻¹ |
| k12 | 0.471 | min⁻¹ |
| k13 | 0.225 | min⁻¹ |
| k21 | 0.102 | min⁻¹ |
| k31 | 0.006 | min⁻¹ |
| (derived) V2 ≈ 28.1, V3 ≈ 228 L; CL1 ≈ 0.50, CL2 ≈ 2.87, CL3 ≈ 1.37 L/min | | |

**ke0 — this is the point of genuine disagreement. Clarified:**
- **Scott & Stanski 1985** (Scott JC, Ponganis KV, Stanski DR. *EEG quantitation of narcotic effect: the
  comparative pharmacodynamics of fentanyl and alfentanil.* Anesthesiology 1985;62(3):234–41, **PMID 3919613**)
  measured the blood–effect-site equilibration **half-time for fentanyl = 6.4 ± 1.3 min**, i.e. ke0 ≈ 0.11
  min⁻¹ (ln2/6.4). This is the *source of the slow fentanyl ke0*.
- The widely-quoted **ke0 = 0.147 min⁻¹** is the value tabulated with the Shafer parameter set in STANPUMP /
  open-TCI parameter lists (t½ke0 ≈ 4.7 min). opentiva's `Shafer` class uses **ke0 = 0.12** min⁻¹.
- **Shafer & Varvel 1991** (Shafer SL, Varvel JR. *Pharmacokinetics, pharmacodynamics, and rational opioid
  selection.* Anesthesiology 1991;74(1):53–63, **PMID 1824743**) is the source of the canonical **time to peak
  effect = 3.6 min** for fentanyl (and the t½ke0 = 4.7 min quoted in Miller's). That implies ke0 ≈ 0.147
  (planning check with Shafer PK + ke0 0.147 → TTPE 3.16 min; to get exactly 3.6 min needs ke0 ≈ 0.117, consistent
  with Scott & Stanski). So the various fentanyl ke0 values (0.108–0.147) all come from fitting TTPE/t½ke0 to
  this family of EEG studies; the mismatch is real and model-dependent.

**Recommendation for the simulator:** use the Shafer 1990 PK set (the STANPUMP set) with **ke0 = 0.147 min⁻¹**
if you anchor to the Miller's/Shafer-Varvel t½ke0 = 4.7 min table, or ke0 ≈ 0.12 (opentiva) if you anchor to
Scott & Stanski's 6.4-min half-time. State which you picked; TTPE lands 3.2–3.8 min either way.

**Uncertain / disagreeing**
- Shafer PK validated for 40–90 kg; opentiva's `ShaferW80` variant applies a weight adjustment above 80 kg
  (Shafer/Anesthesiology 2004) — optional.
- Note the "Scott" fentanyl PK (V1 12.7 L; PMID 3100765) is a *different* parameter set; with the same ke0 it
  gives TTPE ~4 min. Don't conflate the two.

---

## 6. Rocuronium — PK + PD (ke0, Ce50, Hill) for T1 depression

There is no single universally-used rocuronium TCI model; two citable options:

### Option A — Kleijn 2011 (the sugammadex-interaction model; recommended if you also model reversal)
Kleijn HJ, Zollinger DP, van den Heuvel MW, Kerbusch T. *Population pharmacokinetic–pharmacodynamic analysis
for sugammadex-mediated reversal of rocuronium-induced neuromuscular blockade.* Br J Clin Pharmacol
2011;72(3):415–433. **PMID 21535448**, DOI 10.1111/j.1365-2125.2011.04000.x. (PMCID PMC3175511; Table 4
values verified from the full text.)

Rocuronium (2-compartment, 70 kg typical, normal renal function):

| Parameter | Value | Note |
|---|---|---|
| V1 | 4.73 × (wt/70) | L; ×exp(−0.00143×(CrCl−119)) |
| V2 | 6.76 × (wt/70) | L; age term ×exp(0.00613×(age−43)) |
| CL | 0.269 × (wt/70)^0.75 | L/min; ×(1−0.00678×(age−43)) |
| Q2 | 0.279 × (wt/70)^0.75 | L/min; ×0.788 if Asian |
| **ke0** | **0.134 × (wt/70)^−0.25** | min⁻¹ (×0.433 with sevoflurane) |
| **Ce50 (EC50)** | **1.62 µM** | ×0.605 with sevoflurane |
| **Hill γ** | **7.52** | steep — this is for the **TOF-ratio (T4/T1)** response, not T1 |
| baseline E0 | 1.04 (T4/T1) | |
| complex KD | 0.0559 µM (fixed, in vitro) | 1:1 rocuronium:sugammadex |

Note γ = 7.52 is for TOF-ratio; the model's primary effect measure is T4/T1, but it reproduces T1 depression
too. EC50 1.62 µM × 609.7 g/mol (bromide) ≈ 0.99 µg/mL, or ≈ 0.86 µg/mL as the cation (529.8 g/mol). opentiva's
`rocuronium.Kleijn` uses exactly these equations.

### Option B — Wierda 1991 PK + Plaud/Masui PD (classic adductor-pollicis T1 model)
- PK: Wierda JM, Kleef UW, Lambalk LM, et al. *Pharmacodynamics and pharmacokinetics of Org 9426 … .* Can J
  Anaesth 1991;38(4 Pt 1):430–5. **PMID 1829656.** 3-compartment: V1 = 0.044 × wt (L), k10 0.1, k12 0.21,
  k13 0.028, k21 0.13, k31 0.01 min⁻¹.
- ke0: Masui K, et al. *Rocuronium pharmacodynamic models for published five pharmacokinetic models.* J Anesth
  2018;32(5):709–716. **PMID 30099599.** ke0 values 0.082–0.247 depending on PK model; ke0 for the Wierda PK
  ≈ 0.1–0.16 min⁻¹ (opentiva `Wierda` uses ke0 = 0.1 + (age−50)×−0.000725, ≈ 0.16 at age 36).
- Ce50/Hill for T1: Plaud B, Proost JH, Wierda JM, et al. *Pharmacokinetics and pharmacodynamics of rocuronium
  at the vocal cords and the adductor pollicis in humans.* Clin Pharmacol Ther 1995;58(2):185–91.
  **PMID 7648768.** At the **adductor pollicis**: t½ke0 = 4.4 ± 1.5 min (ke0 ≈ 0.16 min⁻¹), **Ce50 = 823 ± 157
  µg/L (≈ 0.82 µg/mL)**; at the **laryngeal adductors** t½ke0 = 2.7 min, Ce50 = 1424 µg/L (faster onset,
  higher Ce50 — explains why the cords are paralysed before the thumb). Hill coefficient typically γ ≈ 3–4.5
  for T1 in these studies (Dragne/Varin 2002, PMID 11927473, give EC50 592 µg/L under isoflurane vs 1008 µg/L
  under propofol — anaesthetic-dependent).

### Time-course expectations (sources to assert against)
- **Onset after 0.6 mg/kg:** FDA label (DailyMed, population data) — adults 18–64 y, **time to maximum block
  1.8 min (0.6–13), median; time to ≥80% block 1.0 min; clinical duration (T1 25%) 31 min (15–85).** At 0.9
  mg/kg onset 1.4 min, duration 58 min; at 1.2 mg/kg onset 1.0 min, duration 67 min. (US rocuronium bromide
  prescribing information, Table 5, verified via openFDA.)
- **Magorian, Flannery, Miller.** *Comparison of rocuronium, succinylcholine, and vecuronium for rapid-sequence
  induction …* Anesthesiology 1993;79(5):913–8. **PMID 7902034.** Onset 0.6 mg/kg = 89 ± 33 s; 0.9 mg/kg
  75 ± 28 s; 1.2 mg/kg 55 ± 14 s (vs sux 50 ± 17 s). Supports onset-to-max-block ~1.5–3 min at 0.6 mg/kg.
- Planning check (Wierda PK, ke0 0.158, Ce50 0.82 µg/mL, γ 4) at 0.6 mg/kg: ~100% block, time to ≥95% block ~1 min,
  T1 25% recovery ≈ 38 min, T1 90% ≈ 65 min — consistent with the label's ~1.8 min onset / ~31 min duration
  (my duration slightly long because Wierda PK has no elderly/anaesthetic adjustment). At 1.2 mg/kg, duration
  (T1 25%) ≈ 60 min. Good enough for a teaching sim; tune γ/Ce50 to hit the label numbers.
- **PK (FDA):** adults CL 0.25 L/kg/h, Vss 0.25 L/kg, t½β 1.4 h; geriatric t½β 1.5 h; hepatic impairment Vss
  up to 0.53 L/kg, t½β 4.3 h → ~1.5× duration. Three-compartment: rapid distribution t½ 1–2 min, slow 14–18
  min.

**Uncertain / disagreeing**
- Ce50 is strongly anaesthetic-dependent (propofol ~1.0 µg/mL vs isoflurane/sevo ~0.6 µg/mL; Dragne 2002,
  Kleijn sevo factor 0.605). Pick one background anaesthetic for the sim and state it.
- ke0 for rocuronium ranges 0.08–0.25 min⁻¹ across PK models (Masui 2018). For a teaching sim, ke0 ≈ 0.13–0.16
  gives the clinically expected ~1.5–3 min onset.

---

## 7. Suxamethonium (succinylcholine)

**Onset / duration numbers (US prescribing information, DailyMed, verified via openFDA), paraphrased:** paralysis begins in
**under a minute** after IV injection and a single dose lasts about **4 to 6 minutes**; IV dose 0.3–1.1 mg/kg; block
develops in about 1 minute, the maximum lasts about 2 minutes, then recovery over 4 to 6 minutes.

Clinical trial numbers often cited: 1 mg/kg — onset ~60 s, **T1 90% recovery ~9–13 min** (the figure the brief
quotes). Lee 2009 (PMID 19387176) reports, for 1 mg/kg sux, **T1 10% at 7.1 min and T1 90% at 10.9 min** of
spontaneous recovery — the best single modern citable pair.

**Simple model approach.** Suxamethonium has very fast clearance (hydrolysis in plasma), so a **1-compartment
PK + effect compartment** is adequate and is the published structure:
- Roy JJ, Donati F, Boismenu D, Varin F. *Concentration-effect relation of succinylcholine chloride during
  propofol anesthesia.* Anesthesiology 2002;97(5):1082–92. **PMID 12411790.** Degradation/elimination rate
  constant **k ≈ 0.97 min⁻¹** (plasma hydrolysis rate 1.07 min⁻¹, ≈ equal — i.e. disappearance is dominated by
  plasma hydrolysis), total clearance **37 mL·kg⁻¹·min⁻¹** → V ≈ 0.038 L/kg, **ke0 = 0.058 ± 0.026 min⁻¹**
  (slow equilibration despite fast onset — because the drug disappears before it fully equilibrates),
  **Ce50 (effect-site, 50% block) = 734 ± 211 ng/mL.** Hill coefficient ~3–6 (steep).
- A teaching simulator can model T1 (%) = 100 × (1 − Ce^γ/(Ce^γ + Ce50^γ)) with these parameters; the fast
  onset emerges from the large bolus relative to Ce50 and the rapid PK, the short duration from k ≈ 1 min⁻¹.

**Plasma cholinesterase (butyrylcholinesterase, BChE) deficiency variant durations** (for the "variant"
feature):
- Normal: full recovery ~10 min (restoration of normal muscle function ~10 min after discontinuation — CPIC
  2026 BChE guideline background).
- **Heterozygous atypical** (dibucaine number ~40–70): block prolonged ~50–100% (so ~12–20 min; corrected in review); Viby-Mogensen
  1981 (PMID 6267958): mean time to 90% twitch recovery 12–15 min for one abnormal gene vs 9.3 min normal.
- **Homozygous atypical / silent** (dibucaine number <30, ~1 in 2500–3200): very sensitive; the FDA
  label says the resulting apnoea or prolonged paralysis is managed with controlled ventilation. Published durations
  range widely, **~1 to >8 hours** (case/series literature; e.g. a small dose of a related ester produced
  complete paralysis up to ~128 min; homozygotes 1 h to >10 h). Viby-Mogensen 1981 homozygotes (PMID 7294376):
  markedly prolonged; patients with abnormal genes on both chromosomes showed phase-II (desensitisation) block.
- **Model approach for the variant:** scale the hydrolysis rate constant k down (planning check: normal k 0.97 → T1 90%
  ~11 min; k 0.2 → ~33 min; k 0.05 → ~80 min; k 0.01 → ~5–6 h), which cleanly reproduces the graded
  heterozygote→homozygote prolongation from one parameter. Phase-II block (changed block character) is a
  separate qualitative flag.

**Uncertain / disagreeing**
- ke0 0.058 min⁻¹ (t½ke0 ~12 min) seems paradoxically slow for a fast-onset drug; Roy explains it: sux is
  low-potency with very fast clearance, onset is driven by the big concentration gradient, not fast
  equilibration. For a sim, keeping Roy's ke0 and a steep Hill gives the right onset/offset.
- Dibucaine-number cutoffs vary by lab (heterozygote 30–70% vs 50–60; homozygote 0–30 vs <20). State the
  scheme used.

---

## 8. Sugammadex

**Dosing (FDA/EMA label, Bridion, verified via openFDA):**
- **2 mg/kg** at reappearance of T2 (moderate block).
- **4 mg/kg** at 1–2 post-tetanic counts (deep block).
- **16 mg/kg** for immediate reversal ~3 min after 1.2 mg/kg rocuronium.

**Expected reversal times to TOF ratio 0.9 (citable):**
- **Jones RK, Caldwell JE, Brull SJ, Soto RG.** *Reversal of profound rocuronium-induced blockade with
  sugammadex: a randomized comparison with neostigmine.* Anesthesiology 2008;109(5):816–24. **PMID 18946293.**
  4 mg/kg at 1–2 PTC → **TOFR 0.9 in geometric-mean 2.9 min** (median 2.7; 97% within 5 min) vs neostigmine
  50.4 min.
- **Blobner M, et al.** *… sugammadex compared with neostigmine during sevoflurane anaesthesia.* Eur J
  Anaesthesiol 2010;27(10):874–81. **PMID 20683334.** 2 mg/kg at T2 → **TOFR 0.9 in 1.5 min** (geo-mean) vs
  neostigmine 18.6 min; 98% within 5 min.
- **Lee C, Jahr JS, Candiotti KA, et al.** *Reversal of profound neuromuscular block by sugammadex administered
  three minutes after rocuronium …* Anesthesiology 2009;110(5):1020–5. **PMID 19387176.** 16 mg/kg 3 min after
  1.2 mg/kg rocuronium → mean **T1 10% at 4.4 min from rocuronium** (i.e. ~1.2 min from sugammadex); faster
  than spontaneous sux recovery (7.1 min).
- Kleijn 2011 (PMID 21535448) simulation: typical-adult reversal **0.8 min (16 mg/kg @3 min), 1.5 min (4 mg/kg
  deep), 1.4 min (2 mg/kg moderate)** — all <2 min.

**Simple modelling approach (1:1 complexation):**
- Molecular weights: **rocuronium 609.7 g/mol** (bromide salt C₃₂H₅₃BrN₂O₄; the brief's 610 is this rounded;
  the rocuronium *cation* is 529.8), **sugammadex 2178 g/mol** (label: sugammadex MW 2178.01; sodium salt as
  dosed is higher). Both verified from the FDA labels.
- Molar doses at 70 kg (computed in planning): rocuronium 0.6 mg/kg = 42 mg = 68.9 µmol; 1.2 mg/kg = 84 mg = 138
  µmol. Sugammadex 2 mg/kg = 140 mg = 64 µmol; 4 mg/kg = 280 mg = 129 µmol; 16 mg/kg = 1120 mg = 514 µmol. So
  2 mg/kg sugammadex ≈ equimolar to 0.6 mg/kg rocuronium; 16 mg/kg is a large molar excess over a 1.2 mg/kg
  dose — which is why 16 mg/kg reverses even immediately after a large bolus.
- Mechanism to code: sugammadex forms a tight **1:1 complex** with free (plasma) rocuronium (KD ≈ 0.0559 µM,
  Kleijn in-vitro value), lowering free plasma rocuronium, which reverses the plasma→effect-site gradient so
  rocuronium leaves the effect site and T1/TOF recover. A minimal sim: add a bimolecular binding reaction in
  the central compartment (free Roc + free Sugammadex ⇌ complex), with complex cleared renally like free
  sugammadex (Kleijn assumes complex PK = free-sugammadex PK; sugammadex CL ~88 mL/min, t½ ~2 h, renal). This
  reproduces the <2 min TOFR-0.9 recovery and the dose/depth dependence.

**Uncertain / disagreeing**
- "610" (brief) vs 609.7 (label) for rocuronium — use **609.7** (bromide) for mass↔mole; if you model the
  active cation use 529.8. Be explicit which, because it shifts the molar-ratio teaching point.
- Sugammadex "2178" is the free acid; the dosed sodium salt is ~2178 → the label uses 2178.01 for the active
  moiety. Fine to use 2178.

---

## 9. Other drugs (brief PK / onset-peak-duration + sources)

All volumes/rate constants below are from opentiva (with the cited primary source); cross-checked where a
second implementation exists.

**Midazolam — Albrecht 1999.** Albrecht S, Ihmsen H, Hering W, et al. *The effect of age on the PK/PD of
midazolam.* Clin Pharmacol Ther 1999;65(6):630–9. **PMID 10391668.** 3-cpt, young adult: V1 7.9 L, CL1 0.399
L/min, k10 0.0505, k12 0.19, k13 0.065, k21 0.06, k31 0.0083, **ke0 0.11 min⁻¹** (elderly: V1 8.5, slower).
EC50 (median EEG) ~522 ng/mL young vs 223 elderly. Onset of IV sedation 3–5 min; TTPE (Miller's table) ~2.8
min (t½ke0 4.0 min); planning check with Albrecht PK gives TTPE ~6 min (Miller's uses a different PK). Elimination
t½ ~3 h (FDA label: Vd 1.0–3.1 L/kg, CL 0.25–0.54 L/h/kg). (Greenblatt is an alternative older PK source;
Albrecht is the one with a usable ke0.)

**Ketamine — Domino 1982 / Clements.** Domino EF, Zsigmond EK, Domino LE, et al. Anesth Analg 1982;61(2):87–92.
**PMID 7198883** (3-compartment open model confirmed). opentiva `Domino`: V1 0.063×wt L, k10 0.438, k12 0.592,
k13 0.590, k21 0.247, k31 0.0146, ke0 0.652 (set to give TTPE ~1 min). Clements 250 (PMID 7459184): 2-cpt,
V1 1.75×wt, k10 0.0109, k12 0.0186, k21 0.0137, ke0 fast. Clinical (FDA Ketalar label): **IV 2 mg/kg →
surgical anaesthesia within ~30 s, lasting 5–10 min**; distribution α-half-life 10–15 min, redistribution
β-phase 2.5 h. For a teaching sim, onset ~30–60 s, duration 5–10 min per 2 mg/kg is the assertable number.

**Alfentanil — Maitre 1987.** Maitre PO, Vozeh S, Heykants J, Thomson DA, Stanski DR. *Population PK of
alfentanil …* Anesthesiology 1987;66(1):3–12. **PMID 3099604.** 70 kg male <40 y: V1 0.111×wt (7.77 L),
CL 0.356 L/min; k10 = 0.356/V1, k12 0.104, k13 0.017, k21 0.0673, k31 0.0126 (age-adjusted: k10 and k31 fall
above 40 y: k10 = (0.356 − 0.00269×(age−40))/V1; female V1 ×1.15). **ke0 = 0.77 min⁻¹** (ke0 source: Scott &
Stanski/Shafer, PMID 1824743). TTPE ~1.4 min (Miller's table; planning check with Scott alfentanil PK + ke0 0.77 =
1.38 min). Fast on/off — good contrast drug.

**Dexmedetomidine — Hannivoort 2015.** Hannivoort LN, Eleveld DJ, Proost JH, et al. *Development of an
optimized PK model of dexmedetomidine …* Anesthesiology 2015;123(2):357–67. **PMID 26068206.** 3-cpt
allometric, 70 kg: **V1 1.78, V2 30.3, V3 52.0 L, CL 0.686, Q2 2.98, Q3 0.602 L/min** (verified from abstract).
ke0 for sedation **0.0428 min⁻¹** (Colin PJ et al. Br J Anaesth 2017;119(2):200–210, **PMID 28854538**) — very
slow (t½ke0 ~16 min), so a dexmedetomidine bolus peaks slowly (planning check ~15 min); clinically given as loading
infusion over 10 min for this reason. Good teaching point about slow effect-site onset.

**Morphine — Sarton 2000 (optional).** Sarton E, et al. Anesthesiology 2000;93(5):1245 — opentiva `Sarton`:
V1 0.075×wt, k10 0.3, k12 0.183, k13 0.29, k21 0.087, k31 0.013, **ke0 very slow (0.0073 male / 0.0024
female)** reflecting morphine's slow CNS penetration (peak effect 20–30+ min). PMID 11046213. Use only if slow
opioid onset is a teaching goal.

---

## 10. Inhaled agents

### Partition coefficients (37 °C) — primary data: Yasuda N, Targ AC, Eger EI. *Solubility of I-653,
sevoflurane, isoflurane, and halothane in human tissues.* Anesth Analg 1989;69:370–373. (Compiled in Eger's
Desflurane Compendium 1993; reproduced in Barash/Miller textbook tables — verified two independent textbook
tables that agree.)

| Agent | Blood:gas | Brain:blood | Muscle:blood | Fat:blood | Oil:gas |
|---|---|---|---|---|---|
| Nitrous oxide | 0.46 (–0.47) | 1.1 | 1.2 | 2.3 | 1.4 |
| Desflurane | 0.42 | 1.3 | 2.0 | 27.2 | 18.7 (–19) |
| Sevoflurane | 0.65 (–0.69) | 1.7 | 3.1 | 47.5 (–48) | 47–55 |
| Isoflurane | 1.4 (1.46) | 1.6 | 2.9 | 44.9 | 91–98 |
| Halothane | 2.4–2.54 | 1.9 | 3.4 | 51.1 | 224 |

(Tissue:gas = tissue:blood × blood:gas.) Sevoflurane blood:gas is quoted as 0.65 (Eger/Yasuda) or 0.63–0.69
(sevoflurane FDA label). Desflurane blood:gas 0.42 (label 0.424), brain:gas 0.54 (label).

### MAC at age 40 and age adjustment
**Primary source for the age formula:** Mapleson WW. *Effect of age on MAC in humans: a meta-analysis.* Br J
Anaesth 1996;76(2):179–85. **PMID 8777094.** Verified formula (as given in the abstract):

> **MAC(age) = MAC₄₀ × 10^(b·x)**, x = (age − 40) years, **b = −0.00269** (≈ −6% per decade).

MAC₄₀ values from Mapleson 1996 (the brief's numbers — confirmed): **halothane 0.75%, isoflurane 1.17%,
enflurane 1.63%, sevoflurane 1.80%, desflurane 6.6%, nitrous oxide 104%.**

**Clinical implementation chart:** Nickalls RWD, Mapleson WW. *Age-related iso-MAC charts for isoflurane,
sevoflurane and desflurane in man.* Br J Anaesth 2003;91(2):170–4. **PMID 12878613** — uses exactly the
Mapleson 1996 model; handy for the planning doc.

**The sevoflurane discrepancy — resolved.** Two values circulate:
- **1.80%** = Mapleson's 1996 meta-analysis MAC₄₀ (pooled, includes Japanese data).
- **2.05%** = the figure on US sevoflurane prescribing information for a 40-year-old (label, verified via
  openFDA: MAC in oxygen 2.1% at age 40); the US primary studies gave 2.05–2.6%.
- The gap is **ethnic/geographic**: De Hert & Moerman (F1000Research 2015;4:626, PMID 26380072) report that US
  studies consistently found higher MAC (2.05–2.6%) than studies of Japanese adults (1.58–1.71%) (Japanese data: Katoh & Ikeda, Anesthesiology 1987;66:301–3; Kimura et al. Anesth Analg
  1994;79:378–81). Mapleson's 1.80% sits between because it pools both.
- A modern meta-regression (Cooter M, et al. Br J Anaesth 2020;124(1):e4–e7, **PMID 31679750**) gives MAC₄₀ =
  desflurane 6.44%, isoflurane 1.16%, **sevoflurane 2.03%**, and **−6.47%/decade** — i.e. it **supports the
  ~2.0–2.05% sevoflurane value**, not 1.80%.
- **Recommendation:** use **sevoflurane MAC₄₀ = 2.05%** (US label / Cooter 2020), isoflurane 1.17–1.16%,
  desflurane 6.6–6.44%, N₂O 104%, with the Mapleson age factor 10^(−0.00269×(age−40)). State that 1.80% is
  Mapleson's pooled value if you prefer internal consistency with one source. Isoflurane and desflurane agree
  across sources; only sevoflurane is contested.

Age-MAC also checkable against each FDA label (verified): isoflurane 1.28% @19–30 y, 1.15% @31–55 y, 1.05%
@55–83 y; desflurane 7.3% @25 y, 6.0% @45 y, 5.2% @70 y (O₂).

### Physiological uptake (compartment) model parameters
**Gas Man model set** (the de-facto teaching uptake model): compartments = lung (alveolar/FRC) + vessel-rich
group (VRG) + muscle group (MG) + fat, open to circuit. Parameters from De Wolf AM, Van Zundert TC, De Cooman
S, Hendrickx JF. *Theoretical effect of hyperventilation … a GasMan simulation.* BMC Anesthesiol 2012;12:22
(**PMID 22989260**, Table 1, verified):

| Compartment | Volume (L) | Blood flow (% CO) |
|---|---|---|
| VRG | 6 | 75.8 |
| Muscle | 33 | 18 |
| Fat | 14.5 | 6 |

with FRC 2.5 L, circuit 8 L, alveolar ventilation (VA) 4–5 L/min, cardiac output 5 L/min, 70 kg. Gas Man
tissue/gas λ in that table: desflurane (blood 0.42, VRG 0.54, muscle 0.97, fat 13), sevoflurane (0.65, 1.1,
2.4, 34), isoflurane (1.3, 2.1, 4.5, 70). (These are tissue:gas; note the fat:gas values are lower than the
Yasuda-derived ones because Gas Man uses its own set.)

Alternatively the classic Eger "tissue groups" shares: VRG ~10% body mass / 75% CO, muscle ~50% mass / 18–19%
CO, fat ~20% mass / 5–6% CO, vessel-poor ~0% CO. A perfusion-limited ODE per compartment (dPtissue/dt =
Q_tissue·λ_b·(FA − Ptissue)/(V_tissue·λ_tissue)) with the Gas Man set is the simplest implementable physiological
model.

Hendrickx JF, Lemmens HJ, Shafer SL. *Do distribution volumes and clearances relate to tissue volumes and
blood flows? A computer simulation.* BMC Anesthesiol 2006;6:7 (**PMID 16772041**) confirms a 3-compartment
mammillary model reproduces Gas Man FA/FI almost perfectly (MDAPE <0.1%) — so a simulator could use either a
physiological OR a classical 3-cpt representation of volatiles.

### Expected FA/FI ratios (model test targets)
**Human data: Yasuda N, Lockhart SH, Eger EI, et al.** — two 1991 papers:
- *Kinetics of desflurane, isoflurane, and halothane in humans.* Anesthesiology 1991;74(3):489–98.
  **PMID 2001028.**
- *Comparison of kinetics of sevoflurane and isoflurane in humans.* Anesth Analg 1991;72(3):316–24.
  **PMID 1994760.**

Verified values from the abstracts — **FA/FI at 30 min of administration**: N₂O 0.99, desflurane 0.90,
sevoflurane 0.85, isoflurane 0.73, halothane 0.58. **Elimination FA/FA₀ after 5 min**: desflurane 0.14,
sevoflurane 0.157, isoflurane 0.22–0.223, halothane 0.25.

**Uncertain / not verified:** I could **not** retrieve the full Yasuda tables giving FA/FI at the exact 1, 5,
and 10 min wash-in points (abstracts only give the 30-min value). My own Gas Man-parameter simulation (VA 4,
CO 5, FRC 2.5) produces, as an *order-of-magnitude* check (not the Yasuda measured values): desflurane ≈0.62
(1 min)/0.83 (5)/0.88 (10)/0.91 (30); sevoflurane ≈0.55/0.74/0.81/0.86; isoflurane ≈0.41/0.58/0.67/0.75; N₂O
≈0.62/0.84/0.89/0.92. These bracket the 30-min abstract values reasonably (within a few %), so the Gas Man
parameter set is self-consistent, but **for a true test oracle the 1/5/10-min FA/FI must be read off the
Yasuda 1991 figures/tables directly** — treat the simulated intermediate values as provisional.

---

## 11. Sanity numbers a test suite can assert (all re-derived here by RK4 unless cited)

**Propofol Marsh, 70 kg, 2 mg/kg (140 mg) bolus:**
- V1 = 15.96 L → initial plasma peak Cp₀ ≈ **8.8 µg/mL** (instantaneous-bolus idealisation; Cp₁ₘᵢₙ ≈ 6.7,
  Cp₂ ≈ 5.2, Cp₅ ≈ 2.5 µg/mL).
- ke0 0.26: **Ce peak ≈ 3.2 µg/mL at ≈ 3.9 min.**
- ke0 1.2: **Ce peak ≈ 5.7 µg/mL at ≈ 1.6 min** (TTPE 1.6 min by construction — matches Struys 2000).

**Propofol Schnider, 40 y/70 kg/170 cm male, ke0 0.456:** TTPE effect ≈ **1.5–1.6 min** (planning check 1.52; paper
1.6–1.7). 2 mg/kg → Ce peak ≈ 8 µg/mL (small fixed V1 ⇒ high transient plasma; use effect-site targeting).
TTPE rises with age (1.45 → 1.71 min, 25 → 75 y).

**Remifentanil Minto, 40 y/70 kg/170 cm male:** **time to peak effect ≈ 1.4–1.6 min** (planning check 1.43 min);
ke0 0.595.

**Fentanyl Shafer:** **time to peak effect ≈ 3.6 min** (Shafer & Varvel 1991, PMID 1824743; t½ke0 4.7 min).
Planning check: ke0 0.147 → TTPE 3.2 min; ke0 ≈ 0.117 → exactly 3.6 min. Miller's Table "time to peak effect / t½ke0":
fentanyl 3.6/4.7, alfentanil 1.4/0.9, sufentanil 5.6/3.0, remifentanil 1.6/1.3, propofol 2.2/2.4, thiopental
1.6/1.5, etomidate 2.0/1.5, midazolam 2.8/4.0 (Glass, Shafer, Reves, Miller's Anesthesia 7th ed. 2010).

**Context-sensitive half-times** — definition and primary source: Hughes MA, Glass PSA, Jacobs JR.
*Context-sensitive half-time in multicompartment PK models for IV anesthetic drugs.* Anesthesiology
1992;76(3):334–41. **PMID 1539843.** Planning-check RK4 CSHT (plasma 50% decrement, min) after 1 / 3 / 8 h infusions:

| Drug (model) | 1 h | 3 h | 8 h |
|---|---|---|---|
| Propofol Marsh 70 kg | 6.7 | 8.6 | 12 |
| Propofol Schnider 40 y | 2 | 3 | 8 |
| Propofol Eleveld ref | 2.7 | 4.5 | 12 |
| Remifentanil Minto 40 y | ~2 | ~2 | ~2 (flat) |
| Fentanyl Shafer | 18 | 70 | 256 |

Remifentanil's near-constant ~3–4 min CSHT is the headline teaching point; it matches the **measured** value:
Kapila A, Glass PSA, Jacobs JR, et al. *Measured context-sensitive half-times of remifentanil and alfentanil.*
Anesthesiology 1995;83(5):968–75. **PMID 7486182** — remifentanil 3.2 min, alfentanil 47 min after a 3-h
infusion. (My Minto-model CSHT ~2 min is a little short vs the measured 3.2 min — model vs measurement
difference; assert against ~3–4 min with tolerance.) Propofol CSHT after 8 h stays well under ~40 min for all
three models (Hughes 1992 shows propofol plateaus ~ in the tens of minutes), consistent with my values.

**Uncertain** — exact Hughes 1992 per-drug CSHT numbers depend on the specific PK set that paper used (it
predates Schnider/Eleveld); the values above are from the modern models a simulator would actually run, which
is what you want for a self-consistent test oracle. Fentanyl CSHT growing steeply with infusion time (18 → 256
min) is the correct qualitative behaviour and matches the Hughes/Shafer-Varvel fentanyl curve.

---

## Cross-reference summary of primary sources (PMIDs)

| Drug / topic | Primary source | PMID | DOI |
|---|---|---|---|
| Propofol Marsh | Marsh 1991 BJA | 1859758 | 10.1093/bja/67.1.41 |
| Modified-Marsh ke0 1.2 | Struys 2000 Anesthesiology | 10691226 | — |
| Marsh/Schnider detail | Absalom 2009 BJA | 19520702 | 10.1093/bja/aep143 |
| Propofol Schnider PK | Schnider 1998 Anesthesiology | 9605675 | 10.1097/00000542-199805000-00006 |
| Propofol Schnider PD/ke0 | Schnider 1999 Anesthesiology | 10360845 | — |
| Propofol Eleveld | Eleveld 2018 BJA | 29661412 | 10.1016/j.bja.2018.01.018 |
| Remifentanil Minto | Minto 1997 Anesthesiology | 9009935 | 10.1097/00000542-199701000-00004 |
| Remifentanil Eleveld | Eleveld 2017 Anesthesiology | 28509794 | 10.1097/ALN.0000000000001634 |
| Fentanyl Shafer PK | Shafer 1990 Anesthesiology | 2248388 | 10.1097/00000542-199012000-00005 |
| Fentanyl ke0 (EEG t½) | Scott & Stanski 1985 Anesthesiology | 3919613 | — |
| Opioid TTPE / rational selection | Shafer & Varvel 1991 Anesthesiology | 1824743 | — |
| Rocuronium–sugammadex PKPD | Kleijn 2011 Br J Clin Pharmacol | 21535448 | 10.1111/j.1365-2125.2011.04000.x |
| Rocuronium ke0 set | Masui 2018 J Anesth | 30099599 | 10.1007/s00540-018-2543-3 |
| Rocuronium Ce50 (AP vs larynx) | Plaud 1995 Clin Pharmacol Ther | 7648768 | — |
| Rocuronium PK (Org 9426) | Wierda 1991 Can J Anaesth | 1829656 | — |
| Rocuronium onset RSI | Magorian 1993 Anesthesiology | 7902034 | — |
| Suxamethonium PKPD | Roy 2002 Anesthesiology | 12411790 | — |
| Sux cholinesterase (het) | Viby-Mogensen 1981 Anesthesiology | 6267958 | — |
| Sux cholinesterase (homo) | Viby-Mogensen 1981 Anesthesiology | 7294376 | — |
| Sugammadex 4 mg/kg deep | Jones 2008 Anesthesiology | 18946293 | 10.1097/ALN.0b013e31818a3fee |
| Sugammadex 2 mg/kg moderate | Blobner 2010 Eur J Anaesthesiol | 20683334 | 10.1097/EJA.0b013e32833d56b7 |
| Sugammadex 16 mg/kg @3 min | Lee 2009 Anesthesiology | 19387176 | 10.1097/ALN.0b013e31819dabb0 |
| Midazolam | Albrecht 1999 Clin Pharmacol Ther | 10391668 | 10.1016/S0009-9236(99)90084-X |
| Ketamine | Domino 1982 Anesth Analg | 7198883 | — |
| Alfentanil | Maitre 1987 Anesthesiology | 3099604 | — |
| Dexmedetomidine PK | Hannivoort 2015 Anesthesiology | 26068206 | 10.1097/ALN.0000000000000740 |
| Dexmedetomidine ke0 | Colin 2017 BJA | 28854538 | 10.1093/bja/aex085 |
| Morphine | Sarton 2000 Anesthesiology | 11046213 | 10.1097/00000542-200011000-00018 |
| MAC vs age | Mapleson 1996 BJA | 8777094 | — |
| iso-MAC charts | Nickalls & Mapleson 2003 BJA | 12878613 | — |
| MAC meta-regression | Cooter 2020 BJA | 31679750 | 10.1016/j.bja.2019.09.036 |
| Sevo MAC ethnic gap | De Hert & Moerman 2015 F1000Res | 26380072 | 10.12688/f1000research.6288.1 |
| Volatile kinetics (des/iso/hal) | Yasuda 1991 Anesthesiology | 2001028 | — |
| Volatile kinetics (sevo/iso) | Yasuda 1991 Anesth Analg | 1994760 | — |
| Partition coefficients | Yasuda, Targ, Eger 1989 Anesth Analg | (Anesth Analg 1989;69:370) | — |
| Gas Man uptake model | De Wolf 2012 BMC Anesthesiol | 22989260 | 10.1186/1471-2253-12-22 |
| Gas Man ≡ 3-cpt | Hendrickx 2006 BMC Anesthesiol | 16772041 | 10.1186/1471-2253-6-7 |
| CSHT concept | Hughes 1992 Anesthesiology | 1539843 | — |
| Measured CSHT remi/alf | Kapila 1995 Anesthesiology | 7486182 | — |

### What could not be verified (be explicit in the plan)
1. Eleveld 2018 **PD/BIS** parameters (Ce50/γ/baseline) line-by-line — paywalled; reference PK + ke0 verified.
2. Yasuda FA/FI at the exact **1, 5, 10 min** wash-in points — only the 30-min and 5-min-elimination values
   are in the abstracts; read the full-text figures for intermediate test points.
3. Exact original Schnider/Minto per-parameter **inter-individual variability (ω²/CV)** — present in the
   reference libraries but not independently re-verified against the papers here.
4. Hughes 1992's own per-drug CSHT numbers (its PK sets predate Schnider/Eleveld) — used modern-model CSHTs
   instead for a self-consistent oracle.
