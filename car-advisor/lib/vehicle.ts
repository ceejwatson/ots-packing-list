import { brandProfile, type BrandProfile } from '@/data/brands'
import { findModel, issuesForYear, type CatalogIssue, type ModelProfile } from '@/data/models'
import { MSRP_REFERENCE_YEAR, segmentProfile, type SegmentProfile } from '@/data/segments'
import { stateFactors, stateFromZip, type StateFactors } from '@/data/geo'
import type { BodyStyle, Drivetrain, FuelType, Listing } from './types'

/** The current year, used for age math. Kept in one place so tests can stub it. */
export function currentYear(): number {
  return new Date().getFullYear()
}

/**
 * A listing merged with catalog and segment defaults. Every downstream model
 * reads this instead of the raw listing, so a sparse listing still produces a
 * complete (if lower-confidence) report.
 */
export interface ResolvedVehicle {
  listing: Listing
  brand: BrandProfile
  segment: SegmentProfile
  model?: ModelProfile
  bodyStyle: BodyStyle
  drivetrain: Drivetrain
  fuelType: FuelType
  year: number
  age: number
  mileage: number
  mileageIsEstimated: boolean
  mpgCombined: number
  seats: number
  awdAvailable: boolean
  towingLbs: number
  issues: CatalogIssue[]
  state?: string
  geo: StateFactors
  /** Original base MSRP for this model year, inflation-adjusted. */
  originalMsrp: number
  /** How much of the report rests on defaults rather than listing facts. */
  dataGaps: string[]
}

/** New-car price drift per year, applied to the reference-year MSRP. */
const MSRP_INFLATION = 0.025
const AVERAGE_ANNUAL_MILES = 12000

export function resolveVehicle(listing: Listing): ResolvedVehicle {
  const gaps: string[] = []

  const model = findModel(listing.make, listing.model)
  const brand = brandProfile(listing.make)
  const bodyStyle: BodyStyle = listing.bodyStyle ?? model?.bodyStyle ?? 'unknown'
  const segment = segmentProfile(bodyStyle)

  if (!listing.make || !listing.model) gaps.push('Make or model was not identified, so brand-level averages were used.')
  else if (!model) gaps.push(`No catalog entry for the ${listing.make} ${listing.model}; segment averages were used for specs and known issues.`)
  if (bodyStyle === 'unknown') gaps.push('Body style is unknown, which widens the value range.')

  const year = listing.year ?? currentYear() - 6
  if (!listing.year) gaps.push('Model year was not found; assumed a six-year-old vehicle.')

  const age = Math.max(0, currentYear() - year)

  const mileageIsEstimated = listing.mileage == null
  const mileage = listing.mileage ?? Math.round(age * AVERAGE_ANNUAL_MILES)
  if (mileageIsEstimated) gaps.push('Mileage was not listed; assumed 12,000 miles per year. This is the single biggest driver of value, so confirm it.')

  const fuelType: FuelType = listing.fuelType ?? model?.fuelType ?? 'gas'
  const drivetrain: Drivetrain =
    listing.drivetrain ?? model?.drivetrain ?? (model?.awdAvailable ? 'unknown' : 'fwd')

  const mpgCity = listing.mpgCity ?? model?.mpgCity ?? segment.mpgCity
  const mpgHighway = listing.mpgHighway ?? model?.mpgHighway ?? segment.mpgHighway
  // EPA's 55/45 city/highway weighting.
  const mpgCombined = 1 / (0.55 / mpgCity + 0.45 / mpgHighway)

  const state = listing.state ?? stateFromZip(listing.zip)
  const geo = stateFactors(state)

  const refMsrp = model?.msrpRef ?? segment.msrpRef
  const originalMsrp = Math.round(refMsrp * Math.pow(1 + MSRP_INFLATION, year - MSRP_REFERENCE_YEAR))

  return {
    listing,
    brand,
    segment,
    model,
    bodyStyle,
    drivetrain,
    fuelType,
    year,
    age,
    mileage,
    mileageIsEstimated,
    mpgCombined,
    seats: listing.seats ?? model?.seats ?? segment.seats,
    awdAvailable: model?.awdAvailable ?? ['suv-compact', 'suv-midsize', 'suv-large', 'truck'].includes(bodyStyle),
    towingLbs: model?.towingLbs ?? (bodyStyle === 'truck' ? 7000 : bodyStyle === 'suv-large' ? 6000 : 1000),
    issues: issuesForYear(model, year),
    state,
    geo,
    originalMsrp,
    dataGaps: gaps,
  }
}

export function vehicleName(listing: Listing): string {
  const parts = [listing.year, listing.make, listing.model, listing.trim].filter(Boolean)
  return parts.length ? parts.join(' ') : 'this vehicle'
}

export function titleCase(s?: string): string | undefined {
  if (!s) return s
  return s
    .split(' ')
    .map((w) => (w.length <= 3 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

export { AVERAGE_ANNUAL_MILES }
