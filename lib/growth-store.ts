// Server-only callers. Never import from client components.
export function growthConfigured() {
  return process.env.GROWTH_MEASUREMENT_ENABLED === 'true' && !!process.env.GROWTH_REDIS_REST_URL && !!process.env.GROWTH_REDIS_REST_TOKEN;
}
export async function redis(command: unknown[]): Promise<unknown> {
  const url = process.env.GROWTH_REDIS_REST_URL;
  const token = process.env.GROWTH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Growth storage unavailable');
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), cache: 'no-store', signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Growth storage request failed');
  const data = await response.json();
  if (data.error || !Object.prototype.hasOwnProperty.call(data, 'result')) throw new Error('Growth storage response invalid');
  return data.result;
}
export type DayMetrics = { date: string; counters: Record<string, number> };
export async function readGrowthDays(): Promise<DayMetrics[]> {
  return Promise.all(Array.from({ length: 14 }, async (_, index) => {
    const date = new Date(Date.now() - (13 - index) * 86400000).toISOString().slice(0, 10);
    const result = await redis(['HGETALL', `ots:growth:${date}`]);
    const counters: Record<string, number> = {};
    if (!Array.isArray(result) || result.length % 2 !== 0) throw new Error('Invalid metrics');
    for (let i = 0; i < result.length; i += 2) {
      const count = Number(result[i + 1]);
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid counter');
      counters[String(result[i])] = count;
    }
    return { date, counters };
  }));
}
