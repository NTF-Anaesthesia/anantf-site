// Seeded randomness for the model (DESIGN.md, "Determinism"). sfc32 uses only 32-bit integer operations, which
// ECMA-262 defines exactly, so a seed gives the same draws on every engine. Each consumer has its own named
// sub-stream, seeded from a 32-bit FNV-1a hash of `seed:name`, so adding a consumer in a later PR does not shift the
// numbers any other consumer sees. Stream state is four uint32s kept in sim.state (plain data, so snapshots carry it).

export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

// one sfc32 step on a 4-word state array (mutated); returns a uint32
export function next32(s) {
  const a = s[0], b = s[1], c = s[2], d = s[3];
  const t = (((a + b) >>> 0) + d) >>> 0;
  s[3] = (d + 1) >>> 0;
  s[0] = (b ^ (b >>> 9)) >>> 0;
  s[1] = (c + (c << 3)) >>> 0;
  const r = ((c << 21) | (c >>> 11)) >>> 0;
  s[2] = (r + t) >>> 0;
  return t;
}

// a new stream state for (seed, name), warmed up with 12 discarded draws
export function streamState(seed, name) {
  const h = fnv1a(`${seed >>> 0}:${name}`);
  const s = [0x9e3779b9, h, fnv1a(name), (seed >>> 0) ^ 0x85ebca6b];
  for (let i = 0; i < 12; i++) next32(s);
  return s;
}

// uniform in [0, 1): 32 random bits divided exactly by 2^32
export const uniform = s => next32(s) / 4294967296;

// an approximately standard normal draw without transcendental functions (Irwin–Hall, 6 uniforms):
// (sum - 3) * sqrt(2); variance 1, range ±4.24, good enough for monitor noise and between-patient spread
export function normal(s) {
  let sum = 0;
  for (let i = 0; i < 6; i++) sum += uniform(s);
  return (sum - 3) * 1.4142135623730951;
}
