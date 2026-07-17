export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-56 rounded bg-stone-200" />
        <div className="h-4 w-72 rounded bg-stone-200" />
      </div>
      <div className="space-y-3">
        <div className="h-20 rounded-xl bg-stone-200" />
        <div className="h-20 rounded-xl bg-stone-200" />
        <div className="h-20 rounded-xl bg-stone-200" />
      </div>
    </main>
  );
}
