"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Checklist" },
  { href: "/dashboard", label: "Overview" },
  { href: "/reporting", label: "Reporting" },
  { href: "/faqs", label: "FAQs" },
];

function readProgress(): number {
  try {
    const stored = localStorage.getItem("ots-packing-list-v3");
    if (!stored) return 0;
    const items = JSON.parse(stored) as { is_packed: boolean }[];
    if (!items.length) return 0;
    return Math.round(
      (items.filter((i) => i.is_packed).length / items.length) * 100,
    );
  } catch {
    return 0;
  }
}

export default function Nav() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setProgress(readProgress());
    const update = () => setProgress(readProgress());
    window.addEventListener("ots-progress", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("ots-progress", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <img
              src="/ots-shield.png"
              alt=""
              className="w-8 h-8 object-contain shrink-0"
            />
            <span className="font-display text-lg sm:text-xl font-semibold uppercase tracking-wide text-stone-900 truncate">
              OTS Packing List
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "text-blue-700 bg-blue-50"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="/OTS_Orientation_Guide_CAO_27-Mar-2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors"
            >
              Official guide
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-2 -mr-2 text-stone-600"
            aria-label="Menu"
            aria-expanded={open}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="sm:hidden pb-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === l.href
                    ? "text-blue-700 bg-blue-50"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="/OTS_Orientation_Guide_CAO_27-Mar-2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-sm font-medium text-blue-700"
            >
              Official guide (PDF)
            </a>
          </nav>
        )}
      </div>

      {/* Readiness bar */}
      <div
        className="h-0.5 bg-stone-200"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Packing progress"
      >
        <div
          className="h-full bg-blue-700 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
