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
      detail: `<p>With a pencil-point needle the side hole sits just behind the tip, so the tip can be through the dura while the hole is still outside it. Rotation is often suggested, but its benefit is theoretical.${cite('ts-nysora-failed')}</p>`,
      choices: [
        { label: 'Clear CSF appears and keeps dripping', to: 'xGo' },
        { label: 'Still nothing', to: 'depth' },
      ],
    },
    rotate: {
      prompt: 'Rotate the needle a quarter-turn at a time and watch the hub again.',
      short: 'Rotate',
      detail: `<p>With a pencil-point needle the side hole sits just behind the tip, so the tip can be through the dura while the hole is still outside it. Rotation is often suggested, but its benefit is theoretical.${cite('ts-nysora-failed')}</p>`,
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
      detail: `<p>Keep the stylet in while you advance, so tissue doesn’t plug the lumen.${cite('ts-nysora-failed')}</p>`,
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
        <li>Is the needle blocked? Clot or tissue in the lumen can stop flow even when the tip is in the right place: check it, or use a new needle.${cite('ts-nysora-failed')}</li>
        <li>Change one thing at a time. A slightly more cephalad angle is the commonest correction.${cite('ts-nysora-failed')}</li>
      </ul>`,
      choices: [
        { label: 'Redirected: clear CSF flows', to: 'xGo' },
        { label: 'Several redirections and still no CSF', to: 'xEscalate' },
      ],
    },
    xGo: {
      outcome: 'Proceed only when clear CSF flows freely',
      tone: 'ok',
      body: `<p>Steady the hub against the patient’s back so the needle can’t move. Attach the syringe firmly and confirm that CSF aspirates easily before you inject.${cite('ts-nysora-failed')}</p>`,
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
        <li>Use an ultrasound pre-scan to mark the midline, the interspace and the depth.${cite('chin2011', 'perlas2016')}</li>
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
      body: '<p>Write “bloody tap” in the anaesthetic record and tell recovery and the ward. Check that the block wears off as expected.</p><p>New back pain, new weakness or numbness, or a block that lasts much longer than expected needs urgent review for a spinal haematoma (urgent MRI and a neurosurgical opinion).</p>',
    },
    xAnticoag: {
      outcome: 'Proceed only with clear CSF; plan the next dose with the team',
      tone: 'warn',
      body: `<p>A traumatic puncture matters more when clotting is affected. Record the bloody tap, tell the surgeons and the ward, and agree when the next anticoagulant dose can be given. ASRA advises delaying LMWH for ${N('24 h')} after a traumatic puncture; ESAIC/ESRA say a longer delay than usual may be justified.${cite('asra2025', 'esaic2022')} Agree the timing with the surgeons. Ask for regular neurological checks until the block has worn off.</p>`,
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
      detail: `<p>Paraesthesia during spinal needle insertion is fairly common.${cite('ts-pong2009')}</p>`,
      choices: [
        { label: 'It was brief and went as soon as I stopped', to: 'csf' },
        { label: 'It persists', to: 'xPersist' },
      ],
    },
    csf: {
      prompt: 'Hold the needle still and remove the stylet. Is there clear CSF?',
      short: 'CSF?',
      detail: `<p>In one study, CSF was in the hub after 13 of 15 transient paraesthesias: most happen when the tip is already in the subarachnoid space and touches a nerve root. So stop and look for CSF before you withdraw.${cite('ts-pong2009')}</p>`,
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
      body: `<p>Persistent paraesthesia suggests the needle is against or in a nerve. Withdraw, reassess, and re-site only if the patient is comfortable. In a large French survey, most nerve injuries after spinal followed paraesthesia during puncture or pain on injection.${cite('ts-auroy1997')}</p><p>Record the side and distribution. Examine the patient after the block wears off, and ask for a neurology opinion if there is a new deficit.</p>`,
    },
    xNoCsf: {
      outcome: 'Don’t inject; reassess before redirecting',
      tone: 'warn',
      body: `<p>Without CSF the tip may be beside a root in the epidural space or, if far lateral, near the foramen.${cite('ts-pong2009')} Withdraw a little, re-check the midline and the patient’s position, then redirect. Stop if the paraesthesia comes back.</p>`,
    },
    xOk: {
      outcome: 'Complete the injection and document',
      tone: 'ok',
      body: '<p>Write down the side, where it was felt, how long it lasted and what you did. Check the patient after the block has worn off.</p>',
    },
    xStop: {
      outcome: 'Stop injecting now',
      tone: 'danger',
      body: `<p>Pain or paraesthesia on injection is a warning of nerve injury.${cite('ts-auroy1997')} Stop, withdraw, and get senior help with the plan. Document, follow the patient up, and ask for a neurology opinion if a deficit appears.</p>`,
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
      detail: `<p>Withdraw far enough that the ligaments stop holding the old line. A slightly more cephalad angle is the commonest correction; if you were already angled steeply up, try slightly caudad.${cite('ts-nysora-failed')}</p>`,
      guide: 'mid-shallow',
      choices: [
        { label: 'Through to CSF', to: 'xOk' },
        { label: 'Bone again at the same depth', to: 'repeat' },
      ],
    },
    midDeep: {
      prompt: 'This is probably a lamina: the needle has drifted off the midline. Withdraw and aim back towards the midline.',
      short: 'Lamina',
      detail: `<p>Bone beyond the depth of the spinous processes suggests the needle is on a lamina and the path needs adjusting from side to side.${cite('ts-nysora-failed')} Check the back isn’t rotated, re-feel the midline and ask which side the patient feels the needle.</p>`,
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
      body: `<ul><li>Try a paramedian approach, or another interspace.</li><li>Use an ultrasound pre-scan to find the midline, the interspace and the depth.${cite('chin2011')}</li><li>Ask a senior colleague. Repeated passes add trauma and distress.</li></ul>`,
    },
  },
};

export const difficultBack = {
  id: 'ts-difficult-back',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'Before you start: can you feel the midline and the interspaces?',
      short: 'Landmarks?',
      choices: [
        { label: 'Yes, clearly', to: 'position' },
        { label: 'Poorly, or not at all', to: 'us' },
      ],
    },
    position: {
      prompt: 'Is the patient in the best position you can achieve?',
      short: 'Position',
      detail: '<p>Sitting usually makes the midline easier to find. Ask the patient to curl forward, and have an assistant keep the shoulders and hips square.</p>',
      choices: [
        { label: 'Yes', to: 'xGo' },
        { label: 'No: pain or stiffness limits it', to: 'us' },
      ],
    },
    us: {
      prompt: 'Is ultrasound available, and are you trained to use it for the spine?',
      short: 'Ultrasound?',
      choices: [
        { label: 'Yes', to: 'xUs' },
        { label: 'No', to: 'xSenior' },
      ],
    },
    xGo: {
      outcome: 'Go ahead, with a plan for when it doesn’t work',
      tone: 'ok',
      body: '<p>Decide in advance how many passes you will make before you change approach or call for help, and what the backup anaesthetic is.</p>',
    },
    xUs: {
      outcome: 'Pre-scan and mark the back',
      tone: 'ok',
      body: `<p>Mark the midline and the chosen interspace, and measure the depth. A pre-procedure scan improves success when the surface landmarks are difficult.${cite('chin2011', 'perlas2016')} See ${go('ultrasound', 'Ultrasound-assisted neuraxial')}.</p>`,
    },
    xSenior: {
      outcome: 'Ask for senior help before you start',
      tone: 'warn',
      body: '<p>A difficult back is a good reason to have an experienced colleague with you from the start, rather than after several failed passes. Agree the backup plan first.</p>',
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
        <li>If there’s no typical onset by about 15 minutes, the block is likely to be inadequate. Allow 20 minutes to be sure no block is coming.${cite('ts-nysora-failed')}</li>
      </ul>`,
      choices: [
        { label: 'The block is developing', to: 'xWait' },
        { label: 'Still inadequate at 20 minutes', to: 'pattern' },
      ],
    },
    pattern: {
      prompt: 'What pattern do you find?',
      short: 'Pattern',
      detail: `<p>Failure can mean no block, or a block of the wrong height, density, duration or side.${cite('fettes2009', 'ts-nysora-failed')}</p>`,
      choices: [
        { label: 'No block at all', to: 'none' },
        { label: 'Too low, or not dense enough', to: 'low' },
        { label: 'One side only', to: 'xUni' },
        { label: 'Patchy', to: 'xPatchy' },
        { label: 'Wearing off before surgery ends', to: 'xShort' },
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
        <li>Discuss the dose with a senior colleague. Never give a large repeat dose “blind”.</li>
      </ul>`,
      refs: ['ts-nysora-failed', 'fettes2009'],
    },
    xGa: {
      outcome: 'Convert to general anaesthesia',
      tone: 'warn',
      body: `<p>Tell the surgeon and the patient early, believe the patient’s pain, and don’t leave someone in distress. Afterwards, explain what happened, document it, and investigate if a drug fault is possible.${cite('fettes2009')}</p>`,
    },
    xTilt: {
      outcome: 'Use posture to spread the block',
      tone: 'ok',
      body: `<p>Tilt the patient head-down with the hips and knees flexed to flatten the lumbar lordosis, then re-test. Watch the blood pressure and stop the tilt once the block reaches the level you need.${cite('ts-nysora-failed')}</p>`,
    },
    xUni: {
      outcome: 'Turn the unblocked side down',
      tone: 'ok',
      body: `<p>With a hyperbaric solution, turning the patient onto the unblocked side can spread the block. A one-sided block may be enough for surgery on that side, but warn the surgeon. Repositioning is less likely to help with a plain solution.${cite('ts-nysora-failed')}</p>`,
    },
    xPatchy: {
      outcome: 'Supplement, repeat with caution, or convert',
      tone: 'warn',
      body: `<p>Options are IV analgesia and sedation, local infiltration by the surgeon, a cautious repeat (see the warnings above), or general anaesthesia.${cite('fettes2009', 'ts-nysora-failed')}</p>`,
    },
    xSupplement: {
      outcome: 'Supplement or convert',
      tone: 'warn',
      body: `<p>Changing posture rarely helps a plain solution. Supplement with IV analgesia or sedation, or local infiltration by the surgeon, or convert to general anaesthesia.${cite('fettes2009', 'ts-nysora-failed')}</p>`,
    },
    xShort: {
      outcome: 'Supplement or convert to GA',
      tone: 'warn',
      body: `<p>Use IV analgesia or sedation, local infiltration, or general anaesthesia. Agree the plan with the surgeon early.${cite('fettes2009', 'ts-nysora-failed')}</p>`,
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
      body: `<p>Doses as printed in the Association of Anaesthetists QRH 3-11 for this emergency (they differ slightly from the product-label doses in the hypotension tree):${cite('ts-qrh2023')}</p>
        ${QRH_CIRC_DOSES}
        <p>Once the airway is secure, keep the patient asleep: the block can leave them paralysed but aware. Consider other causes (local anaesthetic toxicity, embolism, haemorrhage, a vasovagal event). Support until the block wears off, in a suitable place.</p>`,
    },
    xArrest: {
      outcome: 'Cardiac arrest: start CPR now',
      tone: 'danger',
      body: '<p>Call the arrest team and follow the advanced life support algorithm. CPR may be needed just to circulate the drugs. Consider other causes, including local anaesthetic toxicity.</p>',
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
      detail: `<p>Hypotension is more likely with a higher block (at or above T5) and in older patients.${cite('ts-carpenter1992')} Also think about bleeding, surgical compression of the vena cava, anaphylaxis and embolism.</p>`,
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
      body: '<p>Set the blood pressure to cycle frequently until it is stable. Treat early rather than waiting for a big fall. Recheck the block height. Consider an infusion if repeated boluses are needed, and ask for help if they are.</p>',
    },
    xHigh: {
      outcome: 'Treat as a high spinal',
      tone: 'danger',
      body: `<p>Call for help and go to ${go('ts-high-spinal', 'High or total spinal')}.</p>`,
    },
    xAdrenaline: {
      outcome: 'Escalate to adrenaline; look for the cause',
      tone: 'danger',
      body: `<p>The Association of Anaesthetists QRH lists adrenaline ${D('10–100 µg')} IV (adult) for emergency use in hypotension and bradycardia.${cite('ts-qrh2023')} Escalate early if the heart rate falls suddenly: cardiac arrest under spinal is rare but more common than with other regional techniques.${cite('ts-auroy1997')} Go back through airway, breathing and circulation, and think about bleeding, a high block, anaphylaxis and embolism.</p>`,
    },
    xArrest: {
      outcome: 'Cardiac arrest: start CPR now',
      tone: 'danger',
      body: '<p>Call the arrest team and follow the advanced life support algorithm. Consider a high spinal and local anaesthetic toxicity among the causes.</p>',
    },
  },
};

export const nausea = {
  id: 'ts-nausea',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The patient feels sick or vomits after the spinal. Check the blood pressure and heart rate now. Is the blood pressure low?',
      short: 'Nausea',
      detail: `<p>Low blood pressure is the first thing to look for. In one large series, nausea was linked with hypotension and with a block at or above T5.${cite('ts-carpenter1992')}</p>`,
      choices: [
        { label: 'Yes, low', to: 'xBp' },
        { label: 'No, it’s normal', to: 'block' },
      ],
    },
    block: {
      prompt: 'Is the block high, or the heart rate slow?',
      short: 'Block / rate',
      choices: [
        { label: 'The block is high: breathless, weak hands', to: 'xHigh' },
        { label: 'The heart rate is slow', to: 'xVagal' },
        { label: 'Neither', to: 'other' },
      ],
    },
    other: {
      prompt: 'Any other obvious trigger?',
      short: 'Other causes',
      choices: [
        { label: 'Surgical traction on the bowel or peritoneum', to: 'xTraction' },
        { label: 'Opioids given, or no obvious cause', to: 'xAntiemetic' },
      ],
    },
    xBp: {
      outcome: 'Treat the blood pressure first',
      tone: 'warn',
      body: `<p>An antiemetic won’t fix nausea caused by low blood pressure. Treat it with ${go('ts-hypotension', 'Hypotension and bradycardia')}, then reassess.</p>`,
    },
    xHigh: {
      outcome: 'Treat as a high spinal',
      tone: 'danger',
      body: `<p>Call for help and go to ${go('ts-high-spinal', 'High or total spinal')}.</p>`,
    },
    xVagal: {
      outcome: 'Treat the slow heart rate',
      tone: 'warn',
      body: `<p>Atropine ${D('0.5 mg')} IV${cite('ts-smpc-atr')} or glycopyrronium ${D('200–400 µg')} IV.${cite('ts-smpc-gly')} Recheck the blood pressure.</p>`,
    },
    xTraction: {
      outcome: 'Ask the surgeon to ease off, and support',
      tone: 'ok',
      body: `<p>Tell the surgeon, give oxygen and reassurance, and give an antiemetic if it continues (ondansetron ${D('4 mg')} slow IV).${cite('ts-smpc-ond')}</p>`,
    },
    xAntiemetic: {
      outcome: 'Give an antiemetic',
      tone: 'ok',
      body: `<p>Ondansetron ${D('4 mg')} by slow IV injection is the label dose for established postoperative nausea and vomiting.${cite('ts-smpc-ond')} Other antiemetics are also used. Reassure, and keep checking the blood pressure.</p>`,
    },
  },
};

export const shivering = {
  id: 'ts-shivering',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The patient is shivering. Check temperature, SpO₂ and blood pressure. Is the patient cold?',
      short: 'Shivering',
      detail: `<p>Shivering is very common after neuraxial anaesthesia: a median of 55% in the control groups of 21 studies. It raises oxygen demand and makes monitoring harder.${cite('ts-crowley2008')}</p>`,
      choices: [
        { label: 'Yes, temperature is low', to: 'warm' },
        { label: 'No, temperature is normal', to: 'other' },
      ],
    },
    warm: {
      prompt: 'Warm the patient actively: forced-air warming, warmed IV fluids, cover exposed skin. Does the shivering settle?',
      short: 'Warm',
      choices: [
        { label: 'Yes', to: 'xOk' },
        { label: 'No, and it is distressing or straining the heart or lungs', to: 'xDrug' },
      ],
    },
    other: {
      prompt: 'Think of other causes: fever or sepsis, a transfusion reaction, anxiety. Warm and reassure anyway. Does it settle?',
      short: 'Other causes',
      choices: [
        { label: 'Yes', to: 'xOk' },
        { label: 'No, and it is distressing or straining the heart or lungs', to: 'xDrug' },
      ],
    },
    xOk: {
      outcome: 'Keep warming and monitoring',
      tone: 'ok',
      body: '<p>Continue active warming into recovery and recheck the temperature.</p>',
    },
    xDrug: {
      outcome: 'Consider drug treatment',
      tone: 'warn',
      body: `<p>Pethidine is the most studied drug for this; others are used too.${cite('ts-crowley2008')} It is an opioid, so watch sedation and breathing, and check for drug interactions before giving it. Keep warming.</p>`,
    },
  },
};

export const pruritus = {
  id: 'ts-pruritus',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The patient is itching after an intrathecal opioid. Is there a rash, wheeze, swelling or low blood pressure?',
      short: 'Itch',
      detail: '<p>Itch after intrathecal opioid is common and often affects the face, neck and upper chest. It comes from the opioid’s action in the spinal cord, not histamine release, which is why antihistamines mainly just sedate.</p>',
      choices: [
        { label: 'Yes', to: 'xAllergy' },
        { label: 'No, itch only', to: 'resp' },
      ],
    },
    resp: {
      prompt: 'It’s an opioid: check sedation and breathing. Is the patient drowsy, or breathing slowly?',
      short: 'Sedation?',
      choices: [
        { label: 'Yes', to: 'xResp' },
        { label: 'No, alert and breathing normally', to: 'severity' },
      ],
    },
    severity: {
      prompt: 'How much is it bothering the patient?',
      short: 'Severity',
      choices: [
        { label: 'Mild, tolerable', to: 'xReassure' },
        { label: 'Distressing', to: 'xNaloxone' },
      ],
    },
    xAllergy: {
      outcome: 'Think allergy or anaphylaxis',
      tone: 'danger',
      body: '<p>Call for help. Assess airway, breathing and circulation, and follow your anaphylaxis guideline if the signs fit.</p>',
    },
    xResp: {
      outcome: 'Treat as opioid-related respiratory depression',
      tone: 'danger',
      body: `<p>Stimulate the patient, give oxygen, support the airway and call for help. Naloxone: the product label gives ${D('100–200 µg')} IV, titrated in ${D('100 µg')} steps every 2 minutes. It may need repeating, or an infusion, because morphine outlasts it.${cite('ts-smpc-nal')} See ${go('tq-adjuncts', 'Intrathecal opioid monitoring')}.</p>`,
    },
    xReassure: {
      outcome: 'Reassure and observe',
      tone: 'ok',
      body: '<p>It usually settles as the opioid wears off. Keep monitoring sedation and breathing.</p>',
    },
    xNaloxone: {
      outcome: 'Low-dose naloxone',
      tone: 'warn',
      body: '<p>Small, titrated doses of naloxone can relieve the itch but may also reduce the pain relief, so start low. Keep monitoring sedation and breathing.</p>',
    },
  },
};

export const retention = {
  id: 'ts-retention',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'The patient hasn’t passed urine since the spinal. Are they uncomfortable, or has it been an unusually long time?',
      short: 'No urine',
      detail: `<p>Retention after surgery is common: reported rates range from 5% to 70%, depending on how it is defined and who is studied.${cite('ts-baldini2009')}</p>`,
      choices: [
        { label: 'Yes', to: 'scan' },
        { label: 'No: comfortable, and the block is still wearing off', to: 'xWait' },
      ],
    },
    scan: {
      prompt: 'Scan the bladder. What is the volume?',
      short: 'Bladder scan',
      detail: `<p>A bladder ultrasound scan measures the volume accurately and guides what to do.${cite('ts-baldini2009')}</p>`,
      choices: [
        { label: 'A large volume, or the patient is distressed', to: 'xCath' },
        { label: 'A small volume, and the patient is comfortable', to: 'low' },
      ],
    },
    low: {
      prompt: 'Small bladder volume and no urine. Is the patient making enough urine?',
      short: 'Low volume',
      choices: [
        { label: 'Maybe not: low fluid intake, low blood pressure, bleeding', to: 'xOutput' },
        { label: 'Yes, probably fine', to: 'xWait' },
      ],
    },
    xWait: {
      outcome: 'Encourage voiding and reassess',
      tone: 'ok',
      body: '<p>Help the patient to a normal position to void, keep track of fluids, and re-scan if they still haven’t passed urine after a suitable interval.</p>',
    },
    xCath: {
      outcome: 'Catheterise',
      tone: 'warn',
      body: `<p>Don’t let the bladder overdistend: it can damage the detrusor and lead to infection and catheter problems.${cite('ts-baldini2009')} Use an in–out or indwelling catheter.</p>`,
    },
    xOutput: {
      outcome: 'Assess for low urine output',
      tone: 'warn',
      body: '<p>Check the blood pressure, fluid balance and bleeding. Treat the cause and tell the team.</p>',
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
      body: `<p>Older age and a higher block both raise the risk of hypotension.${cite('ts-carpenter1992')} Check the block height, look for blood loss, and keep the surgeon informed. See ${go('ts-hypotension', 'Hypotension and bradycardia')}.</p>`,
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
        { label: 'Withdraw fully and redirect to the left', to: 'n2', note: `<p>Some people teach this, but a study found CSF in the hub after most brief paraesthesias, so you may already be in the right place.${cite('ts-pong2009')} Look first.</p>` },
        { label: 'Hold still, remove the stylet and look for CSF', to: 'n2', note: '<p>Good. A brief paraesthesia often means the tip is in the subarachnoid space touching a root.</p>' },
        { label: 'Inject quickly before he moves', to: 'n2', note: '<p>No. Never inject without confirming free-flowing CSF, and never through ongoing paraesthesia.</p>' },
      ],
    },
    n2: {
      prompt: 'Clear CSF flows. You start injecting slowly and he says, “It’s burning down my right leg again.” What now?',
      short: 'Pain on injection',
      choices: [
        { label: 'Stop injecting and withdraw', to: 'xStop', note: '<p>Correct. Pain on injection is a warning of nerve injury.</p>' },
        { label: 'Carry on slowly; it’ll pass', to: 'xStop', note: `<p>No. Most nerve injuries after spinal in a large French survey followed paraesthesia during puncture or pain on injection.${cite('ts-auroy1997')}</p>` },
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
        { label: 'Give a second spinal now', to: 'n2', note: `<p>Risky. There is a working block, so a second dose could spread unpredictably and give a high or total spinal.${cite('ts-nysora-failed')}</p>` },
        { label: 'Turn her right side down, wait and re-test', to: 'n2', note: `<p>Good. With a hyperbaric solution, turning the unblocked side down can spread the block.${cite('ts-nysora-failed')}</p>` },
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
