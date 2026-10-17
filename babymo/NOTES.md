# Baby MO test notes

Lasting decisions for `babymo/` (anantf.com/babymo/, and mo.anantf.com/test/ since 16 Oct 2026: same files, served by the Worker in `MO.md`; the Firebase authorised domains need both). Cloud setup: `SETUP.md`. Status and the decisions log are at the end.

## Purpose

**Audience: the baby MOs of Ng Teng Fong General Hospital (NTFGH) anaesthesia.** Official
department material, so it lives here and not with other apps. It has no
link to any rostering app.

The department's MCQ test for new MOs (every few months a new group rotates in): the **Baby MO Test**, 20 questions
(pass 80%, 20 minutes, one answer each, no negative marking) that used to be a Word paper. Later modules
(not built): CBD discussions, feedback. Keep the portal a set of small modules behind one sign-in.

## Where the questions are

- The questions are **not in this app or in Firebase any more**. They live in the department's question bank,
  `qbank/bank/questions.json`, and the test is the paper `qbank/papers/babymo.json` (which questions, which are
  must-ask, count, pass mark, minutes, attempts, hard per sitting). Read `qbank/NOTES.md` for the format and how
  questions change. Questions are public: don't put anything confidential in one.
- **Nobody edits questions in this app.** Faculty open a question under **Paper** and tap **Suggest a change**, which
  opens the qbank app (`../qbank/#/q/<id>?suggest`); the owner approves every change. Don't add an editor back here.
- This app only reads the two files (`js/app.js` `loadPaper()`, then `resolvePaper()` from `qbank/js/bank.js`, the
  shared logic: never copy it). Only questions that are `active` and complete are drawn; drafts show to faculty on the
  Paper page as "Not given to MOs yet".
- `qbank/` is owned by the question bank; don't edit it from Baby MO work.

## Who uses it, and how they get in

- **MOs**: name + one shared passphrase. No Google account. Behind the scenes Firebase *anonymous* sign-in plus a
  `sessions/{uid}` document that the rules only allow if the passphrase matches `config/access`. Changing the
  passphrase locks out old sessions, so change it per intake.
- **Faculty**: Google sign-in; the email must be in `members` (role `editor`, shown as "Faculty", or `admin`). Anyone
  signs in and asks for access; any faculty member approves. Admins also change the settings, the passphrase and
  roles, remove people and delete results.
- Security is deliberately light ("security isn't that important"). The answer key is public anyway (the bank is in
  this repo).

## How a sitting is made and marked

- Settings come from the paper, then from Firebase `config/test` on top: count, pass mark, minutes and attempts can be
  overridden by an admin (Settings, with "Use paper default"); review mode, cohort and the message before the test
  are only in Firebase. Hard questions per sitting come from the paper (`hardCount`). The rules require count, pass
  mark and minutes in `config/test`, so "Use paper default" writes the paper's number rather than leaving it empty.
- A sitting draws every **must-ask** question (from the paper), then `hardCount` **hard** ones, then the rest at random;
  question order is shuffled, choices keep the order they were written in ("all of the above" works). 2 to 6 choices.
  If fewer questions are ready than the count, the sitting is as long as the ready list (the Ready screen says so).
- The draw happens when the MO taps **Begin**, which also uses up an attempt (`attemptCounts/<cohort>__<name>`, raised
  by exactly 1 within the limit; the rules enforce it). Faculty give another attempt from the person's page, with Undo
  (`grantAttempt`, `setAttemptCount`). Name spelling matters; a new cohort name starts everyone fresh.
- **Past results never change**: each attempt stores a snapshot of every question as the MO saw it (`qid` = the bank
  id, stem, choices, answer, topic, explanation, the MO's pick), and scores are worked out from the snapshot
  (`summarise`), never from a stored number. Pictures are not stored in the snapshot (the rules only allow those
  fields); old attempts from before the bank keep their old Firestore question ids.
- Review after submitting (setting): score only, right or wrong, or full review with the right answers. ("None" and
  "wrong only" from the design spec need a rules change: not built.)

## The app (design, 15 Oct 2026)

Phone first, like a native app. It follows **`DESIGN-APP.md` and uses the shared kit `../assets/app/app.css`**
(AGENTS.md: every installable app does), with Baby-MO-only bits in `style.css` (navigator dots, stepper, save bar,
result layout) using the kit's tokens. No site header: a 44px bar with a large title that collapses into it, grouped
inset lists on the warm ground, bottom sheets (grabber; Android back and the iOS swipe close them), toasts, segmented
controls. The kit is CSS only; `js/ui.js` holds the little JavaScript that drives it (sheets, toasts, steppers, the
collapsing title, the version rows).

- **MO, one path, no tab bar**: Start (name, passphrase) → Ready ("14 questions · 20 minutes · pass 80% · attempt 1 of
  2"; must-ask is never mentioned) → the test (× leave, "Q 3/14" opens the navigator, timer, flag; toolbar Back ·
  Clear · Next, then Finish → check sheet) → Result (score ring, Pass or Not yet, "Saved" or "Saving your result…").
- **Faculty tabs**: Results (by person with "Needs help" pinned, by question with "Difficult" under 35% once 5 have
  answered, by topic; cohort picker), Paper (read-only), People (approve, decline, roles), Settings.
- History of the look: the workflow's design spec (15 Oct 2026) asked for square edges everywhere; `DESIGN-APP.md`
  (#111, merged the same day) replaced that for installable apps with soft corners and grouped lists, so the app was
  moved onto the kit before merging. Remaining deviations, and why: a light entrance animation instead of
  `startViewTransition` (screens render synchronously, so wiring and tests stay simple); the toolbar is Back · Clear ·
  Next (the flag is in the top bar, not twice); roles are labelled Faculty and Admin, because nobody edits questions
  here any more; three review modes (see above); Begin needs a signal in the real app because it counts the attempt on
  the server (the paper itself is cached and works offline); read-only choices are not dimmed (the kit's 60%
  `.is-dimmed` falls below 4.5:1 contrast).
- Every button row and segmented control fits on one line at 390px (the browser test checks this with `oneRow`), and
  axe is clean on every screen, phone and desktop.

## Code map

- `js/logic.js`: pure logic (settings from the paper and Firebase, drawing a sitting, marking, results by person,
  question and topic, CSV); tests in `test/logic.test.mjs`.
- `js/ui.js`: drives the kit (sheets, toasts, segmented controls, steppers, collapsing title, version rows).
- `js/local.js`: browser-only backend (demo and "not connected yet"); `js/cloud.js`: Firebase backend; `js/store.js`
  picks one. Same functions in both: any change to one needs the other. The old question and topic functions were
  removed with the editor (15 Oct 2026); the rules still allow those paths (see Status).
- `js/app.js`: all screens (hash routes: `#/`, `#/ready`, `#/test`, `#/result`, `#/faculty/results|person|attempt|
  question|paper|people|settings`).
- `firestore.rules` (project `ntf-mo-portal`, published by hand: `SETUP.md` step F). Untouched by the bank move.

## Tests

`node babymo/test/logic.test.mjs`, `node babymo/test/version.test.mjs`, `node babymo/test/e2e.mjs` (demo mode with the
real bank, phone size, axe on every screen, one-row checks, a desktop pass; `SHOTS=<dir>` saves screenshots),
`node babymo/test/pwa.e2e.mjs` (install, offline, the bank files through the worker, safe updates),
`babymo/test/run-rules.sh` (rules, local emulator) and `babymo/test/run-cloud.sh` (the app against the local Auth and
Firestore emulators). After a change to `qbank/` also run `node qbank/tools/check.mjs`.

## Address and publishing

`https://anantf.com/babymo/` (GitHub Pages). Unlisted: not linked from the homepage or the main navigation, `noindex`.
The owner shares the link and the passphrase with each new group of MOs. Firebase's authorised domains must include
`anantf.com` and `www.anantf.com` (`SETUP.md`). There is no deploy workflow: `firestore.rules` is pasted into the
Firebase console by hand (`SETUP.md` step F), so tell the owner whenever that file changes.

## Installable app (PWA) and updates

Installable from the browser menu (Android: "Install app"; iPhone: Share, Add to Home Screen) and opens with no signal.
Built around known problems with installed web apps:

- **Safe updates.** A new version **waits** (no `skipWaiting` on install). The page tells it to take over only on a
  top-level screen (start page, or a faculty tab) with no test open, no sheet open, no field focused and nothing typed;
  on a screen deeper in it shows a toast "Update ready · Restart" instead. It never switches during a test, on the
  Ready or Result screens, or while someone is typing. Nothing reloads on the first install. Pull-to-refresh is off.
  Two lessons from the browser test (15 Oct 2026): read `reg.waiting` whenever deciding (an `updatefound` handler can
  run after the worker has already installed), and Chrome sometimes holds a `skipWaiting()` while the old worker
  still counts the open page as busy, so if nothing has happened 3 seconds after asking, the page reloads anyway (still
  only when safe); the message handler uses `e.waitUntil(self.skipWaiting())`.
- **Updates are found.** The page calls `reg.update()` when it comes to the front, when signal returns and every 10
  minutes.
- **All or nothing.** `sw.js` caches every file into one cache per version on install (`addAll`); if any file fails the
  old version stays. Only `babymo-` caches are touched.
- **What is cached.** `SHELL` (this folder), `SITE` (the app kit `assets/app/app.css`, the fonts, the monogram and the
  bank's code `qbank/js/bank.js`) and
  `DATA` (`qbank/bank/questions.json`, `qbank/papers/babymo.json`). Everything is network first (3 s, then the cache).
  The worker answers for the `SITE` and `DATA` files although they are outside its folder (the browser sends every
  request from a page it controls to it; `pwa.e2e.mjs` checks this).
- **VERSION is a hash of SHELL and SITE**, because this site has no deploy step that stamps it: after changing any of
  those files, including `assets/app/app.css` and `qbank/js/bank.js`, run `node babymo/tools/stamp.mjs`; `node babymo/test/version.test.mjs`
  fails if it was forgotten. `DATA` is not hashed: a change to a question needs no new Baby MO version (it is fetched
  fresh whenever there is a signal).
- **Results are never lost, and you can see when one is waiting.** A finished test goes into a local outbox and is sent
  again when signal returns, when the page comes to the front, every minute while open and on opening. While one is
  waiting the start and result screens show "Saving your result…" and say the result is only on this phone.
- **App version and "Get the latest version"**: at the foot of the start page and of Settings, "App version <date>
  (<hash>)" from the `babymo-` cache name, and a button that checks for a signal by fetching `sw.js`, then unregisters
  the worker, deletes only `babymo-` caches and reloads. It never touches saved answers, the outbox or sign-in.
- Faculty Google sign-in uses a popup, which can fail in an app installed on an iPhone: faculty should use the browser.
- Icons are the NTF monogram (`icons/`), made from `ana-ntf-monogram.svg`.

## Status (17 Oct 2026)

- Live at anantf.com/babymo/ and mo.anantf.com/test/ (same files, #132; see `MO.md`) with the Firebase project `ntf-mo-portal`. Revamped phone app (#117) on the shared kit.
- The paper has 30 ready questions, each with an explanation (#120, #121), so a sitting is the full 20.
- Firestore rules: the old `questions`, `questions/*/history` and `config/topics` paths are closed (#123). The rules
  were pasted and the leftover question documents deleted (15 Oct 2026).
- Worth doing before the next intake: install on a real iPhone and Android phone and sit
  one test (only tested in phone-sized browsers so far).
- Live Firebase/Cloudflare changes: ask the owner.
- Ideas, not agreed: CBD discussions and feedback as further modules; per-MO history across cohorts.

## Decisions log

- 14 Oct 2026: first version, moved here from an earlier version (official department material). Questions were
  stored in Firestore and edited in the app by faculty (forms, paste from Word, spreadsheet round trip, backup,
  history, conflict checks, topics, bulk changes, duplicate finder), so non-technical faculty could
  edit without AI.
- 14 Oct 2026: two attempts per person per cohort, must-ask and hard questions, pass mark 80%; installable app with an
  outbox and the version line.
- 15 Oct 2026: the questions moved to the public question bank `qbank/` with permanent ids, because Firebase
  was out of reach for assistants and a restored backup had duplicated the bank. Faculty now suggest changes and the
  owner approves them. This app lost its editor, paste, topics page, bulk select, backup/import and duplicate tools;
  it reads the paper and the bank, shows them read-only under Paper, and keeps results, people and settings in
  Firebase. Rebuilt as a native-feeling phone app at the same time (the design spec above).
- 15 Oct 2026: all 15 remaining drafts promoted with the proposed keys; explanations written for every question
  (arguable keys kept, the explanation says why: laryngospasm "100 mg suxamethonium", propofol vs ketamine in asthma,
  ProSeal leak pressure, ABG compensation, thyromental distance). The Brugada question uses an open-licence ECG
  (CC BY-SA 4.0, credit in `qbank/img/CREDITS.md`) with the original options and key.
- 15 Oct 2026: old question paths removed from the rules and the old data deleted.
