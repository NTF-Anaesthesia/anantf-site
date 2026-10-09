// 02 Performing a spinal, step by step.
// Doses: only from product labels (SmPC / Singapore NDF) listed in `refs` below.
// ASRA 2025 anticoagulation values were read in the full text (Kopp 2025).
// Tiers: 1 MO, 2 Resident, 3 Advanced (see ../TIERS.md). Citations: major guidelines only; labels only in dose lines.
import { el, cite, callout, steps, table, tabs, segmented, figure, details, onResize, whenVisible, tier, keyPoints } from '../ui.js?v=1';
import { sittingSvg, lateralSvg, approachSvg, needlesSvg, timelineSvg } from '../technique/figures.js';
import { anticoagLookup, anticoagTable, checklist, spreadFactors, blockCheck } from '../technique/widgets.js';

export const meta = { id: 'technique', prefix: 'tq', title: 'Performing a spinal, step by step' };

// Module refs: product labels (dose lines) and the guidelines named in the text.
export const refs = {
  'tq-hpra-heavy': {
    label: 'Marcain Heavy SmPC',
    text: 'Aspen. Marcain Heavy Steripack 0.5% w/v solution for injection (hyperbaric bupivacaine): summary of product characteristics. Dublin: Health Products Regulatory Authority; revised 8 August 2022.',
    url: 'https://assets.hpra.ie/products/Human/29214/Licence_PA1691-024-003_08082022090408.pdf',
  },
  'tq-sg-heavy': {
    label: 'Marcain Spinal Heavy (SG)',
    text: 'Marcain Spinal 0.5% Heavy injection (SIN05681P): product information. National Drug Formulary, Singapore. Accessed October 2026.',
    url: 'https://www.ndf.gov.sg/about-drugs/product-information/SIN05681P/',
  },
  'tq-sg-plain': {
    label: 'Marcain 0.5% (SG)',
    text: 'Marcain Injection 0.5% (SIN13211P): product information, spinal (isobaric) use. National Drug Formulary, Singapore. Accessed October 2026.',
    url: 'https://www.ndf.gov.sg/about-drugs/product-information/SIN13211P/',
  },
  'tq-prilotekal': {
    label: 'Prilotekal SmPC',
    text: 'Prilotekal 20 mg/ml solution for injection (hyperbaric prilocaine hydrochloride): summary of product characteristics. Electronic medicines compendium (emc).',
    url: 'https://www.medicines.org.uk/emc/product/15160/smpc/print',
  },
  'tq-ampres': {
    label: 'Ampres SmPC',
    text: 'B. Braun. Ampres 10 mg/ml solution for injection (chloroprocaine hydrochloride): summary of product characteristics. Electronic medicines compendium (emc); updated October 2023.',
    url: 'https://www.medicines.org.uk/emc/product/15158/smpc/print',
  },
  'tq-klein2021': {
    label: 'Klein 2021',
    text: 'Klein AA, Meek T, Allcock E, Cook TM, Mincher N, Morris C, et al. Recommendations for standards of monitoring during anaesthesia and recovery 2021: guideline from the Association of Anaesthetists. <i>Anaesthesia</i> 2021;76:1212–23.',
    url: 'https://doi.org/10.1111/anae.15501',
  },
  'tq-campbell2014': {
    label: 'Campbell 2014',
    text: 'Association of Anaesthetists of Great Britain and Ireland, Obstetric Anaesthetists’ Association, Regional Anaesthesia UK, Association of Paediatric Anaesthetists of Great Britain and Ireland; Campbell JP, Plaat F, Checketts MR, et al. Safety guideline: skin antisepsis for central neuraxial blockade. <i>Anaesthesia</i> 2014;69:1279–86.',
    url: 'https://doi.org/10.1111/anae.12844',
  },
  'tq-asa2016': {
    label: 'ASA/ASRA 2016',
    text: 'American Society of Anesthesiologists Task Force on Neuraxial Opioids; American Society of Regional Anesthesia and Pain Medicine. Practice guidelines for the prevention, detection, and management of respiratory depression associated with neuraxial opioid administration: an updated report. <i>Anesthesiology</i> 2016;124:535–52.',
    url: 'https://doi.org/10.1097/ALN.0000000000000975',
  },
};

const D = (s) => `<span class="sp-dose">${s}</span>`;
const N = (s) => `<span class="sp-num">${s}</span>`;
const T = tier;

// Parts in page order. The number shown in each heading comes from this order.
const PARTS = [
  ['tq-consent', 'Indications and consent'],
  ['tq-preop', 'Pre-op assessment checklist'],
  ['tq-contra', 'Contraindications'],
  ['tq-anticoag', 'Anticoagulants'],
  ['tq-prep', 'Preparation'],
  ['tq-position', 'Position'],
  ['tq-asepsis', 'Asepsis'],
  ['tq-approach', 'Approach'],
  ['tq-needles', 'Needles'],
  ['tq-csf', 'CSF and injection'],
  ['tq-drugs', 'Drugs and doses'],
  ['tq-testing', 'Testing the block'],
  ['tq-timecourse', 'Time course'],
  ['tq-hipfracture', 'Hip fracture'],
  ['tq-saddle', 'Saddle and unilateral'],
  ['tq-documentation', 'Documentation'],
  ['tq-postop', 'Post-op care'],
];

// One addressable sub-part: kicker number (from PARTS), h3 and content.
function part(id, title, ...children) {
  const num = `2.${PARTS.findIndex(([pid]) => pid === id) + 1}`;
  const h = el('h3', { id: `${id}-h`, class: 'tq-h' }, el('span', { class: 'tq-num', text: num }), ' ', title);
  return el('section', { class: 'tq-part', id, 'aria-labelledby': `${id}-h` }, h, ...children);
}
const P = (html, cls) => el('p', { html, class: cls });
const UL = (items, cls) => el('ul', { class: cls || 'tq-list' }, ...items.map((t) => el('li', { html: t })));
// A tagged group of blocks (for example a heading with its list).
const G = (n, ...children) => T(el('div', { class: 'tq-grp' }, ...children), n);
// An advanced pearl: a key-point box labelled in its title.
const PEARL = (title, html) => T(callout('key', { title: `Advanced pearl: ${title}`, body: `<p>${html}</p>` }), 3);

export function mount(root) {
  const api = {};
  root.append(
    keyPoints([
      'A spinal suits surgery below the umbilicus that will finish within the life of the block.',
      'Before you start: consent, site and side, platelets, clotting and the timing of any anticoagulant.',
      'IV access, monitoring, a drawn-up vasopressor and resuscitation equipment come first.',
      'Enter at L3–4 or below, with full asepsis: 0.5% chlorhexidine in alcohol, dried before puncture.',
      'Never inject if there is pain or paraesthesia, or if CSF is not flowing clearly.',
      'Use the lowest dose that works from the label range, and reduce it in older patients.',
      'Check blood pressure often, treat hypotension early, and test the block on both sides before incision.',
      'Tell the ward to call you for back pain, new weakness or numbness, or bladder or bowel change after the block.',
    ]),
    T(P('A single-shot spinal in an adult having lower-limb, urological, perineal or lower abdominal surgery. Work through it in order, or jump to the step you need.', 'sp-lead'), 1),
    el('ol', { class: 'sp-jump tq-jump', 'aria-label': 'Steps in this section' },
      ...PARTS.map(([id, t], i) => el('li', {}, el('a', { href: `#${id}` }, el('span', { class: 'tq-jump-n', text: String(i + 1).padStart(2, '0') }), t)))),
  );

  // ---------------------------------------------------------------- 1 consent
  const freq = el('ol', { class: 'tq-freq', 'aria-label': 'Words used for risk, with frequencies' },
    ...[['Very common', '1 in 10', 5], ['Common', '1 in 100', 4], ['Uncommon', '1 in 1,000', 3], ['Rare', '1 in 10,000', 2], ['Very rare', '1 in 100,000', 1]]
      .map(([w, n, k]) => el('li', { class: 'tq-freq-row' }, el('span', { class: 'tq-freq-w', text: w }), el('span', { class: 'tq-freq-bar', style: `--tq-w:${k * 20}%`, 'aria-hidden': 'true' }), el('span', { class: 'tq-freq-n sp-num', text: n }))));
  root.append(part('tq-consent', 'Indications and consent',
    G(1,
      P(`Spinal anaesthesia suits surgery below the umbilicus that will finish within the life of the block: about ${N('2–3 h')} with hyperbaric bupivacaine.`),
      UL([
        '<strong>Orthopaedics:</strong> hip and knee arthroplasty, hip fracture, ankle and foot, lower-limb trauma and amputation.',
        '<strong>Urology:</strong> TURP, TURBT, cystoscopy and ureteroscopy.',
        '<strong>Perineal and perianal:</strong> haemorrhoids, fistula, pilonidal sinus.',
        '<strong>Lower abdominal:</strong> inguinal hernia repair.',
      ])),
    G(1,
      el('h4', { text: 'What to discuss' }),
      table({
        caption: 'Risks to mention, as the patient leaflet puts them',
        head: ['Risk', 'How often', 'Say'],
        rows: [
          [{ th: true, html: 'Low blood pressure' }, 'Very common to common', 'Treated with fluids and drugs.'],
          [{ th: true, html: 'Itching' }, 'Very common to common', 'Mainly with spinal opioids. Treatable.'],
          [{ th: true, html: 'Difficulty passing urine' }, 'Very common to common', 'Lasts as long as the block. A catheter may be needed for a while.'],
          [{ th: true, html: 'Pain or tingling during the injection' }, 'Very common to common', 'Tell me straight away if you feel it in your legs or bottom.'],
          [{ th: true, html: 'Headache' }, `About ${N('1 in 200–300')} in young women having a spinal for childbirth; much less common in older patients`, 'Can follow a spinal. Tell us if it is worse sitting up.'],
          [{ th: true, html: 'Temporary nerve damage' }, 'Rare', 'Numbness or weakness that nearly always recovers in days to weeks.'],
          [{ th: true, html: 'Permanent nerve damage' }, `About ${N('1 in 50,000')} spinals`, `Rare: about ${N('1 in 50,000')}.`],
        ],
      }),
      P('Also cover: the alternative (general anaesthesia), sedation if wanted, that pulling and pressure may still be felt, and what happens if the block is not good enough (more local anaesthetic, or a general anaesthetic). Record what you discussed.')),
    G(2,
      P('The patient leaflet from the RCoA and the Association of Anaesthetists uses these words for risk.'),
      freq),
    T(P(`<strong>National audit (NAP3).</strong> Across all central neuraxial blocks in the UK, permanent harm was ${N('4.2 per 100,000')} on pessimistic counting (about ${N('1 in 24,000')}) and ${N('2.0 per 100,000')} on optimistic counting (about ${N('1 in 54,000')}). Paraplegia or death was ${N('1.8')} and ${N('0.7 per 100,000')}. Spinals were among the lower-risk blocks; most harm followed perioperative epidurals. The data are from 2006–07.`), 2),
    T(callout('key', { title: 'Consent figures', body: '<p>The RCoA published updated spinal risk infographics in 2025. Use them when quoting numbers to patients.</p>' }), 2),
  ));

  // ---------------------------------------------------------------- 2 pre-op assessment (new)
  root.append(part('tq-preop', 'Pre-op assessment checklist',
    T(P('Do this before the patient arrives in theatre, so there are no surprises at the bedside. Tick each item in your head, or write it down.'), 1),
    el('div', { class: 'tq-two' },
      T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'History' }), UL([
        'Allergies, especially to local anaesthetics.',
        'Anticoagulants, antiplatelets, NSAIDs and herbal products: drug, dose and the time of the last dose.',
        'Bleeding tendency: easy bruising, bleeding after surgery or dental work, liver disease, kidney disease.',
        'Heart disease, especially aortic or mitral stenosis, and current blood pressure drugs.',
        'Neurological disease, back pain, sciatica or previous spinal surgery.',
        'Previous anaesthetics: any problem with a spinal, or a failed one.',
        'Fever, infection or sepsis today.',
      ])), 1),
      T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'Examination and tests' }), UL([
        'Airway, in case you must convert to a general anaesthetic.',
        'Back: skin infection or tattoo at the site, obvious deformity, scars, how well the patient can flex.',
        'Baseline power and sensation in the legs if there is any neurological history.',
        'Pulse and blood pressure, and hydration.',
        'Platelet count and clotting if the history or the drugs call for it.',
        'Haemoglobin, and urea and electrolytes if indicated.',
      ])), 1)),
    T(P('<strong>Patient factors.</strong> Can they lie still and understand what you are saying? Is an interpreter needed? Is the patient too anxious or confused for an awake technique? If so, discuss the options with your supervisor before you start.'), 1),
    G(1,
      el('h4', { text: 'Then decide' }),
      UL([
        'Is a spinal right for this operation, its length and its position on the table?',
        'What is the back-up if it fails or wears off (more drug, sedation or a general anaesthetic)?',
        'What will the post-operative analgesia be?',
        'Have you told your supervisor about anything unusual?',
      ])),
    T(P(`A patient who has taken an anticoagulant or antiplatelet needs the interval checked with the <a href="#tq-ac-lookup">lookup below</a> before the block is planned. Aspirin alone does not usually delay a spinal.${cite('asra2025')}`), 1),
    T(P('The aim of the history is to find the problems that make a spinal unsafe (bleeding, infection, fixed cardiac output, a patient who cannot cooperate) and the ones that change the plan (back disease, frailty, age). Reduced cardiac reserve and hypovolaemia predict a larger fall in blood pressure; plan the fluid, the vasopressor and the dose with that in mind.'), 2),
    PEARL('look at the images', 'If the patient has had lumbar spine imaging, read the report or ask to see it. Severe canal stenosis, a low-lying conus, a tethered cord, or previous surgery or instrumentation at the planned level can change the level, the technique or the choice between spinal and general anaesthesia. This is a consultant decision.'),
    PEARL('a normal count is not the whole story', 'A normal platelet count does not exclude poor platelet function. Ask about antiplatelet drugs, NSAIDs, uraemia, liver disease and herbal products, and note that clotting results can be normal in a patient who is bleeding easily. When the history and the numbers disagree, trust the history and ask a senior.'),
  ));

  // ---------------------------------------------------------------- 3 contraindications
  const card = (title, items, cls) => el('div', { class: `tq-card ${cls}` }, el('p', { class: 'tq-card-h', text: title }), UL(items));
  root.append(part('tq-contra', 'Contraindications',
    T(P('The product label lists many conditions; in practice several are relative and need a risk–benefit judgement.'), 1),
    T(el('div', { class: 'tq-two' },
      card('Absolute', [
        'Patient refuses or cannot consent.',
        'Infection at or next to the puncture site.',
        'Raised intracranial pressure from a mass lesion.',
        'True allergy to the local anaesthetic.',
        'Significant coagulopathy, or an anticoagulant not stopped for long enough: see <a href="#tq-anticoag">Anticoagulants</a>.',
      ], 'tq-card--abs'),
      card('Relative', [
        'Fixed cardiac output: severe aortic or mitral stenosis, LVOT obstruction. See <a href="#pp-aortic-stenosis">severe aortic stenosis</a>.',
        'Severe hypovolaemia: correct it first, because sudden severe hypotension can follow.',
        'Sepsis or bacteraemia (risk of an intraspinal abscess).',
        'Pre-existing neurological disease: examine and document the deficit first.',
        'Spinal deformity or previous spinal surgery.',
        'A patient who cannot keep still (delirium, agitation).',
        'Low platelets: see below.',
      ], 'tq-card--rel')), 1),
    G(2,
      el('h4', { id: 'tq-platelets', text: 'Platelets: no universal threshold' }),
      UL([
        `The risk is a continuum, not a cliff edge. The Association of Anaesthetists (2013) suggests a count above ${N('75 × 10⁹/L')} is adequate when it is stable and there are no other risk factors. Where platelet function is normal (for example ITP), an experienced anaesthetist may proceed above ${N('50 × 10⁹/L')} after an individual risk–benefit assessment.${cite('aagbi2013')}`,
        `The British Society for Haematology advises no routine prophylactic platelet transfusion at ${N('80 × 10⁹/L')} or more for spinal anaesthesia. It also notes that, because a spinal is technically like a lumbar puncture (${N('40 × 10⁹/L')}), a lower figure might be more logical.`,
        `ESAIC/ESRA 2022 sets no fixed platelet threshold.${cite('esaic2022')}`,
        'A falling count, or other clotting problems, matter more than a single number.',
      ])),
    T(callout('key', { title: 'Platelet count', body: '<p>If the platelet count is low, ask a senior colleague before a single-shot spinal. Much of the published data is obstetric.</p>' }), 1),
    PEARL('weigh the risk of general anaesthesia too', 'A relative contraindication is a balance, not a veto. In a patient with severe lung disease or a difficult airway, a spinal with a known small bleeding risk can be safer than a general anaesthetic. Say the trade-off out loud to the team and record who agreed to it.'),
  ));

  // ---------------------------------------------------------------- 4 anticoagulants
  const lookup = anticoagLookup();
  api.lookup = lookup;
  const fullTable = details({ id: 'tq-ac-full', summary: 'Show the full table (every drug, both guidelines)', body: anticoagTable() });
  root.append(part('tq-anticoag', 'Anticoagulants and antiplatelet drugs',
    T(callout('key', {
      title: 'Single-shot spinals only',
      body: '<p>These intervals are for teaching. Everything here assumes a <strong>single-shot spinal with no catheter</strong>. Where a guideline gives a rule for catheter removal, agree the timing of the next dose with the surgical team.</p>',
    }), 1),
    T(P(`Spinal haematoma is rare but catastrophic. The intervals are built from pharmacokinetics, because the event is too rare to study in trials. The two current guidelines are ASRA 2025 and ESAIC/ESRA 2022.${cite('asra2025', 'esaic2022')}`), 2),
    T(lookup.node, 1),
    G(2,
      el('h4', { text: 'Rules that apply to every drug' }),
      UL([
        `On more than one drug: use the longest interval.${cite('esaic2022')}`,
        `Ultrasound guidance does not shorten the interval, and nor does non-specific reversal (PCC, aPCC or andexanet) of a DOAC.${cite('esaic2022')}`,
        `A bloody tap may justify a longer gap before the next dose. Decide with the team.${cite('esaic2022')}`,
        `On heparin for more than 4 days: check the platelet count (heparin-induced thrombocytopenia).${cite('asra2025', 'aagbi2013')}`,
      ])),
    G(3,
      el('h4', { text: 'Low dose and high dose' }),
      P(`Both guidelines now say “low dose” and “high dose” rather than “prophylactic” and “therapeutic”, because the same dose can be treatment in one patient and prophylaxis in another.${cite('esaic2022')}`),
      table({
        caption: `DOAC dose tiers (ESAIC/ESRA 2022)${cite('esaic2022')}`,
        head: ['Drug', 'Low dose (VTE prophylaxis after hip or knee replacement)', 'High dose (AF or VTE treatment)'],
        rows: [
          [{ th: true, html: 'Rivaroxaban' }, D('10 mg daily'), D('15–20 mg daily')],
          [{ th: true, html: 'Apixaban' }, D('2.5 mg twice daily'), `${D('5 mg twice daily')} (${D('10 mg twice daily')} at the start of VTE treatment)`],
          [{ th: true, html: 'Edoxaban' }, '—', `${D('60 mg daily')} (${D('30 mg')})`],
          [{ th: true, html: 'Dabigatran' }, `${D('220 mg daily')} (${D('150 mg')} with dose adjustment)`, `${D('150 mg twice daily')} (${D('110 mg twice daily')})`],
        ],
      })),
    G(3,
      P(`Residual drug: a DOAC level under ${N('30 ng/mL')}, or an anti-Xa activity of ${N('0.1 IU/mL')} or less for anti-Xa drugs and LMWH, is the usual target if you measure before a block.${cite('asra2025', 'esaic2022')}`),
      T(fullTable, 3)),
    T(callout('key', { title: 'The 2013 UK table is out of date for DOACs', body: `<p>The Association of Anaesthetists’ 2013 guideline is under review. Its DOAC intervals are shorter than both current guidelines, so don’t teach them as current.${cite('aagbi2013')}</p>` }), 3),
  ));

  // ---------------------------------------------------------------- 5 preparation
  root.append(part('tq-prep', 'Preparation',
    T(el('div', { class: 'tq-two' },
      el('div', {},
        UL([
          `<strong>Monitoring:</strong> ECG, non-invasive blood pressure and SpO₂ at minimum. Start them before the block and continue for at least ${N('30 min')} after the block is complete. Use capnography if a sedated patient stops responding to voice.${cite('tq-klein2021')}`,
          '<strong>IV access</strong> in place before the block, in a properly equipped area with resuscitation drugs and equipment to hand, and the anaesthetist in constant attendance.',
          '<strong>Vasopressor drawn up.</strong> Treat hypotension promptly with an IV sympathomimetic. Have atropine, oxygen, airway equipment and general anaesthetic drugs ready in case the block is high or fails.',
          '<strong>Fasting</strong> as for a general anaesthetic, because you may need to convert.',
          '<strong>Checks:</strong> consent, site and side, WHO sign-in, and anticoagulant timing and blood results where relevant.',
        ])),
      checklist([
        'Consent recorded; site and side confirmed at sign-in',
        'Anticoagulants, platelets and clotting checked',
        'IV cannula in and running',
        'ECG, NIBP and SpO₂ on; baseline recorded',
        'Vasopressor drawn up and labelled; atropine to hand',
        'Oxygen, airway kit and GA drugs ready',
        'Resuscitation equipment nearby',
        'Assistant to position and support the patient',
        'Spinal drug checked, labelled and kept apart from other syringes',
        'Spinal needle and introducer opened; a longer needle available',
      ])), 1),
  ));

  // ---------------------------------------------------------------- 6 position
  const posFig = (svgNode, num, cap) => {
    const f = figure({ num, caption: cap, plate: 'paper', aspect: '420/300' });
    f.stage.append(svgNode);
    return f.fig;
  };
  const sitting = el('div', { id: 'tq-sitting', class: 'tq-pos' },
    posFig(sittingSvg(), '2.1', 'Sitting: the patient slumps forwards to open the gaps between the laminae. Original drawing.'),
    el('div', { class: 'tq-pc' },
      card('Good for', ['Finding the midline: it is easier to see and feel, especially with obesity.', 'Faster CSF flow, which helps with fine needles.', 'A lower, more sacral block with hyperbaric drug if the patient stays sitting for a few minutes.'], 'tq-card--pro'),
      card('Watch for', ['Fainting and hypotension while sitting.', 'Needs a patient who can sit and cooperate; hard after a hip fracture.', 'Limits sedation.'], 'tq-card--con')),
    P('<strong>Coach:</strong> feet on a stool, shoulders down and relaxed, chin on chest, hug a pillow and “push your lower back out towards me, like an angry cat”. The assistant in front keeps the patient upright, not leaning or twisted.'));
  const lateral = el('div', { id: 'tq-lateral', class: 'tq-pos' },
    posFig(lateralSvg(), '2.2', 'Lateral, seen from above: the back is flush with the trolley edge and the patient curls up. Original drawing.'),
    el('div', { class: 'tq-pc' },
      card('Good for', ['Frail, sedated or anxious patients, and hip fractures.', 'Less fainting.', 'Putting the operative side down for a more one-sided block with hyperbaric drug.'], 'tq-card--pro'),
      card('Watch for', ['The midline is harder to judge: the spine sags, especially with wide hips or obesity.', 'Slower CSF flow.'], 'tq-card--con')),
    P('<strong>Coach:</strong> back parallel to the edge of the trolley, knees to chest, chin down. Shoulders and hips stacked vertically, with no rotation. A pillow under the head keeps the spine straight.'));
  const posHost = el('div', { class: 'tq-tabs' });
  const posTabs = tabs(posHost, [
    { id: 'tq-pos-sitting', label: 'Sitting', sub: 'Easier midline', panel: sitting },
    { id: 'tq-pos-lateral', label: 'Lateral', sub: 'Frail or sedated', panel: lateral },
  ], { label: 'Patient position' });
  api.posTabs = posTabs;
  root.append(part('tq-position', 'Position: sitting or lateral',
    T(posHost, 1),
    T(callout('pearl', { title: 'Position changes spread', body: `<p>With ${D('3 mL')} of hyperbaric bupivacaine 0.5% at L3–4, sitting for 2 minutes and then lying flat usually gives a block to about ${N('T7–T10')}. The same dose given lying on the side and then turned flat gives about ${N('T4–T7')}.${cite('tq-hpra-heavy', 'tq-sg-heavy')}</p>` }), 2),
    T(P('For a hip fracture, a femoral, fascia iliaca or PENG block before you move the patient makes positioning kinder. See <a href="#tq-hipfracture">Spinal for hip fracture</a>.'), 1),
    PEARL('tilting after the injection', 'Until the level fixes (about 20 minutes), a small head-down tilt moves hyperbaric drug upwards and a head-up tilt keeps it lower. Tilt only on purpose and with the blood pressure watched, because the sympathetic block rises with the sensory level. Unplanned tilts, such as the surgeon asking for a lithotomy or Trendelenburg position early, are a common reason for a block that goes higher than expected.'),
  ));

  // ---------------------------------------------------------------- 7 asepsis
  root.append(part('tq-asepsis', 'Asepsis',
    T(P(`From the Association of Anaesthetists’ skin antisepsis guideline for neuraxial blocks.${cite('tq-campbell2014')}`), 2),
    T(steps([
      { title: 'Scrub and dress', body: 'Wash your hands thoroughly with a surgical scrub. Wear a cap, a mask and sterile gloves; the guideline also recommends a sterile gown. Use a large sterile drape.' },
      { title: 'Use 0.5% chlorhexidine in alcohol', body: `${D('0.5%')} rather than ${D('2%')}: there is no convincing evidence that 2% works better against bacteria, but chlorhexidine is toxic to nerves.` },
      { title: 'Keep chlorhexidine away from drugs and needles', body: 'Don’t pour it into pots on the same trolley as your spinal kit. Cover the kit while you apply it, whether by swab, applicator or spray.' },
      { title: 'Let it dry', body: 'Wait until the skin is dry before you feel for landmarks or puncture it.' },
      { title: 'Check your gloves', body: 'If chlorhexidine may have got onto your gloves, change them.' },
    ]), 1),
  ));

  // ---------------------------------------------------------------- 8 approach
  const apFig = figure({ id: 'tq-fig-approach', num: '2.3', caption: 'Back view of one lumbar interspace. The midline needle enters in the middle of the gap; the paramedian needle starts just lateral and caudal and aims medially and upwards. Original drawing, not to scale.', plate: 'paper', aspect: '480/320' });
  // Phones get taller layouts of Figs 2.3 and 2.4 with larger label text (kept at 11px or more).
  const mqNarrow = window.matchMedia('(max-width:640px)');
  const apAspect = () => (mqNarrow.matches ? '480/400' : '480/320');
  let apSvg = approachSvg({ narrow: mqNarrow.matches });
  apFig.stage.style.aspectRatio = apAspect();
  apFig.stage.append(apSvg);
  const apText = el('div', { class: 'tq-ap-text', 'aria-live': 'polite' });
  const AP = {
    midline: {
      label: 'Midline',
      html: '<p><strong>Midline.</strong> Raise a skin wheal in the middle of the chosen gap. Pass the introducer, then the spinal needle, angled slightly upwards (cephalad), parallel to the spinous processes. The needle crosses skin, fat, supraspinous and interspinous ligaments, ligamentum flavum, the epidural space and the dura–arachnoid. Bone shallow is usually spinous process; bone deep is usually lamina, so recheck the midline and the angle.</p>',
      sr: 'Midline approach selected: needle entry in the middle of the gap between the spinous processes.',
    },
    paramedian: {
      label: 'Paramedian',
      html: '<p><strong>Paramedian.</strong> Useful when the patient cannot flex well, the interspinous ligament is calcified (often in older patients) or the midline has failed. Start just lateral to the midline and slightly below the gap, then aim medially and upwards. The needle misses the supraspinous and interspinous ligaments and goes through muscle to the ligamentum flavum. If you hit lamina, walk off it upwards and medially into the gap.</p>',
      sr: 'Paramedian approach selected: entry just lateral and caudal, aimed medially and upwards towards the interlaminar gap.',
    },
  };
  const setAp = (v) => {
    apSvg.dataset.mode = v;
    apSvg.setAttribute('aria-label', `Back view of one lumbar interspace. ${AP[v].sr}`);
    apText.innerHTML = AP[v].html;
    apFig.describe(AP[v].sr);
  };
  const apSeg = segmented([{ value: 'midline', label: 'Midline' }, { value: 'paramedian', label: 'Paramedian' }], { label: 'Approach', value: 'midline', onChange: setAp });
  apFig.controls.append(apSeg);
  api.apSeg = apSeg; api.setAp = setAp;
  setAp('midline');
  root.append(part('tq-approach', 'Approach: midline, paramedian and Taylor',
    el('div', { class: 'sp-split tq-split' },
      el('div', {},
        T(P(`<strong>Choose L3–4 or below.</strong> The conus can sit lower than expected, and anaesthetists often misjudge the level. In an MRI study, the marked space was named correctly only ${N('29%')} of the time, and was usually higher than believed. Conus injuries have followed spinals placed higher than the anaesthetist thought. Tuffier’s line is a rough guide, not a reliable landmark.`), 1),
        T(apText, 1),
        G(2,
          el('h4', { id: 'tq-taylor', text: 'Taylor approach (L5–S1)' }),
          P('L5–S1 is the largest interlaminar gap and is often spared by degenerative change. Start just medial and below the lowest point of the posterior superior iliac spine and aim upwards and medially, walking off the sacrum into the gap. It can help in ankylosing spondylitis, kyphoscoliosis and older patients. A longer needle is often needed.')),
        T(P('See the layers in <a href="#an-layers">Anatomy: the layers the needle crosses</a>.'), 2),
        PEARL('count up, then check', 'If you are unsure of the level, palpate the iliac crests, count the spinous processes and then choose the gap below your estimate, because errors usually run towards a higher space. If a pre-procedure ultrasound scan is available, use it to confirm the level and the midline (see the Ultrasound section). When a first approach fails, change something real: the gap, the side of a paramedian entry, the patient’s position or the approach, rather than repeating the same pass.')),
      T(el('div', { class: 'sp-split-fig' }, apFig.fig), 2)),
  ));

  // ---------------------------------------------------------------- 9 needles
  const ndFig = figure({ id: 'tq-fig-needles', num: '2.4', caption: 'Cutting versus pencil-point tips. With a pencil-point needle the whole side opening must be inside the dura before CSF flows freely and before you inject. Original drawing, not to scale.', plate: 'paper', aspect: '560/270' });
  const ndAspect = () => (mqNarrow.matches ? '560/360' : '560/270');
  ndFig.stage.style.aspectRatio = ndAspect();
  ndFig.stage.append(needlesSvg({ narrow: mqNarrow.matches }));
  mqNarrow.addEventListener('change', () => {
    const narrow = mqNarrow.matches;
    const nextAp = approachSvg({ narrow });
    nextAp.dataset.mode = apSvg.dataset.mode;
    nextAp.setAttribute('aria-label', apSvg.getAttribute('aria-label'));
    apSvg.replaceWith(nextAp);
    apSvg = nextAp;
    apFig.stage.style.aspectRatio = apAspect();
    ndFig.stage.querySelector('svg').replaceWith(needlesSvg({ narrow }));
    ndFig.stage.style.aspectRatio = ndAspect();
  });
  root.append(part('tq-needles', 'Needles',
    el('div', { class: 'sp-split tq-split' },
      el('div', {},
        T(table({
          caption: 'Needle tips',
          head: ['Tip', 'Examples', 'Notes'],
          rows: [
            [{ th: true, html: 'Cutting (bevelled)' }, 'Quincke', 'Sharp tip with the opening on the bevel. More headache.'],
            [{ th: true, html: 'Pencil-point (non-cutting)' }, 'Whitacre, Sprotte', 'Closed conical tip, side opening behind it. Fewer headaches. Usual for adult surgical spinals, commonly 25G–27G.'],
          ],
        }), 1),
        T(UL([
          '<strong>Introducer:</strong> fine needles bend easily. The introducer guides them through skin and ligament and keeps them on line.',
          '<strong>Length:</strong> a standard-length needle suits most adults; have a longer one ready for obesity or the Taylor approach.',
        ]), 1),
        T(UL([
          `<strong>Tip design matters more than gauge.</strong> In the Cochrane review, cutting needles roughly doubled post-dural puncture headache compared with pencil-point needles (risk ratio ${N('2.14')}, 95% CI ${N('1.72–2.67')}; about ${N('64')} vs ${N('30 per 1,000')}). Gauge made no consistent difference in the Cochrane review, but the 2023 multisociety consensus found that narrower gauges lower the risk, clearly so for cutting needles.${cite('uppal2023')} Use the finest pencil-point needle you can handle.`,
          `A meta-analysis of 110 trials of lumbar puncture for any reason found the same: atraumatic needles cut headache (risk ratio ${N('0.40')}, 95% CI ${N('0.34–0.47')}).`,
        ]), 2),
        PEARL('do not steer a bent needle', 'A fine needle that has met bone or calcified ligament may be bent even if it looks straight. If it deviates or you meet repeated resistance, withdraw it fully and reinsert it through the introducer rather than trying to steer it from inside the tissue. Check the needle after a difficult pass. With a pencil-point needle, the side opening is a few millimetres behind the tip, so a tip that seems to be in the subarachnoid space may have its opening only partly through the dura. This is the usual reason for slow, doubtful flow.')),
      T(el('div', { class: 'sp-split-fig' }, ndFig.fig), 2)),
  ));

  // ---------------------------------------------------------------- 10 CSF and injection
  root.append(part('tq-csf', 'Confirming CSF and injecting',
    T(steps([
      { title: 'Wait for free flow of clear CSF', body: 'Remove the stylet. Fine pencil-point needles can take several seconds to fill. If flow is slow, rotate the needle in quarter turns: part of the side opening may still be in the dura.' },
      { title: 'Stabilise the needle', body: 'Hold the hub between finger and thumb, with the back of that hand resting on the patient’s back, so the needle cannot move while you attach the syringe.' },
      { title: 'Aspirate before you inject', body: 'Draw back a little CSF to confirm the needle is still in the subarachnoid space. With hyperbaric drug you will see the glucose “swirl”.' },
      { title: 'Inject slowly', body: 'Many anaesthetists aspirate again midway or at the end to confirm the tip has not moved. Avoid vigorous barbotage.' },
      { title: 'Remove the needle and lay the patient as planned', body: 'Then check blood pressure and heart rate straight away and frequently.' },
    ]), 1),
    T(callout('warn', { title: 'Never inject if…', body: '<ul><li>the patient has pain or paraesthesia, on needle placement or on injection: stop, withdraw and redirect;</li><li>the CSF is not clearly flowing, or is still bloody;</li><li>you are unsure where the tip is.</li></ul>' }), 1),
    T(P('What to do next: <a href="#ts-dry-tap">dry tap</a> · <a href="#ts-bloody-tap">bloody tap</a> · <a href="#ts-paraesthesia">paraesthesia</a>.', 'tq-links'), 1),
  ));

  // ---------------------------------------------------------------- 11 drugs
  const doseTable = table({
    caption: 'Intrathecal local anaesthetics: label doses for an average adult',
    head: ['Drug', 'Dose (label)', 'Onset', 'Duration', 'Notes'],
    rows: [
      [{ th: true, html: 'Hyperbaric bupivacaine 0.5%<span class="tq-cell-sub">Marcain Heavy; Marcain Spinal 0.5% Heavy (Singapore)</span>' },
        `Lower abdominal and lower limb, including hip: ${D('2–4 mL')} (${D('10–20 mg')})${cite('tq-hpra-heavy', 'tq-sg-heavy')}<br>Urological: ${D('1.5–3 mL')} (${D('7.5–15 mg')})${cite('tq-hpra-heavy')}`,
        D('5–8 min'),
        `${D('1.5–3 h')}; urological ${D('2–3 h')}`,
        `Use the lowest dose that works. Reduce the dose in older patients (risk of a high block).${cite('tq-hpra-heavy')}`],
      [{ th: true, html: 'Plain (isobaric) bupivacaine 0.5%<span class="tq-cell-sub">Marcain 0.5% (Singapore label)</span>' },
        `${D('3–4 mL')} (${D('15–20 mg')})${cite('tq-sg-plain')}`,
        'Not stated',
        `Lower limb surgery lasting ${D('3–4 h')}`,
        `${D('4 mL')} gives about 2 segments more spread and ${D('½–1 h')} longer than ${D('3 mL')}.${cite('tq-sg-plain')} Slightly hypobaric at body temperature, so spread is less predictable.`],
      [{ th: true, html: 'Prilocaine 2% hyperbaric<span class="tq-cell-sub">Prilotekal</span>' },
        `${D('40–60 mg')} (${D('2–3 mL')}) for a block to T10; maximum ${D('80 mg')} (${D('4 mL')})${cite('tq-prilotekal')}`,
        'Not stated',
        `About ${D('100–130 min')}`,
        'Short acting; suits day surgery. Reduce in poor general condition or liver or kidney impairment.'],
      [{ th: true, html: 'Chloroprocaine 1%<span class="tq-cell-sub">Ampres</span>' },
        `${D('40–50 mg')} (${D('4–5 mL')}); maximum ${D('50 mg')}${cite('tq-ampres')}`,
        `About ${D('8–10 min')} (mean)`,
        `About ${D('80–100 min')}`,
        `Licensed for surgery expected to last no more than ${D('40 min')}.${cite('tq-ampres')} An ester local anaesthetic.`],
    ],
  });
  root.append(part('tq-drugs', 'Drugs and doses',
    T(callout('key', {
      title: 'About the doses',
      body: '<p>The doses below are product-label ranges, not a protocol. This page gives <strong>no obstetric doses</strong>, and no doses for intrathecal clonidine, dexmedetomidine or diamorphine.</p>',
    }), 1),
    T(doseTable, 1),
    T(UL(['Use preservative-free preparations only.', 'Check the drug, the concentration and the label twice before you draw it up. Keep the spinal syringe apart from the others.']), 1),
    T(UL([
      '<strong>Lidocaine</strong> is no longer recommended for spinals: it causes transient neurological symptoms far more often than bupivacaine.',
      '<strong>Levobupivacaine and ropivacaine:</strong> check the licence before use. No dose is given here.',
    ]), 2),
    G(2,
      el('h4', { id: 'tq-adjuncts', text: 'Opioid adjuncts' }),
      el('div', { class: 'tq-two' },
        card('Fentanyl (lipophilic)', [
          'Quick onset and short action. Adds analgesia without much prolonging the motor block.',
          'Itch and early respiratory depression.',
          `Monitor for at least ${N('2 h')}: continually for the first ${N('20 min')}, then at least hourly to ${N('2 h')}.${cite('tq-asa2016')}`,
        ], 'tq-card--plain'),
        card('Morphine (hydrophilic)', [
          `PROSPECT (2026 update): low-dose intrathecal morphine ${D('100 microgram')} (${D('0.1 mg')}) <em>may be considered</em> with a spinal in inpatients having a hip replacement. The 2021 version stressed its side-effects and showed that good analgesia is achievable without it. For knee replacement, only when neither an adductor canal block nor local infiltration analgesia is possible.`,
          'Slow onset; analgesia for many hours. Itch, nausea, urinary retention and <strong>delayed</strong> respiratory depression.',
          `Monitor for at least ${N('24 h')}: at least hourly for ${N('12 h')}, then at least every ${N('2 h')} to ${N('24 h')}. Watch breathing rate and depth, oxygenation and sedation. Keep naloxone and oxygen available.${cite('tq-asa2016')}`,
          `Not for day-case patients going home the same day.${cite('tq-asa2016')}`,
        ], 'tq-card--plain'))),
    G(2,
      el('h4', { id: 'tq-spread-h', text: 'What changes the spread' }),
      P('Ranked from the strongest effect. Tap a factor for the detail.'),
      spreadFactors([
        { rank: '1', name: 'Baricity and position', weight: 3, who: 'you', body: '<p>Hyperbaric solution runs downhill. Sitting keeps it low; lying flat soon after lets it spread higher. Plain bupivacaine is slightly hypobaric at body temperature, so it is less predictable.</p>' },
        { rank: '2', name: 'Dose of drug', weight: 3, who: 'you', body: '<p>The dose (mass) given matters more than volume or concentration on their own. With a fixed 0.5% solution, more volume means more spread.</p>' },
        { rank: '3', name: 'Lumbosacral CSF volume', weight: 3, who: 'pt', body: '<p>Varies a lot between people and explains much of the variation in block height, but you cannot measure it at the bedside.</p>' },
        { rank: '4', name: 'Age', weight: 2, who: 'pt', body: '<p>Older patients tend to get higher blocks. The label says to reduce the dose.</p>' },
        { rank: '5', name: 'Raised intra-abdominal pressure', weight: 2, who: 'pt', body: '<p>Obesity, ascites or a large abdominal mass reduce CSF volume, so the block may go higher.</p>' },
        { rank: '6', name: 'Speed of injection and barbotage', weight: 1, who: 'you', body: '<p>Small and inconsistent effects. A slow injection is more predictable.</p>' },
        { rank: '7', name: 'Interspace used', weight: 1, who: 'you', body: '<p>Only a small effect on the final height of the block.</p>' },
        { rank: '8', name: 'Spinal curves', weight: 1, who: 'pt', body: '<p>Lying flat, hyperbaric solution collects in the lowest parts of the thoracic and sacral curves. Kyphosis or scoliosis changes where it pools.</p>' },
        { rank: '9', name: 'Height, weight and sex', weight: 1, who: 'pt', body: '<p>Little consistent effect on their own within the normal adult range.</p>' },
      ])),
    PEARL('the dose is a starting point', 'Label ranges are for an average adult. In a frail, older or short patient, or one with a raised intra-abdominal pressure, a dose at the lower end of the range is usual. A smaller dose gives a more stable circulation but a shorter and less reliable block, so have a plan for converting to a general anaesthetic or for adding sedation if surgery runs on.'),
  ));

  // ---------------------------------------------------------------- 12 testing
  root.append(part('tq-testing', 'Testing the block',
    T(P('Fibres are blocked in a fixed order: sympathetic, then cold, then pinprick, then touch, then motor. They recover in reverse. The sympathetic block usually extends about 2 segments or more above the sensory level, and the motor block about 2 segments or more below it.'), 2),
    T(el('div', { class: 'tq-modes' },
      ...[
        ['Cold', 'Ethyl chloride spray or ice. Quick, and gives the highest level, so it overestimates the surgical block.'],
        ['Pinprick', 'A blunted pin or Neurotip. The usual test of the surgical level.'],
        ['Light touch', 'The strictest test; its level is the lowest of the three.'],
        ['Motor', 'Modified Bromage score, below.'],
      ].map(([t, b]) => el('div', { class: 'tq-mode' }, el('p', { class: 'tq-mode-h', text: t }), P(b)))), 1),
    T(P('Test both sides. Start in the blocked area and move upwards until the patient feels a change, comparing with an unblocked area such as the shoulder. Record the level and the Bromage score.'), 1),
    T(table({
      caption: 'Modified Bromage score (one common version)',
      head: ['Score', 'Meaning'],
      rows: [
        [{ th: true, html: N('0') }, 'No motor block: can lift the straight leg'],
        [{ th: true, html: N('1') }, 'Cannot lift the straight leg; can bend the knee'],
        [{ th: true, html: N('2') }, 'Cannot bend the knee; can move the foot'],
        [{ th: true, html: N('3') }, 'Complete: cannot move foot or knee'],
      ],
    }), 1),
    T(P('Definitions vary between sources, and some number in the opposite direction or use more grades. Say which version you are using.', 'tq-note'), 2),
    G(2,
      el('h4', { id: 'tq-check-h', text: 'Is it ready? A quick check' }),
      blockCheck([
        { id: 'turp', label: 'TURP', target: 10, why: 'TURP: T10 is the level commonly quoted, to cover bladder distension.' },
        { id: 'hip', label: 'Hip', target: 10, why: 'Hip surgery: T10 is commonly quoted; some accept lower for arthroplasty. The conservative figure is used here.' },
        { id: 'knee', label: 'Knee', target: 10, why: 'Knee surgery: T10 is commonly quoted, and also covers a thigh tourniquet more reliably.' },
        { id: 'hernia', label: 'Inguinal hernia', target: 8, why: 'Inguinal hernia: the incision is at T12–L1, but traction on the sac and peritoneum needs at least T10, and many aim for T8. T8 is used here.' },
      ])),
    T(callout('key', { title: 'Target levels', body: '<p>These targets are commonly quoted teaching figures, not taken from a guideline. Agree the level you need with the surgeon.</p>' }), 2),
    PEARL('a patchy or one-sided block', 'Test before incision and not only by the clock. A block that is higher on one side, or that has a gap, is usually a position or injection effect and may still be fixing. Wait and test again before you give more drug or turn the patient. Cold testing shows the highest level and the sympathetic edge, so a surgeon who reports pain below a block you called adequate is usually right; test pinprick at the operative site.'),
  ));

  // ---------------------------------------------------------------- 13 time course
  const tlFig = figure({ id: 'tq-fig-timecourse', num: '2.5', caption: `Hyperbaric bupivacaine 0.5%: onset ${D('5–8 min')}, duration ${D('1.5–3 h')} depending on dose and site (product label). The level keeps moving for the first 20 minutes or so. Shading after 1.5 h shows the range of duration.`, plate: 'none', aspect: 'auto' });
  const drawTl = () => {
    const w = tlFig.stage.clientWidth || 600;
    const s = timelineSvg(w);
    s.setAttribute('aria-label', 'Timeline after injecting hyperbaric bupivacaine 0.5%: block onset at 5 to 8 minutes; level still moving until about 20 minutes; surgical block lasting about 1.5 to 3 hours. Suggested checks at 5, 10 and 20 minutes and again before incision.');
    tlFig.stage.replaceChildren(s);
  };
  whenVisible(tlFig.fig, () => { if (!tlFig.stage.firstChild) drawTl(); });
  let lastW = 0;
  onResize(tlFig.stage, (r) => { if (Math.abs(r.width - lastW) > 4) { lastW = r.width; drawTl(); } });
  root.append(part('tq-timecourse', 'Time course and reassessment',
    T(tlFig.fig, 2),
    T(UL([
      `<strong>Onset:</strong> ${D('5–8 min')} for hyperbaric bupivacaine.`,
      '<strong>Settling:</strong> the level is mostly fixed by about 20 minutes; after that, tilting the patient has little effect.',
      `<strong>Duration:</strong> ${D('1.5–3 h')} for lower-limb and abdominal doses, ${D('2–3 h')} for urological doses; leg muscle relaxation lasts about ${D('2–2.5 h')}.`,
      '<strong>Reassess</strong> the level and blood pressure until the block is stable, again before incision, and whenever surgery runs long.',
      'A dense motor block that lasts much longer than expected, or comes back after it had started to wear off, needs urgent review for a spinal haematoma or abscess. See <a href="#complications">Complications</a>.',
    ]), 1),
    T(callout('key', { title: 'Day-case spinals', body: `<p>Short-acting drugs (prilocaine or chloroprocaine, above) let patients walk and go home the same day. Discharge on criteria, not the clock: normal sensation and power before walking, supervised first mobilisation, and voiding. Avoid intrathecal morphine.${cite('tq-asa2016')} See also <a href="#pp-day-case">Day-case spinal</a>.</p>` }), 2),
  ));

  // ---------------------------------------------------------------- 14 hip fracture (new)
  root.append(part('tq-hipfracture', 'Spinal for hip fracture: a worked example',
    T(P('An older, frail patient with a painful hip, often dehydrated, anaemic and on several drugs. The same steps as any spinal, with four changes: analgesia first, a careful position, a lower dose and a plan for low blood pressure.'), 1),
    T(steps([
      { title: 'Before you move the patient', body: 'Check anticoagulant and antiplatelet timing with the <a href="#tq-ac-lookup">lookup</a>, the platelet count, haemoglobin, electrolytes and the ECG. Correct hypovolaemia first. Assess cognition and capacity, and talk to the family if the patient cannot consent.' },
      { title: 'Give the analgesic block first', body: 'A fascia iliaca, femoral or PENG block before positioning makes the move kinder and is often what lets the patient stay still. Do it with supervision, with ultrasound, and keep a running total of the local anaesthetic you have given.' },
      { title: 'Set up as for any spinal', body: 'IV access, monitors, oxygen, airway kit and a vasopressor drawn up. Have the blood pressure cycling every minute or two while you position and inject.' },
      { title: 'Choose the position', body: 'Lateral is usual. Operative side down gives the densest block on the fractured side with hyperbaric drug, but it hurts: use it only if the nerve block has worked. Operative side up is more comfortable, but gravity favours the good leg, so the block may be more bilateral.' },
      { title: 'Choose a dose at the cautious end', body: `Within the label range for hip surgery (${D('2–4 mL')}, ${D('10–20 mg')} of hyperbaric bupivacaine 0.5%), use the lowest dose that works and reduce it in older patients, as the label advises. Inject slowly.${cite('tq-hpra-heavy', 'tq-sg-heavy')}` },
      { title: 'Be ready for low blood pressure', body: 'Expect it, and treat it early with a vasopressor. Look for a cause too: hypovolaemia, bleeding or a high block. Lie the patient flat as soon as it is safe, and give oxygen.' },
      { title: 'Keep the sedation light', body: 'Heavy sedation adds hypotension, hypoxia and delirium. Explain what is happening, keep the patient warm, and pad pressure points before the move to the operating table.' },
      { title: 'Hand over', body: 'Record the block level, drugs and any hypotension. Tell recovery about the nerve block, the dose given and the plan for analgesia.' },
    ]), 1),
    G(2,
      el('h4', { text: 'Spinal or general anaesthesia?' }),
      P('Neither has been shown to be clearly better for every hip fracture patient. Choose for the individual: airway, heart and lung disease, cognition, anticoagulants, the surgical plan and the patient’s wishes. A spinal can be a poor choice if the patient cannot keep still, but a failed spinal is not a reason for a rushed second attempt: convert to a general anaesthetic.')),
    T(callout('warn', { title: 'Hypotension readiness', body: '<ul><li>Vasopressor drawn up before you inject.</li><li>Blood pressure at a short interval from the injection until the level has fixed.</li><li>Slow, small boluses of fluid, not large ones, if the heart is weak.</li><li>A drop in blood pressure with a slow pulse needs atropine and a call for help.</li></ul>' }), 1),
    PEARL('bone cement', 'Cemented hemiarthroplasty can cause a sudden fall in blood pressure, hypoxia or arrhythmia around cementing and prosthesis insertion (bone cement implantation syndrome). Frailty and heart or lung disease raise the risk. A spinal does not prevent it. Tell the surgeon your concern before the cement goes in, raise the inspired oxygen, have the vasopressor ready, and treat early.'),
    PEARL('antiplatelets are common here', `Many hip fracture patients take aspirin or another antiplatelet drug. Aspirin alone does not usually delay a spinal; other antiplatelets and any anticoagulant do, so look each drug up rather than assume.${cite('asra2025')} Weigh any delay against the risk of a longer wait for surgery and discuss it with the surgeon and a senior.`),
  ));

  // ---------------------------------------------------------------- 15 saddle and unilateral (new)
  root.append(part('tq-saddle', 'Saddle block and unilateral spinal',
    T(P('Two ways of limiting how far, and to which side, the block goes. Both depend on a hyperbaric solution settling by gravity, so what you do in the minutes after the injection matters as much as the dose.'), 2),
    el('div', { class: 'tq-two' },
      T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'Saddle block' }), UL([
        'Blocks the sacral roots only: the perineum, anus and inner thighs. For short perineal or anorectal surgery.',
        'The patient sits for the injection and stays sitting afterwards, so the hyperbaric drug settles in the lowest part of the dural sac.',
        'Use an interspace at L3–4 or below, and a small dose of hyperbaric drug given slowly.',
        'Keep the patient sitting for a few minutes, then lie them back carefully. Check the level at once and again as it settles.',
      ])), 2),
      T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'Unilateral spinal' }), UL([
        'Aims for a block mainly on the operative side, with less sympathetic block and less fall in blood pressure.',
        'Lie the patient on the operative side (the hyperbaric drug settles on the dependent side).',
        'Inject slowly, and keep the patient on that side after the injection. The longer the patient stays there, the more one-sided the block.',
        'Do not turn the patient flat until the level has fixed (see the time course). Test both sides and be ready for a block that spreads further than planned.',
      ])), 2)),
    T(callout('key', { title: 'Doses for these blocks', body: `<p>This page gives no separate dose for either technique. The label ranges in <a href="#tq-drugs">Drugs and doses</a> are for lower-limb, abdominal and urological surgery, not for these blocks. Agree the drug and dose with your supervisor, and use the lowest dose that works.${cite('tq-hpra-heavy')}</p>` }), 2),
    G(2,
      el('h4', { text: 'Choosing the drug' }),
      P('A hyperbaric solution gives the most predictable result for both techniques. Plain bupivacaine is slightly hypobaric at body temperature, so its spread is less reliable. Prilocaine and chloroprocaine are short acting and suit brief perineal day-case surgery.')),
    PEARL('orient the needle opening', 'With a pencil-point needle, turn the side opening towards the side you want to block before you inject (for a unilateral block, towards the dependent side). The jet then goes towards that side first. Test both legs afterwards; a block that has become bilateral is common and is not a failure, but you must know about it.'),
    PEARL('prone jack-knife and hypobaric solutions', 'For anorectal surgery in the prone jack-knife position, some anaesthetists use hypobaric or specially prepared solutions so that the drug rises towards the sacral roots. The technique and the doses are not covered here, and it should be done only with senior supervision.'),
  ));

  // ---------------------------------------------------------------- 16 documentation (new)
  root.append(part('tq-documentation', 'Documentation',
    T(P('Write the record straight after the block, while it is fresh. It should let the next anaesthetist, the surgeon and the ward understand exactly what was done.'), 1),
    el('div', { class: 'tq-two' },
      T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'The technique' }), UL([
        'Consent discussion, including the risks mentioned.',
        'Pre-op checks: anticoagulants, platelets, clotting.',
        'Time, position, and who assisted and supervised.',
        'Asepsis: skin preparation and what you wore.',
        'Level and approach (midline, paramedian or Taylor).',
        'Needle type and gauge, and the number of attempts or redirections.',
        'CSF: clear, bloody or dry. Any paraesthesia, pain or blood on the needle.',
      ])), 1),
      T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'The result' }), UL([
        'Drug, concentration, volume, dose, adjuncts and the batch number.',
        'Block height (the test used), Bromage score, and the time of each check.',
        'Blood pressure and heart rate, with any vasopressor or fluid given.',
        'Sedation and oxygen.',
        'Any complication, and what you did about it.',
        'Instructions for the ward, including red flags and who to call.',
      ])), 1)),
    T(P('Record negative findings too: “no paraesthesia”, “no blood in the CSF”. If the record is silent, a later reader cannot tell whether it did not happen or was not noted.'), 2),
    PEARL('write down the awkward spinal', 'After a bloody tap, a paraesthesia or several attempts, note the details of what the patient felt, what you did and what you told them. Record a baseline leg examination, and name the person you handed over to. If a deficit appears later, a clear contemporaneous note helps the next clinician judge whether it is new, and how fast to act.'),
  ));

  // ---------------------------------------------------------------- 17 post-op care (new)
  root.append(part('tq-postop', 'Post-op care and discharge',
    T(P('The block does not stop being your concern when the patient leaves theatre. Most of the safety work after a spinal is simple observation and clear instructions to the ward.'), 1),
    G(1,
      el('h4', { text: 'In recovery and on the ward' }),
      UL([
        '<strong>Regression:</strong> feeling and movement come back in the reverse of the order they went. Check that the patient can feel and move both legs before they stand.',
        '<strong>Protect the numb leg:</strong> support heels and pressure points, and keep the patient from putting weight on a leg they cannot feel.',
        '<strong>Mobilising:</strong> the first time, stand the patient with help, sitting up first and standing slowly, because of low blood pressure and falls.',
        '<strong>Passing urine:</strong> retention is common until the block has gone. Ask the patient to pass urine, scan the bladder if needed, and catheterise if the patient cannot pass urine.',
        '<strong>Blood pressure, nausea, pain:</strong> treat each. Give analgesia before the block wears off.',
      ])),
    G(1,
      el('h4', { text: 'If intrathecal morphine was given' }),
      UL([
        `Monitor for at least ${N('24 h')}: at least hourly for ${N('12 h')}, then at least every ${N('2 h')} to ${N('24 h')}. Watch breathing rate and depth, oxygenation and sedation.${cite('tq-asa2016')}`,
        'Keep naloxone and oxygen available. Do not give other sedatives or opioids without checking the plan with the anaesthetist.',
        'Not for day-case patients going home the same day.',
      ])),
    T(callout('warn', { title: 'Tell the ward to call you urgently for…', body: '<ul><li>back pain that is new, severe or getting worse;</li><li>leg weakness or numbness that is new, or lasts longer than expected, or returns after it had worn off;</li><li>new loss of bladder or bowel control, or numbness around the bottom;</li><li>fever, or redness and tenderness at the puncture site;</li><li>a headache that is worse sitting or standing and eases on lying flat;</li><li>drowsiness or slow breathing after intrathecal morphine.</li></ul><p>Do not wait for the morning round. A senior should be told straight away. See <a href="#complications">Complications</a>.</p>' }), 1),
    T(P('Give these red flags to the ward in writing and in words. Day-case patients should go home with the same list and a contact number.'), 1),
    G(2,
      el('h4', { text: 'Discharge after a day-case spinal' }),
      UL([
        'Discharge on criteria, not the clock: normal sensation and power in the legs, a first supervised walk, and passing urine.',
        'Avoid intrathecal morphine for day-case patients.',
        'A responsible adult at home, and clear advice on when to come back.',
      ])),
    PEARL('make the late haematoma easy to catch', 'Epidural or spinal haematoma is most likely to present when the block should be wearing off or after an anticoagulant is restarted. Ask the ward to check the legs at regular intervals during that time, and make sure the anticoagulant restart time matches the plan you agreed with the surgeons. A patient who does not recover motor function when expected needs a neurological check straight away, and imaging should be arranged by a senior without waiting for a trend.'),
    PEARL('back pain after a spinal', 'Mild, short-lived back pain at the puncture site is common. But back or buttock pain that spreads to the legs after the block has worn off can be transient neurological symptoms, which are usually benign and settle with analgesia, yet need an examination to exclude a deficit. Any red-flag feature turns it into an urgent review.'),
  ));

  // Chrome reports layout boxes for content inside a closed <details>, so app.js may treat the table as
  // already visible and never call reveal(). Open it ourselves for its deep links (before app.js scrolls).
  const openForHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === 'tq-ac-table' || h === 'tq-ac-full') fullTable.open = true;
  };
  document.addEventListener('sp-ready', openForHash, { once: true });
  window.addEventListener('hashchange', openForHash);

  // ---------------------------------------------------------------- reveal
  return {
    reveal(id) {
      if (id === 'tq-sitting' || id.startsWith('tq-pos-sitting')) { posTabs.select('tq-pos-sitting'); return true; }
      if (id === 'tq-lateral' || id.startsWith('tq-pos-lateral')) { posTabs.select('tq-pos-lateral'); return true; }
      if (id === 'tq-midline' || id === 'tq-paramedian') { const v = id.slice(3); apSeg.set(v); setAp(v); return true; }
      if (id === 'tq-ac-table' || id === 'tq-ac-full') { fullTable.open = true; return true; }
      if (id.startsWith('tq-spread')) {
        root.querySelectorAll('.tq-spread-item').forEach((li) => { li.hidden = false; });
        return true;
      }
      return false;
    },
  };
}
