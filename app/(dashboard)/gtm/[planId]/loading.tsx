export default function GtmPlanLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-6 w-36 rounded bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-800" />
          </div>
          <div className="h-3 w-24 rounded bg-zinc-800" />
        </div>
        <div className="h-9 w-44 rounded-lg bg-zinc-800" />
      </div>

      {/* Row 1: Positioning + ICP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <div className="flex justify-between border-b border-zinc-800 pb-3">
              <div className="h-4 w-32 rounded bg-zinc-800" />
              <div className="h-6 w-8 rounded bg-zinc-800" />
            </div>
            <div className="h-3 w-full rounded bg-zinc-800" />
            <div className="h-3 w-4/5 rounded bg-zinc-800" />
            <div className="h-3 w-full rounded bg-zinc-800" />
            <div className="h-3 w-3/5 rounded bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Row 2: Launch timeline — full width */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <div className="flex justify-between border-b border-zinc-800 pb-3">
          <div className="h-4 w-36 rounded bg-zinc-800" />
          <div className="h-6 w-8 rounded bg-zinc-800" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-zinc-800/60 p-4 space-y-2">
              <div className="h-3 w-20 rounded bg-zinc-700" />
              <div className="h-2.5 w-full rounded bg-zinc-700" />
              <div className="h-2.5 w-4/5 rounded bg-zinc-700" />
            </div>
          ))}
        </div>
        <div className="h-4 rounded bg-zinc-800/40" />
      </div>

      {/* Row 3: Channels + Metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="h-4 w-32 rounded bg-zinc-800" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-t border-zinc-800/50 pt-3">
              <div className="h-3 w-28 rounded bg-zinc-800" />
              <div className="h-3 w-16 rounded bg-zinc-800" />
              <div className="h-3 w-16 rounded bg-zinc-800 tabular-nums" />
              <div className="h-3 w-20 rounded bg-zinc-800 tabular-nums" />
            </div>
          ))}
        </div>
        <div className="xl:col-span-1 rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="h-4 w-36 rounded bg-zinc-800" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-t border-zinc-800/50 pt-3 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-zinc-800" />
              <div className="h-2.5 w-full rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
