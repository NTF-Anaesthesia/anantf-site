// Branching case scenarios. Format: CONTENT.md, "Scenarios".
// Each case: a start node, decision nodes with vitals and 3–4 choices (good: true, 'ok' or false), at least one end, a debrief.
// Local rules and doses follow the department's MO handbook (4th edition, 2026); "beyond" cases follow current mainstream practice.

export const SCENARIOS = [
  // ------------------------------------------------------------------ 1
  {
    id: 'first-induction',
    title: 'Your first induction',
    setting: 'Elective list, 08:30',
    level: 'core',
    summary: 'Preoxygenate, induce, then find the mask hard to bag: what you do in the next two minutes.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 45-year-old man, `85 kg`, BMI 31, ASA 2 (treated hypertension, snores, full beard), for a laparoscopic inguinal hernia repair. The agreed plan: fentanyl, propofol, rocuronium and a tracheal tube. Monitors are on and your consultant stands beside you: “Your induction. I’m right here.” You hold the face mask on with one hand. After a minute the end-tidal oxygen (EtO2) reads only `62%`, the reservoir bag barely moves and you can hear a hiss around his beard.',
        vitals: { HR: 84, BP: '148/90', SpO2: 98, RR: 16 },
        choices: [
          { text: 'Fix the seal first: reposition the mask, use two hands, sit him up a little, and keep going until the EtO2 is over `80%`, ideally `90%` or more.', next: 'b', good: true, feedback: 'Right. A leak lets room air in, so the EtO2 can’t rise. The handbook’s minimum is an EtO2 above `80%`; aim for `90%` or more, because the oxygen stored in his lungs is what keeps him safe while he isn’t breathing. A beard and a BMI of 31 also warn you that bagging may be hard: worth saying out loud now.' },
          { text: 'Turn the oxygen flow up to `15 L/min` and keep the same grip.', next: 'a', good: false, feedback: 'More flow doesn’t fix a leak: room air is still sucked in around the mask with every breath. Fix the seal (two hands if needed, a little head-up) and watch the EtO2 climb.' },
          { text: 'Start the induction: `62%` will do because your consultant is here.', next: 'a', good: false, feedback: 'Your consultant shakes their head: “Let’s get the EtO2 up first.” The handbook’s minimum is above `80%`, and you should aim for `90%`. Heavier patients and men with beards are exactly the ones who desaturate fast and are hard to bag.' },
        ],
      },
      b: {
        text: 'With two hands and a better seal the bag moves well. After 3 minutes the EtO2 is `91%`. Your consultant: “Fentanyl `100 mcg` is in. Go ahead with the propofol.”',
        vitals: { HR: 80, BP: '144/88', SpO2: 100, RR: 14 },
        choices: [
          { text: 'Give propofol `150 mg` (about `1.8 mg/kg`) steadily over about 30 seconds, talking to him, and watch him go off.', next: 'c', good: true, feedback: 'The handbook dose is `1–2 mg/kg`; for a fit `85 kg` man `150 mg` is about right. Give it steadily, not as a slam, and watch: the eyelash reflex going and his breathing slowing tell you it is working.' },
          { text: 'Give rocuronium `50 mg` first, then the propofol, so the airway is easier.', next: 'b', good: false, feedback: 'Never paralyse an awake patient: it is terrifying and dangerous. And the department’s order (handbook step 8) is to give the muscle relaxant only after you have shown you can bag. Your consultant stops you.' },
          { text: 'Give propofol `300 mg` quickly so he is definitely asleep.', next: 'b', good: false, feedback: '`300 mg` is about `3.5 mg/kg`, well above the `1–2 mg/kg` range, and a fast push drops the blood pressure hard. Your consultant stops you: give a sensible dose and titrate to effect.' },
        ],
      },
      c: {
        text: 'He stops responding, the eyelash reflex has gone and he stops breathing. You lift the jaw and squeeze the bag with the adjustable pressure-limiting (APL) valve at `20 cmH2O`. The chest hardly rises, the bag feels stiff and the capnograph shows only a tiny bump.',
        vitals: { HR: 76, BP: '118/72', SpO2: 97, EtCO2: 8 },
        choices: [
          { text: 'Say it out loud: “I’m finding this hard to bag.” Then fix the basics: head tilt, chin lift, a firm jaw thrust and a better mask seal.', next: 'd', good: true, feedback: 'Saying it early is the most useful thing you can do: your consultant can only help with a problem they know about. Then the basics: head position, jaw thrust and a good seal fix most difficult mask ventilation.' },
          { text: 'Reach for the rocuronium: once he is relaxed, bagging will be easier.', next: 'c2', good: false, feedback: 'Your consultant stops your hand. The handbook rule is the reverse: give the relaxant only after you have shown you can bag (step 8). In experienced hands a relaxant sometimes makes bagging easier, but that is your consultant’s decision after the basics, not yours. Meanwhile the saturation is falling.' },
          { text: 'Close the APL valve fully and squeeze hard to force gas in.', next: 'c2', good: false, feedback: 'High pressure blows gas into the stomach rather than the lungs. That makes regurgitation and aspiration more likely, and a full stomach makes bagging even harder. Keep the APL valve around `20 cmH2O` and fix the airway instead.' },
          { text: 'Keep trying quietly with one hand; you don’t want to look as if you can’t do it.', next: 'c2', good: false, feedback: 'Everyone finds some patients hard to bag. Struggling in silence spends the oxygen you built up. The department rule: when anything is out of the ordinary, the first step is to call for help.' },
        ],
      },
      c2: {
        text: 'Thirty seconds have gone. SpO2 is `90%` and falling, the bag is still stiff and his abdomen looks fuller. Your consultant steps in: “Let’s do this together.”',
        vitals: { HR: 94, BP: '128/80', SpO2: 90, EtCO2: 5 },
        choices: [
          { text: 'Put in an oropharyngeal airway, then hold the mask with two hands and a jaw thrust while your consultant squeezes the bag.', next: 'e', good: true, feedback: 'Two people, two hands and an airway adjunct: the strongest basic technique. Two hands on the mask give a far better seal and jaw thrust than one hand can.' },
          { text: 'Stop bagging and wait for him to start breathing on his own.', next: 'c2', good: false, feedback: 'Propofol and fentanyl stop breathing for several minutes, far longer than his oxygen will last now. Keep oxygenating.' },
          { text: 'Keep squeezing harder with the APL valve closed.', next: 'bad', good: false, feedback: 'Each hard squeeze pushes more gas into his stomach.' },
        ],
      },
      d: {
        text: 'With a firm jaw thrust and a better seal the chest moves a little and the capnograph shows small waves, but it is still hard work.',
        vitals: { HR: 78, BP: '116/70', SpO2: 95, EtCO2: 22 },
        choices: [
          { text: 'Put in an oropharyngeal airway (sized from the corner of the mouth to the angle of the jaw) and switch to two hands on the mask while your consultant squeezes the bag.', next: 'e', good: true, feedback: 'Exactly. The oral airway lifts the tongue off the back of the throat, and two hands give the best seal and jaw thrust.' },
          { text: 'Put in a nasopharyngeal airway.', next: 'e', good: 'ok', feedback: 'It helps too, but in a deeply unconscious patient an oral airway is quicker and doesn’t risk a nosebleed. The nasal airway is useful when the jaw is clenched or the patient is lighter.' },
          { text: 'Ask the AU (anaesthetic unit) nurse for a supraglottic airway straight away.', next: 'd', good: 'ok', feedback: 'Your consultant: “Get it ready, but let’s try an oral airway and two hands first.” A supraglottic airway is the right rescue if the basics fail, and having it ready is good thinking.' },
          { text: 'Stop and let the propofol wear off so he wakes up.', next: 'd', good: false, feedback: 'Propofol can’t be reversed, and while it wears off he still needs oxygen. Waking up is a plan for a failed airway, but only while you keep oxygenating. Keep ventilating and improve the airway.' },
        ],
      },
      e: {
        text: 'With the airway adjunct in and two hands on the mask, the chest rises well, the bag feels soft and the capnograph shows a square trace. Your consultant: “Good. Now what?”',
        vitals: { HR: 74, BP: '114/70', SpO2: 99, EtCO2: 36 },
        choices: [
          { text: 'Give rocuronium `50 mg` (about `0.6 mg/kg`) and keep bagging for about 3 minutes until it has fully worked, then laryngoscopy.', next: 'f', good: true, feedback: 'The handbook order exactly: show you can bag, then give the relaxant (step 8), and keep bagging while it takes effect, about 3 minutes (step 9).' },
          { text: 'Give rocuronium and intubate straight away.', next: 'e', good: false, feedback: 'Rocuronium at `0.6 mg/kg` takes 2–3 minutes to give good intubating conditions. Going in early means a cough, moving cords and a poor view. Your consultant asks you to wait and keep bagging.' },
          { text: 'Give rocuronium, then stop bagging while it works so the stomach doesn’t fill with gas.', next: 'e', good: false, feedback: 'Gentle bagging at `20 cmH2O` through a clear airway sends gas to the lungs, not the stomach. Stopping now wastes the oxygen reserve you have just rebuilt. Keep bagging (step 9).' },
        ],
      },
      f: {
        text: 'Three minutes later you look with the laryngoscope, see the cords and pass a size 8.0 tube. You inflate the cuff. How do you confirm it is in the trachea?',
        vitals: { HR: 88, BP: '132/80', SpO2: 99 },
        choices: [
          { text: 'Look for a sustained square capnography trace over several breaths, both sides of the chest rising, and breath sounds in both armpits (and none over the stomach).', next: 'good', good: true, feedback: 'A sustained trace is the one check you can never skip: no trace, wrong place. Chest rise and listening on both sides (handbook step 11) tell you it isn’t too deep.' },
          { text: 'You saw it go through the cords, so it is in.', next: 'f', good: false, feedback: 'Even experts are sometimes wrong about what they saw. Confirm every tube with sustained capnography.' },
          { text: 'The SpO2 is still `99%`, so the tube must be in the trachea.', next: 'f', good: false, feedback: 'After good preoxygenation the saturation can stay high for minutes with the tube in the oesophagus. Saturation is a late sign; the capnograph is the early one.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'A square capnography trace, EtCO2 `36 mmHg`, both sides moving and equal breath sounds. You tape the tube at `23 cm` at the teeth, tape the eyes and switch to the ventilator. Your consultant: “Well done for saying early that it was hard.”',
        vitals: { HR: 82, BP: '126/78', SpO2: 99, EtCO2: 36 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'Gastric fluid wells up in his mouth. Your consultant takes over, suctions, intubates and suctions the tube, but he has aspirated. The operation is cancelled and he spends the night in the intensive care unit (ICU) with aspiration pneumonitis.',
        vitals: { HR: 118, BP: '102/60', SpO2: 88, EtCO2: 30 },
      },
    },
    debrief: [
      'Preoxygenate until the EtO2 is above `80%` (the handbook’s minimum), aiming for `90%` or more. A leak is the usual reason it won’t rise: fix the seal.',
      'Predict a hard mask before you start: beard, obesity, no teeth, age over 55, snoring or sleep apnoea. Tell your consultant.',
      'When bagging is hard, say so out loud early. Then: head tilt and jaw thrust, an oral airway, two hands on the mask with someone else squeezing. Keep the APL valve around `20 cmH2O`.',
      'Muscle relaxant only after you have shown you can bag, then keep bagging for about 3 minutes while it works (handbook steps 8–9).',
      'Every tube: sustained capnography. No trace, wrong place. Read [Bag-mask ventilation](#/learn/induction/mask-ventilation).',
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    id: 'desat-intubated',
    title: 'SpO2 falling after intubation',
    setting: 'Elective list, 09:10',
    level: 'core',
    summary: 'The saturation drifts down after a smooth intubation: use the capnograph and DOPES to find out why.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 52-year-old woman, `70 kg`, with mild asthma (a salbutamol inhaler she rarely needs), for a laparoscopic cholecystectomy. You intubated her with a size 7.0 tube under your consultant’s eye; the AU nurse taped it and you switched to the ventilator. Your consultant has gone to the control room to take a call (“Call me for anything”). Three minutes later the pitch of the oximeter tone starts to drop.',
        vitals: { HR: 96, BP: '134/82', SpO2: 92, EtCO2: 33, RR: 12 },
        choices: [
          { text: 'Turn the oxygen to `100%`, ask the AU nurse to call your consultant, and look at the capnograph trace and the airway pressure.', next: 'b', good: true, feedback: 'Oxygen and help first, then look for the cause. The capnograph and the airway pressure are the fastest clues you have.' },
          { text: 'Check the finger probe first: it is probably a poor signal.', next: 'a2', good: false, feedback: 'The pleth trace looks good and the number is falling steadily: treat it as real. Look at the probe after you have given oxygen and called.' },
          { text: 'Give salbutamol through the circuit: she has asthma.', next: 'a2', good: false, feedback: 'You don’t know the cause yet, and treating a guess wastes time. Oxygen and help first, then look for the cause step by step.' },
          { text: 'Turn the sevoflurane up: she may be light.', next: 'a2', good: false, feedback: 'Nothing here suggests she is light, and a deeper anaesthetic does nothing for a falling saturation. Oxygen, help, then look for the cause.' },
        ],
      },
      a2: {
        text: 'Another minute has gone. SpO2 is now `87%`.',
        vitals: { HR: 104, BP: '138/84', SpO2: 87, EtCO2: 32, RR: 12 },
        choices: [
          { text: 'Oxygen to `100%`, call your consultant now, and look at the capnograph and the airway pressure.', next: 'b', good: true, feedback: 'Better late than never. When something is going wrong, the first step is to call for help, while you give oxygen and start looking.' },
          { text: 'Keep watching: it may pick up.', next: 'a2', good: false, feedback: 'Falling saturation rarely fixes itself. Every minute you wait uses up her reserve. Act now.' },
          { text: 'Pull the tube out and bag her by face mask: it must be in the oesophagus.', next: 'out', good: false, feedback: 'You haven’t looked at the capnograph, which shows a trace with every breath. Taking out a tube that is working turns one problem into two.' },
        ],
      },
      b: {
        text: 'Oxygen is at `100%` and your consultant is on the way. The capnograph shows a normal square trace with every breath, EtCO2 `32 mmHg`. Peak airway pressure is `30 cmH2O`; it was `18` just after intubation. What does the capnograph tell you?',
        vitals: { HR: 100, BP: '136/84', SpO2: 90, EtCO2: 32, RR: 12 },
        choices: [
          { text: 'The tube is in the airway (a sustained trace rules out the oesophagus). Something else is wrong: work through DOPES.', next: 'c', good: true, feedback: 'Right. A sustained square trace means the tube is in the trachea or a bronchus. Now DOPES: Displacement (out, or too deep), Obstruction (kink, secretions, biting), Pneumothorax, Equipment (circuit, oxygen supply, ventilator), Stacking of breaths (and bronchospasm).' },
          { text: 'The tube is in the oesophagus: take it out.', next: 'out', good: false, feedback: 'A sustained trace with every breath can’t come from the oesophagus. Taking out a tube that is in the airway turns one problem into two.' },
          { text: 'The trace is normal, so the oximeter must be wrong.', next: 'b', good: false, feedback: 'A normal capnograph doesn’t mean normal oxygenation. A tube in one lung gives a good trace while blood flowing past the other lung picks up no oxygen. Think again.' },
        ],
      },
      c: {
        text: 'Your consultant is still a minute away. How do you work through it?',
        vitals: { HR: 102, BP: '134/80', SpO2: 89, EtCO2: 33, RR: 12 },
        choices: [
          { text: 'Switch to the bag on `100%` oxygen to feel the lungs, look at both sides of the chest, listen in both armpits, and read the tube length at the teeth.', next: 'd', good: true, feedback: 'Hand ventilating lets you feel how stiff the lungs are; looking and listening tells you whether both sides are working; the length at the teeth tells you about displacement. Quick and thorough.' },
          { text: 'Pass a suction catheter down the tube.', next: 'd', good: 'ok', feedback: 'Reasonable, since it checks for obstruction: the catheter passes easily and there are no secretions. But hand ventilating, looking and listening would have told you more, faster.' },
          { text: 'Ask for a chest X-ray.', next: 'c', good: false, feedback: 'Far too slow while the saturation is falling. Your eyes, your ears and your hand on the bag come first.' },
        ],
      },
      d: {
        text: 'The right side of the chest rises more than the left and breath sounds are quiet on the left. The bag feels a little stiff. The tube is at `25 cm` at the teeth.',
        vitals: { HR: 104, BP: '132/80', SpO2: 88, EtCO2: 34, RR: 12 },
        choices: [
          { text: 'Tell your consultant as they walk in: “The tube is at `25 cm` and air entry is quiet on the left: I think it’s in the right main bronchus.” With their OK, let the cuff down, pull back to `21 cm`, reinflate and listen again.', next: 'e', good: true, feedback: 'Yes. In most women the tube sits about `21 cm` at the teeth (about `23 cm` in men). Too deep, it slips into the right main bronchus, which is wider and straighter, and the left lung gets no ventilation.' },
          { text: 'It’s a left pneumothorax: ask for a cannula to decompress the chest.', next: 'd', good: false, feedback: 'A tension pneumothorax brings falling blood pressure, a rising heart rate and a silent, overinflated side. Here the tube is plainly too deep: fix the simple, likely cause first. Your consultant asks you to look at the tube again.' },
          { text: 'It’s bronchospasm: give salbutamol.', next: 'd', good: false, feedback: 'Bronchospasm wheezes on both sides and slopes the capnograph trace. One quiet side with a deep tube is a tube problem.' },
          { text: 'Pull the tube back `10 cm` to be sure it’s out of the bronchus.', next: 'out', good: false, feedback: 'That puts the cuff at or above the cords. Make small moves, with the cuff down, and listen after each.' },
        ],
      },
      e: {
        text: 'Air entry is now equal, peak pressure `19 cmH2O` and SpO2 back to `99%`. The tube is retaped at `21 cm` and your consultant goes back to the control room. Twenty minutes into surgery, as the surgeon starts dissecting, the peak pressure climbs to `34 cmH2O`, you hear wheeze on both sides, and the capnograph upstroke slopes like a shark fin.',
        vitals: { HR: 112, BP: '150/92', SpO2: 94, EtCO2: 40, RR: 12 },
        choices: [
          { text: '`100%` oxygen, call your consultant, deepen the anaesthetic (sevoflurane opens the airways), give salbutamol into the circuit, and check for anaphylaxis and for a kinked or bitten tube.', next: 'f', good: true, feedback: 'This is bronchospasm, probably light anaesthesia meeting surgical stimulation in an asthmatic. A deeper volatile and salbutamol (`6–10 puffs` through an adaptor into the circuit, repeated) treat it. Always look for anaphylaxis (rash, falling blood pressure) and a mechanical cause too.' },
          { text: 'Pull the tube back again: it must have slipped in.', next: 'e', good: false, feedback: 'Wheeze on both sides with a sloping trace is the small airways, not the tube position, and the tube is still at `21 cm`. Pulling back now risks extubation.' },
          { text: 'Give more rocuronium.', next: 'e', good: false, feedback: 'Muscle relaxants relax skeletal muscle, not the smooth muscle of the airways. A relaxant helps if she is coughing on the tube, but it doesn’t treat bronchospasm.' },
          { text: 'Turn up the breathing rate to bring the EtCO2 down.', next: 'e', good: false, feedback: 'In bronchospasm the problem is getting gas out. A faster rate leaves less time to breathe out, so gas is trapped and the pressures climb further.' },
        ],
      },
      f: {
        text: 'After two doses of salbutamol and a deeper anaesthetic the wheeze is easing: peak pressure `26 cmH2O`, SpO2 `97%`. Your consultant asks how you would set the ventilator.',
        vitals: { HR: 104, BP: '138/84', SpO2: 97, EtCO2: 44, RR: 10 },
        choices: [
          { text: 'A slower rate and a longer time to breathe out (I:E ratio `1:3`), accepting an EtCO2 a little higher than usual.', next: 'good', good: true, feedback: 'Giving time to breathe out lets the trapped gas escape and brings the pressures down. A slightly higher CO2 does no harm for a while.' },
          { text: 'Add PEEP of `15 cmH2O` to hold the airways open.', next: 'f', good: false, feedback: 'High PEEP adds to the trapped gas and the pressure in the chest. Keep a modest PEEP and give time to breathe out.' },
          { text: 'A faster rate with smaller breaths.', next: 'f', good: false, feedback: 'A faster rate shortens the time to breathe out, which is the opposite of what she needs.' },
        ],
      },
      out: {
        text: 'The tube comes out. The capnograph trace disappears and SpO2 is `84%`.',
        vitals: { HR: 118, BP: '146/90', SpO2: 84, EtCO2: 0, RR: 0 },
        choices: [
          { text: 'Call for help, then `100%` oxygen by face mask with an oral airway and two hands, and get ready for your consultant to reintubate.', next: 'okEnd', good: true, feedback: 'Back to basics: oxygenate by mask while help comes. A well-oxygenated patient can wait for an expert to reintubate.' },
          { text: 'Push the tube back in without looking.', next: 'bad', good: false, feedback: 'Blind attempts usually go into the oesophagus and cost more time and oxygen.' },
          { text: 'Put in a supraglottic airway yourself and bag through it.', next: 'okEnd', good: 'ok', feedback: 'A supraglottic airway is a fair rescue if the face mask fails, but a mask with an oral airway and two hands is quicker and comes first. Your consultant arrives as you get oxygen in.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'The wheeze settles and the surgery finishes without further trouble. At the end your consultant takes her through emergence and she wakes comfortably. You found a tube in the bronchus and treated bronchospasm, both in the right order.',
        vitals: { HR: 90, BP: '128/78', SpO2: 98, EtCO2: 40, RR: 12 },
      },
      okEnd: {
        end: true, outcome: 'ok',
        text: 'Your consultant reintubates with a fresh tube, taped at `21 cm`. The trace returns and the saturation recovers. She comes to no harm, but a working airway was lost and she was short of oxygen for a few minutes.',
        vitals: { HR: 100, BP: '136/82', SpO2: 98, EtCO2: 36, RR: 12 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'The tube goes into the oesophagus: no trace. By the time your consultant arrives and reintubates, the saturation has been below `70%` for over a minute and she has a slow heart rate. She recovers, but the operation is abandoned and she goes to high dependency (HD) for observation.',
        vitals: { HR: 52, BP: '98/58', SpO2: 92, EtCO2: 30, RR: 12 },
      },
    },
    debrief: [
      'Falling SpO2 in an intubated patient: `100%` oxygen, call for help, then look at the capnograph and the airway pressure.',
      'A sustained capnography trace rules out the oesophagus (no trace, wrong place), but not a tube in one bronchus.',
      'DOPES: Displacement, Obstruction, Pneumothorax, Equipment, Stacking. Hand ventilate, look, listen and read the tube length at the teeth.',
      'Usual tube depth at the teeth: about `21 cm` in women and `23 cm` in men. Note it every time, and recheck after moving the patient.',
      'Bronchospasm: wheeze on both sides, rising pressure, a sloping trace. Deepen, give salbutamol, look for anaphylaxis, and give time to breathe out. See the [hypoxia card](#/crisis/hypoxia) and the [bronchospasm card](#/crisis/bronchospasm).',
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    id: 'hypotension-induction',
    title: 'Low blood pressure after induction',
    setting: 'Elective list, 08:50',
    level: 'core',
    summary: 'BP `70/40` after propofol in a 78-year-old: get help, give the right vasopressor and find the cause.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 78-year-old woman, `55 kg`, for a cystoscopy and resection of a bladder tumour under GA with a supraglottic airway. She takes amlodipine and losartan and took both this morning. Before induction her BP was `165/85`. Because of her age your consultant asked you to draw up phenylephrine and ephedrine. Your consultant induced with fentanyl `50 mcg` and propofol `100 mg`, the airway went in easily, and she is breathing sevoflurane at `2.5%`. Your consultant has stepped next door to help a colleague (“Call me if anything changes”). As she is put into lithotomy the next BP reads `72/40`.',
        vitals: { HR: 56, BP: '72/40', SpO2: 99, EtCO2: 34, RR: 14 },
        choices: [
          { text: 'Ask the AU nurse to call your consultant now; turn the sevoflurane down; set the BP to cycle every minute and recheck it.', next: 'b', good: true, feedback: 'Do both at once: get help coming and start the simple fixes. Too much anaesthetic for an elderly patient is the commonest cause: `2.5%` sevoflurane is well over 1 MAC (minimum alveolar concentration) at 78, when 1 MAC is only about `1.6%` (about `2%` in a 40-year-old).' },
          { text: 'Give phenylephrine `100 mcg` first, and call if it doesn’t work.', next: 'b', good: 'ok', feedback: 'Treating quickly is good, but the handbook’s first step when anything is out of the ordinary is to call for help. You can do both: ask the nurse to call while you act. And with a heart rate of `56`, ephedrine suits her better than phenylephrine.' },
          { text: 'Wait for the next automatic reading in 5 minutes: cuff readings are often wrong in lithotomy.', next: 'a2', good: false, feedback: 'Assume a low reading is real until you have proved otherwise. Recheck it now, not in 5 minutes.' },
          { text: 'Turn the sevoflurane off completely.', next: 'a', good: false, feedback: 'Turning it off risks awareness. Turn it down to about 1 MAC for her age (about `1.5–1.6%`) and support the blood pressure. Try again.' },
        ],
      },
      a2: {
        text: 'The next reading is `62/34`, heart rate `50`. She looks pale and the capnograph trace is getting smaller.',
        vitals: { HR: 50, BP: '62/34', SpO2: 98, EtCO2: 26, RR: 14 },
        choices: [
          { text: 'Ask the nurse to call your consultant now, turn the sevoflurane down and recheck the BP every minute.', next: 'b', good: true, feedback: 'A falling EtCO2 with a low BP means a falling cardiac output: this is getting serious. Get help coming and act.' },
          { text: 'Keep watching: once surgery starts the stimulation will bring the BP up.', next: 'bad', good: false, feedback: 'Hoping the surgeon will fix the BP leaves her heart and brain short of blood in the meantime.' },
          { text: 'Give phenylephrine `100 mcg` and leave the sevoflurane at `2.5%`.', next: 'a2', good: false, feedback: 'A vasopressor helps for a minute or two, but the main cause (too much volatile for her age) is still there, and no one is coming. Turn it down and call.' },
        ],
      },
      b: {
        text: 'Help is on the way. The BP cycles again: `70/42`, heart rate `54`. The ephedrine and phenylephrine syringes are labelled on your tray.',
        vitals: { HR: 54, BP: '70/42', SpO2: 99, EtCO2: 31, RR: 14 },
        choices: [
          { text: 'Ephedrine `5 mg` IV (`1 mL` of `5 mg/mL`), repeated in 2–3 minutes if needed.', next: 'c', good: true, feedback: 'With a slow heart rate, ephedrine is a good first choice: it raises both the heart rate and the blood pressure.' },
          { text: 'Phenylephrine `100 mcg` IV (`1 mL` of `100 mcg/mL`).', next: 'c', good: 'ok', feedback: 'It will raise the blood pressure, but phenylephrine only squeezes the vessels, and the reflex response can slow the heart further. It is best when the heart rate is normal or fast.' },
          { text: 'Run in a litre of fluid and wait.', next: 'b2', good: false, feedback: 'Fluid helps if she is dry, but it takes minutes to work and a litre is a lot for a 78-year-old heart. The problem here is mostly drug-induced widening of the vessels: give a vasopressor now.' },
        ],
      },
      b2: {
        text: 'Five minutes and `500 mL` later the BP is `66/38`.',
        vitals: { HR: 52, BP: '66/38', SpO2: 98, EtCO2: 28, RR: 14 },
        choices: [
          { text: 'Ephedrine `5 mg` IV now, and pause the fluid at `500 mL` for the moment.', next: 'c', good: true, feedback: 'Treat the cause: drugs have widened her vessels. A vasopressor works within a minute.' },
          { text: 'Another litre of fluid.', next: 'b2', good: false, feedback: 'More fluid is unlikely to fix a drug effect and risks overloading her heart. Give a vasopressor.' },
          { text: 'Atropine `0.6 mg` IV for the slow heart rate.', next: 'c', good: 'ok', feedback: 'It speeds the heart and helps a little, but the main problem is the widened vessels. Ephedrine does both jobs.' },
        ],
      },
      c: {
        text: 'Two minutes later the BP is `90/52`, heart rate `66`. Your consultant walks in: “What’s happening?”',
        vitals: { HR: 66, BP: '90/52', SpO2: 99, EtCO2: 34, RR: 14 },
        choices: [
          { text: '“BP fell to `72/40` as she went into lithotomy, about 8 minutes after induction, heart rate `56`. I turned the sevoflurane down to `1.5%` and gave ephedrine `5 mg`; it’s now `90/52`. She took losartan and amlodipine this morning.”', next: 'd', good: true, feedback: 'Short, in order, with the numbers and what you have done: your consultant can decide in seconds.' },
          { text: '“Her BP dropped, but it’s better now.”', next: 'c', good: false, feedback: 'Too vague. Your consultant needs the lowest value, for how long, what you gave and what it is now. Try again.' },
          { text: 'Start with her history from the pre-op clinic.', next: 'c', good: false, feedback: 'Lead with the problem and the numbers. The history comes after, if asked.' },
        ],
      },
      d: {
        text: 'Your consultant: “What do you think caused it?”',
        vitals: { HR: 66, BP: '94/54', SpO2: 99, EtCO2: 34, RR: 14 },
        choices: [
          { text: 'Mostly drugs: propofol and too much sevoflurane for her age, on top of losartan and amlodipine, plus lithotomy and fasting. But check the rarer causes: anaphylaxis (skin, wheeze) and arrhythmia (ECG).', next: 'e', good: true, feedback: 'Good. Think drugs, volume, position and surgery, and then deliberately rule out the dangerous rarer causes.' },
          { text: 'Anaphylaxis: give adrenaline.', next: 'd', good: false, feedback: 'Possible in theory, so look for it, but there is no rash or wheeze and a clear drug explanation. Adrenaline for the wrong reason is risky in a 78-year-old.' },
          { text: 'Her heart must be failing: get an urgent echo.', next: 'd', good: false, feedback: 'Nothing points to heart failure, and she responded to a vasopressor. Start with the common causes.' },
        ],
      },
      e: {
        text: 'Ten minutes into the resection the BP drifts down again to `80/46`, heart rate `62`. Your consultant asks for your plan.',
        vitals: { HR: 62, BP: '80/46', SpO2: 99, EtCO2: 33, RR: 14 },
        choices: [
          { text: 'Keep the sevoflurane near 1 MAC for her age, repeat ephedrine or phenylephrine boluses, give a modest fluid bolus (`250 mL`), and if boluses keep being needed, ask about an infusion.', next: 'good', good: true, feedback: 'A sensible plan: enough anaesthetic, small vasopressor doses, a little fluid, and an infusion (phenylephrine or noradrenaline) if she keeps needing boluses, which your consultant decides.' },
          { text: 'Turn the sevoflurane off: no anaesthetic, no low blood pressure.', next: 'e', good: false, feedback: 'Awareness under GA is a real harm. Keep enough anaesthetic and support the circulation.' },
          { text: 'Give `2 L` of fluid quickly.', next: 'e', good: false, feedback: 'Large volumes risk fluid overload in an elderly heart, and the low BP comes from widened vessels, not big losses.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'With two more phenylephrine boluses and `250 mL` of fluid her BP holds around `110/60`. She wakes comfortably and goes to the post-anaesthesia care unit (PACU). Your consultant asks you to note the losartan for next time.',
        vitals: { HR: 70, BP: '112/62', SpO2: 98, EtCO2: 36, RR: 14 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'The BP falls to `55/30` and the ECG shows ST depression before your consultant arrives and treats it. She recovers from the anaesthetic, but her troponin rises the next day and she spends two days in high dependency (HD).',
        vitals: { HR: 48, BP: '55/30', SpO2: 97, EtCO2: 22, RR: 14 },
      },
    },
    debrief: [
      'Expect a low BP after induction in the elderly, especially on ACE inhibitors or angiotensin receptor blockers such as losartan. Use less propofol, give it slowly and keep the volatile near 1 MAC for age.',
      'When anything changes, the first step is to call for help. Then act: reduce the agent, recheck the BP every minute, give a vasopressor.',
      'Ephedrine `5 mg` when the heart rate is slow; phenylephrine `50–100 mcg` when it is normal or fast. In elective theatres they sit on the E-drug tray as vials, drawn up when your consultant asks. On ACE inhibitors or angiotensin receptor blockers the response can be poor: if repeated boluses aren’t working, tell your consultant, who may choose another vasopressor.',
      'Hand over in numbers: the lowest BP, what you gave and what it is now.',
      'See the [hypotension card](#/crisis/hypotension) and [When the circulation goes wrong](#/learn/maintenance/problems-circulation).',
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    id: 'anaphylaxis-antibiotic',
    title: 'Anaphylaxis after the antibiotic',
    setting: 'Elective list, 08:55',
    level: 'core',
    summary: 'A rash, a falling BP and rising airway pressure minutes after cefazolin: recognise it and give adrenaline.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 40-year-old man, `80 kg`, for fixation of a broken wrist. Induction with propofol, fentanyl and rocuronium was smooth and he is intubated. Your consultant is beside you writing the chart. You gave cefazolin `2 g` IV slowly. Three minutes later the monitor alarms. His face and chest are bright red, and the peak airway pressure has risen from `18` to `32 cmH2O`.',
        vitals: { HR: 128, BP: '68/36', SpO2: 91, EtCO2: 24 },
        choices: [
          { text: 'Say it out loud: “I think this is anaphylaxis.” `100%` oxygen, stop the antibiotic and anything else running in, and call for more help.', next: 'b', good: true, feedback: 'Flushing, a low BP, a fast heart rate and rising airway pressure minutes after an antibiotic: anaphylaxis until proven otherwise. Naming it gets everyone working on the same problem.' },
          { text: 'Give phenylephrine `100 mcg` for the low BP and watch.', next: 'a2', good: false, feedback: 'This is not the usual post-induction dip: the flushing, fast heart rate, high airway pressure and timing all point to anaphylaxis. Phenylephrine doesn’t stop the reaction; adrenaline does.' },
          { text: 'Give salbutamol for bronchospasm.', next: 'a2', good: false, feedback: 'The airways are only part of it: the blood pressure is the immediate threat. Adrenaline treats both.' },
        ],
      },
      a2: {
        text: 'A minute later: BP `54/30`, heart rate `142`, SpO2 `86%`, EtCO2 falling. Raised hives are spreading over his chest.',
        vitals: { HR: 142, BP: '54/30', SpO2: 86, EtCO2: 18 },
        choices: [
          { text: 'Call it anaphylaxis, call for help, `100%` oxygen, stop the drugs, and give adrenaline `50 mcg` IV now.', next: 'c', good: true, feedback: 'The right treatment, a minute late. Adrenaline in `50 mcg` steps, repeated every 1–2 minutes, until the BP responds.' },
          { text: 'More phenylephrine.', next: 'arrest', good: false, feedback: 'Phenylephrine can’t keep up with the mediators flooding out of his mast cells. His circulation fails.' },
          { text: 'Hydrocortisone `200 mg` and chlorphenamine `10 mg` IV.', next: 'arrest', good: false, feedback: 'Neither raises the BP or opens the airways in time: they are given later, once he is stable. Without adrenaline his circulation fails.' },
        ],
      },
      b: {
        text: 'Help is coming and your consultant agrees. What do you give first?',
        vitals: { HR: 130, BP: '66/36', SpO2: 90, EtCO2: 23 },
        choices: [
          { text: 'Adrenaline `50 mcg` IV (`0.5 mL` of 1:10,000), repeated every 1–2 minutes as needed.', next: 'c', good: true, feedback: 'IV adrenaline in `50 mcg` steps is the treatment in theatre, where there is IV access and full monitoring.' },
          { text: 'Adrenaline `1 mg` IV.', next: 'b', good: false, feedback: 'That is the cardiac arrest dose. In a patient with a pulse it can cause severe hypertension, dangerous arrhythmias and heart damage. Your consultant stops you: `50 mcg` IV.' },
          { text: 'Adrenaline `0.5 mg` IM into the thigh.', next: 'c', good: 'ok', feedback: 'The right drug at the right IM dose, and the choice when there is no IV. In theatre, with a drip and monitoring, small IV doses act faster and are easier to control.' },
          { text: 'Hydrocortisone `200 mg` IV and an antihistamine first.', next: 'a2', good: false, feedback: 'These are not first-line: they don’t raise the BP or open the airways in time. Adrenaline first.' },
        ],
      },
      c: {
        text: 'After two doses of adrenaline `50 mcg` the BP is `84/48` and the heart rate `118`. He is still wheezy, with a peak pressure of `30 cmH2O`.',
        vitals: { HR: 118, BP: '84/48', SpO2: 93, EtCO2: 28 },
        choices: [
          { text: 'Keep giving adrenaline as needed (your consultant may start an infusion), lie him flat with his legs raised, run in crystalloid fast (`20 mL/kg`, about `1.6 L` for him, repeated as needed) and give salbutamol for the wheeze.', next: 'd', good: true, feedback: 'Anaphylaxis leaks a lot of fluid out of the vessels: adults often need litres. Keep the adrenaline going until he is stable, and treat the bronchospasm.' },
          { text: 'Stop the adrenaline now the BP is better.', next: 'c', good: false, feedback: 'Anaphylaxis often rebounds. Keep treating until the BP is stable; many patients need several doses or an infusion.' },
          { text: 'Switch to phenylephrine to avoid a fast heart rate.', next: 'c', good: false, feedback: 'Adrenaline is the treatment: it supports the heart, opens the airways and calms the reaction. Phenylephrine does only one of those.' },
        ],
      },
      d: {
        text: 'Fifteen minutes later he is stable: BP `108/64`, heart rate `102`, the wheeze gone. Surgery has not started. Your consultant asks: “What now?”',
        vitals: { HR: 102, BP: '108/64', SpO2: 98, EtCO2: 35 },
        choices: [
          { text: 'Take blood for mast cell tryptase now, and plan repeat samples at 1–2 hours and after 24 hours. With the surgeon, postpone the operation (your consultant decides) and plan where he goes next.', next: 'e', good: true, feedback: 'Tryptase confirms anaphylaxis afterwards. Take the first sample once he is stable enough, without delaying treatment, then repeat. Postponing a non-urgent operation is usual.' },
          { text: 'Tryptase can wait for tomorrow’s blood tests.', next: 'd', good: false, feedback: 'Tryptase peaks within 1–2 hours and then falls. Take the first sample as soon as he is stable, then repeat.' },
          { text: 'Carry on with the surgery now he is stable.', next: 'd', good: false, feedback: 'He may rebound, and the operation isn’t urgent. Postponing is usual; your consultant and the surgeon decide.' },
        ],
      },
      e: {
        text: 'Before he leaves theatre, your consultant asks you to help with the follow-up.',
        vitals: { HR: 96, BP: '112/66', SpO2: 98, EtCO2: 36 },
        choices: [
          { text: 'Record every drug and the time it was given, explain to him what happened once he is awake, make sure your consultant’s allergy clinic referral is done, and record a suspected reaction to all the drugs he had until testing finds the cause.', next: 'good', good: true, feedback: 'Any of the drugs (cefazolin, rocuronium, propofol, fentanyl, or chlorhexidine on the skin) could be the cause. Only allergy testing can say which, so list them all, and report it as an adverse drug reaction.' },
          { text: 'Record “allergic to cefazolin” and nothing else.', next: 'okEnd', good: 'ok', feedback: 'Cefazolin is the likeliest culprit, but muscle relaxants and chlorhexidine are common causes too. Labelling one drug without testing can miss the real cause.' },
          { text: 'Don’t tell him: it would only worry him.', next: 'e', good: false, feedback: 'He needs to know, for his safety at every future operation, and he has a right to know. Tell him clearly once he is awake.' },
        ],
      },
      arrest: {
        text: 'You can’t feel a pulse. The ECG shows a fast narrow-complex rhythm with no output (pulseless electrical activity), and the EtCO2 is `10 mmHg`.',
        vitals: { EtCO2: 10, SpO2: 80 },
        choices: [
          { text: 'Call a cardiac arrest, start chest compressions, give adrenaline `1 mg` IV every 3–5 minutes, and run fluid in wide open.', next: 'arrestEnd', good: true, feedback: 'Now the arrest dose is right: `1 mg` IV, with good CPR and lots of fluid.' },
          { text: 'Give adrenaline `50 mcg` IV again.', next: 'arrest', good: false, feedback: 'In cardiac arrest the dose is `1 mg`, and he needs chest compressions now.' },
          { text: 'Pause compressions every minute to feel for a pulse.', next: 'arrest', good: false, feedback: 'Every pause stops blood flow to the heart and brain. Check the rhythm and pulse only at the planned pause every 2 minutes.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'Your consultant keeps him intubated and he goes to the intensive care unit (ICU) overnight in case the reaction returns. He is woken the next morning and makes a full recovery. Allergy testing six weeks later shows the cause, and his records are updated.',
        vitals: { HR: 92, BP: '118/70', SpO2: 98, EtCO2: 37 },
      },
      okEnd: {
        end: true, outcome: 'ok',
        text: 'He recovers fully. But he is labelled allergic to cefazolin alone and isn’t referred for testing, so if rocuronium or chlorhexidine was the real cause, the next anaesthetist won’t know.',
      },
      arrestEnd: {
        end: true, outcome: 'ok',
        text: 'After 6 minutes of CPR, three doses of adrenaline and `2 L` of fluid his circulation returns. He goes to the intensive care unit (ICU) on an adrenaline infusion and recovers over several days.',
        vitals: { HR: 124, BP: '92/50', SpO2: 94, EtCO2: 30 },
      },
    },
    debrief: [
      'Anaphylaxis under GA: a low BP, a fast heart rate, flushing or hives, rising airway pressure or wheeze, often within minutes of an antibiotic or muscle relaxant. The skin signs may be missing.',
      'Say it, call for help, stop the trigger, `100%` oxygen, then adrenaline `50 mcg` IV (`0.5 mL` of 1:10,000), repeated every 1–2 minutes. `1 mg` is only for cardiac arrest.',
      'Start chest compressions if the systolic BP falls below `50 mmHg`, even if there is a pulse.',
      'Then fluids, salbutamol for wheeze, and steroids and antihistamines later. Many patients need an adrenaline infusion.',
      'Tryptase as soon as he is stable, at 1–2 hours and after 24 hours. Refer to the allergy clinic and list every suspect drug. See the [anaphylaxis card](#/crisis/anaphylaxis).',
    ],
  },

  // ------------------------------------------------------------------ 5
  {
    id: 'laryngospasm-emergence',
    title: 'Laryngospasm after the LMA comes out',
    setting: 'Day surgery list, 11:20',
    level: 'core',
    summary: 'Stridor, then no air movement after removing a supraglottic airway: jaw thrust, CPAP, deepen, suxamethonium.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 24-year-old woman, `60 kg`, who smokes, has had a knee arthroscopy under GA with a supraglottic airway (LMA). At the end your consultant is with you: “Take the LMA out when she’s ready.” She starts coughing and moving her arms, so you take it out. Thirty seconds later she makes a high-pitched crowing noise, then silence. Her chest and abdomen move in a see-saw, the reservoir bag doesn’t move and the capnograph is flat.',
        vitals: { HR: 112, BP: '150/90', SpO2: 93, EtCO2: 0 },
        choices: [
          { text: 'Call out “Laryngospasm”. `100%` oxygen with a tight two-hand mask seal, a firm jaw thrust, and close the APL valve partly to give continuous positive airway pressure (CPAP).', next: 'b', good: true, feedback: 'Exactly the first steps. A firm jaw thrust (pressing just behind the angle of the jaw) and steady CPAP often open the cords on their own.' },
          { text: 'Put the LMA back in.', next: 'a2', good: false, feedback: 'The cords are shut below the LMA: putting it back doesn’t open them, and fiddling in the mouth of a lightly anaesthetised patient makes the spasm worse.' },
          { text: 'Squeeze the bag as hard as you can with the APL valve closed.', next: 'a2', good: false, feedback: 'Hard squeezes against closed cords blow gas into the stomach. Steady CPAP with a good seal is gentler and works better.' },
          { text: 'Suction her mouth and wait for it to settle.', next: 'a2', good: false, feedback: 'Gentle suction of the mouth is fine, but waiting while she can’t breathe lets the saturation fall fast. Act now.' },
        ],
      },
      a2: {
        text: 'SpO2 `80%` and falling, heart rate `64` and slowing. She is still not moving air.',
        vitals: { HR: 64, BP: '128/80', SpO2: 80, EtCO2: 0 },
        choices: [
          { text: 'Shout for help, two hands on the mask with a jaw thrust and CPAP on `100%` oxygen, and ask for propofol and suxamethonium.', next: 'c', good: true, feedback: 'The slowing heart is from lack of oxygen: this is now urgent. Basic airway steps plus drugs to relax the cords.' },
          { text: 'Try the LMA again.', next: 'bad', good: false, feedback: 'Time spent on the LMA is time without oxygen.' },
          { text: 'Give naloxone in case it is the fentanyl.', next: 'a2', good: false, feedback: 'Opioids don’t cause laryngospasm, and naloxone wastes time. The cords are shut: two hands, jaw thrust, CPAP and drugs to relax them.' },
        ],
      },
      b: {
        text: 'With CPAP and a jaw thrust a little gas moves with a high-pitched noise, but the saturation keeps falling. Your consultant is at your side.',
        vitals: { HR: 108, BP: '146/88', SpO2: 88, EtCO2: 12 },
        choices: [
          { text: 'Deepen her with propofol `30 mg` IV (about `0.5 mg/kg`), keeping the CPAP on.', next: 'c', good: true, feedback: 'A small dose of propofol deepens the anaesthetic and often relaxes the cords. Keep the CPAP and jaw thrust going.' },
          { text: 'Keep going with CPAP alone for another minute.', next: 'a2', good: false, feedback: 'CPAP is worth a short try, but she is desaturating. Move to the next step: deepen her.' },
          { text: 'Give suxamethonium straight away.', next: 'd', good: 'ok', feedback: 'Reasonable if she is desaturating fast, and your consultant may choose it. Many give propofol first because it often works, but suxamethonium is the definitive treatment.' },
        ],
      },
      c: {
        text: 'After the propofol the noise changes, but very little gas moves. SpO2 `82%`, heart rate `98`.',
        vitals: { HR: 98, BP: '128/76', SpO2: 82, EtCO2: 8 },
        choices: [
          { text: 'Suxamethonium `30 mg` IV (about `0.5 mg/kg`) as your consultant asks, keep the CPAP on, and have atropine ready for a slow heart.', next: 'd', good: true, feedback: 'A small dose of suxamethonium relaxes the cords within a minute; a full intubating dose (`1–1.5 mg/kg`) is used if she needs a tube. Suxamethonium can slow the heart, especially in a hypoxic patient, so have atropine ready.' },
          { text: 'Another `30 mg` of propofol.', next: 'c', good: false, feedback: 'She is now hypoxic, and more propofol lowers the BP without reliably opening the cords. It is time for the relaxant.' },
          { text: 'Get ready for front of neck access.', next: 'c', good: false, feedback: 'Too early. Laryngospasm almost always breaks with suxamethonium. Front of neck access is for “can’t intubate, can’t oxygenate” after everything else has failed.' },
        ],
      },
      d: {
        text: 'Within a minute the bag moves easily, the capnograph trace returns and SpO2 climbs to `97%`. She isn’t breathing yet because of the suxamethonium.',
        vitals: { HR: 92, BP: '124/74', SpO2: 97, EtCO2: 42 },
        choices: [
          { text: 'Keep bagging with `100%` oxygen until she breathes again (5–10 minutes), keep her asleep so she isn’t awake while paralysed, and listen to her chest for crackles.', next: 'e', good: true, feedback: 'Right. She must stay asleep until the suxamethonium wears off. Crackles or pink froth would suggest fluid in the lungs from breathing hard against closed cords.' },
          { text: 'Let her wake up now: the spasm is over.', next: 'd', good: false, feedback: 'She is paralysed. Waking now means being awake and unable to move or breathe: awareness. Keep her asleep and ventilated until the suxamethonium wears off.' },
          { text: 'Take the mask off and see whether she breathes.', next: 'd', good: false, feedback: 'She can’t breathe yet: she is paralysed. Keep ventilating with the mask.' },
        ],
      },
      e: {
        text: 'Her breathing returns, strong and regular. Your consultant lets her wake fully with the mask on; she opens her eyes and obeys commands. What do you do before PACU?',
        vitals: { HR: 88, BP: '132/78', SpO2: 98, EtCO2: 40, RR: 14 },
        choices: [
          { text: 'Hand over the laryngospasm to the PACU team: watch for pink frothy sputum and falling saturation over the next few hours. Warn her about muscle aches from suxamethonium, and record it all.', next: 'good', good: true, feedback: 'Negative pressure pulmonary oedema can appear up to a few hours later. The PACU nurse needs to know what to look for.' },
          { text: 'She looks fine, so there’s no need to mention it.', next: 'e', good: false, feedback: 'The PACU team needs to know, because problems can appear later, and so does she, for next time. Hand it over and write it down.' },
          { text: 'Tell the PACU nurse, but leave it out of the notes so it doesn’t alarm her.', next: 'e', good: false, feedback: 'It belongs in the notes, and she should hear about it from you: it may matter at her next anaesthetic.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'In PACU she is comfortable with SpO2 `98%` on air and a clear chest. She goes home that evening after the anaesthetist reviews her.',
        vitals: { HR: 80, BP: '124/76', SpO2: 98, RR: 14 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'Her heart rate falls to `35` and the saturation to `60%`. Your consultant gives suxamethonium and atropine, intubates and ventilates her. She recovers, but she develops fluid on the lungs (negative pressure pulmonary oedema) and stays in hospital overnight on oxygen.',
        vitals: { HR: 35, BP: '90/50', SpO2: 60, EtCO2: 0 },
      },
    },
    debrief: [
      'Laryngospasm is commonest when anaesthesia is light: removing an airway while she was coughing and moving but not awake. The airway comes out either deep (your consultant’s call) or fully awake and obeying commands, never in between.',
      'In your first month you never remove an airway or end a case without your consultant: call, then wait.',
      'Treat in steps: call, `100%` oxygen, two-hand seal, jaw thrust, CPAP; deepen with propofol; then suxamethonium (a small dose, `0.1–0.5 mg/kg` IV, or `1–1.5 mg/kg` to intubate) with atropine ready.',
      'Don’t push an LMA back in or squeeze hard against closed cords.',
      'Afterwards watch for negative pressure pulmonary oedema. See the [laryngospasm card](#/crisis/laryngospasm).',
    ],
  },

  // ------------------------------------------------------------------ 6
  {
    id: 'pacu-pain-ponv',
    title: 'PACU: pain and nausea',
    setting: 'PACU, 14:15',
    level: 'core',
    summary: 'Pain 8 out of 10 and retching after a laparoscopic cholecystectomy: chart first, titrate, then a different antiemetic.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 45-year-old woman, `65 kg`, arrived in the post-anaesthesia care unit (PACU) 15 minutes ago after a laparoscopic cholecystectomy under GA. The PACU nurse calls you: “Pain score 8 out of 10, and she feels sick.” She is curled up, retching and holding her right shoulder.',
        vitals: { HR: 104, BP: '152/88', SpO2: 97, RR: 20, T: 36.4 },
        choices: [
          { text: 'Go now. Check airway, breathing and circulation and the vitals, then read the anaesthetic chart (what she was given, when, and any allergies) before giving anything.', next: 'b', good: true, feedback: 'The handbook rule for PACU: see the patient, then check the anaesthetic chart before giving any drug. It prevents double doses and drug errors.' },
          { text: 'Give morphine `5 mg` IV straight away: she is clearly in pain.', next: 'a', good: false, feedback: 'The nurse stops you: “She had morphine `5 mg` 40 minutes ago.” The handbook rule: check the anaesthetic chart before giving any drug in PACU.' },
          { text: 'Give ondansetron `4 mg` IV for the nausea.', next: 'a', good: false, feedback: 'Check the chart first: she had ondansetron at the end of surgery. Another dose of the same drug within 6 hours adds little.' },
          { text: 'Phone the primary anaesthetist.', next: 'b', good: 'ok', feedback: 'Not wrong, but pain and nausea are the PACU MO’s job; the primary anaesthetist hears about problems that persist or are severe. See her and read the chart first.' },
        ],
      },
      b: {
        text: 'The chart: fentanyl `100 mcg` at induction; morphine `5 mg` 40 minutes ago; paracetamol `1 g` and parecoxib `40 mg` IV; dexamethasone `8 mg` at induction; ondansetron `4 mg` at the end; local anaesthetic at the port sites. No allergies. She is alert, breathing `20` a minute. The pain is in her right shoulder and around the wounds.',
        vitals: { HR: 102, BP: '150/86', SpO2: 97, RR: 20, T: 36.4 },
        choices: [
          { text: 'Morphine `1–2 mg` IV every 5–10 minutes, checking pain, sedation and breathing between doses; stop if she becomes drowsy or her breathing rate falls below `10`. If she still hurts after about `0.1 mg/kg` (about `6 mg` for her) in PACU, call the primary anaesthetist.', next: 'c', good: true, feedback: 'Small doses with a check between each, so you find the dose she needs without overshooting. Morphine peaks 15–20 minutes after each dose, so doses stack up if you go too fast, especially in the elderly, in kidney impairment and in sleep apnoea.' },
          { text: 'Morphine `10 mg` IV now to get on top of it.', next: 'b2', good: false, feedback: 'A large single dose on top of the morphine she already had risks oversedation and slowed breathing. Titrate in small steps.' },
          { text: 'Paracetamol `1 g` IV.', next: 'b', good: false, feedback: 'She had paracetamol `1 g` in theatre; the next dose isn’t due for 6 hours. Try again.' },
          { text: 'Tramadol `100 mg` IV.', next: 'b', good: false, feedback: 'Tramadol is too weak for this level of pain and is itself a common cause of nausea and vomiting.' },
        ],
      },
      b2: {
        text: 'Ten minutes after the morphine `10 mg` she is very drowsy and snoring, breathing `8` a minute, SpO2 `89%` on `2 L/min` nasal oxygen.',
        vitals: { HR: 82, BP: '118/70', SpO2: 89, RR: 8, T: 36.4 },
        choices: [
          { text: 'Wake her with a loud voice and a shake, jaw thrust, face-mask oxygen, ask the nurse to call the primary anaesthetist and get naloxone; if her breathing stays slow, naloxone `40 mcg` IV steps.', next: 'c', good: true, feedback: 'Stimulate, open the airway, oxygen, help, and small doses of naloxone if needed: enough to restore breathing without taking away all her pain relief.' },
          { text: 'Leave her to sleep: at least she is comfortable now.', next: 'bad', good: false, feedback: 'A snoring patient breathing 8 a minute with falling saturation is not comfortable: she is in danger.' },
          { text: 'Give naloxone `400 mcg` IV at once.', next: 'b', good: false, feedback: 'She wakes, but a full dose takes away all her pain relief: she is back to pain `8/10` and retching, and now you start again. Small steps of `40 mcg` restore breathing without that.' },
        ],
      },
      c: {
        text: 'Twenty minutes on she is awake and breathing well. Her pain is `4/10`, mostly shoulder-tip pain from the gas under her diaphragm. But she still feels sick and has vomited once.',
        vitals: { HR: 92, BP: '134/80', SpO2: 97, RR: 16, T: 36.5 },
        choices: [
          { text: 'Check for causes other than drugs (low BP, low oxygen, pain), then give metoclopramide `10 mg` IV slowly: a different class from what she has had.', next: 'd', good: true, feedback: 'Rescue with a drug from a class she hasn’t had: she had dexamethasone and ondansetron, so metoclopramide (a dopamine blocker) is a good choice. Avoid it in Parkinson’s disease and bowel obstruction.' },
          { text: 'Ondansetron `4 mg` again.', next: 'c', good: false, feedback: 'She had ondansetron less than an hour ago. Repeating the same class within 6 hours adds little. Choose a different class.' },
          { text: 'Dexamethasone `8 mg` again.', next: 'c', good: false, feedback: 'Dexamethasone works slowly and is for prevention; she had it at induction.' },
          { text: 'Haloperidol `0.5–1 mg` IV.', next: 'd', good: 'ok', feedback: 'A reasonable rescue from another class, but it lengthens the QT interval (so does the ondansetron she has had): check the ECG first, and never give it in Parkinson’s disease. Metoclopramide is the usual first choice here.' },
        ],
      },
      d: {
        text: 'Thirty minutes later she is comfortable (pain `3/10`), no longer nauseated, and keen to go back to the ward.',
        vitals: { HR: 84, BP: '128/76', SpO2: 97, RR: 14, T: 36.6 },
        choices: [
          { text: 'Record each drug you gave with the dose and time, make sure she has been watched long enough after her last IV morphine, and write a ward plan: regular paracetamol, an NSAID if suitable, an oral opioid if needed, and antiemetics from different classes if needed.', next: 'good', good: true, feedback: 'A clear record and a plan stop the ward repeating doses or leaving her in pain. IV morphine has its biggest effect on breathing about 15–20 minutes after a dose, so watch her past that.' },
          { text: 'Send her now: she is comfortable.', next: 'd', good: false, feedback: 'Make sure enough time has passed since her last IV morphine to see its full effect on breathing (about 15–20 minutes), that she has had the minimum 30 minutes in PACU, and that what you gave is recorded.' },
          { text: 'No need to write anything: the nurse records the drugs.', next: 'd', good: false, feedback: 'Drugs you give are your responsibility to record, with the dose and time. The ward also needs a plan.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'She goes back to the ward comfortable and settled, with a clear plan. The ward nurse knows what she has had and what to give next.',
        vitals: { HR: 80, BP: '126/74', SpO2: 97, RR: 14, T: 36.6 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'Ten minutes later she can’t be woken and her saturation is `75%`. The PACU team bag-mask ventilates her and gives naloxone. She recovers, but needs a naloxone infusion and an overnight stay in high dependency (HD).',
        vitals: { HR: 64, BP: '104/62', SpO2: 75, RR: 4, T: 36.3 },
      },
    },
    debrief: [
      'In PACU, see the patient first (airway, breathing, circulation, vitals), then read the anaesthetic chart before giving anything: what, how much, when, and allergies.',
      'Titrate IV opioid: morphine `1–2 mg` every 5–10 minutes (it peaks at 15–20 minutes), or fentanyl `10–25 mcg` every 5 minutes, checking sedation and breathing between doses. Stop if she is drowsy or breathing below `10` a minute. After about `0.1 mg/kg` of morphine in PACU, call the primary anaesthetist rather than giving more.',
      'Rescue antiemetic from a different class: metoclopramide `10 mg` after dexamethasone and ondansetron. Rule out low BP, low oxygen and pain first. Metoclopramide and haloperidol are never for patients with Parkinson’s disease.',
      'Shoulder-tip pain after laparoscopy is from gas under the diaphragm: it settles with time and simple analgesia.',
      'Persistent or severe problems go to the primary anaesthetist. Read [Pain in PACU](#/learn/pacu/pain) and [Nausea and vomiting](#/learn/pacu/ponv).',
    ],
  },

  // ------------------------------------------------------------------ 7
  {
    id: 'pacu-drowsy',
    title: 'PACU: drowsy and breathing slowly',
    setting: 'PACU, 11:40',
    level: 'core',
    summary: 'Breathing 7 a minute with pinpoint pupils: stimulate, oxygen, naloxone in small steps, then look for residual block.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 72-year-old man, `68 kg`, with chronic kidney disease (eGFR `38`), arrived in PACU 30 minutes ago after an open inguinal hernia repair under GA. The PACU nurse calls you urgently: “He’s very drowsy, breathing 7 a minute, sats 88 on 2 litres.”',
        vitals: { HR: 58, BP: '122/70', SpO2: 88, RR: 7, T: 36.0 },
        choices: [
          { text: 'Go now. Call his name loudly and shake his shoulder, jaw thrust if he is obstructing, face-mask oxygen at `15 L/min`, and tell him to take deep breaths. Ask the nurse to get naloxone and call the primary anaesthetist.', next: 'b', good: true, feedback: 'The handbook: when a PACU nurse alerts you, go at once and check airway, breathing and circulation. Stimulation alone often gets an opioid-sedated patient breathing again.' },
          { text: 'Tell the nurse to give naloxone `400 mcg` IV now, and come when you can.', next: 'big', good: false, feedback: 'You need to see him, and `400 mcg` at once reverses all of his pain relief as well as the sedation.' },
          { text: 'Read his anaesthetic chart at the desk first.', next: 'a2', good: false, feedback: 'The chart matters before you give a drug, but airway and breathing come first. Go to the bedside now.' },
        ],
      },
      a2: {
        text: 'By the time you reach him he is unrousable, breathing `4` a minute, snoring then silent. SpO2 `78%`.',
        vitals: { HR: 52, BP: '110/64', SpO2: 78, RR: 4, T: 36.0 },
        choices: [
          { text: 'Call for help, jaw thrust, bag-mask ventilate with `100%` oxygen, and ask for naloxone.', next: 'b', good: true, feedback: 'Breathe for him first: bag-mask ventilation with oxygen buys time for the naloxone and for help.' },
          { text: 'Wait for the primary anaesthetist to arrive.', next: 'bad', good: false, feedback: 'He can’t wait: you have to breathe for him now.' },
          { text: 'Give naloxone `400 mcg` IV at once, before anything else.', next: 'big', good: 'ok', feedback: 'With breathing this poor a full dose is acceptable, and it works. But bag-mask ventilation fixes the oxygen in seconds while naloxone takes a minute or two, and the full dose brings back all his pain.' },
        ],
      },
      b: {
        text: 'With stimulation and oxygen he opens his eyes to a loud voice and breathes `9` a minute while you talk to him, but drifts off and slows to `6` when you stop. His pupils are pinpoint. The nurse hands you the chart: fentanyl `100 mcg` at induction; morphine `10 mg` during surgery; rocuronium `50 mg` at induction and `10 mg` an hour later, reversed with neostigmine `2.5 mg` and glycopyrrolate `0.4 mg`; no train-of-four recorded. No benzodiazepines.',
        vitals: { HR: 60, BP: '128/72', SpO2: 93, RR: 8, T: 36.0 },
        choices: [
          { text: 'This looks like too much opioid for him: morphine’s active breakdown products build up when the kidneys are poor. Give naloxone in small steps.', next: 'c', good: true, feedback: 'Pinpoint pupils, slow breathing, morphine `10 mg` in a 72-year-old with poor kidneys: opioid excess is the likely cause.' },
          { text: 'Keep stimulating him: it will wear off.', next: 'a2', good: false, feedback: 'In kidney disease morphine’s effects can last for hours. As soon as you stop talking, he stops breathing. He needs treatment.' },
          { text: 'Give flumazenil.', next: 'b', good: false, feedback: 'There is no benzodiazepine on the chart. Flumazenil won’t help and can cause seizures. Try again.' },
        ],
      },
      c: {
        text: 'How much naloxone do you give?',
        vitals: { HR: 60, BP: '128/72', SpO2: 93, RR: 7, T: 36.0 },
        choices: [
          { text: 'Naloxone `40 mcg` IV (dilute `400 mcg` to `10 mL` and give `1 mL`), repeated every 2 minutes until he breathes over `10` a minute and is rousable.', next: 'd', good: true, feedback: 'Small steps restore breathing without stripping away all his pain relief. The aim is breathing, not wide awake.' },
          { text: 'Naloxone `400 mcg` IV in one go.', next: 'big', good: false, feedback: 'A full dose at once reverses everything: sudden severe pain, high BP, a fast heart and, rarely, fluid on the lungs.' },
          { text: 'Wait for the primary anaesthetist before giving naloxone.', next: 'a2', good: false, feedback: 'Slow breathing with falling saturation can’t wait. Small doses of naloxone are a PACU MO’s job; call the anaesthetist as well, not instead.' },
        ],
      },
      big: {
        text: 'He sits bolt upright, pulls off the mask and shouts in pain (`10/10`).',
        vitals: { HR: 118, BP: '188/102', SpO2: 95, RR: 24, T: 36.0 },
        choices: [
          { text: 'Reassure him, call the primary anaesthetist, give any non-opioid pain relief that is due, and, only if the anaesthetist agrees, tiny doses of fentanyl (`10 mcg`) with close watching. Remember the naloxone will wear off before the morphine does.', next: 'd', good: true, feedback: 'Treat the pain carefully. Naloxone lasts less than an hour, so once it wears off his morphine can take hold again: plan for that.' },
          { text: 'Give morphine `5 mg` IV for the pain.', next: 'big', good: false, feedback: 'When the naloxone wears off in 30–60 minutes, the old morphine and the new dose act together and he stops breathing again. Small, careful doses only, with the anaesthetist.' },
          { text: 'Nothing: he is awake, so the problem is solved.', next: 'big', good: false, feedback: 'He is in severe pain with a dangerous BP, and the naloxone will wear off before the morphine. He needs a plan.' },
        ],
      },
      d: {
        text: 'Now he is awake, breathing `12` a minute and talking, pain `3/10`. But his breaths are shallow and jerky, he can’t lift his head off the pillow for 5 seconds, and his grip is weak.',
        vitals: { HR: 74, BP: '138/78', SpO2: 94, RR: 12, T: 36.1 },
        choices: [
          { text: 'Suspect muscle relaxant still working: check the train-of-four (TOF) with a nerve stimulator and tell the primary anaesthetist. Further reversal is their decision.', next: 'e', good: true, feedback: 'Shallow, jerky breathing, a weak head lift and a weak grip after a top-up of rocuronium with no TOF recorded: residual block until proven otherwise. Neostigmine works reliably only once the TOF count is 4; given at a lower count, or without checking, it can leave the patient weak.' },
          { text: 'More naloxone.', next: 'd', good: false, feedback: 'The opioid effect is already reversed: he is awake and breathing faster. Weakness with shallow breathing points to muscle relaxant still working.' },
          { text: 'Another dose of neostigmine `2.5 mg`.', next: 'd', good: false, feedback: 'Neostigmine has a ceiling: beyond about `0.05 mg/kg` (`5 mg` at most) it adds side effects, not strength. Further reversal is the primary anaesthetist’s decision.' },
        ],
      },
      e: {
        text: 'The TOF ratio is `0.6`; it needs to be over `0.9`. The primary anaesthetist arrives and gives sugammadex `2 mg/kg` (about `140 mg`). Within 2 minutes he lifts his head, grips strongly and breathes deeply. The nurse asks whether he can go to the ward.',
        vitals: { HR: 76, BP: '136/80', SpO2: 97, RR: 14, T: 36.2 },
        choices: [
          { text: 'Not yet. Naloxone wears off in 30–60 minutes, before morphine does. Keep him monitored for at least 2 hours after the last naloxone dose (longer is safer with morphine and poor kidneys), ask the primary anaesthetist whether he needs a monitored bed (their decision), avoid more morphine, and record everything.', next: 'good', good: true, feedback: 'The danger is the naloxone wearing off while the morphine is still working. Watch him long enough, and leave the monitored-bed decision to a senior.' },
          { text: 'Yes: he is awake and strong now.', next: 'wardBad', good: false, feedback: 'Naloxone lasts less than an hour; in kidney disease morphine’s effects last much longer.' },
          { text: 'Send him to the ward with a dose of naloxone written up in case.', next: 'wardBad', good: false, feedback: 'A dose written up only helps if someone notices in time. He needs watching where staff can see him, for at least 2 hours after his last naloxone.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'He stays awake and breathing well for over 2 hours. The primary anaesthetist sends him to the ward with continuous oxygen saturation monitoring, no morphine, and a plan for paracetamol and small doses of a safer opioid if needed.',
        vitals: { HR: 74, BP: '134/78', SpO2: 96, RR: 14, T: 36.4 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'He stops breathing. The PACU team ventilates him with a bag and mask and gives naloxone, and he recovers. He then needs a naloxone infusion and a night in high dependency (HD).',
        vitals: { HR: 44, BP: '96/58', SpO2: 70, RR: 0, T: 36.0 },
      },
      wardBad: {
        end: true, outcome: 'bad',
        text: 'Ninety minutes later the ward nurse finds him unresponsive, breathing `5` a minute. The medical emergency team gives naloxone and he recovers, but he needs a naloxone infusion and a night in high dependency (HD).',
        vitals: { HR: 54, BP: '112/66', SpO2: 80, RR: 5, T: 36.0 },
      },
    },
    debrief: [
      'Drowsy, breathing slowly, pinpoint pupils: opioid until proven otherwise. Go at once: stimulate, open the airway, give oxygen, call for help.',
      'Read the chart before giving a new drug. Morphine’s breakdown products build up in kidney disease (handbook).',
      'Naloxone in small steps: `40 mcg` IV every 2 minutes, to restore breathing, not to wake him fully. A big dose brings back severe pain and a high BP, and rarely fluid on the lungs.',
      'Naloxone wears off before morphine: keep the patient monitored for at least 2 hours after the last dose, longer after morphine in kidney disease.',
      'Shallow, jerky breathing and a weak head lift after reversal mean residual block: check the TOF ratio (it must be over `0.9`). Neostigmine is given only once the TOF count is 4; further reversal is the primary anaesthetist’s decision. See the [opioid overdose card](#/crisis/opioid-overdose) and [Other PACU problems](#/learn/pacu/pacu-problems).',
    ],
  },

  // ------------------------------------------------------------------ 8
  {
    id: 'premed-flags',
    title: 'A premed with several problems',
    setting: 'Premeds, 17:30 the day before',
    level: 'core',
    summary: 'A diabetic on empagliflozin and apixaban, a loose tooth and sleep apnoea: what to find out and what to flag.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 64-year-old man, `98 kg`, `170 cm` (BMI 34), is first on tomorrow’s list for a left total knee replacement. The pre-op clinic notes: type 2 diabetes (HbA1c `8.2%`) on metformin and empagliflozin; atrial fibrillation on apixaban; hypertension; “told to stop apixaban 2 days and empagliflozin 3 days before surgery.” He tells you he took both this morning: no one told him to stop.',
        vitals: { HR: 82, BP: '148/86', SpO2: 95, RR: 16, T: 36.7 },
        choices: [
          { text: 'Pin down the facts: the exact drugs, doses and time of the last doses (ask him, check the ward chart), and his kidney function. Then plan to call your consultant today.', next: 'b', good: true, feedback: 'Facts first. Your consultant will want the exact time of the last doses and his kidney function before deciding anything.' },
          { text: 'Tell him the operation is cancelled.', next: 'a', good: false, feedback: 'Not your decision. The department rule: don’t cancel or refer cases on your own. Get the facts, then call your consultant.' },
          { text: 'One day off is close enough: carry on.', next: 'a', good: false, feedback: 'It isn’t close. Apixaban taken this morning will still be working tomorrow, and the timing decides whether a spinal is safe. Flag it.' },
        ],
      },
      b: {
        text: 'Last apixaban `5 mg` at 08:00 today, and empagliflozin `10 mg` at the same time. His kidney function is normal. Your consultant may plan a spinal. What is the key point about the apixaban?',
        vitals: { HR: 82, BP: '148/86', SpO2: 95, RR: 16, T: 36.7 },
        choices: [
          { text: 'The time of the last dose. By tomorrow morning it will be only about 24 hours: short of the handbook’s 2 days for surgery, and a spinal needs a longer gap still. Your consultant decides with the surgeon: usually postpone.', next: 'c', good: true, feedback: 'Yes. The handbook’s `2 days` is the general surgical timing (longer when the kidneys are poor); spinals and epidurals need a longer, separate interval, set out in [the spinal page’s table](../spinal/#tq-anticoag). Give your consultant the exact time and his kidney function.' },
          { text: 'He needs enoxaparin bridging while the apixaban is stopped.', next: 'b', good: false, feedback: 'Apixaban and the other direct oral anticoagulants don’t need bridging: they wear off and start working quickly. Bridging is for some patients on warfarin, and it is the consultant’s and surgeon’s decision.' },
          { text: 'Let him take tonight’s dose as usual and sort it out tomorrow.', next: 'b', good: false, feedback: 'Tonight’s dose would push the safe time for surgery or a spinal back even further. This needs a decision tonight, from your consultant.' },
        ],
      },
      c: {
        text: 'The empagliflozin: he took it this morning. His glucose today is `7.8 mmol/L`.',
        vitals: { HR: 82, BP: '148/86', SpO2: 95, RR: 16, T: 36.7 },
        choices: [
          { text: 'Flag it. SGLT2 inhibitors (the “-gliflozins”) should stop 3 days before surgery because of euglycaemic diabetic ketoacidosis (DKA). Omit it from now, ask for ketones and glucose to be checked on the morning, and let your consultant decide whether the case can go ahead.', next: 'd', good: true, feedback: 'Right. These drugs can cause ketoacidosis with a normal glucose, especially when fasting and stressed by surgery. Ketones, not glucose, show it.' },
          { text: 'No problem: his glucose is normal.', next: 'c', good: false, feedback: 'That is the trap: euglycaemic DKA happens with a normal glucose. Ketones show it, not glucose.' },
          { text: 'Stop his metformin too and start an insulin infusion tonight.', next: 'c', good: false, feedback: 'Diabetes medicine plans follow the department guideline and your consultant; an overnight insulin infusion isn’t needed for this. Flag it rather than improvising.' },
        ],
      },
      d: {
        text: 'He snores loudly, is tired in the day, and his wife has seen him stop breathing at night. Neck `44 cm`. He was diagnosed with obstructive sleep apnoea (OSA) and given a CPAP machine, but rarely uses it.',
        vitals: { HR: 82, BP: '148/86', SpO2: 95, RR: 16, T: 36.7 },
        choices: [
          { text: 'STOP-BANG `7/8` with known OSA. Ask him to use his CPAP tonight and bring it tomorrow, and flag it to your consultant: an opioid-sparing plan, and whether he needs a monitored bed afterwards (their decision).', next: 'e', good: true, feedback: 'Snoring, Tired, Observed apnoeas, high blood Pressure, Age over 50, Neck over 40 cm, male Gender: 7 of 8 (his BMI is just under 35). Bringing the CPAP and an opioid-sparing plan both make the night after surgery safer.' },
          { text: 'Book a high dependency (HD) bed yourself.', next: 'e', good: 'ok', feedback: 'Checking HD or ICU needs is part of a premed, but whether he needs a bed is your consultant’s call. Flag it and ask.' },
          { text: 'OSA is common: nothing to do.', next: 'd', good: false, feedback: 'Untreated OSA makes him sensitive to opioids and sedatives and more likely to obstruct after surgery. It changes the plan, so flag it.' },
        ],
      },
      e: {
        text: 'His airway: Mallampati 3, thyromental distance `6 cm`, mouth opening 3 fingers, full neck movement, and a loose upper front tooth.',
        vitals: { HR: 82, BP: '148/86', SpO2: 95, RR: 16, T: 36.7 },
        choices: [
          { text: 'Document it, warn him that the tooth could be damaged or come out during airway management, record that you told him, and tell your consultant.', next: 'f', good: true, feedback: 'Dental damage is one of the commonest complaints after an anaesthetic. A documented, counselled loose tooth is a known risk; an unmentioned one is a surprise for everyone.' },
          { text: 'Pull the loose tooth out yourself so it can’t fall into the airway.', next: 'e', good: false, feedback: 'Not your job, and not without a dentist. Document it, counsel him and tell your consultant.' },
          { text: 'It’s only one tooth: not worth mentioning.', next: 'e', good: false, feedback: 'Loose teeth can be knocked out by a laryngoscope or a bite block, and could be inhaled. Counsel him, document it and tell your consultant.' },
        ],
      },
      f: {
        text: 'You call your consultant. What do you say?',
        vitals: { HR: 82, BP: '148/86', SpO2: 95, RR: 16, T: 36.7 },
        choices: [
          { text: '“First case tomorrow: 64-year-old man for a left knee replacement, BMI 34. Three problems. One: he took apixaban and empagliflozin at 08:00 today; nobody told him to stop. Two: OSA, STOP-BANG 7, rarely uses CPAP; I’ve asked him to bring it. Three: loose upper front tooth, Mallampati 3. Diabetes with HbA1c 8.2 on metformin; kidneys normal. What would you like me to do?”', next: 'good', good: true, feedback: 'Short, numbered, with the facts that matter and a clear question at the end. Your consultant can decide in one call.' },
          { text: 'Send a message with the main points, and leave the apixaban for the morning team to sort out.', next: 'okEnd', good: 'ok', feedback: 'A message is better than nothing, but the anticoagulant timing needs a decision tonight. Call, don’t just text, when something affects whether the case goes ahead.' },
          { text: 'Call the surgeon and tell them to cancel.', next: 'f', good: false, feedback: 'Not your decision to make or pass on. Your consultant decides, and speaks to the surgeon.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'Your consultant speaks to the surgeon that evening. The operation moves to later in the week; both drugs are stopped with clear written instructions, and the plan notes the OSA, the CPAP and the loose tooth. No one is fasted for nothing.',
      },
      okEnd: {
        end: true, outcome: 'ok',
        text: 'The consultant reads your message at 07:30. The case can’t go ahead safely, the list is reshuffled at the last minute, and the patient, fasted for hours, goes home without his operation.',
      },
    },
    debrief: [
      'Always check the last dose of every anticoagulant and antiplatelet, not just what the clinic wrote. The surgeon and consultant decide when to stop; spinals and epidurals have their own, longer intervals ([spinal page](../spinal/#tq-anticoag)).',
      'SGLT2 inhibitors (the “-gliflozins”) stop 3 days before surgery (ertugliflozin 4). Euglycaemic DKA happens with a normal glucose: check ketones.',
      'OSA: score STOP-BANG, ask them to bring their CPAP, plan opioid-sparing analgesia, and let the consultant decide on monitoring afterwards.',
      'Loose teeth: document, counsel and tell your consultant.',
      'Never cancel or refer on your own: get the facts, then call with a short, numbered summary. Try the [premed builder](#/tools/premed) and read [Medicines before surgery](#/learn/preop/medicines).',
    ],
  },

  // ------------------------------------------------------------------ 9
  {
    id: 'rsi-appendix',
    title: 'RSI for an appendicectomy',
    setting: 'Emergency theatre, 21:30',
    level: 'core',
    summary: 'He ate 3 hours ago: plan a rapid sequence induction with your consultant, then the first look fails.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 28-year-old man, `75 kg`, `175 cm`, for a laparoscopic appendicectomy. He ate a full meal 3 hours ago, has vomited once and still feels sick. Temperature `38.1 °C`. His airway assessment is normal. Your consultant: “How shall we put him to sleep?”',
        vitals: { HR: 102, BP: '128/76', SpO2: 98, RR: 18, T: 38.1 },
        choices: [
          { text: 'A rapid sequence induction (RSI): he isn’t fasted and has an acute abdomen, so he is at high risk of aspiration.', next: 'b', good: true, feedback: 'Both are on the handbook’s list of reasons for an RSI: inadequate fasting and an acute abdomen.' },
          { text: 'A standard induction with a supraglottic airway: it’s a short case.', next: 'a', good: false, feedback: 'A supraglottic airway doesn’t protect the lungs from vomit. Inadequate fasting and an acute abdomen both call for an RSI.' },
          { text: 'Wait until he has been fasted for 6 hours.', next: 'a', good: false, feedback: 'Pain, opioids and the inflamed appendix slow the stomach, so it may still be full at 6 hours, and delay risks perforation. Treat him as a full stomach whatever the clock says.' },
        ],
      },
      b: {
        text: 'Your consultant agrees an RSI with propofol and suxamethonium. What do you prepare?',
        vitals: { HR: 100, BP: '126/76', SpO2: 98, RR: 18, T: 38.1 },
        choices: [
          { text: 'Doses worked out and drawn up: propofol `150 mg` (`2 mg/kg`; your consultant gives less if his BP is low or he looks septic) and suxamethonium `100 mg` (`1–1.5 mg/kg` of total body weight), with rocuronium and sugammadex available. Suction on and under the pillow; bougie, video laryngoscope, a smaller tube and a second-generation supraglottic airway ready; the AU nurse briefed on cricoid pressure.', next: 'c', good: true, feedback: 'Everything ready before you start: in an RSI there is no time to fetch anything.' },
          { text: 'Propofol and rocuronium `45 mg` (`0.6 mg/kg`).', next: 'b', good: false, feedback: '`0.6 mg/kg` is the routine intubating dose and takes 2–3 minutes. For an RSI rocuronium is `1–1.2 mg/kg` so that it works in about a minute: about `75–90 mg` for him. (The handbook says `1 mg/kg` of lean body weight, which under-doses a man who isn’t obese; in obesity your consultant chooses the weight.) And your consultant chose suxamethonium.' },
          { text: 'Draw up the induction drugs, and fetch extra kit only if there’s a problem.', next: 'b', good: false, feedback: 'In an RSI there is no time to fetch kit. Everything must be ready, checked and within reach before you start.' },
        ],
      },
      c: {
        text: 'He is on the table with monitors on. How do you preoxygenate and position him?',
        vitals: { HR: 98, BP: '130/78', SpO2: 98, RR: 18, T: 38.1 },
        choices: [
          { text: 'Head up about 20–30°, a tight-fitting mask with `100%` oxygen for 3 minutes of normal breathing until the EtO2 is above `80%` (the handbook’s minimum; aim for `90%` or more). The AU nurse presses lightly on the cricoid (`10 N`) while he is awake and firmly (`30 N`) as he goes to sleep.', next: 'd', good: true, feedback: 'Head-up preoxygenation fills the lungs with more oxygen and buys apnoea time. Cricoid pressure goes from light to firm as he loses consciousness.' },
          { text: 'Thirty seconds of oxygen: speed matters in an RSI.', next: 'c', good: false, feedback: 'Speed matters after induction, not before. Full preoxygenation buys the time you will need if intubation is difficult.' },
          { text: 'Firm cricoid pressure from the start, while he is awake.', next: 'c', good: false, feedback: '`30 N` on an awake patient hurts and can make him retch. Light pressure while awake, firm as consciousness goes.' },
        ],
      },
      d: {
        text: 'EtO2 `92%`. Your consultant gives propofol `150 mg` then suxamethonium `100 mg` in quick succession, with cricoid pressure on. Fasciculations ripple across his chest. Your consultant: “You do the laryngoscopy.”',
        vitals: { HR: 108, BP: '118/70', SpO2: 100, RR: 0, T: 38.1 },
        choices: [
          { text: 'Don’t bag. Wait until the fasciculations stop (about 45–60 seconds), then laryngoscopy. If he desaturates, gentle mask ventilation (no more than `20 cmH2O`) is your consultant’s call.', next: 'e', good: true, feedback: 'The handbook: no bagging until the tube is confirmed. Current practice allows gentle mask ventilation during an RSI if the saturation falls; your consultant decides.' },
          { text: 'Bag him firmly while you wait for the suxamethonium.', next: 'd', good: false, feedback: 'Firm bagging fills the stomach with gas and makes vomiting more likely: exactly what an RSI is designed to avoid.' },
          { text: 'Start the laryngoscopy at once, during the fasciculations.', next: 'd', good: false, feedback: 'Wait for the fasciculations to finish: until then the jaw and cords may not be relaxed.' },
        ],
      },
      e: {
        text: 'You look: you can see only the epiglottis, no cords and no arytenoids (Cormack–Lehane grade 3). SpO2 `96%`.',
        vitals: { HR: 112, BP: '124/74', SpO2: 96, RR: 0, T: 38.1 },
        choices: [
          { text: 'Say what you see (“Grade 3, no cords”), take the blade out and hand over to your consultant, with the bougie and video laryngoscope ready. Your consultant may ask the nurse to ease the cricoid.', next: 'f', good: true, feedback: 'Saying it early lets the most experienced person make the next attempt with the right kit, while the saturation is still good.' },
          { text: 'Keep trying with the same blade for another minute.', next: 'e2', good: false, feedback: 'A long attempt with a poor view uses up his oxygen and causes swelling. Repeating the same thing rarely gives a different result.' },
          { text: 'Pass the tube blindly where you think the cords are.', next: 'e2', good: false, feedback: 'Blind attempts often go into the oesophagus and cause swelling and bleeding.' },
        ],
      },
      e2: {
        text: 'Your attempt has taken 90 seconds. SpO2 `86%`, heart rate `124`. Your consultant takes the laryngoscope: “Stop. What now?”',
        vitals: { HR: 124, BP: '130/80', SpO2: 86, RR: 0, T: 38.1 },
        choices: [
          { text: 'Oxygenate first: gentle mask ventilation with the cricoid on (or, if that fails, a supraglottic airway with the cricoid eased to let it in), as your consultant directs. Then your consultant makes the next attempt with the video laryngoscope and bougie.', next: 'f', good: true, feedback: 'Oxygen first, then a better attempt with better kit by the more experienced person.' },
          { text: '“Let me have one more go.”', next: 'bad', good: false, feedback: 'More attempts by the same person with the same kit, while desaturating, cause swelling and increase the risk of vomiting and aspiration.' },
          { text: 'Keep the cricoid on and wait for the saturation to recover.', next: 'e2', good: false, feedback: 'He isn’t breathing, so the saturation won’t recover unless oxygen goes in. Gentle mask ventilation with the cricoid on, as your consultant directs.' },
        ],
      },
      f: {
        text: 'Your consultant passes a bougie using the video laryngoscope and slides a size 8.0 tube over it. The cuff is inflated.',
        vitals: { HR: 104, BP: '122/74', SpO2: 97, EtCO2: 38, T: 38.1 },
        choices: [
          { text: 'Confirm with a sustained capnography trace, chest rise and listening on both sides. Cricoid pressure comes off only after that.', next: 'g', good: true, feedback: 'Right. The cricoid stays on until the cuff is up and the tube is confirmed in the trachea.' },
          { text: 'Release the cricoid as soon as the tube passes the cords.', next: 'f', good: false, feedback: 'Keep it on until the cuff is inflated and capnography confirms the tube is in the trachea.' },
          { text: 'The SpO2 is rising, so it’s in: release the cricoid.', next: 'f', good: false, feedback: 'Saturation can rise briefly even with a misplaced tube. Sustained capnography first, then release.' },
        ],
      },
      g: {
        text: 'Surgery goes well. At the end your consultant asks how he should be woken up.',
        vitals: { HR: 84, BP: '126/76', SpO2: 99, EtCO2: 38, RR: 12, T: 37.6 },
        choices: [
          { text: 'Empty the stomach through an orogastric tube, make sure the block is fully reversed (TOF ratio over `0.9`), and extubate with your consultant once he is fully awake, obeying commands and sitting up.', next: 'good', good: true, feedback: 'A full-stomach patient needs his protective reflexes back before the tube comes out: fully awake and sitting up.' },
          { text: 'Extubate deep, to avoid coughing.', next: 'g', good: false, feedback: 'A deep extubation leaves an unprotected airway in a full-stomach patient. He needs his reflexes back: fully awake.' },
          { text: 'Extubate him yourself while your consultant starts the next case.', next: 'g', good: false, feedback: 'In your first month you never extubate or end a case alone: call, then wait.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'He wakes fully, is extubated sitting up with your consultant beside you, and goes to PACU comfortable with a clear chest.',
        vitals: { HR: 88, BP: '132/78', SpO2: 98, RR: 14, T: 37.5 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'On your next attempt he regurgitates and the saturation drops to `70%`. Your consultant suctions and intubates with the video laryngoscope, but he has aspirated. The operation goes ahead and he is ventilated in the intensive care unit (ICU) overnight with aspiration pneumonitis.',
        vitals: { HR: 132, BP: '104/62', SpO2: 88, EtCO2: 34, T: 38.1 },
      },
    },
    debrief: [
      'An RSI is for anyone at high aspiration risk: not fasted, acute abdomen, obesity, delayed stomach emptying (trauma, poorly controlled diabetes) or significant reflux (handbook).',
      'Prepare everything first: doses worked out (suxamethonium `1–1.5 mg/kg` of total body weight, or rocuronium `1–1.2 mg/kg`: the handbook says `1 mg/kg` of lean body weight, but in an adult who isn’t obese use the actual weight, and in obesity your consultant decides), suction on, bougie, video laryngoscope, a supraglottic airway, and sugammadex `16 mg/kg` worked out if you use rocuronium (a way to wake the patient, not a guaranteed airway rescue).',
      'Preoxygenate head up to an EtO2 over `80%` (the handbook’s minimum; aim for `90%` or more). Cricoid light when awake, firm when asleep. No bagging until the tube is confirmed, unless your consultant decides on gentle mask ventilation.',
      'If you can’t see: say so, stop and hand over. One good attempt by the most experienced person beats several poor ones.',
      'Extubate full-stomach patients fully awake, with your consultant. Use the [RSI drug sheet](#/tools/rsi) and read [Rapid sequence induction](#/learn/induction/rsi).',
    ],
  },

  // ------------------------------------------------------------------ 10
  {
    id: 'spinal-hypotension',
    title: 'Low blood pressure after a spinal',
    setting: 'Urology list, 10:15',
    level: 'core',
    summary: 'TURP under spinal: the BP falls and he feels sick. Treat it, check the block height, then watch the resection.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 76-year-old man, `70 kg`, with hypertension, is having a transurethral resection of the prostate (TURP) under spinal anaesthesia. Your consultant gave `2.5 mL` of 0.5% heavy bupivacaine at L3–4. He is in lithotomy, and your consultant has gone to the control room, asking you to check the BP every 2–3 minutes. At your consultant’s request, phenylephrine and ephedrine are drawn up and labelled. Six minutes after the spinal he says, “I feel sick.” He looks pale and sweaty.',
        vitals: { HR: 54, BP: '78/42', SpO2: 96, RR: 18 },
        choices: [
          { text: 'Nausea after a spinal means low blood pressure until proven otherwise: give ephedrine `5 mg` IV now and repeat in 2–3 minutes if needed, give oxygen, and ask the nurse to call your consultant.', next: 'b', good: true, feedback: 'The spinal blocks the sympathetic nerves, so the vessels widen and the BP falls. Nausea is often the first sign. With a slow heart rate, ephedrine is a good choice.' },
          { text: 'Give an antiemetic for the nausea.', next: 'a2', good: false, feedback: 'The nausea is a symptom of the low BP (too little blood to the brain). An antiemetic treats the symptom and misses the cause.' },
          { text: 'Phenylephrine `100 mcg` IV.', next: 'b', good: 'ok', feedback: 'It will raise the BP, but with a heart rate of `54` the reflex slowing could make things worse. Ephedrine is the better first choice here.' },
          { text: 'Wait for the next BP reading.', next: 'a2', good: false, feedback: 'He is telling you something is wrong now. Treat the BP you have.' },
        ],
      },
      a2: {
        text: 'Two minutes later the BP is `64/34`, heart rate `46`. He vomits and is hard to rouse.',
        vitals: { HR: 46, BP: '64/34', SpO2: 93, RR: 16 },
        choices: [
          { text: 'Call your consultant now, ephedrine `5–10 mg` IV (repeat), oxygen, turn his head to the side and suction. Give atropine `0.6 mg` if the heart rate keeps falling, and be ready to start CPR if you lose the pulse.', next: 'b', good: true, feedback: 'A low BP with a slowing heart after a spinal can progress fast to cardiac arrest: treat both and get help now. If he doesn’t respond, small doses of adrenaline come next, led by your consultant.' },
          { text: 'Give another antiemetic.', next: 'bad', good: false, feedback: 'His brain is short of blood and his heart is slowing: antiemetics won’t touch that.' },
          { text: 'Atropine `0.6 mg` IV, then ephedrine, and call your consultant.', next: 'b', good: 'ok', feedback: 'Reasonable: the heart rate is falling and atropine treats that. Ephedrine treats both the rate and the BP, so most would give it first with atropine ready.' },
        ],
      },
      b: {
        text: 'After two doses of ephedrine the BP is `96/54`, heart rate `64`, and the nausea has gone. The surgeon wants to start.',
        vitals: { HR: 64, BP: '96/54', SpO2: 98, RR: 16 },
        choices: [
          { text: 'Check the block height with something cold on both sides (it is at T8 on both sides), and ask about tingling or weakness in his hands and how his breathing feels.', next: 'c', good: true, feedback: 'You need to know how high the block is. A block creeping up causes a falling BP and, if very high, trouble breathing. T8 is fine for a TURP; arm symptoms would mean a high block.' },
          { text: 'Tip the table head-down to bring the BP up.', next: 'b2', good: false, feedback: 'Heavy bupivacaine sinks with gravity: tipping head-down in the first 20–30 minutes lets it spread higher. Raising the legs is fine; tipping the whole table isn’t.' },
          { text: 'Nothing more: the BP is better.', next: 'b', good: false, feedback: 'You still don’t know how high the block is, and that tells you whether the BP is likely to fall again. Check it.' },
        ],
      },
      b2: {
        text: 'Ten minutes later he says his hands are tingling and his breathing feels heavy. The block is now at T2 to cold.',
        vitals: { HR: 52, BP: '82/46', SpO2: 94, RR: 20 },
        choices: [
          { text: 'Level the table, call your consultant (this is a high block), oxygen, ephedrine, reassure him, and be ready to support his breathing.', next: 'c', good: true, feedback: 'Stop the spread, get help, support the BP and the breathing. Most high blocks settle with support; a few need help with breathing until the block wears off.' },
          { text: 'Tip him further head-down to support the BP.', next: 'bad2', good: false, feedback: 'More head-down lets the heavy bupivacaine spread even higher.' },
          { text: 'Sit him bolt upright to stop the block spreading.', next: 'b2', good: false, feedback: 'Sitting up when the BP is already low drops it further, because blood pools in his numb legs. Level the table, support the BP and the breathing, and call.' },
        ],
      },
      c: {
        text: 'Things have settled: BP `98/56`, heart rate `66`. The resection starts. Your consultant, back in the room, asks about fluids.',
        vitals: { HR: 66, BP: '98/56', SpO2: 98, RR: 16 },
        choices: [
          { text: 'A modest fluid bolus (`250–500 mL` of Hartmann’s) and vasopressor boluses as needed, asking about an infusion if they keep being needed. Avoid large volumes: he is elderly, and he will also absorb some irrigation fluid.', next: 'd', good: true, feedback: 'The spinal widens the vessels: vasopressors fix that better than litres of fluid. In a TURP, irrigation fluid absorbed through the prostate adds to the load.' },
          { text: '`2 L` of fluid quickly.', next: 'c', good: false, feedback: 'Too much for an elderly heart, especially with irrigation fluid being absorbed as well. Small boluses and a vasopressor.' },
          { text: 'No fluid at all.', next: 'd', good: 'ok', feedback: 'Vasopressors are the main treatment, but a modest bolus is reasonable in a fasted elderly man. Talk it through with your consultant.' },
        ],
      },
      d: {
        text: 'Fifty minutes into a monopolar resection with glycine irrigation, he becomes restless and confused, says his vision is blurred, and feels sick again.',
        vitals: { HR: 50, BP: '172/96', SpO2: 93, RR: 22 },
        choices: [
          { text: 'Suspect TURP syndrome (irrigation fluid absorbed, sodium falling): tell the surgeon to stop or finish quickly, call your consultant, give oxygen, and check sodium and glucose on a blood gas now.', next: 'good', good: true, feedback: 'Confusion, visual change, nausea, a slow heart rate and a high BP during a long resection: TURP syndrome until proven otherwise. The surgeon needs to know now.' },
          { text: 'Midazolam to settle him.', next: 'd2', good: false, feedback: 'Sedation hides the cause and can obstruct his airway and slow his breathing.' },
          { text: 'Phenylephrine for the nausea.', next: 'd', good: false, feedback: 'His BP is high, not low: this nausea is not from a low BP. Think about what is different now.' },
        ],
      },
      d2: {
        text: 'He becomes drowsy and then has a short seizure.',
        vitals: { HR: 46, BP: '180/100', SpO2: 86, RR: 8 },
        choices: [
          { text: 'Call for help, airway and oxygen, tell the surgeon to stop, and send a blood gas for sodium. Your consultant leads the treatment.', next: 'okEnd', good: true, feedback: 'Airway and help first. A seizure in TURP syndrome usually means a very low sodium, which your consultant will treat carefully.' },
          { text: 'Another dose of midazolam.', next: 'd2', good: false, feedback: 'The seizure has stopped; more sedation will stop his breathing. Airway, oxygen, help and a sodium level.' },
          { text: 'Give phenytoin and let the surgeon carry on.', next: 'd2', good: false, feedback: 'The cause is a low sodium from absorbed irrigation fluid: the resection must stop and the sodium must be checked and corrected. An anticonvulsant won’t fix it.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'The sodium is `127 mmol/L`. The surgeon controls the bleeding points and finishes. Your consultant treats him and sends him to high dependency (HD); by the morning his sodium and his confusion have recovered.',
        vitals: { HR: 68, BP: '142/80', SpO2: 97, RR: 16 },
      },
      okEnd: {
        end: true, outcome: 'ok',
        text: 'The sodium is `116 mmol/L`. Your consultant protects his airway and treats the low sodium with small, measured doses of concentrated saline, checking the level often so it doesn’t rise too fast. He goes to the intensive care unit (ICU) and recovers over two days.',
        vitals: { HR: 60, BP: '150/88', SpO2: 96, RR: 14 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'His heart rate falls to `30` and he loses his pulse. Your consultant arrives as CPR starts; with adrenaline and atropine his circulation returns within two minutes, but the operation is abandoned and he goes to the intensive care unit (ICU).',
        vitals: { HR: 30, BP: '50/25', SpO2: 88, RR: 6 },
      },
      bad2: {
        end: true, outcome: 'bad',
        text: 'The block climbs into his neck. He can’t speak or breathe properly and loses consciousness. Your consultant intubates and ventilates him until the block wears off two hours later; he recovers, but the operation is abandoned.',
        vitals: { HR: 40, BP: '60/32', SpO2: 85, RR: 4 },
      },
    },
    debrief: [
      'Nausea after a spinal is low blood pressure until proven otherwise. Check the BP every 2–3 minutes for the first 20 minutes.',
      'Ephedrine `5 mg` if the heart rate is slow; phenylephrine `50–100 mcg` if it is normal or fast. Repeat as needed, and call your consultant.',
      'Check the block height with cold on both sides. Don’t tip head-down early after heavy bupivacaine. Tingling hands, a weak voice or trouble breathing mean a high block: call for help.',
      'Use small fluid boluses, not litres, in the elderly.',
      'TURP syndrome: confusion, nausea, blurred vision, a slow heart rate and a high BP during resection. Tell the surgeon, call for help, check the sodium. Read [Helping with a spinal](#/learn/regional/spinal-help) and see the [high spinal card](#/crisis/high-spinal).',
    ],
  },

  // ------------------------------------------------------------------ 11
  {
    id: 'pacu-discharge',
    title: 'Who can leave PACU?',
    setting: 'PACU, 16:30',
    level: 'core',
    summary: 'Three patients, three decisions: apply the nurse-led discharge criteria, the Aldrete score and the fast-track rule.',
    start: 'a',
    nodes: {
      a: {
        text: 'The PACU nurse asks you about three patients. First: a 34-year-old woman, ASA 1, knee arthroscopy under GA with a supraglottic airway, in PACU for 35 minutes. She is awake and chatty, moves all four limbs, breathes deeply and coughs when asked, SpO2 `97%` on air, BP within 10% of her pre-op value, pain `2/10`, no nausea, and there were no problems in theatre.',
        vitals: { HR: 76, BP: '118/72', SpO2: 97, RR: 14, T: 36.6 },
        choices: [
          { text: 'She meets the nurse-led discharge criteria (ASA 1–2, minor surgery, no airway or surgical problems) and her Aldrete score is `10`: the nurse can discharge her.', next: 'b', good: true, feedback: 'Right. ASA 1 or 2 patients after GA, regional or MAC who meet the criteria can be discharged by the nurse. Aldrete scores activity, breathing, circulation, consciousness and saturation, 0–2 each: she scores 10.' },
          { text: 'Only a doctor can discharge anyone after a GA.', next: 'a', good: false, feedback: 'At NTFGH, patients who meet the nurse-led discharge criteria can be discharged by the PACU nurse. The criteria list is in PACU.' },
          { text: 'Keep her another hour to be safe.', next: 'a', good: false, feedback: 'She has done her 30 minutes and meets the criteria. Keeping well patients fills PACU beds that sicker patients need.' },
        ],
      },
      b: {
        text: 'Second: a 58-year-old man, ASA 3 (obstructive sleep apnoea on CPAP, BMI 41), after a laparoscopic inguinal hernia repair, in PACU for 40 minutes. Awake, his SpO2 is `94%` on air. When he dozes off he snores and the SpO2 falls to `88%`. Pain `3/10`.',
        vitals: { HR: 84, BP: '146/88', SpO2: 88, RR: 12, T: 36.5 },
        choices: [
          { text: 'He isn’t for nurse-led discharge (ASA 3, OSA, high BMI). Keep him in PACU: sit him up, give oxygen, put on his own CPAP, and discuss with the primary anaesthetist whether he needs a monitored bed.', next: 'c', good: true, feedback: 'OSA and a high BMI are on the exclusion list. Obstruction when asleep is exactly the risk: CPAP and sitting up treat it, and a monitored bed is a senior’s decision.' },
          { text: 'Nurse-led discharge: he is awake and comfortable.', next: 'b', good: false, feedback: 'He is excluded: ASA 3, OSA and a high BMI. And awake isn’t the test: he desaturates when asleep, which is what he will do on the ward.' },
          { text: 'Send him to the ward with nasal oxygen.', next: 'b', good: false, feedback: 'Oxygen can keep the saturation number up while he obstructs and his CO2 rises. He needs CPAP, and a senior to decide where he goes.' },
        ],
      },
      c: {
        text: 'On CPAP and sitting up, his SpO2 stays at `95%` while asleep. The primary anaesthetist decides he should go to high dependency (HD). The nurse asks who will take him.',
        vitals: { HR: 80, BP: '140/84', SpO2: 95, RR: 14, T: 36.5 },
        choices: [
          { text: 'The primary anaesthetic team’s MO takes him to HD, and a PACU discharge note is still written.', next: 'd', good: true, feedback: 'That is the department rule: HD transfers from PACU are done by the primary anaesthetic MO, and a PACU discharge note is still needed.' },
          { text: 'You take him: you are the PACU MO.', next: 'c', good: false, feedback: 'The PACU MO must stay physically in PACU. HD transfers are done by the primary anaesthetic MO.' },
          { text: 'The PACU nurse takes him alone.', next: 'c', good: false, feedback: 'A patient going to HD goes with the primary anaesthetic MO.' },
        ],
      },
      d: {
        text: 'Third: a 71-year-old woman, ASA 3, after cataract surgery under topical local anaesthetic with monitoring only (MAC), given no sedation or other drugs. She has been in PACU for 10 minutes, comfortable, with normal vitals.',
        vitals: { HR: 72, BP: '138/80', SpO2: 97, RR: 14, T: 36.6 },
        choices: [
          { text: 'She can be fast-tracked: a stable MAC eye patient who had no drugs may leave before 30 minutes, and ASA 3 cataract patients are the one ASA 3 group allowed nurse-led discharge. The primary anaesthetist says whether fast track applies.', next: 'e', good: true, feedback: 'Right on both counts. Fast track is only for stable MAC eye cases with no medication, and the primary anaesthetist decides.' },
          { text: 'ASA 3, so no nurse-led discharge.', next: 'd', good: false, feedback: 'Cataract patients are the exception: ASA 3 cataract patients can have nurse-led discharge.' },
          { text: 'She must stay 30 minutes like everyone else.', next: 'e', good: 'ok', feedback: 'Safe, but not needed. Stable MAC eye cases who had no drugs can be fast-tracked before 30 minutes if the primary anaesthetist agrees.' },
        ],
      },
      e: {
        text: 'As the first patient stands up to leave, she says she feels faint. She is pale and sweaty.',
        vitals: { HR: 52, BP: '86/50', SpO2: 97, RR: 16, T: 36.6 },
        choices: [
          { text: 'Stop the discharge. Lie her flat with her legs raised, recheck the BP, look at the chart and at her knee for bleeding, and give a fluid bolus. She goes only when she is stable and scores well again.', next: 'good', good: true, feedback: 'A patient who met the criteria a minute ago can change. Reassess from the start: it is probably a simple faint, but rule out bleeding and drug effects first.' },
          { text: 'It’s only a faint on standing: let her go.', next: 'okEnd', good: false, feedback: 'She no longer meets the discharge criteria: her BP is well below her pre-op value and she has symptoms.' },
          { text: 'Give ephedrine `5 mg` and let her go once the BP is up.', next: 'e', good: false, feedback: 'Treating the number and sending her off skips the question of why. Lie her down, find the cause, and discharge only when she is stable without drugs.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'Lying flat with `250 mL` of fluid, her BP returns to `116/70` and the faintness passes; her knee dressing is dry. Thirty minutes later she sits, stands and walks without symptoms and goes home. All three patients are where they should be.',
        vitals: { HR: 70, BP: '116/70', SpO2: 98, RR: 14, T: 36.6 },
      },
      okEnd: {
        end: true, outcome: 'ok',
        text: 'She faints in the lift and is brought back to PACU. She recovers with fluids and lying flat and goes home two hours later, shaken but unharmed.',
      },
    },
    debrief: [
      'Everyone stays at least 30 minutes after GA or regional anaesthesia. Stable MAC eye cases who had no drugs may be fast-tracked if the primary anaesthetist says so.',
      'Nurse-led discharge: ASA 1–2 after GA, regional or MAC. ASA 3 patients are excluded, except ASA 3 cataract patients; ASA 4 never. Also excluded: OSA, high BMI, ENT, major abdominal, chest or vascular surgery, a difficult airway, or any complication during or expected after surgery. The full list is in PACU.',
      'Aldrete score: activity, breathing, circulation, consciousness and oxygen saturation, 0–2 each; `9` or more, with no `0`, to go. Try the [Aldrete tool](#/tools/aldrete).',
      'Patients going to HD are taken by the primary anaesthetic MO, with a PACU discharge note. The PACU MO stays in PACU, and HD or ICU decisions belong to a senior.',
      'A patient who was ready to go can change: reassess whenever something new happens. Read [Discharge from PACU](#/learn/pacu/discharge).',
    ],
  },

  // ------------------------------------------------------------------ 12
  {
    id: 'last-block',
    title: 'Toxicity after a nerve block',
    setting: 'Block room, 08:20',
    level: 'core',
    summary: 'Tinnitus, then a seizure during a block: stop, call, airway, benzodiazepine, Intralipid, CPR ready.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 62-year-old woman, `60 kg`, for fixation of a broken wrist. Your consultant is doing an ultrasound-guided supraclavicular block with ropivacaine 0.5%. You inject `5 mL` at a time when asked, aspirating before each. After `15 mL` she says, “My lips are tingling and there’s ringing in my ears.”',
        vitals: { HR: 92, BP: '146/84', SpO2: 98, RR: 18 },
        choices: [
          { text: 'Stop injecting at once and say it: “She has tingling lips and ringing ears: possible local anaesthetic toxicity.” Call for help, give `100%` oxygen, and ask someone to bring the Intralipid.', next: 'b', good: true, feedback: 'Exactly. Tingling lips, a metallic taste, ringing ears and light-headedness are the early warnings of local anaesthetic systemic toxicity (LAST). Stopping now limits the dose.' },
          { text: 'It’s anxiety: reassure her and carry on.', next: 'b', good: false, feedback: 'These are classic early signs of toxicity. You inject another `10 mL`, and the toxicity gets worse.' },
          { text: 'Give midazolam `2 mg` for her anxiety and finish the injection.', next: 'b', good: false, feedback: 'Midazolam can hide the warning signs while you give more of the drug causing them. You finish the injection, and the toxicity gets worse.' },
        ],
      },
      b: {
        text: 'Thirty seconds later she stiffens and has a generalised seizure.',
        vitals: { HR: 118, BP: '172/96', SpO2: 91 },
        choices: [
          { text: 'Protect the airway and oxygenate: `100%` oxygen by mask, jaw thrust, and help her breathe with the bag (high CO2 makes toxicity worse). Stop the seizure with midazolam `2–5 mg` IV (repeated if needed), and get the Intralipid open.', next: 'c', good: true, feedback: 'Airway and oxygen first; a benzodiazepine for the seizure; and the antidote ready. Acidosis and high CO2 make local anaesthetic toxicity worse, so good ventilation matters.' },
          { text: 'Give suxamethonium to stop the seizure.', next: 'b', good: false, feedback: 'It stops the movement, not the seizure in the brain, and leaves her paralysed. A benzodiazepine is the drug for the seizure. Your consultant asks for midazolam.' },
          { text: 'Give propofol `200 mg` to stop the seizure.', next: 'b2', good: false, feedback: 'Propofol does stop seizures, but a big dose depresses a heart already poisoned by local anaesthetic. Small doses only, if at all; a benzodiazepine is preferred.' },
        ],
      },
      b2: {
        text: 'The seizure stops, but now the heart rate is `44`, the BP `68/38`, and the QRS complexes are widening.',
        vitals: { HR: 44, BP: '68/38', SpO2: 94 },
        choices: [
          { text: 'Ventilate with `100%` oxygen, and get the Intralipid running now, dosed by weight, as your consultant leads.', next: 'c', good: true, feedback: 'Her heart is now affected: Intralipid is the antidote, and it should go in without delay.' },
          { text: 'Atropine, and wait to see if she recovers on her own.', next: 'arrest', good: false, feedback: 'Atropine won’t reverse a heart poisoned by local anaesthetic, and waiting lets it get worse.' },
          { text: 'Amiodarone `300 mg` IV for the wide QRS.', next: 'b2', good: false, feedback: 'The wide QRS is the local anaesthetic blocking the heart’s sodium channels. The antidote is Intralipid; amiodarone is for ventricular arrhythmias.' },
        ],
      },
      c: {
        text: 'The seizure has stopped. Now the heart rate is `46`, the BP `74/40`, and the QRS complexes are getting wider. The Intralipid 20% arrives. How much do you give?',
        vitals: { HR: 46, BP: '74/40', SpO2: 96 },
        choices: [
          { text: 'A bolus of `90 mL` (`1.5 mL/kg`) IV over 1 minute, then an infusion at `900 mL/h` (`15 mL/kg/h`).', next: 'd', good: true, feedback: 'The handbook regimen worked out for `60 kg`. Write down the times and amounts: the total must not go over `12 mL/kg` (`720 mL` for her).' },
          { text: '`500 mL` as fast as it will run.', next: 'c', good: false, feedback: 'Dose by weight: a bolus of `1.5 mL/kg`, then `15 mL/kg/h`, with a ceiling of `12 mL/kg` in total. Try again.' },
          { text: 'Atropine, and wait to see if she recovers on her own.', next: 'arrest', good: false, feedback: 'Atropine won’t reverse a heart poisoned by local anaesthetic, and every minute of waiting matters.' },
        ],
      },
      d: {
        text: 'Five minutes after the bolus: heart rate `58`, BP `82/46`. Still low.',
        vitals: { HR: 58, BP: '82/46', SpO2: 97 },
        choices: [
          { text: 'Repeat the `90 mL` bolus (up to two repeats, 5 minutes apart), double the infusion to `1800 mL/h` (`30 mL/kg/h`), keep the total under `720 mL`, and give small vasopressor doses as your consultant directs.', next: 'e', good: true, feedback: 'The handbook allows the bolus to be repeated twice and the infusion doubled. If a vasopressor is needed, small doses of adrenaline (up to `1 mcg/kg`) are used.' },
          { text: 'Vasopressin to bring the BP up.', next: 'd', good: false, feedback: 'Vasopressin is avoided in local anaesthetic toxicity. More Intralipid first, and small doses of adrenaline if your consultant wants a vasopressor.' },
          { text: 'Stop the Intralipid: the heart rate is improving.', next: 'd', good: false, feedback: 'She is still hypotensive. Keep the infusion going until the circulation has been stable for at least 10 minutes, without going over the `12 mL/kg` ceiling.' },
        ],
      },
      e: {
        text: 'Ten minutes later the heart rate is `84` and the BP `112/64`. She is waking up and talking.',
        vitals: { HR: 84, BP: '112/64', SpO2: 98, RR: 16 },
        choices: [
          { text: 'Keep her monitored in high dependency (HD) or the ICU for at least 4–6 hours, postpone the surgery (your consultant decides), record the drug, dose and timings, report the event, and explain to her what happened.', next: 'good', good: true, feedback: 'Toxicity can come back as the Intralipid wears off: at least 2 hours of monitoring after a seizure alone, 4–6 hours after any heart effects, as here. Postponing is usual, and an honest explanation is part of the care. Lipid can cause pancreatitis, so amylase or lipase is checked for two days.' },
          { text: 'Carry on with the surgery under GA now that she is stable.', next: 'e', good: false, feedback: 'She has just had a seizure and heart effects from toxicity, and can relapse. The operation isn’t urgent: your consultant will almost certainly postpone it.' },
          { text: 'Send her back to the ward.', next: 'e', good: false, feedback: 'She needs monitoring for several hours in HD or ICU, because toxicity can come back.' },
        ],
      },
      arrest: {
        text: 'The ECG shows ventricular fibrillation. There is no pulse.',
        vitals: { EtCO2: 8, SpO2: 85 },
        choices: [
          { text: 'Call a cardiac arrest, start CPR and defibrillate, give the Intralipid bolus and infusion, and use smaller doses of adrenaline (up to `1 mcg/kg`) as your consultant directs. Expect a long resuscitation.', next: 'okEnd', good: true, feedback: 'CPR with Intralipid. Resuscitation after local anaesthetic toxicity can take an hour or more, and patients can recover fully.' },
          { text: 'Give lignocaine for the ventricular fibrillation.', next: 'arrest', good: false, feedback: 'Never give more local anaesthetic. If an anti-arrhythmic is needed, use amiodarone.' },
          { text: 'Stop after 20 minutes if there is no response.', next: 'arrest', good: false, feedback: 'Resuscitation after local anaesthetic toxicity can take an hour or more, and patients can recover fully. Keep going with the lipid in; your consultant leads.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'She is monitored in HD overnight with no further problems and goes home two days later. Her wrist is fixed the following week under GA. Stopping at the first warning kept the dose, and the harm, down.',
        vitals: { HR: 78, BP: '124/72', SpO2: 98, RR: 14 },
      },
      okEnd: {
        end: true, outcome: 'ok',
        text: 'After 25 minutes of CPR, three Intralipid boluses and the infusion, her circulation returns. She is ventilated in the intensive care unit (ICU) overnight and recovers without lasting harm.',
        vitals: { HR: 104, BP: '96/54', SpO2: 95, EtCO2: 34 },
      },
    },
    debrief: [
      'Early signs of local anaesthetic systemic toxicity: tingling lips, a metallic taste, ringing ears, light-headedness and confusion. Then seizures, a slow heart, wide QRS complexes, arrhythmias and arrest. It can happen below the maximum dose if drug goes into a vein.',
      'Stop injecting, call for help, give `100%` oxygen and support breathing (a high CO2 and acidosis make it worse).',
      'Treat seizures with a benzodiazepine (midazolam); avoid large doses of propofol.',
      'Intralipid 20% (handbook): `1.5 mL/kg` bolus, then `15 mL/kg/h`; repeat the bolus up to twice and double the infusion to `30 mL/kg/h` if still unstable; no more than `12 mL/kg` in total.',
      'In cardiac arrest: CPR, smaller doses of adrenaline, no lignocaine, and expect it to be long. Know the maximum doses: [local anaesthetic maximum dose](#/tools/la-max) and the [LAST card](#/crisis/last).',
    ],
  },

  // ------------------------------------------------------------------ 13
  {
    id: 'cant-intubate',
    title: 'Failed intubation',
    setting: 'Elective list, 09:00',
    level: 'core',
    summary: 'Three failed attempts: a supraglottic airway to rescue, waking up, and when to say “CICO”.',
    start: 'a',
    nodes: {
      a: {
        text: 'A 50-year-old man, `110 kg`, `175 cm` (BMI 36), for an elective laparoscopic cholecystectomy. Mallampati 3, thick neck. Your consultant induced with propofol, fentanyl and rocuronium after showing that mask ventilation was easy. Their third attempt at intubation, with a video laryngoscope and a bougie, has just failed. SpO2 `91%`. Your consultant: “Can’t get it.”',
        vitals: { HR: 104, BP: '146/90', SpO2: 91 },
        choices: [
          { text: 'Say “Failed intubation”. Call for more help, bring the difficult airway trolley, and hand over a second-generation supraglottic airway (an i-gel size 5), with face-mask oxygen meanwhile.', next: 'b', good: true, feedback: 'Saying “failed intubation” moves everyone to plan B: oxygenate with a supraglottic airway. Getting more help and the trolley are jobs you can do straight away.' },
          { text: 'Offer to try yourself.', next: 'a2', good: false, feedback: 'After three failed attempts by your consultant, more attempts (especially by someone less experienced) cause swelling and bleeding and can turn “can oxygenate” into “can’t”. Move to plan B.' },
          { text: 'Start drawing up sugammadex so he can be woken.', next: 'b', good: 'ok', feedback: 'Waking him up may well be the plan, and sugammadex for a `110 kg` man takes several vials, so starting it is useful. But oxygen comes first: someone must also call for help and pass the supraglottic airway. Your consultant asks the nurse for the i-gel.' },
        ],
      },
      a2: {
        text: 'Another attempt fails and there is blood in the mouth. SpO2 `84%`, and mask ventilation is now harder.',
        vitals: { HR: 116, BP: '150/94', SpO2: 84 },
        choices: [
          { text: 'Say “Failed intubation”, call for help, get the difficult airway trolley, and pass a second-generation supraglottic airway.', next: 'b', good: true, feedback: 'Better now than after another attempt. Plan B: a supraglottic airway to oxygenate.' },
          { text: 'One more attempt.', next: 'd', good: false, feedback: 'Each attempt adds swelling and bleeding.' },
          { text: 'Wait for the drugs to wear off so he breathes on his own.', next: 'a2', good: false, feedback: 'Rocuronium lasts 30–60 minutes: he can’t wait that long. Oxygenate now with a supraglottic airway, and give sugammadex if the plan is to wake him.' },
        ],
      },
      b: {
        text: 'Your consultant inserts an i-gel size 5. There is a square capnography trace, the chest rises and the SpO2 climbs to `96%`. Your consultant: “OK. Stop and think. What are our options?”',
        vitals: { HR: 98, BP: '138/86', SpO2: 96, EtCO2: 40 },
        choices: [
          { text: 'Wake him up: it is an elective operation. Sugammadex `16 mg/kg` (`1760 mg` for `110 kg`) as your consultant decides, turn off the anaesthetic, keep oxygenating through the i-gel, and plan the next anaesthetic differently.', next: 'c', good: true, feedback: 'For elective surgery, waking up is usually the safest answer once you can oxygenate. Sugammadex `16 mg/kg` reverses rocuronium within about 3 minutes; at `100 mg/mL` that is about `18 mL` from several vials. It removes the relaxant but doesn’t open a swollen or obstructed airway, so keep oxygenating.' },
          { text: 'Take out the i-gel and try once more with a laryngoscope.', next: 'd', good: false, feedback: 'You have just rescued oxygenation. Removing the device that works, for a fourth attempt, risks losing the airway completely.' },
          { text: 'Carry on with the surgery using the i-gel.', next: 'b', good: false, feedback: 'For an elective laparoscopic operation, with gas in the abdomen and a raised risk of regurgitation, carrying on with a supraglottic airway is rarely right. It is reserved for life-saving surgery, and it is the consultant’s call.' },
        ],
      },
      c: {
        text: 'Within 2 minutes of the sugammadex the TOF ratio is over `0.9`; he breathes strongly and wakes up. Your consultant takes the i-gel out once he is awake. What now?',
        vitals: { HR: 92, BP: '150/88', SpO2: 98, RR: 16 },
        choices: [
          { text: 'Help your consultant record exactly what happened (the Cormack–Lehane grade of each view, devices, attempts, that mask ventilation was easy, what worked), explain it to him once he is awake, and make sure there is a difficult airway alert in his records and a letter for him and his family doctor.', next: 'good', good: true, feedback: 'The next anaesthetist’s plan depends on what you write today. An alert and a letter mean he will be planned for properly, probably with an awake intubation.' },
          { text: 'Don’t tell him: it would worry him.', next: 'c', good: false, feedback: 'He needs to know, and to tell every future anaesthetist. Explain it plainly once he is awake.' },
          { text: 'Just write “difficult intubation” in the notes.', next: 'c', good: false, feedback: 'Not enough. The next team needs the details: views, devices tried, number of attempts, what worked, and whether mask ventilation was easy.' },
        ],
      },
      d: {
        text: 'Another laryngoscopy fails. The i-gel won’t seat properly again, and with two people on the face mask the chest doesn’t move. There is no capnography trace.',
        vitals: { HR: 118, BP: '150/92', SpO2: 74 },
        choices: [
          { text: 'Say it out loud: “Can’t intubate, can’t oxygenate (CICO). Front of neck access.” Open the scalpel kit, make sure he is fully paralysed (more rocuronium if needed), and keep trying oxygen from above while your consultant goes for the neck.', next: 'e', good: true, feedback: 'Anyone in the team can, and should, declare CICO. Full paralysis gives the best chance for a last attempt from above and makes the neck easier.' },
          { text: 'Try another laryngoscopy.', next: 'd2', good: false, feedback: 'He is running out of oxygen, and the airway from above has failed repeatedly. Delay is the biggest danger in CICO.' },
          { text: 'Wait for the second consultant to arrive.', next: 'd2', good: false, feedback: 'He can’t wait. Declare CICO and get the scalpel kit open.' },
        ],
      },
      d2: {
        text: 'The SpO2 is `58%` and the heart rate is slowing.',
        vitals: { HR: 48, BP: '96/60', SpO2: 58 },
        choices: [
          { text: 'Declare CICO now and open the scalpel kit for your consultant.', next: 'e', good: true, feedback: 'Late, but not too late. Say it clearly so everyone moves to front of neck access.' },
          { text: 'Keep trying with the face mask.', next: 'bad', good: false, feedback: 'The face mask has already failed with two people.' },
          { text: 'Give sugammadex and wait for him to breathe.', next: 'd2', good: false, feedback: 'Too late as a rescue: even with the block reversed he may not breathe through a swollen airway, and at this saturation there are no minutes to wait. Declare CICO.' },
        ],
      },
      e: {
        text: 'Your consultant starts a scalpel–bougie–tube cricothyroidotomy. What is your job?',
        vitals: { HR: 64, BP: '104/66', SpO2: 62 },
        choices: [
          { text: 'Hand over the kit in order (scalpel with a size 10 blade, bougie, size 6.0 cuffed tube), extend his neck with a pillow under the shoulders, hold the head, connect the circuit, confirm the capnography trace and call out the SpO2.', next: 'okEnd', good: true, feedback: 'Supporting the person doing the procedure, and confirming the tube with capnography, are exactly your jobs.' },
          { text: 'Suggest a needle cricothyroidotomy and jet ventilation instead.', next: 'e', good: false, feedback: 'The scalpel–bougie–tube technique is quicker and more reliable in an emergency; needle techniques often fail. Support your consultant’s technique.' },
          { text: 'Stop all attempts at oxygen from above so they don’t get in the way.', next: 'e', good: false, feedback: 'Keep trying oxygen from above (face mask or supraglottic airway) while the neck is opened: any oxygen helps. Just keep the front of the neck clear.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'He wakes without harm. Two weeks later he has his operation after a planned awake intubation, with your notes in hand.',
        vitals: { HR: 86, BP: '140/84', SpO2: 98, RR: 14 },
      },
      okEnd: {
        end: true, outcome: 'ok',
        text: 'A square capnography trace appears and the SpO2 climbs to `95%`. He goes to the intensive care unit (ICU), has a formal tracheostomy the next day, and recovers. CICO was declared and the airway secured.',
        vitals: { HR: 98, BP: '128/78', SpO2: 95, EtCO2: 42 },
      },
      bad: {
        end: true, outcome: 'bad',
        text: 'His heart stops from lack of oxygen. Your consultant performs a front of neck airway during CPR and his circulation returns, but he has been without oxygen for too long and is ventilated in the intensive care unit (ICU) with a brain injury.',
        vitals: { HR: 0, SpO2: 40 },
      },
    },
    debrief: [
      'The Difficult Airway Society plan: A (laryngoscopy: at most 3 attempts, plus 1 by a more experienced person), B (a second-generation supraglottic airway), C (face mask, then wake up), D (front of neck access).',
      'After a failed intubation, stop and think. If you can oxygenate, the usual answer for elective surgery is to wake the patient up. Sugammadex `16 mg/kg` reverses rocuronium within about 3 minutes; in a big patient that is several vials, so start drawing it up early. It is a way to wake the patient, not a guaranteed airway rescue.',
      'Repeated attempts make swelling and bleeding worse and can turn “can oxygenate” into CICO.',
      'Can’t intubate, can’t oxygenate: say “CICO” out loud and move to scalpel–bougie–tube. Anyone in the team can say it.',
      'Your job as an MO: call for help, get the trolley, keep time, call out the SpO2, hand over kit. See the [failed intubation card](#/crisis/failed-intubation), the [CICO card](#/crisis/cico) and [When it’s difficult](#/learn/induction/difficult-airway).',
    ],
  },

  // ------------------------------------------------------------------ 14
  {
    id: 'brady-pneumoperitoneum',
    title: 'Bradycardia when the gas goes in',
    setting: 'Gynaecology list, 13:40',
    level: 'beyond',
    summary: 'Heart rate 35 as the surgeon insufflates: stop the stimulus, give atropine, then watch the CO2.',
    start: 'a',
    nodes: {
      a: {
        text: 'A fit 30-year-old woman, `58 kg`, for a diagnostic laparoscopy under GA with a tracheal tube. Your consultant has stepped out to the control room. As the surgeon starts insufflating CO2, the heart rate falls from `72` to `35`.',
        vitals: { HR: 35, BP: '78/40', SpO2: 99, EtCO2: 36 },
        choices: [
          { text: 'Tell the surgeon clearly: “Heart rate 35: please stop and let the gas out.” Ask the nurse to call your consultant.', next: 'b', good: true, feedback: 'Stretching the peritoneum triggers a vagal reflex. Removing the trigger is the fastest fix, and the surgeon can only stop if you tell them, loudly.' },
          { text: 'Give atropine first, without disturbing the surgeon.', next: 'b', good: 'ok', feedback: 'Atropine helps, but stopping the stretch (the trigger) is faster and more reliable. Tell the surgeon at the same time.' },
          { text: 'Wait: it usually settles by itself.', next: 'a2', good: false, feedback: 'It may settle, but it may also slow further to asystole. Act now.' },
        ],
      },
      a2: {
        text: 'The rate falls to `28`, then there is a 4-second pause.',
        vitals: { HR: 28, BP: '54/30', SpO2: 98, EtCO2: 28 },
        choices: [
          { text: 'Tell the surgeon to let the gas out now, give atropine `0.6 mg` IV, and call for help.', next: 'b', good: true, feedback: 'Stop the trigger, treat the heart rate, get help: all at once.' },
          { text: 'Keep watching.', next: 'asys', good: false, feedback: 'Pauses are a warning that asystole is close.' },
          { text: 'Ephedrine `5 mg` IV.', next: 'b', good: 'ok', feedback: 'Ephedrine raises the heart rate a little, but atropine blocks the vagal reflex faster and more directly, and the gas must come out. The surgeon notices and lets it out.' },
        ],
      },
      asys: {
        text: 'The ECG shows asystole.',
        vitals: { EtCO2: 10, SpO2: 96 },
        choices: [
          { text: 'Call a cardiac arrest, have the surgeon let the gas out, start chest compressions, and give adrenaline `1 mg` IV.', next: 'okEnd', good: true, feedback: 'Remove the trigger and start CPR. Vagal asystole often responds quickly once the gas is out. Your consultant or the arrest team may give atropine as well for a vagal cause, but compressions come first.' },
          { text: 'Give atropine only, without CPR.', next: 'asys', good: false, feedback: 'Asystole means no circulation: start chest compressions now and call the arrest.' },
          { text: 'Wait for your consultant before starting CPR.', next: 'asys', good: false, feedback: 'No one waits to start CPR. Call the arrest, start compressions and get the gas out now.' },
        ],
      },
      b: {
        text: 'The surgeon lets the gas out. Heart rate `48`, BP `86/48`.',
        vitals: { HR: 48, BP: '86/48', SpO2: 99, EtCO2: 34 },
        choices: [
          { text: 'Atropine `0.6 mg` IV (`1 mL` of `600 mcg/mL`).', next: 'c', good: true, feedback: 'Atropine blocks the vagal effect within a minute.' },
          { text: 'Glycopyrrolate `0.2–0.4 mg` IV.', next: 'c', good: 'ok', feedback: 'It works too, but more slowly than atropine. It suits slower, less urgent bradycardia.' },
          { text: 'Atropine `0.1 mg` IV.', next: 'b', good: false, feedback: 'Too small: in adults, very small doses (under about `0.3 mg`) can briefly slow the heart further. For a sudden vagal bradycardia give `0.6 mg` (one ampoule).' },
        ],
      },
      c: {
        text: 'Heart rate `84`, BP `112/66`. The surgeon wants to start again.',
        vitals: { HR: 84, BP: '112/66', SpO2: 99, EtCO2: 35 },
        choices: [
          { text: 'Agree, but ask for slow insufflation to a lower pressure (for example `12 mmHg`). Keep atropine ready, watch the ECG, and tell the surgeon at once if the rate drops.', next: 'd', good: true, feedback: 'Slow, low-pressure insufflation rarely triggers the reflex again, and you are ready if it does.' },
          { text: 'Ask the surgeon to convert to an open operation.', next: 'c', good: false, feedback: 'Not needed: this is a common reflex that rarely recurs with slow insufflation. If it kept happening, your consultant and the surgeon would decide.' },
          { text: 'Ask them to insufflate fast to get it over with.', next: 'c', good: false, feedback: 'Fast stretching is what triggered it. Slow and low is the way.' },
        ],
      },
      d: {
        text: 'Insufflation is complete at `12 mmHg`, with her tilted head-down for the pelvis. Twenty minutes later the EtCO2 has climbed to `52 mmHg` and the peak airway pressure is `30 cmH2O`.',
        vitals: { HR: 86, BP: '124/72', SpO2: 98, EtCO2: 52 },
        choices: [
          { text: 'Increase the breathing rate to clear the absorbed CO2, check the tube hasn’t slipped deeper with the head-down tilt (listen to both sides), feel for crackling under the skin (surgical emphysema), and tell your consultant.', next: 'good', good: true, feedback: 'CO2 is absorbed from the abdomen, so the minute ventilation needs to go up. The gas and the head-down tilt push the diaphragm and the lungs up towards the head while the tube stays fixed at the teeth, so its tip can end up in a bronchus, which raises the pressure too.' },
          { text: 'Ignore it: CO2 always rises in laparoscopy.', next: 'd', good: false, feedback: 'Some rise is expected, but you treat it, and you look for causes that need action.' },
          { text: 'Give sodium bicarbonate for the acid.', next: 'd', good: false, feedback: 'The acid comes from CO2, which leaves through the lungs. Breathe more for her instead.' },
        ],
      },
      good: {
        end: true, outcome: 'good',
        text: 'With a faster rate the EtCO2 settles at `42 mmHg`; air entry is equal and there is no surgical emphysema. The laparoscopy finishes and she wakes comfortably with your consultant.',
        vitals: { HR: 80, BP: '120/70', SpO2: 99, EtCO2: 42 },
      },
      okEnd: {
        end: true, outcome: 'ok',
        text: 'With the gas out and a few chest compressions her heart restarts within a minute. Your consultant takes over, the case continues later with slow insufflation, and she recovers fully, but it was a frightening minute that acting earlier could have prevented.',
        vitals: { HR: 96, BP: '118/68', SpO2: 98, EtCO2: 34 },
      },
    },
    debrief: [
      'Insufflation stretches the peritoneum and can trigger a strong vagal reflex: sudden bradycardia, even asystole.',
      'First tell the surgeon to stop and let the gas out. Then atropine `0.6 mg` IV (glycopyrrolate `0.2–0.4 mg` is slower), and call for help.',
      'Restart with slow insufflation at a low pressure, and watch the ECG.',
      'The pneumoperitoneum raises the EtCO2 and airway pressure; with head-down tilt the lungs move up and the tube can end up in a bronchus. A sudden collapse with a falling EtCO2 could be gas embolism: call for help at once.',
      'See the [bradycardia card](#/crisis/bradycardia) and [Laparoscopic abdominal surgery](#/learn/cases/laparoscopic).',
    ],
  },
];
