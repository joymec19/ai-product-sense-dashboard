'use client'
import { useState } from 'react'
import { CardShell, EmptyState } from '@/components/features/shared'
import type { GtmPlan, GtmMessaging } from '@/lib/supabase/gtm'

interface Props { plan: GtmPlan; messaging: GtmMessaging[] }

export function PositioningStatementBlock({ plan, messaging }: Props) {
  const [activeMsg, setActiveMsg] = useState(0)
  const msg = messaging[activeMsg]

  function buildMarkdown(): string {
    return [
      '## Positioning & Messaging',
      '',
      '### Positioning Statement',
      plan.positioning_statement ?? '',
      '',
      '### Value Proposition',
      plan.value_proposition ?? '',
      '',
      '### Messaging Variants',
      ...messaging.map((m) => [`**${m.variant_label}**`, `> ${m.headline}`, m.subheadline ?? '', ''].join('\n')),
    ].join('\n')
  }

  return (
    <CardShell title="Positioning & Messaging" expandable markdownFn={buildMarkdown}
      expandedContent={plan.pricing_rationale ? (
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Pricing Rationale</div>
          <p>{plan.pricing_rationale}</p>
        </div>
      ) : undefined}
    >
      {!plan.positioning_statement ? <EmptyState message="Positioning will appear after GTM generation." /> : (
        <div className="p-4 space-y-4">
          {/* Positioning statement */}
          <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Positioning Statement</div>
            <p className="text-sm text-zinc-200 leading-relaxed">{plan.positioning_statement}</p>
          </div>
          {/* Value prop */}
          {plan.value_proposition && (
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Value Proposition</div>
              <p className="text-sm text-zinc-300">{plan.value_proposition}</p>
            </div>
          )}
          {/* Messaging variant tabs */}
          {messaging.length > 0 && (
            <div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {messaging.map((m, i) => (
                  <button key={m.id} onClick={() => setActiveMsg(i)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors
                      ${i === activeMsg ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800/60 text-zinc-500 hover:bg-zinc-700/60'}`}>
                    {m.variant_label}
                  </button>
                ))}
              </div>
              {msg && (
                <div className="rounded-lg border border-zinc-700 p-3">
                  <div className="text-sm font-semibold text-zinc-100 mb-1">{msg.headline}</div>
                  {msg.subheadline && <div className="text-sm text-zinc-400">{msg.subheadline}</div>}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">{msg.tone}</span>
                    {msg.target_persona && <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">{msg.target_persona}</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </CardShell>
  )
}
