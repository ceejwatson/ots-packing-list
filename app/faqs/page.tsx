import Link from "next/link";
import { faqs } from "@/lib/faqs-data";

export default function FAQsPage() {
  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
          Air Force OTS FAQs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Answers from the official guide and trainees who&apos;ve been through
          it. Updated for the CAO 27 March 2026 Orientation Guide.
        </p>
      </div>

      <div className="surface divide-y divide-slate-100">
        {faqs.map((faq) => (
          <details key={faq.question} className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <h2 className="text-sm font-semibold text-slate-900">
                {faq.question}
              </h2>
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/what-to-bring" className="surface p-4 text-sm font-semibold text-blue-800 hover:bg-slate-50">
          Full list of what to bring to OTS →
        </Link>
        <Link href="/reporting" className="surface p-4 text-sm font-semibold text-blue-800 hover:bg-slate-50">
          Day 1 reporting instructions →
        </Link>
      </div>

      <p className="mt-6 text-xs text-slate-500 text-center">
        When in doubt, the official Orientation Guide and your WINGS welcome
        email outrank everything on this page.
      </p>
    </main>
  );
}
