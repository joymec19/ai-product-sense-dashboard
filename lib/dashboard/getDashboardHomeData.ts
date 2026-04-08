'use server'
import { createClient } from '@/lib/supabase/server'
import type { AnalysisSession, GTMPlan } from '@/lib/types'

export interface DashboardAnalysisItem {
  id: string
  productName: string
  statusLabel: string
  updatedAtLabel: string
}

export interface DashboardSummary {
  totalAnalyses: number
  activePlans: number
  lastActivityLabel: string
}

export interface DashboardHomeData {
  summary: DashboardSummary
  analyses: DashboardAnalysisItem[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  running: 'Running',
  complete: 'Complete',
  failed: 'Failed',
}

export async function getDashboardHomeData(): Promise<DashboardHomeData> {
  const sb = await createClient()

  const { data: sessions } = await sb
    .from('analysis_sessions')
    .select('id, product_name, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10)

  const rows = (sessions ?? []) as Pick<AnalysisSession, 'id' | 'product_name' | 'status' | 'updated_at'>[]

  const { count: activePlans } = await sb
    .from('gtm_plans')
    .select('id', { count: 'exact', head: true })
    .neq('status', 'archived')

  const lastActivity = rows[0]?.updated_at
    ? formatDate(rows[0].updated_at)
    : '—'

  return {
    summary: {
      totalAnalyses: rows.length,
      activePlans: activePlans ?? 0,
      lastActivityLabel: lastActivity,
    },
    analyses: rows.map((s) => ({
      id: s.id,
      productName: s.product_name,
      statusLabel: STATUS_LABELS[s.status] ?? s.status,
      updatedAtLabel: formatDate(s.updated_at),
    })),
  }
}
