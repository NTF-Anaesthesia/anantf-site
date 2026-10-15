// Foot and ankle blocks: block data (schema: ../../../shared/regional/DATA.md, "Block schema"; leg figures:
// ../../shared/LEG.md). Popliteal and ankle doses are Dr Chew Shi Hao's (the owner's decision); the below-knee saphenous
// doses come from the literature (sources in the notes file, not on the page). Text is plain, with no citations.
import { el } from '../../../shared/regional/js/ui.js';
import { mountScan } from '../../../shared/regional/js/scan.js';
import { legCoverageMap } from '../../../shared/regional/js/figures/leg.js';
import { SCENES } from './scenes.js?v=20261015';
import { ankleSection } from './anatomy.js?v=20261015';

// A row of buttons that swaps between several scan viewers (mounted on first use).
function scanSwitcher(sec, items, { label, idPrefix }) {
  const seg = el('div', { class: 'tb-seg fa-sw-seg', role: 'group', 'aria-label': label });
  const host = el('div', { class: 'fa-sw-host', id: `${idPrefix}-host` });
  const mounted = new Map();
  const btns = items.map((it, i) => el('button', { type: 'button', class: 'tb-seg-btn', id: `${idPrefix}-${it.key}`, dataset: { activate: '1', scrollTo: `${idPrefix}-host` }, 'aria-pressed': 'false', text: it.label, on: { click: () => show(i) } }));
  btns.forEach((b) => seg.append(b));
  function show(i) {
    const it = items[i];
    btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    for (const [k, node] of mounted) node.hidden = k !== it.key;
    if (!mounted.has(it.key)) {
      const node = el('div', { class: 'fa-sw-pane' });
      host.append(node);
      mountScan(node, it.scene, { blockId: it.blockId });
      mounted.set(it.key, node);
    }
    window.dispatchEvent(new Event('resize'));
  }
  sec.append(seg, host);
  show(0);
}

export const BLOCKS = [
  // ------------------------------------------------------------------ popliteal sciatic
  {
    id: 'popliteal',
    kicker: 'Foot and ankle · Sciatic nerve',
    title: 'Popliteal sciatic block',
    summary: `The sciatic nerve blocked in the popliteal fossa, at or just above the point where it divides into the <strong>tibial</strong> and <strong>common peroneal</strong> nerves. It numbs the <strong>whole leg below the knee, the ankle and the foot</strong>, except the strip on the inner side of the leg and the medial malleolus (saphenous, from the femoral nerve). With a saphenous block it covers <strong>all below-knee surgery</strong> and a <strong>calf tourniquet</strong>. <a href="#popliteal-pearls">Short on time? Jump to the pearls.</a>`,
    indications: ['Foot and ankle surgery: fractures, arthrodesis, arthroplasty, tendon work', 'Calf tourniquet (with a saphenous block)', 'Below-knee amputation (with a saphenous or femoral block)', 'Achilles tendon repair, calcaneal fixation, heel surgery', 'Analgesia for tibial and ankle fractures; catheters for major reconstruction'],
    glance: {
      position: 'Lateral, leg on a pillow (or prone; or supine with the leg raised)',
      probe: 'Linear, transverse on the back of the thigh at the bifurcation',
      needle: '80–100 mm echogenic, in-plane, lateral to medial',
      dose: '15 ml of 0.4% ropivacaine (60 mg), 5 ml aliquots, inside the paraneural sheath',
      covers: 'Below the knee except the medial leg and medial malleolus (saphenous)',
    },
    watch: { anim: 'popliteal', caption: 'Popliteal sciatic block: the common peroneal nerve stacked over the tibial nerve, the two side by side (deep and superficial), in-plane and out-of-plane approaches, and a near miss outside the sheath. On a phone, tap Full screen and turn the phone sideways to read the labels.', tier: 1 }, // Dr Chew Shi Hao's animation (lower-limb/anim/), loaded when opened
    scene: SCENES.popliteal,
    position: `<p><strong>Lateral</strong>, block side up, with a pillow under the leg so the knee is slightly flexed and the probe has room behind the thigh. Alternatives: <strong>prone</strong> (easiest scanning), or <strong>supine</strong> with the leg raised on a padded support or held by an assistant (fine for trauma and the obese, but the probe works from underneath).</p>`,
    equipment: [
      'High-frequency linear probe (curvilinear if the nerve is deeper than about 4–5 cm)',
      '80–100 mm echogenic short-bevel needle (the lateral entry is a long, flat path)',
      '15 ml of 0.4% ropivacaine in a 20 ml syringe, with an extension line and an assistant to inject',
      'Monitoring, IV access, lipid emulsion and the toxicity kit within reach',
    ],
    landmarks: `<p><strong>Start at the popliteal crease</strong>, probe transverse. Colour Doppler: the <strong>popliteal artery</strong> is deepest, the <strong>vein</strong> just superficial to it, and the <strong>tibial nerve</strong> superficial to both (a bright honeycomb oval). <strong>Slide cephalad</strong> keeping the tibial nerve in view: the <strong>common peroneal nerve</strong> comes in from the lateral side, along biceps femoris, and the two meet. Block at that junction, usually <strong>5–10 cm above the crease</strong>, but it varies: find it in every patient.</p>
<ul><li><strong>Anisotropy:</strong> the nerve fades into the fat? <strong>Tilt the probe caudally</strong> so the beam meets the nerve at right angles.</li>
<li><strong>Press harder</strong> to bring a deep nerve up; <strong>pull the probe towards you</strong> (rotate your wrist, not your shoulder) for comfortable ergonomics in the obese.</li>
<li><strong>See-saw sign:</strong> ask the patient to point and pull up the foot; the two nerves rock against each other.</li></ul>`,
    landmarksTitle: 'Scanning: find the bifurcation',
    approach: `<p><strong>In-plane, lateral to medial.</strong> Enter on the <strong>lateral thigh, 2–3 cm away from the probe</strong>, under or through biceps femoris, so that the needle runs <strong>almost parallel</strong> to the probe: it shows up brightly and reaches the nerve at its depth. The paraneural sheath tents, then gives with a pop. Stop with the tip <strong>between the tibial and common peroneal nerves, inside the sheath</strong>.</p>
<p><strong>Out-of-plane</strong> (needle from caudal, tip as a bright dot walked down to the nerve) also works and suits a <strong>catheter</strong>, which then threads along the nerve.</p>`,
    sonoanatomy: '<p>Labels for the OSCE: popliteal artery and vein, sciatic nerve (or tibial and common peroneal), biceps femoris (lateral), semimembranosus and semitendinosus (medial), the femur (the bright line deep, or the femoral condyles near the crease), and the paraneural sheath around both nerves.</p>',
    target: `<p>Fluid <strong>inside the paraneural sheath</strong>: it parts the two nerves and spreads <strong>around both</strong>, up and down the nerve. That one injection is enough. Alternatives: <strong>deep then superficial</strong> to the nerve (lift it, then wrap it), or a single injection between the two branches inside the sheath. Wrong: fluid pooling <strong>on top of the sheath</strong> (slow, patchy block), or the nerve <strong>swelling</strong> (intraneural: stop).</p>`,
    dose: {
      html: '<span class="tb-dose-v">15 ml</span> of <span class="tb-dose-v">0.4%</span> ropivacaine (60 mg)',
      note: 'In <strong>5 ml aliquots</strong>, inside the paraneural sheath, aspirating between and watching the fluid wrap the nerves. Add a saphenous block (5 ml of 0.5%, 25 mg) for medial cover: total 85 mg. A common teaching maximum for a single dose of ropivacaine is about <strong>3 mg/kg</strong> (about 210 mg at 70 kg), lower in frail older patients; use lean (ideal) body weight in the light and frail, and count every other dose given that day (surgical infiltration included). Injection should feel easy: high resistance means the tip may be against or in the nerve.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front', 'back', 'sole'],
      areas: [
        { zones: ['sup-peroneal-leg', 'sural', 'sup-peroneal', 'deep-peroneal', 'tibial-sole', 'calcaneal', 'ankle-joint'], density: 'dense' },
        { zones: ['lat-cut-calf'], density: 'moderate' },
      ],
      summary: 'The leg below the knee, the ankle and the foot, skin and bone, except the medial leg, medial malleolus and medial foot (saphenous).',
      mechanism: `<p>The sciatic nerve carries all the sensation below the knee except the saphenous strip, and all the muscles. At the bifurcation the tibial and common peroneal nerves share a <strong>paraneural sheath</strong>; fluid inside it spreads along both nerves for several centimetres, so one injection blocks both. The lateral sural cutaneous branch (outer upper calf) leaves the common peroneal nerve in the fossa, so a block below its origin may miss it.</p>`,
      density: `<p>Surgical anaesthesia of the foot and ankle when it works, with motor block (foot drop). Onset is fastest with the injection inside the sheath at the bifurcation: in a randomised trial it was about a third faster than separate injections around each nerve below the split. Test in all five territories at 15–20 minutes: a patchy block usually means only <strong>one branch</strong> was blocked.</p>`,
      misses: `<ul><li><strong>Saphenous</strong>: the medial leg, the medial malleolus and the inner foot. Add a <a href="#ch-saphenous">saphenous block</a>.</li><li><strong>The back of the knee and thigh</strong> (posterior femoral cutaneous nerve).</li><li><strong>A thigh tourniquet</strong>.</li></ul>`,
    },
    complications: `<ul><li><strong>Foot drop and falls</strong>: expected for most of a day. Crutches, no unsupported weight-bearing, escort home.</li>
<li><strong>Nerve injury</strong>: the <strong>common peroneal</strong> is the lower-limb nerve most often injured around surgery (positioning and pressure at the fibular neck as well as the block), so document foot dorsiflexion before and after, and pad the fibular head. Don’t inject against high pressure, into a swollen nerve, or with pain or paraesthesia; don’t chase a twitch.</li>
<li><strong>Vascular puncture</strong>: the popliteal vein and artery lie just deep to the nerves. Colour Doppler, aspirate, aliquots.</li>
<li><strong>Pressure injury of the numb heel</strong>; masked <strong>compartment syndrome</strong> (agree the plan with the surgeon in tibial and ankle trauma).</li>
<li><strong>Local anaesthetic toxicity</strong> when combined with other blocks and surgical infiltration.</li>
<li><strong>Wrong-side block</strong>: the patient is often turned lateral or prone after the check. Stop before you block: mark visible, time-out again after positioning.</li></ul>`,
    pearls: [
      'Start at the crease on the artery, then follow the tibial nerve up until the peroneal joins it.',
      'Tibial is the big one, medial; common peroneal is smaller, lateral, along biceps.',
      'Nerve gone? Tilt the probe caudally. Still gone? Ask for a see-saw (point and pull up the foot).',
      'Enter 2–3 cm lateral to the probe: a flat needle is a visible needle.',
      'Inside the sheath, between the nerves: one pop, one pool, both nerves.',
      'Fluid on top of the sheath and the nerves don’t part? Advance through it.',
      'Medial leg still sensate = saphenous, not a failed popliteal.',
      'Ideal for a calf cuff with a saphenous block; useless for a thigh cuff.',
      { safety: true, html: 'Numb foot, weak ankle: crutches, no weight-bearing, protect the heel.' }, // safety: shown at MO level
    ],
    sections: [
      {
        id: 'nerve-stim', title: 'Nerve stimulator: what the twitch tells you',
        html: `<ul><li><strong>Tibial nerve</strong>: plantarflexion and inversion of the foot, toe flexion. <strong>Common peroneal</strong>: dorsiflexion and eversion.</li>
<li><strong>Inversion</strong> (tibialis posterior, with a deep peroneal contribution from tibialis anterior) is the classic best single response before the bifurcation: it predicts the fastest, most complete block. Eversion alone suggests you are on the peroneal nerve only.</li>
<li>With ultrasound, use the stimulator as a <strong>safety monitor</strong>, not a target: set about 0.5 mA and expect <strong>no twitch</strong> as you approach. A twitch at very low current (below about 0.2 mA) suggests the tip is touching or inside the nerve. But no twitch does not prove you are outside it: watch the image and the injection pressure.</li></ul>`,
      },
      {
        id: 'landmark', title: 'Before ultrasound: landmark approaches',
        html: `<p>Exam material, and the fallback when there is no probe. Both use a nerve stimulator (start about 1–1.5 mA, aim for a twitch that persists at about 0.5 mA, as in the section above).</p>
<ul><li><strong>Posterior (intertendinous), prone:</strong> outline the triangle of the fossa: biceps femoris tendon laterally, semitendinosus and semimembranosus medially, the crease below. Enter in the midline between the tendons, classically about <strong>7 cm above the crease</strong>, aiming cephalad. Above the bifurcation one injection reaches both nerves.</li>
<li><strong>Lateral, supine:</strong> leg straight, foot free so you can watch the twitch. Enter in the <strong>groove between biceps femoris and vastus lateralis</strong> on the lateral thigh, well above the knee. Advance to the femur, withdraw and redirect posteriorly towards the nerve. Useful when the patient cannot be turned.</li>
<li><strong>Twitch:</strong> inversion or plantarflexion (tibial) is the one to accept; dorsiflexion or eversion alone means the common peroneal only: redirect slightly medially.</li></ul>`,
      },
      {
        id: 'catheter', title: 'Catheters',
        html: `<p>For major foot and ankle reconstructions, a <strong>popliteal catheter</strong> gives two to three days of analgesia. Out-of-plane from caudal (or in-plane from lateral), hydrodissect inside the sheath with 5 ml, thread <strong>3–5 cm</strong> past the tip, then inject through the catheter while scanning to see the fluid around the nerve. Fix it well; tunnel if it must last.</p>
<ul><li>Programmed intermittent boluses gave the same pain relief as a continuous infusion in a trial after major foot and ankle surgery, but a <strong>denser motor block</strong>: expect a weaker foot with bolus regimens.</li>
<li>Run dilute solutions (for example 0.2% ropivacaine) and plan who reviews the foot, the heel and the catheter site at home or on the ward.</li></ul>`,
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Bifurcation level varies.</strong> In cadavers it ranges from a few centimetres to well over 10 cm above the crease, and in some people the two nerves are separate in the thigh. If you only see two nerves, follow them up; if they never join, block each inside its own sheath (two injections) or move to a <a href="../thigh/">subgluteal approach</a>.</li>
<li><strong>The obese leg</strong>: curvilinear probe, a longer needle, prone or supine with the leg up; press firmly to compress fat and bring the nerve up. At some levels the common peroneal nerve lies superficial to the tibial nerve rather than beside it.</li>
<li><strong>Supine with the knee flexed</strong> suits fractures and external fixators: an assistant lifts the leg, or a stack of pillows under the calf and thigh leaves the fossa free. Lateral approach needle, probe from below.</li>
<li><strong>Intended subparaneural, not intraneural.</strong> Inside the paraneural sheath but outside the epineurium is the goal; ultrasound shows the nerves parting rather than swelling. Opening pressure monitoring adds protection where available.</li>
<li><strong>Rebound pain</strong> the first night after a dense single shot is common after ankle fracture fixation. Give regular oral analgesia before it wears off; IV dexamethasone (usually <strong>8 mg at induction</strong>; it raises blood glucose in diabetic patients) reduces rebound and prolongs the block by several hours, about as much as perineural use; consider a catheter for big operations.</li>
<li><strong>Anticoagulated patients</strong>: the popliteal fossa is superficial and compressible; with ultrasound and a careful risk–benefit decision it is often acceptable when neuraxial is not. Follow local guidance.</li>
<li><strong>Posterior knee pain after knee arthroplasty</strong>: use <strong>iPACK</strong> (on the <a href="../knee/">knee page</a>) rather than a popliteal sciatic block; it spares the common peroneal nerve and the foot.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>Liposomal bupivacaine</strong> is now licensed in the United States for a sciatic block in the popliteal fossa (and an adductor canal block), on the basis of trials showing lower pain scores over four days than plain bupivacaine. It is not available everywhere and its added value over plain local anaesthetic with adjuncts remains debated.</li>
<li><strong>Percutaneous peripheral nerve stimulation</strong>: a fine lead placed near the sciatic nerve (or the femoral nerve or brachial plexus) and stimulated for up to two weeks after ambulatory orthopaedic surgery, including foot and ankle surgery, reduced pain and opioid use in a sham-controlled pilot trial, without numbness or weakness. Combined devices that deliver both local anaesthetic and stimulation are in early trials.</li>
<li><strong>Dexamethasone</strong>: IV dexamethasone prolongs the block and reduces rebound pain after ankle fracture surgery; perineural use adds a little more duration but is off-label.</li>
<li><strong>Naming</strong>: the 2024 ASRA–ESRA consensus standardised limb block names as the nerve plus its anatomical location: the nerve first, then where it is blocked (here, the sciatic nerve at the popliteal fossa).</li>
<li><strong>Minimum volume</strong>: dose-finding studies of the subparaneural injection suggest that much smaller volumes than the classic 30–40 ml are enough for surgical anaesthesia, which leaves room in the toxicity budget for a saphenous block and surgical infiltration.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'MMed OSCE 2022 and 2025',
        q: '<p>Demonstrate the sonoanatomy for a popliteal sciatic nerve block on this volunteer. Describe how you would perform the block, and what it covers.</p>',
        points: [
          'Position: lateral, pillow under the leg (or prone, or supine with the leg raised). Linear probe; 80–100 mm echogenic needle.',
          'Start at the popliteal crease: popliteal artery (deepest), vein superficial to it, tibial nerve superficial to both. Colour Doppler.',
          'Trace cephalad until the common peroneal nerve joins the tibial nerve: the bifurcation, usually 5–10 cm above the crease.',
          'Name: biceps femoris laterally, semimembranosus and semitendinosus medially, the femur deep, the paraneural (Vloka’s) sheath around both nerves.',
          'In-plane, lateral to medial, entering the lateral thigh away from the probe to flatten the needle. Feel the pop through the sheath.',
          'Target: circumferential spread inside the sheath, or a single injection between the tibial and common peroneal nerves within the sheath. 15 ml of 0.4% ropivacaine in 5 ml aliquots.',
          'Covers the whole lower leg, ankle and foot except the anteromedial leg and medial malleolus (saphenous). Below-knee procedures; ideal for a calf tourniquet with a saphenous block.',
          'Anisotropy: tilt caudally; press harder to bring the nerve up; out-of-plane suits a catheter. Foot drop can delay mobilisation.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>The image shows a popliteal block. Label the structures. After 10 ml, the fluid sits above the nerve and the two branches have not separated. What do you do? Twenty minutes later the patient can still feel the inside of the ankle. Why?</p>',
        points: [
          'Labels: tibial nerve (medial, larger), common peroneal nerve (lateral), popliteal vein and artery deep, biceps femoris, semimembranosus/semitendinosus, femur.',
          'Fluid above the nerves without separation: the tip is outside the paraneural sheath. Stop, advance under vision until the sheath gives, and confirm the nerves part with 1–2 ml.',
          'Keep within the dose limit: count what has already been given.',
          'Medial ankle sensate: saphenous territory (femoral nerve), not covered by a popliteal block. Add a saphenous block (below the knee or distal adductor canal).',
          'Test all five territories; a patchy block usually means one branch was missed.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>A 70-year-old is listed for an emergency ray amputation of the right first metatarsal under a popliteal block. (a) Outline the anatomy relevant to the block. (b) The block is performed on the left leg. What may have contributed? (c) How do you manage it?</p>',
        points: [
          'Anatomy: popliteal fossa boundaries (semitendinosus and semimembranosus superomedially, biceps femoris superolaterally, the two heads of gastrocnemius inferiorly); contents superficial to deep: nerve, vein, artery; sciatic nerve dividing near the apex, at a variable level; common paraneural sheath.',
          'Contributors: emergency, after hours, remote site, fatigue, distraction, no visible site mark after positioning, no repeat time-out after turning the patient, junior unsupervised operator, patient unable to verify (unwell or sedated).',
          'Management: stop; check total dose given; open disclosure to the patient; choose the anaesthetic: repeat block on the correct side only if within the safe dose, or spinal, or general anaesthesia.',
          'Monitor for local anaesthetic toxicity; protect the wrongly blocked leg (falls, heel); follow up for nerve injury.',
          'Document, report as an incident, and review at the department (Stop Before You Block).',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>A 45-year-old has an open reduction and internal fixation of a bimalleolar ankle fracture. The surgeon is worried about compartment syndrome. Plan the anaesthetic and analgesia.</p>',
        points: [
          'Discuss with the surgeon first; document the plan and the patient’s consent.',
          'Spinal or general anaesthesia for surgery and the thigh cuff.',
          'If blocks are used: popliteal sciatic plus saphenous with dilute local anaesthetic, no adjuncts, single shot, timed so the block does not long outlast surgery; or no block and multimodal analgesia if the risk is high.',
          'Trained, regular ward observation; low threshold for compartment pressure measurement; breakthrough or escalating pain is a red flag, not a failed block.',
          'Multimodal: paracetamol, an NSAID if suitable, IV dexamethasone (reduces rebound pain), opioid rescue planned before the block wears off.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ ankle block
  {
    id: 'ankle',
    kicker: 'Foot and ankle · Five nerves',
    title: 'Ankle block',
    summary: `Five nerves blocked where they cross the ankle: two <strong>deep</strong> (tibial, deep peroneal), each beside an artery, and three <strong>superficial</strong> (superficial peroneal, sural, saphenous) in the fat under the skin. It numbs the <strong>foot below the malleoli</strong> and leaves the leg muscles working. Ultrasound makes the two deep nerves reliable; the landmark technique still works and every anaesthetist should know it. <a href="#ankle-pearls">Short on time? Jump to the pearls.</a>`,
    indications: ['Forefoot surgery: bunion, toes, ray amputation', 'Midfoot surgery with an ankle cuff', 'Diabetic foot debridement and amputations in high-risk patients', 'Day-case foot surgery: the patient can walk on the heel', 'Rescue of a single missed nerve after a popliteal block'],
    glance: {
      position: 'Supine, a support under the calf so the heel is free',
      probe: 'Linear (hockey stick if available), transverse, at each nerve',
      needle: '50 mm echogenic in-plane (ultrasound), or a 23G hypodermic (landmark)',
      dose: '17 ml of 0.5% ropivacaine (85 mg): tibial 5 ml, then 3 ml each for the other four',
      covers: 'The foot below the malleoli. Not a calf tourniquet.',
    },
    watch: { anim: 'ankle', caption: 'Ankle block: the medial view (tibial and saphenous nerves), the anterior view (deep peroneal) and the lateral view (superficial peroneal traced up the leg, and the sural nerve), with a negative example at the tibial nerve. On a phone, tap Full screen and turn the phone sideways to read the labels.', tier: 1 }, // Dr Chew Shi Hao's animation (lower-limb/anim/), loaded when opened
    scene: SCENES.tibial,
    position: '<p><strong>Supine</strong>, with a roll or a footrest under the calf so the heel and both malleoli are free and you can reach behind them. Externally rotate the leg for the tibial and saphenous nerves; internally rotate it for the sural. Stand at the foot of the bed for the front of the ankle.</p>',
    equipment: [
      'High-frequency linear probe (a small footprint helps behind the malleoli)',
      '50 mm echogenic needle for the deep nerves; 23–25G hypodermic for rings',
      '17 ml of 0.5% ropivacaine (more volume, same dose limit, for a landmark block)',
      'Colour Doppler: the two deep nerves are found by their arteries',
    ],
    landmarksTitle: 'Order and scanning',
    landmarks: `<p><strong>Tibial first</strong>: it is the biggest nerve with the slowest onset, and it supplies the sole. Then the deep peroneal, then the three superficial nerves. The scan viewer below shows the tibial nerve; the other four are under <a href="#ankle-us-nerves">Ultrasound, nerve by nerve</a>; the classic landmark ring is under <a href="#ankle-landmark">Landmark technique</a>.</p>
<ul><li><strong>Tibial</strong>: behind the medial malleolus, posterior to the posterior tibial artery. Scanning a few centimetres higher catches the calcaneal branches and keeps the probe off the bone.</li>
<li><strong>Deep peroneal</strong>: front of the ankle beside the anterior tibial artery on the tibia, between EHL and EDL. It may lie <strong>medial or lateral</strong> to the artery: find it on each scan.</li>
<li><strong>Superficial peroneal</strong>: above the fascia over the peroneus brevis–EDL groove, about 10 cm above the lateral malleolus, before it divides.</li>
<li><strong>Sural</strong>: beside the small saphenous vein between the lateral malleolus and the Achilles tendon.</li>
<li><strong>Saphenous</strong>: beside the great saphenous vein in front of the medial malleolus. Light pressure for both veins.</li></ul>`,
    approach: `<p><strong>In-plane</strong> at each site, short and shallow; the direction follows comfort (the scan viewers use posterior to anterior for the tibial nerve, lateral to medial for the deep peroneal). One well-placed deposit is enough: these nerves are small and take up local anaesthetic quickly, so you don’t need to redirect for full circumferential spread. Keep off the periosteum: injection under it is painful.</p>`,
    sonoanatomy: '<p>Tibial: Tom, Dick, Artery, Nerve, Harry (tibialis posterior, flexor digitorum longus, posterior tibial artery, tibial nerve, flexor hallucis longus) under the flexor retinaculum. Tendon or nerve? Slide up: tendons become muscle bellies, the nerve keeps its honeycomb. Flexing the big toe moves FHL under the nerve.</p>',
    target: `<p><strong>Deep nerves:</strong> fluid ringing the nerve beneath the retinaculum (flexor at the back, extensor at the front). Fluid spreading under the skin superficial to the retinaculum will not reach the nerve. <strong>Superficial nerves:</strong> fluid around the nerve, or around its vein when the nerve cannot be seen; without ultrasound, a continuous subcutaneous ring between the landmarks.</p>`,
    dose: {
      html: '<span class="tb-dose-v">17 ml</span> of <span class="tb-dose-v">0.5%</span> ropivacaine (85 mg)',
      note: '<strong>Tibial 5 ml</strong>, then <strong>3 ml each</strong> for the deep peroneal, superficial peroneal, sural and saphenous nerves. 1 ml first at each site to see the spread, aspirating. The landmark technique needs more volume (3–5 ml per nerve, the rings at the upper end, up to about 25 ml or 125 mg): stay within the maximum dose, about <strong>3 mg/kg</strong> of ropivacaine (210 mg at 70 kg), less in the frail. Avoid adrenaline when the foot’s circulation is poor.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['dorsum', 'sole'],
      areas: [
        { zones: ['sural-foot', 'sup-peroneal', 'deep-peroneal', 'tibial-sole', 'saphenous-foot', 'foot-bones'], density: 'dense' },
        { zones: ['calcaneal'], density: 'moderate' },
        { zones: ['ankle-joint'], density: 'patchy' },
      ],
      summary: 'The foot below the malleoli: skin, bones and joints of the forefoot and midfoot. The heel if the tibial nerve is blocked high enough. Not the ankle joint reliably.',
      mechanism: `<p>Each of the five nerves is blocked separately where it crosses the ankle. The deep nerves carry the bone and joint supply of the foot; the superficial nerves the skin of the top and sides.</p>`,
      density: `<p>Surgical anaesthesia of the foot when all five are blocked. Ultrasound improved the rate of surgical anaesthesia over landmarks in a large retrospective series, mostly in less experienced hands, and raised tibial nerve success in volunteers. Allow 20–30 minutes: test the sole (tibial) last, as it is the slowest.</p>`,
      misses: `<ul><li><strong>The ankle joint</strong> (branches leave above the block) and the lower leg.</li><li><strong>A calf or thigh tourniquet</strong>.</li><li><strong>The heel</strong> if the calcaneal branches leave above your tibial injection.</li></ul>`,
    },
    complications: `<ul><li><strong>Pain on injection</strong>: five injections, the rings in particular. Explain, use a fine needle, inject slowly, light sedation if needed.</li>
<li><strong>Vascular puncture and bruising</strong>: posterior tibial and dorsalis pedis arteries; the saphenous vein is the one most often hit. Aspirate.</li>
<li><strong>Nerve injury</strong>: rare; don’t inject against resistance or with sharp pain.</li>
<li><strong>Toxicity</strong>: low risk at these doses, but count when bilateral or combined.</li>
<li><strong>Ischaemia</strong>: no adrenaline in a digital ring, and avoid it at the ankle when the circulation is poor.</li></ul>`,
    pearls: [
      'Two deep (with an artery), three shallow (two with a vein).',
      'Tibial first: biggest nerve, slowest onset, the whole sole.',
      'Scan the tibial nerve a hand’s breadth up: off the bone, before the heel branches.',
      'Tendon or nerve? Slide up. Tendons become muscle; nerves stay nerves.',
      'Deep peroneal can be on either side of the artery: find it, don’t assume.',
      'Can’t see a superficial nerve? Ring its vein, or lay a subcutaneous wheal.',
      'Ankle cuff yes; calf cuff no.',
      { safety: true, html: 'No adrenaline in a toe; think twice at the ankle in a vascular foot.' }, // safety: shown at MO level
    ],
    sections: [
      {
        id: 'us-nerves', title: 'Ultrasound, nerve by nerve', tier: 1, // the other four nerves of an MO block
        html: '<p>The tibial nerve is in the main viewer above. Choose one of the other four: each has its own probe position, needle path and spread.</p>',
        render: (sec) => scanSwitcher(sec, [
          { key: 'dpn', label: 'Deep peroneal', scene: SCENES.dpn, blockId: 'ankle-dpn' },
          { key: 'spn', label: 'Superficial peroneal', scene: SCENES.spn, blockId: 'ankle-spn' },
          { key: 'sural', label: 'Sural', scene: SCENES.sural, blockId: 'ankle-sural' },
          { key: 'saph', label: 'Saphenous', scene: SCENES.sapAnkle, blockId: 'ankle-saph' },
        ], { label: 'Nerve', idPrefix: 'ankle-us' }),
      },
      {
        id: 'landmark', title: 'Landmark technique',
        html: `<p>No ultrasound, or a quick block in the anaesthetic room: two deep injections by pulse and bone, three subcutaneous rings. <strong>Supine, 23G hypodermic needle, 3–5 ml per nerve.</strong> Tap a nerve to watch the needle and the local anaesthetic, or play all five in order.</p>`,
        render: (sec) => {
          sec.append(ankleSection({ idPrefix: 'ankle-lm', mode: 'landmark' }));
          const p = el('div', { class: 'tb-prose' });
          p.innerHTML = `<ol>
<li><strong>Tibial (deep):</strong> behind the medial malleolus, just behind the posterior tibial pulse. Advance towards the back of the tibia; touch bone, withdraw 1–2 mm, aspirate, 5 ml.</li>
<li><strong>Deep peroneal (deep):</strong> between the extensor hallucis longus and extensor digitorum longus tendons, just lateral to the dorsalis pedis pulse; down to bone, back 1–2 mm, aspirate, 3–5 ml.</li>
<li><strong>Superficial peroneal (ring):</strong> subcutaneously from the front of the tibia to the lateral malleolus.</li>
<li><strong>Sural (ring):</strong> subcutaneously from the lateral malleolus to the Achilles tendon.</li>
<li><strong>Saphenous (ring):</strong> subcutaneously from the medial malleolus to the front of the ankle, around the great saphenous vein; aspirate.</li></ol>
<p>The three rings can be joined into one band round the front of the ankle from malleolus to malleolus. Theoretically avoid adrenaline. Expect it to sting more and to fail more often than the ultrasound block: test each territory.</p>`;
          sec.append(p);
        },
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Fit the block to the operation.</strong> The saphenous territory usually ends at the medial midfoot, short of the first tarsometatarsal joint, so for bunion and other forefoot surgery it can usually be left out. Include it when the incision extends back towards the midfoot, or for medial midfoot and ankle work. Ankle and hindfoot surgery need a popliteal block, because the joint branches leave higher.</li>
<li><strong>Supramalleolar (“high”) ankle block</strong>: blocking all five about 10 cm above the malleoli catches the nerves before they branch (the superficial peroneal and the calcaneal branches) and keeps the probe on soft tissue. The deep peroneal is then deep between tibialis anterior and EHL on the interosseous membrane.</li>
<li><strong>Diabetic and vascular feet</strong>: document pre-existing neuropathy; no adrenaline; avoid injecting through cellulitis or ulcers. The ankle block avoids general anaesthesia and spares the leg for early mobility.</li>
<li><strong>Combining with general anaesthesia</strong>: a laryngeal mask plus ankle block is a common day-case recipe; the block provides the analgesia and lets the patient go home walking on the heel.</li>
<li><strong>Bilateral surgery</strong>: two ultrasound ankle blocks (170 mg) fit within the maximum dose for most adults over about 60 kg, and avoid bilateral foot drop. Calculate by weight, reduce the concentration or volume in small or frail patients, and remember the surgeon’s infiltration.</li>
<li><strong>Rescue</strong>: after a popliteal block, a single missed territory can be topped up at the ankle (for example the saphenous ring or the superficial peroneal).</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>Ultrasound versus landmarks</strong>: the gain is clearest for the tibial nerve; for the deep peroneal nerve, ultrasound did not beat a careful landmark technique beyond the first 20 minutes in volunteers. Spend your scanning time behind the medial malleolus.</li>
<li><strong>Ankle cuffs under ankle block</strong>: a large audit showed the cuff is comfortable for most patients for about half an hour, with tolerance falling with time and in patients over 70: plan sedation or a calf cuff with a popliteal block for long cases.</li>
<li><strong>Vein as the target</strong>: for the sural nerve, ringing the small saphenous vein under ultrasound gave a faster, denser and longer block than the landmark ring in volunteers. The same perivenous logic works for the saphenous nerve with the great saphenous vein.</li>
<li><strong>Long-acting options</strong>: IV dexamethasone prolongs single-shot blocks; liposomal bupivacaine is licensed in some countries for other lower-limb blocks. For a day-case forefoot block, plain long-acting local anaesthetic with regular oral analgesia remains the standard.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'MMed OSCE 2023',
        q: '<p>Describe how you would perform a landmark ankle block for a forefoot amputation. Show the needle entry points on this model.</p>',
        points: [
          'Covers the foot: forefoot and toe surgery, amputations, debridement. Does not cover a calf tourniquet unless supplemented; five injections, more painful.',
          'Supine, support under the calf; 23G hypodermic needle; 3–5 ml per nerve; theoretically avoid adrenaline.',
          'Sural: subcutaneous, lateral malleolus to the Achilles tendon.',
          'Superficial peroneal: subcutaneous, lateral malleolus to the front of the ankle (tibial crest).',
          'Saphenous: subcutaneous, medial malleolus to the front of the ankle, around the great saphenous vein.',
          'Tibial (posterior tibial): deep, behind the medial malleolus, behind the posterior tibial artery pulse.',
          'Deep peroneal: deep, between EHL and EDL, lateral to the dorsalis pedis pulse.',
          'Ultrasound improves success, especially for the tibial nerve (find the artery).',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>List the five nerves blocked at the ankle, their origin, their sensory distribution in the foot, and the landmark for each.</p>',
        points: [
          'Tibial (sciatic): sole and heel; behind the medial malleolus, posterior to the posterior tibial artery, midway to the Achilles.',
          'Deep peroneal (common peroneal): first web space; between EHL and EDL, beside the dorsalis pedis/anterior tibial artery.',
          'Superficial peroneal (common peroneal): most of the dorsum except the first web space; subcutaneous ring from the tibial crest to the lateral malleolus.',
          'Sural (tibial and common peroneal): lateral border of the foot and the fifth toe; subcutaneous between the lateral malleolus and the Achilles tendon.',
          'Saphenous (femoral): medial ankle and foot; subcutaneous in front of the medial malleolus, around the great saphenous vein.',
          'Advantages: no leg motor block, day case, low dose, avoids GA. Disadvantages: several injections, painful, no calf/thigh tourniquet cover, vein puncture.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>After an ultrasound ankle block for a bunion operation, the patient feels the incision over the medial side of the first metatarsal and the sole under the big toe. Which nerves have been missed, and what do you do?</p>',
        points: [
          'Medial first metatarsal skin: mainly the medial dorsal cutaneous branch of the superficial peroneal nerve (the saphenous territory usually ends in the midfoot); sole under the big toe: medial plantar nerve (tibial).',
          'Tibial onset is the slowest: wait and retest before repeating.',
          'Top up the missed nerve under ultrasound within the dose limit, or ask for surgical infiltration, or convert to general anaesthesia.',
          'Next time: block the tibial nerve first, and make sure the superficial peroneal nerve is blocked before it divides (or add a subcutaneous wheal over the dorsomedial first metatarsal).',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ saphenous at and below the knee
  {
    id: 'saphenous',
    kicker: 'Foot and ankle · Femoral nerve',
    title: 'Saphenous nerve block at and below the knee',
    summary: `The saphenous nerve is the <strong>only femoral branch below the knee</strong>: purely sensory, it supplies the <strong>medial leg, medial malleolus and inner foot</strong>. It completes a popliteal block. Block it with ultrasound <strong>beside the great saphenous vein</strong> at the level of the tibial tuberosity, with a <strong>landmark field block</strong> below the knee, or higher, in the distal thigh, at the end of the adductor canal.`,
    indications: ['With a popliteal block: ankle surgery, medial foot surgery, below-knee amputation, calf tourniquet', 'Medial leg and ankle procedures (skin, vein harvest, wounds)', 'Rescue of a medial gap after a popliteal or ankle block', 'When the quadriceps must stay strong (no motor block below the knee)'],
    glance: {
      position: 'Supine, leg slightly externally rotated, knee a little flexed',
      probe: 'Linear, transverse on the medial leg at the tibial tuberosity (ultrasound)',
      needle: '50 mm echogenic in-plane (ultrasound); 23G hypodermic (landmark)',
      dose: '5 ml of 0.5% ropivacaine (25 mg) beside the vein; landmark 5–10 ml (25–50 mg)',
      covers: 'Medial leg below the injection, medial malleolus, inner border of the foot',
    },
    scene: SCENES.sapPv,
    position: '<p><strong>Supine</strong>, the leg slightly externally rotated and the knee a little flexed over a pillow, so the medial side of the leg faces you. Stand on that side, screen beyond the foot.</p>',
    equipment: [
      'Linear probe; a tourniquet or elastic band for the thigh to fill the vein',
      '50 mm echogenic needle (ultrasound) or a 23G hypodermic, as long as possible (landmark)',
      '5 ml of 0.5% ropivacaine (ultrasound) or 5–10 ml (landmark)',
    ],
    landmarksTitle: 'Where to block it',
    landmarks: `<p>The nerve leaves the <strong>adductor canal</strong> in the distal thigh, runs down between sartorius and gracilis to the medial knee, gives off the <strong>infrapatellar branch</strong> (skin below and inside the kneecap), then pierces the fascia and runs down the medial leg <strong>with the great saphenous vein</strong> to the front of the medial malleolus.</p>
<ul><li><strong>Below the knee, beside the vein (ultrasound paravenous)</strong>: the viewer above. Superficial, no muscle, no artery: simple and quadriceps-sparing.</li>
<li><strong>Below the knee, landmark field block</strong>: a subcutaneous ribbon from the tibial tuberosity to medial gastrocnemius (see <a href="#saphenous-landmark">Landmark field block</a>).</li>
<li><strong>Distal thigh, at the end of the adductor canal</strong> (distal subsartorial, or transsartorial): more reliable for the foot, still quadriceps-sparing when done low enough. See <a href="#saphenous-atknee">At the knee and above</a>.</li>
<li><strong>Adductor canal or femoral triangle</strong>: on the <a href="../knee/">knee page</a>; reliable but higher blocks can weaken vastus medialis.</li></ul>`,
    approach: `<p><strong>Ultrasound:</strong> in-plane, shallow, in the fat; either direction. The tip stops <strong>next to the vein, on the nerve’s side, not in the vein</strong>. Keep probe pressure light or the vein (your landmark) disappears.</p>`,
    sonoanatomy: '<p>Fat, the great saphenous vein (the black circle that collapses with pressure), the saphenous nerve as a small bright dot beside it (often not seen), the deep fascia, medial gastrocnemius behind and the bright medial surface of the tibia in front.</p>',
    target: `<p>Fluid <strong>surrounding the vein</strong> in the subcutaneous fat: the nerve, seen or not, lies within that ring. Fluid deep to the fascia (in gastrocnemius) or inside the vein is wrong.</p>`,
    dose: {
      html: '<span class="tb-dose-v">5 ml</span> of <span class="tb-dose-v">0.5%</span> ropivacaine (25 mg)',
      note: 'Ultrasound, beside the vein. <strong>Landmark field block: 5–10 ml</strong> of the same (25–50 mg). With a popliteal block (60 mg) the total is 85–110 mg: count it, and any surgical infiltration, against the patient’s maximum (about 3 mg/kg of ropivacaine, 210 mg at 70 kg). 0.5% matches the long popliteal block it usually accompanies; for the saphenous nerve on its own, 0.375% works as well.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front', 'dorsum'],
      areas: [
        { zones: ['saphenous-leg', 'saphenous-foot'], density: 'dense' },
      ],
      summary: 'The medial leg below the injection, the medial malleolus and the inner border of the foot. Not the knee.',
      mechanism: `<p>Below the knee the saphenous nerve and its branches lie in the subcutaneous fat close to the great saphenous vein, superficial to the deep fascia. Fluid around the vein reaches them. The infrapatellar branch has already left above the injection, so the skin of the knee is not covered.</p>`,
      density: `<p>Even without ultrasound, injecting beside the visible vein blocked the nerve in all 20 volunteers in its first description, against about a third with blind subcutaneous infiltration; with ultrasound the success is high (around 90% in a trial of the infracondylar approach). The landmark field block is among the least reliable approaches, especially for the medial foot. The territory of the saphenous nerve on the foot varies: the medial dorsal branch of the superficial peroneal nerve may supply part of it.</p>`,
      misses: `<ul><li><strong>The knee</strong> (infrapatellar branch, femoral and obturator branches).</li><li><strong>Everything else below the knee</strong>: it is a companion to a popliteal or ankle block, not a block on its own for most surgery.</li></ul>`,
    },
    complications: `<ul><li><strong>Bruising and haematoma</strong>: the vein is right there; aspirate, light pressure, and press afterwards.</li><li><strong>Intravascular injection</strong> into the vein: aspirate before each aliquot.</li><li><strong>Nerve injury</strong>: rare; the nerve is small and superficial.</li><li><strong>Failure</strong>: commonest with the landmark technique; check before the incision.</li></ul>`,
    pearls: [
      'The saphenous is the only femoral nerve below the knee: medial leg, medial malleolus, inner foot.',
      'Find the vein, find the nerve. Light pressure, or the vein vanishes.',
      'A thigh band fills the vein and makes the target obvious.',
      { safety: true, html: 'Ring the vein, not the inside of it: aspirate.' }, // safety: shown at MO level
      'Below-knee blocks spare the knee skin and the quadriceps.',
      'For foot surgery, a low adductor canal block is the most reliable saphenous block.',
      'Landmark field block: subcutaneous, not intradermal; inject as you withdraw.',
    ],
    sections: [
      {
        id: 'landmark', title: 'Landmark field block (below the knee)',
        html: `<p>The classic technique, needing nothing but a needle. <strong>From the tibial tuberosity</strong>, lay 5–10 ml <strong>subcutaneously round the medial leg</strong>, posteriorly to the anterior border of medial gastrocnemius. Advance the needle fully, then <strong>inject while withdrawing</strong>. Not intradermal; a long strip may need two or three entry points. It hurts more than the ultrasound block, and it fails more often: use it when there is no probe, and test before the incision.</p>`,
        render: (sec) => {
          const host = el('div', { class: 'fa-lm-host' });
          sec.append(host);
          mountScan(host, SCENES.sapLm, { blockId: 'saphenous-lm' });
        },
      },
      {
        id: 'atknee', title: 'At the knee and above: the distal adductor canal',
        html: `<ul>
<li><strong>Distal subsartorial (end of the adductor canal)</strong>: probe transverse on the medial thigh in the distal third, roughly a hand’s breadth above the patella, where the femoral artery leaves the canal through the adductor hiatus to become the popliteal artery. The target is just distal to where the saphenous nerve crosses the adductor magnus tendon, under sartorius, beside the saphenous branch of the descending genicular artery. 5–10 ml there blocked the saphenous nerve reliably with ambulation intact in a recent case series, and staining reached a nerve to vastus medialis only occasionally in cadavers.</li>
<li><strong>Transsartorial</strong>: just above the medial femoral condyle, through sartorius to the fat beneath it (ultrasound, or by loss of resistance). In volunteers the transsartorial approach was more reliable for the medial foot than the field block or a block at the medial condyle.</li>
<li><strong>Infracondylar</strong>: just below the medial tibial condyle, the nerve between the aponeuroses of sartorius and gracilis: as reliable as the subsartorial approach in a randomised trial.</li>
<li>Higher still (mid-thigh adductor canal, femoral triangle): reliable, but the higher you go the more likely the vastus medialis and quadriceps are weakened. See the <a href="../knee/">knee page</a>.</li></ul>`,
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Which saphenous block for which job.</strong> Forefoot: often not needed. Medial ankle, ankle fixation, medial malleolus: a distal adductor canal or below-knee paravenous block. Below-knee amputation: the saphenous at the adductor canal (or the femoral nerve) to cover the anteromedial skin and the tibial periosteum.</li>
<li><strong>Quadriceps sparing</strong> matters most in day-case and frail patients who will be on crutches with a popliteal foot drop on the same leg: a weak knee as well makes falls likely.</li>
<li><strong>Varicose veins, obesity, oedema</strong> make the paravenous view harder; go up to the distal adductor canal, where the artery is the landmark.</li>
<li><strong>The medial foot gap</strong>: if the inner border of the foot is still sensate after a good saphenous block, it may be the medial branch of the superficial peroneal nerve: a small subcutaneous wheal over the dorsum of the first metatarsal fixes it.</li>
<li><strong>Calf cuff</strong>: the saphenous covers the medial skin under the cuff; the sciatic covers the muscle. Together they make the cuff tolerable.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>Distal subsartorial compartment block</strong>: a recently described target just distal to the adductor hiatus, aimed at blocking the saphenous nerve alone for foot and ankle surgery while sparing the quadriceps.</li>
<li><strong>Distal adductor canal or below the knee?</strong> For foot and ankle surgery both spare the quadriceps when the injection is distal to the nerve to vastus medialis. The distal canal block uses the artery as its landmark and covers the medial foot more reliably; the below-knee paravenous block avoids the thigh altogether but depends on finding the vein. Choose by body habitus, the veins, and whether the patient is lateral or supine for the popliteal block.</li>
<li><strong>Selective infrapatellar branch blocks</strong> are being mapped with ultrasound for knee arthroscopy and to treat painful infrapatellar neuromas after knee surgery.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>A patient has had a popliteal sciatic block for an ankle fracture fixation. The medial malleolus and the medial side of the incision are still sensate. Explain why, and describe two ways to block the nerve responsible.</p>',
        points: [
          'The saphenous nerve (terminal sensory branch of the femoral nerve, L3–L4) supplies the medial leg, the medial malleolus and the inner foot; it is not part of the sciatic nerve.',
          'Ultrasound paravenous block below the knee: transverse at the tibial tuberosity, thigh band to fill the great saphenous vein, in-plane, 5 ml around the vein.',
          'Distal adductor canal (subsartorial) block: 5–10 ml under sartorius near the adductor hiatus; reliable for the foot, quadriceps largely spared.',
          'Landmark field block: 5–10 ml subcutaneously from the tibial tuberosity to medial gastrocnemius, injecting while withdrawing; less reliable.',
          'Check the total local anaesthetic dose with the popliteal block.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Compare the approaches to the saphenous nerve for foot and ankle surgery.</p>',
        points: [
          'Femoral triangle / mid-thigh adductor canal: reliable, may weaken vastus medialis and the quadriceps.',
          'Distal adductor canal / subsartorial / transsartorial: reliable for the foot, quadriceps spared when done low.',
          'Below the knee, paravenous with ultrasound: simple, superficial, high success; harder with varicose veins or obesity; vein puncture.',
          'Below-knee landmark field block: no equipment, but the least reliable and more painful.',
          'At the ankle: in front of the medial malleolus around the great saphenous vein; covers only the medial ankle and foot.',
        ],
      },
    ],
  },
];
