// Practice: branching case scenarios, flashcards (spaced repetition), check-yourself by module, and the drug-drawer game.
import { md, esc } from './md.js';
import { SCENARIOS } from './data/scenarios.js';
import { DECKS, CARDS } from './data/cards.js';
import { MODULES } from './content/index.js';
import { quizItem, markQuiz, collectQuizzes } from './render.js';
import { title, row, section, choices } from './ui.js';
import { setQuiz, getScenario, setScenario, gradeCard, isDue, getCard } from './store.js';

export const scenarioById = Object.assign(Object.create(null), Object.fromEntries(SCENARIOS.map(s => [s.id, s])));

// ---------------------------------------------------------------- hub
export function practiceHub() {
  const dueTotal = CARDS.filter(c => isDue(c.id)).length;
  const quizMods = MODULES.map(m => ({ m, n: m.topics.reduce((s, t) => s + Object.values(collectQuizzes(t.blocks)).reduce((a, x) => a + x.length, 0), 0) })).filter(x => x.n);
  return `${title('Practice', 'Learning sticks when you pull it out of your head, not when you read it again.')}
  ${section('Case scenarios', SCENARIOS.map(s => { const r = getScenario(s.id); return row({ href: `#/practice/scenario/${s.id}`, title: s.title, sub: `${s.setting}${r ? ` · best ${r.best}%` : ''}` }); }).join(''), 'Short cases with choices. Pick what you would do; see why.')}
  ${section('Flashcards', DECKS.map(d => { const cs = CARDS.filter(c => c.deck === d.id); const due = cs.filter(c => isDue(c.id)).length; return row({ href: `#/practice/cards/${d.id}`, title: d.title, sub: `${cs.length} cards · ${due} due` }); }).join(''), `${dueTotal} card${dueTotal === 1 ? '' : 's'} due today. Cards you know come back less often.`)}
  ${section('Check yourself', quizMods.map(({ m, n }) => row({ href: `#/practice/quiz/${m.id}`, title: m.title, sub: `${n} question${n === 1 ? '' : 's'}` })).join(''), 'The questions from each learning module, together.')}
  ${section('Find it in the trolley', row({ href: '#/practice/drawers', title: 'Drug trolley drawers', sub: 'Where would you find it? A quick game.' }))}
  ${section('The Baby MO test', row({ href: '../babymo/', title: 'Go to the Baby MO test', sub: 'The 20-question test you pass before you start calls.' }))}`;
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
      ${s.debrief?.length ? `<h2 class="sub">Debrief</h2><ul class="list">${s.debrief.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
      <div class="app-btn-row"><button type="button" class="app-btn app-btn--primary" id="scen-again">Try again</button><a class="app-btn app-btn--outline" href="#/practice">More practice</a></div>`;
  } else if (run.fb) {
    const c = run.fb;
    body = `<p>${md(n.text)}</p><div class="scen-fb ${c.good === true ? 'ok' : c.good === false ? 'no' : 'meh'}" id="scen-fb" tabindex="-1"><p class="callout-t">${c.good === true ? 'Good choice' : c.good === false ? 'Not the best choice' : 'Reasonable'}</p><p><strong>You chose:</strong> ${md(c.text)}</p><p>${md(c.feedback || '')}</p></div>
      <div class="app-btn-stack"><button type="button" class="app-btn app-btn--primary app-btn--block" id="scen-next">Continue</button></div>`;
  } else {
    body = `<p id="scen-text" tabindex="-1">${md(n.text)}</p><p class="kicker">What do you do?</p>${choices(n.choices.map(c => md(c.text)))}`;
  }
  return `${title(s.title, esc(s.setting))}${vit}<div class="scen">${body}</div>`;
}

export function wireScenario(root, id, redraw) {
  const s = scenarioById[id];
  root.querySelectorAll('.app-choice').forEach(b => b.addEventListener('click', () => {
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
  const head = title(deck.title);
  if (!deckRun.queue.length) {
    return `${head}<p>Nothing due in this deck today. Well done.</p><div class="app-btn-stack"><button type="button" class="app-btn app-btn--primary app-btn--block" id="cards-all">Practise all ${deckRun.all.length} anyway</button><a class="app-btn app-btn--outline app-btn--block" href="#/practice">Back</a></div>`;
  }
  if (deckRun.i >= deckRun.queue.length) {
    return `${head}<p class="score-line" id="cards-done" tabindex="-1">Done: you knew <b>${deckRun.knew} of ${deckRun.queue.length}</b>.</p><p class="app-muted">Cards you missed come back tomorrow; the ones you knew, later.</p><div class="app-btn-stack"><button type="button" class="app-btn app-btn--primary app-btn--block" id="cards-again">Go again</button><a class="app-btn app-btn--outline app-btn--block" href="#/practice">Back</a></div>`;
  }
  const c = CARDS.find(x => x.id === deckRun.queue[deckRun.i]);
  const box = getCard(c.id)?.box;
  return `${head}<p class="app-muted app-small">Card ${deckRun.i + 1} of ${deckRun.queue.length}${box ? ` · box ${box} of 5` : ''}</p>
  <div class="flash"><p class="flash-q" id="flash-q" tabindex="-1">${md(c.front)}</p>${deckRun.shown ? `<hr><p class="flash-a" tabindex="-1" id="flash-a">${md(c.back)}</p>` : ''}</div>
  ${deckRun.shown ? '<div class="app-btn-row"><button type="button" class="app-btn app-btn--outline" id="card-no">Didn’t know</button><button type="button" class="app-btn app-btn--primary" id="card-yes">Knew it</button></div>' : '<div class="app-btn-stack"><button type="button" class="app-btn app-btn--primary app-btn--block" id="card-show">Show answer</button></div>'}`;
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
  return `${title(`${m.title}: check yourself`)}
  ${parts.map(({ t, qs }) => `<h2 class="sub">${esc(t.title)} <a class="app-small" href="#/learn/${esc(m.id)}/${esc(t.id)}">read →</a></h2>${Object.entries(qs).map(([qid, items]) => items.map((q, i) => quizItem(qid, q, i)).join('')).join('')}`).join('')}`;
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
  const head = title('Find it in the trolley');
  if (game.i >= game.q.length) return `${head}<p class="score-line" id="dr-q" tabindex="-1">You found <b>${game.right} of ${game.q.length}</b>.</p>${drawerList()}<div class="app-btn-stack"><button type="button" class="app-btn app-btn--primary app-btn--block" id="dr-again">Play again</button></div>`;
  const q = game.q[game.i];
  return `${head}<div id="dr-q" tabindex="-1"><p class="app-muted app-small">${game.i + 1} of ${game.q.length}</p>${game.last ? `<p class="${game.last.ok ? 'ok-text' : 'warn-text'}">${game.last.ok ? 'Right.' : `Not quite: ${esc(game.last.it)} is in the ${esc(DRAWERS[game.last.n - 1].name.toLowerCase())}.`}</p>` : ''}
  <p class="flash-q">Where is: <strong>${esc(q.it)}</strong>?</p></div>${choices(DRAWERS.map(d => esc(d.name)), 'data-n')}`;
}
const drawerList = () => `<ol class="list">${DRAWERS.map(d => `<li><strong>${esc(d.name)}:</strong> ${esc(d.items.join(', '))}</li>`).join('')}</ol>`;
export function wireDrawers(root, redraw) {
  root.querySelectorAll('.app-choice').forEach((b, k) => b.addEventListener('click', () => {
    const q = game.q[game.i], ok = k + 1 === q.n;
    if (ok) game.right++;
    game.last = { ok, it: q.it, n: q.n }; game.i++; redraw(true, '#dr-q');
  }));
  root.querySelector('#dr-again')?.addEventListener('click', () => { game = null; redraw(true, '#dr-q'); });
}
export function leaveDrawers() { game = null; }
