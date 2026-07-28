import { MODEL, getClient, textOf } from './anthropic'
import type { BodyStyle, Drivetrain, FuelType, Listing, SellerType, TitleStatus, Transmission } from './types'

/**
 * Two extractors run over every listing:
 *
 *   1. A regex pass that is fast, free, and never wrong about a number it finds.
 *   2. A model pass that reads the prose the way a person would.
 *
 * The regex pass wins on any field it is confident about, because a model that
 * misreads "$18,500 OBO, will trade for a bike worth $4,000" is a real risk and
 * a regex that anchors on the dollar sign is not. The model fills in everything
 * regex cannot: body style, seller intent, trim, condition language.
 */

const MAKES = [
  'acura', 'alfa romeo', 'audi', 'bmw', 'buick', 'cadillac', 'chevrolet', 'chevy', 'chrysler',
  'dodge', 'fiat', 'ford', 'genesis', 'gmc', 'honda', 'hyundai', 'infiniti', 'jaguar', 'jeep',
  'kia', 'land rover', 'lexus', 'lincoln', 'maserati', 'mazda', 'mercedes-benz', 'mercedes',
  'mini', 'mitsubishi', 'nissan', 'polestar', 'porsche', 'ram', 'rivian', 'subaru', 'tesla',
  'toyota', 'volkswagen', 'vw', 'volvo',
]

const MAKE_ALIASES: Record<string, string> = {
  chevy: 'chevrolet',
  vw: 'volkswagen',
  mercedes: 'mercedes-benz',
}

/** Engine displacements, trim codes, and prose that follow a model name. */
const TRIM_AND_NOISE =
  // Deliberately excludes a bare "s" so "Model S" survives; findModel() already
  // tolerates a trailing trim word on models that are in the catalog.
  /^(\d\.\d[lt]?|v[68]|i[46]|awd|4wd|fwd|rwd|4x4|se|sv|sl|sr|sport|le|xle|xse|ex|ex-l|lx|dx|si|lt|ls|ltz|xlt|lariat|limited|touring|premium|base|platinum|denali|trd|gt|hybrid|turbo|diesel|for|with|in|at|only|miles|mi|clean|great|runs|excellent|good|low|new|used|sedan|coupe|suv|truck|wagon)$/i

function isNotPartOfModelName(word: string): boolean {
  return TRIM_AND_NOISE.test(word)
}

export function heuristicExtract(text: string): Listing {
  const listing: Listing = { rawText: text }
  const lower = text.toLowerCase()

  // ---- Price ----
  // Anchor on a currency symbol; a bare number in listing prose is unreliable.
  const priceMatches = [...text.matchAll(/\$\s?(\d{1,3}(?:,\d{3})+|\d{4,6})(?!\d)/g)]
    .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
    .filter((n) => n >= 500 && n <= 400000)
  if (priceMatches.length) {
    // The asking price is almost always the largest figure quoted; monthly
    // payments, down payments, and fees are smaller.
    listing.price = Math.max(...priceMatches)
  } else {
    const asking = lower.match(/(?:asking|price|obo)\D{0,12}(\d{1,3}(?:,\d{3})+|\d{4,6})/)
    if (asking) {
      const n = parseInt(asking[1].replace(/,/g, ''), 10)
      if (n >= 500 && n <= 400000) listing.price = n
    }
  }

  // ---- Mileage ----
  const milesK = lower.match(/(\d{1,3}(?:\.\d)?)\s?k\s?(?:miles|mi\b|mileage)/)
  const milesFull = lower.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s?(?:miles|mi\b|mileage|odometer)/)
  const milesLabeled = lower.match(/(?:mileage|odometer|miles)\D{0,10}(\d{1,3}(?:,\d{3})+|\d{4,6})/)
  if (milesFull) {
    listing.mileage = parseInt(milesFull[1].replace(/,/g, ''), 10)
  } else if (milesK) {
    listing.mileage = Math.round(parseFloat(milesK[1]) * 1000)
  } else if (milesLabeled) {
    listing.mileage = parseInt(milesLabeled[1].replace(/,/g, ''), 10)
  }
  if (listing.mileage != null && (listing.mileage < 10 || listing.mileage > 600000)) {
    delete listing.mileage
  }

  // ---- Year, make, model ----
  const currentYear = new Date().getFullYear()
  const makePattern = new RegExp(`\\b(${MAKES.join('|')})\\b`, 'i')
  const makeMatch = lower.match(makePattern)
  if (makeMatch) {
    const raw = makeMatch[1].toLowerCase()
    listing.make = MAKE_ALIASES[raw] ?? raw

    // Year usually sits immediately before the make.
    const before = text.slice(0, makeMatch.index ?? 0)
    const yearBefore = [...before.matchAll(/\b(19[89]\d|20[0-4]\d)\b/g)].pop()
    if (yearBefore) {
      const y = parseInt(yearBefore[1], 10)
      if (y >= 1980 && y <= currentYear + 1) listing.year = y
    }

    // Model is the words right after the make. Two words are kept because real
    // model names need them ("grand cherokee", "silverado 1500", "3 series"),
    // but engine displacements and trim codes are dropped — "Altima 2.5 SV" is
    // an Altima, not an "altima 2".
    const after = text.slice((makeMatch.index ?? 0) + makeMatch[1].length)
    // The period is in the character class so "2.5" is captured whole and
    // recognized as a displacement; without it the token came through as a
    // bare "2" and ended up in the model name.
    const modelMatch = after.match(/^[\s-]*([A-Za-z0-9][A-Za-z0-9.-]*(?:\s+[A-Za-z0-9][A-Za-z0-9.-]*){0,2})/)
    if (modelMatch) {
      const words: string[] = []
      for (const raw of modelMatch[1].split(/\s+/)) {
        const word = raw.replace(/[.,]+$/, '') // trailing sentence punctuation
        if (!word || isNotPartOfModelName(word)) break
        words.push(word)
        if (words.length === 2) break
      }
      if (words.length) listing.model = words.join(' ').toLowerCase()
    }

    // Whatever followed the model name is usually the trim, which matters for value.
    const trimMatch = after
      .slice(0, 60)
      .match(/\b(platinum|denali|high country|limited|touring|lariat|ltz|titanium|trailhawk|summit|calligraphy|ex-l|king ranch|sel premium|xle|xlt|xse|sel|ex|lt|le|se|sv|sr5|sr|s-line|latitude|premium|sport|base)\b/i)
    if (trimMatch) listing.trim = trimMatch[1].toUpperCase()
  }

  if (!listing.year) {
    const anyYear = text.match(/\b(19[89]\d|20[0-4]\d)\b/)
    if (anyYear) {
      const y = parseInt(anyYear[1], 10)
      if (y >= 1980 && y <= currentYear + 1) listing.year = y
    }
  }

  // ---- VIN ----
  const vin = text.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i)
  if (vin && /\d/.test(vin[1])) listing.vin = vin[1].toUpperCase()

  // ---- Powertrain ----
  if (/\bcvt\b|continuously variable/i.test(text)) listing.transmission = 'cvt'
  else if (/\bdct\b|dual[- ]clutch|dsg\b|powershift/i.test(text)) listing.transmission = 'dct'
  else if (/\bmanual\b|\bstick\b|\b[56]-?speed manual\b/i.test(text)) listing.transmission = 'manual'
  else if (/\bautomatic\b|\bauto\b/i.test(text)) listing.transmission = 'automatic'

  if (/\bawd\b|all[- ]wheel/i.test(text)) listing.drivetrain = 'awd'
  else if (/\b4wd\b|4x4|four[- ]wheel/i.test(text)) listing.drivetrain = '4wd'
  else if (/\brwd\b|rear[- ]wheel/i.test(text)) listing.drivetrain = 'rwd'
  else if (/\bfwd\b|front[- ]wheel/i.test(text)) listing.drivetrain = 'fwd'

  if (/\bplug[- ]?in\b|\bphev\b/i.test(text)) listing.fuelType = 'plugin'
  else if (/\belectric\b|\bev\b(?!ent)/i.test(text)) listing.fuelType = 'electric'
  else if (/\bhybrid\b/i.test(text)) listing.fuelType = 'hybrid'
  else if (/\bdiesel\b|tdi\b|duramax|cummins|power ?stroke/i.test(text)) listing.fuelType = 'diesel'

  const engine = text.match(/\b(\d\.\d)\s?L?\b|\b(V6|V8|V-6|V-8|I4|I-4|inline[- ]?4)\b/i)
  if (engine) listing.engine = (engine[0] ?? '').trim()

  // ---- Title ----
  if (/\brebuilt\b|\breconstructed\b/i.test(text)) listing.titleStatus = 'rebuilt'
  else if (/\bsalvage\b/i.test(text)) listing.titleStatus = 'salvage'
  else if (/\bflood\b/i.test(text)) listing.titleStatus = 'flood'
  else if (/\blemon (law )?(buyback|title)\b/i.test(text)) listing.titleStatus = 'lemon'
  else if (/\bclean title\b|\btitle in hand\b|\bclear title\b/i.test(text)) listing.titleStatus = 'clean'

  // ---- Seller ----
  if (/\bdealer\b|\bdealership\b|stock ?#|\bdoc fee\b|financing available/i.test(text)) {
    listing.sellerType = 'dealer'
  } else if (/\bprivate (party|seller|sale)\b|\bselling my\b|\bmy car\b|\bi'?m selling\b/i.test(text)) {
    listing.sellerType = 'private'
  }

  // ---- Owners and accidents ----
  const owners = lower.match(/(\d|one|two|three)\s*(?:previous\s*)?owners?\b/)
  if (owners) {
    const map: Record<string, number> = { one: 1, two: 2, three: 3 }
    listing.ownerCount = map[owners[1]] ?? parseInt(owners[1], 10)
  }
  if (/\bno accidents?\b|\baccident[- ]free\b/i.test(text)) listing.accidentsReported = 0
  else {
    const acc = lower.match(/(\d|one|two)\s*(?:reported\s*)?accidents?\b/)
    if (acc) {
      const map: Record<string, number> = { one: 1, two: 2 }
      listing.accidentsReported = map[acc[1]] ?? parseInt(acc[1], 10)
    }
  }

  // ---- ZIP ----
  // Only trust a ZIP that is labeled or formatted as "City, ST 12345"; a bare
  // five-digit number is usually mileage or price.
  const zip = text.match(/\b[A-Z]{2}\s+(\d{5})\b/) ?? text.match(/\bzip\s*:?\s*(\d{5})\b/i)
  if (zip) listing.zip = zip[1]
  const state = text.match(/\b([A-Z]{2})\s+\d{5}\b/)
  if (state) listing.state = state[1]

  return listing
}

// ---------------------------------------------------------------------------
// Model-based extraction
// ---------------------------------------------------------------------------

const nullable = (schema: Record<string, unknown>) => ({ anyOf: [schema, { type: 'null' }] })

const EXTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    year: nullable({ type: 'integer' }),
    make: nullable({ type: 'string' }),
    model: nullable({ type: 'string' }),
    trim: nullable({ type: 'string' }),
    vin: nullable({ type: 'string' }),
    price: nullable({ type: 'integer' }),
    mileage: nullable({ type: 'integer' }),
    bodyStyle: nullable({
      type: 'string',
      enum: ['sedan', 'coupe', 'hatchback', 'wagon', 'suv-compact', 'suv-midsize', 'suv-large', 'truck', 'minivan', 'convertible'],
    }),
    drivetrain: nullable({ type: 'string', enum: ['fwd', 'rwd', 'awd', '4wd'] }),
    fuelType: nullable({ type: 'string', enum: ['gas', 'hybrid', 'plugin', 'diesel', 'electric'] }),
    transmission: nullable({ type: 'string', enum: ['automatic', 'manual', 'cvt', 'dct'] }),
    engine: nullable({ type: 'string' }),
    titleStatus: nullable({ type: 'string', enum: ['clean', 'salvage', 'rebuilt', 'lemon', 'flood'] }),
    sellerType: nullable({ type: 'string', enum: ['private', 'dealer'] }),
    accidentsReported: nullable({ type: 'integer' }),
    ownerCount: nullable({ type: 'integer' }),
    zip: nullable({ type: 'string' }),
    state: nullable({ type: 'string' }),
    description: nullable({ type: 'string' }),
    extractionConfidence: { type: 'number' },
    missingCriticalFields: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'year', 'make', 'model', 'trim', 'vin', 'price', 'mileage', 'bodyStyle', 'drivetrain',
    'fuelType', 'transmission', 'engine', 'titleStatus', 'sellerType', 'accidentsReported',
    'ownerCount', 'zip', 'state', 'description', 'extractionConfidence', 'missingCriticalFields',
  ],
} as const

const EXTRACTION_SYSTEM = `You read used-vehicle listings and return structured data.

Rules:
- Only record what the listing actually says. Never infer a price, mileage, or title status that is not stated. Null is the correct answer for anything absent.
- "price" is the seller's asking price for the vehicle, not a monthly payment, down payment, or trade-in value. If the listing shows a monthly payment only, leave price null.
- "mileage" is the odometer reading. "120k" means 120000.
- Normalize make to lowercase ("chevy" becomes "chevrolet", "vw" becomes "volkswagen", "mercedes" becomes "mercedes-benz").
- "model" is the model name only, without trim ("civic", not "civic ex-l"). Put the trim in "trim".
- bodyStyle: infer from the model when you are confident (a Camry is a sedan, an F-150 is a truck). Use null when unsure.
- titleStatus: only "clean" if the listing explicitly says clean or clear title. Absence of the word "salvage" does not mean clean.
- "description" should contain the seller's own descriptive prose, verbatim, so it can be scanned for warning signs. Do not summarize or clean it up.
- extractionConfidence: 0 to 1, reflecting how much of the listing you could read reliably.
- missingCriticalFields: list any of price, mileage, year, make, model, titleStatus that you could not determine.`

export async function modelExtract(text: string, sourceHint?: string): Promise<Partial<Listing> | null> {
  const client = getClient()
  if (!client) return null

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: EXTRACTION_SYSTEM,
      output_config: { format: { type: 'json_schema', schema: EXTRACTION_SCHEMA as unknown as Record<string, unknown> } },
      messages: [
        {
          role: 'user',
          content: `${sourceHint ? `Source: ${sourceHint}\n\n` : ''}Listing:\n"""\n${text.slice(0, 24000)}\n"""`,
        },
      ],
    })

    if (response.stop_reason === 'refusal') return null

    const raw = textOf(response)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Record<string, unknown>
    return stripNulls(parsed) as Partial<Listing>
  } catch {
    // Extraction is best-effort; the heuristic pass already produced a listing.
    return null
  }
}

function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined && v !== '') out[k] = v
  }
  return out
}

// ---------------------------------------------------------------------------
// Combined
// ---------------------------------------------------------------------------

/**
 * Merges the two extractors. The regex pass owns the numbers it found; the
 * model owns everything else and fills gaps.
 */
export async function extractListing(
  text: string,
  opts: { sourceUrl?: string; sourceSite?: string; jsonLd?: Record<string, unknown>[] } = {},
): Promise<Listing> {
  const heuristic = heuristicExtract(text)
  const fromJsonLd = opts.jsonLd ? extractFromJsonLd(opts.jsonLd) : {}
  const fromModel = await modelExtract(text, opts.sourceSite)

  const merged: Listing = {
    // Lowest priority first: model guesses, then published structured data,
    // then anything the regex pass matched directly in the text.
    ...(fromModel ?? {}),
    ...fromJsonLd,
    ...heuristic,
    rawText: text,
    sourceUrl: opts.sourceUrl,
    sourceSite: opts.sourceSite,
  }

  // The model's prose fields have no regex equivalent, so restore them.
  if (fromModel?.description) merged.description = fromModel.description
  if (fromModel?.trim && !merged.trim) merged.trim = fromModel.trim
  if (fromModel?.bodyStyle) merged.bodyStyle = fromModel.bodyStyle as BodyStyle
  merged.extractionConfidence = fromModel?.extractionConfidence ?? (heuristic.price && heuristic.year ? 0.6 : 0.3)

  const missing: string[] = []
  if (!merged.price) missing.push('price')
  if (!merged.mileage) missing.push('mileage')
  if (!merged.year) missing.push('year')
  if (!merged.make || !merged.model) missing.push('make and model')
  merged.missingCriticalFields = missing

  return merged
}

/** schema.org Vehicle / Product markup, which several dealer platforms publish. */
function extractFromJsonLd(nodes: Record<string, unknown>[]): Partial<Listing> {
  const out: Partial<Listing> = {}

  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    const obj = node as Record<string, unknown>
    const type = String(obj['@type'] ?? '')

    if (/vehicle|car|product/i.test(type)) {
      const year = obj.vehicleModelDate ?? obj.modelDate ?? obj.productionDate
      if (year) {
        const y = parseInt(String(year).slice(0, 4), 10)
        if (y >= 1980 && y <= new Date().getFullYear() + 1) out.year = y
      }
      const brand = obj.brand ?? obj.manufacturer
      if (typeof brand === 'string') out.make = brand.toLowerCase()
      else if (brand && typeof brand === 'object' && 'name' in (brand as object)) {
        out.make = String((brand as Record<string, unknown>).name).toLowerCase()
      }
      if (typeof obj.model === 'string') out.model = obj.model.toLowerCase()

      const odo = obj.mileageFromOdometer
      if (odo && typeof odo === 'object' && 'value' in (odo as object)) {
        const v = Number((odo as Record<string, unknown>).value)
        if (Number.isFinite(v) && v > 0) out.mileage = Math.round(v)
      }

      const offers = obj.offers
      if (offers && typeof offers === 'object') {
        const o = (Array.isArray(offers) ? offers[0] : offers) as Record<string, unknown>
        const p = Number(o?.price)
        if (Number.isFinite(p) && p > 500) out.price = Math.round(p)
      }

      if (typeof obj.vehicleIdentificationNumber === 'string') {
        out.vin = obj.vehicleIdentificationNumber.toUpperCase()
      }
      const trans = obj.vehicleTransmission
      if (typeof trans === 'string') {
        const t = trans.toLowerCase()
        if (t.includes('cvt')) out.transmission = 'cvt' as Transmission
        else if (t.includes('manual')) out.transmission = 'manual' as Transmission
        else if (t.includes('auto')) out.transmission = 'automatic' as Transmission
      }
      const fuel = obj.fuelType
      if (typeof fuel === 'string') {
        const f = fuel.toLowerCase()
        if (f.includes('electric')) out.fuelType = 'electric' as FuelType
        else if (f.includes('hybrid')) out.fuelType = 'hybrid' as FuelType
        else if (f.includes('diesel')) out.fuelType = 'diesel' as FuelType
      }
      const dt = obj.driveWheelConfiguration
      if (typeof dt === 'string') {
        const d = dt.toLowerCase()
        if (d.includes('all')) out.drivetrain = 'awd' as Drivetrain
        else if (d.includes('four')) out.drivetrain = '4wd' as Drivetrain
        else if (d.includes('rear')) out.drivetrain = 'rwd' as Drivetrain
        else if (d.includes('front')) out.drivetrain = 'fwd' as Drivetrain
      }
    }

    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') walk(v)
    }
  }

  nodes.forEach(walk)
  return out
}

export type { TitleStatus, SellerType }
