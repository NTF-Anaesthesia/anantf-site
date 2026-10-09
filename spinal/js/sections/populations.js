// 07 Special populations: a short note. No doses here by design.
import { el, cite, tier, keyPoints, callout } from '../ui.js?v=1';

export const meta = { id: 'populations', prefix: 'pp', title: 'Special populations' };

// Module refs (checked against PubMed on 8 October 2026).
export const refs = {
  'pp-griffiths2021': {
    label: 'Griffiths 2021',
    text: 'Griffiths R, Babu S, Dixon P, Freeman N, Hurford D, Kelleher E, et al. Guideline for the management of hip fractures 2020: guideline by the Association of Anaesthetists. <i>Anaesthesia</i> 2021;76:225–37.',
    url: 'https://doi.org/10.1111/anae.15291',
  },
};

// Points are strings (tier 1 inherit the card) or { t, tier } for a point of a different tier.
const CARDS = [
  {
    id: 'pp-older',
    tag: 'Older adults',
    title: 'Older and frail patients',
    tier: 1,
    points: [
      'Expect more hypotension, and spread that may go a little higher than in younger patients. Many anaesthetists reduce the dose.',
      { t: 'Calcified ligaments and narrow gaps make the midline hard. A paramedian approach often works better.', tier: 2 },
      'Hip fracture: give a femoral or fascia iliaca block before you sit the patient up.' + cite('pp-griffiths2021'),
      { t: 'The PENG block is a newer alternative for positioning analgesia.', tier: 3 },
      { t: 'Spinal rather than general anaesthesia hasn’t been shown to reduce postoperative delirium.', tier: 2 },
    ],
  },
  {
    id: 'pp-obesity',
    tag: 'Obesity',
    title: 'Patients with obesity',
    tier: 1,
    points: [
      'Sitting usually makes the midline easier to find than lying on the side.',
      { t: 'If you can’t feel the spinous processes, scan first to mark the midline and the interspace.', tier: 2 },
      'Have a longer spinal needle ready before you start.',
      'The block may spread higher than you expect. Watch the level and the breathing, especially once the patient lies flat.',
    ],
  },
  {
    id: 'pp-aortic-stenosis',
    tag: 'Fixed cardiac output',
    title: 'Severe aortic stenosis',
    tier: 2,
    points: [
      'A fixed cardiac output can’t compensate for sudden vasodilatation, so a full single-shot spinal is a relative caution.',
      'Discuss the plan with a senior first. Options include a slowly titrated neuraxial technique, with invasive arterial monitoring and a vasopressor ready, or a different anaesthetic.',
    ],
  },
  {
    id: 'pp-neuro',
    tag: 'Neurological disease',
    title: 'Pre-existing neurological disease',
    tier: 2,
    points: [
      'Examine and write down the baseline deficit before the block, so any later change can be judged against it.',
      'Conditions such as multiple sclerosis or peripheral neuropathy aren’t automatic contraindications. Discuss the risks and benefits with the patient and a senior, and record that discussion.',
    ],
  },
  {
    id: 'pp-day-case',
    tag: 'Day surgery',
    title: 'Day-case spinal',
    tier: 1,
    points: [
      'Choose a short-acting local anaesthetic so the patient can walk and go home the same day.',
      'Before discharge, check that the patient has passed urine or meets voiding criteria, and give written advice about headache and who to call.',
    ],
  },
  {
    id: 'pp-out-of-scope',
    tag: 'Not covered here',
    title: 'Children and obstetrics',
    tier: 1,
    points: [
      'Paediatric spinal anaesthesia is out of scope for this page.',
      'NTF Anaesthesia doesn’t provide an obstetric anaesthesia service, so obstetric neuraxial practice (for example, OAA guidance) is out of scope for this page.',
    ],
  },
];

export function mount(root) {
  root.append(keyPoints([
    'Older patients: more hypotension and sometimes higher spread. Think about a smaller dose.',
    'Hip fracture: give a femoral or fascia iliaca block before sitting the patient up.',
    'Obesity: sit the patient up, expect higher spread, and have a longer needle ready.',
    'Severe aortic stenosis: a full single-shot spinal is a relative caution. Talk to a senior first.',
    'Neurological disease: write down the baseline deficit before the block.',
    'Day case: short-acting drug, voiding check and written advice before discharge.',
    'Children and obstetrics are not covered on this page.',
  ]));
  root.append(el('p', {
    class: 'sp-lead',
    text: 'The technique doesn’t change much from patient to patient, but the risks and the plan do. These are short reminders, not a full guide.',
  }));
  const grid = el('div', { class: 'pp-grid' });
  for (const c of CARDS) {
    const card = tier(el('article', { class: 'pp-card', id: c.id, 'aria-labelledby': `${c.id}-h` }), c.tier);
    card.append(
      el('p', { class: 'pp-tag', text: c.tag }),
      el('h3', { class: 'pp-title', id: `${c.id}-h`, text: c.title }),
    );
    const ul = el('ul', { class: 'pp-points' });
    for (const p of c.points) {
      const item = typeof p === 'string' ? { t: p } : p;
      const li = el('li', { html: item.t });
      if (item.tier && item.tier !== c.tier) tier(li, item.tier);
      ul.append(li);
    }
    card.append(ul);
    grid.append(card);
  }
  root.append(grid);
  root.append(tier(callout('pearl', {
    title: 'Pearls for the hard case',
    body: '<ul><li>In the REGAIN trial of hip surgery, spinal and general anaesthesia gave similar walking recovery at 60 days. Choose by the patient and the surgery, not by a belief that one is safer.</li><li>For severe aortic stenosis, small series describe low-dose or sequential combined techniques. The evidence is thin, so the plan rests on a senior-led discussion and close arterial monitoring.</li></ul>',
  }), 3));
}
