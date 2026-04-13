'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function useSessionReady(sessionId: string) {
  const [status, setStatus] = useState<'pending' | 'running' | 'complete' | 'failed'>('pending');
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to realtime updates on the session row
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      .subscribe();

    // Also do an immediate fetch in case it's already complete
    supabase
      .from('analysis_sessions')
      .select('status')
      .eq('id', sessionId)
      .single()
      .then(({ data }) => { if (data) setStatus(data.status); });

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  return {
    isReady: status === 'complete',
    isRunning: status === 'running' || status === 'pending',
    isFailed: status === 'failed',
    status,
  };
}
