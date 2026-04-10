// lib/supabase/client.ts
// Use ONLY in Client Components ('use client')
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  // NEXT_PUBLIC_ vars are inlined at build time — safe to access directly here
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** @deprecated Use createSupabaseBrowserClient() */
export const createClient = createSupabaseBrowserClient;
