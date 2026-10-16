// Pre-op screen (DESIGN.md "Screens" #preop): a briefing before the guided case — the synthetic patient's summary and
// a paraphrased WHO sign-in checklist. The demographics come from the model patient (sim.state.patient) so the
// briefing matches the monitor; the clinical narrative (ASA, history, …) is per-case teaching metadata. Nothing is
// enforced (the debrief, M5, will note what was skipped). Pure data + helpers so a unit test can read them.

export const CASES = {
  electiveGA: {
    title: 'Elective general anaesthetic',
    operation: 'Day-case general surgery (e.g. laparoscopic cholecystectomy)',
    asa: 'ASA I — fit and well',
    airway: 'Mallampati I–II, good mouth opening, full neck movement, normal thyromental distance. No predicted difficulty.',
    history: 'Usually well; no cardiac, respiratory or other significant history. Good exercise tolerance.',
    meds: 'No regular medications.',
    allergies: 'No known drug allergies.',
    fasting: 'Fasted — 8 h for food, 2 h for clear fluids.',
    plan: 'General anaesthetic with tracheal intubation and controlled ventilation. Routine monitoring. Maintain, then wake and extubate.',
  },
};

// WHO surgical-safety sign-in, paraphrased (before induction). Ticked by the trainee; not enforced.
export const SIGN_IN = [
  'Patient’s identity, the procedure and consent confirmed',
  'Surgical site marked, or not applicable',
  'Anaesthetic machine and medication check complete',
  'Pulse oximeter on the patient and working',
  'Any known allergy reviewed',
  'Difficult airway or aspiration risk anticipated, with kit and help ready',
  'Risk of major blood loss anticipated, with access and fluids planned',
];

const SEX = { M: 'Male', F: 'Female' };

// the model patient as label/value pairs for the summary
export function patientSummary(patient) {
  return [
    ['Age', `${patient.age} years`],
    ['Sex', SEX[patient.sex] || patient.sex],
    ['Weight', `${patient.weightKg} kg`],
    ['Height', `${patient.heightCm} cm`],
    ['BMI', `${patient.bmi.toFixed(1)} kg/m²`],
  ];
}

// the case narrative as label/value pairs, in reading order
export function clinicalSummary(c) {
  return [
    ['Operation', c.operation],
    ['ASA grade', c.asa],
    ['Airway', c.airway],
    ['History', c.history],
    ['Medications', c.meds],
    ['Allergies', c.allergies],
    ['Fasting', c.fasting],
    ['Plan', c.plan],
  ];
}
