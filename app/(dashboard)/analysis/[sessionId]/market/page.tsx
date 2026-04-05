import { getMarketSizing, getMarketTrends, getFundingEvents } from '@/lib/actions/market'
import { MarketHub } from '@/components/features/market/MarketHub'

interface Props { params: { sessionId: string } }

export default async function MarketPage({ params }: Props) {
  const [sizing, trends, funding] = await Promise.all([
    getMarketSizing(params.sessionId),
    getMarketTrends(params.sessionId),
    getFundingEvents(params.sessionId),
  ])

  return (
    <MarketHub
      sessionId={params.sessionId}
      sizing={sizing}
      trends={trends}
      funding={funding}
    />
  )
}
