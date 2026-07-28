import { NextResponse } from 'next/server'
import { extractListing } from '@/lib/extract'
import { fetchListingPage, siteNameFromUrl } from '@/lib/fetch-listing'
import { buildReport } from '@/lib/report'
import type { BuyerProfile, Listing } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

interface AnalyzeBody {
  url?: string
  text?: string
  /** Fields the user corrected by hand; these override extraction. */
  overrides?: Partial<Listing>
  profile?: BuyerProfile
}

export async function POST(request: Request) {
  let body: AnalyzeBody
  try {
    body = (await request.json()) as AnalyzeBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const url = body.url?.trim()
  const pastedText = body.text?.trim()

  if (!url && !pastedText) {
    return NextResponse.json(
      { error: 'Paste a listing link or the listing text to get started.' },
      { status: 400 },
    )
  }

  let text = pastedText ?? ''
  let sourceSite: string | undefined
  let jsonLd: Record<string, unknown>[] | undefined
  let fetchNote: string | undefined

  if (url) {
    sourceSite = siteNameFromUrl(url)
    const page = await fetchListingPage(url)
    if (page.ok) {
      // Pasted text is richer than metadata, so it leads when both are present.
      text = [pastedText, page.text].filter(Boolean).join('\n\n')
      jsonLd = page.jsonLd
    } else {
      fetchNote = page.reason
      if (!pastedText) {
        return NextResponse.json(
          {
            error: page.reason ?? 'That listing could not be read automatically.',
            needsPaste: true,
            sourceSite: page.siteName ?? sourceSite,
          },
          { status: 422 },
        )
      }
    }
  }

  try {
    const extracted = await extractListing(text, { sourceUrl: url, sourceSite, jsonLd })
    const listing: Listing = { ...extracted, ...stripEmpty(body.overrides ?? {}) }

    const report = await buildReport(listing, body.profile ?? {})
    if (fetchNote) report.dataNotes.unshift(fetchNote)

    return NextResponse.json({ report })
  } catch (err) {
    console.error('analyze failed', err)
    return NextResponse.json(
      { error: 'Something went wrong analyzing that listing. Try pasting the listing text directly.' },
      { status: 500 },
    )
  }
}

function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v
  }
  return out as Partial<T>
}
