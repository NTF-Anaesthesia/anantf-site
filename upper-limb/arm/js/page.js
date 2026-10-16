// Arm blocks page (supraclavicular, infraclavicular, costoclavicular, RAPTIR, axillary): wires the shared regional shell
// (shared/regional) to this page's chapters and data.
import { bootPage } from '../../../shared/regional/js/shell.js';
import { el, fill, table, callout } from '../../../shared/regional/js/ui.js';
import { BLOCKS } from './blocks.js?v=20261016';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

/** Chapter: which brachial plexus block below the shoulder (one table, the mnemonic and the shoulder caveat). */
function renderChoose(sec) {
  sec.append(el('h2', { id: 'ar-choose-h', text: 'Choosing a brachial plexus block below the shoulder' }));
  fill(sec.appendChild(el('div', { class: 'tb-prose' })), `<p><strong>Randy Travis Drinks Cold Beer</strong>: Roots, Trunks, Divisions, Cords, Branches (5 – 3 – 6 – 3 – 5). Interscalene: roots. Supraclavicular: trunks ± divisions. Infraclavicular: cords. Axillary: branches. The further down the plexus you inject, the further you are from the phrenic nerve and the pleura, and the more separate injections you need.</p>`);
  sec.append(table({
    id: 'ar-cmp', className: 'ul-cmp', caption: 'The five blocks on this page, from proximal to distal',
    head: ['Block', 'Level', 'Dose', 'Needle', 'Use it for'],
    rows: [
      [{ th: true, html: '<a href="#ch-supraclavicular">Supraclavicular</a>' }, 'Trunks and divisions', '15–20 ml of 0.5% ropivacaine', '80 mm, lateral to medial', 'Humerus and below; less ideal for ulnar-sided or shoulder surgery'],
      [{ th: true, html: '<a href="#ch-infraclavicular">Infraclavicular</a>' }, 'Cords', '25 ml of 0.5% ropivacaine', '100 mm, cephalad to caudad', 'Mid-humerus / elbow and below; catheters'],
      [{ th: true, html: '<a href="#ch-costoclavicular">Costoclavicular</a>' }, 'Cords, clustered', '20 ml of 0.5% ropivacaine', '50–80 mm, lateral to medial', 'Elbow, forearm and hand; faster onset; catheters'],
      [{ th: true, html: '<a href="#ch-raptir">RAPTIR</a>' }, 'Cords (retroclavicular)', '25 ml of 0.5% ropivacaine', '80–100 mm, behind the clavicle', 'As infraclavicular, when the steep needle is hard to see'],
      [{ th: true, html: '<a href="#ch-axillary">Axillary</a>' }, 'Terminal branches', '25 ml of 0.5% ropivacaine', '50 mm, anterior to posterior', 'At or below the elbow; poor respiratory reserve'],
    ],
  }));
  sec.append(callout('warn', {
    title: 'None of these blocks is for the shoulder',
    body: '<p>The suprascapular nerve supplies most of the shoulder joint and leaves the superior trunk proximal to all of these levels (it is variable even with a supraclavicular block). For the shoulder, see the <a href="../shoulder/">shoulder page</a>: interscalene, superior trunk, or suprascapular plus axillary nerve blocks.</p>',
  }));
  sec.append(callout('key', {
    title: 'Every brachial plexus block misses the intercostobrachial nerve',
    body: '<p>It is T2, not plexus. For an upper-arm tourniquet or a medial arm incision, add <a href="#axillary-icbn">subcutaneous infiltration across the axillary crease</a>.</p>',
  }));
}

bootPage({
  title: 'Arm blocks',
  eyebrow: 'Regional anaesthesia · Upper-limb blocks',
  backLabel: 'See all upper-limb blocks and the operation chooser',
  backShort: 'Upper-limb blocks',
  backHref: '../',
  lead: 'Supraclavicular, infraclavicular, costoclavicular, RAPTIR and axillary blocks: the brachial plexus from the first rib to the axilla, for surgery of the arm, elbow, forearm and hand.',
  searchPlaceholder: 'Search, e.g. corner pocket, axillary, musculocutaneous',
  tiles: [
    { title: 'Block for hand or forearm surgery', desc: 'Axillary: four nerves around the artery', href: '#ch-axillary' },
    { title: 'Find the corner pocket', desc: 'Supraclavicular: the inferior trunk on the first rib', href: '#supraclavicular-step-identify' },
    { title: 'Put in a catheter', desc: 'Infraclavicular or costoclavicular: muscular tunnel', href: '#ch-costoclavicular' },
    { title: 'Practise the infraclavicular needle', desc: 'Behind the artery for U-shaped spread', href: '#infraclavicular-step-needle' },
    { title: 'Cover an upper-arm tourniquet', desc: 'Intercostobrachial infiltration', href: '#axillary-icbn' },
    { title: 'Compare the blocks', desc: 'Level, dose, needle and use', href: '#ch-choose' },
  ],
  chapters: [
    { id: 'ch-choose', title: 'Choosing a brachial plexus block below the shoulder', short: 'Choosing', desc: 'Roots, trunks, divisions, cords and branches; the five blocks side by side.', render: renderChoose },
    { id: 'ch-supraclavicular', title: 'Supraclavicular block', short: 'Supraclavicular', desc: 'Trunks on the first rib: the "spinal of the arm".', block: byId.supraclavicular },
    { id: 'ch-infraclavicular', title: 'Infraclavicular block (coracoid / parasagittal)', short: 'Infraclavicular', desc: 'Cords around the axillary artery. No phrenic block; good for catheters.', block: byId.infraclavicular },
    { id: 'ch-costoclavicular', title: 'Costoclavicular block', short: 'Costoclavicular', desc: 'The cords still clustered: one injection, faster onset.', block: byId.costoclavicular },
    { id: 'ch-raptir', title: 'RAPTIR (retroclavicular) block', short: 'RAPTIR', desc: 'The infraclavicular view with the needle from behind the clavicle.', block: byId.raptir },
    { id: 'ch-axillary', title: 'Axillary block', short: 'Axillary', desc: 'Median, ulnar, radial and musculocutaneous nerves; the intercostobrachial nerve.', block: byId.axillary },
  ],
  synonyms: [
    ['scb', 'supraclavicular', 'corner pocket', 'spinal of the arm'],
    ['icb', 'infraclavicular', 'coracoid', 'lateral sagittal'],
    ['ccb', 'costoclavicular'],
    ['raptir', 'retroclavicular'],
    ['axb', 'axillary', 'axillary brachial plexus'],
    ['mcn', 'musculocutaneous'],
    ['icbn', 'intercostobrachial', 'tourniquet'],
    ['last', 'toxicity', 'local anaesthetic systemic toxicity', 'dose'],
  ],
});
