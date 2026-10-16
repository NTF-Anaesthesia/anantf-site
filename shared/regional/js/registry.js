// Regional anaesthesia app: block registry (plan §3, §8; filled in by WP10). API frozen in WP0.
// One entry per block across every region, keyed by the block's id (the id used in the page data and in
// #ch-<id> / #<id>-step-<key> links):
//   id: { title, region, url, aliases: [], anatomy3d?: {plexus, block?, el?} | {app: 'brachial-plexus', block, tab?},
//         watch?: {anim, variant?} }
// url is site-absolute ('/truncal/back/#ch-esp'). region is one of REGIONS[].id.
//
//   REGIONS, REGISTRY
//   getBlock(idOrAlias)            -> entry with its id, or null
//   resolveId(idOrAlias)           -> canonical id, or null
//   blocksIn(region)               -> [entry…] in registry order
//   allBlocks()                    -> [entry…]
//   blockUrl(idOrAlias, base?)     -> absolute URL string (base defaults to the page's origin), or null
//   anatomyLink(idOrAlias)         -> '/plexus/#plexus=…&block=…' or '/brachial-plexus/#block=…&tab=…', or null

export const REGIONS = Object.freeze([
  { id: 'upper-limb', title: 'Upper limb', url: '/upper-limb/' },
  { id: 'trunk', title: 'Trunk', url: '/truncal/' },
  { id: 'head-neck', title: 'Head and neck', url: '/head-neck/' },
  { id: 'lower-limb', title: 'Lower limb', url: '/lower-limb/' },
  { id: 'neuraxial', title: 'Neuraxial', url: '/spinal/' },
]);

/**
 * One entry per block (WP10). Keys are the block ids used in the page data and in #ch-<id> links; the upper-limb
 * blocks that the brachial plexus app also teaches keep that app's ids (its #block=<id> links still work); a few entries are approaches or variants that have their own anchor
 * inside a parent block's chapter, or blocks that so far live only in the 3D explorer (url → /plexus/).
 * Aliases: the ops-module keys (stap, acb, pop …), common abbreviations and other names, for /blocks/ search.
 * No alias may equal another entry's id (data.mjs checks that aliases are unique).
 * anatomy3d follows plan §8; the region pages show it as an "Anatomy in 3D" card when the block data has none.
 * watch: Dr Chew Shi Hao's animations (lower-limb/anim/ra/<anim>.js); the block data's own watch (with its caption) wins.
 * Titles are the page's own block titles, word for word.
 */
export const REGISTRY = Object.freeze({
  // ---------------------------------------------------------------- Upper limb (upper-limb/ pages on the engine)
  // The ids are the brachial plexus app's own; that app keeps its #block=<id> links, so old URLs still work.
  interscalene: { title: 'Interscalene block', region: 'upper-limb', url: '/upper-limb/shoulder/#ch-interscalene',
    aliases: ['ISB', 'interscalene brachial plexus block'], anatomy3d: { plexus: 'brachial', block: 'interscalene' } },
  'superior-trunk': { title: 'Superior trunk block', region: 'upper-limb', url: '/upper-limb/shoulder/#ch-superior-trunk',
    aliases: ['STB', 'upper trunk block'], anatomy3d: { plexus: 'brachial', block: 'superior-trunk' } },
  suprascapular: { title: 'Suprascapular nerve block', region: 'upper-limb', url: '/upper-limb/shoulder/#ch-suprascapular',
    aliases: ['SSNB', 'suprascapular nerve', 'suprascapular nerve block'], anatomy3d: { plexus: 'brachial', el: 'n-suprascapular' } },
  'axillary-nerve': { title: 'Axillary nerve block', region: 'upper-limb', url: '/upper-limb/shoulder/#ch-axillary-nerve',
    aliases: ['axillary nerve', 'ANB', 'quadrilateral space block'], anatomy3d: { plexus: 'brachial', el: 'n-axillary' } },
  supraclavicular: { title: 'Supraclavicular block', region: 'upper-limb', url: '/upper-limb/arm/#ch-supraclavicular',
    aliases: ['SCB', 'supraclavicular brachial plexus block'], anatomy3d: { plexus: 'brachial', block: 'supraclavicular' } },
  infraclavicular: { title: 'Infraclavicular block (coracoid / parasagittal)', region: 'upper-limb', url: '/upper-limb/arm/#ch-infraclavicular',
    aliases: ['ICB', 'coracoid block', 'lateral sagittal infraclavicular'], anatomy3d: { plexus: 'brachial', block: 'infraclavicular' } },
  costoclavicular: { title: 'Costoclavicular block', region: 'upper-limb', url: '/upper-limb/arm/#ch-costoclavicular',
    aliases: ['CCB', 'costoclavicular brachial plexus block'], anatomy3d: { plexus: 'brachial', block: 'costoclavicular' } },
  raptir: { title: 'RAPTIR (retroclavicular) block', region: 'upper-limb', url: '/upper-limb/arm/#ch-raptir',
    aliases: ['retroclavicular block', 'retroclavicular'], anatomy3d: { plexus: 'brachial', block: 'raptir' } },
  axillary: { title: 'Axillary block', region: 'upper-limb', url: '/upper-limb/arm/#ch-axillary',
    aliases: ['axillary brachial plexus block', 'AXB'], anatomy3d: { plexus: 'brachial', block: 'axillary' } },
  intercostobrachial: { title: 'Intercostobrachial nerve block', region: 'upper-limb', url: '/upper-limb/arm/#axillary-icbn',
    aliases: ['ICBN', 'intercostobrachial nerve', 'intercostobrachial nerve block'], anatomy3d: { plexus: 'brachial', el: 'n-intercostobrachial' } },
  'median-forearm': { title: 'Median nerve block in the forearm', region: 'upper-limb', url: '/upper-limb/forearm-hand/#ch-median-forearm',
    aliases: ['median nerve block', 'median nerve', 'forearm median nerve block'], anatomy3d: { plexus: 'brachial', el: 'n-median' } },
  'ulnar-forearm': { title: 'Ulnar nerve block in the forearm', region: 'upper-limb', url: '/upper-limb/forearm-hand/#ch-ulnar-forearm',
    aliases: ['ulnar nerve block', 'ulnar nerve', 'forearm ulnar nerve block'], anatomy3d: { plexus: 'brachial', el: 'n-ulnar' } },
  'radial-elbow': { title: 'Radial nerve block at the elbow', region: 'upper-limb', url: '/upper-limb/forearm-hand/#ch-radial-elbow',
    aliases: ['radial nerve block', 'radial nerve', 'radial nerve at the elbow'], anatomy3d: { plexus: 'brachial', el: 'n-radial' } },
  wrist: { title: 'Wrist block', region: 'upper-limb', url: '/upper-limb/forearm-hand/#ch-wrist',
    aliases: ['wrist nerve block', 'wrist nerve blocks', 'wrist blocks'] },

  // ---------------------------------------------------------------- Trunk
  esp: { title: 'Erector spinae plane block', region: 'trunk', url: '/truncal/back/#ch-esp',
    aliases: ['ESPB', 'erector spinae', 'erector spinae plane'] },
  mtp: { title: 'Mid-point transverse process to pleura (MTP) block', region: 'trunk', url: '/truncal/back/#esp-mtp',
    aliases: ['MTPB', 'mid-point transverse process to pleura', 'mid-point transverse process'] },
  pvb: { title: 'Thoracic paravertebral block: sagittal in-plane', region: 'trunk', url: '/truncal/back/#ch-pvb',
    aliases: ['TPVB', 'paravertebral', 'paravertebral block', 'thoracic paravertebral', 'thoracic paravertebral block'] },
  pvbt: { title: 'Thoracic paravertebral block: transverse in-plane', region: 'trunk', url: '/truncal/back/#ch-pvbt',
    aliases: ['transverse paravertebral', 'paravertebral transverse in-plane'] },
  pvblm: { title: 'Thoracic paravertebral block: landmark technique', region: 'trunk', url: '/truncal/back/#ch-pvblm',
    aliases: ['landmark paravertebral', 'paravertebral landmark technique'] },
  sap: { title: 'Serratus anterior plane block', region: 'trunk', url: '/truncal/chest-wall/#ch-sap',
    aliases: ['SAPB', 'serratus', 'serratus anterior', 'serratus plane block'] },
  pecs: { title: 'PECS I and PECS II (interpectoral and pectoserratus plane blocks)', region: 'trunk', url: '/truncal/chest-wall/#ch-pecs',
    aliases: ['PECS I', 'PECS II', 'PECS 1', 'PECS 2', 'pectoral nerve block', 'interpectoral plane block', 'pectoserratus plane block'] },
  parasternal: { title: 'Parasternal intercostal plane blocks (superficial and deep)', region: 'trunk', url: '/truncal/chest-wall/#ch-parasternal',
    aliases: ['PIP', 'parasternal intercostal plane block', 'superficial parasternal', 'deep parasternal', 'transversus thoracis plane block', 'pecto-intercostal fascial block'] },
  clavipectoral: { title: 'Clavipectoral fascial plane block', region: 'trunk', url: '/truncal/chest-wall/#clavipectoral',
    aliases: ['clavipectoral block', 'clavipectoral fascial plane'] },
  intercostal: { title: 'Intercostal nerve block', region: 'trunk', url: '/truncal/chest-wall/#intercostal-nb',
    aliases: ['intercostal nerve block', 'ICNB'] },
  tap: { title: 'Lateral TAP block', region: 'trunk', url: '/truncal/abdominal-wall/#ch-tap',
    aliases: ['TAP', 'TAP block', 'lateral TAP', 'transversus abdominis plane block', 'transversus abdominis plane'] },
  subcostal: { title: 'Subcostal TAP block', region: 'trunk', url: '/truncal/abdominal-wall/#ch-subcostal',
    aliases: ['stap', 'subcostal TAP', 'oblique subcostal TAP'] },
  rsb: { title: 'Rectus sheath block', region: 'trunk', url: '/truncal/abdominal-wall/#ch-rsb',
    aliases: ['rectus sheath', 'RSB block'] },
  ql: { title: 'Quadratus lumborum block (types 1–3)', region: 'trunk', url: '/truncal/abdominal-wall/#ch-ql',
    aliases: ['QLB', 'quadratus lumborum', 'QL1', 'QL2', 'QL3', 'transmuscular quadratus lumborum'] },
  iih: { title: 'Ilioinguinal and iliohypogastric block', region: 'trunk', url: '/truncal/abdominal-wall/#ch-iih',
    aliases: ['ilioinguinal', 'iliohypogastric', 'II/IH', 'ii-ih', 'ilio-inguinal'], anatomy3d: { plexus: 'lumbar', block: 'ii-ih' } },
  pudendal: { title: 'Pudendal nerve block', region: 'trunk', url: '/plexus/#plexus=sacral&block=pudendal',
    aliases: ['pudendal block', 'pudendal nerve'], anatomy3d: { plexus: 'sacral', block: 'pudendal' } },

  // ---------------------------------------------------------------- Head and neck
  scp: { title: 'Superficial and intermediate cervical plexus block', region: 'head-neck', url: '/head-neck/cervical/#ch-scp',
    aliases: ['superficial cervical plexus', 'superficial cervical plexus block', 'intermediate cervical plexus', 'intermediate cervical plexus block', 'SCPB'],
    anatomy3d: { plexus: 'cervical', block: 'superficial' } },
  dcp: { title: 'Deep cervical plexus block', region: 'head-neck', url: '/head-neck/cervical/#ch-dcp',
    aliases: ['deep cervical plexus', 'DCPB'], anatomy3d: { plexus: 'cervical', block: 'deep' } },
  'great-auricular': { title: 'Great auricular nerve block', region: 'head-neck', url: '/plexus/#plexus=cervical&block=great-auricular',
    aliases: ['great auricular', 'great auricular nerve'], anatomy3d: { plexus: 'cervical', block: 'great-auricular' } },
  scalp: { title: 'Scalp block', region: 'head-neck', url: '/head-neck/scalp/#ch-scalp',
    aliases: ['scalp nerve block', 'awake craniotomy block'] },
  gon: { title: 'Greater occipital nerve block', region: 'head-neck', url: '/head-neck/scalp/#ch-gon',
    aliases: ['greater occipital', 'greater occipital nerve', 'GONB', 'occipital nerve block'] },
  so: { title: 'Supraorbital and supratrochlear nerve blocks', region: 'head-neck', url: '/head-neck/face/#ch-so',
    aliases: ['supraorbital', 'supratrochlear', 'supraorbital nerve block', 'supratrochlear nerve block'] },
  io: { title: 'Infraorbital nerve block', region: 'head-neck', url: '/head-neck/face/#ch-io',
    aliases: ['infraorbital', 'infraorbital nerve'] },
  me: { title: 'Mental nerve block', region: 'head-neck', url: '/head-neck/face/#ch-me',
    aliases: ['mental', 'mental nerve'] },
  'airway-topical': { title: 'Topical anaesthesia for awake intubation', region: 'head-neck', url: '/head-neck/airway/#ch-topical',
    aliases: ['topical', 'airway topicalisation', 'topical anaesthesia of the airway', 'awake intubation', 'awake fibreoptic intubation'] },
  sln: { title: 'Superior laryngeal nerve block', region: 'head-neck', url: '/head-neck/airway/#ch-sln',
    aliases: ['superior laryngeal', 'superior laryngeal nerve', 'SLNB'] },
  ttb: { title: 'Transtracheal (translaryngeal) block', region: 'head-neck', url: '/head-neck/airway/#ch-ttb',
    aliases: ['transtracheal', 'translaryngeal', 'transtracheal block', 'translaryngeal block', 'cricothyroid puncture'] },
  gpn: { title: 'Glossopharyngeal nerve block', region: 'head-neck', url: '/head-neck/airway/#ch-gpn',
    aliases: ['glossopharyngeal', 'glossopharyngeal nerve'] },
  peri: { title: 'Peribulbar and retrobulbar blocks', region: 'head-neck', url: '/head-neck/eye/#ch-peri',
    aliases: ['peribulbar', 'retrobulbar', 'peribulbar block', 'retrobulbar block'] },
  st: { title: 'Sub-Tenon’s block', region: 'head-neck', url: '/head-neck/eye/#ch-st',
    aliases: ['sub-Tenon', 'sub-Tenons', 'sub-Tenon’s', 'subtenon', 'sub-Tenon block'] },
  'eye-topical': { title: 'Topical anaesthesia and choosing a technique', region: 'head-neck', url: '/head-neck/eye/#ch-topical',
    aliases: ['eyetop', 'topical (eye)', 'topical eye anaesthesia', 'eye topical'] },

  // ---------------------------------------------------------------- Lower limb
  'lumbar-plexus': { title: 'Lumbar plexus block (psoas compartment)', region: 'lower-limb', url: '/plexus/#plexus=lumbar&block=lumbar-plexus',
    aliases: ['psoas compartment block', 'lumbar plexus', 'LPB', 'posterior lumbar plexus block'], anatomy3d: { plexus: 'lumbar', block: 'lumbar-plexus' } },
  peng: { title: 'PENG block (pericapsular nerve group)', region: 'lower-limb', url: '/lower-limb/hip/#ch-peng',
    aliases: ['PENG block', 'pericapsular nerve group', 'pericapsular nerve group block'], anatomy3d: { plexus: 'lumbar', block: 'peng' }, watch: { anim: 'peng' } },
  fib: { title: 'Supra-inguinal fascia iliaca block', region: 'lower-limb', url: '/lower-limb/hip/#ch-fib',
    aliases: ['SIFI', 'SIFICB', 'FICB', 'fascia iliaca', 'fascia iliaca block', 'supra-inguinal fascia iliaca', 'suprainguinal fascia iliaca'],
    anatomy3d: { plexus: 'lumbar', block: 'sifi' }, watch: { anim: 'fib' } },
  'fib-infra': { title: 'Infra-inguinal fascia iliaca block', region: 'lower-limb', url: '/lower-limb/hip/#fib-infra',
    aliases: ['fibinfra', 'infra-inguinal fascia iliaca', 'infrainguinal fascia iliaca'], anatomy3d: { plexus: 'lumbar', block: 'fib-infra' } },
  femoral: { title: 'Femoral nerve block', region: 'lower-limb', url: '/lower-limb/hip/#ch-femoral',
    aliases: ['FNB', 'femoral nerve', 'femoral block'], anatomy3d: { plexus: 'lumbar', block: 'femoral' }, watch: { anim: 'femoral' } },
  lfcn: { title: 'Lateral femoral cutaneous nerve block', region: 'lower-limb', url: '/lower-limb/hip/#ch-lfcn',
    aliases: ['LFCN block', 'lateral femoral cutaneous', 'lateral femoral cutaneous nerve', 'lateral cutaneous nerve of the thigh'],
    anatomy3d: { plexus: 'lumbar', block: 'lfcn' }, watch: { anim: 'lfcn' } },
  'adductor-canal': { title: 'Femoral triangle and adductor canal block', region: 'lower-limb', url: '/lower-limb/knee/#ch-adductor-canal',
    aliases: ['acb', 'adductor canal', 'adductor canal block', 'femoral triangle', 'femoral triangle block', 'FTB'],
    anatomy3d: { plexus: 'lumbar', block: 'adductor-canal' }, watch: { anim: 'adductor-canal', variant: 'single' } },
  ipack: { title: 'iPACK block', region: 'lower-limb', url: '/lower-limb/knee/#ch-ipack',
    aliases: ['iPACK block', 'interspace between the popliteal artery and the capsule of the posterior knee'] },
  genicular: { title: 'Genicular nerve blocks', region: 'lower-limb', url: '/lower-limb/knee/#ch-genicular',
    aliases: ['gen', 'genicular', 'genicular nerve block', 'genicular block'] },
  obturator: { title: 'Obturator nerve block', region: 'lower-limb', url: '/lower-limb/knee/#ch-obturator',
    aliases: ['obt', 'obturator', 'obturator block', 'obturator nerve'], anatomy3d: { plexus: 'lumbar', block: 'obturator' } },
  sciatic: { title: 'Subgluteal sciatic block', region: 'lower-limb', url: '/lower-limb/thigh/#ch-sciatic',
    aliases: ['sci', 'subgluteal', 'subgluteal sciatic', 'sciatic block', 'sciatic nerve block'], anatomy3d: { plexus: 'sacral', block: 'subgluteal' } },
  transgluteal: { title: 'Transgluteal sciatic block', region: 'lower-limb', url: '/lower-limb/thigh/#sciatic-ap-tg',
    aliases: ['tg', 'transgluteal sciatic', 'transgluteal sciatic approach'], anatomy3d: { plexus: 'sacral', block: 'transgluteal' } },
  parasacral: { title: 'Parasacral sciatic block', region: 'lower-limb', url: '/lower-limb/thigh/#sciatic-ap-ps',
    aliases: ['parasacral sciatic', 'Mansour', 'parasacral sciatic approach'], anatomy3d: { plexus: 'sacral', block: 'parasacral' } },
  'anterior-sciatic': { title: 'Anterior sciatic block', region: 'lower-limb', url: '/lower-limb/thigh/#sciatic-ap-ant',
    aliases: ['anterior sciatic', 'anterior sciatic approach', 'supine sciatic'], anatomy3d: { plexus: 'sacral', block: 'anterior' } },
  popliteal: { title: 'Popliteal sciatic block', region: 'lower-limb', url: '/lower-limb/foot-ankle/#ch-popliteal',
    aliases: ['pop', 'popliteal sciatic', 'popliteal block', 'popliteal sciatic nerve block'], anatomy3d: { plexus: 'sacral', block: 'popliteal' }, watch: { anim: 'popliteal' } },
  saphenous: { title: 'Saphenous nerve block at and below the knee', region: 'lower-limb', url: '/lower-limb/foot-ankle/#ch-saphenous',
    aliases: ['saph', 'saphenous nerve block', 'saphenous block', 'below-knee saphenous'] },
  ankle: { title: 'Ankle block', region: 'lower-limb', url: '/lower-limb/foot-ankle/#ch-ankle',
    aliases: ['ankle nerve block', 'ankle blocks'], watch: { anim: 'ankle' } },

  // ---------------------------------------------------------------- Neuraxial
  spinal: { title: 'Spinal anaesthesia', region: 'neuraxial', url: '/spinal/',
    aliases: ['spinal anaesthetic', 'spinal block', 'subarachnoid block', 'SAB', 'intrathecal', 'neuraxial'] },
});

const norm = (s) => String(s || '').toLowerCase().trim().replace(/[\s_]+/g, '-');
let aliasMap = null;
function aliases() {
  if (aliasMap) return aliasMap;
  aliasMap = new Map();
  for (const [id, e] of Object.entries(REGISTRY)) {
    aliasMap.set(norm(id), id);
    for (const a of e.aliases || []) if (!aliasMap.has(norm(a))) aliasMap.set(norm(a), id);
  }
  return aliasMap;
}

export function resolveId(idOrAlias) { return aliases().get(norm(idOrAlias)) || null; }
export function getBlock(idOrAlias) { const id = resolveId(idOrAlias); return id ? { id, ...REGISTRY[id] } : null; }
export function allBlocks() { return Object.keys(REGISTRY).map((id) => ({ id, ...REGISTRY[id] })); }
export function blocksIn(region) { return allBlocks().filter((b) => b.region === region); }

export function blockUrl(idOrAlias, base = typeof location !== 'undefined' ? location.origin : 'https://anantf.com') {
  const b = getBlock(idOrAlias);
  return b?.url ? new URL(b.url, base).href : null;
}

export function anatomyLink(idOrAlias) {
  const a = getBlock(idOrAlias)?.anatomy3d;
  if (!a) return null;
  if (a.app === 'brachial-plexus') {
    const p = new URLSearchParams();
    if (a.block) p.set('block', a.block);
    if (a.el) p.set('el', a.el);
    if (a.tab) p.set('tab', a.tab);
    return `/brachial-plexus/${p.toString() ? `#${p}` : ''}`;
  }
  if (!a.plexus) return null;
  const p = new URLSearchParams({ plexus: a.plexus });
  if (a.el) p.set('el', a.el);
  if (a.block) p.set('block', a.block);
  return `/plexus/#${p}`;
}
