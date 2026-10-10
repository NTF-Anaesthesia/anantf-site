// Patient-type walkthroughs for Difficult backs.
// Each panel: tier 1 plan (steps and a stop box), tier 2 detail in one collapsed block, tier 3 pearls.
// No doses here. No citations in this section.
import { el, callout, steps, tier, figure, details } from '../ui.js?v=1';
import { scoliosisSvg } from './figures.js?v=1';

const T = tier;
const UL = (items) => el('ul', { class: 'sx-list' }, ...items.map((h) => el('li', { html: h })));
const P = (html, cls) => el('p', { html, class: cls });
// A tagged group: small heading and a list.
const G = (n, title, items) => T(el('div', { class: 'sx-grp' }, el('p', { class: 'sx-sub', text: title }), UL(items)), n);
const PEARL = (title, html) => T(callout('key', { title: `Advanced pearl: ${title}`, body: `<p>${html}</p>` }), 3);
const STOP = (items) => T(callout('warn', { title: 'Stop and get help', body: UL(items) }), 1);
// Tier-2 depth goes into one collapsed block per panel so the plan stays short.
const MORE = (summary, ...nodes) => T(details({ summary, body: nodes }), 2);
const SUMMARY = (list) => T(steps(list.map(([title, body]) => ({ title, body: body ? `<p>${body}</p>` : null }))), 1);

function panel(id, title, ...children) {
  return el('div', { class: 'sx-panel', id, 'aria-labelledby': `${id}-h` },
    el('h4', { class: 'sx-panel-h', id: `${id}-h`, text: title }), ...children);
}

// ------------------------------------------------------------------ (a) elderly or calcified spine
function elderly() {
  return panel('sx-elderly', 'The elderly or calcified spine',
    T(P('With age the ligaments thicken and calcify, the discs narrow, the spinous processes sit close together and the spine stiffens. The midline gap can be closed. A <a href="#sx-paramedian">paramedian approach</a> often avoids the worst of it.'), 1),
    SUMMARY([
      ['Look and plan', 'Look at the back. Ask about back surgery and pain. Check any spine imaging. Tell your supervisor before you start.'],
      ['Give analgesia first', 'A patient in pain cannot hold still or curl up. Treat the pain before you position. For a hip fracture, ask about a nerve block for the fracture pain.'],
      ['Position with care', 'Sitting is best if they can manage it. If not, lie them on their side with the spine level. Support the head, chest and shoulders with pillows so the spine does not sag or twist. <a href="#sx-position">Cannot position?</a>'],
      ['Try the midline once, then go paramedian', 'If the midline feels solid, change to the <a href="#sx-paramedian">paramedian approach</a>. If that fails, try <a href="#sx-taylor">L5–S1 (Taylor)</a>.'],
      ['Be ready for low blood pressure', 'Use the lowest dose that works: the typical dose or less. Inject slowly. Have a vasopressor drawn up and check blood pressure often.'],
      ['Know your limit', 'If bone, bleeding or pain stops you, stop and change the plan.'],
    ]),
    STOP([
      'Pain or tingling in a leg when the needle goes in or when you inject. Do not inject.',
      'Blood that keeps coming back through the needle.',
      'Bone at every attempt, or the patient cannot stay in position.',
    ]),
    MORE('Why it is hard, dose and blood pressure',
      G(2, 'Why it is hard', [
        'The supraspinous and interspinous ligaments and the ligamentum flavum are thick and can be calcified. The needle feels gritty or hard.',
        'Osteophytes, narrow discs and overlapping spinous processes shrink the target.',
        'A kyphotic or stooped patient may not be able to flex further. The interlaminar gaps stay narrow.',
        'Rigid ligaments also make the needle bend. A fine needle can drift off the line you chose.',
      ]),
      G(2, 'Dose and blood pressure', [
        'Older patients usually need less local anaesthetic, and the block can spread higher and last longer. Use the typical dose or less, and do not raise the dose to make up for a poor block.',
        'Cardiac reserve is lower. Hypotension is more likely and less well tolerated. Treat early. Aortic stenosis and similar problems are in the <a href="#ch-technique">Technique chapter</a>.',
        'Avoid large fluid loads as the only treatment for hypotension.',
      ]),
      G(2, 'Scan before you persevere', [
        'Pre-procedure ultrasound reduces needle passes in difficult backs. See <a href="#us-evidence">the evidence</a>.',
        'Think of other plans early: general anaesthesia, or a nerve block that covers the surgery.',
      ]),
    ),
    PEARL('keep the needle straight', 'A needle that has bent will not go where you aim it. Hold a fine needle close to its hub and support it with the introducer, and advance in small steps. If you meet firm resistance and the needle feels springy, withdraw it. Check the shaft and use a new needle rather than steering from deep.'),
    PEARL('a soft feel in a paramedian pass', 'In a paramedian pass you meet less ligament, so the "give" into the canal can be subtle. Advance slowly and check the stylet often. In a calcified spine the feel may be gritty right up to the flavum.'),
    PEARL('if the first paramedian pass meets only bone', 'Stay inside the canonical range (<a href="#sx-paramedian">0.5–1 cm lateral, 5–15° medial</a>): try the other end of it, or the other side, and scan to check the new line. Do not repeat the same pass, and do not go beyond the range without a scan.'),
  );
}

// ------------------------------------------------------------------ (b) scoliotic spine
function scoliosis() {
  const f = figure({
    id: 'sx-scoliosis-fig', num: '5.1', title: 'A rotated vertebra: midline needle or convex-side needle?', plate: 'paper', aspect: '16/10',
    caption: 'Schematic axial view, seen from below, with the back at the top. The red needle runs straight down the line of the spinous tips. The brown needle enters on the convex side.'
      + ' <span class="sx-key"><b>1</b> Spinous process, turned to the concave side · <b>2</b> Vertebral body, turned to the convex side · <b>3</b> Spinal canal · <b>4</b> Open interlaminar gap on the convex side · <b>5</b> Lamina on the concave side</span>',
  });
  f.stage.append(scoliosisSvg());
  return panel('sx-scoliosis', 'The scoliotic spine',
    T(P('In scoliosis the spine curves to one side and the vertebrae are twisted. The spinous processes you feel do not mark the middle of the canal. A needle aimed at them can miss.'), 1),
    T(callout('key', {
      title: 'The rule for scoliosis (said once, used everywhere on this page)',
      body: '<p>Rotation turns the <strong>spinous processes towards the concave side</strong> and the <strong>canal towards the convex side</strong>. So the interlaminar space is <strong>generally more open on the convex side</strong>. Use ultrasound to find the most open window, and let the scan choose the side and the angle.</p>',
    }), 1),
    SUMMARY([
      ['Ask and look', 'Ask about the curve, past surgery and rods. Look at the back and at any X-ray. Tell your supervisor first.'],
      ['Find the curve in the lumbar region', 'A thoracic curve to one side is often balanced by a lumbar curve to the other. Note which way the lumbar curve bends.'],
      ['Scan if you can', 'Mark the middle of the canal, not the spinous process. Mark the skin point, the depth and the angle with the patient in the final position. See <a href="#us-scol">scanning the scoliotic spine</a>.'],
      ['Enter on the convex side', 'Use a paraspinous or <a href="#sx-paramedian">paramedian</a> entry on the convex side, lateral to the spinous process. Less medial angle than usual is often needed. Take the final angle from the scan.'],
      ['Stop at your limit', 'If a rod or fusion covers the space, go to another level or change the plan.'],
    ]),
    f.fig,
    STOP([
      'Metal, rods or a long scar over the level you chose.',
      'Bone at every attempt even after you moved to the convex side.',
      'Pain or tingling in a leg. Do not inject.',
    ]),
    MORE('How the spine is twisted, block spread and associated disease',
      G(2, 'How the spine is twisted', [
        'A curve is measured on a standing X-ray by the Cobb angle: the angle between the most tilted vertebra at the top of the curve and the most tilted at the bottom. Larger curves usually mean more twisting.',
        'The twist is greatest at the apex of the curve and smaller towards its ends.',
        'The concave side is crowded: the laminae lie close together. The convex side opens up, and the interlaminar gaps are usually easier to find there.',
      ]),
      G(2, 'Technique', [
        'Scan at each level in the transverse view. Compare the spinous process shadow with the centre of the canal. Mark the centre of the canal, the depth, and the angle.',
        'Mark with the patient sitting or lying as they will be for the block, and do not let them shift between the scan and the puncture.',
        'After a fusion with rods, the levels above or below are usually the only ones available. See <a href="#sx-surgery">previous surgery</a>.',
      ]),
      G(2, 'Block spread and associated disease', [
        'Distorted anatomy makes the spread less predictable. Inject slowly, test the block on both sides, and be ready to change the plan.',
        'Severe curves can come with restrictive lung disease and pulmonary hypertension, and some are part of a neuromuscular disease. Check the chest, the heart and the history before you choose a spinal.',
        'Idiopathic curves of adolescence and degenerative curves of older adults behave differently: the degenerative curve is usually stiff, with osteophytes and calcified ligaments, so the elderly plan applies too.',
      ]),
    ),
    PEARL('the evidence on side is limited', 'The convex-side rule comes from the geometry of rotation and from case series, not from large trials. The most open window can lie on the other side at another level, or after a fusion. If the scan disagrees with the rule, follow the scan.'),
    PEARL('choose the least twisted level', 'Rotation is largest at the apex of the curve. Spinal levels towards the ends of the curve are usually less distorted, so scan those first rather than the level the surgeon is operating near.'),
    PEARL('do not trust a skin line', 'A line drawn from the spinous tips looks straight on the skin but runs oblique to the canal. Rely on a depth and angle that you measured on the scan, not on the skin marks alone.'),
    PEARL('the curve changes with position', 'A curve measured standing can look different sitting or lying, and rotation changes with the position. A scan in the final position is worth more than an old film.'),
  );
}

// ------------------------------------------------------------------ (c) obesity
function obesity() {
  return panel('sx-obesity', 'The patient with obesity',
    T(P('The problem is fat between the skin and the spine. The spinous processes are hard to feel, the midline drifts, and the canal is deeper than usual.'), 1),
    SUMMARY([
      ['Sit them up', 'Sitting makes the midline easiest to find. Put their feet on a stool and have them lean forward on a pillow or table. Ask a helper to steady them.'],
      ['Scan for the midline and the depth', 'If you have been taught, use <a href="#us-six">ultrasound</a> to mark the midline, the level and the depth. Press lightly or the depth will be too short.'],
      ['Use an introducer', 'It steadies the needle through thick tissue.'],
      ['Choose the needle by the measured depth', 'A standard spinal needle is about 90 mm. If the canal is deeper than that, use a longer pencil-point needle, supported by the introducer. Keep a stiffer cutting needle as a fallback if the long one bends, and tell the patient it carries a higher headache risk.'],
      ['Watch the airway and the level', 'The block can spread higher than expected. Sit them up after the injection if the surgery allows and check the level often.'],
    ]),
    STOP([
      'The needle is in to its full length and there is still no CSF. Do not push on. Withdraw and scan.',
      'Bone at a depth quite different from the scan.',
      'Breathing difficulty or a rising block. Call for help and support the airway.',
    ]),
    MORE('Position, needle, depth and physiology',
      G(2, 'Position and landmarks', [
        'In the lateral position the spine tends to sag and rotate, and the midline drifts. If you must use it, support the back so that it lies level.',
        'Landmarks such as the line between the iliac crests are less reliable. Feel for the sacrum and count up, or scan.',
        'Fat folds and the abdominal apron move between sitting and lying. Mark and puncture in the same position.',
      ]),
      G(2, 'Needle and depth', [
        'Depth to the canal is usually greater, and in some patients it is more than a standard needle can reach. Measure it on the scan instead of guessing.',
        'The rule is the same as everywhere on this page: pencil-point first, because cutting needles raise the headache risk. Use a stiffer cutting needle only when the pencil-point needle will not go straight.',
        'The longer and thinner the needle, the more it bends.',
      ]),
      G(2, 'Physiology', [
        'Increased abdominal pressure and engorged epidural veins reduce the volume of the canal, so a given dose can spread higher. Be careful with the dose and check the level.',
        'Reduced functional residual capacity and a high block together raise the risk of breathing problems. Keep monitoring continuous and have a plan for the airway.',
        'Hypotension is treated as usual. Check the blood pressure cuff size.',
      ]),
    ),
    PEARL('count up from the sacrum', 'When the midline cannot be found by feel, find the sacrum on the scan and count up the levels in the paramedian sagittal view. The sacrum is easy to see even through a lot of tissue.'),
    PEARL('keep the shaft short outside the skin', 'A long fine needle bends where it is unsupported. Hold the needle near the skin, use the introducer as a splint and advance in small steps. If the needle bends, replace it.'),
    PEARL('hold the skin taut', 'Skin and fat shift when the needle goes in, and the midline can slide sideways. Ask a helper to hold the skin taut or mark the midline with the patient in the final position.'),
  );
}

// ------------------------------------------------------------------ (d) kyphosis and ankylosing spondylitis
function as() {
  return panel('sx-as', 'Kyphosis and ankylosing spondylitis',
    T(P('In a fixed kyphosis the spine cannot flex further, so the interlaminar gaps stay narrow. In advanced ankylosing spondylitis (AS) the ligaments turn to bone and the vertebrae fuse, and there may be no gap between the laminae at all.'), 1),
    SUMMARY([
      ['Tell your supervisor before you start', 'AS is a job for an experienced operator. Look at the imaging and ask how far the disease has gone.'],
      ['Check the neck and airway', 'A stiff or fused neck changes your airway plan. Think about this before the spinal, because you may need to change to a general anaesthetic.'],
      ['Position gently', 'A fused spine does not bend further. Do not force it. Sit the patient if they can, with support.'],
      ['Use a paramedian approach or L5–S1', 'These are the routes most often used when the midline is closed: <a href="#sx-paramedian">paramedian</a> or <a href="#sx-taylor">Taylor</a>. Map them with ultrasound if you can.'],
      ['Limit the attempts', 'Repeated attempts raise the risk of a bleed. Have a low threshold for another technique.'],
    ]),
    STOP([
      'A fused spine and no gap on the scan or on imaging. Change the plan.',
      'Bone at every pass.',
      'Pain or tingling in a leg. Do not inject.',
    ]),
    MORE('What is different, bleeding risk and alternatives',
      G(2, 'What is different', [
        'The supraspinous and interspinous ligaments and the ligamentum flavum can ossify and the facet joints can fuse. This gives the "bamboo spine" on X-ray; the ossified midline ligaments give the "dagger sign".',
        'The lowest lumbar spaces and L5–S1 are the ones most likely to stay open.',
        'The spine is osteoporotic and brittle and can fracture with a small force. Position gently.',
        'Many of these patients take anti-inflammatory drugs. Check what they take and when they last took it.',
      ]),
      G(2, 'Other problems in AS', [
        'Restricted chest wall movement, so less respiratory reserve if the block rises. Possible aortic regurgitation and cardiac conduction defects, so check the ECG and the heart.',
        'A fixed flexed neck may need an awake or video-assisted airway plan if you have to convert.',
      ]),
      G(2, 'Kyphosis alone', [
        'In thoracolumbar kyphosis the lumbar lordosis is lost. Sitting is usually easier than lying on the side, where the spine may twist.',
        'Hyperbaric solution runs to the lowest point of the spine. An exaggerated thoracic kyphosis can carry the block higher than expected, so inject slowly and check the level.',
      ]),
      G(2, 'Bleeding risk', [
        'Repeated attempts and a difficult approach are well-recognised risk factors for a spinal haematoma. Combine this with any anticoagulant or antiplatelet drug and the risk is higher.',
        'Check the <a href="#tq-anticoag">anticoagulant timings</a>, and tell the ward which neurological checks to do afterwards.',
      ]),
      G(2, 'Alternatives to think of early', [
        'General anaesthesia, with a careful airway plan.',
        'Peripheral nerve blocks that cover the surgery, with or without sedation.',
        'The time to discuss this with the surgeons and the patient is before you start.',
      ]),
    ),
    PEARL('look for a window first', 'Review the CT or MRI before you try. If the imaging shows the interlaminar spaces bridged by bone at every lumbar level, a window may not exist and a needle will not find one. A single open space at L5–S1 on the scan can be the route.'),
    PEARL('a stooped patient prefers to sit', 'A spine fixed in flexion may be easier to approach sitting. Lying on the side can twist a rigid spine and push the vertebrae away from the line you expect.'),
    PEARL('let the scan choose the side', 'Fusion is often uneven. Scan both paramedian windows at the chosen level and pick the side with the clearer gap, rather than the side that is more comfortable for you.'),
  );
}

// ------------------------------------------------------------------ (e) previous spinal surgery
function surgery() {
  return panel('sx-surgery', 'Previous spinal surgery or instrumentation',
    T(P('Scar, missing bone and metalwork change what the needle meets. The spread of local anaesthetic can also be less predictable.'), 1),
    SUMMARY([
      ['Find out what was done', 'Ask which operation, which levels, and whether there are rods or screws. Look for the scar. Look at the imaging or the operation note.'],
      ['Record the baseline', 'Write down any weakness, numbness or bladder or bowel symptoms before you start.'],
      ['Choose a level above or below', 'Stay away from the operated levels and the scar. Pick a level with no metalwork if you can.'],
      ['Scan first if you can', 'Check that the level is open and measure the depth and angle.'],
      ['Inject slowly and test the block', 'The spread can be patchy or higher than expected. Check both sides.'],
    ]),
    STOP([
      'Metal or a large bony defect at the level you picked.',
      'Pain or tingling in a leg. Do not inject.',
      'A block that does not come as expected after a reasonable wait. Do not add more drug without discussing it.',
    ]),
    MORE('Why it is different, approach and block behaviour',
      G(2, 'Why it is different', [
        'After a laminectomy the bone and the ligamentum flavum are missing. The needle may meet no resistance and there is little warning before the dura.',
        'Scar in the epidural space can tether the dura and make the spread patchy.',
        'After a fusion the lamina can be bridged by bone, and rods and screws block the way in. The levels above and below carry more load and are often stiff.',
        'A single-shot spinal needs only a small window. Most of the concern about scar is for epidural catheters, where the spread of the drug in the epidural space matters more.',
      ]),
      G(2, 'Approach', [
        'Pick a level above or below the surgery, away from the scar.',
        'Scan to look for the defect, the depth of the posterior complex and the best angle. Check the operation note for the levels.',
        'Compare any new weakness with the baseline you recorded. If you did not record it, a new deficit can be blamed on the spinal.',
      ]),
      G(2, 'Block behaviour', [
        'Spread can be uneven or higher than expected. Test both sides and go slowly.',
        'Do not make up for a poor block by injecting more. A second dose into an unpredictable space can end up very high.',
      ]),
    ),
    PEARL('a laminectomy has no flavum', 'At a laminectomy level the needle can pass through scar with no clear sense of the flavum, and the dura may be adherent to the scar. Avoid the level, and if you cannot, scan to see the defect.'),
    PEARL('read the operation note', 'Imaging tells you where the metal is. The operation note tells you what was removed. Together they show the levels with no bone, no scar and no hardware, which is where the needle should go.'),
    PEARL('the segment next to a fusion', 'The level just above or below a fusion is often still open, but the scar, the bone graft and the hardware can distort the path. Scan before you commit.'),
    PEARL('low conus and tethering', 'A sacral dimple, a hair tuft or a previous spina bifida repair suggests spina bifida occulta or a tethered cord. The conus can lie lower than usual, so look at the imaging and avoid the usual levels.'),
  );
}

// ------------------------------------------------------------------ (f) cannot position
function position() {
  return panel('sx-position', 'The patient who cannot position',
    T(P('Pain, confusion, tremor, a fracture or a bed that cannot move all stop the patient flexing and keeping still. A moving patient is the commonest reason for a failed attempt and for a needle injury.'), 1),
    SUMMARY([
      ['Treat the cause first', 'Give analgesia before moving a patient with a fracture. A nerve block for the fracture often makes positioning possible. Wait for it to work.'],
      ['Choose sitting or lateral', 'Sitting is easiest to control if they can sit. If not, lie them on their side with pillows so the back is parallel to the edge of the bed and the hips and shoulders are square.'],
      ['Use a helper', 'One person in front supports the shoulders and head and keeps the patient calm. Talk through each step.'],
      ['Mark and puncture in the same position', 'Landmarks and scan marks are only valid for that position.'],
      ['Stop if they keep moving', 'Do not advance a needle in a patient who cannot hold still. Change the plan.'],
    ]),
    STOP([
      'The patient moves during the needle pass. Withdraw the needle first, then settle them.',
      'Sedation is needed just to make them keep still. Think about general anaesthesia instead.',
      'Pain or tingling in a leg. Do not inject.',
    ]),
    MORE('Options and cautions',
      G(2, 'Options', [
        'A fractured limb is usually kept uppermost in the lateral position. A leg that cannot be moved is not a reason to avoid the lateral position, but move it with the block first.',
        'A confused or demented patient may not cooperate. Reassurance and a helper work better than sedation. Sedation can make them move more, and it hides warning pain.',
        'If the patient is very short of breath lying down, sitting is the only choice.',
      ]),
      G(2, 'Cautions', [
        'Do not flex a patient with an unstable spinal injury. General anaesthesia or a peripheral block is the plan.',
        'A hyperbaric solution runs to the lowest point, so the lateral position affects the side and height of the block. See the <a href="#ch-technique">Technique chapter</a>.',
      ]),
    ),
    PEARL('a hypobaric solution suits some positions', 'When the patient has to stay in a fixed position, such as lateral with the operative side up or prone jack-knife, the baricity of the drug can be chosen to suit that position, because a hypobaric solution rises to the highest point. This is a consultant decision.'),
  );
}

export function buildPanels() {
  return [
    { value: 'sx-elderly', label: 'Elderly or calcified', node: elderly() },
    { value: 'sx-scoliosis', label: 'Scoliosis', node: scoliosis() },
    { value: 'sx-obesity', label: 'Obesity', node: obesity() },
    { value: 'sx-as', label: 'Kyphosis or AS', node: as() },
    { value: 'sx-surgery', label: 'Previous surgery', node: surgery() },
    { value: 'sx-position', label: 'Cannot position', node: position() },
  ];
}
