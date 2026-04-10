// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // LLM Providers
  SARVAM_API_KEY: z.string().min(1, 'Sarvam API key is required'),
  SARVAM_API_URL: z.string().url().default('https://api.sarvam.ai/v1'),

  // Search / Web Grounding
  TAVILY_API_KEY: z.string().min(1, 'Tavily API key required for competitive intel'),
  SERPER_API_KEY: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('Must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 chars'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Rate limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Vercel (auto-injected)
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ❌ ${key}: ${msgs?.join(', ')}`)
      .join('\n');

    throw new Error(
      `\n🚨 Invalid environment variables:\n${formatted}\n\n` +
      `Copy .env.example to .env.local and fill in all required values.`
    );
  }

  return parsed.data;
}

// Singleton — validated once at module load, throws at startup if invalid
export const env = validateEnv();

// Type-safe individual accessors
export const isProduction = env.NODE_ENV === 'production';
export const isVercelPreview = env.VERCEL_ENV === 'preview';
export const appUrl = env.NEXT_PUBLIC_APP_URL;
