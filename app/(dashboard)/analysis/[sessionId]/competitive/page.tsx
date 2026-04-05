import { getCompetitors, getCompetitorFeatures, getPositioningScores } from '@/lib/actions/competitive'
import { CompetitiveHub } from '@/components/features/competitive/CompetitiveHub'

interface Props { params: { sessionId: string } }

export default async function CompetitivePage({ params }: Props) {
  const [competitors, features, positioning] = await Promise.all([
    getCompetitors(params.sessionId),
    getCompetitorFeatures(params.sessionId),
    getPositioningScores(params.sessionId),
  ])

  return (
    <CompetitiveHub
      sessionId={params.sessionId}
      competitors={competitors}
      features={features}
      positioning={positioning}
    />
  )
}
