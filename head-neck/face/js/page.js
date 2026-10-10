// Face page: wires the shared truncal shell to this page's chapters and data.
import { bootPage } from '../../../truncal/shared/js/shell.js';
import { BLOCKS } from './blocks.js';
import { renderAnatomy, renderDeep } from './anatomy.js';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Face blocks',
  eyebrow: 'Regional anaesthesia · Head and neck',
  lead: 'Blocks of the trigeminal nerve: supraorbital, supratrochlear, infraorbital and mental at the face, and the maxillary and mandibular nerves near the skull base.',
  searchPlaceholder: 'Search, e.g. cleft lip, infraorbital, chin',
  tiles: [
    { title: 'Find the three foramina', desc: 'All in line with the pupil', href: '#fa-fig-foramina' },
    { title: 'Block the forehead', desc: 'Supraorbital and supratrochlear', href: '#ch-so' },
    { title: 'Block the upper lip', desc: 'Infraorbital, for cleft lip', href: '#ch-io' },
    { title: 'Block the lower lip', desc: 'Mental nerve', href: '#ch-me' },
    { title: 'Block the palate', desc: 'Suprazygomatic maxillary nerve block', href: '#fa-deep-v2' },
    { title: 'Practise the needle path', desc: 'Infraorbital scan viewer', href: '#io-step-needle' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: the trigeminal nerve', short: 'Anatomy', desc: 'V1, V2, V3 and the three foramina.', render: renderAnatomy },
    { id: 'ch-so', title: 'Supraorbital and supratrochlear nerve blocks', short: 'Supraorbital', desc: 'Forehead and frontal scalp.', block: byId.so },
    { id: 'ch-io', title: 'Infraorbital nerve block', short: 'Infraorbital', desc: 'Cheek, side of the nose, upper lip.', block: byId.io },
    { id: 'ch-me', title: 'Mental nerve block', short: 'Mental', desc: 'Lower lip and chin.', block: byId.me },
    { id: 'ch-deep', title: 'Maxillary and mandibular nerve blocks', short: 'V2 and V3', desc: 'Deep blocks near the skull base. For experienced hands.', render: renderDeep },
  ],
  synonyms: [['ion', 'infraorbital'], ['son', 'supraorbital'], ['v2', 'maxillary'], ['v3', 'mandibular'], ['cleft', 'cleft lip palate']],
});
