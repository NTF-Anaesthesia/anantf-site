// Decision-tree content for 04 Troubleshooting.
// Doses: only product-label (emc SmPC) or Association of Anaesthetists QRH values, each cited where it appears.
import { cite } from '../ui.js?v=1';

const D = (s) => `<span class="sp-dose">${s}</span>`;
const N = (s) => `<span class="sp-num">${s}</span>`;
const go = (id, text) => `<a href="#${id}">${text}</a>`;

// High-spinal circulation doses as printed in QRH 3-11 Box B; shown in both the 'support' node and xCirc.
const QRH_CIRC_DOSES = `<ul>
          <li>Bradycardia: atropine ${D('0.6–1.2 mg')} or glycopyrronium ${D('0.2–0.4 mg')} IV.</li>
          <li>Hypotension: metaraminol ${D('1–2 mg')} boluses, phenylephrine ${D('50–100 µg')} boluses or infusion, or ephedrine ${D('6–12 mg')} boluses (up to ${D('30 mg')}; repeated doses work less well).</li>
        </ul>`;

// ------------------------------------------------------------------ during the procedure

export const dryTap = {
  id: 'ts-dry-tap',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'You remove the stylet. No CSF appears. Did you wait long enough to see it?',
      short: 'No CSF',
      detail: '<p>Fine pencil-point needles (25–27G) fill slowly, especially if CSF pressure is low. Hold the needle still and watch the hub.</p>',
      choices: [
        { label: 'I looked straight away', to: 'wait' },
        { label: 'I waited and there is still nothing', to: 'rotate' },
      ],
    },
    wait: {
      prompt: 'Wait and watch the hub for several seconds, then rotate the needle a quarter-turn at a time. What happens?',
      short: 'Wait and rotate',
      detail: `<p>With a pencil-point needle the side hole sits just behind the tip, so the tip can be through the dura while the hole is still outside it. Rotation is often suggested, but its benefit is theoretical.</p>`,
      choices: [
        { label: 'Clear CSF appears and keeps dripping', to: 'xGo' },
        { label: 'Still nothing', to: 'depth' },
      ],
    },
    rotate: {
      prompt: 'Rotate the needle a quarter-turn at a time and watch the hub again.',
      short: 'Rotate',
      detail: `<p>With a pencil-point needle the side hole sits just behind the tip, so the tip can be through the dura while the hole is still outside it. Rotation is often suggested, but its benefit is theoretical.</p>`,
      choices: [
        { label: 'CSF now flows freely', to: 'xGo' },
        { label: 'Nothing', to: 'depth' },
      ],
    },
    depth: {
      prompt: 'How deep is the needle compared with what you expected for this patient?',
      short: 'Depth?',
      choices: [
        { label: 'Shallower than expected', to: 'advance' },
        { label: 'At or beyond the expected depth', to: 'deep' },
        { label: 'I have hit bone', to: 'xBone' },
      ],
    },
    advance: {
      prompt: 'Replace the stylet. Advance 1–2 mm at a time, removing the stylet to check the hub after each step.',
      short: 'Advance',
      detail: `<p>Keep the stylet in while you advance, so tissue doesn’t plug the lumen.</p>`,
      choices: [
        { label: 'Clear CSF appears', to: 'xGo' },
        { label: 'Now well past the expected depth, still no CSF', to: 'deep' },
      ],
    },
    deep: {
      prompt: 'You’re deep enough but there is no CSF. Withdraw to the subcutaneous tissue and re-check before you redirect.',
      short: 'Re-check',
      detail: `<ul>
        <li>Is the back square? Shoulders and hips vertical, no rotation, good flexion.</li>
        <li>Re-feel the midline. Ask the patient which side they feel the needle.</li>
        <li>Is the needle blocked? Clot or tissue in the lumen can stop flow even when the tip is in the right place: check it, or use a new needle.</li>
        <li>Change one thing at a time. A slightly more cephalad angle is the commonest correction.</li>
      </ul>`,
      choices: [
        { label: 'Redirected: clear CSF flows', to: 'xGo' },
        { label: 'Several redirections and still no CSF', to: 'xEscalate' },
      ],
    },
    xGo: {
      outcome: 'Proceed only when clear CSF flows freely',
      tone: 'ok',
      body: `<p>Steady the hub against the patient’s back so the needle can’t move. Attach the syringe firmly and confirm that CSF aspirates easily before you inject.</p>`,
    },
    xBone: {
      outcome: 'Work through the bone contact tree',
      tone: 'ok',
      body: `<p>Bone tells you where you are. Note the depth, then use ${go('ts-bone', 'Bone contact')} to decide which way to redirect.</p>`,
    },
    xEscalate: {
      outcome: 'Change something bigger, or stop and get help',
      tone: 'danger',
      body: `<ul>
        <li>Ask a senior colleague to look or take over.</li>
        <li>Try another interspace, a paramedian approach or a better position (sitting, more flexion).</li>
        <li>Use an ultrasound pre-scan to mark the midline, the interspace and the depth. For scoliosis, obesity, an elderly or a previously operated back, see ${go('sx-scoliosis', 'the difficult-back approaches')}.</li>
        <li>Repeated passes add trauma. If it isn’t working, an alternative anaesthetic is a reasonable plan. Tell the patient and document what happened.</li>
      </ul>`,
    },
  },
};

export const bloodyTap = {
  id: 'ts-bloody-tap',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'Blood appears at the needle hub. What does the fluid do as it keeps flowing?',
      short: 'Blood in hub',
      choices: [
        { label: 'It clears to clear CSF', to: 'clear' },
        { label: 'It stays frankly bloody, or there is blood and no CSF', to: 'xNoInject' },
        { label: 'It is yellow or cloudy', to: 'xOdd' },
      ],
    },
    clear: {
      prompt: 'Is the CSF now completely clear, flowing freely and aspirating easily?',
      short: 'Clear?',
      detail: '<p>Blood-tinged fluid that clears usually means the needle grazed a small vessel on the way in.</p>',
      choices: [
        { label: 'Yes, clear and free-flowing', to: 'anticoag' },
        { label: 'No, still tinged or sluggish', to: 'xNoInject' },
      ],
    },
    anticoag: {
      prompt: 'Is anticoagulant or antiplatelet treatment (including thromboprophylaxis) planned after surgery, or was the last dose stopped only just long enough before the spinal?',
      short: 'Anticoagulants?',
      choices: [
        { label: 'No', to: 'xProceed' },
        { label: 'Yes, or not sure', to: 'xAnticoag' },
      ],
    },
    xNoInject: {
      outcome: 'Do not inject',
      tone: 'warn',
      body: `<p>The tip is probably in an epidural vein, often because the path is off the midline. Withdraw, re-check the midline and the patient’s position, then redirect or move to another interspace. Inject only when clear CSF flows freely.</p>`,
    },
    xOdd: {
      outcome: 'Don’t inject: the cause can’t be known at the bedside',
      tone: 'danger',
      body: '<p>Unexpectedly coloured or cloudy CSF needs explaining before anything is injected. Stop, tell a senior colleague, and choose another anaesthetic technique.</p>',
    },
    xProceed: {
      outcome: 'Proceed, and record the bloody tap',
      tone: 'ok',
      body: `<p>Write “bloody tap” in the anaesthetic record and tell recovery and the ward. Check that the block wears off as expected.</p><p>New back pain, new weakness or numbness, or a block that lasts much longer than expected needs urgent review for a spinal haematoma (urgent MRI and a neurosurgical opinion): see ${go('cx-haematoma', 'Haematoma')}.</p>`,
    },
    xAnticoag: {
      outcome: 'Proceed only with clear CSF; plan the next dose with the team',
      tone: 'warn',
      body: `<p>A traumatic puncture matters more when clotting is affected. Record the bloody tap, tell the surgeons and the ward, and agree when the next anticoagulant dose can be given. ASRA advises delaying LMWH for ${N('24 h')} after a traumatic puncture; ESAIC/ESRA say a longer delay than usual may be justified.${cite('asra2025', 'esaic2022')} Agree the timing with the surgeons. Ask for regular neurological checks until the block has worn off. Next-dose timing: ${go('tq-anticoag', 'Anticoagulant timing')}.</p>`,
    },
  },
};

export const paraesthesia = {
  id: 'ts-paraesthesia',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The patient feels a sudden electric shock down one leg. Stop advancing. Has it gone?',
      short: 'Shock down leg',
      detail: `<p>Paraesthesia during spinal needle insertion is fairly common.</p>`,
      choices: [
        { label: 'It was brief and went as soon as I stopped', to: 'csf' },
        { label: 'It persists', to: 'xPersist' },
      ],
    },
    csf: {
      prompt: 'Hold the needle still and remove the stylet. Is there clear CSF?',
      short: 'CSF?',
      detail: `<p>In one study, CSF was in the hub after 13 of 15 transient paraesthesias: most happen when the tip is already in the subarachnoid space and touches a nerve root. So stop and look for CSF before you withdraw.</p>`,
      choices: [
        { label: 'Yes, clear CSF', to: 'inject' },
        { label: 'No CSF', to: 'xNoCsf' },
      ],
    },
    inject: {
      prompt: 'Start injecting slowly. Is there any pain or paraesthesia during injection?',
      short: 'Inject slowly',
      choices: [
        { label: 'No, the patient is comfortable', to: 'xOk' },
        { label: 'Yes, pain or paraesthesia on injection', to: 'xStop' },
      ],
    },
    xPersist: {
      outcome: 'Do not inject. Withdraw.',
      tone: 'danger',
      body: `<p>Persistent paraesthesia suggests the needle is against or in a nerve. Withdraw, reassess, and re-site only if the patient is comfortable. In a large French survey, most nerve injuries after spinal followed paraesthesia during puncture or pain on injection.</p><p>Record the side and distribution. Examine the patient after the block wears off, and ask for a neurology opinion if there is a new deficit.</p>`,
    },
    xNoCsf: {
      outcome: 'Don’t inject; reassess before redirecting',
      tone: 'warn',
      body: `<p>Without CSF the tip may be beside a root in the epidural space or, if far lateral, near the foramen. Withdraw a little, re-check the midline and the patient’s position, then redirect. Stop if the paraesthesia comes back.</p>`,
    },
    xOk: {
      outcome: 'Complete the injection and document',
      tone: 'ok',
      body: '<p>Write down the side, where it was felt, how long it lasted and what you did. Check the patient after the block has worn off.</p>',
    },
    xStop: {
      outcome: 'Stop injecting now',
      tone: 'danger',
      body: `<p>Pain or paraesthesia on injection is a warning of nerve injury. Stop, withdraw, and get senior help with the plan. Document, follow the patient up, and ask for a neurology opinion if a deficit appears. See ${go('cx-neuro', 'Nerve injury')}.</p>`,
    },
  },
};

export const bone = {
  id: 'ts-bone',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The needle hits bone. Which approach are you using?',
      short: 'Bone',
      detail: '<p>Note the depth on the needle before you move it. Depth tells you which bone it is.</p>',
      choices: [
        { label: 'Midline', to: 'mid' },
        { label: 'Paramedian', to: 'para' },
      ],
    },
    mid: {
      prompt: 'Midline approach. How deep was the bone?',
      short: 'Midline',
      choices: [
        { label: 'Shallow: early, well before the space', to: 'midShallow' },
        { label: 'Deep: near where you expected the space', to: 'midDeep' },
      ],
    },
    midShallow: {
      prompt: 'This is probably a spinous process. Withdraw to the subcutaneous tissue and angle slightly more cephalad.',
      short: 'Spinous process',
      detail: `<p>Withdraw far enough that the ligaments stop holding the old line. A slightly more cephalad angle is the commonest correction; if you were already angled steeply up, try slightly caudad.</p>`,
      guide: 'mid-shallow',
      choices: [
        { label: 'Through to CSF', to: 'xOk' },
        { label: 'Bone again at the same depth', to: 'repeat' },
      ],
    },
    midDeep: {
      prompt: 'This is probably a lamina: the needle has drifted off the midline. Withdraw and aim back towards the midline.',
      short: 'Lamina',
      detail: `<p>Bone beyond the depth of the spinous processes suggests the needle is on a lamina and the path needs adjusting from side to side. Check the back isn’t rotated, re-feel the midline and ask which side the patient feels the needle.</p>`,
      guide: 'mid-deep',
      choices: [
        { label: 'Through to CSF', to: 'xOk' },
        { label: 'Bone again', to: 'repeat' },
      ],
    },
    para: {
      prompt: 'Paramedian approach. How deep was the bone?',
      short: 'Paramedian',
      choices: [
        { label: 'Much earlier than expected', to: 'paraShallow' },
        { label: 'Around the expected depth', to: 'paraDeep' },
      ],
    },
    paraShallow: {
      prompt: 'Bone much earlier than expected: the needle isn’t where you think. Withdraw to the subcutaneous tissue and re-check the entry point and angles.',
      short: 'Early bone',
      detail: '<p>A steep medial angle can meet the side of a spinous process early. Reduce the medial angle, then advance until you meet the lamina at the expected depth. If you can’t make sense of it, an ultrasound pre-scan or a senior colleague will help.</p>',
      guide: 'para-shallow',
      choices: [
        { label: 'Now reaching lamina at the expected depth', to: 'paraDeep' },
        { label: 'Still early bone', to: 'repeat' },
      ],
    },
    paraDeep: {
      prompt: 'This is the lamina, as expected. Use it as your depth marker and walk off its upper edge.',
      short: 'Walk off lamina',
      detail: '<p>Make small changes, one at a time: a little more cephalad first, then a little more medial if needed. The ligamentum flavum lies just beyond the lamina’s upper edge.</p>',
      guide: 'para-deep',
      choices: [
        { label: 'Through to CSF', to: 'xOk' },
        { label: 'Can’t find the gap', to: 'repeat' },
      ],
    },
    repeat: {
      prompt: 'Repeated bone contact. Have you fixed the position and re-checked your landmarks?',
      short: 'Repeated bone',
      choices: [
        { label: 'No: improve flexion, square the back, re-feel the landmarks', to: 'xReposition' },
        { label: 'Yes, and it still isn’t working', to: 'xEscalate' },
      ],
    },
    xOk: {
      outcome: 'Continue: proceed once clear CSF flows freely',
      tone: 'ok',
      body: '<p>Confirm free flow and easy aspiration before injecting. Note the depth for next time.</p>',
    },
    xReposition: {
      outcome: 'Reposition, then start the pass again',
      tone: 'ok',
      body: '<p>Good positioning solves most bone contact. Sit the patient up if you can, ask them to curl forward, and have an assistant keep the shoulders and hips square. Then re-feel the interspace and start a fresh pass.</p>',
    },
    xEscalate: {
      outcome: 'Change the plan, or get help',
      tone: 'danger',
      body: `<ul><li>Try a paramedian approach, or another interspace.</li><li>Use an ultrasound pre-scan to find the midline, the interspace and the depth.</li><li>Ask a senior colleague. Repeated passes add trauma and distress.</li></ul>`,
    },
  },
};

// ------------------------------------------------------------------ after injection

export const failed = {
  id: 'ts-failed',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The surgeon is ready, but the block seems inadequate. How long since you injected?',
      short: 'Inadequate?',
      choices: [
        { label: 'Less than about 20 minutes', to: 'test' },
        { label: 'About 20 minutes or more', to: 'pattern' },
      ],
    },
    test: {
      prompt: 'Wait, and test the block properly.',
      short: 'Test properly',
      detail: `<ul>
        <li>Onset can be gradual. Testing too early can convince the patient it has failed.</li>
        <li>Look for leg weakness and a fall in blood pressure first.</li>
        <li>Test cold and pinprick from the lowest dermatomes upwards. Height alone doesn’t prove quality: before incision, a covert pinch with forceps tells you more.</li>
        <li>If there’s no typical onset by about 15 minutes, the block is likely to be inadequate. Allow 20 minutes to be sure no block is coming.</li>
      </ul>`,
      choices: [
        { label: 'The block is developing', to: 'xWait' },
        { label: 'Still inadequate at 20 minutes', to: 'pattern' },
      ],
    },
    pattern: {
      prompt: 'What pattern do you find?',
      short: 'Pattern',
      detail: `<p>Failure can mean no block, or a block of the wrong height, density, duration or side.</p>`,
      choices: [
        { label: 'No block at all', to: 'none' },
        { label: 'Too low, or not dense enough', to: 'low' },
        { label: 'One side only', to: 'xUni' },
        { label: 'Patchy', to: 'xPatchy' },
        { label: 'Wearing off before surgery ends', to: 'xShort' },
        { label: 'A CSE or epidural catheter is already in', to: 'xTopup' },
      ],
    },
    none: {
      prompt: 'Complete failure. Have you found, and can you correct, the likely cause?',
      short: 'No block',
      detail: '<p>Think through the steps: no CSF at injection (pseudo-success), a leak at the hub, the needle moving as the syringe was attached, a syringe swap or the wrong drug.</p>',
      choices: [
        { label: 'Yes, and a repeat spinal is reasonable for this patient', to: 'xRepeat' },
        { label: 'No, or the patient isn’t suitable', to: 'xGa' },
      ],
    },
    low: {
      prompt: 'Was the local anaesthetic hyperbaric (heavy)?',
      short: 'Too low',
      choices: [
        { label: 'Yes, hyperbaric', to: 'xTilt' },
        { label: 'No, plain (isobaric)', to: 'xSupplement' },
      ],
    },
    xWait: {
      outcome: 'Give it time, then re-test',
      tone: 'ok',
      body: '<p>Tell the surgeon and the patient what you are doing. Re-test before incision, including a covert pinch.</p>',
    },
    xRepeat: {
      outcome: 'Repeat the spinal, with caution',
      tone: 'warn',
      body: `<ul>
        <li>Only when the first injection has failed completely and enough time (about 20 minutes) has passed.</li>
        <li>Don’t repeat after a slow but working block, or a patchy or low block: a second dose can give an unexpectedly high or total spinal.</li>
        <li>High intrathecal local anaesthetic concentrations can be neurotoxic, and if an anatomical barrier caused the failure, a repeat may fail too.</li>
        <li>Use a different level, and consider a different needle. Aspirate CSF before and after the injection.</li>
        <li>Agree the dose with a senior colleague, usually a reduced dose if there is any doubt that the first dose went in. Never give a large repeat dose “blind”.</li>
      </ul>`,
    },
    xGa: {
      outcome: 'Convert to general anaesthesia',
      tone: 'warn',
      body: `<p>Tell the surgeon and the patient early, believe the patient’s pain, and don’t leave someone in distress. Afterwards, explain what happened, document it, and investigate if a drug fault is possible.</p>`,
    },
    xTilt: {
      outcome: 'Use posture to spread the block',
      tone: 'ok',
      body: `<p>Only if the blood pressure is stable: tilt the patient head-down with the hips and knees flexed to flatten the lumbar lordosis, then re-test. Stop the tilt as soon as the block reaches the level you need. This is a deliberate way to raise a block that is too low. Never use head-down tilt to treat low blood pressure (see ${go('ts-hypotension', 'Hypotension')}).</p>`,
    },
    xUni: {
      outcome: 'Turn the unblocked side down',
      tone: 'ok',
      body: `<p>With a hyperbaric solution, turning the patient onto the unblocked side can spread the block. A one-sided block may be enough for surgery on that side, but warn the surgeon. Repositioning is less likely to help with a plain solution.</p>`,
    },
    xPatchy: {
      outcome: 'Supplement or convert; do not repeat the spinal',
      tone: 'warn',
      body: `<p>A patchy block means some drug is in the right place, so a second full dose risks a high block. Use IV analgesia and sedation, local infiltration by the surgeon, or general anaesthesia. A repeat spinal is a senior decision with a reduced dose.</p>`,
    },
    xTopup: {
      outcome: 'Top up the epidural in small steps',
      tone: 'warn',
      body: `<p>Give small increments and test between each. Volume in the epidural space can push a spinal block higher, so watch the blood pressure, breathing and hands. If the top-up does not give a working block, convert to general anaesthesia.</p>`,
    },
    xSupplement: {
      outcome: 'Supplement or convert',
      tone: 'warn',
      body: `<p>Changing posture rarely helps a plain solution. Supplement with IV analgesia or sedation, or local infiltration by the surgeon, or convert to general anaesthesia.</p>`,
    },
    xShort: {
      outcome: 'Supplement or convert to GA',
      tone: 'warn',
      body: `<p>This is the same problem as ${go('ts-wearing-off', 'a block wearing off during surgery')}: use IV analgesia or sedation, local infiltration, or general anaesthesia. Do not repeat the spinal. Agree the plan with the surgeon early.</p>`,
    },
  },
};

export const highSpinal = {
  id: 'ts-high-spinal',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'After the spinal, the patient is short of breath, has weak hands or struggles to speak. Is the patient conscious and breathing adequately?',
      short: 'High block?',
      detail: `<p>The usual sequence is hypotension and bradycardia, then difficulty breathing, then arm weakness, then reduced consciousness, then apnoea. It can progress slowly or fast.${cite('ts-qrh2023')}</p>`,
      choices: [
        { label: 'Conscious and breathing, but weak or distressed', to: 'support' },
        { label: 'Apnoeic, or consciousness is falling', to: 'airway' },
      ],
    },
    support: {
      prompt: 'Call for help. Reassure the patient. Give 100% oxygen and treat the circulation. Is breathing holding up?',
      short: 'Help and oxygen',
      detail: `<ul>
        <li>The patient may be fully aware: talk to them and explain.</li>
        <li>Rapid IV fluid. Raise the legs. Do not tilt head-down.${cite('ts-qrh2023')}</li>
        <li>Treat a slow heart rate and low blood pressure. QRH 3-11 doses:${cite('ts-qrh2023')}</li>
      </ul>
      ${QRH_CIRC_DOSES}`,
      choices: [
        { label: 'Breathing adequate; the block has stopped rising', to: 'xWatch' },
        { label: 'Breathing failing, or consciousness falling', to: 'airway' },
      ],
    },
    airway: {
      prompt: 'Secure the airway: 100% oxygen, jaw thrust, then a supraglottic airway or tracheal tube. Is the patient intubated and ventilated?',
      short: 'Airway',
      detail: `<p>Use a reduced dose of induction drug: a full dose will drop the blood pressure further and isn’t needed if consciousness is already impaired. A neuromuscular blocker may not be needed if the patient is apnoeic and paralysed.${cite('ts-qrh2023')}</p>`,
      choices: [
        { label: 'Yes, airway secured and ventilated', to: 'circ' },
        { label: 'Difficulty with the airway', to: 'xAirway' },
      ],
    },
    circ: {
      prompt: 'Check the circulation. Is there a pulse?',
      short: 'Circulation',
      choices: [
        { label: 'Pulse present, but low blood pressure or slow heart rate', to: 'xCirc' },
        { label: 'No pulse', to: 'xArrest' },
      ],
    },
    xWatch: {
      outcome: 'Stay with the patient and keep supporting',
      tone: 'warn',
      body: '<p>Keep oxygen on, keep treating blood pressure and heart rate, and recheck breathing, speech and grip often. Be ready to secure the airway if things change. Plan where the patient will be cared for afterwards.</p>',
    },
    xAirway: {
      outcome: 'Follow your difficult airway algorithm',
      tone: 'danger',
      body: '<p>Oxygenation comes first. Call for the most experienced help available and follow a difficult airway algorithm.</p>',
    },
    xCirc: {
      outcome: 'Treat the circulation, then sedate and plan ongoing care',
      tone: 'danger',
      body: `<p>Doses as printed in the Association of Anaesthetists QRH 3-11 for this emergency (they differ slightly from the product-label doses: both sets are side by side in ${go('ts-doses', 'the dose table at the top')}):${cite('ts-qrh2023')}</p>
        ${QRH_CIRC_DOSES}
        <p>Once the airway is secure, keep the patient asleep: the block can leave them paralysed but aware. Consider other causes (local anaesthetic toxicity, embolism, haemorrhage, a vasovagal event). Support until the block wears off, in a suitable place.</p>`,
    },
    xArrest: {
      outcome: 'Cardiac arrest: start CPR now',
      tone: 'danger',
      body: `<p>Call the arrest team and follow the advanced life support algorithm. CPR may be needed just to circulate the drugs. Consider other causes, including local anaesthetic toxicity (see ${go('cx-last', 'LAST')}).</p>`,
    },
  },
};

export const hypotension = {
  id: 'ts-hypotension',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The blood pressure has fallen after the spinal. Is the patient responsive, breathing, with a pulse?',
      short: 'Low BP',
      choices: [
        { label: 'Yes', to: 'cause' },
        { label: 'No: unresponsive or no pulse', to: 'xArrest' },
      ],
    },
    cause: {
      prompt: 'Check the block height and look for other causes. Is the block higher than you planned?',
      short: 'Block height',
      detail: `<p>Hypotension is more likely with a higher block (at or above T5) and in older patients. Also think about bleeding, surgical compression of the vena cava, anaphylaxis and embolism.</p>`,
      choices: [
        { label: 'Yes: weak hands, breathless or struggling to speak', to: 'xHigh' },
        { label: 'No: block about as planned', to: 'hr' },
      ],
    },
    hr: {
      prompt: 'What is the heart rate?',
      short: 'Heart rate',
      choices: [
        { label: 'Normal or fast', to: 'alpha' },
        { label: 'Slow', to: 'brady' },
      ],
    },
    alpha: {
      prompt: 'Give a vasopressor and support venous return. Does the blood pressure respond?',
      short: 'Vasopressor',
      detail: `<ul>
        <li>Phenylephrine ${D('50–100 µg')} IV bolus, repeated to effect (no single bolus over ${D('100 µg')}).${cite('ts-smpc-phe')}</li>
        <li>Or metaraminol: one IV bolus should usually not exceed ${D('1 mg')}; the label maximum by repeated bolus is ${D('5 mg')}.${cite('ts-smpc-met')}</li>
        <li>Raise the legs, give an IV fluid bolus, and turn down any sedation.</li>
      </ul>`,
      choices: [
        { label: 'Yes, recovering', to: 'xOk' },
        { label: 'No: pressure still low, heart rate normal', to: 'refractory' },
        { label: 'The heart rate is now slow', to: 'brady' },
      ],
    },
    brady: {
      prompt: 'Treat the rate and the pressure together. Does the patient respond?',
      short: 'Slow and low',
      detail: `<ul>
        <li>Ephedrine ${D('3–6 mg')} slow IV (maximum ${D('9 mg')} per dose), repeated every 3–4 minutes up to ${D('30 mg')}.${cite('ts-smpc-eph')}</li>
        <li>Atropine ${D('0.5 mg')} IV, repeated every 2–5 minutes to effect,${cite('ts-smpc-atr')} or glycopyrronium ${D('200–400 µg')} IV, which may be repeated.${cite('ts-smpc-gly')}</li>
        <li>Phenylephrine alone can slow the heart further, so it is not the first choice here.</li>
        <li>Raise the legs and give IV fluid.</li>
      </ul>`,
      choices: [
        { label: 'Yes, recovering', to: 'xOk' },
        { label: 'No, or the heart rate is dropping fast', to: 'refractory' },
      ],
    },
    refractory: {
      prompt: 'Not responding. Call for help now. Is the patient still conscious with a pulse?',
      short: 'Not responding',
      choices: [
        { label: 'Yes, but the blood pressure or heart rate is still very low', to: 'xAdrenaline' },
        { label: 'No: losing consciousness or no pulse', to: 'xArrest' },
      ],
    },
    xOk: {
      outcome: 'Keep treating early, and watch closely',
      tone: 'ok',
      body: `<p>Set the blood pressure to cycle frequently until it is stable. Treat early rather than waiting for a big fall. Recheck the block height. Consider a vasopressor infusion if repeated boluses are needed, and ask for help if they are. Doses: ${go('ts-doses', 'dose table')}. Which drug and why: ${go('ph-pressors', 'Vasopressors')}.</p>`,
    },
    xHigh: {
      outcome: 'Treat as a high spinal',
      tone: 'danger',
      body: `<p>Call for help and go to ${go('ts-high-spinal', 'High or total spinal')}.</p>`,
    },
    xAdrenaline: {
      outcome: 'Escalate to adrenaline; look for the cause',
      tone: 'danger',
      body: `<p>The Association of Anaesthetists QRH lists adrenaline ${D('1 µg/kg')} (adult ${D('10–100 µg')}) IV for emergency use in hypotension and bradycardia.${cite('ts-qrh2023')} Escalate early if the heart rate falls suddenly: cardiac arrest under spinal is rare but more common than with other regional techniques. Go back through airway, breathing and circulation, and think about bleeding, a high block, anaphylaxis and embolism.</p>`,
    },
    xArrest: {
      outcome: 'Cardiac arrest: start CPR now',
      tone: 'danger',
      body: `<p>Call the arrest team and follow the advanced life support algorithm. Consider a high spinal and local anaesthetic toxicity (see ${go('cx-last', 'LAST')}) among the causes.</p>`,
    },
  },
};

export const bradycardia = {
  id: 'ts-bradycardia',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The heart rate is falling after the spinal. Is there a pulse, and is the patient responsive?',
      short: 'Slow heart',
      detail: `<p>Look at the monitor trend as well as the number: a rate that has dropped quickly, or a new pause, is more dangerous than a steady slow rate.</p>`,
      choices: [
        { label: 'Pulse present and responsive', to: 'cause' },
        { label: 'No pulse, or unresponsive', to: 'xArrest' },
      ],
    },
    cause: {
      prompt: 'Stop what is slowing the heart, and call for help. Is the blood pressure adequate and is the rate stable?',
      short: 'Pressure and trend',
      detail: `<ul>
        <li>Ask the surgeon to stop any traction or peritoneal stretch, and pause sedation.</li>
        <li>Raise the legs. Give oxygen. Check the block height.</li>
        <li>Think of a high block, bleeding, a vasovagal faint, a drug effect (for example a beta-blocker, dexmedetomidine, neostigmine) and local anaesthetic toxicity.</li>
      </ul>`,
      choices: [
        { label: 'Blood pressure adequate, rate slow but stable', to: 'xWatch' },
        { label: 'Low blood pressure or symptoms, or the rate is still falling', to: 'treat' },
      ],
    },
    treat: {
      prompt: 'Give an antimuscarinic now, and treat the pressure. Is there a response?',
      short: 'Treat rate and pressure',
      detail: `<ul>
        <li>Atropine ${D('0.5 mg')} IV (label), repeated every 2–5 minutes to effect, or glycopyrronium ${D('200–400 µg')} IV.${cite('ts-smpc-atr', 'ts-smpc-gly')} The QRH range is higher: ${D('0.6–1.2 mg')} atropine.${cite('ts-qrh2023')}</li>
        <li>Ephedrine ${D('3–6 mg')} slow IV (label), as the vasopressor of choice when the heart is slow.${cite('ts-smpc-eph')}</li>
        <li>Fluid, and legs up.</li>
      </ul>`,
      choices: [
        { label: 'Yes, rate and pressure recovering', to: 'xOk' },
        { label: 'No, or it is getting worse', to: 'refractory' },
      ],
    },
    refractory: {
      prompt: 'Not responding. Is there still a pulse?',
      short: 'Not responding',
      choices: [
        { label: 'Yes, but very slow or very low pressure', to: 'xAdrenaline' },
        { label: 'No pulse, or losing consciousness', to: 'xArrest' },
      ],
    },
    xWatch: {
      outcome: 'Watch closely and have the drugs drawn up',
      tone: 'warn',
      body: '<p>Cycle the blood pressure every minute. Have atropine or glycopyrronium and a vasopressor in your hand. A slow rate can fall further with no warning, especially in a young, fit patient or one on a beta-blocker.</p>',
    },
    xOk: {
      outcome: 'Keep watching; find out why',
      tone: 'ok',
      body: '<p>Keep the blood pressure cycling often until stable. Record the lowest rate, what you gave, and how quickly it responded. Think about why it happened (high block, traction, drugs) so it does not recur when the position changes.</p>',
    },
    xAdrenaline: {
      outcome: 'Escalate to adrenaline and call the team',
      tone: 'danger',
      body: `<p>The Association of Anaesthetists QRH lists adrenaline ${D('1 µg/kg')} (adult ${D('10–100 µg')}) IV for severe or refractory bradycardia or hypotension.${cite('ts-qrh2023')} Call for senior help now, because asystole can follow quickly. Prepare for CPR.</p>`,
    },
    xArrest: {
      outcome: 'Cardiac arrest: start CPR now',
      tone: 'danger',
      body: `<ul>
        <li>Start chest compressions and call the arrest team. Follow the advanced life support algorithm.</li>
        <li>Give adrenaline as the algorithm directs; in a non-shockable rhythm that is straight away.</li>
        <li>Raise the legs if you can. If the patient is pregnant, use manual uterine displacement.</li>
        <li>Look for the cause: a high block, bleeding, anaphylaxis, embolism, and local anaesthetic toxicity (see ${go('cx-last', 'LAST')}).</li>
      </ul>`,
    },
  },
};

export const anxious = {
  id: 'ts-anxious',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The awake patient is anxious, restless or tearful. Could something physical be causing it?',
      short: 'Anxious patient',
      detail: `<p>Restlessness, a feeling of doom and sudden anxiety can be the first sign of low blood pressure, low oxygen, a rising block, a full bladder, pain or cold. Look before you sedate.</p>`,
      choices: [
        { label: 'Possibly: breathless, sweaty, pale, feeling sick, or the pressure is low', to: 'xPhysical' },
        { label: 'No: vital signs and the block are fine', to: 'talk' },
      ],
    },
    talk: {
      prompt: 'Talk to them. Ask what worries them, explain what they will feel, and offer a hand, music or a quiet voice. Does that settle them?',
      short: 'Reassure',
      detail: `<ul>
        <li>Tell them what is normal: warm, heavy legs, pressure and tugging, and noise from the theatre.</li>
        <li>Tell them what you are doing as you do it. Ask them to tell you at once about pain, breathlessness or a change in their hands.</li>
        <li>Check the practical things: warm blanket, a comfortable position, a screen between them and the surgery.</li>
      </ul>`,
      choices: [
        { label: 'Yes, calmer', to: 'xGood' },
        { label: 'No, still distressed', to: 'safe' },
      ],
    },
    safe: {
      prompt: 'Is it safe to give sedation? Stable pressure, a block no higher than planned, normal breathing and an alert patient?',
      short: 'Safe to sedate?',
      detail: `<p>Sedation on top of a high block, in a frail patient, or with intrathecal opioid on board can slow breathing and hide the warning signs of a rising block.</p>`,
      choices: [
        { label: 'Yes, all stable', to: 'xSedate' },
        { label: 'No, or unsure', to: 'xGa' },
      ],
    },
    xPhysical: {
      outcome: 'Treat the cause first',
      tone: 'danger',
      body: `<p>Check airway, breathing and circulation, the blood pressure and the block height. Go to ${go('ts-hypotension', 'Hypotension')} or ${go('ts-high-spinal', 'High or total spinal')} if they fit. Do not sedate a patient whose anxiety may be a symptom.</p>`,
    },
    xGood: {
      outcome: 'Carry on, and keep talking',
      tone: 'ok',
      body: '<p>Stay by the head of the bed. Keep telling the patient what is happening, and check back at intervals.</p>',
    },
    xSedate: {
      outcome: 'Small doses, one drug you know, keep talking',
      tone: 'warn',
      body: '<p>Give a small amount of a drug you know well, wait for its effect, and repeat only if needed. Aim for a calm patient who answers when spoken to, not a deeply sedated one. Keep oxygen on, watch breathing and saturation after every dose, and keep the surgeon informed.</p>',
    },
    xGa: {
      outcome: 'Tell the surgeon, and consider general anaesthesia',
      tone: 'warn',
      body: '<p>A patient who cannot tolerate being awake, and who cannot be sedated safely, may be better served by general anaesthesia. Pause the surgery, get senior help, and agree the plan with the patient and the surgeon rather than pressing on.</p>',
    },
  },
};

export const wearingOff = {
  id: 'ts-wearing-off',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'During surgery the patient says they can feel something. What are they feeling?',
      short: 'Feeling something',
      detail: `<ul>
        <li>Touch and pressure are blocked last and often stay. Pressure, pulling and movement without pain are normal under a good spinal.</li>
        <li>Sharp pain, or touch that is clearly increasing, means the block is not doing its job.</li>
        <li>Anxiety, a cold theatre and a full bladder can make a working block feel worse. Ask what the sensation is, and where.</li>
      </ul>`,
      choices: [
        { label: 'Pressure or pulling, not painful', to: 'xReassure' },
        { label: 'Real pain, or sharp touch', to: 'test' },
      ],
    },
    test: {
      prompt: 'Test the block now with cold or pinprick, on both sides. What do you find?',
      short: 'Test the block',
      detail: '<p>Compare with the level you recorded earlier. Sensory block regresses from the top down, and the sacral segments clear last.</p>',
      choices: [
        { label: 'The level has dropped, or sensation has returned in the operative area', to: 'time' },
        { label: 'The block is still high, and the pain is deep or comes with a pull on the bowel or peritoneum', to: 'xVisceral' },
        { label: 'The leg is blocked, but the pain is under a tourniquet', to: 'xTourniquet' },
      ],
    },
    time: {
      prompt: 'Ask the surgeon how much longer they need. Can they finish soon?',
      short: 'Time left',
      detail: '<p>Say what you are doing in front of the patient. Do not carry on while the patient is in pain.</p>',
      choices: [
        { label: 'Only a short time left', to: 'xSupplement' },
        { label: 'Long, or the surgeon can’t say', to: 'fit' },
      ],
    },
    fit: {
      prompt: 'Is the patient stable, calm and able to protect the airway, so that sedation and analgesia are safe?',
      short: 'Safe to supplement?',
      detail: '<p>Think about the airway, breathing and blood pressure first. Sedation on top of a high block, in a frail patient, or with intrathecal opioid on board can cause problems with breathing.</p>',
      choices: [
        { label: 'Yes, stable and cooperative', to: 'xSupplement' },
        { label: 'No: unstable, distressed, airway concerns, or the pain is not controlled', to: 'xGa' },
      ],
    },
    xReassure: {
      outcome: 'Reassure and carry on',
      tone: 'ok',
      body: '<p>Explain that touch and pressure are normal. Tell the surgeon, keep talking to the patient, and re-test if the patient’s worry continues.</p>',
    },
    xVisceral: {
      outcome: 'Ask the surgeon to ease off, then supplement',
      tone: 'warn',
      body: '<p>Traction on the peritoneum or bowel can cause pain or nausea even with a good block. Ask the surgeon to pause or release the traction, treat the blood pressure and nausea, and give small doses of IV analgesia. If it keeps coming back, plan for general anaesthesia.</p>',
    },
    xTourniquet: {
      outcome: 'Expect this: treat it, or ask for the tourniquet to come down',
      tone: 'warn',
      body: '<p>Tourniquet pain commonly appears after a long inflation time, even with a good block. Ask the surgeon how long it has been up and whether it can be released. IV analgesia and light sedation may help. Do not mistake it for a failing block.</p>',
    },
    xSupplement: {
      outcome: 'Supplement, in small steps',
      tone: 'warn',
      body: `<ul>
        <li>Ask the surgeon to infiltrate local anaesthetic.</li>
        <li>Give IV analgesia, or light sedation, in small increments. Use drugs and doses you know, and give them slowly.</li>
        <li>Watch breathing, oxygen saturation and blood pressure after every dose, and keep talking to the patient.</li>
        <li>Do not repeat the spinal. A second dose into a regressing block can behave unpredictably.</li>
        <li>If the pain is not controlled within a few minutes, convert to general anaesthesia.</li>
      </ul>`,
    },
    xGa: {
      outcome: 'Convert to general anaesthesia',
      tone: 'danger',
      body: `<ul>
        <li>Tell the surgeon and the patient. Ask the surgeon to pause, and to cover the wound.</li>
        <li>Get a senior colleague and a second pair of hands. Plan the airway and the induction as you would for any general anaesthetic.</li>
        <li>The spinal can still lower blood pressure. Use a reduced induction dose, and have a vasopressor ready.</li>
        <li>Tell the patient afterwards what happened, and write it in the record.</li>
      </ul>`,
    },
  },
};

// ------------------------------------------------------------------ "What would you do?" scenarios

export const caseHip = {
  id: 'ts-case-hip',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'What do you do first?',
      short: 'Scenario',
      detail: '<p class="ts-vignette">An 82-year-old woman is having a hip fracture fixed under spinal anaesthesia. Five minutes after the injection her blood pressure is <span class="sp-num">70/40</span> and her heart rate <span class="sp-num">45</span>. She says she feels sick.</p>',
      choices: [
        { label: 'Give ondansetron for the nausea', to: 'n2', note: '<p>Not first. Her nausea is most likely from low blood pressure. An antiemetic won’t fix that, and it delays the real treatment.</p>' },
        { label: 'Give phenylephrine 100 µg', to: 'n2', note: '<p>It raises the pressure, but phenylephrine alone can slow the heart further. With a heart rate of 45 you need something that treats the rate as well.</p>' },
        { label: 'Call for help, check she’s responsive and breathing, give ephedrine or atropine, raise the legs and give fluid', to: 'n2', note: `<p>Good. Slow heart rate with low pressure: treat both. Ephedrine ${D('3–6 mg')} IV${cite('ts-smpc-eph')} or atropine ${D('0.5 mg')} IV.${cite('ts-smpc-atr')} Raising the legs helps venous return.</p>` },
        { label: 'Tilt her head-down', to: 'n2', note: '<p>Not ideal. After a heavy (hyperbaric) spinal, head-down tilt can push the block higher. Raise the legs instead.</p>' },
      ],
    },
    n2: {
      prompt: 'After treatment her pressure is 85/50 and heart rate 58. She is talking. What next?',
      short: 'Partial response',
      choices: [
        { label: 'Check the block height, keep treating early, and consider an infusion and arterial line', to: 'xGood', note: '<p>Good. She is still well below her likely baseline. Keep going.</p>' },
        { label: 'She’s talking: wait and recheck in 10 minutes', to: 'xWait', note: '<p>Too long. An elderly patient can deteriorate quickly; keep the blood pressure cycling frequently until it is stable.</p>' },
        { label: 'Give adrenaline now', to: 'xAdr', note: '<p>Not yet. She is responding. Adrenaline is for severe or refractory hypotension or bradycardia.</p>' },
      ],
    },
    xGood: {
      outcome: 'Treat early and keep close watch',
      tone: 'ok',
      body: `<p>Older age and a higher block both raise the risk of hypotension. Check the block height, look for blood loss, and keep the surgeon informed. See ${go('ts-hypotension', 'Hypotension and bradycardia')}.</p>`,
    },
    xWait: {
      outcome: 'Don’t wait: recheck at short intervals',
      tone: 'warn',
      body: '<p>Keep treating until the pressure is close to her baseline, and recheck often. Ask for help if it isn’t improving.</p>',
    },
    xAdr: {
      outcome: 'Hold adrenaline for when she isn’t responding',
      tone: 'warn',
      body: `<p>Keep it ready. If the heart rate drops suddenly or she stops responding, escalate early: see ${go('ts-hypotension', 'Hypotension and bradycardia')}.</p>`,
    },
  },
};

export const caseParaesthesia = {
  id: 'ts-case-paraesthesia',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'What do you do?',
      short: 'Scenario',
      detail: '<p class="ts-vignette">You are inserting a 25G pencil-point needle at L3–4 in a 55-year-old man for knee surgery. He suddenly says, “Electric shock down my right leg!” It stops as soon as you stop.</p>',
      choices: [
        { label: 'Withdraw fully and redirect to the left', to: 'n2', note: `<p>Some people teach this, but a study found CSF in the hub after most brief paraesthesias, so you may already be in the right place. Look first.</p>` },
        { label: 'Hold still, remove the stylet and look for CSF', to: 'n2', note: '<p>Good. A brief paraesthesia often means the tip is in the subarachnoid space touching a root.</p>' },
        { label: 'Inject quickly before he moves', to: 'n2', note: '<p>No. Never inject without confirming free-flowing CSF, and never through ongoing paraesthesia.</p>' },
      ],
    },
    n2: {
      prompt: 'Clear CSF flows. You start injecting slowly and he says, “It’s burning down my right leg again.” What now?',
      short: 'Pain on injection',
      choices: [
        { label: 'Stop injecting and withdraw', to: 'xStop', note: '<p>Correct. Pain on injection is a warning of nerve injury.</p>' },
        { label: 'Carry on slowly; it’ll pass', to: 'xStop', note: `<p>No. Most nerve injuries after spinal in a large French survey followed paraesthesia during puncture or pain on injection.</p>` },
        { label: 'Ask him to keep still and inject faster', to: 'xStop', note: '<p>No. Stop as soon as there is pain on injection.</p>' },
      ],
    },
    xStop: {
      outcome: 'Stop, withdraw and get senior help',
      tone: 'danger',
      body: '<p>Don’t inject the rest. Decide with a senior colleague whether to re-site or change technique. Record the side, distribution and what was injected, follow him up after the block wears off, and ask for a neurology opinion if a deficit appears.</p>',
    },
  },
};

export const caseUnilateral = {
  id: 'ts-case-unilateral',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'What do you do?',
      short: 'Scenario',
      detail: '<p class="ts-vignette">A 60-year-old woman is listed for a right knee arthroscopy. You gave hyperbaric bupivacaine with her sitting, then laid her supine. Fifteen minutes later the left leg is dense and heavy; the right leg has only patchy cold loss and she can lift it.</p>',
      choices: [
        { label: 'Give a second spinal now', to: 'n2', note: `<p>Risky. There is a working block, so a second dose could spread unpredictably and give a high or total spinal.</p>` },
        { label: 'Turn her right side down, wait and re-test', to: 'n2', note: `<p>Good. With a hyperbaric solution, turning the unblocked side down can spread the block.</p>` },
        { label: 'Tell the surgeon to start; it’ll come up', to: 'n2', note: '<p>No. Test properly first. Starting on an unblocked side leaves the patient in pain and loses her trust.</p>' },
      ],
    },
    n2: {
      prompt: 'Ten minutes with the right side down. The right leg is now dense. A covert pinch with forceps at the knee is painless. What next?',
      short: 'Re-test',
      choices: [
        { label: 'Proceed, and tell the surgeon what happened', to: 'xGo', note: '<p>Good.</p>' },
        { label: 'Repeat the spinal to be safe', to: 'xGo', note: '<p>Not needed, and potentially dangerous: the block is now adequate.</p>' },
      ],
    },
    xGo: {
      outcome: 'Proceed, keep checking, and have a backup plan',
      tone: 'ok',
      body: `<p>Watch the blood pressure after the position change. If the block fades or she feels pain, supplement or convert: see ${go('ts-failed', 'Inadequate or failed spinal')}.</p>`,
    },
  },
};
