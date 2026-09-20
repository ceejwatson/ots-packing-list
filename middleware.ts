import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const password = process.env.GROWTH_ADMIN_PASSWORD;
  const responseHeaders = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (!password || password.length < 24) return new NextResponse('Growth dashboard is not configured.', { status: 503, headers: responseHeaders });
  const authorization = req.headers.get('authorization') || '';
  let supplied = '';
  try { if (authorization.startsWith('Basic ') && authorization.length < 2048) supplied = atob(authorization.slice(6)); } catch { /* reject */ }
  const encode = new TextEncoder();
  const [expected, actual] = await Promise.all([`admin:${password}`, supplied].map(v => crypto.subtle.digest('SHA-256', encode.encode(v))));
  const left = new Uint8Array(expected); const right = new Uint8Array(actual);
  let difference = 0; for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  if (difference !== 0) return new NextResponse('Authentication required.', { status: 401, headers: { ...responseHeaders, 'WWW-Authenticate': 'Basic realm="OTS Growth", charset="UTF-8"' } });
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(responseHeaders)) response.headers.set(key, value);
  return response;
}
export const config = { matcher: ['/admin/:path*'] };
