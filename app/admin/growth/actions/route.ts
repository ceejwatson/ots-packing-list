import { NextRequest, NextResponse } from 'next/server';
import { adminAuthorized } from '@/lib/admin-auth';
import { createExperiment, updateExperiment } from '@/lib/growth-records';
import { runAIReview } from '@/lib/growth-ai';
import { GET as audit } from '@/app/api/check-stock/route';
import { allowedGrowthOrigin } from '@/lib/growth-origin';
export const runtime = 'nodejs';
export const maxDuration = 300;
export async function POST(req: NextRequest) {
  const noStore = { 'Cache-Control': 'private, no-store' };
  if (!adminAuthorized(req.headers.get('authorization'))) return new NextResponse('Unauthorized', { status: 401, headers: noStore });
  const origin = req.headers.get('origin');
  if (!allowedGrowthOrigin(origin) || !origin) return new NextResponse('Origin rejected', { status: 403, headers: noStore });
  let message = 'saved';
  try {
    if (!req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) throw new Error('invalid-form');
    const reader = req.body?.getReader(); if (!reader) throw new Error('invalid-form');
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > 16000) { await reader.cancel(); throw new Error('invalid-form'); } chunks.push(value); }
    const form = new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
    const action = form.get('action');
    if (action === 'experiment-create') await createExperiment(Object.fromEntries(form));
    else if (action === 'experiment-update') await updateExperiment(form.get('id') || '', form.get('status') || '', form.get('result') || '');
    else if (action === 'ai-review') { await runAIReview(); message = 'review-saved'; }
    else if (action === 'stock-audit') {
      if (!process.env.AUDIT_API_SECRET) throw new Error('stock-not-configured');
      const response = await audit(new NextRequest(`${origin}/api/check-stock`, { headers: { 'x-audit-key': process.env.AUDIT_API_SECRET } }));
      if (!response.ok) throw new Error(response.status === 429 ? 'stock-cooldown' : 'stock-unavailable');
      const result = await response.json();
      if (!result.persisted) throw new Error('stock-not-saved');
      message = 'stock-saved';
    } else throw new Error('invalid-form');
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    const safe = ['ai-not-configured', 'ai-cooldown', 'ai-provider-error', 'ai-incomplete', 'no-measurements', 'invalid-experiment', 'experiment-limit', 'experiment-conflict', 'experiment-completed', 'stock-not-configured', 'stock-cooldown', 'stock-unavailable', 'stock-not-saved'];
    message = safe.includes(code) ? code : 'operation-failed';
  }
  return NextResponse.redirect(new URL(`/admin/growth?notice=${message}`, origin), { status: 303, headers: noStore });
}
