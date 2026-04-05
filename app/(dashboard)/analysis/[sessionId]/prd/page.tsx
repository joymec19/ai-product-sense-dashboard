import { getPRDDocument, getPRDSections } from '@/lib/actions/prd'
import { PRDEditor } from '@/components/features/prd/PRDEditor'
import { EmptyState } from '@/components/shared/EmptyState'

interface Props { params: Promise<{ sessionId: string }> }

export default async function PRDPage({ params }: Props) {
  const { sessionId } = await params
  const prd = await getPRDDocument(sessionId)
  if (!prd) return (
    <EmptyState
      icon="file-text"
      title="No PRD generated yet"
      description="Run the analysis to generate your Product Requirements Document."
    />
  )

  const sections = await getPRDSections(prd.id)
  return <PRDEditor sessionId={sessionId} prd={prd} sections={sections} />
}
