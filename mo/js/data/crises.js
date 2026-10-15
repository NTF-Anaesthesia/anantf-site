// Crisis cards: the first things to do while help comes. Format: CONTENT.md, "Crisis cards".
// Adults. Department doses and dilutions from the MO handbook (4th edition, 2026) where it gives them; the rest follows
// current UK, European and US practice (Association of Anaesthetists, Difficult Airway Society, Resuscitation Council
// UK and ERC, European MH Group, ASRA), written for this guide. The app shows "Call for help. Say the problem out loud.
// Note the time." above every card, so no card repeats it.

export const CRISES = [
  // ---------------------------------------------------------------- cardiac arrest
  {
    id: 'cardiac-arrest',
    title: 'Cardiac arrest',
    summary: 'No pulse: start compressions, get the defibrillator, find the cause.',
    recognise: [
      'No pulse, or no output: the arterial trace goes flat and the pulse oximeter trace disappears.',
      'EtCO2 falls suddenly towards zero with the tube still in place.',
      'The ECG shows ventricular fibrillation (VF), ventricular tachycardia (VT), asystole, or a rhythm with no pulse (pulseless electrical activity, PEA).',
      'Under anaesthesia it often starts as severe bradycardia or very low blood pressure. A systolic below `50 mmHg` that does not respond at once: treat it as an arrest and start compressions.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Start chest compressions: `100–120` a minute, `5–6 cm` deep, full recoil.',
        'Ask for the defibrillator and the arrest trolley. Pads on without stopping compressions.',
        'Turn off the volatile or the propofol infusion. `100%` oxygen.',
        'Tube in: ventilate at `10` breaths a minute without pausing compressions. No tube: bag-mask, 30 compressions to 2 breaths.',
        'Ask the surgeon to stop, let out any pneumoperitoneum, release traction and pack any bleeding.',
      ] },
      { title: 'Shockable: VF or pulseless VT', items: [
        'Shock: biphasic `150–200 J` for the first shock. Hands off the chest for less than `5 s`.',
        'Restart compressions straight away for 2 min. No pulse check after the shock.',
        'VF seen on the monitor with the pads already on: up to 3 quick shocks in a row, then compressions.',
        'After the third shock: adrenaline `1 mg` IV and amiodarone `300 mg` IV.',
        'Then adrenaline `1 mg` every 3–5 min (every other loop). Amiodarone `150 mg` after the fifth shock.',
      ] },
      { title: 'Non-shockable: PEA or asystole', items: [
        'Adrenaline `1 mg` IV as soon as you have access, then every 3–5 min.',
        'Check the rhythm every 2 min. Shock if it turns into VF or VT.',
        'Asystole or extreme bradycardia from a vagal reflex (traction, insufflation): stop the stimulus and give atropine `0.6 mg` IV, repeated up to `3 mg`.',
      ] },
      { title: 'All the time: find the cause', items: [
        '4 Hs: hypoxia, hypovolaemia (bleeding), high or low potassium and other metabolic causes, hypothermia.',
        '4 Ts: thrombosis (heart or lung), tension pneumothorax, tamponade, toxins.',
        'In theatre also: anaphylaxis, local anaesthetic toxicity, high spinal, drug error, gas embolism, vagal reflex, malignant hyperthermia, air trapping in asthma.',
        'Check every syringe and infusion: wrong drug or wrong strength?',
        'Blood gas: potassium, haemoglobin, glucose, calcium, pH.',
        'Swap the person doing compressions every 2 min.',
      ] },
      { title: 'When the circulation returns', items: [
        'Signs: EtCO2 jumps up, a pulse comes back, an arterial trace returns.',
        'Aim for SpO2 `94–98%`, a normal CO2 and a systolic above `100 mmHg`.',
        '12-lead ECG, blood gas, and plan ICU care with your consultant.',
      ] },
    ],
    doses: [
      { label: 'Adrenaline', text: '`1 mg` IV = `10 mL` of 1:10,000 (`1 mg` made up to `10 mL`), every 3–5 min. Only in cardiac arrest.', drug: 'adrenaline' },
      { label: 'Amiodarone', text: '`300 mg` IV after the third shock; `150 mg` after the fifth. Flush it in.', drug: 'amiodarone' },
      { label: 'Lignocaine', text: 'Only if there is no amiodarone: `100 mg` IV (`1–1.5 mg/kg`; `10 mL` of 1%) after the third shock, then `50 mg` after the fifth. Never in local anaesthetic toxicity.', drug: 'lignocaine' },
      { label: 'Defibrillation', text: 'Biphasic `150–200 J` for the first shock, then the same or higher as the defibrillator suggests.' },
      { label: 'Calcium chloride 10%', text: '`10 mL` IV fast for high potassium, low calcium or calcium channel blocker overdose.', drug: 'calcium-chloride' },
      { label: 'Magnesium', text: '`2 g` IV for torsades de pointes or low magnesium: `4 mL` of 50% made up to `10 mL` with saline. Never give 50% neat; strengths vary, so check the label.', drug: 'magnesium' },
      { label: 'Lipid emulsion 20%', text: 'Local anaesthetic toxicity: `1.5 mL/kg` IV bolus, then an infusion (see [local anaesthetic toxicity](#/crisis/last)).', drug: 'intralipid' },
      { label: 'Fluid', text: 'Bleeding or vasodilated: `500 mL` warmed crystalloid fast, and blood for bleeding.' },
    ],
    pitfalls: [
      'Pauses kill. Keep hands off the chest for less than `5 s` for a shock or a rhythm check.',
      'A low EtCO2 during CPR means weak compressions (swap the person) or a misplaced tube. A sudden rise suggests the heart has restarted.',
      'Patient prone and turning will take time: compress on the back between the shoulder blades, and turn when you can.',
      'Severe bradycardia or low blood pressure under anaesthesia often comes before an arrest: treat it early ([bradycardia](#/crisis/bradycardia), [low blood pressure](#/crisis/hypotension)).',
      'Adrenaline `1 mg` is for cardiac arrest only. A patient with a pulse gets `10–50 mcg` boluses.',
      'Pregnant (past about 20 weeks): push the uterus to the left during CPR. No return of circulation: the obstetrician delivers the baby within 5 min to help the resuscitation.',
      'Your consultant leads and decides when to stop. Never stop CPR on your own.',
    ],
    after: [
      'Ask someone to scribe from the start: times of the arrest, each shock, each drug, and the return of circulation.',
      'Care after an arrest is in ICU: avoid fever (above `37.7 °C`) for at least 72 h, and keep glucose and CO2 normal.',
      'Your consultant speaks to the family.',
      'Debrief the team, report it through the hospital incident system, and restock the defibrillator and arrest trolley.',
    ],
    related: ['anaphylaxis', 'hyperkalaemia', 'last', 'haemorrhage', 'hypoxia'],
  },

  // ---------------------------------------------------------------- anaphylaxis
  {
    id: 'anaphylaxis',
    title: 'Anaphylaxis',
    summary: 'Sudden low blood pressure or bronchospasm after a drug: adrenaline first.',
    recognise: [
      'Sudden low blood pressure: often the only sign under anaesthesia.',
      'Bronchospasm: high airway pressures, wheeze, a sloping capnograph. A falling EtCO2 can mean the cardiac output is falling.',
      'Fast heart rate (sometimes slow), flushing, hives, swollen lips or face. The skin can look normal when the blood pressure is very low.',
      'Usually within minutes of an IV drug (antibiotics, muscle relaxants, chlorhexidine). Blue dye and latex reactions can come later, up to an hour.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Stop the likely trigger: the drug, colloid, blood, chlorhexidine, latex. Ask the surgeon to stop.',
        '`100%` oxygen. Secure the airway. Face or tongue swelling: your consultant intubates early, before it gets harder.',
        'Adrenaline IV `50 mcg` (`0.5 mL` of 1:10,000). Repeat every 1–2 min until the blood pressure responds.',
        'Lie the patient flat and raise the legs. Fast IV fluid: `20 mL/kg` crystalloid.',
        'Systolic below `50 mmHg` or no pulse: start CPR ([cardiac arrest](#/crisis/cardiac-arrest)).',
      ] },
      { title: 'Then', items: [
        'Needed 3 boluses already: start an adrenaline infusion with your consultant.',
        'A second large IV cannula; an arterial line when you can.',
        'Bronchospasm: salbutamol and magnesium as on the [bronchospasm](#/crisis/bronchospasm) card.',
        'Take the first tryptase sample once treatment is under way.',
        'Your consultant decides whether to stop or finish surgery quickly.',
      ] },
      { title: 'If not improving', items: [
        'Add a noradrenaline or vasopressin infusion (your consultant decides).',
        'On a beta-blocker: glucagon `1 mg` IV, repeated as needed.',
        'Think again: bleeding, tension pneumothorax, high spinal, embolism, a blocked tube.',
        'Once stable: hydrocortisone `200 mg` IV, and chlorphenamine `10 mg` IV slowly for skin symptoms. Neither is a first-line treatment.',
      ] },
    ],
    doses: [
      { label: 'Adrenaline IV', text: '`50 mcg` = `0.5 mL` of 1:10,000 (or `5 mL` of 1:100,000), every 1–2 min as needed.', drug: 'adrenaline' },
      { label: 'Adrenaline IM', text: 'No IV access: `0.5 mg` = `0.5 mL` of 1:1000 into the outer thigh; repeat after 5 min.', drug: 'adrenaline' },
      { label: 'Adrenaline infusion', text: '`4 mg` made up to `50 mL` saline (`80 mcg/mL`). Start around `0.05–0.1 mcg/kg/min`, range `0.01–0.2 mcg/kg/min`. Rates: [infusion calculator](#/tools/infusions).', drug: 'adrenaline' },
      { label: 'Crystalloid', text: '`20 mL/kg` IV fast (`1.4 L` for a 70 kg adult); repeat as needed.' },
      { label: 'Salbutamol', text: 'For bronchospasm: see the [bronchospasm](#/crisis/bronchospasm) card.', drug: 'salbutamol' },
      { label: 'Glucagon', text: 'Patient on a beta-blocker and not responding to adrenaline: `1 mg` IV, repeated as needed.' },
      { label: 'Hydrocortisone', text: '`200 mg` IV, after the first resuscitation.', drug: 'hydrocortisone' },
      { label: 'Chlorphenamine', text: '`10 mg` IV slowly, once the blood pressure is stable.' },
    ],
    pitfalls: [
      'Adrenaline is the treatment. Steroids and antihistamines are not: never let them delay adrenaline.',
      'Never give the cardiac arrest dose (`1 mg` IV) to a patient with a pulse. Three adrenaline strengths are in use: say the dose and the strength out loud.',
      'The rash may be missing, and drapes hide the skin. Unexplained low blood pressure or bronchospasm soon after a drug: think anaphylaxis.',
      'Sugammadex is not a treatment for rocuronium anaphylaxis.',
      'Reactions can come back hours later: watch the patient in high dependency (HD) or ICU.',
    ],
    after: [
      'Tryptase (a clotted serum sample; write the time on each): first as soon as you can without delaying treatment; second 1–2 h after the reaction started (no later than 4 h); third at least 24 h later, or at the allergy clinic, as a baseline.',
      'Write down every drug and product given before the reaction, with times, in the anaesthetic record.',
      'Your consultant refers the patient to the allergy clinic for testing.',
      'Record it in Epic as suspected anaphylaxis during anaesthesia, cause under investigation. Don\'t label one drug before testing, and avoid all the suspect drugs until then.',
      'Tell the patient what happened, give them a letter, and report it as an adverse drug reaction.',
    ],
    related: ['bronchospasm', 'hypotension', 'cardiac-arrest'],
  },

  // ---------------------------------------------------------------- CICO
  {
    id: 'cico',
    title: "Can't intubate, can't oxygenate (CICO)",
    summary: 'No way to get oxygen in from above and SpO2 falling: front of neck airway now.',
    recognise: [
      'Intubation has failed, then a supraglottic airway (SGA), then facemask ventilation, even with two people and an oral airway.',
      'SpO2 falling or already low, with no capnography trace.',
      'Bradycardia follows, then cardiac arrest.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Declare it: "This is CICO. Front of neck airway now."',
        'The most experienced anaesthetist present does it. Don\'t wait for a surgeon.',
        'Get the front of neck airway (FONA) kit: scalpel with a size 10 blade, bougie, size 6.0 cuffed tube.',
        'Keep trying to oxygenate from above while the kit comes: `100%` oxygen, two-person facemask or SGA, nasal oxygen at `15 L/min`.',
        'Make sure the patient is fully paralysed.',
        'Extend the neck: a pillow or roll under the shoulders, head back.',
      ] },
      { title: 'Scalpel, bougie, tube: membrane felt', items: [
        'Right-handed: stand on the patient\'s left. Find the cricothyroid membrane with the laryngeal handshake.',
        'Hold the larynx with your left hand. Stab through the skin and the membrane, blade across the neck, sharp edge towards you.',
        'Turn the blade 90° so the sharp edge points to the feet.',
        'Slide the bougie tip along the blade into the trachea.',
        'Railroad the lubricated 6.0 cuffed tube over the bougie. Inflate the cuff, ventilate, confirm with capnography, secure it.',
      ] },
      { title: 'Membrane not felt', items: [
        'Vertical midline skin cut, `8–10 cm` long, cutting from below upwards.',
        'Spread the tissues with the fingers of both hands until you feel the larynx. Hold it.',
        'Then as above: stab through the membrane, turn the blade, bougie, tube.',
      ] },
    ],
    doses: [
      { label: 'Rocuronium', text: '`1 mg/kg` IV if the patient is not already fully paralysed: it helps the mask, the SGA and the cut.', drug: 'rocuronium' },
    ],
    pitfalls: [
      'The commonest error is waiting too long. SpO2 falling and every route from above has failed: cut.',
      'Don\'t count on sugammadex: reversing rocuronium does not guarantee the airway opens or the patient breathes in time.',
      'A cannula (needle) cricothyroidotomy fails more often and needs high-pressure oxygen. The scalpel technique is the standard.',
      'Don\'t let go of the larynx, and don\'t pull out the bougie until the tube is in.',
      'Obese or swollen neck where you can\'t feel the membrane: go straight to the vertical cut.',
    ],
    after: [
      'The surgeons review the airway; it may become a formal tracheostomy. ICU.',
      'Document what failed, what worked, and the times. Write a difficult airway alert in the notes.',
      'Your consultant tells the patient and gives them a letter about their airway for future anaesthetics.',
      'Debrief the team.',
    ],
    related: ['failed-intubation', 'hypoxia', 'neck-haematoma'],
  },

  // ---------------------------------------------------------------- hypoxia
  {
    id: 'hypoxia',
    title: 'Hypoxia (low SpO2)',
    summary: 'SpO2 falling: give 100% oxygen, hand-ventilate, and work from the machine to the patient.',
    recognise: [
      'SpO2 below `94%`, or falling steadily.',
      'Cyanosis is a late sign.',
      'A poor oximeter trace (cold hands, low blood pressure, movement) can read falsely low, but treat it as real until proven otherwise.',
      'Look for company: no capnography trace, high airway pressure, low blood pressure.',
    ],
    steps: [
      { title: 'Immediately', items: [
        '`100%` oxygen with a high fresh gas flow.',
        'Hand-ventilate with the bag and feel it: easy, stiff, or nothing going in? Chest moving on both sides?',
        'Look at the capnograph. No trace: the tube is out, disconnected or blocked, or there is no circulation (feel a pulse).',
        'Follow the path from oxygen supply to patient: pipeline and cylinder, machine, circuit, filter, tube.',
        'Awake patient (post-anaesthesia care unit, PACU, or ward): sit them up, oxygen by mask, jaw thrust if snoring or obstructed.',
      ] },
      { title: 'Then: find the cause', items: [
        'Tube: too deep (one lung), kinked, bitten, blocked. Check the depth at the teeth, listen on both sides, pass a suction catheter.',
        'Lungs: bronchospasm, aspiration, collapse, pneumothorax, pulmonary oedema.',
        'Heart and blood: low cardiac output, anaphylaxis, pulmonary or gas embolism.',
        'Awake: residual paralysis, opioids, sedation, airway obstruction.',
        'Open the lungs, with your consultant: a slow breath held at `30–40 cmH2O` for several seconds, then positive end-expiratory pressure (PEEP) `5–10 cmH2O`, if the blood pressure allows. Not if you suspect a pneumothorax.',
      ] },
      { title: 'If not improving', items: [
        'Swap to a self-inflating bag on a separate oxygen cylinder: this rules out the machine. Keep the patient asleep with IV drugs.',
        'Any doubt the tube is in the trachea: take it out and oxygenate with a facemask or supraglottic airway (SGA).',
        'Ask the surgeon to pause: pneumoperitoneum, position, retractors.',
        'Arterial blood gas and chest X-ray.',
      ] },
    ],
    pitfalls: [
      '"No trace, wrong place": a flat capnograph after intubation means the tube is in the oesophagus until proven otherwise, even if you saw it pass the cords.',
      'SpO2 lags: it can keep falling for a minute after you fix the problem, and it falls fast once below `90%`.',
      'More oxygen buys time; it does not fix the cause.',
      'Bradycardia with hypoxia is a late and dangerous sign.',
    ],
    after: [
      'Write down what happened and what fixed it.',
      'Still needs more oxygen than before: chest X-ray, blood gas, and plan high dependency (HD) or ICU with your consultant.',
      'Faulty equipment: take it out of use, label it and report it.',
    ],
    related: ['high-airway-pressure', 'bronchospasm', 'aspiration', 'laryngospasm', 'cico'],
  },

  // ---------------------------------------------------------------- failed intubation
  {
    id: 'failed-intubation',
    title: 'Failed intubation',
    summary: 'The tube will not go: three tries at most, keep oxygenating, use a supraglottic airway, wake the patient.',
    recognise: [
      'You can\'t see the larynx or pass the tube after induction.',
      'Repeated attempts, with the SpO2 starting to fall.',
      'It can be unexpected: a normal airway assessment does not rule it out.',
    ],
    steps: [
      { title: 'Plan A: intubation', items: [
        'First attempt failed: call your consultant now, not after the third.',
        'Oxygenate between every attempt: facemask with `100%` oxygen. Nasal oxygen at `15 L/min` throughout.',
        'Change something each time: head position (ear level with the sternal notch), video laryngoscope, bougie, external laryngeal pressure.',
        'Rapid sequence induction (RSI): ease off the cricoid if the view is poor.',
        'Three attempts at most (a fourth only by someone more experienced). Then declare failed intubation.',
        'Keep the patient asleep and paralysed.',
      ] },
      { title: 'Plan B: supraglottic airway', items: [
        'Insert a second-generation supraglottic airway (SGA), one with a drain tube. Up to 3 attempts, changing size or type.',
        'It works: stop and think with your consultant. Wake the patient, intubate through the SGA with a fibrescope, carry on with the SGA (rarely), or a surgical airway.',
      ] },
      { title: 'Plan C: facemask', items: [
        'SGA fails: facemask with two people, an oral airway and `100%` oxygen.',
        'Mask works: wake the patient. Reverse rocuronium fully with sugammadex.',
        'Mask fails and SpO2 is falling: this is CICO. Go to the [CICO card](#/crisis/cico).',
      ] },
    ],
    doses: [
      { label: 'Sugammadex', text: 'Immediate reversal of rocuronium: `16 mg/kg` IV (`100 mg/mL`: about `11 mL` for a 70 kg adult).', drug: 'sugammadex' },
    ],
    pitfalls: [
      'Every attempt swells the airway and makes the next one harder. Stop at three.',
      'Oxygenation matters, not the tube. Don\'t keep trying "one more time" while the SpO2 falls.',
      'After suxamethonium the patient will not breathe again for several minutes: don\'t rely on waiting for it to wear off.',
      'Sugammadex reverses rocuronium, not suxamethonium or atracurium.',
    ],
    after: [
      'Document the view, which devices worked or failed, and the number of attempts.',
      'Difficult airway alert in the notes; your consultant tells the patient and gives them a letter.',
      'Watch for airway injury: a worsening sore throat, neck pain or swelling, fever, or crackling under the skin can mean a tear (rare but serious).',
    ],
    related: ['cico', 'hypoxia', 'aspiration'],
  },

  // ---------------------------------------------------------------- laryngospasm
  {
    id: 'laryngospasm',
    title: 'Laryngospasm',
    summary: 'The cords clamp shut at light anaesthesia: oxygen and CPAP, deepen, then a small dose of suxamethonium.',
    recognise: [
      'High-pitched noisy breathing (stridor) that goes silent when the spasm is complete.',
      'The chest and tummy see-saw, no air moves, the bag feels stiff, no capnography trace.',
      'SpO2 falls; then the heart slows.',
      'Usually at light anaesthesia: induction, airway instrumentation, or soon after extubation (blood or secretions on the cords).',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Stop all stimulation; ask the surgeon to pause.',
        '`100%` oxygen with a tight facemask. Partly close the adjustable pressure-limiting (APL) valve to give continuous positive airway pressure (CPAP).',
        'Jaw thrust, with firm pressure at the laryngospasm notch (behind the earlobe, between the jaw and the mastoid).',
        'Gently suction blood or secretions from the mouth.',
      ] },
      { title: 'Then', items: [
        'Deepen anaesthesia: propofol IV.',
        'Keep the mask and CPAP on until it breaks.',
      ] },
      { title: 'If not improving', items: [
        'SpO2 falling or no air moving: suxamethonium IV in a small dose relaxes the cords (your consultant\'s call).',
        'Have atropine ready: the heart slows with hypoxia and suxamethonium.',
        'Ventilate by mask until the patient breathes; intubate if needed.',
        'Afterwards pass an orogastric tube: the stomach fills with air.',
      ] },
    ],
    doses: [
      { label: 'Propofol', text: '`0.5–1 mg/kg` IV to deepen anaesthesia.', drug: 'propofol' },
      { label: 'Suxamethonium', text: 'A small dose, `0.1–0.5 mg/kg` IV, breaks the spasm; `1 mg/kg` if you need to intubate. No IV: `4 mg/kg` IM (no more than `150 mg`), slower to work.', drug: 'suxamethonium' },
      { label: 'Atropine', text: '`0.6 mg` IV (`1 mL` of `600 mcg/mL`) for bradycardia.', drug: 'atropine' },
    ],
    pitfalls: [
      'Don\'t try to force breaths past closed cords with high pressure: it fills the stomach. Steady CPAP is better.',
      'Partial spasm still lets some air through with a squeak; complete spasm is silent. Silence is worse.',
      'No suxamethonium with a malignant hyperthermia (MH) risk, a high potassium or muscle disease: your consultant deepens with propofol or uses rocuronium instead.',
      'Prevent it: suction before the tube comes out, and extubate fully awake, never in between. Deep extubation is your consultant\'s decision.',
    ],
    after: [
      'Watch in the post-anaesthesia care unit (PACU) for negative pressure pulmonary oedema (pink frothy sputum, low SpO2), which can appear minutes to hours later.',
      'Watch for aspiration.',
      'Document it and tell the patient.',
    ],
    related: ['hypoxia', 'aspiration', 'cico'],
  },

  // ---------------------------------------------------------------- bronchospasm
  {
    id: 'bronchospasm',
    title: 'Bronchospasm',
    summary: 'High airway pressures and wheeze: rule out the tube, deepen, give salbutamol.',
    recognise: [
      'High airway pressures, small tidal volumes, a stiff bag.',
      'Wheeze, or a silent chest when it is severe.',
      'Capnograph slopes upwards (a "shark fin"); EtCO2 rises.',
      'SpO2 falls; blood pressure falls if air is trapped.',
      'Triggers: airway instrumentation at light anaesthesia, asthma or chronic obstructive pulmonary disease (COPD), anaphylaxis, aspiration.',
    ],
    steps: [
      { title: 'Immediately', items: [
        '`100%` oxygen. Hand-ventilate to feel how stiff the lungs are.',
        'Rule out the tube: kinked, blocked, too deep. Pass a suction catheter and listen on both sides.',
        'Deepen anaesthesia: turn up the sevoflurane (a bronchodilator) or give propofol.',
        'Ventilate slowly with a long expiry: rate `8–10`, inspiration to expiration (I:E) `1:3` or longer. Accept a high CO2.',
        'Low blood pressure or rash as well: go to the [anaphylaxis](#/crisis/anaphylaxis) card.',
      ] },
      { title: 'Then', items: [
        'Salbutamol into the breathing circuit (inspiratory limb), repeated.',
        'Magnesium IV over 20 min.',
        'Hydrocortisone IV.',
      ] },
      { title: 'If not improving', items: [
        'Salbutamol IV.',
        'Adrenaline IV in small boluses.',
        'Your consultant may add ketamine.',
        'Pressures climbing and blood pressure falling (air trapping): disconnect the circuit for 10–30 s to let the air out, then ventilate slower.',
        'Arterial blood gas; chest X-ray (pneumothorax).',
      ] },
    ],
    doses: [
      { label: 'Salbutamol inhaler', text: '`100 mcg` a puff: 6–10 puffs into the inspiratory limb through an adaptor, repeated every few minutes.', drug: 'salbutamol' },
      { label: 'Salbutamol IV', text: '`250 mcg` IV slowly over 5–10 min (`500 mcg` made up to `10 mL`: give `5 mL`), then an infusion of `5–20 mcg/min`, when your consultant decides.', drug: 'salbutamol' },
      { label: 'Magnesium sulfate', text: '`2 g` IV over 20 min, diluted (for example in `100 mL` saline); never 50% neat. Strengths vary: check the label.', drug: 'magnesium' },
      { label: 'Hydrocortisone', text: '`100 mg` IV, then every 6 h if it goes on.', drug: 'hydrocortisone' },
      { label: 'Adrenaline', text: '`10–50 mcg` IV (`1–5 mL` of 1:100,000) for severe bronchospasm. Anaphylaxis doses if that is the cause.', drug: 'adrenaline' },
      { label: 'Ketamine', text: '`0.5–1 mg/kg` IV, a bronchodilator: when your consultant asks.', drug: 'ketamine' },
    ],
    pitfalls: [
      'Not all wheeze is asthma: a blocked or too-deep tube, aspiration, pulmonary oedema, pneumothorax and anaphylaxis all wheeze.',
      'Much of an inhaler dose sticks to the tubing: you need more puffs than when awake.',
      'Fast ventilation traps air, drops the blood pressure and can stop the heart. Breathe slowly and let it out.',
      'At NTFGH salbutamol is in the third drawer of the drug trolley.',
    ],
    after: [
      'Severe or prolonged: ICU, blood gas, chest X-ray.',
      'Anaphylaxis possible: take tryptase samples (see the [anaphylaxis](#/crisis/anaphylaxis) card).',
      'Document it; the patient\'s asthma or COPD treatment may need review.',
    ],
    related: ['anaphylaxis', 'high-airway-pressure', 'hypoxia'],
  },

  // ---------------------------------------------------------------- high airway pressure
  {
    id: 'high-airway-pressure',
    title: 'High airway pressure',
    summary: 'High pressure alarm or stiff bag: hand-ventilate, then check the machine, circuit, tube and patient.',
    recognise: [
      'High peak pressure alarm, small tidal volumes, or the bag is stiff.',
      'A capnograph that slopes up (bronchospasm) or disappears (blocked tube).',
      'SpO2 and blood pressure fall as it goes on.',
    ],
    steps: [
      { title: 'Immediately', items: [
        '`100%` oxygen. Switch to the bag and hand-ventilate.',
        'Bag easy: the problem is the ventilator or its settings.',
        'Bag still stiff: connect a self-inflating bag straight to the tube. Easy now: the circuit or filter. Still stiff: the tube or the patient.',
        'Tube: kinked, bitten, too deep, blocked? Look at the mouth and pass a suction catheter down it.',
        'Ask the surgeon: pneumoperitoneum, steep head-down tilt, retractors, someone leaning on the chest?',
      ] },
      { title: 'Then', items: [
        'Listen to both sides of the chest: wheeze (bronchospasm), a silent side (tube too deep, pneumothorax).',
        'Coughing or straining: deepen anaesthesia and check muscle relaxation.',
        'Rigid chest after a large opioid dose: muscle relaxant.',
        'Change the filter (heat and moisture exchanger) or circuit if blocked by secretions or water.',
      ] },
      { title: 'If not improving', items: [
        'Tension pneumothorax (falling blood pressure, one side not moving): your consultant or the surgeon decompresses with a needle or finger in the 4th or 5th space just in front of the mid-axillary line, then a chest drain.',
        'Tube blocked and you can\'t clear it: change it with your consultant, or take it out and use a facemask or supraglottic airway.',
        'Think of anaphylaxis, aspiration and pulmonary oedema.',
      ] },
    ],
    doses: [
      { label: 'Propofol', text: '`0.5–1 mg/kg` IV to deepen anaesthesia.', drug: 'propofol' },
      { label: 'Rocuronium', text: '`0.1–0.2 mg/kg` IV top-up for coughing or chest rigidity. Ask your consultant first.', drug: 'rocuronium' },
      { label: 'Salbutamol', text: 'For bronchospasm: see the [bronchospasm](#/crisis/bronchospasm) card.', drug: 'salbutamol' },
    ],
    pitfalls: [
      'Squeezing harder is not the answer: find the cause.',
      'In manual mode a closed adjustable pressure-limiting (APL) valve fills the lungs and raises the pressure fast: check it.',
      'Air trapping in asthma or chronic lung disease: pressures and EtCO2 climb while the blood pressure falls. Disconnect for 10–30 s to let air out.',
      'Typical tube depth at the teeth is about `21 cm` in women and `23 cm` in men. Much deeper usually means one lung.',
    ],
    after: [
      'Chest X-ray if you suspect a pneumothorax or a misplaced tube.',
      'Faulty equipment: take it out of use, label it and report it.',
      'Document the cause and the fix.',
    ],
    related: ['bronchospasm', 'hypoxia', 'anaphylaxis'],
  },

  // ---------------------------------------------------------------- aspiration
  {
    id: 'aspiration',
    title: 'Aspiration',
    summary: 'Stomach contents in the airway: head down, suction, oxygen, protect the airway.',
    recognise: [
      'Gastric fluid or food in the mouth or pharynx at induction, during the case or at emergence.',
      'Coughing, laryngospasm, wheeze, high airway pressures.',
      'SpO2 falling; crackles on the chest.',
      'Higher risk: full stomach, bowel obstruction, pregnancy, reflux, obesity, poorly controlled diabetes.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Tilt the table head down.',
        'Suction the mouth and pharynx with a wide-bore sucker.',
        'Cricoid on: keep it on, unless the patient is actively vomiting (then let go: it can tear the oesophagus).',
        '`100%` oxygen.',
        'Supraglottic airway (SGA) in place: leave it in, tilt head down and suction through it and its drain port. Your consultant decides about intubating.',
      ] },
      { title: 'Then', items: [
        'Intubate with your consultant to protect the airway. Suction down the tube before you ventilate if you can.',
        'Ventilate with positive end-expiratory pressure (PEEP); treat bronchospasm.',
        'Pass a gastric tube to empty the stomach.',
        'Your consultant decides on bronchoscopy (solid material) and whether surgery goes ahead.',
      ] },
      { title: 'If not improving', items: [
        'Follow the [hypoxia](#/crisis/hypoxia) and [bronchospasm](#/crisis/bronchospasm) cards.',
        'Arterial blood gas and chest X-ray.',
        'Still needing oxygen or ventilation: ICU.',
      ] },
    ],
    doses: [
      { label: 'Salbutamol', text: 'For bronchospasm: see the [bronchospasm](#/crisis/bronchospasm) card.', drug: 'salbutamol' },
    ],
    pitfalls: [
      'No routine antibiotics or steroids. Antibiotics only if pneumonia develops, or the aspirate came from obstructed bowel.',
      'Don\'t wash out the lungs with saline.',
      'Signs can appear hours later: a patient who looks fine now still needs watching.',
    ],
    after: [
      'Watch for at least 2 h. No cough or wheeze, no new oxygen need and a normal chest at 2 h: serious pneumonitis is unlikely.',
      'Otherwise chest X-ray, and high dependency (HD) or ICU as your consultant decides.',
      'Document it and tell the patient.',
    ],
    related: ['hypoxia', 'bronchospasm', 'failed-intubation'],
  },

  // ---------------------------------------------------------------- hypotension
  {
    id: 'hypotension',
    title: 'Low blood pressure',
    summary: 'Check it is real, turn down the anaesthetic, fluid and a vasopressor, then find the cause.',
    recognise: [
      'Systolic below `90 mmHg`, mean below `65 mmHg`, or more than 20–30% below the patient\'s usual.',
      'Look at the heart rate: slow, normal or fast? It points to the cause and the drug.',
      'A falling EtCO2 can mean the cardiac output is falling.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Check it is real: cuff size and position, repeat the reading, feel a pulse. Arterial line: flush it and level the transducer.',
        'Look at heart rate, rhythm, EtCO2, SpO2 and airway pressure.',
        'Turn down the anaesthetic (volatile or propofol).',
        'Raise the legs. Fluid bolus `250–500 mL` crystalloid.',
        'Vasopressor from the E-drug tray: slow heart rate → ephedrine; normal or fast heart rate → phenylephrine.',
      ] },
      { title: 'Then: find the cause', items: [
        'Ask the surgeon: bleeding? Pressing on the vena cava? Pneumoperitoneum? Traction?',
        'Volume: bleeding, fasting, bowel preparation.',
        'Drugs: too much anaesthetic, a spinal or epidural.',
        'Heart: arrhythmia, ischaemia, failure. Obstruction: tension pneumothorax, embolism, tamponade, air trapping.',
        'Anaphylaxis and sepsis.',
        'On an angiotensin-converting enzyme (ACE) inhibitor or angiotensin receptor blocker: the blood pressure may respond poorly to ephedrine and phenylephrine. Your consultant may use vasopressin.',
      ] },
      { title: 'If not improving', items: [
        'Adrenaline IV in small boluses.',
        'Start a noradrenaline infusion.',
        'Arterial line, 12-lead ECG, blood gas (haemoglobin, lactate).',
        'Systolic below `50 mmHg` or no pulse: start CPR ([cardiac arrest](#/crisis/cardiac-arrest)).',
      ] },
    ],
    doses: [
      { label: 'Phenylephrine', text: '`50–100 mcg` IV (`0.5–1 mL` of `100 mcg/mL`), every 1–2 min. Pharmacy syringes: check the strength on the label.', drug: 'phenylephrine' },
      { label: 'Ephedrine', text: '`5 mg` IV (`1 mL`: `30 mg` plus `5 mL` saline = `5 mg/mL`), every 2–5 min.', drug: 'ephedrine' },
      { label: 'Adrenaline', text: '`10–20 mcg` IV (`1–2 mL` of 1:100,000), repeated or increased as needed.', drug: 'adrenaline' },
      { label: 'Noradrenaline', text: 'Infusion `4 mg` in `50 mL` (`80 mcg/mL`) at `0.01–0.2 mcg/kg/min`. Rates: [infusion calculator](#/tools/infusions).', drug: 'noradrenaline' },
      { label: 'Vasopressin', text: 'Infusion `20 U` in `20 mL` (`1 U/mL`) at `0.6–2.4 U/h`, when your consultant asks.', drug: 'vasopressin' },
      { label: 'Fluid', text: '`250–500 mL` crystalloid; reassess after each bolus.' },
    ],
    pitfalls: [
      'Vasopressors buy time; they do not fix bleeding. Look at the field, the suction and the swabs.',
      'Ephedrine has worked less each time and `30 mg` has not fixed it: stop and look for a cause.',
      'Low blood pressure with high airway pressure or a rash: think anaphylaxis.',
      'At NTFGH the E-drug tray holds phenylephrine, ephedrine, atropine and sometimes adrenaline: bring it out for every case.',
    ],
    after: [
      'Hand over what happened and what worked to the post-anaesthesia care unit (PACU), high dependency (HD) or ICU.',
      'Long or severe low blood pressure in a patient with heart disease: 12-lead ECG and troponin as your consultant decides.',
      'Document the lowest pressure, how long it lasted and the treatment.',
    ],
    related: ['haemorrhage', 'anaphylaxis', 'high-spinal', 'bradycardia', 'cardiac-arrest'],
  },

  // ---------------------------------------------------------------- haemorrhage
  {
    id: 'haemorrhage',
    title: 'Major haemorrhage',
    summary: 'Stop the bleeding, give blood early, keep the patient warm, correct clotting and calcium.',
    recognise: [
      'Visible bleeding, full suction canisters, soaked swabs; the surgeon says it is bleeding.',
      'Fast heart rate, low or falling blood pressure, a narrow pulse pressure, an arterial trace that swings with each breath.',
      'Low EtCO2; falling haemoglobin and rising lactate on a blood gas (the haemoglobin can be normal early).',
      'Massive: about half the blood volume in 3 h, or bleeding at `150 mL/min`.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Tell the surgeon: press, pack, clamp. Stopping the bleeding comes first.',
        '`100%` oxygen; turn down the anaesthetic.',
        'Two large IV cannulas (`14–16 G`) or a rapid infusion line.',
        'Ask your consultant to activate the massive transfusion protocol (MTP).',
        'Send blood: crossmatch, full blood count, clotting, fibrinogen, blood gas (haemoglobin, lactate, calcium, potassium).',
      ] },
      { title: 'Then', items: [
        'Give blood, not lots of clear fluid: red cells and plasma together (about 1:1 at first). Group O red cells if there is no time to crossmatch.',
        'Warm everything: fluid warmer (Hotline), forced-air warmer. Keep the temperature above `36 °C`.',
        'Tranexamic acid, within 3 h of the start of bleeding.',
        'Calcium to keep the ionised calcium above `1.1 mmol/L`.',
        'Arterial line; blood gas every 30 min.',
      ] },
      { title: 'If not improving', items: [
        'Platelets and fibrinogen (cryoprecipitate or concentrate) as results guide.',
        'Targets: haemoglobin `7–9 g/dL` (`70–90 g/L`), platelets above `75 × 10⁹/L`, fibrinogen above `1.5 g/L` (`2 g/L` in obstetric bleeding), clotting times (PT and APTT) under 1.5 times normal, pH above `7.2`.',
        'Vasopressors only to buy time while volume goes in.',
        'Your consultant and the surgeon may choose damage control: pack, close, come back later.',
        'Systolic below `50 mmHg` or no pulse: start CPR ([cardiac arrest](#/crisis/cardiac-arrest)).',
      ] },
    ],
    doses: [
      { label: 'Tranexamic acid', text: '`1 g` IV over 10 min, then `1 g` over 8 h.', drug: 'tranexamic-acid' },
      { label: 'Calcium chloride 10%', text: '`5–10 mL` IV over 5–10 min, guided by the ionised calcium, into a large vein (it burns if it leaks).', drug: 'calcium-chloride' },
      { label: 'Calcium gluconate 10%', text: '`10–30 mL` IV: `30 mL` gives about the same calcium as `10 mL` of calcium chloride.', drug: 'calcium-gluconate' },
      { label: 'Blood', text: 'Red cells and plasma about 1:1 to start, then guided by results.' },
      { label: 'Fibrinogen', text: 'Keep above `1.5 g/L` (`2 g/L` in obstetric bleeding): cryoprecipitate or fibrinogen concentrate.' },
    ],
    pitfalls: [
      'Young fit patients hold their blood pressure until they have lost a lot: a rising heart rate is the early sign. Beta-blocked and elderly patients may not get one.',
      'Clear fluids dilute clotting factors and cool the patient: switch to blood early.',
      'Cold, acidosis and clotting failure each make the others worse. Warm early.',
      'Calcium falls with each unit of blood (citrate binds it): check it and give calcium.',
    ],
    after: [
      'Stand down the MTP when the bleeding is controlled, and send unused products back promptly.',
      'Record every product given, the fluid balance and the estimated blood loss.',
      'Recheck haemoglobin, clotting, calcium, potassium and temperature. High dependency (HD) or ICU.',
      'Debrief the team.',
    ],
    related: ['hypotension', 'hyperkalaemia', 'cardiac-arrest'],
  },

  // ---------------------------------------------------------------- bradycardia
  {
    id: 'bradycardia',
    title: 'Bradycardia',
    summary: 'Slow heart rate: check oxygenation, stop the trigger, atropine, then adrenaline or pacing.',
    recognise: [
      'Heart rate below `50`, or much slower than before, with or without low blood pressure.',
      'Danger signs: shock, fainting (awake), myocardial ischaemia, heart failure.',
      'Triggers in theatre: traction on the eye, peritoneum or bowel; pneumoperitoneum; laryngoscopy; cervical dilatation; a second dose of suxamethonium; neostigmine; remifentanil, dexmedetomidine, beta-blockers; a high spinal; hypoxia (late and ominous).',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Check oxygenation and ventilation first: hypoxia slows the heart.',
        'Feel for a pulse and check the blood pressure. No pulse: [cardiac arrest](#/crisis/cardiac-arrest).',
        'Ask the surgeon to stop: release traction, let the gas out of the abdomen.',
        'Stop or reduce the likely drug (remifentanil, dexmedetomidine).',
      ] },
      { title: 'Then', items: [
        'Atropine from the E-drug tray: `0.6 mg` IV, repeated every 3–5 min up to `3 mg`.',
        'Slow but not dangerous: glycopyrrolate is an option (slower onset).',
        'Low blood pressure as well: ephedrine.',
        '12-lead ECG: heart block?',
      ] },
      { title: 'If not improving', items: [
        'Adrenaline: `10 mcg` boluses or an infusion.',
        'External (transcutaneous) pacing: pads on, demand mode, rate `70`, raise the current until each spike gives a pulse.',
        'Think: high spinal, high potassium, myocardial infarction, raised intracranial pressure, hypothermia, beta-blocker or calcium channel blocker overdose.',
      ] },
    ],
    doses: [
      { label: 'Atropine', text: '`0.6 mg` IV (`1 mL` of `600 mcg/mL`), every 3–5 min up to `3 mg`.', drug: 'atropine' },
      { label: 'Glycopyrrolate', text: '`0.2–0.4 mg` IV.', drug: 'glycopyrrolate' },
      { label: 'Ephedrine', text: '`5–10 mg` IV (`1–2 mL` of `5 mg/mL`).', drug: 'ephedrine' },
      { label: 'Adrenaline', text: '`10 mcg` IV (`1 mL` of 1:100,000) boluses, or an infusion of `2–10 mcg/min` (`1.5–7.5 mL/h` of `80 mcg/mL`).', drug: 'adrenaline' },
      { label: 'Pacing', text: 'Transcutaneous: demand mode, rate `70`, raise the current until capture; check for a pulse.' },
    ],
    pitfalls: [
      'A vagal slowing usually stops when the surgeon stops. If it keeps coming back, give atropine before the next pull.',
      'Pacemaker patient slowing during diathermy: the device may be sensing the diathermy and holding back. Ask the surgeon to stop. A magnet over a pacemaker usually makes it pace at a fixed rate; a magnet over an implantable defibrillator stops shocks but does not change pacing.',
      'At NTFGH a cardiac device magnet is kept in the OT control room (ask the nurse in charge).',
    ],
    after: [
      '12-lead ECG. New heart block: cardiology review.',
      'Patients with a pacemaker or defibrillator: the device is checked after surgery if it was affected.',
      'Document the trigger and the treatment.',
    ],
    related: ['hypotension', 'high-spinal', 'hyperkalaemia', 'cardiac-arrest'],
  },

  // ---------------------------------------------------------------- tachycardia
  {
    id: 'tachycardia',
    title: 'Tachycardia',
    summary: 'Fast heart rate: pulse, danger signs, then treat the cause or the rhythm.',
    recognise: [
      'Heart rate above `100`. Below about `150` a fast rate is usually a response to something else, not the problem itself.',
      'Narrow QRS (sinus, supraventricular tachycardia, atrial fibrillation or flutter) or broad QRS (often ventricular tachycardia, VT).',
      'Danger signs: shock (systolic below `90 mmHg`), fainting (awake), myocardial ischaemia, heart failure.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Feel for a pulse. No pulse: [cardiac arrest](#/crisis/cardiac-arrest).',
        '`100%` oxygen; check airway and ventilation.',
        'Look at the rhythm: regular or irregular? Narrow or broad? Print or record a 12-lead.',
        'Sinus tachycardia is a sign, not a diagnosis. Treat the cause: light anaesthesia or pain, bleeding, hypoxia, high CO2, drugs, anaphylaxis, sepsis, malignant hyperthermia.',
      ] },
      { title: 'Danger signs: unstable', items: [
        'Synchronised shock, up to 3 attempts. An awake patient needs sedation or anaesthesia first.',
        'Shocks fail: amiodarone `300 mg` IV over 10–20 min, then shock again.',
      ] },
      { title: 'No danger signs: stable', items: [
        'Regular narrow: vagal manoeuvre if awake, then adenosine `6 mg`, `12 mg`, `18 mg` rapid IV with a flush.',
        'Irregular narrow (atrial fibrillation): slow the rate with a beta-blocker, or amiodarone if the heart is failing.',
        'Regular broad (VT): amiodarone `300 mg` IV over 10–60 min.',
        'Torsades de pointes: magnesium `2 g` IV over 10 min.',
        'Check and correct potassium (aim `4–5 mmol/L`), magnesium and calcium.',
      ] },
    ],
    doses: [
      { label: 'Adenosine', text: '`6 mg` rapid IV into a large vein with a `20 mL` saline flush; then `12 mg`; then `18 mg`.', drug: 'adenosine' },
      { label: 'Amiodarone', text: 'Stable: `300 mg` IV over 10–60 min, in 5% glucose. After failed shocks: `300 mg` over 10–20 min. Then `900 mg` over 24 h.', drug: 'amiodarone' },
      { label: 'Esmolol', text: '`0.5 mg/kg` IV over 1 min, or `10–20 mg` boluses (`10 mg/mL`).', drug: 'esmolol' },
      { label: 'Magnesium', text: '`2 g` IV over 10 min for torsades or low magnesium.', drug: 'magnesium' },
      { label: 'Synchronised shock', text: 'Biphasic: broad complex `120–150 J`; flutter or regular narrow `70–120 J`; atrial fibrillation start high (up to the maximum). Up to 3 attempts.' },
    ],
    pitfalls: [
      'Under anaesthesia most fast rates are sinus and have a cause: light anaesthesia, bleeding, hypoxia, high CO2. Don\'t treat the number with a beta-blocker before you have found it.',
      'Adenosine: warn an awake patient (a brief awful feeling); avoid it in severe asthma. Lower doses after a heart transplant.',
      'Broad and regular is VT until proven otherwise.',
      'Make sure the defibrillator is set to synchronised mode for every shock, or it may fire on the T wave.',
    ],
    after: [
      '12-lead ECG during and after the rhythm.',
      'New atrial fibrillation or VT: medical or cardiology review, and a plan for anticoagulation.',
      'Electrolytes and troponin as your consultant decides.',
    ],
    related: ['hypotension', 'mh', 'haemorrhage', 'cardiac-arrest'],
  },

  // ---------------------------------------------------------------- LAST
  {
    id: 'last',
    title: 'Local anaesthetic systemic toxicity (LAST)',
    summary: 'Odd brain symptoms, fits or collapse after local anaesthetic: stop, oxygen, lipid.',
    recognise: [
      'Within minutes of an injection (sometimes up to an hour after a big-volume block): numb lips or tongue, metallic taste, ringing ears, light-headed, anxious, confused.',
      'Sudden loss of consciousness or a fit.',
      'Heart: slow or fast rhythms, a widening QRS, ventricular arrhythmias, low blood pressure, cardiac arrest. It can happen without any warning signs.',
      'Under general anaesthesia or sedation the brain signs are hidden: think of it with any unexplained arrhythmia or collapse after a block.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Stop injecting the local anaesthetic.',
        '`100%` oxygen. Open and protect the airway; intubate if needed.',
        'Ventilate well: a high CO2 and acidosis make toxicity worse.',
        'Get the lipid emulsion (Intralipid 20%) and a good IV line.',
        'Fits: midazolam IV, or small doses of propofol if the blood pressure is stable.',
      ] },
      { title: 'Give lipid', items: [
        'Bolus `1.5 mL/kg` IV over 1 min.',
        'Start the infusion at `15 mL/kg/h`.',
        'After 5 min, still unstable: repeat the bolus (up to two more, 5 min apart) and double the infusion to `30 mL/kg/h`.',
        'No more than `12 mL/kg` in total.',
      ] },
      { title: 'Cardiac arrest', items: [
        'CPR as for any arrest, and give the lipid as above.',
        'Adrenaline in smaller doses: `1 mcg/kg` or less.',
        'Arrhythmias: amiodarone. Not lignocaine: it is another local anaesthetic.',
        'Avoid vasopressin, calcium channel blockers and beta-blockers.',
        'Keep going: recovery can take over an hour. Your consultant may consider bypass or extracorporeal membrane oxygenation (ECMO).',
      ] },
    ],
    doses: [
      { label: 'Lipid emulsion 20%', text: 'Bolus `1.5 mL/kg` IV over 1 min (`105 mL` for 70 kg); repeat up to twice, 5 min apart.', drug: 'intralipid' },
      { label: 'Lipid infusion', text: '`15 mL/kg/h` (`1050 mL/h` for 70 kg); double to `30 mL/kg/h` if still unstable. Maximum `12 mL/kg` in total (`840 mL` for 70 kg).', drug: 'intralipid' },
      { label: 'Midazolam', text: 'For fits: `2–5 mg` IV, repeated if needed.', drug: 'midazolam' },
      { label: 'Propofol', text: 'For fits, only if the blood pressure is stable: small doses (`20–50 mg` IV).', drug: 'propofol' },
      { label: 'Adrenaline', text: 'In cardiac arrest: `1 mcg/kg` or less per dose (for 70 kg, `70 mcg` or less = `0.7 mL` of 1:10,000 or `7 mL` of 1:100,000), not the usual `1 mg`.', drug: 'adrenaline' },
      { label: 'Amiodarone', text: 'Ventricular arrhythmias: `300 mg` IV.', drug: 'amiodarone' },
    ],
    pitfalls: [
      'Propofol is not a substitute for lipid: it drops the blood pressure.',
      'Maximum doses (department): lignocaine `3 mg/kg` plain or `7 mg/kg` with adrenaline; ropivacaine `3 mg/kg`; bupivacaine `2 mg/kg`. Different local anaesthetics add up. Work it out with the [maximum dose calculator](#/tools/la-max).',
      'Prevent it: aspirate before injecting, inject slowly in small amounts, use ultrasound, and keep talking to the patient.',
      'Toxicity can start late with plane blocks and catheter infusions.',
    ],
    after: [
      'Watch in a monitored area: at least 2 h after fits alone, 4–6 h after any heart problem; ICU after an arrest.',
      'After lipid, check amylase or lipase daily for 2 days (pancreatitis).',
      'Document the drug, dose, site and timing; tell the patient; report it through the hospital incident system.',
    ],
    related: ['cardiac-arrest', 'bradycardia', 'tachycardia', 'high-spinal'],
  },

  // ---------------------------------------------------------------- high spinal
  {
    id: 'high-spinal',
    title: 'High or total spinal',
    summary: 'Block spreading too high after a spinal or epidural: support breathing and blood pressure.',
    recognise: [
      'After a spinal, an epidural top-up, or a block near the spine (or an epidural catheter that has moved into the spinal space).',
      'Low blood pressure and a slow heart rate; nausea; anxiety.',
      'Tingling or weakness in the hands and arms; a weak voice, can\'t cough, short of breath.',
      'Then drowsy, stops breathing, unconscious; cardiac arrest.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Stop any epidural infusion or injection.',
        'Reassure the patient. `100%` oxygen by mask.',
        'Breathing weak: support it with bag-mask ventilation.',
        'Treat low blood pressure and a slow heart rate now: fluid, ephedrine, phenylephrine, atropine.',
        'Pregnant: tilt to the left, or push the uterus to the left.',
      ] },
      { title: 'Then', items: [
        'Can\'t speak, cough or breathe well, or losing consciousness: anaesthetise and intubate with your consultant (rapid sequence induction, RSI).',
        'Raise the legs; avoid steep head-down tilt, which can spread a heavy spinal higher.',
        'Blood pressure not responding: adrenaline early.',
        'Pregnant: tell the obstetric team and monitor the baby.',
      ] },
      { title: 'If not improving', items: [
        'No pulse: start CPR ([cardiac arrest](#/crisis/cardiac-arrest)).',
        'Pregnant (past about 20 weeks) and in arrest: the obstetrician delivers the baby within 5 min to help the resuscitation.',
        'Keep ventilating, and keep the patient asleep, until the block wears off.',
      ] },
    ],
    doses: [
      { label: 'Ephedrine', text: '`5–10 mg` IV (`1–2 mL` of `5 mg/mL`).', drug: 'ephedrine' },
      { label: 'Phenylephrine', text: '`50–100 mcg` IV (`0.5–1 mL` of `100 mcg/mL`).', drug: 'phenylephrine' },
      { label: 'Atropine', text: '`0.6 mg` IV (`1 mL` of `600 mcg/mL`), repeated up to `3 mg`.', drug: 'atropine' },
      { label: 'Adrenaline', text: '`10–50 mcg` IV (`1–5 mL` of 1:100,000), more if severe.', drug: 'adrenaline' },
      { label: 'Suxamethonium', text: 'RSI: `1–1.5 mg/kg` IV. Use a small dose of induction drug: the blood pressure is already low.', drug: 'suxamethonium' },
    ],
    pitfalls: [
      'The patient may be awake but unable to breathe or speak. Tell them what you are doing.',
      'Once intubated, keep them anaesthetised or sedated: a high block can leave them aware and unable to move.',
      'Prevent it: test doses, slow top-ups in small amounts, and aspirate the epidural catheter before each top-up.',
    ],
    after: [
      'Ventilate until the block recedes and the patient breathes and coughs strongly; this may take a few hours.',
      'Document the drugs, doses, block height and times.',
      'Epidural: don\'t use the catheter again until your consultant has checked it.',
      'Your consultant talks to the patient afterwards about what happened and any awareness.',
    ],
    related: ['hypotension', 'bradycardia', 'last', 'cardiac-arrest'],
  },

  // ---------------------------------------------------------------- MH
  {
    id: 'mh',
    title: 'Malignant hyperthermia (MH)',
    summary: 'Unexplained rising CO2, fast heart rate and rigidity on a volatile or suxamethonium: stop triggers, give dantrolene.',
    recognise: [
      'EtCO2 rising and not falling when you increase ventilation: the earliest sign.',
      'Fast heart rate, arrhythmias, a rising oxygen need, sweating, mottled skin.',
      'Muscle rigidity; a stiff jaw after suxamethonium (masseter spasm).',
      'Temperature rising: often late, then fast.',
      'Soda lime hot and used up quickly. Blood gas: mixed respiratory and metabolic acidosis, high potassium; high creatine kinase (CK) later.',
      'Triggers: volatile agents and suxamethonium. It can start at any time in the anaesthetic or soon after.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Stop all volatile; turn off and remove the vaporiser. No more suxamethonium.',
        '`100%` oxygen at maximum fresh gas flow; hyperventilate (2–3 times the usual minute volume).',
        'Activated charcoal filters on both limbs of the circuit if you have them. Don\'t waste time changing the machine.',
        'Keep the patient asleep with total intravenous anaesthesia (TIVA): propofol and an opioid.',
        'Get the dantrolene and extra people to mix it.',
        'Tell the surgeon: finish or abandon as fast as is safe.',
      ] },
      { title: 'Then', items: [
        'Dantrolene `2.5 mg/kg` IV, as fast as it can be mixed.',
        'Repeat `1 mg/kg` every 5 min until EtCO2 is below `6 kPa` (`45 mmHg`) and core temperature below `38.5 °C`.',
        'Core temperature probe, arterial line, urinary catheter. Blood gas, potassium, CK, clotting.',
        'Cool if the core temperature is above `38.5 °C`: cold IV saline, ice packs to groins and armpits, cold washouts. Stop once below `38.5 °C` to avoid overshooting.',
      ] },
      { title: 'If not improving', items: [
        'High potassium: calcium, insulin and glucose ([hyperkalaemia](#/crisis/hyperkalaemia)).',
        'Arrhythmias: amiodarone or a beta-blocker. Avoid calcium channel blockers: with dantrolene they can cause collapse.',
        'Dark urine (myoglobin): fluid to keep the urine output above `2 mL/kg/h`.',
        'More dantrolene, up to `10 mg/kg`. No response by then: rethink the diagnosis; more only if your consultant decides.',
      ] },
    ],
    doses: [
      { label: 'Dantrolene', text: '`2.5 mg/kg` IV (`175 mg` for 70 kg), then `1 mg/kg` every 5 min as needed, usually up to `10 mg/kg` in all.', drug: 'dantrolene' },
      { label: 'Mixing dantrolene', text: 'Classic vials hold `20 mg`, each mixed with `60 mL` sterile water (not saline or glucose): about 9 vials for the first dose at 70 kg. A newer form is `250 mg` in `5 mL`. Check the label.' },
      { label: 'Calcium chloride 10%', text: 'High potassium: `10 mL` IV.', drug: 'calcium-chloride' },
      { label: 'Insulin and glucose', text: 'High potassium: soluble insulin `10 units` with `25 g` glucose IV.', drug: 'insulin' },
      { label: 'Amiodarone', text: 'Arrhythmias: `300 mg` IV.', drug: 'amiodarone' },
      { label: 'Sodium bicarbonate 8.4%', text: 'Severe metabolic acidosis (pH below `7.2`): `50 mL` (`50 mmol`) IV, as your consultant decides.' },
    ],
    pitfalls: [
      'A rising EtCO2 has other causes (CO2 insufflation, light anaesthesia, sepsis, thyroid storm, exhausted soda lime). But a climbing CO2 with a fast heart rate that you can\'t explain: treat as MH.',
      'Temperature is a late sign: don\'t wait for it.',
      'Classic dantrolene is slow to mix: get several people mixing at once. Each vial contains mannitol, so expect a lot of urine.',
      'Stiff jaw after suxamethonium: tell your consultant at once. It may be the start of MH; switch to TIVA if surgery goes on.',
    ],
    after: [
      'ICU for at least 24 h: MH can come back. Give more dantrolene if signs return.',
      'Check CK, potassium, kidney function, clotting and urine myoglobin.',
      'Expert advice: MH hotlines (such as the one run by the Malignant Hyperthermia Association of the United States) answer day and night. Your consultant decides whether to call.',
      'Your consultant refers the patient (and later the family) for MH testing. Until tested, record "MH susceptible" in Epic and give the patient a letter and an alert card.',
      'Write down the times, drugs, doses, temperatures and blood results.',
    ],
    related: ['hyperkalaemia', 'tachycardia', 'cardiac-arrest'],
  },

  // ---------------------------------------------------------------- hyperkalaemia
  {
    id: 'hyperkalaemia',
    title: 'Hyperkalaemia',
    summary: 'High potassium: calcium to protect the heart, insulin and glucose to move it, then remove it.',
    recognise: [
      'Potassium `6.5 mmol/L` or more (severe), or any high potassium with ECG changes.',
      'ECG: tall peaked T waves, flat or absent P waves, a wide QRS, a sine wave, slow rhythms, VT, VF or asystole.',
      'In theatre: suxamethonium in someone at risk (burns, crush, immobility, nerve or muscle disease), kidney failure or a missed dialysis, a large transfusion, a tourniquet or clamp released, malignant hyperthermia, acidosis.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Stop anything that adds potassium (potassium chloride, KCl, in a drip).',
        'Confirm it: blood gas potassium (a haemolysed lab sample reads falsely high) and the ECG.',
        'ECG changes: calcium IV now to protect the heart.',
        'On a ventilator: increase ventilation. A lower CO2 moves potassium into cells.',
      ] },
      { title: 'Then', items: [
        'Insulin `10 units` with glucose `25 g` IV.',
        'Awake: salbutamol nebuliser.',
        'Acidotic: sodium bicarbonate, as your consultant decides.',
        'Recheck potassium and glucose.',
      ] },
      { title: 'If not improving', items: [
        'ECG still abnormal 5–10 min after calcium: repeat the calcium.',
        'Dialysis: your consultant calls the kidney team.',
        'Cardiac arrest: calcium chloride `10 mL` 10% fast, insulin and glucose, bicarbonate; your consultant may consider dialysis during CPR.',
      ] },
    ],
    doses: [
      { label: 'Calcium chloride 10%', text: '`10 mL` IV over 5–10 min (fast in arrest), into a large vein. Repeat if the ECG is still abnormal.', drug: 'calcium-chloride' },
      { label: 'Calcium gluconate 10%', text: '`30 mL` IV over 5–10 min: the same calcium as `10 mL` of calcium chloride.', drug: 'calcium-gluconate' },
      { label: 'Insulin and glucose', text: 'Soluble insulin `10 units` with `25 g` glucose IV (`250 mL` of 10% over 15 min, or `50 mL` of 50% into a large vein).', drug: 'insulin' },
      { label: 'Glucose', text: 'Glucose under `7 mmol/L` before treatment: follow with a 10% dextrose infusion as your consultant decides.', drug: 'dextrose' },
      { label: 'Salbutamol', text: 'Awake: `10–20 mg` nebulised.', drug: 'salbutamol' },
      { label: 'Sodium bicarbonate 8.4%', text: '`50 mL` (`50 mmol`) IV in severe acidosis or cardiac arrest.' },
    ],
    pitfalls: [
      'Calcium protects the heart for 30–60 min; it does not lower the potassium.',
      'Insulin causes hypoglycaemia: check glucose before, then every 30–60 min for at least 6 h.',
      'Calcium and bicarbonate together form a solid: flush between them or use separate lines.',
      'Calcium chloride burns if it leaks: use a large vein or a central line.',
    ],
    after: [
      'Recheck potassium at 1, 2, 4 and 6 h, and glucose as above.',
      'Find and stop the cause; review drugs that raise potassium.',
      'Still high, or kidney failure: dialysis or a potassium binder, as the medical team decides.',
    ],
    related: ['cardiac-arrest', 'bradycardia', 'mh', 'haemorrhage'],
  },

  // ---------------------------------------------------------------- opioid overdose
  {
    id: 'opioid-overdose',
    title: 'Opioid overdose',
    summary: 'Drowsy, slow breathing, pinpoint pupils: airway, oxygen, breathe for them, small doses of naloxone.',
    recognise: [
      'Drowsy or hard to rouse; slow, shallow breathing (below `8` a minute); snoring or an obstructed airway.',
      'Pinpoint pupils.',
      'The SpO2 falls late if the patient is on oxygen: CO2 builds up first.',
      'Usually in the post-anaesthesia care unit (PACU) or on the ward: after boluses, patient-controlled analgesia (PCA), intrathecal or epidural morphine (up to 24 h later), in kidney failure, the elderly, obstructive sleep apnoea, or with sedatives (benzodiazepines, gabapentinoids).',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Call their name, shake them, rub the sternum.',
        'Open the airway: chin lift, jaw thrust. `15 L/min` oxygen by mask.',
        'Breathing very slowly or not at all: bag-mask ventilation.',
        'Stop the opioid: PCA, infusion, epidural opioid.',
        'Check the anaesthetic chart and drug chart for what was given, and check the glucose.',
      ] },
      { title: 'Then', items: [
        'Naloxone IV in small steps every 2 min until breathing is adequate and they rouse. Not until they are wide awake.',
        'No IV: naloxone IM.',
        'Look for other causes: residual paralysis, hypoglycaemia, stroke, high CO2, sepsis, benzodiazepines.',
      ] },
      { title: 'If not improving', items: [
        'No response after a total of `400 mcg`: look hard for another cause, and keep supporting breathing.',
        'Drowsiness comes back: repeat boluses, start an infusion, move to high dependency (HD).',
        'Benzodiazepine as well: flumazenil only if your consultant agrees.',
      ] },
    ],
    doses: [
      { label: 'Naloxone IV', text: '`400 mcg` made up to `10 mL` saline (`40 mcg/mL`): give `40–100 mcg` (`1–2.5 mL`) every 2 min. Respiratory arrest: `400 mcg` at once.', drug: 'naloxone' },
      { label: 'Naloxone IM', text: 'No IV: `400 mcg` IM; repeat after 2–3 min if needed.', drug: 'naloxone' },
      { label: 'Naloxone infusion', text: 'Each hour, two-thirds of the total dose that worked, in saline; adjust to breathing and sedation.', drug: 'naloxone' },
      { label: 'Flumazenil', text: 'Benzodiazepine reversal, only with your consultant: `200 mcg` IV, then `100 mcg` every minute, up to `1 mg`.', drug: 'flumazenil' },
    ],
    pitfalls: [
      'Naloxone wears off in 30–60 min; morphine and oxycodone last longer. Sedation can come back.',
      'Large doses reverse the pain relief too: severe pain, agitation, high blood pressure, pulmonary oedema, arrhythmias. Titrate.',
      'Oxygen hides slow breathing on the oximeter: count the breaths and check how sedated they are.',
      'Patients on long-term opioids can go into withdrawal: use even smaller steps.',
      'Flumazenil can cause fits, especially in long-term benzodiazepine users.',
    ],
    after: [
      'Monitor for at least 2 h after the last naloxone dose; longer after slow-release, intrathecal or epidural opioids.',
      'Review the pain plan with the acute pain service (APS): reduce or stop the PCA, add non-opioid pain relief.',
      'Document it; report it through the hospital incident system if a drug error contributed.',
    ],
    related: ['hypoxia', 'hypoglycaemia', 'hypotension'],
  },

  // ---------------------------------------------------------------- hypoglycaemia
  {
    id: 'hypoglycaemia',
    title: 'Hypoglycaemia',
    summary: 'Glucose below 4 mmol/L: IV glucose if asleep or fasting, recheck in 15 min, find the cause.',
    recognise: [
      'Glucose below `4 mmol/L`.',
      'Awake: sweaty, shaky, hungry, confused, odd behaviour, drowsy, fits.',
      'Under anaesthesia the signs are hidden: sweating, fast heart rate, high blood pressure, slow wake-up, fits.',
      'At risk: insulin or a sulfonylurea while fasting, an insulin infusion, insulin for hyperkalaemia, liver disease, sepsis, alcohol, small or frail patients.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Check the capillary glucose (send a lab sample if in doubt, but don\'t wait for it).',
        'Pause any insulin infusion.',
        'Asleep, fasting or unable to swallow: IV glucose.',
        'Awake, able to swallow and allowed to eat or drink: `15–20 g` of quick sugar by mouth.',
      ] },
      { title: 'Then', items: [
        'Recheck glucose after 10–15 min. Still below `4 mmol/L`: repeat the glucose.',
        'Once above `4 mmol/L` and still fasting: start a glucose-containing drip.',
        'Restart insulin at a lower rate as your consultant decides: never leave a type 1 diabetic without insulin.',
        'Find the cause.',
      ] },
      { title: 'If not improving', items: [
        'No IV access: glucagon IM.',
        'Keeps falling: think sulfonylurea or long-acting insulin, liver failure, adrenal insufficiency, sepsis.',
        'Recheck glucose every 15–30 min until stable.',
      ] },
    ],
    doses: [
      { label: 'Glucose 10%', text: '`150–200 mL` IV over 15 min (`15–20 g`).', drug: 'dextrose' },
      { label: 'Glucose 50%', text: '`30–50 mL` IV (`15–25 g`), only into a large vein that runs freely, then flush (it damages veins if it leaks).', drug: 'dextrose' },
      { label: 'Glucagon', text: 'No IV: `1 mg` IM. Works poorly in liver disease, alcohol excess or starvation.' },
      { label: 'By mouth', text: '`15–20 g` quick sugar (for example `150–200 mL` fruit juice), then a longer-acting snack.' },
    ],
    pitfalls: [
      'Hypoglycaemia under anaesthesia looks like light anaesthesia: check the glucose in any diabetic with a fast heart rate, sweating or a slow wake-up.',
      'Beta-blockers hide the warning signs.',
      'Sulfonylurea or long-acting insulin: the low glucose can come back for 24 h or more.',
      'Check the anaesthetic chart: insulin given for hyperkalaemia earlier is an easy cause to miss.',
    ],
    after: [
      'Glucose hourly until stable, then as the diabetes plan says.',
      'Review the diabetes medicines and the fasting plan with the medical team.',
      'Document it, including what caused it.',
    ],
    related: ['opioid-overdose', 'hyperkalaemia'],
  },

  // ---------------------------------------------------------------- neck haematoma
  {
    id: 'neck-haematoma',
    title: 'Neck haematoma after surgery',
    summary: 'Swelling after neck surgery with breathing trouble: open the wound at the bedside (SCOOP).',
    recognise: [
      'After thyroid, parathyroid, carotid or anterior cervical spine surgery, usually in the first hours.',
      'Swelling, a tense neck, pain or pressure, bleeding from the wound or drain.',
      'Trouble swallowing, voice change, noisy breathing (stridor), anxiety, fast breathing.',
      'SpO2 falls late.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Ask for the surgeon and your consultant at once. Bring the difficult airway trolley.',
        'Sit the patient up. `15 L/min` oxygen by mask.',
        'Stridor or breathing getting worse: open the wound now, at the bedside. Don\'t wait for theatre.',
      ] },
      { title: 'SCOOP: open the wound', items: [
        'Skin exposure: take off the dressing.',
        'Cut the sutures or remove the clips.',
        'Open the skin.',
        'Open the muscle layer.',
        'Pack the wound loosely with a swab, or leave it open.',
      ] },
      { title: 'Then', items: [
        'Theatre to stop the bleeding.',
        'Intubation may be very hard (airway swelling): the most experienced anaesthetist does it, ready for a front of neck airway.',
        'Opening the wound may not fix it straight away: the airway swelling can last.',
        'Can\'t oxygenate: [CICO](#/crisis/cico).',
      ] },
    ],
    pitfalls: [
      'The swelling outside is only part of it: blood stops the veins draining, and the larynx swells inside.',
      'Don\'t give sedatives to an agitated patient: agitation can be hypoxia.',
      'Opening the wound is messy but safe and fast. Anyone trained can do it when the airway is at risk.',
    ],
    after: [
      'High dependency (HD) or ICU; the neck can bleed again in the first 24 h.',
      'Document the times and who did what.',
      'Debrief the team.',
    ],
    related: ['cico', 'failed-intubation', 'hypoxia'],
  },

  // ---------------------------------------------------------------- equipment failure
  {
    id: 'equipment-failure',
    title: 'Oxygen, ventilator or power failure',
    summary: 'The machine, the gas or the power fails: hand-ventilate, switch to the backups, keep the patient asleep.',
    recognise: [
      'Oxygen supply failure: the oxygen supply alarm sounds, the pipeline gauge falls, the oxygen flowmeter drops and the inspired oxygen falls.',
      'Wrong gas in the pipe: the inspired oxygen reads low while the pipeline pressure looks normal.',
      'Ventilator failure: no breaths, a ventilator fault alarm, or a low-pressure or disconnection alarm that does not clear.',
      'Power failure: lights, screens or the machine go off or switch to battery.',
      'Vaporiser empty, leaking or not working: end-tidal agent falling, heart rate and blood pressure rising, the patient moving.',
    ],
    steps: [
      { title: 'Immediately', items: [
        'Look at the patient: SpO2, EtCO2, chest moving, a pulse.',
        'Switch to the bag and hand-ventilate.',
        'Oxygen alarm or low inspired oxygen: open the backup oxygen cylinder on the machine.',
        'Low inspired oxygen with a normal pipeline pressure: open the cylinder **and** unplug the oxygen hose from the wall. The machine uses pipeline gas first while it has pressure.',
        'You can\'t ventilate through the machine and can\'t see why within seconds: take the patient off it. Self-inflating bag on the portable oxygen cylinder, or on room air if there is no oxygen.',
      ] },
      { title: 'Then', items: [
        'Keep the patient asleep. No fresh gas, no vaporiser or on a self-inflating bag: switch to total intravenous anaesthesia (TIVA) with propofol.',
        'On cylinder oxygen: keep the fresh gas flow low and watch the gauge. If the ventilator is driven by oxygen, hand-ventilate to make the cylinder last.',
        'Power failure: check the battery signs on the machine and monitors, get a torch or phone light, feel the pulse and use a manual blood pressure cuff if the monitor goes off.',
        'Ask the surgeon to stop at a safe point.',
        'The theatre team calls for the technicians and brings a spare machine, monitor, cylinders and suction.',
      ] },
      { title: 'If not improving', items: [
        'Change to another machine or a portable ventilator with your consultant.',
        'Still low SpO2 on a self-inflating bag: follow the [hypoxia](#/crisis/hypoxia) card.',
        'Pumps and suction need power or battery: have manual suction ready and check the pumps are still running.',
      ] },
    ],
    doses: [
      { label: 'Propofol', text: 'To keep the patient asleep once the volatile stops: `0.5–1 mg/kg` IV, then an infusion of `4–10 mg/kg/h` (or TCI). Less if the blood pressure is low.', drug: 'propofol' },
    ],
    pitfalls: [
      'A self-inflating bag with a mask and a full portable oxygen cylinder must be in every theatre: check at the start of the list.',
      'Turning up the flowmeter with no supply gives nothing. Air keeps gas flowing but only `21%` oxygen.',
      'With the volatile off and nothing given IV, the patient will wake and may be aware: give propofol early.',
      'A pipeline or power failure often hits more than one theatre: tell the theatre coordinator.',
    ],
    after: [
      'Take the faulty equipment out of use, label it and report it through the hospital incident system.',
      'Document what happened, the times, the lowest SpO2 and what you gave.',
      'Your consultant talks to the patient if there was any risk of awareness or harm.',
      'Debrief the team.',
    ],
    related: ['hypoxia', 'high-airway-pressure', 'cardiac-arrest'],
  },
];
