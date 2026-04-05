import type { MarketTrend } from '@/lib/types'

const SENTIMENT_COLOR = { positive: 'text-teal-400', negative: 'text-red-400', neutral: 'text-zinc-400' }

export function TrendFeed({ trends }: { trends: MarketTrend[] }) {
  if (!trends.length) return (
    <p className="text-sm text-zinc-500 text-center py-4">No trends found yet.</p>
  )

  return (
    <ul className="divide-y divide-zinc-800/50 space-y-0">
      {trends.map((t) => (
        <li key={t.id} className="py-3 space-y-1">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-zinc-200 font-medium leading-snug">{t.trend_title}</p>
            {t.sentiment && (
              <span className={`text-xs shrink-0 ${SENTIMENT_COLOR[t.sentiment]}`}>{t.sentiment}</span>
            )}
          </div>
          {t.trend_summary && <p className="text-xs text-zinc-500 leading-relaxed">{t.trend_summary}</p>}
          {t.source_url && (
            <a href={t.source_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-zinc-600 hover:text-teal-400 transition-colors">
              {t.source_name ?? t.source_url}
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}
