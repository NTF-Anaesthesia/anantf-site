// Emergencies and on call: the emergency list, on call, the sick emergency patient and transfers. Format: ../../../CONTENT.md.
// Local rules from the MO handbook (4th edition, 2026), pages 9–11 and 30.
export default {
  id: 'emergencies',
  title: 'Emergencies and on call',
  group: 'oncall',
  summary: 'The emergency list, on call, the sick emergency patient and moving sick patients safely.',
  topics: [
    // ------------------------------------------------------------------ eot
    {
      id: 'eot',
      title: 'The emergency list',
      level: 'core',
      summary: 'Emergency OT from the morning check to sending for the next case: the e-board, pre-clerking and flagging problems early.',
      blocks: [
        { t: 'key', items: [
          'Before the `8.30 am` handover at operating theatre (OT) reception: check the anaesthetic machine and prepare the emergency drugs.',
          'At handover the post-call team runs through the cases. Find out what is on the e-board (the electronic emergency list) and what your tasks are.',
          'Check the e-board through the day and pre-clerk every newly listed case: see the patient, and check fasting, airway, results, blood products and consent.',
          'If anything is amiss, tell your OT consultant and the OT coordinator (OTC) early, not when the patient is on the table.',
          'Send for the next case in good time, once your consultant agrees, so the theatre is not left waiting.',
          'You never start, reorder or cancel a case on your own.',
        ] },
        { t: 'p', text: 'Emergency patients are often sicker, less prepared and less fasted than elective ones, and the list changes all day. Your main job in the emergency operating theatre (EOT) is to know every case on the e-board before it is called.' },

        { t: 'h', text: 'Before handover' },
        { t: 'callout', kind: 'local', text: 'In EOT you check the machine and prepare the emergency drugs before you report to reception for the `8.30 am` handover: the first patient may be sick, and cases arrive at short notice. This is different from elective lists, where the emergency drug (E-drug) vials are set out but not drawn up unless your consultant asks.' },
        { t: 'check', id: 'emergencies-eot-check', title: 'EOT ready by 8.30 am', items: [
          'Anaesthetic machine checked, including the backup oxygen cylinder and a self-inflating bag',
          'Suction on and working, with a rigid sucker',
          'Emergency drugs prepared and labelled (phenylephrine, ephedrine, atropine, ± adrenaline); asked your consultant which induction drugs they want',
          'Airway kit for a rapid sequence induction (RSI): laryngoscopes checked, tubes in two sizes, bougie, supraglottic airway (SGA), and the video laryngoscope in reach',
          'Fluid warmer (Hotline) and forced-air warmer (Bair Hugger) in the room',
          'Epic open on the e-board',
          'You know where the difficult airway trolley is',
        ] },

        { t: 'h', text: 'Handover and the e-board' },
        { t: 'p', text: 'At handover, the post-call team goes through each case: what it is, how urgent, where the patient is, whether they have been pre-clerked, and what is still outstanding: results, blood, consent, or a bed in the high dependency unit (HD) or intensive care unit (ICU). Write it down, then ask your consultant which cases to pre-clerk.' },
        { t: 'p', text: 'The order of the list is set by the surgeons, your consultant and the OTC, by urgency: a bleeding patient or an ischaemic limb goes before a stable abscess. New cases appear all day, so look at the e-board often, and always when a case finishes.' },

        { t: 'h', text: 'Pre-clerking an emergency case' },
        { t: 'p', text: 'Pre-clerking means seeing the patient before they are sent for, so that problems surface on the ward rather than in theatre. On top of the usual pre-op assessment, find out:' },
        { t: 'list', items: [
          '**The operation and its urgency.**',
          '**Fasting:** the last food and drink, vomiting, a nasogastric tube. Most emergency patients are treated as having a full stomach.',
          '**How sick they are:** heart rate, blood pressure (BP), breathing rate, temperature, urine output, lactate. See [the sick emergency patient](#/learn/emergencies/sick-patient).',
          '**Airway:** the full assessment.',
          '**Results:** full blood count, renal panel (potassium, creatinine), clotting if bleeding or on blood thinners, glucose; a pregnancy test in women who could be pregnant.',
          '**Blood products:** a valid group and screen; crossmatched units if major bleeding is likely.',
          '**Blood thinners:** which, and the last dose.',
          '**Consent and marking:** surgical consent signed, the site marked, anaesthetic risks explained.',
          '**After surgery:** whether they may need an HD or ICU bed.',
        ] },
        { t: 'callout', kind: 'local', text: 'Write the pre-clerk in Epic with the **ANAPRECLERK** smartphrase, so the next person (your consultant, the call team, the day team) can read it.' },
        { t: 'callout', kind: 'stop', title: 'Tell your consultant and the OTC now', items: [
          'A patient who looks sick, or is getting worse on the ward.',
          'Potassium above `5.5` or below `3.0 mmol/L`, haemoglobin below `10 g/dL` or falling, international normalised ratio (INR) above `1.5`, platelets below `100 × 10⁹/L`.',
          'A predicted difficult airway.',
          'No valid group and screen when bleeding is possible.',
          'Missing consent, or a patient who says they do not want the operation.',
          'Recent blood thinners, or a patient who may need HD or ICU.',
        ] },
        { t: 'script', title: 'Presenting a pre-clerked case to your consultant', lines: [
          '"Mr T is 72, listed for an emergency laparotomy for a perforated bowel. He is the most urgent case on the board."',
          '"Background: diabetes on insulin, and atrial fibrillation on apixaban, last dose last night. He last ate yesterday evening, has been vomiting and has a nasogastric tube. Airway unremarkable."',
          '"Heart rate 115, BP 95/60, lactate 4. Potassium 3.2, creatinine 180, haemoglobin 11. Group and screen done, two units crossmatched."',
          '"I think he is septic. He has had a litre of fluid and his antibiotics. No ICU bed is booked yet. Could you see him with me?"',
        ] },

        { t: 'h', text: 'Sending for the next case' },
        { t: 'p', text: 'Send for the next patient in good time, so the theatre is not empty while they travel: as the current case nears its end, check with your consultant, then send. First make sure the patient is pre-clerked, consented and marked, and that blood is ready if needed. If anything is amiss, tell your consultant and the OTC before sending, not after.' },
        { t: 'scenario', id: 'rsi-appendix' },

        { t: 'quiz', id: 'emergencies-eot-q', items: [
          {
            q: 'It is `8.10 am` on your first EOT day. What must be done before the `8.30 am` handover?',
            options: ['Nothing: wait at reception for the post-call team', 'Check the anaesthetic machine and prepare the emergency drugs', 'Send for the first patient on the e-board', 'Draw up induction drugs for every case on the e-board'],
            answer: 1,
            explain: 'The handbook asks the EOT MO to check the machine and prepare the emergency drugs before reporting for handover. Patients are sent for after handover and only once your consultant agrees. Drawing up for every case wastes drugs and invites errors.',
          },
          {
            q: 'At `11 am` a new case appears on the e-board: a 24-year-old woman for a laparoscopic appendicectomy. Your current case has two hours to go. What do you do?',
            options: ['Wait until the case is called, then see her in reception', 'Pre-clerk her as soon as your consultant can spare you, and tell them about any problems', 'Send for her now so she is waiting in reception', 'Ask the surgeon to postpone her to tomorrow'],
            answer: 1,
            explain: 'Pre-clerking early lets problems (a full stomach, a missing pregnancy test, abnormal results) surface while there is time to fix them. Seeing her in reception wastes theatre time; sending for her two hours early leaves her waiting. Leave the theatre only when your consultant agrees.',
          },
          {
            q: 'While pre-clerking a man for a below-knee amputation, you find a potassium of `6.4 mmol/L`. What do you do?',
            options: ['Nothing yet: the anaesthetist will see it on the day', 'Give insulin and dextrose yourself on the ward', 'Tell your consultant and the OTC now', 'Cancel the case'],
            answer: 2,
            explain: 'A high potassium is dangerous under anaesthesia: it causes arrhythmias, and suxamethonium raises it further. Flag it now, and make sure the primary team knows: a repeat sample (haemolysis can raise it falsely) and an ECG are the usual first steps. Your consultant decides, with the surgeons, whether to treat first or delay. ECG changes make it an emergency to treat at once ([high potassium card](#/crisis/hyperkalaemia)). Never cancel a case on your own.',
          },
        ] },
        { t: 'links', items: [
          { text: 'On call', href: '#/learn/emergencies/on-call' },
          { text: 'The sick emergency patient', href: '#/learn/emergencies/sick-patient' },
          { text: 'The anaesthetic machine and its check', href: '#/learn/setup/machine' },
          { text: 'Fasting', href: '#/learn/preop/fasting' },
          { text: 'Rapid sequence induction', href: '#/learn/induction/rsi' },
          { text: 'Which tests and which results matter', href: '#/learn/preop/investigations' },
          { text: 'How to call for help and speak up', href: '#/learn/start/calling-for-help' },
          { text: 'Crisis card: hyperkalaemia', href: '#/crisis/hyperkalaemia' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ on-call
    {
      id: 'on-call',
      title: 'On call',
      level: 'core',
      summary: 'Working with the on-call specialist, keeping the e-board pre-clerked, blue letters, and a safe handover in the morning.',
      blocks: [
        { t: 'key', items: [
          'Report to the on-call specialist at `5 pm` on weekdays (`8.30 am` at weekends). From then on, they are the person you call.',
          'Run the emergency list with the team: pre-clerk e-board cases and tell the specialist about potential problems early.',
          'Before you go post call (off duty after the night), make sure the remaining e-board cases are pre-clerked. The call ends at `8.30 am`, after handover.',
          'Look after each other: relieve your fellow MO for breaks, and eat and drink when you can.',
          'The rules do not change at night: if you are unsure, call. A specialist would much rather be woken than find out in the morning.',
        ] },
        { t: 'p', text: 'In your first month you do no calls on your own. You join the on-call team for tag calls, to learn how the evening and night run and where things are after hours. You start calls once you have passed the [Baby MO test](../../babymo/).' },

        { t: 'h', text: 'How a call runs' },
        { t: 'steps', items: [
          { title: 'Before 5 pm.', text: 'On weekdays you work wherever you are needed in the morning. Rest and eat in any quiet time in the afternoon: it is not guaranteed.' },
          { title: '5 pm: report to the on-call specialist.', text: 'Find out what is on the e-board, what is happening in theatre and what they want you to do first.' },
          { title: '5.30 pm: PACU handover.', text: 'The post-anaesthesia care unit (PACU) MO hands over the patients still there to the on-call team. Whoever takes that handover is responsible for those patients until they leave.' },
          { title: 'Evening and night.', text: 'Emergency cases in theatre with the specialist; pre-clerk new e-board cases as they are listed; flag problems early; see the referrals the team asks you to see.' },
          { title: 'Before you go post call.', text: 'Pre-clerk every case still on the e-board, so the day team starts with a known list.' },
          { title: '8.30 am: hand over.', text: 'Go through the e-board with the incoming emergency theatre team, case by case. The call ends after handover, not before.' },
        ] },
        { t: 'p', text: 'At weekends the call runs from `8.30 am` to `8.30 am` the next day.' },
        { t: 'callout', kind: 'stop', title: 'Call the specialist, whatever the hour', items: [
          'Before a patient is sent for, and before any anaesthetic or procedure.',
          'A sick or deteriorating patient on the e-board or in PACU.',
          'A PACU problem you cannot settle quickly, or a patient who may need a high dependency (HD) or intensive care (ICU) bed.',
          'Anything you are unsure about.',
        ] },
        { t: 'script', title: 'Calling the specialist at night', lines: [
          '"Hello, it\'s the on-call MO. Sorry to wake you. I\'m calling about a new case on the e-board."',
          '"Mrs L, 81, listed for a laparotomy for bowel obstruction, urgent. She is vomiting and has a nasogastric tube."',
          '"Heart rate 110, blood pressure 100/60, potassium 3.0, creatinine raised. She has a valid group and screen."',
          '"I\'m worried she is dry and will need a rapid sequence induction. The surgeons would like to start at 2 am."',
          '"Would you like to come in now, or shall I do anything first?"',
        ] },

        { t: 'h', text: 'The 1–9 duty and Sunday half call' },
        { t: 'dl', items: [
          { term: '1–9 duty', def: 'Report to the OT coordinator (OTC: the consultant running the operating theatres that day) at `1 pm`. Relieve theatres for breaks and see blue letters (below). From `4 pm` you work with the on-call specialist and team: you may take over PACU or help in the emergency theatre, until `9 pm` unless released earlier.' },
          { term: 'Sunday half call and premeds', def: "From `10 am` to `7 pm`. Report to the specialist and say how many inpatient premeds (pre-op visits for Monday's lists) you have. See them, and help in the emergency theatre and with breaks. Elective MOs flag problems with Monday's patients to you: pass them on to Monday's consultants." },
        ] },

        { t: 'h', text: 'Answering a blue letter' },
        { t: 'p', text: 'A blue letter is an inpatient referral (a consult) to the anaesthesia team, for example a pre-op review or pain advice.' },
        { t: 'steps', items: [
          { title: 'Read the question.', text: 'Who is asking, about which patient, and what do they want from anaesthesia?' },
          { title: 'See the patient.', text: 'Read the notes, take a focused history, examine, and look at the results and the drug chart.' },
          { title: 'Discuss with your senior.', text: 'Agree the plan with the OTC or the on-call specialist before you give advice that changes treatment.' },
          { title: 'Write it up in Epic.', text: 'What you found, the plan, and who you discussed it with.' },
          { title: 'Close the loop.', text: 'Tell the referring team the plan, and hand over anything outstanding.' },
        ] },

        { t: 'h', text: 'The morning handover' },
        { t: 'p', text: 'Go through the e-board case by case. For each one, say:' },
        { t: 'list', items: [
          '**Who and where:** the patient, the ward, the operation and its urgency.',
          '**Status:** pre-clerked or not; consent, fasting, results and blood products.',
          '**Problems:** anything flagged to the specialist, and what they decided.',
          '**Outstanding:** results, an HD or ICU bed, a decision still to be made.',
        ] },
        { t: 'callout', kind: 'tip', text: 'Fatigue makes everyone slower and less safe. Eat, drink and take short breaks when the list allows, and relieve your co-MO in turn. If you are too tired to be safe, tell the specialist. After a night on call, nap before you drive home, or take a taxi.' },

        { t: 'quiz', id: 'emergencies-oncall-q', items: [
          {
            q: 'It is `3 am` and theatre is quiet. A new case appears on the e-board: an 85-year-old woman for hip fracture fixation, listed for the morning. What do you do?',
            options: ['Leave her for the day team', 'Pre-clerk her before you go post call, and tell the specialist about any problems', 'Send for her now so she is first in the morning', 'Book an ICU bed for her'],
            answer: 1,
            explain: 'Remaining e-board cases should be pre-clerked before you go post call, so the day team starts with a known list. Problems (blood thinners, a low haemoglobin, a new murmur) go to the specialist. Sending for patients and booking beds are your seniors\' decisions.',
          },
          {
            q: 'At `5.30 pm` the PACU MO wants to hand over two patients still in PACU. Who takes them?',
            options: ['Nobody: the PACU nurses manage them', 'The on-call team: whoever takes the handover is responsible until the patients leave', 'The primary anaesthetists, who must come back', 'The surgeons'],
            answer: 1,
            explain: 'At `5.30 pm` the PACU MO hands the remaining patients to the on-call team. Whoever takes the handover looks after those patients, including their discharge, until they leave PACU.',
          },
          {
            q: 'At `1 am` a patient you pre-clerked earlier is more breathless on the ward. You are not sure it matters. What do you do?',
            options: ['Mention it at the morning handover', 'Call the specialist now and say what you found', 'Ask the ward to repeat the observations in four hours', 'Change the plan to a spinal anaesthetic'],
            answer: 1,
            explain: 'A deteriorating patient is always worth a call, whatever the hour. Say what you found and what worries you; the specialist decides what happens next. Waiting, or changing the plan yourself, is not safe.',
          },
        ] },
        { t: 'links', items: [
          { text: 'The emergency list', href: '#/learn/emergencies/eot' },
          { text: 'What each duty involves', href: '#/learn/start/duties' },
          { text: 'How to call for help and speak up', href: '#/learn/start/calling-for-help' },
          { text: 'Your job in PACU', href: '#/learn/pacu/pacu-job' },
          { text: 'Looking after yourself', href: '#/learn/good/wellbeing' },
          { text: 'Baby MO test', href: '../../babymo/' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ sick-patient
    {
      id: 'sick-patient',
      title: 'The sick emergency patient',
      level: 'core',
      summary: 'Full stomach, sepsis, bleeding and shock: what to look for, what to prepare, and why induction is the dangerous moment.',
      blocks: [
        { t: 'key', items: [
          'Assume a full stomach: most emergency patients need a rapid sequence induction (RSI), planned with your consultant.',
          'Resuscitate before induction where you can: fluid or blood, antibiotics for sepsis, potassium corrected. Sometimes surgery is the resuscitation, and your consultant decides when to start.',
          'Induction is the dangerous moment in shock: smaller doses, ketamine or etomidate, a vasopressor drawn up and ready, often an arterial line first.',
          'Major bleeding: call for help early; your consultant activates the massive transfusion protocol (MTP). Give blood and plasma rather than crystalloid, warm everything, and think of tranexamic acid and calcium.',
          'High dependency (HD) and intensive care (ICU) beds are decided and booked through your senior: raise it early.',
          'Never induce a sick patient without your consultant in the room.',
        ] },

        { t: 'h', text: 'Spot the sick patient' },
        { t: 'p', text: 'Look past the diagnosis to the physiology. Young patients hide shock until they suddenly cannot; beta-blockers hide a fast heart rate; a usually hypertensive patient may be in shock with a "normal" blood pressure (BP).' },
        { t: 'table', caption: 'Signs that a patient is sick', head: ['Look at', 'Worry if'], rowHead: true, rows: [
          ['Heart rate', 'Above `100`, or higher than the systolic BP'],
          ['Blood pressure', 'Systolic below `90 mmHg`, mean below `65 mmHg`, or well below their usual'],
          ['Breathing', 'Rate above `22`, or oxygen saturation (SpO2) falling'],
          ['Perfusion', 'Cold, mottled skin; capillary refill over `3 s`; urine below `0.5 mL/kg/h`'],
          ['Brain', 'New confusion or drowsiness'],
          ['Blood gas', 'Lactate above `2 mmol/L` (`4` or more is severe), a large base deficit, high potassium'],
        ] },

        { t: 'h', text: 'Full stomach' },
        { t: 'p', text: 'Pain, opioids, trauma, pregnancy and bowel problems slow the stomach, so the hours since the last meal count for less in an emergency. Plan an [RSI](#/learn/induction/rsi) with your consultant. Aspirate any nasogastric tube before induction; in bowel obstruction your consultant may want one placed first, because the stomach can hold litres.' },

        { t: 'h', text: 'Sepsis and hypovolaemia: resuscitate first' },
        { t: 'p', text: 'A dry (hypovolaemic) patient keeps their BP up by tightly constricting their vessels. In sepsis the vessels are already dilated and leaky, and a racing heart and a maximal stress response hold the BP up. Either way the patient depends on that stress response, and anaesthetic drugs take it away. Before induction, with your consultant:' },
        { t: 'list', items: [
          '**Access:** two large-bore cannulas (`18 G` or bigger; `14–16 G` if bleeding), fluid through a warmer.',
          "**Fluid:** a balanced crystalloid (Hartmann's) in boluses of `250–500 mL`, rechecking heart rate, BP and perfusion after each. Bleeding patients need blood, not litres of crystalloid.",
          '**Antibiotics:** in septic shock, within an hour. Check they have been given; if not, tell the surgical team and your consultant.',
          '**Blood gas:** lactate, potassium, haemoglobin and glucose. Correct a high or low potassium as your consultant directs.',
          '**Arterial line:** in shock, often placed before induction for beat-to-beat BP and blood gases. Your consultant decides and usually inserts it; you set up the transducer ([IV access and arterial lines](#/learn/setup/iv-lines)).',
          '**Vasopressors:** phenylephrine and ephedrine drawn up and labelled; a noradrenaline infusion made up if your consultant expects to need it.',
        ] },
        { t: 'callout', kind: 'note', title: 'When surgery is the resuscitation', text: 'A ruptured aortic aneurysm or ectopic pregnancy, ongoing bleeding or ischaemic bowel will not get better on the ward. Your consultant and the surgeons decide how much to resuscitate first and when to go.' },

        { t: 'h', text: 'Induction in shock' },
        { t: 'p', text: 'Three things drop the BP at induction, and each matters more in shock:' },
        { t: 'list', ordered: true, items: [
          'The drugs relax the vessels and weaken the heart.',
          'The stress response switches off.',
          'Positive pressure ventilation squeezes the chest veins, so less blood returns to the heart.',
        ] },
        { t: 'p', text: 'A slow circulation also changes how the drugs behave: they take longer to reach the brain, then hit harder when they arrive. Giving more too soon stacks the doses. Your consultant decides the doses and when to give more. So in shock:' },
        { t: 'list', items: [
          '**Smaller doses** of the induction agent and opioid, given slowly. Propofol in shock is often `0.5–1 mg/kg` or less. Your consultant may choose ketamine (often `0.5–1 mg/kg` in shock) or etomidate (the low end of its range) instead, as they keep the BP steadier. Neither is risk-free: a patient whose stress response is exhausted can still drop their BP, and etomidate briefly suppresses the adrenal glands, a concern in sepsis.',
          '**The relaxant dose is not cut:** a slow circulation makes it work more slowly, so a full dose matters.',
          '**A vasopressor in hand** before the induction drug goes in, whatever the drug, and the BP cycling every `1–2 min` (or an arterial line). Say the numbers out loud as they change.',
          '**Do not forget the anaesthetic:** small doses wear off fast, and a paralysed patient given too little can be aware. Start the maintenance anaesthetic as soon as the tube is confirmed, at a dose the BP allows; your consultant guides how much.',
        ] },
        { t: 'details', title: 'Doses for your patient: induction drugs and vasopressors', blocks: [
          { t: 'drugs', title: 'Induction drugs (usual doses: much less in shock)', ids: ['ketamine', 'etomidate', 'propofol'] },
          { t: 'drugs', title: 'Vasopressors to have ready', ids: ['phenylephrine', 'ephedrine', 'noradrenaline'] },
        ] },

        { t: 'h', text: 'Major bleeding and massive transfusion' },
        { t: 'p', text: 'Blood loss is easy to underestimate: look in the suction canisters, swabs and drapes and on the floor, and tell your consultant what you see. When bleeding is major, your consultant (or the surgeon) decides to activate the massive transfusion protocol: the blood bank then sends red cells, plasma and platelets in packs, without waiting for each order. Call early for more hands: one person\'s whole job is to fetch and check blood.' },
        { t: 'crisis', id: 'haemorrhage' },
        { t: 'details', title: 'What happens in a massive transfusion', blocks: [
          { t: 'list', items: [
            '**Blood and plasma together:** red cells and plasma in roughly equal numbers early on; platelets and cryoprecipitate guided by blood tests. Litres of crystalloid dilute the clotting factors.',
            '**Tranexamic acid** `1 g` IV over `10 min`, then `1 g` over `8 h`; in trauma, within `3 h` of the injury.',
            '**Calcium:** the citrate in stored blood binds calcium. Check the ionised calcium on each blood gas and give calcium to keep it in the normal range (above about `1.1 mmol/L`).',
            '**Warm everything:** fluid warmer (Hotline), forced-air warmer, a warm room. Cold, acidosis and poor clotting make each other worse.',
            '**Blood gases every `30 min` or so:** haemoglobin, lactate, potassium (stored blood raises it), calcium, glucose. Send clotting tests and fibrinogen too: they guide platelets and cryoprecipitate.',
            '**Keep count** on the chart: each unit given and when, and the running blood loss.',
            '**BP target:** in bleeding trauma without a head injury, your consultant may accept a systolic BP of `80–90 mmHg` until the bleeding is controlled, because pushing the BP up with fluid makes the bleeding worse.',
          ] },
          { t: 'script', title: 'If you are asked to call the blood bank', lines: [
            '"This is the anaesthetic MO in operating theatre 5. My consultant has asked me to activate the massive transfusion protocol."',
            '"The patient is (full name and identity number), in theatre 5, bleeding from a ruptured spleen."',
            '"Please send the first pack now. A porter is on the way. My name is (your name)."',
          ] },
        ] },

        { t: 'h', text: 'After surgery: HD or ICU?' },
        { t: 'p', text: 'Sick emergency patients often need an HD or ICU bed afterwards, for ventilation, vasopressors or close monitoring. Beds take time to find: if you think one may be needed, tell your senior at the pre-clerk. They decide and book it.' },
        { t: 'callout', kind: 'stop', text: 'Never give an induction dose to a sick, septic or bleeding patient without your consultant in the room. If a patient on the e-board is getting worse, call now.' },
        { t: 'scenario', id: 'rsi-appendix' },

        { t: 'quiz', id: 'emergencies-sick-q', items: [
          {
            q: 'A 70-year-old man with a perforated bowel is coming to theatre: heart rate `120`, BP `85/50`, lactate `5 mmol/L`. Your consultant is on the way. What do you get ready?',
            options: ['Arterial line kit and a transducer', 'Phenylephrine and ephedrine drawn up and labelled; noradrenaline if your consultant wants it', 'Two large-bore cannulas and fluid through a warmer', 'Propofol `2 mg/kg` as the only induction drug, to be sure he is asleep'],
            answer: [0, 1, 2],
            explain: 'He is in shock. An arterial line, vasopressors in hand and good access with warm fluid are the basics. A full dose of propofol in shock can cause cardiovascular collapse: your consultant will use a much smaller dose, or ketamine or etomidate.',
          },
          {
            q: 'Why does the BP often fall sharply at induction in a septic patient?',
            options: ['The muscle relaxant depresses the heart', 'The drugs relax the vessels and switch off the stress response, and positive pressure ventilation cuts the blood returning to the heart', 'The patient is cold', 'Septic patients break the drugs down too quickly'],
            answer: 1,
            explain: 'The septic patient\'s BP depends on a maximal stress response holding up vessels that sepsis has already dilated. Induction drugs dilate them further and switch off the stress response, and ventilation lowers venous return. That is why doses are smaller and a vasopressor is ready before the drug goes in.',
          },
          {
            q: 'Your consultant asks you to give a reduced dose of induction agent to a shocked patient and to say when they are asleep, before the relaxant goes in. After `30 s` they are still talking. What is the best response?',
            options: ['Give the same dose again at once', 'Wait: a slow circulation delays the effect. Tell your consultant what you see', 'Switch to a gas induction', 'Intubate now, before the BP falls'],
            answer: 1,
            explain: 'In shock the drug takes longer to reach the brain. Repeating the dose too early stacks the doses, and the BP falls when both arrive. Wait, watch, and let your consultant decide on more. Never paralyse or intubate a patient who is still awake.',
          },
          {
            q: 'During a massive transfusion, which of these help?',
            options: ['Warming all fluids and blood', 'Tranexamic acid `1 g` over `10 min`', 'Calcium guided by the ionised calcium on the blood gas', 'Several litres of crystalloid to keep the BP normal'],
            answer: [0, 1, 2],
            explain: 'Warmth, tranexamic acid and calcium all protect clotting. Large volumes of crystalloid dilute the clotting factors and cool the patient: bleeding patients need blood and plasma.',
          },
        ] },
        { t: 'links', items: [
          { text: 'Rapid sequence induction', href: '#/learn/induction/rsi' },
          { text: 'Induction drugs', href: '#/learn/induction/induction-drugs' },
          { text: 'Blood products and transfusion reactions', href: '#/learn/maintenance/blood' },
          { text: 'When the circulation goes wrong', href: '#/learn/maintenance/problems-circulation' },
          { text: 'Emergency laparotomy', href: '#/learn/cases/laparotomy' },
          { text: 'RSI drug sheet', href: '#/tools/rsi' },
          { text: 'Infusion rates calculator', href: '#/tools/infusions' },
          { text: 'Crisis card: hypotension', href: '#/crisis/hypotension' },
          { text: 'Crisis card: aspiration', href: '#/crisis/aspiration' },
          { text: 'Tranexamic acid', href: '#/drugs/tranexamic-acid' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ transfers
    {
      id: 'transfers',
      title: 'Moving a sick patient',
      level: 'beyond',
      summary: 'Taking a patient to HD, ICU or CT safely: what to take, how long the oxygen lasts, and what to do when things go wrong on the way.',
      blocks: [
        { t: 'key', items: [
          'A transfer to the high dependency unit (HD), intensive care unit (ICU) or CT scanner takes a sick patient away from help, space and equipment. Most problems are prevented by preparing before you move.',
          'Stabilise first: airway secure, breathing settled, lines and infusions running, the patient as stable as they are going to get.',
          'Take a charged monitor, a full oxygen cylinder (enough for twice the journey), a self-inflating bag and mask, suction, airway kit, emergency drugs and the notes.',
          'At NTFGH the primary anaesthetic MO takes patients from the post-anaesthesia care unit (PACU) to HD, with a PACU discharge note.',
          'Ventilated or unstable patients travel with someone experienced. In your first months, ask your consultant before any transfer.',
        ] },
        { t: 'callout', kind: 'local', text: 'Patients going from PACU to HD are taken by the primary anaesthetic MO (the MO who gave the anaesthetic), not the PACU MO, who must stay in PACU at all times. A PACU discharge note is still needed before they leave.' },

        { t: 'h', text: 'Before you move' },
        { t: 'check', id: 'emergencies-transfer-check', title: 'Ready to move', items: [
          'The receiving team knows you are coming, and the bed (and ventilator) is ready',
          'Your consultant agrees the patient is stable enough to move, and who goes with them',
          'Airway secure: tube position and tape checked, or the patient awake and protecting their airway',
          'Monitor charged and on battery: ECG, pulse oximetry (SpO2), non-invasive blood pressure (NIBP); capnography if intubated; the arterial line if there is one',
          'A full oxygen cylinder, turned on, with enough for twice the journey',
          'Self-inflating bag and mask; a spare tube and laryngoscope if intubated',
          'Portable suction',
          'Emergency drugs: a vasopressor, plus sedation and a muscle relaxant if ventilated',
          'IV access working; infusions labelled, enough left for the trip, pumps charged',
          'Notes, anaesthetic chart, PACU discharge note and imaging; enough hands to move the bed',
        ] },

        { t: 'h', text: 'How long will the oxygen last?' },
        { t: 'p', text: "Read the cylinder's gauge before you leave, not in the lift. A full size E cylinder holds about `680 L` of oxygen at about `137 bar` (`2000 psi`). The contents fall in step with the pressure, so a cylinder at half pressure holds half the oxygen. Other sizes hold different amounts, and some newer cylinders fill to about `230 bar` and show the contents on their own gauge: read the size and full contents on the cylinder's label." },
        { t: 'steps', items: [
          { title: 'Work out the litres left.', text: 'Full contents × (gauge pressure ÷ full pressure). Half full: `680 L × 0.5 = 340 L`.' },
          { title: 'Work out the minutes.', text: 'Litres left ÷ flow in L/min. At `10 L/min`: `340 ÷ 10 = 34 min`.' },
          { title: 'Allow for the ventilator.', text: 'A transport ventilator driven by oxygen uses the patient\'s minute volume plus some gas to drive itself. Ask your consultant how much it uses.' },
          { title: 'Double it.', text: 'Take at least twice what the trip should need, because lifts stall and scans overrun. If in doubt, take a second cylinder.' },
        ] },

        { t: 'h', text: 'On the way' },
        { t: 'list', items: [
          'Watch the patient and the monitor all the time; keep the monitor where you can see it.',
          'Move in stages: check the tube, lines and monitor after every move, from bed to trolley, into the lift and out again.',
          'In CT you cannot stand beside the patient during the scan: watch through the window and on the monitor, with tubing and cables long enough for the table to move. MRI has its own strict metal-safety rules: never go in without the radiographer\'s checks.',
          'Change a vasopressor syringe that is running low before you set off, not halfway there.',
        ] },
        { t: 'callout', kind: 'stop', title: 'If the SpO2 falls on the way', items: [
          'Call for help: stop, or go to the nearest place with help, and phone your consultant.',
          'Take the patient off the ventilator and hand-ventilate with the self-inflating bag on `100%` oxygen.',
          'Check the oxygen: is the cylinder turned on, and is it empty?',
          'Check the tube: still in (is there a capnography trace?), not kinked or blocked; suction it.',
          'Check the chest: moving on both sides? A pneumothorax is possible.',
          'Check the circulation: pulse, BP and end-tidal CO2 (EtCO2). A falling cardiac output also drops the SpO2.',
        ] },

        { t: 'h', text: 'Arrival and handover' },
        { t: 'p', text: "Swap the patient to the receiving unit's oxygen, then to its monitor, one at a time, so they are never left without oxygen or monitoring. Then hand over with the same structure as a PACU handover (the [handover builder](#/tools/handover) helps), and ask the receiving team to listen before they start their own tasks. Stay until they have accepted the patient, and write a short note of the transfer: times, vital signs and anything that happened on the way." },
        { t: 'script', title: 'Handing over in HD', lines: [
          '"This is Mr K, 67, after an emergency laparotomy for a perforated ulcer. No known drug allergies."',
          '"General anaesthetic with a rapid sequence induction, uneventful. Blood loss 400 mL; 2 L of Hartmann\'s. He needed a little noradrenaline during the case; it was stopped an hour ago and his BP has stayed around 110/65."',
          '"Analgesia: a morphine patient-controlled analgesia (PCA) pump, and paracetamol at 10 am. Ondansetron and dexamethasone given."',
          '"Stable on the way, no events. Please watch his BP and urine output. The surgical team will review him at 6 pm."',
        ] },

        { t: 'quiz', id: 'emergencies-transfers-q', items: [
          {
            q: 'You are taking an intubated patient to CT and back: about `40 min` in all, with oxygen at `10 L/min`. The cylinder gauge reads half full (about `340 L`). What do you do?',
            options: ['Go: `34 min` is close enough', 'Take a full cylinder, or a second one, so you have at least twice what you need', 'Turn the oxygen down to `5 L/min` to make it last', 'Go, and ask CT to lend you a cylinder if you run low'],
            answer: 1,
            explain: '`340 L ÷ 10 L/min = 34 min`: less than the trip, with no margin for a stuck lift or a slow scan. Take at least twice what you expect to use. Turning down the oxygen to save gas risks hypoxia.',
          },
          {
            q: 'Your patient from an emergency laparotomy is in PACU and ready to go to HD. You are the primary anaesthetic MO and your next case is not ready yet. What happens?',
            options: ['The PACU MO takes him, as he is a PACU patient', 'You take him, once the PACU discharge note is written, with a monitor, oxygen and a bag', 'A porter and a nurse take him on their own', 'He waits in PACU until the HD team can collect him'],
            answer: 1,
            explain: 'At NTFGH the primary anaesthetic MO transports HD patients from PACU, and a PACU discharge note is still needed. The PACU MO stays in PACU at all times, looking after everyone else. Check with your consultant before you go: they decide whether he is stable enough and who goes with him.',
          },
          {
            q: 'In the lift, the SpO2 of a ventilated patient falls to `88%`. What do you do first?',
            options: ['Turn up the ventilator rate', 'Hand-ventilate with the self-inflating bag on `100%` oxygen, then check the cylinder and the tube, and call for help', 'Wait until you reach ICU, two floors up', 'Give a muscle relaxant'],
            answer: 1,
            explain: 'Taking the ventilator out of the loop and bagging with oxygen fixes many causes and tells you a lot (a stiff bag, no capnography trace). Then check the oxygen supply, the tube and the chest. Call early.',
          },
        ] },
        { t: 'links', items: [
          { text: 'Handing over to PACU', href: '#/learn/emergence/handover' },
          { text: 'Discharge from PACU', href: '#/learn/pacu/discharge' },
          { text: 'The sick emergency patient', href: '#/learn/emergencies/sick-patient' },
          { text: 'Handover builder', href: '#/tools/handover' },
          { text: 'Infusion rates calculator', href: '#/tools/infusions' },
          { text: 'Crisis card: hypoxia', href: '#/crisis/hypoxia' },
          { text: 'Crisis card: equipment failure', href: '#/crisis/equipment-failure' },
        ] },
      ],
    },
  ],
};
