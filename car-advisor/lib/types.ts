// Core domain types shared by the extraction layer, the deterministic models,
// and the report UI.

export type TitleStatus = 'clean' | 'salvage' | 'rebuilt' | 'lemon' | 'flood' | 'unknown'
export type SellerType = 'private' | 'dealer' | 'unknown'
export type Drivetrain = 'fwd' | 'rwd' | 'awd' | '4wd' | 'unknown'
export type FuelType = 'gas' | 'hybrid' | 'plugin' | 'diesel' | 'electric' | 'unknown'
export type Transmission = 'automatic' | 'manual' | 'cvt' | 'dct' | 'unknown'

export type BodyStyle =
  | 'sedan'
  | 'coupe'
  | 'hatchback'
  | 'wagon'
  | 'suv-compact'
  | 'suv-midsize'
  | 'suv-large'
  | 'truck'
  | 'minivan'
  | 'convertible'
  | 'unknown'

/** Everything we could pull out of a listing. Almost every field is optional —
 *  listings are messy and the report degrades gracefully rather than failing. */
export interface Listing {
  sourceUrl?: string
  sourceSite?: string
  rawText?: string

  year?: number
  make?: string
  model?: string
  trim?: string
  vin?: string

  price?: number
  mileage?: number

  bodyStyle?: BodyStyle
  drivetrain?: Drivetrain
  fuelType?: FuelType
  transmission?: Transmission
  engine?: string
  seats?: number
  mpgCity?: number
  mpgHighway?: number

  titleStatus?: TitleStatus
  sellerType?: SellerType
  accidentsReported?: number
  ownerCount?: number
  zip?: string
  state?: string

  /** Free-text seller description, kept for red-flag scanning. */
  description?: string
  /** Confidence 0-1 that the extraction is usable. */
  extractionConfidence?: number
  /** Fields the extractor could not determine and that materially affect the report. */
  missingCriticalFields?: string[]
}

export interface BuyerProfile {
  driverAge?: number
  zip?: string
  annualMiles?: number
  budget?: number
  commuteMiles?: number
  householdSize?: number
  needsSnow?: boolean
  needsTowing?: boolean
  hasPets?: boolean
  roadTrips?: boolean
  drivingMix?: 'city' | 'highway' | 'mixed'
  cleanRecord?: boolean
}

export interface Valuation {
  askingPrice?: number
  fairValue: number
  /** Plausible range around fair value; a point estimate alone oversells precision. */
  low: number
  high: number
  deltaDollars?: number
  deltaPercent?: number
  verdict: 'great-deal' | 'below-market' | 'fair' | 'above-market' | 'overpriced' | 'unknown'
  basis: string[]
  confidence: 'low' | 'medium' | 'high'
}

export interface ReliabilityAssessment {
  score: number // 0-10
  brandBaseline: number
  commonIssues: CommonIssue[]
  notes: string[]
}

export interface CommonIssue {
  component: string
  description: string
  typicalOnsetMiles?: number
  estimatedRepairCost?: [number, number]
  severity: 'low' | 'medium' | 'high'
}

export interface OwnershipCost {
  years: number
  annualMiles: number
  fuel: number
  insurance: number
  maintenance: number
  repairs: number
  tires: number
  registration: number
  depreciation: number
  total: number
  totalExcludingDepreciation: number
  costPerMile: number
  assumptions: string[]
}

export interface InsuranceEstimate {
  monthlyLow: number
  monthlyHigh: number
  monthlyPoint: number
  factors: string[]
  disclaimer: string
}

export interface MaintenanceItem {
  year: number
  service: string
  estimatedCost: number
  kind: 'scheduled' | 'wear' | 'likely-repair'
}

export interface MaintenanceForecast {
  items: MaintenanceItem[]
  fiveYearTotal: number
}

export interface RedFlag {
  id: string
  severity: 'info' | 'caution' | 'serious'
  title: string
  detail: string
  /** What the buyer should actually do about it. */
  action?: string
}

export interface Negotiation {
  targetOffer: number
  walkAwayPrice: number
  openingOffer: number
  leverage: string[]
  questions: string[]
}

export interface LifestyleFit {
  score: number // 0-100
  matches: string[]
  mismatches: string[]
}

export interface Alternative {
  year: number
  make: string
  model: string
  reason: string
  approxPrice?: number
  reliabilityScore?: number
}

export interface ScoreBreakdownItem {
  label: string
  points: number
  max: number
  detail: string
}

export interface BuyScore {
  score: number // 0-100
  grade: 'Excellent Buy' | 'Good Buy' | 'Fair' | 'Risky' | 'Avoid'
  headline: string
  reasons: string[]
  concerns: string[]
  breakdown: ScoreBreakdownItem[]
}

export interface Report {
  id: string
  createdAt: string
  listing: Listing
  profile: BuyerProfile
  buyScore: BuyScore
  valuation: Valuation
  reliability: ReliabilityAssessment
  ownership: OwnershipCost
  insurance: InsuranceEstimate
  maintenance: MaintenanceForecast
  redFlags: RedFlag[]
  negotiation: Negotiation
  lifestyle?: LifestyleFit
  alternatives: Alternative[]
  /** Narrative written by the model on top of the computed numbers. */
  summary?: string
  dataNotes: string[]
}
