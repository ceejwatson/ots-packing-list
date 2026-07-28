import type { Negotiation, RedFlag, ReliabilityAssessment } from './types'
import type { ValuationDetail } from './valuation'
import type { ResolvedVehicle } from './vehicle'

/**
 * Turns the analysis into three numbers and a script. The numbers matter more
 * than the script: most people lose money because they never decided in advance
 * what they would pay and when they would leave.
 */
export function buildNegotiation(
  v: ResolvedVehicle,
  valuation: ValuationDetail,
  reliability: ReliabilityAssessment,
  redFlags: RedFlag[],
  immediateRepairEstimate: number,
): Negotiation {
  const asking = valuation.askingPrice ?? valuation.fairValue

  // Start from fair value, then subtract for problems the seller owns.
  let target = valuation.fairValue

  const seriousFlags = redFlags.filter((f) => f.severity === 'serious').length
  const cautionFlags = redFlags.filter((f) => f.severity === 'caution').length
  target -= valuation.fairValue * (seriousFlags * 0.06 + cautionFlags * 0.02)

  // Deferred maintenance and imminent known failures are money you will spend
  // in the first year. Roughly half of it is fair to push onto the price.
  target -= immediateRepairEstimate * 0.5

  // Floor the target so the advice stays credible. An offer far below any
  // defensible number gets a seller to stop replying, which costs the buyer the
  // car rather than saving them money. The walk-away price is where the
  // discipline belongs.
  target = Math.max(target, valuation.low * 0.9, valuation.fairValue * 0.82)
  target = Math.min(target, asking)

  const openingOffer = Math.max(valuation.low * 0.7, target * 0.93)
  const walkAway = Math.min(asking, valuation.fairValue * 1.03)

  const leverage: string[] = []
  if (valuation.deltaPercent != null && valuation.deltaPercent > 4) {
    leverage.push(
      `Comparable ${v.year} ${cap(v.listing.make)} ${cap(v.listing.model)} listings sit around $${valuation.fairValue.toLocaleString('en-US')} — this one is $${Math.round(valuation.deltaDollars ?? 0).toLocaleString('en-US')} above that.`,
    )
  }
  if (v.mileage > v.age * 12000 + 10000) {
    leverage.push(`At ${v.mileage.toLocaleString('en-US')} miles it is well above average for a ${v.year}, and that shows up directly in resale value.`)
  }
  for (const issue of reliability.commonIssues.filter((i) => i.severity === 'high').slice(0, 2)) {
    const cost = issue.estimatedRepairCost
    leverage.push(
      `${issue.component} problems are well documented on this model${cost ? `, and the repair runs $${cost[0].toLocaleString('en-US')}-$${cost[1].toLocaleString('en-US')}` : ''}. That risk belongs in the price.`,
    )
  }
  for (const flag of redFlags.filter((f) => f.severity !== 'info').slice(0, 3)) {
    leverage.push(flag.title)
  }
  if (v.listing.sellerType === 'private') {
    leverage.push('Private sellers usually care more about a fast, clean transaction than the last few hundred dollars. Cash in hand and a same-day pickup is worth real money to them.')
  }
  if (!leverage.length) {
    leverage.push('The price is already reasonable, so lead with a pre-purchase inspection rather than a lowball offer — you have more to gain from finding a problem than from haggling.')
  }

  const questions: string[] = [
    'Why are you selling it?',
    'Do you have maintenance records, and when was the last major service?',
    'Has it ever been in an accident, and has any bodywork been done?',
    'Is the title clean and in your name, and do you have it in hand?',
    'Are there any warning lights on now, or any that come and go?',
  ]

  if (v.listing.transmission === 'cvt' || reliability.commonIssues.some((i) => /transmission/i.test(i.component))) {
    questions.push('When was the transmission fluid last changed, and by whom?')
  }
  for (const issue of reliability.commonIssues.filter((i) => i.severity === 'high').slice(0, 2)) {
    questions.push(`This model is known for ${issue.component.toLowerCase()} trouble — has that been addressed on this one?`)
  }
  if (v.geo.saltBelt && v.age >= 8) {
    questions.push('Has it always been in this area, and has the underbody ever been treated for rust?')
  }
  if (v.fuelType === 'electric' || v.fuelType === 'hybrid') {
    questions.push('What is the current battery state of health, and has the pack ever been serviced or replaced?')
  }
  if (v.listing.sellerType === 'dealer') {
    questions.push('What is the out-the-door price, itemized, including every fee?')
  }
  questions.push('Would you be willing to let my mechanic inspect it before I buy?')

  return {
    targetOffer: roundTo(target, 50),
    openingOffer: roundTo(openingOffer, 50),
    walkAwayPrice: roundTo(walkAway, 50),
    leverage: leverage.slice(0, 5),
    questions: questions.slice(0, 9),
  }
}

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step
}

function cap(s?: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
