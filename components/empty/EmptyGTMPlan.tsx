import { EmptyStateFrame } from './EmptyStateFrame'

function GTMIllustration() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="h-full w-full">
      <rect x="22" y="56" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2" />
      <rect x="68" y="56" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2" />
      <rect x="114" y="56" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2" />
      <path d="M46 68h22M92 68h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 110h92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

export function EmptyGTMPlan({ planId }: { planId: string }) {
  return (
    <EmptyStateFrame
      eyebrow="GTM Planner"
      title="No go-to-market plan has been built yet"
      description="Build a GTM plan to define the ICP, sharpen positioning, choose channels, and sequence launch work."
      ctaLabel="Build GTM Plan"
      ctaHref={`/dashboard/gtm/${planId}/run`}
      illustration={<GTMIllustration />}
    />
  )
}
