# Truncal blocks: notes for the next editor

## Where things are
- Landing page and chooser: `truncal/index.html`, `landing.js`, `landing.css` (the operation data is in `shared/regional/js/ops/ops-truncal.js`).
- Pages: `back/`, `chest-wall/`, `abdominal-wall/`. Content is data in each page's `js/blocks.js`, `anatomy.js`, `scenes.js` and `page.js`: edit the data, not the HTML.
- The engine is `shared/regional/` (owned by the regional-engine session; ask before changing it). `truncal/shared/` holds only re-export shims: don't import through them. Schema: `shared/regional/DATA.md`.

## Owner's rules for this content
- No citation numbers, source tags, "teaching slides/notes" attributions or References chapters on the pages (owner, 10 Oct 2026). `cite()` renders nothing. Named guidelines (PROSPECT) and exam names are fine as content.
- Paravertebral ropivacaine is **0.3–0.5%** (a source slide's "0.3–5%" was a typo).
- Draw every image originally. No third-party pictures; real scans only from open-licence sets in `shared/us/`.
- The owner's study notes are private and not in this repo. Paraphrase facts only. Never publish patient details, colleagues' names or note titles.
- Doses, the LAST line and complications are tier 1 (MO level). A dose in higher-tier content only warns in `levels.mjs`; fix it by marking the section `safety: true`, not by rewording the dose.
- No "for education only" notice; the credit sits at the foot only (owner, 16 Oct 2026).

## Process lessons
- After any change under `truncal/`: bump the `?v=` digits on changed modules, run `node shared/regional/tools/stamp.mjs`, then `node shared/regional/test/run-all.mjs`. Never regenerate the parity baseline to make a test pass; allow-list entries need a reason.
- Reworded dose text changes the dose-string counts and fails parity.
- When a study note disagrees with a published source or the slides, keep the cited or safer version and flag it for the owner (e.g. ESP volume, epidural spread after paravertebral, transverse process depth).
- Anatomy checks reviewers raised: nothing shows under a bone shadow (the engine masks it); the rectus sheath has no posterior sheath below the arcuate line; lateral TAP misses the groin and levels above T10; ilioinguinal needle direction is medial to lateral on the page.
- After a squash merge the remote branch is gone: `git fetch --prune`, reset the session branch to `origin/main`, push with `--force-with-lease`.
- No `gh` here: use the GitHub REST API with `curl -H "Content-Type: application/json"` (or the MCP tools).
