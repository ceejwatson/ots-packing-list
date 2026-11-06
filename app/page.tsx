import type { Metadata } from "next";
import ChecklistClient from "@/components/PackingChecklist";
import Link from "next/link";
import { faqs } from "@/lib/faqs-data";
import { defaultOTSPackingList } from "@/lib/packing-list-data";

export const metadata: Metadata = {
  title: "Air Force OTS Packing List & Checklist (2026)",
  description:
    "Interactive Air Force OTS packing checklist covering required documents, required gear, and recommended items, current to the CAO 27 March 2026 Orientation Guide.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "OTS Packing Checklist — Air Force Officer Training School",
    description:
      "Interactive Air Force OTS packing checklist covering required documents, required gear, and recommended items.",
    url: "/",
  },
};

export default function ChecklistPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Air Force OTS Packing Checklist",
    description:
      "Required and recommended items to bring to Air Force Officer Training School.",
    itemListElement: defaultOTSPackingList
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.item_name,
        url: `https://otspackinglist.com/#${item.id}`,
      })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.slice(0, 6).map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-10"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <ChecklistClient />
      <section className="mt-10 text-sm leading-6 text-slate-600" aria-labelledby="about-heading">
        <h2 id="about-heading" className="font-display text-xl font-semibold uppercase text-slate-900">
          Air Force OTS packing list, 2026
        </h2>
        <p className="mt-2">
          This free checklist covers everything to bring to Air Force Officer Training School at Maxwell AFB,
          Alabama: required documents, required gear and clothing, and recommended extras. It follows the CAO
          27 March 2026 Orientation Guide. Your progress is saved in your browser, so there is no account to create.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li><Link href="/what-to-bring" className="font-semibold text-blue-800">Full list of what to bring to OTS</Link></li>
          <li><Link href="/reporting" className="font-semibold text-blue-800">Day 1 reporting instructions</Link></li>
          <li><Link href="/faqs" className="font-semibold text-blue-800">OTS frequently asked questions</Link></li>
        </ul>
      </section>
    </main>
  );
}
