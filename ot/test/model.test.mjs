// Page checks without a browser: noindex, and every src/href relative. Run: node ot/test/model.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /<meta name="robots" content="noindex, nofollow">/, 'app page must be noindex');

// no request leaves the folder: no absolute URLs in src/href (fonts and scripts are relative)
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) assert.ok(!/^(https?:)?\/\//.test(m[1]), `relative path: ${m[1]}`);
console.log('ot-sim page tests: ok');
