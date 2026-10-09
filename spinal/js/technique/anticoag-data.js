// Antithrombotic intervals for a single-shot spinal.
// ASRA 5th ed. (2025; Kopp SL et al., Reg Anesth Pain Med, doi 10.1136/rapm-2024-105766) values were read in
// the full text and checked recommendation by recommendation. ESAIC/ESRA 2022 values were read in the full text
// (Table 3 and recommendations R1–R40). Wording is ours. "—" = not addressed in that guideline.
//
// stop = minimum time from the last dose to the spinal puncture.
// next = minimum time from the puncture to the next dose, or the catheter rule the source gives.

// ESAIC/ESRA gives DOAC restarts only as "after catheter removal" (R4). That is not a single-shot time and must
// never read as "restart straight away". Table 3's "about 24 h after surgery" was checked only for dabigatran
// high dose, so the other DOACs carry this wording until the owner checks Table 3 drug by drug.
const ESAIC_DOAC_NEXT = 'No single-shot time given (only “after catheter removal”). Not straight away: agree timing with the surgical team, by bleeding risk';

export const GROUPS = [
  'Antiplatelet drugs',
  'Heparins',
  'Fondaparinux',
  'Vitamin K antagonist',
  'Direct oral anticoagulants (DOACs)',
  'Other',
];

export const DRUGS = [
  // ------------------------------------------------------------ antiplatelets
  {
    id: 'aspirin-low', group: 'Antiplatelet drugs', name: 'Aspirin, low dose', dose: 'ESAIC/ESRA: under 200 mg a day',
    asra: { stop: 'No added precautions', next: 'No restriction' },
    esaic: { stop: 'None needed (0)', next: 'Next dose at the usual time' },
    note: 'ESAIC/ESRA: not a contraindication if the risk–benefit balance is favourable; a single-shot spinal is preferred to an epidural.',
  },
  {
    id: 'aspirin-high', group: 'Antiplatelet drugs', name: 'Aspirin, high dose', dose: 'ESAIC/ESRA: 200 mg a day or more',
    asra: { stop: 'No separate high-dose rule: aspirin is covered by the NSAID recommendation (no added precautions)', next: 'No restriction' },
    esaic: { stop: '3 days (normal platelet count) to 7 days', next: '6 h or more after the puncture' },
    note: 'ASRA 2025 treats aspirin with other NSAIDs: no specific timing concerns for a single-shot spinal or a catheter (it lists invasive pain procedures as an exception).',
  },
  {
    id: 'nsaids', group: 'Antiplatelet drugs', name: 'NSAIDs', dose: 'Non-aspirin NSAIDs',
    asra: { stop: 'No added precautions', next: 'No restriction' },
    esaic: { stop: 'Outside the guideline’s scope', next: '—' },
    note: 'ESAIC/ESRA suggests avoiding NSAIDs combined with anticoagulants around neuraxial blocks.',
  },
  {
    id: 'clopidogrel', group: 'Antiplatelet drugs', name: 'Clopidogrel', dose: '',
    asra: { stop: '5–7 days', next: 'Without a loading dose: straight away. With a loading dose: 6 h' },
    esaic: { stop: '5–7 days', next: '75 mg: without delay. 300 mg loading dose: 2 days or more' },
    note: 'Restart times in both guidelines are written around catheter removal; for a single-shot spinal there is no catheter. ASRA: a catheter may stay 1–2 days on clopidogrel if no loading dose is given.',
  },
  {
    id: 'prasugrel', group: 'Antiplatelet drugs', name: 'Prasugrel', dose: '',
    asra: { stop: '7–10 days', next: 'Straight away, or 6 h if a loading dose is given' },
    esaic: { stop: '7 days', next: '24 h or more' },
    note: 'ASRA: do not keep a neuraxial catheter in a patient taking prasugrel.',
  },
  {
    id: 'ticagrelor', group: 'Antiplatelet drugs', name: 'Ticagrelor', dose: '',
    asra: { stop: '5 days', next: 'Straight away, or 6 h if a loading dose is given' },
    esaic: { stop: '5 days', next: '24 h or more' },
    note: 'The previous ASRA edition said 5–7 days. ASRA: do not keep a neuraxial catheter in a patient taking ticagrelor.',
  },
  {
    id: 'cilostazol', group: 'Antiplatelet drugs', name: 'Cilostazol', dose: '',
    asra: { stop: '2 days', next: '6 h (after catheter removal)' },
    esaic: { stop: '—', next: '—' },
    note: '',
  },
  {
    id: 'cangrelor', group: 'Antiplatelet drugs', name: 'Cangrelor', dose: 'IV, short acting',
    asra: { stop: '3 h', next: '8 h (after catheter removal)' },
    esaic: { stop: 'Mentioned only as a bridging drug', next: '—' },
    note: '',
  },
  {
    id: 'gp2b3a', group: 'Antiplatelet drugs', name: 'GP IIb/IIIa inhibitors', dose: 'Abciximab; eptifibatide or tirofiban',
    asra: { stop: 'Abciximab 24–48 h. Eptifibatide or tirofiban 4–8 h', next: 'No timed rule. If given after a block, monitor neurology closely' },
    esaic: { stop: 'Not included (intensive care drugs)', next: '—' },
    note: 'Rarely relevant to an elective spinal.',
  },
  // ------------------------------------------------------------ heparins
  {
    id: 'ufh-sc-low', group: 'Heparins', name: 'Unfractionated heparin SC, low dose', dose: 'e.g. 5000 units two or three times a day',
    asra: { stop: '4–6 h, or normal coagulation', next: 'Straight away' },
    esaic: { stop: '4 h', next: 'As for routine VTE prophylaxis' },
    note: 'Check the platelet count if heparin has been given for more than 4 days (heparin-induced thrombocytopenia).',
  },
  {
    id: 'ufh-sc-high', group: 'Heparins', name: 'Unfractionated heparin SC, higher dose', dose: 'ASRA: 7,500–10,000 units twice a day, or 20,000 units a day or less (12 h tier); over 10,000 units a dose or over 20,000 units a day (24 h tier)',
    asra: { stop: '12 h with normal coagulation. Over 10,000 units a dose, or over 20,000 units a day: 24 h with normal coagulation', next: 'Individual decision' },
    esaic: { stop: '12 h, or normal aPTT / anti-Xa / ACT', next: '—' },
    note: '',
  },
  {
    id: 'ufh-iv', group: 'Heparins', name: 'Unfractionated heparin IV', dose: 'Infusion',
    asra: { stop: '4–6 h, and confirm normal coagulation', next: '1 h or more after the needle' },
    esaic: { stop: '6 h, or normal aPTT / ACT / anti-Xa', next: '—' },
    note: 'ASRA, if a catheter is used: remove it 4–6 h after the last dose with coagulation checked, and restart heparin 1 h after removal. Neuraxial block is not recommended with full heparinisation for cardiopulmonary bypass.',
  },
  {
    id: 'lmwh-low', group: 'Heparins', name: 'LMWH, low dose', dose: 'e.g. enoxaparin 40 mg once daily',
    asra: { stop: '12 h', next: 'Once daily: first dose 12 h or more after the puncture. Twice daily: first dose the next day, and 12 h or more after the puncture' },
    esaic: { stop: '12 h. CrCl under 30 mL/min: 24 h (or halve the dose)', next: 'As for routine VTE prophylaxis' },
    note: 'ASRA: an anti-Xa level of 0.1 IU/mL or less may support an earlier block. Platelet count if on heparin for more than 4 days. ASRA: after a bloody tap, start LMWH 24 h after surgery and agree it with the surgeon.',
    renal: true,
  },
  {
    id: 'lmwh-high', group: 'Heparins', name: 'LMWH, high dose', dose: 'e.g. enoxaparin 1 mg/kg twice daily or 1.5 mg/kg daily',
    asra: { stop: '24 h', next: '24 h after surgery with ordinary bleeding risk; 48–72 h after high-bleeding-risk surgery. Never sooner than 24 h after the puncture' },
    esaic: { stop: '24 h. CrCl under 30 mL/min: 48 h, or anti-Xa 0.1 IU/mL or less', next: 'About 24 h after surgery' },
    note: 'ASRA: consider an anti-Xa level if under 24 h, especially over 75 years or CrCl 30 mL/min or less.',
    renal: true,
  },
  // ------------------------------------------------------------ fondaparinux
  {
    id: 'fondaparinux-low', group: 'Fondaparinux', name: 'Fondaparinux, low dose', dose: '2.5 mg daily',
    asra: { stop: '36 h (younger) to 42 h (older). CrCl 30–50 mL/min: 58 h or more. CrCl under 30: avoid', next: '6 h or more (after catheter removal)' },
    esaic: { stop: '36 h. CrCl under 50 mL/min: 72 h (or reduce dose to 1.5 mg)', next: 'As for routine VTE prophylaxis' },
    note: 'ASRA: to go earlier than these times, a fondaparinux-calibrated anti-Xa of 0.1 IU/mL or less is the suggested threshold.',
    renal: true,
  },
  {
    id: 'fondaparinux-high', group: 'Fondaparinux', name: 'Fondaparinux, high dose', dose: '5–10 mg daily',
    asra: { stop: '70 h or more (younger); 105 h or more (older)', next: '—' },
    esaic: { stop: 'Neuraxial block not recommended. If unavoidable: about 4 days and a normal calibrated anti-Xa', next: '—' },
    note: '',
  },
  // ------------------------------------------------------------ VKA
  {
    id: 'warfarin', group: 'Vitamin K antagonist', name: 'Warfarin', dose: '',
    asra: { stop: '5 days and a normal INR', next: 'Catheter rules only (INR under 1.5 for removal)' },
    esaic: { stop: '5 days and a normal INR. INR under 1.5 only after an individual risk–benefit decision', next: 'Restart after any catheter is out' },
    note: 'ESAIC/ESRA: in an emergency, a block is possible once fully reversed (PCC plus vitamin K). ASRA, with a catheter: remove at INR under 1.5 (1.5–3: with caution; over 3: hold or reduce the dose), then check neurology for 48 h.',
  },
  // ------------------------------------------------------------ DOACs
  {
    id: 'dabigatran-low', group: 'Direct oral anticoagulants (DOACs)', name: 'Dabigatran, low dose', dose: '220 mg daily (150 mg with dose adjustment)',
    asra: { stop: '48 h. CrCl under 30 mL/min: avoid unless level under 30 ng/mL', next: '6 h or more' },
    esaic: { stop: '48 h', next: ESAIC_DOAC_NEXT },
    note: '',
    renal: true,
  },
  {
    id: 'dabigatran-high', group: 'Direct oral anticoagulants (DOACs)', name: 'Dabigatran, high dose', dose: '150 mg twice daily (110 mg twice daily)',
    asra: { stop: 'CrCl 50 or more: 72 h. CrCl 30–49: 120 h. Under 30: avoid unless level under 30 ng/mL', next: '24 h or more' },
    esaic: { stop: '72 h. CrCl under 50 mL/min: level under 30 ng/mL or normal thrombin time', next: 'About 24 h after surgery' },
    note: 'Renal function changes the interval most for dabigatran. ASRA: reduced kidney function, low weight, older age or P-gp inhibitors can make a “low” dose behave like a high dose.',
    renal: true,
  },
  {
    id: 'rivaroxaban-low', group: 'Direct oral anticoagulants (DOACs)', name: 'Rivaroxaban, low dose', dose: '10 mg daily (ASRA also lists 2.5 mg twice daily with aspirin as low dose)',
    asra: { stop: '24 h. CrCl under 30 mL/min: 30 h', next: '6 h or more' },
    esaic: { stop: '24 h. CrCl under 30 mL/min: 30 h', next: ESAIC_DOAC_NEXT },
    note: '',
    renal: true,
  },
  {
    id: 'rivaroxaban-high', group: 'Direct oral anticoagulants (DOACs)', name: 'Rivaroxaban, high dose', dose: '15–20 mg daily',
    asra: { stop: '72 h (or level under 30 ng/mL, or anti-Xa 0.1 IU/mL or less)', next: '24 h or more' },
    esaic: { stop: '72 h. CrCl under 30 mL/min: level under 30 ng/mL', next: ESAIC_DOAC_NEXT },
    note: '',
    renal: true,
  },
  {
    id: 'apixaban-low', group: 'Direct oral anticoagulants (DOACs)', name: 'Apixaban, low dose', dose: '2.5 mg twice daily after hip or knee replacement. ASRA counts the dose-reduced AF dose (also 2.5 mg twice daily) as high dose',
    asra: { stop: '36 h', next: '6 h or more' },
    esaic: { stop: '36 h', next: ESAIC_DOAC_NEXT },
    note: '',
  },
  {
    id: 'apixaban-high', group: 'Direct oral anticoagulants (DOACs)', name: 'Apixaban, high dose', dose: '5 mg twice daily (10 mg twice daily at the start of VTE treatment)',
    asra: { stop: '72 h', next: '24 h or more' },
    esaic: { stop: '72 h', next: ESAIC_DOAC_NEXT },
    note: '',
  },
  {
    id: 'edoxaban-low', group: 'Direct oral anticoagulants (DOACs)', name: 'Edoxaban, low dose', dose: '',
    asra: { stop: 'No recommendation: ASRA notes there is no approved low-dose edoxaban', next: '—' },
    esaic: { stop: '24 h. CrCl under 30 mL/min: 30 h', next: '—' },
    note: '',
    renal: true,
  },
  {
    id: 'edoxaban-high', group: 'Direct oral anticoagulants (DOACs)', name: 'Edoxaban, high dose', dose: '60 mg daily (30 mg)',
    asra: { stop: '72 h', next: '24 h or more' },
    esaic: { stop: '72 h', next: ESAIC_DOAC_NEXT },
    note: '',
  },
  // ------------------------------------------------------------ other
  {
    id: 'thrombolytics', group: 'Other', name: 'Thrombolytics', dose: 'e.g. alteplase',
    asra: { stop: 'Avoid for 48 h or more, and document normal clotting including fibrinogen', next: '—' },
    esaic: { stop: 'Not covered', next: '—' },
    note: 'ASRA: avoid thrombolytics for 10 days after puncture of a non-compressible vessel. If a block was done near the time of thrombolysis, check neurology about every 2 h for 48 h.',
  },
  {
    id: 'parenteral-dti', group: 'Other', name: 'Parenteral direct thrombin inhibitors', dose: 'Argatroban, bivalirudin, desirudin',
    asra: { stop: 'Neuraxial block not suggested', next: '—' },
    esaic: { stop: '—', next: '—' },
    note: 'ASRA suggests against neuraxial techniques with these drugs (grade IIC). They are used where full anticoagulation is needed, for example in HIT.',
  },
  {
    id: 'herbal', group: 'Other', name: 'Herbal medicines', dose: '',
    asra: { stop: 'No mandatory stop; do not on their own rule out a spinal', next: '—' },
    esaic: { stop: 'Out of scope', next: '—' },
    note: '',
  },
];
