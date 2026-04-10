'use client'
import { useState } from 'react'
import { CardShell, EmptyState } from '@/components/features/shared'
import type { LaunchPhase } from '@/lib/supabase/gtm'

interface Props { phases: LaunchPhase[] }

type PhaseColors = { bg: string; border: string; dot: string; text: string }

const PHASE_TYPE_COLORS: Record<string, PhaseColors> = {
  pre_launch:  { bg: 'bg-zinc-800/60',    border: 'border-zinc-700',      dot: 'bg-zinc-500',    text: 'text-zinc-400' },
  soft_launch: { bg: 'bg-blue-900/30',    border: 'border-blue-800/60',   dot: 'bg-blue-500',    text: 'text-blue-400' },
  growth:      { bg: 'bg-teal-900/30',    border: 'border-teal-800/60',   dot: 'bg-teal-500',    text: 'text-teal-400' },
  scale:       { bg: 'bg-emerald-900/30', border: 'border-emerald-800/60', dot: 'bg-emerald-400', text: 'text-emerald-400' },
}

const DEFAULT_PHASE_COLORS: PhaseColors = { bg: 'bg-zinc-800/60', border: 'border-zinc-700', dot: 'bg-zinc-500', text: 'text-zinc-400' }
function getPhaseColors(type: string): PhaseColors {
  return PHASE_TYPE_COLORS[type] ?? DEFAULT_PHASE_COLORS
}

export function LaunchSequenceTimeline({ phases }: Props) {
  const [active, setActive] = useState<string | null>(null)
  const sorted = [...phases].sort((a, b) => a.phase_order - b.phase_order)
  const totalWeeks = sorted.length > 0 ? Math.max(...sorted.map((p) => p.end_week)) : 0
  const detail = sorted.find((p) => p.id === active)

  function buildMarkdown(): string {
    return [
      '## Launch Timeline',
      '',
      ...sorted.map((p) => [
        `### Phase ${p.phase_order}: ${p.phase_name} (Week ${p.start_week}–${p.end_week})`,
        '**Objectives:**',
        ...p.objectives.map((o) => `- ${o}`),
        '',
        '**Key Actions:**',
        ...p.key_actions.map((a) => `- ${a}`),
        '',
        `**Success Gate:** ${p.success_gate}`,
        '',
      ].join('\n')),
    ].join('\n')
  }

  return (
    <CardShell title="Launch Timeline" markdownFn={buildMarkdown} {...(totalWeeks > 0 && { subtitle: `${totalWeeks} weeks total` })}>
      {phases.length === 0 ? <EmptyState message="Launch timeline will appear after GTM generation." /> : (
        <div className="p-4 space-y-4">
          {/* Horizontal timeline track */}
          <div className="relative overflow-x-auto pb-2">
            <div className="flex items-stretch gap-0 min-w-[600px]">
              {sorted.map((phase, i) => {
                const width = ((phase.end_week - phase.start_week + 1) / totalWeeks) * 100
                const colors = getPhaseColors(phase.phase_type)
                const isActive = active === phase.id
                return (
                  <div
                    key={phase.id}
                    className={`relative flex-shrink-0 cursor-pointer transition-all duration-150
                      rounded-lg border mx-0.5 p-3
                      ${colors.bg} ${colors.border}
                      ${isActive ? 'ring-2 ring-teal-500/50' : 'hover:brightness-125'}`}
                    style={{ width: `${Math.max(width, 15)}%` }}
                    onClick={() => setActive(isActive ? null : phase.id)}
                  >
                    {/* Phase number dot */}
                    <div className={`w-5 h-5 rounded-full ${colors.dot} flex items-center justify-center text-[10px] font-bold text-zinc-900 mb-2`}>
                      {phase.phase_order}
                    </div>
                    <div className="text-xs font-semibold text-zinc-200 leading-tight mb-1 truncate">{phase.phase_name}</div>
                    <div className={`text-[10px] font-medium ${colors.text}`}>Wk {phase.start_week}–{phase.end_week}</div>
                    {/* Connector line except last */}
                    {i < sorted.length - 1 && (
                      <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-zinc-700 z-10" />
                    )}
                  </div>
                )
              })}
            </div>
            {/* Week ruler */}
            <div className="flex mt-2 min-w-[600px] px-0.5">
              {sorted.map((phase) => {
                const width = ((phase.end_week - phase.start_week + 1) / totalWeeks) * 100
                return (
                  <div key={phase.id} className="text-center px-0.5 mx-0.5"
                    style={{ width: `${Math.max(width, 15)}%` }}>
                    <span className="text-[10px] text-zinc-600">W{phase.start_week}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detail panel — shown on phase click */}
          {detail && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getPhaseColors(detail.phase_type).dot}`} />
                <span className="text-sm font-semibold text-zinc-100">{detail.phase_name}</span>
                <span className="text-xs text-zinc-500 ml-auto">Week {detail.start_week} – {detail.end_week}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Objectives</div>
                  <ul className="space-y-1">
                    {detail.objectives.map((o, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex gap-2">
                        <span className="text-teal-600 shrink-0">›</span>{o}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Key Actions</div>
                  <ul className="space-y-1">
                    {detail.key_actions.map((a, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex gap-2">
                        <span className="text-zinc-600 shrink-0">›</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="rounded bg-zinc-900 border border-zinc-700 p-2.5">
                <span className="text-xs uppercase tracking-wider text-zinc-500">Success Gate: </span>
                <span className="text-sm text-zinc-300">{detail.success_gate}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </CardShell>
  )
}
