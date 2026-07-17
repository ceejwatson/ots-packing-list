"use client";

import { useState } from "react";
import { faqs } from "@/lib/faqs-data";

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
          FAQs
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Answers from the official guide and trainees who&apos;ve been through
          it. Updated for the CAO 27 March 2026 Orientation Guide.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
        {faqs.map((faq, index) => {
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-button-${index}`;
          const isOpen = openIndex === index;
          return (
            <div key={index}>
              <h2>
                <button
                  id={buttonId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between gap-4 p-4 min-h-[44px] text-left hover:bg-stone-50 transition-colors"
                >
                  <span className="text-sm font-medium text-stone-900">
                    {faq.question}
                  </span>
                  <svg
                    aria-hidden="true"
                    className={`w-4 h-4 shrink-0 text-stone-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </h2>
              {isOpen && (
                <p
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-4 pb-4 text-sm leading-relaxed text-stone-600"
                >
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-stone-500 text-center">
        When in doubt, the official Orientation Guide and your WINGS welcome
        email outrank everything on this page.
      </p>
    </main>
  );
}
