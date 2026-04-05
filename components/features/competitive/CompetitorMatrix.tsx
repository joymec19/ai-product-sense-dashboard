// CompetitorMatrix — feature × competitor grid with colour-coded support levels
import type { Competitor, CompetitorFeature, SupportLevel } from '@/lib/types'
import { CompetitiveEmptyState } from './shared/EmptyState'

interface Props {
  competitors: Competitor[]
  features: CompetitorFeature[]
}

const SUPPORT_STYLE: Record<SupportLevel, { label: string; class: string }> = {
  full:    { label: '●', class: 'text-teal-400' },
  partial: { label: '◑', class: 'text-yellow-400' },
  none:    { label: '○', class: 'text-zinc-600' },
  unknown: { label: '?', class: 'text-zinc-500' },
}

export function CompetitorMatrix({ competitors, features }: Props) {
  if (!competitors.length || !features.length) {
    return <CompetitiveEmptyState description="Feature matrix will appear after the analysis completes." />
  }

  // Deduplicate feature names
  const featureNames = Array.from(new Set(features.map(f => f.feature_name))).sort()

  // Build lookup: feature_name → competitor_id → feature row
  const lookup = new Map<string, Map<string, CompetitorFeature>>()
  for (const f of features) {
    if (!lookup.has(f.feature_name)) lookup.set(f.feature_name, new Map())
    lookup.get(f.feature_name)!.set(f.competitor_id, f)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="py-2 pr-4 text-left font-medium text-zinc-500 w-44 shrink-0">Feature</th>
            {competitors.map(c => (
              <th key={c.id} className="py-2 px-3 text-center font-medium text-zinc-400 max-w-24 truncate">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {featureNames.map(name => (
            <tr key={name} className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-2 pr-4 text-zinc-300 font-medium">{name}</td>
              {competitors.map(c => {
                const entry = lookup.get(name)?.get(c.id)
                const level: SupportLevel = entry?.support_level ?? 'unknown'
                const style = SUPPORT_STYLE[level]
                return (
                  <td
                    key={c.id}
                    className={`py-2 px-3 text-center text-base tabular-nums ${style.class}`}
                    title={entry?.notes ?? level}
                  >
                    {style.label}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-5 text-xs text-zinc-500">
        {(Object.entries(SUPPORT_STYLE) as [SupportLevel, { label: string; class: string }][]).map(([level, s]) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className={s.class}>{s.label}</span>
            <span className="capitalize">{level}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
