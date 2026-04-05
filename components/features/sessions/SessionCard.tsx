import Link from 'next/link'
import type { AnalysisSession } from '@/lib/types'
import { StatusBadge } from '@/components/shared/StatusBadge'

export function SessionCard({ session }: { session: AnalysisSession }) {
  return (
    <Link
      href={`/analysis/${session.id}/competitive`}
      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-100 truncate">{session.product_name}</p>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{session.product_url ?? 'No URL'}</p>
        </div>
        <StatusBadge status={session.status} />
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-600">
        {session.category && <span>{session.category}</span>}
        {session.geography && <span>{session.geography}</span>}
        <span>{new Date(session.created_at).toLocaleDateString()}</span>
      </div>
    </Link>
  )
}
