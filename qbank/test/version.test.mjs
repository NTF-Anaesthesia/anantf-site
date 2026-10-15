// The service worker's VERSION and file lists must match the files it caches (node qbank/tools/stamp.mjs fixes it).
import { execFileSync } from 'node:child_process';
try { console.log(execFileSync('node', [new URL('../tools/stamp.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8' }).trim()); }
catch (e) { console.error('FAIL ' + (e.stderr || e.message).trim()); process.exitCode = 1; }
