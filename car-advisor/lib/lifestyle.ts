import type { BuyerProfile, LifestyleFit, OwnershipCost } from './types'
import { clamp } from './valuation'
import type { ResolvedVehicle } from './vehicle'

/**
 * Scores how well the vehicle matches how the buyer actually lives. Skipped
 * entirely when the buyer has not answered any of the questions — a fabricated
 * 94% match is worse than no match score.
 */
export function scoreLifestyleFit(
  v: ResolvedVehicle,
  profile: BuyerProfile,
  ownership: OwnershipCost,
  askingPrice?: number,
): LifestyleFit | undefined {
  const answered = [
    profile.budget,
    profile.commuteMiles,
    profile.householdSize,
    profile.needsSnow,
    profile.needsTowing,
    profile.hasPets,
    profile.roadTrips,
    profile.drivingMix,
  ].some((x) => x !== undefined)

  if (!answered) return undefined

  const matches: string[] = []
  const mismatches: string[] = []
  let points = 0
  let possible = 0

  const award = (weight: number, ok: boolean, good: string, bad: string) => {
    possible += weight
    if (ok) {
      points += weight
      matches.push(good)
    } else {
      mismatches.push(bad)
    }
  }

  // ---- Budget ----
  if (profile.budget != null && askingPrice != null) {
    possible += 25
    if (askingPrice <= profile.budget) {
      points += 25
      matches.push(`Fits your $${profile.budget.toLocaleString('en-US')} budget with $${(profile.budget - askingPrice).toLocaleString('en-US')} left over for taxes, registration, and a pre-purchase inspection.`)
    } else {
      const over = askingPrice - profile.budget
      const overPct = over / profile.budget
      points += clamp(25 * (1 - overPct * 3), 0, 25)
      mismatches.push(`$${over.toLocaleString('en-US')} over your stated budget, before tax, title, and registration add another 8-10%.`)
    }
  }

  // ---- Commute and fuel ----
  if (profile.commuteMiles != null) {
    const annualCommute = profile.commuteMiles * 2 * 240
    const annualFuel = ownership.fuel / ownership.years
    possible += 20
    if (v.fuelType === 'electric') {
      points += profile.commuteMiles < 120 ? 20 : 12
      matches.push(`An EV suits a ${profile.commuteMiles}-mile commute well, as long as you can charge at home.`)
    } else if (v.mpgCombined >= 30) {
      points += 20
      matches.push(`${v.mpgCombined.toFixed(0)} mpg keeps your commute cheap — roughly $${Math.round(annualFuel).toLocaleString('en-US')} a year in fuel.`)
    } else if (v.mpgCombined >= 22) {
      points += 13
      matches.push(`${v.mpgCombined.toFixed(0)} mpg is reasonable for the commute, around $${Math.round(annualFuel).toLocaleString('en-US')} a year in fuel.`)
    } else {
      points += 4
      mismatches.push(`At ${v.mpgCombined.toFixed(0)} mpg, a ${profile.commuteMiles}-mile each-way commute costs around $${Math.round(annualFuel).toLocaleString('en-US')} a year in fuel alone.`)
      if (annualCommute > 20000) {
        mismatches.push('That mileage also pushes maintenance intervals and depreciation faster than the estimates above assume.')
      }
    }
  }

  // ---- Seats ----
  if (profile.householdSize != null) {
    const needed = profile.householdSize
    award(
      15,
      v.seats >= needed,
      `${v.seats} seats covers a household of ${needed}.`,
      `Only ${v.seats} seats for a household of ${needed}.`,
    )
    if (v.seats >= needed && needed >= 4 && v.segment.cargoRating < 6) {
      mismatches.push('Seats are there, but cargo space is tight once the family is in it.')
    }
  }

  // ---- Snow ----
  if (profile.needsSnow) {
    const hasAwd = v.drivetrain === 'awd' || v.drivetrain === '4wd'
    award(
      12,
      hasAwd || v.awdAvailable,
      hasAwd
        ? 'All-wheel drive handles snow well; a set of winter tires matters more than the drivetrain, but this is a good starting point.'
        : 'All-wheel drive is available on this model — confirm this specific car has it.',
      'Front-wheel drive only. It is manageable on winter tires, but not what you asked for.',
    )
  }

  // ---- Towing ----
  if (profile.needsTowing) {
    award(
      12,
      v.towingLbs >= 3500,
      `Rated to tow about ${v.towingLbs.toLocaleString('en-US')} lbs.`,
      `Only rated for about ${v.towingLbs.toLocaleString('en-US')} lbs of towing, which rules out most trailers and campers.`,
    )
  }

  // ---- Road trips ----
  if (profile.roadTrips) {
    const goodHighway = (v.listing.mpgHighway ?? v.segment.mpgHighway) >= 28
    possible += 8
    if (v.fuelType === 'electric') {
      points += 4
      mismatches.push('Long road trips in an EV mean planning around charging stops, which adds real time on unfamiliar routes.')
    } else if (goodHighway) {
      points += 8
      matches.push('Comfortable highway economy for long trips.')
    } else {
      points += 4
      mismatches.push('Highway fuel economy makes long trips noticeably more expensive.')
    }
  }

  // ---- Pets ----
  if (profile.hasPets) {
    award(
      8,
      v.segment.cargoRating >= 6,
      'Enough cargo area for a crate or a dog in back.',
      'Limited cargo area for pets — a crate will eat the trunk or a seat.',
    )
  }

  // ---- City vs highway ----
  if (profile.drivingMix === 'city') {
    possible += 8
    if (v.fuelType === 'hybrid' || v.fuelType === 'electric') {
      points += 8
      matches.push('Hybrids and EVs are at their best in city driving — regenerative braking means brakes last far longer too.')
    } else if (v.bodyStyle === 'suv-large' || v.bodyStyle === 'truck') {
      points += 2
      mismatches.push('A large body and low city mpg make this an expensive and awkward city vehicle.')
    } else {
      points += 6
    }
  } else if (profile.drivingMix === 'highway') {
    possible += 8
    points += v.fuelType === 'electric' ? 4 : 7
    if (v.fuelType !== 'electric') matches.push('Highway-dominant driving is the easiest life a car can have — expect better than average wear.')
  }

  const score = possible > 0 ? Math.round((points / possible) * 100) : 0

  return { score, matches, mismatches }
}
