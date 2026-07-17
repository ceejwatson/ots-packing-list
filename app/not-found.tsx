import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center"
    >
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-blue-700">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-stone-500 max-w-md mx-auto">
        That page doesn&apos;t exist or may have moved. Try the checklist, or
        head back to the homepage.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="px-4 py-2.5 rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors"
        >
          Go to checklist
        </Link>
        <Link
          href="/faqs"
          className="px-4 py-2.5 rounded-md text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Browse FAQs
        </Link>
      </div>
    </main>
  );
}
