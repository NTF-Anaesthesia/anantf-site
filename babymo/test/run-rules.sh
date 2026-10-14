#!/bin/bash
# Firestore rules tests for babymo/firestore.rules in the LOCAL emulator (fake accounts, demo project "demo-moportal"):
# nothing reaches a live Firebase project and no sign-in is needed. Needs Java. The first run installs the test tools
# (override the folder with RULES_TOOLS).
set -u
cd "$(dirname "$0")/../.."
TOOLS="${RULES_TOOLS:-$HOME/.cache/anantf-test-tools}"
if [ ! -x "$TOOLS/node_modules/.bin/firebase" ]; then
  echo "Installing the emulator test tools into $TOOLS (once)…"
  npm install --silent --prefix "$TOOLS" firebase-tools@13 @firebase/rules-unit-testing firebase || exit 1
fi
made_link=0
if [ ! -e node_modules ]; then ln -s "$TOOLS/node_modules" node_modules; made_link=1; fi
cfg="$(mktemp -d)/firebase.json"
echo '{ "firestore": { "rules": "babymo/firestore.rules" }, "emulators": { "firestore": { "port": 8085, "host": "127.0.0.1" }, "ui": { "enabled": false } } }' > "$cfg"
"$TOOLS/node_modules/.bin/firebase" emulators:exec --config "$cfg" --only firestore --project demo-moportal \
  "cd babymo && node test/rules.emulator.mjs" 2>&1 | grep -E 'checks passed|checks failed|^FAIL|^Error:'
rc=${PIPESTATUS[0]}
[ $made_link = 1 ] && rm -f node_modules
rm -f firebase-debug.log firestore-debug.log babymo/firestore-debug.log
exit $rc
