import { CardShell } from '@/components/features/shared'
import type { RiskFactor } from '@/lib/types'

const IMPACT_COLOR: Record<string, string> = {
  low: 'text-zinc-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400',
}
const PROB_DOT: Record<string, string> = {
  low: 'bg-zinc-600', medium: 'bg-amber-500', high: 'bg-red-500',
}
const TYPE_BADGE: Record<string, string> = {
  market: 'bg-blue-900/30 text-blue-300',
  competitive: 'bg-purple-900/30 text-purple-300',
  regulatory: 'bg-orange-900/30 text-orange-300',
  technology: 'bg-teal-900/30 text-teal-300',
  execution: 'bg-amber-900/30 text-amber-300',
  financial: 'bg-red-900/30 text-red-300',
}

interface Props {
  risks: RiskFactor[]
}

export function RiskFactorList({ risks }: Props) {
  if (!risks.length) {
    return (
      <CardShell title="Risk Factors" subtitle="Market entry risks">
        <div className="px-4 py-8 text-center text-sm text-zinc-500">
          No risk factors yet. Run the analysis to generate an assessment.
        </div>
      </CardShell>
    )
  }

  const sorted = [...risks].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return (order[a.impact] ?? 4) - (order[b.impact] ?? 4)
  })

  return (
    <CardShell
      title="Risk Factors"
      subtitle={`${risks.length} risk${risks.length !== 1 ? 's' : ''} identified`}
      markdownFn={() =>
        sorted.map(r =>
          `### ${r.risk_title} (${r.risk_type})\n**Impact:** ${r.impact} · **Probability:** ${r.probability}\n\n${r.description}\n\n**Mitigation:** ${r.mitigation}`
        ).join('\n\n---\n\n')
      }
    >
      <ul className="divide-y divide-zinc-800/50">
        {sorted.map((r, i) => (
          <li key={i} className="px-4 py-3 space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${PROB_DOT[r.probability] ?? 'bg-zinc-600'}`} />
                <span className="text-sm font-medium text-zinc-100 truncate">{r.risk_title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_BADGE[r.risk_type] ?? 'bg-zinc-800 text-zinc-300'}`}>
                  {r.risk_type}
                </span>
                <span className={`text-xs font-medium ${IMPACT_COLOR[r.impact] ?? 'text-zinc-400'}`}>
                  {r.impact}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">{r.description}</p>
            {r.mitigation && (
              <p className="text-xs text-zinc-400">
                <span className="text-zinc-500">Mitigation: </span>{r.mitigation}
              </p>
            )}
          </li>
        ))}
      </ul>
    </CardShell>
  )
}
