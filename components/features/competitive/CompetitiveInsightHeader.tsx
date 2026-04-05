'use client'

import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { RunAnalysisButton } from './RunAnalysisButton'
import type { SessionStatus } from '@/lib/types'

interface Props {
  sessionId: string
  productName: string
  status: SessionStatus
  competitorCount: number
}

export function CompetitiveInsightHeader({ sessionId, productName, status, competitorCount }: Props) {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-100 truncate">{productName}</h2>
          <StatusBadge status={status} />
        </div>
        <p className="text-xs text-zinc-500">
          {competitorCount > 0
            ? `${competitorCount} competitor${competitorCount !== 1 ? 's' : ''} identified`
            : 'No analysis run yet'}
        </p>
      </div>

      <div className="shrink-0">
        <RunAnalysisButton
          sessionId={sessionId}
          onComplete={() => router.refresh()}
        />
      </div>
    </div>
  )
}
