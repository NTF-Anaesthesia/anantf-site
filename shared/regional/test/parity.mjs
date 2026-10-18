#!/usr/bin/env node
// Regional anaesthesia app: content parity with the WP0 baseline (plan §11.5, the clinical safety net).
//
//   node shared/regional/test/parity.mjs        options: --pages=…   --viewports=390,1440   --workers=4   --json=<file>
//                                                 --show (print every missing, added and allowed line)   --failsOnly
//
// At Consultant level (everything shown), every normalised text line the WP0 baseline captured on a page must still
// appear on that page, and its dose / volume / concentration strings must be identical. The only allowed differences are
// the reviewed ones in shared/regional/test/parity-allow.json:
//   { "*": { "missing": [{ "line": "...", "why": "..." }], "missingPatterns": [{ "re": "^...$", "why": "..." }] },
//     "<page>": { "missing": [...], "missingPatterns": [...], "doses": { "<dose string>": "why" } } }
// New lines (on the page now, not in the baseline) are listed with --show; a new line that carries a dose, volume or
// concentration fails unless parity-allow.json lists it under "added" (exact line or "addedPatterns"), because new
// reader-facing dose text needs the owner's review.
// Each entry names the reason (renamed title, credit line, …) and is reviewed in the PR that needs it. Never add an entry
// to make a clinical change pass.

import path from 'node:path';
import {
  args, BASE, BASEDIR, PAGES, VIEWPORTS, DOSE_RE, listArg, slug, launch, openContext, waitReady, pool, captureText, stepScans,
  brachialText, plexusText, compareText, parityAllow, readJson, reporter,
} from './lib.mjs';

const pages = listArg('pages', PAGES);
const vps = listArg('viewports', Object.keys(VIEWPORTS));
const R = reporter('Parity');

async function capture(browser, p, vp) {
  const { ctx, page, log } = await openContext(browser, { vp, level: 'consultant' });
  try {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitReady(page);
    const out = { page: p, vp };
    const level = await page.evaluate(() => document.body.dataset.level || null);
    if (level && level !== 'consultant') out.levelProblem = `page shows level ${level}`;
    const isEngine = await page.evaluate(() => !!document.querySelector('.tb-chapter[id^="ch-"]'));
    if (isEngine) {
      out.scans = (await stepScans(page, vp === '390')).scans; // same steps as the baseline run (it taps Next on phones)
      await page.evaluate(() => { location.hash = 'ch-home'; });
      await page.waitForTimeout(100);
    }
    if (p === 'brachial-plexus/') out.extra = await brachialText(page);
    if (p === 'plexus/') out.extra = await plexusText(page);
    out.text = await captureText(page);
    out.errors = [...log.pageErrors];
    return out;
  } finally { await ctx.close(); }
}

async function main() {
  const browser = await launch();
  const jobs = pages.flatMap((p) => vps.map((vp) => [p, vp]));
  const res = await pool(jobs, Number(args.workers || 4), ([p, vp]) => capture(browser, p, vp), ([p, vp]) => `${p} @${vp}`);
  await browser.close();
  const allowedSeen = new Set();
  const allowJ = readJson(path.join(path.dirname(BASEDIR), 'parity-allow.json'), {});
  jobs.forEach(([p, vp], i) => {
    const r = res[i];
    const name = `${p} @${vp}`;
    if (!r || r.error) { R.fail(name, `capture failed: ${r?.error}`); return; }
    const base = readJson(path.join(BASEDIR, `${slug(p)}.json`))?.viewports?.[vp];
    if (!base) { R.warn(name, 'no baseline for this page/viewport'); return; }
    const c = compareText(p, base, r);
    c.allowed.forEach((l) => allowedSeen.add(`${p}\t${l}`));
    const why = [];
    if (r.levelProblem) why.push(r.levelProblem);
    if (r.errors?.length) why.push(`page errors: ${r.errors.slice(0, 2).join(' | ')}`);
    if (c.missing.length) why.push(`${c.missing.length} baseline line(s) missing:\n${c.missing.slice(0, args.show ? 999 : 12).map((l) => `  - ${JSON.stringify(l.slice(0, 160))}`).join('\n')}${c.missing.length > 12 && !args.show ? `\n  … ${c.missing.length - 12} more (--show)` : ''}`);
    if (c.doseDiff.length) why.push(`dose strings changed: ${c.doseDiff.join(', ')}`);
    const allowAdded = new Set([...(allowJ['*']?.added || []), ...(allowJ[p]?.added || [])].map((x) => (typeof x === 'string' ? x : x.line)));
    const allowAddedRe = [...(allowJ['*']?.addedPatterns || []), ...(allowJ[p]?.addedPatterns || [])].map((x) => new RegExp(typeof x === 'string' ? x : x.re));
    const doseRe = new RegExp(DOSE_RE.source);
    // A reviewed rename (parity-allow.json "renames", e.g. FRCA → MMed) of a baseline line is not new text.
    const rn = parityAllow().renames(p);
    const renamedOf = (l) => { let x = l; for (const r of rn) { r.re.lastIndex = 0; x = x.replace(r.re, r.to); } return x.toLowerCase(); };
    const renamedNow = new Set(c.allowed.map(renamedOf));
    const newDose = c.added.filter((l) => doseRe.test(l) && !allowAdded.has(l) && !allowAddedRe.some((re) => re.test(l)) && !renamedNow.has(l.toLowerCase()));
    if (newDose.length) why.push(`${newDose.length} new line(s) with a dose, volume or concentration (not in the baseline):\n${newDose.slice(0, 12).map((l) => `  + ${JSON.stringify(l.slice(0, 160))}`).join('\n')}`);
    R.check(`${name}: all baseline text and doses present${c.allowed.length ? ` (${c.allowed.length} reviewed change(s))` : ''}`, !why.length, why.join('\n'));
    if (args.show && c.allowed.length) R.warn(`${name}: reviewed changes`, c.allowed.map((l) => JSON.stringify(l.slice(0, 120))).join('\n     '));
    if (args.show && c.added.length) R.warn(`${name}: ${c.added.length} line(s) new since the baseline (check they are UI text, not content)`, c.added.map((l) => `+ ${JSON.stringify(l.slice(0, 120))}`).join('\n     '));
  });
  // Allow-list entries that no longer match anything are stale: say so (they should be removed in the next PR).
  const a = readJson(path.join(path.dirname(BASEDIR), 'parity-allow.json'), {});
  const stale = [];
  for (const [p, v] of Object.entries(a)) {
    if (p.startsWith('_')) continue;
    for (const x of v.missing || []) { const l = typeof x === 'string' ? x : x.line; if (![...allowedSeen].some((s) => s.endsWith(`\t${l}`))) stale.push(`${p}: ${JSON.stringify(l).slice(0, 80)}`); }
  }
  if (stale.length && !args.pages) R.warn('parity-allow.json entries not needed by any page (stale?)', stale.join('\n     '));
  return R.finish();
}

main().then((code) => process.exit(code), (err) => { console.error(err); process.exit(2); });
