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
  decrement Ce 1.0 ug/mL. The engine's controller takes the overshoot limit (`cpMaxRatio`) and reports the pump's
  induction dose (`pumpInduction`); the pump emulator's delivered induction equals it exactly.
- Vite build is multi-page (`tci/index.html` and `tci/pump/index.html`); the TCI app links the pump from the Pump
  tab and the More list. Tests: `test/pump.test.ts` (state machine and number equality) and `test/pump.e2e.mjs`.

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
