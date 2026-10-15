// Good practice: documentation and Epic, infection control and sharps, when something goes wrong, green anaesthesia,
// learning in the posting and looking after yourself. Handbook sources: conduct (page 4), recommended reading (page 3),
// green note (page 12), inhalational agents (page 33), PACU discharge note (page 30), smartphrases (page 38).
// Format: ../../CONTENT.md.
export default {
  id: 'good',
  title: 'Good practice',
  group: 'good',
  summary: 'Habits that last: good notes, infection control, what to do when something goes wrong, greener anaesthesia, learning and looking after yourself.',
  topics: [
    // ------------------------------------------------------------------ documentation
    {
      id: 'documentation',
      title: 'Documentation and Epic',
      level: 'core',
      summary: 'The anaesthetic chart, the pre-clerk and plan smartphrases, procedure notes, the PACU discharge note and recording counselling.',
      blocks: [
        { t: 'key', items: [
          'The chart is how the next person knows what happened: your consultant, the post-anaesthesia care unit (PACU) MO, the ward and the next anaesthetist.',
          '**Record every drug as you give it**: name, dose with its unit, route and time. Never save it all for the end of the case.',
          'Record events with their times and what you did: facts, not opinions or blame.',
          "Use the department's Epic smartphrases for the pre-clerk, the plan, the examination and the post-block instructions.",
          'Write down the counselling: the techniques and risks you discussed, and what the patient agreed to.',
          'Never change or delete an earlier entry. If you forgot something, add a late entry that says so.',
        ] },
        { t: 'p', text: 'In anaesthesia, notes are a safety tool, not paperwork. The department rule that the PACU MO checks the anaesthetic chart before giving any drug only works if the chart is complete. A dose of morphine that is not on the chart may be given again.' },

        { t: 'h', text: 'The anaesthetic chart' },
        { t: 'table', head: ['Part', 'What to record'], rowHead: true, rows: [
          ['Times', 'Anaesthesia start, induction, airway secured, incision, end of surgery, airway removed, out of theatre.'],
          ['Drugs', 'Every drug: name, dose with its unit, route and time. Infusions: the strength, the rate and every change. The antibiotic with its time, so the redose is not missed.'],
          ['Airway', 'How easy mask ventilation was, the device and size, the view at laryngoscopy (Cormack–Lehane grade), the number of attempts, aids used (bougie, video laryngoscope), tube length at the teeth.'],
          ['Access and monitors', 'Cannula size and site; arterial or central line; extra monitoring such as temperature or the bispectral index (BIS).'],
          ['Fluids and losses', 'Fluids and blood given; estimated blood loss; urine output if catheterised.'],
          ['Vital signs', 'If the monitor feeds the chart, check it is recording; if not, chart at least every `5 min`. Mark obvious artefacts (a cuff squeezed by the surgeon, a probe off a finger).'],
          ['Care and position', 'Position and pressure areas checked, eyes taped, warming, tourniquet times.'],
          ['Events', 'What happened, when, what you did and how the patient responded.'],
        ] },
        { t: 'callout', kind: 'tip', title: 'Chart as you go', text: 'Enter each drug as soon as your hands are free, with the time it was actually given. In a crisis, treat the patient first and ask someone (the anaesthetic unit (AU) nurse, or anyone free) to note the times and drugs on paper. Write it up as soon as the patient is stable.' },
        { t: 'callout', kind: 'stop', title: 'Never', items: [
          'Never change or delete an earlier entry to make the record look better. Add a new entry, dated and timed, that says it is a late entry or a correction.',
          'Never record a drug, a check or an event that you did not give, do or see.',
          'Never write opinions about blame or about colleagues in the notes. Write facts.',
        ] },

        { t: 'h', text: 'Before surgery: the pre-clerk and the plan' },
        { t: 'callout', kind: 'local', title: 'Epic smartphrases at NTFGH', items: [
          '**ANAPRECLERK**: the pre-clerking template, for premeds and emergency cases.',
          '**NGEMRANAESPLAN**: the anaesthesia plan.',
          '**NGEMRANAESPHYONLY**: the physical examination.',
          '**POSTPNBINSTR1**: instructions after a peripheral nerve block.',
          '**POSTSPINAL**: instructions after a spinal.',
        ] },
        { t: 'p', text: 'A good pre-op note lets someone who has never met the patient give a safe anaesthetic. Include the ASA grade; each illness with how severe and how well controlled it is; the medicines (which continue, which were stopped and when the last dose was); allergies **with the reaction**; previous anaesthetics and any problems; the airway findings; fasting times; results that matter; the plan; and which consultant you discussed it with.' },

        { t: 'h', text: 'Recording counselling' },
        { t: 'p', text: '“Risks explained” tells the next reader nothing. Write which techniques you discussed, the main risks you named, the pain relief plan, that questions were answered, and whether an interpreter or family member helped. Counsel for every technique that might be used, without promises: the anaesthetist on the day decides.' },
        { t: 'callout', kind: 'note', title: 'An example counselling note', text: 'Counselled for general anaesthesia (GA) with a supraglottic airway, possibly a tracheal tube. Discussed: sore throat, nausea and vomiting, damage to teeth (crown on an upper incisor noted), drowsiness; rare: severe allergy, awareness; very rare: heart attack, stroke, death. Pain relief: paracetamol, an anti-inflammatory, oxycodone as needed. Questions answered. Patient agrees to proceed.' },

        { t: 'h', text: 'After a block or spinal' },
        { t: 'list', items: [
          '**A procedure note**: consent, asepsis, the block and side, ultrasound or not, the needle, the drug with its strength and volume, the number of attempts, any problem, and who did and who supervised it.',
          '**Post-block instructions** with **POSTPNBINSTR1** or **POSTSPINAL**.',
          '**A referral to the acute pain service (APS)**, so the patient is followed up.',
        ] },

        { t: 'h', text: 'In PACU' },
        { t: 'p', text: 'Record what you assessed, each drug you gave and why, and how the patient responded. Every patient needs a **PACU discharge note**, including those going to the high dependency (HD) unit, whom the primary anaesthetic MO takes there.' },

        { t: 'h', text: 'When something unusual happens' },
        { t: 'list', items: [
          '**A difficult airway**: what was hard (mask, laryngoscopy, tube), the Cormack–Lehane grade, what worked (device, blade, bougie) and what did not. The patient is told and given an airway alert letter; your consultant leads this.',
          '**A suspected allergic reaction**: the time of each drug, the signs, the treatment, and the times blood was taken for tryptase. Your consultant arranges the allergy referral.',
          '**Any other event** (a drug error, a damaged tooth, an unplanned admission to the intensive care unit): see [When something goes wrong](#/learn/good/incidents).',
        ] },

        { t: 'quiz', id: 'good-doc-q', items: [
          {
            q: 'During a busy induction you give `100 mcg` of phenylephrine and `5 mg` of ephedrine. When do you record them?',
            options: [
              'At the end of the case, from memory',
              'As soon as your hands are free, with the times they were actually given',
              'Only if the blood pressure stays low',
              'Leave it to the AU nurse',
            ],
            answer: 1,
            explain: 'Memory fails after a busy case, and your consultant and the PACU MO rely on the chart to know what was given and when. Record each drug with its real time as soon as you can; in a crisis, ask someone to note the times.',
          },
          {
            q: 'The next morning you realise you did not chart `5 mg` of morphine you gave at about 10.40 yesterday. What do you do?',
            options: [
              'Nothing: the patient is fine now',
              'Edit yesterday\'s record so it looks as if it was written at the time',
              'Add a late entry, dated and timed now, saying morphine `5 mg` IV was given at about 10.40, and tell your consultant',
              'Ask the PACU nurse to add it to her notes',
            ],
            answer: 2,
            explain: 'A late entry that says it is late is honest and perfectly acceptable. Changing a record so it looks contemporaneous is never acceptable, and Epic keeps an audit trail of every change. The missing dose may also matter to whoever is giving the patient opioids now.',
          },
          {
            q: 'Which counselling note is most useful?',
            options: [
              'Risks explained. Consent taken.',
              'GA risks discussed. Patient happy.',
              'Counselled for spinal with sedation, possible conversion to GA. Discussed: failure and conversion to GA, headache, low blood pressure, rare nerve damage; for GA: sore throat, nausea, damage to teeth, rare severe allergy. Questions answered; agrees.',
              'Patient counselled as per department guidelines.',
            ],
            answer: 2,
            explain: 'A useful note says what was offered and which risks were named, so anyone can see what the patient was told. The others could mean anything, and would not help you or the patient if questions came up later.',
          },
          {
            q: 'Your consultant had a difficult intubation with a video laryngoscope and a bougie. What belongs in the record? (Choose all that apply.)',
            options: [
              'The Cormack–Lehane grade',
              'What worked: the device, the blade and the bougie',
              'How easy mask ventilation was, and the number of attempts',
              'Your view on whose fault it was',
              'That the patient will be told and given an airway alert letter',
            ],
            answer: [0, 1, 2, 4],
            explain: 'The next anaesthetist needs to know what was hard and what worked, so they can plan before induction rather than discover it. Telling the patient (led by your consultant) means they can warn future teams. Blame and opinion never go in the notes.',
          },
        ] },

        { t: 'links', items: [
          { text: 'Seeing your premeds', href: '#/learn/preop/premeds' },
          { text: 'Counselling and consent', href: '#/learn/preop/counselling' },
          { text: 'Handing over to PACU', href: '#/learn/emergence/handover' },
          { text: 'Discharge from PACU', href: '#/learn/pacu/discharge' },
          { text: 'Premed summary builder', href: '#/tools/premed' },
          { text: 'PACU handover builder', href: '#/tools/handover' },
          { text: 'Flashcards: NTFGH rules and where things are', href: '#/practice/cards/local', note: 'includes the smartphrases' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ infection
    {
      id: 'infection',
      title: 'Infection control and sharps',
      level: 'core',
      summary: 'One needle, one syringe, one patient; clean hands and aseptic technique; protection for aerosol-generating procedures; sharps and needlestick injuries.',
      blocks: [
        { t: 'key', items: [
          '**One needle, one syringe, one patient, once.** Never reuse a syringe or share a vial between patients.',
          'Clean your hands before you touch the patient, the IV line or the drugs, and **change gloves after handling the airway**.',
          'Use an **aseptic non-touch technique** for drugs and lines, and **full asepsis** for spinals, epidurals and central lines.',
          'For aerosol-generating procedures in a patient with a respiratory infection, wear a fit-tested N95 respirator, eye protection, a gown and gloves.',
          'Put your own sharps in the sharps bin straight away. Never resheath a needle by hand.',
          'After a needlestick or splash: first aid, tell your consultant, and **report it at once**.',
        ] },
        { t: 'p', text: "Gloved hands go from the patient's mouth to the drug tray, the machine and the IV ports, and bacteria in a syringe or a three-way tap go straight into the bloodstream. Simple habits, done every time, prevent this." },
        { t: 'callout', kind: 'stop', title: 'Never', items: [
          'Never put a used needle or syringe back into a vial or bag, even for the same patient. Use a new needle and syringe each time you draw up.',
          'Never use one vial, ampoule or bag for more than one patient.',
          'Never give a syringe drawn up for one patient to another, and never carry syringes in your pocket.',
        ] },

        { t: 'h', text: 'Clean hands' },
        { t: 'p', text: 'Use alcohol rub, or soap and water when your hands are visibly dirty, at the five moments: before touching the patient; before a clean or aseptic task (drawing up, giving drugs, cannulation); after possible contact with body fluids; after touching the patient; and after touching their surroundings.' },
        { t: 'callout', kind: 'tip', text: 'After intubation or inserting a supraglottic airway, take off the gloves that touched the mouth and clean your hands **before** you touch the drugs, the IV line or the machine. Put the used laryngoscope blade where it cannot touch anything clean.' },

        { t: 'h', text: 'Drugs and IV lines: aseptic non-touch technique' },
        { t: 'p', text: 'Aseptic non-touch technique (ANTT) means you never touch the **key parts**, the parts that must stay sterile: the syringe tip, the needle, the plunger shaft, the cannula hub and the injection port.' },
        { t: 'list', items: [
          'Wipe the rubber top of every vial with alcohol and let it dry before the needle goes in.',
          'Draw up on a clean tray, close to the time of use, and keep each syringe tip capped.',
          '**Scrub the hub**: clean the injection port with an alcohol wipe and let it dry before each injection, especially on a central line.',
          'Propofol supports bacterial growth. Draw it up just before use and discard it at the end of the case, or after `6 h`, whichever is sooner.',
          'Keep three-way taps capped; replace a cap that has been dropped or touched.',
        ] },

        { t: 'h', text: 'Spinals, epidurals and central lines: full asepsis' },
        { t: 'p', text: 'Infection here means meningitis, an epidural abscess or a bloodstream infection. The operator scrubs and wears a cap, mask, sterile gown and sterile gloves, with a large sterile drape. Everyone near the sterile field wears a mask: bacteria from the mouth can cause meningitis after a spinal.' },
        { t: 'callout', kind: 'warn', title: 'Chlorhexidine and the spinal tray', text: 'The skin is cleaned with chlorhexidine in alcohol and **left to dry fully** before the needle goes in. Keep it away from the spinal needle and drugs: chlorhexidine is toxic to nerves. Apply it before the spinal pack is opened, or keep it well apart, as your consultant shows you.' },

        { t: 'h', text: 'Personal protective equipment (PPE)' },
        { t: 'p', text: '**Standard precautions** apply to every patient: gloves for contact with blood, body fluids, mucous membranes or broken skin, and eye protection where splashes are likely. **Aerosol-generating procedures** include mask ventilation, intubation, extubation, open suctioning, high-flow nasal oxygen and bronchoscopy.' },
        { t: 'list', items: [
          '**Known or suspected airborne or droplet infection** (tuberculosis, influenza, COVID-19): a fit-tested N95 respirator, eye protection or a face shield, a gown and gloves for everyone in the room during the procedure.',
          'Keep the fewest people in the room, let the most experienced person manage the airway, and keep a filter on the breathing circuit.',
          '**Contact precautions** (for example, meticillin-resistant Staphylococcus aureus (MRSA)): gown and gloves, and clean or discard equipment afterwards.',
          'Take PPE off slowly, in the order you were taught, cleaning your hands as you go: this is when most self-contamination happens.',
        ] },

        { t: 'h', text: 'Sharps' },
        { t: 'list', items: [
          'Whoever uses a sharp disposes of it, straight into a sharps bin at the point of use. Take the bin to the bedside for cannulas and blocks.',
          'Never resheath a needle by hand. If you must recap, use the one-handed scoop with the cap lying on the tray.',
          'Never leave needles on the drapes, the trolley or the bed for someone else to find.',
          'Close and replace a sharps bin when it reaches the fill line.',
        ] },

        { t: 'h', text: 'After a needlestick or splash' },
        { t: 'steps', items: [
          { title: 'First aid.', text: 'Encourage the wound to bleed gently under running water and wash it with soap. Do not scrub or suck it. Rinse splashes to the eyes or mouth with plenty of water.' },
          { title: 'Tell your consultant.', text: 'Make sure the patient is safe and someone takes over, so you can go.' },
          { title: 'Report it at once.', text: "Follow the hospital's needlestick injury protocol: it tells you where to go, day or night, and how blood is tested from you and, with consent, from the patient." },
          { title: 'Do not wait.', text: 'If the source might carry human immunodeficiency virus (HIV), preventive medicines (post-exposure prophylaxis) work best when started within hours. Know your own hepatitis B vaccination and antibody status.' },
          { title: 'File an incident report', text: 'and go to every follow-up appointment.' },
        ] },

        { t: 'quiz', id: 'good-infection-q', items: [
          {
            q: 'Mid-case, your `20 mL` propofol syringe is empty and your consultant wants more for the same patient. What do you do?',
            options: [
              'Refill the same syringe from a new ampoule: it is the same patient',
              'Use a new syringe and needle with a new ampoule, and label it',
              'Draw it from the open vial left over from the last patient',
              'Ask the AU nurse to refill your syringe using the needle from before',
            ],
            answer: 1,
            explain: 'Syringes and needles are single use. Once a syringe has been connected to the line it can carry blood and bacteria, and reusing it to draw up again is how outbreaks of hepatitis and bloodstream infection have happened. Propofol is a good growth medium, and vials are never shared between patients.',
          },
          {
            q: 'You have just inserted a supraglottic airway. Your gloves touched the mouth. Next the antibiotic is due. What do you do first?',
            options: [
              'Give it now: the gloves look clean',
              'Take off the gloves, clean your hands, then give it through a port you have wiped',
              'Wipe your gloves with an alcohol wipe and give it',
              'Put a new pair of gloves on over the old ones',
            ],
            answer: 1,
            explain: 'Saliva carries many bacteria, and gloves that look clean are not. Taking them off and cleaning your hands before touching the IV line is the single most useful habit at induction.',
          },
          {
            q: 'An emergency patient with suspected tuberculosis needs intubation. What should the airway team wear? (Choose all that apply.)',
            options: [
              'A fit-tested N95 respirator',
              'Eye protection or a face shield',
              'A gown and gloves',
              'A surgical mask is enough for intubation',
            ],
            answer: [0, 1, 2],
            explain: 'Intubation and mask ventilation can spread infectious aerosols. A surgical mask does not seal or filter well enough against airborne infection; the respirator must be one you have been fit-tested for.',
          },
          {
            q: 'Clearing up, a hollow needle you used for a cannula pricks your finger. The patient is stable. What do you do?',
            options: [
              'Carry on and report it at the end of the list',
              'Squeeze it hard and scrub it with an alcohol wipe',
              'Let it bleed gently under running water, wash with soap, tell your consultant and report it at once',
              'Wait to see whether the patient has any infections on their blood tests',
            ],
            answer: 2,
            explain: 'A hollow needle that has been in a vein is the highest-risk injury. Preventive treatment for HIV works best when started within hours, so report it straight away; your consultant will arrange cover. Scrubbing and squeezing hard damage the skin and do not help.',
          },
        ] },

        { t: 'links', items: [
          { text: 'Drug safety', href: '#/learn/start/drug-safety' },
          { text: 'How a list runs, start to finish', href: '#/learn/start/the-list', note: 'between cases' },
          { text: 'Helping with a spinal', href: '#/learn/regional/spinal-help' },
          { text: 'Antibiotic prophylaxis', href: '#/learn/maintenance/antibiotics' },
          { text: 'When something goes wrong', href: '#/learn/good/incidents' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ incidents
    {
      id: 'incidents',
      title: 'When something goes wrong',
      level: 'core',
      summary: 'A drug error, a near miss or a critical event: treat, tell, keep the evidence, record, report, explain, debrief, and look after yourself.',
      blocks: [
        { t: 'key', items: [
          '**Treat the patient first**, and call for help.',
          '**Tell your consultant straight away**, even when no harm was done. Never hide an error or a near miss.',
          'Keep the evidence: ampoules, syringes, bags and faulty equipment.',
          'Write the facts in the notes, then file an **incident report** the same day.',
          'Telling the patient and family (open disclosure) is led by your consultant.',
          'Debrief with the team, and look after yourself: this happens to good doctors.',
        ] },
        { t: 'p', text: 'Everyone who gives anaesthetics makes or nearly makes a mistake at some point: a syringe swap, a wrong dose, a missed allergy, a chipped tooth. What matters is what you do next. Prompt, honest reporting protects the patient and you, and it is how the department finds the traps (look-alike ampoules, confusing pumps, a missed check) and removes them.' },

        { t: 'h', text: 'What to do' },
        { t: 'steps', items: [
          { title: 'Treat the patient.', text: 'Call for help and open the crisis card if needed. Think about the effects of what was given and whether there is an antidote (naloxone for opioids, flumazenil for benzodiazepines, sugammadex for rocuronium).' },
          { title: 'Tell your consultant now.', text: 'Not at the end of the list. They need to know to care for the patient, and they will support you.' },
          { title: 'Keep the evidence.', text: 'Keep the ampoules, syringes and infusion bags. Take faulty equipment out of use and label it; do not reset or clean it.' },
          { title: 'Record the facts.', text: 'In the chart: the time, what happened, what was done and how the patient responded. Write it as soon as the patient is stable, and say if it was written afterwards. No opinions, no blame.' },
          { title: 'File an incident report.', text: "The same day, in the hospital's incident reporting system. Near misses count. Your consultant can help you write it." },
          { title: 'Tell the patient.', text: 'Your consultant leads open disclosure: an honest explanation, an apology, what is being done and what happens next. You may be asked to be there.' },
          { title: 'Debrief.', text: 'A short team debrief straight afterwards, and a longer talk with your consultant later.' },
        ] },
        { t: 'script', title: 'Telling your consultant', lines: [
          'I need to tell you about a drug error. At 10.15 I gave `8 mg` of ondansetron instead of dexamethasone: the ampoules look alike.',
          'She is stable: heart rate 72, blood pressure 118/70. I have kept both ampoules.',
          'I have not given the dexamethasone yet. What would you like me to do?',
        ] },

        { t: 'h', text: 'Events you may meet' },
        { t: 'dl', items: [
          { term: 'A syringe swap or a wrong dose', def: 'Treat the effect, give the antidote if there is one, and monitor for as long as the drug lasts. If a muscle relaxant reaches an awake patient, they need to be anaesthetised and ventilated at once: say it out loud and get help.' },
          { term: 'A damaged or missing tooth', def: 'Find the missing piece: look in the mouth, the airway device and the floor, and tell your consultant (a chest X-ray may be needed if it is not found). Record it and make sure the patient is told; a dental review is arranged.' },
          { term: 'A patient says they were awake', def: 'Take it seriously. Listen, write down what they remember in their own words, and tell the consultant who gave the anaesthetic. The patient is offered follow-up and support.' },
          { term: 'Faulty equipment', def: 'Keep the patient safe (see [Oxygen, ventilator or power failure](#/crisis/equipment-failure)), take the item out of use, label it and report it.' },
        ] },
        { t: 'callout', kind: 'stop', title: 'Never', items: [
          'Never hide or play down an error, even one that did no harm.',
          'Never change the chart after the event to make it look better; add a late entry.',
          'Never throw away the ampoules, or reset equipment, involved in an incident.',
        ] },
        { t: 'callout', kind: 'tip', title: 'Reporting is for learning', text: 'An incident report is not a confession or a complaint about a colleague. It describes what happened so the system can be made safer. Near misses (“I nearly gave…”) are among the most useful reports, because they show the trap before anyone is hurt.' },
        { t: 'p', text: 'After a serious event it is normal to feel shaken, to replay it, or to dread the next case. Talk to your consultant, to colleagues and to people at home. See [Looking after yourself](#/learn/good/wellbeing).' },

        { t: 'quiz', id: 'good-incidents-q', items: [
          {
            q: 'You realise you have just given `8 mg` of ondansetron instead of `8 mg` of dexamethasone. The patient is stable. What do you do first?',
            options: [
              'Nothing: ondansetron at that dose is harmless',
              'Tell your consultant now, keep the ampoules, and record what was actually given',
              'Quietly give the dexamethasone as well and chart both',
              'File an anonymous incident report later without telling anyone',
            ],
            answer: 1,
            explain: 'Even a harmless error is told and reported. Your consultant needs to know what the patient has had (and may still want the dexamethasone), and the report shows the department a look-alike trap before it causes harm.',
          },
          {
            q: 'After intubation you notice a chip missing from an upper front tooth, and you cannot see the piece. What do you do first?',
            options: [
              'Write it up after the case',
              'Look for the fragment in the mouth, the airway device and the floor, and tell your consultant now',
              'Assume the tooth was already damaged',
              'Mention it to the patient in PACU if they ask',
            ],
            answer: 1,
            explain: 'A fragment of tooth can be inhaled into a lung. If it cannot be found, your consultant may want a chest X-ray. Then record it, and the patient is told and offered a dental review.',
          },
          {
            q: 'In PACU, a patient tells you she heard voices and could not move during her operation. What do you do?',
            options: [
              'Reassure her it was a dream caused by the drugs',
              'Listen, record what she remembers in her own words, and tell the consultant who gave the anaesthetic',
              'Tell her to raise it with the surgeon',
              'Give her midazolam so she forgets',
            ],
            answer: 1,
            explain: 'Awareness can cause lasting distress, and being believed matters. Her account is recorded and her anaesthetist arranges follow-up and support. Dismissing it, or sedating her, makes things worse.',
          },
          {
            q: 'A drug error caused the patient harm. Who leads telling the patient and family?',
            options: [
              'You, alone, because you gave the drug',
              'Your consultant, and you may be asked to be there',
              'The surgeon',
              'No one: the incident report covers it',
            ],
            answer: 1,
            explain: 'Open disclosure is led by the consultant: an honest explanation, an apology for what happened, and the plan. Being there, with support, is how you learn to do it yourself one day.',
          },
        ] },

        { t: 'links', items: [
          { text: 'Drug safety', href: '#/learn/start/drug-safety' },
          { text: 'How to call for help and speak up', href: '#/learn/start/calling-for-help' },
          { text: 'Documentation and Epic', href: '#/learn/good/documentation' },
          { text: 'Looking after yourself', href: '#/learn/good/wellbeing' },
          { text: 'Crisis cards', href: '#/crisis' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ green
    {
      id: 'green',
      title: 'Green anaesthesia',
      level: 'core',
      summary: 'Why anaesthesia warms the planet, and what you can do: the right agent, low flows, less waste and proper recycling.',
      blocks: [
        { t: 'key', items: [
          'Anaesthesia makes a lot of waste, and **all inhalational agents are greenhouse gases**.',
          '**Desflurane** has by far the biggest warming effect; at NTFGH it is not kept in theatre and has to be requested.',
          '**Nitrous oxide** stays in the atmosphere for about `109` years. Use it only when there is a reason.',
          'Once the agent level is steady, **turn the fresh gas flow down**, as your consultant prefers. Total intravenous anaesthesia (TIVA) or a regional technique suits some patients.',
          "**Don't draw up drugs or open kit you won't use.**",
          'Recycle properly: separated, clean items only, nothing stained with blood.',
        ] },
        { t: 'p', text: 'Volatile agents are barely broken down in the body: almost all of what the vaporiser delivers is breathed out, scavenged and vented to the atmosphere, where it traps heat. Add the plastics, drugs and packaging of every case, and the operating theatre is one of the most carbon-intensive places in a hospital. Small habits from every anaesthetist add up.' },

        { t: 'h', text: 'The gases' },
        { t: 'table', head: ['Agent', 'Lasts in the air', 'Warming effect', 'At NTFGH'], rowHead: true, rows: [
          ['Sevoflurane', 'About 1 year', 'The lowest of the three', 'Our usual volatile'],
          ['Desflurane', 'About 14 years', 'The highest: tens of times more than sevoflurane for the same anaesthetic', 'Not kept in theatre; must be requested'],
          ['Nitrous oxide', 'About `109` years', 'High, because large volumes are used; it also damages the ozone layer', 'Use only with a clear reason'],
        ] },
        { t: 'callout', kind: 'local', title: 'The handbook on the agents', items: [
          'Desflurane: faster on and off, but it irritates the airway (laryngospasm, bronchospasm), is expensive and has the highest global warming potential.',
          'Sevoflurane: sweet smelling and non-irritant, so it is used for gas induction. It forms compound A at fresh gas flows below `2 L/min` (nephrotoxic in rats).',
          'Nitrous oxide: cheap, with less myocardial depression, and it lowers the volatile needed; but it expands gas-filled spaces, raises pulmonary vascular resistance, causes vomiting, lowers the inspired oxygen, and lasts about `109` years in the atmosphere.',
        ] },

        { t: 'h', text: 'What you can do in theatre' },
        { t: 'list', items: [
          '**Low flows once steady.** Use high flows to wash the agent in and out, then turn the fresh gas down: many consultants use `0.5–1 L/min`. Compound A has never been shown to harm human kidneys, but follow your consultant\'s choice. At low flows, watch the end-tidal agent and the inspired oxygen, not the dial.',
          '**Turn the gas off** between cases and whenever no one is connected to the circuit.',
          "**Ask about the technique.** TIVA or a regional technique avoids volatiles where it suits the patient; the choice is your consultant's.",
          '**Draw up only what you are likely to use** (a handbook rule). The emergency drugs stay as vials in elective theatre unless your consultant asks.',
          '**Open kit only when it is needed**: syringes, giving sets, airway devices.',
          '**Never pour propofol or other drugs down the sink.** Ask the anaesthetic unit (AU) nurse which bin unused drugs go in.',
          'Turn off the forced-air warmer and other devices when they are not in use.',
        ] },

        { t: 'h', text: 'Recycling in theatre' },
        { t: 'callout', kind: 'local', title: 'The green note', items: [
          'Each theatre should have bags for plastic and bags or boxes for cardboard and paper. If they are missing, ask the AU nurse.',
          'Recyclables must be **separated**, or they go out with the general rubbish.',
          'Empty IV fluid bags go **beside** the recycling bags; the AU nurse clears them.',
          'Only **clean, uncontaminated** items go in the recycling: nothing stained with blood and nothing that may be infectious.',
        ] },
        { t: 'p', text: 'Good for recycling: syringe and glove wrappers, plastic packaging, cardboard boxes. Never in the recycling: sharps and glass ampoules (sharps bin), and anything with blood or body fluids on it (clinical waste). Anything with a patient label on it is confidential waste.' },

        { t: 'quiz', id: 'good-green-q', items: [
          {
            q: 'For the same length of anaesthetic, which has the biggest greenhouse effect?',
            options: ['Sevoflurane', 'Desflurane', 'Propofol TIVA', 'Oxygen and air'],
            answer: 1,
            explain: 'Desflurane is a far more potent greenhouse gas than sevoflurane, lasts about 14 years in the atmosphere, and is used at about three times the concentration. That is one reason it is not kept in theatre at NTFGH. TIVA has a much smaller footprint, though propofol must never go down the sink.',
          },
          {
            q: 'Fifteen minutes into a case on sevoflurane, the end-tidal level is steady and the fresh gas flow is still `6 L/min`. What is the greener step?',
            options: [
              'Leave it: high flows are always safer',
              'Ask your consultant about turning the flow down, then watch the end-tidal agent and inspired oxygen',
              'Switch to desflurane so the patient wakes faster',
              'Turn the vaporiser off for a while',
            ],
            answer: 1,
            explain: 'High flows are useful to change the level quickly, but once it is steady most of that gas goes straight to the scavenger. Lower flows waste far less. The handbook mentions compound A below `2 L/min`, so follow your consultant\'s choice, and at low flows trust the end-tidal numbers rather than the dial.',
          },
          {
            q: 'Clearing up after a case, which can go in the recycling? (Choose all that apply.)',
            options: [
              'The cardboard box from a giving set',
              'Clean plastic syringe wrappers',
              'A drape wrapper with blood on it',
              'An empty glass ampoule',
            ],
            answer: [0, 1],
            explain: 'Only clean, separated items can be recycled; one blood-stained item can send the whole bag to general or clinical waste. Glass ampoules go in the sharps bin.',
          },
        ] },

        { t: 'links', items: [
          { text: 'Depth of anaesthesia', href: '#/learn/maintenance/depth', note: 'the agents and MAC values' },
          { text: 'Ventilator basics and fresh gas flow', href: '#/learn/maintenance/ventilation' },
          { text: 'TIVA, TCI pumps and EEG monitoring', href: '#/learn/setup/tiva-eeg' },
          { text: 'The drug trolley and E-drugs', href: '#/learn/setup/trolley' },
          { text: 'Sevoflurane', href: '#/drugs/sevoflurane' },
          { text: 'Nitrous oxide', href: '#/drugs/nitrous-oxide' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ learning
    {
      id: 'learning',
      title: 'Learning in the posting',
      level: 'core',
      summary: "Reading the night before, the department's books and websites, teaching, feedback, the Baby MO test and this guide's Practice section.",
      blocks: [
        { t: 'key', items: [
          "**Read up the next day's cases** the evening before: the patients, the operations and the drugs.",
          'Every case with a consultant is a tutorial. Ask your questions at quiet moments.',
          'Go to the department teaching sessions: attendance is taken.',
          '**Ask for feedback**, specifically and often.',
          'Pass the **Baby MO test** before you start calls.',
          "Use this guide's **Practice** section a little every day: scenarios, flashcards and check-yourself questions.",
        ] },
        { t: 'p', text: 'Anaesthesia is learned at the bedside, one case at a time, with a consultant beside you. You learn fastest when you arrive knowing a little about the patient and the operation, have one thing you want to learn from the case, and spend two minutes afterwards on what went well and what you would change.' },

        { t: 'h', text: 'The evening before' },
        { t: 'steps', items: [
          { title: 'Your premeds.', text: "What is each patient's main problem, and how does it change the anaesthetic?" },
          { title: 'The operations.', text: 'Position, length, blood loss, pain afterwards and the usual anaesthetic: see [Common operations](#/learn/cases).' },
          { title: 'The drugs.', text: 'Look up the doses for each patient in the [Drugs](#/drugs) tab.' },
          { title: 'What could go wrong.', text: 'Read the one or two [crisis cards](#/crisis) that fit the list, such as a difficult airway, bleeding or bronchospasm.' },
          { title: 'One question.', text: 'Bring one thing to ask your consultant, or one skill you want to practise.' },
        ] },

        { t: 'h', text: 'In theatre' },
        { t: 'list', items: [
          'Ask in the quiet middle of a case, not during induction, emergence or a crisis.',
          'Choose one skill a day (mask ventilation, a supraglottic airway, a clear premed presentation) and tell your consultant.',
          'Keep a simple log of the cases and procedures you do, with no names or other details that could identify a patient.',
          'That evening, look up anything you did not understand, while it is fresh.',
        ] },

        { t: 'h', text: 'Books and websites' },
        { t: 'callout', kind: 'local', title: 'Recommended by the department', items: [
          '**Oxford Handbook of Anaesthesia**: the pocket reference for conditions and operations.',
          '**Drugs in Anaesthesia and Intensive Care**: the facts on each drug.',
          '**Clinical Anesthesia Procedures of the Massachusetts General Hospital**: practical, step by step.',
          '**BJA Education** (bjaed.org): short, evidence-based reviews.',
          '**WFSA tutorial of the week** (wfsahq.org): free tutorials, one topic each.',
          '**NYSORA** (nysora.com) and **USRA** (usra.ca): regional anaesthesia.',
        ] },
        { t: 'p', text: 'This site also has teaching pages on the [airway](../airway.html) and [regional anaesthesia](../regional.html), including interactive guides to [spinal anaesthesia](../spinal/) and nerve blocks.' },

        { t: 'h', text: 'Teaching and feedback' },
        { t: 'p', text: 'Department teaching sessions are part of the job, and attendance is taken and monitored. If you are presenting, prepare early and ask a consultant to look over it.' },
        { t: 'p', text: 'Feedback is most useful when it is specific and soon after the event. Ask at the end of a case or a list, write down the one point to work on, and try it the next day. Take it as help, not criticism: your consultants want you to do well.' },
        { t: 'script', title: 'Asking for feedback', lines: [
          'Could you give me one thing I did well in that induction, and one thing to do differently next time?',
          'Tomorrow I would like to work on mask ventilation. Could you watch and tell me what to change?',
        ] },

        { t: 'h', text: 'The Baby MO test' },
        { t: 'p', text: "The department's test for new MOs. You start calls only once you have passed it. The core topics in [Learn](#/learn), the drug doses, the crisis cards and the flashcards here are good preparation. Find it at [the Baby MO test](../babymo/)." },

        { t: 'h', text: 'Using this guide to learn' },
        { t: 'list', items: [
          '**Little and often beats cramming**: ten minutes of flashcards a day, and you will know the doses and numbers by the end of the month.',
          '**Test yourself before you read**: try the check-yourself questions first, then read up on what you got wrong.',
          '**Scenarios** let you make crisis decisions safely, as many times as you like.',
          'Mark topics as read and tick the checklists: your progress stays on this phone.',
        ] },
        { t: 'scenario', id: 'first-induction' },
        { t: 'check', id: 'good-learning-month1', title: 'My first month of learning', items: [
          'Read every topic in Start here.',
          'Read every crisis card once.',
          'Learn the drug doses and how-to-draw-up flashcards.',
          'Learn the numbers-to-know flashcards.',
          'Do every core scenario.',
          'Ask for specific feedback at least once a week.',
          'Go to the department teaching sessions.',
          'Present a premed list to a consultant clearly in under two minutes.',
          'Pass the Baby MO test.',
        ] },

        { t: 'links', items: [
          { text: 'The functional MO', href: '#/learn/start/competencies', note: 'what you should be able to do' },
          { text: 'Flashcards: drug doses', href: '#/practice/cards/doses' },
          { text: 'Flashcards: numbers to know', href: '#/practice/cards/numbers' },
          { text: 'Practice: scenarios, flashcards and check yourself', href: '#/practice' },
          { text: 'Baby MO test', href: '../babymo/' },
          { text: 'MMed exam prep', href: '../exams/', note: 'for those heading for anaesthesia training' },
        ] },
      ],
    },

    // ------------------------------------------------------------------ wellbeing
    {
      id: 'wellbeing',
      title: 'Looking after yourself',
      level: 'beyond',
      summary: 'Fatigue after calls, food and breaks, asking for relief, coping after a bad event, and looking out for each other.',
      blocks: [
        { t: 'key', items: [
          '**Fatigue is a safety problem**, in theatre and on the drive home after a call.',
          'Eat, drink and take breaks. Asking for relief is normal and expected.',
          'Never leave an anaesthetised patient without handing over to another anaesthetist.',
          'After a bad event it is normal to be shaken. **Debrief and talk to someone.**',
          "If you are struggling, tell someone early: your consultant, a senior you trust, or the hospital's staff support.",
          'Look out for your colleagues, and they will look out for you.',
        ] },
        { t: 'p', text: 'The first months in anaesthesia are tiring: early starts, new skills, calls and a new weight of responsibility. Looking after yourself is not a luxury. A tired, hungry or distressed doctor makes more mistakes.' },

        { t: 'h', text: 'Fatigue and calls' },
        { t: 'p', text: 'After about 17 hours awake, your reactions and judgement are about as impaired as after a moderate amount of alcohol; after 24 hours, about as impaired as someone over the legal driving limit. You will not fully notice it yourself.' },
        { t: 'list', items: [
          'Sleep well before a call, and nap beforehand if you can.',
          'On a quiet night, a short nap of about 20 minutes helps, and you can still be woken.',
          'Caffeine helps for a few hours; avoid it in the hours before you plan to sleep.',
          'If you notice yourself rereading the same line or losing track, tell your senior before something goes wrong.',
          '**Post call, think before you drive.** If you are struggling to stay awake, nap first or take a taxi or public transport home.',
        ] },

        { t: 'h', text: 'Food, drink and breaks' },
        { t: 'list', items: [
          'Eat before the list, and keep a snack and a water bottle in the staff room (not in theatre).',
          'The reliever (*) is there to give breaks. If you have not had one, ask your consultant or the OT coordinator (OTC).',
          'In the post-anaesthesia care unit (PACU) you are present at all times; for an urgent break, tell the OTC and the advanced practice nurse (APN) first.',
        ] },
        { t: 'callout', kind: 'stop', text: 'Never leave an anaesthetised or sedated patient without a full handover to another anaesthetist who has agreed to take over. “I\'ll only be a minute” is not a handover.' },
        { t: 'script', title: 'Asking for a break', lines: [
          'I have not had a break since seven and I am getting tired. Could someone relieve me for fifteen minutes once she is stable?',
        ] },

        { t: 'h', text: 'After a bad event' },
        { t: 'p', text: 'A death, a cardiac arrest, a serious error or a frightening airway affects everyone in the room. Replaying it, poor sleep, guilt, anger and dreading the next case are normal reactions, and they usually ease over a few weeks. This is sometimes called being the “second victim”.' },
        { t: 'list', items: [
          'Take part in the team debrief, and ask your consultant to go through it with you later.',
          'Talk to someone: a colleague, a senior, family or friends (without patient details).',
          'It is fine to ask for a short break before the next case.',
          'Eat, sleep, and keep doing the things that help you outside work.',
        ] },
        { t: 'callout', kind: 'warn', title: 'Get help early', items: [
          "If the feelings do not ease after a few weeks, or you dread coming to work, sleep badly or feel low, talk to your consultant or a senior you trust, and use the hospital's confidential staff support.",
          'If you ever have thoughts of harming yourself, tell someone **today**, or go to the emergency department.',
          'Anaesthetists work close to powerful drugs. If you are worried that you, or a colleague, may be misusing them, speak to a consultant you trust. Asking early protects lives and careers.',
        ] },

        { t: 'h', text: 'The team' },
        { t: 'p', text: 'The handbook reminds you that you are part of a team. Learn names, thank people, offer help when your list ends early, and check in on a colleague after a hard case or a busy call. If someone treats you badly, step away from the moment and tell a consultant you trust: you do not have to deal with it alone.' },
        { t: 'script', title: 'Checking in on a colleague', lines: [
          'That was a tough case. Have you got ten minutes for a coffee and to talk it through?',
        ] },

        { t: 'check', id: 'good-wellbeing-postcall', title: 'Before you go home post call', items: [
          'Every patient handed over, and the remaining e-board cases pre-clerked.',
          'Something to eat and drink.',
          'Safe to drive? If not: a nap first, or a taxi or public transport.',
          'Anything from the night still on your mind? Tell your consultant or a colleague before you go.',
          'Sleep first; plan the rest of the day after.',
        ] },

        { t: 'links', items: [
          { text: 'How to call for help and speak up', href: '#/learn/start/calling-for-help' },
          { text: 'When something goes wrong', href: '#/learn/good/incidents' },
          { text: 'On call', href: '#/learn/emergencies/on-call' },
          { text: 'What each duty involves', href: '#/learn/start/duties' },
        ] },
      ],
    },
  ],
};
