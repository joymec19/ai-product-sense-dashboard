import { getPRDDocument, getPRDSections } from '@/lib/actions/prd'
import { PRDEditor } from '@/components/features/prd/PRDEditor'
import { EmptyState } from '@/components/shared/EmptyState'

interface Props { params: { sessionId: string } }

export default async function PRDPage({ params }: Props) {
  const prd = await getPRDDocument(params.sessionId)
  if (!prd) return (
    <EmptyState
      icon="file-text"
      title="No PRD generated yet"
      description="Run the analysis to generate your Product Requirements Document."
    />
  )

  const sections = await getPRDSections(prd.id)
  return <PRDEditor sessionId={params.sessionId} prd={prd} sections={sections} />
}
