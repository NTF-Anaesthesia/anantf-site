# Instructions for AI assistants working on anantf.com

This repo is the NTF Anaesthesia department site, published by GitHub Pages at https://anantf.com.
**Anything merged into `main` is public on the internet within about a minute.**

## How we work

Two maintainers: Dr Koh Wen Jun and Dr Chew Shi Hao. Both work through Claude Code; neither needs
local copies of the files.

- Make each change on a new branch and open a pull request. Don't push straight to `main`.
- After opening the pull request, merge it yourself straight away (squash merge, delete the branch),
  unless the human asks to wait for review. Merging publishes it to anantf.com within a minute or two,
  so check the page works before merging.
- Raw material (source PDFs, photos, notes) lives in the shared Google Drive folder
  "NTF Anaesthesia Site". If asked to use something from it, find it there via the Google Drive
  connector, then commit only the finished, web-ready version here.
- Don't commit files over 50 MB; link to them in Drive instead.

## What belongs here, and what doesn't

This site is for **specialised web pages and web apps** (interactive tools, animations, model viewers,
calculators, resource pages that need custom code). Other kinds of material live elsewhere, so don't
suggest adding them to this repo:

| Material | Where it goes |
|---|---|
| Official department documents (guidelines, policies, protocols) | The department's Microsoft Teams group |
| Teaching slides that colleagues should be able to update themselves | Google Drive, shared with edit access, so no one has to go through this repo |
| Specialised web pages and web apps | This repo |

If someone asks for a guideline, policy or slide deck to be put on the site, tell them where it
belongs instead. Many of the people editing here are not technical, so explain things in plain English.

## Layout

| Path | What it is | Listed on homepage? |
|---|---|---|
| `index.html` | Homepage | — |
| `exams/index.html` | MMed exam resources by Dr Chew Shi Hao (his design) | No (unlisted) |
| `exams/reference/*.pdf` | Part B model-answer PDFs | — |
| `popliteal/index.html` | Popliteal sciatic block animation by Dr Chew Shi Hao | No (unlisted) |
| `ac/index.html` | Guide to AC Life, **password-locked** | No (unlisted) |
| `tools/ac-guide.mjs` | Unlock / re-lock script for the AC guide | — |
| `tools/ac-editor.html` | Browser alternative to the script | — |

The NAPS 2026 site is a separate repo (NTF-Anaesthesia/naps2026-site).

## Rules

- Don't add links to `exams/`, `popliteal/` or `ac/` from the homepage, and keep their
  `<meta name="robots" content="noindex...">` tags. The owner shares these links personally.
- Keep the credits to Dr Chew Shi Hao and the links to https://chewshihao.com/.
- Don't put personal email addresses or phone numbers on any page. Public contact is contact@anantf.com.
- After editing a page, open it in a browser (or a local static server) and check it still loads
  without console errors before committing.

## Editing the exams page

`exams/index.html` is the master copy. Its content is in the script near the top:
`const banks` (→ `essayBank`: the PDF list by topic), `const studyPlan`, and `const exams` with
`reflections`, `partB` and `partC`. Edit those objects; keep the JavaScript syntax valid.
To add a PDF: put it in `exams/reference/` and add `{ title: "...", url: "reference/<file>.pdf" }`
to the right group in `essayBank`.

## Editing the AC guide (`ac/index.html`)

The guide is encrypted inside `ac/index.html` (`const DATA={salt,iv,iters,ct}`). **Never edit the
`DATA` block by hand and never try to decrypt it yourself.** Use the script:

1. Ask the human to run the unlock **themselves** in their terminal, so they type the password,
   not you. In Claude Code they can type `! node tools/ac-guide.mjs unlock` in the prompt.
   This writes the readable guide to `ac-guide.unlocked.html` in the repo root.
2. Make the requested edits in `ac-guide.unlocked.html`.
3. Ask the human to run `! node tools/ac-guide.mjs lock`. It re-locks the guide into `ac/index.html`
   with the same password and deletes the readable copy.
4. Commit and push `ac/index.html` only.

Hard rules for the AC guide:

- **Never ask for, repeat, store or write down the password**: not in chat, files, commit
  messages, environment variables or command lines.
- **Never commit or push `ac-guide.unlocked.html`** (or any other readable copy of the guide). It is
  git-ignored; don't force-add it. Before every commit, run `git status` and make sure it isn't staged.
- If `ac/index.html` ever stops containing `const DATA=`, stop and tell the human. Something
  overwrote the locked page.
- Don't copy the guide's contents into other pages, files or the README.
- Changing the password: the human runs `! node tools/ac-guide.mjs lock --new-password`.
  Older locked versions remain in git history and still open with their old password.
