import Link from 'next/link'
import { ReactNode } from 'react'

type Props = {
  eyebrow?: string
  title: string
  description: string
  ctaLabel: string
  ctaHref?: string
  onClick?: () => void
  illustration: ReactNode
}

export function EmptyStateFrame({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  onClick,
  illustration,
}: Props) {
  const Button = (
    <button
      onClick={onClick}
      className="inline-flex items-center rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
    >
      {ctaLabel}
    </button>
  )

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-10 text-center">
      <div className="mx-auto mb-6 h-32 w-32 text-zinc-500">{illustration}</div>
      {eyebrow && (
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          {eyebrow}
        </div>
      )}
      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">{description}</p>
      <div className="mt-6">
        {ctaHref ? <Link href={ctaHref}>{Button}</Link> : Button}
      </div>
    </div>
  )
}
