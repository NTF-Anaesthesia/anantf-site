// Brachial plexus teaching app: shared anatomical and clinical data.
// Author: Dr Koh Wenjun, NTF Anaesthesia. Educational use only.
//
// Everything other modules need lives here: the plexus topology (ELEMENTS),
// the levels (LEVELS), the four blocks (BLOCKS) and the coverage maps (REGIONS).
// Block wording and values follow the author's own R1 teaching deck; gaps are
// filled with conservative, standard textbook facts. No drug doses beyond the deck.
//
// Conventions for BLOCKS[...].covers / spares / variable:
//   - Lists include plexus parts (trunks, cords, ...) AND named nerves, so any view
//     can colour any element it draws.
//   - Structures proximal to the injection site that are not reached by the
//     injectate (e.g. roots for an axillary block) are simply left out of all three
//     lists: treat them as "not involved" (neutral), not as "spared".
//   - "spares" lists nerves that matter clinically because they are missed
//     (e.g. suprascapular for infraclavicular, intercostobrachial for all).

export const ATTRIBUTION =
  'Content: Dr Koh Wenjun, NTF Anaesthesia (R1 regional anaesthesia teaching). ' +
  'Supplemented with standard textbook anatomy (NYSORA / ASRA consensus level). ' +
  'Diagrams, ultrasound simulations and the schematic 3D model are original illustrations; the Blender 3D model is adapted from Z-Anatomy (credited below).';

export const DISCLAIMER =
  'For education only. This is a simplified teaching aid and not a substitute for ' +
  'supervised clinical training, local guidelines or your own clinical judgement. ' +
  'Anatomy varies between patients; always confirm with ultrasound (including colour ' +
  'Doppler) and follow your department’s safety practice.';

// ---------------------------------------------------------------------------
// LEVELS
// ---------------------------------------------------------------------------
export const LEVELS = [
  {
    id: 'root', name: 'Roots', count: 5,
    ids: ['root-c5', 'root-c6', 'root-c7', 'root-c8', 'root-t1'],
    location: 'Ventral rami of C5–T1, emerging between the anterior and middle scalene muscles (the interscalene groove).',
    landmark: 'Interscalene groove at the level of C6 (cricoid cartilage).',
    blockIds: ['interscalene'],
    color: '#b91c1c',
    facts: [
      'C5–C7 exit above their own vertebra; C8 exits between C7 and T1.',
      'On ultrasound at C6–C7, C5 and a split C6 stack up as the "traffic light" between the scalenes.',
      'C7 transverse process has no (or a rudimentary) anterior tubercle; C6 has the prominent Chassaignac tubercle.',
      'Dorsal scapular (C5) and long thoracic (C5–C7) nerves arise here and pass through the middle scalene.',
    ],
  },
  {
    id: 'trunk', name: 'Trunks', count: 3,
    ids: ['trunk-sup', 'trunk-mid', 'trunk-inf'],
    location: 'Posterior triangle of the neck, passing over the first rib posterolateral to the subclavian artery.',
    landmark: 'Supraclavicular fossa, probe parallel and just above the clavicle.',
    blockIds: ['supraclavicular'],
    color: '#a16207',
    facts: [
      'Superior = C5+C6, middle = C7 (alone), inferior = C8+T1.',
      'The inferior trunk lies deepest, on the first rib beside the subclavian artery: the "corner pocket".',
      'Suprascapular nerve leaves the superior trunk proximal to the usual supraclavicular injection site.',
    ],
  },
  {
    id: 'division', name: 'Divisions', count: 6,
    ids: ['div-sup-ant', 'div-sup-post', 'div-mid-ant', 'div-mid-post', 'div-inf-ant', 'div-inf-post'],
    location: 'Behind the middle third of the clavicle.',
    landmark: 'Retroclavicular; usually seen together with the trunks in the supraclavicular view.',
    blockIds: ['supraclavicular'],
    color: '#15803d',
    facts: [
      'Each trunk splits into an anterior and a posterior division.',
      'Anterior divisions supply flexor (anterior) compartments; posterior divisions supply extensor (posterior) compartments.',
      'No named branches arise from the divisions.',
    ],
  },
  {
    id: 'cord', name: 'Cords', count: 3,
    ids: ['cord-lat', 'cord-post', 'cord-med'],
    location: 'Around the second part of the axillary artery, deep to pectoralis minor; named for their position relative to the artery.',
    landmark: 'Infraclavicular, medial to the coracoid process, probe parasagittal.',
    blockIds: ['infraclavicular'],
    color: '#1d4ed8',
    facts: [
      'Lateral cord = anterior divisions of superior + middle trunks (C5–C7).',
      'Medial cord = anterior division of inferior trunk (C8–T1).',
      'Posterior cord = all three posterior divisions (C5–T1).',
      'Parasagittal ultrasound (deck convention): lateral cord ~9 o’clock, posterior ~6 o’clock, medial ~3 o’clock around the artery.',
    ],
  },
  {
    id: 'terminal', name: 'Terminal branches', count: 5,
    ids: ['n-musculocutaneous', 'n-axillary', 'n-radial', 'n-median', 'n-ulnar'],
    location: 'Around the third part of the axillary artery, distal to pectoralis minor, in the axilla.',
    landmark: 'Axillary fossa, probe transverse across the proximal arm.',
    blockIds: ['axillary'],
    color: '#7e22ce',
    facts: [
      'Lateral cord → musculocutaneous + lateral root of median.',
      'Medial cord → ulnar + medial root of median.',
      'Posterior cord → axillary + radial.',
      'Musculocutaneous leaves the sheath early to lie within coracobrachialis; it needs its own injection in an axillary block.',
    ],
  },
];

export const LEVEL_MNEMONIC = {
  text: 'Randy Travis Drinks Cold Beer',
  meaning: 'Roots, Trunks, Divisions, Cords, Branches (5 – 3 – 6 – 3 – 5).',
  blocks: 'Interscalene: roots. Supraclavicular: trunks ± divisions. Infraclavicular: cords. Axillary: branches.',
};

// ---------------------------------------------------------------------------
// ELEMENTS
// ---------------------------------------------------------------------------
// children are derived from parents below, so the two always stay reciprocal.
const E = [
  // Roots
  {
    id: 'root-c5', name: 'C5 root', short: 'C5', level: 'root', spinal: ['C5'], parents: [],
    motor: 'Myotome: shoulder abduction and external rotation; contributes to elbow flexion. Gives the dorsal scapular nerve, part of the long thoracic nerve and a contribution to the phrenic nerve.',
    sensory: 'Dermatome: lateral upper arm (over the deltoid / regimental badge area).',
    notes: 'Most superficial and cephalad root in the interscalene groove; the top light of the "traffic light". Inject between C5 and C6 for an interscalene block.',
  },
  {
    id: 'root-c6', name: 'C6 root', short: 'C6', level: 'root', spinal: ['C6'], parents: [],
    motor: 'Myotome: elbow flexion and wrist extension; contributes to the long thoracic nerve.',
    sensory: 'Dermatome: lateral forearm and thumb.',
    notes: 'Often appears split into two hypoechoic circles on ultrasound, giving the middle (and sometimes bottom) "traffic lights". Joins C5 to form the superior trunk.',
  },
  {
    id: 'root-c7', name: 'C7 root', short: 'C7', level: 'root', spinal: ['C7'], parents: [],
    motor: 'Myotome: elbow extension and wrist flexion; contributes to the long thoracic nerve.',
    sensory: 'Dermatome: middle finger.',
    notes: 'Seen emerging beside the C7 transverse process, which has no prominent anterior tubercle (a useful level check). Continues alone as the middle trunk.',
  },
  {
    id: 'root-c8', name: 'C8 root', short: 'C8', level: 'root', spinal: ['C8'], parents: [],
    motor: 'Myotome: finger flexion.',
    sensory: 'Dermatome: little finger and medial hand.',
    notes: 'Exits between C7 and T1. Lies deep and caudal; usually not reached by an interscalene injection, hence ulnar-territory sparing.',
  },
  {
    id: 'root-t1', name: 'T1 root', short: 'T1', level: 'root', spinal: ['T1'], parents: [],
    motor: 'Myotome: finger abduction (hand intrinsics).',
    sensory: 'Dermatome: medial forearm and lower medial arm.',
    notes: 'Arches over the pleural dome and first rib. T1 also carries preganglionic sympathetic fibres to the head; spread to the cervical sympathetic chain causes Horner’s syndrome.',
  },

  // Trunks
  {
    id: 'trunk-sup', name: 'Superior (upper) trunk', short: 'Sup trunk', level: 'trunk', spinal: ['C5', 'C6'], parents: ['root-c5', 'root-c6'],
    motor: 'Shoulder abductors and external rotators, elbow flexors (via its divisions); gives the suprascapular nerve and nerve to subclavius.',
    sensory: 'Lateral arm and lateral forearm, thumb (C5–C6 territory).',
    notes: 'Erb’s point. Injury (Erb’s palsy) gives the "waiter’s tip" posture. A superior trunk block targets it between the interscalene and supraclavicular levels, often superficial to the anterior scalene, for shoulder analgesia with less phrenic palsy.',
  },
  {
    id: 'trunk-mid', name: 'Middle trunk', short: 'Mid trunk', level: 'trunk', spinal: ['C7'], parents: ['root-c7'],
    motor: 'Contributes to elbow, wrist and finger extensors (posterior division) and forearm flexors (anterior division).',
    sensory: 'Middle finger (C7 territory).',
    notes: 'The C7 root continuing alone. No named branches.',
  },
  {
    id: 'trunk-inf', name: 'Inferior (lower) trunk', short: 'Inf trunk', level: 'trunk', spinal: ['C8', 'T1'], parents: ['root-c8', 'root-t1'],
    motor: 'Finger flexors and hand intrinsics (via medial cord: ulnar and median).',
    sensory: 'Medial hand, little finger, medial forearm.',
    notes: 'Lies on the first rib, posterior to the subclavian artery, in the "corner pocket". Deposit local anaesthetic here first in a supraclavicular block to avoid ulnar sparing. Injury: Klumpke’s palsy (claw hand).',
  },

  // Divisions
  {
    id: 'div-sup-ant', name: 'Anterior division of superior trunk', short: 'Sup ant div', level: 'division', spinal: ['C5', 'C6'], parents: ['trunk-sup'],
    motor: 'Flexor compartment (via lateral cord).', sensory: 'Lateral forearm (via musculocutaneous).',
    notes: 'Joins the anterior division of the middle trunk to form the lateral cord.',
  },
  {
    id: 'div-sup-post', name: 'Posterior division of superior trunk', short: 'Sup post div', level: 'division', spinal: ['C5', 'C6'], parents: ['trunk-sup'],
    motor: 'Extensor compartment and deltoid (via posterior cord).', sensory: 'Lateral and posterior arm (via axillary and radial).',
    notes: 'Contributes to the posterior cord.',
  },
  {
    id: 'div-mid-ant', name: 'Anterior division of middle trunk', short: 'Mid ant div', level: 'division', spinal: ['C7'], parents: ['trunk-mid'],
    motor: 'Flexor compartment (via lateral cord).', sensory: 'Via lateral root of median.',
    notes: 'Joins the anterior division of the superior trunk to form the lateral cord.',
  },
  {
    id: 'div-mid-post', name: 'Posterior division of middle trunk', short: 'Mid post div', level: 'division', spinal: ['C7'], parents: ['trunk-mid'],
    motor: 'Extensor compartment (via posterior cord).', sensory: 'Via radial nerve.',
    notes: 'Contributes to the posterior cord.',
  },
  {
    id: 'div-inf-ant', name: 'Anterior division of inferior trunk', short: 'Inf ant div', level: 'division', spinal: ['C8', 'T1'], parents: ['trunk-inf'],
    motor: 'Flexor compartment and hand intrinsics (via medial cord).', sensory: 'Medial arm, forearm and hand.',
    notes: 'Continues alone as the medial cord.',
  },
  {
    id: 'div-inf-post', name: 'Posterior division of inferior trunk', short: 'Inf post div', level: 'division', spinal: ['C8', 'T1'], parents: ['trunk-inf'],
    motor: 'Extensor compartment (via posterior cord).', sensory: 'Via radial nerve.',
    notes: 'The smallest division; contributes to the posterior cord.',
  },

  // Cords
  {
    id: 'cord-lat', name: 'Lateral cord', short: 'Lat cord', level: 'cord', spinal: ['C5', 'C6', 'C7'], parents: ['div-sup-ant', 'div-mid-ant'],
    motor: 'Elbow flexors (musculocutaneous), pectoralis major (lateral pectoral), forearm flexors (lateral root of median).',
    sensory: 'Lateral forearm; lateral palm and digits (via median).',
    notes: 'Lateral to the second part of the axillary artery (around 9 o’clock in the deck’s parasagittal view). Nerve stimulation: elbow flexion (biceps) via musculocutaneous.',
  },
  {
    id: 'cord-post', name: 'Posterior cord', short: 'Post cord', level: 'cord', spinal: ['C5', 'C6', 'C7', 'C8', 'T1'], parents: ['div-sup-post', 'div-mid-post', 'div-inf-post'],
    motor: 'Subscapularis, teres major, latissimus dorsi, deltoid, teres minor, all extensors of elbow, wrist and fingers.',
    sensory: 'Lateral and posterior arm, posterior forearm, dorsum of lateral hand.',
    notes: 'Posterior to the axillary artery (6 o’clock). Primary target of an infraclavicular block: local anaesthetic deposited between the posterior cord and the artery tends to spread in a U-shape. Nerve stimulation: finger and wrist extension (radial).',
  },
  {
    id: 'cord-med', name: 'Medial cord', short: 'Med cord', level: 'cord', spinal: ['C8', 'T1'], parents: ['div-inf-ant'],
    motor: 'Pectoral muscles (medial pectoral), forearm flexors and hand intrinsics (ulnar, medial root of median).',
    sensory: 'Medial arm (MCNA), medial forearm (MCNF), medial 1.5 digits (ulnar).',
    notes: 'Medial to the artery (3 o’clock), sometimes between artery and vein. May need a redirected injection in an infraclavicular block. Nerve stimulation: finger and wrist flexion.',
  },

  // Terminal branches
  {
    id: 'n-musculocutaneous', name: 'Musculocutaneous nerve', short: 'MCN', level: 'terminal', spinal: ['C5', 'C6', 'C7'], parents: ['cord-lat'],
    motor: 'Coracobrachialis, biceps brachii, brachialis (elbow flexion, supination).',
    sensory: 'Lateral forearm via the lateral cutaneous nerve of the forearm (its terminal branch).',
    notes: 'Leaves the sheath early and pierces coracobrachialis; on axillary ultrasound it is a flattened hyperechoic structure in the plane between biceps and coracobrachialis. Requires a separate injection in an axillary block. Stimulation: elbow flexion.',
  },
  {
    id: 'n-axillary', name: 'Axillary nerve', short: 'Axillary', level: 'terminal', spinal: ['C5', 'C6'], parents: ['cord-post'],
    motor: 'Deltoid, teres minor (shoulder abduction, external rotation).',
    sensory: 'Superior lateral cutaneous nerve of the arm ("regimental badge"); shoulder joint (anterior and inferior capsule).',
    notes: 'Passes through the quadrangular space with the posterior circumflex humeral artery, around the surgical neck of the humerus. Leaves the posterior cord high in the axilla, so it is spared by an axillary block.',
  },
  {
    id: 'n-radial', name: 'Radial nerve', short: 'Radial', level: 'terminal', spinal: ['C5', 'C6', 'C7', 'C8', 'T1'], parents: ['cord-post'],
    motor: 'Triceps, anconeus, brachioradialis, supinator and all wrist and finger extensors (via the posterior interosseous nerve).',
    sensory: 'Posterior arm, lower lateral arm, posterior forearm and dorsum of the lateral hand (first web space).',
    notes: 'Lies deep (posterior) to the axillary artery in the axilla and can be hidden by posterior acoustic enhancement: often the hardest to see. Follows the conjoint tendon of teres major / latissimus dorsi into the spiral (radial) groove. Stimulation: elbow, wrist and finger extension.',
  },
  {
    id: 'n-median', name: 'Median nerve', short: 'Median', level: 'terminal', spinal: ['C6', 'C7', 'C8', 'T1'], parents: ['cord-lat', 'cord-med'],
    motor: 'Most forearm flexors (except FCU and the ulnar half of FDP), pronators, and the thenar muscles plus lateral two lumbricals ("LOAF").',
    sensory: 'Palmar lateral 3.5 digits and their nail beds, lateral palm.',
    notes: 'Formed by lateral and medial roots that unite anterior to the axillary artery. In the axilla it is usually anterior/superficial to the artery and follows the brachial artery distally. Stimulation: wrist flexion (FCR), flexion of digits 1–3, pronation. Often listed as C5–T1; the C5 contribution is small and variable.',
  },
  {
    id: 'n-ulnar', name: 'Ulnar nerve', short: 'Ulnar', level: 'terminal', spinal: ['C8', 'T1'], parents: ['cord-med'],
    motor: 'Flexor carpi ulnaris, ulnar half of FDP and most hand intrinsics (interossei, hypothenar, adductor pollicis, medial two lumbricals).',
    sensory: 'Palmar and dorsal medial 1.5 digits and the medial hand.',
    notes: 'In the axilla it lies medial/posterior to the artery, then moves posteriorly away from it towards the cubital tunnel. May receive a C7 contribution. Stimulation: wrist flexion (FCU), flexion of digits 4–5, thumb adduction.',
  },

  // Collateral branches
  {
    id: 'n-dorsal-scapular', name: 'Dorsal scapular nerve', short: 'Dorsal scap', level: 'collateral', spinal: ['C5'], parents: ['root-c5'],
    motor: 'Rhomboids and levator scapulae (scapular retraction and elevation).', sensory: 'None.',
    notes: 'Arises from the C5 root and pierces the middle scalene. Can lie in the path of a posterior-to-anterior interscalene needle; look for it within the middle scalene. Accompanied lower in the neck by the dorsal scapular artery (use colour Doppler).',
  },
  {
    id: 'n-long-thoracic', name: 'Long thoracic nerve', short: 'Long thoracic', level: 'collateral', spinal: ['C5', 'C6', 'C7'], parents: ['root-c5', 'root-c6', 'root-c7'],
    motor: 'Serratus anterior (scapular protraction; injury causes a winged scapula).', sensory: 'None.',
    notes: 'Formed from C5–C7 roots, passes through the middle scalene. Like the dorsal scapular nerve it may be met by a posterior-to-anterior interscalene needle.',
  },
  {
    id: 'n-suprascapular', name: 'Suprascapular nerve', short: 'Suprascap', level: 'collateral', spinal: ['C5', 'C6'], parents: ['trunk-sup'],
    motor: 'Supraspinatus and infraspinatus.',
    sensory: 'Most of the shoulder joint (posterior and superior capsule) and the acromioclavicular joint.',
    notes: 'Leaves the superior trunk proximally and passes through the suprascapular notch under the superior transverse scapular ligament. Because it branches above the supraclavicular injection site it may be missed; it is spared by infraclavicular and axillary blocks. Can be blocked separately (with an axillary nerve block) for shoulder surgery.',
  },
  {
    id: 'n-subclavius', name: 'Nerve to subclavius', short: 'To subclavius', level: 'collateral', spinal: ['C5', 'C6'], parents: ['trunk-sup'],
    motor: 'Subclavius.', sensory: 'Small contribution to the sternoclavicular joint and clavicle.',
    notes: 'Small branch from the superior trunk. May give an accessory phrenic nerve, one reason phrenic sparing is never guaranteed.',
  },
  {
    id: 'n-lat-pectoral', name: 'Lateral pectoral nerve', short: 'Lat pectoral', level: 'collateral', spinal: ['C5', 'C6', 'C7'], parents: ['cord-lat'],
    motor: 'Pectoralis major (mainly clavicular head).', sensory: 'Articular branches to the anterior shoulder and acromioclavicular joint.',
    notes: 'Seen between pectoralis major and minor in the infraclavicular view, often near the thoraco-acromial artery. Named for its cord, not its position.',
  },
  {
    id: 'n-med-pectoral', name: 'Medial pectoral nerve', short: 'Med pectoral', level: 'collateral', spinal: ['C8', 'T1'], parents: ['cord-med'],
    motor: 'Pectoralis minor and the sternocostal part of pectoralis major.', sensory: 'None.',
    notes: 'Pierces pectoralis minor. Lies lateral to the lateral pectoral nerve despite its name.',
  },
  {
    id: 'n-upper-subscap', name: 'Upper subscapular nerve', short: 'Upper subscap', level: 'collateral', spinal: ['C5', 'C6'], parents: ['cord-post'],
    motor: 'Upper part of subscapularis.', sensory: 'None.',
    notes: 'First branch of the posterior cord.',
  },
  {
    id: 'n-thoracodorsal', name: 'Thoracodorsal nerve', short: 'Thoracodorsal', level: 'collateral', spinal: ['C6', 'C7', 'C8'], parents: ['cord-post'],
    motor: 'Latissimus dorsi.', sensory: 'None.',
    notes: 'Runs with the thoracodorsal vessels, which are visible deep in the infraclavicular view. Important in breast reconstruction (latissimus dorsi flap).',
  },
  {
    id: 'n-lower-subscap', name: 'Lower subscapular nerve', short: 'Lower subscap', level: 'collateral', spinal: ['C5', 'C6'], parents: ['cord-post'],
    motor: 'Lower part of subscapularis and teres major.', sensory: 'None.',
    notes: 'Arises from the posterior cord after the thoracodorsal nerve.',
  },
  {
    id: 'n-mcn-arm', name: 'Medial cutaneous nerve of the arm', short: 'MCNA', level: 'collateral', spinal: ['C8', 'T1'], parents: ['cord-med'],
    motor: 'None (purely sensory).', sensory: 'Skin of the lower medial arm.',
    notes: 'Smallest branch of the plexus; communicates with the intercostobrachial nerve. Lies superficially near the axillary vein and is often missed by an axillary block (deck: "misses medial cutaneous nerve of the arm").',
  },
  {
    id: 'n-mcn-forearm', name: 'Medial cutaneous nerve of the forearm', short: 'MCNF', level: 'collateral', spinal: ['C8', 'T1'], parents: ['cord-med'],
    motor: 'None (purely sensory).', sensory: 'Skin of the medial forearm (anterior and posterior).',
    notes: 'Travels close to the median and ulnar nerves and the axillary vein, so it is usually blocked by an axillary block.',
  },

  // Related nerves (not part of the brachial plexus, but clinically essential)
  {
    id: 'n-phrenic', name: 'Phrenic nerve', short: 'Phrenic', level: 'related', spinal: ['C3', 'C4', 'C5'], parents: ['root-c5'],
    motor: 'Diaphragm (sole motor supply to the ipsilateral hemidiaphragm).', sensory: 'Central diaphragm, pericardium, mediastinal pleura.',
    notes: '"C3, 4, 5 keeps the diaphragm alive." Runs down the anterior surface of the anterior scalene, deep to the prevertebral fascia, only millimetres from the C5 root. Hemidiaphragmatic paresis is expected with a conventional interscalene block, less frequent with supraclavicular, and uncommon with infraclavicular or axillary. Only the C5 contribution comes from the brachial plexus roots.',
  },
  {
    id: 'n-intercostobrachial', name: 'Intercostobrachial nerve', short: 'ICBN', level: 'related', spinal: ['T2'], parents: [],
    motor: 'None (purely sensory).', sensory: 'Skin of the axilla and upper medial arm.',
    notes: 'Lateral cutaneous branch of the second intercostal nerve (T2), not part of the brachial plexus, so no brachial plexus block covers it. Supplement with subcutaneous infiltration across the axillary crease (deck: 23G needle, 5 ml of 0.5% ropivacaine), e.g. for an upper-arm tourniquet or medial arm incision.',
  },
  {
    id: 'n-supraclavicular-cx', name: 'Supraclavicular nerves (cervical plexus)', short: 'Supraclav nn', level: 'related', spinal: ['C3', 'C4'], parents: [],
    motor: 'None (purely sensory).', sensory: 'Skin over the clavicle, acromion and top of the shoulder: the "cape".',
    notes: 'Branches of the superficial cervical plexus, not the brachial plexus. Not covered by supraclavicular, infraclavicular or axillary blocks; an interscalene injection may reach them by spread. Missed "cape" sensation after shoulder surgery is a classic exam question.',
  },
];

export const ELEMENT_ORDER = E.map((e) => e.id);

export const ELEMENTS = Object.fromEntries(E.map((e) => [e.id, { ...e, children: [] }]));
for (const el of Object.values(ELEMENTS)) {
  for (const p of el.parents) ELEMENTS[p].children.push(el.id);
}

// ---------------------------------------------------------------------------
// REGIONS (coverage maps)
// ---------------------------------------------------------------------------
// type: 'cutaneous' | 'motor' | 'osteotome'.
// nerve: main nerve element id; nerves: all contributing element ids.
// view (cutaneous only): which surface of the limb the region is drawn on.
export const REGIONS = {
  // Cutaneous
  'cut-supraclavicular-cape': { type: 'cutaneous', name: 'Cape of the shoulder', nerve: 'n-supraclavicular-cx', nerves: ['n-supraclavicular-cx'], nerveName: 'Supraclavicular nerves (C3–C4, cervical plexus)', view: 'both' },
  'cut-upper-lateral-arm': { type: 'cutaneous', name: 'Upper lateral arm ("regimental badge")', nerve: 'n-axillary', nerves: ['n-axillary'], nerveName: 'Superior lateral cutaneous nerve of arm (axillary)', view: 'both' },
  'cut-lower-lateral-arm': { type: 'cutaneous', name: 'Lower lateral arm', nerve: 'n-radial', nerves: ['n-radial'], nerveName: 'Inferior lateral cutaneous nerve of arm (radial)', view: 'both' },
  'cut-posterior-arm': { type: 'cutaneous', name: 'Posterior arm', nerve: 'n-radial', nerves: ['n-radial'], nerveName: 'Posterior cutaneous nerve of arm (radial)', view: 'posterior' },
  'cut-posterior-forearm': { type: 'cutaneous', name: 'Posterior forearm', nerve: 'n-radial', nerves: ['n-radial'], nerveName: 'Posterior cutaneous nerve of forearm (radial)', view: 'posterior' },
  'cut-lateral-forearm': { type: 'cutaneous', name: 'Lateral forearm', nerve: 'n-musculocutaneous', nerves: ['n-musculocutaneous'], nerveName: 'Lateral cutaneous nerve of forearm (musculocutaneous)', view: 'both' },
  'cut-upper-medial-arm': { type: 'cutaneous', name: 'Axilla and upper medial arm', nerve: 'n-intercostobrachial', nerves: ['n-intercostobrachial'], nerveName: 'Intercostobrachial nerve (T2)', view: 'anterior' },
  'cut-lower-medial-arm': { type: 'cutaneous', name: 'Lower medial arm', nerve: 'n-mcn-arm', nerves: ['n-mcn-arm'], nerveName: 'Medial cutaneous nerve of arm (medial cord)', view: 'anterior' },
  'cut-medial-forearm': { type: 'cutaneous', name: 'Medial forearm', nerve: 'n-mcn-forearm', nerves: ['n-mcn-forearm'], nerveName: 'Medial cutaneous nerve of forearm (medial cord)', view: 'both' },
  'cut-palm-lateral': { type: 'cutaneous', name: 'Lateral palm and palmar lateral 3.5 digits (plus nail beds)', nerve: 'n-median', nerves: ['n-median'], nerveName: 'Median nerve', view: 'anterior' },
  'cut-dorsum-lateral-hand': { type: 'cutaneous', name: 'Dorsum of lateral hand (first web space)', nerve: 'n-radial', nerves: ['n-radial'], nerveName: 'Superficial branch of radial nerve', view: 'posterior' },
  'cut-ulnar-hand': { type: 'cutaneous', name: 'Medial hand and medial 1.5 digits (palmar and dorsal)', nerve: 'n-ulnar', nerves: ['n-ulnar'], nerveName: 'Ulnar nerve', view: 'both' },

  // Motor groups
  'mot-diaphragm': { type: 'motor', name: 'Diaphragm (side effect)', nerve: 'n-phrenic', nerves: ['n-phrenic'], muscles: 'Ipsilateral hemidiaphragm', test: 'Reduced diaphragmatic excursion on ultrasound; dyspnoea in patients with poor respiratory reserve' },
  'mot-scapular': { type: 'motor', name: 'Scapular stabilisers', nerve: 'n-long-thoracic', nerves: ['n-dorsal-scapular', 'n-long-thoracic'], muscles: 'Rhomboids, levator scapulae, serratus anterior', test: 'Scapular retraction / protraction' },
  'mot-deltoid': { type: 'motor', name: 'Shoulder abduction (deltoid)', nerve: 'n-axillary', nerves: ['n-axillary'], muscles: 'Deltoid, teres minor', test: 'Abduct the arm against resistance' },
  'mot-rotator-cuff': { type: 'motor', name: 'Rotator cuff', nerve: 'n-suprascapular', nerves: ['n-suprascapular', 'n-upper-subscap', 'n-lower-subscap', 'n-axillary'], muscles: 'Supraspinatus, infraspinatus (suprascapular); subscapularis (subscapular nerves); teres minor (axillary)', test: 'Initiation of abduction, external and internal rotation' },
  'mot-pectorals': { type: 'motor', name: 'Shoulder adduction (pectorals)', nerve: 'n-lat-pectoral', nerves: ['n-lat-pectoral', 'n-med-pectoral'], muscles: 'Pectoralis major and minor', test: 'Press palms together (adduction)' },
  'mot-lat-dorsi': { type: 'motor', name: 'Shoulder extension (latissimus dorsi, teres major)', nerve: 'n-thoracodorsal', nerves: ['n-thoracodorsal', 'n-lower-subscap'], muscles: 'Latissimus dorsi, teres major', test: 'Extend and adduct the arm' },
  'mot-elbow-flexors': { type: 'motor', name: 'Elbow flexion', nerve: 'n-musculocutaneous', nerves: ['n-musculocutaneous'], muscles: 'Biceps, brachialis, coracobrachialis (brachioradialis is radial)', test: 'Push-pull test: pull (flexion) weak' },
  'mot-elbow-extensors': { type: 'motor', name: 'Elbow extension', nerve: 'n-radial', nerves: ['n-radial'], muscles: 'Triceps, anconeus', test: 'Push-pull test: push (extension) weak' },
  'mot-wrist-finger-flexors': { type: 'motor', name: 'Wrist and finger flexion, pronation', nerve: 'n-median', nerves: ['n-median', 'n-ulnar'], muscles: 'FCR, FDS, FDP, FPL, pronators (median); FCU, ulnar half of FDP (ulnar)', test: 'Make a fist; flex the wrist' },
  'mot-wrist-finger-extensors': { type: 'motor', name: 'Wrist and finger extension', nerve: 'n-radial', nerves: ['n-radial'], muscles: 'Wrist and finger extensors, supinator (posterior interosseous nerve)', test: 'Extend the wrist and fingers' },
  'mot-thenar': { type: 'motor', name: 'Thenar muscles', nerve: 'n-median', nerves: ['n-median'], muscles: 'Abductor pollicis brevis, opponens pollicis, flexor pollicis brevis, lateral two lumbricals', test: 'Thumb opposition' },
  'mot-hand-intrinsics': { type: 'motor', name: 'Hand intrinsics', nerve: 'n-ulnar', nerves: ['n-ulnar'], muscles: 'Interossei, hypothenar muscles, adductor pollicis, medial two lumbricals', test: 'Spread the fingers; grip paper between fingers' },

  // Osteotomes (simplified; bony innervation is overlapping and variable)
  'ost-clavicle-lateral': { type: 'osteotome', name: 'Lateral clavicle', nerve: 'n-supraclavicular-cx', nerves: ['n-supraclavicular-cx', 'n-subclavius', 'n-suprascapular', 'n-lat-pectoral'], note: 'Mixed cervical and brachial plexus supply; interscalene covers the brachial part and may spread to the cervical plexus.' },
  'ost-shoulder-joint': { type: 'osteotome', name: 'Shoulder joint', nerve: 'n-suprascapular', nerves: ['n-suprascapular', 'n-axillary', 'n-lat-pectoral'], note: 'Suprascapular nerve supplies most of the joint (posterior / superior); axillary and lateral pectoral supply the anterior and inferior parts.' },
  'ost-humerus-proximal': { type: 'osteotome', name: 'Proximal humerus', nerve: 'n-axillary', nerves: ['n-axillary', 'n-musculocutaneous', 'n-radial'] },
  'ost-humerus-distal': { type: 'osteotome', name: 'Mid and distal humerus', nerve: 'n-radial', nerves: ['n-radial', 'n-musculocutaneous'] },
  'ost-elbow': { type: 'osteotome', name: 'Elbow joint', nerve: 'n-musculocutaneous', nerves: ['n-musculocutaneous', 'n-radial', 'n-median', 'n-ulnar'] },
  'ost-forearm': { type: 'osteotome', name: 'Radius and ulna', nerve: 'n-median', nerves: ['n-median', 'n-radial', 'n-ulnar', 'n-musculocutaneous'] },
  'ost-wrist-hand': { type: 'osteotome', name: 'Wrist and hand', nerve: 'n-median', nerves: ['n-median', 'n-ulnar', 'n-radial'] },
};

export const REGION_IDS = {
  cutaneous: Object.keys(REGIONS).filter((k) => REGIONS[k].type === 'cutaneous'),
  motor: Object.keys(REGIONS).filter((k) => REGIONS[k].type === 'motor'),
  osteotome: Object.keys(REGIONS).filter((k) => REGIONS[k].type === 'osteotome'),
};

// ---------------------------------------------------------------------------
// BLOCKS
// ---------------------------------------------------------------------------
export const BLOCK_ORDER = ['interscalene', 'supraclavicular', 'infraclavicular', 'axillary'];

export const BLOCKS = {
  interscalene: {
    id: 'interscalene',
    name: 'Interscalene block',
    level: 'root',
    targetIds: ['root-c5', 'root-c6'],
    covers: [
      'root-c5', 'root-c6', 'trunk-sup', 'div-sup-ant', 'div-sup-post',
      'n-suprascapular', 'n-subclavius', 'n-axillary', 'n-musculocutaneous', 'n-lat-pectoral',
      'n-upper-subscap', 'n-lower-subscap', 'n-phrenic',
    ],
    variable: [
      'root-c7', 'trunk-mid', 'div-mid-ant', 'div-mid-post', 'cord-lat', 'cord-post',
      'n-radial', 'n-median', 'n-thoracodorsal', 'n-dorsal-scapular', 'n-long-thoracic',
      'n-supraclavicular-cx',
    ],
    spares: [
      'root-c8', 'root-t1', 'trunk-inf', 'div-inf-ant', 'div-inf-post', 'cord-med',
      'n-ulnar', 'n-med-pectoral', 'n-mcn-arm', 'n-mcn-forearm', 'n-intercostobrachial',
    ],
    sideEffectIds: ['n-phrenic'],
    position: 'Supine, head turned away, arm by the side. Donut under the head to create space for the needle.',
    equipment: 'High-frequency linear probe, 50 mm echogenic needle.',
    needle: { length: '50 mm', type: 'Echogenic', plane: 'In-plane', direction: 'Posterior to anterior' },
    probe: 'High-frequency linear probe, transverse (axial) across the neck at the level of C6.',
    landmark: 'Interscalene groove at the level of C6 (cricoid cartilage). Probe transverse to the neck: identify the common carotid artery, then scan laterally.',
    approach: 'In-plane, posterior to anterior (needle passes through or behind the middle scalene).',
    sonoanatomy: [
      'Sternocleidomastoid (superficial)',
      'Anterior scalene (medial) and middle scalene (lateral)',
      'C5 and C6 roots (C6 often split) stacked as the "traffic light" between the scalenes',
      'C7 root emerging beside the C7 transverse process (no prominent anterior tubercle)',
      'Common carotid artery and internal jugular vein (medial)',
      'Vertebral artery (deep, medial): ask for colour Doppler',
      'Phrenic nerve on the anterior surface of the anterior scalene',
      'Dorsal scapular and long thoracic nerves within the middle scalene',
    ],
    sonoStructures: [
      { label: 'Sternocleidomastoid', kind: 'muscle', ids: [] },
      { label: 'Anterior scalene', kind: 'muscle', ids: [] },
      { label: 'Middle scalene', kind: 'muscle', ids: [] },
      { label: 'C5 root', kind: 'nerve', ids: ['root-c5'] },
      { label: 'C6 root (split)', kind: 'nerve', ids: ['root-c6'] },
      { label: 'C7 root', kind: 'nerve', ids: ['root-c7'] },
      { label: 'C7 transverse process', kind: 'bone', ids: [] },
      { label: 'Common carotid artery', kind: 'artery', ids: [] },
      { label: 'Internal jugular vein', kind: 'vein', ids: [] },
      { label: 'Vertebral artery', kind: 'artery', ids: [] },
      { label: 'Phrenic nerve', kind: 'nerve', ids: ['n-phrenic'] },
      { label: 'Dorsal scapular / long thoracic nerves', kind: 'nerve', ids: ['n-dorsal-scapular', 'n-long-thoracic'] },
    ],
    needleTarget: 'Between the C5 and C6 roots, inside the interscalene sheath. Do not puncture the roots.',
    laDeposition: 'Inject between C5 and C6 so local anaesthetic surrounds both roots. Alternative: extrafascial injection (outside the sheath, lateral to the middle scalene fascia).',
    volume: '15 ml of 0.5% ropivacaine',
    coverageText: 'Upper roots (C5–C7): shoulder, lateral clavicle and proximal humerus. Sparing of C8–T1 is expected, so the ulnar (medial forearm and hand) territory is usually not blocked.',
    indications: 'Upper arm and shoulder surgery, e.g. shoulder arthroscopy, total shoulder arthroplasty, proximal humerus fractures.',
    complications: [
      'Phrenic nerve block causing hemidiaphragmatic paresis (caution / contraindication in significant respiratory disease)',
      'Horner’s syndrome (cervical sympathetic chain)',
      'Recurrent laryngeal nerve block (hoarseness)',
      'Epidural spread or total spinal anaesthesia',
      'Pneumothorax',
      'Vertebral artery puncture or intravascular injection: seizures / local anaesthetic systemic toxicity',
      'Bezold–Jarisch reflex (bradycardia and hypotension) in the sitting / beach-chair position',
    ],
    pearls: [
      'If the anatomy at C6 is ambiguous, use the "traceback" technique: find the plexus in the supraclavicular fossa and slide cephalad until the cluster separates into roots between the scalenes.',
      'Use colour Doppler for the vertebral artery and other neck vessels; the neck is vascular.',
      'Beware other branches in the needle path: dorsal scapular and long thoracic nerves in the middle scalene.',
      'Level check: C6 has the prominent anterior (Chassaignac) tubercle; C7 has a deficient anterior tubercle because the vertebral artery enters the transverse foramen at C6.',
      'Superior trunk block: start interscalene and scan caudally until C5 and C6 join; the trunk is often superficial to the anterior scalene. Good for shoulder surgery with a lower risk of phrenic palsy.',
    ],
    examQs: [
      { q: 'Perform the block and name the structures. You are asked to scan medially: what do you see?', a: 'Common carotid artery and internal jugular vein medial to the scalenes; anterior and middle scalene with the C5/C6 "traffic light" between them; sternocleidomastoid superficially.' },
      { q: 'After an interscalene block the patient becomes dyspnoeic. Differentials?', a: 'Phrenic nerve palsy (most common); pneumothorax; high spinal / epidural spread with respiratory muscle weakness; recurrent laryngeal nerve block (can feel like dyspnoea); anaphylaxis.' },
      { q: 'The patient becomes hypotensive just before knife-to-skin for shoulder surgery. Differentials?', a: 'Bezold–Jarisch reflex in the beach-chair position (bradycardia and hypotension); high spinal / epidural spread; intravascular injection / LAST; anaphylaxis.' },
      { q: 'Which part of the plexus does an interscalene block target, and what is typically spared?', a: 'The roots (mainly C5–C6, often C7). C8–T1 is commonly spared, so the ulnar territory is missed.' },
    ],
    coverage: {
      cutaneous: ['cut-upper-lateral-arm', 'cut-lateral-forearm'],
      motor: ['mot-deltoid', 'mot-rotator-cuff', 'mot-elbow-flexors', 'mot-diaphragm'],
      osteotome: ['ost-shoulder-joint', 'ost-humerus-proximal', 'ost-clavicle-lateral'],
    },
    coverageVariable: {
      cutaneous: ['cut-supraclavicular-cape', 'cut-lower-lateral-arm', 'cut-posterior-arm', 'cut-posterior-forearm', 'cut-dorsum-lateral-hand', 'cut-palm-lateral'],
      motor: ['mot-scapular', 'mot-pectorals', 'mot-elbow-extensors', 'mot-wrist-finger-extensors', 'mot-lat-dorsi'],
      osteotome: ['ost-humerus-distal', 'ost-elbow'],
    },
  },

  supraclavicular: {
    id: 'supraclavicular',
    name: 'Supraclavicular block',
    level: 'trunk',
    targetIds: ['trunk-sup', 'trunk-mid', 'trunk-inf', 'div-sup-ant', 'div-sup-post', 'div-mid-ant', 'div-mid-post', 'div-inf-ant', 'div-inf-post'],
    covers: [
      'trunk-sup', 'trunk-mid',
      'div-sup-ant', 'div-sup-post', 'div-mid-ant', 'div-mid-post',
      'cord-lat', 'cord-post',
      'n-musculocutaneous', 'n-axillary', 'n-radial', 'n-median',
      'n-lat-pectoral', 'n-upper-subscap', 'n-thoracodorsal', 'n-lower-subscap',
    ],
    // The inferior trunk (C8–T1) is the part most often missed ("may miss the ulnar
    // nerve / inferior trunk"), so everything that continues from it shares one status.
    // The corner-pocket injection is aimed at it, which is why it is also a target.
    variable: [
      'trunk-inf', 'div-inf-ant', 'div-inf-post', 'cord-med',
      'n-ulnar', 'n-med-pectoral', 'n-mcn-arm', 'n-mcn-forearm',
      'n-suprascapular', 'n-subclavius', 'n-phrenic',
    ],
    spares: ['n-dorsal-scapular', 'n-long-thoracic', 'n-supraclavicular-cx', 'n-intercostobrachial'],
    sideEffectIds: ['n-phrenic'],
    position: 'Supine, donut under the head, head turned away, arms by the side.',
    equipment: 'Ultrasound with high-frequency linear probe, 80 mm echogenic needle.',
    needle: { length: '80 mm', type: 'Echogenic', plane: 'In-plane', direction: 'Lateral to medial' },
    probe: 'High-frequency linear probe in the supraclavicular fossa, above and parallel to the clavicle, tilted caudally.',
    landmark: 'Supraclavicular fossa. Probe above and parallel to the clavicle, tilted caudally; identify the subclavian artery.',
    approach: 'In-plane, lateral to medial.',
    sonoanatomy: [
      'Pulsatile subclavian artery resting on the hyperechoic first rib',
      'Pleura lateral and deep to the rib (sliding)',
      'Brachial plexus as a honeycomb / "bunch of grapes" cluster of hypoechoic nodules, lateral and superficial to the artery',
      '"Corner pocket": angle between subclavian artery, first rib and the plexus',
      'Anterior and middle scalene, omohyoid (superficial)',
      'Dorsal scapular and suprascapular arteries may cross the plexus: colour Doppler',
    ],
    sonoStructures: [
      { label: 'Subclavian artery', kind: 'artery', ids: [] },
      { label: 'First rib', kind: 'bone', ids: [] },
      { label: 'Pleura', kind: 'pleura', ids: [] },
      { label: 'Brachial plexus trunks / divisions ("bunch of grapes")', kind: 'nerve', ids: ['trunk-sup', 'trunk-mid', 'div-sup-ant', 'div-sup-post', 'div-mid-ant', 'div-mid-post'] },
      { label: 'Inferior trunk (corner pocket)', kind: 'nerve', ids: ['trunk-inf', 'div-inf-ant', 'div-inf-post'] },
      { label: 'Anterior scalene', kind: 'muscle', ids: [] },
      { label: 'Middle scalene', kind: 'muscle', ids: [] },
      { label: 'Omohyoid', kind: 'muscle', ids: [] },
      { label: 'Phrenic nerve', kind: 'nerve', ids: ['n-phrenic'] },
      { label: 'Dorsal scapular / suprascapular arteries', kind: 'artery', ids: [] },
    ],
    needleTarget: 'First the "corner pocket" (where the subclavian artery, first rib and plexus meet) to cover the inferior trunk; then above / around the plexus.',
    laDeposition: 'Initial injection in the corner pocket to ensure inferior trunk coverage, then redirect to deposit above the plexus so it is surrounded. Injection inside the cluster is possible but carries a higher risk of nerve injury.',
    volume: '15–20 ml of 0.5% ropivacaine',
    coverageText: 'Complete anaesthesia of the arm, elbow, forearm and hand (the "spinal of the arm"), but it may miss the suprascapular nerve or the ulnar nerve / inferior trunk.',
    indications: 'Surgery of the humerus and below. Less ideal for ulnar-sided or shoulder surgery.',
    complications: [
      'Pneumothorax (pleura lies just lateral and deep to the first rib)',
      'Phrenic nerve block (lower risk than interscalene)',
      'Horner’s syndrome',
      'Vascular puncture / intravascular injection (use colour Doppler)',
    ],
    pearls: [
      'Always ask for colour Doppler: the dorsal scapular and suprascapular arteries often cross the plexus here.',
      'Keep the needle tip in view throughout: the pleura is close.',
      'Corner pocket first, then around the plexus, to avoid ulnar sparing.',
      'Post-op advice: block wears off in about 8–12 hours; report worsening numbness / weakness or breathlessness; arm sling and protect the insensate limb (injury, heat).',
    ],
    examQs: [
      { q: 'A patient has pain after shoulder surgery despite a pre-op supraclavicular block. Which nerves are missed and why?', a: 'Suprascapular nerve: arises from the proximal superior trunk, proximal to the injection point, and supplies the posterior shoulder. Supraclavicular nerves: from the cervical plexus, not blocked by any brachial plexus block; they supply the cape of the shoulder.' },
      { q: 'What would you advise this patient post-op?', a: 'Expected course: the block wears off in about 8–12 hours. Report worsening numbness / weakness or breathlessness. Safety: arm sling and protect the insensate limb from injury and heat.' },
      { q: 'Where is the "corner pocket" and why inject there?', a: 'The angle between the subclavian artery, the first rib and the plexus. The inferior trunk (C8–T1) lies here; injecting first here reduces ulnar sparing.' },
    ],
    coverage: {
      cutaneous: ['cut-upper-lateral-arm', 'cut-lower-lateral-arm', 'cut-posterior-arm', 'cut-posterior-forearm', 'cut-lateral-forearm', 'cut-palm-lateral', 'cut-dorsum-lateral-hand'],
      motor: ['mot-deltoid', 'mot-pectorals', 'mot-lat-dorsi', 'mot-elbow-flexors', 'mot-elbow-extensors', 'mot-wrist-finger-flexors', 'mot-wrist-finger-extensors', 'mot-thenar'],
      osteotome: ['ost-humerus-proximal', 'ost-humerus-distal', 'ost-elbow', 'ost-forearm', 'ost-wrist-hand'],
    },
    coverageVariable: {
      cutaneous: ['cut-ulnar-hand', 'cut-lower-medial-arm', 'cut-medial-forearm'],
      motor: ['mot-rotator-cuff', 'mot-hand-intrinsics', 'mot-diaphragm'],
      osteotome: ['ost-shoulder-joint'],
    },
  },

  infraclavicular: {
    id: 'infraclavicular',
    name: 'Infraclavicular block (coracoid / parasagittal)',
    level: 'cord',
    targetIds: ['cord-lat', 'cord-post', 'cord-med'],
    covers: [
      'cord-lat', 'cord-post', 'cord-med',
      'n-musculocutaneous', 'n-axillary', 'n-radial', 'n-median', 'n-ulnar',
      'n-thoracodorsal', 'n-lower-subscap', 'n-mcn-arm', 'n-mcn-forearm',
    ],
    variable: ['n-lat-pectoral', 'n-med-pectoral', 'n-upper-subscap'],
    spares: ['n-suprascapular', 'n-phrenic', 'n-dorsal-scapular', 'n-long-thoracic', 'n-subclavius', 'n-supraclavicular-cx', 'n-intercostobrachial'],
    sideEffectIds: [],
    position: 'Supine, arm abducted to 90° (brings the plexus more superficial and lateral, away from the pleura).',
    equipment: 'Ultrasound with high-frequency linear probe, 100 mm echogenic needle.',
    needle: { length: '100 mm', type: 'Echogenic', plane: 'In-plane', direction: 'Cephalad to caudad' },
    probe: 'High-frequency linear probe placed parasagittally, just medial and inferior to the coracoid process.',
    landmark: 'Coracoid process. Probe parasagittal, inferior to it; identify the axillary artery.',
    approach: 'In-plane, cephalad to caudad (makes it easier to aim for the posterior cord).',
    sonoanatomy: [
      'Pectoralis major (superficial) and pectoralis minor',
      'Axillary artery in cross-section, axillary vein caudal / medial to it',
      'Cords around the artery: lateral ~9 o’clock, posterior ~6 o’clock, medial ~3 o’clock',
      'Subscapularis deep to the plexus; thoracodorsal vessels',
      'Lateral pectoral nerve between pectoral muscles, near the thoraco-acromial artery',
      'Pleura deep and medial (keep the needle tip in view)',
    ],
    sonoStructures: [
      { label: 'Pectoralis major', kind: 'muscle', ids: [] },
      { label: 'Pectoralis minor', kind: 'muscle', ids: [] },
      { label: 'Axillary artery', kind: 'artery', ids: [] },
      { label: 'Axillary vein', kind: 'vein', ids: [] },
      { label: 'Lateral cord', kind: 'nerve', ids: ['cord-lat'] },
      { label: 'Posterior cord', kind: 'nerve', ids: ['cord-post'] },
      { label: 'Medial cord', kind: 'nerve', ids: ['cord-med'] },
      { label: 'Subscapularis', kind: 'muscle', ids: [] },
      { label: 'Thoracodorsal vessels', kind: 'artery', ids: [] },
      { label: 'Lateral pectoral nerve', kind: 'nerve', ids: ['n-lat-pectoral'] },
      { label: 'Pleura', kind: 'pleura', ids: [] },
    ],
    needleTarget: 'Posterior to the axillary artery (6 o’clock), between the posterior cord and the artery; target the posterior cord first (with the lateral cord), and consider redirecting to the medial cord.',
    laDeposition: 'Deposit between the posterior cord and the artery, aiming for U-shaped spread around the artery. Reposition for the medial cord if spread does not reach it.',
    volume: '25 ml of 0.5% ropivacaine',
    coverageText: 'Similar to supraclavicular, but spares the suprascapular nerve, so it cannot be used for shoulder surgery. Spares the phrenic nerve. Good for securing catheters (muscular tunnel).',
    indications: 'Surgery of the mid-humerus / elbow and below. Good choice for continuous catheters.',
    complications: [
      'Deep target; vessels are not easily compressible',
      'Vascular puncture / intravascular injection',
      'Pneumothorax',
    ],
    pearls: [
      'Nerve stimulation to identify cords: posterior cord (radial) = finger and wrist extension; medial cord (median / ulnar) = finger and wrist flexion; lateral cord (musculocutaneous) = elbow flexion (biceps).',
      'Costoclavicular variant: local anaesthetic deposited more medially, in the costoclavicular space, where the cords are still clustered lateral to the axillary artery (like supraclavicular). The arm is abducted to move the clavicle up. Pneumothorax risk; good for catheter stability.',
      'Retroclavicular approach (RAPTIR): same view, but the needle is inserted deep to the clavicle.',
      'Abducting the arm brings the plexus more superficial and away from the pleura.',
    ],
    examQs: [
      { q: 'How can nerve stimulation help identify the cords?', a: 'Posterior cord (radial): finger and wrist extension. Medial cord (median / ulnar): finger and wrist flexion. Lateral cord (musculocutaneous): elbow flexion (biceps twitch).' },
      { q: 'Can an infraclavicular block be used for shoulder surgery?', a: 'No. The suprascapular nerve leaves the superior trunk well above the cords and is spared, so the shoulder joint is not reliably covered.' },
      { q: 'Name the structures in the parasagittal infraclavicular view.', a: 'Pectoralis major and minor, axillary artery and vein, lateral (9 o’clock), posterior (6 o’clock) and medial (3 o’clock) cords, subscapularis, thoracodorsal vessels, lateral pectoral nerve, pleura.' },
    ],
    coverage: {
      cutaneous: ['cut-upper-lateral-arm', 'cut-lower-lateral-arm', 'cut-posterior-arm', 'cut-posterior-forearm', 'cut-lateral-forearm', 'cut-lower-medial-arm', 'cut-medial-forearm', 'cut-palm-lateral', 'cut-dorsum-lateral-hand', 'cut-ulnar-hand'],
      motor: ['mot-deltoid', 'mot-lat-dorsi', 'mot-elbow-flexors', 'mot-elbow-extensors', 'mot-wrist-finger-flexors', 'mot-wrist-finger-extensors', 'mot-thenar', 'mot-hand-intrinsics'],
      osteotome: ['ost-humerus-distal', 'ost-elbow', 'ost-forearm', 'ost-wrist-hand'],
    },
    coverageVariable: {
      cutaneous: [],
      motor: ['mot-pectorals', 'mot-rotator-cuff'],
      osteotome: ['ost-humerus-proximal'],
    },
  },

  axillary: {
    id: 'axillary',
    name: 'Axillary block',
    level: 'terminal',
    targetIds: ['n-median', 'n-ulnar', 'n-radial', 'n-musculocutaneous'],
    covers: ['n-median', 'n-ulnar', 'n-radial', 'n-musculocutaneous', 'n-mcn-forearm'],
    variable: [],
    spares: [
      'n-axillary', 'n-suprascapular', 'n-mcn-arm', 'n-intercostobrachial', 'n-phrenic',
      'n-supraclavicular-cx', 'n-lat-pectoral', 'n-med-pectoral', 'n-thoracodorsal',
      'n-upper-subscap', 'n-lower-subscap', 'n-dorsal-scapular', 'n-long-thoracic', 'n-subclavius',
    ],
    separateInjectionIds: ['n-musculocutaneous'],
    sideEffectIds: [],
    position: 'Supine, arm abducted to 90°, elbow flexed and arm externally rotated (exposes the axilla).',
    equipment: 'Ultrasound with high-frequency linear probe, 50 mm echogenic needle.',
    needle: { length: '50 mm', type: 'Echogenic', plane: 'In-plane', direction: 'Anterior to posterior' },
    probe: 'High-frequency linear probe placed transversely across the axillary fossa / proximal arm.',
    landmark: 'Axillary fossa (too distal and you cannot see the conjoint tendon). Probe transverse; identify the axillary artery.',
    approach: 'In-plane, anterior to posterior.',
    sonoanatomy: [
      'Axillary artery with surrounding (compressible) axillary veins',
      'Median nerve anterior / superficial to the artery',
      'Ulnar nerve medial / posterior to the artery',
      'Radial nerve deep (posterior) to the artery, on the conjoint tendon',
      'Musculocutaneous nerve within / between coracobrachialis and biceps',
      'Biceps, coracobrachialis, triceps; conjoint tendon of teres major and latissimus dorsi; humerus',
      'Medial cutaneous nerve of the forearm superficial, near the vein',
    ],
    sonoStructures: [
      { label: 'Axillary artery', kind: 'artery', ids: [] },
      { label: 'Axillary veins', kind: 'vein', ids: [] },
      { label: 'Median nerve', kind: 'nerve', ids: ['n-median'] },
      { label: 'Ulnar nerve', kind: 'nerve', ids: ['n-ulnar'] },
      { label: 'Radial nerve', kind: 'nerve', ids: ['n-radial'] },
      { label: 'Musculocutaneous nerve', kind: 'nerve', ids: ['n-musculocutaneous'] },
      { label: 'Medial cutaneous nerve of forearm', kind: 'nerve', ids: ['n-mcn-forearm'] },
      { label: 'Biceps', kind: 'muscle', ids: [] },
      { label: 'Coracobrachialis', kind: 'muscle', ids: [] },
      { label: 'Triceps', kind: 'muscle', ids: [] },
      { label: 'Conjoint tendon (teres major / latissimus dorsi)', kind: 'other', ids: [] },
      { label: 'Humerus', kind: 'bone', ids: [] },
    ],
    needleTarget: 'Perivascular, around the axillary artery (median, ulnar, radial), plus a separate target: the musculocutaneous nerve in the coracobrachialis fascial plane.',
    laDeposition: 'Perivascular injection surrounding the axillary artery to bathe median, ulnar and radial nerves (including deep to the artery for the radial), and a separate injection around the musculocutaneous nerve within the coracobrachialis fascial plane.',
    volume: '25 ml of 0.5% ropivacaine',
    coverageText: 'Elbow, forearm, wrist and hand, but spares the shoulder (axillary and suprascapular nerves) and the upper arm. Misses the medial cutaneous nerve of the arm, but still covers the medial cutaneous nerve of the forearm. Intercostobrachial (T2) needs separate infiltration.',
    indications: 'Surgery at or below the elbow (forearm, wrist, hand).',
    complications: [
      'Intravascular injection (many veins in the area): the main risk',
      'Haematoma',
      'Incomplete block: musculocutaneous missed without a separate injection',
      'Safer than more proximal approaches: far from the pleura and phrenic nerve',
    ],
    pearls: [
      'If a nerve is hard to identify, trace it distally: median follows the brachial artery; ulnar moves posteriorly away from the artery towards the cubital tunnel; radial moves with the conjoint tendon and dives deep into the radial groove.',
      'Radial nerve is often the hardest to see: it lies deep to the artery and can be obscured by posterior acoustic enhancement.',
      'Musculocutaneous leaves the bundle early: always look for it in coracobrachialis and block it separately.',
      'Compress the probe gently to reveal (and avoid) collapsing veins; ask for colour Doppler.',
      'For the upper medial arm (tourniquet, medial incisions) add an intercostobrachial block: subcutaneous infiltration across the axillary crease (deck: 23G needle, 5 ml of 0.5% ropivacaine).',
    ],
    examQs: [
      { q: 'Which nerve in this view is the hardest to block?', a: 'Musculocutaneous leaves the bundle early and needs a separate injection. The radial nerve is often the most difficult to identify, lying posterior to the artery where posterior enhancement can obscure it.' },
      { q: 'Using a nerve stimulator, what movement would each nerve give?', a: 'Radial: extension of fingers, wrist and elbow (triceps). Ulnar: wrist flexion (FCU), flexion of digits 4–5 (FDP), thumb adduction. Median: wrist flexion (FCR), flexion of digits 1–3 (FPL, FDS, FDP), pronation. Musculocutaneous: elbow flexion (biceps).' },
      { q: 'Which upper limb nerves are spared by an axillary block, and what do they supply?', a: 'Axillary: shoulder joint and the regimental badge skin; motor to deltoid. Medial cutaneous nerve of the arm: lower medial arm skin. Intercostobrachial: upper medial arm and axilla.' },
      { q: 'How would you anaesthetise the upper medial arm?', a: 'Intercostobrachial nerve block by landmark: arm abducted and externally rotated; subcutaneous infiltration transversely across the axillary crease (deck: 23G needle, 5 ml of 0.5% ropivacaine).' },
    ],
    coverage: {
      cutaneous: ['cut-lateral-forearm', 'cut-medial-forearm', 'cut-posterior-forearm', 'cut-palm-lateral', 'cut-dorsum-lateral-hand', 'cut-ulnar-hand'],
      motor: ['mot-elbow-flexors', 'mot-wrist-finger-flexors', 'mot-wrist-finger-extensors', 'mot-thenar', 'mot-hand-intrinsics'],
      osteotome: ['ost-elbow', 'ost-forearm', 'ost-wrist-hand'],
    },
    coverageVariable: {
      cutaneous: ['cut-posterior-arm', 'cut-lower-lateral-arm'],
      motor: ['mot-elbow-extensors'],
      osteotome: ['ost-humerus-distal'],
    },
  },
};

// Comparison table rows for quick revision (from slide 103 and the coverage slides).
export const BLOCK_SUMMARY = BLOCK_ORDER.map((id) => {
  const b = BLOCKS[id];
  return { id, name: b.name, level: b.level, volume: b.volume, needle: b.needle.length, approach: b.approach, indications: b.indications };
});

// ---------------------------------------------------------------------------
// Helpers (pure; safe for any module to use)
// ---------------------------------------------------------------------------
export function getAncestors(id) {
  const out = new Set();
  const walk = (x) => { for (const p of ELEMENTS[x]?.parents || []) if (!out.has(p)) { out.add(p); walk(p); } };
  walk(id);
  return [...out];
}

export function getDescendants(id) {
  const out = new Set();
  const walk = (x) => { for (const c of ELEMENTS[x]?.children || []) if (!out.has(c)) { out.add(c); walk(c); } };
  walk(id);
  return [...out];
}

/** Element plus all ancestors and descendants: the full "pathway" to highlight. */
export function getPathway(id) {
  if (!ELEMENTS[id]) return [];
  return [...getAncestors(id), id, ...getDescendants(id)];
}

/** Status of an element for a block: 'target' | 'covers' | 'variable' | 'spares' | null (not involved). */
export function blockStatus(blockId, id) {
  const b = BLOCKS[blockId];
  if (!b) return null;
  if (b.targetIds.includes(id)) return 'target';
  if (b.covers.includes(id)) return 'covers';
  if (b.variable.includes(id)) return 'variable';
  if (b.spares.includes(id)) return 'spares';
  return null;
}

/** Status of a coverage region for a block: 'covers' | 'variable' | 'spares'. */
export function regionStatus(blockId, regionId) {
  const b = BLOCKS[blockId];
  const r = REGIONS[regionId];
  if (!b || !r) return null;
  if (b.coverage[r.type].includes(regionId)) return 'covers';
  if (b.coverageVariable[r.type].includes(regionId)) return 'variable';
  return 'spares';
}

/** Regions supplied (in whole or part) by an element or any of its descendants. */
export function regionsForElement(id) {
  const ids = new Set([id, ...getDescendants(id)]);
  return Object.keys(REGIONS).filter((k) => REGIONS[k].nerves.some((n) => ids.has(n)));
}
