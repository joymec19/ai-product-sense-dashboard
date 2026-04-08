import type { ReactNode } from 'react'
import { MarketErrorBoundary } from '@/components/features/market/MarketErrorBoundary'

export default function MarketLayout({ children }: { children: ReactNode }) {
  return <MarketErrorBoundary>{children}</MarketErrorBoundary>
}
