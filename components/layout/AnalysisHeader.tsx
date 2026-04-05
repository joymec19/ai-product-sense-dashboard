import type { AnalysisSession } from '@/lib/types'
import { StatusBadge } from '@/components/shared/StatusBadge'

export function AnalysisHeader({ session }: { session: AnalysisSession }) {
  return (
    <div className="border-b border-zinc-800 px-6 py-3 flex items-center gap-4 bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-100 truncate">{session.product_name}</h2>
      <StatusBadge status={session.status} />
      {session.product_url && (
        <a
          href={session.product_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-teal-400 transition-colors truncate"
        >
          {session.product_url}
        </a>
      )}
    </div>
  )
}
