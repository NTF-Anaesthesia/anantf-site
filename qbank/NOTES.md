# Question bank notes (`qbank/`)

The department's shared bank of MCQs: one format for every quiz on anantf.com. Lasting decisions live here.

## Why it is in GitHub (owner, 15 Oct 2026)

- Questions used to live only in the Baby MO test's Firebase database, which assistants can't reach from a session,
  and importing a backup without ids duplicated the whole bank. The owner decided the questions are **not secret**
  ("if the MOs cheat it's their loss"), so the bank moved into this public repo: every change is a reviewed commit with
  history, assistants can edit it directly, and other apps can read the same file.
- Firebase keeps only what must stay private or live: Baby MO sign-in, the passphrase, results and attempt counts.
- The answer key is public. Don't put anything confidential, patient-identifiable or copyrighted in a question
  (pictures included: only images the department owns or may share).

## Files

| Path | What it is |
|---|---|
| `bank/questions.json` | The bank: `{ kind: 'ntf-qbank', version: 1, questions: [...] }` |
| `papers/<id>.json` | One test made from the bank (today `babymo.json`): which questions, must-ask, hard, count, pass mark, time, attempts |
| `img/` | Pictures used by questions (`image: 'img/<file>'`) |
| `sources.json` | Question files from other apps to show alongside the bank (empty for now; see "Other apps") |
| `js/bank.js` | The shared logic: clean, check, duplicates, papers, CSV, suggestion text. Apps import it; don't copy it |
| `tools/check.mjs` | `node qbank/tools/check.mjs`: checks the bank and papers (run after every change; exit 1 = must fix) |
| `tools/sheet.mjs` | Spreadsheet round trip: `export [file.csv]`, `import file.csv` (merges by id, deletes nothing) |
| `test/bank.test.mjs` | Unit tests |
| `index.html`, `manifest.webmanifest`, `icons/`, `sw.js` | The qbank app (see "The qbank app" below) |
| `ui/app.css`, `ui/ui.js` | The shared phone-app look and building blocks (bars, tabs, sheets, toasts, controls, safe updates). Meant for the Baby MO test too: import by relative path, don't copy |
| `js/app.js`, `js/practice.js` | The app's screens; practice logic (what to ask, sessions, scores, mastery), pure and unit-tested |
| `papers.json` | The list of papers the app shows. Written by `tools/stamp.mjs`; don't edit. It sits outside `papers/` so `check.mjs` doesn't read it as a paper |
| `tools/stamp.mjs` | `node qbank/tools/stamp.mjs`: writes `papers.json` and the offline lists and `VERSION` in `sw.js`. Run after any change in `qbank/` |

## A question

`{ id, stem, options: [2-6], answer: index, explain, topics: [..], level: 'standard'|'hard', status, image, source, review, updated }`

- **id** is permanent and never reused: papers, results and spreadsheet imports find questions by id. New questions get
  one from `idFor(stem)` (`q` + 7 letters/digits). Never renumber.
- **status**: `draft` (being written or checked; never shown to learners as a real question), `active` (ready),
  `archived` (retired; kept so old results still make sense). Retire, don't delete.
- **review**: open notes for the checker ("answer key doubtful because ..."). Clear it when the owner has decided.
- **level** is the question's general difficulty. A paper may list its own `hard` ids instead.
- **Must-ask belongs to the paper**, not the question: what every baby MO must answer isn't a property of the question.
- `check.mjs` refuses: repeated ids, two live questions that look the same (same opening, or one stem extending the
  other), a ready question with a blank choice or no answer, a paper listing an id that isn't in the bank.

## How faculty change questions (owner, 15 Oct 2026)

Faculty don't use GitHub. **The owner approves every change** before it reaches the bank (for now).

1. **Suggest a change** (everyday route), on any question in the qbank app: edit the wording, choices or answer, or
   just write a comment, then Send. Two ways out, like the page editor: open it as a GitHub issue titled
   `Question edit: <id> (<name>)` (for maintainers with GitHub), or **copy the text** and send it to the owner, who
   pastes it into a Claude session. `suggestionText()` / `suggestionIssueUrl()` in `js/bank.js` build both.
   An assistant applying them: read open `Question edit:` issues (and pasted batches), list what would change, and wait
   for the owner's go-ahead before merging; then comment on the issue and close it.
2. **Spreadsheet** for bulk review: `node qbank/tools/sheet.mjs export` gives one row per question (assistants can
   put it into a Google Sheet with the Sheets connector); faculty edit the sheet; `import` merges the rows back by id
   (new rows get ids, nothing is deleted), then `check.mjs`. Same owner approval before merging.

Later, if suggestions pile up: a Worker that turns a suggestion into an issue without a GitHub account, or
auto-applying suggestions from a named list of faculty. Not built.

## Other apps

The MO guide (`mo/js/data/scenarios.js`, `cards.js`), the spinal page's exam section and some anawj.com apps have
quiz-like items in their own formats. The owner wants one bank "for everyone" eventually, but those apps are being
heavily edited (15 Oct 2026), so nothing is pulled in automatically yet. When an app settles: it publishes its items as
a file in this format (or a small converter writes one) and the file's URL goes in `sources.json`. Keep each app the
owner of its own items; the qbank app only reads them.

## The qbank app (anantf.com/qbank/, 15 Oct 2026)

Practice for every learner: no sign-in, nothing sent anywhere. It follows the design spec of 15 Oct 2026 (one look for
qbank and the Baby MO revamp) and `DESIGN.md`: square edges everywhere except true circles (letter badges, score ring,
navigator dots, sheet grabber); the native feel comes from bars, sheets, safe areas, press feedback and motion.

- **Tabs**: Practise (Start 10 questions, Resume card, By topic, Exam mode, My missed, Flagged, Custom practice),
  Browse (search, topic chips, topics, question detail with Show answer), Papers (each `papers/*.json`, sat as a timed
  paper with its draw rules and pass mark; no attempt limit), Progress (days this week, totals, mastery per topic,
  history, reset, app version).
- **Sessions** are full screen (tab bar hidden). Practice: one tap answers, a sheet shows the answer and explanation.
  Exam: choose and change, flag, timer, a check sheet before Submit; answers shown on the results screen. The timer is
  worked out from the saved start time, so a reload or a closed tab never resets it; at 0 it submits by itself.
- **Every tap is saved** at once (`localStorage`, keys `qbank.v1.*`): `session` (the open one, with a copy of each
  question as it was when the session started), `history` (the last 20 finished, with their copies), `progress`
  (`{id: {n, c, h: last five [time, right]}}`), `flags`, `days`, and remembered choices (`custom`, `exam`, `name`,
  `draft.<id>` for a half-written suggestion). Everything is keyed by question id and looked up only for questions still
  in the bank, so archived or removed questions simply drop out.
- **Only ready questions show** (`status: active` and complete; `isReady`). Drafts are never shown, not even behind a
  switch: they may have unchecked answer keys (decision in the design spec).
- **Mastered** (Progress): at least 3 answers in the topic and the last 3 right. "Start 10 questions" takes up to half
  from missed ones, then unseen ones, then more missed ones, then ones already right that were seen longest ago.
- **Suggest a change** is on the feedback sheet, the review screen and the question detail (`#/q/<id>?suggest` opens it
  directly, for the Baby MO faculty pages to link to). Comment or Edit; Open GitHub issue, Copy text or Share. It calls
  `suggestionIssueUrl` / `suggestionText`, so the owner gets the same format as before.
- **Routes** are hash based (`#/practise`, `#/browse/t/<topic>`, `#/q/<id>`, `#/session`, `#/summary/<id>`,
  `#/review/<id>/<n>`, `#/paper/<id>`, `#/progress`), so GitHub Pages needs nothing special. Every screen and sheet is a
  history entry: Android back and the iPhone edge swipe close a sheet or go back a screen. Tab switches replace the
  entry rather than adding one.
- Small decisions made while building (differences from the spec): in Exam mode the flag button is in the bottom bar
  only (not also in the top bar), so there are never two identical buttons; the Custom and Exam sheets fit their content
  rather than opening at full height; the Exam minutes stepper moves one minute at a time (default one a question).

### Offline and updates

- `sw.js` caches the app, its three fonts (`../fonts/`), the questions and the papers in one cache per version, all or
  nothing. App files: cache first (one version at a time). Questions and papers: network first with a 2.5 s wait, so a
  corrected question reaches phones without a new release; the app also fetches them again when it comes back to the
  front (at most once a minute) and redraws only if they changed and nothing is open.
- **Safe updates** (as in Baby MO): a new version takes over by itself, but the page reloads only on a top-level tab with
  no sheet open and nothing typed, never on the first install, never during a session or on the results. If the update
  arrives at a bad moment, "Update ready / Restart" appears at the next safe moment; coming back to the app later while
  it is safe reloads quietly. An open session survives a reload anyway.
- Foot of Progress: "App version <date> (<hash>)" from the `qbank-` cache name, and "Not updating? Get the latest
  version", which checks for signal, then removes only the qbank worker and `qbank-` caches and reloads (progress kept).

### Tests

`node qbank/test/bank.test.mjs`, `node qbank/test/practice.test.mjs`, `node qbank/test/version.test.mjs`,
`node qbank/test/e2e.mjs` (every screen at 390 x 844 with axe, one-row checks, the practise and exam flows, suggest a
change, desktop, 200% zoom, offline after the first visit; `SHOTS=<dir>` saves phone screenshots) and
`node qbank/test/pwa.e2e.mjs` (manifest and icons, first install without reload, offline copy, questions network first,
"Get the latest version", no reload mid-session or while typing, updates apply when idle).
