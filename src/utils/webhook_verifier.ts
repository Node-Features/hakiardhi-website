/**
 * Webhook Verification Utility
 *
 * Handles QStash webhook signature verification and request logging
 */

import { NextRequest } from 'next/server';
import { qstashService } from '@/lib/services/qstash.service';

export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
  payload?: any;
  metadata: {
    messageId: string | null;
    attemptNumber: number;
    publishedAt: string | null;
    scheduleId: string | null;
    isFinalAttempt: boolean;
  };
}

/**
 * Verify and parse QStash webhook request
 */
export async function verifyQStashWebhook(
  req: NextRequest,
  maxRetries: number = 3
): Promise<WebhookVerificationResult> {
  try {
    const body = await req.text();
    const headers = req.headers;

    // Log incoming webhook
    console.log('📥 Incoming QStash webhook:', {
      path: req.nextUrl.pathname,
      messageId: headers.get('Upstash-Message-Id'),
      attempt: qstashService.getAttemptNumber(headers),
    });

    // Verify signature
    const verification = await qstashService.verifyWebhookRequest(headers, body);

    if (!verification.valid) {
      console.error('❌ Webhook verification failed:', verification.error);
      return {
        valid: false,
        error: verification.error,
        metadata: {
          messageId: null,
          attemptNumber: 0,
          publishedAt: null,
          scheduleId: null,
          isFinalAttempt: false,
        },
      };
    }

    // Parse payload
    const payload = JSON.parse(body);

    // Get metadata
    const metadata = {
      ...qstashService.getRequestMetadata(headers),
      isFinalAttempt: qstashService.isFinalAttempt(headers, maxRetries),
    };

    console.log('✅ Webhook verified successfully:', {
      messageId: metadata.messageId,
      attemptNumber: metadata.attemptNumber,
      isFinalAttempt: metadata.isFinalAttempt,
    });

    return {
      valid: true,
      payload,
      metadata,
    };
  } catch (error) {
    console.error('❌ Error verifying webhook:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
      metadata: {
        messageId: null,
        attemptNumber: 0,
        publishedAt: null,
        scheduleId: null,
        isFinalAttempt: false,
      },
    };
  }
}

/**
 * Log webhook payload for debugging
 */
export function logWebhookPayload(payload: any, jobType: string): void {
  console.log(`📋 ${jobType} webhook payload:`, {
    jobId: payload.jobId,
    itemCount:
      payload.recipients?.length || payload.files?.length || 0,
    timestamp: new Date().toISOString(),
  });
}
