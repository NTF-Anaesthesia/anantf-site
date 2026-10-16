#!/bin/bash
# OT simulator checks: model tests, then the browser test against a local static server.
# Run from anywhere: tools/test-ot.sh
set -euo pipefail
cd "$(dirname "$0")/.."
export PLAYWRIGHT_PATH="${PLAYWRIGHT_PATH:-/opt/node22/lib/node_modules/playwright/index.mjs}"
PORT="${PORT:-8085}"; export PORT

for f in ot/test/*.test.mjs; do echo "== $f"; node "$f"; done

python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1
node ot/test/e2e.mjs
echo "All OT simulator checks passed."
