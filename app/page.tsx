import type { Metadata } from "next";
import ChecklistClient from "@/components/ChecklistClient";
import { defaultOTSPackingList } from "@/lib/packing-list-data";

export const metadata: Metadata = {
  title: "Packing Checklist",
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
      .filter((item) => item.category !== "Documents")
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.item_name,
      })),
  };

  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChecklistClient />
    </main>
  );
}
