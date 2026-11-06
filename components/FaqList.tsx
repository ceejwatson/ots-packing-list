"use client";
import { useState } from "react";
import { faqCategories, type FAQ, type FAQCategory } from "@/lib/faqs-data";

export default function FaqList({ faqs }: { faqs: FAQ[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FAQCategory | "all">("all");
  const q = query.trim().toLowerCase();
  const matches = (f: FAQ) =>
    (category === "all" || f.category === category) &&
    (!q || `${f.question} ${f.answer}`.toLowerCase().includes(q));
  const count = faqs.filter(matches).length;

  return (
    <>
      <label className="search-field mb-3">
        <span className="sr-only">Search questions</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 shrink-0"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions" />
      </label>

      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Topics">
        {[{ id: "all" as const, label: "All" }, ...faqCategories].map((c) => (
          <button
            key={c.id}
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`min-h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors ${category === c.id ? "bg-[#007AFF] text-white" : "bg-white text-slate-700 shadow-[0_0_0_1px_rgb(15_23_42/0.06)]"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p role="status" className="mb-1.5 px-4 text-[13px] uppercase tracking-wide text-slate-500">
        {count} {count === 1 ? "question" : "questions"}
      </p>

      <div className="surface divide-y divide-slate-100 overflow-hidden">
        {faqs.map((faq) => (
          <details key={faq.question} hidden={!matches(faq)} open={q && matches(faq) ? true : undefined} className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left active:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <h2 className="text-[15px] font-semibold leading-5 text-slate-900">{faq.question}</h2>
              <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" /></svg>
            </summary>
            <p className="px-4 pb-4 text-[15px] leading-6 text-slate-600">{faq.answer}</p>
          </details>
        ))}
        {count === 0 && (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No matching questions</h2>
            <p className="mt-2 text-sm text-slate-500">Try a different word, or clear the search.</p>
            <button className="mt-4 min-h-11 rounded-full bg-[#007AFF] px-5 text-[15px] font-semibold text-white" onClick={() => { setQuery(""); setCategory("all"); }}>Clear filters</button>
          </div>
        )}
      </div>
    </>
  );
}
