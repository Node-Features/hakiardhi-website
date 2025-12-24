/**
 * Metrics and Monitoring Utility
 *
 * Provides comprehensive metrics collection for job processing
 */

import { redisService } from '@/lib/services/redis.service';

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricOptions {
  labels?: Record<string, string>;
  timestamp?: number;
}

/**
 * Job Metrics Collector
 */
export class JobMetrics {
  private static instance: JobMetrics;

  private constructor() {}

  static getInstance(): JobMetrics {
    if (!JobMetrics.instance) {
      JobMetrics.instance = new JobMetrics();
    }
    return JobMetrics.instance;
  }

  /**
   * Record job duration
   */
  async recordJobDuration(
    jobType: 'message' | 'upload',
    duration: number,
    success: boolean
  ): Promise<void> {
    const date = this.getDateKey();
    const key = `metrics:job_duration:${jobType}:${date}`;

    try {
      // Store in sorted set with timestamp as score
      await redisService.getClient().zadd(key, {
        score: Date.now(),
        member: JSON.stringify({ duration, success }),
      });

      // Set 30-day expiry
      await redisService.getClient().expire(key, 30 * 86400);
    } catch (error) {
      console.error('Failed to record job duration:', error);
    }
  }

  /**
   * Record job failure
   */
  async recordJobFailure(
    jobType: 'message' | 'upload',
    errorType: string,
    errorMessage?: string
  ): Promise<void> {
    const date = this.getDateKey();
    const key = `metrics:job_failures:${jobType}:${date}`;

    try {
      await redisService.getClient().hincrby(key, errorType, 1);

      // Store error details
      if (errorMessage) {
        const errorsKey = `metrics:job_errors:${jobType}:${date}`;
        await redisService.getClient().lpush(
          errorsKey,
          JSON.stringify({
            errorType,
            message: errorMessage,
            timestamp: Date.now(),
          })
        );
        // Keep last 100 errors
        await redisService.getClient().ltrim(errorsKey, 0, 99);
      }

      // Set 30-day expiry
      await redisService.getClient().expire(key, 30 * 86400);
    } catch (error) {
      console.error('Failed to record job failure:', error);
    }
  }

  /**
   * Record item processing time
   */
  async recordItemProcessingTime(
    jobType: 'message' | 'upload',
    itemId: string,
    duration: number
  ): Promise<void> {
    const key = `metrics:item_duration:${jobType}`;

    try {
      await redisService.getClient().zadd(key, {
        score: duration,
        member: `${itemId}:${Date.now()}`,
      });

      // Keep only last 1000 items
      await redisService.getClient().zremrangebyrank(key, 0, -1001);
    } catch (error) {
      console.error('Failed to record item processing time:', error);
    }
  }

  /**
   * Increment concurrent job counter
   */
  async incrementConcurrentJobs(jobType: 'message' | 'upload'): Promise<number> {
    const key = `metrics:concurrent_jobs:${jobType}`;
    try {
      const count = await redisService.getClient().incr(key);

      // Record peak concurrent jobs
      const peakKey = `metrics:peak_concurrent:${jobType}`;
      const peak = (await redisService.getClient().get(peakKey)) as number | null;

      if (!peak || count > peak) {
        await redisService.getClient().set(peakKey, count);
      }

      return count;
    } catch (error) {
      console.error('Failed to increment concurrent jobs:', error);
      return 0;
    }
  }

  /**
   * Decrement concurrent job counter
   */
  async decrementConcurrentJobs(jobType: 'message' | 'upload'): Promise<number> {
    const key = `metrics:concurrent_jobs:${jobType}`;
    try {
      const count = await redisService.getClient().decr(key);
      return Math.max(0, count);
    } catch (error) {
      console.error('Failed to decrement concurrent jobs:', error);
      return 0;
    }
  }

  /**
   * Get average job duration
   */
  async getAverageJobDuration(
    jobType: 'message' | 'upload',
    days: number = 1
  ): Promise<number> {
    try {
      const durations: number[] = [];

      for (let i = 0; i < days; i++) {
        const date = this.getDateKey(i);
        const key = `metrics:job_duration:${jobType}:${date}`;

        const entries = await redisService.getClient().zrange(key, 0, -1);

        entries.forEach((entry) => {
          try {
            const data = JSON.parse(entry as string);
            if (data.success) {
              durations.push(data.duration);
            }
          } catch (e) {
            // Skip invalid entries
          }
        });
      }

      if (durations.length === 0) return 0;

      const sum = durations.reduce((acc, d) => acc + d, 0);
      return sum / durations.length;
    } catch (error) {
      console.error('Failed to get average job duration:', error);
      return 0;
    }
  }

  /**
   * Get failure statistics
   */
  async getFailureStats(
    jobType: 'message' | 'upload',
    days: number = 1
  ): Promise<Record<string, number>> {
    try {
      const stats: Record<string, number> = {};

      for (let i = 0; i < days; i++) {
        const date = this.getDateKey(i);
        const key = `metrics:job_failures:${jobType}:${date}`;

        const dayStats = (await redisService
          .getClient()
          .hgetall(key)) as Record<string, string>;

        Object.entries(dayStats).forEach(([errorType, count]) => {
          stats[errorType] = (stats[errorType] || 0) + parseInt(count, 10);
        });
      }

      return stats;
    } catch (error) {
      console.error('Failed to get failure stats:', error);
      return {};
    }
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(
    jobType: 'message' | 'upload',
    limit: number = 10
  ): Promise<Array<{ errorType: string; message: string; timestamp: number }>> {
    try {
      const date = this.getDateKey();
      const key = `metrics:job_errors:${jobType}:${date}`;

      const errors = await redisService.getClient().lrange(key, 0, limit - 1);

      return errors.map((error) => {
        try {
          return JSON.parse(error as string);
        } catch (e) {
          return {
            errorType: 'unknown',
            message: String(error),
            timestamp: Date.now(),
          };
        }
      });
    } catch (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }
  }

  /**
   * Get current concurrent jobs
   */
  async getConcurrentJobs(): Promise<{
    message: number;
    upload: number;
    total: number;
  }> {
    try {
      const [messageCount, uploadCount] = await Promise.all([
        redisService.getClient().get('metrics:concurrent_jobs:message'),
        redisService.getClient().get('metrics:concurrent_jobs:upload'),
      ]);

      const message = (messageCount as number) || 0;
      const upload = (uploadCount as number) || 0;

      return {
        message,
        upload,
        total: message + upload,
      };
    } catch (error) {
      console.error('Failed to get concurrent jobs:', error);
      return { message: 0, upload: 0, total: 0 };
    }
  }

  /**
   * Get peak concurrent jobs
   */
  async getPeakConcurrentJobs(): Promise<{
    message: number;
    upload: number;
  }> {
    try {
      const [messagePeak, uploadPeak] = await Promise.all([
        redisService.getClient().get('metrics:peak_concurrent:message'),
        redisService.getClient().get('metrics:peak_concurrent:upload'),
      ]);

      return {
        message: (messagePeak as number) || 0,
        upload: (uploadPeak as number) || 0,
      };
    } catch (error) {
      console.error('Failed to get peak concurrent jobs:', error);
      return { message: 0, upload: 0 };
    }
  }

  /**
   * Get comprehensive metrics summary
   */
  async getMetricsSummary(days: number = 1): Promise<{
    message: MetricsSummary;
    upload: MetricsSummary;
  }> {
    const [messageStats, uploadStats] = await Promise.all([
      this.getJobTypeMetrics('message', days),
      this.getJobTypeMetrics('upload', days),
    ]);

    return {
      message: messageStats,
      upload: uploadStats,
    };
  }

  private async getJobTypeMetrics(
    jobType: 'message' | 'upload',
    days: number
  ): Promise<MetricsSummary> {
    const [avgDuration, failures, concurrent, peak] = await Promise.all([
      this.getAverageJobDuration(jobType, days),
      this.getFailureStats(jobType, days),
      redisService
        .getClient()
        .get(`metrics:concurrent_jobs:${jobType}`)
        .then((v) => (v as number) || 0),
      redisService
        .getClient()
        .get(`metrics:peak_concurrent:${jobType}`)
        .then((v) => (v as number) || 0),
    ]);

    const totalFailures = Object.values(failures).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      avgDuration,
      failures,
      totalFailures,
      concurrent,
      peak,
    };
  }

  /**
   * Reset metrics (use with caution)
   */
  async resetMetrics(jobType?: 'message' | 'upload'): Promise<void> {
    try {
      const pattern = jobType ? `metrics:*:${jobType}:*` : 'metrics:*';
      const keys = await redisService.getClient().keys(pattern);

      if (keys.length > 0) {
        await redisService.getClient().del(...keys);
      }

      console.log(`Reset ${keys.length} metric keys`);
    } catch (error) {
      console.error('Failed to reset metrics:', error);
    }
  }

  private getDateKey(daysAgo: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

export interface MetricsSummary {
  avgDuration: number;
  failures: Record<string, number>;
  totalFailures: number;
  concurrent: number;
  peak: number;
}

// Export singleton instance
export const jobMetrics = JobMetrics.getInstance();

/**
 * Performance Timer
 * Utility class for measuring execution time
 */
export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number> = new Map();

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Mark a point in time
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * Get duration from start
   */
  getDuration(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Get duration between two marks
   */
  measure(startMark: string, endMark: string): number {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (!start || !end) {
      throw new Error(`Mark not found: ${!start ? startMark : endMark}`);
    }

    return end - start;
  }

  /**
   * Get all marks
   */
  getMarks(): Record<string, number> {
    const marks: Record<string, number> = {};
    this.marks.forEach((time, name) => {
      marks[name] = time - this.startTime;
    });
    return marks;
  }
}
