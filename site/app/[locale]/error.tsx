'use client';
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-charcoal-light">{error.message}</p>
      <button onClick={reset} className="mt-6 rounded-sm border border-charcoal px-4 py-2 text-sm">Try again</button>
    </div>
  );
}
