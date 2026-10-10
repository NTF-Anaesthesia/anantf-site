// Chest wall: block data (schema: ../../shared/DATA.md, "Block schema").
// The deck has few chest wall values (slide 127: PECS 2 interpectoral / pectoserratus, clavipectoral block for
// clavicle fracture; slide 147: levels). Every other value is a gap-fill from the sources below, cited where used.
import { cite } from '../../shared/js/refs.js';
import { mountScan } from '../../shared/js/scan.js';
import { el } from '../../shared/js/ui.js';
import { SCENES } from './scenes.js';

export const REFS = [
  { id: 'deck', text: 'NTF Anaesthesia. Truncal blocks: teaching slides 106–148 (internal teaching material).' },
  { id: 'names', text: 'El-Boghdadly K, Wolmarans M, Stengel AD, et al. Standardizing nomenclature in regional anesthesia: an ASRA-ESRA Delphi consensus study of abdominal wall, paraspinal, and chest wall blocks. <i>Reg Anesth Pain Med</i> 2021;46(7):571–580.', url: 'https://doi.org/10.1136/rapm-2020-102451', label: 'doi:10.1136/rapm-2020-102451' },
  { id: 'blanco2011', text: 'Blanco R. The ‘pecs block’: a novel technique for providing analgesia after breast surgery. <i>Anaesthesia</i> 2011;66(9):847–848.', url: 'https://doi.org/10.1111/j.1365-2044.2011.06838.x', label: 'doi:10.1111/j.1365-2044.2011.06838.x' },
  { id: 'blanco2012', text: 'Blanco R, Fajardo M, Parras Maldonado T. Ultrasound description of Pecs II (modified Pecs I): a novel approach to breast surgery. <i>Rev Esp Anestesiol Reanim</i> 2012;59(9):470–475.', url: 'https://doi.org/10.1016/j.redar.2012.07.003', label: 'doi:10.1016/j.redar.2012.07.003' },
  { id: 'blanco2013', text: 'Blanco R, Parras T, McDonnell JG, Prats-Galino A. Serratus plane block: a novel ultrasound-guided thoracic wall nerve block. <i>Anaesthesia</i> 2013;68(11):1107–1113.', url: 'https://doi.org/10.1111/anae.12344', label: 'doi:10.1111/anae.12344' },
  { id: 'atotw346', text: 'Parras T, Blanco R. PECS blocks. <i>Anaesthesia Tutorial of the Week</i> 346. World Federation of Societies of Anaesthesiologists; 31 January 2017.', url: 'https://resources.wfsahq.org/wp-content/uploads/346_english.pdf', label: 'resources.wfsahq.org (ATOTW 346, PDF)' },
  { id: 'atotw427', text: 'Elwen F, Desai N, Parras T, Blanco R, Duran J. Serratus plane block. <i>Anaesthesia Tutorial of the Week</i> 427. World Federation of Societies of Anaesthesiologists; 23 June 2020.', url: 'https://resources.wfsahq.org/wp-content/uploads/427_english.pdf', label: 'resources.wfsahq.org (ATOTW 427, PDF)' },
  { id: 'sherwin2018', text: 'Sherwin A, Buggy DJ. Anaesthesia for breast surgery. <i>BJA Educ</i> 2018;18(11):342–348.', url: 'https://doi.org/10.1016/j.bjae.2018.08.002', label: 'doi:10.1016/j.bjae.2018.08.002' },
  { id: 'desai2026', text: 'Desai N, Dirzu DS, Zolger D, Adansi DN, Van de Velde M, Joshi GP; PROSPECT Working Group of ESRA. Pain management after major oncological breast surgery: an updated systematic review and procedure specific postoperative pain management (PROSPECT) recommendations. <i>Anaesthesia</i> 2026 (epub ahead of print).', url: 'https://doi.org/10.1111/anae.70313', label: 'doi:10.1111/anae.70313' },
  { id: 'mehta2023', text: 'Mehta S, Jen TTH, Hamilton DL. Regional analgesia for acute pain relief after open thoracotomy and video-assisted thoracoscopic surgery. <i>BJA Educ</i> 2023;23(8):295–303.', url: 'https://doi.org/10.1016/j.bjae.2023.05.001', label: 'doi:10.1016/j.bjae.2023.05.001' },
  { id: 'feray2022', text: 'Feray S, Lubach J, Joshi GP, Bonnet F, Van de Velde M; PROSPECT Working Group of ESRA. PROSPECT guidelines for video-assisted thoracoscopic surgery: a systematic review and procedure-specific postoperative pain management recommendations. <i>Anaesthesia</i> 2022;77(3):311–325.', url: 'https://doi.org/10.1111/anae.15609', label: 'doi:10.1111/anae.15609' },
  { id: 'williams2020', text: 'Williams A, Bigham C, Marchbank A. Anaesthetic and surgical management of rib fractures. <i>BJA Educ</i> 2020;20(10):332–340.', url: 'https://doi.org/10.1016/j.bjae.2020.06.001', label: 'doi:10.1016/j.bjae.2020.06.001' },
  { id: 'george2019', text: 'George R, Dahl K, Blair de Haan J. How I do it: transversus thoracic plane and pecto-intercostal fascial block. <i>ASRA News</i>, November 2019 (online 1 May 2020). American Society of Regional Anesthesia and Pain Medicine.', url: 'https://asra.com/news-publications/asra-newsletter/newsletter-item/asra-news/2020/05/01/how-i-do-it-transversus-thoracic-plane-and-pecto-intercostal-fascial-block', label: 'asra.com (ASRA News)' },
  { id: 'he2026', text: 'He YN, Lin PR, Wang S. Parasternal intercostal plane blocks for enhanced recovery after cardiac surgery: a systematic review of technical refinements and evidentiary support. <i>J Pain Res</i> 2026;19:600493.', url: 'https://doi.org/10.2147/JPR.S600493', label: 'doi:10.2147/JPR.S600493' },
  { id: 'chin2021', text: 'Further reading. Chin KJ, Versyck B, Pawa A. Ultrasound-guided fascial plane blocks of the chest wall: a state-of-the-art review. <i>Anaesthesia</i> 2021;76(Suppl 1):110–126.', url: 'https://doi.org/10.1111/anae.15276', label: 'doi:10.1111/anae.15276' },
];

const D = cite('deck');

/** The second scan viewer in the PECS chapter: PECS II stage 2 with the stage 1 local anaesthetic already in place. */
function renderTwoStage(sec) {
  sec.append(el('p', { class: 'cw-note', text: 'PECS II is one skin puncture and two injections. The first viewer above shows each plane on its own; this one shows the second injection with the first already given, so you can see both pools.' }));
  const wrap = el('div', { class: 'tb-scan-wrap' });
  sec.append(wrap);
  mountScan(wrap, SCENES.pecs2, { blockId: 'pecs2' });
}

export const BLOCKS = [
  // ------------------------------------------------------------------ serratus anterior plane
  {
    id: 'sap',
    kicker: 'Chest wall · Anterolateral',
    title: 'Serratus anterior plane block',
    summary: `Local anaesthetic in the plane <strong>superficial</strong> to serratus anterior (between latissimus dorsi and serratus) or <strong>deep</strong> to it (between serratus and the ribs), at the 5th rib in the mid-axillary line.${cite('atotw427')} Consensus names: superficial and deep serratus anterior plane block (older: superficial and deep SAP, serratus plane block).${cite('names')} It blocks the lateral cutaneous branches of the intercostal nerves, so it numbs the lateral chest wall.${cite('mehta2023', 'atotw427')}`,
    indications: ['Breast surgery (one of several equal single-shot options)', 'Rib fractures in the front two-thirds of the chest wall', 'VATS when paravertebral or ESP is not possible (second choice)', 'Chest drains and lateral chest wall incisions'],
    glance: {
      position: 'Supine with the arm abducted, or lateral',
      probe: 'Linear, mid-axillary line at the 5th rib',
      needle: 'In-plane, anterosuperior to posteroinferior',
      dose: 'At least 20 ml (0.3–0.4 ml/kg)',
      covers: 'Lateral chest wall, about T2–T9 (variable)',
    },
    position: `<p>Supine with the arm abducted to 90°, or lateral with the side to be blocked up.${cite('atotw427')} Supine is useful in trauma: the patient does not have to be turned.${cite('williams2020')}</p>`,
    equipment: [
      `High-frequency linear probe; 22G block needle, 50–100 mm${cite('atotw427')}`,
      `0.3–0.4 ml/kg of 0.25% levobupivacaine, at least 20 ml${cite('atotw427')}`,
      'Colour Doppler, monitoring, and the local anaesthetic toxicity kit within reach',
    ],
    landmarks: `<p>Start under the clavicle (as for PECS), then move the probe <strong>inferiorly and posteriorly</strong>, turning it towards the coronal plane, until the <strong>5th rib in the mid-axillary line</strong> is under the centre of the probe.${cite('atotw427')} Count the ribs on the way down.</p><p>The block can be done anywhere between the anterior and posterior axillary lines, from the 2nd to the 7th rib.${cite('atotw427')} For a rib fracture or a thoracotomy, centre it on the injured or incised level.${cite('mehta2023')}</p>`,
    approach: `<p><strong>In-plane, from anterosuperior to posteroinferior.</strong>${cite('atotw427', 'blanco2013')} Find the pleura before you insert the needle. For the deep block, aim at the top of the 5th rib so the rib is a backstop.${cite('atotw427')}</p>`,
    sonoanatomy: `<p><strong>Latissimus dorsi</strong> (superficial and thick posteriorly), <strong>serratus anterior</strong> under it, then the <strong>ribs</strong> with intercostal muscles between them and the <strong>pleura</strong> below. The <strong>thoracodorsal artery</strong> runs in the plane between latissimus dorsi and serratus: find it with colour Doppler, because it marks the superficial plane and is the vessel you could hit.${cite('atotw427')}</p>`,
    target: `<ul><li><strong>Superficial:</strong> the plane between latissimus dorsi and serratus anterior, in the mid-axillary line.${cite('atotw427')}</li><li><strong>Deep:</strong> the plane between serratus anterior and the 5th rib (or the external intercostal muscle).${cite('atotw427', 'mehta2023')}</li></ul><p>Confirm the plane with a small volume (hydrolocation), then inject in 5 ml aliquots with aspiration.${cite('atotw427')} Paraesthesia lasted longer after the superficial injection in volunteers (see <a href="#sap-coverage">coverage</a>), but whether that matters clinically is unclear; a cohort study in breast surgery found deep no worse than superficial.${cite('atotw427')} The deep plane holds a catheter better because the catheter passes through more muscle.${cite('mehta2023')}</p>`,
    dose: {
      html: '<span class="tb-dose-v">0.3–0.4 ml/kg</span> of <span class="tb-dose-v">0.25%</span> levobupivacaine, at least <span class="tb-dose-v">20 ml</span>',
      source: `WFSA tutorial.${cite('atotw427')} Mehta et al. give 30–40 ml of 0.25% levobupivacaine as a typical single shot.${cite('mehta2023')} The teaching slides give no serratus dose; ask which drug and concentration your department uses.${D}`,
      note: 'Spread depends on volume: in cadavers, 40 ml spread further up and down the chest than 20 ml, but not further posteriorly. Use enough volume and lower the concentration if needed to stay within the maximum dose.',
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
      mechanism: `<p>Each intercostal nerve gives a lateral cutaneous branch, which pierces the intercostal muscles and serratus anterior at about the mid-axillary line before dividing into anterior and posterior branches to the skin.${cite('atotw427', 'mehta2023')} Local anaesthetic in either serratus plane catches these branches. The intercostobrachial, long thoracic and thoracodorsal nerves lie in the superficial plane, between latissimus dorsi and serratus.${cite('atotw427')}</p>`,
      density: `<p>In the first volunteer study (four volunteers) a single injection gave paraesthesia from about T2 to T9, lasting longer after the superficial injection (mean 752 min) than the deep one (386 min).${cite('blanco2013', 'atotw427')} In surgery it is less reliable: for VATS it is a <strong>second-choice</strong> block after paravertebral or ESP.${cite('feray2022')} In a network meta-analysis for VATS, paravertebral, intercostal and ESP blocks reduced pain scores at 6–24 h, but serratus did not.${cite('mehta2023')} For breast surgery the 2026 PROSPECT update lists superficial and deep serratus among equal single-shot options.${cite('desai2026')}</p>`,
      misses: `<ul><li><strong>The medial chest and sternum</strong>: the anterior cutaneous branches leave the intercostal nerve near the sternum, well in front of the injection. Add a <a href="#ch-parasternal">parasternal block</a>.${cite('atotw427')}</li><li><strong>The back</strong>: the dorsal rami are not reached, so it is unlikely to work for a posterolateral thoracotomy.${cite('mehta2023')} Use an <a href="../back/#ch-esp">ESP</a> or <a href="../back/#ch-pvb">paravertebral</a> block.</li><li><strong>The pectoral muscles</strong>: the medial and lateral pectoral nerves were not often stained in cadavers.${cite('atotw427')}</li><li><strong>Visceral pain</strong> from the lung and pleura: like all plane blocks it is somatic only.</li></ul>`,
    },
    complications: `<ul><li><strong>Pneumothorax</strong>: the pleura is close; isolated cases have been reported.${cite('mehta2023')} Aim at the rib for the deep block and keep the tip in view.</li><li><strong>Vessel puncture and haematoma</strong>: the thoracodorsal artery and many small vessels lie in the plane. Colour Doppler, aspirate before each aliquot.${cite('atotw427')}</li><li><strong>Local anaesthetic toxicity</strong>: large volumes, especially bilateral or with catheters.${cite('atotw427')}</li><li><strong>Failed or patchy block</strong>, and infection. It is a superficial block, so it can be done in anticoagulated patients after an individual risk–benefit check.${cite('mehta2023', 'williams2020')}</li></ul>`,
    sections: [
      {
        id: 'ribs', title: 'Rib fractures',
        html: `<p>Count the broken ribs on imaging and centre the block on the fractures.${D} A serratus block or catheter only helps fractures in the <strong>front two-thirds</strong> of the hemithorax,${cite('williams2020')} because it does not reach the dorsal rami.${cite('mehta2023')} It can be done supine and in anticoagulated patients, but the evidence is limited to case reports and observational studies.${cite('williams2020')}</p><p>Rib fracture pain lasts days, so plan a <strong>catheter</strong> rather than a single shot.${cite('williams2020', 'atotw427')} For posterior fractures, or as a first choice, use an <a href="../back/#ch-esp">ESP</a> or <a href="../back/#ch-pvb">paravertebral</a> catheter.${cite('williams2020')}</p>`,
      },
    ],
    exam: [
      {
        source: 'Practice question (not from the teaching slides)',
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
        source: 'Practice question (not from the teaching slides)',
        q: '<p>Why might a serratus anterior plane block fail to cover a posterolateral thoracotomy, and the area next to the sternum?</p>',
        points: [
          'It blocks the lateral cutaneous branches of the intercostal nerves around the mid-axillary line.',
          'The back is supplied by the dorsal rami, which leave the spinal nerve near the spine: not reached.',
          'The parasternal skin is supplied by the anterior cutaneous branches, which continue forward past the injection: not reached.',
          'Alternatives: paravertebral or ESP for thoracotomy; parasternal block for the anterior chest.',
        ],
      },
    ],
    sources: `Technique and dose: WFSA tutorial 427 (Elwen, Desai, Parras, Blanco, Duran 2020).${cite('atotw427')} Original description: Blanco et al. 2013.${cite('blanco2013')} Evidence and thoracic use: Mehta et al. 2023; PROSPECT VATS 2022.${cite('mehta2023', 'feray2022')} Rib fractures: Williams et al. 2020.${cite('williams2020')} Names: 2021 consensus.${cite('names')}`,
  },

  // ------------------------------------------------------------------ PECS I and II
  {
    id: 'pecs',
    kicker: 'Chest wall · Anterior',
    title: 'PECS I and PECS II (interpectoral and pectoserratus plane blocks)',
    summary: `<strong>PECS I</strong> is one injection between pectoralis major and pectoralis minor (consensus name: <strong>interpectoral plane block</strong>). <strong>PECS II</strong> adds a second injection between pectoralis minor and serratus anterior (<strong>pectoserratus plane block</strong>).${cite('names', 'atotw346')} The teaching slides list PECS 2 (interpectoral / pectoserratus) among other useful blocks.${D}`,
    indications: ['PECS I: breast expanders, subpectoral implants, pacemaker and port insertion', 'PECS II: mastectomy, wide local excision, sentinel node biopsy, axillary clearance', 'Rescue analgesia after breast surgery'],
    glance: {
      position: 'Supine, arm abducted to 90°',
      probe: 'Linear, below the lateral clavicle, then inferolateral to the 3rd–4th ribs',
      needle: 'In-plane, superomedial to inferolateral, one skin puncture',
      dose: 'PECS I 10 ml; PECS II 10 ml + 15–20 ml (25–30 ml)',
      covers: 'PECS I: pectoral muscles only. PECS II: lateral breast and axilla, about T2–T6',
    },
    position: `<p>Supine, preferably with the arm abducted to 90°.${cite('atotw346')}</p>`,
    equipment: [
      `High-frequency linear probe; 22G block needle, 50–100 mm${cite('atotw346')}`,
      `0.25% levobupivacaine: PECS I 10 ml; PECS II 10 ml + 15–20 ml (25–30 ml in total)${cite('atotw346')}`,
      'Colour Doppler: the interpectoral plane contains many small vessels',
    ],
    landmarks: `<ol><li>Probe <strong>below the lateral third of the clavicle</strong>. Find pectoralis major and minor over the axillary artery and vein, with the 2nd rib under the artery.${cite('atotw346')}</li><li>Look for the <strong>pectoral branch of the thoracoacromial artery</strong> running between the two pectoral muscles: it marks the interpectoral plane.${cite('atotw346')}</li><li>For PECS II, turn the probe oblique (medial end towards the coracoid) and move it <strong>inferolaterally</strong>, counting the 3rd and then the <strong>4th rib</strong>, until serratus anterior appears under pectoralis minor.${cite('atotw346', 'sherwin2018')}</li></ol>`,
    approach: `<p><strong>In-plane</strong>, from cephalad to caudal (or medial to lateral once the probe is turned).${cite('atotw346')} Enter on the medial side rather than at the lateral border of pectoralis major, which is more painful.${cite('atotw346')} If you do both injections, the deeper one can be done first.${cite('atotw346')}</p>`,
    sonoanatomy: `<p>Pectoralis major, pectoralis minor, the thoracoacromial artery (pectoral branch) between them, serratus anterior on the 3rd and 4th ribs, the intercostal muscles and the pleura.${cite('atotw346')}</p>`,
    target: `<ul><li><strong>Stage 1 (PECS I, interpectoral):</strong> between pectoralis major and pectoralis minor, about 10 ml.${cite('atotw346')}</li><li><strong>Stage 2 (PECS II, pectoserratus):</strong> through the same puncture, advance through pectoralis minor towards the top of the 4th rib and inject 15–20 ml between pectoralis minor and serratus anterior.${cite('atotw346')}</li></ul><p>Hydrodissect with saline first if you want to save local anaesthetic. Always aspirate and watch the plane open.${cite('atotw346')}</p>`,
    dose: {
      html: 'PECS I: <span class="tb-dose-v">10 ml</span> interpectoral. PECS II: <span class="tb-dose-v">10 ml</span> interpectoral + <span class="tb-dose-v">15–20 ml</span> pectoserratus (<span class="tb-dose-v">25–30 ml</span> in total). All of <span class="tb-dose-v">0.25%</span> levobupivacaine.',
      source: `WFSA tutorial 346: minimum 10 ml for PECS I; for PECS II, a third at the interpectoral point and two thirds at the pectoserratus point, minimum 10 ml and 15 ml (10 ml then 15–20 ml in its technique).${cite('atotw346')} Its weight-based figure (0.15–0.2 ml/kg in total) is less than these minimums in most adults, so the volumes above are what is usually given.${cite('atotw346')} Sherwin and Buggy suggest 0.2 ml/kg at the interpectoral point and 0.4 ml/kg at the pectoserratus point.${cite('sherwin2018')} The teaching slides give no PECS dose.${D}`,
      note: 'Check the total in mg: 30 ml of 0.25% is 75 mg per side, so bilateral PECS II or PECS plus infiltration can reach the maximum dose in a small patient. Lower the concentration, not the volume.',
    },
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T2', 'T6'], zones: ['front-lat'], density: 'moderate' },
        { levels: ['T3', 'T6'], zones: ['front-ant'], density: 'patchy' },
      ],
      summary: 'PECS I: the pectoral muscles (no skin). PECS II: also the lateral breast and the axilla, about T2–T6.',
      mechanism: `<p><strong>PECS I</strong> blocks the <strong>lateral and medial pectoral nerves</strong> in the interpectoral plane.${cite('atotw346', 'sherwin2018')} These supply the pectoral muscles, not the skin, so PECS I helps the pain of stretching the muscles (expanders, subpectoral implants) and numbs no dermatome.${cite('blanco2012')} <strong>PECS II</strong> adds the pectoserratus injection, which aims to block the intercostobrachial nerve and the lateral branches of the 3rd–6th intercostal nerves.${cite('blanco2012', 'sherwin2018')} It reaches the long thoracic nerve only inconsistently.${cite('atotw346')}</p>`,
      density: `<p>For major breast surgery, the 2026 PROSPECT update recommends interpectoral plus pectoserratus plane block as one of several single-shot options that are <strong>equivalent</strong> to each other (with ESP, serratus, paravertebral and local infiltration).${cite('desai2026')}</p>`,
      misses: `<ul><li><strong>The medial breast</strong>: skin medial to the mid-clavicular line is supplied partly by the anterior cutaneous branches, which PECS does not reach.${cite('atotw427')} A transversus thoracis (deep parasternal) block can be added for medial analgesia.${cite('sherwin2018')} See <a href="#ch-parasternal">parasternal</a>.</li><li><strong>Below the clavicle</strong>: the supraclavicular nerves (C3–C4) supply the upper breast and are not blocked (matters for ports and lines).${cite('atotw346')}</li><li><strong>Latissimus dorsi</strong>: the thoracodorsal nerve (for example, a latissimus dorsi flap) usually needs a superficial serratus block; PECS II reaches the long thoracic nerve only inconsistently.${cite('atotw346')}</li></ul>`,
    },
    complications: `<ul><li><strong>Vessel puncture</strong>: the thoracoacromial artery and many small vessels run in the interpectoral plane. Colour Doppler and aspirate.${cite('atotw346')}</li><li><strong>Pneumothorax</strong>: aim the needle at the top of the 4th rib (the rib beyond the tip) and not at the intercostal space; know where the pleura is before you start.${cite('atotw346')}</li><li><strong>Local anaesthetic toxicity</strong> with bilateral blocks: calculate the maximum dose.${cite('atotw346')}</li><li><strong>Intramuscular injection</strong> (the muscle swells instead of the plane opening) and failed block.</li></ul>`,
    sections: [
      { id: 'twostage', title: 'PECS II: the two-stage injection', render: renderTwoStage },
    ],
    exam: [
      {
        source: 'Practice question (not from the teaching slides)',
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
        source: 'Practice question (not from the teaching slides)',
        q: '<p>What are the 2021 consensus names for PECS I and PECS II?</p>',
        points: [
          'PECS I = interpectoral plane block (between pectoralis major and minor).',
          'PECS II = interpectoral plane block + pectoserratus plane block (between pectoralis minor and serratus anterior).',
          'Serratus: superficial and deep serratus anterior plane blocks.',
          'Parasternal: superficial and deep parasternal intercostal plane blocks (deep = the old transversus thoracis plane block).',
        ],
      },
    ],
    sources: `Technique and dose: WFSA tutorial 346 (Parras and Blanco 2017).${cite('atotw346')} Original descriptions: Blanco 2011 and 2012.${cite('blanco2011', 'blanco2012')} Breast surgery: Sherwin and Buggy 2018; PROSPECT 2026.${cite('sherwin2018', 'desai2026')} Names: 2021 consensus.${cite('names')} Teaching slide 127.${D}`,
  },

  // ------------------------------------------------------------------ parasternal
  {
    id: 'parasternal',
    kicker: 'Chest wall · Anteromedial (brief)',
    title: 'Parasternal intercostal plane blocks (superficial and deep)',
    summary: `Injections beside the sternum that block the <strong>anterior cutaneous branches of T2–T6</strong>.${cite('he2026')} <strong>Superficial</strong>: between pectoralis major and the intercostal muscles (older: pecto-intercostal fascial block). <strong>Deep</strong>: between the internal intercostal muscle and transversus thoracis (older: transversus thoracis plane block, TTP).${cite('names', 'he2026')} NTF has no cardiac surgery, so this is brief: know it for sternotomy in the exam and for medial breast analgesia.`,
    indications: ['Sternotomy (both sides): mainly for the exam at NTF', 'Medial breast analgesia, added to PECS', 'Anterior chest wall incisions near the sternum'],
    glance: {
      position: 'Supine',
      probe: 'Linear, beside the sternum at the 3rd–4th space',
      needle: 'In-plane from lateral; tip about 2 cm from the sternal edge',
      dose: '10–20 ml per side',
      covers: 'Anterior chest beside the sternum, about T2–T6',
    },
    position: '<p>Supine. A sternotomy needs both sides.</p>',
    equipment: [
      'High-frequency linear probe and colour Doppler',
      `10–20 ml per side of 0.25% bupivacaine or ropivacaine${cite('george2019')}`,
    ],
    landmarks: `<p>Count the costal cartilages in a parasagittal view beside the sternum. Then either stay <strong>parasagittal</strong> over the 3rd and 4th ribs,${cite('george2019')} or turn <strong>transverse in the 3rd–4th intercostal space</strong> about 2 cm from the sternum, as in the viewer.${cite('he2026')}</p><p>Find the <strong>internal thoracic artery and vein</strong> with colour Doppler before needling: the artery runs about 1–1.5 cm lateral to the sternal border, behind the first six costal cartilages, between the internal intercostal muscles and transversus thoracis.${cite('he2026', 'george2019')}</p>`,
    approach: `<p>In-plane. In the parasagittal view the needle is usually passed <strong>caudal to cranial</strong>.${cite('george2019')} In the transverse view, go <strong>in-plane from lateral</strong>; keep the needle path and tip about <strong>2 cm from the sternal edge</strong>, lateral to the internal thoracic vessels.${cite('he2026')}</p>`,
    sonoanatomy: `<p>Pectoralis major, the costal cartilages (parasagittal) or the intercostal muscles (transverse), the thin dark band of <strong>transversus thoracis</strong> lying on the pleura, and the internal thoracic vessels between the intercostal muscles and transversus thoracis.${cite('george2019', 'he2026')}</p>`,
    target: `<ul><li><strong>Superficial parasternal intercostal plane</strong>: between pectoralis major and the intercostal muscles, where the anterior cutaneous branches run about 1.5–2 cm from the sternal edge.${cite('he2026')}</li><li><strong>Deep parasternal intercostal plane</strong> (transversus thoracis plane): between the internal intercostal muscle and transversus thoracis.${cite('he2026', 'george2019')}</li></ul><p>The review by He et al. favours the superficial plane for safety: it stays away from the internal thoracic artery and the pleura.${cite('he2026')}</p>`,
    dose: {
      html: '<span class="tb-dose-v">10–20 ml</span> per side of <span class="tb-dose-v">0.25%</span> bupivacaine or ropivacaine',
      source: `ASRA News “How I do it” (transversus thoracis plane).${cite('george2019')} Superficial block: typically 20 ml of 0.25% bupivacaine.${cite('he2026')} As an add-on for breast surgery, 15 ml of 0.15% levobupivacaine has been suggested.${cite('sherwin2018')} The teaching slides give no parasternal dose.${D}`,
      note: 'Sternotomy needs both sides: the total dose doubles.',
    },
    coverage: {
      side: 'bilateral',
      areas: [
        { levels: ['T3', 'T5'], zones: ['front-mid'], density: 'moderate' },
        { levels: ['T2', 'T6'], zones: ['front-mid'], density: 'patchy' },
      ],
      summary: 'The anterior chest beside the sternum, about T2–T6 (shown on both sides, as for a sternotomy).',
      mechanism: `<p>Beside the sternum each intercostal nerve ends as an anterior cutaneous branch, which passes forward through the intercostal muscles and pectoralis major to the skin.${cite('he2026')} The branches run about 1.5–2 cm from the sternal edge, between pectoralis major and the intercostal muscles.${cite('he2026')} Local anaesthetic in either parasternal plane catches these branches.</p>`,
      density: `<p>One deep injection between ribs 3 and 4 on each side is described as spreading to cover the whole sternum.${cite('george2019')} A single superficial injection spreads only about two intercostal segments in cadavers, so two injection levels give more reliable T2–T6 cover.${cite('he2026')}</p>`,
      misses: '<p>The lateral chest wall (lateral cutaneous branches), the back, and visceral pain from the heart, pericardium and mediastinum. Mediastinal drain sites, usually in the epigastrium below the sternum, are outside the area parasternal blocks cover.</p>',
    },
    complications: `<ul><li><strong>Pneumothorax</strong>: more common with the deep block (11.8% in one study, against 2.4% in controls) than with the superficial block.${cite('he2026')} Excessive needle advance can puncture the pleura, or the pericardium on the left.${cite('george2019')}</li><li><strong>Internal thoracic artery puncture</strong> and haematoma: in cadavers the deep needle path often passes within 3–5 mm of the artery. Doppler first; prefer the superficial block if the artery has been used as a graft.${cite('he2026')}</li><li><strong>Local anaesthetic toxicity</strong>: bilateral injections and large total doses.${cite('he2026', 'george2019')}</li></ul>`,
    exam: [
      {
        source: 'Practice question (not from the teaching slides)',
        q: '<p>Which nerves supply the skin over the sternum, and which blocks reach them? Why would a serratus anterior plane or PECS II block not help a sternotomy?</p>',
        points: [
          'The anterior cutaneous branches of the intercostal nerves T2–T6, which emerge beside the sternum. Sternotomy levels: T2–T6 both sides, single-shot level T4 (teaching slide 147).',
          'Superficial parasternal intercostal plane: between pectoralis major and the intercostal muscles.',
          'Deep parasternal intercostal plane (transversus thoracis plane): between the internal intercostal muscle and transversus thoracis.',
          'Serratus and PECS II act on the lateral cutaneous branches around the mid-axillary line, which have already left the nerve; they do not reach the anterior branches.',
          'Hazards: internal thoracic artery (Doppler; keep the needle path and tip about 2 cm from the sternal edge, lateral to the vessels), pneumothorax, pericardium on the left, bilateral dose.',
        ],
      },
    ],
    sources: `Technique and dose: ASRA News “How I do it” (George, Dahl, Blair de Haan 2019).${cite('george2019')} Review of technique, coverage and safety: He et al. 2026.${cite('he2026')} Names: 2021 consensus.${cite('names')} Levels: teaching slide 147.${D}`,
  },
].map((b) => ({ ...b, scene: SCENES[b.id] }));
