# POCUS tutorials

The POCUS hub groups the lectures into seven numbered sections, in learning order: Foundations, Heart and circulation, Lung, Shock and trauma, Vascular, Perioperative and Case studies. Each lecture row has a one-line description. The critical care series expands the owner-provided SCCM study guide; it is not an official SCCM course or certification.

| Theme | Route | Content |
| --- | --- | --- |
| Basics | `basics/` | 20 sections; seven paired physics/acquisition labs, three cases and quiz |
| Heart | `cardiac/` | 42 sections in six parts; windows, a left-ventricle part built from the SCCM LV lecture (grades, FS/MAPSE/EPSS, FAC/Simpson's, 19 real clips and five clip questions), a right-ventricle part built from the SCCM RV lecture with 23 real clips and five clip questions, pericardium and shock patterns, an extension part (IVC, VTI, VExUS) and cases |
| Heart | `haemodynamics/` | 23 sections in six parts, extended from the SCCM volume responsiveness lecture; static measures (CVP, LVEDA, IVC), EF/forward flow and LVOT VTI, PLR, IVC indices and pitfalls, heart–lung interaction, aortic peak velocity variation (ΔVpeak calculator), comparative evidence (Vignon 2017), fluid tolerance, cases and the course's two clip questions; 10 real clips and 6 stills |
| Lung | `lung/` | 30 sections; pleural signs, aeration, effusions, diaphragm, cases and real cines |
| Shock | `shock/` | 27 sections; RUSH, serial reassessment, arrest, four staged cases and eight decision cases |
| Shock & trauma | `efast/` | eFAST lecture with acquisition simulations and cases |
| Vascular | `dvt/` | DVT compression ultrasound lecture |
| Cases | `cases/` | Case studies: the seven SCCM course cases with 18 real clips and a radiograph, each run as vignette, clips, commit, reveal and teaching point, with links to the RV, LV, fluid, lung and shock sections; 10 sections in two parts |
| Gastric | `gastric/` | Original gastric ultrasound masterclass |
| Vascular | `vascular-access/` | Original IA/IV cannulation masterclass |
| Media | `media/` | Eleven CC-licensed clinical cines, the SCCM course clips used with permission (RV, LV, fluids, cases), source review and per-asset attribution |

The former eFAST and DVT drafts are now listed on the POCUS hub; their teaching content is unchanged. Keep the tutorial noindex tags. Retain the NTF site identity. By the owner's decision (19 Oct 2026), POCUS pages carry no personal author credit.

## Structure and navigation

A sticky section index sits under the site header (one scrolling row on phones); `hub.js` marks the section in view with `aria-current`. Section ids keep the former filter hashes working (`#basics`, `#heart`, `#lung`, `#shock`, `#vascular`, `#cases`); `#gastric` is redirected to `#perioperative`. Without JavaScript the index is plain anchor links. When adding a lecture, add its row to the right section and its entry to `LECTURES` in `shared/series.js`, which follows hub order.

Inside a lecture, navigation is one continuous deck: a flat section picker, the engine's own counter ("12 / 42") and progress line, Previous/Next, and a flat Contents overlay (one numbered row per section, with search); `?` lists the shortcuts. Part divider slides (`Part III · …`) stay as ordinary slides in the sequence; there are no part buttons, part rail or part-scoped counters. `window.POCUS_PARTS` still exposes the part model as data for tests. Never add buttons inside `#ovGrid`: engines mark the current section by button index.

The original gastric and vascular-access masterclasses preserve the owner-provided text, media and simulations. Their assets are unchanged by the critical care series.

`assets/pocus-course.css` and `.js` provide the established course shell: section picker, Previous/Next, Contents and the site header/footer. `pocus/shared/series.css` and `.js` add the eight series lectures' typography, topic search, named-anchor routing, lecture links (one list in hub order), "Next lecture" on the final section and the section-top control. Do not alter `.slide` visibility or `.deck` scrolling conventions. Capture `POCUS_INITIAL_HASH` in the head before legacy engines replace a named fragment. Numeric fragments remain valid.

`cases/cases.{css,js}` are scoped to Case studies: the same section engine as haemodynamics plus commit-then-reveal questions (`fieldset.cs-q[data-answer]`); an element with `data-unlock-by="<question id>"` stays hidden until that question is answered, so a case can show its next clips only after the learner commits. New basics and haemodynamics files are scoped to those lectures. Haemodynamics imports the basics base stylesheet; its explicit numerical model is `haemodynamics/model.js` (flow, ejection, IVC indices, PLR time course and ΔVpeak). The original 18 sections keep numeric routes `#1`–`#18` through `data-route`; the five new sections (`static-measures`, `ivc-pitfalls`, `aortic-velocity`, `dynamic-evidence`, `course-questions`) are reached by name. The cardiac IVC and LVOT VTI/PLR extension sections link here rather than duplicating the deck material. Existing cardiac/lung/shock engines retain their scene registries and deterministic schematic scanning. Animations expose pause and respect reduced motion; hidden slides/tabs and the contents overlay suspend drawing. The reading interface has no print/PDF, timer or theme controls.

## Clinical media

Clinical scans are labelled separately from original teaching schematics. `media/media-attributions.json` is the source of truth for authors, source URLs, licences, processing changes and SHA-256 hashes. Openly licensed clips and posters retain their stated CC BY or CC BY-SA licences; general site copyright does not override them. Files in `media/sccm-*/` come from the SCCM Critical Care Ultrasound: Adult course and are recorded as "Used with permission" (owner confirmed reuse rights, 18 Oct 2026). Credit them at the point of use as "Clip: SCCM Critical Care Ultrasound: Adult, used with permission"; they are not openly licensed. Crop away every scanner header: several source clips carried patient names, record numbers and scan dates. Use native controls, `playsinline`, `preload="none"`, a supplied poster and no autoplay. Keep clinical limitations and licence/credit links at the point of use. Pause media when leaving a section.

Do not add unprocessed source files with identifying headers to this repository. The selected files preserve anatomy, image proportions and playback speed. Historical source papers supply media, not automatically current management advice.

## Verification

Use `node pocus/test/model.test.cjs` for the haemodynamics equations and `python3 pocus/test/content.py` for IDs, local assets, anchors, media attribution and inline JavaScript syntax. Full browser checks must cover desktop/mobile, section/search/reference routing, keyboard focus, reduced motion, all simulation controls and native video playback. Code/DOM tests are not a substitute for browser layout and playback checks.

## Subject-specific teaching

Gastric and IA/IV access are references for presentation quality, visual language and interactive depth. Choose clinical structure, acquisition, measurements and cases for each subject; do not copy another organ's protocol to fill a template. The lung opening distinguishes a bilateral survey, BLUE and 12-region scoring. The coronal effusion schematic does not supply the independent transverse measurement used for Balik arithmetic. Cardiac Part II follows the SCCM LV lecture: grades and EF categories (ASE/EACVI 2015), linear methods (FS, Teichholz caveat, MAPSE taught qualitatively, EPSS), FAC and Simpson's biplane, real graded clips, then the course examples and question; its Doppler half belongs in haemodynamics. Cardiac Part III follows the SCCM RV lecture: anatomy and physiology, windows, size and wall thickness (normal vs abnormal clip pairs), function (eyeball, FAC, TAPSE), septal flattening, the course clip questions, then the integrated patterns lab. Current RV normal values follow the 2025 ASE right-heart guideline; older course values are labelled as such. Original cardiac numeric anchors use `data-route`; keep those identities when adding or moving sections (`#1`–`#31` are checked by the tests).

See `REVIEW.md` for the 17 and 18 October reviews, confirmed corrections, source correspondence and outstanding source-access limitations. The RV, LV, Volume responsiveness and Evening cases decks were read directly on 18 October 2026; the Physics, Echo views and Lung decks must still be recovered before claiming a complete slide-by-slide conversion. Run the browser review with `PLAYWRIGHT_PATH` set as in `.github/workflows/pocus.yml`; rendered previews are retained as a CI artifact.
