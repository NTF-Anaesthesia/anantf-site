// Extra exam-style questions (physiology, pharmacology, obstetric and infant exam knowledge,
// evidence, complications). No doses are used in any question. `answer` is the index into `options`.

const RAW_MCQS = [
  // ---------------------------------------------------------------- physiology
  {
    topic: 'physiology', tier: 2,
    stem: 'After a spinal, which type of block reaches the highest level of the spine?',
    options: ['Sympathetic', 'Pain and temperature', 'Light touch', 'Motor'],
    answer: 0,
    explain: 'Small preganglionic sympathetic fibres are blocked first and at the lowest concentration, so the sympathetic block is higher than the sensory block, which is higher than the motor block. This is differential block.',
    refs: [], link: '#an-differential',
  },
  {
    topic: 'physiology', tier: 2,
    stem: 'What is the main reason for hypotension after a spinal?',
    options: ['Venous dilation that reduces venous return', 'Direct depression of the heart muscle', 'Loss of the diaphragm’s action', 'Fall in blood volume from the drug'],
    answer: 0,
    explain: 'Most of the blood is held in the veins. Sympathetic block dilates them, so venous return and cardiac output fall; arteriolar dilation lowers SVR as well. The effect on the heart muscle itself is small.',
    refs: [], link: '#an-cvs',
  },
  {
    topic: 'physiology', tier: 2,
    stem: 'The cardiac accelerator fibres arise from which spinal segments?',
    options: ['T1–T4', 'T5–T8', 'T9–T12', 'L1–L2'],
    answer: 0,
    explain: 'A block that reaches T1–T4 removes the sympathetic drive to the heart, so bradycardia is added to vasodilation. This is why a high block is more dangerous.',
    refs: [], link: '#an-cvs',
  },
  {
    topic: 'physiology', tier: 3,
    stem: 'Which description fits the Bezold–Jarisch reflex?',
    options: ['Vagal slowing and vasodilation triggered by an underfilled, vigorously contracting ventricle', 'Reflex tachycardia from low arterial pressure', 'Reflex bradycardia from a high arterial pressure', 'Apnoea from a high spinal block'],
    answer: 0,
    explain: 'Receptors in the ventricle sense a small, forcefully contracting chamber (after a fall in venous return) and increase vagal tone. It explains sudden bradycardia and hypotension after a spinal.',
    refs: [], link: '#an-bezold',
  },
  {
    topic: 'physiology', tier: 2,
    stem: 'In a patient with a mid-thoracic spinal block, which respiratory function is best preserved?',
    options: ['Diaphragmatic breathing (tidal volume)', 'Expiratory reserve volume', 'Strength of a cough', 'Ability to clear secretions'],
    answer: 0,
    explain: 'The diaphragm is supplied by C3–5, so tidal volume is usually fine. Intercostal and abdominal muscles are blocked, which lowers expiratory reserve and cough strength.',
    refs: [], link: '#ts-high-effects',
  },
  {
    topic: 'physiology', tier: 2,
    stem: 'What is the effect of a high sympathetic block on the gut?',
    options: ['Unopposed parasympathetic tone: contracted gut, more peristalsis and nausea', 'Gut relaxation with reduced peristalsis', 'No change in the gut', 'Reduced gastric acid only'],
    answer: 0,
    explain: 'Sympathetic block leaves vagal tone unopposed. The bowel contracts and peristalsis increases, which is one cause of nausea. Nausea is often the first sign of low blood pressure.',
    refs: [], link: '#an-physiology',
  },

  // ---------------------------------------------------------------- pharmacology
  {
    topic: 'drugs', tier: 2,
    stem: 'Which property of a local anaesthetic mainly decides its speed of onset?',
    options: ['pKa', 'Protein binding', 'Molecular weight', 'Lipid solubility only'],
    answer: 0,
    explain: 'Only the unionised base crosses the nerve membrane. A pKa closer to tissue pH means more of the drug is unionised, so onset is faster. Lipid solubility mainly sets potency and protein binding mainly sets duration.',
    refs: [], link: '#ch-pharm',
  },
  {
    topic: 'drugs', tier: 2,
    stem: 'Which pair correctly matches properties of a local anaesthetic with what they decide?',
    options: ['Lipid solubility: potency. Protein binding: duration', 'Lipid solubility: duration. Protein binding: onset', 'Protein binding: potency. pKa: duration', 'pKa: potency. Lipid solubility: onset'],
    answer: 0,
    explain: 'A lipid-soluble drug enters the nerve membrane more readily and is more potent. A highly protein-bound drug leaves the binding site slowly, so it lasts longer. pKa sets onset.',
    refs: [], link: '#ch-pharm',
  },
  {
    topic: 'drugs', tier: 2,
    stem: 'Why can intrathecal morphine cause respiratory depression many hours after the injection?',
    options: ['It is hydrophilic, stays in CSF and spreads rostrally', 'It is rapidly redistributed to fat', 'It is metabolised to an active metabolite in the blood', 'It crosses the dura slowly and enters the vein late'],
    answer: 0,
    explain: 'A hydrophilic opioid stays in CSF and moves towards the brainstem over hours. A lipophilic opioid such as fentanyl is taken up by the cord and gone within a few hours, so it carries earlier and shorter risk.',
    refs: [], link: '#ph-adjuvants',
  },
  {
    topic: 'drugs', tier: 2,
    stem: 'What is the mechanism of phenylephrine, and what happens to the heart rate?',
    options: ['Pure alpha-1 agonist; reflex fall in heart rate', 'Beta-1 agonist; rise in heart rate', 'Indirect release of noradrenaline; rise in heart rate', 'Antimuscarinic; rise in heart rate'],
    answer: 0,
    explain: 'It raises SVR and venous tone. The baroreceptor reflex then slows the heart, so cardiac output can fall if the heart rate is already low.',
    refs: [], link: '#ph-pressors',
  },
  {
    topic: 'drugs', tier: 3,
    stem: 'Why is ephedrine no longer the first choice in obstetric spinals?',
    options: ['It crosses the placenta and was linked to a lower fetal pH than phenylephrine', 'It has no effect on blood pressure', 'It causes severe maternal bradycardia', 'It is an antimuscarinic'],
    answer: 0,
    explain: 'Ephedrine passes to the fetus and raises fetal metabolism, producing more acidosis than phenylephrine. It also loses effect with repeat doses (tachyphylaxis).',
    refs: [], link: '#ph-pressors',
  },
  {
    topic: 'drugs', tier: 3,
    stem: 'Why does glycopyrronium cause fewer central effects than atropine?',
    options: ['It is a quaternary ammonium compound and does not cross the blood–brain barrier well', 'It is not an antimuscarinic', 'It is broken down before reaching the brain', 'It is less lipid-soluble than atropine and so has a slower onset only'],
    answer: 0,
    explain: 'Its permanent charge limits entry into the brain and across the placenta. Atropine is a tertiary amine and can cause confusion, especially in older patients.',
    refs: [], link: '#ph-pressors',
  },
  {
    topic: 'drugs', tier: 2,
    stem: 'How is baricity defined?',
    options: ['The density of the solution divided by the density of CSF at 37 °C', 'The mass of drug per millilitre', 'The pH of the solution compared with CSF', 'The osmolality of the solution'],
    answer: 0,
    explain: 'Glucose makes a solution denser than CSF (hyperbaric), so it sinks with gravity. Plain bupivacaine is slightly lighter than CSF at body temperature.',
    refs: [], link: '#an-baricity',
  },
  {
    topic: 'drugs', tier: 3,
    stem: 'Why is bupivacaine more dangerous than lidocaine in systemic toxicity?',
    options: ['It leaves cardiac sodium channels slowly, so conduction block builds up', 'It is less protein-bound', 'It is cleared faster', 'It acts only on the brain'],
    answer: 0,
    explain: 'Bupivacaine binds in the sodium channel in systole and dissociates slowly in diastole (“fast in, slow out”). Arrhythmias and conduction block may appear close to the dose that causes convulsions.',
    refs: [], link: '#ph-last',
  },

  // ---------------------------------------------------------------- obstetric and infant exam knowledge
  {
    topic: 'special', tier: 2,
    stem: 'What sensory level is the usual target for a spinal for caesarean section?',
    options: ['T4', 'T10', 'L1', 'C6'],
    answer: 0,
    explain: 'T4 covers the peritoneum and uterus. Test with cold, then check light touch. This is exam knowledge: NTF has no obstetric service.',
    refs: [], link: '#ex-obstetric',
  },
  {
    topic: 'special', tier: 2,
    stem: 'From about what stage of pregnancy does aortocaval compression matter, and what helps?',
    options: ['About 20 weeks; left uterine displacement', 'About 8 weeks; right tilt', 'About 36 weeks only; head-up position', 'About 12 weeks; head-down position'],
    answer: 0,
    explain: 'From about 20 weeks the uterus compresses the vena cava and aorta in the supine position, lowering venous return. A left tilt or wedge reduces this.',
    refs: [], link: '#ex-obstetric',
  },
  {
    topic: 'special', tier: 2,
    stem: 'Why does pregnancy lower the dose needed for a spinal?',
    options: ['Engorged epidural veins reduce CSF volume, and nerves are more sensitive to local anaesthetic', 'The dura is thicker', 'The liver clears the drug faster', 'CSF volume is increased'],
    answer: 0,
    explain: 'Venous engorgement lowers the lumbosacral CSF volume, so a given dose spreads further. Increased nerve sensitivity adds to this.',
    refs: [], link: '#ex-obstetric',
  },
  {
    topic: 'special', tier: 2,
    stem: 'The Kinsella 2018 international consensus recommends which approach to hypotension at caesarean spinal?',
    options: ['A prophylactic variable-rate phenylephrine infusion, with noradrenaline as an alternative', 'Rapid fluid pre-load alone', 'Ephedrine boluses after hypotension occurs', 'Head-down tilt'],
    answer: 0,
    explain: 'Prevention works better than treatment. Pre-loading is not enough on its own, and ephedrine is no longer first choice.',
    refs: [], link: '#ex-obstetric',
  },
  {
    topic: 'special', tier: 2,
    stem: 'Compared with fentanyl, an intrathecal hydrophilic opioid such as morphine gives:',
    options: ['Long analgesia after surgery, with delayed respiratory depression', 'A faster onset and a shorter effect', 'No itch or nausea', 'No risk of respiratory depression'],
    answer: 0,
    explain: 'A lipophilic opioid acts within minutes and is short. A hydrophilic opioid lasts for many hours and needs monitoring for late respiratory depression, along with itch, nausea and retention.',
    refs: [], link: '#ph-adjuvants',
  },
  {
    topic: 'special', tier: 2,
    stem: 'Which infants are at increased risk of apnoea after a general anaesthetic and may be offered an awake spinal?',
    options: ['Former preterm infants, up to about 60 weeks postmenstrual age', 'All infants over one year', 'Term infants over 3 months only', 'Infants with a congenital heart defect only'],
    answer: 0,
    explain: 'Immature control of breathing carries a risk of postoperative apnoea after a general anaesthetic. A spinal avoids the general anaesthetic, but apnoea can still occur, so monitoring continues.',
    refs: [], link: '#ex-paeds',
  },
  {
    topic: 'special', tier: 2,
    stem: 'Where does the spinal cord end at birth?',
    options: ['About L3, rising to the adult level in the first year', 'About T12', 'About S2', 'At L5–S1 in all children'],
    answer: 0,
    explain: 'The conus ends about L3 in a newborn, so infants have a low interspace for puncture. The dural sac also ends lower than in adults.',
    refs: [], link: '#ex-paeds',
  },
  {
    topic: 'special', tier: 3,
    stem: 'Compared with an adult, how does an infant respond to a spinal?',
    options: ['Larger CSF volume per kilogram and a short block, with little hypotension', 'Smaller CSF volume per kilogram and a long block', 'The same dose per kilogram and the same duration', 'Severe hypotension in almost every case'],
    answer: 0,
    explain: 'Higher CSF volume per kilogram means a larger dose per kilogram and a short block. Young infants have little sympathetic tone in the legs, so hypotension and bradycardia are uncommon.',
    refs: [], link: '#ex-paeds',
  },
  {
    topic: 'special', tier: 2,
    stem: 'What did the GAS trial find in infants having hernia repair?',
    options: ['Equivalent neurodevelopmental outcome with awake-regional and general anaesthesia', 'Better outcome with general anaesthesia', 'Better outcome with spinal anaesthesia', 'Lower mortality with spinal anaesthesia'],
    answer: 0,
    explain: 'Outcomes were equivalent at 2 years and 5 years (full-scale IQ). The trial showed that a short general anaesthetic in infancy did not alter outcome, not that spinal protects the brain.',
    refs: [], link: '#ex-paeds',
  },

  // ---------------------------------------------------------------- evidence
  {
    topic: 'evidence', tier: 2,
    stem: 'What was the main result of the REGAIN trial?',
    options: ['No difference in death or inability to walk at 60 days between spinal and general anaesthesia', 'Spinal anaesthesia halved the death rate', 'General anaesthesia reduced delirium', 'Spinal anaesthesia shortened walking recovery'],
    answer: 0,
    explain: 'About 1,600 people with hip fracture were randomised. Neither technique was shown to be superior. About 15% allocated to spinal received a general anaesthetic.',
    refs: [], link: '#ex-evidence',
  },
  {
    topic: 'evidence', tier: 3,
    stem: 'What did the RAGA trial show about delirium after hip fracture?',
    options: ['Regional anaesthesia without sedation did not significantly reduce delirium', 'Regional anaesthesia halved delirium', 'General anaesthesia doubled delirium', 'Delirium could not be measured'],
    answer: 0,
    explain: 'In 950 people aged 65 or over, delirium in the first week was 6.2% (regional) against 5.1% (general), not significantly different.',
    refs: [], link: '#ex-evidence',
  },
  {
    topic: 'evidence', tier: 3,
    stem: 'What does the Cochrane review of anaesthesia for hip fracture conclude about mortality at one month?',
    options: ['No difference between neuraxial and general anaesthesia, with very low certainty evidence', 'Lower mortality with neuraxial block, with high certainty', 'Lower mortality with general anaesthesia', 'No studies were available'],
    answer: 0,
    explain: 'The randomised trials are small with weak methods. Observational data suggest benefits for neuraxial block but are confounded.',
    refs: [], link: '#ex-evidence',
  },
  {
    topic: 'evidence', tier: 2,
    stem: 'The UK NAP3 audit estimated permanent harm after central neuraxial block at about:',
    options: ['1 in 24,000 to 54,000', '1 in 100', '1 in 1,000', '1 in 1,000,000'],
    answer: 0,
    explain: 'The figure covers all central neuraxial blocks, not spinal alone. Paraplegia or death was lower still. See Complications for the full numbers.',
    refs: [], link: '#cx-glance-table',
  },

  // ---------------------------------------------------------------- complications and techniques
  {
    topic: 'complications', tier: 2,
    stem: 'What does an epidural test dose with adrenaline look for?',
    options: ['A catheter in the CSF (dense block) or in a vein (tachycardia)', 'A catheter that is too shallow', 'An allergy to local anaesthetic', 'Pregnancy'],
    answer: 0,
    explain: 'A small volume in CSF gives a fast, dense block. Adrenaline in a vein raises the heart rate. Neither sign is reliable in every patient, so dose in increments.',
    refs: [], link: '#ex-testdose',
  },
  {
    topic: 'complications', tier: 3,
    stem: 'What complication led to the withdrawal of fine continuous spinal catheters with hyperbaric 5% lidocaine?',
    options: ['Cauda equina syndrome', 'Anaphylaxis', 'Malignant hyperthermia', 'Meningitis'],
    answer: 0,
    explain: 'Poor mixing left a high concentration of drug around the sacral roots. The cases in the early 1990s led to the withdrawal of small microcatheters.',
    refs: [], link: '#ex-compare',
  },
  {
    topic: 'technique', tier: 3,
    stem: 'Which problem is linked to using air for loss of resistance in the epidural space?',
    options: ['Patchy block, and rarely pneumocephalus or venous air embolism', 'A more complete block', 'Higher risk of infection', 'Faster onset'],
    answer: 0,
    explain: 'Air may stay as bubbles in the epidural space and cause gaps in the block. Saline can mimic CSF. Many anaesthetists accept a small volume of air only.',
    refs: [], link: '#ex-testdose',
  },
  {
    topic: 'technique', tier: 2,
    stem: 'What is the advantage of a combined spinal–epidural over a spinal alone?',
    options: ['Fast spinal onset, and the block can be extended through the epidural catheter', 'It avoids a dural puncture', 'The epidural catheter is tested by the spinal', 'It gives a denser block than a spinal'],
    answer: 0,
    explain: 'It combines the speed of a spinal with the ability to top up. The catheter is not proven to be in the epidural space until it is used.',
    refs: [], link: '#ex-compare',
  },
  {
    topic: 'technique', tier: 3,
    stem: 'According to the Hagen–Poiseuille equation, what most increases CSF flow through a spinal needle?',
    options: ['A larger internal radius', 'A longer needle', 'A cutting tip', 'Colder CSF'],
    answer: 0,
    explain: 'Flow is proportional to radius to the fourth power and inversely proportional to length. This is why a small, long needle returns CSF slowly and you should wait.',
    refs: [], link: '#ex-physics',
  },
  {
    topic: 'technique', tier: 3,
    stem: 'Who gave the first deliberate cocaine spinal anaesthesia for surgery, in 1898?',
    options: ['August Bier', 'James Leonard Corning', 'Heinrich Quincke', 'Arthur Barker'],
    answer: 0,
    explain: 'Bier (Kiel) used cocaine for surgery in 1898. Corning’s earlier 1885 injection may have been epidural, Quincke described lumbar puncture in 1891, and Barker introduced the hyperbaric solution in 1907.',
    refs: [], link: '#ex-physics',
  },
];

export const SAQS_EXAM = [
  {
    id: 'qz-saq-compare',
    tier: 2,
    q: 'Compare a single-shot spinal with an epidural and a combined spinal–epidural.',
    marks: 10,
    points: [
      ['Spinal: subarachnoid, small dose, fast onset, dense and reliable, single shot, quick hypotension', 3],
      ['Epidural: large volume, slower, segmental, titratable, higher failure rate, can continue as analgesia', 3],
      ['CSE: spinal speed with an epidural catheter to extend; the catheter is tested late; second dural hole', 2],
      ['Choose by the surgery, its duration, the patient’s cardiovascular reserve and the need for postoperative analgesia', 2],
    ],
  },
  {
    id: 'qz-saq-caesarean',
    tier: 2,
    q: 'Describe how you would prevent and treat hypotension in a spinal for caesarean section (exam knowledge only).',
    marks: 10,
    points: [
      ['Why: aortocaval compression, sympathetic block in a vasodilated state, engorged epidural veins give a higher block', 3],
      ['Left uterine displacement throughout', 1],
      ['Prophylactic variable-rate phenylephrine infusion started with the block (Kinsella 2018), noradrenaline an alternative', 3],
      ['Target systolic pressure at or near baseline; a fluid co-load helps; pre-load alone does not work', 2],
      ['Treat a slow heart rate with an antimuscarinic or ephedrine; reduce phenylephrine', 1],
    ],
  },
  {
    id: 'qz-saq-infant',
    tier: 3,
    q: 'Discuss the case for an awake spinal in an ex-premature infant for hernia repair (exam knowledge only).',
    marks: 10,
    points: [
      ['Postoperative apnoea risk after a general anaesthetic in ex-premature infants (up to about 60 weeks postmenstrual age)', 3],
      ['Conus ends about L3 and the dural sac lower; CSF volume per kilogram is higher; the block is short', 3],
      ['Haemodynamically stable: little hypotension or bradycardia in young infants', 1],
      ['GAS trial: awake-regional and general anaesthesia gave equivalent neurodevelopmental outcome at 2 and 5 years', 2],
      ['Practicalities: do not flex the head; quick surgery; monitor for apnoea afterwards', 1],
    ],
  },
];

// The correct option is written first above; move it to a fixed, mixed position (A to D in rotation)
// so the answer letters are not predictable. Deterministic: the same order on every load.
export const MCQS_EXAM = RAW_MCQS.map((q, i) => {
  const pos = [2, 0, 3, 1][i % 4];
  const right = q.options[q.answer];
  const rest = q.options.filter((_, j) => j !== q.answer);
  const options = [...rest.slice(0, pos), right, ...rest.slice(pos)];
  return { ...q, options, answer: pos };
});
