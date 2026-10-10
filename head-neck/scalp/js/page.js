// Scalp and occipital page: wires the shared truncal shell to this page's chapters and data.
import { bootPage } from '../../../truncal/shared/js/shell.js';
import { BLOCKS, REFS } from './blocks.js';
import { renderAnatomy } from './anatomy.js';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Scalp and occipital blocks',
  eyebrow: 'Regional anaesthesia · Head and neck',
  lead: 'The scalp block for craniotomy, and the greater and lesser occipital nerve blocks: where the nerves are and how to reach them.',
  searchPlaceholder: 'Search, e.g. craniotomy, occipital, GLASS Z',
  tiles: [
    { title: 'Block for an awake craniotomy', desc: 'Scalp block: the seven sites', href: '#scalp-fig-points' },
    { title: 'Block the back of the head', desc: 'Greater occipital nerve at C2', href: '#ch-gon' },
    { title: 'Practise the needle path', desc: 'GON scan viewer, needle step', href: '#gon-step-needle' },
    { title: 'Learn the territories', desc: 'Who supplies what', href: '#sc-fig-territories' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: the nerves of the scalp', short: 'Anatomy', desc: 'Five layers, seven nerves.', render: renderAnatomy },
    { id: 'ch-scalp', title: 'Scalp block', short: 'Scalp block', desc: 'Craniotomy and head pins. Landmarks.', block: byId.scalp },
    { id: 'ch-gon', title: 'Greater occipital nerve block', short: 'Occipital', desc: 'Landmarks, or ultrasound at C2.', block: byId.gon },
  ],
  refs: REFS,
  refsIntro: 'Technique and doses follow the department’s teaching notes. Where the notes do not give a value, it comes from the sources below and is cited where it is used.',
  synonyms: [['gon', 'greater occipital'], ['lon', 'lesser occipital'], ['oci', 'obliquus capitis inferior']],
});
