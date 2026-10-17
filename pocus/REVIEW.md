# POCUS subject review · 17 October 2026

## Editorial rule

The gastric and IA/IV masterclasses are references for visual design, interactive depth and teaching quality. Their clinical protocols, chapter structure, measurements and case logic are not templates for other organs. Reuse navigation and styling; choose the teaching sequence from the source subject.

## Findings and corrections

| Lecture | Finding | Decision |
| --- | --- | --- |
| Basics | Physics and acquisition labs are specific to their mechanisms. No gastric clinical content found. | Retain pulse–echo, frequency, orientation, optimisation, artefact, Doppler and reporting sequence. |
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

The supplied `07_UltrasoundAdult_BasicRV_2020 KW.pptx` was read directly (34 slides). The added RV sections correspond to its anatomy (3–4), acquisition (5–12), morphology (13–21), function (22–26) and septal interaction (27). Its clip-dependent questions (28–33) cannot be reconstructed faithfully from extracted text; the new examples are explicitly schematic. The original patient clips were not reinterpreted or republished.

The other six original decks were not accessible for direct slide-by-slide comparison in this session. Review of their themes uses the current HTML and the earlier companion, not an independent fidelity certification. Recovering those decks and recording slide-to-section coverage remains necessary before describing the whole series as a fully verified conversion. Do not imply that existing RUSH, VExUS, diaphragm or arrest extensions came from those inaccessible sources.

Current RV measurement acquisition and normal references were checked against the 2025 ASE right-heart guideline (doi:10.1016/j.echo.2025.01.006). The gastric I-AIM citation was replaced with Kruisselbrink et al.'s lung-specific article (doi:10.1097/ALN.0000000000001779). Balik measurement geometry was checked against the original study and the authors' later methodological clarification (doi:10.1007/s00134-005-0024-2; doi:10.1186/s13054-022-04018-9).

## Verification

`pocus/test/content.py` checks section IDs, references, local assets, JavaScript and licensed media hashes. `pocus/test/model.test.cjs` checks the existing haemodynamics model. `pocus/test/review.e2e.mjs` opens all seven lectures at desktop and phone widths, traverses sections and checks runtime errors. Targeted tests cover the original cardiac `#14` route, named RV routing, FAC/TAPSE examples, constrained area inputs, lung survey selection and independence of coronal calipers from Balik arithmetic. It saves rendered previews as a CI artifact.

These checks do not replace clinical review of the original ultrasound clips or a comprehensive revalidation of every inherited clinical claim.
