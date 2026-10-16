// Boot (DESIGN.md, "Files" and "URL and deep links"): reads the URL, builds the sim and the theatre screen, runs the
// frame loop. The UI reads sim.state and writes only through sim.act().

import { createSim } from './model/sim.js';
import { applyPreset, PRESETS } from './model/presets.js';
import { NIBP_CYCLES, PRIORITY_RANK } from './model/monitor.js';
import { Loop, SPEEDS } from './ui/loop.js';
import { Lane } from './ui/lanes.js';
import { ecg, pleth, co2, modelSource, FastSource } from './ui/synth.js';
import { Numerics, clockText } from './ui/numerics.js';
import { DrugsPanel, CIRC_ROWS } from './ui/drugs.js';
import { behindHtml } from './ui/behind.js';
import { CASES, SIGN_IN, patientSummary, clinicalSummary } from './ui/preop.js';
import { OPERATION, phaseAt } from './ui/timeline.js';
import { examine } from './ui/examine.js';
import { HELP, HELP_EVENT } from './ui/help.js';
import { logLines } from './ui/log.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const TEST = params.has('test');
const seedParam = parseInt(params.get('seed'), 10);
const SEED = Number.isFinite(seedParam) && seedParam >= 0 ? seedParam : 1; // fixed by default so first frames repeat
const DELAY = 0.2; // s: at 1x the lanes draw this far behind model time, so each event is known before the sweep

// per-device settings (DESIGN.md, "Per-device settings"); storage may be blocked
const store = {
  get(k, d) { try { const v = localStorage.getItem('otsim.' + k); return v == null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('otsim.' + k, String(v)); } catch { /* private mode */ } },
};

const sim = createSim({ seed: SEED });
// deep links (DESIGN.md, "URL and deep links"): ?preset=<name> or ?case=electiveGA start from a built-in state, and
// ?at=<seconds> fast-forwards further. The guided elective GA starts just induced and intubated (M3.2 slice 1; the
// pre-op screen and the surgical timeline follow).
const presetName = params.get('preset') || (params.get('case') === 'electiveGA' ? 'induced' : null);
if (presetName && PRESETS[presetName]) {
  applyPreset(sim, presetName);
  const at = parseFloat(params.get('at'));
  if (Number.isFinite(at) && at > sim.state.t) sim.runTo(at);
}
const lanes = [
  new Lane($('c-ecg'), { window: 6, sample: ecg, lo: -0.5, hi: 1.3, color: '#4be36a' }),
  new Lane($('c-pleth'), { window: 6, sample: pleth, lo: -0.05, hi: 1.2, color: '#3fd6ff' }),
  new Lane($('c-co2'), { window: 15, sample: co2, lo: 0, hi: 50, color: '#ffd23f' }),
];
const nums = new Numerics();

// the display clock: at 1x the model's time (smoothed within a step) minus DELAY; at 5x and 20x real pace from the
// moment of the switch, with a FastSource making the beats and breaths
let fast = null, tDisp = -DELAY;
const modelT = frac => sim.state.t + frac * sim.state.dt - DELAY;
const source = () => (fast || modelSource(sim.state));
function refill() { const src = source(); for (const l of lanes) l.refill(src, tDisp); }

// panels: written at most twice a second of wall time, like the numerics
function airwayText(state) {
  const a = state.aw, parts = [];
  const dev = { none: 'Natural airway', mask: 'Face mask', sad: 'Supraglottic airway', ett: 'Tracheal tube', fona: 'Front-of-neck' }[a.device];
  parts.push(a.device === 'ett' ? `Tracheal tube (${a.placement}${a.cuff ? ', cuff up' : ''})` : dev);
  if (a.manoeuvre !== 'none') parts.push({ jawThrust: 'jaw thrust', opa: 'oropharyngeal airway', npa: 'nasopharyngeal airway' }[a.manoeuvre]);
  if (a.view) parts.push(`view grade ${a.view}`);
  if (a.obstruction > 0.1 && a.device !== 'ett' && a.device !== 'sad') parts.push(`obstruction ${Math.round(a.obstruction * 100)}%`);
  parts.push(`reaching the lungs ${Math.round(a.toLungs * 100)}%`);
  return parts.join(' · ');
}

function resusText(state) {
  const r = state.resus, parts = [];
  if (r.cpr) parts.push(`Compressions: ${r.quality} (output about ${Math.round(r.cprFrac * 100)}% of normal)`);
  if (r.pace.on) parts.push(`Pacer ${r.pace.mA} mA: ${r.pace.capturing ? 'capturing' : 'not capturing'}`);
  if (r.defib.shocks) parts.push(`${r.defib.shocks} shock${r.defib.shocks > 1 ? 's' : ''} (last: ${r.defib.lastOutcome})`);
  return parts.join(' · ');
}

// the alarm bar (M3.3): the highest-priority active alarm, its IEC colour/flash (via the class), aria-live assertive
// for a high-priority alarm, and the silence countdown. Shown whenever any alarm is active, on any tab.
function updateAlarmBar() {
  const m = sim.state.mon, bar = $('alarmbar');
  if (!m.alarms.length) { if (!bar.hidden) { bar.hidden = true; bar.className = 'alarmbar'; } return; }
  const top = m.alarms.reduce((a, b) => (PRIORITY_RANK[b.priority] > PRIORITY_RANK[a.priority] ? b : a));
  const silenced = sim.state.t < m.silencedUntil, extra = m.alarms.length - 1;
  const cls = `alarmbar ${top.priority}${silenced ? ' silenced' : ''}`;
  if (bar.className !== cls) bar.className = cls;
  const live = top.priority === 'high' && !silenced ? 'assertive' : 'polite';
  if (bar.getAttribute('aria-live') !== live) bar.setAttribute('aria-live', live);
  const msg = `${top.msg}${extra ? ` · +${extra} more` : ''}`;
  if ($('alarm-msg').textContent !== msg) $('alarm-msg').textContent = msg;
  const sbt = silenced ? `Silenced ${Math.ceil((m.silencedUntil - sim.state.t) / 60)} min` : 'Silence 2 min';
  if ($('alarm-silence').textContent !== sbt) $('alarm-silence').textContent = sbt;
  bar.hidden = false;
}

let panelsAt = -1e9;
function panels(force = false) {
  const now = performance.now();
  if (!force && now - panelsAt < 500) return;
  panelsAt = now;
  updateAlarmBar();
  drugs.update(sim.state);
  if (!$('panel-circ').hidden) circDrugs.update(sim.state);
  if (!$('panel-breath').hidden) {
    const vol = sim.state.vol, fg = vol.fgf, parts = [];
    for (const id in vol.dial) if (vol.dial[id] > 0) parts.push(`${id} ${vol.dial[id]}% (Et ${(vol.t[id].fa * 100).toFixed(1)}%)`);
    const at = `Fresh gas O₂ ${fg.o2} / air ${fg.air} / N₂O ${fg.n2o} L/min.${parts.length ? ' ' + parts.join(', ') + '.' : ''} MAC ${vol.mac.toFixed(1)}.`;
    if ($('agent-state').textContent !== at) $('agent-state').textContent = at;
    const r = sim.state.resp; const t = r.mode === 'spont' ? (r.apnoea ? 'Apnoeic (no spontaneous breaths).' : `Spontaneous: Vt ${Math.round(r.vt)} mL, rate ${r.rr.toFixed(0)}, MV ${r.mv.toFixed(1)} L/min.`) : `${r.mode === 'vc' ? 'Volume' : 'Pressure'} control: Vt ${Math.round(r.vt)} mL, Ppeak ${Math.round(r.ppeak)}, Pplat ${Math.round(r.pplat)}, MV ${r.mv.toFixed(1)} L/min${r.autoPeep > 0.05 ? `, auto-PEEP ${r.autoPeep.toFixed(1)}` : ''}.`; if ($('vent-state').textContent !== t) $('vent-state').textContent = t; }
  if (!$('panel-circ').hidden) { const t = fluidText(sim.state); if ($('fluid-state').textContent !== t) $('fluid-state').textContent = t; }
  if (!$('panel-pt').hidden) {
    const h = eventsHtml(sim.state); if ($('events').innerHTML !== h) $('events').innerHTML = h;
    const rt = resusText(sim.state); if ($('resus-state').textContent !== rt) $('resus-state').textContent = rt;
    const st = surgText(); if ($('surg-state').textContent !== st) $('surg-state').textContent = st;
  }
  if (!$('panel-aw').hidden) { const t = airwayText(sim.state); if ($('aw-state').textContent !== t) $('aw-state').textContent = t; }
  if (!$('panel-exam').hidden) { const h = dl(examine(sim.state)); if ($('exam-list').innerHTML !== h) $('exam-list').innerHTML = h; }
  if (!$('panel-log').hidden) {
    const lines = logLines(sim.state);
    const h = lines.length ? lines.slice().reverse().map(e => `<li><span class="when">${clockText(e.t)}</span> <span>${e.text}</span></li>`).join('') : '<li class="none">Nothing yet</li>';
    if ($('log-feed').innerHTML !== h) $('log-feed').innerHTML = h;
  }
  if ($('behind-box').open) { const h = behindHtml(sim.state); if ($('behind').innerHTML !== h) $('behind').innerHTML = h; }
}

function frame({ frac, wallDt }) {
  if (fast) { tDisp += wallDt; fast.advance(sim.state, tDisp); } else tDisp = Math.max(tDisp, modelT(frac));
  surgTick();                                            // auto-advance the operation timeline as model time passes
  const src = source();
  for (const l of lanes) l.draw(src, tDisp);
  nums.update(sim.state, performance.now());
  panels();
}
const loop = new Loop(sim, frame);

// an action from a control: when paused, run one step so it shows at once
function acted() {
  if (loop.paused) sim.step(1);
  nums.update(sim.state, performance.now(), true);
  panels(true);
}
const drugs = new DrugsPanel($('panel-drugs'), sim, acted);
const circDrugs = new DrugsPanel($('circ-drugs'), sim, acted, { rows: CIRC_ROWS, extras: false });

// Breathing tab: oxygen and the ventilator
function setFio2(v) {
  v = Math.min(1, Math.max(0.21, v || 0.21));
  $('fio2').value = v;
  sim.act({ type: 'o2', fio2: v });                       // spontaneous breathing
  if (sim.state.resp.mode !== 'spont') sim.act({ type: 'vent', fio2: v }); // the ventilator's own FiO2
  acted();
}
for (const b of document.querySelectorAll('[data-fio2]')) b.addEventListener('click', () => setFio2(+b.dataset.fio2));
$('fio2').addEventListener('change', () => setFio2(+$('fio2').value));
$('vmode').addEventListener('change', () => {
  const m = $('vmode').value;
  $('vc-set').hidden = m !== 'vc'; $('pc-set').hidden = m !== 'pc';
});
$('fgf-apply').addEventListener('click', () => { sim.act({ type: 'fgf', o2: +$('fgf-o2').value, air: +$('fgf-air').value, n2o: +$('fgf-n2o').value }); acted(); });
$('vap-apply').addEventListener('click', () => { sim.act({ type: 'vaporiser', agent: $('vap-agent').value, dial: +$('vap-dial').value }); acted(); });
$('v-apply').addEventListener('click', () => {
  const m = $('vmode').value;
  const a = { type: 'vent', mode: m, peep: +$('v-peep').value, ie: 1 / (+$('v-ie').value || 2), fio2: Math.min(1, Math.max(0.21, +$('fio2').value || 0.21)) };
  if (m === 'vc') { a.vt = +$('v-vt').value; a.rr = +$('v-rr').value; }
  else if (m === 'pc') { a.pinsp = +$('v-pinsp').value; a.rr = +$('v-rr2').value; }
  sim.act(a); acted();
});

// Patient tab: talk, stimuli, the operation timeline, events (Examine and Help are their own tabs)
$('talk').addEventListener('click', () => {
  const pd = sim.state.pd;
  $('talk-reply').textContent = !pd.asleep ? 'Opens their eyes and answers.' : pd.pAsleep < 0.95 ? 'No answer. Stirs a little to a louder voice.' : 'No response.';
});
for (const b of document.querySelectorAll('[data-stim]')) b.addEventListener('click', () => { sim.act({ type: 'stimulus', kind: b.dataset.stim }); acted(); });

// the operation timeline (DESIGN.md M3.2): a scripted surgical-stimulus sequence driven through sim.act(), so it stays
// deterministic. surgTick fires each step whose offset model time has reached (auto-advance while running); "Skip to
// next step" fast-forwards model time to the next step. Not the M4 scenario engine — only the surgical stimulus.
const surg = { startT: null, fired: 0 };
function surgTick() {
  if (surg.startT == null) return;
  while (surg.fired < OPERATION.length && sim.state.t >= surg.startT + OPERATION[surg.fired].at - 1e-6)
    sim.act(OPERATION[surg.fired++].stim);
}
function surgText() {
  if (surg.startT == null) return 'Not started.';
  const el = sim.state.t - surg.startT, p = phaseAt(el);
  const cur = p.current ? p.current.label : 'Starting…';
  if (!p.next) return `${cur}. Operation complete.`;
  const dt = Math.max(0, Math.round(surg.startT + p.next.at - sim.state.t));
  return `${cur}. Next: ${p.next.label} in ${Math.floor(dt / 60)}:${String(dt % 60).padStart(2, '0')}.`;
}
$('surg-start').addEventListener('click', () => {
  surg.startT = sim.state.t; surg.fired = 0;
  surgTick();                                           // the incision (offset 0) fires now
  $('surg-start').disabled = true;
  $('surg-skip').disabled = surg.fired >= OPERATION.length;
  acted();
});
$('surg-skip').addEventListener('click', () => {
  if (surg.startT == null || surg.fired >= OPERATION.length) return;
  const target = surg.startT + OPERATION[surg.fired].at;
  if (target > sim.state.t) sim.runTo(target);          // fast-forward model time to the next step
  surgTick();
  if (loop.paused) sim.step(1);                          // flush the queued action so it shows at once
  if (!fast) tDisp = modelT(loop.acc);                   // the lanes restart from the new time
  refill(); nums.update(sim.state, performance.now(), true); panels(true);
  $('surg-skip').disabled = surg.fired >= OPERATION.length;
});
for (const b of document.querySelectorAll('[data-fluid]')) b.addEventListener('click', () => { sim.act({ type: 'fluid', product: b.dataset.fluid, ml: +b.dataset.ml }); acted(); });
$('bleed').addEventListener('change', () => { sim.act({ type: 'bleed', mlPerMin: +$('bleed').value }); acted(); });
$('warmer').addEventListener('click', () => { const on = $('warmer').getAttribute('aria-pressed') !== 'true'; $('warmer').setAttribute('aria-pressed', String(on)); sim.act({ type: 'warming', on }); acted(); });
$('rhythm').addEventListener('change', () => { sim.act({ type: 'rhythm', to: $('rhythm').value }); acted(); });
// resuscitation: compressions, defibrillation, pacing
const cprBtn = $('cpr');
cprBtn.addEventListener('click', () => { const on = cprBtn.getAttribute('aria-pressed') !== 'true'; cprBtn.setAttribute('aria-pressed', String(on)); cprBtn.textContent = on ? 'Stop compressions' : 'Start compressions'; sim.act({ type: 'cpr', on, quality: $('cpr-q').value }); acted(); });
$('cpr-q').addEventListener('change', () => { if (cprBtn.getAttribute('aria-pressed') === 'true') { sim.act({ type: 'cpr', on: true, quality: $('cpr-q').value }); acted(); } });
$('defib').addEventListener('click', () => { sim.act({ type: 'defib', joules: +$('defib-j').value }); acted(); });
$('amio').addEventListener('click', () => { sim.act({ type: 'amiodarone' }); acted(); });
const paceBtn = $('pace');
paceBtn.addEventListener('click', () => { const on = paceBtn.getAttribute('aria-pressed') !== 'true'; paceBtn.setAttribute('aria-pressed', String(on)); sim.act({ type: 'pace', on, mA: +$('pace-ma').value }); acted(); });
$('pace-ma').addEventListener('change', () => { if (paceBtn.getAttribute('aria-pressed') === 'true') { sim.act({ type: 'pace', on: true, mA: +$('pace-ma').value }); acted(); } });
// airway: manoeuvre, device, laryngoscopy, intubation
$('aw-man').addEventListener('change', () => { sim.act({ type: 'manoeuvre', to: $('aw-man').value }); acted(); });
$('aw-device').addEventListener('change', () => { sim.act({ type: 'device', to: $('aw-device').value }); acted(); });
$('aw-laryn').addEventListener('click', () => { sim.act({ type: 'laryngoscopy' }); acted(); });
$('aw-video').addEventListener('click', () => { sim.act({ type: 'laryngoscopy', video: true }); acted(); });
$('aw-intubate').addEventListener('click', () => { sim.act({ type: 'intubate', placement: $('aw-place').value }); acted(); });
$('aw-extubate').addEventListener('click', () => { sim.act({ type: 'extubate' }); acted(); });
const PRODUCT_NAME = { crystalloid: 'crystalloid', colloid: 'colloid', rbc: 'red cells' };
function fluidText(state) {
  const fl = state.cv.fl, run = fl.running.map(r => `${PRODUCT_NAME[r.product]} ${Math.round(r.left)} mL to go`);
  const given = Object.entries(fl.given).filter(([, v]) => v > 0.5).map(([k, v]) => `${PRODUCT_NAME[k]} ${Math.round(v)} mL`);
  return [run.length ? `Running: ${run.join(', ')}.` : '', given.length ? `Given: ${given.join(', ')}.` : ''].filter(Boolean).join(' ');
}
const EVENT_TEXT = {
  asleep: () => 'No longer responds to voice', awake: () => 'Responds to voice again',
  movement: e => `Moved at ${e.stimulus === 'surgery' ? 'the start of surgery' : e.stimulus}`,
  stimulus: e => (e.stimulus === 'surgery' ? 'Surgery under way' : `${e.stimulus[0].toUpperCase()}${e.stimulus.slice(1)}`),
  nibp: e => `NIBP ${e.sys}/${e.dia}`, ptc: e => (e.ptc == null ? 'PTC: TOF present' : `PTC ${e.ptc}`),
};
// help actions (logged as { kind: 'action', action: { type: 'help', do } }) also appear in the feed
const eventText = e => e.kind === 'action' ? HELP_EVENT[e.action.do] : EVENT_TEXT[e.kind](e);
const feedable = e => (EVENT_TEXT[e.kind] && e.kind !== 'nibp') || (e.kind === 'action' && e.action.type === 'help' && HELP_EVENT[e.action.do]);
function eventsHtml(state) {
  const ev = state.log.filter(feedable).slice(-8).reverse();
  return ev.length ? ev.map(e => `<li><span class="when">${clockText(e.t)}</span> ${eventText(e)}</li>`).join('') : '<li class="none">Nothing yet</li>';
}

// Help tab: get help and tell the team (DESIGN.md "Screens"). Each is a logged action (shows in events, there for the
// debrief); no physiological effect in M3.2.
$('help-acts').innerHTML = HELP.map(h => `<button type="button" data-help="${h.do}">${h.label}</button>`).join('');
for (const b of $('help-acts').querySelectorAll('[data-help]')) b.addEventListener('click', () => {
  sim.act({ type: 'help', do: b.dataset.help });
  const h = HELP.find(x => x.do === b.dataset.help);
  $('help-ack').textContent = h ? h.ack : '';
  acted();
});

// tabs (ARIA tabs pattern: arrow keys move between tabs)
const tabs = [...document.querySelectorAll('[role=tab]')];
function selectTab(tab, focus = false) {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    $(t.getAttribute('aria-controls')).hidden = !on;
  }
  if (focus) tab.focus();
}
for (const t of tabs) {
  t.addEventListener('click', () => { selectTab(t); panels(true); });
  t.addEventListener('keydown', e => {
    const i = tabs.indexOf(t), n = tabs.length;
    const j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (j >= 0) { e.preventDefault(); selectTab(tabs[j], true); }
  });
}

// "How to use": open on a first visit, then remembered on the device once closed
const howtoBox = $('howto-box');
howtoBox.open = store.get('howto', '1') === '1';
howtoBox.addEventListener('toggle', () => store.set('howto', howtoBox.open ? '1' : '0'));

// "Behind the monitor": closed by default, remembered on the device
const behindBox = $('behind-box');
behindBox.open = store.get('behind', '0') === '1';
behindBox.addEventListener('toggle', () => { store.set('behind', behindBox.open ? '1' : '0'); panels(true); });

// speed and pause
function setSpeed(s, save = true) {
  if (!SPEEDS.includes(s)) s = 1;
  const wasFast = loop.speed > 1;
  loop.speed = s;
  for (const b of document.querySelectorAll('[data-speed]')) b.setAttribute('aria-pressed', String(+b.dataset.speed === s));
  const note = $('fastnote');
  note.hidden = s === 1;
  note.textContent = `${s}x: waveforms at real pace`;
  if (s > 1) fast = new FastSource(sim.state, tDisp, SEED + s);
  else if (wasFast) { fast = null; tDisp = modelT(loop.acc); }
  if (save) store.set('speed', s);
  refill();
}
function setPaused(p) {
  loop.paused = p;
  const b = $('pause');
  b.setAttribute('aria-label', p ? 'Resume' : 'Pause');
  b.firstElementChild.textContent = p ? '▶' : '❚❚';
  refill();
}
for (const b of document.querySelectorAll('[data-speed]')) b.addEventListener('click', () => setSpeed(+b.dataset.speed));
$('pause').addEventListener('click', () => setPaused(!loop.paused));
$('alarm-silence').addEventListener('click', () => { sim.act({ type: 'alarmSilence' }); acted(); });

// NIBP
const cyc = $('nibp-cycle');
cyc.innerHTML = NIBP_CYCLES.map(c => `<option value="${c}">${c ? c + ' min' : 'Manual'}</option>`).join('');
cyc.value = String(sim.state.mon.nibp.cycle);
cyc.addEventListener('change', () => { sim.act({ type: 'nibp', cycle: +cyc.value }); });
$('nibp-go').addEventListener('click', () => {
  sim.act({ type: 'nibp', do: sim.state.mon.nibp.start != null ? 'stop' : 'start' });
  acted();
});

// Pre-op screen (DESIGN.md "Screens" #preop): the synthetic patient's summary and the sign-in checklist for the guided
// case. Reads ?case=<key>; an unknown case falls back to the library. Demographics come from the model patient so the
// briefing matches the monitor. Built once (the checklist keeps the trainee's ticks if they go back and forth).
const dl = pairs => pairs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
function renderPreop() {
  const key = params.get('case'), c = CASES[key];
  if (!c) return false;
  $('preop-title').textContent = c.title;
  $('preop-sum').innerHTML = dl(patientSummary(sim.state.patient));
  $('preop-clin').innerHTML = dl(clinicalSummary(c));
  if (!$('preop-list').children.length)
    $('preop-list').innerHTML = SIGN_IN.map((t, i) => `<li><label><input type="checkbox" id="si-${i}"> <span>${t}</span></label></li>`).join('');
  // keep the whole query (case, and any seed/test) and change only the hash, so the theatre uses the same patient the
  // briefing described — and so it is a hashchange, not a reload
  $('preop-begin').href = location.search + '#theatre';
  return true;
}

// screens by hash
function route() {
  const id = location.hash.slice(1);
  let screen = id === 'theatre' ? 'theatre' : id === 'preop' ? 'preop' : 'library';
  if (screen === 'preop' && !renderPreop()) screen = 'library';
  for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== screen;
  if (screen === 'theatre') { loop.start(); requestAnimationFrame(() => { refill(); nums.update(sim.state, performance.now(), true); panels(true); }); }
  else loop.stop();
}
addEventListener('hashchange', route);
// refill a lane only when its canvas really changed size (numbers changing must not wipe the sweep)
new ResizeObserver(() => {
  if ($('theatre').hidden) return;
  const src = source();
  for (const l of lanes) if (l.fit()) l.refill(src, tDisp);
}).observe($('monitor'));

setSpeed(+store.get('speed', 1), false);
route();

// tests drive the model directly instead of waiting in real time (DESIGN.md, "URL and deep links")
if (TEST) {
  window.otsim = {
    sim,
    get state() { return sim.state; },
    step(n = 1) { sim.step(n); surgTick(); if (!fast) tDisp = modelT(loop.acc); refill(); nums.update(sim.state, performance.now(), true); panels(true); return sim.state.t; },
    surgStart() { $('surg-start').click(); return sim.state.t; },
    surgSkip() { $('surg-skip').click(); return sim.state.t; },
    pause(p = true) { setPaused(p); },
    speed: s => setSpeed(s),
    lanes,
    get tDisp() { return tDisp; },
  };
}
