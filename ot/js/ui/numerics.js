// Numeric boxes (DESIGN.md, "Screens"): DOM text, written at most twice a second of wall time whatever the speed,
// and only when the shown text changes.

import { NIBP_TAKES } from '../model/monitor.js';

const $ = id => document.getElementById(id);
const r = x => (Number.isFinite(x) ? String(Math.round(x)) : '--');

export function clockText(t) {
  const s = Math.max(0, Math.floor(t + 1e-6)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = n => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(ss)}` : `${p(m)}:${p(ss)}`;
}

function ageText(n, t) {
  if (n.start != null) return `Measuring… ${Math.max(0, Math.ceil(NIBP_TAKES - (t - n.start)))} s`;
  if (!n.last) return n.cycle ? `Cycle ${n.cycle} min` : 'Manual';
  const a = t - n.last.t;
  const ago = a < 60 ? 'just now' : `${Math.floor(a / 60)} min ago`;
  return `${ago}${n.cycle ? ` · cycle ${n.cycle} min` : ''}`;
}

export class Numerics {
  constructor() {
    this.el = { hr: $('n-hr'), rhythm: $('n-rhythm'), spo2: $('n-spo2'), etco2: $('n-etco2'), rr: $('n-rr'), nibp: $('n-nibp'), map: $('n-map'), age: $('n-nibp-age'), temp: $('n-temp'), clock: $('clock'), go: $('nibp-go'), tof: $('n-tof'), tofr: $('n-tofr'), ptc: $('n-ptc'), ppeak: $('n-ppeak'), peep: $('n-peep'), mv: $('n-mv'), agent: $('n-agent'), agentName: $('n-agent-name') };
    this.lastWrite = -1e9;
  }
  set(el, text) { if (el.textContent !== text) el.textContent = text; }

  // now: wall time in ms; force: write regardless of the twice-a-second limit
  update(state, now, force = false) {
    if (!force && now - this.lastWrite < 500) return;
    this.lastWrite = now;
    const m = state.mon, e = this.el, n = m.nibp;
    this.set(e.clock, clockText(state.t));
    this.set(e.hr, r(m.hr));
    if (e.rhythm && state.rh) this.set(e.rhythm, state.rh.rhythm === 'sinus' ? '' : state.rh.label);
    this.set(e.spo2, r(Math.min(100, m.spo2)));
    this.set(e.etco2, r(m.etco2));
    this.set(e.rr, r(m.rr));
    this.set(e.temp, Number.isFinite(m.temp) ? m.temp.toFixed(1) : '--');
    this.set(e.nibp, n.last ? `${r(n.last.sys)}/${r(n.last.dia)}` : '--/--');
    this.set(e.map, n.last ? `(${r(n.last.map)})` : '');
    this.set(e.age, ageText(n, state.t));
    this.set(e.go, n.start != null ? 'Stop NIBP' : 'Start NIBP');
    const tof = m.tof;
    this.set(e.tof, `${tof.count}/4`);
    this.set(e.tofr, tof.count === 4 && tof.ratio != null ? `${Math.round(Math.min(1, tof.ratio) * 100)}%` : '');
    const ptcRecent = tof.ptcT != null && state.t - tof.ptcT < 120;
    this.set(e.ptc, ptcRecent ? (tof.ptc == null ? 'PTC: TOF present' : `PTC ${tof.ptc}`) : '');
    const rp = state.resp;
    this.set(e.ppeak, rp && rp.ppeak > 0 ? r(rp.ppeak) : '--');
    this.set(e.peep, rp ? r(rp.peep) : '--');
    this.set(e.mv, rp ? rp.mv.toFixed(1) : '--');
    const vol = state.vol;
    if (vol) {
      // show the agent with the highest MAC share
      let top = null, topMac = 0;
      for (const id in vol.fi) { const m = vol.ce[id]; if (vol.fi[id] > 0.001 || m > 0.0005) { if (m >= topMac) { topMac = m; top = id; } } }
      if (top && top !== 'nitrous' && (vol.fi[top] > 0.001 || vol.ce[top] > 0.0005)) {
        this.set(e.agent, `${(vol.fi[top] * 100).toFixed(1)}/${(state.vol.t ? state.vol.t[top].fa * 100 : 0).toFixed(1)}/${vol.mac.toFixed(1)}`);
        this.set(e.agentName, top[0].toUpperCase() + top.slice(1, 4) + (vol.fgf && vol.fi.nitrous > 0.01 ? ' +N₂O' : ''));
      } else { this.set(e.agent, vol.fi.nitrous > 0.01 ? `N₂O ${(vol.fi.nitrous * 100).toFixed(0)}%` : '--'); this.set(e.agentName, ''); }
    }
  }
}
