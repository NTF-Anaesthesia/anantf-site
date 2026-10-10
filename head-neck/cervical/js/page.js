// Cervical plexus page: wires the shared truncal shell to this page's chapters and data.
import { bootPage } from '../../../truncal/shared/js/shell.js';
import { BLOCKS, REFS } from './blocks.js';
import { renderAnatomy } from './anatomy.js';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Cervical plexus blocks',
  eyebrow: 'Regional anaesthesia · Head and neck',
  lead: 'Superficial, intermediate and deep cervical plexus blocks: where the nerves come out, how to see them, and which layer to inject.',
  searchPlaceholder: 'Search, e.g. carotid, Erb’s point, phrenic',
  tiles: [
    { title: 'Block for carotid surgery', desc: 'Intermediate block, plus the surgeon’s infiltration', href: '#scp-cea' },
    { title: 'Practise the needle path', desc: 'Scan viewer, intermediate plane', href: '#scp-step-needle' },
    { title: 'Compare the three layers', desc: 'Superficial, intermediate, deep', href: '#cp-anat-layers' },
    { title: 'Learn the deep block landmarks', desc: 'Mastoid to Chassaignac’s tubercle', href: '#cp-deep-landmarks' },
    { title: 'Know the complications', desc: 'Phrenic, vertebral artery, intrathecal', href: '#dcp-complications' },
    { title: 'Prepare for the viva', desc: 'Questions with model answers', href: '#scp-exam' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: the cervical plexus', short: 'Anatomy', desc: 'C1–C4, the four cutaneous branches, and the three fascial layers.', render: renderAnatomy },
    { id: 'ch-scp', title: 'Superficial and intermediate cervical plexus block', short: 'Superficial', desc: 'Carotid, thyroid and neck surgery.', block: byId.scp },
    { id: 'ch-dcp', title: 'Deep cervical plexus block', short: 'Deep', desc: 'C2–C4 roots. Rarely needed; know the risks.', block: byId.dcp },
  ],
  refs: REFS,
  refsIntro: 'Technique and doses follow the department’s teaching notes. Where the notes do not give a value, it comes from the sources below and is cited where it is used.',
  synonyms: [['scm', 'sternocleidomastoid'], ['cea', 'carotid endarterectomy'], ['erb', 'erbs']],
});
