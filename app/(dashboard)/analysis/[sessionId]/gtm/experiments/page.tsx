import { getGTMPlan, getGTMExperiments } from '@/lib/actions/gtm'
import { ExperimentRoadmap } from '@/components/features/gtm/ExperimentRoadmap'
import { EmptyState } from '@/components/shared/EmptyState'

interface Props { params: { sessionId: string } }

export default async function ExperimentsPage({ params }: Props) {
  const plan = await getGTMPlan(params.sessionId)
  if (!plan) return (
    <EmptyState
      icon="flask"
      title="No GTM plan yet"
      description="Generate your GTM strategy first."
      action={{ label: 'Go to GTM', href: `/analysis/${params.sessionId}/gtm` }}
    />
  )

  const experiments = await getGTMExperiments(plan.id)
  return <ExperimentRoadmap sessionId={params.sessionId} plan={plan} experiments={experiments} />
}
