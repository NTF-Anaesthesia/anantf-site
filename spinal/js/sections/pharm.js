// Pharmacology chapter (prefix ph-): local anaesthetics, baricity, adjuvants, vasopressors and vagolytics,
// LAST theory, TNS. It owns the "why". Steps for emergencies live in Troubleshooting and Complications.
// Doses: only those already on the page (product labels, PROSPECT, QRH). No new doses are introduced here.
import { el, cite, callout, table, tier, keyPoints, details, registerSearch } from '../ui.js?v=1';

export const meta = { id: 'pharm', prefix: 'ph', title: 'Pharmacology' };

export const refs = {
  'ph-kinsella2018': {
    label: 'Kinsella 2018',
    text: 'Kinsella SM, Carvalho B, Dyer RA, Fernando R, McDonnell N, Mercier FJ, et al. International consensus statement on the management of hypotension with vasopressors during caesarean section under spinal anaesthesia. <i>Anaesthesia</i> 2018;73:71–92.',
    url: 'https://doi.org/10.1111/anae.14080',
  },
  'ph-aagbi-last2010': {
    label: 'AAGBI 2010',
    text: 'Association of Anaesthetists of Great Britain and Ireland. AAGBI Safety Guideline: Management of severe local anaesthetic toxicity. London: AAGBI; 2010. (The current Association of Anaesthetists LAST card is cited in Complications.)',
    url: 'https://rcoa.ac.uk/sites/default/files/documents/2019-09/Guideline_management_severe_local_anaesthetic_toxicity_v2_2010_final.pdf',
  },
};

const D = (s) => `<span class="sp-dose">${s}</span>`;
const P = (html, cls = 'sp-prose') => el('p', { class: cls, html });
const UL = (items) => el('ul', { class: 'ph-list' }, ...items.map((h) => el('li', { html: h })));
const T = (node, n) => tier(node, n);

/** A sub-heading block: <div class="ph-sub" id> with an h3. */
function sub(id, title, ...kids) {
  const d = el('div', { class: 'ph-sub', id });
  d.append(el('h3', { text: title }), ...kids);
  return d;
}

// ---------------------------------------------------------------- 1. local anaesthetics
function laBasics() {
  const props = table({
    caption: 'What each property of a local anaesthetic decides',
    head: ['Property', 'What it decides', 'Example'],
    rows: [
      [{ th: true, html: 'pKa (how much is unionised at pH 7.4)' }, 'Onset. The unionised base crosses the nerve sheath and membrane; the lower the pKa, the more is unionised at body pH, so the faster the onset.', 'Lidocaine and prilocaine (pKa about 7.9) start faster than bupivacaine (about 8.1). Chloroprocaine has a high pKa (about 8.7) yet is fast: it is given in a high concentration, so many molecules are unionised.'],
      [{ th: true, html: 'Lipid solubility' }, 'Potency. A lipid-soluble drug crosses the membrane easily and sits in the lipid around the channel, so less is needed. It also slows clearance from the site.', 'Bupivacaine is far more lipid soluble and potent than lidocaine; ropivacaine is less lipid soluble than bupivacaine.'],
      [{ th: true, html: 'Protein binding' }, 'Duration at the nerve. The more tightly the drug binds to tissue and channel, the longer it stays. Plasma binding (alpha-1 acid glycoprotein) also limits free drug in the blood.', 'Bupivacaine, levobupivacaine and ropivacaine are highly bound (over 90%) and long acting; prilocaine and chloroprocaine are lightly bound and short acting.'],
      [{ th: true, html: 'Molecular size and structure' }, 'Ester or amide link: allergy and how the drug is broken down (below).', 'Chloroprocaine is an ester; the rest in this chapter are amides.'],
    ],
  });
  const estAm = table({
    caption: 'Esters and amides',
    head: ['', 'Ester', 'Amide'],
    rows: [
      [{ th: true, html: 'Intrathecal examples' }, 'Chloroprocaine (also procaine, tetracaine)', 'Bupivacaine, levobupivacaine, ropivacaine, prilocaine, lidocaine'],
      [{ th: true, html: 'Breakdown' }, 'Fast hydrolysis by plasma cholinesterase (and tissue esterases). Short half-life.', 'Liver (cytochrome P450). Longer half-life; accumulates in liver failure and low cardiac output.'],
      [{ th: true, html: 'Allergy' }, 'Breakdown gives para-aminobenzoic acid (PABA). True allergy is uncommon but more likely than with amides, and cross-reacts among esters.', 'True allergy is rare. Most “reactions” are fainting, adrenaline in the mix, or anxiety. Preservatives (methyl paraben, metabisulphite) are another cause, which is one reason spinal solutions are preservative-free.'],
      [{ th: true, html: 'Other' }, 'Cholinesterase deficiency prolongs the effect of systemic doses.', 'Prilocaine is broken down to o-toluidine, which can cause dose-related methaemoglobinaemia.'],
    ],
  });
  return sub('ph-la', 'Local anaesthetics: how they work',
    T(P('<strong>Mechanism.</strong> Local anaesthetics block the voltage-gated sodium channel from the inside of the axon. The unionised base crosses the membrane; the ionised form is what binds the channel. No sodium entry means no depolarisation and no conducted impulse. They bind most to channels that are open or inactivated, so a rapidly firing nerve is blocked first (use-dependence).'), 1),
    T(P('<strong>Why a spinal dose is so small.</strong> The drug is deposited next to the nerve roots and cord surface in CSF. CSF has almost no protein to bind the drug and almost no blood flow to carry it away, so a few millilitres give a dense block. Most of the dose is later cleared by uptake into the epidural fat and the vascular bed around the cord and roots. See <a href="#an-csf">CSF and baricity</a> for the physiology.'), 1),
    T(props, 2),
    T(P('<strong>Differential block.</strong> Small, thinly myelinated fibres (autonomic B fibres, then pain and temperature) are blocked at lower concentrations than large motor fibres. This is why the sympathetic block is highest, then cold, pinprick, touch and motor. Block order is taught in <a href="#an-differential">Anatomy</a>.'), 2),
    T(estAm, 2),
    T(callout('pearl', { title: 'Chirality', body: '<p>Bupivacaine is a racemic mixture. Levobupivacaine is the pure S(−) enantiomer and ropivacaine is a pure S(−) drug with a shorter side chain. The S forms bind less strongly to cardiac sodium channels, so they cause less cardiac and CNS toxicity at equal doses. Ropivacaine is also less lipid soluble, so it tends to give relatively less motor block than bupivacaine.</p>' }), 3));
}

// ---------------------------------------------------------------- 2. agents table
function agents() {
  const t = table({
    caption: 'Local anaesthetics used intrathecally',
    head: ['Drug', 'Dose', 'Onset and duration', 'Character', 'Watch for'],
    rows: [
      [{ th: true, html: 'Hyperbaric bupivacaine 0.5%' },
        `<strong>Typical:</strong> knee replacement ${D('2.5 mL')} (${D('12.5 mg')}); shorter lower-limb surgery about ${D('2 mL')} (${D('10 mg')}); caesarean ${D('2.2–2.3 mL')} (${D('11–11.5 mg')}).`,
        `Onset ${D('5–8 min')}; ${D('1.5–3 h')}. Intermediate to long.`,
        'The usual choice. Predictable spread with glucose. Reduce the dose in older patients.',
        'High block from too much dose; hypotension.'],
      [{ th: true, html: 'Plain (isobaric) bupivacaine 0.5%' },
        `<strong>Typical:</strong> hip surgery, including frail hip fracture, ${D('2.5–3 mL')} (${D('12.5–15 mg')}). ${D('3 mL')} is the most, for an operation that needs a long block.`,
        `Onset slower than hyperbaric; ${D('3–4 h')} for lower-limb surgery.`,
        'Slightly hypobaric at body temperature, so spread is less predictable. Block stays more at the injection level.',
        'Longer block and slower regression; spread varies with posture.'],
      [{ th: true, html: 'Levobupivacaine' },
        'No dose is given here.',
        'Similar to bupivacaine; slightly less potent and slightly shorter in trials.',
        'Pure S(−) enantiomer of bupivacaine. Intrathecal use is off-label in many places (the licence is for epidural and peripheral use). Safer systemically than bupivacaine.',
        'As for bupivacaine.'],
      [{ th: true, html: 'Ropivacaine' },
        'No dose is given here.',
        'Less potent than bupivacaine; shorter, with relatively less motor block.',
        'Off-label intrathecally. Less lipid soluble. Useful in research for short, motor-sparing blocks; not a mainstream spinal drug.',
        'Higher failure risk if the dose is too low.'],
      [{ th: true, html: 'Prilocaine 2% hyperbaric' },
        `${D('40–60 mg')} (${D('2–3 mL')}) for a block to T10; maximum ${D('80 mg')}${cite('tq-prilotekal')}`,
        `Short. About ${D('100–130 min')}.`,
        'Day-case drug. Amide. Low TNS risk.',
        'Dose-related methaemoglobinaemia with large systemic doses; not a problem at spinal doses.'],
      [{ th: true, html: 'Chloroprocaine 1%' },
        `${D('40–50 mg')} (${D('4–5 mL')}); maximum ${D('50 mg')}${cite('tq-ampres')}`,
        `Onset about ${D('8–10 min')}; about ${D('80–100 min')}.`,
        `Ester. Fast on, fast off. Licensed for surgery expected to last no more than ${D('40 min')}.${cite('tq-ampres')}`,
        'Needs the preservative-free spinal product; the epidural vials are not for intrathecal use.'],
      [{ th: true, html: 'Lidocaine' },
        'Not recommended: no dose given.',
        'Fast on, short.',
        'Highest risk of transient neurological symptoms (below).',
        'TNS; cauda equina syndrome in the 1990s with continuous spinal microcatheters.'],
    ],
  });
  return sub('ph-agents', 'Intrathecal agents at a glance',
    T(P('<strong>Answer first:</strong> for most lower-limb and hip surgery use hyperbaric bupivacaine 0.5%. For brief day-case surgery use hyperbaric prilocaine or chloroprocaine. Do not use lidocaine if an alternative exists.'), 1),
    T(t, 1),
    T(P('Bupivacaine doses are this department’s typical doses; prilocaine and chloroprocaine show the label dose. Details in <a href="#tq-drugs">Drugs and doses</a>. Position, dose and patient factors change spread: see <a href="#tq-spread-h">what decides spread</a>.', 'sp-prose ph-note'), 1),
    T(callout('pearl', { title: 'Compare bupivacaine and ropivacaine', body: '<ul><li>Same long-acting amide family; ropivacaine is the S enantiomer with a shorter side chain.</li><li>Ropivacaine: less lipid soluble, less potent, less cardiotoxic, relatively less motor block and a shorter block.</li><li>Bupivacaine is the standard spinal drug because its dose-response and hyperbaric preparation are well established.</li></ul>' }), 2));
}

// ---------------------------------------------------------------- 3. baricity
function baricity() {
  const t = table({
    caption: 'Baricity of an intrathecal solution',
    head: ['Solution', 'Density against CSF', 'Behaviour at 37 °C', 'Example'],
    rows: [
      [{ th: true, html: 'Hyperbaric' }, 'Higher', 'Sinks to the lowest point under gravity. Most predictable.', 'Bupivacaine, prilocaine with glucose'],
      [{ th: true, html: 'Isobaric' }, 'Same', 'Stays near the injection site. Spread depends more on dose and volume.', 'Plain levobupivacaine; in theory plain bupivacaine'],
      [{ th: true, html: 'Hypobaric' }, 'Lower', 'Floats to the highest point. Used mainly with the operative side uppermost.', 'Plain bupivacaine is slightly hypobaric at body temperature; diluted solutions'],
    ],
  });
  return sub('ph-baricity', 'Baricity: the pharmacy of spread',
    T(P(`<strong>Baricity</strong> is the density of the solution divided by the density of CSF, both at ${D('37 °C')}. CSF density is about ${D('1.0003 g/mL')}, a little lower in pregnancy. The animation and posture rules are in <a href="#an-fig-baricity">Anatomy</a>.`), 1),
    T(t, 2),
    T(UL([
      '<strong>Making it hyperbaric.</strong> Add glucose. Marcain Heavy contains glucose 80 mg/mL, which raises the density clearly above CSF.',
      '<strong>Temperature.</strong> Density falls as temperature rises. Baricity is judged at body temperature because the solution warms within seconds in the CSF. A solution that seemed isobaric at room temperature is slightly hypobaric at 37 °C. This is why plain bupivacaine misbehaves.',
      '<strong>Additives.</strong> Opioids and other additives are given in tiny volumes, so a hyperbaric solution stays hyperbaric. Diluting a plain solution with saline or CSF makes it more hypobaric.',
      '<strong>Practical rule.</strong> Choose the solution, then use posture (sitting or lateral, then supine) to place it. Tilt only on purpose.',
    ]), 2),
    T(callout('pearl', { title: 'Why “isobaric” spinals are variable', body: '<p>Patients differ in CSF density, and the solution density changes with temperature, so a truly isobaric solution is hard to make for everyone. Small variations in baricity then act as a weak gravity effect on top of a dose-driven spread, which explains the scatter in block height.</p>' }), 3));
}

// ---------------------------------------------------------------- 4. adjuvants
function opioids() {
  const t = table({
    caption: 'Intrathecal opioids compared',
    head: ['', 'Fentanyl', 'Diamorphine', 'Morphine'],
    rows: [
      [{ th: true, html: 'Lipid solubility' }, 'High (lipophilic)', 'High; becomes morphine and 6-monoacetylmorphine in the CSF and cord', 'Low (hydrophilic)'],
      [{ th: true, html: 'Onset' }, 'Fast (minutes)', 'Intermediate', 'Slow'],
      [{ th: true, html: 'Duration of analgesia' }, 'Short (a few hours)', 'Longer (many hours)', 'Longest (many hours, up to a day)'],
      [{ th: true, html: 'Spread in CSF' }, 'Stays near the site: segmental. Taken up quickly by the cord and epidural fat.', 'Intermediate', 'Spreads rostrally with CSF flow, so reaches the brainstem'],
      [{ th: true, html: 'Respiratory depression' }, 'Early only (first hour or so)', 'Early and delayed', 'Delayed as well as early: peak risk several hours after injection'],
      [{ th: true, html: 'Common side-effects' }, 'Itch, mild sedation', 'Itch, nausea and vomiting, urinary retention', 'Itch, nausea and vomiting, urinary retention, sedation'],
    ],
  });
  const mon = el('div', { class: 'ph-mon' });
  mon.append(callout('warn', {
    title: 'Monitoring after intrathecal opioid',
    body: `<ul>
      <li><strong>Fentanyl:</strong> at least ${D('2 h')}: continually for the first ${D('20 min')}, then at least hourly to ${D('2 h')}.</li>
      <li><strong>Morphine:</strong> at least ${D('24 h')}: at least hourly for ${D('12 h')}, then at least every ${D('2 h')} to ${D('24 h')}. Breathing rate and depth, oxygenation and sedation. Keep oxygen and naloxone available.</li>
      <li>Not for day-case patients going home the same day. No extra sedatives or opioids without checking.</li>
    </ul><p>Follows the ASA neuraxial opioid practice guidance.${cite('tq-asa2016')} Itch, nausea and retention: <a href="#ts-pruritus">Itch</a>, <a href="#ts-nausea">Nausea</a>, <a href="#ts-retention">Retention</a>.</p>`,
  }));
  return [
    T(P('<strong>Mechanism.</strong> Opioids act on mu receptors in the substantia gelatinosa of the dorsal horn (before and after the synapse), so they give analgesia without motor, sensory or sympathetic block. Because of this, they add to a spinal without changing the height of the block. The side-effects follow the drug into the CSF and up to the brainstem.'), 1),
    T(t, 2),
    T(mon, 1),
    T(UL([
      '<strong>Why morphine is dangerous late.</strong> Being hydrophilic, it stays in the CSF, which carries it up to the brainstem respiratory centres hours later. Fentanyl leaves the CSF in minutes, so its risk is early.',
      '<strong>Itch</strong> is mediated by mu receptors, not histamine; antihistamines mainly sedate. <strong>Retention</strong> comes from detrusor suppression at the sacral cord.',
      `<strong>Dose.</strong> PROSPECT says low-dose intrathecal morphine ${D('100 microgram')} (${D('0.1 mg')}) may be considered with a spinal for hip replacement, but stresses its side-effects and that good analgesia is possible without it. No other opioid doses are given here.`,
    ]), 2),
  ];
}

function otherAdjuvants() {
  const t = table({
    caption: 'Other intrathecal additives',
    head: ['Additive', 'Mechanism', 'Effect', 'Problems', 'Status'],
    rows: [
      [{ th: true, html: 'Clonidine' }, 'Alpha-2 agonist. Acts on the dorsal horn; also slows nerve conduction by blocking the hyperpolarisation-activated current in the axon.', 'Longer sensory and motor block and more analgesia.', 'Hypotension, bradycardia, sedation.', 'Used in some centres; no dose given here.'],
      [{ th: true, html: 'Dexmedetomidine' }, 'More selective alpha-2 agonist than clonidine (about 8 times).', 'Longer block and analgesia; sedation without respiratory depression.', 'Bradycardia and hypotension.', 'Off-label; no dose given here.'],
      [{ th: true, html: 'Adrenaline' }, 'Alpha-agonist vasoconstrictor slows the drug leaving the CSF and cord; also adds a spinal alpha-2 effect.', 'Prolongs the block a little, mainly with tetracaine or lidocaine.', 'Theoretical spinal cord ischaemia, preservatives in the ampoule, little effect with bupivacaine.', 'Rarely used.'],
      [{ th: true, html: 'Neostigmine' }, 'Blocks acetylcholinesterase and raises spinal acetylcholine, a source of analgesia.', 'Analgesia in studies.', 'Severe nausea and vomiting, bradycardia.', 'Historical; not used.'],
    ],
  });
  return [
    T(t, 3),
    T(callout('warn', { title: 'Preservative-free only', body: '<p>Only drugs made for intrathecal use, without preservatives or antioxidants, go into the CSF. Ketamine and midazolam have neurotoxicity concerns and are not recommended intrathecally.</p>' }), 2),
  ];
}

function adjuvants() {
  return sub('ph-adjuvants', 'Adjuvants: intrathecal opioids and others', ...opioids(), ...otherAdjuvants());
}

// ---------------------------------------------------------------- 5. vasopressors
function vasopressors() {
  const t = table({
    caption: 'Vasopressors and vagolytics used with a spinal',
    head: ['Drug', 'Receptors', 'HR and CO', 'Adult IV dose (label)', 'Notes'],
    rows: [
      [{ th: true, html: 'Phenylephrine' }, 'Pure alpha-1 agonist', 'Raises SVR and venous tone; HR falls (reflex), CO may fall with larger doses', `${D('50–100 µg')} bolus, repeated; no single bolus over ${D('100 µg')}${cite('ts-smpc-phe')}`, 'First choice for obstetric spinals. Avoid when the heart rate is already low.'],
      [{ th: true, html: 'Ephedrine' }, 'Indirect (releases noradrenaline) plus direct alpha and beta', 'HR and CO rise; SVR rises a little', `${D('3–6 mg')} slow IV (maximum ${D('9 mg')} per dose), repeated every 3–4 min up to ${D('30 mg')}${cite('ts-smpc-eph')}`, 'Treats low pressure with a slow heart. Tachyphylaxis with repeats. Crosses the placenta: more fetal acidosis than phenylephrine.'],
      [{ th: true, html: 'Metaraminol' }, 'Mainly alpha-1, some indirect action', 'Raises SVR; HR falls or stays; CO may fall', `One bolus should usually not exceed ${D('1 mg')}; label maximum by repeated bolus ${D('5 mg')}${cite('ts-smpc-met')}`, 'Like phenylephrine but lasts longer.'],
      [{ th: true, html: 'Noradrenaline' }, 'Alpha-1 with some beta-1', 'Raises SVR and keeps HR and CO better than phenylephrine', 'Usually an infusion; no dose given here.', 'Alternative to phenylephrine in the obstetric consensus. Low-dose peripheral infusion is used in some centres.'],
      [{ th: true, html: 'Atropine' }, 'Muscarinic antagonist (tertiary amine)', 'HR rises quickly', `${D('0.5 mg')} IV, repeated every 2–5 min to effect${cite('ts-smpc-atr')}`, 'Crosses the blood–brain barrier: confusion in the elderly. Larger high-spinal doses are in the <a href="#ts-high-spinal">high spinal tree</a>.'],
      [{ th: true, html: 'Glycopyrronium' }, 'Muscarinic antagonist (quaternary amine)', 'HR rises, slower onset than atropine', `${D('200–400 µg')} IV, may be repeated${cite('ts-smpc-gly')}`, 'Does not cross the blood–brain barrier or much of the placenta; less tachycardia.'],
    ],
  });
  return sub('ph-pressors', 'Vasopressors and vagolytics',
    T(P(`<strong>Why the pressure falls.</strong> Sympathetic block dilates veins (less venous return) and arterioles (lower SVR). If the block reaches T1–T4, cardiac accelerator fibres are blocked as well, and the heart slows. Read <a href="#ts-hypotension">Hypotension</a> and the <a href="#ts-doses">dose table</a> for treatment steps.`), 1),
    T(t, 1),
    T(P('<strong>Rules of thumb.</strong> Low pressure with a normal or fast heart: an alpha agonist (phenylephrine or metaraminol). Low pressure with a slow heart: ephedrine, or atropine or glycopyrronium. Treat early, in small steps, and look for other causes.', 'sp-prose ph-note'), 1),
    T(UL([
      '<strong>Prophylaxis.</strong> Fluid co-load alone is a weak shield. Starting a vasopressor infusion with the block, titrated to the pressure, prevents hypotension better than waiting for it. The international consensus for caesarean section recommends a variable-rate phenylephrine infusion and treats noradrenaline as an alternative.' + cite('ph-kinsella2018'),
      '<strong>Targets.</strong> The consensus aims to keep systolic pressure at or near baseline (no lower than 80% of baseline).' + cite('ph-kinsella2018'),
      '<strong>Why phenylephrine is not first choice for a slow heart.</strong> It raises SVR, and the baroreceptor reflex then slows the heart further. In a patient already slow, the cardiac output can fall.',
      '<strong>Why ephedrine fades.</strong> Its indirect action depletes noradrenaline stores in nerve terminals, so repeated doses work less.',
    ]), 2),
    T(callout('pearl', { title: 'Atropine versus glycopyrronium', body: '<p>Glycopyrronium has a quaternary ammonium structure, so it is fully charged and crosses the blood–brain barrier and placenta poorly. It causes less tachycardia and fewer central effects than atropine, but the onset is slower. A fast heart rate is not always wanted in a patient with ischaemic heart disease or aortic stenosis.</p>' }), 3),
  );
}

// ---------------------------------------------------------------- 6. LAST
function lastTheory() {
  const t = table({
    caption: 'Local anaesthetic systemic toxicity: what you see',
    head: ['System', 'Early', 'Severe'],
    rows: [
      [{ th: true, html: 'Central nervous system' }, 'Perioral numbness, metallic taste, tinnitus, light-headedness, agitation', 'Sudden change in mental status, severe agitation, convulsions, loss of consciousness'],
      [{ th: true, html: 'Cardiovascular' }, 'Hypertension and tachycardia (CNS stimulation)', 'Bradycardia, conduction block, ventricular arrhythmia, asystole'],
    ],
  });
  return sub('ph-last', 'Local anaesthetic systemic toxicity (LAST): the theory',
    T(callout('key', { title: 'Where the steps are', body: '<p>This section explains why LAST happens. The emergency steps, lipid doses and total-dose limits are in <a href="#cx-last">Complications</a>. A spinal alone rarely causes LAST. The risk is a block given beside it.</p>' }), 1),
    T(P('<strong>Mechanism.</strong> Local anaesthetic in the blood blocks sodium channels throughout the body. In the brain it first blocks inhibitory neurones, so the early signs are excitation and convulsions; then it blocks all activity, giving coma and apnoea. In the heart it slows conduction (wide QRS, heart block), causes re-entrant arrhythmias and depresses contractility.'), 2),
    T(t, 2),
    T(UL([
      '<strong>Bupivacaine</strong> comes off cardiac sodium channels slowly (“fast in, slow out”), so conduction block builds up with each beat. The dose that causes collapse is close to the dose that causes convulsions; the cardiovascular signs can come first.',
      '<strong>Risk factors:</strong> large dose, very vascular site, accidental intravenous injection, extremes of age, low body weight, heart, liver or kidney disease, acidosis, hypoxia and hypercapnia.',
      '<strong>Mitochondria.</strong> Local anaesthetics also inhibit mitochondrial fatty-acid transport and energy production in heart muscle, which adds to cardiac depression.',
    ]), 2),
    T(P('<strong>Lipid rescue.</strong> Several mechanisms are proposed. A “lipid sink” draws lipid-soluble drug from the tissues into the plasma lipid. Lipid also helps the heart use fatty acids and has a direct inotropic effect. Lipid emulsion is not replaced by propofol (the Association of Anaesthetists guideline).' + cite('ph-aagbi-last2010')), 3),
  );
}

// ---------------------------------------------------------------- 7. TNS
function tns() {
  return sub('ph-tns', 'Transient neurological symptoms (TNS)',
    T(P(`<strong>Answer first:</strong> lidocaine is the main drug linked to TNS: pain in the buttocks and legs that appears after the block has worn off, with normal power and sensation. It settles with NSAIDs and reassurance. Any objective deficit means it is not TNS. Numbers, risk factors and treatment are in <a href="#cx-tns">Complications</a>.`), 1),
    T(UL([
      '<strong>Drug.</strong> Lidocaine carries the most risk; bupivacaine, levobupivacaine, prilocaine and ropivacaine have a much lower risk. This is why lidocaine is avoided for spinals when an alternative exists.',
      '<strong>Mechanism.</strong> Not fully understood. A direct toxic effect from a high local concentration is the leading idea. The risk is higher in lithotomy, which stretches the lumbosacral roots, and in day-case surgery, where patients walk early.',
      '<strong>Cauda equina syndrome.</strong> Continuous spinal anaesthesia through small microcatheters with hyperbaric 5% lidocaine caused cauda equina syndrome in the early 1990s. Poor mixing left a high concentration pooled around the sacral roots.',
    ]), 3),
  );
}

// ---------------------------------------------------------------- viva
function viva() {
  return details({
    id: 'ph-viva',
    summary: 'Viva prompts: model answers in a line',
    body: `<ul class="ph-list">
      <li><strong>Why is the spinal dose small?</strong> The drug sits in CSF next to the nerve roots with little protein binding and no dilution by blood flow.</li>
      <li><strong>What decides onset, potency and duration?</strong> pKa, lipid solubility and protein binding.</li>
      <li><strong>Hyperbaric versus plain bupivacaine?</strong> Glucose makes the solution sink with gravity, so spread is more predictable. Plain bupivacaine is slightly hypobaric at 37 °C.</li>
      <li><strong>Morphine versus fentanyl intrathecally?</strong> Morphine is hydrophilic: slow, long and rostral, with delayed respiratory depression. Fentanyl is lipophilic: fast, short, early depression only.</li>
      <li><strong>Which vasopressor for a spinal in a bradycardic patient?</strong> Ephedrine, or a vagolytic, not phenylephrine alone.</li>
      <li><strong>Why avoid lidocaine?</strong> Transient neurological symptoms.</li>
    </ul>`,
  });
}

// ---------------------------------------------------------------- mount
export function mount(root) {
  try {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = new URL('../../css/pharm.css?v=1', import.meta.url).href;
    document.head.append(css);
  } catch { /* the chapter still reads without its stylesheet */ }

  root.classList.add('ph');
  root.append(
    keyPoints([
      'Hyperbaric bupivacaine 0.5% is the usual spinal drug. Prilocaine or chloroprocaine suit short day-case surgery. Avoid lidocaine: it causes transient neurological symptoms.',
      'Onset follows pKa (and concentration), potency follows lipid solubility, duration follows protein binding and the dose.',
      'Baricity is the density of the solution against CSF at 37 °C. Glucose makes it hyperbaric. Plain bupivacaine is slightly hypobaric.',
      'Fentanyl acts fast and briefly; morphine is slow, long and can depress breathing many hours later. Monitor after intrathecal morphine for at least 24 h.',
      'Low pressure with a fast or normal heart: phenylephrine or metaraminol. Low pressure with a slow heart: ephedrine, atropine or glycopyrronium.',
      'LAST is rare with a spinal alone. Bupivacaine is the dangerous drug because it leaves cardiac sodium channels slowly. Steps and lipid doses are in Complications.',
    ]),
    P('What the drugs do and why: local anaesthetics, baricity, additives, vasopressors, and toxicity. For doses and technique use <a href="#tq-drugs">Drugs and doses</a>.', 'sp-lead'),
    el('ul', { class: 'sp-jump', html: '<li><a href="#ph-agents">Agents at a glance</a></li><li><a href="#ph-la">How they work</a></li><li><a href="#ph-baricity">Baricity</a></li><li><a href="#ph-adjuvants">Adjuvants</a></li><li><a href="#ph-pressors">Vasopressors</a></li><li><a href="#ph-last">LAST</a></li><li><a href="#ph-tns">TNS</a></li>' }),
    agents(),
    laBasics(),
    baricity(),
    adjuvants(),
    vasopressors(),
    lastTheory(),
    tns(),
    T(viva(), 2),
  );

  registerSearch([
    { title: 'Epinephrine (adrenaline) as an intrathecal additive', text: 'Adrenaline epinephrine vasoconstrictor prolongs block', id: 'ph-adjuvants' },
    { title: 'Norepinephrine (noradrenaline) infusion for spinal hypotension', text: 'Noradrenaline norepinephrine alpha-1 infusion', id: 'ph-pressors' },
    { title: 'Intralipid (lipid emulsion) for local anaesthetic toxicity', text: 'Intralipid lipid rescue lipid sink LAST mechanism', id: 'ph-last' },
    { title: 'Diamorphine (heroin) intrathecal', text: 'Diamorphine heroin intrathecal opioid', id: 'ph-adjuvants' },
  ]);
}
