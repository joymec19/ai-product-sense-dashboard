import type { GTMChannel } from '@/lib/types'
import { ConfidencePip } from '@/components/shared/ConfidencePip'

function fmt(n?: number) {
  if (!n) return '—'
  return `$${n.toLocaleString()}`
}

export function ChannelMatrix({ channels }: { channels: GTMChannel[] }) {
  if (!channels.length) return (
    <p className="text-sm text-zinc-500 text-center py-4">No channel data yet.</p>
  )

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
          <th className="pb-2 font-medium">Channel</th>
          <th className="pb-2 font-medium">Type</th>
          <th className="pb-2 font-medium">CAC</th>
          <th className="pb-2 font-medium">Budget/mo</th>
          <th className="pb-2 font-medium">Priority</th>
          <th className="pb-2 font-medium">Confidence</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/50">
        {channels.map((c) => (
          <tr key={c.id}>
            <td className="py-2.5 pr-3 font-medium text-zinc-200">{c.channel_name}</td>
            <td className="py-2.5 pr-3 text-zinc-400">{c.channel_type ?? '—'}</td>
            <td className="py-2.5 pr-3 text-zinc-300 tabular-nums">{fmt(c.cac_usd)}</td>
            <td className="py-2.5 pr-3 text-zinc-300 tabular-nums">{fmt(c.monthly_budget_usd)}</td>
            <td className="py-2.5 pr-3 text-zinc-400">{c.priority ?? '—'}</td>
            <td className="py-2.5">
              {c.cac_confidence
                ? <ConfidencePip level={c.cac_confidence} />
                : <span className="text-zinc-600">—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
