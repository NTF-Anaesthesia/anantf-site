#!/bin/bash
# Cloud sessions only: tell the assistant to attach the shared private notes repo before anything else.
# A hook cannot attach a repo itself, so it injects the instruction as session context. Skipped when the notes repo
# is already cloned next to this one, and for local sessions.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi
if [ -f "$(dirname "$CLAUDE_PROJECT_DIR")/ntf-hub-attach-always/AGENTS.md" ]; then
  exit 0
fi

cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"First step of this session: attach the shared private notes repo with add_repo (owner NTF-Anaesthesia, repo ntf-hub-attach-always, access push), clone it, and read its AGENTS.md before doing the task. Save lasting notes there, never in this public repo. If add_repo is refused, say so in one line and carry on."}}
JSON
exit 0
