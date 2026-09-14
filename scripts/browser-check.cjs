const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto((process.env.BASE_URL || 'http://localhost:3001'));
  await page.getByRole('checkbox', { name: /Mark .* complete/ }).first().waitFor();
  await page.getByRole('checkbox', { name: /Mark .* complete/ }).first().click();
  const marks = page.getByRole('checkbox', { name: /Mark .* complete/ });
  await marks.nth(1).click();
  await marks.nth(2).click();
  for (let i = 0; i < 3; i++) {
    assert.equal(await marks.nth(i).getAttribute('aria-checked'), 'true');
    assert.equal(await marks.nth(i).evaluate(el => getComputedStyle(el.closest('article')).backgroundColor), 'rgb(236, 253, 245)');
  }
  await page.reload();
  await page.getByRole('checkbox', { name: /Mark .* complete/, checked: true }).first().waitFor();
  assert.equal(await page.getByRole('checkbox', { name: /Mark .* complete/, checked: true }).count(), 3);
  await page.getByRole('button', { name: 'Unchecked', exact: true }).click();
  assert.equal(await page.getByRole('checkbox', { name: /Mark .* complete/, checked: true }).count(), 0);
  await page.getByRole('button', { name: 'All items', exact: true }).click();
  await page.getByRole('searchbox').fill('Laptop');
  const laptop = page.locator('article').filter({ has: page.getByRole('link', { name: 'View Laptop on Amazon', exact: true }) });
  assert.equal(await laptop.count(), 1);
  assert.equal(await page.getByRole('button', { name: /N.A/ }).count(), 0);
  await page.evaluate(() => {
    const key = 'ots-preparation-v5';
    const saved = JSON.parse(localStorage.getItem(key));
    const item = saved.items.find(i => i.item_name === 'Laptop');
    item.not_applicable = true; item.is_packed = true; item.is_owned = true;
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await page.getByRole('button', { name: /Documents/ }).click();
  await page.getByRole('button', { name: 'Unchecked', exact: true }).click();
  await page.getByRole('searchbox').fill('unrelated search');
  await page.getByLabel(/Show excluded/).check();
  await laptop.getByRole('button', { name: 'Include item', exact: true }).click();
  assert.equal(await laptop.count(), 0);
  await page.getByText('No excluded items. All your items are included in the checklist.', { exact: true }).waitFor();
  await page.getByRole('button', { name: /Required/ }).click();
  await page.getByRole('button', { name: 'All items', exact: true }).click();
  for (const width of [375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'mobile-checklist.png' });
  const dock = await page.getByRole('navigation', { name: 'Mobile navigation', exact: true }).boundingBox();
  assert.ok(dock && dock.y + dock.height <= 845 && dock.y > 700);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.getByRole('navigation', { name: 'Mobile navigation', exact: true }).getByRole('link', { name: 'Overview' }).click();
  assert.equal(await page.getByRole('button', { name: /backup|import|export/i }).count(), 0);
  assert.equal(await page.locator('input[type=file]').count(), 0);
  assert.equal(await page.getByRole('button', { name: /reset/i }).count(), 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'mobile-overview.png', fullPage: true });
  await page.getByRole('navigation', { name: 'Mobile navigation', exact: true }).getByRole('link', { name: 'Checklist' }).click();
  await page.getByRole('searchbox').fill('gloves');
  await page.getByText('Oct–May required', { exact: true }).waitFor();
  await page.getByRole('searchbox').fill('');
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: 'desktop-checklist.png' });
  assert.equal(await page.getByRole('navigation', { name: 'Mobile navigation', exact: true }).isVisible(), false);
  const response = await page.request.get((process.env.BASE_URL || 'http://localhost:3001') + '/api/check-stock'); assert.equal(response.status(), 503);
  const failureContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await failureContext.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); }; });
  const failurePage = await failureContext.newPage();
  await failurePage.route('**/_next/image**', route => route.abort());
  await failurePage.goto((process.env.BASE_URL || 'http://localhost:3001'));
  await failurePage.getByRole('checkbox', { name: /Mark .* complete/ }).first().click();
  await failurePage.getByRole('alert').filter({ hasText: 'Changes are only in this session' }).waitFor();
  await failurePage.getByRole('link', { name: 'View Laptop on Amazon', exact: true }).waitFor();
  assert.ok(await failurePage.getByRole('checkbox', { name: /Mark .* complete/, checked: true }).count());
  await failureContext.close();
  assert.deepEqual(errors, []);
  console.log('PASS: mobile navigation, no horizontal overflow, checkmarks/reload, filters, exclusions, no reset controls and automatic saving, desktop navigation, fail-closed API, storage failure warning, failed-image shopping fallback, no page errors.');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });


