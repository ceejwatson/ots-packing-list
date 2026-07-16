"use client";

import { useEffect, useState } from "react";
import {
  PackingItem,
  defaultOTSPackingList,
  getAmazonLink,
} from "@/lib/packing-list-data";

type TabType = "Documents" | "Required" | "Recommended";
const tabs: TabType[] = ["Required", "Recommended", "Documents"];

export default function ChecklistPage() {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("Required");

  useEffect(() => {
    const stored = localStorage.getItem("ots-packing-list-v3");
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      const initialItems = defaultOTSPackingList.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        is_packed: false,
      }));
      setItems(initialItems);
      localStorage.setItem("ots-packing-list-v3", JSON.stringify(initialItems));
    }
    setLoading(false);
  }, []);

  const togglePacked = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, is_packed: !item.is_packed } : item,
    );
    setItems(updated);
    localStorage.setItem("ots-packing-list-v3", JSON.stringify(updated));
    window.dispatchEvent(new Event("ots-progress"));
  };

  const counts = tabs.map((t) => {
    const inTab = items.filter((i) => i.category === t);
    return {
      tab: t,
      packed: inTab.filter((i) => i.is_packed).length,
      total: inTab.length,
    };
  });

  const filteredItems = items.filter((item) => item.category === activeTab);
  const totalPacked = items.filter((i) => i.is_packed).length;

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center text-stone-400 text-sm">
        Loading your checklist&hellip;
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
          Packing checklist
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Current to the CAO 27 March 2026 Orientation Guide &middot;{" "}
          {totalPacked} of {items.length} items packed
        </p>
      </div>

      {/* Segmented control */}
      <div
        className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-stone-200/70 mb-6"
        role="tablist"
      >
        {counts.map(({ tab, packed, total }) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab}
            <span
              className={`ml-1.5 tabular-nums ${
                activeTab === tab ? "text-blue-700" : "text-stone-400"
              }`}
            >
              {packed}/{total}
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
        {filteredItems.length === 0 ? (
          <p className="p-8 text-center text-sm text-stone-400">
            No items in this category.
          </p>
        ) : (
          filteredItems.map((item) => {
            const buyLink =
              !item.aafes_only && (item.amazon_search || item.amazon_asin)
                ? getAmazonLink(item.amazon_search, item.amazon_asin)
                : null;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 transition-colors ${
                  item.is_packed ? "bg-stone-50/60" : ""
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => togglePacked(item.id!)}
                  role="checkbox"
                  aria-checked={item.is_packed}
                  aria-label={`Mark ${item.item_name} as ${
                    item.is_packed ? "not packed" : "packed"
                  }`}
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                    item.is_packed
                      ? "bg-blue-700 border-blue-700"
                      : "border-stone-300 hover:border-blue-600 bg-white"
                  }`}
                >
                  {item.is_packed && (
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium ${
                        item.is_packed
                          ? "text-stone-400 line-through"
                          : "text-stone-900"
                      }`}
                    >
                      {item.item_name}
                    </span>
                    {!item.notes?.includes("Min:") && item.quantity > 1 && (
                      <span className="text-xs text-stone-400 tabular-nums">
                        &times;{item.quantity}
                      </span>
                    )}
                    {item.aafes_only && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        AAFES
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p
                      className={`mt-0.5 text-xs leading-relaxed ${
                        item.is_packed ? "text-stone-300" : "text-stone-500"
                      }`}
                    >
                      {item.notes}
                    </p>
                  )}
                  {buyLink && (
                    <a
                      href={buyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-blue-700 hover:text-blue-900"
                    >
                      View on Amazon
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 17L17 7M9 7h8v8"
                        />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Thumbnail */}
                {item.image_url &&
                  (buyLink ? (
                    <a
                      href={buyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={item.image_url}
                        alt=""
                        loading="lazy"
                        className={`w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-stone-200 bg-white p-1.5 transition-opacity ${
                          item.is_packed ? "opacity-40" : "hover:opacity-80"
                        }`}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </a>
                  ) : (
                    <img
                      src={item.image_url}
                      alt=""
                      loading="lazy"
                      className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-stone-200 bg-white p-1.5 ${
                        item.is_packed ? "opacity-40" : ""
                      }`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ))}
              </div>
            );
          })
        )}
      </div>

      {/* Before you report */}
      <section className="mt-8 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide mb-3">
          Before you report
        </h2>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-stone-600">
          <li>
            Day 1 attire: solid-color collared shirt, khaki pants with belt,
            athletic shoes, laces tucked in
          </li>
          <li>
            Upload medical records to WINGS 14 days before arrival &mdash; do
            not hand carry
          </li>
          <li>Break in boots and running shoes before arrival</li>
          <li>Bring a 90-day supply of all prescription medications</li>
          <li>Have $2,000+ accessible &mdash; pay delays are common</li>
          <li>Purchase uniform items from AAFES only to ensure compliance</li>
          <li>Complete all pre-course assignments 10 days before arrival</li>
          <li>Print the OTS SPINS in booklet format and bring it</li>
          <li>
            Bring a printed copy of the packing requirements on in-processing
            day
          </li>
          <li>Arrive wearing your hydration pack, assembled and filled</li>
        </ul>
      </section>
    </main>
  );
}
