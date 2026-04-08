import { EmptyStateFrame } from './EmptyStateFrame'

function CompetitiveIllustration() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="h-full w-full">
      <rect x="24" y="36" width="30" height="64" rx="8" stroke="currentColor" strokeWidth="2" />
      <rect x="65" y="24" width="30" height="76" rx="8" stroke="currentColor" strokeWidth="2" />
      <rect x="106" y="48" width="30" height="52" rx="8" stroke="currentColor" strokeWidth="2" />
      <path d="M32 120h96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function EmptyCompetitiveAnalysis({ analysisId }: { analysisId: string }) {
  return (
    <EmptyStateFrame
      eyebrow="Competitive Intelligence"
      title="No competitor research yet"
      description="Run competitive analysis to map peers, compare positioning, and identify the gaps that matter for this product."
      ctaLabel="Run Competitive Analysis"
      ctaHref={`/dashboard/analysis/${analysisId}/competitive/run`}
      illustration={<CompetitiveIllustration />}
    />
  )
}
