// Playwright check at 390 px, light and dark: every screen loads, no horizontal scroll, no console errors.
// Needs a static server at the repository root: python3 -m http.server 8080 (BASE overrides).
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:8080/tci/';
const SHOTS = process.env.SHOTS; // optional folder for screenshots
const screens = ['match', 'pump', 'curves', 'explore', 'more', 'calibrate', 'refs', 'assumptions', 'settings'];
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
let failures = 0;
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('request failed ' + r.url()));
  for (const s of screens) {
    await page.goto(`${BASE}#/${s}`);
    await page.waitForSelector('#main');
    await page.waitForTimeout(150);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 0) { failures++; console.log(`FAIL ${scheme} ${s}: horizontal scroll ${over}px`); }
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${scheme}-${s}.png`, fullPage: true });
  }
  // core answer present and matches the reference patient
  await page.goto(`${BASE}#/match`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const m = await page.textContent('[data-testid=matched]');
  if (!/Schnider Ce 9\.6[67]/.test(m ?? '')) { failures++; console.log(`FAIL ${scheme}: matched text "${m}"`); }
  // input changes the answer
  await page.fill('input[name=age]', '85');
  await page.fill('input[name=height]', '168');
  await page.fill('input[name=weight]', '65');
  const m2 = await page.textContent('[data-testid=matched]');
  if (!/8\.5[67]/.test(m2 ?? '')) { failures++; console.log(`FAIL ${scheme}: 85 y matched "${m2}"`); }
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`${scheme}: body ${bg}; ${errors.length} console errors`);
  if (errors.length) { failures++; console.log(errors.join('\n')); }
  await ctx.close();
}
await browser.close();
console.log(failures ? `${failures} failure(s)` : 'e2e ok');
process.exit(failures ? 1 : 0);
