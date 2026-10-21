// Email through Resend (resend.com): the sign-in code, and each marked script with its model answer.
// Secrets: RESEND_API_KEY; COPY_TO (faculty copy of every marked script). Var: EMAIL_FROM.

export async function sendEmail(env, { to, bcc, subject, html, text }) {
  if (!env.RESEND_API_KEY) { console.log('email (not sent: no RESEND_API_KEY):', subject, to); return false; }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || 'SAQ Programme <saq@anantf.com>', to: [to], ...(bcc?.length ? { bcc } : {}), subject, html, text }),
  });
  if (!r.ok) console.error('email failed', r.status, await r.text().catch(() => ''));
  return r.ok;
}

const APP = 'https://anantf.com/exams/part-b/';
const BANDS = { 8: 'Excellent', 7: 'Better than pass', 6: 'Pass', 5: 'Borderline fail', 4: 'Poor', 3: 'Fail' };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const wrap = body => `<!doctype html><html><body style="margin:0;background:#f5f0e7;color:#272c28;font:16px/1.55 Georgia,serif"><div style="max-width:640px;margin:0 auto;padding:24px 18px">${body}<p style="font:13px/1.5 Arial,sans-serif;color:#696a5f;border-top:1px solid #d8d3c7;padding-top:12px;margin-top:28px">SAQ Programme · NTF Anaesthesia · <a href="${APP}" style="color:#a34827">${APP.replace('https://', '')}</a><br>AI practice feedback, not an exam result.</p></div></body></html>`;

export function codeEmail(code) {
  return {
    subject: `${code} is your SAQ Programme sign-in code`,
    text: `Your sign-in code is ${code}. It works for 15 minutes.\n\nIf you didn't ask for it, ignore this email.\n\n${APP}`,
    html: wrap(`<p style="font:14px Arial,sans-serif;color:#696a5f;margin:0 0 8px">SAQ Programme</p><p>Your sign-in code:</p><p style="font:600 34px/1 'Courier New',monospace;letter-spacing:6px;margin:8px 0 18px">${esc(code)}</p><p style="font:14px Arial,sans-serif">It works for 15 minutes. If you didn't ask for it, ignore this email.</p>`),
  };
}

// a light Markdown to HTML, enough for annotated answers and model answers
function md(src) {
  const inline = s => esc(s).replace(/\[\*(.+?)\*\]/g, '<span style="color:#a34827;font-style:italic">[$1]</span>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  let html = '', list = false;
  for (const line of String(src || '').split('\n')) {
    const b = line.match(/^\s*(?:[-*•■§]|\d+[.)])\s+(.*)/), h = line.match(/^#{1,4}\s+(.*)/);
    if (b) { if (!list) { html += '<ul style="padding-left:20px;margin:6px 0">'; list = true; } html += `<li>${inline(b[1])}</li>`; continue; }
    if (list) { html += '</ul>'; list = false; }
    if (h) html += `<p style="font:600 15px Arial,sans-serif;margin:14px 0 4px">${inline(h[1])}</p>`; else if (line.trim()) html += `<p style="margin:5px 0">${inline(line)}</p>`;
  }
  return html + (list ? '</ul>' : '');
}

const SOURCE = { bank: "Model answer from the department's SAQ bank", drafted: 'Model answer (reviewed by faculty)', ai: 'Model answer (drafted by AI, not yet reviewed by faculty)' };

export function scriptEmail({ name, label, attempt, key, keySource }) {
  const m = attempt.marking;
  const mins = Math.round((attempt.seconds || 0) / 60);
  const source = SOURCE[keySource] || SOURCE.bank;
  const subject = `SAQ marked: ${m.adjusted} (${BANDS[m.adjusted]}) · ${label}`;
  const box = 'background:#fffcf5;border:1px solid #d8d3c7;padding:14px 16px;margin:14px 0';
  const html = wrap(`
    <p style="font:14px Arial,sans-serif;color:#696a5f;margin:0 0 6px">${esc(name)} · ${esc(label)} · ${mins} min</p>
    <div style="background:#ede7dc;border-left:3px solid #a34827;padding:12px 14px;white-space:pre-line">${esc(attempt.question)}</div>
    <div style="${box}">
      <p style="margin:0"><span style="font-size:40px;color:#a34827">${m.adjusted}</span> <span style="font:14px Arial,sans-serif;color:#696a5f">adjusted · raw ${m.raw} · ${BANDS[m.adjusted]}</span></p>
      <p style="font-size:17px">${esc(m.summary)}</p>
      ${(m.top_fixes || []).length ? `<p style="font:600 13px Arial,sans-serif;margin:10px 0 4px">To score higher</p><ol style="margin:0;padding-left:20px">${m.top_fixes.map(f => `<li>${esc(f)}</li>`).join('')}</ol>` : ''}
    </div>
    <p style="font:600 13px Arial,sans-serif;margin:20px 0 4px">Your answer, annotated</p>
    <div style="${box};font:15px/1.5 Arial,sans-serif">${md(m.annotated)}</div>
    ${key ? `<p style="font:600 13px Arial,sans-serif;margin:20px 0 4px">${esc(source)}</p><div style="${box};font:15px/1.5 Arial,sans-serif">${keySource === 'bank' ? `<div style="white-space:pre-wrap;font:13px/1.45 'Courier New',monospace">${esc(key)}</div>` : md(key)}</div>` : ''}
    <p><a href="${APP}#/a/${esc(attempt.id)}" style="color:#a34827">Open it in the programme</a></p>`);
  const text = `${label}\n\n${attempt.question}\n\nScore: ${m.adjusted} adjusted (raw ${m.raw}), ${BANDS[m.adjusted]}\n${m.summary}\n\n${(m.top_fixes || []).map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nYour answer, annotated:\n${m.annotated}\n\n${key ? `${source}:\n${key}\n\n` : ''}${APP}#/a/${attempt.id}`;
  return { subject, html, text };
}
