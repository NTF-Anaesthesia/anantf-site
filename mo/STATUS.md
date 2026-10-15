# MO guide status

Paused on 15 Oct 2026 at the owner's request (usage limit). Pick up from here. First version merged to main on the
owner's instruction (PR #103, 15 Oct 2026): live, unlisted, at anantf.com/mo/. The remaining checks below go in a new PR.

## Done

- Engine, reviewed and fixed; all tests pass (calc, content, version, e2e, pwa).
- All content written and checked: every module had an author, a clinical check and a teaching check; drugs and crisis
  cards had numbers and safety checks; figures were rendered and looked at.
- Version 1 merged (PR #103), then the remaining checks in a second PR (15 Oct 2026).

## Not done yet

1. **Cross-module consistency review:** the same fact stated differently across modules, drugs, crisis cards,
   flashcards and scenarios (doses, thresholds, rules for baby MOs). One known small gap: suxamethonium for
   laryngospasm is `1 mg/kg` in the topic and crisis card but `1–1.5 mg/kg` in the scenario and drug card.
2. **Faculty read-through** before sharing widely. Points for a consultant to decide:
   - rocuronium RSI dose basis (below)
   - whether the longest crisis cards should be shorter, and whether to keep the recruitment manoeuvre on the hypoxia card
   - whether a junior may give suxamethonium for laryngospasm before the consultant arrives
   - atropine dose in cardiac arrest (0.6 mg up to 3 mg, vagal cause) as the department's preference
   - confirm the standard pharmacy phenylephrine syringe is 100 mcg/mL
   - scenario pacu-drowsy gives sugammadex 2 mg/kg after neostigmine (TOF ratio 0.6)
   - the needlestick pathway wording (where NTFGH sends staff)
   - some core topics run 1,200-1,400 words with quizzes; split into two screens?
3. Optional: a link from the Baby MO test start page to the guide (needs `node babymo/tools/stamp.mjs`).

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
