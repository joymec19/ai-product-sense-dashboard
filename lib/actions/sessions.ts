'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { AnalysisSession } from '@/lib/types'

export async function getSession(id: string): Promise<AnalysisSession | null> {
  const sb = await createClient()
  const { data } = await sb.from('analysis_sessions').select('*').eq('id', id).single()
  return data as AnalysisSession | null
}
export async function getSessions(): Promise<AnalysisSession[]> {
  const sb = await createClient()
  const { data } = await sb.from('analysis_sessions').select('*').order('created_at', { ascending: false })
  return (data ?? []) as AnalysisSession[]
}
export async function createSession(formData: FormData) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data, error } = await sb.from('analysis_sessions').insert({
    user_id: user.id,
    product_name: formData.get('product_name') as string,
    product_url:  formData.get('product_url') as string || null,
    category:     formData.get('category') as string || null,
    geography:    formData.get('geography') as string || null,
    segment_tags: [], custom_competitors: [], status: 'pending',
  }).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/sessions')
  redirect(`/analysis/${data.id}/competitive`)
}
export async function deleteSession(id: string) {
  const sb = await createClient()
  await sb.from('analysis_sessions').delete().eq('id', id)
  revalidatePath('/sessions')
  redirect('/sessions')
}
