export default function CompetitiveLoading() {
  return (
    <div className="space-y-6 max-w-6xl animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-48 rounded bg-zinc-800" />
          <div className="h-3 w-32 rounded bg-zinc-800" />
        </div>
        <div className="h-9 w-40 rounded-md bg-zinc-800" />
      </div>

      {/* Tab bar skeleton */}
      <div className="h-9 w-96 rounded-lg bg-zinc-800" />

      {/* Table card skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-zinc-800" />
          <div className="h-3 w-24 rounded bg-zinc-800" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-6">
              <div className="h-4 w-32 rounded bg-zinc-800" />
              <div className="h-4 w-24 rounded bg-zinc-800" />
              <div className="h-4 w-20 rounded bg-zinc-800" />
              <div className="h-4 w-20 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
