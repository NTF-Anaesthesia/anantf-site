// Chapter "Technique": performing a spinal, step by step, with special populations merged in.
// Bupivacaine doses: "Typical" = the department's usual practice, supplied by Dr Koh Wenjun (Oct 2026); no manufacturer range is shown.
// Prilocaine: product-label doses from `refs` below. Chloroprocaine removed (not stocked).
// ASRA 2025 anticoagulation values were read in the full text (Kopp 2025) and live in ../technique/anticoag-data.js.
// Tiers: 1 MO, 2 Resident, 3 Advanced (see ../TIERS.md). Citations: major guidelines only; labels only in dose lines.
import { el, cite, callout, steps, table, tabs, segmented, figure, details, onResize, whenVisible, tier, keyPoints, registerSearch } from '../ui.js?v=1';
import { sittingSvg, lateralSvg, approachSvg, needlesSvg, timelineSvg } from '../technique/figures.js';
import { anticoagLookup, checklist, spreadFactors, blockCheck } from '../technique/widgets.js';
import { populationsBlocks } from '../technique/pops.js';

export const meta = { id: 'technique', prefix: 'tq', title: 'Performing a spinal' };

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
  'pp-griffiths2021': {
    label: 'Griffiths 2021',
    text: 'Griffiths R, Babu S, Dixon P, Freeman N, Hurford D, Kelleher E, et al. Guideline for the management of hip fractures 2020: guideline by the Association of Anaesthetists. <i>Anaesthesia</i> 2021;76:225–37.',
    url: 'https://doi.org/10.1111/anae.15291',
  },
};

const D = (s) => `<span class="sp-dose">${s}</span>`;
const N = (s) => `<span class="sp-num">${s}</span>`;
const T = tier;

// Parts in page order. The number shown in each heading comes from this order.
// Retired parts keep their ids as sub-blocks: tq-preop (in tq-prep), tq-timecourse (in tq-testing), tq-documentation (in tq-postop).
const PARTS = [
  ['tq-prep', 'Preparation'],
  ['tq-consent', 'Indications and consent'],
  ['tq-contra', 'Contraindications'],
  ['tq-anticoag', 'Anticoagulants'],
  ['tq-position', 'Position'],
  ['tq-asepsis', 'Asepsis'],
  ['tq-needles', 'Needles'],
  ['tq-approach', 'Approach'],
  ['tq-csf', 'CSF and injection'],
  ['tq-drugs', 'Drugs and doses'],
  ['tq-saddle', 'Saddle and unilateral'],
  ['tq-testing', 'Testing the block'],
  ['tq-sedation', 'Sedation'],
  ['tq-populations', 'Special patients'],
  ['tq-hipfracture', 'Hip fracture'],
  ['tq-postop', 'Post-op care'],
];

// One addressable sub-part: kicker number (from PARTS), h3 and content.
function part(id, title, ...children) {
  const num = `${PARTS.findIndex(([pid]) => pid === id) + 1}`.padStart(2, '0');
  const h = el('h3', { id: `${id}-h`, class: 'tq-h' }, el('span', { class: 'tq-num', text: num }), ' ', title);
  return el('section', { class: 'tq-part', id, 'aria-labelledby': `${id}-h` }, h, ...children);
}
const P = (html, cls) => el('p', { html, class: cls });
const UL = (items, cls) => el('ul', { class: cls || 'tq-list' }, ...items.map((t) => el('li', { html: t })));
// A tagged group of blocks (for example a heading with its list).
const G = (n, ...children) => T(el('div', { class: 'tq-grp' }, ...children), n);
// An advanced pearl: a key-point box labelled in its title.
const PEARL = (title, html) => T(callout('key', { title: `Advanced pearl: ${title}`, body: `<p>${html}</p>` }), 3);
const card = (title, items, cls) => el('div', { class: `tq-card ${cls}` }, el('p', { class: 'tq-card-h', text: title }), UL(items));
const ANSWER = (title, items) => el('div', { class: 'tq-answer' }, el('p', { class: 'tq-answer-h', text: title }), UL(items));

export function mount(root) {
  const api = {};
  root.append(
    keyPoints([
      'Do the gate checks first: consent, site and side, platelets and clotting, and when the last anticoagulant dose was.',
      'Monitoring, IV access, a drawn-up vasopressor and airway and resuscitation kit come before the needle.',
      'Pencil-point needle, L3–4 or below, 2% chlorhexidine in alcohol dried before puncture.',
      'Never inject through pain or paraesthesia, or without clear free-flowing CSF.',
      'Use the lowest dose that works. Go lower in older patients, and test both sides before incision.',
    ]),
    T(P('A single-shot spinal in an adult having lower-limb, urological, perineal or lower abdominal surgery. Work through it in order, or jump to the step you need.', 'sp-lead'), 1),
    T(details({
      id: 'tq-jump',
      summary: 'Jump to a step',
      body: el('ol', { class: 'sp-jump tq-jump', 'aria-label': 'Steps in this chapter' },
        ...PARTS.map(([id, t], i) => el('li', {}, el('a', { href: `#${id}` }, el('span', { class: 'tq-jump-n', text: String(i + 1).padStart(2, '0') }), t)))),
    }), 1),
  );

  // ---------------------------------------------------------------- 1 preparation
  root.append(part('tq-prep', 'Preparation',
    T(el('div', { class: 'tq-two' },
      el('div', {},
        UL([
          `<strong>Monitoring:</strong> ECG, non-invasive blood pressure and SpO₂ at minimum. Start them before the block and continue for at least ${N('30 min')} after the block is complete. Use capnography if a sedated patient stops responding to voice.${cite('tq-klein2021')}`,
          '<strong>IV access</strong> in place before the block, in an area equipped for resuscitation, with the anaesthetist in constant attendance.',
          '<strong>Vasopressor drawn up.</strong> Treat hypotension promptly: see <a href="#ts-hypotension">Hypotension and bradycardia</a>. Have atropine, oxygen, airway equipment and general anaesthetic drugs ready in case the block is high or fails.',
          '<strong>Fasting</strong> as for a general anaesthetic, because you may need to convert.',
          '<strong>Antibiotics:</strong> if the operation needs prophylactic antibiotics, give them before the spinal needle goes in.',
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
    T(details({
      id: 'tq-preop',
      summary: 'Pre-op assessment: what to ask and examine',
      body: [
        P('Do this before the patient arrives in theatre, so there are no surprises at the bedside.'),
        el('div', { class: 'tq-two' },
          el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'History' }), UL([
            'Allergies, especially to local anaesthetics.',
            'Anticoagulants, antiplatelets, NSAIDs and herbal products: drug, dose and the time of the last dose.',
            'Bleeding tendency: easy bruising, bleeding after surgery or dental work, liver or kidney disease.',
            'Heart disease, especially aortic or mitral stenosis, and current blood pressure drugs.',
            'Neurological disease, back pain, sciatica or previous spinal surgery.',
            'Previous anaesthetics: any problem with a spinal, or a failed one.',
            'Fever, infection or sepsis today.',
          ])),
          el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'Examination and tests' }), UL([
            'Airway, in case you must convert to a general anaesthetic.',
            'Back: skin infection or tattoo at the site, deformity, scars, how well the patient can flex.',
            'Baseline power and sensation in the legs if there is any neurological history.',
            'Pulse, blood pressure and hydration.',
            'Platelet count and clotting if the history or the drugs call for it.',
            'Haemoglobin, and urea and electrolytes if indicated.',
          ]))),
        P('<strong>Patient factors.</strong> Can they lie still and understand you? Is an interpreter needed? Is the patient too anxious or confused for an awake technique? If so, discuss the options with your supervisor.'),
        P('<strong>Then decide:</strong> is a spinal right for this operation and its length? What is the back-up if it fails or wears off? What will the post-operative analgesia be?'),
      ],
    }), 1),
    T(P('The aim of the history is to find the problems that make a spinal unsafe (bleeding, infection, fixed cardiac output, a patient who cannot cooperate) and the ones that change the plan (back disease, frailty, age). Reduced cardiac reserve and hypovolaemia predict a larger fall in blood pressure; plan the fluid, the vasopressor and the dose with that in mind.'), 2),
    PEARL('look at the images', 'If the patient has had lumbar spine imaging, read the report or ask to see it. Severe canal stenosis, a low-lying conus, a tethered cord, or previous surgery or instrumentation at the planned level can change the level, the technique or the choice between spinal and general anaesthesia. This is a consultant decision.'),
    PEARL('a normal count is not the whole story', 'A normal platelet count does not exclude poor platelet function. Ask about antiplatelet drugs, NSAIDs, uraemia, liver disease and herbal products, and note that clotting results can be normal in a patient who is bleeding easily. When the history and the numbers disagree, trust the history and ask a senior.'),
  ));

  // ---------------------------------------------------------------- 2 consent
  const freq = el('ol', { class: 'tq-freq', 'aria-label': 'Words used for risk, with frequencies' },
    ...[['Very common', '1 in 10', 5], ['Common', '1 in 100', 4], ['Uncommon', '1 in 1,000', 3], ['Rare', '1 in 10,000', 2], ['Very rare', '1 in 100,000', 1]]
      .map(([w, n, k]) => el('li', { class: 'tq-freq-row' }, el('span', { class: 'tq-freq-w', text: w }), el('span', { class: 'tq-freq-bar', style: `--tq-w:${k * 20}%`, 'aria-hidden': 'true' }), el('span', { class: 'tq-freq-n sp-num', text: n }))));
  root.append(part('tq-consent', 'Indications and consent',
    G(1,
      P(`A spinal suits surgery below the umbilicus that will finish within the life of the block: about ${N('2–3 h')} with hyperbaric bupivacaine.`),
      UL([
        '<strong>Orthopaedics:</strong> hip and knee arthroplasty, hip fracture, ankle and foot, lower-limb trauma and amputation.',
        '<strong>Urology:</strong> TURP, TURBT, cystoscopy and ureteroscopy.',
        '<strong>Perineal and perianal:</strong> haemorrhoids, fistula, pilonidal sinus.',
        '<strong>Lower abdominal:</strong> inguinal hernia repair.',
      ])),
    G(1,
      el('h4', { text: 'What to discuss' }),
      table({
        caption: 'Risks to mention, in plain words',
        head: ['Risk', 'How often', 'Say'],
        rows: [
          [{ th: true, html: 'Low blood pressure' }, 'Very common to common', 'Treated with fluids and drugs.'],
          [{ th: true, html: 'Itching' }, 'Very common to common', 'Mainly with spinal opioids. Treatable.'],
          [{ th: true, html: 'Difficulty passing urine' }, 'Very common to common', 'Lasts as long as the block. A catheter may be needed for a while.'],
          [{ th: true, html: 'Pain or tingling during the injection' }, 'Very common to common', 'Tell me straight away if you feel it in your legs or bottom.'],
          [{ th: true, html: 'Headache' }, 'Uncommon; less common still in older patients', 'Can follow a spinal. Tell us if it is worse sitting up. See <a href="#cx-pdph">post-dural puncture headache</a>.'],
          [{ th: true, html: 'Temporary nerve damage' }, 'Rare', 'Numbness or weakness that nearly always recovers in days to weeks.'],
          [{ th: true, html: 'Permanent nerve damage' }, `Rare: roughly ${N('1 in 24,000')} to ${N('1 in 54,000')} in the UK audit (NAP3, all central neuraxial blocks)`, 'Rare, but tell the patient it can happen.'],
        ],
      }),
      P('Also cover: the alternative (general anaesthesia), sedation if wanted, that pulling and pressure may still be felt, and what happens if the block is not good enough (more local anaesthetic, or a general anaesthetic). Record what you discussed.')),
    G(2,
      P('Consent is about what <em>this</em> patient would want to know (the Montgomery test), not what a body of doctors would say. Check capacity; if the patient lacks it, follow the best-interests process and involve the family. The RCoA and Association of Anaesthetists patient leaflet uses these words for risk:'),
      freq),
    T(P(`<strong>NAP3 numbers.</strong> Permanent harm was ${N('4.2 per 100,000')} on pessimistic counting and ${N('2.0 per 100,000')} on optimistic counting. Paraplegia or death was ${N('1.8')} and ${N('0.7 per 100,000')}. Spinals were among the lower-risk blocks; most harm followed perioperative epidurals. The data are from 2006–07.`), 2),
    T(callout('key', { title: 'Consent figures', body: '<p>The RCoA published updated spinal risk infographics in 2025. Use them when quoting numbers to patients.</p>' }), 2),
    G(2,
      el('h4', { text: 'When a spinal is especially useful' }),
      UL([
        '<strong>Severe lung disease:</strong> no airway instrumentation and no ventilation, provided the block stays low.',
        '<strong>Malignant hyperthermia risk:</strong> avoids the trigger agents.',
        '<strong>Autonomic dysreflexia</strong> (spinal cord injury above T6): a spinal blocks the reflex more completely than an epidural.',
      ]),
      el('h4', { text: 'High-risk patients: agree the rescue plan first' }),
      P('Before the day, tell the surgeon the patient is high risk and agree that the benefit is worth it. Agree what you will do if the patient cannot cooperate or the block fails. Explain a rescue general anaesthetic to the patient and family, record their decision, and plan for extra help.')),
    G(2,
      el('h4', { id: 'tq-cse', text: 'Combined spinal–epidural (CSE)' }),
      P('A spinal plus an epidural catheter, placed at the same time. It suits surgery that may outlast a single shot, because you can top up through the catheter. It also allows a smaller spinal dose, which can mean less hypotension, with the epidural used to extend the block. The costs: it takes longer, the catheter is untested until the spinal wears off, and paraesthesia can be harder to judge. After a failed spinal, a CSE lets you add drug in small steps instead of repeating a full dose.')),
  ));

  // ---------------------------------------------------------------- 3 contraindications
  root.append(part('tq-contra', 'Contraindications',
    T(el('div', { class: 'tq-two' },
      card('Absolute', [
        'Patient refuses or cannot consent.',
        'Infection at or next to the puncture site.',
        'Raised intracranial pressure from a mass lesion.',
        'True allergy to the local anaesthetic.',
        'Significant coagulopathy, or an anticoagulant not stopped for long enough: see <a href="#tq-anticoag">Anticoagulants</a>.',
      ], 'tq-card--abs'),
      card('Relative', [
        'Fixed cardiac output: severe aortic or mitral stenosis, LVOT obstruction. See <a href="#pp-aortic-stenosis">fixed output</a>.',
        'Severe hypovolaemia: correct it first, because sudden severe hypotension can follow.',
        'Sepsis or bacteraemia: see <a href="#pp-sepsis">sepsis</a>.',
        'Pre-existing neurological disease: examine and document the deficit first.',
        'Spinal deformity or previous spinal surgery: see <a href="#ch-backs">Difficult backs</a>.',
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
  registerSearch(lookup.searchItems);
  root.append(part('tq-anticoag', 'Anticoagulants and antiplatelet drugs',
    T(callout('key', {
      title: 'Single-shot spinals only',
      body: '<p>These are the <strong>minimum</strong> intervals for a <strong>single-shot spinal with no catheter</strong>. Where a guideline gives a rule for catheter removal, agree the timing of the next dose with the surgical team. Aspirin alone does not usually delay a spinal.</p>',
    }), 1),
    T(lookup.node, 1),
    T(P(`Spinal haematoma is rare but catastrophic. The intervals are built from pharmacokinetics, because the event is too rare to study in trials. The two current guidelines are ASRA 2025 and ESAIC/ESRA 2022.${cite('asra2025', 'esaic2022')}`), 2),
    G(2,
      el('h4', { text: 'Rules that apply to every drug' }),
      UL([
        `On more than one drug: use the longest interval.${cite('esaic2022')}`,
        `Ultrasound guidance does not shorten the interval, and nor does non-specific reversal (PCC, aPCC or andexanet) of a DOAC.${cite('esaic2022')}`,
        `A bloody tap may justify a longer gap before the next dose. Decide with the team: <a href="#ts-bloody-tap">bloody tap</a>.${cite('esaic2022')}`,
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
      P(`Residual drug: a DOAC level under ${N('30 ng/mL')}, or an anti-Xa activity of ${N('0.1 IU/mL')} or less for anti-Xa drugs and LMWH, is the usual target if you measure before a block.${cite('asra2025', 'esaic2022')}`)),
    T(callout('key', { title: 'The 2013 UK table is out of date for DOACs', body: `<p>The Association of Anaesthetists’ 2013 guideline is under review. Its DOAC intervals are shorter than both current guidelines, so don’t teach them as current.${cite('aagbi2013')}</p>` }), 3),
  ));

  // ---------------------------------------------------------------- 5 position
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
    T(callout('pearl', { title: 'Position changes spread', body: `<p>With hyperbaric bupivacaine at L3–4, sitting for 2 minutes and then lying flat keeps the block lower, because the drug pools in the sacral curve. The same dose given lying on the side and then turned flat rises a few segments higher, towards the thoracic curve.</p>` }), 2),
    PEARL('tilting after the injection', 'Until the level fixes (about 20 minutes), a small head-down tilt moves hyperbaric drug upwards and a head-up tilt keeps it lower. A head-up tilt also pools blood in the legs, so avoid it when the blood pressure is low. Tilt only on purpose and with the blood pressure watched, because the sympathetic block rises with the sensory level. Unplanned tilts, such as the surgeon asking for a lithotomy or Trendelenburg position early, are a common reason for a block that goes higher than expected.'),
  ));

  // ---------------------------------------------------------------- 6 asepsis
  root.append(part('tq-asepsis', 'Asepsis',
    T(steps([
      { title: 'Scrub and dress', body: 'Wash your hands thoroughly with a surgical scrub. Wear a cap, a mask and sterile gloves; the guideline also recommends a sterile gown. Use a large sterile drape.' },
      { title: 'Use 2% chlorhexidine in 70% alcohol', body: `Chlorhexidine is toxic to nerves, so the steps below (keep it away from the kit, let it dry fully) matter. The Association of Anaesthetists guideline suggests ${D('0.5%')}, as there is no convincing evidence that ${D('2%')} works better against bacteria.${cite('tq-campbell2014')}` },
      { title: 'Keep chlorhexidine away from drugs and needles', body: 'Don’t pour it into pots on the same trolley as your spinal kit. Cover the kit while you apply it, whether by swab, applicator or spray.' },
      { title: 'Let it dry', body: 'Wait until the skin is dry before you feel for landmarks or puncture it.' },
      { title: 'Check your gloves', body: 'If chlorhexidine may have got onto your gloves, change them.' },
    ]), 1),
    T(P('The source is the Association of Anaesthetists’ skin antisepsis guideline for neuraxial blocks. Chlorhexidine on the needle or in the syringe is a recognised route to adhesive arachnoiditis and nerve injury; the point of keeping it apart and letting it dry is to stop it entering the CSF.'), 2),
  ));

  // ---------------------------------------------------------------- 7 needles (before approach in the figures, but figure state is shared)
  const mqNarrow = window.matchMedia('(max-width:640px)');
  const ndFig = figure({ id: 'tq-fig-needles', num: '2.4', caption: 'Cutting versus pencil-point tips. With a pencil-point needle the whole side opening must be inside the dura before CSF flows freely and before you inject. Original drawing, not to scale.', plate: 'paper', aspect: '560/270' });
  const ndAspect = () => (mqNarrow.matches ? '560/360' : '560/270');
  ndFig.stage.style.aspectRatio = ndAspect();
  ndFig.stage.append(needlesSvg({ narrow: mqNarrow.matches }));
  root.append(part('tq-needles', 'Needles',
    T(el('div', { class: 'tq-rule' },
      el('p', { html: '<strong>Rule for adults:</strong> use a <strong>pencil-point</strong> needle, as fine as you can handle (commonly 25G–27G), through an introducer.' }),
      el('p', { html: 'Do not use a 22G cutting (Quincke) needle for a routine spinal. In obesity, choose a <em>longer pencil-point</em> needle of the same fine gauge. If only a thicker cutting needle is long enough, take a senior decision and tell the patient the headache risk is higher.' })), 1),
    el('div', { class: 'sp-split tq-split' },
      el('div', {},
        T(table({
          caption: 'Needle tips',
          head: ['Tip', 'Examples', 'Notes'],
          rows: [
            [{ th: true, html: 'Cutting (bevelled)' }, 'Quincke', 'Sharp tip with the opening on the bevel. More headache.'],
            [{ th: true, html: 'Pencil-point (non-cutting)' }, 'Whitacre, Sprotte, Pencan, Gertie Marx', 'Closed conical tip, side opening behind it. Fewer headaches. Usual for adult surgical spinals.'],
          ],
        }), 1),
        T(UL([
          '<strong>Introducer:</strong> fine needles bend easily. The introducer guides them through skin and ligament and keeps them on line. It also stops a plug of skin being carried into the CSF.',
          '<strong>Cutting needle bevel:</strong> if you must use one, turn the bevel parallel to the long axis of the spine (facing up or down with the patient on their side), so it parts the dural fibres instead of cutting across them.',
          '<strong>Length:</strong> a standard-length needle suits most adults; have a longer one ready for obesity or the Taylor approach.',
        ]), 1),
        T(UL([
          `<strong>Tip design matters more than gauge.</strong> In the Cochrane review, cutting needles roughly doubled post-dural puncture headache compared with pencil-point needles (risk ratio ${N('2.14')}, 95% CI ${N('1.72–2.67')}; about ${N('64')} vs ${N('30 per 1,000')}). Gauge made no consistent difference in the Cochrane review, but the 2023 multisociety consensus found that narrower gauges lower the risk, clearly so for cutting needles.${cite('uppal2023')} Use the finest pencil-point needle you can handle.`,
          `A meta-analysis of 110 trials of lumbar puncture for any reason found the same: atraumatic needles cut headache (risk ratio ${N('0.40')}, 95% CI ${N('0.34–0.47')}).`,
          'The cutting tip divides dural fibres. A pencil-point tip parts them, so the hole closes better. Flow through a needle falls steeply with a smaller bore (Hagen–Poiseuille: flow depends on the fourth power of the radius), so fine needles are slower to give CSF.',
        ]), 2),
        PEARL('do not steer a bent needle', 'A fine needle that has met bone or calcified ligament may be bent even if it looks straight. If it deviates or you meet repeated resistance, withdraw it fully and reinsert it through the introducer rather than trying to steer it from inside the tissue. Check the needle after a difficult pass. With a pencil-point needle, the side opening is a few millimetres behind the tip, so a tip that seems to be in the subarachnoid space may have its opening only partly through the dura. This is the usual reason for slow, doubtful flow.')),
      T(el('div', { class: 'sp-split-fig' }, ndFig.fig), 2)),
  ));

  // ---------------------------------------------------------------- 8 approach
  const apFig = figure({ id: 'tq-fig-approach', num: '2.3', caption: 'Back view of one lumbar interspace. The midline needle enters in the middle of the gap; the paramedian needle starts just lateral and caudal and aims medially and upwards. Original drawing, not to scale.', plate: 'paper', aspect: '480/320' });
  const apAspect = () => (mqNarrow.matches ? '480/400' : '480/320');
  let apSvg = approachSvg({ narrow: mqNarrow.matches });
  apFig.stage.style.aspectRatio = apAspect();
  apFig.stage.append(apSvg);
  const apText = el('div', { class: 'tq-ap-text', 'aria-live': 'polite' });
  const AP = {
    midline: {
      html: '<p><strong>Midline.</strong> Raise a skin wheal in the middle of the chosen gap. Pass the introducer, then the spinal needle, angled slightly upwards (cephalad), parallel to the spinous processes. The needle crosses skin, fat, supraspinous and interspinous ligaments, ligamentum flavum, the epidural space and the dura–arachnoid. Bone shallow is usually spinous process; bone deep is usually lamina, so recheck the midline and the angle.</p>',
      sr: 'Midline approach selected: needle entry in the middle of the gap between the spinous processes.',
    },
    paramedian: {
      html: '<p><strong>Paramedian.</strong> Enter just lateral to the midline and slightly below the gap, then aim medially and upwards, missing the ligaments. It helps when the patient cannot flex well or the midline has failed. Steps, entry point and angles: <a href="#sx-paramedian">The paramedian approach</a> in the Backs chapter.</p>',
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
  root.append(part('tq-approach', 'Approach: midline, paramedian and Taylor',
    el('div', { class: 'sp-split tq-split' },
      el('div', {},
        T(P('<strong>Choose L3–4 or below.</strong> The conus can sit lower than expected and the level you palpate is often higher than you think. How to find the level, and the layers the needle crosses: <a href="#an-landmarks">Anatomy: surface landmarks</a> and <a href="#an-layers">the layers</a>.'), 1),
        T(apText, 1),
        G(2,
          el('h4', { id: 'tq-taylor', text: 'Taylor approach (L5–S1)' }),
          P('L5–S1 is the largest interlaminar gap and is often spared by degenerative change. Enter just medial and below the posterior superior iliac spine and aim upwards and medially. It can help in ankylosing spondylitis, kyphoscoliosis and older patients. A longer needle is often needed. Angles and entry: <a href="#sx-taylor-fig">Backs chapter</a>.')),
        PEARL('count up, then check', 'If you are unsure of the level, palpate the iliac crests, count the spinous processes and then choose the gap below your estimate, because errors usually run towards a higher space. If a pre-procedure ultrasound scan is available, use it to confirm the level and the midline. When a first approach fails, change something real: the gap, the side of a paramedian entry, the patient’s position or the approach, rather than repeating the same pass.')),
      T(el('div', { class: 'sp-split-fig' }, apFig.fig), 2)),
  ));

  // ---------------------------------------------------------------- 9 CSF and injection
  root.append(part('tq-csf', 'Confirming CSF and injecting',
    T(steps([
      { title: 'Wait for free flow of clear CSF', body: 'Remove the stylet. Fine pencil-point needles can take several seconds to fill. If flow is slow, rotate the needle in quarter turns: part of the side opening may still be in the dura. Gentle suction with a small syringe can also help. If CSF flows well in only one position, the opening is probably not fully inside: advance a millimetre or two and check again.' },
      { title: 'Stabilise the needle', body: 'Hold the hub between finger and thumb, with the back of that hand resting on the patient’s back, so the needle cannot move while you attach the syringe.' },
      { title: 'Aspirate before you inject', body: 'Draw back a little CSF to confirm the needle is still in the subarachnoid space. With hyperbaric drug you will see the glucose “swirl”.' },
      { title: 'Inject slowly', body: 'Many anaesthetists aspirate again midway or at the end to confirm the tip has not moved. Avoid vigorous barbotage.' },
      { title: 'Remove the needle and lay the patient as planned', body: 'Take the needle and introducer out together. Then check blood pressure and heart rate straight away, every 1 to 2 minutes at first.' },
    ]), 1),
    T(callout('warn', { title: 'Never inject if…', body: '<ul><li>the patient has pain on injection, or paraesthesia that persists: stop, withdraw and redirect (a brief shock that has gone, with free CSF, is common: see <a href=\"#ts-paraesthesia\">paraesthesia</a>);</li><li>the CSF is not clearly flowing, or is still bloody;</li><li>you are unsure where the tip is.</li></ul>' }), 1),
    T(P('What to do next: <a href="#ts-dry-tap">dry tap</a> · <a href="#ts-bloody-tap">bloody tap</a> · <a href="#ts-paraesthesia">paraesthesia</a>.', 'tq-links'), 1),
  ));

  // ---------------------------------------------------------------- 10 drugs
  const doseTable = table({
    caption: 'Intrathecal local anaesthetics: typical doses for an average adult',
    head: ['Drug', 'Dose', 'Onset', 'Duration', 'Notes'],
    rows: [
      [{ th: true, html: 'Hyperbaric bupivacaine 0.5%<span class="tq-cell-sub">Marcain Heavy; Marcain Spinal 0.5% Heavy (Singapore)</span>' },
        `<strong>Typical:</strong> knee replacement ${D('2.5 mL')} (${D('12.5 mg')}); shorter lower-limb surgery about ${D('2 mL')} (${D('10 mg')}); caesarean ${D('2.2–2.3 mL')} (${D('11–11.5 mg')}).`,
        D('5–8 min'),
        `${D('1.5–3 h')}; urological ${D('2–3 h')}`,
        `Use the lowest dose that works. Reduce the dose in older patients (risk of a high block).${cite('tq-hpra-heavy')}`],
      [{ th: true, html: 'Plain (isobaric) bupivacaine 0.5%<span class="tq-cell-sub">Marcain 0.5% (Singapore label)</span>' },
        `<strong>Typical:</strong> hip surgery, including frail hip fracture, ${D('2.5–3 mL')} (${D('12.5–15 mg')}). ${D('3 mL')} is the most, for an operation that needs a long block.`,
        'Not stated',
        `Lower limb surgery lasting ${D('3–4 h')}`,
        'Slightly hypobaric at body temperature, so spread is less predictable.'],
      [{ th: true, html: 'Prilocaine 2% hyperbaric<span class="tq-cell-sub">Prilotekal</span>' },
        `${D('40–60 mg')} (${D('2–3 mL')}) for a block to T10; maximum ${D('80 mg')} (${D('4 mL')})${cite('tq-prilotekal')}`,
        'Not stated',
        `About ${D('100–130 min')}`,
        'Short acting; suits day surgery. Reduce in poor general condition or liver or kidney impairment.'],
    ],
  });
  const spread = spreadFactors([
    { rank: '1', name: 'Baricity and position', weight: 3, who: 'you', body: '<p>Hyperbaric solution runs downhill. Sitting keeps it low; lying flat soon after lets it spread higher. Plain bupivacaine is slightly hypobaric at body temperature, so it is less predictable.</p>' },
    { rank: '2', name: 'Dose of drug', weight: 3, who: 'you', body: '<p>The dose (mass) given matters more than volume or concentration on their own. With a fixed 0.5% solution, more volume means more spread.</p>' },
    { rank: '3', name: 'Lumbosacral CSF volume', weight: 3, who: 'pt', body: '<p>Varies a lot between people and explains much of the variation in block height, but you cannot measure it at the bedside.</p>' },
    { rank: '4', name: 'Age', weight: 2, who: 'pt', body: '<p>Older patients tend to get higher blocks. The label says to reduce the dose.</p>' },
    { rank: '5', name: 'Raised intra-abdominal pressure', weight: 2, who: 'pt', body: '<p>Obesity, ascites or a large abdominal mass reduce CSF volume, so the block may go higher.</p>' },
    { rank: '6', name: 'Speed of injection and barbotage', weight: 1, who: 'you', body: '<p>Small and inconsistent effects. A slow injection is more predictable.</p>' },
    { rank: '7', name: 'Interspace used', weight: 1, who: 'you', body: '<p>Only a small effect on the final height of the block.</p>' },
    { rank: '8', name: 'Spinal curves', weight: 1, who: 'pt', body: '<p>Lying flat, hyperbaric solution collects in the lowest parts of the thoracic and sacral curves. Kyphosis or scoliosis changes where it pools.</p>' },
    { rank: '9', name: 'Height, weight and sex', weight: 1, who: 'pt', body: '<p>Little consistent effect on their own within the normal adult range.</p>' },
  ]);
  root.append(part('tq-drugs', 'Drugs and doses',
    T(ANSWER('Answer first', [
      `Most lower-limb surgery: <strong>hyperbaric bupivacaine 0.5%</strong>, typically ${D('2.5 mL')} for a knee replacement and about ${D('2 mL')} for shorter operations. Hip surgery: <strong>plain bupivacaine 0.5%</strong>, ${D('2.5–3 mL')}, and ${D('3 mL')} at most. Use the lowest dose that works.`,
      'Short day-case surgery: hyperbaric prilocaine.',
      `Older or frail: the typical dose or less; for a frail hip fracture, plain bupivacaine 0.5% ${D('2.5–3 mL')}.`,
      'Use preservative-free preparations only. Check the drug, the concentration and the label twice. Keep the spinal syringe apart from the others.',
    ]), 1),
    T(callout('key', {
      title: 'About the doses',
      body: '<p>Bupivacaine doses are what this department usually gives. This chapter gives no doses for intrathecal clonidine, dexmedetomidine or diamorphine. Pharmacology, adjuvant doses and vasopressors: <a href="#ch-pharm">Pharmacology</a>.</p>',
    }), 1),
    T(doseTable, 1),
    T(UL([
      '<strong>Lidocaine</strong> is no longer recommended for spinals: it causes transient neurological symptoms far more often than bupivacaine.',
      '<strong>Levobupivacaine and ropivacaine:</strong> check the licence before use. No dose is given here.',
      'Drug choice by situation: <a href="#ph-agents">Intrathecal agents at a glance</a>.',
    ]), 2),
    G(2,
      el('h4', { id: 'tq-adjuncts', text: 'Opioid adjuncts: monitoring' }),
      el('div', { class: 'tq-two' },
        card('Fentanyl (lipophilic)', [
          'Quick onset and short action. Itch and early respiratory depression.',
          `Monitor for at least ${N('2 h')}: continually for the first ${N('20 min')}, then at least hourly to ${N('2 h')}.${cite('tq-asa2016')}`,
        ], 'tq-card--plain'),
        card('Morphine (hydrophilic)', [
          `PROSPECT (2026 update): low-dose intrathecal morphine ${D('100 microgram')} (${D('0.1 mg')}) <em>may be considered</em> with a spinal in inpatients having a hip replacement. For knee replacement, only when neither an adductor canal block nor local infiltration analgesia is possible.`,
          `Slow onset; analgesia for many hours. Itch, nausea, urinary retention and <strong>delayed</strong> respiratory depression. Monitor for at least ${N('24 h')}: at least hourly for ${N('12 h')}, then at least every ${N('2 h')} to ${N('24 h')}. Keep naloxone and oxygen available.${cite('tq-asa2016')}`,
          `Not for day-case patients going home the same day.${cite('tq-asa2016')}`,
        ], 'tq-card--plain')),
      P('The opioid comparison table is in <a href="#ph-adjuvants">Pharmacology</a>.')),
    G(2,
      el('h4', { id: 'tq-spread-h', text: 'What changes the spread' }),
      P('Ranked from the strongest effect. Tap a factor for the detail.'),
      spread),
    PEARL('the dose is a starting point', 'Typical doses are for an average adult. In a frail, older or short patient, or one with a raised intra-abdominal pressure, a smaller dose is usual. A smaller dose gives a more stable circulation but a shorter and less reliable block, so have a plan for converting to a general anaesthetic or for adding sedation if surgery runs on.'),
  ));
  registerSearch([{ title: 'Factors that change spread of a spinal block', text: 'Baricity position dose CSF volume age intra-abdominal pressure speed of injection barbotage interspace spinal curves height weight sex block height level', id: 'tq-spread-h' }]);

  // ---------------------------------------------------------------- 11 saddle and unilateral
  root.append(part('tq-saddle', 'Saddle block and unilateral spinal',
    T(P('Two ways of limiting how far, and to which side, the block goes. Both depend on a hyperbaric solution settling by gravity, so what you do in the minutes after the injection matters as much as the dose. Use a small dose, injected slowly, and agree the drug and dose with your supervisor.'), 2),
    el('div', { class: 'tq-two' },
      T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'Saddle block' }), UL([
        'Blocks the sacral roots only: the perineum, anus and inner thighs. For short perineal or anorectal surgery.',
        'The patient sits for the injection and stays sitting afterwards, so the hyperbaric drug settles in the lowest part of the dural sac.',
        'Use an interspace at L3–4 or below.',
        'Keep the patient sitting for a few minutes, then lie them back carefully. Check the level at once and again as it settles.',
      ])), 2),
      T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'Unilateral spinal' }), UL([
        'Aims for a block mainly on the operative side, with less sympathetic block and less fall in blood pressure.',
        'Lie the patient on the operative side (the hyperbaric drug settles on the dependent side).',
        'Inject slowly, and keep the patient on that side after the injection. The longer the patient stays there, the more one-sided the block.',
        'Do not turn the patient flat until the level has fixed. Test both sides and be ready for a block that spreads further than planned.',
      ])), 2)),
    G(2,
      el('h4', { text: 'Choosing the drug' }),
      P('A hyperbaric solution gives the most predictable result for both techniques. Plain bupivacaine is slightly hypobaric at body temperature, so its spread is less reliable. Prilocaine is short acting and suits brief perineal day-case surgery.')),
    PEARL('orient the needle opening', 'With a pencil-point needle, turn the side opening towards the side you want to block before you inject (for a unilateral block, towards the dependent side). The jet then goes towards that side first. Test both legs afterwards; a block that has become bilateral is common and is not a failure, but you must know about it.'),
    PEARL('prone jack-knife and hypobaric solutions', 'For anorectal surgery in the prone jack-knife position, some anaesthetists use hypobaric or specially prepared solutions so that the drug rises towards the sacral roots. Do this only with senior supervision.'),
  ));

  // ---------------------------------------------------------------- 12 testing (+ time course)
  const tlFig = figure({ id: 'tq-fig-timecourse', num: '2.5', caption: `Hyperbaric bupivacaine 0.5%: onset ${D('5–8 min')}, duration ${D('1.5–3 h')} depending on dose and site (product label). The level keeps moving for the first 20 minutes or so. Shading after 1.5 h shows the range of duration.`, plate: 'none', aspect: 'auto' });
  const drawTl = () => {
    const w = tlFig.stage.clientWidth || 600;
    const s = timelineSvg(w);
    s.setAttribute('aria-label', 'Timeline after injecting hyperbaric bupivacaine 0.5%: block onset at 5 to 8 minutes; level still moving until about 20 minutes; surgical block lasting about 1.5 to 3 hours. Suggested checks at 5, 10 and 20 minutes and again before incision.');
    tlFig.stage.replaceChildren(s);
  };
  whenVisible(tlFig.fig, () => { if (!tlFig.stage.firstChild) drawTl(); });
  let lastW = 0;
  onResize(tlFig.stage, (r) => { if (r.width > 0 && Math.abs(r.width - lastW) > 4) { lastW = r.width; drawTl(); } });
  root.append(part('tq-testing', 'Testing the block',
    T(ANSWER('Answer first', [
      'Test <strong>both sides</strong>. Start in the blocked area and move upwards until the patient feels a change, comparing with an unblocked area such as the shoulder.',
      'Pinprick level is the one to use for the surgical level. Record the level, the Bromage score and the time.',
      `Recheck at 5, 10 and 20 minutes, and before incision. The level is mostly fixed by about ${N('20 min')}.`,
    ]), 1),
    T(el('div', { class: 'tq-modes' },
      ...[
        ['Cold', 'Ethyl chloride spray or ice. Quick, and gives the highest level, so it overestimates the surgical block.'],
        ['Pinprick', 'A blunted pin or Neurotip. The usual test of the surgical level.'],
        ['Light touch', 'The strictest test; its level is the lowest of the three.'],
        ['Motor', 'Modified Bromage score, below.'],
      ].map(([t, b]) => el('div', { class: 'tq-mode' }, el('p', { class: 'tq-mode-h', text: t }), P(b)))), 1),
    T(table({
      caption: 'Surface landmarks for the sensory level',
      head: ['Level', 'Landmark'],
      rows: [
        [{ th: true, html: 'T4' }, 'Nipples'],
        [{ th: true, html: 'T6' }, 'Xiphisternum'],
        [{ th: true, html: 'T10' }, 'Umbilicus'],
        [{ th: true, html: 'L1' }, 'Inguinal ligament (groin)'],
        [{ th: true, html: 'S2–S5' }, 'Perineum and saddle area'],
      ],
    }), 1),
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
    T(P('Fibres are blocked in a fixed order: sympathetic, then cold, then pinprick, then touch, then motor. They recover in reverse. The sympathetic block usually extends about 2 segments or more above the sensory level, and the motor block about 2 segments or more below it. Full physiology: <a href="#an-differential">differential block</a>. Definitions of the Bromage score vary between sources; say which version you are using.'), 2),
    G(2,
      el('h4', { id: 'tq-check-h', text: 'Is it ready? A quick check' }),
      blockCheck([
        { id: 'turp', label: 'TURP', target: 10, why: 'TURP: T10 is the level commonly quoted, to cover bladder distension.' },
        { id: 'hip', label: 'Hip', target: 10, why: 'Hip surgery: T10 is commonly quoted; some accept lower for arthroplasty. The conservative figure is used here.' },
        { id: 'knee', label: 'Knee', target: 10, why: 'Knee surgery: T10 is commonly quoted, and also covers a thigh tourniquet more reliably.' },
        { id: 'hernia', label: 'Inguinal hernia', target: 8, why: 'Inguinal hernia: the incision is at T12–L1, but traction on the sac and peritoneum needs at least T10, and many aim for T8. T8 is used here.' },
      ])),
    T(callout('key', { title: 'Target levels', body: '<p>These targets are commonly quoted teaching figures, not taken from a guideline. Agree the level you need with the surgeon. Organs are supplied from higher segments than the skin over them (the peritoneum from about T4, the bladder from about T10), so choose the level for the deepest structure handled, not the incision.</p>' }), 2),
    T(callout('warn', { title: 'Is the block rising too high?', body: '<p>Check early (at about a minute) and keep checking over the first 10 minutes, while you can still change position. Tingling or numbness in the hands, or weak hand grip, means the block is nearing the nerves to the diaphragm (C3–C5): lie the patient flat, not head-down, and get help. A patient who can talk in a normal voice is usually breathing adequately. Feeling breathless because the chest wall is numb is common: reassure, and keep watching.</p>' }), 1),
    el('div', { id: 'tq-timecourse', class: 'tq-grp' },
      T(el('h4', { text: 'Time course' }), 1),
      T(UL([
        `<strong>Onset:</strong> ${D('5–8 min')} for hyperbaric bupivacaine. <strong>Duration:</strong> ${D('1.5–3 h')} for lower-limb and abdominal doses, ${D('2–3 h')} for urological doses; leg muscle relaxation lasts about ${D('2–2.5 h')}.`,
        '<strong>Settling:</strong> after about 20 minutes, tilting the patient has little effect. Reassess the level and blood pressure until the block is stable, and whenever surgery runs long.',
        'A dense motor block that lasts much longer than expected, or comes back after it had started to wear off, needs urgent review for a spinal haematoma or abscess. See <a href="#ch-complications">Complications</a>.',
      ]), 1),
      T(details({ summary: 'Show the time-course figure', body: tlFig.fig }), 2)),
    PEARL('a patchy or one-sided block', 'Test before incision and not only by the clock. A block that is higher on one side, or that has a gap, is usually a position or injection effect and may still be fixing. Wait and test again before you give more drug or turn the patient. Cold testing shows the highest level and the sympathetic edge, so a surgeon who reports pain below a block you called adequate is usually right; test pinprick at the operative site.'),
  ));

  // ---------------------------------------------------------------- 13 sedation
  root.append(part('tq-sedation', 'Sedation during a spinal',
    T(ANSWER('Answer first', [
      'Explain first. Many patients need only reassurance, a warm blanket and a calm voice.',
      'If you add sedation, keep it light enough that the patient answers to voice. Titrate small amounts and keep monitoring as for a general anaesthetic, with capnography if the patient stops responding.',
      'A patient who is unresponsive is no longer sedated: they need an airway plan.',
    ]), 1),
    G(1, UL([
      'Sedation adds to the effect of a high block on breathing and blood pressure. Be slower and lighter in older patients, in obesity and in sleep apnoea.',
      'Do not sedate to cover a block that is not working. Test the block and plan a general anaesthetic if it is inadequate.',
      'Hip fracture: heavy sedation adds hypotension, hypoxia and delirium.',
    ])),
    G(2, UL([
      'A spinal removes afferent input to the brain, so the sedative needed is often less than expected. A patient who seems very drowsy soon after the block may be over-sedated.',
      'Common choices are a short-acting hypnotic or a small dose of a benzodiazepine or alpha-2 agonist. Pick the drug and dose from your department formulary; none is given here.',
      'Monitoring standard and the 30 minute rule: <a href="#tq-prep">Preparation</a>.',
    ])),
    PEARL('sedation depth is a continuum', 'Moderate sedation slides into deep sedation without warning, especially with opioids in the spinal. If you cannot keep the patient at the level you intended, stop adding drug and reassess the block and the airway.'),
  ));

  // ---------------------------------------------------------------- 14 populations
  root.append(part('tq-populations', 'Special patients', ...populationsBlocks()));

  // ---------------------------------------------------------------- 15 hip fracture
  root.append(part('tq-hipfracture', 'Spinal for hip fracture: a worked example',
    T(P('An older, frail patient with a painful hip, often dehydrated, anaemic and on several drugs. The same steps as any spinal, with four changes: analgesia first, a careful position, a lower dose and a plan for low blood pressure.'), 1),
    T(steps([
      { title: 'Before you move the patient', body: 'Check anticoagulant and antiplatelet timing with the <a href="#tq-ac-lookup">finder</a>, the platelet count, haemoglobin, electrolytes and the ECG. Correct hypovolaemia first. Assess cognition and capacity, and talk to the family if the patient cannot consent.' },
      { title: 'Give the analgesic block first', body: `A fascia iliaca, femoral or PENG block before positioning makes the move kinder and is often what lets the patient stay still. The Association of Anaesthetists’ hip fracture guideline supports routine nerve blocks alongside spinal or general anaesthesia.${cite('pp-griffiths2021')} Use ultrasound, and keep a running total of the local anaesthetic you have given.` },
      { title: 'Set up as for any spinal', body: 'IV access, monitors, oxygen, airway kit and a vasopressor drawn up. Have the blood pressure cycling every minute or two while you position and inject.' },
      { title: 'Choose the position', body: 'Lateral is usual, and the best side depends on the drug. Plain bupivacaine is slightly lighter than CSF at body temperature, so it drifts upwards: lying operative side up is more comfortable and lets the drug float towards the fractured side. Hyperbaric drug sinks, so it needs operative side down, which hurts: use that only if the nerve block has worked.' },
      { title: 'Choose a dose at the cautious end', body: `The usual dose is ${D('2.5–3 mL')} (${D('12.5–15 mg')}) of plain bupivacaine 0.5%. ${D('3 mL')} is the most we give, for an operation that needs a long block. Inject slowly.` },
      { title: 'Be ready for low blood pressure', body: 'Expect it, and treat it early with a vasopressor: <a href="#ts-hypotension">Hypotension and bradycardia</a>. Look for a cause too: hypovolaemia, bleeding or a high block. Lie the patient flat as soon as it is safe, and give oxygen.' },
      { title: 'Keep the sedation light', body: 'Heavy sedation adds hypotension, hypoxia and delirium. Explain what is happening, keep the patient warm, and pad pressure points before the move to the operating table.' },
      { title: 'Hand over', body: 'Record the block level, drugs and any hypotension. Tell recovery about the nerve block, the dose given and the plan for analgesia.' },
    ]), 1),
    G(2,
      el('h4', { text: 'Spinal or general anaesthesia?' }),
      P('Neither has been shown to be clearly better for every hip fracture patient. In REGAIN, spinal and general anaesthesia gave similar recovery of walking at 60 days; see <a href="#pp-older">older patients</a>. Choose for the individual: airway, heart and lung disease, cognition, anticoagulants, the surgical plan and the patient’s wishes. A spinal can be a poor choice if the patient cannot keep still, but a failed spinal is not a reason for a rushed second attempt: convert to a general anaesthetic.')),
    T(callout('warn', { title: 'Hypotension readiness', body: '<ul><li>Vasopressor drawn up before you inject.</li><li>Blood pressure every 1 to 2 minutes from the injection until the level has fixed.</li><li>Slow, small boluses of fluid, not large ones, if the heart is weak.</li><li>A drop in blood pressure with a slow pulse needs atropine and a call for help.</li></ul>' }), 1),
    PEARL('bone cement', 'Cemented hemiarthroplasty can cause a sudden fall in blood pressure, hypoxia or arrhythmia around cementing and prosthesis insertion (bone cement implantation syndrome). Frailty and heart or lung disease raise the risk. A spinal does not prevent it. Tell the surgeon your concern before the cement goes in, raise the inspired oxygen, have the vasopressor ready, and treat early.'),
    PEARL('antiplatelets are common here', `Many hip fracture patients take aspirin or another antiplatelet drug. Look each one up in the <a href="#tq-ac-lookup">finder</a>; do not assume.${cite('asra2025')} Weigh any delay against the risk of a longer wait for surgery and discuss it with the surgeon and a senior.`),
  ));

  // ---------------------------------------------------------------- 16 post-op care (+ documentation)
  root.append(part('tq-postop', 'Post-op care and discharge',
    G(1,
      el('h4', { text: 'In recovery and on the ward' }),
      UL([
        '<strong>Regression:</strong> feeling and movement come back in the reverse of the order they went. Check that the patient can feel and move both legs before they stand.',
        '<strong>Protect the numb leg:</strong> support heels and pressure points, keep it away from heat, and keep the patient from putting weight on a leg they cannot feel. Use falls precautions until power and feeling are fully back.',
        '<strong>After a hip replacement:</strong> a numb leg cannot warn of a position that dislocates the new joint. Follow the surgeon’s hip precautions when turning or lifting the patient.',
        '<strong>Mobilising:</strong> the first time, stand the patient with help, sitting up first and standing slowly, because of low blood pressure and falls.',
        '<strong>Passing urine:</strong> retention is common until the block has gone. Ask the patient to pass urine, scan the bladder if needed, and catheterise if the patient cannot pass urine.',
        '<strong>Blood pressure, nausea, pain:</strong> treat each. Give regular analgesia before the block wears off, because pain can arrive suddenly, often at night. Pain as the block fades is expected; new pain that keeps getting worse is not.',
        `<strong>If intrathecal morphine was given:</strong> monitor as in <a href="#tq-adjuncts">Opioid adjuncts</a> (at least ${N('24 h')}).${cite('tq-asa2016')} Day-case discharge criteria: <a href="#pp-day-case">Day-case spinal</a>.`,
      ])),
    T(callout('warn', { title: 'Tell the ward to call you urgently for…', body: '<ul><li>back pain that is new, severe or getting worse;</li><li>leg weakness or numbness that is new, or returns after it had worn off, or lasts longer than expected (a single-shot spinal block still present 8 hours after injection is not normal);</li><li>new loss of bladder or bowel control, or numbness around the bottom;</li><li>fever, or redness and tenderness at the puncture site;</li><li>a headache that is worse sitting or standing and eases on lying flat;</li><li>drowsiness or slow breathing after intrathecal morphine.</li></ul><p>Do not wait for the morning round. A senior should be told straight away. See <a href="#ch-complications">Complications</a>.</p>' }), 1),
    T(P('Give these red flags to the ward in writing and in words. Day-case patients should go home with the same list and a contact number.'), 1),
    el('div', { id: 'tq-documentation', class: 'tq-grp' },
      T(el('h4', { text: 'Documentation' }), 1),
      T(P('Write the record straight after the block, while it is fresh.'), 1),
      el('div', { class: 'tq-two' },
        T(el('div', { class: 'tq-card tq-card--plain' }, el('p', { class: 'tq-card-h', text: 'The technique' }), UL([
          'Consent discussion, including the risks mentioned.',
          'Pre-op checks: anticoagulants, platelets, clotting.',
          'Time, position, and who assisted and supervised.',
          'Asepsis, level and approach (midline, paramedian or Taylor).',
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
      T(P('Record negative findings too: “no paraesthesia”, “no blood in the CSF”. If the record is silent, a later reader cannot tell whether it did not happen or was not noted.'), 2)),
    PEARL('write down the awkward spinal', 'After a bloody tap, a paraesthesia or several attempts, note the details of what the patient felt, what you did and what you told them. Record a baseline leg examination, and name the person you handed over to. If a deficit appears later, a clear contemporaneous note helps the next clinician judge whether it is new, and how fast to act.'),
    PEARL('make the late haematoma easy to catch', 'Epidural or spinal haematoma is most likely to present when the block should be wearing off or after an anticoagulant is restarted. Ask the ward to check the legs at regular intervals during that time, and make sure the anticoagulant restart time matches the plan you agreed with the surgeons. A patient who does not recover motor function when expected needs a neurological check straight away, and imaging should be arranged by a senior without waiting for a trend.'),
    PEARL('back pain after a spinal', 'Mild, short-lived back pain at the puncture site is common. But back or buttock pain that spreads to the legs after the block has worn off can be transient neurological symptoms, which are usually benign and settle with analgesia, yet need an examination to exclude a deficit. Any red-flag feature turns it into an urgent review.'),
  ));

  // ---------------------------------------------------------------- reveal
  return {
    reveal(id) {
      if (id === 'tq-sitting' || id.startsWith('tq-pos-sitting')) { posTabs.select('tq-pos-sitting'); return true; }
      if (id === 'tq-lateral' || id.startsWith('tq-pos-lateral')) { posTabs.select('tq-pos-lateral'); return true; }
      if (id === 'tq-midline' || id === 'tq-paramedian') { const v = id.slice(3); apSeg.set(v); setAp(v); return true; }
      if (id === 'tq-ac-table' || id === 'tq-ac-full' || id.startsWith('tq-ac-')) { if (id.startsWith('tq-ac-d-')) lookup.open(id); else lookup.show(); return true; }
      if (id.startsWith('tq-spread')) {
        root.querySelectorAll('.tq-spread-item').forEach((li) => { li.hidden = false; });
        return true;
      }
      return false;
    },
  };
}
