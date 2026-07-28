import type { Listing, Valuation } from './types'
import { AVERAGE_ANNUAL_MILES, resolveVehicle, type ResolvedVehicle } from './vehicle'

/**
 * Transparent depreciation model.
 *
 * Every used-car value is original MSRP run through three adjustments the buyer
 * can actually check: age, mileage versus expected, and condition/title. No
 * black box, and no number invented by a language model — the model writes the
 * explanation, this file produces the dollars.
 *
 * Accuracy target for the MVP is roughly ±10% on mainstream vehicles. See
 * DESIGN.md for how to replace this with real transaction comps.
 */

/** Absolute floor: even a rough runner is worth scrap plus parts. */
const SCRAP_FLOOR = 900

/** Fraction of MSRP lost the moment the car leaves the lot, before time decay. */
function firstYearDrop(v: ResolvedVehicle): number {
  const adjust = (v.model?.retentionAdjust ?? 0) + v.segment.retentionAdjust
  return clamp(0.19 - adjust * 0.6, 0.07, 0.3)
}

/** Share of original MSRP retained at a given age, before mileage effects. */
export function retentionAtAge(v: ResolvedVehicle, age: number): number {
  if (age <= 0) return 1
  const r1 = 1 - firstYearDrop(v)
  const r5 = clamp(v.brand.retention5yr + (v.model?.retentionAdjust ?? 0) + v.segment.retentionAdjust, 0.2, 0.85)

  // Solve the constant-rate decay that takes r1 at age 1 to r5 at age 5.
  const k = Math.log(r1 / Math.min(r5, r1 - 0.01)) / 4

  if (age <= 5) return r1 * Math.exp(-k * (age - 1))

  // Past five years the curve flattens hard. A car that shed 12% a year from
  // new does not keep doing that forever — it converges on use value, which is
  // set by what a running car is worth to someone who needs transportation.
  // Extending the early-years rate here was the single biggest source of
  // undervaluation in testing: it priced a clean 11-year-old sedan at scrap.
  const flattening = 0.3
  const beyond = age - 5
  const decayed = r5 * Math.exp(-k * flattening * beyond)

  // Floor at 8% of original MSRP. Below that, condition and mileage decide the
  // price, not the depreciation curve.
  return Math.max(decayed, 0.08)
}

/**
 * Dollars per mile of deviation from expected mileage. Expensive cars lose more
 * per mile; the rate is capped so a cheap car with high miles doesn't go to zero.
 */
function perMileRate(baselineValue: number): number {
  return clamp(baselineValue / 180000, 0.03, 0.45)
}

/**
 * The mileage adjustment is deliberately asymmetric, because the market is.
 *
 * High mileage scares buyers and is priced in aggressively. Low mileage earns a
 * premium, but a bounded one — nobody pays 2021 money for a 2018 car just
 * because it sat in a garage. A symmetric curve made an 8-year-old car with
 * 60k miles worth more than a 5-year-old car with the same 60k, which is wrong.
 */
function mileageAdjustment(baselineValue: number, milesDelta: number): number {
  const rate = perMileRate(baselineValue)
  if (milesDelta <= 0) {
    // Above expected mileage: full rate, capped at a 30% haircut.
    return clamp(milesDelta * rate, -baselineValue * 0.3, 0)
  }
  // Below expected mileage: discounted rate, capped at a 12% premium.
  return clamp(milesDelta * rate * 0.6, 0, baselineValue * 0.12)
}

/**
 * Trim premium over the base-trim MSRP the catalog stores.
 *
 * Most used listings are not stripped base models, so pricing everything as a
 * base trim undervalued optioned cars by 10-15% across the board. This is a
 * coarse correction — the right fix is a real trim-level MSRP table.
 */
function trimMultiplier(trim?: string): { factor: number; label?: string } {
  if (!trim) return { factor: 1 }
  const t = trim.toLowerCase()
  if (/platinum|denali|high country|limited|touring|lariat|ltz|titanium|summit|king ranch|calligraphy|ex-l|trailhawk/.test(t)) {
    return { factor: 1.14, label: 'top' }
  }
  if (/xle|xlt|xse|sel|sr5|premium|latitude|s-line|\bex\b|\blt\b|\bsport\b/.test(t)) {
    return { factor: 1.07, label: 'mid' }
  }
  return { factor: 1 }
}

/**
 * Condition disclosed in the seller's own words. A car described as a mechanic
 * special is not worth book value, and treating it as if it were produced the
 * absurd result of calling a failing-transmission Focus "below market".
 */
function disclosedConditionMultiplier(text: string): { factor: number; reason?: string } {
  if (/\b(does ?n'?t run|won'?t start|no start|not running|needs? (an )?(engine|transmission)|for parts|parts car)\b/i.test(text)) {
    return { factor: 0.45, reason: 'The seller describes it as not running or needing a major driveline repair.' }
  }
  if (/\b(mechanic'?s? special|needs? work|project car|as[- ]is)\b/i.test(text)) {
    return { factor: 0.7, reason: 'The seller describes it as a project or as needing work.' }
  }
  if (/\b(transmission|engine)\b[^.]{0,40}\b(shudder|slip|jerk|hesitat|knock|tick|whine)/i.test(text)) {
    return { factor: 0.68, reason: 'The seller discloses driveline symptoms, which is the most expensive category of used-car problem.' }
  }
  if (/\b(check engine|engine light|service engine soon)\b/i.test(text)) {
    return { factor: 0.9, reason: 'A lit check engine light is disclosed, and the cause is unknown until the code is read.' }
  }
  return { factor: 1 }
}

export interface ValuationDetail extends Valuation {
  /** Value with no mileage or condition adjustment; used for the 5-year forecast. */
  baselineValue: number
  mileageAdjustment: number
  conditionAdjustment: number
}

export function estimateValue(listing: Listing, resolved?: ResolvedVehicle): ValuationDetail {
  const v = resolved ?? resolveVehicle(listing)
  const basis: string[] = []

  const trim = trimMultiplier(listing.trim)
  const msrp = v.originalMsrp * trim.factor

  const retention = retentionAtAge(v, v.age)
  let value = msrp * retention
  basis.push(
    `Started from an estimated $${fmt(msrp)} original MSRP${trim.label ? ` for the ${listing.trim} trim` : ''} and applied ${Math.round((1 - retention) * 100)}% depreciation over ${v.age} ${v.age === 1 ? 'year' : 'years'}.`,
  )

  const baselineValue = value

  // ---- Mileage ----
  const expectedMiles = v.age * AVERAGE_ANNUAL_MILES
  const milesDelta = expectedMiles - v.mileage // positive means below average
  const mileageAdj = mileageAdjustment(baselineValue, milesDelta)
  value += mileageAdj

  if (v.mileageIsEstimated) {
    basis.push('Mileage was not stated, so no mileage adjustment was applied. Treat this estimate as provisional.')
  } else if (Math.abs(milesDelta) > 8000) {
    const dir = milesDelta > 0 ? 'below' : 'above'
    basis.push(
      `At ${fmt(v.mileage)} miles it is ${fmt(Math.abs(milesDelta))} ${dir} the ${fmt(expectedMiles)} expected for its age, worth ${mileageAdj >= 0 ? '+' : '-'}$${fmt(Math.abs(mileageAdj))}.`,
    )
  } else {
    basis.push(`Mileage of ${fmt(v.mileage)} is close to average for a ${v.year}.`)
  }

  // ---- Title and history ----
  const beforeCondition = value
  const title = listing.titleStatus ?? 'unknown'
  const titleMultipliers: Record<string, number> = {
    salvage: 0.55,
    rebuilt: 0.68,
    flood: 0.5,
    lemon: 0.75,
    clean: 1,
    unknown: 1,
  }
  const titleMult = titleMultipliers[title] ?? 1
  if (titleMult !== 1) {
    value *= titleMult
    basis.push(
      `A ${title} title cuts resale value by roughly ${Math.round((1 - titleMult) * 100)}% and makes financing and insurance harder to obtain.`,
    )
  }

  const accidents = listing.accidentsReported ?? 0
  if (accidents > 0) {
    const accidentMult = Math.max(0.78, 1 - 0.08 * accidents)
    value *= accidentMult
    basis.push(`${accidents} reported ${accidents === 1 ? 'accident' : 'accidents'} reduce value by about ${Math.round((1 - accidentMult) * 100)}%.`)
  }

  if ((listing.ownerCount ?? 0) >= 4) {
    value *= 0.96
    basis.push('Four or more previous owners is a modest drag on resale value.')
  }

  const disclosed = disclosedConditionMultiplier(
    [listing.rawText, listing.description].filter(Boolean).join('\n'),
  )
  if (disclosed.factor !== 1) {
    value *= disclosed.factor
    basis.push(
      `${disclosed.reason} That cuts what it is worth by about ${Math.round((1 - disclosed.factor) * 100)}% against a sound example.`,
    )
  }

  const conditionAdjustment = value - beforeCondition

  // ---- Channel ----
  // A dealer's fair asking price sits above a private-party price: they
  // recondition, warranty, and finance. Comparing a dealer listing to a
  // private-party number would flag every dealer car as overpriced.
  if (listing.sellerType === 'dealer') {
    value *= 1.08
    basis.push('Adjusted up 8% because this is a dealer listing — dealer retail prices legitimately run above private-party prices.')
  }

  value = Math.max(value, SCRAP_FLOOR)

  // ---- Confidence and range ----
  let confidence: Valuation['confidence'] = 'high'
  if (!v.model) confidence = 'medium'
  if (v.mileageIsEstimated || !listing.year || !listing.make || !listing.model) confidence = 'low'

  // Ranges are deliberately wide. This model has not been calibrated against
  // real transaction data yet (see DESIGN.md, "Calibration"), and spot checks
  // suggest it reads conservative on late-model mainstream vehicles. Showing a
  // tight band around an uncalibrated point estimate would be false precision.
  const spread = confidence === 'high' ? 0.1 : confidence === 'medium' ? 0.14 : 0.2
  const fairValue = Math.round(value / 50) * 50
  const low = Math.round((value * (1 - spread)) / 50) * 50
  const high = Math.round((value * (1 + spread)) / 50) * 50

  // ---- Verdict ----
  const askingPrice = listing.price
  let verdict: Valuation['verdict'] = 'unknown'
  let deltaDollars: number | undefined
  let deltaPercent: number | undefined

  if (askingPrice && askingPrice > 0) {
    deltaDollars = askingPrice - fairValue
    deltaPercent = (deltaDollars / fairValue) * 100
    if (deltaPercent <= -12) verdict = 'great-deal'
    else if (deltaPercent <= -4) verdict = 'below-market'
    else if (deltaPercent <= 6) verdict = 'fair'
    else if (deltaPercent <= 18) verdict = 'above-market'
    else verdict = 'overpriced'
  }

  return {
    askingPrice,
    fairValue,
    low,
    high,
    deltaDollars,
    deltaPercent,
    verdict,
    basis,
    confidence,
    baselineValue,
    mileageAdjustment: mileageAdj,
    conditionAdjustment,
  }
}

/**
 * Projected resale value after N more years of ownership, used for the
 * depreciation line of the five-year cost. Runs the same curve forward and
 * applies the same title/accident haircuts.
 */
export function projectFutureValue(
  v: ResolvedVehicle,
  currentValuation: ValuationDetail,
  yearsAhead: number,
  annualMiles: number,
): number {
  const futureAge = v.age + yearsAhead
  // Same trim-adjusted basis as the current valuation, so the depreciation line
  // of the five-year cost is consistent with the value shown above it.
  const msrp = v.originalMsrp * trimMultiplier(v.listing.trim).factor
  const futureBaseline = msrp * retentionAtAge(v, futureAge)

  const futureMiles = v.mileage + annualMiles * yearsAhead
  const expected = futureAge * AVERAGE_ANNUAL_MILES
  const mileageAdj = mileageAdjustment(futureBaseline, expected - futureMiles)

  // Carry forward the proportional condition haircut from the current valuation.
  const conditionRatio =
    currentValuation.baselineValue > 0
      ? (currentValuation.baselineValue + currentValuation.conditionAdjustment) / currentValuation.baselineValue
      : 1

  return Math.max(SCRAP_FLOOR, (futureBaseline + mileageAdj) * conditionRatio)
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}
