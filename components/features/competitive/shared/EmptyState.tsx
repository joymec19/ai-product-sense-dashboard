// Competitive-specific EmptyState — prompts user to run analysis
interface Props {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function CompetitiveEmptyState({
  title = 'No data yet',
  description = 'Run a competitive analysis to populate this section.',
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="rounded-full bg-zinc-800 p-3">
        <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      </div>
      <p className="text-sm font-medium text-zinc-200">{title}</p>
      <p className="text-xs text-zinc-500 max-w-xs">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
