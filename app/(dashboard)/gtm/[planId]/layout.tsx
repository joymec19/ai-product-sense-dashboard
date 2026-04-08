import type { ReactNode } from 'react'
import { GtmErrorBoundary } from '@/components/features/gtm/GtmErrorBoundary'

export default function GtmPlanLayout({ children }: { children: ReactNode }) {
  return <GtmErrorBoundary>{children}</GtmErrorBoundary>
}
