// Hip blocks page: wires the shared regional shell (shared/regional) to this page's chapters and data.
import { bootPage } from '../../../shared/regional/js/shell.js';
import { BLOCKS } from './blocks.js?v=20261015';
import { renderAnatomy } from './anatomy.js?v=20261015';
import { renderPathway } from './pathway.js?v=20261015';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Hip blocks',
  eyebrow: 'Regional anaesthesia · Lower-limb blocks',
  backLabel: 'See all lower-limb blocks and the operation chooser',
  backShort: 'Lower-limb blocks',
  backHref: '../',
  lead: 'PENG, supra-inguinal fascia iliaca, femoral and LFCN blocks: which branch of the lumbar plexus each one catches, how to see it, and how to build the hip fracture pathway around them.',
  searchPlaceholder: 'Search, e.g. PENG, fascia iliaca, hemiarthroplasty, dose',
  tiles: [
    { title: 'Block a hip fracture in the ED', desc: 'Supra-inguinal fascia iliaca: scan, needle, 40 ml', href: '#ch-fib' },
    { title: 'Plan a hemiarthroplasty or THA', desc: 'PENG + LFCN: joint and incision, quadriceps spared', href: '#ch-peng' },
    { title: 'Choose a block for the fracture', desc: 'Intracapsular, intertrochanteric, subtrochanteric', href: '#hp-fx' },
    { title: 'Get the patient sitting for spinal', desc: 'Block 20–30 minutes before positioning', href: '#hp-path-steps' },
    { title: 'Practise the PENG needle path', desc: 'Scan viewer: under the psoas tendon to bone', href: '#peng-step-needle' },
    { title: 'Compare supra- and infra-inguinal', desc: 'Where the fluid goes and why it matters', href: '#fib-infra' },
    { title: 'Understand hip joint innervation', desc: 'Femoral, obturator, accessory obturator, posterior', href: '#hp-anat-hip' },
    { title: 'Prepare for the OSCE', desc: 'Femoral and fascia iliaca stations with model answers', href: '#fib-exam' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: the lumbar plexus and the hip', short: 'Anatomy', desc: 'Femoral, LFCN and obturator nerves at the groin; who supplies the hip joint; why PENG works.', render: renderAnatomy },
    { id: 'ch-peng', title: 'PENG block', short: 'PENG', desc: 'Anterior hip capsule, quadriceps usually spared. Arthroplasty and fractures.', block: byId.peng },
    { id: 'ch-fib', title: 'Supra-inguinal fascia iliaca block', short: 'Fascia iliaca', desc: 'Femoral + LFCN by volume. Hip fracture. Infra-inguinal comparison. MMed OSCE 2020 and 2024.', block: byId.fib },
    { id: 'ch-femoral', title: 'Femoral nerve block', short: 'Femoral', desc: 'Anterior thigh, femur and knee. MMed OSCE 2020.', block: byId.femoral },
    { id: 'ch-lfcn', title: 'Lateral femoral cutaneous nerve block', short: 'LFCN', desc: 'The lateral thigh: the incision PENG misses. Meralgia paraesthetica.', block: byId.lfcn },
    { id: 'ch-pathway', title: 'Hip fracture: the regional pathway', short: 'Hip fracture', desc: 'ED block, positioning for spinal, block by operation, delirium and early walking.', render: renderPathway },
  ],
  synonyms: [
    ['peng', 'pericapsular', 'pericapsular nerve group'],
    ['ficb', 'fascia iliaca', 'sifi', 'sificb', 'fib', 'suprainguinal', 'supra-inguinal'],
    ['lfcn', 'lateral femoral cutaneous', 'lateral cutaneous nerve of the thigh', 'meralgia'],
    ['fnb', 'femoral nerve', '3-in-1', 'three in one'],
    ['nof', 'neck of femur', 'hip fracture', 'fractured neck of femur', 'nof fracture'],
    ['tha', 'thr', 'total hip', 'hip replacement', 'arthroplasty'],
    ['dhs', 'sliding hip screw', 'dynamic hip screw'],
    ['bcis', 'cement', 'bone cement implantation syndrome'],
    ['aiis', 'anterior inferior iliac spine'], ['asis', 'anterior superior iliac spine'], ['ipe', 'iliopubic eminence', 'iliopectineal eminence'],
    ['dcia', 'deep circumflex iliac artery'],
  ],
});
