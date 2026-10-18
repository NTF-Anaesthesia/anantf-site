#!/usr/bin/env node
// Regional anaesthesia app: MO / Resident / Consultant level system (plan §5, §11.3).
//
//   node shared/regional/test/levels.mjs        options: --pages=truncal/back/,spinal/   --workers=4   --json=<file>   --failsOnly
//
// Checks:
//   1. every level page mounts one MO · Res · Con control (3 buttons ≥ 44 px, aria-label, exactly one pressed) at 390 and
//      1440; every data-tier value is 1, 2 or 3;
//   2. at each level, body[data-level]/[data-tier-max] are right and every [data-tier] above the max is hidden;
//      Consultant hides nothing;
//   3. hidden-count hints at MO: the number in each "n items hidden" line equals the hidden tagged items in its chapter,
//      every chapter with hidden items has a hint, and "Show all" shows everything for this view only;
//   4. SAFETY: at MO, every block with a dose shows its dose box and LAST line, and every block with complications shows
//      all of them (nothing inside is tiered above 1); the scan viewer is MO; every block shows its "If it goes wrong"
//      section with at least the core decision guides (LAST, pain on injection, vascular puncture, failed block, nerve
//      injury), nothing in it above tier 1, and its LAST guide opens and steps forward;
//   5. the level persists across reload and across apps (truncal ↔ spinal ↔ brachial-plexus ↔ plexus), and never goes in
//      the URL;
//   6. spinal's old spinal-level / spinal-tier keys migrate once;
//   7. a deep link (and a search result) to tier-2/3 content relaxes the level for that view without saving it, with a
//      "Back to …" button that restores it;
//   8. spinal "Pearls only" appears only at Consultant and shows the digest;
//   9. the first-visit picker shows once, and a choice in it sets and saves the level.

import {
  args, BASE, ENGINE_PAGES, LEVEL_PAGES, FORCE_CSS, listArg, launch, openContext, waitReady, pool, reporter,
} from './lib.mjs';

const ONLY = listArg('pages', null);
const PAGES = LEVEL_PAGES.filter((p) => !ONLY || ONLY.includes(p));
const ENGINE = ENGINE_PAGES.filter((p) => PAGES.includes(p));
const R = reporter('Levels');
const W = Number(args.workers || 4);
const TIER = { mo: 1, resident: 2, consultant: 3 };

async function load(browser, url, opts = {}) {
  const o = await openContext(browser, { vp: opts.vp || '390', level: opts.level || null, storage: opts.storage || null });
  await o.page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await waitReady(o.page, { idle: opts.idle ?? false });
  // spinal tags its content after it builds (body[data-sp-ready]); checking earlier finds nothing tagged
  await o.page.waitForFunction(() => !document.body.classList.contains('spinal-app') || document.body.dataset.spReady === 'true', null, { timeout: 15000 }).catch(() => {});
  await o.page.waitForTimeout(300);
  return o;
}
// "Back to MO" after a relax: the bar button (wide screens and some apps) or, on phones, the chapter's in-flow hint line
// ("Showing Consultant content for this view · Back to MO"), which never covers text.
const BACK_SEL = '.ra-level-back:visible, .ra-hidden-hint.is-relaxed:not([hidden]) button:visible';
const errorsOf = (log) => [...new Set([...log.pageErrors, ...log.console])];
const ls = (page, k = 'ra-level') => page.evaluate((k) => { try { return localStorage.getItem(k); } catch { return 'blocked'; } }, k);
const bodyLevel = (page) => page.evaluate(() => ({ level: document.body.dataset.level || null, max: document.body.dataset.tierMax || null, relaxed: document.body.dataset.levelRelaxed === 'true', pearls: document.body.dataset.pearlsOnly === 'true' }));

// ------------------------------------------------------------------ 1. control
async function controlCheck(browser, p, vp) {
  const { ctx, page, log } = await load(browser, p, { vp, level: 'resident' });
  try {
    const c = await page.evaluate(() => {
      const ctls = [...document.querySelectorAll('.ra-level')].filter((n) => n.getClientRects().length);
      const btns = ctls[0] ? [...ctls[0].querySelectorAll('.ra-level-btn')] : [];
      const bad = btns.map((b) => { const r = b.getBoundingClientRect(); return { id: b.dataset.level, w: r.width, h: r.height, label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed') }; });
      const tiers = [...new Set([...document.querySelectorAll('[data-tier]')].map((n) => n.getAttribute('data-tier')))];
      const r = ctls[0]?.getBoundingClientRect();
      return { n: ctls.length, btns: bad, tiers, inView: r ? r.top >= -1 && r.bottom <= innerHeight && r.right <= innerWidth + 1 : false };
    });
    const why = [];
    if (c.n !== 1) why.push(`${c.n} visible level controls`);
    if (c.btns.length !== 3) why.push(`${c.btns.length} level buttons`);
    for (const b of c.btns) {
      if (b.w < 43.5 || b.h < 43.5) why.push(`${b.id} button ${Math.round(b.w)}×${Math.round(b.h)} px`);
      if (!b.label) why.push(`${b.id} button has no aria-label`);
    }
    const pressed = c.btns.filter((b) => b.pressed === 'true').map((b) => b.id);
    if (pressed.join() !== 'resident') why.push(`pressed: [${pressed}] (want resident)`);
    if (c.n && !c.inView) why.push('control is not fully on screen on load');
    const badTier = c.tiers.filter((t) => !['1', '2', '3'].includes(t));
    if (badTier.length) why.push(`data-tier values outside 1–3: ${badTier.join(', ')}`);
    if (errorsOf(log).length) why.push(`errors: ${errorsOf(log).slice(0, 2).join(' | ')}`);
    return { ok: !why.length, why: why.join('; ') };
  } finally { await ctx.close(); }
}

// ------------------------------------------------------------------ 2–4. hiding, hints, safety
/** Plexus tags its notes only once a block or element is selected: test it with a selection. */
const LEVEL_URL = { 'plexus/': 'plexus/#plexus=lumbar&block=peng' };
async function hidingCheck(browser, p, level) {
  const { ctx, page, log } = await load(browser, LEVEL_URL[p] || p, { level });
  try {
    await page.addStyleTag({ content: FORCE_CSS });
    const s = await page.evaluate((max) => {
      const shown = (n) => getComputedStyle(n).display !== 'none';
      const tagged = [...document.querySelectorAll('[data-tier]')];
      const leak = tagged.filter((n) => Number(n.dataset.tier) > max && shown(n)).map((n) => `${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : `.${String(n.className).split(' ')[0]}`}[${n.dataset.tier}]`);
      const over = tagged.filter((n) => Number(n.dataset.tier) <= max && !shown(n) && !n.closest('[hidden]') && !n.parentElement.closest('[data-tier]:not([data-tier="1"])')).length;
      return { leak: leak.slice(0, 6), leakN: leak.length, tagged: tagged.length, hiddenLow: over };
    }, TIER[level]);
    const b = await bodyLevel(page);
    const why = [];
    if (b.level !== level) why.push(`body[data-level]=${b.level}`);
    if (b.max !== String(TIER[level])) why.push(`body[data-tier-max]=${b.max}`);
    if (s.leakN) why.push(`${s.leakN} item(s) above tier ${TIER[level]} still shown: ${s.leak.join(', ')}`);
    if (level === 'consultant' && s.hiddenLow) why.push(`${s.hiddenLow} tagged item(s) hidden at Consultant`);
    if (errorsOf(log).length) why.push(`errors: ${errorsOf(log).slice(0, 2).join(' | ')}`);
    return { ok: !why.length, why: why.join('; '), tagged: s.tagged };
  } finally { await ctx.close(); }
}

async function hintsCheck(browser, p) {
  const { ctx, page } = await load(browser, p, { level: 'mo' });
  try {
    await page.addStyleTag({ content: FORCE_CSS });
    await page.waitForTimeout(200);
    const s = await page.evaluate(() => {
      const CH = '[role=tabpanel], .tb-chapter, .sp-chapter, #sec-tabs, #sec-info, main section[id]';
      const count = (root) => {
        let n = 0;
        root.querySelectorAll('[data-tier]').forEach((e) => {
          if (Number(e.dataset.tier) <= 1) return;
          const par = e.parentElement?.closest('[data-tier]');
          if (par && root.contains(par) && Number(par.dataset.tier) > 1) return;
          n++;
        });
        return n;
      };
      const hints = [...document.querySelectorAll('.ra-hidden-hint')];
      const res = [];
      for (const h of hints) {
        // a chapter's hint counts its whole chapter (spinal puts it under the chapter's first section heading)
        const root = h.closest('.tb-chapter, .sp-chapter') || h.closest(CH) || document.body;
        const m = (h.textContent || '').match(/(\d+)\s+items?\s+hidden/);
        res.push({ root: root.id || root.className, said: h.hidden ? 0 : (m ? Number(m[1]) : null), real: count(root), hidden: h.hidden });
      }
      const chapters = [...document.querySelectorAll('.tb-chapter[id], .sp-chapter[id]')].filter((c) => !Number(c.dataset.tier > 1));
      const lacking = chapters.filter((c) => count(c) > 0 && !c.querySelector('.ra-hidden-hint') && !(Number(c.dataset.tier) > 1)).map((c) => `${c.id} (${count(c)})`);
      // The hub lists chapters (tagged with their tier); a hint there is nice to have, not required.
      return { res, missing: lacking.filter((x) => !/^ch-home /.test(x)), hub: lacking.filter((x) => /^ch-home /.test(x)) };
    });
    const why = [];
    for (const h of s.res) if (h.said !== h.real) why.push(`hint in ${h.root} says ${h.said}, ${h.real} hidden`);
    if (s.missing.length) why.push(`chapters with hidden items but no hint: ${s.missing.join(', ')}`);
    // "Show all" raises the level for this view only.
    const btn = page.locator('.ra-hidden-hint:not([hidden]) button').first();
    if (await btn.count()) {
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click();
      await page.waitForTimeout(250);
      const b = await bodyLevel(page);
      if (b.level !== 'consultant') why.push(`"Show all" left the level at ${b.level}`);
      if (!b.relaxed) why.push('"Show all" did not mark the view as relaxed');
      if (await ls(page) !== 'mo') why.push(`"Show all" changed the saved level to ${await ls(page)}`);
      const back = await page.evaluate(() => { const b = [...document.querySelectorAll('.ra-level-back, .ra-hidden-hint.is-relaxed button')].find((x) => x.getClientRects().length); return b ? b.textContent.trim() : null; });
      if (!/MO/.test(back || '')) why.push(`no visible "Back to MO" button after Show all (got ${JSON.stringify(back)})`);
    } else if (s.res.some((h) => h.said > 0) || s.missing.length) why.push('no visible "Show all" button at MO');
    return { ok: !why.length, why: why.join('; '), n: s.res.length, hub: s.hub };
  } finally { await ctx.close(); }
}

async function safetyCheck(browser, p) {
  const { ctx, page, log } = await load(browser, p, { level: 'mo' });
  try {
    await page.addStyleTag({ content: FORCE_CSS });
    const s = await page.evaluate(async (p) => {
      let BLOCKS;
      try { ({ BLOCKS } = await import(`/${p}js/blocks.js`)); } catch (e) { return { err: `cannot import /${p}js/blocks.js: ${e.message}` }; }
      const seen = (n) => !!n && n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden';
      const tierUp = (n) => { let t = 1; for (let x = n; x && x.nodeType === 1; x = x.parentElement) { const v = Number(x.getAttribute('data-tier')); if (v > t) t = v; } return t; };
      const out = [];
      let checked = 0;
      for (const b of BLOCKS || []) {
        if (!b?.id) continue;
        const ch = document.getElementById(`${b.id}-h`)?.closest('.tb-chapter');
        if (b.dose) {
          checked++;
          const box = document.getElementById(`${b.id}-dose-box`);
          const last = box?.querySelector('.tb-dose-last');
          if (!box) out.push(`${b.id}: dose box not rendered`);
          // The tier of the box and everything around it (its section, its chapter), whatever the CSS says.
          else if (tierUp(box) > 1) out.push(`${b.id}: dose box sits inside tier-${tierUp(box)} content${ch?.dataset.tier ? ` (chapter ${ch.id} is tier ${ch.dataset.tier})` : ''}`);
          else if (!seen(box)) out.push(`${b.id}: dose box hidden at MO (tier ${tierUp(box)}${ch?.dataset.tier ? `, chapter ${ch.id} is tier ${ch.dataset.tier}` : ''})`);
          if (box && (!last || !seen(last))) out.push(`${b.id}: LAST line missing or hidden at MO`);
          const inner = box ? [...box.querySelectorAll('[data-tier]')].filter((n) => Number(n.dataset.tier) > 1) : [];
          if (inner.length) out.push(`${b.id}: ${inner.length} item(s) inside the dose box tagged above MO`);
        }
        if (b.complications) {
          checked++;
          const sec = document.getElementById(`${b.id}-complications`);
          if (!sec) out.push(`${b.id}: complications not rendered`);
          else if (tierUp(sec) > 1) out.push(`${b.id}: complications sit inside tier-${tierUp(sec)} content`);
          else if (!seen(sec)) out.push(`${b.id}: complications hidden at MO (tier ${tierUp(sec)})`);
          else {
            const hid = [...sec.querySelectorAll('*')].filter((n) => n.textContent.trim() && getComputedStyle(n).display === 'none' && !n.closest('details:not([open]) > :not(summary)'));
            if (hid.length) out.push(`${b.id}: ${hid.length} complication item(s) hidden at MO`);
          }
        }
        if (b.wrong !== false) {
          checked++;
          const sec = document.getElementById(`${b.id}-wrong`);
          const CORE = ['last', 'pain', 'vessel', 'failed', 'nerve'];
          if (!sec) out.push(`${b.id}: "If it goes wrong" section not rendered`);
          else if (tierUp(sec) > 1) out.push(`${b.id}: "If it goes wrong" sits inside tier-${tierUp(sec)} content`);
          else if (!seen(sec)) out.push(`${b.id}: "If it goes wrong" hidden at MO`);
          else {
            const have = [...sec.querySelectorAll('details.ra-dg-item')].map((d) => d.dataset.guide);
            const miss = CORE.filter((g) => !have.includes(g));
            if (miss.length) out.push(`${b.id}: "If it goes wrong" lacks ${miss.join(', ')}`);
            const up = [...sec.querySelectorAll('[data-tier]')].filter((n) => Number(n.dataset.tier) > 1);
            if (up.length) out.push(`${b.id}: ${up.length} item(s) in "If it goes wrong" tagged above MO`);
            const d = sec.querySelector('details.ra-dg-item[data-guide="last"]');
            if (d) {
              d.open = true;
              await new Promise((r) => setTimeout(r, 30));
              const next = d.querySelector('.ra-dg-next');
              const before = d.querySelector('.ra-dg')?.dataset.step;
              next?.click();
              const after = d.querySelector('.ra-dg')?.dataset.step;
              if (!next || !before || before === after) out.push(`${b.id}: the LAST guide did not open or step forward`);
              else if (!seen(d.querySelector('.ra-dg-step'))) out.push(`${b.id}: the LAST guide step is hidden at MO`);
              d.querySelector('.ra-dg-again')?.click();
              d.open = false;
            }
          }
        }
        if (b.scene) {
          const wrap = document.getElementById(`${b.id}-scan`)?.closest('.tb-scan-wrap') || document.getElementById(`${b.id}-scan`);
          if (wrap && !seen(wrap)) out.push(`${b.id}: scan viewer hidden at MO (tier ${tierUp(wrap)})`);
        }
      }
      // Dose strings in tiered free-form content (chapters and sections not built from BLOCKS). Plan §5 puts these
      // section types above MO on purpose: exam, related blocks, landmark alternatives, consultant, frontier,
      // catheters, nerve stimulation, approach comparisons, deep V2/V3, and the engine's tier-2 section keys (target and
      // deposition, coverage, sonoanatomy). Anything else is listed for review.
      const DOSE = /\d+(?:\.\d+)?\s*(?:mg\/kg|mL|ml|mg|%)/;
      // (plus the engine's default tier-2 section keys: target, coverage, sonoanatomy)
      const PLANNED = /exam|related|landmark|consultant|frontier|catheter|approach|alt|nerve-?stim|deep|-(target|coverage|sonoanatomy)$/i;
      const free = [];
      document.querySelectorAll('[data-tier="2"],[data-tier="3"]').forEach((n) => {
        if (n.parentElement?.closest('[data-tier="2"],[data-tier="3"]')) return; // the top-most tagged node only
        const where = [n.id, n.closest('section[id]')?.id, n.closest('.tb-chapter')?.id].filter(Boolean);
        if (where.some((id) => PLANNED.test(id))) return;
        const m = (n.textContent || '').match(DOSE);
        if (m) free.push(`${where[0] || n.tagName.toLowerCase()} [tier ${n.dataset.tier}]: "${m[0]}" in "${n.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)}…"`);
      });
      return { out, checked, blocks: (BLOCKS || []).length, free };
    }, p);
    if (s.err) return { ok: false, why: s.err };
    const why = [...s.out];
    if (!s.checked) why.push('no block with a dose or complications found');
    if (errorsOf(log).length) why.push(`errors: ${errorsOf(log).slice(0, 2).join(' | ')}`);
    return { ok: !why.length, why: why.join('\n'), checked: s.checked, blocks: s.blocks, free: s.free };
  } finally { await ctx.close(); }
}

// ------------------------------------------------------------------ 7. relax by deep link / search
async function relaxCheck(browser, p) {
  // Find tier-2 and tier-3 targets with ids on the page (at Consultant everything is rendered and visible).
  const probe = await load(browser, p, { level: 'consultant' });
  const targets = await probe.page.evaluate(() => {
    const pick = (t) => [...document.querySelectorAll(`[data-tier="${t}"][id]`)].map((n) => n.id).filter((id) => !/-h$/.test(id))[0] || null;
    return { 3: pick(3), 2: pick(2) };
  });
  await probe.ctx.close();
  const out = [];
  for (const t of [3, 2]) {
    const id = targets[t];
    if (!id) continue;
    const { ctx, page, log } = await load(browser, `${p}#${id}`, { level: 'mo' });
    try {
      await page.waitForTimeout(500);
      const vis = await page.evaluate((id) => { const n = document.getElementById(id); const r = n?.getBoundingClientRect(); return !!n && n.getClientRects().length > 0 && r.top < innerHeight && r.bottom > 0; }, id);
      const b = await bodyLevel(page);
      const why = [];
      if (!vis) why.push(`#${id} not shown on screen`);
      if (!b.relaxed) why.push('view not marked relaxed');
      if (TIER[b.level] < t) why.push(`level only raised to ${b.level}`);
      if (await ls(page) !== 'mo') why.push(`saved level changed to ${await ls(page)}`);
      if (await page.evaluate(() => /level=/.test(location.href))) why.push('level put in the URL');
      const back = page.locator(BACK_SEL).first();
      if (await back.count()) {
        await back.scrollIntoViewIfNeeded().catch(() => {});
        await back.click();
        await page.waitForTimeout(250);
        const b2 = await bodyLevel(page);
        const hidden = await page.evaluate((id) => document.getElementById(id)?.getClientRects().length === 0, id);
        if (b2.level !== 'mo' || b2.relaxed) why.push(`"Back to MO" left level ${b2.level}${b2.relaxed ? ' (relaxed)' : ''}`);
        if (!hidden) why.push(`#${id} still shown after "Back to MO"`);
      } else why.push('no visible "Back to MO" button');
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
      await waitReady(page, { idle: false });
      const b3 = await bodyLevel(page);
      if (b3.level !== 'mo' || b3.relaxed) why.push(`after reload without the hash: level ${b3.level}${b3.relaxed ? ' (relaxed)' : ''}`);
      if (errorsOf(log).length) why.push(`errors: ${errorsOf(log).slice(0, 2).join(' | ')}`);
      out.push({ name: `deep link to tier ${t} ${p}#${id} at MO relaxes, unsaved`, ok: !why.length, why: why.join('; ') });
    } finally { await ctx.close(); }
  }
  if (!targets[3] && !targets[2]) out.push({ name: `${p}: has tier-2/3 targets with ids`, ok: false, why: 'no [data-tier="2|3"][id] element found' });
  return out;
}

async function searchRelax(browser, p) {
  const { ctx, page } = await load(browser, p, { level: 'mo' });
  try {
    const term = await page.evaluate(() => {
      const s = [...document.querySelectorAll('[data-tier="3"] h3, [data-tier="3"] h2, [data-tier="3"] h4, [data-tier="2"] h3')].map((h) => h.textContent.trim()).filter((t) => t.length > 6)[0];
      return s || null;
    });
    if (!term) return { ok: true, skip: true };
    // On the hub the search box is on the page (#tb-hub-q); elsewhere the bar's Search opens the sheet (#tb-sheet-q).
    let q = page.locator('#tb-hub-q');
    let list = '#tb-hub-res';
    if (!(await q.isVisible().catch(() => false))) {
      q = page.locator('#tb-sheet-q'); list = '#tb-sheet-res';
      await page.locator('#tb-search-open').click().catch(() => {});
      await page.waitForTimeout(200);
    }
    if (!(await q.isVisible().catch(() => false))) return { ok: false, why: 'no visible search box (hub) and the Search button did not open the sheet' };
    await q.fill(term);
    await page.waitForTimeout(500);
    const res = await page.evaluate((list) => [...document.querySelectorAll(`${list} li`)].map((li) => ({ t: li.innerText.replace(/\s+/g, ' ').trim(), tier: !!li.querySelector('.tb-sres-tier') })), list);
    const hit = res.findIndex((r) => r.tier);
    if (hit < 0) return { ok: false, why: `searching "${term}" at MO gave no result tagged (Resident)/(Consultant): ${res.slice(0, 3).map((r) => r.t.slice(0, 60)).join(' | ')}` };
    await page.locator(`${list} li`).nth(hit).locator('a, button').first().click();
    await page.waitForTimeout(500);
    const b = await bodyLevel(page);
    const why = [];
    if (!b.relaxed) why.push('opening the result did not relax the level');
    if (await ls(page) !== 'mo') why.push('saved level changed');
    return { ok: !why.length, why: `"${term}": ${why.join('; ')}` };
  } finally { await ctx.close(); }
}

/** Brachial: a link to an Advanced (tier-3) block at MO shows that block for this view only. */
async function brachialRelax(browser) {
  const { ctx, page, log } = await load(browser, 'brachial-plexus/#block=costoclavicular', { level: 'mo', idle: true });
  try {
    await page.waitForTimeout(600);
    // On phones the chips sit in a collapsed block menu, so check the selection (pressed chip, select value or menu
    // label), not whether the chip is on screen.
    const s = await page.evaluate(() => {
      const c = document.querySelector('#block-chips [data-block="costoclavicular"]');
      const sel = [...document.querySelectorAll('select')].some((x) => x.value === 'costoclavicular');
      const label = [...document.querySelectorAll('button[aria-expanded], .bp-block-cur, [class*="block"] [class*="cur"]')].some((n) => /costoclavicular/i.test(n.textContent));
      return { chip: !!c, pressed: c?.getAttribute('aria-pressed'), sel, label, hash: location.hash };
    });
    const b = await bodyLevel(page);
    const why = [];
    if (!(s.pressed === 'true' || s.sel || s.label)) why.push(`costoclavicular not selected (chip ${s.chip ? `aria-pressed=${s.pressed}` : 'missing'}, no select or menu label shows it; hash ${s.hash})`);
    if (!b.relaxed) why.push(`view not relaxed (level ${b.level})`);
    if (await ls(page) !== 'mo') why.push('saved level changed');
    if (errorsOf(log).length) why.push(`errors: ${errorsOf(log).slice(0, 2).join(' | ')}`);
    return { name: 'brachial-plexus/#block=costoclavicular (Advanced) at MO relaxes, unsaved', ok: !why.length, why: why.join('; ') };
  } finally { await ctx.close(); }
}

// ------------------------------------------------------------------ 5. persistence across reload and apps
async function persistence(browser) {
  const { ctx, page, log } = await openContext(browser, { vp: '390' });
  const steps = [];
  const go = async (u) => { await page.goto(BASE + u, { waitUntil: 'domcontentloaded', timeout: 30000 }); await waitReady(page, { idle: false }); await page.waitForTimeout(300); };
  const pick = async (lv) => { const b = page.locator(`.ra-level-btn[data-level="${lv}"]:visible`).first(); if (!(await b.count())) return false; await b.click(); await page.waitForTimeout(250); return true; };
  const expect = async (where, lv) => {
    const b = await bodyLevel(page);
    const pressed = await page.evaluate(() => [...document.querySelectorAll('.ra-level-btn[aria-pressed="true"]')].filter((n) => n.getClientRects().length).map((n) => n.dataset.level));
    const ok = b.level === lv && pressed.length >= 1 && pressed.every((x) => x === lv) && !/level=/.test(page.url());
    steps.push({ name: `level persists: ${where} → ${lv}`, ok, why: `body ${b.level}, pressed [${pressed}], url ${page.url().replace(BASE, '/')}` });
  };
  try {
    await go('truncal/back/');
    if (!(await pick('mo'))) steps.push({ name: 'truncal/back/ level control clickable', ok: false, why: 'no visible MO button' });
    await expect('truncal/back/ after choosing MO', 'mo');
    steps.push({ name: 'saved as ra-level', ok: (await ls(page)) === 'mo', why: `ra-level=${await ls(page)}` });
    await page.reload(); await waitReady(page, { idle: false });
    await expect('truncal/back/ after reload', 'mo');
    await go('spinal/'); await expect('spinal/', 'mo');
    await pick('resident');
    await go('brachial-plexus/'); await expect('brachial-plexus/ (set Resident on spinal)', 'resident');
    await go('plexus/'); await expect('plexus/', 'resident');
    await pick('consultant');
    await go('head-neck/face/'); await expect('head-neck/face/ (set Consultant on plexus)', 'consultant');
    await go('lower-limb/hip/'); await pick('mo');
    await go('truncal/chest-wall/'); await expect('truncal/chest-wall/ (set MO on lower-limb/hip)', 'mo');
    if (errorsOf(log).length) steps.push({ name: 'persistence run without errors', ok: false, why: errorsOf(log).slice(0, 3).join(' | ') });
  } catch (err) { steps.push({ name: 'persistence run', ok: false, why: String(err.message || err).split('\n')[0] }); } finally { await ctx.close(); }
  return steps;
}

// ------------------------------------------------------------------ first-visit picker
async function picker(browser) {
  const out = [];
  for (const p of ['truncal/back/', 'spinal/', 'brachial-plexus/', 'plexus/']) {
    if (!PAGES.includes(p)) continue;
    const o = await openContext(browser, { vp: '390', dismissPicker: false });
    try {
      await o.page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
      await waitReady(o.page, { idle: false });
      const why = [];
      const box = o.page.locator('.ra-level-picker');
      if (!(await box.count()) || !(await box.first().isVisible())) why.push('no visible "How much detail do you want?" picker on a first visit');
      else {
        await box.first().locator('button', { hasText: 'Resident' }).first().click();
        await o.page.waitForTimeout(250);
        if ((await bodyLevel(o.page)).level !== 'resident') why.push('choosing Resident in the picker did not set the level');
        if (await ls(o.page) !== 'resident') why.push('picker choice not saved');
        if (await box.count() && await box.first().isVisible()) why.push('picker still shown after a choice');
        await o.page.reload(); await waitReady(o.page, { idle: false });
        if (await o.page.locator('.ra-level-picker:visible').count()) why.push('picker shown again after reload');
      }
      if (errorsOf(o.log).length) why.push(`errors: ${errorsOf(o.log).slice(0, 2).join(' | ')}`);
      out.push({ name: `first-visit level picker on ${p}`, ok: !why.length, why: why.join('; ') });
    } finally { await o.ctx.close(); }
  }
  return out;
}

// ------------------------------------------------------------------ 6. migration from spinal's keys
async function migration(browser) {
  const cases = [
    [{ 'spinal-level': '1' }, 'mo'], [{ 'spinal-level': '2' }, 'resident'], [{ 'spinal-level': 'adv' }, 'consultant'],
    [{ 'spinal-level': 'all' }, 'consultant'], [{ 'spinal-tier': '1' }, 'mo'], [{ 'spinal-tier': '2' }, 'resident'],
    [{ 'spinal-level': '1', 'ra-level': 'resident' }, 'resident'],
  ];
  const out = [];
  for (const [storage, want] of cases) {
    for (const p of ['truncal/back/', 'spinal/']) {
      const { ctx, page } = await load(browser, p, { storage });
      try {
        const b = await bodyLevel(page);
        const saved = await ls(page);
        out.push({ name: `migration ${JSON.stringify(storage)} on ${p} → ${want}`, ok: b.level === want && saved === want, why: `body ${b.level}, ra-level ${saved}` });
      } finally { await ctx.close(); }
    }
  }
  return out;
}

// ------------------------------------------------------------------ 8. Pearls only (spinal)
async function pearls(browser) {
  const out = [];
  for (const level of ['mo', 'resident', 'consultant']) {
    const { ctx, page, log } = await load(browser, 'spinal/#ch-technique', { level });
    try {
      const vis = await page.evaluate(() => [...document.querySelectorAll('.sp-pearls-btn, button')].filter((b) => /pearls only/i.test(b.textContent) && b.getClientRects().length).length);
      if (level !== 'consultant') { out.push({ name: `spinal: no "Pearls only" at ${level}`, ok: vis === 0, why: `${vis} visible Pearls only button(s)` }); continue; }
      if (!vis) { out.push({ name: 'spinal: "Pearls only" shown at Consultant', ok: false, why: 'no visible Pearls only button on #ch-technique' }); continue; }
      const before = await page.evaluate(() => document.querySelector('.sp-chapter.is-current')?.innerText.length || document.body.innerText.length);
      await page.locator('button:visible', { hasText: /Pearls only/i }).first().click();
      await page.waitForTimeout(300);
      const s = await page.evaluate(() => ({ on: document.body.dataset.pearlsOnly === 'true', digest: [...document.querySelectorAll('.sp-adv-digest')].some((d) => d.getClientRects().length), len: document.querySelector('.sp-chapter.is-current')?.innerText.length || document.body.innerText.length }));
      const why = [];
      if (!s.on) why.push('body[data-pearls-only] not set');
      if (!s.digest) why.push('no visible pearls digest');
      if (!(s.len < before)) why.push(`chapter text did not shrink (${before} → ${s.len})`);
      // Leaving Consultant ends Pearls only.
      await page.locator('.ra-level-btn[data-level="resident"]:visible').first().click().catch(() => {});
      await page.waitForTimeout(250);
      if ((await bodyLevel(page)).pearls) why.push('Pearls only stayed on at Resident');
      if (errorsOf(log).length) why.push(`errors: ${errorsOf(log).slice(0, 2).join(' | ')}`);
      out.push({ name: 'spinal: "Pearls only" works at Consultant', ok: !why.length, why: why.join('; ') });
    } finally { await ctx.close(); }
  }
  return out;
}

// ------------------------------------------------------------------ main
async function main() {
  const browser = await launch();
  const t0 = Date.now();

  const cj = PAGES.flatMap((p) => ['390', '1440'].map((vp) => [p, vp]));
  const cr = await pool(cj, W, ([p, vp]) => controlCheck(browser, p, vp), ([p, vp]) => `control ${p} @${vp}`);
  cj.forEach(([p, vp], i) => R.check(`level control on ${p} @${vp}`, cr[i]?.ok, cr[i]?.why || cr[i]?.error));

  const hj = PAGES.flatMap((p) => ['mo', 'resident', 'consultant'].map((l) => [p, l]));
  const hr = await pool(hj, W, ([p, l]) => hidingCheck(browser, p, l), ([p, l]) => `hiding ${p} ${l}`);
  hj.forEach(([p, l], i) => R.check(`${l}: ${p} hides tiers above ${TIER[l]}${hr[i]?.tagged != null ? ` (${hr[i].tagged} tagged)` : ''}`, hr[i]?.ok, hr[i]?.why || hr[i]?.error));
  for (const p of PAGES) {
    const i = hj.findIndex(([q, l]) => q === p && l === 'mo');
    if (!hr[i]?.ok || hr[i].tagged) continue;
    // plexus: plan §5 tags block and element notes tier 2; until WP5 wires it the page relies on its hint text (warning only)
    if (p === 'plexus/') R.warn(`${p}: no tiered content with ${LEVEL_URL[p]}`, 'block / element notes are not tagged data-tier=2 yet (WP5)');
    else R.fail(`${p}: has tiered content`, 'no [data-tier] elements at all (levels not wired)');
  }

  const ir = await pool(PAGES, W, (p) => hintsCheck(browser, p), (p) => `hints ${p}`);
  PAGES.forEach((p, i) => {
    R.check(`hidden-count hints at MO on ${p}${ir[i]?.n != null ? ` (${ir[i].n} hints)` : ''}`, ir[i]?.ok, ir[i]?.why || ir[i]?.error);
    if (ir[i]?.hub?.length) R.warn(`${p}: hub hides chapters at MO without a hint`, ir[i].hub.join(', '));
  });

  const sr = await pool(ENGINE, W, (p) => safetyCheck(browser, p), (p) => `safety ${p}`);
  ENGINE.forEach((p, i) => {
    R.check(`SAFETY at MO: dose box, LAST line, complications, "If it goes wrong" guides and scan on ${p}${sr[i]?.checked ? ` (${sr[i].blocks} blocks)` : ''}`, sr[i]?.ok, sr[i]?.why || sr[i]?.error);
    if (sr[i]?.free?.length) R.warn(`${p}: ${sr[i].free.length} dose string(s) in tiered content outside the plan's tier-2/3 section types (owner to review)`, sr[i].free.slice(0, 8).join('\n     '));
  });
  if (PAGES.includes('spinal/')) {
    const { ctx, page } = await load(browser, 'spinal/', { level: 'mo' });
    await page.addStyleTag({ content: FORCE_CSS });
    const card = await page.evaluate(() => { const c = document.getElementById('ch-card'); return { shown: !!c && c.getClientRects().length > 0 && !(Number(c.dataset.tier) > 1), up: c ? [...c.querySelectorAll('[data-tier="2"],[data-tier="3"]')].map((n) => `[${n.dataset.tier}] ${n.textContent.trim().slice(0, 70)}`) : [] }; });
    R.check('SAFETY at MO: spinal ward card (#ch-card) shown', card.shown, '#ch-card hidden at MO');
    if (card.up.length) R.warn(`spinal ward card: ${card.up.length} note(s) hidden at MO (owner/WP3 to confirm none is safety-critical)`, card.up.join('\n     '));
    await ctx.close();
  }

  const rr = await pool(PAGES.filter((p) => p !== 'plexus/' && p !== 'brachial-plexus/'), W, (p) => relaxCheck(browser, p), (p) => `relax ${p}`);
  rr.flat().forEach((x) => { if (x?.name) R.check(x.name, x.ok, x.why); else if (x?.error) R.fail('relax', x.error); });
  if (PAGES.includes('brachial-plexus/')) {
    const x = await brachialRelax(browser);
    R.check(x.name, x.ok, x.why);
  }
  const qr = await pool(ENGINE, W, (p) => searchRelax(browser, p), (p) => `search ${p}`);
  ENGINE.forEach((p, i) => { if (!qr[i]?.skip) R.check(`search result for hidden content relaxes on ${p}`, qr[i]?.ok, qr[i]?.why || qr[i]?.error); });

  if (!ONLY || ['truncal/back/', 'spinal/', 'brachial-plexus/', 'plexus/'].some((p) => ONLY.includes(p))) {
    for (const x of await persistence(browser)) R.check(x.name, x.ok, x.why);
    for (const x of await migration(browser)) R.check(x.name, x.ok, x.why);
    for (const x of await picker(browser)) R.check(x.name, x.ok, x.why);
  }
  if (PAGES.includes('spinal/')) for (const x of await pearls(browser)) R.check(x.name, x.ok, x.why);

  await browser.close();
  console.error(`  done in ${Math.round((Date.now() - t0) / 1000)} s`);
  return R.finish();
}

main().then((code) => process.exit(code), (err) => { console.error(err); process.exit(2); });
