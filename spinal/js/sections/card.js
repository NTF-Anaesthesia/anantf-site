// Ward card: a one-screen, printable checklist for a routine single-shot spinal.
// It owns no teaching. Every block links to the chapter that does. Doses are copied from the Technique
// chapter (product labels) and nowhere else. Tiers: 1 MO (the card), 2 Resident (short notes).
import { el, cite, callout, steps, table, tier, registerSearch } from '../ui.js?v=1';

export const meta = { id: 'card', prefix: 'cd', title: 'Ward card' };

const D = (s) => `<span class="sp-dose">${s}</span>`;

// ---------------------------------------------------------------- small builders
let tickN = 0;
/** Tickable list. Ticks are for the moment only; nothing is saved. */
function ticks(items) {
  const ul = el('ul', { class: 'cd-ticks' });
  for (const html of items) {
    tickN += 1;
    const id = `cd-tick-${tickN}`;
    const li = el('li', { class: 'cd-tick' });
    li.append(el('input', { type: 'checkbox', id }), el('label', { for: id, html }));
    ul.append(li);
  }
  return ul;
}
const bullets = (items) => el('ul', { class: 'cd-list' }, ...items.map((h) => el('li', { html: h })));
const more = (href, text) => el('p', { class: 'cd-more', html: `<a href="${href}">${text}</a>` });

/** One card block: heading, optional id, content. */
function block(id, title, ...kids) {
  const s = el('section', { class: 'cd-block', id, 'aria-labelledby': `${id}-h` });
  s.append(el('h3', { class: 'cd-h', id: `${id}-h`, text: title }), ...kids);
  return s;
}

export function mount(root) {
  try {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = new URL('../../css/card.css?v=2', import.meta.url).href;
    document.head.append(css);
  } catch { /* the card still reads without its stylesheet */ }

  root.classList.add('cd');

  // ------------------------------------------------------------ top: lead + print
  const printBtn = el('button', { class: 'sp-btn sp-btn--primary cd-print', type: 'button', on: { click: () => window.print() } },
    el('span', { text: 'Print this card' }));
  const resetBtn = el('button', { class: 'sp-btn cd-reset', type: 'button' }, el('span', { text: 'Clear ticks' }));
  resetBtn.addEventListener('click', () => root.querySelectorAll('.cd-tick input').forEach((c) => { c.checked = false; }));
  root.append(tier(el('div', { class: 'cd-top' },
    el('p', { class: 'sp-lead cd-lead', html: 'A safe single-shot spinal for an adult, from consent to the ward. Each heading links to the chapter that explains it. For a spinal in 60 seconds, read the numbered steps and the red box.' }),
    el('div', { class: 'cd-actions' }, printBtn, resetBtn)), 1));

  const grid = el('div', { class: 'cd-grid' });
  root.append(grid);

  // ------------------------------------------------------------ 1 who is it for
  grid.append(block('cd-who', '1. Is a spinal right?',
    el('p', { class: 'cd-lead-line', html: '<strong>Suits</strong> surgery below the umbilicus that will finish within the block: hip, knee, ankle and foot, TURP and cystoscopy, perianal, inguinal hernia.' }),
    el('p', { class: 'cd-sub', text: 'Do not proceed if (absolute)' }),
    bullets([
      'Patient refuses, or cannot consent.',
      'Infection at or next to the puncture site.',
      'Raised intracranial pressure from a mass lesion.',
      'True allergy to the local anaesthetic.',
      'Coagulopathy, or an anticoagulant not stopped for long enough: <a href="#tq-anticoag">anticoagulant timing</a>.',
    ]),
    el('p', { class: 'cd-sub', text: 'Ask a senior first (relative)' }),
    bullets([
      'Severe aortic or mitral stenosis, or other fixed cardiac output: <a href="#pp-aortic-stenosis">severe aortic stenosis</a>.',
      'Uncorrected hypovolaemia. Sepsis or bacteraemia.',
      'Neurological disease (examine and record first), spinal deformity or previous spinal surgery.',
      'A patient who cannot keep still. Low platelets: <a href="#tq-platelets">platelets</a>.',
    ]),
    more('#tq-consent', 'Indications and contraindications in full'),
    tier(el('p', { class: 'cd-note', html: 'A relative contraindication is a balance, not a veto: set the risk against a general anaesthetic in this patient, say the trade-off aloud and record who agreed. See <a href="#tq-contra">Contraindications</a>.' }), 2)));

  // ------------------------------------------------------------ 2 consent
  grid.append(block('cd-consent', '2. Consent: say it in words',
    el('p', { class: 'cd-sub', text: 'Common and expected' }),
    bullets([
      'Low blood pressure: we watch for it and treat it.',
      'Itching, mainly with spinal opioids.',
      'Difficulty passing urine until the block wears off. A catheter may be needed for a while.',
      'Pain or tingling in a leg or the bottom during the injection: <strong>tell me straight away</strong>.',
      'Headache, which is worse sitting up and eases lying flat.',
    ]),
    el('p', { class: 'cd-sub', text: 'Serious, but rare or very rare' }),
    bullets([
      'Temporary nerve injury (numbness or weakness), which nearly always recovers in days to weeks.',
      'Permanent nerve injury.',
      'Bleeding around the spine, infection (meningitis, abscess) and a block that rises too high.',
    ]),
    el('p', { class: 'cd-lead-line', html: 'Also: the alternative (general anaesthesia), sedation if wanted, that pressure and pulling may still be felt, and what happens if the block is not good enough. <strong>Record what you discussed.</strong>' }),
    more('#tq-consent', 'Risk words, frequencies and the 2025 RCoA infographics')));

  // ------------------------------------------------------------ 3 pre-checks
  grid.append(block('cd-prechecks', '3. Before you start',
    ticks([
      '<strong>WHO sign-in</strong> done. Consent, site and side confirmed. Allergies asked.',
      '<strong>Bleeding:</strong> anticoagulant, antiplatelet, NSAID and herbal history. Interval checked in the <a href="#tq-anticoag">anticoagulant lookup</a>.',
      '<strong>Platelets and clotting</strong> seen if the history or drugs call for it (<a href="#tq-platelets">platelets</a>).',
      '<strong>Infection:</strong> no fever or sepsis today; skin at the site is clean.',
      '<strong>Fasted</strong> as for a general anaesthetic, because you may need to convert.',
      '<strong>IV cannula</strong> in and running.',
      `<strong>Monitors on</strong> (ECG, BP, SpO₂) and a baseline recorded. Keep them on for at least ${D('30 min')} after the block is complete.${cite('tq-klein2021')}`,
      '<strong>Vasopressor drawn up</strong> and labelled, atropine to hand, oxygen, airway kit and GA drugs ready.',
      '<strong>Trained assistant</strong> to position and support the patient.',
      '<strong>Senior briefed:</strong> what you plan, and who is nearby if it goes wrong.',
      '<strong>Drug checked</strong> against the ampoule label with a second person: right drug, right dose, in date. Neuraxial-only connectors (<a href="#cx-wrong-route">wrong-route errors</a>).',
      'Spinal needle and introducer opened; a longer needle to hand.',
    ]),
    more('#tq-prep', 'Preparation in full'),
    tier(el('p', { class: 'cd-note', html: 'The aim of the history is to find what makes a spinal unsafe (bleeding, infection, fixed cardiac output, a patient who cannot cooperate) and what changes the plan (back disease, frailty). See <a href="#tq-preop">Pre-op assessment</a>.' }), 2)));

  // ------------------------------------------------------------ 4 drug and dose
  const drugs = table({
    caption: 'Typical doses for an average adult',
    head: ['Drug', 'Dose', 'Use'],
    stack: false,
    rows: [
      [{ th: true, html: 'Hyperbaric bupivacaine 0.5%' },
        `<strong>Typical:</strong> knee replacement ${D('2.5 mL')} (${D('12.5 mg')}); shorter lower-limb surgery about ${D('2 mL')} (${D('10 mg')}); caesarean ${D('2.2–2.3 mL')} (${D('11–11.5 mg')}).`,
        `Lower abdominal and lower limb, including hip. Onset ${D('5–8 min')}, lasts ${D('1.5–3 h')}. Lowest dose that works; less in older patients.`],
      [{ th: true, html: 'Plain bupivacaine 0.5%' },
        `<strong>Typical:</strong> hip surgery, including frail hip fracture, ${D('2.5–3 mL')} (${D('12.5–15 mg')}). ${D('3 mL')} is the most, for an operation that needs a long block.`,
        `Lower limb surgery lasting ${D('3–4 h')}. Spread is less predictable.`],
      [{ th: true, html: 'Prilocaine 2% hyperbaric' },
        `${D('40–60 mg')} (${D('2–3 mL')}); maximum ${D('80 mg')}${cite('tq-prilotekal')}`,
        'Short acting; suits day surgery.'],
      [{ th: true, html: 'Chloroprocaine 1%' },
        `${D('40–50 mg')} (${D('4–5 mL')}); maximum ${D('50 mg')}${cite('tq-ampres')}`,
        `Surgery expected to last no more than ${D('40 min')}.`],
    ],
  });
  grid.append(block('cd-drug', '4. Drug and dose',
    drugs,
    el('p', { class: 'cd-lead-line', html: `<strong>Hip fracture and the frail:</strong> plain bupivacaine 0.5% ${D('2.5–3 mL')}, injected slowly. <strong>Hypotension drugs</strong> (vasopressors, atropine) are on the <a href="#ts-doses">dose table</a>.` }),
    more('#tq-drugs', 'Drugs and doses in full'),
    tier(el('p', { class: 'cd-note', html: `Position changes spread. With hyperbaric bupivacaine at L3–4, sitting for 2 minutes then lying flat keeps the block lower; giving it on the side then turning flat lets it rise a few segments higher. See <a href="#tq-spread-h">what decides spread</a>.` }), 2)));

  // ------------------------------------------------------------ 5 steps
  const S = steps([
    { id: 'cd-s-position', title: 'Position', body: 'Sitting or lateral, back arched, assistant supporting. For a hip fracture, give a nerve block first so moving hurts less. <a href="#tq-position">Position</a>' },
    { id: 'cd-s-asepsis', title: 'Asepsis', body: `Hand hygiene, hat, mask, sterile gloves, 0.5% chlorhexidine in alcohol dried fully, sterile drape.${cite('tq-campbell2014')} <a href="#tq-asepsis">Asepsis</a>` },
    { id: 'cd-s-level', title: 'Level', body: 'Palpate the iliac crests, count, then choose a gap at L3–4 or below. If unsure, go lower: the cord must be well above you. <a href="#an-tuffier">Choosing the level</a>' },
    { id: 'cd-s-needle', title: 'Needle', body: 'Skin local anaesthetic. Use the finest pencil-point needle you can handle through an introducer. Advance in small steps. If it hits bone or deviates, withdraw fully and reinsert. <a href="#tq-needles">Needles</a>' },
    { id: 'cd-s-csf', title: 'CSF', body: 'Remove the stylet and wait for free flow of clear CSF. If slow, rotate in quarter turns. No CSF: <a href="#ts-dry-tap">dry tap</a>. Blood that does not clear: <a href="#ts-bloody-tap">bloody tap</a>.' },
    { id: 'cd-s-inject', title: 'Inject', body: 'Steady the hub, attach the syringe, aspirate a little CSF, inject slowly. Note the time. <a href="#tq-csf">CSF and injection</a>' },
    { id: 'cd-s-after', title: 'Lie back and check', body: 'Position as planned; do not tilt on impulse. Blood pressure and heart rate every 1–2 minutes at first, and ask about nausea, breathing and hands. <a href="#ts-first-five">First 5 minutes</a>' },
  ]);
  const stop = el('aside', { class: 'sp-stop cd-stop', 'aria-label': 'Stop and get help' },
    el('p', { class: 'sp-stop-title', text: 'Stop and get help if' }),
    el('ul', {},
      el('li', { html: '<strong>Pain or persistent paraesthesia</strong> on needle placement or on injection. Do not inject. Withdraw. <a href="#ts-paraesthesia">Paraesthesia</a>' }),
      el('li', { html: '<strong>CSF not flowing clearly, blood-stained CSF that does not clear</strong>, or you are not sure the clotting is safe.' }),
      el('li', { html: '<strong>Falling blood pressure, slow heart rate, breathlessness, weak hands or drowsiness</strong> after the injection. Call for help, give oxygen, treat early. <a href="#ts-hypotension">Hypotension</a> · <a href="#ts-high-spinal">High spinal</a>' })));
  grid.append(block('cd-steps', '5. Steps', S, stop,
    tier(el('p', { class: 'cd-note', html: 'Never inject through resistance. Hold the needle so it cannot move while you attach the syringe. Many anaesthetists aspirate again at the end of the injection to confirm the tip has not moved. Difficult back: <a href="#ts-difficult-back">troubleshooting</a>.' }), 2)));

  // ------------------------------------------------------------ 6 block assessment
  grid.append(block('cd-block', '6. Check the block before incision',
    bullets([
      'Test <strong>both sides</strong>, from the blocked area upwards: cold, then pinprick (the surgical level), then light touch. Compare with an unblocked area such as the shoulder.',
      'Motor: modified Bromage score. Record the level, the score and the time.',
      'The level keeps moving for about 20 minutes. Test again before you give more drug or turn the patient.',
      'Do not let surgery start until the block is tested at the operative site.',
    ]),
    table({
      caption: 'Commonly quoted levels',
      head: ['Operation', 'Aim for'],
      stack: false,
      rows: [
        [{ th: true, html: 'TURP, hip, knee' }, D('T10')],
        [{ th: true, html: 'Inguinal hernia' }, D('T8')],
      ],
    }),
    el('p', { class: 'cd-lead-line', html: 'These are teaching figures, not guideline values: agree the level with the surgeon. Patchy or failed block: <a href="#ts-failed">failed block</a>. Block too high: <a href="#ts-high-spinal">high spinal</a>.' }),
    more('#tq-testing', 'Testing the block in full'),
    tier(el('p', { class: 'cd-note', html: 'Cold spray gives the highest level and overestimates the surgical block. The sympathetic block lies about 2 segments above the sensory level and the motor block about 2 below it. See <a href="#tq-check-h">the quick check</a>.' }), 2)));

  // ------------------------------------------------------------ 7 post-op orders
  grid.append(block('cd-postop', '7. After the operation: orders for the ward',
    el('dl', { class: 'cd-orders' },
      el('dt', { text: 'Observations' }), el('dd', { html: 'Blood pressure, pulse, SpO₂, sedation and both legs (feeling and movement) at regular intervals until the block has gone. <a href="#tq-postop">Post-op care</a>' }),
      el('dt', { text: 'Intrathecal morphine' }), el('dd', { html: `If it was given: monitor for at least ${D('24 h')} (at least hourly for ${D('12 h')}, then at least every ${D('2 h')}). Breathing rate, oxygenation and sedation. Naloxone and oxygen to hand; no other sedatives or opioids without checking.${cite('tq-asa2016')}` }),
      el('dt', { text: 'Nausea' }), el('dd', { html: 'Nausea soon after a spinal is low blood pressure until proved otherwise. Treat the pressure first. <a href="#ts-nausea">Nausea</a>' }),
      el('dt', { text: 'Analgesia' }), el('dd', { text: 'Give it before the block wears off.' }),
      el('dt', { text: 'Passing urine' }), el('dd', { html: 'Retention is common until the block has gone. Ask the patient to pass urine, scan the bladder if needed, catheterise if they cannot. <a href="#ts-retention">Retention</a>' }),
      el('dt', { text: 'Getting up' }), el('dd', { text: 'Only when both legs can feel and move. Sit up first, stand slowly with help. Falls precautions until then. Protect heels and pressure points of a numb leg.' }),
      el('dt', { text: 'Shivering, itch' }), el('dd', { html: '<a href="#ts-shivering">Shivering</a> · <a href="#ts-pruritus">Itching</a>' })),
    callout('warn', {
      title: 'Ward: call the anaesthetic senior now for',
      body: `<ul>
        <li><strong>Back pain</strong> that is new, severe or getting worse. <a href="#cx-haematoma">Haematoma</a></li>
        <li><strong>New or worsening leg weakness or numbness</strong>, or a block that is not wearing off as expected (a single-shot spinal still present at 8 hours is not normal). <a href="#cx-neuro-check">Neuro check</a></li>
        <li><strong>Bladder or bowel change</strong>: new retention, incontinence, numbness around the bottom.</li>
        <li><strong>Fever</strong>, or redness and tenderness at the puncture site. <a href="#cx-infection">Infection</a></li>
        <li><strong>Headache</strong> worse sitting or standing and eased lying flat, or any headache with fever, confusion or visual change. <a href="#cx-pdph">PDPH</a></li>
        <li><strong>Drowsy or slow breathing</strong> after intrathecal morphine.</li>
      </ul><p>Do not wait for the morning round, and do not put it down to a slow block. Examine the legs, tell the surgical team, and ask for an urgent MRI if anything is new. Write down what you found and when. <a href="#cx-ward">Ward red flags</a></p>`,
    }),
    el('p', { class: 'cd-lead-line', html: 'Give these red flags to the ward in writing and in words. Day-case patients go home with the same list and a contact number.' }),
    tier(el('p', { class: 'cd-note', html: 'Haematoma presents most often when the block should be wearing off, or after an anticoagulant is restarted: ask for leg checks at those times. Record the technique, drug, dose, level and block result: <a href="#tq-documentation">Documentation</a>.' }), 2)));

  // ------------------------------------------------------------ print footer (print only)
  root.append(el('p', { class: 'cd-print-foot', text: 'Ward card from anantf.com/spinal/#ch-card.' }));

  tier(grid, 1);

  registerSearch([
    { title: 'Spinal in 60 seconds (ward card steps)', text: 'consent bleeding infection brief senior set up check drug position aseptic needle CSF inject check block stop and get help', id: 'cd-steps' },
    { title: 'Ward card: before you start checklist', text: 'WHO sign-in anticoagulant platelets IV access monitoring vasopressor drawn up', id: 'cd-prechecks' },
    { title: 'Ward card: orders for the ward after a spinal', text: 'observations nausea analgesia urinary retention mobilise red flags call senior', id: 'cd-postop' },
  ]);
}
