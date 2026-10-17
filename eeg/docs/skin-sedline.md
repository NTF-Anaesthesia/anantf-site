# Masimo SedLine skin

Part of the BIS to DSA / processed EEG notes. Index: [../NOTES.md](../NOTES.md).

## Masimo SedLine (rebuilt 14 Oct 2026, 'sedline' skin)

A near-clone of the SedLine window on a Masimo Root (10.1 in, portrait 800 x 1280, 5:8). Sources: native screenshots in Masimo's operator's manuals
(SedLine LAB-7373E, Smart SedLine LAB-13168B, SedLine 2.0 LAB-9925E, Root LAB-8425F), the Next Generation SedLine brochure, the quick reference guide and the
Root product information. Looking only: nothing was copied into the repo. The reference photos are of a real Medtronic BIS 2-channel monitor, so none of this was
checked against a photo of a Root. Look chosen: the 2017/2018 builds (ADULT pill, network, Iris, battery, speaker, clock; Multitaper DSA).

- Files: `sed-screen.js` (state `SED`, settings and their factory defaults, DOM, hit regions, alarms, sound, the frame hook `sedTick`), `sed-draw.js`
  (data series, DSA images, every drawing), `sed-menu.js` (the menu tree), `sed.css` (design pixels of 800 x 1280 times `--u`, so the screen scales as a
  unit; the phone shows the same screen smaller), `test/sed.e2e.mjs` (also run by `e2e.mjs`), numeric checks in `engine.check.mjs`. `app.js` only calls
  `sedApply()` / `sedTick(dirty)`. The screen is two canvases (static: redrawn each second, EEG: every frame) with transparent labelled buttons over them
  (`.hit`) for keyboard and screen readers. Font: Hind (OFL, bundled; Frutiger-style, with the real screen's footless "1"; replaced Source Sans 3 on 15 Oct 2026 after the owner said the font did not match; the real typeface is not published).
- Screen: status bar (alarm bell, Audio Pause, [power key if Standby is enabled], profile pill, network, Iris, battery, sounds, clock), SedLine window with the
  action tab (TREND / ANALOG), four-channel EEG (L1 R1 L2 R2, sweep with a white cursor and a gap, older sweep dimmed, `30 mm/sec`, `5 µV/mm`), trend rows
  EMG / PSI / SR (PSi 3 times the height, green 25-50 band, orange above and blue below, end dots, limits `50 25`), the well (ARTF, SEFL, SEFR), the DSA (L on
  top 0 Hz at the bottom, ASYM between, R mirrored, 20 min, time labels every 5 min, colour bar `15` to `-40` dB, SEF line), the history bar with the DSA WINDOW box
  and `- 0:30 h +`, the event flag and the gear. The electrode strip pulls down over the top of the EEG (Sensor check key under the screen, or the handle).
- Behaviour: PSi alarm (yellow: panel outline and gradient, white digits, gold title band with the pill `PSI High>50` / `PSI Low<25`, bell tile, tone burst; Audible Alarms
  Off = no tone), window messages from the manual (red pill and frame: `High Impedance Detected`, `Sensor Off Patient`, `No Sensor Connected`, `SedLine is Disconnected`;
  yellow: `Gel Bridging Detected`, `Replace Sensor`, `Low SIQ`), battery low (yellow outline of the whole display, `Low Battery`). The bell silences for the PSi Silence
  Duration (slash on the bell), Audio Pause (red tile with a countdown; Permanent from Sounds). The faults are driven from a "Simulate" row under the screen (outside the monitor).
  While the sensor is off or the module disconnected the numbers show `--`, the traces stop and the DSA gets black no-data bars. Suppression columns are black bars with a blue
  tick at the 0 Hz edge; artefact columns are a white line through both DSAs and a grey bar in ASYM (DSA Artifacts On/Off). Tap the history bar (or drag) to move the time shown;
  it returns to live after 60 s; the DSA is always 20 min, the trends show 0:10 to 2:00 h. Tap a number for About / Settings / Expand or Minimise (the real screen uses press-hold
  and drag; Fixed Trend Layout keeps three rows).
- Menu (gear, the Menu key under the screen, or tapping a label): Root's dialog style (black page, thin lowercase title, back arrow, Cancel and OK; a page edits a copy, OK keeps it).
  Main Menu: Layout (+ Additional Settings: Trend Layout, Analog Range), Sounds, Device Settings (Localization, Kite, Wi-Fi, Ethernet, Bluetooth, Root Battery, Brightness,
  Access Control, Device Output), About, Trend Settings, Profiles, Iris, SedLine. SedLine: Parameter Settings (PSi: About, Alarms, Trends; DSA: About DSA, Trends, Additional Settings, About ASYM;
  SEFL, SEFR, EMG, SR, ARTF: About, Trends, + Alarms for SR, Additional Settings for EMG; ST) and Additional Settings. Factory defaults: PSi limits 50 / 25, caution Off, Silence Duration 2 min,
  Audible Alarms On, Y-axis 100-0, green band 50-25, DSA upper 15 / lower -40 dB, SEF line 3, max 30 Hz, Multitaper, EEG 5 µV/mm, 30 mm/sec, display filter On, placement EEG/PSi/DSA,
  Monitor and Display Impedance On, DSA Artifacts On, EMG Standard (Maximum changes the EMG scaling and shows `EMG MAX` in the title band). Items with nothing to act on in a simulator
  (Wi-Fi, Ethernet, Bluetooth, Kite, Iris, device output, baud rates) exist and answer with a plain status. Settings are saved per device (`bisdsa.sed`).
- How the numbers come from the sim: two engines (left, right) give L and R; L1 and R1 are the engines' signals, L2 and R2 a slightly lagged and attenuated copy with a little
  independent noise (the real pairs are correlated, not identical). PSi = `psiOf` of the mean BIS of both sides; EMG % from the larger of the two EMG dB (`SED.emgOff` / `emgSpan`);
  SR from the two sides' mean; ARTF % = artefact seconds in the last 60 s; SEFL / SEFR = the engines' 95% spectral edges; ASYM = signed 100 (PL-PR)/(PL+PR) of the 30 s mean total
  power. The DSA colours use `-38 + 2.1 x (the sim's dB)` against the screen's upper / lower dB, so the picture looks like the real one at the default scale. The screen starts with 30
  min of awake history from throwaway engines (`SED.pre`, never in `HIST`; `HISTMAX` is 14400 columns, 4 h).
- Not known or invented (marked so): the exact typeface; the electrode impedance colour limits (green up to 15 k, yellow to 35 k, red above: invented); when the PSi alarm fires
  (here: out of the limits for 5 s, and only after the PSi has first been inside them, so an awake patient does not alarm at the start; the real delay is unpublished); alarm priorities
  of the window messages (red for sensor and impedance faults, yellow for the rest: inferred); the sweep cursor is shown (newer builds); the layout when DSA Placement is EEG/DSA/PSi
  (DSA directly under the EEG: inferred); the Pediatric look is the pill and the 0-40 Hz DSA only; the start-up splash, the SedLine dialog artwork (taken from the Root layout and access-control
  screens), animation timing, the on-screen About texts of Root (our own short wording, not the manual's). One DSA column a second, not every 1.2 s. The EMG trend is a stand-in (the sim's EMG
  is a parametric term). Smart SedLine's ST is an option (the "Display: Suppression Time (ST) row" button in the Controls disclosure outside the screen, a simulator addition) rather than a software build.

### SedLine, second fidelity pass (14 Oct 2026, after a side-by-side review against the Root screenshots)

- **EEG**: no longer the engines' 128 Hz signal. `sed-draw.js` runs its own generator at the monitor's 178.154 samples/s: per channel, three band-limited resonators (a slow 1-3 Hz drift with
  bursts, 4-12 Hz waves, 18 Hz beta at about 20% of the power, no white-noise floor) plus a little 30-50 Hz muscle. Its size and slowness follow the live sim (depth of anaesthesia from the
  BIS column, suppression, EMG %). 5 µV/mm is 0.78 µV per pixel and a change of the amplitude setting rescales everything; typical peak-to-peak is about 90 px, bursts reach more; nothing is
  clipped per channel (only at the panel edge), 1 sample per pixel at 30 mm/s (2 at 15), straight 2 px segments. `engine.check.mjs` checks the power split.
- **DSA**: cells of 3 x 3 px (228 columns, 50 rows per panel), the newest second in each cell, anchored in absolute time so cells do not shimmer; 51 colours, no smoothing. Hanning = one noisy
  periodogram with per-cell speckle (hash-based, stable between repaints); Multitaper = 3-tap smoothing over time, little speckle, sharper band edges. At 40 Hz (Pediatric) the spectra are extended
  with a gentle roll-off. The SEF line is smoothed, in steps of 1 Hz, and kept 3 px inside the panel. A dim stub of the oldest columns shows in the left gutter, and of the newest trend samples at each trend's left edge.
- **Chrome**: time-label band framed (`#100f0d`, 1 px `#2b2a2a`, 5-min ticks), larger axis text, bigger digits (PSi 98, EMG/SR 56, well 64 px, weight 500), well units 19 / 14 px, status bar 3 px
  higher, bigger bell, the Root logo drawn as a small SVG. Electrode strip: opaque band, labels and K values right-aligned clear of the icons, the squeezed L1 trace in front of the band. TREND / ANALOG
  popup: two neutral dark tiles, the blue close tab is a real button in `#sedPop` (above both canvases), the title-band tab stays as an empty box; `EMG STD` (or `EMG MAX`) in the title band.
  Main Menu tiles are coloured rounded squares with white glyphs and a rainbow tile; the Layout page shows the six layout tiles.
- **Nothing on the glass says "simulator"**: About reads like a Root (Device Root, Module SedLine, Software 1.8.1.4), the Wi-Fi / Ethernet / Bluetooth / Output pages are plain status rows, a refused
  OK marks the rows red (the text is only for screen readers). The teaching note, the soft keys (Silent, Menu, Sensor check) and the Simulate buttons live in a "Controls" disclosure under the
  bezel, closed by default; the Suppression Time (ST) option moved there too ("Display: Suppression Time (ST) row"). The Menu key opens the Main Menu, and goes back one level when a page is open.
  The About texts are our own short wording (US spelling); the first pass copied the manual's sentences and they were rewritten at final integration so no manual text is in the repo.
- **Behaviour**: a menu or popup left alone for 60 s returns to the main screen (unsaved changes dropped); the number popup is About / Settings only; gestures: a drag along a trend or the DSA scrolls
  all of them, a wheel or two-finger pinch over the trends steps the range, press-and-hold a number (500 ms, it dims) then drag into the well (minimise) or onto the trends (expand), a vertical
  drag on the handle pulls the strip down or up (a tap still toggles). Keyboard route: Arrow Up / Down on a focused number expands / minimises. With every other parameter expanded the PSi goes into
  the well (rows share the height evenly), and an empty well gives its height to the rows. The bell is ignored with nothing sounding (a second press while silenced cancels the silence: inferred).
  The high-priority tone is a 10-pulse burst, medium 3. The flag drops a small flag on the history bar and on the trend axis (no text). Escape in a value list closes only the list.

### SedLine, third fidelity pass (14 Oct 2026, after a reviewer's 7/10 against the 800 x 1280 screenshots)

- **PSi alarm has no arming rule any more**: an awake patient on the factory limits (50 / 25) shows `PSI High>50` after 5 s out of range, from the start (the old "armed once in range" rule hid the alarm
  on a fresh monitor). A limit change resets the 5 s timer. The test lifts the limit for the checks that need a quiet screen.
- **Yellow PSi alarm, measured on ref05 (pixel samples), not on the reviewer's note**: the title band really is gold (about `#b7a449` at the top to `#8a7428`, darker at both ends, 1 px `#f9ca07` edge), the pill is dark
  (`#2a2308`, 1 px gold outline, white 18 px text), the number panel gradient ends on `#c3a52d` (the review asked for a near-black band and a `#f8dd86` end; the screenshot shows neither). No in-panel bell
  for the yellow alarm (only the red one has it); the limits and `PSI` turn pale yellow on the gold. `EMG STD` is no longer drawn (the 2017 look); `EMG MAX` shows only when that sensitivity is chosen
  and no message is up.
- **Electrode strip**: opaque `#15171b` band, the squeezed L1 trace at 38% alpha behind it, a small `L1` label, the white cursor starts below the strip, 1 px `#2b2a2a` line at the bottom edge.
- **Layout page is live** (`SED.set.layout` 1-6, default 6): the tiles are radio buttons; a tap moves the hand-drawn blue ring, OK commits. Layouts 1-5 share the Root screen with a `rainbow` window (empty,
  nothing is connected) and give SedLine 28 / 38 / 65 / 78 / 87 % of the height. The window then shows one view: TREND, EEG, DSA or ANALOG (four buttons in the action popup, the current one a blue tile) over
  a compact numeric row (`PSI EMG % SR % ARTF % SEFL Hz SEFR Hz`). `sedLay()` returns the geometry (`L.eeg`, `L.dsa`, `L.gauge`, `L.rows`, compact row) and everything else reads it. `Additional Settings`
  stays as a small bar under the tiles. In layout 6 a saved EEG or DSA view falls back to TREND.
- **Type**: well and row digits about 62 px (decimal at 0.62), labels 19 px / units 14 px weight 400; a minimised PSi alone in the well is 58 px at x 50 with `PSI` at 20 px; expanded rows right-align
  digits at x 720 (SEFL and SEFR whole numbers, ARTF `0.0`) with a left-aligned label stack at x 746. ST is digits plus a `ST` over `HH:MM` (or `%`) stack.
- **Analog**: the PSi arc is a half circle of ten slim dashes (3 red, 2 white, 5 red on the factory limits), the needle a short fat wedge with its tip on the inner edge; the two mini gauges have six dashes
  and an outside-the-digits wedge.
- **No data** (sensor off, no sensor, disconnected): the trend lines stop at the last valid sample with no head dot, the DSA gets a solid black bar that grows to the right edge (8 px at least) and the ASYM
  strip a matching grey bar. **Sedated data** is coloured like the manufacturer's sedated screens: with the BIS column below about 88 the power is pulled toward red below 8 Hz, green 10-16 Hz, teal at 20 Hz
  and blue above 24 Hz (`SED_PROF`); the awake picture is untouched.
- **Dialogs**: no focus box on the back arrow and buttons unless Tab was pressed inside the glass (`.kb`); labels right-align at 40% of the width and value bars are 430 px wide from 43%; the toggle is a
  glossy blue or dark pill with a chrome knob; layout thumbnails draw a Root (grey bezel, navy screen, green lungs, slot, three dots). The Menu key now closes the whole menu (Escape and the arrow go back one level).
  The Wi-Fi and Device Output pages say `Not available`; the Battery page shows the charge only.
- **Scrub bar**: the `DSA WINDOW` caption appears only above the 0:30 range. **Not done**: seeding 2 h of earlier history; Brightness as a slider; the sedated colouring is a profile, not a fit.
