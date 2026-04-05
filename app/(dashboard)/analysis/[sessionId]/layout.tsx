import { notFound } from 'next/navigation'
import { getSession } from '@/lib/actions/sessions'
import { SessionProvider } from '@/contexts/SessionContext'
import { AnalysisHeader } from '@/components/layout/AnalysisHeader'
import { FeatureSubnav } from '@/components/layout/FeatureSubnav'

interface Props {
  children: React.ReactNode
  params: { sessionId: string }
}

export default async function AnalysisLayout({ children, params }: Props) {
  const session = await getSession(params.sessionId)
  if (!session) notFound()

  return (
    <SessionProvider session={session}>
      <div className="flex flex-col h-full">
        <AnalysisHeader session={session} />
        <FeatureSubnav sessionId={params.sessionId} />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </SessionProvider>
  )
}
