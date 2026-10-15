// Start here: how the guide works, the department's rules for new MOs, the first week, how a list runs, what each duty
// involves, drug safety, calling for help and the handbook's competencies. Format: ../../CONTENT.md.
export default {
  id: 'start',
  title: 'Start here',
  group: 'start',
  summary: 'Your first weeks: the rules, the people, how a list runs, drug safety and how to call for help.',
  topics: [
    // ------------------------------------------------------------------ welcome
    {
      id: 'welcome',
      title: 'How this guide works and the rules',
      level: 'core',
      summary: "The department's rules for new MOs, the survival tips, and how to use the guide.",
      blocks: [
        { t: 'key', items: [
          '**Always ask** if you are unsure about anything. Asking is never a weakness here.',
          'You work with a consultant or senior for **every case**. Check what they want for each one.',
          'Never start an anaesthetic, end a case or do a procedure on your own unless your consultant has said so beforehand.',
          'In your **first month**, never extubate or end a case alone. If surgery finishes and your consultant is not there: **call, then wait**.',
          'When anything is out of the ordinary, your **first step is to call for help**.',
        ] },
        { t: 'p', text: "Welcome to anaesthesia at NTFGH. This guide turns the department's medical officer (MO) handbook into short topics you can read on your phone, and adds what you need beyond it. Read this **Start here** module in your first days. After that, read each module before you meet it in theatre: the evening before is ideal. New MOs are called **baby MOs** here, and the rules below are written for you." },

        { t: 'h', text: "The department's rules for baby MOs" },
        { t: 'callout', kind: 'stop', title: 'Never on your own', items: [
          'Never start an anaesthetic, end a case, or do a procedure (an airway, a block, an arterial or central line) unless your consultant has given permission beforehand. If they are not around, **call**.',
          'In your first month, never extubate or end a case alone, especially with a difficult airway or loose teeth. If surgery is done and your consultant is not with you, **call, then wait**. Keep the patient asleep, oxygenated and monitored until they come.',
          'If something changes and your senior is not in the room, **call for help first**, then start the simple, safe first steps (`100%` oxygen, hand ventilation, tell the surgeon) while help comes.',
        ] },
        { t: 'callout', kind: 'local', title: 'Two habits that prevent drug errors', items: [
          'In elective theatre, put the emergency drug vials (phenylephrine, ephedrine, atropine, with or without adrenaline) out on a tray, but **do not draw them up** unless your consultant asks.',
          'In the post-anaesthesia care unit (PACU), **check the anaesthetic chart** for problems in theatre and for every drug and dose already given **before you give any drug**.',
        ] },

        { t: 'h', text: 'Survival tips from the handbook' },
        { t: 'list', ordered: true, items: [
          "Always **ask** if you don't know or are unsure about anything.",
          'Pay attention at all times when you are on duty.',
          'Patient safety comes first: think before you act.',
          'Be in theatre before your senior. If you are running late, tell them.',
          'Be polite to everyone, including the nurses and the operating theatre technicians (OTTs). You are part of a team.',
        ] },

        { t: 'h', text: 'How to use the guide' },
        { t: 'dl', items: [
          { term: 'Learn', def: 'Short topics in the order you meet them. Each starts with key points and ends with links to related topics, tools and crisis cards.' },
          { term: 'Core and Beyond', def: '**Core** is the handbook and your first month: read it first. **Beyond** is current practice that takes you further.' },
          { term: 'Handbook and current aim', def: 'Most numbers come from the handbook. Where practice has moved on, you get the handbook\'s rule first, then the current aim. For example: the handbook\'s minimum end-tidal oxygen before induction is above `80%`; aim for `90%` or more.' },
          { term: 'Drugs', def: "The department's adult doses and dilutions, worked out for the weight you enter. The weight is kept in this browser tab for up to 6 hours: check it is your current patient's before you use a dose. Your consultant decides the dose." },
          { term: 'Tools', def: 'Calculators (fluids, blood loss, local anaesthetic maximum, risk scores) and builders for a premed summary and a PACU handover.' },
          { term: 'Crisis', def: 'One card per emergency. Read them before you need them, and glance at them when you do.' },
          { term: 'Practice', def: 'Branching cases, flashcards, check-yourself questions and the drug trolley game. Your progress stays on this phone; nothing is sent anywhere.' },
        ] },

        { t: 'h', text: 'Reading' },
        { t: 'p', text: 'The handbook recommends three books to keep nearby: the **Oxford Handbook of Anaesthesia**, **Drugs in Anaesthesia and Intensive Care**, and **Clinical Anesthesia Procedures of the Massachusetts General Hospital**. For short, reliable reading on one topic at a time, use these websites.' },
        { t: 'links', title: 'Websites', items: [
          { text: 'BJA Education', href: 'https://www.bjaed.org', note: 'short, reliable reviews' },
          { text: 'WFSA tutorial of the week', href: 'https://www.wfsahq.org', note: 'free tutorials on one topic each' },
          { text: 'NYSORA', href: 'https://www.nysora.com', note: 'regional anaesthesia' },
        ] },

        { t: 'quiz', id: 'start-rules-q', items: [
          {
            q: 'It is your second week. The surgeon is closing and says, “All done, you can wake her up.” Your consultant stepped out ten minutes ago. What do you do?',
            options: [
              'Turn off the sevoflurane, reverse the muscle relaxant and extubate once she meets the criteria',
              'Call your consultant, keep her asleep, oxygenated and monitored, and wait',
              'Ask the anaesthetic nurse to help you extubate',
              'Turn off the sevoflurane now so she is nearly awake when your consultant returns',
            ],
            answer: 1,
            explain: 'In your first month you never extubate or end a case alone: call, then wait. Turning the agent off commits you to a wake-up you may have to manage alone, and emergence is when laryngospasm and airway problems happen. Keeping her asleep for a few more minutes is safe.',
          },
          {
            q: 'You are setting up for an elective list. What do you do with the emergency drugs?',
            options: [
              'Draw up phenylephrine, ephedrine, atropine and adrenaline so they are ready',
              'Put the vials out on a tray and draw them up only if your consultant asks',
              'Leave them in the trolley: they are only for emergencies',
              'Draw up adrenaline only, because it is the most urgent',
            ],
            answer: 1,
            explain: 'The vials are out and within reach, so they can be drawn up in seconds, but nothing is wasted and no extra syringes are left lying around. In the emergency theatre the rule is different: you prepare emergency drugs before the list starts.',
          },
          {
            q: 'In PACU, a nurse tells you a patient has pain of 8 out of 10. You have seen the patient: airway, breathing and circulation are fine. What must you check before you prescribe anything?',
            options: [
              'The anaesthetic chart: what was given in theatre, how much and when, and any problems',
              'Nothing more: severe pain needs morphine quickly',
              'The surgical operation note only',
              'Whether the ward has morphine in stock',
            ],
            answer: 0,
            explain: 'The patient may already have had a large dose of opioid in theatre, or a block that is about to work. Checking the chart first is a handbook rule because doses stacked on top of doses cause PACU drug errors. Then check allergies and treat.',
          },
          {
            q: 'During a case, the blood pressure falls to 75/40 and your consultant is in the next theatre. What is your first step?',
            options: [
              'Give phenylephrine and see if it works before bothering anyone',
              'Call for help (your consultant), then start the simple, safe steps while they come',
              'Turn the sevoflurane down and recheck in five minutes',
              'Ask the surgeon what they think is happening',
            ],
            answer: 1,
            explain: 'When anything is out of the ordinary, the first step is to call for help. While help comes you can tell the surgeon, recheck the reading, turn the agent down and look for a cause. Your consultant will often ask you to give a vasopressor straight away (ephedrine if the heart rate is slow, phenylephrine if it is normal or fast), but they need to know. See the [low blood pressure crisis card](#/crisis/hypotension).',
          },
        ] },

        { t: 'links', title: 'Next', items: [
          { text: 'Your first day and week', href: '#/learn/start/first-week' },
          { text: 'How to call for help and speak up', href: '#/learn/start/calling-for-help' },
          { text: 'Drug safety', href: '#/learn/start/drug-safety' },
          { text: 'Flashcards: NTFGH rules and where things are', href: '#/practice/cards/local' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ first-week
    {
      id: 'first-week',
      title: 'Your first day and week',
      level: 'core',
      summary: 'When to arrive, what to do before the first case, who is who, and a checklist for week one.',
      blocks: [
        { t: 'key', items: [
          'Be in theatre **20–30 minutes before** the 8.30 am start: Epic (the electronic record) open, patient seen, IV in, and drugs drawn up **only after checking** with your senior.',
          "**Read up the next day's cases** the evening before. Knowing the patient and the operation makes you a help rather than a hindrance.",
          'Learn who does what in theatre, and introduce yourself to everyone.',
          'In your first month you do **no calls on your own**: you do tag calls with the on-call team, and start calls once you have passed the **Baby MO test**.',
          'Work through the two checklists below in your first week.',
        ] },

        { t: 'h', text: 'Each morning' },
        { t: 'steps', items: [
          { title: 'Arrive 20–30 minutes early.', text: 'The anaesthetic for the first case is expected to start at 8.30 am, and preparing takes time.' },
          { title: 'Set up the theatre.', text: "Check the machine, open the patient's chart in Epic, put the emergency drug vials on a tray and prepare a drug tray for the case. See [Before the patient comes in](#/learn/setup/before-patient)." },
          { title: 'See the patient.', text: 'Introduce yourself. Confirm who they are, the operation, fasting, allergies and consent, and check for anything new since the premed.' },
          { title: 'Set the IV.', text: 'A cannula that runs well, with a three-way extension if needed.' },
          { title: 'Check before you draw up.', text: 'Each consultant has their own plan. Ask what they want, then draw up and label each syringe.' },
          { title: 'Report when your consultant arrives.', text: 'Say the patient is seen, anything new, and what you have prepared.' },
        ] },
        { t: 'script', title: 'Meeting a consultant for the first time', lines: [
          "Good morning, I'm the new MO, in my first week.",
          "I've checked the machine and seen the first patient: a 54-year-old woman for a laparoscopic cholecystectomy, ASA 2 (mild systemic disease) for hypertension. She last ate at 10 pm and had water at 6 am. No allergies, and her airway looks straightforward.",
          'What would you like me to draw up for her? And is there anything you would like me to do differently from how you have seen it done?',
        ] },

        { t: 'h', text: 'The evening before' },
        { t: 'p', text: "Read up on tomorrow's patients (from your premeds) and their operations. You will understand why things are done, anticipate what your consultant needs, and learn far more from each case. Start with [Common operations](#/learn/cases) and look up the drugs you expect to use in the [Drugs](#/drugs) tab." },

        { t: 'h', text: "Who's who in theatre" },
        { t: 'dl', items: [
          { term: 'Your consultant or senior', def: 'Responsible for the anaesthetic. You work with them for every case and check their plan for each one.' },
          { term: 'OT coordinator (OTC)', def: 'The consultant running the operating theatre (OT) suite for the day. Tell the OTC about problems with the list, and check with them before you leave if your list ends early.' },
          { term: 'Anaesthetic unit (AU) nurse', def: 'The anaesthetic nurse in your theatre. Helps with induction, the airway and emergence, and knows where everything is.' },
          { term: 'Operating theatre technician (OTT)', def: 'Helps with equipment, positioning and moving the patient.' },
          { term: 'Advanced practice nurse (APN)', def: 'A senior nurse, usually in the post-anaesthesia care unit (PACU), who teaches, assists and relieves the PACU MO.' },
          { term: 'Scrub nurse', def: 'Scrubbed with the surgeon; runs the instruments and the swab count.' },
          { term: 'Surgeon', def: 'Tell them anything that affects the operation; ask them about bleeding, changes of plan and when they will finish.' },
        ] },
        { t: 'callout', kind: 'tip', text: 'Introduce yourself to the AU nurse and the OTT at the start of every list, and learn their names. They have helped many new MOs before you, and they are often the first to spot a problem.' },

        { t: 'h', text: 'Calls and the Baby MO test' },
        { t: 'p', text: 'In your first month you do not do calls. You join the on-call team for four tag calls to learn how the emergency list and the evening work run. You start calls once you have passed the [Baby MO test](../babymo/), the department\'s test for new MOs.' },

        { t: 'check', id: 'start-first-week', title: 'Find it in your first week', items: [
          'The drug trolley, and what is in each drawer ([try the trolley game](#/practice/drawers)).',
          'The emergency drug tray and the vials that go on it.',
          'The suction: turn it on and check it works.',
          'The Bair Hugger, the tourniquet and the Hotline fluid warmer.',
          'The difficult airway trolley: look through it with the AU nurse.',
          'The arrest trolley and the defibrillator.',
          'The malignant hyperthermia (MH) box with the dantrolene.',
          'The Intralipid (for local anaesthetic toxicity) and the sugammadex.',
          'The pacemaker magnet in the OT control room.',
        ] },
        { t: 'check', id: 'start-first-week-do', title: 'Do it in your first week', items: [
          'Check an anaesthetic machine with someone who knows it well.',
          'Find out how to call an emergency in your theatre, and how the massive transfusion protocol is activated.',
          'Log in to Epic and find the anaesthesia smartphrases (ANAPRECLERK, NGEMRANAESPLAN).',
          'See five premeds and present them to the consultant.',
          'Watch a handover in PACU.',
          'Go to the target-controlled infusion (TCI) pump training.',
          'Read the crisis cards for [anaphylaxis](#/crisis/anaphylaxis), [failed intubation](#/crisis/failed-intubation) and [local anaesthetic toxicity](#/crisis/last).',
        ] },

        { t: 'links', items: [
          { text: 'How a list runs, start to finish', href: '#/learn/start/the-list' },
          { text: 'Seeing your premeds', href: '#/learn/preop/premeds' },
          { text: 'The drug trolley and E-drugs', href: '#/learn/setup/trolley' },
          { text: 'Baby MO test', href: '../babymo/' },
          { text: 'Flashcards: NTFGH rules and where things are', href: '#/practice/cards/local' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ the-list
    {
      id: 'the-list',
      title: 'How a list runs, start to finish',
      level: 'core',
      summary: 'Set-up, the three safety pauses, each stage of the case, turnover and premeds after the list.',
      blocks: [
        { t: 'key', items: [
          'Set up **before** the patient comes in: machine checked, Epic (the electronic record) open, emergency vials out, drug tray ready, extra kit if asked.',
          'Every case runs the same way: sign in, induction, time out, maintenance, sign out, emergence, handover in the post-anaesthesia care unit (PACU), then turnover.',
          'Between cases, discard what was drawn up for the last patient, restock and set up again.',
          'After the list, see your **premeds** for tomorrow and update the consultant.',
          'If your list ends **before 4 pm**, check with the OT coordinator (OTC) whether you are needed elsewhere before you leave.',
        ] },

        { t: 'h', text: 'One case, step by step' },
        { t: 'steps', items: [
          { title: 'Set up.', text: 'Before the patient comes in. See [Before the patient comes in](#/learn/setup/before-patient).' },
          { title: 'Sign in.', text: 'Before induction, with the patient awake: identity, operation, site and marking, consent, fasting and allergies, checked aloud with the team.' },
          { title: 'Monitors and IV.', text: 'ECG, blood pressure cuff and pulse oximeter on before induction, and capnography from the first breath through the circuit. Check the IV runs well.' },
          { title: 'Induction.', text: 'Your consultant leads. Know [the steps of a general anaesthetic (GA) induction](#/learn/induction/ga-steps) by heart.' },
          { title: 'Position, then time out.', text: 'Help position and protect the patient, then join the time out before the incision.' },
          { title: 'Maintenance.', text: '[Stay vigilant](#/learn/maintenance/vigilance), anticipate surgical stimulation, and keep the anaesthetic chart up to date.' },
          { title: 'Sign out and emergence.', text: 'Plan the wake-up with your consultant. In your first month, never alone: call, then wait. See [Ending a case](#/learn/emergence/end-of-case).' },
          { title: 'To PACU and hand over.', text: 'Give a structured handover to the PACU nurse and the PACU MO. See [Handing over to PACU](#/learn/emergence/handover).' },
          { title: 'Turnover.', text: 'Tidy, discard, restock and set up for the next patient.' },
        ] },
        { t: 'scenario', id: 'first-induction' },

        { t: 'h', text: 'The three safety pauses' },
        { t: 'p', text: 'Every theatre uses the World Health Organisation (WHO) surgical safety checklist. It is not in the handbook, but you will take part in it for every case. Anaesthesia has its own lines in each pause: say them clearly.' },
        { t: 'table', head: ['Pause', 'What is checked'], rowHead: true, rows: [
          ['Sign in: before induction', 'Identity, operation, site marked, consent. Allergies? Difficult airway or aspiration risk? Blood loss over `500 mL` likely (`7 mL/kg` in a child), and are IV access and blood ready? Machine, drugs and pulse oximeter checked.'],
          ['Time out: before the incision', 'Team introduced. Patient, operation and side confirmed aloud. Antibiotic given in the last `60 min`? Any anaesthetic concerns.'],
          ['Sign out: before the patient leaves theatre', 'Operation recorded, counts correct, specimens labelled, equipment problems. Key concerns for recovery.'],
        ] },
        { t: 'callout', kind: 'tip', text: 'The pauses are your chance to speak up. If you are worried about something (an allergy nobody has mentioned, no blood available, a marked side that does not match the list), say so then.' },

        { t: 'h', text: 'Between cases' },
        { t: 'list', items: [
          'Discard every syringe and open ampoule from the last patient. Never use a syringe drawn up for one patient on another.',
          'Replace the single-patient parts of the breathing system (filter, catheter mount, face mask) and check the suction.',
          'Restock what you used, then prepare the drug tray for the next patient once your consultant has said what they want.',
          'Separate the recycling: clean plastic and paper only, IV fluid bags beside the recycling bags, nothing stained with blood.',
          'Finish the anaesthetic chart for the last patient before the next one comes in.',
        ] },

        { t: 'h', text: 'After the list' },
        { t: 'p', text: 'See your premeds for tomorrow, usually after your list ends. Then update the consultant doing that list on:' },
        { t: 'list', items: [
          'the cases, and how many;',
          "each patient's important problems and airway;",
          'the problems you foresee, and who the surgeons are;',
          'what is needed: drugs, special equipment, a high dependency (HD) or intensive care unit (ICU) bed.',
        ] },
        { t: 'p', text: "On Friday, update Monday's consultant and tell the Sunday half-call MO about any potential problems. See [Seeing your premeds](#/learn/preop/premeds); the [premed summary builder](#/tools/premed) helps you organise it." },
        { t: 'callout', kind: 'local', title: 'Finished early?', text: 'If your list ends before 4 pm, check with the OTC whether your help is needed elsewhere before you leave.' },

        { t: 'quiz', id: 'start-list-q', items: [
          {
            q: 'At sign in, which of these should anaesthesia raise?',
            options: [
              'A known drug allergy',
              'A difficult airway or a high risk of aspiration',
              'Expected heavy blood loss, and whether IV access and blood are ready',
              "The surgeon's choice of suture",
            ],
            answer: [0, 1, 2],
            explain: 'Sign in is before induction, so it is the moment to make sure the team knows about allergies, the airway and aspiration risk, and that blood and access are ready if heavy bleeding is possible. Sutures are the surgeon\'s business.',
          },
          {
            q: 'Your elective list finishes at 2.30 pm. What do you do?',
            options: [
              'Go home: the list is finished',
              'Check with the OTC whether you are needed elsewhere, then see your premeds',
              'See your premeds, then go home without telling anyone',
              'Wait in the staff room in case someone needs you',
            ],
            answer: 1,
            explain: 'The handbook rule: if your list ends before 4 pm, check with the OTC before you leave. Your premeds still need to be seen and the consultant updated.',
          },
          {
            q: 'Between cases you find a half-used `20 mL` syringe of propofol from the last patient. The next patient is coming in. What do you do?',
            options: [
              'Use it for the next induction to save waste',
              'Discard it and draw up a fresh syringe for the next patient',
              'Use it if it is clearly labelled',
              'Keep it for top-ups during the next case',
            ],
            answer: 1,
            explain: 'A syringe drawn up for one patient is never used on another: it risks cross-infection, and propofol supports bacterial growth. To cut waste, draw up only what you are likely to use.',
          },
        ] },

        { t: 'links', items: [
          { text: 'Before the patient comes in', href: '#/learn/setup/before-patient' },
          { text: 'The steps of a GA induction', href: '#/learn/induction/ga-steps' },
          { text: 'Handing over to PACU', href: '#/learn/emergence/handover' },
          { text: 'PACU handover builder', href: '#/tools/handover' },
          { text: 'Infection control and sharps', href: '#/learn/good/infection' },
          { text: 'What each duty involves', href: '#/learn/start/duties' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ duties
    {
      id: 'duties',
      title: 'What each duty involves',
      level: 'core',
      summary: 'Elective OT, emergency OT, PACU, APS, PEC, 1–9, on call, reliever and Sunday half call: the job in each.',
      blocks: [
        { t: 'key', items: [
          'Each day you are rostered to one duty. Know what it involves before you start.',
          "**Elective operating theatre (OT)**: your consultant's list, then your own premeds for tomorrow.",
          '**Emergency OT (EOT)** and **on call**: watch the e-board (the electronic emergency list), pre-clerk new cases (assess them before they come to theatre), and tell your consultant about problems early.',
          '**Post-anaesthesia care unit (PACU)**: be physically there all day and receive every handover. Simple problems are yours; persistent or severe ones go to the primary anaesthetist.',
          '**Pre-operative evaluation clinic (PEC)** and **acute pain service (APS)**: assess and follow up patients, but never cancel, refer or change a plan on your own.',
        ] },
        { t: 'p', text: 'This is the clinical job in each duty. The roster and its rules are on the department intranet.' },

        { t: 'dl', items: [
          { term: 'Elective OT', def: "Your consultant's list. Afterwards, see your premeds for tomorrow and update that consultant: drugs to prepare, special equipment, a high dependency (HD) or intensive care unit (ICU) bed." },
          { term: 'Emergency OT (EOT)', def: 'Check the machine and prepare the emergency drugs before the 8.30 am handover at reception. Keep checking the e-board, pre-clerk new cases, tell your OT consultant and the OT coordinator (OTC) if anything is amiss, and send for the next case in good time.' },
          { term: 'PACU', def: 'In PACU from 8.30 am to 5.30 pm, there at all times: for an urgent break, tell the OTC and the advanced practice nurse (APN) first. Take a handover for every patient. Manage simple problems; take persistent or severe ones to the primary anaesthetist. Discharge the patients who are not for nurse-led discharge once they are stable. Hand over to the on-call team at 5.30 pm.' },
          { term: 'Acute pain service (APS)', def: 'A full week, weekends included. Keep the patient list and round with the pain nurses and the APS consultant (alone at weekends, then report to the specialist on duty). See patients after nerve blocks and spinals, top up patient-controlled analgesia (PCA), epidurals and infusions, remove catheters, take referrals and write your plans. Hand over in detail to the next APS MO.' },
          { term: 'Pre-operative evaluation clinic (PEC)', def: 'Assess patients before surgery: a detailed history and examination, old notes in the national electronic health record (NEHR), and the assessment form. Counsel for every possible technique without promises: the anaesthetist on the day decides. Discuss anyone you are unsure about with the PEC consultant, and read the PEC guidelines before your first session.' },
          { term: '1–9 duty', def: 'From 1 pm, report to the OTC: relieve theatres and see blue letters (inpatient referrals). From 4 pm, work with the on-call team (perhaps in PACU or EOT) until 9 pm unless released earlier.' },
          { term: 'On call (#)', def: 'From 5 pm, with the on-call specialist: run the emergency list, pre-clerk e-board cases and flag problems early. Before you go post call, make sure the remaining cases are pre-clerked. The call ends at 8.30 am after handover.' },
          { term: 'Reliever (*)', def: 'Give breaks in the theatres marked * on the roster. Tell your own consultant when you go, and check regularly whether consultants working alone need a break or a hand.' },
          { term: 'Sunday half call and premeds', def: 'Report to the specialist, say how many inpatient premeds you have, see them, and help in EOT and with breaks.' },
        ] },

        { t: 'callout', kind: 'stop', title: 'Never on your own', items: [
          'In PEC, never refer a patient or cancel an operation on your own: discuss it with the PEC consultant, by phone if they are not in the room.',
          'In PACU, never decide alone that a patient needs HD or ICU: escalate to a senior.',
          'On the APS, top-ups and changes to epidurals and infusions follow the APS consultant\'s plan.',
          'Before you remove an epidural or nerve catheter, check when the last anticoagulant dose was given and when the next is due ([intervals](../spinal/#tq-anticoag)). If the timing is not safe or you are unsure, leave it in and ask.',
        ] },
        { t: 'callout', kind: 'tip', text: 'Whatever the duty: if you are unsure, ask; if a patient worries you, tell your senior now, not at the end of the day.' },

        { t: 'links', title: 'More on each duty', items: [
          { text: 'The emergency list', href: '#/learn/emergencies/eot' },
          { text: 'On call', href: '#/learn/emergencies/on-call' },
          { text: 'Your job in PACU', href: '#/learn/pacu/pacu-job' },
          { text: 'The acute pain service', href: '#/learn/pain-aps/aps' },
          { text: 'Working in PEC', href: '#/learn/preop/pec' },
          { text: 'Seeing your premeds', href: '#/learn/preop/premeds' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ drug-safety
    {
      id: 'drug-safety',
      title: 'Drug safety',
      level: 'core',
      summary: 'The RIGHTs, drawing up and labelling, doing the sum, high-alert drugs and look-alikes.',
      blocks: [
        { t: 'key', items: [
          'Check the **RIGHTs** every time: patient, drug, dose, dilution, route, timing, speed, and no allergies.',
          '**Label every syringe** as soon as you draw it up, with the drug and its strength. An unlabelled syringe goes in the bin.',
          '**Read the ampoule**, not its colour or its place in the drawer, and show it to a second person.',
          '**Do the sum** for every dilution, out loud. Tenfold errors are the classic serious mistake.',
          '**Potassium chloride is never given as a bolus.** Insulin, vasopressors and muscle relaxants need extra care.',
        ] },
        { t: 'p', text: 'In anaesthesia you choose, draw up and give the drug yourself, often quickly, with no pharmacist in between. Good habits, done the same way every time, are what protect the patient.' },

        { t: 'h', text: 'The RIGHTs (from the handbook)' },
        { t: 'table', head: ['Right…', 'Ask yourself'], rowHead: true, rows: [
          ['Patient', 'Is this syringe for the patient in front of me?'],
          ['Drug', 'Have I read the name on the ampoule and on the label?'],
          ['Dose', "Is it right for this patient's weight, age and condition? The elderly, frail and shocked need less."],
          ['Dilution', 'What is the strength in the syringe (mg/mL or mcg/mL), and how many mL is the dose?'],
          ['Route', 'IV, intramuscular, subcutaneous, spinal, epidural or around a nerve? Is it going into the right line?'],
          ['Timing', 'Is it due now? Has it already been given (check the chart)?'],
          ['Speed', 'A slow push, over several minutes, or by pump?'],
          ['Allergies', 'Have I asked the patient and checked the band and the chart?'],
        ] },

        { t: 'h', text: 'Drawing up safely' },
        { t: 'steps', items: [
          { title: 'One drug at a time.', text: 'Label each syringe before you pick up the next ampoule.' },
          { title: 'Read the ampoule.', text: 'Name, strength and expiry. Say the name out loud.' },
          { title: 'Show it to a second person.', text: 'The anaesthetic unit (AU) nurse or your consultant checks the ampoule with you.' },
          { title: 'Draw up and dilute as the department does.', text: 'Each drug card in the [Drugs](#/drugs) tab shows the preparation and the strength you end up with.' },
          { title: 'Label at once.', text: 'Drug name and strength, for example `ephedrine 5 mg/mL`, on the coloured label for its class.' },
          { title: 'Keep the ampoule.', text: 'Leave the empty ampoule with its syringe on the tray until the case is over, so anyone can check what you drew up.' },
          { title: 'Before you give it.', text: 'Read the label again, say the dose in mg and in mL, give it at the right speed, and record it on the chart.' },
        ] },
        { t: 'figure', id: 'syringe-labels', caption: 'Syringe label colours (ISO 26825). The colour tells you the class of drug, never which drug: always read the name.' },

        { t: 'callout', kind: 'warn', title: 'Do the sum, every time', items: [
          '`1 mg` in `10 mL` is `100 mcg/mL`. `1 mg` in `100 mL` is `10 mcg/mL`.',
          'Ephedrine: a `30 mg` vial plus `5 mL` of saline makes `6 mL` of `5 mg/mL`, so `5 mg` is `1 mL`.',
          'If a dose comes out ten times bigger or smaller than you expected, stop and recheck.',
          "Phenylephrine: the handbook's table prints `1 mg` in `100 mL` as `100 mcg/mL`, but the sum gives `10 mcg/mL`. The bolus strength is `100 mcg/mL`: `1 mg` made up to `10 mL`, or `10 mg` in a `100 mL` bag ([phenylephrine](#/drugs/phenylephrine)). Pharmacy syringes have the strength on the label: read it.",
        ] },

        { t: 'h', text: 'High-alert drugs' },
        { t: 'list', items: [
          '**Potassium chloride** (`10 mmol` ampoules, third drawer): only diluted and by pump. A bolus can stop the heart.',
          '**Insulin**: write and say “units” in full, never “U” (it can be read as a zero). Use an insulin syringe, have a second person check the dose, and run infusions by pump.',
          '**Vasopressors and antihypertensives** (the “uppers and downers”, second drawer): small, diluted boluses, and watch the effect. Adrenaline comes as `1 mg` in `1 mL` (1:1,000); IV boluses are diluted to `100 mcg/mL` (1:10,000) or `10 mcg/mL` (1:100,000). A `1 mg` IV dose is for cardiac arrest only: in a beating heart it causes severe hypertension, arrhythmias and myocardial ischaemia.',
          '**Muscle relaxants**: only when your consultant says so, and only once the patient is asleep. Keep them apart from the other syringes.',
          '**Opioids**: check what has already been given, in theatre and in the post-anaesthesia care unit (PACU), before giving more.',
          '**Local anaesthetics**: work out the maximum dose first ([local anaesthetic maximum dose](#/tools/la-max)). Keep block and epidural syringes labelled and apart from the IV syringes, so a large dose never goes into a vein by mistake.',
        ] },
        { t: 'callout', kind: 'stop', title: 'Never', items: [
          'Never give potassium chloride as a bolus.',
          'Never give a drug from an unlabelled syringe: throw it away.',
          'Never give a muscle relaxant to a patient who is awake.',
          'Never use a syringe drawn up for one patient on another.',
        ] },

        { t: 'h', text: 'Look-alikes and waste' },
        { t: 'p', text: 'Many small clear ampoules look the same, and drawers get restocked in a hurry, so read the name every time, even from “your” drawer. Similar names catch people out too, such as dexamethasone and dexmedetomidine.' },
        { t: 'p', text: 'Draw up only what you are likely to use: spare syringes are waste, and someone else may pick one up. This is why the emergency drugs stay as vials in elective theatre.' },
        { t: 'callout', kind: 'local', title: 'If an error happens', text: 'Look after the patient first and tell your consultant at once. Then record the facts and file an incident report ([When something goes wrong](#/learn/good/incidents)). Everyone makes or nearly makes a drug error at some point; reporting it honestly is how the department makes the next one less likely.' },

        { t: 'quiz', id: 'start-drugs-q', items: [
          {
            q: 'There is a `10 mL` syringe of clear fluid on your tray with no label. You are fairly sure it is the fentanyl you drew up. What do you do?',
            options: [
              'Give it: you are sure',
              'Ask the AU nurse whether they remember what it is',
              'Throw it away and draw up a fresh, labelled syringe',
              'Label it as fentanyl now',
            ],
            answer: 2,
            explain: 'Clear drugs look identical, and “fairly sure” is how wrong-drug errors happen. An unlabelled syringe always goes in the bin.',
          },
          {
            q: 'You add `1 mg` of phenylephrine to a `100 mL` bag of saline. What strength do you write on the label?',
            options: ['`1 mcg/mL`', '`10 mcg/mL`', '`100 mcg/mL`', '`1 mg/mL`'],
            answer: 1,
            explain: '`1 mg` is `1000 mcg`, and `1000 mcg` in `100 mL` is `10 mcg/mL`: a tenth of the usual bolus strength of `100 mcg/mL` (`1 mg` made up to `10 mL`, or `10 mg` in a `100 mL` bag). If you labelled it `100 mcg/mL`, every “`100 mcg`” bolus would really be `10 mcg`. The handbook\'s table makes exactly this slip, which is why you do the sum yourself.',
          },
          {
            q: 'You draw up `10 mL` of bupivacaine for the surgeon to infiltrate the wound, and a `10 mL` saline flush, in identical syringes. What do you do?',
            options: [
              'Label the bupivacaine; the saline is harmless, so it does not need a label',
              'Label both at once, and keep the bupivacaine apart from the IV syringes',
              'Keep one in each hand until the surgeon asks for it',
              'Put them side by side on the tray: you will remember which is which',
            ],
            answer: 1,
            explain: 'Every syringe gets a label, even saline: an unlabelled syringe is a guess, and the next person cannot tell them apart. Local anaesthetic pushed into a vein by mistake can cause local anaesthetic systemic toxicity (LAST), so it is the right route that you are protecting. See the [LAST crisis card](#/crisis/last).',
          },
          {
            q: 'In PACU, a nurse asks you to push a `10 mmol` ampoule of potassium chloride into the cannula because the potassium is `3.1 mmol/L`. What do you do?',
            options: [
              'Push it slowly over one minute',
              'Give half now and half in an hour',
              'Do not push it: ask your senior for a plan to give it diluted, by pump',
              'Give it intramuscularly instead',
            ],
            answer: 2,
            explain: 'A bolus of potassium chloride can cause a fatal arrhythmia. It is only ever given diluted and by pump, at a controlled rate, and a mildly low potassium in PACU is rarely urgent. Ask your senior.',
          },
          {
            q: 'Your consultant asks for adrenaline in `10 mcg` boluses. You have a `1 mg` in `1 mL` ampoule. Which preparation gives `10 mcg` in each `1 mL`?',
            options: [
              '`1 mg` made up to `10 mL`',
              '`1 mg` made up to `10 mL`, then `1 mL` of that made up to `10 mL`',
              'The neat ampoule: give `0.1 mL`',
              '`1 mg` in a `100 mL` bag, then `1 mL` of that made up to `10 mL`',
            ],
            answer: 1,
            explain: '`1 mg` is `1000 mcg`. In `10 mL` that is `100 mcg/mL` (1:10,000); `1 mL` of it made up to `10 mL` is `10 mcg/mL` (1:100,000), so `1 mL` is `10 mcg`. The first option gives ten times the dose in each mL. `0.1 mL` of the neat ampoule is `100 mcg`, and so small a volume is easy to get wrong. The last option gives `1 mcg/mL`.',
          },
        ] },

        { t: 'links', items: [
          { text: 'Percent, ratio and mg/mL converter', href: '#/tools/convert' },
          { text: 'Flashcards: how to draw up', href: '#/practice/cards/dilutions' },
          { text: 'The drug trolley and E-drugs', href: '#/learn/setup/trolley' },
          { text: 'Potassium chloride', href: '#/drugs/potassium-chloride' },
          { text: 'Phenylephrine', href: '#/drugs/phenylephrine' },
          { text: 'Find it in the trolley (game)', href: '#/practice/drawers' },
          { text: 'When something goes wrong', href: '#/learn/good/incidents' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ calling-for-help
    {
      id: 'calling-for-help',
      title: 'How to call for help and speak up',
      level: 'core',
      summary: 'When to call, how to say it (ISBAR, closed loop), speaking up to seniors and surgeons, and escalating from PACU.',
      blocks: [
        { t: 'key', items: [
          '**Call early**: when you are unsure, when the numbers are moving the wrong way, and always when you cannot oxygenate.',
          'Say the problem out loud in the room first: the anaesthetic unit (AU) nurse and the surgeon are your fastest help.',
          'On the phone use **ISBAR**: who you are, the problem, the background, what you see, what you need.',
          'Use **closed-loop** communication: repeat the instruction back, then say when it is done.',
          'If you are worried and not heard, get firmer: **“I\'m concerned… I\'m uncomfortable… this is unsafe.”**',
        ] },

        { t: 'h', text: 'When to call' },
        { t: 'list', items: [
          'You are unsure about anything: a plan, a dose, a monitor reading, a request.',
          "The vital signs are moving the wrong way: saturation falling, blood pressure or heart rate far from the patient's normal, the capnograph trace changing shape or disappearing.",
          'Anything new: a rash, a wheeze, high airway pressure, the patient moving, bleeding that worries the surgeon.',
          'Someone asks you to start, extubate or do a procedure without your consultant.',
          'In the post-anaesthesia care unit (PACU): a nurse is worried, or a patient is drowsy, breathing slowly, hypotensive, or may need a high dependency (HD) or intensive care unit (ICU) bed.',
        ] },
        { t: 'callout', kind: 'stop', title: 'Call for help now', items: [
          'You cannot oxygenate or ventilate the patient.',
          'There is no capnograph trace after intubation: no trace means wrong place.',
          'The saturation is falling despite `100%` oxygen.',
          'You suspect anaphylaxis, local anaesthetic toxicity, malignant hyperthermia or cardiac arrest.',
        ] },
        { t: 'callout', kind: 'tip', text: 'Nobody minds being called for something that turns out to be fine. Everybody minds not being called.' },

        { t: 'h', text: 'How to call' },
        { t: 'p', text: 'In theatre, say it out loud first: “I need help: the saturation is 85% and falling.” The AU nurse can fetch or phone your consultant while you start the first steps on the crisis card. Then, on the phone, use ISBAR: identify, situation, background, assessment, recommendation (or request).' },
        { t: 'script', title: 'ISBAR on the phone', lines: [
          "**Identify** (who and where you are): Hi, it's the MO in OT 6.",
          "**Situation** (the problem in one sentence): I'm worried about my patient's blood pressure: it's 70/40 and hasn't come up.",
          "**Background** (patient and operation, briefly): She's 78, on ramipril, having a hip hemiarthroplasty. She was induced five minutes ago with propofol and fentanyl.",
          "**Assessment** (what you see and have done): Heart rate 55, sinus rhythm, saturation 99%. I've turned the sevoflurane down and started a fluid bolus.",
          '**Recommendation** (what you need, said plainly): Can you come now, please? With the heart rate slow, shall I give ephedrine `5 mg` while you come?',
        ] },
        { t: 'scenario', id: 'hypotension-induction' },

        { t: 'h', text: 'Closed-loop communication' },
        { t: 'p', text: 'In a crisis, give each task to a named person, and check it was heard. When you receive an instruction, repeat it back, do it, and say when it is done. This stops two people giving the same drug, or nobody giving it.' },
        { t: 'script', title: 'Closing the loop', lines: [
          '**Consultant:** Give ephedrine `5 mg`.',
          "**You:** Ephedrine `5 mg` IV, that's `1 mL`.",
          '**You, once given:** Ephedrine `5 mg` given.',
        ] },

        { t: 'h', text: 'Speaking up' },
        { t: 'p', text: 'You may notice something before anyone else: a falling saturation the surgeon has not seen, a drug the patient is allergic to, a step that was skipped. Speaking up is part of your job. Start politely and get firmer until you are heard (graded assertiveness). State the fact, not the blame.' },
        { t: 'script', title: 'Getting firmer: concerned, uncomfortable, unsafe (CUS)', lines: [
          "I'm **concerned** that the saturation is 89% and still falling.",
          "I'm **uncomfortable** carrying on without the consultant here.",
          'This is **unsafe**. We need to stop and call for help now.',
        ] },
        { t: 'p', text: 'The same goes for surgeons: “Could you pause, please? The heart rate has dropped to 35.” If you are still not heard, call your consultant or the OT coordinator (OTC).' },

        { t: 'h', text: 'Escalating from PACU (from the handbook)' },
        { t: 'steps', items: [
          'When a PACU nurse alerts you, go and see the patient **now**.',
          'Check airway, breathing and circulation, and look at the vital signs.',
          'Look through the notes for allergies and medical problems.',
          '**Check the anaesthetic chart** for problems in theatre and the drugs and doses given, before you give anything new.',
          'If anything worries you, tell the primary anaesthetist or the OTC.',
          'If the patient may need HD or ICU, escalate to a senior: do not decide alone.',
        ] },

        { t: 'quiz', id: 'start-help-q', items: [
          {
            q: 'You are alone with an intubated, ventilated patient while your consultant takes a phone call outside. Over a minute the saturation falls from 99% to 91%. What do you do first?',
            options: [
              'Call for help out loud and get your consultant back, then give `100%` oxygen and check the patient and the circuit',
              'Turn up the sevoflurane in case the patient is light',
              'Wait a minute to see whether it recovers',
              'Change the pulse oximeter probe to another finger',
            ],
            answer: 0,
            explain: 'Call first, then do the simple, safe things while help comes: `100%` oxygen, hand ventilate to feel the lungs, look at the capnograph, and check the tube, circuit and chest. See the [hypoxia crisis card](#/crisis/hypoxia).',
          },
          {
            q: 'Your consultant says, “Give atropine `0.6 mg`.” Which reply closes the loop?',
            options: [
              '“OK.”',
              '“Atropine `0.6 mg` IV, that\'s `1 mL`.” Then, once given: “Atropine given.”',
              'Nod and give it',
              '“Are you sure?”',
            ],
            answer: 1,
            explain: 'Repeating the drug, dose and volume lets your consultant catch a mishearing before it reaches the patient, and saying “given” tells everyone it is done. Atropine comes as `600 mcg/mL`, so `0.6 mg` is `1 mL`.',
          },
          {
            q: 'The surgeon starts insufflating the abdomen and the heart rate falls from 70 to 38. Your consultant is across the room. What is the best thing to say?',
            options: [
              'Nothing yet: it usually recovers by itself',
              '“Could you stop insufflating, please? The heart rate is 38.” Then call your consultant over.',
              'Quietly draw up and give atropine without telling anyone',
              '“You\'re hurting the patient!”',
            ],
            answer: 1,
            explain: 'Insufflation can trigger a strong vagal reflex. The quickest fix is to stop the stimulus, so ask the surgeon clearly, with the fact, and get your consultant, who may ask for atropine (glycopyrrolate is slower, and suits a milder slowing). Practise it in the [scenario](#/practice/scenario/brady-pneumoperitoneum).',
          },
          {
            q: 'You are the PACU MO. Which of these should you take to the primary anaesthetist or a senior?',
            options: [
              'A patient who may need an HD or ICU bed',
              'Severe pain that has not settled with the usual treatment',
              'A drowsy patient breathing 7 times a minute',
              'A comfortable, stable patient with pain of 2 out of 10 who has had paracetamol',
            ],
            answer: [0, 1, 2],
            explain: 'Simple pain and nausea are yours to manage. Persistent or severe problems go to the primary anaesthetist, HD and ICU decisions go to a senior, and a drowsy patient breathing slowly needs help now (stimulate, oxygen, and see the [opioid overdose card](#/crisis/opioid-overdose)).',
          },
        ] },

        { t: 'links', items: [
          { text: 'Crisis cards', href: '#/crisis' },
          { text: 'Hypoxia (crisis card)', href: '#/crisis/hypoxia' },
          { text: 'Low blood pressure (crisis card)', href: '#/crisis/hypotension' },
          { text: 'Your job in PACU', href: '#/learn/pacu/pacu-job' },
          { text: 'Practice: drowsy and breathing slowly in PACU', href: '#/practice/scenario/pacu-drowsy' },
          { text: 'Flashcards: first actions in a crisis', href: '#/practice/cards/crisis' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ competencies
    {
      id: 'competencies',
      title: 'The functional MO',
      level: 'core',
      summary: "The handbook's list of what a working MO can do, before, during and after the operation, as checklists.",
      blocks: [
        { t: 'key', items: [
          'The handbook lists what a **functional medical officer (MO)** can do: before, during and after the operation.',
          'Use the three checklists as your goals for your first months. Tick an item when you can do it without prompting.',
          'Each item links to the topic that teaches it.',
          'Show the lists to your consultant and ask which items to work on next.',
        ] },
        { t: 'p', text: 'These are not a test. They describe what the department expects of an MO who is working well, so you know where you are heading. Your ticks are saved on this phone, and you can see them all on the [progress](#/progress) screen.' },

        { t: 'check', id: 'start-comp-preop', title: 'Before the operation', items: [
          'Take a thorough history and do a physical examination ([History by system](#/learn/preop/history)).',
          'Recognise the medical problems that matter for anaesthesia ([Special patients](#/learn/patients)).',
          'Know when a patient needs more tests or optimisation before surgery ([Which tests](#/learn/preop/investigations)).',
          'Do a thorough airway examination ([Airway assessment](#/learn/preop/airway)).',
          'Know the possible anaesthetic options for the operation ([Common operations](#/learn/cases)).',
          'Make a basic anaesthetic plan and counsel the patient ([Counselling and consent](#/learn/preop/counselling)).',
        ] },
        { t: 'check', id: 'start-comp-intraop', title: 'During the operation', items: [
          'Set up for a basic anaesthetic ([Before the patient comes in](#/learn/setup/before-patient)).',
          'Know the basic functions of the anaesthetic machine ([The machine](#/learn/setup/machine)).',
          'Apply the basic monitors and know what each one tells you ([Monitoring](#/learn/setup/monitoring)).',
          'Know the airway devices and choose the right one ([Airway equipment](#/learn/setup/airway-kit)).',
          'Know the basic pharmacology of the common drugs ([Induction drugs](#/learn/induction/induction-drugs)).',
          'Know when a rapid sequence induction is needed ([Rapid sequence induction](#/learn/induction/rsi)).',
          'Recognise, assess and manage events during the operation ([Breathing problems](#/learn/maintenance/problems-breathing), [circulation problems](#/learn/maintenance/problems-circulation)).',
          'Recognise when a patient meets the extubation criteria ([Ending a case](#/learn/emergence/end-of-case)).',
        ] },
        { t: 'check', id: 'start-comp-postop', title: 'After the operation', items: [
          'Know the monitoring a patient needs in the post-anaesthesia care unit (PACU) ([Your job in PACU](#/learn/pacu/pacu-job)).',
          'Know the basic options for pain relief after surgery ([Analgesic options](#/learn/pain-aps/analgesics)).',
          'Assess and manage pain, nausea and vomiting, blood pressure problems and low saturation ([Pain](#/learn/pacu/pain), [nausea](#/learn/pacu/ponv), [other problems](#/learn/pacu/pacu-problems)).',
          'Recognise when a patient can be discharged from PACU, and manage them if not ([Discharge](#/learn/pacu/discharge)).',
        ] },

        { t: 'h', text: 'Getting there' },
        { t: 'list', items: [
          'Pick one or two items a week. Read the topic the evening before, then ask to practise it.',
          'Ask for feedback at the end of the list: one thing you did well and one thing to work on.',
          'Test yourself in [Practice](#/practice): the scenarios rehearse the decisions, and the flashcards keep the numbers fresh.',
        ] },
        { t: 'script', title: 'Asking for what you want to learn', lines: [
          "Today I'd like to work on choosing airway devices. Could I choose and size the airway for the next case, and you tell me what you would do differently?",
          'Before we finish, could you give me one thing to work on?',
        ] },

        { t: 'links', items: [
          { text: 'Checklists and progress', href: '#/progress' },
          { text: 'Practice', href: '#/practice' },
          { text: 'Baby MO test', href: '../babymo/' },
        ] },
      ],
    },
  ],
};
