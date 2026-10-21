# References and assumptions

Source of the app's References and Assumptions panels (`npm run refs` rebuilds `src/refs.generated.json`).
Format: `### key Title`, then `- field: value` lines. Status tags:

- **VERIFIED**: primary source seen in full.
- **SECONDARY**: seen in abstract excerpts, a review, or concordant open implementations; not in the primary full text.
- **UNVERIFIED**: weak, single or conflicting source.

All checks were made on 21 Oct 2026. The session's network blocked every publisher, doi.org, PubMed, Europe PMC and
Crossref, so **no source could be read in full and no DOI could be resolved**. DOIs below were matched to the title in
search-index records of the publisher's own page. A second pass through doi.org was attempted for every DOI and
refused by the proxy. Re-check every DOI and constant against the PDFs before relying on them
(RESEARCH_NOTES.md, "Primary checks still owed").

## References

### eleveld2018 Eleveld propofol PK-PD model
- cite: Eleveld DJ, Colin P, Absalom AR, Struys MMRF. Pharmacokinetic-pharmacodynamic model for propofol for broad application in anaesthesia and sedation. Br J Anaesth 2018;120(5):942-959.
- doi: 10.1016/j.bja.2018.01.018
- pmid: 29661412
- url: https://www.bjanaesthesia.org/article/S0007-0912(18)30051-5/fulltext
- status: SECONDARY
- used: every Eleveld constant (theta1-18, ke0 0.146 arterial and 1.24 venous, Ce50 3.08, ageing -0.00635); data ranges (27 weeks PMA to 88 y, 0.68 to 160 kg). Constants taken from the supplement's NONMEM code as transcribed in stanpumpR, matching four other open implementations and table excerpts for theta1-6 and 15.
- checked: 21 Oct 2026

### eleveld2018c Corrigendum to Eleveld 2018
- cite: Corrigendum. Br J Anaesth 2018;121(2):519.
- doi: 10.1016/j.bja.2018.05.045
- pmid: 30032904
- status: SECONDARY
- used: reference Q2 of about 1.83 L/min (reported content of the correction; text not seen). The oracle's reference Q2 is 1.831.
- checked: 21 Oct 2026

### stanpumpr stanpumpR (Shafer)
- cite: Shafer SL. stanpumpR, open-source PK simulation; propofol models with the Eleveld supplement NONMEM code in comments (R/drugs_propofol.R, commit e15643f).
- url: https://github.com/StevenLShafer/stanpumpR
- status: SECONDARY
- used: weeks per year (52) and the maturation arguments (age x 52 + 40 weeks); Schnider and Marsh code from the original STANPUMP.
- checked: 21 Oct 2026

### alsallami2015 Al-Sallami fat-free mass
- cite: Al-Sallami HS, Goulding A, Grant A, Taylor R, Holford N, Duffull SB. Prediction of fat-free mass in children. Clin Pharmacokinet 2015;54(11):1169-1178.
- doi: 10.1007/s40262-015-0277-z
- status: SECONDARY
- used: FFM for Eleveld V3 (formula as used in the Eleveld supplement).
- checked: 21 Oct 2026

### schnider1998 Schnider propofol PK
- cite: Schnider TW, Minto CF, Gambus PL, et al. The influence of method of administration and covariates on the pharmacokinetics of propofol in adult volunteers. Anesthesiology 1998;88(5):1170-1182.
- doi: 10.1097/00000542-199805000-00006
- pmid: 9605675
- status: SECONDARY
- used: V1 4.27, V2 18.9 - 0.391(age-53), V3 238, CL1, CL2, CL3 0.836; 24 volunteers aged 26-81 y, 44-123 kg (122 in some sources).
- checked: 21 Oct 2026

### schnider1999 Schnider propofol PD
- cite: Schnider TW, Minto CF, Shafer SL, et al. The influence of age on propofol pharmacodynamics. Anesthesiology 1999;90(6):1502-1516.
- doi: 10.1097/00000542-199906000-00003
- pmid: 10360845
- status: SECONDARY
- used: ke0 0.456 /min; time to peak effect about 1.6 min (observed) and 1.7 min (model).
- checked: 21 Oct 2026

### james1976 James lean body mass
- cite: James WPT. Research on obesity: a report of the DHSS/MRC group. London: HMSO, 1976.
- status: SECONDARY
- used: LBM male 1.1W - 128(W/H)^2, female 1.07W - 148(W/H)^2; the formula peaks at BMI 43.0 (male) and 36.1 (female) at any height.
- checked: 21 Oct 2026

### marsh1991 Marsh propofol model
- cite: Marsh B, White M, Morton N, Kenny GNC. Pharmacokinetic model driven infusion of propofol in children. Br J Anaesth 1991;67(1):41-48.
- doi: 10.1093/bja/67.1.41
- pmid: 1859758
- status: SECONDARY
- used: V1 0.228 L/kg; k10 0.119, k12 0.112, k13 0.0419, k21 0.055, k31 0.0033 /min; ke0 0.26 /min (Diprifusor).
- checked: 21 Oct 2026

### struys2000 Struys effect-site targeting
- cite: Struys MMRF, De Smet T, Depoorter B, et al. Comparison of plasma compartment versus two methods for effect compartment-controlled target-controlled infusion for propofol. Anesthesiology 2000;92(2):399-406.
- doi: 10.1097/00000542-200002000-00021
- pmid: 10691226
- status: SECONDARY
- used: modified Marsh ke0 about 1.2 /min (time to peak 1.6 min). Study arms not seen.
- checked: 21 Oct 2026

### shafer1992 Shafer and Gregg effect-site algorithm
- cite: Shafer SL, Gregg KM. Algorithms to rapidly achieve and maintain stable drug concentrations at the site of drug effect with a computer-controlled infusion pump. J Pharmacokinet Biopharm 1992;20(2):147-169.
- doi: 10.1007/BF01070999
- pmid: 1629794
- status: SECONDARY
- used: Ce-target bolus sized so that the peak Ce equals the target; rate recomputed each interval.
- checked: 21 Oct 2026

### jacobs1993 Jacobs and Williams
- cite: Jacobs JR, Williams EA. Algorithm to control "effect compartment" drug concentrations in pharmacokinetic model-driven drug delivery. IEEE Trans Biomed Eng 1993;40(10):993-999.
- doi: 10.1109/10.247797
- pmid: 8294136
- status: SECONDARY
- used: background to effect-site control.
- checked: 21 Oct 2026

### vanpoucke2004 Limiting plasma overshoot
- cite: Van Poucke GE, Bravo LJB, Shafer SL. Target controlled infusions: targeting the effect site while limiting peak plasma concentration. IEEE Trans Biomed Eng 2004;51(11):1869-1875.
- doi: 10.1109/TBME.2004.827935
- pmid: 15536889
- status: UNVERIFIED
- used: background only (capping peak Cp cut overshoot by about 60% for about 20% slower onset). Second author uncertain. No Space Plus overshoot cap is documented.
- checked: 21 Oct 2026

### absalom2009 Absalom propofol models review
- cite: Absalom AR, Mani V, De Smet T, Struys MMRF. Pharmacokinetic models for propofol: defining and illuminating the devil in the detail. Br J Anaesth 2009;103(1):26-37.
- doi: 10.1093/bja/aep143
- pmid: 19520702
- status: SECONDARY
- used: pumps differ in Schnider effect-site handling: some derive ke0 per patient from a fixed 1.6 min time to peak, others fix ke0 at 0.456. Pump table not seen.
- checked: 21 Oct 2026

### absalom2016 TCI: a mature technology
- cite: Absalom AR, Glen JB, Zwart GJC, Schnider TW, Struys MMRF. Target-controlled infusion: a mature technology. Anesth Analg 2016;122(1):70-78.
- doi: 10.1213/ANE.0000000000001009
- status: SECONDARY
- used: background; pump BMI limits for Schnider (field notices).
- checked: 21 Oct 2026

### vandemoortele2022 Eleveld in practice review
- cite: Vandemoortele O, Hannivoort LN, Vanhoorebeeck F, Struys MMRF, Vereecke HEM. General purpose pharmacokinetic-pharmacodynamic models for target-controlled infusion of anaesthetic drugs: a narrative review. J Clin Med 2022;11(9):2487.
- doi: 10.3390/jcm11092487
- pmid: 35566617
- status: SECONDARY
- used: pumps ask for opioid co-administration because it changes Eleveld V3 and CL.
- checked: 21 Oct 2026

### milliet2025 Space Plus Eleveld implementation error
- cite: Milliet N. Identification of an error in the implementation of the Eleveld model in a commercial TCI pump. J Clin Monit Comput 2025 (online 29 Jul 2025).
- doi: 10.1007/s10877-025-01333-8
- pmid: 40728768
- status: SECONDARY
- used: index case (male 63 y, 173 cm, 100 kg, Eleveld with opioids, Ce 4): pump 162 mg vs 192 mg in TivaTrainer; BMI 30 threshold; Servin adjusted weight suspected. PMID from one secondary source only.
- checked: 21 Oct 2026

### anzca2025 ANZCA safety alert
- cite: ANZCA. Propofol pump software error (safety alert, B. Braun Space+ TCI, Eleveld model, BMI over 30).
- url: https://www.anzca.edu.au/news-and-safety-alerts/propofol-pump-software-error
- status: SECONDARY
- used: pump switches to a weight-adjustment formula above BMI 30, risking under-dosing; manufacturer said to have acknowledged it and planned an update. Alert date (about 20 Aug 2025) and recommended actions not seen: UNVERIFIED.
- checked: 21 Oct 2026

### esia2025 ESIA statement
- cite: Engbers FHM, Boveri S, Kenny G, Lobo FA. No right to be wrong (statement on the Eleveld implementation error). J Clin Monit Comput 2025;39(6):1335-1338.
- doi: 10.1007/s10877-025-01353-4
- pmid: 40986256
- status: SECONDARY
- used: professional response to the error.
- checked: 21 Oct 2026

### minto2025 Minto, Schnider, Sinclair letter
- cite: Minto CF, Schnider TW, Sinclair L. Letter on the Eleveld implementation error. J Clin Monit Comput 2025;39:1345-1347.
- doi: 10.1007/s10877-025-01382-z
- pmid: 41222847
- status: SECONDARY
- used: response to the error. Title not captured.
- checked: 21 Oct 2026

### introna2026 Introna editorial
- cite: Introna M et al. Editorial on the Eleveld implementation error. J Clin Monit Comput 2026;40(1):3-5.
- pmid: 41591700
- status: SECONDARY
- used: by 15 Dec 2025 the manufacturer had published no technical clarification. No fixed software version found.
- checked: 21 Oct 2026

### servin1993 Servin adjusted weight
- cite: Servin F, Farinotti R, Haberer JP, Desmonts JM. Propofol infusion for maintenance of anesthesia in morbidly obese patients receiving nitrous oxide. Anesthesiology 1993;78(4):657-665.
- status: UNVERIFIED
- used: adjusted weight IBW + 0.4 x (TBW - IBW), the formula the Space Plus is suspected to apply. Bibliographic details from memory, not seen this session.
- checked: 21 Oct 2026

### vellinga2021 Prospective validation of Eleveld
- cite: Vellinga R, Hannivoort LN, Introna M, et al. Prospective clinical validation of the Eleveld propofol pharmacokinetic-pharmacodynamic model in general anaesthesia. Br J Anaesth 2021;126(2):386-394.
- doi: 10.1016/j.bja.2020.10.027
- pmid: 33317804
- status: SECONDARY
- used: PK bias about -14% in adults and obese adults, about -27% in older patients (measured above predicted).
- checked: 21 Oct 2026

### linassi2023 Linassi Eleveld vs Schnider
- cite: Linassi F, Zanatta P, Spano L, et al. Schnider and Eleveld models for propofol target-controlled infusion anesthesia: a clinical comparison. Life 2023;13(10):2065.
- doi: 10.3390/life13102065
- status: SECONDARY
- used: displayed Ce at loss of responsiveness about 1.7 (Eleveld) vs 3.6 (Schnider); more burst suppression with Eleveld, worse in the elderly.
- checked: 21 Oct 2026

### introna2026b Introna LOC targets
- cite: Introna M et al. Target concentrations of propofol predicted by four PK/PD models to induce loss of consciousness in neurosurgical patients. J Anesth Analg Crit Care 2026.
- doi: 10.1186/s44158-026-00422-7
- status: SECONDARY
- used: Ce at loss of consciousness about 1.5 (Marsh, Eleveld) vs 4.6 (Schnider).
- checked: 21 Oct 2026

### cortinez2014 Propofol models in the obese
- cite: Cortinez LI, De la Fuente N, Eleveld DJ, et al. Performance of propofol target-controlled infusion models in the obese: pharmacokinetic and pharmacodynamic analysis. Anesth Analg 2014;119(2):302-310.
- doi: 10.1213/ANE.0000000000000317
- pmid: 24977639
- status: SECONDARY
- used: an earlier Eleveld allometric model performed best with total body weight in obesity.
- checked: 21 Oct 2026

### tanase2025 Tanase sleep endoscopy RCT
- cite: Tanase et al. Biomedicines 2025;13(4):822.
- doi: 10.3390/biomedicines13040822
- status: SECONDARY
- used: keeping the same starting Ce when switching from Schnider to Eleveld can give an unintended large bolus.
- checked: 21 Oct 2026

### glen2016 Glen and Engbers on ke0 and initial dose
- cite: Glen JB, Engbers FHM. The influence of target concentration, equilibration rate constant (ke0) and pharmacokinetic model on the initial propofol dose delivered in effect-site target-controlled infusion. Anaesthesia 2016 (details as recalled; not found by search).
- status: UNVERIFIED
- used: cited in the external analysis reviewed in RESEARCH_NOTES section 9: slowing Schnider ke0 to about 0.20 /min raises the Ce-target bolus to about 1.75 mg/kg. The oracle gives ke0 0.185 for the same bolus. Not used by the engine.
- checked: 21 Oct 2026

### bbraun B. Braun Space plus TCI
- cite: B. Braun Space plus Perfusor product pages and datasheets (models Eleveld, Schnider, Marsh, Minto, Gepts; rate 0.01-1800 mL/h).
- url: https://www.bbraun.com
- status: UNVERIFIED
- used: model list; maximum rate. The Instructions for Use (software 019D) could not be opened; patient limits seen only as garbled, conflicting text.
- checked: 21 Oct 2026

## Assumptions

### A1 Eleveld parameter set: arterial, ke0 0.146 x (W/70)^-0.25
- status: SECONDARY
Pumps and open simulators implement the arterial Eleveld set [eleveld2018]. The user's nine golden values match the arterial set to within 0.5% (venous gives about a third of the bolus). Whether the Space Plus uses arterial or venous parameters is not publicly documented: test question Q8.

### A2 Opioid flag
- status: SECONDARY
"Opioid on" means opioids present: V3 and CL are multiplied by exp(theta x age), uncentred, so the published reference values hold only without opioids [eleveld2018] [vandemoortele2022]. The app defaults to opioid on. The Space Plus default is unknown (Q5).

### A3 Effect-site bolus: peak Ce equals target
- status: SECONDARY
The induction bolus is the dose whose peak Ce equals the target [shafer1992]. The matcher treats it as instantaneous by default, which reproduces the golden values; Settings can run it at the pump's maximum rate instead. No cap on the plasma overshoot is applied, because none is documented for the Space Plus [vanpoucke2004].

### A4 Matched target
- status: VERIFIED
Because the models are linear, the matched target on model B is the bolus on model A divided by model B's bolus per unit target. It matches the induction bolus only; maintenance rates and clinical effect differ, and published loss-of-consciousness Ce values differ about threefold between models [introna2026b] [linassi2023].

### A5 Schnider ke0 fixed at 0.456
- status: SECONDARY
The emulator uses a fixed ke0 of 0.456 /min (time to peak about 1.5 min) [schnider1999]. Some pumps instead derive ke0 per patient from a 1.6 min time to peak [absalom2009]; the Space Plus is reported, weakly, to use the fixed value (Q4).

### A6 Marsh ke0
- status: SECONDARY
Selectable: 0.26 /min (original, time to peak about 3.9 min) or 1.2 /min (modified, about 1.6 min) [marsh1991] [struys2000]. Weak evidence suggests the Space Plus offers Marsh in plasma mode only, with 0.26 listed (Q3).

### A7 James LBM limit
- status: SECONDARY
James LBM peaks at BMI 43.0 (male) and 36.1 (female) and then falls, so Schnider clearance becomes wrong in obesity [james1976]. The app warns from 80% of the peak weight and flags weights past it. Pump BMI cut-offs (often 42 male, 35 female) are not confirmed for any named pump.

### A8 Reported Space Plus BMI above 30 behaviour
- status: UNVERIFIED
Reported: above BMI 30 the Space Plus Eleveld model uses an adjusted weight in place of total body weight [milliet2025] [anzca2025]. The app's BMI above 30 mode substitutes Servin's adjusted weight, IBW (Devine) + 0.4 x excess [servin1993], for weight in every Eleveld covariate. This reproduces the published index case (163 mg vs the pump's 162 mg; total body weight gives 191 mg vs TivaTrainer's 192 mg). Which covariates the pump changes, whether maintenance is affected, the affected software versions, and the fix status are not published (Q1, Q7).

### A9 Pump settings
- status: UNVERIFIED
Defaults: propofol 1%, maximum rate 1200 mL/h, rate recomputed every 10 s. A datasheet lists up to 1800 mL/h for the Space plus Perfusor [bbraun]; the update interval is not documented. A lower target stops the infusion until the predicted level falls (Q11, Q12).

### A10 Solver
- status: VERIFIED
Exact: analytic poly-exponential in the app, matrix exponential in the Python oracle; they agree to better than 1e-6 relative. Piecewise-constant infusion, no numerical integration.

### A11 Validity ranges
- status: SECONDARY
Warnings use the source data ranges: Eleveld up to 88 y and 160 kg [eleveld2018]; Schnider volunteers 26-81 y, 44-123 kg [schnider1998]. Pump input limits are not confirmed (Q6).
