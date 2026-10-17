---
name: quick-save
description: Cheap end-of-session save for repositories that keep a STATUS.md and NOTES.md per app. Updates the app's state files, opens a documentation-only PR and merges it once checks pass, so the session can be archived without losing anything. Use when the owner says "quick save", before archiving a session, or when the context is large and a full save-state would cost too much.
---

# Quick save

For the end of a session, or a long one that must stop now. Everything needed to carry on goes onto `main`, using as few
tokens as possible. It is not a handover and not a full save-state: no private-notes step, no browser or e2e runs, no
screenshots, no re-reading large files.

1. **Which app.** The app folder(s) this session worked on.
2. **Update only what changed**, replacing stale lines rather than adding history:
   - your own `<app>/status/<session>.md`: what is half-done, the branch or PR, and how to resume;
   - the app's `STATUS.md`: Waiting on the owner, Next (in order, enough detail to start without the chat), Recently
     done (merged PR numbers), and dated one-line decisions;
   - the app's `NOTES.md`: only lasting rules, owner preferences and lessons, never task chatter.
3. **Public repository rule.** Nothing private: no patient data, names, real evaluation records, secrets or tokens, and
   nothing private about the owner's setup (session or scheduled-task ids, private links, accounts, costs, how the home
   computer is run). Those belong in the owner's private notes; the public file keeps at most a neutral pointer.
   Re-read your diff once for these.
4. **Docs-only check.** `git diff --name-only origin/main...HEAD` must list only `.md` files in app folders. If anything
   else changed, stop: this is not a quick save; use the normal PR flow and save-state.
5. **Commit and push** your session branch, and open a PR against `main` titled `<App>: quick save (<date>)` with the body
   "Docs only".
6. **Merge** it (squash) once the repo's required checks pass and the PR is clean. If AGENTS.md names a docs check, run
   it first (anawj-site: `node tools/check.mjs`). If checks are red or the PR is not clean, leave it open and say why. Never
   merge a PR that changes more than the docs above.
7. **Tell the owner in at most three lines:** the PR link, merged or not, anything half-done, and that it is safe to
   archive this session. After archiving, a new session reads the app's STATUS.md and NOTES.md first.
