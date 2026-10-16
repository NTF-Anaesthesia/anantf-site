// Forearm and hand blocks: block data (schema: ../../../shared/regional/DATA.md, "Block schema"; arm figures:
// ../../../shared/regional/js/figures/arm.js). Written to mainstream UK and European practice; the nerve territories and
// motor tests are the brachial plexus app's (brachial-plexus/js/data.js). No citations on these pages.
import { armCoverageMap } from '../../../shared/regional/js/figures/arm.js';
import { SCENES } from './scenes.js?v=20261016';

const qa = (q, a) => ({ source: 'Practice question', q: `<p>${q}</p>`, points: a.split(/(?<=[.;])\s+(?=[A-Z])/) });
const ul = (items) => `<ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;

const NO_TQ = '<strong>An upper-arm tourniquet</strong>: these blocks are below it. For a tourniquet you need a brachial plexus block (and the intercostobrachial nerve), or keep tourniquet time short with sedation.';

export const BLOCKS = [
  // ------------------------------------------------------------------ median
  {
    id: 'median-forearm',
    kicker: 'Forearm · Median nerve',
    title: 'Median nerve block in the forearm',
    summary: 'The median nerve blocked <strong>between flexor digitorum superficialis and profundus</strong> in the middle of the forearm, where it has no artery beside it. Numbs the <strong>lateral palm and the palmar side of the thumb, index, middle and half the ring finger</strong> (with their nail beds) and weakens the thenar muscles. Used to <strong>rescue</strong> a patchy brachial plexus block or, with the ulnar and radial blocks, for hand surgery without a tourniquet.',
    indications: ['Rescue of a patchy brachial plexus block (median territory)', 'Hand and finger surgery with the ulnar and radial blocks', 'Carpal tunnel release with wide-awake local anaesthesia as the alternative'],
    glance: {
      position: 'Supine, arm out on a table, palm up',
      probe: 'Linear, transverse on the front of the mid-forearm',
      needle: '50 mm, in-plane or out-of-plane',
      dose: '3–5 ml of 0.5% ropivacaine',
      covers: 'Lateral palm, palmar thumb, index, middle and half the ring finger',
    },
    anatomy3d: { plexus: 'brachial', el: 'n-median', brachialApp: { el: 'n-median' } },
    scene: SCENES.median,
    position: '<p>Supine, the arm abducted on an arm board, forearm supinated (palm up).</p>',
    equipment: ['High-frequency linear probe', '50 mm block needle', '3–5 ml of 0.5% ropivacaine per nerve'],
    landmarks: '<p>Start at the wrist crease, where the median nerve sits under the flexor retinaculum among the tendons, and slide proximally to the middle of the forearm, where it lies between the muscle bellies. Here it is easy to tell from a tendon: it does not move into a muscle as you scan.</p>',
    approach: '<p>In-plane from either side (choose a path away from the radial and ulnar arteries), or out-of-plane with small steps of hydrodissection.</p>',
    sonoanatomy: ul([
      'The median nerve: a flattened honeycomb oval in the middle of the forearm',
      'Flexor digitorum superficialis superficial to it, flexor digitorum profundus deep',
      'No artery beside it (the radial artery is lateral and superficial, the ulnar artery medial with the ulnar nerve)',
    ]),
    target: '<p>Beside the nerve, inside the plane between the two muscles: watch the local anaesthetic surround it.</p>',
    dose: { volume: '3–5 ml', conc: '0.5%', drug: 'ropivacaine', note: 'Count it with the brachial plexus dose when you rescue a block.' },
    coverage: {
      map: armCoverageMap,
      side: 'unilateral',
      areas: [{ zones: ['palm-lat'], density: 'dense' }, { zones: ['wrist-hand'], density: 'patchy' }],
      summary: 'Lateral palm and palmar side of the thumb, index, middle and half the ring finger, with their nail beds. Weakens the thenar muscles and the lateral two lumbricals.',
      mechanism: '<p>The median nerve (C6–T1) runs down the middle of the forearm between flexor digitorum superficialis and profundus, then through the carpal tunnel. Its palmar cutaneous branch leaves about 5 cm above the wrist crease, so a block in the mid-forearm catches it.</p>',
      density: '<p>Dense and quick in the hand. The forearm muscles it supplies are mostly above the block, so finger flexion is only partly weakened.</p>',
      misses: ul([NO_TQ, '<strong>The ulnar and radial territories</strong>: block them too for most hand surgery.', '<strong>The forearm skin</strong> (lateral and medial cutaneous nerves of the forearm).']),
    },
    complications: ['Nerve injury or intraneural injection: stop with a shock, pain or high pressure', 'Vascular puncture (radial or ulnar artery if the path strays)', 'Local anaesthetic systemic toxicity when added to a brachial plexus block'],
    pearls: [
      'Scan from the wrist up: tendons become muscle, the nerve stays a nerve.',
      'The forearm, not the carpal tunnel: blocking in the tunnel risks injecting into a nerve with no room to spare.',
      { safety: true, html: 'A rescue block goes into a numb arm: the patient cannot warn you of nerve contact. Use small volumes, low pressure and watch the spread.' },
    ],
    exam: [
      qa('A supraclavicular block for hand surgery has spared the thumb and index finger. What do you do?', 'Test each nerve territory to find the gap (median: palmar thumb and index; radial: first web space dorsum; ulnar: little finger). Wait if it is early: onset can take 30 minutes. Then rescue the missing nerve in the forearm or at the elbow under ultrasound with small volumes, counting the total dose. Supplement with local infiltration or convert to general anaesthesia if needed.'),
    ],
  },

  // ------------------------------------------------------------------ ulnar
  {
    id: 'ulnar-forearm',
    kicker: 'Forearm · Ulnar nerve',
    title: 'Ulnar nerve block in the forearm',
    summary: 'The ulnar nerve blocked under <strong>flexor carpi ulnaris</strong> in the forearm, where it has moved away from the ulnar artery. Numbs the <strong>medial hand and the little finger and half the ring finger, front and back</strong> (block above the dorsal branch, which leaves about 5 cm above the wrist), and weakens the hand intrinsics.',
    indications: ['Rescue of an ulnar-sparing brachial plexus block (common after supraclavicular)', 'Little finger and ulnar-side hand surgery', 'With the median and radial blocks for hand surgery'],
    glance: {
      position: 'Supine, arm out, palm up',
      probe: 'Linear, transverse on the ulnar side of the front of the forearm',
      needle: '50 mm, in-plane from the ulnar side',
      dose: '3–5 ml of 0.5% ropivacaine',
      covers: 'Medial hand, little finger and half the ring finger, front and back',
    },
    anatomy3d: { plexus: 'brachial', el: 'n-ulnar', brachialApp: { el: 'n-ulnar' } },
    scene: SCENES.ulnar,
    position: '<p>Supine, the arm abducted on an arm board, palm up.</p>',
    equipment: ['High-frequency linear probe with colour Doppler', '50 mm block needle', '3–5 ml of 0.5% ropivacaine'],
    landmarks: '<p>At the wrist the ulnar nerve lies with the ulnar artery under flexor carpi ulnaris. Slide proximally: the nerve moves away from the artery towards the ulnar side. Block it where they have separated, a third to halfway up the forearm, above the dorsal cutaneous branch.</p>',
    approach: '<p>In-plane from the ulnar side, so the needle reaches the nerve before the artery.</p>',
    sonoanatomy: ul([
      'Flexor carpi ulnaris over the nerve on the ulnar side',
      'The ulnar nerve: a honeycomb oval, moving away from the ulnar artery as you scan proximally',
      'The ulnar artery on its radial side (colour Doppler)',
    ]),
    target: '<p>Beside the nerve under flexor carpi ulnaris, away from the artery.</p>',
    dose: { volume: '3–5 ml', conc: '0.5%', drug: 'ropivacaine', note: 'Count it with any brachial plexus dose.' },
    coverage: {
      map: armCoverageMap,
      side: 'unilateral',
      areas: [{ zones: ['ulnar-hand'], density: 'dense' }, { zones: ['wrist-hand'], density: 'patchy' }],
      summary: 'Medial hand and the little finger and half the ring finger, front and back. Weakens the interossei, hypothenar muscles and adductor pollicis.',
      mechanism: '<p>The ulnar nerve (C8–T1, from the medial cord) passes behind the medial epicondyle and runs down the forearm under flexor carpi ulnaris, joining the ulnar artery in the lower forearm. Its dorsal branch leaves about 5 cm above the wrist: a forearm block catches it, a wrist block may not.</p>',
      density: '<p>Dense in the hand. Finger abduction weakens: a useful test.</p>',
      misses: ul([NO_TQ, '<strong>The median and radial territories</strong>.', '<strong>The medial forearm skin</strong> (medial cutaneous nerve of the forearm).']),
    },
    complications: ['Ulnar artery puncture: approach from the ulnar side and use colour Doppler', 'Nerve injury or intraneural injection', 'Local anaesthetic systemic toxicity when added to a brachial plexus block'],
    pearls: [
      'Scan up from the wrist until the nerve has left the artery: then the needle can reach it without passing the artery.',
      { safety: true, html: 'Avoid blocking the ulnar nerve at the elbow (in the cubital tunnel): it is tightly confined there and easily injured.' },
      'Test it with finger abduction and sensation over the little finger.',
    ],
    exam: [
      qa('Why is a supraclavicular block more likely than an infraclavicular block to spare the ulnar nerve?', 'At the supraclavicular level the inferior trunk (C8–T1) lies deepest, on the first rib beside the subclavian artery, and is easily missed unless the corner pocket is injected. At the cord level the medial cord is reached by U-shaped spread around the axillary artery.'),
    ],
  },

  // ------------------------------------------------------------------ radial at the elbow
  {
    id: 'radial-elbow',
    kicker: 'Elbow · Radial nerve',
    title: 'Radial nerve block at the elbow',
    summary: 'The radial nerve blocked <strong>above the elbow, between brachialis and brachioradialis</strong>, before it divides into its superficial (sensory) and deep (motor) branches. Numbs the <strong>back of the lateral hand and thumb</strong> (first web space) and weakens wrist and finger extension.',
    indications: ['Rescue of a patchy brachial plexus block (radial territory)', 'With the median and ulnar blocks for hand surgery', 'Thumb base and first web space surgery (with the median block)'],
    glance: {
      position: 'Supine, arm out, elbow straight, palm up',
      probe: 'Linear, transverse on the lateral front of the arm, 3–4 cm above the elbow crease',
      needle: '50 mm, in-plane, lateral to medial',
      dose: '3–5 ml of 0.5% ropivacaine',
      covers: 'Back of the lateral hand and thumb; wrist and finger extension weak',
    },
    anatomy3d: { plexus: 'brachial', el: 'n-radial', brachialApp: { el: 'n-radial' } },
    scene: SCENES.radial,
    position: '<p>Supine, the arm abducted on an arm board, elbow straight.</p>',
    equipment: ['High-frequency linear probe with colour Doppler', '50 mm block needle', '3–5 ml of 0.5% ropivacaine'],
    landmarks: '<p>Probe transverse on the lateral side of the front of the arm, 3–4 cm above the elbow crease. Find the humerus; the nerve lies on it in the groove between brachioradialis and brachialis. Above, it curves round the back of the humerus in the spiral groove; below the elbow it divides.</p>',
    approach: '<p>In-plane, lateral to medial, through the edge of brachioradialis to beside the nerve.</p>',
    sonoanatomy: ul([
      'Brachioradialis laterally, brachialis medially, the humerus deep',
      'The radial nerve: a honeycomb oval in the fat between the two muscles',
      'A small radial collateral artery may lie beside it (colour Doppler)',
    ]),
    target: '<p>Beside the nerve in the groove, above its division.</p>',
    dose: { volume: '3–5 ml', conc: '0.5%', drug: 'ropivacaine', note: 'Count it with any brachial plexus dose.' },
    coverage: {
      map: armCoverageMap,
      side: 'unilateral',
      areas: [{ zones: ['dorsum-lat-hand'], density: 'dense' }, { zones: ['post-forearm', 'wrist-hand'], density: 'patchy' }],
      summary: 'Back of the lateral hand and thumb (first web space). Weakens wrist and finger extension (the posterior interosseous nerve).',
      mechanism: '<p>The radial nerve (C5–T1, from the posterior cord) winds round the back of the humerus in the spiral groove, pierces the lateral intermuscular septum and runs between brachialis and brachioradialis in front of the lateral epicondyle, where it divides into the superficial (sensory) and deep (posterior interosseous, motor) branches.</p>',
      density: '<p>Dense for the back of the lateral hand. The posterior cutaneous nerve of the forearm usually leaves higher up, so the back of the forearm is variable.</p>',
      misses: ul([NO_TQ, '<strong>The median and ulnar territories</strong>.', '<strong>The lateral forearm skin</strong> (lateral cutaneous nerve of the forearm, from the musculocutaneous nerve).']),
    },
    complications: ['Nerve injury or intraneural injection', 'Vascular puncture (radial collateral or recurrent vessels)', 'Wrist drop while it lasts: splint or support the hand', 'Local anaesthetic systemic toxicity when added to a brachial plexus block'],
    pearls: [
      'Find the humerus first, then the groove between the two muscles: the nerve is on the bone.',
      'Above the elbow catches both branches; the superficial branch alone can be blocked at the wrist.',
      { safety: true, html: 'Warn the patient: the wrist and fingers will not extend until it wears off. Protect the hand.' },
    ],
    exam: [
      qa('Describe the course of the radial nerve and where it can be blocked.', 'From the posterior cord, behind the axillary artery, along the conjoint tendon into the spiral groove of the humerus with the profunda brachii artery, through the lateral intermuscular septum to lie between brachialis and brachioradialis above the elbow, where it divides into superficial and deep branches. Block it in the axilla (deep to the artery), above the elbow (between brachialis and brachioradialis) or its superficial branch at the wrist (subcutaneous fan).'),
    ],
  },

  // ------------------------------------------------------------------ wrist block
  {
    id: 'wrist',
    kicker: 'Hand · Landmark',
    title: 'Wrist block',
    summary: 'Three injections at the wrist: the <strong>median nerve</strong> between palmaris longus and flexor carpi radialis, the <strong>ulnar nerve</strong> under flexor carpi ulnaris, and a <strong>subcutaneous fan</strong> for the superficial radial nerve. Numbs the hand with no motor block of the forearm, so the patient can still move the fingers (useful for tendon repairs). <strong>No tourniquet above the wrist.</strong>',
    indications: ['Hand and finger surgery distal to the wrist with no arm tourniquet', 'Wide-awake style hand surgery with a forearm or wrist tourniquet only briefly', 'Analgesia after hand surgery'],
    glance: {
      position: 'Supine, arm out, palm up, wrist over a rolled towel',
      probe: 'Landmarks (ultrasound optional)',
      needle: '25G, 25 mm',
      dose: '3–5 ml of 0.5% ropivacaine per nerve',
      covers: 'The hand: median, ulnar and superficial radial territories',
    },
    anatomy3d: { plexus: 'brachial', el: 'n-median', brachialApp: { el: 'n-median' } },
    scene: SCENES.wrist,
    position: '<p>Supine, the arm out on an arm board, palm up, wrist slightly extended over a rolled towel.</p>',
    equipment: ['25G 25 mm needle (a 50 mm block needle for the ulnar nerve in a large wrist)', '3–5 ml of 0.5% ropivacaine per nerve; 5 ml for the radial fan', 'Chlorhexidine; an ultrasound probe if you prefer to see the nerves'],
    landmarks: '<p>Mark the <strong>proximal wrist crease</strong>, <strong>palmaris longus</strong> (oppose thumb and little finger with the wrist flexed), <strong>flexor carpi radialis</strong>, <strong>flexor carpi ulnaris</strong> and the <strong>radial and ulnar pulses</strong>. Absent palmaris longus (in about 1 in 7): the median nerve is just to the ulnar side of flexor carpi radialis.</p>',
    approach: '<p>Median: perpendicular to the skin between palmaris longus and flexor carpi radialis, through the deep fascia. Ulnar: horizontally from the ulnar side under flexor carpi ulnaris. Radial: a subcutaneous ring from the radial artery round to the back of the wrist.</p>',
    sonoanatomy: '<p>With ultrasound, the median nerve is the honeycomb oval beneath palmaris longus that does not move into a muscle as you scan up; the ulnar nerve lies on the ulnar side of the ulnar artery under flexor carpi ulnaris.</p>',
    target: '<p>Median: deep to the deep fascia, beside (not in) the nerve. Ulnar: under flexor carpi ulnaris, on the ulnar side of the artery. Radial: subcutaneous, superficial to the tendons and the artery.</p>',
    dose: { volume: '3–5 ml', conc: '0.5%', drug: 'ropivacaine', per: 'per nerve', note: 'Median 3–5 ml, ulnar 3–5 ml, superficial radial 5 ml as a subcutaneous fan: up to 15 ml in all. Plain solution: no adrenaline is needed here.' },
    coverage: {
      map: armCoverageMap,
      side: 'unilateral',
      areas: [{ zones: ['palm-lat', 'ulnar-hand', 'dorsum-lat-hand'], density: 'dense' }, { zones: ['wrist-hand'], density: 'patchy' }],
      summary: 'The hand: median, ulnar and superficial radial territories. The finger flexors and extensors (in the forearm) still work.',
      mechanism: '<p>Three nerves cross the wrist to the hand: the median under the flexor retinaculum, the ulnar beside the ulnar artery in Guyon’s canal, and the superficial radial branch in the subcutaneous fat. The forearm muscles that move the fingers are supplied above the wrist, so they keep working.</p>',
      density: '<p>Good for the fingers and palm. The ulnar dorsal branch and the palmar cutaneous branch of the median nerve leave above the wrist: add the subcutaneous lines described, or infiltrate.</p>',
      misses: ul([NO_TQ, '<strong>The wrist joint and the carpal bones</strong> (deep branches above the wrist).', '<strong>The forearm</strong>.']),
    },
    complications: ['Nerve injury: stop with a shock or pain and withdraw', 'Carpal tunnel compression if a large volume is put inside the tunnel', 'Vascular puncture (radial or ulnar artery)', 'Local anaesthetic systemic toxicity (small doses, but count them with infiltration)'],
    pearls: [
      'Inject proximal to the carpal tunnel, not into it: there is no room for volume inside.',
      { safety: true, html: 'Ulnar: always from the ulnar side under flexor carpi ulnaris, so the artery is on the far side of the nerve.' },
      'Fingers that still move are a feature, not a failure: the surgeon can test a tendon repair during the operation.',
      'For a single finger, a digital block is simpler.',
    ],
    exam: [
      qa('Describe a wrist block.', 'Three nerves. Median: between palmaris longus and flexor carpi radialis at the proximal wrist crease, through the deep fascia, 3–5 ml, plus a subcutaneous line for the palmar cutaneous branch. Ulnar: from the ulnar side under flexor carpi ulnaris, on the ulnar side of the ulnar artery, 3–5 ml, plus a subcutaneous line round the ulnar side for the dorsal branch. Superficial radial: a subcutaneous fan from the radial artery round to the back of the wrist, 5 ml. No arm tourniquet; motor function of the fingers is kept.'),
    ],
  },
];
