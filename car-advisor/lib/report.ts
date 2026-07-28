import { randomUUID } from 'crypto'
import { findAlternatives } from './alternatives'
import { estimateInsurance } from './insurance'
import { scoreLifestyleFit } from './lifestyle'
import { forecastMaintenance } from './maintenance'
import { buildNegotiation } from './negotiation'
import { computeOwnershipCost } from './ownership'
import { detectRedFlags } from './redflags'
import { assessReliability } from './reliability'
import { computeBuyScore } from './score'
import { writeSummary } from './narrative'
import type { BuyerProfile, Listing, Report } from './types'
import { estimateValue } from './valuation'
import { AVERAGE_ANNUAL_MILES, resolveVehicle } from './vehicle'

/**
 * Runs the whole analysis. The order matters: value feeds the score and the
 * negotiation targets, reliability feeds the repair forecast, and the forecast
 * feeds the ownership cost. Nothing here calls a model — the narrative is
 * layered on afterwards and cannot change any number.
 */
export async function buildReport(
  listing: Listing,
  profile: BuyerProfile = {},
  opts: { withNarrative?: boolean } = {},
): Promise<Report> {
  // Buyer-supplied location beats whatever was scraped from the listing, since
  // insurance and registration are charged where the buyer lives.
  const effectiveListing: Listing = { ...listing, zip: profile.zip ?? listing.zip }

  const v = resolveVehicle(effectiveListing)
  const annualMiles = profile.annualMiles ?? AVERAGE_ANNUAL_MILES

  const valuation = estimateValue(effectiveListing, v)
  const reliability = assessReliability(v)
  const forecast = forecastMaintenance(v, annualMiles, 5, reliability.score)
  const insurance = estimateInsurance(v, valuation.fairValue, profile)
  const ownership = computeOwnershipCost(v, valuation, insurance, forecast, profile)
  const redFlags = detectRedFlags(effectiveListing, v, valuation)
  const buyScore = computeBuyScore(v, valuation, reliability, ownership, redFlags)

  const firstYearRepairs = forecast.items
    .filter((i) => i.year === 1 && i.bucket !== 'maintenance')
    .reduce((sum, i) => sum + i.estimatedCost, 0)

  const negotiation = buildNegotiation(v, valuation, reliability, redFlags, firstYearRepairs)
  const lifestyle = scoreLifestyleFit(v, profile, ownership, effectiveListing.price)

  // Alternatives are only useful when this vehicle has a real weakness.
  const alternatives =
    reliability.score < 8 || buyScore.score < 72
      ? findAlternatives(v, reliability.score, profile.budget ?? effectiveListing.price)
      : []

  const dataNotes = [...v.dataGaps]
  if (valuation.confidence !== 'high') {
    dataNotes.push(
      `Value estimate confidence is ${valuation.confidence}. Every dollar figure here is a model, not a quote — treat the ranges as ranges.`,
    )
  }
  if (effectiveListing.missingCriticalFields?.length) {
    dataNotes.push(
      `The listing did not state: ${effectiveListing.missingCriticalFields.join(', ')}. Ask the seller and re-run for a sharper answer.`,
    )
  }

  const report: Report = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    listing: effectiveListing,
    profile,
    buyScore,
    valuation,
    reliability,
    ownership,
    insurance,
    maintenance: { items: forecast.items, fiveYearTotal: forecast.fiveYearTotal },
    redFlags,
    negotiation,
    lifestyle,
    alternatives,
    dataNotes,
  }

  if (opts.withNarrative !== false) {
    report.summary = await writeSummary(report)
  }

  return report
}
