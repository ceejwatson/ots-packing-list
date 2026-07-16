"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PackingItem } from "@/lib/packing-list-data";

const categories = ["Required", "Recommended", "Documents"] as const;

export default function OverviewPage() {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ots-packing-list-v3");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const resetProgress = () => {
    const reset = items.map((i) => ({ ...i, is_packed: false }));
    setItems(reset);
    localStorage.setItem("ots-packing-list-v3", JSON.stringify(reset));
    window.dispatchEvent(new Event("ots-progress"));
    setConfirmReset(false);
  };

  const totalPacked = items.filter((i) => i.is_packed).length;
  const totalPct = items.length
    ? Math.round((totalPacked / items.length) * 100)
    : 0;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
          Overview
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Your readiness at a glance.
        </p>
      </div>

      {/* Overall readiness */}
      <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Packing readiness
          </h2>
          <span className="font-display text-2xl font-semibold text-blue-700 tabular-nums">
            {totalPct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full bg-blue-700 rounded-full transition-all duration-500"
            style={{ width: `${totalPct}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {categories.map((cat) => {
            const inCat = items.filter((i) => i.category === cat);
            const packed = inCat.filter((i) => i.is_packed).length;
            return (
              <div
                key={cat}
                className="rounded-lg border border-stone-200 p-3 text-center"
              >
                <p className="text-xs text-stone-500">{cat}</p>
                <p className="mt-1 font-display text-xl font-semibold tabular-nums">
                  {packed}
                  <span className="text-stone-400 text-sm">/{inCat.length}</span>
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Open checklist &rarr;
          </Link>
          {confirmReset ? (
            <span className="text-xs text-stone-500 flex items-center gap-2">
              Clear all checkmarks?
              <button
                onClick={resetProgress}
                className="font-medium text-red-600 hover:text-red-800"
              >
                Yes, reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="font-medium text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Reset progress
            </button>
          )}
        </div>
      </section>

      {/* Resources */}
      <section className="mt-6 grid sm:grid-cols-3 gap-3">
        <a
          href="/OTS_Orientation_Guide_CAO_27-Mar-2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-stone-200 bg-white p-4 hover:border-blue-300 transition-colors group"
        >
          <p className="font-medium text-sm text-stone-900 group-hover:text-blue-700">
            Official Orientation Guide
          </p>
          <p className="mt-1 text-xs text-stone-500">
            CAO 27 March 2026 &middot; PDF
          </p>
        </a>
        <Link
          href="/reporting"
          className="rounded-xl border border-stone-200 bg-white p-4 hover:border-blue-300 transition-colors group"
        >
          <p className="font-medium text-sm text-stone-900 group-hover:text-blue-700">
            Reporting instructions
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Day 1 arrival, attire, and campus map
          </p>
        </Link>
        <Link
          href="/faqs"
          className="rounded-xl border border-stone-200 bg-white p-4 hover:border-blue-300 transition-colors group"
        >
          <p className="font-medium text-sm text-stone-900 group-hover:text-blue-700">
            FAQs
          </p>
          <p className="mt-1 text-xs text-stone-500">
            What to expect, from trainees who&apos;ve been
          </p>
        </Link>
      </section>

      {/* Key deadlines */}
      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide mb-3">
          Key deadlines before class start
        </h2>
        <ul className="space-y-2 text-sm text-stone-600">
          <li className="flex gap-3">
            <span className="font-display font-semibold text-blue-700 tabular-nums w-16 shrink-0">
              14 days
            </span>
            All medical requirements complete in WINGS (1630 CT cutoff) &mdash;
            missing this means disenrollment
          </li>
          <li className="flex gap-3">
            <span className="font-display font-semibold text-blue-700 tabular-nums w-16 shrink-0">
              14 days
            </span>
            Religious accommodation requests to the OTS chaplain
          </li>
          <li className="flex gap-3">
            <span className="font-display font-semibold text-blue-700 tabular-nums w-16 shrink-0">
              10 days
            </span>
            Pre-course assignments complete in WINGS &mdash; all material is
            testable
          </li>
          <li className="flex gap-3">
            <span className="font-display font-semibold text-blue-700 tabular-nums w-16 shrink-0">
              Day -1
            </span>
            Be in the Montgomery, AL local area no later than 11:59 pm
          </li>
          <li className="flex gap-3">
            <span className="font-display font-semibold text-blue-700 tabular-nums w-16 shrink-0">
              Day 1
            </span>
            Report to the dorms between 0700&ndash;0730 &mdash; no delayed
            reporting
          </li>
        </ul>
      </section>
    </main>
  );
}
