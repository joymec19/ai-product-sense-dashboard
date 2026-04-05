import { Redis } from '@upstash/redis'
import type { LLMCache } from '../LLMService'

export class UpstashCache implements LLMCache {
  private redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  async get<T>(key: string): Promise<T | null> { return this.redis.get<T>(key) }
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, { ex: ttlSeconds })
  }
}
