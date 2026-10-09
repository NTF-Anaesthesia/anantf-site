// 03 Challenging spines: patient-type walkthroughs, the paramedian approach and the Taylor (L5-S1) approach.
// Tiers: 1 MO, 2 Resident, 3 Advanced (see ../TIERS.md). No new doses, and no citations in this section.
import { el, callout, steps, tier, keyPoints, segmented, figure, announce } from '../ui.js?v=1';
import { buildPanels } from '../spines/panels.js?v=1';
import { paramedianFigure } from '../spines/paramedian.js?v=1';
import { taylorSvg } from '../spines/figures.js?v=1';

export const meta = { id: 'spines', prefix: 'sx', title: 'Challenging spines' };

const T = tier;
const UL = (items) => el('ul', { class: 'sx-list' }, ...items.map((h) => el('li', { html: h })));
const P = (html, cls) => el('p', { html, class: cls });
const G = (n, title, items) => T(el('div', { class: 'sx-grp' }, el('p', { class: 'sx-sub', text: title }), UL(items)), n);
const PEARL = (title, html) => T(callout('key', { title: `Advanced pearl: ${title}`, body: `<p>${html}</p>` }), 3);

function part(id, title, ...children) {
  return el('section', { class: 'sx-part', id, 'aria-labelledby': `${id}-h` }, el('h3', { id: `${id}-h`, class: 'sx-h', text: title }), ...children);
}

export function mount(root) {
  root.append(
    keyPoints([
      'Plan a difficult back before you start: look, feel, check any imaging, scan if you can, and tell your supervisor.',
      'Elderly or calcified spine: give analgesia first, sit the patient if possible, and move early to a paramedian approach.',
      'Paramedian entry is 0.5–1 cm lateral to the upper edge of the lower spinous process, 5–15° medial. If you hit lamina, walk off it cranially.',
      'L5–S1 (Taylor) is the usual fallback: 1 cm medial and 1 cm below the PSIS, aimed up and in.',
      'Scoliosis: the spinous processes point to the concave side but the canal lies off to the convex side. Enter from the convex side.',
      'Obesity: sit the patient up, scan for the midline and depth, use an introducer, and a longer, firmer needle (a 22G Quincke) if the depth needs it.',
      'Ankylosing spondylitis: expect no midline gap. Try once by a paramedian route or at L5–S1, and keep a low threshold for another technique.',
      'After spinal surgery: go a level above or below, record the baseline neurology, and expect unpredictable spread.',
    ]),
    T(P('Some backs make a spinal hard. This part gives a plan for each type of patient, then the two approaches you will use most: paramedian and Taylor.', 'sp-lead'), 1),
    T(callout('key', {
      title: 'Before any difficult back',
      body: UL([
        'Ask about back surgery, scoliosis, rods and arthritis. Look at the back.',
        'Look at any X-ray, CT or MRI, or the report.',
        'Scan the back if you have been taught how. Mark the level, the depth and the angle.',
        'Tell your supervisor now, not after the third attempt.',
        'Agree a limit before you start. When you reach it, change something or change the plan.',
      ]),
    }), 1),
    G(2, 'Why some backs are hard', [
      'The target is a gap between two laminae, a few millimetres wide at best. Anything that narrows or covers the gap, or turns it away from where the skin says it is, makes the needle miss.',
      'Four things go wrong: ligaments calcify or ossify, the vertebrae rotate, soft tissue hides the landmarks, and scar or metal covers the way in.',
      'A systematic way to cope is the same in each case: choose the position, map the spine, choose the route, keep the needle straight, and stop early.',
    ]),
  );

  // ------------------------------------------------------------------ patient type
  const panels = buildPanels();
  const host = el('div', { class: 'sx-panels' });
  const hint = el('p', { class: 'sx-picker-hint', text: 'Pick the patient to see the plan for their back.' });
  let current = null;
  const show = (value, say = false) => {
    const p = panels.find((x) => x.value === value);
    if (!p) return false;
    panels.forEach((x) => { x.node.hidden = x.value !== value; });
    seg.set(value);
    if (say && current !== value) announce(`${p.label}. Plan shown below.`);
    current = value;
    return true;
  };
  const seg = segmented(panels.map((p) => ({ value: p.value, label: p.label })), {
    label: 'Type of patient', value: panels[0].value, onChange: (v) => show(v, true),
  });
  seg.classList.add('sx-seg');
  panels.forEach((p) => { p.node.hidden = true; host.append(p.node); });

  root.append(part('sx-patients', 'Walkthrough by patient type',
    el('div', { class: 'sx-picker' }, el('p', { class: 'sx-picker-label', id: 'sx-picker-label', text: 'Type of patient' }), seg, hint),
    host));
  show(panels[0].value);

  // ------------------------------------------------------------------ paramedian
  root.append(part('sx-paramedian', 'The paramedian approach',
    T(P('The needle goes in beside the midline and passes lateral to the supraspinous and interspinous ligaments. It is often the best route in an older, stiff or calcified spine.'), 1),
    T(steps([
      { title: 'Position and landmarks as for the midline', body: '<p>Choose the space. Find the spinous process of the lower vertebra of that space.</p>' },
      { title: 'Mark the entry', body: '<p>About 0.5–1 cm lateral to the upper edge of the lower spinous process. Use either side.</p>' },
      { title: 'Aim slightly medial and cranial', body: '<p>Angle 5–15° medial, towards the midline gap, and slightly towards the head. Use the introducer.</p>' },
      { title: 'Advance to bone', body: '<p>Firm bone is usually the lamina. Note how deep it is.</p>' },
      { title: 'Walk off the lamina cranially', body: '<p>Withdraw a little, aim slightly more towards the head, and advance again. The gap lies just above the lamina.</p>' },
      { title: 'Go through the flavum', body: '<p>Feel the grit and then the give. Remove the stylet and look for CSF before you inject.</p>' },
    ]), 1),
    T(paramedianFigure(), 2),
    G(2, 'Reasoning', [
      'The interlaminar gaps are widest when the spine is flexed. The paramedian route lets the needle reach the gap without crossing the midline ligaments, which are the ones that calcify.',
      'The medial angle brings the needle from the entry point to the middle of the canal. About 1 cm out and about 5 cm deep needs roughly 10° of angle, which is why the range is 5–15°.',
      'Bone at a shallow depth, with a rounded feel, may be the facet joint, which means you are too lateral. Go back and aim a little more medially.',
      'Bone at an expected depth, with a flat feel, is the lamina. Walk off it cranially.',
      'If the first pass is wrong, go back to the skin and change one thing at a time: the angle, or the entry point.',
    ]),
    G(2, 'Viva points', [
      'Name the layers crossed in the paramedian route: skin, subcutaneous tissue, paraspinal muscle, ligamentum flavum, epidural space, dura and arachnoid. The supraspinous and interspinous ligaments are bypassed.',
      'Say why the technique helps: calcified midline ligaments, a narrow midline gap and a patient who cannot flex well.',
      'State the fallback: Taylor at L5–S1.',
    ]),
    PEARL('use the bone contact as a measurement', 'The first bone contact gives you the depth and the slope of the lamina. The canal is a short distance beyond it. If the depth of the lamina is more than the scan predicted, you may be on the wrong side of the midline or on a facet.'),
    PEARL('small steps in a calcified spine', 'Advance a few millimetres at a time and re-check the line. Several short corrections near the skin are safer than one large correction from deep, because a deep correction bends the needle.'),
  ));

  // ------------------------------------------------------------------ Taylor
  const tf = figure({
    id: 'sx-taylor-fig', num: '3.3', title: 'Taylor approach at L5–S1', plate: 'paper', aspect: '28/23',
    caption: 'Posterior view, head up. Not to scale.'
      + ' The entry point is 1 cm medial and 1 cm below the posterior superior iliac spine (PSIS). The needle is aimed up and in towards the L5–S1 gap.',
  });
  tf.stage.append(taylorSvg());
  root.append(part('sx-taylor', 'The Taylor approach at L5–S1',
    T(P('The L5–S1 gap is often the widest in the lumbar spine. The Taylor approach reaches it from beside the sacrum, so it avoids the midline ligaments completely.'), 1),
    T(steps([
      { title: 'Position', body: '<p>Sit the patient, or lie them on their side, with as much flexion as they can manage.</p>' },
      { title: 'Find the PSIS', body: '<p>Feel the dimple at the back of the pelvis on the side you will use.</p>' },
      { title: 'Mark the entry', body: '<p>About 1 cm medial and 1 cm below the PSIS.</p>' },
      { title: 'Aim up and in', body: '<p>Aim towards the L5–S1 gap, up towards the head and in towards the midline. Use the introducer.</p>' },
      { title: 'If you meet bone, redirect', body: '<p>Withdraw and change the angle a little. Do not push through bone.</p>' },
      { title: 'Go through the flavum', body: '<p>Look for CSF before you inject.</p>' },
    ]), 1),
    T(tf.fig, 2),
    G(2, 'Detail', [
      'The usual teaching is about 55° towards the head and about 45° towards the midline. Treat these as a guide and check the line on a scan.',
      'L5–S1 lies below the end of the spinal cord, so the level itself is safe. Make sure you are really at L5–S1, because the sacrum can have extra or missing segments. Count up from the sacrum on the scan.',
      'The path is long and oblique. Use an introducer and a needle of enough length, and watch for bending.',
      'The cauda equina fills the canal at this level, so the usual rule applies: if the patient reports pain or tingling in a leg, stop and do not inject.',
    ]),
    G(2, 'Viva points', [
      'Say when you would use it: a calcified or ankylosed spine, or when higher spaces cannot be entered.',
      'Name the landmarks: the PSIS, the L5 spinous process and the sacrum.',
      'Name the structures crossed: skin, subcutaneous tissue, the lumbosacral ligaments, and the flavum, then the epidural space and dura.',
    ]),
    PEARL('scan to find the gap', 'On the scan, the sacrum looks like a continuous bright line. The first gap above it is L5–S1. Check the angle and the depth on a paramedian sagittal oblique view, and mark the skin with the patient in the final position.'),
    PEARL('the long path bends needles', 'Because the oblique path is long, a fine needle can drift. If the needle goes off the planned line, withdraw it to the introducer and start again rather than steering.'),
  ));

  // ------------------------------------------------------------------ stopping
  root.append(part('sx-stop', 'When to stop and change the plan',
    T(callout('warn', {
      title: 'Stop and get help when',
      body: UL([
        'You reach the limit you agreed before you started.',
        'You get pain or tingling in a leg, or blood keeps coming back through the needle.',
        'Bone stops you at every pass.',
        'The patient cannot stay in position, or they become unwell.',
      ]),
    }), 1),
    T(P('Stopping is a skill, not a failure. Say it out loud to your supervisor, record what you tried, and move to the next plan.'), 1),
    G(2, 'Other plans', [
      'A different operator.',
      'A different position, level or approach.',
      'A peripheral nerve block that covers the surgery, with or without sedation.',
      'General anaesthesia, with a plan for the airway.',
    ]),
    G(2, 'What to record', [
      'The position, the level, the approach and the number of attempts.',
      'Any paraesthesia, blood in the needle or bone contact.',
      'The baseline neurology in a patient with previous surgery.',
      'What you told the patient and the ward, including when to call for help.',
    ]),
    PEARL('decide the plan B before you start', 'Experts choose their plan B at the beginning, with the surgeons and the patient. The decision to stop is easier when it is part of the plan and not a reaction to failure.'),
  ));

  return {
    reveal(id) {
      for (const p of panels) {
        if (id === p.value || id.startsWith(`${p.value}-`)) return show(p.value);
      }
      return false;
    },
  };
}
