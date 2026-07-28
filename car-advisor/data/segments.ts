import type { BodyStyle } from '@/lib/types'

export interface SegmentProfile {
  /** Representative base MSRP in the reference year (see MSRP_REFERENCE_YEAR). */
  msrpRef: number
  mpgCity: number
  mpgHighway: number
  seats: number
  /** Cost of a full set of tires, installed. */
  tireSetCost: number
  /** Extra depreciation/appreciation vs. the brand baseline. */
  retentionAdjust: number
  cargoRating: number // 1-10, rough usefulness for gear/road trips
}

export const MSRP_REFERENCE_YEAR = 2022

export const SEGMENTS: Record<BodyStyle, SegmentProfile> = {
  sedan: { msrpRef: 27000, mpgCity: 28, mpgHighway: 38, seats: 5, tireSetCost: 700, retentionAdjust: -0.02, cargoRating: 5 },
  coupe: { msrpRef: 32000, mpgCity: 24, mpgHighway: 33, seats: 4, tireSetCost: 900, retentionAdjust: -0.02, cargoRating: 3 },
  hatchback: { msrpRef: 25000, mpgCity: 29, mpgHighway: 37, seats: 5, tireSetCost: 650, retentionAdjust: 0, cargoRating: 6 },
  wagon: { msrpRef: 32000, mpgCity: 26, mpgHighway: 34, seats: 5, tireSetCost: 800, retentionAdjust: 0, cargoRating: 8 },
  'suv-compact': { msrpRef: 30000, mpgCity: 26, mpgHighway: 32, seats: 5, tireSetCost: 800, retentionAdjust: 0.03, cargoRating: 7 },
  'suv-midsize': { msrpRef: 38000, mpgCity: 21, mpgHighway: 28, seats: 7, tireSetCost: 950, retentionAdjust: 0.03, cargoRating: 8 },
  'suv-large': { msrpRef: 55000, mpgCity: 16, mpgHighway: 22, seats: 8, tireSetCost: 1200, retentionAdjust: 0.02, cargoRating: 9 },
  truck: { msrpRef: 42000, mpgCity: 18, mpgHighway: 24, seats: 5, tireSetCost: 1100, retentionAdjust: 0.06, cargoRating: 9 },
  minivan: { msrpRef: 38000, mpgCity: 19, mpgHighway: 28, seats: 8, tireSetCost: 850, retentionAdjust: -0.01, cargoRating: 10 },
  convertible: { msrpRef: 38000, mpgCity: 23, mpgHighway: 31, seats: 4, tireSetCost: 1000, retentionAdjust: -0.03, cargoRating: 2 },
  unknown: { msrpRef: 30000, mpgCity: 24, mpgHighway: 32, seats: 5, tireSetCost: 800, retentionAdjust: 0, cargoRating: 5 },
}

export function segmentProfile(body?: BodyStyle): SegmentProfile {
  return SEGMENTS[body ?? 'unknown'] ?? SEGMENTS.unknown
}
