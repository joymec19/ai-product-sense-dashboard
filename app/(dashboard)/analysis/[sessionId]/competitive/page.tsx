import { getSession } from '@/lib/actions/sessions'
import { getCompetitors, getCompetitorFeatures, getPositioningScores, getStrategicGaps } from '@/lib/actions/competitive'
import { CompetitiveHub } from '@/components/features/competitive/CompetitiveHub'
import { CompetitiveInsightHeader } from '@/components/features/competitive/CompetitiveInsightHeader'
import { EmptyCompetitiveAnalysis } from '@/components/empty/EmptyCompetitiveAnalysis'

interface Props { params: Promise<{ sessionId: string }> }

export default async function CompetitivePage({ params }: Props) {
  const { sessionId } = await params

  const [session, competitors, features, positioning, gaps] = await Promise.all([
    getSession(sessionId),
    getCompetitors(sessionId),
    getCompetitorFeatures(sessionId),
    getPositioningScores(sessionId),
    getStrategicGaps(sessionId),
  ])

  if (!session) return null

  if (competitors.length === 0) {
    return <EmptyCompetitiveAnalysis analysisId={sessionId} />
  }

  return (
    <div className="space-y-6">
      <CompetitiveInsightHeader
        sessionId={sessionId}
        productName={session.product_name}
        status={session.status}
        competitorCount={competitors.length}
      />
      <CompetitiveHub
        sessionId={sessionId}
        competitors={competitors}
        features={features}
        positioning={positioning}
        gaps={gaps}
      />
    </div>
  )
}
