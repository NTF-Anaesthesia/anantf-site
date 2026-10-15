# Baby MO test

The department's MCQ test for new anaesthesia MOs. Static page, no build step. The questions come from the question
bank (`../qbank/papers/babymo.json` and `../qbank/bank/questions.json`).

- Try it: open `index.html` through any static server from the repo root with `?demo` (e.g. `…/babymo/?demo`). Demo
  passphrase: `demo`; "Faculty sign in" opens the faculty tabs (Results, Paper, People, Settings). Everything stays in
  the browser; the questions are the real bank's.
- Shared mode needs the Firebase project in `SETUP.md`; its config is in `js/firebase-config.js`.
- How it works and why: `NOTES.md`. Tests: see "Tests" there.
