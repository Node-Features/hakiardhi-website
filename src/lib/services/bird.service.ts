/**
 * Bird API Service
 * Multi-channel communication service (SMS, WhatsApp, Email)
 * Replaces: Beem SMS, Meta WhatsApp, and adds Email functionality
 *
 * @see https://bird.com/docs/api
 */

import { Redis } from '@upstash/redis';

// Environment variables
const BIRD_API_KEY = process.env.BIRD_API_KEY;
const BIRD_WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID;
const BIRD_BASE_URL = 'https://api.bird.com';

// Redis for caching and rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Types
export type BirdChannel = 'sms' | 'whatsapp' | 'email';

export interface BirdMessageOptions {
  to: string | string[]; // Phone number, WhatsApp ID, or email
  channel: BirdChannel;
  content: {
    text?: string; // For simple text messages
    templateId?: string; // Bird template ID
    templateParams?: Record<string, string>; // Template variables
    subject?: string; // For email
    html?: string; // For email HTML content
  };
  from?: string; // Sender ID (optional, uses default from Bird)
  metadata?: Record<string, any>; // Track custom data
}

export interface BirdBulkMessageOptions {
  messages: BirdMessageOptions[];
  batchSize?: number; // Process in batches (default: 100)
}

export interface BirdMessageResponse {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'failed' | 'pending';
}

export interface BirdTemplateData {
  id: string;
  name: string;
  channel: BirdChannel;
  language: 'en' | 'sw';
  params: string[]; // List of required parameters
}

/**
 * Bird Service Class
 * Handles all multi-channel messaging through Bird API
 */
class BirdService {
  private baseUrl: string;
  private apiKey: string;
  private workspaceId: string;

  constructor() {
    if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID) {
      throw new Error('BIRD_API_KEY and BIRD_WORKSPACE_ID must be set in environment variables');
    }

    this.baseUrl = BIRD_BASE_URL;
    this.apiKey = BIRD_API_KEY;
    this.workspaceId = BIRD_WORKSPACE_ID;
  }

  /**
   * Send a single message via Bird
   */
  async sendMessage(options: BirdMessageOptions): Promise<BirdMessageResponse> {
    try {
      // Normalize recipient(s) to array
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      // Format phone numbers for SMS/WhatsApp
      const formattedRecipients = recipients.map(recipient => {
        if (options.channel === 'sms' || options.channel === 'whatsapp') {
          return this.formatPhoneNumber(recipient);
        }
        return recipient;
      });

      // Check rate limit
      const canSend = await this.checkRateLimit(formattedRecipients[0], options.channel);
      if (!canSend) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        };
      }

      // Build message payload
      const payload = this.buildMessagePayload(formattedRecipients, options);

      // Send to Bird API
      const response = await fetch(
        `${this.baseUrl}/workspaces/${this.workspaceId}/channels/${options.channel}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `AccessKey ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[BirdService] Send failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to send message',
        };
      }

      // Cache message status
      if (data.id) {
        await this.cacheMessageStatus(data.id, 'sent');
      }

      return {
        success: true,
        messageId: data.id,
        status: data.status || 'sent',
        deliveryStatus: 'sent',
      };

    } catch (error) {
      console.error('[BirdService] Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send bulk messages (batched processing)
   */
  async sendBulk(bulkOptions: BirdBulkMessageOptions): Promise<BirdMessageResponse[]> {
    const { messages, batchSize = 100 } = bulkOptions;
    const results: BirdMessageResponse[] = [];

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);

      // Send batch concurrently
      const batchResults = await Promise.allSettled(
        batch.map(msg => this.sendMessage(msg))
      );

      // Collect results
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Batch send failed',
          });
        }
      });

      // Add delay between batches (rate limiting)
      if (i + batchSize < messages.length) {
        await this.delay(1000); // 1 second delay
      }
    }

    return results;
  }

  /**
   * Send SMS using Bird
   */
  async sendSMS(to: string | string[], message: string, from?: string): Promise<BirdMessageResponse> {
    return this.sendMessage({
      to,
      channel: 'sms',
      content: { text: message },
      from,
    });
  }

  /**
   * Send WhatsApp message using Bird
   */
  async sendWhatsApp(to: string | string[], message: string, from?: string): Promise<BirdMessageResponse> {
    return this.sendMessage({
      to,
      channel: 'whatsapp',
      content: { text: message },
      from,
    });
  }

  /**
   * Send Email using Bird
   */
  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    from?: string
  ): Promise<BirdMessageResponse> {
    return this.sendMessage({
      to,
      channel: 'email',
      content: { subject, html },
      from,
    });
  }

  /**
   * Send using Bird template
   */
  async sendTemplate(
    to: string | string[],
    channel: BirdChannel,
    templateId: string,
    params: Record<string, string> = {}
  ): Promise<BirdMessageResponse> {
    return this.sendMessage({
      to,
      channel,
      content: {
        templateId,
        templateParams: params,
      },
    });
  }

  /**
   * Validate phone number using Bird's Number Lookup API
   */
  async validatePhoneNumber(phoneNumber: string): Promise<{
    valid: boolean;
    formatted?: string;
    carrier?: string;
    country?: string;
  }> {
    try {
      const formatted = this.formatPhoneNumber(phoneNumber);

      const response = await fetch(
        `${this.baseUrl}/workspaces/${this.workspaceId}/lookup/phone/${encodeURIComponent(formatted)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `AccessKey ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return { valid: false };
      }

      const data = await response.json();

      return {
        valid: data.valid || false,
        formatted: data.phoneNumber,
        carrier: data.carrier,
        country: data.country,
      };

    } catch (error) {
      console.error('[BirdService] Phone validation error:', error);
      return { valid: false };
    }
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId: string): Promise<{
    status: string;
    deliveredAt?: string;
    readAt?: string;
    error?: string;
  }> {
    try {
      // Check cache first
      const cached = await this.getCachedMessageStatus(messageId);
      if (cached) {
        return { status: cached };
      }

      // Fetch from Bird API
      const response = await fetch(
        `${this.baseUrl}/workspaces/${this.workspaceId}/messages/${messageId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `AccessKey ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch message status');
      }

      const data = await response.json();

      // Update cache
      await this.cacheMessageStatus(messageId, data.status);

      return {
        status: data.status,
        deliveredAt: data.deliveredAt,
        readAt: data.readAt,
      };

    } catch (error) {
      console.error('[BirdService] Status check error:', error);
      return {
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build Bird API message payload
   */
  private buildMessagePayload(recipients: string[], options: BirdMessageOptions): any {
    const payload: any = {
      receiver: {
        contacts: recipients.map(r => ({ identifierValue: r })),
      },
    };

    // Add content based on type
    if (options.content.templateId) {
      payload.template = {
        id: options.content.templateId,
        parameters: options.content.templateParams || {},
      };
    } else if (options.channel === 'email') {
      payload.body = {
        email: {
          subject: options.content.subject,
          html: options.content.html,
        },
      };
    } else {
      payload.body = {
        text: {
          text: options.content.text,
        },
      };
    }

    // Add sender if provided
    if (options.from) {
      payload.sender = { identifierValue: options.from };
    }

    // Add metadata
    if (options.metadata) {
      payload.metadata = options.metadata;
    }

    return payload;
  }

  /**
   * Format phone number for Bird (E.164 format)
   * Handles Tanzanian numbers specifically
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle Tanzanian numbers
    if (cleaned.startsWith('0')) {
      // 0712345678 -> 255712345678
      cleaned = '255' + cleaned.substring(1);
    } else if (!cleaned.startsWith('255') && cleaned.length === 9) {
      // 712345678 -> 255712345678
      cleaned = '255' + cleaned;
    }

    // Add + prefix for E.164 format
    return '+' + cleaned;
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(identifier: string, channel: BirdChannel): Promise<boolean> {
    const key = `bird:ratelimit:${channel}:${identifier}`;
    const limit = 10; // 10 messages per minute
    const window = 60; // 60 seconds

    try {
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, window);
      }

      return count <= limit;
    } catch (error) {
      console.error('[BirdService] Rate limit check failed:', error);
      return true; // Allow on error
    }
  }

  /**
   * Cache message status in Redis
   */
  private async cacheMessageStatus(messageId: string, status: string): Promise<void> {
    try {
      await redis.setex(`bird:status:${messageId}`, 3600, status); // 1 hour TTL
    } catch (error) {
      console.error('[BirdService] Cache write failed:', error);
    }
  }

  /**
   * Get cached message status
   */
  private async getCachedMessageStatus(messageId: string): Promise<string | null> {
    try {
      return await redis.get<string>(`bird:status:${messageId}`);
    } catch (error) {
      console.error('[BirdService] Cache read failed:', error);
      return null;
    }
  }

  /**
   * Delay utility for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const birdService = new BirdService();

// Template registry (to be populated with actual Bird template IDs)
export const BIRD_TEMPLATES: Record<string, BirdTemplateData> = {
  // Activity assignments
  ACTIVITY_ASSIGNMENT_SW: {
    id: 'activity_assignment_sw', // Replace with actual Bird template ID
    name: 'Activity Assignment (Swahili)',
    channel: 'sms',
    language: 'sw',
    params: ['first_name', 'activity_name', 'due_date'],
  },
  ACTIVITY_ASSIGNMENT_EN: {
    id: 'activity_assignment_en',
    name: 'Activity Assignment (English)',
    channel: 'sms',
    language: 'en',
    params: ['first_name', 'activity_name', 'due_date'],
  },

  // Beneficiary notifications
  BENEFICIARY_SELECTED_SW: {
    id: 'beneficiary_selected_sw',
    name: 'Beneficiary Selection (Swahili)',
    channel: 'sms',
    language: 'sw',
    params: ['first_name', 'activity_name', 'date'],
  },

  // Donation receipts
  DONATION_RECEIPT: {
    id: 'donation_receipt_email',
    name: 'Donation Receipt',
    channel: 'email',
    language: 'en',
    params: ['donor_name', 'amount', 'currency', 'transaction_ref', 'campaign_name', 'date'],
  },
  DONATION_THANK_YOU_SMS: {
    id: 'donation_thank_you_sms',
    name: 'Donation Thank You SMS',
    channel: 'sms',
    language: 'en',
    params: ['donor_name', 'amount', 'campaign_name'],
  },

  // Newsletter
  NEWSLETTER_MONTHLY: {
    id: 'newsletter_monthly',
    name: 'Monthly Newsletter',
    channel: 'email',
    language: 'en',
    params: ['subscriber_name', 'month', 'year'],
  },

  // Campaign updates
  CAMPAIGN_UPDATE: {
    id: 'campaign_update_email',
    name: 'Campaign Update',
    channel: 'email',
    language: 'en',
    params: ['subscriber_name', 'campaign_name', 'update_text'],
  },
  CAMPAIGN_SMS: {
    id: 'campaign_sms',
    name: 'Campaign SMS',
    channel: 'sms',
    language: 'sw',
    params: ['first_name', 'message'],
  },

  // Legal aid
  LEGAL_AID_CONFIRMATION: {
    id: 'legal_aid_confirmation',
    name: 'Legal Aid Request Confirmation',
    channel: 'whatsapp',
    language: 'sw',
    params: ['name', 'request_id', 'case_type'],
  },
  LEGAL_AID_UPDATE: {
    id: 'legal_aid_update',
    name: 'Legal Aid Status Update',
    channel: 'whatsapp',
    language: 'sw',
    params: ['name', 'case_id', 'status', 'next_action'],
  },

  // Incident reporting
  INCIDENT_CONFIRMATION: {
    id: 'incident_confirmation',
    name: 'Incident Report Confirmation',
    channel: 'whatsapp',
    language: 'sw',
    params: ['name', 'report_id', 'incident_type'],
  },

  // Community validation
  VALIDATOR_REQUEST: {
    id: 'validator_request',
    name: 'Validation Request (Village Leader)',
    channel: 'whatsapp',
    language: 'sw',
    params: ['leader_name', 'report_id', 'incident_summary', 'reporter_name'],
  },

  // Training/Events
  TRAINING_REMINDER: {
    id: 'training_reminder',
    name: 'Training Session Reminder',
    channel: 'sms',
    language: 'sw',
    params: ['first_name', 'training_name', 'date', 'location'],
  },
  EVENT_CONFIRMATION: {
    id: 'event_confirmation',
    name: 'Event Registration Confirmation',
    channel: 'email',
    language: 'en',
    params: ['name', 'event_title', 'date', 'location', 'confirmation_code'],
  },
};
