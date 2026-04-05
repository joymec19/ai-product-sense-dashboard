import Link from 'next/link'
import type { Competitor } from '@/lib/types'

interface Props { competitors: Competitor[]; sessionId: string }

export function CompetitorTable({ competitors, sessionId }: Props) {
  if (!competitors.length) return (
    <p className="text-sm text-zinc-500 py-4 text-center">No competitors found yet.</p>
  )

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
          <th className="pb-2 font-medium">Name</th>
          <th className="pb-2 font-medium">Segment</th>
          <th className="pb-2 font-medium">Pricing</th>
          <th className="pb-2 font-medium">Funding</th>
          <th className="pb-2 font-medium"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/50">
        {competitors.map((c) => (
          <tr key={c.id} className="group">
            <td className="py-2.5 pr-4 font-medium text-zinc-200">{c.name}</td>
            <td className="py-2.5 pr-4 text-zinc-400">{c.target_segment ?? '—'}</td>
            <td className="py-2.5 pr-4 text-zinc-400">{c.pricing_model ?? '—'}</td>
            <td className="py-2.5 pr-4 text-zinc-400">{c.funding_stage ?? '—'}</td>
            <td className="py-2.5">
              <Link
                href={`/analysis/${sessionId}/competitive/${c.id}`}
                className="text-xs text-zinc-500 group-hover:text-teal-400 transition-colors"
              >
                Deep dive →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
