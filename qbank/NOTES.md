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
