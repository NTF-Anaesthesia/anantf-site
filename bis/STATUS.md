# BIS to DSA status

Short and current. Lasting rules go in `NOTES.md`. Update with `/save-state`.

Last updated: 2026-10-15 by Claude Code (IntelliVue, case timeline, look pass).

## Now

Each session keeps its own line in `status/<session>.md`. Read them before starting; edit only yours.

## Waiting on the owner

- Clinical read-through of the wording and BIS ranges.

## Next (ideas, not agreed)

1. More states: nitrous oxide, opioid-heavy, hypothermia.
2. Owner to compare each skin with his own unit or photos (only the Medtronic one was built from the owner's photos); known gaps per skin are in `NOTES.md`, "The three monitor skins at a glance".
3. Planned with the owner, not started: DSATrainer-inspired additions (CSA and power-spectrum panels, ECG R-wave bleed-through case,
   multitaper option, burst-suppression parameters), built our own.
4. IntelliVue: alarm sounds, SQI triangle / EMG bar (Release L+) if the owner wants them.

## Recently done

- 15 Oct 2026 (owner feedback from phone use), all merged: #585 Medtronic/Advance DSA colours (saved colour range ignored),
  Advance opens on the main screen, DSA + EEG by default, monitor switch at the top; #588 SedLine EEG flicker fixed and EEG
  from the simulation, SedLine font Hind, device cases around each monitor, Medtronic opens with 35 min of earlier trend,
  finer Advance DSA grain; #591 Philips IntelliVue screen (no DSA: IntelliVue has none); #595 case timeline (jump back and
  forward 1, 5, 15 min; tap the bar) and a paler IntelliVue yellow. Owner: Medtronic keeps DSA + AMPL.

- Final integration of the three skins (14 Oct 2026, local commits, not pushed): all checks green (repo check, proofread, engine check, full e2e including the Advance and SedLine tests); a race in the Advance battery-low test fixed (it read the text before the next frame; assertion unchanged); NOTES has a table of what is cloned from evidence, inferred or unknown for each skin; fonts listed with licences; no reference images or manual text in the repo.

- BIS Advance screen rebuilt (14 Oct 2026, local commits, not pushed) as a 16:10 near-clone from the manual figures and 2021 marketing screens: two-channel and four-channel layouts, tile menu tree, dialogs, alarms and messages, sensor check, chart view, case review, demo mode, bundled Selawik. Detail: `NOTES.md`, "Medtronic BIS Advance".

- Masimo SedLine screen rebuilt as a Root (800 x 1280 portrait) near-clone from Masimo's manuals and screen figures (14 Oct 2026, local commits, not pushed): status bar, four-channel EEG sweep, EMG / PSi / SR trends, DSA with ASYM, suppression and artefact marks, history bar, analog view, electrode strip, PSi alarm and window messages, Root-style menu tree with the manual's names and defaults, bundled Source Sans 3. Detail and what is unverified: `NOTES.md`, "Masimo SedLine".

- Medtronic screen fidelity pass (14 Oct 2026, local commit, not pushed): DSA rebuilt (1 px columns, display scale, suppression gaps), 1 hour time axis with 10 min labels, alarm that sounds and gates like the manual (Target Range now Inactive by default, Trend Time Scale default 1 hour: the owner may want either back; both are one-line changes in `MT` / `mtDefaults`), menu and sensor-check details. Detail: `NOTES.md`, "Fidelity pass".

- Two-sided screens (BIS Advance style, SedLine style) with a right-hemisphere engine and a one-sided slowing control (14 Oct 2026). Menu made functional (on-screen list, alarm limits). Queued: photos of Advance and SedLine screens to tighten the layouts; DSA suppression and artefact marks for SedLine.

- BIS VISTA-style screen as the default (owner's photos, 14 Oct 2026); the earlier layout stays as "Teaching layout". Queued: relaxant top-up with PTC/TOF readout, long vs short case emergence, machine switch.

- Effect-site lag fast up (12 s) and slow down (120 s) so emergence unzips slowly and induction is quick, plus an Emergence key; depth slider shows the target BIS (forecast), effect-site marker and a green 40-60 band; relaxant default "At induction" (Off / On now keys); suppression and BIS<40 time box.

- Moved to `anantf.com/bis/` (16 Oct 2026, owner); the old anawj addresses forward here.

- Phase 2 (14 Oct 2026, branch ccr-0e0d2acf-njkx9t): relaxant two-stage fall, remifentanil and Bruhn rules, drug
  spectra refit, `test/engine.check.mjs`; SQI/EMG/messages like the monitor; trend, DSA MF, EEG scale, smoothing;
  new scenarios (forced-air warmer, blinks, surgical stimulus button, case story with incision, diathermy and blinks;
  13th library card); clinical wording corrected with sources, new pitfalls and a "What the trials say" table.
- #495: graphs blank on phones fixed (canvas height grew every frame); always dark; BIS-style readout.
- Monitor like a BIS screen: DSA above, EEG below, view toggle, EMG trend.

- First version: live monitor, five-step "how one DSA column is made" animation, pattern library, quiz, pitfalls.
