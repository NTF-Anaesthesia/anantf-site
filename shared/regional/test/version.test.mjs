#!/usr/bin/env node
// The regional offline worker's file lists, VERSION and MEDIA must match the files (node shared/regional/tools/stamp.mjs
// fixes it). Run after changing anything in the regional folders or the shared site files they use.
//
//   node shared/regional/test/version.test.mjs        (options such as --quiet, --base or --json are accepted and ignored)
import { execFileSync } from 'node:child_process';
try { console.log(execFileSync(process.execPath, [new URL('../tools/stamp.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()); }
catch (e) { console.error('FAIL ' + (e.stderr || e.message).trim()); process.exitCode = 1; }
