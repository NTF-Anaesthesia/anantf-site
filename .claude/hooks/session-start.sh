#!/bin/bash
# Cloud sessions only: install Cloudflare's official Claude Code plugin (its skills, e.g. Wrangler and Workers best
# practices, and the Cloudflare MCP server; owner, 16 Oct 2026, from https://developers.cloudflare.com/agent-setup/prompt.md).
# Skipped when already installed. The MCP server signs in to Cloudflare with OAuth the first time a Cloudflare tool is
# used; sessions never hold a Cloudflare token. Local sessions are left alone.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

if ! claude plugin marketplace list 2>/dev/null | grep -q '> cloudflare$'; then
  claude plugin marketplace add cloudflare/skills >/dev/null 2>&1 || echo "Cloudflare plugin: marketplace add failed" >&2
fi
if ! claude plugin list 2>/dev/null | grep -q 'cloudflare@cloudflare'; then
  claude plugin install cloudflare@cloudflare >/dev/null 2>&1 || echo "Cloudflare plugin: install failed" >&2
fi

exit 0
