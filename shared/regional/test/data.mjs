#!/usr/bin/env node
// Regional anaesthesia app: data checks (plan §11.4). Reads the page data modules in a real browser (they are the same
// ES modules the pages load) and the planner / animation index read-only. Nothing is written.
//
//   node shared/regional/test/data.mjs          options: --json=<file>   --failsOnly   --verbose (list every dose compared)
//
// Checks:
//   1. registry.js: regions valid, urls resolve to real pages and ids, aliases unique, anatomy3d / watch point at real
//      plexus blocks / elements / animations, and every engine block has an entry (once WP10 fills it);
//   2. ops modules (truncal, head-neck, lower-limb, upper-limb): ids unique, every block key resolves to a link, every link to a real
//      page + id, map zones / dermatome levels exist in the figure modules;
//   3. tiers: every tier / tiers value is 1, 2 or 3; SAFETY: no dose, LAST line or complications item tagged above 1;
//   4. plexus data: no element in both target and covers (other overlaps warned), every listed element exists, every
//      root lies within levels (and has a colour);
//   5. scene ids ('<plexus>:<element>' / 'brachial:<element>') exist in the plexus / brachial data;
//   6. doses: "X ml of Y% (Z mg)" arithmetic everywhere; the glance dose agrees with dose{}; every dose the ops modules,
//      the thigh planner and the animation index (RA_INDEX) give for a block appears in that block's own data or page
//      (reviewed exceptions in data-allow.json);
//   7. no cite( calls or refs.js imports in the regional data;
//   8. "If it goes wrong" guides (shared/regional/js/data/decisions.js): every guide sound (validateGuide: steps reachable,
//      targets exist, no loops, an end), SAFETY: every guide and step tier 1, every registry and engine block maps to at
//      least the core guides (LAST, pain on injection, vascular puncture, failed block, nerve injury) plus the extras
//      that apply (pneumothorax, phrenic palsy, high block), and the LAST guide carries the lipid doses.

import fs from 'node:fs';
import path from 'node:path';
import { args, BASE, ROOT, HERE, ENGINE_PAGES, LANDINGS, FORCE_CSS, launch, openContext, waitReady, pool, reporter, readJson, walk } from './lib.mjs';

const R = reporter('Data');
const ALLOW = readJson(path.join(HERE, 'data-allow.json'), { doses: [] });
const allowed = (key) => (ALLOW.doses || []).some((a) => (typeof a === 'string' ? a : a.key) === key);
const OPS_FILES = { truncal: 'shared/regional/js/ops/ops-truncal.js', 'head-neck': 'shared/regional/js/ops/ops-headneck.js', 'lower-limb': 'shared/regional/js/ops/ops-lowerlimb.js', 'upper-limb': 'shared/regional/js/ops/ops-upperlimb.js' };

// ------------------------------------------------------------------ gather
async function gatherModules(browser) {
  const { ctx, page, log } = await openContext(browser, { vp: '1440' });
  try {
    await page.goto(`${BASE}shared/regional/test/harness.html`, { waitUntil: 'load' });
    const data = await page.evaluate(async ({ engine, opsFiles }) => {
      const strip = (v) => JSON.parse(JSON.stringify(v, (k, x) => (typeof x === 'function' ? undefined : (x instanceof Node ? undefined : x))));
      const out = { blocks: {}, ops: {}, errors: [] };
      for (const p of engine) {
        try { const m = await import(`/${p}js/blocks.js`); out.blocks[p] = strip(m.BLOCKS || []); } catch (e) { out.errors.push(`/${p}js/blocks.js: ${e.message}`); }
      }
      for (const [k, f] of Object.entries(opsFiles)) {
        try {
          const m = await import(`/${f}`);
          const links = m.LINKS ? Object.fromEntries(Object.entries(m.LINKS).map(([a, v]) => [a, Array.isArray(v) ? v[0] : v])) : (m.BLOCK_LINKS || {});
          out.ops[k] = { OPS: strip(m.OPS || []), LINKS: links, REGION: strip(m.REGION || {}), SEGS: m.SEGS || null };
        } catch (e) { out.errors.push(`/${f}: ${e.message}`); }
      }
      try { const r = await import('/shared/regional/js/registry.js'); out.registry = strip(r.REGISTRY); out.regions = strip(r.REGIONS); } catch (e) { out.errors.push(`registry.js: ${e.message}`); }
      out.plexus = {};
      for (const px of ['cervical', 'brachial', 'lumbar', 'sacral']) { try { out.plexus[px] = strip((await import(`/plexus/js/data/${px}.js`)).default); } catch (e) { out.errors.push(`plexus ${px}: ${e.message}`); } }
      try { const b = await import('/brachial-plexus/js/data.js'); out.brachial = { elements: Object.keys(b.ELEMENTS || {}), blocks: Object.keys(b.BLOCKS || {}) }; } catch (e) { out.errors.push(`brachial data: ${e.message}`); }
      try {
        const m = await import('/shared/regional/js/data/decisions.js');
        const ids = Object.keys(m.GUIDES);
        const reg = out.registry || {};
        const engineIds = Object.values(out.blocks).flat().map((b) => b.id);
        out.decisions = {
          ids, order: [...m.GUIDE_ORDER], core: [...m.CORE_GUIDES], extra: strip(m.EXTRA_GUIDES),
          problems: ids.flatMap((id) => m.validateGuide(m.GUIDES[id])),
          tiers: ids.flatMap((id) => { const g = m.GUIDES[id]; return [[id, g.tier], ...Object.entries(g.steps).map(([k, v]) => [`${id}/${k}`, v.tier])].filter(([, t]) => t != null && Number(t) !== 1).map(([k, t]) => `${k}: tier ${t}`); }),
          maps: Object.fromEntries([...new Set([...Object.keys(reg), ...engineIds])].map((id) => [id, m.guidesFor(id, reg[id]?.region || null)])),
          lastText: JSON.stringify(m.GUIDES.last || {}),
        };
      } catch (e) { out.errors.push(`decisions.js: ${e.message}`); }
      try { const h = await import('/shared/regional/js/figures/head.js'); out.headZones = [...Object.keys(h.ZONES || {}), ...Object.keys(h.GROUPS || {})]; } catch (e) { out.errors.push(`head.js: ${e.message}`); }
      try { const l = await import('/shared/regional/js/figures/leg.js'); out.legZones = [...Object.keys(l.ZONES || {}), ...Object.keys(l.GROUPS || {})]; } catch (e) { out.errors.push(`leg.js: ${e.message}`); }
      try { const a = await import('/shared/regional/js/figures/arm.js'); out.armZones = [...Object.keys(a.ZONES || {}), ...Object.keys(a.GROUPS || {})]; } catch (e) { out.errors.push(`arm.js: ${e.message}`); }
      return out;
    }, { engine: ENGINE_PAGES, opsFiles: OPS_FILES });
    data.errors.push(...log.pageErrors);
    return data;
  } finally { await ctx.close(); }
}

/** Every id on a page, the block chapter each id sits in, and each chapter's full text (Consultant, details open). */
async function harvestPage(browser, p) {
  const { ctx, page } = await openContext(browser, { vp: '1440', level: 'consultant' });
  try {
    const resp = await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!resp || resp.status() >= 400) return { status: resp?.status() || 0, ids: [], chapterOf: {}, text: {} };
    await waitReady(page, { idle: false });
    await page.addStyleTag({ content: FORCE_CSS });
    return await page.evaluate(() => {
      document.querySelectorAll('details').forEach((d) => { d.open = true; });
      const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
      const chapterOf = {};
      for (const e of document.querySelectorAll('.tb-chapter [id]')) chapterOf[e.id] = e.closest('.tb-chapter').id;
      const text = {};
      for (const c of document.querySelectorAll('.tb-chapter[id]')) text[c.id] = c.innerText;
      return { status: 200, ids, chapterOf, text };
    });
  } finally { await ctx.close(); }
}

async function raIndex(browser) {
  const { ctx, page } = await openContext(browser, { vp: '1440' });
  try {
    await page.goto(`${BASE}lower-limb/anim/?embed=1`, { waitUntil: 'load', timeout: 30000 });
    return await page.evaluate(() => JSON.parse(JSON.stringify(window.RA_INDEX || null)));
  } catch { return null; } finally { await ctx.close(); }
}

// ------------------------------------------------------------------ helpers
const num = (s) => String(s).replace(/,/g, '');
/** All "<n> ml" volumes and "<n>%" concentrations in a string ("20–30 ml" gives 20 and 30). */
function doseTokens(s) {
  const t = String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ');
  const vols = new Set(); const concs = new Set();
  for (const m of t.matchAll(/((?:\d+(?:\.\d+)?\s*(?:[–-]|to)\s*)?\d+(?:\.\d+)?)\s*m[lL]\b/g)) m[1].split(/\s*(?:[–-]|to)\s*/).forEach((x) => vols.add(num(x)));
  for (const m of t.matchAll(/((?:\d+(?:\.\d+)?\s*(?:[–-]|to)\s*)?\d*\.?\d+)\s*%/g)) m[1].split(/\s*(?:[–-]|to)\s*/).forEach((x) => concs.add(num(x).replace(/^\./, '0.')));
  return { vols, concs };
}
/** Is volume v (ml) / concentration c (%) present in a text corpus (as a number with its unit, ranges included)? */
function corpusHas(corpus, { vols = [], concs = [] }) {
  const t = doseTokens(corpus);
  const miss = [];
  for (const v of vols) if (!t.vols.has(String(v))) miss.push(`${v} ml`);
  for (const c of concs) if (!t.concs.has(String(c))) miss.push(`${c}%`);
  return miss;
}
function walkObj(o, fn, pathArr = []) {
  if (o == null || typeof o !== 'object') return;
  fn(o, pathArr);
  for (const [k, v] of Object.entries(o)) walkObj(v, fn, [...pathArr, k]);
}
function mgArithmetic(text, where) {
  const t = String(text).replace(/<[^>]+>/g, ' ');
  const out = [];
  for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*m[lL]\s+(?:of\s+)?(?:[a-z ]{0,30}?)(\d*\.?\d+)\s*%[^()\n]{0,60}?\((\d+(?:\.\d+)?)\s*mg\)/g)) {
    const want = Math.round(Number(m[1]) * Number(m[2]) * 10 * 10) / 10;
    if (Math.abs(want - Number(m[3])) > 0.6) out.push(`${where}: "${m[0].replace(/\s+/g, ' ').slice(0, 90)}" gives ${m[3]} mg, ${m[1]} ml × ${m[2]}% = ${want} mg`);
  }
  return out;
}

// ------------------------------------------------------------------ main
async function main() {
  const browser = await launch();
  const t0 = Date.now();
  const D = await gatherModules(browser);
  // Zone groups a figure module keeps private (const GROUPS = {…}) are read from its source.
  const groupKeys = (f) => { const src = fs.readFileSync(path.join(ROOT, f), 'utf8'); const m = src.match(/const GROUPS = \{([\s\S]*?)\n\};/); return m ? [...m[1].matchAll(/^\s*([\w-]+)\s*:/gm)].map((x) => x[1]) : []; };
  D.headZones = [...(D.headZones || []), ...groupKeys('shared/regional/js/figures/head.js')];
  D.legZones = [...(D.legZones || []), ...groupKeys('shared/regional/js/figures/leg.js')];
  for (const e of D.errors) R.fail('data modules import cleanly', e);

  const pagesToHarvest = [...ENGINE_PAGES, ...LANDINGS, 'spinal/', 'brachial-plexus/', 'plexus/'];
  const hv = await pool(pagesToHarvest, 6, (p) => harvestPage(browser, p), (p) => `harvest ${p}`);
  const H = Object.fromEntries(pagesToHarvest.map((p, i) => [p, hv[i]]));
  const RAI = await raIndex(browser);
  const idsOf = async (p) => {
    if (!H[p]) H[p] = await harvestPage(browser, p);
    return new Set(H[p].ids || []);
  };
  /** Does '/<page>#<id>' (or 'page/#id' relative to a region) exist? */
  const resolves = async (pagePath, hash) => {
    const p = pagePath.replace(/^\//, '').replace(/index\.html$/, '');
    if (!fs.existsSync(path.join(ROOT, p, p.endsWith('/') || !p ? 'index.html' : ''))) return `no page /${p}`;
    if (!hash) return null;
    // State hashes of the brachial-plexus and plexus apps (#block=…&el=…&tab=…, #plexus=…&block=…&el=…) name app state,
    // not element ids: check them against the apps' own data.
    if (hash.includes('=')) {
      const q = new URLSearchParams(hash);
      if (p === 'brachial-plexus/') {
        if (q.get('block') && !D.brachial?.blocks.includes(q.get('block'))) return `no brachial block "${q.get('block')}"`;
        if (q.get('el') && !D.brachial?.elements.includes(q.get('el'))) return `no brachial element "${q.get('el')}"`;
        return null;
      }
      if (p === 'plexus/') {
        const px = D.plexus?.[q.get('plexus')];
        if (!px) return `no plexus "${q.get('plexus')}"`;
        if (q.get('block') && !px.blocks?.[q.get('block')]) return `no ${q.get('plexus')} block "${q.get('block')}"`;
        if (q.get('el') && !px.elements?.[q.get('el')]) return `no ${q.get('plexus')} element "${q.get('el')}"`;
        return null;
      }
    }
    const ids = await idsOf(p);
    if (ids.has(hash) || (hash.startsWith('op-') && LANDINGS.includes(p))) return null;
    return `no element #${hash} on /${p}`;
  };
  /** Engine block id behind a link 'page/#ch-x' or 'page/#x-...' (null when it is not a block chapter). */
  const blockOf = (p, hash) => {
    const h = H[p];
    if (!h) return null;
    const ch = hash.startsWith('ch-') ? hash : h.chapterOf?.[hash];
    if (!ch) return null;
    const blocks = D.blocks[p] || [];
    return blocks.find((b) => `ch-${b.id}` === ch) || null;
  };
  const corpusOf = (p, b) => `${JSON.stringify(b)}\n${H[p]?.text?.[`ch-${b.id}`] || ''}`;

  // 1. registry
  const REG = D.registry || {};
  const regionIds = new Set((D.regions || []).map((r) => r.id));
  const animSlugs = new Set(fs.readdirSync(path.join(ROOT, 'lower-limb/anim/ra')).filter((f) => f.endsWith('.js') && f !== 'engine.js').map((f) => f.replace(/\.js$/, '')));
  const entries = Object.entries(REG);
  if (!entries.length) R.warn('registry.js has entries', 'REGISTRY is empty (filled in by WP10); registry checks skipped');
  const aliasOwner = new Map();
  for (const [id, e] of entries) {
    const why = [];
    if (!e.title) why.push('no title');
    if (!regionIds.has(e.region)) why.push(`region "${e.region}" is not in REGIONS`);
    if (!/^\//.test(e.url || '')) why.push(`url "${e.url}" is not site-absolute`);
    else { const u = new URL(e.url, BASE); const r = await resolves(u.pathname, decodeURIComponent(u.hash.slice(1))); if (r) why.push(r); }
    for (const a of [id, ...(e.aliases || [])]) {
      const k = String(a).toLowerCase().trim().replace(/[\s_]+/g, '-');
      if (aliasOwner.has(k) && aliasOwner.get(k) !== id) why.push(`alias "${a}" also belongs to ${aliasOwner.get(k)}`);
      else aliasOwner.set(k, id);
    }
    const a3 = e.anatomy3d;
    if (a3) {
      if (a3.app === 'brachial-plexus') {
        if (a3.block && !D.brachial?.blocks.includes(a3.block)) why.push(`anatomy3d: no brachial block "${a3.block}"`);
        if (a3.el && !D.brachial?.elements.includes(a3.el)) why.push(`anatomy3d: no brachial element "${a3.el}"`);
      } else {
        const px = D.plexus?.[a3.plexus];
        if (!px) why.push(`anatomy3d: no plexus "${a3.plexus}"`);
        else {
          if (a3.block && !px.blocks?.[a3.block]) why.push(`anatomy3d: no ${a3.plexus} block "${a3.block}"`);
          if (a3.el && !px.elements?.[a3.el]) why.push(`anatomy3d: no ${a3.plexus} element "${a3.el}"`);
        }
      }
    }
    if (e.watch && !animSlugs.has(e.watch.anim)) why.push(`watch: no animation "${e.watch.anim}" in lower-limb/anim/ra/`);
    R.check(`registry ${id}`, !why.length, why.join('; '));
  }
  if (entries.length) {
    const missing = Object.entries(D.blocks).flatMap(([p, bs]) => bs.filter((b) => b?.id && !REG[b.id] && ![...aliasOwner.keys()].includes(b.id)).map((b) => `${p}#ch-${b.id}`));
    R.check('every engine block has a registry entry', !missing.length, `missing: ${missing.join(', ')}`);
  }
  // Blocks' own anatomy3d / watch fields.
  for (const [p, bs] of Object.entries(D.blocks)) for (const b of bs) {
    if (b?.anatomy3d && b.anatomy3d.plexus) {
      const px = D.plexus?.[b.anatomy3d.plexus];
      R.check(`${p}#ch-${b.id} anatomy3d points at a real plexus block`, px && (!b.anatomy3d.block || px.blocks?.[b.anatomy3d.block]) && (!b.anatomy3d.el || px.elements?.[b.anatomy3d.el]), JSON.stringify(b.anatomy3d));
    }
    if (b?.watch?.anim) R.check(`${p}#ch-${b.id} watch animation exists`, animSlugs.has(b.watch.anim), `no lower-limb/anim/ra/${b.watch.anim}.js`);
  }

  // 2. ops modules
  for (const [region, o] of Object.entries(D.ops)) {
    const base = `${region}/`;
    const ids = o.OPS.map((x) => x.id);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    R.check(`ops ${region}: ${ids.length} operations with unique ids`, ids.length && !dup.length, dup.length ? `duplicate ids: ${dup.join(', ')}` : 'no operations');
    const landingIds = H[base]?.ids || [];
    void landingIds;
    // Every link key resolves to a real page + id.
    for (const [key, href] of Object.entries(o.LINKS)) {
      const u = new URL(href, `${BASE}${base}`);
      const r = await resolves(u.pathname, decodeURIComponent(u.hash.slice(1)));
      R.check(`ops ${region}: link "${key}" → ${href}`, !r, r);
    }
    const bad = [];
    for (const op of o.OPS) {
      for (const g of op.groups || []) for (const it of g.items || []) for (const k of it.blocks || []) if (!(k in o.LINKS)) bad.push(`${op.id}: "${k}"`);
      for (const k of op.more || []) if (!(k in o.LINKS)) bad.push(`${op.id} (more): "${k}"`);
      // Figure data.
      if (o.SEGS) {
        for (const f of [op.cover?.from, op.cover?.to]) if (f && !o.SEGS.includes(f)) bad.push(`${op.id}: cover level ${f} not in SEGS`);
        for (const l of op.single?.levels || []) if (!o.SEGS.includes(l)) bad.push(`${op.id}: single-shot level ${l} not in SEGS`);
      }
      const zones = region === 'head-neck' ? D.headZones : region === 'lower-limb' ? D.legZones : region === 'upper-limb' ? D.armZones : null;
      if (zones) for (const a of op.map?.areas || []) for (const z of a.zones || []) if (!zones.includes(z)) bad.push(`${op.id}: map zone "${z}" not in the figure`);
    }
    R.check(`ops ${region}: every block key and figure zone resolves`, !bad.length, bad.join('\n'));
  }

  // 3. tiers + safety rule in data
  const KEYS = ['head', 'intro', 'rapid', 'scan', 'position', 'equipment', 'dose', 'complications', 'pearls', 'warning', 'landmarks', 'approach', 'sonoanatomy', 'target', 'coverage', 'anatomy3d', 'watch', 'exam', 'sections'];
  for (const [p, bs] of Object.entries(D.blocks)) {
    const bad = []; const safety = [];
    for (const b of bs) {
      walkObj(b, (o, at) => {
        if ('tier' in o && ![1, 2, 3].includes(Number(o.tier))) bad.push(`${b.id}.${at.join('.')}.tier = ${JSON.stringify(o.tier)}`);
      });
      for (const [k, v] of Object.entries(b.tiers || {})) {
        if (![1, 2, 3].includes(Number(v))) bad.push(`${b.id}.tiers.${k} = ${JSON.stringify(v)}`);
        if (!KEYS.includes(k)) bad.push(`${b.id}.tiers.${k}: unknown section key`);
        if ((k === 'dose' || k === 'complications') && Number(v) > 1) safety.push(`${b.id}.tiers.${k} = ${v}`);
      }
      if (b.dose && Number(b.dose.tier) > 1) safety.push(`${b.id}.dose.tier = ${b.dose.tier}`);
      const comp = b.complications && !Array.isArray(b.complications) && typeof b.complications === 'object' ? b.complications : { html: b.complications };
      if (Number(comp.tier) > 1) safety.push(`${b.id}.complications.tier = ${comp.tier}`);
      const items = Array.isArray(comp.html) ? comp.html : Array.isArray(b.complications) ? b.complications : [];
      items.forEach((it, i) => { if (it && typeof it === 'object' && Number(it.tier) > 1) safety.push(`${b.id}.complications[${i}].tier = ${it.tier}`); });
      for (const s of b.sections || []) if (/contraindication/i.test(s.title || '') && Number(s.tier) > 1) safety.push(`${b.id}.sections.${s.id} "${s.title}" tier ${s.tier}`);
    }
    R.check(`tiers on ${p} are 1, 2 or 3 on known keys`, !bad.length, bad.join('\n'));
    R.check(`SAFETY rule on ${p}: dose and complications never above tier 1 in data`, !safety.length, safety.join('\n'));
  }

  // 4. plexus data
  for (const [px, d] of Object.entries(D.plexus || {})) {
    const els = d.elements || {};
    const levels = d.levels || [];
    const problems = []; const warns = [];
    for (const [bid, b] of Object.entries(d.blocks || {})) {
      const L = { target: b.target || [], covers: b.covers || [], variable: b.variable || [], spares: b.spares || [] };
      const both = L.target.filter((x) => L.covers.includes(x));
      if (both.length) problems.push(`${bid}: in both target and covers: ${both.join(', ')}`);
      const keys = Object.keys(L);
      for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
        if (keys[i] === 'target' && keys[j] === 'covers') continue;
        const ov = L[keys[i]].filter((x) => L[keys[j]].includes(x));
        if (ov.length) warns.push(`${bid}: in both ${keys[i]} and ${keys[j]}: ${ov.join(', ')}`);
      }
      for (const [k, list] of Object.entries(L)) for (const x of list) if (!els[x]) problems.push(`${bid}.${k}: no element "${x}"`);
    }
    for (const [eid, e] of Object.entries(els)) {
      for (const r of e.roots || []) if (!levels.includes(r)) problems.push(`${eid}: root ${r} is not in levels [${levels.join(', ')}]`);
      for (const par of e.parents || []) if (!els[par]) problems.push(`${eid}: parent "${par}" does not exist`);
    }
    const noColour = levels.filter((l) => d.levelColours && !d.levelColours[l]);
    if (noColour.length) problems.push(`levels without a colour: ${noColour.join(', ')}`);
    R.check(`plexus ${px}: target/covers disjoint, elements exist, roots within levels`, !problems.length, problems.join('\n'));
    if (warns.length) R.warn(`plexus ${px}: other status overlaps`, warns.join('\n     '));
  }

  // 5. scene ids
  {
    const bad = []; let n = 0;
    for (const [p, bs] of Object.entries(D.blocks)) for (const b of bs) walkObj(b, (o, at) => {
      if (!Array.isArray(o.ids)) return;
      for (const gid of o.ids) {
        n++;
        const [px, el] = String(gid).split(':');
        if (px === 'brachial' || px === 'brachial-plexus') { if (!D.brachial?.elements.includes(el)) bad.push(`${p} ${b.id}.${at.join('.')}: no brachial element "${el}"`); } else if (!D.plexus?.[px]) bad.push(`${p} ${b.id}.${at.join('.')}: unknown plexus "${px}" in "${gid}"`);
        else if (!D.plexus[px].elements?.[el]) bad.push(`${p} ${b.id}.${at.join('.')}: no ${px} element "${el}"`);
      }
    });
    R.check(`scene ids exist in the plexus / brachial data (${n} ids)`, !bad.length, bad.join('\n'));
  }

  // 6. doses
  const verbose = [];
  {
    // 6a. arithmetic everywhere
    const arith = [];
    for (const [p, bs] of Object.entries(D.blocks)) for (const b of bs) arith.push(...mgArithmetic(JSON.stringify(b), `${p}${b.id}`));
    for (const [region, o] of Object.entries(D.ops)) arith.push(...mgArithmetic(JSON.stringify(o.OPS), `ops ${region}`));
    for (const [p, h] of Object.entries(H)) for (const [ch, t] of Object.entries(h.text || {})) arith.push(...mgArithmetic(t, `${p}#${ch} (page)`));
    for (const [k, b] of Object.entries(RAI?.blocks || {})) for (const [label, vol, mg] of b.dose || []) {
      const c = (String(label).match(/(\d*\.?\d+)\s*%/) || [])[1]; const v = (String(vol).match(/(\d+(?:\.\d+)?)/) || [])[1]; const m = (String(mg).match(/(\d+(?:\.\d+)?)/) || [])[1];
      if (c && v && m && Math.abs(Number(v) * Number(c) * 10 - Number(m)) > 0.6) arith.push(`RA_INDEX ${k}: ${label} ${vol} gives ${mg}, want ${Number(v) * Number(c) * 10} mg`);
    }
    const uniq = [...new Set(arith)];
    R.check('doses: every "X ml of Y% (Z mg)" adds up', !uniq.length, uniq.join('\n'));

    // 6b. glance vs dose{}
    const gl = [];
    for (const [p, bs] of Object.entries(D.blocks)) for (const b of bs) {
      if (!b?.glance?.dose || !b.dose || b.dose.html) continue;
      const want = doseTokens(`${b.dose.volume || ''} ${b.dose.conc || ''}`);
      const miss = corpusHas(b.glance.dose, { vols: [...want.vols], concs: [...want.concs] });
      if (miss.length && !allowed(`${p}${b.id}:glance`)) gl.push(`${p}#ch-${b.id}: glance "${b.glance.dose}" lacks ${miss.join(', ')} from the dose box "${b.dose.volume} of ${b.dose.conc} ${b.dose.drug || ''}"`);
    }
    R.check('doses: each "At a glance" dose agrees with its dose box', !gl.length, gl.join('\n'));

    // 6c. ops, planner and RA_INDEX doses appear in the block's own data / page
    const mism = [];
    const compare = (source, p, b, text, key) => {
      const t = doseTokens(text);
      if (!t.vols.size && !t.concs.size) return;
      const miss = corpusHas(corpusOf(p, b), { vols: [...t.vols], concs: [...t.concs] });
      verbose.push(`${source} → ${p}#ch-${b.id}: ${[...t.vols].map((v) => `${v} ml`).concat([...t.concs].map((c) => `${c}%`)).join(', ')}${miss.length ? `  ✗ ${miss.join(', ')}` : ''}`);
      if (miss.length && !allowed(key)) mism.push(`${source} gives ${miss.join(', ')} for ${p}#ch-${b.id}, which the block never mentions ("${String(text).replace(/<[^>]+>/g, '').slice(0, 90)}")  [allow key: ${key}]`);
    };
    for (const [region, o] of Object.entries(D.ops)) for (const op of o.OPS) for (const g of op.groups || []) for (const it of g.items || []) {
      if (!it.dose || (it.blocks || []).length !== 1) continue;
      const href = o.LINKS[it.blocks[0]]; if (!href) continue;
      const u = new URL(href, `${BASE}${region}/`);
      const p = u.pathname.slice(1); const b = blockOf(p, decodeURIComponent(u.hash.slice(1)));
      if (b) compare(`ops ${region} #op-${op.id} "${it.name}"`, p, b, it.dose, `ops:${region}:${op.id}:${it.blocks[0]}`);
    }
    const plannerSrc = fs.readFileSync(path.join(ROOT, 'lower-limb/thigh/js/planner.js'), 'utf8');
    for (const m of plannerSrc.matchAll(/\{\s*id:\s*'([\w-]+)',\s*name:\s*'([^']+)',\s*href:\s*'([^']+)'[^\n]*?vol:\s*(\d+(?:\.\d+)?),\s*conc:\s*(\d*\.?\d+)/g)) {
      const [, id, name, href, vol, conc] = m;
      const u = new URL(href, `${BASE}lower-limb/thigh/`);
      const p = u.pathname.slice(1); const b = blockOf(p, decodeURIComponent(u.hash.slice(1)));
      if (b) compare(`thigh planner "${name}"`, p, b, `${vol} ml of ${conc}%`, `planner:${id}`);
      else verbose.push(`thigh planner "${name}": ${href} is not a block chapter (not compared)`);
    }
    const RAMAP = { peng: 'peng', lfcn: 'lfcn', fib: 'fib', femoral: 'femoral', 'adductor-canal': 'adductor-canal', popliteal: 'popliteal', ankle: 'ankle' };
    if (!RAI) R.warn('RA_INDEX readable', 'could not read window.RA_INDEX from lower-limb/anim/ (not compared)');
    for (const [k, rb] of Object.entries(RAI?.blocks || {})) {
      const bid = RAMAP[k] || k;
      const hit = Object.entries(D.blocks).find(([, bs]) => bs.some((b) => b.id === bid));
      if (!hit) { verbose.push(`RA_INDEX ${k}: no engine block "${bid}"`); continue; }
      const [p, bs] = hit; const b = bs.find((x) => x.id === bid);
      (rb.dose || []).forEach(([label, vol], i) => compare(`RA_INDEX ${k} (animation header, Dr Chew Shi Hao's)`, p, b, `${vol} of ${label}`, `ra-index:${k}:${i}`));
    }
    R.check('doses: ops, planner and animation-index doses match the block pages', !mism.length, mism.join('\n'));
  }
  if (args.verbose) console.log(`Doses compared:\n  ${verbose.join('\n  ')}\n`);

  // 8. "If it goes wrong" decision guides
  {
    const dc = D.decisions;
    if (!dc) R.fail('decision guides load', 'shared/regional/js/data/decisions.js did not import');
    else {
      R.check(`decision guides: ${dc.ids.length} guides, each sound (steps reachable, targets exist, no loops, an end)`, dc.ids.length >= 8 && !dc.problems.length, dc.problems.join('\n') || `only ${dc.ids.length} guides`);
      R.check('SAFETY: every decision guide and step is tier 1 (MO)', !dc.tiers.length, dc.tiers.join('\n'));
      const want = ['last', 'pain', 'vessel', 'failed', 'nerve'];
      const missCore = want.filter((g) => !dc.core.includes(g) || !dc.ids.includes(g));
      R.check('decision guides: the core set is LAST, pain on injection, vascular puncture, failed block and nerve injury', !missCore.length, `missing: ${missCore.join(', ')}`);
      R.check('decision guides: GUIDE_ORDER lists every guide once', dc.order.length === dc.ids.length && dc.ids.every((id) => dc.order.includes(id)), `order ${dc.order.join(',')} vs ${dc.ids.join(',')}`);
      const reg = D.registry || {};
      const badRef = Object.entries(dc.extra).flatMap(([g, ids]) => [...(dc.ids.includes(g) ? [] : [`${g}: no such guide`]), ...ids.filter((id) => !reg[id]).map((id) => `${g}: "${id}" is not a registry id`)]);
      R.check('decision guides: EXTRA_GUIDES names real guides and registry ids', !badRef.length, badRef.join('\n'));
      const noCore = Object.entries(dc.maps).filter(([, gs]) => want.some((g) => !gs.includes(g))).map(([id, gs]) => `${id}: ${gs.join(', ')}`);
      R.check(`decision guides: every block (${Object.keys(dc.maps).length} registry and engine ids) gets the core guides`, !noCore.length, noCore.join('\n'));
      // Extras that must apply (clinical minimum; the owner approved the full lists in EXTRA_GUIDES).
      const MUST = { pneumo: ['supraclavicular', 'infraclavicular', 'pvb', 'pecs'], phrenic: ['interscalene', 'supraclavicular'], high: ['spinal', 'pvb', 'esp'] };
      const noExtra = Object.entries(MUST).flatMap(([g, ids]) => ids.filter((id) => !dc.maps[id]?.includes(g)).map((id) => `${id} lacks ${g}`));
      R.check('decision guides: pneumothorax, phrenic palsy and high block guides reach the blocks that need them', !noExtra.length, noExtra.join('\n'));
      const lipid = ['1.5 ml/kg', '15 ml/kg/h', '30 ml/kg/h', '12 ml/kg', '20% lipid emulsion', '1 microgram/kg'].filter((t) => !dc.lastText.includes(t));
      R.check('decision guides: the LAST guide gives the lipid emulsion doses and the reduced adrenaline dose', !lipid.length, `missing: ${lipid.join(', ')}`);
    }
  }

  // 7. no cite( in regional data
  {
    const files = walk(['truncal', 'head-neck', 'lower-limb', 'shared/regional', 'blocks'], ['.js', '.mjs', '.html']).filter((f) => !f.startsWith('lower-limb/anim') && !f.startsWith('shared/regional/test/') && !f.endsWith('shared/regional/js/refs.js') && !f.startsWith('truncal/shared/'));
    const hits = [];
    for (const f of files) {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      src.split('\n').forEach((line, i) => {
        const code = line.replace(/\/\/.*$/, '');
        if (/\bcite(El)?\s*\(/.test(code) || /from\s+['"][^'"]*\/refs\.js/.test(code)) hits.push(`${f}:${i + 1}: ${line.trim().slice(0, 100)}`);
      });
    }
    R.check('no cite( calls or refs.js imports in the regional pages and data', !hits.length, hits.join('\n'));
  }

  await browser.close();
  console.error(`  done in ${Math.round((Date.now() - t0) / 1000)} s`);
  return R.finish();
}

main().then((code) => process.exit(code), (err) => { console.error(err); process.exit(2); });
