/**
 * Newsletter Service
 * Automated newsletter sending using Bird + QStash + Redis
 * Handles monthly newsletters, campaign updates, and subscriber management
 */

import { birdService } from './bird.service';
import { qstashService } from './qstash.service';
import { redisService } from './redis.service';
import { supabase } from '@/lib/database/supabase_client';
// import { generateMonthlyNewsletter, type NewsletterData } from '@/lib/templates/email/newsletter';

// Initialize Supabase client with service role
const db = supabase(true);

// Get Redis client for direct operations
const redis = redisService.getClient();

// Temporary NewsletterData type until email template is created
export interface NewsletterData {
  month: string;
  year: number;
  subscriberName?: string;
  featuredStory?: {
    title: string;
    summary: string;
    imageUrl?: string;
    readMoreUrl?: string;
  };
  monthlyStats?: {
    casesHandled?: number;
    peopleTrained?: number;
    communitiesReached?: number;
  };
  [key: string]: any;
}

export interface NewsletterSchedule {
  dayOfMonth: number; // 1-31
  hour: number; // 0-23 (UTC)
  enabled: boolean;
}

export interface NewsletterJob {
  id: string;
  newsletterType: 'monthly' | 'campaign_update' | 'special';
  scheduledFor: Date;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  subscriberCount?: number;
  sentCount?: number;
  failedCount?: number;
}

class NewsletterService {
  private readonly CACHE_PREFIX = 'newsletter';
  private readonly JOB_PREFIX = 'newsletter:job';

  /**
   * Schedule monthly newsletter (runs via cron)
   * This should be called by a scheduled cron job
   */
  async scheduleMonthlyNewsletter(data: NewsletterData): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      // Create job ID
      const jobId = `monthly_${data.month}_${data.year}`;

      // Check if already scheduled
      const existing = await redis.get(`${this.JOB_PREFIX}:${jobId}`);
      if (existing) {
        return {
          success: false,
          error: 'Newsletter for this month is already scheduled',
        };
      }

      // Get active subscribers
      const { data: subscribers, error: subsError } = await db
        .from('newsletter_subscriptions')
        .select('id, email, name')
        .eq('status', 'active');

      if (subsError || !subscribers || subscribers.length === 0) {
        return {
          success: false,
          error: 'No active subscribers found',
        };
      }

      // Create job record
      const job: NewsletterJob = {
        id: jobId,
        newsletterType: 'monthly',
        scheduledFor: new Date(),
        status: 'scheduled',
      };

      // Cache job
      await redis.setex(`${this.JOB_PREFIX}:${jobId}`, 86400, JSON.stringify(job)); // 24 hours

      // Queue email sending via QStash
      await qstashService.publishJob('send_newsletter', {
        jobId,
        entityType: 'newsletter_job',
        entityId: jobId,
        newsletterData: data,
        subscriberIds: subscribers.map(s => s.id),
      });

      return {
        success: true,
        jobId,
      };

    } catch (error) {
      console.error('[NewsletterService] Schedule error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process newsletter sending (called by QStash worker)
   */
  async processNewsletterJob(jobId: string, newsletterData: NewsletterData, subscriberIds: string[]): Promise<void> {
    try {
      // Update job status
      await this.updateJobStatus(jobId, 'processing');

      // Fetch subscribers with details
      const { data: subscribers, error } = await db
        .from('newsletter_subscriptions')
        .select('id, email, name')
        .in('id', subscriberIds);

      if (error || !subscribers) {
        throw new Error('Failed to fetch subscribers');
      }

      let sentCount = 0;
      let failedCount = 0;

      // Process in batches of 50
      const batchSize = 50;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);

        // Check rate limit
        const canProceed = await this.checkDailyLimit();
        if (!canProceed) {
          console.warn('[NewsletterService] Daily email limit reached');
          break;
        }

        // Send batch
        const results = await Promise.allSettled(
          batch.map(subscriber =>
            this.sendNewsletterEmail(subscriber.email, subscriber.name || undefined, newsletterData)
          )
        );

        // Count results
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        });

        // Delay between batches (rate limiting)
        if (i + batchSize < subscribers.length) {
          await this.delay(2000); // 2 seconds
        }
      }

      // Update job with final counts
      await this.updateJobStatus(jobId, 'completed', sentCount, failedCount);

      // Track analytics
      await this.trackNewsletterSent(jobId, sentCount, failedCount);

    } catch (error) {
      console.error('[NewsletterService] Processing error:', error);
      await this.updateJobStatus(jobId, 'failed');
      throw error;
    }
  }

  /**
   * Send newsletter email to single subscriber
   */
  private async sendNewsletterEmail(
    email: string,
    name: string | undefined,
    data: NewsletterData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if already sent (idempotency)
      const cacheKey = `${this.CACHE_PREFIX}:sent:${data.month}_${data.year}:${email}`;
      const alreadySent = await redis.get(cacheKey);

      if (alreadySent) {
        return { success: true }; // Skip duplicate
      }

      // Generate HTML (using temporary simple template)
      const html = this.generateNewsletterHTML(data, name);

      // Send via Bird
      const result = await birdService.sendEmail(
        email,
        `HakiArdhi ${data.month} ${data.year} Newsletter`,
        html
      );

      if (result.success) {
        // Mark as sent (cache for 60 days)
        await redis.setex(cacheKey, 5184000, '1');
      }

      return result;

    } catch (error) {
      console.error('[NewsletterService] Send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Subscribe user to newsletter
   */
  async subscribe(email: string, name?: string, source: string = 'website'): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if already subscribed
      const { data: existing } = await db
        .from('newsletter_subscriptions')
        .select('id, status')
        .eq('email', email)
        .single();

      if (existing) {
        if (existing.status === 'active') {
          return { success: false, error: 'Already subscribed' };
        } else {
          // Reactivate subscription
          const { error: updateError } = await db
            .from('newsletter_subscriptions')
            .update({
              status: 'active',
              subscribed_at: new Date().toISOString(),
              unsubscribed_at: null,
            })
            .eq('id', existing.id);

          if (updateError) throw updateError;

          return { success: true };
        }
      }

      // Create new subscription
      const { error: insertError } = await db
        .from('newsletter_subscriptions')
        .insert({
          email,
          name,
          source,
          status: 'active',
          subscribed_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Send welcome email
      await this.sendWelcomeEmail(email, name);

      return { success: true };

    } catch (error) {
      console.error('[NewsletterService] Subscribe error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe',
      };
    }
  }

  /**
   * Unsubscribe user from newsletter
   */
  async unsubscribe(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await db
        .from('newsletter_subscriptions')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', email);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('[NewsletterService] Unsubscribe error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe',
      };
    }
  }

  /**
   * Send welcome email to new subscriber
   */
  private async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; padding: 20px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
            <h1 style="color: #D62828;">Welcome to HakiArdhi Newsletter!</h1>
            <p>Dear ${name || 'Friend'},</p>
            <p>Thank you for subscribing to the HakiArdhi newsletter. You'll now receive monthly updates about our work defending land rights across Tanzania.</p>
            <p>You can expect:</p>
            <ul>
              <li>Stories from communities we serve</li>
              <li>Updates on ongoing campaigns</li>
              <li>Invitations to events and training</li>
              <li>Latest research and resources</li>
            </ul>
            <p>Best regards,<br>The HakiArdhi Team</p>
          </div>
        </body>
        </html>
      `;

      await birdService.sendEmail(email, 'Welcome to HakiArdhi Newsletter', html);

    } catch (error) {
      console.error('[NewsletterService] Welcome email error:', error);
    }
  }

  /**
   * Update job status in cache
   */
  private async updateJobStatus(
    jobId: string,
    status: NewsletterJob['status'],
    sentCount?: number,
    failedCount?: number
  ): Promise<void> {
    try {
      const cached = await redis.get(`${this.JOB_PREFIX}:${jobId}`);
      if (!cached) return;

      const job: NewsletterJob = typeof cached === 'string' ? JSON.parse(cached) : cached;
      job.status = status;

      if (sentCount !== undefined) job.sentCount = sentCount;
      if (failedCount !== undefined) job.failedCount = failedCount;

      await redis.setex(`${this.JOB_PREFIX}:${jobId}`, 86400, JSON.stringify(job));

    } catch (error) {
      console.error('[NewsletterService] Status update error:', error);
    }
  }

  /**
   * Check daily email sending limit
   */
  private async checkDailyLimit(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `${this.CACHE_PREFIX}:daily:${today}`;

      const count = await redis.incr(key);

      if (count === 1) {
        // Set expiry to end of day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const ttl = Math.floor((tomorrow.getTime() - Date.now()) / 1000);
        await redis.expire(key, ttl);
      }

      // Limit: 10,000 emails per day
      return count <= 10000;

    } catch (error) {
      console.error('[NewsletterService] Limit check error:', error);
      return true; // Allow on error
    }
  }

  /**
   * Track newsletter analytics
   */
  private async trackNewsletterSent(jobId: string, sentCount: number, failedCount: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `${this.CACHE_PREFIX}:stats:${today}`;

      await redis.hincrby(key, 'newsletters_sent', 1);
      await redis.hincrby(key, 'emails_sent', sentCount);
      await redis.hincrby(key, 'emails_failed', failedCount);

      // 90 day retention
      await redis.expire(key, 7776000);

    } catch (error) {
      console.error('[NewsletterService] Analytics error:', error);
    }
  }

  /**
   * Get newsletter statistics
   */
  async getStatistics(date?: string): Promise<{
    newslettersSent: number;
    emailsSent: number;
    emailsFailed: number;
  }> {
    try {
      const dateKey = date || new Date().toISOString().split('T')[0];
      const key = `${this.CACHE_PREFIX}:stats:${dateKey}`;

      // upstash redis client uses lowercase hgetall
      const stats = (await redis.hgetall(key)) as Record<string, string> | null;
      const s = stats || {};

      return {
        newslettersSent: parseInt(s.newsletters_sent || '0'),
        emailsSent: parseInt(s.emails_sent || '0'),
        emailsFailed: parseInt(s.emails_failed || '0'),
      };

    } catch (error) {
      console.error('[NewsletterService] Stats retrieval error:', error);
      return {
        newslettersSent: 0,
        emailsSent: 0,
        emailsFailed: 0,
      };
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate newsletter HTML (temporary simple template)
   * TODO: Replace with generateMonthlyNewsletter from @/lib/templates/email/newsletter
   */
  private generateNewsletterHTML(data: NewsletterData, name?: string): string {
    const subscriberName = name || data.subscriberName || 'Friend';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HakiArdhi ${data.month} ${data.year} Newsletter</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #D62828; margin: 0; font-size: 28px;">HakiArdhi</h1>
            <p style="color: #667085; margin: 10px 0 0 0;">${data.month} ${data.year} Newsletter</p>
          </div>

          <!-- Greeting -->
          <p style="color: #344054; font-size: 16px; line-height: 1.6;">
            Dear ${subscriberName},
          </p>

          <!-- Featured Story -->
          ${data.featuredStory ? `
          <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-left: 4px solid #D62828;">
            <h2 style="color: #000; margin: 0 0 10px 0; font-size: 20px;">${data.featuredStory.title}</h2>
            <p style="color: #667085; margin: 0; line-height: 1.6;">${data.featuredStory.summary}</p>
            ${data.featuredStory.readMoreUrl ? `
            <a href="${data.featuredStory.readMoreUrl}" style="display: inline-block; margin-top: 15px; color: #D62828; text-decoration: none; font-weight: 600;">
              Read More →
            </a>
            ` : ''}
          </div>
          ` : ''}

          <!-- Monthly Stats -->
          ${data.monthlyStats ? `
          <div style="margin: 30px 0;">
            <h3 style="color: #000; margin: 0 0 20px 0; font-size: 18px;">This Month's Impact</h3>
            <div style="display: table; width: 100%;">
              ${data.monthlyStats.casesHandled ? `
              <div style="display: table-cell; padding: 15px; text-align: center; background: #fef5f5;">
                <div style="font-size: 32px; font-weight: bold; color: #D62828;">${data.monthlyStats.casesHandled}</div>
                <div style="font-size: 14px; color: #667085; margin-top: 5px;">Cases Handled</div>
              </div>
              ` : ''}
              ${data.monthlyStats.peopleTrained ? `
              <div style="display: table-cell; padding: 15px; text-align: center; background: #f9fafb;">
                <div style="font-size: 32px; font-weight: bold; color: #D62828;">${data.monthlyStats.peopleTrained}</div>
                <div style="font-size: 14px; color: #667085; margin-top: 5px;">People Trained</div>
              </div>
              ` : ''}
              ${data.monthlyStats.communitiesReached ? `
              <div style="display: table-cell; padding: 15px; text-align: center; background: #fef5f5;">
                <div style="font-size: 32px; font-weight: bold; color: #D62828;">${data.monthlyStats.communitiesReached}</div>
                <div style="font-size: 14px; color: #667085; margin-top: 5px;">Communities Reached</div>
              </div>
              ` : ''}
            </div>
          </div>
          ` : ''}

          <!-- Closing -->
          <p style="color: #344054; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Thank you for your continued support in defending land rights across Tanzania.
          </p>

          <p style="color: #344054; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>The HakiArdhi Team</strong>
          </p>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e7ec; text-align: center;">
            <p style="color: #98a2b3; font-size: 12px; margin: 5px 0;">
              HakiArdhi Land Rights Research & Resources Institute
            </p>
            <p style="color: #98a2b3; font-size: 12px; margin: 5px 0;">
              <a href="mailto:info@hakiardhi.or.tz" style="color: #D62828; text-decoration: none;">info@hakiardhi.or.tz</a> |
              <a href="https://hakiardhi.or.tz" style="color: #D62828; text-decoration: none;">hakiardhi.or.tz</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const newsletterService = new NewsletterService();
