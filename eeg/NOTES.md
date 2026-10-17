# BIS to DSA notes

Lasting decisions for `eeg/`. Status and next steps: `STATUS.md`.

## Purpose and audience

- Anaesthesia residents learning processed EEG: how the frontal EEG becomes the BIS number and the density spectral
  array (DSA), and how to read the DSA for propofol, sevoflurane, ketamine and dexmedetomidine (owner, 14 Oct 2026).
- One static page, no data, no sign-in, no storage. Synthetic EEG only.
- **Look (owner, 16 Oct 2026, replacing "always dark"):** the page follows anantf.com's `DESIGN.md` (warm paper, ink, one wine accent, square edges, hairlines, Fraunces / Inter / JetBrains Mono from `../fonts/`, the real site header with pEEG current). Only the monitor screens stay dark, because they copy real equipment; everything outside them (switches, panels, strips, the controls under each screen in `adv.css` and `sed.css`) uses the light tokens in `:root`. Do not load `assets/navigation.css` here: it pulls in `couture.css`, whose `body .wrap .row button{min-height:44px}` and `.card`, `.bar` rules stretch the monitors' hit areas; `site-shell.css` and `header-nav.css` are enough for the header. BIS big on the left, SR/SEF95/EMG stacked on the right.
- Screen order like a BIS monitor (owner, 14 Oct 2026): BIS and EMG trends, then DSA above, raw EEG below; a view
  toggle (DSA + EEG, DSA + BIS, EEG) shows one large.
- Monitor look (owner, 14 Oct 2026; made closer to a BIS Complete/VISTA, Oct 2026): bezel, status line ("BIS · Case
  AH5F", message region, clock), BIS with SQI and EMG segment bars, SR/SEF/TP/BC row, soft keys.
- **SQI** = 98 − 160 × share of artefact seconds in the last 63 s; 5 bars of 20 (green ≥ 50, amber 15–49, red < 15).
  An artefact second has any sample over 300 µV, or a diathermy burst or its 1-s settling tail. Artefact seconds are
  left out of BIS, SR, SEF and TP (TP holds). BIS shows hollow under SQI 50; under 15 BIS, SEF, SR, TP and BC show `--`
  and the BIS trend line breaks. 15 is the conventional blanking threshold; it is not stated in the Covidien manual.
- **EMG** (dB re 0.0001 µV², shown like the monitor's 70–110 Hz band): a parametric muscle term,
  `27 + 10·log10(1 + 12·tone + 52·emg + 250·diathermy share)` ± 1.5 dB. Tone is 1 awake (hypnotic depth under 0.3),
  falling to a residual 0.12 by depth 0.5, and 0.05 when paralysed (τ 5 s). Levels: awake ~38, GA ~31, relaxant ~29,
  facial EMG ~52, diathermy bursts +15–25 dB. Ketamine's gamma does not count. Not held during artefact. 4-bar bar:
  empty under 30 dB, then 30–38, 39–47, 48–55, over 55. The 30–47 Hz EMG power is still injected into the EEG, which is
  what pushes BIS up.
- **Diathermy**: 1–2.5 s bursts every 4–8 s of broadband noise clipping at ±400 µV, each followed by a 1-s decaying
  offset; bright DSA stripes; SQI settles around 15–35 (hollow, sometimes `--`).
- **Blinks and eye movement** (checkbox, off by default; Medtronic BIS reference guide): one-sided 300-ms deflections
  of 110–190 µV every 2–6 s (1 in 12 is 310–370 µV and trips the 300 µV artefact flag), plus a slow drift (SD 12 µV,
  τ 0.8 s). The DSA and raw EEG show them; BIS, SEF and SR use the epoch after the monitor's blink rejection, modelled
  as taking away 85% of the blink and drift the engine added (`EYE_REJ`; a proxy, the real detector is proprietary).
  Awake: SQI ~94, BIS ~89 (−4 to −6), 0.5–2 Hz much brighter. On in the case's pre-induction and emergence steps.
- **Surgical stimulus** (button; García 2021, Hight 2019): `Engine.stimulus(kind)`, a 100-s arousal applied to the
  target each sample. Blunting b = remi/4 (mix mode only; single drugs b = 0). Hypnotic depth under 0.5: beta at 18 Hz
  (`ar` term, +8·(1−b)) and facial EMG (unless paralysed), BIS +10–20. Depth 0.5 or more: alpha ×10^(−0.35·(1−b)) (an
  alpha dropout, about −3 dB in 8–12 Hz), or 1 in 10 a paradoxical delta arousal (delta ×2, beta ×0.5; BIS falls). The
  button shows pressed while it runs and the reading adds a sentence.
- **Messages** (`monMsg()`, wording from the BIS Complete manual): high (red, flashing; solid with reduced motion):
  "Isoelectric EEG Detected" (every second flat for 60 s), "BIS Out of Target Range – Low/High" (shown BIS outside
  40–60 for 10 s with a GA-level propofol/sevo hypnotic, depth ≥ 0.44, so not for sedation, dex or ketamine; once
  shown it clears only when BIS is back inside 42–58; only with the target band on); low (yellow): "Data unavailable due
  to poor signal quality" (SQI < 15), "Excessive Artifact Detected in Signal" (SQI < 50); info (grey): "Smoothing Rate
  Changed to xx Seconds" for 5 s. `#vMsg` is `aria-live`, updated only when the text changes.
- **Trend**: BIS thick white on a 0–100 left axis, EMG thin green on a 30–80 dB right axis, artefact bar along the time
  axis (amber SQI < 50, yellow blanked), clock times (hh:mm) at both ends. The monitor clock is sim time (the warm
  start ends at the real time), so the axis matches at any speed. Target band 40–60 "set by user" is a teaching
  default; real monitors default to Inactive.
- **DSA**: SEF95 white line and MF (SEF50, 50% of 0.5–30 Hz power) purple `#b47cff` line, numbers top right, δ θ α β
  labels on the right edge. SEF and MF (lines, numbers, SEF tile) are a moving mean over the smoothing window of
  unsuppressed, clean seconds, and blank (`--`) after 30 s without one (a long flat EEG). MF is drawn thinner at 70%.
- **EEG lane**: ±100 µV full height by default (50 µV/div; at ±50 about 11% of propofol GA samples clipped), soft key cycles ±25/50/100/250; about 5 s across on a
  phone, 8 s on a desktop, 1-s ticks; "ARTIFACT" (amber) during artefact seconds.
- **Smoothing** soft key 10/15/30 s (default 15): a moving average of the last N artefact-free raw values.
- **Teaching labels** (Display checkbox, on by default, per device in `localStorage` `bisdsa.teach`): the zone pill,
  the newest-2-s box, the newest-column outline, the colour key and the target band. Zone wording: over 90 Awake, 80–90
  Light/moderate sedation, 60–80 Sedation, 40–60 General anaesthesia, 20–40 Deep hypnotic state, under 20 Burst
  suppression / flat; "Suppression (SR n%)" whenever SR is above 0.
- Opens on an awake patient (owner, 14 Oct 2026): 5 min of awake EEG pre-run so the DSA is full; slider at Awake.
- Monitor first (owner, 14 Oct 2026): the page opens on the monitor (a small title above it), depth slider then drug
  right under it, smaller lanes on phones (`laneH`); the teaching intro follows.

## Address

- `anantf.com/eeg/` (this repo's folder `eeg/`, GitHub Pages), unlisted and `noindex`. Moved here from an earlier
  address on 16 Oct 2026 (owner); the old addresses forward here.
- Relative paths only, so the folder works wherever it is served.
- This folder is the copy to edit.

## How it works (`app.js`)

- `Engine`: a bank of oscillators every 0.5 Hz (0.5–47 Hz) with phase jitter, shaped by a spectral profile per state
  (1/f background plus slow, delta, theta, alpha, spindle, beta, gamma and EMG terms; burst suppression gates the
  signal). `DRUGS` holds keyframes along the depth slider; the live state glides to the target (about 8 s).
- 128 samples/s; every second the newest 2 s (256 samples) gets a Hann window and an FFT; bins 0–30 Hz become one DSA
  column (turbo colour map, -3 to 31 dB: awake is dim blue with speckle).
- Awake EEG is small (about 10 µV RMS, one shared `AWAKE` keyframe); propofol GA is about 3× the amplitude (Purdon
  2015: anaesthetised EEG has 5–20× the power).
- BIS shown is a **teaching model**, not the proprietary algorithm: a linear fit on SEF95, fast-power fraction,
  30–47 Hz fraction, slow and alpha fractions, pulled towards 30 by √(SR/40) while SR is under 40 (Bruhn 2000: BIS about flat there, near
  30, and never rising with depth), stretched, then averaged over the last 15 clean seconds. **Bruhn rule**: from SR
  40% BIS is at most `50 − SR/2`, which meets the pull at 30 with no jump. Suppression shows with BIS in the 30s.
- SR as in the BIS manual: each second is split into four 0.25-s sub-blocks; a sub-block is suppressed if it stays within
  ±5 µV of its mean; SR is the suppressed share over the last 63 s (`features().supFrac`). BC (bursts per minute) shows
  `--` when SR is under 5 or SQI under 50.
- Burst suppression gate (`Engine`): bursts last 0.5–3 s; flat runs last 1–3 s at `bs` 0.5, growing to 10–30 s near 1;
  above 0.97 the EEG is isoelectric. Propofol suppression starts after depth 0.8 in a young adult (0.68 when older).
- **Proxies (teaching-model honesty):** the stand-in BIS formula above; 128 samples/s (the real monitor samples faster);
  the EMG readout is a parametric muscle term, not the monitor's measured 70–110 Hz band (the 30–47 Hz muscle power in
  the EEG is what moves BIS; the intro and explainer step 1 say so); blink rejection as a fixed 85% subtraction; the
  warmer as a fixed noise term. SQI blanking at 15 is a convention, not in the Covidien manual.
- Check the tuning with `node eeg/test/engine.check.mjs` (runs the engine in Node, no browser, about a minute; also in
  the Checks workflow). It prints the table below, plus SQI, messages, MF and smoothing rows.
- The footer says it is a teaching approximation; keep that.

## Drug mix (owner, 14 Oct 2026)

- "Mix drugs" mode: sliders for propofol (effect-site µg/ml), sevoflurane (MAC), remifentanil (ng/ml), ketamine and
  dexmedetomidine (share of an anaesthetic / deep-sedation dose) and N₂O (%), plus presets. `mixTarget()`: propofol
  (×0.155 per µg/ml) and sevo (MAC → depth: 0.3→0.30, 0.5→0.44, 1.0→0.60, 1.5→0.76, 2.0→0.88; `sevoDepth`) add into
  one hypnotic depth (capped 0.95, 0.90 for sevo), blended between the two drugs' keyframes; dex and N₂O add a little
  depth; then ketamine, dex, remi and N₂O add their own signatures. Teaching approximation.
- Remifentanil barely moves BIS at rest (Guignard 2000); it blunts EMG and arousal. Only above 4 ng/ml does it add a
  little depth, and above 6 ng/ml some delta and slow power.
- Ketamine with a hypnotic: gamma and ~31 Hz beta on top, less alpha, less slow and theta; with little or no hypnotic it
  blends to the single-drug ketamine keyframes, so mix ketamine 100% reads like single ketamine. Ketamine anaesthesia
  alternates gamma bursts and slow-delta every 2–5 s (Akeju 2016).
- Dex: spindles 0.5–2 s every 3–8 s, centre 11–14 Hz per burst; much weaker slow power than propofol (Akeju 2014).
- N₂O: a little 30-Hz-ish gamma and beta, slightly less alpha and slow (Hirota 2006; Foster & Liley 2011), plus a little
  depth; sevo + N₂O reads within a few points of sevo alone.
- Older patient (Purdon 2015): all power lower, alpha about 9 dB lower and 1 Hz slower (0.5 Hz with sevo), and
  suppression appears at a lighter depth (the `bs` term is taken from depth + 0.12).

## Muscle relaxant (owner, 14 Oct 2026)

- "Muscle relaxant (paralysed)" removes the EMG term and most of the awake fast activity at once (stage 1: gamma
  ×0.05, beta ×0.25), overriding "Facial muscle activity". Stage 2 (`Engine.nmbS`): 60 s after the relaxant, while the
  hypnotic depth is under 0.3, a slow state rises with τ 120 s (falls with τ 30 s once the relaxant is off): beta and
  gamma fall further, beta slows, slow and delta power appear. Awake + relaxant: ~83 at 60 s, ~52 at 5 min, back above
  85 two minutes after reversal. This follows the volunteer studies: about 80 at once, then 44–47 minutes later
  (Schuller 2015), as low as 33, and 9 in one repeat (Messner 2003). Teaching point: a low BIS does not prove
  unconsciousness in a paralysed patient.

## Tuning targets (steady state, mean of the last 30 s; `test/engine.check.mjs`)

| State | BIS | Other |
|---|---|---|
| Propofol awake | 90–97 | SR 0; EEG RMS 8–12 µV; EMG 35–45 dB |
| Propofol 0.17 | 80–95 | beta (13–25 Hz) above awake |
| Propofol 0.57 | 40–55 | SEF95 12–17 Hz; RMS 25–40 µV and ≥ 3× awake |
| Propofol 0.76 | 30–42 | SR under 5 |
| Propofol 0.90 | 25–36, not above 0.76 | SR 15–55; not capped while SR < 40 |
| Propofol 0.57 > 0.76 > 0.88 > 0.95 | falls at each step | 3 seeds |
| Propofol 1.0 | 0–12 | SR 80 or more |
| Sevo 0.55 | 40–55 | theta peak 4.5–5.5 Hz; alpha 1–3 dB above propofol 0.55 |
| Sevo 1.0 | 15–40 | SR at most 60 (never flat) |
| Ketamine 0.65 | 65–82 | SEF95 ≥ 25; 13–24 Hz not above awake; EMG within 3 dB of awake-paralysed |
| Mix ketamine 1.0 vs single 1.0 | within 6 | |
| Propofol + ketamine preset | 58–70 | |
| Dex 0.4 / 1.0 | 55–72 / 40–58 | 0.4: 0.5–1 Hz ≥ 10 dB below propofol 0.57 |
| Older, propofol 0.57 | young +6 to +12 | 8–12 Hz 8–10 dB lower; alpha peak 0.6–1.4 Hz lower |
| Older, propofol 0.80 / 0.90 | | SR above 0 (young: about 0) / SR 40–95, not isoelectric |
| Awake + relaxant at 60 s / 300 s | 75–85 / 45–62 | EMG under 30 at 60 s; relaxant off again: above 85 after 120 s |
| Propofol 3 ± remi 4 | within 3 | |
| Sevo 0.8 + N₂O 0.6 vs sevo 0.8 | −2 to +3 | |
| Propofol 0.55 + EMG / + relaxant | 62–85 / 40–55 | EMG 48–58 / 25–30 dB; relaxant at 0.45 and 0.55 moves BIS ≤ 3 |
| Clean / diathermy 120 s | | SQI ≥ 90 / under 50; EMG in bursts ≥ 10 dB over clean |
| Propofol 1.0 for 120 s | | SR 100 and "Isoelectric EEG Detected" |
| Propofol 0.8 / propofol 0.35, dex 0.4, ketamine 0.3 | | "Out of Target Range – Low" ≥ 80% of 60 s / never |
| Every state | | MF < SEF95; propofol 0.57 MF 2–8 Hz |
| Smoothing 10 vs 30 s, awake → 0.57 | | within 5 of final ≥ 5 s sooner with 10 s |
| Awake + blinks | 80 or more | SQI ≥ 85; 0.5–2 Hz brighter |
| Surgical stimulus, propofol 0.57 / 0.3 | / rise ≥ 10 | 0.57: 8–12 Hz −2.5 to −4.5 dB; mix remi 4: rise under a third; delta arousal: BIS falls |

## Case story (`STORY`)

Pre-induction with blinks → propofol bolus (paradoxical excitation) → loss of consciousness (two bands) → too deep
(propofol 0.93: burst suppression; BIS in the 30s, under 30 once SR passes 40%, about 60 s in) → infusion reduced → incision with no opioid (alpha
dips, facial EMG, BIS up; surgical stimulus) → analgesia topped up (EMG gone; relaxant only if surgery needs it) →
diathermy for 60 s at 400 s (hollow, `--`, artefact bar; the spec asked for 20 s, but SQI looks back 63 s and only
falls under 50 after about a minute of diathermy) → emergence with blinks → end (570 s).

## Clinical wording and evidence (14 Oct 2026)

- Every clinical sentence follows the research pass (spec phase 2, WS6): relaxant in awake volunteers about 80 at once,
  then mid-40s (Schuller 2015; 33 and 9 in Messner 2003); older patients 2–3× smaller amplitude, alpha ~9 dB lower and
  ~1 Hz slower (Purdon 2015); Bruhn rule (SR 40%); remifentanil no BIS effect at rest (Guignard 2000); ketamine gamma
  27–40 Hz mostly above the 0–30 Hz DSA (Akeju 2016); dex spindles 9–15 Hz; sevo theta ~5 Hz from about 1 MAC; sevo
  at the slider end is "Very deep (over 2 MAC)" (SR 40–60, epileptiform spikes not simulated); single-drug sevo ticks
  read the mix MAC map backwards (0.5 ≈ 0.7 MAC, 0.75 ≈ 1.5 MAC, 1.0 over 2 MAC); BIS lag 15 s to over 2 min (Pilge 2006).
- Pitfall cards each end with a source line (DOI or PubMed links). New cards: "Read SR, not just BIS" (Bruhn 2000) and
  "Validated in adults" (Cornelissen 2015, infants).
- "What the trials say" table, each row linked by DOI: B-Aware 2004, B-Unaware 2008 / BAG-RECALL 2011, NAP5 2014,
  ENGAGES 2019, Balanced 2021 (delirium sub-study; primary outcome 1-year mortality no different, Short 2019), AAGBI/SIVA TIVA guideline 2018, NICE DG6.

## Effect site, target slider, relaxant default, timers (owner, 14 Oct 2026)

- **Fast induction, slow emergence ("unzipping"):** the slider and the mix sliders set a *target* dose. The engine's `de`
  (effect site) follows it with a first-order lag that is fast going up and slow coming down: `TAU_UP` = 12 s (a bolus)
  and `TAU_DOWN` = 120 s (waking takes a few minutes: BIS about 77 two minutes after stopping propofol from GA, above
  90 by five; real half-times are 2-3 min and longer after long infusions). Spectrum then glides to the effect-site state
  with a further 8 s, BIS smooths over 10/15/30 s; 4x/10x speed shortens it. Descriptions, the relaxant, the
  out-of-target alarm and the stimulus follow `de`, not the target. A drug change or a switch between one drug and the mix
  snaps `de`; the story's first step and `snap()` jump it. The **Emergence** key stops every drug (slider to 0, or the mix
  cleared) and shows the wake-up in the caption.
- **Depth slider = BIS target:** under the slider, "Target BIS ≈ n" is a forecast: a throwaway `Engine` started at the
  target, 36 sim-s, same features and `bisRaw` (`forecastBis`, ~70 ms, 180 ms after the last change). Where suppression
  is expected (`bs` over 0.02) it runs 90 s and uses the gate's long-run share for SR (mean flat run 2·10^(2(bs−0.5)) s,
  mean burst 1.75 s, 1/bs bursts a cycle), because flat runs last up to 30 s. It is within a few points of what the
  live monitor settles on. A green band on the track marks depths that settle at BIS 40-60 (17 short forecasts at depths
  0-0.8, one per timeout; recomputed when the drug, older-patient, facial-EMG or relaxant mode changes; none for ketamine
  alone). The ▲ under the track is the effect site; "settling" / "at target" says where it is.
- **Drag bubble:** while the depth slider is dragged (or moved by keyboard), a bubble over the thumb shows "BIS ≈ n" (green inside 40-60), read off a 21-point table (depths 0, 0.05 … 1.0) the zone computation now keeps, or a throttled forecast until the table is ready; it hides about a second after release. One-drug mode only: the mix sliders update the Target BIS line when they stop.
- **EEG sweep and DSA colour range (owner, 14 Oct 2026):** soft key cycles the EEG lane sweep auto/4/8/16 s (buffer 16 s); two sliders set the monitor DSA's colour floor and ceiling in dB (`mon.dbLo/dbHi`, default -3…31, at least 6 dB apart): raise the floor for bluer, lower the ceiling for redder. `dbToX` follows the user's range; `dbToXd` (default) is used by the teaching strips, quiz and explainer. Both are kept per device in `localStorage` (`bisdsa.disp`).
- **Relaxant on by default:** three modes (`mods.nmbMode`). **At induction** (default): given when the induced depth reaches
  0.3 (propofol/sevo depth, ketamine 0.45 dose, mix hypnotic or ketamine; dex alone never) and reversed under 0.25, so the
  awake patient still opens at BIS 90s and the awake paralysis is not on show; **Off** (EMG teaching); **On now** (the
  awake-paralysis pitfall). The engine derives `mods.nmb` from the mode each sample (`updNmb`); the Node checks set
  `mods.nmb` directly and leave `nmbMode` unset.
- **Suppression time box:** cumulative seconds with the shown SR at 5% or more, and with BIS under 40, this case (clean
  seconds only); Reset clears them and the case story starts them at 0. Not on the real monitor: a teaching aid for
  cumulative burst-suppression time (linked to postoperative delirium in observational data; trials are mixed).

## Medtronic BIS screen is the default (owner, 14 Oct 2026)

The reference is photos of a real Medtronic BIS 2-channel monitor (Medtronic, formerly Covidien; not a VISTA, so the
screen is labelled "Medtronic BIS"; the cabinet looks like the BIS Complete 2-channel). The internal ids still say
`vista`. The page opens on it; the detail is in the next section. Numbers the real screen does not show (SQI %, EMG dB, TP,
BC, zone) sit in the strip under it; "Teaching layout" in Display is the earlier screen (kept; the e2e test uses it for
most checks). `HIST` holds 60 min of columns. (The BIS Advance and SedLine screens, with ASYM and PSi, have since been built: see their sections below.)

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

## Lessons

- `fit()` reads each canvas's logical height once (`c._lh`): setting `canvas.height` rewrites the `height` attribute,
  so reading it every frame made the graphs grow until blank on high-density phones (14 Oct 2026). The test runs the
  phone at 3x density for that reason.

## Content

- Clinical text (state descriptions, pattern library, pitfalls, the case story) is in `app.js` and `index.html`.
  Facts to check with the owner before changing: BIS ranges, the age effect on alpha, ketamine and N2O behaviour.

- 14 Oct 2026 (owner): the forced-air warmer control and library card and the "Paradoxical excitation" card were removed (rarely seen); the engine still supports `mods.warmer` but nothing sets it. "Deep sevoflurane" card is now "Sevoflurane" (the depth is in the picture). The d<0.24 state is called "Very light sedation".

## Block readout and case length (owner, 14 Oct 2026)

- **Neuromuscular block** (`nm*` in `app.js`): rocuronium, effective concentration in ED50 units, two-exponential decay
  (fa 0.85, τ 10 and 70 min), Hill slope 4, effect-site lag; timed 6 times faster than real (`NM_K`) and labelled so.
  0.6 mg/kg gives T1 under 6% at about 25 min, 25% at 36 min, 95% at 90 min (real minutes). TOF count, TOFr and PTC are
  read from T1 (an approximation, stated as such). Buttons: rocuronium 0.6, top-up 0.15 mg/kg, sugammadex 2 and 4 mg/kg
  (each mg/kg removes 0.85 units, so deep block is only partly reversed by 2 mg/kg). "At induction" doses once when the
  patient goes under; Off clears the block; Infusion holds a full block. `mods.nmbK` (0-1) scales the EEG effects;
  Emergence gives sugammadex 2 mg/kg. The Node checks set `mods.nmb` directly and ignore `nm`.
- **Case length** (short / medium / long, default medium): the effect site empties with τ 120 s × (1 + (L−1)·sensitivity),
  L = 1, 2.5, 5; sensitivity propofol and dexmedetomidine 0.9, sevoflurane 0.5, ketamine 0.4, remifentanil and N₂O 0.
  A thin dashed "effect site" line on the trend lane (teaching labels on) shows the unzipping.

## Two-sided screens: BIS Advance style and SedLine style (owner, 14 Oct 2026)

- Pick the monitor in Display > Screen layout: BIS VISTA, BIS Advance, Masimo SedLine, Teaching layout. (BIS Advance was rebuilt on 14 Oct 2026: see "Medtronic BIS Advance" below; the text here about the old Advance box, its Menu list and the ASYM bar is history.)
- A second engine `R` runs the right hemisphere beside the left (the page's own variables). `swapCh()` exchanges the two
  sets of per-channel state around `step()` (`stepR`), so the single-channel code serves both. The right engine reads the
  page's settings through `modsR = Object.create(mods)` with its own `side`.
- "One-sided EEG slowing" (None / Left / Right) slows the chosen hemisphere (alpha and beta ×0.35–0.45, slow and delta up)
  so ASYM rises. ASYM here = 100·|PL−PR|/(PL+PR) over the last 30 s total power, shown as a bar.
- (History: the first SedLine and Advance screens were drawn from descriptions, on one shared canvas. Both have since been rebuilt from
  the manufacturers' own screen figures: see "Medtronic BIS Advance" and "Masimo SedLine" below.) The SedLine PSi is still a straight-line
  stand-in from the BIS teaching value (`psiOf`: BIS 40–60 → PSi 25–50); it is not Masimo's algorithm.

## The Menu is functional (owner, 14 Oct 2026)

The Menu button under the Teaching layout's screen opens an on-screen list (the Medtronic and Advance screens have their own tile menus, SedLine a Root-style menu tree, below); tapping an item steps
through its values: smoothing rate, EEG scale and sweep, trend window, bottom trend, DSA colour range (four presets), BIS
alarm low (20–50) and high (50–80) that set the "BIS Out of Target Range" message (`mon.alo`, `mon.ahi`; the message
also needs the teaching labels on), alarm audio, teaching labels, suppression timers (reset), sensor check, and the monitor
(VISTA, Advance, SedLine). Escape or Close shuts it. The soft-key row is only shown in the Teaching layout now.

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

## Case timeline (owner, 15 Oct 2026)

`timeline.js` (test `test/timeline.e2e.mjs`): a bar of the case under the monitor switch and buttons −15, −5, −1, +1, +5, +15 min;
a tap on the bar jumps there. It works the same on every monitor.

- Forward runs the simulation on at full speed (app.js's own `step()`, in 1 s steps, 60 s per slice so the page stays alive;
  about 6 s for 15 min on a laptop). It is a new run, not a replay.
- Back: every 30 s of simulated time a save point keeps both engines and their per-channel state, the relaxant model, the case
  story and the drug controls. A jump back restores the last save point at least 20 s before the chosen time (so the EEG buffer
  refills), cuts the trend history there and runs on to the exact second. The drug controls go back to what they were then.
- What came after is dropped (shown hatched on the bar, "… ahead was rewound"); marks made in it (Medtronic gaps, BIS Advance
  snapshots and events, SedLine gaps) go with it. The start of the case (the page's first live second) is the earliest point.
- Drug-control changes show as yellow ticks on the bar. Medtronic keeps DSA + AMPL under the DSA (owner, 15 Oct 2026).

## 16 October 2026 — focused Processed EEG simulator

The owner requested `/eeg/`, title “Processed EEG simulator”, fewer controls and a full-screen teaching workspace. `/bis/` redirects, including query and hash. Older links in separate apps intentionally remain valid through that redirect.

The primary controls are monitor choice, anaesthetic, depth, playback speed, pause, induction, emergence and one native time slider. Patient/artefact and display options are collapsed. Detailed rocuronium/sugammadex dosing, case length, duplicate monitor selectors, step-time buttons and equipment fault toggles are removed from the interface. The muscle suppression toggle retains the EMG-confounding lesson without dosing. The engine retains its internal block/washout models with fixed defaults; this is not a dosing simulator.

BIS Vista is labelled correctly. BIS Advance has a direct unilateral (2-channel sensor) / bilateral (4-channel sensor) selector; selecting a monitor no longer resets the patient. The guided demonstration focuses on induction, maintenance and emergence. Timeline rewind rebuilds the recent DSA from retained history. Forward motion after rewind remains a new simulation, not exact replay.

`demo.js` owns the compact control layout and browser full-screen/CSS fallback. The same controls remain mounted in presentation mode. On narrow screens the monitor scrolls above a compact control area. Existing clinical teaching text and synthetic-engine limitations remain.

Validation: `node eeg/test/engine.check.mjs`; `node eeg/test/demo.e2e.mjs` with `BIS_VIEW=phone` and `desktop`. The new UI suite replaces the old button-driven browser gates, which refer to deliberately retired controls. Legacy monitor test sources remain as reference for future migration. The new suite covers induction/emergence, rewind, keyboard seeking, all five monitors, both Advance channel configurations, drug combinations, fullscreen and the old-address redirect.

## 16 October 2026 — monitor size correction after live review

The simplified layout shipped with an intrinsic-size regression: auto margins on the monitor grid, combined with inline-size-contained device LCDs, left no useful intrinsic width. At a 1440 × 900 viewport the actual LCD widths were 32 px (Vista), 209 px (Advance), 49 px (SedLine) and 14 px (IntelliVue); fullscreen could collapse to zero. The earlier browser suite checked visibility, which did not detect this. A design-critique review also found that the sidebar, wide bezels and optional settings competed with the signal display.

The workspace now has an explicit full width and a measured stage. `fitMonitor()` fits each complete device to that stage while preserving its proportions; Teaching allocates actual canvas heights to the available space. Essential controls form one dock below the monitor, moving to the side on short landscape screens. The stage grows in fullscreen, with controls still reachable. Optional explanations/settings sit below the workspace; drug-combination sliders move into the fullscreen dock when selected. Slimmer Advance/IntelliVue bezels and a smaller Advance asymmetry panel give the EEG/DSA more space.

Advance starts with the existing five-minute EEG history and labels the short trend window in minutes. Both unilateral and bilateral configurations remain available. Saved BIS Vista selection now restores correctly. No engine, dosing or physiology equations changed.

`test/layout.e2e.mjs` checks all five monitors in page and fullscreen at 1440 × 900, 1366 × 768, 1920 × 1080, 1024 × 768, 390 × 844 and 844 × 390. It measures usable LCD area, viewport clipping and dock overlap, plus saved selections, initial Advance DSA history, alternate Teaching views and reachable fullscreen combination sliders. It is a CI gate alongside the induction/emergence interaction suites.

## 16 October 2026 — control and navigation refinement

The owner's follow-up screenshots showed that the large monitor was working, but the surrounding interface still read as a dense form. The design-critique review identified three competing settings columns, repeated instructional copy, strongly outlined selectors, and inconsistent button emphasis. The refinement applies the requested calmer, Apple-inspired hierarchy while retaining the site's warm paper, wine accent and square surfaces.

- The toolbar contains monitor choice, a labelled settings icon and an enter/exit-fullscreen icon. SVG icons share stroke weight and 44 px targets, with tooltips and keyboard focus states.
- Anaesthetic and depth form one group in the dock. A single transport group contains play/pause, elapsed time, timeline and a speed popover. Induce, Emerge and a compact Demo action remain available for teaching.
- The settings sheet contains Advance channel selection, patient/artefact options, display adjustments and observation notes. It is a native modal dialog inside the fullscreen workspace, with keyboard focus containment, Escape/outside-click dismissal and focus return. On phones it becomes a bottom sheet.
- Removed both requested timeline instructions and the three inline settings columns. A rewind note is available on the time readout's tooltip. Drug combinations keep the anaesthetic picker available so the user can leave combination mode.

`test/controls.e2e.mjs` checks icons and target sizes, settings interactions, both Advance channel modes, keyboard focus, Escape, reachable/unobscured speed sliders, timeline keyboard control and leaving combination mode at desktop, portrait-phone and landscape-phone sizes. The existing layout and induction/emergence suites remain CI gates.

## 17 October 2026 — teaching layout and combination choices

Each page load now opens BIS Advance with the unilateral sensor, regardless of a legacy saved monitor choice. A visible Unilateral / Bilateral segmented control sits beside the monitor selector (under it on phones). The monitor choices are Advance, SedLine, IntelliVue, Vista and Teaching.

The desktop monitor is left-aligned, with live “What to observe” notes on its right. At tablet/phone widths the notes follow the monitor and controls. Fullscreen retains this layout; on phones the notes remain reachable by scrolling below the live workspace. Short landscape screens keep controls and the patient fold in the side dock so the monitor can use the full height.

“Patient & artefacts” is collapsed below the main controls. It retains older age, facial EMG, diathermy, one-sided slowing and surgical stimulus. The blink and separate muscle-suppression checkboxes are removed. Display adjustments remain in the gear sheet.

Combination mode now offers four examples: propofol/remifentanil, propofol/ketamine, sevoflurane/N₂O and propofol/dexmedetomidine. Six dose sliders and the duplicate Clear action are removed. Selecting an example applies its existing targets and resumes the simulation; the EEG/DSA evolves through the same effect-site model. Emerge clears the targets and Induce recalls the chosen example. Timeline snapshots retain that choice, including while emerging.

Visual review exposed a display issue in Advance: its fixed frequency-dependent colour boost produced strong slow/alpha bands even at the awake baseline. Advance now maps the simulated spectral power through the selected dB range, retaining its device palette, averaging and suppression rendering. The physiology and BIS equations are unchanged. The interaction test checks that the awake display lacks fixed warm bands and that induction develops them.

Validation: engine tuning, desktop/phone induction-emergence suites, keyboard/control checks and all five monitor layouts in page/fullscreen at six viewport sizes. The layout tests now cover the default unilateral landing state, direct channel buttons and reachable preset choices. Control checks cover desktop/right versus mobile/below observations and the bottom patient fold.
