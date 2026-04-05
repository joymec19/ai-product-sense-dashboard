'use client'

import { useState, useTransition } from 'react'
import type { PRDDocument, PRDSection } from '@/lib/types'
import { updatePRDSection } from '@/lib/actions/prd'
import { SectionCard } from '@/components/shared/SectionCard'

interface Props {
  sessionId: string
  prd: PRDDocument
  sections: PRDSection[]
}

function PRDSectionEditor({
  section,
  sessionId,
}: {
  section: PRDSection
  sessionId: string
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(section.content_md ?? section.ai_content_md ?? '')
  const [isPending, startTransition] = useTransition()

  const save = () => {
    startTransition(() => {
      updatePRDSection(section.id, value, sessionId)
      setEditing(false)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {section.section_type.replace(/_/g, ' ')}
          {section.is_user_edited && (
            <span className="ml-2 text-teal-500 normal-case tracking-normal">edited</span>
          )}
        </h4>
        <button
          onClick={() => editing ? save() : setEditing(true)}
          disabled={isPending}
          className="text-xs text-zinc-500 hover:text-teal-400 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : editing ? 'Save' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm
            text-zinc-200 font-mono focus:border-teal-500 focus:outline-none resize-y transition-colors"
        />
      ) : (
        <div className="prose prose-sm prose-invert max-w-none text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {value || <span className="text-zinc-600 italic">No content yet.</span>}
        </div>
      )}
    </div>
  )
}

export function PRDEditor({ sessionId, prd, sections }: Props) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">{prd.title}</h1>
        <span className="text-xs text-zinc-500">v{prd.version_number} · {prd.status}</span>
      </div>
      {sections.map((s) => (
        <SectionCard key={s.id} title="">
          <PRDSectionEditor section={s} sessionId={sessionId} />
        </SectionCard>
      ))}
    </div>
  )
}
