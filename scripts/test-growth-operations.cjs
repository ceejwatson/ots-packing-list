const ts = require('typescript'); const fs = require('node:fs'); const assert = require('node:assert/strict');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { adminAuthorized } = require('../lib/admin-auth.ts');
const { experimentInput, saveStockRecord } = require('../lib/growth-records.ts');
const { validateAIReview, runAIReview } = require('../lib/growth-ai.ts');
const { allowedGrowthOrigin } = require('../lib/growth-origin.ts');
async function main() {
  assert.equal(allowedGrowthOrigin('https://attacker.example'), false);
  process.env.VERCEL_ENV = 'preview'; process.env.VERCEL_BRANCH_URL = 'test-branch.vercel.app';
  assert.equal(allowedGrowthOrigin('https://test-branch.vercel.app'), true);
  assert.equal(allowedGrowthOrigin('https://other-branch.vercel.app'), false);
  process.env.GROWTH_ADMIN_PASSWORD = 'local-test-password-32-characters-only';
  assert.equal(adminAuthorized(null), false);
  assert.equal(adminAuthorized('Basic ' + Buffer.from('admin:wrong').toString('base64')), false);
  assert.equal(adminAuthorized('Basic ' + Buffer.from(`admin:${process.env.GROWTH_ADMIN_PASSWORD}`).toString('base64')), true);
  assert.throws(() => experimentInput({ title: 'Only title' }));
  const input = { title: ' Test ', hypothesis: 'Clarify selection', variant: 'One category', metric: 'Click events / impressions', criterion: 'Register sample and duration before starting' };
  assert.equal(experimentInput(input).title, 'Test');
  const evidence = [{ id: 'scope', fact: 'Measured counts only' }];
  const suggestion = { change: 'Test guidance', why: 'Hypothesis', evidenceIds: ['scope'], mechanism: 'Clarify choice', difficulty: 'Small', measurement: 'Pre-register a randomized test' };
  assert.equal(validateAIReview({ recommendations: [suggestion] }, evidence).length, 1);
  assert.throws(() => validateAIReview({ recommendations: [{ ...suggestion, evidenceIds: ['invented'] }] }, evidence));
  assert.throws(() => validateAIReview({ recommendations: [] }, evidence));
  await assert.rejects(runAIReview(), /ai-not-configured/);
  process.env.GROWTH_AI_ENABLED = 'true'; process.env.OPENAI_API_KEY = 'synthetic-test-only'; process.env.OPENAI_GROWTH_MODEL = 'test-model';
  process.env.GROWTH_REDIS_REST_URL = 'https://storage.example.test'; process.env.GROWTH_REDIS_REST_TOKEN = 'test-only';
  let lease = true; let providerCalls = 0; let measured = true; let saved; let stock;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    if (url === 'https://api.openai.com/v1/responses') {
      providerCalls++; assert.equal(body.store, false); assert.equal(body.max_output_tokens, 2000); assert.equal(body.model, 'test-model');
      assert.ok(!('tools' in body));
      return { ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ recommendations: [suggestion] }) }] }] }) };
    }
    let result = null;
    if (body[0] === 'HGETALL') result = measured ? ['event:page_view', '1'] : [];
    else if (body[0] === 'SET' && body[1].endsWith('ai-lease')) { result = lease ? 'OK' : null; lease = false; }
    else if (body[0] === 'SET') { saved = JSON.parse(body[2]); result = 'OK'; }
    else if (body[0] === 'EVAL') { stock = JSON.parse(body.at(-1)); result = 1; }
    return { ok: true, json: async () => ({ result }) };
  };
  try {
    measured = false; await assert.rejects(runAIReview(), /no-measurements/); assert.equal(providerCalls, 0);
    measured = true; await runAIReview(); assert.equal(providerCalls, 1); assert.equal(saved.model, 'test-model');
    await assert.rejects(runAIReview(), /ai-cooldown/); assert.equal(providerCalls, 1);
    await saveStockRecord({ checkedAt: new Date().toISOString(), totalAsins: 1, okCount: 0, dead: [{ asin: 'B123456789', name: 'Example', error: 'Provider data not retained' }], unavailable: [], unverified: [] });
    assert.equal(stock.dead[0].error, undefined);
  } finally { global.fetch = originalFetch; }
  console.log('PASS: admin authentication, experiment validation, AI evidence IDs, no-data/config gating, one-call cooldown, constrained provider request and sanitized audit retention. Mock provider only.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
