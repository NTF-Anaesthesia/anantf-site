#!/usr/bin/env node
// Unlock / re-lock the password-protected AC guide (ac/index.html).
//
//   node tools/ac-guide.mjs unlock      ac/index.html -> ac-guide.unlocked.html (readable, git-ignored)
//   node tools/ac-guide.mjs lock        ac-guide.unlocked.html -> ac/index.html (then deletes the readable copy)
//   node tools/ac-guide.mjs lock --keep              ...but keep the readable copy
//   node tools/ac-guide.mjs lock --new-password      ...and change the password
//
// The password is typed at a hidden prompt. For non-interactive use it can come from the
// AC_GUIDE_PASSWORD environment variable instead (avoid this where it would be logged).
// Format matches the unlock code in ac/index.html and tools/ac-editor.html:
// PBKDF2-SHA256 -> AES-256-GCM, base64 fields in `const DATA={salt,iv,iters,ct};`.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto as crypto } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCKED = join(ROOT, 'ac', 'index.html');
const UNLOCKED = join(ROOT, 'ac-guide.unlocked.html');
const ITERATIONS = 600000;
const DATA_RE = /const DATA=(\{[\s\S]*?\});/;

const b64 = s => new Uint8Array(Buffer.from(s, 'base64'));
const toB64 = u => Buffer.from(u).toString('base64');

function fail(msg) {
  console.error(`ac-guide: ${msg}`);
  process.exit(1);
}

async function deriveKey(password, salt, iterations, usage) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, [usage]);
}

async function decrypt(data, password) {
  const key = await deriveKey(password, b64(data.salt), data.iters, 'decrypt');
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(data.iv) }, key, b64(data.ct)));
}

async function encrypt(text, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ITERATIONS, 'encrypt');
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  return { salt: toB64(salt), iv: toB64(iv), iters: ITERATIONS, ct: toB64(ct) };
}

function readLocked() {
  if (!existsSync(LOCKED)) fail(`${LOCKED} not found`);
  const wrapper = readFileSync(LOCKED, 'utf8');
  const m = wrapper.match(DATA_RE);
  if (!m) fail('ac/index.html does not contain the locked guide (no `const DATA=`). Was an unlocked copy saved over it?');
  return { wrapper, data: JSON.parse(m[1]) };
}

// Hidden prompt on a terminal; plain line read when input is piped.
function ask(question) {
  if (process.env.AC_GUIDE_PASSWORD !== undefined && !question.startsWith('New')) return Promise.resolve(process.env.AC_GUIDE_PASSWORD);
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    if (question.startsWith('New')) fail('changing the password needs an interactive terminal');
    return new Promise(resolve => {
      let buf = '';
      stdin.setEncoding('utf8');
      stdin.on('data', d => { buf += d; });
      stdin.on('end', () => resolve(buf.split(/\r?\n/)[0]));
    });
  }
  return new Promise(resolve => {
    process.stdout.write(question);
    let value = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = ch => {
      for (const c of ch) {
        if (c === '\r' || c === '\n') {
          stdin.setRawMode(false); stdin.pause(); stdin.off('data', onData);
          process.stdout.write('\n');
          return resolve(value);
        }
        if (c === '\u0003') { process.stdout.write('\n'); process.exit(130); }  // Ctrl+C
        if (c === '\u007f' || c === '\b') value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on('data', onData);
  });
}

async function unlock() {
  const { data } = readLocked();
  if (existsSync(UNLOCKED)) fail('ac-guide.unlocked.html already exists. Lock it first, or delete it if you want to start again.');
  const password = await ask('AC guide password: ');
  let text;
  try { text = await decrypt(data, password); } catch { fail('wrong password'); }
  writeFileSync(UNLOCKED, text);
  console.log('Unlocked to ac-guide.unlocked.html (git-ignored; never commit it).');
  console.log('Edit that file, then run: node tools/ac-guide.mjs lock');
}

async function lock(args) {
  if (!existsSync(UNLOCKED)) fail('ac-guide.unlocked.html not found. Run `node tools/ac-guide.mjs unlock` first.');
  const { wrapper, data } = readLocked();
  const password = await ask('AC guide password: ');
  try { await decrypt(data, password); } catch { fail('wrong password (it must match the current guide)'); }

  let usePassword = password;
  if (args.includes('--new-password')) {
    const a = await ask('New password: ');
    const b = await ask('New password again: ');
    if (a !== b) fail('the new passwords do not match');
    if (a.length < 8) fail('use a new password of at least 8 characters');
    usePassword = a;
  }

  const text = readFileSync(UNLOCKED, 'utf8');
  if (!/<title>/i.test(text)) fail('ac-guide.unlocked.html does not look like the guide (no <title>); not locking it');
  const out = await encrypt(text, usePassword);
  if (await decrypt(out, usePassword) !== text) fail('self-check failed; nothing was written');

  const html = wrapper.replace(DATA_RE, () => 'const DATA=' + JSON.stringify(out) + ';');
  if (html.includes(usePassword)) fail('refusing to write: the password appears in the page');
  writeFileSync(LOCKED, html);
  if (!args.includes('--keep')) unlinkSync(UNLOCKED);
  console.log(`Locked into ac/index.html${args.includes('--keep') ? '' : ' and deleted the readable copy'}.`);
  if (usePassword !== password) console.log('Password changed. Tell the team the new one; old copies in git history still open with the old password.');
  console.log('Commit and push ac/index.html to publish.');
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'unlock') await unlock();
else if (cmd === 'lock') await lock(args);
else {
  console.log('Usage: node tools/ac-guide.mjs unlock | lock [--keep] [--new-password]');
  process.exit(cmd ? 1 : 0);
}
