/**
 * QStash Worker Webhook
 *
 * Single entry point for ALL background jobs.
 * Verifies signature, logs payload, and dispatches to appropriate service.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyQStashWebhook, logWebhookPayload } from '@/utils/webhook_verifier';
import { dispatchJob, validateJobPayload } from '@/utils/job_dispatcher';


export async function POST(req: NextRequest) {
  try {
    // 1. Verify QStash signature and parse payload
    const verification = await verifyQStashWebhook(req, 3);

    if (!verification.valid) {
      console.error('❌ Webhook verification failed:', verification.error);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid signature' },
        { status: 401 }
      );
    }

    const { payload, metadata } = verification;

    // 2. Log incoming payload
    logWebhookPayload(payload, payload.taskType || 'unknown');

    // 3. Validate payload structure
    if (!validateJobPayload(payload)) {
      console.error('❌ Invalid payload structure:', payload);
      return NextResponse.json(
        { error: 'Bad Request: Invalid payload structure' },
        { status: 400 }
      );
    }

    // 4. Build processing context
    const context = {
      jobId: payload.jobId,
      attemptNumber: metadata.attemptNumber,
      isFinalAttempt: metadata.isFinalAttempt,
      maxRetries: 3,
      metadata: {
        messageId: metadata.messageId,
        publishedAt: metadata.publishedAt,
        scheduleId: metadata.scheduleId,
      },
    };

    console.log(`🔄 Processing attempt ${context.attemptNumber} for job ${payload.jobId}`);

    // 5. Dispatch to appropriate service
    const result = await dispatchJob(payload, context);

    // 6. Return result
    return NextResponse.json({
      success: result.success,
      jobId: payload.jobId,
      taskType: payload.taskType,
      processed: result.processedCount,
      failed: result.failedCount,
      attempt: context.attemptNumber,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);

    // Return 500 to trigger QStash retry
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Disable body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};
