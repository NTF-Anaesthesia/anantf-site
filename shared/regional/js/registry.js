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
  { id: 'upper-limb', title: 'Upper limb', url: '/brachial-plexus/' },
  { id: 'trunk', title: 'Trunk', url: '/truncal/' },
  { id: 'head-neck', title: 'Head and neck', url: '/head-neck/' },
  { id: 'lower-limb', title: 'Lower limb', url: '/lower-limb/' },
  { id: 'neuraxial', title: 'Neuraxial', url: '/spinal/' },
]);

/** Filled in by WP10. Keep entries plain data (no functions) so tests can read them. */
export const REGISTRY = Object.freeze({});

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
