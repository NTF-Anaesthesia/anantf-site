// Chest wall: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../shared/DATA.md ("Scene schema"). Geometry is original, laid out from typical adult depths;
// nothing is traced from published images.
//
// Ribs and cartilages are drawn as rounded shapes (bright upper surface and a full acoustic shadow in the
// ultrasound view). The pleura is a full-width line (it runs under the ribs, as in life; the rib shadows hide it
// there). Pleural sliding: the engine moves its shimmer along the whole width of a `sliding` line, so each scene
// adds an unlabelled helper line (`glide`) that follows the pleura in the intercostal spaces and the bright top of
// each rib elsewhere. The shimmer then never appears inside a rib shadow. See the report for the engine change
// that would make this unnecessary.
import { E, P, L, spline } from '../../shared/js/scene.js';

// ---------------------------------------------------------------- helpers
const r1 = (v) => Math.round(v * 100) / 100;
/** Smooth curve through key points, sampled densely (returned as an x-sorted polyline, used with smooth:false). */
const curve = (keys) => spline(keys, false, 6).map(([x, y]) => [r1(x), r1(y)]);
/** y of a sampled curve at x. */
const at = (pts, x) => {
  for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) { const a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * ((x - a[0]) / ((b[0] - a[0]) || 1)); }
  return pts[pts.length - 1][1];
};
/** Upper surface of an ellipse rib {cx, cy, rx, ry} at x (null outside). */
const ribTop = (r, x) => (Math.abs(x - r.cx) >= r.rx ? null : r.cy - r.ry * Math.sqrt(1 - ((x - r.cx) / r.rx) ** 2));
/**
 * Helper line for pleural sliding: follows the pleura in the intercostal spaces and drops below the bottom of the
 * image under each rib (or bone), so the shimmer is never drawn inside an acoustic shadow. Below the pleura it is
 * hidden by the lung in both views.
 * bones = [{cx, rx}] (ribs) or {x0, x1} (flat bone).
 */
function glide(pleura, bones, W, H) {
  const pts = [];
  for (let x = 0; x <= W + 1e-6; x += 0.5) {
    const under = bones.some((b) => (b.rx != null ? Math.abs(x - b.cx) < b.rx * 0.9 : x >= b.x0 && x <= b.x1));
    pts.push([r1(x), under ? H + 4 : r1(at(pleura, x))]);
  }
  return { id: 'glide', kind: 'fascia', amp: 0, w: 0.05, smooth: false, sliding: true, pts };
}
const BONE_FILL = '#ece2cc';
/**
 * A rib in cross-section: a bone-coloured body (no echo of its own: it sits in the shadow) and a cortical arc over
 * its upper surface (kind bone: bright line with a full acoustic shadow), so the ultrasound shows only the curved
 * front surface of the rib, as in life.
 */
function rib(r, { id, label, short, at: a, lab }) {
  const arc = [];
  for (let k = 0; k <= 24; k++) { const t = Math.PI * (1 + 0.1 + 0.8 * k / 24); arc.push([r1(r.cx + 0.97 * r.rx * Math.cos(t)), r1(r.cy + 0.98 * r.ry * Math.sin(t))]); }
  return [
    { id: `${id}-body`, kind: 'connective', color: BONE_FILL, echo: 0.05, shape: E(r.cx, r.cy, r.rx * 0.97, r.ry * 0.98) },
    { id, kind: 'bone', label, short, shape: L(1.0, ...arc), at: a, lab },
  ];
}

// ================================================================ serratus anterior plane
// Right mid-axillary line at the 5th rib, probe along the line of the axilla (WFSA ATOTW 427: from the
// deltopectoral groove, move inferiorly and posteriorly with increasing coronal orientation to the 5th rib in the
// mid-axillary line). Screen left = anterosuperior (rib 4), screen right = posteroinferior.
const SAP_R4 = { cx: 3, cy: 18.4, rx: 6.5, ry: 3.4 };
const SAP_R5 = { cx: 31, cy: 20, rx: 6.5, ry: 3.4 };
const SAP_PL = curve([[0, 23.4], [5, 23.6], [10, 23.1], [17, 22.7], [24, 23.2], [31, 24.3], [38, 24.0], [45, 23.5]]);
const SAP_LD = [[0, 5.2], [8, 5.7], [20, 7.4], [32, 9.4], [45, 11.6]];
const SAP_SA = [[0, 14.8], [3, 14.8], [8, 15.6], [16, 16.9], [24, 16.9], [31, 16.4], [37, 16.8], [45, 17.3]];

const sapSteps = {
  scan: '<p>Start below the clavicle (as for PECS), then slide the probe <strong>inferiorly and posteriorly</strong>, turning it towards the coronal plane, until the <strong>5th rib in the mid-axillary line</strong> is in the middle of the screen. Count the ribs on the way down.</p>',
  identify: '<p>From the skin down: subcutaneous fat, <strong>latissimus dorsi</strong> (thick posteriorly, thinning anteriorly), <strong>serratus anterior</strong>, then the <strong>ribs</strong> (round bright tops with black shadows) with the intercostal muscles between them and the <strong>pleura</strong> sliding below. Use colour Doppler to find the <strong>thoracodorsal artery</strong> in the plane between latissimus dorsi and serratus.</p>',
  needle: '<p>Choose superficial or deep above. In-plane, from <strong>anterosuperior to posteroinferior</strong> (screen left to right here).</p>',
  inject: '<p>Choose superficial or deep above to see the spread.</p>',
};

const sap = {
  id: 'cw-sap', title: 'Serratus anterior plane: 5th rib, mid-axillary line', width: 45, depth: 36, focus: 18, skin: 1.2,
  view: 'Right mid-axillary line over the 5th rib, probe lying along the line of the axilla (between sagittal and coronal). Anterosuperior on the left. Two ribs in cross-section: the 4th at the left edge, the 5th under the target.',
  orient: { left: 'Anterosuperior', right: 'Posteroinferior', marker: 'left' },
  injectionLabel: 'Serratus plane',
  layers: [
    { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 5.2], [45, 6.0]], labelX: 12 },
    { id: 'ld', kind: 'muscle', label: 'Latissimus dorsi', short: 'LD', stri: 4, bottom: SAP_LD, at: [38, 9.2], lab: [38, 8.8] },
    { id: 'sa', kind: 'muscle', label: 'Serratus anterior', short: 'SA', stri: -8, echo: 0.13, color: '#c98a79', bottom: SAP_SA, labelX: 15 },
    { id: 'icm', kind: 'muscle', label: 'Intercostal muscles', short: 'ICM', stri: 28, echo: 0.12, dens: 0.35, color: '#bf7f70', smooth: false, bottom: SAP_PL, at: [17, 20], lab: [17, 20] },
    { id: 'lung', kind: 'lung', label: 'Lung', nolabel: true, edge: 0, bottom: 80 },
  ],
  lines: [
    glide(SAP_PL, [SAP_R4, SAP_R5], 45, 36),
    { id: 'pleura', kind: 'pleura', label: 'Pleura', short: 'Pl', smooth: false, pts: SAP_PL, at: [19, at(SAP_PL, 19)], lab: [16, 30.5] },
  ],
  shapes: [
    { id: 'tda', kind: 'artery', label: 'Thoracodorsal artery', short: 'TDA', shape: E(38.5, 10.55, 1.05, 0.85), lab: [36.5, 4] },
    ...rib(SAP_R4, { id: 'r4', label: '4th rib', short: 'R4', at: [3, 15.2], lab: [6, 27.5] }),
    ...rib(SAP_R5, { id: 'r5', label: '5th rib', short: 'R5', at: [31, 16.8], lab: [31, 27.5] }),
  ],
  injections: [
    {
      id: 'sup', label: 'Superficial (LD–SA)', entry: [-15, -2], tip: [28, at(curve(SAP_LD), 28) + 0.1],
      target: { at: [28, at(curve(SAP_LD), 28) + 0.1], r: 2 },
      spread: { along: 'ld', x0: 9, x1: 43, thick: 3.6, up: 0.45, above: 5 },
      steps: {
        needle: '<p><strong>Superficial:</strong> in-plane from anterosuperior, through latissimus dorsi. Stop with the tip in the plane <strong>between latissimus dorsi and serratus anterior</strong>, over the 5th rib. Keep clear of the thoracodorsal artery.</p>',
        inject: '<p>Hydrolocate with 1–2 ml, then inject in 5 ml aliquots after negative aspiration. The fluid <strong>separates latissimus dorsi from serratus anterior</strong> and spreads along the plane.</p>',
      },
    },
    {
      id: 'deep', label: 'Deep (SA–rib)', entry: [-11, -2], tip: [29.5, 16.35],
      target: { at: [29.5, 16.4], r: 2 },
      spread: { along: 'sa', x0: 17, x1: 41, thick: 3.2, up: 1, above: 6 },
      steps: {
        needle: '<p><strong>Deep:</strong> aim at the <strong>top of the 5th rib</strong>, which acts as a backstop between the needle and the pleura. Pass through serratus anterior until the tip touches the rib.</p>',
        inject: '<p>The fluid <strong>lifts serratus anterior off the rib</strong> and the intercostal muscles. The pleura is not moved. Inject in 5 ml aliquots after negative aspiration.</p>',
      },
    },
  ],
  steps: sapSteps,
  probe: { view: 'front', x: 38, y: 112, angle: 78, label: 'right mid-axillary line at the 5th rib, lying along the line of the axilla (arm abducted).' },
};

// ================================================================ PECS (interpectoral and pectoserratus)
// Right anterior chest, oblique (probe medial end towards the coracoid), at the 3rd and 4th ribs near the anterior
// axillary line. Screen left = superomedial, screen right = inferolateral. WFSA ATOTW 346.
const PE_R3 = { cx: 8, cy: 28.6, rx: 6.4, ry: 3.3 };
const PE_R4 = { cx: 34, cy: 27.6, rx: 6.4, ry: 3.3 };
const PE_PL = curve([[0, 32.4], [8, 32.6], [14, 31.6], [21, 31.2], [28, 31.6], [34, 31.6], [40, 31.0], [45, 30.7]]);
const PE_PMAJ = [[0, 14.8], [15, 14.4], [30, 13.6], [45, 12.6]];
const PE_PMIN = [[0, 21.0], [12, 20.6], [24, 19.6], [34, 17.6], [41, 14.6], [45, 13.0]];
const PE_SA = [[0, 25.0], [8, 25.0], [14, 26.0], [21, 26.6], [28, 25.8], [34, 24.0], [40, 25.0], [45, 25.6]];

function pecsScene(twoStage) {
  const pmajC = curve(PE_PMAJ);
  // Stage 2 viewer: the interpectoral plane is already open with the stage 1 local anaesthetic (a static lens).
  const lens = (x) => { const c = 21, h = x < c ? 15 : 17; const u = (x - c) / h; return Math.abs(u) >= 1 ? 0 : 3.4 * Math.pow(1 - u * u, 0.9); };
  const xs = []; for (let x = 0; x <= 45; x += 1.5) xs.push(x);
  const pmajBottom = twoStage ? xs.map((x) => [x, r1(at(pmajC, x) - 0.5 * lens(x))]) : PE_PMAJ;
  const poolBottom = xs.map((x) => [x, r1(at(pmajC, x) + 0.5 * lens(x))]);
  const layers = [
    { id: 'sc', kind: 'fat', label: 'Fat and breast tissue', short: 'Fat', bottom: [[0, 6.2], [45, 5.4]], labelX: 34 },
    { id: 'pmaj', kind: 'muscle', label: 'Pectoralis major', short: 'PMaj', stri: 8, echo: 0.15, bottom: pmajBottom, labelX: 34 },
  ];
  if (twoStage) layers.push({ id: 'pool', kind: 'fluid', label: 'Stage 1 local anaesthetic', short: 'LA 1', color: '#cfe6f2', edge: 0.2, bottom: poolBottom, at: [21, at(pmajC, 21)], lab: [24, 9.8] });
  layers.push(
    { id: 'pmin', kind: 'muscle', label: 'Pectoralis minor', short: 'PMin', stri: 14, echo: 0.12, color: '#c98a79', bottom: PE_PMIN, labelX: 18 },
    { id: 'sa', kind: 'muscle', label: 'Serratus anterior', short: 'SA', stri: -6, echo: 0.13, color: '#d9a595', bottom: PE_SA, at: [36, 21.2], lab: [38.5, 21.4] },
    { id: 'icm', kind: 'muscle', label: 'Intercostal muscles', short: 'ICM', stri: 28, echo: 0.12, dens: 0.35, color: '#bf7f70', smooth: false, bottom: PE_PL, nolabel: true },
    { id: 'lung', kind: 'lung', label: 'Lung', nolabel: true, edge: 0, bottom: 80 },
  );
  const ipTip = [23, r1(at(pmajC, 23) + 0.1)];
  const psTip = [30.5, r1(at(curve(PE_PMIN), 30.5) + 0.1)];
  const ip = {
    id: 'ip', label: 'Interpectoral (PECS I)', entry: [-13, -2], tip: ipTip, target: { at: ipTip, r: 2 },
    spread: { along: 'pmaj', x0: 6, x1: 39, thick: 3.4, up: 0.5, above: 6 },
    steps: {
      needle: '<p><strong>Interpectoral (PECS I):</strong> in-plane from superomedial. Pass through pectoralis major and stop in the plane <strong>between pectoralis major and pectoralis minor</strong>, away from the pectoral branch of the thoracoacromial artery.</p>',
      inject: '<p>Hydrolocate with saline or local anaesthetic, aspirate, then inject about <strong>10 ml</strong>: the plane opens between the two pectoral muscles. For PECS II, this is the first stage.</p>',
    },
  };
  const ps = {
    id: 'ps', label: twoStage ? 'Stage 2: pectoserratus' : 'Pectoserratus (PECS II, stage 2)', entry: [-13, -2], tip: psTip, target: { at: psTip, r: 2 },
    spread: { along: 'pmin', x0: 16, x1: 40, thick: 3.8, up: 0.4, above: 6 },
    steps: {
      needle: `<p><strong>Pectoserratus${twoStage ? '' : ' (PECS II, stage 2)'}:</strong> through the same skin puncture, advance through pectoralis minor towards the <strong>top of the 4th rib</strong> (the rib lies beyond the tip, so the needle points at bone, not the intercostal space).</p>`,
      inject: '<p>Inject <strong>15–20 ml</strong> in the plane <strong>between pectoralis minor and serratus anterior</strong>. It spreads laterally towards the axilla, where the lateral cutaneous branches and the intercostobrachial nerve run.</p>',
    },
  };
  return {
    id: twoStage ? 'cw-pecs2' : 'cw-pecs',
    title: twoStage ? 'PECS II, stage 2: the interpectoral plane is already open' : 'PECS: oblique view at the 3rd and 4th ribs',
    width: 45, depth: 40, focus: 20, skin: 1.2,
    view: twoStage
      ? 'Same view as above, after stage 1: about 10 ml already lies between pectoralis major and minor. The needle now goes one plane deeper.'
      : 'Right anterior chest wall, probe oblique with its medial end towards the coracoid, near the anterior axillary line. Superomedial on the left. Ribs 3 and 4 in cross-section.',
    orient: { left: 'Superomedial', right: 'Inferolateral', marker: 'left' },
    injectionLabel: twoStage ? 'PECS II' : 'Injection plane',
    layers,
    lines: [
      glide(PE_PL, [PE_R3, PE_R4], 45, 40),
      { id: 'pleura', kind: 'pleura', label: 'Pleura', short: 'Pl', smooth: false, pts: PE_PL, at: [21, at(PE_PL, 21)], lab: [19, 36.6] },
    ],
    shapes: [
      { id: 'taa', kind: 'artery', label: 'Thoracoacromial artery, pectoral branch', short: 'TAA', shape: E(12.5, r1(at(pmajC, 12.5) + (twoStage ? 0.9 : 0)), 1.0, 0.85), lab: [10, twoStage ? 30 : 9.4] },
      { id: 'lpn', kind: 'nerve', label: 'Lateral pectoral nerve', short: 'LPN', shape: E(15.2, r1(at(pmajC, 15.2) + (twoStage ? 1.1 : 0.15)), 0.75, 0.5), lab: [6, twoStage ? 36.6 : 4], nolabel: twoStage },
      ...rib(PE_R3, { id: 'r3', label: '3rd rib', short: 'R3', at: [8, 25.4], lab: [8, 36.6] }),
      ...rib(PE_R4, { id: 'r4', label: '4th rib', short: 'R4', at: [34, 24.4], lab: [36, 36.6] }),
    ],
    target: { at: twoStage ? psTip : ipTip, r: 2 },
    injections: twoStage ? [ps] : [ip, ps],
    steps: twoStage ? {
      scan: '<p>Stage 1 is done: about 10 ml lies <strong>between pectoralis major and minor</strong>, seen as the dark (ultrasound) or blue (diagram) lens.</p>',
      identify: '<p>Look deeper: <strong>pectoralis minor</strong>, then <strong>serratus anterior</strong> lying on the <strong>4th rib</strong>. The target is the plane between pectoralis minor and serratus anterior.</p>',
      needle: ps.steps.needle,
      inject: ps.steps.inject,
    } : {
      scan: '<p>Start in a parasagittal plane <strong>below the lateral third of the clavicle</strong> and find the axillary artery and vein, with the 2nd rib under them. Turn the probe obliquely (medial end towards the coracoid) and move it <strong>inferolaterally</strong>, counting the 3rd and then the <strong>4th rib</strong>.</p>',
      identify: '<p><strong>Pectoralis major</strong> (superficial), <strong>pectoralis minor</strong> under it, then <strong>serratus anterior</strong> on the ribs. Look for the <strong>pectoral branch of the thoracoacromial artery</strong> running between the two pectoral muscles (colour Doppler): it marks the interpectoral plane.</p>',
      needle: '<p>Choose the injection plane above. Both are in-plane from superomedial, through one skin puncture.</p>',
      inject: '<p>Choose the injection plane above.</p>',
    },
    probe: { view: 'front', x: 50, y: 82, angle: 140, label: 'right anterior chest, oblique, medial end towards the coracoid, at the 3rd–4th ribs near the anterior axillary line.' },
  };
}

// ================================================================ parasternal intercostal plane
// Right parasternal, transverse in the 4th intercostal space (He et al. 2026 describe transverse imaging at the
// 3rd–4th space about 2 cm from the sternum). Screen left = medial (sternal edge), right = lateral.
// Superficial: between pectoralis major and the intercostal muscles. Deep: between the internal intercostal
// muscle and transversus thoracis, where the internal thoracic vessels run.
const PS_PL = curve([[3.5, 21.8], [8, 22.0], [16, 22.2], [26, 22.5], [40, 22.8]]);
const PS_PMAJ = [[0, 9.2], [6, 9.5], [10, 11.2], [18, 12.2], [40, 13.0]];
const PS_ICM = [[0, 19.0], [10, 19.2], [20, 19.6], [40, 20.4]];
const STERNUM_BODY = P([-2, 9.8], [4.6, 9.9], [6.2, 10.8], [6.5, 13], [6.3, 17.4], [5.4, 18.7], [-2, 18.8]);
const STERNUM_CORTEX = L(1.0, [0, 9.75], [3, 9.75], [4.6, 9.85], [5.6, 10.25], [6.2, 10.9]);

const parasternal = {
  id: 'cw-parasternal', title: 'Parasternal: transverse view, 4th intercostal space', width: 40, depth: 32, focus: 18, skin: 1.2,
  view: 'Right parasternal, probe transverse in the 4th intercostal space with its medial end on the edge of the sternum. Medial on the left. The internal thoracic artery and vein lie about 1 cm from the sternal edge, on transversus thoracis.',
  orient: { left: 'Medial (sternum)', right: 'Lateral', marker: 'left' },
  injectionLabel: 'Parasternal plane',
  layers: [
    { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 4.6], [40, 5.4]], labelX: 31 },
    { id: 'pmaj', kind: 'muscle', label: 'Pectoralis major', short: 'PMaj', stri: 2, echo: 0.15, bottom: PS_PMAJ, labelX: 31 },
    { id: 'icm', kind: 'muscle', label: 'Intercostal muscles', short: 'ICM', color: '#c98a79', stri: -25, echo: 0.12, dens: 0.35, bottom: PS_ICM, labelX: 31 },
    { id: 'tt', kind: 'muscle', label: 'Transversus thoracis', short: 'TT', color: '#b97464', stri: 0, echo: 0.1, dens: 0.3, bottom: [[0, 21.4], [3.5, 21.6], [8, 21.9], [16, 22.1], [26, 22.4], [40, 22.7]], at: [31, 21.1], lab: [32.5, 25.4] },
    { id: 'med', kind: 'fat-deep', label: 'Mediastinal fat', nolabel: true, edge: 0, bottom: 80 },
  ],
  lines: [
    glide(PS_PL, [{ x0: 0, x1: 6.0 }], 40, 32),
    { id: 'pleura', kind: 'pleura', label: 'Pleura', short: 'Pl', smooth: false, pts: PS_PL, at: [24, at(PS_PL, 24)], lab: [22, 28.6] },
  ],
  shapes: [
    { id: 'st-body', kind: 'connective', color: BONE_FILL, echo: 0.05, shape: STERNUM_BODY },
    { id: 'st', kind: 'bone', label: 'Sternum (lateral edge)', short: 'Sternum', shape: STERNUM_CORTEX, at: [3, 9.8], lab: [8, 3.6] },
    { id: 'itv', kind: 'vein', label: 'Internal thoracic vein', short: 'ITV', shape: E(14.4, 20.6, 1.15, 0.85), lab: [8.5, 26.4] },
    { id: 'ita', kind: 'artery', label: 'Internal thoracic artery', short: 'ITA', shape: E(17.4, 20.7, 1.0, 0.95), lab: [13, 30.2] },
  ],
  injections: [
    {
      id: 'spip', label: 'Superficial (PMaj–ICM)', entry: [53, -2], tip: [27, r1(at(curve(PS_PMAJ), 27) + 0.1)],
      target: { at: [27, r1(at(curve(PS_PMAJ), 27) + 0.1)], r: 2 },
      spread: { along: 'pmaj', x0: 10, x1: 38, thick: 3, up: 0.5, above: 5 },
      steps: {
        needle: '<p><strong>Superficial parasternal intercostal plane:</strong> in-plane from lateral, about <strong>2 cm from the sternal edge</strong>. Stop between <strong>pectoralis major and the intercostal muscles</strong>. The internal thoracic vessels stay well below the tip.</p>',
        inject: '<p>Hydrodissect: pectoralis major lifts off the intercostal muscles and the fluid spreads along the plane. One injection spreads only a short distance up and down, so two levels may be needed for a long incision.</p>',
      },
    },
    {
      id: 'dpip', label: 'Deep (ICM–TT)', entry: [53, -2], tip: [26, r1(at(curve(PS_ICM), 26) + 0.1)],
      target: { at: [26, r1(at(curve(PS_ICM), 26) + 0.1)], r: 2 },
      spread: { along: 'icm', x0: 15.6, x1: 36, thick: 2.6, up: 0.35, above: 5 },
      steps: {
        needle: '<p><strong>Deep parasternal intercostal plane (transversus thoracis plane):</strong> through the intercostal muscles to the plane on <strong>transversus thoracis</strong>, lateral to the internal thoracic vessels. The pleura is only millimetres deeper: keep the tip in view.</p>',
        inject: '<p>The fluid opens the plane between the internal intercostal muscle and transversus thoracis, pushing transversus thoracis and the pleura down, and tracks medially towards the internal thoracic vessels.</p>',
      },
    },
  ],
  steps: {
    scan: '<p>Count the costal cartilages in a <strong>parasagittal</strong> view beside the sternum, then turn the probe <strong>transverse in the 3rd or 4th intercostal space</strong> with its medial end on the sternal edge.</p>',
    identify: '<p>Pectoralis major, the intercostal muscles, the thin dark band of <strong>transversus thoracis</strong>, then the pleura. Use colour Doppler for the <strong>internal thoracic artery and vein</strong>, about 1 cm from the sternal edge, between the intercostal muscles and transversus thoracis.</p>',
    needle: '<p>Choose superficial or deep above. Both are in-plane from lateral, entering about 2 cm from the sternal edge.</p>',
    inject: '<p>Choose superficial or deep above.</p>',
  },
  probe: { view: 'front', x: 72, y: 90, angle: 180, label: 'right parasternal, transverse in the 4th intercostal space (medial end on the sternal edge). Repeat on the left for a sternotomy.' },
};

export const SCENES = { sap, pecs: pecsScene(false), pecs2: pecsScene(true), parasternal };
