# OT simulator: technical plan

How the simulator will be built: the code's shape, the screens, the tests and the PR-by-PR order. Written 14 Oct 2026
(plan only, nothing built yet) and revised the same day after two independent reviews, throwaway prototypes of the
riskiest models (`research/prototypes.md`) and a source check of every unverified number. Read with `PLAN.md` (the
brief: milestones, guardrails, autonomy rules), `MODEL.md` (the physiology and pharmacology, every number with its
source and status) and `SCENARIOS.md` (the crises). Choices here are proposals until the owner says go; the open
questions are at the end, each with the default a build session uses if there is no answer yet.

## In short (for the owner)

- **What you need to do:** reply "go" when you are happy for the build to start. The questions at the end can wait:
  each has a default. After that, each PR lists the new clinical numbers for you to read ("Needs clinical
  read-through"); nothing is called reviewed until you have.
- **What residents get:** at `anantf.com/ot/` (unlisted), a phone-first theatre: a patient monitor at the top,
  tabs for drugs, airway, breathing, circulation, help and examination below, and a speed key (pause, 1x, 5x, 20x).
  They induce, maintain and wake a synthetic patient, or pick one of 12 crises, then see a debrief of what they did and
  when, with the teaching points and their sources.
- **How it works:** one synthetic patient whose numbers all come from one model: drugs go in, effect-site levels rise,
  blood pressure, breathing, oxygen and CO2 follow, and the monitor draws what the model says. A crisis changes the
  model (anaphylaxis lowers vascular tone, narrows the airways and leaks fluid), and the trainee's drugs act on the same
  model, so a sensible unscripted response works and a wrong one has consequences.
- **The build:** 7 milestones (M0 skeleton and monitor, M1 drugs, M2 heart, lungs and ventilator, M3 a whole elective
  GA, M4 the crisis engine and 12 scenarios, M5 debrief, M6 sound and polish) as about 30 small PRs, each tested and
  merged before the next. The first thing a resident can use is the end of M3; the first crisis is the first scenario
  PR of M4.
- **Changes from the brief:** the Marsh example test is corrected (it mixed two versions of the model); waveforms are
  drawn at real pace even at 20x so they stay readable (the numbers still run 20x); a link can open a scenario at a set
  moment (`?case=anaphylaxis&at=300` opens it 300 s, 5 min, in) so previews and PR screenshots show mid-crisis screens;
  the drug-effect and breathing parts of M1 that need a circulation and lungs move to M2.
- **Sources moved on since the brief was written:** DAS published its 2025 guideline for unanticipated difficult
  intubation (in BJA, 2026; the full paper was not readable here, so its details come from DAS's own summaries and
  simulation scenarios); the Association of Anaesthetists' 2024 blood components guideline replaced the 2016 one.
  Checked for the plan: Singapore's SRFAC 2021 adult ACLS gives atropine 0.6 mg up to 2.4 mg and adrenaline 1 mg every
  3–5 min "early", not tied to a shock number; ERC 2025 made no major change to adult ALS (AHA 2025 likewise, from
  secondary sources) but RCUK/ERC 2025 add theatre advice (compressions when SBP stays under 50 mmHg, smaller adrenaline
  doses with an arterial line), which the scenarios use. Metaraminol and dantrolene are not on Singapore's register of
  approved medicines (HSA, checked 14 Oct 2026), so metaraminol is off by default and the dantrolene product is a
  question for you.

## Architecture

### Files

```
ot/
  index.html              shell, styles, screen containers (no inline clinical text beyond the intro)
  js/main.js              boot: reads the URL, builds the sim and the UI, runs the frame loop
  js/model/               pure simulation: no DOM, no Date, no Math.random; importable by Node tests
    rng.js                seeded sfc32 generator with named sub-streams
    fmath.js              exp, log, pow, sin, cos from + - * / (fdlibm algorithms): bit-identical on every engine
    sim.js                Sim: state, fixed-step loop, action queue, event log, snapshot and restore
    patient.js            profile -> covariates (LBM, BSA, IBW, FRC, blood volume ...) and between-patient variation
    presets.js            start states for scenarios, built by replaying reference actions from "awake"
    drugs.js              drug catalogue: presentation, doses, PK model, effects, sources (data, no logic)
    pk.js                 compartment models, effect sites, boluses, infusions, sugammadex binding, pump and TCI
    pd.js                 effect models: hypnosis, stimulus response, block, drug drives to circulation and breathing
    volatile.js           vaporiser, circuit (fresh gas, rebreathing), agent blood and tissue groups, effect sites
    rhythm.js             atrial clock, AV node, ventricular clock: emits timed beat events
    cardio.js             lumped circulation: compartments, venous return, stroke volume, baroreflex, fluids, bleeding
    resp.js               mechanics, ventilator modes, spontaneous breathing and its CO2 drive; emits breath events
    gas.js                the lung store (every gas species) and blood O2/CO2, shunt, dead space, acid-base
    airway.js             airway state machine: patency, mask, SAD, ETT (and misplacement), laryngoscopy
    temp.js               core and peripheral temperature, heat balance, warming
    conditions.js         disease processes a crisis switches on (mediator level, hypermetabolism, pleural air ...)
    resus.js              CPR quality, defibrillation, pacing capture, return of circulation
    events.js             scenario runner: triggers, timed changes, expected-action matching
    monitor.js            what the monitor reports: averaging, sensor delays, NIBP cycle, alarms
  js/ui/
    loop.js               rAF loop, speed, accumulator, pause on hidden tab
    lanes.js              sweeping canvas lanes (ECG, pleth, ABP, CO2, Paw), with a history buffer for redraws
    synth.js              waveform samples from beat and breath events (1x) or a UI-side generator (5x, 20x)
    numerics.js           numeric boxes (DOM text, at most twice a second of wall time)
    alarms.js             alarm bar, silence, aria-live text
    controls/*.js         drugs, airway, breathing, circulation, help, examine, log
    screens/*.js          library, pre-op, theatre, debrief
    sound.js              (M6) SpO2 tone and alarm tones, off by default
  js/scenarios/*.js       one module per scenario (data with source comments)
  fonts/                  copied from bis/fonts/ with its README.md (licences)
  test/*.test.mjs         model tests in Node (fast; run by CI on every PR)
  test/model.check.mjs    calibration table: every tuning target in MODEL.md with its value and pass/fail
  test/soak.mjs           hours of simulated time, a long local run (not *.test.mjs, so CI does not run it)
  test/e2e.mjs            browser test, phone and desktop, axe
```

Scenario and drug files are JavaScript modules, not JSON, so each number can carry its source as a comment. No build
step and no dependencies (`NOTES.md`). Each module stays under about 400 lines so a PR touching it reads on a phone.

### The model loop

- **State.** `Sim` owns one plain-data `state` (numbers, arrays, strings; no functions, Maps or class instances) and a
  fixed `dt` of 0.1 s. Everything that evolves lives in it: the step counter, the action queue, RNG positions, the pump's
  own predicted model, the scenario runner's fired triggers and timers, baroreflex delay rings, monitor averaging
  windows, NIBP and alarm timers, the event ring for the UI. A snapshot is `structuredClone(state)`; restoring it into a
  fresh `Sim` and running on gives the same numbers as never stopping (tested from M0.1 and in every model PR).
- **Step order and what each subsystem sees.** Each step: actions due this step -> pump and TCI -> PK -> volatile -> PD
  -> conditions and scenario events -> airway -> rhythm -> breathing mechanics -> gas exchange -> circulation ->
  temperature -> resus -> monitor -> log. Every subsystem reads **the previous step's** values of the others from a
  frozen copy taken at the start of the step and writes only its own slice (a Jacobi step: the order changes nothing,
  so no hidden lag depends on where a subsystem sits). The few loops that must close within a step are solved inside
  one subsystem (the atrial pressures inside `cardio.js`; the sugammadex binding inside `pk.js`). Exception for events:
  `rhythm.js` and `resp.js` know their next event times ahead, so they publish the events falling in the *coming* step,
  and `cardio.js` and `gas.js` read them for the step they integrate (splitting it at beat times).
- **Stability.** The fastest stepped time constants are about 1.1–1.5 s (the pulmonary compartment, the arterial
  compartment and the vagal limb of the baroreflex), so dt/τ is at most about 0.09; everything else is slower (effect sites are minutes). Explicit
  Euler is accurate there: the prototypes matched 0.01 s steps to 0.0002 (volatile uptake), 2–3 decimals (all drugs)
  and 0.64 mmHg (circulation during bleeding with positive-pressure ventilation). Within-breath mechanics (pressure and
  flow during one breath) use the closed-form ventilator formulas, not steps; beats and breaths are events with exact
  times (below). Very tight equilibria (sugammadex with rocuronium, KD 56 nM) are solved as equilibrium each step: an
  explicit binding reaction blew up in the prototype.
- **Determinism.** No `Math.random`, `Date` or frame timing in `js/model/`. Randomness comes from `rng.js`: sfc32 seeded
  per named sub-stream from a 32-bit FNV-1a hash of `seed:name` (12 draws discarded), so adding a consumer in a later
  PR does not shift the others' numbers and old tests stay valid. Actions carry the step index they apply at. Speed
  changes only how many steps run per frame. Tests: the same seed and actions give a deep-equal state run as 1-step or
  200-step chunks; a replay from `{seed, actions}` reproduces the run; snapshot and restore as above.
- **Cross-browser.** ECMA-262 leaves `Math.exp`, `log`, `pow`, `sin`, `cos` and the other transcendental functions, and
  the `**` operator, "implementation-approximated", so engines may differ in the last bit. `+ - * /` and `Math.sqrt`
  (ECMA-262 21.3.2.33) are correctly rounded, and integer and bit operations are exact. `fmath.js` builds exp, log, pow
  (x ≥ 0), sin and cos from those using the fdlibm 5.3 algorithms (cite and check the constants against the fdlibm
  source). The prototype measured exp and log within 1.2 ulp, pow within about 1e-14 relative, and results
  bit-identical between V8 (Chrome, Node) and JavaScriptCore (Safari) over 140,000 inputs and 200 two-hour
  trajectories, while plain `Math` differed between those engines in 3–10% of calls. Cost: 30–90 ns a call, about 2% of
  a core at 20x. sin and cos are valid for |x| below about 8e5: keep oscillator phases in cycles wrapped to [0, 1).
  A check (model test from M0.1) fails on `**`, `Math.pow`, `exp`, `log`, `log2`, `log10`, `log1p`, `expm1`, `sin`,
  `cos`, `tan`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `cbrt`, `hypot` or `Math.random` anywhere in `js/model/`;
  squares and cubes are written `x*x`, `x*x*x`. Edge cases are defined: pow(0, y > 0) = 0; log(x ≤ 0) throws in tests;
  sigmoids written as 1/(1 + U^−γ) with U ≤ 0 giving 0. A WebKit replay check (a long local run or a real-device
  check) runs before release; CI optionally runs the model tests under Bun (JavaScriptCore) too.
- **Cost.** About 3–4 µs a step in the prototypes (the circulation with ventilator, its two bisections, the drug
  models); 20x is 200 steps a second, under 1 ms a second of CPU. A 30-minute fast-forward (18,000 steps) takes about
  0.1 s on a desktop and under a second on a slow phone.
- **Memory.** `sim.log` keeps events (actions, alarms, condition changes, beats are not logged) and trends downsampled to
  one point every 5 s of simulated time, so an 8-hour soak stays bounded.

### Beats, breaths and the waveforms

- `rhythm.js` keeps the next atrial and ventricular event times as exact numbers, not rounded to steps, and emits every
  event that falls inside the step (time, kind, conducted or not, stroke volume once `cardio.js` has set it); `resp.js`
  does the same for breaths (start, inspiratory time, tidal volume, pressures). Events go into a bounded ring in state
  that the UI drains, so a frame that runs several steps loses none.
- **At 1x** the monitor draws the model's own events, about 0.2 s behind model time so an event is known before the
  sweep reaches it: an ectopic, a dropped beat, a pulse deficit or PEA (an ECG with no pulse) appears exactly when the
  model has it.
- **At 5x and 20x** waveforms are drawn at real pace: a heart rate of 70 at 20x would be 23 beats a second across the
  screen, a blur that teaches nothing. `rhythm.js` exports its event generator as a pure function (state in, events
  out); `synth.js` runs its own copy at wall-clock pace with a UI-only seeded RNG, restarted from the model's current
  rhythm state at each speed change, so AF, blocks and ectopics look right without a second implementation. Arterial and
  pleth lanes follow the model's current stroke volume and perfusion (none in VF or PEA). The lane label shows "20x".
  The model never reads the synthesiser.
- On load, resize, a speed change, pause and after a `?at=` fast-forward the lanes are refilled with one full sweep from
  a history buffer of recent events kept in state (or the current values), so a paused screen is never blank. The first
  frame after a deep link is deterministic (the PR screenshot comparison is exact).
- The tab pauses itself when hidden (`visibilitychange`); a frame catches up at most 50 steps (5 s simulated) so a
  stalled phone does not lurch.

### Actions (the one shape everything uses)

The UI reads `sim.state` (read-only by convention) and `sim.log`, and writes only through `sim.act(action)`. One action
shape drives the UI, the scenario triggers and expected actions, the tests and replays:

```js
{ type: 'bolus', drug: 'propofol', dose: 140, unit: 'mg', route: 'iv' }   // sim.act stamps step: n
{ type: 'infusion', drug: 'remifentanil', rate: 0.15, unit: 'mcg/kg/min' }
{ type: 'tci', drug: 'propofol', model: 'schnider', mode: 'effect', target: 4 }
{ type: 'vaporiser', agent: 'sevoflurane', dial: 2 }      { type: 'fgf', o2: 1, air: 1, n2o: 0 }
{ type: 'vent', mode: 'VC', vt: 450, rr: 12, peep: 5, ie: 0.5, fio2: 0.5 }
{ type: 'airway', do: 'insertETT', size: 7.5, depth: 21 }  { type: 'fluid', product: 'crystalloid', ml: 250 }
{ type: 'help', do: 'callHelp' }                           { type: 'examine', what: 'chest' }
{ type: 'cpr', on: true, quality: 'good' }                 { type: 'shock', joules: 150 }
```

Scenario matchers are patterns over these keys, with a range allowed in place of a number
(`{ type: 'bolus', drug: 'adrenaline', route: 'iv', unit: 'mcg', dose: [10, 200] }`). Doses are stored in the unit
given and converted by `drugs.js`; matchers compare after converting to the pattern's unit.

### Start presets

A scenario starts from a named preset with parameters, built at load by replaying a fixed reference action list from
"awake" after the warm start (so presets stay deterministic and need no stored snapshots): `awake`, `preoxygenated`,
`sedation` (target, with or without a block in progress), `induced` (device: mask, SAD or ETT; just after
intubation, light), `maintenance` (agent or TIVA, minutes in, surgery type: open, laparoscopic), `emergence` (device,
relaxant given at a set time). `presets.js` lands in M3.2 (the elective GA needs the same building blocks); building a
preset counts towards the fast-forward budget above.

### URL and deep links

- `#library`, `#preop`, `#theatre`, `#debrief` select the screen (the page editor and PR screenshots can reach each).
- `?seed=<n>` fixes the patient; `?case=<scenario id>` opens that scenario; `?at=<seconds>` fast-forwards with the
  scenario's reference actions (the correct-treatment course its test uses) to that time and pauses. PR bodies use
  `Screens: /ot/?case=anaphylaxis&at=300#theatre` (the screenshot tool waits 1.5 s after load).
- `?test` (tests only) exposes `step(n)`, `pause()` and `state` on `window` so the e2e test advances the model directly
  instead of waiting in real time.
- `?demo` is not needed (no data, no sign-in). Share links (M5.2) are relative (`?case=…&run=…`), never absolute.
- Moved to `anantf.com/ot/` from an earlier address on 16 Oct 2026 (owner); the old addresses forward here.

### Per-device settings

`localStorage` keys start with `otsim.` (the origin is shared with `/bis/`, which uses `bisdsa.`), each read and written
in try/catch: `otsim.sound` (off), `otsim.speed` (1x), `otsim.behind` (the "Behind the monitor" panel closed),
`otsim.layout` (phone or desktop override, auto). Runs are not stored; a run can be shared as a link (M5.2).

## Screens

Phone first (390 px portrait), then desktop (1280 px), tablet landscape works. Always dark (monitor convention, as
`bis`). Top band: the four NUHS quarters (`AGENTS.md`). `noindex, nofollow`; never linked from the homepage;
relative paths only; no network requests (fonts bundled from `bis/fonts/`, with its licence README).

1. **Library** (`#library`): "Free run" (a healthy adult, you do everything), "Elective GA" (guided case, M3), then the
   scenario cards (title, one line, level, about how long). The teaching-only line is on this screen and in the footer.
2. **Pre-op** (`#preop`): the synthetic patient (age, sex, weight, height, ASA, airway assessment, history, drugs,
   allergies, fasting, plan), and the theatre checklist (sign-in items paraphrased, ticked by the trainee; nothing is
   enforced, but the debrief notes what was skipped).
3. **Theatre** (`#theatre`):
   - Phone: a top bar (simulated clock, speed keys, alarm silence, menu) above the monitor (about 55% of the screen):
     ECG II, pleth, capnogram, and ABP or Paw when present, each lane with its numeric at the right; a numeric row
     under the lanes (NIBP with its age, temperature, FiO2/EtO2, agent Fi/Et/MAC, Paw/PEEP/Vt, TOF, and a BIS-like
     index if the scenario has processed EEG). Alarm bar across the top of the monitor. Under it, a tab bar: **Drugs**,
     **Airway**, **Breathing** (O2, ventilator, vaporiser), **Circulation** (fluids, blood, NIBP cycle, lines, CPR and
     defibrillator when needed), **Help** (call for help, tell the surgeon, get the trolley or kit, activate the major
     haemorrhage protocol), **Examine** (chest, skin, pupils, movement, breath sounds as text), **Log**. Buttons at
     least 44 px.
   - Desktop: monitor on the left two thirds, controls on the right, log under the controls.
   - Drugs: one row per drug with the usual doses for this patient's weight already worked out (labelled with the
     ISO 26825 syringe-label colours by class, as on real syringes), a custom dose, infusions (mg/kg/h or mcg/kg/min),
     and TCI (target, model) for propofol and remifentanil. The dose box says "for this synthetic patient".
   - "Behind the monitor" (a panel in the menu, closed by default): the pump's predicted levels beside the patient's
     true ones, MAC, cardiac output, SVR, stroke volume, PaO2, shunt, the response-surface probabilities. This is where
     mechanism is taught; the monitor itself shows only what a real one would.
4. **Debrief** (`#debrief`, M5): timeline, expected actions met or missed with their times, teaching points with
   sources, "rewind to here".

Accessibility: numerics are DOM text, canvases are `aria-hidden` with a text summary; the alarm bar is an `aria-live`
region updated only when the message changes (assertive for high priority, polite otherwise); colour is never the only
signal (priority words and shapes); `prefers-reduced-motion` stops flashing (solid colour instead) and keeps the sweeps
(a monitor without moving traces would mislead) at a lower frame rate. Numerics update at most twice a second of wall
time whatever the speed, so 20x does not mean 20 DOM writes a second.

## Monitor and alarms (summary; numbers in MODEL.md)

- `monitor.js` (from M0.2) turns model values into what a monitor shows, in simulated time so alarm timing is the same
  at every speed: averaging (SpO2 over 8–10 s, HR over a few beats, EtCO2 per breath), sensor delays (SpO2 finger 20–30
  s, longer with low output or cold), NIBP.
- NIBP: off, manual, or cycles of 1, 2, 2.5, 3, 5 min, plus STAT; a measurement takes about 30 s and shows its age; it
  fails ("NIBP --") in severe hypotension or arrhythmia, as real ones do.
- Alarms (M3.3): limits per parameter with defaults, three priorities with the IEC 60601-1-8 conventions (colour and
  flash), 2-minute silence, technical alarms (probe off, disconnection, no CO2 detected), and a text message for each.

## Testing

- **Model tests** (`test/*.test.mjs`, Node, in CI's unit job, whose 10-minute limit is shared with every other app: keep
  ours under 60 s in total): determinism, snapshot and restore, the `fmath` ban check; each drug model against its
  published numbers; physiology calibration (apnoea times, haemorrhage, ventilator pressures); dt 0.1 s against
  0.01 s within a stated tolerance per subsystem; mass and volume balance (volume drift under 1e-6 mL an hour; gas
  species balance over a 30-minute apnoea); each scenario's three courses (untreated, correct, wrong). Seeds fixed.
- **Golden runs** are compared exactly only within one PR (determinism and replay). Across PRs that change the model,
  calibration targets with tolerances are the contract, not frozen numbers.
- **Calibration table** (`test/model.check.mjs`, like `bis/test/engine.check.mjs`): prints every tuning target from
  `MODEL.md` with the value reached and pass/fail; a `*.test.mjs` wrapper asserts the table passes.
- **Browser test** (`test/e2e.mjs`, grows each PR; under 60 s in CI, whose browser job is 15 minutes shared): loads at
  390 and 1280 px (3x density on the phone, the `bis` canvas lesson) with `?test`, advances the model with
  `step(n)`, pauses before each axe run; axe on every screen and every control tab; no horizontal scroll; no console
  errors; no network requests outside the folder; speed keys; an induction by clicks with the numbers moving the right
  way; a deep link showing non-blank lanes within 1.5 s; the alarm bar's text; at 20x, VF and PEA draw no pleth pulse.
- **Soak** (`test/soak.mjs`, a long local run): 8 simulated hours of maintenance at 20x per scenario seed,
  checking no NaN, no negative volumes, values inside physiological bounds, memory flat.
- `tools/test-ot.sh` already runs the model tests and the browser test; PRs that
  add screens or source links also run `node tools/proofread.mjs`.

## PR order

Each PR: branch from latest `main`; title "OT sim: ..."; `tools/test-ot.sh` green (and `node tools/proofread.mjs`
when it adds screens or links); phone and desktop screenshots with `Screens:` lines for deep links; a "Needs clinical
read-through" list for new numbers; `NOTES.md` and `STATUS.md` updated with `/save-state` (own `status/<session>.md`
for "Now"; the first build session deletes `status/plan.md`); merged by the session (`PLAN.md`). A PR adds the UI for
what it models, so every model PR is usable and testable in the browser.

| # | PR | What it adds | Tests |
|---|---|---|---|
| M0.1 | Model loop | `rng.js`, `fmath.js`, `sim.js` (state rules, Jacobi step, action queue, event ring, log, snapshot and restore), `patient.js` (covariates, default patient), a placeholder patient with steady vitals and small seeded noise | Determinism (1x vs 200-step chunks, replay), snapshot and restore, `fmath` accuracy and golden bits, the ban check, covariates against worked examples (MODEL.md section 1) |
| M0.2 | First monitor | Theatre shell, hash routing, `?seed`, `?test`, `loop.js`, `lanes.js` with history refill, `synth.js` (sinus ECG, pleth, capnogram), `monitor.js` (averaging, display), `numerics.js`, speed keys, fonts, the old-address forward | e2e: lanes draw and refill after pause, numerics present, speed keys, axe, 3x density, forward script inert on the subdomain |
| M1.1 | IV PK | `pk.js` (compartments, effect sites, bolus, infusion), `drugs.js`: propofol (Schnider, covariates capped at the James LBM peak above BMI 35 women / 42 men), remifentanil (Minto), fentanyl, alfentanil, midazolam, ketamine, between-patient PK variation | MODEL.md section 2 PK targets |
| M1.2 | Pump and TCI | Syringe pump with its own predicted model (Marsh 1.2 and 0.26, Schnider, Minto), plasma and effect-site TCI, maximum rate, step-down by stopping; Drugs tab (boluses, infusions, TCI) and "Behind the monitor" | Effect-site target 4 mcg/mL reached about 1.3 min, plasma overshoot reported; 10 s and 1 s updates agree; e2e: give propofol, Ce rises |
| M1.3 | Neuromuscular block | Rocuronium (directional effect site), suxamethonium (retuned), sugammadex (equilibrium binding), neostigmine with glycopyrrolate; thumb, diaphragm, upper-airway and laryngeal sites; TOF count, TOFR, PTC; TOF on the monitor | Label onset and duration; sugammadex reversal times; suxamethonium 7.1 / 10.9 min; dt invariance of the binding |
| M1.4 | Hypnosis and stimulus | `pd.js`: one hypnosis rule (asleep or not, age-scaled), BIS-like index, the stimulus surface (age-scaled, volatile term tied to MAC), movement, autonomic drive `pd.auto` (0–1), one per-patient sensitivity quantile | Schnider LOC C50 by age; P_TOL 0.9 isobole; BIS-like table; sevoflurane 1 MAC gives no movement at incision in half (once M2.5 lands) |
| M2.1 | Circulation | `cardio.js` (compartments, venous return, atrial solve, stroke volume, critical closing pressure, baroreflex with age-solved gains, empty-ventricle decompensation), `rhythm.js` sinus only, propofol and remifentanil drives, `pd.auto` into sympathetic drive, NIBP cycle | Steady state; volume drift; dt check; baroreflex slope; propofol induction SBP; laryngoscopy response at P_TOL 0.9 |
| M2.2 | Fluids and bleeding | Crystalloid and colloid kinetics as flows, blood products, Hb and red-cell mass, haemorrhage; Circulation tab (fluids, blood) | Haemorrhage tables awake and under GA; 1 L crystalloid Hb target |
| M2.3 | Vasoactive drugs | Receptor-effect model: phenylephrine, ephedrine, noradrenaline, adrenaline, vasopressin, atropine, glycopyrrolate, esmolol, labetalol, GTN; metaraminol (off by default) | Bolus effect size and duration per drug (MODEL.md section 5) |
| M2.4 | Gas exchange and breathing | `gas.js` (lung store for every species with bulk inflow, blood O2 and CO2, shunt, dead space, acid-base) and `resp.js` (mechanics, VC, PC, PS, CPAP, manual bag, the CO2 drive and its depression, breath events); Breathing tab (O2, ventilator); SpO2 delay in `monitor.js`; PPV now that pleural pressure exists | Apnoea times (healthy, air, obese, pregnant), CO2 rise, pre-oxygenation half-time (perfect mask until M3.1), induction apnoea, ventilator pressures, PPV table |
| M2.5 | Volatile agents | `volatile.js`: vaporiser, circuit, FGF, blood and tissue groups, agent effect sites, age-adjusted MAC; vaporiser and FGF controls; agent numerics | FA/FI and washout targets, low-flow targets, MAC by age |
| M2.6 | Temperature | `temp.js`: redistribution, heat balance, cold fluids, warming | Core temperature curve over 3 h, with and without warming |
| M2.7 | Rhythms | The rest of `rhythm.js` (AV blocks, AF, flutter, SVT, VT, torsades, VF, asystole, PEA, ectopics, pacing, hyperkalaemia stages) and ECG templates; the circulation's response to each | e2e: each rhythm draws; model: VF gives no output and the Schipke pressure curve |
| M2.8 | Resuscitation | `resus.js`: CPR quality to cardiac output, pauses, defibrillation success with time in VF, pacing capture, return of circulation; CPR and defibrillator controls | EtCO2 and DBP by compression quality; shock success curve; capture threshold |
| M3.1 | Airway | `airway.js`: obstruction under sedation, adjuncts, mask seal, SAD, laryngoscopy (Cormack-Lehane from the assessment and a seeded draw), bougie, videolaryngoscope, ETT (oesophageal, endobronchial), cuff, front-of-neck access; Airway tab | Seeded grade distribution; oesophageal ETT shows no CO2 after the first breaths; pre-oxygenation with a real mask seal |
| M3.2 | Case flow | Library, pre-op, checklist, `presets.js`, the elective GA from pre-oxygenation to extubation, surgical stimulus timeline, Examine and Help tabs, "skip to next event" | Whole case run by a scripted trainee in a test; e2e flow |
| M3.3 | Alarms | `monitor.js` limits, priorities, silence, technical alarms, alarm entries in the log; Log tab | Alarm onset times identical at 1x and 20x |
| M4.0 | Scenario drugs | The drugs and products the crises need (MODEL.md section 12): glucagon, salbutamol, magnesium, amiodarone, calcium, insulin with glucose, bicarbonate, tranexamic acid, FFP, platelets, cryoprecipitate, dantrolene, lipid emulsion, cefazolin and other triggers, steroid and antihistamine (as "wrong first" choices) | Each drug's effect on its target and its timing |
| M4.1 | Crisis engine + scenario 1 | `conditions.js`, `events.js`, scenario format, expected-action matching, `?case` and `?at`; hypotension after induction | Three courses for scenario 1; deep link screenshot |
| M4.2-M4.7 | Scenarios 2-12 | Two per PR (the last PR has one), in the `PLAN.md` order unless the owner reorders; each adds its condition from MODEL.md section 11; the LAST PR starts with the local anaesthetic PK research step (MODEL.md section 2 gap) | Three courses each |
| M5.1 | Debrief | Timeline, actions vs expected, time to treatment, teaching points with sources | e2e: debrief after scenario 1 |
| M5.2 | Hints, rewind, share | Hint ladder (off by default), rewind to a snapshot, share a run as a relative link | Replay equality from a link |
| M6.1 | Sound | SpO2 tone, alarm tones (off by default) | e2e: no audio until turned on |
| M6.2 | Performance and access | Frame budget on a mid-range phone at 20x, reduced motion, full axe pass, keyboard use | e2e timing budget |
| M6.3 | Finish | Library cards polished, page editor compatibility (`edit/NOTES.md`), offline copy only if the owner asks | Proof-read, editor test |

Order inside a milestone can change if a PR needs an earlier hook. A PR may land a small, named stub of a later
subsystem (M1.4 runs before the circulation exists, so `pd.auto` is tested on its surface alone; M2.1 runs before
`gas.js`, so it uses fixed oxygenation), as long as the stub is listed in `NOTES.md` and replaced by its PR.

## Risks and how the plan handles them

- **Clinical accuracy.** Every number has a source and a status in `MODEL.md`; each PR lists new numbers for the owner;
  the page says teaching only and never "reviewed" until the owner has read it.
- **Scope.** A full physiology engine can grow without end. The model is lumped (one heart, one lung store, a few
  tissue groups) and each subsystem has calibration targets: when they pass, stop. Targets the planned structure cannot
  reach are marked as known misses (desflurane washout, N2O at 30 min) instead of tuned with unphysiological numbers.
- **Coupling.** Subsystems talk only through the named state fields in `MODEL.md` section 0, with one owner per field,
  so each PR can be tested alone.
- **Phone performance.** Incremental canvas drawing with a history refill, DPR capped at 2, numerics at most twice a
  second, no layout work per frame.
- **Cross-browser replay.** `fmath.js`, tested bit-identical on V8 and JavaScriptCore; SpiderMonkey and iOS Safari are
  checked before release (a long local run or a real-device check).
- **Two sessions at once.** One session per milestone; others plan only (`AGENTS.md`).

## Questions for the owner (with the default used until answered)

1. **Monitor look.** Which monitor is in NUH theatres (Philips IntelliVue, GE Carescape, Mindray, Dräger)? Default: a
   generic layout in the common conventions (Philips-like colours on black), no brand. A photo would let it match, as
   the BIS page did.
2. **Propofol model for TCI.** Which do NUH pumps run? Singapore studies have used Schnider (and Minto for
   remifentanil) on Alaris pumps; Fresenius Agilia offers Eleveld and modified Marsh; Alaris derives Schnider's ke0 from
   a 1.6 min time to peak while others fix it at 0.456/min. Default: the patient runs Schnider with between-patient
   variation; the pump defaults to Schnider effect-site, with Marsh options; "Behind the monitor" shows the pump's
   prediction beside the patient's true level.
3. **Airway algorithm.** DAS 2025, the Vortex, ANZCA PG61, or a local NUH one? Default: DAS 2025, with the Vortex and
   ANZCA as other cognitive aids.
4. **Resuscitation.** SRFAC 2021 (atropine 0.6 mg to 2.4 mg; adrenaline 1 mg every 3–5 min, early, not tied to a shock
   number; amiodarone 300 mg then 150 mg for VF after 3 shocks), with the RCUK/ERC 2025 theatre advice and NAP7?
   Default: yes.
5. **Crisis guideline defaults.** Anaphylaxis ANZAAG–ANZCA 2022 (graded adrenaline); bleeding Association of
   Anaesthetists 2024 (non-trauma targets for surgical bleeding); MH dantrolene 2.5 mg/kg then 1 mg/kg every 5 min;
   LAST QRH 3-10 2023 (lipid per kg); needle decompression 4th/5th space just anterior to the mid-axillary line (ATLS
   10). Keep, or use NUH protocols?
6. **Drugs at NUH.** Strengths and syringes (phenylephrine, ephedrine, noradrenaline, adrenaline); is metaraminol used
   (not on the HSA register; default off); which dantrolene product (none is on the HSA register, so it comes through
   special access: Dantrium 20 mg, Ryanodex 250 mg or Agilus 120 mg change the vial count and mixing time; default
   Dantrium); the major haemorrhage pack contents; red cell product (HSA; default "red cells in additive solution,
   about 280 mL, haematocrit about 0.6"). Default: common dilutions, labelled as such.
7. **Sevoflurane MAC at age 40.** 1.80% (Mapleson's pooled value; Japanese adults 1.68–1.71%, the closest data to a
   mostly Chinese population; no Singapore study found) or 2.05% (US label)? Default 1.80%, changed from the first draft.
8. **Fentanyl effect-site speed.** ke0 0.147/min (time to peak 3.2 min) or 0.117 (time to peak 3.6 min, as published)?
   Default 0.147, flagged.
9. **Scenario order.** Default: the `PLAN.md` order.
10. **Scores.** None by default (teach, don't test): the debrief shows what was done and when, not a mark. Keep?
11. **Processed EEG.** Show a BIS-like number on the monitor in TIVA scenarios (from the hypnotic model, not the
    `bis` EEG engine)? Default: yes, as an optional module the scenario turns on.
