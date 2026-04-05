'use client'

import { useState } from 'react'
import type { Competitor, CompetitorFeature, CompetitorPositioning } from '@/lib/types'
import { SectionCard } from '@/components/shared/SectionCard'
import { FeatureHeatmap } from './FeatureHeatmap'
import { PositioningScatter } from './PositioningScatter'
import { MoatAssessment } from './MoatAssessment'
import { CompetitorTable } from './CompetitorTable'

type Tab = 'overview' | 'heatmap' | 'positioning' | 'moat'

interface Props {
  sessionId: string
  competitors: Competitor[]
  features: CompetitorFeature[]
  positioning: CompetitorPositioning[]
}

export function CompetitiveHub({ sessionId, competitors, features, positioning }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',    label: 'Overview' },
    { id: 'heatmap',     label: 'Feature Heatmap' },
    { id: 'positioning', label: '2×2 Positioning' },
    { id: 'moat',        label: 'Moat Assessment' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-lg bg-zinc-900 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel rendering */}
      {tab === 'overview' && (
        <SectionCard title="Competitors" description={`${competitors.length} identified`}>
          <CompetitorTable competitors={competitors} sessionId={sessionId} />
        </SectionCard>
      )}
      {tab === 'heatmap' && (
        <SectionCard title="Feature Heatmap" description="Support levels across competitors">
          <FeatureHeatmap competitors={competitors} features={features} />
        </SectionCard>
      )}
      {tab === 'positioning' && (
        <SectionCard title="Positioning Map" description="2×2 scatter across key axes">
          <PositioningScatter competitors={competitors} positioning={positioning} />
        </SectionCard>
      )}
      {tab === 'moat' && (
        <SectionCard title="Moat Assessment" description="Competitive defensibility scores">
          <MoatAssessment competitors={competitors} positioning={positioning} />
        </SectionCard>
      )}
    </div>
  )
}
