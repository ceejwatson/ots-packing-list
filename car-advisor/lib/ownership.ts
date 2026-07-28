import { BASE_FUEL_PRICE, BASE_KWH_PRICE } from '@/data/geo'
import type { BuyerProfile, InsuranceEstimate, OwnershipCost } from './types'
import { projectFutureValue, type ValuationDetail } from './valuation'
import { AVERAGE_ANNUAL_MILES, type ResolvedVehicle } from './vehicle'
import type { Forecast } from './maintenance'

const YEARS = 5

export function computeOwnershipCost(
  v: ResolvedVehicle,
  valuation: ValuationDetail,
  insurance: InsuranceEstimate,
  forecast: Forecast,
  profile: BuyerProfile,
): OwnershipCost {
  const annualMiles = profile.annualMiles ?? AVERAGE_ANNUAL_MILES
  const assumptions: string[] = []

  assumptions.push(`${annualMiles.toLocaleString('en-US')} miles driven per year over ${YEARS} years.`)

  // ---- Fuel / energy ----
  let fuel: number
  if (v.fuelType === 'electric') {
    // mpgCombined holds MPGe for EVs; 33.7 kWh carries the energy of a gallon.
    const kwhPerMile = 33.7 / v.mpgCombined
    const price = BASE_KWH_PRICE * (0.85 + v.geo.fuel * 0.15)
    fuel = kwhPerMile * annualMiles * YEARS * price
    assumptions.push(`Charging at $${price.toFixed(2)}/kWh and ${(kwhPerMile * 100).toFixed(0)} kWh per 100 miles. Home charging is assumed; public DC fast charging can double this.`)
  } else {
    const premiumFuel = v.brand.luxury || /turbo|ecoboost|tsi|tfsi/.test((v.listing.engine ?? '').toLowerCase())
    const pricePerGallon = BASE_FUEL_PRICE * v.geo.fuel * (premiumFuel ? 1.15 : 1) * (v.fuelType === 'diesel' ? 1.12 : 1)
    fuel = (annualMiles / v.mpgCombined) * YEARS * pricePerGallon
    assumptions.push(
      `${v.mpgCombined.toFixed(0)} mpg combined at $${pricePerGallon.toFixed(2)}/gallon${premiumFuel ? ' (premium fuel)' : ''}.`,
    )
  }

  // ---- Insurance ----
  const insuranceTotal = insurance.monthlyPoint * 12 * YEARS
  assumptions.push(`Full-coverage insurance at $${insurance.monthlyPoint}/month.`)

  // ---- Maintenance, tires, repairs ----
  const { maintenance, tires, repairs } = forecast.totals
  assumptions.push('Maintenance and repairs use independent-shop labor rates, not dealer rates.')

  // ---- Registration and fees ----
  const avgValue = (valuation.fairValue + projectFutureValue(v, valuation, YEARS, annualMiles)) / 2
  const registration = (v.geo.registrationFlat + avgValue * v.geo.registrationValueRate) * YEARS
  assumptions.push(
    v.state
      ? `${v.state} registration and property tax, estimated on the vehicle's declining value.`
      : 'Registration estimated at national average rates.',
  )

  // ---- Depreciation ----
  const futureValue = projectFutureValue(v, valuation, YEARS, annualMiles)
  const startingBasis = valuation.askingPrice ?? valuation.fairValue
  const depreciation = Math.max(0, startingBasis - futureValue)
  assumptions.push(
    `Depreciation is the purchase price minus an estimated $${Math.round(futureValue).toLocaleString('en-US')} resale value at ${(v.mileage + annualMiles * YEARS).toLocaleString('en-US')} miles. You only pay it if you sell.`,
  )

  const totalExcludingDepreciation = fuel + insuranceTotal + maintenance + repairs + tires + registration
  const total = totalExcludingDepreciation + depreciation

  return {
    years: YEARS,
    annualMiles,
    fuel: Math.round(fuel),
    insurance: Math.round(insuranceTotal),
    maintenance: Math.round(maintenance),
    repairs: Math.round(repairs),
    tires: Math.round(tires),
    registration: Math.round(registration),
    depreciation: Math.round(depreciation),
    total: Math.round(total),
    totalExcludingDepreciation: Math.round(totalExcludingDepreciation),
    costPerMile: total / (annualMiles * YEARS),
    assumptions,
  }
}
