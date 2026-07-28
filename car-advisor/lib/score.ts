import type { BuyScore, OwnershipCost, RedFlag, ReliabilityAssessment, ScoreBreakdownItem } from './types'
import { clamp, type ValuationDetail } from './valuation'
import type { ResolvedVehicle } from './vehicle'

/**
 * The Buy Score is a weighted sum of five things a buyer can verify. The
 * breakdown is always shown in the UI — a score nobody can audit is a score
 * nobody should trust.
 */
const WEIGHTS = {
  price: 30,
  reliability: 25,
  redFlags: 20,
  runningCost: 15,
  condition: 10,
}

/** Rough five-year cost-per-mile benchmark, excluding depreciation, by segment. */
const COST_BENCHMARK_PER_MILE = 0.42

export function computeBuyScore(
  v: ResolvedVehicle,
  valuation: ValuationDetail,
  reliability: ReliabilityAssessment,
  ownership: OwnershipCost,
  redFlags: RedFlag[],
): BuyScore {
  const breakdown: ScoreBreakdownItem[] = []
  const reasons: string[] = []
  const concerns: string[] = []

  // ---- Price ----
  let pricePoints: number
  let priceDetail: string
  if (valuation.deltaPercent == null) {
    pricePoints = WEIGHTS.price * 0.6
    priceDetail = 'No asking price was found, so this category was scored neutrally.'
  } else {
    const d = valuation.deltaPercent
    // -20% or better earns full marks; +25% earns none.
    pricePoints = clamp(WEIGHTS.price * (1 - (d + 20) / 45), 0, WEIGHTS.price)
    const dollars = Math.abs(Math.round(valuation.deltaDollars ?? 0)).toLocaleString('en-US')
    if (d <= -4) {
      priceDetail = `Listed about $${dollars} below the estimated fair value of $${valuation.fairValue.toLocaleString('en-US')}.`
      reasons.push(`Priced roughly $${dollars} below estimated market value`)
    } else if (d <= 6) {
      priceDetail = `Within a few hundred dollars of the estimated fair value of $${valuation.fairValue.toLocaleString('en-US')}.`
      reasons.push('Asking price is in line with market value')
    } else {
      priceDetail = `Listed about $${dollars} above the estimated fair value of $${valuation.fairValue.toLocaleString('en-US')}.`
      concerns.push(`Asking about $${dollars} over estimated market value`)
    }
  }
  breakdown.push({ label: 'Price vs. market', points: round1(pricePoints), max: WEIGHTS.price, detail: priceDetail })

  // ---- Reliability ----
  const reliabilityPoints = (reliability.score / 10) * WEIGHTS.reliability
  const highSeverityCount = reliability.commonIssues.filter((i) => i.severity === 'high').length
  breakdown.push({
    label: 'Reliability',
    points: round1(reliabilityPoints),
    max: WEIGHTS.reliability,
    detail: `Scored ${reliability.score}/10${highSeverityCount ? `, with ${highSeverityCount} well-documented major ${highSeverityCount === 1 ? 'failure mode' : 'failure modes'} for this year.` : ' with no major documented failure modes for this year.'}`,
  })
  if (reliability.score >= 8.5) reasons.push(`Strong reliability record (${reliability.score}/10)`)
  else if (reliability.score < 6.5) concerns.push(`Below-average reliability (${reliability.score}/10)`)

  // ---- Red flags ----
  const penalties = redFlags.reduce(
    (sum, f) => sum + (f.severity === 'serious' ? 8 : f.severity === 'caution' ? 2.5 : 0.5),
    0,
  )
  const redFlagPoints = clamp(WEIGHTS.redFlags - penalties, 0, WEIGHTS.redFlags)
  const seriousCount = redFlags.filter((f) => f.severity === 'serious').length
  breakdown.push({
    label: 'Red flags',
    points: round1(redFlagPoints),
    max: WEIGHTS.redFlags,
    detail: redFlags.length
      ? `${redFlags.length} ${redFlags.length === 1 ? 'flag' : 'flags'} raised${seriousCount ? `, ${seriousCount} serious` : ''}.`
      : 'Nothing in the listing raised a flag.',
  })
  if (!redFlags.length) reasons.push('No warning signs found in the listing')
  for (const f of redFlags.filter((f) => f.severity === 'serious').slice(0, 3)) concerns.push(f.title)

  // ---- Running cost ----
  const costPerMileExDep = ownership.totalExcludingDepreciation / (ownership.annualMiles * ownership.years)
  const costPoints = clamp(WEIGHTS.runningCost * (1.6 - costPerMileExDep / COST_BENCHMARK_PER_MILE), 0, WEIGHTS.runningCost)
  breakdown.push({
    label: 'Running costs',
    points: round1(costPoints),
    max: WEIGHTS.runningCost,
    detail: `About $${costPerMileExDep.toFixed(2)} per mile to run, before depreciation (typical is around $${COST_BENCHMARK_PER_MILE.toFixed(2)}).`,
  })
  if (costPerMileExDep < COST_BENCHMARK_PER_MILE * 0.85) reasons.push('Cheaper than average to run and insure')
  else if (costPerMileExDep > COST_BENCHMARK_PER_MILE * 1.25) concerns.push('Expensive to fuel, insure, and maintain')

  // ---- Condition proxy: age and mileage remaining ----
  // Most mainstream vehicles have a useful life around 200k miles and 18 years.
  const milesUsed = clamp(v.mileage / 200000, 0, 1)
  const yearsUsed = clamp(v.age / 18, 0, 1)
  const lifeUsed = Math.max(milesUsed, yearsUsed)
  const conditionPoints = WEIGHTS.condition * (1 - lifeUsed)
  breakdown.push({
    label: 'Life remaining',
    points: round1(conditionPoints),
    max: WEIGHTS.condition,
    detail: `${v.mileage.toLocaleString('en-US')} miles and ${v.age} ${v.age === 1 ? 'year' : 'years'} old — roughly ${Math.round(lifeUsed * 100)}% through a typical service life.`,
  })
  if (lifeUsed < 0.35) reasons.push('Plenty of service life left')
  else if (lifeUsed > 0.75) concerns.push('Near the end of its typical service life')

  const total = breakdown.reduce((s, b) => s + b.points, 0)
  const score = Math.round(clamp(total, 0, 100))

  const grade: BuyScore['grade'] =
    score >= 85 ? 'Excellent Buy' : score >= 70 ? 'Good Buy' : score >= 55 ? 'Fair' : score >= 40 ? 'Risky' : 'Avoid'

  return {
    score,
    grade,
    headline: headlineFor(score, grade, valuation),
    reasons: reasons.slice(0, 5),
    concerns: concerns.slice(0, 5),
    breakdown,
  }
}

function headlineFor(score: number, grade: BuyScore['grade'], valuation: ValuationDetail): string {
  const delta = valuation.deltaDollars
  if (grade === 'Excellent Buy') {
    return delta != null && delta < 0
      ? `Strong buy — priced about $${Math.abs(Math.round(delta)).toLocaleString('en-US')} under market with no serious concerns.`
      : 'Strong buy — the fundamentals check out.'
  }
  if (grade === 'Good Buy') return 'Worth pursuing, with a few things to verify before you commit.'
  if (grade === 'Fair') return 'Not a mistake, but not a bargain either. Negotiation matters here.'
  if (grade === 'Risky') return 'Proceed carefully — several factors work against this one.'
  return 'There are better uses for your money. Keep looking.'
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
