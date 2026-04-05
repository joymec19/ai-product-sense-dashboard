'use client'

import Link from 'next/link'
import type { GTMPlan, GTMChannel } from '@/lib/types'
import { SectionCard } from '@/components/shared/SectionCard'
import { ChannelMatrix } from './ChannelMatrix'
import { EmptyState } from '@/components/shared/EmptyState'

interface Props {
  sessionId: string
  plan: GTMPlan | null
  channels: GTMChannel[]
}

export function GTMHub({ sessionId, plan, channels }: Props) {
  if (!plan) return (
    <EmptyState
      title="No GTM Plan yet"
      description="Run the analysis to generate positioning, channels, and experiments."
    />
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <SectionCard title="Positioning" description="Core value proposition and ICP">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Positioning Statement', plan.positioning_statement],
            ['Target Persona', plan.target_persona],
            ['ICP', plan.icp_description],
            ['Pricing Model', plan.pricing_model],
          ].map(([label, value]) => value ? (
            <div key={label as string}>
              <dt className="text-xs text-zinc-500 mb-0.5">{label}</dt>
              <dd className="text-zinc-200">{value}</dd>
            </div>
          ) : null)}
        </dl>
      </SectionCard>

      <SectionCard
        title="Channel Strategy"
        description="CAC and budget per channel"
        action={
          <Link
            href={`/analysis/${sessionId}/gtm/experiments`}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            View experiments →
          </Link>
        }
      >
        <ChannelMatrix channels={channels} />
      </SectionCard>
    </div>
  )
}
