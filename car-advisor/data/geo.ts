/**
 * Location factors. ZIP is resolved to a state by prefix range — enough
 * precision for insurance, fuel, and registration estimates, and it avoids
 * shipping a full ZIP database. Swap in a real ZIP dataset when you want
 * county-level insurance territory accuracy.
 */

interface ZipRange {
  from: number
  to: number
  state: string
}

const ZIP_RANGES: ZipRange[] = [
  { from: 10, to: 27, state: 'MA' }, { from: 28, to: 29, state: 'RI' },
  { from: 30, to: 38, state: 'NH' }, { from: 39, to: 49, state: 'ME' },
  { from: 50, to: 59, state: 'VT' }, { from: 60, to: 69, state: 'CT' },
  { from: 70, to: 89, state: 'NJ' }, { from: 100, to: 149, state: 'NY' },
  { from: 150, to: 196, state: 'PA' }, { from: 197, to: 199, state: 'DE' },
  { from: 200, to: 200, state: 'DC' }, { from: 201, to: 201, state: 'VA' },
  { from: 202, to: 205, state: 'DC' }, { from: 206, to: 219, state: 'MD' },
  { from: 220, to: 246, state: 'VA' }, { from: 247, to: 268, state: 'WV' },
  { from: 270, to: 289, state: 'NC' }, { from: 290, to: 299, state: 'SC' },
  { from: 300, to: 319, state: 'GA' }, { from: 320, to: 349, state: 'FL' },
  { from: 350, to: 369, state: 'AL' }, { from: 370, to: 385, state: 'TN' },
  { from: 386, to: 397, state: 'MS' }, { from: 398, to: 399, state: 'GA' },
  { from: 400, to: 427, state: 'KY' }, { from: 430, to: 459, state: 'OH' },
  { from: 460, to: 479, state: 'IN' }, { from: 480, to: 499, state: 'MI' },
  { from: 500, to: 528, state: 'IA' }, { from: 530, to: 549, state: 'WI' },
  { from: 550, to: 567, state: 'MN' }, { from: 570, to: 577, state: 'SD' },
  { from: 580, to: 588, state: 'ND' }, { from: 590, to: 599, state: 'MT' },
  { from: 600, to: 629, state: 'IL' }, { from: 630, to: 658, state: 'MO' },
  { from: 660, to: 679, state: 'KS' }, { from: 680, to: 693, state: 'NE' },
  { from: 700, to: 714, state: 'LA' }, { from: 716, to: 729, state: 'AR' },
  { from: 730, to: 749, state: 'OK' }, { from: 750, to: 799, state: 'TX' },
  { from: 800, to: 816, state: 'CO' }, { from: 820, to: 831, state: 'WY' },
  { from: 832, to: 838, state: 'ID' }, { from: 840, to: 847, state: 'UT' },
  { from: 850, to: 865, state: 'AZ' }, { from: 870, to: 884, state: 'NM' },
  { from: 885, to: 885, state: 'TX' }, { from: 889, to: 898, state: 'NV' },
  { from: 900, to: 961, state: 'CA' }, { from: 967, to: 968, state: 'HI' },
  { from: 970, to: 979, state: 'OR' }, { from: 980, to: 994, state: 'WA' },
  { from: 995, to: 999, state: 'AK' },
]

export function stateFromZip(zip?: string): string | undefined {
  if (!zip) return undefined
  const digits = zip.trim().slice(0, 5)
  if (!/^\d{5}$/.test(digits)) return undefined
  const prefix = parseInt(digits.slice(0, 3), 10)
  return ZIP_RANGES.find((r) => prefix >= r.from && prefix <= r.to)?.state
}

export interface StateFactors {
  /** Multiplier on the national average full-coverage premium. */
  insurance: number
  /** Multiplier on the national average pump price. */
  fuel: number
  /** Annual registration: either a flat fee or a percentage of vehicle value. */
  registrationFlat: number
  registrationValueRate: number
  /** Road salt use — drives rust risk on used cars. */
  saltBelt?: boolean
  /** States that repeatedly produce flood-damaged vehicles after major storms. */
  floodRisk?: boolean
}

const DEFAULT_STATE: StateFactors = { insurance: 1.0, fuel: 1.0, registrationFlat: 120, registrationValueRate: 0 }

export const STATES: Record<string, StateFactors> = {
  AK: { insurance: 0.85, fuel: 1.08, registrationFlat: 100, registrationValueRate: 0, saltBelt: true },
  AL: { insurance: 0.9, fuel: 0.93, registrationFlat: 90, registrationValueRate: 0, floodRisk: true },
  AR: { insurance: 0.95, fuel: 0.94, registrationFlat: 85, registrationValueRate: 0 },
  AZ: { insurance: 1.05, fuel: 1.08, registrationFlat: 60, registrationValueRate: 0.008 },
  CA: { insurance: 1.15, fuel: 1.35, registrationFlat: 110, registrationValueRate: 0.0065 },
  CO: { insurance: 1.2, fuel: 1.0, registrationFlat: 90, registrationValueRate: 0.008, saltBelt: true },
  CT: { insurance: 1.1, fuel: 1.08, registrationFlat: 120, registrationValueRate: 0.004, saltBelt: true },
  DC: { insurance: 1.15, fuel: 1.1, registrationFlat: 145, registrationValueRate: 0, saltBelt: true },
  DE: { insurance: 1.2, fuel: 1.0, registrationFlat: 100, registrationValueRate: 0, saltBelt: true },
  FL: { insurance: 1.45, fuel: 1.0, registrationFlat: 225, registrationValueRate: 0, floodRisk: true },
  GA: { insurance: 1.1, fuel: 0.95, registrationFlat: 80, registrationValueRate: 0, floodRisk: true },
  HI: { insurance: 0.7, fuel: 1.4, registrationFlat: 150, registrationValueRate: 0 },
  IA: { insurance: 0.75, fuel: 0.95, registrationFlat: 110, registrationValueRate: 0.005, saltBelt: true },
  ID: { insurance: 0.75, fuel: 1.05, registrationFlat: 80, registrationValueRate: 0, saltBelt: true },
  IL: { insurance: 0.95, fuel: 1.1, registrationFlat: 155, registrationValueRate: 0, saltBelt: true },
  IN: { insurance: 0.8, fuel: 1.0, registrationFlat: 100, registrationValueRate: 0.004, saltBelt: true },
  KS: { insurance: 0.95, fuel: 0.95, registrationFlat: 95, registrationValueRate: 0, saltBelt: true },
  KY: { insurance: 1.1, fuel: 0.96, registrationFlat: 75, registrationValueRate: 0.005, saltBelt: true },
  LA: { insurance: 1.55, fuel: 0.94, registrationFlat: 100, registrationValueRate: 0, floodRisk: true },
  MA: { insurance: 0.9, fuel: 1.05, registrationFlat: 120, registrationValueRate: 0.005, saltBelt: true },
  MD: { insurance: 1.15, fuel: 1.02, registrationFlat: 160, registrationValueRate: 0, saltBelt: true },
  ME: { insurance: 0.65, fuel: 1.05, registrationFlat: 90, registrationValueRate: 0.006, saltBelt: true },
  MI: { insurance: 1.6, fuel: 1.02, registrationFlat: 140, registrationValueRate: 0.005, saltBelt: true },
  MN: { insurance: 0.95, fuel: 0.98, registrationFlat: 100, registrationValueRate: 0.0065, saltBelt: true },
  MO: { insurance: 1.0, fuel: 0.92, registrationFlat: 90, registrationValueRate: 0, saltBelt: true },
  MS: { insurance: 1.0, fuel: 0.9, registrationFlat: 95, registrationValueRate: 0.005, floodRisk: true },
  MT: { insurance: 0.95, fuel: 1.0, registrationFlat: 130, registrationValueRate: 0, saltBelt: true },
  NC: { insurance: 0.75, fuel: 0.96, registrationFlat: 90, registrationValueRate: 0.005, floodRisk: true },
  ND: { insurance: 0.8, fuel: 1.0, registrationFlat: 110, registrationValueRate: 0, saltBelt: true },
  NE: { insurance: 0.9, fuel: 0.97, registrationFlat: 105, registrationValueRate: 0.005, saltBelt: true },
  NH: { insurance: 0.7, fuel: 1.03, registrationFlat: 110, registrationValueRate: 0.006, saltBelt: true },
  NJ: { insurance: 1.25, fuel: 1.05, registrationFlat: 90, registrationValueRate: 0, saltBelt: true },
  NM: { insurance: 0.95, fuel: 0.98, registrationFlat: 70, registrationValueRate: 0 },
  NV: { insurance: 1.3, fuel: 1.25, registrationFlat: 100, registrationValueRate: 0.008 },
  NY: { insurance: 1.35, fuel: 1.12, registrationFlat: 110, registrationValueRate: 0, saltBelt: true },
  OH: { insurance: 0.72, fuel: 1.0, registrationFlat: 100, registrationValueRate: 0, saltBelt: true },
  OK: { insurance: 1.05, fuel: 0.9, registrationFlat: 100, registrationValueRate: 0 },
  OR: { insurance: 0.95, fuel: 1.25, registrationFlat: 130, registrationValueRate: 0 },
  PA: { insurance: 0.95, fuel: 1.1, registrationFlat: 105, registrationValueRate: 0, saltBelt: true },
  RI: { insurance: 1.3, fuel: 1.05, registrationFlat: 110, registrationValueRate: 0, saltBelt: true },
  SC: { insurance: 1.05, fuel: 0.9, registrationFlat: 80, registrationValueRate: 0.004, floodRisk: true },
  SD: { insurance: 0.85, fuel: 1.0, registrationFlat: 95, registrationValueRate: 0, saltBelt: true },
  TN: { insurance: 0.9, fuel: 0.92, registrationFlat: 85, registrationValueRate: 0 },
  TX: { insurance: 1.2, fuel: 0.9, registrationFlat: 105, registrationValueRate: 0, floodRisk: true },
  UT: { insurance: 0.95, fuel: 1.1, registrationFlat: 90, registrationValueRate: 0, saltBelt: true },
  VA: { insurance: 0.85, fuel: 0.98, registrationFlat: 95, registrationValueRate: 0.004, saltBelt: true },
  VT: { insurance: 0.6, fuel: 1.05, registrationFlat: 90, registrationValueRate: 0, saltBelt: true },
  WA: { insurance: 0.9, fuel: 1.28, registrationFlat: 140, registrationValueRate: 0 },
  WI: { insurance: 0.75, fuel: 0.98, registrationFlat: 105, registrationValueRate: 0, saltBelt: true },
  WV: { insurance: 0.9, fuel: 1.0, registrationFlat: 85, registrationValueRate: 0, saltBelt: true },
  WY: { insurance: 0.75, fuel: 1.02, registrationFlat: 90, registrationValueRate: 0, saltBelt: true },
}

export function stateFactors(state?: string): StateFactors {
  if (!state) return DEFAULT_STATE
  return STATES[state.toUpperCase()] ?? DEFAULT_STATE
}

/** National average regular unleaded price used as the fuel baseline. */
export const BASE_FUEL_PRICE = 3.25
/** National average electricity price per kWh, for EV fuel cost. */
export const BASE_KWH_PRICE = 0.17
