#!/bin/bash
# Browser test of the Baby MO test's cloud backend (babymo/js/cloud.js + firestore.rules) against the LOCAL Firebase
# emulators (Auth + Firestore, demo project "demo-moportal", fake accounts): nothing reaches a live Firebase project and
# no sign-in is needed. Needs Java, Playwright's Chromium and the same test tools as babymo/test/run-rules.sh. Takes about two minutes.
set -u
cd "$(dirname "$0")/../.."
TOOLS="${RULES_TOOLS:-$HOME/.cache/anantf-test-tools}"
if [ ! -x "$TOOLS/node_modules/.bin/firebase" ]; then
  echo "Installing the emulator test tools into $TOOLS (once)…"
  npm install --silent --prefix "$TOOLS" firebase-tools@13 @firebase/rules-unit-testing firebase || exit 1
fi
# the test file imports the packages by name: link them in for the run only
made_link=0
if [ ! -e node_modules ]; then ln -s "$TOOLS/node_modules" node_modules; made_link=1; fi
cfg="$(mktemp -d)/firebase.json"
echo '{ "firestore": { "rules": "babymo/firestore.rules" }, "emulators": { "auth": { "port": 9099, "host": "127.0.0.1" }, "firestore": { "port": 8085, "host": "127.0.0.1" }, "ui": { "enabled": false } } }' > "$cfg"
"$TOOLS/node_modules/.bin/firebase" emulators:exec --config "$cfg" --only auth,firestore --project demo-moportal \
  "node babymo/test/cloud.e2e.mjs" 2>&1 | grep -vE '^(i |⚠|\+ |>  |$)|Warning:|Could not find config|firebase-debug|^\s+at '
rc=${PIPESTATUS[0]}
[ $made_link = 1 ] && rm -f node_modules
rm -f firebase-debug.log firestore-debug.log
exit $rc
