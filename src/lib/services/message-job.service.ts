import { supabase } from '@/lib/database/supabase_client';
import { notificationService } from './notification.service';
import { redisService } from './redis.service';
import {
  updateMessageRecipientStatus,
  updateMessageJobStatus,
  recordJobStatistics,
} from '@/utils/job_status_updater';
import type { JobProcessingContext, JobProcessingResult } from '@/lib/types/job.types';

export class MessageJobService {
  /**
   * Process a message job - main entry point
   * Sends messages to recipients concurrently but ensures idempotency per recipient.
   */
  async processJob(
    payload: any,
    context: JobProcessingContext
  ): Promise<JobProcessingResult> {
    const { jobId } = payload;
    const { attemptNumber, isFinalAttempt } = context;

    console.log(`📬 Processing message job: ${jobId}`);

    // 1️⃣ Fetch pending recipients
    const db = await supabase(false);
    const { data: recipients, error } = await db
      .from('message_job_recipients')
      .select('*')
      .eq('job_id', jobId)
      .eq('status', 'pending');

    if (error) throw new Error(`Failed to fetch recipients: ${error.message}`);
    if (!recipients || recipients.length === 0) {
      console.log(`⚠️ No pending recipients for job ${jobId}`);
      return { success: true, processedCount: 0, failedCount: 0, errors: [] };
    }

    // 2️⃣ Update job status to processing
    await updateMessageJobStatus({ jobId, status: 'processing' });

    const errors: Array<{ itemId: string; error: string }> = [];

    console.log(`🚀 Sending messages to ${recipients.length} recipients concurrently`);

    // 3️⃣ Process recipients concurrently
    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        this.processRecipient(recipient, attemptNumber, isFinalAttempt)
      )
    );

    let successCount = 0;
    let failCount = 0;

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') successCount++;
      else {
        failCount++;
        errors.push({ itemId: recipients[idx].id, error: (result.reason as Error).message });
      }
    });

    // 4️⃣ Record job statistics
    if (successCount > 0) await recordJobStatistics('message', 'success');
    if (failCount > 0 && isFinalAttempt) await recordJobStatistics('message', 'failed');

    // 5️⃣ Update job status
    await updateMessageJobStatus({
      jobId,
      status: failCount > 0 ? 'failed' : 'completed',
      successCount,
      failedCount: failCount,
    });

    console.log(`📊 Job ${jobId} completed: ${successCount} sent, ${failCount} failed`);

    return { success: failCount === 0, processedCount: successCount, failedCount: failCount, errors };
  }

  /**
   * Process a single recipient - ensures idempotency via Redis
   */
  private async processRecipient(
    recipient: any,
    attemptNumber: number,
    isFinalAttempt: boolean
  ): Promise<void> {
    const { id: recipientId, job_id: jobId, destination, message } = recipient;

    // 1️⃣ Check idempotency
    const isDuplicate = await redisService.checkIdempotency(jobId, recipientId, attemptNumber);
    if (isDuplicate) {
      console.log(`⏭️ Skipping duplicate recipient ${recipientId}`);
      return;
    }

    // 2️⃣ Update status to processing
    await updateMessageRecipientStatus({ recipientId, jobId, status: 'processing' });

    try {
      // 3️⃣ Send SMS via single-recipient service
      const sent = await notificationService.sendSMS({ to: [{ to: destination, message }] });
      if (!sent) throw new Error('SMS service returned false');

      // 4️⃣ Mark as completed
      await updateMessageRecipientStatus({
        recipientId,
        jobId,
        status: 'completed',
        attemptCount: attemptNumber,
      });

      console.log(`✅ Sent to ${destination}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to send to ${destination}:`, errorMessage);

      await updateMessageRecipientStatus({
        recipientId,
        jobId,
        status: isFinalAttempt ? 'failed' : 'pending',
        errorMessage,
        attemptCount: attemptNumber,
      });

      throw error;
    }
  }
}

export const messageJobService = new MessageJobService();
