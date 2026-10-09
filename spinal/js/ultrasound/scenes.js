// spinal/js/ultrasound/scenes.js — geometry for the simulated neuraxial scans. Owner: B4.
// Millimetres. x runs across the screen (sagittal: cranial on the left; transverse: patient's left on
// the left), z is depth from the skin at the centre of the probe. One geometry feeds both the
// simulated B-mode (bmode.js, via shape.paint) and the labelled diagram (diagram.js, via shape.draw).
//
// Depths are typical adult values for teaching, not to scale for any one patient: posterior complex
// about 4.5–5 cm, intrathecal space about 5–6.5 cm, anterior complex about 6.5 cm (research file 01, B5).

import { PROBE, FRAME, skinZ, alongBeam, smooth } from './bmode.js';

const range = (a, b, step) => { const o = []; for (let x = a; x <= b + 1e-9; x += step) o.push(x); return o; };
const X0 = FRAME.x0 - 4, X1 = FRAME.x1 + 4;

/** Skin, fat and the thoracolumbar fascia, following the curved probe face near the surface. */
function superficial(fatDepth, seedPhase = 0) {
  const xs = range(X0, X1, 2);
  const sk = (x) => skinZ(Math.max(-PROBE.R * 0.98, Math.min(PROBE.R * 0.98, x)));
  const skinTop = xs.map((x) => [x, sk(x)]);
  const skinBot = xs.map((x) => [x, sk(x) + 2.2]);
  const fascia = xs.map((x) => [x, fatDepth + 0.45 * sk(x) + 0.7 * Math.sin(x / 13 + seedPhase) + 0.35 * Math.sin(x / 5.3 + 1)]);
  return {
    fascia,
    structs: [
      {
        key: 'fat', name: 'Skin and subcutaneous fat', short: 'Fat',
        desc: 'Skin is a bright band at the top. Fat under it is darker, with thin bright septa.',
        shapes: [
          { paint: 'skin', draw: 'skin', pts: [...skinTop, ...skinBot.slice().reverse()], top: skinTop, bottom: skinBot },
          { paint: 'fat', draw: 'fat', pts: [...skinBot, ...fascia.slice().reverse()], hl: true },
          { paint: 'fascia', draw: 'fascia', pts: fascia, w: 0.5 },
        ],
      },
    ],
  };
}

// ------------------------------------------------------------------ sagittal (paramedian oblique)
// Spine coordinate u (mm along the back), cranial negative, 0 = cranial edge of the sacrum.
const LEVELS = [ // lamina [a, b] and the gap caudal to it
  { name: 'L1', a: -192, b: -166, gap: 'L1–2' },
  { name: 'L2', a: -154, b: -128, gap: 'L2–3' },
  { name: 'L3', a: -116, b: -90, gap: 'L3–4' },
  { name: 'L4', a: -78, b: -52, gap: 'L4–5' },
  { name: 'L5', a: -40, b: -14, gap: 'L5–S1', dz: 0.8 },
];
const Z_FLAV = 47.4, Z_DURA = 50.4, Z_ADURA = 64.4, Z_AC = 65.4;

function laminaShape(a, b, dz, ox) {
  const L = b - a, X = (u) => u - ox;
  // Shingle-like lamina: deep at its cranial (superior) edge, rising to a rounded "head" at its
  // caudal (inferior) edge, which then drops away steeply (the steep face is parallel to the beam).
  const top = [[a - 0.4, 48.6], [a + 0.25 * L, 46.0], [a + 0.55 * L, 43.2], [b - 6.5, 41.0], [b - 3.6, 39.4], [b - 1.6, 39.0], [b - 0.3, 39.9], [b + 0.2, 42.2]];
  const under = [[b - 0.1, 45.0], [b - 1.6, 47.0], [b - 7, 48.6], [a + 0.5 * L, 50.6], [a + 2, 51.4], [a - 0.8, 50.2]];
  const T = (p) => [X(p[0]), p[1] + dz];
  const surface = smooth(top.slice(0, 7).map(T), false, 6);
  const poly = smooth([...top, ...under].map(T), true, 6);
  return { surface, poly };
}

/** Paramedian sagittal oblique scene centred at spine position uc. */
export function sagittal(uc, id, { title, stopName } = {}) {
  const X = (u) => u - uc;
  const sup = superficial(13.5, uc / 40);
  const structs = [...sup.structs];
  const uMin = uc + X0, uMax = uc + X1;

  // Erector spinae: from the fascia down to the laminae / flavum.
  const xs = range(X0, X1, 2);
  const muscleBottom = xs.map((x) => [x, 49.5]);
  structs.push({
    key: 'esm', name: 'Erector spinae', short: 'ESM',
    desc: 'Grey muscle with fine bright lines running along it, between the fat and the laminae.',
    shapes: [
      { paint: 'muscle', draw: 'muscle', pts: [...sup.fascia, ...muscleBottom.slice().reverse()], opts: { stri: 0, echo: 0.2 }, hl: true },
      { paint: 'septum', draw: 'septum', pts: xs.map((x) => [x, 22.5 + 1.6 * Math.sin(x / 17 + uc / 30) + 0.5 * Math.sin(x / 4)]), w: 0.35 },
      { paint: 'septum', draw: 'septum', pts: xs.map((x) => [x, 31.5 + 1.2 * Math.sin(x / 21 + 1 + uc / 25)]), w: 0.3, opts: { gaps: 3, amp: 0.45 } },
    ],
  });

  // Epidural fat band, thecal sac and roots, vertebral bodies and discs.
  const sacEnd = 40; // dural sac ends about S2
  const duraPts = [];
  for (let u = uMin; u <= Math.min(uMax, sacEnd + 2); u += 2) {
    let z = Z_DURA + 0.25 * Math.sin(u / 9);
    if (u > 2) z = Z_DURA + Math.min(1, (u - 2) / 10) * 6.5 + Math.max(0, (u - 14) / 26) * 6;
    duraPts.push([X(u), Math.min(z, Z_ADURA - 0.8)]);
  }
  const aduraPts = duraPts.map(([x]) => [x, Z_ADURA + 0.2 * Math.sin(x / 11)]);
  const sacPoly = [...duraPts, ...aduraPts.slice().reverse()];
  structs.push({
    key: 'epi', name: 'Epidural space', short: 'Epi', minor: true, nolist: true,
    shapes: [{ paint: 'epi', draw: 'epi', pts: [...xs.map((x) => [x, Z_FLAV - 0.6]), ...xs.slice().reverse().map((x) => [x, Z_DURA + 0.4])] }],
  });
  if (X(uMin) < X(sacEnd)) {
    structs.push({
      key: 'its', name: 'Intrathecal space', short: 'ITS',
      desc: 'Black, because CSF reflects almost nothing. Only seen through a window.',
      shapes: [{ paint: 'csf', draw: 'csf', pts: sacPoly, hl: true }],
    });
    structs.push({
      key: 'ce', name: 'Cauda equina', short: 'CE', minor: true,
      desc: 'Faint bright streaks inside the sac. They may move with the pulse.',
      shapes: [54.2, 57.4, 60.6].map((z0, k) => ({
        paint: 'roots', draw: 'roots', hl: true,
        pts: duraPts.filter(([x]) => x < X(sacEnd) - 6 - k * 3).map(([x]) => [x, z0 + 0.35 * Math.sin(x / (7 + k) + k)]),
      })).filter((s) => s.pts.length > 1),
    });
  }

  // Vertebral bodies (bone under the anterior complex) and discs opposite each gap.
  const discs = LEVELS.map((l) => (l.b + (LEVELS.find((m) => m.a > l.b)?.a ?? 0)) / 2 - 2);
  const acPts = xs.map((x) => { const u = x + uc; const nearDisc = discs.some((d) => Math.abs(u - d) < 4.5); return [x, Z_AC + (nearDisc ? -0.5 : 0.25 * Math.cos(u / 6))]; });
  const cut = discs.filter((d) => d > uMin - 6 && d < uMax + 6).sort((a, b) => a - b);
  const vbShapes = [{ paint: 'bone', draw: 'vb', pts: [...acPts.map(([x, z]) => [x, z + 0.4]), [X1, FRAME.z1 + 2], [X0, FRAME.z1 + 2]], surface: null }];
  const discShapes = cut.map((d) => ({ paint: 'disc', draw: 'disc', pts: [[X(d - 4.5), Z_AC + 0.2], [X(d + 4.5), Z_AC + 0.2], [X(d + 5.5), FRAME.z1 + 2], [X(d - 5.5), FRAME.z1 + 2]] }));
  structs.push({
    key: 'ac', name: 'Anterior complex', short: 'AC',
    desc: 'Anterior dura, posterior longitudinal ligament and the back of the vertebral body or disc, seen as one bright line. If you can see it, the window is open.',
    shapes: [
      { paint: 'line', draw: 'acline', pts: acPts, w: 1.1, hl: true },
      { paint: 'dura', draw: 'adura', pts: aduraPts, w: 0.45, opts: { amp: 0.55 } },
      ...vbShapes, ...discShapes,
    ],
  });

  // Laminae and the sacrum.
  const lamShapes = [], labels = [], gaps = [];
  for (const l of LEVELS) {
    if (l.b < uMin - 4 || l.a > uMax + 4) continue;
    const { surface, poly } = laminaShape(l.a, l.b, l.dz || 0, uc);
    lamShapes.push({ paint: 'bone', draw: 'bone', pts: poly, surface, hl: true, level: l.name });
    const cx = X((l.a + l.b) / 2 + 3);
    if (cx > -60 && cx < 66) labels.push({ key: 'lamina', group: 'level', text: `${l.name} lamina`, short: l.name, anchor: [cx, 40.6 + (l.dz || 0)], pos: [cx, 27], align: 'center' });
  }
  for (let i = 0; i < LEVELS.length; i++) {
    const l = LEVELS[i], nextA = LEVELS[i + 1]?.a ?? 0;
    const gx0 = X(l.b), gx1 = X(nextA);
    if (gx1 < X0 || gx0 > X1) continue;
    gaps.push({ name: l.gap, x0: gx0, x1: gx1, cx: (gx0 + gx1) / 2 });
  }
  // Sacrum: flat, continuous, no gaps, dense shadow.
  const sacrumTop = smooth([[-0.6, 47.2], [1.0, 45.4], [5, 44.7], [18, 44.9], [38, 45.5], [65, 46.8], [100, 48.8], [160, 52]].map(([u, z]) => [X(u), z]), false, 8);
  const sacrumPoly = [...sacrumTop, [X(160), 58], [X(40), 57.5], [X(8), 56.5], [X(-0.8), 51]];
  const showSacrum = X(0) < 66;
  structs.push({
    key: 'lamina', name: 'Laminae', short: 'Lam',
    desc: 'Bright sloping lines, each with a black shadow under it: the sawtooth or “horse head” pattern.',
    shapes: lamShapes,
  });
  if (showSacrum) {
    structs.push({
      key: 'sacrum', name: 'Sacrum', short: 'Sac',
      desc: 'A long, flat bright line with no gaps and a dense shadow. Start counting here.',
      shapes: [{ paint: 'bone', draw: 'bone', pts: sacrumPoly, surface: sacrumTop, hl: true, opts: { floor: 0.35 } }],
    });
    const sx = Math.max(X(4), Math.min(X(60), 30));
    if (sx < 62) labels.push({ key: 'sacrum', group: 'level', text: 'Sacrum', short: 'S', anchor: [sx, 44.9 + (sx - X(18)) * 0.02], pos: [sx, 27], align: 'center' });
  }

  // Posterior complex: ligamentum flavum across each gap + posterior dura.
  const pcShapes = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const l = LEVELS[i], nextA = LEVELS[i + 1]?.a ?? 0;
    if (X(nextA) < X0 - 10 || X(l.b) > X1 + 10) continue;
    const pts = smooth([[l.b - 4, Z_FLAV + 0.1], [l.b + 1.5, Z_FLAV + 0.25], [(l.b + nextA) / 2, Z_FLAV + 0.35], [nextA - 1.5, Z_FLAV], [nextA + 0.8, Z_FLAV - 0.6]].map(([u, z]) => [X(u), z]), false, 6);
    pcShapes.push({ paint: 'flavum', draw: 'flavum', pts, w: 1.3, hl: true });
  }
  pcShapes.push({ paint: 'dura', draw: 'dura', pts: duraPts, w: 0.6, hl: true });
  structs.push({
    key: 'pc', name: 'Posterior complex', short: 'PC',
    desc: 'Ligamentum flavum, epidural space and posterior dura, usually seen as one bright line across the window. Depth to here is what you measure.',
    shapes: pcShapes,
  });

  // Virtual structures: windows and shadows (computed along the diverging beam).
  const winShapes = gaps.filter((g) => g.cx > -66 && g.cx < 66).map((g) => {
    const p1 = [g.x0 + 0.2, 40.5], p2 = [g.x1 - 0.2, 46.8];
    return { draw: 'none', hl: true, dash: true, pts: [p1, p2, alongBeam(p2[0], p2[1], Z_AC), alongBeam(p1[0], p1[1], Z_AC)] };
  });
  structs.push({
    key: 'win', name: 'Interlaminar window', short: 'Win', minor: true,
    desc: 'The gap between two laminae. The beam gets through here, and so will your needle.',
    shapes: winShapes,
  });
  const shadowShapes = lamShapes.map((s) => {
    const a = s.surface[0], b = s.surface[s.surface.length - 1];
    return { draw: 'none', hl: true, dash: true, pts: [a, ...s.surface.slice(1, -1), b, alongBeam(b[0], b[1], PROBE.depth - 4), alongBeam(a[0], a[1], PROBE.depth - 4)] };
  });
  structs.push({
    key: 'shadow', name: 'Acoustic shadow', short: 'Sh', minor: true,
    desc: 'Bone reflects almost all the sound, so nothing is seen beneath it.',
    shapes: shadowShapes,
  });

  // Labels: levels above each lamina and gap; tissue labels around the window nearest the centre.
  for (const g of gaps) if (g.cx > -62 && g.cx < 62) labels.push({ key: 'win', group: 'level', text: g.name, short: g.name, anchor: [g.cx, 43], pos: [g.cx, 35.5], align: 'center', gap: true });
  labels.push({ key: 'fat', group: 'tissue', text: 'Subcutaneous fat', short: 'Fat', anchor: [-14, 7.5], pos: [-34, 1.5], align: 'right' });
  labels.push({ key: 'esm', group: 'tissue', text: 'Erector spinae', short: 'ESM', anchor: [16, 19], pos: [35, 6], align: 'left' });
  const cg = gaps.slice().sort((a, b) => Math.abs(a.cx) - Math.abs(b.cx))[0];
  let caliper = null;
  if (cg && Math.abs(cg.cx) < 22) {
    const x = cg.cx;
    labels.push({ key: 'pc', group: 'tissue', text: 'Posterior complex', short: 'PC', anchor: [x - 0.5, Z_FLAV + 0.3], pos: [x - 9, 54], align: 'right' });
    labels.push({ key: 'its', group: 'tissue', text: 'Intrathecal space', short: 'ITS', anchor: [x + 1.5, 57.5], pos: [x + 9, 57.5], align: 'left' });
    labels.push({ key: 'ac', group: 'tissue', text: 'Anterior complex', short: 'AC', anchor: [x - 1, Z_AC], pos: [x - 9, 71], align: 'right' });
    labels.push({ key: 'ce', group: 'tissue', minor: true, text: 'Cauda equina', short: 'CE', anchor: [x + 2, 60], pos: [x + 9, 65], align: 'left' });
    labels.push({ key: 'shadow', group: 'tissue', text: 'Acoustic shadow', short: 'Shadow', anchor: [x + 22, 76], pos: [x + 22, 83], align: 'center', minor: true });
    labels.push({ key: 'win', group: 'tissue', minor: true, text: 'Interlaminar window', short: 'Window', anchor: [x, 44.5], pos: [x + 9, 47], align: 'left', hlOnly: true });
    caliper = { x, z: Z_FLAV - 0.6, name: cg.name };
  } else {
    labels.push({ key: 'shadow', group: 'tissue', text: 'Acoustic shadow', short: 'Shadow', anchor: [24, 72], pos: [24, 80], align: 'center', minor: true });
  }
  if (showSacrum && cg && cg.name === 'L5–S1' && Math.abs(cg.cx) >= 22) {
    labels.push({ key: 'pc', group: 'tissue', minor: true, text: 'Posterior complex', short: 'PC', anchor: [cg.cx, Z_FLAV + 0.3], pos: [cg.cx - 8, 55], align: 'right', hlOnly: true });
  }

  const keyOrder = ['fat', 'esm', 'lamina', 'sacrum', 'win', 'pc', 'its', 'ce', 'ac', 'shadow'];
  structs.sort((a, b) => keyOrder.indexOf(a.key) - keyOrder.indexOf(b.key));
  return {
    id, seed: `sag${uc}`, kind: 'sagittal', title, stopName, uc,
    edges: ['Cranial', 'Caudal'], structs, labels, caliper, gaps,
  };
}

// ------------------------------------------------------------------ transverse
function mirror(pts) { return pts.map(([x, z]) => [-x, z]); }

export function transverse(mode, id, { title } = {}) {
  const il = mode === 'il';
  const sup = superficial(il ? 12 : 11.5, il ? 0.4 : 1.7);
  const structs = [...sup.structs];
  const xs = range(X0, X1, 2);
  const labels = [];

  // Paraspinal muscles either side of the midline, cut across their fibres.
  const half = (side) => {
    const s = side;
    const inner = il ? 2.6 : 4.6;
    const top = sup.fascia.filter(([x]) => s * x >= inner - 0.1).map(([x, z]) => [x, z]);
    if (s < 0) top.reverse();
    const pts = [[s * inner, top[0][1]], ...top, [s * (X1 + 2), FRAME.z1], [s * inner, FRAME.z1]];
    return pts;
  };
  structs.push({
    key: 'esm', name: il ? 'Erector spinae' : 'Erector spinae and multifidus', short: 'ESM',
    desc: 'Paraspinal muscle cut across: grey and speckled, with thin bright fascial planes.',
    shapes: [
      { paint: 'muscle', draw: 'muscle', pts: half(-1), opts: { cross: true, stri: 0, echo: 0.21 }, hl: true },
      { paint: 'muscle', draw: 'muscle', pts: half(1), opts: { cross: true, stri: 0, echo: 0.21 }, hl: true },
      ...[-1, 1].map((s) => ({ paint: 'septum', draw: 'septum', pts: smooth([[s * 5, 31], [s * 14, 25], [s * 30, 19.5], [s * 50, 17.5], [s * 80, 17]], false, 6), w: 0.35, opts: { gaps: 2 } })),
      ...[-1, 1].map((s) => ({ paint: 'septum', draw: 'septum', pts: smooth([[s * 26, 34], [s * 34, 30], [s * 52, 28.5], [s * 82, 29]], false, 6), w: 0.3, opts: { gaps: 2, amp: 0.4 } })),
    ],
  });

  let caliper = null;
  if (il) {
    // Interspinous ligament: a dark midline cleft with no shadow.
    const islTop = 12 + 0.45 * skinZ(0);
    structs.push({
      key: 'isl', name: 'Interspinous ligament', short: 'ISL',
      desc: 'A dark vertical cleft in the midline with no shadow under it: you are between two spinous processes.',
      shapes: [{ paint: 'isl', draw: 'isl', pts: [[-2.6, islTop], [2.6, islTop], [3.4, 41], [-3.4, 41]], hl: true }],
    });
    // Articular processes ("ears"), transverse processes ("wings"), canal, vertebral body, psoas.
    const apTop = [[10.4, 42.6], [11.6, 39.4], [14.4, 37.1], [18.0, 36.5], [21.4, 37.5], [23.6, 39.8], [24.8, 43.2]];
    const apPoly = [...apTop, [24.6, 49.5], [17, 50.5], [10.6, 49.2]];
    const tpTop = [[25.5, 49.9], [32, 50.5], [40, 51.6], [45.8, 52.9], [48, 54.4]];
    const tpPoly = [...tpTop, [47.4, 56.6], [40, 55.6], [31, 55.1], [25.4, 55.2]];
    structs.push({
      key: 'ap', name: 'Articular processes', short: 'AP',
      desc: 'Bright humps either side of the canal, with shadows: the ears of the “cat’s head” or the bat.',
      shapes: [-1, 1].map((s) => {
        const surf = smooth((s < 0 ? mirror(apTop) : apTop), false, 6);
        return { paint: 'bone', draw: 'bone', pts: smooth(s < 0 ? mirror(apPoly) : apPoly, true, 5), surface: surf, hl: true };
      }),
    });
    structs.push({
      key: 'tp', name: 'Transverse processes', short: 'TP',
      desc: 'Thin bright lines further out and deeper, with shadows: the wings or whiskers.',
      shapes: [-1, 1].map((s) => ({ paint: 'bone', draw: 'bone', pts: smooth(s < 0 ? mirror(tpPoly) : tpPoly, true, 5), surface: smooth(s < 0 ? mirror(tpTop) : tpTop, false, 6), hl: true })),
    });
    const sac = []; for (let k = 0; k < 56; k++) { const t = (k / 56) * Math.PI * 2; const c = Math.cos(t); sac.push([12.4 * Math.sign(c) * Math.abs(c) ** 0.8, 57 + 7.3 * Math.sin(t)]); }
    structs.push({
      key: 'epi', name: 'Epidural space', nolist: true,
      shapes: [{ paint: 'epi', draw: 'epi', pts: smooth([[-10.4, 47.4], [0, 46.6], [10.4, 47.4], [8, 50.6], [0, 50.4], [-8, 50.6]], true, 5) }],
    });
    structs.push({
      key: 'its', name: 'Intrathecal space', short: 'ITS',
      desc: 'The black thecal sac (the head of the cat or the body of the bat).',
      shapes: [{ paint: 'csf', draw: 'csf', pts: sac, hl: true }],
    });
    structs.push({
      key: 'ce', name: 'Cauda equina', short: 'CE', minor: true,
      desc: 'Nerve roots cut across: faint dots, usually lying in the front of the sac.',
      shapes: [[-4.5, 60.2], [-2, 61.6], [0.6, 60.6], [3.4, 61.4], [5.6, 59.8], [-6.4, 58.4], [1.6, 58.6], [-1.2, 59.2], [4, 57.9]].map((d) => ({ paint: 'roots', draw: 'rootdot', dot: d, pts: [d], hl: true })),
    });
    structs.push({
      key: 'pc', name: 'Posterior complex', short: 'PC',
      desc: 'Ligamentum flavum, epidural space and posterior dura as one bright line in the midline. Measure the depth to here.',
      shapes: [
        { paint: 'flavum', draw: 'flavum', pts: smooth([[-10.2, 47.7], [-5, 46.9], [0, 46.7], [5, 46.9], [10.2, 47.7]], false, 6), w: 1.25, hl: true },
        { paint: 'dura', draw: 'dura', pts: sac.filter(([x, z]) => z < 52.5 && Math.abs(x) < 10.5).sort((a, b) => a[0] - b[0]), w: 0.6, hl: true },
      ],
    });
    const acTop = smooth([[-19, 66.2], [-12, 64.6], [-5, 64.9], [0, 65.1], [5, 64.9], [12, 64.6], [19, 66.2]], false, 6);
    const vbPoly = smooth([[-19, 66.2], [-12, 64.6], [0, 65.1], [12, 64.6], [19, 66.2], [23.5, 71], [25.5, 80], [26, 94], [-26, 94], [-25.5, 80], [-23.5, 71]], true, 5);
    structs.push({
      key: 'ac', name: 'Anterior complex', short: 'AC',
      desc: 'A bright line parallel to the posterior complex: the back of the vertebral body or disc.',
      shapes: [{ paint: 'line', draw: 'acline', pts: acTop.filter(([x]) => Math.abs(x) < 12.5), w: 1.1, hl: true },
        { paint: 'dura', draw: 'adura', pts: sac.filter(([x, z]) => z > 61.5 && Math.abs(x) < 10.5).sort((a, b) => a[0] - b[0]), w: 0.45, opts: { amp: 0.5 } }],
    });
    structs.push({
      key: 'vb', name: 'Vertebral body', short: 'VB',
      desc: 'Bone in front of the canal. Its back surface is part of the anterior complex; below it is shadow.',
      shapes: [{ paint: 'bone', draw: 'vb', pts: vbPoly, surface: acTop, hl: true, opts: { amp: 0.75 } }],
    });
    const psoas = (s) => smooth([[s * 27, 60], [s * 40, 57.5], [s * 56, 60], [s * 66, 70], [s * 64, 84], [s * 48, 92], [s * 32, 90], [s * 26.5, 78]], true, 6);
    structs.push({
      key: 'psoas', name: 'Psoas', short: 'Ps', minor: true,
      desc: 'Muscle beside the vertebral body, seen lateral to and between the shadows of the transverse processes.',
      shapes: [-1, 1].map((s) => ({ paint: 'muscle', draw: 'muscle2', pts: psoas(s), opts: { cross: true, echo: 0.17 }, hl: true })),
    });
    const shadowOf = (sh) => { const a = sh.surface[0], b = sh.surface[sh.surface.length - 1]; return { draw: 'none', hl: true, dash: true, pts: [...sh.surface, alongBeam(b[0], b[1], 86), alongBeam(a[0], a[1], 86)] }; };
    structs.push({
      key: 'shadow', name: 'Acoustic shadows', short: 'Sh', minor: true,
      desc: 'Black stripes under each bony process. The canal is seen only through the gap between them.',
      shapes: [...structs.find((s) => s.key === 'ap').shapes, ...structs.find((s) => s.key === 'tp').shapes].map(shadowOf),
    });

    labels.push(
      { key: 'fat', group: 'tissue', text: 'Subcutaneous fat', short: 'Fat', anchor: [-14, 7], pos: [-34, 1.5], align: 'right' },
      { key: 'esm', group: 'tissue', text: 'Erector spinae', short: 'ESM', anchor: [20, 23], pos: [35, 6], align: 'left' },
      { key: 'isl', group: 'tissue', minor: true, text: 'Interspinous ligament', short: 'ISL', anchor: [0, 26], pos: [-9, 33], align: 'right' },
      { key: 'ap', group: 'tissue', text: 'Articular process', short: 'AP', anchor: [-17.5, 36.6], pos: [-36, 27], align: 'right' },
      { key: 'ap', group: 'tissue', text: 'Articular process', short: 'AP', anchor: [17.5, 36.6], pos: [36, 27], align: 'left', dup: true },
      { key: 'tp', group: 'tissue', text: 'Transverse process', short: 'TP', anchor: [-38, 51.2], pos: [-46, 41], align: 'right' },
      { key: 'pc', group: 'tissue', text: 'Posterior complex', short: 'PC', anchor: [-1, 46.9], pos: [-13, 55], align: 'right' },
      { key: 'its', group: 'tissue', text: 'Intrathecal space', short: 'ITS', anchor: [3, 54.5], pos: [13, 56], align: 'left' },
      { key: 'ac', group: 'tissue', text: 'Anterior complex', short: 'AC', anchor: [-2, 65], pos: [-14, 68.5], align: 'right' },
      { key: 'ce', group: 'tissue', minor: true, text: 'Cauda equina', short: 'CE', anchor: [3.4, 61.2], pos: [14, 66], align: 'left' },
      { key: 'vb', group: 'tissue', text: 'Vertebral body', short: 'VB', anchor: [0, 75], pos: [0, 82], align: 'center' },
      { key: 'psoas', group: 'tissue', minor: true, text: 'Psoas', short: 'Ps', anchor: [57, 68], pos: [63, 85], align: 'center' },
      { key: 'shadow', group: 'tissue', minor: true, text: 'Acoustic shadow', short: 'Shadow', anchor: [-36, 70], pos: [-40, 79], align: 'center', hlOnly: true },
    );
    caliper = { x: 0, z: 46.1, name: 'interlaminar' };
  } else {
    // Spinous process view: bright tip under the fat, laminae sloping away, solid shadow: no canal.
    const right = [[0, 19.6], [2.6, 20.1], [4.0, 21.8], [4.3, 24], [3.7, 29], [4.0, 34.2], [5.4, 36.1], [10, 37.3], [15, 38.6], [19.5, 39.6], [22.5, 38.6], [25, 39.4], [27, 42.2]];
    const rightUnder = [[26.8, 47], [20, 46.4], [12, 45.2], [7.2, 43.6], [4.8, 44], [2.4, 45]];
    const outline = [...mirror(right).reverse(), ...right.slice(1), ...rightUnder, ...mirror(rightUnder).reverse()];
    const surf = smooth([...mirror(right).reverse(), ...right.slice(1)], false, 5);
    // Diagram-only fills: supraspinous ligament over the tip and epidural fat around the hidden canal.
    structs.push({ key: 'ssl', nolist: true, shapes: [{ draw: 'isl', pts: [[-4.7, 10.5], [4.7, 10.5], [4.7, 24], [-4.7, 24]] }] });
    structs.push({ key: 'epi', nolist: true, shapes: [{ draw: 'epi', pts: [[-13, 43], [13, 43], [13, 67], [-13, 67]] }] });
    structs.push({
      key: 'sp', name: 'Spinous process', short: 'SP',
      desc: 'The bright tip of the spinous process just under the fat. Centre it on the screen to mark the midline.',
      shapes: [{ paint: 'bone', draw: 'bone', pts: smooth(outline, true, 4), surface: surf.filter(([x, z]) => Math.abs(x) < 4.3 && z < 23), hl: true }],
    });
    structs.push({
      key: 'lamina', name: 'Laminae', short: 'Lam',
      desc: 'Bright lines sloping away from the base of the spinous process on each side.',
      shapes: [surf.filter(([x]) => x > 4.6), surf.filter(([x]) => x < -4.6)].map((pts) => ({ paint: 'line', draw: 'none', pts, w: 1.1, hl: true, open: true })),
    });
    const tpTop = [[30.5, 47.8], [38, 48.6], [45.8, 50.2], [48, 51.8]];
    const tpPoly = [...tpTop, [47.2, 54], [38, 53], [30.4, 52.6]];
    structs.push({
      key: 'tp', name: 'Transverse processes', short: 'TP', minor: true,
      desc: 'Deeper and further out, with their own shadows.',
      shapes: [-1, 1].map((s) => ({ paint: 'bone', draw: 'bone', pts: smooth(s < 0 ? mirror(tpPoly) : tpPoly, true, 5), surface: smooth(s < 0 ? mirror(tpTop) : tpTop, false, 6), hl: true })),
    });
      const a = [-27, 42.2], b = [27, 42.2];
    structs.push({
      key: 'shadow', name: 'Midline acoustic shadow', short: 'Shadow',
      desc: 'Solid black under the spinous process and laminae. No canal is seen: slide up or down into the gap.',
      shapes: [{ draw: 'none', hl: true, dash: true, pts: [[-4.2, 21.5], [0, 19.6], [4.2, 21.5], b, alongBeam(b[0], b[1], 86), alongBeam(a[0], a[1], 86), a] }],
    });
    // The vertebral body and canal exist but are hidden in the shadow: drawn in the diagram only.
    structs.push({
      key: 'canal', name: 'Spinal canal (hidden)', short: 'Canal', minor: true,
      desc: 'Present in the diagram but invisible on the scan: it lies in the shadow of the bone.',
      shapes: [
        { draw: 'csf', pts: (() => { const o = []; for (let k = 0; k < 40; k++) { const t = (k / 40) * Math.PI * 2; o.push([9 * Math.cos(t), 56.5 + 7 * Math.sin(t)]); } return o; })(), hl: true },
        { draw: 'vb', pts: smooth([[-19, 66.2], [-12, 64.6], [0, 65.1], [12, 64.6], [19, 66.2], [23.5, 71], [25.5, 80], [26, 94], [-26, 94], [-25.5, 80], [-23.5, 71]], true, 5) },
      ],
    });
    labels.push(
      { key: 'fat', group: 'tissue', text: 'Subcutaneous fat', short: 'Fat', anchor: [-14, 7], pos: [-34, 1.5], align: 'right' },
      { key: 'esm', group: 'tissue', text: 'Erector spinae', short: 'ESM', anchor: [20, 25], pos: [35, 6], align: 'left' },
      { key: 'sp', group: 'tissue', text: 'Spinous process', short: 'SP', anchor: [-1.5, 19.9], pos: [-36, 14], align: 'right' },
      { key: 'lamina', group: 'tissue', text: 'Lamina', short: 'Lam', anchor: [13, 38], pos: [37, 30], align: 'left' },
      { key: 'shadow', group: 'tissue', text: 'Acoustic shadow', short: 'Shadow', anchor: [-17, 56], pos: [-17, 64], align: 'center' },
      { key: 'tp', group: 'tissue', minor: true, text: 'Transverse process', short: 'TP', anchor: [-40, 48.6], pos: [-48, 40], align: 'right' },
      { key: 'canal', group: 'tissue', minor: true, hlOnly: true, text: 'Canal (in shadow)', short: 'Canal', anchor: [6, 56], pos: [14, 74], align: 'left' },
    );
  }
  const keyOrder = ['fat', 'ssl', 'esm', 'isl', 'sp', 'lamina', 'ap', 'tp', 'pc', 'its', 'ce', 'ac', 'vb', 'psoas', 'shadow', 'canal'];
  structs.sort((p, q) => keyOrder.indexOf(p.key) - keyOrder.indexOf(q.key));
  return { id, seed: `tr-${mode}`, kind: 'transverse', mode, title, edges: ['Left', 'Right'], structs, labels, caliper };
}

// ------------------------------------------------------------------ the views used on the page
export const STOPS = [
  { key: 'sacrum', uc: 30, name: 'Sacrum', long: 'over the sacrum' },
  { key: 'l5s1', uc: -7, name: 'L5–S1', long: 'centred on the L5–S1 gap' },
  { key: 'l45', uc: -46, name: 'L4–5', long: 'centred on the L4–5 gap' },
  { key: 'l34', uc: -84, name: 'L3–4', long: 'centred on the L3–4 gap' },
];
const cache = new Map();
export function getScene(id) {
  if (cache.has(id)) return cache.get(id);
  let s;
  if (id.startsWith('sag-')) {
    const st = STOPS.find((t) => `sag-${t.key}` === id);
    s = sagittal(st.uc, id, { stopName: st.name });
  } else if (id === 'tr-il') s = transverse('il', id);
  else s = transverse('sp', id);
  cache.set(id, s);
  return s;
}
/** Spine position (mm, sacrum edge = 0) to the probe schematic, and the stops. */
export const SPINE = { LEVELS, sacrumEdge: 0 };
