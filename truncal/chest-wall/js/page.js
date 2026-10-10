// Chest wall page: wires the shared shell to this page's chapters and data.
import { bootPage } from '../../shared/js/shell.js';
import { BLOCKS, REFS } from './blocks.js';
import { renderAnatomy } from './anatomy.js';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Chest wall blocks',
  eyebrow: 'Regional anaesthesia · Truncal blocks',
  lead: 'Serratus anterior plane, PECS I and II, and parasternal blocks: which branch of the intercostal nerve each one reaches, how to see the planes, and what each block covers.',
  searchPlaceholder: 'Search, e.g. serratus, PECS, sternum, dose',
  tiles: [
    { title: 'Cover a mastectomy', desc: 'PECS II: interpectoral and pectoserratus', href: '#ch-pecs' },
    { title: 'See the two-stage PECS II', desc: 'Second injection with the first already in', href: '#pecs-inj-ps' },
    { title: 'Cover anterolateral rib fractures', desc: 'Serratus anterior plane catheter', href: '#sap-ribs' },
    { title: 'Practise the serratus needle path', desc: 'Scan viewer, superficial or deep', href: '#sap-step-needle' },
    { title: 'Cover the sternum or medial breast', desc: 'Parasternal blocks, in brief', href: '#ch-parasternal' },
    { title: 'Understand the nerve supply', desc: 'Why serratus and PECS miss the sternum', href: '#anat-why' },
    { title: 'Choose a block for a chest operation', desc: 'Levels from the teaching slides, and options', href: '#anat-choose' },
    { title: 'Practise for the viva', desc: 'Practice questions with model answers', href: '#sap-exam' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: chest wall innervation', short: 'Anatomy', desc: 'Lateral and anterior cutaneous branches, the muscle nerves, and which block for which operation.', render: renderAnatomy },
    { id: 'ch-sap', title: 'Serratus anterior plane block', short: 'Serratus', desc: 'Superficial and deep, at the 5th rib. Rib fractures.', block: byId.sap },
    { id: 'ch-pecs', title: 'PECS I and PECS II', short: 'PECS', desc: 'Interpectoral and pectoserratus plane blocks, two-stage injection. Mastectomy.', block: byId.pecs },
    { id: 'ch-parasternal', title: 'Parasternal intercostal plane blocks', short: 'Parasternal', desc: 'Superficial and deep (transversus thoracis plane), in brief. Sternotomy.', block: byId.parasternal },
  ],
  refs: REFS,
  refsIntro: 'The teaching slides have few chest wall values (slides 127 and 147). Everything else is taken from the sources below and cited where it is used. Exam questions on this page are practice questions, not from the teaching slides.',
  synonyms: [
    ['interpectoral', 'pecs i', 'pecs 1', 'pecs1'],
    ['pectoserratus', 'pecs ii', 'pecs 2', 'pecs2'],
    ['parasternal', 'pecto-intercostal', 'pifb', 'spip', 'dpip', 'parasternal intercostal'],
    ['internal thoracic', 'internal mammary', 'ita', 'ima'],
    ['clavipectoral', 'clavicle', 'clavicle fracture'],
    ['thoracodorsal', 'latissimus dorsi', 'ld'],
    ['breast', 'mastectomy', 'axillary clearance', 'sentinel node'],
  ],
});
