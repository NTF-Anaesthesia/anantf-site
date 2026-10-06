# NTF Anaesthesia resources — anantf.com

Static site served by GitHub Pages at https://anantf.com.

| Path | What it is |
|---|---|
| `index.html` | Homepage (lists NAPS only; exams and popliteal are unlisted for now) |
| `exams/` | MMed exam resources by Dr Chew Shi Hao (his design; this is now the master copy) |
| `exams/reference/` | Part B model-answer PDFs |
| `popliteal/` | Popliteal sciatic block animation by Dr Chew Shi Hao |
| `ac/` | Guide to AC Life (password-locked, unlisted). The content is encrypted in the page; the password is shared separately and is not stored in this repo |

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
