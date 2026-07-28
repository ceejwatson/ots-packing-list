import type { MaintenanceForecast, MaintenanceItem } from './types'
import type { ResolvedVehicle } from './vehicle'

export interface ForecastItem extends MaintenanceItem {
  /** Which line of the five-year cost table this belongs to. */
  bucket: 'maintenance' | 'tires' | 'repairs'
  atMileage: number
}

export interface Forecast extends MaintenanceForecast {
  items: ForecastItem[]
  totals: { maintenance: number; tires: number; repairs: number }
}

interface Interval {
  service: string
  everyMiles?: number
  everyYears?: number
  cost: number
  bucket: ForecastItem['bucket']
  kind: MaintenanceItem['kind']
  appliesTo?: (v: ResolvedVehicle) => boolean
}

const isEv = (v: ResolvedVehicle) => v.fuelType === 'electric'
const isCombustion = (v: ResolvedVehicle) => v.fuelType !== 'electric'

const INTERVALS: Interval[] = [
  { service: 'Oil and filter change', everyMiles: 7000, cost: 85, bucket: 'maintenance', kind: 'scheduled', appliesTo: isCombustion },
  { service: 'Engine air filter', everyMiles: 25000, cost: 45, bucket: 'maintenance', kind: 'scheduled', appliesTo: isCombustion },
  { service: 'Cabin air filter', everyMiles: 20000, cost: 40, bucket: 'maintenance', kind: 'scheduled' },
  { service: 'Tire rotation and alignment check', everyMiles: 15000, cost: 90, bucket: 'maintenance', kind: 'scheduled' },
  { service: 'Brake fluid flush', everyMiles: 45000, cost: 130, bucket: 'maintenance', kind: 'scheduled' },
  { service: 'Coolant service', everyMiles: 100000, cost: 180, bucket: 'maintenance', kind: 'scheduled' },
  { service: 'Spark plugs', everyMiles: 90000, cost: 320, bucket: 'maintenance', kind: 'scheduled', appliesTo: isCombustion },
  { service: 'Transmission fluid service', everyMiles: 60000, cost: 320, bucket: 'maintenance', kind: 'scheduled', appliesTo: (v) => isCombustion(v) && v.listing.transmission !== 'manual' },
  { service: 'Differential and transfer case fluid', everyMiles: 60000, cost: 260, bucket: 'maintenance', kind: 'scheduled', appliesTo: (v) => v.drivetrain === 'awd' || v.drivetrain === '4wd' },
  { service: 'Serpentine belt', everyMiles: 95000, cost: 220, bucket: 'maintenance', kind: 'wear', appliesTo: isCombustion },
  { service: '12V battery replacement', everyYears: 5, cost: 220, bucket: 'maintenance', kind: 'wear' },
  { service: 'Front brake pads and rotors', everyMiles: 55000, cost: 480, bucket: 'maintenance', kind: 'wear' },
  { service: 'Rear brake pads and rotors', everyMiles: 75000, cost: 440, bucket: 'maintenance', kind: 'wear' },
  { service: 'Tires (full set, mounted and balanced)', everyMiles: 45000, cost: 0, bucket: 'tires', kind: 'wear' },
  { service: 'Shocks and struts', everyMiles: 110000, cost: 1100, bucket: 'maintenance', kind: 'wear' },
  { service: 'Wiper blades and small consumables', everyYears: 1, cost: 55, bucket: 'maintenance', kind: 'scheduled' },
]

/**
 * Walks the next `years` of ownership mile by mile, firing each service interval
 * when the odometer or the calendar crosses it, then layers on the model's known
 * failure modes where their typical onset falls inside the window.
 */
export function forecastMaintenance(
  v: ResolvedVehicle,
  annualMiles: number,
  years = 5,
  reliabilityScore = 7,
): Forecast {
  const items: ForecastItem[] = []
  const startMiles = v.mileage

  for (const interval of INTERVALS) {
    if (interval.appliesTo && !interval.appliesTo(v)) continue

    const cost =
      interval.bucket === 'tires'
        ? Math.round(v.segment.tireSetCost * (isEv(v) ? 1.15 : 1))
        : Math.round(interval.cost * v.brand.costMultiplier)

    if (interval.everyMiles) {
      // EVs wear tires faster (weight and torque) but skip most engine services.
      const every = interval.bucket === 'tires' && isEv(v) ? interval.everyMiles * 0.8 : interval.everyMiles
      let next = Math.ceil((startMiles + 1) / every) * every
      while (next <= startMiles + annualMiles * years) {
        const year = Math.max(1, Math.ceil((next - startMiles) / annualMiles))
        items.push({ year, service: interval.service, estimatedCost: cost, kind: interval.kind, bucket: interval.bucket, atMileage: next })
        next += every
      }
    } else if (interval.everyYears) {
      for (let year = interval.everyYears; year <= years; year += interval.everyYears) {
        items.push({
          year,
          service: interval.service,
          estimatedCost: cost,
          kind: interval.kind,
          bucket: interval.bucket,
          atMileage: startMiles + annualMiles * year,
        })
      }
    }
  }

  // ---- Known failure modes that land inside the ownership window ----
  const endMiles = startMiles + annualMiles * years
  for (const issue of v.issues) {
    if (!issue.estimatedRepairCost) continue
    const [lo, hi] = issue.estimatedRepairCost
    if (hi <= 0) continue

    const onset = issue.typicalOnsetMiles
    const probability = issue.severity === 'high' ? 0.5 : issue.severity === 'medium' ? 0.3 : 0.15

    let year: number
    if (onset == null) {
      year = Math.min(years, 3)
    } else if (onset < startMiles) {
      // Already past the usual onset — either it was fixed or it is imminent.
      year = 1
    } else if (onset > endMiles) {
      continue
    } else {
      year = Math.max(1, Math.ceil((onset - startMiles) / annualMiles))
    }

    items.push({
      year,
      service: `${issue.component}: ${issue.description.split('.')[0]}`,
      estimatedCost: Math.round(((lo + hi) / 2) * probability),
      kind: 'likely-repair',
      bucket: 'repairs',
      atMileage: onset ?? startMiles + annualMiles * year,
    })
  }

  // ---- General unscheduled repair allowance ----
  // Everything not on a schedule and not a known defect: sensors, water pumps,
  // wheel bearings, a/c, suspension bushings. Scales with age and reliability.
  for (let year = 1; year <= years; year++) {
    const milesAtYear = startMiles + annualMiles * year
    const ageAtYear = v.age + year
    const wearFactor = Math.pow(milesAtYear / 100000, 1.4)
    const reliabilityFactor = (10 - reliabilityScore) / 4
    const allowance =
      220 * v.brand.costMultiplier * (0.5 + wearFactor) * (0.6 + reliabilityFactor) * (1 + Math.max(0, ageAtYear - 8) * 0.06)

    items.push({
      year,
      service: 'Unscheduled repair allowance',
      estimatedCost: Math.round(allowance),
      kind: 'likely-repair',
      bucket: 'repairs',
      atMileage: milesAtYear,
    })
  }

  items.sort((a, b) => a.year - b.year || a.service.localeCompare(b.service))

  const totals = { maintenance: 0, tires: 0, repairs: 0 }
  for (const item of items) totals[item.bucket] += item.estimatedCost

  return {
    items,
    totals,
    fiveYearTotal: totals.maintenance + totals.tires + totals.repairs,
  }
}
