// Ultrasound-assisted neuraxial (second half of the Difficult backs & ultrasound chapter).
// Simulated scans are computed in the browser (js/ultrasound/*): original procedural images, not patient scans.
// Facts from research file 01 part B; journal refs and abstracts checked on PubMed/Crossref (9 October 2026); the NYSORA chapter was read in full.
import { el, callout, steps, table, tier, keyPoints, registerSearch } from '../ui.js?v=1';
import { createViewer } from '../ultrasound/viewer.js';

export const meta = { id: 'ultrasound', prefix: 'us', title: 'Ultrasound-assisted neuraxial' };

export const refs = {};

function viewInfo(view, html) {
  return el('div', { class: 'us-view-info', dataset: { usFor: view }, html });
}

export function mount(root) {
  root.append(
    keyPoints([
      'A short scan before the spinal shows the midline, the level and the depth to the dura.',
      'Scan first, mark the skin, wipe off the gel, then do the spinal as usual.',
      'Start at the sacrum, then count the gaps upwards. Do not trust palpation alone for the level.',
      'The patient must stay still after marking. If they move, the marks are wrong: rescan.',
      'Ultrasound reads slightly shallow: expect the space a little deeper than you measured.',
      'It helps most in obesity, scoliosis, previous spine surgery and after difficult attempts: fewer attempts and more first-pass successes.',
      'Learn four views: transverse over the spinous process (midline), transverse interlaminar (“flying bat”), paramedian sagittal lamina (“sawtooth”) and paramedian sagittal oblique (“horse head”).',
      'It does not show the needle tip. Stop and get help if the scan and the feel do not agree.',
    ]),
    tier(el('p', { class: 'sp-lead', html: `A short scan before you start shows you the midline, the level and the depth to the dura. Most of the evidence is for this pre-procedure scan: mark the skin, wipe off the gel, then do the spinal as usual.` }), 1),
    el('ul', { class: 'sp-jump', html: '<li><a href="#us-six">Scan in 6 steps</a></li><li><a href="#us-views">The views</a></li><li><a href="#us-viewer">Scan viewer</a></li><li><a href="#us-count">Counting levels</a></li><li><a href="#us-depth">Depth</a></li><li><a href="#us-setup">Probe and set-up</a></li><li><a href="#us-marking">Marking</a></li><li><a href="#us-scol">Scoliosis</a></li><li><a href="#us-realtime">Pre-procedure or real time</a></li><li><a href="#us-who">Who benefits</a></li><li><a href="#us-evidence">Evidence</a></li>' }),
  );

  // ------------------------------------------------------------ 6-step pre-procedure scan (MO)
  const six = el('div', { class: 'us-prose' });
  six.append(
    el('h3', { id: 'us-six', text: 'Pre-procedure scan in 6 steps' }),
    tier(steps([
      { id: 'us-mark-level', title: 'Find the sacrum', tag: 'Paramedian', body: '<p>Probe just beside the midline, low on the back, marker towards the head. The sacrum is a flat bright line with a dense shadow and no gaps.</p>' },
      { title: 'Count up the gaps', body: '<p>Slide towards the head. The first gap above the sacrum is L5–S1. Then L4–5, then L3–4. Say the count out loud as you go.</p>' },
      { title: 'Mark the interspace', body: '<p>Centre the gap you want on the screen. Mark the skin at the middle of the long side of the probe.</p>' },
      { id: 'us-mark-midline', title: 'Turn the probe across the back to find the midline', tag: 'Transverse', body: '<p>Centre the spinous process tip and its shadow. Mark the skin above and below the probe, and join the marks.</p>' },
      { id: 'us-mark-depth', title: 'Check the window and measure the depth', tag: 'Transverse', body: '<p>Slide into the gap. Freeze the image when you can see the anterior complex. Measure from the skin to the posterior complex.</p>' },
      { id: 'us-mark-point', title: 'Mark the insertion point', body: '<p>Where the two lines cross is your insertion point. Remember the probe angle, then wipe off the gel (before skin antisepsis, without rubbing off the marks) and keep the patient still.</p>' },
    ]), 1),
    tier(callout('warn', {
      title: 'Stop and get help',
      body: '<p>If you cannot find the sacrum, cannot count the gaps with confidence, or see no clear window, do not guess. Ask your senior to scan with you.</p>',
    }), 1),
  );
  root.append(six);

  // ------------------------------------------------------------ the views
  const views = el('div', { class: 'us-prose' });
  views.append(
    el('h3', { id: 'us-views', text: 'The four views' }),
    tier(table({
      caption: 'Scanning views and their nicknames (nicknames vary between texts)',
      head: ['View', 'Probe', 'You see', 'Nickname', 'Use'],
      rows: [
        [{ html: 'Transverse over the spinous process (midline)', th: true }, 'Across the back, over a spinous process', 'Bright tip, solid shadow, no canal', '–', 'Find the midline when you cannot feel the spinous processes, for example in obesity'],
        [{ html: 'Transverse interlaminar (interspinous)', th: true }, 'Across the back, slid into the gap, slight cephalad tilt', 'Posterior complex, black thecal sac, anterior complex, articular and transverse processes either side', '“Flying bat” (transverse processes are the wings, articular processes the ears); also called the “cat’s head”', 'Window, depth, midline, rotation. The two sides should look alike: if they do not, suspect rotation and angle the needle to match'],
        [{ html: 'Paramedian sagittal lamina (PSL)', th: true }, 'About 2–3 cm from the midline, long axis along the spine', 'Laminae as bright slopes with shadows between; flat bright sacrum', '“Sawtooth”; some texts call this the “horse head” too', 'Counting levels'],
        [{ html: 'Paramedian sagittal oblique (PSO)', th: true }, 'Same, tilted towards the midline', 'Laminae with a gap between them showing posterior complex, black thecal sac, anterior complex', '“Horse head”', 'Depth, angle, real-time guidance'],
      ],
    }), 1),
    tier(el('p', { html: 'Slide the probe further out from the laminae and the articular processes form one continuous wavy line with no gaps (the “camel hump”): there is no window into the canal here. Further out again, the transverse processes appear as short bright lines with finger-like shadows (the “trident”), with psoas between them. Either view tells you that you are too lateral; move back towards the midline.' }), 2),
    tier(el('p', { html: 'In the transverse interlaminar view the ligamentum flavum and epidural space are often hard to see, because the beam meets them at an awkward angle. Use the transverse view for the midline and rotation, and the paramedian oblique view for depth.' }), 3),
  );
  root.append(views);

  // ------------------------------------------------------------ the viewer (Fig 5.4)
  const infos = {
    pso: viewInfo('pso', `
      <p class="us-mini-h">Paramedian sagittal oblique (PSO) view</p>
      <p><strong>Probe:</strong> about 2–3 cm from the midline, over the laminae, marker cranial, tilted towards the midline so the beam passes through the gaps between the laminae.</p>
      <p><strong>You see:</strong> laminae as bright sloping lines, each with a black shadow beneath (the “horse head” pattern). In each gap: the posterior complex, the black intrathecal space and the anterior complex.</p>`),
    sacrum: viewInfo('sacrum', `
      <p class="us-mini-h">Counting up from the sacrum</p>
      <p>Start in the PSO view low on the back. The sacrum is a flat bright line with no gaps and a dense shadow. The first gap above it is <strong>L5–S1</strong>. Slide cranially and count the gaps: L4–5, then L3–4.</p>
      <p>Centre the gap you want on the screen, then mark the skin at the middle of the long side of the probe. Use <em>Probe at</em> under the images to slide.</p>`),
    transverse: viewInfo('transverse', `
      <p class="us-mini-h">Transverse views</p>
      <p><strong>Over a spinous process:</strong> a bright tip just under the fat and a solid shadow, so no canal. Use this view to find the midline.</p>
      <p><strong>In the gap</strong> (slide up or down, often with a slight cephalad tilt): articular processes and transverse processes either side, with the posterior complex, the black thecal sac and the anterior complex in the middle. Many teachers call this the “flying bat” sign: transverse processes are the wings and the articular processes the ears.</p>
      <p>A lopsided picture means the probe is off the midline or the vertebra is rotated, as in scoliosis.</p>`),
  };
  const viewer = createViewer({
    num: '5.4',
    infos,
    caption: 'Simulated scans and diagrams drawn by this page from one model of an adult lumbar spine with typical depths. They are not patient images and are not to scale for any one patient. Sagittal views show cranial on the left; transverse views show the patient’s left on the left.',
  });
  root.append(tier(viewer.fig, 2));

  // ------------------------------------------------------------ counting levels
  const count = el('div', { class: 'us-prose' });
  count.append(
    el('h3', { id: 'us-count', text: 'Counting the levels' }),
    tier(el('p', { html: 'Count up from the sacrum in the paramedian sagittal view (PSL or PSO): the sacrum is the flat bright line, and the first gap above it is L5–S1. Palpation alone is not reliable for the level.' }), 1),
    tier(table({
      caption: 'Ways to confirm the level',
      head: ['Method', 'How', 'Catch'],
      rows: [
        [{ html: 'Count up from the sacrum', th: true }, 'PSL or PSO from the sacrum, count the gaps', 'A transitional vertebra shifts the count by one'],
        [{ html: 'Count down from the 12th rib', th: true }, 'Find the 12th rib laterally, then follow T12 and count down', 'Needs a second scan; useful as a cross-check'],
        [{ html: 'Palpation (Tuffier’s line)', th: true }, 'Line between the iliac crests, about L4 or L4–5', 'Often wrong; the true level is usually higher than estimated'],
      ],
    }), 2),
    tier(el('p', { html: 'Why it matters: the spinal cord ends around L1 in most adults, so an error that puts the needle a level or two higher than you think can reach the cord. Choose the lower of two possible spaces.' }), 2),
  );

  // ------------------------------------------------------------ depth
  const depth = el('div', { class: 'us-prose' });
  depth.append(
    el('h3', { id: 'us-depth', text: 'Depth to the ligamentum flavum and dura' }),
    tier(el('p', { html: 'In the interlaminar view the first bright band is the <strong>posterior complex</strong> (ligamentum flavum with the posterior dura). The second bright band, deeper, is the <strong>anterior complex</strong> (anterior dura, posterior longitudinal ligament and vertebral body). The black space between them is the thecal sac. Measure from the skin to the posterior complex; the intrathecal space lies a little deeper.' }), 1),
    tier(el('p', { html: 'If the measured depth is longer than your needle, change the needle before you start. See the <a href="#sx-obesity">obesity plan</a>.' }), 1),
  );

  // ------------------------------------------------------------ set-up
  const setup = el('div', { class: 'us-prose' });
  setup.append(
    el('h3', { id: 'us-setup', text: 'Probe and set-up' }),
    tier(el('p', { html: `Use a <strong>low-frequency (2–5 MHz) curvilinear probe</strong>. The structures you need lie several centimetres deep, and the curved array gives a wide view at depth. A high-frequency linear probe is for superficial targets such as the sacral hiatus.` }), 1),
    tier(el('p', { html: 'Scan with the patient in the position you will use for the block, sitting or lateral, with the back flexed. Once the skin is marked the patient must stay still: if they move, the marks no longer lie over the gap.' }), 1),
    tier(el('p', { html: `Set the depth so the anterior complex is on the screen; you will need more depth in larger patients. In sagittal scans the probe marker points cranially.` }), 2),
    tier(callout('key', {
      title: 'Screen orientation',
      body: '<p>Screen conventions differ between machines. On this page sagittal images have cranial on the left and transverse images have the patient’s left on the left. Check which side the marker is on before you mark the skin.</p>',
    }), 2),
  );

  // ------------------------------------------------------------ marking
  const marking = el('div', { class: 'us-prose' });
  marking.append(
    el('h3', { id: 'us-marking', text: 'Marking: pitfalls' }),
    tier(el('p', { html: 'The steps are in <a href="#us-six">Scan in 6 steps</a>. These notes cover what goes wrong.' }), 1),
    tier(callout('key', {
      title: 'Ultrasound reads slightly shallow',
      body: `<p>Ultrasound depth agrees well with the depth at which the needle reaches the space: in most studies the difference is within about 3 mm. When they differ, ultrasound usually reads shallower, by up to about 0.5 cm, because the probe compresses the soft tissue. Expect the epidural space a little deeper than you measured, and the intrathecal space deeper again.</p>`,
    }), 2),
    tier(callout('pearl', {
      title: 'If you can see the anterior complex, the window is open',
      body: `<p>The anterior complex is only visible if the beam has passed through the gap between the laminae and through the canal, so a needle can follow the same path. Seeing it has been linked with easier needle insertion.</p>`,
    }), 3),
    tier(callout('pearl', {
      title: 'Measured depth is a straight line; your needle path may be longer',
      body: '<p>The caliper measures the shortest distance from the skin to the posterior complex. If you angle the needle cephalad, as the scan often suggests, the path through the tissue is longer than the number on the screen. Press lightly with the probe: heavy pressure compresses the tissue and makes the measured depth even shallower.</p>',
    }), 3),
    tier(callout('pearl', {
      title: 'If the count is uncertain, cross-check it',
      body: '<p>Counting up from the sacrum assumes a normal sacrum. A transitional vertebra (lumbarisation or sacralisation) can shift the count by one level. If the count does not feel right, repeat it from a second landmark, such as counting down from the 12th rib, or ask for a second scan. Treat the marked level as accurate to about one space, and choose the lower of two possible spaces for a spinal.</p>',
    }), 3),
    tier(callout('pearl', {
      title: 'After a failed attempt, rescan rather than repeat',
      body: '<p>The marks are only valid for the position and angle in which you made them. If a pass fails or the patient has moved or been repositioned, put the probe back on, check the window and the midline again, and re-mark. Repeating the same attempt on the old marks is the commonest way to waste passes.</p>',
    }), 3),
  );

  // ------------------------------------------------------------ pre-procedure vs real time
  const realtime = el('div', { class: 'us-prose' });
  realtime.append(
    el('h3', { id: 'us-realtime', text: 'Pre-procedure scan or real-time guidance?' }),
    tier(el('p', { html: `Most of the evidence is for a <strong>pre-procedure</strong> scan: scan, mark the skin, put the probe down and insert the needle as usual.` }), 1),
    tier(el('p', { html: `<strong>Real-time</strong> guidance, with the needle in plane in the paramedian oblique view, is technically demanding. It needs good hand–eye coordination and usually an assistant or a spring-loaded loss-of-resistance syringe, and there are few outcome data. It is for very difficult backs and experienced hands.` }), 2),
    tier(el('p', { html: `Scanning takes practice. One estimate is 40 or more scans after learning the basic sonoanatomy. Scan easy backs and volunteers first, so the skill is there when you need it.` }), 2),
    tier(el('p', { html: 'Real-time techniques use the paramedian oblique view with the needle in plane, or a transverse view with the needle out of plane. The needle tip can be hard to see in deep tissue, so a loss-of-resistance or the feel of the flavum still confirms the space.' }), 3),
    tier(callout('pearl', {
      title: 'Neonates and infants',
      body: '<p>In babies the spine is largely cartilage, so ultrasound sees the canal, the thecal sac and the conus directly through the posterior elements. This makes ultrasound easier and more informative than in adults and helps to find the level of the conus.</p>',
    }), 3),
  );

  // ------------------------------------------------------------ scoliotic spine
  const scol = el('div', { class: 'us-prose' });
  scol.append(
    el('h3', { id: 'us-scol', text: 'Scanning the scoliotic spine' }),
    tier(callout('key', {
      title: 'Follow the rule in the scoliosis plan',
      body: '<p>Rotation turns the spinous processes towards the concave side and the canal towards the convex side, so the space is generally more open on the <strong>convex</strong> side (<a href="#sx-scoliosis">full rule</a>). Scan to find the <strong>most open window</strong>, and let the scan choose the side, the level and the angle. In the transverse view the picture is lopsided and the spinous tip no longer lies over the canal: mark the gap you can see, not the line of the spinous tips, and record the angle that gave the best view.</p>',
    }), 2),
    tier(callout('pearl', {
      title: 'In a rotated spine, trust the window, not the spinous tip',
      body: '<p>A skin mark placed over the spinous tip can sit off the gap. Use the transverse interlaminar view to place the insertion point over the canal itself, and expect the needle angle to be tilted from the usual one. If the first pass fails, the best space may be a level up or down.</p>',
    }), 3),
  );

  // ------------------------------------------------------------ who benefits + limitations
  const who = el('div', { class: 'us-prose' });
  who.append(
    el('h3', { id: 'us-who', text: 'Who benefits most' }),
    tier(el('ul', { class: 'us-bullets', html: `
      <li>Obesity, especially when you cannot feel the spinous processes.</li>
      <li>Scoliosis or previous lumbar spine surgery.</li>
      <li>Previous failed or difficult attempts.</li>
      <li>When the level matters, so that you stay below the end of the spinal cord.</li>` }), 1),
    tier(el('p', { html: `Palpation is often wrong about the level. Anaesthetists named a marked lumbar interspace correctly only 29% of the time, and the true level was usually higher than they thought. In a study checked with X-ray, ultrasound found the intended level more often than palpation (71% versus 30%).` }), 2),
    tier(callout('key', {
      title: 'What a pre-procedure scan cannot do',
      body: `<p>It does not show the needle tip. The marks shift if the patient moves. It reads depth slightly shallow. It takes time: in difficult backs the scan took about 6.7 minutes against 0.6 minutes for palpation, although the spinal itself was then quicker (5.0 versus 7.3 minutes).</p>`,
    }), 2),
  );

  // ------------------------------------------------------------ evidence
  const ev = el('div', { class: 'us-prose us-evidence' });
  ev.append(
    el('h3', { id: 'us-evidence', text: 'Evidence' }),
    tier(table({
      caption: 'Ultrasound before spinal or epidural: key studies',
      head: ['Study', 'Who', 'What it found'],
      rows: [
        [{ html: `Chin 2011, randomised trial`, th: true }, '120 orthopaedic patients with difficult landmarks: BMI over 35 with poorly palpable spines, moderate to severe scoliosis, or previous lumbar surgery', 'Spinal on the first attempt in <span class="sp-num">65%</span> with a pre-procedure scan versus <span class="sp-num">32%</span> with landmarks; median <span class="sp-num">1</span> versus <span class="sp-num">2</span> insertion attempts'],
        [{ html: `Shaikh 2013, meta-analysis`, th: true }, '14 randomised trials, 1334 patients having a lumbar puncture or an epidural catheter', 'Fewer failed procedures (risk ratio <span class="sp-num">0.21</span>, 95% CI <span class="sp-num">0.10–0.43</span>) and fewer traumatic procedures (risk ratio <span class="sp-num">0.27</span>, 95% CI <span class="sp-num">0.11–0.67</span>)'],
        [{ html: `Perlas 2016, systematic review`, th: true }, '31 clinical trials and 1 meta-analysis of adult spinal and epidural anaesthesia', 'Level identified more accurately than by palpation; depth agrees with needle depth (within about <span class="sp-num">3 mm</span> in most studies); higher success and easier insertion; probably fewer traumatic procedures; not enough evidence on other safety outcomes'],
        [{ html: `NICE 2008 (epidural catheters)`, th: true }, 'Interventional procedures guidance IPG249 on ultrasound-guided catheterisation of the epidural space', 'Evidence is limited but suggests the technique is safe and may help placement, particularly when landmarks are difficult. It may be used with normal clinical governance, consent and audit; loss of resistance stays as a safeguard'],
        [{ html: `Furness 2002`, th: true }, '50 patients, level checked on lateral X-ray', 'Correct level in up to <span class="sp-num">71%</span> with ultrasound versus <span class="sp-num">30%</span> with palpation'],
      ],
    }), 2),
    tier(el('p', { class: 'us-note', html: `The benefit is clearest when the landmarks are difficult: fewer attempts and a higher first-pass success. Shaikh’s pooled trials were of lumbar punctures and epidural catheters, not spinal anaesthesia, and the NICE guidance is for epidurals.` }), 2),
  );

  registerSearch([
    { title: 'Flying bat sign (transverse interlaminar view)', text: 'flying bat transverse processes wings articular processes ears', id: 'us-views' },
    { title: 'Horse head sign (paramedian sagittal oblique)', text: 'horse head PSO paramedian sagittal oblique', id: 'us-views' },
    { title: 'Sawtooth sign (paramedian sagittal lamina)', text: 'sawtooth saw tooth PSL laminae sacrum', id: 'us-views' },
    { title: 'Simulated scan viewer', text: 'simulated scan viewer caliper depth labels diagram B-mode', id: 'us-viewer' },
  ]);

  root.append(count, depth, setup, marking, realtime, scol, who, ev);

  return {
    reveal(hashId) {
      return viewer.reveal(hashId);
    },
  };
}
