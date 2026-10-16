// Drug effects (MODEL.md section 4 and the TOF readout in section 2): neuromuscular block (M1.3); hypnosis, the
// stimulus response, movement, the BIS-like index and the autonomic drive pd.auto (M1.4). One sensitivity quantile
// per patient (patient.q) decides every yes/no endpoint, so a resistant patient is resistant everywhere.
//
// TOF readout [V for the anchors, D for the fit]: T1 = 1/(1 + (Ce/Ce50)^γ); each later twitch is more sensitive and
// steeper (Tn uses Ce50 x fn and γ x hn), fitted to two anchors: T4 disappears at T1 about 25% (Lee 1975) and TOFR 0.9
// comes at T1 about 86% (acceleromyography, Kopman 2002), which gives f4 0.75 and h4 1.51; T2 and T3 lie between.
// (One slope with f4 0.59 puts TOFR 0.9 at T1 99%, as on mechanomyography, and made recovery to TOFR 0.9 far too slow.)
// A twitch counts above 4% of control; TOFR = T4/T1, at most 1.
// Suxamethonium (phase I) has no fade; phase II (3-5 mg/kg total) fades like a non-depolarising block. Rocuronium and
// suxamethonium combine as independent blocks (their twitch fractions multiply) [D].

import { ROC, SITES, SUX, NEO } from './nmb.js';
import { pow, pow10, hill } from './fmath.js';

export const FADE = [{ f: 1, h: 1 }, { f: 0.917, h: 1.17 }, { f: 0.835, h: 1.34 }, { f: 0.752, h: 1.51 }];
export const COUNTS = 0.04;
// post-tetanic count [D]: post-tetanic twitch n responds as if Ce50 were higher by g_n, from PTC_G for the first to
// 1 (a TOF twitch) for the 11th; PTC_G tuned so the first post-tetanic response comes about 16 min before the first TOF
// response after rocuronium 1 mg/kg (Baykara 2002 [V])
export const PTC_G = 2.7;

const frac = (ce, c50, h) => (ce > 0 ? 1 / (1 + pow(ce / c50, h)) : 1);

// the readout from pk.nm. opts: { sevo: true } multiplies rocuronium's Ce50 by 0.605 (Kleijn) once volatiles exist
export function readNmb(nm, weightKg, opts = {}) {
  if (!nm) return { t1: 1, tofCount: 4, tofr: 1, ptc: 15, diaphragm: 1, upperAirway: 1, larynx: 1, neoFactor: 1, phase2: 0 };
  const neoCe = nm.neo.ce, neoFactor = 1 + ((NEO.max - 1) * neoCe) / (neoCe + NEO.ec50);
  const c50 = ROC.ce50 * neoFactor * (opts.sevo ? 0.605 : 1);
  const perKg = nm.sux.total / weightKg, phase2 = perKg <= 3 ? 0 : perKg >= 5 ? 1 : (perKg - 3) / 2;
  const tw = (site, { f, h }) => {
    // suxamethonium fades only in phase II
    const sf = 1 - phase2 * (1 - f), sh = 1 + phase2 * (h - 1);
    return frac(nm.roc.ce[site], c50 * SITES[site].ce50 * f, ROC.hill * h) * frac(nm.sux.ce, SUX.ce50 * SITES[site].ce50 * sf, SUX.hill * sh);
  };
  const T = FADE.map(x => tw('thumb', x));
  for (let i = 1; i < 4; i++) if (T[i] > T[i - 1]) T[i] = T[i - 1]; // a later twitch is never stronger
  let tofCount = 0;
  for (const x of T) if (x > COUNTS) tofCount++;
  let ptc = 0;
  for (let n = 1; n <= 15; n++) {
    const g = n > 11 ? 1 : PTC_G - ((PTC_G - 1) * (n - 1)) / 10;
    if (frac(nm.roc.ce.thumb, c50 * g, ROC.hill) * frac(nm.sux.ce, SUX.ce50 * g, SUX.hill) > COUNTS) ptc++;
  }
  return {
    t1: T[0], tofCount, tofr: tofCount === 4 ? T[3] / T[0] : null, ptc,
    diaphragm: tw('diaphragm', FADE[0]), upperAirway: tw('upperAirway', FADE[0]), larynx: tw('larynx', FADE[0]), neoFactor, phase2,
  };
}

// --- hypnosis, stimulus response, BIS-like index (MODEL.md section 4) ---------------------------------------------

// MAC at an age from MAC at 40 (Mapleson 1996) [V]; volatile.js (M2.5) uses the same
export const macAt = (mac40, age) => mac40 * pow10(-0.00269 * (age - 40));
const SEVO_MAC40 = 1.80; // % (owner question 7) [D]

// remifentanil-equivalent effect-site level, ng/mL (Lang 1996 ratio) [V ratio]
export const ceREq = (ceR, ceF) => ceR + 0.82 * ceF;
export const c50Loc = age => 2.90 - 0.022 * age; // propofol Ce50 for loss of response to voice, mcg/mL [V fit, Schnider 1999]
const GAMMA_H = 4.5, GAMMA_S = 5.22;

// stimuli: intensity relative to laryngoscopy (Kazama 1997 ratios) [V ratios, D use]; brief ones last BRIEF seconds
export const STIMULI = { tetanus: 0.95, laryngoscopy: 1.0, incision: 1.02, intubation: 1.78, surgery: 0.8 };
const BRIEF = 60;            // s a brief stimulus drives the autonomic response (it peaks at 30-60 s) [D]
const AUTO_RISE = 20;        // s time constant of the autonomic response rising (30-60 s to peak) [D]
const AUTO_FALL = 90;        // s time constant of its fading after a brief stimulus (3-5 min) [D]
// autonomic drive [D, calibrated in M2.1]: a graded response, auto = 1/(1 + U_a^2), U_a the stimulus surface with the
// hypnotic terms needing 1.6 x (MAC-BAR about 1.6 MAC; 1.5-2 MAC [V]) and the opioid C50 1.0 ng/mL instead of 1.36, so
// opioids weigh relatively more on it (fentanyl 3 ng/mL lowers MAC-BAR about 71% here vs MAC 64%; measured 83% vs
// 61%). At every P_TOL 0.9 pair it gives about 0.4, which cardio.js turns into SBP +19-32 and HR +6-10 at
// laryngoscopy (van den Berg 2021) [V target]
const BAR = 1.6;
const BAR_OPIOID = 1.0;

// U for "no response to voice" (hypnosis)
export function uHypnosis({ ceP, ceS = 0, ceR = 0, age, mac40 = SEVO_MAC40 }) {
  return (ceP / c50Loc(age) + ceS / (0.34 * macAt(mac40, age))) * (1 + (0.15 * ceR) / 1.36);
}
// U for "no response to a stimulus of intensity I" (Hannivoort 2016 reduced-Greco form) [S]; the volatile term is MAC
// over the incision intensity (0.98 = 1/1.02 in MODEL.md), so 1 MAC alone stills half at incision
export function uStimulus({ ceP, ceS = 0, ceR = 0, age, mac40 = SEVO_MAC40 }, I, bar = false) {
  const a = pow10(0.00269 * (age - 40)), k = bar ? BAR : 1;
  return ((ceP * a) / (7.58 * I * k) + ceS / ((macAt(mac40, age) / STIMULI.incision) * I * k)) * (1 + ceR / (bar ? BAR_OPIOID : 1.36));
}
export const pNo = (u, g) => (u > 0 ? hill(u, g) : 0);
// Bouillon 2004 surface (as transcribed by PAS) [S]
export function bisLike({ ceP, ceS = 0, ceR = 0 }) {
  const u = ceP / 4.47 + ceS / 2.14 + ceR / 19.3;
  return u > 0 ? 97.4 / (1 + pow(u, 1.43)) : 97.4;
}

// the drug levels pd reads from the previous step. The volatile agents enter as one sevoflurane-equivalent
// concentration (their summed MAC fraction x sevoflurane's age MAC), so every agent counts and the formulas below,
// written for sevoflurane, hold unchanged (sevoflurane alone gives exactly its own effect-site level).
function levels(prev) {
  const d = prev.pk.d, ce = id => (d[id] ? d[id].ce : 0), age = prev.patient.age;
  const ceS = prev.vol ? prev.vol.mac * macAt(SEVO_MAC40, age) : 0;
  return { ceP: ce('propofol'), ceR: ceREq(ce('remifentanil'), ce('fentanyl')), ceS, age };
}

export const pd = {
  name: 'pd',
  init(state) {
    return { nmb: readNmb(state.pk && state.pk.nm, state.patient.weightKg), asleep: false, pAsleep: 0, bisLike: 97.4, pNoMove: {}, auto: 0, stim: null };
  },
  step(prev, ctx) {
    const s = prev.pd, t = ctx.t, q = prev.patient.q, L = levels(prev);
    const nmb = readNmb(prev.pk.nm, prev.patient.weightKg);
    const pAsleep = pNo(uHypnosis(L), GAMMA_H);
    const pNoMove = {};
    for (const k in STIMULI) pNoMove[k] = pNo(uStimulus(L, STIMULI[k]), GAMMA_S);
    // stimuli as actions: { type: 'stimulus', kind, level? } (surgery is ongoing until level 0)
    let stim = s.stim;
    for (const a of ctx.actions) {
      if (a.type !== 'stimulus' || !(a.kind in STIMULI)) continue;
      if (a.kind === 'surgery' && a.level === 0) { stim = null; continue; }
      const I = a.kind === 'surgery' && a.level > 0 ? Math.min(1.0, Math.max(0.6, a.level)) : STIMULI[a.kind];
      stim = { kind: a.kind, t0: t, I, ongoing: a.kind === 'surgery' };
      // movement at the onset of a stimulus: the patient's quantile against the population probability, unless
      // paralysed (thumb twitch under 10%) [D]
      const pNoResp = pNo(uStimulus(L, I), GAMMA_S);
      if (pNoResp < q && nmb.t1 > 0.1) ctx.log({ kind: 'movement', stimulus: a.kind });
      ctx.log({ kind: 'stimulus', stimulus: a.kind, pNoResponse: Math.round(pNoResp * 100) / 100 });
    }
    if (stim && !stim.ongoing && t - stim.t0 > BRIEF) stim = null;
    // autonomic drive towards the graded response while a stimulus is present
    const ua = stim ? uStimulus(L, stim.I, true) : 0;
    const target = stim ? 1 / (1 + ua * ua) : 0;
    const tau = target > s.auto ? AUTO_RISE : AUTO_FALL;
    const auto = s.auto + (target - s.auto) * (ctx.dt / tau);
    // BIS-like: arousal adds up to about 8 with a full autonomic response (van den Berg: +3 to +11) [D]
    const bis = Math.min(97.4, bisLike(L) + 8 * auto);
    const asleep = pAsleep > q;
    if (asleep !== s.asleep) ctx.log({ kind: asleep ? 'asleep' : 'awake' });
    return { nmb, asleep, pAsleep, bisLike: bis, pNoMove, auto, stim };
  },
  trend(s) { return { t1: s.nmb.t1, bis: s.bisLike, auto: s.auto }; },
};
