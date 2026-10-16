# Pharmacodynamic models for a teaching anaesthesia simulator: research notes

> Research notes from the OT simulator planning session (14 Oct 2026), compiled by AI research agents from published
> sources, paraphrased and cited; nothing here is clinically reviewed. The curated spec is `../MODEL.md`; these notes
> keep the detail (PMIDs, what could not be checked). Open-source projects named here were read for ideas and to
> cross-check numbers only; no code from them is used.

Scope: published PD models a JavaScript simulator can implement, with numbers and primary sources. All patients are synthetic.
Markings:
- **[V]**: I checked the number in the abstract, full text, SmPC/USPI, or a published table during this session.
- **[S]**: I checked it only in a secondary source, which is named.
- **[U]**: from memory or textbook, not checked. Confirm before relying on it.

Concentrations are effect-site (Ce) unless marked plasma (Cp). Propofol is in µg/mL, opioids in ng/mL, and volatile agents in vol% end-tidal.

---

## 1. Propofol Ce → hypnosis and BIS

### 1a. Loss of response to verbal command (LOC)

| Source | Endpoint | Value | Notes |
|---|---|---|---|
| Schnider 1999 [V] | Steady-state C50, LOC | 2.35 / 1.80 / 1.25 µg/mL at age 25 / 50 / 75 yr | ke0 0.456 min⁻¹; time to peak effect after a bolus 1.6–1.7 min |
| Kazama 1997 [V] | Cp50 for eye opening to command | 4.4 µg/mL (3.8–5.0), plasma | Fentanyl 1 ng/mL lowers it 11%, 3 ng/mL lowers it 17% |
| Smith 1994 [V] | Cp50 / Cp95, verbal command | 3.3 / 5.4 µg/mL, blood | Falls with fentanyl and with age |
| Eleveld 2018 PD [V via Vandemoortele 2022] | BIS Ce50 | 3.08 × exp(−0.00635 × (age − 35)) µg/mL | ke0 0.146 × (WGT/70)^−0.25 min⁻¹ (arterial). This ke0 belongs with Eleveld PK only; do not mix it with Schnider PK. |

### 1b. BIS sigmoid models

**Eleveld 2018** (implement this with the Eleveld PK):
`BIS = E0 × (1 − Ce^γ / (Ce^γ + Ce50^γ))`

| Parameter | Value | Status |
|---|---|---|
| Ce50 | 3.08 µg/mL × exp(−0.00635 (age − 35)) | [V] (Vandemoortele 2022, Table 3) |
| ke0 | 0.146 min⁻¹ × (WGT/70)^−0.25 (arterial); about 1.24 min⁻¹ for venous samples | [V] (Vandemoortele 2022); venous value [S] (PAS source code) |
| E0 (baseline BIS) | 93 | [U] |
| γ | 1.47 when Ce ≤ Ce50; 1.89 when Ce > Ce50 | [U] |
| BIS output delay | about 15 s × exp(0.0517 (age − 35)) | [U] |

**Bouillon 2004 BIS response surface** (propofol + remifentanil, Minto/Greco-type, additive):
`U = Cp/C50p + Cr/C50r`, `BIS = E0 − Emax × U^γ/(1 + U^γ)`

| E0 | Emax | C50p (µg/mL) | C50r (ng/mL) | γ | β (interaction) | CV of C50p / C50r / γ |
|---|---|---|---|---|---|---|
| 97.4 | 97.4 | 4.47 | 19.3 | 1.43 | 0 (additive) | 18% / 89% / 30% |

[S] These values come from the PAS simulator source (`pd_models.py`, BIS_model 'Bouillon'), which cites Bouillon 2004. I could not open the original table. They agree with the abstract: BIS is far more sensitive to propofol than to remifentanil. Nieuwenhuijs 2003 [V] also found remifentanil (≤2 ng/mL) had no effect on BIS, even combined with propofol.

Quick check: Cp 3 µg/mL with no remifentanil gives BIS ≈ 62. Adding remifentanil 4 ng/mL gives BIS ≈ 53.

### 1c. Bouillon 2004 Greco parameters (asked for "exactly")

I could not get them. Bouillon 2004 fitted **hierarchical** models (best fit) and logistic regression for TOSS and TOL, and Greco-type surfaces for BIS and approximate entropy. The paper is closed access (LWW/ASA), so I could not read Table 2 or 3. Use the TOL parameters in §2 instead; they come from secondary sources that agree with each other.

---

## 2. Opioid–hypnotic interaction for noxious stimuli

### 2a. Model forms

- **Minto 2000** response surface: `Ua = Ca/C50a`, `Ub = Cb/C50b`, `θ = Ua/(Ua + Ub)`, `U50(θ) = 1 − βθ + βθ²`, `E = Emax(θ) × (U/U50)^γ / (1 + (U/U50)^γ)` with `U = Ua + Ub`. β > 0 gives synergy.
- **Greco**: an implicit equation with interaction term α. It needs a numerical solve each step and gave implausible estimates for sevoflurane–remifentanil (Heyse 2012) [V]. Avoid it.
- **Bouillon hierarchical** (opioid lowers stimulus intensity; hypnotic suppresses the residual):
  `post = pre × (1 − Cr^γr / (Cr^γr + (C50r·pre)^γr))`; `P(no response) = Cp^γp / (Cp^γp + (C50p·post)^γp)`
- **Reduced Greco / fixed-C50(O) hierarchical with γO = 1**. This is the simplest, and it is what Hannivoort 2016 and van den Berg 2021 use:
  `U = (CeP/Ce50P + CeS/Ce50S) × (1 + CeR/Ce50R)`; `P_TOL = U^γ / (1 + U^γ)`.
  Ce50R is the remifentanil concentration that halves the hypnotic Ce50. Heyse 2012 found the fixed-C50(O) hierarchical model fitted best [V].

### 2b. Parameter sets for probability of tolerating laryngoscopy (P_TOL)

| Model / data | Ce50 propofol (µg/mL) | Ce50 sevoflurane (vol%) | Ce50 remifentanil (ng/mL) | γ | Status |
|---|---|---|---|---|---|
| Bouillon 2004 data, reduced-Greco form (re-fitted in Hannivoort 2016, Table 1) | 8.48 | – | 1.16 | 3.46 | [V] quoted in van den Berg 2021 (PMC8286956) |
| Hannivoort 2016 triple model (sevo + prop + remi, pooled n = 120) | 7.58 (SE 0.49) | 2.59 (SE 0.13) | 1.36 (SE 0.15) | 5.22 (SE 0.52) | [V] abstract; propofol and sevoflurane additive, remifentanil strongly synergistic |
| Bouillon 2004 hierarchical (PAS transcription) | C50p 8.04, γp 5.1 | – | C50r 1.07, γr 0.97 | preopioid intensity 1.05 (laryngoscopy) | [S] PAS `TOL_model` |

Worked check: van den Berg 2021 [V] derived equipotent P_TOL = 90% pairs (U = 1.887) of propofol 8.6, 5.9, 3.6 and 2.0 µg/mL with remifentanil 1, 2, 4 and 8 ng/mL.

**Noxious Stimulation Response Index (NSRI, Luginbühl 2010).** NSRI is a 0–100 index derived from P_TOL. A form that fits the published anchors is
`NSRI = 100 / (1 + (P_TOL/(1 − P_TOL))^0.63093)`, equivalently `NSRI = 100/(1 + U^(0.63093·γ))`.
This gives NSRI 50 at P_TOL 50% and NSRI 20 at P_TOL 90%.
[U] I reconstructed this formula. The exponent 0.63093 = ln2/ln3 appears in a secondary snippet of a Vereecke abstract, but I could not open the original equation.

### 2c. Other stimuli: hypnotic alone and opioid shift

| Stimulus | Propofol Cp50 alone (Kazama 1997) [V] | Relative intensity (laryngoscopy = 1) | Effect of fentanyl |
|---|---|---|---|
| Verbal command (LOC) | 4.4 µg/mL | 0.45 | −11% at 1 ng/mL, −17% at 3 ng/mL |
| 50 Hz tetanus | 9.3 | 0.95 | Noxious stimuli: −31–34% at 1 ng/mL, −50–55% at 3 ng/mL |
| Laryngoscopy | 9.8 | 1.00 | (as above) |
| Skin incision | 10.0 | 1.02 | (as above) |
| Tracheal intubation | 17.4 | 1.78 | (as above) |

Smith 1994 [V] reported a propofol Cp50 for skin incision of 15.2 µg/mL alone (Cp95 27.4). Fentanyl 0.63 ng/mL halved it, 1 ng/mL lowered it 63% and 3 ng/mL lowered it 89%, with a ceiling above 3 ng/mL.

Kern 2004 [V]: Greco interaction indices for propofol–remifentanil were 5.1 (sedation), 8.2 (algometry), 14.7 (tetany) and 33.2 (laryngoscopy). Synergy is strongest for the strongest stimuli.

Manyam 2006 [V]: sevoflurane–remifentanil is synergistic for sedation and all pain endpoints. Fastest-recovery combinations plateau near sevoflurane 0.75% with remifentanil 6.2 ng/mL. Its parameter tables were not accessible.

### 2d. Computing the stimulus response (suggested design)

1. **Probability of no response for stimulus s.** Use the reduced-Greco form with a stimulus multiplier I_s on the hypnotic Ce50s (table 2c) and a stimulus-specific opioid weight w_s:
   `U_s = (CeP/(7.58·I_s) + CeS/(2.59·I_s)) × (1 + w_s·CeR/1.36)`, `P_s = U_s^5.22/(1 + U_s^5.22)`.
   Set w_s ≈ 0.1–0.2 for verbal command or TOSS, because opioids barely move LOC (Kazama, Katoh). Set w_s = 1 for noxious stimuli.
   [U] I_s and w_s are my calibration suggestion built from the sources above, not a published model.
2. **Movement.** Draw each synthetic patient's sensitivity quantile q ~ U(0,1) once. The patient moves at stimulus onset if P_s < q. This keeps behaviour repeatable for that patient.
3. **Autonomic response (HR, MAP, BIS).** This is not abolished at P_TOL 90%. In van den Berg 2021 [V], laryngoscopy at P_TOL = 90% still produced ΔSAP of 19–32 mmHg (median by group), ΔHR of 6–10 bpm and ΔBIS of 3–11. The smallest responses came with propofol 3.6 µg/mL plus remifentanil 4 ng/mL.
   - Use a second surface for autonomic blockade, needing about 1.5–2× the hypnotic Ce50 for movement and with the opioid relatively more potent. Basis: MAC-BAR is 1.45–1.6 MAC (Roizen 1981), and fentanyl 3 ng/mL cuts sevoflurane MAC-BAR by 83% but MAC by only 61% (Katoh 1999).
   - Scale the response: `ΔMAP = ΔMAPmax·(1 − P_auto)`, `ΔHR = ΔHRmax·(1 − P_auto)`. Calibrate so P_TOL 0.9 gives roughly ΔSAP +20–30 mmHg and ΔHR +6–10.
4. **Time course.** Garraza-Obaldia 2024 [V] adds the stimulus to the MAP turnover input: `h(Stim) = 1 + θ·e^(−k(t − t0))`, with θ = 0.284 and k = 0.021 min⁻¹ for hysteroscopy, a sustained surgical stimulus. For brief stimuli (laryngoscopy), use a faster k so the response peaks within 1–2 min and has mostly resolved by about 3–5 min. [U] Approximate; van den Berg captured a 3-minute window.
5. **Arousal.** Add ΔBIS of +3 to +11 for an autonomic or arousal response (van den Berg 2021). Larger rises (EMG and arousal) when the patient moves. [U]

---

## 3. Sevoflurane: MAC, hypnosis, BIS, MAC-awake, MAC-BAR, opioid MAC reduction

| Quantity | Value | Source |
|---|---|---|
| MAC at age 40 (in O2) | 2.1% (2.6% at 25 yr, 1.7% at 60, 1.4% at 80; with 65% N2O: 1.1% at 40) | Sevoflurane SmPC [V] |
| MAC at age 40 (meta-analysis) | 1.80% | Mapleson 1996 [V] |
| Age formula | MAC(age) = MAC40 × 10^(−0.00269 × (age − 40)), about 6% per decade, all agents | Mapleson 1996 [V]; Nickalls & Mapleson 2003 iso-MAC charts |
| MAC-awake | 0.62 ± 0.02% end-tidal, MAC-awake/MAC = 0.34 (also isoflurane) | Katoh 1993 [V] |
| BIS IC50 | 1.14 ± 0.31% (t½ke0 3.5 ± 2.0 min); isoflurane 0.60% | Olofsen & Dahan 1999 [V] |
| BIS EC50 | 1.29 (SD 0.19) vol%, ke0 0.48 min⁻¹ (t½ ≈ 1.4 min). Blink reflex EC50 0.34 vol% | Mourisse 2007 [V] |
| Sevoflurane + propofol | Additive, both for P_TOL and in general | Hannivoort 2016 [V] |
| P_TOL Ce50 (laryngoscopy) | 2.59 vol% (about 1.25 MAC40) | Hannivoort 2016 [V] |
| MAC-BAR, sevo + 60% N2O | 2.8% (2.5–3.0) = 1.95 MAC combined; remifentanil 1 ng/mL → 1.1% (1.1 MAC), 3 ng/mL → 0.2% (0.68 MAC) | Albertin 2004 [V] |
| MAC-BAR, sevo alone | about 4.15% (about 2× MAC) | Katoh 1999 [S] (quoted in a preprint; the abstract gives only % reductions) |
| MAC-BAR, older agents | Halothane 1.45 MAC, enflurane 1.60 MAC (with 60% N2O) | Roizen 1981 [V] |
| Fentanyl → sevo MAC | 3 ng/mL −59%; 10 ng/mL only a further 17% (ceiling) | Katoh & Ikeda 1998 [V] |
| Fentanyl → sevo MAC-awake | About −24% at 3 ng/mL; no ceiling seen | Katoh & Ikeda 1998 [V] |
| Fentanyl → sevo MAC / MAC-BAR | 3 ng/mL: −61% MAC, −83% MAC-BAR; 6 ng/mL adds only 13% and 9% | Katoh 1999 [V] |
| Remifentanil → isoflurane MAC | 50% reduction at 1.37 ng/mL (whole blood); 91% at 32 ng/mL; remifentanil alone never adequate. Fentanyl 1.67 and sufentanil 0.14 ng/mL give the same 50% reduction | Lang 1996 [V] |

Implications:
- MAC-BAR is closer to **1.5–2 MAC** than 1.3. The 1.3 MAC figure is "MAC95"-like (no movement in 95%), not MAC-BAR. [U] "1.3 MAC ≈ ED95 for movement" is textbook.
- MAC multiples can be converted to Ce for the interaction surfaces in §2.

---

## 4. Haemodynamic effects for a lumped model

### 4a. Propofol

| Source | Model | Key numbers | Status |
|---|---|---|---|
| Kazama 1999 | Effect site for SBP vs BIS | t½ke0 BIS 2.3 min at all ages. t½ke0 SBP 5.7 (20–39 yr), 5.9 (40–59), 8.9 (60–69), 10.2 min (70–85). Elderly fall further but more slowly | [V] |
| Jeleazcov 2015 | Direct sigmoid Emax with **2 effect sites** | ke1 0.054 and ke2 0.0695 min⁻¹ (t½ about 13 and 10 min); C50 1.96 and 2.20 µg/mL; γ 4.77 and 8.49; Emax 54.8 (SAP) and 18.1 (DAP) mmHg; young volunteers | [S] PAS source; abstract confirms the 2-effect-site structure |
| Su 2022 (mechanism-based, Snelder structure) | Turnover models for TPR, SV, HR with MAP feedback; propofol inhibits the production rate of TPR and SV | EC50 for TPR 2.96 µg/mL, SV 0.34 µg/mL | [V] abstract; other parameters not accessible |
| Su 2023 (adds remifentanil) | General pharmacodynamic interaction (GPDI) model | Propofol maximum reduction of TPR production 78% alone, 32% with remifentanil 4 ng/mL. Remifentanil alone raises TPR dissipation by 50% at 3.0 ng/mL; attenuates HR and SV dissipation by 4.8% and 4.9% per ng/mL. Propofol attenuates remifentanil's HR and SV effects (max 11.9% and 21.2%) | [V] abstract |
| **Garraza-Obaldia 2024** (open access, fully parameterised, patients) | `dMAP/dt = kin,MAP·(1 − f(Prop))·(1 − g_MAP(Remi))·(HR/HR0)^FB_HR·h(Stim) − kout·MAP`; `dHR/dt = kin,HR·(1 − g_HR(Remi))·h − kout·HR`, with kin = kout × baseline | See table 4b | [V] PMC11677492 |
| Nieuwenhuijs 2003 | Volunteers, steady state | BP −9.9% at propofol 1 µg/mL; −3.7% at remifentanil 1 ng/mL; HR and BP effects additive | [V] |
| Rolly 1985 | Propofol 2 mg/kg bolus | SBP −13 to −19 mmHg and DBP −10 to −14 mmHg at 2 min; HR change insignificant | [V] |
| Sjøen 2026 (placebo arm) | Propofol + remifentanil TCI induction | SAP −32% and HR −22% from baseline in the first 5 min | [V] |

Su 2022 parameter tables (BJA, CC-BY) exist, but the site blocked automated download.

### 4b. Garraza-Obaldia 2024 parameters (plasma Cp drivers, Schnider/Minto TCI, hysteroscopy patients)

| Parameter | Estimate |
|---|---|
| C50 propofol on MAP | 8.79 µg/mL (IIV 104%) |
| Emax propofol (fractional inhibition of kin,MAP) | 0.88 |
| γ propofol | not listed in the parameter table, probably fixed at 1 [U] |
| C50 remifentanil | 4.57 ng/mL (IIV 104%) |
| Emax remifentanil on HR | 0.69 |
| γ remifentanil | 1.20 |
| MAP0 / HR0 | 88.2 mmHg / 70.8 bpm |
| kout (MAP and HR) | 0.123 min⁻¹ |
| FB_HR (HR → MAP exponent) | 0.806; the MAP → HR feedback was not identifiable (about 0) |
| Stimulus θ / k_stim | 0.284 / 0.021 min⁻¹ (affects MAP only) |
| Residual error | MAP 5.5 mmHg, HR 4.3 bpm |

The paper also tried an effect-site driver with an estimated ke0. Its final model reports plasma-driven effects.

### 4c. Remifentanil

- Mostly lowers HR (vagotonic) and, through HR, MAP (Garraza-Obaldia; Su 2023). Effect on BP alone is modest: −3.7% per ng/mL (Nieuwenhuijs) [V].
- Higher remifentanil gives lower baseline HR at equal P_TOL (van den Berg 2021): about 60 bpm at 4–8 ng/mL vs about 71 at 1 ng/mL [V].
- PAS uses Standing 2010 (infants) for remifentanil → MAP: C50 17.1 ng/mL, γ 4.56. This is not adult data; avoid it.

### 4d. Sevoflurane

- Dose-dependent fall in MAP with no change in HR (SmPC; Malan 1995; Ebert 1995) [V, qualitative]. Mechanism: falling SVR plus some myocardial depression. Cardiac index falls at 1.0 and 1.5 MAC. At 2 MAC some volunteers became too hypotensive to measure. N2O and spontaneous ventilation reduce the depression (Malan) [V].
- Suggested lumped form: `SVR multiplier = 1 − Emax·MACfrac^γ/(MACfrac^γ + EC50^γ)`, tuned so 1 MAC gives about −20–25% MAP and 1.5 MAC about −30–35% in an unstimulated patient. [U] I could not extract exact percentages from the full texts.
- Roizen 1981 [V]: after induction, HR, BP and rate-pressure product converge toward a population mean regardless of agent. HR moves 58% of the way toward 63 bpm, and SBP moves 75% of the way toward 88 mmHg. This is a useful generic "post-induction" target.

---

## 5. Respiratory depression

### 5a. Bouillon indirect-response model with PaCO2 feedback

Structure (Bouillon 1999 alfentanil, 2003 remifentanil, 2004 propofol). This is my rendering; check against the papers before coding.

```
E      = Ce^γ / (Ce^γ + C50^γ)                      // drug effect on ventilatory drive
dPaCO2/dt  = kel·PaCO2,0 − kel·(1 − E)·(PeCO2/PaCO2,0)^F·PaCO2   // production − ventilatory elimination
dPeCO2/dt  = ke0,CO2·(PaCO2 − PeCO2)                 // CO2 at the chemoreceptor "effect site"
VE     = VE0·(1 − E)·(PeCO2/PaCO2,0)^F
```

| Drug | C50 | γ | F (CO2 gain) | ke0,CO2 (min⁻¹) | kel,CO2 (min⁻¹) | PaCO2,0 (mmHg) | VE0 (L/min) | Status |
|---|---|---|---|---|---|---|---|---|
| Remifentanil (Bouillon 2003) | 0.92 ng/mL | 1.25 | 4.30 | 0.92 | 0.08 | 42.4 | 7.06 | [V] |
| Propofol (Bouillon 2004) | 1.33 µg/mL (CV 50%) | 1.68 | 4.37 | 0.95 | 0.11 | 40.9 | 6.45 | [V]; the paper also corrects for propofol lowering CO2 production |
| Alfentanil (Bouillon 1999) | 60.3 ng/mL | – | 4 (fixed) | – | 0.088 | – | – | [V] |
| Fentanyl (van Lemmen 2025, physiological closed-loop model) | 2.3 ± 0.5 ng/mL | – | Controller gain 5.3 L/min/kPa (about 0.71 L/min/mmHg), time constant 2.4 min, tissue CO2 volume 6.1 L | – | – | – | – | [V]; simpler open-loop models gave 7.5 ng/mL |
| Fentanyl (Cartwright 1983) | 50% depression of CO2 responsiveness at 1.5–3.0 ng/mL; lower after hypocapnic ventilation | – | – | – | – | – | – | [V] |

**Combining propofol and remifentanil (synergy, Nieuwenhuijs 2003 [V]).**
Separately, 1 µg/mL propofol and 1 ng/mL remifentanil depressed resting ventilation by 12.6% and 27.7%. At fixed PETCO2 55 mmHg they depressed ventilation by 44.3% and 57.7%. Combined, the effect was "strikingly synergistic", strongest for resting ventilation.
Suggestion: `U = Cp/1.33 + Cr/0.92 + α·(Cp/1.33)(Cr/0.92)`, `E = U^γ/(1 + U^γ)`, with α ≈ 1–2 tuned to taste. [U]

**Apnoeic threshold.**
The power law (PeCO2/PaCO2,0)^F with F ≈ 4.3 drops ventilation steeply below baseline (−20% at 2 mmHg below), but it has no true apnoea point. Add one:
- If PeCO2 < AT, set VE = 0 (central apnoea).
- AT ≈ PaCO2,0 − 3 to 5 mmHg.
- Opioids raise AT (right shift).
[U] This threshold is not taken from these papers; the sleep and anaesthesia literature gives values a few mmHg below eupnoea.
Alternatively, use a linear CO2 response: `VE = S·(PaCO2 − B)`, with opioids lowering slope S and raising intercept B.

**Propofol induction apnoea.**
- Drummond & el-Farhan 1997 [V]: after a median 157 mg over 70 s, 17 of 26 patients became apnoeic. Median duration 24 s (quartiles 0, 76 s). Apnoea lasted longer if pre-induction ETCO2 was below the median (61 vs 10 s).
- Rolly 1985 [V]: apnoea >10 s was frequent after 2 mg/kg, whatever the injection rate.
- With an opioid co-induction, expect apnoea of about 1–3 min. [U] Textbook. A good model produces this from the CO2 feedback plus the threshold, without scripting it.

---

## 6. Vasoactive drugs (IV, 70 kg adult)

| Drug | Typical bolus (infusion) | Onset / peak | Clinical duration | Elimination | Effect size / receptor notes | Sources |
|---|---|---|---|---|---|---|
| **Phenylephrine** | 50–100 µg; single bolus ≤100 µg (25–100 µg/min) | Peak about 42 s (CABG patients) | About 20 min (SmPC); bolus effect wanes within about 5 min at induction | Terminal t½ about 3 h; Vd 340 L | Almost pure α1, arterial and venous. MAP +11.6 / +15.6 / +14.7 / +18.0 mmHg for 50 / 100 / 150 / 200 µg; SVR up; CO −0.6 to −0.8 L/min; reflex bradycardia | SmPC [V]; Schwinn & Reves 1989 [V]; Sjøen 2026 [V] |
| Phenylephrine PK/PD | – | Effect immediate (no measurable ke0) | – | 2-compartment: CL 160 L/h, V1 13.3 L, Q 25.3 L/h, V2 225 L (70 kg allometric) | Emax MAP about 50 mmHg in adults (25 in children); EC50 10.3 µg/L (children) | Anderson 2017 [V] |
| **Ephedrine** | 3–6 mg (max 9 mg) every 3–4 min, total ≤30 mg | About 1–2 min [U] | 10–60 min [U] | t½ 3 h (acid urine) to about 6 h (alkaline) | Direct α/β plus indirect NA release (tachyphylaxis); MAO inhibition. At induction, 0.1 mg/kg kept SAP (−20% vs −32% placebo) and CO (−22%) better than phenylephrine or noradrenaline boluses | SmPC [V]; Sjøen 2026 [V] |
| **Metaraminol** | 0.5–1 mg (single ≤1 mg; cumulative IV ≤5 mg) | 1–2 min | 20–60 min | – | Mainly α, some β1; direct plus indirect (false transmitter); less potent than NA but longer acting | SmPC [V] |
| **Noradrenaline** | Bolus 5–10 µg [practice]; infusion 0.05–0.15 µg/kg/min to start, 0.05–1.5 maintenance | Seconds | Pressor effect gone 1–2 min after stopping | Plasma t½ 1–2 min (SmPC). ICU: CL 3 → 0.9 L/min and t½ 2 → 6.8 min as SAPS II rises 20 → 60 | α1 ≫ β1; reflex bradycardia. Bolus ED50 10 µg (95% CI 6–17); phenylephrine ED50 137 µg; potency ratio 13.1; 8 µg ≈ phenylephrine 100 µg (spinal CS) | SmPC [V]; Beloeil 2005 [V]; Ngan Kee 2017 [V] |
| **Adrenaline** | Anaphylaxis 50 µg IV titrated; arrest 1 mg every 3–5 min; post-cardiac-surgery arrest 50–100 µg; infusion 0.05–0.5 µg/kg/min [U] | Seconds | Minutes | Plasma t½ 2–3 min; clearance 52 → 89 mL/kg/min at higher levels | Low doses act on β (HR up, DBP down via β2); α dominates at high doses. Plasma thresholds: HR 50–100 pg/mL, SBP 75–125, DBP fall 150–200 pg/mL; about 10× more potent than NA | SmPC [V]; Clutter 1980 [V] |
| **Atropine** | 0.3–0.6 mg (reversal 0.6–1.2 mg with neostigmine) | Peak HR rise 2–4 min (SmPC); 7–8 min after 1.35–2.15 mg in volunteers | HR effect 170–250 min after 1.35–2.15 mg | t½ 2–5 h | Muscarinic block. HR up to 192% / 217% of control at 1.35 / 2.15 mg. "Transient bradycardia followed by tachycardia" (SmPC); paradoxical slowing at <0.5 mg [U, AHA teaching]. HRV PD: EC50 1.35 ng/mL, γ 6.07, ke0 11.0 h⁻¹ (t½ about 3.8 min) | SmPC [V]; Hinderling 1985 [V]; Scheinin 1999 [V] |
| **Glycopyrronium** | 0.2–0.4 mg (4–5 µg/kg) | Onset within 1 min (SmPC) but HRV ke0 slower | Vagal block 2–3 h; antisialagogue up to 7 h | – | Quaternary, does not cross the blood–brain barrier. HRV PD: EC50 1.35 ng/mL, γ 4.34, ke0 2.26 h⁻¹ (t½ about 18 min), so it is slower than atropine | SmPC [V]; Scheinin 1999 [V] |
| **Esmolol** | Load 500 µg/kg/min for 1 min (about 35 mg), then 50–200 µg/kg/min (up to 300) | 1–2 min; steady state in 5 min with loading | 10–20 min offset [U] | t½ 9 min; distribution t½ 2 min; CL 285 mL/kg/min (red cell esterases) | β1 selective: HR and contractility down | SmPC [V] |
| **Labetalol** | 50 mg over 1 min, repeat every 5 min to ≤200 mg (SmPC, severe hypertension); anaesthetic practice 5–10 mg increments [U]; infusion about 160 mg/h | Max effect within 5 min | About 6 h (up to 18 h) | t½ about 4 h | α1 plus β block; α:β about 1:7 IV [U]. CO largely preserved | SmPC [V] |
| **GTN** | Infusion 10–200 µg/min (up to 400); bolus 50–100 µg [U, practice] | <1–2 min | Minutes | Plasma t½ 2–3 min; CL up to 3270 L/h | Venodilator more than arterial: preload falls most, SVR and MAP fall | SmPC [V] |
| **Ketamine** | 1–2 mg/kg induction (2 mg/kg → Cp 1.8–2.0 µg/mL at 5 min) | BP peaks within a few minutes | BP back to baseline in about 15 min; anaesthesia about 20 min | Distribution t½ 10–15 min | Indirect sympathomimetic (blocks catecholamine reuptake): SBP/DBP peak 10–50% above pre-induction. Direct myocardial depression appears when catecholamines are depleted [U, textbook] | Ketalar USPI [V]; SmPC [V] |
| **Oxytocin** (optional) | Elective CS: small bolus (about 1 IU) then titrated infusion [U on exact figures] | Seconds | Minutes | – | 5 IU bolus: HR +17 bpm, MAP −27 mmHg (5 IU over 5 min: +10 and −8). 10 IU bolus: HR +28, MAP −33 mmHg, ST changes, chest pain | Thomas 2007 [V]; Svanström 2008 [V]; Heesen 2019 consensus [V, abstract only] |

### Modelling suggestion (receptor-level, lumped circulation)

- **Compartments.** For each drug, use a short PK model, or one compartment with the t½ above. Catecholamines can act on plasma concentration directly (immediate effect, as Anderson found for phenylephrine) or with a 30–60 s lag.
- **Receptor activation.** `A_r = Σ_i Emax_i,r · C_i^γ/(C_i^γ + EC50_i,r^γ)` for r ∈ {α1, β1, β2, M2 (vagal), NA release}.
- **Mapping to the circulation:**
  - SVR multiplier = (1 + kα·A_α1)·(1 − kβ2·A_β2)·(propofol, volatile and GTN terms).
  - Venous tone and unstressed volume follow α1, which increases preload. Phenylephrine's CO fall is mostly afterload, but preload rises.
  - HR = HRintrinsic × (1 + kβ1·A_β1) − vagal tone × (1 − A_M2).
  - Contractility follows β1.
- **Baroreflex.** `HR_reflex = −G·(MAP − MAPset)` with a 5–15 s lag. Lower G under anaesthesia (volatile agents and propofol blunt it). This produces phenylephrine and noradrenaline reflex bradycardia and oxytocin or GTN tachycardia. [U] Pick G ≈ 0.5–1 bpm/mmHg awake and about half that anaesthetised.
- **Indirect agents** (ephedrine, metaraminol, ketamine). Release from a finite NA store S: `release = k·Ce·S`, with S refilling over tens of minutes. This gives ephedrine tachyphylaxis. Note the metaraminol SmPC says its vasoconstriction is not affected by store depletion, so give it a direct α component.
- **Atropine biphasic HR effect.** Model a small low-concentration vagotonic term plus the steep antimuscarinic Emax: `ΔHR = −a·Ce/(Ce + EC50low) + b·Ce^γ/(Ce^γ + EC50^γ)`, with EC50low ≪ EC50. [U]

---

## 7. Neuromuscular block

| Item | Value | Source |
|---|---|---|
| TOF count vs T1 (tubocurarine) | Over 75–100% T1 depression, T4, T3, T2 and T1 disappear in that order, and return in reverse order | Lee 1975 [V] |
| Usual mapping | T4 lost at T1 ≈ 25% (75% block); T3 at ≈ 20%; T2 at ≈ 10%; T1 at about 0–2% | [U] textbook values consistent with Lee |
| TOF ratio vs T1 at recovery (acceleromyography) | TOFR 0.70 ↔ T1 69 ± 8%; TOFR 0.90 ↔ T1 86 ± 5%; T1 90% needs TOFR 0.93 ± 0.08 | Kopman 2002 [V] |
| TOF ratio vs T1 (mechanomyography or EMG) | TOFR ≥0.70 ↔ T1 back to about control | Kopman 2002 background [V] |
| Post-tetanic count (PTC) | Counts responses after 50 Hz tetanus during intense block (TOF count 0). Low PTC = deep block; TOF returns as PTC rises | Viby-Mogensen 1981 (no abstract online) [V citation]; PTC→T1 timing is drug-specific [U] |
| Residual block | Patients with critical respiratory events in PACU: mean TOFR 0.62, 73.8% <0.70; controls 0.98 | Murphy 2008 [V] |
| Extubation target | Quantitative monitoring; TOFR ≥0.9 at the adductor pollicis | ASA 2023 guideline (Thilen) [V citation; content U] |
| Rocuronium | ED90 ≈ 0.3 mg/kg. At 0.6 mg/kg: clinical duration (to T1 25%) 30–40 min, T1 90% at about 50 min. t½ 73 min; CL 3.7 mL/kg/min; Vss 203 mL/kg | SmPC [V] |
| Suxamethonium | 1 mg/kg: onset 30–60 s, duration 2–6 min; plasma elimination t½ about 12–17 s. Phase I has minimal fade. Phase II (TOFR ≤0.3, resembles curare block) appears abruptly: Phase I up to 1–3 mg/kg total, Phase II at 3–5 mg/kg, transition about 2 mg/kg, with tachyphylaxis. Infusion 2.5–4 mg/min, ≤500 mg/h | SmPC [V]; Lee 1975 BJA [V] |

### Implementing fade

1. T1 = 1/(1 + (Ce/EC50)^γ).
2. Each later twitch is more sensitive: `Tn = 1/(1 + (Ce/(fn·EC50))^γ)`, with f2 ≈ 0.85, f3 ≈ 0.7 and f4 ≈ 0.59 (for γ ≈ 4.5).
3. A twitch counts as present if Tn > about 0.03–0.05 of control.
4. TOFR = T4/T1.

With f4 = 0.59 and γ = 4.5, T4 vanishes at T1 ≈ 25%, and TOFR is 0.7 at T1 ≈ 96% and 0.9 at T1 ≈ 99%. That matches mechanomyography. To mimic acceleromyography (TOFR 0.9 at T1 86%), use a shallower γ for T4 or lower the f values. [U] This is my heuristic; Jaklitsch & Westenskow 1990 built a comparable simulation of T1, TOFR and HR with relaxants, reversal and anticholinergics.

- Phase II after suxamethonium: when the cumulative dose exceeds about 3–5 mg/kg, switch on progressive fade (f4 → about 0.3).
- PTC: a deep-block estimate, e.g. PTC = round(k·(1 − T1-equivalent at a "50 Hz-potentiated" EC50)), capped at 15. [U]

---

## 8. Local anaesthetic systemic toxicity (LAST)

### Plasma thresholds

| Drug | CNS signs | Seizures / major CNS | CVS toxicity | Source |
|---|---|---|---|---|
| Lidocaine | Therapeutic IV analgesia 2.5–3.5 µg/mL; mild toxicity and neurological symptoms from about 6 µg/mL (Xylocaine USPI: objective adverse effects become more frequent above about 6 mcg/mL venous) | Monkey convulsion threshold 18–21 µg/mL arterial (USPI); humans about 8–12 µg/mL [U, textbook] | ">10 µg/mL" (El-Boghdadly 2018) vs classical 20–25 µg/mL [U]. Treat as a range | El-Boghdadly 2018 [V]; Xylocaine USPI [V] |
| Bupivacaine | CNS threshold at free plasma ≈ 0.3 mg/L (µg/mL); total about 2 µg/mL [U]. Widens QRS and depresses LV systolic and diastolic function at sub-convulsant doses | – | Low CC/CNS ratio, so cardiotoxicity is close to the CNS threshold (ratio about 2 vs about 7 for lidocaine [U]) | Knudsen 1997 [V]; Scott 1989 [V] |
| Ropivacaine | Free ≈ 0.6 mg/L; maximum tolerated total 4.3 (3.4–5.3) and free 0.6 (0.3–0.9) µg/mL arterial, with muscle twitching | – | Less cardiotoxic than bupivacaine; reduces systolic function only | Naropin USPI [V]; Knudsen 1997 [V] |

### Maximum doses (adult; reference figures vary by country)

| Drug | Plain | With adrenaline | Source |
|---|---|---|---|
| Lidocaine | 5 mg/kg (350 mg) | 7 mg/kg (500 mg) | El-Boghdadly 2018, Table 1 (from Berde & Strichartz / Miller's) [V] |
| Lidocaine (UK SmPC) | ≤200 mg (≈3 mg/kg at 70 kg) | ≤500 mg | SmPC [V] |
| Lidocaine (US Xylocaine) | 4.5 mg/kg, ≤300 mg [U] | 7 mg/kg, <500 mg [V] | USPI |
| Bupivacaine | 2 mg/kg (175 mg) | 3 mg/kg (225 mg) | El-Boghdadly 2018 [V]. UK SmPC commonly cited as 150 mg / 2 mg/kg in 4 h [U] |
| Levobupivacaine | 2 mg/kg (200 mg) | 3 mg/kg (225 mg) | El-Boghdadly 2018 [V] |
| Ropivacaine | 3 mg/kg (200 mg) | 3 mg/kg (250 mg) | El-Boghdadly 2018 [V]. US label: up to 770 mg over 24 h tolerated in infusions [V] |
| Prilocaine | 6 mg/kg (400 mg) | 8 mg/kg (600 mg) | El-Boghdadly 2018 [V] |

### Lipid emulsion 20% (ASRA, as summarised by El-Boghdadly 2018 [V])

- **Bolus:** 100 mL over 2–3 min if lean body weight >70 kg; 1.5 mL/kg if <70 kg.
- **Infusion:** 200–250 mL over 15–20 min, or 0.25 mL/kg/min if <70 kg.
- **If still unstable:** re-bolus up to 2 more times, or double the infusion to 0.5 mL/kg/min.
- **Maximum:** about 12 mL/kg.
- **Version:** the 2020 ASRA checklist (Neal, Neal & Weinberg 2021, RAPM 46:81) keeps this regimen. I could not open its text. [U] It also recommends adrenaline boluses ≤1 µg/kg and avoiding vasopressin, calcium-channel blockers, β-blockers and further local anaesthetic.
- **Seizures:** benzodiazepines first line. Avoid propofol if the circulation is compromised (El-Boghdadly) [V].

### Lipid pharmacology for the model

- Lipid acts as a "sink" (sequesters lipophilic local anaesthetic) and a "shuttle" (speeds redistribution to liver and muscle), plus direct cardiotonic and metabolic effects.
- Human volunteer data:
  - Bupivacaine 0.5 mg/kg plus Intralipid: context-sensitive half-life of total plasma bupivacaine fell from 45 to 25 min (Litonius 2012).
  - Lidocaine 1 mg/kg plus 1.5 mL/kg Intralipid: lower lidocaine AUC over 0–30 min (Heinonen).
  - Both tabulated in Zhou et al. 2021 (Front Med, PMC8606423) [S].
- **Simulator suggestion:**
  - Add a lipid compartment with partition coefficient K for free local anaesthetic, scaled by the lipid infused.
  - Raise the effective clearance about 1.5–2× while lipid is running.
  - Add a small positive inotropic term.
  - [U] All magnitudes need tuning.

---

## Sources (primary unless noted)

**Hypnosis and BIS**
- Schnider TW et al. Anesthesiology 1999;90:1502–16. PMID 10360845.
- Eleveld DJ et al. Br J Anaesth 2018;120:942–59. PMID 29661412; doi:10.1016/j.bja.2018.01.018.
- Vandemoortele O et al. J Clin Med 2022;11:2487. PMID 35566617; doi:10.3390/jcm11092487 (secondary: Eleveld equations).
- Bouillon TW et al. Anesthesiology 2004;100:1353–72. PMID 15166553; doi:10.1097/00000542-200406000-00006.
- PAS, Python Anesthesia Simulator (Aubouin-Pairault et al.): github.com/BobAubouin/Python_Anesthesia_Simulator, `src/python_anesthesia_simulator/pd_models.py` and `pk_models.py` (secondary transcription of Bouillon BIS and TOL, Jeleazcov, Beloeil).

**Interaction and noxious stimuli**
- Minto CF et al. Anesthesiology 2000;92:1603–16. PMID 10839909.
- Kern SE et al. Anesthesiology 2004;100:1373–81. PMID 15166554.
- Heyse B et al. Anesthesiology 2012;116:311–23. PMID 22222473; doi:10.1097/ALN.0b013e318242a2ec.
- Hannivoort LN et al. Br J Anaesth 2016;116:624–31. PMID 27106965; doi:10.1093/bja/aew060.
- Luginbühl M et al. Anesthesiology 2010;112:872–80. PMID 20216387; doi:10.1097/ALN.0b013e3181d40368.
- van den Berg JP et al. J Clin Monit Comput 2021;35:815–25. PMID 32488680; PMC8286956; doi:10.1007/s10877-020-00540-9.
- Manyam SC et al. Anesthesiology 2006;105:267–78. PMID 16871060.
- Kazama T et al. Anesthesiology 1997;87:213–27. PMID 9286884.
- Smith C et al. Anesthesiology 1994;81:820–8. PMID 7943832.

**MAC and sevoflurane**
- Mapleson WW. Br J Anaesth 1996;76:179–85. PMID 8777094.
- Nickalls RW, Mapleson WW. Br J Anaesth 2003;91:170–4. PMID 12878613.
- Katoh T et al. Anesth Analg 1993;76:348–52. PMID 8424514.
- Katoh T, Ikeda K. Anesthesiology 1998;88:18–24. PMID 9447851.
- Katoh T et al. Anesthesiology 1999;90:398–405. PMID 9952144.
- Albertin A et al. Anesthesiology 2004;100:255–9. PMID 14739797.
- Roizen MF et al. Anesthesiology 1981;54:390–8. PMID 7224208.
- Lang E et al. Anesthesiology 1996;85:721–8. PMID 8873541.
- Olofsen E, Dahan A. Anesthesiology 1999;90:1345–53. PMID 10319783.
- Mourisse J et al. Br J Anaesth 2007;98:737–45. PMID 17519261.
- Sevoflurane SmPC (eMC 833).

**Haemodynamics**
- Kazama T et al. Anesthesiology 1999;90:1517–27. PMID 10360846.
- Jeleazcov C et al. Br J Anaesth 2015;115:213–26. PMID 25627394; doi:10.1093/bja/aeu553.
- Su H et al. Br J Anaesth 2022;128:806–16. PMID 35249706; doi:10.1016/j.bja.2022.01.022.
- Su H et al. Br J Anaesth 2023;131:222–33. PMID 37355412; doi:10.1016/j.bja.2023.04.043.
- Garraza-Obaldia M et al. Pharmaceutics 2024;16:1615. PMID 39771593; PMC11677492; doi:10.3390/pharmaceutics16121615.
- Nieuwenhuijs DJ et al. Anesthesiology 2003;98:312–22. PMID 12552187.
- Rolly G et al. Br J Anaesth 1985;57:743–6. PMID 3874643.
- Malan TP et al. Anesthesiology 1995;83:918–28. PMID 7486177.
- Ebert TJ et al. Anesthesiology 1995;83:88–95. PMID 7605024.

**Ventilation**
- Bouillon T et al. Anesthesiology 1999;91:144–55. PMID 10422940.
- Bouillon T et al. Anesthesiology 2003;99:779–87. PMID 14508307.
- Bouillon T et al. Anesthesiology 2004;100:240–50. PMID 14739795.
- van Lemmen M et al. Anesthesiology 2025;143:1171–83. PMID 40773676; doi:10.1097/ALN.0000000000005710.
- Cartwright P et al. Anesth Analg 1983;62:966–74. PMID 6414339.
- Drummond GB, el-Farhan NM. Br J Anaesth 1997;78:153–6. PMID 9068331.

**Vasoactive drugs**
- Schwinn DA, Reves JG. Anesth Analg 1989;68:571–8. PMID 2541637.
- Anderson BJ et al. Paediatr Anaesth 2017;27:1050–5. PMID 28868789; doi:10.1111/pan.13221.
- Ngan Kee WD. Anesthesiology 2017;127:934–41. PMID 28872480; doi:10.1097/ALN.0000000000001880.
- Sjøen GH et al. Acta Anaesthesiol Scand 2026;70:e70138. PMID 41144827; doi:10.1111/aas.70138.
- Beloeil H et al. Br J Anaesth 2005;95:782–8. PMID 16227334.
- Clutter WE et al. J Clin Invest 1980;66:94–101. PMID 6995479.
- Hinderling PH et al. J Pharm Sci 1985;74:711–7. PMID 4032241.
- Scheinin H et al. Ther Drug Monit 1999;21:141–51. PMID 10217331.
- Thomas JS et al. Br J Anaesth 2007;98:116–9. PMID 17142825.
- Svanström MC et al. Br J Anaesth 2008;100:683–9. PMID 18385263; doi:10.1093/bja/aen071.
- Heesen M et al. Anaesthesia 2019;74:1305–19. PMID 31347151.
- UK SmPCs (medicines.org.uk/emc): propofol 15152, phenylephrine 12563, ephedrine 3594, metaraminol 11698, noradrenaline 8776, adrenaline 1:10,000 2024, atropine 3587, glycopyrronium 2786, esmolol 3057, labetalol 101671, GTN 6296, ketamine 100750, suxamethonium 5189, rocuronium 100324, lidocaine 6593 and 2397, ropivacaine 100394, bupivacaine with adrenaline 6622.
- US labels (DailyMed/openFDA): Ketalar, Xylocaine, Naropin.

**Neuromuscular block**
- Lee CM. Anesth Analg 1975;54:649–53. PMID 1237253.
- Lee C. Br J Anaesth 1975;47:841–5. PMID 1201162.
- Viby-Mogensen J et al. Anesthesiology 1981;55:458–61. PMID 7294384.
- Kopman AF et al. Anesthesiology 2002;96:583–7. PMID 11873031.
- Murphy GS et al. Anesth Analg 2008;107:130–7. PMID 18635478; doi:10.1213/ane.0b013e31816d1268.
- Thilen SR et al. Anesthesiology 2023 (ASA NMB guideline). PMID 36520073; doi:10.1097/ALN.0000000000004379.
- Jaklitsch RR, Westenskow DR. J Clin Monit 1990;6:24–38. PMID 2404085.

**LAST**
- El-Boghdadly K, Pawa A, Chin KJ. Local Reg Anesth 2018;11:35–44. PMID 30122981; PMC6087022.
- Neal JM, Neal EJ, Weinberg GL. Reg Anesth Pain Med 2021;46:81–2. PMID 33148630; doi:10.1136/rapm-2020-101986.
- Neal JM et al. 2017 ASRA checklist. Reg Anesth Pain Med 2018. PMID 29356775.
- Knudsen K et al. Br J Anaesth 1997;78:507–14. PMID 9175963.
- Scott DB et al. Anesth Analg 1989;69:563–9. PMID 2679230.
- Lipid-mechanism review, Front Med 2021. PMID 34820396; PMC8606423 (secondary for Litonius 2012 and Heinonen data).

---

## Uncertain

1. **Bouillon 2004.** I could not read the original tables. Not obtained: Greco parameters, TOSS hierarchical parameters, and the stimulus-specific preopioid intensities. The BIS set (97.4 / 4.47 / 19.3 / 1.43, β = 0) and the TOL hierarchical set (8.04 / 1.07 / 5.1 / 0.97, preopioid 1.05) come from PAS source code. The re-fitted reduced-Greco TOL set (8.48 / 1.16 / 3.46) comes from van den Berg 2021 quoting Hannivoort 2016.
2. **Eleveld 2018 PD.** Ce50 (3.08, age term −0.00635) and ke0 (0.146) are checked. E0 93, γ 1.47 / 1.89, BIS delay 15 s with age term 0.0517, and venous ke0 1.24 are from memory or PAS. Check them against the BJA paper.
3. **NSRI formula.** Reconstructed from published anchors (NSRI 20 = P_TOL 90%, exponent 0.63093). The original equation was not seen.
4. **Hannivoort 2016 triple model.** The form `U = (CeS/2.59 + CeP/7.58)(1 + CeR/1.36)` is inferred from the abstract wording ("1.36 ng/mL reduced the Ce50 … by 50%") and the van den Berg equation. The exact published form may differ slightly.
5. **Sevoflurane MAC-BAR.** 4.15% (Katoh 1999) is a secondary quote. Albertin's 2.8% with 60% N2O (1.95 MAC) is checked. "MAC-BAR ≈ 1.3–1.5 MAC" understates sevoflurane; the data support about 1.6–2.2 MAC.
6. **Sevoflurane MAP fall.** The percentage per MAC is not extracted. The "−20–25% at 1 MAC" figure is a tuning suggestion.
7. **Jeleazcov 2015 Emax values** (54.8 / 18.1 mmHg) are PAS transcriptions. Their exact meaning (SAP vs DAP, per effect site) is unclear.
8. **Su 2022 / 2023.** Only abstract parameters (EC50 TPR 2.96, SV 0.34 µg/mL; Emax 78%). The full turnover, feedback and circadian parameters were not accessible.
9. **Garraza-Obaldia 2024.** γ for propofol on MAP is not in the table (probably 1). The parameters are plasma-driven and come from hysteroscopy patients under TCI.
10. **Apnoeic threshold** (PaCO2,0 − 3 to 5 mmHg) and the propofol–remifentanil ventilatory interaction term α are modelling assumptions, not published values.
11. **Vasoactive drugs.** These figures are textbook or practice, not checked in this session:
    - noradrenaline bolus 5–10 µg outside obstetrics;
    - adrenaline infusion range;
    - atropine paradoxical bradycardia at <0.5 mg;
    - labetalol 5–10 mg increments and α:β 1:7;
    - GTN 50–100 µg boluses;
    - esmolol offset time;
    - ephedrine onset and duration;
    - baroreflex gain;
    - exact oxytocin consensus doses.

    Sjøen 2026 lists its prophylactic noradrenaline dose as "0.1 mg/kg" in the abstract, almost certainly a typographical error for 0.1 µg/kg; use the Ngan Kee bolus figures instead.