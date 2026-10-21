// Builds src/refs.generated.json from docs/REFERENCES.md (sections "## References" and "## Assumptions").
// Each entry is a "### key" heading followed by "- field: value" lines and/or prose.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const md = readFileSync(root + 'docs/REFERENCES.md', 'utf8');
const out = { refs: [], assumptions: [] };
let section = null, cur = null;
for (const line of md.split('\n')) {
  const h2 = line.match(/^## (.+)/);
  if (h2) { section = /assumption/i.test(h2[1]) ? 'assumptions' : /reference/i.test(h2[1]) ? 'refs' : null; cur = null; continue; }
  const h3 = line.match(/^### (\S+)\s*(.*)$/);
  if (h3 && section) { cur = { key: h3[1], title: h3[2] || '', fields: {}, body: [] }; out[section].push(cur); continue; }
  if (!cur) continue;
  const f = line.match(/^- ([a-z ]+): (.*)$/i);
  if (f) cur.fields[f[1].trim().toLowerCase()] = f[2].trim();
  else if (line.trim()) cur.body.push(line.trim());
}
for (const s of ['refs', 'assumptions']) for (const e of out[s]) e.body = e.body.join(' ');
writeFileSync(root + 'src/refs.generated.json', JSON.stringify(out, null, 1) + '\n');
console.log(`refs ${out.refs.length}, assumptions ${out.assumptions.length}`);
