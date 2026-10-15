// Hip blocks: block data (schema: ../../../shared/regional/DATA.md, "Block schema"; leg figures: ../../shared/LEG.md).
// Doses for these four blocks are Dr Chew Shi Hao's (the owner's decision). Text is plain, with no citations.
import { legCoverageMap } from '../../../shared/regional/js/figures/leg.js';
import { SCENES } from './scenes.js?v=20261015';

export const BLOCKS = [
  // ------------------------------------------------------------------ PENG
  {
    id: 'peng',
    kicker: 'Hip · Pericapsular',
    title: 'PENG block (pericapsular nerve group)',
    summary: `Local anaesthetic on bone <strong>beneath the psoas tendon, between the anterior inferior iliac spine (AIIS) and the iliopubic eminence</strong>, where the high articular branches of the femoral nerve and the accessory obturator nerve cross the front of the hip capsule. It treats <strong>hip joint pain</strong> and usually leaves the quadriceps working. It does <strong>not</strong> numb the skin.`,
    indications: ['Neck of femur fracture (pain, positioning for spinal)', 'Intertrochanteric fracture (before surgery)', 'Hemiarthroplasty or THA (+ LFCN for the incision)', 'When early walking matters', 'Chronic hip pain (diagnostic block)'],
    glance: {
      position: 'Supine, hip neutral',
      probe: 'Linear (curvilinear if deep), along the superior pubic ramus from the AIIS',
      needle: '80–100 mm echogenic, in-plane, lateral to medial, to bone under the psoas tendon',
      dose: '20 ml of 0.2% ropivacaine (40 mg). With an LFCN block: total 25 ml, 50 mg',
      covers: 'Anterior hip capsule (articular branches). No skin.',
    },
    watch: { anim: 'peng', caption: 'PENG block: linear and curvilinear probes, and a negative example (tip short of the plane, in iliopsoas).', tier: 1 }, // Dr Chew Shi Hao's animation (lower-limb/anim/), loaded when opened
    scene: SCENES.peng,
    position: '<p>Supine, hip in neutral. Stand on the side to be blocked, screen opposite. In a large patient, a pillow under the buttock and tape (or an assistant) to lift the abdominal fold keep the probe on the AIIS-to-eminence line.</p>',
    equipment: [
      'Linear probe; curvilinear when the target is deeper than about 5 cm',
      '80–100 mm echogenic needle (the target is deep and the path steep)',
      '20 ml of 0.2% ropivacaine (25 ml if adding an LFCN block)',
      'Monitoring, IV access and the local anaesthetic toxicity kit within reach',
    ],
    landmarks: `<p><strong>Transverse on the ASIS</strong>, then slide caudally onto the <strong>AIIS</strong>. Keep the lateral end there and <strong>rotate the medial end caudally about 45°</strong>, so the probe lies along the superior pubic ramus, roughly parallel to the inguinal crease. Slide or tilt until <strong>AIIS, psoas tendon and iliopubic eminence</strong> share one view. The femoral artery should sit at the medial edge of the image, superficial: your safety landmark.</p><p>Line to say out loud: <em>ASIS → AIIS → psoas tendon → iliopubic eminence → pubic ramus</em>. Tilting caudally brings the femoral head into view; come back up to the ramus.</p>`,
    approach: `<p><strong>In-plane, lateral to medial</strong>, entering 1–2 cm lateral to the probe so the shaft clears the AIIS. Through sartorius (or rectus femoris), fascia iliaca and iliopsoas, then <strong>under the psoas tendon to bone</strong>. Withdraw 1 mm and aspirate.</p><p>The skin entry is close to the <strong>LFCN</strong>: if infiltration or the needle produces a shoot down the lateral thigh, move the entry point.</p>`,
    sonoanatomy: '<p>Labels to know: AIIS, iliopubic eminence, psoas tendon, iliopsoas, femoral artery and nerve, pectineus. The tendon is a bright oval in the groove between the two bony landmarks, under the much larger, darker iliopsoas muscle belly.</p>',
    target: `<p>The <strong>musculofascial plane between the psoas tendon and the periosteum</strong> of the ilium, between the AIIS and the eminence. Correct: the tendon lifts off the bone and fluid spreads along the bone medially and laterally. Wrong: a swelling inside iliopsoas (intramuscular, short of bone), or fluid tracking superficially towards the femoral nerve.</p>`,
    dose: {
      html: '<span class="tb-dose-v">20 ml</span> of <span class="tb-dose-v">0.2%</span> ropivacaine (40 mg)',
      note: 'With an LFCN block, add <strong>5 ml of 0.2%</strong> there: total 25 ml, 50 mg. Give it in 5 ml aliquots with aspiration. Don’t top up beyond the plan because the lift looks small: bigger volumes make femoral nerve spread and quadriceps weakness more likely.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front'],
      areas: [{ zones: ['hip-ant'], density: 'dense' }],
      summary: 'The anterior hip capsule (femoral and accessory obturator articular branches; obturator branches inconsistently). No skin: add an LFCN block or infiltration for the incision.',
      mechanism: `<p>The anterior capsule carries most of the joint’s sensory supply. In cadavers, <strong>high articular branches of the femoral nerve</strong> run between the AIIS and the iliopubic eminence, and the <strong>accessory obturator nerve</strong>, when present, crosses the eminence. Fluid under the psoas tendon sits right there. The obturator nerve’s articular branches reach the capsule further medially and inferiorly (near the inferomedial acetabulum), so a PENG block reaches them inconsistently.</p>`,
      density: `<p>Good for <strong>hip joint pain on movement</strong> (positioning, flexion). Imaging in patients shows the injectate staying mostly in and around iliopsoas, so think of it mainly as a block of the femoral (and accessory obturator) articular branches. Motor sparing is likely at about 20 ml, not guaranteed: test quadriceps strength before the patient stands.</p>`,
      misses: `<ul><li><strong>The skin incision</strong> (LFCN laterally; subcostal and iliohypogastric branches over the buttock).</li><li><strong>The posterior capsule</strong> (nerve to quadratus femoris, sciatic, superior gluteal branches): relevant for a posterior approach.</li><li><strong>The femoral shaft and lateral thigh</strong>: fixation with a sliding hip screw or nail is less well covered than arthroplasty.</li><li><strong>Obturator articular branches</strong>: often.</li></ul>`,
    },
    complications: `<ul><li><strong>Quadriceps weakness</strong> from spread to the femoral nerve (volume, or a superficial or intramuscular injection). Warn the patient and the ward: falls risk.</li><li><strong>Vascular puncture</strong>: femoral artery and vein medially; small vessels near the pubic ramus (for example pubic branches) along the path. Colour Doppler, aspirate, aliquots.</li><li><strong>LFCN injury</strong> at the skin entry.</li><li><strong>Intra-articular or intraneural injection</strong>: rare; stop with high pressure or pain.</li><li><strong>Local anaesthetic toxicity</strong>, especially when adding other blocks.</li></ul>`,
    pearls: [
      'Bone, tendon, bone: AIIS laterally, eminence medially, tendon in the groove between.',
      'The tendon must <strong>lift off bone</strong>. A swelling in the muscle is the wrong plane.',
      'PENG is for the joint, not the skin: add the LFCN for an anterior or lateral incision.',
      'Femoral artery at the medial edge of the screen: you are not going there.',
      'Stiff to inject on bone? The tip may be in periosteum, tendon or capsule (iliofemoral ligament): back 1 mm or turn the bevel.',
      { safety: true, html: 'Test quadriceps before the first walk. Motor sparing is likely, not certain.' }, // safety: shown at MO level
    ],
    sections: [
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Arthroplasty versus fixation.</strong> PENG suits capsular pain: displaced intracapsular fractures, hemiarthroplasty and total hip arthroplasty.</li>
<li><strong>Screw or nail?</strong> The pain is the lateral thigh and the femur below the capsule: a supra-inguinal fascia iliaca block (femoral plus LFCN) usually fits better. Before surgery, PENG often still helps an intertrochanteric fracture.</li>
<li><strong>Which incision?</strong> Anterior and anterolateral approaches: PENG plus LFCN covers most of it. A posterior approach crosses the buttock (not LFCN territory) and the posterior capsule: add surgical infiltration.</li>
<li><strong>PENG versus supra-inguinal fascia iliaca.</strong> In trials the two give similar pain relief (hip fracture before surgery; total hip arthroplasty after it). PENG preserves quadriceps and hip adductor strength better. Choose PENG when early walking matters; choose fascia iliaca when you also want the anterior and lateral thigh numb, or for femoral fractures.</li>
<li><strong>The hard patient.</strong> Obese: curvilinear probe, a steeper approach, an assistant to retract the pannus. After previous hip surgery or with heterotopic bone, the bony landmarks still guide you; the tendon may be hard to see.</li>
<li><strong>Volume and the quadriceps.</strong> At 20 ml, motor sparing is common, not reliable: in one hip arthroplasty trial about half had some quadriceps weakness at 3 hours and a quarter at 6 hours. Test the quadriceps before standing; don’t exceed the department’s 20 ml.</li>
<li><strong>The cadaver numbers.</strong> Dye reached the femoral nerve trunk in half the specimens at 20 ml and in all at 30 ml; the femoral-sparing volume (90% of cases) was about 13 ml.</li>
<li><strong>Anticoagulated or on antiplatelets?</strong> PENG is deep, on bone, and not easily compressed. Current ASRA and European (ESAIC/ESRA) guidance treats deep, non-compressible blocks more like neuraxial ones; weigh the benefit (often a single-shot PENG or fascia iliaca is still worth it) against the bleeding risk, and prefer a superficial, compressible block when the drug is fully active.</li>
<li><strong>Catheters</strong> under the psoas tendon have been described; they are not standard.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>How does it really work?</strong> CT imaging in patients shows PENG injectate staying mostly within the fascia of iliacus and psoas, with little capsular spread and none into the obturator foramen. Cadaver work agrees that the obturator articular branches are rarely reached. The analgesia is probably from the femoral nerve’s articular branches inside iliopsoas: it is a ‘femoral articular’ block more than a true pericapsular one.</li>
<li><strong>PENG plus LFCN versus fascia iliaca.</strong> A recent meta-analysis of six hip surgery trials favoured the combination for quadriceps strength and earlier walking, with slightly lower resting pain and no clear difference in opioid use.</li>
<li><strong>PENG versus local infiltration</strong> after total hip arthroplasty: similar pain and opioid use in pooled trials. The PROSPECT guideline for total hip arthroplasty recommends fascia iliaca block or local infiltration analgesia (with paracetamol, an NSAID and IV dexamethasone); PENG had too little evidence when it was written.</li>
<li><strong>Chronic hip pain.</strong> The same articular branches (between the AIIS and eminence, and at the inferomedial acetabulum) are targets for radiofrequency ablation and cryoneurolysis in patients unfit for arthroplasty.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>Describe the sensory innervation of the hip joint. Which part does a PENG block target, and why is it described as motor sparing?</p>',
        points: [
          'Hilton’s law: the nerves supplying the muscles that cross the hip also supply the joint.',
          'Anterior capsule: femoral nerve (high articular branches), obturator nerve, accessory obturator nerve when present. The anterior capsule has most of the sensory supply.',
          'Posterior capsule: nerve to quadratus femoris (the main one), with branches from the sciatic and superior gluteal nerves.',
          'PENG: local anaesthetic under the psoas tendon on bone between the AIIS and the iliopubic eminence, where the femoral and accessory obturator articular branches cross.',
          'Motor sparing: it targets articular branches, not the femoral nerve trunk. At 20 ml the quadriceps is often spared, not reliably (in one trial about half had some weakness at 3 hours). Larger volumes or a superficial injection reach the femoral nerve.',
          'Limits: no skin cover (add LFCN), posterior capsule not covered, obturator branches inconsistently.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>An 82-year-old is listed for a cemented hemiarthroplasty through an anterolateral approach. Plan the regional analgesia.</p>',
        points: [
          'Before positioning for spinal: PENG (or supra-inguinal fascia iliaca) 20–30 minutes before, for capsular pain on movement.',
          'PENG 20 ml of 0.2% ropivacaine plus LFCN 5 ml of 0.2%: total 50 mg, within the maximum for a frail 50 kg patient.',
          'The LFCN covers the lateral thigh incision; the PENG covers the anterior capsule; quadriceps spared for early walking.',
          'Multimodal: regular paracetamol, opioid rescue; avoid or use NSAIDs with great caution in frail older patients.',
          'Watch for bone cement implantation syndrome; communicate before cementing.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ supra-inguinal fascia iliaca
  {
    id: 'fib',
    kicker: 'Hip · Fascia iliaca compartment',
    title: 'Supra-inguinal fascia iliaca block',
    summary: `A <strong>volume block</strong> of the plane under fascia iliaca, injected <strong>above the inguinal ligament</strong> so the local anaesthetic runs cranially into the iliac fossa over iliacus. It reliably blocks the <strong>femoral nerve and the lateral femoral cutaneous nerve (LFCN)</strong>; the obturator nerve is <strong>not</strong> reliably blocked.`,
    indications: ['Hip fracture (ED or pre-spinal)', 'Femoral shaft fracture', 'Hip fixation (screw, nail)', 'Total hip arthroplasty (adjunct)', 'Anterior and lateral thigh surgery', 'AKA (with sciatic + obturator)'],
    glance: {
      position: 'Supine',
      probe: 'Linear, parasagittal just medial to the ASIS, over the AIIS',
      needle: '80–100 mm, in-plane, caudal to cranial',
      dose: '40 ml of 0.2% ropivacaine (80 mg), 5 ml aliquots',
      covers: 'Femoral nerve and LFCN: anterior and lateral thigh, anterior hip, femur, anterior knee; obturator sometimes, not reliable',
    },
    watch: { anim: 'fib', caption: 'Supra-inguinal fascia iliaca: the scan from ASIS to AIIS to bow-tie, the in-plane block, and two common errors.', tier: 1 }, // Dr Chew Shi Hao's animation (lower-limb/anim/), loaded when opened
    scene: SCENES.fib,
    position: '<p>Supine, leg straight. Expose the groin from above the ASIS to the upper thigh. In a patient with a pannus, tape it cranially or have an assistant retract it.</p>',
    equipment: [
      'Linear probe (curvilinear if deep)',
      '80–100 mm echogenic needle',
      '40 ml of 0.2% ropivacaine in 20 ml syringes, with an extension',
      'Colour Doppler; monitoring and the toxicity kit',
    ],
    landmarks: `<p><strong>Parasagittal on the ASIS</strong>: a bright bony step with a dense shadow; sartorius runs caudally from it, the abdominal wall muscles attach cranially. <strong>Slide medially</strong> along the inguinal ligament: the ilium drops deeper and the <strong>AIIS</strong> appears as a hump with iliacus on it. Now find the <strong>bow-tie</strong>: internal oblique (cranial) and sartorius (caudal) taper towards each other where they meet at the inguinal ligament.</p><p>Under the bow-tie, the bright <strong>fascia iliaca</strong> runs cranially on iliacus, down into the iliac fossa. Colour Doppler: the <strong>deep circumflex iliac artery (DCIA)</strong> pulses just superficial to fascia iliaca, cranial to the AIIS. Your target is the plane under the fascia, deep to that artery.</p>`,
    approach: `<p><strong>In-plane, caudal to cranial</strong>, entering 2–4 cm below the inguinal ligament. Pass through sartorius. Fascia iliaca tents, then gives: puncture it <strong>cranial to the hump of the AIIS</strong>, then hydrodissect and advance a little into the opening plane.</p><p>Resistance helps: stiff injection while the fascia is still tented means you are not through yet. Advance until it gives; don’t push harder.</p>`,
    sonoanatomy: '<p>Labels for the exam: internal oblique, sartorius (the bow-tie), fascia iliaca, iliacus, ilium/AIIS, deep circumflex iliac artery. Trace fascia iliaca from caudal to cranial and show where the needle ends: just deep to it, cranial to the AIIS.</p>',
    target: `<p>Fluid <strong>lifts fascia iliaca off iliacus</strong> and runs cranially under the DCIA into the iliac fossa (it “unzips” the plane). That cranial spread is what reaches the LFCN and the femoral nerve as they cross iliacus. Wrong planes: fluid pooling <strong>above</strong> fascia iliaca (deep to internal oblique; a common cause of failure) or a swelling <strong>within</strong> iliacus.</p>`,
    dose: {
      html: '<span class="tb-dose-v">40 ml</span> of <span class="tb-dose-v">0.2%</span> ropivacaine (80 mg)',
      note: 'A volume block: give it all, in 5 ml aliquots with aspiration, watching each one layer out under the fascia. Ease off the probe as you inject. 80 mg is within the usual maximum for an adult. A common teaching maximum for a single dose of ropivacaine is about 3 mg/kg, lower in frail older patients; use lean (ideal) body weight in the light and frail, and count every other dose given that day (an emergency department block, the surgeon’s infiltration).',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front'],
      areas: [
        { zones: ['lfcn', 'femoral-ant', 'hip-ant', 'femur'], density: 'dense' },
        { zones: ['saphenous', 'knee-ant'], density: 'moderate' },
        { zones: ['obturator'], density: 'patchy' },
      ],
      summary: 'Femoral nerve and LFCN: anterior and lateral thigh, anterior hip, femur and anterior knee, a strip of medial leg (saphenous). Obturator: sometimes, not reliable.',
      mechanism: `<p>The femoral nerve and LFCN both run <strong>on iliacus, under fascia iliaca</strong>, in the iliac fossa. A large volume injected above the inguinal ligament spreads cranially within that compartment and bathes both. The obturator nerve leaves the medial border of psoas and runs in the pelvis, outside the compartment, so it is reached only when the fluid spreads far medially around psoas.</p><p>The fascia iliaca compartment: in front, the back of fascia iliaca; behind, iliacus and psoas; medially, the vertebral column and the origin of psoas; laterally, the inner lip of the iliac crest.</p>`,
      density: `<p>The <strong>LFCN</strong> (lateral thigh) is a reliable early test of success. Then the femoral territory (anterior thigh, quadriceps). In a volunteer study with 40 ml, the supra-inguinal approach numbed the medial, anterior and lateral thigh together in 80%, against 30% for the infra-inguinal approach. Allow 20–30 minutes; test the lateral, anterior and medial thigh separately: a missing area tells you which nerve the fluid did not reach.</p>`,
      misses: `<ul><li><strong>Obturator nerve</strong>: not reliably blocked (medial thigh, part of the hip and knee).</li><li><strong>Posterior hip and the buttock</strong> (sacral plexus, cluneal nerves).</li><li><strong>Quadriceps strength</strong>: it is lost. This is not a motor-sparing block.</li></ul>`,
    },
    complications: `<ul><li><strong>Quadriceps weakness</strong>: expected. Falls risk; tell the patient and the ward.</li><li><strong>Vascular puncture</strong>: the DCIA lies on the needle path just above the target. Colour Doppler first.</li><li><strong>Peritoneal puncture and bowel injury</strong> if the needle goes too deep or too cranial in the iliac fossa. Keep the tip in view.</li><li><strong>Local anaesthetic toxicity</strong>: large volume; aspirate, aliquots, count the total.</li><li><strong>Failure</strong>: fluid above fascia iliaca, or intramuscular.</li></ul>`,
    pearls: [
      'Find the bow-tie: internal oblique cranial, sartorius caudal.',
      'Colour Doppler: the DCIA marks the plane. Go under it, not into it.',
      'Puncture the fascia cranial to the AIIS hump, then hydrodissect.',
      'Fascia must lift off iliacus. Pooling above it = failed block.',
      'The lateral thigh (LFCN) is your reliable early test.',
      { safety: true, html: '“Fascia iliaca” is not motor sparing: the quadriceps will be weak.' }, // safety: shown at MO level
      'Obturator nerve: don’t promise it.',
    ],
    sections: [
      {
        id: 'infra', title: 'Infra-inguinal fascia iliaca: the comparison',
        html: `<p>The original fascia iliaca block was a <strong>landmark</strong> technique below the inguinal ligament, now usually done with ultrasound in the femoral view, more <strong>lateral</strong> than a femoral block, with a <strong>larger volume of dilute</strong> local anaesthetic, hoping it spreads to the LFCN (and the obturator). See it in the <a href="#femoral-inj-fiib">femoral scan viewer, “Infra-inguinal fascia iliaca”</a>.</p>
<ul><li><strong>Landmark:</strong> draw the inguinal ligament (ASIS to pubic tubercle) and divide it in thirds. Enter <strong>1 cm below the junction of the lateral and middle thirds</strong> with a blunt needle perpendicular to the skin: two pops (fascia lata, then fascia iliaca), then 30–40 ml of a dilute solution with firm pressure distal to the needle.</li>
<li><strong>Ultrasound:</strong> transverse at the inguinal crease; under sartorius, lateral to the nerve; tip just under fascia iliaca; watch it spread medially to the nerve and laterally.</li>
<li>From here the fluid spreads more <strong>caudally</strong>; cranial spread to the LFCN is less consistent and to the obturator rare. In volunteers, MRI showed spread to the obturator nerve’s location in 1 of 10 infra-inguinal blocks against 8 of 10 supra-inguinal ones (that is spread, not a reliable clinical block).</li>
<li>An older placebo-controlled trial found no benefit from an <strong>infra-inguinal</strong> fascia iliaca block after total hip arthroplasty. That result does not apply to the supra-inguinal approach, which reduced morphine use against no block in a later trial.</li>
<li>It remains useful: quick, far from the nerve, and taught to emergency staff for hip fracture analgesia.</li></ul>`,
        render: (sec) => {
          const wrap = document.createElement('div');
          wrap.className = 'tb-table-wrap';
          wrap.innerHTML = `<table class="tb-table hp-cmp"><caption>Supra- versus infra-inguinal</caption><thead><tr><th scope="col"></th><th scope="col">Supra-inguinal</th><th scope="col">Infra-inguinal</th></tr></thead><tbody>
<tr><th scope="row">Probe</th><td>Parasagittal, medial to ASIS, over AIIS</td><td>Transverse at the inguinal crease, lateral to the nerve</td></tr>
<tr><th scope="row">Needle</th><td>In-plane, caudal to cranial</td><td>In-plane, lateral to medial (or landmark, two pops)</td></tr>
<tr><th scope="row">Spread</th><td>Cranially into the iliac fossa</td><td>Mostly caudally and medially</td></tr>
<tr><th scope="row">Femoral</th><td>Reliable</td><td>Reliable</td></tr>
<tr><th scope="row">LFCN</th><td>Reliable</td><td>Variable</td></tr>
<tr><th scope="row">Obturator</th><td>Sometimes, not reliable</td><td>Rare</td></tr>
<tr><th scope="row">Best for</th><td>Hip fracture, hip arthroplasty</td><td>Quick ED analgesia, femoral fractures</td></tr></tbody></table>`;
          sec.append(wrap);
        },
      },
      {
        id: 'catheter', title: 'Catheters',
        html: '<p>A catheter can be threaded 3–5 cm cranially under fascia iliaca from the supra-inguinal view (Tuohy, in-plane caudal to cranial, hydrodissect, thread, test with fluid while scanning). Used for femoral shaft fractures awaiting surgery or prolonged analgesia; the cost is a weak quadriceps for as long as it runs. Fix it well: the groin is mobile and sweaty.</p>',
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>When to choose it over PENG:</strong> femoral shaft or subtrochanteric fractures, fixation with a nail or screw (lateral thigh and femur), when you want the skin numb for the incision, or in the emergency department where one block must do everything.</li>
<li><strong>After induction:</strong> it is a plane block far from the nerve, so it can be done under general anaesthesia (for example after a failed spinal or for an unexpected fixation).</li>
<li><strong>The pannus and the deep fossa:</strong> curvilinear probe, longer needle, an assistant; keep the tip in view because peritoneum is not far medially.</li>
<li><strong>Distorted anatomy</strong> after hip arthroscopy (fluid extravasation) or previous surgery: rescan from the ASIS each time.</li>
<li><strong>Anticoagulated or on antiplatelets</strong> (common in hip fracture): current ASRA and European (ESAIC/ESRA) guidance sets neuraxial-type rules for deep, non-compressible blocks and a risk-benefit judgement for superficial, compressible ones. The infra-inguinal fascia iliaca and femoral blocks are superficial and compressible; the supra-inguinal approach reaches the non-compressible iliac fossa near the DCIA, so weigh it more carefully. A lumbar plexus block follows neuraxial rules.</li>
<li><strong>Explaining the weakness:</strong> the patient will not be able to straight-leg raise. Document it, tell physiotherapy, and plan walking for when it wears off.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>PENG or supra-inguinal fascia iliaca for hip fracture?</strong> A 2025 randomised trial found the same fall in dynamic pain 30 minutes after either block (20 ml PENG versus 30 ml fascia iliaca). The choice is about motor function and what else you want covered, not about analgesia.</li>
<li><strong>Delirium and outcomes.</strong> Nerve blocks for hip fracture reduce pain on movement within 30 minutes, and reduce delirium (high-certainty evidence) and probably chest infection, compared with no block.</li>
<li><strong>Pre-hospital blocks.</strong> Paramedic-delivered fascia iliaca blocks are being used and studied in several countries.</li>
<li><strong>Mechanism of plane blocks:</strong> spread on the screen correlates imperfectly with sensory loss; what matters is the mass of local anaesthetic that reaches the nerves. Deposit in the right compartment, give the full volume, then test.</li>
<li><strong>Naming.</strong> The 2024 ASRA-ESRA consensus agreed to name limb blocks by the target nerve and the anatomical location.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'MMed OSCE 2020',
        q: '<p>Perform a supra-inguinal fascia iliaca block on the model. Trace fascia iliaca on the screen and show where your needle tip will end.</p>',
        points: [
          'Supine; linear probe; 80–100 mm echogenic needle; 40 ml of 0.2% ropivacaine.',
          'Probe parasagittal on the ASIS, slide medially to the AIIS; find the bow-tie (internal oblique cranial, sartorius caudal).',
          'Trace fascia iliaca as the bright line on iliacus from caudal to cranial, into the iliac fossa; identify the DCIA with colour Doppler just above it.',
          'In-plane, caudal to cranial, through sartorius; puncture fascia iliaca cranial to the AIIS.',
          'Tip ends just deep to fascia iliaca, deep to the DCIA; fluid lifts the fascia off iliacus and spreads cranially.',
          'Aliquots with aspiration; watch for fluid above the fascia or in the muscle.',
        ],
      },
      {
        source: 'MMed OSCE 2024',
        q: '<p>Which nerves does a supra-inguinal fascia iliaca block cover? What sensory and motor effects do you expect?</p>',
        points: [
          'Femoral nerve: anterior thigh (anterior cutaneous branches), medial leg and ankle (saphenous), the hip and knee joints anteriorly and medially, the femur.',
          'LFCN: lateral thigh. Usually the first area to go numb.',
          'Obturator nerve: sometimes, not reliable.',
          'Motor: quadriceps weakness (knee extension); falls risk.',
          'Doesn’t cover the posterior hip and buttock (sacral plexus).',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>What are the boundaries of the fascia iliaca compartment, and why does the supra-inguinal approach spread better than the infra-inguinal approach?</p>',
        points: [
          'Anterior: the posterior surface of fascia iliaca. Posterior: iliacus and psoas. Medial: the vertebral column and the origin of psoas. Lateral: the inner lip of the iliac crest.',
          'The femoral nerve and LFCN run on iliacus in this compartment; the obturator nerve runs medial to psoas, outside it.',
          'Supra-inguinal injection goes straight into the iliac fossa and spreads cranially towards the lumbar plexus; infra-inguinal injection relies on spread back up under the inguinal ligament and tends to go caudally.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ femoral
  {
    id: 'femoral',
    kicker: 'Hip and thigh · Femoral nerve',
    title: 'Femoral nerve block',
    summary: `Local anaesthetic around the femoral nerve <strong>under fascia iliaca, lateral to the femoral artery</strong>, at the inguinal crease. It numbs the anterior thigh, the femur, the anterior knee and a strip of medial leg (saphenous), and it <strong>weakens the quadriceps</strong>.`,
    indications: ['Femoral neck and shaft fractures (also in the emergency department)', 'Surgery on the femur, patella and quadriceps tendon', 'Anterior thigh and knee surgery (when quadriceps weakness doesn’t matter)', 'Part of an above-knee amputation plan (with sciatic, LFCN and obturator)'],
    glance: {
      position: 'Supine, hip extended, slight abduction',
      probe: 'Linear, transverse on the inguinal crease over the pulse',
      needle: '80 mm echogenic (50 mm if slim), in-plane, lateral to medial',
      dose: '15 ml of 0.4% ropivacaine (60 mg), 5 ml aliquots',
      covers: 'Anterior thigh, femur, anterior knee, medial leg strip',
    },
    watch: { anim: 'femoral', caption: 'Femoral nerve block: in-plane, lateral to medial, and two needle errors (above fascia iliaca; into iliopsoas).', tier: 1 }, // Dr Chew Shi Hao's animation (lower-limb/anim/), loaded when opened
    scene: SCENES.femoral,
    position: '<p>Supine, bed flat, hip extended with the leg slightly abducted. Expose the inguinal crease; tape a pannus up and away so the probe can reach the level above the profunda.</p>',
    equipment: [
      'High-frequency linear probe (the nerve is 2–4 cm deep in most adults)',
      '80 mm echogenic needle (50 mm in a slim patient); nerve stimulator optional',
      '15 ml of 0.4% ropivacaine',
      'Monitoring and the toxicity kit',
    ],
    landmarks: `<p>Probe <strong>transverse on the inguinal crease</strong>, parallel to it, over the femoral pulse. Find the <strong>femoral artery</strong>. If you see two arteries, you are below the origin of the <strong>profunda femoris</strong>: slide cranially until there is one. The nerve is undivided and easiest to see there.</p><p>The nerve is <strong>lateral to the artery, on iliopsoas, deep to fascia iliaca</strong>: a flattened hyperechoic oval or triangle. Follow it up and down to make sure it is not a lymph node, and to see where it divides.</p>`,
    approach: `<p><strong>In-plane, lateral to medial.</strong> The nerve is the most lateral structure in the neurovascular bundle, so the needle reaches it without crossing a vessel. A first give at fascia lata, then fascia iliaca tents and gives. Puncture fascia iliaca <strong>lateral to the nerve</strong> and stop at its lateral corner.</p>`,
    sonoanatomy: '<p>The five structures to name (an international consensus on basic blocks): femoral artery, femoral vein, iliopsoas, fascia lata and fascia iliaca, with the femoral nerve as the target. Add sartorius laterally and pectineus medially. The femoral sheath holds the artery and vein; the nerve is <strong>outside the sheath</strong>, behind fascia iliaca.</p>',
    target: `<p>Fluid <strong>under fascia iliaca</strong>, lifting it and spreading around the nerve, ideally a doughnut, though a pool against the deep or superficial surface of the nerve is enough. Correct injection pushes the nerve away from the needle. Fluid spreading <strong>above</strong> fascia iliaca (between it and fascia lata) cannot reach the nerve.</p>`,
    dose: {
      html: '<span class="tb-dose-v">15 ml</span> of <span class="tb-dose-v">0.4%</span> ropivacaine (60 mg)',
      note: 'In 5 ml aliquots, aspirating between. Never inject against high resistance: the tip may be in the nerve or still on the fascia.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front'],
      areas: [
        { zones: ['femoral-ant', 'femur', 'knee-ant'], density: 'dense' },
        { zones: ['saphenous', 'hip-ant'], density: 'moderate' },
      ],
      summary: 'Anterior and medial thigh to the knee, the femur, the anterior knee, and a strip of medial leg to the medial malleolus (saphenous).',
      mechanism: `<p>The femoral nerve (L2–L4, posterior divisions) leaves the lateral border of psoas, runs in the groove between psoas and iliacus under fascia iliaca, and enters the thigh behind the inguinal ligament, lateral to the artery. It divides within a few centimetres: an anterior division (sartorius, pectineus, medial and intermediate cutaneous nerves of the thigh) and a posterior division (quadriceps, the saphenous nerve, articular branches to the hip and knee).</p>`,
      density: `<p>Dense skin and bone cover of the anterior thigh. For hip fracture it helps: the femoral nerve supplies part of the anterior capsule and much of the femur. The <strong>quadriceps is weak</strong>: in volunteers, a femoral nerve block cut quadriceps strength to about a tenth of baseline and worsened balance, while an adductor canal block left both near baseline.</p>`,
      misses: `<ul><li><strong>LFCN</strong> (lateral thigh): a “3-in-1” block, despite the name, rarely reaches the obturator and only sometimes the LFCN.</li><li><strong>Obturator</strong> (medial thigh, part of the hip and knee).</li><li><strong>Sciatic</strong> (posterior thigh, posterior knee, the leg below the knee except the saphenous strip).</li></ul>`,
    },
    complications: `<ul><li><strong>Falls</strong> from quadriceps weakness: the patient must not walk unaided until it has worn off. Tell the ward.</li><li><strong>Vascular puncture and intravascular injection</strong>: the artery is right beside the nerve; the vein occasionally lies partly deep to the artery, and rarely the anatomy is variant, so scan with Doppler first. Ease off the probe, Doppler, aspirate.</li><li><strong>Nerve injury</strong>: rare. Avoid needle–nerve contact; stop with high pressure or pain.</li><li><strong>Infection</strong> with catheters in the groin.</li></ul>`,
    pearls: [
      'One artery, not two: block above the profunda.',
      'Nerve lateral, under fascia iliaca. Vessels in the sheath; nerve outside it.',
      'Two gives: fascia lata, then fascia iliaca.',
      'Don’t chase a full doughnut: a pool on one side is enough.',
      'Twitch you want: “dancing patella” (quadriceps). Sartorius alone is not enough.',
      { safety: true, html: 'A femoral block means a weak leg: falls precautions are part of the block.' }, // safety: shown at MO level
    ],
    sections: [
      {
        id: 'nerve-stim', title: 'Nerve stimulator endpoints',
        html: `<p>Ultrasound is the main guide; a stimulator confirms the nerve. Start at about 1 mA (0.1 ms, 2 Hz) and aim for the right twitch at 0.3–0.5 mA. A twitch that persists below 0.2 mA suggests the tip is in or against the nerve: withdraw a little before injecting.</p>
<ul><li><strong>Quadriceps twitch with the patella moving up (“dancing patella”):</strong> posterior division. The right endpoint.</li><li><strong>Sartorius twitch</strong> (a band across the medial thigh, no patellar movement): anterior division, or a direct muscle twitch. Redirect slightly <strong>lateral and deeper</strong>.</li><li><strong>Iliopsoas twitch</strong> (hip flexion): too deep. Withdraw.</li><li>No twitch at high current with ultrasound showing good spread: trust the spread.</li></ul>`,
      },
      {
        id: 'landmark', title: 'Landmark technique',
        html: '<p>Supine. Draw the inguinal ligament (ASIS to pubic tubercle), feel the femoral pulse at or just below it, and insert the needle <strong>1–2 cm lateral to the pulse</strong>, at the crease. With a stimulator, advance until the quadriceps twitch appears. Two pops (fascia lata, fascia iliaca) may be felt with a short-bevel needle. Ultrasound has largely replaced this: it shows the vein’s position, the fascia and the spread.</p>',
      },
      {
        id: 'catheter', title: 'Catheters',
        html: '<p>Five steps: needle placement, injection through the needle to confirm the plane, catheter advancement (2–4 cm past the tip), injection through the catheter while scanning, and securing it. A more <strong>lateral</strong> entry leaves more catheter in iliacus, which holds it better than fat. A common regimen is 0.2% ropivacaine at about 5 ml/h with patient-controlled boluses, as your pain service directs. The quadriceps stays weak while it runs.</p>',
      },
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Femoral or fascia iliaca for a hip fracture?</strong> The 2020 Association of Anaesthetists guideline accepts either; the fascia iliaca block may give better incisional cover (it adds the LFCN). For femoral shaft fractures a femoral block works well and quickly.</li>
<li><strong>Above-knee amputation in a sick patient</strong> (pure regional): femoral, sciatic (subgluteal or transgluteal, which also catches the posterior femoral cutaneous nerve), LFCN and obturator. A supra-inguinal fascia iliaca block can replace the femoral and LFCN injections. See the <a href="../thigh/#ch-amputation">amputation planner</a>, the <a href="../thigh/#ch-sciatic">sciatic block</a> and the <a href="../knee/#ch-obturator">obturator block</a>.</li>
<li><strong>The femoral-to-adductor continuum:</strong> the further distal along the femoral triangle and adductor canal, the more selectively sensory (saphenous) the block, at the cost of losing the hip and upper thigh. See the <a href="../knee/#ch-adductor-canal">femoral triangle and adductor canal block</a>.</li>
<li><strong>Anticoagulated?</strong> The femoral nerve block is superficial and compressible, so it is often the safer choice when a drug is still active; it is a risk-benefit judgement under the ASRA and European guidance, not a neuraxial rule.</li>
<li><strong>Difficult views</strong> after hip arthroscopy (fluid pushes everything deeper) or with lymph nodes: scan from the artery outwards; a nerve can be traced, a node cannot.</li>
<li><strong>Anisotropy:</strong> tilt the probe cranially or caudally; the nerve often brightens after the first 1–2 ml.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>Motor-sparing alternatives</strong> have displaced the femoral nerve block for elective hip and knee surgery: PENG (hip), adductor canal and femoral triangle blocks (knee). The PROSPECT guideline for total hip arthroplasty does not recommend a femoral nerve block, as its adverse effects (weakness, falls) outweigh the benefits there.</li>
<li><strong>Hip fracture PENG versus femoral:</strong> in a randomised trial, PENG gave less pain in recovery than a femoral nerve block (no difference by the next day) and better quadriceps strength, in recovery and still on day 1.</li>
<li><strong>Opening injection pressure:</strong> high opening pressure goes with needle–nerve or needle–fascia contact during femoral block. Pressure monitoring (or a syringe you can feel) adds a safety signal.</li>
<li><strong>Naming:</strong> “3-in-1 block” is obsolete. Call it a femoral nerve block, or a fascia iliaca block if you are targeting the compartment.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'MMed OSCE 2020',
        q: '<p>Scan the groin and show the anatomy for a femoral nerve block. Which nerves need blocking for an above-knee amputation?</p>',
        points: [
          'Probe transverse on the inguinal crease; find the femoral artery; slide cranially above the profunda.',
          'Show: femoral vein (medial), artery, nerve (lateral, on iliopsoas, deep to fascia iliaca), fascia lata, fascia iliaca, sartorius, pectineus.',
          'In-plane lateral to medial; puncture fascia iliaca lateral to the nerve; doughnut spread.',
          'AKA: femoral (anterior thigh, femur), LFCN (lateral thigh), obturator (medial thigh), sciatic (posterior thigh and femur) and the posterior femoral cutaneous nerve (posterior thigh skin), so a transgluteal or subgluteal sciatic block is preferred.',
          'Neuraxial anaesthesia is often simpler; pure peripheral blocks suit the patient too sick for it. (Sciatic and obturator blocks: see the thigh and knee pages.)',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Describe the boundaries and contents of the femoral triangle.</p>',
        points: [
          'Superior: inguinal ligament. Lateral: medial border of sartorius. Medial: medial border of adductor longus.',
          'Roof: fascia lata (with the cribriform fascia over the saphenous opening), subcutaneous tissue, skin.',
          'Floor: iliopsoas, pectineus and adductor longus.',
          'Contents, lateral to medial: femoral nerve (outside the sheath, deep to fascia iliaca), femoral artery, femoral vein, femoral canal (lymphatics, the node of Cloquet). The sheath holds artery, vein and canal.',
          'The apex leads into the adductor canal.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ LFCN
  {
    id: 'lfcn',
    kicker: 'Hip · Cutaneous',
    title: 'Lateral femoral cutaneous nerve block',
    summary: `A small, superficial, purely sensory block of the LFCN in the <strong>fat-filled tunnel of fascia lata between sartorius and tensor fasciae latae</strong>, 1–2 cm below and medial to the ASIS. It numbs the lateral thigh: the incision for many hip operations, which PENG does not cover.`,
    indications: ['With PENG for hemiarthroplasty and total hip arthroplasty (anterior or lateral incision)', 'Skin graft harvest from the lateral thigh; lateral thigh biopsy', 'Meralgia paraesthetica (diagnosis and treatment)', 'Part of an above-knee amputation plan'],
    glance: {
      position: 'Supine',
      probe: 'Linear, transverse 1–2 cm below and medial to the ASIS',
      needle: '50 mm, in-plane lateral to medial (or out-of-plane)',
      dose: '5 ml of 0.2% ropivacaine (10 mg): 1 ml test, then 2 ml aliquots',
      covers: 'Lateral thigh (variable; sometimes the anterior thigh too)',
    },
    watch: { anim: 'lfcn', caption: 'LFCN block: finding and tracing the nerve, in-plane and out-of-plane approaches, and an intramuscular error.', tier: 1 }, // Dr Chew Shi Hao's animation (lower-limb/anim/), loaded when opened
    scene: SCENES.lfcn,
    position: '<p>Supine (lateral also works). Expose from the ASIS to the upper lateral thigh.</p>',
    equipment: [
      'High-frequency linear probe; shallow depth (the nerve is 0.5–1 cm deep)',
      '50 mm needle (22–24 G)',
      '5 ml of 0.2% ropivacaine',
      'Nerve stimulator optional: it gives tingling, not a twitch',
    ],
    landmarks: `<p>Probe <strong>transverse, 1–2 cm below and medial to the ASIS</strong>, parallel to the inguinal ligament. Identify <strong>sartorius</strong> (medial) and <strong>tensor fasciae latae</strong> (lateral). Between them, fascia lata splits into a flat, fat-filled tunnel; the LFCN is a small hypoechoic oval in it. Use the lateral edge of sartorius as your anchor rather than hunting for the nerve.</p><p>Trace it: <strong>cranially</strong> the nerve moves medially over sartorius towards the inguinal ligament; <strong>caudally</strong> the gap widens and the nerve drifts laterally and may divide. If you start in the femoral view, slide laterally following sartorius.</p>`,
    approach: '<p><strong>In-plane, lateral to medial</strong>, at a shallow angle, staying above TFL. Fascia lata tents and gives; stop in the tunnel just lateral to the nerve. <strong>Out-of-plane from caudal</strong> also suits this tiny, shallow target: walk the tip down, then hydrodissect.</p>',
    sonoanatomy: '<p>Superficial to deep: skin, subcutaneous fat, fascia lata (splitting into the tunnel), sartorius medially and TFL laterally, rectus femoris deeper. The nerve is only a few square millimetres in cross-section (larger in meralgia): use the highest frequency.</p>',
    target: '<p>The <strong>tunnel</strong>, not the nerve. Fluid opening the tunnel between sartorius and TFL, or around the nerve on the surface of sartorius, is the endpoint. If no nerve can be seen, inject in the tunnel anyway, or use the sub-inguinal option: just below the inguinal ligament, 1–2 cm medial to the ASIS.</p>',
    dose: {
      html: '<span class="tb-dose-v">5 ml</span> of <span class="tb-dose-v">0.2%</span> ropivacaine (10 mg)',
      note: 'A 1 ml test, then 2 ml aliquots with aspiration. With PENG, the total is 25 ml, 50 mg. The published fat-filled tunnel technique, which reached the proximal branches in about two thirds, used 10 ml.',
    },
    coverage: {
      map: legCoverageMap,
      side: 'unilateral',
      views: ['front'],
      areas: [{ zones: ['lfcn'], density: 'moderate' }],
      summary: 'The lateral thigh, from below the greater trochanter towards the knee; the area varies a lot between people.',
      mechanism: '<p>The LFCN (L2–L3) leaves the lateral border of psoas, crosses iliacus under fascia iliaca towards the ASIS, and passes under (sometimes through) the inguinal ligament, usually within about 2 cm medial to the ASIS. It enters the thigh in the fascia lata tunnel between sartorius and TFL and divides into anterior and posterior branches. Purely sensory.</p>',
      density: '<p>In volunteers, a 10 ml tunnel injection numbed the lateral thigh in 95% but reached the <strong>proximal branches</strong> in only about two thirds; the numb area usually started several centimetres below the greater trochanter. Expect no better from the 5 ml dose. So for a hip incision near the trochanter, check the top of the incision line and plan infiltration.</p>',
      misses: '<ul><li><strong>The hip joint</strong> (add PENG or fascia iliaca).</li><li><strong>The upper end of a lateral incision</strong> over the trochanter, often (subcostal and iliohypogastric branches there).</li><li><strong>A posterior incision</strong> (buttock skin: cluneal nerves).</li></ul>',
    },
    complications: '<ul><li>Few. <strong>Nerve injury</strong> (tiny nerve, shallow: don’t needle it), bruising, <strong>intramuscular injection</strong> into TFL (failure). It is purely sensory: no weakness, so it is safe for early walking.</li></ul>',
    pearls: [
      'Sartorius medial, TFL lateral, a fat-filled tunnel between: the nerve lives there.',
      'Target the tunnel, not the nerve.',
      'Shallow: 0.5–1 cm. Shallow angle, shallow depth.',
      'No twitch: it is sensory. Tingling down the lateral thigh confirms it.',
      'PENG + LFCN = joint + incision, quadriceps spared.',
      'The numb patch varies: test the top of the incision before relying on it.',
    ],
    sections: [
      {
        id: 'consultant', title: 'Consultant corner',
        html: `<ul>
<li><strong>Variable anatomy:</strong> the nerve may lie up to several centimetres medial to the ASIS, pass over the ASIS, pierce the inguinal ligament, or already be divided at block level. If no single oval appears, scan medially and laterally, or inject in the tunnel or under the ligament.</li>
<li><strong>Meralgia paraesthetica</strong> (entrapment where the nerve passes under the inguinal ligament near the ASIS): a diagnostic block with local anaesthetic (± steroid) relieves the burning lateral thigh pain; hydrodissection and, for refractory cases, pulsed radiofrequency are used. Nerves in meralgia lie closer to the ASIS and are larger in cross-section on ultrasound.</li>
<li><strong>On its own after total hip arthroplasty</strong> an LFCN block helps only some patients: in a placebo-controlled trial it reduced pain on movement, but about four in ten did not respond, and coverage of posterior and lateral incision lines was limited in volunteers.</li>
<li><strong>Lithotomy and prone positioning</strong> can compress the LFCN: a postoperative numb lateral thigh is not always the block.</li>
</ul>`,
      },
      {
        id: 'frontier', title: 'Frontier: what’s new',
        html: `<ul>
<li><strong>The fat-filled flat tunnel</strong> technique (injecting the fascia lata duplication between sartorius and TFL, tracking the tip) improved reach to the proximal branches. Volume and site for proximal (trochanteric) coverage are still being worked out.</li>
<li><strong>PENG plus LFCN</strong> is now a standard motor-sparing combination for hip arthroplasty; a recent meta-analysis showed better quadriceps strength and earlier walking than fascia iliaca blocks, with similar or slightly lower pain scores.</li>
<li><strong>Ultrasound diagnosis of meralgia:</strong> a larger nerve cross-section at the inguinal ligament supports the diagnosis.</li>
</ul>`,
      },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>A patient will have a total hip arthroplasty through a lateral incision with a PENG block. What does the PENG miss, and how would you cover it?</p>',
        points: [
          'PENG covers the anterior capsule (femoral and accessory obturator articular branches), not the skin.',
          'Lateral incision: LFCN territory (L2–L3), plus the iliohypogastric and subcostal branches over the upper end near the trochanter.',
          'LFCN block in the fat-filled tunnel between sartorius and TFL, 1–2 cm below and medial to the ASIS: 5 ml of 0.2% ropivacaine.',
          'Check the proximal incision; ask the surgeon for infiltration over the trochanter and the posterior capsule.',
          'Alternative: supra-inguinal fascia iliaca (femoral + LFCN) at the cost of quadriceps weakness.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>What is meralgia paraesthetica? Describe the course of the LFCN.</p>',
        points: [
          'Entrapment neuropathy of the LFCN: burning pain, numbness or tingling of the anterolateral thigh; no weakness, no reflex change.',
          'Risks: obesity, tight belts, pregnancy, diabetes, positioning (prone, lithotomy), surgery near the ASIS.',
          'Course: L2–L3; lateral border of psoas; across iliacus under fascia iliaca; under the inguinal ligament near the ASIS; into the fascia lata tunnel between sartorius and TFL; anterior and posterior branches.',
          'Diagnostic and therapeutic ultrasound-guided block.',
        ],
      },
    ],
  },
];

