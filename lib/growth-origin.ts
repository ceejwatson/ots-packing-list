export function allowedGrowthOrigin(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = new Set([process.env.GROWTH_SITE_ORIGIN || 'https://otspackinglist.com']);
  if (process.env.VERCEL_ENV === 'preview') {
    for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
      if (host && /^[a-z0-9.-]+\.vercel\.app$/i.test(host)) allowed.add(`https://${host}`);
    }
  }
  return allowed.has(origin);
}
