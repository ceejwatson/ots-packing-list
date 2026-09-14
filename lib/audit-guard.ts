import { timingSafeEqual } from 'node:crypto';

// Shared Redis gate: a single atomic lease across all serverless instances.
// Missing or unavailable configuration disables audits rather than bypassing limits.
export async function authorizeAudit(key: string | null): Promise<0 | 401 | 429 | 503> {
  const secret = process.env.AUDIT_API_SECRET;
  if (!secret) return 503;
  const supplied = Buffer.from(key ?? ''); const expected = Buffer.from(secret);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return 401;
  const url = process.env.AUDIT_REDIS_REST_URL;
  const token = process.env.AUDIT_REDIS_REST_TOKEN;
  if (!url || !token) return 503;
  try {
    const response = await fetch(url, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', 'ots:stock-audit:lease', '1', 'NX', 'EX', 300]),
      cache: 'no-store', signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return 503;
    const data = await response.json();
    if (data.error || !Object.prototype.hasOwnProperty.call(data, 'result')) return 503;
    return data.result === 'OK' ? 0 : data.result === null ? 429 : 503;
  } catch { return 503; }
}
