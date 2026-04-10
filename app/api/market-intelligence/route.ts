import { NextRequest, NextResponse } from 'next/server'
import { runMarketChain } from '@/lib/llm/market'
import { saveMarketIntelligence } from '@/lib/supabase/market-intelligence'

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface PostBody {
  session_id: string
  product_name: string
  category?: string
  geography?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PostBody

    if (!body.session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }
    if (!body.product_name) {
      return NextResponse.json({ error: 'product_name is required' }, { status: 400 })
    }

    const result = await runMarketChain({
      product_name: body.product_name,
      sessionId: body.session_id,
      ...(body.category !== undefined && { category: body.category }),
      ...(body.geography !== undefined && { geography: body.geography }),
    })

    await saveMarketIntelligence(body.session_id, result)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const status = message.includes('SARVAM_API_KEY') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
