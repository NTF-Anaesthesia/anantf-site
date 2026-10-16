// Thigh and amputation page: wires the shared regional shell (shared/regional) to this page's chapters and data.
import { bootPage } from '../../../shared/regional/js/shell.js';
import { BLOCKS } from './blocks.js?v=20261016';
import { renderAnatomy } from './anatomy.js?v=20261015';
import { renderAmputation, renderCombinations } from './planner.js?v=20261016';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Thigh and amputation blocks',
  eyebrow: 'Regional anaesthesia · Lower-limb blocks',
  backLabel: 'See all lower-limb blocks and the operation chooser',
  backShort: 'Lower-limb blocks',
  backHref: '../',
  lead: 'The sciatic nerve high in the thigh, the posterior femoral cutaneous nerve beside it, and how to put the whole leg to sleep without a spinal: above- and below-knee amputations under nerve blocks, with the dose counted.',
  searchPlaceholder: 'Search, e.g. AKA, PFCN',
  tiles: [
    { title: 'Find the sciatic nerve in the buttock', desc: 'Two bones, one oval: the subgluteal scan', href: '#sciatic-step-scan' },
    { title: 'Choose the level', desc: 'Parasacral to popliteal: what each one catches', href: '#th-levels' },
    { title: 'Block a patient who cannot turn', desc: 'Anterior approach, supine', href: '#sciatic-ap-ant' },
    { title: 'Catch the back of the thigh', desc: 'The posterior femoral cutaneous nerve', href: '#sciatic-pfcn' },
    { title: 'Plan an above-knee amputation', desc: 'Five nerves, one dose budget', href: '#th-plan-op-aka' },
    { title: 'Plan a below-knee amputation', desc: 'Popliteal + saphenous: 100 mg', href: '#th-plan-op-bka' },
    { title: 'Phantom limb pain and catheters', desc: 'What catheters do and don’t do; treating established pain', href: '#th-amp-catheters' },
    { title: 'Add up a block combination', desc: 'Every lower-limb operation in one table', href: '#ch-combinations' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: the sciatic nerve and who supplies the thigh', short: 'Anatomy', desc: 'From the pelvis to the knee, level by level; the posterior femoral cutaneous nerve; the five nerves of the thigh.', render: renderAnatomy },
    { id: 'ch-sciatic', title: 'Subgluteal sciatic block', short: 'Sciatic', desc: 'The gluteal crease, with transgluteal, parasacral and anterior approaches and the posterior femoral cutaneous nerve.', block: byId.sciatic },
    { id: 'ch-amputation', title: 'Amputation planner', short: 'Amputation', desc: 'Above- and below-knee amputation under nerve blocks in the sick patient: which nerves, what dose, catheters and phantom pain.', render: renderAmputation },
    { id: 'ch-combinations', title: 'Block combinations for the whole lower limb', short: 'Combinations', desc: 'Operation, blocks and total dose for every lower-limb operation, linked to each block.', render: renderCombinations },
  ],
  synonyms: [
    ['sciatic', 'subgluteal', 'transgluteal', 'gluteal', 'infragluteal', 'labat'],
    ['parasacral', 'sacral plexus', 'psps', 'parallel shift'],
    ['pfcn', 'posterior femoral cutaneous', 'posterior cutaneous nerve of the thigh'],
    ['aka', 'above knee amputation', 'above-knee amputation', 'transfemoral'],
    ['bka', 'below knee amputation', 'below-knee amputation', 'transtibial'],
    ['through knee', 'knee disarticulation'],
    ['phantom', 'phantom limb pain', 'stump pain', 'residual limb pain'],
    ['lfcn', 'lateral femoral cutaneous', 'lateral cutaneous nerve of the thigh'],
    ['obturator', 'adductor'],
    ['tourniquet', 'cuff', 'thigh cuff'],
    ['dose', 'maximum dose', 'last', 'toxicity', 'mg/kg'],
    ['combination', 'combinations', 'which block'],
  ],
});
