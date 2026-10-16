// Thigh page: block data (schema: ../../../shared/regional/DATA.md, "Block schema"; leg figures: ../../shared/LEG.md).
// The proximal sciatic block is new to the section (not one of Dr Chew Shi Hao's seven): its dose comes from the
// literature and standard texts (sources in the notes file, not on the page). Text is plain, with no citations.
import { el, table } from '../../../shared/regional/js/ui.js';
import { mountScan } from '../../../shared/regional/js/scan.js';
import { legCoverageMap } from '../../../shared/regional/js/figures/leg.js';
import { SCENES } from './scenes.js?v=20261015';

// A row of buttons that swaps between several scan viewers (mounted on first use).
function scanSwitcher(sec, items, { label, idPrefix }) {
  const seg = el('div', { class: 'tb-seg th-sw-seg', role: 'group', 'aria-label': label });
  const host = el('div', { class: 'th-sw-host', id: `${idPrefix}-host` });
  const mounted = new Map();
  const btns = items.map((it, i) => el('button', { type: 'button', class: 'tb-seg-btn', id: `${idPrefix}-${it.key}`, dataset: { activate: '1', scrollTo: `${idPrefix}-host` }, 'aria-pressed': 'false', text: it.label, on: { click: () => show(i) } }));
  btns.forEach((b) => seg.append(b));
  function show(i) {
    const it = items[i];
    btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    for (const [k, node] of mounted) node.hidden = k !== it.key;
    if (!mounted.has(it.key)) {
      const node = el('div', { class: 'th-sw-pane' });
      host.append(node);
      mountScan(node, it.scene, { blockId: it.blockId });
      mounted.set(it.key, node);
    }
    window.dispatchEvent(new Event('resize'));
  }
  sec.append(seg, host);
  show(0);
}

const yes = '<span class="th-yn th-yn--y">Yes</span>';
const often = '<span class="th-yn th-yn--p">Often</span>';
const no = '<span class="th-yn th-yn--n">No</span>';
const unrel = '<span class="th-yn th-yn--p">Not reliably</span>';
// A collapsed disclosure for the deeper layers, so the rapid-fire layer stays easy to find on a phone.
const more = (summary, html) => `<details class="tb-details th-more"><summary>${summary}</summary><div class="tb-details-body">${html}</div></details>`;

export const BLOCKS = [
  // ------------------------------------------------------------------ proximal sciatic (subgluteal and the others)
  {
    id: 'sciatic',
    kicker: 'Thigh · Sciatic nerve',
    title: 'Subgluteal sciatic block',
    summary: `The sciatic nerve at the gluteal crease, in the plane under <strong>gluteus maximus</strong> between the <strong>ischial tuberosity</strong> and the <strong>femur</strong>. It numbs everything below the knee except the saphenous strip, plus the <strong>hamstrings</strong> and the <strong>back of the knee joint</strong>, so it works above a mid-thigh cut (with femoral, obturator and lateral femoral cutaneous blocks). Its blind spot is the skin of the back of the thigh: the <strong>posterior femoral cutaneous nerve</strong> lies beside it behind a fascia and is often missed.`,
    indications: ['Above-knee amputation', 'Below-knee amputation with a thigh cuff', 'Knee surgery: the back of the knee', 'Foot and ankle when the popliteal fossa is out of reach', 'Tibial fracture analgesia; catheters'],
    glance: {
      position: 'Lateral, block side up, hips and knees flexed (or prone)',
      probe: 'Curvilinear, transverse at the gluteal crease',
      needle: '100 mm echogenic (150 mm if obese), in-plane, lateral to medial',
      dose: '20 ml of 0.5% ropivacaine (100 mg), 5 ml aliquots; 15 ml when it is one of several blocks',
      covers: 'Below the knee except the saphenous strip; the hamstrings; the back of the knee joint (not its skin). Not reliably the back of the thigh.',
    },
    intro: `<p class="th-rapid"><strong>The 20-second version.</strong> Curvilinear probe at the gluteal crease. Two bones: ischium medial, femur lateral. Under gluteus maximus, a flat bright oval: that is the sciatic nerve. In-plane from lateral, under it first, then over it. 20 ml. Add a posterior femoral cutaneous injection if the cut is in the thigh.</p>`,
    scene: SCENES.subgluteal,
    position: `<p><strong>Lateral</strong> (Sims), block side up, the upper hip and knee flexed so the gluteal crease opens; the lower leg straight. <strong>Prone</strong> is easiest for scanning if the patient can manage it. Expose the foot to see the twitch. For a patient who cannot turn (fracture, sick, external fixator), use the <a href="#sciatic-approaches">anterior approach</a> supine, or lift the leg (hip and knee flexed, held by an assistant) for a supine subgluteal approach.</p>`,
    equipment: [
      'Low-frequency curvilinear probe (a linear probe may do in a slim patient)',
      '100 mm echogenic short-bevel needle; 150 mm for the obese, the anterior or the parasacral approach',
      'Nerve stimulator (dual guidance helps at this depth): set about 0.5 mA',
      '20 ml of 0.5% ropivacaine in a 20 ml syringe, extension line, an assistant to inject; injection pressure monitoring if available',
      'Monitoring, IV access, lipid emulsion and the toxicity kit within reach',
    ],
    landmarksTitle: 'Landmarks and scanning',
    landmarks: `<p>Feel the <strong>ischial tuberosity</strong> and the <strong>greater trochanter</strong>. The nerve runs down roughly <strong>midway between them</strong>, a little nearer the ischium. Put the probe <strong>transverse on the gluteal crease</strong> between the two.</p>
<ul><li><strong>Two bones, one oval:</strong> find the ischium (medial) and the femur (lateral) as bright lines with shadows; the nerve lies between them, under the bright fascia of gluteus maximus.</li>
<li><strong>Can’t see it?</strong> Tilt the probe (the nerve is very anisotropic); ask the patient to move the foot (the nerve rocks); or start in the popliteal fossa, where it is easy, and <strong>trace it up</strong>.</li>
<li><strong>Depth</strong>: several centimetres, more in the obese and deeper again at the transgluteal level. Start with the depth set deep, then set the focus at the nerve.</li>
<li>Colour Doppler: a small artery runs on the nerve (from the inferior gluteal artery).</li></ul>`,
    approach: `<p><strong>In-plane, lateral to medial</strong>, entering 1–2 cm lateral to the probe. The path is steep: angle the probe slightly (heel-toe) to see the needle better. Feel the give through the fascia under gluteus maximus. Aim for the <strong>lateral corner of the nerve</strong>. <strong>Out-of-plane</strong> from caudal works too and suits a catheter.</p>`,
    sonoanatomy: '<p>Labels for an OSCE: gluteus maximus, the subgluteal space (the plane under it), sciatic nerve, quadratus femoris (or adductor magnus just below), the ischial tuberosity and the hamstring origin medially, the femur laterally, and the posterior femoral cutaneous nerve as a small dot superficial to the sciatic nerve.</p>',
    target: `<p>Fluid that <strong>surrounds the nerve</strong> in the subgluteal plane. In practice: inject <strong>under the nerve</strong> first (it floats up), then <strong>over it</strong>, so it is ringed. A single injection along its back surface works less often. The nerve should <strong>float, not swell</strong>.</p>`,
    dose: {
      html: '<span class="tb-dose-v">20 ml</span> of <span class="tb-dose-v">0.5%</span> ropivacaine (100 mg)',
      note: 'In <strong>5 ml aliquots</strong>, aspirating between, half under the nerve and half over it. As one of several blocks (an amputation), <strong>15 ml</strong> or a lower concentration keeps the total within the maximum: see the <a href="#ch-amputation">amputation planner</a>. For analgesia only, 0.2% is enough. Allow <strong>20–30 minutes</strong>: a big nerve takes time.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front', 'back', 'dorsum', 'sole'],
      areas: [
        { zones: ['sciatic-below-knee', 'tibia', 'ankle-joint', 'foot-bones'], density: 'dense' },
        { zones: ['knee-post', 'femur'], density: 'moderate' },
        { zones: ['pfcn'], density: 'patchy' },
      ],
      summary: 'The leg below the knee, ankle and foot except the saphenous strip; the hamstrings; much of the back of the knee joint (the obturator nerve supplies the rest); part of the femur. The back of the thigh only sometimes.',
      mechanism: `<p>At the gluteal crease the sciatic nerve is still one trunk: the <strong>tibial division</strong> (medial) and the <strong>common peroneal division</strong> (lateral) in one sheath. It has no skin branches in the thigh, but it still carries the <strong>branches to the hamstrings</strong> (from its medial side, in the upper thigh), the <strong>posterior knee joint</strong> branches and everything below the knee. The <strong>posterior femoral cutaneous nerve</strong> runs beside it under gluteus maximus but is separated from it by a fascia at this level, so fluid around the sciatic nerve often does not reach it.</p>`,
      density: `<p>Dense surgical anaesthesia below the knee and complete motor block (no knee flexion, no ankle or toe movement) when the nerve is surrounded. Onset is slower than at the popliteal fossa: test at <strong>20–30 minutes</strong>, in the tibial (sole), common peroneal (dorsum, first web space) and sural (lateral foot) territories, and the back of the thigh if the posterior femoral cutaneous nerve matters.</p>`,
      misses: `<ul><li><strong>The saphenous strip</strong> (medial leg and ankle): add a <a href="../knee/#ch-adductor-canal">saphenous or adductor canal block</a>, or a <a href="../hip/#ch-femoral">femoral block</a>.</li><li><strong>The front, lateral and medial thigh</strong> (femoral, lateral femoral cutaneous, obturator).</li><li><strong>The back of the thigh</strong> in many patients: add a <a href="#sciatic-inj-pfcn">posterior femoral cutaneous injection</a>, or use a <a href="#sciatic-approaches">transgluteal or parasacral approach</a>.</li><li><strong>The hip joint</strong> (it is below the hip branches).</li></ul>`,
    },
    complications: `<ul><li><strong>Falls and weakness</strong>: no knee flexion and a foot drop. The patient cannot stand on the leg; warn them, protect the heel, use a splint or boot as needed.</li>
<li><strong>Nerve injury</strong>: the sciatic nerve is big, deep and hard to see well; intraneural injection was seen on video in about one in six subgluteal blocks in one series (without lasting harm, but no comfort). Low current, low pressure, no paraesthesia, stop if the nerve swells. The <strong>common peroneal division</strong> is the more vulnerable.</li>
<li><strong>Masked injury or compartment syndrome</strong>: after hip surgery (sciatic nerve at risk from retractors and dislocation) and in leg trauma, agree with the surgeon before blocking, or block after the neurological check.</li>
<li><strong>Vascular puncture</strong>: inferior gluteal vessels at the higher levels; femoral and profunda vessels on the anterior approach. Deep and non-compressible at the transgluteal, parasacral and anterior sites: matters in the anticoagulated.</li>
<li><strong>Local anaesthetic toxicity</strong> when it is one of four or five blocks: count the milligrams.</li>
<li><strong>Pressure injury</strong> of the numb heel and the back of the leg; long-lasting block after high concentrations.</li></ul>`,
    pearls: [
      'Two bones, one oval: ischium medial, femur lateral, nerve in between under gluteus maximus.',
      'Lost the nerve? Trace it up from the popliteal fossa.',
      'Anisotropic: tilt the probe until the oval lights up.',
      'Under it first, then over it: the nerve should float, not swell.',
      'Twitch the foot, not the buttock or the hamstrings.',
      'Subgluteal: the posterior femoral cutaneous nerve lies beside the sciatic nerve but behind a fascia, so the back of the thigh may stay sensate.',
      'Higher (transgluteal, parasacral) catches the back of the thigh; lower (popliteal) spares the hamstrings.',
      'Supine and can’t turn? Anterior approach, 6–8 cm deep, medial to the femoral vessels.',
      'A big nerve is slow: allow 20–30 minutes before you test.',
      { safety: true, html: 'Sciatic block for a knee replacement masks a peroneal palsy: discuss first.' }, // safety: shown at MO level
    ],
    sections: [
      {
        id: 'approaches', title: 'Four levels compared: parasacral, transgluteal, subgluteal, anterior',
        render(sec) {
          sec.append(el('p', { class: 'tb-prose', html: 'The higher you block, the more neighbouring <strong>sacral plexus</strong> branches you catch. The <strong>posterior femoral cutaneous</strong> and <strong>inferior gluteal</strong> nerves leave the pelvis with the sciatic nerve (the superior gluteal nerve above piriformis) and part company with it in the buttock; none of them is a branch of the sciatic nerve. The lower you block, the easier and shallower it is, and the more you spare. The <a href="#th-levels">levels figure</a> in the anatomy chapter shows the same thing on a drawing.' }));
          sec.append(el('ul', { class: 'th-lvl-sum', html: `<li><strong>Parasacral</strong>: catches the sciatic, posterior femoral cutaneous and often the gluteal nerves; deepest.</li>
<li><strong>Transgluteal</strong>: sciatic, and often the posterior femoral cutaneous; best for an above-knee amputation.</li>
<li><strong>Subgluteal</strong>: sciatic and hamstrings; the back of the thigh not reliably.</li>
<li><strong>Anterior</strong>: supine; sciatic only, the back of the thigh stays sensate.</li>` }));
          const tblWrap = el('details', { class: 'tb-details th-more', id: 'sciatic-ap-table' });
          tblWrap.append(el('summary', { text: 'The full comparison table' }));
          const tblBody = el('div', { class: 'tb-details-body' });
          tblWrap.append(tblBody);
          sec.append(tblWrap);
          tblBody.append(table({
            caption: 'Proximal sciatic approaches side by side',
            head: ['', 'Parasacral', 'Transgluteal', 'Subgluteal', 'Anterior'],
            rows: [
              [{ th: true, html: 'Where' }, 'Greater sciatic notch, under piriformis', 'Between ischial tuberosity and greater trochanter, under gluteus maximus', 'Gluteal crease, under gluteus maximus', 'Anteromedial thigh at the lesser trochanter, behind adductor magnus'],
              [{ th: true, html: 'Position' }, 'Lateral', 'Lateral or prone', 'Lateral or prone (or leg lifted)', '<strong>Supine</strong>'],
              [{ th: true, html: 'Depth' }, 'Deepest', 'Deep (deeper than subgluteal)', 'Several centimetres; more in the obese', 'Deep (often 6–8 cm)'],
              [{ th: true, html: 'Posterior femoral cutaneous' }, yes, often, unrel, no],
              [{ th: true, html: 'Gluteal nerves, back of the hip' }, often, no, no, no],
              [{ th: true, html: 'Hamstrings' }, yes, yes, yes, 'Partly'],
              [{ th: true, html: 'Best for' }, 'Hip and thigh with a lumbar plexus or PENG; complete posterior cover', 'Above-knee amputation; thigh incisions', 'Below-knee surgery with a thigh cuff; knee; most amputations with a separate posterior femoral cutaneous injection', 'Trauma, fixators, the patient who cannot turn'],
              [{ th: true, html: 'Watch for' }, 'Gluteal vessels, pelvic structures; deep', 'Deep, non-compressible; inferior gluteal vessels', 'Missing the back of the thigh', 'Long steep path past the femoral vessels; misses the back of the thigh'],
            ],
          }));
          sec.append(el('p', { class: 'tb-prose', html: 'Scan each approach below: the same four steps, the same needle-side marker, the same dose (20 ml of 0.5% ropivacaine for surgery). The parasacral scan follows the <strong>parasacral parallel shift</strong>: slide along the ilium until its bright line breaks at the sciatic notch.' }));
          scanSwitcher(sec, [
            { key: 'tg', label: 'Transgluteal', scene: SCENES.transgluteal, blockId: 'sciatic-tg' },
            { key: 'ps', label: 'Parasacral', scene: SCENES.parasacral, blockId: 'sciatic-ps' },
            { key: 'ant', label: 'Anterior (supine)', scene: SCENES.anterior, blockId: 'sciatic-ant' },
          ], { label: 'Other sciatic approaches', idPrefix: 'sciatic-ap' });
          sec.append(el('div', { class: 'tb-prose', html: more('Infragluteal and the landmark (Labat, anterior) techniques', `<ul><li><strong>Infragluteal</strong>: a few centimetres lower again, where the long head of biceps femoris crosses the nerve; often shallow enough for a linear probe. Same blind spot for the back of the thigh.</li>
<li><strong>Landmark (classic posterior, Labat)</strong>: lateral, upper leg flexed; a line from the posterior superior iliac spine to the greater trochanter, a perpendicular from its midpoint, and the needle where that meets the line from the greater trochanter to the sacral hiatus. Nerve stimulator to a foot twitch at low current. Know it for the exam; use ultrasound in practice.</li>
<li><strong>Landmark anterior</strong>: supine; the needle enters where a perpendicular from the junction of the medial and middle thirds of the inguinal ligament line meets a parallel line through the greater trochanter, and is walked medially off the femur to the nerve. Deep, and the femoral vessels are close.</li></ul>`) }));
        },
      },
      {
        // Tier 1: the scan viewer offers its separate injection at MO level, so its dose (counted in the total) shows too.
        id: 'pfcn', title: 'The posterior femoral cutaneous nerve block', tier: 1,
        html: `<p>The <strong>posterior femoral cutaneous nerve</strong> (S1–S3) leaves the pelvis below piriformis with the sciatic nerve and the inferior gluteal vessels, runs down under gluteus maximus <strong>superficial to the sciatic nerve</strong> (medial to it higher in the buttock; at the gluteal crease its side varies and it is often slightly lateral), and then under the fascia lata down the middle of the back of the thigh. It supplies the <strong>skin of the back of the thigh and the popliteal fossa</strong>, often the upper calf, the lower buttock (inferior cluneal branches) and part of the perineum. It is purely sensory.</p>
<p><strong>When it matters:</strong> above-knee and through-knee amputation (the posterior flap), incisions or skin graft donor sites on the back of the thigh, and a calf or popliteal fossa incision. It matters <strong>less for a thigh tourniquet</strong> than for an incision: the deep nerves matter most under a cuff, but the skin of the back of the thigh under it is still this nerve.</p>
<ul><li><strong>Ultrasound, subgluteal</strong>: from the sciatic view, look just superficial to the sciatic nerve, under gluteus maximus, for a small oval beside a small artery; search the whole superficial surface, as its side varies. A thin fascia separates the two nerves and usually stops fluid crossing between them, so give it <a href="#sciatic-inj-pfcn">its own injection</a>: <strong>5–10 ml of 0.5% ropivacaine (25–50 mg)</strong>, counted in the total.</li>
<li><strong>Higher up, one needle</strong>: at the transgluteal and parasacral levels it lies closer to the sciatic nerve, so the main injection often catches it.</li>
<li><strong>Landmark, at the gluteal crease</strong>: a subcutaneous wheal along the crease, plus a few millilitres deep to the fascia at its midpoint (fanned), to catch the nerve before it pierces the fascia. In the <strong>mid-thigh</strong>, a subcutaneous line about 5 cm above and parallel to the popliteal crease catches its lower branches (with a popliteal block, for varicose vein surgery behind the knee).</li></ul>`,
      },
      {
        id: 'nerve-stim', title: 'Nerve stimulator: which twitch counts',
        html: `<ul><li><strong>Accept</strong>: a twitch of the <strong>calf or foot</strong> (plantar flexion, inversion, dorsiflexion or eversion) at about 0.3–0.5 mA. <strong>Inversion</strong> (tibial and deep peroneal together) suggests the tip is near the centre of the nerve and predicts the most complete block; eversion alone suggests you are on the peroneal side.</li>
<li><strong>Don’t accept</strong>: a <strong>gluteus maximus</strong> twitch (you are still in the muscle, or on the inferior gluteal nerve) or a <strong>hamstring</strong> twitch alone (direct muscle stimulation, or a branch that has already left the trunk).</li>
<li>With ultrasound, use the stimulator as a <strong>safety monitor</strong>: a twitch at very low current (below about 0.2 mA) suggests the tip is touching or inside the nerve. No twitch does not prove you are outside it.</li></ul>`,
      },
      {
        id: 'catheter', title: 'Catheters',
        html: more('How to place one, and the surgeon’s catheter', `<p>A <strong>subgluteal catheter</strong> gives days of analgesia for an amputation stump or a major foot and ankle reconstruction. Out-of-plane from caudal (the catheter then follows the nerve down), or in-plane from lateral; hydrodissect under the nerve with 5 ml, thread <strong>3–5 cm</strong> past the tip, and inject through it while scanning. Tunnel and fix it well: the buttock is a hard place to keep a catheter.</p>
<p>In amputations the <strong>surgeon</strong> can place a catheter <strong>into the sciatic nerve sheath under direct vision</strong> before dividing the nerve: simple, reliable, no extra needle. The evidence for both is in the <a href="#th-amp-catheters">amputation chapter</a>. Run dilute solutions (for example 0.2% ropivacaine); the leg is already weak or gone, so motor block matters less than toxicity.</p>`),
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: more('Seven subspecialty points', `<ul>
<li><strong>Two nerves in one sheath.</strong> The tibial and common peroneal divisions share a sheath down to the popliteal fossa in most people, but in about one in ten they are separate from the pelvis (the common peroneal division may even pass through or above piriformis). If you see two nerves high up, block both.</li>
<li><strong>The obese patient.</strong> Injecting into the <strong>subgluteal space</strong> (the plane under gluteus maximus, on quadratus femoris) rather than chasing the nerve was about twice as fast in overweight patients, with the same success. Fascial-plane thinking works here.</li>
<li><strong>The anticoagulated or septic patient.</strong> The transgluteal, parasacral and anterior sites are <strong>deep and non-compressible</strong>; the subgluteal is intermediate, the popliteal superficial. Use the lowest level that does the job, ultrasound and colour Doppler, a fine needle, and follow your anticoagulation guidance for deep blocks.</li>
<li><strong>The hip.</strong> The back of the hip capsule is supplied by the nerve to quadratus femoris, sciatic branches and the superior gluteal nerve, which a <strong>parasacral</strong> block reaches and a subgluteal block does not. Parasacral plus a lumbar plexus block was the classic complete hip block; today PENG and fascia iliaca cover the front (see the <a href="../hip/">hip page</a>).</li>
<li><strong>Knee surgery.</strong> A sciatic block for knee replacement gives good posterior analgesia but a foot drop that masks surgical peroneal nerve injury; PROSPECT does not recommend it. <a href="../knee/#ch-ipack">iPACK</a> and a selective tibial block are the motor-sparing answers.</li>
<li><strong>Dual guidance at depth.</strong> When the needle is hard to see (steep, deep, obese), the stimulator tells you which side of the nerve you are on, and injection pressure monitoring adds protection.</li>
<li><strong>Fascial plane or perineural?</strong> At the subgluteal level both work; perineural (circumferential) spread gives faster, more complete block, the plane approach is quicker and arguably safer. Choose by the image and the patient.</li>
</ul>`),
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: more('Five things that are new or being tested', `<ul>
<li><strong>Naming.</strong> The 2024 ASRA–ESRA consensus names limb blocks by the nerve and the level: “sciatic nerve block, subgluteal” rather than a list of eponyms, so that trials and records compare like with like.</li>
<li><strong>Percutaneous peripheral nerve stimulation.</strong> Fine leads placed near the sciatic and femoral nerves and stimulated for 60 days reduced chronic post-amputation pain in a small placebo-controlled trial, and the benefit lasted to 12 months in most of those treated. The leads do not numb or weaken, which makes them attractive for the stump.</li>
<li><strong>Cryoneurolysis</strong> of the sciatic and femoral nerves did not reduce established phantom limb pain in a multicentre sham-controlled trial, and a 2026 pilot that froze all four thigh nerves in people with an above-knee amputation found no benefit either; the large sciatic nerve may simply be too big to freeze through.</li>
<li><strong>Surgery for the nerve itself.</strong> Targeted muscle reinnervation joins the cut nerve ends to motor branches of nearby muscles. In a small randomised trial in amputees with established neuroma or phantom pain, it was favoured over excising the neuroma and burying the nerve in muscle; it is increasingly done at the primary amputation. Ask your surgeons whether they do it: it changes where the catheter can go.</li>
<li><strong>Perineural catheters at home.</strong> A six-day ambulatory perineural infusion of ropivacaine (sciatic and femoral, or brachial plexus) reduced established phantom limb pain a month later in a multicentre placebo-controlled trial, with little benefit left at a year (see the <a href="#th-amp-catheters">amputation chapter</a>).</li>
</ul>`),
      },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>Outline the anatomy of the sciatic nerve from the pelvis to the knee, as relevant to blocking it.</p>',
        points: [
          'Roots L4–S3, from the sacral plexus; the largest nerve in the body; two divisions in one sheath: tibial (medial, L4–S3) and common peroneal (lateral, L4–S2).',
          'Leaves the pelvis through the greater sciatic foramen below piriformis, with the posterior femoral cutaneous nerve, the inferior gluteal nerve and vessels, and the pudendal nerve (medially).',
          'In the buttock: deep to gluteus maximus, on the posterior surface of the ischium, then on the gemelli, obturator internus and quadratus femoris, about midway between the ischial tuberosity and the greater trochanter.',
          'In the thigh: on adductor magnus, crossed superficially by the long head of biceps femoris; branches to the hamstrings and the hamstring part of adductor magnus (short head of biceps from the peroneal division).',
          'Divides near the apex of the popliteal fossa (level varies; high division in about one in ten).',
          'No cutaneous branches in the thigh: the back of the thigh is the posterior femoral cutaneous nerve. Below the knee: everything except the saphenous territory.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Demonstrate the sciatic nerve at the subgluteal level on this volunteer. What is the subgluteal space? What will a block here not cover?</p>',
        points: [
          'Lateral (or prone), hips and knees flexed; curvilinear probe transverse at the gluteal crease between the ischial tuberosity and the greater trochanter.',
          'Identify gluteus maximus, its deep fascia, the ischial tuberosity (medial) and femur (lateral) with their shadows, quadratus femoris or adductor magnus deep, and the sciatic nerve: a flat hyperechoic oval or triangle between them.',
          'Subgluteal space: the fascial plane between gluteus maximus (superficial) and quadratus femoris (deep), bounded by the ischial tuberosity and greater trochanter; the sciatic nerve runs in it.',
          'Tricks: tilt for anisotropy; foot movement; trace up from the popliteal fossa.',
          'Not covered: saphenous territory, anterior, lateral and medial thigh (femoral, LFCN, obturator), the hip joint, and often the back of the thigh (posterior femoral cutaneous nerve).',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>You have done femoral, obturator, lateral femoral cutaneous and subgluteal sciatic blocks for an above-knee amputation. The surgeon’s posterior skin incision hurts. Why, and what will you do?</p>',
        points: [
          'The posterior thigh skin is the posterior femoral cutaneous nerve, which often escapes a subgluteal sciatic injection (separated by a fascia).',
          'Options: an ultrasound-guided posterior femoral cutaneous injection superficial to the sciatic nerve (if the patient can be positioned), local infiltration by the surgeon along the posterior flap, or sedation and analgesia.',
          'Count the dose already given before adding any more local anaesthetic.',
          'Next time: block it deliberately, or choose a transgluteal level, which more often catches both.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>During a nerve stimulator-guided sciatic block in the buttock you see a strong twitch of the buttock at 1 mA. Then a hamstring twitch. Interpret these, and give the endpoint you want.</p>',
        points: [
          'Buttock twitch: direct gluteus maximus stimulation or the inferior gluteal nerve: too superficial, advance.',
          'Hamstring twitch alone: direct muscle or a hamstring branch: unreliable, redirect.',
          'Wanted: calf or foot twitch (inversion best, then plantar flexion; eversion or dorsiflexion means the peroneal side) at about 0.3–0.5 mA, lost below about 0.2 mA.',
          'With ultrasound: the image and the spread are the endpoint; the stimulator is a safety monitor.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Describe the landmarks for the classic posterior (Labat) and the anterior sciatic nerve blocks. Why has ultrasound largely replaced them?</p>',
        points: [
          'Classic posterior (Labat): lateral (Sims) position, upper hip and knee flexed. A line from the posterior superior iliac spine to the greater trochanter; a perpendicular from its midpoint, caudally; the needle enters where it meets the line from the greater trochanter to the sacral hiatus. Needle perpendicular to the skin; nerve stimulator to a calf or foot twitch.',
          'Anterior: supine. The inguinal ligament line from the anterior superior iliac spine to the pubic tubercle is trisected; a perpendicular from the junction of its medial and middle thirds meets a parallel line through the greater trochanter. The needle passes posteriorly, is walked medially off the femur (lesser trochanter) and advanced to a foot twitch.',
          'Both are deep, blind and rely on surface landmarks that shift with obesity and position; the anterior path passes close to the femoral vessels.',
          'Ultrasound shows the nerve, the vessels and the spread; it allows a lower volume, fewer passes and a fascial-plane injection (the subgluteal space) when the nerve is hard to see. The landmark methods remain useful as a backup and in exams.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>What would you tell a patient when consenting for a subgluteal sciatic block for foot surgery? What are the specific risks?</p>',
        points: [
          'Expect a numb, heavy leg below the knee with a foot drop and no knee flexion for many hours (often into the next day with long-acting drugs).',
          'Falls: do not walk on the leg until it has recovered; crutches or a splint or boot as advised; protect the numb heel and the back of the leg from pressure.',
          'Nerve injury: transient tingling or numbness is fairly common; lasting injury is rare. Report weakness or numbness that has not recovered when expected.',
          'Masking: the block can hide a surgical peroneal nerve injury or a compartment syndrome; agree with the surgeon beforehand when either is a risk (tibial fractures, knee surgery).',
          'Also: block failure (backup plan), bleeding or bruising (deep site), local anaesthetic toxicity (rare), infection.',
        ],
      },
    ],
  },
];
