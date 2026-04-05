import { getGTMPlan, getGTMChannels } from '@/lib/actions/gtm'
import { GTMHub } from '@/components/features/gtm/GTMHub'

interface Props { params: { sessionId: string } }

export default async function GTMPage({ params }: Props) {
  const plan = await getGTMPlan(params.sessionId)
  const channels = plan ? await getGTMChannels(plan.id) : []

  return <GTMHub sessionId={params.sessionId} plan={plan} channels={channels} />
}
