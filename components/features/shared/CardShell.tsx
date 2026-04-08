'use client'

import { useState } from 'react'

interface Props {
  title: string
  subtitle?: string
  expandable?: boolean
  expandedContent?: React.ReactNode
  markdownFn?: () => string
  children: React.ReactNode
}

export function CardShell({ title, subtitle, expandable, expandedContent, markdownFn, children }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!markdownFn) return
    await navigator.clipboard.writeText(markdownFn())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100 truncate">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {markdownFn && (
            <button
              onClick={handleCopy}
              title="Copy as Markdown"
              className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {copied ? '✓ Copied' : 'MD'}
            </button>
          )}
          {expandable && expandedContent && (
            <button
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? 'Collapse' : 'Expand'}
              className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {expanded ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      {children}

      {/* Expandable panel */}
      {expandable && expanded && expandedContent && (
        <div className="border-t border-zinc-800 px-4 py-3 text-sm text-zinc-300 bg-zinc-900/60">
          {expandedContent}
        </div>
      )}
    </div>
  )
}
