// PDPH pathway data for the complications section. Rendered with troubleshooting/tree.js.
// Wording is original. Facts follow Uppal 2023 (multisociety PDPH consensus) and ICHD-3 7.2.1.

const D = (s) => `<span class="sp-dose">${s}</span>`;

export const PDPH_TREE = {
  id: 'cx-pdph-tree',
  start: 'n1',
  nodes: {
    n1: {
      prompt: 'Headache after a spinal. Are there any red flags?',
      short: 'Red flags?',
      detail: `<ul>
        <li>Focal neurological signs, seizures, confusion or drowsiness, or a change in vision.</li>
        <li>Fever, or neck stiffness with fever.</li>
        <li>A headache that has changed in character, or began more than 5 days after the puncture.</li>
        <li>Worsening despite an epidural blood patch.</li>
      </ul>`,
      refs: ['uppal2023'],
      choices: [
        { label: 'Yes, one or more red flags', to: 'xRed' },
        { label: 'No red flags', to: 'n2' },
      ],
    },
    n2: {
      prompt: 'Does it fit post-dural puncture headache?',
      short: 'Fits PDPH?',
      detail: '<p>Onset within 5 days of the dural puncture. Usually worse within minutes of sitting or standing and better lying flat, often with neck stiffness, tinnitus or muffled hearing. The postural feature is typical but is no longer required for the diagnosis.</p>',
      refs: ['cx-ichd3'],
      choices: [
        { label: 'Yes, it fits', to: 'n3' },
        { label: 'Not really: atypical pattern or timing', to: 'xAtypical' },
      ],
    },
    n3: {
      prompt: 'How bad is it?',
      short: 'Severity',
      detail: '<p>Ask what the patient can and cannot do. Look for hearing loss or double vision (a sixth nerve palsy).</p>',
      choices: [
        { label: 'Mild: coping with simple analgesia', to: 'xConservative' },
        { label: 'Limits daily activity despite conservative treatment', to: 'n4' },
        { label: 'Hearing loss, double vision or another cranial nerve sign', to: 'xCranial' },
      ],
    },
    n4: {
      prompt: 'Is there any reason an epidural blood patch would be unsafe or unwanted?',
      short: 'EBP safe?',
      detail: '<p>Fever or systemic infection; a coagulopathy or antithrombotic drug that the neuraxial timing rules forbid; the patient declines.</p>',
      refs: ['uppal2023'],
      choices: [
        { label: 'No: blood patch is reasonable', to: 'xEbp' },
        { label: 'Yes, or the patient declines', to: 'xNoEbp' },
      ],
    },
    xRed: {
      outcome: 'Treat this as something other than PDPH until proven otherwise.',
      tone: 'danger',
      body: `<ul>
        <li>Examine fully and call your senior now.</li>
        <li>Arrange urgent brain imaging; with fever, think of meningitis.</li>
        <li>Dural puncture is associated with subdural haematoma and cerebral venous sinus thrombosis. Worsening after a blood patch, or new focal signs, needs urgent imaging and specialist referral.</li>
      </ul>`,
      refs: ['uppal2023'],
    },
    xAtypical: {
      outcome: 'Think again before calling it PDPH.',
      tone: 'warn',
      body: `<ul>
        <li>A headache that is not postural, onset more than 5 days after puncture, or a headache that changes character calls for a senior review and consideration of brain imaging.</li>
        <li>Consider the other causes listed below the pathway, including caffeine withdrawal, migraine and sinusitis as well as the serious ones.</li>
      </ul>`,
      refs: ['uppal2023'],
    },
    xConservative: {
      outcome: 'Conservative care and follow-up.',
      tone: 'ok',
      body: `<ul>
        <li>Regular paracetamol and an NSAID unless contraindicated. Opioids only briefly, if these fail.</li>
        <li>Caffeine may be offered in the first 24 h of symptoms; no more than ${D('900 mg/day')} from all sources (less if breastfeeding).</li>
        <li>Drink normally. IV fluid only if the patient can’t drink. Lying flat helps symptoms but does not treat the cause.</li>
        <li>Explain, give written information and a contact number, and follow up until it resolves.</li>
      </ul>`,
      refs: ['uppal2023'],
    },
    xCranial: {
      outcome: 'Senior review today. Consider an early blood patch.',
      tone: 'warn',
      body: `<ul>
        <li>Cranial nerve palsy (most often the sixth nerve) and hearing loss are reasons to consider an epidural blood patch.</li>
        <li>New focal signs need imaging to exclude other causes first.</li>
      </ul>`,
      refs: ['uppal2023'],
    },
    xEbp: {
      outcome: 'Offer an epidural blood patch after counselling.',
      tone: 'ok',
      body: `<ul>
        <li>Consent: repeat dural puncture, backache and neurological complications. A patch within 48 h of the puncture is more likely to need repeating.</li>
        <li>Strict asepsis for both the blood draw and the epidural. Go in at the puncture level or one space below.</li>
        <li>Inject slowly, usually ${D('15–20 mL')} of the patient’s blood. Stop if back pain, headache or radicular pressure becomes significant.</li>
        <li>Follow up: complete relief is reported in 33–91% across studies, so some patients need a second patch.</li>
      </ul>`,
      refs: ['uppal2023'],
    },
    xNoEbp: {
      outcome: 'Continue conservative care and discuss alternatives with a senior.',
      tone: 'warn',
      body: `<ul>
        <li>Defer a patch if there is fever or systemic infection; apply the neuraxial antithrombotic rules if relevant.</li>
        <li>After a spinal with a fine (22G or smaller) needle, a greater occipital nerve block may be offered (weak recommendation); the headache may recur.</li>
        <li>Sphenopalatine ganglion block, theophylline, triptans, hydrocortisone and gabapentin are not routinely supported.</li>
      </ul>`,
      refs: ['uppal2023'],
    },
  },
};
