'use server'
import { revalidatePath } from 'next/cache'
import {
  createGTMPlan,
  getGTMPlan,
  listGTMPlans,
  updateGTMPlan,
  getGTMChannels,
  getGTMExperiments,
  updateExperimentStatus,
} from '@/lib/supabase/gtm'
import type { GTMPlanInput } from '@/lib/supabase/gtm'
import type { GTMPlan, GTMChannel, GTMExperiment } from '@/lib/types'

export { createGTMPlan, getGTMPlan, listGTMPlans, updateGTMPlan, getGTMChannels, getGTMExperiments }

export async function updateExperimentStatusAction(
  id: string,
  status: GTMExperiment['status'],
  sessionId: string,
): Promise<void> {
  await updateExperimentStatus(id, status)
  revalidatePath(`/analysis/${sessionId}/gtm/experiments`)
}
