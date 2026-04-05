import { getSessions } from '@/lib/actions/sessions'
import { SessionCard } from '@/components/features/sessions/SessionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import Link from 'next/link'

export default async function SessionsPage() {
  const sessions = await getSessions()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">Your Analyses</h1>
        <Link
          href="/sessions/new"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
        >
          New Analysis
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon="search"
          title="No analyses yet"
          description="Start by creating your first product analysis."
          action={{ label: 'Create Analysis', href: '/sessions/new' }}
        />
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  )
}
