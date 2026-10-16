// The model is pure and engine-independent (DESIGN.md, "Determinism" and "Cross-browser"): js/model/ never uses
// the implementation-approximated Math functions, the ** operator, Math.random, Date, performance or the DOM.
// fmath.js is the only place that builds transcendental functions. Run: node ot/test/purity.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dir = new URL('../js/model/', import.meta.url);
const BANNED = [
  [/\*\*/, 'the ** operator (implementation-approximated; write x*x or use fmath.pow)'],
  [/Math\.(pow|exp|expm1|log|log1p|log2|log10|sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh|cbrt|hypot)\b/, 'an implementation-approximated Math function (use fmath)'],
  [/Math\.random/, 'Math.random (use rng.js streams)'],
  [/\bDate\b|performance\.now/, 'wall-clock time'],
  [/\b(document|window|localStorage|requestAnimationFrame)\b/, 'the DOM'],
];
let files = 0;
for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.js'))) {
  files++;
  const src = fs.readFileSync(new URL(name, dir), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')       // block comments
    .replace(/\/\/.*$/gm, '')                // line comments
    .replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""'); // strings
  for (const [re, why] of BANNED) assert.ok(!re.test(src), `${name} uses ${why}`);
}
assert.ok(files >= 5, 'found the model files');
console.log(`ot-sim purity: ok (${files} model files)`);
