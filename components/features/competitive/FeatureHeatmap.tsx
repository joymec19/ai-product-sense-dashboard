'use client'

import type { Competitor, CompetitorFeature, SupportLevel } from '@/lib/types'

const LEVEL_STYLE: Record<SupportLevel, string> = {
  full:    'bg-teal-500/80 text-teal-100',
  partial: 'bg-yellow-500/40 text-yellow-200',
  none:    'bg-zinc-800 text-zinc-500',
  unknown: 'bg-zinc-700/50 text-zinc-500',
}

const LEVEL_LABEL: Record<SupportLevel, string> = {
  full: '●', partial: '◑', none: '○', unknown: '?',
}

interface Props { competitors: Competitor[]; features: CompetitorFeature[] }

export function FeatureHeatmap({ competitors, features }: Props) {
  const featureNames = [...new Set(features.map((f) => f.feature_name))]

  const getCell = (competitorId: string, featureName: string): SupportLevel => {
    const match = features.find(
      (f) => f.competitor_id === competitorId && f.feature_name === featureName
    )
    return match?.support_level ?? 'unknown'
  }

  if (!featureNames.length) return (
    <p className="text-sm text-zinc-500 py-4 text-center">Feature data not yet generated.</p>
  )

  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="pb-2 text-left pr-4 text-zinc-500 font-medium w-40">Feature</th>
            {competitors.map((c) => (
              <th key={c.id} className="pb-2 text-center text-zinc-400 font-medium px-2 truncate max-w-24">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/30">
          {featureNames.map((fn) => (
            <tr key={fn} className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-2 pr-4 text-zinc-300">{fn}</td>
              {competitors.map((c) => {
                const level = getCell(c.id, fn)
                return (
                  <td key={c.id} className="py-2 text-center px-2">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-mono ${LEVEL_STYLE[level]}`}>
                      {LEVEL_LABEL[level]}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-zinc-500">
        {(['full','partial','none','unknown'] as SupportLevel[]).map((l) => (
          <span key={l} className="flex items-center gap-1">
            <span className={`rounded px-1 py-0.5 ${LEVEL_STYLE[l]}`}>{LEVEL_LABEL[l]}</span>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}
