# MO guide plan (curriculum and fixed ids)

The plan the content was written to. Module, topic, scenario, deck, drug, crisis, tool and figure ids are fixed: keep them.
HB = page in the department's MO handbook (4th edition, 2026; internal, not in this repo). C = core, B = beyond.


Groups (js/content/index.js GROUPS, in this order): start "Start here", before "Before theatre", theatre "In theatre",
oncall "Emergencies and on call", after "After theatre", techniques "Regional and sedation", patients "Special patients",
cases "Common operations", good "Good practice".

Levels: C = core (handbook or first-month essential), B = beyond. HB = handbook page. Every topic starts with a `key`
block; every module has at least 2 `quiz` blocks (3–5 questions each) and most topics end with `links` to related topics,
tools, crisis cards or other site pages. Interactive ids: tools/figures/crises/drugs in IDS.md; scenarios and decks below.

## 1. start: Start here (group start)
- welcome (C) How this guide works and the department's rules: survival tips (HB3); rules for baby MOs: always ask; every
  case with a consultant; never start, end or do a procedure without permission; month 1: never extubate or end a case
  alone, call then WAIT (HB28); first step when anything is out of the ordinary = call for help (HB27); don't draw up E-drugs
  in elective OT unless asked (HB18); in PACU check the anaesthetic chart before giving any drug (HB30); core vs beyond.
  Recommended texts and websites (HB3).
- first-week (C) Your first day and week: be in OT 20–30 min before the 8.30 start: Epic, see the patient, IV, drugs only
  after checking with senior (HB4); read up tomorrow's cases (HB4); who's who in OT (consultant, OTC, AU nurse, OTT, APN,
  scrub nurse, surgeon); tag calls and no calls until the Baby MO test is passed (HB7, clinical part only); link Baby MO
  test (../babymo/). `check` first-week checklist (find the drug trolley and E-drug tray, difficult airway trolley, Bair
  Hugger, suction, how to call for help in OT, check a machine with someone, see 5 premeds…).
- the-list (C) How a list runs, start to finish: set up before the patient comes in (HB18), WHO sign in / time out / sign
  out (B), induction → maintenance → emergence → PACU handover → turnover; seeing premeds after the list and updating the
  consultant (HB8); if the list ends before 4 pm check with the OTC (HB4).
- duties (C) What each duty involves (clinical job scope only, no roster rules): elective OT, EOT, PACU, APS, PEC, 1–9 duty,
  on call, reliever (*), Sunday half call + premeds (HB8–11). A `dl` or table, short.
- drug-safety (C) Drug safety: the RIGHTs (patient, drug, dose, dilution, route, timing, speed, allergies) (HB4); labelling
  every syringe, ISO label colours (figure syringe-labels), check ampoule with a second person, look-alike ampoules,
  high-alert drugs (KCl never as a bolus, insulin, vasopressors), discard unlabelled syringes, don't draw what won't be used
  (HB12). quiz.
- calling-for-help (C) How to call for help and speak up: when (anything you are unsure of; vitals moving; can't oxygenate),
  how (ISBAR script, closed-loop communication), speaking up to seniors and surgeons (graded assertiveness: "I'm concerned…
  I'm uncomfortable… this is unsafe"), escalation from PACU (HB30). `script` blocks.
- competencies (C) The functional MO (HB13): three `check` lists (pre-op, intra-op, post-op) with the handbook's items.

## 2. preop: Pre-op assessment (group before)
- premeds (C) Seeing your premeds: what to find out (cases, how many, patient info: ASA, history, results, airway;
  problems; surgeons) (HB8); check next-day requirements (drugs, special kit, HD/ICU booking) (HB8); update the consultant;
  Friday → Monday's consultant, flag to Sunday half-call MO (HB8); Epic smartphrases ANAPRECLERK, NGEMRANAESPLAN,
  NGEMRANAESPHYONLY (HB38); tool premed.
- history (C) History by system (HB14–15) as a table: cardiac (effort tolerance > 2 flights / 4 METs; high risk: MI within
  6 months, unstable angina, severe AS/MS, uncompensated heart failure; devices and last check), respiratory (recent URTI or
  exacerbation → discuss with consultant), GI, renal (dialysis the day before elective surgery, K), endocrine, CNS/MSK
  (bulbar palsy), allergies, previous anaesthetics, family history (MH, suxamethonium apnoea), fasting.
- medicines (C) Medicines before surgery: continue inhalers, antiepileptics, Parkinson's drugs (bring Madopar to OT),
  thyroid drugs, PPI/H2 (HB14–15); antihypertensives per PEC guideline (B: ACE inhibitor/ARB often omitted on the morning);
  antiplatelets/anticoagulants (HB14 table: aspirin 5–7 d, clopidogrel 7–10 d, ticlopidine 10–14 d, prasugrel 7–10 d,
  dabigatran 5 d, rivaroxaban/apixaban 2 d, LMWH therapeutic 24 h, prophylactic 12 h, warfarin may need heparin cover; the
  surgeon decides when to stop; stents: never stop dual antiplatelets without cardiology; neuraxial: link
  ../spinal/#tq-anticoag); diabetes medicines (B: SGLT2 inhibitors stop 3 days before (ertugliflozin 4) — euglycaemic DKA;
  metformin; insulin plans per guideline); GLP-1 agonists (B: delayed gastric emptying, aspiration risk: tell consultant);
  steroids (B: stress dose hydrocortisone); herbal (B).
- fasting (B) Fasting: food 6 h, clear fluids 2 h (water, clear juice, black tea/coffee), breast milk 4 h, formula 6 h;
  chewing gum and sweets; carbohydrate drinks; when to treat as full stomach (HB23 RSI list); don't starve patients longer
  than needed (keep drinking clear fluids). Link fluids tool.
- airway (C) Examination and airway assessment (HB15–16): no single test predicts; neck extension ≥ 35°, symptoms on
  neck movement, thyromental ≥ 6 cm / 3 fingers, mouth opening ≥ 3 cm / 2 fingers, upper lip bite, dentition (loose teeth,
  crowns, dentures), macroglossia/micrognathia, Mallampati (figure mallampati, figure airway-tests); B: predictors of
  difficult mask ventilation (beard, obesity, no teeth, age > 55, snoring/OSA), difficult SGA, difficult front of neck;
  document and tell your consultant. Lie flat check (HB15). quiz.
- investigations (B) Which tests and which results matter: no routine tests for healthy patients having minor surgery;
  FBC/renal panel/ECG/CXR/clotting/group and screen by age, disease and surgery; HbA1c in diabetics; echo for new murmur or
  breathlessness (ask consultant); act on: K > 5.5 or < 3.0, Hb < 10 or falling, Na < 130, INR > 1.5, platelets < 100,
  new ECG changes — tell consultant.
- asa (C) ASA grade (HB17 table + "E" for emergency) and risk scores (tools stopbang, rcri, apfel; frailty B). quiz of
  ASA examples.
- counselling (C) Counselling and consent (HB18): GA, neuraxial and nerve block risks (table), analgesia options and PCA
  explanation; counsel for all possible techniques, no promises (HB10); `script` for explaining a GA; check understanding;
  record it.
- pec (C) Working in PEC (HB10): be detailed, review old NEHR notes, discuss doubtful cases with the PEC consultant, never
  refer or cancel on your own, counsel all options without promises, read PEC guidelines before your first session; B:
  when optimisation is needed (BP ≥ 180/110, poorly controlled diabetes, anaemia, active cardiac conditions, recent
  URTI/exacerbation) — flag, don't decide.

## 3. setup: Setting up theatre (group theatre)
- before-patient (C) Before the patient comes in (HB18): machine checked, Epic open, E-drugs on a tray (vials out, not drawn
  up in elective OT unless asked: phenylephrine, ephedrine, atropine ± adrenaline) (HB19), basic drug tray for the case,
  extra kit if requested (TCI pumps, BIS/SedLine, block or spinal trolley, ultrasound, arterial line/CVC, Hotline fluid
  warmer) (HB18); suction on; airway kit; `check` OT set-up checklist.
- machine (C) The anaesthetic machine and its check (B detail): pipeline pressures, backup O2 cylinder, O2 failure alarm,
  flowmeters, vaporiser filled and seated, circuit leak test and two-bag test, APL valve, ventilator, CO2 absorbent colour,
  scavenging, suction, self-inflating bag as backup; figure circle-system. quiz.
- trolley (C) The drug trolley and E-drugs (HB19–22): what is in each drawer (figure drug-drawers; link drawer game
  #/practice/drawers), E-drug tray, the basic drug tray; green note on not drawing up what you won't use (HB12).
- monitoring (C) Monitoring (HB13 "basic ASA monitors"): ECG, NIBP (cycle 3–5 min), SpO2, capnography (figure capnography:
  no trace = wrong place), FiO2/agent, airway pressure, temperature for long cases, NMB monitoring (figure tof); set alarms;
  what each tells you. quiz.
- airway-kit (C) Airway equipment: face masks, oropharyngeal/nasopharyngeal airways (sizing), SGA sizes by weight (i-gel/LMA
  3 for 30–50 kg, 4 for 50–70 kg, 5 for 70–100 kg), tracheal tubes (women 7.0, men 8.0; length about 21 cm women, 23 cm men
  at the teeth), Macintosh blades 3/4, video laryngoscope, bougie, stylet, cuff syringe, tape, bite block; know where the
  difficult airway trolley is. figure lma.
- iv-lines (B) IV access and fluids: cannula sizes and flow (18 G about 100 mL/min, 16 G 200, 14 G 300), 3-way extension,
  priming without air, fluid warmer (Hotline), Bair Hugger, pressure bags; arterial line set-up (transducer, pressure bag
  300 mmHg, zero at the level of the heart) (HB18 IA/CVC).
- tiva-eeg (C) TIVA, TCI pumps and EEG monitoring (HB24–26): pumps Agilia and B. Braun Space plus, models (propofol Schnider
  or Eleveld; remifentanil Minto or Eleveld — ask your senior), attend pump training; check the line runs especially after
  a syringe change (HB27); BIS and SedLine strongly recommended with TIVA; BIS 40–60 (B).

## 4. induction: Induction and the airway (group theatre)
- ga-steps (C) The 16 steps of a GA induction (HB23) as `steps`; preoxygenate to EtO2 > 80% (handbook) and aim for 90% or
  more (B); check yourself quiz.
- preoxygenation (B) Preoxygenation and apnoea time: why (oxygen reservoir in the lungs), how (tight seal, 3 min tidal
  breathing or 8 deep breaths, head up 20–30°, EtO2 ≥ 90%), who desaturates fast (obese, pregnant, children, sick),
  high-flow nasal oxygen (consultant's choice).
- induction-drugs (C) Induction drugs: drug blocks for propofol, ketamine, etomidate, thiopentone, fentanyl; reduce for
  elderly, frail, shocked; give slowly and watch; opioid co-induction; `drugs` block.
- mask-ventilation (C) Bag-mask ventilation (HB23 steps 6–9): confirm you can bag before giving muscle relaxant, APL 20 cmH2O,
  Vt 6–8 mL/kg, one-hand C-E grip, two-hand technique, oral/nasal airway, signs of good ventilation (chest rise, capnography
  trace, bag movement), when it's hard: call.
- sga (C) Supraglottic airways (LMA, i-gel): sizes, insertion technique, checks (capnography, no leak, chest rise), common
  problems (laryngospasm, malposition, leak) and fixes; figure lma.
- intubation (C) Intubation: positioning (sniffing, ramp for obese), laryngoscopy steps, bougie, confirm with sustained
  capnography (no trace = wrong place), bilateral chest rise and air entry (HB23), tube depth, cuff pressure 20–30 cmH2O,
  securing; quiz.
- rsi (C) Rapid sequence induction (HB23): who (list), what's different (cricoid pressure, no bagging until tube confirmed,
  precalculated doses in quick succession, suxamethonium 1–1.5 mg/kg total weight or rocuronium 1 mg/kg lean weight); B:
  gentle mask ventilation if desaturating (consultant decides), head up, suction ready, failed-intubation plan, sugammadex
  16 mg/kg ready with rocuronium; tool rsi; scenario rsi-appendix.
- difficult-airway (B) When it's difficult: Difficult Airway Society plans A–D (max 3 + 1 attempts; SGA rescue; wake up or
  continue; can't intubate can't oxygenate → front of neck access scalpel–bougie–tube), your role as MO (call, get the
  trolley, time, oxygen, say "CICO"); crisis failed-intubation, crisis cico.

## 5. maintenance: During the case (group theatre)
- vigilance (C) Staying vigilant (HB27): never leave the patient; check monitors continuously; anticipate stimulation
  (incision, intubation, pneumoperitoneum, tourniquet) to avoid swings; watch blood loss in long or major cases; if something
  is amiss, check with the consultant; ask before topping up muscle relaxant (surgeons may be finishing); TIVA checks after
  syringe changes; keep the chart.
- depth (C) Depth of anaesthesia (HB33): MAC, MAC-BAR, MAC-awake; sevoflurane 1 MAC 2–2.2% (less with age and opioids),
  desflurane 6–6.6% (not stocked in OT, must be requested); signs of light anaesthesia (tachycardia, hypertension, movement,
  tears); awareness: who is at risk (TIVA without EEG, RSI, muscle relaxant); BIS 40–60.
- ventilation (B) Ventilator basics: volume vs pressure control, Vt 6–8 mL/kg ideal weight, PEEP 5 cmH2O, rate to EtCO2
  35–45 mmHg, FiO2 0.3–0.5 if well, recruitment (consultant), peak pressure alarms; fresh gas flow: sevoflurane compound A
  at < 2 L/min (handbook) vs low-flow for the environment — follow your consultant.
- fluids-blood (C) Fluids and blood (HB37): 4-2-1, deficit, insensible losses 3–15 mL/kg/h, blood loss replacement 1:1
  colloid 1:3 crystalloid, ABL formula; B: balanced crystalloid (Hartmann's), don't over-fill, transfusion around Hb 7
  (8 in heart disease) with the consultant, blood checking at the bedside; tools fluids, abl.
- temperature-positioning (B) Temperature and positioning: warm (Bair Hugger, warm fluids), keep > 36 °C, measure in cases
  > 30 min; positions (supine, lithotomy, lateral, prone, head up): pressure points, eyes taped (HB23), arms < 90°, ulnar and
  common peroneal nerves; angle board for the circuit (HB23).
- nmb (C) Muscle relaxants and monitoring: suxamethonium vs non-depolarising (HB34); TOF count and ratio (figure tof); top
  ups only after asking (HB27); quantitative monitoring; residual block risks.
- antibiotics (B) Antibiotic prophylaxis: within 60 min before incision (cefazolin can be given at induction), redose
  cefazolin after 4 h or major blood loss (> 1.5 L), 3 g at ≥ 120 kg; penicillin allergy history matters; the surgical
  protocol decides the drug; give slowly and watch (anaphylaxis is often the antibiotic).
- problems-breathing (C) When breathing or oxygen goes wrong (the handbook's page-27 summary, rewritten): low SpO2 (check
  the patient-to-machine path: DOPES: displacement, obstruction, pneumothorax, equipment, stacking; FiO2 100%, hand
  ventilate), high airway pressure, low/absent EtCO2, high EtCO2; first step call for help; link crises hypoxia,
  high-airway-pressure, bronchospasm, laryngospasm, aspiration.
- problems-circulation (C) When the circulation goes wrong: hypotension (causes: drugs, bleeding, position, pneumoperitoneum,
  anaphylaxis, arrhythmia; first steps: check, tell, reduce agent, fluids, phenylephrine/ephedrine boluses per consultant),
  hypertension and tachycardia (light, pain, CO2, hypoxia), bradycardia (surgical vagal stimulus: ask surgeon to stop;
  atropine/glycopyrrolate), arrhythmias; link crises hypotension, bradycardia, tachycardia, haemorrhage, anaphylaxis.

## 6. emergence: Waking up and handover (group theatre)
- end-of-case (C) Ending a case (HB28–29): month-1 rule (never alone, call then wait); extubation criteria (spontaneous
  breathing; TOF ratio > 0.9 before awakening and extubation; RR 10–30; tidal volume above dead space 2 mL/kg — usually aim
  ≥ 5 mL/kg; SpO2 > 98% on 100% O2; haemodynamically stable); steps (bite block beforehand, call AU nurse, agent off,
  100% O2, flows > 6 L/min, reversal, suction, wait to wake, remove device, to PACU); `steps`; quiz.
- reversal (C) Reversal: neostigmine 2.5 mg (0.05 mg/kg, max 5 mg B) with glycopyrrolate 0.4 mg or atropine 0.9 mg (HB29,
  35); works only once there is some recovery (TOF count ≥ 2–4); sugammadex 2 mg/kg at TOF count 2, 4 mg/kg for deep block
  (PTC 1–2), 16 mg/kg immediate (rocuronium only); drug blocks.
- emergence-problems (B) Problems on waking: laryngospasm, coughing and bucking, airway obstruction, desaturation,
  emergence agitation, slow to wake (drugs, residual block, CO2, temperature, glucose, stroke); awake vs deep extubation is
  the consultant's call; crisis laryngospasm.
- handover (C) Handing over to PACU (HB29): the handbook list with its worked example as a `script`; tool handover.

## 7. pacu: PACU (group after)
- pacu-job (C) Your job in PACU (HB9, HB30): present 8.30–5.30, receive every handover, minimum 30 min monitoring, nurse
  alerts → see now, ABC and vitals, notes for allergies, CHECK THE ANAESTHETIC CHART BEFORE GIVING ANYTHING, simple problems
  (pain, PONV) yours, persistent or severe → primary anaesthetist or OTC, HD/ICU decisions → senior; hand over at 5.30 pm.
- pain (C) Pain in PACU: assess (score, site, type), check the chart for what was given, check a block's state, IV
  titration (morphine 1–2 mg or fentanyl 10–25 mcg every 5 min, review sedation and breathing between doses; stop if drowsy
  or RR < 10), paracetamol and NSAID if not given, PCA; when to call.
- ponv (C) Nausea and vomiting: risk (tool apfel), prevention (dexamethasone 4–8 mg at induction, ondansetron 4 mg at the end
  per handbook doses), rescue with a drug from a different class than prophylaxis (metoclopramide 10 mg, haloperidol low
  dose B), non-drug causes (pain, hypotension, hypoxia, blood in stomach, anxiety).
- pacu-problems (C) Other PACU problems (HB30 list): drowsy/confused/restless (hypoxia, hypercapnia, hypoglycaemia, pain,
  full bladder, drugs, delirium), hypertension, hypotension, tachy and brady arrhythmias, desaturation (airway, residual
  block, opioids, atelectasis, pulmonary oedema), hypothermia and shivering (warming; pethidine 25 mg B); crises
  opioid-overdose, neck-haematoma, hypoglycaemia.
- discharge (C) Discharge from PACU (HB30–31): fast track for MAC eye cases with no drugs (primary anaesthetist decides),
  HD transfers taken by the primary MO with a PACU discharge note, nurse-led discharge inclusion and exclusion criteria,
  everyone else discharged by you when stable; tool aldrete; destinations GW, GW with VitalScout monitoring, HD, ICU.

## 8. pain-aps: Pain and the APS (group after)
- aps (C) The acute pain service (HB9–10): week-long duty, rounds with consultant and pain nurses, single-shot block and
  spinal reviews, weekend rounds alone then report, job scope list, referrals (inform the APS consultant), handover.
- analgesics (C) Analgesic options (HB18): paracetamol, NSAIDs/COX-2 (parecoxib; contraindications: renal impairment,
  active ulcer, bleeding, asthma sensitive to NSAIDs, late pregnancy), tramadol, morphine, oxycodone, multimodal approach,
  renal dosing (HB33: morphine metabolites accumulate); drugs block.
- pca (C) PCA (HB18): how it works, typical settings (e.g. morphine 1 mg bolus, 5 min lockout, no background; fentanyl
  10–20 mcg bolus), explaining it to patients, monitoring (sedation score, RR), side effects (nausea, itch, sedation,
  respiratory depression → naloxone), only the patient presses.
- epidurals (B) Epidurals and catheters: checking a block (cold, both sides, height), top-ups and infusion changes only per
  APS consultant, problems (hypotension, too high, one-sided, motor block that is dense or increasing = urgent: rule out
  epidural haematoma or abscess), catheter removal and anticoagulant timing (link ../spinal/#tq-anticoag).
- after-blocks (C) After a nerve block or spinal: post-block instructions (smartphrases POSTPNBINSTR1, POSTSPINAL), protect
  the numb limb, rebound pain when the block wears off (start oral analgesia early), red flags (new weakness, severe back
  pain, signs of LAST), APS referral (HB29).

## 9. regional: Regional basics (group techniques)
- ra-role (C) Your role in regional anaesthesia (HB29): never on your own at first, read up the night before, check for
  contraindications, IV and standard monitoring before starting, paperwork after (procedure note, post-block instructions,
  APS referral); resources nysora.com, usra.ca; links to the site apps: ../spinal/, ../truncal/, ../lower-limb/,
  ../head-neck/, ../brachial-plexus/, ../regional.html.
- spinal-help (C) Helping with a spinal: kit and asepsis, positioning (sitting or lateral), drugs (heavy bupivacaine), after:
  watch BP every 2–3 min, treat hypotension (phenylephrine boluses), test block height, warm the patient; link ../spinal/;
  scenario spinal-hypotension.
- la-safety (C) Local anaesthetic safety (HB34–35): maximum doses lignocaine 3 mg/kg (7 with adrenaline), bupivacaine 2,
  ropivacaine 3 (tool la-max), doses add up, aspirate and inject slowly, "stop before you block" (mark the side), signs of
  LAST and the lipid regimen (crisis last; drug intralipid).
- block-contraindications (B) Contraindications and anticoagulants: patient refusal, infection at site, allergy,
  coagulopathy; anticoagulant timing for neuraxial and deep blocks (link ../spinal/#tq-anticoag), pre-existing nerve
  deficits documented.

## 10. sedation: Sedation and MAC (group techniques)
- mac (C) Monitored anaesthesia care (HB30): no one size fits all; techniques (TCI propofol, dexmedetomidine, ketamine,
  midazolam, fentanyl, alfentanil; none for some cataracts); always ask the sedation plan before drawing up; levels of
  sedation (minimal → general), monitoring with capnography, oxygen, airway kit ready, the patient must stay responsive.
- sedation-drugs (C) Sedation drugs and their reversal: drug blocks for midazolam, dexmedetomidine, ketamine, alfentanil,
  remifentanil, propofol; flumazenil and naloxone; elderly need far less.
- eye-cases (B) Eye cases: topical/sub-Tenon's blocks, lying flat and still, the oculocardiac reflex (bradycardia),
  claustrophobia, fast-track discharge (HB30).

## 11. patients: Special patients (group patients)
- obesity (C) Obesity: dosing weights table (propofol induction lean, maintenance adjusted or total; fentanyl lean;
  suxamethonium total; rocuronium ideal or lean; sugammadex total; neostigmine total max 5 mg; local anaesthetics lean;
  antibiotics total), ramped position, preoxygenation head up, OSA, RSI considerations, VTE prophylaxis; tool weights.
- osa (C) Sleep apnoea: STOP-BANG (tool), bring CPAP, opioid-sparing, extubate fully awake and sitting up, monitored bed.
- older (B) Older and frail patients: less drug (half doses), delirium risk and prevention, frailty, hip fracture, blood
  pressure targets, glasses and hearing aids, consent and capacity.
- diabetes (C) Diabetes: first on the list, glucose targets (6–10 mmol/L, act above 12), insulin and oral drug plans per the
  guideline, SGLT2 inhibitors (euglycaemic DKA; stop 3 days before), hypoglycaemia treatment (crisis hypoglycaemia), poorly
  controlled DM delays gastric emptying (RSI) (HB23).
- heart (C) Heart disease: hypertension (thresholds per PEC guideline; ≥ 180/110 flag), IHD and stents (dual antiplatelets:
  never stop without cardiology), heart failure, aortic stenosis (avoid hypotension and tachycardia), AF and anticoagulation,
  pacemakers and ICDs (device details and last check, diathermy, where the magnets are kept per local policy; vendor
  on-call numbers are on the intranet).
- lungs (C) Lung disease: asthma (continue inhalers, salbutamol before, avoid triggers), COPD, recent URTI (discuss; often
  postpone elective cases within 2–4 weeks with symptoms), smoking.
- kidney-liver (C) Kidney and liver disease: dialysis the day before, potassium, fistula arm (no BP or IV), drug choice
  (atracurium; morphine accumulates), cirrhosis (clotting, low albumin, encephalopathy, drug sensitivity).
- neuro (B) Neurological disease: Parkinson's (give medicines on time, bring Madopar, avoid metoclopramide and haloperidol),
  epilepsy (continue drugs), stroke (timing, BP), neuromuscular disease and suxamethonium (HB34), bulbar palsy and aspiration.
- children (B) Children: the basics: weight estimate and doses (tool paeds), fasting, parents, gas induction with
  sevoflurane, laryngospasm risk, tube and LMA sizes, fluids and glucose; children are anaesthetised with a consultant.
- pregnancy (B) Pregnancy basics: aspiration risk and RSI from mid-pregnancy, left uterine displacement after 20 weeks,
  difficult airway, spinal for caesarean section and its hypotension (phenylephrine), non-obstetric surgery in pregnancy;
  pregnancy test before surgery in women of child-bearing age.
- allergy-history (C) Allergies and anaesthetic family history: true allergy vs side effect, common culprits
  (muscle relaxants, antibiotics, chlorhexidine, latex), penicillin allergy and cefazolin, MH susceptibility (no volatiles or
  suxamethonium; clean machine), suxamethonium apnoea (pseudocholinesterase deficiency).

## 12. emergencies: Emergencies and on call (group oncall)
- eot (C) The emergency list (HB9): machine and emergency drugs before 8.30 handover at reception, post-call handover,
  e-board, pre-clerk new cases, inform consultant and OTC of anything amiss, send for cases in good time.
- on-call (C) On call (HB10–11, clinical parts): report to the on-call specialist at 5 pm, pre-clerk e-board cases and flag
  issues, relieve each other, pre-clerk remaining cases before going post call; 1–9 duty and Sunday half call clinical
  tasks (blue letters, premeds).
- sick-patient (C) The sick emergency patient: full stomach (RSI), sepsis and hypovolaemia (resuscitate first, vasopressor
  ready, arterial line, reduced induction dose: ketamine or etomidate), blood products and massive transfusion (crisis
  haemorrhage), HD/ICU booking via your senior; scenario rsi-appendix.
- transfers (B) Moving a sick patient (to HD, ICU, CT): checklist (monitors, full O2 cylinder and how long it lasts, self-
  inflating bag, drugs, suction, IV access, notes), the primary MO transports HD patients from PACU (HB30).

## 13. cases: Common operations (group cases) — all B; each topic: the usual anaesthetic, airway, analgesia, positioning,
pitfalls, what to prepare; "ask your consultant" for their plan.
- laparoscopic (B) Laparoscopic abdominal surgery (cholecystectomy, appendicectomy, hernia): pneumoperitoneum effects
  (bradycardia on insufflation, high airway pressure, CO2 rise, shoulder tip pain), ETT, PONV, port-site LA.
- laparotomy (B) Emergency laparotomy: RSI, sick patient, arterial line, warming, epidural or rectus sheath, HD/ICU.
- hip-fracture (B) Hip fracture: frail elderly, spinal (plain bupivacaine small dose, link ../spinal/) or GA, fascia iliaca
  block, cement implantation syndrome, delirium, blood.
- joints (B) Knee and hip replacement: spinal ± sedation, blocks (adductor canal, link ../lower-limb/), tourniquet,
  tranexamic acid, antibiotics before tourniquet, early mobilisation.
- urology (B) TURP and TURBT: spinal, TURP syndrome (hyponatraemia, confusion, bradycardia), obturator jerk, lithotomy,
  bleeding; ureteroscopy under GA with LMA.
- gynae-breast (B) Gynaecology and breast day surgery: hysteroscopy/D&C (LMA, short), laparoscopic gynaecology (Trendelenburg,
  PONV), breast surgery (PONV, blocks).
- ent-thyroid (B) Shared airway: tonsillectomy (reinforced tube or RAE, bleeding tonsil = RSI and senior), thyroidectomy
  (neck haematoma: crisis neck-haematoma), nasal surgery (throat pack, remove it).
- eye-ortho-day (B) Eye and limb day cases: cataract MAC (fast track), ankle/wrist ORIF with blocks (the handbook's PACU
  example), rebound pain.

## 14. good: Good practice (group good)
- documentation (C) Documentation and Epic: the anaesthetic chart (times, drugs with doses, vitals, events), preclerk and
  plan smartphrases (HB38 list), procedure notes for blocks, PACU discharge note, record counselling.
- green (C) Green anaesthesia (HB12, HB33): all volatiles are greenhouse gases, desflurane worst, nitrous oxide lasts about
  109 years; low flows, TIVA or regional when suitable, don't draw up or open what you won't use, recycling rules (separate,
  clean only, fluid bags beside recycling bags, no blood-stained items).
- learning (C) Learning in the posting: reading (HB3 texts and websites; BJA Education, WFSA tutorial of the week, NYSORA),
  teaching sessions (attendance taken, HB4), ask for feedback, the Baby MO test (../babymo/), this guide's practice section.
- wellbeing (B) Looking after yourself: fatigue after calls, eating and breaks, asking for relief, after a bad event (debrief,
  talk to someone), the team.

## Scenarios (js/data/scenarios.js; ids fixed)
1 first-induction (core) Your first induction: preox, induction, can't bag well → adjuncts, two hands, call; good outcome.
2 desat-intubated (core) SpO2 falling after intubation: check the capnograph (oesophageal?), DOPES, endobronchial, bronchospasm.
3 hypotension-induction (core) BP 70/40 after propofol in a 78-year-old: call, phenylephrine/ephedrine, fluids, reduce agent.
4 anaphylaxis-antibiotic (core) Rash, BP drop and wheeze after cefazolin: recognise, adrenaline, stop trigger, help, tryptase.
5 laryngospasm-emergence (core) Stridor and no ventilation after removing an LMA: jaw thrust, CPAP 100% O2, deepen, sux.
6 pacu-pain-ponv (core) PACU: pain 8/10 and nausea: check the chart first, titrate, antiemetic from a different class.
7 pacu-drowsy (core) PACU: drowsy with RR 7 and pinpoint pupils: stimulate, O2, naloxone titration, call; check residual block.
8 premed-flags (core) A premed: diabetic on empagliflozin and apixaban, loose tooth, OSA: what to flag to the consultant.
9 rsi-appendix (core) EOT: appendicectomy, ate 3 hours ago: plan an RSI with your consultant; failed first look → plan B.
10 spinal-hypotension (core) TURP under spinal: BP falls and the patient feels sick: treat, check height, fluids.
11 pacu-discharge (core) Who can go: three PACU patients, apply nurse-led discharge criteria and Aldrete.
12 last-block (beyond) Tinnitus and a seizure after a block: stop, call, airway, benzodiazepine, intralipid, CPR ready.
13 cant-intubate (beyond) Failed intubation: SGA rescue, wake up, CICO declaration.
14 brady-pneumoperitoneum (beyond) HR 35 on insufflation: tell the surgeon to stop/deflate, atropine/glycopyrrolate.

## Flashcard decks (js/data/cards.js; deck ids fixed)
doses (Drug doses from the handbook), dilutions (How to draw up), numbers (Numbers to know: extubation criteria, airway
tests, MAC values, fasting, 4-2-1, ABL, blood volumes, LA maximums), asa (ASA grades by example), stopping (Stopping
blood thinners before surgery), crisis (First actions in a crisis), kit (Sizes and equipment), local (NTFGH: where things
are, smartphrases, rules for baby MOs).

## Amendments (15 Oct, after a gap check against the handbook)

Additions and corrections from the gap check were applied to the content on 15 Oct 2026. Corrections to the source
handbook were raised privately with the department; the guide already uses the corrected values.

## Fixed ids for the MO guide (all authors use exactly these)

## Drug ids
drugs-core.js (groups induction, opioid, nmb, reversal, la, emergency):
propofol, ketamine, etomidate, thiopentone, midazolam, dexmedetomidine,
fentanyl, morphine, oxycodone, remifentanil, alfentanil, tramadol, pethidine,
suxamethonium, rocuronium, atracurium,
neostigmine, glycopyrrolate, sugammadex, naloxone, flumazenil,
lignocaine, bupivacaine, bupivacaine-heavy, ropivacaine, levobupivacaine,
atropine, intralipid, dantrolene, salbutamol, magnesium, hydrocortisone, amiodarone, adenosine, calcium-chloride,
calcium-gluconate, dextrose

drugs-more.js (groups vasopressor, hypotensive, antiemetic, analgesic, antibiotic, other):
adrenaline, noradrenaline, phenylephrine, ephedrine, vasopressin,
esmolol, labetalol, hydralazine, gtn,
dexamethasone, ondansetron, metoclopramide, haloperidol,
paracetamol, parecoxib,
cefazolin, amoxicillin-clavulanate, clindamycin, metronidazole, vancomycin,
potassium-chloride, insulin, tranexamic-acid
also in drugs-more.js, group inhalational: sevoflurane, desflurane, nitrous-oxide (doses as text: 1 MAC etc.)

Special dose labels the calculators look for:
- RSI drug sheet (tool `rsi`): propofol, ketamine, etomidate, thiopentone, fentanyl, suxamethonium, rocuronium each have
  a dose with `label: 'RSI'`; sugammadex has a dose with `label: 'Immediate reversal'` (16 mg/kg).
- Infusion calculator (tool `infusions`): noradrenaline (`infusionConc` 0.08 mg/mL, dose unit mcg/kg/min),
  adrenaline (`infusionConc` 0.08 mg/mL, mcg/kg/min), vasopressin (conc 1 U/mL, U/h), dexmedetomidine (conc 4 mcg/mL,
  mcg/kg/h), phenylephrine (mcg/min; give `infusionConc` only if a standard strength is known, else text).

## Crisis ids (js/data/crises.js)
anaphylaxis, last, mh, cico, failed-intubation, laryngospasm, bronchospasm, hypoxia, hypotension, bradycardia,
tachycardia, cardiac-arrest, high-spinal, haemorrhage, aspiration, high-airway-pressure, hyperkalaemia,
opioid-overdose, hypoglycaemia, neck-haematoma, equipment-failure

## Tool ids (js/tools.js)
weights, rsi, la-max, infusions, fluids, abl, convert, stopbang, apfel, rcri, aldrete, paeds, premed, handover

## Figure ids (js/figures.js)
mallampati, airway-tests, drug-drawers, syringe-labels, circle-system, tof, capnography, lma
