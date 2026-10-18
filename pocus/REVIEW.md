# POCUS subject review · 17 October 2026

## Editorial rule

The gastric and IA/IV masterclasses are references for visual design, interactive depth and teaching quality. Their clinical protocols, chapter structure, measurements and case logic are not templates for other organs. Reuse navigation and styling; choose the teaching sequence from the source subject.

## Findings and corrections

| Lecture | Finding | Decision |
| --- | --- | --- |
| Basics | Physics and acquisition labs are specific to their mechanisms. No gastric clinical content found. | Retain pulse–echo, frequency, orientation, optimisation, artefact, Doppler and reporting sequence. Browser traversal exposed a four-argument Canvas setTransform call that broke all seven physics labs; restore the full six-argument transform. |
| Cardiac | Windows and LV assessment are substantial, but the 34-slide RV source is compressed into one main RV section. Advanced venous and flow content competes with the foundational acquisition material. | Add RV anatomy/acquisition, morphology and FAC/TAPSE measurement sections before integrated RV patterns. Add direct links to windows, LV and RV modules. Identify advanced material as extensions. Retain original numeric fragment targets. Correct a residual automatic fluid instruction for LVOT obstruction and the requirement to find a lung point in clinical tension. |
| Lung | Opening explicitly applies the gastric I-AIM paper. BLUE points, an 8-region survey and 12-region scoring are presented without an adequate distinction of purpose. A blanket synthetic-image notice conflicts with real clips. | Teach the bilateral survey first, default the scan map to 8 regions, explain posterior extension and the distinct BLUE/LUS applications. Replace gastric attribution with the actual lung-specific I-AIM reference, without making that framework the lecture structure. Correct the media notice. |
| Lung effusion lab | Coronal schematic calipers feed directly into a Balik estimate although the described method uses transverse maximum basal separation. Case 5 repeats this mismatch. | Coronal calipers now report distance only. A separate, explicitly independent formula input teaches the arithmetic. Case 5 stipulates its transverse measurement separately. Neither diagram establishes a procedural window. |
| Haemodynamics | Flow calculations, measurement error, PLR timing and IVC denominators are subject-specific. Need, response and tolerance are separated. | Retain the existing structure and numerical model. No gastric protocol found. |
| Shock | RUSH is an appropriate shock application, but the expanded resuscitation material can be mistaken for direct SCCM slide conversion. Media notice is outdated; one statement implies that patterns and repeated scanning cannot mislead. | Identify the lecture as an extended application; call constructed cases clinical decision cases. Correct media and diagnostic-certainty language. Urgent treatment takes priority over finishing a survey. |
| eFAST | Useful trauma windows and cases, with an unnecessary inherited I-AIM introduction. | Present the framework as eFAST during trauma resuscitation. Retain acquisition, limitations and haemodynamic decisions; use plain numbered case stages. |
| DVT | Useful segmental compression teaching, with an inherited requirement to use the same I-AIM framework as other stations. | Organise the opening around examination choice, coverage, reporting and follow-up; retain the compression and evidence content. |
| Gastric; IA/IV access | These are the original reference masterclasses and teach their respective subjects. | Retain as independent lectures. Do not import their organ-specific content into the critical care series. |

Inherited agenda timings in cardiac, lung, shock, eFAST and DVT were removed. These were not verified course timings. The section picker, search, cases, answer reveals, calculators, media credits and existing simulations remain.

## Source correspondence and limits

The current timetable and the earlier supplied `sccm.html` companion identify seven unique Day 1 sources: Physics, Echo views, LV function, RV function, Volume responsiveness, Lung ultrasound and Evening cases. The companion reports that the lunch-case link duplicates LV function. That relationship was not independently rechecked against the original link targets in this review.

The supplied `07_UltrasoundAdult_BasicRV_2020 KW.pptx` was read directly (34 slides). The added RV sections correspond to its anatomy (3–4), acquisition (5–12), morphology (13–21), function (22–26) and septal interaction (27). Its clip-dependent questions (28–33) could not be reconstructed from extracted text on 17 October.

The other six original decks were not accessible for direct slide-by-slide comparison in this session. Review of their themes uses the current HTML and the earlier companion, not an independent fidelity certification. Recovering those decks and recording slide-to-section coverage remains necessary before describing the whole series as a fully verified conversion. Do not imply that existing RUSH, VExUS, diaphragm or arrest extensions came from those inaccessible sources.

Current RV measurement acquisition and normal references were checked against the 2025 ASE right-heart guideline (doi:10.1016/j.echo.2025.01.006). The gastric I-AIM citation was replaced with Kruisselbrink et al.'s lung-specific article (doi:10.1097/ALN.0000000000001779). Balik measurement geometry was checked against the original study and the authors' later methodological clarification (doi:10.1007/s00134-005-0024-2; doi:10.1186/s13054-022-04018-9).

## Verification

`pocus/test/content.py` checks section IDs, references, local assets, JavaScript and licensed media hashes. `pocus/test/model.test.cjs` checks the existing haemodynamics model. `pocus/test/review.e2e.mjs` opens all seven lectures at desktop and phone widths, traverses sections and checks runtime errors. Targeted tests cover the original cardiac `#14` route, named RV routing, FAC/TAPSE examples, constrained area inputs, lung survey selection and independence of coronal calipers from Balik arithmetic. It saves rendered previews as a CI artifact.

These checks do not replace clinical review of the original ultrasound clips or a comprehensive revalidation of every inherited clinical claim.

## Update · 18 October 2026

The owner supplied the SCCM Day 1 decks (RV function, LV function, volume responsiveness, evening cases) and confirmed the department's rights to reuse their clips and images. Cardiac now has a dedicated Part III · The right ventricle built from the RV deck (slides 3–33): anatomy and physiology, windows, morphology, function, septal flattening and the five clip questions with the course answers. 23 clips and 6 stills were cropped to the ultrasound sector (removing patient names, record numbers, scan dates and unit names found in several headers), re-encoded without metadata and recorded in `media/media-attributions.json` as "Used with permission". The deck's 3D RV reconstruction (slide 3) appears to be a third-party journal figure and is not published.

Deck values that differ from the 2025 ASE reference are shown only with a label: TAPSE ≤16 mm (slide 25) and <16 mm (slide 26 notes) are inconsistent within the deck; the page uses the ASE 2025 normal reference (>17 mm). The deck's mid-cavity (>35 mm), longitudinal (>83 mm), wall-thickness (3 ± 1 mm normal, >10 mm severe) and RV:LV area grades are labelled as course values; they were not re-checked against the 2025 guideline. The case slide prints lactate in mg/dL and troponin without units; the page says so rather than converting.

IVC, LVOT VTI/PLR and VExUS remain in cardiac as an extension part linked to Flow and fluids. The shared shell now groups every lecture's sections by part.

Cardiac Part II · The left ventricle now follows the LV deck (slides 2–36 and 49–50): `#lv-function` (route 12, grades, ASE/EACVI 2015 EF categories, four real A4C grade clips, Sim 4 unchanged), new `#lv-linear` (FS, Teichholz, MAPSE, EPSS with real clips and M-mode stills), new `#lv-area-volume` (FAC worked example, Simpson's biplane stills, poor-border clips) and new `#lv-cases` (course examples 1 and 2, course question 1, two measurement checks), then `#ef-forward-flow` (route 13). 19 clips and 13 stills are recorded as "Used with permission"; a Simpson still carrying a patient name and ID was excluded. Deck values not published: FS ≥30% / <20%, MAPSE ≥11 mm (men) / ≥13 mm (women), LV FAC 35–65% (no source on the slides; not verified). The deck credits its EF bands to an LVAD document (Stainback 2015); the page cites Lang 2015. The hyperdynamic clip's burned-in "FE 70%" differs from the slide's 78%; the page uses the grade, not the number. The Doppler half (slides 37–47, question 2) belongs with haemodynamics and is not yet integrated.

Flow and fluids (`haemodynamics/`) now follows the volume responsiveness deck (62 slides). New sections: `#static-measures` (CVP, LVEDA, end-expiratory IVC, stiff-LV pitfall), `#ivc-pitfalls` (false-large/false-small causes and the course's three unlabelled shocked-patient IVC clips, described but not diagnosed), `#aortic-velocity` (Feissel 2001 ΔVpeak, mean denominator, calculator), `#dynamic-evidence` (Vignon 2017 table re-typed from the course slides, Geri 2019 cluster, course take-home thresholds) and `#course-questions` (slides 60–61, course answers). Existing sections gained the real A5C/VTI media, PLR bed photos and course pitfalls, four heart–lung mechanisms and the mini-fluid studies, IVC collapsibility clip and mitral E under tolerance. Numeric routes #1–#18 are pinned with `data-route`. 10 clips and 6 stills are recorded as "Used with permission". Not published: slide 37 PLR accuracy (sensitivity 97%, specificity 94%, uncited), slide 5 "17% of intravascular volume" and slide 52 "9% of total blood volume" (unsourced), and the slide 38 PLR formula with a mean denominator (the page explains why baseline is used). The LVEDA course values (normal 9.5–22 cm², <5.5 cm²/m²) are labelled as course values because the deck also quotes <5.5 cm² unindexed; Leung 1994 was not re-checked. The PLR pictogram (possibly third-party) and a specimen photograph were left out.

Day 1 cases (`cases/`, new lecture on the hub under a Cases filter, last in the series after DVT) follows the evening cases deck (29 slides, 7 cases). Each case runs as vignette, real clips, commit, reveal and teaching point, with the course answers from the speaker notes and links to the cardiac RV/LV sections, Flow and fluids, lung, DVT and shock. Case 2 and Case 6 are staged: their next clips appear only after the first question is answered. 18 clips and one chest radiograph are recorded in `media/media-attributions.json` as "Used with permission"; one source clip carried a patient name, record number, study IDs, hospital text and scan date/time, all removed, and JPEG encoder comments were stripped from the posters. Not reproduced: the Mayo 2016 weaning Doppler thresholds on slide 10 (LVEF <40%, E/A >2, E/e' >12, no change in CO with PLR; course notes say "only point out EF"; not re-checked) and the slide 28 line "Transthoracic echocardiography is preferred" after cardiac surgery, which contradicts the slide's preceding bullet and usual practice (the page keeps "TOE may be needed if TTE is inadequate"; owner to confirm). The deck is undated and gives lactate without units (Case 6); the page says so. The Case 7 view and finding come from the course clip's file label and slide 28. The shock lecture's constructed decision cases link to the real-clip versions.

## Source coverage and limits · 18 Oct 2026

### Decks read directly

The four supplied SCCM Critical Care Ultrasound: Adult Day 1 decks were unzipped and read slide by slide (text, speaker notes and embedded media), not inferred from the earlier companion.

| Deck | Slides | Clips | Lecture |
| --- | --- | --- | --- |
| RV function | 34 | 25 | Cardiac, Part III · The right ventricle |
| LV function | 52 | 21 | Cardiac, Part II · The left ventricle |
| Volume responsiveness | 62 | 11 | Flow and fluids (`haemodynamics/`) |
| Evening cases | 29 | 18 | Day 1 cases (`cases/`) |

### Slide-to-section coverage

Mapped from section content, slide citations and reference lists. Ranges are approximate at the single-slide level; check a slide against its section before claiming a one-to-one conversion.

| Deck slides | Page section | Notes |
| --- | --- | --- |
| RV 1–2, 34 | `#part-rv` | Title, outline, thanks. |
| RV 3–4 | `#rv-anatomy` | |
| RV 5–12 | `#rv-windows` | Includes the RV-focused apical view (10–11). |
| RV 13–21 | `#rv-morphology` | Course size and wall values labelled as course values. |
| RV 22–26 | `#rv-measurements` | FAC and TAPSE use the 2025 ASE reference; the deck's TAPSE ≤16 / <16 mm noted as inconsistent within the deck. |
| RV 27 | `#rv-septum` | |
| RV 28–33 | `#rv-cases` | Five clip questions with the course answers. |
| LV 2–5, 31–36 | `#lv-function` (route 12) | Grades and four real A4C grade clips. |
| LV 6–18 | `#lv-linear` | FS uses the course values (≥30% normal, <20% severely impaired); EPSS keeps only the deck's statement of McKaigney 2014. |
| LV 19–30 | `#lv-area-volume` | FAC, Simpson's biplane, ASE 2015 EF categories. |
| LV 34–35, 50 | `#lv-cases` | |
| LV 37–47 | Flow and fluids `#acquire-flow`, `#flow-lab`, `#vti` | LVOT diameter, PW Doppler and VTI are taught there; the LV deck's own LVOT stills were not used. |
| LV 48 | Not used | Survey of modalities intensivists use. |
| LV 49 | `#lv-function`, `#lv-cases` | Take-home points. |
| LV 51 | Not used | LVOT-diameter image question; its stills were removed rather than published unused. |
| Volume 2–8 | `#three-questions`, `#static-measures` | |
| Volume 9–14 | `#static-measures` | CVP, LVEDA, end-expiratory IVC. |
| Volume 15–19 | `#ventilation` | Heart–lung interactions (Michard). The minibolus slide (16) is not taught. |
| Volume 20–25 | `#ivc-lab`, `#ivc-pitfalls` | Includes the three unlabelled shocked-patient IVC clips. |
| Volume 26–35 | `#acquire-flow`, `#aortic-velocity`, `#ventilation` | Feissel 2001 ΔVpeak with mean denominator; pulse pressure variation (33–34) sits with ventilation. |
| Volume 36–40 | `#plr-technique`, `#plr-lab`, `#thresholds` | Lamia PLR data in thresholds. |
| Volume 41–54, 57–59 | `#dynamic-evidence`, `#thresholds` | Vignon 2017 table, Geri 2019 clusters, course take-home thresholds. |
| Volume 55 | `#static-measures` | FUSA. |
| Volume 56 | `#fluid-tolerance` | Early-sepsis LVOT obstruction (Chauvet). |
| Volume 60–61 | `#course-questions` | Course answers. An unsourced "0.7 m/s" stroke-volume cue was removed from Question 2. |
| Cases 2–28 | `cases/` Cases 1–7 | Vignette, clips, commit, reveal, teaching point. |

### Media used with permission

The owner confirmed the department's rights to reuse the SCCM clips and images on the public site. Every SCCM file is recorded in `media/media-attributions.json` as "Society of Critical Care Medicine (SCCM) Critical Care Ultrasound: Adult course; used with permission", with sha256 hashes for clip and poster. Clips were cropped to the ultrasound sector to remove patient names, record numbers, scan dates and unit names; audio and container metadata were removed. JPEG posters in `sccm-fluid/` still carried an ffmpeg comment segment; it was removed losslessly and the hashes updated. `content.py` now fails if any file under `media/sccm-*/` lacks a manifest record, if a page references an unrecorded SCCM file, or if an SCCM JPEG carries a comment or EXIF segment. Twelve unreferenced LV files were deleted.

Corrections from the 18 Oct 2026 review: RV question 1 no longer repeats the course note's "subcostal" label (the loop looks parasternal; the file is now `sccm-rv/s28-q1-rv-infarction.*`). The slide 23 clip is captioned as a standard apical four-chamber view, not an RV-focused view. The cocaine case says the printed lactate unit (mg/dL) is probably an error for mmol/L. Contents search keeps focus while typing and no longer indexes hidden question answers; the current part in the Contents index is announced with `aria-current="true"`.

### Remaining limits

- Physics, Echo views and Lung ultrasound decks are still not supplied. Basics, cardiac acquisition and lung remain checked against the earlier companion only, not slide by slide.
- No open-source media could be downloaded in this environment (external hosts blocked). The 11 CC clips already in `media/` and the original schematic simulations are reused.
- Deck values not re-checked against current guidelines stay labelled as course values. McKaigney 2014 confidence intervals and specificity were not verified and are not quoted.
- These checks do not replace clinical review of the course clips by the lecture owner.
