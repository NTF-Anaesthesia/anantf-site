# Changelog

## 0.2.0 (21 Oct 2026)

- Pump emulator (`tci/pump/`): an operable Space plus Perfusor running propofol TCI (1% and 2%, 50 mL syringe;
  Schnider and Eleveld, effect site). Full set-up flow from switch-on to Start, induction bolus with progress, three
  running views (main numbers, trend, TCI details), change target up and down, Stop and resume, syringe pre-alarm and
  empty alarm with replacement, confirm switch-off, audible beeps after a user gesture. Four teaching patients and a
  Custom entry on an on-screen keypad. Teaching panel: speed 1x / 5x / 20x / pause, live Cp and Ce chart, plain-English
  status line, same-patient other-model comparison, the reported BMI above 30 behaviour as a firmware toggle, scenario
  presets, shortcuts. Phone first: screen-only and rotated operate modes. Notes with the evidence / inferred / unknown
  table in `docs/PUMP.md`.
- Pump settings verified on the department's pump (21 Oct 2026): maximum rate 800 mL/h, plasma overshoot limit 400%,
  decrement Ce 1.0 µg/mL. The engine's controller takes the overshoot limit (`cpMaxRatio`) and reports the pump's
  induction dose (`pumpInduction`); the pump emulator's delivered induction equals it exactly.
- Vite build is multi-page (`tci/index.html` and `tci/pump/index.html`); the TCI app links the pump from the Pump
  tab and the More list. Tests: `test/pump.test.ts` (state machine and number equality) and `test/pump.e2e.mjs`.
- Review fixes (round 1): the pre-alarm is never judged during a bolus phase (induction, catch-up or a raised target),
  clears by itself when the time left rises, has its own amber band with an OK key that acknowledges it without pausing,
  and lights the bell; the bolus strip has its own row under the numerals and also shows "New bolus x / y mL" after a
  raised target; Target Ce / Ce / Cp cells carry the label above the value; On/Off is held for 1 s to ask for switch-off;
  phones open in the rotated Operate mode (LCD keys at least 44 px) and Operate falls back to the whole pump in
  landscape; the preset's teaching point is shown in the panel (young man text corrected: Schnider about 1 mg/kg versus
  Eleveld about 2.6 mg/kg at Ce 4, and he is under Schnider's 26 y floor); the matched target is flagged when above the
  pump's 8 µg/mL limit; one time-to-target calculation for the details view and the panel; µg/mL everywhere; the ready
  screen says when the bolus is held at the plasma limit and when Ce peaks; larger trend axis text; a what-is-real-and-
  what-is-inferred list in the panel; casing with a joined lid, syringe barrel and plunger holder.

- Review fixes (round 2): the engine's controller reports when an interval's rate was set by the plasma overshoot cap
  (`rateDetail().capped`, `SimResult.capped`, `pumpInduction().capped`), and `pumpInduction` returns the Ce peak time of
  the stepped run; the ready screen and the panel say "held at the 400% plasma limit" only when Cp is actually at the cap
  (a slower final top-up interval is "the final part of the bolus"), and the ready screen's peak minute matches the
  trend. Teaching text corrected: Schnider is refused past the James LBM peak because its clearance (which subtracts LBM)
  would paradoxically rise with weight; the older and frail points add that the model predicts concentration, not
  effect (lower targets, stepwise increases), the frail woman's higher per-kg Schnider bolus and that the formulas cannot
  see sarcopenia; the young man's age flag is the emulator's own data-range check (the real pump's limits unverified).
  Panel: an Opioid yes / no control for Eleveld scenarios; the inferred list names the refusal threshold, the data-range
  warnings, the target range and confirm, and the paused screen. With the Servin toggle on, the summary shows the FFM the
  model actually uses and "Dosing weight x kg (Servin, reported Space plus behaviour, unverified)". Layout: Operate mode
  caps the rotated LCD so the whole display fits the phone under the app bar and Start scrolls it into view; the casing's
  printed labels scale with the pump (no 12 px floor, tag hidden on a small pump) so nothing spills off the fascia at
  390 px; the ready, syringe-empty and patient summary screens clear the soft-key bar; a gap between the cyan labels and
  the numerals; larger trend legend and axis text. Tests: the delivered induction is checked against `ceBolus` with the
  rate limit within one update interval, the rotated LCD fit, the casing labels at 390 px, the opioid control and the
  refusal wording; screenshots hide the app bar and skip link.

## 0.1.0 (21 Oct 2026)

- Phase 1: research notes and references (`docs/`). No primary PDF reachable from the build session; every constant is
  SECONDARY (concordant implementations and abstract excerpts) and the owner's nine golden values are reproduced.
- Oracle rebuilt (`oracle/tci_ref.py`); seed files were unavailable. Fixed before use: Eleveld maturation uses
  age x 52 + 40 weeks (supplement code), not age x 52.143.
- Engine: exact poly-exponential solver; Eleveld (arterial/venous, opioid flag), Schnider, Marsh (ke0 0.26/1.2);
  Ce and Cp targeting; rate-limited boluses; TCI controller with target changes.
- App: bolus matcher (both directions), pump-style display and maintenance simulator, Ce/Cp curves with peaks,
  sensitivity tables and an age x weight heat map, calibration against a real pump, BMI above 30 mode
  (reported Space Plus behaviour, Servin adjusted weight), references, assumptions, light and dark themes.
- Tests: 121 Vitest cases; Playwright at 390 px in both themes.
