'use client'

import { useState } from 'react'

interface Props {
  getText: () => string
  label?: string
}

export function CopyMarkdownButton({ getText, label = 'MD' }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = getText()
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for http:// localhost
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent fail
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy as Markdown"
      className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}
