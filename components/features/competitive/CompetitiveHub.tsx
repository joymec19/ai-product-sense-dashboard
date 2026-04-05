'use client'

import { useState } from 'react'
import type { Competitor, CompetitorFeature, CompetitorPositioning } from '@/lib/types'
import type { StrategicGap } from '@/lib/types/competitive'
import { SectionCard } from '@/components/shared/SectionCard'
import { FeatureHeatmap } from './FeatureHeatmap'
import { PositioningScatter } from './PositioningScatter'
import { MoatAssessment } from './MoatAssessment'
import { CompetitorTable } from './CompetitorTable'
import { CompetitorMatrix } from './CompetitorMatrix'
import { PositioningMap } from './PositioningMap'
import { StrategicGapsCard } from './StrategicGapsCard'
import { CompetitiveErrorBoundary } from './CompetitiveErrorBoundary'

type Tab = 'overview' | 'matrix' | 'positioning' | 'moat' | 'gaps'

interface Props {
  sessionId: string
  competitors: Competitor[]
  features: CompetitorFeature[]
  positioning: CompetitorPositioning[]
  gaps: StrategicGap[]
}

export function CompetitiveHub({ sessionId, competitors, features, positioning, gaps }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',    label: 'Overview' },
    { id: 'matrix',     label: 'Feature Matrix' },
    { id: 'positioning', label: '2×2 Map' },
    { id: 'moat',        label: 'Moat' },
    { id: 'gaps',        label: `Gaps${gaps.length ? ` (${gaps.length})` : ''}` },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-lg bg-zinc-900 p-1 w-fit flex-wrap">
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

      <CompetitiveErrorBoundary>
        {tab === 'overview' && (
          <SectionCard title="Competitors" description={`${competitors.length} identified`}>
            <CompetitorTable competitors={competitors} sessionId={sessionId} />
          </SectionCard>
        )}

        {tab === 'matrix' && (
          <SectionCard title="Feature Matrix" description="Full feature × competitor coverage grid">
            <CompetitorMatrix competitors={competitors} features={features} />
          </SectionCard>
        )}

        {tab === 'positioning' && (
          <SectionCard title="Positioning Map" description="2×2 scatter across key strategic axes">
            <PositioningMap competitors={competitors} positioning={positioning} />
          </SectionCard>
        )}

        {tab === 'moat' && (
          <SectionCard title="Moat Assessment" description="Competitive defensibility scores">
            <MoatAssessment competitors={competitors} positioning={positioning} />
          </SectionCard>
        )}

        {tab === 'gaps' && (
          <SectionCard title="Strategic Gaps" description="Market white-space and opportunity areas">
            <StrategicGapsCard gaps={gaps} />
          </SectionCard>
        )}
      </CompetitiveErrorBoundary>
    </div>
  )
}
