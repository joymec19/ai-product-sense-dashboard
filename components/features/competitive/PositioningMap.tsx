// PositioningMap — CSS 2×2 quadrant with competitor dots placed by score_x / score_y
import type { Competitor, CompetitorPositioning } from '@/lib/types'
import { CompetitiveEmptyState } from './shared/EmptyState'

interface Props {
  competitors: Competitor[]
  positioning: CompetitorPositioning[]
}

const MOAT_COLOUR: Record<string, string> = {
  network:   'bg-violet-400',
  switching: 'bg-blue-400',
  brand:     'bg-pink-400',
  cost:      'bg-orange-400',
  ip:        'bg-yellow-400',
  data:      'bg-teal-400',
  none:      'bg-zinc-500',
}

export function PositioningMap({ competitors, positioning }: Props) {
  if (!positioning.length) {
    return <CompetitiveEmptyState description="Positioning map will appear after the analysis completes." />
  }

  const compById = new Map(competitors.map(c => [c.id, c]))

  // Use the first axis pair found (all rows should share the same axis names)
  const axisX = positioning[0].axis_x_name
  const axisY = positioning[0].axis_y_name

  return (
    <div className="space-y-4">
      {/* 2×2 grid */}
      <div className="relative w-full aspect-square max-w-lg mx-auto border border-zinc-700 rounded-xl overflow-hidden bg-zinc-950">
        {/* Quadrant labels */}
        <span className="absolute top-2 left-3 text-[10px] text-zinc-600 select-none">High {axisY} / Low {axisX}</span>
        <span className="absolute top-2 right-3 text-[10px] text-zinc-600 text-right select-none">High {axisY} / High {axisX}</span>
        <span className="absolute bottom-2 left-3 text-[10px] text-zinc-600 select-none">Low {axisY} / Low {axisX}</span>
        <span className="absolute bottom-2 right-3 text-[10px] text-zinc-600 text-right select-none">Low {axisY} / High {axisX}</span>

        {/* Axis lines */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-800" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-800" />

        {/* Competitor dots */}
        {positioning.map(p => {
          const comp = compById.get(p.competitor_id)
          if (!comp) return null
          // score 0–10 → left/bottom 5% to right/top 95%
          const left = `${5 + p.score_x * 9}%`
          const bottom = `${5 + p.score_y * 9}%`
          const moatClass = MOAT_COLOUR[p.moat_type] ?? 'bg-zinc-500'
          return (
            <div
              key={p.id}
              className="absolute flex flex-col items-center gap-0.5"
              style={{ left, bottom, transform: 'translate(-50%, 50%)' }}
            >
              <div
                className={`h-3 w-3 rounded-full ring-2 ring-zinc-900 ${moatClass}`}
                title={`${comp.name} — moat: ${p.moat_type} (${p.moat_score}/10)`}
              />
              <span className="text-[9px] text-zinc-400 whitespace-nowrap leading-none">{comp.name}</span>
            </div>
          )
        })}
      </div>

      {/* Axis labels */}
      <div className="flex justify-between text-xs text-zinc-500 max-w-lg mx-auto px-1">
        <span>← Low</span>
        <span className="font-medium text-zinc-400">{axisX}</span>
        <span>High →</span>
      </div>

      {/* Moat legend */}
      <div className="flex flex-wrap gap-3 max-w-lg mx-auto">
        {Object.entries(MOAT_COLOUR).map(([type, cls]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className={`h-2.5 w-2.5 rounded-full ${cls}`} />
            <span className="capitalize">{type}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
