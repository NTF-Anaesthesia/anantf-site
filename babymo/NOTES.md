# Baby MO test notes

Lasting decisions for `babymo/` (anantf.com/babymo/). Cloud setup: `SETUP.md`. Status is at the end of this file.

## Purpose

**Audience (owner, 14 Oct 2026): the baby MOs of Ng Teng Fong General Hospital (NTFGH) anaesthesia.** Official
department material, so it lives here and not in anawj.com (owner's decision, 14 Oct 2026). It has no link to any NUH
rostering app.

The department's tests and later discussions for new MOs (every few months a new group rotates in). First module: the
**Baby MO Test**, the 20-question MCQ (pass 16/20 = 80%, 20 minutes, one answer each, no negative marking) that used to
be a Word paper. Later modules the owner has in mind (not built): CBD discussions, feedback, questions. Keep the portal
a set of small modules behind one sign-in; add them as nav links, don't bend the test code.

## Who uses it, and how they get in (owner, 14 Oct 2026)

- **MOs**: name + one shared passphrase. No Google account. Behind the scenes Firebase *anonymous* sign-in plus a
  `sessions/{uid}` document that the rules only allow if the passphrase matches `config/access`. Changing the
  passphrase locks out old sessions, so change it per intake.
- **Faculty**: Google sign-in; the email must be in `members` (role `editor` or `admin`). Admins also change settings,
  the passphrase and the faculty list, and delete things.
- Security is deliberately light ("security isn't that important"). Honest limits: the correct answers are in the
  question documents, so a determined MO with browser developer tools could read them; faculty can see the passphrase.
  Don't put anything confidential in a question.

## Design rules

- **Non-tech faculty must be able to edit without AI**: forms, not files. One question per screen, plain words, status
  Draft / In the test / Archived (drafts may be unfinished and are never given to MOs), live preview, paste-many from
  Word, spreadsheet round trip, full JSON backup.
- **Robustness**: a test in progress survives reload (answers and the start time are saved; the clock runs from the
  saved start); the timer auto-submits; a finished attempt waits in a local outbox until the server has it (retried on
  reconnect; ids make a retry idempotent); unsaved question edits are kept on the device; saves use a revision number so
  two editors can't silently overwrite each other (the second is asked); every save keeps a history entry.
- **Attempt limit and question flags (14 Oct 2026)**: each sitting draws 20 from a large bank; questions may be `must` (in every sitting) or `level: 'hard'` (a `hardCount` of them mixed in, default 4); both optional, old questions read as standard. Pass mark 80%. Each MO gets `maxAttempts` (default 2) sittings, counted in `attemptCounts/<cohort-slug>__<name-key>` ({n, updatedAt}): the rules let an MO create it at 1 and raise it by exactly 1 up to the limit (never lower or delete it, and only `get` by key, no list); faculty set or delete it (`grantAttempt` = another attempt). `cloud.js`/`local.js`: `getAttemptCount`, `bumpAttempt` (throws code `limit`), `grantAttempt`, `listAttemptCounts`. Attempts may carry `attemptNo`.
- **Past results never change**: an attempt stores a snapshot of each question (stem, options, answer) as the MO saw it,
  and scores are recomputed from the snapshot (`summarise`), not read from a stored number. Editing a question later is
  safe.
- Questions are drawn at random (up to the configured count) from the questions that are "In the test" and complete;
  question order is random, choices keep the order faculty wrote (so "all of the above" works).
- Pictures (ECG, X-ray) are shrunk in the browser to a JPEG under 400 KB and stored in the question.
- Real question text is **not** in this public repo. The bank lives in Firestore; the owner imports it from a JSON
  backup. The demo has six invented sample questions in `js/local.js`.

## Code map

- `js/logic.js`: pure logic (validation, drawing a test, marking, paste parser, CSV, backup JSON, stats); tests in
  `test/logic.test.mjs`.
- `js/local.js`: browser-only backend (demo and "not connected yet"); `js/cloud.js`: Firebase backend; `js/store.js`
  picks one. Same functions in both: any change to one needs the other.
- `js/app.js`: all screens (hash routes: `#/`, `#/ready`, `#/test`, `#/result`, `#/faculty…`).
- `firestore.rules` (project `ntf-mo-portal`, published by hand: `SETUP.md` step F).

## Tests

`node babymo/test/logic.test.mjs`, `node babymo/test/e2e.mjs` (demo mode in a browser at phone size + axe),
`babymo/test/run-rules.sh` (rules, local emulator), `babymo/test/run-cloud.sh` (browser against the Auth and
Firestore emulators, if present).

## Address and publishing

`https://anantf.com/babymo/` (GitHub Pages, like the other pages here). Unlisted: not linked from the homepage or the main
navigation, `noindex`. The owner shares the link and the passphrase with each new group of MOs. Firebase's authorised
domains must include `anantf.com` and `www.anantf.com` (`SETUP.md`). There is no deploy workflow: `firestore.rules` is
pasted into the Firebase console by hand (`SETUP.md` step F), so tell the owner whenever that file changes.

Design: follows `../DESIGN.md` (warm paper, wine accent, square, light only) and the site header and footer. Clinical
colours do not apply here; green and amber are only used for pass and draft status.

`sw.js` has no deploy stamp on this site: bump `VERSION` when a shell file changes.

## Status

- 2026-10-14: first version, moved here from the anawj-site branch at the owner's request (this is official department
  material). Local/demo mode works now; shared storage waits for the Firebase project (`SETUP.md` A to E, about 20
  minutes) and the owner sending the config block.
- The real question bank is not in this repo: the owner imports a JSON backup (Questions > Backup and import). It has
  14 questions ready and 16 drafts for faculty to check.
- Next (ideas, not agreed): CBD discussions, feedback and questions as further modules; per-MO history across attempts.
