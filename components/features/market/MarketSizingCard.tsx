import { CardShell } from '@/components/features/shared'
import type { MarketSizing } from '@/lib/types'

function fmt(n: number | undefined) {
  if (!n) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

interface Props {
  sizing: MarketSizing | null
}

export function MarketSizingCard({ sizing }: Props) {
  if (!sizing) {
    return (
      <CardShell title="Market Sizing" subtitle="TAM · SAM · SOM">
        <div className="px-4 py-8 text-center text-sm text-zinc-500">
          No market sizing data yet. Run the analysis to generate estimates.
        </div>
      </CardShell>
    )
  }

  const confidence = sizing.confidence ?? 'low'
  const confColor: Record<string, string> = {
    low: 'text-amber-400', medium: 'text-teal-400', high: 'text-emerald-400',
  }

  return (
    <CardShell
      title="Market Sizing"
      subtitle={`${sizing.approach === 'top_down' ? 'Top-down' : 'Bottom-up'} · CAGR ${sizing.cagr_pct ? `${sizing.cagr_pct}%` : '—'}`}
      markdownFn={() => `## Market Sizing\n\n| | TAM | SAM | SOM |\n|---|---|---|---|\n| Value | ${fmt(sizing.tam_usd)} | ${fmt(sizing.sam_usd)} | ${fmt(sizing.som_usd)} |\n\nCAGR: ${sizing.cagr_pct ?? '—'}%  \nConfidence: ${confidence}`}
    >
      <div className="px-4 py-4 space-y-4">
        {/* TAM/SAM/SOM row */}
        <div className="grid grid-cols-3 gap-3">
          {([
            { label: 'TAM', value: sizing.tam_usd, source: sizing.tam_source },
            { label: 'SAM', value: sizing.sam_usd, source: sizing.sam_source },
            { label: 'SOM', value: sizing.som_usd, source: sizing.som_source },
          ] as const).map(({ label, value, source }) => (
            <div key={label} className="rounded-lg bg-zinc-800/60 p-3 text-center">
              <div className="text-xs text-zinc-500 mb-1">{label}</div>
              <div className="text-base font-semibold tabular-nums text-zinc-100">{fmt(value)}</div>
              {source && <div className="text-[10px] text-zinc-600 mt-1 truncate" title={source}>{source}</div>}
            </div>
          ))}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Target year: {sizing.target_year ?? '—'}</span>
          <span className={confColor[confidence]}>Confidence: {confidence}</span>
        </div>

        {sizing.llm_reasoning && (
          <p className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-800 pt-3">
            {sizing.llm_reasoning}
          </p>
        )}
      </div>
    </CardShell>
  )
}
