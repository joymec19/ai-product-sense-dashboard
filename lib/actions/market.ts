'use server'
import { createClient } from '@/lib/supabase/server'
import type { MarketSizing, MarketTrend, FundingEvent } from '@/lib/types'

export async function getMarketSizing(sessionId: string): Promise<MarketSizing[]> {
  const sb = await createClient()
  const { data } = await sb.from('market_sizing').select('*').eq('session_id', sessionId).order('created_at', { ascending: false })
  return (data ?? []) as MarketSizing[]
}
export async function getMarketTrends(sessionId: string): Promise<MarketTrend[]> {
  const sb = await createClient()
  const { data } = await sb.from('market_trends').select('*').eq('session_id', sessionId).order('relevance_score', { ascending: false })
  return (data ?? []) as MarketTrend[]
}
export async function getFundingEvents(sessionId: string): Promise<FundingEvent[]> {
  const sb = await createClient()
  const { data } = await sb.from('funding_events').select('*').eq('session_id', sessionId).order('announced_at', { ascending: false })
  return (data ?? []) as FundingEvent[]
}
