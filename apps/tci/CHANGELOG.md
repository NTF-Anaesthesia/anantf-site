# Changelog

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
