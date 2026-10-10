// Eye page: wires the shared truncal shell to this page's chapters and data.
import { bootPage } from '../../../truncal/shared/js/shell.js';
import { BLOCKS, REFS } from './blocks.js';
import { renderAnatomy, renderTopical } from './anatomy.js';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Eye blocks',
  eyebrow: 'Regional anaesthesia · Head and neck',
  lead: 'Peribulbar, retrobulbar, sub-Tenon’s and topical anaesthesia for eye surgery: how each works, which to choose, and how to manage the complications.',
  searchPlaceholder: 'Search, e.g. sub-Tenon, axial length, brainstem',
  tiles: [
    { title: 'Choose a technique', desc: 'Topical, sub-Tenon’s, peribulbar or retrobulbar', href: '#ey-compare' },
    { title: 'Follow the needle', desc: 'Peribulbar versus retrobulbar', href: '#peri-step-needle' },
    { title: 'Follow the cannula', desc: 'Sub-Tenon’s, step by step', href: '#st-step-needle' },
    { title: 'Manage a complication', desc: 'Brainstem anaesthesia, haemorrhage, perforation', href: '#peri-complications' },
    { title: 'Know the nerves', desc: 'LR6 SO4, V1', href: '#ch-anatomy' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: the orbit and its nerves', short: 'Anatomy', desc: 'The cone, the nerves and the axial length.', render: renderAnatomy },
    { id: 'ch-peri', title: 'Peribulbar and retrobulbar blocks', short: 'Needle blocks', desc: 'Outside or inside the muscle cone.', block: byId.peri },
    { id: 'ch-st', title: 'Sub-Tenon’s block', short: 'Sub-Tenon’s', desc: 'A blunt cannula behind the globe.', block: byId.st },
    { id: 'ch-topical', title: 'Topical anaesthesia and choosing a technique', short: 'Topical and choice', desc: 'Drops, intracameral, and a comparison table.', render: renderTopical },
  ],
  refs: REFS,
  refsIntro: 'Technique and doses follow the department’s teaching notes. Where the notes do not give a value, it comes from the sources below and is cited where it is used.',
  synonyms: [['subtenon', 'sub-tenon'], ['iop', 'intraocular pressure'], ['peribulbar', 'extraconal'], ['retrobulbar', 'intraconal']],
});
