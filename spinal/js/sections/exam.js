// Chapter "Exam (FRCA) & quiz", part 1: Exam knowledge.
// Content not taught elsewhere on the page: obstetric and infant spinals (exam only), neuraxial
// comparison, test doses, evidence, physics, history and viva answers. Mostly tier 2 and 3.
// No doses are given here. Dose lines live in Pharmacology and Technique.
import { el, tier, keyPoints, callout, table, details } from '../ui.js?v=1';

export const meta = { id: 'exam', prefix: 'ex', title: 'Exam (FRCA) knowledge' };

const P = (html, cls = 'sp-prose') => el('p', { class: cls, html });
const UL = (items) => el('ul', { class: 'sp-prose', html: items.map((i) => `<li>${i}</li>`).join('') });
const T = (node, n) => tier(node, n);
function sub(id, title, ...kids) {
  const d = el('div', { class: 'ex-sub', id });
  d.append(el('h3', { text: title }), ...kids);
  return d;
}

// ---------------------------------------------------------------- 1. compare techniques
function compare() {
  const t = table({
    caption: 'Neuraxial techniques compared',
    head: ['Technique', 'Where the drug goes', 'Onset', 'Dose and volume', 'Block', 'Main limits', 'Typical use'],
    rows: [
      [{ th: true, html: 'Spinal (single shot)' }, 'Subarachnoid space, below the conus (L3–4 or lower)', 'Fast (minutes)', 'Smallest dose and volume; about a tenth of an epidural dose', 'Dense, reliable, all modalities', 'One shot: duration fixed by the drug. Hypotension quick and marked.', 'Lower limb, perineal, lower abdominal and caesarean surgery'],
      [{ th: true, html: 'Epidural' }, 'Epidural space, any level; local anaesthetic acts on roots after crossing the dura', 'Slower (10–20 min or more)', 'Large volume, titrated in increments', 'Segmental, less dense; patchy or one-sided blocks are more common', 'Higher failure rate. Dural puncture and intravascular injection are risks.', 'Labour, thoracic and upper abdominal surgery, long surgery, postoperative analgesia'],
      [{ th: true, html: 'Combined spinal–epidural (CSE)' }, 'Spinal drug through a needle placed in the epidural space; catheter left in the epidural space', 'Fast (spinal part)', 'Small spinal dose, then epidural top-up as needed', 'Dense and extendable', 'The catheter is not proven to be in the epidural space until you use it. More equipment and a second dural hole.', 'Long or uncertain surgery; labour; frail patients who need a titrated dose'],
      [{ th: true, html: 'Continuous spinal (catheter)' }, 'Catheter in the subarachnoid space', 'Fast, titratable', 'Small increments to effect', 'Dense, adjustable', 'Large-bore catheter gives a high headache risk. Cauda equina syndrome with fine catheters and hyperbaric 5% lidocaine (1990s). Rarely used.', 'Cardiac risk and aortic stenosis, where a slow onset limits hypotension'],
      [{ th: true, html: 'Caudal' }, 'Epidural space via the sacral hiatus', 'Like epidural', 'Volume per kilogram sets the level', 'Sacral and lumbar, depending on volume', 'Hiatus harder to find in adults. Failure rate rises with age.', 'Children (below the umbilicus); anorectal and perineal surgery'],
    ],
    stack: true,
  });
  return sub('ex-compare', 'Neuraxial techniques compared',
    T(P('<strong>Answer first:</strong> a spinal is a small dose into CSF and gives a fast, dense block; an epidural is a large volume in the epidural space and is titratable but slower and less reliable. CSE and continuous spinal are ways to keep the speed of a spinal while being able to extend the block.', 'sp-lead'), 2),
    T(t, 2),
    T(callout('pearl', { title: 'Why the spinal dose is so much smaller', body: '<p>The drug is deposited next to the roots and cord in CSF, with no dura to cross and no fat or veins to take it away. Epidural drug has to cross the dura and is lost to epidural fat and veins, so far more is needed.</p>' }), 2),
  );
}

// ---------------------------------------------------------------- 2. test dose and epidural test
function testDose() {
  return sub('ex-testdose', 'Test doses and finding the epidural space',
    T(P('<strong>Answer first:</strong> a test dose checks that an epidural catheter is not in the CSF or in a vein. It does not replace slow, incremental dosing with aspiration and watching the patient.', 'sp-lead'), 2),
    T(table({
      caption: 'What the test dose looks for',
      head: ['Wrong place', 'What happens after a small test volume', 'Limits'],
      rows: [
        [{ th: true, html: 'Subarachnoid space' }, 'Rapid, dense, spreading sensory and motor block from a volume that would be tiny in the epidural space.', 'Needs a wait of a few minutes and a motor check. A late migration is not detected.'],
        [{ th: true, html: 'Epidural vein' }, 'If the drug contains adrenaline: palpitations, tachycardia and a rise in blood pressure. Numbness of the lips or tinnitus with local anaesthetic.', 'Unreliable if the patient is beta-blocked, anaesthetised, sedated or in labour (contractions raise the heart rate). Adrenaline can itself cause harm in some patients.'],
      ],
    }), 2),
    T(UL([
      '<strong>Loss of resistance.</strong> The needle advances with constant pressure on the syringe; resistance falls when the tip enters the epidural space. Saline or air may be used.',
      '<strong>Air versus saline.</strong> Air is linked to patchy blocks, pneumocephalus and (rarely) venous air embolism. Saline can be mistaken for CSF and dilutes the first dose. A small volume of air is accepted by many; large volumes are avoided.',
      '<strong>Safer than any single test:</strong> aspirate, give the dose in small increments, and watch for a sudden change in block or symptoms.',
    ]), 3),
  );
}

// ---------------------------------------------------------------- 3. obstetric
function obstetric() {
  const warn = T(callout('policy', {
    title: 'Exam knowledge only',
    body: '<p>NTF has no obstetric service. This is here because the FRCA examines it. A typical caesarean dose is <span class="sp-dose">2.2–2.3 mL</span> of hyperbaric bupivacaine 0.5% (<span class="sp-dose">11–11.5 mg</span>).</p>',
  }), 2);
  const body = el('div');
  body.append(
    T(P('<strong>Answer first:</strong> spinal is the usual technique for caesarean. Aim for a sensory block to <strong>T4</strong> (cold, then light touch). The main problem is hypotension, and the main fix is to prevent it with a phenylephrine infusion started with the block.', 'sp-lead'), 2),
    T(table({
      caption: 'Why pregnancy changes the spinal',
      head: ['Change', 'Effect on the spinal'],
      rows: [
        [{ th: true, html: 'Aortocaval compression (from about 20 weeks)' }, 'The uterus presses on the vena cava and aorta when supine. Venous return and cardiac output fall; the supine hypotensive syndrome. Left uterine displacement (a left tilt or a wedge) reduces this. Compression is worse once the block removes sympathetic tone.'],
        [{ th: true, html: 'Engorged epidural veins' }, 'The lumbosacral CSF volume is smaller, so a given dose spreads higher. Dose requirement is lower.'],
        [{ th: true, html: 'Nerve sensitivity' }, 'Pregnant nerves are more sensitive to local anaesthetic, which adds to the higher spread.'],
        [{ th: true, html: 'Sympathetic tone' }, 'Pregnancy is a vasodilated state that depends on sympathetic tone, so the pressure falls quickly and far.'],
      ],
    }), 2),
    T(table({
      caption: 'Hypotension at caesarean: the consensus approach',
      head: ['Question', 'Answer'],
      rows: [
        [{ th: true, html: 'Prophylaxis' }, 'A variable-rate phenylephrine infusion started when the spinal is given, titrated to blood pressure and heart rate. This is the recommendation of the <strong>Kinsella 2018 international consensus</strong> (Anaesthesia 2018;73:71–92). Noradrenaline is an alternative.'],
        [{ th: true, html: 'Target' }, 'Keep systolic pressure at or near the baseline, and do not let it fall below 80% of baseline.'],
        [{ th: true, html: 'Fluid' }, 'A co-load (fluid given at the time of the block) helps a little; fluid alone does not prevent hypotension. A pre-load is not enough.'],
        [{ th: true, html: 'Treat a slow heart rate' }, 'Reduce or stop phenylephrine and give an antimuscarinic or ephedrine; see <a href="#ph-pressors">vasopressors</a>.'],
        [{ th: true, html: 'Why not ephedrine first' }, 'It crosses the placenta and was linked to a lower fetal pH (more acidosis) than phenylephrine.'],
      ],
    }), 2),
    T(UL([
      '<strong>Why hypotension matters:</strong> maternal nausea, vomiting and dizziness, and reduced uteroplacental blood flow with a risk of fetal acidosis.',
      '<strong>Opioids with the spinal.</strong> A lipophilic opioid (fentanyl) acts fast and helps the visceral pain of the surgery. A hydrophilic opioid (morphine; diamorphine in the UK) gives long postoperative analgesia but needs monitoring for delayed respiratory depression, with itch, nausea and urinary retention. See <a href="#ph-adjuvants">adjuvants</a>. Doses are in the pharmacology chapter only where they are verified.',
      '<strong>Why a spinal rather than a general anaesthetic:</strong> the airway is harder and aspiration more likely in pregnancy; failed intubation is a cause of maternal death. A general anaesthetic is used for very urgent cases and when neuraxial block is contraindicated.',
      '<strong>Contraindications</strong> are the same as for any spinal: refusal, coagulopathy, local or systemic sepsis, severe uncorrected hypovolaemia. See <a href="#tq-preop">pre-op assessment</a>.',
      '<strong>Headache.</strong> Young women have a higher risk of post-dural puncture headache than older adults. See <a href="#cx-pdph">PDPH</a>.',
    ]), 2),
    T(UL([
      '<strong>Pre-eclampsia.</strong> Neuraxial block is acceptable and usually preferred to a general anaesthetic, which can cause a hypertensive surge at intubation. Check the platelet count and clotting. The fall in pressure is often smaller, but vasopressor sensitivity is high, so start low.',
      '<strong>Failed or partial block.</strong> Do not wait if the block is inadequate at T4 at the start: supplement, repeat, or convert to a general anaesthetic, depending on urgency.',
      '<strong>High block</strong> after a caesarean spinal is managed as in <a href="#ts-high-spinal">high spinal</a>, with left uterine displacement while the patient is pregnant.',
    ]), 3),
  );
  return sub('ex-obstetric', 'Spinal for caesarean section (exam knowledge only)', warn, details({ id: 'ex-obstetric-d', summary: 'Open: caesarean spinal for the FRCA', body: body, open: false }));
}

// ---------------------------------------------------------------- 4. paediatric
function paeds() {
  const warn = T(callout('policy', {
    title: 'Exam knowledge only',
    body: '<p>Infant spinals are specialist paediatric practice and are not done in this department\'s routine adult service. No doses are given here.</p>',
  }), 2);
  const body = el('div');
  body.append(
    T(P('<strong>Answer first:</strong> an awake infant spinal is used for short operations below the umbilicus (typically inguinal hernia repair) in babies who would be at risk of apnoea after a general anaesthetic, such as ex-premature infants.', 'sp-lead'), 2),
    T(table({
      caption: 'How an infant differs from an adult',
      head: ['Feature', 'Infant', 'Consequence'],
      rows: [
        [{ th: true, html: 'Level of the cord' }, 'Conus ends about L3 at birth; reaches the adult level (around L1) during the first year. The dural sac ends lower (about S3–4).', 'Use a low interspace (L4–5 or below). The line between the iliac crests lies lower than in adults.'],
        [{ th: true, html: 'CSF volume' }, 'Larger per kilogram than in adults', 'The dose per kilogram is higher and the block is short (about an hour).'],
        [{ th: true, html: 'Haemodynamics' }, 'Little sympathetic tone in the legs; heart rate is the main way of changing cardiac output', 'Hypotension and bradycardia are uncommon in young infants after a spinal.'],
        [{ th: true, html: 'Airway and apnoea' }, 'Immature control of breathing; risk of apnoea after general anaesthesia, highest in ex-premature infants (up to about 60 weeks postmenstrual age)', 'A spinal avoids the general anaesthetic. Apnoea can still occur, and monitoring continues after the case.'],
      ],
    }), 2),
    T(UL([
      '<strong>Practicalities.</strong> Sit or lie the infant carefully; the head must not flex (airway obstruction). Keep the infant comfortable and warm. Surgery must be quick and the surgeon told to expect a short block.',
      '<strong>The GAS trial</strong> (awake-regional anaesthesia compared with sevoflurane general anaesthesia in infants having hernia repair) found equivalent neurodevelopmental outcomes at 2 years and at 5 years (full-scale IQ). It does not show that spinal is neuroprotective; it shows that a short general anaesthetic did not harm.',
      '<strong>T-REX</strong> is a different question: it compares low-dose combined anaesthesia with standard-dose sevoflurane in children under 2 years having long operations. It is not a spinal trial.',
      '<strong>Caudal block</strong> is the regional technique most often used in children; see the <a href="#ex-compare">comparison table</a>.',
    ]), 3),
  );
  return sub('ex-paeds', 'Infant (paediatric) spinal (exam knowledge only)', warn, details({ id: 'ex-paeds-d', summary: 'Open: infant awake spinal for the FRCA', body: body, open: false }));
}

// ---------------------------------------------------------------- 5. evidence
function evidence() {
  const t = table({
    caption: 'Key trials and reviews',
    head: ['Study', 'Question', 'Result', 'Take-home'],
    rows: [
      [{ th: true, html: 'REGAIN (NEJM 2021)' }, 'Spinal or general anaesthesia for hip fracture in about 1,600 people aged 50 or over', 'No difference in death or inability to walk at 60 days. Delirium about 20% in both groups.', 'Choose for the patient. A spinal is not shown to be better.'],
      [{ th: true, html: 'RAGA (JAMA 2022)' }, 'Regional (no sedation) or general anaesthesia in 950 people aged 65 or over with hip fracture', 'Delirium in the first week: 6.2% regional, 5.1% general. Not significantly different.', 'Regional anaesthesia did not reduce delirium.'],
      [{ th: true, html: 'Cochrane review CD000521: anaesthesia for hip fracture' }, 'Neuraxial or general anaesthesia in adults', 'No difference in mortality at one month. Evidence is of very low certainty.', 'Randomised evidence is weak. Less thrombosis with neuraxial block only without potent prophylaxis.'],
      [{ th: true, html: 'Cochrane review CD010807 (2017): needle gauge and tip' }, 'Needle design and PDPH', 'Traumatic (cutting) needles about twice the risk of headache (RR 2.14, also quoted in <a href="#tq-needles">Technique</a>).', 'Use an atraumatic needle.'],
      [{ th: true, html: 'NAP3 (Royal College of Anaesthetists audit, 2009)' }, 'Serious complications of central neuraxial block in the UK', 'Permanent harm about 1 in 24,000 to 54,000 (all central neuraxial blocks). See <a href="#cx-glance-table">Complications</a> for the full figures.', 'Rare, and a guide for consent.'],
      [{ th: true, html: 'GAS trial (Lancet 2016; 5-year results)' }, 'Awake-regional or general anaesthesia in infants for hernia repair', 'Equivalent neurodevelopmental outcomes at 2 and 5 years.', 'Short general anaesthetic in infancy did not alter outcome at age 5.'],
      [{ th: true, html: 'Kinsella 2018 consensus' }, 'Vasopressors for caesarean spinal hypotension', 'Prophylactic variable-rate phenylephrine infusion recommended; noradrenaline an alternative.', 'Prevent rather than treat.'],
    ],
  });
  return sub('ex-evidence', 'Evidence table',
    T(P('<strong>Answer first:</strong> for hip fracture, spinal and general anaesthesia give similar outcomes in the best trials. Say what the trial asked, the result, and why it may not generalise (crossover, patient selection, sedation).', 'sp-lead'), 2),
    T(t, 2),
    T(UL([
      '<strong>REGAIN limits:</strong> about 15% of those allocated to spinal had a general anaesthetic instead, and sedation practice varied between sites.',
      '<strong>RAGA limits:</strong> delirium was much lower than in other series, suggesting lower frailty or an insensitive detection method. Single country (China).',
      '<strong>Observational studies</strong> often show better outcomes with neuraxial block; they are confounded by the choice of anaesthetic.',
    ]), 3),
  );
}

// ---------------------------------------------------------------- 6. physics and history
function physicsHistory() {
  const phys = table({
    caption: 'Physics and chemistry of the spinal',
    head: ['Topic', 'Principle', 'Use'],
    rows: [
      [{ th: true, html: 'Baricity' }, 'Density of the solution divided by the density of CSF, both at 37 °C. CSF is a little above 1.000 g per mL. Glucose makes a solution hyperbaric.', 'Hyperbaric drug sinks to the lowest point; hypobaric rises. See the <a href="#an-baricity">baricity figure</a>.'],
      [{ th: true, html: 'Temperature' }, 'Density falls as temperature rises. A drug that is isobaric at 20 °C can be hypobaric at 37 °C.', 'Plain bupivacaine is slightly hypobaric at body temperature.'],
      [{ th: true, html: 'Flow through the needle' }, 'Hagen–Poiseuille: flow is proportional to radius to the fourth power and inversely to length.', 'A narrow, long needle returns CSF slowly: wait. A small increase in gauge makes a large difference.'],
      [{ th: true, html: 'pKa and onset' }, 'Only the unionised base crosses membranes; the closer the pKa is to the tissue pH, the more is unionised.', 'Lower pKa, faster onset. See <a href="#ch-pharm">Pharmacology</a>.'],
      [{ th: true, html: 'Lipid solubility and protein binding' }, 'Lipid solubility sets potency; protein binding sets duration.', 'Bupivacaine is more lipid-soluble and more protein-bound than lidocaine, so more potent and longer-acting.'],
    ],
  });
  const hist = table({
    caption: 'History in one table',
    head: ['Year', 'Who', 'What'],
    rows: [
      ['1885', 'James Leonard Corning (New York)', 'Injected cocaine near the spine. Whether this was epidural or spinal is disputed.'],
      ['1891', 'Heinrich Quincke', 'Described lumbar puncture.'],
      ['1898', 'August Bier (Kiel)', 'First deliberate cocaine spinal anaesthesia for surgery. He and his assistant tried it on each other and both had a headache afterwards (an early account of the post-puncture headache).'],
      ['1899', 'Théodore Tuffier (Paris)', 'Spread cocaine spinal anaesthesia; the intercristal line carries his name.'],
      ['1907', 'Arthur Barker (London)', 'Hyperbaric spinal using glucose; position now controlled the spread.'],
      ['1951', 'Whitacre and Hart', 'Pencil-point needle to reduce headache.'],
    ],
  });
  return sub('ex-physics', 'Physics, chemistry and history',
    T(phys, 2),
    T(hist, 3),
  );
}

// ---------------------------------------------------------------- 7. viva
const VIVA = [
  ['Spinal or epidural: how do you choose?', 2, 'Use a spinal for fast, dense, reliable block for surgery of a known and limited length. Use an epidural when you need to titrate, to extend the block, or to give postoperative analgesia. CSE gives both. See the <a href="#ex-compare">table</a>.'],
  ['What are the effects of a high spinal?', 2, 'Cardiovascular: hypotension from venous and arterial dilation; bradycardia when the cardiac accelerator fibres (T1–T4) are blocked. Respiratory: expiratory reserve and cough are lost; the diaphragm (C3–5) usually works until the block is very high. Then apnoea, loss of consciousness and arrhythmia. Manage with airway, oxygen, vasopressors, fluids, atropine and support. See <a href="#ts-high-spinal">high spinal</a>.'],
  ['Why does a spinal cause hypotension and bradycardia?', 2, 'Preganglionic sympathetic block dilates capacitance veins (most of the blood is in the veins), reducing venous return and cardiac output, and dilates arterioles, lowering SVR. A low-filled ventricle can trigger the Bezold–Jarisch reflex (vagal slowing). See <a href="#an-bezold">Bezold–Jarisch</a>.'],
  ['What is baricity and why does it matter?', 2, 'The density of the solution relative to CSF at 37 °C. A hyperbaric solution moves with gravity, so position after injection sets the level of the block. See <a href="#an-baricity">baricity</a>.'],
  ['What decides the height of a spinal block?', 2, 'Baricity with position, then dose (mass), CSF volume, age, abdominal pressure (including pregnancy), speed of injection and spinal curves. See <a href="#tq-spread">spread</a>.'],
  ['Explain differential block.', 3, 'Small fibres block first: the sympathetic block extends higher than the sensory block, which extends higher than the motor block. Expect the level of cold sensation to be a few segments above touch and the sympathetic level higher still. See <a href="#an-differential">differential block</a>.'],
  ['Spinal or general anaesthesia for hip fracture?', 2, 'Neither is proven better. In REGAIN, walking and death at 60 days were similar; RAGA found no clear reduction in delirium. Choose for the patient: airway, heart and lung disease, anticoagulants, and ability to lie still. See <a href="#tq-hipfracture">the worked example</a>.'],
  ['Why is a spinal used in an ex-premature infant?', 3, 'To avoid a general anaesthetic and the risk of postoperative apnoea. The cord ends lower and the CSF volume per kilogram is larger, so the block is short. GAS found no neurodevelopmental difference between awake-regional and general anaesthesia.'],
  ['How do you treat hypotension at caesarean?', 2, 'Prevent it: left uterine displacement and a prophylactic variable-rate phenylephrine infusion (Kinsella 2018), titrated to keep systolic pressure near baseline. Fluid co-load; treat a slow heart rate with an antimuscarinic or ephedrine. See <a href="#ex-obstetric">caesarean spinal</a>.'],
];

function viva() {
  const wrap = el('div', { class: 'ex-viva' });
  VIVA.forEach(([q, tr, a], i) => {
    const d = details({ id: `ex-viva-${i + 1}`, summary: q, body: `<p>${a}</p>` });
    tier(d, tr);
    wrap.append(d);
  });
  return sub('ex-viva', 'Classic viva questions with short model answers',
    T(P('Say the answer out loud first, then open it. Start with a one-line definition, then structure.', 'sp-prose'), 2),
    wrap,
  );
}

// ---------------------------------------------------------------- mount
export function mount(root) {
  root.append(
    keyPoints([
      'This is exam knowledge: mostly Resident and Advanced. The bedside chapters teach the practice.',
      'Spinal is a small dose in CSF with a fast, dense block; epidural is a large volume, slower and titratable.',
      'Caesarean spinal: block to T4, prevent hypotension with a phenylephrine infusion (Kinsella 2018).',
      'Infant spinal: for ex-premature infants to avoid apnoea after general anaesthesia; the GAS trial found no difference in outcome.',
      'Hip fracture: REGAIN and RAGA found no clear advantage of spinal over general anaesthesia.',
      'A test dose looks for an intrathecal or intravenous catheter; it never replaces incremental dosing.',
      'For the self-quiz, go to <a href="#quiz">Exam questions and self-quiz</a>.',
    ]),
    el('ul', { class: 'sp-jump', html: '<li><a href="#ex-compare">Compare techniques</a></li><li><a href="#ex-testdose">Test dose</a></li><li><a href="#ex-obstetric">Caesarean</a></li><li><a href="#ex-paeds">Infant spinal</a></li><li><a href="#ex-evidence">Evidence</a></li><li><a href="#ex-physics">Physics and history</a></li><li><a href="#ex-viva">Viva</a></li>' }),
    compare(),
    testDose(),
    obstetric(),
    paeds(),
    evidence(),
    physicsHistory(),
    viva(),
  );

  return {
    reveal(id) {
      const t = document.getElementById(id);
      if (!t) return false;
      for (let p = t; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
      return true;
    },
  };
}
