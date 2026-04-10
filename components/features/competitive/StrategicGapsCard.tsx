// StrategicGapsCard — renders the LLM-derived market gaps and white-space summary
import type { StrategicGap, GapType, GapUrgency } from '@/lib/types/competitive'
import { SectionCard } from '@/components/shared/SectionCard'
import { CompetitiveEmptyState } from './shared/EmptyState'

interface Props {
  gaps: StrategicGap[]
}

const GAP_TYPE_COLOUR: Record<GapType, string> = {
  feature:      'bg-blue-500/15 text-blue-400',
  segment:      'bg-violet-500/15 text-violet-400',
  geographic:   'bg-teal-500/15 text-teal-400',
  pricing:      'bg-orange-500/15 text-orange-400',
  channel:      'bg-pink-500/15 text-pink-400',
  integration:  'bg-yellow-500/15 text-yellow-400',
}

const URGENCY_LABEL: Record<GapUrgency, { label: string; class: string }> = {
  immediate:  { label: 'Immediate',  class: 'text-red-400' },
  '6_months': { label: '6 months',   class: 'text-orange-400' },
  '12_months':{ label: '12 months',  class: 'text-yellow-400' },
  long_term:  { label: 'Long term',  class: 'text-zinc-500' },
}

export function StrategicGapsCard({ gaps }: Props) {
  if (!gaps.length) {
    return <CompetitiveEmptyState description="Strategic gaps will appear after the analysis completes." />
  }

  // white_space_summary and recommended_focus are the same on all rows (stored per gap for denormalisation)
  const whitespace = gaps[0]?.white_space_summary
  const recommended = gaps[0]?.recommended_focus

  return (
    <div className="space-y-5">
      {/* Summary callouts */}
      {(whitespace || recommended) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {whitespace && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">White-Space Summary</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{whitespace}</p>
            </div>
          )}
          {recommended && (
            <div className="rounded-lg border border-teal-900/40 bg-teal-950/20 p-4 space-y-1">
              <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide">Recommended Focus</p>
              <p className="text-sm text-teal-200 leading-relaxed">{recommended}</p>
            </div>
          )}
        </div>
      )}

      {/* Gap list */}
      <div className="space-y-3">
        {gaps.map(gap => {
          const typeStyle = GAP_TYPE_COLOUR[gap.gap_type] ?? 'bg-zinc-800 text-zinc-400'
          const urgency = URGENCY_LABEL[gap.urgency]
          return (
            <div key={gap.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeStyle}`}>
                    {gap.gap_type}
                  </span>
                  <span className="text-sm font-semibold text-zinc-200">{gap.gap_title}</span>
                </div>
                <span className={`text-xs font-medium shrink-0 ${urgency.class}`}>{urgency.label}</span>
              </div>

              {gap.description && (
                <p className="text-xs text-zinc-400 leading-relaxed">{gap.description}</p>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
                {gap.addressable_by && (
                  <span>Addressable by <span className="text-zinc-300">{gap.addressable_by}</span></span>
                )}
                {gap.market_size_signal && gap.market_size_signal !== 'unknown' && (
                  <span>Market signal <span className="text-zinc-300 capitalize">{gap.market_size_signal}</span></span>
                )}
              </div>

              {gap.evidence.length > 0 && (
                <ul className="space-y-0.5">
                  {gap.evidence.map((e, i) => (
                    <li key={i} className="text-xs text-zinc-500 before:content-['•'] before:mr-1.5">{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
