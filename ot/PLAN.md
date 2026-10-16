# OT simulator build brief

For an autonomous session (or several in turn). Read `AGENTS.md`, `ot/NOTES.md` and `ot/STATUS.md` first, and
`bis/NOTES.md` for the monitor look. The technical plan is `DESIGN.md` (architecture, screens, tests, the PR-by-PR
order), `MODEL.md` (every model number with its source and the calibration targets) and `SCENARIOS.md` (the crises);
`research/` holds the sourced notes behind them (14 Oct 2026). Work milestone by milestone, split into the PRs listed in
`DESIGN.md`: tests green, merged by you (per `AGENTS.md`; `ot/` is not a "vital app"), then the next. Update
`STATUS.md` at each merge. Ask the owner only for clinical decisions you cannot resolve from sources; otherwise choose,
record the choice in the decisions log, go on.

## Definition of done for every milestone

1. `tools/test-ot.sh` passes (model tests, browser test with axe).
2. Phone (390 px) and desktop (1280 px) screenshots in the PR; preview link with `Screens:` line if useful.
3. New clinical numbers have a source comment and are listed in a "Needs clinical read-through" section of the PR.
4. No console errors, no network calls other than fonts already used by `bis` (prefer bundled fonts; reuse
   `bis/fonts/`, copying the files since the subdomain serves each folder alone).
5. `NOTES.md` decisions log and `STATUS.md` updated.

## Milestones

**M0 - Skeleton and first monitor.** Fixed-step model loop (`dt` 0.1 s) with seeded RNG; patient object with heart rate,
BP, SpO2, RR, EtCO2, temperature as plain numbers; monitor page with ECG, pleth, capnogram and numerics drawn on canvas;
speed control (1x, 5x, 20x, pause); model test proving same seed gives identical run at 1x and 20x.

**M1 - Pharmacology.** (`DESIGN.md` moves volatile uptake, the haemodynamic effects and breathing to M2, where the
circulation and lungs exist; its PR table rules.) Compartmental PK with effect-site (Ce) for propofol (Marsh and Schnider), remifentanil (Minto),
fentanyl, rocuronium and suxamethonium (simple), plus volatile uptake (sevoflurane, desflurane; FA/FI approach with
age-adjusted MAC). Hill-curve PD for hypnosis (BIS-like index, reuse the idea from `bis/app.js`), analgesia, MAP/HR
effect, respiratory depression, neuromuscular block (TOF count). Controls: boluses, infusions, TCI-style target,
vaporiser dial, fresh gas flow. Tests against published values (for example, Marsh 70 kg propofol
2 mg/kg bolus: Ce peaks at about 3.2 mcg/mL at 3.9 min with the original ke0 0.26/min, or about 5.7 mcg/mL at 1.6 min
with the modified ke0 1.2/min; the targets are in `MODEL.md`; record the numbers you check and their sources).

**M2 - Cardiorespiratory model.** Haemodynamics (preload, contractility, SVR, HR with baroreflex; fluid and blood loss;
vasopressor and inotrope effects: phenylephrine, ephedrine, noradrenaline, adrenaline, atropine, glycopyrrolate).
Respiration (alveolar ventilation, FRC, shunt, FiO2 -> PaO2 -> SpO2 curve, CO2 production -> EtCO2, apnoea desaturation
time that matches published pre-oxygenation figures). Ventilator: modes (manual/bag, VC, PC, spontaneous with PS),
tidal volume, RR, PEEP, I:E, airway pressure and compliance. Temperature (heat loss, warming).

**M3 - The case flow.** Elective GA end to end: pre-op summary (synthetic patient: age, weight, ASA, airway), checklist,
pre-oxygenation, induction, airway (face-mask, LMA, ETT; laryngoscopy view grades), maintenance, stimulus (incision),
emergence, extubation. Monitor alarms with limits, silence, and text messages. Event log feeds the debrief.

**M4 - Crisis engine and first scenarios.** `events.js` injects physiology changes at set times or on triggers; a
scenario file lists steps, the expected actions with time windows, and teaching points. Build in this order (owner can
reorder): (1) hypotension post-induction; (2) laryngospasm; (3) anaphylaxis; (4) can't intubate, can't oxygenate
(Difficult Airway Society / local algorithm); (5) massive haemorrhage; (6) hypoxaemia on one-lung or bronchospasm;
(7) malignant hyperthermia; (8) local anaesthetic systemic toxicity; (9) tension pneumothorax; (10) bradycardia and
cardiac arrest (ACLS/SRC algorithm, rhythm display); (11) light anaesthesia / awareness cues; (12) residual block at
emergence. Each scenario ships with a model test (untreated course, correct treatment course, wrong treatment course).

**M5 - Debrief and teaching layer.** Timeline view, actions vs expected, time-to-treatment, sourced teaching points,
"what would you do now" hint ladder (off by default), replay of a run from its seed and action log.

**M6 - Polish.** Sound (off by default; pitch-tracked SpO2 tone, alarm tiers), reduced-motion, a11y pass,
performance on a mid-range phone (no dropped frames at 20x), offline use if the owner asks (service worker: copy
`bis`'s approach only if it has one; anantf has no repo check for `sw.js`, so add a test for it), page editor compatibility
(`edit/NOTES.md`), library card of scenarios.

## Clinical guardrails

- Teaching only, said on the page. Dosing in the app is for the synthetic patient.
- Cite the source for each drug model, algorithm and threshold. Prefer open guidelines (DAS, ANZCA, AAGBI, ASRA LAST
  checklist, MHAUS, ERC/AHA). Never paste copyrighted text; paraphrase and cite.
- Where models are simplified, say so in `MODEL.md` ("What is not modelled") and on the debrief page.
- Flag uncertain numbers in the PR for the owner; never describe content as clinically reviewed.

## Autonomy rules

- Branch per milestone from latest `main`; PR title starts "OT sim: …"; merge your own once checks are green and
  report with the PR link. Do not touch other apps' files except the registration lines (routes, labeler, checks).
- If a milestone is large, split it, but keep each PR small enough to review on a phone.
- If blocked (cloud limits, a long test run such as a soak run, a Safari/WebKit or real-phone check, a secret), ask
  the owner; carry on with the rest meanwhile.
- Never add the page to the homepage or other apps. Keep `noindex`.
- Save state (`/save-state`) before compacting and when ending.
