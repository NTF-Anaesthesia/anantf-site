/* Upper-limb operations: the data behind the "Which block for which operation" chooser on /upper-limb/ and the merged
   chooser on /blocks/. Data only, plus upperLimbCoverageMap(), the arm figure the chooser draws for an operation.
   Doses are the ones used on the block pages (the brachial plexus app's for the plexus blocks). No sources or references
   are shown on the page.

   Schema (one entry per operation), the same as ops-lowerlimb.js:
     id       deep link #op-<id> on the upper-limb landing
     region   OP_REGIONS key: the group the chooser lists it under
     name     chooser label and result title
     line     "In one line" summary
     cover    area to cover (words)          tq   tourniquet note (optional)
     map      {views?, areas: [{zones, density}]}: arm.js zones; dense = core, moderate = often involved (optional)
     groups   [{label, items: [{name, dose?, blocks?: [LINKS key], why?}]}]; a label starting "Not" is shown as not recommended
     misses   [text]       notes  [text]       more  [LINKS key]: extra links under the result
   Links are relative to the region folder (REGION.path); blockHref(key, base) adds a base. */
import { armCoverageMap } from '../figures/arm.js';

export const REGION = { id: 'upper-limb', title: 'Upper-limb blocks', path: 'upper-limb/' };

/* Where each block lives: [href, link text, page name]. */
export const LINKS = {
  isb: ['shoulder/#ch-interscalene', 'interscalene block', 'shoulder'],
  stb: ['shoulder/#ch-superior-trunk', 'superior trunk block', 'shoulder'],
  ssn: ['shoulder/#ch-suprascapular', 'suprascapular nerve block', 'shoulder'],
  anb: ['shoulder/#ch-axillary-nerve', 'axillary nerve block', 'shoulder'],
  phrenic: ['shoulder/#ch-choose', 'shoulder blocks and the phrenic nerve', 'shoulder'],
  scb: ['arm/#ch-supraclavicular', 'supraclavicular block', 'arm'],
  icb: ['arm/#ch-infraclavicular', 'infraclavicular block', 'arm'],
  ccb: ['arm/#ch-costoclavicular', 'costoclavicular block', 'arm'],
  raptir: ['arm/#ch-raptir', 'RAPTIR (retroclavicular) block', 'arm'],
  axb: ['arm/#ch-axillary', 'axillary block', 'arm'],
  icbn: ['arm/#axillary-icbn', 'intercostobrachial block', 'arm'],
  compare: ['arm/#ch-choose', 'brachial plexus blocks compared', 'arm'],
  median: ['forearm-hand/#ch-median-forearm', 'median nerve block', 'forearm and hand'],
  ulnar: ['forearm-hand/#ch-ulnar-forearm', 'ulnar nerve block', 'forearm and hand'],
  radial: ['forearm-hand/#ch-radial-elbow', 'radial nerve block at the elbow', 'forearm and hand'],
  wrist: ['forearm-hand/#ch-wrist', 'wrist block', 'forearm and hand'],
  rescue: ['forearm-hand/#ch-test', 'testing and rescuing a block', 'forearm and hand'],
  scp: ['../head-neck/cervical/#ch-scp', 'superficial cervical plexus block', 'head and neck'],
  clavipectoral: ['../truncal/chest-wall/#clavipectoral', 'clavipectoral fascial plane block', 'chest wall'],
};

/* Regions group the operations in the chooser. */
export const OP_REGIONS = [
  ['shoulder', 'Shoulder and clavicle'],
  ['arm', 'Arm and elbow'],
  ['hand', 'Forearm, wrist and hand'],
  ['other', 'Other'],
];

export const OPS = [
  // ------------------------------------------------------------------ shoulder
  {
    id: 'arthroscopy', region: 'shoulder', name: 'Shoulder arthroscopy and rotator cuff repair',
    line: 'Interscalene block, with port infiltration; a superior trunk block if you want to spare the diaphragm.',
    cover: 'The shoulder joint (suprascapular, axillary and lateral pectoral nerves) and the port sites over the shoulder (supraclavicular nerves and the axillary nerve’s skin branch).',
    map: { areas: [{ zones: ['shoulder-joint', 'upper-lat-arm'], density: 'dense' }, { zones: ['cape'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Interscalene block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['isb'], why: 'The most reliable shoulder analgesia. It blocks the phrenic nerve in almost every patient: check the patient can afford a weak hemidiaphragm.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Superior trunk block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['stb'], why: 'Similar analgesia with much less hemidiaphragmatic paresis.' },
        { name: 'Suprascapular + axillary nerve blocks', dose: '5–10 ml of 0.5% ropivacaine for each', blocks: ['ssn', 'anb'], why: 'Phrenic-sparing; a little less analgesia in the first hours. Good when the lungs are poor.' },
      ] },
    ],
    misses: [
      'Port sites in the cape of the shoulder (supraclavicular nerves): ask the surgeon to infiltrate them.',
      'A posterior port low in the axilla can reach intercostobrachial skin.',
    ],
    notes: [
      'Beach-chair position: the block can unmask the Bezold–Jarisch reflex (sudden bradycardia and hypotension). Have atropine and a vasopressor ready.',
      'Rebound pain when the block wears off (often the first night): start regular oral analgesia before it does, and tell the patient.',
      'Never block both sides with an interscalene block.',
    ],
    more: ['phrenic'],
  },
  {
    id: 'arthroplasty', region: 'shoulder', name: 'Shoulder replacement (total or reverse)',
    line: 'Interscalene block (a catheter if available), plus a superficial cervical plexus block or infiltration for the top of the deltopectoral incision.',
    cover: 'The whole shoulder joint, the proximal humerus, and a deltopectoral incision that runs from below the clavicle down the front of the arm.',
    map: { areas: [{ zones: ['shoulder-joint', 'humerus-prox', 'upper-lat-arm'], density: 'dense' }, { zones: ['cape', 'clavicle'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Interscalene block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['isb'], why: 'Covers the joint and the proximal humerus. A catheter extends analgesia for a day or two.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Superior trunk block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['stb'], why: 'When the diaphragm matters.' },
        { name: 'Superficial cervical plexus block, as an add-on', blocks: ['scp'], why: 'The supraclavicular nerves: the upper end of the incision and the cape.' },
        { name: 'Suprascapular + axillary nerve blocks', dose: '5–10 ml of 0.5% ropivacaine for each', blocks: ['ssn', 'anb'], why: 'Phrenic-sparing, with infiltration of the incision.' },
      ] },
    ],
    misses: [
      'The upper end of the incision and the cape (supraclavicular nerves).',
      'The lower medial end of a long incision (intercostobrachial and medial cutaneous nerve of the arm).',
    ],
    notes: [
      'Document deltoid and hand function before the block: the axillary and other nerves can be injured during the surgery.',
      'Plan for the block wearing off: regular analgesia from day 0.',
    ],
    more: ['phrenic'],
  },
  {
    id: 'lungs', region: 'shoulder', name: 'Shoulder surgery with poor respiratory reserve',
    line: 'Spare the diaphragm: suprascapular plus axillary nerve blocks, or a superior trunk block with a lower volume. Not an interscalene block.',
    cover: 'The shoulder joint, without weakening the diaphragm (severe COPD, obesity, a contralateral phrenic palsy or pneumonectomy).',
    map: { areas: [{ zones: ['shoulder-joint'], density: 'dense' }, { zones: ['upper-lat-arm'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Suprascapular + axillary nerve blocks', dose: '5–10 ml of 0.5% ropivacaine for each', blocks: ['ssn', 'anb'], why: 'Far from the phrenic nerve. A little less analgesia in the first hours: plan multimodal analgesia.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Superior trunk block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['stb'], why: 'Much less phrenic palsy than interscalene, but not none: weigh it for each patient.' },
      ] },
      { label: 'Not recommended', items: [
        { name: 'Interscalene block', blocks: ['isb'], why: 'Hemidiaphragmatic paresis in almost every patient; a lower volume reduces it but does not abolish it.' },
        { name: 'Supraclavicular block', blocks: ['scb'], why: 'Phrenic paresis in up to about a third, and the suprascapular nerve may be missed.' },
      ] },
    ],
    misses: ['The cape and port sites: infiltration.', 'The anterior capsule partly (lateral pectoral nerve).'],
    notes: [
      'If in doubt, look at the diaphragm with ultrasound before and after the block.',
      'Decide the airway plan with the block in mind: a general anaesthetic may still be the safer choice.',
    ],
    more: ['phrenic'],
  },
  {
    id: 'humerus-prox', region: 'shoulder', name: 'Proximal humerus fracture: fixation or hemiarthroplasty',
    line: 'Interscalene or superior trunk block; a supraclavicular block if the fracture extends into the shaft.',
    cover: 'The proximal humerus and the shoulder joint, and the deltopectoral or deltoid-split incision.',
    map: { areas: [{ zones: ['humerus-prox', 'shoulder-joint', 'upper-lat-arm'], density: 'dense' }, { zones: ['humerus-dist', 'cape'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Interscalene block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['isb'], why: 'C5–C6: the proximal humerus and the joint.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Superior trunk block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['stb'], why: 'When the diaphragm matters.' },
        { name: 'Supraclavicular block', dose: '15–20 ml of 0.5% ropivacaine (75–100 mg)', blocks: ['scb'], why: 'For fractures extending down the shaft; the suprascapular nerve (posterior shoulder) is variable.' },
      ] },
    ],
    misses: ['The cape (supraclavicular nerves).', 'The medial arm (intercostobrachial nerve) for a long medial incision.'],
    notes: ['Check and document axillary nerve function (deltoid, the regimental badge) and the radial nerve before any block: they are often injured by the fracture.'],
  },
  {
    id: 'clavicle', region: 'shoulder', name: 'Clavicle fracture fixation',
    line: 'Superficial cervical plexus block for the skin, with an interscalene or superior trunk block for the bone; or general anaesthesia with the cervical plexus block alone.',
    cover: 'The skin over the clavicle (supraclavicular nerves, C3–C4) and the bone (a mixed supply: nerve to subclavius, suprascapular and lateral pectoral nerves).',
    map: { areas: [{ zones: ['clavicle', 'cape'], density: 'dense' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Superficial cervical plexus block', blocks: ['scp'], why: 'The supraclavicular nerves: the skin of the incision.' },
        { name: 'Plus an interscalene or superior trunk block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['isb', 'stb'], why: 'The brachial plexus part of the bone supply. Both blocks together can weaken the diaphragm.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Clavipectoral fascial plane block', blocks: ['clavipectoral'], why: 'A newer option for the bone, under the clavicle’s periosteal fascia; less evidence.' },
      ] },
    ],
    misses: ['The medial end of the clavicle (the sternoclavicular joint has a separate supply).'],
    notes: ['The subclavian vessels and pleura lie under the clavicle: the surgeon’s drill is a bigger risk than the block.'],
  },
  // ------------------------------------------------------------------ arm and elbow
  {
    id: 'humerus-shaft', region: 'arm', name: 'Humeral shaft fracture fixation',
    line: 'Supraclavicular block; an infraclavicular block for the distal two-thirds. Check the radial nerve first.',
    cover: 'The humeral shaft and the incision (anterolateral or posterior), and the elbow for distal fractures.',
    tq: 'Usually none, or a sterile tourniquet high on the arm: add an intercostobrachial block.',
    map: { areas: [{ zones: ['humerus-prox', 'humerus-dist', 'lower-lat-arm', 'post-arm'], density: 'dense' }, { zones: ['elbow', 'upper-lat-arm', 'lower-med-arm'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Supraclavicular block', dose: '15–20 ml of 0.5% ropivacaine (75–100 mg)', blocks: ['scb'], why: 'The whole humerus and the arm.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Infraclavicular block', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['icb'], why: 'Mid and distal shaft; no phrenic block.' },
        { name: 'Interscalene block', dose: '15 ml of 0.5% ropivacaine (75 mg)', blocks: ['isb'], why: 'Proximal shaft only; C8–T1 spared.' },
      ] },
    ],
    misses: ['The medial upper arm (intercostobrachial nerve).'],
    notes: ['Radial nerve palsy is common with shaft fractures: test and document wrist and finger extension before any block, and agree a plan with the surgeon.'],
    more: ['icbn'],
  },
  {
    id: 'elbow', region: 'arm', name: 'Elbow surgery (fracture fixation, arthroscopy, arthrolysis)',
    line: 'Supraclavicular or infraclavicular block; an axillary block works for the elbow joint itself.',
    cover: 'The elbow joint (musculocutaneous, radial, median and ulnar nerves) and the incision (posterior for most fractures), with an upper-arm tourniquet.',
    tq: 'Upper arm: supraclavicular and infraclavicular blocks usually cover it; add an intercostobrachial block for the medial side.',
    map: { areas: [{ zones: ['elbow', 'humerus-dist', 'post-arm', 'lower-lat-arm', 'lower-med-arm'], density: 'dense' }, { zones: ['forearm-bones', 'lat-forearm', 'med-forearm', 'post-forearm'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Supraclavicular block', dose: '15–20 ml of 0.5% ropivacaine (75–100 mg)', blocks: ['scb'], why: 'Arm, elbow and forearm; corner pocket first so the ulnar side is covered.' },
        { name: 'Infraclavicular block', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['icb'], why: 'Equally good below the shoulder; no phrenic block; good for a catheter after arthrolysis.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Costoclavicular block', dose: '20 ml of 0.5% ropivacaine (100 mg)', blocks: ['ccb'], why: 'One injection, faster onset.' },
        { name: 'Axillary block', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['axb'], why: 'Covers the elbow joint; the posterior arm skin is variable.' },
      ] },
    ],
    misses: ['The upper medial arm under the tourniquet (intercostobrachial nerve).'],
    notes: ['After elbow arthrolysis the surgeon may want early movement: a catheter (infraclavicular or costoclavicular) helps.', 'Test and document ulnar nerve function before the block when the ulnar nerve is at risk (medial approach, transposition).'],
    more: ['icbn', 'compare'],
  },
  // ------------------------------------------------------------------ forearm, wrist and hand
  {
    id: 'forearm', region: 'hand', name: 'Forearm and distal radius fracture fixation',
    line: 'Axillary or infraclavicular block, with an intercostobrachial block for the tourniquet.',
    cover: 'The radius and ulna, the wrist, and the incision (volar for most distal radius plates), with an upper-arm tourniquet.',
    tq: 'Upper arm: add an intercostobrachial block (5 ml subcutaneously across the axillary crease).',
    map: { areas: [{ zones: ['forearm-bones', 'wrist-hand', 'lat-forearm', 'med-forearm', 'post-forearm'], density: 'dense' }, { zones: ['palm-lat', 'dorsum-lat-hand', 'ulnar-hand'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Axillary block', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['axb'], why: 'Far from the pleura and the phrenic nerve. Block the musculocutaneous nerve separately: it supplies the radial side of the forearm.' },
        { name: 'Infraclavicular block', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['icb'], why: 'One injection; covers the musculocutaneous nerve.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Supraclavicular block', dose: '15–20 ml of 0.5% ropivacaine (75–100 mg)', blocks: ['scb'], why: 'Quick and dense, but phrenic and pneumothorax risks are higher than distally.' },
        { name: 'Intercostobrachial block, as an add-on', dose: '5 ml of 0.5% ropivacaine (25 mg)', blocks: ['icbn'], why: 'For the upper-arm tourniquet.' },
      ] },
    ],
    misses: ['The tourniquet area of the medial upper arm (intercostobrachial nerve).'],
    notes: ['A closed reduction alone in the emergency department is usually done with a haematoma block or a Bier’s block, not a plexus block.', 'Long-acting blocks after distal radius surgery can lead to rebound pain: start oral analgesia before the block wears off.'],
    more: ['icbn', 'rescue'],
  },
  {
    id: 'hand', region: 'hand', name: 'Hand surgery: tendon repair, fractures, Dupuytren’s',
    line: 'Axillary block with an intercostobrachial block for the tourniquet; a wrist block for surgery in the hand with no arm tourniquet.',
    cover: 'The hand (median, ulnar and radial territories) and the tourniquet on the upper arm or the forearm.',
    tq: 'Upper arm: brachial plexus block plus an intercostobrachial block. Forearm or none: a wrist block or the surgeon’s local infiltration is enough.',
    map: { areas: [{ zones: ['palm-lat', 'dorsum-lat-hand', 'ulnar-hand', 'wrist-hand'], density: 'dense' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Axillary block', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['axb'], why: 'The whole hand and forearm; tolerates an upper-arm tourniquet with the intercostobrachial block.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Wrist block', dose: '3–5 ml of 0.5% ropivacaine per nerve', blocks: ['wrist'], why: 'No arm tourniquet; the fingers still move, so the surgeon can test a tendon repair.' },
        { name: 'Infraclavicular or costoclavicular block', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['icb'], why: 'One injection; a catheter after complex hand surgery.' },
        { name: 'The surgeon’s wide-awake local anaesthesia', why: 'Lidocaine with adrenaline, no tourniquet: common for tendon repairs and Dupuytren’s.' },
      ] },
    ],
    misses: ['The tourniquet area of the medial upper arm (intercostobrachial nerve) with any plexus block.'],
    notes: ['For a long tendon repair the surgeon may want to see active movement: discuss a wrist block or wide-awake surgery first.'],
    more: ['icbn', 'rescue'],
  },
  {
    id: 'carpal-tunnel', region: 'hand', name: 'Carpal tunnel release',
    line: 'Usually the surgeon’s local infiltration; a median nerve block (forearm) or a wrist block if a block is wanted.',
    cover: 'The palm over the carpal tunnel (median nerve and its palmar cutaneous branch), and the tourniquet if one is used.',
    tq: 'Forearm or upper arm for a few minutes is tolerated with infiltration; a long upper-arm tourniquet needs a plexus block.',
    map: { areas: [{ zones: ['palm-lat'], density: 'dense' }, { zones: ['ulnar-hand'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'The surgeon’s local infiltration (wide-awake)', why: 'Lidocaine with adrenaline under the incision: no tourniquet and no block needed.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Median nerve block in the forearm', dose: '3–5 ml of 0.5% ropivacaine', blocks: ['median'], why: 'Proximal to the tunnel, so no volume is added inside it; add infiltration for the ulnar edge of the incision.' },
        { name: 'Wrist block', dose: '3–5 ml of 0.5% ropivacaine per nerve', blocks: ['wrist'], why: 'Median and ulnar together.' },
        { name: 'Axillary block', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['axb'], why: 'Only when there is a long upper-arm tourniquet or other surgery as well.' },
      ] },
    ],
    misses: ['The ulnar edge of the incision (palmar branches of the ulnar nerve) with a median block alone.'],
    notes: ['Do not put a volume of local anaesthetic into the carpal tunnel: there is little room and the nerve is already compressed. Block proximal to it.'],
  },
  {
    id: 'finger', region: 'hand', name: 'Trigger finger and single-finger surgery',
    line: 'The surgeon’s local infiltration or a digital block; a wrist block for more than one finger.',
    cover: 'One finger or the palm at its base.',
    map: { areas: [{ zones: ['palm-lat', 'ulnar-hand'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Local infiltration or a digital block (by the surgeon)', why: 'Simple, quick and enough for one finger.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Wrist block', dose: '3–5 ml of 0.5% ropivacaine per nerve', blocks: ['wrist'], why: 'Several fingers, or the palm and fingers together.' },
      ] },
    ],
    misses: ['A wrist block does not cover a tourniquet on the arm.'],
    notes: ['Adrenaline in finger infiltration is safe in healthy fingers at standard concentrations; avoid it where the finger circulation is poor.'],
  },
  // ------------------------------------------------------------------ other
  {
    id: 'avf', region: 'other', name: 'Arteriovenous fistula formation',
    line: 'A brachial plexus block (axillary for the wrist, supraclavicular or infraclavicular for the elbow): it dilates the vessels as well as giving anaesthesia.',
    cover: 'The incision at the wrist (radiocephalic) or the elbow (brachiocephalic), and the upper medial arm for a basilic vein transposition.',
    tq: 'None usually.',
    map: { areas: [{ zones: ['lat-forearm', 'med-forearm', 'forearm-bones', 'elbow'], density: 'dense' }, { zones: ['lower-med-arm', 'upper-med-arm'], density: 'moderate' }] },
    groups: [
      { label: 'Recommended', items: [
        { name: 'Axillary block (wrist fistula)', dose: '25 ml of 0.5% ropivacaine (125 mg)', blocks: ['axb'], why: 'The forearm and wrist; far from the lungs in patients who are often unwell.' },
        { name: 'Supraclavicular or infraclavicular block (elbow fistula)', dose: '15–20 ml of 0.5% ropivacaine (75–100 mg)', blocks: ['scb', 'icb'], why: 'The elbow and lower arm. Infraclavicular: 25 ml of 0.5% ropivacaine.' },
      ] },
      { label: 'Alternatives', items: [
        { name: 'Intercostobrachial block, as an add-on', dose: '5 ml of 0.5% ropivacaine (25 mg)', blocks: ['icbn'], why: 'For a basilic vein transposition up the medial arm.' },
        { name: 'The surgeon’s local infiltration', why: 'Simple, but no vasodilatation.' },
      ] },
    ],
    misses: ['The upper medial arm (intercostobrachial nerve) for an upper-arm fistula or transposition.'],
    notes: [
      'The sympathetic block dilates the artery and vein: better flow and, in trials, better early fistula patency than with local infiltration alone.',
      'Kidney failure: check potassium and clotting, and use the lower end of the dose range (acidosis and low protein make toxicity more likely).',
    ],
    more: ['icbn'],
  },
];

/* Short names, link text and page of each LINKS key (the same data, split for other pages). */
export const BLOCK_LINKS = Object.fromEntries(Object.entries(LINKS).map(([k, [href]]) => [k, href]));
export const BLOCK_NAMES = Object.fromEntries(Object.entries(LINKS).map(([k, [, name]]) => [k, name]));
export const PAGE_NAMES = { 'shoulder/': 'shoulder', 'arm/': 'arm', 'forearm-hand/': 'forearm and hand' };

/** URL of a block or section: base '' (default) is relative to /upper-limb/; pass '../upper-limb/' or '/upper-limb/' from elsewhere. */
export const blockHref = (key, base = '') => (LINKS[key] ? base + LINKS[key][0] : null);

/* What the shading means on the chooser's figure: what the operation needs, not how well a block covers it. */
const NEED_WORDS = { dense: 'Core: must be covered', moderate: 'Often involved: cover if the approach or incision needs it' };

/**
 * upperLimbCoverageMap(op, {id, title}) -> <figure class="tb-cov ul-cov"> or null when the operation has no map.
 * The arm coverage map from arm.js, with its key relabelled "core" / "often involved".
 */
export function upperLimbCoverageMap(op, { id = 'ul-op-map', title = op?.name } = {}) {
  if (!op?.map) return null;
  const fig = armCoverageMap({ ...op.map, summary: `Area to cover: ${op.cover}` }, { id, title });
  fig.querySelectorAll('.tb-cov-legend li').forEach((li) => {
    const sw = li.querySelector('.tb-cov-sw');
    const k = sw && ['dense', 'moderate'].find((d) => sw.classList.contains(`tb-cov-sw--${d}`));
    if (k) li.lastElementChild.textContent = NEED_WORDS[k];
  });
  const stage = fig.querySelector('.tb-cov-stage');
  if (stage) stage.setAttribute('aria-label', stage.getAttribute('aria-label').replace(/: Dense/g, ': core').replace(/: Moderate/g, ': often involved'));
  return fig;
}
