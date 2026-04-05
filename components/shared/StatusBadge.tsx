import type { SessionStatus } from '@/lib/types'

const MAP: Record<SessionStatus, { label: string; class: string }> = {
  pending:  { label: 'Pending',  class: 'bg-zinc-700 text-zinc-300' },
  running:  { label: 'Running',  class: 'bg-yellow-500/20 text-yellow-400' },
  complete: { label: 'Complete', class: 'bg-teal-500/20 text-teal-400' },
  failed:   { label: 'Failed',   class: 'bg-red-500/20 text-red-400' },
}

export function StatusBadge({ status }: { status: SessionStatus }) {
  const { label, class: cls } = MAP[status]
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}
