// Forearm and hand blocks (median and ulnar in the forearm, radial at the elbow, wrist block): scenes for the shared
// scan teacher (schema: ../../../shared/regional/DATA.md, "Scene schema"). Millimetres; x across the screen from the
// left, y = depth from the skin; right arm. Original geometry, laid out from typical adult depths; nothing is traced
// from published images. The wrist block is a landmark technique: its scene is a labelled diagram, no ultrasound.
import { E, P, L } from '../../../shared/regional/js/scene.js';
import { armProbeInset } from '../../../shared/regional/js/figures/arm.js';

const BP = (...ids) => ids.map((i) => `brachial:${i}`);

export const SCENES = {
  // ------------------------------------------------------------------ median nerve, mid-forearm
  median: {
    id: 'ul-fh-median', title: 'Median nerve: between the forearm flexors', width: 42, depth: 30, focus: 12, skin: 0.8,
    view: 'Transverse view of the front of the right forearm, halfway between the elbow and the wrist, palm up. Lateral (radial, thumb side) on the left, medial (ulnar) on the right. The median nerve lies between flexor digitorum superficialis and flexor digitorum profundus, with no artery beside it.',
    orient: { left: 'Radial', right: 'Ulnar', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 3.2], [42, 3]], edge: 0.7 },
      { id: 'fds', kind: 'muscle', label: 'Flexor digitorum superficialis', short: 'FDS', desc: 'Flexor digitorum superficialis, superficial to the nerve.', stri: 0, echo: 0.15, dens: 0.45, edge: 0.85,
        bottom: [[0, 11.6], [12, 12], [20, 13.6], [28, 13.8], [42, 12.6]], at: [30, 8], lab: [30, 8] },
      { id: 'fdp', kind: 'muscle', label: 'Flexor digitorum profundus', short: 'FDP', desc: 'Flexor digitorum profundus, deep to the nerve.', stri: 0, echo: 0.14, dens: 0.45, edge: 0.6,
        bottom: [[0, 22.6], [14, 22], [28, 22.4], [42, 22.8]], at: [30, 18], lab: [30, 18.4] },
      { id: 'deep', kind: 'muscle', label: 'Pronator quadratus and deep muscles', nolabel: true, stri: 0, echo: 0.13, edge: 0, bottom: 34 },
    ],
    lines: [
      { id: 'iom', kind: 'fascia', label: 'Interosseous membrane', nolabel: true, amp: 0.7, w: 0.4, pts: [[12, 24.4], [21, 24], [30, 24.4]] },
    ],
    shapes: [
      { id: 'fpl', kind: 'muscle', label: 'Flexor pollicis longus', short: 'FPL', stri: 0, echo: 0.15, shape: P([0, 12], [8, 12], [12, 16], [10, 21.6], [0, 22.2]), at: [5, 17], lab: [5, 17] },
      { id: 'ra', kind: 'artery', label: 'Radial artery', short: 'RA', desc: 'On the radial side, superficial: well away from the median nerve.', shape: E(4.2, 6.2, 1.2, 1.1), at: [4.2, 6.2], lab: [4.2, 1.6] },
      { id: 'ua', kind: 'artery', label: 'Ulnar artery', short: 'UA', desc: 'With the ulnar nerve on the ulnar side, deep to flexor carpi ulnaris.', shape: E(34.2, 14.6, 1.2, 1.1), at: [34.2, 14.6], lab: [34, 26.6] },
      { id: 'un', kind: 'nerve', label: 'Ulnar nerve', nolabel: true, ids: BP('n-ulnar'), shape: E(37.6, 14.4, 1.5, 0.85) },
      { id: 'radius', kind: 'bone', label: 'Radius', short: 'Radius', shape: L(1.3, [0, 25.2], [4, 24], [8.5, 23.6], [12, 24.4]), at: [6, 23.8], lab: [6, 28] },
      { id: 'ulna', kind: 'bone', label: 'Ulna', short: 'Ulna', shape: L(1.3, [30, 24.6], [34, 23.6], [38.5, 23.6], [42, 24.4]), at: [36, 23.6], lab: [40, 28] },
      { id: 'mn', kind: 'nerve', label: 'Median nerve', short: 'MN', ids: BP('n-median'), desc: 'Between flexor digitorum superficialis and profundus, with no artery beside it: a flattened honeycomb oval.', shape: E(21.6, 13.6, 2.4, 1.2), at: [21.6, 13.6], lab: [19, 18.6] },
    ],
    target: { at: [21.6, 13.6], r: 2.6 },
    injections: [
      { id: 'mn', label: 'Around the median nerve', entry: [48, 4.4], tip: [24.4, 13.4],
        spread: { along: [[17.4, 14.2], [20, 14.8], [22.6, 15], [25.6, 14.6], [27.6, 14]], x0: 17.6, x1: 27.4, from: 22.6, thick: 2, up: 0.7, above: 4, shape: 0.9 } },
    ],
    steps: {
      scan: '<p>Probe transverse on the front of the forearm at the wrist crease: the median nerve sits just under the flexor retinaculum. <strong>Slide proximally</strong> to the middle of the forearm: the flexor tendons turn into muscle and the nerve stays in the middle, between the muscles.</p>',
      identify: '<p>The <strong>median nerve</strong> is a flattened honeycomb oval between <strong>flexor digitorum superficialis</strong> and <strong>flexor digitorum profundus</strong>, with no artery beside it. The radial artery is on the radial side and superficial; the ulnar artery and nerve are on the ulnar side.</p>',
      needle: '<p><strong>In-plane</strong> from either side (here from the ulnar side, superficial to the ulnar vessels), or out-of-plane. Stop beside the nerve, not in it.</p>',
      inject: '<p>Watch the fluid surround the nerve: a "doughnut" of local anaesthetic. Redirect once if it spreads only on one side.</p>',
    },
    probe: { view: 'front', at: 'mid-forearm', angle: 0, label: 'transverse on the front of the forearm, halfway between the elbow and the wrist.' },
    probeInset: armProbeInset,
  },

  // ------------------------------------------------------------------ ulnar nerve, forearm
  ulnar: {
    id: 'ul-fh-ulnar', title: 'Ulnar nerve: where it leaves the ulnar artery', width: 40, depth: 28, focus: 12, skin: 0.8,
    view: 'Transverse view of the front of the right forearm on the ulnar side, a little above the middle of the forearm. Lateral (radial) on the left, medial (ulnar) on the right. The ulnar nerve lies under flexor carpi ulnaris; scanning upwards from the wrist, it moves away from the ulnar artery.',
    orient: { left: 'Radial', right: 'Ulnar', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 3], [40, 3.4]], edge: 0.7 },
      { id: 'fds', kind: 'muscle', label: 'Flexor digitorum superficialis', short: 'FDS', desc: 'Flexor digitorum superficialis, on the radial side of the nerve.', stri: 0, echo: 0.15, dens: 0.45, edge: 0.8,
        bottom: [[0, 10.8], [20, 11.2], [26, 12.4], [40, 12.4]], at: [10, 7], lab: [10, 7] },
      { id: 'fdp', kind: 'muscle', label: 'Flexor digitorum profundus', short: 'FDP', desc: 'Flexor digitorum profundus, deep to the nerve.', stri: 0, echo: 0.14, dens: 0.45, edge: 0.6,
        bottom: [[0, 21], [20, 21.4], [40, 22]], at: [16, 17], lab: [16, 17] },
      { id: 'deep', kind: 'connective', label: 'Connective tissue', nolabel: true, echo: 0.2, edge: 0, bottom: 32 },
    ],
    shapes: [
      { id: 'fcu', kind: 'muscle', label: 'Flexor carpi ulnaris', short: 'FCU', desc: 'Flexor carpi ulnaris lies over the nerve on the ulnar side.', stri: 0, echo: 0.16, shape: P([26, 3.4], [40, 3.4], [40, 12.4], [33, 9.6], [27, 8.2]), at: [35, 6.4], lab: [35, 6.4] },
      { id: 'ua', kind: 'artery', label: 'Ulnar artery', short: 'UA', desc: 'Pulsatile, on the radial side of the nerve; further from it the higher you go.', shape: E(24, 12.6, 1.2, 1.1), at: [24, 12.6], lab: [20, 15.6] },
      { id: 'un', kind: 'nerve', label: 'Ulnar nerve', short: 'UN', ids: BP('n-ulnar'), desc: 'Honeycomb oval under flexor carpi ulnaris, moving away from the artery as you scan up.', shape: E(29.8, 12, 1.8, 1), at: [29.8, 12], lab: [32, 16.6] },
      { id: 'ulna', kind: 'bone', label: 'Ulna', short: 'Ulna', shape: L(1.3, [22, 23.6], [28, 22.6], [34, 22.4], [40, 23]), at: [31, 22.4], lab: [31, 26.4] },
    ],
    target: { at: [29.8, 12], r: 2.4 },
    injections: [
      { id: 'un', label: 'Around the ulnar nerve', entry: [46, 5.4], tip: [31.8, 11.4],
        spread: { along: [[26.8, 12.6], [29.8, 13.2], [33, 12.6], [34.6, 11.6]], x0: 27, x1: 34.6, from: 30.8, thick: 1.8, up: 0.7, above: 4, shape: 0.9 } },
    ],
    steps: {
      scan: '<p>Probe transverse on the ulnar side of the front of the wrist: the ulnar artery and nerve lie together under flexor carpi ulnaris. <strong>Slide proximally</strong>: the nerve moves away from the artery. Block it where they have separated, a third to halfway up the forearm.</p>',
      identify: '<p><strong>Flexor carpi ulnaris</strong> on the ulnar side; under it the honeycomb <strong>ulnar nerve</strong>, with the pulsatile <strong>ulnar artery</strong> on its radial side. Flexor digitorum superficialis and profundus; the ulna deep.</p>',
      needle: '<p><strong>In-plane from the ulnar side</strong>, away from the artery, to beside the nerve.</p>',
      inject: '<p>Watch the fluid surround the nerve. Aspirate first: the artery is close.</p>',
    },
    probe: { view: 'front', at: 'forearm-ulnar', angle: 0, label: 'transverse on the ulnar side of the front of the forearm.' },
    probeInset: armProbeInset,
  },

  // ------------------------------------------------------------------ radial nerve, above the elbow
  radial: {
    id: 'ul-fh-radial', title: 'Radial nerve: between brachialis and brachioradialis', width: 42, depth: 32, focus: 14, skin: 0.9,
    view: 'Transverse view of the front of the right arm on the lateral side, a few centimetres above the elbow crease. Lateral on the left, medial on the right. The radial nerve lies in the groove between brachioradialis (lateral) and brachialis (medial), on the humerus.',
    orient: { left: 'Lateral', right: 'Medial', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 4], [42, 4.2]], edge: 0.7 },
      { id: 'deep', kind: 'connective', label: 'Connective tissue', nolabel: true, echo: 0.2, edge: 0, bottom: 36 },
    ],
    shapes: [
      { id: 'br', kind: 'muscle', label: 'Brachioradialis', short: 'BR', desc: 'Brachioradialis, laterally: the nerve lies on its medial side.', stri: 10, echo: 0.15, dens: 0.4,
        shape: P([0, 4.2], [14, 4.2], [18, 8], [19, 13.6], [16, 18], [10, 21], [0, 22]), at: [8, 12], lab: [8, 12] },
      { id: 'bra', kind: 'muscle', label: 'Brachialis', short: 'Bra', desc: 'Brachialis, medially, on the front of the humerus.', stri: -8, echo: 0.14, dens: 0.45,
        shape: P([20, 4.4], [42, 4.4], [42, 22.6], [32, 23.4], [24, 21.6], [21, 16.6], [20.4, 10]), at: [32, 12], lab: [32, 12] },
      { id: 'bic', kind: 'muscle', label: 'Biceps', nolabel: true, stri: 0, echo: 0.15, shape: P([30, 4.4], [42, 4.4], [42, 9.6], [34, 9]) },
      { id: 'groove', kind: 'connective', label: 'Intermuscular fat', nolabel: true, echo: 0.32, shape: P([14.6, 4.4], [20, 4.4], [20.6, 10], [21, 16.6], [19, 19.6], [16, 18], [19, 13.6], [18, 8]) },
      { id: 'hum', kind: 'bone', label: 'Humerus', short: 'Hum', desc: 'The lateral supracondylar ridge and the front of the humerus, deep.', shape: L(1.4, [8, 26], [14, 23.8], [20, 22.8], [28, 23.6], [36, 24.6], [42, 25]), at: [24, 23.2], lab: [30, 28] },
      { id: 'rca', kind: 'artery', label: 'Radial collateral artery', nolabel: true, shape: E(21.4, 17.8, 0.6, 0.55) },
      { id: 'rn', kind: 'nerve', label: 'Radial nerve', short: 'RN', ids: BP('n-radial'), desc: 'In the groove between brachioradialis and brachialis, on the humerus; it divides into superficial and deep branches near the elbow.', shape: E(19.4, 15.4, 2.2, 1.3, 20), at: [19.4, 15.4], lab: [14, 25.6] },
    ],
    target: { at: [19.4, 15.4], r: 2.8 },
    injections: [
      { id: 'rn', label: 'Around the radial nerve', entry: [-6, 3.4], tip: [17.2, 14.8],
        spread: { along: [[14, 16], [17, 16.8], [20, 17.2], [23, 16.8], [24.6, 16]], x0: 14.4, x1: 24.4, from: 19.4, thick: 2.2, up: 0.7, above: 5, shape: 0.9 } },
    ],
    steps: {
      scan: '<p>Probe transverse on the front of the arm on the lateral side, 3–4 cm above the elbow crease. Find the <strong>humerus</strong>; the radial nerve lies on it in the groove between two muscles. Scan up and down: above, it curves behind the humerus in the spiral groove; below, it divides into its superficial and deep branches.</p>',
      identify: '<p><strong>Brachioradialis</strong> laterally, <strong>brachialis</strong> medially, the bright <strong>humerus</strong> deep. The <strong>radial nerve</strong> is the honeycomb oval in the fat between them. A small radial collateral artery may lie beside it: colour Doppler.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong>, through the edge of brachioradialis, to beside the nerve.</p>',
      inject: '<p>Watch the fluid surround the nerve in the groove.</p>',
    },
    probe: { view: 'front', at: 'lateral-elbow', angle: 0, label: 'transverse on the lateral front of the arm, 3–4 cm above the elbow crease.' },
    probeInset: armProbeInset,
  },

  // ------------------------------------------------------------------ wrist block (landmark; diagram only)
  wrist: {
    id: 'ul-fh-wrist', image: 'diagram', title: 'Wrist block: three nerves at the proximal wrist crease', width: 56, depth: 30, focus: 12, skin: 1,
    stepTitles: ['Landmarks', 'Identify', 'Needle', 'Inject'],
    view: 'Cross-section of the right wrist at the proximal skin crease, seen from the hand, palm up. Radial (thumb side) on the left, ulnar on the right. The median nerve lies deep to palmaris longus, between it and flexor carpi radialis; the ulnar nerve lies under flexor carpi ulnaris beside the ulnar artery; the superficial radial nerve branches lie in the fat over the radial side.',
    orient: { left: 'Radial', right: 'Ulnar', marker: 'left' },
    injectionLabel: 'Which nerve',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 2.6], [56, 2.6]], edge: 0.6 },
      { id: 'deep', kind: 'connective', label: 'Connective tissue', nolabel: true, echo: 0.22, edge: 0, bottom: 32 },
    ],
    lines: [
      { id: 'fasc', kind: 'fascia', label: 'Deep fascia', nolabel: true, amp: 0.8, w: 0.4, pts: [[0, 2.8], [28, 2.8], [56, 2.8]] },
    ],
    shapes: [
      { id: 'tendons', kind: 'tendon', label: 'Finger flexor tendons', short: 'Flexors', echo: 0.6, shape: [E(24, 11, 2.4, 1.6), E(29, 10.6, 2.4, 1.6), E(34, 11.2, 2.4, 1.6), E(26.6, 14.6, 2.6, 1.6), E(31.6, 14.6, 2.6, 1.6)], at: [29, 12.6], lab: [29, 19.4] },
      { id: 'fpl', kind: 'tendon', label: 'Flexor pollicis longus', nolabel: true, echo: 0.6, shape: E(18.6, 12.6, 2, 1.5) },
      { id: 'fcr', kind: 'tendon', label: 'Flexor carpi radialis tendon', short: 'FCR', desc: 'The median nerve lies just to the ulnar side of this tendon.', echo: 0.62, shape: E(16.4, 6.2, 2, 1.6), at: [16.4, 6.2], lab: [12, 8.8] },
      { id: 'pl', kind: 'tendon', label: 'Palmaris longus tendon', short: 'PL', desc: 'Superficial, in the middle of the wrist; absent in some people.', echo: 0.62, shape: E(25.4, 4.2, 2, 0.9), at: [25.4, 4.2], lab: [27, 1.4] },
      { id: 'fcu', kind: 'tendon', label: 'Flexor carpi ulnaris tendon', short: 'FCU', desc: 'Inject from the ulnar side, under this tendon, for the ulnar nerve.', echo: 0.62, shape: E(45.6, 6.6, 2.6, 1.8), at: [45.6, 6.6], lab: [50, 2.2] },
      { id: 'radius', kind: 'bone', label: 'Radius', short: 'Radius', shape: P([2, 20], [10, 18.6], [20, 19.4], [24, 22], [20, 27], [6, 27.4], [2, 24]), at: [12, 22.6], lab: [12, 22.6] },
      { id: 'ulna', kind: 'bone', label: 'Ulna', short: 'Ulna', shape: P([40, 20.4], [48, 19.6], [52, 22.4], [48, 26], [41, 25.6]), at: [46, 22.6], lab: [46, 22.6] },
      { id: 'ra', kind: 'artery', label: 'Radial artery', short: 'RA', desc: 'Pulsatile, on the radial side: stay superficial to it for the radial nerve fan.', shape: E(9.6, 6.6, 1.3, 1.2), at: [9.6, 6.6], lab: [8, 11.6] },
      { id: 'ua', kind: 'artery', label: 'Ulnar artery', short: 'UA', desc: 'On the radial side of the ulnar nerve, under flexor carpi ulnaris.', shape: E(40, 8.6, 1.2, 1.1), at: [40, 8.6], lab: [37, 6.4] },
      { id: 'srn', kind: 'nerve', label: 'Superficial radial nerve branches', short: 'SRN', ids: BP('n-radial'), desc: 'Small branches in the fat over the radial side of the wrist: a subcutaneous fan, not a single nerve.', shape: [E(3.4, 2.2, 0.9, 0.5), E(6.6, 1.9, 0.8, 0.45)], at: [5, 2], lab: [4, 6.8] },
      { id: 'mn', kind: 'nerve', label: 'Median nerve', short: 'MN', ids: BP('n-median'), desc: 'Deep to palmaris longus, between it and flexor carpi radialis, under the deep fascia.', shape: E(21.6, 6.6, 2.4, 1.2), at: [21.6, 6.6], lab: [21, 9.8] },
      { id: 'un', kind: 'nerve', label: 'Ulnar nerve', short: 'UN', ids: BP('n-ulnar'), desc: 'Under flexor carpi ulnaris, on the ulnar side of the ulnar artery.', shape: E(43.4, 9.4, 1.8, 1), at: [43.4, 9.4], lab: [47, 12.8] },
    ],
    target: { at: [21.6, 6.6], r: 2.6 },
    injections: [
      { id: 'median', label: 'Median nerve', entry: [21.6, -4], tip: [21.6, 5.2], target: { at: [21.6, 6.6], r: 2.6 },
        spread: { along: [[18, 6], [21.6, 6.8], [25, 6.2]], x0: 18, x1: 25, from: 21.6, thick: 1.8, up: 0.5, above: 3, shape: 0.9 },
        steps: {
          needle: '<p>Between <strong>palmaris longus and flexor carpi radialis</strong> at the proximal wrist crease, perpendicular to the skin, just through the deep fascia (a slight give), about 0.5–1 cm deep. If the patient feels a shock into the fingers, withdraw 1–2 mm.</p>',
          inject: '<p><strong>3–5 ml</strong>, with no resistance. Then 1 ml subcutaneously as you withdraw, for the palmar cutaneous branch.</p>',
        } },
      { id: 'ulnar', label: 'Ulnar nerve', entry: [62, 9.4], tip: [45.6, 9.4], target: { at: [43.4, 9.4], r: 2.4 },
        spread: { along: [[40.6, 10.4], [43.4, 10.6], [47, 10.2]], x0: 40.8, x1: 47, from: 43.9, thick: 1.6, up: 0.5, above: 3, shape: 0.9 },
        steps: {
          needle: '<p>From the <strong>ulnar side</strong>, horizontally under <strong>flexor carpi ulnaris</strong>, 1–1.5 cm deep, aiming towards the radial side: this keeps the needle away from the ulnar artery.</p>',
          inject: '<p><strong>3–5 ml</strong> after aspiration. Then a subcutaneous line around the ulnar side of the wrist for the dorsal branch.</p>',
        } },
      { id: 'radial', label: 'Superficial radial nerve', entry: [-6, 1.2], tip: [8, 1.6], target: { at: [5, 2], r: 3 },
        spread: { along: [[0, 2.2], [4, 2.2], [8, 2.2], [12, 2.2]], x0: 0, x1: 12, from: 6, thick: 1.2, up: 0.8, above: 1.5, shape: 0.9 },
        steps: {
          needle: '<p>A <strong>subcutaneous fan</strong> over the radial side of the wrist, from the radial artery round to the back of the wrist, superficial to the artery and the tendons.</p>',
          inject: '<p><strong>5 ml</strong> as a subcutaneous ring, aspirating as you go.</p>',
        } },
    ],
    steps: {
      scan: '<p>Palm up, wrist slightly extended over a rolled towel. Mark the <strong>proximal wrist crease</strong>, the <strong>palmaris longus</strong> tendon (ask the patient to oppose thumb and little finger and flex the wrist), <strong>flexor carpi radialis</strong>, <strong>flexor carpi ulnaris</strong> and the <strong>radial and ulnar pulses</strong>.</p>',
      identify: '<p><strong>Median nerve</strong>: deep to palmaris longus, between it and flexor carpi radialis. <strong>Ulnar nerve</strong>: under flexor carpi ulnaris, on the ulnar side of the ulnar artery. <strong>Superficial radial nerve</strong>: small branches in the subcutaneous fat over the radial side of the wrist.</p>',
      needle: '<p>Three injections, each with aspiration. Choose a nerve above to see its needle.</p>',
      inject: '<p>3–5 ml for the median, 3–5 ml for the ulnar, 5 ml for the superficial radial fan. Stop and withdraw if the patient feels a shock or the injection is stiff.</p>',
    },
    probe: { view: 'front', key: 'Needle entry', points: [{ at: 'wrist-median', label: 'Median' }, { at: 'wrist-ulnar', label: 'Ulnar' }, { at: 'wrist-radial', label: 'Superficial radial' }], label: 'the proximal wrist crease: median, ulnar and superficial radial.' },
    probeInset: armProbeInset,
  },
};
