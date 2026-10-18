// Regional anaesthesia app: local anaesthetic dose data and pure dose maths (ENGINE.md backlog item 3).
// No DOM here, so node tests can import it (shared/regional/test/la.test.mjs). The calculator UI is lacalc.js; the page is
// /blocks/safety/#calculator. Block pages link to it from their dose box with doseHref(block.dose).
//
// Maximum doses are single-shot totals for an adult by injection (perineural or infiltration), the conservative
// mainstream values used in UK and European practice. Each agent has a mg/kg maximum (plain and with adrenaline) and an
// absolute ceiling in mg: the maximum for a patient is whichever is lower. They are a ceiling, not a target.
// The mg/kg maxima and the absolute ceilings were confirmed by the owner (Dr Koh Wenjun) on 16 Oct 2026.

/** Agents in the order the calculator lists them. mgPerKg/capMg: [plain, with adrenaline]. */
export const AGENTS = Object.freeze({
  lidocaine: Object.freeze({ id: 'lidocaine', name: 'Lidocaine', mgPerKg: [3, 7], capMg: [200, 500], aliases: ['lignocaine'], strengths: [0.5, 1, 1.5, 2] }),
  bupivacaine: Object.freeze({ id: 'bupivacaine', name: 'Bupivacaine', mgPerKg: [2, 2], capMg: [150, 150], aliases: [], strengths: [0.125, 0.25, 0.5] }),
  levobupivacaine: Object.freeze({ id: 'levobupivacaine', name: 'Levobupivacaine', mgPerKg: [2, 2], capMg: [150, 150], aliases: ['levo-bupivacaine'], strengths: [0.125, 0.25, 0.5] }),
  ropivacaine: Object.freeze({ id: 'ropivacaine', name: 'Ropivacaine', mgPerKg: [3, 3], capMg: [225, 225], aliases: [], strengths: [0.2, 0.375, 0.5, 0.75] }),
  prilocaine: Object.freeze({ id: 'prilocaine', name: 'Prilocaine', mgPerKg: [6, 8], capMg: [400, 600], aliases: [], strengths: [0.5, 1, 2] }),
  chloroprocaine: Object.freeze({ id: 'chloroprocaine', name: 'Chloroprocaine', mgPerKg: [11, 11], capMg: [800, 800], aliases: ['2-chloroprocaine'], strengths: [1, 2, 3] }),
});
export const AGENT_IDS = Object.freeze(Object.keys(AGENTS));

/** Plain-English cautions shown with the calculator (always MO level). */
export const NOTES = Object.freeze([
  'Local anaesthetics are additive: two agents, or two blocks, share one maximum. Add every injection, the surgeon’s infiltration and any other local anaesthetic given in the same period.',
  'In obesity, work the maximum out from lean (or ideal) body weight, not actual weight.',
  'Give less in the elderly and frail, in pregnancy, in liver, kidney or heart disease (including heart failure and conduction problems), and in infants under 6 months.',
  'Absorption is fastest from intercostal and scalp injections, then caudal and epidural, and is high from bilateral plane blocks (TAP, ESP, rectus sheath): stay well below the maximum there, and count what runs through catheters.',
  'Adrenaline raises the maximum for lidocaine and prilocaine only. Here it does not raise it for bupivacaine, levobupivacaine, ropivacaine or chloroprocaine.',
  'The maximum is a ceiling, not a target. Inject slowly in small aliquots, aspirate, and watch for early signs of toxicity.',
]);

/** The formulas, as text for the page (kept next to the code that uses them). */
export const FORMULAS = Object.freeze({
  mg: 'mg = ml × % × 10 (1% is 10 mg/ml)',
  bmi: 'BMI = weight (kg) ÷ height (m)²',
  lbw: 'Lean body weight (Janmahasatian): men 9270 × weight ÷ (6680 + 216 × BMI); women 9270 × weight ÷ (8780 + 244 × BMI)',
  ibw: 'Ideal body weight (Devine): men 50 + 0.91 × (height in cm − 152.4); women 45.5 + 0.91 × (height in cm − 152.4)',
  used: 'Weight used: actual weight; when BMI is 30 or more, lean body weight',
  fraction: 'Fraction of the maximum = sum of (mg given ÷ maximum mg) for each agent; it must stay at or below 1 (100%)',
});

/** BMI at or above which the maximum is worked out from lean body weight. */
export const OBESE_BMI = 30;

const num = (v) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v.trim()) : NaN);
const pos = (v) => { const n = num(v); return Number.isFinite(n) && n > 0 ? n : null; };
/** Round to d decimals (no floating-point tails such as 0.30000000000000004). */
export const round = (x, d = 1) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : null);

/** An agent id from a name or alias ('Ropivacaine', 'lignocaine' → 'lidocaine'), or null. */
export function agentId(name) {
  const s = String(name ?? '').trim().toLowerCase();
  if (!s) return null;
  if (AGENTS[s]) return s;
  return AGENT_IDS.find((id) => AGENTS[id].aliases.includes(s)) || null;
}

/** mg/kg maximum for an agent (plain or with adrenaline), or null for an unknown agent. */
export function maxMgPerKg(agent, withAdrenaline = false) {
  const a = AGENTS[agentId(agent)];
  return a ? a.mgPerKg[withAdrenaline ? 1 : 0] : null;
}

/** Absolute ceiling in mg for an agent, or null. */
export function capMg(agent, withAdrenaline = false) {
  const a = AGENTS[agentId(agent)];
  return a ? a.capMg[withAdrenaline ? 1 : 0] : null;
}

/** Maximum total dose in mg for this weight: min(mg/kg × kg, ceiling). Null for an unknown agent or no weight. */
export function maxMg(agent, kgUsed, withAdrenaline = false) {
  const perKg = maxMgPerKg(agent, withAdrenaline);
  const kg = pos(kgUsed);
  if (perKg == null || kg == null) return null;
  return round(Math.min(perKg * kg, capMg(agent, withAdrenaline)), 1);
}

/** True when the absolute ceiling, not the weight, sets the maximum. */
export function cappedByCeiling(agent, kgUsed, withAdrenaline = false) {
  const perKg = maxMgPerKg(agent, withAdrenaline);
  const kg = pos(kgUsed);
  return perKg != null && kg != null && perKg * kg > capMg(agent, withAdrenaline);
}

/** mg in ml of a percent solution: percent × 10 = mg/ml. Null on bad input. */
export function mgFromMl(ml, percent) {
  const v = num(ml); const p = pos(percent);
  if (!Number.isFinite(v) || v < 0 || p == null) return null;
  return round(v * p * 10, 2);
}

/** ml of a percent solution that holds mg. Null on bad input. */
export function mlForMg(mg, percent) {
  const m = num(mg); const p = pos(percent);
  if (!Number.isFinite(m) || m < 0 || p == null) return null;
  return round(m / (p * 10), 2);
}

/** BMI from kg and cm, or null. */
const rawBmi = (kg, cm) => { const w = pos(kg); const h = pos(cm); return w == null || h == null ? null : w / (h / 100) ** 2; };
export function bmi(kg, cm) { return round(rawBmi(kg, cm), 1); }

const sexOf = (s) => { const x = String(s ?? '').toLowerCase(); return x === 'm' || x === 'male' ? 'male' : x === 'f' || x === 'female' ? 'female' : null; };

/** Lean body weight (Janmahasatian 2005), kg, or null without weight, height and sex. */
export function leanBodyWeight(kg, cm, sex) {
  const w = pos(kg); const b = rawBmi(kg, cm); const s = sexOf(sex);
  if (w == null || b == null || !s) return null;
  const lbw = s === 'male' ? (9270 * w) / (6680 + 216 * b) : (9270 * w) / (8780 + 244 * b);
  return round(Math.min(lbw, w), 1);
}

/** Ideal body weight (Devine), kg, or null without height and sex (and never below 0). */
export function idealBodyWeight(cm, sex) {
  const h = pos(cm); const s = sexOf(sex);
  if (h == null || !s) return null;
  const ibw = (s === 'male' ? 50 : 45.5) + 0.91 * (h - 152.4);
  return ibw > 0 ? round(ibw, 1) : null;
}

/**
 * The weight to work the maximum out from. {kg, cm?, sex?} →
 * {kg: weight used or null, basis: 'actual'|'lean'|null, actual, bmi, lbw, ibw, obese, needsHeight}.
 * Lean body weight is used when BMI ≥ 30 (and it is lower than actual weight, which it always is).
 * needsHeight: weight is high (≥ 100 kg) and there is no height or sex to check for obesity.
 */
export function doseWeight({ kg, cm, sex } = {}) {
  const actual = pos(kg);
  const b = bmi(kg, cm);
  const lbw = leanBodyWeight(kg, cm, sex);
  const ibw = idealBodyWeight(cm, sex);
  const obese = b != null && b >= OBESE_BMI;
  const out = { kg: null, basis: null, actual, bmi: b, lbw, ibw, obese, needsHeight: false };
  if (actual == null) return out;
  if (obese && lbw != null) return { ...out, kg: lbw, basis: 'lean' };
  return { ...out, kg: actual, basis: 'actual', needsHeight: actual >= 100 && (b == null || lbw == null) };
}

/**
 * Combined fraction of the maximum. rows: [{agent, percent, ml, adrenaline} or {agent, mg, adrenaline}].
 * Returns {rows: [{agent, mg, max, fraction, capped} | {…, error}], total, over, valid}. total is the sum of mg ÷ max
 * over the valid rows and must stay ≤ 1. Rows with no agent or no amount are skipped (error says why).
 */
export function combinedFraction(rows, kgUsed) {
  let total = 0; let valid = 0;
  const out = (rows || []).map((r) => {
    const agent = agentId(r?.agent);
    const adr = !!r?.adrenaline;
    if (!agent) return { agent: null, error: 'agent' };
    const mg = r.mg != null && r.mg !== '' ? (Number.isFinite(num(r.mg)) && num(r.mg) >= 0 ? round(num(r.mg), 2) : null) : mgFromMl(r.ml, r.percent);
    const max = maxMg(agent, kgUsed, adr);
    if (max == null) return { agent, mg, error: 'weight' };
    if (mg == null) return { agent, max, error: 'amount' };
    const fraction = mg / max;
    total += fraction; valid += 1;
    return { agent, mg, max, fraction: round(fraction, 4), capped: cappedByCeiling(agent, kgUsed, adr), adrenaline: adr };
  });
  total = round(total, 4) ?? 0;
  return { rows: out, total, over: total > 1, valid };
}

/** Status of a combined fraction: 'over' (> 100%), 'near' (≥ 80%), 'ok', or 'none' (nothing to add up). */
export function fractionStatus(total, valid = 1) {
  if (!valid) return 'none';
  if (total > 1) return 'over';
  if (total >= 0.8) return 'near';
  return 'ok';
}

// ---------------------------------------------------------------- links from block pages (parse-only, never eval)
const LIMITS = { pct: [0.05, 10], ml: [0.1, 200], kg: [0.5, 300] };
const inRange = (v, [lo, hi]) => Number.isFinite(v) && v >= lo && v <= hi;
const NUM = '\\d+(?:\\.\\d+)?';
const RANGE = `(${NUM})(\\s*(?:–|-|to)\\s*${NUM})?`;

/** Plain text of a block's dose data (tags stripped, entities that matter decoded). */
function doseText(d) {
  const raw = d.html != null ? String(d.html) : [d.volume, 'of', d.conc, d.drug, d.per].filter(Boolean).join(' ');
  return raw.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

/**
 * What a block's dose box says, in calculator terms, where it can be read unambiguously:
 * {agent?, pct?, ml?, adr?}. Exactly one agent named → agent; exactly one single strength (not a range) → pct; exactly one
 * single volume in ml (not a range, and no ml/kg dose) → ml. Anything ambiguous is left out. Nothing is evaluated.
 */
export function parseDose(dose) {
  if (!dose || typeof dose !== 'object') return {};
  const text = doseText(dose);
  const lower = text.toLowerCase();
  const found = new Set();
  for (const id of AGENT_IDS) {
    for (const n of [id, ...AGENTS[id].aliases]) {
      // "bupivacaine" must not match inside "levobupivacaine".
      if (new RegExp(`(^|[^a-z-])${n.replace(/[-]/g, '\\-')}([^a-z]|$)`).test(lower)) found.add(id);
    }
  }
  const out = {};
  if (found.size !== 1) return out;
  out.agent = [...found][0];
  const pcts = [...text.matchAll(new RegExp(`${RANGE}\\s*%`, 'g'))];
  if (pcts.length === 1 && !pcts[0][2]) { const p = Number(pcts[0][1]); if (inRange(p, LIMITS.pct)) out.pct = p; }
  const mls = [...text.matchAll(new RegExp(`${RANGE}\\s*ml\\b(?!\\s*\\/)`, 'gi'))];
  // A weight-based volume (ml/kg) has no one volume to fill in.
  if (mls.length === 1 && !mls[0][2] && !/ml\s*\/\s*kg/i.test(text)) { const v = Number(mls[0][1]); if (inRange(v, LIMITS.ml)) out.ml = v; }
  const adrText = `${text} ${dose.note || ''}`.toLowerCase();
  if (/\bwith adrenaline\b|\badrenaline 1\s*:\s*\d/.test(adrText) && !/without adrenaline/.test(adrText)) out.adr = true;
  return out;
}

/** Query string for the calculator from a block's dose data ('' when nothing can be read safely). */
export function doseQuery(dose) {
  const p = parseDose(dose);
  const q = new URLSearchParams();
  if (p.agent) q.set('agent', p.agent);
  if (p.pct != null) q.set('pct', String(p.pct));
  if (p.ml != null) q.set('ml', String(p.ml));
  if (p.adr) q.set('adr', '1');
  return q.toString();
}

/**
 * Read the calculator's URL query (?agent=ropivacaine&pct=0.375&ml=20&adr=1&kg=70). Every value is checked against a
 * whitelist or a numeric range; anything else is dropped. Returns {agent?, pct?, ml?, adr?, kg?}.
 */
export function parseQuery(search) {
  let q;
  try { q = new URLSearchParams(typeof search === 'string' ? search : ''); } catch { return {}; }
  const out = {};
  const agent = agentId(q.get('agent'));
  if (agent) out.agent = agent;
  const n = (k) => { const s = q.get(k); return s != null && /^\s*\d+(?:\.\d+)?\s*$/.test(s) ? Number(s) : NaN; };
  if (inRange(n('pct'), LIMITS.pct)) out.pct = n('pct');
  if (inRange(n('ml'), LIMITS.ml)) out.ml = n('ml');
  if (inRange(n('kg'), LIMITS.kg)) out.kg = n('kg');
  if (/^(1|true|yes)$/i.test(q.get('adr') || '')) out.adr = true;
  return out;
}
