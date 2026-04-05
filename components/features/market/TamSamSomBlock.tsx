import type { MarketSizing } from '@/lib/types'
import { ConfidencePip } from '@/components/shared/ConfidencePip'

function formatUSD(n?: number) {
  if (!n) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

export function TamSamSomBlock({ sizing }: { sizing: MarketSizing[] }) {
  if (!sizing.length) return (
    <p className="text-sm text-zinc-500 text-center py-4">Market sizing not yet generated.</p>
  )

  return (
    <div className="space-y-6">
      {sizing.map((s) => (
        <div key={s.id} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-zinc-500">{s.approach.replace('_', '-')}</span>
            {s.confidence && <ConfidencePip level={s.confidence} />}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'TAM', value: s.tam_usd, source: s.tam_source },
              { label: 'SAM', value: s.sam_usd, source: s.sam_source },
              { label: 'SOM', value: s.som_usd, source: s.som_source },
            ].map(({ label, value, source }) => (
              <div key={label} className="rounded-lg border border-zinc-800 p-4 space-y-1">
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-2xl font-semibold text-zinc-100 tabular-nums">{formatUSD(value)}</p>
                {source && <p className="text-xs text-zinc-600 truncate">{source}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
