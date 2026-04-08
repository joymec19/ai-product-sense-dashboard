import { CardShell } from '@/components/features/shared'
import type { BuyerPersona } from '@/lib/types'

const WTP_COLOR: Record<string, string> = {
  low: 'text-red-400', medium: 'text-amber-400', high: 'text-teal-400', enterprise: 'text-purple-400',
}
const ROLE_BADGE: Record<string, string> = {
  champion: 'bg-teal-900/40 text-teal-300',
  decision_maker: 'bg-purple-900/40 text-purple-300',
  influencer: 'bg-blue-900/40 text-blue-300',
  end_user: 'bg-zinc-800 text-zinc-300',
  blocker: 'bg-red-900/40 text-red-300',
}

interface Props {
  personas: BuyerPersona[]
}

export function BuyerPersonaGrid({ personas }: Props) {
  if (!personas.length) {
    return (
      <CardShell title="Buyer Personas" subtitle="ICP profiles">
        <div className="px-4 py-8 text-center text-sm text-zinc-500">
          No buyer personas yet. Run the analysis to generate profiles.
        </div>
      </CardShell>
    )
  }

  return (
    <CardShell
      title="Buyer Personas"
      subtitle={`${personas.length} profile${personas.length !== 1 ? 's' : ''}`}
      markdownFn={() =>
        personas.map(p =>
          `### ${p.persona_name} — ${p.title}\n> "${p.key_quote}"\n\n**JTBD:** ${p.primary_job_to_be_done}\n\n**Pains:** ${p.top_pains.join(' · ')}`
        ).join('\n\n---\n\n')
      }
    >
      <div className="divide-y divide-zinc-800/50">
        {personas.map((p, i) => (
          <div key={i} className="px-4 py-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-100">{p.persona_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_BADGE[p.decision_making_role] ?? 'bg-zinc-800 text-zinc-300'}`}>
                    {p.decision_making_role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{p.title} · {p.company_size}</p>
              </div>
              <span className={`text-xs font-medium shrink-0 ${WTP_COLOR[p.willingness_to_pay] ?? 'text-zinc-400'}`}>
                WTP: {p.willingness_to_pay}
              </span>
            </div>

            <p className="text-xs text-zinc-400 italic">&ldquo;{p.key_quote}&rdquo;</p>

            <div className="space-y-1">
              <p className="text-xs text-zinc-500"><span className="text-zinc-400 font-medium">JTBD:</span> {p.primary_job_to_be_done}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              {p.top_pains.slice(0, 3).map((pain, j) => (
                <span key={j} className="text-[10px] bg-red-900/20 text-red-300 px-1.5 py-0.5 rounded">
                  {pain}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  )
}
