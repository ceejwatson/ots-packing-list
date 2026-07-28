import { MODEL, getClient } from '@/lib/anthropic'
import type { Report } from '@/lib/types'
import { vehicleName } from '@/lib/vehicle'

export const runtime = 'nodejs'
export const maxDuration = 60

const CHAT_SYSTEM = `You are answering follow-up questions about a specific used vehicle a person is considering buying. The full analysis of that vehicle is provided below.

Absolute rules:
- Any figure about this vehicle — price, value, cost, score — must come from the analysis. Never invent or re-estimate one. If the analysis does not contain a number the question needs, say what is missing and what the buyer should ask the seller.
- General automotive knowledge (how a CVT works, what a compression test tells you, what to look for on a test drive) is fair game and useful. The restriction is on numbers specific to this car.
- Do not contradict the analysis. If the buyer disagrees with it, explain what drives the figure and what would change it.

Style:
- Answer the question directly in the first sentence. Two to four sentences total unless genuinely more is needed.
- Plain prose, no headers or bullets, no preamble.
- Be honest when the answer is "nobody can know that without seeing the car."`

function reportContext(report: Report): string {
  const { listing, buyScore, valuation, reliability, ownership, insurance, redFlags, negotiation, lifestyle, alternatives } = report

  return [
    `VEHICLE: ${vehicleName(listing)}${listing.trim ? ` ${listing.trim}` : ''}`,
    `Mileage: ${listing.mileage?.toLocaleString('en-US') ?? 'not stated'}`,
    `Transmission: ${listing.transmission ?? 'unknown'}; Drivetrain: ${listing.drivetrain ?? 'unknown'}; Fuel: ${listing.fuelType ?? 'unknown'}`,
    `Title: ${listing.titleStatus ?? 'unknown'}; Seller: ${listing.sellerType ?? 'unknown'}`,
    '',
    `BUY SCORE: ${buyScore.score}/100 — ${buyScore.grade}. ${buyScore.headline}`,
    `Score breakdown: ${buyScore.breakdown.map((b) => `${b.label} ${b.points}/${b.max} (${b.detail})`).join(' | ')}`,
    '',
    `VALUE: asking ${valuation.askingPrice ? `$${valuation.askingPrice.toLocaleString('en-US')}` : 'unknown'}, estimated fair value $${valuation.fairValue.toLocaleString('en-US')} (range $${valuation.low.toLocaleString('en-US')}-$${valuation.high.toLocaleString('en-US')}), confidence ${valuation.confidence}.`,
    `How that value was built: ${valuation.basis.join(' ')}`,
    '',
    `RELIABILITY: ${reliability.score}/10 (brand baseline ${reliability.brandBaseline}).`,
    reliability.commonIssues.length
      ? `Known issues: ${reliability.commonIssues.map((i) => `${i.component}: ${i.description}${i.typicalOnsetMiles ? ` Typically around ${i.typicalOnsetMiles.toLocaleString('en-US')} miles.` : ''}${i.estimatedRepairCost ? ` Repair $${i.estimatedRepairCost[0].toLocaleString('en-US')}-$${i.estimatedRepairCost[1].toLocaleString('en-US')}.` : ''}`).join(' | ')}`
      : 'Known issues: none documented for this year and model.',
    reliability.notes.length ? `Notes: ${reliability.notes.join(' ')}` : '',
    '',
    `FIVE-YEAR COST (${ownership.annualMiles.toLocaleString('en-US')} mi/yr): total $${ownership.total.toLocaleString('en-US')} — fuel $${ownership.fuel.toLocaleString('en-US')}, insurance $${ownership.insurance.toLocaleString('en-US')}, maintenance $${ownership.maintenance.toLocaleString('en-US')}, repairs $${ownership.repairs.toLocaleString('en-US')}, tires $${ownership.tires.toLocaleString('en-US')}, registration $${ownership.registration.toLocaleString('en-US')}, depreciation $${ownership.depreciation.toLocaleString('en-US')}. That is $${ownership.costPerMile.toFixed(2)} per mile.`,
    `Assumptions: ${ownership.assumptions.join(' ')}`,
    '',
    `INSURANCE: about $${insurance.monthlyPoint}/month (range $${insurance.monthlyLow}-$${insurance.monthlyHigh}). Factors: ${insurance.factors.join(' ')}`,
    '',
    redFlags.length
      ? `RED FLAGS: ${redFlags.map((f) => `[${f.severity}] ${f.title} — ${f.detail}${f.action ? ` Action: ${f.action}` : ''}`).join(' | ')}`
      : 'RED FLAGS: none detected.',
    '',
    `NEGOTIATION: open at $${negotiation.openingOffer.toLocaleString('en-US')}, target $${negotiation.targetOffer.toLocaleString('en-US')}, walk away above $${negotiation.walkAwayPrice.toLocaleString('en-US')}. Leverage: ${negotiation.leverage.join(' | ')}`,
    lifestyle ? `\nLIFESTYLE FIT: ${lifestyle.score}%. Fits: ${lifestyle.matches.join('; ')}. Does not fit: ${lifestyle.mismatches.join('; ')}` : '',
    alternatives.length
      ? `\nALTERNATIVES CONSIDERED: ${alternatives.map((a) => `${a.year} ${a.make} ${a.model} (~$${a.approxPrice?.toLocaleString('en-US')}, reliability ${a.reliabilityScore}/10) — ${a.reason}`).join(' | ')}`
      : '',
    report.dataNotes.length ? `\nDATA GAPS: ${report.dataNotes.join(' | ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

interface ChatBody {
  report?: Report
  messages?: { role: 'user' | 'assistant'; content: string }[]
}

export async function POST(request: Request) {
  const client = getClient()
  if (!client) {
    return Response.json(
      { error: 'Follow-up questions need an ANTHROPIC_API_KEY to be configured on the server.' },
      { status: 503 },
    )
  }

  let body: ChatBody
  try {
    body = (await request.json()) as ChatBody
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { report, messages } = body
  if (!report || !messages?.length) {
    return Response.json({ error: 'Missing report or messages.' }, { status: 400 })
  }

  // Cap history so a long conversation cannot grow the request without bound.
  const history = messages.slice(-20).map((m) => ({
    role: m.role,
    content: String(m.content).slice(0, 4000),
  }))

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 2000,
      output_config: { effort: 'low' },
      system: [
        {
          type: 'text',
          text: CHAT_SYSTEM,
          // The system prompt and the report are identical across every turn of
          // a conversation, so cache them and pay full price only for the question.
          cache_control: { type: 'ephemeral' },
        },
        { type: 'text', text: `\n\nANALYSIS OF THIS VEHICLE:\n${reportContext(report)}` },
      ],
      messages: history,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          const final = await stream.finalMessage()
          if (final.stop_reason === 'refusal') {
            controller.enqueue(encoder.encode('I am not able to answer that one. Try asking about the car itself.'))
          }
        } catch {
          controller.enqueue(encoder.encode('\n\nSomething went wrong answering that. Try again.'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    })
  } catch (err) {
    console.error('chat failed', err)
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
