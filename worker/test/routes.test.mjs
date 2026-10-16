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
// everything else maps inside mo/ (so it is a 404 there, and sites.js sends it to anantf.com)
assert.deepEqual(R(MO, '/babymo/'), { file: 'mo/babymo/' });
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
console.log('ok   routes');
