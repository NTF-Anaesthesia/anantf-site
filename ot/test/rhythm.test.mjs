// Rhythms and the ECG (js/model/rhythm.js, the circulation's response in cardio.js, the display templates in
// ui/synth.js) against MODEL.md section 6. Run: node ot/test/rhythm.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';
import { CATALOG } from '../js/model/rhythm.js';
import { ecg, modelSource } from '../js/ui/synth.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const band = (x, lo, hi, what) => assert.ok(x >= lo && x <= hi, `${what}: ${x} not in [${lo}, ${hi}]`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3 };
const mk = () => createSim({ seed: 1, profile: { fixed } });
const set = (s, to) => { s.act({ type: 'rhythm', to }); return s; };
const adv = (s, secs) => { s.step(Math.round(secs / s.state.dt)); return s; };
const hr = s => s.state.mon.hr, map = s => s.state.cv.map, co = s => s.state.cv.co;
const bv = s => Math.round(s.state.cv.Va + s.state.cv.Vv + s.state.cv.Vp);

// baseline sinus is unchanged by the rhythm work (sinus has output 1): HR 72, a normal pressure
{
  const s = adv(mk(), 40);
  near(hr(s), 72, 6, 'sinus HR'); band(map(s), 80, 100, 'sinus MAP'); assert.equal(s.state.rh.perfusing, true, 'sinus perfuses');
  assert.ok(Number.isFinite(co(s)) && co(s) > 4 && co(s) < 7, `sinus CO ${co(s)}`);
}
// ventricular rates by rhythm (monitor HR after it settles); every value stays finite
{
  const rate = (to, lo, hi) => { const s = adv(set(mk(), to), 40); band(hr(s), lo, hi, `${to} HR`); assert.ok(Number.isFinite(map(s)) && Number.isFinite(co(s)), `${to} finite`); };
  rate('brady', 40, 50); rate('tachy', 112, 128); rate('junctional', 44, 56);
  rate('av1', 66, 78); rate('svt', 168, 192); rate('vt', 168, 192); rate('paced', 64, 76);
  // AV blocks: the ventricles run slower than the atria
  rate('wenckebach', 48, 66);   // 4:3 of an atrial 75 ≈ 56
  rate('mobitz2', 42, 58);      // 3:2 of an atrial 75 ≈ 50
  rate('chb', 30, 46);          // ventricular escape ~38, independent of the atrial 75
  rate('flutter', 135, 165);    // 2:1 of an atrial 300 ≈ 150
}
// atrial fibrillation is irregularly irregular: the beat-to-beat intervals scatter
{
  const s = adv(set(mk(), 'af'), 60);
  band(hr(s), 100, 155, 'AF mean HR');
  const rrs = s.state.mon.rrs, m = rrs.reduce((a, b) => a + b, 0) / rrs.length;
  const sd = Math.sqrt(rrs.reduce((a, b) => a + (b - m) * (b - m), 0) / rrs.length);
  assert.ok(sd / m > 0.08, `AF beat-to-beat scatter ${(sd / m).toFixed(3)}`);
}
// VT: a fast, wide, poorly-filled rhythm — reduced output but still a pulse
{
  const sinusCO = co(adv(mk(), 40));
  const s = adv(set(mk(), 'vt'), 40);
  assert.ok(co(s) < sinusCO * 0.6, `VT output reduced (${co(s)} vs ${sinusCO})`);
  band(map(s), 35, 75, 'VT MAP'); assert.equal(s.state.rh.perfusing, true, 'VT still perfuses');
  assert.equal(s.state.rh.events.length ? s.state.rh.events[0].morph : s.state.rh.qrs, 'wide', 'VT draws a wide QRS');
}
// VF: no output, HR unreadable, and the Schipke pressure decay (about 24 mmHg at 13 s, then towards the mean filling
// pressure); no ventricular beats are emitted and blood volume is conserved
{
  const s = set(mk(), 'vf');
  const v0 = bv(s);
  adv(s, 5); const m5 = map(s);
  adv(s, 8); const m13 = map(s);   // 13 s total
  adv(s, 17); const m30 = map(s);  // 30 s total
  assert.ok(Number.isNaN(hr(s)), 'VF: HR unreadable');
  near(co(s), 0, 0.01, 'VF: no output');
  band(m13, 18, 38, 'VF MAP at 13 s (Schipke ~24)');
  assert.ok(m5 > m13 && m13 >= m30 - 0.5, `VF pressure decays and flattens (${m5.toFixed(0)} ${m13.toFixed(0)} ${m30.toFixed(0)})`);
  near(bv(s), v0, 2, 'VF conserves blood volume');
  // no beat events after the switch
  const after = s.state.ev.ring.filter(e => e.kind === 'beat' && e.t > 0.2);
  assert.equal(after.length, 0, 'VF emits no ventricular beats');
}
// asystole reads zero; PEA shows organised electrical activity (a rate) but makes no pulse
{
  const a = adv(set(mk(), 'asystole'), 20);
  assert.equal(hr(a), 0, 'asystole HR 0'); near(co(a), 0, 0.01, 'asystole no output');
  const p = adv(set(mk(), 'pea'), 20);
  band(hr(p), 34, 46, 'PEA electrical rate'); near(co(p), 0, 0.01, 'PEA no pulse'); assert.equal(p.state.rh.perfusing, false, 'PEA does not perfuse');
}
// hyperkalaemia stages: perfusing, the sine-wave stage drops the output
{
  const s1 = adv(set(mk(), 'hyperk1'), 30); near(hr(s1), 72, 8, 'hyperK1 HR'); band(map(s1), 80, 100, 'hyperK1 MAP');
  const s3 = adv(set(mk(), 'hyperk3'), 30); assert.ok(co(s3) < co(s1), 'hyperK3 sine wave drops output'); assert.equal(s3.state.rh.base, 'sine', 'hyperK3 draws a sine baseline');
}
// a long run of every rhythm stays finite (no NaN plumbing)
for (const id of Object.keys(CATALOG)) {
  const s = adv(set(mk(), id), 120);
  assert.ok(Number.isFinite(map(s)) && Number.isFinite(co(s)) && map(s) > 5, `${id}: stable long run (MAP ${map(s)})`);
}

// --- the ECG renderer (ui/synth.js) draws each rhythm -------------------------------------------------------------
// a sinus beat shows a tall R wave near the beat time; VF has no beats near "now" but a moving baseline; asystole flat
const span = (src, T) => { const v = []; for (let t = T - 1; t < T; t += 0.02) v.push(ecg(src, t)); return Math.max(...v) - Math.min(...v); };
{
  const ss = adv(mk(), 10).state, sinus = modelSource(ss);
  const rt = sinus.beats.filter(e => e.t < 1e6 && e.t <= ss.t).slice(-1)[0].t; // the last real beat so far
  assert.ok(ecg(sinus, rt) > 0.7, 'sinus: a tall R wave at the beat');
  assert.ok(Math.abs(ecg(sinus, rt + 0.5)) < 0.4, 'sinus: quiet between beats');

  const vs = adv(set(mk(), 'vf'), 6).state, vf = modelSource(vs);
  // no ventricular beat in the last second (VF makes no complexes); the baseline still moves
  assert.equal(vf.beats.filter(e => e.t < 1e6 && e.t > vs.t - 1).length, 0, 'VF: no complexes at the sweep');
  assert.ok(span(vf, vs.t) > 0.3, 'VF: the baseline moves');

  const as = adv(set(mk(), 'asystole'), 6).state;
  assert.ok(span(modelSource(as), as.t) < 0.1, 'asystole: a near-flat line');

  const fs = adv(set(mk(), 'flutter'), 10).state, flut = modelSource(fs);
  assert.equal(flut.base.type, 'flutter', 'flutter: a sawtooth baseline');
  assert.ok(span(flut, fs.t) > 0.3, 'flutter: the baseline moves');
}

console.log('ot-sim rhythm: ok');
