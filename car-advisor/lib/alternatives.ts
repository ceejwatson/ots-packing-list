import { brandProfile } from '@/data/brands'
import { peersInSegment, type ModelProfile } from '@/data/models'
import { MSRP_REFERENCE_YEAR, segmentProfile } from '@/data/segments'
import type { Alternative } from './types'
import { retentionAtAge } from './valuation'
import type { ResolvedVehicle } from './vehicle'

/**
 * Suggests same-segment vehicles that are meaningfully more reliable and land in
 * a similar price range. Only surfaced when the vehicle under review has a real
 * weakness — telling someone their reliable, fairly priced car has "better
 * alternatives" is noise.
 */
export function findAlternatives(v: ResolvedVehicle, currentReliability: number, budget?: number): Alternative[] {
  if (v.bodyStyle === 'unknown') return []

  const currentKey = v.model ? `${v.model.make}|${v.model.model}` : undefined
  const peers = peersInSegment(v.bodyStyle, currentKey)
  const targetPrice = budget ?? v.listing.price

  const scored = peers
    .map((p) => {
      const reliability = p.reliability ?? brandProfile(p.make).reliability
      // Price the peer at the same model year so the comparison is apples to apples.
      const price = estimatePeerPrice(p, v.year, v.mileage)
      return { profile: p, reliability, price }
    })
    // Only worth suggesting if it is clearly more dependable.
    .filter((c) => c.reliability >= currentReliability + 0.8)
    .filter((c) => {
      if (!targetPrice) return true
      // Within 25% of what they were going to spend — anything else is not an
      // alternative, it is a different budget.
      return c.price <= targetPrice * 1.25
    })
    .sort((a, b) => {
      // Prefer high reliability, then lower price.
      const relDiff = b.reliability - a.reliability
      if (Math.abs(relDiff) > 0.3) return relDiff
      return a.price - b.price
    })

  // One suggestion per brand, so the list is not three Toyotas.
  const seenBrands = new Set<string>()
  const picks: typeof scored = []
  for (const c of scored) {
    if (seenBrands.has(c.profile.make)) continue
    seenBrands.add(c.profile.make)
    picks.push(c)
    if (picks.length === 3) break
  }

  return picks.map((c) => ({
    year: v.year,
    make: titleCaseMake(c.profile.make),
    model: titleCaseModel(c.profile.model),
    approxPrice: Math.round(c.price / 250) * 250,
    reliabilityScore: Math.round(c.reliability * 10) / 10,
    reason: buildReason(c.profile, c.reliability, currentReliability, c.price, v.listing.price),
  }))
}

function estimatePeerPrice(p: ModelProfile, year: number, mileage: number): number {
  const brand = brandProfile(p.make)
  const segment = segmentProfile(p.bodyStyle)
  const msrp = (p.msrpRef ?? segment.msrpRef) * Math.pow(1.025, year - MSRP_REFERENCE_YEAR)
  const age = Math.max(0, new Date().getFullYear() - year)

  // Reuse the same retention curve rather than a second, inconsistent model.
  const pseudo = {
    brand,
    segment,
    model: p,
  } as unknown as ResolvedVehicle
  const value = msrp * retentionAtAge(pseudo, age)

  const expectedMiles = age * 12000
  const rate = Math.min(0.45, Math.max(0.03, value / 180000))
  return Math.max(900, value + (expectedMiles - mileage) * rate)
}

function buildReason(
  p: ModelProfile,
  reliability: number,
  currentReliability: number,
  price: number,
  currentPrice?: number,
): string {
  const gap = (reliability - currentReliability).toFixed(1)
  const parts: string[] = [`Rates ${gap} points higher on reliability (${reliability.toFixed(1)}/10)`]

  if (currentPrice && price < currentPrice * 0.95) {
    parts.push(`and typically sells for less at the same year and mileage`)
  } else if (currentPrice && price > currentPrice * 1.1) {
    parts.push(`though you would pay roughly $${Math.round(price - currentPrice).toLocaleString('en-US')} more up front`)
  } else {
    parts.push('at a comparable price')
  }

  if (!p.issues?.length) parts.push('with no major documented failure modes')

  return parts.join(', ') + '.'
}

function titleCaseMake(s: string): string {
  if (s === 'bmw' || s === 'gmc') return s.toUpperCase()
  return s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function titleCaseModel(s: string): string {
  return s
    .split(' ')
    .map((w) => (/^\d/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}
