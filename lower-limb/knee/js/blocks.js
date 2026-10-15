// Knee blocks: block data (schema: ../../../shared/regional/DATA.md, "Block schema"; leg figures: ../../shared/LEG.md).
// Adductor canal doses are Dr Chew Shi Hao's (the owner's decision). iPACK, genicular and obturator doses are taken
// from the literature and standard texts; their sources are in the notes file, not on the page. No citations on the page.
import { mountScan } from '../../../shared/regional/js/scan.js';
import { el } from '../../../shared/regional/js/ui.js';
import { legCoverageMap } from '../../../shared/regional/js/figures/leg.js';
import { SCENES } from './scenes.js?v=20261015';

// An extra scan viewer inside a block section (its own deep links: #<blockId>-step-…, #<blockId>-inj-…).
function extraScan(scene, blockId) {
  return (sec) => {
    const wrap = el('div', { class: 'tb-scan-wrap kn-scan-extra' });
    sec.append(wrap);
    mountScan(wrap, scene, { blockId });
  };
}

// The adductor canal block reaches only the anteromedial part of the front of the knee joint. The leg figure's
// 'knee-ant' glyph is the whole anterior capsule, so this map shades only its medial half (the viewer's right on the
// front view) and leaves the lateral half as a dashed outline, with a line in the key saying so.
let acbClip = 0;
function acbCoverageMap(cov, opts) {
  const fig = legCoverageMap(cov, opts);
  const svg = fig.querySelector('.ll-cov-svg');
  const deep = svg && svg.querySelector('.ll-deep');
  if (deep) {
    const outline = deep.lastElementChild?.getAttribute('d');
    const id = `kn-acb-knee-clip-${(acbClip += 1)}`;
    const cp = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    cp.setAttribute('id', id);
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    Object.entries({ x: 84, y: 0, width: 80, height: 420 }).forEach(([k, v]) => r.setAttribute(k, v));
    cp.append(r); svg.prepend(cp);
    deep.setAttribute('clip-path', `url(#${id})`);
    if (outline) {
      const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      Object.entries({ d: outline, fill: 'none', stroke: '#183f63', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.8 }).forEach(([k, v]) => ghost.setAttribute(k, v));
      deep.after(ghost);
    }
    const mid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    Object.entries({ d: 'M84 268 L84 304', stroke: '#183f63', 'stroke-width': 1.3, fill: 'none' }).forEach(([k, v]) => mid.setAttribute(k, v));
    deep.after(mid);
  }
  const legend = fig.querySelector('.tb-cov-legend');
  if (legend) {
    const li = document.createElement('li');
    li.className = 'tb-cov-note';
    li.textContent = 'Knee joint: only the anteromedial part is shaded. The dashed outline (the superolateral and lateral front of the knee) is not covered.';
    legend.insertBefore(li, legend.lastElementChild);
  }
  fig.querySelectorAll('.ll-cov-zones li strong').forEach((s) => {
    if (/^Knee joint, anterior/.test(s.textContent)) s.textContent = 'Knee joint, anteromedial capsule only';
  });
  const stage = fig.querySelector('.tb-cov-stage');
  if (stage) stage.setAttribute('aria-label', (stage.getAttribute('aria-label') || '').replace('Knee joint, anterior and anteromedial capsule', 'Knee joint, anteromedial capsule only (not the lateral front of the knee)'));
  return fig;
}

export const BLOCKS = [
  // ------------------------------------------------------------------ femoral triangle and adductor canal
  {
    id: 'adductor-canal',
    kicker: 'Knee · Motor-sparing',
    title: 'Femoral triangle and adductor canal block',
    summary: `Local anaesthetic <strong>deep to sartorius, beside the femoral artery</strong>, low in the femoral triangle or in the adductor canal below it. It blocks the <strong>saphenous nerve</strong> (and, higher up, the <strong>nerve to vastus medialis</strong>): the medial knee, leg and ankle, and the anteromedial knee joint, while <strong>largely sparing the quadriceps</strong>. The backbone of motor-sparing knee analgesia.`,
    indications: [
      'TKR, ACL reconstruction',
      'Rescue after knee surgery',
      'Medial leg or ankle, with a popliteal block',
      'Saphenous vein surgery',
    ],
    glance: {
      position: 'Supine, thigh abducted and externally rotated',
      probe: 'Linear, transverse on the anteromedial thigh at the apex of the femoral triangle',
      needle: '80 mm echogenic, in-plane, lateral to medial',
      dose: 'Single shot: 10 ml of 0.4% ropivacaine (40 mg). TKR three targets: 25 ml of 0.2% (50 mg)',
      covers: 'Medial knee, leg and ankle (saphenous); anteromedial knee joint. Quadriceps largely spared.',
    },
    watch: { anim: 'adductor-canal', variant: 'single', caption: 'Femoral triangle and adductor canal block. Tabs: find the apex by scanning, the single shot (with an intramuscular error and its fix), and the three-target technique for knee replacement.', tier: 1 }, // Dr Chew Shi Hao's animation (lower-limb/anim/), loaded when opened
    scene: SCENES.ftb,
    position: '<p>Supine, the thigh <strong>abducted and externally rotated</strong> with the knee slightly bent (a pillow under the knee), so the anteromedial thigh faces you. Stand on the side to be blocked with the screen across the patient.</p>',
    equipment: [
      'High-frequency linear probe (the artery is usually 2–3 cm deep, up to 4 cm or more in large thighs)',
      '80 mm echogenic needle',
      'Single shot: 10 ml of 0.4% ropivacaine. TKR three targets: 25 ml of 0.2%',
      'Colour Doppler; monitoring and the toxicity kit within reach',
    ],
    landmarks: `<p><strong>Don’t use “mid-thigh” as a surface marker.</strong> Measured with ultrasound, the midpoint between the ASIS and the patella lies <strong>proximal</strong> to the start of the adductor canal in everyone, on average by about 5 cm: a mid-thigh injection is a femoral triangle block. Find the levels on the scan instead.</p>
<ul><li><strong>Start</strong> transverse on the anteromedial thigh over the femoral artery (or trace it down from the groin with colour Doppler).</li>
<li><strong>Slide distally</strong>: sartorius drifts medially across the artery. Watch its <strong>medial border</strong>.</li>
<li><strong>The apex</strong> of the femoral triangle is where the medial border of sartorius meets the <strong>medial border of adductor longus</strong>. Above it: femoral triangle. Below it: adductor canal.</li>
<li><strong>The adductor hiatus</strong> is where the artery dives deep, away from sartorius, towards the popliteal fossa: the distal end of the canal.</li></ul>
<p>Name and record the block by where the tip sits relative to the apex, not by habit.</p>`,
    approach: `<p><strong>In-plane, lateral to medial</strong>, through sartorius. The deep fascia of sartorius tents, then pops. Stop with the tip <strong>deep to sartorius, lateral to the artery</strong> (in the canal: just under the vastoadductor membrane, anterolateral to the artery). Aspirate, inject 1–2 ml and watch it spread around the artery before giving the rest.</p>
<p>You don’t need to see the saphenous nerve: it often appears only after the first millilitres. <strong>Out-of-plane</strong> through sartorius also works and suits a catheter (walk the tip down with 0.5–1 ml hydrodissection).</p>`,
    sonoanatomy: `<p>Labels for the exam: sartorius (roof), vastus medialis (lateral), adductor longus (medial, above the apex) or adductor magnus (medial, in the canal), femoral artery, femoral vein (deep to the artery), saphenous nerve, nerve to vastus medialis, vastoadductor membrane (in the canal). The artery is usually 2–3 cm deep (up to 4 cm or more in large thighs).</p>
<p><strong>Superficial to deep, just above the apex:</strong> skin, subcutaneous fat, fascia lata, <strong>sartorius</strong>, its deep fascia, then the <strong>saphenous nerve</strong> lateral to the <strong>femoral artery</strong>, with the <strong>femoral vein</strong> deep to the artery; <strong>vastus medialis</strong> laterally (the nerve to vastus medialis at its medial edge), <strong>adductor longus</strong> then adductor magnus medially and deep; the femur deep and lateral.</p>
<p><strong>In the canal:</strong> skin, fat, fascia lata, sartorius, the <strong>vastoadductor membrane</strong>, the saphenous nerve (anteromedial to the artery), the femoral artery, the femoral vein (posterior, slightly lateral), then adductor magnus and the femur.</p>`,
    target: `<p><strong>Correct:</strong> sartorius lifts off the artery and fluid spreads over and around it, outlining the saphenous nerve. <strong>Wrong:</strong> a streak between the fibres of sartorius (intramuscular: advance through its deep fascia); a swelling in vastus medialis (too lateral and deep); fluid that vanishes (intravascular: stop and aspirate).</p>
<p><strong>Level matters.</strong> Too proximal (high in the triangle) or too much volume reaches the nerves to the vasti and weakens the quadriceps. Too distal, near the hiatus, the saphenous nerve may already have crossed to the <strong>medial</strong> side of the artery, and the vessels dive deep.</p>`,
    dose: {
      html: '<span class="tb-dose-v">10 ml</span> of <span class="tb-dose-v">0.4%</span> ropivacaine (40 mg), single shot',
      note: '<strong>TKR, three targets: 25 ml of 0.2% ropivacaine (50 mg)</strong>: saphenous nerve 10 ml, nerve to vastus medialis 10 ml, anterior femoral cutaneous nerves 5 ml. The saphenous nerve is purely sensory, so a dilute solution is enough: for a <strong>pure saphenous (sensory) block</strong>, 0.25% is enough (outside the department dose above). More volume does not keep the block in the canal or spare the quadriceps better: where you inject matters more than how much.',
    },
    coverage: {
      map: acbCoverageMap,
      side: 'unilateral',
      views: ['front'],
      areas: [
        { zones: ['saphenous'], density: 'dense' },
        { zones: ['knee-ant'], density: 'moderate' },
      ],
      summary: 'Medial knee, leg and ankle to the medial foot (saphenous); the anteromedial knee joint. Quadriceps largely spared.',
      mechanism: `<p>The <strong>saphenous nerve</strong> (the longest branch of the femoral nerve, L3–L4) runs with the femoral artery through the femoral triangle and the adductor canal, crossing <strong>over the front of the artery from lateral to medial</strong>. It leaves the canal through the vastoadductor membrane, gives the <strong>infrapatellar branch</strong> to the front and inner side of the knee and continues down the medial leg with the great saphenous vein.</p>
<p>The <strong>nerve to vastus medialis</strong> runs lateral to it in the femoral triangle and supplies the superomedial knee capsule as well as the muscle. A <strong>distal</strong> canal injection can also run through the hiatus into the popliteal fossa: in cadavers, 10 ml in the distal canal stained the popliteal plexus and the genicular branch of the posterior obturator nerve in every specimen, while femoral triangle injections did not reach the fossa.</p>`,
      density: `<p>Good analgesia for the <strong>anteromedial</strong> knee. In volunteers, quadriceps strength and balance stayed close to baseline after an adductor canal block, but fell to about a tenth of baseline after a femoral nerve block. Motor sparing is <strong>relative</strong>: a proximal or large-volume injection can weaken vastus medialis. Test quadriceps strength before the first walk.</p>
<p>It is <strong>not</strong> the same as a femoral nerve block: after knee replacement with an adductor canal block in place, a femoral nerve block still lowered pain clearly in a small blinded trial. Residual anterior or lateral pain usually means a coverage gap, not a failed block.</p>`,
      misses: `<ul><li><strong>The superolateral knee</strong> (nerves to vastus lateralis and vastus intermedius, superolateral genicular nerve).</li><li><strong>The midline incision skin</strong> (intermediate and medial femoral cutaneous nerves): add the third, superficial target, or infiltration.</li><li><strong>The posterior capsule</strong>: add <a href="#ch-ipack">iPACK</a> or surgical infiltration (a distal canal injection reaches it sometimes).</li><li><strong>The lateral knee</strong> (common peroneal branches).</li></ul>`,
    },
    complications: `<ul><li><strong>Quadriceps weakness</strong> (proximal injection, large volume, spread to the nerves to the vasti): falls risk. Supervise the first walk.</li><li><strong>Vascular puncture or intravascular injection</strong>: femoral artery and vein, the descending genicular artery near the distal canal. Colour Doppler, aspirate, aliquots.</li><li><strong>Local anaesthetic toxicity</strong>, especially with bilateral blocks and the surgeon’s infiltration: count every milligram.</li><li><strong>Nerve injury</strong> (rare) and <strong>saphenous neuropathy</strong>, which may also come from the surgery or the tourniquet. Document a neurological exam.</li><li><strong>Catheters</strong>: dislodgement, leak, infection.</li></ul>`,
    pearls: [
      'Apex = medial border of sartorius meets medial border of adductor longus.',
      '“Mid-thigh” is usually above the apex: a femoral triangle block.',
      'You don’t need to see the nerve: fluid around the artery, deep to sartorius.',
      'Sartorius must lift. A streak in the muscle = intramuscular.',
      'Femoral nerve → femoral triangle → adductor canal is a continuum: the lower you go, the less motor block and the less joint cover.',
      'Too distal, the nerve may be medial to the artery: aim for the artery’s roof.',
      'Site matters more than volume.',
      'It covers the anteromedial knee, not the whole knee: plan the rest.',
    ],
    sections: [
      {
        id: 'canal', title: 'Femoral triangle or adductor canal?',
        html: `<p>The <strong>2024 ASRA-ESRA consensus</strong> on nomenclature defines a <strong>femoral triangle block</strong> as an injection proximal to the apex of the femoral triangle, and an <strong>adductor canal block</strong> as one between the apex and the adductor hiatus. The panel could not agree on splitting the femoral triangle into proximal and distal parts, so record the level you actually injected at.</p>
<ul><li><strong>Femoral triangle (distal, just above the apex):</strong> catches the saphenous nerve <em>and</em> the nerve to vastus medialis; often better anteromedial joint cover. A little more quadriceps risk the higher you go.</li>
<li><strong>Adductor canal (below the apex):</strong> the purest saphenous block; the vastoadductor membrane roofs the artery and the nerve lies anteromedial to it. Distal injections can reach the popliteal plexus through the hiatus.</li>
<li><strong>Volume does not decide the compartment.</strong> On MRI in volunteers, injectate from the canal ran back up into the femoral triangle in about half of them at 10, 15 and 20 ml alike; about 20 ml was needed to fill the canal distally in nearly everyone; and 10 versus 30 ml of 0.1% ropivacaine made no measurable difference to quadriceps strength.</li>
<li><strong>Catheters:</strong> in a multicentre trial, catheters placed in the canal or in the femoral triangle after knee replacement gave the same mobility, pain and opioid use.</li></ul>
<p>Practise the canal-level injection here: the vastoadductor membrane, the crossed nerve and the descending genicular artery.</p>`,
        render: extraScan(SCENES.acb, 'acb-canal'),
      },
      {
        id: 'tkr', title: 'Knee replacement: the three-target technique',
        html: `<p>A single injection low in the femoral triangle leaves two gaps for a knee replacement: the <strong>superomedial capsule</strong> (if the nerve to vastus medialis is missed) and the <strong>midline incision skin</strong> (the intermediate and medial femoral cutaneous nerves, which run superficial to sartorius or high in the triangle). In volunteers, a proximal femoral triangle injection plus a block of the intermediate femoral cutaneous nerve above sartorius numbed the whole incision line in 15 of 20, while a distal injection left a gap over the anteromedial knee in most.</p>
<p>The department technique gets the same cover from <strong>one lateral skin entry near the apex</strong>: the redirected injection catches the nerve to vastus medialis (the superomedial capsule), and a separate superficial injection catches the cutaneous nerves to the incision. Three tip positions, deep to superficial (choose “TKR 1, 2, 3” in the scan viewer above):</p>
<ol><li><strong>Saphenous nerve</strong>: deep to sartorius, lateral to the artery. <strong>10 ml</strong>.</li>
<li><strong>Nerve to vastus medialis</strong>: withdraw and redirect laterally, between sartorius and vastus medialis. <strong>10 ml</strong>.</li>
<li><strong>Anterior femoral cutaneous nerves</strong>: withdraw to just under fascia lata, superficial to sartorius. <strong>5 ml</strong>.</li></ol>
<p>Total <strong>25 ml of 0.2% ropivacaine (50 mg)</strong>. Add <a href="#ch-ipack">iPACK</a> for the posterior capsule if the surgeon does not infiltrate it.</p>
<p>To watch it animated, choose the <strong>TKR</strong> tab in the animation at the top of this chapter, or step through <a href="#adductor-canal-inj-tkr1">TKR 1–3</a> in the scan viewer.</p>`,
      },
      {
        id: 'catheter', title: 'Catheters',
        html: '<p>Place the needle deep to sartorius (or under the vastoadductor membrane), open the space with 5 ml, thread the catheter 3–5 cm past the tip, then inject through it while scanning to confirm the spread around the artery. An out-of-plane approach from cranial points the catheter down the canal. Fix it well. In knee replacement with good infiltration and multimodal analgesia, a continuous infusion has <strong>not</strong> added consistent benefit over a single shot (PROSPECT does not recommend it there). Keep catheters for selected patients: opioid tolerance, revision surgery, or when infiltration is not done. Set the infusion with your pain service.</p>',
      },
      {
        id: 'popliteal-plexus', title: 'Popliteal plexus block (from the distal canal)',
        html: `<p>A way to reach the <strong>posterior capsule from the front</strong>, with the patient supine and no leg lift:</p>
<ol><li>From the adductor canal view, slide <strong>distally</strong> until the femoral artery starts to <strong>dive deep</strong> away from sartorius towards the adductor hiatus, between vastus medialis and adductor magnus.</li>
<li>In-plane, lateral to medial through sartorius, place the tip <strong>beside the artery just before it enters the hiatus</strong>.</li>
<li>Inject about <strong>10 ml</strong> of long-acting local anaesthetic (trials used 10–15 ml) and watch it track along the artery towards the hiatus.</li></ol>
<p>The fluid runs through the hiatus to the popliteal plexus (tibial and posterior obturator branches). It also blocks the saphenous nerve, but not the nerve to vastus medialis: pair it with a femoral triangle injection for the front of the knee.</p>`,
      },
      {
        id: 'nerve-stim', title: 'Nerve stimulator check',
        html: '<p>Optional, but useful when the view is poor. The <strong>saphenous nerve is purely sensory</strong>: it gives no twitch (a stimulator may give tingling down the medial leg in an awake patient). A <strong>vastus medialis twitch</strong> (the patella pulled up and inwards) means the tip is at the <strong>nerve to vastus medialis</strong>: that is the right place for TKR target 2, but too lateral for a pure saphenous block. A strong whole-quadriceps twitch means you are too proximal, near the femoral nerve trunk or the nerves to the other vasti.</p>',
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Choosing the level.</strong> For knee replacement, many experts now prefer the <strong>distal femoral triangle</strong> (just above the apex) to the canal: it catches the nerve to vastus medialis. For a pure saphenous block (medial ankle with a popliteal block), go into the canal.</li>
<li><strong>Rescue on the ward.</strong> A single shot works as a rescue block for severe pain the day after a knee replacement: good for rest pain, less so for active flexion. Check what was given in theatre and the total dose first.</li>
<li><strong>ACL reconstruction with a hamstring graft.</strong> The harvest incision over the pes anserinus is in saphenous territory, but the tendon-stripping track in the posteromedial thigh is not (semitendinosus: sciatic; gracilis: obturator), and the infrapatellar branch can be cut by the incision. Expect some breakthrough pain and plan infiltration.</li>
<li><strong>Bilateral knees.</strong> Use the dilute solution on both sides and add up every dose, including the surgeon’s infiltration (often 300 mg of ropivacaine or more on its own).</li>
<li><strong>Difficult views.</strong> Large thighs: lower the frequency, increase depth, use the artery and Doppler as your guide. The nerve brightens after the first 1–2 ml. A vein lying superficial to the artery distally is not unusual: Doppler before every pass.</li>
<li><strong>Anticoagulated patients.</strong> This is a moderately deep, compressible site, but it is close to large vessels: follow your society guideline and weigh the benefit.</li>
<li><strong>Deeper options.</strong> A <strong>lumbar plexus (psoas) block</strong>, including the ultrasound “shamrock” view, blocks the femoral, obturator and lateral femoral cutaneous nerves at their origin, and with a sciatic block gives a whole-leg block. It is a deep block with risks of epidural spread, retroperitoneal haematoma and toxicity, and it weakens the quadriceps: it has little place in modern knee surgery.</li>
<li><strong>Need more?</strong> Lateral knee pain points to the nerves to vastus lateralis and intermedius or the superolateral genicular nerve: consider <a href="#ch-genicular">genicular blocks</a>. Posterior pain: <a href="#ch-ipack">iPACK</a>.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>Naming.</strong> The 2024 ASRA-ESRA consensus separates femoral triangle and adductor canal blocks by the apex; trials before it often called mid-thigh injections “adductor canal” blocks, so read older papers with that in mind.</li>
<li><strong>More is not always better.</strong> A 2022 randomised trial added iPACK, repeated adductor canal injections, dexmedetomidine, ketamine and extra dexamethasone to an already strong plan (spinal morphine, periarticular infiltration, dexamethasone, single-shot adductor canal block): no less opioid, no better recovery, and more hypotension.</li>
<li><strong>The popliteal plexus block.</strong> Injecting in the distal canal near the hiatus aims at the posterior capsule from the front; a 2025 trial found it non-inferior to iPACK for posterior knee pain after knee replacement, and quicker to do.</li>
<li><strong>Prolonging a single shot.</strong> Perineural or IV dexamethasone lengthens the block; liposomal bupivacaine has not shown a clear advantage over plain local anaesthetic in knee replacement.</li>
<li><strong>Cryoneurolysis</strong> of the infrapatellar branch of the saphenous nerve and the anterior femoral cutaneous nerves before knee replacement is being studied; results so far are mixed.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'MMed OSCE 2023',
        q: '<p>Describe how you would perform an adductor canal block for analgesia after a total knee replacement. What does it cover, and what does it miss?</p>',
        points: [
          'Sensory block of the saphenous nerve: medial leg from the anteromedial knee to the medial malleolus; part of the anteromedial knee joint. Motor sparing (quadriceps largely preserved).',
          'Indications: knee replacement and ACL reconstruction; medial leg surgery; with a popliteal sciatic block for foot and ankle surgery.',
          'Misses the superior and anterolateral knee (nerves to vastus intermedius and lateralis, intermediate and medial femoral cutaneous nerves); may catch the nerve to vastus medialis.',
          'Supine, thigh abducted and externally rotated; linear probe; 80 mm echogenic needle.',
          'Find the apex: medial border of sartorius meets medial border of adductor longus (femoral triangle ends, canal starts).',
          'Structures: femoral artery and vein, saphenous nerve, sartorius (roof), vastus medialis (lateral), adductor longus or magnus (medial), vastoadductor membrane.',
          'In-plane, lateral to medial; tip deep to sartorius, lateral to the artery; the nerve need not be seen and often appears after the local anaesthetic.',
          'Go more distal to minimise vastus medialis block; too proximal or too much volume gives motor block; too distal, the nerve may cross to the medial side of the artery. A dilute solution is enough for a sensory nerve.',
          'Department dose: 10 ml of 0.4% ropivacaine; three-target TKR technique 25 ml of 0.2%.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>What are the boundaries and contents of the adductor canal?</p>',
        points: [
          'From the apex of the femoral triangle to the adductor hiatus in adductor magnus; on the medial side of the middle third of the thigh.',
          'Roof (anteromedial): sartorius, over the vastoadductor membrane. Lateral: vastus medialis. Posterior (floor): adductor longus above, adductor magnus below.',
          'Contents: femoral artery and vein (the vein posterior to the artery), the saphenous nerve (crossing the artery from lateral to medial), and the nerve to vastus medialis in its upper part.',
          'Below the hiatus the vessels become the popliteal artery and vein.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Outline an evidence-based analgesic plan for a primary total knee replacement under spinal anaesthesia.</p>',
        points: [
          'PROSPECT: paracetamol and an NSAID or COX-2 inhibitor (before or during surgery, continued after); a single intraoperative IV dose of dexamethasone; a single-shot adductor canal block; periarticular local infiltration by the surgeon.',
          'Not recommended: femoral nerve block (quadriceps weakness, falls), sciatic block, epidural, gabapentinoids, continuous adductor canal infusion (inconsistent benefit). Intrathecal morphine 100 micrograms only when both adductor canal block and infiltration are impossible.',
          'iPACK and genicular blocks: promising motor-sparing additions, mainly useful when infiltration is not done; limited evidence.',
          'Opioids for rescue only. Early mobilisation; check quadriceps strength before the first walk.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ iPACK
  {
    id: 'ipack',
    kicker: 'Knee · Posterior capsule',
    title: 'iPACK block',
    summary: `<strong>iPACK</strong> stands for infiltration of the interspace between the popliteal artery and the capsule of the knee: local anaesthetic in the fat <strong>between the popliteal artery and the back of the femur</strong>, just above the condyles. It bathes the articular branches of the <strong>popliteal plexus</strong> (from the tibial nerve and the posterior division of the obturator nerve) to the <strong>posterior knee capsule</strong>, while the main tibial and common peroneal nerve trunks lie superficial and away from it. Posterior knee analgesia, usually without foot drop.`,
    indications: [
      'TKR: posterior pain',
      'When infiltration is not done',
      'Posterior capsular surgery',
      'Instead of a sciatic block',
    ],
    glance: {
      position: 'Prone, or supine with the knee bent and the hip turned out',
      probe: 'Linear (curvilinear in large legs), transverse in the popliteal fossa just above the condyles',
      needle: '80–100 mm echogenic, in-plane, medial to lateral',
      dose: '20 ml of 0.2% ropivacaine (40 mg)',
      covers: 'Posterior knee capsule. No skin. Quadriceps and foot usually spared.',
    },
    scene: SCENES.ipack,
    position: '<p><strong>Supine</strong>: knee flexed (about 45–90 degrees), hip externally rotated, so the probe reaches the back of the knee and the needle the medial side; an assistant or a wedge holds the leg. <strong>Prone</strong> or <strong>lateral</strong> also work and give a flatter needle path. In supine knee replacement lists it can be done after the spinal, before draping.</p>',
    equipment: [
      'Linear probe; curvilinear if the femur is deeper than about 4–5 cm',
      '80–100 mm echogenic needle (the path is long and nearly horizontal)',
      '20 ml of 0.2% ropivacaine',
      'Colour Doppler: popliteal and genicular vessels',
    ],
    landmarks: `<p>Start <strong>transverse in the popliteal crease</strong>: two bright humps of bone (the <strong>femoral condyles</strong>) with the popliteal artery between them, in the intercondylar notch. Slide <strong>proximally about a finger’s breadth</strong> until the condyles merge into the <strong>flat back of the femoral shaft</strong>. That is the level: the artery sits on fat over flat bone, and the space under it is easy to reach.</p>
<p>Too low (at the condyles): the needle has to clear bone and the capsule. Too high: the space is deeper and fluid is more likely to reach the sciatic nerve or its branches.</p>`,
    approach: `<p><strong>In-plane, medial to lateral</strong> from the medial (anteromedial) side of the knee, passing <strong>deep to the popliteal artery, just above the femur</strong>, until the tip is <strong>1–2 cm beyond the lateral edge of the artery</strong>. Inject in aliquots <strong>while withdrawing</strong> towards the medial side, so the whole interspace fills.</p>
<p>Keep the tip <strong>deep</strong>: the tibial nerve lies superficial to the vessels and the common peroneal nerve laterally under biceps femoris.</p>`,
    sonoanatomy: `<p>Labels to know: semimembranosus and semitendinosus (medial), biceps femoris (lateral), tibial nerve (superficial, central), common peroneal nerve (lateral), popliteal vein, popliteal artery (deepest of the bundle), femur (flat bony line). The vein is compressible; the artery pulses and lies deeper and usually more medial. The nerves look <strong>bright and honeycombed</strong> (fascicles) against the popliteal fat.</p><p><strong>Superficial to deep, in the middle of the fossa:</strong> skin, subcutaneous fat, popliteal fascia, popliteal fat with the <strong>tibial nerve</strong> (the common peroneal nerve laterally along biceps), the <strong>popliteal vein</strong>, the <strong>popliteal artery</strong>, the fat between the artery and the bone (the <strong>target</strong>), then the <strong>femur</strong>. Semimembranosus medially, biceps femoris laterally.</p>`,
    target: `<p><strong>Correct:</strong> the artery lifts off the bone and fluid spreads <strong>along the back of the femur</strong> from lateral to medial, under the vessels. <strong>Wrong:</strong> fluid rising around the <strong>tibial nerve</strong> (too superficial: foot weakness and numbness), a swelling in semimembranosus or biceps (intramuscular), or nothing visible (intravascular: the genicular vessels run here).</p>`,
    dose: {
      html: '<span class="tb-dose-v">20 ml</span> of <span class="tb-dose-v">0.2%</span> ropivacaine (40 mg)',
      note: 'Trials have used 15–20 ml, mostly 0.2–0.25% ropivacaine. Add it to the rest of the plan: with the three-target adductor canal technique (25 ml of 0.2%) the total is 90 mg, before any surgical infiltration.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['back'],
      areas: [{ zones: ['knee-post'], density: 'moderate' }],
      summary: 'The posterior knee capsule. No skin, no motor block of the quadriceps; the foot is usually spared.',
      mechanism: `<p>The posterior capsule is supplied by the <strong>popliteal plexus</strong>: articular branches of the <strong>tibial nerve</strong> (across the whole posterior capsule) and the genicular branch of the <strong>posterior division of the obturator nerve</strong> (superomedially), which runs down with the femoral and popliteal artery; in some people, common peroneal or sciatic branches join laterally. The branches run around the popliteal vessels and the middle genicular artery to the capsule. Fluid in the interspace reaches them before they enter the joint.</p>`,
      density: `<p>It reduces <strong>posterior knee pain</strong> in the first hours: in a placebo-controlled trial added to an adductor canal block, posterior knee pain at 6 hours fell from nearly half of patients to about a fifth, with only marginal effects on other outcomes. A meta-analysis found a benefit from adding iPACK to an adductor canal block <strong>only when periarticular infiltration was not given</strong>: then pain was lower for up to a day and early function better, though opioid use did not fall.</p>
<p>In cadavers, the fluid spread widely through the popliteal fossa and consistently surrounded the middle genicular artery, but reached the tibial nerve in about a third and possibly the common peroneal nerve in some.</p>`,
      misses: `<ul><li><strong>The anterior knee</strong>: it needs an adductor canal or femoral triangle block (or infiltration).</li><li><strong>The skin</strong>.</li><li><strong>The lateral capsule</strong>, partly (common peroneal branches).</li></ul>`,
    },
    complications: `<ul><li><strong>Tibial or common peroneal nerve block</strong> from spread: foot drop or numbness that confuses the post-operative neurological check. Examine and document before and after.</li><li><strong>Vascular puncture or intravascular injection</strong>: popliteal artery and vein, genicular vessels. Doppler, aspirate, aliquots.</li><li><strong>Nerve injury</strong> (rare): keep the tip deep, away from the tibial nerve.</li><li><strong>Local anaesthetic toxicity</strong> when added to other blocks and infiltration.</li></ul>`,
    pearls: [
      'Condyles in the crease, then one finger up: flat femur.',
      'Under the artery, on the bone. Not near the nerve.',
      'Tip 1–2 cm past the artery’s lateral edge; inject as you withdraw.',
      'Fluid climbing around the tibial nerve = too superficial.',
      'iPACK for the back, adductor canal for the front: it never works alone.',
      'If the surgeon infiltrates the back of the knee, iPACK adds little.',
      { safety: true, html: 'Check and write down foot movement after the block.' }, // safety: shown at MO level
    ],
    sections: [
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Who benefits?</strong> The case for iPACK is strongest when the surgeon does <strong>not</strong> infiltrate the posterior capsule, in patients with marked posterior pain (flexion contracture, posterior capsular release), or where infiltration is limited. PROSPECT did not recommend it for routine knee replacement because procedure-specific evidence was limited.</li>
<li><strong>Medial probe approach.</strong> With the patient supine, the probe can sit on the <strong>medial distal thigh</strong> just above the knee, looking across to the artery and the femur; the needle then runs in-plane from anteromedial to posterolateral. Same target, no need to lift the leg.</li>
<li><strong>Foot drop after knee replacement.</strong> The differential is iPACK spread, common peroneal stretch (valgus correction, flexion contracture), a tight dressing or splint, haematoma, and the tourniquet. Document the pre-block and post-block examination, and use dilute local anaesthetic so a surgical palsy is not masked for long.</li>
<li><strong>Distal versus proximal level.</strong> Injecting at or just above the condyles keeps the fluid closer to the capsule and further from the sciatic trunk than a higher injection.</li>
<li><strong>Obese legs.</strong> A curvilinear probe and a longer needle; the prone or lateral position gives a flatter needle path.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>Popliteal plexus block</strong> from the distal adductor canal: non-inferior to iPACK for posterior knee pain after knee replacement in a 2025 trial, faster to perform, with motor function preserved.</li>
<li><strong>Genicular plus iPACK</strong>: the “all-articular” approach (anterior quadrants plus posterior capsule, no skin or motor block) is being tested against adductor canal combinations and infiltration.</li>
<li><strong>SPANK</strong> (sensory posterior articular nerves of the knee), a posterior capsular injection above the medial femoral condyle from the front, gave less analgesia than iPACK in one trial.</li>
<li><strong>Where the evidence sits.</strong> Pooled trials: when there is no periarticular infiltration, adding iPACK to an adductor canal block lowers pain for up to a day and improves early function, without reducing opioid use; with infiltration it adds nothing measurable.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>A patient complains of pain at the back of the knee after a total knee replacement despite a working adductor canal block. Explain why, and how you could treat it without causing foot drop.</p>',
        points: [
          'The adductor canal block covers the saphenous nerve and (higher) the nerve to vastus medialis: the anteromedial knee only.',
          'The posterior capsule is supplied by the popliteal plexus: articular branches of the tibial nerve and the posterior division of the obturator nerve (with common peroneal or sciatic branches laterally in some).',
          'A sciatic block would cover it but causes foot drop and numbness, delaying mobilisation and masking a common peroneal nerve palsy.',
          'iPACK: transverse in the popliteal fossa just above the condyles; in-plane from medial; tip between the popliteal artery and the femur, 1–2 cm past the artery; 15–20 ml of dilute ropivacaine, injected while withdrawing.',
          'Risks: spread to the tibial or common peroneal nerve, vascular puncture, toxicity. Alternatives: surgeon’s posterior capsular infiltration, popliteal plexus block via the distal adductor canal.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Describe the sonoanatomy of the popliteal fossa at the level of an iPACK block.</p>',
        points: [
          'Transverse probe a finger’s breadth above the popliteal crease, where the condyles merge into the flat back of the femoral shaft.',
          'Medial: semimembranosus, with the semitendinosus tendon. Lateral: biceps femoris.',
          'Central, superficial to deep: tibial nerve, popliteal vein, popliteal artery, then fat on the femur. Common peroneal nerve laterally beside biceps.',
          'Target: the fat between the popliteal artery and the femur.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ genicular nerves
  {
    id: 'genicular',
    kicker: 'Knee · Anterior capsule',
    title: 'Genicular nerve blocks',
    summary: `Small volumes of local anaesthetic on the bone <strong>beside the genicular arteries</strong>, where the femoral and tibial shafts flare into the condyles. They catch the articular branches to the <strong>anterior knee capsule</strong>: the classic three targets are the <strong>superomedial, superolateral and inferomedial</strong> genicular nerves. Purely articular: <strong>no skin, no motor block</strong>.`,
    indications: [
      'TKR, with adductor canal block',
      'Osteoarthritis: diagnostic block',
      'Unfit for knee replacement',
      'No motor block allowed',
    ],
    glance: {
      position: 'Supine, knee slightly bent over a pillow',
      probe: 'Linear, coronal (along the limb) over each target',
      needle: '50–80 mm, in-plane or out-of-plane, to bone beside the artery',
      dose: '4–5 ml of 0.2% ropivacaine per target (five targets: 20–25 ml, 40–50 mg)',
      covers: 'Anterior knee capsule by quadrant. No skin, no motor block.',
    },
    scene: SCENES.smgn,
    position: '<p>Supine, with a pillow under the knee (slight flexion opens the medial and lateral approaches). Stand on the side of the target; move the screen as you go round the knee.</p>',
    equipment: [
      'High-frequency linear probe; shallow depth (targets 1–2 cm deep)',
      '50–80 mm needle (22 G)',
      '0.2% ropivacaine: 4–5 ml per target',
      'Colour Doppler (the genicular arteries are the landmarks)',
    ],
    landmarks: `<p>Each target is where the <strong>shaft (metaphysis) meets the condyle (epiphysis)</strong>, the bone sloping up into the bump of the condyle, with the genicular artery on the periosteum:</p>
<ul><li><strong>Superomedial (SMGN):</strong> probe coronal over the medial epicondyle, then slide proximally; the artery lies between the deep fascia of vastus medialis and the femur, just in front of the adductor tubercle.</li>
<li><strong>Superolateral (SLGN):</strong> coronal over the lateral epicondyle, slide proximally; the artery lies between vastus lateralis (under the iliotibial band) and the femur.</li>
<li><strong>Inferomedial (IMGN):</strong> coronal over the medial tibial condyle, slide distally; the artery runs on the bone <strong>deep to the medial collateral ligament</strong>.</li></ul>`,
    approach: '<p><strong>In-plane</strong> along the probe (cranial to caudal for the femoral targets, caudal to cranial for the tibial one) or <strong>out-of-plane</strong> from anterior. Go to <strong>periosteum beside the artery</strong>, touch bone, withdraw 1 mm, aspirate, inject.</p>',
    sonoanatomy: `<p>The view is simple, and the nerves are usually too small to see: <strong>the artery is the marker</strong>. Superficial to deep:</p><ul><li><strong>Superomedial:</strong> skin, subcutaneous fat, vastus medialis and its deep fascia, the superior medial genicular artery (and nerve) on the periosteum, the femur rising into the medial epicondyle.</li><li><strong>Superolateral:</strong> skin, fat, iliotibial band, vastus lateralis, the superior lateral genicular artery on the periosteum, the femur rising into the lateral epicondyle.</li><li><strong>Inferomedial:</strong> skin, fat, medial collateral ligament, the inferior medial genicular artery on the periosteum, the tibia sloping from the condyle into the shaft.</li></ul>`,
    target: '<p><strong>Correct:</strong> fluid spreads along the periosteum around the artery and lifts the muscle or ligament off the bone. <strong>Wrong:</strong> a swelling within the muscle (short of bone), or injection into the suprapatellar recess or joint (a fluid-filled pocket opening anteriorly).</p>',
    dose: {
      html: '<span class="tb-dose-v">4–5 ml</span> of <span class="tb-dose-v">0.2%</span> ropivacaine per target',
      note: 'Three classic targets: 12–15 ml (24–30 mg). Five targets (adding the nerve to vastus intermedius and the recurrent peroneal nerve): 20–25 ml (40–50 mg); the trial against infiltration used 4 ml per nerve, 20 ml in all. Trials for knee replacement have used 4 ml of 0.2% ropivacaine per nerve, or 5 ml of 0.25% bupivacaine at each of three. For chronic pain diagnostic blocks, 1–2 ml per target is usual, so that only the target is tested.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front'],
      areas: [{ zones: ['knee-ant'], density: 'moderate' }],
      summary: 'The anterior knee capsule, quadrant by quadrant. No skin and no motor block.',
      mechanism: `<p>In cadavers the anterior capsule is supplied in <strong>four quadrants with little overlap</strong>: superomedial (nerve to vastus medialis, nerve to vastus intermedius, superomedial genicular nerve), superolateral (nerve to vastus lateralis, nerve to vastus intermedius, superolateral genicular nerve, branches of the common peroneal), inferolateral (inferolateral genicular and recurrent peroneal nerves) and inferomedial (inferomedial genicular nerve, sometimes the infrapatellar branch of the saphenous). Apart from the nerves to vastus lateralis and medialis, the articular branches run at the <strong>periosteum</strong>, which is why a small volume on bone works.</p>`,
      density: '<p>Each injection numbs mainly its own quadrant. Added to an adductor canal block and iPACK in a placebo-controlled trial, three-target genicular blocks cut opioid use over the first day by more than half. Five-target genicular blocks gave pain relief no worse than surgical infiltration with a fraction of the local anaesthetic.</p>',
      misses: `<ul><li><strong>The skin incision</strong>.</li><li><strong>The posterior capsule</strong> (add iPACK).</li><li>With the classic three: the <strong>inferolateral quadrant</strong> and the <strong>nerve to vastus intermedius</strong> (suprapatellar).</li></ul>`,
    },
    complications: `<ul><li><strong>Genicular artery puncture</strong>: Doppler, aspirate; rare haematoma or pseudoaneurysm.</li><li><strong>Common peroneal nerve block</strong> if an inferolateral injection spreads back to the nerve at the fibular neck: many avoid the inferolateral target for that reason.</li><li><strong>Intra-articular injection</strong> (suprapatellar recess): strict asepsis, as for any injection near a prosthesis.</li><li><strong>Transient numbness or knee instability</strong> after diagnostic blocks.</li></ul>`,
    pearls: [
      'Shaft meets condyle; artery on bone; inject there.',
      'Find the artery with Doppler: it marks the nerve.',
      'Bone first, then 1 mm back, then inject.',
      'SMGN under vastus medialis; SLGN under vastus lateralis; IMGN under the MCL.',
      { safety: true, html: 'The inferolateral target is close to the common peroneal nerve: usually left out.' }, // safety: shown at MO level
      'No skin, no motor block: pair it with something for the incision.',
    ],
    sections: [
      {
        id: 'targets', title: 'The other targets: superolateral and inferomedial',
        html: '<p>Each classic target has the same pattern: bone sloping into the condyle, the artery on the bone, a few millilitres there. Practise the other two below.</p>',
        render: (sec) => {
          extraScan(SCENES.slgn, 'gen-slgn')(sec);
          extraScan(SCENES.imgn, 'gen-imgn')(sec);
        },
      },
      {
        id: 'expanded', title: 'Expanded and revised targets',
        html: `<p>Anatomical work since 2018 showed that the classic targets miss several branches, and that the old bony targets for the superomedial and superolateral nerves often sat well away from the nerve (in one cadaver study, nearly 2 cm on average for the superomedial nerve). The revised and expanded sets add:</p>
<ul><li><strong>Nerve to vastus intermedius</strong>: on the front of the femur in the midline, a few fingerbreadths above the patella, deep to quadriceps (probe transverse, in-plane).</li>
<li><strong>Recurrent peroneal (fibular) nerve</strong>: on the anterolateral tibia, below the lateral tibial condyle and in front of the fibular head, with the anterior tibial recurrent artery.</li>
<li><strong>Infrapatellar branch of the saphenous nerve</strong>: subcutaneous, medial to the patellar tendon (mainly for chronic pain).</li>
<li><strong>Revised superomedial and superolateral sites</strong>, placed on the courses the nerves were actually found to take; in cadavers they captured the nerves far more accurately than the classic sites.</li></ul>
<p>The inferolateral genicular nerve runs close to the common peroneal nerve near the fibular head; many chronic pain services do not target it, to avoid a foot drop.</p>`,
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Overlap with the adductor canal block.</strong> The superomedial quadrant is shared by the nerve to vastus medialis (caught by a distal femoral triangle injection) and the superomedial genicular nerve. With a good femoral triangle block, the lateral and inferomedial targets add the most.</li>
<li><strong>Chronic knee pain.</strong> A diagnostic genicular block (small volume of local anaesthetic, ± steroid) predicts who may benefit from <strong>radiofrequency ablation</strong>. Steroid prolongs relief in some. Expect relief for months, not years; it can be repeated.</li>
<li><strong>Old prosthesis, new pain.</strong> Exclude infection and loosening before denervating a painful replacement.</li>
<li><strong>Ultrasound or fluoroscopy?</strong> Ultrasound shows the artery and needs no radiation; fluoroscopy uses bony targets. With either, use the revised targets.</li>
<li><strong>Time.</strong> Three to five targets take longer than infiltration; in a busy arthroplasty list, agree with the surgeon who does what.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>Genicular blocks versus infiltration.</strong> A 2023 randomised trial found five-target genicular blocks (20 ml) non-inferior to surgical infiltration (about 150 ml of dilute ropivacaine) for pain in the first day after knee replacement.</li>
<li><strong>Adding them to an adductor canal block</strong> reduced opioid use in several recent trials; combinations with iPACK aim to cover the whole capsule with no motor block.</li>
<li><strong>Ablation techniques:</strong> conventional, cooled and pulsed radiofrequency, and cryoneurolysis, for osteoarthritis pain; trials report benefit for months.</li>
<li><strong>Genicular artery embolisation</strong>, an interventional radiology treatment for painful knee osteoarthritis, is under study: it targets the same arteries that guide these blocks.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>Describe the innervation of the knee joint. Which nerves could you block to provide analgesia without motor block after a knee replacement?</p>',
        points: [
          'Hilton’s law: femoral, obturator and sciatic nerves all contribute.',
          'Anterior capsule, by quadrant: superomedial (nerves to vastus medialis and intermedius, superomedial genicular); superolateral (nerves to vastus lateralis and intermedius, superolateral genicular, common peroneal branches); inferolateral (inferolateral genicular, recurrent peroneal); inferomedial (inferomedial genicular, sometimes the infrapatellar branch of the saphenous).',
          'Posterior capsule: popliteal plexus from the tibial nerve and the posterior division of the obturator nerve; common peroneal and sciatic branches in some.',
          'Skin of the midline incision: intermediate and medial femoral cutaneous nerves, and the infrapatellar branch of the saphenous nerve.',
          'Motor-sparing options: adductor canal or femoral triangle block (saphenous, nerve to vastus medialis), iPACK (posterior capsule), genicular blocks (anterior quadrants), periarticular infiltration.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ obturator
  {
    id: 'obturator',
    kicker: 'Hip and knee · Obturator nerve',
    title: 'Obturator nerve block',
    summary: `Blocks the obturator nerve (L2–L4) either <strong>proximally</strong>, in one fascial plane deep to pectineus, or <strong>distally</strong>, at its two divisions between the adductor layers. It paralyses the <strong>hip adductors</strong>: it prevents the adductor jerk during resection of a lateral wall bladder tumour, and adds analgesia for the <strong>medial and posterior knee</strong>. Its skin territory is small and variable.`,
    indications: [
      'TURBT: lateral wall tumour',
      'TKR: posteromedial pain',
      'Adductor spasticity',
      'Above-knee amputation (with others)',
      'Chronic hip pain (diagnostic)',
    ],
    glance: {
      position: 'Supine, hip slightly abducted and externally rotated',
      probe: 'Linear, transverse on the inguinal crease medial to the femoral vein (tilted cranially for the proximal approach)',
      needle: '80 mm echogenic; in-plane (proximal: medial to lateral) or out-of-plane; a stimulator helps',
      dose: 'Proximal: 10 ml of 0.5% ropivacaine (50 mg). Distal: 5 ml per division',
      covers: 'Hip adductors (motor); variable medial thigh skin; articular branches to the hip and medial and posterior knee',
    },
    scene: SCENES.obtProx,
    position: '<p>Supine, the hip <strong>slightly abducted and externally rotated</strong>, the groin exposed. For a bladder resection, do it before positioning in lithotomy, or with the leg still accessible; the lithotomy position itself can be used for a medial (perineal) approach.</p>',
    equipment: [
      'Linear probe (curvilinear for a deep proximal target)',
      '80 mm echogenic needle; nerve stimulator (adductor twitch) recommended for the distal approach',
      'Proximal: 10 ml of 0.5% ropivacaine. Distal: 5 ml per division',
      'Colour Doppler (obturator vessels, femoral vein)',
    ],
    landmarks: `<p><strong>Proximal (interfascial) approach:</strong> transverse on the inguinal crease, find the femoral vein, slide <strong>medially onto pectineus</strong>, then <strong>tilt the probe cranially</strong> (40–50 degrees) until the bright inferior edge of the <strong>superior pubic ramus</strong> appears. Pectineus is superficial, <strong>obturator externus</strong> deep to it; the obturator nerve runs in the plane between them, often before it divides.</p>
<p><strong>Distal approach:</strong> 1–3 cm below the crease, transverse on the medial thigh: <strong>adductor longus, adductor brevis, adductor magnus</strong> from superficial to deep. Anterior division between longus (or pectineus) and brevis; posterior division between brevis and magnus.</p>`,
    approach: `<p><strong>Proximal:</strong> the original description is <strong>out-of-plane</strong> from caudal; in-plane works in either direction. The scan viewer shows <strong>in-plane medial to lateral</strong>, through adductor longus and pectineus, which keeps the needle away from the femoral vein on the lateral side of the image. Tip in the plane between pectineus and obturator externus; one injection.</p>
<p><strong>Distal:</strong> in-plane, two stops: the plane under adductor longus (anterior division), then through adductor brevis to the plane under it (posterior division). You don’t need to see the nerves: open the planes.</p>`,
    sonoanatomy: `<p>Mnemonic for the adductors from front to back: <strong>“long, brief, massive”</strong> (longus, brevis, magnus). The divisions are flat, bright, spindle-shaped structures inside the fascia between the layers. Proximally, the target is the fascial plane between pectineus and obturator externus, just below the pubic ramus.</p><p><strong>Superficial to deep, proximal view:</strong> skin, subcutaneous fat, fascia lata, <strong>pectineus</strong> (adductor longus medially, the femoral vein laterally), the fascial plane with the obturator nerve and vessels, <strong>obturator externus</strong>, then the obturator membrane, with the superior pubic ramus deep and lateral.</p><p><strong>Distal view:</strong> skin, fat, <strong>adductor longus</strong> (pectineus laterally), the anterior division, <strong>adductor brevis</strong>, the posterior division, <strong>adductor magnus</strong>.</p>`,
    target: '<p><strong>Correct:</strong> the fascial plane opens as a flat lens between the muscles. <strong>Wrong:</strong> a swelling inside a muscle (intramuscular, unreliable), fluid that disappears (obturator vessels run in the proximal plane), or high injection pressure (the tip in the nerve or on fascia).</p>',
    dose: {
      html: '<span class="tb-dose-v">10 ml</span> of <span class="tb-dose-v">0.5%</span> ropivacaine (50 mg), proximal single injection',
      note: 'Distal approach: 5 ml in each plane (10 ml in total); texts give 5–10 ml per plane. For a bladder resection, a shorter-acting solution (such as lidocaine) gives a quicker onset and a shorter-lived weak leg. For knee analgesia, a dilute ropivacaine is enough. Count it in the total with any femoral triangle block.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front', 'back'],
      areas: [
        { zones: ['obturator'], density: 'patchy' },
        { zones: ['knee-post'], density: 'patchy' },
      ],
      summary: 'The hip adductors (motor); a variable patch of distal medial thigh skin; articular branches to the medial and posterior knee (and to the hip, more likely with the proximal approach).',
      mechanism: `<p>The obturator nerve (anterior divisions of L2–L4) leaves the <strong>medial</strong> border of psoas, runs along the side wall of the pelvis next to the bladder, and leaves through the <strong>obturator canal</strong>. It usually divides in or near the canal. The <strong>anterior division</strong> supplies adductor longus, brevis and gracilis and a variable patch of medial thigh skin; the <strong>posterior division</strong> supplies adductor magnus (its adductor part) and obturator externus, and sends a genicular branch with the femoral and popliteal artery to the <strong>posterior and medial knee</strong>. The branches to the hip leave near the canal, so a distal block often misses them.</p>`,
      density: `<p><strong>Test motor function, not skin.</strong> The obturator has no cutaneous branch in more than half of people, so a numb medial thigh is neither necessary nor sufficient. A successful block cuts adductor strength by more than about 40–50% (squeezing a blood pressure cuff between the knees is a simple bedside test). The hamstring part of adductor magnus (sciatic) keeps some adduction.</p>`,
      misses: '<ul><li>The <strong>femoral and sciatic territories</strong>: it is an add-on block.</li><li>The <strong>hip joint</strong>, often, with the distal approach.</li><li>The <strong>pectineus</strong> in people with an accessory obturator nerve.</li></ul>',
    },
    complications: `<ul><li><strong>Vascular puncture</strong>: obturator vessels (proximal plane), femoral vein; haematoma. Doppler, aspirate.</li><li><strong>Intraneural injection</strong>: avoid high pressure; a stimulator or pressure monitoring helps when the nerve isn’t seen.</li><li><strong>Local anaesthetic toxicity</strong> with combined blocks.</li><li><strong>Adductor weakness</strong>: minor, but warn the patient (walking, getting out of bed).</li><li>In a bladder resection, a <strong>failed block</strong> can mean perforation.</li></ul>`,
    pearls: [
      'Long, brief, massive: anterior division under longus, posterior under brevis.',
      'Proximal: deep to pectineus, on obturator externus, below the pubic ramus.',
      'Test the adductors, not the skin.',
      { safety: true, html: 'Spinal anaesthesia does not stop the obturator jerk.' }, // safety: shown at MO level
      { safety: true, html: 'For TURBT: block before the resection, not after the first jerk.' }, // safety: shown at MO level
      'Knee: the posterior division carries the branch to the back of the knee.',
    ],
    sections: [
      {
        id: 'distal', title: 'Distal approach: the two divisions',
        html: '<p>Below the crease, the divisions lie in the fascia between the adductor layers. Block the anterior plane first, then advance to the posterior plane (choose “Posterior division” in the viewer). A stimulator gives an adductor twitch from each; trust the planes if the nerves are hard to see.</p>',
        render: extraScan(SCENES.obtDist, 'obt-distal'),
      },
      {
        id: 'turbt', title: 'Bladder tumour resection and the obturator jerk',
        html: `<ul>
<li><strong>Why it happens:</strong> the obturator nerve runs on the pelvic side wall, separated from the <strong>lateral bladder wall</strong> only by a thin layer of tissue. The resection current (especially monopolar diathermy) stimulates the nerve directly; the adductors contract violently and the thigh jerks inwards.</li>
<li><strong>Why it matters:</strong> the resectoscope moves with the patient: <strong>bladder perforation</strong>, incomplete resection, bleeding and, in theory, tumour spread outside the bladder.</li>
<li><strong>Why spinal doesn’t stop it:</strong> the stimulus is applied to the nerve itself, beyond the roots that a spinal blocks. A block of the nerve below the stimulation point does stop the impulse reaching the muscles.</li>
<li><strong>Options:</strong> obturator nerve block (proximal or distal) with spinal anaesthesia; or general anaesthesia with <strong>neuromuscular blockade</strong>; plus surgical measures: bipolar resection, lower current, a less full bladder. Tell the urologist the block is in, but agree a plan if the leg still moves.</li>
</ul>`,
      },
      {
        id: 'nerve-stim', title: 'Nerve stimulator endpoints',
        html: '<p>Start at about 1–1.5 mA (0.1 ms, 2 Hz). <strong>Adductor twitch</strong> (the thigh moves inwards; tendon of adductor longus tightens) at 0.3–0.5 mA is the endpoint. In the distal approach, a twitch from each plane confirms each division. A quadriceps twitch means you are on the femoral nerve: too lateral.</p><p><strong>Landmark techniques</strong> (historical, but still asked in exams): the <strong>classic (Labat) approach</strong> enters 1.5 cm lateral and 1.5 cm below the pubic tubercle, contacts the inferior border of the superior pubic ramus and walks off it laterally and cranially into the obturator canal. The <strong>inter-adductor approach</strong> enters behind the adductor longus tendon near the pubis and aims towards the obturator canal, using an adductor twitch. Both are blind, deep and less reliable than ultrasound.</p>',
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Knee replacement.</strong> Adding an obturator block to a femoral triangle block reduced morphine use after knee replacement in randomised trials, without worse walking scores. The posterior obturator branch is also reached by distal adductor canal spread (the popliteal plexus), which spares the hip adductors.</li>
<li><strong>Proximal or distal?</strong> Proximal: one injection, less local anaesthetic, more likely to catch the hip branch, but a steep tilt and deeper target. Distal: easier to see, two injections, often misses the hip.</li>
<li><strong>Lithotomy.</strong> For a bladder resection already in lithotomy, a medial approach close to the perineum, with the probe aimed cranially, reaches the same plane.</li>
<li><strong>Spasticity.</strong> A local anaesthetic block shows the effect of a later phenol or alcohol neurolysis (or botulinum toxin) and helps hygiene and positioning.</li>
<li><strong>Above-knee amputation under blocks.</strong> Femoral (or supra-inguinal fascia iliaca), sciatic (subgluteal or transgluteal, catching the posterior femoral cutaneous nerve), LFCN and obturator: see the <a href="../thigh/">thigh page</a>.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>Proximal approaches</strong> (the interfascial plane deep to pectineus, and its in-plane modifications) have largely replaced landmark techniques; a single injection blocks both divisions.</li>
<li><strong>Bipolar resection</strong> lowers but does not abolish the obturator jerk; blocks remain common for lateral wall tumours.</li>
<li><strong>Other blocks for the jerk</strong> (including PENG-style injections) are being compared with obturator blocks in trials.</li>
<li><strong>Naming.</strong> Following the 2024 ASRA-ESRA consensus naming template (nerve plus site), state the level you blocked at: proximal or distal obturator nerve block.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>A patient is listed for resection of a lateral wall bladder tumour under spinal anaesthesia. The urologist asks for an obturator block. Explain why, and describe the block.</p>',
        points: [
          'The obturator nerve runs on the pelvic side wall next to the lateral bladder wall; diathermy stimulates it directly, producing adductor contraction (the obturator jerk).',
          'Risks: bladder perforation, incomplete resection, bleeding.',
          'Spinal anaesthesia blocks the roots, but the stimulus is applied to the nerve distal to them, so the jerk still occurs.',
          'Options: obturator block, or general anaesthesia with neuromuscular blockade; bipolar resection and lower current help.',
          'Block: supine, hip slightly abducted and externally rotated; proximal approach deep to pectineus on obturator externus (probe on the crease, tilted cranially), or distal approach to both divisions between the adductor layers; nerve stimulator for adductor twitch.',
          'Confirm by adductor weakness, not skin numbness. Complications: vascular puncture, intraneural injection, toxicity.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Describe the course and distribution of the obturator nerve.</p>',
        points: [
          'Anterior divisions of the ventral rami of L2–L4; forms within psoas and emerges from its medial border.',
          'Along the lateral pelvic wall, through the obturator canal (with the obturator vessels) into the thigh; usually divides in or near the canal.',
          'Anterior division: between pectineus/adductor longus and adductor brevis; supplies adductor longus, brevis and gracilis; variable skin of the medial thigh; branch to the hip.',
          'Posterior division: between adductor brevis and adductor magnus; supplies obturator externus and adductor magnus (adductor part); genicular branch to the posterior and medial knee.',
          'An accessory obturator nerve (L3–L4) is present in some people and may supply pectineus and the hip.',
        ],
      },
    ],
  },
];
