'use client'

import { useRef, useState } from 'react'
import type { Report } from '@/lib/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Would this survive 200,000 miles?',
  'What should I look for on the test drive?',
  'Is it worth negotiating, or should I walk?',
  'Should I wait six months?',
]

export default function Chat({ report, enabled }: { report: Report; enabled: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  async function send(question: string) {
    const trimmed = question.trim()
    if (!trimmed || streaming) return

    const next: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ report, messages: next }),
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        setMessages([...next, { role: 'assistant', content: data.error ?? 'Something went wrong. Try again.' }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      setMessages([...next, { role: 'assistant', content: '' }])

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages([...next, { role: 'assistant', content: acc }])
        endRef.current?.scrollIntoView({ block: 'nearest' })
      }
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Could not reach the server. Try again.' }])
    } finally {
      setStreaming(false)
    }
  }

  if (!enabled) return null

  return (
    <section className="surface rounded-xl p-6">
      <h3 className="mb-1 text-[15px] font-semibold tracking-tight">Ask about this car</h3>
      <p className="mb-4 text-[13px] muted">
        Answers use only this analysis, so the numbers stay consistent with what&rsquo;s above.
      </p>

      {messages.length > 0 && (
        <div className="mb-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <div
                className={`inline-block max-w-[85%] rounded-xl px-4 py-2.5 text-left text-[14px] leading-relaxed ${
                  m.role === 'user' ? 'surface-2' : ''
                }`}
                style={m.role === 'assistant' ? { paddingLeft: 0, paddingRight: 0 } : undefined}
              >
                {m.content || <span className="muted">Thinking…</span>}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}

      {messages.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border px-3.5 py-1.5 text-[13px] transition hairline hover:opacity-70"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this car"
          aria-label="Your question"
          className="w-full rounded-lg border bg-transparent px-3.5 py-2.5 text-[14px] outline-none hairline placeholder:text-[color:var(--muted)]"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="shrink-0 rounded-lg px-4 py-2.5 text-[14px] font-semibold text-white transition disabled:opacity-40"
          style={{ background: 'var(--accent)' }}
        >
          Ask
        </button>
      </form>
    </section>
  )
}
