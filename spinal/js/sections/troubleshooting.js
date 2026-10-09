// Troubleshooting chapter (v3).
// Top: a "Do this first" emergency card with the doses (product label and QRH side by side).
// Then a problem picker and one panel per problem. Decision trees live in js/troubleshooting/trees.js.
// Doses: only product labels (emc SmPC) or the Association of Anaesthetists QRH, each cited where it appears.
// Tiers: every panel, and every block inside it, carries a learning tier (1 MO, 2 Resident, 3 Advanced).
import { el, callout, table, cite, announce, tier, keyPoints, registerSearch, details } from '../ui.js?v=1';
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
const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------- "Do this first" card
function dosesTable() {
  const qrh = cite('ts-qrh2023');
  const t = table({
    id: 'ts-doses',
    caption: 'Adult IV emergency doses, by source',
    head: ['Drug', 'Product label (emc SmPC)', 'QRH (Association of Anaesthetists)'],
    rows: [
      [{ html: 'Phenylephrine', th: true }, `${D('50–100 µg')} bolus, repeated to effect; no single bolus over ${D('100 µg')}${cite('ts-smpc-phe')}`, `${D('50–100 µg')} boluses, or an infusion${qrh}`],
      [{ html: 'Metaraminol', th: true }, `Up to ${D('1 mg')} per bolus; cumulative bolus maximum ${D('5 mg')}${cite('ts-smpc-met')}`, `${D('1–2 mg')} boluses${qrh}`],
      [{ html: 'Ephedrine', th: true }, `${D('3–6 mg')} slow IV; maximum ${D('9 mg')} per dose, every 3–4 min, up to ${D('30 mg')}${cite('ts-smpc-eph')}`, `${D('6–12 mg')} boluses, up to ${D('30 mg')}; repeated doses work less well${qrh}`],
      [{ html: 'Atropine', th: true }, `${D('0.5 mg')}; repeat every 2–5 min to effect${cite('ts-smpc-atr')}`, `${D('0.6–1.2 mg')}${qrh}`],
      [{ html: 'Glycopyrronium', th: true }, `${D('200–400 µg')}; may be repeated${cite('ts-smpc-gly')}`, `${D('0.2–0.4 mg')} (the same dose)${qrh}`],
      [{ html: 'Adrenaline', th: true }, 'Not part of the labels used on this page', `${D('1 µg/kg')} (adult ${D('10–100 µg')}) IV for severe or refractory hypotension or bradycardia${qrh}`],
    ],
  });
  return t;
}

function emergencyCard() {
  const card = el('section', { class: 'ts-first', id: 'ts-first', 'aria-labelledby': 'ts-first-h' });
  card.append(
    el('p', { class: 'ts-first-kicker', text: 'Emergency card' }),
    el('h3', { class: 'ts-first-h', id: 'ts-first-h', text: 'Do this first' }),
    el('ol', { class: 'ts-first-steps' },
      el('li', { html: '<strong>Call for help.</strong> Ask the surgeon to pause. Stop sedation.' }),
      el('li', { html: '<strong>Airway, breathing, 100% oxygen.</strong> Can they speak? Can they squeeze your hand?' }),
      el('li', { html: '<strong>Raise the legs. Do not tilt head-down.</strong> Give an IV fluid bolus.' }),
      el('li', { html: '<strong>Treat the pressure and the heart rate</strong> with the doses below, and check the block height.' })),
  );
  const mini = el('div', { class: 'ts-first-grid' });
  const m = (cls, h, body, link, linkText) => mini.append(el('div', { class: `ts-mini ts-mini--${cls}` },
    el('h4', { class: 'ts-mini-h', text: h }),
    el('p', { class: 'ts-mini-b', html: body }),
    el('a', { class: 'ts-mini-a', href: link }, linkText)));
  m('a', 'Low pressure, heart rate normal or fast',
    `Phenylephrine ${D('50–100 µg')} IV, or metaraminol up to ${D('1 mg')}. Repeat to effect.`, '#ts-hypotension', 'Hypotension tree');
  m('b', 'Low pressure and slow heart',
    `Ephedrine ${D('3–6 mg')} slow IV, plus atropine ${D('0.5 mg')} or glycopyrronium ${D('200–400 µg')}.`, '#ts-bradycardia', 'Slow heart and arrest');
  m('c', 'Breathless, weak hands, drowsy',
    'High or total spinal. Oxygen, call help, treat pressure and rate, secure the airway if failing, then keep the patient asleep.', '#ts-high-spinal', 'High or total spinal');
  m('d', 'No pulse, or unresponsive',
    `Start CPR, call the arrest team and follow the ALS algorithm. Severe or refractory hypotension or slow heart before arrest: adrenaline ${D('1 µg/kg')} (adult ${D('10–100 µg')}), the QRH dose. Think of local anaesthetic toxicity.`, '#cx-last', 'LAST: emergency steps');
  card.append(mini, dosesTable());
  card.append(callout('key', {
    title: 'Which column?',
    body: `<p>The drugs agree; only the ranges differ. The label column is the licensed range for routine use. The QRH column is the range printed for a high-block emergency (QRH 3-11). <strong>Routine hypotension or a slow rate: start with the label dose and titrate. High block or a failing circulation: use the QRH range.</strong> Reassess every 1–2 minutes. If the rate is slow, prefer ephedrine and an antimuscarinic to phenylephrine. Why each drug acts as it does: <a href="#ph-pressors">Vasopressors</a>.</p>`,
  }));
  return tier(card, 1);
}

// ---------------------------------------------------------------- reusable blocks
const pearl = (title, body) => tier(callout('key', { title: `Advanced pearl: ${title}`, body: `<p>${body}</p>` }), 3);
const t2note = (kind, title, body) => tier(callout(kind, { title, body }), 2);
const t1note = (kind, title, body) => tier(callout(kind, { title, body }), 1);
const tbl = (opts, t) => tier(table(opts), t);

function dryTapCauses() {
  return tbl({
    id: 'ts-dry-tap-causes', caption: 'Why no CSF comes', head: ['Cause', 'Clue', 'What to do'],
    rows: [
      [{ html: 'Needle too shallow', th: true }, 'Less than the expected depth, no bone', 'Advance 1–2 mm at a time with the stylet in, and check the hub each time'],
      [{ html: 'Needle off the midline', th: true }, 'Bone at an early or odd depth', 'See <a href="#ts-bone">Bone contact</a>'],
      [{ html: 'Needle past the space', th: true }, 'Deep, no CSF; sometimes blood or a shock down a leg', 'Withdraw slowly, watching the hub: CSF sometimes appears on the way back. Then re-check the line'],
      [{ html: 'Blocked lumen', th: true }, 'Right depth, no flow, a firm “give” felt', 'Replace the stylet to clear it, or use a new needle'],
      [{ html: 'Slow flow', th: true }, 'Fine pencil-point needle, patient lying, low CSF pressure', 'Wait, sit the patient up, ask for a cough, or aspirate gently with a small syringe'],
      [{ html: 'Anatomical barrier', th: true }, 'Repeated failures; stenosis, previous surgery, calcified ligaments', 'Another interspace, a paramedian approach, ultrasound or another plan: <a href="#sx-scoliosis">Difficult backs</a>'],
    ],
  }, 2);
}

function failedCauses() {
  const rows = [
    ['Failed lumbar puncture', 'Needle never in the subarachnoid space: technique, position, anatomy, a blocked needle. Includes “pseudo-success”, where fluid that is not CSF (or CSF from a cyst) flows.'],
    ['Faulty injection', 'Leak at the hub, needle moved while attaching the syringe, pencil-point side hole only partly through the dura, dead-space loss.'],
    ['Inadequate spread', 'Anatomical barriers (stenosis, adhesions), a large lumbosacral CSF volume, unpredictable spread of plain solutions, heavy solution pooling after a low injection.'],
    ['Failure of drug action', 'Wrong drug or syringe swap, contamination, an inactive drug. “Local anaesthetic resistance” is unproven.'],
    ['Mismanagement of a working block', 'Anxiety, poor expectations, testing too early, visceral traction during surgery.'],
  ];
  return tbl({ caption: 'Why spinals fail (after Fettes et al.)', head: ['Category', 'Examples'], rows: rows.map(([a, b]) => [{ html: a, th: true }, b]), id: 'ts-failed-causes' }, 2);
}

function failedOptions() {
  return tbl({
    id: 'ts-failed-options', caption: 'Your options, compared', head: ['Option', 'Use when', 'Watch for'],
    rows: [
      [{ html: 'Wait and re-test', th: true }, 'Under about 20 minutes, and the block is still developing', 'Starting surgery on a block you have not tested. Do a covert pinch first'],
      [{ html: 'Position', th: true }, 'Hyperbaric drug, block too low or one-sided (unblocked side down)', 'Head-down only if the pressure is stable; it never treats low pressure. Plain solutions rarely respond'],
      [{ html: 'Supplement', th: true }, 'Patchy or fading block, calm and stable patient', 'Sedation on top of a high block or intrathecal opioid; give small doses and watch breathing'],
      [{ html: 'Repeat spinal', th: true }, 'No block at all after about 20 minutes, with a cause you can fix', 'A high block if any drug went in; usually a reduced dose, agreed with a senior'],
      [{ html: 'Epidural top-up', th: true }, 'A CSE or epidural catheter is already in', 'Small steps. Extra volume can push a spinal block higher'],
      [{ html: 'General anaesthesia', th: true }, 'Pain not controlled, unstable or distressed patient, or no safe alternative', 'A reduced induction dose; the spinal still lowers the pressure'],
    ],
  }, 1);
}

function bloodTable() {
  return tbl({
    id: 'ts-bloody-what', caption: 'Blood in the hub: what it means', head: ['What you see', 'Likely cause', 'Do'],
    rows: [
      [{ html: 'Blood that clears to clear CSF', th: true }, 'Grazed epidural vein on the way in', 'Proceed once flow is free; record it'],
      [{ html: 'Blood that stays, no CSF', th: true }, 'Tip in an epidural vein, often off the midline', 'Do not inject. Withdraw, re-check the midline, redirect or change level'],
      [{ html: 'Yellow or cloudy fluid', th: true }, 'Not clear CSF', 'Do not inject. Stop and tell a senior'],
    ],
  }, 2);
}

// "First 5 minutes after injection": a checklist, not a decision tree.
function firstFive() {
  const steps = [
    ['Note the time of injection.', 'Everything after this is timed from it.'],
    ['Lie the patient as you planned for this operation.', 'A heavy solution spreads with gravity in the first minutes, so the position matters. If the pressure falls, raise the legs; do not tilt head-down.'],
    ['Cycle the blood pressure every 1–2 minutes.', 'Watch the heart rate and oxygen saturation too. Have a vasopressor and an anticholinergic drawn up before you inject.'],
    ['Ask about nausea.', 'Nausea soon after a spinal means low blood pressure until proved otherwise.'],
    ['Ask about breathing and hands.', 'Ask: “Is your breathing easy? Can you squeeze my hand?” Tingling or weak hands, or a feeling of breathlessness, can mean the block is rising too high.'],
    ['Test the level.', 'Use cold (ice or an alcohol swab) or pinprick, on both sides, from the feet upwards. Note the top level and the time. Re-test until the level has stopped rising. See <a href="#tq-testing">Testing the block</a>.'],
    ['Keep talking to the patient.', 'Tell them what to expect: warm, heavy, numb legs. Reassurance reduces anxiety and helps you spot a change in their voice or alertness.'],
    ['Do not let the surgery start until the block is tested.', 'A covert pinch with forceps before incision tells you more than the level alone.'],
  ];
  const ol = el('ol', { class: 'ts-checklist' }, ...steps.map(([h, t]) => el('li', {}, el('strong', { text: h }), ' ', el('span', { html: t }))));
  const stop = callout('warn', {
    title: 'Stop and get help if',
    body: `<ul>
      <li>The blood pressure falls quickly, or the heart rate drops below normal: go to <a href="#ts-hypotension">Hypotension</a> or <a href="#ts-bradycardia">Slow heart rate</a>.</li>
      <li>The patient is breathless, has weak hands, struggles to speak or becomes drowsy: go to <a href="#ts-high-spinal">High or total spinal</a>.</li>
      <li>The patient is pale, sweaty, vomiting or says they feel faint.</li>
    </ul>`,
  });
  return [tier(ol, 1), tier(stop, 1)];
}

function highSigns() {
  return tbl({
    id: 'ts-high-signs', caption: 'How a rising block shows itself', head: ['Stage', 'What you see', 'What it means'],
    rows: [
      [{ html: '1', th: true }, 'Warm, heavy legs; nausea; falling pressure and heart rate', 'Sympathetic block, including the cardiac fibres (T1–T4)'],
      [{ html: '2', th: true }, 'Breathless, cannot cough, quiet voice', 'Loss of intercostal and abdominal muscle power (the diaphragm, C3–C5, is usually spared), plus anxiety'],
      [{ html: '3', th: true }, 'Tingling or weak hands and arms', 'Block at cervical level (C6–T1 supply the hands)'],
      [{ html: '4', th: true }, 'Drowsy, then unconscious; apnoea', 'Poor brainstem blood flow and hypoxia, and sometimes drug reaching the brainstem'],
    ],
  }, 2);
}

function highCauses() {
  return tbl({
    id: 'ts-high-causes', caption: 'Why a block goes too high', head: ['Cause', 'Example'],
    rows: [
      [{ html: 'Dose too large for the patient', th: true }, 'Pregnancy, obesity, the very old, short stature, raised abdominal pressure'],
      [{ html: 'Gravity', th: true }, 'Head-down tilt or a change of position after a heavy solution'],
      [{ html: 'More drug on top', th: true }, 'A repeat spinal, or an epidural top-up after a spinal (epidural volume pushes the block up)'],
      [{ html: 'Wrong space or route', th: true }, 'Subdural spread, intrathecal catheter, epidural dose given into the CSF'],
    ],
  }, 2);
}

function highEffects() {
  return tbl({
    id: 'ts-high-effects', caption: 'What a high block does, system by system', head: ['System', 'Effect', 'At the bedside'],
    rows: [
      [{ html: 'Cardiovascular', th: true }, 'Venous pooling lowers preload; arterial tone falls; cardiac fibres (T1–T4) blocked', 'Low pressure and slow heart. Coronary and cerebral perfusion follow the pressure'],
      [{ html: 'Respiratory', th: true }, 'Intercostal and abdominal muscles weak; expiratory reserve and cough fall. The diaphragm is spared unless the block reaches C3–C5', 'Breathless, weak cough. Patients with lung disease who rely on accessory muscles are hit hardest'],
      [{ html: 'Gut', th: true }, 'Sympathetic block leaves the vagus unopposed: contracted gut, more secretions', 'Nausea and vomiting, often with a slow rate'],
      [{ html: 'Kidney and bladder', th: true }, 'Kidney flow is autoregulated until the pressure is low. The bladder (S2–S4) is blocked', 'Retention after the block'],
      [{ html: 'Temperature', th: true }, 'Vasodilation below the block loses heat; no vasoconstriction there', 'Falling core temperature, shivering'],
    ],
  }, 2);
}

function whichPressor() {
  return tbl({
    id: 'ts-which-pressor', caption: 'Which vasopressor?', head: ['Heart rate', 'First choice', 'Why', 'Careful with'],
    rows: [
      [{ html: 'Normal or fast', th: true }, 'Phenylephrine or metaraminol', 'Alpha-1 agonists: tighten arteries and veins and restore the pressure', 'They can slow the heart and lower cardiac output if the rate was already low'],
      [{ html: 'Slow', th: true }, 'Ephedrine, with atropine or glycopyrronium if very slow', 'Ephedrine adds beta-1 action: more rate and output', 'Repeated doses work less well (tachyphylaxis)'],
      [{ html: 'Falling fast, or nearly arrested', th: true }, 'Antimuscarinic first, then adrenaline', 'The heart has lost its sympathetic drive; speed and force are needed', 'Call help early'],
      [{ html: 'Needing repeat boluses', th: true }, 'A vasopressor infusion', 'Smoother pressure than repeated boluses. Noradrenaline is also used', 'Needs a pump and close monitoring'],
    ],
  }, 1);
}

function hypotensionWhy() {
  return tbl({
    id: 'ts-hypo-why', caption: 'Why the pressure falls', head: ['Part of the circulation', 'What the block does', 'Result'],
    rows: [
      [{ html: 'Veins (preload)', th: true }, 'Sympathetic block dilates the veins; blood pools in the legs and gut', 'Less return to the heart. This is the larger effect'],
      [{ html: 'Arteries (afterload)', th: true }, 'Arterial tone falls, but less than venous tone', 'Resistance falls moderately'],
      [{ html: 'Heart rate', th: true }, 'Above T4 the cardiac fibres are blocked; low filling can trigger the Bezold–Jarisch reflex (reflex slowing and dilation)', 'Slow heart and low pressure together'],
      [{ html: 'Cardiac output', th: true }, 'Falls mainly with preload, and with a slow heart rate', 'Often modest; worse in the old, the hypovolaemic and those on beta-blockers or ACE inhibitors, whose reflexes are blunted'],
    ],
  }, 2);
}

function sideEffects() {
  const rows = [
    ['ts-nausea', 'Nausea and vomiting',
      'Low blood pressure (the commonest cause), unopposed vagal tone with a high block, traction on the bowel or peritoneum, opioids.',
      'Prevent and treat hypotension early. Avoid opioids that are not needed.',
      `<strong>Treat the pressure first</strong> (<a href="#ts-hypotension">Hypotension</a>). Slow heart: atropine ${D('0.5 mg')}${cite('ts-smpc-atr')} or glycopyrronium ${D('200–400 µg')}.${cite('ts-smpc-gly')} Then ondansetron ${D('4 mg')} slow IV (label dose for established PONV).${cite('ts-smpc-ond')} Ask the surgeon to ease traction.`],
    ['ts-shivering', 'Shivering',
      'Heat redistributes to the cool legs and the block removes vasoconstriction there. Also cold fluids and a cold theatre. A median of 55% in control groups of 21 studies.',
      'Pre-warm. Forced-air warming and warmed fluids from the start.',
      'Warm first. If it is distressing or straining the heart or lungs: pethidine (the best studied); tramadol, clonidine and dexmedetomidine are alternatives. Check for MAOIs. Think of sepsis or a transfusion reaction if it is atypical.'],
    ['ts-pruritus', 'Itch (pruritus)',
      'Intrathecal opioid acting in the spinal cord, not histamine. Face, neck and upper chest.',
      'Use the lowest opioid dose that works.',
      'Reassure. Distressing: ondansetron, nalbuphine, or small titrated doses of naloxone (too much reverses the analgesia). Antihistamines mainly sedate. <strong>Rash, wheeze or low pressure is allergy, not itch.</strong> Check sedation and breathing.'],
    ['ts-retention', 'Urinary retention',
      'S2–S4 are the last segments to recover. Long-acting drug, intrathecal opioid, outflow obstruction, large fluid volumes.',
      'Shortest-acting adequate drug. Avoid over-filling.',
      'Scan the bladder. Large volume or distress: catheterise (in–out or indwelling), because an over-distended bladder can be damaged. New back pain, numbness around the anus or new weakness is not routine: <a href="#cx-ward">urgent review</a>.'],
    ['ts-resp-depression', 'Sedation or slow breathing after intrathecal opioid',
      'Morphine spreads upwards in the CSF; it can act hours later (up to 24 h).',
      `Lowest dose, and monitoring as in <a href="#tq-adjuncts">Opioid adjuncts</a>.`,
      `Stimulate, give oxygen, support the airway, call for help. Naloxone: label ${D('100–200 µg')} IV in ${D('100 µg')} steps every 2 min. It may need repeating or an infusion, because morphine outlasts it.${cite('ts-smpc-nal')}`],
    ['ts-other-se', 'Back pain, headache, leg pain',
      'Needle trauma, positioning, transient neurological symptoms, post-dural puncture headache.',
      'Fine pencil-point needle; careful positioning.',
      'See <a href="#cx-tns">TNS</a> and <a href="#cx-pdph">PDPH</a>. Red flags: <a href="#cx-ward">ward red flags</a>.'],
  ];
  const wrap = table({
    id: 'ts-side-effects-table',
    caption: 'Common side effects: cause, prevention, treatment',
    head: ['Problem', 'Cause', 'Prevent', 'Treat'],
    rows: rows.map(([, name, cause, prevent, treat]) => [{ html: name, th: true }, cause, prevent, treat]),
  });
  wrap.querySelectorAll('tbody tr').forEach((tr, i) => { tr.id = rows[i][0]; });
  return tier(wrap, 1);
}

// ---------------------------------------------------------------- panels
const BACK_LINKS = '<ul class="ts-linklist"><li><a href="#sx-scoliosis">Scoliosis</a></li><li><a href="#spines">All difficult backs: obesity, elderly, previous surgery, ankylosing spondylitis</a></li><li><a href="#ultrasound">Ultrasound-assisted neuraxial</a></li><li><a href="#tq-approach">Midline and paramedian approaches</a></li></ul>';

const PANELS = [
  // ---- during the procedure
  {
    id: 'ts-dry-tap', group: 'during', tier: 1, label: 'No CSF (dry tap)', title: 'No CSF (dry tap)', tree: T.dryTap,
    intro: 'Work from the simplest explanation outwards: patience, needle position, a blocked needle, then the patient’s position and anatomy.',
    after: () => [
      dryTapCauses(),
      t2note('key', 'How many passes?', '<p>No international guideline sets a maximum number of passes. Agree with your supervisor, before you start, when to change approach, call a senior colleague or abandon the spinal.</p>'),
      pearl('slow flow', 'CSF pressure at the lumbar level is lower lying than sitting, and a narrow canal can slow the flow further. Sitting the patient up, or asking them to cough or gently strain, raises CSF pressure and can start a slow flow. If the flow starts and then stops, the needle may have moved: confirm free flow again before you inject.'),
    ],
  },
  {
    id: 'ts-bloody-tap', group: 'during', tier: 1, label: 'Blood in the needle', title: 'Blood in the needle hub', tree: T.bloodyTap,
    intro: 'Blood that clears to clear CSF is usually a grazed vessel. Blood that does not clear means the tip is not where you want it.',
    before: () => [bloodTable()],
    after: () => [
      t2note('key', 'Thromboprophylaxis after a bloody tap', `<p>When the next anticoagulant dose can be given after a traumatic puncture depends on the drug and the guideline you follow. Agree it with the surgical team and record it. Timings: <a href="#tq-anticoag">Anticoagulant timing</a>.${cite('asra2025', 'esaic2022')}</p>`),
      pearl('how firm is the evidence?', 'Timing advice for anticoagulants after a traumatic puncture rests mostly on case series, pharmacology and expert consensus, not on trials. That is why guidelines differ. In practice, the patient’s other risk factors (kidney function, age, other drugs) matter as much as the single bloody tap, and neurological checks matter more than the timing rule.'),
    ],
  },
  {
    id: 'ts-paraesthesia', group: 'during', tier: 1, label: 'Paraesthesia', title: 'Paraesthesia', tree: T.paraesthesia,
    intro: 'A brief electric shock is common and often means you are already in the subarachnoid space. Persistent paraesthesia, or pain on injection, is a stop sign.',
    after: () => [
      t2note('pearl', 'Large French survey, 1997', '<p>In a French survey of over 40 000 spinals, most of the neurological injuries after regional anaesthesia followed paraesthesia during puncture or pain on injection, and the deficit matched where the paraesthesia was felt. More on nerve injury: <a href="#cx-neuro">Complications</a>.</p>'),
      pearl('sedation hides the warning', 'The patient’s report is your main safety check for needle-to-nerve contact. A deeply sedated patient cannot warn you. Keep sedation light until the spinal is in, and take any movement or a withdrawal reaction during injection as seriously as a spoken complaint.'),
    ],
  },
  {
    id: 'ts-bone', group: 'during', tier: 1, label: 'Bone contact', title: 'Bone contact', tree: T.bone, guide: true,
    intro: 'The depth at which you meet bone tells you which bone it is. Use the guide to see the likely structure and the redirect, then work through the tree.',
    after: () => [
      pearl('the bent needle', 'A fine needle that has hit bone may bend or, with a cutting tip, develop a burr. Either spoils the feel and the path, and a bent tip tends to steer to one side however you aim. If the needle has met bone firmly more than once, change it rather than keep redirecting. Use an introducer so you can pass a fresh needle on the same line.'),
    ],
  },
  {
    id: 'ts-difficult-back', group: 'during', tier: 1, label: 'Difficult back', title: 'The difficult back', redirect: true,
    intro: 'Obesity, scoliosis, an elderly calcified spine, previous surgery and ankylosing spondylitis each have their own approach. They are taught once, in the Difficult backs chapter.',
    body: () => [
      tier(callout('key', { title: 'Go to', body: BACK_LINKS }), 1),
      tier(callout('warn', { title: 'Before you start on a back you expect to be hard', body: '<p>Sit the patient up if you can. Pre-scan with ultrasound if you have it and mark in the final position. Agree how many passes you will make. Ask for senior help at the start, not after several failed passes. Plan the backup anaesthetic, including the airway.</p>' }), 1),
    ],
  },
  {
    id: 'ts-anxious', group: 'during', tier: 1, label: 'Anxious patient', title: 'The anxious patient', tree: T.anxious,
    intro: 'Anxiety is common in an awake patient. First rule out a physical cause, then talk, and use sedation only when it is safe.',
    after: () => [
      t2note('key', 'Sedation and neuraxial block', '<p>Sedation hides the warning signs you rely on: paraesthesia, breathlessness, weak hands and a change in speech. It adds to the breathing effects of a high block and of intrathecal opioid. Use small doses of one drug, keep verbal contact, and watch the breathing as closely as the saturation.</p>'),
      pearl('drug choice', 'Midazolam, propofol and dexmedetomidine are all used. Dexmedetomidine gives cooperative sedation with little effect on breathing, but it causes bradycardia and hypotension and can prolong the block, which is unhelpful if the heart rate is already slow. Whatever you choose, choose before the block gets high, not after.'),
    ],
  },
  // ---- after injection
  {
    id: 'ts-first-five', group: 'after', tier: 1, label: 'First 5 minutes', title: 'First 5 minutes after injection', checklist: true,
    intro: 'Most problems with a spinal show up early. Stay with the patient, and use this list after every injection.',
    body: firstFive,
  },
  {
    id: 'ts-failed', group: 'after', tier: 1, label: 'Failed or patchy block', title: 'Inadequate or failed spinal', tree: T.failed,
    intro: 'Failure ranges from no block at all to a block of the wrong height, density, duration or side. Wait about 20 minutes and test properly before you call it failed.',
    before: () => [failedOptions()],
    after: () => [
      failedCauses(),
      t2note('key', 'Repeating a spinal', '<p>Repeat only after a complete failure with enough time passed (about 20 minutes) and a cause you can correct. A working, patchy or low block is not a failure: more drug can give a high or total spinal. High intrathecal local anaesthetic concentrations are neurotoxic, and if anatomy caused the failure, a repeat may fail too. Change level, and consider a different needle.</p>'),
      pearl('the subdural block', 'A needle tip or drug that ends up in the subdural space (between the dura and the arachnoid) can give a block that is patchy, slow, higher than expected, or spares some segments. It cannot be reliably told from other causes at the bedside, so treat any odd block as unpredictable, and avoid adding more drug on top of it.'),
    ],
  },
  {
    id: 'ts-wearing-off', group: 'after', tier: 1, label: 'Block wearing off', title: 'The spinal that is wearing off during surgery', tree: T.wearingOff,
    intro: 'The block was working, and now the patient feels pain. Decide quickly whether to supplement or convert to general anaesthesia, and keep the surgeon informed.',
    after: () => [
      t2note('key', 'How long a spinal lasts', '<p>Duration depends on the drug, the dose and the site. Sensory block regresses from the top down and the sacral segments clear last, so an upper abdominal operation outlasts its block sooner than a foot operation done with the same spinal. Time course: <a href="#tq-testing">Testing the block</a>.</p>'),
      pearl('plan for the long case', 'For surgery likely to be long, or of uncertain length, choose a technique you can extend (a combined spinal–epidural or an epidural) or plan general anaesthesia from the start, rather than hoping a single injection will last.'),
    ],
  },
  {
    id: 'ts-hypotension', group: 'after', tier: 1, label: 'Hypotension', title: 'Hypotension', tree: T.hypotension,
    intro: 'Common after a spinal, and more likely with a higher block and in older patients. Look for other causes, treat early, and treat the heart rate as well as the pressure. Legs up, not head-down.',
    before: () => [
      whichPressor(),
      P('Doses: <a href="#ts-doses">the dose table at the top of this chapter</a>.', 'ts-small'),
      t2note('key', 'When to treat', '<p>There is no single definition of hypotension. Many teams treat a systolic pressure below about 90 mmHg or a fall of more than 20–30% from baseline, adjusted for the patient (for example chronic hypertension or cerebrovascular disease).</p>'),
    ],
    after: () => [
      hypotensionWhy(),
      t2note('key', 'Who is at risk, and prevention', `<ul>
        <li><strong>Risk:</strong> older age, a higher block, low baseline pressure, hypovolaemia, emergency surgery, raised abdominal pressure, vasodilating or ACE-inhibitor drugs.</li>
        <li><strong>Prevent:</strong> a vasopressor started with the block (infusion or early bolus) works better than a fluid preload. Fluid given as the block goes in (a co-load) helps more than fluid given beforehand. Leg wrapping or elevation helps. Ondansetron before the block has been shown to reduce hypotension and bradycardia. Use a lower dose in the old and frail. In pregnancy, tilt to the left and take pressure off the vena cava.</li>
      </ul>`),
      pearl('fluid alone is a weak shield', 'Giving a large volume of fluid before the spinal does little to prevent hypotension. Treating early with a vasopressor, and keeping venous return up with the legs raised, work better. In an older or frail patient, extra fluid also risks overload once the block wears off and vascular tone returns. In a patient with a low heart rate or poor ventricular function, remember that a pure alpha agonist can lower the heart rate and cardiac output while it raises the pressure.'),
      pearl('the old and the failing baroreflex', 'In older patients and those on beta-blockers the baroreflex is blunted, so they do not speed up as the pressure falls and they drop further. Long spells of low pressure are linked with kidney injury, myocardial injury and delirium in observational studies, though trials have not shown that treating a particular number improves outcome. In a patient with fixed lesions or a tight coronary stenosis, treat sooner and hold the pressure close to baseline.'),
    ],
  },
  {
    id: 'ts-bradycardia', group: 'after', tier: 1, label: 'Slow heart or arrest', title: 'Slow heart rate and cardiac arrest', tree: T.bradycardia,
    intro: 'A slow heart after a spinal is not benign. The rate can fall further in minutes, and arrest is rare but real. Treat early.',
    before: () => [
      t2note('key', 'Why the heart slows', '<p>Fibres that speed the heart leave the cord at T1–T4. A block at or above that level removes them, and the vagus is left unopposed. Low venous filling can also set off the Bezold–Jarisch reflex, a vagal slowing with vasodilation. Risk factors for a severe slowing: a slow baseline rate, a beta-blocker, a long PR interval, a high block, and young, fit patients with strong vagal tone.</p>'),
    ],
    after: () => [
      t1note('warn', 'Do not wait', `<p>Closed-claims reviews of arrests under spinal (Caplan, 1988) found many in fit patients, often after a falling rate that was not treated promptly, and often with deep sedation. Treat a falling rate before the pressure is low. Adrenaline doses: <a href="#ts-doses">dose table</a>.${cite('ts-qrh2023')} More on arrest: <a href="#cx-cardiac">Complications</a>.</p>`),
      pearl('atropine or glycopyrronium?', 'Atropine acts quickly. Glycopyrronium acts for longer and crosses the blood–brain barrier and the placenta far less. In an emergency use whichever is drawn up. Both can speed the heart only if the vagus is the cause: if the block has taken the sympathetic drive, a drug with beta action (ephedrine, then adrenaline) is needed.'),
    ],
  },
  {
    id: 'ts-high-spinal', group: 'after', tier: 1, label: 'High or total spinal', title: 'High or total spinal', tree: T.highSpinal,
    intro: `Signs come in sequence: hypotension and bradycardia, then difficulty breathing, arm weakness, falling consciousness and apnoea. Manage airway, breathing and circulation; intubate and ventilate if needed, then keep the patient asleep.${cite('ts-qrh2023')}`,
    before: () => [highSigns()],
    after: () => [
      tier(callout('key', { title: 'Position', body: '<p>The QRH advises raising the legs and avoiding head-down tilt.</p>' }), 1),
      highCauses(),
      highEffects(),
      P('Full physiology: <a href="#ch-anatomy">Anatomy and physiology</a>.', 'ts-small'),
      pearl('low flow to the brain', 'Loss of consciousness and apnoea in a high spinal are usually put down to poor brainstem blood flow and hypoxia, with or without drug spread, more than to paralysis of the diaphragm (C3–C5), which is rarely blocked directly. That is why restoring the circulation (legs up, vasopressor, fluid) is part of the treatment alongside ventilation. A very high block can also follow a delayed rise after a change of position, or a repeat dose given on top of a partly working block.'),
    ],
  },
  {
    id: 'ts-side-effects', group: 'after', tier: 1, label: 'Side effects', title: 'Side effects: nausea, shivering, itch, retention',
    intro: 'Most are minor. First make sure it is not a sign of something worse.',
    body: () => [
      tier(callout('warn', { title: 'Rule out first', body: '<p>Nausea, restlessness, itch or shivering with drowsiness, breathlessness, a rash or wheeze, or a falling blood pressure is not a side effect. Go back to airway, breathing and circulation: <a href="#ts-hypotension">Hypotension</a>, <a href="#ts-high-spinal">High or total spinal</a>.</p>' }), 1),
      sideEffects(),
    ],
    after: () => [
      pearl('vagal nausea', 'A high block leaves the vagus unopposed, which increases gut movement. Nausea can come with a slow heart rate even when the pressure is acceptable, and atropine or glycopyrronium may relieve it. Surgical traction on the peritoneum or bowel is a separate cause that no antiemetic fully controls.'),
      pearl('redistribution and the cold signal', 'A spinal widens the blood vessels below the block, and core heat flows out to the legs. Core temperature can fall quickly in the first hour, and the patient cannot feel the cold because the block removes the signal from the legs. Pre-warming before the block, and warming from the start of the case, reduce this.'),
    ],
  },
  // ---- practise
  { id: 'ts-case-hip', group: 'case', tier: 1, label: 'Hip fracture: BP 70/40, HR 45', title: 'Hip fracture: BP 70/40, HR 45', tree: T.caseHip, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
  { id: 'ts-case-paraesthesia', group: 'case', tier: 2, label: 'Electric shock down the leg', title: 'Electric shock down the leg', tree: T.caseParaesthesia, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
  { id: 'ts-case-unilateral', group: 'case', tier: 2, label: 'One-sided block', title: 'One-sided block', tree: T.caseUnilateral, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
];

const GROUPS = [
  { id: 'during', label: 'During the procedure' },
  { id: 'after', label: 'After injection' },
  { id: 'case', label: 'What would you do?' },
];

const tierMax = () => Number(document.body.dataset.tierMax) || 3;

// Everything inside the trees, for page search (the nodes are not in the DOM until a reader reaches them).
function registerTreeSearch(panelId, treeTitle, data) {
  const items = [];
  for (const [nid, n] of Object.entries(data.nodes)) {
    const title = n.outcome || n.prompt;
    if (!title) continue;
    items.push({
      title: `${treeTitle}: ${title}`,
      text: strip([n.detail, n.body, ...(n.choices || []).map((c) => c.label)].filter(Boolean).join(' ')),
      id: panelId,
      key: nid,
    });
  }
  registerSearch(items.map(({ title, text, id }) => ({ title, text, id })));
}

// ---------------------------------------------------------------- mount
export function mount(root) {
  root.append(emergencyCard());
  root.append(keyPoints([
    'Only inject when clear CSF flows freely and aspirates easily.',
    'Stop injecting and withdraw if there is persistent paraesthesia or pain on injection.',
    'First 5 minutes after injection: BP every 1–2 minutes, ask about nausea, breathing and hands, test the level.',
    'Low BP with nausea: treat the pressure first. Slow heart rate with low BP: treat both, and call for help.',
    'Wait about 20 minutes and test properly before you call a block failed. Do not repeat a spinal that is working, patchy or low.',
  ]));
  root.append(P('Pick a problem. Each one opens a short decision tree that ends in an action, a caution or an escalation. They support your judgement and a senior colleague’s; they do not replace them.', 'sp-lead'));

  const layout = el('div', { class: 'ts-layout' });
  const index = el('nav', { class: 'ts-index', 'aria-label': 'Troubleshooting problems' });
  const host = el('div', { class: 'ts-panels' });
  layout.append(index, host);
  root.append(layout);

  const links = new Map();
  const panels = new Map();
  let current = null;

  GROUPS.forEach((g) => {
    const items = PANELS.filter((p) => p.group === g.id);
    const group = el('div', { class: 'ts-index-group' });
    group.append(el('p', { class: 'ts-index-h', id: `ts-index-${g.id}`, text: g.label }));
    const ul = el('ul', { class: 'ts-index-list', 'aria-labelledby': `ts-index-${g.id}` });
    items.forEach((p) => {
      const a = el('a', { href: `#${p.id}`, class: 'ts-index-link', on: { click: (e) => onLink(e, p.id) } }, p.label || p.title);
      links.set(p.id, a);
      ul.append(tier(el('li', {}, a), p.tier));
    });
    group.append(ul);
    index.append(group);
  });

  const outlines = [];

  PANELS.forEach((p) => {
    const g = GROUPS.find((x) => x.id === p.group);
    const art = tier(el('article', { class: 'ts-panel', id: p.id, 'aria-labelledby': `${p.id}-h`, hidden: true }), p.tier);
    if (p.id === 'ts-high-spinal') art.append(el('span', { id: 'ts-high' }));
    art.append(el('p', { class: 'ts-panel-kicker', text: g.label }));
    art.append(el('h3', { class: 'ts-panel-h', id: `${p.id}-h`, tabindex: '-1', text: p.title }));
    if (p.intro) art.append(P(p.intro, 'ts-intro'));
    (p.before?.() || []).forEach((n) => art.append(n));
    if (p.body) p.body().forEach((n) => art.append(n));

    let guide = null;
    if (p.guide) {
      guide = redirectGuide({ id: 'ts-bone-guide', num: '4.1' });
      art.append(guide.fig);
    }

    if (p.tree) {
      const tree = createTree(p.tree, {
        headingLevel: 4,
        kicker: p.scenario ? 'What would you do?' : 'Decision tree',
        onNode: guide ? (_id, node) => { if (node.guide) guide.set(node.guide); } : undefined,
      });
      if (p.scenario) {
        const n1 = p.tree.nodes[p.tree.start];
        tree.el.classList.add('ts-tree--case');
        if (n1?.detail) tree.el.dataset.case = 'true';
      }
      art.append(tier(tree.el, p.tier));
      registerTreeSearch(p.id, p.title, p.tree);
      outlines.push({ p, outline: treeOutline(p.tree) });
    }
    (p.after?.() || []).forEach((n) => art.append(n));

    panels.set(p.id, art);
    host.append(art);
  });

  // One printable, searchable list of every tree. Built now so every ref the trees cite is in the DOM
  // when app.js numbers the references.
  const all = tier(details({ id: 'ts-all-trees', summary: 'All the decision trees as lists (for revision and printing)' }), 2);
  outlines.forEach(({ p, outline }) => {
    const wrap = el('div', { class: 'ts-all-one' }, el('h4', { class: 'ts-all-h', text: p.title }), outline);
    all.querySelector('.sp-details-body').append(wrap);
  });
  root.append(all);

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
      announce(`${PANELS.find((x) => x.id === id).title}`);
    }
    numberCites(panels.get(id));
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
    select(id, { record: location.hash === `#${id}` });
    if (location.hash === `#${id}`) {
      e.preventDefault();
      panels.get(id).scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      panels.get(id).querySelector('.ts-panel-h').focus({ preventScroll: true });
    }
  }

  // Record the open panel on each history entry, so browser Back/Forward restores it.
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
