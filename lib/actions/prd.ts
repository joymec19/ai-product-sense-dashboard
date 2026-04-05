'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PRDDocument, PRDSection } from '@/lib/types'

export async function getPRDDocument(sessionId: string): Promise<PRDDocument | null> {
  const sb = await createClient()
  const { data } = await sb.from('prd_documents_v2').select('*').eq('session_id', sessionId).eq('is_latest', true).maybeSingle()
  return data as PRDDocument | null
}
export async function getPRDSections(prdId: string): Promise<PRDSection[]> {
  const sb = await createClient()
  const { data } = await sb.from('prd_sections').select('*').eq('prd_id', prdId).order('sort_order')
  return (data ?? []) as PRDSection[]
}
export async function updatePRDSection(sectionId: string, contentMd: string, sessionId: string) {
  const sb = await createClient()
  await sb.from('prd_sections').update({ content_md: contentMd, is_user_edited: true }).eq('id', sectionId)
  revalidatePath(`/analysis/${sessionId}/prd`)
}
