// lib/llm/timeout-wrapper.ts
export class LLMTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`LLM request timed out after ${timeoutMs}ms`);
    this.name = 'LLMTimeoutError';
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30_000,
  label = 'LLM call'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new LLMTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (err) {
    clearTimeout(timeoutId!);
    if (err instanceof LLMTimeoutError) {
      console.error(`[${label}] Timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}
