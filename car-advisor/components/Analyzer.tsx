'use client'

import { useState } from 'react'
import type { BuyerProfile, Report } from '@/lib/types'
import ReportView from './ReportView'
import ProfileFields from './ProfileFields'

export default function Analyzer({ modelAvailable }: { modelAvailable: boolean }) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [profile, setProfile] = useState<BuyerProfile>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<Report | null>(null)

  async function analyze(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() && !text.trim()) {
      setError('Paste a listing link, or the listing text itself.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url.trim() || undefined, text: text.trim() || undefined, profile }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.')
        // A blocked or unreadable page is the most common failure. Open the
        // paste box automatically so the user has an obvious next step.
        if (data.needsPaste) setShowPaste(true)
        return
      }

      setReport(data.report as Report)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setReport(null)
    setError(null)
    setUrl('')
    setText('')
    setShowPaste(false)
  }

  if (report) {
    return <ReportView report={report} onReset={reset} chatEnabled={modelAvailable} />
  }

  return (
    <form onSubmit={analyze} className="space-y-4">
      <div className="surface rounded-xl p-1.5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a listing link"
            aria-label="Listing URL"
            className="w-full bg-transparent px-3.5 py-3 text-[15px] outline-none placeholder:text-[color:var(--muted)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-lg px-5 py-3 text-[15px] font-semibold text-white transition disabled:opacity-60 sm:min-w-[9rem]"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'Checking…' : 'Check it'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
        <button
          type="button"
          onClick={() => setShowPaste((v) => !v)}
          className="underline underline-offset-4 muted transition hover:opacity-70"
        >
          {showPaste ? 'Hide listing text' : 'Or paste the listing text'}
        </button>
        <button
          type="button"
          onClick={() => setShowProfile((v) => !v)}
          className="underline underline-offset-4 muted transition hover:opacity-70"
        >
          {showProfile ? 'Hide your details' : 'Add your details for a better answer'}
        </button>
      </div>

      {showPaste && (
        <div className="fade-up space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder={
              'Paste everything from the listing — title, price, mileage, and the seller’s description.\n\nExample:\n2018 Honda CR-V EX AWD — $19,500\n78,000 miles, clean title, one owner, no accidents.\nWell maintained, all service records. Selling because we need a third row.'
            }
            className="w-full resize-y rounded-xl px-4 py-3.5 text-[14px] leading-relaxed outline-none surface placeholder:text-[color:var(--muted)]"
          />
          <p className="text-[12px] muted">
            Facebook Marketplace and Craigslist don&rsquo;t allow listings to be read automatically.
            Copy and paste works everywhere and gives the same analysis.
          </p>
        </div>
      )}

      {showProfile && (
        <div className="fade-up">
          <ProfileFields profile={profile} onChange={setProfile} />
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg px-4 py-3 text-[14px] leading-relaxed"
          style={{ background: 'var(--surface-2)' }}
        >
          {error}
        </p>
      )}

      {!modelAvailable && (
        <p className="text-[12px] leading-relaxed muted">
          Running without an API key: listings are read with pattern matching only, and follow-up
          questions are disabled. Scoring, pricing, and cost analysis work fully either way.
        </p>
      )}
    </form>
  )
}
