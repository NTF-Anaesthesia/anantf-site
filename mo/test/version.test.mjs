// The service worker's file lists and VERSION must match the files (node mo/tools/stamp.mjs fixes it).
import { execFileSync } from 'node:child_process';
try { console.log(execFileSync('node', [new URL('../tools/stamp.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8' }).trim()); }
catch (e) { console.error('FAIL ' + (e.stderr || e.message).trim()); process.exitCode = 1; }
