export default function MarketLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-44 rounded bg-zinc-800" />
          <div className="h-3 w-28 rounded bg-zinc-800" />
        </div>
        <div className="h-9 w-40 rounded-lg bg-zinc-800" />
      </div>

      {/* Row 1: Sizing + Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sizing card */}
        <div className="lg:col-span-1 rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <div className="space-y-1">
            <div className="h-4 w-28 rounded bg-zinc-800" />
            <div className="h-3 w-20 rounded bg-zinc-800" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-zinc-800/60 p-3 space-y-2">
                <div className="h-2 w-8 rounded bg-zinc-700 mx-auto" />
                <div className="h-5 w-16 rounded bg-zinc-700 mx-auto" />
              </div>
            ))}
          </div>
          <div className="h-3 w-full rounded bg-zinc-800" />
          <div className="h-3 w-4/5 rounded bg-zinc-800" />
        </div>

        {/* Trends card */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="h-4 w-32 rounded bg-zinc-800" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-t border-zinc-800/50 pt-3">
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-zinc-800" />
                <div className="h-2.5 w-full rounded bg-zinc-800" />
              </div>
              <div className="h-3 w-12 rounded bg-zinc-800 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Personas + Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={col} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
            <div className="h-4 w-36 rounded bg-zinc-800" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-t border-zinc-800/50 pt-4 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-24 rounded bg-zinc-800" />
                  <div className="h-3 w-14 rounded bg-zinc-800" />
                </div>
                <div className="h-2.5 w-full rounded bg-zinc-800" />
                <div className="h-2.5 w-4/5 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
