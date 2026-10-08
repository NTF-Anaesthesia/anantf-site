(() => {
  'use strict';
  const form = document.querySelector('#fellowship-form');
  if (!form) return;
  const years = form.querySelector('#experience-years');
  const scale = form.querySelector('#experience-scale');
  const result = document.querySelector('#fellowship-result');
  function pathway(experience, interest, duration) {
    if (!(experience > 3) || !['ra', 'periop'].includes(interest)) return 'requirements';
    if (duration === 'longer') return 'longer';
    if (duration === 'both') return 'discuss';
    return 'fellowship';
  }
  scale.addEventListener('input', () => { years.value = scale.value; });
  years.addEventListener('input', () => { if (years.validity.valid && years.value !== '') scale.value = years.value; });
  form.addEventListener('input', () => { result.hidden = true; });
  form.addEventListener('change', () => { result.hidden = true; });
  form.addEventListener('reset', () => { result.hidden = true; result.replaceChildren(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const experience = Number(years.value);
    const interest = form.elements.interest.value;
    const duration = form.elements.duration.value;
    const route = pathway(experience, interest, duration);
    const content = {
      fellowship: ['Explore a clinical fellowship.', 'Your experience, primary training interest and one-year plans meet the criteria in this tool. If you have completed specialist training in anaesthesiology, we encourage you to contact us about applying.', 'Enquire about the fellowship'],
      longer: ['Explore a longer-term role.', 'Your experience and training interest align with this fellowship, but its fixed, non-extendable one-year duration does not match your plans. Contact us to discuss other clinical positions, such as resident physician roles, depending on current vacancies and your qualifications.', 'Discuss longer-term roles'],
      discuss: ['Let’s discuss both pathways.', 'Your experience and training interest align with the fellowship. Since you are open to either duration, a conversation will help us explore whether the one-year programme or another clinical role better suits your plans.', 'Discuss your options'],
      requirements: ['This fellowship does not match your answers yet.', '', 'Ask about your options']
    };
    const [title, description, action] = content[route];
    result.replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = title; heading.tabIndex = -1; result.append(heading);
    const paragraph = document.createElement('p');
    paragraph.textContent = description || [experience <= 3 ? 'The fellowship requires more than 3 years of clinical anaesthesia experience; exactly 3 years does not meet this threshold.' : '', !['ra','periop'].includes(interest) ? 'Its primary training focus is regional anaesthesia or perioperative medicine. Your selected interest does not meet that programme criterion.' : ''].filter(Boolean).join(' ');
    result.append(paragraph);
    if (route === 'requirements') {
      const note = document.createElement('p');
      note.textContent = duration === 'longer' || duration === 'both' ? 'If you are also considering a longer-term role, contact us to discuss whether other positions may suit your experience and interests. This tool does not assess eligibility for those roles.' : 'You are welcome to discuss your training goals and future options with us.';
      result.append(note);
    }
    const link = document.createElement('a');link.className = 'fit-button';link.href = 'mailto:contact@anantf.com?subject=Clinical%20Fellowship%20and%20career%20enquiry';link.textContent = action;result.append(link);
    result.hidden = false;heading.focus();
  });
})();
