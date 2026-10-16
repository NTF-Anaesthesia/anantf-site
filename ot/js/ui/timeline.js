// The operation's surgical-stimulus timeline (DESIGN.md M3.2: "surgical stimulus timeline", "skip to next event").
// A standard general-surgery case as a scripted sequence of surgical-stimulus changes at offsets (seconds) from the
// start of the operation. It drives pd.js's ongoing `surgery` stimulus (level 0.6–1.0, or 0 to stop) plus the brief
// incision at the start — the same actions a trainee would make by hand, so it stays deterministic and replayable.
// This is NOT the M4 scenario engine (triggers, conditions, expected actions in events.js); it is only the surgical
// stimulus over time for the guided case and free run.

export const OPERATION = [
  { at: 0, stim: { type: 'stimulus', kind: 'incision' }, label: 'Skin incision' },
  { at: 10, stim: { type: 'stimulus', kind: 'surgery', level: 0.75 }, label: 'Surgery under way' },
  { at: 600, stim: { type: 'stimulus', kind: 'surgery', level: 0.9 }, label: 'Deep dissection — strong stimulus' },
  { at: 1500, stim: { type: 'stimulus', kind: 'surgery', level: 0.6 }, label: 'Closing — lighter' },
  { at: 1980, stim: { type: 'stimulus', kind: 'surgery', level: 0 }, label: 'Surgery finished' },
];

// the step at or before `elapsed` seconds, and the one after it, for the "now / next" readout
export function phaseAt(elapsed) {
  let i = -1;
  for (let k = 0; k < OPERATION.length; k++) { if (OPERATION[k].at <= elapsed) i = k; else break; }
  return { index: i, current: i >= 0 ? OPERATION[i] : null, next: OPERATION[i + 1] || null };
}
