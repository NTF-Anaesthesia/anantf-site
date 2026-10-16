// Start presets (DESIGN.md, "Start presets", PR M3.2). A scenario (M4) and the guided elective GA start from a named
// state built by replaying a fixed reference action list from "awake" (the state right after the warm start), then
// fast-forwarding — so presets are deterministic and need no stored snapshots. Building a preset is model-only; it
// uses the same actions a trainee would take, so nothing special-cases the preset path.
//
// applyPreset(sim, name, opts) replays the actions on an awake sim and runs it to the preset's time; it returns the sim.
// Each preset is a function of opts returning { actions: [{ at, ...action }], to } (at and to in seconds).

const bolus = (drug, dose, unit = 'mg', route = 'iv') => ({ type: 'bolus', drug, dose, unit, route });

// the reference action lists. Times are seconds from awake. [D], the usual steps of each phase.
export const PRESETS = {
  // awake, breathing room air (the warm-start state); nothing to do
  awake: () => ({ actions: [], to: 0 }),

  // pre-oxygenation: a face mask on 100% oxygen for 3 minutes denitrogenates the lungs
  preoxygenated: () => ({
    actions: [{ at: 0, type: 'device', to: 'mask' }, { at: 0, type: 'o2', fio2: 1 }],
    to: 180,
  }),

  // conscious sedation: a light propofol target, still breathing spontaneously, not paralysed
  sedation: ({ target = 2 } = {}) => ({
    actions: [{ at: 0, type: 'o2', fio2: 0.4 }, { at: 0, type: 'tci', drug: 'propofol', target }],
    to: 240,
  }),

  // just induced and intubated, still light: pre-oxygenate, opioid, propofol, relaxant, intubate and ventilate
  induced: ({ device = 'ett', agentDial = 1.5 } = {}) => ({
    actions: [
      { at: 0, type: 'device', to: 'mask' }, { at: 0, type: 'o2', fio2: 1 },
      { at: 150, ...bolus('fentanyl', 100, 'mcg') },
      { at: 165, type: 'tci', drug: 'propofol', target: 5 },
      { at: 175, ...bolus('rocuronium', 1.2, 'mg/kg') },
      { at: 300, ...(device === 'ett' ? { type: 'intubate', placement: 'tracheal' } : { type: 'device', to: device }) },
      { at: 300, type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5, fio2: 0.5 },
      { at: 300, type: 'fgf', o2: 2, air: 0, n2o: 0 }, { at: 300, type: 'vaporiser', agent: 'sevoflurane', dial: agentDial },
    ],
    to: 330,
  }),

  // maintenance: induced, then the vaporiser up to about 1 MAC, surgery under way, some minutes in
  maintenance: ({ minutes = 15, agentDial = 2.2, surgery = 0.8 } = {}) => {
    const ind = PRESETS.induced({});
    return {
      actions: [
        ...ind.actions.filter(a => !(a.type === 'vaporiser')),
        { at: 300, type: 'vaporiser', agent: 'sevoflurane', dial: agentDial },
        { at: 360, type: 'stimulus', kind: 'incision' },
        { at: 365, type: 'stimulus', kind: 'surgery', level: surgery },
      ],
      to: 360 + minutes * 60,
    };
  },

  // emergence: a maintenance case, then the agent off and fresh gas up; the relaxant was given long ago, so it has
  // worn off and the patient is lightening
  emergence: ({ device = 'ett' } = {}) => {
    const m = PRESETS.maintenance({ minutes: 45 });
    const off = 360 + 45 * 60;
    return {
      actions: [
        ...m.actions,
        { at: off, type: 'vaporiser', agent: 'sevoflurane', dial: 0 },
        { at: off, type: 'tci', drug: 'propofol', target: 0 },
        { at: off, type: 'fgf', o2: 8, air: 0, n2o: 0 }, { at: off, type: 'stimulus', kind: 'surgery', level: 0 },
      ],
      to: off + 300,
    };
  },
};

// apply a preset to an awake sim (just created, at t = 0) and run it to the preset's time
export function applyPreset(sim, name, opts = {}) {
  const spec = (PRESETS[name] || PRESETS.awake)(opts);
  const dt = sim.state.dt;
  const actions = spec.actions.map(({ at, ...a }) => ({ ...a, step: Math.round(at / dt) }));
  sim.runTo(spec.to, actions);
  return sim;
}

export const PRESET_NAMES = Object.keys(PRESETS);
