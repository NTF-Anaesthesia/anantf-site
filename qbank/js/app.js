// The qbank app (anantf.com/qbank/): practise the department's questions on a phone. No sign-in; progress stays on the
// phone (localStorage, keys qbank.v1.*). Screens are hash routes (#/practise, #/q/<id>, ...). Design: qbank/NOTES.md and
// DESIGN-APP.md: the look is the shared phone-app kit (https://design.anantf.com/v1/app.css) plus ui/qbank.css; ui/ui.js drives the kit's
// markup (sheets, toast, controls, transitions); question logic is in bank.js and practice.js.
import * as B from './bank.js';
import * as P from './practice.js';
import * as U from '../ui/ui.js';
const { $, $$, esc, icon } = U;

const db = U.store('qbank.v1.');
const S = { pool: [], byId: new Map(), papers: [], loaded: false, error: null, browse: { q: '', topic: '' }, cleanup: [] };
const TAB_ROOTS = { '/practise': 'practise', '/browse': 'browse', '/papers': 'papers', '/progress': 'progress' };

// ---------- state on this phone ----------
const progress = () => db.get('progress', {});
const flags = () => db.get('flags', {});
const getSession = () => { const s = db.get('session', null); return s && Array.isArray(s.items) && !s.finishedAt ? s : null; };
const saveSession = s => db.set('session', s);
const pastSessions = () => db.get('history', []).filter(h => h && Array.isArray(h.items));
const isFlagged = id => !!flags()[id];
function setFlag(id, on) { const f = flags(); if (on) f[id] = Date.now(); else delete f[id]; db.set('flags', f); }
const live = id => S.byId.get(id);   // the current bank version of a question, if it is still ready

// ---------- data ----------
async function getJSON(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }
async function load() {
  S.error = null;
  try {
    const bank = await getJSON('bank/questions.json');
    if (bank?.kind !== B.KIND || !Array.isArray(bank.questions)) throw new Error('not a bank');
    const extra = [];
    try {
      const src = await getJSON('sources.json');
      for (const s of src.sources || []) { try { const f = await getJSON(typeof s === 'string' ? s : s.url); if (f?.kind === B.KIND) extra.push(f.questions); } catch { /* one source down: skip it */ } }
    } catch { /* no sources */ }
    S.pool = B.readyQuestions(bank.questions, ...extra);
    S.byId = new Map(S.pool.map(q => [q.id, q]));
    const index = await getJSON('papers.json').catch(() => ({ papers: [] }));
    S.papers = (await Promise.all((index.papers || []).map(id => getJSON(`papers/${id}.json`).catch(() => null)))).filter(Boolean)
      .map(paper => ({ paper, resolved: B.resolvePaper(paper, bank.questions) }));
    S.loaded = true;
  } catch (e) { S.error = e; }
}

// ---------- screen frame (the kit's bar, main, tab bar or toolbar) ----------
const main = () => $('#main');
// large: a top-level screen with a large title that collapses into the bar. Otherwise a pushed screen: solid bar with
// its title (the h1) and a back button. focus: a session or results screen, full screen without the tab bar.
// foot: the buttons of a bottom toolbar.
function frame({ title, large = false, sub = '', back = null, start = '', mid = '', end = '', extra = '', body = '', foot = '', tab = null, focus = false, keepScroll = false, session = false }) {
  for (const f of S.cleanup.splice(0)) f();
  const y = window.scrollY;
  document.body.classList.toggle('qb-focus', !!focus);
  document.body.classList.toggle('app-has-tabbar', !focus);
  document.body.classList.toggle('app-has-toolbar', !!foot);
  $('#tabbar').hidden = !!focus;
  const bar = $('#bar');
  bar.className = 'app-bar app-bar--instant' + (large ? '' : ' app-bar--solid') + (session ? ' qb-session' : '');   // no title fade from the old screen's state
  requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.remove('app-bar--instant')));
  $('#bar-start').innerHTML = back ? `<button type="button" class="app-bar-btn app-back" data-parent="${esc(back.to)}">${esc(back.label)}</button>` : start;
  $('#bar-mid').innerHTML = mid || (large ? `<p class="app-bar-title" aria-hidden="true">${esc(title)}</p>` : `<h1 class="app-bar-title" tabindex="-1">${esc(title)}</h1>`);
  $('#bar-end').innerHTML = end;
  $('#bar-extra').innerHTML = extra;
  const m = main();
  m.className = 'app-main' + (large ? '' : ' qb-pushed');
  m.innerHTML = (large ? `<h1 class="app-large-title" tabindex="-1">${esc(title)}</h1>${sub ? `<p class="app-large-sub">${sub}</p>` : ''}` : '') + body;
  $('#foot').innerHTML = foot ? `<div class="app-toolbar" id="toolbar"><div class="app-toolbar-inner">${foot}</div></div>` : '';
  $$('.app-tab').forEach(t => { if (t.dataset.tab === tab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
  document.title = `${title} · Question bank`;
  window.scrollTo(0, keepScroll ? y : 0);
  if (large) U.watchLargeTitle(bar);
  $('#bar-start .app-back')?.addEventListener('click', e => U.back(e.currentTarget.dataset.parent));
}
const skeleton = () => `<span class="app-skeleton app-skeleton--title qb-sk-title"></span><ul class="app-list" aria-busy="true" aria-label="Loading">${'<li><div class="app-row"><span class="app-row-body"><span class="app-skeleton app-skeleton--line"></span><span class="app-skeleton app-skeleton--short"></span></span></div></li>'.repeat(5)}</ul>`;
function problemView() {
  frame({ title: 'Question bank', large: true, tab: null, body: `<div class="app-panel" role="alert"><p class="app-text">Couldn't load the questions. Check your signal.</p><button type="button" class="app-btn app-btn--secondary app-btn--compact" id="retry">Try again</button></div>` });
  $('#retry').addEventListener('click', async () => { main().innerHTML = skeleton(); await load(); render(U.routeOf(), 'none'); });
}

// ---------- small pieces ----------
const decode = s => { try { return decodeURIComponent(s); } catch { return s; } };   // a mangled link must not stop the app
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const topicLine = q => (q.topics.length ? q.topics : ['General']).map(esc).join(' · ');
const fmtDate = d => { if (!d) return ''; const t = new Date(d + (d.length === 10 ? 'T12:00' : '')); return t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
const fmtWhen = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
// One grouped-list row: a link (href), a button, or plain (still: true). The whole row is the target.
function row({ href = '', id = '', title, sub = '', lead = '', value = '', trail = '', cls = '', clamp = false, chev, still = false, attrs = '' }) {
  const tag = still ? 'div' : href ? 'a' : 'button';
  const open = `<${tag} class="app-row ${cls}"${href && !still ? ` href="${href}"` : ''}${tag === 'button' ? ' type="button"' : ''}${id ? ` id="${id}"` : ''}${attrs}>`;
  return `<li>${open}${lead}<span class="app-row-body"><span class="app-row-title${clamp ? ' qb-clamp' : ''}">${title}</span>${sub ? `<span class="app-row-sub">${sub}</span>` : ''}</span>${value !== '' ? `<span class="app-row-value">${value}</span>` : ''}${trail}${(chev ?? !still) ? U.chevron : ''}</${tag}></li>`;
}
const section = (header, inner, { footer = '', id = '', cls = '', h = 'h2' } = {}) => `<section class="app-section ${cls}">${header ? `<${h} class="app-section-header">${header}</${h}>` : ''}<ul class="app-list"${id ? ` id="${id}"` : ''}>${inner}</ul>${footer ? `<p class="app-section-footer">${footer}</p>` : ''}</section>`;
const tile = U.tile;
const badges = q => {
  const st = P.statusOf(progress(), q.id), fl = isFlagged(q.id);
  return (st === 'missed' ? '<span class="app-badge app-badge--bad">Missed</span>' : '') + (fl ? '<span class="app-badge">Flagged</span>' : '');
};
const qRow = (q, href = `#/q/${q.id}`) => { const b = badges(q); return row({ href, title: esc(q.stem), clamp: true, sub: `<span class="qb-sub">${topicLine(q)}</span>${b ? `<span class="qb-badges">${b}</span>` : ''}` }); };
const minibar = share => `<span class="qb-minibar" aria-hidden="true"><i style="width:${Math.round(share * 100)}%"></i></span>`;
const imgHtml = q => q.image ? `<button type="button" class="qb-img" data-zoom="${esc(q.image)}" aria-label="Enlarge the picture"><img src="${esc(q.image)}" alt="${esc(q.imageAlt || 'Picture for this question')}" loading="eager"></button>` : '';
const emptyCard = (svgIcon, title, text, button = '') => `<div class="app-card app-empty qb-empty"><span class="app-empty-icon" aria-hidden="true">${svgIcon}</span><p class="app-empty-title">${title}</p>${text ? `<p class="app-empty-text">${text}</p>` : ''}${button}</div>`;
const suggestBtn = id => `<button type="button" class="app-btn app-btn--plain app-btn--compact qb-suggest" id="${id}">${icon.edit()}Suggest a change</button>`;

// Choices. mode: 'pick' (practice, not yet answered), 'exam' (selectable), 'feedback' (after answering, or in review),
// 'hidden' (detail, answer not shown), 'reveal' (detail, answer shown). Colour always comes with words: the tag and the
// accessible name ("B, ..., your answer, incorrect").
function choicesHtml(q, mode, picked) {
  const interactive = mode === 'pick' || mode === 'exam';
  const items = q.options.map((o, i) => {
    const L = P.letter(i);
    let cls = '', badge = L, tag = '', said = '';
    if (mode === 'exam' && i === picked) { cls = 'is-selected'; said = ', selected'; }
    if (mode === 'feedback') {
      if (i === q.answer && i === picked) { cls = 'is-correct'; badge = icon.check(); tag = 'Correct'; said = ', your answer, correct'; }
      else if (i === picked) { cls = 'is-incorrect'; badge = icon.cross(); tag = 'Yours'; said = ', your answer, incorrect'; }
      else if (i === q.answer) { cls = 'is-answer'; badge = icon.check(); tag = 'Answer'; said = ', correct answer'; }
      else cls = 'is-dimmed';
    }
    if (mode === 'reveal') {
      if (i === q.answer) { cls = 'is-correct'; badge = icon.check(); tag = 'Answer'; said = ', correct answer'; } else cls = 'is-dimmed';
    }
    const inner = `<span class="app-choice-letter" aria-hidden="true">${badge}</span><span class="app-choice-text"><span class="app-sr">${L}, </span>${esc(o)}<span class="app-sr">${said}</span></span>${tag ? `<span class="app-choice-tag" aria-hidden="true">${tag}</span>` : ''}`;
    return interactive
      ? `<button type="button" class="app-choice ${cls}" data-i="${i}"${mode === 'exam' ? ` aria-pressed="${i === picked}"` : ''}>${inner}</button>`
      : `<li class="app-choice ${cls}">${inner}</li>`;
  }).join('');
  return interactive ? `<div class="app-choices" role="group" aria-labelledby="stem">${items}</div>` : `<ul class="app-choices is-locked qb-ro" aria-labelledby="stem">${items}</ul>`;
}
function questionHtml(q, mode, picked, { kicker = '' } = {}) {
  return `<div class="qb-q"><div class="qb-q-kicker"><span class="app-kicker">${topicLine(q)}</span>${q.level === 'hard' ? '<span class="app-badge app-badge--ink">Hard</span>' : ''}${kicker}</div>
    <p class="qb-stem" id="stem">${esc(q.stem)}</p>${imgHtml(q)}${choicesHtml(q, mode, picked)}<div id="after"></div></div>`;
}
const explainHtml = q => `<div class="app-panel qb-explain"><h2 class="app-kicker">Explanation</h2>${q.explain ? q.explain.split(/\n{2,}/).map(p => `<p>${esc(p)}</p>`).join('') : '<p class="app-muted">No explanation yet. If you know why, suggest one.</p>'}</div>`;
function wireZoom(root = main()) {
  root.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
    U.openSheet({ title: 'Picture', size: 'large', body: `<img class="qb-zoom" src="${esc(b.dataset.zoom)}" alt="${esc(b.querySelector('img')?.alt || 'Picture for this question')}">` });
  }));
}

// ---------- starting sessions ----------
function begin(opts) {
  if (!opts.questions.length) { U.toast('No questions match.'); return; }
  const old = getSession();
  const s = P.newSession(opts);
  saveSession(s);
  if (old) U.toast('Started a new session. The last one was closed.', { action: 'Undo', onAction: () => { saveSession(old); U.go('#/session', { replace: true }); render(U.routeOf(), 'none'); } });
  U.go('#/session');
}
const quickCount = () => Math.min(10, S.pool.length);
const quick = () => begin({ kind: 'quick', label: 'Quick 10', questions: P.pickPractice(S.pool, progress(), 10) });
function practiseTopic(t) {
  const pool = S.pool.filter(q => P.inTopic(q, t));
  begin({ kind: 'topic', label: t, questions: P.pickPractice(pool, progress(), 10) });
}

// ---------- Practise (home) ----------
function viewPractise() {
  const s = getSession(), pr = progress(), fl = flags();
  const missed = S.pool.filter(q => P.statusOf(pr, q.id) === 'missed').length, flagged = S.pool.filter(q => fl[q.id]).length;
  const resume = s ? (() => {
    const left = P.secondsLeft(s), kept = s.items.filter(i => i.picked != null).length;
    return `<div class="app-card app-card--accent" id="resume-card"><p class="app-kicker">Resume</p><p class="app-card-title">Q ${s.pos + 1} of ${s.items.length} · ${esc(s.label)}</p>
      <p class="app-small app-muted" style="margin:0">${kept ? `${plural(kept, 'answer')} kept` : 'Not started yet'}${left != null ? ` · ${left ? P.clock(left) + ' left' : 'time is up'}` : ''}</p>
      <div class="app-card-actions"><button type="button" class="app-btn app-btn--plain" id="discard">Discard</button><button type="button" class="app-btn app-btn--primary" id="resume">Resume</button></div></div>`;
  })() : '';
  const n = quickCount();
  // the number is the questions a learner can actually get: status active and complete (B.readyQuestions); drafts never count
  const body = !S.pool.length ? emptyCard(icon.practise(), 'No questions yet', 'No questions are ready yet. Check again soon.') : `${resume}
    <div class="app-card${s ? '' : ' app-card--accent'}" id="quick-card"><p class="app-kicker">Quick practice</p><p class="app-card-title">${plural(n, 'question')}, mixed</p>
      <p class="app-small app-muted" style="margin:0">Ones you haven't seen and ones you missed come first.</p>
      <div class="app-card-actions"><button type="button" class="app-btn ${s ? 'app-btn--secondary' : 'app-btn--primary'}" id="quick">Start ${plural(n, 'question')}</button></div></div>
    ${section('Practise by', [
      row({ href: '#/topics', title: 'By topic', lead: tile(icon.browse()), value: String(P.topicsOf(S.pool).length) }),
      row({ id: 'exam', title: 'Exam mode', sub: 'Timed, answers at the end', lead: tile(icon.clock()) }),
      row({ href: '#/list/missed', id: 'row-missed', title: 'My missed', lead: tile(icon.cross(), 'app-row-icon--bad'), value: String(missed) }),
      row({ href: '#/list/flagged', id: 'row-flagged', title: 'Flagged', lead: tile(icon.flag(), 'app-row-icon--ink'), value: String(flagged) }),
      row({ id: 'custom', title: 'Custom practice', sub: 'Choose topics, how many and how', lead: tile(icon.sliders()) }),
    ].join(''), { footer: `<span id="ready-count">${plural(S.pool.length, 'question')} ready</span>. Answers and progress stay on this phone.` })}`;
  frame({ title: 'Practise', large: true, tab: 'practise', body });
  $('#quick')?.addEventListener('click', quick);
  $('#resume')?.addEventListener('click', () => U.go('#/session'));
  $('#discard')?.addEventListener('click', () => {
    const old = getSession(); if (!old) return;
    db.del('session'); viewPractise();
    U.toast('Session discarded.', { action: 'Undo', onAction: () => { saveSession(old); viewPractise(); } });
  });
  $('#exam')?.addEventListener('click', examSheet);
  $('#custom')?.addEventListener('click', customSheet);
}

function viewTopics() {
  const pr = progress();
  const rows = P.topicsOf(S.pool).map(({ topic, count }) => {
    const qs = S.pool.filter(q => P.inTopic(q, topic));
    const unseen = qs.filter(q => P.statusOf(pr, q.id) === 'unseen').length, missed = qs.filter(q => P.statusOf(pr, q.id) === 'missed').length;
    return row({ title: esc(topic), sub: `${plural(count, 'question')} · ${unseen} unseen${missed ? ` · ${missed} missed` : ''}`, attrs: ` data-topic="${esc(topic)}"` });
  }).join('');
  frame({ title: 'By topic', back: { label: 'Practise', to: '#/practise' }, tab: 'practise',
    body: section('Topics', rows, { footer: 'Tap a topic to start up to 10 of its questions.' }) });
  $$('[data-topic]').forEach(b => b.addEventListener('click', () => practiseTopic(b.dataset.topic)));
}

function viewList(kind) {
  const pr = progress(), fl = flags();
  const qs = S.pool.filter(q => kind === 'missed' ? P.statusOf(pr, q.id) === 'missed' : fl[q.id]);
  const title = kind === 'missed' ? 'My missed' : 'Flagged';
  const body = qs.length
    ? `<div class="app-btn-stack qb-top-action"><button type="button" class="app-btn app-btn--primary app-btn--block" id="go">Practise these (${qs.length})</button></div>${section('', qs.map(q => qRow(q)).join(''))}`
    : kind === 'missed'
      ? emptyCard(icon.check(), 'Nothing missed yet', 'Questions you get wrong collect here, so you can try them again.', `<button type="button" class="app-btn app-btn--primary" id="quick">Start ${plural(quickCount(), 'question')}</button>`)
      : emptyCard(icon.flag(), 'Nothing flagged yet', 'Flag a question during practice to find it here.', `<button type="button" class="app-btn app-btn--primary" id="quick">Start ${plural(quickCount(), 'question')}</button>`);
  frame({ title, back: { label: 'Practise', to: '#/practise' }, tab: 'practise', body });
  $('#go')?.addEventListener('click', () => begin({ kind, label: title, questions: B.shuffle(qs) }));
  $('#quick')?.addEventListener('click', quick);
}

// ---------- sheets: custom practice and exam mode ----------
const topicOptions = () => P.topicsOf(S.pool).map(t => ({ value: t.topic, label: t.topic }));
function customSheet() {
  const saved = db.get('custom', {});
  let topics = (saved.topics || []).filter(t => S.pool.some(q => P.inTopic(q, t)));
  let status = saved.status || 'all', count = P.COUNTS.includes(saved.count) ? saved.count : 10, mode = saved.mode || 'practice';
  const sh = U.openSheet({ title: 'Custom practice',
    body: `<h3 class="app-section-header qb-sheet-h">Topics</h3>${U.chips('topics', topicOptions(), topics, 'Topics')}<p class="app-section-footer qb-chips-foot">None chosen means every topic.</p>
      <h3 class="app-section-header qb-sheet-h">Questions</h3>${U.seg('status', [{ value: 'all', label: 'All' }, { value: 'unseen', label: 'Unseen' }, { value: 'missed', label: 'Missed' }, { value: 'flagged', label: 'Flagged' }], status, 'Which questions')}
      <ul class="app-list qb-sheet-list"><li>${U.stepper('count', 'How many', P.countLabel(count))}</li></ul>
      <h3 class="app-section-header qb-sheet-h">Mode</h3>${U.seg('mode', [{ value: 'practice', label: 'Practice' }, { value: 'exam', label: 'Exam' }], mode, 'Mode')}
      <p class="app-section-footer" id="mode-hint"></p>`,
    foot: `<p class="qb-live" id="match" role="status"></p><button type="button" class="app-btn app-btn--primary app-btn--block" id="cstart">Start</button>` });
  const el = sh.el;
  const matching = () => P.filterPool(S.pool, { topics, status }, progress(), flags());
  const paint = () => {
    const n = matching().length, take = count ? Math.min(count, n) : n;
    el.querySelector('#match').textContent = `${plural(n, 'question')} match${n === 1 ? 'es' : ''}${n && take < n ? `; you'll get ${take}` : ''}.`;
    el.querySelector('#cstart').setAttribute('aria-disabled', n ? 'false' : 'true');
    el.querySelector('#mode-hint').textContent = mode === 'exam' ? `Timed (1 minute a question), answers at the end.` : 'See the answer after each question.';
    db.set('custom', { topics, status, count, mode });
  };
  U.wireChips(el, 'topics', v => { topics = v; paint(); });
  U.wireSeg(el, 'status', v => { status = v; paint(); });
  U.wireSeg(el, 'mode', v => { mode = v; paint(); });
  U.wireStepper(el, 'count', P.COUNTS, P.COUNTS.indexOf(count), v => { count = v; paint(); }, P.countLabel);
  let going = false;
  el.querySelector('#cstart').addEventListener('click', () => {
    if (going) return;
    const pool = matching(); if (!pool.length) { U.toast('No questions match. Choose more topics or All.'); return; }
    going = true;
    const qs = P.pickPractice(pool, progress(), count);
    begin({ kind: 'custom', label: mode === 'exam' ? 'Custom exam' : 'Custom', mode, questions: qs, minutes: qs.length });
  });
  paint();
}
const MINUTES = Array.from({ length: 120 }, (_, i) => i + 1);   // default: one minute a question
function examSheet() {
  const saved = db.get('exam', {});
  let topics = (saved.topics || []).filter(t => S.pool.some(q => P.inTopic(q, t)));
  let count = P.COUNTS.includes(saved.count) ? saved.count : 20, minutes = saved.minutes || 0, touched = !!saved.minutes;
  const sh = U.openSheet({ title: 'Exam mode',
    body: `<p class="app-small app-muted qb-sheet-intro">Timed. You can change answers and flag questions; you'll see the answers when you submit.</p>
      <ul class="app-list qb-sheet-list"><li>${U.stepper('ecount', 'Questions', P.countLabel(count))}</li><li>${U.stepper('emin', 'Minutes', '')}</li></ul>
      <h3 class="app-section-header qb-sheet-h">Topics</h3>${U.chips('etopics', topicOptions(), topics, 'Topics')}<p class="app-section-footer qb-chips-foot">None chosen means every topic.</p>`,
    foot: `<p class="qb-live" id="ematch" role="status"></p><button type="button" class="app-btn app-btn--primary app-btn--block" id="estart">Start exam</button>` });
  const el = sh.el;
  const pool = () => P.filterPool(S.pool, { topics }, progress(), flags());
  const n = () => { const p = pool().length; return count ? Math.min(count, p) : p; };
  const fitMinutes = () => Math.min(MINUTES.length, Math.max(1, n()));
  const mins = U.wireStepper(el, 'emin', MINUTES, Math.max(0, MINUTES.indexOf(minutes || fitMinutes())), v => { minutes = v; touched = true; paint(); }, v => `${v}`);
  const paint = () => {
    if (!touched) { minutes = fitMinutes(); mins.set(minutes); }
    el.querySelector('#ematch').textContent = `${plural(n(), 'question')} · ${minutes} minutes`;
    el.querySelector('#estart').setAttribute('aria-disabled', n() ? 'false' : 'true');
    db.set('exam', { topics, count, minutes: touched ? minutes : 0 });
  };
  U.wireStepper(el, 'ecount', P.COUNTS, P.COUNTS.indexOf(count), v => { count = v; paint(); }, P.countLabel);
  U.wireChips(el, 'etopics', v => { topics = v; paint(); });
  let going = false;
  el.querySelector('#estart').addEventListener('click', () => {
    if (going) return;
    const p = pool(); if (!p.length) { U.toast('No questions match.'); return; }
    going = true;
    begin({ kind: 'exam', label: 'Exam', mode: 'exam', questions: B.shuffle(p).slice(0, count || p.length), minutes });
  });
  paint();
}

// ---------- the session (full screen, no tab bar) ----------
let timerId = 0;
const vt = d => (d === 'none-keep' ? 'none' : d);   // 'none-keep': redraw in place, no animation, same scroll
function viewSession(dir) {
  const s = getSession();
  if (!s) { U.go('#/practise', { replace: true }); return; }
  if (P.secondsLeft(s) === 0) { finish(true); return; }   // the time ran out while the app was closed
  s.pos = Math.min(Math.max(0, s.pos | 0), s.items.length - 1);
  const it = s.items[s.pos], q = it.q, exam = s.mode === 'exam', n = s.items.length;
  const answered = s.items.filter(i => i.picked != null).length;
  const done = !exam && it.picked != null;
  const left = P.secondsLeft(s);
  const timer = left == null ? '' : s.timerHidden
    ? `<button type="button" class="app-bar-btn qb-timer is-hidden-time" id="timer">Show timer</button>`
    : `<button type="button" class="app-bar-btn qb-timer${left < 300 ? ' is-low' : ''}" id="timer" aria-label="Time left ${P.clock(left)}. Tap to hide">${P.clock(left)}</button>`;
  const flagBtn = `<button type="button" class="app-bar-btn qb-flag" id="flag" aria-pressed="${it.flagged}" aria-label="Flag this question">${it.flagged ? icon.flagOn() : icon.flag()}</button>`;
  const last = s.pos === n - 1;
  const foot = exam
    ? `<button type="button" class="app-btn app-btn--outline" id="prev" aria-disabled="${s.pos === 0}">${icon.back()}Back</button><button type="button" class="app-btn app-btn--outline qb-flag-btn" id="flag2" aria-pressed="${it.flagged}">${it.flagged ? icon.flagOn() : icon.flag()}Flag</button><button type="button" class="app-btn app-btn--primary" id="next">${last ? 'Finish' : 'Next' + icon.forward()}</button>`
    : done ? `<button type="button" class="app-btn app-btn--outline" id="why">Explanation</button><button type="button" class="app-btn app-btn--primary" id="next">${last ? 'See results' : 'Next' + icon.forward()}</button>` : '';
  const sessionTitle = `Question ${s.pos + 1} of ${n}`;
  U.transition(vt(dir), () => {
    frame({
      title: sessionTitle, focus: true, session: true, keepScroll: dir === 'none-keep',
      start: `<button type="button" class="app-bar-btn" id="leave" aria-label="Leave this session">${icon.close()}</button>`,
      mid: `<button type="button" class="app-pill qb-qpill" id="navpill" aria-label="${sessionTitle}. Open the question list">${icon.grid()}<span>Q ${s.pos + 1}/${n}</span></button>`,
      end: timer + (exam ? '' : flagBtn),
      extra: `<progress class="app-progress qb-bar-progress" max="${n}" value="${answered}" aria-label="Questions answered: ${answered} of ${n}"></progress>`,
      body: `<h1 class="app-sr">${sessionTitle} · ${esc(s.label)}</h1>${questionHtml(q, exam ? 'exam' : done ? 'feedback' : 'pick', it.picked)}`,
      foot,
    });
    if (done) $('#after').innerHTML = explainHtml(q) + suggestBtn('suggest');
    wireSession(s);
  });
  // preload the next question's picture
  const nx = s.items[s.pos + 1]; if (nx?.q.image) { const im = new Image(); im.src = nx.q.image; }
}
function wireSession(s) {
  const it = s.items[s.pos], exam = s.mode === 'exam';
  const move = d => { const cur = getSession(); if (!cur) return; cur.pos = Math.min(cur.items.length - 1, Math.max(0, cur.pos + d)); saveSession(cur); viewSession(d > 0 ? 'push' : 'pop'); };
  $$('.app-choice[data-i]').forEach(b => b.addEventListener('click', () => {
    const cur = getSession(); if (!cur) return;
    const ci = cur.items[cur.pos], i = Number(b.dataset.i);
    if (exam) { ci.picked = i; ci.at = Date.now(); saveSession(cur); viewSession('none-keep'); return; }
    if (ci.picked != null) return;
    ci.picked = i; ci.at = Date.now(); saveSession(cur);
    const right = i === ci.q.answer;
    db.set('progress', P.record(progress(), ci.q.id, right)); db.set('days', P.addDay(db.get('days', [])));
    U.haptic();
    viewSession('none-keep');
    feedbackSheet(cur);
  }));
  const toggleFlag = () => { const cur = getSession(); const ci = cur.items[cur.pos]; ci.flagged = !ci.flagged; saveSession(cur); setFlag(ci.q.id, ci.flagged); viewSession('none-keep'); U.announce(ci.flagged ? 'Flagged' : 'Flag removed'); };
  $('#flag')?.addEventListener('click', toggleFlag);
  $('#flag2')?.addEventListener('click', toggleFlag);
  $('#prev')?.addEventListener('click', () => { if (s.pos > 0) move(-1); });
  $('#next')?.addEventListener('click', () => { if (s.pos < s.items.length - 1) move(1); else if (exam) checkSheet(); else finish(); });
  $('#why')?.addEventListener('click', () => feedbackSheet(getSession()));
  $('#suggest')?.addEventListener('click', () => suggestSheet(live(it.q.id) || it.q));
  $('#leave').addEventListener('click', leaveSheet);
  $('#navpill').addEventListener('click', navigatorSheet);
  $('#timer')?.addEventListener('click', () => { const cur = getSession(); cur.timerHidden = !cur.timerHidden; saveSession(cur); viewSession('none-keep'); });
  wireZoom();
  if (P.secondsLeft(s) != null) {
    clearInterval(timerId);
    timerId = setInterval(() => {
      const cur = getSession(); if (!cur || !location.hash.startsWith('#/session')) { clearInterval(timerId); return; }
      const left = P.secondsLeft(cur), t = $('#timer');
      if (left <= 0) { clearInterval(timerId); finish(true); return; }
      if (left < 300 && !cur.warned) { cur.warned = true; saveSession(cur); U.announce('Less than 5 minutes left.'); }
      if (t && !cur.timerHidden) { t.textContent = P.clock(left); t.classList.toggle('is-low', left < 300); t.setAttribute('aria-label', `Time left ${P.clock(left)}. Tap to hide`); }
    }, 1000);
    S.cleanup.push(() => clearInterval(timerId));
  }
}
function feedbackSheet(s) {
  const it = s.items[s.pos], q = it.q, right = it.picked === q.answer, last = s.pos === s.items.length - 1;
  const title = right ? 'Correct' : `Incorrect, answer ${P.letter(q.answer)}`;
  const sh = U.openSheet({ title, cls: 'qb-feedback',
    titleHtml: `<span class="qb-verdict ${right ? 'is-ok' : 'is-bad'}">${right ? icon.check() : icon.cross()}<span>${esc(title)}</span></span>`,
    body: `<p class="app-text">${right ? '' : `You chose ${P.letter(it.picked)}. `}The answer is <b>${P.letter(q.answer)}</b>: ${esc(q.options[q.answer])}</p>${explainHtml(q)}${suggestBtn('fsuggest')}`,
    foot: `<button type="button" class="app-btn app-btn--primary app-btn--block" id="fnext">${last ? 'See results' : 'Next question'}</button>`,
    onClose: () => $('#next')?.focus({ preventScroll: true }) });
  U.announce(title);
  let going = false;
  sh.el.querySelector('#fnext').addEventListener('click', async () => {
    if (going) return;   // a double tap moves one question, not two
    going = true;
    await sh.close();
    const cur = getSession(); if (!cur) return;
    if (cur.pos < cur.items.length - 1) { cur.pos++; saveSession(cur); viewSession('push'); } else finish();
  });
  sh.el.querySelector('#fsuggest').addEventListener('click', () => suggestSheet(live(q.id) || q));
}
function leaveSheet() {
  const sh = U.openSheet({ title: 'Leave?', body: '<p class="app-text">Your answers are kept. You can carry on from Practise.</p>',
    foot: '<div class="app-btn-row qb-foot-row"><button type="button" class="app-btn app-btn--outline" id="stay">Keep going</button><button type="button" class="app-btn app-btn--primary" id="goaway">Leave</button></div>' });
  sh.el.querySelector('#stay').addEventListener('click', () => sh.close());
  sh.el.querySelector('#goaway').addEventListener('click', () => U.go('#/practise'));
}
function navigatorSheet() {
  const s = getSession(); if (!s) return;
  const dots = s.items.map((it, i) => {
    const st = [it.picked != null ? 'answered' : 'unanswered', it.flagged ? 'flagged' : '', i === s.pos ? 'current' : ''].filter(Boolean);
    const cls = [it.picked != null ? 'is-done' : '', it.flagged ? 'is-flag' : '', i === s.pos ? 'is-cur' : ''].filter(Boolean).join(' ');
    return `<li><button type="button" class="qb-dot ${cls}" data-n="${i}" aria-label="Question ${i + 1}, ${st.join(', ')}"${i === s.pos ? ' aria-current="step"' : ''}>${i + 1}</button></li>`;
  }).join('');
  const sh = U.openSheet({ title: 'Questions', size: 'medium',
    body: `<ul class="qb-navgrid">${dots}</ul><ul class="qb-legend" aria-hidden="true"><li><i></i>Not answered</li><li><i class="is-done"></i>Answered</li><li><i class="is-flag"></i>Flagged</li><li><i class="is-cur"></i>This one</li></ul>` });
  let going = false;
  sh.el.querySelectorAll('.qb-dot').forEach(d => d.addEventListener('click', async () => {
    if (going) return; going = true;
    await sh.close(); const cur = getSession(); if (!cur) return; const n = Number(d.dataset.n), was = cur.pos; cur.pos = n; saveSession(cur); viewSession(n > was ? 'push' : n < was ? 'pop' : 'none-keep');
  }));
}
function checkSheet() {
  const s = getSession(), sc = P.score(s);
  const firstUn = s.items.findIndex(i => i.picked == null), firstFl = s.items.findIndex(i => i.flagged);
  const line = sc.unanswered || sc.flagged ? [sc.unanswered ? `${sc.unanswered} unanswered` : '', sc.flagged ? `${sc.flagged} flagged` : ''].filter(Boolean).join(', ') : 'Every question answered.';
  const sh = U.openSheet({ title: 'Submit your answers?',
    body: `<p class="qb-check-line">${line}</p>
      <div class="app-btn-stack">${firstUn >= 0 ? `<button type="button" class="app-btn app-btn--secondary app-btn--block" data-goto="${firstUn}">Go to unanswered (${sc.unanswered})</button>` : ''}${firstFl >= 0 ? `<button type="button" class="app-btn app-btn--secondary app-btn--block" data-goto="${firstFl}">Go to flagged (${sc.flagged})</button>` : ''}</div>`,
    foot: '<button type="button" class="app-btn app-btn--primary app-btn--block" id="submit">Submit</button>' });
  sh.el.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', async () => { await sh.close(); const cur = getSession(); if (!cur) return; cur.pos = Number(b.dataset.goto); saveSession(cur); viewSession('pop'); }));
  sh.el.querySelector('#submit').addEventListener('click', () => finish());
}
function finish(timeUp = false) {
  const s = getSession(); if (!s) return;
  s.finishedAt = Date.now(); if (timeUp) s.timeUp = true;
  if (s.mode === 'exam') {
    let pr = progress();
    for (const it of s.items) if (it.picked != null) pr = P.record(pr, it.q.id, it.picked === it.q.answer, s.finishedAt);
    db.set('progress', pr); db.set('days', P.addDay(db.get('days', [])));
  }
  db.set('history', [s, ...pastSessions()].slice(0, P.HISTORY_MAX));
  db.del('session');
  clearInterval(timerId);
  if (timeUp) U.toast('Time is up. Your answers were submitted.');
  U.go(`#/summary/${s.id}`, { replace: true });
}

// ---------- summary and review ----------
const findDone = id => pastSessions().find(h => h.id === id);
const markOf = st => st === 'right' ? `<span class="qb-mark is-ok" aria-hidden="true">${icon.check()}</span>` : st === 'wrong' ? `<span class="qb-mark is-bad" aria-hidden="true">${icon.cross()}</span>` : `<span class="qb-mark is-none" aria-hidden="true">${icon.dash()}</span>`;
const markWord = st => (st === 'right' ? 'Right' : st === 'wrong' ? 'Wrong' : 'Not answered');
function viewSummary(id, params, dir) {
  const s = findDone(id);
  const fromProgress = params.get('from') === 'progress';
  const back = fromProgress ? { label: 'Progress', to: '#/progress' } : null;
  if (!s) { frame({ title: 'Results', back: back || { label: 'Practise', to: '#/practise' }, focus: true, body: emptyCard(icon.progress(), 'Not on this phone', 'This session is no longer on this phone.') }); return; }
  const sc = P.score(s), first = !s.ringShown;
  if (first) { db.set('history', pastSessions().map(h => h.id === id ? { ...h, ringShown: true } : h)); }
  const filter = S.summaryFilter?.id === id ? S.summaryFilter.f : 'all';
  const rows = s.items.map((it, n) => ({ it, n, st: P.itemState(it) })).filter(({ it, st }) => filter === 'all' || (filter === 'wrong' ? st === 'wrong' : filter === 'flagged' ? it.flagged : st === 'unanswered'));
  const retry = s.items.filter(i => P.itemState(i) !== 'right' || i.flagged);
  const meta = `${esc(s.label)}${(m => m === s.label ? '' : ' · ' + m)(s.mode === 'exam' ? 'Exam' : 'Practice')} · ${P.duration(s.finishedAt - s.startedAt)}${s.timeUp ? ' · time ran out' : ''}`;
  const passLine = s.paper ? `<p class="qb-pass"><span class="app-badge ${sc.pass ? 'app-badge--ok' : 'app-badge--bad'}">${sc.pass ? 'Pass' : 'Not yet'}</span><span class="app-small app-muted">Pass mark ${s.paper.passMark}%</span></p>` : '';
  const body = `<div class="app-card qb-result" id="score">${U.ring(sc.pct, `${sc.pct} percent`, s.paper ? (sc.pass ? 'Pass' : 'Not yet') : 'Right', !!(s.paper && sc.pass), first && !U.reduced())}
      <div class="qb-result-text"><p class="qb-result-big">${sc.right} of ${sc.total}</p><p class="app-small app-muted" style="margin:0">${meta}</p>${passLine}</div></div>
    ${retry.length ? `<div class="app-btn-stack qb-top-action"><button type="button" class="app-btn app-btn--primary app-btn--block" id="retry">Retry wrong and flagged (${retry.length})</button></div>` : ''}
    ${section('By topic', P.sessionTopics(s).map(t => row({ still: true, title: esc(t.topic), value: `${t.right}/${t.total}`, trail: minibar(t.right / t.total) })).join(''))}
    <h2 class="app-section-header qb-list-h">Questions</h2>
    ${U.chips('sfilter', [{ value: 'all', label: 'All' }, { value: 'wrong', label: 'Wrong', count: sc.wrong }, { value: 'flagged', label: 'Flagged', count: sc.flagged }, { value: 'unanswered', label: 'Unanswered', count: sc.unanswered }], [filter], 'Show')}
    ${rows.length ? section('', rows.map(({ it, n, st }) => row({ href: `#/review/${s.id}/${n}`, lead: markOf(st), title: `<span class="app-sr">${markWord(st)}: </span>${esc(it.q.stem)}`, clamp: true })).join(''), { cls: 'qb-after-chips' }) : `<p class="qb-none">None.</p>`}`;
  const foot = `<button type="button" class="app-btn ${retry.length ? 'app-btn--outline' : 'app-btn--primary'}" id="done">Done</button>`;
  U.transition(vt(dir === 'replace' ? 'fade' : dir), () => {
    frame({ title: 'Results', back, focus: true, body, foot, keepScroll: dir === 'none-keep' });
    U.wireChips(main(), 'sfilter', v => { S.summaryFilter = { id, f: v[0] || 'all' }; viewSummary(id, params, 'none-keep'); }, { single: true });
    let going = false;
    $('#retry')?.addEventListener('click', () => { if (going) return; going = true; begin({ kind: 'retry', label: 'Retry', questions: retry.map(i => live(i.q.id) || { ...i.q }) }); });
    $('#done').addEventListener('click', () => fromProgress ? U.back('#/progress') : U.go('#/practise', { replace: true }));
  });
}
function viewReview(id, n, dir) {
  const s = findDone(id); n = Number(n);
  if (!s || !s.items[n]) { U.go(`#/summary/${id}`, { replace: true }); return; }
  const it = s.items[n], total = s.items.length;
  const st = P.itemState(it);
  const verdict = st === 'right' ? `<p class="qb-verdict is-ok">${icon.check()}<span>Correct</span></p>` : st === 'wrong' ? `<p class="qb-verdict is-bad">${icon.cross()}<span>Incorrect, answer ${P.letter(it.q.answer)}</span></p>` : `<p class="qb-verdict">${icon.dash()}<span>Not answered. The answer is ${P.letter(it.q.answer)}</span></p>`;
  const go = d => { const m = n + d; if (m < 0 || m >= total) return; S.nextDir = d > 0 ? 'push' : 'pop'; U.go(`#/review/${id}/${m}`, { replace: true }); };
  frame({ title: `${n + 1} of ${total}`, back: { label: 'Results', to: `#/summary/${id}` }, focus: true,
    end: it.flagged ? '<span class="app-badge">Flagged</span>' : '',
    body: `${verdict}${questionHtml(it.q, 'feedback', it.picked)}`,
    foot: `<button type="button" class="app-btn app-btn--outline" id="rprev" aria-disabled="${n === 0}">${icon.back()}Previous</button><button type="button" class="app-btn app-btn--primary" id="rnext" aria-disabled="${n === total - 1}">Next${icon.forward()}</button>` });
  $('#after').innerHTML = explainHtml(it.q) + suggestBtn('suggest');
  $('#suggest').addEventListener('click', () => suggestSheet(live(it.q.id) || it.q));
  $('#rprev').addEventListener('click', () => go(-1));
  $('#rnext').addEventListener('click', () => go(1));
  wireZoom();
  // swipe sideways to page
  const m = main(); let x0 = null, y0 = 0;
  const down = e => { x0 = e.clientX; y0 = e.clientY; };
  const up = e => { if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1); };
  m.addEventListener('pointerdown', down); m.addEventListener('pointerup', up);
  S.cleanup.push(() => { m.removeEventListener('pointerdown', down); m.removeEventListener('pointerup', up); });
}

// ---------- Browse ----------
function viewBrowse() {
  const tops = P.topicsOf(S.pool);
  if (S.browse.topic && !tops.some(t => t.topic === S.browse.topic)) S.browse.topic = '';
  frame({ title: 'Browse', large: true, tab: 'browse',
    body: `<div class="qb-search">${icon.search()}<input type="search" class="qb-search-input" id="find" placeholder="Search questions" aria-label="Search questions, choices and explanations" enterkeyhint="search" autocomplete="off" value="${esc(S.browse.q)}"></div>
      ${U.chips('btopic', [{ value: '', label: 'All topics' }, ...tops.map(t => ({ value: t.topic, label: t.topic }))], [S.browse.topic], 'Topic')}
      <div id="blist"></div>` });
  const paint = () => {
    const { q, topic } = S.browse, pr = progress();
    if (!q.trim() && !topic) {
      $('#blist').innerHTML = section('Topics', tops.map(t => { const m = P.topicMastery(S.pool, pr, t.topic); return row({ href: `#/browse/t/${encodeURIComponent(t.topic)}`, title: esc(t.topic), sub: plural(t.count, 'question'), trail: minibar(m.share) + `<span class="app-sr">${m.right} of ${m.total} right last time</span>` }); }).join(''), { footer: 'The bar shows how many you got right last time.' });
      return;
    }
    const hits = S.pool.filter(x => (!topic || P.inTopic(x, topic)) && B.matchesQuery(x, q));
    $('#blist').innerHTML = `<p class="qb-count" role="status">${plural(hits.length, 'question')}</p>${hits.length ? section('', hits.map(x => qRow(x)).join('')) : emptyCard(icon.search(), 'No matches', `No questions match${q.trim() ? ` “${esc(q.trim())}”` : ''}. Try fewer words or another topic.`)}`;
  };
  let t = 0;
  $('#find').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { S.browse.q = e.target.value; paint(); }, 150); });
  $('#find').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
  U.wireChips(main(), 'btopic', v => { S.browse.topic = v[0] || ''; paint(); }, { single: true });
  paint();
}
function viewBrowseTopic(topic) {
  topic = decode(topic);
  const qs = S.pool.filter(q => P.inTopic(q, topic));
  frame({ title: topic, back: { label: 'Browse', to: '#/browse' }, tab: 'browse',
    body: qs.length ? `<div class="app-btn-stack qb-top-action"><button type="button" class="app-btn app-btn--primary app-btn--block" id="pt">Practise this topic</button></div>${section(plural(qs.length, 'question'), qs.map(q => qRow(q)).join(''))}`
      : emptyCard(icon.browse(), 'Nothing here yet', 'No questions in this topic yet.') });
  $('#pt')?.addEventListener('click', () => practiseTopic(topic));
}
function viewQuestion(id, params) {
  const q = live(id);
  const back = { label: 'Back', to: '#/browse' };
  if (!q) { frame({ title: 'Question', back, tab: 'browse', body: emptyCard(icon.browse(), 'Not in the bank', 'This question is no longer in the bank.') }); return; }
  const shown = S.reveal === id;
  const st = P.statusOf(progress(), id), fl = isFlagged(id);
  const kicker = (st === 'missed' ? '<span class="app-badge app-badge--bad">Missed</span>' : '') + (fl ? '<span class="app-badge">Flagged</span>' : '');
  frame({ title: 'Question', back, tab: 'browse', keepScroll: params.get('keep') === '1',
    body: `<h2 class="app-sr">${esc(topicLine(q))}</h2>${questionHtml(q, shown ? 'reveal' : 'hidden', null, { kicker })}
      ${section('', [
        row({ id: 'qpt', title: 'Practise this topic', sub: esc(q.topics[0] || 'General'), lead: tile(icon.play()) }),
        row({ id: 'qflag', title: fl ? 'Flagged' : 'Flag this question', sub: fl ? 'Tap to remove the flag' : 'Find it later under Flagged', lead: tile(fl ? icon.flagOn() : icon.flag(), 'app-row-icon--ink'), chev: false, attrs: ` aria-pressed="${fl}"` }),
        row({ id: 'qsuggest', title: 'Suggest a change', sub: 'Send a correction or comment to the owner', lead: tile(icon.edit()) }),
      ].join(''), { cls: 'qb-q-actions' })}` });
  $('#after').innerHTML = shown
    ? explainHtml(q) + `<div class="qb-meta">${q.source ? `<p>Source: ${esc(q.source)}</p>` : ''}${q.updated ? `<p>Updated ${esc(fmtDate(q.updated))}</p>` : ''}</div>`
    : `<button type="button" class="app-btn app-btn--secondary app-btn--block qb-show" id="show">Show answer</button>`;
  $('#show')?.addEventListener('click', () => { S.reveal = id; viewQuestion(id, new URLSearchParams('keep=1')); $('#stem')?.scrollIntoView({ block: 'nearest' }); U.announce(`The answer is ${P.letter(q.answer)}`); });
  $('#qpt').addEventListener('click', () => practiseTopic(q.topics[0] || 'General'));
  $('#qflag').addEventListener('click', () => { setFlag(id, !fl); viewQuestion(id, new URLSearchParams('keep=1')); U.toast(fl ? 'Flag removed.' : 'Flagged.'); $('#qflag')?.focus(); });
  $('#qsuggest').addEventListener('click', () => suggestSheet(q));
  wireZoom();
  if (params.has('suggest')) { history.replaceState(history.state, '', `#/q/${id}`); suggestSheet(q); }
}

// ---------- Papers ----------
const paperFacts = ({ resolved: r }) => { const n = Math.min(r.settings.count, r.pool.length); return `${plural(n, 'question')} · ${r.settings.minutes} min`; };
function viewPapers() {
  frame({ title: 'Papers', large: true, tab: 'papers', sub: 'Timed papers, drawn the way the real test is. Practice only: try as often as you like.',
    body: S.papers.length ? section('', S.papers.map(p => row({ href: `#/paper/${encodeURIComponent(p.paper.id)}`, title: esc(p.paper.title || p.paper.id), lead: tile(icon.papers()), sub: `<span class="qb-clamp">${esc(p.paper.about || '')}</span><span class="qb-facts">${paperFacts(p)}</span>` })).join('')) : emptyCard(icon.papers(), 'No papers yet', '') });
}
function viewPaper(id) {
  const p = S.papers.find(x => x.paper.id === decode(id));
  const back = { label: 'Papers', to: '#/papers' };
  if (!p) { frame({ title: 'Paper', back, tab: 'papers', body: emptyCard(icon.papers(), 'Not here', 'This paper is no longer here.') }); return; }
  const r = p.resolved, n = Math.min(r.settings.count, r.pool.length);
  const past = pastSessions().filter(h => h.paper?.id === p.paper.id);
  frame({ title: p.paper.title || p.paper.id, back, tab: 'papers',
    body: `<p class="app-text qb-about">${esc(p.paper.about || '')}</p>
      <div class="app-card qb-stats"><div class="qb-stat"><b>${n}</b><span>questions</span></div><div class="qb-stat"><b>${r.settings.minutes}</b><span>minutes</span></div><div class="qb-stat"><b>${r.settings.passMark}%</b><span>to pass</span></div></div>
      ${n < r.settings.count ? `<p class="app-small app-muted qb-note">${n} of the paper's ${r.settings.count} questions are ready so far, so this sitting is shorter.</p>` : ''}
      ${n ? '<div class="app-btn-stack qb-top-action"><button type="button" class="app-btn app-btn--primary app-btn--block" id="pstart">Start paper</button></div>' : '<p class="app-muted">No questions in this paper are ready yet.</p>'}
      ${past.length ? section('Your attempts', past.map(h => { const sc = P.score(h); return row({ href: `#/summary/${h.id}?from=progress`, title: `${sc.right} of ${sc.total}`, sub: esc(fmtWhen(h.finishedAt)), trail: `<span class="app-badge ${sc.pass ? 'app-badge--ok' : 'app-badge--bad'}">${sc.pass ? 'Pass' : 'Not yet'}</span>` }); }).join('')) : ''}` });
  let going = false;
  $('#pstart')?.addEventListener('click', () => {
    if (going) return; going = true;
    const s = P.paperSession(p.paper, r);
    const old = getSession(); saveSession(s);
    if (old) U.toast('Started the paper. The last session was closed.', { action: 'Undo', onAction: () => { saveSession(old); render(U.routeOf(), 'none'); } });
    U.go('#/session');
  });
}

// ---------- Progress ----------
function viewProgress() {
  const pr = progress(), t = P.totals(S.pool, pr), wk = P.week(db.get('days', []));
  const hist = pastSessions();
  const ms = P.topicsOf(S.pool).map(x => P.topicMastery(S.pool, pr, x.topic));
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const settings = [
    row({ id: 'reset', title: 'Reset progress on this phone', cls: 'app-row--danger', chev: false }),
    !standalone && /iphone|ipad|ipod/i.test(navigator.userAgent) ? row({ still: true, title: '<span class="app-row-sub">To keep this on your phone: tap Share, then Add to Home Screen.</span>' }) : '',
    !standalone && installEvent ? row({ id: 'install', title: 'Install this app on your phone', lead: tile(icon.download()) }) : '',
  ].join('');
  frame({ title: 'Progress', large: true, tab: 'progress',
    body: `<h2 class="app-section-header">This week</h2>
      <div class="app-card qb-week-card"><div class="qb-week" role="list" aria-label="Days practised this week">${wk.map(d => `<span class="qb-day${d.on ? ' is-on' : ''}${d.today ? ' is-today' : ''}" role="listitem"><i aria-hidden="true">${d.on ? icon.check() : ''}</i>${d.name}<span class="app-sr">${d.on ? ', practised' : ', not practised'}${d.today ? ', today' : ''}</span></span>`).join('')}</div></div>
      <div class="app-card qb-stats"><div class="qb-stat"><b>${t.answered}</b><span>answered</span></div><div class="qb-stat"><b>${t.answered ? t.pct + '%' : '–'}</b><span>correct</span></div><div class="qb-stat"><b>${t.seen}/${S.pool.length}</b><span>seen</span></div></div>
      ${section('Topics', ms.map(m => row({ href: `#/browse/t/${encodeURIComponent(m.topic)}`, title: esc(m.topic), sub: m.label, trail: `<span class="qb-steps3" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i < [0, 2, 3][m.level] ? 'is-on' : ''}"></i>`).join('')}</span>` })).join(''), { footer: 'Mastered: at least 3 answers in the topic and the last 3 right.' })}
      ${section('History', hist.length ? hist.map(h => { const sc = P.score(h); return row({ href: `#/summary/${h.id}?from=progress`, title: `${esc(h.label)} · ${sc.right} of ${sc.total}`, sub: `${h.mode === 'exam' ? 'Exam' : 'Practice'} · ${esc(fmtWhen(h.finishedAt))}` }); }).join('') : row({ still: true, title: '<span class="app-muted">No sessions yet.</span>' }))}
      ${section('Settings', settings)}
      ${U.versionBlock()}` });
  $('#reset').addEventListener('click', resetSheet);
  $('#install')?.addEventListener('click', async () => { installEvent.prompt(); await installEvent.userChoice.catch(() => {}); installEvent = null; viewProgress(); });
  U.wireVersion('qbank-');
}
function resetSheet() {
  const sh = U.openSheet({ title: 'Reset progress?', body: '<p class="app-text">This clears your answers, flags, history and any open session on this phone. The questions are not affected.</p>',
    foot: '<div class="app-btn-row qb-foot-row"><button type="button" class="app-btn app-btn--outline" id="rcancel">Cancel</button><button type="button" class="app-btn app-btn--danger" id="rdo">Reset</button></div>' });
  sh.el.querySelector('#rcancel').addEventListener('click', () => sh.close());
  let done = false;
  sh.el.querySelector('#rdo').addEventListener('click', async () => {
    if (done) return;   // a second tap would save the already-empty state as the Undo copy
    done = true;
    const keep = ['progress', 'flags', 'history', 'days', 'session'], saved = Object.fromEntries(keep.map(k => [k, db.get(k, null)]));
    keep.forEach(k => db.del(k));
    await sh.close(); viewProgress();
    U.toast('Progress reset.', { action: 'Undo', onAction: () => { for (const k of keep) if (saved[k] != null) db.set(k, saved[k]); viewProgress(); } });
  });
}

// ---------- Suggest a change ----------
function suggestSheet(q) {
  const key = 'draft.' + q.id;
  const d = { mode: 'comment', comment: '', stem: q.stem, options: q.options.slice(), answer: q.answer, explain: q.explain || '', ...db.get(key, {}) };
  let name = db.get('name', '');
  // each choice: tap its letter to mark it as the right answer (radio inputs underneath), then the text
  const optRows = () => d.options.map((o, i) => `<div class="qb-opt-row"><label class="qb-opt-pick"><input type="radio" name="sanswer" value="${i}"${i === d.answer ? ' checked' : ''}><span class="qb-opt-letter" aria-hidden="true">${P.letter(i)}</span><span class="app-sr">${P.letter(i)} is the correct answer</span></label><textarea class="app-input qb-opt-input" rows="1" data-opt="${i}" aria-label="Choice ${P.letter(i)}">${esc(o)}</textarea></div>`).join('');
  const sh = U.openSheet({ title: 'Suggest a change', size: 'large', focus: '.app-sheet-title',
    body: `<p class="app-small app-muted qb-sheet-intro">The owner checks every suggestion before the question changes.</p>
      ${U.seg('smode', [{ value: 'comment', label: 'Comment' }, { value: 'edit', label: 'Edit' }], d.mode, 'What kind of change')}
      <div id="edit-fields"${d.mode === 'edit' ? '' : ' hidden'}>
        <label class="app-field"><span class="app-field-label">Question</span><textarea class="app-input" id="s-stem" rows="2">${esc(d.stem)}</textarea></label>
        <fieldset class="app-field qb-opts" data-seg="sanswer"><legend class="app-field-label">Choices. Tap a letter to mark the correct answer</legend>${optRows()}</fieldset>
        <label class="app-field"><span class="app-field-label">Explanation</span><textarea class="app-input" id="s-explain" rows="2">${esc(d.explain)}</textarea></label>
      </div>
      <label class="app-field"><span class="app-field-label">Comment</span><textarea class="app-input" id="s-comment" rows="2" placeholder="What should change, and why (a reference helps)">${esc(d.comment)}</textarea></label>
      <label class="app-field"><span class="app-field-label">Your name</span><input class="app-input" id="s-name" autocomplete="name" value="${esc(name)}" aria-describedby="s-name-hint"><span class="qb-hint" id="s-name-hint">Kept on this phone for next time.</span></label>`,
    foot: `<button type="button" class="app-btn app-btn--primary app-btn--block" id="s-issue">Open GitHub issue</button><div class="app-btn-row qb-foot-row"><button type="button" class="app-btn app-btn--outline" id="s-copy">Copy text</button>${navigator.share ? '<button type="button" class="app-btn app-btn--outline" id="s-share">Share</button>' : ''}</div>` });
  const el = sh.el;
  el.querySelectorAll('textarea').forEach(U.autogrow);
  const save = () => db.set(key, d);
  U.wireSeg(el, 'smode', v => { d.mode = v; el.querySelector('#edit-fields').hidden = v !== 'edit'; if (v === 'edit') el.querySelectorAll('#edit-fields textarea').forEach(t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }); save(); });
  U.wireSeg(el, 'sanswer', v => { d.answer = Number(v); save(); });
  el.querySelector('#s-stem').addEventListener('input', e => { d.stem = e.target.value; save(); });
  el.querySelector('#s-explain').addEventListener('input', e => { d.explain = e.target.value; save(); });
  el.querySelector('#s-comment').addEventListener('input', e => { d.comment = e.target.value; save(); });
  el.querySelector('#s-name').addEventListener('input', e => { name = e.target.value; db.set('name', name.trim()); });
  el.querySelectorAll('[data-opt]').forEach(t => t.addEventListener('input', () => { d.options[Number(t.dataset.opt)] = t.value; save(); }));
  const change = () => {
    const c = { comment: d.comment };
    if (d.mode === 'edit') {
      const nq = { stem: d.stem, options: d.options, answer: d.answer, explain: d.explain };
      if (nq.stem.trim() !== q.stem || nq.answer !== q.answer || nq.explain.trim() !== (q.explain || '') || nq.options.some((o, i) => o.trim() !== q.options[i])) c.question = nq;
    }
    return c;
  };
  const ready = () => { const c = change(); if (!c.comment.trim() && !c.question) { U.toast(d.mode === 'edit' ? 'Change the question or write a comment first.' : 'Write a comment first.'); el.querySelector('#s-comment').focus(); return null; } return c; };
  let sending = false;
  const sent = async msg => { sending = true; db.del(key); await sh.close(); U.toast(msg); };
  el.querySelector('#s-issue').addEventListener('click', () => {
    if (sending) return;
    const c = ready(); if (!c) return;
    window.open(B.suggestionIssueUrl(q, c, name), '_blank', 'noopener');
    sent('Opened in GitHub.');
  });
  el.querySelector('#s-copy').addEventListener('click', async () => {
    if (sending) return;
    const c = ready(); if (!c) return;
    if (await U.copyText(B.suggestionText(q, c, name))) sent('Copied. Send it to the owner.');
    else U.toast("Couldn't copy on this phone. Try Share or the GitHub issue.");
  });
  el.querySelector('#s-share')?.addEventListener('click', async () => {
    if (sending) return;
    const c = ready(); if (!c) return;
    try { await navigator.share({ title: `Question edit: ${q.id}`, text: B.suggestionText(q, c, name) }); sent('Shared. Thank you.'); } catch { /* cancelled */ }
  });
}

// ---------- routing ----------
const ROUTES = [
  [/^\/(practise)?$/, () => viewPractise()],
  [/^\/topics$/, () => viewTopics()],
  [/^\/list\/(missed|flagged)$/, m => viewList(m[1])],
  [/^\/session$/, (m, p, dir) => viewSession(dir)],
  [/^\/summary\/([\w-]+)$/, (m, p, dir) => viewSummary(m[1], p, dir)],
  [/^\/review\/([\w-]+)\/(\d+)$/, (m, p, dir) => viewReview(m[1], m[2], dir)],
  [/^\/browse$/, () => viewBrowse()],
  [/^\/browse\/t\/(.+)$/, m => viewBrowseTopic(m[1])],
  [/^\/q\/([\w-]+)$/, (m, p) => viewQuestion(m[1], p)],
  [/^\/papers$/, () => viewPapers()],
  [/^\/paper\/(.+)$/, m => viewPaper(m[1])],
  [/^\/progress$/, () => viewProgress()],
];
let lastPath = null;
function render({ path, params }, dir) {
  if (!S.loaded) { if (S.error) problemView(); return; }
  if (!path.startsWith('/q/')) S.reveal = null;
  const tabSwitch = TAB_ROOTS[path] && TAB_ROOTS[lastPath] && path !== lastPath;
  lastPath = path;
  let kind = dir === 'none' ? 'none' : tabSwitch ? 'fade' : dir === 'replace' ? 'fade' : dir;
  if (S.nextDir) { kind = S.nextDir; S.nextDir = null; }
  for (const [re, view] of ROUTES) {
    const m = path.match(re);
    if (m) {
      // the session and results screens animate themselves (they also redraw in place)
      if (/^\/(session|summary)/.test(path)) view(m, params, kind);
      else U.transition(kind, () => view(m, params, kind));
      if (dir === 'push') requestAnimationFrame(() => (document.querySelector('main h1') || document.querySelector('#bar h1'))?.focus({ preventScroll: true }));
      return;
    }
  }
  U.go('#/practise', { replace: true });
}
function isSafe() {
  const { path } = U.routeOf();
  if (!TAB_ROOTS[path === '/' ? '/practise' : path]) return false;   // only on a top-level screen
  if (U.sheetOpen() || document.querySelector('dialog[open]')) return false;
  const a = document.activeElement;
  if (a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type !== 'button'))) return false;
  if ($$('main input, main textarea').some(el => el.value !== el.defaultValue)) return false;
  return true;
}

// tabs: a tap switches without adding to the back history; tapping the current tab goes to its top
$$('.app-tab').forEach(t => {
  t.querySelector('[data-icon]').innerHTML = icon[t.dataset.tab]();
  t.addEventListener('click', e => {
    e.preventDefault();
    const href = t.getAttribute('href');
    if (location.hash === href) { window.scrollTo({ top: 0, behavior: U.reduced() ? 'auto' : 'smooth' }); return; }
    U.go(href, { replace: true });
  });
});
const paintOnline = () => { $('#offline').hidden = navigator.onLine; };
window.addEventListener('online', paintOnline); window.addEventListener('offline', paintOnline);
let installEvent = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; });

(async function init() {
  paintOnline();
  await load();
  U.startRouter(render);
  U.setupPwa({ isSafe });
  // phones keep the app open for hours: fetch the questions again when it comes back to the front, and redraw only if
  // they changed and nothing is in progress (an open session keeps its own copy anyway)
  let lastFetch = Date.now();
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden || Date.now() - lastFetch < 60000 || !S.loaded) return;
    lastFetch = Date.now();
    const before = JSON.stringify(S.pool) + JSON.stringify(S.papers.map(p => p.paper));
    const keep = { ...S };
    await load();
    if (S.error) { Object.assign(S, keep); return; }
    if (JSON.stringify(S.pool) + JSON.stringify(S.papers.map(p => p.paper)) !== before && isSafe()) render(U.routeOf(), 'none');
  });
})();
