# POCUS clinical media

Reviewed 17 October 2026. Eleven real ultrasound cine loops and matching still posters, selected for the POCUS lecture series. All included files use **CC BY or CC BY-SA**, with the individual licence recorded in `media-attributions.json` and on `index.html`.

Updated 18 October 2026: `sccm-rv/` adds 23 clips and 6 stills from the Society of Critical Care Medicine (SCCM) Critical Care Ultrasound: Adult course, RV lecture. They are **used with permission** (the owner confirmed the department's reuse rights), not openly licensed, and each has its own record in `media-attributions.json` (`licence: "Used with permission"`, with `licence_evidence`). Every clip was cropped to the ultrasound sector to remove scanner headers; several source headers carried patient names, record numbers, scan dates and unit names. `sccm-lv/` adds the LV lecture's 19 clips and 13 stills used in cardiac Part II, recorded the same way (scanner dates/times masked or cropped; one source still with a patient name and ID excluded). The folder also holds processed LVOT/Doppler files (slides 37–51) that are not yet used or recorded; record each one in `media-attributions.json` before linking it. `sccm-fluid/` adds the volume responsiveness lecture's 10 clips and 6 stills used in Flow and fluids (`haemodynamics/`), recorded the same way (scanner dates/times, name boxes and a possible institution preset masked). The deck's journal figures and tables, photographs of staff, a TOE image showing a hospital name, a heart specimen photograph and an unattributed PLR pictogram were not used. `sccm-cases/` adds the course clinical cases' 18 clips and one chest radiograph used in Case studies (`cases/`), recorded the same way; one source clip carried a patient name, record number, study IDs, hospital text and scan date/time, all cropped or masked, and the radiograph's identifiers are blacked out. Do not commit unprocessed source files. The original interactive lecture diagrams remain separate, labelled schematics.

## Source review

| Source | Value for this series | Reuse decision |
| --- | --- | --- |
| [Gillman et al., 2009, published supplements](https://doi.org/10.1186/1757-7241-17-34) | Clear basic lung signs, pleural fluid, FAST and IVC examples; modest resolution but useful short loops. | Seven selected under CC BY 2.0. Some burnt-in identifiers required masking. Older article claims are not copied as current clinical guidance. |
| [CardioNetworks/ECHOpedia via Wikimedia](https://commons.wikimedia.org/wiki/Category:Media_from_CardioNetworks_ECHOpedia) | Clean normal cardiac windows and cycle timing, with original creator credits. | Two selected under their file-specific CC BY-SA 3.0 release. Keep ShareAlike on these derivatives. |
| [Ultrasound of the Week, case 78](https://commons.wikimedia.org/wiki/File:UOTW_78_-_Ultrasound_of_the_Week_2.webm) | A useful pericardial-effusion case loop. | One selected under file-specific CC BY-SA 4.0. Original site was inaccessible during review; Commons preserves provenance and the archived licence link. |
| [Zhang & Chen, 2015](https://doi.org/10.1186/s13054-015-0863-3) | Strong counterexample to overcalling a moving lung edge as pneumothorax. | Additional file 1 selected under CC BY 4.0. Article explicitly states publication consent. |
| [The POCUS Atlas](https://www.thepocusatlas.com/legal) | Broad, well-organised contemporary case library, especially useful for uncommon signs and pathology. | Official licence is CC BY-NC 4.0. Linked reference for now; no files copied into this unrestricted-reuse selection. Check the individual contributor and restrictions for any future reuse. |
| [LITFL](https://litfl.com/cookie-declaration/) | Extensive educational cases and interpretation. | Site states CC BY-NC-SA 4.0; individual third-party exceptions still matter. Linked reference, no files copied here. |
| [Stanford Medicine 25](https://stanfordmedicine25.stanford.edu/the25/ultrasound.html) | Useful probe and acquisition demonstrations. | No asset-specific open reuse licence verified on the reviewed page. Link to the original resource rather than downloading or republishing. |

## Integration

Use native video controls, `playsinline`, `loop`, `preload="none"`, the supplied poster, and no autoplay. Provide the clinical caption and limitations beside the clip. Show creator, linked original source, linked licence and changes at the point of use (an adjacent expandable credit is acceptable). The catalogue links back to relevant lectures. Only one catalogue clip plays at a time; all pause when the page is hidden.

The processed videos contain no audio. The text captions are their educational alternative. No anatomy, pathology, speed or sequence was generated or altered. Necessary header masking and pixel-aspect normalisation are documented per file. Posters are extracted clinical frames, not independent acquisitions.

The small source videos support recognition; they do not replace acquisition training, supervised practice or a complete clinical study. Gaps include dynamic air bronchograms (LVOT Doppler acquisition is now covered by the SCCM fluid clips and stills) (major RV pathology is now covered by the SCCM RV clips); those topics retain the lecture simulations and primary references rather than an unverified download.

## Included files

### a4c-normal.mp4 and a4c-normal.jpg

Identify the four chambers, septum and atrioventricular valves across the cardiac cycle. A single normal example does not exclude cardiac disease or establish an ejection fraction. This short loop is intended for orientation and qualitative motion assessment.

- Creator: I.A.C. van der Bilt, MD, Department of Echocardiography AMC; CardioNetworks/ECHOpedia (Vdbilt) (2007).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:A4C_normal_(CardioNetworks_ECHOpedia).webm); [original work](https://www.echopedia.org/).
- Licence for video and derived poster: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- Changes: Examination-date area at the upper left masked; original creator credits and scan anatomy retained. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### psax-normal.mp4 and psax-normal.jpg

Follow circumferential wall thickening and inward motion at the papillary-muscle level. Interpret alongside other levels and views. This loop is not a quantitative EF measurement, and foreshortening or obliquity can alter the apparent geometry.

- Creator: I.A.C. van der Bilt, MD, Department of Echocardiography AMC; CardioNetworks/ECHOpedia (Vdbilt) (2007).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:SAXPAP_normal_(CardioNetworks_ECHOpedia).webm); [original work](https://www.echopedia.org/).
- Licence for video and derived poster: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- Changes: Examination-date area at the upper left masked; original creator credits and scan anatomy retained. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### pericardial-effusion.mp4 and pericardial-effusion.jpg

Recognise pericardial fluid and inspect right-sided chamber motion in an apical cine from a published tamponade teaching case. Confirm collapse timing with ECG or M-mode and integrate haemodynamics. Effusion alone does not diagnose tamponade, and the clip is not an instruction to drain.

- Creator: Ben Smith, Ultrasound of the Week (2017).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:UOTW_78_-_Ultrasound_of_the_Week_2.webm); [original work](https://www.ultrasoundoftheweek.com/uotw-78/).
- Licence for video and derived poster: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Changes: Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### lung-sliding.mp4 and lung-sliding.jpg

Watch respiratory movement at the pleural line, between the rib shadows. Sliding excludes pneumothorax only at the location inspected. A single clip does not establish a normal whole-lung examination.

- Creator: Gillman LM, Ball CG, Panebianco N, Al-Kadi A, Kirkpatrick AW (2009).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S3.ogv); [original work](https://doi.org/10.1186/1757-7241-17-34).
- Licence for video and derived poster: [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Changes: The identifying/examination header across the top 28 pixels masked outside the scan anatomy. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### absent-sliding.mp4 and absent-sliding.jpg

Compare the pleural line with the sliding example. Movement beneath it is markedly reduced or absent. Absent sliding is nonspecific. Consider apnoea, pleural adhesions, mainstem intubation, severe lung disease and pneumothorax; integrate other signs and clinical context.

- Creator: Gillman LM, Ball CG, Panebianco N, Al-Kadi A, Kirkpatrick AW (2009).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S4.ogv); [original work](https://doi.org/10.1186/1757-7241-17-34).
- Licence for video and derived poster: [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Changes: The identifying/examination header across the top 28 pixels masked outside the scan anatomy. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### b-line-artefacts.mp4 and b-line-artefacts.jpg

Identify vertical bright artefacts arising at the pleural line and extending through the displayed image. The original source calls these comet-tail artefacts. Use contemporary B-line definitions and scan settings; the appearance alone does not establish pulmonary oedema or its cause.

- Creator: Gillman LM, Ball CG, Panebianco N, Al-Kadi A, Kirkpatrick AW (2009).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S6.ogv); [original work](https://doi.org/10.1186/1757-7241-17-34).
- Licence for video and derived poster: [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Changes: The identifying/examination header across the top 28 pixels masked outside the scan anatomy. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### lung-point.mp4 and lung-point.jpg

Follow the respiratory transition between sliding lung and a region without sliding in the published pneumothorax example. Confirm the expected A-line pattern on the non-sliding side and distinguish lung-edge mimics. Absence of a lung point does not exclude pneumothorax; do not infer tension physiology from the clip.

- Creator: Gillman LM, Ball CG, Panebianco N, Al-Kadi A, Kirkpatrick AW (2009).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv); [original work](https://doi.org/10.1186/1757-7241-17-34).
- Licence for video and derived poster: [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Changes: The identifying/examination header across the top 28 pixels masked outside the scan anatomy. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### lung-point-mimic.mp4 and lung-point-mimic.jpg

Sliding lung moves over mediastinal soft tissue with cardiac motion. The non-lung side lacks the expected A-line/no-sliding pattern. CT excluded pneumothorax in this published case. Compare the entire image pattern with the true lung-point example; a moving boundary alone is insufficient.

- Creator: Zhongheng Zhang and Lin Chen (2015).
- [Source and licence evidence](https://link.springer.com/article/10.1186/s13054-015-0863-3); [original work](https://doi.org/10.1186/s13054-015-0863-3).
- Licence for video and derived poster: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Changes: Identifying/time header masked; black pillarboxes removed and display proportionally resized from the original 1920 × 1080 container to 720 × 540. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### pleural-fluid.mp4 and pleural-fluid.jpg

Identify an anechoic pleural collection, diaphragm and adjacent compressed lung. Ultrasound appearance alone does not establish fluid composition. This clip is not a patient-specific map of a safe drainage route.

- Creator: Gillman LM, Ball CG, Panebianco N, Al-Kadi A, Kirkpatrick AW (2009).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S2.ogv); [original work](https://doi.org/10.1186/1757-7241-17-34).
- Licence for video and derived poster: [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Changes: The identifying/examination header across the top 28 pixels masked outside the scan anatomy. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### ivc-collapse.mp4 and ivc-collapse.jpg

Observe changes in IVC calibre and position during respiration. IVC variation is influenced by breathing effort, ventilation, abdominal pressure and right-heart function. This clip cannot prove hypovolaemia or predict fluid responsiveness.

- Creator: Gillman LM, Ball CG, Panebianco N, Al-Kadi A, Kirkpatrick AW (2009).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S8.ogv); [original work](https://doi.org/10.1186/1757-7241-17-34).
- Licence for video and derived poster: [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Changes: Non-square pixels normalised to 640 × 480 while preserving the original 4:3 display geometry; the source import already omitted its identifying header. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

### fast-free-fluid.mp4 and fast-free-fluid.jpg

Find the dark fluid stripe between the liver and kidney in this published trauma example. Ultrasound identifies fluid, not its composition. A negative FAST does not exclude bleeding, retroperitoneal injury or other causes of shock.

- Creator: Gillman LM, Ball CG, Panebianco N, Al-Kadi A, Kirkpatrick AW (2009).
- [Source and licence evidence](https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv); [original work](https://doi.org/10.1186/1757-7241-17-34).
- Licence for video and derived poster: [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Changes: Non-square pixels normalised to 640 × 480 while preserving the original 4:3 display geometry; the source import already omitted its identifying header. Transcoded to H.264 MP4 without changing sequence or playback speed. Audio and source container metadata removed. JPEG poster extracted at 0.15 seconds; it is a still from the processed clinical clip.

## Verification

All MP4 files decode successfully in FFmpeg; durations and frame geometry are recorded in the JSON manifest. Source and final sampled frames were inspected. Metadata/audio stripping was verified. Every frame of the eight masked videos was checked: the identifying header region is fully black throughout. File hashes bind the attribution records to the delivered assets. Browser playback should be included in the parent publication review.
