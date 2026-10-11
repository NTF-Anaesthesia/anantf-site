# Standard handover

Copy the block below into a new PR body or an appended PR conversation comment.
Replace every placeholder. Use "None" or "Not run — reason" where applicable.
Keep notes concise but sufficient for a fresh cloud session without either chat.
A release is posted only after the sender has stopped all writers for this scope.

```markdown
## Claude Code–Codex handover

- Repository: <owner/repo>
- From → To: <assistant + session/task identifier> → <assistant + session/task, if known>
- Updated: <ISO 8601 timestamp with timezone>
- Mode: <review checkpoint / transfer>
- Ownership: <active — sender owns writes / released — all sender writers stopped>
- Branch / PR: <source branch and full PR URL>
- Head SHA: <full pushed SHA verified against GitHub>
- Base: <target branch and SHA>
- Scope / owned paths: <paths and task boundary>
- Related work: <related PRs; active work to avoid; or None>
- Background writers: <auto-fix/automation status; stopped before release>
- Working tree: <clean / omitted uncommitted files and why, without private data>

### Goal
<Requested outcome and acceptance criteria.>

### Completed work
<Changes, relevant paths, decisions, and anything deliberately left unfinished.>

### Test results
<Exact commands/manual checks, tested SHA, pass/fail/not run, relevant CI links.
Distinguish sender results from recipient checks; list skipped checks and reasons.>

### Blockers
<None, or the exact problem and input/access/decision required.>

### Next steps
<Ordered remaining work and validation for the recipient.>

### Review / merge
<Awaiting human review; no merge or auto-merge until explicit approval.>
```

## Acceptance comment

For takeover, append this only after verifying release and the remote head.
A reviewer leaves ownership with the existing writer instead.

```markdown
## Claude Code–Codex handover — accepted

- Repository / source PR: <owner/repo and URL>
- Recipient: <assistant + session/task identifier>
- Accepted source: <source branch and full released SHA>
- Destination: <recipient's writable branch; successor PR URL when opened>
- Owned scope: <task and paths>
- Updated: <ISO 8601 timestamp with timezone>
- Review / merge: awaiting human review; no merge or auto-merge
```
