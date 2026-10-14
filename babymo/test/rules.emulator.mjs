// Firestore rules checks for babymo/firestore.rules against the local emulator (fake accounts, demo project only).
// Run with babymo/test/run-rules.sh (it starts the emulator and runs this from babymo/).
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, getDocs, collection, addDoc, query, where, writeBatch } from 'firebase/firestore';
import fs from 'node:fs';
const env = await initializeTestEnvironment({ projectId: 'demo-moportal', firestore: { rules: fs.readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 } });
const ADMIN = 'admin@example.com', EDITOR = 'editor@example.com', ODD = 'odd@example.com';
const PASS = 'blue-heron-7';
const by = email => ({ email, name: 'X' });
const q = (email, extra = {}) => ({ stem: 'Which drug?', options: ['A', 'B', 'C', 'D'], answer: 1, explain: 'Because.', topic: 'Drugs', image: '', status: 'active', rev: 1, updatedAt: 5, updatedBy: by(email), ...extra });
const item = { qid: 'q-active', stem: 'Which drug?', options: ['A', 'B', 'C', 'D'], answer: 1, topic: 'Drugs', explain: 'x', picked: 2 };
const att = (uid, extra = {}) => ({ uid, name: 'Dr Mo', cohort: '2026-Q4', startedAt: 1, submittedAt: 2, durationSec: 1, items: [item], settings: { count: 1, passMark: 60, minutes: 10 }, score: 0, total: 1, pass: false, ...extra });
const settings = (email, extra = {}) => ({ title: 'Baby MO test', count: 20, passMark: 60, minutes: 30, review: 'score', cohort: '2026-Q4', intro: 'Hi', updatedAt: 1, updatedBy: by(email), ...extra });
await env.withSecurityRulesDisabled(async ctx => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'members', ADMIN), { role: 'admin', name: 'Admin' });
  await setDoc(doc(db, 'members', EDITOR), { role: 'editor', name: 'Editor' });
  await setDoc(doc(db, 'members', ODD), { role: 'Editor', name: 'Mistyped role' });
  await setDoc(doc(db, 'config', 'access'), { passphrase: PASS });
  await setDoc(doc(db, 'config', 'test'), settings(ADMIN));
  await setDoc(doc(db, 'questions', 'q-active'), q(EDITOR));
  await setDoc(doc(db, 'questions', 'q-draft'), q(EDITOR, { status: 'draft' }));
  await setDoc(doc(db, 'questions', 'q-arch'), q(EDITOR, { status: 'archived' }));
  await setDoc(doc(db, 'questions', 'q-active', 'history', 'h1'), { ...q(EDITOR), savedAt: 5 });
  // an MO who logged in earlier, and an attempt of theirs and of someone else
  await setDoc(doc(db, 'sessions', 'mo-ok'), { name: 'Dr Mo', pass: PASS, at: 1 });
  await setDoc(doc(db, 'sessions', 'mo-other'), { name: 'Dr Other', pass: PASS, at: 1 });
  await setDoc(doc(db, 'sessions', 'mo-old'), { name: 'Dr Old', pass: 'old-passphrase', at: 1 });
  await setDoc(doc(db, 'attempts', 'a-mo'), att('mo-ok'));
  await setDoc(doc(db, 'attempts', 'a-other'), att('mo-other', { name: 'Dr Other' }));
});
let n = 0, fail = 0;
async function t(name, p) { n++; try { await p; } catch (e) { fail++; console.log('FAIL', name, e.message.slice(0, 200)); } }
const google = (email, verified = true) => env.authenticatedContext('g-' + email, { email, email_verified: verified }).firestore();
const anon = uid => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const adm = google(ADMIN), edi = google(EDITOR), odd = google(ODD);
const stranger = google('someone@example.com'), unv = google(EDITOR, false), shout = google('Editor@Example.com'), nobody = env.unauthenticatedContext().firestore();
const mo = anon('mo-ok'), moOther = anon('mo-other'), moOld = anon('mo-old'), moNew = anon('mo-new'), moNoSession = anon('mo-none');
const active = db => query(collection(db, 'questions'), where('status', '==', 'active'));

// passphrase and sessions
await t('right passphrase makes a session', assertSucceeds(setDoc(doc(moNew, 'sessions', 'mo-new'), { name: 'Dr New', pass: PASS, at: 1 })));
await t('wrong passphrase refused', assertFails(setDoc(doc(anon('mo-bad'), 'sessions', 'mo-bad'), { name: 'Dr Bad', pass: 'wrong', at: 1 })));
await t('empty passphrase refused', assertFails(setDoc(doc(anon('mo-bad'), 'sessions', 'mo-bad'), { name: 'Dr Bad', pass: '', at: 1 })));
await t('session for another uid refused', assertFails(setDoc(doc(anon('mo-bad'), 'sessions', 'mo-ok2'), { name: 'Dr Bad', pass: PASS, at: 1 })));
await t('empty name refused', assertFails(setDoc(doc(anon('mo-e'), 'sessions', 'mo-e'), { name: '', pass: PASS, at: 1 })));
await t('long name refused', assertFails(setDoc(doc(anon('mo-e'), 'sessions', 'mo-e'), { name: 'x'.repeat(81), pass: PASS, at: 1 })));
await t('extra session field refused', assertFails(setDoc(doc(anon('mo-e'), 'sessions', 'mo-e'), { name: 'Dr E', pass: PASS, at: 1, admin: true })));
await t('Google user cannot make a session', assertFails(setDoc(doc(google('x@example.com'), 'sessions', 'g-x@example.com'), { name: 'X', pass: PASS, at: 1 })));
await t('signed out cannot make a session', assertFails(setDoc(doc(nobody, 'sessions', 'zzz'), { name: 'Z', pass: PASS, at: 1 })));
await t('session cannot be updated', assertFails(setDoc(doc(mo, 'sessions', 'mo-ok'), { name: 'Renamed', pass: PASS, at: 2 })));
await t('MO reads own session', assertSucceeds(getDoc(doc(mo, 'sessions', 'mo-ok'))));
await t('MO cannot read another session', assertFails(getDoc(doc(mo, 'sessions', 'mo-other'))));
await t('MO cannot list sessions', assertFails(getDocs(collection(mo, 'sessions'))));
await t('editor lists sessions', assertSucceeds(getDocs(collection(edi, 'sessions'))));
await t('editor deletes a session', assertSucceeds(deleteDoc(doc(edi, 'sessions', 'mo-new'))));
await t('MO cannot delete a session', assertFails(deleteDoc(doc(mo, 'sessions', 'mo-ok'))));
await t('stranger cannot list sessions', assertFails(getDocs(collection(stranger, 'sessions'))));

// config
await t('MO cannot read the passphrase', assertFails(getDoc(doc(mo, 'config', 'access'))));
await t('editor cannot read the passphrase', assertFails(getDoc(doc(edi, 'config', 'access'))));
await t('signed out cannot read the passphrase', assertFails(getDoc(doc(nobody, 'config', 'access'))));
await t('admin reads the passphrase', assertSucceeds(getDoc(doc(adm, 'config', 'access'))));
await t('editor cannot set the passphrase', assertFails(setDoc(doc(edi, 'config', 'access'), { passphrase: 'newpass1' })));
await t('admin rejects a short passphrase', assertFails(setDoc(doc(adm, 'config', 'access'), { passphrase: 'abc' })));
await t('admin rejects extra passphrase fields', assertFails(setDoc(doc(adm, 'config', 'access'), { passphrase: 'newpass1', x: 1 })));
await t('valid MO reads settings', assertSucceeds(getDoc(doc(mo, 'config', 'test'))));
await t('MO without session cannot read settings', assertFails(getDoc(doc(moNoSession, 'config', 'test'))));
await t('MO with old passphrase cannot read settings', assertFails(getDoc(doc(moOld, 'config', 'test'))));
await t('editor reads settings', assertSucceeds(getDoc(doc(edi, 'config', 'test'))));
await t('stranger cannot read settings', assertFails(getDoc(doc(stranger, 'config', 'test'))));
await t('signed out cannot read settings', assertFails(getDoc(doc(nobody, 'config', 'test'))));
await t('admin saves settings', assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { count: 30 }))));
await t('editor cannot save settings', assertFails(setDoc(doc(edi, 'config', 'test'), settings(EDITOR))));
await t('MO cannot save settings', assertFails(setDoc(doc(mo, 'config', 'test'), settings(ADMIN))));
await t('settings stamped by someone else', assertFails(setDoc(doc(adm, 'config', 'test'), settings(EDITOR))));
await t('settings count 0', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { count: 0 }))));
await t('settings count 101', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { count: 101 }))));
await t('settings passMark 0', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { passMark: 0 }))));
await t('settings minutes 241', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { minutes: 241 }))));
await t('settings bad review', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { review: 'everything' }))));
await t('settings extra field', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { secret: 1 }))));
await t('settings full review', assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { review: 'full' }))));
await t('other config docs refused', assertFails(setDoc(doc(adm, 'config', 'other'), { a: 1 })));

// members
await t('editor reads own member entry', assertSucceeds(getDoc(doc(edi, 'members', EDITOR))));
await t('editor lists members', assertSucceeds(getDocs(collection(edi, 'members'))));
await t('stranger cannot list members', assertFails(getDocs(collection(stranger, 'members'))));
await t('MO cannot list members', assertFails(getDocs(collection(mo, 'members'))));
await t('MO cannot read a member entry', assertFails(getDoc(doc(mo, 'members', EDITOR))));
await t('upper-case email matches its entry', assertSucceeds(getDocs(collection(shout, 'sessions'))));
await t('unverified email is no member', assertFails(getDocs(collection(unv, 'sessions'))));
await t('admin adds an editor', assertSucceeds(setDoc(doc(adm, 'members', 'new@example.com'), { role: 'editor', name: 'New' })));
await t('admin cannot add a mistyped role', assertFails(setDoc(doc(adm, 'members', 'new2@example.com'), { role: 'Editor', name: 'N' })));
await t('admin cannot add a viewer role', assertFails(setDoc(doc(adm, 'members', 'new2@example.com'), { role: 'viewer', name: 'N' })));
await t('admin cannot add extra fields', assertFails(setDoc(doc(adm, 'members', 'new2@example.com'), { role: 'editor', name: 'N', x: 1 })));
await t('admin cannot add an upper-case id', assertFails(setDoc(doc(adm, 'members', 'New3@example.com'), { role: 'editor', name: 'N' })));
await t('editor cannot add a member', assertFails(setDoc(doc(edi, 'members', 'new4@example.com'), { role: 'editor', name: 'N' })));
await t('editor cannot make themselves admin', assertFails(setDoc(doc(edi, 'members', EDITOR), { role: 'admin', name: 'Editor' })));
await t('admin cannot demote themselves', assertFails(setDoc(doc(adm, 'members', ADMIN), { role: 'editor', name: 'Admin' })));
await t('admin cannot remove themselves', assertFails(deleteDoc(doc(adm, 'members', ADMIN))));
await t('editor cannot remove a member', assertFails(deleteDoc(doc(edi, 'members', 'new@example.com'))));
await t('admin removes another member', assertSucceeds(deleteDoc(doc(adm, 'members', 'new@example.com'))));

// access requests (anyone with Google can ask; faculty approve or decline)
const REQ = 'req@example.com', req = google(REQ), req2 = google('req2@example.com'), anonReq = env.authenticatedContext('mo-ok', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const rq = (email, extra = {}) => ({ email, name: 'Dr Requester', requestedAt: 5, ...extra });
const approve = async (db, email, role = 'editor') => { const b = writeBatch(db); b.set(doc(db, 'members', email), { role, name: 'Dr Requester' }); b.delete(doc(db, 'accessRequests', email)); await b.commit(); };
await t('requester files own request', assertSucceeds(setDoc(doc(req, 'accessRequests', REQ), rq(REQ))));
await t('requester reads own request', assertSucceeds(getDoc(doc(req, 'accessRequests', REQ))));
await t('requester updates own request', assertSucceeds(setDoc(doc(req, 'accessRequests', REQ), rq(REQ, { name: 'Dr R Two', requestedAt: 6 }))));
await t('requester cannot list requests', assertFails(getDocs(collection(req, 'accessRequests'))));
await t('stranger cannot list requests', assertFails(getDocs(collection(stranger, 'accessRequests'))));
await t('stranger cannot read another request', assertFails(getDoc(doc(stranger, 'accessRequests', REQ))));
await t('MO cannot list requests', assertFails(getDocs(collection(mo, 'accessRequests'))));
await t('signed out cannot list requests', assertFails(getDocs(collection(nobody, 'accessRequests'))));
await t('request for someone else\'s email', assertFails(setDoc(doc(req2, 'accessRequests', REQ), rq(REQ))));
await t('request whose email field differs', assertFails(setDoc(doc(req2, 'accessRequests', 'req2@example.com'), rq(REQ))));
await t('request with an upper-case id', assertFails(setDoc(doc(google('Req3@Example.com'), 'accessRequests', 'Req3@Example.com'), rq('Req3@Example.com'))));
await t('request with an extra key', assertFails(setDoc(doc(req2, 'accessRequests', 'req2@example.com'), rq('req2@example.com', { role: 'admin' }))));
await t('request without a name', assertFails(setDoc(doc(req2, 'accessRequests', 'req2@example.com'), rq('req2@example.com', { name: '' }))));
await t('request with a 101-character name', assertFails(setDoc(doc(req2, 'accessRequests', 'req2@example.com'), rq('req2@example.com', { name: 'x'.repeat(101) }))));
await t('request with requestedAt not a number', assertFails(setDoc(doc(req2, 'accessRequests', 'req2@example.com'), rq('req2@example.com', { requestedAt: 'now' }))));
await t('anonymous MO cannot file a request', assertFails(setDoc(doc(anonReq, 'accessRequests', 'mo-ok'), rq('mo-ok'))));
await t('unverified email cannot file a request', assertFails(setDoc(doc(google('req2@example.com', false), 'accessRequests', 'req2@example.com'), rq('req2@example.com'))));
await t('signed out cannot file a request', assertFails(setDoc(doc(nobody, 'accessRequests', 'req2@example.com'), rq('req2@example.com'))));
await t('a member cannot file a request', assertFails(setDoc(doc(edi, 'accessRequests', EDITOR), rq(EDITOR))));
await t('requester cannot make themselves a member', assertFails(setDoc(doc(req, 'members', REQ), { role: 'editor', name: 'Dr Requester' })));
await t('requester cannot make themselves a member in a batch', assertFails(approve(req, REQ)));
await t('stranger cannot delete another\'s request', assertFails(deleteDoc(doc(stranger, 'accessRequests', REQ))));
await t('editor lists requests', assertSucceeds(getDocs(collection(edi, 'accessRequests'))));
await t('admin lists requests', assertSucceeds(getDocs(collection(adm, 'accessRequests'))));
await t('editor reads a request', assertSucceeds(getDoc(doc(edi, 'accessRequests', REQ))));
await t('editor cannot edit a request', assertFails(setDoc(doc(edi, 'accessRequests', REQ), rq(REQ, { name: 'Changed' }))));
await t('editor cannot add a member with no request', assertFails(setDoc(doc(edi, 'members', 'norequest@example.com'), { role: 'editor', name: 'N' })));
await t('editor cannot add a member with no request, in a batch', assertFails(approve(edi, 'norequest@example.com')));
await t('editor cannot approve as admin', assertFails(approve(edi, REQ, 'admin')));
await t('editor cannot approve with an extra key', assertFails((async () => { const b = writeBatch(edi); b.set(doc(edi, 'members', REQ), { role: 'editor', name: 'R', x: 1 }); b.delete(doc(edi, 'accessRequests', REQ)); await b.commit(); })()));
await t('editor cannot approve an upper-case id', assertFails(approve(edi, 'Req@example.com')));
await t('editor approves with one batch', assertSucceeds(approve(edi, REQ)));
await t('after approval the request is gone', assertSucceeds((async () => { if ((await getDoc(doc(edi, 'accessRequests', REQ))).exists()) throw new Error('request still there'); })()));
await t('after approval the new member is an editor', assertSucceeds(getDocs(collection(req, 'questions'))));
await t('after approval the new editor cannot update a member', assertFails(setDoc(doc(req, 'members', REQ), { role: 'admin', name: 'Dr Requester' })));
await t('editor cannot remove a member', assertFails(deleteDoc(doc(edi, 'members', REQ))));
await t('editor cannot update a member', assertFails(setDoc(doc(edi, 'members', REQ), { role: 'editor', name: 'Renamed' })));
await t('admin can still remove a member', assertSucceeds(deleteDoc(doc(adm, 'members', REQ))));
await t('requester files again', assertSucceeds(setDoc(doc(req, 'accessRequests', REQ), rq(REQ))));
await t('admin approves as admin with one batch', assertSucceeds(approve(adm, REQ, 'admin')));
await t('admin removes that admin', assertSucceeds(deleteDoc(doc(adm, 'members', REQ))));
await t('requester withdraws own request', assertSucceeds((async () => { await setDoc(doc(req2, 'accessRequests', 'req2@example.com'), rq('req2@example.com')); await deleteDoc(doc(req2, 'accessRequests', 'req2@example.com')); })()));
await t('editor declines a request', assertSucceeds((async () => { await setDoc(doc(req2, 'accessRequests', 'req2@example.com'), rq('req2@example.com')); await deleteDoc(doc(edi, 'accessRequests', 'req2@example.com')); })()));
await t('admin adds a member directly (no request)', assertSucceeds(setDoc(doc(adm, 'members', 'direct@example.com'), { role: 'admin', name: 'Direct' })));
await t('admin deletes a request', assertSucceeds((async () => { await setDoc(doc(req2, 'accessRequests', 'req2@example.com'), rq('req2@example.com')); await deleteDoc(doc(adm, 'accessRequests', 'req2@example.com')); })()));
await t('admin removes the direct member', assertSucceeds(deleteDoc(doc(adm, 'members', 'direct@example.com'))));

// questions: reading
await t('MO reads active questions by query', assertSucceeds(getDocs(active(mo))));
await t('MO cannot list all questions', assertFails(getDocs(collection(mo, 'questions'))));
await t('MO cannot list draft questions', assertFails(getDocs(query(collection(mo, 'questions'), where('status', '==', 'draft')))));
await t('MO cannot list archived questions', assertFails(getDocs(query(collection(mo, 'questions'), where('status', '==', 'archived')))));
await t('MO reads an active question', assertSucceeds(getDoc(doc(mo, 'questions', 'q-active'))));
await t('MO cannot read a draft', assertFails(getDoc(doc(mo, 'questions', 'q-draft'))));
await t('MO cannot read an archived question', assertFails(getDoc(doc(mo, 'questions', 'q-arch'))));
await t('MO with old passphrase cannot read active questions', assertFails(getDocs(active(moOld))));
await t('MO without a session cannot read active questions', assertFails(getDocs(active(moNoSession))));
await t('stranger cannot read questions', assertFails(getDocs(active(stranger))));
await t('signed out cannot read questions', assertFails(getDocs(active(nobody))));
await t('unverified email cannot read questions', assertFails(getDocs(collection(unv, 'questions'))));
await t('editor lists all questions', assertSucceeds(getDocs(collection(edi, 'questions'))));
await t('editor reads a draft', assertSucceeds(getDoc(doc(edi, 'questions', 'q-draft'))));
await t('MO cannot read history', assertFails(getDocs(collection(mo, 'questions', 'q-active', 'history'))));
await t('editor reads history', assertSucceeds(getDocs(collection(edi, 'questions', 'q-active', 'history'))));

// questions: writing
await t('editor creates a question', assertSucceeds(setDoc(doc(edi, 'questions', 'n1'), q(EDITOR))));
await t('admin creates a question', assertSucceeds(setDoc(doc(adm, 'questions', 'n2'), q(ADMIN, { status: 'draft' }))));
await t('MO cannot create a question', assertFails(setDoc(doc(mo, 'questions', 'n3'), q(EDITOR))));
await t('stranger cannot create a question', assertFails(setDoc(doc(stranger, 'questions', 'n3'), q('someone@example.com'))));
await t('unverified email cannot create', assertFails(setDoc(doc(unv, 'questions', 'n3'), q(EDITOR))));
await t('signed out cannot create', assertFails(setDoc(doc(nobody, 'questions', 'n3'), q(EDITOR))));
await t('mistyped role cannot create', assertFails(setDoc(doc(odd, 'questions', 'n3'), q(ODD))));
await t('create under someone else\'s name', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(ADMIN))));
await t('create with rev 2', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { rev: 2 }))));
await t('create with rev 0', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { rev: 0 }))));
await t('three options', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { options: ['A', 'B', 'C'] }))));
await t('five options', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { options: ['A', 'B', 'C', 'D', 'E'] }))));
await t('empty option on an active question', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { options: ['A', '', 'C', 'D'] }))));
await t('incomplete draft', assertSucceeds(setDoc(doc(edi, 'questions', 'inc1'), q(EDITOR, { status: 'draft', options: ['', '', '', ''], answer: -1 }))));
await t('incomplete archived', assertSucceeds(setDoc(doc(edi, 'questions', 'inc2'), q(EDITOR, { status: 'archived', options: ['A', '', '', ''], answer: -1 }))));
await t('incomplete active (blank options)', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { options: ['', '', '', ''] }))));
await t('answer -1 on active', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { answer: -1 }))));
await t('answer -2 on a draft', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { status: 'draft', answer: -2 }))));
await t('draft still needs exactly 4 options', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { status: 'draft', options: ['', '', ''] }))));
await t('stem over 2000', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { status: 'draft', stem: 'x'.repeat(2001) }))));
await t('option over 500', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { status: 'draft', options: ['x'.repeat(501), '', '', ''] }))));
await t('incomplete draft history entry', assertSucceeds(addDoc(collection(edi, 'questions', 'inc1', 'history'), { ...q(EDITOR, { status: 'draft', options: ['', '', '', ''], answer: -1 }), savedAt: 7 })));
await t('MO cannot read incomplete draft', assertFails(getDoc(doc(mo, 'questions', 'inc1'))));
await t('MO active query still works with drafts present', assertSucceeds(getDocs(active(mo))));
await t('option not text', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { options: ['A', 2, 'C', 'D'] }))));
await t('answer 4', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { answer: 4 }))));
await t('answer -1', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { answer: -1 }))));
await t('answer 1.5', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { answer: 1.5 }))));
await t('empty stem', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { stem: '' }))));
await t('bad status', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { status: 'live' }))));
await t('extra question field', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { owner: 'me' }))));
await t('image of 400000 characters', assertSucceeds(setDoc(doc(edi, 'questions', 'img'), q(EDITOR, { image: 'x'.repeat(400000) }))));
await t('oversize image', assertFails(setDoc(doc(edi, 'questions', 'n3'), q(EDITOR, { image: 'x'.repeat(400001) }))));
await t('update with rev + 1', assertSucceeds(setDoc(doc(edi, 'questions', 'n1'), q(EDITOR, { rev: 2, stem: 'Changed' }))));
await t('stale update (same rev)', assertFails(setDoc(doc(edi, 'questions', 'n1'), q(EDITOR, { rev: 2, stem: 'Again' }))));
await t('stale update (old rev)', assertFails(setDoc(doc(edi, 'questions', 'n1'), q(EDITOR, { rev: 1, stem: 'Again' }))));
await t('rev skipping', assertFails(setDoc(doc(edi, 'questions', 'n1'), q(EDITOR, { rev: 4 }))));
await t('update with rev + 1 again', assertSucceeds(setDoc(doc(adm, 'questions', 'n1'), q(ADMIN, { rev: 3 }))));
await t('MO cannot update a question', assertFails(setDoc(doc(mo, 'questions', 'q-active'), q(EDITOR, { rev: 2 }))));
await t('editor cannot delete a question', assertFails(deleteDoc(doc(edi, 'questions', 'n1'))));
await t('MO cannot delete a question', assertFails(deleteDoc(doc(mo, 'questions', 'q-active'))));
await t('admin deletes a question', assertSucceeds(deleteDoc(doc(adm, 'questions', 'n1'))));

// question history
const hist = (email, extra = {}) => ({ ...q(email), savedAt: 6, ...extra });
await t('editor adds a history entry', assertSucceeds(addDoc(collection(edi, 'questions', 'q-active', 'history'), hist(EDITOR))));
await t('history under someone else\'s name', assertFails(addDoc(collection(edi, 'questions', 'q-active', 'history'), hist(ADMIN))));
await t('history without savedAt', assertFails(addDoc(collection(edi, 'questions', 'q-active', 'history'), q(EDITOR))));
await t('history with a bad snapshot', assertFails(addDoc(collection(edi, 'questions', 'q-active', 'history'), hist(EDITOR, { answer: 9 }))));
await t('MO cannot add history', assertFails(addDoc(collection(mo, 'questions', 'q-active', 'history'), hist(EDITOR))));
await t('history cannot change', assertFails(setDoc(doc(adm, 'questions', 'q-active', 'history', 'h1'), hist(ADMIN))));
await t('history cannot be deleted', assertFails(deleteDoc(doc(adm, 'questions', 'q-active', 'history', 'h1'))));
await t('question + history in one batch', assertSucceeds((async () => {
  const b = writeBatch(edi); const r = doc(edi, 'questions', 'b1');
  b.set(r, q(EDITOR)); b.set(doc(collection(edi, 'questions', 'b1', 'history')), hist(EDITOR)); await b.commit();
})()));
await t('batch of 150 new questions with history', assertSucceeds((async () => {
  const b = writeBatch(edi);
  for (let i = 0; i < 150; i++) { const r = doc(edi, 'questions', 'bulk' + i); b.set(r, q(EDITOR, { stem: 'Q' + i })); b.set(doc(collection(edi, 'questions', 'bulk' + i, 'history')), hist(EDITOR)); }
  await b.commit();
})()));

// attempts
await t('MO submits an attempt', assertSucceeds(setDoc(doc(mo, 'attempts', 'a-new'), att('mo-ok'))));
await t('attempt cannot be rewritten', assertFails(setDoc(doc(mo, 'attempts', 'a-new'), att('mo-ok', { score: 1, pass: true }))));
await t('attempt cannot be rewritten by an editor', assertFails(setDoc(doc(edi, 'attempts', 'a-new'), att('mo-ok', { score: 1 }))));
await t('attempt for another uid', assertFails(setDoc(doc(mo, 'attempts', 'a-x'), att('mo-other', { name: 'Dr Other' }))));
await t('attempt under another name', assertFails(setDoc(doc(mo, 'attempts', 'a-x'), att('mo-ok', { name: 'Dr Someone Else' }))));
await t('attempt with no items', assertFails(setDoc(doc(mo, 'attempts', 'a-x'), att('mo-ok', { items: [] }))));
await t('attempt with 101 items', assertFails(setDoc(doc(mo, 'attempts', 'a-x'), att('mo-ok', { items: Array(101).fill(item) }))));
await t('attempt with 100 items', assertSucceeds(setDoc(doc(mo, 'attempts', 'a-100'), att('mo-ok', { items: Array(100).fill(item), total: 100 }))));
await t('attempt with extra field', assertFails(setDoc(doc(mo, 'attempts', 'a-x'), att('mo-ok', { bonus: 1 }))));
await t('attempt with extra settings field', assertFails(setDoc(doc(mo, 'attempts', 'a-x'), att('mo-ok', { settings: { count: 1, passMark: 60, minutes: 10, x: 1 } }))));
await t('attempt with an item with extra field', assertFails(setDoc(doc(mo, 'attempts', 'a-x'), att('mo-ok', { items: [{ ...item, x: 1 }] }))));
await t('old-passphrase MO cannot submit', assertFails(setDoc(doc(moOld, 'attempts', 'a-x'), att('mo-old', { name: 'Dr Old' }))));
await t('MO without session cannot submit', assertFails(setDoc(doc(moNoSession, 'attempts', 'a-x'), att('mo-none'))));
await t('editor cannot submit an attempt', assertFails(setDoc(doc(edi, 'attempts', 'a-x'), att('g-' + EDITOR))));
await t('signed out cannot submit', assertFails(setDoc(doc(nobody, 'attempts', 'a-x'), att('mo-ok'))));
await t('MO reads own attempt', assertSucceeds(getDoc(doc(mo, 'attempts', 'a-mo'))));
await t('MO lists own attempts', assertSucceeds(getDocs(query(collection(mo, 'attempts'), where('uid', '==', 'mo-ok')))));
await t('MO cannot read another\'s attempt', assertFails(getDoc(doc(mo, 'attempts', 'a-other'))));
await t('MO cannot list all attempts', assertFails(getDocs(collection(mo, 'attempts'))));
await t('MO cannot list another\'s attempts', assertFails(getDocs(query(collection(mo, 'attempts'), where('uid', '==', 'mo-other')))));
await t('editor lists attempts', assertSucceeds(getDocs(collection(edi, 'attempts'))));
await t('stranger cannot read attempts', assertFails(getDoc(doc(stranger, 'attempts', 'a-mo'))));
await t('signed out cannot read attempts', assertFails(getDoc(doc(nobody, 'attempts', 'a-mo'))));
await t('editor cannot delete an attempt', assertFails(deleteDoc(doc(edi, 'attempts', 'a-mo'))));
await t('MO cannot delete own attempt', assertFails(deleteDoc(doc(mo, 'attempts', 'a-mo'))));
await t('admin deletes an attempt', assertSucceeds(deleteDoc(doc(adm, 'attempts', 'a-mo'))));

// must / level on questions (both optional: old documents without them stay valid)
const hq = (extra = {}) => ({ ...q(EDITOR), ...extra });
await t('question without must/level still saves (old document)', assertSucceeds(setDoc(doc(edi, 'questions', 'ml-old'), q(EDITOR))));
await t('question with must true', assertSucceeds(setDoc(doc(edi, 'questions', 'ml-1'), hq({ must: true }))));
await t('question with level hard', assertSucceeds(setDoc(doc(edi, 'questions', 'ml-2'), hq({ level: 'hard' }))));
await t('question with must false and level standard', assertSucceeds(setDoc(doc(edi, 'questions', 'ml-3'), hq({ must: false, level: 'standard' }))));
await t('question with must as a string', assertFails(setDoc(doc(edi, 'questions', 'ml-x'), hq({ must: 'true' }))));
await t('question with must as a number', assertFails(setDoc(doc(edi, 'questions', 'ml-x'), hq({ must: 1 }))));
await t('question with level easy', assertFails(setDoc(doc(edi, 'questions', 'ml-x'), hq({ level: 'easy' }))));
await t('question with level as a number', assertFails(setDoc(doc(edi, 'questions', 'ml-x'), hq({ level: 2 }))));
await t('question with an unknown extra field still refused', assertFails(setDoc(doc(edi, 'questions', 'ml-x'), hq({ must: true, weight: 3 }))));
await t('update adds must/level to an old question', assertSucceeds(setDoc(doc(edi, 'questions', 'ml-old'), hq({ rev: 2, must: true, level: 'hard' }))));
await t('update with a bad level refused', assertFails(setDoc(doc(edi, 'questions', 'ml-old'), hq({ rev: 3, level: 'medium' }))));
await t('history accepts must/level', assertSucceeds(addDoc(collection(edi, 'questions', 'ml-old', 'history'), { ...hq({ rev: 2, must: true, level: 'hard' }), savedAt: 6 })));
await t('history refuses a bad must', assertFails(addDoc(collection(edi, 'questions', 'ml-old', 'history'), { ...hq({ must: 'yes' }), savedAt: 6 })));
await t('MO reads an active must/hard question', assertSucceeds(getDoc(doc(mo, 'questions', 'ml-1'))));
await t('MO lists active questions including must/hard ones', assertSucceeds(getDocs(active(mo))));
await t('MO still reads an old active question without the fields', assertSucceeds(getDoc(doc(mo, 'questions', 'q-active'))));
await t('MO cannot read a draft must question', assertFails(getDoc(doc(mo, 'questions', 'ml-d'))));
await t('batch of questions with must/level', assertSucceeds((async () => {
  const b = writeBatch(edi);
  for (let i = 0; i < 3; i++) { b.set(doc(edi, 'questions', 'mlb' + i), hq({ must: i === 0, level: i === 1 ? 'hard' : 'standard' })); b.set(doc(collection(edi, 'questions', 'mlb' + i, 'history')), { ...hq({ must: i === 0 }), savedAt: 5 }); }
  await b.commit();
})()));

// new settings fields: maxAttempts (1..10) and hardCount (0..100), both optional
await t('settings with maxAttempts and hardCount', assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: 2, hardCount: 4 }))));
await t('settings without them still valid (old document)', assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN))));
await t('maxAttempts 1 and 10 ok', assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: 1 }))));
await t('maxAttempts 10 ok', assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: 10 }))));
await t('maxAttempts 0 refused', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: 0 }))));
await t('maxAttempts 11 refused', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: 11 }))));
await t('maxAttempts fractional refused', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: 1.5 }))));
await t('maxAttempts string refused', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: '2' }))));
await t('hardCount 0 and 100 ok', assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { hardCount: 0 }))));
await t('hardCount 100 ok', assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { hardCount: 100 }))));
await t('hardCount -1 refused', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { hardCount: -1 }))));
await t('hardCount 101 refused', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { hardCount: 101 }))));
await t('hardCount fractional refused', assertFails(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { hardCount: 2.5 }))));
await t('editor cannot save the new settings', assertFails(setDoc(doc(edi, 'config', 'test'), settings(EDITOR, { maxAttempts: 3, hardCount: 4 }))));
await t('MO reads settings with the new fields', (async () => {
  await assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: 3, hardCount: 4 })));
  const s = await assertSucceeds(getDoc(doc(mo, 'config', 'test')));
  if (s.data().maxAttempts !== 3 || s.data().hardCount !== 4) throw new Error('fields missing');
})());

// attemptNo on attempts (optional, 1..10)
await t('attempt with attemptNo 1', assertSucceeds(setDoc(doc(mo, 'attempts', 'an-1'), att('mo-ok', { attemptNo: 1 }))));
await t('attempt with attemptNo 10', assertSucceeds(setDoc(doc(mo, 'attempts', 'an-10'), att('mo-ok', { attemptNo: 10 }))));
await t('attempt with attemptNo 0 refused', assertFails(setDoc(doc(mo, 'attempts', 'an-x'), att('mo-ok', { attemptNo: 0 }))));
await t('attempt with attemptNo 11 refused', assertFails(setDoc(doc(mo, 'attempts', 'an-x'), att('mo-ok', { attemptNo: 11 }))));
await t('attempt with attemptNo as a string refused', assertFails(setDoc(doc(mo, 'attempts', 'an-x'), att('mo-ok', { attemptNo: '1' }))));
await t('attempt with attemptNo fractional refused', assertFails(setDoc(doc(mo, 'attempts', 'an-x'), att('mo-ok', { attemptNo: 1.5 }))));

// attemptCounts: an MO may only create at 1 and raise by exactly 1 up to maxAttempts; faculty set or delete
const K = 'cohort-2026__dr-mo', cnt = (n, extra = {}) => ({ n, updatedAt: 9, ...extra });
await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'config', 'test'), settings(ADMIN, { maxAttempts: 2 })));
await t('MO creates a counter at 1', assertSucceeds(setDoc(doc(mo, 'attemptCounts', K), cnt(1))));
await t('MO reads own counter', assertSucceeds(getDoc(doc(mo, 'attemptCounts', K))));
await t('another MO reads a counter (by key)', assertSucceeds(getDoc(doc(moOther, 'attemptCounts', K))));
await t('MO cannot list all counters (only get by key)', assertFails(getDocs(collection(mo, 'attemptCounts'))));
await t('MO cannot create at 2', assertFails(setDoc(doc(mo, 'attemptCounts', 'k-two'), cnt(2))));
await t('MO cannot create at 0', assertFails(setDoc(doc(mo, 'attemptCounts', 'k-zero'), cnt(0))));
await t('MO cannot create with an extra field', assertFails(setDoc(doc(mo, 'attemptCounts', 'k-extra'), cnt(1, { who: 'me' }))));
await t('MO cannot create without updatedAt', assertFails(setDoc(doc(mo, 'attemptCounts', 'k-nots'), { n: 1 })));
await t('MO cannot create with n as a string', assertFails(setDoc(doc(mo, 'attemptCounts', 'k-str'), cnt('1'))));
await t('MO cannot skip: 1 to 3 refused', assertFails(setDoc(doc(mo, 'attemptCounts', K), cnt(3))));
await t('MO cannot rewrite the same value', assertFails(setDoc(doc(mo, 'attemptCounts', K), cnt(1))));
await t('MO raises 1 to 2', assertSucceeds(setDoc(doc(mo, 'attemptCounts', K), cnt(2))));
await t('MO cannot lower 2 to 1', assertFails(setDoc(doc(mo, 'attemptCounts', K), cnt(1))));
await t('MO cannot lower 2 to 0', assertFails(setDoc(doc(mo, 'attemptCounts', K), cnt(0))));
await t('MO cannot go beyond maxAttempts (2 to 3)', assertFails(setDoc(doc(mo, 'attemptCounts', K), cnt(3))));
await t('MO cannot delete a counter', assertFails(deleteDoc(doc(mo, 'attemptCounts', K))));
await t('maxAttempts raised to 3 lets the MO go to 3', (async () => {
  await assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN, { maxAttempts: 3 })));
  await assertSucceeds(setDoc(doc(mo, 'attemptCounts', K), cnt(3)));
})());
await t('MO cannot go to 4 with maxAttempts 3', assertFails(setDoc(doc(mo, 'attemptCounts', K), cnt(4))));
await t('with no maxAttempts the limit is 2', (async () => {
  await assertSucceeds(setDoc(doc(adm, 'config', 'test'), settings(ADMIN)));
  await assertSucceeds(setDoc(doc(moOther, 'attemptCounts', 'k-def'), cnt(1)));
  await assertSucceeds(setDoc(doc(moOther, 'attemptCounts', 'k-def'), cnt(2)));
  await assertFails(setDoc(doc(moOther, 'attemptCounts', 'k-def'), cnt(3)));
})());
await t('old-passphrase MO cannot create a counter', assertFails(setDoc(doc(moOld, 'attemptCounts', 'k-old'), cnt(1))));
await t('old-passphrase MO cannot read a counter', assertFails(getDoc(doc(moOld, 'attemptCounts', K))));
await t('MO without session cannot create a counter', assertFails(setDoc(doc(moNoSession, 'attemptCounts', 'k-nos'), cnt(1))));
await t('MO without session cannot read a counter', assertFails(getDoc(doc(moNoSession, 'attemptCounts', K))));
await t('signed out cannot read a counter', assertFails(getDoc(doc(nobody, 'attemptCounts', K))));
await t('signed out cannot create a counter', assertFails(setDoc(doc(nobody, 'attemptCounts', 'k-out'), cnt(1))));
await t('stranger (Google, not faculty) cannot read a counter', assertFails(getDoc(doc(stranger, 'attemptCounts', K))));
await t('stranger cannot create a counter', assertFails(setDoc(doc(stranger, 'attemptCounts', 'k-str2'), cnt(1))));
await t('key with capital letters refused', assertFails(setDoc(doc(mo, 'attemptCounts', 'Cohort__Mo'), cnt(1))));
await t('key with a space refused', assertFails(setDoc(doc(mo, 'attemptCounts', 'a b'), cnt(1))));
await t('key with a dot refused', assertFails(setDoc(doc(mo, 'attemptCounts', 'a.b'), cnt(1))));
await t('key of 120 characters ok', assertSucceeds(setDoc(doc(mo, 'attemptCounts', 'a'.repeat(120)), cnt(1))));
await t('key of 121 characters refused', assertFails(setDoc(doc(mo, 'attemptCounts', 'a'.repeat(121)), cnt(1))));
await t('key with underscores and dashes ok', assertSucceeds(setDoc(doc(moOther, 'attemptCounts', 'c-1__dr_mo-2'), cnt(1))));
await t('editor sets a counter to any value', assertSucceeds(setDoc(doc(edi, 'attemptCounts', K), cnt(7))));
await t('editor sets a counter to 0', assertSucceeds(setDoc(doc(edi, 'attemptCounts', K), cnt(0))));
await t('editor cannot set above 10', assertFails(setDoc(doc(edi, 'attemptCounts', K), cnt(11))));
await t('editor cannot set below 0', assertFails(setDoc(doc(edi, 'attemptCounts', K), cnt(-1))));
await t('editor cannot add a field to a counter', assertFails(setDoc(doc(edi, 'attemptCounts', K), cnt(1, { x: 1 }))));
await t('editor cannot use a bad key', assertFails(setDoc(doc(edi, 'attemptCounts', 'Bad Key'), cnt(1))));
await t('editor creates a counter', assertSucceeds(setDoc(doc(edi, 'attemptCounts', 'k-fac'), cnt(2))));
await t('editor reads and lists counters', assertSucceeds(getDocs(collection(edi, 'attemptCounts'))));
await t('editor deletes a counter (another attempt)', assertSucceeds(deleteDoc(doc(edi, 'attemptCounts', K))));
await t('MO can start again after the counter is deleted', assertSucceeds(setDoc(doc(mo, 'attemptCounts', K), cnt(1))));
await t('admin deletes a counter', assertSucceeds(deleteDoc(doc(adm, 'attemptCounts', 'k-fac'))));
await t('ODD (mistyped role) cannot set a counter', assertFails(setDoc(doc(odd, 'attemptCounts', K), cnt(0))));
await t('stranger cannot delete a counter', assertFails(deleteDoc(doc(stranger, 'attemptCounts', K))));
await t('signed out cannot delete a counter', assertFails(deleteDoc(doc(nobody, 'attemptCounts', K))));
await t('no config/test: MO cannot raise a counter', (async () => {
  await env.withSecurityRulesDisabled(async ctx => { await deleteDoc(doc(ctx.firestore(), 'config', 'test')); });
  await assertFails(setDoc(doc(mo, 'attemptCounts', K), cnt(2)));
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'config', 'test'), settings(ADMIN)));
})());

// topics: a question's topic may hold several joined by "; " (up to 240 characters); config/topics is the faculty list
await t('question topic of 240 characters', assertSucceeds(setDoc(doc(edi, 'questions', 'tp-240'), q(EDITOR, { topic: 'a'.repeat(240) }))));
await t('question topic of 241 characters refused', assertFails(setDoc(doc(edi, 'questions', 'tp-241'), q(EDITOR, { topic: 'a'.repeat(241) }))));
await t('question with several topics joined', assertSucceeds(setDoc(doc(edi, 'questions', 'tp-many'), q(EDITOR, { topic: 'Airway; Drugs; Regional' }))));
await t('history topic of 240 ok, 241 refused', (async () => {
  await assertSucceeds(addDoc(collection(edi, 'questions', 'tp-240', 'history'), { ...q(EDITOR, { topic: 'a'.repeat(240) }), savedAt: 6 }));
  await assertFails(addDoc(collection(edi, 'questions', 'tp-240', 'history'), { ...q(EDITOR, { topic: 'a'.repeat(241) }), savedAt: 6 }));
})());
const tops = (email, list, extra = {}) => ({ list, updatedAt: 3, updatedBy: by(email), ...extra });
const names = n => Array.from({ length: n }, (_, i) => 'Topic ' + i);
await t('editor saves the topic list', assertSucceeds(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, ['Airway', 'Drugs']))));
await t('admin saves the topic list', assertSucceeds(setDoc(doc(adm, 'config', 'topics'), tops(ADMIN, ['Airway', 'Drugs', 'Regional']))));
await t('empty topic list ok', assertSucceeds(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, []))));
for (const n of [1, 2, 3, 5, 9, 64, 65, 100, 128, 130, 200]) await t(`list of ${n} topics ok`, assertSucceeds(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, names(n)))));
await t('201 topics refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, names(201)))));
await t('item of 60 characters ok', assertSucceeds(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, ['a'.repeat(60)]))));
await t('item of 61 characters refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, ['a'.repeat(61)]))));
await t('empty item refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, ['Airway', '']))));
await t('non-string item refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, ['Airway', 5]))));
await t('long item deep in a 200 list refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, [...names(199), 'a'.repeat(61)]))));
await t('long item in the middle of a 7 list refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, ['a', 'b', 'c', 'd'.repeat(61), 'e', 'f', 'g']))));
await t('list that is not a list refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, 'Airway'))));
await t('wrong updatedBy refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(ADMIN, ['Airway']))));
await t('extra key refused', assertFails(setDoc(doc(edi, 'config', 'topics'), tops(EDITOR, ['Airway'], { extra: 1 }))));
await t('missing updatedAt refused', assertFails(setDoc(doc(edi, 'config', 'topics'), { list: ['Airway'], updatedBy: by(EDITOR) })));
await t('members read the topic list', assertSucceeds(getDoc(doc(edi, 'config', 'topics'))));
await t('MO cannot read the topic list', assertFails(getDoc(doc(mo, 'config', 'topics'))));
await t('MO cannot write the topic list', assertFails(setDoc(doc(mo, 'config', 'topics'), tops('mo@example.com', ['x']))));
await t('stranger cannot read the topic list', assertFails(getDoc(doc(stranger, 'config', 'topics'))));
await t('stranger cannot write the topic list', assertFails(setDoc(doc(stranger, 'config', 'topics'), tops('someone@example.com', ['x']))));
await t('signed out cannot read the topic list', assertFails(getDoc(doc(nobody, 'config', 'topics'))));
await t('signed out cannot write the topic list', assertFails(setDoc(doc(nobody, 'config', 'topics'), tops(EDITOR, ['x']))));
await t('topic list cannot be deleted', assertFails(deleteDoc(doc(adm, 'config', 'topics'))));
await t('attempt item with a long topic is accepted (stored by the app up to 240)', assertSucceeds(setDoc(doc(mo, 'attempts', 'tp-att'), att('mo-ok', { items: [{ ...item, topic: 'a'.repeat(240) }] }))));

// passphrase rotation locks old sessions out
await t('admin rotates the passphrase', assertSucceeds(setDoc(doc(adm, 'config', 'access'), { passphrase: 'new-passphrase-9' })));
await t('after rotation: MO cannot read questions', assertFails(getDocs(active(mo))));
await t('after rotation: MO cannot read settings', assertFails(getDoc(doc(mo, 'config', 'test'))));
await t('after rotation: MO cannot submit', assertFails(setDoc(doc(mo, 'attempts', 'a-after'), att('mo-ok'))));
await t('after rotation: old passphrase makes no session', assertFails(setDoc(doc(anon('mo-r1'), 'sessions', 'mo-r1'), { name: 'R', pass: PASS, at: 1 })));
await t('after rotation: new passphrase works', assertSucceeds(setDoc(doc(anon('mo-r2'), 'sessions', 'mo-r2'), { name: 'R', pass: 'new-passphrase-9', at: 1 })));
await t('after rotation: new session reads questions', assertSucceeds(getDocs(active(anon('mo-r2')))));
await t('after rotation: owner still reads own attempt', assertSucceeds(getDoc(doc(moOther, 'attempts', 'a-other'))));

// no passphrase document: nobody gets in
await env.withSecurityRulesDisabled(ctx => deleteDoc(doc(ctx.firestore(), 'config', 'access')));
await t('no config/access: session refused', assertFails(setDoc(doc(anon('mo-z'), 'sessions', 'mo-z'), { name: 'Z', pass: '', at: 1 })));
await t('no config/access: old session invalid', assertFails(getDocs(active(anon('mo-r2')))));

await env.cleanup();
if (fail) { console.log(`${fail} of ${n} MO portal rules checks failed`); process.exit(1); }
console.log(`${n} MO portal rules checks passed`);
