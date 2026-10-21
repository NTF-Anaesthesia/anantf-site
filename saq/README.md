# SAQ programme

MMed Anaesthesiology Part B written-paper practice, at **saq.anantf.com**. Candidates sign in, work through the 10-week
SAQ programme (165 questions) plus the 29-question bank, type each answer against a soft 15-minute clock, get it marked
by Claude on the MMed 3–8 scale, and track their progress. Dr Chew Shi Hao and Dr Koh Wen Jun see the cohort.

Lives in the anantf.com repo for now, in `saq/`, self-contained so it can move to its own repo later. One Cloudflare
Worker (`saq-marker`, its own `saq/wrangler.jsonc`; the `anantf-mo` Worker is separate) serves the app (`saq/public/`)
and its API (`saq/src/`). GitHub Pages also publishes the folder, but `anantf.com/saq/public/` sends visitors to
saq.anantf.com. Paths below are inside `saq/`.

## What's where

| Path | What it is |
|---|---|
| `public/` | The app: `index.html`, `app.js` (views, timer, charts), `app.css`, fonts |
| `src/worker.js` | API routes (list at the top of the file) |
| `src/auth.js` | Checks Firebase sign-in tokens (Google or email/password) |
| `src/db.js` | D1 database: `users`, `attempts` (tables created on first use) |
| `src/mark.js`, `src/prompt.js` | The Claude call and the marking rubric |
| `src/questions.js`, `src/bundle.js` | Questions; `bundle.js` is generated, never edit it |
| `../exams/index.html` | **The 10-week programme**: `const studyPlan` on the Exam Prep page is the source of truth |
| `keys/index.json` | The 29 bank questions' stems and titles (curated by hand) |
| `../exams/reference/*.pdf` | The 29 model answers (the SAQ bank on Exam Prep) |
| `keys/drafts/<id>.md` | Drafted model answers for programme questions; live only when the first line is `status: approved` |
| `tools/build-keys.mjs` | Rebuilds `src/bundle.js` from the three above (`npm run build-keys`, needs `pdftotext`) |
| `test/` | `worker.test.mjs` (API, SQLite for D1), `serve.mjs` (local app with stubs), `e2e.mjs` (browser walk-through) |

## How it behaves

- **Accounts.** Firebase Authentication: Google, or email and password (reset by email). We never see passwords. The
  first time, a candidate enters their name and the **cohort passphrase** and agrees that faculty can see their work.
- **Faculty.** Anyone signed in with a *verified* email listed in the `FACULTY_EMAILS` secret sees the Cohort page
  (completion, scores, every answer) and can download every attempt. Unverified email/password accounts never count.
- **Timer.** Soft: 15:00 counts down, then counts over time in red; nothing is cut off. Pause and resume. Time and the
  draft are kept on the device until submitted, so a reload or a call to theatre loses nothing.
- **Marking.** On submit the answer is saved first, then marked (Claude Opus 5.5, effort medium) against the question's
  model answer. If there isn't one yet, it is marked against the rubric only and says so. A failed marking keeps the
  answer, with a "Mark it now" button.
- **Progress.** Completion by week, scores over time, by topic (weakest first), and the five answers most worth redoing.
- **Privacy.** Candidates can delete their account and every attempt from Account. Answers are tied to accounts:
  remind candidates to leave out patient identifiers.
- **Cost ceiling.** 25 markings per candidate per day, 400 overall (`USER_DAILY_CAP`, `DAILY_CAP` in `wrangler.jsonc`).
  About US$0.10–0.15 per marking: a 20-candidate cohort doing all 165 questions once is about US$400. Set `MODEL` to
  `claude-sonnet-5-5` to roughly halve it.

## Setup (owner, once; about 30 minutes)

1. **Claude API key.** platform.claude.com → create a workspace `saq-marker` → set a monthly spend limit → create an API key.
2. **Firebase** (sign-in only; no Firestore needed). console.firebase.google.com → Create project `anantf-saq`
   (Analytics off) → Build → Authentication → Get started → enable **Google** and **Email/Password** → Settings →
   Authorized domains → add `saq.anantf.com` → Project settings → Your apps → Web (`</>`) → register → copy
   `apiKey`, `authDomain`, `projectId`, `appId` into `FIREBASE_CONFIG` in `wrangler.jsonc` (public by design; or send
   them to Claude).
3. **Cloudflare.** Workers & Pages → Create → Import a repository → `ntf-anaesthesia/anantf-site` → set **Root
   directory** to `saq` and **Build command** to `npm ci`. Deploy. The D1 database is created on the first deploy.
4. **Secrets** (the Worker → Settings → Variables and secrets, type Secret): `ANTHROPIC_API_KEY`; `SAQ_PASSPHRASE`
   (give to each cohort, change per cohort); `FACULTY_EMAILS` (both faculty sign-in emails, comma-separated).
5. **Address.** The Worker → Settings → Domains & Routes → Add → Custom domain `saq.anantf.com`.

Check: open saq.anantf.com, sign in with Google, join, answer one question, see it marked; sign in as faculty and see
the cohort.

## Before candidates use it

- **Calibrate.** Mark 5–10 scripts you have already marked by hand; tune `src/prompt.js` until scores agree within ±1.
- **Model answers.** Only 11 of the 165 programme questions match a bank model answer. Drafts go in `keys/drafts/`,
  one file per question id, first line `status: draft` until reviewed, then `status: approved` and `npm run build-keys`.

## Changing things

- Programme: edit `studyPlan` in `exams/index.html`, then `npm run build-keys` and `npm test` here. A question's id comes from its
  wording, so rewording one starts it afresh; past attempts keep their own copy of the question.
- Rubric or tone: `src/prompt.js`. Keep it free of dates or ids, so it caches.

## Local testing

```
cd saq && npm ci
npm test                      # API tests, no network
node test/serve.mjs           # then open http://localhost:8787/?test=ann  (ann, bob; lead is faculty; passphrase cohort26)
node test/e2e.mjs             # with serve.mjs running: browser walk-through and screenshots
```
