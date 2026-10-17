# Purpose, address and how it works

Part of the BIS to DSA / processed EEG notes. Index: [../NOTES.md](../NOTES.md).

## Purpose and audience

- Anaesthesia residents learning processed EEG: how the frontal EEG becomes the BIS number and the density spectral
  array (DSA), and how to read the DSA for propofol, sevoflurane, ketamine and dexmedetomidine.
- One static page, no data, no sign-in, no storage. Synthetic EEG only.
- **Look (owner, 16 Oct 2026, replacing "always dark"):** the page follows anantf.com's `DESIGN.md` (warm paper, ink, one wine accent, square edges, hairlines, Fraunces / Inter / JetBrains Mono from `../fonts/`, the real site header with pEEG current). Only the monitor screens stay dark, because they copy real equipment; everything outside them (switches, panels, strips, the controls under each screen in `adv.css` and `sed.css`) uses the light tokens in `:root`. Do not load `assets/navigation.css` here: it pulls in `couture.css`, whose `body .wrap .row button{min-height:44px}` and `.card`, `.bar` rules stretch the monitors' hit areas; `site-shell.css` and `header-nav.css` are enough for the header. BIS big on the left, SR/SEF95/EMG stacked on the right.
- Screen order like a BIS monitor: BIS and EMG trends, then DSA above, raw EEG below; a view
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
- Opens on an awake patient: 5 min of awake EEG pre-run so the DSA is full; slider at Awake.
- Monitor first: the page opens on the monitor (a small title above it), depth slider then drug
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
