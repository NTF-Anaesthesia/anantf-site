# Crisis scenarios for the OT simulator: guidelines, physiology, actions, teaching points

> Research notes from the OT simulator planning session (14 Oct 2026), compiled by AI research agents from published
> sources, paraphrased and cited; nothing here is clinically reviewed. The curated spec is `../MODEL.md` (and `../SCENARIOS.md`); these notes
> keep the detail (PMIDs, what could not be checked). Open-source projects named here were read for ideas and to
> cross-check numbers only; no code from them is used.

Research notes for planning. Synthetic patient, teaching only. Singapore (NUH) practice. Units: mmHg, metric
doses, adult 70 kg unless stated. Compiled 14 Oct 2026. Everything is paraphrased; nothing is copied from the
guideline texts. Doses are facts taken from the cited sources. Check the current version of each source before
coding, because some update yearly.

**How sure each point is**
- **[V]**: checked this session against the primary source or its official card/PDF (QRH, ANZAAG cards, Stanford
  manual, PubMed abstracts, DAS training scenarios, RCUK 2025 page, AoA 2024 blood guideline in PMC, SRFAC 2021 in PMC).
- **[S]**: from a secondary source found this session (course site, review, summary).
- **[U]**: my own recollection or standard teaching that I did not confirm this session. Verify before coding.
- "Debrief window" means a time I suggest for teaching feedback. **No guideline sets these times** unless a
  source is named.

EtCO2 conversions: 3.3 kPa ≈ 25 mmHg; 6 kPa ≈ 45 mmHg; 7 kPa ≈ 52 mmHg.

---

## 0. Licensing: what the simulator may reuse and what it may only cite

| Source | Licence | What the simulator may do |
|---|---|---|
| Association of Anaesthetists **Quick Reference Handbook (QRH)**, June 2023 compilation (cards 2-1…3-14) | **CC BY-NC-SA 4.0** [V] (printed on every card) | Non-commercial adaptation is allowed with attribution, and the adapted version must carry the same licence. Safest to cite and link, and write the simulator's own wording. |
| **Stanford Emergency Manual** v4.4 (2021/22) | **CC BY-NC-ND 4.0** [V] | No derivatives may be shared. Cite and link only; local adaptation is allowed inside an institution. |
| **Vortex Approach** (vortexapproach.org) | **CC BY-NC-ND 4.0** [V] | Graphics may be used unaltered for non-commercial teaching, with citation. No redrawn or modified Vortex. |
| **DAS 2015** intubation guideline (Frerk, BJA 2015) | CC BY-NC [V, Europe PMC metadata] | Non-commercial reuse with attribution. |
| **DAS 2025** intubation guideline (Ahmad, BJA 2026) | CC BY-NC-ND [V, Europe PMC metadata]; DAS describes it as open access | Cite and link; don't adapt the algorithm figures. |
| **AoA blood components 2024** (Shah, Klein et al., *Anaesthesia* 2025) | **CC BY 4.0** [V] | Most permissive: reuse with attribution. |
| AoA **MH 2020** guideline (Hopkins, *Anaesthesia* 2021) | CC BY-NC-ND [V, metadata] | Cite. |
| AoA **monitoring standards 2021** (Klein, *Anaesthesia* 2021) | CC BY-NC-ND [V, metadata] | Cite. |
| European trauma bleeding guideline, 6th ed. (Rossaint, *Crit Care* 2023) | CC BY [V, metadata] | Reuse with attribution. |
| NAP7 papers (*Anaesthesia* 2024) | mixed: CC BY (Nolan, ALS interventions), CC BY-NC (epidemiology; anaphylaxis arrest), CC BY-NC-ND (management/outcomes) [V, metadata] | Cite. |
| **ANZAAG–ANZCA** anaphylaxis cards (version 14 Nov 2022) | **© ANZCA/ANZAAG, all rights reserved** [V] | Free to read only. Cite; don't reproduce the cards. |
| MHAUS "Managing a crisis" web page | Free to read; no open licence seen [S] | Cite. |
| ASRA LAST checklist 2020 | Free download; ASRA copyright [S] | Cite. |
| ERC 2021/2025 guidelines | Free download from ERC; licence not confirmed [U] | Cite; check the ERC download-centre terms before using algorithm images. |
| AHA 2020/2025 guidelines | Free to read; © AHA [U] | Cite. |
| SRFAC Singapore ACLS 2021 (SMJ, in PMC) | Free to read; "© Singapore Medical Association"; no CC licence shown [V] | Cite. |
| NAP4/5/6/7 reports (RCoA) | Free to read; © RCoA [U] | Cite. |
| ANZCA PG61(A) 2017 | Free to read; © ANZCA [U] | Cite. |

Default for the simulator: write all text in its own words, cite each source by title, year and DOI or URL, and
link out. Don't embed figures from ND or all-rights-reserved sources.

---

## 1. Hypotension after induction (propofol + opioid; elderly; hypovolaemic)

**(a) Guidelines.** No single guideline covers post-induction hypotension. Cite:
- AoA **QRH 2-4 Hypotension** (v1). CC BY-NC-SA. https://anaesthetists.org/qrh [V]
- **Stanford Emergency Manual, "Hypotension" (#16)**, v4.4. [V]
- **POQI-3 consensus on intraoperative BP**: Sessler DI et al. *BJA* 2019;122:563–574, doi 10.1016/j.bja.2019.01.013.
  Even brief periods of MAP below 60–70 mmHg or SBP below 100 mmHg are associated with myocardial injury, acute
  kidney injury and death, and the harm scales with severity × duration. [V]
- **Südfeld S et al.** *BJA* 2017;119:57–64, doi 10.1093/bja/aex127. Defines post-induction hypotension as the
  first 20 min after induction. Risk factors: low pre-induction SBP, older age, emergency surgery. [V]

**(b) Physiological signature (model).**
- Causes: venodilation and arteriolar dilation, a reset baroreflex (propofol), vagotonia (opioid), and lower
  sympathetic tone. In the elderly, induction-to-peak time is longer (slower circulation), so the trough comes
  later, about 3–6 min, and is deeper [U, standard pharmacology].
- MAP falls 20–40% from baseline. HR usually does not rise much: propofol blunts the reflex, and beta-blockers or
  opioids blunt it further [U].
- **Hypovolaemia** makes it worse:
  - a larger, earlier fall;
  - high pulse-pressure variation (PPV) or stroke-volume variation (SVV), above about 12–13%, if there is an
    arterial line;
  - a quick response to leg raise or a fluid bolus.
- **ACE inhibitor or ARB** use: vasoplegia that responds poorly to phenylephrine or ephedrine and well to
  vasopressin (Stanford lists vasopressin 0.5–1 unit) [V].
- **What the monitors show first:**
  - an arterial line shows the fall straight away;
  - without one, the earliest continuous clues are a smaller pleth amplitude or perfusion index, and an EtCO2 that
    falls a few mmHg as cardiac output falls at fixed ventilation;
  - NIBP shows it only at the next cycle. **Model the NIBP cycle delay** (a teaching point).
- Laryngoscopy gives a transient rise. The quiet period afterwards (prep and draping, 5–15 min) is the second
  trough [U].

**(c) Key actions (adult 70 kg).**

| Step | Detail (source) |
|---|---|
| Confirm and exclude | Re-cycle NIBP; check the arterial transducer. Run the ABCD check from the QRH: oxygen, airway (oesophageal or bronchial tube), breathing (pneumothorax, auto-PEEP), circulation, depth. Think of anaphylaxis, bleeding and drug error (QRH 2-4 Box E). [V] |
| Reduce anaesthetic | Turn the volatile or TCI target down, but keep the depth adequate (QRH flags awareness risk). Suggested floor: age-adjusted MAC ≈ 0.7 or BIS 40–60 [U]. |
| Position | Head-down or leg raise (QRH, Stanford). [V] |
| Fluid | Crystalloid 250 mL bolus in adults (10 mL/kg in children), repeated by response (QRH). If the patient is bleeding, give blood (see Scenario 5). [V] |
| Phenylephrine | 50–100 µg IV. QRH gives 100 µg for adults; Stanford gives 100–300 µg. Onset under 1 min, lasts 5–10 min, causes reflex bradycardia. **Choose when HR is normal or high.** Infusion is usually 20–70 µg/min [U]. [V for boluses] |
| Ephedrine | 3–12 mg (QRH); Stanford gives 5–20 mg. Usual bolus 3–6 mg. Onset 1–2 min, lasts 10–15 min. Shows tachyphylaxis (repeated doses work less). **Choose when HR is low.** [V for doses] |
| Metaraminol | 500 µg bolus (QRH), commonly 0.25–0.5 mg. Common in the UK. **Availability in Singapore not verified.** [V dose; U availability] |
| Noradrenaline | Not in QRH 2-4. Common practice: 5–10 µg bolus or 0.02–0.1 µg/kg/min infusion (peripheral, diluted, short-term, per local policy) [U]. |
| Adrenaline | 10–100 µg IV, emergency only (QRH). Stanford: 10–50 µg if ephedrine or phenylephrine fail. [V] |
| Vasopressin | 0.5–1 unit IV if refractory, e.g. with ACEi or ARB (Stanford). [V] |
| Anticholinergic if HR < 60 | Glycopyrrolate 200–400 µg or atropine 300–600 µg (QRH). [V] |
| Others | Calcium chloride 1 g slow; hydrocortisone 100 mg for suspected adrenal insufficiency; methylene blue 1.5–2 mg/kg for vasoplegia (Stanford). [V] |

- **Target:** MAP ≥ 65 mmHg, or within about 20% of baseline. The POQI harm threshold is MAP 60–70 mmHg.
- **Debrief windows:**
  - recognise within one NIBP cycle, and set the NIBP to cycle every 1–2 min around induction;
  - first treatment within 1–2 min of recognition;
  - MAP ≥ 65 mmHg within about 5 min;
  - call for help if there is no response after 2–3 doses;
  - score the cumulative minutes with MAP < 65 mmHg.

**(d) Wrong actions worth modelling.**
- Repeated phenylephrine in a bradycardic patient: cardiac output falls further.
- Ephedrine repeated past tachyphylaxis.
- Turning the anaesthetic off completely (awareness risk), or not reducing it at all.
- NIBP left on 5-minute cycles.
- A large fluid load in a patient with a poor left ventricle.
- Chasing the number with vasopressors while missing anaphylaxis (rash often absent), bleeding, pneumothorax,
  auto-PEEP or a syringe swap.
- A full "young adult" induction dose in a frail, hypovolaemic patient (prevention).

**(e) Teaching points.**
1. Harm depends on depth × duration of hypotension. Treat early, and cycle the NIBP often.
2. Match the vasopressor to the heart rate: phenylephrine when HR is high, ephedrine when it is low.
3. Hypotension is often a sign of something else: run a systematic check (QRH 2-4) before reaching for drugs.
4. Prevention: titrate the induction dose to age and volume status, and preload or give a vasopressor early in
   high-risk patients.
5. Patients on ACE inhibitors or ARBs may need vasopressin.

---

## 2. Laryngospasm (emergence or light plane; children and adults)

**(a) Guidelines and sources.**
- AoA **QRH 3-6 Laryngospasm and stridor** (v1). CC BY-NC-SA. [V]
- Hampson-Evans D, Morgan P, Farrar M. "Pediatric laryngospasm." *Paediatr Anaesth* 2008;18:303–307. Describes
  the MEPA algorithm (agreed 2006; supported by the Association of Paediatric Anaesthetists, APA, and RCoA). [V]
- Larson CP Jr. "Laryngospasm—the best treatment." *Anesthesiology* 1998;89:1293–1294 (the laryngospasm-notch
  manoeuvre). [V citation]
- Gavel G, Walker RWM. "Laryngospasm in anaesthesia." *Contin Educ Anaesth Crit Care Pain* 2014;14:47–51. [U citation]
- NPPE review: Ma J et al. *Exp Ther Med* 2023;26:455, doi 10.3892/etm.2023.12154 (PMC10443067). [V]
- The Stanford manual has **no** laryngospasm card. [V]

**(b) Physiological signature.**
- **Trigger:** a light plane plus airway stimulation: secretions or blood, extubation in stage 2, suction, an airway
  device, or surgical stimulation. URTI raises the risk greatly.
- **Incidence:** about 17 per 1000 anaesthetics in children aged 0–9 years. Children have 2–3 times the adult
  rate [V, Hampson-Evans citing Olsson 1984].
- **Partial spasm:**
  - inspiratory stridor ("crowing"), tracheal tug, see-saw chest and abdomen;
  - low tidal volume, and a small, ragged capnogram.
- **Complete spasm:**
  - silent; no bag movement, no EtCO2 trace and no chest movement despite effort;
  - CPAP can make complete spasm worse (Hampson-Evans).
- **SpO2 falls after a lag:** about 1–3 min in a pre-oxygenated adult, under 30–60 s in an infant [U, approximate].
- **Heart rate:** first tachycardia and hypertension, then **hypoxic bradycardia** (early and ominous in children),
  then arrest.
- **NPPE (negative-pressure pulmonary oedema)** after the spasm is relieved:
  - persistent hypoxaemia, pink frothy secretions, crackles;
  - onset within minutes up to a few hours [U for timing];
  - laryngospasm after extubation is the commonest cause (Ma 2023) [V].

**(c) Key actions.**
1. Call for help. Stop the stimulus. Suction under direct vision and remove any irritant device (QRH). [V]
2. **Jaw thrust plus Larson's manoeuvre:** firm pressure in the notch behind the earlobe, between the mandibular
   ramus and the mastoid. [V]
3. **CPAP with 100% O2** via a tight facemask. Avoid vigorous IPPV, which inflates the stomach. Add an oral or
   nasal airway if the obstruction may be above the larynx (QRH). [V]
4. **Deepen with propofol** (sources differ):
   - QRH: 0.25–0.5 mg/kg (the same range covers rocuronium and atracurium);
   - Hampson-Evans: 0.5–0.8 mg/kg in children;
   - common adult practice: 0.5–1 mg/kg, about 30–50 mg [U].
5. **Suxamethonium IV** if the spasm persists or SpO2 keeps falling:
   - low dose 0.1–0.5 mg/kg relaxes the cords (QRH 0.25–0.5 mg/kg; Chung 1993 used 0.1 mg/kg);
   - 1–2 mg/kg if intubation is needed (Hampson-Evans calls this the "gold standard"). [V]
6. **Suxamethonium IM** about 4 mg/kg if there is no IV access: quadriceps, intralingual or submental. Onset is
   slower (intralingual or submental is faster than thigh). The MEPA flowchart gives 3–4 mg/kg. [V]
7. **Atropine 20 µg/kg IV** (or IM) in children: with suxamethonium, and certainly if they are bradycardic.
   [V, Hampson-Evans]
8. Intubate if the spasm recurs or there was aspiration. Decompress the stomach with a nasogastric tube (QRH).
   Watch for NPPE: O2, CPAP or PEEP, reintubation if needed; diuretics are debated. [V]

- **Debrief windows:**
  - jaw thrust and CPAP within about 10–15 s;
  - propofol within about 30 s if the spasm is not resolving or SpO2 < 90%;
  - suxamethonium (with atropine in children) within about 60 s if SpO2 keeps falling, or at once if bradycardia
    develops.
- Use tighter thresholds for infants.

**(d) Wrong actions.**
- Vigorous positive-pressure ventilation causing gastric distension.
- Extubating in a light plane (stage 2).
- Repeated pharyngeal suction while the patient is light.
- More propofol in a hypoxic, bradycardic child instead of suxamethonium and atropine.
- Delaying suxamethonium "to avoid it".
- Not recognising silent complete spasm (mistaking it for apnoea).
- Missing NPPE after recovery.
- Removing the mask repeatedly.

**(e) Teaching points.**
1. Prevention: extubate either deep or fully awake, never in between.
2. A correctly placed tracheal tube rules out laryngospasm (QRH).
3. Escalation ladder: CPAP and jaw thrust, then propofol, then suxamethonium (with atropine in children).
4. In children, bradycardia means hypoxia: act immediately.
5. Look for NPPE afterwards.

**Singapore default:** use the QRH-style ladder, with propofol 0.5–1 mg/kg, suxamethonium 0.5 mg/kg IV
(1–2 mg/kg to intubate), suxamethonium 4 mg/kg IM, and atropine 20 µg/kg in children.

---

## 3. Perioperative anaphylaxis

**(a) Guidelines.**
- **ANZAAG–ANZCA Perioperative Anaphylaxis Management Guidelines**, version 14 Nov 2022, with cards (immediate
  management for adults, refractory management, paediatric, post-crisis, differential diagnosis).
  https://www.anzca.edu.au/resources/professional-documents/endorsed-guidelines/anaphylaxis-guideline-bp-2022.pdf
  © all rights reserved. [V]
- AoA **QRH 3-1 Anaphylaxis v5** (incorporates NAP6). CC BY-NC-SA. [V]
- **NAP6** (RCoA 2018):
  - Harper NJN et al. *BJA* 2018;121:159–171, doi 10.1016/j.bja.2018.04.014 (epidemiology);
  - Harper NJN et al. *BJA* 2018;121:172–188, doi 10.1016/j.bja.2018.04.015 (management). [V]
- **ISPAR international consensus:** Garvey LH et al. *BJA* 2019;123:e50–e64, doi 10.1016/j.bja.2019.04.044. Covers
  areas where guidelines disagree, such as adrenaline and fluid dosing and the threshold for CPR. [V abstract]
- **NAP7 anaphylaxis arrests:** Cook TM et al. *Anaesthesia* 2024;79:498–505, doi 10.1111/anae.16229. [V]
- **RCUK** "Emergency treatment of anaphylaxis" 2021 (tryptase timing); NICE NG258 (timing of blood samples). [S]
- Stanford manual "Anaphylaxis" #5. [V]
- I found **no 2021 Association of Anaesthetists anaphylaxis guideline**. The AoA tool now in use is QRH 3-1 v5.
  The older AoA safety guideline is "Suspected anaphylactic reactions associated with anaesthesia" (Harper et al.,
  *Anaesthesia* 2009) [U]. Treat a "2021 Harper/Garvey AoA guideline" as unverified.

**Grading.**
- Ring & Messmer: grades I–IV (I cutaneous; II moderate multi-organ; III life-threatening, i.e. shock or
  bronchospasm; IV cardiac or respiratory arrest).
- NAP6 used a modified 1–5 scale (3 life-threatening, 4 arrest, 5 death) and collected only grades 3–5. [V that
  NAP6 used grades 3–5; exact criteria U]
- ANZAAG doses by "moderate" vs "life-threatening". [V]

**(b) Physiological signature (NAP6 data [V]).**
- **Incidence:** about 1 in 10,000 anaesthetics.
- **First presenting feature:**

  | Feature | Share of cases |
  |---|---|
  | Hypotension | 46% |
  | Bronchospasm | 18% |
  | Tachycardia | 9.8% |
  | Desaturation | 4.7% |
  | Bradycardia | 3% |
  | Low or absent capnography trace | 2.3% |

- **Every patient** became hypotensive.
- **Onset:** rapid with NMBAs and antibiotics (minutes); **delayed with chlorhexidine and Patent Blue.**
- **Pattern by culprit:** suxamethonium reactions mainly bronchospasm; atracurium reactions mainly hypotension.
- **Arrests:** 40 cardiac arrests and 10 deaths. Arrests were usually PEA, often with bradycardia.
- **Poor outcome** with higher ASA grade, obesity, beta-blockers and ACE inhibitors.
- **Model:**
  - a sudden fall in SVR plus capillary leak (effective hypovolaemia over 10–30 min);
  - HR rising (or falling, in severe or beta-blocked cases);
  - EtCO2 falling with cardiac output;
  - with bronchospasm: rising Ppeak, upsloping capnogram, smaller Vt in PCV;
  - SpO2 falls later;
  - skin signs often absent in severe reactions (QRH).

**(c) Key actions (adult 70 kg).**

| Step | ANZAAG 2022 [V] | AoA QRH 3-1 v5 [V] |
|---|---|---|
| Immediate | Remove triggers (chlorhexidine, synthetic colloid), stop the procedure, minimal volatile or TIVA, 100% O2, confirm capnography, consider early intubation for airway oedema | Call for help, stop surgery, remove agents, switch to volatile, 100% O2, raise the legs |
| Adrenaline IV, moderate | 10–20 µg; if no response, 50 µg; every 1–2 min | 50 µg (0.5 mL of 1:10,000), repeated |
| Adrenaline IV, life-threatening | 50–100 µg; if no response, 200 µg; every 1–2 min | Same bolus, repeated |
| Adrenaline IM (no IV or monitoring) | 500 µg every 5 min | 500 µg |
| Infusion | After more than 3 boluses: 3 mg in 50 mL, 3–40 mL/h (3–40 µg/min); peripheral line acceptable | After 3 boluses: same 3 mg/50 mL regimen (or 5 mg/500 mL) |
| Fluid | 500 mL (moderate) or 1000 mL (life-threatening) crystalloid, repeated; refractory: further 50 mL/kg | 20 mL/kg crystalloid, repeated |
| CPR | Compressions if SBP < 50 mmHg; arrest: adrenaline 1 mg IV, repeated every 1–2 min as needed, plus 2 L crystalloid | CPR if SBP < 50 mmHg or arrest (→ QRH 2-1) |
| Refractory hypotension | Noradrenaline 3–40 µg/min **and/or** vasopressin 1–2 units then 2 units/h; if neither, metaraminol or phenylephrine infusion; **glucagon 1–2 mg every 5 min** (counters beta-blockade); TOE/TTE; ECMO | Metaraminol, noradrenaline ± vasopressin 2 units (repeat or infuse); glucagon 1 mg (repeat) if beta-blocked |
| Bronchospasm | Salbutamol MDI 12 puffs (1200 µg), IV 100–200 µg ± 5–25 µg/min; magnesium 2 g over 20 min; volatile; ketamine | → QRH 3-4 |
| Steroid and antihistamine | Not first-line | **No longer part of acute treatment.** Steroid for refractory cases; oral non-sedating antihistamine for skin signs |

- **Tryptase** (5–10 mL clotted blood):
  - first sample as soon as feasible, without delaying treatment;
  - second at 1–2 h after onset, and no later than 4 h;
  - third at least 24 h after resolution, or at the clinic (QRH 3-1; RCUK 2021). [V]
  - NAP6 noted that early levels fall within about 30 min [S].
- **Afterwards:** prevent re-exposure (allergy band, notes), refer to an allergy clinic, inform the patient,
  report. In Singapore, report to HSA's adverse-event system [U on the Singapore route].
- **Common culprits:**
  - NAP6, UK [V]: antibiotics 94 of 199 (teicoplanin caused 38% of antibiotic reactions from 12% of exposures);
    NMBAs 65 (suxamethonium about twice other NMBAs); chlorhexidine 18; Patent Blue 9; none from local anaesthetic
    or latex;
  - **cefazolin** is the leading antibiotic culprit in several non-UK series [U]. It matters for Singapore, where
    cefazolin prophylaxis is common;
  - sugammadex is also a reported trigger (Stanford lists it) [V].
  - NAP6 found **no clear benefit from giving sugammadex** to treat suspected rocuronium anaphylaxis [V].
- **Debrief windows:**
  - first IV adrenaline within 2–3 min of unexplained hypotension or bronchospasm (NAP6 found treatment was
    prompt in 83%; 11% got no adrenaline);
  - boluses every 1–2 min, titrated;
  - infusion running by about 10 min;
  - compressions as soon as SBP < 50 mmHg.

**(d) Wrong actions.**
- Treating it as "post-induction hypotension" with repeated phenylephrine or ephedrine.
- Late or no adrenaline.
- A 1 mg IV bolus when there is still an output: hypertension, arrhythmia.
- Not starting compressions with SBP < 50 mmHg or unrecordable BP. NAP6 and NAP7 both showed this reluctance; the
  one NAP7 death had delayed compressions.
- Too little fluid (19% in NAP6).
- Giving antihistamine or steroid first.
- Leaving the culprit running (antibiotic or colloid infusion, chlorhexidine-coated line).
- Forgetting glucagon in a beta-blocked patient.
- No tryptase sample; no allergy label.

**(e) Teaching points.**
1. Unexplained hypotension or bronchospasm under anaesthesia is anaphylaxis until proven otherwise.
   Skin signs are often absent.
2. Adrenaline IV in small, titrated, repeated boluses; start an infusion early.
3. Start CPR at SBP < 50 mmHg.
4. Large fluid volumes are needed.
5. Three timed tryptase samples, then refer for allergy testing.

**Singapore default:** the ANZAAG graded ladder (it matches ISPAR; regional) with QRH wording for the steps.
Set the culprit list to include cefazolin.

---

## 4. Can't intubate, can't oxygenate (CICO)

**(a) Guidelines.**
- **DAS 2025:** Ahmad I, El-Boghdadly K, Iliff H, et al. "Difficult Airway Society 2025 guidelines for management
  of unanticipated difficult tracheal intubation in adults." *BJA* 2026;136:283–307, doi 10.1016/j.bja.2025.10.006.
  65 recommendations. Keeps the linear Plan A–D structure. Priorities: continuous O2 delivery ("peroxygenation"),
  first-attempt success, waveform capnography.
  https://das.uk.com/guidelines/das_intubation_guidelines (algorithms: https://das.uk.com/algorithms). [V abstract]
- **DAS 2015:** Frerk C et al. *BJA* 2015;115:827–848, doi 10.1093/bja/aev371 (PMC4650961). [V citation]
- AoA **QRH 3-3 CICO** (v1). [V]
- **Vortex Approach:** Chrimes N. *BJA* 2016;117 Suppl 1:i20–i27, doi 10.1093/bja/aew175; https://www.vortexapproach.org
  (CC BY-NC-ND 4.0). [V]
- **ANZCA PG61(A) 2017**, "Guideline for the management of evolving airway obstruction: transition to the CICO
  airway emergency." [V]
- **NAP4:** Cook TM, Woodall N, Frerk C. *BJA* 2011;106:617–631, doi 10.1093/bja/aer058. [V]
- Stanford manual "Difficult Airway/Cric" #8. [V]

**(b) Physiology (model).**
- **Desaturation curve** (Benumof JL et al. *Anesthesiology* 1997;87:979–982; modelled after pre-oxygenation to
  FAO2 ≈ 0.87). Approximate time to SpO2 80% [U, values from the paper's figure as I recall them]:

  | Patient | Approx. time to SpO2 80% |
  |---|---|
  | Healthy 70 kg adult | 8–9 min |
  | Moderately ill adult | 5–6 min |
  | Obese (about 127 kg) | 3 min |
  | 10 kg child | 3.5–4 min |

- **Shape:** a plateau, then a "cliff" once SpO2 is below about 90% (steep part of the oxygen dissociation curve).
- **Extending safe apnoea:** nasal O2 or high-flow nasal oxygen (HFNO) during attempts (DAS 2025 emphasis).
- **Monitor order:**
  1. no EtCO2 trace: the first and definitive sign that ventilation has failed;
  2. SpO2 falls after a pulse-oximeter lag of about 20–60 s (longer at the finger with poor perfusion) [U];
  3. tachycardia and hypertension (sympathetic response to hypoxia);
  4. **hypoxic bradycardia**, then hypotension, then PEA or asystole.
- **DAS 2025 simulation scenarios** model the progression as follows [V]:
  - SpO2 94% → 88% → 70% → 60% over the failed Plans A–C, with HR climbing to about 120;
  - then a fall to about 50 (hypoxic bradycardia) and BP down to 70/30;
  - after successful eFONA: square-wave EtCO2 (about 7 kPa ≈ 52 mmHg), SpO2 back to about 95–96% and HR about
    80–100.

**(c) Key actions.**

| Plan | DAS 2025 (from the DAS AirSim scenarios and summaries [V/S]) | Notes |
|---|---|---|
| A: tracheal intubation | Videolaryngoscope first-line; optimise position and full neuromuscular block; continuous O2 (nasal/HFNO); confirm each attempt with waveform capnography; **maximum 3 + 1 attempts** (the 4th by a more experienced operator); failure can be declared at any attempt; **declare "failed intubation"**; **prime for eFONA** (open the kit, say aloud which technique) | DAS 2015 also allowed 3 + 1 |
| B: SAD | 2nd-generation SAD, **up to 3 attempts**; declare "failed SAD ventilation" | If the SAD works: stop and think (wake, continue, flexible-scope intubation through the SAD, FONA) |
| C: facemask | Optimised two-person facemask ventilation with adjuncts and full NMB; if it fails, declare **"cannot intubate, cannot oxygenate"** | If it works: wake the patient (DAS 2015: sugammadex 16 mg/kg if rocuronium was used [U for 2025]) |
| D: eFONA | **Scalpel–bougie–tube** through the cricothyroid membrane: size 10 blade, coudé-tip bougie, **cuffed 6.0 mm tube** [V]. QRH 3-3: transverse stab, rotate the blade 90° (sharp edge caudal), bougie, railroad the tube. If the membrane can't be felt: **8–10 cm vertical midline incision**, blunt dissection, then the same steps [V] | QRH: **give NMB now**, extend the neck, laryngeal handshake, keep O2 going to the upper airway |

- **Vortex:**
  - three upper-airway "lifelines": facemask, SAD, ETT;
  - a "best effort" at each, in any order;
  - success at any lifeline moves the team to the Green Zone (re-oxygenate, plan);
  - all three failing means CICO, so start Neck Rescue, primed early [V];
  - the "CICO Ready/Set/Go" staging and a limit of 3 attempts per lifeline are **[U]**.
- **ANZCA PG61(A)** [V]:
  - one pathway has substantially failed: call for skilled help, consider waking;
  - two pathways have failed: mobilise infraglottic rescue and brief the team;
  - LITFL summarises the limits as ETT × 3, SGA × 2, facemask × 1 [S].
- **Debrief windows:**
  - call for help by the first failed attempt;
  - SAD in within about 60 s of "failed intubation";
  - CICO declared as soon as Plans B and C have failed with SpO2 falling: don't wait for SpO2 < 80% or bradycardia;
  - skin incision within about 30–60 s of the declaration;
  - EtCO2 confirmed through the FONA tube within about 60–90 s of incision.

**(d) Wrong actions.**
- "One more go" (plan continuation bias) beyond 3 + 1 attempts.
- Skipping the SAD.
- A poorly optimised facemask attempt.
- Waiting for bradycardia before declaring CICO.
- Waking on suxamethonium in the expectation of rescue: desaturation comes before recovery (Benumof 1997).
- Letting NMB wear off before FONA.
- Cannula cricothyroidotomy with a high-pressure source and no exit route (barotrauma). In NAP4, cannula techniques
  often failed and surgical airways were more reliable [U for the exact failure rate].
- An incision through the thyroid cartilage.
- No capnography confirmation after FONA.
- Fixation on SpO2 while EtCO2 shows no trace.

**(e) Teaching points.**
1. A flat capnogram means no ventilation: "No trace = wrong place."
2. Limit attempts, and declare failure out loud at each step.
3. Prime for eFONA early; after failed Plan A it is a parallel task, not a last resort.
4. Use one technique, practised often (scalpel–bougie–tube).
5. Human factors: clear leadership, a shared mental model, speaking up (CUSS or PACE; from the DAS debrief guide).
   NAP4: poor planning and slow recognition dominate.

**Singapore default:** DAS 2025 as the algorithm. Mention the Vortex and ANZCA as alternative cognitive aids.

---

## 5. Massive haemorrhage

**(a) Guidelines.**
- **AoA "The use of blood components and their alternatives" 2024:** Shah A, Klein AA, et al. *Anaesthesia*
  2025;80:425–447, doi 10.1111/anae.16542, **CC BY 4.0**. 12 key recommendations. It **replaces** Klein AA et al.
  2016 (*Anaesthesia* 2016;71:829–842). [V]
- AoA **QRH 3-2 Massive blood loss** (v2). Its targets are older (Hb > 80 g/L, platelets > 75, fibrinogen > 1.0 g/L).
  [V]
- **European trauma guideline, 6th ed.:** Rossaint R et al. *Crit Care* 2023;27:80, doi 10.1186/s13054-023-04327-7,
  CC BY. [V citation]
- **ESAIC severe perioperative bleeding, 2nd update:** Kietaibl S et al. *EJA* 2023, doi 10.1097/EJA.0000000000001803.
  [V citation]
- **BSH haematological management of major haemorrhage:** Stanworth SJ et al. *Br J Haematol* 2022, doi
  10.1111/bjh.18275. [V citation]
- **CRASH-2** (*Lancet* 2010) and its timing analysis (*Lancet* 2011;377:1096–1101, doi 10.1016/S0140-6736(11)60278-X).
  [V]
- Stanford manual "Hemorrhage" #12. [V]

**Definitions.**
- Classic definitions: loss of 1 blood volume in 24 h, 50% in 3 h, or more than 150 mL/min [U].
- AoA 2024 prefers a pragmatic clinical definition: bleeding with **SBP < 90 mmHg and/or HR > 110**, judged
  together with the response to resuscitation. These signs are masked at extremes of age and in pregnancy.
  Obstetric escalation starts at more than 500 mL after vaginal birth or more than 1000 mL at caesarean. [V]

**(b) Physiological signature (model).**
- **Early (compensated):**
  - HR rises; narrower pulse pressure; PPV/SVV rise; smaller pleth;
  - EtCO2 falls with cardiac output at fixed ventilation.
- **Under GA:** compensation is blunted (anaesthetic agents, beta-blockers), so hypotension comes earlier [U].
- **ATLS classes (approximate):**

  | Class | Blood loss | Typical findings |
  |---|---|---|
  | I | < 15% (< 750 mL) | Minimal |
  | II | 15–30% | HR 100–120 |
  | III | 30–40% (1.5–2 L) | Hypotension |
  | IV | > 40% | Life-threatening |

  [U, ATLS; not open]
- **Hb lags** until dilution. Lactate and base deficit rise. Fibrinogen is the first factor to fall to critical
  levels.
- **Rapid citrate load** lowers ionised calcium, which lowers contractility and impairs coagulation.
- **Stored RBCs** can raise potassium.
- **The lethal triad:** hypothermia, acidosis and coagulopathy. Hypocalcaemia is often added as a fourth
  ("diamond").

**(c) Key actions.**
- Call for help early; activate the **major haemorrhage protocol (MHP)**; one person liaises with the blood bank
  (QRH). [V]
- Surgical control: pressure, packing, damage-control or proximal control, interventional radiology (AoA 2024). [V]
- Access and equipment: large-bore IV (or IO or central), rapid infuser with warmer, group O red cells kept in
  clinical areas, group-specific blood as soon as possible (AoA 2024). [V]
- **Tranexamic acid** [V]:
  - trauma: **1 g IV over 10 min within 3 h of injury, then 1 g over 8 h** (or a single 2 g bolus, AoA 2024);
    avoid after 3 h unless point-of-care testing shows hyperfibrinolysis;
  - postpartum haemorrhage: 1 g within 3 h, repeated if bleeding continues after 30 min;
  - non-cardiac surgery: 1 g before incision and 1 g at the end;
  - CRASH-2: bleeding deaths fell with TXA given within 1 h (RR 0.68) and at 1–3 h (RR 0.79), but **rose after 3 h
    (RR 1.44).**
- **Ratio:** RBC:FFP about **1:1 in trauma**, 1:1–1:1.5 in other major haemorrhage (AoA 2024). In obstetrics with
  unknown coagulation, give 4 units of RBC before FFP. Stanford: 1–2 RBC : 1 FFP : 1 platelet pack. [V]
- **Test-guided targets (AoA 2024)** [V]:
  - FFP if INR > 1.5;
  - **cryoprecipitate if fibrinogen < 1.5 g/L** (< 2.0 in obstetrics); in trauma consider 2 pools;
  - **platelets if < 50 × 10⁹/L** (< 75 in obstetrics; keep > 100 in multiple trauma, traumatic brain injury or
    intracerebral haemorrhage);
  - Hb 70–90 g/L during major haemorrhage;
  - ionised **calcium > 1.0 mmol/L**;
  - viscoelastic tests may cut transfusion but have no proven outcome benefit; never delay TXA for them.
- **Calcium dose (QRH):** 10 mL of 10% calcium chloride, or 20 mL of 10% calcium gluconate. [V]
- **Warming:** active warming, warmed fluids, aim for temperature > 36 °C [U target].
- **Cell salvage:** if blood loss > 500 mL is possible (AoA 2024 rec. 4); use a leucocyte filter in obstetrics. [V]
- **Limit crystalloid:** AoA 2024 rec. 10 says avoid it in trauma unless there is profound hypotension and no
  blood is imminent. [V]
- **Permissive hypotension in trauma** until bleeding is controlled: SBP 80–90 mmHg or MAP 50–60 mmHg. **Not** with
  traumatic brain injury or spinal cord injury (keep MAP ≥ 80 mmHg). Use caution in the elderly or chronically
  hypertensive. It rarely applies to controlled surgical bleeding. (Rossaint 2023) [U for exact numbers]
- **Debrief windows:**
  - MHP activated within about 5 min of recognition;
  - TXA within 10 min of activation (and within 3 h of injury);
  - first blood within about 10–15 min;
  - ABG with iCa, K, Hb and lactate every 30 min, or every 4 units.

**(d) Wrong actions.**
- Crystalloid-only resuscitation; RBC-only transfusion (dilutional coagulopathy).
- Late MHP; late TXA.
- No calcium.
- Cold blood without a warmer.
- Vasopressors to "fix the number" while the patient is empty.
- Permissive hypotension with a head injury.
- Not talking to the surgeon.
- Missing hyperkalaemia or ionised hypocalcaemia arrhythmias.
- Using the old QRH targets without knowing the 2024 update.

**(e) Teaching points.**
1. Recognise early (trends in HR, PPV and EtCO2), declare it, and activate the MHP.
2. Haemostatic resuscitation: blood and plasma early, fibrinogen, platelets, TXA early, calcium.
3. Prevent the lethal triad: keep warm, correct acidosis, give calcium.
4. Surgical control is the definitive treatment.
5. Communication: one liaison person with the blood bank, closed-loop calls.

**Singapore default:** AoA 2024 targets (CC BY, most current) with a 1:1 trauma ratio. Map the products to the local
NUH MHP pack contents, which I did not verify.

---

## 6. Hypoxaemia: bronchospasm under GA (plus brief one-lung ventilation hypoxaemia)

**(a) Guidelines and sources.**
- AoA **QRH 3-4 Bronchospasm** (v3), **2-2 Hypoxia** and **2-3 Increased airway pressure**. CC BY-NC-SA. [V]
- Stanford manual: "Bronchospasm" #6, "Hypoxemia" #17, "High airway pressure" #13. [V]
- Woods BD, Sladen RN. *BJA* 2009;103 Suppl 1:i57–65, doi 10.1093/bja/aep271. [V citation]
- **One-lung ventilation (OLV):**
  - Shum S, Huang A, Slinger P. "Hypoxaemia during one lung ventilation." *BJA Educ* 2023, doi
    10.1016/j.bjae.2023.05.006 (PMC10435364);
  - Karzai W, Schwarzkopf K. *Anesthesiology* 2009, doi 10.1097/aln.0b013e31819fb15d. [V citations]

**Systematic approach.**
- **DOPES** (from paediatric and ICU teaching): Displacement, Obstruction, Pneumothorax, Equipment,
  Stacked breaths (auto-PEEP) and Stomach.
- The QRH sequence is equivalent: oxygen delivery, airway, breathing, circulation, depth.
- **Isolate the equipment:** a self-inflating bag connected directly to the tube connector. If the problem goes
  away, it lies in the machine, circuit or filter. [V]

**(b) Physiological signature (model).**
- **Typical setting:** an asthmatic or smoker, intubated in a light plane; onset within 1–2 min.
- **Ventilator:**
  - in VCV, Ppeak rises more than Pplat (a resistance problem);
  - in PCV, expired Vt falls;
  - expiratory flow doesn't return to zero (intrinsic PEEP).
- **Capnogram:**
  - upsloping "shark fin";
  - the gap between EtCO2 and PaCO2 widens;
  - EtCO2 may fall toward a flat trace in severe spasm; NAP7 reported a flat capnograph in one case [V], which
    mimics oesophageal intubation.
- **Wheeze**, or a silent chest when severe.
- SpO2 falls after minutes.
- **Dynamic hyperinflation** lowers venous return and BP. **Disconnecting the circuit briefly restores BP**: a
  diagnostic and therapeutic step (Stanford). [V]

**(c) Key actions (adult 70 kg; sources differ, so all are listed).**

| Drug | QRH 3-4 [V] | Stanford [V] | ANZAAG refractory card [V] |
|---|---|---|---|
| Salbutamol inhaled | Nebuliser 5 mg (remove HME, or nebulise downstream) | MDI 4–8 puffs, or 2.5 mg nebulised | MDI 12 puffs (1200 µg) |
| Salbutamol IV | 250 µg slowly, then 5–20 µg/min | — | 100–200 µg bolus ± 5–25 µg/min |
| Adrenaline | IV 10–100 µg slowly; nebulised 5 mL of 1:1000; IM 500 µg | Severe: 5–10 µg IV every 3–5 min, escalating (or 200 µg SC) | Continue the infusion |
| Magnesium | 2 g IV over 20 min | 1–2 g IV | 2 g over 20 min |
| Ketamine | 20 mg bolus; infusion 1–3 mg/kg/h | 10–50 mg IV | "consider" |
| Aminophylline | 5 mg/kg over 20 min (not if already on theophylline), then 0.5 mg/kg/h | — | — |
| Hydrocortisone | 200 mg | 100 mg | — |
| Ipratropium | Nebulised 0.5 mg | With salbutamol | — |
| Deepen | Volatile (avoid rapidly increasing isoflurane or desflurane) | Propofol bolus; raise sevoflurane | Volatile |

- **Ventilation:**
  - low RR; I:E 1:3–1:4; Vt about 6 mL/kg; PEEP 0–5 cmH2O;
  - permissive hypercapnia;
  - PCV may be better (QRH);
  - watch for breath stacking; disconnect if hypotensive.
- **Exclude:** tube problems (kink, bronchial or oesophageal placement, mucus plug: pass a suction catheter),
  pneumothorax, anaphylaxis (→ Scenario 3), aspiration, pulmonary oedema. Consider ECMO if refractory. Get a CXR
  once safe.
- **Debrief windows:**
  - systematic check including hand ventilation within about 60 s;
  - first bronchodilator within 2–3 min;
  - adrenaline once SpO2 < 90% or BP falls.

**OLV hypoxaemia (brief; paraphrased from Shum 2023 and Karzai 2009) [U for exact ordering].**
- Definition: SpO2 < 90% on OLV.
- Steps:
  1. FiO2 1.0.
  2. **Check the double-lumen tube or bronchial blocker position with a fibreoptic scope** (malposition is the
     commonest fixable cause). Suction.
  3. Recruit the ventilated lung and optimise PEEP.
  4. CPAP (about 2–5 cmH2O) or O2 insufflation to the operative lung, agreed with the surgeon.
  5. Keep volatile ≤ 1 MAC (preserves hypoxic pulmonary vasoconstriction), or switch to TIVA.
  6. Optimise cardiac output and Hb.
  7. If severe or rapid: intermittent two-lung ventilation; surgical clamping of the pulmonary artery.

**(d) Wrong actions.**
- Raising RR or Vt to "fix" the CO2: more air trapping, then hypotension or arrest.
- More NMB for "fighting the ventilator".
- Nebulising upstream of the HME filter.
- A rapid rise in desflurane or isoflurane.
- Missing a kinked or bronchial tube.
- Treating air-trapping hypotension with fluid instead of disconnecting.
- Ignoring anaphylaxis.

**(e) Teaching points.**
1. Exclude mechanical causes before calling it bronchospasm: isolate the equipment, pass a suction catheter.
2. Deepen anaesthesia: volatiles are bronchodilators.
3. Ventilate for exhalation (long expiratory time) and accept high CO2.
4. Escalate in steps: inhaled β2-agonist, then IV adrenaline, magnesium or ketamine, then ECMO.
5. A silent chest or a flat capnogram is a sign of severity.

---

## 7. Malignant hyperthermia (MH)

**(a) Guidelines.**
- **AoA "Malignant hyperthermia 2020":** Hopkins PM, Girard T, Dalay S, et al. *Anaesthesia* 2021;76:655–664,
  doi 10.1111/anae.15317. [V]
- **QRH 3-8 MH crisis v2** (2021; CC BY-NC-SA). [V]
- **EMHG dantrolene availability:** Glahn KPE et al. *BJA* 2020;125:133–140, doi 10.1016/j.bja.2020.04.089. Dose by
  actual body weight; dantrolene wherever volatiles or suxamethonium are used; **36 vials (20 mg) immediately
  plus 24 more within 1 h.** [V]
- **EMHG perioperative management of MH-susceptible patients:** Rüffert H et al. *BJA* 2021, doi
  10.1016/j.bja.2020.09.029. [V citation]
- **MHAUS "Managing a crisis":** https://www.mhaus.org/healthcare-professionals/managing-a-crisis/ [V]
- Stanford manual "Malignant Hyperthermia" #19. [V]
- **Larach clinical grading scale:** Larach MG et al. *Anesthesiology* 1994;80:771–779. [V citation]
- **North American MH Registry:** Larach MG et al. *Anesth Analg* 2010;110:498–507, doi 10.1213/ANE.0b013e3181c6b9b2.
  [V]

**(b) Physiological signature (model).**
- **Triggers:** volatile agents and/or suxamethonium. Onset ranges from minutes (with suxamethonium) to more than
  an hour into the case.
- **Earliest signs** (QRH; Larach 2010): **unexplained rise in EtCO2 despite more ventilation**, **sinus
  tachycardia**, **masseter spasm** after suxamethonium, and higher O2 consumption.
- **Also:**
  - soda lime exhausted fast and hot;
  - tachypnoea if breathing spontaneously;
  - generalised rigidity;
  - mixed acidosis: respiratory acidosis is the rule; metabolic acidosis in only 26% (Larach 2010).
- **Temperature** is called a "late sign" in the QRH, **but** Larach 2010 found a temperature abnormality among the
  first three signs in 63.5% (median maximum 39.1 °C). Model the temperature rise as early-to-mid [V].
- **Late:**
  - hyperkalaemia, causing peaked T waves, VT/VF and arrest;
  - CK peaks at 12–24 h (QRH);
  - myoglobinuria, DIC, compartment syndrome;
  - recrudescence in about 20% within 16 h (Stanford).
- **Outcome data (Larach 2010):**
  - complications rose **1.6-fold per 30 min delay to dantrolene** and **2.9-fold per 2 °C rise** in peak
    temperature;
  - the median total dantrolene dose was 5.9 mg/kg. [V]

**(c) Key actions (adult 70 kg).**
1. Call for help; abandon or finish surgery; get the MH kit and the arrest trolley.
2. **Remove the trigger:** vaporiser off and removed; fresh gas flow of 100% O2 at maximum (MHAUS: ≥ 10 L/min);
   **hyperventilate at 2–3 times minute ventilation**; activated charcoal filters on both limbs (MHAUS: replace
   hourly). Changing the circuit or machine is **not** a priority (QRH; Stanford says don't change the machine).
   [V]
3. Maintain anaesthesia with TIVA and a non-depolarising NMB.
4. **Dantrolene, delegated to several people** (the sources differ):

   | Source | Initial dose | Repeat | Upper limit |
   |---|---|---|---|
   | AoA QRH 3-8 [V] | **2–3 mg/kg** (adult about 200 mg) | **1 mg/kg every 5 min** until EtCO2 < 6 kPa (≈ 45 mmHg) and temperature < 38.5 °C | Continue even if the total passes 10 mg/kg |
   | MHAUS [V] | **2.5 mg/kg** rapidly | Repeat until EtCO2, rigidity and HR improve | Above 10 mg/kg may be needed; if not responding, reconsider the diagnosis |
   | Stanford [V] | 2.5 mg/kg | 2.5 mg/kg every 5 min | May need > 10 mg/kg |
   | Agilus SmPC (UK/EU) [V] | 2.5 mg/kg | Every 10 min | Re-examine the diagnosis at ≥ 10 mg/kg |

   **Formulations** [V]:
   - **Dantrium/Revonto:** 20 mg vial + **60 mL sterile water** (no bacteriostatic agent). 70 kg × 2.5 mg/kg =
     175 mg ≈ **9 vials**.
   - **Ryanodex:** 250 mg + **5 mL** sterile water (175 mg = 3.5 mL).
   - **Agilus:** 120 mg + **20 mL** water for injection, giving 5.3 mg/mL in a final volume of 22.6 mL.

5. **Cooling:**
   - QRH: turn off warming; ice to groins and axillae; cold IV fluids; consider cold peritoneal lavage; other
     devices as available; target < 38.5 °C;
   - MHAUS: cool if > 39 °C or rising fast; **stop at ≤ 38 °C**;
   - Stanford: cold saline 20–30 mL/kg; avoid bladder lavage (it spoils urine-output measurement). [V]
6. **Hyperkalaemia:**

   | Treatment | QRH | MHAUS | Stanford |
   |---|---|---|---|
   | Calcium | 0.1 mmol/kg in extremis | Calcium chloride 10 mg/kg (max 2 g) or gluconate 10–50 mg/kg (max 3 g) | — |
   | Insulin + glucose | 10 units + 50 mL of 50% glucose | 10 units + 50 mL of 50% dextrose | — |
   | Sodium bicarbonate | 50 mmol | 1–2 mEq/kg | — |
   | Salbutamol | — | Albuterol or another β-agonist | 8–12 puffs |

   [V]
7. **Acidosis:** bicarbonate 50 mmol if pH < 7.2 despite hyperventilation (QRH), or 1–2 mEq/kg if base excess is
   below −8 (MHAUS). [V]
8. **Arrhythmias:** amiodarone or β-blockers. **Avoid calcium channel blockers**, which interact with dantrolene.
   Stanford also says avoid sodium-channel blockers such as lidocaine and procainamide. [V]
9. **Urine output:** > 1 mL/kg/h (MHAUS), or > 2 mL/kg/h with urine pH > 7 (QRH). [V]
10. **Monitoring and follow-up:**
    - invasive BP, core temperature; ABG, K, CK, myoglobin, coagulation;
    - ICU for ≥ 24 h; continue dantrolene 1 mg/kg every 4–6 h or 0.25 mg/kg/h for ≥ 24 h (Stanford, MHAUS);
    - counsel the patient and refer for muscle-biopsy or genetic testing. [V]

- **Larach CGS (1994)** [U: the point values are from memory of the paper's table; verify before coding]:
  - **Rule:** within each "process" count only the highest-scoring sign, then add the "other indicators".
  - **Process scores:**

    | Process | Sign | Points |
    |---|---|---|
    | Rigidity | Generalised rigidity | 15 |
    | Rigidity | Masseter spasm after suxamethonium | 15 |
    | Muscle breakdown | CK > 20,000 IU/L after suxamethonium, or > 10,000 without | 15 |
    | Muscle breakdown | Cola-coloured urine | 10 |
    | Muscle breakdown | Urine myoglobin > 60 µg/L or serum myoglobin > 170 µg/L | 5 |
    | Muscle breakdown | K > 6 mmol/L | 3 |
    | Respiratory acidosis | EtCO2 > 55 mmHg (controlled ventilation) or PaCO2 > 60 mmHg; spontaneous ventilation: EtCO2 > 60 or PaCO2 > 65; or inappropriate hypercarbia | 15 |
    | Respiratory acidosis | Inappropriate tachypnoea | 10 |
    | Temperature | Inappropriately rapid rise | 15 |
    | Temperature | > 38.8 °C | 10 |
    | Cardiac | Inappropriate sinus tachycardia, or VT/VF | 3 |

  - **Other indicators:** base excess below −8 (10); pH < 7.25 (10); rapid reversal with dantrolene (5); family
    history with another indicator (10); resting high CK with family history (10).
  - **Ranks:**

    | Total score | Rank | Likelihood of MH |
    |---|---|---|
    | 0 | 1 | Almost never |
    | 3–9 | 2 | Unlikely |
    | 10–19 | 3 | Somewhat less than likely |
    | 20–34 | 4 | Somewhat greater than likely |
    | 35–49 | 5 | Very likely |
    | ≥ 50 | 6 | Almost certain |

- **Debrief windows:**
  - suspect MH within about 5–10 min of a rising EtCO2 that ignores more ventilation;
  - triggers off and hyperventilation within 1–2 min of suspicion;
  - **first dantrolene dose within about 10–15 min** (Larach 2010 gives the cost of delay);
  - 2–3 people assigned to mixing Dantrium.

**(d) Wrong actions.**
- Calling it "light anaesthesia" and **turning the volatile up**.
- Changing the machine before giving dantrolene.
- Under-dosing (a single 1 mg/kg dose).
- Reconstituting in saline or bacteriostatic water.
- No hyperventilation.
- Verapamil or diltiazem for tachyarrhythmia.
- More suxamethonium for rigidity.
- Missing hyperkalaemia.
- Stopping monitoring early (recrudescence).
- Paracetamol or surface cooling alone.

**(e) Teaching points.**
1. A rising EtCO2 plus tachycardia without another explanation is MH until proven otherwise. Temperature can be
   early or late.
2. Dantrolene is the only specific treatment. Know your formulation, and assign mixers at once.
3. Remove triggers and hyperventilate; don't waste time changing the machine.
4. Treat hyperkalaemia and arrhythmias; avoid calcium channel blockers.
5. Afterwards: ICU, watch for recrudescence, refer the patient and family for testing.

**Singapore default:** 2.5 mg/kg initially (where MHAUS, Stanford and the SmPC agree; the QRH range is 2–3 mg/kg),
then 1 mg/kg every 5 min to the QRH endpoints (EtCO2 < 45 mmHg, temperature < 38.5 °C). Use the **Dantrium
20 mg / 60 mL** presentation unless the NUH pharmacy confirms another; the local product and the MH hotline are
unverified.

---

## 8. Local anaesthetic systemic toxicity (LAST)

**(a) Guidelines.**
- **ASRA LAST checklist, 2020 version:** Neal JM, Neal EJ, Weinberg GL. *Reg Anesth Pain Med* 2021;46:81–82, doi
  10.1136/rapm-2020-101986. [V citation]
- **ASRA third practice advisory:** Neal JM et al. *RAPM* 2018;43:113–123, doi 10.1097/AAP.0000000000000720 (notes
  more delayed presentations, and small or sarcopenic patients at higher risk). [V]
- **AoA "Management of severe local anaesthetic toxicity" 2023** (QRH 3-10 v2, June 2023; CC BY-NC-SA). It replaces
  the 2010 version. The changes: lower adrenaline doses, avoid vasopressin, give the lipid bolus more slowly. [V]
- Stanford manual "LAST" #18 (ASRA dosing). [V]
- Di Gregorio G et al. *RAPM* 2010;35:181–187: 60% classic presentation; the rest delayed, or cardiovascular signs
  only. [V]

**(b) Physiological signature (model).**
- **Classic (about 60%):**
  - **CNS prodrome:** perioral numbness, metallic taste, tinnitus, agitation or confusion;
  - then seizures (with fast respiratory and metabolic acidosis);
  - then **cardiovascular effects**: early hypertension and tachycardia (especially with an adrenaline-containing
    solution), then **bradycardia, wide QRS, AV block, ventricular ectopy, VT/VF, hypotension, asystole**.
- **Atypical (about 40%):** onset delayed by more than about 5 min (absorption, infusions, infiltration), or
  cardiovascular signs with no CNS phase.
- **Under GA or sedation:** CNS signs are masked, so ECG changes and hypotension may come first.
- **Timing:** intravascular injection acts within seconds to 1 min; absorption peaks about 15–30 min after a block,
  later with continuous infusions [U].
- **Bupivacaine:** cardiac toxicity is prominent, arrhythmias are refractory, and recovery may take more than 1 h
  (QRH).
- Hypoxia, hypercapnia and acidosis make toxicity worse.

**(c) Key actions (adult 70 kg).**
- Stop the injection or infusion (check pumps). Call for help and the lipid kit. 100% O2. Secure the airway if
  needed; **avoid hypercapnia** (mild hyperventilation). IV access. [V]
- **Seizures:**
  - small incremental benzodiazepine (QRH), e.g. midazolam 2–4 mg (Stanford);
  - propofol or thiopental only in small doses and with care (negative inotropes); Stanford suggests propofol 20 mg
    increments if BP is stable;
  - NMB if seizures can't be controlled. [V]
- **Lipid emulsion 20%** (Intralipid; **propofol is not a substitute**):

  | | ASRA 2020 (via Stanford) [V] | AoA QRH 3-10 (2023) [V] |
  |---|---|---|
  | Bolus | > 70 kg: **100 mL over 2–3 min**; < 70 kg: 1.5 mL/kg (lean body weight) | **1.5 mL/kg over 2–3 min** (about 100 mL for 70 kg) |
  | Infusion | > 70 kg: 200–250 mL over 15–20 min; < 70 kg: **0.25 mL/kg/min** | **15 mL/kg/h** (17.5 mL/min for 70 kg) |
  | If still unstable | Repeat the bolus once or twice; double the infusion (0.5 mL/kg/min) | Repeat the bolus at 5 and 10 min; double to 30 mL/kg/h after 5 min |
  | Continue | ≥ 15 min after stability | — |
  | Maximum | About **12 mL/kg** | **12 mL/kg** cumulative (840 mL for 70 kg) |

- **Cardiac arrest:**
  - CPR, plus lipid;
  - **adrenaline ≤ 1 µg/kg** (≤ 70 µg) instead of 1 mg (QRH; Stanford starts at 0.2–1 µg/kg);
  - **avoid vasopressin, calcium channel blockers, β-blockers and local anaesthetics (lidocaine)**; amiodarone for
    arrhythmias;
  - **prolonged CPR** (recovery may take > 1 h);
  - call early for ECMO or cardiopulmonary bypass. [V]
- **Afterwards:**
  - monitor ≥ 2 h after seizures only, about 4–6 h after a cardiovascular event (ASRA [U]); Stanford gives 6 h, and
    24–48 h after an arrest [V];
  - check daily for pancreatitis (amylase or lipase) after lipid (QRH); report the event. [V]
- **Debrief windows:**
  - injection stopped and help called within 30 s;
  - **lipid bolus within about 2–3 min** of recognising serious toxicity (don't wait for arrest);
  - reassess at 5 min, then repeat bolus or double the infusion.

**(d) Wrong actions.**
- Standard ALS adrenaline 1 mg (worsens arrhythmia and lipid response).
- Vasopressin.
- Lidocaine for VT.
- β-blocker or calcium channel blocker.
- Propofol as a "lipid".
- A large propofol bolus for seizures in an unstable patient.
- Stopping CPR early.
- Forgetting to stop the infusion pump.
- Lipid only after arrest.
- Exceeding 12 mL/kg.
- Dosing lipid by total body weight in obese patients.

**(e) Teaching points.**
1. Suspect LAST with any CNS or cardiovascular change after local anaesthetic, including delayed changes and
   changes under GA.
2. Airway and oxygenation first; acidosis and hypoxia worsen toxicity.
3. Give lipid early, with the dose by weight.
4. ALS changes for LAST: low-dose adrenaline, no vasopressin, no lidocaine, prolonged CPR, ECMO.
5. Prevention: dose limits, aspiration, incremental injection, ultrasound, adrenaline marker.

**Singapore default:** the AoA QRH regimen (per kg, so it scales for the sim). Show ASRA's ">70 kg: 100 mL" as the
equivalent.

---

## 9. Tension pneumothorax under positive-pressure ventilation

**(a) Sources.**
- **ATLS 10th edition** (American College of Surgeons 2018; not open):
  - adult needle decompression moved to the **4th/5th intercostal space, just anterior to the mid-axillary line**;
  - children: 2nd intercostal space, mid-clavicular line. [S]
- Stanford manual "Pneumothorax" #22 cites the ATLS 2018 site; 14–16 G catheter. [V]
- QRH 2-2/2-3 list pneumothorax as a cause. [V]
- **WJES 2025 meta-analysis**, doi 10.1186/s13017-025-00613-7: ATLS and the European Trauma Course (ETC) still
  differ on site and needle length; the left 5th-ICS approach carries more cardiac-injury risk. [S]
- ERC 2021/2025 special circumstances (traumatic arrest: thoracostomy). [U for detail]
- **ATLS 11th edition** content is **not verified**.

**(b) Physiological signature (model).**
- **Contexts:** central venous cannulation, trauma, COPD or bullae, barotrauma, thoracic or upper abdominal
  surgery, laparoscopy (capnothorax), after a supraclavicular or interscalene block.
- **Progression:** minutes, faster under positive-pressure ventilation.
- **Ventilator:**
  - VCV: Ppeak **and** Pplat both rise (compliance falls);
  - PCV: **expired Vt falls**.
- **Gas exchange:** SpO2 falls (shunt). EtCO2 falls as cardiac output falls.
- **Circulation:** HR up, BP down (obstructive shock), CVP up, neck veins distended (may be absent if hypovolaemic),
  bigger PPV.
- **Chest:** unilateral loss of breath sounds and chest movement, hyper-resonance; subcutaneous emphysema;
  **tracheal deviation is late**.
- **Ultrasound:** no lung sliding, barcode sign, lung point.
- **Endpoint:** PEA arrest.

**(c) Key actions.**
1. 100% O2. Call for help and the surgeon. Hand-ventilate to feel the pressure.
2. **Quick exclusions (Stanford)** [V]:
   - endobronchial tube (breath sounds, tube depth);
   - tube obstruction (suction catheter);
   - **auto-PEEP** (disconnect briefly).
3. **If unstable, decompress without waiting for a CXR:**
   - needle 14–16 G at the 4th/5th ICS just anterior to the mid-axillary line (ATLS 10 and Stanford);
   - the older UK and ETC site, 2nd ICS mid-clavicular line, is still taught and is the children's site;
   - in **ventilated adults, finger (simple) thoracostomy** in the 4th/5th ICS "safe triangle" is more reliable
     than a needle (catheters kink, block or are too short) [U];
   - **leave the catheter in place and place a chest drain** (4th/5th ICS, safe triangle).
4. Adjust ventilation (lower Vt and PEEP). Stop nitrous oxide. If it is a laparoscopic capnothorax, desufflate.

- **Debrief windows:**
  - from suspicion to decompression ≤ 1–2 min in an unstable patient;
  - drain within about 10–15 min.

**(d) Wrong actions.**
- Waiting for a CXR.
- Treating it as bronchospasm (salbutamol) or giving pressors only.
- Raising PEEP or Vt.
- Decompressing the wrong side.
- A needle too medial at the 2nd ICS (internal thoracic vessels, heart) or too short (thick chest wall).
- No drain after the needle.
- Not considering endobronchial intubation first.

**(e) Teaching points.**
1. Rising airway pressure plus hypoxaemia plus hypotension under PPV: think tension pneumothorax.
2. It is a clinical diagnosis: treat before imaging if unstable.
3. Know both sites and their trade-offs; in ventilated patients a finger thoracostomy is better than a needle.
4. A needle is a bridge: always follow it with a drain.
5. The quick exclusions (tube, plug, auto-PEEP) take seconds.

**Singapore default:** 4th/5th ICS anterior to the mid-axillary line for adults (ATLS 10, which is what Singapore
ATLS courses teach [U]). 2nd ICS mid-clavicular line for children.

---

## 10. Bradycardia and cardiac arrest

**(a) Guidelines.**
- **ERC 2021 ALS:** Soar J et al. *Resuscitation* 2021;161:115–151, doi 10.1016/j.resuscitation.2021.02.010. [U pages]
- **ERC 2025 ALS:** Soar J et al. *Resuscitation* 2025;215 Suppl 1:110769, doi 10.1016/j.resuscitation.2025.110769.
  States **no major changes** from 2021. [V]
- **RCUK 2025 ALS** (UK adaptation of the ERC guidelines; resus.org.uk). [V]
- **ERC 2025 Special Circumstances:** Lott C et al., doi 10.1016/j.resuscitation.2025.110753. New section on
  perioperative arrest. [S]
- **AHA 2020 Part 3:** Panchal AR et al. *Circulation* 2020;142(16 Suppl 2):S366–S468, doi
  10.1161/CIR.0000000000000916. [U pages]
- **AHA 2025 Part 9:** Wigginton JG et al. *Circulation* 2025;152(16 Suppl 2):S538–S577, doi
  10.1161/CIR.0000000000001376. Course sites say **no major changes to arrest interventions.** [V citation; S content]
- **SRFAC Singapore ACLS Guidelines 2021:** Ching CK et al. *Singapore Med J* 2021;62:390–403, doi
  10.11622/smedj.2021109 (PMC8804484). No 2025 SRFAC update found. [V]
- **NAP7** (RCoA 2023):
  - Armstrong RA et al. *Anaesthesia* 2024;79:18–30 (doi 10.1111/anae.16156) and 79:31–42 (doi 10.1111/anae.16157);
  - Nolan JP et al. *Anaesthesia* 2024;79:914–923 (doi 10.1111/anae.16310). [V]
- QRH 2-1 cardiac arrest and 2-6 bradycardia [V]; Stanford #1, #2, #4 [V].

**(b) Physiological signature.**
- **Perioperative bradycardia** (QRH Box C; Stanford):
  - **vagal:** peritoneal insufflation, oculocardiac reflex, traction, carotid, laryngoscopy in children;
  - **drugs:** remifentanil, a second suxamethonium dose, neostigmine, dexmedetomidine, β-blockers, digoxin, calcium
    channel blockers;
  - **other:** high spinal; hypoxia (late and ominous in children); hyperkalaemia; raised ICP; MI; LAST.
- **Model:**
  - vagal bradycardia is abrupt (seconds) and recovers within about 30–60 s once the stimulus stops [U];
  - BP falls if stroke volume can't compensate; EtCO2 falls with cardiac output.
- **NAP7** [V]:
  - incidence **3 per 10,000** anaesthetics;
  - **82% non-shockable**, usually PEA;
  - commonest causes: **major haemorrhage 17%, bradyarrhythmia 9%, cardiac ischaemia 7%**;
  - **bradycardic arrests had the best survival** (86% survived the event, 60% to discharge); PEA the worst (34% to
    discharge); 52% overall survival to discharge;
  - adult intraoperative arrests: sustained ROSC 78%;
  - in PEA or bradycardic arrests, 65% got a 1 mg adrenaline bolus;
  - NAP7 concludes intraoperative arrest needs modifications to standard ALS.
- **EtCO2 during CPR:**
  - low but present with good compressions;
  - a sudden sustained rise suggests ROSC (don't stop compressions on this alone, RCUK 2025);
  - a sudden fall in EtCO2 under anaesthesia may be the first sign of arrest. [V]

**(c) Key actions.**

Bradycardia with adverse signs (adult):

| | ERC 2021/2025 (RCUK 2025) [V] | AHA 2020/2025 [V for 2020 values, S for 2025] | SRFAC 2021 [V] | AoA QRH 2-6 [V] |
|---|---|---|---|---|
| Atropine | **500 µg** every 3–5 min, max **3 mg** | **1 mg** every 3–5 min, max **3 mg** | **0.6 mg** boluses, max **2.4 mg** | Critical: 20 µg/kg (0.5–1 mg); stable: 300–600 µg |
| Second line | Isoprenaline 5 µg/min; adrenaline 2–10 µg/min | Dopamine 5–20 µg/kg/min; adrenaline 2–10 µg/min | Dopamine 5–20 µg/kg/min; adrenaline 2–10 µg/min | Glycopyrrolate 200–400 µg; ephedrine 3–12 mg; adrenaline 10–100 µg (emergency); isoprenaline 5 µg/min |
| Pacing | Transvenous early if unstable; transcutaneous as a bridge; fist pacing if nothing else | Transcutaneous pacing | Transcutaneous until transvenous is ready | Pads; output from 60 mA up to capture; set 10 mA above capture; check a femoral pulse |
| Special cases | No atropine after heart transplant or in wide-QRS high-degree block; aminophylline 100–200 mg for transplant or spinal cord injury; glucagon for β-blocker or CCB toxicity | Atropine harmful after heart transplant | — | **Stop the stimulus first** |

Cardiac arrest:

| | ERC 2021/2025 [V] | AHA 2020/2025 [U/S] | SRFAC 2021 [V/U] |
|---|---|---|---|
| Adrenaline, non-shockable | 1 mg **as soon as possible**, then every 3–5 min | 1 mg as soon as feasible, then every 3–5 min | 1 mg every 3–5 min; text stresses **early adrenaline** |
| Adrenaline, VF/pVT | **After the 3rd shock** | After initial shocks fail (algorithm: **after the 2nd shock**) [U for 2025] | Not tied to a shock number: one 2-min loop with drugs in a side box (adrenaline 1 mg every 3–5 min, early; amiodarone 300 mg then 150 mg for VF after 3 or more shocks) [V: text and Fig. 1 read in the source check, PMC8804484] |
| Antiarrhythmic | Amiodarone **300 mg after 3 shocks, 150 mg after 5**; or lidocaine 100 mg (+50 mg) | Amiodarone 300 / 150 mg, or lidocaine 1–1.5 then 0.5–0.75 mg/kg | Amiodarone 300 then 150 mg (after ≥ 3 shocks); lidocaine 1–1.5 then 0.5–0.75 mg/kg |
| Defibrillation | Biphasic ≥ 150 J first; up to 3 stacked shocks in monitored settings (cath lab, cardiac surgery) | Manufacturer dose (120–200 J) | Manufacturer dose; 150 J biphasic if unknown; single-shock strategy; double sequential defibrillation not recommended |
| CPR monitoring | Waveform capnography; physiology-guided targets **DBP ≥ 30 mmHg** and **EtCO2 ≥ 25 mmHg (3.3 kPa)**; low EtCO2 alone never decides termination | EtCO2 low or falling: improve CPR; Stanford uses **EtCO2 > 10 mmHg and DBP > 20 mmHg** | Waveform capnography; no numeric target given |

**Perioperative modifications** [V]:
- **Start compressions if SBP < 50 mmHg** and it stays there despite treatment (RCUK/ERC 2025; NAP6/7; QRH 3-1).
- **With an arterial line, start with small adrenaline doses of 50–100 µg** instead of 1 mg; if 1 mg in total
  has no effect, check for extravasation and continue 1 mg every 3–5 min (RCUK 2025 ALS).
- QRH 2-1 checklist:
  - declare arrest and note the time;
  - 100% O2, check the measured FiO2;
  - turn the anaesthetic off;
  - check the airway and capnography;
  - fluid 20 mL/kg (adult 500 mL);
  - adrenaline 10 µg/kg (1 mg, may be given in increments);
  - atropine 0.5–1 mg if vagal;
  - magnesium 2 g for polymorphic VT;
  - calcium chloride 10% 10 mL for hyperkalaemia, hypocalcaemia or magnesium overdose;
  - no pulse check after a shock;
  - minimise intrathoracic pressure (avoid big Vt and hyperventilation; volume control).
- **4 Hs and 4 Ts plus perioperative causes:** vagal tone, drug error, LAST, anaphylaxis, massive haemorrhage, gas,
  fat or cement embolism, tamponade, tension pneumothorax, auto-PEEP, high spinal, MH. [V, QRH Box A]

**Debrief windows:**
- compressions within 10 s of pulselessness, or of SBP < 50 mmHg that persists;
- first shock within 2 min (aim < 1 min for monitored VF in theatre);
- rhythm-check pauses under 5 s;
- adrenaline timing per the chosen algorithm;
- atropine within 1 min of symptomatic vagal bradycardia, **after stopping the stimulus**.

**(d) Wrong actions.**
- Phenylephrine for bradycardic hypotension.
- Not asking the surgeon to stop (desufflate, release traction).
- Waiting for a "pulse check" while SBP is 40 mmHg.
- A 1 mg adrenaline bolus in a peri-arrest patient with an arterial line (severe hypertension, VF).
- A pulse check straight after a shock; long pauses.
- Hyperventilation during CPR.
- Volatile left on.
- No pacing pads.
- Atropine after heart transplant.
- Missing hyperkalaemia (e.g. suxamethonium in a burns patient).

**(e) Teaching points.**
1. In theatre, arrest is usually expected-from-trend and non-shockable: treat the cause (NAP7: bleeding,
   bradyarrhythmia, ischaemia).
2. Bradycardia: stop the stimulus first, then atropine, then adrenaline or isoprenaline, then pacing.
3. Start compressions at SBP < 50 mmHg, without waiting for a full arrest.
4. Use EtCO2 and the arterial line to guide CPR quality and detect ROSC.
5. Algorithms differ on doses and timing. Know the local one (SRFAC) and why the others differ.

**Singapore default:**
- **SRFAC 2021** for bradycardia (atropine 0.6 mg, max 2.4 mg) and the arrest drug doses.
- VF/pVT adrenaline timing: make it configurable. **ERC** gives it after the 3rd shock; **AHA**, after the 2nd.
  Check the SRFAC 2021 algorithm figure in SMJ 2021;62:390–403 before fixing a default.
- Add the perioperative modifications (SBP < 50 mmHg, small adrenaline doses with an arterial line) as a separate
  "theatre" layer citing ERC/RCUK 2025 and NAP7.

---

## 11. Light anaesthesia and awareness risk

**(a) Sources.**
- **NAP5** (RCoA and AoA, 2014):
  - Pandit JJ et al. *BJA* 2014;113:549–559, doi 10.1093/bja/aeu313;
  - Cook TM et al. *BJA* 2014;113:560–574, doi 10.1093/bja/aeu314;
  - full report and the **NAP5 Awareness Support Pathway**: https://www.nationalauditprojects.org.uk (NAP5). [V
    abstracts; U for pathway detail]
- **AoA monitoring standards 2021:** Klein AA et al. *Anaesthesia* 2021;76:1212–1223, doi 10.1111/anae.15501.
  **pEEG should be used with TIVA plus an NMB**, from before induction until full NMB recovery, and considered for
  volatile anaesthesia and high-risk patients. [S quote of standard 7; V citation]

**NAP5 findings [V].**
- **Incidence of accidental awareness:**

  | Group | Incidence |
  |---|---|
  | Overall | About 1:19,600 |
  | With NMB | 1:8,200 |
  | Without NMB | 1:135,900 |
  | Caesarean section | 1:670 |

- **Timing:** two-thirds at induction or emergence.
- **Induction factors:** thiopental, RSI, obesity, difficult airway, NMB, and **interrupted delivery when moving
  from the anaesthetic room to theatre**.
- **Emergence:** residual paralysis was experienced as awareness.
- **Patient risk factors:** female sex; younger adults; obesity; previous awareness.
- **Case and team factors:** junior anaesthetist; out of hours; emergencies; obstetric, cardiac or thoracic
  surgery; NMB.
- **Not risk factors:** ASA grade and nitrous oxide.
- **Experience and harm:** 75% of experiences lasted < 5 min, yet **51% were distressing** and **41% had longer-term
  harm** (worst with paralysis).
- **Preventable:** 75%. Medication-related factors were common.
- Reassurance at the time appeared to help.

**(b) Physiological signature (model).**
- **Signs:** tachycardia, hypertension, lacrimation, sweating, pupils dilating, movement or grimace if not fully
  paralysed, breathing against the ventilator, **BIS > 60** (BIS lags about 15–30 s, and EMG can raise it falsely
  [U]).
- **Autonomic signs are often blunted** (β-blockers, opioids) and are unreliable; the exact NAP5 proportion is
  [U].
- **Failure modes to simulate:**

  | Failure | What the monitors show |
  |---|---|
  | **Vaporiser empty, off or not seated** | End-tidal agent falls over 2–5 min (faster at high fresh gas flow); agent alarm |
  | **TIVA failure:** pump stopped, empty syringe, line disconnected, cannula tissued, 3-way tap closed, wrong model or target | Propofol effect-site level falls over minutes; BIS rises over about 5–10 min [U] |
  | **Transfer gap** between the anaesthetic room and theatre | — |
  | **Drug error** (NMB given before the hypnotic; syringe swap) | — |
  | **Under-dosed RSI with a prolonged difficult intubation** | — |

**(c) Key actions.**
1. **Check delivery:**
   - volatile: dial, vaporiser level and seating, **agent analyser** (inspired and end-tidal), fresh gas flow,
     leaks;
   - TIVA: pump running and syringe correct, the line followed to the cannula, a patent cannula, the model and
     target correct.
2. **Deepen at once:**
   - propofol 0.5–1 mg/kg (about 30–70 mg), or raise the volatile to ≥ 1 MAC (age-adjusted); opioid if there is a
     painful stimulus [U doses];
   - **consider a benzodiazepine**, e.g. midazolam 2–5 mg, for amnesia [U]. It won't erase memories already formed.
3. **Talk to the patient:** reassure and explain (NAP5 found this helped).
4. Don't give more NMB to stop movement until depth is assured.
5. Document the event.
6. **After surgery, the NAP5 Awareness Support Pathway** [U detail]:
   - early visit; a structured interview (e.g. modified Brice questionnaire); apology and explanation;
   - record it; offer psychological support or referral; inform the GP; report the incident.

- **Debrief windows:**
  - from the first sign (BIS > 60 or an unexplained haemodynamic rise) to deepening ≤ 1–2 min;
  - delivery check within 2 min.

**(d) Wrong actions.**
- Treating tachycardia or hypertension with β-blockers or antihypertensives without deepening.
- More NMB for movement.
- Blaming BIS artefact.
- Ignoring the agent alarm or an empty vaporiser.
- Turning the agent off before NMB is reversed.
- Extubating with residual paralysis.
- Dismissing the patient's report afterwards.

**(e) Teaching points.**
1. NMB is the main risk factor: when the patient is paralysed, monitor depth (pEEG mandatory with TIVA + NMB).
2. Induction and emergence are the dangerous phases; mind the gap when moving from the anaesthetic room.
3. Check delivery before "deepening" so that you fix the real cause.
4. Talk to the patient, then follow up properly (NAP5 Awareness Support Pathway).
5. Residual paralysis at emergence can feel like awareness: link this to Scenario 12.

---

## 12. Residual neuromuscular block at emergence

**(a) Guidelines.**
- **AoA monitoring standards 2021** (Klein 2021): **quantitative NMT whenever an NMBA is given**, from before the
  first dose until **TOFR > 0.9** is confirmed. [S quote; V citation]
- **ASA 2023 Practice Guidelines:** Thilen SR et al. *Anesthesiology* 2023;138:13–41, doi
  10.1097/ALN.0000000000004379. [V citation; content S via the MPOG summary]
  - Quantitative monitoring over qualitative; never clinical assessment alone.
  - Monitor at the **adductor pollicis**; don't use eye muscles.
  - **TOFR ≥ 0.9 before extubation.**
  - **Sugammadex** for deep, moderate and shallow rocuronium or vecuronium block.
  - **Neostigmine** is a reasonable alternative at **minimal** depth (TOFR 0.4–< 0.9).
  - Atracurium or cisatracurium: neostigmine.
  - Without quantitative monitoring, wait **≥ 10 min after antagonism** before extubating.
- **ESAIC 2023:** Fuchs-Buder T et al. *EJA* 2023;40:82–94, doi 10.1097/EJA.0000000000001769. [V]
  - Quantitative monitoring at the adductor pollicis (R6).
  - Sugammadex for deep, moderate and shallow aminosteroid block (R7).
  - **Neostigmine only after TOFR > 0.2**, and monitor until > 0.9 (R8).
- **ASA depth bands** [U wording; S]:

  | Depth | Monitor finding |
  |---|---|
  | Deep | TOF count 0, PTC ≥ 1 |
  | Moderate | TOF count 1–3 |
  | Shallow | TOF count 4, TOFR < 0.4 |
  | Minimal | TOFR 0.4–< 0.9 |
  | Acceptable recovery | TOFR ≥ 0.9 |

**(b) Physiological signature (model).**
- **Before extubation:** low Vt with a high RR, weak and uncoordinated movements.
- **After extubation:**
  - rapid shallow breathing; SpO2 falling and EtCO2/PaCO2 rising;
  - see-saw breathing (pharyngeal weakness causes upper airway obstruction even at TOFR 0.7–0.9);
  - weak cough, dysphagia, aspiration risk;
  - can't hold a head lift for 5 s; weak grip; diplopia or ptosis;
  - "fish out of water" jerky movements; distress (a weak, aware patient: the NAP5 link).
- **Qualitative fade can't be seen or felt once TOFR is above about 0.4**, which is why clinical signs mislead [U].
- **Reversal kinetics** [U, approximate from labelling and trials]:

  | Drug and dose | Approx. time to TOFR 0.9 |
  |---|---|
  | Sugammadex 2 mg/kg at TOF count ≥ 2 | 2–3 min |
  | Sugammadex 4 mg/kg at PTC 1–2 | About 3 min |
  | Sugammadex 16 mg/kg | About 1.5 min |
  | Neostigmine | Onset 1–2 min, **peak at 7–10 min**; has a ceiling effect, so it can't reverse deep block and may take > 15–20 min from TOF count 1–2 |

**(c) Key actions.**
1. Quantitative monitoring (acceleromyography or EMG at the adductor pollicis), with a baseline or calibration.
2. Reverse according to depth:

   | Situation | Dose |
   |---|---|
   | TOF count ≥ 2 (moderate or shallow) | **Sugammadex 2 mg/kg** |
   | TOF count 0 with PTC 1–2 (deep) | **Sugammadex 4 mg/kg** |
   | Immediate reversal after rocuronium 1.2 mg/kg | **Sugammadex 16 mg/kg** |
   | Minimal block only (TOFR ≥ 0.4 per ASA; > 0.2 per ESAIC) | **Neostigmine 40–50 µg/kg (max 5 mg)** with **glycopyrrolate about 10 µg/kg** (≈ 0.2 mg per 1 mg neostigmine) or atropine 15–20 µg/kg |

   [V for the sugammadex doses (MPOG/FDA); U for the anticholinergic ratio]
   - MPOG's ASA-based summary says not to exceed about 40–50 µg/kg (higher doses risk a paradoxical effect);
   - if TOFR is still < 0.9 at peak: wait, give sugammadex (aminosteroids), or top up neostigmine to the 50 µg/kg
     ceiling. [S]
3. Keep the patient asleep and ventilated until TOFR ≥ 0.9.
4. **If extubated and weak:** 100% O2, airway support (jaw thrust, CPAP or assisted ventilation), re-measure TOFR,
   sugammadex if an aminosteroid was used; sedate and reintubate if needed; reassure an awake, weak patient.
5. **Things that prolong block:** hypothermia, magnesium, aminoglycosides, volatiles, renal or hepatic failure,
   acidosis.

- **Debrief windows:**
  - TOFR measured before reversal and again before extubation;
  - after neostigmine with only qualitative monitoring, ≥ 10 min before extubation (ASA);
  - after sugammadex, recheck within 2–3 min.

**(d) Wrong actions.**
- Extubating on clinical signs (head lift, Vt) or "time since the last dose".
- Neostigmine at deep block (TOF count 0–1).
- Neostigmine beyond 5 mg or 50–70 µg/kg.
- Under-dosing sugammadex (recurarisation).
- Sugammadex for cisatracurium or atracurium (it doesn't work).
- Monitoring at the eye (recovers earlier than the adductor pollicis).
- Assuming "no fade by feel" means OK.
- No calibration.
- Forgetting that sugammadex can cause anaphylaxis or bradycardia (rare).
- Ignoring hypothermia.

**(e) Teaching points.**
1. Clinical tests and qualitative TOF can't exclude residual block. Measure the TOFR.
2. TOFR ≥ 0.9 at the adductor pollicis before extubation.
3. Match the reversal drug and dose to the measured depth.
4. Neostigmine has a ceiling and a delayed peak; sugammadex works only on aminosteroids.
5. Residual block causes hypoxaemia, aspiration and patient distress.

**Singapore default:** ASA 2023 depth bands with the ESAIC neostigmine threshold (> 0.2) as an option. Sugammadex
doses as labelled.

---

## Uncertain, or differs between guidelines

1. **Atropine for bradycardia:**
   - ERC/RCUK 500 µg (max 3 mg);
   - AHA 1 mg (max 3 mg);
   - **SRFAC 2021: 0.6 mg boluses, max 2.4 mg**;
   - QRH 0.5–1 mg critical, 300–600 µg stable.
   - **Singapore default: SRFAC.**
2. **First adrenaline in VF/pVT:**
   - ERC: after the 3rd shock;
   - AHA: after initial shocks fail (2nd shock in the algorithm);
   - SRFAC 2021 does not tie it to a shock number: adrenaline every 3–5 min, early (checked against Fig. 1 later in the
     planning session).
   - Default SRFAC; ERC and AHA timings configurable.
3. **Adrenaline in arrest when an arterial line is in place:** RCUK/ERC 2025 now suggest 50–100 µg first; ALS
   otherwise uses 1 mg; NAP7 found 1 mg was usual. Teaching default: the theatre layer with small doses.
4. **EtCO2 targets in CPR:** ERC 2025 physiology-guided ≥ 25 mmHg with DBP ≥ 30 mmHg; Stanford > 10 mmHg with
   DBP > 20 mmHg; AHA uses < 10 mmHg after 20 min only as a prognostic aid. None should be used alone to stop CPR.
5. **Anaphylaxis adrenaline:**
   - ANZAAG graded: 10–20 → 50 µg (moderate); 50–100 → 200 µg (life-threatening); every 1–2 min;
   - QRH: 50 µg fixed;
   - Stanford: 10–100 µg escalating every 2 min;
   - ANZAAG gives arrest adrenaline 1 mg every 1–2 min, which is more frequent than ALS (every 3–5 min).
   - Singapore default: ANZAAG ladder.
6. **"Association of Anaesthetists 2021 anaphylaxis guideline (Harper/Garvey)":** not found. The current AoA tool is
   QRH 3-1 v5; Garvey 2019 (BJA) is the international consensus.
7. **NAP6 grading criteria:** that NAP6 used grades 1–5 and collected grades 3–5 is verified; the exact thresholds
   (e.g. an SBP cut-off for grade 3) are not.
8. **Tryptase timing:**
   - QRH/RCUK: ASAP (when stable), 1–2 h (≤ 4 h), and ≥ 24 h;
   - Stanford mentions only a 1–2 h peak sample;
   - NICE NG258 is similar for the first two.
9. **Dantrolene repeat dose:**
   - AoA 1 mg/kg every 5 min;
   - MHAUS and Stanford 2.5 mg/kg repeated;
   - Agilus SmPC 2.5 mg/kg every 10 min;
   - initial dose 2–3 mg/kg (QRH) vs 2.5 mg/kg (others).
   - Stop-cooling temperature: 38 °C (MHAUS) vs 38.5 °C target (QRH).
   - **Which dantrolene product NUH stocks is unverified** (Dantrium 20 mg assumed).
10. **Larach CGS point values** are reproduced from memory. Verify against the 1994 table before coding the score.
11. **Lipid regimen:** ASRA (fixed 100 mL then 200–250 mL if > 70 kg; 0.25 mL/kg/min) vs AoA (1.5 mL/kg then
    15 mL/kg/h). Both cap at 12 mL/kg. Bolus over 2–3 min in both; a WA Health guideline uses 1 min (older advice).
12. **Massive haemorrhage targets:**
    - QRH 3-2: Hb > 80, platelets > 75, fibrinogen > 1.0 g/L;
    - AoA 2024: Hb 70–90, platelets > 50 (> 100 in trauma or TBI; < 75 trigger in obstetrics), fibrinogen > 1.5
      (> 2.0 obstetric), iCa > 1.0 mmol/L;
    - Stanford: 1–2 RBC : 1 FFP : 1 platelet pack; AoA: 1:1 trauma, 1:1–1:1.5 otherwise.
    - The prompt's "platelets > 75" matches the older QRH and obstetric thresholds.
    - **Singapore default: AoA 2024.**
13. **Permissive hypotension numbers** (SBP 80–90 mmHg; MAP ≥ 80 mmHg in TBI) are from my reading of the European
    trauma guideline. Not re-verified this session.
14. **Needle decompression site:** ATLS 10 uses the 4th/5th ICS anterior to the mid-axillary line (adults) and the
    2nd ICS mid-clavicular line (children); ETC and older UK teaching use the 2nd ICS mid-clavicular line. ATLS 11
    is unverified. The finger-thoracostomy preference in ventilated patients is [U].
15. **Laryngospasm drug doses:**
    - propofol: QRH 0.25–0.5 mg/kg vs 0.5–0.8 mg/kg (Hampson-Evans) vs 0.5–1 mg/kg (common);
    - suxamethonium IV: 0.1–0.5 mg/kg (low dose) vs 1–2 mg/kg;
    - IM: 4 mg/kg vs 3–4 mg/kg.
16. **DAS 2025 detail:** I could not read the full paper (paywall or 403). The 3 + 1 laryngoscopy limit, up to 3 SAD
    attempts, scalpel–bougie–tube and the 6.0 cuffed tube come from DAS's own 2025 simulation scenarios and
    summaries. Whether DAS 2025 still recommends sugammadex 16 mg/kg for the wake-up pathway, and the exact
    incision advice, are **unverified**. There are published letters debating tube size and the anatomical
    endpoints for eFONA.
17. **Vortex "CICO Ready/Set/Go"** and its attempt limits: unverified. The Vortex site describes lifelines, best
    effort, the Green Zone and early priming only.
18. **Benumof desaturation times** are approximate values recalled from the 1997 figure.
19. **Vasopressors in Singapore:** metaraminol availability at NUH is unverified. Phenylephrine, ephedrine and
    noradrenaline are assumed available.
20. **Licences:**
    - ERC, AHA, ASRA, MHAUS, NAP reports and SRFAC: free to read; open licence not confirmed;
    - ANZAAG cards: all rights reserved (confirmed);
    - QRH CC BY-NC-SA, Stanford CC BY-NC-ND, Vortex CC BY-NC-ND (confirmed);
    - DAS 2025 CC BY-NC-ND per Europe PMC metadata only.
21. **AHA 2025 adult ALS:** I could not read the primary text (403). The statement that there were no major changes
    to arrest interventions or bradycardia dosing comes from secondary course sites.
22. **Debrief time windows** throughout are teaching suggestions, not guideline values, except where a source is
    named (TXA within 3 h; CPR at SBP < 50 mmHg; extubate only at TOFR ≥ 0.9; lipid repeat at 5 and 10 min).

---

## Source list (URLs and DOIs)

**Cognitive aids**
- AoA QRH (complete, June 2023): https://anaesthetists.org/Portals/0/PDFs/QRH/QRH_complete_June_2023.pdf; index: https://anaesthetists.org/qrh
- Stanford Emergency Manual v4.4: https://emergencymanual.stanford.edu (download page: /downloads)
- Vortex Approach: https://www.vortexapproach.org

**Airway**
- DAS 2025: doi 10.1016/j.bja.2025.10.006; https://das.uk.com/guidelines/das_intubation_guidelines; algorithms: https://das.uk.com/algorithms
- DAS 2015: doi 10.1093/bja/aev371
- ANZCA PG61(A) 2017: anzca.edu.au (PG61(A)-CICO-2017.pdf)
- NAP4: doi 10.1093/bja/aer058
- Chrimes 2016: doi 10.1093/bja/aew175
- Benumof 1997: *Anesthesiology* 87:979–982

**Anaphylaxis**
- ANZAAG–ANZCA 2022: https://www.anzca.edu.au/resources/professional-documents/endorsed-guidelines/anaphylaxis-guideline-bp-2022.pdf
- NAP6: doi 10.1016/j.bja.2018.04.014; 10.1016/j.bja.2018.04.015
- Garvey 2019: doi 10.1016/j.bja.2019.04.044
- NAP7 anaphylaxis arrests: doi 10.1111/anae.16229
- RCUK 2021 anaphylaxis: resus.org.uk

**Malignant hyperthermia**
- AoA MH 2020: doi 10.1111/anae.15317
- EMHG dantrolene availability: doi 10.1016/j.bja.2020.04.089
- EMHG perioperative management: doi 10.1016/j.bja.2020.09.029
- MHAUS: https://www.mhaus.org/healthcare-professionals/managing-a-crisis/
- Larach 1994: *Anesthesiology* 80:771–779
- Larach 2010: doi 10.1213/ANE.0b013e3181c6b9b2
- Agilus SmPC: https://www.medicines.org.uk/emc/product/15912/smpc

**LAST**
- ASRA checklist 2020: doi 10.1136/rapm-2020-101986
- ASRA advisory 2018: doi 10.1097/AAP.0000000000000720
- AoA LAST 2023: https://anaesthetists.org/Guidelines-and-publications/Guidelines/Management-of-severe-local-anaesthetic-toxicity-2023
- Di Gregorio 2010: *RAPM* 35:181–187

**Bleeding**
- AoA blood components 2024: doi 10.1111/anae.16542 (PMC11885198)
- European trauma guideline 2023: doi 10.1186/s13054-023-04327-7
- ESAIC 2023: doi 10.1097/EJA.0000000000001803
- BSH 2022: doi 10.1111/bjh.18275
- CRASH-2 timing: doi 10.1016/S0140-6736(11)60278-X

**Hypotension**
- POQI-3: doi 10.1016/j.bja.2019.01.013
- Südfeld 2017: doi 10.1093/bja/aex127

**Bronchospasm and OLV**
- Woods & Sladen: doi 10.1093/bja/aep271
- Shum 2023: doi 10.1016/j.bjae.2023.05.006
- Karzai 2009: doi 10.1097/aln.0b013e31819fb15d

**Laryngospasm**
- Hampson-Evans 2008: *Paediatr Anaesth* 18:303–307
- NPPE review (Ma 2023): doi 10.3892/etm.2023.12154

**Tension pneumothorax**
- WJES 2025: doi 10.1186/s13017-025-00613-7

**Resuscitation**
- ERC 2025 ALS: doi 10.1016/j.resuscitation.2025.110769
- ERC 2025 Special Circumstances: doi 10.1016/j.resuscitation.2025.110753
- ERC 2021 ALS: doi 10.1016/j.resuscitation.2021.02.010
- RCUK 2025 ALS: https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-advanced-life-support-guidelines
- AHA 2020 Part 3: doi 10.1161/CIR.0000000000000916
- AHA 2025 Part 9: doi 10.1161/CIR.0000000000001376
- SRFAC ACLS 2021: doi 10.11622/smedj.2021109 (PMC8804484)
- NAP7: doi 10.1111/anae.16156; 10.1111/anae.16157; 10.1111/anae.16310

**Awareness and NMB**
- NAP5: doi 10.1093/bja/aeu313; 10.1093/bja/aeu314
- AoA monitoring 2021: doi 10.1111/anae.15501
- ASA NMB 2023: doi 10.1097/ALN.0000000000004379
- ESAIC NMB 2023: doi 10.1097/EJA.0000000000001769
- MPOG NMB summary (secondary): https://mpog.org/wp-content/uploads/2024/04/Neuromuscular-Blockade-Summary-of-Recommendations.pdf
