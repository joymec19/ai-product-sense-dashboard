'use client'
import { CardShell, EmptyState } from '@/components/features/shared'
import type { SuccessMetric } from '@/lib/supabase/gtm'

interface Props { metrics: SuccessMetric[] }

const METRIC_TYPE_BADGE: Record<string, string> = {
  acquisition: 'bg-blue-900/40 text-blue-400',
  activation:  'bg-teal-900/40 text-teal-400',
  retention:   'bg-emerald-900/40 text-emerald-400',
  revenue:     'bg-amber-900/40 text-amber-400',
  referral:    'bg-purple-900/40 text-purple-400',
}

export function SuccessMetricsDashboard({ metrics }: Props) {
  const byType = metrics.reduce<Record<string, SuccessMetric[]>>((acc, m) => {
    if (!acc[m.metric_type]) acc[m.metric_type] = []
    acc[m.metric_type]!.push(m)
    return acc
  }, {})

  function buildMarkdown(): string {
    return [
      '## Success Metrics',
      '',
      ...metrics.map((m) => [
        `### ${m.metric_name}`,
        `**Type:** ${m.metric_type} | **Target:** ${m.target_value} by ${m.timeframe}`,
        '', m.definition,
        m.owner ? `\n**Owner:** ${m.owner}` : '',
        m.data_source ? `**Source:** ${m.data_source}` : '',
        '',
      ].join('\n')),
    ].join('\n')
  }

  return (
    <CardShell title="Success Metrics" subtitle={`${metrics.length} KPIs`} markdownFn={buildMarkdown}>
      {metrics.length === 0 ? <EmptyState message="Success metrics will appear after GTM generation." /> : (
        <div className="p-3 space-y-4">
          {Object.entries(byType).map(([type, items]) => (
            <div key={type}>
              <div className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${METRIC_TYPE_BADGE[type] ?? 'bg-zinc-800 text-zinc-400'}`}>
                {type}
              </div>
              <div className="space-y-2">
                {items.map((m) => (
                  <div key={m.id} className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3">
                    <div className="text-sm font-medium text-zinc-200 mb-1">{m.metric_name}</div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-base font-semibold tabular-nums text-teal-400">{m.target_value}</span>
                      <span className="text-xs text-zinc-500">by {m.timeframe}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{m.definition}</p>
                    {(m.owner ?? m.data_source) && (
                      <div className="flex gap-3 mt-2 text-xs text-zinc-600">
                        {m.owner && <span>Owner: {m.owner}</span>}
                        {m.data_source && <span>Source: {m.data_source}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  )
}
