/**
 * Create Message Job Endpoint
 *
 * Example endpoint showing how to create and enqueue a message job.
 * This creates the job record and publishes to QStash, then returns immediately.
 */

import { NextRequest, NextResponse } from 'next/server';
import {supabase} from '@/lib/database/supabase_client';
import { qstashService } from '@/lib/services/qstash.service';
import { AnyAaaaRecord } from 'dns';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entity_type, entity_id, job_type = 'notification', recipients } = body;

    // Validate input
    if (!entity_type || !entity_id || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Missing required fields: entity_type, entity_id, recipients' },
        { status: 400 }
      );
    }

  const db = supabase(false);

    // 1. Create message job record
    const { data: messageJob, error: jobError } = await db
      .from('message_jobs')
      .insert({
        entity_type,
        title: 'Message Job for ' + entity_type,
        job_type,
        payload: recipients,
        status: 'pending',
      })
      .select()
      .single();

    if (jobError) {
      console.error('Failed to create message job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // 2. Create recipient records
   const recipientRecords = recipients.map((r: any) => ({
    job_id: messageJob.id,
    recipient_id: r.recipient_id || crypto.randomUUID(),
    channel: r.channel || 'sms',
    destination: r.destination || r.phone_number,
    message: r.message,
    status: 'pending',
  }));


    const { error: recipientsError } = await db
      .from('message_job_recipients')
      .insert(recipientRecords);

    if (recipientsError) {
      console.error('Failed to create recipients:', recipientsError);
      // Rollback job creation
      await db.from('message_jobs').delete().eq('id', messageJob.id);
      return NextResponse.json(
        { error: 'Failed to create recipients' },
        { status: 500 }
      );
    }

    // 3. Publish to QStash (non-blocking)
    try {

      await qstashService.publishJob('message', {
        jobId: messageJob.id,
        entityType: entity_type,
        entityId: entity_id,
      });
      
    } catch (error) {
      console.error('Failed to publish to QStash:', error);
      // Job is created but not queued - could be retried later
      // or handled by a separate monitoring system
    }

    // 4. Return immediately
    return NextResponse.json({
      success: true,
      jobId: messageJob.id,
      totalRecipients: recipients.length,
      status: 'pending',
      message: 'Job created and queued for processing',
    });
  } catch (error) {
    console.error('Error creating message job:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
