// app/api/competitive/route.ts (F1)
// GET — fetch competitive intelligence snapshot for a session.
// Useful for client-side data fetching (SWR) without hitting Server Actions.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  queryCompetitors,
  queryCompetitorFeatures,
  queryPositioningScores,
  queryStrategicGaps,
} from '@/lib/supabase/competitive'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify session ownership
  const { data: session } = await sb
    .from('analysis_sessions')
    .select('id, product_name, status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const [competitors, features, positioning, gaps] = await Promise.all([
    queryCompetitors(sb, sessionId),
    queryCompetitorFeatures(sb, sessionId),
    queryPositioningScores(sb, sessionId),
    queryStrategicGaps(sb, sessionId),
  ])

  return NextResponse.json({
    session,
    competitors,
    features,
    positioning,
    gaps,
  })
}
