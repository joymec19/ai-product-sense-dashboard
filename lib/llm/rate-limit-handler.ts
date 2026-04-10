// lib/llm/rate-limit-handler.ts

export interface LLMRateLimitInfo {
  retryAfterMs: number;
  provider: string;
}

export class LLMRateLimitError extends Error {
  public readonly retryAfterMs: number;
  public readonly provider: string;

  constructor(info: LLMRateLimitInfo) {
    super(`${info.provider} rate limit exceeded. Retry after ${info.retryAfterMs}ms`);
    this.name = 'LLMRateLimitError';
    this.retryAfterMs = info.retryAfterMs;
    this.provider = info.provider;
  }
}

/**
 * Parses rate limit errors from LLM provider HTTP responses.
 * Returns an LLMRateLimitError with the correct retry delay.
 */
export function parseLLMRateLimitError(
  response: Response,
  provider: 'sarvam' | 'openai' | 'anthropic'
): LLMRateLimitError | null {
  if (response.status !== 429) return null;

  const retryAfterHeader = response.headers.get('retry-after');
  const retryAfterMs = retryAfterHeader
    ? parseInt(retryAfterHeader, 10) * 1000
    : 60_000; // default: 1 minute

  return new LLMRateLimitError({ retryAfterMs, provider });
}

/**
 * Exponential backoff wrapper for LLM calls.
 * Retries on 429/503 with proper back-off.
 */
export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    label?: string;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1_000, label = 'LLM' } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err instanceof LLMRateLimitError;
      const isLastAttempt = attempt === maxRetries - 1;

      if (isLastAttempt || !isRateLimit) throw err;

      const delay = isRateLimit
        ? err.retryAfterMs
        : baseDelayMs * Math.pow(2, attempt); // exponential backoff for non-429 errors

      console.warn(`[${label}] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // TypeScript exhaustive — unreachable
  throw new Error('Unexpected exit from retry loop');
}

/**
 * Generates a user-facing error payload from an LLMRateLimitError.
 * Use this in API route handlers to return structured 429 responses.
 */
export function buildRateLimitResponse(err: LLMRateLimitError) {
  const retryAfterSecs = Math.ceil(err.retryAfterMs / 1000);
  return {
    error: 'AI service is busy',
    code: 'LLM_RATE_LIMIT',
    message: `Our AI provider is temporarily rate-limited. Please try again in ${retryAfterSecs} seconds.`,
    retryAfter: retryAfterSecs,
    provider: err.provider,
  };
}
