# anantf.com: layout

What each folder is. Linked from `AGENTS.md`.

| Path | What it is | Listed on homepage? |
|---|---|---|
| `index.html` | Homepage | — |
| `exams/`, `exams.html` | Moved to the `exams` repo (https://exams.anantf.com, 24 Oct 2026). Here: redirect pages only; nav label "Exam Prep" links there | — |
| Regional anaesthesia app (all regional folders) | Moved to the `regional` repo (https://regional.anantf.com); redirect stubs stay here | — |
| `mo/`, `babymo/`, `qbank/` | Moved to the `mo` repo (mo.anantf.com, 23 Oct 2026). Here: redirect pages and retired service workers only | No (unlisted) |
| `draft.html` | Drafts hub: unreviewed teaching pages, not linked from anywhere | No (unlisted) |
| `pocus/` | Moved to the `pocus` repo (https://pocus.anantf.com, 24 Oct 2026). Here: redirect pages only | In main navigation (noindex), links there |
| `eeg/`, `bis/` | Moved to the `eeg` repo (https://eeg.anantf.com, 24 Oct 2026). Here: redirect pages, plus `eeg/fonts/Hind-*.woff2` and its README, which the TCI pump still loads | In main navigation (noindex), links there |
| `ot/` | Operating-theatre simulator for teaching: a general anaesthetic, the vitals monitor and crisis scenarios (one static site, synthetic physiology, no data). Moved from an earlier address on 16 Oct 2026. Start with `ot/NOTES.md`, then `ot/PLAN.md`; run `tools/test-ot.sh` | No (unlisted, noindex) |
| `tci/` | TCI emulator for teaching: propofol Eleveld, Schnider and Marsh on a Space plus-style pump; bolus matcher, maintenance simulator, calibration against a real pump. Built output only: the source, oracle, tests and research notes are in `apps/tci/` (start with `apps/tci/README.md`; rebuild with `npm run build` there) | No (unlisted, noindex) |
| `tci/pump/` | Space plus Perfusor teaching emulator: an operable virtual syringe pump running propofol TCI (Schnider, Eleveld, effect site), built from `apps/tci/pump/` and `apps/tci/src/pump/`; notes in `apps/tci/docs/PUMP.md`. Linked from the TCI app's Pump tab and More list only | No (unlisted, noindex) |
| `apps/tci/` | Source of `tci/` and `tci/pump/` (Vite + TypeScript, multi-page), the Python oracle, tests and `docs/` (references, research notes, real-pump test questions, pump emulator notes) | — |
| `edit.html` | Page editor for the maintainers (see "Edits sent from the page editor") | No (unlisted, noindex) |

The NAPS 2026 site is a separate repo (NTF-Anaesthesia/naps2026-site).
