// spinal/ — anatomy chapter: nerve fibres, differential block, regression, dermatome/myotome tables, block heights.
import { el, tier, callout, table, details } from '../ui.js?v=1';

const P = (html, cls = 'sp-prose') => el('p', { class: cls, html });

/** Fibre types, order of block, regression. */
export function buildFibres() {
  const s = el('div', { class: 'an-sub', id: 'an-fibres' });
  s.append(el('h3', { text: 'Nerve fibres, differential block and regression' }));
  s.append(
    tier(callout('key', { title: 'Answer first', body: '<p>Block comes on in a fixed order: <strong>sympathetic first, then cold, then pain, then touch, then motor and position sense last</strong>. Regression runs in the reverse order. So the sympathetic block (and the drop in blood pressure) reaches higher and lasts longer than the sensory block you test, and the motor block is the lowest.</p>' }), 1),
    tier(table({
      caption: 'Nerve fibre types',
      head: ['Fibre', 'Size, myelin, speed', 'Carries', 'Block order'],
      rows: [
        [{ html: 'A-alpha', th: true }, '12–20 µm, heavy myelin, 70–120 m/s', 'Motor to skeletal muscle; proprioception (muscle spindle and tendon)', 'Last'],
        [{ html: 'A-beta', th: true }, '5–12 µm, heavy myelin, 30–70 m/s', 'Touch, pressure, vibration', 'Late'],
        [{ html: 'A-gamma', th: true }, '3–6 µm, moderate myelin, 15–30 m/s', 'Motor to muscle spindles (muscle tone)', 'Middle'],
        [{ html: 'A-delta', th: true }, '1–4 µm, thin myelin, 5–30 m/s', 'Sharp, fast pain; cold; some touch', 'Early'],
        [{ html: 'B', th: true }, 'Under 3 µm, light myelin, 3–15 m/s', 'Preganglionic sympathetic (autonomic)', 'First'],
        [{ html: 'C', th: true }, '0.4–1.2 µm, no myelin, 0.5–2 m/s', 'Slow, dull pain; warmth; postganglionic sympathetic', 'Early'],
      ],
    }), 2),
    tier(P('Sympathetic block (B fibres) comes first even though C fibres are smaller. Myelinated fibres block at a lower concentration than unmyelinated fibres of similar size. In sequence the patient loses: <strong>sympathetic tone</strong>, then <strong>cold</strong> (and warmth), then <strong>pinprick</strong>, then <strong>light touch and pressure</strong>, then <strong>motor power</strong> and finally <strong>position sense</strong>.'), 2),
    tier(el('div', { id: 'an-differential' },
      el('h4', { text: 'Why a differential block happens' }),
      el('ul', { html: [
        '<li>The drug is diluted as it spreads away from the injection site, so each level of the cord sees a different concentration. The concentration falls with distance, and the most sensitive fibres are blocked furthest away.</li>',
        '<li>Fibres differ in how much drug they need. Small, myelinated B fibres need the least, large A-alpha fibres the most.</li>',
        '<li>A fibre is blocked when enough of its length is exposed: classically 2–3 consecutive nodes of Ranvier, about 1–2 cm of a myelinated fibre. Thicker fibres have longer internodes and so need more length.</li>',
        '<li>Dermatomes overlap, so one segment is not blocked until the roots above and below it are blocked too.</li>',
        '<li><strong>Result:</strong> sympathetic block typically extends two or more segments above the sensory (pinprick) level, and motor block sits about two segments below it.</li>',
      ].join('') })), 2),
    tier(callout('pearl', { title: 'Differential block is not guaranteed', body: '<p>“Two segments” is a teaching average. Studies find the sympathetic level anywhere from about two to six segments above the sensory level, and cold reads typically about two segments above pinprick, with wide variation. Large hyperbaric doses blunt the difference and produce a dense motor block. Use the numbers to expect a trend, not to predict one patient.</p>' }), 3),
    tier(el('div', { id: 'an-regression' },
      el('h4', { text: 'Regression: what comes back first' }),
      table({
        head: ['Order', 'What returns', 'Practical point'],
        rows: [
          [{ html: '1st', th: true }, 'Position sense and motor power', 'The patient can move the toes and then the knee. Do not let them stand until motor power and position sense are back'],
          [{ html: '2nd', th: true }, 'Touch and pressure', 'Pressure from a tourniquet or the table edge is felt before pain'],
          [{ html: '3rd', th: true }, 'Pinprick (pain) then cold', 'The sensory level regresses from the top downwards, so the sacral segments are the last to recover'],
          [{ html: 'Last', th: true }, 'Sympathetic tone and the sacral parasympathetic (bladder)', 'Low blood pressure on standing and urinary retention can persist after the legs feel normal. Check both before discharge'],
        ],
      }),
      P('Dose and drug set the time: longer-acting drugs and larger doses regress later.')), 2),
  );
  return s;
}

/** Dermatome, myotome and reflex tables, plus block height by operation (the single home for targets). */
export function buildHeights() {
  const wrap = el('div', {});
  wrap.append(
    tier(el('div', { id: 'an-targets' },
      el('h4', { text: 'Block height needed by operation' }),
      table({
        caption: 'Approximate sensory level to aim for',
        head: ['Operation', 'Aim for (sensory level)'],
        rows: [
          [{ html: 'Perineal, anal, saddle area', th: true }, '<strong>S2–S4</strong> (a saddle block). A short sitting period after a hyperbaric dose keeps the block low'],
          [{ html: 'Foot and ankle (no thigh tourniquet)', th: true }, '<strong>Up to about L2</strong>, with the sacral roots blocked. The leg below the knee is supplied by L4 to S2'],
          [{ html: 'Thigh, lower limb, amputation', th: true }, '<strong>L1</strong>. Covers the inguinal ligament and the thigh'],
          [{ html: 'Knee arthroplasty or any surgery with a thigh tourniquet', th: true }, '<strong>T10–T12</strong>. Tourniquet pain needs a higher block than the incision. Agree the level with the surgeon'],
          [{ html: 'Hip surgery, TURP, vaginal procedures', th: true }, '<strong>T10</strong>. For TURP aim no higher than about T10: a higher block can hide the pain of bladder or capsule perforation'],
          [{ html: 'Inguinal hernia repair', th: true }, '<strong>T10</strong> for the skin; many aim for about <strong>T8</strong> to cover traction on the peritoneum and cord (local practice)'],
          [{ html: 'Lower abdominal and pelvic surgery', th: true }, '<strong>T6–T8</strong>. Peritoneal traction needs a higher level than the incision'],
          [{ html: 'Caesarean section', th: true }, '<strong>T4</strong> (to touch or cold). The standard obstetric target'],
          [{ html: 'Upper abdominal surgery', th: true }, '<strong>T4–T5</strong>. Rarely done under spinal alone. Bradycardia and hypotension are likely'],
        ],
      }),
      P('These are approximate and are taught widely. State the modality you test. Cold lies higher than pinprick, so the same “T4” can mean different things.')), 1),
    tier(details({
      id: 'an-dermatome-table',
      summary: 'Dermatome landmarks, C2 to S5',
      body: table({
        head: ['Level', 'Skin landmark', 'Spinal relevance'],
        rows: [
          [{ html: 'C6, C7, C8', th: true }, 'Thumb, middle finger, little finger', 'Numb or weak fingers in a high block mean the cervical roots are involved'],
          [{ html: 'T1', th: true }, 'Medial forearm', 'Top of the cardioaccelerator outflow (T1–T4)'],
          [{ html: 'T4', th: true }, 'Nipple line', 'Caesarean target. Cardioaccelerator fibres are in range'],
          [{ html: 'T6', th: true }, 'Xiphisternum', 'Lower abdominal and pelvic surgery, upper range'],
          [{ html: 'T8', th: true }, 'Lower costal margin', 'Lower abdominal surgery, lower range'],
          [{ html: 'T10', th: true }, 'Umbilicus', 'Hip, TURP, vaginal surgery'],
          [{ html: 'T12', th: true }, 'Suprapubic skin', 'Tourniquet cover is usually aimed at T10–T12'],
          [{ html: 'L1', th: true }, 'Inguinal ligament', 'Thigh and lower limb surgery'],
          [{ html: 'L2', th: true }, 'Upper, front of thigh', ''],
          [{ html: 'L3', th: true }, 'Front of knee and lower thigh', 'Knee surgery'],
          [{ html: 'L4', th: true }, 'Medial leg and medial malleolus', ''],
          [{ html: 'L5', th: true }, 'Dorsum of foot, great toe', 'A common site of incomplete block'],
          [{ html: 'S1', th: true }, 'Lateral foot, little toe, sole', 'Sacral roots are large and slow to block'],
          [{ html: 'S2–S4', th: true }, 'Back of thigh (S2), perineum, perianal area', 'Last to block, last to regress. Bladder and bowel are also here'],
        ],
      }),
    }), 2),
    tier(el('div', { id: 'an-myotomes' },
      el('h4', { text: 'Myotomes and reflexes (motor check)' }),
      table({
        caption: 'Movement tested and root supply',
        head: ['Movement or reflex', 'Roots', 'Use'],
        rows: [
          [{ html: 'Hip flexion (raise the extended leg)', th: true }, 'L2–L3', 'Bromage grading. Loss means the block has reached L2'],
          [{ html: 'Hip adduction', th: true }, 'L2–L4', ''],
          [{ html: 'Knee extension', th: true }, 'L3–L4', 'Quadriceps'],
          [{ html: 'Hip abduction', th: true }, 'L4–S1', ''],
          [{ html: 'Ankle dorsiflexion', th: true }, 'L4–L5', 'Foot drop is the L4–L5 sign'],
          [{ html: 'Great-toe extension', th: true }, 'L5', ''],
          [{ html: 'Knee flexion and hip extension', th: true }, 'L5–S2', 'Hamstrings and gluteus maximus'],
          [{ html: 'Plantarflexion (stand on tiptoe)', th: true }, 'S1–S2', 'Last major muscle group to return'],
          [{ html: 'Anal tone and sphincter', th: true }, 'S2–S4', 'Check in a suspected cauda equina syndrome'],
          [{ html: 'Knee jerk', th: true }, 'L3–L4', ''],
          [{ html: 'Ankle jerk', th: true }, 'S1–S2', ''],
        ],
      }),
      P('Motor power is graded with the modified Bromage scale in the Technique chapter. The same table is the quickest way to find where a residual block or a new deficit sits when you examine for a neurological problem.')), 2),
  );
  return wrap;
}
