// Forearm and hand blocks page (median, ulnar, radial, wrist): wires the shared regional shell (shared/regional) to
// this page's chapters and data.
import { bootPage } from '../../../shared/regional/js/shell.js';
import { el, fill, table, callout } from '../../../shared/regional/js/ui.js';
import { BLOCKS } from './blocks.js?v=20261016';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

/** Chapter: test the block, find the gap, rescue the nerve. */
function renderTest(sec) {
  sec.append(el('h2', { id: 'fh-test-h', text: 'Testing a block and rescuing a gap' }));
  fill(sec.appendChild(el('div', {})), '<p>Test each nerve before the incision, not just "is the arm numb". The <strong>push, pull, pinch, pinch</strong> test checks the four nerves in seconds; the skin tests confirm sensation. If one nerve is missed, wait (onset can take 30 minutes), then rescue that nerve distally under ultrasound with a small volume, counting the total dose.</p>');
  sec.append(table({
    id: 'fh-tests', className: 'ul-cmp', caption: 'Testing the four terminal nerves',
    head: ['Nerve', 'Motor test', 'Skin test', 'Rescue'],
    rows: [
      [{ th: true, html: 'Radial' }, '<strong>Push</strong>: extend the elbow against resistance', 'Back of the first web space', '<a href="#ch-radial-elbow">Above the elbow</a>'],
      [{ th: true, html: 'Musculocutaneous' }, '<strong>Pull</strong>: flex the elbow against resistance', 'Lateral forearm', 'In coracobrachialis (<a href="../arm/#ch-axillary">axillary block</a>), or the lateral cutaneous nerve of the forearm at the elbow'],
      [{ th: true, html: 'Ulnar' }, '<strong>Pinch</strong> between thumb and little finger; finger abduction', 'Little finger', '<a href="#ch-ulnar-forearm">In the forearm</a>'],
      [{ th: true, html: 'Median' }, '<strong>Pinch</strong> between thumb and index finger', 'Palmar index finger', '<a href="#ch-median-forearm">In the forearm</a>'],
    ],
  }));
  sec.append(callout('warn', {
    title: 'Rescuing into a numb arm',
    body: '<p>The patient cannot feel a needle touching a partly blocked nerve. Use ultrasound, small volumes (3–5 ml), low injection pressure, and stop if the fluid does not spread around the nerve. Add the rescue dose to the plexus dose before you give it.</p>',
  }));
}

bootPage({
  title: 'Forearm and hand blocks',
  eyebrow: 'Regional anaesthesia · Upper-limb blocks',
  backLabel: 'See all upper-limb blocks and the operation chooser',
  backShort: 'Upper-limb blocks',
  backHref: '../',
  lead: 'Median and ulnar nerve blocks in the forearm, the radial nerve above the elbow, and the wrist block: for hand surgery without an arm tourniquet, and for rescuing a patchy brachial plexus block.',
  searchPlaceholder: 'Search, e.g. rescue, wrist, ulnar, push pull',
  tiles: [
    { title: 'Rescue a patchy block', desc: 'Test each nerve, then block the gap', href: '#ch-test' },
    { title: 'Block the hand at the wrist', desc: 'Three nerves, landmarks, fingers still move', href: '#ch-wrist' },
    { title: 'Find the median nerve', desc: 'Between the forearm flexors', href: '#median-forearm-step-identify' },
    { title: 'Catch a spared ulnar nerve', desc: 'Where it leaves the ulnar artery', href: '#ch-ulnar-forearm' },
  ],
  chapters: [
    { id: 'ch-test', title: 'Testing a block and rescuing a gap', short: 'Testing', desc: 'Push, pull, pinch, pinch; skin tests; which nerve to rescue where.', render: renderTest },
    { id: 'ch-median-forearm', title: 'Median nerve block in the forearm', short: 'Median', desc: 'Between the flexors, no artery beside it.', block: byId['median-forearm'] },
    { id: 'ch-ulnar-forearm', title: 'Ulnar nerve block in the forearm', short: 'Ulnar', desc: 'Under flexor carpi ulnaris, away from the artery.', block: byId['ulnar-forearm'] },
    { id: 'ch-radial-elbow', title: 'Radial nerve block at the elbow', short: 'Radial', desc: 'Between brachialis and brachioradialis, above its division.', block: byId['radial-elbow'] },
    { id: 'ch-wrist', title: 'Wrist block', short: 'Wrist', desc: 'Median, ulnar and superficial radial by landmarks.', block: byId.wrist },
  ],
  synonyms: [
    ['median', 'carpal tunnel', 'thenar'],
    ['ulnar', 'little finger', 'guyon'],
    ['radial', 'wrist drop', 'first web space', 'snuffbox'],
    ['rescue', 'patchy', 'failed block', 'incomplete block', 'top up', 'top-up'],
    ['wrist block', 'hand block'],
    ['last', 'toxicity', 'local anaesthetic systemic toxicity', 'dose'],
  ],
});
