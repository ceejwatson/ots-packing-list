import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { defaultOTSPackingList } from "@/lib/packing-list-data";

export const metadata: Metadata = {
  title: "Printable Checklist",
  description:
    "Printer-friendly version of the full Air Force OTS packing checklist — required gear, recommended items, and documents.",
  alternates: { canonical: "/print" },
  robots: { index: false, follow: true },
};

const sections = [
  {
    category: "Required" as const,
    heading: "Required items",
  },
  {
    category: "Recommended" as const,
    heading: "Recommended items",
  },
  {
    category: "Documents" as const,
    heading: "Documents & identification",
  },
];

export default function PrintPage() {
  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 print:max-w-none print:px-0 print:py-0"
    >
      {/* Screen-only controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
            Printable checklist
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            All {defaultOTSPackingList.length} items on one clean printout.
            Bring a printed copy of the packing requirements on in-processing
            day.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PrintButton />
          <Link
            href="/"
            className="px-4 py-2.5 rounded-md text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Back to checklist
          </Link>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-lg font-bold uppercase tracking-wide">
          OTS Packing Checklist
        </h1>
        <p className="text-[10px] text-stone-600">
          Current to the CAO 27 March 2026 Orientation Guide &middot;
          otspackinglist.com &middot; Always defer to the official guide and
          your welcome email.
        </p>
      </div>

      <div className="space-y-6 print:space-y-4">
        {sections.map(({ category, heading }) => {
          const items = defaultOTSPackingList.filter(
            (i) => i.category === category,
          );
          const groups = [
            { subheading: null as string | null, items: items.filter((i) => !i.section) },
            { subheading: "Women's items", items: items.filter((i) => i.section === "Womens") },
            { subheading: "Men's items", items: items.filter((i) => i.section === "Mens") },
          ].filter((g) => g.items.length > 0);
          return (
            <section
              key={category}
              className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6 print:rounded-none print:border-0 print:p-0 print:bg-transparent"
            >
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide mb-3 print:text-sm print:font-bold print:border-b print:border-stone-800 print:pb-1 print:mb-2">
                {heading}{" "}
                <span className="text-stone-400 print:text-stone-600 font-normal text-sm print:text-[10px]">
                  ({items.length})
                </span>
              </h2>
              {groups.map(({ subheading, items: groupItems }) => (
                <div key={subheading ?? "general"}>
                  {subheading && (
                    <h3 className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 print:mt-2 print:mb-1 print:text-[10px] print:text-stone-800">
                      {subheading}
                    </h3>
                  )}
              <ul className="space-y-2 print:space-y-0 print:columns-2 print:gap-8">
                {groupItems.map((item) => (
                  <li
                    key={item.item_name}
                    className="flex items-start gap-2.5 print:gap-1.5 print:break-inside-avoid print:py-[3px]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 w-4 h-4 print:w-3 print:h-3 shrink-0 rounded-sm border border-stone-400 print:border-stone-800 print:mt-[3px]"
                    />
                    <span className="min-w-0">
                      <span className="text-sm print:text-[11px] print:leading-tight font-medium text-stone-900">
                        {item.item_name}
                        {!item.notes?.includes("Min:") && item.quantity > 1 && (
                          <span className="ml-1.5 font-normal text-stone-500 print:text-stone-700 tabular-nums">
                            &times;{item.quantity}
                          </span>
                        )}
                        {item.aafes_only && (
                          <span className="ml-1.5 text-[10px] print:text-[9px] font-semibold uppercase tracking-wide text-blue-700 print:text-stone-900">
                            AAFES
                          </span>
                        )}
                      </span>
                      {item.notes && (
                        <span className="block text-xs print:text-[9px] print:leading-tight text-stone-500 print:text-stone-600">
                          {item.notes}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
