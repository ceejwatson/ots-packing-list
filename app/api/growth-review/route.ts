import { NextRequest, NextResponse } from 'next/server';
import { secretMatches } from '@/lib/admin-auth';
import { runAIReview } from '@/lib/growth-ai';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function GET(req: NextRequest) {
  const headers = { 'Cache-Control': 'no-store' };
  const secret = process.env.CRON_SECRET;
  if (!secret || !secretMatches(req.headers.get('authorization') || '', `Bearer ${secret}`)) return new NextResponse(null, { status: 401, headers });
  if (process.env.GROWTH_SCHEDULED_REVIEW_ENABLED !== 'true') return new NextResponse(null, { status: 204, headers });
  try { await runAIReview(); return NextResponse.json({ status: 'review-saved' }, { headers }); }
  catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (['ai-cooldown', 'no-measurements'].includes(code)) return NextResponse.json({ status: 'skipped', reason: code }, { headers });
    console.warn('Scheduled growth review failed');
    return NextResponse.json({ status: 'failed' }, { status: 503, headers });
  }
}
