const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');
const origin = 'http://localhost:3002';
const password = 'local-test-password-32-characters-only';
const counters = new Map(); let server; let app; let browser;
const experiments = new Map();
// In-memory Redis protocol double: no real traffic, secrets or remote services.
async function main() {
  server = http.createServer(async (req, res) => {
    let text = ''; for await (const chunk of req) text += chunk;
    const cmd = JSON.parse(text); let result;
    if (cmd[0] === 'EVAL' && cmd[1].includes('HLEN')) {
      experiments.set(cmd[4], cmd[5]); result = 1;
    } else if (cmd[0] === 'EVAL' && cmd[1].includes('HGET')) {
      if (experiments.get(cmd[4]) === cmd[5]) { experiments.set(cmd[4], cmd[6]); result = 1; } else result = 0;
    } else if (cmd[0] === 'HVALS') result = [...experiments.values()];
    else if (cmd[0] === 'HGET') result = experiments.get(cmd[2]) || null;
    else if (cmd[0] === 'GET') result = null;
    else if (cmd[0] === 'EVAL') {
      for (const key of cmd.slice(5)) counters.set(key, (counters.get(key) || 0) + 1);
      result = 1;
    } else if (cmd[0] === 'HGETALL') result = Array.from(counters).flat();
    res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ result }));
  });
  await new Promise(resolve => server.listen(4319, '127.0.0.1', resolve));
  app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3002'], { env: { ...process.env, GROWTH_ADMIN_PASSWORD: password, GROWTH_MEASUREMENT_ENABLED: 'true', GROWTH_RATE_SECRET: 'local-rate-test-secret-only', GROWTH_REDIS_REST_URL: 'http://127.0.0.1:4319', GROWTH_REDIS_REST_TOKEN: 'test-only', GROWTH_SITE_ORIGIN: origin }, windowsHide: true, stdio: 'pipe' });
  let logs = ''; app.stdout.on('data', data => logs += data); app.stderr.on('data', data => logs += data);
  for (let i = 0; i < 100; i++) { try { await fetch(origin); break; } catch { await new Promise(r => setTimeout(r, 100)); } }
  const send = (body, extra = {}) => fetch(`${origin}/api/events`, { method: 'POST', headers: { origin, 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body) });
  assert.equal((await send({ event: 'page_view', page: '/' }, { origin: 'https://other.example' })).status, 403);
  assert.equal((await send({ event: 'search', page: '/', query: 'sensitive' })).status, 400);
  assert.equal((await send({ event: 'search', page: '/', query: 'x'.repeat(1100) })).status, 413);
  assert.equal((await send({ event: 'page_view', page: '/' }, { 'sec-gpc': '1' })).status, 204);
  assert.equal(counters.size, 0);
  assert.equal((await send({ event: 'page_view', page: '/' })).status, 204);
  assert.equal(counters.get('event:page_view'), 1);
  assert.equal((await fetch(`${origin}/admin/growth`)).status, 401);
  assert.equal((await fetch(`${origin}/api/growth-review`)).status, 401);
  assert.equal((await fetch(`${origin}/admin/growth`, { headers: { authorization: 'Basic ' + Buffer.from('admin:wrong').toString('base64') } })).status, 401);
  const authorized = await fetch(`${origin}/admin/growth`, { headers: { authorization: 'Basic ' + Buffer.from(`admin:${password}`).toString('base64') } });
  assert.equal(authorized.status, 200); assert.match(authorized.headers.get('cache-control'), /no-store/); assert.match(await authorized.text(), /Growth dashboard/);
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); const errors = []; const payloads = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', req => { if (req.url().endsWith('/api/events')) payloads.push(req.postDataJSON()); });
  await page.goto(origin);
  await page.getByRole('searchbox').fill('Laptop');
  await page.getByRole('checkbox', { name: 'Mark Laptop complete', exact: true }).click();
  await page.waitForTimeout(1200);
  // Prevent an external purchase-page request; exercise the real click listener.
  await page.evaluate(() => document.querySelector('a[data-affiliate-item="laptop"]').addEventListener('click', event => event.preventDefault()));
  await page.locator('a[data-affiliate-item="laptop"]').first().click();
  await page.waitForTimeout(200);
  for (const event of ['page_view', 'product_view', 'search', 'checklist_change', 'affiliate_click']) assert.ok(payloads.some(p => p.event === event), `Missing ${event}; build with GROWTH_MEASUREMENT_ENABLED=true`);
  assert.ok(payloads.every(p => !('query' in p) && !('is_packed' in p)));
  await page.getByRole('link', { name: 'Sources, disclosure & privacy', exact: true }).click();
  await page.getByRole('heading', { name: 'Sources, disclosure and privacy', exact: true }).waitFor();
  const admin = await browser.newContext({ viewport: { width: 390, height: 844 }, httpCredentials: { username: 'admin', password } });
  const adminPage = await admin.newPage(); await adminPage.goto(`${origin}/admin/growth`);
  await adminPage.getByRole('main').getByText('Register an experiment', { exact: true }).click();
  for (const [label, value] of [['Title', 'Synthetic experiment'], ['Hypothesis', 'Clearer selection may improve clicks'], ['Control and proposed variant', 'Existing card versus explained suitability'], ['Primary metric', 'Clicks per product impression'], ['Success criterion, sample size, duration and guardrails', 'Plan sample size and fixed duration before starting']]) await adminPage.getByRole('main').getByLabel(label, { exact: true }).fill(value);
  await adminPage.getByRole('main').getByRole('button', { name: 'Save draft experiment', exact: true }).click();
  await adminPage.getByRole('main').getByRole('heading', { name: 'Synthetic experiment · draft', exact: true }).waitFor();
  await adminPage.getByRole('combobox').selectOption('active');
  await adminPage.getByRole('main').getByRole('button', { name: 'Save status', exact: true }).click();
  await adminPage.getByRole('main').getByRole('heading', { name: 'Synthetic experiment · active', exact: true }).waitFor();
  await adminPage.getByRole('main').getByRole('button', { name: 'Generate evidence review', exact: true }).click();
  await adminPage.getByRole('main').getByRole('status').filter({ hasText: 'AI review needs' }).waitFor();
  assert.equal(await adminPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await adminPage.screenshot({ path: '../../outputs/ots-growth-admin.png' });
  const privateContext = await browser.newContext();
  await privateContext.addInitScript(() => Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }));
  const privatePage = await privateContext.newPage(); let privateEvents = 0;
  privatePage.on('request', req => { if (req.url().endsWith('/api/events')) privateEvents++; });
  await privatePage.goto(origin); await privatePage.waitForTimeout(1000); assert.equal(privateEvents, 0);
  assert.deepEqual(errors, []);
  console.log('PASS: enabled event delivery, no search/checklist contents, origin/body validation, GPC browser/server suppression, aggregate writes, admin auth/no-store, mobile dashboard, no page errors. Synthetic test data only.');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); if (app) app.kill(); if (server) server.close(); });
