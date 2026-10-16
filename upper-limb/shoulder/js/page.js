// Shoulder blocks page (interscalene, superior trunk, suprascapular, axillary nerve): wires the shared regional shell
// (shared/regional) to this page's chapters and data.
import { bootPage } from '../../../shared/regional/js/shell.js';
import { el, fill, table, callout } from '../../../shared/regional/js/ui.js';
import { BLOCKS } from './blocks.js?v=20261016';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

/** Chapter: who supplies the shoulder, and which block for which patient (the phrenic nerve). */
function renderChoose(sec) {
  sec.append(el('h2', { id: 'sh-choose-h', text: 'The shoulder: nerves, blocks and the phrenic nerve' }));
  fill(sec.appendChild(el('div', {})), `<p>The shoulder joint is supplied mainly by the <strong>suprascapular nerve</strong> (the posterior and superior capsule, most of the joint) and the <strong>axillary nerve</strong> (the anterior and inferior capsule), with the <strong>lateral pectoral nerve</strong> to the front. The skin over the top of the shoulder, the "cape", is the <strong>supraclavicular nerves</strong> of the cervical plexus, which no brachial plexus block reliably covers. The phrenic nerve runs down the front of the anterior scalene, millimetres from C5: the closer to the roots you inject, the more likely the diaphragm is weakened.</p>`);
  sec.append(table({
    id: 'sh-cmp', className: 'ul-cmp', caption: 'Shoulder blocks, from the most to the least likely to weaken the diaphragm',
    head: ['Block', 'Dose', 'Shoulder joint', 'Diaphragm'],
    rows: [
      [{ th: true, html: '<a href="#ch-interscalene">Interscalene</a>' }, '15 ml of 0.5% ropivacaine', 'The best analgesia, especially in the first hours', 'Paresis expected (almost every patient at this volume)'],
      [{ th: true, html: '<a href="#ch-superior-trunk">Superior trunk</a>' }, '15 ml of 0.5% ropivacaine', 'Similar to interscalene', 'Much less common, not abolished'],
      [{ th: true, html: '<a href="../arm/#ch-supraclavicular">Supraclavicular</a>' }, '15–20 ml of 0.5% ropivacaine', 'Variable: the suprascapular nerve may be missed', 'Up to about a third'],
      [{ th: true, html: '<a href="#ch-suprascapular">Suprascapular</a> + <a href="#ch-axillary-nerve">axillary nerve</a>' }, '5–10 ml of 0.5% ropivacaine for each', 'Good, a little less than interscalene early on', 'Rare (posterior approaches)'],
    ],
  }));
  sec.append(callout('warn', {
    title: 'When the diaphragm matters',
    body: '<p>Severe COPD, obesity, a contralateral phrenic palsy or pneumonectomy: avoid an interscalene block. Use suprascapular plus axillary nerve blocks, or a superior trunk block with a lower volume, and accept slightly less analgesia in the first hours. <strong>Never block both sides.</strong></p>',
  }));
  sec.append(callout('key', {
    title: 'The cape of the shoulder',
    body: '<p>Anterior and superior arthroscopy ports and a deltopectoral incision that reaches the clavicle lie in supraclavicular nerve skin. Ask for port infiltration, or add a <a href="/head-neck/cervical/#ch-scp">superficial cervical plexus block</a>.</p>',
  }));
}

bootPage({
  title: 'Shoulder blocks',
  eyebrow: 'Regional anaesthesia · Upper-limb blocks',
  backLabel: 'See all upper-limb blocks and the operation chooser',
  backShort: 'Upper-limb blocks',
  backHref: '../',
  lead: 'Interscalene, superior trunk, suprascapular and axillary nerve blocks: who supplies the shoulder joint, how to block it, and how to spare the diaphragm when it matters.',
  searchPlaceholder: 'Search, e.g. phrenic, traffic light, suprascapular',
  tiles: [
    { title: 'Block for shoulder surgery', desc: 'Interscalene: C5 and C6, 15 ml', href: '#ch-interscalene' },
    { title: 'Spare the diaphragm', desc: 'Superior trunk, or suprascapular + axillary', href: '#ch-choose' },
    { title: 'Find the traffic light', desc: 'C5 and C6 between the scalenes', href: '#interscalene-step-identify' },
    { title: 'Practise the superior trunk needle', desc: 'Before the suprascapular nerve leaves', href: '#superior-trunk-step-needle' },
    { title: 'Block the suprascapular nerve', desc: 'On bone in the supraspinous fossa', href: '#ch-suprascapular' },
    { title: 'Breathless after the block?', desc: 'Differentials and the interscalene complications', href: '#interscalene-complications' },
  ],
  chapters: [
    { id: 'ch-choose', title: 'The shoulder: nerves, blocks and the phrenic nerve', short: 'Choosing', desc: 'Who supplies the joint and the cape; four ways to block it, by risk to the diaphragm.', render: renderChoose },
    { id: 'ch-interscalene', title: 'Interscalene block', short: 'Interscalene', desc: 'C5 and C6 roots between the scalenes. Phrenic palsy expected.', block: byId.interscalene },
    { id: 'ch-superior-trunk', title: 'Superior trunk block', short: 'Superior trunk', desc: 'Same shoulder cover, much less phrenic palsy.', block: byId['superior-trunk'] },
    { id: 'ch-suprascapular', title: 'Suprascapular nerve block', short: 'Suprascapular', desc: 'Most of the shoulder joint, from behind; no phrenic block.', block: byId.suprascapular },
    { id: 'ch-axillary-nerve', title: 'Axillary nerve block', short: 'Axillary nerve', desc: 'The anterior and inferior capsule, beside the posterior circumflex humeral artery.', block: byId['axillary-nerve'] },
  ],
  synonyms: [
    ['isb', 'interscalene', 'traffic light'],
    ['stb', 'superior trunk', 'upper trunk'],
    ['ssnb', 'suprascapular', 'supraspinous'],
    ['anb', 'axillary nerve', 'quadrilateral space', 'circumflex'],
    ['phrenic', 'diaphragm', 'hemidiaphragm', 'hemidiaphragmatic', 'dyspnoea', 'breathless'],
    ['cape', 'supraclavicular nerves', 'cervical plexus'],
    ['bezold', 'bezold-jarisch', 'beach chair', 'beach-chair'],
    ['last', 'toxicity', 'local anaesthetic systemic toxicity', 'dose'],
  ],
});
