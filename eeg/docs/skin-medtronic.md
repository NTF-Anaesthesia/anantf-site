# Medtronic BIS skin (default): evidence, rebuild and fidelity pass

Part of the BIS to DSA / processed EEG notes. Index: [../NOTES.md](../NOTES.md).

## The three monitor skins at a glance: evidence, inference, unknown (final integration, 14 Oct 2026)

Reference photos, manuals and screenshots were used for looking only and live outside the repo; nothing from them (images or manual text) is committed.
Every element on all three screens is drawn each frame from the live simulation, never from a picture. Details sit in each skin's section below.

| Skin (id) | Cloned from evidence | Inferred | Unknown or not modelled |
|---|---|---|---|
| Medtronic BIS (`vista`, the owner's monitor) | Layout, colours (sampled from the owner's photos), key row, message wording and codes, three-page menu names, sensor-check screens, review keys, defaults from the manual (1 hour scale, Target Range inactive) | EEG gain, AMPL dB scale, DSA colour scale (tuned by eye), alarm tone, Monitor Mode texts | Display menu of the 2-channel monitor (no photo), real passkey, exact fonts (look-alikes), EMG tube hatching, 4-channel views |
| BIS Advance (`advance`) | Screen geometry (1246 x 779), left bar, alarm and message bars, tile menu tree, dialogs, colour values from the manual figures and 2021 marketing screens, DSA legend ramp | EEG sweep versus scroll, DSA cell size, Settings / Maintenance / INFO / Case Log pages (styled like seen dialogs), alarm bar flash rate, second-line wording of some alarms | Native screenshots of several pages, exact fonts and icons (redrawn; Selawik stands in for Segoe UI), ground check, trend lock, wireless, camera, the proprietary BIS and ASYM algorithms |
| Masimo SedLine (`sedline`) | Root 800 x 1280 layout, status bar, four-channel EEG, trend rows, well, DSA with ASYM, colour bar, menu tree and its defaults, About texts, alarm and message names | Alarm priorities and delay, impedance colour limits, DSA Placement variants, Pediatric look, dialog artwork, sedated DSA colour profile, EEG character (own 178 Hz generator) | Typeface (Hind, a Frutiger-style open font, stands in), start-up splash, animation timing, Masimo's PSi algorithm (a straight-line stand-in from BIS), real EMG, Brightness slider, 2 h of earlier history |

None of the three has been compared side by side with a live unit of that model except the Medtronic one (photos of a real Medtronic BIS 2-channel monitor).

## Medtronic BIS 2-channel screen (rebuilt 14 Oct 2026)

Built from the owner's photos (three monitors, software 3.50 or later), Medtronic's published manual and software-update
sheet (screens are 640 x 480), as a clone to look at and use. Code: `mt-screen.js` (loaded before `app.js`; the old
`drawVEeg`/`drawVDsa` are gone). The screen is a 640 x 480 virtual LCD: CSS sizes are `calc(N * var(--u))` with
`--u = 100cqw / 640`, canvases draw in the same virtual pixels (`mtCv`), so the screen scales as one unit (phone too).

- **Layout:** BIS box (white header with heavy "BIS" in Archivo Black and 5 SQI bars, number in Arial Bold), EMG tube
  (4 cells, 3 dividers, orange), ST box (violet, h:mm:ss) and SR box (plain bold number), EEG box with a grey **sweep gap**
  (EEG is a sweep, 25 mm/s, about 3 s across, 1 px lime trace, not a scroll), captions under it ("25 mm / sec.", "EEG",
  "25 µV / division"; 50 µV with 2 channels and a taller box), message bar at y 180-230, three bevelled pale-blue keys,
  lower frame with header (SEF integer, MF two digits, date and time with seconds, case code), DSA 0-30 Hz with dotted
  4/8/13 Hz lines and yellow "Hz" labels, right label panel (Beta, Alpha, Theta, Delta), white SEF and violet MF lines
  (2 px), then **AMPL** (white area, max |EEG| per second in dB, `col.amp`, scaled 15-75 dB, an estimate) or the BIS trend
  ("DSA + BIS": header shows `BIS nn`), clock labels every 10 min (every 1 / 2 / 5 min for the 5 / 15 min windows), the
  artefact strip (orange SQI under 50, yellow blanked), black gap lines (sensor check passed, Clear Trend Data) and the
  H-L colour bar. Colours were sampled from the photos: pale blue frames (white on the manufacturer's own screenshots).
- **Colour map and DSA image** (reworked in the fidelity pass below): a saturated red-orange-yellow-green-cyan-blue table
  (`MT_LUT`), no dark ends; the image is 323 x 118 virtual px, one-pixel columns, no blur (see "Fidelity pass").
- **Display** (Menu > Display): BIS (trend view: yellow 2.5 px line with black outline, ST in magenta on the right axis,
  target band, review arrow), EEG (big sweep, small BIS trend top right), DSA + Amplitude (**default**), DSA + BIS.
  Trend Time Scale 5 / 15 min / 1 hour (default 1 hour, as on the real monitor; the page opens with 5 min of warm-start
  data, so the DSA starts as a strip at the left and fills as time runs, like a freshly started monitor. The 5 min scale
  fills the screen at once and is a teaching extra; the real Display menu has no such tile). Display ST decides whether the right axis is ST or the Secondary Variable (EMG, SR).
- **Menu** (key 2; becomes HOME): three pages of 3 x 3 tiles with real names: Target Range (active, alarm, High / Low in
  steps of 5, format band / lines; they are `mon.ahi` / `mon.alo`, so they set the "BIS out of target range" alarm),
  Secondary Variable, Chart Data (interval 1-60 min, table from `HIST`), Alarm Volume (1-5, Test beep), Display, View/Save
  Settings (table of settings, unsaved ones yellow, Save Active asks for a passkey), Help, Snapshot (camera mark on the
  time axis), Display SR, Monitor Mode I-IV (presets for smoothing, SR, channels), Export Data (Begin Export downloads the
  history as CSV), BIS Smoothing Rate 10 / 15 / 30 (a real setting: `mon.smooth`), Print, Configuration, EEG Channels 1 / 2
  (2 shows the right-hemisphere engine as the second trace), Date and Time, Language, Filters (off adds 50 Hz mains
  hum to the EEG), Impedance Checking, Maintenance (passkey, then its own page), Demo Case (case code "DEMO"; sensor
  check refused with message 511), Diagnostics (Clear Trend Data really empties `HIST`). While a menu is open the BIS trend takes
  the EEG box's place at the top, as on the real monitor. Items with no effect in a simulator answer with the monitor's
  wording or a short text screen. The passkey is fixed at 1234 (`MT.pw`; the real one is not reproduced); a wrong entry
  answers "Invalid passkey".
- **Keys:** bell is a 3-state key: green, yellow (paused 2 min, seconds counting down), red X with SILENT; MENU/HOME;
  SENSOR CHECK/EXIT (TREND REVIEW EXIT in review).
- **Messages** (text, two spaces, code in `[ n ]`): red flashing "BIS out of target range [ 29 ]" (low) / [ 30 ] (high),
  "Isoelectric EEG Detected [ 31 ]"; yellow "Data unavailable due to poor signal quality [ 28 ]", "Excessive Artifact
  Detected in Signal [ 27 ]", "Press electrode 3 [ 13 ]", "Sensor Check in Progress", start-up "Factory settings restored"
  with the navy Dismiss button; info (dark blue) for settings changes ("Smoothing Rate Changed to 30 Seconds [ 534 ]",
  "Filters Off", "Switching EEG channels to 2"). The red bar keeps flashing while the key is silenced (as on the photo).
- **Sensor check:** the real screen: empty BIS box with hollow bars, yellow bar, panel with the electrode strip (1, 2, 4 joined,
  3 apart), grey "?" noise, red blinking X (impedance too high: electrode 3 while the signal is poor), green tick, then
  PASS and the screen leaves by itself; Show / Hide Values gives kohm and NOISE / HIGH / PASS; EXIT key.
- **Trend Review** (Display menu or the cyan arrow): Case / Cursor, SR / EMG / SQI / None, Step Backward / Forward (10 s),
  click the plot to place the cursor with the readout box.
- **Reviewer fix pass (14 Oct 2026):** raised, beveled menu tiles on a plain gradient panel (no big frame); Previous / Next
  centred; Display menu is one "Main display:" tile (thumbnail, BIS / EEG / DSA) plus a DSA tile that toggles DSA +
  Amplitude / DSA + BIS (Trend Time Scale stays, marked "teaching extra"); page 2's bottom-middle cell is empty; Secondary
  Variable has five plain tiles (Signal Quality works, Bursts/Minute is a teaching approximation from SR); Alarm Volume
  tiles x 46-495. Alarm key reads SILENT with a red crossed bell while a red alarm is active. No target or isoelectric
  alarm (bar or sound) during Sensor Check; its yellow bar names only HIGH electrodes ("Press electrode 2 [ 13 ]"),
  otherwise "Sensor Check in Progress"; electrodes go navy (pending), grey NOISE, then green (the ground, 2, reads HIGH
  for a moment so the message can be seen); SQI bars stay hollow; MENU leaves the check like EXIT; leaving with a HIGH
  electrode gives "Last Sensor Check Failed [ 16 ]" (Dismiss), a pass gives a new random case ID. Snapshot marks the
  trend at once (old marker becomes a diamond and the warning screen shows only then). Export shows "Exporting ... n%"
  to "100% complete" with Stop Export and the USB icon under the BIS box. "Date and time not changed [ 513 ]". Target
  Range still starts at 60 / 40 as a teaching shortcut (the real defaults are 100 / 0: no band, no alarm; we draw no
  band at 100 / 0). The DSA is softened (3-column and 1-2-1 vertical average), AMPL is white and smoothed, SEF / MF are
  2 px smoothed lines (MF `#9a6cf0`), the BIS digits are heavy (Arial Black on machines that have it, else Archivo Black).
- **Uncertain or not copied** (the evidence is weak; the invented screens are unverified): the 2-channel Display menu layout
  (no photo of it exists; ours is a reduced version of the 4-channel one, with the "Trend Time Scale" and "Display ST" tiles
  added: deliberate teaching departures), the AMPL dB scale, the alarm tone itself (a square 880 Hz beep, 3 pulses every 2 s;
  the real pattern is not documented), the battery icon and USB/print icons (not shown), the yellow-bell label, SR hidden
  when Display SR is off (we hide the box), Date and Time apply (refused: "cannot be changed during a case"), the Language
  screen ("English is the only language installed"), the Monitor Mode tile descriptions, the passkey (1234), exact fonts
  (look-alikes: Archivo Black, DejaVu Sans, Arimo, Archivo Narrow), the EMG tube hatching, 4-channel and bilateral views
  (not the owner's monitor).

### Fidelity pass (14 Oct 2026, after a clinician-style review of the clone against the manual and photos)

- **DSA image:** `mtPaintDsa` builds it per screen pixel: the mean of the clean epochs in that pixel (at least 10 s, so no
  speckle), 2.5 Hz of vertical smoothing, linear interpolation between the 0.5 Hz bins, then a display scale
  (`MT_TILT`, `MT_LO`, `MT_SPAN`) that lifts the low frequencies: awake is orange-red below 13 Hz, green-yellow in the middle,
  cyan above 20 Hz; a general anaesthetic is a red 4-13 Hz band, a yellow fringe and cyan above 22 Hz. Seconds the
  engine calls suppressed (`col.sp`) are black gaps (a pixel that is mostly suppressed is black, a mixed one is pulled
  towards blue), never rainbow spikes. SEF and MF are 2 px, held across suppressed seconds and smoothed over about 10 s:
  one unbroken line. The colour-range sliders (classic skin) still shift this scale. The image is drawn from a 1:1 offscreen
  canvas with smoothing off; the colour bar is a smooth gradient.
- **Time axis:** labels `hh:mm` at a fixed spacing from the case start (a whole minute: `MT.anchor`; 10 min on the 1 hour
  scale, 1 / 5 min on the 5 / 15 min scales), only inside the data area and never later than the newest column; the
  case-start label gives way to the next one if they would overlap. Clear Trend Data restarts the anchor.
- **Alarm:** the red bar shows when Target Range is **Active** and the shown BIS has been outside it for 10 s, at any depth
  (`outV` in `app.js`, not counted during the warm start). Target Alarm only decides the sound. **Target Range is Inactive
  by default** (the real monitor's default; it was Active for teaching). Turn it on in Menu > Target Range to hear the
  alarm. Sound (`mtSound`): square 880 Hz, 3 pulses every 2 s, gain from Alarm Volume; silent while the bell is yellow
  (the 2 min pause), the sound resumes by itself when the pause ends; silenced (red X) is silent with one reminder beep every
  3 min if Audio Off Reminder is on; isoelectric always sounds. Browsers keep audio locked until the first press, so the
  sound context is made on the first pointer press or key. `MT.sounding` and `MT.beeps` expose it to the tests.
- **Messages:** information bars (dark blue) have no Dismiss and clear after about 5 s; Dismiss only on the start-up bar and
  on a persistent yellow warning (poor signal / artefact), which then stays hidden until it clears. Sensor check opens with
  "Sensor Check in Progress" for a moment, then "Press electrode(s) n [ 13 ]" naming the electrodes not yet passed; MENU is
  inert during it; the five SQI bars light one per passing electrode (all five when all four pass).
- **Trend Review keys:** key 2 stays MENU (it leaves the review and opens the menu); key 3 reads TREND REVIEW EXIT. In Case
  mode Rewind and Advance move the review window by a quarter of its length (it is the whole case, at most 1 hour, so
  it only moves once the case is longer; `HISTMAX` is now 4 h); in Cursor mode they are Step Backward / Forward.
- **Smaller things:** BIS number 106 px (digits centred at y 105); EEG drawn 1.25 x so awake traces reach about 30 % of the
  box (the engine's awake EEG is small, sd about 10 uV); AMPL: awake fills a bit over half the panel, anaesthesia more
  (larger slow waves: the physiology runs this way, so it does not follow the reviewer's "anaesthetised 30-45 %"), dotted
  lines stop at x 490 so the label is clear; the small BIS trend behind a menu has a black axis band, ST in magenta with its
  own axis, the Target Range screen has light value boxes, a bullseye on its tile, the real X / green boxes and mini-graph
  format icons; View/Save Settings shows all 17 rows; Display menu has a "Main display:" panel with a layout thumbnail.
  Fonts: message bars, tiles and tables are Arimo (the bundled Arial look-alike); DejaVu Sans stays on the canvas axis labels
  and the SEF/MF header. (The reviewer's "DejaVu message text" was not reproduced: the page measures as Arimo.)
