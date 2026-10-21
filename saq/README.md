# Part B SAQ programme

MMed Anaesthesiology Part B written-paper practice: the 10-week SAQ programme (165 past-paper questions). Candidates
sign in with their email, type each answer against a soft 15-minute clock, get it marked by Claude on the MMed 3–8
scale, receive the marked script and model answer by email, and track their progress. Dr Chew Shi Hao and Dr Koh Wen
Jun see the cohort. Unlisted and noindex; nothing on the site links to it.

| Piece | Where |
|---|---|
| The app | `exams/part-b/` → anantf.com/exams/part-b/ (GitHub Pages). Old `exams/#partB…` links forward here |
| Its server | `saq/` → Cloudflare Worker `saq-marker` at saq.anantf.com, own `saq/wrangler.jsonc` (the `anantf-mo` Worker is separate), D1 database |
| Self-contained | `saq/` + `exams/part-b/` can move to their own repo later; `saq/` reads only `exams/reference/` from outside |

## What's where (inside `saq/`)

| Path | What it is |
|---|---|
| `src/worker.js` | API routes (list at the top of the file) |
| `src/db.js` | D1: `users`, `codes`, `sessions`, `attempts`, `keys` (tables created on first use) |
| `src/mark.js`, `src/prompt.js` | The Claude calls (marking; drafting a model answer) and their instructions |
| `src/email.js` | Email via Resend: the sign-in code, and each marked script |
| `src/questions.js`, `src/bundle.js` | Questions; `bundle.js` is generated, never edit it |
| `keys/programme.json` | **The 10-week programme** (weeks, sessions, questions). Moved here from the Exam Prep page on 21 Oct 2026 |
| `keys/index.json` | The 29 SAQ-bank questions' stems and titles, for `../exams/reference/*.pdf` |
| `keys/drafts/<id>.md` | Faculty-reviewed model answers for programme questions; live when the first line is `status: approved` |
| `tools/build-keys.mjs` | Rebuilds `src/bundle.js` (`npm run build-keys`, needs `pdftotext`); `npm run check-keys` is the CI check |
| `test/` | `worker.test.mjs` (API, SQLite for D1), `serve.mjs` (whole app locally with stubs), `e2e.mjs` (browser walk-through) |

## How it behaves

- **Sign-in.** Email, then a 6-digit code sent to it (15 minutes; 5 tries; 5 codes an hour). No passwords. The device
  stays signed in for 180 days from last use. First time: name, the **cohort passphrase**, and consent that faculty
  see their work.
- **Faculty.** Emails in the `FACULTY_EMAILS` secret see the Cohort page (completion, scores, every answer), can export
  every attempt and the AI-drafted model answers (`/api/keys`), and need no passphrase.
- **Timer.** Soft: 15:00 counts down, then over time in red; nothing is cut off; pause and resume. Draft and time stay
  on the device until submitted.
- **Marking.** The answer is saved first, then marked (Claude Opus 5.5, effort medium) against the question's model
  answer: the SAQ bank's (11 programme questions), a faculty-approved draft, or, failing both, one Claude drafts once
  for that question (Dr Chew's model-answer style, effort high), keeps, and reuses for every candidate. Those are
  labelled "drafted by AI, not yet reviewed by faculty" everywhere. If drafting fails, it marks against the rubric
  only and says so. A failed marking keeps the answer, with "Mark it now".
- **Email.** Each marked script (question, score, summary, fixes, annotated answer, model answer) goes to the candidate,
  with a blind copy to every address in `COPY_TO`. Expect one email per marking in that inbox: filter on the subject
  "SAQ marked:".
- **Progress.** Completion by week, scores over time, by topic (weakest first), five answers most worth redoing.
- **Privacy.** Candidates delete their account and everything in it from Account. Remind them to leave out patient
  identifiers.
- **Cost.** About US$0.10–0.15 per marking, plus about US$0.10 once per question for a drafted model answer (154
  questions: about US$15 in total). A 20-candidate cohort doing all 165 once: about US$400. Ceilings: 25 markings per
  candidate per day, 400 overall (`USER_DAILY_CAP`, `DAILY_CAP`). `MODEL=claude-sonnet-5-5` roughly halves it.

## Setup (owner, once; about 30 minutes)

1. **Claude API key.** platform.claude.com → create a workspace `saq-marker` → set a monthly spend limit → create a key.
2. **Email.** resend.com → sign up → Domains → add `anantf.com` → add the DNS records it lists (in Cloudflare DNS) →
   wait for Verified → API Keys → create one with sending access.
3. **Worker.** Cloudflare → Workers & Pages → Create → Import a repository → `ntf-anaesthesia/anantf-site` → **Root
   directory** `saq`, **Build command** `npm ci`, deploy command default. Deploy (the D1 database is created then).
4. **Secrets** (the Worker → Settings → Variables and secrets, type Secret): `ANTHROPIC_API_KEY`, `RESEND_API_KEY`,
   `SAQ_PASSPHRASE` (per cohort), `FACULTY_EMAILS` (both faculty emails, comma-separated), `COPY_TO` (who gets every
   marked script), `CODE_PEPPER` (any long random string).
5. **Address.** The Worker → Settings → Domains & Routes → Add → Custom domain `saq.anantf.com`.

Check: anantf.com/exams/part-b/ → sign in with your email → the code arrives → join → answer one question → it is
marked and the email arrives (with your copy) → Cohort shows you.

## Before candidates use it

- **Calibrate.** Mark 5–10 scripts you have already marked by hand; tune `src/prompt.js` until scores agree within ±1.
- **Review drafted model answers** as they appear (`/api/keys`, faculty only): save a corrected one as
  `keys/drafts/<question id>.md` with first line `status: approved`, run `npm run build-keys`, commit. It replaces the
  AI draft from then on.

## Changing things

- Programme: edit `keys/programme.json`, then `npm run build-keys` and `npm test`. A question's id comes from its
  wording, so rewording one starts it afresh; past attempts keep their own copy of the question.
- Rubric or tone: `src/prompt.js`. Keep it free of dates or ids, so it caches.

## Local testing

```
cd saq && npm ci
npm test                      # API tests, no network
node test/serve.mjs           # then open http://localhost:8787/exams/part-b/ (the code shows on the page; passphrase cohort26; lead@example.com is faculty)
node test/e2e.mjs             # with serve.mjs running: browser walk-through and screenshots
```
