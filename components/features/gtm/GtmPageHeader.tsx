'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GtmPlan } from '@/lib/supabase/gtm'

export function GtmPageHeader({ plan }: { plan: GtmPlan }) {
  const [running, setRunning] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerate() {
    setRunning(true); setErr(null)
    try {
      const res = await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: plan.session_id,
          plan_id: plan.id,
          product_name: 'your product', // passed from parent in real usage
          pricing_model: plan.pricing_model,
        }),
      })
      if (!res.ok) { const b = await res.json() as { error?: string }; throw new Error(b.error) }
      router.refresh()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Error') }
    finally { setRunning(false) }
  }

  const statusColor: Record<GtmPlan['status'], string> = {
    draft: 'text-zinc-400', in_review: 'text-amber-400',
    approved: 'text-emerald-400', archived: 'text-zinc-600',
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-zinc-100">GTM Strategy</h1>
          <span className={`text-xs font-medium uppercase tracking-wide ${statusColor[plan.status]}`}>{plan.status}</span>
        </div>
        {plan.pricing_model && <p className="text-sm text-zinc-500 mt-0.5">Model: {plan.pricing_model.replace('_', ' ')}</p>}
        {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
      </div>
      <button onClick={handleGenerate} disabled={running}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
          ${running ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-teal-700 hover:bg-teal-600 text-white'}`}>
        {running ? 'Generating…' : plan.positioning_statement ? 'Regenerate GTM Plan' : 'Generate GTM Plan'}
      </button>
    </div>
  )
}
