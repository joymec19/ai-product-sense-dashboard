'use client'

import { useState } from 'react'
import type { MarketSizing, MarketTrend, FundingEvent } from '@/lib/types'
import { SectionCard } from '@/components/shared/SectionCard'
import { TamSamSomBlock } from './TamSamSomBlock'
import { TrendFeed } from './TrendFeed'
import { FundingTimeline } from './FundingTimeline'

type Tab = 'sizing' | 'trends' | 'funding'

interface Props {
  sessionId: string
  sizing: MarketSizing[]
  trends: MarketTrend[]
  funding: FundingEvent[]
}

export function MarketHub({ sizing, trends, funding }: Props) {
  const [tab, setTab] = useState<Tab>('sizing')

  const TABS = [
    { id: 'sizing' as Tab, label: 'Market Size' },
    { id: 'trends' as Tab, label: `Trends (${trends.length})` },
    { id: 'funding' as Tab, label: `Funding (${funding.length})` },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex gap-1 rounded-lg bg-zinc-900 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sizing' && (
        <SectionCard title="TAM · SAM · SOM" description="Top-down and bottom-up estimates">
          <TamSamSomBlock sizing={sizing} />
        </SectionCard>
      )}
      {tab === 'trends' && (
        <SectionCard title="Market Signals" description="Regulatory, technology, and consumer trends">
          <TrendFeed trends={trends} />
        </SectionCard>
      )}
      {tab === 'funding' && (
        <SectionCard title="Funding Intelligence" description="Recent rounds in your competitive landscape">
          <FundingTimeline events={funding} />
        </SectionCard>
      )}
    </div>
  )
}
