import { EmptyStateFrame } from './EmptyStateFrame'

function MarketIllustration() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="h-full w-full">
      <path d="M28 112h104" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 102l18-20 20 10 18-28 24 16 12-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="58" cy="82" r="4" fill="currentColor" />
      <circle cx="78" cy="92" r="4" fill="currentColor" />
      <circle cx="96" cy="64" r="4" fill="currentColor" />
      <circle cx="120" cy="80" r="4" fill="currentColor" />
    </svg>
  )
}

export function EmptyMarketIntelligence({ analysisId }: { analysisId: string }) {
  return (
    <EmptyStateFrame
      eyebrow="Market Intelligence"
      title="Market signals have not been analyzed yet"
      description="Analyze the market to estimate opportunity size, surface important trends, and identify the risks shaping this space."
      ctaLabel="Analyze Market"
      ctaHref={`/dashboard/market/${analysisId}/run`}
      illustration={<MarketIllustration />}
    />
  )
}
