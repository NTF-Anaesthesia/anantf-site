# anantf.com: layout

What each folder is. Linked from `AGENTS.md`.

| Path | What it is | Listed on homepage? |
|---|---|---|
| `index.html` | Homepage | — |
| `exams/index.html` | MMed exam resources by Dr Chew Shi Hao (his design); nav label "Exam Prep" | In main navigation (noindex) |
| `exams/reference/*.pdf` | Part B model-answer PDFs | — |
| Regional anaesthesia app (all regional folders) | See shared/regional/INDEX.md and shared/regional/docs/layout.md | — |
| `shared/vendor/three-r160/` | three.js (r160) and its Draco decoder, used by `brachial-plexus/` and `plexus/` through their import maps (moved from `brachial-plexus/vendor/three`) | — |
| `babymo/` | Baby MO test, also at mo.anantf.com/test/ (see `MO.md`; nothing in the app depends on the address): the department's MCQ test for new medical officers (MOs enter a name and a shared passphrase; faculty see results, the read-only paper, people and settings in the app). Own Firebase project `ntf-mo-portal` (sign-in, settings, results); its questions come from `qbank/papers/babymo.json` and `qbank/bank/questions.json`, and nobody edits questions in this app (faculty suggest changes through `qbank/`). Start with `babymo/NOTES.md` | No (unlisted) |
| `qbank/` | Question bank: the department's shared MCQs (`bank/questions.json`, one format with permanent ids), the papers made from it (`papers/`), and the qbank app at anantf.com/qbank/. Start with `qbank/NOTES.md`. Questions are public | No (unlisted) |
| `worker/`, `wrangler.jsonc`, `.assetsignore`, `MO.md` | The Cloudflare Worker behind `mo.anantf.com` (serves `mo/` at its root, `babymo/` at `/test/`, the shared kit and fonts and the question bank's data; every other path forwards to anantf.com). Only that one address uses it; anantf.com stays on GitHub Pages. Start with `MO.md`; test `node worker/test/routes.test.mjs` | — |
| `mo/` | For new MOs: a plain landing page (`mo/index.html`) linking the MO guide and the Baby MO test; one retired service worker (`mo/sw.js`) that moves phones off the old install, never stamp it. The guide itself is in `mo/guide/` (anantf.com/mo/guide/ and mo.anantf.com/guide/) | No (unlisted) |
| `mo/guide/` | MO guide: the practical learning app for new medical officers (handbook and beyond: learn topics, drug doses by weight, crisis cards, calculators, scenarios, flashcards; progress on the phone only). Start with `mo/NOTES.md`; content format in `mo/CONTENT.md` | No (unlisted) |
| `draft.html` | Drafts hub: unreviewed teaching pages, not linked from anywhere | No (unlisted) |
| `pocus/{basics,cardiac,lung,haemodynamics,shock,efast,dvt,cases}/` | Themed critical care POCUS lectures with simulations, cases and licensed media; start with `pocus/README.md` | On the POCUS hub (noindex kept) |
| `pocus/media/` | Clinical media catalogue and per-asset licence/attribution manifest | Linked from POCUS and the lectures |
| `eeg/` | Processed EEG teaching simulator: processed EEG on Medtronic BIS, BIS Advance, Masimo SedLine and Philips IntelliVue screens, with a timeline (one static page, synthetic EEG, no data). Moved from an earlier address on 16 Oct 2026. Start with `eeg/NOTES.md`; tests in `.github/workflows/checks.yml` | In main navigation as "EEG" (noindex kept) |
| `ot/` | Operating-theatre simulator for teaching: a general anaesthetic, the vitals monitor and crisis scenarios (one static site, synthetic physiology, no data). Moved from an earlier address on 16 Oct 2026. Start with `ot/NOTES.md`, then `ot/PLAN.md`; run `tools/test-ot.sh` | No (unlisted, noindex) |
| `tci/` | TCI emulator for teaching: propofol Eleveld, Schnider and Marsh on a Space plus-style pump; bolus matcher, maintenance simulator, calibration against a real pump. Built output only: the source, oracle, tests and research notes are in `apps/tci/` (start with `apps/tci/README.md`; rebuild with `npm run build` there) | No (unlisted, noindex) |
| `tci/pump/` | Space plus Perfusor teaching emulator: an operable virtual syringe pump running propofol TCI (Schnider, Eleveld, effect site), built from `apps/tci/pump/` and `apps/tci/src/pump/`; notes in `apps/tci/docs/PUMP.md`. Linked from the TCI app's Pump tab and More list only | No (unlisted, noindex) |
| `apps/tci/` | Source of `tci/` and `tci/pump/` (Vite + TypeScript, multi-page), the Python oracle, tests and `docs/` (references, research notes, real-pump test questions, pump emulator notes) | — |
| `edit.html` | Page editor for the maintainers (see "Edits sent from the page editor") | No (unlisted, noindex) |

The NAPS 2026 site is a separate repo (NTF-Anaesthesia/naps2026-site).
