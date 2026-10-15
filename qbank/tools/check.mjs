// Check the question bank and every paper: node qbank/tools/check.mjs   (exit code 1 if anything must be fixed)
import fs from 'node:fs';
import { checkBank, resolvePaper } from '../js/bank.js';
const dir = new URL('../', import.meta.url).pathname;
const bank = JSON.parse(fs.readFileSync(dir + 'bank/questions.json', 'utf8'));
const { errors, warnings, questions } = checkBank(bank);
for (const f of fs.readdirSync(dir + 'papers').filter(f => f.endsWith('.json'))) {
  const paper = JSON.parse(fs.readFileSync(dir + 'papers/' + f, 'utf8'));
  if (paper.id + '.json' !== f) errors.push(`papers/${f}: its id should be "${f.replace(/\.json$/, '')}".`);
  const r = resolvePaper(paper, questions);
  errors.push(...r.errors);
  if (r.pool.length < r.settings.count) warnings.push(`${paper.id}: ${r.pool.length} ready questions for a ${r.settings.count}-question sitting.`);
  if (r.pool.filter(q => q.must).length > r.settings.count) errors.push(`${paper.id}: more must-ask questions than fit in a sitting.`);
}
for (const q of questions) if (q.image && !fs.existsSync(dir + q.image)) errors.push(`${q.id}: picture ${q.image} is missing.`);
const n = s => questions.filter(q => q.status === s).length;
console.log(`qbank: ${questions.length} questions (${n('active')} ready, ${n('draft')} draft, ${n('archived')} archived)`);
for (const w of warnings) console.log('  warning:', w);
for (const e of errors) console.log('  ERROR:', e);
if (errors.length) { console.log(`${errors.length} problem(s) to fix.`); process.exit(1); }
console.log('qbank check ok');
