'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  sessionId: string
  onComplete?: () => void
}

export function RunAnalysisButton({ sessionId, onComplete }: Props) {
  const [running, setRunning] = useState(false)

  async function handleClick() {
    setRunning(true)
    const sb = createClient()

    // Subscribe to session status via Realtime
    const channel = sb.channel(`session-competitive-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'analysis_sessions',
        filter: `id=eq.${sessionId}`,
      }, payload => {
        const status = payload.new.status as string
        if (status === 'complete') {
          channel.unsubscribe()
          setRunning(false)
          onComplete?.()
        } else if (status === 'failed') {
          channel.unsubscribe()
          setRunning(false)
          toast.error(payload.new.error_message ?? 'Analysis failed')
        }
      })
      .subscribe()

    const res = await fetch(`/api/analysis/${sessionId}/competitive`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      channel.unsubscribe()
      setRunning(false)
      toast.error(body.error ?? 'unknown')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={running}
      className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
    >
      {running && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {running ? 'Running…' : 'Run Competitive Analysis'}
    </button>
  )
}
