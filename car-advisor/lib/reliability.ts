import type { ReliabilityAssessment } from './types'
import { clamp } from './valuation'
import type { ResolvedVehicle } from './vehicle'

/**
 * Reliability is a brand prior, overridden by model-level data where we have it,
 * then adjusted for the specific powertrain and how hard this example has lived.
 */
export function assessReliability(v: ResolvedVehicle): ReliabilityAssessment {
  const brandBaseline = v.brand.reliability
  let score = v.model?.reliability ?? brandBaseline
  const notes: string[] = []

  // ---- Powertrain risk ----
  const tx = v.listing.transmission
  if (tx === 'cvt') {
    score -= 0.5
    notes.push('CVT transmissions in this price range have a worse repair record than conventional automatics, and replacement usually costs more than a rebuild.')
  } else if (tx === 'dct') {
    score -= 0.4
    notes.push('Dual-clutch automatics wear clutch packs like a manual but cost far more to service.')
  } else if (tx === 'manual') {
    score += 0.2
    notes.push('The manual transmission is mechanically simpler and cheaper to repair, though clutch replacement is a normal wear expense.')
  }

  const engine = (v.listing.engine ?? '').toLowerCase()
  const turbo = /turbo|ecoboost|t-gdi|tsi|tfsi/.test(engine) || /turbo/.test((v.listing.trim ?? '').toLowerCase())
  if (turbo) {
    score -= 0.3
    notes.push('Turbocharged engines add hardware that eventually needs attention and are less forgiving of skipped oil changes.')
  }
  if (v.fuelType === 'hybrid' && ['toyota', 'lexus', 'honda'].includes(v.listing.make?.toLowerCase() ?? '')) {
    score += 0.3
    notes.push('This hybrid system has a strong long-term record; the engine spends less time under load and brakes last much longer.')
  }
  if (v.fuelType === 'electric') {
    notes.push('An electric drivetrain has far fewer wear items, but battery health matters more than mileage — ask for a state-of-health readout.')
  }
  if (v.fuelType === 'diesel') {
    score -= 0.3
    notes.push('Modern diesel emissions hardware (DPF, EGR, DEF system) is a common and expensive failure point on short-trip vehicles.')
  }

  // ---- How hard this example has lived ----
  if (v.mileage > 150000) {
    score -= 0.8
    notes.push(`At ${v.mileage.toLocaleString('en-US')} miles, major wear items are due or overdue regardless of how well the model holds up.`)
  } else if (v.mileage > 110000) {
    score -= 0.4
  } else if (v.mileage < 40000 && v.age >= 4) {
    notes.push('Unusually low mileage for its age. Verify it was driven regularly — cars that sit develop their own problems (dry seals, flat-spotted tires, fuel system deposits).')
  }

  if (v.age > 12) {
    score -= 0.5
    notes.push('Past twelve years, rubber and plastic components fail on a schedule set by age rather than mileage.')
  }

  if (v.geo.saltBelt) {
    notes.push('This is a road-salt state. Inspect the frame, brake lines, and subframe mounts — rust is the most common reason an otherwise good car gets scrapped here.')
  }

  // ---- Known issues drag the score down ----
  const highSeverity = v.issues.filter((i) => i.severity === 'high').length
  const mediumSeverity = v.issues.filter((i) => i.severity === 'medium').length
  score -= highSeverity * 0.45 + mediumSeverity * 0.15

  if (!v.model) {
    notes.push('No model-specific data was available, so this score reflects the brand average. Search the exact year and model for known problems before committing.')
  }

  return {
    score: Math.round(clamp(score, 1, 10) * 10) / 10,
    brandBaseline,
    commonIssues: v.issues.map(({ years, ...rest }) => rest),
    notes,
  }
}
