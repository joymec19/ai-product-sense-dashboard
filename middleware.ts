// middleware.ts (root of project, next to app/)
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ─── Rate limit config (in-memory fallback if Redis not configured) ───────────
type RateLimitConfig = { requests: number; windowMs: number };

const DEFAULT_RATE_LIMIT: RateLimitConfig = { requests: 100, windowMs: 60_000 };

const ROUTE_RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/analyze':          { requests: 10,  windowMs: 60_000 },  // 10/min
  '/api/competitive':      { requests: 20,  windowMs: 60_000 },
  '/api/market':           { requests: 20,  windowMs: 60_000 },
  '/api/gtm':              { requests: 10,  windowMs: 60_000 },
  '/api/prd':              { requests: 15,  windowMs: 60_000 },
  '/api/ai-assistant':     { requests: 30,  windowMs: 60_000 },
};

// In-memory fallback store (per-instance — fine for development; use Redis in prod)
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(
  key: string,
  limit: { requests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + limit.windowMs;
    inMemoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit.requests - 1, resetAt };
  }

  if (entry.count >= limit.requests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit.requests - entry.count, resetAt: entry.resetAt };
}

// ─── Protected routes (require auth) ─────────────────────────────────────────
const PROTECTED_API_PREFIXES = [
  '/api/analyze',
  '/api/competitive',
  '/api/market',
  '/api/gtm',
  '/api/prd',
  '/api/ai-assistant',
  '/api/session',
  '/api/user',
];

const PROTECTED_PAGE_PREFIXES = [
  '/dashboard',
  '/analysis',
  '/settings',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(p => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PREFIXES.some(p => pathname.startsWith(p));

  // ── 1. CORS headers for API routes ──────────────────────────────────────────
  if (isApiRoute) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL ?? '',
      'https://ai-product-sense.vercel.app',
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(JSON.stringify({ error: 'CORS: Origin not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ── 2. Auth check ────────────────────────────────────────────────────────────
  if (isProtectedApi || isProtectedPage) {
    const response = NextResponse.next({
      request: { headers: request.headers },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ── 3. Rate limiting (per user ID for authenticated routes) ───────────────
    const limitConfig: RateLimitConfig = ROUTE_RATE_LIMITS[pathname] ?? DEFAULT_RATE_LIMIT;
    const rateLimitKey = `rl:${user.id}:${pathname}`;
    const { allowed, remaining, resetAt } = inMemoryRateLimit(rateLimitKey, limitConfig);

    if (!allowed) {
      const retryAfterSecs = Math.ceil((resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: retryAfterSecs,
          message: `Too many requests. Try again in ${retryAfterSecs} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSecs),
            'X-RateLimit-Limit': String(limitConfig.requests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
          },
        }
      );
    }

    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/analysis/:path*',
    '/settings/:path*',
  ],
};
