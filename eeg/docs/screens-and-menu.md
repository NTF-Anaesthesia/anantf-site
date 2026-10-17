# Two-sided screens and the functional menu

Part of the BIS to DSA / processed EEG notes. Index: [../NOTES.md](../NOTES.md).

## Two-sided screens: BIS Advance style and SedLine style

- Pick the monitor in Display > Screen layout: BIS VISTA, BIS Advance, Masimo SedLine, Teaching layout. (BIS Advance was rebuilt on 14 Oct 2026: see "Medtronic BIS Advance" below; the text here about the old Advance box, its Menu list and the ASYM bar is history.)
- A second engine `R` runs the right hemisphere beside the left (the page's own variables). `swapCh()` exchanges the two
  sets of per-channel state around `step()` (`stepR`), so the single-channel code serves both. The right engine reads the
  page's settings through `modsR = Object.create(mods)` with its own `side`.
- "One-sided EEG slowing" (None / Left / Right) slows the chosen hemisphere (alpha and beta ×0.35–0.45, slow and delta up)
  so ASYM rises. ASYM here = 100·|PL−PR|/(PL+PR) over the last 30 s total power, shown as a bar.
- (History: the first SedLine and Advance screens were drawn from descriptions, on one shared canvas. Both have since been rebuilt from
  the manufacturers' own screen figures: see "Medtronic BIS Advance" and "Masimo SedLine" below.) The SedLine PSi is still a straight-line
  stand-in from the BIS teaching value (`psiOf`: BIS 40–60 → PSi 25–50); it is not Masimo's algorithm.

## The Menu is functional

The Menu button under the Teaching layout's screen opens an on-screen list (the Medtronic and Advance screens have their own tile menus, SedLine a Root-style menu tree, below); tapping an item steps
through its values: smoothing rate, EEG scale and sweep, trend window, bottom trend, DSA colour range (four presets), BIS
alarm low (20–50) and high (50–80) that set the "BIS Out of Target Range" message (`mon.alo`, `mon.ahi`; the message
also needs the teaching labels on), alarm audio, teaching labels, suppression timers (reset), sensor check, and the monitor
(VISTA, Advance, SedLine). Escape or Close shuts it. The soft-key row is only shown in the Teaching layout now.
