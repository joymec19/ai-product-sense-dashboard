'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const FEATURES = [
  { label: 'Competitive', slug: 'competitive' },
  { label: 'Market', slug: 'market' },
  { label: 'GTM', slug: 'gtm' },
  { label: 'PRD', slug: 'prd' },
  { label: 'Assistant', slug: 'assistant' },
]

export function FeatureSubnav({ sessionId }: { sessionId: string }) {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 border-b border-zinc-800 px-6 bg-zinc-950">
      {FEATURES.map((f) => {
        const href = `/analysis/${sessionId}/${f.slug}`
        const active = pathname.startsWith(href)
        return (
          <Link
            key={f.slug}
            href={href}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              active
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f.label}
          </Link>
        )
      })}
    </nav>
  )
}
