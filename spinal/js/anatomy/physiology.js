// spinal/ — anatomy chapter: CSF facts, autonomic anatomy, physiology of the block, factors that decide spread.
import { el, tier, callout, table, details } from '../ui.js?v=1';

const P = (html, cls = 'sp-prose') => el('p', { class: cls, html });
const num = (s) => `<span class="sp-num">${s}</span>`;
const th = (h) => ({ html: h, th: true });

/** CSF facts table (before the baricity figure). */
export function buildCsfFacts() {
  const w = el('div', { id: 'an-csf-facts' });
  w.append(
    tier(table({
      caption: 'Cerebrospinal fluid: exam facts',
      head: ['Property', 'Adult value', 'Why it matters'],
      rows: [
        [th('Total volume'), `About ${num('150 mL')}, about ${num('125 mL')} of it in the subarachnoid spaces`, 'The rest is in the ventricles'],
        [th('Lumbosacral volume'), `${num('28–81 mL')} in 25 volunteers; less with obesity and abdominal compression`, 'The main patient factor in how high a spinal goes'],
        [th('Production'), `Mainly choroid plexus, about ${num('400–600 mL')} a day, so the whole volume turns over several times a day`, 'Lost CSF (a dural hole) is replaced, but slowly'],
        [th('Pressure'), `About ${num('10–15 cmH₂O')} lying on the side; much higher sitting up (hydrostatic) and with coughing or straining`, 'CSF runs faster when the patient sits up. Raised pressure is one reason for caution (see Technique)'],
        [th('Density'), `About ${num('1.0003 g/mL')} at ${num('37 °C')}; lower in pregnancy`, 'Sets the baricity of every injected solution'],
        [th('pH and composition'), 'pH about 7.3, protein about 0.15–0.45 g/L, glucose about 60% of plasma, almost no cells', 'A drug in CSF is poorly buffered and binds almost no protein, so a small dose is enough'],
      ],
    }), 2),
  );
  return w;
}

/** Autonomic anatomy + physiology of the block. */
export function buildPhysiology() {
  const s = el('div', { class: 'an-sub', id: 'an-physiology' });
  s.append(el('h3', { text: 'What the block does to the body' }));
  s.append(
    tier(callout('key', { title: 'Answer first', body: '<p>Most of the effects of a spinal come from <strong>sympathetic block (T1–L2)</strong> with the vagus left unopposed. Veins relax, blood pressure falls, the heart slows, the gut contracts and the legs lose heat. Breathing is usually little changed, because the diaphragm (C3–C5) is spared. The higher the block, the bigger every effect. Management of hypotension is in <a href="#ts-hypotension">Troubleshooting</a>.</p>' }), 1),
    tier(table({
      caption: 'Autonomic outflow and what a block removes',
      head: ['Outflow', 'Levels', 'Effect when blocked'],
      rows: [
        [th('Sympathetic, general'), 'T1–L2 (thoracolumbar)', 'Vasodilatation, mainly venous'],
        [th('Cardioaccelerator fibres'), 'T1–T4', 'Loss of sympathetic drive to heart rate and contractility'],
        [th('Splanchnic nerves'), 'T5–L1', 'Gut and liver vessels dilate. The vagus is unopposed'],
        [th('Adrenal medulla'), 'T6–L1', 'Less adrenaline released when pressure falls'],
        [th('Lower limb sympathetic'), 'T10–L2', 'Leg vessels dilate, heat is lost'],
        [th('Vagus (cranial parasympathetic)'), 'X, not blocked', 'Unopposed tone: bradycardia, active gut'],
        [th('Sacral parasympathetic'), 'S2–S4', 'Detrusor weakness (urinary retention), loss of bowel and sexual function until the block wears off'],
      ],
    }), 2),
    tier(table({
      caption: 'Physiological effects by system',
      head: ['System', 'Effect', 'Mechanism and practical point'],
      rows: [
        [th('Cardiovascular'), 'Fall in blood pressure; heart rate usually falls', 'Venodilatation lowers preload. Arteriolar dilatation lowers afterload a little. See the next block'],
        [th('Respiratory'), 'Tidal volume, minute ventilation, PaO₂ and PaCO₂ preserved at rest. Expiratory reserve volume, peak expiratory flow and cough strength fall. Vital capacity falls slightly', 'The diaphragm (phrenic C3–C5) is spared; intercostal (T1–T12) and abdominal wall muscles (T7–L1) are weak. COPD patients who rely on accessory and expiratory muscles may feel breathless and cannot clear sputum. Unopposed vagal tone can narrow the airways in severe asthma'],
        [th('Gastrointestinal'), 'Contracted, active gut with relaxed sphincters; nausea and vomiting are common', 'Splanchnic block with intact vagus. Good surgical conditions in the bowel. Nausea is mostly from hypotension and vagal activity; treat the pressure first. Liver blood flow falls with mean pressure'],
        [th('Renal and bladder'), 'Renal blood flow and filtration are kept up while mean pressure is within the autoregulation range. Bladder emptying is lost', 'Sacral parasympathetic block weakens the detrusor, so the bladder fills without the urge. Retention can outlast the leg block'],
        [th('Temperature'), 'Heat is lost from the vasodilated skin and core heat moves out to the periphery', 'The thermoregulatory threshold for vasoconstriction and shivering falls and the blocked legs cannot vasoconstrict. The patient feels warm because cold sensation is blocked, even while core temperature is falling. Shivering follows'],
        [th('Neuroendocrine'), 'The stress response to surgery is blunted below the block', 'Afferent pain input is blocked, so cortisol, catecholamine and glucose responses fall for lower body surgery. Adrenal medulla block (T6–L1) also reduces adrenaline release'],
        [th('Blood clotting'), 'The hypercoagulable response to surgery is reduced', 'More leg blood flow and a smaller stress response. Older trials found fewer leg clots after hip and knee surgery; benefit is less clear with modern thromboprophylaxis'],
        [th('Brain'), 'Sedative needs fall', 'Loss of afferent input reduces arousal. Cerebral blood flow stays normal while mean pressure is within the autoregulation range'],
      ],
    }), 2),
    tier(el('div', { id: 'an-cvs' },
      el('h4', { text: 'Cardiovascular effects in detail' }),
      P('<strong>Why pressure falls.</strong> About 70% of blood volume lies in the veins, which have little intrinsic tone and depend on sympathetic drive. Blocking it raises the unstressed volume and pools blood in the splanchnic bed and legs, so venous return and preload fall. Arterioles keep much of their own tone, so systemic vascular resistance falls less than you might expect. Cardiac output falls a little with a low block and more with a high block. Upper-body vessels above the block constrict to compensate. Pressure falls more in the elderly, the hypovolaemic, patients on vasodilators or ACE inhibitors, and with raised intra-abdominal pressure.'),
      P('<strong>Why the heart slows.</strong> Four mechanisms add together:'),
      el('ol', { html: [
        '<li>Block of the <strong>cardioaccelerator fibres (T1–T4)</strong> when the block is high.</li>',
        '<li><strong>Less venous return</strong> reduces stretch of the right atrium and sinoatrial node, which slows the heart (loss of the Bainbridge effect).</li>',
        '<li><strong>Unopposed vagal tone</strong>, because the vagus is not blocked.</li>',
        '<li>The <strong>Bezold–Jarisch reflex</strong> (below).</li>',
      ].join('') })), 2),
    tier(details({
      id: 'an-bezold',
      summary: 'Bezold–Jarisch reflex and the elderly',
      body: [
        P('The reflex has ventricular mechanoreceptors and chemoreceptors with unmyelinated vagal C-fibre afferents. A fall in venous return leaves a small ventricle that still contracts hard, and this is read as strong stretch. The signal goes to the brainstem (nucleus tractus solitarius) and produces <strong>bradycardia, vasodilatation and hypotension</strong>: a vagal surge with withdrawal of sympathetic tone. Serotonin acting at 5-HT₃ receptors takes part, which is why 5-HT₃ antagonists such as ondansetron can reduce hypotension and bradycardia in some studies.'),
        P('The baroreceptor reflex normally corrects a fall in pressure by speeding the heart and constricting vessels. It is weaker with age, diabetes and beta-blockade, so older patients may slow suddenly and severely, sometimes to asystole, with little warning.'),
        P('In coronary disease, a fall in diastolic pressure lowers coronary perfusion pressure, while lower preload and afterload cut myocardial work. The balance decides whether the heart is helped or harmed, so keep the pressure near baseline and avoid tachycardia and bradycardia.'),
      ],
    }), 3),
    tier(callout('pearl', { title: 'Sympathetic level is not the sensory level', body: '<p>The sympathetic block usually extends at least two segments above the level you test, and by an unpredictable amount in the individual. A block to T4 also reaches the cardioaccelerator fibres, so bradycardia can appear with little warning. Watch pressure and heart rate; do not predict them from the sensory level alone.</p>' }), 2),
    tier(details({
      id: 'an-physiology-special',
      summary: 'Physiology in pregnancy and in children (brief)',
      body: [
        P('<strong>Pregnancy.</strong> Engorged epidural veins and the gravid uterus squeeze the dural sac and reduce lumbosacral CSF, so a given dose spreads higher and the dose needed falls. CSF density is lower, so the same solution is relatively more hyperbaric. The uterus compresses the vena cava and aorta supine, so the venous return is already reduced and the drop in pressure after a spinal is larger. Left tilt keeps it off the cava.'),
        P('<strong>Infants and children.</strong> More CSF per kilogram means a larger dose per kilogram and a shorter block. Heart rate and pressure change little after a spinal in young children (the mechanism is debated). An ex-premature baby remains at risk of apnoea after any anaesthetic, including a spinal.'),
      ],
    }), 3),
  );
  return s;
}

/** Factors affecting spread. */
export function buildSpread() {
  const w = el('div', { id: 'an-spread' });
  w.append(
    tier(el('h4', { text: 'What decides how high the block goes' }), 1),
    tier(callout('key', { title: 'Answer first', body: '<p>With a hyperbaric solution the main things you control are the <strong>dose</strong>, the <strong>patient’s position</strong> during and just after the injection, and the <strong>baricity</strong>. The main thing you cannot control is the <strong>volume of CSF in the lumbosacral sac</strong>. Almost everything else (speed, barbotage, needle, volume at a fixed dose) has a small or inconsistent effect.</p>' }), 1),
    tier(table({
      caption: 'Factors affecting spread, in rough order of importance',
      head: ['Factor', 'Effect', 'Can you change it?'],
      rows: [
        [th('Baricity'), 'Hyperbaric sinks with gravity and goes to the lowest point. Isobaric stays near the site. Hypobaric rises', 'Yes: choose the solution'],
        [th('Position during and after injection'), 'Sitting keeps a hyperbaric block low (saddle). Lateral favours the dependent side. Supine lets the drug run to the thoracic trough (T5–T6) and fixes the level in a few minutes', 'Yes'],
        [th('Dose (mass of drug)'), 'More drug gives a higher and longer block. This is the most consistent drug factor', 'Yes'],
        [th('Lumbosacral CSF volume'), 'Less CSF means less dilution and a higher block. Falls with obesity, pregnancy, ascites and anything raising abdominal pressure', 'No'],
        [th('Age and body size'), 'Older patients tend to have a higher, longer block from the same dose. Height has a small effect. Obesity gives a higher block', 'No'],
        [th('Spinal curvature'), 'Kyphosis or scoliosis moves the lowest point of the canal, and the drug pools in the new low point', 'Partly: tilt the table'],
        [th('Interspace used'), 'A higher space gives a higher block, a small effect with hyperbaric solution', 'Yes'],
        [th('Volume and concentration (fixed dose)'), 'Small effect once the dose is fixed', 'Yes'],
        [th('Speed of injection, barbotage'), 'Slower injection is more predictable. Faster injection or barbotage may spread further. Effects are small and inconsistent', 'Yes'],
        [th('Needle direction and side hole'), 'Pencil-point side hole facing the head may push a little drug upward. Small effect', 'Yes'],
      ],
    }), 2),
    tier(callout('pearl', { title: 'Why the same dose gives different blocks', body: '<p>In volunteers, CSF volume in the lumbosacral sac explained more of the variation in peak block height and duration than any other single factor. This is why patients who look similar can behave differently. Add pregnancy (lower CSF density, engorged epidural veins), age, and a pooling point that differs from the textbook, and a fixed dose has no fixed result. The practical answer is to inject slowly, watch the level, and keep the position until it settles.</p>' }), 2),
  );
  return w;
}
