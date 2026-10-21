# NTF Anaesthesia resources — anantf.com

Static site served by GitHub Pages at https://anantf.com.

| Path | What it is |
|---|---|
| `index.html` | Monochrome ana ntf landing page and clinical resource navigation |
| `resources.html` | Searchable learning library |
| `airway.html` | Airway learning and NAPS model collection |
| `regional.html` | Regional anaesthesia learning |
| `blocks/` | Regional anaesthesia app front door: operation chooser and search across every region (unlisted; card on `regional.html`) |
| `truncal/`, `head-neck/`, `lower-limb/` | Regional block pages by region, on the shared engine (unlisted; cards on `regional.html`) |
| `brachial-plexus/`, `plexus/`, `spinal/` | Brachial plexus app, plexus anatomy in 3D and spinal anaesthesia (unlisted; cards on `regional.html`) |
| `shared/regional/` | Shared regional engine: app bar, levels, block template, scan viewer, block registry, operation data (see `shared/regional/DATA.md`) |
| `shared/vendor/three-r160/` | three.js used by the 3D viewers |
| `shared/regional/test/` | Tests for the regional pages (`node shared/regional/test/run-all.mjs`) |
| `pocus/` | Point-of-care ultrasound tutorials |
| `exams/` | MMed exam resources by Dr Chew Shi Hao (canonical master copy) |
| `exams/reference/` | Part B model-answer PDFs (the SAQ bank; used as marking keys by `saq/`, not linked) |
| `exams/part-b/` | Part B SAQ programme app (sign-in by email, unlisted); its server is `saq/` |
| `popliteal/` | Popliteal sciatic block animation by Dr Chew Shi Hao |
| `babymo/` | Baby MO test (MCQ test for new MOs, with a faculty question editor; unlisted) |
| `mo/` | For new MOs: landing page; the MO guide (practical learning app, handbook and beyond, offline) is in `mo/guide/` (unlisted) |
| `AGENTS.md`, `CLAUDE.md` | Instructions for AI assistants editing this site |

The NAPS 2026 models live in their own repo: NTF-Anaesthesia/naps2026-site (https://naps2026.anantf.com).

## Editing the exams page

`exams/index.html` is the master copy (Dr Chew Shi Hao's original site has been retired). All the
content is in the script near the top of the file:

| Block | Starts around line | What it holds |
|---|---|---|
| `const exams` → `partC` | 267 | Part C sections and resources |

Part B moved out of this page on 21 Oct 2026: it is now the SAQ programme app, `exams/part-b/` (server in `saq/`).
Its 10-week plan is `saq/keys/programme.json`; its model answers are `exams/reference/*.pdf`, listed in
`saq/keys/index.json`. See `saq/README.md`.

Keep the commas and quotes intact when editing; open the page afterwards to check it still loads.
Changes pushed to `main` go live in about a minute.
