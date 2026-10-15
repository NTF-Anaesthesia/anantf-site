// Foot and ankle blocks page: wires the shared regional shell (shared/regional) to this page's chapters and data.
import { bootPage } from '../../../shared/regional/js/shell.js';
import { BLOCKS } from './blocks.js?v=20261015';
import { renderAnatomy, renderPlan } from './anatomy.js?v=20261015';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Foot and ankle blocks',
  eyebrow: 'Regional anaesthesia · Lower-limb blocks',
  backLabel: 'See all lower-limb blocks and the operation chooser',
  backShort: 'Lower-limb blocks',
  backHref: '../',
  lead: 'Popliteal sciatic, ankle and saphenous blocks: where the sciatic nerve divides, the five nerves at the ankle, the one femoral branch below the knee, and which cuff each block will tolerate.',
  searchPlaceholder: 'Search, e.g. popliteal, ankle, tourniquet, sural',
  tiles: [
    { title: 'Block for ankle fracture fixation', desc: 'Popliteal + saphenous: 15 ml + 5 ml', href: '#ch-popliteal' },
    { title: 'Find the sciatic bifurcation', desc: 'Scan viewer: crease, artery, follow the tibial nerve up', href: '#popliteal-step-scan' },
    { title: 'Do an ankle block for a bunion', desc: 'Five nerves, tibial first: 17 ml 0.5%', href: '#ch-ankle' },
    { title: 'Ankle block without ultrasound', desc: 'Two deep injections, three rings', href: '#ankle-landmark' },
    { title: 'Check the tourniquet', desc: 'Ankle, calf or thigh cuff: what covers it', href: '#fa-anat-tq' },
    { title: 'Fill the medial gap', desc: 'Saphenous beside the vein, below the knee', href: '#ch-saphenous' },
    { title: 'Choose the block for the operation', desc: 'Forefoot to below-knee amputation', href: '#ch-plan' },
    { title: 'Prepare for the OSCE', desc: 'Popliteal and ankle stations with model answers', href: '#popliteal-exam' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: the sciatic branches and the foot', short: 'Anatomy', desc: 'Where the sciatic nerve divides; the five nerves at the ankle; tourniquets; foot drop, falls and the numb heel.', render: renderAnatomy },
    { id: 'ch-popliteal', title: 'Popliteal sciatic block', short: 'Popliteal', desc: 'Everything below the knee except the saphenous strip. Calf cuff with a saphenous block. MMed OSCE 2022 and 2025.', block: byId.popliteal },
    { id: 'ch-ankle', title: 'Ankle block', short: 'Ankle', desc: 'Five nerves, ultrasound and landmark. The foot, leg muscles spared. MMed OSCE 2023.', block: byId.ankle },
    { id: 'ch-saphenous', title: 'Saphenous nerve block at and below the knee', short: 'Saphenous', desc: 'The medial leg and ankle: beside the vein, the landmark field block, the distal adductor canal.', block: byId.saphenous },
    { id: 'ch-plan', title: 'Plan by operation', short: 'Plan', desc: 'Forefoot, midfoot, ankle, Achilles, below-knee amputation, diabetic foot.', render: renderPlan },
  ],
  synonyms: [
    ['popliteal', 'psnb', 'popliteal sciatic', 'sciatic'],
    ['vloka', 'paraneural', 'sheath', 'subparaneural'],
    ['cpn', 'common peroneal', 'common fibular'],
    ['dpn', 'deep peroneal', 'deep fibular'],
    ['spn', 'superficial peroneal', 'superficial fibular'],
    ['ptn', 'tibial', 'posterior tibial'],
    ['gsv', 'great saphenous', 'long saphenous'],
    ['ssv', 'small saphenous', 'short saphenous'],
    ['tourniquet', 'cuff', 'esmarch'],
    ['bunion', 'hallux valgus', 'forefoot'],
    ['bka', 'below knee amputation', 'below-knee amputation'],
    ['orif', 'fracture fixation', 'ankle fracture'],
    ['foot drop', 'falls', 'weakness'],
  ],
});
