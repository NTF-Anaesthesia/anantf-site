/* Lower-limb operations: the data behind the "Which block for which operation" chooser on /lower-limb/ and the merged
   chooser on /blocks/. Data only, plus lowerLimbCoverageMap(), the leg figure the chooser draws for an operation.
   Doses are the ones used on the block pages (Dr Chew Shi Hao's for his blocks; literature doses for the newer ones).
   No sources or references are shown on the page.

   Schema (one entry per operation):
     id       deep link #op-<id> on the lower-limb landing
     region   OP_REGIONS key: the group the chooser lists it under
     name     chooser label and result title
     line     "In one line" summary
     cover    area to cover (words)          tq   tourniquet note (optional)
     map      {views?, areas: [{zones, density}]}: leg.js zones; dense = core, moderate = often involved (optional)
     groups   [{label, items: [{name, dose?, blocks?: [LINKS key], why?}]}]; a label starting "Not" is shown as not recommended
     misses   [text]       notes  [text]       more  [LINKS key]: extra links under the result
   Links are relative to the region folder (REGION.path); blockHref(key, base) adds a base. */
import { legCoverageMap } from '../figures/leg.js';

export const REGION = { id: 'lower-limb', title: 'Lower-limb blocks', path: 'lower-limb/' };

/* Where each block lives: [href, link text, page name]. */
export const LINKS = {
  peng: ['hip/#ch-peng', 'PENG block', 'hip'],
  fib: ['hip/#ch-fib', 'supra-inguinal fascia iliaca block', 'hip'],
  fibinfra: ['hip/#fib-infra', 'infra-inguinal fascia iliaca', 'hip'],
  femoral: ['hip/#ch-femoral', 'femoral nerve block', 'hip'],
  lfcn: ['hip/#ch-lfcn', 'LFCN block', 'hip'],
  hipfx: ['hip/#hp-fx', 'fracture chooser', 'hip'],
  hipsteps: ['hip/#hp-path-steps', 'hip fracture pathway', 'hip'],
  acb: ['knee/#ch-adductor-canal', 'adductor canal block', 'knee'],
  tkr3: ['knee/#adductor-canal-tkr', 'three-target technique', 'knee'],
  ipack: ['knee/#ch-ipack', 'iPACK block', 'knee'],
  gen: ['knee/#ch-genicular', 'genicular nerve blocks', 'knee'],
  obt: ['knee/#ch-obturator', 'obturator nerve block', 'knee'],
  turbt: ['knee/#obturator-turbt', 'obturator jerk', 'knee'],
  kplan: ['knee/#kn-plan', 'knee plan builder', 'knee'],
  kops: ['knee/#kn-st-ops', 'knee operations table', 'knee'],
  pop: ['foot-ankle/#ch-popliteal', 'popliteal sciatic block', 'foot and ankle'],
  ankle: ['foot-ankle/#ch-ankle', 'ankle block', 'foot and ankle'],
  anklelm: ['foot-ankle/#ankle-landmark', 'landmark ankle block', 'foot and ankle'],
  saph: ['foot-ankle/#ch-saphenous', 'saphenous block below the knee', 'foot and ankle'],
  tq: ['foot-ankle/#fa-anat-tq', 'tourniquet guide', 'foot and ankle'],
  heel: ['foot-ankle/#fa-anat-heel', 'numb heel care', 'foot and ankle'],
  sci: ['thigh/#ch-sciatic', 'subgluteal sciatic block', 'thigh'],
  tg: ['thigh/#sciatic-ap-tg', 'transgluteal sciatic approach', 'thigh'],
  pfcn: ['thigh/#sciatic-pfcn', 'posterior femoral cutaneous nerve', 'thigh'],
  amp: ['thigh/#ch-amputation', 'amputation planner', 'thigh'],
  combos: ['thigh/#ch-combinations', 'block combinations table', 'thigh'],
};

/* Regions group the operations in the chooser. */
export const OP_REGIONS = [
  ['hip', 'Hip and thigh'],
  ['knee', 'Knee and leg'],
  ['foot', 'Ankle and foot'],
  ['amp', 'Amputation'],
  ['other', 'Other'],
];

export const OPS = [
  // ------------------------------------------------------------------ hip and thigh
  {
    id: 'hipfx', region: 'hip', name: 'Hip fracture: emergency department and positioning for spinal',
    line: 'Fascia iliaca (or femoral) block on arrival; give or repeat a block 20–30 minutes before you sit the patient up for the spinal.',
    cover: 'The fracture and the hip joint (anterior capsule) and the femur: pain on movement, not just at rest.',
    map: { views: ['front'], areas: [{ zones: ['hip-ant', 'femur'], density: 'dense' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Supra-inguinal fascia iliaca block', dose: '40 ml of 0.2% ropivacaine (80 mg), in 5 ml aliquots', blocks: ['fib'], why: 'Femoral nerve and LFCN by volume: the hip, the femur and the lateral thigh. Can be done after a general anaesthetic or in the emergency department by trained staff.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Femoral nerve block', dose: '15 ml of 0.4% ropivacaine (60 mg)', blocks: ['femoral'], why: 'Superficial and compressible: a sensible choice on anticoagulants. Misses the LFCN.' },
        { name: 'PENG block', dose: '20 ml of 0.2% ropivacaine (40 mg)', blocks: ['peng'], why: 'Eases pain on movement with the quadriceps spared; best suited to neck of femur fractures going for arthroplasty.' },
        { name: 'Infra-inguinal fascia iliaca block', blocks: ['fibinfra'], why: 'The simpler emergency department version: less cranial spread, so the LFCN is less reliably reached.' },
      ] },
    ],
    misses: [
      'The obturator nerve: no fascia iliaca or femoral approach blocks it reliably.',
      'The posterior capsule (sacral plexus branches): some pain on movement often remains, so check before you position.',
    ],
    notes: [
      'Give the block 20–30 minutes before moving the patient: sitting, or lateral with the fractured side down for a unilateral spinal, becomes tolerable.',
      'A small titrated dose of a short-acting analgesic is better than heavy sedation for positioning.',
      'Repeat a block at surgery if at least 6 hours have passed since the first one, and count both doses towards the total.',
      'In dementia, use an observational pain score and still block: under-treated pain adds to delirium.',
    ],
    more: ['hipsteps', 'hipfx'],
  },
  {
    id: 'hemi', region: 'hip', name: 'Hemiarthroplasty (displaced intracapsular fracture)',
    line: 'PENG + LFCN: the joint and the incision, with the quadriceps kept for standing the next day.',
    cover: 'The anterior hip capsule, the lateral thigh incision (anterolateral approach) or the buttock (posterior approach), and the femoral canal.',
    map: { areas: [{ zones: ['hip-ant', 'lfcn'], density: 'dense' }, { zones: ['femur'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'PENG + LFCN blocks', dose: 'PENG 20 ml + LFCN 5 ml of 0.2% ropivacaine: 25 ml, 50 mg', blocks: ['peng', 'lfcn'], why: 'PENG works for neck of femur and intertrochanteric fractures, and suits a bipolar hemiarthroplasty better than fixation, where the pain is lower down the femur.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Supra-inguinal fascia iliaca block', dose: '40 ml of 0.2% ropivacaine (80 mg)', blocks: ['fib'], why: 'Covers the joint and the lateral thigh in one injection, but weakens the quadriceps.' },
        { name: 'Posterior approach: the surgeon’s infiltration', why: 'Ask for infiltration of the posterior capsule and the wound; neither PENG nor fascia iliaca reaches them.' },
      ] },
    ],
    misses: [
      'PENG: the skin (hence the LFCN block), the posterior capsule, and the obturator branches inconsistently.',
      'LFCN: the upper end of a lateral incision over the trochanter (subcostal and iliohypogastric branches) and buttock skin.',
    ],
    notes: [
      'Cemented stem: brief the team for bone cement implantation syndrome and have a vasopressor drawn up.',
      'After PENG + LFCN the quadriceps usually still works: check it before the first stand, because spread to the femoral nerve can happen.',
    ],
    more: ['hipfx'],
  },
  {
    id: 'tha', region: 'hip', name: 'Total hip replacement',
    line: 'PENG + LFCN or the surgeon’s infiltration, with paracetamol, an NSAID and dexamethasone. Not a femoral nerve block.',
    cover: 'The hip joint and the incision: lateral thigh for anterolateral and direct lateral approaches, buttock for a posterior approach.',
    map: { areas: [{ zones: ['hip-ant', 'lfcn'], density: 'dense' }, { zones: ['hip-post'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'PENG + LFCN blocks', dose: '25 ml of 0.2% ropivacaine (50 mg) in total', blocks: ['peng', 'lfcn'], why: 'Motor-sparing; in pooled trials similar to the surgeon’s infiltration for pain and opioid use.' },
        { name: 'Or the surgeon’s local infiltration', why: 'PROSPECT recommends fascia iliaca block or local infiltration analgesia, with paracetamol, an NSAID and IV dexamethasone.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Supra-inguinal fascia iliaca block', dose: '40 ml of 0.2% ropivacaine (80 mg)', blocks: ['fib'], why: 'Recommended by PROSPECT, but the quadriceps weakness can delay walking and cause falls.' },
      ] },
      { label: 'Not recommended', items: [
        { name: 'Femoral nerve block', blocks: ['femoral'], why: 'Quadriceps weakness and falls outweigh the benefit for hip replacement.' },
      ] },
    ],
    misses: [
      'A posterior approach: the posterior capsule (nerve to quadratus femoris, sciatic and superior gluteal branches) and buttock skin. Infiltration covers these.',
      'If the surgeon infiltrates as well, count every milligram: infiltration doses are often large.',
    ],
    notes: [
      'For day-case or enhanced recovery hip replacement, a strong quadriceps matters more than a few points on the pain score.',
    ],
  },
  {
    id: 'dhs', region: 'hip', name: 'Dynamic hip screw or intramedullary nail (extracapsular fracture)',
    line: 'Supra-inguinal fascia iliaca: the femoral nerve and LFCN cover the lateral thigh wound and most of the femur.',
    cover: 'The lateral thigh incision (LFCN), the femur and the fracture site, below the hip capsule.',
    map: { views: ['front'], areas: [{ zones: ['lfcn', 'femur'], density: 'dense' }, { zones: ['hip-ant'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Supra-inguinal fascia iliaca block', dose: '40 ml of 0.2% ropivacaine (80 mg)', blocks: ['fib'], why: 'One injection for the wound and the bone.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Femoral + LFCN blocks', dose: 'Femoral 15 ml of 0.4% (60 mg) + LFCN 5 ml of 0.2% (10 mg)', blocks: ['femoral', 'lfcn'], why: 'Two smaller, more targeted injections; the femoral part suits a subtrochanteric fracture or a long nail.' },
        { name: 'PENG before surgery', dose: '20 ml of 0.2% ropivacaine (40 mg)', blocks: ['peng'], why: 'Eases pain on movement for an intertrochanteric fracture, as fluid can spread down over the front of the joint. On its own it is not enough for fixation, and not for a subtrochanteric fracture.' },
      ] },
    ],
    misses: [
      'The nail entry wound above the greater trochanter (subcostal and iliohypogastric skin, gluteal muscle): ask for infiltration.',
      'The back of the femur (sciatic) and the medial side (obturator): analgesia is good but rarely complete.',
    ],
    notes: [
      'Extracapsular fractures bleed more than intracapsular ones, and subtrochanteric nails take longer.',
      'The quadriceps is weak after fascia iliaca or femoral blocks: check strength before the first stand.',
    ],
    more: ['hipfx'],
  },
  {
    id: 'femshaft', region: 'hip', name: 'Femoral shaft fracture',
    line: 'Femoral nerve block in the emergency department: superficial, fast, and it settles the quadriceps spasm.',
    cover: 'The femoral shaft (mostly femoral nerve; the back of the bone is sciatic, the medial side obturator) and the anterior thigh.',
    map: { views: ['front'], areas: [{ zones: ['femur'], density: 'dense' }, { zones: ['femoral-ant'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Femoral nerve block', dose: '15 ml of 0.4% ropivacaine (60 mg), in 5 ml aliquots', blocks: ['femoral'], why: 'Relaxes the spasm that makes splinting and traction so painful.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Supra-inguinal fascia iliaca block', dose: '40 ml of 0.2% ropivacaine (80 mg)', blocks: ['fib'], why: 'Adds the lateral thigh, where the nail and locking screw incisions are.' },
      ] },
    ],
    misses: [
      'The back of the femur (sciatic) and the medial side (obturator): expect good, not complete, analgesia.',
      'The nail entry point above the greater trochanter.',
    ],
    notes: [
      'Polytrauma: check the clotting first; the femoral site is compressible.',
      'Document the neurological examination of the leg before you block.',
    ],
  },
  // ------------------------------------------------------------------ knee and leg
  {
    id: 'tkr', region: 'knee', name: 'Total knee replacement',
    line: 'Adductor canal (or distal femoral triangle) block + the surgeon’s periarticular infiltration: the PROSPECT default.',
    cover: 'The whole knee joint (four anterior quadrants and the posterior capsule) and the midline incision.',
    map: { areas: [{ zones: ['knee-ant', 'knee-post', 'saphenous-knee'], density: 'dense' }, { zones: ['femoral-ant'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Adductor canal block, single shot, + periarticular infiltration', dose: '10 ml of 0.4% ropivacaine (40 mg), plus the surgeon’s dose', blocks: ['acb'], why: 'Saphenous nerve (and, higher up, the nerve to vastus medialis) with the quadriceps largely spared; the infiltration covers the rest of the joint for the first hours.' },
      ] },
      { label: 'No infiltration', items: [
        { name: 'Three-target femoral triangle technique + iPACK', dose: '25 ml of 0.2% (50 mg) + 20 ml of 0.2% (40 mg): 90 mg', blocks: ['tkr3', 'ipack'], why: 'The three targets cover the saphenous nerve, the nerve to vastus medialis and the incision skin; iPACK covers the back of the knee.' },
        { name: 'Add genicular nerve blocks', dose: '4–5 ml of 0.2% ropivacaine per target', blocks: ['gen'], why: 'For the lateral quadrants, which the canal blocks miss.' },
      ] },
      { label: 'Not recommended', items: [
        { name: 'Femoral nerve block or sciatic block', blocks: ['femoral', 'sci'], why: 'Femoral: a weak quadriceps and falls. Sciatic: foot drop that can hide a surgical peroneal nerve injury.' },
      ] },
    ],
    misses: [
      'Adductor canal: the superolateral knee (nerves to vastus lateralis and intermedius, superolateral genicular nerve).',
      'The midline incision skin (intermediate and medial femoral cutaneous nerves), unless you add the third, superficial target.',
      'The posterior capsule: iPACK or infiltration.',
    ],
    tq: 'A thigh cuff, if used, is covered by the spinal or general anaesthetic, not by these blocks.',
    notes: [
      'Count every milligram, including the surgeon’s infiltration (often 300 mg of ropivacaine or more on its own).',
      'Too much volume or too proximal an injection weakens the quadriceps; go more distal to spare vastus medialis.',
      'Intrathecal morphine (100 micrograms) only if neither the block nor infiltration is possible (PROSPECT).',
    ],
    more: ['kplan'],
  },
  {
    id: 'acl', region: 'knee', name: 'ACL reconstruction',
    line: 'Adductor canal block + infiltration. A hamstring graft hurts partly outside the block.',
    cover: 'The knee joint and the bone tunnels; the graft site (hamstring: the pes anserinus wound and the posteromedial thigh; patellar tendon: the front of the knee).',
    map: { areas: [{ zones: ['knee-ant', 'saphenous-knee'], density: 'dense' }, { zones: ['knee-post'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Adductor canal block + the surgeon’s infiltration', dose: '10 ml of 0.4% ropivacaine (40 mg)', blocks: ['acb'], why: 'Motor-sparing, so it suits day-case surgery and early rehabilitation.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Distal femoral triangle block', blocks: ['acb'], why: 'Adds the nerve to vastus medialis for more anteromedial cover; a little more risk to vastus medialis strength.' },
        { name: 'Femoral nerve block', blocks: ['femoral'], why: 'Denser, but quadriceps weakness slows rehabilitation and risks falls: rarely chosen now.' },
      ] },
    ],
    misses: [
      'The hamstring tendon-stripping track in the posteromedial thigh: semitendinosus is sciatic, gracilis is obturator.',
      'The infrapatellar branch can be cut by the incision, leaving a numb patch whatever you do.',
      'The lateral knee.',
    ],
    tq: 'A thigh cuff is covered by the spinal or general anaesthetic.',
    notes: ['Expect some breakthrough pain with a hamstring graft: plan infiltration and multimodal analgesia.'],
  },
  {
    id: 'arthro', region: 'knee', name: 'Knee arthroscopy',
    line: 'Usually no block: intra-articular local anaesthetic and port infiltration by the surgeon.',
    cover: 'The portals and the joint; the pain is usually mild.',
    map: { views: ['front'], areas: [{ zones: ['knee-ant'], density: 'moderate' }] },
    groups: [
      { label: 'Usual choice', items: [
        { name: 'Intra-articular local anaesthetic and port infiltration', why: 'Enough for most diagnostic and simple arthroscopies.' },
      ] },
      { label: 'If more is needed', items: [
        { name: 'Adductor canal block', dose: '10 ml of 0.4% ropivacaine (40 mg)', blocks: ['acb'], why: 'For bigger procedures (meniscal repair, cartilage work) or unexpected pain in recovery; it keeps the quadriceps.' },
      ] },
    ],
    misses: ['Infiltration lasts hours, not a day.', 'The adductor canal block misses the lateral portal and the lateral knee.'],
    tq: 'A thigh cuff, if used, is covered by the spinal or general anaesthetic.',
    notes: ['Day surgery: a block that weakens the leg can delay discharge.'],
    more: ['kops'],
  },
  {
    id: 'tendon', region: 'knee', name: 'Patellar or quadriceps tendon repair',
    line: 'Femoral nerve block covers it best; the knee is braced in extension afterwards, but warn about falls.',
    cover: 'The front of the knee and the lower thigh: the patella, the tendon and the midline incision.',
    map: { views: ['front'], areas: [{ zones: ['knee-ant', 'saphenous-knee'], density: 'dense' }, { zones: ['femoral-ant'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Femoral nerve block', dose: '15 ml of 0.4% ropivacaine (60 mg)', blocks: ['femoral'], why: 'The front of the thigh and knee, the patella and the quadriceps tendon.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Three-target femoral triangle technique', dose: '25 ml of 0.2% ropivacaine (50 mg)', blocks: ['tkr3'], why: 'Motor-sparing: the saphenous nerve, the nerve to vastus medialis and the incision skin; less cover laterally.' },
        { name: 'Supra-inguinal fascia iliaca block', dose: '40 ml of 0.2% ropivacaine (80 mg)', blocks: ['fib'], why: 'Adds the lateral thigh for a long or lateral incision.' },
      ] },
    ],
    misses: ['The LFCN (outer edge of a long incision).', 'The back of the knee, which is rarely relevant here.'],
    tq: 'A thigh cuff is covered by the spinal or general anaesthetic.',
    notes: ['Crutches and supervision for the first stand: the quadriceps will not hold the knee for several hours.'],
  },
  {
    id: 'tibia', region: 'knee', name: 'Tibial plateau fixation or tibial nail',
    line: 'Agree the compartment syndrome plan with the surgeon first; then dilute blocks and clear observations.',
    cover: 'The knee joint and proximal tibia (femoral, saphenous and sciatic branches); the tibial shaft (mainly sciatic, with saphenous to the anteromedial surface); the nail entry wound at the patellar tendon.',
    map: { areas: [{ zones: ['tibia', 'knee-ant', 'saphenous-knee'], density: 'dense' }, { zones: ['knee-post', 'saphenous-leg', 'lat-cut-calf'], density: 'moderate' }] },
    groups: [
      { label: 'Usual plan', items: [
        { name: 'Spinal or general anaesthesia, with a femoral or adductor canal block', dose: 'Femoral 15 ml of 0.4% (60 mg) or adductor canal 10 ml of 0.4% (40 mg)', blocks: ['femoral', 'acb'], why: 'The knee and the nail entry point (femoral), or just the saphenous territory and medial wounds (adductor canal).' },
      ] },
      { label: 'Add if agreed', items: [
        { name: 'Popliteal sciatic block', dose: '15 ml of 0.4% ropivacaine (60 mg)', blocks: ['pop'], why: 'The tibia and the posterior knee. Only after discussing compartment syndrome; a more dilute solution keeps the block from hiding new pain for long.' },
      ] },
    ],
    misses: ['Femoral or adductor canal: the back of the knee and most of the tibial shaft (sciatic).', 'Popliteal: the saphenous strip and a thigh cuff.'],
    tq: 'A thigh cuff needs the spinal or general anaesthetic.',
    notes: [
      'Tibial fractures carry the highest risk of compartment syndrome. Pain out of proportion, or new pain breaking through a working block, is compartment syndrome until proved otherwise.',
      'Dilute local anaesthetic without adjuncts, regular trained observation and compartment monitoring do not appear to delay the diagnosis; dense blocks that far outlast surgery are best avoided in high-risk patients.',
    ],
    more: ['kops'],
  },
  // ------------------------------------------------------------------ ankle and foot
  {
    id: 'anklefx', region: 'foot', name: 'Ankle fracture fixation',
    line: 'Popliteal sciatic + saphenous: 15 ml + 5 ml, 85 mg in total. Tolerates a calf cuff.',
    cover: 'The ankle joint and both malleoli: the lateral side and the joint are sciatic; the medial malleolus and medial incision are saphenous.',
    map: { views: ['front', 'back'], areas: [{ zones: ['ankle-joint', 'saphenous-foot', 'sural-foot'], density: 'dense' }, { zones: ['saphenous-leg', 'sup-peroneal-leg'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Popliteal sciatic block + saphenous block below the knee', dose: '15 ml of 0.4% (60 mg) + 5 ml of 0.5% (25 mg): 85 mg', blocks: ['pop', 'saph'], why: 'The whole leg below the knee; the popliteal block covers the joint, because the articular branches leave above the malleoli.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Distal adductor canal block for the saphenous part', dose: '10 ml of 0.4% ropivacaine (40 mg)', blocks: ['acb'], why: 'When the below-knee view of the vein is poor (obesity, varicose veins, oedema).' },
      ] },
      { label: 'Not enough', items: [
        { name: 'Ankle block', blocks: ['ankle'], why: 'The ankle joint branches leave above the injection sites.' },
      ] },
    ],
    misses: ['Popliteal alone: the medial malleolus and the medial incision (saphenous).', 'A thigh tourniquet.'],
    tq: 'Calf cuff: tolerated with popliteal + saphenous. Thigh cuff: needs a spinal or general anaesthetic.',
    notes: [
      'Foot drop and a numb heel: crutches, non-weight-bearing, and float the heel on a pillow under the calf.',
      'Rebound pain the first night: start oral analgesia before the block wears off; IV dexamethasone reduces it.',
      'Trauma: discuss compartment syndrome risk with the surgeon before you block.',
    ],
    more: ['tq', 'heel'],
  },
  {
    id: 'achilles', region: 'foot', name: 'Achilles tendon repair',
    line: 'Popliteal sciatic block; add a saphenous block for a posteromedial incision. Block before turning prone.',
    cover: 'The back of the heel and lower calf: sural and tibial (calcaneal branches); a posteromedial incision edges into saphenous skin.',
    map: { views: ['back'], areas: [{ zones: ['sural', 'calcaneal'], density: 'dense' }, { zones: ['saphenous-foot'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Popliteal sciatic block', dose: '15 ml of 0.4% ropivacaine (60 mg)', blocks: ['pop'], why: 'Tibial and sural territories, including the tendon and the heel.' },
      ] },
      { label: 'Add', items: [
        { name: 'Saphenous block below the knee', dose: '5 ml of 0.5% ropivacaine (25 mg)', blocks: ['saph'], why: 'For a posteromedial incision.' },
      ] },
    ],
    misses: ['The saphenous strip (medial).', 'A thigh tourniquet.'],
    tq: 'A thigh cuff needs a spinal or general anaesthetic.',
    notes: ['Foot drop matters less (the foot is in an equinus cast), but the numb heel still needs protecting.', 'Prone: do the block before turning, or in the prone position.'],
  },
  {
    id: 'hallux', region: 'foot', name: 'Hallux valgus or forefoot surgery',
    line: 'Ankle block, all five nerves, tibial first: 17 ml of 0.5% ropivacaine (85 mg).',
    cover: 'The forefoot skin and the metatarsal bones and joints: the bone is mainly tibial and deep peroneal.',
    map: { views: ['dorsum', 'sole'], areas: [{ zones: ['sup-peroneal', 'deep-peroneal', 'tibial-sole', 'foot-bones'], density: 'dense' }, { zones: ['saphenous-foot'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Ankle block', dose: '17 ml of 0.5% ropivacaine (85 mg): tibial 5 ml, then 3 ml each for the other four', blocks: ['ankle'], why: 'The foot below the malleoli with the leg muscles working: the patient walks on the heel in a post-operative shoe sooner.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Popliteal sciatic + saphenous blocks', dose: '15 ml of 0.4% (60 mg) + 5 ml of 0.5% (25 mg)', blocks: ['pop', 'saph'], why: 'Longer analgesia and a calf cuff, at the cost of foot drop.' },
        { name: 'Landmark ankle block', blocks: ['anklelm'], why: 'Without ultrasound: two deep injections beside the arteries, three subcutaneous rings. More painful and less reliable for the deep nerves.' },
      ] },
    ],
    misses: ['A calf or thigh tourniquet.', 'The heel, if the calcaneal branches leave above the tibial injection.'],
    tq: 'Ankle cuff: usually tolerated with an ankle block for shorter cases. Calf cuff: popliteal + saphenous.',
    notes: [
      'The saphenous territory usually stops at the medial midfoot, so for a bunion it can often be left out; the skin over the first metatarsal is mainly superficial peroneal.',
      'No adrenaline in a digital or web-space block.',
    ],
  },
  {
    id: 'diabfoot', region: 'foot', name: 'Foot debridement, toe or ray amputation',
    line: 'Ankle block or popliteal block: often no general anaesthetic needed in a high-risk patient.',
    cover: 'The part of the foot being operated on; for a ray amputation, the metatarsal as well.',
    map: { views: ['dorsum', 'sole'], areas: [{ zones: ['sup-peroneal', 'deep-peroneal', 'tibial-sole', 'sural-foot', 'foot-bones'], density: 'dense' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Ankle block (or just the nerves for the area)', dose: '17 ml of 0.5% ropivacaine (85 mg) for all five', blocks: ['ankle'], why: 'Leg muscles spared; superficial, compressible sites in an anticoagulated patient.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Popliteal sciatic block (+ saphenous for medial work)', dose: '15 ml of 0.4% (60 mg) + 5 ml of 0.5% (25 mg)', blocks: ['pop', 'saph'], why: 'For heel work, a calf cuff, or infection tracking up the foot.' },
      ] },
    ],
    misses: ['An ankle block misses the heel if the calcaneal branches leave high, and any cuff above the ankle.'],
    tq: 'Usually no tourniquet in vascular patients.',
    notes: [
      'Pre-existing neuropathy: examine and document sensation and power before the block.',
      'Don’t inject through infected tissue; no adrenaline with poor perfusion.',
      'Protect the numb heel and the other foot.',
    ],
    more: ['heel'],
  },
  // ------------------------------------------------------------------ amputation
  {
    id: 'bka', region: 'amp', name: 'Below-knee amputation',
    line: 'Popliteal sciatic + adductor canal: 15 ml + 10 ml of 0.4%, 100 mg in total.',
    cover: 'The tibia, the fibula and every muscle and strip of skin at the cut: the sciatic nerve and the saphenous nerve. The upper back of the calf can be posterior femoral cutaneous.',
    map: { views: ['front', 'back'], areas: [{ zones: ['tibia', 'saphenous-leg', 'lat-cut-calf', 'sural-calf', 'sup-peroneal-leg'], density: 'dense' }, { zones: ['pfcn'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Popliteal sciatic + adductor canal blocks', dose: '15 ml of 0.4% (60 mg) + 10 ml of 0.4% (40 mg): 100 mg', blocks: ['pop', 'acb'], why: 'With a spinal or general anaesthetic, or on their own with sedation in a very sick patient.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Subgluteal sciatic instead of popliteal', dose: '15–20 ml of 0.5% ropivacaine (75–100 mg)', blocks: ['sci', 'pfcn'], why: 'For a long posterior flap, or blocks alone: catches more of the back of the calf and the knee.' },
        { name: 'With a thigh cuff: subgluteal sciatic + femoral + obturator', dose: '15 ml 0.5% + 15 ml 0.4% + 10 ml 0.375%: 172.5 mg', blocks: ['sci', 'femoral', 'obt'], why: 'Every deep nerve of the thigh above the cuff; still tolerated only for a limited time.' },
      ] },
    ],
    misses: ['Popliteal: the posterior femoral cutaneous skin of the upper calf.', 'Adductor canal: the knee, and the anterior thigh under a cuff.'],
    tq: 'Vascular amputations often need no cuff: ask. A thigh cuff needs a spinal, a general anaesthetic or the three-block thigh set.',
    notes: [
      'A surgeon-placed perineural catheter in the sciatic sheath adds days of analgesia.',
      'Count every milligram against a ceiling of about 3 mg/kg of ropivacaine (lean body weight), lower in the frail.',
    ],
    more: ['amp'],
  },
  {
    id: 'aka', region: 'amp', name: 'Above-knee amputation',
    line: 'Five nerves cross a mid-thigh cut: sciatic, posterior femoral cutaneous, femoral, LFCN and obturator.',
    cover: 'The whole circumference of the thigh at the cut and the femur.',
    map: { views: ['front', 'back'], areas: [{ zones: ['femoral-ant', 'lfcn', 'obturator', 'pfcn', 'femur'], density: 'dense' }] },
    groups: [
      { label: 'Blocks alone (sick patient)', items: [
        { name: 'Transgluteal sciatic + femoral + LFCN + obturator', dose: '15 ml 0.5% + 15 ml 0.4% + 5 ml 0.2% + 10 ml 0.375%: 182.5 mg', blocks: ['tg', 'femoral', 'lfcn', 'obt'], why: 'The transgluteal level often catches the posterior femoral cutaneous nerve for the posterior flap, which subgluteal and anterior approaches often miss.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Supra-inguinal fascia iliaca for the femoral nerve and LFCN together', dose: '40 ml of 0.2% ropivacaine (80 mg)', blocks: ['fib'], why: 'One injection instead of two; it does not reliably reach the obturator nerve, so keep the obturator block.' },
        { name: 'Subgluteal sciatic + a separate posterior femoral cutaneous injection', blocks: ['sci', 'pfcn'], why: 'When the transgluteal view is poor.' },
        { name: 'Spinal anaesthesia', why: 'If the patient is not anticoagulated or septic, a spinal with a sciatic or femoral block for analgesia is simpler.' },
      ] },
    ],
    misses: ['A femoral block misses the LFCN and the obturator nerve; a fascia iliaca block misses the obturator.', 'Subgluteal and anterior sciatic approaches often miss the posterior femoral cutaneous nerve.'],
    tq: 'Usually no tourniquet.',
    notes: [
      'Plan sedation as well: almost every patient in published series needed some.',
      'Trim the doses so that four blocks fit under about 3 mg/kg of ropivacaine.',
      'Catheters give analgesia but do not reliably prevent phantom limb pain.',
    ],
    more: ['amp', 'combos'],
  },
  // ------------------------------------------------------------------ other
  {
    id: 'turbt', region: 'other', name: 'TURBT: the obturator jerk',
    line: 'A spinal does not stop the jerk: block the obturator nerve before the resection, or paralyse under general anaesthesia.',
    cover: 'Not skin: the hip adductors on the side of a lateral wall bladder tumour. The resection current stimulates the obturator nerve on the pelvic side wall directly.',
    groups: [
      { label: 'Recommended', items: [
        { name: 'Obturator nerve block (proximal) with a spinal', dose: '10 ml of 0.5% ropivacaine (50 mg)', blocks: ['obt', 'turbt'], why: 'Deep to pectineus, on obturator externus. Block before the resection, not after the first jerk.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'General anaesthesia with neuromuscular blockade', why: 'Reliable; choose by the patient.' },
        { name: 'Surgical measures', why: 'Bipolar resection, a lower current and a less full bladder.' },
      ] },
    ],
    misses: [
      'The spinal: the stimulus is applied to the nerve itself, beyond the roots it blocks.',
      'The hamstring part of adductor magnus (sciatic) keeps some adduction; an accessory obturator nerve can supply pectineus.',
    ],
    notes: [
      'Test the adductors, not the skin: squeezing a blood pressure cuff between the knees is a simple bedside test.',
      'Tell the urologist the block is in, but agree a plan if the leg still moves: the risk is bladder perforation.',
    ],
  },
  {
    id: 'graft', region: 'other', name: 'Skin graft harvest from the lateral thigh',
    line: 'LFCN block: 5 ml of 0.2% ropivacaine, purely sensory, and the patient can walk straight away.',
    cover: 'The donor site on the outer thigh. Mark it with the surgeon: a wide or anterior donor site reaches femoral nerve skin.',
    map: { views: ['front'], areas: [{ zones: ['lfcn'], density: 'dense' }, { zones: ['femoral-ant'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'LFCN block', dose: '5 ml of 0.2% ropivacaine (10 mg): 1 ml test, then 2 ml aliquots', blocks: ['lfcn'], why: 'The donor site often hurts more than the graft site; this covers it with no motor block.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Supra-inguinal fascia iliaca block', dose: '40 ml of 0.2% ropivacaine (80 mg)', blocks: ['fib'], why: 'For a large donor area that extends onto the front of the thigh; weakens the quadriceps.' },
      ] },
    ],
    misses: ['The LFCN area varies a lot between people.', 'The front of the thigh (femoral cutaneous) and the back (posterior femoral cutaneous).'],
    notes: ['The block can be done after induction, at the end of the case.'],
  },
  {
    id: 'vein', region: 'other', name: 'Saphenous vein harvest or varicose vein surgery',
    line: 'The great saphenous vein runs through femoral nerve skin in the thigh and saphenous nerve skin below the knee.',
    cover: 'The medial thigh (medial femoral cutaneous, with a variable obturator patch), the medial leg (saphenous), and the groin incision at the saphenofemoral junction.',
    map: { views: ['front', 'back'], areas: [{ zones: ['saphenous-knee', 'saphenous-leg'], density: 'dense' }, { zones: ['femoral-ant', 'obturator'], density: 'moderate' }] },
    groups: [
      { label: 'Endovenous ablation', items: [
        { name: 'The surgeon’s tumescent local anaesthesia', why: 'Most varicose vein treatment now; a block is rarely needed.' },
      ] },
      { label: 'Open surgery or long harvest', items: [
        { name: 'Femoral nerve block', dose: '15 ml of 0.4% ropivacaine (60 mg)', blocks: ['femoral'], why: 'The medial thigh and, through the saphenous nerve, the medial leg.' },
        { name: 'Below the knee only: adductor canal or saphenous block', dose: '10 ml of 0.4% (40 mg) or 5 ml of 0.5% (25 mg)', blocks: ['acb', 'saph'], why: 'Motor-sparing.' },
        { name: 'Small saphenous vein (back of the calf)', blocks: ['pop', 'pfcn'], why: 'Popliteal sciatic block, plus a subcutaneous line above the popliteal crease for the posterior femoral cutaneous nerve.' },
      ] },
    ],
    misses: ['The groin incision (genitofemoral and ilioinguinal skin): ask for infiltration.', 'The obturator patch of the medial thigh.'],
    notes: ['Below the knee the saphenous nerve lies right beside the vein: stripping or harvest can injure it. Document sensation before any block.'],
  },
];

/* Short names, link text and page of each LINKS key (the same data, split for other pages). */
export const BLOCK_LINKS = Object.fromEntries(Object.entries(LINKS).map(([k, [href]]) => [k, href]));
export const BLOCK_NAMES = Object.fromEntries(Object.entries(LINKS).map(([k, [, name]]) => [k, name]));
export const PAGE_NAMES = { 'hip/': 'hip', 'knee/': 'knee', 'foot-ankle/': 'foot and ankle', 'thigh/': 'thigh' };

/** URL of a block or section: base '' (default) is relative to /lower-limb/; pass '../lower-limb/' or '/lower-limb/' from elsewhere. */
export const blockHref = (key, base = '') => (LINKS[key] ? base + LINKS[key][0] : null);

/* What the shading means on the chooser's figure: what the operation needs, not how well a block covers it. */
const NEED_WORDS = { dense: 'Core: must be covered', moderate: 'Often involved: cover if the approach or incision needs it' };

/**
 * lowerLimbCoverageMap(op, {id, title}) -> <figure class="tb-cov ll-cov"> or null when the operation has no map.
 * The leg coverage map from leg.js, with its key relabelled "core" / "often involved".
 */
export function lowerLimbCoverageMap(op, { id = 'll-op-map', title = op?.name } = {}) {
  if (!op?.map) return null;
  const fig = legCoverageMap({ ...op.map, summary: `Area to cover: ${op.cover}` }, { id, title });
  fig.querySelectorAll('.tb-cov-legend li').forEach((li) => {
    const sw = li.querySelector('.tb-cov-sw');
    const k = sw && ['dense', 'moderate'].find((d) => sw.classList.contains(`tb-cov-sw--${d}`));
    if (k) li.lastElementChild.textContent = NEED_WORDS[k];
  });
  const stage = fig.querySelector('.tb-cov-stage');
  if (stage) stage.setAttribute('aria-label', stage.getAttribute('aria-label').replace(/: Dense/g, ': core').replace(/: Moderate/g, ': often involved'));
  return fig;
}
