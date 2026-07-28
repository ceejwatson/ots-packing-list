// Brand-level priors. These drive depreciation retention, reliability baselines,
// and parts/labor cost multipliers when we have no model-specific data.
//
// Sources these approximate: NHTSA complaint volume per model-year, published
// 5-year cost-to-own studies, and dealer parts pricing. They are priors, not
// truth — model-level data in data/models.ts overrides them where present.

export interface BrandProfile {
  /** 0-10 reliability prior. */
  reliability: number
  /** Share of original MSRP retained after 5 years, before mileage effects. */
  retention5yr: number
  /** Multiplier on routine maintenance and repair costs (1.0 = mainstream). */
  costMultiplier: number
  /** Insurance rate multiplier from typical claim severity for the brand. */
  insuranceMultiplier: number
  luxury?: boolean
}

export const BRANDS: Record<string, BrandProfile> = {
  toyota: { reliability: 9.2, retention5yr: 0.63, costMultiplier: 0.9, insuranceMultiplier: 0.95 },
  lexus: { reliability: 9.3, retention5yr: 0.59, costMultiplier: 1.15, insuranceMultiplier: 1.1, luxury: true },
  honda: { reliability: 8.8, retention5yr: 0.61, costMultiplier: 0.92, insuranceMultiplier: 0.97 },
  acura: { reliability: 8.5, retention5yr: 0.52, costMultiplier: 1.1, insuranceMultiplier: 1.05, luxury: true },
  mazda: { reliability: 8.7, retention5yr: 0.55, costMultiplier: 0.95, insuranceMultiplier: 0.95 },
  subaru: { reliability: 7.9, retention5yr: 0.59, costMultiplier: 1.05, insuranceMultiplier: 0.98 },
  hyundai: { reliability: 7.8, retention5yr: 0.45, costMultiplier: 0.92, insuranceMultiplier: 0.98 },
  kia: { reliability: 7.8, retention5yr: 0.45, costMultiplier: 0.92, insuranceMultiplier: 0.98 },
  genesis: { reliability: 7.9, retention5yr: 0.4, costMultiplier: 1.2, insuranceMultiplier: 1.15, luxury: true },
  ford: { reliability: 7.0, retention5yr: 0.47, costMultiplier: 1.0, insuranceMultiplier: 1.0 },
  chevrolet: { reliability: 6.9, retention5yr: 0.45, costMultiplier: 1.0, insuranceMultiplier: 1.0 },
  gmc: { reliability: 6.9, retention5yr: 0.5, costMultiplier: 1.05, insuranceMultiplier: 1.02 },
  buick: { reliability: 7.2, retention5yr: 0.42, costMultiplier: 1.02, insuranceMultiplier: 1.0 },
  ram: { reliability: 6.4, retention5yr: 0.48, costMultiplier: 1.1, insuranceMultiplier: 1.05 },
  dodge: { reliability: 6.3, retention5yr: 0.44, costMultiplier: 1.05, insuranceMultiplier: 1.15 },
  chrysler: { reliability: 6.0, retention5yr: 0.38, costMultiplier: 1.05, insuranceMultiplier: 1.0 },
  jeep: { reliability: 5.8, retention5yr: 0.47, costMultiplier: 1.1, insuranceMultiplier: 1.02 },
  nissan: { reliability: 6.8, retention5yr: 0.42, costMultiplier: 0.98, insuranceMultiplier: 1.0 },
  infiniti: { reliability: 6.8, retention5yr: 0.36, costMultiplier: 1.2, insuranceMultiplier: 1.12, luxury: true },
  volkswagen: { reliability: 6.4, retention5yr: 0.44, costMultiplier: 1.2, insuranceMultiplier: 1.0 },
  bmw: { reliability: 5.9, retention5yr: 0.38, costMultiplier: 1.55, insuranceMultiplier: 1.2, luxury: true },
  'mercedes-benz': { reliability: 5.7, retention5yr: 0.37, costMultiplier: 1.65, insuranceMultiplier: 1.25, luxury: true },
  audi: { reliability: 5.9, retention5yr: 0.38, costMultiplier: 1.5, insuranceMultiplier: 1.18, luxury: true },
  volvo: { reliability: 6.2, retention5yr: 0.38, costMultiplier: 1.4, insuranceMultiplier: 1.1, luxury: true },
  porsche: { reliability: 6.8, retention5yr: 0.52, costMultiplier: 2.0, insuranceMultiplier: 1.5, luxury: true },
  'land rover': { reliability: 4.2, retention5yr: 0.35, costMultiplier: 1.9, insuranceMultiplier: 1.3, luxury: true },
  jaguar: { reliability: 4.5, retention5yr: 0.28, costMultiplier: 1.8, insuranceMultiplier: 1.25, luxury: true },
  mini: { reliability: 5.8, retention5yr: 0.4, costMultiplier: 1.4, insuranceMultiplier: 1.05, luxury: true },
  tesla: { reliability: 6.6, retention5yr: 0.45, costMultiplier: 1.1, insuranceMultiplier: 1.35 },
  rivian: { reliability: 6.0, retention5yr: 0.38, costMultiplier: 1.4, insuranceMultiplier: 1.4 },
  mitsubishi: { reliability: 6.5, retention5yr: 0.38, costMultiplier: 0.95, insuranceMultiplier: 0.98 },
  lincoln: { reliability: 6.8, retention5yr: 0.36, costMultiplier: 1.25, insuranceMultiplier: 1.1, luxury: true },
  cadillac: { reliability: 6.4, retention5yr: 0.35, costMultiplier: 1.35, insuranceMultiplier: 1.15, luxury: true },
  fiat: { reliability: 4.8, retention5yr: 0.28, costMultiplier: 1.2, insuranceMultiplier: 1.0 },
  'alfa romeo': { reliability: 4.5, retention5yr: 0.3, costMultiplier: 1.8, insuranceMultiplier: 1.3, luxury: true },
}

export const DEFAULT_BRAND: BrandProfile = {
  reliability: 7.0,
  retention5yr: 0.45,
  costMultiplier: 1.05,
  insuranceMultiplier: 1.0,
}

export function brandProfile(make?: string): BrandProfile {
  if (!make) return DEFAULT_BRAND
  return BRANDS[make.trim().toLowerCase()] ?? DEFAULT_BRAND
}
