import type { Metadata } from "next";
import Link from "next/link";
import { defaultOTSPackingList } from "@/lib/packing-list-data";

const url = "https://otspackinglist.com/what-to-bring";
const title = "What to Bring to Air Force OTS: Full Packing List (2026)";
const description =
  "Everything to bring to Air Force Officer Training School at Maxwell AFB: required documents, required gear, and recommended items for men and women, from the CAO 27 March 2026 Orientation Guide.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/what-to-bring" },
  openGraph: { title, description, url: "/what-to-bring" },
};

type Item = (typeof defaultOTSPackingList)[number];

const groups: { key: Item["category"]; heading: string; intro: string }[] = [
  { key: "Documents", heading: "Required documents", intro: "Keep these in an envelope. Keep your IDs on your person." },
  { key: "Required", heading: "Required gear and clothing", intro: "These items are required by the Orientation Guide." },
  { key: "Recommended", heading: "Recommended items", intro: "Not required, but commonly useful during the course." },
];

function ItemList({ items }: { items: Item[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.id} className="py-3">
          <p className="text-sm font-semibold text-slate-900">
            {item.item_name}
            {item.quantity > 1 && !item.notes?.includes("Min:") && (
              <span className="ml-1 text-xs font-normal text-slate-500">×{item.quantity}</span>
            )}
          </p>
          {item.notes && <p className="mt-1 text-xs leading-5 text-slate-500">{item.notes}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function WhatToBringPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title,
      numberOfItems: defaultOTSPackingList.length,
      itemListElement: defaultOTSPackingList.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.item_name,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Checklist", item: "https://otspackinglist.com/" },
        { "@type": "ListItem", position: 2, name: "What to bring", item: url },
      ],
    },
  ];

  return (
    <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
        What to bring to Air Force OTS
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        This is the complete list of {defaultOTSPackingList.length} items for Officer Training School at Maxwell AFB,
        Alabama, based on the CAO 27 March 2026 Orientation Guide. Want to track what you have packed?{" "}
        <Link href="/" className="font-semibold text-blue-800">Use the interactive checklist</Link> or{" "}
        <Link href="/print" className="font-semibold text-blue-800">print it</Link>.
      </p>

      <div className="mt-6 space-y-6">
        {groups.map((g) => {
          const all = defaultOTSPackingList.filter((i) => i.category === g.key);
          const shared = all.filter((i) => !i.section);
          const womens = all.filter((i) => i.section === "Womens");
          const mens = all.filter((i) => i.section === "Mens");
          return (
            <section key={g.key} className="surface p-4 sm:p-6">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{g.heading}</h2>
              <p className="mt-1 text-xs text-slate-500">{g.intro}</p>
              <ItemList items={shared} />
              {womens.length > 0 && (<><h3 className="mt-4 text-sm font-bold text-pink-700">Women&apos;s items</h3><ItemList items={womens} /></>)}
              {mens.length > 0 && (<><h3 className="mt-4 text-sm font-bold text-sky-700">Men&apos;s items</h3><ItemList items={mens} /></>)}
            </section>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/reporting" className="surface p-4 text-sm font-semibold text-blue-800 hover:bg-slate-50">Day 1 reporting instructions →</Link>
        <Link href="/faqs" className="surface p-4 text-sm font-semibold text-blue-800 hover:bg-slate-50">OTS FAQs →</Link>
      </div>
      <p className="mt-6 text-xs text-slate-500">
        Independent resource, not an official Department of the Air Force site. Your welcome email and the official guide always take priority.
      </p>
    </main>
  );
}
