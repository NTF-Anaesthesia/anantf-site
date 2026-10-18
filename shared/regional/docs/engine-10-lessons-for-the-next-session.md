Part of the regional engine guide; index: ../INDEX.md

## 10. Lessons for the next session

- **Stamp after every change.** Any edit under a regional folder changes `regional-sw.js`'s file lists: run
  `node shared/regional/tools/stamp.mjs`, or `version.test.mjs` fails. Do it again after merging `main` into a branch.
- **`regional.html` is one minified line**, so a merge with `main` conflicts on the whole line. Take `main`'s file and
  re-apply the "Block app" card (its CSS and the `ra-app-card` article) rather than resolving by hand.
- **Changes made by script to every page** (adding a tag to every `index.html`) must skip `lower-limb/anim/` (Dr Chew Shi Hao's
  code); check `git status` for it before committing.
- **Live-site test runs are slow and flaky** (30 s `page.goto` timeouts on the heavy pages, cancelled scan images on
  `brachial-plexus/`). Rerun the failing page on its own against the live address before calling it a regression.
- **Parallel agents in separate worktrees conflict** in `regional-sw.js`, `blocks/index.html` and `regional.html`. After merging
  their branches, take either side of `regional-sw.js`, then re-stamp.
- **The app look is a second skin on the same DOM.** Keep every rule under `html[data-skin="app"]`, never change page text for
  one look only (`skin.mjs` compares the text of both), and check the website look is pixel-identical after any skin change.
- **A background task is lost when the container restarts, but files on disk survive**: check `git status` and the last commit
  before redoing work.
