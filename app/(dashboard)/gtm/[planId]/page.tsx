import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGtmPlan } from '@/lib/supabase/gtm'
import { GtmPageHeader } from '@/components/features/gtm/GtmPageHeader'
import { ICPDefinitionCard } from '@/components/features/gtm/ICPDefinitionCard'
import { PositioningStatementBlock } from '@/components/features/gtm/PositioningStatementBlock'
import { ChannelStrategyTable } from '@/components/features/gtm/ChannelStrategyTable'
import { LaunchSequenceTimeline } from '@/components/features/gtm/LaunchSequenceTimeline'
import { SuccessMetricsDashboard } from '@/components/features/gtm/SuccessMetricsDashboard'
import { EmptyGTMPlan } from '@/components/empty/EmptyGTMPlan'

interface Props { params: Promise<{ planId: string }> }

export default async function GtmPlanPage({ params }: Props) {
  const { planId } = await params

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const data = await getGtmPlan(planId)
  if (!data) notFound()

  // Auth guard via session ownership
  const { data: session } = await sb
    .from('analysis_sessions')
    .select('user_id')
    .eq('id', data.plan.session_id)
    .single()
  if (!session || session.user_id !== user.id) notFound()

  const { plan, channels, experiments, messaging, metrics, phases } = data
  const hasData = !!plan.positioning_statement

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto">
      <GtmPageHeader plan={plan} />

      {!hasData && (
        <EmptyGTMPlan planId={planId} />
      )}

      {hasData && (
        <>
          {/* Row 1: Positioning + ICP side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PositioningStatementBlock plan={plan} messaging={messaging} />
            <ICPDefinitionCard plan={plan} />
          </div>

          {/* Row 2: Launch Timeline — full width */}
          <LaunchSequenceTimeline phases={phases} />

          {/* Row 3: Channels + Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ChannelStrategyTable channels={channels} experiments={experiments} />
            </div>
            <div className="xl:col-span-1">
              <SuccessMetricsDashboard metrics={metrics} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
