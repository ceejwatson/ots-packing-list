import Analyzer from '@/components/Analyzer'
import { hasModelAccess } from '@/lib/anthropic'

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:pt-16">
      <header className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] muted">Used car check</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-[2.6rem]">
          Paste any car listing.
          <br />
          Know if it&rsquo;s a good deal in 10 seconds.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed muted">
          Real market value, what breaks on that exact year and model, what it costs to own for five
          years, and the number you should actually offer.
        </p>
      </header>

      <Analyzer modelAvailable={hasModelAccess()} />

      <footer className="mt-20 border-t pt-6 text-xs leading-relaxed muted hairline">
        <p>
          Estimates are modeled from public data and published cost studies, not quotes. Always get a
          pre-purchase inspection from a mechanic you chose before buying a used vehicle.
        </p>
      </footer>
    </main>
  )
}
