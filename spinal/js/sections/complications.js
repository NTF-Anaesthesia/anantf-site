// Section 05: Complications and safety.
import { el, callout, table, figure, details, cite, tier, keyPoints } from '../ui.js?v=1';
import { PDPH_TREE } from '../complications/pdph-tree.js';
import { neuroCheck } from '../complications/neurocheck.js';
import { connectorsFigure } from '../complications/connectors.js';
import { createTree, treeOutline } from '../troubleshooting/tree.js';

export const meta = { id: 'complications', prefix: 'cx', title: 'Complications and safety' };

// Module refs: only the ICHD-3 definition, the SmPC dose lines and the QRH card are cited here.
export const refs = {
  'cx-ichd3': {
    label: 'ICHD-3 2018',
    text: 'Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition. <i>Cephalalgia</i> 2018;38:1–211. Section 7.2.1, Post-dural puncture headache.',
    url: 'https://doi.org/10.1177/0333102417738202',
  },
  'cx-marcain-smpc': {
    label: 'Marcain Polyamp SmPC',
    text: 'Marcain Polyamp Steripack 0.5% w/v solution for injection (bupivacaine hydrochloride). Summary of Product Characteristics, section 4.2. Health Products Regulatory Authority (Ireland), revised April 2023.',
    url: 'https://assets.hpra.ie/products/Human/29213/Licence_PA1691-024-002_19042023124012.pdf',
  },
  'cx-qrh310': {
    label: 'QRH 3-10 2023',
    text: 'Association of Anaesthetists. Quick Reference Handbook 3-10: Local anaesthetic toxicity, version 2, June 2023. CC BY-NC-SA 4.0.',
    url: 'https://anaesthetists.org/Quick-Reference-Handbook',
  },
};

const D = (s) => `<span class="sp-dose">${s}</span>`;
const N = (s) => `<span class="sp-num">${s}</span>`;
const P = (html, cls = 'sp-prose') => el('p', { class: cls, html });
// An item may be [tier, html] to tag that list item.
const UL = (items, cls = 'cx-list') => el('ul', { class: cls, html: items.map((i) => (Array.isArray(i) ? `<li data-tier="${i[0]}">${i[1]}</li>` : `<li>${i}</li>`)).join('') });
const H3 = (id, text) => el('h3', { class: 'cx-h3', id: `${id}-h` }, text);
const H4 = (text) => el('h4', { class: 'cx-h4', text });

// A tiered group: wraps a heading and its content so both hide together.
function grp(n, ...kids) {
  const g = el('div', { class: 'cx-grp' });
  g.append(...kids.flat());
  return tier(g, n);
}
const T = tier;

function block(id, title, ...kids) {
  const s = el('div', { class: 'cx-sub', id, 'aria-labelledby': `${id}-h`, role: 'region' });
  s.append(H3(id, title), ...kids.flat());
  return s;
}

// ---------------------------------------------------------------- at a glance
function glance() {
  return T(table({
    id: 'cx-glance',
    caption: 'Complications at a glance (published figures; each from a different population, so don’t compare rows directly)',
    head: ['Complication', 'Figure', 'Where it comes from'],
    rows: [
      [{ html: '<a href="#cx-pdph">Post-dural puncture headache</a>', th: true }, `${N('4.2%')} with pencil-point vs ${N('11.0%')} with cutting needles`, 'Meta-analysis of lumbar punctures for any indication (110 trials)'],
      [{ html: 'Hypotension / bradycardia', th: true }, `${N('33%')} / ${N('13%')}`, 'Prospective study of 952 spinals (1992)'],
      [{ html: 'Urinary retention', th: true }, `${N('5–70%')}`, 'Postoperative retention after any anaesthetic; varies with surgery and patient'],
      [{ html: '<a href="#cx-neuro">Neurological injury</a>', th: true }, `${N('6 per 10,000')} spinals`, 'France, 40,640 spinals; most deficits were not permanent'],
      [{ html: 'Permanent harm, any neuraxial block', th: true }, `${N('1 in 24,000')} to ${N('1 in 54,000')}`, 'UK NAP3, all central neuraxial blocks (not spinal alone)'],
      [{ html: 'Serious complications after spinal', th: true }, `${N('1 in 20,000–30,000')}`, 'Sweden 1990–99, about 1.26 million spinals'],
      [{ html: '<a href="#cx-haematoma">Vertebral canal haematoma</a>', th: true }, `${N('1 in 3,600')} women having knee arthroplasty vs ${N('1 in 200,000')} obstetric epidurals`, 'Sweden 1990–99; two subgroups of neuraxial blocks, not a single-shot spinal rate'],
      [{ html: '<a href="#cx-cardiac">Cardiac arrest during spinal</a>', th: true }, `${N('6.4')} and ${N('2.7 per 10,000')}`, 'Two French surveys, 1997 and 2002'],
      [{ html: '<a href="#cx-tns">Transient neurological symptoms</a>', th: true }, `Relative risk ${N('5.1')} with lidocaine vs bupivacaine`, '1,863 spinals; a ratio, not an incidence'],
    ],
  }), 3);
}

// ---------------------------------------------------------------- ward red flags
function ward() {
  return block('cx-ward', 'Ward red flags after a spinal',
    T(callout('warn', {
      title: 'Call your senior now if you see any of these',
      body: `<ul>
        <li><strong>Back pain</strong> that is new, severe or getting worse.</li>
        <li><strong>New or worsening weakness or numbness</strong> in the legs.</li>
        <li><strong>The block is not wearing off</strong> as expected for the drug and dose.</li>
        <li><strong>Bladder or bowel change</strong>: new retention, incontinence or loss of anal tone or sensation.</li>
        <li><strong>Fever</strong>, especially with back pain or a stiff neck.</li>
        <li><strong>Severe headache</strong>, or one with fever, confusion, seizures or visual change.</li>
        <li><strong>Drowsy or slow breathing</strong> after intrathecal morphine (if it was used).</li>
      </ul><p><strong>What to do:</strong> examine the legs (power, sensation, level), check observations, tell the anaesthetic senior and the surgical team, and ask for an urgent MRI if there is any neurological change. Do not put it down to a slow-wearing block. Write down what you found and when.</p>`,
    }), 1),
  );
}

// ---------------------------------------------------------------- PDPH
function pdph() {
  const tree = createTree(PDPH_TREE, { headingLevel: 4, kicker: 'Interactive · PDPH pathway' });
  const outline = details({ id: 'cx-pdph-outline', summary: 'The whole PDPH pathway as a list', body: treeOutline(PDPH_TREE) });

  return block('cx-pdph', 'Post-dural puncture headache (PDPH)',
    el('div', { class: 'cx-split' },
      el('div', { class: 'cx-col' },
        grp(1, H4('Definition'),
        P(`ICHD-3 defines PDPH as a headache that starts <strong>within 5 days</strong> of a dural puncture and is caused by CSF leaking through the hole. It usually comes with neck stiffness or hearing symptoms, and settles by itself within 2 weeks or after an epidural blood patch.${cite('cx-ichd3')} A postural pattern (worse sitting or standing, better lying flat) is typical but <strong>no longer a required criterion</strong>.${cite('uppal2023')}`)),
        grp(1, H4('Symptoms'),
        UL([
          'Fronto-occipital headache, usually worse within minutes of sitting up.',
          'Neck stiffness, tinnitus or muffled hearing, photophobia, nausea.',
          `Double vision from a sixth nerve palsy, or hearing loss: reasons to consider a blood patch.${cite('uppal2023')}`,
        ])),
        grp(2, H4('Who gets it'),
        P(`Overall incidence ranges from under 2% to 40%, depending on patient and needle.${cite('uppal2023')} Pencil-point needles roughly halve the risk compared with cutting needles (${N('4.2%')} vs ${N('11.0%')} in a meta-analysis of 31,412 patients). Younger age, female sex and a previous PDPH raise the risk; smaller gauges lower it.${cite('uppal2023', 'cx-ichd3')}`)),
      ),
      el('div', { class: 'cx-col' },
        T(callout('warn', {
          title: 'Red flags: don’t assume it’s PDPH',
          body: `<ul><li>A change in character, or onset more than 5 days after puncture.</li><li>Focal signs, seizures, drowsiness or confusion, or a change in vision.</li><li>Fever, or worsening after a blood patch.</li></ul><p>Image and refer. A headache with no postural element is atypical: get a senior review and consider imaging. Dural puncture is associated with subdural haematoma and cerebral venous sinus thrombosis.${cite('uppal2023')}</p>`,
        }), 1),
        T(P('Other causes to consider: meningitis, subarachnoid or other intracranial haemorrhage, pneumocephalus, migraine or tension-type headache, caffeine withdrawal and sinusitis.', 'sp-prose cx-small'), 2),
      ),
    ),
    grp(1, H4('Conservative treatment'),
    UL([
      `Regular paracetamol and an NSAID unless contraindicated. Opioids briefly, only if these fail; not long term.${cite('uppal2023')}`,
      `Caffeine may be offered in the first 24 h of symptoms, up to ${D('900 mg/day')} from all sources (${D('200–300 mg/day')} if breastfeeding). The evidence is two small trials.${cite('uppal2023')}`,
      `<strong>Hydration and bed rest don’t treat it.</strong> Drink normally; IV fluid only if the patient can’t drink. Bed rest does not prevent PDPH and is only for temporary relief.${cite('uppal2023')}`,
      `Not routinely supported: hydrocortisone, theophylline, triptans, ACTH, gabapentin, sphenopalatine ganglion block.${cite('uppal2023')}`,
    ])),
    grp(2, H4('Epidural blood patch'),
    el('div', { class: 'cx-ebp' },
      table({
        caption: 'Epidural blood patch: the key numbers',
        head: ['Item', 'Consensus advice'],
        rows: [
          [{ html: 'When', th: true }, `PDPH that limits daily activity despite conservative care. A patch within ${N('48 h')} of puncture is more likely to need repeating, so counsel the patient.${cite('uppal2023')}`],
          [{ html: 'Where', th: true }, `At the puncture level or one space below, with strict asepsis for the blood draw and the epidural.${cite('uppal2023')}`],
          [{ html: 'How much', th: true }, `Usually ${D('15–20 mL')}, injected slowly. <strong>Stop</strong> if back pain, headache or radicular pressure becomes significant. More than ${D('30 mL')} did not improve success.${cite('uppal2023')}`],
          [{ html: 'Success', th: true }, `Complete relief in ${N('33–91%')} across studies; very high early figures have not been reproduced. Follow up, as some patients need a second patch.${cite('uppal2023')}`],
          [{ html: 'Cautions', th: true }, `Fever or systemic infection; coagulopathy or antithrombotics (apply the neuraxial timing rules). Consent covers repeat dural puncture, backache and neurological complications.${cite('uppal2023')}`],
        ],
      }),
    )),
    T(P(`After a spinal with a fine (22G or smaller) needle, a <strong>greater occipital nerve block</strong> may be offered (a weak, grade C recommendation); the headache may come back, and severe cases still need a patch.${cite('uppal2023')}`), 3),
    T(callout('key', {
      title: 'Pearl: when a patch fails',
      body: '<p>If a blood patch gives no relief, or only brief relief, don’t just repeat it. Re-examine the diagnosis first. A headache that has lost its postural pattern, or that comes with focal signs, needs a senior review and imaging for other causes such as intracranial haemorrhage or cerebral venous sinus thrombosis before another patch.</p>',
    }), 3),
    T(tree.el, 2),
    T(outline, 2),
  );
}

// ---------------------------------------------------------------- neurological injury
function neuro() {
  return block('cx-neuro', 'Neurological injury',
    T(P(`Permanent harm is rare. The UK’s NAP3 found permanent injury after any central neuraxial block in ${N('4.2 per 100,000')} (pessimistic, about ${N('1 in 24,000')}) to ${N('2.0 per 100,000')} (optimistic, about ${N('1 in 54,000')}); two-thirds of injuries that were disabling at first resolved fully. In a French survey, neurological injury after spinal was ${N('6 per 10,000')}, higher than after other regional techniques.`), 2),
    grp(2, H4('Mechanisms'),
    UL([
      `<strong>Direct needle trauma</strong> to a root or the cord. In the French survey, two-thirds of patients with a deficit had paraesthesia during puncture or pain on injection, and the deficit followed the same distribution.`,
      `<strong>Conus injury from misjudging the level.</strong> In seven cases of conus damage, the space was usually believed to be L2–3 and every patient felt pain on insertion. See <a href="#an-tuffier">Tuffier’s line and level</a>: aim for L3–4 or below.`,
      `<strong>Compression</strong> by a <a href="#cx-haematoma">haematoma</a> or an <a href="#cx-infection">abscess</a>. These are the injuries that time can change.`,
      `<strong>Local anaesthetic neurotoxicity.</strong> In the French survey, of the deficits that followed spinals without paraesthesia or pain on injection, three-quarters were after hyperbaric 5% lidocaine.`,
      `<strong>Chemical injury</strong> from the wrong drug or from antiseptic carried into the CSF; chlorhexidine is neurotoxic.${cite('tq-campbell2014')}`,
      '<strong>Ischaemia</strong> of the cord, for example with prolonged severe hypotension.',
    ])),
    T(P(`Patients with an existing peripheral or diabetic neuropathy had a new or worse deficit in ${N('0.4%')} (95% CI 0.1–1.3%) after neuraxial block. Document any deficit before you start.`), 2),
    T(callout('key', {
      title: 'The paraesthesia rule',
      body: `<p>A brief electric shock that settles at once is common. Stop, and check for CSF. <strong>Persistent paraesthesia, or pain on injection: stop, don’t inject, withdraw and redirect.</strong> Never inject through a needle that hurts. Document the side, dermatome and what you did. Step through it in the <a href="#ts-paraesthesia">paraesthesia tree</a>.</p>`,
    }), 1),
    grp(1, H4('When to involve neurology or neurosurgery'),
    UL([
      'Any new deficit outside the expected block, a block that doesn’t regress as expected, or new back pain with neurological signs.',
      `<strong>Exclude compression first</strong> with an urgent MRI. A treatable haematoma or abscess must not wait for a neurology opinion.${cite('esaic2022')}`,
      'Then refer to neurology for assessment, with nerve conduction studies or EMG if needed, and follow the patient up.',
    ])),
    T(callout('key', {
      title: 'Pearl: the patient who can’t tell you',
      body: '<p>Warning paraesthesia and pain on injection are only useful if the patient can report them. Heavy sedation or general anaesthesia before the block removes this early warning, which is one reason most spinals are done with the patient awake or lightly sedated. If a deeply sedated patient must have a block, take extra care with the level, the needle direction and the injection pressure.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- haematoma + infection + check
function haematoma() {
  return block('cx-haematoma', 'Vertebral canal haematoma',
    T(P(`Rare but catastrophic. In Sweden (1990–99) there were 33 haematomas among about ${N('1.7 million')} neuraxial blocks. The risk was ${N('1 in 3,600')} in women having knee arthroplasty, against ${N('1 in 200,000')} after obstetric epidurals. The first figure is for one high-risk group having neuraxial block for knee surgery, not a rate for single-shot spinal.`), 2),
    grp(2, H4('Risk factors'),
    UL([
      `Anticoagulant or antiplatelet drugs, especially in combination; follow the timing rules in the <a href="#tq-ac-full">anticoagulation table</a>.${cite('esaic2022')}`,
      `The same intervals apply to catheter removal as to insertion; removal is a risk point too.${cite('esaic2022')}`,
      `Osteoporosis was proposed as a risk factor in the Swedish series. Older age, female sex, renal impairment and a difficult or traumatic puncture are also commonly cited.`,
    ])),
    T(callout('warn', {
      title: 'Red flags after any neuraxial block',
      body: `<ul><li>New or increasing back pain.</li><li>Numbness or weakness of the legs. Motor block is often the first sign, before pain.</li><li>New bowel or bladder dysfunction.</li><li>A block that lasts longer, or spreads further, than the drug explains.</li></ul><p><strong>Urgent MRI, senior anaesthetist and neurosurgery.</strong> ESAIC/ESRA advise decompression, if indicated, <strong>within 6 h</strong> for neurological recovery.${cite('esaic2022')} In a surgical series, patients operated on within ${N('12 h')} of symptom onset did better than those operated on later.</p>`,
    }), 1),
    T(P(`Trained staff should check sensory and motor recovery regularly for at least ${N('24 h')} after a neuraxial block, and longer in high-risk patients. Brief day-case patients on what to report.${cite('esaic2022')}`), 1),
    T(callout('key', {
      title: 'Pearl: a block that is too dense or too long',
      body: '<p>A spinal that lasts much longer than the drug and dose predict is a haematoma until proved otherwise. Don’t wait for pain: motor block may be the only early sign. If an epidural infusion is running, stop it so the legs can be examined. Delay to imaging is the avoidable part of this injury, so the threshold for an urgent MRI should be low.</p>',
    }), 3),
  );
}

function infection() {
  return block('cx-infection', 'Infection: meningitis and abscess',
    UL([
      [2, `<strong>Bacterial meningitis.</strong> The Swedish series found 29 cases. Some are caused by streptococci from the anaesthetist’s mouth: one outbreak of <i>Streptococcus salivarius</i> meningitis was traced to an anaesthetist’s oral flora. Wear a face mask. Fever and a headache that is not postural point to meningitis rather than PDPH.`],
      [2, `<strong>Epidural abscess</strong> (13 cases in Sweden) is more often linked to epidural catheters than to single-shot spinals. It presents later, typically with back pain, local tenderness and fever, then root pain and weakness. Urgent MRI.`],
      [1, `<strong>Prevention:</strong> hand hygiene, cap, mask, sterile gown and gloves, and chlorhexidine in alcohol allowed to dry fully before puncture.${cite('tq-campbell2014')}`],
    ]),
  );
}

function check() {
  return block('cx-check', 'Post-spinal neuro check',
    P('Use this when a nurse calls about a block that seems slow to wear off, or on your post-operative round. It reflects the red flags above; it doesn’t replace examining the patient.'),
    T(neuroCheck({ id: 'cx-neuro-check' }), 1),
  );
}

// ---------------------------------------------------------------- TNS
function tns() {
  return block('cx-tns', 'Transient neurological symptoms (TNS)',
    T(P('Pain or unpleasant sensations in the buttocks radiating to the legs, starting within about a day of an uneventful spinal. There is no objective deficit, and it settles within days.'), 1),
    T(UL([
      `<strong>Lidocaine is the main cause.</strong> In 1,863 patients, lidocaine carried a relative risk of ${N('5.1')} compared with bupivacaine and ${N('3.2')} compared with tetracaine. With lidocaine, the lithotomy position (${N('2.6')}) and day-case status (${N('3.6')}) increased the risk. Needle type, lidocaine dose and concentration did not.`,
      `A Cochrane network meta-analysis found lower risk with bupivacaine, levobupivacaine, prilocaine, procaine and ropivacaine than with lidocaine; chloroprocaine and mepivacaine did not differ from lidocaine (low-quality evidence).`,
      'Treat with NSAIDs and reassurance. Any objective deficit means it isn’t TNS: examine and investigate.',
    ]), 2),
  );
}

// ---------------------------------------------------------------- LAST
function last() {
  return block('cx-last', 'Local anaesthetic systemic toxicity (LAST)',
    T(P(`A spinal alone rarely causes LAST. The label dose range for hyperbaric bupivacaine is ${D('7.5–20 mg')}${cite('tq-hpra-heavy')}, a small fraction of the systemic limit: single doses up to ${D('150 mg')}, and no more than ${D('2 mg/kg')} in any 4-hour period. If bupivacaine is given by more than one technique, the overall limit is ${D('150 mg')}.${cite('cx-marcain-smpc')}`), 2),
    grp(1, H4('When it matters around a spinal'),
    UL([
      'A failed spinal followed by a large-volume block, or an epidural top-up.',
      '<strong>Hip fracture:</strong> a fascia iliaca or PENG block before or after the spinal, plus any local infiltration by the surgeon. Add up every local anaesthetic dose.',
      'Accidental intravenous injection; frail, small or elderly patients.',
    ])),
    T(P(`Management follows the Association of Anaesthetists LAST card: stop injecting, call for help, get the lipid pack, oxygen and airway, benzodiazepine for seizures. Give ${D('20%')} lipid emulsion: a bolus of ${D('1.5 mL/kg')} over 2–3 min, then an infusion of ${D('15 mL/kg/h')}. If the circulation has not recovered, repeat the bolus at 5 and 10 min (no more than 3 boluses in total) and double the infusion to ${D('30 mL/kg/h')} after 5 min. Maximum cumulative dose ${D('12 mL/kg')}. In cardiac arrest use smaller adrenaline doses (${D('≤1 µg/kg')}) and expect a long resuscitation.${cite('cx-qrh310')}`), 1),
    T(callout('key', {
      title: 'Pearl: LAST can be quiet or late',
      body: '<p>LAST does not always begin with a seizure. It can start with agitation, a metallic taste or perioral numbness, or with cardiovascular collapse alone, and it can appear some minutes after the block. Keep monitoring and keep the lipid pack close. In treatment, lipid emulsion is not replaced by propofol, and vasopressin, calcium channel blockers and beta-blockers are best avoided. Keep a running total of every local anaesthetic given, by every route, in the notes.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- cardiac
function cardiac() {
  return block('cx-cardiac', 'Cardiac arrest and severe bradycardia',
    T(P(`Cardiac arrest during spinal was ${N('6.4 per 10,000')} in a 1997 French survey, against ${N('1.0 per 10,000')} for other regional techniques, and ${N('2.7 per 10,000')} in the 2002 survey.`), 2),
    T(P(`Closed claims of arrests in healthy patients showed two patterns: heavy sedation with unrecognised respiratory insufficiency, and failure to appreciate how much the sympathetic block hinders resuscitation. The authors advised early use of a potent alpha-agonist and positioning to restore venous return.`), 2),
    T(UL([
      'Young, fit patients with a slow resting heart rate, beta-blockers or a high block are at risk of sudden bradycardia.',
      'Treat early and escalate early: atropine, then ephedrine, then adrenaline if it is sudden or severe.',
      'See the <a href="#ts-hypotension">hypotension and bradycardia tree</a> and the <a href="#ts-high-spinal">high spinal tree</a> for steps and doses.',
    ]), 1),
    T(callout('key', {
      title: 'Pearl: why a slow heart rate is not benign',
      body: '<p>Bradycardia during a spinal can be sudden, not gradual, and can move to asystole within moments. Reduced venous return and a reflex slowing of the heart (the Bezold-Jarisch reflex is the proposed mechanism) are both thought to contribute. A falling heart rate in a patient who is still talking is a reason to act now, with head-down positioning, a vagolytic and a vasopressor ready, rather than to watch the next reading.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- wrong route
function wrongRoute() {
  const f = figure({
    id: 'cx-fig-connectors', num: '5.1', plate: 'none', aspect: 'auto',
    title: 'Luer and NRFit: why a neuraxial-only connector prevents wrong-route injection',
    caption: 'Schematic, not to scale. Shapes are simplified to show the principle that each connector mates only with its own kind; real connectors differ in detail.',
  });
  f.stage.append(connectorsFigure());
  f.describe('Three panels. A Luer syringe connects to a Luer IV port. A Luer syringe will not connect to an NRFit spinal needle. An NRFit syringe connects to an NRFit spinal needle.');

  return block('cx-wrong-route', 'Wrong-route and wrong-drug errors',
    T(P(`<strong>Tranexamic acid given intrathecally</strong>, usually instead of the intended bupivacaine, has caused seizures, arrhythmias, paraplegia, permanent neurological injury and death. Similar vial caps and storing look-alike products together contribute. The FDA advises storing tranexamic acid separately, labelling it, and checking the label rather than the cap colour.`), 1),
    T(P(`<strong>Intrathecal vincristine</strong> is a devastating, usually fatal error. The safeguard is to supply vinca alkaloids for infusion in a minibag, never in a syringe.`), 2),
    T(P(`<strong>NRFit connectors</strong> (ISO 80369-6) are small-bore connectors for neuraxial and regional devices that will not mate with Luer, so an IV syringe or line can’t be connected to a spinal needle or epidural.${cite('iso80369-6')} The 2016 standard was replaced by a 2025 edition.`), 2),
    T(f.fig, 2),
    grp(1, H4('Practice points'),
    UL([
      'Draw up spinal drugs yourself, from a separate clean tray, just before use.',
      'Read the ampoule label aloud, with a second person where possible. Don’t rely on cap colour or ampoule shape.',
      'Use NRFit syringes, needles and filters where they are stocked.',
      'Keep tranexamic acid, potassium and other IV-only drugs away from local anaesthetic ampoules.',
      `Keep chlorhexidine off the drug tray: apply it before the drugs are opened, don’t pour it into pots on the sterile field, and let it dry.${cite('tq-campbell2014')}`,
      'Use preservative-free drugs only. Label every syringe.',
    ])),
    T(callout('key', {
      title: 'Pearl: fix the system, not the person',
      body: '<p>Wrong-route errors keep happening to careful people. Reminders to “be vigilant” fail; physical barriers work. That means connectors that cannot mate, separate storage for IV-only drugs, and drugs supplied in forms that cannot reach the spinal needle. When you find a near miss, report it: the fix is usually in how drugs are stored and supplied.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- other
function other() {
  return block('cx-other', 'Other problems, briefly',
    UL([
      [1, `<strong>Urinary retention</strong> is common (reported ${N('5–70%')} after surgery overall). Bladder ultrasound measures the volume and guides catheterisation. See the <a href="#ts-retention">retention tree</a>.`],
      [1, '<strong>Backache</strong> is common after any anaesthetic and usually settles. Severe or worsening back pain with neurological signs is a red flag for <a href="#cx-haematoma">haematoma</a> or <a href="#cx-infection">abscess</a>.'],
      [2, `<strong>Hearing change.</strong> Subjective hearing symptoms are part of PDPH.${cite('cx-ichd3')} Pencil-point needles reduced hearing disturbance as well as headache.`],
    ]),
  );
}

export function mount(root) {
  root.append(
    keyPoints([
      'After a spinal, new back pain, leg weakness or numbness, or a block that will not wear off needs a senior and an urgent MRI.',
      'Do not inject through pain or a persistent paraesthesia: stop, withdraw and redirect.',
      'PDPH is a headache after dural puncture that is usually worse upright; treat with simple analgesia and a blood patch if it limits daily life.',
      'A headache with fever, focal signs or no postural pattern is not simple PDPH: get a senior review.',
      'Hypotension and bradycardia are common; treat early, and watch for sudden severe bradycardia.',
      'Add up every local anaesthetic dose by every route; know where the lipid pack is.',
      'Read every ampoule label; use neuraxial-only (NRFit) connectors where stocked.',
    ]),
    P('What can go wrong, how often, how to spot it early and what to do. Rates come from large audits and surveys; the population behind each figure matters, so it is named.', 'sp-lead'),
    el('ul', {
      class: 'sp-jump',
      html: ['cx-ward:Ward red flags', 'cx-glance:At a glance', 'cx-pdph:PDPH', 'cx-neuro:Nerve injury', 'cx-haematoma:Haematoma', 'cx-infection:Infection', 'cx-check:Neuro check', 'cx-tns:TNS', 'cx-last:LAST', 'cx-cardiac:Cardiac arrest', 'cx-wrong-route:Wrong route', 'cx-other:Other']
        .map((s) => { const [id, t] = s.split(':'); return `<li><a href="#${id}">${t}</a></li>`; }).join(''),
    }),
    ward(),
    glance(),
    pdph(),
    neuro(),
    haematoma(),
    infection(),
    check(),
    tns(),
    last(),
    cardiac(),
    wrongRoute(),
    other(),
  );

  return {
    reveal(hashId) {
      const t = document.getElementById(hashId);
      if (!t) return false;
      for (let p = t.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
      return true;
    },
  };
}
