import type { BuyScore } from '@/lib/types'

/** Score color is deliberately conservative: only a genuinely good buy goes green. */
export function scoreColor(score: number): string {
  if (score >= 85) return '#12855f'
  if (score >= 70) return '#2f9e57'
  if (score >= 55) return '#b08214'
  if (score >= 40) return '#c2621c'
  return '#b3372d'
}

export default function ScoreDial({ score, grade }: { score: number; grade: BuyScore['grade'] }) {
  const size = 132
  const stroke = 11
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  // Three-quarter arc, so the gauge reads as a dial rather than a pie chart.
  const arc = circumference * 0.75
  const filled = arc * (Math.max(0, Math.min(100, score)) / 100)
  const color = scoreColor(score)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${score} out of 100 — ${grade}`}>
        <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={stroke}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="numeric text-[2.6rem] font-semibold leading-none tracking-tight" style={{ color }}>
          {score}
        </span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-wider muted">out of 100</span>
      </div>
    </div>
  )
}
