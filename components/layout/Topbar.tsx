'use client'

import type { User } from '@supabase/supabase-js'

export function Topbar({ user }: { user: User }) {
  return (
    <header className="h-12 border-b border-zinc-800 flex items-center justify-end px-6 bg-zinc-950">
      <span className="text-xs text-zinc-400">{user.email}</span>
    </header>
  )
}
