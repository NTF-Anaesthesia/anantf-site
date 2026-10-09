// 05 Troubleshooting.
// An index of problems (left column at >=1100px, stacked links on phones) and one panel per problem,
// each holding a decision tree (js/troubleshooting/tree.js). Doses only from product labels (emc SmPC)
// or the Association of Anaesthetists QRH; anything uncertain is flagged in the text.
// Tiers: each panel, and each block inside it, carries a learning tier (1 MO, 2 Resident, 3 Advanced).
import { el, callout, table, segmented, cite, announce, tier, keyPoints } from '../ui.js?v=1';
import { createTree, treeOutline, numberCites } from '../troubleshooting/tree.js';
import { redirectGuide } from '../troubleshooting/redirect.js';
import * as T from '../troubleshooting/trees.js';

export const meta = { id: 'troubleshooting', prefix: 'ts', title: 'Troubleshooting' };

const emc = (n) => `https://www.medicines.org.uk/emc/product/${n}/smpc`;
export const refs = {
  'ts-qrh2023': {
    label: 'QRH 2023',
    text: 'Association of Anaesthetists. Quick Reference Handbook: guidelines for crises in anaesthesia (compendium, June 2023). 2-4 Hypotension; 2-6 Bradycardia; 3-11 High central neuraxial block. CC BY-NC-SA 4.0.',
    url: 'https://anaesthetists.org/Quick-Reference-Handbook',
  },
  'ts-smpc-phe': { label: 'Phenylephrine SmPC', text: 'Phenylephrine 100 micrograms/ml solution for injection or infusion. Summary of Product Characteristics, section 4.2. electronic medicines compendium (emc).', url: emc(12563) },
  'ts-smpc-eph': { label: 'Ephedrine SmPC', text: 'Ephedrine hydrochloride 3 mg/ml solution for injection in pre-filled syringe. Summary of Product Characteristics, section 4.2. emc.', url: emc(5354) },
  'ts-smpc-met': { label: 'Metaraminol SmPC', text: 'Metaraminol 0.5 mg/ml solution for injection in pre-filled syringe. Summary of Product Characteristics, section 4.2. emc.', url: emc(11698) },
  'ts-smpc-atr': { label: 'Atropine SmPC', text: 'Atropine sulfate 3 mg/10 ml solution for injection in pre-filled syringe. Summary of Product Characteristics, section 4.2. emc.', url: emc(8790) },
  'ts-smpc-gly': { label: 'Glycopyrronium SmPC', text: 'Glycopyrronium bromide 200 micrograms/ml solution for injection. Summary of Product Characteristics, section 4.2. emc.', url: emc(2786) },
  'ts-smpc-ond': { label: 'Ondansetron SmPC', text: 'Ondansetron 2 mg/ml solution for injection. Summary of Product Characteristics, section 4.2 (treatment of established PONV). emc.', url: emc(6469) },
  'ts-smpc-nal': { label: 'Naloxone SmPC', text: 'Naloxone hydrochloride 1 mg/ml solution for injection in pre-filled syringe. Summary of Product Characteristics, section 4.2 (postoperative opioid depression). emc.', url: emc(3590) },
};

const D = (s) => `<span class="sp-dose">${s}</span>`;
const P = (html, cls) => el('p', { class: cls, html });

// ---------------------------------------------------------------- difficult back: patient types
// Short summaries only. The full walkthroughs are in the Challenging spines section (#spines).
// t1 = what every MO needs, t2 = detail for residents, t3 = an advanced pearl (or null).
const BACKS = [
  {
    value: 'obesity', label: 'Obesity',
    t1: [
      'Sit the patient up if you can: the midline is usually easier to find sitting than lying.',
      'Landmarks may be impalpable. Deep palpation, then probing with the skin-infiltration needle for bone or ligament resistance, can help you find the spinous processes.',
      'Pre-scan with ultrasound to mark the midline and the interspace, and to measure the depth.',
      'Plan the backup anaesthetic, including the airway, before you start.',
    ],
    t2: [
      'The midline can usually be found, even when the interlaminar window is not clear.',
      'The needle must go deep, and soft tissue shifts, so a midline needle drifts easily. A paraspinous approach is more forgiving, and many experts use it first in very obese patients.',
      'A longer spinal needle is needed. Over 90 mm, a 22G Quincke-tip needle may be preferred to a 25G one, because a finer needle bends more and drifts.',
      'Obesity is a recognised anatomical cause of a failed lumbar puncture.',
    ],
    t3: 'Soft tissue slides over the spine when the patient moves. Mark the skin in the position you will use for the block, and do not let the patient shift afterwards. A skin mark made lying down can be well off the midline once the patient sits. An introducer helps a long, fine needle keep its line through deep tissue.',
  },
  {
    value: 'scoliosis', label: 'Scoliosis',
    t1: [
      'The vertebrae are rotated as well as curved, so the spinous processes you feel may not sit over the interlaminar gap. Surface landmarks are unreliable.',
      'Seek senior help early rather than after several failed passes.',
      'In a severe curve, check cardiorespiratory reserve, and expect the block to spread unevenly.',
    ],
    t2: [
      'Work out which way the lumbar curve goes. It is opposite to the thoracic curve, which is easier to see.',
      'Insert the needle on the convex side. The interlaminar spaces are wider there and narrower on the concave side.',
      'Use a paraspinous approach. Because the vertebrae rotate, little or no lateral-to-medial angle may be needed. A midline approach may need medial-to-lateral angling instead.',
      'Ultrasound helps: it shows the direction and degree of the curve and rotation, finds a wide enough interlaminar space and helps plan the needle path.',
    ],
    t3: 'Rotation is greatest at the apex of the curve, so a level away from the apex may be easier. Look at any imaging before you start. If the spine has been fused for scoliosis, the fused levels may have no usable window, so look for a level above or below the fusion.',
  },
  {
    value: 'elderly', label: 'Elderly: calcified ligaments',
    t1: [
      'Calcified supraspinous and interspinous ligaments, narrow interspaces and stiffness make the midline hard going.',
      'A paramedian (paraspinous) approach avoids the midline ligaments and is often easier. See <a href="#tq-approach">Midline and paramedian approaches</a>.',
      'Positioning may be limited by pain (for example a hip fracture), so give analgesia before you position.',
      'Older patients are more prone to hypotension after the spinal: be ready to treat it.',
    ],
    t2: [
      'Enter 0.5–1 cm lateral to the midline, angled 5–15° medially (typically about 10°). If bone stops the needle, walk it cranially off the lamina.',
      'Calcified ligaments can widen the tip of the spinous process. You may need to enter a little further out than 1 cm and angle up to about 15–20°. Probe with the skin-infiltration needle first to choose the site.',
      'The L5–S1 space often stays open in degenerative disease, and ultrasound can confirm it.',
      'Full flexion matters less than is often taught for a paraspinous approach, because the gap is little changed by it. In one trial in older patients with hip fracture, raising the chest and shoulders by about 30° made the block easier to do.',
    ],
    t3: null,
  },
  {
    value: 'surgery', label: 'Previous spinal surgery',
    t1: [
      'Read the operation note and imaging. Look for the scar, any fusion and where the metalwork is.',
      'Choose an interspace away from the operated levels. Scar tissue and missing landmarks make the operated level difficult.',
      'Record any existing neurological deficit carefully before the block.',
    ],
    t2: [
      'Adhesions and stenosis can stop the drug spreading, so a block can be patchy, and a repeat dose may fail for the same reason.',
      'Ultrasound helps to find an open level.',
    ],
    t3: 'After a long posterior fusion, the levels within the fusion may have no window at all, and a block above or below it may spread unpredictably. If imaging shows no open level, another anaesthetic technique is often wiser than repeated attempts.',
  },
  {
    value: 'as', label: 'Ankylosing spondylitis',
    t1: [
      'Ossified ligaments and fused joints often make the midline approach impossible.',
      'The neck may be fused: if you need to convert to general anaesthesia, the airway may be difficult. Plan for it before you start.',
      'Ask an experienced colleague to be involved from the start.',
    ],
    t2: [
      'A paramedian approach, often at L5–S1 (the Taylor approach, where the interlaminar space is largest), may work when the midline doesn’t. Ultrasound helps.',
    ],
    t3: 'A fused, rigid spine cannot flex, and a fixed forward bend may make lying flat uncomfortable or impossible. Work out the position for surgery before the block, and move the patient gently: the rigid spine is brittle.',
  },
];

function backSelector() {
  const wrap = el('div', { class: 'ts-back', id: 'ts-back-types' });
  const out = el('div', { class: 'ts-back-out', 'aria-live': 'polite' });
  const draw = (v) => {
    const b = BACKS.find((x) => x.value === v) || BACKS[0];
    out.textContent = '';
    out.append(el('h4', { class: 'ts-back-h', text: b.label }));
    out.append(tier(el('ul', { class: 'ts-back-list' }, ...b.t1.map((p) => el('li', { html: p }))), 1));
    if (b.t2.length) out.append(tier(el('ul', { class: 'ts-back-list ts-back-more' }, ...b.t2.map((p) => el('li', { html: p }))), 2));
    if (b.t3) out.append(tier(callout('key', { title: 'Advanced pearl', body: `<p>${b.t3}</p>` }), 3));
    numberCites(out);
  };
  const seg = segmented(BACKS.map(({ value, label }) => ({ value, label })), { label: 'Patient type', value: 'obesity', onChange: draw });
  wrap.append(el('p', { class: 'ts-back-l', text: 'Choose a patient type' }), seg, out);
  draw('obesity');
  return wrap;
}

// ---------------------------------------------------------------- panels
function failedCauses() {
  const rows = [
    ['Failed lumbar puncture', 'Needle never in the subarachnoid space: technique, position, anatomy, a blocked needle. Includes “pseudo-success”, where fluid that isn’t CSF (or CSF from a cyst) flows.'],
    ['Faulty injection', 'Leak at the hub, needle moved while attaching the syringe, pencil-point side hole only partly through the dura, dead-space loss.'],
    ['Inadequate spread', 'Anatomical barriers (stenosis, adhesions), a large lumbosacral CSF volume, unpredictable spread of plain solutions, heavy solution pooling after a low injection.'],
    ['Failure of drug action', 'Wrong drug or syringe swap, contamination, an inactive drug. “Local anaesthetic resistance” is unproven.'],
    ['Mismanagement of a working block', 'Anxiety, poor expectations, testing too early, visceral traction during surgery.'],
  ];
  return table({ caption: 'Why spinals fail', head: ['Category', 'Examples'], rows: rows.map(([a, b]) => [{ html: a, th: true }, b]), id: 'ts-failed-causes' });
}

function doseTable() {
  return table({
    id: 'ts-doses',
    caption: 'Adult IV doses from the product labels',
    head: ['Drug', 'Label dose', 'Notes'],
    rows: [
      [{ html: 'Phenylephrine', th: true }, `${D('50–100 µg')} bolus${cite('ts-smpc-phe')}`, `Repeat to effect; one bolus no more than ${D('100 µg')}. Can slow the heart.`],
      [{ html: 'Metaraminol', th: true }, `Up to ${D('1 mg')} per bolus${cite('ts-smpc-met')}`, `Pre-filled syringe label: cumulative bolus maximum ${D('5 mg')}.`],
      [{ html: 'Ephedrine', th: true }, `${D('3–6 mg')} slow IV${cite('ts-smpc-eph')}`, `Maximum ${D('9 mg')} per dose, every 3–4 min, up to ${D('30 mg')}. Raises rate and pressure.`],
      [{ html: 'Atropine', th: true }, `${D('0.5 mg')}${cite('ts-smpc-atr')}`, 'For sinus bradycardia; repeat every 2–5 min to effect.'],
      [{ html: 'Glycopyrronium', th: true }, `${D('200–400 µg')}${cite('ts-smpc-gly')}`, 'Single intra-operative dose; may be repeated.'],
    ],
  });
}

// "First 5 minutes after injection": a checklist, not a decision tree.
function firstFive() {
  const steps = [
    ['Note the time of injection.', 'Everything after this is timed from it.'],
    ['Lie the patient as you planned for this operation.', 'A heavy solution spreads with gravity in the first minutes, so the position matters. If the pressure falls, raise the legs; do not tilt head-down.'],
    ['Cycle the blood pressure every 1–2 minutes.', 'Watch the heart rate and oxygen saturation too. Have a vasopressor and an anticholinergic drawn up before you inject.'],
    ['Ask about nausea.', 'Nausea soon after a spinal means low blood pressure until proved otherwise.'],
    ['Ask about breathing and hands.', 'Ask: “Is your breathing easy? Can you squeeze my hand?” Tingling or weak hands, or a feeling of breathlessness, can mean the block is rising too high.'],
    ['Test the level.', 'Use cold (ice or an alcohol swab) or pinprick, on both sides, from the feet upwards. Note the top level and the time. Re-test until the level has stopped rising.'],
    ['Keep talking to the patient.', 'Tell them what to expect: warm, heavy, numb legs. Reassurance reduces anxiety and helps you spot a change in their voice or alertness.'],
    ['Do not let the surgery start until the block is tested.', 'A covert pinch with forceps before incision tells you more than the level alone.'],
  ];
  const ol = el('ol', { class: 'ts-checklist' }, ...steps.map(([h, t]) => el('li', {}, el('strong', { text: h }), ' ', t)));
  const stop = callout('warn', {
    title: 'Stop and get help if',
    body: `<ul>
      <li>The blood pressure falls quickly, or the heart rate drops below normal: go to <a href="#ts-hypotension">Hypotension and bradycardia</a>.</li>
      <li>The patient is breathless, has weak hands, struggles to speak or becomes drowsy: go to <a href="#ts-high-spinal">High or total spinal</a>.</li>
      <li>The patient is pale, sweaty, vomiting or says they feel faint.</li>
    </ul>`,
  });
  return [tier(ol, 1), tier(stop, 1)];
}

const pearl = (title, body) => tier(callout('key', { title: `Advanced pearl: ${title}`, body: `<p>${body}</p>` }), 3);
const t2note = (kind, title, body) => tier(callout(kind, { title, body }), 2);

const PANELS = [
  // ---- during the procedure
  {
    id: 'ts-dry-tap', group: 'during', tier: 1, title: 'No CSF (dry tap)', tree: T.dryTap,
    intro: 'Work from the simplest explanation outwards: patience, needle position, a blocked needle, then the patient’s position and anatomy.',
    after: () => [
      t2note('key', 'How many passes?', '<p>No international guideline sets a maximum number of passes. Agree with your supervisor, before you start, when to change approach, call a senior colleague or abandon the spinal.</p>'),
      pearl('slow flow', 'CSF pressure at the lumbar level is lower lying than sitting, and a narrow canal can slow the flow further. Sitting the patient up, or asking them to cough or gently strain, raises CSF pressure and can start a slow flow. If the flow starts and then stops, the needle may have moved: confirm free flow again before you inject.'),
    ],
  },
  {
    id: 'ts-bloody-tap', group: 'during', tier: 1, title: 'Blood in the needle hub', tree: T.bloodyTap,
    intro: 'Blood that clears to clear CSF is usually a grazed vessel. Blood that doesn’t clear means the tip is not where you want it.',
    after: () => [
      t2note('key', 'Thromboprophylaxis after a bloody tap', `<p>When the next anticoagulant dose can be given after a traumatic puncture depends on the drug and the guideline you follow. Agree it with the surgical team and record it.${cite('asra2025', 'esaic2022')}</p>`),
      pearl('how firm is the evidence?', 'Timing advice for anticoagulants after a traumatic puncture rests mostly on case series, pharmacology and expert consensus, not on trials. That is why guidelines differ. In practice, the patient’s other risk factors (kidney function, age, other drugs) matter as much as the single bloody tap, and neurological checks matter more than the timing rule.'),
    ],
  },
  {
    id: 'ts-paraesthesia', group: 'during', tier: 1, title: 'Paraesthesia', tree: T.paraesthesia,
    intro: 'A brief electric shock is common and often means you are already in the subarachnoid space. Persistent paraesthesia, or pain on injection, is a stop sign.',
    after: () => [
      t2note('pearl', 'Large French survey, 1997', '<p>In a French survey of over 40 000 spinals, most of the neurological injuries after regional anaesthesia followed paraesthesia during puncture or pain on injection, and the deficit matched where the paraesthesia was felt.</p>'),
      pearl('sedation hides the warning', 'The patient’s report is your main safety check for needle-to-nerve contact. A deeply sedated patient cannot warn you. Keep sedation light until the spinal is in, and take any movement or a withdrawal reaction during injection as seriously as a spoken complaint.'),
    ],
  },
  {
    id: 'ts-bone', group: 'during', tier: 1, title: 'Bone contact', tree: T.bone, guide: true,
    intro: 'The depth at which you meet bone tells you which bone it is. Use the guide to see the likely structure and the redirect, then work through the tree.',
    after: () => [
      pearl('the bent needle', 'A fine needle that has hit bone may bend or, with a cutting tip, develop a burr. Either spoils the feel and the path, and a bent tip tends to steer to one side however you aim. If the needle has met bone firmly more than once, change it rather than keep redirecting. Use an introducer so you can pass a fresh needle on the same line.'),
    ],
  },
  {
    id: 'ts-difficult-back', group: 'during', tier: 1, title: 'The difficult back', tree: T.difficultBack, back: true,
    intro: 'Plan for difficulty before you start: position, ultrasound, an experienced colleague and a backup anaesthetic.',
    before: () => [tier(callout('key', { title: 'Full walkthroughs', body: '<p>This is a short summary. The step-by-step approach for each kind of difficult spine is in <a href="#spines">Challenging spines</a>.</p>' }), 1)],
    after: () => [
      pearl('mark in the position you will use', 'Skin marks made from an ultrasound scan are only as good as the position. If the patient moves between the scan and the needle, the relation between skin and spine changes. Scan in the final position, mark, and puncture without letting the patient change posture. Think too about whether neuraxial is the best choice: if you expect repeated failure, general anaesthesia, or a peripheral block for limb surgery, may be safer.'),
    ],
  },
  // ---- after injection
  {
    id: 'ts-first-five', group: 'after', tier: 1, title: 'First 5 minutes after injection', checklist: true,
    intro: 'Most problems with a spinal show up early. Stay with the patient, and use this list after every injection.',
    body: firstFive,
  },
  {
    id: 'ts-failed', group: 'after', tier: 1, title: 'Inadequate or failed spinal', tree: T.failed,
    intro: 'Failure ranges from no block at all to a block of the wrong height, density, duration or side. Wait about 20 minutes and test properly before you call it failed.',
    before: () => [tier(failedCauses(), 2), tier(P('Categories follow Fettes et al. Management by pattern: wait and test, posture, a cautious repeat spinal, supplementation, sedation and analgesia, or general anaesthesia.', 'ts-small'), 2)],
    after: () => [
      pearl('the subdural block', 'A needle tip or drug that ends up in the subdural space (between the dura and the arachnoid) can give a block that is patchy, slow, higher than expected, or spares some segments. It cannot be reliably told from other causes at the bedside, so treat any odd block as unpredictable, and avoid adding more drug on top of it.'),
    ],
  },
  {
    id: 'ts-wearing-off', group: 'after', tier: 2, title: 'The spinal that is wearing off during surgery', tree: T.wearingOff,
    intro: 'The block was working, and now the patient feels pain. Decide quickly whether to supplement or convert to general anaesthesia, and keep the surgeon informed.',
    after: () => [
      pearl('plan for the long case', 'Sensory block regresses from the top down, so an upper abdominal operation outlasts its block sooner than a foot operation done with the same spinal. For surgery likely to be long, or of uncertain length, choose a technique you can extend (a combined spinal–epidural or an epidural) or plan general anaesthesia from the start, rather than hoping a single injection will last.'),
    ],
  },
  {
    id: 'ts-high-spinal', group: 'after', tier: 1, title: 'High or total spinal', tree: T.highSpinal,
    intro: `Signs come in sequence: hypotension and bradycardia, then difficulty breathing, arm weakness, falling consciousness and apnoea. Manage airway, breathing and circulation; intubate and ventilate if needed, then keep the patient asleep.${cite('ts-qrh2023')}`,
    after: () => [
      tier(callout('key', { title: 'Position', body: '<p>The QRH advises raising the legs and avoiding head-down tilt.</p>' }), 1),
      t2note('key', 'Why that order?', '<p>Fibres to the heart leave the cord at T1–T4, so a high block removes the heart’s sympathetic drive and the heart slows. The hands are supplied from C6–T1, so weak hands tell you the block has reached the level where breathing muscles are affected (the diaphragm is supplied from C3–C5). Falling consciousness comes mostly from low blood flow and hypoxia, and sometimes from drug reaching the brainstem. Because the sequence can run quickly, treat the early signs early.</p>'),
      pearl('low flow to the brain', 'Apnoea in a high spinal is often attributed to poor blood flow to the brainstem as much as to paralysis of the diaphragm. That is why restoring the circulation (legs up, vasopressor, fluid) is part of the treatment alongside ventilation. A very high block can also follow a delayed rise after a change of position, or a repeat dose given on top of a partly working block.'),
    ],
  },
  {
    id: 'ts-hypotension', group: 'after', tier: 1, title: 'Hypotension and bradycardia', tree: T.hypotension,
    intro: 'Common after a spinal, and more likely with a higher block and in older patients. Look for other causes, treat early, and treat the heart rate as well as the pressure.',
    before: () => [t2note('key', 'When to treat, and with what', '<p>There is no single definition of hypotension. Many teams treat a systolic pressure below about 90 mmHg or a fall of more than 20–30% from baseline, adjusted for the patient (for example chronic hypertension or cerebrovascular disease).</p>')],
    after: () => [
      tier(doseTable(), 1),
      t2note('key', 'Why it happens', '<p>The spinal blocks sympathetic fibres. Veins dilate, so less blood returns to the heart (lower preload). Arterioles dilate, so resistance falls. With a block at or above the cardiac fibres (T1–T4) the heart cannot speed up, and low venous return can trigger a reflex slowing of the heart (the Bezold–Jarisch reflex). That is why a slow heart rate and low pressure often go together.</p>'),
      t2note('key', 'Adrenaline', `<p>For severe or refractory hypotension or bradycardia, the QRH lists adrenaline ${D('1 µg/kg')} (adult ${D('10–100 µg')}) IV, in emergency only.${cite('ts-qrh2023')} Call for senior help.</p>`),
      pearl('fluid alone is a weak shield', 'Giving a large volume of fluid before the spinal does little to prevent hypotension. Treating early with a vasopressor, and keeping venous return up with the legs raised, work better. In an older or frail patient, extra fluid also risks overload once the block wears off and vascular tone returns. In a patient with a low heart rate or poor ventricular function, remember that a pure alpha agonist can lower the heart rate and cardiac output while it raises the pressure.'),
    ],
  },
  {
    id: 'ts-nausea', group: 'after', tier: 1, title: 'Nausea and vomiting', tree: T.nausea,
    intro: 'After a spinal, nausea means low blood pressure until proved otherwise. Treat the pressure first.',
    after: () => [
      t2note('key', 'Antiemetics', '<p>Ondansetron is used here because its label dose is clear. Other antiemetics are also used.</p>'),
      pearl('vagal nausea', 'A high block leaves the vagus unopposed, which increases gut movement. Nausea can come with a slow heart rate even when the pressure is acceptable, and atropine or glycopyrronium may relieve it. Surgical traction on the peritoneum or bowel is a separate cause that no antiemetic fully controls.'),
    ],
  },
  {
    id: 'ts-shivering', group: 'after', tier: 2, title: 'Shivering', tree: T.shivering,
    intro: 'Very common after neuraxial anaesthesia. Warm first; drugs are second line.',
    after: () => [
      t2note('key', 'Drug treatment', '<p>Pethidine is the most studied drug for shivering. Alternatives include tramadol, clonidine and dexmedetomidine. Check a drug reference for doses and interactions (for example MAOIs).</p>'),
      pearl('redistribution', 'A spinal widens the blood vessels below the block, and core heat flows out to the legs. Core temperature can fall quickly in the first hour, and the patient cannot feel or respond normally because the block removes the cold signal from the legs. Pre-warming before the block, and warming from the start of the case, reduce this.'),
    ],
  },
  {
    id: 'ts-pruritus', group: 'after', tier: 2, title: 'Itch (pruritus)', tree: T.pruritus,
    intro: 'Itch after an intrathecal opioid is common and usually settles. Remember it is an opioid effect: check sedation and breathing.',
    after: () => [
      t2note('key', 'Naloxone for itch', '<p>Low-dose naloxone regimens for itch vary. Start small and titrate: too much reverses the analgesia.</p>'),
      pearl('other options', 'Antihistamines mainly sedate, because the itch is not driven by histamine. Other agents with some evidence include 5-HT3 antagonists such as ondansetron, and mixed agonist–antagonist opioids such as nalbuphine. Use a drug reference for the dose, and remember that any sedative adds to the risk with an intrathecal opioid.'),
    ],
  },
  {
    id: 'ts-retention', group: 'after', tier: 1, title: 'Urinary retention', tree: T.retention,
    intro: 'Common after surgery, especially with long-acting spinals and intrathecal opioids. A bladder scan guides what to do.',
    before: () => [tier(callout('warn', { title: 'Red flags', body: '<p>Retention with new back pain, numbness around the anus or genitals, new leg weakness, or a block that has lasted far longer than expected is not routine. Get urgent senior review. See <a href="#complications">Complications</a>.</p>' }), 1)],
    after: () => [
      pearl('the last to return', 'The sacral segments that supply the bladder are the last to recover from a spinal, and bladder sensation can return after the legs feel normal. A long-acting drug, intrathecal opioid, pre-existing outflow obstruction in men and large IV fluid volumes all raise the chance of retention. Scan before the patient goes to the ward if the case was long.'),
    ],
  },
  // ---- scenarios
  { id: 'ts-case-hip', group: 'case', tier: 1, title: 'Hip fracture: BP 70/40, HR 45', tree: T.caseHip, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
  { id: 'ts-case-paraesthesia', group: 'case', tier: 2, title: 'Electric shock down the leg', tree: T.caseParaesthesia, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
  { id: 'ts-case-unilateral', group: 'case', tier: 2, title: 'One-sided block', tree: T.caseUnilateral, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
];

const GROUPS = [
  { id: 'during', label: 'During the procedure' },
  { id: 'after', label: 'After injection' },
  { id: 'case', label: 'What would you do?' },
];

const tierMax = () => Number(document.body.dataset.tierMax) || 3;

// ---------------------------------------------------------------- mount
export function mount(root) {
  root.append(
    keyPoints([
      'Only inject when clear CSF flows freely and aspirates easily.',
      'Stop injecting and withdraw if there is persistent paraesthesia or pain on injection.',
      'Agree before you start how many passes you will make. Get senior help early; use sitting position and an ultrasound pre-scan for a hard back (see Challenging spines).',
      'First 5 minutes after injection: BP every 1–2 minutes, ask about nausea, breathing and hands, test the level, keep the position as planned.',
      'Low BP with nausea: treat the pressure first. Slow heart rate with low BP: treat both (ephedrine, or atropine or glycopyrronium), and call for help.',
      'Breathless, weak hands or drowsy: a high spinal. Call for help, give oxygen, raise the legs (no head-down tilt) and secure the airway.',
      'Wait about 20 minutes and test properly before you call a block failed. Do not repeat a spinal that is working, patchy or low.',
      'If the block wears off in surgery, tell the surgeon, supplement in small steps or convert to general anaesthesia early.',
    ]),
    P('Decision trees for problems during and after a spinal. Pick a problem, answer each question, and the tree gives you the next step. Every tree ends in an action, a caution or an escalation.', 'sp-lead'),
    tier(callout('warn', { title: 'If the patient deteriorates', body: '<p><strong>Call for help early.</strong> Go back to airway, breathing and circulation. These trees support your judgement and a senior colleague’s; they don’t replace them.</p>' }), 1),
  );

  const layout = el('div', { class: 'ts-layout' });
  const index = el('nav', { class: 'ts-index', 'aria-label': 'Troubleshooting problems' });
  const host = el('div', { class: 'ts-panels' });
  layout.append(index, host);
  root.append(layout);

  const links = new Map();
  const panels = new Map();
  const trees = new Map();
  let current = null;

  GROUPS.forEach((g) => {
    const items = PANELS.filter((p) => p.group === g.id);
    index.append(el('p', { class: 'ts-index-h', id: `ts-index-${g.id}`, text: g.label }));
    const ol = el('ul', { class: 'ts-index-list', 'aria-labelledby': `ts-index-${g.id}` });
    items.forEach((p) => {
      const a = el('a', { href: `#${p.id}`, class: 'ts-index-link', on: { click: (e) => onLink(e, p.id) } }, p.title);
      links.set(p.id, a);
      ol.append(tier(el('li', {}, a), p.tier));
    });
    index.append(ol);
  });

  PANELS.forEach((p) => {
    const g = GROUPS.find((x) => x.id === p.group);
    const art = tier(el('article', { class: 'ts-panel', id: p.id, 'aria-labelledby': `${p.id}-h`, hidden: true }), p.tier);
    art.append(el('p', { class: 'ts-panel-kicker', text: g.label }));
    art.append(el('h3', { class: 'ts-panel-h', id: `${p.id}-h`, tabindex: '-1', text: p.title }));
    if (p.intro) art.append(P(p.intro, 'ts-intro'));
    (p.before?.() || []).forEach((n) => art.append(n));
    if (p.back) art.append(backSelector());
    if (p.body) p.body().forEach((n) => art.append(n));

    let guide = null;
    if (p.guide) {
      guide = redirectGuide({ id: 'ts-bone-guide', num: '4.1' });
      art.append(guide.fig);
    }

    if (p.tree) {
      const tree = createTree(p.tree, {
        headingLevel: 4,
        kicker: p.scenario ? 'What would you do?' : p.back ? 'Decision tree: before you start' : 'Decision tree',
        onNode: guide ? (_id, node) => { if (node.guide) guide.set(node.guide); } : undefined,
      });
      trees.set(p.id, tree);
      if (p.scenario) {
        const n1 = p.tree.nodes[p.tree.start];
        tree.el.classList.add('ts-tree--case');
        if (n1?.detail) tree.el.dataset.case = 'true';
      }
      art.append(tier(tree.el, p.tier));
    }
    (p.after?.() || []).forEach((n) => art.append(n));

    if (p.tree) {
      const outline = tier(el('details', { class: 'sp-details ts-outline-d', id: `${p.id}-all` },
        el('summary', { text: p.scenario ? 'Show all choices and feedback' : 'Show the whole tree as a list' })), 2);
      // Built now (not on open) so every ref the tree cites is in the DOM when app.js numbers the references.
      outline.append(treeOutline(p.tree));
      art.append(outline);
    }

    panels.set(p.id, art);
    host.append(art);
  });

  const panelTier = (id) => Number(panels.get(id).dataset.tier) || 1;

  function select(id, { focus = false, record = true } = {}) {
    if (!panels.has(id)) return false;
    if (current && current !== id) {
      panels.get(current).hidden = true;
      links.get(current).removeAttribute('aria-current');
    }
    current = id;
    panels.get(id).hidden = false;
    links.get(id).setAttribute('aria-current', 'true');
    if (record) remember(id);
    if (focus) {
      const h = panels.get(id).querySelector('.ts-panel-h');
      h.focus({ preventScroll: true });
      announce(`${PANELS.find((x) => x.id === id).title}: decision tree`);
    }
    return true;
  }

  // If the reader lowers the level while a higher-tier problem is open, move to one that is still shown.
  new MutationObserver(() => {
    if (!current || panelTier(current) <= tierMax()) return;
    const g = PANELS.find((x) => x.id === current).group;
    const next = PANELS.find((x) => x.group === g && x.tier <= tierMax()) || PANELS.find((x) => x.tier <= tierMax());
    if (next) select(next.id, { record: false });
  }).observe(document.body, { attributes: true, attributeFilter: ['data-tier-max'] });

  function onLink(e, id) {
    // Let the hash change (so the link is shareable), but switch the panel first; app.js then scrolls.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    // Don't record yet: the history entry this click creates doesn't exist until the hash changes.
    select(id, { record: location.hash === `#${id}` });
    if (location.hash === `#${id}`) {
      e.preventDefault();
      panels.get(id).scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      panels.get(id).querySelector('.ts-panel-h').focus({ preventScroll: true });
    }
  }

  // Record the open panel on each history entry, so browser Back/Forward restores it
  // (index links and in-tree links add hash entries; going back to an entry without a ts- hash,
  // or with no hash, would otherwise leave the later panel showing).
  function remember(id) {
    try {
      if (history.state?.tsPanel !== id) history.replaceState({ ...(history.state || {}), tsPanel: id }, '');
    } catch { /* history unavailable: Back just won't restore the panel */ }
  }
  window.addEventListener('hashchange', () => { if (current) remember(current); });
  window.addEventListener('popstate', (e) => {
    const id = e.state?.tsPanel || (location.hash ? null : PANELS[0].id);
    if (id && id !== current) select(id);
  });

  select(PANELS[0].id);

  return {
    reveal(hashId) {
      if (panels.has(hashId)) return select(hashId);
      const target = root.querySelector(`#${CSS.escape(hashId)}`);
      const panel = target?.closest('.ts-panel');
      if (panel) {
        select(panel.id);
        if (target.tagName === 'DETAILS') target.open = true;
        return true;
      }
      return false;
    },
  };
}
