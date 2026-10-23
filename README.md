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
| `exams/reference/` | Part B model-answer PDFs |
| `popliteal/` | Popliteal sciatic block animation by Dr Chew Shi Hao |
| `mo/`, `babymo/`, `qbank/` | Moved to the `mo` repo (mo.anantf.com); redirect pages only |
| `AGENTS.md`, `CLAUDE.md` | Instructions for AI assistants editing this site |

The NAPS 2026 models live in their own repo: NTF-Anaesthesia/naps2026-site (https://naps2026.anantf.com).

## Editing the exams page

`exams/index.html` is the master copy (Dr Chew Shi Hao's original site has been retired). All the
content is in the script near the top of the file:

| Block | Starts around line | What it holds |
|---|---|---|
| `const banks` → `essayBank` | 266 | Part B model-answer PDFs, grouped by topic |
| `const studyPlan` | 363 | Part B study-plan calendar |
| `const exams` → `reflections` | 452 | Reflections (posts with id, title, date, body) |
| `const exams` → `partB` | 483 | Part B sections and resources |
| `const exams` → `partC` | 569 | Part C sections and resources |

To add a model-answer PDF, upload it to `exams/reference/` and add an entry like
`{ title: "...", url: "reference/<file>.pdf" }` to the matching group in `essayBank`.

Keep the commas and quotes intact when editing; open the page afterwards to check it still loads.
Changes pushed to `main` go live in about a minute.
