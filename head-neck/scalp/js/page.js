// Scalp and occipital page: wires the shared regional shell to this page's chapters and data.
import { bootPage } from '../../../shared/regional/js/shell.js';
import { BLOCKS } from './blocks.js?v=20261016';
import { renderAnatomy } from './anatomy.js?v=20261015';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Scalp and occipital blocks',
  eyebrow: 'Regional anaesthesia · Head and neck',
  backLabel: 'See all head and neck blocks and the operation chooser',
  backShort: 'Head and neck blocks',
  backHref: '../',
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
  synonyms: [['gon', 'greater occipital'], ['lon', 'lesser occipital'], ['oci', 'obliquus capitis inferior']],
});
