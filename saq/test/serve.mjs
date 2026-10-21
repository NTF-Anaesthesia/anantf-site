// Runs the Part B app locally: the repo's files (so /exams/part-b/ and /fonts/ resolve) and the API, with SQLite for D1
// and stubs for Claude and email. node test/serve.mjs [port]
// Open http://localhost:8787/exams/part-b/ ; the sign-in code appears on the page. Passphrase cohort26; lead@example.com is faculty.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle } from '../src/worker.js';
import { fakeD1 } from './d1.mjs';

const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const port = Number(process.argv[2] || 8787);
const env = { DB: fakeD1(), SAQ_PASSPHRASE: 'cohort26', FACULTY_EMAILS: 'lead@example.com', COPY_TO: 'copy@example.com', DEV_SHOW_CODE: '1', ALLOWED_ORIGINS: `http://localhost:${port}` };
const deps = {
  email: async (_e, m) => { console.log(`email to ${m.to}${m.bcc ? ` (bcc ${m.bcc})` : ''}: ${m.subject}`); return true; },
  draft: async () => ({ ok: true, model: 'stub', text: '**A**\n- I would assess the airway\n**B**\n- Call for help early' }),
  mark: async (_e, q, answer) => {
    await new Promise(r => setTimeout(r, 400));
    const adjusted = 3 + (answer.length % 6);
    return { ok: true, model: 'stub', usage: {}, marking: { raw: Math.min(8, adjusted + 1), adjusted, summary: 'Structured approach was evident. Answer lacked prioritisation of the immediate concern. Borderline.', top_fixes: ['Lead with the life-threatening issue.', 'Tailor to the vignette.'], annotated: answer.split('\n').map((l, i) => i === 0 ? `${l} [*Generic: tailor to the stem.*]` : l).join('\n') } };
  },
};
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  if (req.url.startsWith('/api/')) {
    const r = await handle(new Request(`http://localhost:${port}${req.url}`, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) }), env, null, deps);
    res.writeHead(r.status, Object.fromEntries(r.headers)); return res.end(Buffer.from(await r.arrayBuffer()));
  }
  let f = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (f.endsWith('/')) f += 'index.html';
  try { const b = await readFile(path.join(repo, path.normalize(f))); res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end('not found'); }
}).listen(port, () => console.log(`http://localhost:${port}/exams/part-b/`));
