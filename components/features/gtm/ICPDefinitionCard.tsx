'use client'
import { CardShell, EmptyState } from '@/components/features/shared'
import type { GtmPlan } from '@/lib/supabase/gtm'

export function ICPDefinitionCard({ plan }: { plan: GtmPlan }) {
  function buildMarkdown(): string {
    return [
      '## Ideal Customer Profile',
      '', plan.icp_description ?? '',
      '', '**Target Persona:**', plan.target_persona ?? 'Not specified',
      '', '**Pricing Model:**', plan.pricing_model?.replace('_', ' ') ?? 'Not specified',
    ].join('\n')
  }

  return (
    <CardShell title="Ideal Customer Profile" expandable markdownFn={buildMarkdown}>
      {!plan.icp_description ? <EmptyState message="ICP will appear after GTM generation." /> : (
        <div className="p-4 space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">{plan.icp_description}</p>
          {plan.target_persona && (
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Target Persona</div>
              <p className="text-sm text-zinc-300">{plan.target_persona}</p>
            </div>
          )}
          {plan.pricing_model && (
            <div className="flex items-center gap-2">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Pricing model</div>
              <span className="text-xs bg-teal-900/30 text-teal-300 border border-teal-800/40 px-2.5 py-1 rounded-full">
                {plan.pricing_model.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      )}
    </CardShell>
  )
}
