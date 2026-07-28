import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { heuristicExtract } from '@/lib/extract'
import { buildReport } from '@/lib/report'
import type { Listing } from '@/lib/types'
import { estimateValue } from '@/lib/valuation'
import { resolveVehicle } from '@/lib/vehicle'

const CURRENT_YEAR = new Date().getFullYear()

/** Reports are built without the narrative so tests never need an API key. */
const report = (listing: Listing, profile = {}) => buildReport(listing, profile, { withNarrative: false })

describe('heuristicExtract', () => {
  it('reads a typical private-party listing', () => {
    const l = heuristicExtract(
      '2018 Honda CR-V EX AWD - $19,500\n78,000 miles, clean title, one owner, no accidents. ' +
        'Well maintained with all service records. Selling because we need a third row. Atlanta GA 30303',
    )
    assert.equal(l.year, 2018)
    assert.equal(l.make, 'honda')
    assert.equal(l.price, 19500)
    assert.equal(l.mileage, 78000)
    assert.equal(l.titleStatus, 'clean')
    assert.equal(l.drivetrain, 'awd')
    assert.equal(l.ownerCount, 1)
    assert.equal(l.accidentsReported, 0)
    assert.equal(l.zip, '30303')
    assert.equal(l.state, 'GA')
  })

  it('expands abbreviated mileage', () => {
    assert.equal(heuristicExtract('2015 Toyota Camry, 120k miles, $9,800').mileage, 120000)
  })

  it('does not mistake a monthly payment for the asking price', () => {
    const l = heuristicExtract('2020 Nissan Altima — $289/mo with $2,000 down. Sale price $18,995.')
    assert.equal(l.price, 18995)
  })

  it('normalizes make aliases', () => {
    assert.equal(heuristicExtract('2016 Chevy Equinox $8,500').make, 'chevrolet')
    assert.equal(heuristicExtract('2014 VW Jetta $6,900').make, 'volkswagen')
  })

  it('flags a branded title from prose', () => {
    assert.equal(heuristicExtract('2019 Ford F-150, rebuilt title, runs great, $21,000').titleStatus, 'rebuilt')
  })

  it('leaves fields undefined rather than guessing', () => {
    const l = heuristicExtract('Nice car, runs great, call me')
    assert.equal(l.price, undefined)
    assert.equal(l.mileage, undefined)
    assert.equal(l.year, undefined)
  })
})

describe('valuation', () => {
  it('depreciates monotonically with age', () => {
    const base: Listing = { make: 'toyota', model: 'camry', mileage: 60000 }
    const values = [2, 5, 8, 12].map(
      (age) => estimateValue({ ...base, year: CURRENT_YEAR - age }).fairValue,
    )
    for (let i = 1; i < values.length; i++) {
      assert.ok(values[i] < values[i - 1], `age ${i} should be worth less than the one before it`)
    }
  })

  it('penalizes high mileage against an identical car', () => {
    const low = estimateValue({ year: CURRENT_YEAR - 5, make: 'honda', model: 'accord', mileage: 40000 })
    const high = estimateValue({ year: CURRENT_YEAR - 5, make: 'honda', model: 'accord', mileage: 140000 })
    assert.ok(high.fairValue < low.fairValue)
  })

  it('discounts a salvage title heavily', () => {
    const clean = estimateValue({ year: CURRENT_YEAR - 4, make: 'toyota', model: 'rav4', mileage: 60000, titleStatus: 'clean' })
    const salvage = estimateValue({ year: CURRENT_YEAR - 4, make: 'toyota', model: 'rav4', mileage: 60000, titleStatus: 'salvage' })
    assert.ok(salvage.fairValue < clean.fairValue * 0.7)
  })

  it('keeps values in a plausible band for a mainstream car', () => {
    const v = estimateValue({ year: CURRENT_YEAR - 5, make: 'toyota', model: 'camry', mileage: 60000 })
    assert.ok(v.fairValue > 12000 && v.fairValue < 26000, `got ${v.fairValue}`)
    assert.ok(v.low < v.fairValue && v.high > v.fairValue)
  })

  it('never returns a negative or zero value on an old, high-mileage car', () => {
    const v = estimateValue({ year: 1998, make: 'ford', model: 'escort', mileage: 260000 })
    assert.ok(v.fairValue >= 900, `got ${v.fairValue}`)
  })

  it('calls out an overpriced listing', () => {
    const v = estimateValue({ year: CURRENT_YEAR - 6, make: 'nissan', model: 'altima', mileage: 110000, price: 22000 })
    assert.equal(v.verdict, 'overpriced')
    assert.ok((v.deltaDollars ?? 0) > 0)
  })

  it('retains truck value better than a sedan of the same age', () => {
    const truck = estimateValue({ year: CURRENT_YEAR - 6, make: 'toyota', model: 'tacoma', mileage: 72000 })
    const sedan = estimateValue({ year: CURRENT_YEAR - 6, make: 'nissan', model: 'altima', mileage: 72000 })
    const truckRatio = truck.fairValue / resolveVehicle({ year: CURRENT_YEAR - 6, make: 'toyota', model: 'tacoma' }).originalMsrp
    const sedanRatio = sedan.fairValue / resolveVehicle({ year: CURRENT_YEAR - 6, make: 'nissan', model: 'altima' }).originalMsrp
    assert.ok(truckRatio > sedanRatio)
  })
})

describe('reliability and known issues', () => {
  it('applies model-year-scoped issues only to affected years', async () => {
    const bad = await report({ year: 2015, make: 'nissan', model: 'altima', mileage: 90000, price: 8000 })
    const good = await report({ year: 2022, make: 'nissan', model: 'altima', mileage: 30000, price: 19000 })

    assert.ok(bad.reliability.commonIssues.some((i) => /CVT/i.test(i.description)))
    assert.ok(!good.reliability.commonIssues.some((i) => /CVT overheating/i.test(i.description)))
  })

  it('scores a Toyota above a Land Rover of the same age', async () => {
    const toyota = await report({ year: CURRENT_YEAR - 5, make: 'toyota', model: 'camry', mileage: 60000, price: 18000 })
    const rover = await report({ year: CURRENT_YEAR - 5, make: 'land rover', model: 'range rover sport', mileage: 60000, price: 35000 })
    assert.ok(toyota.reliability.score > rover.reliability.score + 2)
  })
})

describe('red flags', () => {
  it('catches salvage wording, scam markers, and emissions deletes', async () => {
    const r = await report({
      year: 2016,
      make: 'ford',
      model: 'f-150',
      mileage: 120000,
      price: 12000,
      rawText:
        'Salvage title, DPF deleted and tuned. I am deployed overseas, my agent will contact you to arrange shipping. Must sell today.',
    })
    const ids = r.redFlags.map((f) => f.id)
    assert.ok(ids.includes('branded-title'))
    assert.ok(ids.includes('emissions-delete'))
    assert.ok(ids.includes('scam-markers'))
    assert.ok(ids.includes('pressure'))
  })

  it('flags a price far below market', async () => {
    const r = await report({ year: CURRENT_YEAR - 3, make: 'toyota', model: 'rav4', mileage: 40000, price: 6000 })
    assert.ok(r.redFlags.some((f) => f.id === 'too-cheap'))
  })

  it('flags implausibly low mileage for the age', async () => {
    const r = await report({ year: CURRENT_YEAR - 10, make: 'honda', model: 'civic', mileage: 14000, price: 15000 })
    assert.ok(r.redFlags.some((f) => f.id === 'suspiciously-low-miles'))
  })

  it('stays quiet on a clean listing', async () => {
    const r = await report({
      year: CURRENT_YEAR - 4,
      make: 'toyota',
      model: 'camry',
      mileage: 48000,
      price: 21000,
      vin: '4T1B11HK5KU123456',
      titleStatus: 'clean',
      accidentsReported: 0,
      zip: '97205',
      rawText: 'One owner, clean title, all maintenance records from the dealer. Non-smoker, garage kept.',
    })
    assert.equal(r.redFlags.filter((f) => f.severity === 'serious').length, 0)
  })
})

describe('buy score', () => {
  it('scores a well-priced reliable car far above an overpriced unreliable one', async () => {
    const good = await report({
      year: CURRENT_YEAR - 4,
      make: 'toyota',
      model: 'camry',
      mileage: 45000,
      price: 17000,
      titleStatus: 'clean',
      vin: '4T1B11HK5KU123456',
      rawText: 'Clean title, one owner, full service records, no accidents.',
    })
    const bad = await report({
      year: CURRENT_YEAR - 9,
      make: 'land rover',
      model: 'range rover sport',
      mileage: 145000,
      price: 26000,
      rawText: 'Salvage title, check engine light on, mechanic special, needs work.',
    })

    assert.ok(good.buyScore.score > 70, `good scored ${good.buyScore.score}`)
    assert.ok(bad.buyScore.score < 40, `bad scored ${bad.buyScore.score}`)
  })

  it('keeps the breakdown consistent with the total', async () => {
    const r = await report({ year: CURRENT_YEAR - 5, make: 'honda', model: 'accord', mileage: 70000, price: 16000 })
    const sum = r.buyScore.breakdown.reduce((s, b) => s + b.points, 0)
    assert.ok(Math.abs(sum - r.buyScore.score) <= 1, `breakdown ${sum} vs score ${r.buyScore.score}`)
    for (const b of r.buyScore.breakdown) {
      assert.ok(b.points >= 0 && b.points <= b.max, `${b.label} out of range`)
    }
  })

  it('always lands between 0 and 100', async () => {
    const cases: Listing[] = [
      { year: 1995, make: 'jaguar', model: 'xj', mileage: 250000, price: 30000, titleStatus: 'salvage' },
      { year: CURRENT_YEAR, make: 'toyota', model: 'corolla', mileage: 500, price: 1000 },
      {},
    ]
    for (const c of cases) {
      const r = await report(c)
      assert.ok(r.buyScore.score >= 0 && r.buyScore.score <= 100, `score ${r.buyScore.score}`)
    }
  })
})

describe('cost of ownership', () => {
  it('produces positive components that add up to the total', async () => {
    const r = await report({ year: CURRENT_YEAR - 4, make: 'honda', model: 'cr-v', mileage: 55000, price: 22000 }, { zip: '30303' })
    const o = r.ownership
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'number') assert.ok(v >= 0, `${k} was negative`)
    }
    const sum = o.fuel + o.insurance + o.maintenance + o.repairs + o.tires + o.registration + o.depreciation
    assert.ok(Math.abs(sum - o.total) <= 2, `components ${sum} vs total ${o.total}`)
    assert.ok(o.total > 10000 && o.total < 80000, `implausible total ${o.total}`)
  })

  it('charges an EV less for energy than a comparable gas car', async () => {
    const ev = await report({ year: CURRENT_YEAR - 3, make: 'tesla', model: 'model 3', mileage: 40000, price: 26000 })
    const gas = await report({ year: CURRENT_YEAR - 3, make: 'honda', model: 'accord', mileage: 40000, price: 26000 })
    assert.ok(ev.ownership.fuel < gas.ownership.fuel)
  })

  it('scales fuel cost with miles driven', async () => {
    const listing: Listing = { year: CURRENT_YEAR - 4, make: 'ford', model: 'f-150', mileage: 60000, price: 28000 }
    const low = await report(listing, { annualMiles: 6000 })
    const high = await report(listing, { annualMiles: 24000 })
    assert.ok(high.ownership.fuel > low.ownership.fuel * 3)
  })
})

describe('insurance', () => {
  it('charges a young driver substantially more', async () => {
    const listing: Listing = { year: CURRENT_YEAR - 4, make: 'honda', model: 'civic', mileage: 50000, price: 18000 }
    const young = await report(listing, { driverAge: 19, zip: '30303' })
    const older = await report(listing, { driverAge: 40, zip: '30303' })
    assert.ok(young.insurance.monthlyPoint > older.insurance.monthlyPoint * 1.8)
  })

  it('reflects state rate differences', async () => {
    const listing: Listing = { year: CURRENT_YEAR - 4, make: 'honda', model: 'civic', mileage: 50000, price: 18000 }
    const michigan = await report(listing, { driverAge: 40, zip: '48201' })
    const ohio = await report(listing, { driverAge: 40, zip: '43201' })
    assert.ok(michigan.insurance.monthlyPoint > ohio.insurance.monthlyPoint)
  })
})

describe('negotiation', () => {
  it('never suggests offering more than the asking price', async () => {
    const cases: Listing[] = [
      { year: CURRENT_YEAR - 3, make: 'toyota', model: 'rav4', mileage: 30000, price: 15000 },
      { year: CURRENT_YEAR - 8, make: 'bmw', model: '3 series', mileage: 120000, price: 9000 },
      { year: CURRENT_YEAR - 1, make: 'kia', model: 'telluride', mileage: 12000, price: 41000 },
    ]
    for (const c of cases) {
      const r = await report(c)
      assert.ok(r.negotiation.targetOffer <= (c.price ?? Infinity), `target above asking for ${c.model}`)
      assert.ok(r.negotiation.openingOffer <= r.negotiation.targetOffer)
      assert.ok(r.negotiation.targetOffer > 0)
    }
  })

  it('asks about the transmission on a CVT car', async () => {
    const r = await report({ year: 2016, make: 'nissan', model: 'rogue', mileage: 95000, price: 9000, transmission: 'cvt' })
    assert.ok(r.negotiation.questions.some((q) => /transmission fluid/i.test(q)))
  })
})

describe('lifestyle fit', () => {
  it('is omitted when the buyer answered nothing', async () => {
    const r = await report({ year: CURRENT_YEAR - 4, make: 'honda', model: 'civic', mileage: 50000, price: 18000 })
    assert.equal(r.lifestyle, undefined)
  })

  it('penalizes a two-seat-short car for a large household', async () => {
    const small = await report(
      { year: CURRENT_YEAR - 4, make: 'mini', model: 'cooper', mileage: 50000, price: 14000 },
      { householdSize: 6, needsTowing: true },
    )
    const big = await report(
      { year: CURRENT_YEAR - 4, make: 'toyota', model: 'sienna', mileage: 50000, price: 24000 },
      { householdSize: 6, needsTowing: true },
    )
    assert.ok(big.lifestyle!.score > small.lifestyle!.score)
  })
})

describe('alternatives', () => {
  it('suggests more reliable same-segment cars for a weak vehicle', async () => {
    const r = await report({ year: 2015, make: 'nissan', model: 'altima', mileage: 110000, price: 9000 })
    assert.ok(r.alternatives.length > 0)
    for (const alt of r.alternatives) {
      assert.ok((alt.reliabilityScore ?? 0) > r.reliability.score)
    }
    // One suggestion per brand keeps the list from being three Toyotas.
    const brands = r.alternatives.map((a) => a.make)
    assert.equal(new Set(brands).size, brands.length)
  })

  it('stays empty for a strong, fairly priced vehicle', async () => {
    const r = await report({
      year: CURRENT_YEAR - 3,
      make: 'toyota',
      model: 'camry',
      mileage: 32000,
      price: 20000,
      titleStatus: 'clean',
      vin: '4T1B11HK5KU123456',
      rawText: 'Clean title, one owner, service records, no accidents.',
    })
    assert.equal(r.alternatives.length, 0)
  })
})

describe('degraded input', () => {
  it('produces a complete report from an empty listing', async () => {
    const r = await report({})
    assert.ok(r.buyScore.score >= 0)
    assert.ok(r.valuation.fairValue > 0)
    assert.ok(r.ownership.total > 0)
    assert.equal(r.valuation.confidence, 'low')
    assert.ok(r.dataNotes.length > 0)
  })

  it('handles a model the catalog has never heard of', async () => {
    const r = await report({ year: 2019, make: 'peugeot', model: '308', mileage: 60000, price: 12000 })
    assert.ok(r.valuation.fairValue > 0)
    assert.ok(r.dataNotes.some((n) => /segment averages|catalog/i.test(n)))
  })
})
