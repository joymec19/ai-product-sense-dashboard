import { z, ZodSchema } from 'zod'

export type LLMErrorKind = 'rate_limit' | 'malformed_json' | 'validation' | 'timeout' | 'upstream' | 'unknown'

export class LLMError extends Error {
  constructor(public kind: LLMErrorKind, message: string, public raw?: string) {
    super(message)
    this.name = 'LLMError'
  }
}

function classifyError(err: unknown): LLMError {
  if (err instanceof LLMError) return err
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('rate limit') || msg.includes('429')) return new LLMError('rate_limit', msg)
  if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) return new LLMError('timeout', msg)
  if (msg.includes('JSON') || msg.includes('parse')) return new LLMError('malformed_json', msg)
  return new LLMError('unknown', msg)
}

export interface LLMCache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
}

export class MemoryCache implements LLMCache {
  private store = new Map<string, { value: unknown; expires: number }>()
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.expires) return null
    return entry.value as T
  }
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 })
  }
}

export interface LLMCallOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  retries?: number
  cacheTtlSeconds?: number
  cacheKey?: string
}

const DEFAULT_OPTIONS: Required<Omit<LLMCallOptions, 'cacheKey'>> = {
  model: 'sarvam-m',
  temperature: 0.2,
  maxTokens: 4096,
  retries: 3,
  cacheTtlSeconds: 3600,
}

const SARVAM_URL = 'https://api.sarvam.ai/v1/chat/completions'
const MAX_TOKENS_HARD_CAP = 7500

/** Extract the first JSON object from a Sarvam response (which may include prose or <think> blocks). */
function extractJson(raw: string): string {
  // Strip <think>...</think> blocks
  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  // Prefer fenced JSON code block
  const fenced = stripped.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced?.[1]) return fenced[1].trim()

  // Fall back: find outermost { ... }
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start !== -1 && end > start) return stripped.slice(start, end + 1)

  throw new LLMError('malformed_json', 'No JSON object found in response', raw)
}

export class LLMService {
  private cache: LLMCache

  constructor(private apiKey: string, cache?: LLMCache) {
    this.cache = cache ?? new MemoryCache()
  }

  async call<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodSchema<T>,
    options: LLMCallOptions = {}
  ): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    opts.maxTokens = Math.min(opts.maxTokens, MAX_TOKENS_HARD_CAP)

    if (opts.cacheKey) {
      const cached = await this.cache.get<T>(opts.cacheKey)
      if (cached !== null) return cached
    }

    let lastError: LLMError = new LLMError('unknown', 'No attempts made')

    for (let attempt = 0; attempt <= opts.retries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000)
        await new Promise(res => setTimeout(res, delay))
      }
      try {
        const res = await fetch(SARVAM_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': this.apiKey,
          },
          body: JSON.stringify({
            model: opts.model,
            temperature: opts.temperature,
            max_tokens: opts.maxTokens,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
          }),
        })

        if (res.status === 429) throw new LLMError('rate_limit', 'Sarvam rate limit hit')
        if (!res.ok) {
          const body = await res.text()
          throw new LLMError('upstream', `Sarvam returned ${res.status}: ${body}`)
        }

        const data = await res.json()
        const raw = data.choices?.[0]?.message?.content as string | undefined
        if (!raw) throw new LLMError('malformed_json', 'Empty response from Sarvam')

        let parsed: unknown
        try { parsed = JSON.parse(extractJson(raw)) }
        catch (e) {
          throw new LLMError('malformed_json', `JSON parse failed: ${e instanceof Error ? e.message : e}`, raw)
        }

        const result = schema.safeParse(parsed)
        if (!result.success) {
          throw new LLMError('validation', `Schema validation failed: ${result.error.message}`, raw)
        }

        if (opts.cacheKey) {
          await this.cache.set(opts.cacheKey, result.data, opts.cacheTtlSeconds)
        }
        return result.data

      } catch (err) {
        lastError = classifyError(err)
        if (lastError.kind === 'rate_limit' && attempt < opts.retries) continue
        if (lastError.kind === 'malformed_json' || lastError.kind === 'validation') throw lastError
      }
    }
    throw lastError
  }
}

let _llmService: LLMService | null = null
export function getLLMService(): LLMService {
  if (!_llmService) {
    const key = process.env.SARVAM_API_KEY
    if (!key) throw new Error('SARVAM_API_KEY is not set')
    const { buildCache } = require('./llm/cache') as typeof import('./llm/cache')
    _llmService = new LLMService(key, buildCache())
  }
  return _llmService
}
