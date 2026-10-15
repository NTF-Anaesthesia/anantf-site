// Practice: branching case scenarios, flashcards (spaced repetition), check-yourself by module, and the drug-drawer game.
import { md, esc } from './md.js';
import { SCENARIOS } from './data/scenarios.js';
import { DECKS, CARDS } from './data/cards.js';
import { MODULES } from './content/index.js';
import { quizItem, markQuiz, collectQuizzes } from './render.js';
import { setQuiz, getScenario, setScenario, gradeCard, isDue, getCard } from './store.js';

export const scenarioById = Object.assign(Object.create(null), Object.fromEntries(SCENARIOS.map(s => [s.id, s])));

// ---------------------------------------------------------------- hub
export function practiceHub() {
  const dueTotal = CARDS.filter(c => isDue(c.id)).length;
  const quizMods = MODULES.map(m => ({ m, n: m.topics.reduce((s, t) => s + Object.values(collectQuizzes(t.blocks)).reduce((a, x) => a + x.length, 0), 0) })).filter(x => x.n);
  return `<h1>Practice</h1><p class="lead">Learning sticks when you pull it out of your head, not when you read it again.</p>
  <h2>Case scenarios</h2><p class="muted">Short cases with choices. Pick what you would do; see why.</p>
  <ul class="rows">${SCENARIOS.map(s => { const r = getScenario(s.id); return `<li><a href="#/practice/scenario/${esc(s.id)}"><strong>${esc(s.title)}</strong><span class="muted">${esc(s.setting)}${r ? ` · best ${r.best}%` : ''}</span></a></li>`; }).join('')}</ul>
  <h2>Flashcards</h2><p class="muted">${dueTotal} card${dueTotal === 1 ? '' : 's'} due today. Cards you know come back less often.</p>
  <ul class="rows">${DECKS.map(d => { const cs = CARDS.filter(c => c.deck === d.id); const due = cs.filter(c => isDue(c.id)).length; return `<li><a href="#/practice/cards/${esc(d.id)}"><strong>${esc(d.title)}</strong><span class="muted">${cs.length} cards · ${due} due</span></a></li>`; }).join('')}</ul>
  <h2>Check yourself</h2><p class="muted">The questions from each learning module, together.</p>
  <ul class="rows">${quizMods.map(({ m, n }) => `<li><a href="#/practice/quiz/${esc(m.id)}"><strong>${esc(m.title)}</strong><span class="muted">${n} question${n === 1 ? '' : 's'}</span></a></li>`).join('')}</ul>
  <h2>Find it in the trolley</h2><ul class="rows"><li><a href="#/practice/drawers"><strong>Drug trolley drawers</strong><span class="muted">Where would you find it? A quick game.</span></a></li></ul>
  <h2>The Baby MO test</h2><p>The department's 20-question test you pass before you start calls. <a href="../babymo/">Go to the Baby MO test →</a></p>`;
}

// ---------------------------------------------------------------- scenarios
let run = null; // { id, node, firstTry: Set, good, asked, seen: Set }

export function scenarioScreen(id) {
  const s = scenarioById[id];
  if (!s) return null;
  if (!run || run.id !== id) run = { id, node: s.start, good: 0, asked: 0, answered: new Set(), fb: null };
  const n = s.nodes[run.node];
  const vit = n.vitals ? monitor(n.vitals) : '';
  let body;
  if (n.end) {
    const score = run.asked ? Math.round((100 * run.good) / run.asked) : 100;
    if (!run.saved) { setScenario(id, { score, outcome: n.outcome }); run.saved = true; }
    body = `<div class="scen-end ${esc(n.outcome || 'ok')}" id="scen-end" tabindex="-1"><p>${md(n.text)}</p></div>
      <p class="score-line">First-choice score: <b>${score}%</b> (${run.good} of ${run.asked})</p>
      ${s.debrief?.length ? `<h2>Debrief</h2><ul class="list">${s.debrief.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
      <div class="row"><button type="button" class="btn primary" id="scen-again">Try again</button><a class="btn" href="#/practice">More practice</a></div>`;
  } else if (run.fb) {
    const c = run.fb;
    body = `<p>${md(n.text)}</p><div class="scen-fb ${c.good === true ? 'ok' : c.good === false ? 'no' : 'meh'}" id="scen-fb" tabindex="-1"><p class="callout-t">${c.good === true ? 'Good choice' : c.good === false ? 'Not the best choice' : 'Reasonable'}</p><p><strong>You chose:</strong> ${md(c.text)}</p><p>${md(c.feedback || '')}</p></div>
      <div class="row"><button type="button" class="btn primary" id="scen-next">Continue</button></div>`;
  } else {
    body = `<p id="scen-text" tabindex="-1">${md(n.text)}</p><p class="kicker">What do you do?</p><div class="choices">${n.choices.map((c, i) => `<button type="button" class="choice" data-c="${i}">${md(c.text)}</button>`).join('')}</div>`;
  }
  return `<p class="crumbs"><a href="#/practice">Practice</a> /</p><h1>${esc(s.title)}</h1><p class="muted">${esc(s.setting)}</p>${vit}<div class="scen">${body}</div>`;
}

export function wireScenario(root, id, redraw) {
  const s = scenarioById[id];
  root.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
    const c = s.nodes[run.node].choices[+b.dataset.c];
    const key = run.node;
    if (!run.answered.has(key)) { run.answered.add(key); run.asked++; if (c.good === true) run.good++; }
    run.fb = { ...c };
    redraw(true, '#scen-fb');
  }));
  root.querySelector('#scen-next')?.addEventListener('click', () => { run.node = run.fb.next; run.fb = null; redraw(true, '#scen-text, #scen-end'); });
  root.querySelector('#scen-again')?.addEventListener('click', () => { run = null; redraw(true, '#scen-text'); });
}
export function leaveScenario() { run = null; }

function monitor(v) {
  const cell = (k, label, unit, cls) => v[k] == null ? '' : `<div class="mon-c ${cls}"><span class="mon-l">${label}</span><span class="mon-v">${esc(v[k])}</span><span class="mon-u">${unit}</span></div>`;
  return `<div class="monitor" role="group" aria-label="Monitor">${cell('HR', 'HR', '/min', 'hr')}${cell('BP', 'BP', 'mmHg', 'bp')}${cell('SpO2', 'SpO₂', '%', 'sp')}${cell('EtCO2', 'EtCO₂', 'mmHg', 'co')}${cell('RR', 'RR', '/min', 'rr')}${cell('T', 'Temp', '°C', 't')}</div>`;
}

// ---------------------------------------------------------------- flashcards
let deckRun = null; // { deck, queue: [ids], i, shown, knew, total }

export function cardsScreen(deckId) {
  const deck = DECKS.find(d => d.id === deckId);
  if (!deck) return null;
  if (!deckRun || deckRun.deck !== deckId) {
    const all = CARDS.filter(c => c.deck === deckId);
    const due = all.filter(c => isDue(c.id));
    deckRun = { deck: deckId, queue: (due.length ? due : []).map(c => c.id), i: 0, shown: false, knew: 0, extra: !due.length, all: all.map(c => c.id) };
  }
  const head = `<p class="crumbs"><a href="#/practice">Practice</a> /</p><h1>${esc(deck.title)}</h1>`;
  if (!deckRun.queue.length) {
    return `${head}<p>Nothing due in this deck today. Well done.</p><div class="row"><button type="button" class="btn primary" id="cards-all">Practise all ${deckRun.all.length} anyway</button><a class="btn" href="#/practice">Back</a></div>`;
  }
  if (deckRun.i >= deckRun.queue.length) {
    return `${head}<p class="score-line" id="cards-done" tabindex="-1">Done: you knew <b>${deckRun.knew} of ${deckRun.queue.length}</b>.</p><p class="muted">Cards you missed come back tomorrow; the ones you knew, later.</p><div class="row"><button type="button" class="btn primary" id="cards-again">Go again</button><a class="btn" href="#/practice">Back</a></div>`;
  }
  const c = CARDS.find(x => x.id === deckRun.queue[deckRun.i]);
  const box = getCard(c.id)?.box;
  return `${head}<p class="muted small">Card ${deckRun.i + 1} of ${deckRun.queue.length}${box ? ` · box ${box} of 5` : ''}</p>
  <div class="flash"><p class="flash-q" id="flash-q" tabindex="-1">${md(c.front)}</p>${deckRun.shown ? `<hr><p class="flash-a" tabindex="-1" id="flash-a">${md(c.back)}</p>` : ''}</div>
  ${deckRun.shown ? '<div class="row one"><button type="button" class="btn" id="card-no">Didn’t know</button><button type="button" class="btn primary" id="card-yes">Knew it</button></div>' : '<div class="row"><button type="button" class="btn primary big" id="card-show">Show answer</button></div>'}`;
}

export function wireCards(root, redraw) {
  const r = deckRun; if (!r) return;
  root.querySelector('#card-show')?.addEventListener('click', () => { r.shown = true; redraw(true, '#flash-a'); });
  const grade = knew => { gradeCard(r.queue[r.i], knew); if (knew) r.knew++; r.i++; r.shown = false; redraw(true, '#flash-q, #cards-done'); };
  root.querySelector('#card-yes')?.addEventListener('click', () => grade(true));
  root.querySelector('#card-no')?.addEventListener('click', () => grade(false));
  root.querySelector('#cards-all')?.addEventListener('click', () => { r.queue = r.all.slice(); r.i = 0; r.knew = 0; redraw(true, '#flash-q'); });
  root.querySelector('#cards-again')?.addEventListener('click', () => { deckRun = null; redraw(true, '#flash-q, h1'); });
}
export function leaveCards() { deckRun = null; }

// ---------------------------------------------------------------- check yourself by module
export function quizScreen(moduleId) {
  const m = MODULES.find(x => x.id === moduleId);
  if (!m) return null;
  const parts = m.topics.map(t => ({ t, qs: collectQuizzes(t.blocks) })).filter(x => Object.keys(x.qs).length);
  return `<p class="crumbs"><a href="#/practice">Practice</a> /</p><h1>${esc(m.title)}: check yourself</h1>
  ${parts.map(({ t, qs }) => `<h2>${esc(t.title)} <a class="small" href="#/learn/${esc(m.id)}/${esc(t.id)}">read →</a></h2>${Object.entries(qs).map(([qid, items]) => items.map((q, i) => quizItem(qid, q, i)).join('')).join('')}`).join('')}`;
}
export function wireQuizScreen(root, moduleId) {
  const m = MODULES.find(x => x.id === moduleId); if (!m) return;
  const all = {}; m.topics.forEach(t => collectQuizzes(t.blocks, all));
  root.querySelectorAll('form.qitem').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const q = all[f.dataset.quizid]?.[+f.dataset.q]; if (!q) return;
    const ok = markQuiz(f, q); if (ok != null) setQuiz(`${f.dataset.quizid}:${f.dataset.q}`, ok);
  }));
}

// ---------------------------------------------------------------- drawer game
export const DRAWERS = [
  { n: 1, name: 'Top drawer', items: ['Propofol', 'Antiemetics', 'Reversal agents'] },
  { n: 2, name: 'Second drawer', items: ['Antibiotics', 'Lignocaine 1%', 'Drugs that raise or lower blood pressure (high alert)'] },
  { n: 3, name: 'Third drawer', items: ['Potassium chloride 10 mmol', 'Salbutamol', 'Paracetamol'] },
  { n: 4, name: 'Fourth drawer', items: ['IV set-up', 'Infusion tubing', 'Three-way taps', '50 mL syringes for TIVA'] },
  { n: 5, name: 'Bottom drawer', items: ['Bair Hugger warming blanket', 'Tourniquet', 'Drug trays', 'Sevoflurane'] },
];
let game = null;
export function drawersScreen() {
  if (!game) {
    const pool = DRAWERS.flatMap(d => d.items.map(it => ({ it, n: d.n })));
    // a fixed shuffle that changes each round
    const round = (drawersScreen.round = (drawersScreen.round || 0) + 1);
    game = { q: pool.map((x, i) => ({ ...x, k: (i * 7 + round * 3) % pool.length })).sort((a, b) => a.k - b.k).slice(0, 8), i: 0, right: 0, last: null };
  }
  const head = '<p class="crumbs"><a href="#/practice">Practice</a> /</p><h1>Find it in the trolley</h1>';
  if (game.i >= game.q.length) return `${head}<p class="score-line" id="dr-q" tabindex="-1">You found <b>${game.right} of ${game.q.length}</b>.</p>${drawerList()}<div class="row"><button type="button" class="btn primary" id="dr-again">Play again</button></div>`;
  const q = game.q[game.i];
  return `${head}<div id="dr-q" tabindex="-1"><p class="muted small">${game.i + 1} of ${game.q.length}</p>${game.last ? `<p class="${game.last.ok ? 'ok-text' : 'warn-text'}">${game.last.ok ? 'Right.' : `Not quite: ${esc(game.last.it)} is in the ${esc(DRAWERS[game.last.n - 1].name.toLowerCase())}.`}</p>` : ''}
  <p class="flash-q">Where is: <strong>${esc(q.it)}</strong>?</p></div><div class="choices">${DRAWERS.map(d => `<button type="button" class="choice" data-n="${d.n}">${esc(d.name)}</button>`).join('')}</div>`;
}
const drawerList = () => `<ol class="list">${DRAWERS.map(d => `<li><strong>${esc(d.name)}:</strong> ${esc(d.items.join(', '))}</li>`).join('')}</ol>`;
export function wireDrawers(root, redraw) {
  root.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
    const q = game.q[game.i], ok = +b.dataset.n === q.n;
    if (ok) game.right++;
    game.last = { ok, it: q.it, n: q.n }; game.i++; redraw(true, '#dr-q');
  }));
  root.querySelector('#dr-again')?.addEventListener('click', () => { game = null; redraw(true, '#dr-q'); });
}
export function leaveDrawers() { game = null; }
