import { timingSafeEqual } from 'node:crypto';
export function secretMatches(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function adminAuthorized(authorization: string | null): boolean {
  const password = process.env.GROWTH_ADMIN_PASSWORD;
  if (!password || password.length < 24 || !authorization?.startsWith('Basic ') || authorization.length > 2048) return false;
  return secretMatches(Buffer.from(authorization.slice(6), 'base64').toString('utf8'), `admin:${password}`);
}
