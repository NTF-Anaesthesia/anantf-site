// Section 05: Complications and safety.
import { el, callout, table, figure, details, cite } from '../ui.js?v=1';
import { PDPH_TREE } from '../complications/pdph-tree.js';
import { neuroCheck } from '../complications/neurocheck.js';
import { connectorsFigure } from '../complications/connectors.js';
import { createTree, treeOutline } from '../troubleshooting/tree.js';

export const meta = { id: 'complications', prefix: 'cx', title: 'Complications and safety' };

// Module refs: journal entries checked on PubMed (9 Oct 2026); ICHD-3 on Crossref and ichd-3.org;
// the SmPC, QRH card and FDA page were read in full.
export const refs = {
  'cx-ichd3': {
    label: 'ICHD-3 2018',
    text: 'Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition. <i>Cephalalgia</i> 2018;38:1–211. Section 7.2.1, Post-dural puncture headache.',
    url: 'https://doi.org/10.1177/0333102417738202',
  },
  'cx-moen2004': {
    label: 'Moen 2004',
    text: 'Moen V, Dahlgren N, Irestedt L. Severe neurological complications after central neuraxial blockades in Sweden 1990–1999. <i>Anesthesiology</i> 2004;101:950–9.',
    url: 'https://doi.org/10.1097/00000542-200410000-00021',
  },
  'cx-auroy2002': {
    label: 'Auroy 2002',
    text: 'Auroy Y, Benhamou D, Bargues L, Ecoffey C, Falissard B, Mercier FJ, et al. Major complications of regional anesthesia in France: the SOS Regional Anesthesia Hotline Service. <i>Anesthesiology</i> 2002;97:1274–80.',
    url: 'https://doi.org/10.1097/00000542-200211000-00034',
  },
  'cx-lawton1995': {
    label: 'Lawton 1995',
    text: 'Lawton MT, Porter RW, Heiserman JE, Jacobowitz R, Sonntag VK, Dickman CA. Surgical management of spinal epidural hematoma: relationship between surgical timing and neurological outcome. <i>J Neurosurg</i> 1995;83:1–7.',
    url: 'https://doi.org/10.3171/jns.1995.83.1.0001',
  },
  'cx-hebl2006': {
    label: 'Hebl 2006',
    text: 'Hebl JR, Kopp SL, Schroeder DR, Horlocker TT. Neurologic complications after neuraxial anesthesia or analgesia in patients with preexisting peripheral sensorimotor neuropathy or diabetic polyneuropathy. <i>Anesth Analg</i> 2006;103:1294–9.',
    url: 'https://doi.org/10.1213/01.ane.0000243384.75713.df',
  },
  'cx-suy2013': {
    label: 'Suy 2013',
    text: 'Suy F, Verhoeven PO, Lucht F, Grattard F, Carricajo A, Pozzetto B, et al. Nosocomial meningitis due to <i>Streptococcus salivarius</i> linked to the oral flora of an anesthesiologist. <i>Infect Control Hosp Epidemiol</i> 2013;34:331–2.',
    url: 'https://doi.org/10.1086/669517',
  },
  'cx-forget2019': {
    label: 'Forget 2019',
    text: 'Forget P, Borovac JA, Thackeray EM, Pace NL. Transient neurological symptoms (TNS) following spinal anaesthesia with lidocaine versus other local anaesthetics in adult surgical patients: a network meta-analysis. <i>Cochrane Database Syst Rev</i> 2019;12:CD003006.',
    url: 'https://doi.org/10.1002/14651858.CD003006.pub4',
  },
  'cx-freedman1998': {
    label: 'Freedman 1998',
    text: 'Freedman JM, Li DK, Drasner K, Jaskela MC, Larsen B, Wi S. Transient neurologic symptoms after spinal anesthesia: an epidemiologic study of 1,863 patients. <i>Anesthesiology</i> 1998;89:633–41.',
    url: 'https://doi.org/10.1097/00000542-199809000-00012',
  },
  'cx-caplan1988': {
    label: 'Caplan 1988',
    text: 'Caplan RA, Ward RJ, Posner K, Cheney FW. Unexpected cardiac arrest during spinal anesthesia: a closed claims analysis of predisposing factors. <i>Anesthesiology</i> 1988;68:5–11.',
    url: 'https://doi.org/10.1097/00000542-198801000-00003',
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
  'cx-fda-txa': {
    label: 'FDA 2020',
    text: 'US Food and Drug Administration. FDA alerts healthcare professionals about the risk of medication errors with tranexamic acid injection resulting in inadvertent intrathecal (spinal) injection. Drug Safety and Availability, 3 December 2020 (page updated 2026).',
    url: 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-alerts-healthcare-professionals-about-risk-medication-errors-tranexamic-acid-injection-resulting',
  },
  'cx-gilbar2020': {
    label: 'Gilbar 2020',
    text: 'Gilbar PJ. Inadvertent intrathecal administration of vincristine: time to finally abolish the syringe. <i>J Oncol Pharm Pract</i> 2020;26:263–6.',
    url: 'https://doi.org/10.1177/1078155219880600',
  },
};

const D = (s) => `<span class="sp-dose">${s}</span>`;
const N = (s) => `<span class="sp-num">${s}</span>`;
const P = (html, cls = 'sp-prose') => el('p', { class: cls, html });
const UL = (items, cls = 'cx-list') => el('ul', { class: cls, html: items.map((i) => `<li>${i}</li>`).join('') });
const H3 = (id, text) => el('h3', { class: 'cx-h3', id: `${id}-h` }, text);
const H4 = (text) => el('h4', { class: 'cx-h4', text });

function block(id, title, ...kids) {
  const s = el('div', { class: 'cx-sub', id, 'aria-labelledby': `${id}-h`, role: 'region' });
  s.append(H3(id, title), ...kids.flat());
  return s;
}

// ---------------------------------------------------------------- at a glance
function glance() {
  return table({
    id: 'cx-glance',
    caption: 'Complications at a glance (published figures; each from a different population, so don’t compare rows directly)',
    head: ['Complication', 'Figure', 'Where it comes from'],
    rows: [
      [{ html: '<a href="#cx-pdph">Post-dural puncture headache</a>', th: true }, `${N('4.2%')} with pencil-point vs ${N('11.0%')} with cutting needles${cite('tq-nath2018')}`, 'Meta-analysis of lumbar punctures for any indication (110 trials)'],
      [{ html: 'Hypotension / bradycardia', th: true }, `${N('33%')} / ${N('13%')}${cite('ts-carpenter1992')}`, 'Prospective study of 952 spinals (1992)'],
      [{ html: 'Urinary retention', th: true }, `${N('5–70%')}${cite('ts-baldini2009')}`, 'Postoperative retention after any anaesthetic; varies with surgery and patient'],
      [{ html: '<a href="#cx-neuro">Neurological injury</a>', th: true }, `${N('6 per 10,000')} spinals${cite('ts-auroy1997')}`, 'France, 40,640 spinals; most deficits were not permanent'],
      [{ html: 'Permanent harm, any neuraxial block', th: true }, `${N('1 in 24,000')} to ${N('1 in 54,000')}${cite('nap3')}`, 'UK NAP3, all central neuraxial blocks (not spinal alone)'],
      [{ html: 'Serious complications after spinal', th: true }, `${N('1 in 20,000–30,000')}${cite('cx-moen2004')}`, 'Sweden 1990–99, about 1.26 million spinals'],
      [{ html: '<a href="#cx-haematoma">Vertebral canal haematoma</a>', th: true }, `${N('1 in 3,600')} women having knee arthroplasty vs ${N('1 in 200,000')} obstetric epidurals${cite('cx-moen2004')}`, 'Sweden 1990–99; two subgroups of neuraxial blocks, not a single-shot spinal rate'],
      [{ html: '<a href="#cx-cardiac">Cardiac arrest during spinal</a>', th: true }, `${N('6.4')} and ${N('2.7 per 10,000')}${cite('ts-auroy1997', 'cx-auroy2002')}`, 'Two French surveys, 1997 and 2002'],
      [{ html: '<a href="#cx-tns">Transient neurological symptoms</a>', th: true }, `Relative risk ${N('5.1')} with lidocaine vs bupivacaine${cite('cx-freedman1998')}`, '1,863 spinals; a ratio, not an incidence'],
    ],
  });
}

// ---------------------------------------------------------------- PDPH
function pdph() {
  const tree = createTree(PDPH_TREE, { headingLevel: 4, kicker: 'Interactive · PDPH pathway' });
  const outline = details({ id: 'cx-pdph-outline', summary: 'The whole PDPH pathway as a list', body: treeOutline(PDPH_TREE) });

  return block('cx-pdph', 'Post-dural puncture headache (PDPH)',
    el('div', { class: 'cx-split' },
      el('div', { class: 'cx-col' },
        H4('Definition'),
        P(`ICHD-3 defines PDPH as a headache that starts <strong>within 5 days</strong> of a dural puncture and is caused by CSF leaking through the hole. It usually comes with neck stiffness or hearing symptoms, and settles by itself within 2 weeks or after an epidural blood patch.${cite('cx-ichd3')} A postural pattern (worse sitting or standing, better lying flat) is typical but <strong>no longer a required criterion</strong>.${cite('uppal2023')}`),
        H4('Symptoms'),
        UL([
          'Fronto-occipital headache, usually worse within minutes of sitting up.',
          'Neck stiffness, tinnitus or muffled hearing, photophobia, nausea.',
          `Double vision from a sixth nerve palsy, or hearing loss: reasons to consider a blood patch.${cite('uppal2023')}`,
        ]),
        H4('Who gets it'),
        P(`Overall incidence ranges from under 2% to 40%, depending on patient and needle.${cite('uppal2023')} Pencil-point needles roughly halve the risk compared with cutting needles (${N('4.2%')} vs ${N('11.0%')} in a meta-analysis of 31,412 patients).${cite('tq-nath2018')} Younger age, female sex and a previous PDPH raise the risk; smaller gauges lower it.${cite('uppal2023', 'cx-ichd3')}`),
      ),
      el('div', { class: 'cx-col' },
        callout('warn', {
          title: 'Red flags: don’t assume it’s PDPH',
          body: `<ul><li>A change in character, or onset more than 5 days after puncture.</li><li>Focal signs, seizures, drowsiness or confusion, or a change in vision.</li><li>Fever, or worsening after a blood patch.</li></ul><p>Image and refer. A headache with no postural element is atypical: get a senior review and consider imaging. Dural puncture is associated with subdural haematoma and cerebral venous sinus thrombosis.${cite('uppal2023')}</p>`,
        }),
        P('Other causes to consider: meningitis, subarachnoid or other intracranial haemorrhage, pneumocephalus, migraine or tension-type headache, caffeine withdrawal and sinusitis.', 'sp-prose cx-small'),
      ),
    ),
    H4('Conservative treatment'),
    UL([
      `Regular paracetamol and an NSAID unless contraindicated. Opioids briefly, only if these fail; not long term.${cite('uppal2023')}`,
      `Caffeine may be offered in the first 24 h of symptoms, up to ${D('900 mg/day')} from all sources (${D('200–300 mg/day')} if breastfeeding). The evidence is two small trials.${cite('uppal2023')}`,
      `<strong>Hydration and bed rest don’t treat it.</strong> Drink normally; IV fluid only if the patient can’t drink. Bed rest does not prevent PDPH and is only for temporary relief.${cite('uppal2023')}`,
      `Not routinely supported: hydrocortisone, theophylline, triptans, ACTH, gabapentin, sphenopalatine ganglion block.${cite('uppal2023')}`,
    ]),
    H4('Epidural blood patch'),
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
    ),
    P(`After a spinal with a fine (22G or smaller) needle, a <strong>greater occipital nerve block</strong> may be offered (a weak, grade C recommendation); the headache may come back, and severe cases still need a patch.${cite('uppal2023')}`),
    tree.el,
    outline,
    callout('policy', { title: 'Local PDPH pathway', body: '<p>Confirm who reviews headaches after a spinal, who performs blood patches and when, whether greater occipital nerve block is offered, and the patient leaflet and follow-up call used locally.</p>' }),
  );
}

// ---------------------------------------------------------------- neurological injury
function neuro() {
  return block('cx-neuro', 'Neurological injury',
    P(`Permanent harm is rare. The UK’s NAP3 found permanent injury after any central neuraxial block in ${N('4.2 per 100,000')} (pessimistic, about ${N('1 in 24,000')}) to ${N('2.0 per 100,000')} (optimistic, about ${N('1 in 54,000')}); two-thirds of injuries that were disabling at first resolved fully.${cite('nap3')} In a French survey, neurological injury after spinal was ${N('6 per 10,000')}, higher than after other regional techniques.${cite('ts-auroy1997')}`),
    H4('Mechanisms'),
    UL([
      `<strong>Direct needle trauma</strong> to a root or the cord. In the French survey, two-thirds of patients with a deficit had paraesthesia during puncture or pain on injection, and the deficit followed the same distribution.${cite('ts-auroy1997')}`,
      `<strong>Conus injury from misjudging the level.</strong> In seven cases of conus damage, the space was usually believed to be L2–3 and every patient felt pain on insertion.${cite('reynolds2001')} See <a href="#an-tuffier">Tuffier’s line and level</a>: aim for L3–4 or below.`,
      `<strong>Compression</strong> by a <a href="#cx-haematoma">haematoma</a> or an <a href="#cx-infection">abscess</a>. These are the injuries that time can change.`,
      `<strong>Local anaesthetic neurotoxicity.</strong> In the French survey, of the deficits that followed spinals without paraesthesia or pain on injection, three-quarters were after hyperbaric 5% lidocaine.${cite('ts-auroy1997')}`,
      `<strong>Chemical injury</strong> from the wrong drug or from antiseptic carried into the CSF; chlorhexidine is neurotoxic.${cite('tq-campbell2014')}`,
      '<strong>Ischaemia</strong> of the cord, for example with prolonged severe hypotension.',
    ]),
    P(`Patients with an existing peripheral or diabetic neuropathy had a new or worse deficit in ${N('0.4%')} (95% CI 0.1–1.3%) after neuraxial block.${cite('cx-hebl2006')} Document any deficit before you start.`),
    callout('key', {
      title: 'The paraesthesia rule',
      body: `<p>A brief electric shock that settles at once is common. Stop, and check for CSF. <strong>Persistent paraesthesia, or pain on injection: stop, don’t inject, withdraw and redirect.</strong> Never inject through a needle that hurts. Document the side, dermatome and what you did.${cite('ts-auroy1997')} Step through it in the <a href="#ts-paraesthesia">paraesthesia tree</a>.</p>`,
    }),
    H4('When to involve neurology or neurosurgery'),
    UL([
      'Any new deficit outside the expected block, a block that doesn’t regress as expected, or new back pain with neurological signs.',
      `<strong>Exclude compression first</strong> with an urgent MRI. A treatable haematoma or abscess must not wait for a neurology opinion.${cite('esaic2022')}`,
      'Then refer to neurology for assessment, with nerve conduction studies or EMG if needed, and follow the patient up.',
    ]),
  );
}

// ---------------------------------------------------------------- haematoma + infection + check
function haematoma() {
  return block('cx-haematoma', 'Vertebral canal haematoma',
    P(`Rare but catastrophic. In Sweden (1990–99) there were 33 haematomas among about ${N('1.7 million')} neuraxial blocks. The risk was ${N('1 in 3,600')} in women having knee arthroplasty, against ${N('1 in 200,000')} after obstetric epidurals.${cite('cx-moen2004')} The first figure is for one high-risk group having neuraxial block for knee surgery, not a rate for single-shot spinal.`),
    H4('Risk factors'),
    UL([
      `Anticoagulant or antiplatelet drugs, especially in combination; follow the timing rules in the <a href="#tq-ac-full">anticoagulation table</a>.${cite('esaic2022')}`,
      `The same intervals apply to catheter removal as to insertion; removal is a risk point too.${cite('esaic2022')}`,
      `Osteoporosis was proposed as a risk factor in the Swedish series.${cite('cx-moen2004')} Older age, female sex, renal impairment and a difficult or traumatic puncture are also commonly cited.`,
    ]),
    callout('warn', {
      title: 'Red flags after any neuraxial block',
      body: `<ul><li>New or increasing back pain.</li><li>Numbness or weakness of the legs. Motor block is often the first sign, before pain.</li><li>New bowel or bladder dysfunction.</li><li>A block that lasts longer, or spreads further, than the drug explains.</li></ul><p><strong>Urgent MRI, senior anaesthetist and neurosurgery.</strong> ESAIC/ESRA advise decompression, if indicated, <strong>within 6 h</strong> for neurological recovery.${cite('esaic2022')} In a surgical series, patients operated on within ${N('12 h')} of symptom onset did better than those operated on later.${cite('cx-lawton1995')}</p>`,
    }),
    P(`Trained staff should check sensory and motor recovery regularly for at least ${N('24 h')} after a neuraxial block, and longer in high-risk patients. Brief day-case patients on what to report.${cite('esaic2022')}`),
  );
}

function infection() {
  return block('cx-infection', 'Infection: meningitis and abscess',
    UL([
      `<strong>Bacterial meningitis.</strong> The Swedish series found 29 cases.${cite('cx-moen2004')} Some are caused by streptococci from the anaesthetist’s mouth: one outbreak of <i>Streptococcus salivarius</i> meningitis was traced to an anaesthetist’s oral flora.${cite('cx-suy2013')} Wear a face mask. Fever and a headache that is not postural point to meningitis rather than PDPH.`,
      `<strong>Epidural abscess</strong> (13 cases in Sweden) is more often linked to epidural catheters than to single-shot spinals.${cite('cx-moen2004')} It presents later, typically with back pain, local tenderness and fever, then root pain and weakness. Urgent MRI.`,
      `<strong>Prevention:</strong> hand hygiene, cap, mask, sterile gown and gloves, and chlorhexidine in alcohol allowed to dry fully before puncture.${cite('tq-campbell2014')}`,
    ]),
  );
}

function check() {
  return block('cx-check', 'Post-spinal neuro check',
    P('Use this when a nurse calls about a block that seems slow to wear off, or on your post-operative round. It reflects the red flags above; it doesn’t replace examining the patient.'),
    neuroCheck({ id: 'cx-neuro-check' }),
    callout('policy', { title: 'Out-of-hours pathway', body: '<p>Confirm locally: who the ward calls, how to get an emergency spinal MRI out of hours, where the on-call neurosurgical team is and how to reach them, and which observation chart records block regression.</p>' }),
  );
}

// ---------------------------------------------------------------- TNS
function tns() {
  return block('cx-tns', 'Transient neurological symptoms (TNS)',
    P('Pain or unpleasant sensations in the buttocks radiating to the legs, starting within about a day of an uneventful spinal. There is no objective deficit, and it settles within days.'),
    UL([
      `<strong>Lidocaine is the main cause.</strong> In 1,863 patients, lidocaine carried a relative risk of ${N('5.1')} compared with bupivacaine and ${N('3.2')} compared with tetracaine. With lidocaine, the lithotomy position (${N('2.6')}) and day-case status (${N('3.6')}) increased the risk. Needle type, lidocaine dose and concentration did not.${cite('cx-freedman1998')}`,
      `A Cochrane network meta-analysis found lower risk with bupivacaine, levobupivacaine, prilocaine, procaine and ropivacaine than with lidocaine; chloroprocaine and mepivacaine did not differ from lidocaine (low-quality evidence).${cite('cx-forget2019')}`,
      'Treat with NSAIDs and reassurance. Any objective deficit means it isn’t TNS: examine and investigate.',
    ]),
    callout('policy', { body: '<p>Confirm whether lidocaine, prilocaine or chloroprocaine spinal products are on the local formulary.</p>' }),
  );
}

// ---------------------------------------------------------------- LAST
function last() {
  return block('cx-last', 'Local anaesthetic systemic toxicity (LAST)',
    P(`A spinal alone rarely causes LAST. The label dose range for hyperbaric bupivacaine is ${D('7.5–20 mg')}${cite('tq-hpra-heavy')}, a small fraction of the systemic limit: single doses up to ${D('150 mg')}, and no more than ${D('2 mg/kg')} in any 4-hour period. If bupivacaine is given by more than one technique, the overall limit is ${D('150 mg')}.${cite('cx-marcain-smpc')}`),
    H4('When it matters around a spinal'),
    UL([
      'A failed spinal followed by a large-volume block, or an epidural top-up.',
      '<strong>Hip fracture:</strong> a fascia iliaca or PENG block before or after the spinal, plus any local infiltration by the surgeon. Add up every local anaesthetic dose.',
      'Accidental intravenous injection; frail, small or elderly patients.',
    ]),
    P(`Management follows the Association of Anaesthetists LAST card: stop injecting, call for help, get the lipid pack, oxygen and airway, benzodiazepine for seizures. Give ${D('20%')} lipid emulsion: a bolus of ${D('1.5 mL/kg')} over 2–3 min, then an infusion of ${D('15 mL/kg/h')}. If the circulation has not recovered, repeat the bolus at 5 and 10 min (no more than 3 boluses in total) and double the infusion to ${D('30 mL/kg/h')} after 5 min. Maximum cumulative dose ${D('12 mL/kg')}. In cardiac arrest use smaller adrenaline doses (${D('≤1 µg/kg')}) and expect a long resuscitation.${cite('cx-qrh310')}`),
    callout('policy', { body: '<p>Know where the lipid emulsion and the local LAST card are kept in each theatre and block room.</p>' }),
  );
}

// ---------------------------------------------------------------- cardiac
function cardiac() {
  return block('cx-cardiac', 'Cardiac arrest and severe bradycardia',
    P(`Cardiac arrest during spinal was ${N('6.4 per 10,000')} in a 1997 French survey, against ${N('1.0 per 10,000')} for other regional techniques${cite('ts-auroy1997')}, and ${N('2.7 per 10,000')} in the 2002 survey.${cite('cx-auroy2002')}`),
    P(`Closed claims of arrests in healthy patients showed two patterns: heavy sedation with unrecognised respiratory insufficiency, and failure to appreciate how much the sympathetic block hinders resuscitation. The authors advised early use of a potent alpha-agonist and positioning to restore venous return.${cite('cx-caplan1988')}`),
    UL([
      'Young, fit patients with a slow resting heart rate, beta-blockers or a high block are at risk of sudden bradycardia.',
      'Treat early and escalate early: atropine, then ephedrine, then adrenaline if it is sudden or severe.',
      'See the <a href="#ts-hypotension">hypotension and bradycardia tree</a> and the <a href="#ts-high-spinal">high spinal tree</a> for steps and doses.',
    ]),
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
    P(`<strong>Tranexamic acid given intrathecally</strong>, usually instead of the intended bupivacaine, has caused seizures, arrhythmias, paraplegia, permanent neurological injury and death. Similar vial caps and storing look-alike products together contribute. The FDA advises storing tranexamic acid separately, labelling it, and checking the label rather than the cap colour.${cite('cx-fda-txa')}`),
    P(`<strong>Intrathecal vincristine</strong> is a devastating, usually fatal error. The safeguard is to supply vinca alkaloids for infusion in a minibag, never in a syringe.${cite('cx-gilbar2020')}`),
    P(`<strong>NRFit connectors</strong> (ISO 80369-6) are small-bore connectors for neuraxial and regional devices that will not mate with Luer, so an IV syringe or line can’t be connected to a spinal needle or epidural.${cite('iso80369-6')} The 2016 standard was replaced by a 2025 edition.`),
    f.fig,
    H4('Practice points'),
    UL([
      'Draw up spinal drugs yourself, from a separate clean tray, just before use.',
      'Read the ampoule label aloud, with a second person where possible. Don’t rely on cap colour or ampoule shape.',
      'Use NRFit syringes, needles and filters where they are stocked.',
      'Keep tranexamic acid, potassium and other IV-only drugs away from local anaesthetic ampoules.',
      `Keep chlorhexidine off the drug tray: apply it before the drugs are opened, don’t pour it into pots on the sterile field, and let it dry.${cite('tq-campbell2014')}`,
      'Use preservative-free drugs only. Label every syringe.',
    ]),
    callout('policy', { body: '<p>Confirm whether NRFit is in use for spinals locally, and the pharmacy storage rules for tranexamic acid and vinca alkaloids.</p>' }),
  );
}

// ---------------------------------------------------------------- other
function other() {
  return block('cx-other', 'Other problems, briefly',
    UL([
      `<strong>Urinary retention</strong> is common (reported ${N('5–70%')} after surgery overall). Bladder ultrasound measures the volume and guides catheterisation.${cite('ts-baldini2009')} See the <a href="#ts-retention">retention tree</a>.`,
      '<strong>Backache</strong> is common after any anaesthetic and usually settles. Severe or worsening back pain with neurological signs is a red flag for <a href="#cx-haematoma">haematoma</a> or <a href="#cx-infection">abscess</a>.',
      `<strong>Hearing change.</strong> Subjective hearing symptoms are part of PDPH.${cite('cx-ichd3')} Pencil-point needles reduced hearing disturbance as well as headache.${cite('tq-nath2018')}`,
    ]),
  );
}

export function mount(root) {
  root.append(
    P('What can go wrong, how often, how to spot it early and what to do. Rates come from large audits and surveys; the population behind each figure matters, so it is named.', 'sp-lead'),
    el('ul', {
      class: 'sp-jump',
      html: ['cx-glance:At a glance', 'cx-pdph:PDPH', 'cx-neuro:Nerve injury', 'cx-haematoma:Haematoma', 'cx-infection:Infection', 'cx-check:Neuro check', 'cx-tns:TNS', 'cx-last:LAST', 'cx-cardiac:Cardiac arrest', 'cx-wrong-route:Wrong route', 'cx-other:Other']
        .map((s) => { const [id, t] = s.split(':'); return `<li><a href="#${id}">${t}</a></li>`; }).join(''),
    }),
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
