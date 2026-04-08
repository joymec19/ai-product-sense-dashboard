import { NextRequest, NextResponse } from 'next/server'
import { runMarketChain } from '@/lib/llm/market'
import { saveMarketIntelligence } from '@/lib/supabase/market-intelligence'

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
      category: body.category,
      geography: body.geography,
      sessionId: body.session_id,
    })

    await saveMarketIntelligence(body.session_id, result)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const status = message.includes('SARVAM_API_KEY') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
