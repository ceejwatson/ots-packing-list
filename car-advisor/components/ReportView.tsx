'use client'

import { useMemo } from 'react'
import type { MaintenanceItem, Report } from '@/lib/types'
import Chat from './Chat'
import ScoreDial, { scoreColor } from './ScoreDial'

const money = (n?: number) =>
  n == null ? '—' : `$${Math.round(n).toLocaleString('en-US')}`

const SEVERITY_STYLE: Record<string, { label: string; color: string }> = {
  serious: { label: 'Serious', color: '#b3372d' },
  caution: { label: 'Caution', color: '#b08214' },
  info: { label: 'Note', color: '#5b6470' },
}

export default function ReportView({
  report,
  onReset,
  chatEnabled,
}: {
  report: Report
  onReset: () => void
  chatEnabled: boolean
}) {
  const { listing, buyScore, valuation, reliability, ownership, insurance, maintenance, redFlags, negotiation, lifestyle, alternatives } = report

  const title = useMemo(() => {
    const parts = [listing.year, cap(listing.make), cap(listing.model), listing.trim?.toUpperCase()].filter(Boolean)
    return parts.length ? parts.join(' ') : 'This vehicle'
  }, [listing])

  const maintenanceByYear = useMemo(() => groupByYear(maintenance.items), [maintenance.items])

  return (
    <div className="fade-up space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-[13px] muted">
            {listing.mileage ? `${listing.mileage.toLocaleString('en-US')} miles` : 'Mileage not stated'}
            {listing.price ? ` · listed at ${money(listing.price)}` : ''}
            {listing.sourceSite ? ` · ${listing.sourceSite}` : ''}
          </p>
        </div>
        <button
          onClick={onReset}
          className="shrink-0 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition hairline hover:opacity-70"
        >
          Check another
        </button>
      </div>

      {/* ---------- Verdict ---------- */}
      <section className="surface rounded-xl p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ScoreDial score={buyScore.score} grade={buyScore.grade} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-lg font-semibold" style={{ color: scoreColor(buyScore.score) }}>
              {buyScore.grade}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed">{report.summary ?? buyScore.headline}</p>
          </div>
        </div>

        {(buyScore.reasons.length > 0 || buyScore.concerns.length > 0) && (
          <div className="mt-6 grid gap-x-8 gap-y-4 border-t pt-5 hairline sm:grid-cols-2">
            {buyScore.reasons.length > 0 && (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider muted">In its favor</h3>
                <ul className="space-y-1.5 text-[14px]">
                  {buyScore.reasons.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span aria-hidden style={{ color: '#2f9e57' }}>+</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {buyScore.concerns.length > 0 && (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider muted">Working against it</h3>
                <ul className="space-y-1.5 text-[14px]">
                  {buyScore.concerns.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span aria-hidden style={{ color: '#c2621c' }}>−</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------- Price ---------- */}
      <Section title="What it's worth">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Asking price" value={money(valuation.askingPrice)} />
          <Stat label="Estimated fair value" value={money(valuation.fairValue)} sub={`${money(valuation.low)}–${money(valuation.high)}`} />
          <Stat
            label="Verdict"
            value={verdictLabel(valuation.verdict)}
            sub={
              valuation.deltaDollars != null
                ? `${valuation.deltaDollars > 0 ? 'Over' : 'Under'} by ${money(Math.abs(valuation.deltaDollars))}`
                : undefined
            }
            color={
              valuation.verdict === 'great-deal' || valuation.verdict === 'below-market'
                ? '#2f9e57'
                : valuation.verdict === 'overpriced'
                  ? '#b3372d'
                  : valuation.verdict === 'above-market'
                    ? '#b08214'
                    : undefined
            }
          />
        </div>
        <ul className="mt-5 space-y-2 border-t pt-4 text-[13px] leading-relaxed muted hairline">
          {valuation.basis.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </Section>

      {/* ---------- Red flags ---------- */}
      {redFlags.length > 0 && (
        <Section title={`Watch out for ${redFlags.length === 1 ? 'this' : 'these'}`}>
          <ul className="space-y-4">
            {redFlags.map((flag) => {
              const style = SEVERITY_STYLE[flag.severity]
              return (
                <li key={flag.id} className="border-l-2 pl-4" style={{ borderColor: style.color }}>
                  <div className="flex flex-wrap items-baseline gap-x-2.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: style.color }}
                    >
                      {style.label}
                    </span>
                    <span className="text-[15px] font-medium">{flag.title}</span>
                  </div>
                  <p className="mt-1.5 text-[14px] leading-relaxed muted">{flag.detail}</p>
                  {flag.action && (
                    <p className="mt-1.5 text-[14px] leading-relaxed">
                      <span className="font-medium">What to do: </span>
                      {flag.action}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {/* ---------- Reliability ---------- */}
      <Section title="How reliable it is">
        <div className="flex items-baseline gap-3">
          <span className="numeric text-3xl font-semibold tracking-tight">{reliability.score}</span>
          <span className="text-lg muted">/ 10</span>
        </div>
        <Meter value={reliability.score * 10} color={scoreColor(reliability.score * 10)} />

        {reliability.commonIssues.length > 0 ? (
          <div className="mt-6">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider muted">
              Known problems on this year and model
            </h4>
            <ul className="space-y-3.5">
              {reliability.commonIssues.map((issue, i) => (
                <li key={i} className="text-[14px] leading-relaxed">
                  <span className="font-medium">{issue.component}. </span>
                  <span>{issue.description}</span>
                  <span className="muted">
                    {issue.typicalOnsetMiles
                      ? ` Usually shows up around ${issue.typicalOnsetMiles.toLocaleString('en-US')} miles.`
                      : ''}
                    {issue.estimatedRepairCost
                      ? ` Repair runs ${money(issue.estimatedRepairCost[0])}–${money(issue.estimatedRepairCost[1])}.`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-[14px] muted">
            No widely documented failure modes for this year and model.
          </p>
        )}

        {reliability.notes.length > 0 && (
          <ul className="mt-5 space-y-2 border-t pt-4 text-[13px] leading-relaxed muted hairline">
            {reliability.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </Section>

      {/* ---------- Cost of ownership ---------- */}
      <Section title={`What five years actually costs`}>
        <p className="mb-4 text-[13px] muted">
          At {ownership.annualMiles.toLocaleString('en-US')} miles a year.
        </p>
        <CostRow label="Depreciation" value={ownership.depreciation} total={ownership.total} note="Only paid if you sell" />
        <CostRow label="Insurance" value={ownership.insurance} total={ownership.total} />
        <CostRow label="Fuel" value={ownership.fuel} total={ownership.total} />
        <CostRow label="Repairs" value={ownership.repairs} total={ownership.total} />
        <CostRow label="Maintenance" value={ownership.maintenance} total={ownership.total} />
        <CostRow label="Tires" value={ownership.tires} total={ownership.total} />
        <CostRow label="Registration and fees" value={ownership.registration} total={ownership.total} />

        <div className="mt-4 flex items-baseline justify-between border-t pt-4 hairline">
          <span className="text-[15px] font-semibold">Five-year total</span>
          <span className="numeric text-xl font-semibold">{money(ownership.total)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-[13px] muted">
          <span>Running costs only, ignoring depreciation</span>
          <span className="numeric">{money(ownership.totalExcludingDepreciation)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-[13px] muted">
          <span>Per mile, all in</span>
          <span className="numeric">${ownership.costPerMile.toFixed(2)}</span>
        </div>

        <details className="mt-5 border-t pt-4 hairline">
          <summary className="cursor-pointer text-[13px] font-medium muted">What this assumes</summary>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed muted">
            {ownership.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </details>
      </Section>

      {/* ---------- Insurance ---------- */}
      <Section title="Insurance">
        <div className="flex items-baseline gap-2">
          <span className="numeric text-3xl font-semibold tracking-tight">${insurance.monthlyPoint}</span>
          <span className="text-[15px] muted">/ month, full coverage</span>
        </div>
        <p className="mt-1 text-[13px] muted">
          Likely range ${insurance.monthlyLow}–${insurance.monthlyHigh} depending on carrier and coverage.
        </p>
        <ul className="mt-4 space-y-2 border-t pt-4 text-[13px] leading-relaxed muted hairline">
          {insurance.factors.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] leading-relaxed muted">{insurance.disclaimer}</p>
      </Section>

      {/* ---------- Maintenance forecast ---------- */}
      <Section title="What you'll be spending it on">
        {/* Year totals lead; the line items are one click away. Listing every
            oil change across five years buries the number that matters. */}
        <div className="space-y-3">
          {maintenanceByYear.map(({ year, total }) => (
            <div key={year}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[14px]">Year {year}</span>
                <span className="numeric shrink-0 text-[14px] font-medium">{money(total)}</span>
              </div>
              <div className="meter mt-1.5 h-1 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(total / Math.max(...maintenanceByYear.map((y) => y.total))) * 100}%`,
                    background: 'var(--accent)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <details className="mt-5 border-t pt-4 hairline">
          <summary className="cursor-pointer text-[13px] font-medium muted">
            See every line item
          </summary>
          <div className="mt-4 space-y-5">
            {maintenanceByYear.map(({ year, items }) => (
              <div key={year}>
                <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wider muted">
                  Year {year}
                </h4>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-4 text-[14px]">
                      <span className={item.kind === 'likely-repair' ? 'muted' : ''}>
                        {item.service}
                        {item.count > 1 && <span className="muted"> ×{item.count}</span>}
                      </span>
                      <span className="numeric shrink-0 muted">{money(item.estimatedCost)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <p className="mt-4 border-t pt-4 text-[12px] leading-relaxed muted hairline">
          Repair lines are probability-weighted: a $4,000 repair with a one-in-three chance of
          happening shows as roughly $1,300, because that is what it is worth budgeting.
        </p>
      </Section>

      {/* ---------- Negotiation ---------- */}
      <Section title="What to offer">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Open at" value={money(negotiation.openingOffer)} />
          <Stat label="Aim for" value={money(negotiation.targetOffer)} color="var(--accent)" />
          <Stat label="Walk away above" value={money(negotiation.walkAwayPrice)} />
        </div>

        <h4 className="mb-2.5 mt-6 text-[11px] font-semibold uppercase tracking-wider muted">Your leverage</h4>
        <ul className="space-y-2 text-[14px] leading-relaxed">
          {negotiation.leverage.map((l) => (
            <li key={l} className="flex gap-2.5">
              <span aria-hidden className="muted">·</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>

        <h4 className="mb-2.5 mt-6 text-[11px] font-semibold uppercase tracking-wider muted">Ask the seller</h4>
        <ol className="space-y-2 text-[14px] leading-relaxed">
          {negotiation.questions.map((q, i) => (
            <li key={q} className="flex gap-3">
              <span className="numeric shrink-0 muted">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------- Lifestyle ---------- */}
      {lifestyle && (
        <Section title="How well it fits your life">
          <div className="flex items-baseline gap-3">
            <span className="numeric text-3xl font-semibold tracking-tight">{lifestyle.score}%</span>
            <span className="text-[15px] muted">match</span>
          </div>
          <Meter value={lifestyle.score} color={scoreColor(lifestyle.score)} />
          <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {lifestyle.matches.length > 0 && (
              <div>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider muted">Works for you</h4>
                <ul className="space-y-2 text-[14px] leading-relaxed">
                  {lifestyle.matches.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {lifestyle.mismatches.length > 0 && (
              <div>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider muted">Doesn&rsquo;t</h4>
                <ul className="space-y-2 text-[14px] leading-relaxed">
                  {lifestyle.mismatches.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ---------- Alternatives ---------- */}
      {alternatives.length > 0 && (
        <Section title="Worth looking at instead">
          <ul className="space-y-4">
            {alternatives.map((alt) => (
              <li key={`${alt.make}-${alt.model}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="text-[15px] font-medium">
                    {alt.year} {alt.make} {alt.model}
                  </span>
                  {alt.approxPrice != null && (
                    <span className="numeric text-[14px] muted">around {money(alt.approxPrice)}</span>
                  )}
                </div>
                <p className="mt-1 text-[14px] leading-relaxed muted">{alt.reason}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------- Score breakdown ---------- */}
      <Section title="How the score was built">
        <ul className="space-y-4">
          {buyScore.breakdown.map((b) => (
            <li key={b.label}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[14px] font-medium">{b.label}</span>
                <span className="numeric shrink-0 text-[14px] muted">
                  {b.points} / {b.max}
                </span>
              </div>
              <Meter value={(b.points / b.max) * 100} color={scoreColor((b.points / b.max) * 100)} compact />
              <p className="mt-1.5 text-[13px] leading-relaxed muted">{b.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Data notes ---------- */}
      {report.dataNotes.length > 0 && (
        <Section title="What this analysis couldn't see">
          <ul className="space-y-2 text-[13px] leading-relaxed muted">
            {report.dataNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------- Chat ---------- */}
      <Chat report={report} enabled={chatEnabled} />
    </div>
  )
}

// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface rounded-xl p-6">
      <h3 className="mb-4 text-[15px] font-semibold tracking-tight">{title}</h3>
      {children}
    </section>
  )
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wider muted">{label}</p>
      <p className="numeric text-xl font-semibold tracking-tight" style={color ? { color } : undefined}>
        {value}
      </p>
      {sub && <p className="numeric mt-0.5 text-[13px] muted">{sub}</p>}
    </div>
  )
}

function Meter({ value, color, compact }: { value: number; color: string; compact?: boolean }) {
  return (
    <div className={`meter mt-2 w-full overflow-hidden rounded-full ${compact ? 'h-1' : 'h-1.5'}`}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  )
}

function CostRow({
  label,
  value,
  total,
  note,
}: {
  label: string
  value: number
  total: number
  note?: string
}) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[14px]">
          {label}
          {note && <span className="ml-2 text-[12px] muted">{note}</span>}
        </span>
        <span className="numeric shrink-0 text-[14px] font-medium">{money(value)}</span>
      </div>
      <div className="meter mt-1.5 h-1 w-full overflow-hidden rounded-full">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
      </div>
    </div>
  )
}

interface AggregatedItem extends MaintenanceItem {
  count: number
}

/**
 * Groups by year and folds repeats of the same service together, so a year with
 * two oil changes reads "Oil and filter change ×2 — $170" instead of two
 * separate lines.
 */
function groupByYear(items: MaintenanceItem[]) {
  const byYear = new Map<number, Map<string, AggregatedItem>>()

  for (const item of items) {
    const services = byYear.get(item.year) ?? new Map<string, AggregatedItem>()
    const existing = services.get(item.service)
    if (existing) {
      existing.count += 1
      existing.estimatedCost += item.estimatedCost
    } else {
      services.set(item.service, { ...item, count: 1 })
    }
    byYear.set(item.year, services)
  }

  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, services]) => {
      const list = [...services.values()].sort((a, b) => b.estimatedCost - a.estimatedCost)
      return {
        year,
        items: list,
        total: list.reduce((s, i) => s + i.estimatedCost, 0),
      }
    })
}

function verdictLabel(v: string): string {
  switch (v) {
    case 'great-deal':
      return 'Great price'
    case 'below-market':
      return 'Below market'
    case 'fair':
      return 'Fair price'
    case 'above-market':
      return 'Above market'
    case 'overpriced':
      return 'Overpriced'
    default:
      return 'No price listed'
  }
}

function cap(s?: string): string | undefined {
  if (!s) return undefined
  if (s === 'bmw' || s === 'gmc') return s.toUpperCase()
  return s
    .split(' ')
    .map((w) => (/^\d/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}
