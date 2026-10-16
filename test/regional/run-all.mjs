#!/usr/bin/env node
// Regional anaesthesia app: run every QA suite (plan §11) and the existing suites that must stay green, then print one
// summary. Exit code 1 if any suite fails.
//
//   node test/regional/run-all.mjs                 everything (≈ 10 min on a laptop)
//   node test/regional/run-all.mjs --gate=main     the gate after each merge to main: static + smoke + deeplinks
//   options: --only=static,data   --skip=parity   --strict (smoke also fails on the polish targets)
//            --out=<dir> (each suite's full log and JSON result is written there)
//
// Needs a static server on the repo root (python3 -m http.server 8765) and the global Playwright.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { args, ROOT, ensureServer } from './lib.mjs';

const SUITES = [
  { id: 'la', cmd: ['test/regional/la.test.mjs'], what: 'local anaesthetic dose maths: maxima, mg/ml, lean weight, combined fraction, dose-box parsing' },
  { id: 'static', cmd: ['test/regional/static.mjs'], what: 'shims unused, noindex, no FRCA, no SW, no personal contacts, references exist' },
  { id: 'data', cmd: ['test/regional/data.mjs'], what: 'registry, ops keys, tiers + safety rule, plexus sets, scene ids, dose consistency, no cite(' },
  { id: 'smoke', cmd: ['test/regional/smoke.mjs', ...(args.strict ? ['--strict'] : [])], what: '20 pages × 390/1440: errors, 4xx, overflow, scans, polish, lazy 3D/iframes, credit' },
  { id: 'deeplinks', cmd: ['test/regional/deeplinks.mjs'], what: 'old URLs and hashes land on the right visible element; shims; redirects; edit.html' },
  { id: 'levels', cmd: ['test/regional/levels.mjs'], what: 'MO / Resident / Consultant: hiding, hints, SAFETY at MO, persistence, migration, relax' },
  { id: 'parity', cmd: ['test/regional/parity.mjs'], what: 'every WP0 baseline line and dose string still on its page (Consultant)' },
  { id: 'mo-content', cmd: ['mo/test/content.test.mjs'], what: 'existing suite: MO guide content', existing: true },
  { id: 'babymo-logic', cmd: ['babymo/test/logic.test.mjs'], what: 'existing suite: Baby MO logic', existing: true },
];
const GATES = { main: ['static', 'smoke', 'deeplinks'], pr: ['la', 'static', 'data', 'smoke', 'deeplinks', 'levels', 'parity', 'mo-content', 'babymo-logic'] };

const list = (k) => (args[k] ? String(args[k]).split(',').filter(Boolean) : null);
let pick = list('only') || (args.gate ? GATES[args.gate] : null) || SUITES.map((s) => s.id);
const skip = list('skip') || [];
pick = pick.filter((id) => !skip.includes(id));
const OUT = args.out ? path.resolve(String(args.out)) : null;
if (OUT) fs.mkdirSync(OUT, { recursive: true });

function run(s) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const file = path.join(ROOT, s.cmd[0]);
    if (!fs.existsSync(file)) { resolve({ ...s, code: null, ms: 0, tail: `missing ${s.cmd[0]}` }); return; }
    const extra = OUT && !s.existing ? [`--json=${path.join(OUT, `${s.id}.json`)}`] : [];
    const own = s.existing ? [] : ['--quiet', ...(args.base ? [`--base=${args.base}`] : [])];
    const child = spawn(process.execPath, [file, ...s.cmd.slice(1), ...extra, ...own], { cwd: ROOT });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (code) => {
      if (OUT) fs.writeFileSync(path.join(OUT, `${s.id}.log`), out);
      const lines = out.trim().split('\n');
      const summary = [...lines].reverse().find((l) => /\d+\/\d+|pass|fail|ok/i.test(l)) || lines[lines.length - 1] || '';
      const fails = lines.filter((l) => /^FAIL /.test(l)).map((l) => l.slice(5));
      resolve({ ...s, code, ms: Date.now() - t0, summary: summary.trim(), fails, out });
    });
  });
}

const t0 = Date.now();
await ensureServer();
const results = [];
for (const id of pick) {
  const s = SUITES.find((x) => x.id === id);
  if (!s) { console.error(`unknown suite ${id}`); continue; }
  process.stderr.write(`▶ ${s.id}: ${s.what}\n`);
  const r = await run(s);
  results.push(r);
  process.stderr.write(`  ${r.code === 0 ? 'PASS' : 'FAIL'} in ${Math.round(r.ms / 1000)} s — ${r.summary}\n`);
}
console.log('\nRegional QA summary');
for (const r of results) {
  console.log(`${r.code === 0 ? 'PASS' : 'FAIL'}  ${r.id.padEnd(13)} ${String(Math.round(r.ms / 1000)).padStart(4)} s  ${r.summary}`);
  if (r.code !== 0) r.fails.slice(0, 12).forEach((f) => console.log(`        ✗ ${f}`));
  if (r.code !== 0 && r.fails.length > 12) console.log(`        … ${r.fails.length - 12} more${OUT ? ` (see ${path.join(OUT, `${r.id}.log`)})` : ''}`);
  if (r.code !== 0 && !r.fails.length) console.log(`        ${r.out.trim().split('\n').slice(-6).join('\n        ')}`);
}
const bad = results.filter((r) => r.code !== 0);
console.log(`\n${results.length - bad.length}/${results.length} suites pass (${Math.round((Date.now() - t0) / 1000)} s).`);
process.exit(bad.length ? 1 : 0);
