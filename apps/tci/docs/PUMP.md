# Space plus Perfusor teaching emulator (tci/pump/): evidence, inference, unknown

Part of the TCI emulator notes. Index: [../README.md](../README.md); research: [RESEARCH_NOTES.md](RESEARCH_NOTES.md).

A pump you operate "as if it were the real one", in the spirit of the processed-EEG simulator in `eeg/`: a virtual
LCD (800 x 272 virtual pixels, `--u = 100cqw / 800`) drawn live from the simulation, a CSS-drawn casing (1000 x 430,
`--p = 100cqw / 1000`), real-looking menus, and this table of what is evidence, what is inferred and what is unknown.

**Not affiliated with or endorsed by B. Braun. Education and planning only; not the pump's own software.** No
manufacturer image, logo, artwork or manual text is in the repository: the one reference photo (a video still of the
main running view) was used for looking only and lives outside the repo. The wordmark area carries the plain text
"Space plus Perfusor" and a neutral "TCI teaching emulator" label in the logo slot. The real demonstration video
(youtube.com/watch?v=LBVUdKXfk5w) was not reachable from the build session (tried once).

## Where the numbers come from

Every number on the screen is produced by the shared engine (`src/engine/`): `schniderPk`, `eleveldPk` (with the
opioid flag and the optional Servin dosing weight), `buildModes` / `step` / `ceOf` / `cpOf` (exact solver), `rateDetail`
/ `rateFor` (the controller, every update interval, with the plasma overshoot limit), `pumpInduction` (the pump's
induction dose), `matchTargetPump` (the matched target on the other model), `reportedSpacePlusWeight` and
`jamesPeakWeight` (validity). The pump layer (`src/pump/sim.ts`) only adds the state machine, the syringe, the alarms
and the clock. The unit tests (`test/pump.test.ts`) and the browser test (`test/pump.e2e.mjs`) assert that the
delivered induction equals `pumpInduction` to 1e-6 mg and that maintenance Ce holds within 1% of the target.

## Pump settings

| Setting | Value | Status |
|---|---|---|
| Maximum rate | 800 mL/h (1200 and 1800 as teaching options in the panel) | VERIFIED: read off the department's Space plus by the owner, 21 Oct 2026 |
| Plasma overshoot limit (Ce mode) | 400%: predicted Cp never above 4 x the Ce target. Induction runs at the maximum rate until Cp reaches the cap, holds Cp at the cap until the predicted Ce peak equals the target, then maintenance | VERIFIED: department pump, 21 Oct 2026 |
| Decrement (wake-up) concentration | 1.0 ug/mL: the TCI details view shows "Decrement time to Ce 1.0" | VERIFIED: department pump, 21 Oct 2026 |
| Controller update interval | 10 s | UNVERIFIED (RESEARCH_NOTES.md Q14) |
| Syringe | 50 mL, confirmed on a syringe screen after the self-test | Size from the owner's brief; the screen is inferred |
| Drug library | Propofol 1% (10 mg / 1 mL) and 2% (20 mg / 1 mL) | Entries inferred; the "20 mg / 1 mL" wording is from the reference photo |
| Target range | 0.5 to 8 ug/mL in 0.1 steps; above 6 asks to confirm | INFERRED (RESEARCH_NOTES.md Q11); the soft limit is a teaching choice |
| Patient limits | Age 1-120 y, height 100-230 cm, weight 20-250 kg on the keypad; model data-range warnings from `MODELS[].check` | Keypad limits INFERRED; data ranges from the source papers |
| Schnider in obesity | Refused when weight is past the James LBM peak for the height (BMI about 43.0 male, 36.1 female): "Model not available for this patient" | The refusal itself is a known behaviour of Schnider pumps; the exact wording and threshold on the Space plus are UNVERIFIED (Q8) |
| Eleveld BMI above 30 | Panel toggle "Servin adjusted weight", labelled reported, unverified: the dosing weight becomes Devine IBW + 0.4 x excess in every Eleveld covariate | REPORTED, UNVERIFIED (Milliet 2025; see RESEARCH_NOTES.md section 5) |
| Pre-alarm | "Syringe nearly empty" when under 5 min of drug remain at the current rate (not judged during the induction); a single warning tone; Stop acknowledges it | INFERRED (the real threshold is a configurable pre-alarm time) |
| Empty alarm | Delivery stops, red "Alarm: syringe empty" screen, repeated tone every 2.5 s, REPLACE SYRINGE then START resumes TCI with a catch-up bolus if Ce has fallen | Stop and replace INFERRED; the model keeping time while stopped is a teaching decision (Q17) |
| Sounds | WebAudio square-wave beeps (key 1200 Hz 40 ms; warning two tones; alarm three tones), only after a user gesture, with a Sound switch | The real tones are UNKNOWN; stand-ins |

## Screens, in order of operation

| Screen | What it shows and does | Status |
|---|---|---|
| Off | Black screen; only On/Off works | Evidence (any pump) |
| Self-test | Wordmark, "TCI teaching emulator", a progress bar, 2 s | INFERRED (the real start-up screen was not seen) |
| Syringe | Syringe drawing, "50 mL syringe recognised", OK | INFERRED |
| Drug library | Propofol 1% / Propofol 2% rows with mg per mL | INFERRED list; drug and concentration wording from the photo |
| Application mode | Standard (mL/h) / TCI. Standard answers "not part of this emulator" | INFERRED |
| TCI model | Schnider / Eleveld (effect site only) | Model names from the manufacturer's page excerpt; the list layout is INFERRED |
| Opioid co-administration | Yes / No, Eleveld only | The covariate is in the model; whether and how the pump asks is UNVERIFIED (Q6) |
| Patient | Four teaching cards (young fit man, older adult, obese woman, frail sarcopenic woman) and Custom | Teaching design, not the pump's own screen |
| Patient data (Custom) | Sex, then age, height, weight on a 4 x 3 keypad with NEXT / OK and range checks | INFERRED |
| Patient summary | Model, patient, BMI, James LBM or Al-Sallami FFM, dosing weight; a validity box: green (in range), amber (warnings from the model's data range), red (Schnider refused, no OK key) | The derived numbers are the engine's; the screen is INFERRED |
| Target | Keypad entry of the Ce target, range hint, the bolus the entry would give, CONFIRM on a second OK above 6 | INFERRED |
| TCI ready | Target, induction bolus (mg, mL, seconds at the maximum rate), model, plasma overshoot percentage, START | INFERRED |
| Running, main view | Status column (run arrow, battery "12h", elapsed time, pressure dial "12 mmHg"), lime drug header "Propofol / 10 mg / 1 mL", cyan labels with white numerals: Target Ce, Ce, Cp; Infused Amount (mg); Remaining Volume (x / 50 mL); Flow Rate large with a smaller decimal, "mL/h", a divider, mg/kg/h; steel-blue soft-key bar CHANGE VIEW and CHANGE TARGET with an amber underline; induction progress bar "Bolus x / y mL" during the bolus | Layout, colours, labels, number styling and the soft-key bar from the reference photo (which shows a Standard-mode screen with Infused Amount, Remaining Volume, Flow Rate, 5 mg/kg/h, CHANGE VIEW and BOLUS). The Target Ce / Ce / Cp row, the induction bar and CHANGE TARGET in place of BOLUS are INFERRED for TCI mode. Battery and pressure values are decorative |
| Running, trend view | Canvas: Cp (dashed cyan), Ce (white), target (dotted amber), a 5 min prediction from the controller, time axis in minutes | INFERRED (Q19) |
| Running, TCI details | Model, patient (and dosing weight if adjusted), ke0, V1 / CL, time to target, decrement time to Ce 1.0, plasma overshoot 400%, max rate and update interval | Decrement and overshoot values VERIFIED; the screen is INFERRED |
| Change target | Keypad pre-filled with the current target; raising gives a new bolus at once, lowering sets the rate to 0 until the predicted Ce falls (the pump says so and the details view shows the time to target) | Behaviour follows the controller; whether the real pump asks for confirmation is UNVERIFIED (Q15, Q16) |
| Paused (Stop key) | Amber header "STOPPED", flow 0.0, right soft key becomes START; the model keeps running so Ce decays; START resumes with a catch-up | Stop pausing delivery is evidence; the screen is INFERRED |
| Confirm switch-off | "Switch off? The case ends" with NO / YES | INFERRED |
| Syringe empty | Red title bar, Ce now (falling), infused amount, REPLACE SYRINGE | INFERRED |

Hardware keys (from the photo): Home (house in a ring) returns to the main running view (during set-up it returns to
the drug library: inferred); On/Off (power ring) switches on, or asks to confirm switch-off; red round Stop pauses
delivery. LEDs: grey dot (alarm, red when the syringe is empty: inferred), green run triangle (blinks while running),
bell and plug icons (decorative). The right-hand clamp with the round "Pull" plunger holder and the syringe are drawn
in CSS from the photo's shapes.

## Teaching panel (not part of the pump)

Scenario presets (model, then one of the four patients: loads the summary screen and switches the pump on if needed),
speed 1x / 5x / 20x / pause and "Jump 5 min", "What the pump is doing" (a plain-English line from the state), a live
Cp / Ce / target chart with the controller's prediction and the rate, "Same patient, other model" (the other model's
induction for this Ce and the matched target from `matchTargetPump`, or "refused" for Schnider past the James peak),
pump settings (the BMI above 30 toggle, maximum rate 800 / 1200 / 1800), shortcuts (drain the syringe to 3 mL, reset),
page theme, and "How the numbers are made" (LBM, FFM, dosing weight, the model's volumes and clearances, ke0, the
decrement time). The panel's chart is the same `lineChart` as the TCI app.

## Phone layout

The whole pump scales to the viewport width (no horizontal page scroll). Below 700 px the page opens in **Screen**
mode (the LCD at full width with the three hardware keys below). **Rotate** turns the LCD through 90 degrees so that,
with the phone held sideways, the soft keys are at least 44 x 44 CSS px (68 x 724 px at 390 px wide) and the LCD text
is large. In Pump mode on a desktop (pump about 770 px wide) the soft keys are about 36 px tall; the casing's printed
text has a 12 px floor. Inside the LCD, labels are 22 virtual px (about 10 px at 390 px in Screen mode, 27 px rotated).

## Test hook

`window.__pump` exposes the state, `act(key)`, `advance(seconds)`, `setSpeed`, `setMode`, `loadScenario` and a few
engine functions so the browser test can drive the pump deterministically and compare the screen with the engine.
It is not a user feature.

## Still to check on the department's pump

Q6, Q8, Q11, Q14-Q19 in [RESEARCH_NOTES.md](RESEARCH_NOTES.md) section 7, plus: the start-up, syringe and drug-library
screens; whether the pump shows an induction progress indicator and a trend; the pre-alarm time; the alarm tones.
