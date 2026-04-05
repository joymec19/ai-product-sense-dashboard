import { MemoryCache } from '../LLMService'
import type { LLMCache } from '../LLMService'

export function buildCache(): LLMCache {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { UpstashCache } = require('./UpstashCache')
    return new UpstashCache()
  }
  return new MemoryCache()
}
