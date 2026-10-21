import './pump.css';
import { PumpState, act, comparison, initialState, loadScenario, nowLine, plannedBolus, summaryFor, tick, ModelChoice, ce, cp, rateMlH, timeToFall, WAKE_CE, TARGET_MAX, TARGET_MIN } from './sim';
import { LCD_H, LCD_W, drawTrend, patchLive, predictionFor, screenHtml, shapeKey, hms } from './screens';
import { PRESETS, presetById } from './presets';
import { beep, isMuted, setMuted, unlock } from './audio';
import { lineChart, Series } from '../ui/chart';
import type { Sample } from './sim';
import { ceBolus, eleveldPk, pumpInduction, schniderPk, jamesPeakWeight, bmi } from '../engine';

// ---------------------------------------------------------------- fonts (Hind, bundled with its licence in eeg/fonts/)
const SITE = import.meta.env.DEV ? '/' : '../../';
for (const w of [400, 500, 600]) {
  try {
    const ff = new FontFace('Hind', `url(${SITE}eeg/fonts/Hind-${w}.woff2)`, { weight: String(w), display: 'swap' });
    document.fonts.add(ff);
    ff.load().catch(() => { /* system fallback */ });
  } catch { /* no FontFace: system fallback */ }
}

// ---------------------------------------------------------------- page state
type Speed = 0 | 1 | 5 | 20;
type Mode = 'pump' | 'screen' | 'rotate';
interface Page { speed: Speed; mode: Mode; panelModel: ModelChoice; panelOpioid: boolean; theme: 'system' | 'light' | 'dark' }
// Phones (under 700 px) open in the rotated operate mode: the LCD fills the long side of the phone, so its keys are
// full size (over 44 px). Landscape phones and wider screens show the whole pump.
const narrow = () => window.innerWidth < 700;
const page: Page = { speed: 1, mode: narrow() ? 'rotate' : 'pump', panelModel: 'eleveld', panelOpioid: true, theme: 'system' };
try { const t = localStorage.getItem('tci-theme'); if (t === 'light' || t === 'dark') page.theme = t; } catch { /* ignore */ }

const st: PumpState = initialState();
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (x: number, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '--');

// ---------------------------------------------------------------- skeleton
const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v8"/><path d="M6.6 6.6a8 8 0 1 0 10.8 0"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 3v5M16 3v5"/><path d="M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v3"/></svg>',
};
const hwKeys = (cls: string) => `
  <button type="button" class="${cls} pump-key" data-hw="home" aria-label="Home">${ICON.home}</button>
  <button type="button" class="${cls} pump-key" data-hw="power" aria-label="On/Off">${ICON.power}</button>
  <button type="button" class="${cls} pump-key pump-key-stop" data-hw="stop" aria-label="Stop">Stop</button>`;

function pumpChrome() {
  return `<div class="pump" id="pump" role="group" aria-label="Pump casing">
    <div class="pa pump-body" style="--x:0;--y:0;--w:905;--h:430"></div>
    <div class="pa pump-lid" style="--x:0;--y:0;--w:905;--h:84"></div>
    <div class="pa pump-fascia" style="--x:28;--y:88;--w:852;--h:324"></div>
    <div class="pa pump-brand" style="--x:160;--y:104;--w:300;--h:28">Space<sup>plus</sup> Perfusor</div>
    <div class="pa pump-tag" style="--x:650;--y:100;--w:210;--h:28;left:auto;right:calc(150 * var(--p))">TCI teaching emulator</div>
    <div class="pa pump-led" style="--x:62;--y:164;--w:14;--h:14" id="led-alarm"></div>
    <div class="pa pump-led pump-led-run" style="--x:60;--y:196;--w:0;--h:0"></div>
    <div class="pa pump-ico" id="ico-bell" style="--x:58;--y:232;--w:22;--h:22">${ICON.bell}</div>
    <div class="pa pump-ico" style="--x:58;--y:268;--w:22;--h:22">${ICON.plug}</div>
    <button type="button" class="pa pump-key" data-hw="home" aria-label="Home" style="--x:88;--y:130;--w:60;--h:60">${ICON.home}</button>
    <button type="button" class="pa pump-key" data-hw="power" aria-label="On/Off" style="--x:88;--y:202;--w:60;--h:60">${ICON.power}</button>
    <button type="button" class="pa pump-key pump-key-stop" data-hw="stop" aria-label="Stop" style="--x:86;--y:276;--w:64;--h:64">Stop</button>
    <div class="pa pump-screen" style="--x:158;--y:142;--w:710;--h:241"><div class="pp-lcdbox" id="lcdbox-pump" style="width:100%;height:100%"></div></div>
    <div class="pa pump-barrel" style="--x:874;--y:152;--w:126;--h:44"></div>
    <div class="pa pump-clamp" style="--x:896;--y:120;--w:104;--h:300"></div>
    <div class="pa pump-pull" style="--x:910;--y:280;--w:76;--h:76">Pull</div>
  </div>`;
}

const root = document.getElementById('root')!;
root.innerHTML = `
  <header class="app-bar app-bar--inline"><div class="app-bar-row"><div class="app-bar-lead"><a class="app-bar-btn app-back" href="../">TCI</a></div><h1 class="app-bar-title">Space plus Perfusor</h1><div class="app-bar-trail"></div></div></header>
  <main class="app-main pp-main" id="main">
    <p class="tci-disclaimer"><strong>Teaching emulator.</strong> Not affiliated with or endorsed by B. Braun. Education and planning only; not the pump's own software.</p>
    <div class="pp-layout">
      <div>
        <div class="pp-stage" id="stage">
          ${pumpChrome()}
          <div class="pp-screenonly">
            <div class="pp-lcdbox" id="lcdbox-screen"></div>
            <div class="pp-hw"><div class="pp-hwleds"><div class="pump-led" id="led-alarm2"></div><div class="pump-led pump-led-run"></div><div class="pp-bell">${ICON.bell}</div></div>${hwKeys('')}</div>
          </div>
        </div>
        <p class="pump-foot">Teaching emulator. Not affiliated with or endorsed by B. Braun. Education and planning only; not the pump's own software.</p>
        <div class="pp-controls" id="controls">
          <fieldset class="app-segmented" style="margin:0"><legend class="app-sr">View</legend>
            <label class="app-seg"><input type="radio" name="mode" value="pump"><span>Pump</span></label>
            <label class="app-seg"><input type="radio" name="mode" value="screen"><span>Screen</span></label>
            <label class="app-seg"><input type="radio" name="mode" value="rotate"><span>Operate</span></label></fieldset>
          <fieldset class="app-segmented" style="margin:0"><legend class="app-sr">Simulation speed</legend>
            <label class="app-seg"><input type="radio" name="speed" value="0"><span>Pause</span></label>
            <label class="app-seg"><input type="radio" name="speed" value="1"><span>1x</span></label>
            <label class="app-seg"><input type="radio" name="speed" value="5"><span>5x</span></label>
            <label class="app-seg"><input type="radio" name="speed" value="20"><span>20x</span></label></fieldset>
          <button type="button" class="app-btn app-btn--secondary app-btn--compact" data-page="jump">Jump 5 min</button>
          <label class="app-row" style="min-height:40px;padding:4px 10px;border-radius:10px"><span class="app-row-body"><span class="app-row-title" style="font-size:var(--app-t-subhead)">Sound</span></span><input type="checkbox" role="switch" class="app-switch" name="sound" checked></label>
        </div>
        <p class="pp-hint" id="hint"></p>
      </div>
      <aside class="pp-panel" aria-label="Teaching panel">
        <section class="app-section"><h2 class="app-section-header">Scenarios</h2>
          <div class="app-card">
            <fieldset class="app-segmented" style="margin:0 0 8px"><legend class="app-sr">Model</legend>
              <label class="app-seg"><input type="radio" name="pmodel" value="schnider"><span>Schnider</span></label>
              <label class="app-seg"><input type="radio" name="pmodel" value="eleveld"><span>Eleveld</span></label></fieldset>
            <div class="pp-scn">${PRESETS.map((p) => `<button type="button" class="app-btn app-btn--secondary" data-scn="${p.id}"><span>${esc(p.name)}</span><small>${p.patient.sex} ${p.patient.age} y, ${p.patient.height} cm, ${p.patient.weight} kg</small></button>`).join('')}</div>
            <p class="app-section-footer" style="padding:8px 0 0">Loads the patient and model on the pump at the summary screen (the pump must be on; the panel switches it on). The full key-by-key set-up is also available from the pump itself.</p>
          </div>
        </section>
        <section class="app-section"><h2 class="app-section-header">What the pump is doing</h2><p class="pp-now" id="now" aria-live="polite"></p><p class="pp-teach" id="teach" hidden></p></section>
        <section class="app-section"><h2 class="app-section-header">Cp and Ce</h2><div class="app-card" id="chart"><p class="app-muted app-small" style="margin:0">Starts with the infusion.</p></div></section>
        <section class="app-section"><h2 class="app-section-header">Same patient, other model</h2><div class="app-card" id="cmp"></div></section>
        <section class="app-section"><h2 class="app-section-header">Pump settings</h2>
          <ul class="app-list">
            <li><label class="app-row"><span class="app-row-body"><span class="app-row-title">Eleveld BMI above 30: Servin adjusted weight <span class="pp-badge">reported, unverified</span></span><span class="app-row-sub">The reported Space Plus behaviour: for BMI over 30 the Eleveld dosing weight becomes Devine IBW + 0.4 x excess. Applies to the next case.</span></span><input type="checkbox" role="switch" class="app-switch" name="servin"></label></li>
          </ul>
          <div class="app-card"><span class="app-field-label">Maximum rate (mL/h)</span>
            <fieldset class="app-segmented" style="margin:8px 0 0"><legend class="app-sr">Maximum rate</legend>
              <label class="app-seg"><input type="radio" name="maxrate" value="800"><span>800</span></label>
              <label class="app-seg"><input type="radio" name="maxrate" value="1200"><span>1200</span></label>
              <label class="app-seg"><input type="radio" name="maxrate" value="1800"><span>1800</span></label></fieldset>
            <p class="app-section-footer" style="padding:8px 0 0">800 mL/h is the department pump's setting (verified 21 Oct 2026); 1200 and 1800 are teaching options. Plasma overshoot limit 400% and decrement Ce ${WAKE_CE.toFixed(1)} are fixed, as on the pump. Applies to the next case.</p>
          </div>
          <div class="app-card"><span class="app-field-label">Teaching shortcuts</span>
            <div class="app-btn-row" style="margin-top:8px"><button type="button" class="app-btn app-btn--secondary app-btn--compact" data-page="drain">Syringe to 3 mL</button><button type="button" class="app-btn app-btn--secondary app-btn--compact" data-page="reset">Reset pump</button></div>
            <p class="app-section-footer" style="padding:8px 0 0">Drain the syringe to see the pre-alarm and the empty alarm without waiting.</p>
          </div>
          <div class="app-card"><span class="app-field-label">Page theme</span>
            <fieldset class="app-segmented" style="margin:8px 0 0"><legend class="app-sr">Theme</legend>
              <label class="app-seg"><input type="radio" name="theme" value="system"><span>System</span></label>
              <label class="app-seg"><input type="radio" name="theme" value="light"><span>Light</span></label>
              <label class="app-seg"><input type="radio" name="theme" value="dark"><span>Dark</span></label></fieldset>
          </div>
        </section>
        <section class="app-section"><h2 class="app-section-header">How the numbers are made</h2><div class="app-card" id="facts"></div></section>
        <section class="app-section"><h2 class="app-section-header">What is real and what is inferred</h2><div class="app-card">
          <p class="app-section-footer" style="padding:0 0 8px"><b>From the reference photo and the department pump:</b> the main running view (lime drug block, cyan labels, Flow Rate with the small decimal, Infused Amount, Remaining Volume, battery 12h, pressure gauge, CHANGE VIEW and the amber BOLUS key), the 800 mL/h maximum rate, the 400% plasma overshoot limit and the decrement Ce of 1.0 µg/mL.</p>
          <p class="app-section-footer" style="padding:0 0 4px"><b>Inferred (not seen on a real pump):</b></p>
          <ul class="pp-inf">
            <li>Every set-up screen (self-test, syringe, drug library, mode, model, opioid question, patient cards and keypad, summary, target keypad, ready) and the trend and details views.</li>
            <li>The 10 s controller update interval; the pump reacting at once to a new target; mg/kg/h worked out on the dosing weight.</li>
            <li>Alarms: the 5 min syringe pre-alarm, its OK key clearing it without pausing, the empty-syringe screen and the catch-up bolus after replacing; the beep patterns.</li>
            <li>Keys: Home during set-up returning to the drug library; holding On/Off for a second to ask for switch-off; the gauge reading is a fixed stand-in (occlusion pressure is not simulated).</li>
            <li>Eleveld asking about opioid co-administration, and the BMI above 30 Servin weight (reported, unverified).</li>
          </ul>
          <p class="app-section-footer" style="padding:8px 0 0">The full table is in the repository notes, <code>apps/tci/docs/PUMP.md</code>.</p>
        </div></section>
      </aside>
    </div>
    <p class="pp-foot">Every value on the screen is computed live by the TCI emulator's engine (Schnider 1998/1999, Eleveld 2018, exact solver, Shafer and Gregg effect-site targeting with the pump's plasma overshoot limit). Screens other than the main running view are inferred, not copied: see the notes (<code>apps/tci/docs/PUMP.md</code>). Built for teaching at NTF Anaesthesia by <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>. Contact contact@anantf.com. App version ${__APP_VERSION__}.</p>
  </main>`;

const lcd = document.createElement('div');
lcd.className = 'lcd';
lcd.setAttribute('role', 'group');
lcd.setAttribute('aria-label', 'Pump touchscreen');
lcd.dataset.w = String(LCD_W); lcd.dataset.h = String(LCD_H);
const stage = document.getElementById('stage')!;

function applyMode() {
  if (page.mode === 'rotate' && !narrow()) page.mode = 'pump'; // the rotated LCD only fits a portrait phone
  const box = document.getElementById(page.mode === 'pump' ? 'lcdbox-pump' : 'lcdbox-screen')!;
  if (lcd.parentElement !== box) box.appendChild(lcd);
  stage.classList.toggle('is-screen', page.mode !== 'pump');
  stage.classList.toggle('pp-rot', page.mode === 'rotate');
  document.getElementById('hint')!.textContent = page.mode === 'rotate'
    ? 'Operate: the screen is turned so it fills the phone. Turn your phone sideways and use the keys at full size; the hardware keys are below the screen. Hold On/Off for a second to switch off.'
    : page.mode === 'screen' ? 'Screen only, with the hardware keys below (small on a phone: choose Operate for full-size keys). Hold On/Off for a second to switch off.' : 'Tap the screen’s soft keys and the hardware keys on the left. Hold On/Off for a second to switch off. Choose Screen or Operate on a phone.';
  (document.querySelector<HTMLInputElement>(`input[name=mode][value=${page.mode}]`))!.checked = true;
}
function applyTheme() {
  const el = document.documentElement;
  if (page.theme === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', page.theme);
  try { if (page.theme === 'system') localStorage.removeItem('tci-theme'); else localStorage.setItem('tci-theme', page.theme); } catch { /* ignore */ }
  (document.querySelector<HTMLInputElement>(`input[name=theme][value=${page.theme}]`))!.checked = true;
}
function syncControls() {
  (document.querySelector<HTMLInputElement>(`input[name=speed][value="${page.speed}"]`))!.checked = true;
  (document.querySelector<HTMLInputElement>(`input[name=pmodel][value=${page.panelModel}]`))!.checked = true;
  (document.querySelector<HTMLInputElement>(`input[name=maxrate][value="${st.settings.maxRateMlH}"]`))!.checked = true;
  (document.querySelector<HTMLInputElement>('input[name=servin]'))!.checked = st.settings.servin;
  (document.querySelector<HTMLInputElement>('input[name=sound]'))!.checked = !isMuted();
}

// ---------------------------------------------------------------- render loop
let lastShape = '';
let lastBeeps = st.beeps;
let lastAlarmBeep = 0;
let panelAt = -1;
let lastPredT = -1;
let predCache: Sample[] = [];

function prediction(): Sample[] {
  const r = st.run;
  if (!r) return [];
  if (r.t !== lastPredT) { predCache = predictionFor(st); lastPredT = r.t; }
  return predCache;
}

function renderLcd() {
  const key = shapeKey(st);
  if (key !== lastShape) { lcd.innerHTML = screenHtml(st); lastShape = key; lcd.dataset.screen = st.screen; lcd.dataset.view = String(st.view); }
  patchLive(st, lcd);
  if (st.screen === 'run' && st.view === 2) {
    const c = lcd.querySelector<HTMLCanvasElement>('canvas.trend-c');
    if (c) drawTrend(st, c, prediction());
  }
  const running = !!st.run && !st.run.paused && !st.run.empty && st.screen !== 'off';
  const alarm = st.alarm === 'empty';
  const warn = st.alarm === 'prealarm';
  for (const el of [document.getElementById('pump')!, stage]) { el.classList.toggle('is-running', running); el.classList.toggle('is-alarm', alarm); el.classList.toggle('is-warn', warn); }
}

function chartHtml(): string {
  const r = st.run;
  if (!r || r.samples.length < 2) return '<p class="app-muted app-small" style="margin:0">Starts with the infusion.</p>';
  const sm = r.samples;
  const x = sm.map((q) => q.t / 60);
  const pred = prediction();
  const tgt: Series = { label: 'Target', x, y: sm.map((q) => q.target), color: 'var(--app-muted)', dash: '2 4', width: 1.5, step: true };
  const series: Series[] = [
    { label: 'Cp', x, y: sm.map((q) => q.cp), color: 'var(--tci-cp)', dash: '6 4' },
    { label: 'Ce', x, y: sm.map((q) => q.ce), color: 'var(--tci-ce)' },
    tgt,
  ];
  if (pred.length) series.push({ label: 'Ce predicted', x: [r.t / 60, ...pred.map((q) => q.t / 60)], y: [ce(r), ...pred.map((q) => q.ce)], color: 'var(--tci-ce)', dash: '2 3', width: 1.5 });
  const xMax = Math.max(5, Math.ceil(((pred.length ? pred[pred.length - 1].t : r.t) / 60) / 5) * 5);
  return lineChart(series, [], { xLabel: 'min', yLabel: 'µg/mL', xMax, cursorX: r.t / 60, height: 200 }) +
    lineChart([{ label: 'Rate mL/h', x, y: sm.map((q) => q.rateMlH), color: 'var(--tci-alt)', step: true, width: 2 }], [], { xLabel: 'min', yLabel: 'mL/h', xMax, cursorX: r.t / 60, height: 130 });
}

function cmpHtml(): string {
  const target = st.run ? st.run.target : st.screen === 'ready' ? st.pendingTarget : 0;
  if (!(target > 0)) return '<p class="app-muted app-small" style="margin:0">Shown once a target is set.</p>';
  const c = comparison(st.setup, st.settings, target);
  const name = (m: ModelChoice) => (m === 'schnider' ? 'Schnider' : 'Eleveld');
  const conc = st.setup.conc;
  return `<p class="pp-cmp"><b>${name(st.setup.model)}</b> Ce ${fmt(target, 1)}: induction <b>${fmt(c.thisMg, 0)} mg</b> (${fmt(c.thisMg / conc, 1)} mL).<br>
    <b>${name(c.other)}</b> Ce ${fmt(target, 1)} for the same patient: ${c.refused ? 'refused by the pump (past the James LBM peak)' : `<b>${fmt(c.otherMg, 0)} mg</b> (${fmt(c.otherMg / conc, 1)} mL)`}.<br>
    ${c.refused ? '' : `To give the same ${fmt(c.thisMg, 0)} mg bolus on ${name(c.other)}, set Ce <b>${fmt(c.matched, 1)}</b> (matched target, from the engine's bolus matcher)${c.matched > TARGET_MAX ? ` (above the pump's ${TARGET_MAX} µg/mL limit: not settable, so ${name(c.other)} cannot reproduce that bolus)` : c.matched < TARGET_MIN ? ` (below the pump's ${TARGET_MIN} µg/mL minimum: not settable)` : ''}.`}</p>
    <p class="app-section-footer" style="padding:8px 0 0">Same bolus does not mean same effect: each model's Ce is on its own scale.</p>`;
}

function factsHtml(): string {
  const s = st.setup, p = s.patient, sm = summaryFor(s, st.settings);
  const pk = st.run ? st.run.pk : plannedBolus(s, st.settings, 4).pk;
  const peak = jamesPeakWeight(p);
  return `<dl class="pp-kv">
    <dt>Patient</dt><dd>${p.sex} ${p.age} y, ${p.height} cm, ${p.weight} kg, BMI ${fmt(bmi(p), 1)}</dd>
    <dt>James LBM</dt><dd>${fmt(sm.lbm, 1)} kg (peak at ${fmt(peak, 0)} kg)</dd>
    <dt>Al-Sallami FFM</dt><dd>${fmt(sm.ffm, 1)} kg</dd>
    <dt>Dosing weight</dt><dd>${fmt(sm.dosingWeight, 1)} kg</dd>
    <dt>V1, V2, V3</dt><dd>${fmt(pk.v1, 2)}, ${fmt(pk.v2, 1)}, ${fmt(pk.v3, 0)} L</dd>
    <dt>CL1, CL2, CL3</dt><dd>${fmt(pk.cl1, 2)}, ${fmt(pk.cl2, 2)}, ${fmt(pk.cl3, 2)} L/min</dd>
    <dt>ke0</dt><dd>${fmt(pk.ke0, 3)} /min</dd>
    ${st.run ? `<dt>Decrement to Ce ${WAKE_CE.toFixed(1)}</dt><dd>${(() => { const d = timeToFall(st.run!, WAKE_CE); return d == null ? 'over 6 h' : `${fmt(d, 1)} min`; })()}</dd>` : ''}
  </dl><p class="app-section-footer" style="padding:8px 0 0">${s.model === 'schnider' ? 'Schnider: V1 4.27 L fixed; CL1 from weight, LBM and height; V2 and CL2 fall with age; ke0 0.456.' : `Eleveld: sizes scale with weight and FFM; clearance matures with age and falls with an opioid (${s.opioid ? 'on' : 'off'}); ke0 0.146 x (W/70)^-0.25.`} Controller: rate chosen every ${st.settings.updateSec} s so the predicted peak Ce equals the target, Cp capped at ${st.settings.cpMaxRatio * 100}% of it.</p>`;
}

function renderPanel() {
  document.getElementById('now')!.textContent = nowLine(st);
  const teach = document.getElementById('teach')!, pr = presetById(st.setup.presetId);
  if (pr && st.screen !== 'off' && st.screen !== 'selftest') { teach.innerHTML = `<b>Teaching point (${esc(pr.name)}):</b> ${esc(pr.teach)}`; teach.hidden = false; } else teach.hidden = true;
  document.getElementById('chart')!.innerHTML = chartHtml();
  document.getElementById('cmp')!.innerHTML = cmpHtml();
  document.getElementById('facts')!.innerHTML = factsHtml();
}

let prevNow = performance.now();
let frame = 0;
function loop(now: number) {
  const wallDt = Math.min(0.5, (now - prevNow) / 1000);
  prevNow = now;
  tick(st, wallDt, wallDt * page.speed);
  renderLcd();
  if (st.beeps !== lastBeeps) { lastBeeps = st.beeps; beep(st.alarm === 'empty' ? 'alarm' : st.alarm === 'prealarm' ? 'warn' : 'key'); lastAlarmBeep = now; }
  if (st.alarm === 'empty' && now - lastAlarmBeep > 2500) { beep('alarm'); lastAlarmBeep = now; }
  frame++;
  const t = st.run ? st.run.t : -1;
  if (frame % 30 === 0 || t !== panelAt && (frame % 15 === 0)) { renderPanel(); panelAt = t; }
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- events
function onAct(a: string) {
  unlock();
  act(st, a);
  beep('key');
  renderLcd();
  renderPanel();
}
document.addEventListener('click', (e) => {
  const el = e.target as HTMLElement;
  const k = el.closest<HTMLElement>('[data-act]');
  if (k && lcd.contains(k)) { onAct(k.dataset.act!); return; }
  const hw = el.closest<HTMLElement>('[data-hw]');
  if (hw) {
    if (hw.dataset.hw === 'power') { // handled on pointerdown / pointerup (hold to switch off)
      if (holdFired) { holdFired = false; return; }
      if (st.screen === 'off' || st.screen === 'selftest' || st.screen === 'confirmOff') onAct('power');
      else { unlock(); st.message = 'Hold On/Off for 1 s to switch off'; st.messageUntil = st.wall + 3; renderLcd(); }
      return;
    }
    onAct(hw.dataset.hw!); return;
  }
  const scn = el.closest<HTMLElement>('[data-scn]');
  if (scn) {
    unlock();
    loadScenario(st, scn.dataset.scn!, page.panelModel, page.panelOpioid, st.setup.conc);
    page.speed = page.speed || 1;
    syncControls(); renderLcd(); renderPanel();
    document.getElementById('stage')!.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return;
  }
  const pg = el.closest<HTMLElement>('[data-page]');
  if (pg) {
    const a = pg.dataset.page;
    if (a === 'jump') { tick(st, 0, 300); }
    if (a === 'drain' && st.run) { st.run.remainingMl = Math.min(st.run.remainingMl, 3); st.run.prealarmed = false; }
    if (a === 'reset') { Object.assign(st, initialState(st.settings)); lastShape = ''; }
    renderLcd(); renderPanel();
  }
});
document.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  switch (el.name) {
    case 'mode': page.mode = el.value as Mode; applyMode(); break;
    case 'speed': page.speed = +el.value as Speed; break;
    case 'sound': setMuted(!el.checked); if (el.checked) unlock(); break;
    case 'pmodel': page.panelModel = el.value as ModelChoice; break;
    case 'servin': st.settings.servin = el.checked; lastShape = ''; break;
    case 'maxrate': st.settings.maxRateMlH = +el.value; lastShape = ''; break;
    case 'theme': page.theme = el.value as Page['theme']; applyTheme(); break;
  }
  renderLcd(); renderPanel();
});
// On/Off: a hold of 1 s (inferred) asks to confirm switch-off; a tap switches on, or cancels the confirm screen.
const HOLD_MS = 1000;
let holdTimer: number | null = null, holdFired = false;
document.addEventListener('pointerdown', (e) => {
  unlock();
  const hw = (e.target as HTMLElement).closest<HTMLElement>('[data-hw="power"]');
  if (!hw || st.screen === 'off' || st.screen === 'selftest' || st.screen === 'confirmOff') return;
  holdFired = false;
  holdTimer = window.setTimeout(() => { holdTimer = null; holdFired = true; onAct('power'); }, HOLD_MS);
}, { passive: true });
const endHold = () => { if (holdTimer != null) { clearTimeout(holdTimer); holdTimer = null; } };
document.addEventListener('pointerup', endHold, { passive: true });
document.addEventListener('pointercancel', endHold, { passive: true });
window.addEventListener('resize', () => { if (page.mode === 'rotate' && !narrow()) applyMode(); });

// test and teaching hook: read the state, press keys, advance simulated time
(window as unknown as { __pump: unknown }).__pump = {
  state: st, act: onAct, advance: (sec: number) => { tick(st, 0, sec); renderLcd(); renderPanel(); },
  setSpeed: (s: Speed) => { page.speed = s; syncControls(); }, setMode: (m: Mode) => { page.mode = m; applyMode(); }, mode: () => page.mode, holdMs: HOLD_MS,
  loadScenario: (id: string, model: ModelChoice, opioid = true) => { loadScenario(st, id, model, opioid); renderLcd(); renderPanel(); },
  engine: { ceBolus, eleveldPk, schniderPk, pumpInduction, plannedBolus: (t: number) => plannedBolus(st.setup, st.settings, t), presetById, ce: () => (st.run ? ce(st.run) : NaN), cp: () => (st.run ? cp(st.run) : NaN), rateMlH: () => (st.run ? rateMlH(st.run, st.setup.conc) : NaN), hms },
};

applyMode(); applyTheme(); syncControls(); renderLcd(); renderPanel();
requestAnimationFrame((t) => { prevNow = t; loop(t); });
