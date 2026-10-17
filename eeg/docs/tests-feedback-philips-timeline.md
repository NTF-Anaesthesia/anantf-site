# Tests, phone feedback, Philips IntelliVue and the case timeline

Part of the BIS to DSA / processed EEG notes. Index: [../NOTES.md](../NOTES.md).

## Tests (final integration, 14 Oct 2026)

- `node eeg/test/e2e.mjs` runs the teaching-layout and Medtronic checks, then `adv.e2e.mjs` and `sed.e2e.mjs`; the whole run takes over 10 minutes, so give a shell command a background run.
- An earlier note said `adv.e2e.mjs` was flaky. The cause was the battery-low check: it read `#aBatT` straight after switching the Simulate button off, before the next frame had redrawn it
  (`'10%' !== '100%'`, about one run in two). The test now waits for the text; the assertion is unchanged. Six runs in a row passed after the fix.

## Owner feedback, 15 Oct 2026 (phone, real use)

- The Medtronic and Advance DSAs went solid red: they used the Display panel's saved DSA colour range (a lowered ceiling saved
  on the device). The real monitors have no colour range, so both now always use their own fixed scale; the range sliders
  only affect the Teaching layout and SedLine.
- BIS Advance opens straight on the main screen (no start-up or sensor check); "Replay start-up" under the screen shows the
  boot messages and sensor check again. Default layouts show the DSA and the raw EEG together on all three monitors
  (Advance: DSA, ASYM, EEG; 2-channel: DSA, EEG).
- A monitor switch (Medtronic BIS, BIS Advance, SedLine, Teaching) sits at the top of the page, in step with the Display
  panel's screen-layout buttons.
- SedLine EEG flicker: at 15 mm/s the trace drew every other sample, and which half was skipped in the dimmed older sweep
  swapped every frame, so it shimmered. Every sample is now drawn (a test compares two frames).
- SedLine font is now Hind (Frutiger-style, footless "1"), not Source Sans 3.
- Each monitor sits in a case like the real one: warm light-grey plastic for the Medtronic BIS, the white case around the
  blue band for BIS Advance (kept on phones, thinner), glossy black glass with a light rim for the Masimo Root.
- SedLine raw EEG now follows the simulation's own EEG (the left engine for L1/L2, the right for R1/R2, resampled to 178 Hz,
  scaled by 0.42, plus a small own part per electrode), so it shows the same drug and depth as the DSA; the old separate
  generator was about three times too big and too busy beside Masimo's figures. Trace 1.7 px.
- Medtronic BIS opens with about 35 minutes of earlier trend (an awake patient, made by adv-seed.js, kept in `MT.pre`, never in
  HIST), so its DSA is full like the owner's photos; time labels then fall on whole clock steps. Clear Trend empties it.
- BIS Advance DSA keeps 25 % (was 45 %) of the column before, for the finer minute-to-minute grain of the real screen.

## Philips IntelliVue (`philips`), 15 Oct 2026

The owner asked for the BIS view on a Philips IntelliVue patient monitor (photo of an MX800 in theatre). Files: `pv-screen.js`,
`pv.css`, test `test/pv.e2e.mjs` (run by `e2e.mjs`). Sources: Philips' Instructions for Use, MX400-800 Release N ("Monitoring
BIS", the BIS INOPs and the factory defaults), and the owner's photo; reference copies stay out of the repo.

- What IntelliVue shows for BIS: the EEG wave (label `EEG`, a `100µV` calibration bar, 25 mm/s) and the numerics BIS, SQI, EMG,
  SR (SEF and TP off by default). **There is no BIS DSA on IntelliVue** (only the separate EEG module has a CSA), so this screen
  has none.
- Layout from the photo, 1440 x 900 design pixels (16:10): info line, alarm/INOP field top left, ECG II, Pleth and EEG waves
  on the left, HR, Pulse, ST-II, SpO2 and BIS with SQI/EMG/SR on the right, NBP with its list of readings, SmartKeys.
- BIS colour is a pale, desaturated yellow (#e4da98; owner, 15 Oct 2026), Philips' factory colour and what the owner's monitor shows (the photo's glare made it look white; owner,
  15 Oct 2026). White is a choice in Main Setup, "BIS colour".
- Setup BIS (tap BIS or the EEG): factory defaults High Limit 70, Low Limit 20, Alarms On, Scale 100µV; Smoothing Rate is the
  page's smoothing (10/15/30 s). Show Sensor opens "BIS 4 Electrode Sensor" with Start Sensor Chk and Last Check.
- Alarms and INOPs use Release N wording: `** BIS High` / `** BIS Low` (yellow, the numeric flashes), `BIS SQI < 15%` and
  `BIS IsoelectricEEG` (light blue). Silence acknowledges (a tick before the text). No sounds yet.
- Stand-ins (not simulated physiology): HR drifts and follows depth a little, Pulse is HR - 1, SpO2 100, ST-II 0.3, NBP every
  5 minutes from depth. The EEG is the left engine's signal scaled like SedLine's (`PV_EEG_GAIN`).
- Font: no source names Philips' typeface; its numerals are tall and narrow with a footless 1. Selawik Semibold (already bundled
  for BIS Advance) squeezed to 80 % width matches well.

## Case timeline

`timeline.js` (test `test/timeline.e2e.mjs`): a bar of the case under the monitor switch and buttons −15, −5, −1, +1, +5, +15 min;
a tap on the bar jumps there. It works the same on every monitor.

- Forward runs the simulation on at full speed (app.js's own `step()`, in 1 s steps, 60 s per slice so the page stays alive;
  about 6 s for 15 min on a laptop). It is a new run, not a replay.
- Back: every 30 s of simulated time a save point keeps both engines and their per-channel state, the relaxant model, the case
  story and the drug controls. A jump back restores the last save point at least 20 s before the chosen time (so the EEG buffer
  refills), cuts the trend history there and runs on to the exact second. The drug controls go back to what they were then.
- What came after is dropped (shown hatched on the bar, "… ahead was rewound"); marks made in it (Medtronic gaps, BIS Advance
  snapshots and events, SedLine gaps) go with it. The start of the case (the page's first live second) is the earliest point.
- Drug-control changes show as yellow ticks on the bar. Medtronic keeps DSA + AMPL under the DSA.
