# POCUS tutorials

The POCUS hub lists all nine lectures, with topic filters modelled on chewshihao.com/writing. The default All filter shows every lecture. The critical care series expands the owner-provided SCCM study guide; it is not an official SCCM course or certification.

| Theme | Route | Content |
| --- | --- | --- |
| Basics | `basics/` | 20 sections; seven paired physics/acquisition labs, three cases and quiz |
| Heart | `cardiac/` | 34 sections; windows, LV/RV acquisition/morphology/FAC/TAPSE, pericardial disease, venous Doppler, cases and real cines |
| Heart | `haemodynamics/` | 18 sections; EF/forward flow, LVOT, error, PLR, IVC, fluid tolerance and cases |
| Lung | `lung/` | 30 sections; pleural signs, aeration, effusions, diaphragm, cases and real cines |
| Shock | `shock/` | 27 sections; RUSH, serial reassessment, arrest, four staged cases and eight decision cases |
| Shock & trauma | `efast/` | eFAST lecture with acquisition simulations and cases |
| Vascular | `dvt/` | DVT compression ultrasound lecture |
| Gastric | `gastric/` | Original gastric ultrasound masterclass |
| Vascular | `vascular-access/` | Original IA/IV cannulation masterclass |
| Media | `media/` | Eleven licensed clinical cines, posters, source review and per-asset attribution |

The former eFAST and DVT drafts are now listed on the POCUS hub; their teaching content is unchanged. Keep the tutorial noindex tags. Retain the NTF site identity and credit Dr. Chew Shi Hao with a link to https://chewshihao.com.

## Structure and navigation

`hub.js` filters the flat lecture list using accessible pressed buttons. Without JavaScript, all lecture links remain visible. The filter bar wraps into two columns on small screens.

The original gastric and vascular-access masterclasses preserve the owner-provided text, media and simulations. Their assets are unchanged by the critical care series.

`assets/pocus-course.css` and `.js` provide the established course shell: section picker, Previous/Next, Contents and the site header/footer. `pocus/shared/series.css` and `.js` add the five critical care lectures' typography, topic search, named-anchor routing, related lectures and section-top control. Do not alter `.slide` visibility or `.deck` scrolling conventions. Capture `POCUS_INITIAL_HASH` in the head before legacy engines replace a named fragment. Numeric fragments remain valid.

New basics and haemodynamics files are scoped to those lectures. Haemodynamics imports the basics base stylesheet; its explicit numerical model is `haemodynamics/model.js`. Existing cardiac/lung/shock engines retain their scene registries and deterministic schematic scanning. Animations expose pause and respect reduced motion; hidden slides/tabs and the contents overlay suspend drawing. The reading interface has no print/PDF, timer or theme controls.

## Clinical media

Clinical scans are labelled separately from original teaching schematics. `media/media-attributions.json` is the source of truth for authors, source URLs, licences, processing changes and SHA-256 hashes. All imported clips and posters retain their stated CC BY or CC BY-SA licences; general site copyright does not override them. Use native controls, `playsinline`, `preload="none"`, a supplied poster and no autoplay. Keep clinical limitations and licence/credit links at the point of use. Pause media when leaving a section.

Do not add unprocessed source files with identifying headers to this repository. The selected files preserve anatomy, image proportions and playback speed. Historical source papers supply media, not automatically current management advice.

## Verification

Use `node pocus/test/model.test.cjs` for the haemodynamics equations and `python3 pocus/test/content.py` for IDs, local assets, anchors, media attribution and inline JavaScript syntax. Full browser checks must cover desktop/mobile, section/search/reference routing, keyboard focus, reduced motion, all simulation controls and native video playback. Code/DOM tests are not a substitute for browser layout and playback checks.

## Subject-specific teaching

Gastric and IA/IV access are references for presentation quality, visual language and interactive depth. Choose clinical structure, acquisition, measurements and cases for each subject; do not copy another organ's protocol to fill a template. The lung opening distinguishes a bilateral survey, BLUE and 12-region scoring. The coronal effusion schematic does not supply the independent transverse measurement used for Balik arithmetic. Cardiac contains dedicated RV anatomy, morphology and measurement sections. Original cardiac numeric anchors use `data-route`; keep those identities when adding sections.

See `REVIEW.md` for the 17 October review, confirmed corrections, source correspondence and outstanding source-access limitations. The six unverified source decks must be recovered before claiming a complete slide-by-slide conversion. Run the browser review with `PLAYWRIGHT_PATH` set as in `.github/workflows/pocus.yml`; rendered previews are retained as a CI artifact.
