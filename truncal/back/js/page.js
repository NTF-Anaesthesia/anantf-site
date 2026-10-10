// Back page: wires the shared shell to this page's chapters and data.
import { bootPage } from '../../shared/js/shell.js';
import { BLOCKS, REFS } from './blocks.js';
import { renderAnatomy, renderLandmark, renderLevels } from './anatomy.js';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Back blocks',
  eyebrow: 'Regional anaesthesia · Truncal blocks',
  lead: 'Erector spinae plane and thoracic paravertebral blocks: the anatomy of the paravertebral space, how to find the level, what each block covers, and how to do them.',
  searchPlaceholder: 'Search, e.g. ESP, SCTL, T7, dose',
  tiles: [
    { title: 'Cover a thoracotomy or VATS', desc: 'Erector spinae plane block at T5', href: '#ch-esp' },
    { title: 'Get a denser one-sided block', desc: 'Paravertebral block, sagittal in-plane', href: '#ch-pvb' },
    { title: 'Practise the ESP needle path', desc: 'Scan viewer, needle to the T5 transverse process', href: '#esp-step-needle' },
    { title: 'Feel the SCTL pop', desc: 'Paravertebral scan viewer, needle step', href: '#pvb-step-needle' },
    { title: 'Try the MTP variant', desc: 'Mid-point transverse process to pleura', href: '#esp-inj-mtp' },
    { title: 'Find the right level', desc: 'C7, tip of the scapula T7, counting ribs', href: '#anat-count' },
    { title: 'Choose levels for an operation', desc: 'Teaching slide table: levels and single-shot level', href: '#ch-levels' },
    { title: 'Prepare for the OSCE', desc: 'Name A–E, ESP and paravertebral questions', href: '#anat-exam' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'The paravertebral space and counting levels', short: 'Anatomy', desc: 'Borders and contents, where each block puts the local anaesthetic, finding the level. Exam: name A–E.', render: renderAnatomy },
    { id: 'ch-esp', title: 'Erector spinae plane block', short: 'ESP', desc: 'Parasagittal at T5, with the MTP variant. MMed OSCE 2025.', block: byId.esp },
    { id: 'ch-pvb', title: 'Paravertebral block: sagittal in-plane', short: 'PVB sagittal', desc: 'Under the SCTL, caudal to cranial. MMed OSCE 2020.', block: byId.pvb },
    { id: 'ch-pvbt', title: 'Paravertebral block: transverse in-plane', short: 'PVB transverse', desc: 'Under the internal intercostal membrane.', block: byId.pvbt },
    { id: 'ch-pvblm', title: 'Paravertebral block: landmark technique', short: 'PVB landmark', desc: 'Tuohy, transverse process at about 4 cm, pop and loss of resistance.', render: renderLandmark },
    { id: 'ch-levels', title: 'Which level for which operation', short: 'Levels', desc: 'The teaching slides’ level table for blocks done from the back.', render: renderLevels },
  ],
  refs: REFS,
  refsIntro: 'Most values come from the department’s teaching slides (reference 1). Values the teaching slides do not give are taken from the sources below and cited where they are used.',
});
