# OT simulator status

Short and current. Lasting rules go in `NOTES.md`. Update with `/save-state`.

Last updated: 2026-10-17 by Claude Code (build session `status/build.md`: M2.7–M3.3 built; owner paused new scenarios;
usability pass done; nothing in flight).

## Now

Each session keeps its own line in `status/<session>.md`. Read them before starting; edit only yours.

## Waiting on the owner

- Answers to the 11 questions at the end of `DESIGN.md` (monitor brand, TCI model, airway and resuscitation
  algorithms, crisis guideline defaults, NUH drugs and products including dantrolene, sevoflurane MAC, fentanyl ke0,
  scenario order, scores, processed EEG). The build can start on the defaults given there.
- Clinical read-through of drug parameters, thresholds and crisis management steps as each milestone lands
  (`MODEL.md` tags every number: checked, secondary, unverified or our design choice; `SCENARIOS.md` tags the doses
  and windows that are not checked, and `research/crises.md` holds each dose's source).
- Review the alarm default limits and priorities (`MODEL.md` §14, all our design choice) and the Elective GA case text
  (`js/ui/preop.js`: a fit ASA I adult for day-case surgery, written to match what the model simulates).
- Say when to resume scenario work (paused 15 Oct 2026, below).

## Next

**New scenarios are paused (owner, 15 Oct 2026).** Do not start M4 until the owner says so. The usability pass is in
#650; further usability ideas: split the long Patient tab (rhythm/resuscitation), alarm-limit settings. The original plan, in order, for when
building resumes (`DESIGN.md` "PR order" has each row's tests):

1. Finish M3.3 (optional polish): trainee-set alarm limits — limits must live in sim state and change by an action
   (`{type:'alarmLimit', param, lo, hi}`) so replays stay exact, with per-device overrides from localStorage applied as
   actions at boot; and a ventilator-disconnection technical alarm (needs a circuit-disconnect state).
2. M4.0: scenario drugs and products (`MODEL.md` §12: glucagon, salbutamol, magnesium, calcium, insulin/glucose,
   bicarbonate, TXA, blood products, dantrolene, lipid emulsion…).
3. M4.1: the crisis engine — `conditions.js` (what a crisis switches on, `MODEL.md` §11), `events.js` (triggers, timed
   changes, expected-action matching), the scenario format (`SCENARIOS.md`), scenario 1 (hypotension after induction);
   scenarios start from `presets.js` states. Tests: the scenario's three courses (untreated, correct, wrong).
4. M4.2–M4.7: scenarios 2–12, two per PR, in the `PLAN.md` order unless the owner reorders.
5. M5.1: debrief (timeline from `sim.log`/`ui/log.js`, actions vs expected, time to treatment, teaching points).
6. M5.2: hints (off by default), rewind to a snapshot, share a run as a relative link.

## Recently done

- Usability pass (15 Oct 2026, in #650): fixed the empty alarm bar showing with no alarm (CSS beat `hidden`); the
  eight tabs as a 4x2 grid so all are visible on a phone; a "How it works" on the library (Elective GA marked "Start
  here") and a collapsible "How to use · a first anaesthetic" in the theatre (checked on five patients: sevoflurane 2%
  at 1 L/min only reaches MAC 0.3, so the guide uses 4% at 4 L/min to MAC 0.8, then 2%); less-common drugs folded under
  "More drugs"; the Log's TCI lines fixed (effect-site/plasma, stop); stale text removed.
- M3.3 slice 3 (15 Oct 2026, #650, open: CI blocked only by the bis-dsa flake — see NOTES "Lessons"): the Log tab (`ui/log.js`) — a readable, timestamped, newest-first record of
  everything in `sim.log` (drugs, airway/vent, fluids, rhythm/resus, operation, NIBP, alarms, responses); the same
  record the M5 debrief will replay. `test/log.test.mjs` + e2e.
- M3.3 slice 2 (15 Oct 2026, #645): technical alarms (`monitor.js`) — "No CO₂ — check the tube and circuit"
  (high; ventilating but EtCO₂≈0: oesophageal tube/disconnection/arrest) and "SpO₂ — no pulse detected" (medium;
  non-perfusing rhythm, replaces the numeric SpO₂ alarm). Same engine/bar; logged `tech:true`. MODEL.md §14 +
  `test/alarms.test.mjs` + e2e.
- M3.3 slice 1 (15 Oct 2026, #628): the alarm engine (`monitor.js`) — per-parameter limits (defaults in
  MODEL.md §14), three IEC priorities, onset debounce, 2-min silence, logged in simulated time (onset identical at any
  speed); the alarm bar at the top of the monitor (top alarm, colour/flash, aria-live, +N more, Silence). Physiological
  alarms only; technical alarms and trainee-set limits are slice 2. `test/alarms.test.mjs` + e2e.
- M3.2 slice 4 (15 Oct 2026, #622): the Examine and Help tabs (`ui/examine.js`, `ui/help.js`). Examine is a
  read-only clinical read of the model (chest/breath sounds/skin/pupils/movement) that matches the monitor; Help has
  the four team actions as logged events (call for help, tell the surgeon, airway trolley, major haemorrhage). Finishes
  M3.2. `test/examine.test.mjs` + e2e.
- M3.2 slice 3 (15 Oct 2026, #614): the operation timeline (`ui/timeline.js`). The Patient tab's manual "Surgery
  running" toggle is replaced by an Operation block — Start operation, Skip to next step, live now/next readout —
  driving a scripted surgical-stimulus sequence (incision → steady → deep dissection → closing → finished) through
  `sim.act()` (deterministic). Auto-advances while running; Skip fast-forwards. Not the M4 scenario engine.
  `test/timeline.test.mjs` + e2e.
- M3.2 slice 2 (15 Oct 2026, #612): the pre-op screen (`#preop`, `ui/preop.js`). The Elective GA card opens a
  briefing — patient summary (demographics from the model patient), the case narrative (ASA/airway/history/allergies/
  fasting/plan) and a paraphrased WHO sign-in checklist (tickable, not enforced) — then "Begin the anaesthetic" into
  the theatre, keeping the same patient. `test/preop.test.mjs` + e2e flow.
- M3.2 slice 1 (15 Oct 2026, #608): start presets (`presets.js`: awake/preoxygenated/sedation/induced/maintenance/emergence,
  replayed from awake), `?preset=`/`?case=electiveGA`/`?at=` deep links, an Elective GA library card.
- M3.1 (15 Oct 2026, #607): the airway (`airway.js`): per-patient Cormack-Lehane/mask difficulty; obstruction under
  sedation/paralysis relieved by manoeuvres or a device; mask seal and pre-oxygenation entrainment; tube placement
  (tracheal/oesophageal → no CO2/endobronchial one-lung). An Airway tab. resp/gas calibration unchanged (a patent
  airway delivers fully).
- Earlier (14–15 Oct 2026, #570–#604): the plan (`DESIGN.md`, `MODEL.md`, `SCENARIOS.md`, `research/`), the model loop
  and maths (M0), drugs, pumps/TCI, neuromuscular block, hypnosis (M1), circulation, fluids, vasoactives, gas exchange,
  breathing, volatiles, temperature, rhythms/ECG and resuscitation (M2). Details in `git log -- ot-sim` and `NOTES.md`.
