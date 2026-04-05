import type { FundingEvent } from '@/lib/types'

function fmt(n?: number) {
  if (!n) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

export function FundingTimeline({ events }: { events: FundingEvent[] }) {
  if (!events.length) return (
    <p className="text-sm text-zinc-500 text-center py-4">No funding events found.</p>
  )

  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="flex items-start gap-4 rounded-lg border border-zinc-800 p-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-200">{e.company_name}</p>
            <p className="text-xs text-zinc-500">{e.round_type} · {fmt(e.amount_usd)}</p>
            {e.investors.length > 0 && (
              <p className="text-xs text-zinc-600 mt-0.5">{e.investors.join(', ')}</p>
            )}
          </div>
          {e.announced_at && (
            <span className="text-xs text-zinc-600 shrink-0">
              {new Date(e.announced_at).toLocaleDateString()}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
