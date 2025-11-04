"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  PackingItem,
  defaultOTSPackingList,
  getAmazonLink,
} from "@/lib/packing-list-data";

type TabType = "Documents" | "Required" | "Recommended";

export default function Dashboard() {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("Required");
  const router = useRouter();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    console.log("Loading items...");
    const stored = localStorage.getItem("ots-packing-list-v3");
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      // Initialize with default items
      const initialItems = defaultOTSPackingList.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        is_packed: false,
      }));
      console.log(
        "Initial items with images:",
        initialItems.filter((i) => i.image_url).length,
      );
      setItems(initialItems);
      localStorage.setItem("ots-packing-list-v3", JSON.stringify(initialItems));
    }
    setLoading(false);
  };

  const togglePacked = (id: string, currentStatus: boolean) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, is_packed: !currentStatus } : item,
    );
    setItems(updatedItems);
    localStorage.setItem("ots-packing-list-v3", JSON.stringify(updatedItems));
  };

  const filteredItems = items.filter((item) => item.category === activeTab);
  const packedInCategory = filteredItems.filter(
    (item) => item.is_packed,
  ).length;
  const totalInCategory = filteredItems.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="text-center">
          <img
            src="/ots-shield.png"
            alt="OTS Shield"
            className="w-24 h-24 mx-auto mb-4 animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-blue-100 font-semibold">
            Loading your packing list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header with OTS Shield - Sticky */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b-4 border-yellow-400 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <img
                  src="/ots-shield.png"
                  alt="OTS Shield"
                  className="w-20 h-20 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide">
                    OTS PACKING LIST
                  </h1>
                  <p className="text-sm text-blue-200 font-semibold uppercase tracking-wider">
                    Official Orientation Guide
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/Orientation_Guide_06102025.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors font-bold flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Orientation Guide
              </a>
              <button
                onClick={() => router.push("/faqs")}
                className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-blue-900 rounded-md transition-colors font-bold"
              >
                FAQs
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/30 overflow-hidden">
          <div className="flex border-b-2 border-blue-200">
            <button
              onClick={() => setActiveTab("Required")}
              className={`flex-1 px-6 py-5 font-medium tracking-tight transition-all duration-200 text-base ${
                activeTab === "Required"
                  ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white/50 text-blue-900 hover:bg-white/80 backdrop-blur-sm"
              }`}
            >
              Required
            </button>
            <button
              onClick={() => setActiveTab("Recommended")}
              className={`flex-1 px-6 py-5 font-medium tracking-tight transition-all duration-200 text-base ${
                activeTab === "Recommended"
                  ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white/50 text-blue-900 hover:bg-white/80 backdrop-blur-sm"
              }`}
            >
              Recommended
            </button>
            <button
              onClick={() => setActiveTab("Documents")}
              className={`flex-1 px-6 py-5 font-medium tracking-tight transition-all duration-200 text-base ${
                activeTab === "Documents"
                  ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white/50 text-blue-900 hover:bg-white/80 backdrop-blur-sm"
              }`}
            >
              Documents
            </button>
          </div>

          {/* Packing List */}
          <div className="divide-y divide-blue-100">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-blue-600 font-semibold">
                No items in this category
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 transition-all duration-300 border-b border-gray-100/50 last:border-0 ${
                    item.is_packed
                      ? "bg-gradient-to-r from-green-50/50 to-emerald-50/50"
                      : "hover:bg-gray-50/30"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Product Image - More Prominent & Clickable */}
                    {item.image_url &&
                      (item.amazon_search || item.amazon_asin) && (
                        <a
                          href={getAmazonLink(
                            item.amazon_search,
                            item.amazon_asin,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 group cursor-pointer"
                        >
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            className="w-32 h-32 object-contain rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 group-hover:shadow-md group-hover:scale-105 group-hover:ring-orange-200 transition-all duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </a>
                      )}
                    {item.image_url &&
                      !item.amazon_search &&
                      !item.amazon_asin && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            className="w-32 h-32 object-contain rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <h3
                            className={`text-base font-semibold leading-tight ${
                              item.is_packed
                                ? "line-through text-gray-400"
                                : "text-gray-900"
                            }`}
                          >
                            {item.item_name}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">
                            Quantity: {item.quantity}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-blue-700 bg-blue-50/80 inline-block px-3 py-1.5 rounded-lg">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-shrink-0">
                          {item.aafes_only ? (
                            <div className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-b from-blue-600 to-blue-700 rounded-xl shadow-md ring-1 ring-blue-500/50">
                              Available at AAFES
                            </div>
                          ) : item.amazon_search || item.amazon_asin ? (
                            <div className="flex items-center gap-3">
                              <a
                                href={getAmazonLink(
                                  item.amazon_search,
                                  item.amazon_asin,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-3 text-sm font-semibold text-white bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.544.41-3.146.615-4.806.615-2.162 0-4.254-.353-6.27-1.057-2.014-.703-3.777-1.703-5.29-2.996-.214-.177-.293-.344-.24-.494zm23.11-3.45c-.28-.386-.85-.577-1.707-.577-.524 0-1.124.08-1.8.24-.677.162-1.18.327-1.512.495-.333.168-.5.41-.5.726 0 .224.08.407.24.548.16.14.362.21.606.21.177 0 .384-.046.618-.14.234-.095.47-.21.71-.348.506-.292 1.022-.438 1.546-.438.6 0 1.05.14 1.35.42.3.28.45.676.45 1.19 0 .262-.044.527-.13.79-.088.265-.223.57-.405.918-.16.302-.314.615-.46.94-.146.323-.22.62-.22.89 0 .364.13.648.39.854.26.205.596.308 1.008.308.266 0 .508-.036.725-.11.217-.073.422-.195.615-.365.193-.17.368-.39.525-.66.157-.27.288-.593.394-.97l.12-.42c.05-.178.106-.405.167-.68.06-.274.113-.555.16-.843.045-.288.068-.543.068-.766 0-.636-.18-1.14-.54-1.513z" />
                                </svg>
                                BUY
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-900 text-sm uppercase">
                Important Reminders
              </h3>
              <ul className="text-xs text-yellow-800 mt-2 space-y-1">
                <li>
                  • <strong>Day 1 Arrival:</strong> Wear khakis, belt, solid
                  color polo shirt, and shoes with laces tucked in
                </li>
                <li>
                  • <strong>Documents:</strong> Upload medical records to
                  intakeQ 14 days before arrival - DO NOT hand carry
                </li>
                <li>
                  • <strong>Boots & Running Shoes</strong> must be broken in
                  before arrival
                </li>
                <li>
                  • Bring <strong>90-day supply</strong> of all prescription
                  medications
                </li>
                <li>
                  • Have <strong>$2,000+ accessible</strong> - pay delays are
                  common
                </li>
                <li>
                  • Purchase uniforms from <strong>AAFES only</strong> to ensure
                  compliance (you can bring uniform items if you already have
                  them)
                </li>
                <li>
                  • Complete all <strong>pre-course assignments</strong> 10 days
                  before arrival
                </li>
                <li>
                  • <strong>Print OTS SPINS prior</strong> in booklet format to
                  bring with you
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer with Air Force motto */}
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm font-semibold italic">
            "Aim High... Fly-Fight-Win"
          </p>
          <p className="text-blue-200 text-sm font-semibold italic mt-2">
            "ALWAYS WITH HONOR"
          </p>
          <p className="text-blue-300 text-xs mt-1">Maxwell AFB, Alabama</p>
        </div>
      </main>
    </div>
  );
}
