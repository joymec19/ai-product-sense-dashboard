'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  sessionId: string
  productName: string
  hasData: boolean
}

export function MarketPageHeader({ sessionId, productName, hasData }: Props) {
  const [running, setRunning] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerate() {
    setRunning(true); setErr(null)
    try {
      const res = await fetch('/api/market-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, product_name: productName }),
      })
      if (!res.ok) {
        const b = await res.json() as { error?: string }
        throw new Error(b.error ?? 'Unknown error')
      }
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error generating market intelligence')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Market Intelligence</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{productName}</p>
        {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
      </div>
      <button
        onClick={handleGenerate}
        disabled={running}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
          ${running
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : 'bg-teal-700 hover:bg-teal-600 text-white'
          }`}
      >
        {running ? 'Analysing…' : hasData ? 'Refresh Market Intelligence' : 'Generate Market Intelligence'}
      </button>
    </div>
  )
}
