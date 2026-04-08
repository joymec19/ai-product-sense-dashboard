'use client'
import { useState } from 'react'
import { CardShell, EmptyState } from '@/components/features/shared'
import type { GtmChannel, GtmExperiment } from '@/lib/supabase/gtm'

interface Props { channels: GtmChannel[]; experiments: GtmExperiment[] }

const TYPE_BADGE: Record<string, string> = {
  paid: 'bg-red-900/40 text-red-400', organic: 'bg-emerald-900/40 text-emerald-400',
  product: 'bg-blue-900/40 text-blue-400', partnerships: 'bg-purple-900/40 text-purple-400',
  events: 'bg-amber-900/40 text-amber-400', community: 'bg-cyan-900/40 text-cyan-400',
}

const CONF_DOT: Record<string, string> = { high: 'bg-emerald-400', medium: 'bg-amber-400', low: 'bg-zinc-500' }

export function ChannelStrategyTable({ channels, experiments }: Props) {
  const [tab, setTab] = useState<'channels' | 'experiments'>('channels')

  function buildMarkdown(): string {
    const lines = ['## Channel Strategy', '', '| Channel | Type | CAC | Budget/mo | Priority |', '|---|---|---|---|---|']
    channels.forEach((c) => lines.push(`| ${c.channel_name} | ${c.channel_type} | $${c.cac_usd} | $${c.monthly_budget_usd?.toLocaleString()} | P${c.priority} |`))
    lines.push('', '## Experiments', '')
    experiments.forEach((e) => lines.push(`- **${e.hypothesis}**  Metric: ${e.metric}  Phase: ${e.phase}`))
    return lines.join('\n')
  }

  return (
    <CardShell title="Channel Strategy" subtitle={`${channels.length} channels · ${experiments.length} experiments`} markdownFn={buildMarkdown}>
      {channels.length === 0 ? <EmptyState message="Channel strategy will appear after GTM generation." /> : (
        <div>
          <div className="flex gap-1 px-4 py-3 border-b border-zinc-800">
            {(['channels', 'experiments'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors capitalize
                  ${tab === t ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800/60 text-zinc-500 hover:bg-zinc-700/60'}`}>
                {t}
              </button>
            ))}
          </div>
          {tab === 'channels' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Channel', 'Type', 'CAC', 'Budget/mo', 'Signups', 'P'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {channels.map((c) => (
                    <tr key={c.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="text-sm font-medium text-zinc-200">{c.channel_name}</div>
                        <div className="text-xs text-zinc-500 mt-0.5 max-w-xs truncate">{c.rationale}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        {c.channel_type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_BADGE[c.channel_type] ?? 'bg-zinc-800 text-zinc-400'}`}>{c.channel_type}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-zinc-300">
                        {c.cac_usd != null ? `$${c.cac_usd.toLocaleString()}` : '—'}
                        {c.cac_confidence && (
                          <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${CONF_DOT[c.cac_confidence]}`} title={`${c.cac_confidence} confidence`} />
                        )}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-zinc-400">
                        {c.monthly_budget_usd != null ? `$${c.monthly_budget_usd.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-zinc-400">
                        {c.target_signups != null ? c.target_signups.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {c.priority != null && <span className="text-xs font-bold text-teal-400">P{c.priority}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'experiments' && (
            <div className="divide-y divide-zinc-800">
              {experiments.length === 0 ? (
                <EmptyState message="No experiments yet." />
              ) : experiments.map((e) => (
                <div key={e.id} className="px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {e.phase && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        e.phase === 'discovery' ? 'bg-blue-900/40 text-blue-400' :
                        e.phase === 'validation' ? 'bg-amber-900/40 text-amber-400' :
                        e.phase === 'scaling' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                      }`}>{e.phase}</span>
                    )}
                    {e.duration_weeks && <span className="text-xs text-zinc-500">{e.duration_weeks}w</span>}
                    {e.priority != null && <span className="text-xs font-bold text-teal-400 ml-auto">P{e.priority}</span>}
                  </div>
                  <p className="text-sm text-zinc-300">{e.hypothesis}</p>
                  <div className="flex gap-4 mt-1 text-xs text-zinc-500">
                    <span>Metric: <strong className="text-zinc-400">{e.metric}</strong></span>
                    {e.target_value != null && <span>Target: <strong className="text-zinc-400 tabular-nums">{e.target_value}</strong></span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </CardShell>
  )
}
