// The model loop (DESIGN.md, "The model loop"). Fixed dt of 0.1 s; one plain-data state (numbers, arrays, strings:
// no functions, Maps or class instances, so structuredClone is a complete snapshot). Each step is a Jacobi step:
// every subsystem reads the previous step's state (never mutated) and returns a new copy of its own slice, so the
// order of subsystems changes nothing. Speed only changes how many steps run per frame.
//
// A subsystem is { name, init(state, ctx) -> slice, step(prev, ctx) -> slice, trend?(slice) -> {fields} }. ctx gives
// the step's actions, seeded draws from named sub-streams, and emit() for timed events (beats, breaths) that the UI
// drains from a bounded ring.

import { streamState, uniform, normal } from './rng.js';
import { makePatient } from './patient.js';
import { SYSTEMS } from './systems.js';

export const DT = 0.1;
export const RING = 512;            // events kept for the UI
export const TREND_EVERY = 50;      // steps between trend points (5 s of simulated time)
export const WARMUP = 300;          // seconds run at creation so every subsystem starts at steady state

function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k in o) deepFreeze(o[k]); }
  return o;
}

export class Sim {
  constructor(state, { systems = SYSTEMS, strict = false } = {}) {
    this.systems = systems;
    this.strict = strict;      // tests: freeze the previous state so any subsystem that mutates it throws
    this.state = state;
  }

  // queue an action for the next step; returns the stamped copy. Actions are plain objects (DESIGN.md, "Actions").
  act(action) {
    if (!action || typeof action.type !== 'string') throw new Error('action needs a type');
    const a = JSON.parse(JSON.stringify({ ...action, step: this.state.step }));
    this.state = { ...this.state, queue: [...this.state.queue, a] };
    return a;
  }

  step(n = 1) {
    for (let i = 0; i < n; i++) this.state = stepOnce(this.state, this.systems, this.strict);
    return this;
  }

  // run until simulated time t (seconds), replaying any actions whose step falls in the interval
  runTo(t, actions = []) {
    const target = Math.round(t / this.state.dt);
    const pending = actions.filter(a => a.step >= this.state.step && a.step < target).sort((a, b) => a.step - b.step);
    let k = 0;
    while (this.state.step < target) {
      while (k < pending.length && pending[k].step === this.state.step) { const { step, ...a } = pending[k++]; this.act(a); }
      this.step();
    }
    return this;
  }

  snapshot() { return structuredClone(this.state); }
  static restore(snap, opts) { return new Sim(structuredClone(snap), opts); }

  // the actions applied so far, as a replay list ({seed, profile, actions} reproduces the run)
  replayRecord() {
    return { seed: this.state.seed, profile: this.state.profile, actions: this.state.log.filter(e => e.kind === 'action').map(e => e.action) };
  }

  // events with seq > after (the UI keeps the last seq it drew)
  eventsSince(after) { return this.state.ev.ring.filter(e => e.seq > after); }
}

function makeCtx(prev, next, systems, actions) {
  const touched = {};
  const stream = name => {
    if (!touched[name]) { next.rng[name] = [...(prev.rng[name] || streamState(prev.seed, name))]; touched[name] = true; }
    return next.rng[name];
  };
  let ring = null, log = null;
  return {
    dt: prev.dt, step: next.step, t: next.t, actions,
    rand: name => uniform(stream(name)),
    normal: name => normal(stream(name)),
    emit(ev) {
      if (!ring) { ring = { seq: next.ev.seq, ring: next.ev.ring.slice() }; next.ev = ring; }
      ring.seq += 1;
      ring.ring.push({ ...ev, seq: ring.seq });
      if (ring.ring.length > RING) ring.ring.splice(0, ring.ring.length - RING);
    },
    log(entry) {
      if (!log) { log = next.log.slice(); next.log = log; }
      log.push({ t: next.t, ...entry });
    },
  };
}

function stepOnce(prev, systems, strict) {
  if (strict) deepFreeze(prev);
  const due = prev.queue.filter(a => a.step <= prev.step);
  const next = { ...prev, step: prev.step + 1, rng: { ...prev.rng }, queue: prev.queue.filter(a => a.step > prev.step) };
  next.t = Math.round(next.step * prev.dt * 1e6) / 1e6; // from the step count, so time never drifts
  const ctx = makeCtx(prev, next, systems, due);
  for (const a of due) ctx.log({ kind: 'action', action: a });
  for (const sys of systems) if (sys.step) next[sys.name] = sys.step(prev, ctx);
  if (next.step % TREND_EVERY === 0) {
    const point = { t: next.t };
    for (const sys of systems) if (sys.trend) Object.assign(point, sys.trend(next[sys.name]));
    next.trend = [...prev.trend, point];
  }
  return next;
}

// a new simulation: patient from the profile and seed, every subsystem initialised, then the warm start. dt is fixed
// at 0.1 s; tests pass a smaller one to check the step size changes nothing that matters
export function createSim({ seed = 1, profile = {}, systems = SYSTEMS, strict = false, warmup = WARMUP, dt = DT } = {}) {
  const state = {
    v: 1, seed: seed >>> 0, profile: JSON.parse(JSON.stringify(profile)), dt, step: 0, t: 0,
    rng: {}, queue: [], ev: { seq: 0, ring: [] }, log: [], trend: [],
  };
  const pstream = streamState(state.seed, 'patient');
  state.patient = makePatient(profile, { uniform: () => uniform(pstream), normal: () => normal(pstream) });
  state.rng.patient = pstream;
  const ctx = makeCtx(state, state, systems, []);
  for (const sys of systems) if (sys.init) state[sys.name] = sys.init(state, ctx);
  const sim = new Sim(state, { systems, strict });
  const n = Math.round(warmup / dt);
  if (n > 0) {
    sim.step(n);
    // the warm start is not part of the run: the clock, log and trend start at zero. Its last events are kept with
    // negative times (sequence numbers carry on), so the monitor has a full sweep of history at t = 0.
    const off = n * dt, ev = sim.state.ev;
    const ring = ev.ring.map(e => ({ ...e, t: Math.round((e.t - off) * 1e9) / 1e9 }));
    sim.state = { ...sim.state, step: 0, t: 0, log: [], trend: [], ev: { seq: ev.seq, ring }, queue: [] };
    for (const sys of systems) if (sys.rebase) sim.state[sys.name] = sys.rebase(sim.state[sys.name], off);
  }
  return sim;
}

// replay a record from replayRecord(): same seed, profile and actions give the same state
export function replay(record, opts = {}, until) {
  const sim = createSim({ seed: record.seed, profile: record.profile, ...opts });
  const last = record.actions.reduce((m, a) => Math.max(m, a.step), 0);
  return sim.runTo((until ?? (last + 1) * DT), record.actions);
}
