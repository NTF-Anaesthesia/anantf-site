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
| Maximum rate | 800 mL/h (1200 and 1800 as teaching options in the panel) | VERIFIED: read off the department's Space plus by the owner, 21 Oct 2026. The build brief said "1200 mL/h default, unverified"; the pump's own setting won, so 800 is the default and 1200 is an option |
| Plasma overshoot limit (Ce mode) | 400%: predicted Cp never above 4 x the Ce target. Induction runs at the maximum rate until Cp reaches the cap, holds Cp at the cap until the predicted Ce peak equals the target, then maintenance | VERIFIED: department pump, 21 Oct 2026 |
| Decrement (wake-up) concentration | 1.0 µg/mL: the TCI details view shows "Decrement time to Ce 1.0" | VERIFIED: department pump, 21 Oct 2026. The build brief said 1.2; the pump's own setting won |
| Controller update interval | 10 s | UNVERIFIED (RESEARCH_NOTES.md Q14) |
| Syringe | 50 mL, confirmed on a syringe screen after the self-test | Size from the owner's brief; the screen is inferred |
| Drug library | Propofol 1% (10 mg / 1 mL) and 2% (20 mg / 1 mL) | Entries inferred; the "20 mg / 1 mL" wording is from the reference photo |
| Target range | 0.5 to 8 µg/mL in 0.1 steps; above 6 asks to confirm | INFERRED (RESEARCH_NOTES.md Q11); the soft limit is a teaching choice |
| Patient limits | Age 1-120 y, height 100-230 cm, weight 20-250 kg on the keypad; model data-range warnings from `MODELS[].check` | Keypad limits INFERRED; data ranges from the source papers |
| Schnider in obesity | Refused when weight is past the James LBM peak for the height (BMI about 43.0 male, 36.1 female): "Model not available for this patient" | The refusal itself is a known behaviour of Schnider pumps; the exact wording and threshold on the Space plus are UNVERIFIED (Q8) |
| Eleveld BMI above 30 | Panel toggle "Servin adjusted weight", labelled reported, unverified: the dosing weight becomes Devine IBW + 0.4 x excess in every Eleveld covariate | REPORTED, UNVERIFIED (Milliet 2025; see RESEARCH_NOTES.md section 5) |
| Pre-alarm | "Syringe nearly empty, about N min left" when under 5 min of drug remain at the current rate. Never judged while the controller is in a bolus phase (the induction, the catch-up after a replaced syringe or a Stop, or the bolus after a raised target, all of which run at the maximum rate and would read under 5 min with a full syringe); clears by itself when the time left rises above 6 min or the syringe is replaced. Shown as an amber band under a shortened drug header with an OK key; OK acknowledges it without pausing delivery (it stays quiet until the syringe is replaced); the bell icon lights amber; a single warning tone | INFERRED (the real threshold is a configurable pre-alarm time; the band, the OK key and the bell are not from the photo) |
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
| TCI ready | Target, induction bolus (mg and mL), "Given over N s (800 mL/h)" with the minute at which Ce peaks, model, plasma overshoot percentage, START. "Then held at the 400% plasma limit" is added only when the controller actually chose a capped interval (predicted Cp reaching 4 x target); the slower final top-up interval of an uncapped bolus is not a cap (Schnider at 800 mL/h peaks at Cp 9 to 13 against a cap of 12 to 16, so it is never capped; Eleveld on the young man is). The peak minute comes from the same stepped run the pump gives (10 s intervals, refined between grid points), so it matches the trend | INFERRED |
| Running, main view | Status column (run arrow, battery "12h", elapsed time, pressure dial "12 mmHg"), lime drug header "Propofol / 10 mg / 1 mL", cyan labels above white numerals: Target Ce, Ce, Cp (one row); Infused Amount (mg) and Remaining Volume (x / 50 mL) (next row); a bolus strip in its own row under them ("Bolus x / y mL" during the induction, "New bolus x / y mL" for a catch-up or a raised target, empty otherwise); Flow Rate large with a smaller decimal, "mL/h", a divider, mg/kg/h; steel-blue soft-key bar CHANGE VIEW and CHANGE TARGET with an amber pill of three chevrons and an amber underline | Layout, colours, labels, number styling, the battery "12h", the pressure dial with "12 mmHg", and the soft-key bar with the amber pill are from the reference photo (which shows a Standard-mode screen with Infused Amount, Remaining Volume, Flow Rate, 5 mg/kg/h, CHANGE VIEW and BOLUS). The Target Ce / Ce / Cp row, the bolus strip and CHANGE TARGET in place of BOLUS are INFERRED for TCI mode. The battery and pressure readings are fixed stand-ins (the photo's values): occlusion pressure is not simulated, so the dial never moves. mg/kg/h is worked out on the dosing weight (INFERRED). The pill is an original drawing, not the manufacturer's artwork |
| Running, trend view | Canvas: Cp (dashed cyan), Ce (white), target (dotted amber), a 5 min prediction from the controller, time axis in minutes; axis and legend text 22 virtual px (about 10 CSS px at 390 px in Screen mode, 19 px in Operate) | INFERRED (Q19) |
| Running, TCI details | Model, patient (and dosing weight if adjusted), ke0, V1 / CL, time to target, decrement time to Ce 1.0, plasma overshoot 400%, max rate and update interval | Decrement and overshoot values VERIFIED; the screen is INFERRED |
| Change target | Keypad pre-filled with the current target; raising gives a new bolus at once (the strip shows "New bolus x / y mL", y from the controller run forward from the current state), lowering sets the rate to 0 until the predicted Ce falls (the pump says so; the details view and the panel show the same time to target, from one prediction) | Behaviour follows the controller; the pump reacting at once rather than at the next update is INFERRED; whether the real pump asks for confirmation is UNVERIFIED (Q15, Q16) |
| Paused (Stop key) | Amber header "STOPPED", flow 0.0, right soft key becomes START; the model keeps running so Ce decays; START resumes with a catch-up | Stop pausing delivery is evidence; the screen is INFERRED |
| Confirm switch-off | "Switch off? The case ends" with NO / YES | INFERRED |
| Syringe empty | Red title bar, Ce now (falling), infused amount, REPLACE SYRINGE | INFERRED |

Hardware keys (from the photo): Home (house in a ring) returns to the main running view (during set-up it returns to
the drug library: inferred); On/Off (power ring) switches on with a tap, and once the pump is on must be **held for
1 s** to ask for switch-off (a tap only shows "Hold On/Off for 1 s to switch off"; the hold time is inferred, the real
one is unknown); red round Stop pauses delivery (it no longer clears the pre-alarm: the band's OK does). LEDs: grey dot
(alarm, red when the syringe is empty: inferred), green run triangle (blinks while running), bell (amber during the
pre-alarm: inferred) and plug icons. The casing is drawn in CSS from the photo's shapes: a white lid joined to the
grey body, a black fascia, the translucent syringe barrel with its plunger line lying across the right-hand clamp, and
the tall rounded plunger holder with the round "Pull" mark. No logo or artwork is reproduced.

## Teaching panel (not part of the pump)

Scenario presets (model, then one of the four patients: loads the summary screen and switches the pump on if needed),
speed 1x / 5x / 20x / pause and "Jump 5 min", "What the pump is doing" (a plain-English line from the state: induction
progress, "Bolus complete: rate 0 while Ce rises to its peak", "New bolus x / y mL", target lowered with the time to
target, maintenance) with the loaded preset's **teaching point** under it (young man: Schnider's fixed V1 gives about
1 mg/kg and Eleveld about 2.6 mg/kg for Ce 4, and the emulator flags his age as just outside the Schnider volunteers,
the real pump's limits unverified; older adult: Eleveld clearance falls with age with an opioid, and the model predicts
concentration, not effect, so lower targets and stepwise increases are usual; obese woman: past the James peak, so LBM
falls with weight and Schnider clearance, which subtracts LBM, would paradoxically rise; frail woman: near or outside
both data ranges, a higher per-kg Schnider bolus because V1 is fixed, the formulas cannot see sarcopenia, lower targets
usual), a live
Cp / Ce / target chart with the controller's prediction and the rate, "Same patient, other model" (the other model's
induction for this Ce and the matched target from `matchTargetPump`, flagged "above the pump's 8 µg/mL limit: not
settable" when the matcher lands outside 0.5 to 8, or "refused" for Schnider past the James peak),
an Opioid yes / no control for Eleveld scenarios, pump settings (the BMI above 30 toggle, maximum rate 800 / 1200 / 1800), shortcuts (drain the syringe to 3 mL, reset),
page theme, and "How the numbers are made" (LBM, FFM, dosing weight, the model's volumes and clearances, ke0, the
decrement time), and "What is real and what is inferred", a short version of this file for site users, who cannot open
the repository. The panel's chart is the same `lineChart` as the TCI app.

## Phone layout

The whole pump scales to the viewport width (no horizontal page scroll). Three views: **Pump** (the whole casing),
**Screen** (the LCD at full width with the three hardware keys below) and **Operate** (the LCD turned through 90
degrees so that, with the phone held sideways, it fills the long side). Below 700 px the page opens in Operate. The
rotated LCD's long side is the phone width less the gutters, capped so that the whole display fits the viewport under
the 44 px sticky app bar with the hardware key row below it (`min((100vw - 32px) * 800 / 272, 100dvh - 150px)`): on a
390 x 844 phone the LCD is 236 x 694 CSS px, its soft keys 52 x 217 px, the keypad keys about 78 x 49 px, and the
smallest LCD text about 13 px. Start scrolls the stage under the app bar (`scroll-margin-top`), so the status column
is never hidden by it; the browser test asserts the fit and that every LCD key is at least 44 px in the default phone
mode. Operate falls back to
Pump whenever the viewport is 700 px or wider (a landscape phone or a desktop), both on load and on resize. Screen mode
on a phone is small (soft keys 23 px, labels about 9 px) and is offered as a choice, with the hint pointing to Operate.
In Pump mode on a desktop (pump about 770 px wide) the soft keys are about 36 px tall (the test asserts 32 px). The
casing's printed text (the wordmark, its "plus" superscript, the "TCI teaching emulator" tag, "Stop", "Pull") is part
of the scaled device artwork, like the LCD: it scales with the pump (about 9 px for the wordmark at 390 px in Pump mode,
as print on a photographed pump would be) and the tag is hidden when the pump is narrower than 560 px, so nothing
collides or spills off the fascia (the browser test asserts this at 390 px). The site's 12 px floor applies to the
page's own text; the app bar shows the short title "Perfusor" under 480 px.

## Test hook

`window.__pump` exposes the state, `act(key)`, `advance(seconds)`, `setSpeed`, `setMode`, `mode`, `holdMs`,
`loadScenario` and a few engine functions so the browser test can drive the pump deterministically and compare the screen with the engine.
It is not a user feature.

## Still to check on the department's pump

Q6, Q8, Q11, Q14-Q19 in [RESEARCH_NOTES.md](RESEARCH_NOTES.md) section 7, plus: the start-up, syringe and drug-library
screens; whether the pump shows an induction progress indicator and a trend; the pre-alarm time; the alarm tones.
