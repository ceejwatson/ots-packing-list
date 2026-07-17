"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center"
    >
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-red-700">
        Something went wrong
      </p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
        Unexpected error
      </h1>
      <p className="mt-3 text-sm text-stone-500 max-w-md mx-auto">
        This page hit a snag loading. Your saved packing progress is safe
        &mdash; it lives in your browser, not on this page.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2.5 rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-4 py-2.5 rounded-md text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Go to checklist
        </a>
      </div>
    </main>
  );
}
