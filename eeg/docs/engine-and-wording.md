# Engine: drug mix, relaxant, tuning targets, wording, effect site, content

Part of the BIS to DSA / processed EEG notes. Index: [../NOTES.md](../NOTES.md).

## Drug mix

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

## Muscle relaxant

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

## Effect site, target slider, relaxant default, timers

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
- **EEG sweep and DSA colour range:** soft key cycles the EEG lane sweep auto/4/8/16 s (buffer 16 s); two sliders set the monitor DSA's colour floor and ceiling in dB (`mon.dbLo/dbHi`, default -3…31, at least 6 dB apart): raise the floor for bluer, lower the ceiling for redder. `dbToX` follows the user's range; `dbToXd` (default) is used by the teaching strips, quiz and explainer. Both are kept per device in `localStorage` (`bisdsa.disp`).
- **Relaxant on by default:** three modes (`mods.nmbMode`). **At induction** (default): given when the induced depth reaches
  0.3 (propofol/sevo depth, ketamine 0.45 dose, mix hypnotic or ketamine; dex alone never) and reversed under 0.25, so the
  awake patient still opens at BIS 90s and the awake paralysis is not on show; **Off** (EMG teaching); **On now** (the
  awake-paralysis pitfall). The engine derives `mods.nmb` from the mode each sample (`updNmb`); the Node checks set
  `mods.nmb` directly and leave `nmbMode` unset.
- **Suppression time box:** cumulative seconds with the shown SR at 5% or more, and with BIS under 40, this case (clean
  seconds only); Reset clears them and the case story starts them at 0. Not on the real monitor: a teaching aid for
  cumulative burst-suppression time (linked to postoperative delirium in observational data; trials are mixed).

## Medtronic BIS screen is the default

The reference is photos of a real Medtronic BIS 2-channel monitor (Medtronic, formerly Covidien; not a VISTA, so the
screen is labelled "Medtronic BIS"; the cabinet looks like the BIS Complete 2-channel). The internal ids still say
`vista`. The page opens on it; the detail is in the next section. Numbers the real screen does not show (SQI %, EMG dB, TP,
BC, zone) sit in the strip under it; "Teaching layout" in Display is the earlier screen (kept; the e2e test uses it for
most checks). `HIST` holds 60 min of columns. (The BIS Advance and SedLine screens, with ASYM and PSi, have since been built: see their sections below.)


## Lessons

- `fit()` reads each canvas's logical height once (`c._lh`): setting `canvas.height` rewrites the `height` attribute,
  so reading it every frame made the graphs grow until blank on high-density phones (14 Oct 2026). The test runs the
  phone at 3x density for that reason.

## Content

- Clinical text (state descriptions, pattern library, pitfalls, the case story) is in `app.js` and `index.html`.
  Facts to check with the owner before changing: BIS ranges, the age effect on alpha, ketamine and N2O behaviour.

- 14 Oct 2026 (owner): the forced-air warmer control and library card and the "Paradoxical excitation" card were removed (rarely seen); the engine still supports `mods.warmer` but nothing sets it. "Deep sevoflurane" card is now "Sevoflurane" (the depth is in the picture). The d<0.24 state is called "Very light sedation".

## Block readout and case length

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
