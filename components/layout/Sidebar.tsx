'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/new', label: 'New Analysis' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 px-3 py-5">
      <Link
        href="/dashboard"
        className="mb-6 px-3 text-sm font-semibold tracking-wide text-teal-400"
      >
        Product Sense
      </Link>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
