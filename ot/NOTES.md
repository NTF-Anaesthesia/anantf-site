# OT simulator notes

Lasting decisions for `ot/`. Status and next steps: `STATUS.md`. The build brief for autonomous sessions: `PLAN.md`.

## Purpose and audience

- A teaching simulator of an anaesthetic in the operating theatre: induce, maintain and wake a synthetic patient with a
  general anaesthetic, watch a vitals monitor respond to what you do, and manage crisis scenarios.
- For anaesthesia residents and new MOs. It teaches recognition and first response; it is not a clinical tool and never
  gives advice for a real patient. Say so on the page.
- One static site: no data, no sign-in, no storage beyond per-device settings. All patients are synthetic.
  Public repo: no real patient, case or hospital data, and no names.
- Lives at `anantf.com/ot/` (this repo's folder `ot/`, GitHub Pages; moved from an earlier address on 16 Oct 2026). Unlisted: `noindex`, never
  linked from the homepage. Relative paths only.
- Related: `bis/` (processed EEG; reuse its engine ideas, fonts and monitor look rather than redoing them).

## Principles

- **Physiology first, scenes second.** One patient model (pharmacokinetics and pharmacodynamics, haemodynamics,
  respiration and gas exchange, temperature) drives every number and waveform. A crisis is an event that changes the
  model (anaphylaxis lowers vascular resistance and raises airway pressure), never a canned script of numbers. The same
  model must therefore behave sensibly when the trainee does something unexpected.
- **Deterministic and seedable.** The model takes a seed and a fixed time step (`dt`), so a run replays exactly and
  tests can assert on it. Rendering reads the model; the model never reads the screen.
- **Faster than real time** is a feature (a 4-hour case in minutes) but the speed multiplier must not change the
  outcome, only how often the model steps (fixed `dt`, more steps per frame).
- **Teach, don't test, by default.** A debrief after each scenario: timeline of events and actions, what was missed,
  and the teaching points, with sources. No scores that reward speed over safety.
- **Sources for every clinical number.** Doses, thresholds, drug parameters and crisis management steps cite a
  source in code comments, with the spec and its sources in `MODEL.md` and `SCENARIOS.md` (published PK/PD models; the AAGBI/ANZCA/SAGES/Difficult Airway Society and
  resuscitation guideline pages; Miller; Morgan & Mikhail). Flag anything unsure for the owner's clinical read-through;
  the owner checks all clinical content before it is described as reviewed.
- Singapore practice by default (NUH-style): units mmHg, kPa not used; temperatures °C; drugs by generic name;
  Mallampati, ASA, Cormack-Lehane as taught here. Metric doses (mg, mcg).
- Dark monitor, like the BIS page: near-black screens, standard colour coding (ECG green, SpO2 cyan, NIBP/ABP red/white,
  EtCO2 yellow/white, resp white, temperature). No standard sets monitor colours (APSF): agents follow the ISO 5360
  vaporiser and bottle code (sevoflurane yellow, desflurane blue, isoflurane purple), gases the ISO 32 cylinder colours
  (O2 white, N2O blue, air black/white), and syringe labels ISO 26825. Phone first (390 px) then desktop, tablet
  landscape works.
- Accessibility: axe clean; every alarm has a text message as well as sound/colour; respects `prefers-reduced-motion`;
  sound is off until the user turns it on (browsers block autoplay anyway).

## Layout of the code (intended; the full plan is DESIGN.md, the model MODEL.md, the crises SCENARIOS.md)

- `index.html`: shell and styles; `js/` ES modules, no build step, no dependencies (GitHub Pages / Workers serve files
  as they are; the editor and previews need that).
- `js/model/` (pure simulation, no DOM, importable by Node tests), `js/ui/` and `js/scenarios/` (one data module per
  scenario, format in `SCENARIOS.md`): the file list and responsibilities are in `DESIGN.md` "Files", which supersedes
  the first sketch here (14 Oct 2026).
- `test/*.test.mjs`: model tests in Node (fast, no browser). `test/e2e.mjs`: browser smoke and flows with axe.

## How to test

- `tools/test-ot.sh` runs the model tests and the browser test (starts its own static server).
- `node ot/test/<name>.test.mjs` for one model test. Browser: Playwright is preinstalled in cloud sessions
  (`PLAYWRIGHT_PATH=/opt/node22/lib/node_modules/playwright/index.mjs`, Chromium in `/opt/pw-browsers`; do not run
  `playwright install`).
- Phone screenshots (390 px) of every UI change go in the PR (AGENTS.md "Show it").

## Stubs in place (replaced by their PR, DESIGN.md "PR order")

- `js/model/vitals.js` (M0.1): steady awake SpO2, breathing, EtCO2 and temperature with seeded noise, and breaths.
  Heart rate and blood pressure moved to `rhythm.js` and `cardio.js` (M2.1); the rest moves to `gas.js` and `resp.js`
  (M2.4) and `temp.js` (M2.6). `synth.js` and `monitor.js` read `state.vit` for those until then.
- The Patient tab still holds the rhythm picker and the resuscitation controls (a crisis will set the rhythm itself
  from M4) and "Talk"; Examine and Help are their own tabs (M3.2).
- Help actions are logged only; they gain effects with the scenarios (M4).

## Lessons from the build sessions (14–15 Oct 2026)

Model:
- A new subsystem only ever reduces or modulates what exists, gated so the default state leaves earlier calibration
  identical (airway `toLungs` defaults to 1; gas couplings act only below normal cardiac output; sinus rhythm output 1).
  That is why each milestone could land without retuning the last.
- Jacobi step: everything reads the previous step. A subsystem that returns its old slice unchanged must not carry
  one-step data forward (the M2.7 duplicate-beat bug: `rhythm.step` returned stale `events`).
- Tests drive the real model; never inject a partial slice (`aw`, etc.): the owning subsystem recomputes it next step.
- Actions fail silently on a wrong shape. A bolus is `{type:'bolus', drug, dose, unit, route:'iv'}` (not `mg`), an
  infusion `{drug, rate, unit}`; after acting in a test, assert the state actually changed.
- Anything timed (the operation timeline, alarms) runs on model time and enters the model through `sim.act()` or a
  subsystem's `step`, never on wall time, so it is identical at 1x, 5x and 20x and replays exactly. Per-device settings
  that change model behaviour (future: alarm limits) must also enter as actions.
- `act()` queues for the next step; when paused, step once after acting so the change shows.

UI and browser tests:
- Keep the query and change only the hash when moving between screens (pre-op "Begin"): a query change reloads the
  page and builds a different patient, and drops `?test`.
- A `<details>` `toggle` event fires after the click: wait for its effect (e.g. the localStorage value), don't read it
  at once (flaked on a loaded CI runner).
- Controls on a hidden tab panel can't be clicked: reselect the tab before using them in a test.
- Late in `e2e.mjs` the patient carries every earlier step (intubated, ventilated, infusions): give a test that needs a
  clean patient its own `page.goto(BASE + '?test&seed=1#theatre')`.
- A scrollable list needs `tabindex="0"` and a label for axe (`scrollable-region-focusable`).

CI and process:
- The shared `browser` job runs bis's e2e before ot's. `bis/test/e2e.mjs:46` (median of nine DSA pixels;
  the white SEF line can cross the sample) is intermittently red with a different pixel each run; it is another
  session's test, so don't edit it. Comment once on the PR, then get a fresh run by merging a newer `main` into the
  branch (no empty commits). It blocked #598, #608 and #650.
- After each merge: `git fetch origin main && git reset --hard origin/main` on the session branch, then the next slice.
  Merge on `mergeable_state: clean` after the check suite completes. The GitHub MCP's `list_workflow_runs` ignores
  `branch`/`head_sha` filters; use `pull_request_read` and the job logs (`get_job_logs` with `return_content`).
- Slice big milestones (M3.2 went out in four PRs, M3.3 in three); each PR finished, tested, with a phone screenshot.

## Decisions log

- 15 Oct 2026: **pause new scenarios** (M4) for now; make what exists usable first. The resume queue is in
  `STATUS.md` "Next".
- 15 Oct 2026 (M3.3, #628/#645/#650): alarms live in `monitor.js`, evaluated each step on the freshly computed
  displayed values: per-parameter limits (`ALARM_LIMITS`, defaults ours, tabled in `MODEL.md` §14), IEC 60601-1-8
  priorities, onset debounce 3/5/10 s, 2-minute silence, logged `{kind:'alarm'}`. Technical alarms: "No CO₂" (high;
  ventilating with EtCO₂ ≈ 0) and "SpO₂ no pulse" (medium; non-perfusing rhythm, replaces the numeric SpO₂ alarm). The
  alarm bar sits at the top of the monitor. The Log tab (`ui/log.js`) renders `sim.log` newest first; the debrief will
  use the same record. Trainee-set limits deferred (they must be actions to keep replays exact).
- 15 Oct 2026 (M3.2, #612/#614/#622): the pre-op screen (`ui/preop.js`; demographics from the model patient, a fit ASA
  I narrative so the text matches the model, paraphrased WHO sign-in, not enforced); the operation timeline
  (`ui/timeline.js`, replacing the "Surgery running" toggle; a scripted surgical-stimulus sequence fired through
  `sim.act()`; not the M4 scenario engine); Examine (`ui/examine.js`, a read-only clinical read of the model) and Help
  (`ui/help.js`, four team actions logged as `{type:'help'}`, no physiological effect until M4).
- 15 Oct 2026 (M3.2, slice 1): start presets (`js/model/presets.js`, `test/presets.test.mjs`). `PRESETS` holds a
  reference action list (and a target time) per named state — awake, preoxygenated, sedation, induced, maintenance,
  emergence — parameterised by opts; `applyPreset(sim, name, opts)` replays them on an awake sim and fast-forwards, so
  a start state is built from the same actions a trainee would take (no stored snapshots, deterministic). The M4
  scenarios will start from these. Deep links in `main.js`: `?preset=<name>` or `?case=electiveGA` boot the theatre
  from a preset, `?at=<s>` fast-forwards further; a new "Elective GA" library card uses `?case=electiveGA#theatre`
  (starts just induced and intubated). M3.2 is being delivered in slices to keep each PR finished: slice 1 is presets +
  deep links + the guided start; still to come — the pre-op screen (patient summary + sign-in checklist), the
  surgical-stimulus timeline with "skip to next event", and the Examine and Help tabs.

- 15 Oct 2026 (M3.1): the airway (`airway.js`, a new subsystem after pd, before resp). It owns `aw` and decides
  `aw.toLungs` (fraction of the breath reaching the alveoli), which resp.js multiplies into the alveolar ventilation;
  a patent airway is 1, so resp/gas calibration is untouched (the airway only ever reduces delivery). Per-patient
  difficulty (Cormack-Lehane direct/video, mask grade, pharyngeal collapsibility, FONA) drawn once from a new `airway`
  sub-stream in `airway.init(state, ctx)` — init receives ctx, so the draw is seeded and deterministic. Obstruction
  under sedation/paralysis (from pd.bisLike and pd.nmb.upperAirway), relieved by jaw thrust/OPA/NPA or bypassed by a
  SAD/tube; mask seal sets delivery and pre-oxygenation entrainment; tube placement tracheal/oesophageal/endobronchial
  (oesophageal → no CO2 then desat; endobronchial → one-lung shunt via resp.shuntAdd, read by gas). Controlled
  ventilation on a natural airway counts as secured (backward-compatible with the pre-airway ventilator, so the old
  gas/resp tests hold). Two gas/resp tests that used to inject a bare `aw:{obstruction:1}` now use the real model (a
  paralysed natural airway obstructs; intubating gives apnoeic oxygenation) — airway.step is authoritative over `aw`,
  so injecting a partial slice no longer works. UI: an Airway tab. Known miss: laryngospasm is a crisis condition
  (M4), and a laryngoscopy attempt doesn't yet suspend ventilation for its duration.

- 15 Oct 2026 (M2.8): resuscitation (`resus.js`, a new subsystem between rhythm and cardio). It owns the arrest
  "devices": chest compressions (`cprFrac`, an output fraction by quality with a coronary build-up), the defibrillator
  (shock success by time-in-VF and perfusion, exported as `shockSuccess`), and transcutaneous pacing (capture at the
  patient's drawn `paceThresh`). Cardio reads `resus.cprFrac` as the output of a non-perfusing rhythm; rhythm reads
  `resus.convert` (a successful shock → sinus) and `resus.pace.capturing` (→ paced). Two gas couplings were added,
  both gated below the normal cardiac-output range so every earlier gas/anaesthetised/apnoea calibration is untouched
  (they all run at normal CO): CO2 clearance follows pulmonary blood flow (saturating knee at the resting CO 5.0 —
  steady-state EtCO2 is VCO2/VA and flow-independent, so only arrest/CPR lowers it, giving the clinical EtCO2 feedback),
  and the arterial/venous O2 pools stagnate at very low flow so SpO2 falls in an untreated arrest and recovers with
  compressions — this closes the M2.7 known miss. `patient.paceThresh` is drawn last in makePatient so every
  already-fixed test patient and the earlier draws are unchanged. UI: a Resuscitation block on the Patient tab (CPR +
  quality, defibrillate + joules + amiodarone, pacer + mA) with a live status line; the pacing threshold is hidden so
  the learner discovers it. Amiodarone the drug is M4.0; `{type:'amiodarone'}` sets the shock-success hook for now.

- 15 Oct 2026 (M2.7): rhythms and the ECG. `rhythm.js` grew from sinus-only into an atrial clock, an AV node and a
  ventricular clock with a rhythm catalogue (`CATALOG`): sinus (brady, tachy), junctional, the AV blocks (first-degree,
  Wenckebach, Mobitz II, complete), AF, flutter, SVT, bigeminy, VT, torsades, VF, PEA, asystole, paced and the three
  hyperkalaemia stages. Each rhythm carries `rh.output` (mechanical effectiveness, 0..1) and `rh.perfusing`; cardio
  multiplies cardiac output by `output`, so the fast and poorly-filled rhythms drop the pressure and VF/torsades/
  asystole/PEA make no pulse. Sinus keeps `output: 1`, so the whole M2.1 circulation calibration is untouched (that was
  the key constraint — all earlier tests still pass unchanged). Beats carry a `morph` the ECG renderer (`ui/synth.js`)
  draws (narrow, wide, paced spike, no-P, peaked/broad hyperK T), and the disorganised rhythms add a continuous
  baseline (AF fibrillation, flutter sawtooth, VF chaos coarsening over minutes, torsades twist, asystole flat, hyperK
  sine, and marching P waves for the blocks). The monitor reads no HR for VF/torsades and 0 for asystole. In a
  non-perfusing rhythm cardio keeps arteriolar tone (×6 drainage resistance) so the arterial pressure decays on roughly
  the Schipke curve (~29 mmHg at 13 s vs ~24) instead of collapsing at once. Known misses: the arrest decay is a little
  fast and its plateau a little high vs Schipke; SpO2 does not yet fall during an arrest (output–oxygenation coupling
  comes with resuscitation, M2.8). UI: a rhythm picker and a rhythm label on the ECG, both on the Patient tab (the
  scenarios will drive the same `{ type: 'rhythm', to }` action). A ventricular beat that was not cleared on no-beat
  steps caused duplicate beats in an early draft — the step now returns a fresh slice whenever the previous step had
  events, so `rh.events` is emptied.

- 15 Oct 2026 (M2.6): `temp.js` (two compartments, core and periphery, energy balance in kcal). Anaesthesia opens the
  core-peripheral conductance (K 23 awake, 37 asleep), which redistributes heat and gives the early fall (about -0.8 C
  in hour 1, then slower); heat production falls 30% asleep; the periphery loses to a 21 C theatre; cold fluids cool
  the core (1 L about -0.28 C mean, by specific heat); the forced-air warmer adds 55 W. The system is named `temp`
  because `t` is the reserved clock field; `vitals.js` is gone (temperature was its last job). The monitor temperature
  reads the core through the usual averaging. UI: a forced-air warmer on the Patient tab. No vasoconstriction-threshold
  plateau yet, so a very long unwarmed case keeps drifting down slowly (recorded).

- 15 Oct 2026 (M2.5): `volatile.js` (the circle circuit, three Gas Man tissue groups, agent effect sites, age-adjusted
  MAC, the N2O concentration effect) owns `vol.fi/ce/pv/mac`. `pd.js` now reads the whole volatile MAC fraction as one
  sevoflurane-equivalent, so every agent counts and the sevoflurane-written formulas hold (sevoflurane alone is
  unchanged). The volatile circulation effect was strengthened (1 MAC about -21% MAP, 1.5 MAC about -28%, heart rate
  about unchanged). Wash-in and washout match Yasuda. `patient.macStub` is a test-only hook for a steady volatile depth
  without running the vaporiser to steady state (the fluids and vaso GA tests use it, in place of the old `vol` stub
  that a live volatile system would overwrite). UI: a vaporiser and fresh-gas control on the Breathing tab, agent
  Fi/Et/MAC on the monitor. Known miss, as in the prototype: low-flow Et/dial reads a little low; desflurane washout.

- 15 Oct 2026 (M2.4): `gas.js` (one lung store that collapses when obstructed, two blood O2 pools so SaO2 falls at a
  realistic rate, a CO2 body store) and `resp.js` (Bouillon drive with the slope flattened, the ventilator closed-form,
  pleural pressure to the circulation). Apnoea: healthy preox about 8.6 min, air about 1 min, obese 130 kg about 3.5
  min; CO2 about 3-3.4 mmHg/min. Known misses, recorded in MODEL.md: no first-minute CO2 venous-equilibration jump
  (first minute about 3, not 8-12); open-airway apnoeic oxygenation lasts over 20 min (no CO2 feedback into the
  alveolar gas equation yet). VO2 scales with a metabolic weight (IBW plus 0.3 of the excess). The monitor's SpO2 has
  a probe transport delay (25 s, longer at low output) so the displayed fall lags the arterial one. UI: a Breathing
  tab (O2, ventilator), Paw/PEEP/MV on the monitor. `vitals.js` is now only temperature.

- 15 Oct 2026 (M2.3): `vaso.js` holds receptor activations (Emax/EC50 per drug, combined as independent fractions)
  and their mapping to SVR, venous capacity, heart period and contractility; `cardio.js` applies them through the
  existing reflex. PK in `pk.js` MODELS, short and [D] except the cited clearances and half-lives; phenylephrine keeps
  the prototype's 5 L front end and a 20 s transit delay. Ephedrine releases noradrenaline from a store that runs down
  (tachyphylaxis). Vasopressin is dosed in units (`mU` internally). Metaraminol is in the catalogue but hidden (not on
  the HSA register; owner question). Known gaps: a noradrenaline infusion takes about 5 min, not 1-2, to wear off
  (its level sits near the EC50); esmolol slows a resting heart only about 4/min, because resting HR here is mostly
  vagal (it does blunt a stimulated rise, tested). Vasoactive rows sit on the Circulation tab with ISO 26825 colours
  (vasopressors violet, hypotensive agents violet stripes, anticholinergics green).

- 15 Oct 2026 (M2.2): `fluids.js` is called by `cardio.js` (state `cv.fl`), so volume stays in one slice; everything
  enters or leaves through the veins. Crystalloid excess `cx` leaves to the interstitium and urine at Hahn's
  MAP-dependent rates (k21 taken as 0); colloid leaves with t½ 2.5 h; red cells add 280 mL and 56 g of Hb; bleeding
  removes whole blood (Hb, crystalloid and colloid in proportion). Bags run at 50 mL/min, a red-cell unit over about
  10 min [D]. Haemorrhage reproduces the prototype awake; the GA haemorrhage test sets `vol.mac` 1.6 by hand until
  M2.5 (sevoflurane's own drives get tuned there). Stub until scenarios (M4): surgical bleeding on the Patient tab.

- 15 Oct 2026 (M2.1): `cardio.js` as in MODEL.md section 5 (as-built notes there): the prototype's structure and
  numbers reproduce (steady state exact, propofol 2 mg/kg SBP −17.9 at 2 min, steady Ce 1 −10.5%). `pd.auto` became a
  graded response, because a probability could not give the laryngoscopy rise; brief stimuli now last 60 s. Beat
  events now come from `cardio.js` (with stroke volume and pressures); `rhythm.js` keeps exact beat times with 1.5%
  beat-to-beat variation. `createSim` takes `dt` for tests. Cost about 13 µs a step with two pumps running (2.6 ms of
  CPU a second at 20x).

- 15 Oct 2026 (M1.4): `pd.js` holds hypnosis (asleep when P(no response to voice) > the patient's q), the stimulus
  surface (movement at stimulus onset when P(no response) < q and the thumb twitch is over 10%), the BIS-like index
  (arousal adds up to 8) and `pd.auto` (a second surface at 1.6 x with the opioid C50 0.5 ng/mL, from the MAC-BAR
  ratios; rises with a 20 s and fades with a 90 s time constant; brief stimuli last 30 s, surgery runs until stopped,
  intensity 0.6-1.0, default 0.8). The volatile term reads `vol.ce.sevoflurane` once M2.5 exists (MAC40 1.80%). Stub
  until M3.1/M3.2: the Patient tab (talk, stimuli, events); "Talk" reads the state and logs nothing. Midazolam and
  ketamine have no hypnotic effect yet: MODEL.md section 4 gives no surface for them (a research step before the
  case flow, M3.2).

- 15 Oct 2026 (M1.3): neuromuscular drugs live in `nmb.js` (state `pk.nm`), the readout in `pd.js` (`pd.nmb`), the TOF
  module in `monitor.js` (every 15 s; PTC on request, once per 2 min). The TOF readout is fitted to acceleromyography,
  because every reversal trial used it; that forced a retune: rocuronium ke0 0.2 on / 0.9 off (onset: 80% block at
  0.92 min; sugammadex 2 mg/kg at T2 1.36 min, 4 mg/kg at PTC 1 2.2, 16 mg/kg 1.5), neostigmine max x 2, EC50 20.
  Known misses, recorded in MODEL.md: spontaneous T2 to TOFR 0.9 50 vs 21 min (Sorgenfrei 2006, small placebo arm),
  neostigmine from a deep block 32 vs 50 min (Jones 2008). Suxamethonium: cholinesterase as `patient.che` (profile
  `che`: 0.5 heterozygous, 0.01 homozygous); phase II fades from 3 mg/kg total. Glycopyrrolate and atropine (with
  neostigmine) come with the vasoactive drugs (M2.3); suxamethonium's potassium rise comes with `gas.js` (M2.4).

- 14 Oct 2026 (M1.2): the pump's effect-site TCI runs in two phases. While loading it targets the predicted
  effect-site peak (Shafer & Gregg style); once the prediction reaches the target it holds plasma at the target.
  Peak-targeting alone switched between bursts and zero every 10 s. A running pump keeps its model. Syringes are
  propofol 10 mg/mL and remifentanil 50 mcg/mL, maximum 1200 mL/h (to confirm with NUH pumps). Drug rows carry the
  ISO 26825 class colour as a stripe, with the class written beside the name. The Drugs and Circulation tabs follow
  the ARIA tabs pattern (arrow keys, Home, End). "Behind the monitor" is closed by default and remembered per device
  (`otsim.behind`). The monitor does not respond to drugs until M1.4 and M2.1.

- 14 Oct 2026 (M1.1): `pk.js` steps only drugs that have been given. Amounts are in mg (propofol, ketamine) or mcg
  (opioids, midazolam), so concentrations read in the papers' units. The patient's PK multipliers act on V1 and the
  metabolic clearance only (inter-compartment clearances stay). Context-sensitive half-times are tested as Hughes
  1992 defines them (plasma held constant, then stopped); a constant-rate infusion gives a shorter 8 h value.
  Alfentanil (Maitre PK, ke0 0.77) peaks at about 2.6 min, not Miller's 1.4 (Scott PK): recorded, not tuned, like
  midazolam; on the clinical read-through list.

- 14 Oct 2026 (M0.2): the default seed is 1 when the URL has no `?seed`, so first frames (and PR screenshots) repeat;
  free runs with a new patient each time can come with the library (M3.2). The warm start keeps its last events with
  negative times, so the lanes have a full sweep of history at t = 0. The lanes draw at device-pixel resolution and
  keep the extreme value within each pixel (otherwise R waves vary in height on phones). The ResizeObserver refills a
  lane only when its canvas size changes (numbers changing must not wipe the sweep). Pause is an icon button (the
  phone top bar fits on one line). NIBP: 5-minute cycle by default, a reading takes 30 s, a manual start restarts the
  cycle timer. In browser tests, wipe and count a canvas inside one `page.evaluate`: Chrome can repaint a GPU canvas
  between evaluations.

- 14 Oct 2026 (M0.1): go-ahead given. Blood volume indexing starts above BMI 25 (not 22) so the default patient is
  4.9 L. `vitals.js` is a placeholder (steady values plus noise, beats and breaths) that later PRs replace system by
  system. `tools/test-ot.sh` runs every `test/*.test.mjs`, so new model tests need no wiring.

- 14 Oct 2026: folder `ot/`, address `anantf.com/ot/`, plain ES modules with no build step, model separate
  from UI so Node tests can run it. Environment prepared (routes, labels, checks, test runner, build brief).
- 14 Oct 2026 (plan, owner asked for a plan before any build): technical plan in `DESIGN.md`, model spec in `MODEL.md`,
  crises in `SCENARIOS.md`, sourced research notes in `research/`. Its choices are proposals until the owner says go;
  the open questions and their defaults are at the end of `DESIGN.md`. Main ones: a lumped mean-value circulation with
  per-beat stroke volume (not a pulsatile solver); waveforms drawn from the model's beats at 1x and at real pace from
  the current state at 5x and 20x; `fmath.js` so replays match on every browser; the patient runs Schnider and Minto
  while the TCI pump runs the model the trainee picks; sevoflurane MAC40 2.05%; Singapore defaults SRFAC 2021, DAS 2025,
  ANZAAG 2022, Association of Anaesthetists blood components 2024. The brief's Marsh example was corrected (it mixed
  ke0 0.26 and 1.2).
- 14 Oct 2026 (plan revised after two reviews, prototypes and a source check; `research/prototypes.md`): sevoflurane
  MAC40 default 1.80% (Japanese adults 1.68–1.71% are the closest data to a mostly Chinese population; 2.05% the US
  label); metaraminol off by default and the dantrolene product an owner question (neither is on the HSA register);
  SRFAC 2021 gives adrenaline early, not tied to a shock number; rocuronium needs a directional effect site and
  suxamethonium a faster ke0 than Roy 2002 to meet published times; sugammadex binding solved as equilibrium; one
  hypnosis rule and one sensitivity quantile per patient; gas.js owns the lung store for every species; Jacobi step
  (every subsystem reads the previous step); `fmath.js` measured bit-identical on V8 and JavaScriptCore; the PR order
  now puts gas exchange before volatile agents and adds scenario drugs (M4.0) and resuscitation (M2.8). "What is not
  modelled" and the known misses are kept in `MODEL.md`.
