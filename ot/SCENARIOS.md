# OT simulator: crisis scenarios

The 12 scenarios from `PLAN.md` (M4), in build order, each with the patient, the physiology the model must produce,
the expected actions and their debrief windows, the wrong actions worth modelling, and the teaching points with
sources. Written 14 Oct 2026 as part of the plan and revised the same day after review; nothing is built yet. The full
research, with every dose's source and status, the licence of each guideline and the 22 points where guidelines
differ, is `research/crises.md`; the model each scenario relies on is `MODEL.md` (sections 11–13 for the crisis
processes, scenario drugs and resuscitation).

**Rules for this file and the scenario modules.** Teaching only, for a synthetic patient. Wording is our own: the
guidelines are cited and linked, never copied (the QRH is CC BY-NC-SA, the Stanford Emergency Manual and the Vortex
CC BY-NC-ND, the ANZAAG cards all rights reserved; the scenario modules write their own step lists). **Doses per kg
apply to each scenario's own patient** (weight in its Patient line); fixed doses are adult doses; `research/crises.md`
works examples at 70 kg. Status tags as in `MODEL.md` ([V] checked, [S] secondary, [U] unverified, [D] ours); a dose
without a tag here is [V] in `research/crises.md`. **Debrief windows are our teaching suggestions [D]**, not guideline
times, unless a source is named next to the time itself (the sourced ones: tranexamic acid within 3 h of trauma, CPR at
SBP under 50 mmHg, extubation only at TOFR ≥ 0.9, the lipid repeat at 5 and 10 min). The owner checks every dose for NUH
practice before any scenario is called reviewed.

**Singapore defaults** (proposed; the owner confirms them through `DESIGN.md` questions 3–6): resuscitation by SRFAC
2021 (atropine 0.6 mg boluses to 2.4 mg; adrenaline 1 mg every 3–5 min, early, not tied to a shock number; amiodarone
after 3 shocks), with the theatre advice from RCUK/ERC 2025 and NAP7 (compressions when SBP stays under 50 mmHg; small
adrenaline doses with an arterial line); airway by DAS 2025 (details from DAS's summaries and simulation scenarios
[S]); anaphylaxis by the ANZAAG–ANZCA 2022 graded ladder with cefazolin among the culprits; bleeding by the Association
of Anaesthetists 2024 blood components guideline; malignant hyperthermia 2.5 mg/kg dantrolene then 1 mg/kg every 5 min
to the QRH end points (Dantrium 20 mg vials assumed: no dantrolene product is on the HSA register); local anaesthetic
toxicity by the QRH 2023 lipid regimen; needle decompression in the 4th/5th intercostal space just anterior to the
mid-axillary line (ATLS 10 [U: not open]). Metaraminol is off by default (not on the HSA register).

## Scenario module format

One file per scenario in `js/scenarios/`, a plain object; numbers carry source comments; triggers and expected actions
are patterns over the one action shape in `DESIGN.md` ("Actions"):

```js
export default {
  id: 'anaphylaxis', title: 'Anaphylaxis after the antibiotic', level: 'core', minutes: 20,
  patient: { age: 45, sex: 'F', weightKg: 62, heightCm: 158, asa: 2, airway: { mallampati: 2 },
             history: ['hypertension on amlodipine'], fixed: { q: 0.5 } },
  start: { preset: 'maintenance', agent: 'sevoflurane', minutesIn: 10, device: 'ETT' },
  steps: [                                   // what happens to the patient, in model terms (MODEL.md section 11)
    { id: 'ask', at: 30, say: 'Surgeon: "Can we have the antibiotic?"' },
    { id: 'trigger', when: { type: 'bolus', drug: 'cefazolin' }, orAt: 90,
      autoGive: { type: 'bolus', drug: 'cefazolin', dose: 2, unit: 'g', route: 'iv' } },
    { id: 'onset', after: 'trigger', delay: 90, cond: 'anaphylaxis', set: { level: 0.8, rise: 120 } },
  ],
  recognisable: { after: 'onset', when: 'first alarm or MAP 20% below baseline' },
  expected: [                                // what a trainee should do, with debrief windows [D]
    { id: 'adrenaline', match: { type: 'bolus', drug: 'adrenaline', route: 'iv', unit: 'mcg', dose: [10, 200] },
      from: 'recognisable', within: 180,
      why: 'Small, titrated IV adrenaline boluses are the treatment (ANZAAG 2022; QRH 3-1).' },
  ],
  wrong: [ { match: { type: 'bolus', drug: 'adrenaline', route: 'iv', unit: 'mcg', dose: [500, Infinity] },
             note: '1 mg IV is the arrest dose; with a circulation it causes hypertension and arrhythmia.' } ],
  reference: [ /* the correct-treatment action list the tests and ?at= deep links replay */ ],
  teaching: [ { text: '...', source: 'NAP6 (RCoA 2018)', url: 'https://doi.org/10.1016/j.bja.2018.04.015' } ],
  simplified: [ 'Skin signs are text in Examine, not drawn.' ],
};
```

- `recognisable` is the moment a competent trainee could notice (first alarm, first numeric past a limit). Windows run
  from there, not from the hidden onset.
- A trigger the trainee is expected to perform (giving the antibiotic) has an `orAt` time and an `autoGive`, so the
  untreated course still runs if the trainee never gives it.
- Matchers compare after converting the action's dose to the pattern's unit (1 mg matches 1000 mcg). Matching is
  generous (dose ranges, any listed route) and order-free unless `after` is given; the debrief shows what
  was done, when, and what was expected, never a score (`NOTES.md`: teach, don't test).
- Start presets (`DESIGN.md`, "Start presets"): `awake`, `preoxygenated`, `sedation`, `induced`, `maintenance`,
  `emergence`, with parameters (device, agent or TIVA, minutes in, surgery type, relaxant timing).
- Each scenario ships with a model test running three courses: **untreated** (the physiology runs its course to the
  stated end), **correct** (`reference` actions: stabilises by a stated time), **wrong** (one listed wrong action: the
  stated consequence happens).

## 1. Hypotension after induction

- **Patient:** 78-year-old woman, 60 kg, 155 cm, hypertensive on an ACE inhibitor, mildly dry (fasting, bowel
  preparation): blood volume −10%, baroreflex gain low. **Start:** `preoxygenated`; the trainee induces.
- **Model:** the trainee's own induction drives it: propofol's slower haemodynamic effect site (t½ke0 about 10 min at
  this age, `MODEL.md` section 2) brings the trough 3–6 min after induction, deeper with hypovolaemia; laryngoscopy
  gives a transient rise, then a second trough during preparation and draping (5–15 min). ACE-inhibitor vasoplegia: the
  response to phenylephrine and ephedrine is halved [D size]; vasopressin works [V, Stanford manual]. An arterial line
  shows the fall at once; without one the NIBP cycle delays recognition while pleth amplitude and EtCO2 fall first.
- **Expected:** NIBP every 1–2 min around induction; recognise within one cycle; reduce the anaesthetic without going
  light (age-adjusted MAC about 0.7 or BIS-like 40–60 [U]); leg raise; crystalloid 250 mL boluses (QRH 2-4);
  phenylephrine 50–100 mcg when HR is normal or high, ephedrine 3–6 mg when it is low; noradrenaline 5–10 mcg bolus or
  an infusion if repeated [U, practice]; vasopressin 0.5–1 unit if refractory (Stanford); call for help after 2–3 doses
  without response. MAP ≥ 65 (or within 20% of baseline) within about 5 min [D]. The debrief shows cumulative minutes
  with MAP under 65 [D].
- **Wrong:** phenylephrine repeated in bradycardia (cardiac output falls); ephedrine past tachyphylaxis; the anaesthetic
  turned off (awareness signs); NIBP left at 5 min; a "young adult" induction dose.
- **Teaching:** harm scales with depth × duration of hypotension (POQI-3, Sessler 2019); match the pressor to the heart
  rate; hypotension is often a sign of something else (QRH 2-4 checklist); titrate induction to age and volume;
  ACE-inhibitor vasoplegia may need vasopressin. Sources: QRH 2-4; Stanford #16; Südfeld 2017.

## 2. Laryngospasm

- **Patient:** 30-year-old man, 75 kg, 175 cm, smoker with a recent cold, LMA for a short case. **Start:** `emergence`
  (device LMA). A variant with a 6-year-old comes later (children's parameters are not in the first model).
- **Model:** the `laryngospasm` condition is triggered by stimulation (suction, device removal) while the hypnotic
  effect is between "asleep" and "awake" [D]; partial (stridor text, small ragged capnogram, low Vt) or complete (no
  capnogram, no bag movement, chest efforts); SpO2 falls on the apnoea model's curve with the extra O2 use of obstructed
  efforts (no published timing found) [D]; tachycardia then hypoxic bradycardia; negative-pressure pulmonary oedema
  (shunt up, pink froth in Examine) in a minority after relief (4% of reported events, Visvanathan 2005).
- **Expected:** call for help, stop the stimulus, suction under vision; jaw thrust with Larson's manoeuvre and CPAP with
  100% O2 within about 10–15 s [D]; propofol 0.25–0.5 mg/kg (QRH 3-6; up to 1 mg/kg in common adult practice [U]) within
  about 30 s if not resolving or SpO2 under 90% [D]; suxamethonium 0.5 mg/kg IV (1–2 mg/kg to intubate), with atropine
  if bradycardic, within about 60 s if SpO2 keeps falling or at once with bradycardia [D]; without IV access 4 mg/kg IM
  (maximum 150 mg); intubate if it recurs; watch for NPPE.
- **Wrong:** vigorous positive pressure (gastric distension, worse seal); extubating or suctioning in a light plane;
  more propofol in a hypoxic, bradycardic patient instead of suxamethonium; mistaking silent complete spasm for apnoea.
- **Teaching:** remove the airway deep or fully awake; the ladder CPAP → propofol → suxamethonium; a tracheal tube
  excludes laryngospasm; bradycardia means hypoxia; look for NPPE. Sources: QRH 3-6; Hampson-Evans 2008; Larson 1998.

## 3. Anaphylaxis

- **Patient:** 45-year-old woman, 62 kg, 158 cm; on a β-blocker in the harder variant. **Start:** `maintenance`
  (sevoflurane, ETT, 10 min in); the surgeon asks for the antibiotic, which the trainee gives (auto-given at 90 s if
  not); rocuronium is the trigger in a variant.
- **Model:** the `anaphylaxis` mediator level rises over 1–3 min after the trigger: SVR and venous tone fall, capillary
  leak removes plasma over 10–30 min, bronchospasm in some (resistance up: Ppeak up, upsloping capnogram), HR up (down
  when β-blocked or severe), EtCO2 falls with cardiac output, SpO2 later; skin signs often absent (Examine says so).
  First features in NAP6: hypotension 46%, bronchospasm 18%, tachycardia 10%; every patient became hypotensive.
  Adrenaline acts on receptors and lowers mediator release; glucagon counters β-blockade.
- **Expected:** call for help, stop surgery, remove the trigger; 100% O2; IV adrenaline by the ANZAAG ladder: moderate
  10–20 mcg then 50 mcg, life-threatening 50–100 mcg then 200 mcg, every 1–2 min (QRH 3-1: 50 mcg repeated), first dose
  within 2–3 min of unexplained hypotension or bronchospasm [D]; infusion after 3 boluses (3 mg in 50 mL, 3–40 mL/h,
  3–40 mcg/min) by about 10 min [D]; crystalloid 1000 mL then 20 mL/kg repeats; compressions as soon as SBP stays under
  50 mmHg (RCUK/ERC 2025, NAP6/7); refractory: noradrenaline 3–40 mcg/min and/or vasopressin 1–2 units then 2 units/h;
  glucagon 1–2 mg every 5 min if β-blocked; tryptase at once, at 1–2 h and after 24 h; allergy label and referral.
- **Wrong:** treating it as post-induction hypotension with repeated phenylephrine; no or late adrenaline; 1 mg IV with
  a circulation (hypertension, arrhythmia); antihistamine or steroid first; leaving the culprit running; no
  compressions at SBP under 50.
- **Teaching:** unexplained hypotension or bronchospasm under anaesthesia is anaphylaxis until proven otherwise; small
  titrated IV adrenaline, infusion early; CPR at SBP under 50; large fluid volumes; three tryptase samples and referral.
  Sources: ANZAAG–ANZCA 2022; QRH 3-1 v5; NAP6 (Harper 2018); Garvey 2019; NAP7 (Cook 2024).

## 4. Can't intubate, can't oxygenate

- **Patient:** 52-year-old man, 95 kg, 168 cm (BMI 34), Mallampati 3, limited neck movement (hidden truth:
  Cormack-Lehane 4 by direct and 3b by video laryngoscopy, mask ventilation difficult, SAD seal poor). **Start:**
  `awake`; the trainee pre-oxygenates and induces.
- **Model:** apnoea physiology (`MODEL.md` section 8, with this patient's FRC and shunt; the calibration test gives his
  time to SpO2 90%); no capnogram is the first sign; the oximeter lags 20–60 s; tachycardia, then hypoxic bradycardia,
  hypotension, PEA. DAS's 2025 simulation scenarios describe a similar course (SpO2 94 → 88 → 70 → 60% over failed
  plans A–C with HR to about 120, then about 50 and BP 70/30; after front-of-neck access a square capnogram and
  recovery) [S]: used as a shape check, not copied.
- **Expected:** call for help by the first failed attempt [D]; plan A: at most 3 + 1 laryngoscopy attempts,
  videolaryngoscope first, nasal O2 throughout, declare "failed intubation" [S, DAS 2025 summaries]; plan B: SAD, up to
  3 attempts [S], within about 60 s of declaring failure [D]; plan C: two-person facemask; declare CICO as soon as B and
  C fail with SpO2 falling, not waiting for bradycardia; give full neuromuscular block; scalpel–bougie–tube (size 10
  blade, bougie, cuffed 6.0 mm tube; DAS 2025 [S], QRH 3-3 [V]); windows [D]: skin incision within about 30–60 s of the
  declaration, capnography confirmed within 60–90 s of incision.
- **Wrong:** "one more go"; skipping the SAD; waking on suxamethonium expecting rescue (desaturation comes first,
  Benumof 1997); letting the block wear off; a cannula technique with a high-pressure source and no exit; no
  capnography after front-of-neck access; watching SpO2 while the capnogram is flat.
- **Teaching:** "no trace = wrong place" (the capnography campaign of the RCoA, Association of Anaesthetists and DAS);
  limit attempts and declare each failure aloud; prime for front-of-neck access early; one practised technique; human
  factors (NAP4). The Vortex and ANZCA PG61(A) as other cognitive aids. Sources: DAS 2025 (Ahmad 2026, doi
  10.1016/j.bja.2025.10.006; full text not yet read, `research/crises.md` item 16); DAS 2015; QRH 3-3; NAP4.

## 5. Massive haemorrhage (surgical)

- **Patient:** 60-year-old man, 75 kg, 172 cm, open abdominal surgery. **Start:** `maintenance` (sevoflurane, ETT, 30
  min in); a vessel injury at minute 2 bleeds 150–300 mL/min [D].
- **Reference timeline** [D]: the surgeon is told within 2 min, packing halves the rate, control at about 10 min;
  intended loss before control about 0.8–1.8 L across the rate range (class II–III); the correct course's lowest MAP stays above a stated floor at both
  ends of the rate range (tested).
- **Model:** the `haemorrhage` bleed rate (`MODEL.md` section 5): HR up, pulse pressure narrower, PPV up, pleth smaller,
  EtCO2 falls, hypotension early under GA; Hb lags until dilution; lactate and base deficit rise; ionised calcium falls
  with rapid citrate; potassium rises with stored blood; temperature falls with cold fluids; a simple coagulation
  timeline (fibrinogen first to fall) [D], not a coagulation model.
- **Expected:** call for help; tell the surgeon (pressure, packing); activate the major haemorrhage protocol within
  about 5 min [D]; tranexamic acid 1 g (non-cardiac surgery: before incision and at the end; when bleeding, 1 g)
  within about 10 min of activation [D]; first blood within 10–15 min [D]; red cells to FFP about 1:1–1:1.5 (1:1 is the
  trauma ratio); targets for surgical bleeding (Association of Anaesthetists 2024): Hb 70–90 g/L, fibrinogen > 1.5 g/L,
  platelets > 50 × 10⁹/L (> 100 only in multiple trauma or brain injury), ionised calcium > 1.0 mmol/L (10 mL 10%
  calcium chloride); warm everything; cell salvage; blood gas every 30 min or every 4 units; limit crystalloid.
- **Wrong:** crystalloid only or red cells only; late protocol or tranexamic acid; no calcium; cold blood;
  vasopressors in an empty patient; not talking to the surgeon.
- **Teaching:** recognise from trends (HR, PPV, EtCO2) and declare; haemostatic resuscitation; the lethal triad (cold,
  acid, coagulopathy, plus low calcium); surgical control is definitive; one person talks to the blood bank. Sources:
  Association of Anaesthetists blood components 2024 (Shah 2025, CC BY); QRH 3-2 (older targets, noted); trauma
  variants use the European trauma guideline 2023 and CRASH-2 timing.

## 6. Bronchospasm (and one-lung hypoxaemia, later)

- **Patient:** 35-year-old woman, asthmatic, 65 kg, 165 cm. **Start:** `induced` (ETT, just intubated, light).
- **Model:** the `bronchospasm` resistance rises over 1–2 min: in volume control Ppeak rises more than Pplat; in pressure
  control Vt falls; expiratory flow does not finish (auto-PEEP), which lowers venous return and BP (a brief
  disconnection restores BP); shark-fin capnogram, wider PaCO2–EtCO2 gap, a near-flat trace when severe; SpO2 falls over
  minutes. Volatile agents, salbutamol, adrenaline, magnesium and ketamine lower resistance (`MODEL.md` section 12)
  [D sizes].
- **Expected:** 100% O2; a systematic check including hand ventilation and isolating the equipment within about 60 s
  [D] (suction catheter down the tube, tube position, exclude anaphylaxis and pneumothorax); deepen (sevoflurane up, or
  propofol); salbutamol (MDI 4–12 puffs into the circuit, or 5 mg nebulised; IV 250 mcg then 5–20 mcg/min per QRH 3-4)
  within 2–3 min [D]; adrenaline 10–100 mcg IV once SpO2 is under 90% or BP falls; magnesium 2 g over 20 min; ketamine;
  ventilate for exhalation (low RR, I:E 1:3–1:4, accept high CO2).
- **Wrong:** raising RR or Vt to clear CO2 (more trapping, hypotension, arrest); more relaxant for "fighting the
  ventilator"; nebulising upstream of the filter; missing a kinked or bronchial tube; fluids instead of disconnecting.
- **Teaching:** exclude mechanical causes first; volatiles bronchodilate; ventilate for exhalation; escalate in steps;
  a silent chest or flat capnogram is severe. One-lung hypoxaemia (FiO2 1, check the tube with a scope, recruit, CPAP
  to the other lung, two-lung ventilation if severe) is a later variant. Sources: QRH 3-4, 2-2, 2-3; Stanford #6, #17;
  Woods & Sladen 2009; Shum 2023.

## 7. Malignant hyperthermia

- **Patient:** 22-year-old man, 70 kg, 175 cm. **Start:** `maintenance` (sevoflurane, ETT, 20 min in). A
  masseter-spasm variant (start `preoxygenated`, the trainee induces with suxamethonium) comes later with its own
  expected actions, as does recrudescence (about 20% within 16 h).
- **Model:** the `mh` hypermetabolism level rises over 10–20 min: whole-body VO2 and VCO2 × 2–3 (`MODEL.md` section
  11), so EtCO2 rises despite more ventilation (the first sign), tachycardia, soda lime exhausts; rigidity; respiratory
  then metabolic acidosis; potassium rises (peaked T, VT/VF late); core temperature by energy balance, about 1 °C per
  15–20 min when fulminant (reviews quote faster rises; `MODEL.md` section 10 explains the difference) and among the
  first three signs in about two thirds (63.5% in the registry, Larach 2010). Dantrolene lowers the level over minutes.
- **Expected:** suspect within 5–10 min of an EtCO2 rise that ignores more ventilation [D]; call for help and the MH kit;
  vaporiser off and removed, 100% O2 at ≥ 10 L/min, hyperventilate 2–3× within 1–2 min [D], activated charcoal filters
  on both limbs (MHAUS; do not change the machine first); TIVA; dantrolene 2.5 mg/kg (Dantrium 20 mg vials with 60 mL
  water each: 9 vials here, several people mixing), first dose within 10–15 min [D], then 1 mg/kg every 5 min until
  EtCO2 < 45 mmHg and temperature < 38.5 °C (QRH 3-8), reconsidering the diagnosis if there is no response by about 10
  mg/kg (MHAUS); cool; treat potassium (calcium, insulin 10 units with 50 mL 50% glucose, bicarbonate); avoid calcium
  channel blockers; ICU.
- **Wrong:** calling it light anaesthesia and turning the volatile up; changing the machine before dantrolene; one small
  dose; reconstituting in saline; no hyperventilation; verapamil or diltiazem.
- **Teaching:** rising EtCO2 plus tachycardia without another cause is MH until proven otherwise; dantrolene is the only
  specific treatment, so know your product and assign mixers; remove triggers and hyperventilate; treat potassium;
  follow-up and family testing. Each 30 min of delay raised complications 1.6-fold (Larach 2010). Sources: Hopkins 2021
  (Association of Anaesthetists MH 2020); QRH 3-8; MHAUS; Glahn 2020 (dantrolene availability); Larach 1994 grading
  scale (point values to be checked before any score is shown).

## 8. Local anaesthetic systemic toxicity

- **Patient:** 68-year-old woman, 55 kg, 158 cm, sedated for a regional block (bupivacaine at or above the maximum dose,
  or an intravascular injection). **Start:** `sedation` (block being performed). **Before this PR:** the local
  anaesthetic PK research step in `MODEL.md` section 2 (volumes, clearances, absorption by site, free fractions).
- **Model:** local anaesthetic PK with the site's absorption or a direct intravascular dose; CNS signs by concentration
  (perioral numbness, tinnitus, agitation in Examine; then seizures with acidosis); cardiac effects (early hypertension
  and tachycardia if adrenaline-containing, then bradycardia, QRS widening, ectopy, VT/VF, hypotension, asystole); under
  GA or deep sedation the cardiac signs may come first; about 40% present atypically or late (Di Gregorio 2010). Lipid
  raises clearance and adds a sink; acidosis and hypoxia worsen toxicity.
- **Expected:** stop injecting (and any infusion); call for help and the lipid kit within about 30 s [D]; 100% O2,
  airway, avoid hypercapnia; seizures: midazolam 2–4 mg (small propofol doses only if stable); lipid 20% 1.5 mL/kg over
  2–3 min (about 80 mL here) within about 2–3 min of serious toxicity [D], then 15 mL/kg/h; if still unstable repeat the
  bolus at 5 and 10 min **and** double the infusion to 30 mL/kg/h after 5 min (QRH 3-10; ASRA 2020 likewise does
  both): the matcher expects both, and one alone is noted as incomplete; maximum 12 mL/kg; in arrest, adrenaline
  ≤ 1 mcg/kg, no vasopressin, no lidocaine, prolonged CPR, call for ECMO.
- **Wrong:** standard 1 mg adrenaline; vasopressin; lidocaine for VT; β-blocker or calcium channel blocker; propofol as
  the "lipid"; a large propofol dose for seizures in an unstable patient; lipid only after arrest; over 12 mL/kg.
- **Teaching:** suspect it with any CNS or cardiac change after local anaesthetic, including late and under GA; oxygen
  and ventilation first; lipid early, by weight; the changed arrest drugs; prevention (dose limits, aspiration,
  incremental injection, ultrasound). Sources: QRH 3-10 (2023); ASRA checklist 2020 (Neal 2021); Neal 2018 advisory;
  El-Boghdadly 2018 (maximum doses).

## 9. Tension pneumothorax

- **Patient:** 55-year-old man with COPD, 68 kg, 170 cm, after a right subclavian line, volume-controlled ventilation.
  **Start:** `maintenance` (sevoflurane, ETT).
- **Model:** the `pneumothorax` pleural air grows faster with positive pressure: Ppeak and Pplat both rise (compliance
  falls; in pressure control Vt falls); shunt rises (SpO2 falls); venous return falls (HR up, BP down, CVP up, PPV
  bigger), EtCO2 falls with output; Examine: absent breath sounds and chest movement on one side, hyper-resonance,
  distended neck veins (may be absent if hypovolaemic), surgical emphysema; tracheal deviation late; PEA at the end.
  Decompression lets the air out; a drain stops it re-forming [D].
- **Expected:** 100% O2, call for help, hand-ventilate to feel the pressure; quick exclusions (tube depth and breath
  sounds for endobronchial placement, suction catheter for a blocked tube, brief disconnection for auto-PEEP); if
  unstable, decompress without waiting for imaging within 1–2 min of suspicion [D]: 4th/5th intercostal space just
  anterior to the mid-axillary line [U: ATLS 10, not open] (needle 14–16 G, or finger thoracostomy in a ventilated adult, which observational
  data and the WSES-AAST 2025 guideline favour because needles kink or fall short [S]); chest drain within about 10–15
  min [D]; lower Vt and PEEP; stop N2O.
- **Wrong:** waiting for a chest X-ray; treating it as bronchospasm or with pressors only; raising PEEP or Vt; the wrong
  side; a needle at the 2nd space too medial or too short; no drain.
- **Teaching:** rising airway pressure with hypoxaemia and hypotension under positive pressure is tension pneumothorax
  until shown otherwise; a clinical diagnosis; know both sites and their trade-offs; the needle is a bridge to a drain.
  Sources: ATLS 10th ed. (site change; not open); Stanford #22; WJES 2025 meta-analysis; Massarutti 2006.

## 10. Bradycardia and cardiac arrest

- **Patients and starts** (each 70 kg, 170 cm unless stated): (a) laparoscopic cholecystectomy, insufflation causes
  vagal bradycardia to asystole (the stimulus must stop): `maintenance`, laparoscopic; (b) VF during maintenance in a
  65-year-old with ischaemic heart disease; (c) PEA from a cause (bleeding or hypoxia) chosen by the seed.
- **Model:** vagal bradycardia starts within seconds and HR recovers within seconds once vagal drive stops; the clinical
  30–60 s is the time to stop the stimulus (`MODEL.md` section 6); the rhythm engine draws VF, PEA, asystole; CPR,
  shocks, pacing and return of circulation follow `MODEL.md` section 13. NAP7: 3 per 10,000 anaesthetics, 82%
  non-shockable, causes led by bleeding (17%), bradyarrhythmia (9%) and ischaemia (7%); bradycardic arrests do best.
- **Expected (bradycardia):** ask the surgeon to stop (desufflate, release traction) first; atropine 0.6 mg (SRFAC; to
  2.4 mg) within 1 min [D]; glycopyrrolate, ephedrine or adrenaline 10–100 mcg; pacing pads early.
- **Expected (arrest):** declare it and note the time; compressions within 10 s of pulselessness, or of SBP staying under
  50 mmHg (RCUK/ERC 2025) [time D]; first shock within 2 min (aim under 1 min for monitored VF) [D]; pauses under 5 s
  [D]; adrenaline 1 mg every 3–5 min, given early (SRFAC 2021: not tied to a shock number; ERC after the 3rd shock and
  AHA after the 2nd [U for 2025] are configurable alternatives); with an arterial line start with 50–100 mcg (RCUK 2025); amiodarone
  300 mg then 150 mg for VF after 3 shocks (SRFAC); turn the anaesthetic off, 100% O2, 500 mL fluid; the 4 Hs and 4 Ts
  plus theatre causes (vagal, drug error, LAST, anaphylaxis, bleeding, embolism, tamponade, tension pneumothorax,
  auto-PEEP, high spinal, MH); use EtCO2 and the arterial line to guide CPR (typical compressions about 10–20 mmHg,
  aim over 20; ERC 2025 physiology targets DBP ≥ 30 and EtCO2 ≥ 25 with excellent compressions).
- **Wrong:** phenylephrine for bradycardic hypotension; not asking the surgeon to stop; waiting for a pulse check at SBP
  40; 1 mg adrenaline peri-arrest with an arterial line (hypertension, VF); a pulse check straight after a shock;
  hyperventilation in CPR; volatile left on.
- **Teaching:** in theatre, arrest usually follows a trend and is non-shockable, so treat the cause; bradycardia: stop
  the stimulus, atropine, adrenaline, pacing; compress at SBP under 50; algorithms differ on doses and timing, so know
  the local one. Sources: SRFAC 2021 (Ching 2021, Singapore Med J 62:390); ERC 2025 ALS (no major change from 2021);
  RCUK 2025; AHA 2020/2025; NAP7; QRH 2-1, 2-6.

## 11. Light anaesthesia and awareness

- **Patient:** 32-year-old woman, 58 kg, 160 cm, TIVA with rocuronium (the NAP5 high-risk combination). **Start:**
  `maintenance` (TIVA, ETT).
- **Model:** a hidden delivery failure chosen by the seed: the propofol line disconnected or the cannula tissued, the
  pump stopped or the syringe empty; in the volatile variant a vaporiser empty or not seated (end-tidal agent falls
  over 2–5 min, faster at high FGF); effect sites fall; autonomic signs (tachycardia, hypertension, lacrimation,
  sweating) are blunted by opioids; no movement because paralysed; BIS-like index over 60 if processed EEG is on.
- **Expected:** check delivery within 2 min [D] (pump, syringe, the line to the cannula, the cannula itself; agent
  analyser, dial, vaporiser level); deepen within 1–2 min of the first sign [D] (propofol 0.5–1 mg/kg or volatile ≥ 1
  age-adjusted MAC [U doses]; opioid if a painful stimulus); consider midazolam; talk to the patient; no more relaxant
  until depth is assured; document; NAP5 Awareness Support Pathway afterwards.
- **Wrong:** β-blocker or antihypertensive without deepening; more relaxant; blaming the monitor; ignoring the agent
  alarm.
- **Teaching:** neuromuscular block is the main risk factor, so use processed EEG with TIVA and a relaxant (Association
  of Anaesthetists monitoring standards 2021); induction, emergence and transfers are the dangerous moments; check
  delivery before deepening; talk to the patient and follow up. Incidence 1 in 19,600 overall, 1 in 8,200 with
  relaxants, 1 in 670 at caesarean; 51% of experiences were distressing (NAP5). Sources: NAP5 (Pandit 2014, Cook 2014);
  Klein 2021.

## 12. Residual neuromuscular block at emergence

- **Patient:** 70-year-old woman, 50 kg, 152 cm, rocuronium top-up 25 min before the end, mildly cold (35.5 °C).
  **Start:** `emergence` (ETT, top-up at a set time).
- **Model:** the block (`MODEL.md` section 2): the thumb's TOFR lags; the diaphragm (less sensitive) recovers earlier;
  the upper-airway dilator muscles are more sensitive than the thumb, so after extubation at a TOFR under 0.9: rapid
  shallow breathing, upper-airway obstruction, SpO2 falling, CO2 rising, weak cough, distress (a weak, aware patient)
  [D sizes]. Fade can't be felt above a TOFR of about 0.4 (Viby-Mogensen 1985). Cold, volatiles and magnesium prolong
  the block (Heier 1991; Fuchs-Buder 1995; volatiles [S]).
- **Expected:** quantitative TOF at the adductor pollicis before reversal and before extubation; reverse by depth:
  sugammadex 2 mg/kg at TOF count ≥ 2, 4 mg/kg at PTC 1–2, 16 mg/kg for immediate reversal; neostigmine 40–50 mcg/kg
  (never over 5 mg) with glycopyrrolate about 10 mcg/kg (0.2 mg per 1 mg neostigmine; or atropine 15–20 mcg/kg) only at
  minimal block: TOFR ≥ 0.4 (ASA 2023) or > 0.2 (ESAIC 2023), peak effect 5–10 min later (about 5 min in Heier 2002;
  7–10 min in clinical teaching), so wait and measure; extubate at TOFR ≥ 0.9 (ASA 2023: at least 10 min after
  neostigmine if only qualitative monitoring is available); recheck within 2–3 min of sugammadex [D]; if extubated and weak: O2, airway support, measure, sugammadex,
  reassure, reintubate if needed.
- **Wrong:** extubating on clinical signs or time since the dose; neostigmine at deep block; neostigmine over 5 mg or
  without an anticholinergic; under-dosed sugammadex (recurarisation); sugammadex for atracurium; monitoring at the eye.
- **Teaching:** clinical tests can't exclude residual block, so measure; TOFR ≥ 0.9 at the thumb before extubation;
  match drug and dose to the measured depth; neostigmine has a ceiling and a delayed peak; residual block causes
  hypoxaemia, aspiration and distress (Murphy 2008: PACU respiratory events at a mean TOFR of 0.62). Sources: ASA 2023
  (Thilen); ESAIC 2023 (Fuchs-Buder); Klein 2021.
