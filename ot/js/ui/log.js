// The Log (DESIGN.md M3.3 "Log tab"): a readable, timestamped record of everything that happened — drugs, the airway
// and ventilator, fluids, the rhythm and resuscitation, stimuli and the operation, NIBP readings, alarms, and the
// patient's responses. It reads sim.log (actions are logged by the engine, events by the subsystems), so it is the
// same record the M5 debrief will replay. Pure, so a unit test can check the lines.

import { DRUGS } from '../model/drugs.js';
import { HELP_EVENT } from './help.js';

const drugName = d => (DRUGS[d] ? DRUGS[d].name : d);
const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
const pct = x => Math.round(x * 100);

const PRODUCT = { crystalloid: 'Crystalloid', colloid: 'Colloid', rbc: 'Red cells' };
const DEVICE = { none: 'natural (face)', mask: 'face mask', sad: 'supraglottic (LMA)', ett: 'tracheal tube', fona: 'front-of-neck' };
const MANOEUVRE = { none: 'none', jawThrust: 'jaw thrust', opa: 'oropharyngeal airway', npa: 'nasopharyngeal airway' };
const RHYTHM = {
  sinus: 'sinus rhythm', brady: 'sinus bradycardia', tachy: 'sinus tachycardia', av1: 'first-degree AV block',
  wenckebach: 'Wenckebach', mobitz2: 'Mobitz II', chb: 'complete heart block', junctional: 'junctional',
  af: 'atrial fibrillation', flutter: 'atrial flutter', svt: 'SVT', bigeminy: 'bigeminy', vt: 'VT',
  torsades: 'torsades', vf: 'VF', paced: 'paced', pea: 'PEA', asystole: 'asystole',
  hyperk1: 'hyperkalaemia (peaked T)', hyperk2: 'hyperkalaemia (wide QRS)', hyperk3: 'hyperkalaemia (sine wave)',
};

// one action → a short line (null if it should not appear in the log)
export function actionText(a) {
  switch (a.type) {
    case 'bolus': return `${drugName(a.drug)} ${a.dose} ${a.unit}`;
    case 'infusion': return a.rate > 0 ? `${drugName(a.drug)} infusion ${a.rate} ${a.unit}` : `${drugName(a.drug)} infusion stopped`;
    case 'tci': return a.stop ? `${drugName(a.drug)} TCI stopped` : `${drugName(a.drug)} TCI, ${a.mode === 'plasma' ? 'plasma' : 'effect-site'} target ${a.target}`;
    case 'o2': return `FiO₂ ${pct(a.fio2)}%`;
    case 'fgf': return `Fresh gas O₂ ${a.o2} / air ${a.air} / N₂O ${a.n2o} L/min`;
    case 'vaporiser': return a.dial > 0 ? `${cap(a.agent)} ${a.dial}%` : `${cap(a.agent)} off`;
    case 'vent': return a.mode === 'spont' ? 'Ventilator: spontaneous'
      : `Ventilator: ${a.mode === 'vc' ? 'volume control' : 'pressure control'}${a.vt ? `, Vt ${a.vt}` : ''}${a.pinsp ? `, Pinsp ${a.pinsp}` : ''}${a.rr ? `, RR ${a.rr}` : ''}`;
    case 'fluid': return `${PRODUCT[a.product] || cap(a.product)} ${a.ml} mL`;
    case 'bleed': return a.mlPerMin > 0 ? `Bleeding ${a.mlPerMin} mL/min` : 'Bleeding stopped';
    case 'warming': return a.on ? 'Forced-air warmer on' : 'Forced-air warmer off';
    case 'rhythm': return `Rhythm → ${RHYTHM[a.to] || a.to}`;
    case 'cpr': return a.on ? `Chest compressions started (${a.quality})` : 'Chest compressions stopped';
    case 'defib': return `Defibrillated ${a.joules} J`;
    case 'amiodarone': return 'Amiodarone';
    case 'pace': return a.on ? `Pacer on, ${a.mA} mA` : 'Pacer off';
    case 'device': return `Airway device → ${DEVICE[a.to] || a.to}`;
    case 'manoeuvre': return `Manoeuvre → ${MANOEUVRE[a.to] || a.to}`;
    case 'laryngoscopy': return a.video ? 'Videolaryngoscopy' : 'Laryngoscopy';
    case 'intubate': return `Intubated (${a.placement})`;
    case 'extubate': return 'Extubated';
    case 'cuff': return a.up === false ? 'Cuff down' : 'Cuff up';
    case 'tof': return a.do === 'ptc' ? 'PTC requested' : 'TOF measured';
    case 'nibp': return a.do === 'start' ? 'NIBP started' : a.do === 'stop' ? 'NIBP stopped'
      : a.cycle != null ? `NIBP cycle ${a.cycle ? a.cycle + ' min' : 'manual'}` : null;
    case 'alarmSilence': return 'Alarms silenced';
    case 'help': return HELP_EVENT[a.do] || 'Called for help';
    case 'stimulus': return a.kind === 'surgery' ? (a.level ? 'Surgery under way' : 'Surgery stopped') : `${cap(a.kind)} stimulus`;
    default: return null;
  }
}

// the whole log as {t, text} lines, oldest first, capped to the most recent `max`
export function logLines(state, max = 300) {
  const out = [];
  for (const e of state.log) {
    let text = null;
    if (e.kind === 'action') text = actionText(e.action);
    else if (e.kind === 'alarm') text = `${e.state === 'on' ? '⚠ ' : ''}${e.msg}${e.state === 'off' ? ' cleared' : ` (${e.priority})`}`;
    else if (e.kind === 'nibp') text = `NIBP ${e.sys}/${e.dia} (MAP ${e.map})`;
    else if (e.kind === 'movement') text = `Patient moved${e.stimulus ? ` at ${e.stimulus === 'surgery' ? 'surgery' : e.stimulus}` : ''}`;
    else if (e.kind === 'asleep') text = 'No longer responds to voice';
    else if (e.kind === 'awake') text = 'Responds to voice again';
    else if (e.kind === 'ptc') text = e.ptc == null ? 'PTC: TOF present' : `PTC ${e.ptc}`;
    // 'stimulus' events duplicate the stimulus action, so they are left out here
    if (text) out.push({ t: e.t, text });
  }
  return out.slice(-max);
}
