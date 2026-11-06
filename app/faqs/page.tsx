import Link from "next/link";
import FaqList from "@/components/FaqList";
import { faqs } from "@/lib/faqs-data";

export default function FAQsPage() {
  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="mb-6">
        <h1 className="text-[32px] font-bold leading-9 tracking-tight text-slate-900 sm:text-4xl">
          Air Force OTS FAQs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Answers from the official guide and trainees who&apos;ve been through
          it. Updated for the CAO 27 March 2026 Orientation Guide.
        </p>
      </div>

      <FaqList faqs={faqs} />

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
