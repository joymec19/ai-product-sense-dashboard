import { getGTMPlan, getGTMExperiments } from '@/lib/actions/gtm'
import { ExperimentRoadmap } from '@/components/features/gtm/ExperimentRoadmap'
import { EmptyState } from '@/components/shared/EmptyState'

interface Props { params: Promise<{ sessionId: string }> }

export default async function ExperimentsPage({ params }: Props) {
  const { sessionId } = await params
  const plan = await getGTMPlan(sessionId)
  if (!plan) return (
    <EmptyState
      icon="flask"
      title="No GTM plan yet"
      description="Generate your GTM strategy first."
      action={{ label: 'Go to GTM', href: `/analysis/${sessionId}/gtm` }}
    />
  )

  const experiments = await getGTMExperiments(plan.id)
  return <ExperimentRoadmap sessionId={sessionId} plan={plan} experiments={experiments} />
}
