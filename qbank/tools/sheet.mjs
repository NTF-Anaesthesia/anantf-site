// Spreadsheet round trip for faculty who review in Google Sheets or Excel (one row per question, ids keep rows matched).
//   node qbank/tools/sheet.mjs export [file.csv]   writes the bank as CSV (default qbank-export.csv)
//   node qbank/tools/sheet.mjs import file.csv     merges edited rows back by id (new rows get an id), then run check.mjs
// Rows missing from the CSV are left alone: nothing is deleted by an import (archive a question by setting its status).
import fs from 'node:fs';
import { toCSV, fromCSV, mergeById, bankJSON, checkBank } from '../js/bank.js';
const file = new URL('../bank/questions.json', import.meta.url).pathname;
const [cmd, path] = process.argv.slice(2);
const bank = JSON.parse(fs.readFileSync(file, 'utf8'));
if (cmd === 'export') {
  const out = path || 'qbank-export.csv';
  fs.writeFileSync(out, toCSV(bank.questions));
  console.log(`wrote ${bank.questions.length} questions to ${out}`);
} else if (cmd === 'import' && path) {
  const today = new Date().toISOString().slice(0, 10);
  const r = mergeById(bank.questions, fromCSV(fs.readFileSync(path, 'utf8')), today);
  fs.writeFileSync(file, bankJSON(r.questions));
  console.log(`${r.added} added, ${r.changed} changed, ${r.unchanged} unchanged`);
  const c = checkBank(JSON.parse(fs.readFileSync(file, 'utf8')));
  if (c.errors.length) { console.log('Now fix:\n  ' + c.errors.join('\n  ')); process.exit(1); }
} else {
  console.log('usage: node qbank/tools/sheet.mjs export [file.csv] | import file.csv'); process.exit(2);
}
