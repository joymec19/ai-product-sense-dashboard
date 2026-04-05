'use client'

import type { Competitor, CompetitorPositioning } from '@/lib/types'

interface Props { competitors: Competitor[]; positioning: CompetitorPositioning[] }

export function PositioningScatter({ competitors, positioning }: Props) {
  if (!positioning.length) return (
    <p className="text-sm text-zinc-500 py-4 text-center">Positioning scores not yet generated.</p>
  )

  const axisX = positioning[0]?.axis_x_name ?? 'X Axis'
  const axisY = positioning[0]?.axis_y_name ?? 'Y Axis'

  const getName = (competitorId: string) =>
    competitors.find((c) => c.id === competitorId)?.name ?? '?'

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto border border-zinc-800 rounded-lg bg-zinc-950">
      {/* Axis labels */}
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-zinc-500">{axisX} →</span>
      <span className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 text-xs text-zinc-500">{axisY} →</span>

      {/* Quadrant lines */}
      <div className="absolute top-1/2 left-0 right-0 border-t border-zinc-800/60" />
      <div className="absolute left-1/2 top-0 bottom-0 border-l border-zinc-800/60" />

      {/* Data points */}
      {positioning.map((p) => {
        const x = (p.score_x / 10) * 90 + 5   // 5–95% of container
        const y = 95 - (p.score_y / 10) * 90   // inverted: high Y = top
        return (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-default"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="h-3 w-3 rounded-full bg-teal-500 ring-2 ring-teal-500/30" />
            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
              rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200 opacity-0 group-hover:opacity-100
              transition-opacity pointer-events-none">
              {getName(p.competitor_id)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
