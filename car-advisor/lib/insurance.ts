import type { BuyerProfile, InsuranceEstimate } from './types'
import { clamp } from './valuation'
import type { ResolvedVehicle } from './vehicle'

/**
 * Full-coverage premium estimate.
 *
 * This is a rating-factor model, not a quote. It multiplies a national base
 * premium by the factors carriers actually weight most heavily: driver age,
 * state, vehicle value and type, and driving record. It exists to set
 * expectations and to make the five-year cost honest — the product should hand
 * off to a real quote API for anything binding.
 */

/** Approximate national average annual full-coverage premium. */
const BASE_ANNUAL_PREMIUM = 2000

function ageFactor(age?: number): { factor: number; note: string } {
  if (age == null) return { factor: 1.0, note: 'Assumed a driver aged 30-50; premiums vary enormously by age.' }
  if (age < 20) return { factor: 2.4, note: 'Drivers under 20 pay roughly double to triple the average rate.' }
  if (age < 25) return { factor: 1.75, note: 'Drivers aged 20-24 pay a significant surcharge that drops sharply at 25.' }
  if (age < 30) return { factor: 1.2, note: 'Rates ease through the late twenties.' }
  if (age < 60) return { factor: 1.0, note: 'This is the lowest-rate age band.' }
  if (age < 70) return { factor: 1.05, note: 'Rates begin creeping up after 60.' }
  return { factor: 1.25, note: 'Rates rise again for drivers over 70.' }
}

function bodyStyleFactor(v: ResolvedVehicle): { factor: number; note?: string } {
  switch (v.bodyStyle) {
    case 'coupe':
    case 'convertible':
      return { factor: 1.18, note: 'Two-door and convertible body styles rate higher than their sedan equivalents.' }
    case 'truck':
      return { factor: 0.95, note: 'Trucks rate slightly below average on collision, above on liability.' }
    case 'minivan':
      return { factor: 0.88, note: 'Minivans are among the cheapest vehicles to insure.' }
    case 'suv-compact':
    case 'suv-midsize':
    case 'suv-large':
      return { factor: 0.95 }
    default:
      return { factor: 1.0 }
  }
}

export function estimateInsurance(
  v: ResolvedVehicle,
  vehicleValue: number,
  profile: BuyerProfile,
): InsuranceEstimate {
  const factors: string[] = []

  const age = ageFactor(profile.driverAge)
  factors.push(age.note)

  const geo = v.geo
  const stateName = v.state ?? profile.zip
  if (v.state) {
    const pct = Math.round((geo.insurance - 1) * 100)
    factors.push(
      pct === 0
        ? `${v.state} rates sit near the national average.`
        : `${v.state} rates run about ${Math.abs(pct)}% ${pct > 0 ? 'above' : 'below'} the national average.`,
    )
  } else {
    factors.push('No ZIP code was provided, so national average rates were used. Location can swing the premium by more than 50%.')
  }

  // Physical damage coverage scales with what the car is worth to replace.
  const valueFactor = clamp(0.55 + vehicleValue / 30000, 0.55, 2.2)
  factors.push(`Comprehensive and collision scale with the car's $${Math.round(vehicleValue).toLocaleString('en-US')} value.`)

  const body = bodyStyleFactor(v)
  if (body.note) factors.push(body.note)

  const brandFactor = v.brand.insuranceMultiplier
  if (brandFactor > 1.1) {
    factors.push(`${v.listing.make ?? 'This brand'} carries higher repair costs, which shows up in collision premiums.`)
  }

  const recordFactor = profile.cleanRecord === false ? 1.55 : 1.0
  if (profile.cleanRecord === false) {
    factors.push('A ticket or at-fault accident on record adds roughly 40-70%.')
  }

  // Very old, low-value cars are often insured liability-only.
  const oldCarFactor = v.age > 15 ? 0.8 : 1.0
  if (v.age > 15) {
    factors.push('At this age and value, dropping collision coverage is worth considering — it may cost more than the car is worth to replace.')
  }

  const annual =
    BASE_ANNUAL_PREMIUM *
    age.factor *
    geo.insurance *
    valueFactor *
    body.factor *
    brandFactor *
    recordFactor *
    oldCarFactor

  const monthly = annual / 12

  return {
    monthlyPoint: Math.round(monthly),
    monthlyLow: Math.round(monthly * 0.7),
    monthlyHigh: Math.round(monthly * 1.4),
    factors,
    disclaimer:
      'This is a modeled estimate from public rating factors, not a quote. Actual premiums depend on your carrier, credit-based insurance score, coverage limits, deductible, and household drivers.',
  }
}
