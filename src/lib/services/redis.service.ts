/**
 * Redis Service (Upstash)
 *
 * Provides Redis client for:
 * - Job status caching
 * - Idempotency tracking
 * - Rate limiting
 * - Quick dashboard queries
 */

import { Redis } from '@upstash/redis';

export class RedisService {
  private client: Redis;

  constructor() {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      throw new Error('Missing Upstash Redis environment variables');
    }

    this.client = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }

  /**
   * Get the Redis client instance
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Cache job status in Redis with TTL (24 hours default)
   */
  async cacheJobStatus(
    jobType: 'message' | 'upload',
    jobId: string,
    status: {
      status: string;
      totalCount: number;
      successfulCount: number;
      failedCount: number;
      updatedAt: string;
    },
    ttlSeconds: number = 86400 // 24 hours
  ): Promise<void> {
    const key = `job:${jobType}:${jobId}:status`;
    await this.client.setex(key, ttlSeconds, JSON.stringify(status));
  }

  /**
   * Get cached job status from Redis
   */
  async getCachedJobStatus(
    jobType: 'message' | 'upload',
    jobId: string
  ): Promise<any | null> {
    const key = `job:${jobType}:${jobId}:status`;
    const data = await this.client.get(key);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  }

  /**
   * Track idempotency to prevent duplicate processing
   * Returns true if this is a duplicate (already processed)
   */
  async checkIdempotency(
    jobId: string,
    itemId: string,
    attempt: number,
    ttlSeconds: number = 3600 // 1 hour
  ): Promise<boolean> {
    const key = `idempotency:${jobId}:${itemId}:${attempt}`;

    // Try to set the key with NX (only if it doesn't exist)
    const result = await this.client.set(key, '1', { nx: true, ex: ttlSeconds });

    // If result is null, key already exists (duplicate)
    return result === null;
  }

  /**
   * Mark an item as processed (for idempotency)
   */
  async markAsProcessed(
    jobId: string,
    itemId: string,
    attempt: number,
    ttlSeconds: number = 3600
  ): Promise<void> {
    const key = `idempotency:${jobId}:${itemId}:${attempt}`;
    await this.client.setex(key, ttlSeconds, '1');
  }

  /**
   * Rate limiting: Check if user has exceeded rate limit
   * Returns true if rate limit exceeded
   */
  async checkRateLimit(
    userId: string,
    action: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${action}:${userId}`;

    const current = await this.client.incr(key);

    if (current === 1) {
      // First request, set expiry
      await this.client.expire(key, windowSeconds);
    }

    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);

    return { allowed, remaining };
  }

  /**
   * Store daily job statistics
   */
  async incrementDailyJobStats(
    date: string, // Format: YYYY-MM-DD
    jobType: 'message' | 'upload',
    status: 'success' | 'failed'
  ): Promise<void> {
    const key = `job:stats:daily:${date}`;
    const field = `${jobType}:${status}`;

    await this.client.hincrby(key, field, 1);

    // Set expiry to 90 days
    await this.client.expire(key, 90 * 86400);
  }

  /**
   * Get daily job statistics
   */
  async getDailyJobStats(date: string): Promise<Record<string, string>> {
    const key = `job:stats:daily:${date}`;
    return (await this.client.hgetall(key)) as Record<string, string>;
  }

  /**
   * Clear cache for a specific job
   */
  async clearJobCache(jobType: 'message' | 'upload', jobId: string): Promise<void> {
    const key = `job:${jobType}:${jobId}:status`;
    await this.client.del(key);
  }

  /**
   * Bulk cache multiple job statuses
   */
  async bulkCacheJobStatuses(
    jobs: Array<{
      jobType: 'message' | 'upload';
      jobId: string;
      status: any;
    }>,
    ttlSeconds: number = 86400
  ): Promise<void> {
    const pipeline = this.client.pipeline();

    jobs.forEach(({ jobType, jobId, status }) => {
      const key = `job:${jobType}:${jobId}:status`;
      pipeline.setex(key, ttlSeconds, JSON.stringify(status));
    });

    await pipeline.exec();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    messageJobsCached: number;
    uploadJobsCached: number;
    totalCached: number;
  }> {
    // Get count of job status cache keys
    const messageJobKeys = await this.client.keys('job:message:*:status');
    const uploadJobKeys = await this.client.keys('job:upload:*:status');

    return {
      messageJobsCached: messageJobKeys.length,
      uploadJobsCached: uploadJobKeys.length,
      totalCached: messageJobKeys.length + uploadJobKeys.length,
    };
  }

  // ============================================================================
  // Distributed Locking
  // ============================================================================

  /**
   * Acquire a distributed lock
   * Returns lock information if acquired, null otherwise
   */
  async acquireLock(
    lockKey: string,
    ttlSeconds: number,
    retries: number = 3,
    retryDelayMs: number = 100
  ): Promise<{ acquired: boolean; lockId: string | null }> {
    const lockId = crypto.randomUUID();
    const key = `lock:${lockKey}`;

    for (let i = 0; i < retries; i++) {
      try {
        // Try to acquire lock using SET NX (atomic operation)
        const result = await this.client.set(key, lockId, {
          nx: true,
          ex: ttlSeconds,
        });

        if (result !== null) {
          console.log(`🔒 Lock acquired: ${lockKey} (${lockId})`);
          return { acquired: true, lockId };
        }

        // Lock not acquired, wait before retry
        if (i < retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelayMs * (i + 1))
          );
        }
      } catch (error) {
        console.error(`Error acquiring lock ${lockKey}:`, error);
      }
    }

    console.log(`⚠️  Failed to acquire lock: ${lockKey}`);
    return { acquired: false, lockId: null };
  }

  /**
   * Release a distributed lock
   * Uses Lua script to ensure atomic check-and-delete
   */
  async releaseLock(lockKey: string, lockId: string): Promise<boolean> {
    const key = `lock:${lockKey}`;

    try {
      // Use Lua script for atomic check-and-delete
      // Only delete if the lock value matches (prevents releasing someone else's lock)
      const result = await this.client.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then
           return redis.call("del", KEYS[1])
         else
           return 0
         end`,
        [key],
        [lockId]
      );

      const released = result === 1;
      if (released) {
        console.log(`🔓 Lock released: ${lockKey} (${lockId})`);
      } else {
        console.warn(`⚠️  Lock release failed (lock not owned): ${lockKey}`);
      }

      return released;
    } catch (error) {
      console.error(`Error releasing lock ${lockKey}:`, error);
      return false;
    }
  }

  /**
   * Extend lock TTL (useful for long-running operations)
   */
  async extendLock(
    lockKey: string,
    lockId: string,
    ttlSeconds: number
  ): Promise<boolean> {
    const key = `lock:${lockKey}`;

    try {
      // Use Lua script to atomically check and extend
      const result = await this.client.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then
           return redis.call("expire", KEYS[1], ARGV[2])
         else
           return 0
         end`,
        [key],
        [lockId, ttlSeconds.toString()]
      );

      return result === 1;
    } catch (error) {
      console.error(`Error extending lock ${lockKey}:`, error);
      return false;
    }
  }

  /**
   * Check if a lock exists
   */
  async isLocked(lockKey: string): Promise<boolean> {
    const key = `lock:${lockKey}`;
    const value = await this.client.get(key);
    return value !== null;
  }

  // ============================================================================
  // Batch Idempotency Checking
  // ============================================================================

  /**
   * Batch check idempotency for multiple items
   * Returns array of booleans (true = duplicate, false = new)
   */
  async batchCheckIdempotency(
    checks: Array<{
      jobId: string;
      itemId: string;
      attempt: number;
    }>,
    ttlSeconds: number = 3600
  ): Promise<boolean[]> {
    const pipeline = this.client.pipeline();

    checks.forEach(({ jobId, itemId, attempt }) => {
      const key = `idempotency:${jobId}:${itemId}:${attempt}`;
      pipeline.set(key, '1', { nx: true, ex: ttlSeconds });
    });

    const results = await pipeline.exec();

    // Convert results to boolean array (null = duplicate)
    return results.map((result) => result === null);
  }

  // ============================================================================
  // Enhanced Cache Operations with Retry
  // ============================================================================

  /**
   * Cache job status with automatic retry on failure
   */
  async cacheJobStatusWithRetry(
    jobType: 'message' | 'upload',
    jobId: string,
    status: {
      status: string;
      totalCount: number;
      successfulCount: number;
      failedCount: number;
      updatedAt: string;
    },
    ttlSeconds: number = 86400,
    maxRetries: number = 3
  ): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.cacheJobStatus(jobType, jobId, status, ttlSeconds);
        return true;
      } catch (error) {
        console.error(`Cache retry ${i + 1}/${maxRetries} failed:`, error);
        if (i === maxRetries - 1) {
          // Final retry failed, clear cache to prevent serving stale data
          await this.clearJobCache(jobType, jobId).catch(() => {});
          return false;
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
      }
    }
    return false;
  }
}

// Export singleton instance
export const redisService = new RedisService();
