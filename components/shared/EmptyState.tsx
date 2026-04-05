import Link from 'next/link'

interface Props {
  icon?: string
  title: string
  description: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <p className="text-zinc-100 font-medium">{title}</p>
      <p className="text-sm text-zinc-500 max-w-xs">{description}</p>
      {action && (
        action.href
          ? <Link href={action.href} className="mt-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors">{action.label}</Link>
          : <button onClick={action.onClick} className="mt-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors">{action.label}</button>
      )}
    </div>
  )
}
