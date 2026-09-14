const ts = require('typescript');
const fs = require('fs');
const assert = require('node:assert/strict');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const p = require('../lib/progress.ts');
const { authorizeAudit } = require('../lib/audit-guard.ts');
const { AMAZON_ASSOCIATE_ID, defaultOTSPackingList, getAmazonLink } = require('../lib/packing-list-data.ts');
const data = new Map();
global.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
async function main() {
  const plan = p.emptyPlan();
  assert.equal(new Set(plan.items.map(i => i.id)).size, plan.items.length);
  const shoppingItems = defaultOTSPackingList.filter(i => !i.aafes_only && (i.amazon_asin || i.amazon_search));
  assert.ok(shoppingItems.length > 0);
  for (const item of shoppingItems) {
    const url = new URL(getAmazonLink(item.amazon_search, item.amazon_asin));
    assert.equal(url.hostname, 'www.amazon.com');
    assert.deepEqual(url.searchParams.getAll('tag'), [AMAZON_ASSOCIATE_ID]);
  }
  data.set('ots-packing-list-v4', JSON.stringify([{ item_name: 'Laptop', is_packed: true }]));
  assert.equal(p.readPlan().plan.items.find(i => i.id === 'laptop').is_packed, true);
  const renamed = p.emptyPlan(); renamed.items[0].item_name = 'Edited display name'; renamed.items[0].is_packed = true;
  assert.equal(p.parsePlan(renamed).items[0].is_packed, true);
  const winter = { ...plan, profile: { classDate: '2026-10-01', section: 'All' } };
  assert.equal(p.readiness(winter).total, p.readiness(plan).total + 3);
  const summer = { ...winter, profile: { ...winter.profile, classDate: '2026-06-01' } };
  assert.equal(p.readiness(summer).total, p.readiness(plan).total);
  const excluded = { ...plan, items: plan.items.map(i => ({ ...i, not_applicable: i.category !== 'Recommended' })) };
  assert.equal(p.readiness(excluded).total, 0);
  const optionalPacked = { ...plan, items: plan.items.map(i => ({ ...i, is_packed: i.category === 'Recommended' })) };
  assert.equal(p.readiness(optionalPacked).percent, 0);
  assert.equal(p.deadline('2026-10-01', 14), 'Sep 17, 2026');
  assert.equal(p.validDate('2026-02-30'), false);
  assert.throws(() => p.parsePlan({ ...plan, items: [{ id: 'laptop', is_packed: 'true' }] }));
  assert.throws(() => p.parsePlan({ ...plan, items: [plan.items[0], plan.items[0]] }));
  data.set(p.STORAGE_KEY, 'bad json'); assert.ok(p.readPlan().error); assert.equal(data.get(p.STORAGE_KEY), 'bad json');
  global.localStorage.setItem = () => { throw new Error('denied'); }; assert.ok(p.writePlan(plan));
  delete process.env.AUDIT_API_SECRET; assert.equal(await authorizeAudit(null), 503);
  process.env.AUDIT_API_SECRET = 'test-secret'; assert.equal(await authorizeAudit('wrong'), 401);
  delete process.env.AUDIT_REDIS_REST_URL; assert.equal(await authorizeAudit('test-secret'), 503);
  process.env.AUDIT_REDIS_REST_URL = 'https://example.invalid'; process.env.AUDIT_REDIS_REST_TOKEN = 'test';
  global.fetch = async (_url, options) => { assert.deepEqual(JSON.parse(options.body), ['SET','ots:stock-audit:lease','1','NX','EX',300]); return { ok: true, json: async () => ({ result: 'OK' }) }; };
  assert.equal(await authorizeAudit('test-secret'), 0);
  global.fetch = async () => ({ ok: true, json: async () => ({ result: null }) }); assert.equal(await authorizeAudit('test-secret'), 429);
  global.fetch = async () => { throw new Error('offline'); }; assert.equal(await authorizeAudit('test-secret'), 503);
  console.log('PASS: stable IDs, migration, seasonal boundaries, exclusions, optional readiness, dates, backup validation, storage failures, audit auth and distributed cooldown.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });

