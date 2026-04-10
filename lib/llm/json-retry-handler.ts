// lib/llm/json-retry-handler.ts
import { z, ZodSchema } from 'zod';

export class LLMParseError extends Error {
  constructor(
    public readonly rawContent: string,
    public readonly parseError: unknown
  ) {
    super('LLM returned unparseable JSON');
    this.name = 'LLMParseError';
  }
}

type LLMCallFn<T> = () => Promise<string>; // Returns raw LLM text output

/**
 * Calls an LLM, parses the JSON response, and retries up to `maxRetries`
 * times with a repair prompt if JSON parsing fails.
 */
export async function withJsonRetry<T>(
  schema: ZodSchema<T>,
  llmCall: LLMCallFn<T>,
  repairCall: (badJson: string, parseError: string) => Promise<string>,
  options: { maxRetries?: number; label?: string } = {}
): Promise<T> {
  const { maxRetries = 2, label = 'LLM JSON' } = options;
  let lastError: unknown;
  let rawContent = '';

  // Attempt initial call + retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt === 0) {
        rawContent = await llmCall();
      } else {
        // Repair attempt: ask LLM to fix its own bad JSON
        const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
        console.warn(`[${label}] Repair attempt ${attempt}/${maxRetries}: ${errorMsg}`);
        rawContent = await repairCall(rawContent, errorMsg);
      }

      // Strip markdown code fences if present
      const cleaned = rawContent
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      const validated = schema.safeParse(parsed);

      if (!validated.success) {
        const zodError = validated.error.flatten();
        throw new Error(`Schema validation failed: ${JSON.stringify(zodError.fieldErrors)}`);
      }

      return validated.data;
    } catch (err) {
      lastError = err;
    }
  }

  throw new LLMParseError(rawContent, lastError);
}

/** Extracts the first JSON object/array from a mixed text response */
export function extractJsonFromText(text: string): string {
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  const captured = jsonMatch?.[1];
  if (!captured) throw new Error('No JSON found in LLM response');
  return captured;
}
