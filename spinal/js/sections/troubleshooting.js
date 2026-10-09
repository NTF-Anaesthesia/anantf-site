// 04 Troubleshooting. Owner: B5.
// An index of problems (left column at >=1100px, stacked links on phones) and one panel per problem,
// each holding a decision tree (js/troubleshooting/tree.js). Doses only from product labels (emc SmPC)
// or the Association of Anaesthetists QRH; everything local is flagged with a policy callout.
import { el, callout, table, segmented, cite, announce } from '../ui.js?v=1';
import { createTree, treeOutline, numberCites } from '../troubleshooting/tree.js';
import { redirectGuide } from '../troubleshooting/redirect.js';
import * as T from '../troubleshooting/trees.js';

export const meta = { id: 'troubleshooting', prefix: 'ts', title: 'Troubleshooting' };

const emc = (n) => `https://www.medicines.org.uk/emc/product/${n}/smpc`;
export const refs = {
  'ts-nysora-failed': {
    label: 'NYSORA',
    text: 'NYSORA. Mechanisms and management of failed spinal anesthesia. New York School of Regional Anesthesia (online learning resource). Accessed October 2026.',
    url: 'https://www.nysora.com/foundations-of-regional-anesthesia/complications/mechanisms-management-failed-spinal-anesthesia/',
  },
  'ts-qrh2023': {
    label: 'QRH 2023',
    text: 'Association of Anaesthetists. Quick Reference Handbook: guidelines for crises in anaesthesia (compendium, June 2023). 2-4 Hypotension; 2-6 Bradycardia; 3-11 High central neuraxial block. CC BY-NC-SA 4.0.',
    url: 'https://anaesthetists.org/Quick-Reference-Handbook',
  },
  'ts-pong2009': {
    label: 'Pong 2009',
    text: 'Pong RP, Gmelch BS, Bernards CM. Does a paresthesia during spinal needle insertion indicate intrathecal needle placement? <i>Reg Anesth Pain Med</i> 2009;34:29–32.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19258985/',
  },
  'ts-auroy1997': {
    label: 'Auroy 1997',
    text: 'Auroy Y, Narchi P, Messiah A, Litt L, Rouvier B, Samii K. Serious complications related to regional anesthesia: results of a prospective survey in France. <i>Anesthesiology</i> 1997;87:479–86.',
    url: 'https://doi.org/10.1097/00000542-199709000-00005',
  },
  'ts-carpenter1992': {
    label: 'Carpenter 1992',
    text: 'Carpenter RL, Caplan RA, Brown DL, Stephenson C, Wu R. Incidence and risk factors for side effects of spinal anesthesia. <i>Anesthesiology</i> 1992;76:906–16.',
    url: 'https://doi.org/10.1097/00000542-199206000-00006',
  },
  'ts-crowley2008': {
    label: 'Crowley 2008',
    text: 'Crowley LJ, Buggy DJ. Shivering and neuraxial anesthesia. <i>Reg Anesth Pain Med</i> 2008;33:241–52.',
    url: 'https://doi.org/10.1016/j.rapm.2007.11.006',
  },
  'ts-baldini2009': {
    label: 'Baldini 2009',
    text: 'Baldini G, Bagry H, Aprikian A, Carli F. Postoperative urinary retention: anesthetic and perioperative considerations. <i>Anesthesiology</i> 2009;110:1139–57.',
    url: 'https://doi.org/10.1097/ALN.0b013e31819f7aea',
  },
  'ts-smpc-phe': { label: 'Phenylephrine SmPC', text: 'Phenylephrine 100 micrograms/ml solution for injection or infusion. Summary of Product Characteristics, section 4.2. electronic medicines compendium (emc).', url: emc(12563) },
  'ts-smpc-eph': { label: 'Ephedrine SmPC', text: 'Ephedrine hydrochloride 3 mg/ml solution for injection in pre-filled syringe. Summary of Product Characteristics, section 4.2. emc.', url: emc(5354) },
  'ts-smpc-met': { label: 'Metaraminol SmPC', text: 'Metaraminol 0.5 mg/ml solution for injection in pre-filled syringe. Summary of Product Characteristics, section 4.2. emc.', url: emc(11698) },
  'ts-smpc-atr': { label: 'Atropine SmPC', text: 'Atropine sulfate 3 mg/10 ml solution for injection in pre-filled syringe. Summary of Product Characteristics, section 4.2. emc.', url: emc(8790) },
  'ts-smpc-gly': { label: 'Glycopyrronium SmPC', text: 'Glycopyrronium bromide 200 micrograms/ml solution for injection. Summary of Product Characteristics, section 4.2. emc.', url: emc(2786) },
  'ts-smpc-ond': { label: 'Ondansetron SmPC', text: 'Ondansetron 2 mg/ml solution for injection. Summary of Product Characteristics, section 4.2 (treatment of established PONV). emc.', url: emc(6469) },
};

const D = (s) => `<span class="sp-dose">${s}</span>`;
const P = (html, cls) => el('p', { class: cls, html });

// ---------------------------------------------------------------- difficult back: patient types
const BACKS = [
  {
    value: 'obesity', label: 'Obesity',
    points: [
      'Sit the patient up if you can: the midline is usually easier to find sitting than lying.',
      'Landmarks may be impalpable. A longer spinal needle, with an introducer, may be needed.',
      `Pre-scan with ultrasound to mark the midline and the interspace, and to measure the depth.${cite('chin2011', 'perlas2016')}`,
      `Obesity is a recognised anatomical cause of a failed lumbar puncture.${cite('ts-nysora-failed')} Plan the backup anaesthetic, including the airway, before you start.`,
    ],
  },
  {
    value: 'scoliosis', label: 'Scoliosis',
    points: [
      'The vertebrae are rotated as well as curved, so the spinous processes you feel may not sit over the interlaminar gap. Surface landmarks are unreliable.',
      `Ultrasound helps: it shows where the midline and the interspaces really are.${cite('chin2011')}`,
      'Seek senior help early rather than after several failed passes.',
      'In a severe curve, check cardiorespiratory reserve, and expect the block to spread unevenly.',
    ],
  },
  {
    value: 'elderly', label: 'Elderly: calcified ligaments',
    points: [
      'Calcified supraspinous and interspinous ligaments, narrow interspaces and stiffness make the midline hard going.',
      'A paramedian approach avoids the midline ligaments and is often easier. See <a href="#tq-approach">Midline and paramedian approaches</a>.',
      'Positioning may be limited by pain (for example a hip fracture). Give analgesia before you position.',
      `Older patients are more prone to hypotension after the spinal: be ready to treat it.${cite('ts-carpenter1992')}`,
    ],
  },
  {
    value: 'surgery', label: 'Previous spinal surgery',
    points: [
      'Read the operation note and imaging. Look for the scar, any fusion and where the metalwork is.',
      'Choose an interspace away from the operated levels. Scar tissue and missing landmarks make the operated level difficult.',
      `Adhesions and stenosis can stop the drug spreading, so a block can be patchy, and a repeat dose may fail for the same reason.${cite('ts-nysora-failed')}`,
      'Record any existing neurological deficit carefully before the block. Ultrasound helps.',
    ],
  },
  {
    value: 'as', label: 'Ankylosing spondylitis',
    points: [
      'Ossified ligaments and fused joints often make the midline approach impossible.',
      'A paramedian approach, often at L5–S1 (the Taylor approach, where the interlaminar space is largest), may work when the midline doesn’t. Ultrasound helps.',
      'The neck may be fused: if you need to convert to general anaesthesia, the airway may be difficult. Plan for it before you start.',
      'Ask an experienced colleague to be involved from the start.',
    ],
  },
];

function backSelector() {
  const wrap = el('div', { class: 'ts-back', id: 'ts-back-types' });
  const out = el('div', { class: 'ts-back-out', 'aria-live': 'polite' });
  const draw = (v) => {
    const b = BACKS.find((x) => x.value === v) || BACKS[0];
    out.textContent = '';
    out.append(el('h4', { class: 'ts-back-h', text: b.label }));
    out.append(el('ul', { class: 'ts-back-list' }, ...b.points.map((p) => el('li', { html: p }))));
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

const PANELS = [
  // ---- during the procedure
  {
    id: 'ts-dry-tap', group: 'during', title: 'No CSF (dry tap)', tree: T.dryTap,
    intro: `Work from the simplest explanation outwards: patience, needle position, a blocked needle, then the patient’s position and anatomy.${cite('ts-nysora-failed')}`,
    after: () => [callout('policy', { title: 'How many passes?', body: '<p>No international guideline sets a maximum number of passes. When to change approach, call a senior colleague or abandon the spinal is local practice: agree it with your supervisor before you start.</p>' })],
  },
  {
    id: 'ts-bloody-tap', group: 'during', title: 'Blood in the needle hub', tree: T.bloodyTap,
    intro: 'Blood that clears to clear CSF is usually a grazed vessel. Blood that doesn’t clear means the tip is not where you want it.',
    after: () => [callout('policy', { title: 'Thromboprophylaxis after a bloody tap', body: `<p>When the next anticoagulant dose can be given after a traumatic puncture depends on the drug and on the guideline your department follows. Agree it with the surgical team and record it.${cite('asra2025', 'esaic2022')}</p>` })],
  },
  {
    id: 'ts-paraesthesia', group: 'during', title: 'Paraesthesia', tree: T.paraesthesia,
    intro: 'A brief electric shock is common and often means you are already in the subarachnoid space. Persistent paraesthesia, or pain on injection, is a stop sign.',
    after: () => [callout('pearl', { title: 'Auroy 1997', body: `<p>In a French survey of over 40 000 spinals, most of the neurological injuries after regional anaesthesia followed paraesthesia during puncture or pain on injection, and the deficit matched where the paraesthesia was felt.${cite('ts-auroy1997')}</p>` })],
  },
  {
    id: 'ts-bone', group: 'during', title: 'Bone contact', tree: T.bone, guide: true,
    intro: 'The depth at which you meet bone tells you which bone it is. Use the guide to see the likely structure and the redirect, then work through the tree.',
  },
  {
    id: 'ts-difficult-back', group: 'during', title: 'The difficult back', tree: T.difficultBack, back: true,
    intro: 'Plan for difficulty before you start: position, ultrasound, an experienced colleague and a backup anaesthetic.',
  },
  // ---- after injection
  {
    id: 'ts-failed', group: 'after', title: 'Inadequate or failed spinal', tree: T.failed,
    intro: `Failure ranges from no block at all to a block of the wrong height, density, duration or side.${cite('fettes2009')} Wait about 20 minutes and test properly before you call it failed.`,
    before: () => [failedCauses(), P(`Categories follow Fettes et al.${cite('fettes2009', 'ts-nysora-failed')} Management by pattern: wait and test, posture, a cautious repeat spinal, supplementation, sedation and analgesia, or general anaesthesia.`, 'ts-small')],
  },
  {
    id: 'ts-high-spinal', group: 'after', title: 'High or total spinal', tree: T.highSpinal,
    intro: `Signs come in sequence: hypotension and bradycardia, then difficulty breathing, arm weakness, falling consciousness and apnoea. Manage airway, breathing and circulation; intubate and ventilate if needed, then keep the patient asleep.${cite('ts-qrh2023')}`,
    after: () => [callout('policy', { title: 'Position and local guidance', body: '<p>The QRH advises raising the legs and avoiding head-down tilt. Use your department’s crisis checklists and difficult airway guideline alongside this tree.</p>' })],
  },
  {
    id: 'ts-hypotension', group: 'after', title: 'Hypotension and bradycardia', tree: T.hypotension,
    intro: `Common after a spinal, and more likely with a higher block and in older patients.${cite('ts-carpenter1992')} Look for other causes, treat early, and treat the heart rate as well as the pressure.`,
    before: () => [callout('policy', { title: 'When to treat, and with what', body: '<p>There is no single definition of hypotension. Many teams treat a systolic pressure below about 90 mmHg or a fall of more than 20–30% from baseline, adjusted for the patient (for example chronic hypertension or cerebrovascular disease). Use your local threshold and your local first-line vasopressor.</p>' })],
    after: () => [doseTable(), callout('policy', { title: 'Adrenaline', body: `<p>For severe or refractory hypotension or bradycardia, the QRH lists adrenaline ${D('1 µg/kg')} (adult ${D('10–100 µg')}) IV, in emergency only.${cite('ts-qrh2023')} Dilution and dosing as per local protocol; call for senior help.</p>` })],
  },
  {
    id: 'ts-nausea', group: 'after', title: 'Nausea and vomiting', tree: T.nausea,
    intro: 'After a spinal, nausea means low blood pressure until proved otherwise. Treat the pressure first.',
    after: () => [callout('policy', { title: 'Antiemetics', body: '<p>Ondansetron is used here because its label dose is clear. Other antiemetics as per your local protocol.</p>' })],
  },
  {
    id: 'ts-shivering', group: 'after', title: 'Shivering', tree: T.shivering,
    intro: `Very common after neuraxial anaesthesia.${cite('ts-crowley2008')} Warm first; drugs are second line.`,
    after: () => [callout('policy', { title: 'Drug treatment', body: '<p>Pethidine is the most studied drug for shivering. Its dose, and the alternatives used (tramadol, clonidine, dexmedetomidine), are per local protocol; check the BNF and for interactions (for example MAOIs).</p>' })],
  },
  {
    id: 'ts-pruritus', group: 'after', title: 'Itch (pruritus)', tree: T.pruritus,
    intro: 'Itch after an intrathecal opioid is common and usually settles. Remember it is an opioid effect: check sedation and breathing.',
    after: () => [callout('policy', { title: 'Naloxone for itch', body: '<p>Low-dose naloxone regimens for itch vary. Use the dose in your local intrathecal opioid protocol or the BNF, and titrate: too much reverses the analgesia.</p>' })],
  },
  {
    id: 'ts-retention', group: 'after', title: 'Urinary retention', tree: T.retention,
    intro: `Common after surgery, especially with long-acting spinals and intrathecal opioids. A bladder scan guides what to do.${cite('ts-baldini2009')}`,
    after: () => [callout('policy', { title: 'Scan volume and voiding rules', body: `<p>The bladder volume at which to catheterise, and whether a day-case patient must void before going home, are set by local policy.${cite('ts-baldini2009')}</p>` })],
  },
  // ---- scenarios
  { id: 'ts-case-hip', group: 'case', title: 'Hip fracture: BP 70/40, HR 45', tree: T.caseHip, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
  { id: 'ts-case-paraesthesia', group: 'case', title: 'Electric shock down the leg', tree: T.caseParaesthesia, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
  { id: 'ts-case-unilateral', group: 'case', title: 'One-sided block', tree: T.caseUnilateral, scenario: true, intro: 'Choose what you would do. Feedback appears after each choice.' },
];

const GROUPS = [
  { id: 'during', label: 'During the procedure' },
  { id: 'after', label: 'After injection' },
  { id: 'case', label: 'What would you do?' },
];

// ---------------------------------------------------------------- mount
export function mount(root) {
  root.append(
    P('Decision trees for problems during and after a spinal. Pick a problem, answer each question, and the tree gives you the next step. Every tree ends in an action, a caution or an escalation.', 'sp-lead'),
    callout('warn', { title: 'If the patient deteriorates', body: '<p><strong>Call for help early.</strong> Go back to airway, breathing and circulation. These trees support your judgement and a senior colleague’s; they don’t replace them, or your department’s policies.</p>' }),
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
      ol.append(el('li', {}, a));
    });
    index.append(ol);
  });

  PANELS.forEach((p) => {
    const g = GROUPS.find((x) => x.id === p.group);
    const art = el('article', { class: 'ts-panel', id: p.id, 'aria-labelledby': `${p.id}-h`, hidden: true });
    art.append(el('p', { class: 'ts-panel-kicker', text: g.label }));
    art.append(el('h3', { class: 'ts-panel-h', id: `${p.id}-h`, tabindex: '-1', text: p.title }));
    if (p.intro) art.append(P(p.intro, 'ts-intro'));
    (p.before?.() || []).forEach((n) => art.append(n));
    if (p.back) art.append(backSelector());

    let guide = null;
    if (p.guide) {
      guide = redirectGuide({ id: 'ts-bone-guide', num: '4.1' });
      art.append(guide.fig);
    }

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
    art.append(tree.el);
    (p.after?.() || []).forEach((n) => art.append(n));

    const outline = el('details', { class: 'sp-details ts-outline-d', id: `${p.id}-all` },
      el('summary', { text: p.scenario ? 'Show all choices and feedback' : 'Show the whole tree as a list' }));
    // Built now (not on open) so every ref the tree cites is in the DOM when app.js numbers the references.
    outline.append(treeOutline(p.tree));
    art.append(outline);

    panels.set(p.id, art);
    host.append(art);
  });

  function select(id, { focus = false } = {}) {
    if (!panels.has(id)) return false;
    if (current && current !== id) {
      panels.get(current).hidden = true;
      links.get(current).removeAttribute('aria-current');
    }
    current = id;
    panels.get(id).hidden = false;
    links.get(id).setAttribute('aria-current', 'true');
    if (focus) {
      const h = panels.get(id).querySelector('.ts-panel-h');
      h.focus({ preventScroll: true });
      announce(`${PANELS.find((x) => x.id === id).title}: decision tree`);
    }
    return true;
  }

  function onLink(e, id) {
    // Let the hash change (so the link is shareable), but switch the panel first; app.js then scrolls.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    select(id);
    if (location.hash === `#${id}`) {
      e.preventDefault();
      panels.get(id).scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      panels.get(id).querySelector('.ts-panel-h').focus({ preventScroll: true });
    }
  }

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
