// lib/supabase/health-check.ts
import { createSupabaseServiceClient } from './server';

export interface HealthCheckResult {
  healthy: boolean;
  latencyMs: number;
  error?: string;
  checkedAt: string;
}

export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const start = performance.now();
  const checkedAt = new Date().toISOString();

  try {
    const supabase = createSupabaseServiceClient();

    // Lightweight query — hits the DB without scanning user data
    const { error } = await supabase
      .from('user_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    const latencyMs = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found — that's fine for a health check
      return { healthy: false, latencyMs, error: error.message, checkedAt };
    }

    return { healthy: true, latencyMs, checkedAt };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      healthy: false,
      latencyMs,
      error: err instanceof Error ? err.message : 'Unknown error',
      checkedAt,
    };
  }
}
