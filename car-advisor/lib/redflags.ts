import type { Listing, RedFlag } from './types'
import type { ValuationDetail } from './valuation'
import type { ResolvedVehicle } from './vehicle'

/**
 * Red-flag detection runs on the raw listing text plus the structured fields.
 * It is deliberately deterministic: these are the patterns that cost people
 * real money, and they should fire identically every time rather than depending
 * on what a model felt like mentioning.
 */

interface Pattern {
  id: string
  severity: RedFlag['severity']
  title: string
  detail: string
  action?: string
  test: RegExp
}

const TEXT_PATTERNS: Pattern[] = [
  {
    id: 'branded-title',
    severity: 'serious',
    title: 'Branded title language in the listing',
    detail: 'The description mentions a salvage, rebuilt, or reconstructed title. These vehicles are worth 30-45% less, are harder to insure for full coverage, and many lenders will not finance them.',
    action: 'Ask for a photo of the actual title before you drive out to see it.',
    test: /\b(salvage|rebuilt|reconstruct(ed|ion)|branded title|junk title|prior salvage|R title)\b/i,
  },
  {
    id: 'no-title',
    severity: 'serious',
    title: 'Title may not be in hand',
    detail: 'Phrases like "bill of sale only", "lost title", or "title in transit" mean you may not be able to register the car. In some states a bonded title takes months.',
    action: 'Do not hand over money until you have seen the physical title with the seller\'s name on it.',
    test: /\b(no title|lost title|bill of sale only|title in transit|title application|bonded title|title pending)\b/i,
  },
  {
    id: 'flood',
    severity: 'serious',
    title: 'Possible flood or water damage',
    detail: 'Flood cars develop electrical faults months or years later, and the damage often reappears after a cheap cosmetic cleanup.',
    action: 'Check under the carpet and spare tire well for silt or a waterline, and smell the cabin for mildew.',
    test: /\b(flood|water damage|hurricane|submerged|storm damage)\b/i,
  },
  {
    id: 'mechanic-special',
    severity: 'serious',
    title: 'Sold as a project or non-runner',
    detail: 'Wording like "mechanic special", "needs work", or "for parts" means the seller knows something is wrong and is pricing it accordingly.',
    action: 'Assume the worst plausible repair. If it needs an engine or transmission, the car is worth scrap value plus parts.',
    test: /\b(mechanic'?s? special|needs? work|for parts|parts car|project car|does ?n'?t run|won'?t start|no start|not running|needs engine|needs transmission)\b/i,
  },
  {
    id: 'check-engine',
    severity: 'caution',
    title: 'Check engine light disclosed',
    detail: 'A lit check engine light can be a $40 sensor or a $4,000 catalytic converter, and it will fail emissions inspection in most states.',
    action: 'Ask for the exact code. Any parts store will read it free — get the code before you make an offer.',
    test: /\b(check engine|engine light|CEL|EML|service engine soon|codes? on)\b/i,
  },
  {
    id: 'odometer-unknown',
    severity: 'serious',
    title: 'Odometer reading may not be actual',
    detail: '"True mileage unknown", "TMU", or a replaced cluster means the odometer is not a reliable record of use. Federal law requires this to be disclosed on the title.',
    action: 'Run the VIN through a history report and compare odometer readings across service and inspection records.',
    test: /\b(TMU|true mileage unknown|mileage unknown|odometer (replaced|broken|not working|discrepancy)|cluster replaced|exempt from odometer)\b/i,
  },
  {
    id: 'emissions-delete',
    severity: 'serious',
    title: 'Emissions equipment may have been removed',
    detail: 'A "delete" (EGR, DPF, or catalytic converter) is a federal violation, fails inspection in most states, and is expensive to reverse — often several thousand dollars in parts alone.',
    action: 'Walk away unless you have priced the full restoration and the discount covers it.',
    test: /\b(dpf delete|egr delete|def delete|deleted|catless|cat delete|straight ?pipe|test pipe|emissions removed|tune[ds]? and deleted)\b/i,
  },
  {
    id: 'heavy-mods',
    severity: 'caution',
    title: 'Significantly modified',
    detail: 'Modified cars have usually been driven hard, and aftermarket tunes void any remaining powertrain warranty. Suspension and engine modifications also raise insurance rates or void coverage entirely if undisclosed.',
    action: 'Ask what was changed, who installed it, and whether the stock parts are included.',
    test: /\b(stage [123]|tuned|big turbo|turbo kit|supercharg(ed|er) (kit|swap)|coilovers|lifted|lift kit|engine swap|swapped|built motor|racing|track (car|prepped)|nitrous)\b/i,
  },
  {
    id: 'accident-history',
    severity: 'caution',
    title: 'Accident or body damage mentioned',
    detail: 'Repaired collision damage reduces resale value and, if the repair was poor, can leave alignment, sensor, or structural problems behind.',
    action: 'Look for mismatched paint, uneven panel gaps, and overspray on the weatherstripping.',
    test: /\b(accident|collision|front ?end damage|rear ?ended|hit|body damage|airbag(s)? (deployed|replaced)|frame damage|repainted|body work)\b/i,
  },
  {
    id: 'scam-markers',
    severity: 'serious',
    title: 'Language associated with listing scams',
    detail: 'Shipping arrangements, escrow services, gift-card payment, or a seller who is deployed or out of state and cannot meet in person are the standard structure of a vehicle listing scam.',
    action: 'Never send money before seeing the car in person. Meet at the seller\'s bank or a police station exchange zone.',
    test: /\b(gift ?card|escrow|western union|zelle only|wire transfer|ship(ping)? the car|deployed|overseas|moving abroad|agent will contact|ebay motors protection)\b/i,
  },
  {
    id: 'pressure',
    severity: 'caution',
    title: 'Pressure tactics in the listing',
    detail: 'Urgency language exists to stop you from inspecting the car or comparing prices.',
    action: 'A genuinely good car at a fair price does not need a deadline. Take the time to get a pre-purchase inspection.',
    test: /\b(must sell today|first come first serve|need it gone|cash today only|no low ?ball|serious (buyers|inquiries) only|price firm today)\b/i,
  },
  {
    id: 'dealer-fees',
    severity: 'caution',
    title: 'Advertised price excludes fees',
    detail: 'Documentation fees, reconditioning fees, and dealer add-ons routinely add $500-$2,500 to the advertised price. Some listings price assumes you finance through the dealer.',
    action: 'Ask for an out-the-door price in writing, itemized, before you visit.',
    test: /\b(plus (tax,? )?(title|tags|fees|doc)|does not include|dealer fee|doc(umentation)? fee|reconditioning fee|market adjustment|price (reflects|assumes) financ|with approved credit|W\.?A\.?C\.?)\b/i,
  },
  {
    id: 'rental-fleet',
    severity: 'info',
    title: 'Former rental or fleet vehicle',
    detail: 'Fleet vehicles get consistent scheduled maintenance but many different drivers. They sell for less, which can be genuinely good value if the service history is documented.',
    action: 'Ask for the fleet maintenance records — they usually exist and are thorough.',
    test: /\b(former rental|ex-rental|rental (car|fleet)|fleet vehicle|company car|previously leased to)\b/i,
  },
  {
    id: 'smoker',
    severity: 'info',
    title: 'Smoke or pet odor likely',
    detail: 'Odor removal is difficult and permanent smoke damage lowers resale value.',
    action: 'Worth a few hundred dollars off the asking price.',
    // "Non-smoker" and "no pets" are selling points, not warnings — the
    // lookbehind keeps them from tripping this flag.
    test: /(?<!non[- ])(?<!no )\b(smok(er|ed in|e smell)|pet (hair|odor|smell))\b/i,
  },
]

export function detectRedFlags(
  listing: Listing,
  v: ResolvedVehicle,
  valuation: ValuationDetail,
): RedFlag[] {
  const flags: RedFlag[] = []
  const seen = new Set<string>()

  const haystack = [listing.rawText, listing.description, listing.trim].filter(Boolean).join('\n')

  for (const p of TEXT_PATTERNS) {
    if (haystack && p.test.test(haystack)) {
      flags.push({ id: p.id, severity: p.severity, title: p.title, detail: p.detail, action: p.action })
      seen.add(p.id)
    }
  }

  // ---- Structured-field flags ----
  if (listing.titleStatus && listing.titleStatus !== 'clean' && listing.titleStatus !== 'unknown' && !seen.has('branded-title')) {
    flags.push({
      id: 'branded-title',
      severity: 'serious',
      title: `${cap(listing.titleStatus)} title`,
      detail: 'A branded title permanently reduces value and limits your options for insurance and financing. It also makes the car much harder to sell later.',
      action: 'Get an independent inspection focused on structural repair quality, and price it 30-45% below a clean-title equivalent.',
    })
    seen.add('branded-title')
  }

  // ---- Price-based flags ----
  if (valuation.deltaPercent != null) {
    if (valuation.deltaPercent <= -30) {
      flags.push({
        id: 'too-cheap',
        severity: 'serious',
        title: 'Priced far below what this vehicle is worth',
        detail: `The asking price is about ${Math.abs(Math.round(valuation.deltaPercent))}% under the estimated fair value. On a legitimate listing that gap almost always means undisclosed damage, a branded title, a failing transmission, or a scam.`,
        action: 'Assume there is a reason. Ask directly why it is priced this way, and never send a deposit before seeing it.',
      })
    } else if (valuation.deltaPercent >= 20) {
      flags.push({
        id: 'overpriced',
        severity: 'caution',
        title: 'Priced well above estimated market value',
        detail: `The asking price is roughly ${Math.round(valuation.deltaPercent)}% above the estimated fair value of $${valuation.fairValue.toLocaleString('en-US')}.`,
        action: 'There are almost certainly comparable cars listed for less. Use them as leverage or move on.',
      })
    }
  }

  // ---- Mileage consistency ----
  if (!v.mileageIsEstimated && v.age >= 4) {
    const milesPerYear = v.mileage / v.age
    if (milesPerYear < 2500) {
      flags.push({
        id: 'suspiciously-low-miles',
        severity: 'caution',
        title: 'Mileage is implausibly low for the age',
        detail: `${v.mileage.toLocaleString('en-US')} miles over ${v.age} years works out to ${Math.round(milesPerYear).toLocaleString('en-US')} miles a year. That is either a garage-kept car that barely moved, or an odometer that does not match reality.`,
        action: 'Compare the odometer to service stickers, inspection records, and the VIN history report before paying a low-mileage premium.',
      })
    } else if (milesPerYear > 22000) {
      flags.push({
        id: 'very-high-miles',
        severity: 'caution',
        title: 'Very high annual mileage',
        detail: `About ${Math.round(milesPerYear).toLocaleString('en-US')} miles a year. Highway miles are gentler than city miles, but wear items are far ahead of schedule either way.`,
        action: 'Ask whether it was a commuter or a work vehicle, and budget for suspension, brakes, and fluids immediately.',
      })
    }
  }

  // ---- Rust exposure ----
  if (v.geo.saltBelt && v.age >= 8) {
    flags.push({
      id: 'rust-belt',
      severity: 'caution',
      title: 'Rust exposure from a road-salt state',
      detail: `A ${v.age}-year-old vehicle in ${v.state} has spent many winters in salt. Rusted brake lines, fuel lines, and subframe mounts are what usually ends these cars, and they are rarely visible from the outside.`,
      action: 'Put it on a lift. Fifteen minutes underneath tells you more than the entire test drive.',
    })
  }

  // ---- Flood-title laundering ----
  if (v.geo.floodRisk && !seen.has('flood') && v.age >= 3) {
    flags.push({
      id: 'flood-region',
      severity: 'info',
      title: 'Located in a state with frequent flood-damaged vehicles',
      detail: `${v.state} sees repeated major storms, and flood cars are routinely retitled in other states to hide the brand ("title washing").`,
      action: 'Run the VIN through the NICB free VINCheck and a full history report, and check for silt under the carpet.',
    })
  }

  // ---- Missing verification data ----
  if (!listing.vin) {
    flags.push({
      id: 'no-vin',
      severity: 'caution',
      title: 'No VIN in the listing',
      detail: 'Without a VIN you cannot check recalls, title brands, or history. Legitimate sellers have no reason to withhold it.',
      action: 'Ask for the VIN before you spend time on this one. If the seller refuses, that is your answer.',
    })
  }

  if (haystack && !/\b(records|receipts|maintenance history|serviced|service history|carfax|autocheck|well maintained|dealer maintained)\b/i.test(haystack)) {
    flags.push({
      id: 'no-service-history',
      severity: 'info',
      title: 'No maintenance history mentioned',
      detail: 'Absence of records is not proof of neglect, but on a used car it removes your only evidence that expensive scheduled services were actually done.',
      action: 'Ask for receipts, or price in the services you cannot confirm — transmission fluid, timing components, and coolant especially.',
    })
  }

  // Most serious first, so the UI shows what matters without sorting.
  const order = { serious: 0, caution: 1, info: 2 }
  return flags.sort((a, b) => order[a.severity] - order[b.severity])
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
