'use client'
import React, { createContext, useContext, useState } from 'react'
import type { AnalysisSession } from '@/lib/types'

interface Ctx { session: AnalysisSession; isRunning: boolean; setIsRunning: (v: boolean) => void }
const SessionContext = createContext<Ctx | null>(null)

export function SessionProvider({ session: init, children }: { session: AnalysisSession; children: React.ReactNode }) {
  const [session] = useState(init)
  const [isRunning, setIsRunning] = useState(init.status === 'running')
  return <SessionContext.Provider value={{ session, isRunning, setIsRunning }}>{children}</SessionContext.Provider>
}
export function useSession(): Ctx {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
