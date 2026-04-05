'use client'

import { useTransition } from 'react'
import { createSession } from '@/lib/actions/sessions'

export function NewSessionForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => { createSession(formData) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { name: 'product_name', label: 'Product Name', required: true, placeholder: 'e.g. Notion' },
        { name: 'product_url',  label: 'Product URL',  required: false, placeholder: 'https://...' },
        { name: 'category',     label: 'Category',     required: false, placeholder: 'e.g. Productivity' },
        { name: 'geography',    label: 'Geography',    required: false, placeholder: 'e.g. India, Global' },
      ].map(({ name, label, required, placeholder }) => (
        <div key={name} className="space-y-1">
          <label htmlFor={name} className="block text-xs font-medium text-zinc-400">{label}</label>
          <input
            id={name}
            name={name}
            required={required}
            placeholder={placeholder}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm
              text-zinc-200 placeholder:text-zinc-600 focus:border-teal-500 focus:outline-none transition-colors"
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white
          hover:bg-teal-500 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Creating…' : 'Create Analysis'}
      </button>
    </form>
  )
}
