import { getMarketSizing, getMarketTrends, getFundingEvents } from '@/lib/actions/market'
import { MarketHub } from '@/components/features/market/MarketHub'

interface Props { params: Promise<{ sessionId: string }> }

export default async function MarketPage({ params }: Props) {
  const { sessionId } = await params
  const [sizing, trends, funding] = await Promise.all([
    getMarketSizing(sessionId),
    getMarketTrends(sessionId),
    getFundingEvents(sessionId),
  ])

  return (
    <MarketHub
      sessionId={sessionId}
      sizing={sizing}
      trends={trends}
      funding={funding}
    />
  )
}
