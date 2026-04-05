import { getGTMPlan, getGTMChannels } from '@/lib/actions/gtm'
import { GTMHub } from '@/components/features/gtm/GTMHub'

interface Props { params: Promise<{ sessionId: string }> }

export default async function GTMPage({ params }: Props) {
  const { sessionId } = await params
  const plan = await getGTMPlan(sessionId)
  const channels = plan ? await getGTMChannels(plan.id) : []

  return <GTMHub sessionId={sessionId} plan={plan} channels={channels} />
}
