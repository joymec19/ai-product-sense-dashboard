import type { Confidence } from '@/lib/types'

const COLORS: Record<Confidence, string> = {
  low:    'bg-red-500',
  medium: 'bg-yellow-500',
  high:   'bg-teal-500',
}

export function ConfidencePip({ level }: { level: Confidence }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
      <span className={`inline-block h-2 w-2 rounded-full ${COLORS[level]}`} />
      {level} confidence
    </span>
  )
}
