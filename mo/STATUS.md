# MO guide status

Paused on 15 Oct 2026 at the owner's request (usage limit). Pick up from here. First version merged to main on the
owner's instruction (PR #103, 15 Oct 2026): live, unlisted, at anantf.com/mo/. The remaining checks below go in a new PR.

## Done

- **Engine** (`mo/js/`, `index.html`, `style.css`, `sw.js`, `tools/stamp.mjs`). It was reviewed by three reviewers, and
  all 36 verified findings are fixed (commit c10fb25). See `NOTES.md` for the design and code map.
- **Tests all pass:** `calc.test.mjs` (24), `content.test.mjs`, `version.test.mjs`, `e2e.mjs` (every screen at phone
  size, plus axe), `pwa.e2e.mjs`.
- **Content is written** for everything in `PLAN.md`: 14 modules, 94 topics, 63 drugs, 21 crisis cards, 14 scenarios,
  204 flashcards and 8 figures. A coverage script confirmed nothing is missing, including the gap-check amendments at the
  end of `PLAN.md`.
- **Checks completed.** Each piece had an author, then a clinical (or numbers) check, then a teaching (or safety) check.
  - Drugs (core and more): numbers and safety checks done.
  - Crises and figures: numbers check done.
  - Clinical check done for: preop, maintenance, regional, induction, setup, pain-aps, emergencies, start, pacu, cases,
    patients, emergence, sedation, scenarios, cards.
  - Teaching check done for: preop, maintenance, induction, setup, emergencies, start, cards.

## Not done yet (next steps, in order)

1. **Finish the checks that were stopped or never ran:**
   - Safety check: `crises`, `figures`.
   - Clinical check: `good`.
   - Teaching check: `patients`, `regional`, `pain-aps`, `cases`, `scenarios`, `emergence`, `sedation`, `good`, `pacu`.

   The prompts are the "clinical checker" and "teaching checker" roles. Each reads `mo/CONTENT.md`, `mo/PLAN.md` and the
   handbook, fixes the file directly, and runs `node mo/test/content.test.mjs`.
2. **Run a cross-module consistency review.** Look for the same fact stated differently across modules, drugs, crisis
   cards, flashcards and scenarios: doses, thresholds, rules for baby MOs. Fix each one.
3. **Run the final tests,** then stamp: `node mo/tools/stamp.mjs`. Take phone screenshots
   (`SHOTS=<dir> node mo/test/e2e.mjs`).
4. **Open a new PR** with the fixes, listing the handbook discrepancies below for the owner. Merge it (squash) per
   AGENTS.md and report.
5. **Optional:** a link from the Baby MO test start page to the guide. This needs `node babymo/tools/stamp.mjs` and the
   babymo tests.

## The handbook (source)

`NTF MO handbook.pdf` is on the owner's Google Drive, file id `12Xw_spV2s_6Tw3T84OtaUlWZJ9kMHUmX`. Read it with the
Google Drive connector (`read_file_content`). The PDF is 33 MB, too big to download, but the text reads fine.

It is internal: **never commit its text.** The admin sections, names and phone numbers stay out of the app (see
`NOTES.md`). A session that needs it puts an extracted copy in its scratchpad only.

## Handbook discrepancies to tell the owner

The guide departs from the handbook in these places, or says both:

- **Phenylephrine self-dilution.** The handbook says "1 mg in 100 mL = 100 mcg/mL". That works out to 10 mcg/mL.
- **Rocuronium for RSI.** The handbook says "1 mg/kg lean body weight", which under-doses most adults. The guide teaches
  1–1.2 mg/kg on ideal weight and quotes the handbook. **The owner should decide.**
- **Blood volumes.** The handbook gives adult 60 and 50 mL/kg. The guide uses 70 (men) and 65 (women).
- **Sugammadex.** The handbook gives "4 mg/kg (TOF 3/4)". Standard practice is 4 mg/kg for a deep block (PTC 1–2).
- **Preoxygenation.** The handbook says EtO2 > 80%; the guide adds "aim for 90% or more".
- **MAC-awake.** The handbook says about 0.2 MAC; most texts give 0.3–0.4.
- **Extubation tidal volume.** The handbook says "above dead space, 2 mL/kg"; the usual aim is 5 mL/kg or more.
- **Fasting deficit and insensible losses.** The handbook's formula was garbled in the text. The guide adds the modern
  caveat against overfilling.
- **Antiplatelet stopping times.** The guide adds that aspirin is usually continued, and adds ticagrelor, edoxaban and
  warfarin.
- **Nurse-led discharge.** The handbook's ASA III wording contradicts itself. The guide states the cataract exception
  plainly.
