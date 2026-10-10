// Special populations (merged from the old populations section). No new doses: see the dose table in tq-drugs.
// Tiers: 1 MO, 2 Resident, 3 Advanced.
import { el, cite, callout, table, details, tier } from '../ui.js?v=1';

const T = tier;
const P = (html, cls) => el('p', { html, class: cls });
const UL = (items) => el('ul', { class: 'tq-list' }, ...items.map((t) => el('li', { html: t })));
const G = (n, ...children) => T(el('div', { class: 'tq-grp' }, ...children), n);
const N = (s) => `<span class="sp-num">${s}</span>`;

/** Detail cards: [{id, summary, tier, body: Node[]}] */
function card(id, summary, n, ...body) {
  return T(details({ id, summary: `<span class="tq-pop-sum">${summary}</span>`, body }), n);
}

export function populationsBlocks() {
  const glance = T(table({
    caption: 'Special patients at a glance',
    head: ['Patient', 'Main problem', 'What to do differently'],
    rows: [
      [{ th: true, html: '<a href="#pp-older">Older or frail</a>' }, 'More hypotension, higher spread, stiff spine', 'Lower dose, vasopressor ready, paramedian if the midline fails. Hip fracture: <a href="#tq-hipfracture">worked example</a>.'],
      [{ th: true, html: '<a href="#pp-obesity">Obesity</a>' }, 'Midline hard to find, deeper target, higher spread', 'Sit the patient up, scan if you cannot feel the midline, longer pencil-point needle.'],
      [{ th: true, html: '<a href="#pp-aortic-stenosis">Fixed cardiac output (aortic stenosis)</a>' }, 'Cannot compensate for vasodilatation', 'Senior first. Slow, titrated technique or another anaesthetic; arterial line; alpha agonist ready.'],
      [{ th: true, html: '<a href="#pp-icp">Raised intracranial pressure</a>' }, 'Risk of coning', 'Avoid with a mass lesion. Discuss any other cause with a senior.'],
      [{ th: true, html: '<a href="#pp-neuro">Neurological disease</a>' }, 'Any new deficit is hard to interpret', 'Document the baseline deficit first.'],
      [{ th: true, html: '<a href="#pp-day-case">Day case</a>' }, 'Must walk and pass urine before home', 'Short-acting agent, discharge on criteria, no intrathecal morphine.'],
      [{ th: true, html: '<a href="#pp-infant">Infant (exam note)</a>' }, 'Anatomy and apnoea risk differ', 'Specialist paediatric practice. See the exam note below.'],
    ],
  }), 1);

  const older = card('pp-older', 'Older and frail patients', 1,
    G(1, UL([
      'Expect more hypotension, and a block that goes higher than in a younger adult. Use the typical dose or less (see <a href="#tq-drugs">Drugs and doses</a>); for a frail hip fracture, plain bupivacaine 0.5% 2.5–3 mL.',
      'Keep the vasopressor drawn up, and check the blood pressure often until the level has fixed.',
      'Hip fracture: give the nerve block first, then follow the <a href="#tq-hipfracture">worked example</a>.',
    ])),
    G(2, UL([
      '<strong>Why:</strong> less lumbosacral CSF, a stiffer circulation with weaker baroreflexes, more sympathetic tone at rest, and more neuronal sensitivity to local anaesthetic. Together they give a higher block and a bigger fall in blood pressure for the same dose.',
      'Calcified ligaments and narrow gaps make the midline hard: see the <a href="#sx-paramedian">paramedian approach</a> and the <a href="#sx-patients">walkthrough by patient type</a> in the Backs chapter.',
      'Spinal rather than general anaesthesia has not been shown to reduce postoperative delirium. Keep sedation light.',
    ])),
    T(P('A newer alternative for positioning analgesia is the PENG block.'), 3));

  const obesity = card('pp-obesity', 'Obesity', 1,
    G(1, UL([
      'Sit the patient up: the midline is easier to find than lying on the side.',
      'If you cannot feel the spinous processes, scan first to mark the midline and the gap (see the <a href="#ch-backs">Ultrasound</a> section).',
      'Have a longer pencil-point needle ready before you start. Do not swap to a thick cutting needle just for length.',
      'The block may spread higher than expected. Watch the level and the breathing once the patient lies flat, and keep the head up if the patient is breathless.',
    ])),
    G(2, UL([
      'Raised intra-abdominal pressure and engorged epidural veins reduce CSF volume, so spread is higher for a given dose. Dose by clinical judgement, not by weight.',
      'Obstructive sleep apnoea: sedation and a high block both threaten the airway. Keep sedation minimal and monitor breathing for longer.',
    ])));

  const aortic = card('pp-aortic-stenosis', 'Severe aortic stenosis and other fixed output', 2,
    G(2, UL([
      'Stroke volume cannot rise to match a fall in vascular resistance, so sudden vasodilatation drops the pressure. The thick left ventricle then loses coronary perfusion, which makes the output worse.',
      'Fast heart rates and loss of sinus rhythm are poorly tolerated: they shorten diastolic filling.',
      'A full single-shot spinal is a relative caution. Discuss the plan with a senior first.',
      'Options: a slowly titrated neuraxial technique (a catheter technique or a small first dose with top-ups), invasive arterial monitoring and a vasopressor ready, or a different anaesthetic.',
      'Treat falls in blood pressure with an alpha agonist rather than fluid alone: <a href="#ph-pressors">vasopressors</a>.',
    ])),
    G(3, P('Small series describe low-dose or sequential combined techniques. The evidence is thin, so the plan rests on a senior-led discussion and close arterial monitoring. The same reasoning applies to hypertrophic obstructive cardiomyopathy, mitral stenosis and pulmonary hypertension: keep preload, afterload and rhythm steady.')));

  const icp = card('pp-icp', 'Raised intracranial pressure', 2,
    G(2, UL([
      'A mass lesion with raised pressure is an absolute contraindication. A dural hole lets CSF leak, which can create a pressure gradient between the head and the spine and risks coning.',
      'Other causes (a Chiari malformation, hydrocephalus or a shunt, idiopathic intracranial hypertension) are not the same risk. Take a senior decision with the neurology or neurosurgical team and record it.',
    ])));

  const neuro = card('pp-neuro', 'Neurological disease', 2,
    G(2, UL([
      'Examine and write down the baseline deficit before the block, so any later change can be judged against it.',
      'Multiple sclerosis or peripheral neuropathy is not an automatic contraindication. Discuss the risks and benefits with the patient and a senior, and record that discussion.',
      'A patient with a known deficit may be more vulnerable to a second insult (the double-crush idea). Avoid anything that adds risk: a long, repeated search or a high dose.',
    ])));

  const sepsis = card('pp-sepsis', 'Sepsis and bacteraemia', 2,
    G(2, UL([
      'Infection at the puncture site is an absolute contraindication. Bacteraemia is a relative one: the fear is meningitis or an abscess.',
      'If you decide to go ahead, give antibiotics first, use full asepsis, and plan to review the patient closely afterwards. Record the reasoning.',
    ])));

  const dayRows = table({
    caption: 'Short-acting spinal drugs for day surgery (label figures from the dose table)',
    head: ['Drug', 'Label duration', 'Remember'],
    rows: [
      [{ th: true, html: 'Prilocaine 2% hyperbaric' }, `About ${N('100–130 min')}${cite('tq-prilotekal')}`, 'Short-acting; reduce in poor general condition or liver or kidney impairment.'],
      [{ th: true, html: 'Chloroprocaine 1%' }, `About ${N('80–100 min')}${cite('tq-ampres')}`, `Licensed for surgery of ${N('40 min')} or less. An ester.`],
      [{ th: true, html: 'Bupivacaine, small dose' }, 'Shorter than the usual dose', 'Lower dose gives a shorter, less reliable block. Have a plan if surgery runs on.'],
    ],
  });
  const dayCase = card('pp-day-case', 'Day-case spinal', 1,
    G(1, UL([
      'Choose a short-acting drug so the patient can walk and go home the same day. No intrathecal morphine.',
      'Discharge on criteria, not the clock: normal sensation and power in the legs, a supervised first walk, and passing urine (or meeting voiding criteria).',
      'Send the patient home with a responsible adult, written advice and a contact number. Include the headache and red-flag advice from <a href="#tq-postop">Post-op care</a>.',
    ])),
    T(dayRows, 2),
    G(3, P('The aim of ambulatory neuraxial practice is the shortest block that covers the surgery. The cost is a narrower margin: if the operation runs on, the options are sedation or a general anaesthetic, so say that at the consent discussion.')));

  const infant = card('pp-infant', 'Infant: awake spinal (exam note)', 3,
    G(3, UL([
      '<strong>Why it is used:</strong> in a former preterm infant, an awake spinal avoids a general anaesthetic and may lower the risk of postoperative apnoea. The GAS trial compared awake-regional with general anaesthesia and found similar neurodevelopmental outcomes.',
      '<strong>Anatomy:</strong> the cord ends lower (about L3 at birth, rising to adult level during the first year), the CSF volume per kilogram is greater, and the dose is by weight. Block duration is short, so surgery must be quick.',
      'This is specialist paediatric practice. NTF Anaesthesia has no obstetric service, so obstetric neuraxial practice is not taught here either. For viva-style answers, see the <a href="#ch-exam">Exam chapter</a>.',
    ])));

  return [
    T(P('The technique is the same for every patient. The risks and the plan are not. Tap a card for the detail.', 'sp-lead'), 1),
    glance,
    el('div', { class: 'tq-pop' }, older, obesity, aortic, icp, neuro, sepsis, dayCase, infant),
    T(callout('pearl', {
      title: 'Pearl: REGAIN',
      body: '<p>In the REGAIN trial of about 1,600 older patients having hip fracture surgery, spinal and general anaesthesia gave similar rates of walking at 60 days. Choose by the patient and the surgery, not by a belief that one is safer.</p>',
    }), 2),
  ];
}
