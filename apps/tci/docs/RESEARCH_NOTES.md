# Research notes: TCI emulator (Phase 1)

Compiled 21 Oct 2026. Citations, DOIs and the source status of each item are in [REFERENCES.md](REFERENCES.md); keys in
square brackets point there. Paraphrased throughout.

## 0. How far this was checked

- **Access.** The session's network proxy refused every publisher, doi.org, PubMed, PMC, Europe PMC, Crossref and the
  B. Braun, ANZCA, TGA, HSA and BfArM sites. Web search excerpts and public GitHub repositories were reachable.
- **So nothing is VERIFIED against a primary PDF.** Constants are SECONDARY: they agree across (a) the Eleveld
  supplement's NONMEM code as transcribed by Shafer in stanpumpR, (b) four or more independent open implementations,
  (c) search excerpts of the papers' tables and abstracts, and (d) the owner's nine golden values, which the oracle
  reproduces (section 2).
- **DOI second pass** (re-resolve every DOI through doi.org): attempted, refused by the proxy. Each DOI was instead
  matched to its title in search-index records of the publisher's page.
- **Seed files.** `spaceplus_tci.html` and `tci_ref.py` were not in the repository or the Drive folder. With the owner's
  approval the oracle was rebuilt from the sources (`oracle/tci_ref.py`).

## 1. Models

### Eleveld 2018 [eleveld2018]

| θ | Meaning | Value | Status |
|---|---|---|---|
| 1 | V1 reference | 6.28 L | SECONDARY (table excerpt + code) |
| 2 | V2 reference | 25.5 L | SECONDARY (table excerpt + code) |
| 3 | V3 reference | 273 L | SECONDARY (table excerpt + code) |
| 4 | CL male | 1.79 L/min | SECONDARY (table excerpt + code) |
| 5 | Q2 reference | 1.75 L/min | SECONDARY (table excerpt + code) |
| 6 | Q3 reference | 1.11 L/min | SECONDARY (table excerpt + code) |
| 8 | CL maturation E50 | 42.3 weeks PMA | SECONDARY (code) |
| 9 | CL maturation slope | 9.06 | SECONDARY (code) |
| 10 | V2 ageing | −0.0156 /y | SECONDARY (code) |
| 11 | CL with opioids | −0.00286 /y | SECONDARY (code) |
| 12 | V1 weight E50 | 33.6 kg | SECONDARY (code) |
| 13 | V3 with opioids | −0.0138 /y | SECONDARY (code) |
| 14 | Q3 maturation E50 | 68.3 weeks | SECONDARY (code) |
| 15 | CL female | 2.10 L/min | SECONDARY (table excerpt + code) |
| 16 | Extra Q2 in the immature | 1.30 | SECONDARY (code) |
| 17 | Venous V1 factor | 1.42 | SECONDARY (code) |
| 18 | Venous Q2 factor | 0.68 | SECONDARY (code) |
| PD | ke0 arterial | 0.146 × (W/70)^−0.25 /min | SECONDARY (implementations) |
| PD | ke0 venous | 1.24 /min | SECONDARY (table excerpt) |
| PD | Ce50 | 3.08 × exp(−0.00635 × (age − 35)) | SECONDARY |

- **Equations** (as implemented, `src/engine/models.ts`; shown in the app's References screen):
  - V1 = θ1·fcentral(W)/fcentral(70); venous × (1 + θ17·(1 − fcentral(W))).
  - V2 = θ2·W/70·exp(θ10·(age − 35)).
  - V3 = θ3·FFM/FFMref·fopiates(θ13).
  - CL = θ4 (M) or θ15 (F) · (W/70)^0.75 · fCLmat/fCLmat,ref · fopiates(θ11).
  - Q2 = θ5·(V2/θ2)^0.75·(1 + θ16·(1 − fQ3mat)), venous × θ18.
  - Q3 = θ6·(V3/θ3)^0.75·fQ3mat/fQ3mat,ref.
- **Opioid term.** fopiates(x) = exp(x·age) when opioids are present, else 1. It is presence or absence only, acts on
  V3 and CL, and is not centred at 35 y, so the printed reference values hold only without opioids.
- **Maturation.** The supplement code uses 52 weeks per year, and age × 52 + 40 for both fCLmat (PMA) and fQ3mat.
  - **Oracle corrected.** The first oracle draft used age × 52.143 with no +40 for Q3 maturation. This was fixed
    before any app code relied on it.
  - **Effect in adults:** under 0.1 mg on any golden bolus.
- **Arterial vs venous.** Only V1, Q2 and ke0 differ.
  - The owner's golden values match the **arterial** set: the venous set gives boluses about 60% smaller.
  - Open simulators and research pumps implement arterial.
  - What the Space Plus implements is not documented (Q10).
- **Data range.** 30 studies, 1033 people, 27 weeks PMA to 88 y, 0.68 to 160 kg, with 121 people of BMI ≥ 30 and 89
  aged 70 or over.
  - The paper states no formal validity limits.
  - Prospective validation: bias about −14% in adults and obese adults, about −27% in older patients [vellinga2021].
- **Corrigendum** [eleveld2018c]. Reported to correct the reference Q2 to about 1.83 L/min; the oracle gives 1.831.
  The correction's text was not seen.
- **Pitfalls in public code. Don't copy constants from these:**
  - opentiva applies maturation twice to Q2.
  - The CRAN `tci` package uses (LBM − 77) in place of (weight − 77) in Schnider CL1.
  - Gamma (1.47 vs 1.89 above or below Ce50) is assigned inconsistently between implementations. It is irrelevant
    here, because the emulator does not predict BIS.

### Al-Sallami FFM [alsallami2015]

- **Male:** (0.88 + 0.12/(1 + (age/13.4)^−12.7)) · 9270·W/(6680 + 216·BMI).
- **Female:** (1.11 − 0.11/(1 + (age/7.1)^−1.1)) · 9270·W/(8780 + 244·BMI).
- **Reference FFM:** 54.475 kg.
- **Status:** SECONDARY.

### Schnider 1998 and 1999 [schnider1998] [schnider1999]

- **Constants:** V1 4.27, V2 18.9 − 0.391(age − 53), V3 238 L; CL1 1.89 + 0.0456(W − 77) − 0.0681(LBM − 59) + 0.0264(H − 177);
  CL2 1.29 − 0.024(age − 53); CL3 0.836 L/min. ke0 0.456 /min.
  - The constants match the original STANPUMP C code (Shafer, a co-author), CRAN tci (apart from its CL1 bug) and the
    reviews. SECONDARY.
- **Population:** 24 volunteers aged 26 to 81 y, 44 to 123 kg (122 in some sources). Sex enters only through LBM.
- **Time to peak effect:** about 1.6 min observed, 1.7 min predicted by the model. With ke0 0.456 the emulator gives
  1.50 min for a 35 y, 70 kg man; matching 1.6 min would need ke0 0.394.
- **Pump implementations differ** [absalom2009]: some derive ke0 per patient from a 1.6 min time to peak; others fix
  ke0 at 0.456.
  - The Space Plus is weakly reported (garbled Instructions for Use excerpt) to fix 0.456 (Q5).
  - The emulator fixes 0.456; the bolus would be larger with the time-to-peak method.

### James LBM [james1976]

- **Formula:** male 1.1W − 128(W/H)², female 1.07W − 148(W/H)².
- **Peak:** dLBM/dW = 0 at W = 1.1H²/256 (male) and 1.07H²/296 (female), that is **BMI 42.97 (male) and 36.15
  (female)** at any height.
  - Past the peak, LBM falls as weight rises, so Schnider CL1 rises without limit.
- **Pump BMI cut-offs** (42 male, 35 or 37 female) are described for unnamed pumps only.
- **No published validation** of Al-Sallami or Janmahasatian FFM in Schnider propofol was found.
  - The nearest is La Colla 2010, for Minto remifentanil, with a "fictitious height" workaround.

### Marsh 1991 [marsh1991] [struys2000]

- **Constants:** V1 0.228 L/kg; k10 0.119, k12 0.112, k13 0.0419, k21 0.055, k31 0.0033 /min.
  - A STANPUMP comment says these rate constants came from Gepts, and that 0.112 is a typo for Gepts's 0.114. The
    emulator keeps 0.112, as published and as pumps use.
- **ke0 0.26 /min:** Diprifusor; time to peak 3.92 min here.
- **ke0 1.2 /min:** modified Marsh from Struys 2000 (about 1.21 for a 1.6 min time to peak); time to peak 1.62 min.
- **Space Plus:** weakly reported to offer Marsh in plasma mode only, listing ke0 0.26 (Q4). The emulator offers both
  ke0 values and both modes, labelled.

## 2. Oracle against the owner's golden values

Eleveld arterial, opioid on, Ce 4; Schnider Ce 4; matched Schnider Ce (instantaneous bolus):

| Patient | Eleveld mg (golden) | Schnider mg (golden) | Matched (golden) |
|---|---|---|---|
| M 35 y 170 cm 70 kg | 170.9 (171) | 70.7 (71) | 9.67 (9.66) |
| M 20 y 175 cm 70 kg | 189.0 (189) | 75.0 (75) | 10.09 (10.09) |
| M 70 y 170 cm 70 kg | 140.0 (140) | 61.9 (62) | 9.04 (9.03) |
| M 85 y 168 cm 65 kg | 122.5 (122) | 57.2 (57) | 8.57 (8.56) |
| F 40 y 160 cm 55 kg | 140.9 (141) | 69.5 (69) | 8.11 (8.11) |
| F 70 y 160 cm 60 kg | 128.8 (129) | 62.9 (63) | 8.18 (8.18) |
| M 40 y 170 cm 50 kg | 127.3 (127) | 68.0 (68) | 7.49 (7.49) |
| M 40 y 175 cm 120 kg | 252.9 (253) | 83.2 (83) | 12.17 (12.16) |
| F 45 y 160 cm 100 kg | 219.6 (220) | 84.4 (84) | 10.41 (10.41) |

- **Opioid off, reference patient:** 186.9 mg (golden about 187).
- **Worst gap: 0.72%**, Schnider F 40 y.
  - This is rounding: 69.5 mg was printed as 69.
  - Every other value is within 0.5%.
  - The Vitest suite allows 0.5% or half the last printed digit, whichever is larger.
- **Verdict.** No mismatch between the sources and the oracle beyond the Q3-maturation fix above.

## 3. Effect-site targeting [shafer1992] [jacobs1993] [vanpoucke2004]

- **Induction bolus.** The dose whose **peak** Ce equals the target. Plasma overshoots on purpose.
  - The system is linear, so it is the target divided by the peak Ce of a 1 mg bolus.
  - With a rate limit, the bolus duration depends on the dose, so the emulator iterates to a fixed point.
- **Controller.** Every update interval the rate is chosen so that the predicted peak Ce, from the end of the interval
  on, equals the target, clipped to 0 to the maximum rate.
  - Once Ce is at the target and would fall without drug, the emulator holds Cp at the target.
    - At the Ce peak Cp equals Ce, so the hand-over is seamless.
    - A pure peak-Ce rule oscillated between alternate 10 s steps.
    - This is an implementation choice, not documented for the Space Plus.
  - A lower target stops the pump until the predicted level falls. It restarts early enough that Ce bottoms out at the
    target (within 0.5%).
- **Overshoot caps.** Van Poucke 2004 showed that capping peak Cp trades about 60% less overshoot for about 20% slower
  onset. No cap is documented for the Space Plus, so none is applied.
- **Update interval.** Not documented. stanpumpR re-plans every 10 s; the emulator defaults to 10 s, adjustable.

## 4. B. Braun Space plus Perfusor [bbraun]

| Item | Finding | Status |
|---|---|---|
| Models | Eleveld, Schnider, Marsh (propofol); Minto (remifentanil); Gepts (sufentanil) | SECONDARY (manufacturer page excerpt) |
| Older Perfusor Space TCI (software 688G/L/M, US 588U) | Marsh, Schnider and Minto only | SECONDARY |
| Ce vs Cp | Marsh plasma only; Schnider and Minto plasma and effect; Gepts effect; Eleveld not stated | UNVERIFIED (garbled excerpt) |
| ke0 | Marsh 0.26; Schnider fixed 0.456; Minto 0.595 − 0.007(age − 40) | UNVERIFIED |
| Max rate | 0.01 to 1800 mL/h, bolus up to 1800 mL/h (German datasheet). 1200 mL/h is the Infusomat maximum | SECONDARY |
| Update interval | Not found | — |
| Department pump settings | Default max rate 800 mL/h; plasma overshoot 400% (Cp ≤ 4 × Ce target); decrement concentration 1.0 µg/mL | VERIFIED (read off the pump by the owner, 21 Oct 2026) [deptpump] |
| Patient limits | Conflicting garbled text (e.g. Eleveld 1–85 y and 2.5–106 kg vs 1–88 y and 0.68–160 kg) | UNVERIFIED |
| Software | Instructions for Use for software 019D; a 2026 notice for D05 → D06 concerns Take Over Mode, not TCI | SECONDARY |
| Eleveld added | Not found (one hospital adopted it in 2024) | — |

- **Emulator defaults:** 800 mL/h maximum, 400% plasma overshoot and 1.0 µg/mL decrement concentration, as set on
  the department's pump (VERIFIED). 10 s updates remain unverified. The 1800 mL/h datasheet figure is the pump's
  ceiling, not the TCI default.
- **Effect of the 400% cap** (engine `pumpInduction`): for the reference patient, the Eleveld Ce 4 induction stays at
  172 mg but stretches from about 77 s to 110 s, with Cp held at 16 µg/mL. Schnider Ce 4 is 71 mg over 50 s. The pump
  matched Schnider target is 9.46, against 9.67 for an instant bolus.

## 5. The BMI above 30 error [milliet2025] [anzca2025] [esia2025] [minto2025] [introna2026]

- **What is reported.**
  - The Space Plus Eleveld implementation uses an adjusted weight in place of total body weight when BMI is over 30,
    risking under-dosing.
  - Index case: man, 63 y, 173 cm, 100 kg (BMI 33.4), Eleveld with opioids, Ce 4. The pump gave 162 mg; TivaTrainer
    gave 192 mg.
  - Below BMI 30 the pump matched simulation.
  - The author ruled out an opioid-flag mix-up and the per-patient ke0, and suspected Servin's formula [servin1993].
- **Reproduced here.**
  - Total body weight: 191.1 mg.
  - Servin adjusted weight, IBW (Devine) + 0.4 × (TBW − IBW) = 81.2 kg, substituted for weight in every Eleveld
    covariate: **163.0 mg** (pump 162).
  - The weight that gives exactly 162 mg is 80.5 kg.
  - Other candidates miss:
    - TBW − 0.4 × excess: 173 mg.
    - IBW: 143 mg.
    - James LBM: 141 mg.
    - Al-Sallami FFM: 140 mg.
    - ABW using an IBW from BMI 22: 160 mg.
  - **Conclusion (inferred, not confirmed):** Servin ABW in all weight covariates is consistent with the one published
    case.
    - It does not exclude substitution in a subset of covariates.
    - One search excerpt gave the formula as TBW − 0.4 × (TBW − IBW); that version does not reproduce 162 mg.
- **ANZCA alert.** Titled "Propofol pump software error". It names the B. Braun Space+ and says the manufacturer
  acknowledged the error and planned an update.
  - The alert's date (about 20 Aug 2025) and its recommended actions were **not seen**: UNVERIFIED.
- **Fix status.**
  - A Dec 2025 editorial says no technical clarification had been published by 15 Dec 2025.
  - No corrected software version was found.
  - BfArM notice 10660/26 (7 May 2026, Spaceplus Perfusor) exists, but its content was not readable. Check it.
- **Not published:**
  - affected software versions and regions;
  - whether maintenance rates are affected;
  - which covariates use the adjusted weight.
- **Regulators searched with no result:** TGA, HSA, Medsafe, MHRA, FDA. Their databases could not be opened.
- **In the app.** The BMI above 30 mode is off by default and labelled "reported, unverified". The calibration screen
  shows the published variant, the hypotheses, and the weight implied by any pump bolus.

## 6. Clinical comparisons

- **Displayed targets are not interchangeable.**
  - Ce at loss of consciousness: about 1.7 (Eleveld) vs 3.6 (Schnider) [linassi2023]; about 1.5 (Eleveld, Marsh) vs
    4.6 (Schnider) [introna2026b].
  - Eleveld reads lower at induction and higher in maintenance.
  - More burst suppression with Eleveld, especially in the elderly [linassi2023].
- **Switching models at the same Ce** (Schnider to Eleveld) can give an unintended large bolus [tanase2025].
  - The matcher exists for exactly this reason. A matched bolus is not a matched effect.
- **Obesity.**
  - An earlier Eleveld allometric model did best with total body weight [cortinez2014].
  - Adjusted body weight helped Schnider and Marsh, not Eleveld.
  - This is why a BMI-triggered adjustment inside Eleveld is an error, not a feature.
- **Older patients.** Eleveld under-predicts measured concentration by about 27% [vellinga2021].
- **No published RCT** of Eleveld vs Schnider with hypotension as the outcome in the elderly (one trial is registered,
  with no results yet), and no Eleveld vs Marsh induction RCT.
- **No published conversion table** between models' targets. The matcher's numbers are computed per patient.

## 7. Questions to test on a real Space plus Perfusor

Record the software version, syringe, drug library entry and concentration first. Use the Calibrate screen for each
bolus.

**Software and set-up**
1. Main software and TCI module versions? Does a release note mention a fix to Eleveld weight handling?
2. Which drugs and models are offered? Is Eleveld offered for remifentanil? Is sufentanil (Gepts) present?
3. Is the concentration fixed per library entry or entered at set-up?

**Per model**

4. Ce, Cp or both for each model? Is Marsh Ce offered, and with which ke0? Time the Ce peak after a Ce step from zero:
   about 3.9 min means ke0 0.26, about 1.6 min means 1.2.
5. Schnider Ce: fixed ke0 0.456 (peak at about 1.5 min) or derived from a 1.6 min time to peak? Compare the bolus with
   the emulator.
6. Covariates asked for each model, and the default opioid flag for Eleveld.
7. Age, weight, height and BMI limits per model; the message at each limit; any soft-warning band.
8. Is Schnider refused in obesity? At what BMI or weight?
9. Eleveld either side of BMI 30. Steps:
   - Enter the Milliet patient (M 63 y 173 cm, Ce 4, opioid on) at 85 kg and at 100 kg. The emulator predicts:
     - 85 kg (BMI 28.4): about 169 mg;
     - 100 kg, total body weight: 191 mg;
     - 100 kg, Servin ABW: 163 mg.
   - Then vary height at fixed weight to see whether BMI or weight triggers the switch.
10. Arterial or venous Eleveld? A venous set would give a bolus near 63 mg for the reference patient instead of 171.

**Targets and dosing**

11. Target minimum, maximum and step size; any soft-limit confirmation.
12. Ce-mode bolus rate: always the syringe maximum (1800 mL/h with a 50 mL syringe?) or lower? Does it change with
    syringe size?
13. Is the predicted Cp overshoot capped, or shown?
14. Rate update interval: watch the rate display (10 s?).
15. On lowering the target: 0 mL/h until the predicted level falls? Is a decrement time shown?
16. On raising the target in Ce mode: automatic bolus? Confirmation needed?

**During the case**

17. Pause or empty syringe: does the model keep running, and is there a re-bolus on resume?
18. Can the patient data or the model be changed mid-case?
19. Which displays are shown (trends, predictions, wake-up or decrement time)?
20. Maximum maintenance rate; any TCI-specific occlusion default.

## 8. Primary checks still owed (needs journal access)

- **Eleveld 2018:**
  - Tables 2 and 3.
  - The supplement's PK and PD code (θ7–14, θ16–18, ke0 0.146, Ce50 3.08).
  - The corrigendum's text.
- **Schnider 1998:**
  - The results tables.
  - The population ranges: 25 or 26 y at the lower age limit, 122 or 123 kg at the upper weight limit.
- **Schnider 1999 and Struys 2000:** abstract and results (ke0 and time to peak).
- **Marsh 1991:** the constants table.
- **Absalom 2009:** Tables 1–3 (pump behaviours).
- **Milliet 2025:** the letter itself, for the exact formula and which covariates are affected. Also the ANZCA alert's
  date and recommended actions, and BfArM 10660/26.
- **Servin 1993:** bibliographic details (from memory, UNVERIFIED).
- **B. Braun Space plus Instructions for Use** for the software version the department runs.
- **Every DOI** through doi.org.
- **Glen and Engbers** (sections 9 and 10): confirm the paper exists, then read what it reports about ke0 and the
  initial dose.

## 9. External analysis reviewed (supplied by the owner, 21 Oct 2026)

An unsourced written analysis was supplied. It argued that an Eleveld Ce 4 bolus matches Schnider Ce "about 5–6"
for a man aged 50, 170 cm, 70 kg. Each claim was checked against the oracle (`oracle/tci_ref.py`, which reproduces the
owner's golden values) and the sources. **Verdict: its conclusion is wrong for this patient (the oracle gives 9.33), and
several of its premises are wrong.** Kept here so the same errors are not reintroduced.

| Claim | Check (same patient, instant bolus, peak Ce = target) | Verdict |
|---|---|---|
| Schnider V1 4.27, V2 about 20.1, V3 238, CL about 1.64, ke0 0.456 | 4.27, 20.1, 238, 1.638, 0.456 | Correct |
| Eleveld V1 9.77, V2 29.0, V3 134, CL 1.53 (labelled 35 y, 70 kg) | Arterial: V1 6.28, V2 20.2 at 50 y (25.5 at 35 y), V3 137 with opioid (273 without), CL 1.55 with opioid. Venous V1 is 9.17, not 9.77 | V3 and CL roughly match "opioid, 50 y"; V1 and V2 match no Eleveld variant. Wrong |
| Eleveld ke0 0.146 x (W/70)^-0.25 | Same (arterial) | Correct |
| Eleveld Ce 4 gives about 1.7–1.8 mg/kg (about 122 mg) | 156 mg = 2.23 mg/kg with opioid; 178 mg (2.54 mg/kg) without; 60 mg venous. Owner's golden at 35 y: 171 mg | Wrong, by about 22%. No Eleveld variant gives 122 mg |
| Schnider Ce 4 gives about 1.1 mg/kg (about 77 mg) | 67 mg = 0.96 mg/kg | Overstated by about 15% |
| Matching needs Schnider Ce about 5–6 | 9.33 matches the Eleveld bolus. Even their own 122 mg would need Schnider Ce 7.3 | Wrong. Following it would leave the Schnider bolus about 40% short of the Eleveld bolus |
| Higher ke0 gives a faster rise and a higher plasma peak | For a Ce target, a higher ke0 gives a smaller bolus and less plasma overshoot. ke0 does not change plasma at all for a given infusion. The plasma peak per mg is set by V1: initial Cp 15.7 (Schnider) vs 24.9 µg/mL (Eleveld) at Ce 4 | Reversed. Eleveld's Ce 4 bolus gives the higher plasma peak |
| Kinetics are non-linear | These models are linear in dose; the matcher relies on it (tested to 1e-9) | Wrong |
| "Glen et al.": to deliver about 1.75 mg/kg the Schnider ke0 must slow to 0.20 /min | The oracle needs ke0 0.185 for Schnider Ce 4 to give 122 mg, so the arithmetic is plausible. The paper could not be found. A paper predating Eleveld 2018 cannot have reported an Eleveld bolus, so its 1.75 mg/kg probably refers to another model | Plausible arithmetic; source UNVERIFIED [glen2016] |
| Sleep endoscopy trial: Ce at end of procedure about 3.3 (Schnider) vs 2.1 (Eleveld) | The trial is Tanase 2025 (randomised, n = 25) [tanase2025]. The direction matches other studies; those numbers were not seen | Direction plausible; numbers UNVERIFIED |
| No fixed conversion; titrate to clinical endpoints; pump rules unknown | Agrees with sections 4 and 6 | Correct |

- **Lesson.** A per-patient number has to come from a model run, not from mg/kg rules of thumb.
- **What this app adds.** The matcher computes the number for each patient, and the tests pin it to the owner's
  golden values.
