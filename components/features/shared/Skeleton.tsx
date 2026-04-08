interface Props {
  className?: string
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div className={`animate-pulse rounded bg-zinc-800 ${className}`} />
  )
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`} />
      ))}
    </div>
  )
}
