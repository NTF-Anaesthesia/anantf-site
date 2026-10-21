# SAQ marker

Practice marking for MMed Anaesthesiology Part B short answer questions. A candidate picks one of the 29 bank questions
(or pastes their own), types the answer or photographs a handwritten one, and gets it marked by Claude on the MMed 3–8
scale: an annotated answer, raw and adjusted scores, a three-sentence examiner summary and the top fixes.

| Piece | Where |
|---|---|
| Candidate page | `exams/marker/` → anantf.com/exams/marker/ (GitHub Pages, unlisted, noindex) |
| API | `saq/worker.js`, Cloudflare Worker `anantf-saq` → saq.anantf.com |
| Marking instructions | `saq/prompt.js` (rubric from Dr Chew's marking skill) |
| Keys | `saq/keys/index.json` (stems and titles, curated by hand) + the text of `exams/reference/NN_*.pdf`, bundled into `saq/keys/bundle.js` by `node saq/tools/build-keys.mjs` |
| Tests | `npm ci --prefix saq && node saq/test/worker.test.mjs` (Claude is stubbed; runs in CI) |

## How it works

- The page sends the passphrase, the question id (or own stem), the typed answer and up to 4 photos (shrunk to 2000 px JPEG
  in the browser) to `POST /api/mark`.
- The Worker checks the passphrase, a per-address rate limit (6 a minute) and a daily ceiling (`DAILY_CAP`, 200), then
  calls Claude (`claude-opus-5-5`, effort `medium`, structured output) with the rubric and that question's model answer
  as the system prompt.
- Each marking is stored in KV (`SAQ_LOG`) without name, IP, passphrase or photos: question, transcribed answer, scores,
  summary, fixes, token usage. Faculty export: `curl -H "Authorization: Bearer $ADMIN_TOKEN" https://saq.anantf.com/api/log`.
- Cost: roughly US$0.10–0.20 per marking on Claude Opus 5.5 (about 5k tokens in, plus about 1.5k per photo, and 3–5k
  out). 200 a day is the most it can spend. Set `MODEL` to `claude-sonnet-5-5` to roughly halve it.

## Setup (owner, once)

1. **Claude API key.** At platform.claude.com create a workspace "anantf-saq", set a monthly spend limit (e.g. US$50),
   and create an API key in it.
2. **Worker.** In Cloudflare → Workers & Pages → Create → import this repo, set the **root directory to `saq`**
   (it has its own `wrangler.jsonc`; the existing `anantf-mo` Worker is untouched). Deploy. The KV namespace is created on
   the first deploy.
3. **Secrets** (Worker → Settings → Variables and secrets, type Secret): `ANTHROPIC_API_KEY`, `SAQ_PASSPHRASE` (share with
   candidates; change each exam cycle), `ADMIN_TOKEN` (faculty export only, long and random).
4. **Address.** Worker → Settings → Domains → add custom domain `saq.anantf.com`.

Check: `https://saq.anantf.com/api/questions` lists 29 questions; anantf.com/exams/marker/ marks an answer.
To try a branch before merging, open the page with `?api=<the Worker's preview URL>` and add the page's origin to
`ALLOWED_ORIGINS`.

## Before telling candidates

- Calibrate: mark 5–10 scripts you have already marked by hand; adjust `prompt.js` until scores agree within ±1.
- Questions 15, 20, 21 and 27 have only part A in their PDFs; part B answers are marked against the rubric alone.

## Changing things

- New or corrected model answer: replace the PDF in `exams/reference/`, update `keys/index.json` if the stem changed, run
  `node saq/tools/build-keys.mjs`, run the tests.
- Rubric or tone: `prompt.js`. Keep it byte-stable between requests (no dates or ids), so it caches.
