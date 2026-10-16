// The address-to-folder rules for mo.anantf.com (worker/routes.js). Run: node worker/test/routes.test.mjs
import assert from 'node:assert/strict';
import { resolve, isSite, SITES } from '../routes.js';

const R = (h, p) => resolve(h, p);
const MO = 'mo.anantf.com';

// the root is the landing page; the guide and its files come from mo/
assert.deepEqual(R(MO, '/'), { file: 'mo/' });
assert.deepEqual(R(MO, '/guide/'), { file: 'mo/guide/' });
assert.deepEqual(R(MO, '/guide/sw.js'), { file: 'mo/guide/sw.js' });
assert.deepEqual(R(MO, '/guide'), { file: 'mo/guide' });             // sites.js adds the slash for a folder
assert.deepEqual(R(MO, '/sw.js'), { file: 'mo/sw.js' });             // the retired worker (old installs)
assert.deepEqual(R(MO.toUpperCase() + ':443', '/guide/'), { file: 'mo/guide/' });
// the folder's own name works, and its bare name gets the slash
assert.deepEqual(R(MO, '/mo/guide/'), { file: 'mo/guide/' });
assert.deepEqual(R(MO, '/mo'), { redirect: '/mo/' });
// shared: the app kit, the fonts and the logo mark, exactly as in the repo
assert.deepEqual(R(MO, '/assets/app/app.css'), { file: 'assets/app/app.css' });
assert.deepEqual(R(MO, '/fonts/inter.woff2'), { file: 'fonts/inter.woff2' });
assert.deepEqual(R(MO, '/ana-ntf-monogram.svg'), { file: 'ana-ntf-monogram.svg' });
assert.deepEqual(R(MO, '/assets'), { redirect: '/assets/' });
// the Baby MO test is /test/ (from babymo/); the old path means the same thing here
assert.deepEqual(R(MO, '/test/'), { file: 'babymo/' });
assert.deepEqual(R(MO, '/test/sw.js'), { file: 'babymo/sw.js' });
assert.deepEqual(R(MO, '/test/js/app.js'), { file: 'babymo/js/app.js' });
assert.deepEqual(R(MO, '/test'), { redirect: '/test/' });
assert.deepEqual(R(MO, '/babymo/'), { redirect: '/test/' });
assert.deepEqual(R(MO, '/babymo'), { redirect: '/test/' });
assert.deepEqual(R(MO, '/babymo/js/app.js'), { redirect: '/test/js/app.js' });
assert.deepEqual(R(MO, '/test/%2e%2e/%2e%2e/README.md'), { notFound: true });
// the question bank's data (read by the test) is shared; the qbank app is not
assert.deepEqual(R(MO, '/qbank/bank/questions.json'), { file: 'qbank/bank/questions.json' });
assert.deepEqual(R(MO, '/qbank/papers/babymo.json'), { file: 'qbank/papers/babymo.json' });
assert.deepEqual(R(MO, '/qbank/js/bank.js'), { file: 'qbank/js/bank.js' });
assert.deepEqual(R(MO, '/qbank/img/x.jpg'), { file: 'qbank/img/x.jpg' });
assert.deepEqual(R(MO, '/qbank/'), { file: 'mo/qbank/' });
assert.deepEqual(R(MO, '/qbank/index.html'), { file: 'mo/qbank/index.html' });
// everything else maps inside mo/ (so it is a 404 there, and sites.js sends it to anantf.com)
assert.deepEqual(R(MO, '/spinal/'), { file: 'mo/spinal/' });
// no way out of the folder
for (const p of ['/%2e%2e/README.md', '/guide/%2e%2e/%2e%2e/README.md', '/guide/..%2fREADME.md', '/guide/..\\README.md', '/guide/../README.md', '/%2E%2E/x'])
  assert.deepEqual(R(MO, p), { notFound: true }, p);
// other hosts (PR previews) serve the files as they are, and can try the mapping under /_sites/<host>/
assert.deepEqual(R('anantf-mo.example.workers.dev', '/spinal/'), { file: 'spinal/' });
assert.deepEqual(R('anantf-mo.example.workers.dev', '/_sites/mo.anantf.com/guide/'), { file: 'mo/guide/' });
assert.deepEqual(R('anantf-mo.example.workers.dev', '/_sites/mo.anantf.com'), { redirect: '/_sites/mo.anantf.com/' });
assert.deepEqual(R('anantf-mo.example.workers.dev', '/_sites/mo.anantf.com/mo'), { redirect: '/_sites/mo.anantf.com/mo/' });
assert.deepEqual(R('anantf-mo.example.workers.dev', '/_sites/other.example/x'), { file: '_sites/other.example/x' });
assert.ok(isSite(MO) && !isSite('anantf.com') && !isSite('x.workers.dev'));
assert.deepEqual(Object.keys(SITES), [MO]);

// every file Baby MO's service worker asks for (SHELL, SITE, DATA) must be served on this address: it installs all or nothing
import fs from 'node:fs';
import path from 'node:path';
const repo = path.resolve(new URL('../..', import.meta.url).pathname);
const sw = fs.readFileSync(path.join(repo, 'babymo/sw.js'), 'utf8');
const list = n => [...sw.match(new RegExp(`const ${n} = \\[([\\s\\S]*?)\\];`))[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
for (const f of [...list('SHELL'), ...list('SITE'), ...list('DATA')]) {
  const pub = new URL(f, 'https://' + MO + '/test/').pathname;            // where the browser asks
  const r = R(MO, pub);
  assert.ok(r.file, `Baby MO file ${f} (${pub}) is not served on ${MO}`);
  const onDisk = r.file.endsWith('/') ? r.file + 'index.html' : r.file;
  assert.ok(fs.existsSync(path.join(repo, onDisk)), `${pub} -> ${onDisk} does not exist`);
}
const IMG = new URL('../qbank/img/', 'https://' + MO + '/test/').pathname;
assert.deepEqual(R(MO, IMG + 'a.png'), { file: 'qbank/img/a.png' });
console.log('ok   routes');