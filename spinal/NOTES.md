# Spinal page: lasting rules and lessons

For anyone (human or assistant) editing `spinal/`. Architecture is in `js/V3-SHELL.md` (chapters, routing, app bar) and
`js/TIERS.md` (levels). The shared regional rules are in the repo `AGENTS.md` and `shared/regional/ENGINE.md`.
Status and open questions: `STATUS.md`.

## Content rules (set by the owner, Dr Koh Wenjun)

- **Doses.** Bupivacaine doses are the department's typical doses, not the manufacturer's label range. The label range is not
  shown for bupivacaine. Never add a dose that is not already on the page unless it has been verified against a published
  source and the owner has agreed. Prilocaine shows its label dose. Chloroprocaine is not stocked here and is not in the
  dose tables (one line in Pharmacology says so).
- **Wording.** Plain British English. Never write "check local policy" or "per local protocol". Cite only major guidelines
  where relevant, and product labels only on dose lines.
- **Levels.** MO (tier 1), Resident (tier 2), Consultant (tier 3), cumulative. Doses, the LAST line, complications and the
  troubleshooting guides stay at MO level. No "quick read" mode. No quiz (removed at the owner's request, Oct 2026).
- **Privacy.** Nothing from internal or restricted hospital documents, no staff names, extensions or document numbers, no
  paid textbook or journal text. Paraphrase ideas; do not copy model answers.
- **Credit.** "Created by Dr Koh Wenjun and Dr Chew Shi Hao, NTF Anaesthesia", with Dr Chew linked to https://chewshihao.com/.
  Keep the page unlisted (noindex, no link from the homepage).
- **Spinal's own troubleshooting trees stay the main troubleshooting content.** The shared "If it goes wrong" guides are an
  extra section at the end (`#ts-wrong`), limited to the ones that apply to a spinal. The shared guides are written mainly
  for nerve blocks and do not replace spinal's trees.

## Working rules

- Branch, pull request, check the page in a browser with no console errors, then squash merge (unless the owner asks to
  wait). Preview clinical changes with the owner first when they are large.
- After changing anything in `spinal/`: run `node shared/regional/tools/stamp.mjs`, then `node shared/regional/test/run-all.mjs`
  (and `RA_SKIN=app node shared/regional/test/<suite>.mjs` for the app look). Do not edit `shared/regional/` without asking the
  session that owns it.
- Sticky things under the bar use `top: var(--ra-bar-now, var(--ra-bar, 56px))`. Rules added to `css/skin-app.css` sit under
  `html[data-skin="app"]`.
- Keep every anchor. Old links (including those the MO guide uses) must keep working; retired ids go in `ALIAS` in `js/app.js`.
- Citations are drawn from each module's `refs`; an id that is no longer registered renders nothing, so removing a source
  means removing its `cite(...)` calls too.

## Lessons

- When a pull request is created, merge the number the tool returned. Guessing the number once merged a different,
  unrelated pull request.
- A teaching figure that quotes a dose (for example a block height for "3 mL") goes stale when the department dose changes;
  describe the effect without the number where possible.
- A heavy (hyperbaric) vs plain (isobaric) bupivacaine statement must match the dose beside it: plain bupivacaine is slightly
  hypobaric at body temperature, so for plain drug the operative side up is the comfortable position for a hip.
- The long chapters (Technique, Exam) are very long on phones; the Topics button and chips help, but splitting them is still
  open (see `STATUS.md`).
