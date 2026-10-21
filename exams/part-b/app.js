// The SAQ programme app: sign in, work through the 10-week programme with a soft 15-minute timer, get each answer marked,
// and see progress over time. Talks to the Worker's API at saq.anantf.com (saq/src/worker.js). No framework; one view at
// a time from the hash.

const LIMIT = 15 * 60;
const BANDS = { 8: 'Excellent', 7: 'Better than pass', 6: 'Pass', 5: 'Borderline fail', 4: 'Poor', 3: 'Fail' };
const $ = (sel, root = document) => root.querySelector(sel);
const view = $('#view');
const store = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: k => { try { localStorage.removeItem(k); } catch {} },
};

let auth = null;          // { uid, token } once signed in
let programme = null, Q = {}, me = null;
let stopTimer = null;

// the API: saq.anantf.com from anantf.com, the same address when run locally (test/serve.mjs), or ?api=
const params = new URLSearchParams(location.search);
const API = params.get('api') || (/(^|\.)anantf\.com$/.test(location.hostname) ? 'https://saq.anantf.com' : '');

// ---------- sign-in: email, then a 6-digit code ----------

function startAuth() {
  const token = store.get('saq-token');
  auth = token ? { token } : null;
  route();
}

function signInView(email = store.get('saq-email') || '') {
  nav(false);
  render(`
    <p class="kicker">MMed Anaesthesiology · Part B</p>
    <h1>The 10-week SAQ <em>programme</em></h1>
    <p class="muted">165 past-paper SAQs over 10 weeks. Write each answer against a 15-minute clock, have it marked against a model answer, get the marked script and model answer by email, and track your progress week by week.</p>
    <div class="card">
      <form id="emailForm">
        <label for="em">Your email</label><input id="em" type="email" autocomplete="email" inputmode="email" required value="${esc(email)}">
        <div class="row" style="margin-top:14px"><button class="btn" type="submit">Email me a sign-in code</button></div>
      </form>
      <form id="codeForm" hidden>
        <label for="code">6-digit code</label><input id="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" required style="font:600 24px var(--mono);letter-spacing:.2em;max-width:220px">
        <p class="small muted" id="sentTo"></p>
        <div class="row" style="margin-top:6px"><button class="btn" type="submit">Sign in</button><button class="link" type="button" id="back">Use a different email</button><button class="link" type="button" id="resend">Send a new code</button></div>
      </form>
      <p class="err" id="err" hidden></p>
    </div>
    <p class="small muted">No password. This device stays signed in until you sign out. The code can take a minute; check junk mail if it doesn't arrive.</p>`);
  const err = t => { $('#err').hidden = !t; $('#err').textContent = t || ''; };
  const send = async () => {
    err('');
    const em = $('#em').value.trim();
    const btn = $('#emailForm .btn'); btn.disabled = true;
    try {
      const d = await api('/api/login', { method: 'POST', body: { email: em }, anon: true });
      store.set('saq-email', em);
      $('#emailForm').hidden = true; $('#codeForm').hidden = false;
      $('#sentTo').textContent = `Sent to ${em}.${d.code ? ` (Local test code: ${d.code})` : ''}`;
      $('#code').value = ''; $('#code').focus();
    } catch (e) { err(e.message); } finally { btn.disabled = false; }
  };
  $('#emailForm').onsubmit = e => { e.preventDefault(); send(); };
  $('#resend').onclick = send;
  $('#back').onclick = () => { $('#codeForm').hidden = true; $('#emailForm').hidden = false; err(''); };
  $('#codeForm').onsubmit = async e => {
    e.preventDefault(); err('');
    try {
      const { token } = await api('/api/verify', { method: 'POST', body: { email: $('#em').value.trim(), code: $('#code').value }, anon: true });
      store.set('saq-token', token);
      auth = { token }; me = null; route();
    } catch (x) { err(x.message); }
  };
}

async function signOut() {
  try { await api('/api/logout', { method: 'POST' }); } catch {}
  store.del('saq-token'); auth = null; me = null; programme = null; Q = {};
  route();
}

function joinView() {
  nav(false);
  render(`
    <h1>Join the <em>cohort</em></h1>
    <div class="card">
      <form id="join">
        <p class="small muted" style="margin:0">Signed in as ${esc(me.email)}</p>
        <label for="nm">Your name</label><input id="nm" type="text" autocomplete="name" required>
        <label for="pp">Cohort passphrase</label><input id="pp" type="password" autocomplete="off" ${me.faculty ? '' : 'required'}>
        <p class="small muted">From your programme lead.${me.faculty ? ' Faculty can leave it blank.' : ''}</p>
        <label class="check"><input type="checkbox" id="ok" required> I understand my answers, marks and timings are saved to my account and emailed to me, and that Dr Chew Shi Hao and Dr Koh Wen Jun can see them to support the programme. I can delete my account and everything in it at any time.</label>
        <div class="row" style="margin-top:14px"><button class="btn" type="submit">Join</button><button class="link" type="button" id="out">Sign out</button></div>
      </form>
      <p class="err" id="err" hidden></p>
    </div>`);
  $('#out').onclick = signOut;
  $('#join').onsubmit = async e => {
    e.preventDefault();
    try { await api('/api/join', { method: 'POST', body: { name: $('#nm').value, passphrase: $('#pp').value } }); me = null; route(); }
    catch (x) { $('#err').hidden = false; $('#err').textContent = x.message; }
  };
}

// ---------- data ----------

async function api(path, { method = 'GET', body, anon } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (!anon && auth) headers.Authorization = 'Bearer ' + auth.token;
  let r;
  try { r = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch { const e = new Error('The programme could not be reached. Check your connection.'); e.status = 0; throw e; }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(d.error || 'The programme could not be reached. Check your connection.'); e.status = r.status; e.data = d; throw e; }
  return d;
}

async function load() {
  if (!me) { me = await api('/api/me'); auth.uid = me.email; }
  if (me.user && !programme) {
    programme = await api('/api/programme');
    programme.weeks.forEach(w => w.sessions.forEach((s, si) => s.questions.forEach((q, qi) => { Q[q.id] = { ...q, week: w.num, session: si, sessionLabel: s.label, index: qi }; })));
  }
}

// marked attempts per question, newest last
const byQ = () => {
  const m = {};
  for (const a of me.attempts) (m[a.qid] ||= []).push(a);
  return m;
};
const latestMarked = list => (list || []).filter(a => a.status === 'marked').at(-1);
const draftKey = qid => `saq:${auth.uid}:${qid}`;
const label = q => (q.stem || q.q).replace(/\s+/g, ' ');
const short = (s, n = 110) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const mins = s => (s == null ? '–' : s < 60 ? `${Math.round(s)} s` : `${Math.round(s / 60)} min`);

// ---------- router ----------

async function route() {
  if (stopTimer) { stopTimer(); stopTimer = null; }
  if (!auth) return signInView();
  try { await load(); } catch (e) {
    if (e.status === 401) { store.del('saq-token'); auth = null; me = null; return signInView(); }
    return render(`<p class="err">${esc(e.message)}</p><button class="ghost" onclick="location.reload()">Try again</button>`);
  }
  if (!me.user) return joinView();
  nav(true);
  const [page = '', id = ''] = location.hash.replace(/^#\/?/, '').split('/');
  document.querySelectorAll('.bar nav a').forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#/' + (page || '')));
  if (page === 'w') return weekView(Number(id));
  if (page === 'q') return questionView(id);
  if (page === 'a') return attemptView(id);
  if (page === 'progress') return progressView();
  if (page === 'faculty') return id ? candidateView(decodeURIComponent(id)) : facultyView();
  return homeView();
}
addEventListener('hashchange', route);

function nav(on) {
  $('#nav').hidden = !on;
  $('#navFaculty').hidden = !(on && me?.faculty);
}
function render(html) { view.innerHTML = html; window.scrollTo(0, 0); }

// ---------- home: the weeks ----------

function homeView() {
  const done = byQ();
  const marked = me.attempts.filter(a => a.status === 'marked');
  const last10 = marked.slice(-10);
  const progDone = programme.weeks.flatMap(w => w.sessions.flatMap(s => s.questions)).filter(q => latestMarked(done[q.id])).length;
  const next = programme.weeks.flatMap(w => w.sessions.flatMap(s => s.questions)).find(q => !latestMarked(done[q.id]));
  const avg = last10.length ? (last10.reduce((n, a) => n + a.adjusted, 0) / last10.length).toFixed(1) : '–';
  const pass = last10.length ? Math.round(100 * last10.filter(a => a.adjusted >= 6).length / last10.length) + '%' : '–';
  const time = marked.length ? mins(marked.reduce((n, a) => n + (a.seconds || 0), 0) / marked.length) : '–';
  render(`
    <p class="kicker">Hello, ${esc(me.user.name)}</p>
    <h1>The 10-week <em>programme</em></h1>
    <div class="stats">
      <div class="stat"><span>Done</span><b>${progDone}<small class="muted" style="font-size:16px"> / ${me.programmeCount}</small></b></div>
      <div class="stat"><span>Average, last 10</span><b>${avg}</b></div>
      <div class="stat"><span>Pass rate, last 10</span><b>${pass}</b></div>
      <div class="stat"><span>Average time</span><b>${time}</b></div>
    </div>
    <details class="card"><summary><b>How the programme works</b></summary>
      <p>Three escalating blocks, <strong>165 essays, about 8 hours a week</strong>. Weeks 1–4: 2 essays each weekday and 6 at the weekend. Weeks 5–8 add a third weekday essay. Weeks 9–10 are timed practice. The aim is to start writing immediately and build momentum.</p>
      <p>Each question shows the vignette and the question as they appeared in past papers. Press Start, write as you would in the exam, and submit. The clock is soft: it counts on past 15 minutes so you can see your pace. Your answer is marked on the MMed 3–8 scale and the marked script and model answer are emailed to you.</p>
      <p class="small muted">Model answers come from the department's SAQ bank where one exists; otherwise one is drafted by AI to a 7–8 standard and labelled as not yet reviewed by faculty.</p>
    </details>
    ${next ? `<p><a class="btn" href="#/q/${next.id}">Next: Week ${Q[next.id].week} · ${esc(Q[next.id].sessionLabel)}</a></p>` : '<p class="card">All 165 done. Re-attempt the ones you scored lowest on: see Progress.</p>'}
    ${programme.blocks.map(b => `
      <h2>${esc(b.name)}</h2><p class="muted small" style="margin-top:-6px">${esc(b.sub)}</p>
      ${programme.weeks.filter(w => b.weeks.includes(w.num)).map(w => weekCard(w, done)).join('')}`).join('')}`);
}

function weekCard(w, done) {
  const qs = w.sessions.flatMap(s => s.questions);
  const got = qs.map(q => latestMarked(done[q.id])).filter(Boolean);
  const avg = got.length ? (got.reduce((n, a) => n + a.adjusted, 0) / got.length).toFixed(1) : null;
  return `<a class="week" href="#/w/${w.num}">
    <div class="top"><span class="n">Week ${w.num}</span><span class="small muted">${got.length} / ${qs.length} done${avg ? ` · average ${avg}` : ''}</span></div>
    <div class="meter" role="img" aria-label="${got.length} of ${qs.length} done"><i style="width:${(100 * got.length / qs.length).toFixed(1)}%"></i></div>
  </a>`;
}

function weekView(num) {
  const w = programme.weeks.find(w => w.num === num);
  if (!w) return homeView();
  const done = byQ();
  render(`
    <p class="kicker"><a href="#/">Weeks</a> / ${esc(w.block)}</p>
    <h1>Week ${w.num}</h1>
    ${w.sessions.map(s => `
      <section class="session">
        <h2>${esc(s.label)} <span class="small muted" style="font-family:var(--sans)">· ${esc(s.dur)}</span></h2>
        ${s.questions.map(q => qRow(q, done[q.id])).join('')}
      </section>`).join('')}
    <div class="row">${num > 1 ? `<a class="ghost" href="#/w/${num - 1}">← Week ${num - 1}</a>` : ''}${num < programme.weeks.length ? `<a class="ghost" href="#/w/${num + 1}">Week ${num + 1} →</a>` : ''}</div>`);
}

function qRow(q, list) {
  const m = latestMarked(list);
  const draft = store.get(draftKey(q.id));
  const badge = m ? `<span class="badge mark" title="${BANDS[m.adjusted]}">${m.adjusted}</span>` : draft?.text ? '<span class="badge draft">Draft</span>' : (list || []).length ? '<span class="badge draft">Not marked</span>' : '<span class="badge draft">Start →</span>';
  return `<a class="qrow" href="#/q/${q.id}"><div><span class="tag">${esc(q.tag || 'Bank')}</span>${q.keyed ? '' : '<span class="tag" title="Marked against the rubric only for now">No model answer yet</span>'}<div class="qt">${esc(short(label(q)))}</div></div>${badge}</a>`;
}

// ---------- a question: the timer and the answer ----------

function questionView(id) {
  const q = Q[id];
  if (!q) return homeView();
  const key = draftKey(id);
  let d = store.get(key) || { text: '', elapsed: 0, since: null, started_at: null };
  const history = (byQ()[id] || []).slice().reverse();
  const text = q.bank ? q.q : [q.stem, q.q.split(' · ').join('\n')].filter(Boolean).join('\n\n');
  render(`
    <p class="kicker">${q.bank ? '<a href="#/bank">Bank</a>' : `<a href="#/w/${q.week}">Week ${q.week}</a> / ${esc(q.sessionLabel)}`} · ${esc(q.tag || q.title)}</p>
    <div class="stem">${esc(text)}</div>
    ${q.keyed ? '' : '<p class="small muted">No model answer for this question yet: it is marked against the rubric only.</p>'}
    <div class="timer"><div><span class="clock" id="clock">15:00</span> <span class="small muted" id="clockNote">15 minutes</span></div><div class="row"><button class="ghost" type="button" id="startStop">Start</button></div></div>
    <textarea id="ans" placeholder="Press Start, then write as you would in the exam: headings, bullets, the lot." aria-label="Your answer"></textarea>
    <div class="row" style="justify-content:space-between;margin-top:10px"><span class="saved" id="saved"></span><button class="btn" type="button" id="submit">Submit for marking</button></div>
    <div class="working" id="working" hidden><span class="dot"></span><span>Marking. This takes up to a minute; your answer is already saved.</span></div>
    <p class="err" id="err" hidden></p>
    ${history.length ? `<h2>Your attempts</h2>${history.map(a => `<a class="qrow" href="#/a/${a.id}"><div class="qt">${fmtDate(a.submitted_at)} · ${mins(a.seconds)}</div>${a.status === 'marked' ? `<span class="badge mark">${a.adjusted}</span>` : '<span class="badge draft">Not marked</span>'}</a>`).join('')}` : ''}`);

  const ta = $('#ans'), clock = $('#clock'), note = $('#clockNote'), btn = $('#startStop');
  ta.value = d.text;
  const elapsed = () => d.elapsed + (d.since ? (Date.now() - d.since) / 1000 : 0);
  const save = () => { d.text = ta.value; d.saved_at = Date.now(); store.set(key, d); $('#saved').textContent = d.text ? 'Saved on this device' : ''; };
  const tick = () => {
    const s = Math.round(elapsed()), left = LIMIT - s;
    clock.textContent = left >= 0 ? clockFmt(left) : '+' + clockFmt(-left);
    clock.classList.toggle('over', left < 0);
    note.textContent = left < 0 ? 'over time: keep going, it is recorded' : d.since ? 'remaining' : d.started_at ? 'paused' : '15 minutes';
    btn.textContent = d.since ? 'Pause' : d.started_at ? 'Resume' : 'Start';
  };
  const start = () => { if (!d.since) { d.since = Date.now(); d.started_at ||= new Date().toISOString(); save(); tick(); } };
  btn.onclick = () => { if (d.since) { d.elapsed = elapsed(); d.since = null; save(); } else start(); tick(); if (d.since) ta.focus(); };
  ta.addEventListener('input', () => { start(); save(); });
  const timer = setInterval(tick, 1000); tick();
  if (d.text) $('#saved').textContent = 'Saved on this device';
  stopTimer = () => { clearInterval(timer); save(); };

  $('#submit').onclick = async () => {
    const answer = ta.value.trim();
    const err = $('#err');
    if (!answer) { err.hidden = false; err.textContent = 'Write your answer first.'; return; }
    if (elapsed() < 120 && !confirm('Under 2 minutes on the clock. Submit anyway?')) return;
    d.elapsed = elapsed(); d.since = null; save();
    $('#submit').disabled = true; $('#working').hidden = false; err.hidden = true;
    try {
      const { attempt, modelAnswer } = await api('/api/attempts', { method: 'POST', body: { qid: id, answer, seconds: Math.round(d.elapsed), started_at: d.started_at } });
      done(attempt, null, modelAnswer);
    } catch (e) {
      if (e.data?.attempt) return done(e.data.attempt, e.message);
      err.hidden = false; err.textContent = e.message + ' Your answer is still here.';
      $('#submit').disabled = false; $('#working').hidden = true;
    }
  };
  function done(attempt, message, modelAnswer) {
    store.del(key); stopTimer = null; clearInterval(timer);
    me.attempts.push({ ...attempt, answer: undefined, marking: undefined });
    sessionStorage.setItem('saq-last', JSON.stringify({ attempt, message, modelAnswer }));
    location.hash = '#/a/' + attempt.id;
  }
}

// ---------- an attempt: the marking ----------

async function attemptView(id) {
  let a, message, model;
  try {
    const cached = JSON.parse(sessionStorage.getItem('saq-last') || 'null');
    if (cached?.attempt?.id === id) { ({ attempt: a, message, modelAnswer: model } = cached); sessionStorage.removeItem('saq-last'); }
    else ({ attempt: a, modelAnswer: model } = await api('/api/attempts/' + id));
  } catch (e) { return render(`<p class="err">${esc(e.message)}</p>`); }
  const q = Q[a.qid];
  const mine = a.uid === auth.uid;
  const m = a.marking;
  render(`
    <p class="kicker">${q ? (q.bank ? '<a href="#/bank">Bank</a>' : `<a href="#/w/${q.week}">Week ${q.week}</a> / ${esc(q.sessionLabel)}`) : 'Retired question'} · ${fmtDate(a.submitted_at)} · ${mins(a.seconds)}${a.seconds > LIMIT ? ` (${mins(a.seconds - LIMIT)} over)` : ''}</p>
    <div class="stem">${esc(a.question)}</div>
    ${m ? `
      <div class="card">
        <div class="scores"><div class="score adj"><span>Adjusted</span><b>${m.adjusted}</b></div><div class="score"><span>Raw</span><b>${m.raw}</b></div></div>
        <p class="muted" style="margin:-4px 0 12px">${m.adjusted}: ${BANDS[m.adjusted]}${a.keyed ? '' : ' · marked against the rubric only'}${mine ? ' · the marked script and model answer are in your email' : ''}</p>
        <p class="summary">${esc(m.summary)}</p>
        ${(m.top_fixes || []).length ? `<p class="kicker">To score higher</p><ol>${m.top_fixes.map(f => `<li>${esc(f)}</li>`).join('')}</ol>` : ''}
      </div>
      <div class="card"><p class="kicker">Annotated answer</p><div class="annotated">${md(m.annotated)}</div></div>`
    : `<div class="card"><p class="err">${esc(message || 'This answer has not been marked yet.')}</p>${mine ? '<button class="btn" type="button" id="remark">Mark it now</button><div class="working" id="working" hidden><span class="dot"></span><span>Marking…</span></div>' : ''}<p class="kicker" style="margin-top:14px">Answer</p><pre class="answer">${esc(a.answer)}</pre></div>`}
    ${m && model ? `<details class="card"><summary><b>Model answer</b> <span class="small muted">· ${model.source === 'ai' ? 'drafted by AI, not yet reviewed by faculty' : model.source === 'drafted' ? 'reviewed by faculty' : "from the department's SAQ bank"}</span></summary>${model.source === 'bank' ? `<pre class="answer">${esc(model.text)}</pre>` : `<div class="annotated">${md(model.text)}</div>`}</details>` : ''}
    ${m ? `<details class="card"><summary>Answer as submitted</summary><pre class="answer">${esc(a.answer)}</pre></details>` : ''}
    <div class="row">${mine && q ? `<a class="btn" href="#/q/${a.qid}">Attempt again</a>` : ''}${mine && q && !q.bank ? nextLink(a.qid) : ''}${!mine ? `<a class="ghost" href="#/faculty/${encodeURIComponent(a.uid)}">← Candidate</a>` : ''}</div>`);
  const re = $('#remark');
  if (re) re.onclick = async () => {
    re.disabled = true; $('#working').hidden = false;
    try { const { attempt, modelAnswer } = await api(`/api/attempts/${id}/mark`, { method: 'POST' }); const i = me.attempts.findIndex(x => x.id === id); if (i >= 0) me.attempts[i] = attempt; sessionStorage.setItem('saq-last', JSON.stringify({ attempt, modelAnswer })); attemptView(id); }
    catch (e) { re.disabled = false; $('#working').hidden = true; alert(e.message); }
  };
}

function nextLink(qid) {
  const all = programme.weeks.flatMap(w => w.sessions.flatMap(s => s.questions));
  const i = all.findIndex(q => q.id === qid);
  const n = all[i + 1];
  return n ? `<a class="ghost" href="#/q/${n.id}">Next question →</a>` : '';
}

// ---------- progress ----------

function progressView() {
  const done = byQ();
  const marked = me.attempts.filter(a => a.status === 'marked');
  const weeks = programme.weeks.map(w => { const qs = w.sessions.flatMap(s => s.questions); return { label: `W${w.num}`, total: qs.length, value: qs.filter(q => latestMarked(done[q.id])).length }; });
  const tags = {};
  for (const q of Object.values(Q).filter(q => !q.bank)) {
    const t = (tags[q.tag] ||= { tag: q.tag, total: 0, done: 0, sum: 0, secs: 0 });
    t.total++;
    const m = latestMarked(done[q.id]);
    if (m) { t.done++; t.sum += m.adjusted; t.secs += m.seconds || 0; }
  }
  const rows = Object.values(tags).sort((a, b) => (a.done ? a.sum / a.done : 9) - (b.done ? b.sum / b.done : 9));
  const weakest = [...marked].sort((a, b) => a.adjusted - b.adjusted || a.submitted_at.localeCompare(b.submitted_at)).filter((a, i, l) => l.findIndex(x => x.qid === a.qid) === i && latestMarked(done[a.qid])?.id === a.id).slice(0, 5);
  render(`
    <h1>Your <em>progress</em></h1>
    <h2>Completion by week</h2>
    <div class="card chart" id="cWeeks"></div>
    <h2>Scores over time</h2>
    ${marked.length ? '<div class="card chart" id="cTrend"></div>' : '<p class="muted">Your scores appear here after your first marked answer.</p>'}
    <h2>By topic</h2>
    <p class="muted small">Weakest first. Latest mark for each question.</p>
    <div class="card scroll"><table><thead><tr><th>Topic</th><th class="num">Done</th><th class="num">Average</th><th style="width:30%"></th><th class="num">Time</th></tr></thead><tbody>
      ${rows.map(t => { const avg = t.done ? t.sum / t.done : null; return `<tr><td>${esc(t.tag)}</td><td class="num">${t.done}/${t.total}</td><td class="num">${avg ? avg.toFixed(1) : '–'}</td><td><div class="inbar" role="img" aria-label="${avg ? avg.toFixed(1) + ' of 8' : 'none yet'}"><i style="width:${avg ? (100 * (avg - 3) / 5).toFixed(0) : 0}%"></i></div></td><td class="num">${t.done ? mins(t.secs / t.done) : '–'}</td></tr>`; }).join('')}
    </tbody></table></div>
    ${weakest.length ? `<h2>Worth another go</h2>${weakest.map(a => qRow(Q[a.qid] || { id: a.qid, tag: '', q: 'Retired question' }, done[a.qid])).join('')}` : ''}`);
  barChart($('#cWeeks'), weeks);
  if (marked.length) lineChart($('#cTrend'), marked.map((a, i) => ({ x: i + 1, y: a.adjusted, label: `${fmtDate(a.submitted_at)}: ${a.adjusted} (${BANDS[a.adjusted]})` })));
}

// ---------- faculty ----------

async function facultyView() {
  if (!me.faculty) return homeView();
  const { candidates, programmeCount } = await api('/api/cohort');
  render(`
    <h1>The <em>cohort</em></h1>
    <p class="muted">${candidates.length} joined. Sorted by name; select a row for that candidate's attempts.</p>
    <div class="card scroll"><table><thead><tr><th>Name</th><th class="num">Done</th><th class="num">Attempts</th><th class="num">Average</th><th>Last active</th></tr></thead><tbody>
      ${candidates.map(c => `<tr><td><a href="#/faculty/${encodeURIComponent(c.uid)}">${esc(c.name)}</a><div class="small muted">${esc(c.email)}</div></td><td class="num">${c.done}/${programmeCount}</td><td class="num">${c.attempts}</td><td class="num">${c.avg_adjusted ?? '–'}</td><td>${c.last_at ? fmtDate(c.last_at) : '–'}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="row"><button class="ghost" type="button" id="export">Download every attempt (JSON)</button><button class="ghost" type="button" id="keys">Download AI-drafted model answers, to review</button></div>`);
  const download = (data, name) => Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([data], { type: 'text/plain' })), download: name }).click();
  $('#keys').onclick = async () => {
    const { keys } = await api('/api/keys');
    download(keys.map(k => `# ${k.qid}\n\n${k.question || ''}\n\n---\n\n${k.text}\n`).join('\n\n'), `saq-ai-model-answers-${new Date().toISOString().slice(0, 10)}.md`);
  };
  $('#export').onclick = async () => {
    const d = await api('/api/export');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([JSON.stringify(d, null, 1)], { type: 'application/json' })), download: `saq-attempts-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
  };
}

async function candidateView(uid) {
  if (!me.faculty) return homeView();
  const { user, attempts } = await api('/api/cohort/' + encodeURIComponent(uid));
  render(`
    <p class="kicker"><a href="#/faculty">Cohort</a></p>
    <h1>${esc(user?.name || 'Candidate')}</h1>
    <p class="muted">${esc(user?.email || '')} · joined ${user ? fmtDate(user.joined_at) : '–'}</p>
    <div class="card scroll"><table><thead><tr><th>When</th><th>Question</th><th class="num">Time</th><th class="num">Score</th></tr></thead><tbody>
      ${attempts.slice().reverse().map(a => `<tr><td>${fmtDate(a.submitted_at)}</td><td><a href="#/a/${a.id}">${esc(short(Q[a.qid] ? (Q[a.qid].bank ? 'Bank · ' : `W${Q[a.qid].week} · `) + label(Q[a.qid]) : 'Retired question', 70))}</a></td><td class="num">${mins(a.seconds)}</td><td class="num">${a.status === 'marked' ? a.adjusted : '–'}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No attempts yet.</td></tr>'}
    </tbody></table></div>`);
}

// ---------- account ----------

$('#acct').onclick = () => {
  const dlg = document.createElement('dialog');
  dlg.innerHTML = `<p class="kicker">Account</p><p><b>${esc(me.user.name)}</b><br><span class="muted">${esc(me.email)}</span></p>
    <div class="row"><button class="ghost" value="out">Sign out</button><button class="ghost" value="close">Close</button></div>
    <h3>Delete my account</h3><p class="small muted">Removes every answer, mark and timing. Type DELETE to confirm.</p>
    <div class="row"><input type="text" id="del" style="flex:1" aria-label="Type DELETE"><button class="ghost" value="delete">Delete</button></div>`;
  document.body.append(dlg);
  dlg.addEventListener('click', async e => {
    const v = e.target.value;
    if (v === 'close') dlg.close();
    if (v === 'out') { dlg.close(); await signOut(); }
    if (v === 'delete' && $('#del', dlg).value === 'DELETE') {
      await api('/api/me', { method: 'DELETE' });
      Object.keys(localStorage).filter(k => k.startsWith(`saq:${auth.uid}:`)).forEach(k => store.del(k));
      dlg.close(); store.del('saq-token'); auth = null; me = null; programme = null; route();
    }
  });
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
};

// ---------- charts: one series each, accent colour, hover tooltips ----------

function barChart(el, data) {
  const W = Math.max(280, el.clientWidth - 36), H = 180, L = 0, B = 24, T = 20, max = Math.max(...data.map(d => d.total));
  const bw = (W - L) / data.length, y = v => T + (H - T - B) * (1 - v / max);
  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Questions done per week">
    <line class="grid" x1="0" x2="${W}" y1="${H - B}" y2="${H - B}"/>
    ${data.map((d, i) => { const x = L + i * bw + bw * 0.18, w = bw * 0.64, h = H - B - y(d.value); return `<rect x="${x}" y="${y(d.total)}" width="${w}" height="${H - B - y(d.total)}" fill="var(--wash)"/>${d.value ? `<path class="mark" d="M${x},${H - B} v${-Math.max(0, h - 4)} q0,-4 4,-4 h${w - 8} q4,0 4,4 v${Math.max(0, h - 4)} z"/>` : ''}${d.value ? `<text class="axis" x="${x + w / 2}" y="${y(d.value) - 5}" text-anchor="middle">${d.value}</text>` : ''}<text class="axis" x="${x + w / 2}" y="${H - 6}" text-anchor="middle">${d.label}</text><rect class="hit" x="${L + i * bw}" y="0" width="${bw}" height="${H - B}" data-tip="Week ${i + 1}: ${d.value} of ${d.total} done"/>`; }).join('')}
  </svg>`;
  tips(el);
}

function lineChart(el, pts) {
  const W = Math.max(280, el.clientWidth - 36), H = 200, L = 24, R = 8, B = 24, T = 10, n = pts.length;
  const x = i => L + (n === 1 ? (W - L - R) / 2 : (W - L - R) * (i - 1) / (n - 1)), y = v => T + (H - T - B) * (8 - v) / 5;
  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Adjusted score for each marked answer, in order">
    ${[3, 4, 5, 6, 7, 8].map(v => `<line class="${v === 6 ? 'ref' : 'grid'}" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
    <text class="axis" x="${W - R}" y="${y(6) - 6}" text-anchor="end">pass</text>
    ${n > 1 ? `<polyline class="line" points="${pts.map(p => `${x(p.x)},${y(p.y)}`).join(' ')}"/>` : ''}
    ${pts.map(p => `<circle class="dotm" cx="${x(p.x)}" cy="${y(p.y)}" r="${n > 60 ? 3 : 4.5}"/><rect class="hit" x="${x(p.x) - Math.max(6, (W - L) / n / 2)}" y="${T}" width="${Math.max(12, (W - L) / n)}" height="${H - T - B}" data-tip="${esc(p.label)}"/>`).join('')}
    <text class="axis" x="${L}" y="${H - 6}">Answer 1</text>${n > 1 ? `<text class="axis" x="${W - R}" y="${H - 6}" text-anchor="end">Answer ${n}</text>` : ''}
  </svg>`;
  tips(el);
}

function tips(el) {
  const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; el.append(tip);
  el.querySelectorAll('[data-tip]').forEach(r => {
    const show = () => {
      const b = r.getBoundingClientRect(), c = el.getBoundingClientRect();
      tip.textContent = r.dataset.tip; tip.hidden = false;
      const half = tip.offsetWidth / 2, mid = b.left - c.left + b.width / 2;
      tip.style.left = `${Math.min(Math.max(mid, half), c.width - half)}px`; tip.style.top = `${b.top - c.top + 12}px`;
    };
    r.addEventListener('pointerenter', show); r.addEventListener('pointerleave', () => { tip.hidden = true; });
  });
}

// ---------- helpers ----------

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
const clockFmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const fmtDate = iso => new Date(iso).toLocaleString('en-SG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
// just enough Markdown for an annotated SAQ: headings, bullets, bold, italics, [*examiner comments*]
function md(src) {
  const inline = s => esc(s).replace(/\[\*(.+?)\*\]/g, '<span class="c">[$1]</span>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  let html = '', list = false;
  for (const line of String(src || '').split('\n')) {
    const b = line.match(/^\s*(?:[-*•■]|\d+[.)])\s+(.*)/), h = line.match(/^#{1,4}\s+(.*)/);
    if (b) { if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(b[1])}</li>`; continue; }
    if (list) { html += '</ul>'; list = false; }
    if (h) html += `<h4>${inline(h[1])}</h4>`; else if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  return html + (list ? '</ul>' : '');
}

startAuth();
