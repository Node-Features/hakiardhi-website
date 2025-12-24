/**
 * QStash Service (Upstash)
 *
 * Provides QStash client for:
 * - Job queue management
 * - Webhook delivery with retries
 * - Background job processing
 */

import { Client, Receiver } from '@upstash/qstash';

export class QStashService {
  private client: Client;
  private receiver: Receiver;
  private webhookBaseUrl: string;

  constructor() {
    
    const qstashToken = process.env.QSTASH_TOKEN;
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
    this.webhookBaseUrl = process.env.QSTASH_WEBHOOK_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL || '';

    if (!qstashToken) {
      throw new Error('QSTASH_TOKEN environment variable is required');
    }

    if (!currentSigningKey || !nextSigningKey) {
      throw new Error('QStash signing keys are required for webhook verification');
    }

    this.client = new Client({ token: qstashToken });

    this.receiver = new Receiver({
      currentSigningKey,
      nextSigningKey,
    });
    
  }

  /**
   * Publish a job to QStash (unified method for all job types)
   */
  async publishJob(
    taskType: string,
    payload: {
      jobId: string;
      entityType: string;
      entityId: string;
      [key: string]: any;
    },
    options: {
      retries?: number;
      delaySeconds?: number;
    } = {}
    
  ): Promise<void> {
    const webhookUrl = `${this.webhookBaseUrl}/api/qstash/worker`;
    const { retries = 3, delaySeconds = 0 } = options;

    try {
      const jobPayload = {
        ...payload,
        taskType, // Add taskType to payload for dispatcher
      };

      await this.client.publishJSON({
        url: webhookUrl,
        body: jobPayload,
        retries,
        delay: delaySeconds,
      });

      console.log(`✅ ${taskType} job ${payload.jobId} published to QStash`);
    } catch (error) {
      console.error(`❌ Failed to publish ${taskType} job ${payload.jobId}:`, error);
      throw error;
    }
  }

  /**
   * Publish a batch of message jobs
   */
  async publishBatchMessageJobs(
    jobs: Array<{
      jobId: string;
      activityId: string;
      jobType: string;
      recipients: Array<any>;
    }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        await this.publishJob('message', {
          jobId: job.jobId,
          entityType: 'activity',
          entityId: job.activityId,
        });
        success++;
      } catch (error) {
        failed++;
        console.error(`Failed to publish job ${job.jobId}:`, error);
      }
    }

    return { success, failed };
  }

  /**
   * Verify QStash webhook signature
   * This ensures the webhook request is genuinely from QStash
   */
  async verifyWebhookSignature(
    signature: string,
    body: string
  ): Promise<boolean> {
    try {
      await this.receiver.verify({
        signature,
        body,
      });
      return true;
    } catch (error) {
      console.error('❌ QStash signature verification failed:', error);
      return false;
    }
  }

  /**
   * Verify webhook signature from request headers
   */
  async verifyWebhookRequest(
    headers: Headers,
    body: string
  ): Promise<{ valid: boolean; error?: string }> {
    const signature = headers.get('Upstash-Signature');

    if (!signature) {
      return {
        valid: false,
        error: 'Missing Upstash-Signature header',
      };
    }

    try {
      const isValid = await this.verifyWebhookSignature(signature, body);

      if (!isValid) {
        return {
          valid: false,
          error: 'Invalid signature',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Signature verification failed',
      };
    }
  }

  /**
   * Schedule a delayed job
   */
  async scheduleJob(
    webhookPath: string,
    payload: any,
    delaySeconds: number
  ): Promise<void> {
    const webhookUrl = `${this.webhookBaseUrl}${webhookPath}`;

    try {
      await this.client.publishJSON({
        url: webhookUrl,
        body: payload,
        delay: delaySeconds,
        retries: 2,
      });

      console.log(`✅ Scheduled job to ${webhookPath} with ${delaySeconds}s delay`);
    } catch (error) {
      console.error(`❌ Failed to schedule job:`, error);
      throw error;
    }
  }

  /**
   * Publish with custom retry configuration
   */
  async publishWithRetry(
    webhookPath: string,
    payload: any,
    options: {
      retries?: number;
      delaySeconds?: number;
      callback?: string;
    } = {}
  ): Promise<void> {
    const webhookUrl = `${this.webhookBaseUrl}${webhookPath}`;
    const { retries = 3, delaySeconds = 0, callback } = options;

    try {
      await this.client.publishJSON({
        url: webhookUrl,
        body: payload,
        retries,
        delay: delaySeconds,
        ...(callback && { callback: `${this.webhookBaseUrl}${callback}` }),
      });

      console.log(`✅ Published job to ${webhookPath}`);
    } catch (error) {
      console.error(`❌ Failed to publish job to ${webhookPath}:`, error);
      throw error;
    }
  }

  /**
   * Get message attempt number from headers
   * Useful for implementing exponential backoff
   */
  getAttemptNumber(headers: Headers): number {
    const retryCount = headers.get('Upstash-Retried');
    return retryCount ? parseInt(retryCount, 10) + 1 : 1;
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateBackoffDelay(attemptNumber: number, baseDelaySeconds: number = 60): number {
    // Exponential backoff: 60s, 300s (5min), 900s (15min)
    return baseDelaySeconds * Math.pow(5, attemptNumber - 1);
  }

  /**
   * Check if this is the final retry attempt
   */
  isFinalAttempt(headers: Headers, maxRetries: number = 3): boolean {
    const attemptNumber = this.getAttemptNumber(headers);
    return attemptNumber >= maxRetries;
  }

  /**
   * Get QStash request metadata from headers
   */
  getRequestMetadata(headers: Headers): {
    messageId: string | null;
    attemptNumber: number;
    publishedAt: string | null;
    scheduleId: string | null;
  } {
    return {
      messageId: headers.get('Upstash-Message-Id'),
      attemptNumber: this.getAttemptNumber(headers),
      publishedAt: headers.get('Upstash-Published-At'),
      scheduleId: headers.get('Upstash-Schedule-Id'),
    };
  }
}

// Export singleton instance
export const qstashService = new QStashService();
