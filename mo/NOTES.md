# MO guide notes

Lasting decisions for `mo/` (anantf.com/mo/). How the content is written: `CONTENT.md`.

## Purpose (owner, 15 Oct 2026)

A practical learning web app for new anaesthesia medical officers ("baby MOs") at NTFGH. It covers the department's MO
handbook (4th edition, 2026) and goes beyond it: short topics in the order an MO meets them, drug doses worked out for the
patient's weight, crisis cards, calculators, branching case scenarios, flashcards and check-yourself questions, with
progress kept on the phone. It sits beside the Baby MO test (`../babymo/`), which new MOs pass before starting calls.

## What is in it, and what is not

- **In:** the handbook's clinical and practical content (conduct, what each duty involves, pre-op assessment, set-up,
  induction, maintenance, emergence, PACU, regional, MAC, drug doses and dilutions, green note, Epic smartphrases, where
  the pacemaker magnets are), plus "beyond" topics marked as such.
- **Not in (on purpose):** the handbook's administrative sections (rosters and roster rules, leave, MC policy, who to
  email), personal names and phone numbers (device-vendor on-call numbers are on the intranet). Those belong on the
  department intranet (AGENTS.md: handbooks, rotas and internal contacts are not for this site), and the encrypted MO
  handbook page was removed on 14 Oct 2026 for that reason. Don't add them back.
- The handbook itself is not in this repo. Its values are the local truth; where the guide departs from it (an error or an
  out-of-date number in the handbook) the topic says so, and `STATUS` below lists them for the owner.

## Design rules

- Follows `../DESIGN.md` (warm paper, ink, wine accent, square, hairlines, light only) and the site header and footer.
  Clinical colours keep their meaning: crisis red, warning amber, monitor colours in scenarios, syringe label colours
  (ISO 26825) on drug cards.
- Phone first (390 px). Five tabs: Learn, Drugs, Tools, Crisis, Practice. Every screen has a link (hash routes, Back works).
- **Doses:** adults unless a page says otherwise. The patient's weight (and optional height and sex, for ideal, lean and
  adjusted weight) is kept for the browser tab only and cleared after 6 hours, so yesterday's patient is never used.
  Without height, lean/ideal-weight doses fall back to total weight and say so.
- **Progress** (topics read, checklist ticks, quiz answers, flashcard boxes, scenario scores) is in localStorage on the
  phone only. Nothing is sent anywhere; there is no sign-in.
- Content is data (`js/content/*.js`, `js/data/*.js`); the engine never needs editing to change a page. Inline markup is
  only `**bold**`, `` `value` `` and `[link](#/route)`; text is escaped, so content can't inject HTML.
- Unlisted: not linked from the homepage or main navigation; `noindex`. The owner shares the link.

## Code map

- `js/app.js` screens and router; `js/render.js` content blocks; `js/drugs-ui.js` drug cards and the patient panel;
  `js/tools.js` calculators and builders; `js/practice.js` scenarios, flashcards, check yourself, drawer game;
  `js/search.js`; `js/store.js` progress and patient; `js/md.js` inline markup; `js/figures.js` drawings;
  `js/calc.js` every sum (pure, tested).
- Data: `js/content/index.js` (module order, groups), `js/content/<module>.js`, `js/data/drugs.js` (groups) with
  `drugs-core.js` and `drugs-more.js`, `crises.js`, `scenarios.js`, `cards.js`.

## Tests

`node mo/test/calc.test.mjs` (every calculation), `node mo/test/content.test.mjs` (every data file: ids, links, block
fields, scenario graphs, British spelling, no phone numbers or HTML), `node mo/test/version.test.mjs` (offline file list
and version), `node mo/test/e2e.mjs` (every screen at phone size + axe), `node mo/test/pwa.e2e.mjs` (install, offline,
updates). `SHOTS=<dir> node mo/test/e2e.mjs` saves phone screenshots.

## Installable app (offline) and updates

Same rules as the Baby MO test (`../babymo/NOTES.md`): one cache per version filled all at once, network first with a
3-second fallback to the cache, a new version takes over by itself but the page reloads only when safe (never on the first
install, never with a calculator half filled, mid-scenario, mid-flashcards or on a crisis card), and the page looks for
updates when it comes to the front. It also caches the shared site header, styles and fonts (`SITE` in `sw.js`) so the
guide looks right with no signal.

**After changing any file in `mo/` (content included) run `node mo/tools/stamp.mjs`**: it rewrites the file lists and
`VERSION` (`mo-<date>-<hash>`) in `sw.js`. `node mo/test/version.test.mjs` fails if you forget. The start page and About
end with "App version <date> (<hash>)" and "Not updating? Get the latest version", which clears only this app's worker
and `mo-` caches (never progress) after checking for a signal.

## Status

- 2026-10-15: first version. 14 learn modules, about 60 drugs, 20 crisis cards, 14 scenarios, 8 flashcard decks,
  14 calculators. Content written and checked by AI (each module by an author, a clinical checker and a teaching checker)
  against the handbook; **it needs a read-through by the department's faculty before it is shared widely.**
