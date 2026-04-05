'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Sessions', href: '/sessions', icon: '◈' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-16 flex flex-col items-center border-r border-zinc-800 bg-zinc-950 py-4 gap-6">
      <Link href="/sessions" className="text-teal-400 font-bold text-lg">PS</Link>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-xl transition-colors ${
            pathname.startsWith(item.href) ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={item.label}
        >
          {item.icon}
        </Link>
      ))}
    </aside>
  )
}
