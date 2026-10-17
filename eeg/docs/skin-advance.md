# Medtronic BIS Advance skin

Part of the BIS to DSA / processed EEG notes. Index: [../NOTES.md](../NOTES.md).

## Medtronic BIS Advance (rebuilt 14 Oct 2026, 'advance' skin)

A near-exact clone of the BIS Advance monitor (10.1 in tablet, 16:10), built from the operator's manual figures (draft Rev A, FCC filing)
and Medtronic's 2021 marketing screenshots. The reference photos are of a real Medtronic BIS 2-channel monitor, not the Advance, so every number below comes from the
manual and the figures; nothing was copied into the repo (looking only).

- Files: `adv-screen.js` (state `ADV`, DOM chrome, headers), `adv-draw.js` (layout and every plot on one canvas), `adv-live.js` (numerics,
  alarms, messages, audio, the frame hook `advTick`), `adv-menu.js` (tile menu, dialogs, sensor check, review, demo), `adv.css`
  (everything in virtual pixels of a 1246 x 779 screen times `--u`, so the screen scales as a unit; the phone shows the same screen smaller).
  `app.js` only calls `advApply()` / `advTick(dirty)` and hides `#advWrap` for other skins. `SIGMAX` is 20 s of EEG (6.25 mm/s sweep).
  `test/adv.e2e.mjs` (also run by `e2e.mjs`) drives all of it. Class names inside the screen are prefixed (`xbtn`, `xrow`, ...) to stay
  clear of the page's own CSS (`.mt`, `.bar`, `.btn` ... belong to the VISTA screen and the page).
- **Fidelity pass 2 (14 Oct 2026, after a clinician-style review against the manual and the 2021 marketing screens):**
  - EEG (`adv-draw.js`, `advDrawEeg`): the engine's signal is shown through a display filter (7-tap smoother, 22% of the fast residue kept as
    fuzz; 75% with EEG filters off), a display gain of 0.55 and a soft limit (normal waves stay under 60% of the half height, a big artefact
    still reaches further; nothing is clipped). It scrolls right to left, newest at the right edge, with scrolling 1 s gridlines, so there is no
    sweep gap. Awake fills about a quarter to a third of the frame, propofol GA about 60%.
  - Earlier trend (`adv-seed.js`): a case starts with 35 min of history (5 s points, `ADV.pre`, never in `HIST`, so the other screens are
    untouched; `advHist(side)` joins it to the live columns from `ADV.cut`). Columns come from throwaway engines at depth 0 and 0.55 (same
    spectra and BIS formula), laid out by a script; the ASYM bumps are scripted tp offsets. The case clock starts 35 min earlier
    (`ADV.t0 = start - 2100`). Demo: defaults restored, the sim goes to propofol GA (page's drug state saved and put back on exit), history
    BIS ~97 to the low 40s, EMG ~45 to 30 dB.
  - Start-up: modal 'Connect BISx to start monitoring', 'Initializing BISx', 'Connect sensor to start monitoring' (Alarm Settings button),
    then the sensor check opens by itself and the case starts when it ends (about 8 s). **Skip start-up** and the **Simulate** row (sensor
    disconnected, sensor expired, battery low, USB drive; password hint) sit under the screen, outside the monitor. Exit Demo restarts it.
  - Messages: a new message shows at once for 5 s, then the bar rotates (n/N); Pause/Silent messages replace each other and use the manual's
    wording; 'Alarm Pause Mode Off' when the 120 s ends. In case review the bar carries only 'CASE REVIEW'.
  - 4-channel DSA and ASYM layout: BIS 0.34 H, DSA 0.11 H each, ASYM 0.17 H, as in the marketing screen (the reviewer's 22% was measured
    against the picture with the bezel). Hz labels are dropped rather than overprinted; ASYM edges are teal and drawn last.
  - **Deliberate deviations** (owner may want them back): the BIS alarm range is off by default (the manual's default; the dialog row shows its
    limits `[40 - 60]` with OFF, an ON default would alarm on an awake patient at once); chart interval default 1 min (figure 58) instead of
    the table's 15; case review keeps the BIS + DSA layout (figure 52). (Pass 3 removed the old deviation 'all six tiles enabled'.)
  - EEG Trends (amplitude, scale, channels, filters) are staged until APPLY; Logs rows have CANCEL and DOWNLOAD; ID is a read-only window that
    closes after 1 minute; the case ID stays fixed during a check.
- **Fidelity pass 3 (14 Oct 2026, second clinician-style review, 6/10 look and 7/10 behaviour before):**
  - EEG: a 1 px `#5fcf8b` line (0.9 opacity) that is the engine's signal through a 3-tap smoother plus a band-limited noise (about 5% of the
    frame, one fresh value per sample, fixed by the sample's own number so it does not shimmer when scrolling) and a slow amplitude envelope
    with occasional stronger stretches; a soft limit keeps normal waves at about +-20 uV equivalent (under half the half-height). The frame
    labels are fixed (`µV 50` / `-50`, `100` when the EEG is alone); the µV/mm selector changes the gain only.
  - DSA: new 7-stop ramp (`#1c3f9c` dark blue to `#d9141c` red) with a frequency shaping (0-4 and 8-13 Hz lifted, 18-30 Hz pulled down, so
    the top rows read dark blue), 45% carry-over from the previous column (slow smoothing), SEF and MF as 1.5 px lines (`#fff`, `#8a3f9f`),
    moving average of 5 columns on both, 13/8/4 Hz lines `rgba(0,0,0,.8)`, faint shared vertical gridlines over the field.
  - Time axis is a bordered strip (grey `#5a5f66` top and bottom lines across the whole width, ticks `#aaa` the strip's height, labels 6 px
    after their tick); the BIS target band is a gradient (`.55` to `.05`, no border); the BIS alarm box is scaled to 92% with an even margin;
    the red bar flashes `#ed2024` / `#c0141c` at 1 Hz; the alarm count marker is green.
  - Top bar: the USB icon is always drawn (brighter when the Simulate USB drive is on), icons `#c8ccd4`; Battery low shows `10%`, an empty red
    glyph, no bolt, and the once-message 'AC power disconnected'. Case review: no title, the alarm bar, pill and message bar stay live (a
    sensor disconnected alarm shows in review as in figure 52), the date, time and ID go, a crossed link icon shows, the three left buttons
    are 52 px rounded squares, and the case facts (DATE, START TIME, DURATION, CASE ID) are printed on the BIS trend.
  - Main menu: **ALARMS and CASE REVIEW are dimmed (40%) and inert while a sensor is connected outside Demo** (the manual); both work with the
    sensor disconnected (Simulate row), ALARMS also in Demo; DOWNLOAD is dimmed in Demo. The e2e test disconnects the sensor before it opens
    case review.
  - Dialogs are drawn at their design size (607 x 449) and scaled 1.5x (small ones 1.25x), so their text is large as on the real screen; the
    sensor check is redrawn (grey plug with a white dot, white tail, pads with navy discs: 1, 2, 4, 3 or LT, LE, G, C, RE, RT; a grey ring with a
    turning blue quarter, green tick on pass, no extra tick over the plug; PASS and kohm text only with Sensor Check Values on, fault names
    always). Alarm Settings rows have their own icons (BIS wave, SR purple area, SEF rainbow tile) and a green ON; the EEG Trends CANCEL and
    APPLY moved to the window footer; the Date Format buttons stay on one line each.
  - Chart view: row bands `#05070b` / `#0c1220`, highlighted oldest row `#16335f` with its full time, date row under it, thin blue scroll bar (always
    shown; headless Chromium hides scroll bars), column heads 15 px under the BEGIN line.
  - Messages and alarms: SQI MEDIUM (under 60) and SQI LOW (under 20) wording; USB: a live recording needs a drive ('Live data export in progress /
    stopped'), pulling the drive while it records gives 'Export failed - USB drive removed'. Hard keys (function = main menu, home = closes
    every window and menu, power = inert) sit on the blue band under the screen.
- Font: Selawik (SIL OFL, metric-compatible with Segoe UI, which the tablet's UI looks like); `fonts/README.md`.
- Case: white case, blue band, "Medtronic" under the screen (below 640 px wide the case is dropped to give the screen the room).
- Channel modes: 4-channel (bilateral sensor, the default: two BIS panels, BURST, SEF/MF of the selected side, L|R pill, ASYM) and
  2-channel (unilateral: one BIS, SET RANGE, no pill). The simulator has two real engines (L and R). INFO > Demo Mode > Begin Demo Mode
  for Unilateral / Bilateral switches mode and adds the DEMO MODE mark and EXIT DEMO MODE (the data stay live: only the mark and the
  restrictions, DOWNLOAD and CASE REVIEW disabled, are the real demo behaviour).
- Colours (manual figures): BIS L `#ec4c9c`, R `#04acec`, EMG `#e8792c`, SQI `#40b449`, SR purple, ST lavender, MF magenta, EEG `#64b47c`,
  alarm bar red `#ec1c2c` (high) or yellow `#ecd40c` (low and medium), 12-stop DSA ramp read off the legend capsule. The DSA uses the same display
  shaping as the VISTA screen (tilt, 10 s minimum averaging, suppression black), only the ramp differs.
- Numerics: BIS blank (not hollow) under SQI 15; SQI 5 bars (>=80 five, 60 four, 40 three, 20 two orange, under 20 one red); EMG bar 30-55 dB;
  SR % of the last 63 s; ST mm:ss (h:mm:ss after an hour); BURST /min; SEF and MF whole Hz. Alarm limits are off by default; when set the label
  shows the range (the disabled-alarm bell icon otherwise), BIS in alarm is white on a red box, SR and SEF in alarm black on yellow.
- Trends: 10 s cadence (bins of 10 s or wider), time scale 1/6/12/24 h from the case start (the left edge is the case start until the window
  fills; the data store holds 4 h), ticks every 10 min / 1 h / 2 h / 4 h, case-start triangle, blue now tick, snapshot flags, dark bands where
  the EEG was unusable. Secondary: EMG (30-80 dB), SR, SQI, NONE, BURST and the other side's BIS (4-channel). ASYM = signed
  100*(PL-PR)/(PL+PR) of the total power per 10 s, smoothed over about 30 s; |ASYM| < 20 is not drawn; L above, R below.
- EEG: sweep with an erase gap (not scroll), 1 s dotted grid, "1 Sec" bar, 2/5/10 uV/mm, 6.25/12.5/25/50 mm/s (default 25 and 5 s across),
  gain from physical size (5.72 virtual px per mm at 25 mm/s), full-scale label follows the gain. 2 uV/mm one channel, 5 or 10 two (2-channel
  screen); 4-channel screen shows LT, RT (Settings: 1, 2 or 4; LE and RE are the LT and RT traces slightly delayed and scaled, because the
  simulator has only two EEG sources).
- Menu (real tree): hamburger > ALARMS (dimmed while monitoring, as on the monitor; ALARM SETTINGS on the left bar does the same job),
  DISPLAY SETTINGS (layouts per channel mode, Secondary, preview), SETTINGS & MAINTENANCE (Global: date and time format, MPM protocol;
  Advanced: smoothing 10/15/30, EEG amplitude, scale, channels, filters, impedance, sensor check values, institutional defaults, trends
  display, Administrator mode (simulator password 1234: erase trend data, factory defaults); Maintenance: logs, configuration, DSC
  self-test), DOWNLOAD, INFO (demo and parameter help), CASE REVIEW. Items that cannot work here answer with the monitor's own message
  ("Export failed - USB drive removed", "System is in Demo Mode", "DSC Self-Test passed" ...).
- Alarms: bar in the top bar (red high, yellow low, count and list drop-down START / ALARM, two lines), pill with bell, pause countdown
  (120 s) and SILENT, drop-down of four round buttons (audio on, pause, off, volume 1-7); WebAudio beeps when the audio is on
  (`ADV.sounding`, `ADV.beeps`); audio-off reminder every 3 min if enabled. BIS range needs 10 s outside the range to raise.
- Messages (bottom bar): count badge, text, n/N, NEXT, check mark; latching until the check mark, otherwise 5 s. It starts with two
  messages like the figures ("Audio reminder is off" and "Institutional settings restored").
- Left bar: L|R pill (4-channel), graph/chart toggle (chart = table with Chart Interval 1-60 min, newest row first, case-start row), ALARM
  SETTINGS, SNAPSHOT (name dialog, "Snapshot created", flag on the axis), SENSOR CHECK (electrode window with spinning rings, PASS/HIGH/NOISE,
  values in kOhm if "Sensor Check Values" is on; thresholds are only implied: the result comes from the live SQI of the side and diathermy),
  INFO. In case review: CASES LIST, CASE LOG, EXIT, a red cursor with a time tag and the numerics at the cursor.

**Remaining uncertainty (what the evidence does not show):** exact fonts and icon shapes (redrawn); the wording of second lines for
ISOELECTRIC EEG and the failed sensor check; the Settings and Maintenance pages, INFO window, Case Log and Case ID window (no native
screenshots; styled like the dialogs that were seen); the left bar caption (ALARM SETTINGS in the draft manual figures, ALARMS in the 2021
marketing screens and the text); SET RANGE (2-channel figure) versus SET TARGET (4-channel figure) kept as in the figures; EEG sweep versus
scroll (the fixed 1 s grid and the dark smudge in the figure suggest a sweep); DSA cell size (about 3 px wide, 60 rows of 0.5 Hz);
the 4-channel L|R pill also drives the lower SEF/MF panel (as the badge in the figure suggests); CASE REVIEW is left enabled while
monitoring although the manual says it is disabled then (otherwise a learner could not scroll the case back); ground check every
10 min, trend-lock, wireless and the camera are not modelled; the real monitor's BIS and ASYM algorithms are proprietary (the simulator's
stand-in is used). Flashing of the alarm bar is a 1 Hz step (inferred).
