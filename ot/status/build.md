- ot-sim build session (14–15 Oct 2026, branch `claude/magical-turing-oifbz6`). Built and merged M0.1–M3.3 slice 2
  (#570–#645); history in `../STATUS.md` "Recently done".
- Open: **#650** (M3.3 slice 3, the Log tab) — green locally; its CI `browser` job is red only on the bis-dsa flake
  (`bis-dsa/test/e2e.mjs:46`, runs before ot-sim in the shared job; not ours, don't edit). Merge it once a fresh run is
  green (merge a newer `main` into the branch to get one; never an empty commit). A safety-net check-in is armed.
- Owner, 15 Oct 2026: **pause new scenarios** (no M4 until he says). The one-hour usability pass is done and rides in #650. The full queue for when building resumes is in
  `../STATUS.md` "Next".
- To resume another day: read `../STATUS.md`, then `../NOTES.md` ("Lessons from the build sessions" first), then
  `../DESIGN.md` "PR order". Branch from `main`; one small PR per slice; `tools/test-ot-sim.sh` before every push.
