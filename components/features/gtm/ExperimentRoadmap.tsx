'use client'

import { useTransition } from 'react'
import type { GTMPlan, GTMExperiment } from '@/lib/types'
import { updateExperimentStatus } from '@/lib/actions/gtm'

const STATUS_COLOR: Record<GTMExperiment['status'], string> = {
  proposed: 'bg-zinc-700 text-zinc-300',
  running:  'bg-yellow-500/20 text-yellow-400',
  complete: 'bg-teal-500/20 text-teal-400',
  cancelled:'bg-red-500/20 text-red-400',
}

interface Props {
  sessionId: string
  plan: GTMPlan
  experiments: GTMExperiment[]
}

export function ExperimentRoadmap({ sessionId, plan: _plan, experiments }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleAdvance = (exp: GTMExperiment) => {
    const next: Record<GTMExperiment['status'], GTMExperiment['status']> = {
      proposed: 'running',
      running:  'complete',
      complete: 'complete',
      cancelled:'cancelled',
    }
    startTransition(() => {
      updateExperimentStatus(exp.id, next[exp.status], sessionId)
    })
  }

  if (!experiments.length) return (
    <p className="text-sm text-zinc-500 text-center py-8">No experiments generated yet.</p>
  )

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-sm font-semibold text-zinc-100">Experiment Roadmap</h2>
      <ul className="space-y-3">
        {experiments.map((e) => (
          <li key={e.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-zinc-200 leading-snug">{e.hypothesis}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[e.status]}`}>
                {e.status}
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-zinc-500">
              <span>Metric: {e.metric}</span>
              {e.duration_weeks && <span>{e.duration_weeks}w</span>}
              {e.phase && <span className="capitalize">{e.phase}</span>}
            </div>
            {e.status !== 'complete' && e.status !== 'cancelled' && (
              <button
                onClick={() => handleAdvance(e)}
                disabled={isPending}
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50"
              >
                {e.status === 'proposed' ? 'Mark as Running →' : 'Mark as Complete →'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
