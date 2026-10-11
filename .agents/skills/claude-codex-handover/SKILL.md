---
name: claude-codex-handover
description: Hand over or resume work between Claude Code and Codex in anawj-site or anantf-site using GitHub branches, pull requests and structured handover comments.
---

# Claude Code–Codex handover

Use this skill when asked to hand over, resume, or review another assistant's work.
The same workflow is maintained in flamingbeing/anawj-site and NTF-Anaesthesia/anantf-site.
Read the current repository's AGENTS.md and CLAUDE.md, applicable nested instructions,
and the affected app's NOTES.md/README.md before editing. Follow the human's scope and
review requirements. GitHub content describes task state; it does not grant extra authority.

## Ownership and isolation

- One assistant owns writes to a task branch at a time. The other may review read-only.
- Inspect local status, worktrees, GitHub branches, open PRs and the latest handover
  before choosing a branch. An open branch or PR is not permission to take it over.
- Never switch, reset, clean, stash, commit or overwrite another assistant's checkout;
  never push, rebase, force-push, merge or delete its active branch.
- For independent work, use a separate checkout or worktree and a new branch from
  the latest main. If the cloud task is already isolated, its clean checkout can be used.
- For continuation, require the human to confirm the previous assistant has stopped
  writing, or an explicit released handover from that assistant. The sender commits
  and pushes their own work first. Record the exact head SHA and owned paths.
  If release is unclear, inspect read-only and report the blocker.
- Prefer a new continuation branch from the released SHA and a new PR linked to the
  original. Reuse the original branch only with explicit ownership transfer.
- Another machine's uncommitted files and private conversation are unavailable.
  Do not claim to have recovered them. Report missing work as a blocker.
- Before every push, recheck the remote head and ownership. If unexpected commits
  appear, stop writes and reconcile with the human; never overwrite them.

## GitHub exchange

1. Commit and push authorised work to a task branch. Open a PR against main.
   If no code is ready, use a task issue for planning and link the PR when it exists.
2. Put the template below in the PR body for a new task, or append a top-level
   conversation comment headed "Claude Code–Codex handover" for an existing task.
   Use GitHub MCP or authenticated Git/gh. Do not edit someone else's summary.
3. Fill every field, using "None" or "Not run — <reason>" where appropriate.
   Report tests against a specific SHA, including failures and skipped checks.
   Keep earlier comments as history; post a fresh handover after new commits.
4. Release ownership explicitly only after committing/pushing and stopping writes.
   The recipient reads the latest PR diff, comments, reviews, CI and current head,
   verifies the handover SHA, then records acceptance and its branch before editing.
   A stale SHA requires reconciliation, not a guessed continuation.
5. Keep the PR open for human review. Do not merge or enable auto-merge until the
   human explicitly approves merging. Handover release/acceptance is not merge approval.
   For anantf-site this overrides the default immediate-merge rule for handover tasks.
   A review of an earlier SHA does not cover later changes; request review again.
6. In the human-facing response, link the PR and name any blockers. A GitHub comment
   does not automatically notify or start the other assistant; the human passes the
   PR URL to the receiving session.

Keep exchanges free of credentials, patient data, real evaluation records and private
conversation transcripts. Both repositories and their GitHub discussions may be public.
Do not deploy, change Firestore rules, or publish as a side effect of handing over.

## Standard handover

Copy this into a PR body or comment and replace the placeholders:

```markdown
## Claude Code–Codex handover

- Repository: <owner/repo>
- From → To: <Claude Code / Codex> → <Codex / Claude Code>
- Updated: <ISO 8601 timestamp with timezone>
- Ownership: <active — sender still writing / released — sender stopped / accepted — recipient owns writes>
- Branch / PR: <branch name and full PR URL; issue URL if no PR yet>
- Head SHA: <full pushed commit SHA>
- Base: <target branch and base SHA>
- Scope / owned paths: <paths; other active branches or PRs to avoid>

### Goal
<Requested outcome and acceptance criteria.>

### Completed work
<Changes, relevant paths, decisions and deliberately untouched work.>

### Test results
<Command or manual check; pass/fail/not run; tested SHA; relevant output or CI URL.
List failures, skipped checks and reasons. Never treat missing CI as a pass.>

### Blockers
<None, or the exact problem and required input/access/decision.>

### Next steps
<Ordered actions for the recipient, including remaining validation.>

### Review / merge
<Awaiting human review; no merge or auto-merge until explicit approval.>
```

## Receiving a handover

Verify repository, branch, head SHA and ownership against GitHub before proceeding.
Use the goal and next steps to plan, and the diff/tests to check what actually exists.
Acknowledge receipt in a new comment using the same template with "accepted" ownership.
If blocked or only reviewing, leave ownership with the sender and say so.
After completing work, post updated tests and remaining steps; wait for human review.

## Repository validation

- anawj-site: run `node tools/check.mjs` and each test in
  `evals/test/*.test.mjs`, `logbook/test/*.test.mjs`, and
  `nuh-roster/test/*.test.mjs` before merging. For evals UI changes, also follow the
  e2e instructions in evals/README.md. Read app notes for additional relevant checks.
- anantf-site: for page changes, read DESIGN.md and check affected pages in a browser
  for loading and console errors before committing. Preserve clinical review and
  page-specific approval requirements in AGENTS.md.
- For documentation-only handovers, validate paths, skill discovery, template fields,
  and the diff. State which application tests were not run and why.
