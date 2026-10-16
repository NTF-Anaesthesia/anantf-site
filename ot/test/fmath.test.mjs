// fmath.js: accuracy against Math, edge cases, and a golden table of exact output bits (DESIGN.md, "Cross-browser").
// The golden bits are what this implementation returns; they are the same on V8 and JavaScriptCore (planning
// prototype), so a change here means the code changed, not the engine. Run: node ot/test/fmath.test.mjs
import assert from 'node:assert/strict';
import * as f from '../js/model/fmath.js';

const dv = new DataView(new ArrayBuffer(8));
const hex = x => { dv.setFloat64(0, x); return dv.getBigUint64(0).toString(16).padStart(16, '0'); };
const rel = (a, b) => (a === b ? 0 : Math.abs(a - b) / Math.max(Math.abs(b), Number.MIN_VALUE));

// a deterministic sweep of inputs (no Math.random in tests either, so failures reproduce)
function* sweep(lo, hi, n) { for (let i = 0; i <= n; i++) yield lo + ((hi - lo) * i) / n; }
let worst = { exp: 0, log: 0, sin: 0, cos: 0, pow: 0 };
for (const x of sweep(-50, 50, 20000)) worst.exp = Math.max(worst.exp, rel(f.exp(x), Math.exp(x)));
for (const e of sweep(-12, 6, 20000)) { const x = 10 ** e; worst.log = Math.max(worst.log, rel(f.log(x), Math.log(x))); }
for (const x of sweep(-1000, 1000, 40000)) {
  if (Math.abs(Math.sin(x)) > 1e-6) worst.sin = Math.max(worst.sin, rel(f.sin(x), Math.sin(x)));
  if (Math.abs(Math.cos(x)) > 1e-6) worst.cos = Math.max(worst.cos, rel(f.cos(x), Math.cos(x)));
}
for (const b of sweep(0.001, 100, 400)) for (const y of sweep(-2, 8, 50)) worst.pow = Math.max(worst.pow, rel(f.pow(b, y), Math.pow(b, y)));
// two ulp is about 4.4e-16 relative; Math has its own error too, so allow a little more for the comparison
assert.ok(worst.exp < 6e-16, `exp worst ${worst.exp}`);
assert.ok(worst.log < 6e-16, `log worst ${worst.log}`);
assert.ok(worst.sin < 1e-15 && worst.cos < 1e-15, `sin ${worst.sin} cos ${worst.cos}`);
assert.ok(worst.pow < 1e-14, `pow worst ${worst.pow}`);

// edge cases (DESIGN.md)
assert.equal(f.pow(0, 2), 0);
assert.equal(f.pow(0, -1), Infinity);
assert.equal(f.pow(5, 0), 1);
assert.ok(Number.isNaN(f.pow(-1, 2)));
assert.equal(f.log(0), -Infinity);
assert.ok(Number.isNaN(f.log(-1)));
assert.equal(f.exp(-800), 0);
assert.equal(f.exp(800), Infinity);
assert.ok(Number.isNaN(f.sin(1e6)), 'sin refuses |x| beyond its valid range');
assert.equal(f.hill(0, 3), 0);
assert.equal(f.hill(-1, 3), 0);
assert.ok(Math.abs(f.hill(1, 3) - 0.5) < 1e-15);
assert.ok(Math.abs(f.pow10(2) - 100) < 1e-12);

// golden bits
const GOLDEN = [["exp",-50,"3b6d257d547e083f"],["exp",-7.25,"3f47455fe323fafe"],["exp",-1,"3fd78b56362cef38"],["exp",-0.001,"3feff7cfe56f1a9e"],["exp",0.5,"3ffa61298e1e069c"],["exp",1,"4005bf0a8b14576a"],["exp",2.302585092994046,"4024000000000001"],["exp",10,"40d5829dcf950560"],["exp",49.9,"446fca229f32cefe"],["log",1e-12,"c03ba18a998fffa0"],["log",0.001,"c01ba18a998fffa0"],["log",0.3,"bff34378fcbda721"],["log",1.5,"3fd9f323ecbf984c"],["log",2,"3fe62e42fefa39ef"],["log",10,"40026bb1bbb55516"],["log",345.6,"401761919d420a6f"],["log",1000000,"402ba18a998fffa0"],["sin",0.1,"3fb98eaecb8bcb2c"],["sin",1,"3feaed548f090cee"],["sin",3,"3fc210386db6d55b"],["sin",6.2,"bfb54558dbbecd1d"],["sin",-2.5,"bfe326af0dcfcab0"],["sin",100,"bfe03425b78c4db8"],["sin",1000.5,"3fefd948c50a7a0d"],["cos",0.1,"3fefd712f9a817c1"],["cos",1,"3fe14a280fb5068c"],["cos",3,"bfefae04be85e5d2"],["cos",6.2,"3fefe3ac4079a9ce"],["cos",-2.5,"bfe9a2f7ef858b7d"],["cos",100,"3feb981dbf665fdf"],["cos",1000.5,"3fb8dbff75eb664f"],["pow",[0.5,1.43],"3fd7c09bc99fe2f8"],["pow",[3.2,5.22],"407b164dcadb377a"],["pow",[7.58,-5.22],"3efad6280b205213"],["pow",[100,0.5],"4024000000000001"],["pow",[2,8],"406ffffffffffffe"],["pow",[0.01,-2],"40c3880000000005"]];
for (const [fn, x, want] of GOLDEN) {
  const got = hex(Array.isArray(x) ? f[fn](...x) : f[fn](x));
  assert.equal(got, want, `${fn}(${x}) bits ${got}, want ${want}`);
}
console.log(`ot-sim fmath: ok (worst relative error exp ${worst.exp.toExponential(1)}, log ${worst.log.toExponential(1)}, sin ${worst.sin.toExponential(1)}, cos ${worst.cos.toExponential(1)}, pow ${worst.pow.toExponential(1)}; ${GOLDEN.length} golden values)`);
