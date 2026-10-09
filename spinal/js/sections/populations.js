// 06 Special populations: a short note. No doses here by design.
import { el, cite } from '../ui.js?v=1';

export const meta = { id: 'populations', prefix: 'pp', title: 'Special populations' };

// Module refs (checked against PubMed on 8 October 2026).
export const refs = {
  'pp-griffiths2021': {
    label: 'Griffiths 2021',
    text: 'Griffiths R, Babu S, Dixon P, Freeman N, Hurford D, Kelleher E, et al. Guideline for the management of hip fractures 2020: guideline by the Association of Anaesthetists. <i>Anaesthesia</i> 2021;76:225–37.',
    url: 'https://doi.org/10.1111/anae.15291',
  },
  'pp-guay2020': {
    label: 'Guay 2020',
    text: 'Guay J, Kopp S. Peripheral nerve blocks for hip fractures in adults. <i>Cochrane Database Syst Rev</i> 2020;11:CD001159.',
    url: 'https://doi.org/10.1002/14651858.CD001159.pub3',
  },
  'pp-neuman2021': {
    label: 'Neuman 2021',
    text: 'Neuman MD, Feng R, Carson JL, Gaskins LJ, Dillane D, Sessler DI, et al. Spinal anesthesia or general anesthesia for hip surgery in older adults. <i>N Engl J Med</i> 2021;385:2025–35.',
    url: 'https://doi.org/10.1056/NEJMoa2113514',
  },
};

const CARDS = [
  {
    id: 'pp-older',
    tag: 'Older adults',
    title: 'Older and frail patients',
    points: [
      'Expect more hypotension, and spread that may go a little higher than in younger patients. Many anaesthetists reduce the dose.' + cite('hocking2004'),
      'Calcified ligaments and narrow gaps make the midline hard. A paramedian approach often works better.',
      'Hip fracture: give a femoral or fascia iliaca block before you sit the patient up.' + cite('pp-griffiths2021', 'pp-guay2020') + ' The PENG block is a newer alternative.',
      'Spinal rather than general anaesthesia hasn’t been shown to reduce postoperative delirium.' + cite('pp-neuman2021'),
    ],
  },
  {
    id: 'pp-obesity',
    tag: 'Obesity',
    title: 'Patients with obesity',
    points: [
      'Sitting usually makes the midline easier to find than lying on the side.',
      'If you can’t feel the spinous processes, scan first to mark the midline and the interspace.' + cite('chin2011', 'perlas2016'),
      'Have a longer spinal needle ready before you start.',
      'The block may spread higher than you expect. Watch the level and the breathing, especially once the patient lies flat.',
    ],
  },
  {
    id: 'pp-aortic-stenosis',
    tag: 'Fixed cardiac output',
    title: 'Severe aortic stenosis',
    points: [
      'A fixed cardiac output can’t compensate for sudden vasodilatation, so a full single-shot spinal is a relative caution.',
      'Discuss the plan with a senior first. Options include a slowly titrated neuraxial technique, with invasive arterial monitoring and a vasopressor ready, or a different anaesthetic.',
    ],
  },
  {
    id: 'pp-neuro',
    tag: 'Neurological disease',
    title: 'Pre-existing neurological disease',
    points: [
      'Examine and write down the baseline deficit before the block, so any later change can be judged against it.',
      'Conditions such as multiple sclerosis or peripheral neuropathy aren’t automatic contraindications. Discuss the risks and benefits with the patient and a senior, and record that discussion.',
    ],
  },
  {
    id: 'pp-day-case',
    tag: 'Day surgery',
    title: 'Day-case spinal',
    points: [
      'Choose a short-acting local anaesthetic so the patient can walk and go home the same day. Which agents are stocked depends on local policy.',
      'Before discharge, check that the patient has passed urine or meets the local voiding criteria, and give written advice about headache and who to call.',
    ],
  },
  {
    id: 'pp-out-of-scope',
    tag: 'Not covered here',
    title: 'Children and obstetrics',
    points: [
      'Paediatric spinal anaesthesia is out of scope for this page.',
      'NTF Anaesthesia doesn’t provide an obstetric anaesthesia service, so obstetric neuraxial practice (for example, OAA guidance) is out of scope for this page.',
    ],
  },
];

export function mount(root) {
  root.append(el('p', {
    class: 'sp-lead',
    text: 'The technique doesn’t change much from patient to patient, but the risks and the plan do. These are short reminders, not a full guide.',
  }));
  const grid = el('div', { class: 'pp-grid' });
  for (const c of CARDS) {
    const card = el('article', { class: 'pp-card', id: c.id, 'aria-labelledby': `${c.id}-h` });
    card.append(
      el('p', { class: 'pp-tag', text: c.tag }),
      el('h3', { class: 'pp-title', id: `${c.id}-h`, text: c.title }),
    );
    const ul = el('ul', { class: 'pp-points' });
    for (const p of c.points) ul.append(el('li', { html: p }));
    card.append(ul);
    grid.append(card);
  }
  root.append(grid);
}
