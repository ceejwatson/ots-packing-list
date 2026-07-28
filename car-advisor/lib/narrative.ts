import { MODEL, getClient, textOf } from './anthropic'
import type { Report } from './types'
import { vehicleName } from './vehicle'

/**
 * The model's role: explain the numbers, not produce them.
 *
 * Everything it is allowed to say is already computed and passed in. The system
 * prompt forbids inventing figures, because a plausible-sounding wrong price is
 * the single most damaging thing this product could output.
 */
const SUMMARY_SYSTEM = `You explain used-car buying analyses to ordinary people who are about to spend real money.

Absolute rules:
- Every number in your answer must come from the analysis given to you. Never estimate, adjust, round differently, or invent a figure. If a number is not in the analysis, do not state one.
- Do not contradict the score or the verdict. Explain them.
- If the analysis says confidence is low or data is missing, say so plainly rather than papering over it.

Style:
- Write like a knowledgeable friend who has bought a lot of cars, not like a brochure or a chatbot.
- Three to five sentences. Lead with the verdict, then the one or two things that actually drive it, then what the buyer should do next.
- No headers, no bullet points, no preamble, no emoji. Plain prose.
- Do not open with "Based on the analysis" or similar. Start with the substance.`

function analysisDigest(report: Report): string {
  const { listing, buyScore, valuation, reliability, ownership, redFlags, negotiation, lifestyle } = report

  const lines: string[] = [
    `Vehicle: ${vehicleName(listing)}`,
    listing.mileage ? `Mileage: ${listing.mileage.toLocaleString('en-US')}` : 'Mileage: not stated',
    `Buy Score: ${buyScore.score}/100 (${buyScore.grade})`,
    valuation.askingPrice
      ? `Asking $${valuation.askingPrice.toLocaleString('en-US')} against an estimated fair value of $${valuation.fairValue.toLocaleString('en-US')} (range $${valuation.low.toLocaleString('en-US')}-$${valuation.high.toLocaleString('en-US')}), confidence ${valuation.confidence}`
      : `Estimated fair value $${valuation.fairValue.toLocaleString('en-US')}, no asking price found`,
    `Reliability: ${reliability.score}/10`,
    `Five-year total cost of ownership: $${ownership.total.toLocaleString('en-US')} including $${ownership.depreciation.toLocaleString('en-US')} depreciation`,
    `Suggested offer: $${negotiation.targetOffer.toLocaleString('en-US')}; walk away above $${negotiation.walkAwayPrice.toLocaleString('en-US')}`,
  ]

  if (reliability.commonIssues.length) {
    lines.push(
      'Known issues for this year and model: ' +
        reliability.commonIssues.map((i) => `${i.component} — ${i.description}`).join(' | '),
    )
  }
  if (redFlags.length) {
    lines.push('Flags: ' + redFlags.map((f) => `[${f.severity}] ${f.title}`).join(' | '))
  } else {
    lines.push('Flags: none')
  }
  if (lifestyle) {
    lines.push(`Lifestyle match: ${lifestyle.score}%. Fits: ${lifestyle.matches.join('; ') || 'none noted'}. Does not fit: ${lifestyle.mismatches.join('; ') || 'none noted'}`)
  }
  if (report.dataNotes.length) {
    lines.push('Data gaps: ' + report.dataNotes.join(' | '))
  }

  return lines.join('\n')
}

export async function writeSummary(report: Report): Promise<string | undefined> {
  const client = getClient()
  if (!client) return fallbackSummary(report)

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SUMMARY_SYSTEM,
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: analysisDigest(report) }],
    })
    if (response.stop_reason === 'refusal') return fallbackSummary(report)
    return textOf(response) || fallbackSummary(report)
  } catch {
    return fallbackSummary(report)
  }
}

/** Deterministic summary, used when no model is configured or the call fails. */
function fallbackSummary(report: Report): string {
  const { buyScore, valuation, reliability, negotiation } = report
  const parts: string[] = [buyScore.headline]

  if (valuation.deltaDollars != null) {
    const over = valuation.deltaDollars > 0
    parts.push(
      `It is listed $${Math.abs(Math.round(valuation.deltaDollars)).toLocaleString('en-US')} ${over ? 'above' : 'below'} an estimated fair value of $${valuation.fairValue.toLocaleString('en-US')}.`,
    )
  }

  parts.push(`Reliability scores ${reliability.score}/10.`)

  const serious = report.redFlags.filter((f) => f.severity === 'serious')
  if (serious.length) {
    parts.push(`Before anything else, resolve this: ${serious[0].title.toLowerCase()}.`)
  }

  parts.push(
    `Open around $${negotiation.openingOffer.toLocaleString('en-US')}, aim for $${negotiation.targetOffer.toLocaleString('en-US')}, and walk if it goes past $${negotiation.walkAwayPrice.toLocaleString('en-US')}.`,
  )

  return parts.join(' ')
}
