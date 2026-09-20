import { createHmac } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { counterFields, validateEvent } from '@/lib/growth-events';
import { growthConfigured, redis } from '@/lib/growth-store';
import { allowedGrowthOrigin } from '@/lib/growth-origin';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };
// Atomic bounded rate limit and daily aggregates. Rate keys expire in 60 seconds;
// counters expire after 90 days. No raw IP, query, fingerprint or visitor ID stored.
const script = `local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], 60) end
if n > 120 then return 0 end
for i=1,#ARGV do redis.call('HINCRBY', KEYS[2], ARGV[i], 1) end
redis.call('EXPIRE', KEYS[2], 7776000)
return 1`;
export async function POST(req: NextRequest) {
  if (!growthConfigured() || !process.env.GROWTH_RATE_SECRET) return new NextResponse(null, { status: 204, headers });
  if (!allowedGrowthOrigin(req.headers.get('origin'))) return new NextResponse(null, { status: 403, headers });
  if (req.headers.get('sec-gpc') === '1' || req.headers.get('dnt') === '1') return new NextResponse(null, { status: 204, headers });
  if (!req.headers.get('content-type')?.startsWith('application/json')) return new NextResponse(null, { status: 415, headers });
  try {
    // Enforce the bound while reading, including chunked bodies.
    const reader = req.body?.getReader();
    if (!reader) return new NextResponse(null, { status: 400, headers });
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) { await reader.cancel(); return new NextResponse(null, { status: 413, headers }); }
      chunks.push(value);
    }
    let data: unknown;
    try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return new NextResponse(null, { status: 400, headers }); }
    const event = validateEvent(data);
    if (!event) return new NextResponse(null, { status: 400, headers });
    const date = new Date().toISOString().slice(0, 10);
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const key = createHmac('sha256', process.env.GROWTH_RATE_SECRET).update(`${date}:${ip}`).digest('hex');
    const result = await redis(['EVAL', script, 2, `ots:growth:rate:${key}`, `ots:growth:${date}`, ...counterFields(event)]);
    return new NextResponse(null, { status: result === 1 ? 204 : 429, headers });
  } catch {
    console.warn('Growth event storage unavailable');
    return new NextResponse(null, { status: 503, headers });
  }
}
