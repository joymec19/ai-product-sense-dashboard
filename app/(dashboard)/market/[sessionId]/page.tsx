import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMarketIntelligence } from '@/lib/supabase/market-intelligence'
import { MarketPageHeader } from '@/components/features/market/MarketPageHeader'
import { MarketSizingCard } from '@/components/features/market/MarketSizingCard'
import { TrendFeed } from '@/components/features/market/TrendFeed'
import { BuyerPersonaGrid } from '@/components/features/market/BuyerPersonaGrid'
import { RiskFactorList } from '@/components/features/market/RiskFactorList'
import { CardShell } from '@/components/features/shared'
import { EmptyMarketIntelligence } from '@/components/empty/EmptyMarketIntelligence'

interface Props { params: Promise<{ sessionId: string }> }

export default async function MarketPage({ params }: Props) {
  const { sessionId } = await params

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await sb
    .from('analysis_sessions')
    .select('user_id, product_name')
    .eq('id', sessionId)
    .single()
  if (!session || session.user_id !== user.id) notFound()

  const { sizing, trends, personas, risks } = await getMarketIntelligence(sessionId)

  const hasData = sizing !== null || trends.length > 0 || personas.length > 0 || risks.length > 0

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto">
      <MarketPageHeader
        sessionId={sessionId}
        productName={session.product_name}
        hasData={hasData}
      />

      {!hasData && (
        <EmptyMarketIntelligence analysisId={sessionId} />
      )}

      {hasData && (
        <>
          {/* Row 1: Sizing (left 1/3) + Trends (right 2/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MarketSizingCard sizing={sizing} />
            </div>
            <div className="lg:col-span-2">
              <CardShell title="Market Trends" subtitle={`${trends.length} signal${trends.length !== 1 ? 's' : ''}`}>
                <div className="px-4 py-2">
                  <TrendFeed trends={trends} />
                </div>
              </CardShell>
            </div>
          </div>

          {/* Row 2: Buyer Personas (left 1/2) + Risk Factors (right 1/2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BuyerPersonaGrid personas={personas} />
            <RiskFactorList risks={risks} />
          </div>
        </>
      )}
    </div>
  )
}
