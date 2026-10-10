// Chapter: Complications and aftercare.
import { el, callout, table, figure, details, cite, tier, keyPoints, registerSearch } from '../ui.js?v=1';
import { PDPH_TREE } from '../complications/pdph-tree.js';
import { neuroCheck } from '../complications/neurocheck.js';
import { connectorsFigure } from '../complications/connectors.js';
import { createTree, treeOutline } from '../troubleshooting/tree.js';

export const meta = { id: 'complications', prefix: 'cx', title: 'Complications and aftercare' };

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
const T = tier;

// A tiered group: wraps a heading and its content so both hide together.
function grp(n, ...kids) {
  const g = el('div', { class: 'cx-grp' });
  g.append(...kids.flat());
  return tier(g, n);
}

function block(id, title, ...kids) {
  const s = el('div', { class: 'cx-sub', id, 'aria-labelledby': `${id}-h`, role: 'region' });
  s.append(H3(id, title), ...kids.flat());
  return s;
}

// A tiered <details> for depth.
const DET = (n, id, summary, body) => T(details({ id, summary, body }), n);

// ---------------------------------------------------------------- red flags (the one list)
function redFlags() {
  const b = block('cx-red-flags', 'Red flags after a spinal: the one list',
    el('span', { id: 'cx-ward' }),
    T(callout('warn', {
      title: 'Call your senior now if you see any of these',
      body: `<ul>
        <li><strong>Back pain</strong> that is new, severe or getting worse.</li>
        <li><strong>New or worsening weakness or numbness</strong> in the legs.</li>
        <li><strong>The block is not wearing off</strong> as expected, or it comes back after starting to wear off.</li>
        <li><strong>Bladder or bowel change</strong> the block does not explain: new retention, incontinence, saddle numbness, loss of anal tone.</li>
        <li><strong>Fever</strong>, especially with back pain, a stiff neck or a tender puncture site.</li>
        <li><strong>Severe headache</strong>, or a headache with fever, confusion, seizures, focal signs or visual change.</li>
        <li><strong>Drowsy or slow breathing</strong> after intrathecal morphine (if it was used).</li>
      </ul><p><strong>What to do:</strong> examine the legs (power, sensation, level), check observations, tell the anaesthetic senior and the surgical team, and ask for an <strong>urgent MRI</strong> if there is any neurological change. Do not put it down to a slow-wearing block. Write down what you found and when.</p>
      <p>Other chapters link here: <a href="#cx-haematoma">haematoma</a>, <a href="#cx-infection">infection</a>, <a href="#ts-retention">retention</a>, <a href="#cx-aftercare">discharge advice</a>.</p>`,
    }), 1),
    P('Use the check below when a nurse calls about a block that seems slow to wear off, or on your post-operative round. It reflects the list above; it does not replace examining the patient.', 'sp-prose cx-small'),
    T(el('div', { id: 'cx-check' }, neuroCheck({ id: 'cx-neuro-check' })), 1),
  );
  return b;
}

// ---------------------------------------------------------------- numbers
function glance() {
  return block('cx-glance', 'How common? The numbers, and what each one counts',
    T(P('Each figure comes from a different population and counts a different thing, so do not compare rows directly. Where you need a consent figure, use the one that matches the harm you mean.'), 2),
    T(table({
      id: 'cx-glance-table',
      caption: 'Complications at a glance (published figures)',
      head: ['Complication', 'Figure', 'What it counts and where it comes from'],
      rows: [
        [{ html: '<a href="#cx-pdph">Post-dural puncture headache</a>', th: true }, `${N('4.2%')} with pencil-point vs ${N('11.0%')} with cutting needles`, 'Meta-analysis of lumbar punctures for any indication (110 trials, 31,412 patients). Not a spinal anaesthesia incidence.'],
        [{ html: 'Hypotension / bradycardia', th: true }, `${N('33%')} / ${N('13%')}`, 'Historical: a prospective study of 952 spinals (1992). Rates now depend on the definition and on prophylaxis.'],
        [{ html: '<a href="#cx-other">Urinary retention</a>', th: true }, `${N('5–70%')}`, 'Postoperative retention after any anaesthetic; varies with surgery and patient'],
        [{ html: '<a href="#cx-neuro">Neurological injury, any severity</a>', th: true }, `${N('6 per 10,000')} spinals`, 'France, 40,640 spinals. Includes transient deficits; most were not permanent.'],
        [{ html: 'Permanent harm', th: true }, `${N('1 in 24,000')} to ${N('1 in 54,000')} (${N('4.2')} to ${N('2.0 per 100,000')})`, 'UK NAP3 (data 2006–07), all central neuraxial blocks, not spinal alone. Paraplegia or death was 1.8 and 0.7 per 100,000. Spinals were among the lower-risk blocks; most harm followed perioperative epidurals.'],
        [{ html: 'Serious complications after spinal', th: true }, `${N('1 in 20,000–30,000')}`, 'Sweden 1990–99, about 1.26 million spinals (of about 1.7 million neuraxial blocks)'],
        [{ html: '<a href="#cx-haematoma">Vertebral canal haematoma</a>', th: true }, `${N('1 in 3,600')} women having knee arthroplasty vs ${N('1 in 200,000')} obstetric epidurals`, 'Sweden 1990–99; two subgroups of neuraxial blocks, not a single-shot spinal rate'],
        [{ html: '<a href="#cx-cardiac">Cardiac arrest during spinal</a>', th: true }, `${N('6.4')} and ${N('2.7 per 10,000')}`, 'Two French surveys, 1997 and 2002'],
        [{ html: '<a href="#cx-tns">Transient neurological symptoms</a>', th: true }, `Relative risk ${N('5.1')} with lidocaine vs bupivacaine`, '1,863 spinals; a ratio, not an incidence'],
      ],
    }), 2),
    T(callout('pearl', {
      title: 'Why the harm numbers differ',
      body: '<p>The French figure (6 per 10,000) counts any new neurological deficit after spinal, mostly transient. NAP3 counts permanent harm after every kind of central neuraxial block, with a pessimistic and an optimistic count (hence a range). Sweden counts serious complications of all kinds. None of them is "the risk of a spinal"; say which harm you mean when you consent.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- PDPH
function pdph() {
  const tree = createTree(PDPH_TREE, { headingLevel: 4, kicker: 'Interactive · PDPH pathway' });
  const outline = details({ id: 'cx-pdph-outline', summary: 'The whole PDPH pathway as a list', body: treeOutline(PDPH_TREE) });

  return block('cx-pdph', 'Post-dural puncture headache (PDPH)',
    T(callout('key', {
      title: 'Answer first',
      body: '<p>A headache that starts within 5 days of a dural puncture, usually worse sitting or standing, with no better explanation. Treat with simple analgesia; offer an epidural blood patch if it limits daily life. A headache that does not fit (fever, focal signs, no postural element, onset late) is not PDPH until a senior has excluded the alternatives.</p>',
    }), 1),
    el('div', { class: 'cx-split' },
      el('div', { class: 'cx-col' },
        grp(1, H4('Definition and criteria'),
          P(`ICHD-3 defines PDPH as a headache that starts <strong>within 5 days</strong> of a dural puncture, is caused by CSF leaking through the hole, and is not better accounted for by another diagnosis. It usually comes with neck stiffness or hearing symptoms, and settles by itself within 2 weeks or after an epidural blood patch.${cite('cx-ichd3')} A postural pattern (worse sitting or standing, better lying flat) is typical but <strong>no longer a required criterion</strong>.${cite('uppal2023')}`)),
        grp(1, H4('Symptoms'),
          UL([
            'Fronto-occipital headache, usually worse within minutes of sitting up.',
            'Neck stiffness, tinnitus or muffled hearing, photophobia, nausea.',
            `Double vision from a sixth nerve palsy, or hearing loss: reasons to consider a blood patch.${cite('uppal2023')}`,
          ])),
        grp(2, H4('Why it happens'),
          P('CSF leaks faster than it is made, so CSF volume and pressure fall. The brain sags and pulls on pain-sensitive structures when upright, and the intracranial veins dilate to make up the lost volume (Monro-Kellie doctrine). Traction on the sixth cranial nerve, which has a long intracranial course, explains the diplopia; traction and pressure changes on the inner ear explain the hearing symptoms.')),
        grp(2, H4('Who gets it'),
          P(`Overall incidence ranges from under 2% to 40%, depending on patient and needle.${cite('uppal2023')} Pencil-point needles roughly halve the risk compared with cutting needles (${N('4.2%')} vs ${N('11.0%')}; see the <a href="#cx-glance">numbers</a>). Younger age, female sex and a previous PDPH raise the risk; smaller gauges lower it.${cite('uppal2023', 'cx-ichd3')} Needle choice is in <a href="#tq-fig-needles">Technique</a>.`)),
      ),
      el('div', { class: 'cx-col' },
        T(table({
          id: 'cx-pdph-ddx',
          caption: 'Not PDPH? Differential diagnosis',
          head: ['Cause', 'Clues'],
          rows: [
            [{ html: 'Subdural haematoma', th: true }, `Headache loses its postural pattern, drowsiness, focal signs, seizures. Intracranial hypotension can tear bridging veins. CT or MRI.${cite('uppal2023')}`],
            [{ html: 'Cerebral venous sinus thrombosis', th: true }, `Persistent or changing headache, seizures, focal signs, especially after a failed patch. Peripartum patients are at higher risk.${cite('uppal2023')}`],
            [{ html: 'Meningitis', th: true }, 'Fever, neck stiffness, photophobia, headache not postural. See <a href="#cx-infection">infection</a>.'],
            [{ html: 'Subarachnoid or other intracranial haemorrhage', th: true }, 'Sudden severe headache, collapse, neck stiffness.'],
            [{ html: 'Pre-eclampsia', th: true }, 'Raised BP, visual symptoms, proteinuria in a pregnant or postpartum patient. Headache not postural.'],
            [{ html: 'Pneumocephalus', th: true }, 'Air entering the head after a loss-of-resistance-to-air technique; onset within hours, sudden pain.'],
            [{ html: 'Migraine, tension-type, caffeine withdrawal, sinusitis', th: true }, 'Common and often present before the block. Ask about the pre-existing headache pattern.'],
          ],
        }), 2),
        T(callout('warn', {
          title: 'Do not assume it is PDPH',
          body: `<p>Change in character, onset more than 5 days after puncture, fever, focal signs, seizures, drowsiness, confusion or visual change, or worsening after a blood patch: <strong>senior review and imaging</strong>. Dural puncture is associated with subdural haematoma and cerebral venous sinus thrombosis.${cite('uppal2023')}</p>`,
        }), 1),
      ),
    ),
    grp(2, H4('Sixth nerve (abducens) palsy and other cranial nerve signs'),
      UL([
        'Diplopia on looking to the side, worse on distance viewing; can appear days after the puncture.',
        `Usually recovers, but it is a reason to offer a blood patch rather than wait.${cite('uppal2023')}`,
        'Examine eye movements in every patient with a headache after a puncture. Ptosis, facial weakness or any other cranial nerve sign needs imaging.',
      ])),
    grp(1, H4('Conservative treatment'),
      UL([
        `Regular paracetamol and an NSAID unless contraindicated. Opioids briefly, only if these fail; not long term.${cite('uppal2023')}`,
        `Caffeine may be offered in the first 24 h of symptoms, up to ${D('900 mg/day')} from all sources (${D('200–300 mg/day')} if breastfeeding). The evidence is two small trials.${cite('uppal2023')}`,
        `<strong>Hydration and bed rest do not treat it.</strong> Drink normally; IV fluid only if the patient cannot drink. Bed rest does not prevent PDPH and is only for temporary relief.${cite('uppal2023')}`,
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
            [{ html: 'Cautions', th: true }, `Fever or systemic infection; coagulopathy or antithrombotics (apply the <a href="#tq-ac-full">neuraxial timing rules</a>). Consent covers repeat dural puncture, backache and neurological complications.${cite('uppal2023')}`],
          ],
        }),
      )),
    T(P(`<strong>Mechanism of a patch (tier 3):</strong> the injected blood first compresses the dural sac (an immediate pressure effect), then clots over the hole. That is why relief can be quick but a leak can reopen.`), 3),
    T(P(`After a spinal with a fine (22G or smaller) needle, a <strong>greater occipital nerve block</strong> may be offered (a weak, grade C recommendation); the headache may come back, and severe cases still need a patch.${cite('uppal2023')}`), 3),
    T(callout('pearl', {
      title: 'Advanced pearl: when a patch fails',
      body: '<p>If a blood patch gives no relief, or only brief relief, do not just repeat it. Re-examine the diagnosis first. A headache that has lost its postural pattern, or that comes with focal signs, needs a senior review and imaging for other causes such as intracranial haemorrhage or cerebral venous sinus thrombosis before another patch.</p>',
    }), 3),
    T(tree.el, 2),
    T(outline, 2),
  );
}

// ---------------------------------------------------------------- haematoma
function haematoma() {
  return block('cx-haematoma', 'Spinal and epidural haematoma',
    T(callout('key', {
      title: 'Answer first',
      body: `<p>New back pain, or leg weakness or numbness, or a block that is too long or comes back, is a haematoma until an MRI says otherwise. Red flags are in <a href="#cx-red-flags">the one list</a>. Get a senior, an <strong>urgent MRI</strong> and neurosurgery. Delay to imaging and to decompression is the avoidable part of this injury.</p>`,
    }), 1),
    T(P(`Rare but catastrophic. In Sweden (1990–99) there were 33 haematomas among about ${N('1.7 million')} neuraxial blocks. The risk was ${N('1 in 3,600')} in women having knee arthroplasty, against ${N('1 in 200,000')} after obstetric epidurals. The first figure is for one high-risk group, not a rate for single-shot spinal.`), 2),
    grp(2, H4('Risk factors'),
      UL([
        `<strong>Anticoagulant or antiplatelet drugs</strong>, especially in combination; follow the timing rules in the <a href="#tq-ac-full">anticoagulation table</a>.${cite('esaic2022')}`,
        `<strong>Catheter removal</strong> is a risk point too: the same intervals apply to removal as to insertion.${cite('esaic2022')}`,
        'Coagulopathy, liver disease, low platelets.',
        'Difficult or traumatic puncture, multiple attempts. A bloody tap alone does not predict a haematoma, but it should make you vigilant.',
        'Spinal column abnormality (for example stenosis, which leaves little room for any mass).',
        'Older age, female sex, renal impairment and osteoporosis (proposed in the Swedish series) are also commonly cited.',
      ])),
    grp(2, H4('Presentation'),
      UL([
        'Progressive or <strong>returning</strong> motor and sensory block, often before pain. Back or radicular pain, then bladder and bowel dysfunction.',
        'A dense block that lasts much longer than the drug and dose predict. If an epidural infusion is running, stop it so the legs can be examined.',
        'Onset can be hours after the block or after catheter removal.',
      ])),
    grp(1, H4('What to do'),
      UL([
        'Examine and document the level, power and perineal sensation. Tell the senior and the surgeons now.',
        `<strong>Urgent MRI.</strong> Do not wait for the block to wear off, and do not wait for pain.`,
        `<strong>Neurosurgery:</strong> ESAIC/ESRA advise decompression, if indicated, <strong>within 6 h</strong> for neurological recovery.${cite('esaic2022')} Older surgical series favour operating within about 12 h of symptom onset; both say the same thing: sooner is better.`,
        'Correct any coagulopathy as advised by the senior and haematology.',
      ])),
    T(P(`Trained staff should check sensory and motor recovery regularly for at least ${N('24 h')} after a neuraxial block, and longer in high-risk patients. Brief day-case patients on what to report.${cite('esaic2022')}`), 1),
    T(callout('pearl', {
      title: 'Advanced pearl: a block that is too dense or too long',
      body: '<p>Do not wait for pain: motor block may be the only early sign. A block that returns after starting to wear off is the strongest hint. The threshold for an urgent MRI should be low; a normal-looking early picture should not stop you from acting if the signs are progressing.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- infection
function infection() {
  return block('cx-infection', 'Infection: meningitis and epidural abscess',
    T(P('Both are rare. Fever with a headache that is not postural points to meningitis; fever with back pain points to an abscess. Both need urgent senior help and imaging (<a href="#cx-red-flags">red flags</a>).'), 1),
    T(table({
      id: 'cx-infection-table',
      caption: 'Meningitis vs epidural abscess after neuraxial block',
      head: ['', 'Meningitis', 'Epidural abscess'],
      rows: [
        [{ html: 'Cases in the Swedish series', th: true }, '29', '13'],
        [{ html: 'Usually linked to', th: true }, 'Single-shot spinal; mouth organisms from the operator (one outbreak of <i>Streptococcus salivarius</i> was traced to an anaesthetist’s oral flora)', 'Epidural catheters more than single-shot spinals; longer catheter use, immunosuppression, diabetes, bacteraemia'],
        [{ html: 'Onset', th: true }, 'Hours to a few days', 'Days to weeks; can be delayed'],
        [{ html: 'Features', th: true }, 'Fever, severe non-postural headache, neck stiffness, photophobia, drowsiness', 'Back pain, local tenderness, fever, then root pain, then leg weakness, then paralysis'],
        [{ html: 'Action', th: true }, 'Senior, blood cultures, urgent empirical antibiotics, CSF if safe, imaging if focal signs', 'Urgent MRI, blood cultures, antibiotics, neurosurgery. Weakness means the time to operate is short'],
      ],
    }), 2),
    T(P(`<strong>Prevention:</strong> hand hygiene, cap, mask, sterile gown and gloves, and chlorhexidine in alcohol allowed to dry fully before puncture.${cite('tq-campbell2014')} Wear a face mask: it protects against oral streptococci.`), 1),
    T(P('Chemical (aseptic) meningitis can follow contamination of the CSF by skin prep, blood or another agent. It is a diagnosis of exclusion and is still treated as bacterial until proved otherwise.'), 3),
  );
}

// ---------------------------------------------------------------- nerve injury
function neuro() {
  return block('cx-neuro', 'Nerve injury and neurological assessment after a neuraxial block',
    T(P(`Permanent harm is rare (see the <a href="#cx-glance">numbers</a>). In the UK’s NAP3, two-thirds of injuries that were disabling at first resolved fully. In a French survey, neurological injury after spinal was ${N('6 per 10,000')}, higher than after other regional techniques.`), 2),
    grp(2, H4('Mechanisms'),
      UL([
        `<strong>Direct needle trauma</strong> to a root or the cord. In the French survey, two-thirds of patients with a deficit had paraesthesia during puncture or pain on injection, and the deficit followed the same distribution.`,
        `<strong>Conus injury from misjudging the level.</strong> In seven cases of conus damage the space was usually believed to be L2–3 and every patient felt pain on insertion. Level rules are in <a href="#an-tuffier">Tuffier’s line and level</a>: aim for L3–4 or below.`,
        `<strong>Compression</strong> by a <a href="#cx-haematoma">haematoma</a> or an <a href="#cx-infection">abscess</a>. These are the injuries that time can change.`,
        `<strong>Local anaesthetic neurotoxicity.</strong> In the French survey, of the deficits that followed spinals without paraesthesia or pain on injection, three-quarters were after hyperbaric 5% lidocaine (<a href="#ph-tns">pharmacology</a>).`,
        `<strong>Chemical injury</strong> from the wrong drug or from antiseptic carried into the CSF; chlorhexidine is neurotoxic.${cite('tq-campbell2014')}`,
        '<strong>Ischaemia</strong> of the cord, for example with prolonged severe hypotension.',
      ])),
    T(P(`Patients with an existing peripheral or diabetic neuropathy had a new or worse deficit in ${N('0.4%')} (95% CI 0.1–1.3%) after neuraxial block. Document any deficit before you start.`), 2),
    T(callout('key', {
      title: 'The paraesthesia rule',
      body: `<p>A brief electric shock that settles at once is common. Stop, and check for CSF. <strong>Persistent paraesthesia, or pain on injection: stop, do not inject, withdraw and redirect.</strong> Never inject through a needle that hurts. Document the side, dermatome and what you did. Step through it in the <a href="#ts-paraesthesia">paraesthesia tree</a>.</p>`,
    }), 1),
    grp(1, H4('Checking the legs after a block'),
      UL([
        `Expected: motor power and sensation return in the order and time the drug and dose predict (see the <a href="#tq-timecourse">time course</a>); perineal sensation and bladder function are the last to return.`,
        'Not expected: asymmetry, a level that rises, a block that comes back, or recovery that stalls.',
        'Test power in each leg (hip flexion, knee extension, ankle dorsiflexion and plantar flexion), sensation to light touch or cold against the expected level, and perineal sensation if there is any doubt. Record the time.',
        'A block that has not gone by the time its drug should have worn off: use the <a href="#cx-check">neuro check</a>, then escalate.',
      ])),
    T(table({
      id: 'cx-weak-legs',
      caption: 'Weak or numb legs after surgery under spinal: not always the spinal',
      head: ['Cause', 'Clue'],
      rows: [
        [{ html: 'Block still working', th: true }, 'Symmetrical, falling level, within the expected time for the drug'],
        [{ html: 'Compressive lesion (haematoma, abscess)', th: true }, 'Back pain, rising or returning block, sphincter change. <a href="#cx-red-flags">Red flags</a>'],
        [{ html: 'Peripheral nerve injury from positioning, tourniquet or surgery', th: true }, 'Single nerve territory (for example common peroneal after lithotomy or lateral position), often painless, normal perineal sensation'],
        [{ html: 'Compartment syndrome or limb ischaemia', th: true }, 'Pain out of proportion, tense limb, pulses. A block can mask the pain: check the limb.'],
        [{ html: 'Cord ischaemia (anterior spinal artery)', th: true }, 'Sudden painless flaccid weakness, loss of pain and temperature with preserved position sense. See below.'],
        [{ html: 'Intrathecal opioid or other drug effect', th: true }, 'Drowsy, itchy, slow breathing, but legs normal'],
      ],
    }), 2),
    grp(1, H4('When to involve neurology or neurosurgery'),
      UL([
        'Any new deficit outside the expected block, a block that does not regress as expected, or new back pain with neurological signs.',
        `<strong>Exclude compression first</strong> with an urgent MRI. A treatable haematoma or abscess must not wait for a neurology opinion.${cite('esaic2022')}`,
        'Then refer to neurology for assessment, with nerve conduction studies or EMG if needed, and follow the patient up.',
      ])),
    // named syndromes
    T(table({
      id: 'cx-syndromes',
      caption: 'Named neurological syndromes after neuraxial anaesthesia',
      head: ['Syndrome', 'What it is', 'Clues and action'],
      rows: [
        [{ html: '<span id="cx-ces">Cauda equina syndrome</span>', th: true }, 'Compression or toxic injury of the lumbosacral roots.', 'Saddle numbness, bladder and bowel dysfunction, leg weakness, sexual dysfunction, bilateral sciatica. After neuraxial block: compression by haematoma or abscess until proved otherwise (urgent MRI), or toxicity from a high local anaesthetic concentration around the sacral roots (the 1990s microcatheter cases; see <a href="#ph-tns">pharmacology</a>).'],
        [{ html: '<span id="cx-arachnoiditis">Adhesive arachnoiditis</span>', th: true }, 'Chronic inflammation and scarring of the arachnoid and the roots, so the roots clump together.', 'Weeks to months later: burning or persistent pain, weakness, sphincter change, progressive. MRI shows clumped roots. Linked to contamination of the subarachnoid space (chlorhexidine, blood, preservatives, wrong drugs) and to infection. No cure, so prevention is everything: <a href="#cx-wrong-route">keep the tray clean</a>.'],
        [{ html: '<span id="cx-asa">Anterior spinal artery syndrome</span>', th: true }, 'Infarction of the anterior two-thirds of the cord (<a href="#an-cordsupply">blood supply</a>).', 'Sudden, usually painless flaccid paraparesis with loss of pain and temperature, but touch and position sense kept, and sphincter loss. Associated with prolonged severe hypotension, vascular disease, or adrenaline-containing spinal solutions are suspected but unproven. MRI to exclude compression; support perfusion.'],
        [{ html: '<span id="cx-ntx">Neurotoxicity</span>', th: true }, 'Direct toxic effect of drug or additive on the roots.', 'Pain on injection, persistent deficit in the injected distribution. Mainly hyperbaric 5% lidocaine and chlorhexidine.'],
      ],
    }), 2),
    T(callout('pearl', {
      title: 'Advanced pearl: the patient who cannot tell you',
      body: '<p>Warning paraesthesia and pain on injection are only useful if the patient can report them. Heavy sedation or general anaesthesia before the block removes this early warning, which is one reason most spinals are done with the patient awake or lightly sedated. If a deeply sedated patient must have a block, take extra care with the level, the needle direction and the injection pressure.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- TNS
function tns() {
  return block('cx-tns', 'Transient neurological symptoms (TNS)',
    T(P('Pain or unpleasant sensations in the buttocks radiating to the legs, starting within about a day of an uneventful spinal. There is no objective deficit, and it settles within days. Drug mechanism and choice are in <a href="#ph-tns">Pharmacology</a>.'), 1),
    T(UL([
      `<strong>Lidocaine is the main cause.</strong> In 1,863 patients, lidocaine carried a relative risk of ${N('5.1')} compared with bupivacaine and ${N('3.2')} compared with tetracaine. With lidocaine, the lithotomy position (${N('2.6')}) and day-case status (${N('3.6')}) increased the risk. Needle type, lidocaine dose and concentration did not.`,
      `A Cochrane network meta-analysis found lower risk with bupivacaine, levobupivacaine, prilocaine, procaine and ropivacaine than with lidocaine; chloroprocaine and mepivacaine did not differ from lidocaine (low-quality evidence).`,
      'Treat with NSAIDs and reassurance. Any objective deficit means it is not TNS: examine and investigate (<a href="#cx-red-flags">red flags</a>).',
    ]), 2),
  );
}

// ---------------------------------------------------------------- high spinal
function high() {
  return block('cx-high', 'High or total spinal',
    T(P('Breathless, weak hands, difficulty speaking, drowsy, falling blood pressure and heart rate: a block that has spread too high. <strong>Call for help, give oxygen, raise the legs (no head-down tilt), support the airway and treat the circulation.</strong> Steps and drugs are in the <a href="#ts-high-spinal">high spinal tree</a>.'), 1),
    T(table({
      id: 'cx-high-table',
      caption: 'How a rising block shows itself',
      head: ['Level reached', 'What the patient notices', 'Why'],
      rows: [
        [{ html: 'About T1–T4', th: true }, 'Slow heart rate, falling BP', 'Cardiac sympathetic (accelerator) fibres blocked; unopposed vagal tone'],
        [{ html: 'Cervical (C3–C5)', th: true }, 'Weak hands, breathless, cannot cough, whisper voice', 'Phrenic nerve roots; intercostals already blocked; hands from C6–T1'],
        [{ html: 'Brainstem', th: true }, 'Drowsy, apnoea, dilated pupils', 'Drug at the brainstem, or low brainstem flow after circulatory collapse'],
      ],
    }), 2),
    T(P('Causes: too large a dose for the patient, a hyperbaric drug with the head down or a pregnancy-like state (<a href="#tq-spread-h">spread factors</a>), subdural placement, or an epidural top-up or large injection after an intended spinal. Treat it as an airway, breathing and circulation problem first, and tell the patient what is happening.'), 2),
  );
}

// ---------------------------------------------------------------- LAST
function last() {
  return block('cx-last', 'Local anaesthetic systemic toxicity (LAST)',
    T(P(`A spinal alone rarely causes LAST. A typical spinal dose of bupivacaine is ${D('10–15 mg')}, a small fraction of the systemic limit: single doses up to ${D('150 mg')}, and no more than ${D('2 mg/kg')} in any 4-hour period. If bupivacaine is given by more than one technique, the overall limit is ${D('150 mg')}.${cite('cx-marcain-smpc')}`), 2),
    grp(1, H4('When it matters around a spinal'),
      UL([
        'A failed spinal followed by a large-volume block, or an epidural top-up.',
        '<strong>Hip fracture:</strong> a fascia iliaca or PENG block before or after the spinal, plus any local infiltration by the surgeon. Add up every local anaesthetic dose.',
        'Accidental intravenous injection; frail, small or elderly patients.',
      ])),
    grp(1, H4('Emergency steps'),
      P(`Management follows the Association of Anaesthetists LAST card: <strong>stop injecting, call for help, get the lipid pack, oxygen and airway, benzodiazepine for seizures.</strong> Give ${D('20%')} lipid emulsion: a bolus of ${D('1.5 mL/kg')} over 2–3 min, then an infusion of ${D('15 mL/kg/h')}. If the circulation has not recovered, repeat the bolus at 5 and 10 min (no more than 3 boluses in total) and double the infusion to ${D('30 mL/kg/h')} after 5 min. Maximum cumulative dose ${D('12 mL/kg')}. In cardiac arrest use smaller adrenaline doses (${D('≤1 µg/kg')}) and expect a long resuscitation.${cite('cx-qrh310')}`)),
    T(P('Mechanism of lipid rescue and the pharmacology of local anaesthetic toxicity are in <a href="#ph-last">Pharmacology</a>.', 'sp-prose cx-small'), 2),
    T(callout('pearl', {
      title: 'Advanced pearl: LAST can be quiet or late',
      body: '<p>LAST does not always begin with a seizure. It can start with agitation, a metallic taste or perioral numbness, or with cardiovascular collapse alone, and it can appear some minutes after the block. Keep monitoring and keep the lipid pack close. In treatment, lipid emulsion is not replaced by propofol, and vasopressin, calcium channel blockers and beta-blockers are best avoided. Keep a running total of every local anaesthetic given, by every route, in the notes.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- cardiac
function cardiac() {
  return block('cx-cardiac', 'Cardiac arrest and severe bradycardia under spinal',
    T(P(`<strong>Act on a falling heart rate early.</strong> Sudden bradycardia can go to asystole within moments, even in a patient who is still talking. Raise the legs, give a vagolytic and a vasopressor, and escalate to adrenaline if it is sudden or severe. Do <strong>not</strong> tilt head-down after a heavy spinal: it can push the block higher. Doses and order are in the <a href="#ts-hypotension">hypotension and bradycardia tree</a> and the <a href="#ts-high-spinal">high spinal tree</a>. If the heart stops, start CPR and give adrenaline early.`), 1),
    T(P(`Cardiac arrest during spinal was ${N('6.4 per 10,000')} in a 1997 French survey, against ${N('1.0 per 10,000')} for other regional techniques, and ${N('2.7 per 10,000')} in the 2002 survey.`), 2),
    T(P(`Closed claims of arrests in healthy patients showed two patterns: heavy sedation with unrecognised respiratory insufficiency, and failure to appreciate how much the sympathetic block hinders resuscitation. The authors advised early use of a potent alpha-agonist and restoring venous return by raising the legs.`), 2),
    T(UL([
      'Young, fit patients with a slow resting heart rate, beta-blockers or a high block are at risk of sudden bradycardia.',
      'Avoid heavy sedation on top of a spinal, and keep watching breathing and heart rate.',
    ]), 2),
    T(callout('pearl', {
      title: 'Advanced pearl: why a slow heart rate is not benign',
      body: '<p>Reduced venous return and a reflex slowing of the heart (the Bezold-Jarisch reflex is the proposed mechanism: an underfilled, vigorously contracting ventricle triggers vagal afferents) are both thought to contribute. A falling heart rate in a patient who is still talking is a reason to act now, with the legs raised, a vagolytic and a vasopressor ready, rather than to watch the next reading.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- wrong route
function wrongRoute() {
  const f = figure({
    id: 'cx-fig-connectors', plate: 'none', aspect: 'auto',
    title: 'Luer and NRFit: why a neuraxial-only connector prevents wrong-route injection',
    caption: 'Schematic, not to scale. Shapes are simplified to show the principle that each connector mates only with its own kind; real connectors differ in detail.',
  });
  f.stage.append(connectorsFigure());
  f.describe('Three panels. A Luer syringe connects to a Luer IV port. A Luer syringe will not connect to an NRFit spinal needle. An NRFit syringe connects to an NRFit spinal needle.');

  return block('cx-wrong-route', 'Wrong-route and wrong-drug errors',
    T(P(`<strong>Tranexamic acid given intrathecally</strong>, usually instead of the intended bupivacaine, has caused seizures, arrhythmias, paraplegia, permanent neurological injury and death. Similar vial caps and storing look-alike products together contribute. The FDA advises storing tranexamic acid separately, labelling it, and checking the label rather than the cap colour.`), 1),
    grp(1, H4('Practice points'),
      UL([
        'Draw up spinal drugs yourself, from a separate clean tray, just before use.',
        'Read the ampoule label aloud, with a second person where possible. Do not rely on cap colour or ampoule shape.',
        'Use NRFit syringes, needles and filters where they are stocked.',
        'Keep tranexamic acid, potassium and other IV-only drugs away from local anaesthetic ampoules.',
        `Keep chlorhexidine off the drug tray: apply it before the drugs are opened, do not pour it into pots on the sterile field, and let it dry.${cite('tq-campbell2014')}`,
        'Use preservative-free drugs only. Label every syringe.',
      ])),
    T(P(`<strong>Intrathecal vincristine</strong> is a devastating, usually fatal error. The safeguard is to supply vinca alkaloids for infusion in a minibag, never in a syringe.`), 2),
    T(P(`<strong>NRFit connectors</strong> (ISO 80369-6) are small-bore connectors for neuraxial and regional devices that will not mate with Luer, so an IV syringe or line cannot be connected to a spinal needle or epidural.${cite('iso80369-6')} The 2016 standard was replaced by a 2025 edition.`), 2),
    T(f.fig, 2),
    T(P('<strong>If the wrong drug has gone intrathecal:</strong> stop, call for help at once, keep the patient monitored, and involve the ICU and neurosurgery early. Early CSF drainage or lavage is described for some drugs; this is a specialist decision made with neurosurgery and the poisons service, not a ward procedure. Keep the ampoules and syringes, and report the incident.'), 3),
    T(callout('pearl', {
      title: 'Advanced pearl: fix the system, not the person',
      body: '<p>Wrong-route errors keep happening to careful people. Reminders to "be vigilant" fail; physical barriers work. That means connectors that cannot mate, separate storage for IV-only drugs, and drugs supplied in forms that cannot reach the spinal needle. When you find a near miss, report it: the fix is usually in how drugs are stored and supplied.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- TUR syndrome
function tur() {
  return block('cx-tur', 'TUR syndrome under spinal',
    T(callout('key', {
      title: 'Answer first',
      body: '<p>TURP is a classic indication for spinal (T10 is the usual target) <strong>because the awake patient is the best monitor</strong>. New confusion, restlessness, nausea, headache or visual change during a TURP means fluid absorption until proved otherwise. Tell the surgeon to stop, and send a sodium.</p>',
    }), 1),
    grp(2, H4('What it is'),
      UL([
        'Absorption of irrigating fluid (glycine, sorbitol, mannitol; non-electrolyte, hypotonic) through open prostatic venous sinuses, or by bladder perforation, causing <strong>hypervolaemia, dilutional hyponatraemia and low osmolality</strong>.',
        'Higher risk with a long resection, a large gland, a high irrigation bag or high bladder pressure, and an open capsule.',
        'Bipolar resection with saline irrigation avoids the hyponatraemia, but fluid overload can still occur.',
      ])),
    T(table({
      id: 'cx-tur-table',
      caption: 'Recognising TUR syndrome and bladder perforation under spinal',
      head: ['System', 'Early signs in the awake patient', 'Later'],
      rows: [
        [{ html: 'Brain', th: true }, 'Restlessness, confusion, headache, nausea and vomiting, yawning', 'Seizures, coma (hyponatraemia, cerebral oedema, and with glycine ammonia toxicity)'],
        [{ html: 'Eyes', th: true }, 'Blurred vision, flashes, transient blindness (glycine)', 'Dilated, sluggish pupils'],
        [{ html: 'Circulation', th: true }, 'Hypertension and bradycardia (fluid load), then hypotension', 'Pulmonary oedema, arrhythmias, collapse'],
        [{ html: 'Bladder perforation', th: true }, 'Shoulder-tip, abdominal or suprapubic pain, nausea, pallor. A high block can mask the pain, so a patient who looks unwell without a reason needs the surgeon to look.', 'Distended abdomen, low return of irrigant, shock'],
      ],
    }), 2),
    grp(1, H4('What to do'),
      UL([
        'Tell the surgeon to <strong>stop</strong> and drain the bladder; call for help.',
        'Give oxygen, support airway, breathing and circulation.',
        'Send sodium, blood gas, glucose and osmolality (and ammonia if available). Do not wait for the result if the patient is deteriorating.',
        'Restrict further fluid. Treat fluid overload with a diuretic and pulmonary oedema as usual.',
        'Seizures or severe symptoms from low sodium: senior-led treatment with hypertonic saline, aiming to correct slowly (rapid correction risks osmotic demyelination). Escalate to ICU.',
        'Suspect bladder perforation if pain, distension or shock: ask the surgeon to examine and consider conversion to open repair.',
      ])),
    T(callout('pearl', {
      title: 'Advanced pearl: why not a general anaesthetic?',
      body: '<p>Under general anaesthesia the first signs (confusion, nausea, headache) are lost; TUR syndrome shows late as hypertension, bradycardia, hypotension, seizures or unexplained arrhythmia. Keep sedation light if you want the monitor to keep working, and speak to the patient during the resection.</p>',
    }), 3),
  );
}

// ---------------------------------------------------------------- other
function other() {
  return block('cx-other', 'Other problems: retention, backache, hearing',
    T(table({
      id: 'cx-other-table',
      caption: 'Common minor complications',
      head: ['Problem', 'What to know'],
      rows: [
        [{ html: 'Urinary retention', th: true }, `Common (reported ${N('5–70%')} after surgery overall). The sacral roots (S2–S4) recover last, so the bladder is the last to wake. Risk: opioids, large IV fluid volume, male with prostatic enlargement, pelvic, hernia and anorectal surgery. Bladder ultrasound measures the volume and guides catheterisation. Retention that the block does not explain is a <a href="#cx-red-flags">red flag</a>. See the <a href="#ts-retention">retention tree</a>.`],
        [{ html: 'Backache', th: true }, 'Common after any anaesthetic and usually settles within days; local tenderness at the puncture site is common. Simple analgesia. Severe or worsening back pain with neurological signs is a red flag for <a href="#cx-haematoma">haematoma</a> or <a href="#cx-infection">abscess</a>.'],
        [{ html: 'Hearing loss', th: true }, `Low-frequency, often bilateral, from CSF pressure changes transmitted to the inner ear via the cochlear aqueduct. It is part of PDPH${cite('cx-ichd3')} and is more frequent with larger needles. Pencil-point needles reduced hearing disturbance as well as headache. Usually recovers; persistent hearing loss is a reason to consider a blood patch.${cite('uppal2023')}`],
      ],
    }), 1),
  );
}

// ---------------------------------------------------------------- aftercare
function aftercare() {
  return block('cx-aftercare', 'Aftercare and discharge',
    T(table({
      id: 'cx-discharge',
      caption: 'Fit to go from recovery or to leave the ward? Check each',
      head: ['Check', 'Standard'],
      rows: [
        [{ html: 'Motor and sensory block', th: true }, 'Full power in both legs, sensation back including the perineum, and able to stand and walk safely. A block that is not regressing is a <a href="#cx-red-flags">red flag</a>, not a reason to wait.'],
        [{ html: 'Circulation', th: true }, 'Stable BP and heart rate; no dizziness on sitting or standing.'],
        [{ html: 'Bladder', th: true }, 'Has passed urine, or a bladder scan shows it is safe. Day-case and high-risk patients need this checked before they go.'],
        [{ html: 'Pain, nausea, itch', th: true }, 'Controlled with oral drugs. After intrathecal morphine, monitor breathing and sedation as the <a href="#ph-adjuvants">pharmacology</a> chapter advises.'],
        [{ html: 'Headache', th: true }, 'None, or a clear plan if there is one (see <a href="#cx-pdph">PDPH</a>).'],
        [{ html: 'Advice and escort', th: true }, 'Written advice given; a responsible adult for day cases; a number to call.'],
      ],
    }), 1),
    grp(1, H4('What to tell the patient (and write down)'),
      UL([
        'Come back or call if: new or worsening back pain, leg weakness or numbness, the legs are not back to normal, you cannot pass urine or lose control of bladder or bowel, fever, or a severe headache (especially with neck stiffness, fever or sight problems).',
        'A headache that is worse upright and better lying flat can be treated: do not wait at home.',
        'Do not drive, sign legal papers or drink alcohol for the first day after sedation or if the legs feel odd.',
        'Document the drugs and dose, the number of attempts, any paraesthesia or bloody tap, the time the block wore off, and the advice given.',
      ])),
    T(P(`Neurological checks of sensory and motor recovery should continue for at least ${N('24 h')} after a neuraxial block, and longer if the patient is at high risk (for example on antithrombotic drugs).${cite('esaic2022')}`), 2),
  );
}

export function mount(root) {
  root.append(
    keyPoints([
      'New back pain, leg weakness or numbness, or a block that will not wear off, needs a senior and an urgent MRI. The one red-flag list is <a href="#cx-red-flags">here</a>.',
      'Do not inject through pain or a persistent paraesthesia: stop, withdraw and redirect.',
      'PDPH is a headache after dural puncture, usually worse upright; treat with simple analgesia and offer a blood patch if it limits daily life.',
      'A headache with fever, focal signs or no postural pattern is not simple PDPH: get a senior review.',
      'Hypotension and bradycardia are common; treat early and raise the legs. Do not tilt head-down after a heavy spinal.',
      'Add up every local anaesthetic dose by every route; know where the lipid pack is.',
      'During a TURP under spinal, new confusion or restlessness is TUR syndrome until proved otherwise.',
      'Read every ampoule label; use neuraxial-only (NRFit) connectors where stocked.',
    ]),
    P('What can go wrong, how often, how to spot it early and what to do. Rates come from large audits and surveys; the population behind each figure is named.', 'sp-lead'),
    el('ul', {
      class: 'sp-jump',
      html: ['cx-red-flags:Red flags and neuro check', 'cx-glance:The numbers', 'cx-pdph:PDPH', 'cx-haematoma:Haematoma', 'cx-infection:Infection', 'cx-neuro:Nerve injury and syndromes', 'cx-tns:TNS', 'cx-high:High spinal', 'cx-last:LAST', 'cx-cardiac:Cardiac arrest', 'cx-wrong-route:Wrong route', 'cx-tur:TUR syndrome', 'cx-other:Retention, backache, hearing', 'cx-aftercare:Aftercare']
        .map((s) => { const [id, t] = s.split(':'); return `<li><a href="#${id}">${t}</a></li>`; }).join(''),
    }),
    redFlags(),
    glance(),
    pdph(),
    haematoma(),
    infection(),
    neuro(),
    tns(),
    high(),
    last(),
    cardiac(),
    wrongRoute(),
    tur(),
    other(),
    aftercare(),
  );

  registerSearch([
    { title: 'PDPH pathway: blood patch criteria', text: 'post dural puncture headache epidural blood patch pathway list', id: 'cx-pdph-outline' },
    { title: 'Cauda equina syndrome after spinal', text: 'saddle anaesthesia bladder bowel CES', id: 'cx-ces' },
    { title: 'Adhesive arachnoiditis', text: 'chlorhexidine contamination clumped roots', id: 'cx-arachnoiditis' },
    { title: 'Anterior spinal artery syndrome', text: 'cord infarction paraplegia spinal artery', id: 'cx-asa' },
    { title: 'TUR syndrome and TURP under spinal', text: 'transurethral resection glycine hyponatraemia irrigation fluid absorption bladder perforation', id: 'cx-tur' },
    { title: 'Total spinal (high block)', text: 'high spinal total spinal breathless weak hands apnoea', id: 'cx-high' },
    { title: 'Discharge criteria after spinal', text: 'fit for discharge day case void walk advice', id: 'cx-aftercare' },
  ]);

  return {
    reveal(hashId) {
      const t = document.getElementById(hashId);
      if (!t) return false;
      for (let p = t.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
      return true;
    },
  };
}
