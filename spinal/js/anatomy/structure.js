// spinal/ — anatomy chapter: bony column, epidural space, meninges, cord levels (adult and child), blood supply.
// Pure content builders; sections/anatomy.js decides where they go. Tier on every top-level block.
import { el, tier, callout, table, details } from '../ui.js?v=1';

const P = (html, cls = 'sp-prose') => el('p', { class: cls, html });
const num = (s) => `<span class="sp-num">${s}</span>`;

/** "Vertebral column and spinal canal": bone, curves, canal, epidural space. */
export function buildVertebral() {
  const s = el('div', { class: 'an-sub', id: 'an-vertebral' });
  s.append(el('h3', { text: 'Vertebral column and spinal canal' }));
  s.append(
    tier(P(`<strong>Answer first.</strong> There are 33 vertebrae: 7 cervical, 12 thoracic, 5 lumbar, 5 fused sacral and 4 coccygeal. A lumbar spinal goes through the gap between two laminae. That gap is widest in the lumbar spine and opens further when the back is flexed. The largest gap is L5–S1.`), 1),
    tier(table({
      caption: 'Curves of the spine and why they matter',
      head: ['Curve', 'Kind', 'Supine position', 'Why it matters'],
      rows: [
        [{ html: 'Cervical lordosis', th: true }, 'Secondary (forms when the infant holds up the head)', 'Rises towards the head', 'Part of the route to the brain if the drug goes high'],
        [{ html: 'Thoracic kyphosis', th: true }, 'Primary', 'Lowest point about T5–T6', 'A hyperbaric solution runs here and pools, so the block commonly stops in the mid-thoracic dermatomes'],
        [{ html: 'Lumbar lordosis', th: true }, 'Secondary (forms when the child walks)', 'Highest point about L3–L4', 'Where the injection is made. Hypobaric solution rises towards it'],
        [{ html: 'Sacral kyphosis', th: true }, 'Primary', 'Slopes down to the sacral sac', 'Hyperbaric drug runs down into the sacral roots if the patient sits for a few minutes'],
      ],
    }), 2),
    tier(el('div', { id: 'an-vertebra' },
      el('h4', { text: 'What a lumbar vertebra offers the needle' }),
      el('ul', { html: [
        '<li><strong>Spinous process:</strong> points almost straight back in the lumbar spine, so a midline needle goes in nearly perpendicular with a slight cephalad tilt. Thoracic spinous processes slope steeply down and overlap, which is why the mid-thoracic midline is hard.</li>',
        '<li><strong>Laminae:</strong> the bony roof of the canal on each side. Bone met at the expected depth is usually lamina. Walking off its upper edge finds the gap.</li>',
        '<li><strong>Articular processes and facet joints:</strong> lie lateral to the laminae and form the lateral edge of the gap. A paramedian needle that goes too far lateral hits facet.</li>',
        '<li><strong>Pedicles and intervertebral foramina:</strong> each root leaves through the foramen below the pedicle of the vertebra of the same number (the L4 root under the L4 pedicle).</li>',
        '<li><strong>Vertebral body and posterior longitudinal ligament:</strong> the front wall of the canal. A needle that goes too deep touches them (bone at a deep, hard stop).</li>',
      ].join('') })), 2),
    tier(callout('pearl', { title: 'Cord segments are higher than vertebrae', body: '<p>The cord is shorter than the canal. Lumbar cord segments lie opposite the T10–T12 vertebrae and sacral segments opposite L1. So a vertebral level and a dermatome level are never the same number, and root levels below the conus travel down as the cauda equina.</p>' }), 2),
  );
  // epidural space
  s.append(
    tier(details({
      id: 'an-epidural-space',
      summary: 'The epidural space: boundaries, contents, why it matters for a spinal',
      body: [
        el('p', { class: 'sp-prose', html: 'A potential space outside the dura, running from the foramen magnum (where the dura fuses with the skull) to the sacral hiatus, which is closed by the sacrococcygeal membrane. A spinal needle crosses it in a few millimetres, so it matters for what you feel, for bleeding and for combined spinal-epidural technique.' }),
        table({
          head: ['Boundary', 'Structure'],
          rows: [
            [{ html: 'Anterior', th: true }, 'Posterior longitudinal ligament covering the vertebral bodies and discs'],
            [{ html: 'Posterior', th: true }, 'Ligamentum flavum and the laminae'],
            [{ html: 'Lateral', th: true }, 'Pedicles and the intervertebral foramina. Roots leave through them in dural sleeves, so fluid can leak out into the paravertebral space'],
            [{ html: 'Above', th: true }, 'Foramen magnum'],
            [{ html: 'Below', th: true }, 'Sacral hiatus and sacrococcygeal membrane (S4–S5): the caudal approach'],
          ],
        }),
        el('h4', { text: 'Contents' }),
        el('ul', { html: [
          '<li><strong>Fat:</strong> a loose pad that is more abundant in the lumbar region.</li>',
          '<li><strong>Internal vertebral venous plexus (Batson):</strong> valveless veins that join the azygos system, the pelvic veins and the intracranial sinuses. They engorge when the inferior vena cava is compressed (late pregnancy, large abdominal mass, straining), which shrinks the space and the dural sac and raises the chance of a bloody tap.</li>',
          '<li><strong>Nerve roots in their dural sleeves,</strong> lymphatics and small spinal arteries.</li>',
        ].join('') }),
        el('p', { class: 'sp-prose', html: 'The space is widest in the posterior midline of the mid-lumbar region (a few millimetres) and narrower in the thoracic and cervical regions. The pressure in it is variable, so “negative pressure” is not a dependable sign of position.' }),
      ],
    }), 2),
    tier(details({
      id: 'an-subdural',
      summary: 'Subdural space and the odd block',
      body: [
        el('p', { class: 'sp-prose', html: 'The arachnoid lies against the dura. The “subdural space” between them is only a potential space that opens up under pressure or after trauma, and it extends to the cranial cavity. A needle or catheter tip that lies there gives a block that is unexpectedly high or patchy, often with sparing of motor fibres, and slower to appear than a spinal. If a block looks wrong for the dose given, think of a subdural position as well as a failed or high spinal.' }),
      ],
    }), 3),
  );
  return s;
}

/** Cord, meninges, levels in adult and child, blood supply. */
export function buildMeninges() {
  const s = el('div', { class: 'an-sub', id: 'an-conus' });
  s.append(el('h3', { text: 'Cord, meninges and where they end' }));
  s.append(
    tier(callout('key', { title: 'Answer first', body: `<p>The adult cord ends (conus) at about L1, range T12 to L3. The dural sac ends at about S2. A spinal goes in at L3–4 or below, where the sac holds only CSF and floating roots. In a baby both end lower, so the safe space is lower.</p>` }), 1),
    tier(table({
      caption: 'Where the cord and the dural sac end',
      head: ['Structure', 'Adult', 'Newborn', 'Note'],
      rows: [
        [{ html: 'Conus medullaris (tip of the cord)', th: true }, 'Lower third of L1 on average. Range middle of T12 to upper third of L3 in 504 adult MRI scans', 'About L3', 'Rises to the adult level during the first year or so. In one MRI study of 100 adults the conus lay below L1 in 19%'],
        [{ html: 'Dural sac', th: true }, 'About S2, a minority S3', 'About S3–S4', 'Reaches the adult level during the first year or so'],
        [{ html: 'Tuffier’s line (iliac crests)', th: true }, 'L4 body or L4–5 space, unreliable', 'Lower: about L5', 'Count up or down from the line and treat it as a guide only'],
      ],
    }), 2),
    tier(details({ id: 'an-meninges', summary: 'Meninges and their parts: dura, arachnoid, pia, filum, denticulate ligaments, cauda equina', body: table({
      head: ['Structure', 'What it is', 'Why it matters'],
      rows: [
        [{ html: 'Dura mater', th: true }, 'Tough outer membrane of collagen and elastic fibres. Forms the dural sac from the foramen magnum to about S2, then continues as the filum durae to the coccyx', 'The needle feels it as a click or pop. The hole it leaves is the cause of post-dural puncture headache'],
        [{ html: 'Arachnoid mater', th: true }, 'Thin, avascular layer lying against the dura', 'The main barrier to drugs crossing between CSF and the epidural space'],
        [{ html: 'Subarachnoid space', th: true }, 'Holds CSF, the cord and (below the conus) the cauda equina', 'Where the drug is injected and spreads'],
        [{ html: 'Pia mater', th: true }, 'Thin layer closely covering the cord and roots', 'Forms the filum terminale and the denticulate ligaments'],
        [{ html: 'Filum terminale', th: true }, 'A thin strand of pia from the conus, running to the end of the dural sac and then to the coccyx', 'Anchors the cord. A tight (tethered) filum pulls the conus low'],
        [{ html: 'Denticulate ligaments', th: true }, 'Sheets of pia on each side, attached to the dura between the dorsal and ventral roots (about 21 pairs)', 'Hold the cord centrally in the sac'],
        [{ html: 'Cauda equina', th: true }, 'Lumbar, sacral and coccygeal roots below the conus', 'Free-floating, so the roots tend to slide away from the needle'],
      ],
    }) }), 2),
    tier(el('div', { id: 'an-cordsupply' },
      el('h4', { text: 'Blood supply of the cord' }),
      table({
        head: ['Vessel', 'Territory and detail'],
        rows: [
          [{ html: 'Anterior spinal artery (1)', th: true }, 'Formed from branches of both vertebral arteries. Supplies about the anterior two-thirds of the cord: anterior horns, spinothalamic tracts and corticospinal tracts'],
          [{ html: 'Posterior spinal arteries (2)', th: true }, 'From the vertebral or posterior inferior cerebellar arteries. Supply the posterior third: dorsal columns and horns. They join each other by a rich network'],
          [{ html: 'Radicular (segmental) arteries', th: true }, 'Enter with the roots and reinforce the spinal arteries from the vertebral, intercostal, lumbar and sacral arteries. Only a few of the anterior ones are large'],
          [{ html: 'Artery of Adamkiewicz (arteria radicularis magna)', th: true }, 'The largest anterior radicular artery. Arises on the left in most people, between about T9 and L2. Supplies much of the lower cord'],
          [{ html: 'Watershed', th: true }, 'The mid-thoracic cord (about T4–T8) lies furthest from the feeding vessels and is the most vulnerable to low flow'],
          [{ html: 'Veins', th: true }, 'Valveless. Drain to the internal vertebral (Batson) plexus and on to the azygos system and the inferior vena cava'],
        ],
      }),
      P('Occlusion of the anterior spinal artery gives the <strong>anterior cord syndrome</strong>: paraplegia with loss of pain and temperature below the lesion, but with touch, vibration and position sense kept (dorsal columns spared), plus bladder and bowel loss. Causes include aortic cross-clamping or dissection, severe prolonged hypotension, embolism, and an epidural haematoma that compresses the cord. It is rare after neuraxial block.')), 2),
    tier(callout('pearl', { title: 'Hypotension and the cord', body: '<p>Cord flow is autoregulated and depends on perfusion pressure. A spinal below the conus does not touch the cord directly, but severe or prolonged hypotension on top of aortic or arterial disease, a very high block or raised CSF pressure can reduce flow in the vulnerable territories. Treat hypotension early and aim near the patient’s usual pressure. New weakness that outlasts the expected block, or back pain with leg weakness, needs urgent review and imaging: see <a href="#cx-neuro-check">neurological checks</a>.</p>' }), 3),
  );
  return s;
}
