// Regional anaesthesia app: "If it goes wrong" decision guides (ENGINE.md §3.8).
// Rendered by ../decide.js: on every engine block (block.js, section "If it goes wrong") and all together on /blocks/safety/ (/blocks/#wrong redirects there).
// Clinical content approved by the owner (Dr Koh Wenjun, Oct 2026). UK practice; the LAST guide follows the Association
// of Anaesthetists LAST guidance and quick reference handbook, worded as on /spinal/#cx-last. No citations on the page.
//
// SAFETY: every guide is MO level (tier 1), like doses, the LAST line and complications. Never give a guide or a step a
// higher tier (shared/regional/test/data.mjs and levels.mjs check).
//
// Guide schema:
//   { id, title, short, tier: 1, when: 'html: when to open this guide', start: '<step id>',
//     steps: {
//       <id>: { ask: 'Question?', help?: 'html', yes: '<id>', no: '<id>' }           // a yes / no question
//       <id>: { ask: 'Question?', help?, choices: [{ label, to }] }                   // a question with other answers
//       <id>: { do: 'Action', html: 'html', tone: 'danger'|'warn'|'ok', next?: '<id>' } // an action; no `next` = the end
//     } }
// Every step must be reachable from `start`, every `to` / `yes` / `no` / `next` must exist, and there are no loops
// (validateGuide). Text is trusted HTML. British spelling, plain English; doses in ml/kg as on the spinal page.
// Lipid bolus "1.5 ml/kg over 2–3 minutes" (as on /spinal/#cx-last) confirmed by the owner on 16 Oct 2026.

const B = (s) => `<strong>${s}</strong>`;

export const GUIDES = Object.freeze({
  // ------------------------------------------------------------------ 1. LAST
  last: {
    id: 'last', tier: 1,
    title: 'Suspected local anaesthetic toxicity (LAST)',
    short: 'Local anaesthetic toxicity',
    when: 'During or after an injection: tingling around the mouth, a metallic taste, ringing in the ears, light-headedness, confusion, agitation, slurred speech, muscle twitching, a seizure or loss of consciousness; or a slow, fast or irregular heart, low blood pressure or cardiac arrest. The heart can be the first sign, and it can start up to about an hour after the block.',
    start: 'stop',
    steps: {
      stop: {
        do: 'Stop injecting and call for help', tone: 'danger',
        html: `<ul><li>${B('Stop injecting')} local anaesthetic now. Keep the intravenous cannula.</li><li>Call for help and ask for the ${B('lipid emulsion')} and the resuscitation trolley.</li><li>Say it out loud: “I think this is local anaesthetic toxicity”, so the whole team knows.</li></ul>`,
        next: 'abc',
      },
      abc: {
        do: 'Airway, 100% oxygen and monitoring', tone: 'danger',
        html: '<ul><li>Keep the airway open and give 100% oxygen. Intubate if needed.</li><li>Ventilate to normal or slightly low carbon dioxide: low oxygen, high carbon dioxide and acidosis make the toxicity worse.</li><li>Full monitoring: ECG, blood pressure every few minutes, oxygen saturation and capnography. Make sure the intravenous access works.</li></ul>',
        next: 'arrest',
      },
      arrest: {
        ask: 'Is the patient in cardiac arrest?',
        help: 'No pulse, or no signs of life.',
        yes: 'cpr', no: 'seizure',
      },
      cpr: {
        do: 'Start CPR, with smaller adrenaline doses', tone: 'danger',
        html: `<ul><li>Start CPR and follow the advanced life support algorithm. Give lipid emulsion straight away (next step): don’t wait for a cycle to finish.</li><li>${B('Adrenaline: smaller doses, 1 microgram/kg or less')} (about 70 micrograms for a 70 kg adult), not the usual 1 mg.</li><li>${B('Avoid')} vasopressin, calcium channel blockers, beta-blockers and local anaesthetics, including lidocaine, as antiarrhythmics. Amiodarone is the drug for ventricular arrhythmias.</li><li>Recovery can take more than an hour of CPR. Keep going, and ask early for cardiopulmonary bypass or ECMO where it is available.</li></ul>`,
        next: 'lipid',
      },
      seizure: {
        ask: 'Is the patient having a seizure?',
        yes: 'benzo', no: 'serious',
      },
      benzo: {
        do: 'Stop the seizure', tone: 'danger',
        html: '<ul><li>Give a benzodiazepine intravenously (for example midazolam) in small doses, repeated until the seizure stops.</li><li>Small doses of propofol or thiopental are alternatives, but they can drop the blood pressure further. Propofol is not a substitute for lipid emulsion.</li><li>Protect the airway and keep oxygenating. A seizure is a serious sign: go on to lipid emulsion.</li></ul>',
        next: 'lipid',
      },
      serious: {
        ask: 'Are there other serious signs?',
        help: 'Reduced consciousness, a change in heart rhythm or rate, low blood pressure, or signs that are getting worse.',
        yes: 'lipid', no: 'mild',
      },
      mild: {
        do: 'Mild symptoms only: stay and watch', tone: 'warn',
        html: '<ul><li>Tingling around the mouth, a metallic taste or light-headedness alone: keep the injection stopped, give oxygen and stay with the patient with full monitoring.</li><li>Keep the lipid emulsion in the room. If anything gets worse, tap “Start again” and give lipid.</li><li>Toxicity can peak late: keep monitoring until the symptoms have gone and for at least an hour after the injection.</li></ul>',
        next: 'after',
      },
      lipid: {
        do: 'Give 20% lipid emulsion (Intralipid)', tone: 'danger',
        html: `<ol><li>${B('Bolus: 1.5 ml/kg')} over 2–3 minutes (about 100 ml for a 70 kg adult).</li><li>${B('Then an infusion: 15 ml/kg/h')} (about 1000 ml an hour for a 70 kg adult).</li><li>${B('After 5 minutes, if the circulation is still unstable or getting worse:')} repeat the same bolus, at most twice more and 5 minutes apart (three boluses in all), and double the infusion to ${B('30 ml/kg/h')}.</li><li>${B('Do not give more than 12 ml/kg in total')} (about 840 ml for a 70 kg adult). In a very large patient, work from lean body weight.</li><li>Continue CPR throughout if the heart has stopped.</li></ol>`,
        next: 'stable',
      },
      stable: {
        ask: 'Has the circulation recovered and stayed stable?',
        yes: 'after', no: 'refractory',
      },
      refractory: {
        do: 'Not recovering: keep going', tone: 'danger',
        html: '<ul><li>Continue CPR and the lipid infusion; give the repeat boluses as above, within the 12 ml/kg total.</li><li>Look for other causes too (the reversible causes of the life support algorithm).</li><li>Prolonged CPR may be needed. Call for cardiopulmonary bypass or ECMO if it is available.</li></ul>',
        next: 'after',
      },
      after: {
        do: 'Afterwards', tone: 'ok',
        html: '<ul><li>Move the patient to a monitored area (high dependency or intensive care after a serious event). Watch for at least 2 hours after a seizure alone, and for 4–6 hours after any heart or blood pressure problem.</li><li>After lipid emulsion, check for pancreatitis (amylase or lipase) over the next two days.</li><li>Decide with the consultant whether surgery goes ahead. Don’t give more local anaesthetic.</li><li>Explain to the patient what happened. Record it and report it through the hospital’s incident system.</li></ul>',
      },
    },
  },

  // ------------------------------------------------------------------ 2. high or total block
  high: {
    id: 'high', tier: 1,
    title: 'High or total spinal block',
    short: 'High or total block',
    when: 'After a spinal or epidural, or a block close to the spine or brainstem (paravertebral, erector spinae, lumbar plexus, interscalene, deep cervical plexus, or brainstem spread after a retrobulbar or peribulbar block): numb or weak hands and arms, difficulty breathing or speaking, a weak voice, nausea, low blood pressure, a slow heart, drowsiness, stopping breathing or loss of consciousness.',
    start: 'stop',
    steps: {
      stop: {
        do: 'Stop injecting and call for help', tone: 'danger',
        html: '<ul><li>Stop injecting. Call for senior help.</li><li>Tell the team: “I think this is a high block”.</li></ul>',
        next: 'airway',
      },
      airway: {
        do: 'Airway and breathing', tone: 'danger',
        html: '<ul><li>Give 100% oxygen.</li><li>If breathing is not enough, the patient cannot speak, or consciousness falls: ventilate by bag and mask, then intubate and ventilate.</li><li>The patient may be awake but unable to breathe or move: give anaesthesia or sedation so they are not aware while paralysed, using reduced doses because the blood pressure may be low.</li></ul>',
        next: 'circ',
      },
      circ: {
        do: 'Circulation: treat early and firmly', tone: 'danger',
        html: '<ul><li>Raise the legs and give intravenous fluid.</li><li>Low blood pressure: a vasopressor such as phenylephrine or metaraminol. Slow heart: atropine or glycopyrronium. Severe or sudden collapse: adrenaline.</li><li>In late pregnancy, tilt to the left or push the uterus to the left.</li><li>Don’t tip the patient head-down after a heavy (hyperbaric) spinal: it can push the block higher.</li></ul>',
        next: 'arrest',
      },
      arrest: {
        ask: 'Is the patient in cardiac arrest?',
        yes: 'cpr', no: 'stable',
      },
      cpr: {
        do: 'Cardiac arrest', tone: 'danger',
        html: '<ul><li>Start CPR and follow the advanced life support algorithm, with early adrenaline.</li><li>If a large dose of local anaesthetic was given, think of toxicity too and give lipid emulsion (see the LAST guide).</li><li>In late pregnancy, the obstetric team should deliver the baby within 5 minutes of the arrest if there is no return of circulation.</li></ul>',
        next: 'after',
      },
      stable: {
        ask: 'With your support, is the patient now well oxygenated with an acceptable blood pressure?',
        yes: 'after', no: 'ongoing',
      },
      ongoing: {
        do: 'Not settling: keep supporting', tone: 'danger',
        html: '<ul><li>Keep ventilating and give vasopressors as needed; ask for an intensive care bed.</li><li>Think of other causes: local anaesthetic toxicity, anaphylaxis, bleeding, embolism.</li></ul>',
        next: 'after',
      },
      after: {
        do: 'Until the block wears off, and afterwards', tone: 'ok',
        html: '<ul><li>Keep the patient ventilated and sedated until the block recedes and they can breathe and protect their airway. This can take a couple of hours or more.</li><li>Monitor in high dependency or intensive care.</li><li>Talk to the patient afterwards: it can be frightening, and they may remember it. Record it and report it.</li></ul>',
      },
    },
  },

  // ------------------------------------------------------------------ 3. pneumothorax
  pneumo: {
    id: 'pneumo', tier: 1,
    title: 'Pneumothorax suspected after the block',
    short: 'Pneumothorax',
    when: 'After a supraclavicular, infraclavicular, paravertebral, intercostal, pectoral, serratus or other chest wall block: a new cough, chest pain on breathing, breathlessness, falling oxygen saturation or, rarely, low blood pressure. It can appear hours after the block, sometimes after the patient has gone home.',
    start: 'assess',
    steps: {
      assess: {
        do: 'Assess and give oxygen', tone: 'warn',
        html: '<ul><li>Sit the patient up, give oxygen and start full monitoring. Call for senior help.</li><li>Examine: reduced breath sounds and chest movement on the side of the block, a hyper-resonant chest, a shifted trachea.</li></ul>',
        next: 'tension',
      },
      tension: {
        ask: 'Are there signs of a tension pneumothorax?',
        help: 'Worsening low oxygen, falling blood pressure, raised neck veins, the trachea pushed away from the side of the block, or rising airway pressures if ventilated.',
        yes: 'decompress', no: 'confirm',
      },
      decompress: {
        do: 'Tension pneumothorax: decompress now', tone: 'danger',
        html: '<ul><li>Don’t wait for an X-ray.</li><li>Decompress the side of the block with a needle or an open (finger) thoracostomy: 4th or 5th intercostal space just in front of the mid-axillary line, or the 2nd intercostal space in the mid-clavicular line.</li><li>A chest drain follows. Call the surgical or emergency team, and the arrest team if the patient is collapsing.</li><li>Under positive-pressure ventilation a pneumothorax can grow fast.</li></ul>',
      },
      confirm: {
        ask: 'Do lung ultrasound or a chest X-ray confirm a pneumothorax?',
        help: 'Ultrasound: no lung sliding and no B-lines on the side of the block, and a lung point if you can find one.',
        yes: 'treat', no: 'other',
      },
      treat: {
        do: 'Treat a confirmed pneumothorax', tone: 'warn',
        html: '<ul><li>Small and the patient well: oxygen, observe and repeat the imaging; many settle without a drain.</li><li>Large, breathless, or the patient needs positive-pressure ventilation: a chest drain (surgical or respiratory team).</li><li>Avoid nitrous oxide.</li><li>Tell the surgeon and the consultant. Explain to the patient, record it and report it.</li></ul>',
      },
      other: {
        do: 'No pneumothorax seen: think of other causes', tone: 'warn',
        html: '<ul><li>Phrenic nerve palsy after a supraclavicular or interscalene block (see that guide), local anaesthetic toxicity, bronchospasm, aspiration, anaphylaxis, pulmonary embolism.</li><li>Keep oxygen and monitoring on, and scan again if anything changes: a pneumothorax can grow slowly.</li><li>A patient going home after a block near the pleura should know to come back with breathlessness or chest pain.</li></ul>',
      },
    },
  },

  // ------------------------------------------------------------------ 4. phrenic nerve palsy
  phrenic: {
    id: 'phrenic', tier: 1,
    title: 'Breathless after an interscalene or supraclavicular block (phrenic nerve palsy)',
    short: 'Phrenic nerve palsy',
    when: 'Breathlessness, a feeling of not getting a full breath, or falling oxygen saturation after an interscalene, superior trunk, supraclavicular or deep cervical plexus block. An interscalene block paralyses the diaphragm on that side in most patients.',
    start: 'sit',
    steps: {
      sit: {
        do: 'Sit up, oxygen, monitor', tone: 'warn',
        html: '<ul><li>Sit the patient upright, give oxygen, and check breathing rate, oxygen saturation and blood pressure.</li><li>Reassure: a diaphragm that doesn’t move on one side is usually well tolerated when the lungs are healthy.</li></ul>',
        next: 'distress',
      },
      distress: {
        ask: 'Is the patient in respiratory distress, or is the oxygen saturation low despite oxygen?',
        yes: 'support', no: 'other',
      },
      support: {
        do: 'Support breathing', tone: 'danger',
        html: '<ul><li>Call for senior help.</li><li>Support with CPAP or non-invasive ventilation; intubate and ventilate if needed. The block may last many hours.</li><li>Think of the other causes below: they change the treatment.</li></ul>',
        next: 'other',
      },
      other: {
        ask: 'Could it be something else?',
        help: 'One-sided chest pain with reduced breath sounds (pneumothorax); weakness spreading to the other arm or the legs, or low blood pressure (spread to the epidural or intrathecal space); or signs of local anaesthetic toxicity.',
        yes: 'others', no: 'confirm',
      },
      others: {
        do: 'Treat the other cause', tone: 'danger',
        html: '<ul><li>Pneumothorax: follow the pneumothorax guide.</li><li>Weakness of both arms or of the legs, low blood pressure, drowsiness: follow the high or total block guide.</li><li>Toxicity: follow the LAST guide.</li></ul>',
      },
      confirm: {
        do: 'Confirm it and watch', tone: 'ok',
        html: '<ul><li>Ultrasound of the diaphragm: reduced, absent or paradoxical movement on a sniff on the side of the block. A chest X-ray shows a raised hemidiaphragm.</li><li>Keep the patient sitting up, with oxygen as needed, in a monitored area until it improves. It eases as the block wears off, usually within a day.</li><li>Explain to the patient. If breathlessness lasts beyond the block, refer for follow-up: a lasting phrenic palsy is rare but recognised.</li></ul>',
        next: 'prevent',
      },
      prevent: {
        do: 'Next time', tone: 'ok',
        html: '<ul><li>For a patient who cannot afford to lose half the diaphragm (severe lung disease, severe obesity, a phrenic palsy on the other side), use a diaphragm-sparing plan: a lower volume, a block further from the phrenic nerve (superior trunk, infraclavicular, or suprascapular with axillary nerve blocks, depending on the operation), or no block.</li><li>Never do bilateral interscalene or supraclavicular blocks.</li></ul>',
      },
    },
  },

  // ------------------------------------------------------------------ 5. pain, paraesthesia or high pressure
  pain: {
    id: 'pain', tier: 1,
    title: 'Pain, an electric shock or high pressure on injection',
    short: 'Pain or high pressure on injection',
    when: 'The patient feels sharp pain, an electric shock or burning down the limb as you inject, or the plunger needs more force than usual.',
    start: 'stop',
    steps: {
      stop: {
        do: 'Stop injecting', tone: 'danger',
        html: `<ul><li>${B('Stop at once.')} Never push through pain or high pressure: injecting into a nerve can cause lasting nerve damage.</li><li>Don’t move the needle forward.</li></ul>`,
        next: 'see',
      },
      see: {
        ask: 'Can you see the needle tip clearly on ultrasound?',
        yes: 'intra', no: 'find',
      },
      find: {
        do: 'Find the tip before anything else', tone: 'warn',
        html: '<ul><li>Don’t inject. Keep the needle still and move the probe (slide, tilt, rotate) to bring the shaft and tip back into view.</li><li>If you still can’t see it, withdraw a little and re-advance in plane.</li></ul>',
        next: 'intra',
      },
      intra: {
        ask: 'Is the tip in or against the nerve?',
        help: 'The tip lies inside the nerve outline, or the nerve swells or moves as you inject.',
        yes: 'withdraw', no: 'pressure',
      },
      withdraw: {
        do: 'Withdraw and reposition', tone: 'warn',
        html: '<ul><li>Pull back 1–2 mm until the tip is clearly outside the nerve.</li><li>Check with a small test volume: it should spread around the nerve, not swell it.</li></ul>',
        next: 'pressure',
      },
      pressure: {
        ask: 'Is the injection pressure still high?',
        help: 'The plunger is hard to push.',
        yes: 'highp', no: 'test',
      },
      highp: {
        do: 'Never inject against high pressure', tone: 'warn',
        html: '<ul><li>High resistance can mean the tip is in a nerve, a tendon, fascia or a tight space, or that the line is kinked or a tap is closed.</li><li>Withdraw slightly, look at the tip, and check the line.</li><li>If you have an in-line pressure monitor, keep the opening pressure below 15 psi.</li><li>Inject again only when it flows easily.</li></ul>',
        next: 'test',
      },
      test: {
        ask: 'With a small test volume now, is injection painless and easy, and does it spread around the target rather than into the nerve?',
        yes: 'go', no: 'abandon',
      },
      go: {
        do: 'Carry on slowly', tone: 'ok',
        html: '<ul><li>Inject in small increments, aspirating between them, watching the spread and talking to the patient.</li><li>Stop again if pain or high pressure comes back.</li><li>Write down what happened, and ask about numbness and weakness at follow-up.</li></ul>',
      },
      abandon: {
        do: 'Abandon this injection', tone: 'danger',
        html: '<ul><li>If pain or high pressure persists, stop. Consider another approach, another block or general anaesthesia.</li><li>Record what happened and tell the consultant.</li><li>Check the nerve when the block has worn off. If numbness or weakness lasts, follow the guide on numbness or weakness that won’t go away.</li></ul>',
      },
    },
  },

  // ------------------------------------------------------------------ 6. vascular puncture
  vessel: {
    id: 'vessel', tier: 1,
    title: 'Blood in the needle (vascular puncture)',
    short: 'Vascular puncture',
    when: 'Blood on aspiration or in the tubing, a vessel that fills as you inject, no visible spread of local anaesthetic on ultrasound, or a swelling growing at the site.',
    start: 'stop',
    steps: {
      stop: {
        do: 'Stop and don’t inject', tone: 'danger',
        html: '<ul><li>Stop injecting. Never inject through a needle that has aspirated blood.</li></ul>',
        next: 'toxic',
      },
      toxic: {
        ask: 'Are there any signs of local anaesthetic toxicity?',
        help: 'Tingling around the mouth, a metallic taste, confusion, a seizure, an arrhythmia or low blood pressure.',
        yes: 'last', no: 'artery',
      },
      last: {
        do: 'Treat it as local anaesthetic toxicity', tone: 'danger',
        html: '<ul><li>Follow the LAST guide now: stop, call for help, airway and 100% oxygen, lipid emulsion.</li></ul>',
      },
      artery: {
        ask: 'Was it an artery?',
        help: 'Bright red or pulsatile blood, or the tip seen in a pulsatile vessel.',
        yes: 'art', no: 'vein',
      },
      art: {
        do: 'Arterial puncture: withdraw and press', tone: 'warn',
        html: '<ul><li>Withdraw the needle and press firmly over the artery for at least 5 minutes, longer if the patient takes anticoagulant or antiplatelet drugs.</li><li>Some sites can’t be compressed (deep blocks, under the clavicle, paravertebral, lumbar plexus): watch closely for a growing haematoma.</li></ul>',
        next: 'haem',
      },
      vein: {
        do: 'Venous puncture: withdraw and reposition', tone: 'warn',
        html: '<ul><li>Withdraw a little and press where you can.</li><li>Re-scan before the next pass.</li></ul>',
        next: 'haem',
      },
      haem: {
        ask: 'Is there a growing swelling, or a pale, cold or pulseless limb beyond it?',
        help: 'For eye blocks: a tense, pushed-forward eye or a tight eyelid (retrobulbar haemorrhage). Near the neck: any change in voice or breathing.',
        yes: 'urgent', no: 'retry',
      },
      urgent: {
        do: 'Expanding haematoma or poor blood supply', tone: 'danger',
        html: '<ul><li>Keep pressure on (except on the eye) and call senior help and the surgeon now.</li><li>Check clotting and any anticoagulant or antiplatelet drugs.</li><li>Neck: watch the airway closely; a haematoma can obstruct it.</li><li>Eye: call the ophthalmologist urgently; a retrobulbar haemorrhage can threaten sight and may need a lateral canthotomy.</li><li>Limb: a poor blood supply needs the vascular team.</li></ul>',
      },
      retry: {
        do: 'Reposition and carry on with care', tone: 'ok',
        html: '<ul><li>Scan again with colour Doppler to find the vessels, and choose a path that avoids them.</li><li>Aspirate before each injection and inject in small increments, watching the spread. No visible spread on ultrasound may mean the tip is in a vessel: stop.</li><li>Keep the total dose within the maximum for the patient’s weight, and watch the patient closely for 30 minutes after the block: toxicity can be delayed.</li></ul>',
      },
    },
  },

  // ------------------------------------------------------------------ 7. block not working
  failed: {
    id: 'failed', tier: 1,
    title: 'The block is not working',
    short: 'Block not working',
    when: 'The patient still feels the operative area when surgery is due, or pain breaks through soon after the block.',
    start: 'time',
    steps: {
      time: {
        ask: 'Has the block had enough time?',
        help: 'Most blocks need 15–30 minutes; long-acting drugs and large nerves such as the sciatic can take longer.',
        yes: 'tested', no: 'wait',
      },
      wait: {
        do: 'Wait, then test again', tone: 'ok',
        html: '<ul><li>Keep monitoring and test again in 5–10 minutes.</li><li>Use the time to explain to the patient and the surgeon.</li></ul>',
        next: 'tested',
      },
      tested: {
        ask: 'Have you tested the right area properly?',
        help: 'Cold, then pinprick, in each nerve’s territory, compared with the other side, and power too.',
        yes: 'partial', no: 'test',
      },
      test: {
        do: 'Test it properly', tone: 'ok',
        html: '<ul><li>Test every nerve the operation needs with cold (ice or a cold spray) and pinprick, against the other side, and test power.</li><li>Map exactly which area is missed.</li><li>Some areas are not covered by a block by design: see its Coverage section. A tourniquet, bone or deep structures may need more than a skin block.</li></ul>',
        next: 'partial',
      },
      partial: {
        ask: 'Is the block partly working, with one nerve or area missed?',
        yes: 'rescue', no: 'complete',
      },
      rescue: {
        do: 'Rescue a patchy block', tone: 'warn',
        html: `<ul><li>Block the missed nerve further along its course, or ask the surgeon to infiltrate the wound.</li><li>${B('Any top-up must keep the total of every local anaesthetic within the maximum for the patient’s weight.')} Add up what has been given already, including the surgeon’s.</li><li>Add systemic pain relief, or light sedation if it is safe.</li></ul>`,
        next: 'ready',
      },
      complete: {
        do: 'Complete failure', tone: 'warn',
        html: `<ul><li>Don’t repeat the full block without counting the dose already given: ${B('the total dose is the limit')}, and a second full dose risks toxicity.</li><li>Options: another block within the dose limit, a spinal where appropriate, or general anaesthesia.</li></ul>`,
        next: 'ready',
      },
      ready: {
        ask: 'Is the patient comfortable and happy to go ahead with the plan?',
        yes: 'explain', no: 'ga',
      },
      ga: {
        do: 'Convert to general anaesthesia', tone: 'warn',
        html: '<ul><li>Don’t operate on a patient in pain. Explain, and give a general anaesthetic (or a spinal if appropriate).</li><li>The block may still start working later: plan pain relief for afterwards.</li></ul>',
        next: 'explain',
      },
      explain: {
        do: 'Explain and record', tone: 'ok',
        html: '<ul><li>Tell the patient honestly what happened and what you did.</li><li>Record the block, the drug, the dose, the timing, and the rescue.</li><li>Review it with a senior: was the spread seen, at the right level, around the right structure?</li></ul>',
      },
    },
  },

  // ------------------------------------------------------------------ 8. persistent numbness or weakness
  nerve: {
    id: 'nerve', tier: 1,
    title: 'Numbness or weakness that won’t go away (possible nerve injury)',
    short: 'Persistent numbness or weakness',
    when: 'Numbness, tingling, pain or weakness that lasts longer than the block should (for most single-shot long-acting blocks, more than 24–48 hours), or new symptoms after the block had worn off.',
    start: 'exam',
    steps: {
      exam: {
        do: 'Take it seriously and examine', tone: 'ok',
        html: '<ul><li>Ask which area is affected, whether it is numbness, pain or weakness, and whether it is getting better or worse.</li><li>Examine both sides: sensation, power and reflexes in each nerve’s territory. Record it, with a sketch of the area.</li></ul>',
        next: 'urgent',
      },
      urgent: {
        ask: 'Is it severe or getting worse, or is there new weakness?',
        help: 'Especially weakness of both legs, back pain, or bladder or bowel symptoms after a spinal, epidural, paravertebral or lumbar plexus block; or a tense, very painful limb.',
        yes: 'now', no: 'improving',
      },
      now: {
        do: 'Urgent: look for a treatable cause now', tone: 'danger',
        html: '<ul><li>Call the consultant anaesthetist now, and involve the surgical team.</li><li>Rule out compression quickly: a haematoma, compartment syndrome, or a tight cast or dressing (loosen it).</li><li>After a neuraxial or deep block: an epidural haematoma or abscess needs an urgent MRI scan and a neurosurgical opinion. Time matters.</li></ul>',
        next: 'record',
      },
      improving: {
        ask: 'Is it sensory only (numbness or tingling, no weakness) and already getting better?',
        yes: 'reassure', no: 'refer',
      },
      reassure: {
        do: 'Reassure and follow up', tone: 'ok',
        html: '<ul><li>Most symptoms after a nerve block are temporary and get better over days to weeks. Explain this to the patient.</li><li>Protect the numb area from burns and pressure.</li><li>Arrange follow-up by the anaesthetic team (a call or a clinic). If it has not clearly improved within a few weeks, refer as for weakness.</li></ul>',
        next: 'record',
      },
      refer: {
        do: 'Refer for a neurological opinion', tone: 'warn',
        html: '<ul><li>Weakness, or symptoms that are not improving: refer to neurology and tell the consultant anaesthetist.</li><li>Nerve conduction studies and electromyography show where the injury is and how bad it is. They are most informative about 2–3 weeks after the injury; an early study can show a nerve problem that was already there.</li><li>Consider other causes: the surgery, the tourniquet, positioning, a cast, or a pre-existing neuropathy such as diabetes.</li></ul>',
        next: 'record',
      },
      record: {
        do: 'Record, explain and keep following up', tone: 'ok',
        html: '<ul><li>Record the block (needle, ultrasound images if saved, any pain or high pressure on injection), the examination and the plan.</li><li>Be open with the patient about what may have happened.</li><li>Report it through the incident system, and keep following the patient up until it settles.</li></ul>',
      },
    },
  },
});

/** The order guides appear in: most dangerous first. */
export const GUIDE_ORDER = Object.freeze(['last', 'high', 'pneumo', 'phrenic', 'pain', 'vessel', 'failed', 'nerve']);

/** Guides every block shows. */
export const CORE_GUIDES = Object.freeze(['last', 'pain', 'vessel', 'failed', 'nerve']);

/**
 * Extra guides by block id (registry ids, which are also the engine block ids). Region 'neuraxial' always gets 'high'.
 *   pneumo: blocks near the pleura. phrenic: blocks that often reach the phrenic nerve.
 *   high: blocks that can spread to the epidural or intrathecal space or the brainstem.
 */
export const EXTRA_GUIDES = Object.freeze({
  pneumo: ['supraclavicular', 'infraclavicular', 'costoclavicular', 'raptir', 'pvb', 'pvbt', 'pvblm', 'mtp', 'esp', 'sap', 'pecs', 'parasternal', 'intercostal'],
  phrenic: ['interscalene', 'superior-trunk', 'supraclavicular', 'dcp'],
  high: ['spinal', 'pvb', 'pvbt', 'pvblm', 'mtp', 'esp', 'lumbar-plexus', 'interscalene', 'dcp', 'peri'],
});

/** The guide ids for a block, in GUIDE_ORDER. `region` is the registry region (optional); `extra` adds ids. */
export function guidesFor(blockId, region = null, extra = []) {
  const ids = new Set([...CORE_GUIDES, ...extra]);
  for (const [g, blocks] of Object.entries(EXTRA_GUIDES)) if (blocks.includes(blockId)) ids.add(g);
  if (region === 'neuraxial') ids.add('high');
  return GUIDE_ORDER.filter((g) => ids.has(g));
}

/** Problems with a guide's structure (empty when sound): missing targets, unreachable steps, loops, tiers above 1. */
export function validateGuide(g) {
  const out = [];
  const steps = g?.steps || {};
  const ids = Object.keys(steps);
  if (!g?.id || !g.title || !g.when) out.push(`${g?.id || '?'}: needs id, title and when`);
  if (g?.tier != null && Number(g.tier) !== 1) out.push(`${g.id}: tier ${g.tier} (guides are always tier 1)`);
  if (!steps[g?.start]) out.push(`${g?.id}: start "${g?.start}" is not a step`);
  const nextOf = (s) => (s.ask ? (s.choices ? s.choices.map((c) => c.to) : [s.yes, s.no]) : (s.next ? [s.next] : []));
  for (const [id, s] of Object.entries(steps)) {
    if (s.tier != null && Number(s.tier) !== 1) out.push(`${g.id}/${id}: tier ${s.tier}`);
    if (!s.ask && !s.do) out.push(`${g.id}/${id}: neither ask nor do`);
    if (s.ask && !s.choices && (!s.yes || !s.no)) out.push(`${g.id}/${id}: a yes/no question needs yes and no`);
    if (s.do && !s.html) out.push(`${g.id}/${id}: an action needs html`);
    for (const t of nextOf(s)) if (!steps[t]) out.push(`${g.id}/${id}: goes to missing step "${t}"`);
  }
  // reachability and loops (depth-first)
  const seen = new Set();
  const onPath = new Set();
  const visit = (id) => {
    if (onPath.has(id)) { out.push(`${g.id}: loop through "${id}"`); return; }
    if (seen.has(id) || !steps[id]) return;
    seen.add(id); onPath.add(id);
    nextOf(steps[id]).forEach(visit);
    onPath.delete(id);
  };
  if (steps[g?.start]) visit(g.start);
  for (const id of ids) if (!seen.has(id)) out.push(`${g.id}: step "${id}" cannot be reached`);
  if (!ids.some((id) => steps[id].do && !steps[id].next)) out.push(`${g.id}: no end step`);
  return out;
}
