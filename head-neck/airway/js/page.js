// Airway page: wires the shared truncal shell to this page's chapters and data.
import { bootPage } from '../../../truncal/shared/js/shell.js';
import { BLOCKS, REFS } from './blocks.js';
import { renderAnatomy, renderTopical } from './topical.js';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Airway blocks for awake intubation',
  eyebrow: 'Regional anaesthesia · Head and neck',
  lead: 'Topical anaesthesia and nerve blocks of the airway: who supplies what, how much lidocaine, and the superior laryngeal, transtracheal and glossopharyngeal blocks.',
  searchPlaceholder: 'Search, e.g. lidocaine dose, cricothyroid, gag',
  tiles: [
    { title: 'Check the lidocaine dose', desc: 'Maximum 9 mg/kg topically', href: '#ch-topical' },
    { title: 'Learn the nerve supply', desc: 'V, IX and X, region by region', href: '#ch-anatomy' },
    { title: 'Block above the cords', desc: 'Superior laryngeal nerve', href: '#ch-sln' },
    { title: 'Block the cords and trachea', desc: 'Transtracheal injection', href: '#ch-ttb' },
    { title: 'Find the cricothyroid membrane', desc: 'Ultrasound, step by step', href: '#ttb-step-scan' },
    { title: 'Stop the gag', desc: 'Glossopharyngeal nerve block', href: '#ch-gpn' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: sensory supply of the airway', short: 'Anatomy', desc: 'Trigeminal, glossopharyngeal and vagus.', render: renderAnatomy },
    { id: 'ch-topical', title: 'Topical anaesthesia for awake intubation', short: 'Topical', desc: 'Drugs, doses and ways to apply them.', render: renderTopical },
    { id: 'ch-sln', title: 'Superior laryngeal nerve block', short: 'Superior laryngeal', desc: 'The larynx above the cords.', block: byId.sln },
    { id: 'ch-ttb', title: 'Transtracheal block', short: 'Transtracheal', desc: 'The cords and trachea.', block: byId.ttb },
    { id: 'ch-gpn', title: 'Glossopharyngeal nerve block', short: 'Glossopharyngeal', desc: 'The gag reflex.', block: byId.gpn },
  ],
  refs: REFS,
  refsIntro: 'Technique and doses follow the department’s teaching notes. Where the notes do not give a value, it comes from the sources below and is cited where it is used.',
  synonyms: [['sln', 'superior laryngeal'], ['ctm', 'cricothyroid membrane'], ['ati', 'awake tracheal intubation'], ['afoi', 'awake fibreoptic intubation'], ['saygo', 'spray as you go'], ['lignocaine', 'lidocaine']],
});
