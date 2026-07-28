import type { BodyStyle, CommonIssue, Drivetrain, FuelType } from '@/lib/types'

/**
 * Curated catalog of the vehicles that show up most often in used listings.
 *
 * The `issues` entries are the well-documented, model-year-scoped failure modes
 * that actually change a buying decision — the things a good mechanic friend
 * would warn you about. They are scoped by year range so a 2021 Altima is not
 * penalized for a 2014 Altima's CVT.
 *
 * This catalog is deliberately small and hand-checked. See DESIGN.md for how to
 * swap it for a licensed data feed (NHTSA complaints + a commercial VIN/specs
 * API) without touching the scoring code.
 */

export interface CatalogIssue extends CommonIssue {
  /** Inclusive model-year range this issue applies to. Omit to apply to all years. */
  years?: [number, number]
}

export interface ModelProfile {
  make: string
  model: string
  bodyStyle: BodyStyle
  /** Base-trim MSRP in the reference year; overrides the segment default. */
  msrpRef?: number
  mpgCity?: number
  mpgHighway?: number
  seats?: number
  drivetrain?: Drivetrain
  fuelType?: FuelType
  /** Model-level reliability override on the brand prior (0-10). */
  reliability?: number
  retentionAdjust?: number
  awdAvailable?: boolean
  towingLbs?: number
  issues?: CatalogIssue[]
}

const M = (p: ModelProfile): ModelProfile => p

export const MODELS: ModelProfile[] = [
  // ---------- Toyota ----------
  M({
    make: 'toyota', model: 'camry', bodyStyle: 'sedan', msrpRef: 26000, mpgCity: 28, mpgHighway: 39,
    reliability: 9.4, retentionAdjust: 0.03,
    issues: [
      { component: 'Engine', description: 'Excessive oil consumption on the 2AZ-FE four-cylinder; check oil level before buying.', years: [2007, 2011], typicalOnsetMiles: 90000, estimatedRepairCost: [1200, 3000], severity: 'medium' },
      { component: 'Infotainment', description: 'Entune head unit freezing and Bluetooth dropouts.', years: [2018, 2020], estimatedRepairCost: [300, 900], severity: 'low' },
    ],
  }),
  M({
    make: 'toyota', model: 'corolla', bodyStyle: 'sedan', msrpRef: 21000, mpgCity: 31, mpgHighway: 40,
    reliability: 9.4, retentionAdjust: 0.03,
    issues: [
      { component: 'Transmission', description: 'CVT can feel coarse when cold; failures are rare but fluid service history matters.', years: [2014, 2024], typicalOnsetMiles: 130000, estimatedRepairCost: [3000, 4500], severity: 'low' },
    ],
  }),
  M({
    make: 'toyota', model: 'rav4', bodyStyle: 'suv-compact', msrpRef: 28000, mpgCity: 27, mpgHighway: 34,
    reliability: 9.1, retentionAdjust: 0.05, awdAvailable: true, towingLbs: 1500,
    issues: [
      { component: 'Fuel system', description: 'Fuel tank will not fill completely on AWD models; a known bulletin, not a safety issue.', years: [2019, 2021], estimatedRepairCost: [0, 600], severity: 'low' },
      { component: 'Transmission', description: 'Low-speed hesitation and clunk from the 8-speed automatic.', years: [2019, 2021], estimatedRepairCost: [0, 1200], severity: 'low' },
    ],
  }),
  M({
    make: 'toyota', model: 'highlander', bodyStyle: 'suv-midsize', msrpRef: 36000, mpgCity: 21, mpgHighway: 29,
    reliability: 9.0, retentionAdjust: 0.04, awdAvailable: true, seats: 8, towingLbs: 5000,
  }),
  M({
    make: 'toyota', model: '4runner', bodyStyle: 'suv-midsize', msrpRef: 39000, mpgCity: 16, mpgHighway: 19,
    reliability: 9.3, retentionAdjust: 0.14, awdAvailable: true, seats: 5, towingLbs: 5000,
    issues: [
      { component: 'Body', description: 'Rear hatch and frame rust in road-salt states; inspect underbody carefully.', typicalOnsetMiles: 120000, estimatedRepairCost: [500, 2500], severity: 'medium' },
    ],
  }),
  M({
    make: 'toyota', model: 'tacoma', bodyStyle: 'truck', msrpRef: 30000, mpgCity: 19, mpgHighway: 24,
    reliability: 9.0, retentionAdjust: 0.16, awdAvailable: true, towingLbs: 6400,
    issues: [
      { component: 'Frame', description: 'Frame corrosion on salt-belt trucks; Toyota ran a frame replacement campaign on earlier years.', years: [2005, 2015], estimatedRepairCost: [1000, 4000], severity: 'high' },
      { component: 'Suspension', description: 'Rear leaf spring squeak and premature sag under load.', years: [2016, 2023], estimatedRepairCost: [400, 1200], severity: 'low' },
    ],
  }),
  M({
    make: 'toyota', model: 'prius', bodyStyle: 'hatchback', msrpRef: 25000, mpgCity: 54, mpgHighway: 50,
    reliability: 9.1, fuelType: 'hybrid', retentionAdjust: 0.02,
    issues: [
      { component: 'Engine', description: 'Head gasket failure and high oil consumption on the third-generation 1.8L.', years: [2010, 2015], typicalOnsetMiles: 140000, estimatedRepairCost: [1800, 3200], severity: 'high' },
      { component: 'Emissions', description: 'EGR cooler clogging, which is what usually leads to the head gasket failure.', years: [2010, 2015], typicalOnsetMiles: 120000, estimatedRepairCost: [400, 900], severity: 'medium' },
      { component: 'Hybrid battery', description: 'Traction battery replacement becomes likely past this age; aftermarket packs cost far less than dealer.', typicalOnsetMiles: 180000, estimatedRepairCost: [1500, 3500], severity: 'medium' },
    ],
  }),
  M({ make: 'toyota', model: 'sienna', bodyStyle: 'minivan', msrpRef: 36000, mpgCity: 19, mpgHighway: 27, reliability: 8.9, seats: 8, awdAvailable: true }),
  M({ make: 'toyota', model: 'tundra', bodyStyle: 'truck', msrpRef: 40000, mpgCity: 17, mpgHighway: 22, reliability: 8.9, retentionAdjust: 0.1, towingLbs: 10000 }),

  // ---------- Honda / Acura ----------
  M({
    make: 'honda', model: 'accord', bodyStyle: 'sedan', msrpRef: 27000, mpgCity: 30, mpgHighway: 38,
    reliability: 9.0, retentionAdjust: 0.02,
    issues: [
      { component: 'Engine', description: 'Fuel dilution of engine oil on the 1.5L turbo in cold climates and short trips.', years: [2018, 2020], typicalOnsetMiles: 30000, estimatedRepairCost: [0, 1500], severity: 'medium' },
      { component: 'Starting system', description: 'Battery drain and no-start complaints traced to the infotainment module.', years: [2018, 2019], estimatedRepairCost: [200, 800], severity: 'low' },
    ],
  }),
  M({
    make: 'honda', model: 'civic', bodyStyle: 'sedan', msrpRef: 23000, mpgCity: 32, mpgHighway: 42,
    reliability: 9.0, retentionAdjust: 0.05,
    issues: [
      { component: 'Engine', description: 'Oil dilution on 1.5L turbo models — oil level rising and smelling of fuel.', years: [2016, 2018], typicalOnsetMiles: 25000, estimatedRepairCost: [0, 1500], severity: 'medium' },
      { component: 'A/C', description: 'Air conditioning condenser cracks and leaks; a very common warranty extension item.', years: [2016, 2020], typicalOnsetMiles: 50000, estimatedRepairCost: [700, 1400], severity: 'medium' },
    ],
  }),
  M({
    make: 'honda', model: 'cr-v', bodyStyle: 'suv-compact', msrpRef: 28000, mpgCity: 28, mpgHighway: 34,
    reliability: 8.9, retentionAdjust: 0.05, awdAvailable: true, towingLbs: 1500,
    issues: [
      { component: 'Engine', description: 'Oil dilution on the 1.5L turbo; Honda issued a software and oil-change fix.', years: [2017, 2019], typicalOnsetMiles: 25000, estimatedRepairCost: [0, 1500], severity: 'medium' },
      { component: 'A/C', description: 'Condenser failure leaving the system blowing warm.', years: [2017, 2020], typicalOnsetMiles: 50000, estimatedRepairCost: [700, 1400], severity: 'medium' },
    ],
  }),
  M({
    make: 'honda', model: 'pilot', bodyStyle: 'suv-midsize', msrpRef: 37000, mpgCity: 20, mpgHighway: 27,
    reliability: 8.2, awdAvailable: true, seats: 8, towingLbs: 5000,
    issues: [
      { component: 'Transmission', description: 'Nine-speed automatic with harsh shifts and hesitation; several software updates issued.', years: [2016, 2018], estimatedRepairCost: [0, 3500], severity: 'medium' },
      { component: 'Engine', description: 'Variable Cylinder Management causing spark plug fouling and vibration; many owners disable it.', typicalOnsetMiles: 90000, estimatedRepairCost: [400, 2500], severity: 'medium' },
    ],
  }),
  M({
    make: 'honda', model: 'odyssey', bodyStyle: 'minivan', msrpRef: 35000, mpgCity: 19, mpgHighway: 28,
    reliability: 8.0, seats: 8,
    issues: [
      { component: 'Transmission', description: 'Torque converter shudder and premature transmission wear on higher-mileage examples.', typicalOnsetMiles: 110000, estimatedRepairCost: [2500, 4500], severity: 'medium' },
      { component: 'Doors', description: 'Power sliding door motors and latches failing.', typicalOnsetMiles: 90000, estimatedRepairCost: [500, 1400], severity: 'low' },
    ],
  }),
  M({ make: 'honda', model: 'fit', bodyStyle: 'hatchback', msrpRef: 18000, mpgCity: 33, mpgHighway: 40, reliability: 8.9 }),
  M({ make: 'honda', model: 'hr-v', bodyStyle: 'suv-compact', msrpRef: 24000, mpgCity: 28, mpgHighway: 34, reliability: 8.6, awdAvailable: true }),
  M({
    make: 'acura', model: 'mdx', bodyStyle: 'suv-midsize', msrpRef: 48000, mpgCity: 19, mpgHighway: 26,
    reliability: 8.2, awdAvailable: true, seats: 7, towingLbs: 5000,
    issues: [
      { component: 'Engine', description: 'VCM-related oil consumption and misfires on the 3.5L V6.', typicalOnsetMiles: 100000, estimatedRepairCost: [500, 2500], severity: 'medium' },
    ],
  }),
  M({ make: 'acura', model: 'tlx', bodyStyle: 'sedan', msrpRef: 38000, mpgCity: 22, mpgHighway: 31, reliability: 8.3, awdAvailable: true }),

  // ---------- Mazda ----------
  M({ make: 'mazda', model: 'mazda3', bodyStyle: 'sedan', msrpRef: 23000, mpgCity: 27, mpgHighway: 36, reliability: 8.8, awdAvailable: true }),
  M({ make: 'mazda', model: 'cx-5', bodyStyle: 'suv-compact', msrpRef: 27000, mpgCity: 25, mpgHighway: 31, reliability: 8.8, awdAvailable: true, towingLbs: 2000 }),
  M({ make: 'mazda', model: 'cx-9', bodyStyle: 'suv-midsize', msrpRef: 36000, mpgCity: 20, mpgHighway: 26, reliability: 8.3, awdAvailable: true, seats: 7, towingLbs: 3500 }),
  M({ make: 'mazda', model: 'mazda6', bodyStyle: 'sedan', msrpRef: 25000, mpgCity: 26, mpgHighway: 35, reliability: 8.7 }),

  // ---------- Subaru ----------
  M({
    make: 'subaru', model: 'outback', bodyStyle: 'wagon', msrpRef: 28000, mpgCity: 26, mpgHighway: 33,
    reliability: 8.0, awdAvailable: true, drivetrain: 'awd', retentionAdjust: 0.04, towingLbs: 2700,
    issues: [
      { component: 'Engine', description: 'High oil consumption on the FB25 four-cylinder; subject of a class-action settlement.', years: [2011, 2015], typicalOnsetMiles: 70000, estimatedRepairCost: [1500, 3500], severity: 'high' },
      { component: 'Engine', description: 'Head gasket failure on the older EJ25 engine.', years: [2000, 2011], typicalOnsetMiles: 120000, estimatedRepairCost: [1800, 2800], severity: 'high' },
      { component: 'Transmission', description: 'CVT chain and valve body issues; Subaru extended the warranty on several years.', years: [2010, 2018], typicalOnsetMiles: 110000, estimatedRepairCost: [4000, 7000], severity: 'high' },
    ],
  }),
  M({
    make: 'subaru', model: 'forester', bodyStyle: 'suv-compact', msrpRef: 27000, mpgCity: 26, mpgHighway: 33,
    reliability: 8.0, awdAvailable: true, drivetrain: 'awd', retentionAdjust: 0.04,
    issues: [
      { component: 'Engine', description: 'FB25 oil consumption; check the dipstick and ask for oil-change records.', years: [2011, 2015], typicalOnsetMiles: 70000, estimatedRepairCost: [1500, 3500], severity: 'high' },
      { component: 'Transmission', description: 'CVT shudder and failure on early continuously variable units.', years: [2014, 2018], typicalOnsetMiles: 110000, estimatedRepairCost: [4000, 7000], severity: 'high' },
    ],
  }),
  M({ make: 'subaru', model: 'crosstrek', bodyStyle: 'suv-compact', msrpRef: 24000, mpgCity: 28, mpgHighway: 33, reliability: 8.2, drivetrain: 'awd', awdAvailable: true, retentionAdjust: 0.06 }),
  M({ make: 'subaru', model: 'impreza', bodyStyle: 'sedan', msrpRef: 20000, mpgCity: 28, mpgHighway: 36, reliability: 8.0, drivetrain: 'awd', awdAvailable: true }),
  M({
    make: 'subaru', model: 'wrx', bodyStyle: 'sedan', msrpRef: 30000, mpgCity: 19, mpgHighway: 26,
    reliability: 7.0, drivetrain: 'awd', awdAvailable: true,
    issues: [
      { component: 'Engine', description: 'Ringland failure on tuned or hard-driven EJ255 cars; a modified example is a real risk.', years: [2008, 2021], typicalOnsetMiles: 80000, estimatedRepairCost: [4000, 8000], severity: 'high' },
    ],
  }),

  // ---------- Nissan ----------
  M({
    make: 'nissan', model: 'altima', bodyStyle: 'sedan', msrpRef: 25000, mpgCity: 28, mpgHighway: 39,
    reliability: 6.6, retentionAdjust: -0.05,
    issues: [
      { component: 'Transmission', description: 'CVT overheating, shuddering, and outright failure — the defining problem with this car.', years: [2013, 2018], typicalOnsetMiles: 100000, estimatedRepairCost: [3500, 5000], severity: 'high' },
      { component: 'A/C', description: 'Compressor failure that sends debris through the system, turning a cheap job expensive.', typicalOnsetMiles: 90000, estimatedRepairCost: [900, 2000], severity: 'medium' },
      { component: 'Body', description: 'Hood latch and dashboard cracking complaints.', years: [2013, 2018], estimatedRepairCost: [200, 900], severity: 'low' },
    ],
  }),
  M({
    make: 'nissan', model: 'rogue', bodyStyle: 'suv-compact', msrpRef: 26000, mpgCity: 26, mpgHighway: 33,
    reliability: 6.6, awdAvailable: true, retentionAdjust: -0.05,
    issues: [
      { component: 'Transmission', description: 'CVT failure; Nissan extended coverage on several model years and it still fails after.', years: [2013, 2019], typicalOnsetMiles: 95000, estimatedRepairCost: [3500, 5000], severity: 'high' },
      { component: 'Safety systems', description: 'Automatic emergency braking activating with no obstacle present.', years: [2017, 2019], estimatedRepairCost: [0, 800], severity: 'medium' },
    ],
  }),
  M({
    make: 'nissan', model: 'sentra', bodyStyle: 'sedan', msrpRef: 21000, mpgCity: 29, mpgHighway: 39,
    reliability: 6.7, retentionAdjust: -0.05,
    issues: [
      { component: 'Transmission', description: 'CVT judder and failure, especially on pre-2020 cars.', years: [2013, 2019], typicalOnsetMiles: 95000, estimatedRepairCost: [3200, 4500], severity: 'high' },
    ],
  }),
  M({
    make: 'nissan', model: 'pathfinder', bodyStyle: 'suv-midsize', msrpRef: 34000, mpgCity: 20, mpgHighway: 27,
    reliability: 6.4, awdAvailable: true, seats: 7, towingLbs: 6000,
    issues: [
      { component: 'Transmission', description: 'CVT failure under load; towing accelerates it considerably.', years: [2013, 2020], typicalOnsetMiles: 90000, estimatedRepairCost: [4000, 6000], severity: 'high' },
    ],
  }),
  M({ make: 'nissan', model: 'frontier', bodyStyle: 'truck', msrpRef: 30000, mpgCity: 18, mpgHighway: 24, reliability: 7.6, retentionAdjust: 0.06, towingLbs: 6500 }),

  // ---------- Ford ----------
  M({
    make: 'ford', model: 'f-150', bodyStyle: 'truck', msrpRef: 36000, mpgCity: 19, mpgHighway: 24,
    reliability: 7.2, retentionAdjust: 0.08, awdAvailable: true, towingLbs: 11000,
    issues: [
      { component: 'Engine', description: 'Cam phaser rattle on the 3.5L EcoBoost — a cold-start knock that gets expensive.', years: [2011, 2017], typicalOnsetMiles: 90000, estimatedRepairCost: [2000, 4000], severity: 'high' },
      { component: 'Engine', description: 'Timing chain stretch on early EcoBoost engines run on long oil intervals.', years: [2011, 2016], typicalOnsetMiles: 120000, estimatedRepairCost: [2500, 4500], severity: 'high' },
      { component: 'Transmission', description: 'Ten-speed automatic harsh shifting and shudder.', years: [2017, 2020], estimatedRepairCost: [0, 3500], severity: 'medium' },
    ],
  }),
  M({
    make: 'ford', model: 'escape', bodyStyle: 'suv-compact', msrpRef: 27000, mpgCity: 26, mpgHighway: 31,
    reliability: 6.6, awdAvailable: true,
    issues: [
      { component: 'Engine', description: 'Coolant intrusion into the cylinders on the 1.6L EcoBoost, leading to overheating and fires; multiple recalls.', years: [2013, 2019], typicalOnsetMiles: 80000, estimatedRepairCost: [3000, 7000], severity: 'high' },
      { component: 'Transmission', description: 'Six-speed automatic shudder and shift-cable bushing failure.', years: [2013, 2019], typicalOnsetMiles: 100000, estimatedRepairCost: [1500, 3500], severity: 'medium' },
    ],
  }),
  M({
    make: 'ford', model: 'focus', bodyStyle: 'sedan', msrpRef: 20000, mpgCity: 26, mpgHighway: 36,
    reliability: 4.8, retentionAdjust: -0.08,
    issues: [
      { component: 'Transmission', description: 'PowerShift dual-clutch shuddering, slipping, and failing — the subject of a major class-action settlement. Avoid unless the clutch pack and TCM were replaced recently.', years: [2012, 2016], typicalOnsetMiles: 40000, estimatedRepairCost: [1500, 3500], severity: 'high' },
    ],
  }),
  M({
    make: 'ford', model: 'explorer', bodyStyle: 'suv-midsize', msrpRef: 36000, mpgCity: 20, mpgHighway: 27,
    reliability: 6.3, awdAvailable: true, seats: 7, towingLbs: 5000,
    issues: [
      { component: 'Drivetrain', description: 'Power transfer unit failure on AWD models; the fluid is not serviceable from the factory.', years: [2011, 2019], typicalOnsetMiles: 90000, estimatedRepairCost: [1500, 3000], severity: 'high' },
      { component: 'Exhaust', description: 'Exhaust manifold cracks and cabin exhaust odor; a long-running NHTSA investigation.', years: [2011, 2019], estimatedRepairCost: [800, 2000], severity: 'medium' },
    ],
  }),
  M({ make: 'ford', model: 'fusion', bodyStyle: 'sedan', msrpRef: 24000, mpgCity: 23, mpgHighway: 34, reliability: 6.9, awdAvailable: true }),
  M({ make: 'ford', model: 'mustang', bodyStyle: 'coupe', msrpRef: 30000, mpgCity: 19, mpgHighway: 28, reliability: 7.2, drivetrain: 'rwd' }),
  M({ make: 'ford', model: 'ranger', bodyStyle: 'truck', msrpRef: 30000, mpgCity: 21, mpgHighway: 26, reliability: 7.4, awdAvailable: true, towingLbs: 7500 }),

  // ---------- Chevrolet / GMC ----------
  M({
    make: 'chevrolet', model: 'equinox', bodyStyle: 'suv-compact', msrpRef: 26000, mpgCity: 26, mpgHighway: 31,
    reliability: 6.4, awdAvailable: true,
    issues: [
      { component: 'Engine', description: 'Severe oil consumption and timing chain wear on the 2.4L Ecotec; check for a rebuilt or replaced engine.', years: [2010, 2017], typicalOnsetMiles: 80000, estimatedRepairCost: [2500, 5000], severity: 'high' },
      { component: 'Engine', description: 'Coolant leaks and turbo failures on the 1.5L turbo.', years: [2018, 2022], typicalOnsetMiles: 80000, estimatedRepairCost: [1200, 3000], severity: 'medium' },
    ],
  }),
  M({
    make: 'chevrolet', model: 'silverado 1500', bodyStyle: 'truck', msrpRef: 36000, mpgCity: 18, mpgHighway: 23,
    reliability: 6.9, awdAvailable: true, retentionAdjust: 0.07, towingLbs: 9500,
    issues: [
      { component: 'Engine', description: 'Active Fuel Management lifter collapse on the 5.3L V8 — a top-end teardown when it happens.', years: [2007, 2021], typicalOnsetMiles: 100000, estimatedRepairCost: [2500, 5000], severity: 'high' },
      { component: 'Transmission', description: '8L90 eight-speed shudder from torque converter fluid contamination.', years: [2015, 2019], typicalOnsetMiles: 60000, estimatedRepairCost: [500, 3500], severity: 'medium' },
    ],
  }),
  M({
    make: 'chevrolet', model: 'cruze', bodyStyle: 'sedan', msrpRef: 20000, mpgCity: 28, mpgHighway: 38,
    reliability: 5.9, retentionAdjust: -0.06,
    issues: [
      { component: 'Cooling system', description: 'Chronic coolant leaks from plastic thermostat housings and water outlets.', years: [2011, 2019], typicalOnsetMiles: 70000, estimatedRepairCost: [400, 1200], severity: 'medium' },
      { component: 'Engine', description: 'PCV diaphragm failure causing a vacuum leak and rear main seal damage.', years: [2011, 2016], typicalOnsetMiles: 80000, estimatedRepairCost: [300, 1500], severity: 'medium' },
    ],
  }),
  M({
    make: 'chevrolet', model: 'malibu', bodyStyle: 'sedan', msrpRef: 24000, mpgCity: 29, mpgHighway: 36,
    reliability: 6.3,
    issues: [
      { component: 'Transmission', description: 'CVT and 9-speed complaints depending on year; confirm which unit the car has.', years: [2016, 2022], typicalOnsetMiles: 90000, estimatedRepairCost: [3000, 5000], severity: 'medium' },
    ],
  }),
  M({
    make: 'chevrolet', model: 'traverse', bodyStyle: 'suv-large', msrpRef: 35000, mpgCity: 18, mpgHighway: 27,
    reliability: 6.2, awdAvailable: true, seats: 8, towingLbs: 5000,
    issues: [
      { component: 'Engine', description: 'Timing chain stretch on the 3.6L V6 from extended oil intervals.', years: [2009, 2016], typicalOnsetMiles: 100000, estimatedRepairCost: [1800, 3500], severity: 'high' },
      { component: 'Transmission', description: '6T70 wave plate failure causing sudden loss of drive.', years: [2009, 2016], typicalOnsetMiles: 110000, estimatedRepairCost: [3000, 5000], severity: 'high' },
    ],
  }),
  M({ make: 'chevrolet', model: 'tahoe', bodyStyle: 'suv-large', msrpRef: 52000, mpgCity: 15, mpgHighway: 20, reliability: 6.9, awdAvailable: true, seats: 8, towingLbs: 8400 }),
  M({ make: 'gmc', model: 'sierra 1500', bodyStyle: 'truck', msrpRef: 38000, mpgCity: 18, mpgHighway: 23, reliability: 6.9, awdAvailable: true, retentionAdjust: 0.07, towingLbs: 9500 }),
  M({
    make: 'gmc', model: 'acadia', bodyStyle: 'suv-midsize', msrpRef: 35000, mpgCity: 19, mpgHighway: 26,
    reliability: 6.1, awdAvailable: true, seats: 7,
    issues: [
      { component: 'Engine', description: 'Timing chain wear on the 3.6L V6.', years: [2008, 2016], typicalOnsetMiles: 100000, estimatedRepairCost: [1800, 3500], severity: 'high' },
    ],
  }),

  // ---------- Jeep / Ram / Dodge ----------
  M({
    make: 'jeep', model: 'grand cherokee', bodyStyle: 'suv-midsize', msrpRef: 38000, mpgCity: 19, mpgHighway: 26,
    reliability: 5.8, awdAvailable: true, towingLbs: 6200,
    issues: [
      { component: 'Electrical', description: 'TIPM (integrated power module) failures causing no-starts, fuel pump and wiper faults.', years: [2011, 2015], typicalOnsetMiles: 80000, estimatedRepairCost: [900, 1800], severity: 'high' },
      { component: 'Suspension', description: 'Quadra-Lift air suspension leaks and compressor failure.', years: [2011, 2021], typicalOnsetMiles: 90000, estimatedRepairCost: [1200, 3000], severity: 'medium' },
      { component: 'Engine', description: 'Pentastar 3.6L oil cooler housing leaks dumping oil onto the valley.', typicalOnsetMiles: 90000, estimatedRepairCost: [900, 1800], severity: 'medium' },
    ],
  }),
  M({
    make: 'jeep', model: 'wrangler', bodyStyle: 'suv-compact', msrpRef: 35000, mpgCity: 17, mpgHighway: 23,
    reliability: 6.2, drivetrain: '4wd', awdAvailable: true, retentionAdjust: 0.16, towingLbs: 3500,
    issues: [
      { component: 'Steering', description: 'Front-end "death wobble" from worn track bar and steering damper components.', typicalOnsetMiles: 60000, estimatedRepairCost: [400, 1500], severity: 'medium' },
      { component: 'Engine', description: 'Pentastar oil cooler housing leak.', typicalOnsetMiles: 90000, estimatedRepairCost: [900, 1800], severity: 'medium' },
    ],
  }),
  M({
    make: 'jeep', model: 'cherokee', bodyStyle: 'suv-compact', msrpRef: 30000, mpgCity: 21, mpgHighway: 29,
    reliability: 5.6, awdAvailable: true,
    issues: [
      { component: 'Transmission', description: 'ZF nine-speed with harsh shifts, hunting, and limp-mode faults.', years: [2014, 2018], typicalOnsetMiles: 70000, estimatedRepairCost: [1500, 4000], severity: 'high' },
    ],
  }),
  M({ make: 'ram', model: '1500', bodyStyle: 'truck', msrpRef: 37000, mpgCity: 18, mpgHighway: 24, reliability: 6.5, awdAvailable: true, retentionAdjust: 0.06, towingLbs: 8500 }),
  M({ make: 'dodge', model: 'charger', bodyStyle: 'sedan', msrpRef: 33000, mpgCity: 19, mpgHighway: 30, reliability: 6.4, drivetrain: 'rwd', awdAvailable: true }),
  M({
    make: 'chrysler', model: 'pacifica', bodyStyle: 'minivan', msrpRef: 37000, mpgCity: 19, mpgHighway: 28,
    reliability: 5.9, seats: 8, awdAvailable: true,
    issues: [
      { component: 'Electrical', description: 'Widespread electrical gremlins: stalling, infotainment resets, and power door faults.', years: [2017, 2020], estimatedRepairCost: [500, 2500], severity: 'high' },
    ],
  }),

  // ---------- Hyundai / Kia ----------
  M({
    make: 'hyundai', model: 'sonata', bodyStyle: 'sedan', msrpRef: 24000, mpgCity: 28, mpgHighway: 38,
    reliability: 6.8,
    issues: [
      { component: 'Engine', description: 'Theta II 2.0T/2.4L rod bearing failure causing knock and seizure; covered by recalls and a settlement on many years. Confirm the recall work was done.', years: [2011, 2019], typicalOnsetMiles: 90000, estimatedRepairCost: [4000, 7000], severity: 'high' },
    ],
  }),
  M({
    make: 'hyundai', model: 'elantra', bodyStyle: 'sedan', msrpRef: 21000, mpgCity: 31, mpgHighway: 41,
    reliability: 7.2,
    issues: [
      { component: 'Engine', description: 'Nu 2.0L engine failures and excessive oil consumption on some years; check recall status by VIN.', years: [2017, 2020], typicalOnsetMiles: 80000, estimatedRepairCost: [3500, 6000], severity: 'high' },
    ],
  }),
  M({ make: 'hyundai', model: 'tucson', bodyStyle: 'suv-compact', msrpRef: 26000, mpgCity: 26, mpgHighway: 33, reliability: 7.3, awdAvailable: true }),
  M({ make: 'hyundai', model: 'santa fe', bodyStyle: 'suv-midsize', msrpRef: 30000, mpgCity: 22, mpgHighway: 28, reliability: 7.2, awdAvailable: true, seats: 7 }),
  M({
    make: 'kia', model: 'optima', bodyStyle: 'sedan', msrpRef: 24000, mpgCity: 27, mpgHighway: 37,
    reliability: 6.8,
    issues: [
      { component: 'Engine', description: 'Theta II engine failure, same family as the Hyundai Sonata; verify the recall inspection was performed.', years: [2011, 2019], typicalOnsetMiles: 90000, estimatedRepairCost: [4000, 7000], severity: 'high' },
    ],
  }),
  M({
    make: 'kia', model: 'sorento', bodyStyle: 'suv-midsize', msrpRef: 30000, mpgCity: 22, mpgHighway: 29,
    reliability: 7.0, awdAvailable: true, seats: 7, towingLbs: 3500,
    issues: [
      { component: 'Engine', description: 'Theta II engine failure on 2.4L and 2.0T versions of these years.', years: [2011, 2019], typicalOnsetMiles: 90000, estimatedRepairCost: [4000, 7000], severity: 'high' },
    ],
  }),
  M({ make: 'kia', model: 'soul', bodyStyle: 'hatchback', msrpRef: 20000, mpgCity: 27, mpgHighway: 33, reliability: 7.0 }),
  M({ make: 'kia', model: 'telluride', bodyStyle: 'suv-midsize', msrpRef: 34000, mpgCity: 20, mpgHighway: 26, reliability: 8.0, awdAvailable: true, seats: 8, retentionAdjust: 0.12, towingLbs: 5000 }),

  // ---------- Volkswagen ----------
  M({
    make: 'volkswagen', model: 'jetta', bodyStyle: 'sedan', msrpRef: 22000, mpgCity: 29, mpgHighway: 42,
    reliability: 6.4,
    issues: [
      { component: 'Engine', description: 'Timing chain tensioner failure on early EA888 engines; catastrophic if it lets go.', years: [2008, 2014], typicalOnsetMiles: 90000, estimatedRepairCost: [1200, 4000], severity: 'high' },
      { component: 'Cooling system', description: 'Water pump and thermostat housing leaks; treat as a scheduled expense, not a surprise.', typicalOnsetMiles: 80000, estimatedRepairCost: [700, 1400], severity: 'medium' },
      { component: 'Intake', description: 'Carbon buildup on direct-injection intake valves requiring walnut blasting.', typicalOnsetMiles: 80000, estimatedRepairCost: [500, 900], severity: 'medium' },
    ],
  }),
  M({
    make: 'volkswagen', model: 'tiguan', bodyStyle: 'suv-compact', msrpRef: 27000, mpgCity: 23, mpgHighway: 30,
    reliability: 6.2, awdAvailable: true,
    issues: [
      { component: 'Engine', description: 'Timing chain tensioner failure on the first-generation 2.0T.', years: [2009, 2017], typicalOnsetMiles: 90000, estimatedRepairCost: [1500, 4000], severity: 'high' },
    ],
  }),
  M({ make: 'volkswagen', model: 'golf', bodyStyle: 'hatchback', msrpRef: 24000, mpgCity: 29, mpgHighway: 37, reliability: 6.6 }),

  // ---------- German luxury ----------
  M({
    make: 'bmw', model: '3 series', bodyStyle: 'sedan', msrpRef: 42000, mpgCity: 25, mpgHighway: 34,
    reliability: 5.9, drivetrain: 'rwd', awdAvailable: true,
    issues: [
      { component: 'Engine', description: 'N20 timing chain guide failure — a known engine-out repair on these years.', years: [2012, 2015], typicalOnsetMiles: 90000, estimatedRepairCost: [3500, 6000], severity: 'high' },
      { component: 'Engine', description: 'Valve cover and oil filter housing gasket leaks; near-universal past 80k.', typicalOnsetMiles: 80000, estimatedRepairCost: [800, 2000], severity: 'medium' },
      { component: 'Cooling system', description: 'Electric water pump and expansion tank failures that can strand the car.', typicalOnsetMiles: 90000, estimatedRepairCost: [900, 1800], severity: 'medium' },
    ],
  }),
  M({
    make: 'bmw', model: 'x3', bodyStyle: 'suv-compact', msrpRef: 45000, mpgCity: 23, mpgHighway: 29,
    reliability: 5.9, awdAvailable: true,
    issues: [
      { component: 'Engine', description: 'Oil filter housing and valve cover gasket leaks.', typicalOnsetMiles: 80000, estimatedRepairCost: [900, 2000], severity: 'medium' },
    ],
  }),
  M({
    make: 'mercedes-benz', model: 'c-class', bodyStyle: 'sedan', msrpRef: 45000, mpgCity: 23, mpgHighway: 33,
    reliability: 5.7, drivetrain: 'rwd', awdAvailable: true,
    issues: [
      { component: 'Engine', description: 'Oil leaks from the turbo oil lines and camshaft adjuster solenoids.', typicalOnsetMiles: 80000, estimatedRepairCost: [900, 2500], severity: 'medium' },
      { component: 'Electronics', description: 'COMAND and sensor faults that are dealer-diagnosis expensive.', typicalOnsetMiles: 80000, estimatedRepairCost: [500, 2500], severity: 'medium' },
    ],
  }),
  M({
    make: 'audi', model: 'a4', bodyStyle: 'sedan', msrpRef: 42000, mpgCity: 25, mpgHighway: 34,
    reliability: 5.9, awdAvailable: true,
    issues: [
      { component: 'Engine', description: 'Excessive oil consumption from piston ring design on the 2.0T of these years.', years: [2009, 2012], typicalOnsetMiles: 70000, estimatedRepairCost: [4000, 7000], severity: 'high' },
      { component: 'Engine', description: 'Timing chain tensioner failure; check for the updated part.', years: [2009, 2013], typicalOnsetMiles: 90000, estimatedRepairCost: [2000, 5000], severity: 'high' },
    ],
  }),
  M({
    make: 'land rover', model: 'range rover sport', bodyStyle: 'suv-midsize', msrpRef: 70000, mpgCity: 17, mpgHighway: 23,
    reliability: 4.2, awdAvailable: true, retentionAdjust: -0.08,
    issues: [
      { component: 'Suspension', description: 'Air suspension compressor and bag failures.', typicalOnsetMiles: 70000, estimatedRepairCost: [1500, 4000], severity: 'high' },
      { component: 'Electrical', description: 'Persistent module and infotainment faults that are hard to diagnose outside a dealer.', estimatedRepairCost: [800, 3000], severity: 'high' },
    ],
  }),
  M({ make: 'lexus', model: 'rx', bodyStyle: 'suv-midsize', msrpRef: 46000, mpgCity: 20, mpgHighway: 27, reliability: 9.2, awdAvailable: true, retentionAdjust: 0.05 }),
  M({ make: 'lexus', model: 'es', bodyStyle: 'sedan', msrpRef: 41000, mpgCity: 22, mpgHighway: 32, reliability: 9.2 }),
  M({
    make: 'volvo', model: 'xc90', bodyStyle: 'suv-midsize', msrpRef: 50000, mpgCity: 20, mpgHighway: 27,
    reliability: 6.2, awdAvailable: true, seats: 7,
    issues: [
      { component: 'Electronics', description: 'Sensus infotainment freezes and 12V battery drain complaints.', years: [2016, 2020], estimatedRepairCost: [400, 1800], severity: 'medium' },
    ],
  }),
  M({
    make: 'mini', model: 'cooper', bodyStyle: 'hatchback', msrpRef: 25000, mpgCity: 28, mpgHighway: 38,
    reliability: 5.8,
    issues: [
      { component: 'Engine', description: 'Timing chain tensioner rattle ("death rattle") on the N14 engine.', years: [2007, 2013], typicalOnsetMiles: 70000, estimatedRepairCost: [1500, 3500], severity: 'high' },
      { component: 'Cooling system', description: 'Plastic thermostat housing and water pump leaks.', typicalOnsetMiles: 70000, estimatedRepairCost: [800, 1600], severity: 'medium' },
    ],
  }),

  // ---------- EV ----------
  M({
    make: 'tesla', model: 'model 3', bodyStyle: 'sedan', msrpRef: 45000, mpgCity: 130, mpgHighway: 120,
    reliability: 6.8, fuelType: 'electric', drivetrain: 'rwd', awdAvailable: true, retentionAdjust: -0.06,
    issues: [
      { component: 'Suspension', description: 'Front upper control arm bushings and knuckle wear producing a clunk.', typicalOnsetMiles: 60000, estimatedRepairCost: [400, 1200], severity: 'low' },
      { component: 'Body', description: 'Panel gap, paint, and trim quality complaints on earlier build dates.', years: [2017, 2020], estimatedRepairCost: [0, 1500], severity: 'low' },
    ],
  }),
  M({ make: 'tesla', model: 'model y', bodyStyle: 'suv-compact', msrpRef: 52000, mpgCity: 125, mpgHighway: 115, reliability: 6.7, fuelType: 'electric', drivetrain: 'awd', awdAvailable: true, retentionAdjust: -0.06 }),
  M({ make: 'chevrolet', model: 'bolt', bodyStyle: 'hatchback', msrpRef: 32000, mpgCity: 127, mpgHighway: 108, reliability: 7.0, fuelType: 'electric', retentionAdjust: -0.12,
    issues: [
      { component: 'Battery', description: 'LG battery fire recall; confirm the replacement pack was installed — it resets the battery warranty and is a genuine plus.', years: [2017, 2022], estimatedRepairCost: [0, 0], severity: 'medium' },
    ],
  }),
]

const INDEX = new Map<string, ModelProfile>()
for (const m of MODELS) INDEX.set(`${m.make}|${m.model}`, m)

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Look up a model, tolerating trim noise like "Camry SE" or "F-150 XLT SuperCrew". */
export function findModel(make?: string, model?: string): ModelProfile | undefined {
  if (!make || !model) return undefined
  const mk = normalize(make)
  const md = normalize(model)
  const exact = INDEX.get(`${mk}|${md}`)
  if (exact) return exact

  const candidates = MODELS.filter((m) => m.make === mk)
  // Longest catalog name that the listing's model string starts with wins, so
  // "silverado 1500 lt" matches "silverado 1500" and not a shorter entry.
  let best: ModelProfile | undefined
  for (const c of candidates) {
    if (md === c.model || md.startsWith(c.model + ' ') || md.replace(/-/g, '') === c.model.replace(/-/g, '')) {
      if (!best || c.model.length > best.model.length) best = c
    }
  }
  if (best) return best

  for (const c of candidates) {
    if (md.includes(c.model)) {
      if (!best || c.model.length > best.model.length) best = c
    }
  }
  return best
}

/** Issues that apply to a specific model year. */
export function issuesForYear(profile: ModelProfile | undefined, year?: number): CatalogIssue[] {
  if (!profile?.issues) return []
  return profile.issues.filter((i) => {
    if (!i.years) return true
    if (!year) return true
    return year >= i.years[0] && year <= i.years[1]
  })
}

/** Same-segment vehicles, used to suggest alternatives. */
export function peersInSegment(body: BodyStyle, excludeKey?: string): ModelProfile[] {
  return MODELS.filter((m) => m.bodyStyle === body && `${m.make}|${m.model}` !== excludeKey)
}
