// Knee blocks page: wires the shared regional shell (shared/regional) to this page's chapters and data.
import { bootPage } from '../../../shared/regional/js/shell.js';
import { BLOCKS } from './blocks.js?v=20261015';
import { renderAnatomy } from './anatomy.js?v=20261015';
import { renderStrategy } from './strategy.js?v=20261015';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Knee blocks',
  eyebrow: 'Regional anaesthesia · Lower-limb blocks',
  backLabel: 'See all lower-limb blocks and the operation chooser',
  backShort: 'Lower-limb blocks',
  backHref: '../',
  lead: 'Femoral triangle and adductor canal, iPACK, genicular and obturator blocks: who supplies which part of the knee, how to reach each nerve without weakening the leg, and how to combine them for a knee replacement.',
  searchPlaceholder: 'Search, e.g. adductor canal, iPACK, TKR, TURBT, dose',
  tiles: [
    { title: 'Plan a knee replacement', desc: 'Plan builder: coverage and motor cost', href: '#kn-plan' },
    { title: 'Do an adductor canal block', desc: 'Scan to the apex, needle, 10 ml', href: '#adductor-canal-step-scan' },
    { title: 'Cover the TKR incision too', desc: 'Three targets from one entry', href: '#adductor-canal-tkr' },
    { title: 'Treat posterior knee pain', desc: 'iPACK without foot drop', href: '#ch-ipack' },
    { title: 'Block the genicular nerves', desc: 'Three targets on the bone', href: '#ch-genicular' },
    { title: 'Stop the obturator jerk', desc: 'TURBT: why spinal isn’t enough', href: '#obturator-turbt' },
    { title: 'Understand knee innervation', desc: 'Four quadrants and the popliteal plexus', href: '#kn-anat-front' },
    { title: 'Prepare for the OSCE', desc: 'Adductor canal station with model answers', href: '#adductor-canal-exam' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: who supplies the knee', short: 'Anatomy', desc: 'Femoral branches down the thigh, the four quadrants of the capsule, the popliteal plexus, the skin.', render: renderAnatomy },
    { id: 'ch-strategy', title: 'The motor-sparing knee', short: 'Plan', desc: 'Femoral versus adductor canal, infiltration, iPACK and genicular blocks; an interactive plan builder.', render: renderStrategy },
    { id: 'ch-adductor-canal', title: 'Femoral triangle and adductor canal block', short: 'Adductor canal', desc: 'Saphenous and nerve to vastus medialis; the three-target TKR technique. MMed OSCE 2023.', block: byId['adductor-canal'] },
    { id: 'ch-ipack', title: 'iPACK block', short: 'iPACK', desc: 'The posterior capsule, between the popliteal artery and the femur.', block: byId.ipack },
    { id: 'ch-genicular', title: 'Genicular nerve blocks', short: 'Genicular', desc: 'The anterior capsule quadrants, on the bone beside the genicular arteries.', block: byId.genicular },
    { id: 'ch-obturator', title: 'Obturator nerve block', short: 'Obturator', desc: 'Proximal and distal approaches; the obturator jerk in TURBT; posteromedial knee pain.', block: byId.obturator },
  ],
  synonyms: [
    ['acb', 'adductor canal', 'subsartorial', 'hunter', 'hunters canal', 'saphenous'],
    ['ftb', 'femoral triangle', 'apex'],
    ['tkr', 'tka', 'total knee', 'knee replacement', 'arthroplasty', 'knee arthroplasty'],
    ['ipack', 'popliteal artery capsule', 'interspace between the popliteal artery', 'posterior capsule', 'posterior knee'],
    ['genicular', 'smgn', 'slgn', 'imgn', 'ilgn', 'geniculate', 'radiofrequency', 'rfa'],
    ['nvm', 'nerve to vastus medialis', 'vastus medialis'],
    ['afcn', 'anterior femoral cutaneous', 'intermediate femoral cutaneous', 'medial femoral cutaneous', 'ifcn', 'mfcn'],
    ['obturator', 'onb', 'obturator jerk', 'adductor spasm', 'adductor jerk'],
    ['turbt', 'bladder tumour', 'bladder tumor', 'transurethral resection'],
    ['lia', 'infiltration', 'periarticular', 'local infiltration analgesia', 'pai'],
    ['vam', 'vastoadductor membrane'],
    ['prospect', 'guideline', 'evidence'],
    ['acl', 'anterior cruciate', 'cruciate ligament'],
  ],
});
