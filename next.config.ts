// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Strict output ──────────────────────────────────────────
  output: 'standalone', // Required for Vercel serverless + Docker

  // ── TypeScript ─────────────────────────────────────────────
  // NOTE: 'eslint' key was removed from NextConfig in Next.js 15.
  // ESLint is now controlled via eslint.config.mjs / .eslintrc only.
  typescript: { ignoreBuildErrors: false },

  // ── Security headers ───────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs unsafe-eval
              "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
              "font-src 'self' https://api.fontshare.com",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} https://api.sarvam.ai https://api.tavily.com`,
              "img-src 'self' data: blob: https:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // ── Image domains ──────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
    ],
  },

  // ── Logging ────────────────────────────────────────────────
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === 'development' },
  },
};

export default nextConfig;
