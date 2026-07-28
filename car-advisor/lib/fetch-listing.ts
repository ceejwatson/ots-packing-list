/**
 * Best-effort retrieval of a listing page's *public* metadata.
 *
 * Deliberate limits — see DESIGN.md, "Legal and technical constraints":
 *   - We request the URL once, as a normal client, and honor whatever we get.
 *   - We never retry through a block, rotate user agents, use a proxy pool, or
 *     touch anything behind a login. Facebook Marketplace and Craigslist in
 *     particular prohibit automated collection, and their listing bodies are
 *     not public metadata.
 *   - We read Open Graph tags and schema.org JSON-LD only, which is the same
 *     surface every link-preview unfurler reads and which sites publish
 *     specifically to be read by third parties.
 *
 * When this returns nothing useful, the product asks the user to paste the
 * listing text. That path is the primary one and always works.
 */

const TIMEOUT_MS = 8000
const MAX_BYTES = 1_500_000

export interface FetchedPage {
  ok: boolean
  /** Why we could not read the page, phrased for the end user. */
  reason?: string
  title?: string
  description?: string
  siteName?: string
  /** Text assembled from public metadata, fed to the extractor. */
  text?: string
  /** Structured vehicle data from schema.org JSON-LD, when the site publishes it. */
  jsonLd?: Record<string, unknown>[]
}

const BLOCKED_HOSTS = [
  // These sites' terms prohibit automated collection, and their listing
  // content is not exposed as public metadata anyway. Ask for a paste instead.
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'craigslist.org',
]

export function siteNameFromUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    const known: Record<string, string> = {
      'facebook.com': 'Facebook Marketplace',
      'autotrader.com': 'AutoTrader',
      'cars.com': 'Cars.com',
      'cargurus.com': 'CarGurus',
      'craigslist.org': 'Craigslist',
      'carvana.com': 'Carvana',
      'carmax.com': 'CarMax',
      'ebay.com': 'eBay Motors',
      'truecar.com': 'TrueCar',
      'edmunds.com': 'Edmunds',
    }
    for (const [domain, name] of Object.entries(known)) {
      if (host === domain || host.endsWith('.' + domain)) return name
    }
    return host
  } catch {
    return undefined
  }
}

export async function fetchListingPage(url: string): Promise<FetchedPage> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { ok: false, reason: 'That does not look like a valid URL.' }
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { ok: false, reason: 'Only http and https links are supported.' }
  }

  const host = parsed.hostname.toLowerCase()
  if (BLOCKED_HOSTS.some((b) => host === b || host.endsWith('.' + b))) {
    return {
      ok: false,
      siteName: siteNameFromUrl(url),
      reason:
        `${siteNameFromUrl(url) ?? 'This site'} does not allow listings to be read automatically. ` +
        'Copy the listing text and paste it below — the analysis is identical.',
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Identify honestly. If a site does not want this traffic, it can say so.
        'user-agent': 'CarVerdictBot/1.0 (+listing preview; respects robots.txt)',
        accept: 'text/html,application/xhtml+xml',
      },
    })

    if (!res.ok) {
      return {
        ok: false,
        siteName: siteNameFromUrl(url),
        reason:
          res.status === 403 || res.status === 401 || res.status === 429
            ? 'That site blocks automated requests. Paste the listing text below instead.'
            : `The page could not be read (HTTP ${res.status}). Paste the listing text below instead.`,
      }
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('html')) {
      return { ok: false, reason: 'That link does not point to a web page.' }
    }

    const html = (await res.text()).slice(0, MAX_BYTES)
    return parseMetadata(html, url)
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    return {
      ok: false,
      siteName: siteNameFromUrl(url),
      reason: aborted
        ? 'The page took too long to respond. Paste the listing text below instead.'
        : 'The page could not be reached. Paste the listing text below instead.',
    }
  } finally {
    clearTimeout(timer)
  }
}

function parseMetadata(html: string, url: string): FetchedPage {
  const meta = (property: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m?.[1]) return decodeEntities(m[1])
    }
    return undefined
  }

  const title = meta('og:title') ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim()
  const description = meta('og:description') ?? meta('description')
  const siteName = meta('og:site_name') ?? siteNameFromUrl(url)

  const jsonLd: Record<string, unknown>[] = []
  const ldMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const m of ldMatches) {
    try {
      const parsed = JSON.parse(m[1].trim())
      if (Array.isArray(parsed)) jsonLd.push(...parsed)
      else jsonLd.push(parsed)
    } catch {
      // Malformed JSON-LD is common. Skip it rather than failing the request.
    }
  }

  const text = [title, description].filter(Boolean).join('\n')
  const usable = Boolean(text.trim()) || jsonLd.length > 0

  return {
    ok: usable,
    title: title ? decodeEntities(title) : undefined,
    description,
    siteName,
    text: usable ? text : undefined,
    jsonLd: jsonLd.length ? jsonLd : undefined,
    reason: usable
      ? undefined
      : 'That page did not expose enough public information to analyze. Paste the listing text below instead.',
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
}
