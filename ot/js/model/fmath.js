// Deterministic maths for the model (DESIGN.md, "Cross-browser"). ECMA-262 leaves Math.exp, log, pow, sin, cos and the
// ** operator "implementation-approximated", so engines may differ in the last bit and a long run could drift apart.
// + - * / and Math.sqrt are correctly rounded, and Math.floor, integer and bit operations are exact, so these
// functions, built only from those, give the same bits on every engine. Algorithms and constants follow fdlibm 5.3
// (e_exp.c, e_log.c, k_sin.c, k_cos.c, the medium path of e_rem_pio2.c). Accuracy: exp, log, sin, cos within about
// 1.2 ulp; pow within about 1e-14 relative (exp(y*log x)). sin and cos are valid for |x| < about 8.2e5 and return NaN
// beyond: keep oscillator phases in cycles wrapped to [0, 1). pow is for x >= 0 only.

const dv = new DataView(new ArrayBuffer(8));
const hiWord = x => { dv.setFloat64(0, x); return dv.getUint32(0); };
const setHi = (x, h) => { dv.setFloat64(0, x); dv.setUint32(0, h); return dv.getFloat64(0); };

// powers of two 2^-1074 .. 2^1023, built by exact doubling and halving
const P2 = new Float64Array(2098);
P2[1074] = 1;
for (let k = 1; k <= 1023; k++) P2[1074 + k] = P2[1073 + k] * 2;
for (let k = 1; k <= 1074; k++) P2[1074 - k] = P2[1075 - k] * 0.5;
const pow2 = k => P2[k + 1074];

const LN2_HI = 6.93147180369123816490e-01, LN2_LO = 1.90821492927058770002e-10, INV_LN2 = 1.44269504088896338700e+00;
const E1 = 1.66666666666666019037e-01, E2 = -2.77777777770155933842e-03, E3 = 6.61375632143793436117e-05,
  E4 = -1.65339022054652515390e-06, E5 = 4.13813679705723846039e-08;

export function exp(x) {
  if (x !== x) return x;
  if (x > 709.782712893383973096) return Infinity;
  if (x < -745.13321910194110842) return 0;
  if (x > -3.725290298461914e-9 && x < 3.725290298461914e-9) return 1 + x;
  const k = Math.floor(x * INV_LN2 + 0.5);
  const hi = x - k * LN2_HI, lo = k * LN2_LO, r = hi - lo, t = r * r;
  const c = r - t * (E1 + t * (E2 + t * (E3 + t * (E4 + t * E5))));
  const y = 1 - ((lo - (r * c) / (2 - c)) - hi);
  if (k >= -1021) return k === 1024 ? y * 2 * pow2(1023) : y * pow2(k);
  return y * pow2(k + 1000) * pow2(-1000);
}

const L1 = 6.666666666666735130e-01, L2 = 3.999999999940941908e-01, L3 = 2.857142874366239149e-01,
  L4 = 2.222219843214978396e-01, L5 = 1.818357216161805012e-01, L6 = 1.531383769920937332e-01,
  L7 = 1.479819860511658591e-01;

export function log(x) {
  if (!(x > 0)) return x === 0 ? -Infinity : NaN;
  if (x === Infinity) return x;
  let k = 0;
  if (x < 2.2250738585072014e-308) { x *= 18014398509481984; k = -54; } // subnormals: scale by 2^54
  let hx = hiWord(x);
  k += (hx >>> 20) - 1023;
  hx &= 0x000fffff;
  const i = (hx + 0x95f64) & 0x100000; // mantissa into [sqrt(2)/2, sqrt(2))
  const m = setHi(x, hx | (i ^ 0x3ff00000));
  k += i >>> 20;
  const f = m - 1, s = f / (2 + f), z = s * s, w = z * z;
  const R = z * (L1 + w * (L3 + w * (L5 + w * L7))) + w * (L2 + w * (L4 + w * L6));
  const hfsq = 0.5 * f * f;
  return k * LN2_HI - ((hfsq - (s * (hfsq + R) + k * LN2_LO)) - f);
}

// x^y for x >= 0 (the model has no negative bases)
export function pow(x, y) {
  if (y === 0 || x === 1) return 1;
  if (x === 0) return y > 0 ? 0 : Infinity;
  if (!(x > 0)) return NaN;
  return exp(y * log(x));
}

const LN10 = 2.302585092994046;
export const pow10 = y => exp(y * LN10);

const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04,
  S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05,
  C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
function ksin(x, y) {
  const z = x * x, v = z * x, r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)));
  return x - ((z * (0.5 * y - v * r) - y) - v * S1);
}
function kcos(x, y) {
  const z = x * x, r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6)))));
  const hz = 0.5 * z, w = 1 - hz;
  return w + (((1 - w) - hz) + (z * r - x * y));
}
const INV_PIO2 = 6.36619772367581382433e-01, PIO2_1 = 1.57079632673412561417e+00, PIO2_1T = 6.07710050650619224932e-11,
  PIO2_2 = 6.07710050630396597660e-11, PIO2_2T = 2.02226624879595063154e-21, PIO2_3 = 2.02226624871116645580e-21,
  PIO2_3T = 8.47842766036889956997e-32;
let ry0 = 0, ry1 = 0;
function rem(x) { // reduce |x| < 2^19 * pi/2 to ry0 + ry1 in [-pi/4, pi/4]; returns the quadrant count
  const fn = Math.floor(x * INV_PIO2 + 0.5);
  let r = x - fn * PIO2_1, w = fn * PIO2_1T, y0 = r - w;
  const j = (hiWord(x) >>> 20) & 0x7ff;
  if (j - ((hiWord(y0) >>> 20) & 0x7ff) > 16) {
    let t = r; w = fn * PIO2_2; r = t - w; w = fn * PIO2_2T - ((t - r) - w); y0 = r - w;
    if (j - ((hiWord(y0) >>> 20) & 0x7ff) > 49) {
      t = r; w = fn * PIO2_3; r = t - w; w = fn * PIO2_3T - ((t - r) - w); y0 = r - w;
    }
  }
  ry0 = y0; ry1 = (r - y0) - w;
  return fn;
}
const LIM = 823549.6653865476; // 2^19 * pi/2
const PIO4 = 0.7853981633974483;

export function sin(x) {
  if (x > -7.4505806e-9 && x < 7.4505806e-9) return x;
  if (x > PIO4 || x < -PIO4) {
    if (!(x < LIM && x > -LIM)) return NaN;
    const n = rem(x) & 3;
    return n === 0 ? ksin(ry0, ry1) : n === 1 ? kcos(ry0, ry1) : n === 2 ? -ksin(ry0, ry1) : -kcos(ry0, ry1);
  }
  return ksin(x, 0);
}

export function cos(x) {
  if (x > -7.4505806e-9 && x < 7.4505806e-9) return 1;
  if (x > PIO4 || x < -PIO4) {
    if (!(x < LIM && x > -LIM)) return NaN;
    const n = rem(x) & 3;
    return n === 0 ? kcos(ry0, ry1) : n === 1 ? -ksin(ry0, ry1) : n === 2 ? -kcos(ry0, ry1) : ksin(ry0, ry1);
  }
  return kcos(x, 0);
}

export const TAU = 6.283185307179586;

// sigmoid helpers used across the model: P = U^g / (1 + U^g) written as 1 / (1 + U^-g), U <= 0 gives 0
export function hill(u, g) {
  if (!(u > 0)) return 0;
  return 1 / (1 + pow(u, -g));
}
