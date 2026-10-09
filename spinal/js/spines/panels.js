// Patient-type walkthroughs for 03 Challenging spines.
// Each panel: tier 1 summary steps and a "stop" box, tier 2 detail, tier 3 pearls.
// No new doses here. No citations in this section.
import { el, callout, steps, tier, figure } from '../ui.js?v=1';
import { scoliosisSvg } from './figures.js?v=1';

const T = tier;
const UL = (items) => el('ul', { class: 'sx-list' }, ...items.map((h) => el('li', { html: h })));
const P = (html, cls) => el('p', { html, class: cls });
// A tagged group: small heading and a list.
const G = (n, title, items) => T(el('div', { class: 'sx-grp' }, el('p', { class: 'sx-sub', text: title }), UL(items)), n);
const PEARL = (title, html) => T(callout('key', { title: `Advanced pearl: ${title}`, body: `<p>${html}</p>` }), 3);
const STOP = (items) => T(callout('warn', { title: 'Stop and get help', body: UL(items) }), 1);
const SUMMARY = (list) => T(steps(list.map(([title, body]) => ({ title, body: body ? `<p>${body}</p>` : null }))), 1);

function panel(id, title, ...children) {
  return el('div', { class: 'sx-panel', id, 'aria-labelledby': `${id}-h` },
    el('h4', { class: 'sx-panel-h', id: `${id}-h`, text: title }), ...children);
}

// ------------------------------------------------------------------ (a) elderly or calcified spine
function elderly() {
  return panel('sx-elderly', 'The elderly or calcified spine',
    T(P('With age the ligaments thicken and calcify, the discs narrow, the spinous processes sit close together and the spine stiffens. The midline gap can be closed. A paramedian approach often avoids the worst of it.'), 1),
    SUMMARY([
      ['Look and plan', 'Look at the back. Ask about back surgery and pain. Check any spine imaging. Tell your supervisor before you start.'],
      ['Give analgesia first', 'A patient in pain cannot hold still or curl up. Treat the pain before you position. For a hip fracture, ask about a nerve block for pain.'],
      ['Position with care', 'Sitting is best if they can manage it. If not, lie them on their side with the spine level. Support the head, chest and shoulders with pillows so the spine does not sag or twist.'],
      ['Try the midline once, then go paramedian', 'If the midline feels solid, change to the paramedian approach. See the figure below.'],
      ['Be ready for low blood pressure', 'Use the lowest dose that works from the label range. Inject slowly. Have a vasopressor drawn up and check blood pressure often.'],
      ['Know your limit', 'If bone, bleeding or pain stops you, stop and change the plan.'],
    ]),
    STOP([
      'Pain or tingling in a leg when the needle goes in or when you inject. Do not inject.',
      'Blood that keeps coming back through the needle.',
      'Bone at every attempt, or the patient cannot stay in position.',
    ]),
    G(2, 'Why it is hard', [
      'The supraspinous and interspinous ligaments and the ligamentum flavum are thick and can be calcified. The needle feels gritty or hard.',
      'Osteophytes, narrow discs and overlapping spinous processes shrink the target.',
      'A kyphotic or stooped patient may not be able to flex further. The interlaminar gaps stay narrow.',
      'Rigid ligaments also make the needle bend. A fine needle can drift off the line you chose.',
    ]),
    G(2, 'Position and approach', [
      'Sitting opens the gaps in flexion and keeps the midline easy to find. Use a stool for the feet and a pillow to hug.',
      'In the lateral position, keep the back parallel to the edge of the bed, with the hips and shoulders square. For a hip fracture the fractured side is usually up.',
      'The paramedian approach goes lateral to the supraspinous and interspinous ligaments. Only the ligamentum flavum is crossed. Steps are in the paramedian section below.',
      'L5–S1 (Taylor) is the usual fallback. Its gap is often the widest in the lumbar spine.',
    ]),
    G(2, 'Dose and blood pressure', [
      'Older patients usually need less local anaesthetic and the block can spread higher and last longer. Use the lower end of the label range, or less, and do not raise the dose to make up for a poor block.',
      'Cardiac reserve is lower. Hypotension is more likely and less well tolerated. Treat early. Aortic stenosis and similar problems are covered in the Populations section.',
      'Avoid large fluid loads as the only treatment for hypotension.',
    ]),
    G(2, 'When to stop', [
      'Agree your limit with your supervisor first. A few attempts at one level, then change something: the position, the approach, the level or the operator.',
      'Use ultrasound to map the spine if you have been taught. Pre-procedure scanning has been shown to reduce needle passes in difficult backs.',
      'Think of other plans early: general anaesthesia, or a nerve block that covers the surgery.',
    ]),
    PEARL('keep the needle straight', 'A needle that has bent will not go where you aim it. Hold a fine needle close to its hub and support it with the introducer, and advance in small steps. If you meet firm resistance and the needle feels springy, withdraw it. Check the shaft and use a new needle rather than steering from deep.'),
    PEARL('a soft feel in a paramedian pass', 'In a paramedian pass you meet less ligament, so the "give" into the canal can be subtle. Advance slowly and check the stylet often. In a calcified spine the feel may be gritty right up to the flavum.'),
    PEARL('wider and steeper', 'If the spine is calcified and the first paramedian pass meets only bone, many operators go a little further lateral, towards the top of the 1 cm range, and use a steeper medial angle. Scan to check the new line before you try. Avoid repeating the same pass.'),
  );
}

// ------------------------------------------------------------------ (b) scoliotic spine
function scoliosis() {
  const f = figure({
    id: 'sx-scoliosis-fig', num: '3.1', title: 'A rotated vertebra: midline needle or convex-side needle?', plate: 'paper', aspect: '16/10',
    caption: 'Schematic axial view, seen from below, with the back at the top. The red needle runs straight down the line of the spinous tips. The brown needle enters on the convex side.'
      + ' <span class="sx-key"><b>1</b> Spinous process, turned to the concave side · <b>2</b> Vertebral body, turned to the convex side · <b>3</b> Spinal canal · <b>4</b> Open interlaminar gap on the convex side · <b>5</b> Lamina on the concave side</span>',
  });
  f.stage.append(scoliosisSvg());
  return panel('sx-scoliosis', 'The scoliotic spine',
    T(P('In scoliosis the spine curves to one side and the vertebrae are twisted. The spinous processes you feel do not mark the middle of the canal. A needle aimed at them can miss.'), 1),
    SUMMARY([
      ['Ask and look', 'Ask about the curve, past surgery and rods. Look at the back and at any X-ray. Tell your supervisor first.'],
      ['Find the curve in the lumbar region', 'A thoracic curve to one side is often balanced by a lumbar curve to the other. Note which way the lumbar curve bends.'],
      ['Remember the twist', 'The spinous processes turn towards the inside of the curve (concave). The vertebral bodies and the canal turn towards the outside (convex).'],
      ['Scan if you can', 'Mark the middle of the canal, not the spinous process. Mark the skin point and the angle with the patient in the final position.'],
      ['Enter from the convex side', 'Use a paraspinous entry on the convex side, aimed almost straight forwards with little or no medial angle.'],
      ['Stop at your limit', 'If a rod or fusion covers the space, go to another level or change the plan.'],
    ]),
    f.fig,
    STOP([
      'Metal, rods or a long scar over the level you chose.',
      'Bone at every attempt even after you moved to the convex side.',
      'Pain or tingling in a leg. Do not inject.',
    ]),
    G(2, 'How the spine is twisted', [
      'A curve is measured on a standing X-ray by the Cobb angle: the angle between the most tilted vertebra at the top of the curve and the most tilted at the bottom. Larger curves usually mean more twisting.',
      'The twist is greatest at the apex of the curve and smaller towards its ends.',
      'The spinous process swings to the concavity and the body to the convexity. The canal is therefore off to the convex side of the line of spinous tips.',
      'The concave side is crowded and the convex side opens up. The interlaminar gaps are usually easier to find on the convex side.',
    ]),
    G(2, 'Technique', [
      'Enter on the convex side, lateral to the palpated spinous process, by a paraspinous or paramedian route. The canal lies in that direction, so little or no medial angle is needed. Confirm the angle on the scan.',
      'Ultrasound mapping: scan at each level in the transverse view. Look for the spinous process shadow and compare it with the centre of the canal. Mark the centre of the canal, the depth, and the angle.',
      'Position matters. Mark with the patient sitting or lying as they will be for the block, and do not let them shift between the scan and the puncture.',
      'After a fusion with rods, the levels above or below are usually the only ones available. See the previous surgery tab.',
    ]),
    G(2, 'Block spread', [
      'Distorted anatomy makes the spread less predictable. Inject slowly, test the block on both sides, and be ready to change the plan.',
      'Severe curves can come with lung and heart problems. Check the chest and the history before you choose a spinal.',
    ]),
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
      ['Scan for the midline and the depth', 'If you have been taught, use ultrasound to mark the midline, the level and the depth. Press lightly or the depth will be too short.'],
      ['Use an introducer', 'It steadies the needle through thick tissue.'],
      ['Have a longer needle ready', 'A standard spinal needle is about 90 mm. If the canal is deeper than that, use a longer needle. A 22G Quincke is firmer because long fine needles bend.'],
      ['Watch the airway and the level', 'The block can spread higher than expected. Sit them up after the injection if the surgery allows and check the level often.'],
    ]),
    STOP([
      'The needle is in to its full length and there is still no CSF. Do not push on. Withdraw and scan.',
      'Bone at a depth quite different from the scan.',
      'Breathing difficulty or a rising block. Call for help and support the airway.',
    ]),
    G(2, 'Position and landmarks', [
      'In the lateral position the spine tends to sag and rotate, and the midline drifts. If you must use it, support the back so that it lies level.',
      'Landmarks such as the line between the iliac crests are less reliable. Feel for the sacrum and count up, or scan.',
      'Fat folds and the abdominal apron move between sitting and lying. Mark and puncture in the same position.',
    ]),
    G(2, 'Needle and depth', [
      'Depth to the canal is usually greater, and in some patients it is more than a standard needle can reach. Measure it on the scan instead of guessing.',
      'A thicker cutting needle has a higher chance of a headache after the block. Use the thinnest needle that goes straight, and accept a larger needle only when you need it.',
      'If the depth allows it, stay with an ordinary-length needle. The longer and thinner the needle, the more it bends.',
    ]),
    G(2, 'Physiology', [
      'Increased abdominal pressure and a smaller space in the canal can mean a higher spread for a given dose. Be careful with the dose and check the level.',
      'Obesity with a high block raises the risk of breathing problems. Keep monitoring continuous and have a plan for the airway.',
      'Hypotension is treated as usual. Check the blood pressure cuff size.',
    ]),
    PEARL('count up from the sacrum', 'When the midline cannot be found by feel, find the sacrum on the scan and count up the levels in the paramedian sagittal view. The sacrum is easy to see even through a lot of tissue.'),
    PEARL('keep the shaft short outside the skin', 'A long fine needle bends where it is unsupported. Hold the needle near the skin, use the introducer as a splint and advance in small steps. If the needle bends, replace it.'),
    PEARL('hold the skin taut', 'Skin and fat shift when the needle goes in, and the midline can slide sideways. Ask a helper to hold the skin taut or mark the midline with the patient in the final position.'),
  );
}

// ------------------------------------------------------------------ (d) ankylosing spondylitis
function as() {
  return panel('sx-as', 'Ankylosing spondylitis',
    T(P('In advanced disease the ligaments turn to bone and the vertebrae fuse. The spine is stiff, often stooped, and there may be no gap between the laminae at all.'), 1),
    SUMMARY([
      ['Tell your supervisor before you start', 'This is a job for an experienced operator. Look at the imaging and ask how far the disease has gone.'],
      ['Check the neck and airway', 'A stiff or fused neck changes your airway plan. Think about this before the spinal, because you may need to change to a general anaesthetic.'],
      ['Position gently', 'A fused spine does not bend further. Do not force it. Sit the patient if they can, with support.'],
      ['Use a paramedian approach or L5–S1', 'These are the routes most often used when the midline is closed. Map them with ultrasound if you can.'],
      ['Limit the attempts', 'Repeated attempts raise the risk of a bleed. Have a low threshold for another technique.'],
    ]),
    STOP([
      'A fused spine and no gap on the scan or on imaging. Change the plan.',
      'Bone at every pass.',
      'Pain or tingling in a leg. Do not inject.',
    ]),
    G(2, 'What is different', [
      'The supraspinous and interspinous ligaments and the ligamentum flavum can ossify and the facet joints can fuse. This gives the "bamboo" spine on X-ray.',
      'The lowest lumbar spaces and L5–S1 are the ones most likely to stay open.',
      'The spine is brittle and can break with a small force. Position gently.',
      'Many of these patients take anti-inflammatory drugs. Check what they take and when they last took it.',
    ]),
    G(2, 'Bleeding risk', [
      'Repeated attempts and a difficult approach are well-recognised risk factors for a spinal haematoma. Combine this with any anticoagulant or antiplatelet drug and the risk is higher.',
      'Check the anticoagulant section in the technique part of this page, and tell the ward which neurological checks to do afterwards.',
    ]),
    G(2, 'Alternatives to think of early', [
      'General anaesthesia, with a careful airway plan.',
      'Peripheral nerve blocks that cover the surgery, with or without sedation.',
      'The time to discuss this with the surgeons and the patient is before you start.',
    ]),
    PEARL('look for a window first', 'Review the CT or MRI before you try. If the imaging shows the interlaminar spaces bridged by bone at every lumbar level, a window may not exist and a needle will not find one. A single open space at L5–S1 on the scan can be the route.'),
    PEARL('a stooped patient prefers to sit', 'A spine fixed in flexion may be easier to approach sitting. Lying on the side can twist a rigid spine and push the vertebrae away from the line you expect.'),
    PEARL('let the scan choose the side', 'Fusion is often uneven. Scan both paramedian windows at the chosen level and pick the side with the clearer gap, rather than the side that is more comfortable for you.'),
  );
}

// ------------------------------------------------------------------ (e) previous spinal surgery
function surgery() {
  return panel('sx-surgery', 'Previous spinal surgery',
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
    G(2, 'Why it is different', [
      'After a laminectomy the bone and the ligamentum flavum are missing. The needle may meet no resistance and there is little warning before the dura.',
      'Scar in the epidural space can tether the dura and make the spread patchy.',
      'After a fusion the lamina can be bridged by bone, and rods and screws block the way in. The levels above and below carry more load and are often stiff.',
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
    PEARL('a laminectomy has no flavum', 'At a laminectomy level the needle can pass through scar with no clear sense of the flavum, and the dura may be adherent to the scar. Avoid the level, and if you cannot, scan to see the defect.'),
    PEARL('read the operation note', 'Imaging tells you where the metal is. The operation note tells you what was removed. Together they show the levels with no bone, no scar and no hardware, which is where the needle should go.'),
    PEARL('the segment next to a fusion', 'The level just above or below a fusion is often still open, but the scar, the bone graft and the hardware can distort the path. Scan before you commit.'),
  );
}

export function buildPanels() {
  return [
    { value: 'sx-elderly', label: 'Elderly or calcified', node: elderly() },
    { value: 'sx-scoliosis', label: 'Scoliosis', node: scoliosis() },
    { value: 'sx-obesity', label: 'Obesity', node: obesity() },
    { value: 'sx-as', label: 'Ankylosing spondylitis', node: as() },
    { value: 'sx-surgery', label: 'Previous spinal surgery', node: surgery() },
  ];
}
