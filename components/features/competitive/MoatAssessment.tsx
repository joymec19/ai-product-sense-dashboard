import type { Competitor, CompetitorPositioning } from '@/lib/types'

interface Props { competitors: Competitor[]; positioning: CompetitorPositioning[] }

export function MoatAssessment({ competitors, positioning }: Props) {
  const getName = (id: string) => competitors.find((c) => c.id === id)?.name ?? '?'

  if (!positioning.length) return (
    <p className="text-sm text-zinc-500 py-4 text-center">Moat data not yet available.</p>
  )

  return (
    <div className="space-y-3">
      {positioning
        .sort((a, b) => b.moat_score - a.moat_score)
        .map((p) => (
          <div key={p.id} className="flex items-center gap-4">
            <span className="w-32 text-sm text-zinc-300 truncate">{getName(p.competitor_id)}</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${(p.moat_score / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400 w-10 text-right">{p.moat_score}/10</span>
            <span className="text-xs text-zinc-500 w-20">{p.moat_type}</span>
          </div>
        ))}
    </div>
  )
}
