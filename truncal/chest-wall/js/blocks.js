// Chest wall: block data (schema: ../../shared/DATA.md, "Block schema").
import { SCENES } from './scenes.js';


/** PECS II, two stages: the viewer's pectoserratus injection keeps the interpectoral spread in place. */
const TWO_STAGE = '<p>PECS II is one skin puncture and two injections. In the viewer above, choose <a href="#pecs-inj-ps">Pectoserratus (PECS II, stage 2)</a>: the 10 ml already given between the pectoral muscles stays in place, so from the needle step you see the second injection open the plane one layer deeper, and both pools together.</p>';

export const BLOCKS = [
  // ------------------------------------------------------------------ serratus anterior plane
  {
    id: 'sap',
    kicker: 'Chest wall · Anterolateral',
    title: 'Serratus anterior plane block',
    summary: `Local anaesthetic in the plane <strong>superficial</strong> to serratus anterior (between latissimus dorsi and serratus) or <strong>deep</strong> to it (between serratus and the ribs), at the 5th rib in the mid-axillary line. Consensus names: superficial and deep serratus anterior plane block (older: superficial and deep SAP, serratus plane block). It blocks the lateral cutaneous branches of the intercostal nerves, so it numbs the lateral chest wall.`,
    indications: ['Breast surgery (one of several equal single-shot options)', 'Rib fractures in the front two-thirds of the chest wall', 'VATS when paravertebral or ESP is not possible (second choice)', 'Chest drains and lateral chest wall incisions'],
    glance: {
      position: 'Supine with the arm abducted, or lateral',
      probe: 'Linear, mid-axillary line at the 5th rib',
      needle: 'In-plane, anterosuperior to posteroinferior',
      dose: 'At least 20 ml (0.3–0.4 ml/kg)',
      covers: 'Lateral chest wall, about T2–T9 (variable)',
    },
    position: `<p>Supine with the arm abducted to 90°, or lateral with the side to be blocked up. Supine is useful in trauma: the patient does not have to be turned.</p>`,
    equipment: [
      `High-frequency linear probe; 22G block needle, 50–100 mm`,
      `0.3–0.4 ml/kg of 0.25% levobupivacaine, at least 20 ml`,
      'Colour Doppler, monitoring, and the local anaesthetic toxicity kit within reach',
      `For a catheter: 0.2% ropivacaine, typically 5 ml/h with a 5 ml patient bolus no more than hourly`,
    ],
    landmarks: `<p>Start under the clavicle (as for PECS), then move the probe <strong>inferiorly and posteriorly</strong>, turning it towards the coronal plane, until the <strong>5th rib in the mid-axillary line</strong> is under the centre of the probe. Count the ribs on the way down.</p><p>The block can be done anywhere between the anterior and posterior axillary lines, from the 2nd to the 7th rib. For a rib fracture or a thoracotomy, centre it on the injured or incised level.</p><p><strong>Another way in:</strong> lay the probe across the axilla, where latissimus dorsi is thicker and the thoracodorsal artery is easier to find, then follow the plane down. In-plane and out-of-plane needling both work.</p>`,
    approach: `<p><strong>In-plane, from anterosuperior to posteroinferior.</strong> Find the pleura before you insert the needle. For the deep block, aim at the top of the 5th rib so the rib is a backstop.</p>`,
    sonoanatomy: `<p><strong>Latissimus dorsi</strong> (superficial and thick posteriorly), <strong>serratus anterior</strong> under it, then the <strong>ribs</strong> with intercostal muscles between them and the <strong>pleura</strong> below. The <strong>thoracodorsal artery</strong> runs in the plane between latissimus dorsi and serratus: find it with colour Doppler, because it marks the superficial plane and is the vessel you could hit.</p>`,
    target: `<ul><li><strong>Superficial:</strong> the plane between latissimus dorsi and serratus anterior, in the mid-axillary line.</li><li><strong>Deep:</strong> the plane between serratus anterior and the 5th rib (or the external intercostal muscle).</li></ul><p>Confirm the plane with a small volume (hydrolocation), then inject in 5 ml aliquots with aspiration. Paraesthesia lasted longer after the superficial injection in volunteers (see <a href="#sap-coverage">coverage</a>), but whether that matters clinically is unclear; a cohort study in breast surgery found deep no worse than superficial. The deep plane holds a catheter better because the catheter passes through more muscle.</p>`,
    dose: {
      html: '<span class="tb-dose-v">0.3–0.4 ml/kg</span> of <span class="tb-dose-v">0.25%</span> levobupivacaine, at least <span class="tb-dose-v">20 ml</span>',
      note: 'A typical single shot is 30–40 ml of 0.25% levobupivacaine. With ropivacaine, use <strong>0.3–0.5%</strong> for a single shot and <strong>0.2%</strong> for catheter infusions. Spread depends on volume: in cadavers, 40 ml spread further up and down the chest than 20 ml, but not further posteriorly. Use enough volume and lower the concentration if needed to stay within the maximum dose.',
    },
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T3', 'T8'], zones: ['front-lat'], density: 'moderate' },
        { levels: ['T2', 'T9'], zones: ['back-lat'], density: 'patchy' },
        { levels: ['T2', 'T9'], zones: ['front-lat'], density: 'patchy' },
        { levels: ['T3', 'T6'], zones: ['front-ant'], density: 'patchy' },
      ],
      summary: 'The lateral chest wall, about T2–T9 in volunteers; variable between patients.',
      mechanism: `<p>Each intercostal nerve gives a lateral cutaneous branch, which pierces the intercostal muscles and serratus anterior at about the mid-axillary line before dividing into anterior and posterior branches to the skin. Local anaesthetic in either serratus plane catches these branches. The intercostobrachial, long thoracic and thoracodorsal nerves lie in the superficial plane, between latissimus dorsi and serratus.</p>`,
      density: `<p>In the first volunteer study (four volunteers) a single injection gave paraesthesia from about T2 to T9, lasting longer after the superficial injection (mean 752 min) than the deep one (386 min). In surgery it is less reliable: for VATS it is a <strong>second-choice</strong> block after paravertebral or ESP. In a network meta-analysis for VATS, paravertebral, intercostal and ESP blocks reduced pain scores at 6–24 h, but serratus did not. For breast surgery the 2026 PROSPECT update lists superficial and deep serratus among equal single-shot options.</p>`,
      misses: `<ul><li><strong>The medial chest and sternum</strong>: the anterior cutaneous branches leave the intercostal nerve near the sternum, well in front of the injection. Add a <a href="#ch-parasternal">parasternal block</a>.</li><li><strong>The back</strong>: the dorsal rami are not reached, so it is unlikely to work for a posterolateral thoracotomy. Use an <a href="../back/#ch-esp">ESP</a> or <a href="../back/#ch-pvb">paravertebral</a> block.</li><li><strong>The pectoral muscles</strong>: the medial and lateral pectoral nerves were not often stained in cadavers.</li><li><strong>Visceral pain</strong> from the lung and pleura: like all plane blocks it is somatic only.</li></ul>`,
    },
    complications: `<ul><li><strong>Pneumothorax</strong>: the pleura is close; isolated cases have been reported. Aim at the rib for the deep block and keep the tip in view.</li><li><strong>Vessel puncture and haematoma</strong>: the thoracodorsal artery and many small vessels lie in the plane. Colour Doppler, aspirate before each aliquot.</li><li><strong>Local anaesthetic toxicity</strong>: large volumes, especially bilateral or with catheters.</li><li><strong>Failed or patchy block</strong>, and infection. It is a superficial block, so it can be done in anticoagulated patients after an individual risk–benefit check.</li></ul>`,
    pearls: [
      `Supine serratus earns its place in rib fractures when the patient cannot be turned (for example on spinal precautions) for a paravertebral or ESP block.`,
      `To add the axilla and the upper medial arm (intercostobrachial nerve) to a brachial plexus block, a superficial serratus block at the 4th rib in the mid-axillary line, or a PECS II, reaches it. The simple alternative is a subcutaneous intercostobrachial block: about 5 ml along the axillary crease.`,
      `An intercostobrachial block numbs the skin under an upper arm tourniquet, but not the ischaemic, compressive tourniquet pain: that needs the brachial plexus block (and sedation).`,
    ],
    sections: [
      {
        id: 'ribs', title: 'Rib fractures',
        html: `<p>Count the broken ribs on imaging and centre the block on the fractures. A serratus block or catheter only helps fractures in the <strong>front two-thirds</strong> of the hemithorax, because it does not reach the dorsal rami. It can be done supine and in anticoagulated patients, but the evidence is limited to case reports and observational studies.</p><p>Rib fracture pain lasts days, so plan a <strong>catheter</strong> rather than a single shot. For posterior fractures, or as a first choice, use an <a href="../back/#ch-esp">ESP</a> or <a href="../back/#ch-pvb">paravertebral</a> catheter. Run chest wall catheters on 0.2% ropivacaine, typically 5 ml/h with a 5 ml patient bolus no more than hourly.</p><p><strong>Why analgesia matters:</strong> pain stops deep breaths and coughing, which leads to atelectasis, retained secretions and pneumonia, often on top of a lung contusion. Thoracic epidural has traditionally had the best evidence; paravertebral, ESP, intercostal and serratus blocks or catheters may work as well in suitable patients, with fewer and less serious complications.</p>`,
      },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>A 70-year-old has fractures of the right 4th–7th ribs in the anterior axillary line and is on apixaban. Describe a serratus anterior plane block for him.</p>',
        points: [
          'Fractures are anterolateral, so a serratus block (ideally a catheter) is reasonable; it can be done supine and in anticoagulated patients after a risk–benefit check.',
          'Supine, arm abducted; linear probe; count ribs from under the clavicle down to the 5th rib in the mid-axillary line (centre on the fractures).',
          'Sonoanatomy: latissimus dorsi, serratus anterior, ribs with shadows, intercostal muscles, pleura; thoracodorsal artery with Doppler.',
          'In-plane anterosuperior to posteroinferior; superficial (LD–SA) or deep (SA–rib, rib as backstop).',
          '0.3–0.4 ml/kg of 0.25% levobupivacaine, at least 20 ml; aspirate every 5 ml; catheter for ongoing analgesia.',
          'Complications: pneumothorax, vessel puncture, local anaesthetic toxicity, failure. It misses posterior fractures (dorsal rami): use ESP or paravertebral for those.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Why might a serratus anterior plane block fail to cover a posterolateral thoracotomy, and the area next to the sternum?</p>',
        points: [
          'It blocks the lateral cutaneous branches of the intercostal nerves around the mid-axillary line.',
          'The back is supplied by the dorsal rami, which leave the spinal nerve near the spine: not reached.',
          'The parasternal skin is supplied by the anterior cutaneous branches, which continue forward past the injection: not reached.',
          'Alternatives: paravertebral or ESP for thoracotomy; parasternal block for the anterior chest.',
        ],
      },
      {
        source: 'ANZCA final exam 2019A',
        q: '<p>List the factors associated with increased mortality after rib fractures. Describe a comprehensive pain management plan for rib fractures.</p>',
        points: [
          'Higher mortality: six or more fractured ribs; complications (haemothorax, pneumothorax, flail segment); associated injuries (limb and pelvic fractures; spleen, liver, heart or diaphragm injury).',
          'An escalating, multimodal plan with early acute pain service involvement and regular pain scores (including on coughing).',
          'Regular paracetamol and an NSAID or COX-2 inhibitor if not contraindicated; patient-controlled opioid analgesia, switching to oral as soon as possible.',
          'Regional: thoracic epidural or paravertebral catheter with low-dose ropivacaine; ESP or serratus catheters are alternatives (serratus for anterolateral fractures: supine, and possible in anticoagulated patients after a risk–benefit check).',
          'Adjuncts if pain is still poorly controlled: low-dose ketamine infusion.',
          'Chest physiotherapy, incentive spirometry, early mobilisation; surgical rib fixation if pain still stops coughing and mobilising, or for a flail chest with respiratory compromise.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ PECS I and II
  {
    id: 'pecs',
    kicker: 'Chest wall · Anterior',
    title: 'PECS I and PECS II (interpectoral and pectoserratus plane blocks)',
    summary: `<strong>PECS I</strong> is one injection between pectoralis major and pectoralis minor (consensus name: <strong>interpectoral plane block</strong>). <strong>PECS II</strong> adds a second injection between pectoralis minor and serratus anterior (<strong>pectoserratus plane block</strong>).`,
    indications: ['PECS I: breast expanders, subpectoral implants, pacemaker and port insertion', 'PECS II: mastectomy, wide local excision, sentinel node biopsy, axillary clearance', 'Rescue analgesia after breast surgery'],
    glance: {
      position: 'Supine, arm abducted to 90°',
      probe: 'Linear, below the lateral clavicle, then inferolateral to the 3rd–4th ribs',
      needle: 'In-plane, superomedial to inferolateral, one skin puncture',
      dose: 'PECS I 10 ml; PECS II 10 ml + 15–20 ml (25–30 ml)',
      covers: 'PECS I: pectoral muscles only. PECS II: lateral breast and axilla, about T2–T6',
    },
    position: `<p>Supine, preferably with the arm abducted to 90°.</p>`,
    equipment: [
      `High-frequency linear probe; 22G block needle, 50–100 mm`,
      `0.25% levobupivacaine: PECS I 10 ml; PECS II 10 ml + 15–20 ml (25–30 ml in total)`,
      'Colour Doppler: the interpectoral plane contains many small vessels',
    ],
    landmarks: `<ol><li>Probe <strong>below the lateral third of the clavicle</strong>. Find pectoralis major and minor over the axillary artery and vein, with the 2nd rib under the artery.</li><li>Look for the <strong>pectoral branch of the thoracoacromial artery</strong> running between the two pectoral muscles: it marks the interpectoral plane. Another way to find it: start in a paramedian sagittal view over the coracoid process, then swing the probe's lower end laterally; this brings the artery into view and lines up an in-plane path from medial to lateral.</li><li>For PECS II, turn the probe oblique (medial end towards the coracoid) and move it <strong>inferolaterally</strong>, counting the 3rd and then the <strong>4th rib</strong>, until serratus anterior appears under pectoralis minor. The second injection is at about the anterior axillary line over the 4th rib. Expect the interpectoral plane at about 1–3 cm deep and the pectoserratus plane at about 3–6 cm.</li></ol>`,
    approach: `<p><strong>In-plane</strong>, from cephalad to caudal (or medial to lateral once the probe is turned). Enter on the medial side rather than at the lateral border of pectoralis major, which is more painful. If you do both injections, the deeper one can be done first. A common way to do this: advance to touch the top of the 4th rib, inject the pectoserratus dose so it lifts pectoralis minor off serratus, then withdraw into the interpectoral plane and inject again. The viewer shows the classic order, interpectoral first.</p>`,
    sonoanatomy: `<p>Pectoralis major, pectoralis minor, the thoracoacromial artery (pectoral branch) between them, serratus anterior on the 3rd and 4th ribs, the intercostal muscles and the pleura.</p><p>The fascia explains the two planes. The <strong>interpectoral plane</strong> lies between the pectoral fascia (under pectoralis major) and the <strong>clavipectoral fascia</strong>, which wraps pectoralis minor. The <strong>pectoserratus plane</strong> lies between the clavipectoral fascia and serratus anterior, and opens into the axilla: that is how it reaches the intercostobrachial and long thoracic nerves.</p>`,
    target: `<ul><li><strong>Stage 1 (PECS I, interpectoral):</strong> between pectoralis major and pectoralis minor, about 10 ml.</li><li><strong>Stage 2 (PECS II, pectoserratus):</strong> through the same puncture, advance through pectoralis minor towards the top of the 4th rib and inject 15–20 ml between pectoralis minor and serratus anterior.</li></ul><p>Hydrodissect with saline first if you want to save local anaesthetic. Always aspirate and watch the plane open.</p>`,
    dose: {
      html: 'PECS I: <span class="tb-dose-v">10 ml</span> interpectoral. PECS II: <span class="tb-dose-v">10 ml</span> interpectoral + <span class="tb-dose-v">15–20 ml</span> pectoserratus (<span class="tb-dose-v">25–30 ml</span> in total). All of <span class="tb-dose-v">0.25%</span> levobupivacaine.',
      note: 'For PECS II, about a third of the volume goes at the interpectoral point and two thirds at the pectoserratus point. Weight-based figures (about 0.2 ml/kg at each point) are also used, but there are no dose-finding studies. Check the total in mg: 30 ml of 0.25% is 75 mg per side, so bilateral PECS II or PECS plus infiltration can reach the maximum dose in a small patient. Lower the concentration, not the volume.',
    },
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T2', 'T6'], zones: ['front-lat'], density: 'moderate' },
        { levels: ['T3', 'T6'], zones: ['front-ant'], density: 'patchy' },
      ],
      summary: 'PECS I: the pectoral muscles (no skin). PECS II: also the lateral breast and the axilla, about T2–T6.',
      mechanism: `<p><strong>PECS I</strong> blocks the <strong>lateral and medial pectoral nerves</strong> in the interpectoral plane. The lateral pectoral nerve runs with the pectoral branch of the thoracoacromial artery (which is why the artery marks the plane); the medial pectoral nerve pierces pectoralis minor on its way to pectoralis major. These supply the pectoral muscles, not the skin, so PECS I helps the pain of stretching the muscles (expanders, subpectoral implants) and numbs no dermatome. <strong>PECS II</strong> adds the pectoserratus injection, which aims to block the intercostobrachial nerve and the lateral branches of the 3rd–6th intercostal nerves. It reaches the long thoracic nerve only inconsistently.</p>`,
      density: `<p>For major breast surgery, the 2026 PROSPECT update recommends interpectoral plus pectoserratus plane block as one of several single-shot options that are <strong>equivalent</strong> to each other (with ESP, serratus, paravertebral and local infiltration).</p>`,
      misses: `<ul><li><strong>The medial breast</strong>: skin medial to the mid-clavicular line is supplied partly by the anterior cutaneous branches, which PECS does not reach. A transversus thoracis (deep parasternal) block can be added for medial analgesia. See <a href="#ch-parasternal">parasternal</a>.</li><li><strong>Below the clavicle</strong>: the supraclavicular nerves (C3–C4) supply the upper breast and are not blocked (matters for ports and lines).</li><li><strong>Latissimus dorsi</strong>: the thoracodorsal nerve (for example, a latissimus dorsi flap) usually needs a superficial serratus block; PECS II reaches the long thoracic nerve only inconsistently.</li></ul>`,
    },
    complications: `<ul><li><strong>Vessel puncture</strong>: the thoracoacromial artery and many small vessels run in the interpectoral plane. Colour Doppler and aspirate.</li><li><strong>Pneumothorax</strong>: aim the needle at the top of the 4th rib (the rib beyond the tip) and not at the intercostal space; know where the pleura is before you start.</li><li><strong>Local anaesthetic toxicity</strong> with bilateral blocks: calculate the maximum dose.</li><li><strong>Intramuscular injection</strong> (the muscle swells instead of the plane opening) and failed block.</li></ul>`,
    pearls: [
      `The breast spans the 2nd to 6th ribs, from the sternal edge to the mid-axillary line, lying about two-thirds on pectoralis major and one-third on serratus anterior. Its skin is supplied by both the lateral and the anterior cutaneous branches of T4–T6, so PECS II alone leaves the medial part.`,
      `Ask the surgeon about muscle relaxation before axillary dissection: some prefer no paralysis so they can see a twitch when they are close to the long thoracic or thoracodorsal nerve.`,
      `The intercostobrachial nerve is the lateral cutaneous branch of T2 in about two-thirds of people and of T3 in the rest. It is not part of the brachial plexus, so no brachial plexus block reaches it.`,
    ],
    sections: [
      { id: 'twostage', title: 'PECS II: the two-stage injection', html: TWO_STAGE },
    ],
    exam: [
      {
        source: 'Practice question',
        q: '<p>A patient is having a right mastectomy with axillary clearance. Describe a PECS II block. Which nerves does each injection target, and what does it not cover?</p>',
        points: [
          'Supine, arm abducted; linear probe below the lateral clavicle; find pectoralis major and minor and the thoracoacromial artery (pectoral branch).',
          'Move inferolaterally and count to the 4th rib; serratus anterior lies under pectoralis minor.',
          'In-plane, one puncture: 10 ml between pectoralis major and minor (interpectoral: lateral and medial pectoral nerves).',
          'Then 15–20 ml between pectoralis minor and serratus anterior over the 4th rib (pectoserratus: lateral cutaneous branches of T3–T6, intercostobrachial; long thoracic only inconsistently).',
          'Misses the medial breast (anterior cutaneous branches): add a parasternal block or surgical infiltration. Misses the supraclavicular nerves.',
          'Complications: vessel puncture, pneumothorax, local anaesthetic toxicity. Keep within the maximum dose.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>What are the 2021 consensus names for PECS I and PECS II?</p>',
        points: [
          'PECS I = interpectoral plane block (between pectoralis major and minor).',
          'PECS II = interpectoral plane block + pectoserratus plane block (between pectoralis minor and serratus anterior).',
          'Serratus: superficial and deep serratus anterior plane blocks.',
          'Parasternal: superficial and deep parasternal intercostal plane blocks (deep = the old transversus thoracis plane block).',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Which nerves supply the anterolateral chest wall and the axilla? Match each to a block that reaches it.</p>',
        points: [
          'Supraclavicular nerves (C3–C4, cervical plexus): skin below the clavicle. Not reached by chest wall plane blocks (superficial cervical plexus block).',
          'Intercostal nerves T2–T6: lateral cutaneous branches (serratus, PECS II) and anterior cutaneous branches (parasternal blocks).',
          'Lateral and medial pectoral nerves (brachial plexus): pectoral muscles, no skin. PECS I (interpectoral).',
          'Long thoracic nerve (C5–C7): serratus anterior. Superficial serratus; PECS II inconsistently.',
          'Axilla: intercostobrachial nerve (T2) with the medial cutaneous nerve of the arm (medial cord). PECS II or superficial serratus for the intercostobrachial nerve; a brachial plexus block for the medial cutaneous nerve.',
          'ESP and paravertebral blocks aim at the spinal nerve near its origin (dorsal and ventral rami), so they can also cover the back.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ parasternal
  {
    id: 'parasternal',
    kicker: 'Chest wall · Anteromedial (brief)',
    title: 'Parasternal intercostal plane blocks (superficial and deep)',
    summary: `Injections beside the sternum that block the <strong>anterior cutaneous branches of T2–T6</strong>. <strong>Superficial</strong>: between pectoralis major and the intercostal muscles (older: pecto-intercostal fascial block). <strong>Deep</strong>: between the internal intercostal muscle and transversus thoracis (older: transversus thoracis plane block, TTP). NTF has no cardiac surgery, so this is brief: know it for sternotomy in the exam and for medial breast analgesia.`,
    indications: ['Sternotomy (both sides): mainly for the exam at NTF', 'Medial breast analgesia, added to PECS', 'Sternal fractures', 'Anterior chest wall incisions near the sternum'],
    glance: {
      position: 'Supine',
      probe: 'Linear, beside the sternum at the 3rd–4th space',
      needle: 'In-plane from lateral; tip about 2 cm from the sternal edge',
      dose: '10–20 ml per side; deep block: 20 ml of 0.3% ropivacaine per side',
      covers: 'Anterior chest beside the sternum, about T2–T6',
    },
    position: '<p>Supine. A sternotomy needs both sides.</p>',
    equipment: [
      'High-frequency linear probe and colour Doppler',
      `50–80 mm block needle`,
      `10–20 ml per side of 0.25% bupivacaine or ropivacaine; deep block: 20 ml of 0.3% ropivacaine per side`,
    ],
    landmarks: `<p>Count the costal cartilages in a parasagittal view beside the sternum. Then either stay <strong>parasagittal</strong> over the 3rd and 4th ribs, or turn <strong>transverse in the 3rd–4th intercostal space</strong> about 2 cm from the sternum, as in the viewer. Another option is the <strong>4th–5th space</strong> in a parasagittal view: internal intercostal muscle and transversus thoracis between the 4th and 5th costal cartilages, above the pleura.</p><p>Find the <strong>internal thoracic artery and vein</strong> with colour Doppler before needling: the artery runs about 1–1.5 cm lateral to the sternal border, behind the first six costal cartilages, between the internal intercostal muscles and transversus thoracis.</p>`,
    approach: `<p>In-plane. In the parasagittal view the needle is usually passed <strong>caudal to cranial</strong>. In the transverse view, go <strong>in-plane from lateral</strong>; keep the needle path and tip about <strong>2 cm from the sternal edge</strong>, lateral to the internal thoracic vessels.</p>`,
    sonoanatomy: `<p>Pectoralis major, the costal cartilages (parasagittal) or the intercostal muscles (transverse), the thin dark band of <strong>transversus thoracis</strong> lying on the pleura, and the internal thoracic vessels between the intercostal muscles and transversus thoracis.</p>`,
    target: `<ul><li><strong>Superficial parasternal intercostal plane</strong>: between pectoralis major and the intercostal muscles, where the anterior cutaneous branches run about 1.5–2 cm from the sternal edge.</li><li><strong>Deep parasternal intercostal plane</strong> (transversus thoracis plane): between the internal intercostal muscle and transversus thoracis.</li></ul><p>The superficial plane is favoured for safety: it stays away from the internal thoracic artery and the pleura.</p><p><strong>Deep block, signs you are in the right plane:</strong> you may feel a pop as the tip passes through the internal intercostal muscle. On injection the <strong>pleura moves down</strong>. If the injectate spreads <strong>above the costal cartilage</strong>, the tip is too superficial (above the internal intercostal muscle).</p>`,
    dose: {
      html: '<span class="tb-dose-v">10–20 ml</span> per side of <span class="tb-dose-v">0.25%</span> bupivacaine or ropivacaine. Deep block: <span class="tb-dose-v">20 ml</span> of <span class="tb-dose-v">0.3%</span> ropivacaine per side.',
      note: 'Superficial block: typically 20 ml of 0.25% bupivacaine; as an add-on for breast surgery, 15 ml of 0.15% levobupivacaine has been suggested. Sternotomy needs both sides: the total dose doubles. 20 ml of 0.3% ropivacaine on each side is 120 mg in total.',
    },
    coverage: {
      side: 'bilateral',
      areas: [
        { levels: ['T3', 'T5'], zones: ['front-mid'], density: 'moderate' },
        { levels: ['T2', 'T6'], zones: ['front-mid'], density: 'patchy' },
      ],
      summary: 'The anterior chest beside the sternum, about T2–T6 (shown on both sides, as for a sternotomy).',
      mechanism: `<p>Beside the sternum each intercostal nerve ends as an anterior cutaneous branch, which passes forward through the intercostal muscles and pectoralis major to the skin. The branches run about 1.5–2 cm from the sternal edge, between pectoralis major and the intercostal muscles. Local anaesthetic in either parasternal plane catches these branches.</p>`,
      density: `<p>One deep injection between ribs 3 and 4 on each side is described as spreading to cover the whole sternum. A single superficial injection spreads only about two intercostal segments in cadavers, so two injection levels give more reliable T2–T6 cover.</p>`,
      misses: '<p>The lateral chest wall (lateral cutaneous branches), the back, and visceral pain from the heart, pericardium and mediastinum. Mediastinal drain sites, usually in the epigastrium below the sternum, are outside the area parasternal blocks cover.</p>',
    },
    complications: `<ul><li><strong>Pneumothorax</strong>: more common with the deep block (11.8% in one study, against 2.4% in controls) than with the superficial block. Excessive needle advance can puncture the pleura, or the pericardium on the left.</li><li><strong>Internal thoracic artery puncture</strong> and haematoma: in cadavers the deep needle path often passes within 3–5 mm of the artery. Doppler first; prefer the superficial block if the artery has been used as a graft. Injury matters most if the artery may be needed for coronary grafting.</li><li><strong>Local anaesthetic toxicity</strong>: bilateral injections and large total doses.</li></ul>`,
    exam: [
      {
        source: 'Practice question',
        q: '<p>Which nerves supply the skin over the sternum, and which blocks reach them? Why would a serratus anterior plane or PECS II block not help a sternotomy?</p>',
        points: [
          'The anterior cutaneous branches of the intercostal nerves T2–T6, which emerge beside the sternum. Sternotomy levels: T2–T6 both sides, single-shot level T4.',
          'Superficial parasternal intercostal plane: between pectoralis major and the intercostal muscles.',
          'Deep parasternal intercostal plane (transversus thoracis plane): between the internal intercostal muscle and transversus thoracis.',
          'Serratus and PECS II act on the lateral cutaneous branches around the mid-axillary line, which have already left the nerve; they do not reach the anterior branches.',
          'Hazards: internal thoracic artery (Doppler; keep the needle path and tip about 2 cm from the sternal edge, lateral to the vessels), pneumothorax, pericardium on the left, bilateral dose.',
        ],
      },
    ],
  },
].map((b) => ({ ...b, scene: SCENES[b.id] }));
