# Processed EEG simulator redesign (16-17 Oct 2026)

Part of the BIS to DSA / processed EEG notes. Index: [../NOTES.md](../NOTES.md).

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

## Selectable learning examples (17 October 2026)

`teaching.js` supplies seven fresh-timeline EEG examples, with alpha dropout first, and four drug families with selectable comparisons. Examples prefill five minutes of stable EEG so a transient can be compared against a baseline. Explicit alpha/delta/beta stimuli remove the random response selection for teaching; the manual stimulus remains available. The timeline restores lesson state and the selected drug comparison. Induce restores the selected comparison after emergence.

Sources: Hight 2019 (PMID 30915994, alpha dropout); García 2021 (33461725, arousal patterns); Purdon 2015 (26275092, EEG signatures; 26174300, ageing); Guignard 2000 (10624998, remifentanil and stimulation); Sengupta 2011 (22428494, dose-dependent ketamine BIS effects); Zhang 2021 (34879867, dexmedetomidine adjunct); Pavone 2015 (26118489, nitrous oxide transition).

The mixture model is illustrative, not validated pharmacokinetic/pharmacodynamic dose prediction. Ketamine and dexmedetomidine selections use relative effect levels, not bolus or infusion prescriptions. Dex adjunct alpha-power/frequency changes are not fully represented. Nitrous oxide steady mixtures do not simulate the transient slow-delta signature of switching from sevoflurane to high-concentration nitrous oxide. A higher or lower processed index cannot establish awareness, nociception or equivalent hypnotic depth. The UI states these limitations alongside each comparison rather than relying on a generic disclaimer.

Validation: `node eeg/test/engine.check.mjs`; browser suites `controls.e2e.mjs`, `demo.e2e.mjs`, `layout.e2e.mjs`, and `teaching.e2e.mjs`. Teaching tests verify alpha dropout/recovery at unchanged target, timeline restoration, all example entry points, all mixture selections, re-induction and phone access.

## Unified EEG learning controls (17 October 2026)

Design critique: the monitor hierarchy works, but guided examples and live patient/artefact controls split the same learning concepts across two locations. A second stimulus button added duplication; new blue/rounded teaching styles also conflicted with the site's warm-paper/wine system.

Patient and artefact controls now live inside EEG examples under “Adjust current EEG”. The example picker groups Patterns, Patient and Artefacts, and the labelled Run action distinguishes starting a fresh example from pausing/resuming playback. All original live controls remain (older patient, EMG, diathermy, left/right slowing and stimulus); active changes remain visible in the closed summary. Manual changes stop scripted continuations so a lesson cannot silently overwrite the user's adjustment. The duplicate mixture stimulus action is removed; the shared surgical-stimulus control works for every drug mode. Drug families, dose comparisons and teaching notes remain intact. The monitor and primary transport retain their allocated space.

## Single picker and integrated observations (17 October 2026)

Removed the visible EEG examples heading, the separate Adjust current EEG section and the Teaching point fold. One disclosure now contains mutually exclusive pattern radios and stackable age/EMG/diathermy checkboxes, plus the existing asymmetry and stimulus controls. Run starts the selected pattern while retaining checked overlays; scripted steps preserve those overlays and timeline snapshots retain them. Teaching explanations and references appear with the main observation text; mixture comparisons keep their controls but share the observation area for explanations. Escape and outside clicks close the picker. Manual anaesthetic changes clear stale pattern teaching context.

## 17 October 2026 — accuracy review and mobile presentation

Medical review corrected overconfident statements about arousability under dexmedetomidine, age-related index changes, EMG and paralysis, and an isoelectric tracing. Low BIS does not establish unconsciousness; a frontal processed-EEG monitor cannot diagnose brain death. Unexpected suppression calls for assessment of physiology and signal quality together. Text distinguishes lower power from lower amplitude and avoids prescribing anaesthetic changes from a single pattern. The library labels its BIS ranges as model values; all device indices, including PSi, are synthetic.

The BALANCED delirium result is correctly identified as the primary outcome of the delirium sub-study, distinct from the parent trial's mortality endpoint (Evered 2021, PMID 34465469). NAP5 rates are identified as spontaneously reported awareness. NICE DG6 has moved to HTG292 with unchanged guidance; the link is updated.

The propofol–dexmedetomidine teaching model now moves alpha power and frequency down with an adjunct at constant propofol, alongside increased slow activity (Zhang 2021, PMID 34879867; qualitative direction, not a validated dose-response mapping). Seeded spectral checks verify the generated alpha peak, alpha power and slow power. Purdon 2015 (PMID 26174300) supports the age-related power/frequency explanation. Existing alpha-dropout and arousal references remain Hight 2019 (PMID 30915994) and García 2021 (PMID 33461725). Rewind now restores the pattern selection and teaching context together with the engine state.

On phones, fullscreen becomes a focused presentation with safe-area padding, warm app surfaces, touch feedback, a fixed control dock and modal learning/settings sheets. The existing notes and controls move into the learning sheet, so nothing is duplicated. Running a pattern closes the sheet and returns to the monitor; Escape closes the sheet without leaving presentation mode. Desktop and normal mobile pages retain their previous notes placement.

BIS Advance in portrait uses an adapted layout: large index values, DSA and raw EEG fill the stage instead of shrinking the equipment bezel. `mobile.js` uses the existing Advance DSA cache, histories and raw samples; it has no separate signal or index model. Bilateral mode shows both hemispheres. Landscape retains the equipment view with a side dock. This is an in-page/fullscreen presentation, not an installed PWA; browsers without the Fullscreen API retain their own browser chrome.

Validation: engine spectral regression, full existing browser suites, dedicated 320×640 and 390×844 presentation checks, and manual Chrome visual review of desktop, portrait/bilateral, learning/settings sheets and landscape. Browser tests cover modal focus, Escape, Run with overlays, restored notes, canvas allocation and controls remaining on screen.

## 17 October 2026 — preserve the original monitor in fullscreen

The user rejected the adapted portrait BIS Advance display above. Removed that alternate renderer and its CSS/script entirely. Fullscreen now uses the same original 16:10 LCD, monitor controls, numerical panels, DSA/ASYM and raw-EEG regions as the page, in unilateral and bilateral modes. Only the surrounding application controls respond to viewport size. The stage fitter subtracts its padding before sizing the device.

Desktop fullscreen is the priority: a large monitor on the left, observations on the right and essential controls below. Layout regression checks compare the positions of the original LCD regions before and after fullscreen, both sensor modes, at desktop and phone sizes. Existing control, teaching and medical-model checks remain in place. No further mobile display redesign is introduced.

### Desktop column fit repair (17 October 2026)
The height-fitted monitor previously shrank inside a full-width grid column, leaving hundreds of pixels between the case and observation notes. The desktop grid now uses the fitted case width for its first track and gives remaining width to the notes, separated by 16px. Fit calculations start from the whole row minus the minimum notes width, avoiding a resize feedback loop and allowing the monitor to grow again. Controls share the device width. Sizing regression checks the actual case-to-notes gap and dock alignment, including 1280px laptops and 2560px desktops, in page and fullscreen modes.

## 19 October 2026 — awake is not all blue; SedLine dock

Feedback from a consultant colleague (WhatsApp, with the owner's screen recording): the awake DSA was uniformly blue, but a
real awake patient shows strong delta and theta before induction. The awake picture also varies with eyes open or closed,
anxiety and dementia. Reference shared: Purdon 2013 (doi:10.1073/pnas.1221180110; focus is anaesthesia, not awake EEG).

- Engine: an awake patient with eyes open now makes eye movements and small blinks on their own (`Engine.eyeK`, 0.5 of the
  blink control's size, never over 300 µV). It fades from depth 0.08 to 0.2 and stops under a relaxant (no eye or lid
  movement when paralysed). The `AWAKE` keyframe gains a little frontal theta (5.5 Hz) and a slightly stronger beta band.
  Awake now reads about 18/16/10 dB at 1/2/4 Hz and 6 dB in beta, against GA slow power about 24 dB, so GA is still
  clearly hotter. BIS, SEF and SR still use the epoch after eye rejection (`EYE_REJ`), so awake BIS stays 90-93; the
  "Target BIS" forecast now applies the same rejection (it read 82 when awake).
- `engine.check.mjs` measures EEG RMS with the eye-movement artefact removed; every tuning target is unchanged.
- Layout: on desktop the monitor column is at least 600 px (`DOCK_MIN` in `demo.js`), so a portrait device (SedLine) no
  longer squeezes the control dock into overlapping rows. The notes follow the column edge.
- Awake text (live notes and library card) now says what an awake DSA shows and why it varies.

## 19 October 2026 (later) — SedLine full height

SedLine is portrait, so on desktop (over 1100 px) it fills the whole left column at full height, in page and fullscreen.
The control dock moves to the top of the right column, above the notes (CSS in `demo.css`; `.live-workspace` becomes
`display:contents` for that skin). `fitMonitor()` now grows the device back if a shrink step undershoots the height. The
awake note no longer ends with the SEF95/BIS sentence and reference. The BIS Advance EEG lane's 1 s dotted gridlines stay
fixed to the frame while the trace scrolls.

Revised the same day: the right column now runs title and toolbar (top), notes, then the control dock (bottom). `#monitor`
is the grid for SedLine on desktop (over 1100 px wide and over 550 px tall), with `.sim` and `.live-workspace` as
`display:contents`, so the monitor starts level with the title. `--monitor-width` is now set on `#monitor`.
