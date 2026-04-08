import { EmptyStateFrame } from './EmptyStateFrame'

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="h-full w-full">
      <rect x="24" y="28" width="112" height="84" rx="14" stroke="currentColor" strokeWidth="2" />
      <rect x="38" y="46" width="32" height="10" rx="5" fill="currentColor" opacity="0.25" />
      <rect x="38" y="66" width="84" height="8" rx="4" fill="currentColor" opacity="0.18" />
      <rect x="38" y="82" width="64" height="8" rx="4" fill="currentColor" opacity="0.18" />
      <path d="M54 122h52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function EmptyDashboard() {
  return (
    <EmptyStateFrame
      eyebrow="Dashboard"
      title="Start with your first product analysis"
      description="Run one analysis to unlock competitive intelligence, market context, and a GTM plan built from the same source context."
      ctaLabel="Start New Analysis"
      ctaHref="/dashboard/new"
      illustration={<DashboardIllustration />}
    />
  )
}
