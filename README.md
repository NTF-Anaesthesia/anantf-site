# NTF Anaesthesia resources — anantf.com

Static site served by GitHub Pages at https://anantf.com.

| Path | What it is |
|---|---|
| `index.html` | Homepage listing all resources |
| `exams/` | MMed exam resources by Dr Chew Shi Hao (his design, imported) |
| `exams/reference/` | Part B model-answer PDFs |
| `popliteal/` | Popliteal sciatic block animation |

The NAPS 2026 models live in their own repo: NTF-Anaesthesia/naps2026-site (https://naps2026.anantf.com).

## Updating the exams page

Don't edit `exams/index.html` by hand. When Shi Hao sends a new version, put his `exams.html` and
`reference/` folder in one folder and run:

    node tools/import-exams.mjs "<that folder>"

The script keeps his content and design, and swaps his personal-site header, search and footer
for the department ones. It stops with an error if his page has changed shape.

Changes pushed to `main` go live in about a minute.
