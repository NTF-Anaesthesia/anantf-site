# GitHub exchange in separate cloud environments

Use one PR discussion as the task record, and pass its URL between the two sessions.
Each environment uses its own configured GitHub access. Neither needs the other's
credentials, private conversation, installed CLI, local files or running servers.

## What the human asks

- Sender: "Prepare a released handover for this task to Codex [or Claude Code].
  Commit and push, stop all writers for this scope, post the standard handover on
  the PR, and give me its URL. Wait for my review before merging."
- Reviewer: "Review this PR at the handover SHA: <URL>. Leave its branch and ownership
  unchanged and report findings here."
- Recipient: "Take over the released handover at <URL>. Verify its SHA, continue on
  your own session branch, link the successor PR, and wait for my review before merging."

Review can happen while the sender works. Transfer requires the sender to stop.
If auto-fix is enabled, the sender/human stops it before release: PR comments can
wake it and cause fresh pushes. Do not post to unrelated active Claude PRs during setup.

## Prefer supported REST operations

Claude Code's documented hosted GitHub proxy restricts GraphQL. Therefore use
connector tools or `gh api` REST calls for PRs/comments when `gh pr` or `gh issue`
is unavailable. Codex may have different networking requirements: request command
network permission when required, preserve its configured proxy and authentication,
and diagnose actual API/Git errors. `gh auth status` alone is not proof that
proxy-backed access works.

Commands below run from the intended checkout. Replace repository and PR values.
They never print or set a credential. Use temporary JSON files outside the repo
for writes, preserving real newlines; do not interpolate handover text into shell code.

### Read before acting

```bash
repository=owner/repo
pr_number=123
git remote -v
git status --short --branch
gh api "repos/$repository/pulls/$pr_number" \
  --jq '{url:.html_url,state,head:{branch:.head.ref,sha:.head.sha},base:{branch:.base.ref,sha:.base.sha}}'
gh api --paginate "repos/$repository/issues/$pr_number/comments"
gh api --paginate "repos/$repository/pulls/$pr_number/reviews"
gh api --paginate "repos/$repository/pulls/$pr_number/files"
```

For an ordinary task branch, fetch it and main with the runtime's configured Git
authentication; fetch does not switch or reset your checkout. Inspect status before
creating/switching your OWN clean session branch. Never reset an existing dirty
checkout to the handover SHA.

### Post a handover

Save the completed template to `/tmp/handover.md`, then build a JSON payload:

```bash
python3 - <<'PY'
import json
from pathlib import Path
Path('/tmp/handover-comment.json').write_text(
    json.dumps({'body': Path('/tmp/handover.md').read_text()}))
PY
gh api --method POST "repos/$repository/issues/$pr_number/comments" \
  --input /tmp/handover-comment.json --jq .html_url
```

### Open a PR after pushing your own branch

Save the goal, completed work, checks and handover to `/tmp/pr-body.md`.
From the intended repository, with a clean committed/pushed task branch:

```bash
python3 - <<'PY'
import json
import subprocess
from pathlib import Path
head = subprocess.check_output(
    ['git', 'branch', '--show-current'], text=True).strip()
if not head or head == 'main':
    raise SystemExit('Expected your writable task branch')
Path('/tmp/pr-create.json').write_text(json.dumps({
    'title': 'Describe the resulting change',
    'head': head,
    'base': 'main',
    'body': Path('/tmp/pr-body.md').read_text(),
}))
PY
gh api --method POST "repos/$repository/pulls" \
  --input /tmp/pr-create.json --jq .html_url
```

If the request times out, list open PRs for that head before retrying to avoid
duplicates. Branch names, push permissions and available API endpoints depend on
the session. A 403 needs diagnosis; account-level permission metadata does not
establish the session token's write access. Do not weaken TLS or bypass proxies.

## Maintenance and source documentation

Repo instructions are the entry points even if native skill discovery is unavailable.
Start new sessions from main after the skill PRs merge; older sessions must read the
new committed skill explicitly. Installing these docs does not transfer existing tasks.

The two repositories keep identical canonical skill/reference files. Review a change
in both repositories; each clone remains self-contained. No shared service or hook
is needed to use the protocol.

- [Claude Code cloud environments: repo skills, GitHub proxy and REST restrictions](https://code.claude.com/docs/en/cloud-environments)
- [Claude Code cloud sessions: isolation and auto-fix](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Claude skill discovery and symlinked folders](https://code.claude.com/docs/en/skills)
- [Codex repo skill discovery and symlinked folders](https://developers.openai.com/codex/skills)
