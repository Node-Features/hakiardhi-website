import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { birdService } from "@/lib/services/bird.service";
import { log } from "@/utils/logger";
import { z } from "zod";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

// Validation schema for campaign send request
const CampaignSendValidation = z.object({
  campaignId: z.string().uuid().optional(),
  message: z.string().min(1).max(1600),
  subject: z.string().min(1).max(200).optional(), // For email
  channels: z.array(z.enum(['sms', 'whatsapp', 'email'])).min(1),
  recipientType: z.enum(['all', 'selected', 'donors', 'subscribers', 'beneficiaries', 'staff']),
  recipientIds: z.array(z.string().uuid()).optional(), // Required if recipientType is 'selected'
  templateId: z.string().optional(), // Bird template ID if using template
  templateParams: z.record(z.string()).optional(), // Template parameters
  metadata: z.record(z.any()).optional(),
});

/**
 * POST /api/admin/campaigns/send
 *
 * Manual campaign message sending from admin portal
 * Supports multi-channel delivery (SMS/Email/WhatsApp)
 * Uses Bird batch API and tracks via message_jobs table
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CampaignSendValidation.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      campaignId,
      message,
      subject,
      channels,
      recipientType,
      recipientIds,
      templateId,
      templateParams,
      metadata,
    } = parsed.data;

    // Fetch recipients based on recipientType
    const recipients = await fetchRecipients(recipientType, recipientIds);

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { message: 'No recipients found for the selected criteria' },
        { status: 400 }
      );
    }

    // Create message job record for tracking
    const { data: messageJob, error: jobError } = await db
      .from('message_jobs')
      .insert({
        campaign_id: campaignId || null,
        job_type: 'campaign_message',
        channels: channels,
        recipient_count: recipients.length,
        status: 'processing',
        metadata: {
          recipientType,
          message: templateId ? undefined : message,
          subject,
          templateId,
          templateParams,
          ...metadata,
        },
      })
      .select()
      .single();

    if (jobError) {
      log.error('Failed to create message job', jobError, 'CAMPAIGN_SEND');
      return NextResponse.json(
        { message: 'Failed to create message job' },
        { status: 500 }
      );
    }

    // Send messages via Bird service (with channel priority)
    const results = await sendToRecipients({
      recipients,
      channels,
      message,
      subject,
      templateId,
      templateParams,
      jobId: messageJob.id,
    });

    // Update job status with results
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;

    await db
      .from('message_jobs')
      .update({
        status: failedCount === 0 ? 'completed' : failedCount === results.length ? 'failed' : 'partially_completed',
        sent_count: successCount,
        failed_count: failedCount,
        completed_at: new Date().toISOString(),
        metadata: {
          ...messageJob.metadata,
          results: results.slice(0, 10), // Store first 10 results as sample
        },
      })
      .eq('id', messageJob.id);

    log.info(`Campaign sent: ${successCount}/${results.length} successful`, {
      job_id: messageJob.id,
      total: results.length,
      sent: successCount,
      failed: failedCount,
      channels,
    }, 'CAMPAIGN_SEND');

    return NextResponse.json({
      success: true,
      message: 'Campaign messages sent',
      data: {
        jobId: messageJob.id,
        totalRecipients: recipients.length,
        sent: successCount,
        failed: failedCount,
        channels: channels,
      },
    }, { status: 200 });

  } catch (error) {
    log.error('Campaign send error', error, 'CAMPAIGN_SEND');
    return NextResponse.json(
      { message: 'Internal server error while sending campaign' },
      { status: 500 }
    );
  }
}

/**
 * Fetch recipients based on type
 */
async function fetchRecipients(
  recipientType: string,
  recipientIds?: string[]
): Promise<Recipient[]> {
  let query = db.from('users').select('id, first_name, last_name, email, phone_number');

  switch (recipientType) {
    case 'selected':
      if (!recipientIds || recipientIds.length === 0) {
        throw new Error('recipientIds required for selected recipient type');
      }
      query = query.in('id', recipientIds);
      break;

    case 'donors':
      // Users who have made donations
      const { data: donorData } = await db
        .from('donations')
        .select('donor_email, donor_phone')
        .not('donor_email', 'is', null);

      if (!donorData) return [];

      // Get unique emails
      const donorEmails = [...new Set(donorData.map(d => d.donor_email).filter(Boolean))];
      query = query.in('email', donorEmails);
      break;

    case 'subscribers':
      // Newsletter subscribers
      const { data: subscriberData } = await db
        .from('newsletter_subscriptions')
        .select('email')
        .eq('subscribed', true);

      if (!subscriberData) return [];

      const subscriberEmails = subscriberData.map(s => s.email);
      query = query.in('email', subscriberEmails);
      break;

    case 'beneficiaries':
      // Activity beneficiaries
      query = query.eq('role', 'beneficiary');
      break;

    case 'staff':
      // Staff members
      query = query.in('role', ['admin', 'staff', 'moderator']);
      break;

    case 'all':
      // All users (be careful with this!)
      break;

    default:
      throw new Error(`Unknown recipient type: ${recipientType}`);
  }

  const { data, error } = await query;

  if (error) {
    log.error('Failed to fetch recipients', error, 'CAMPAIGN_SEND');
    throw error;
  }

  return data || [];
}

/**
 * Send messages to recipients with channel priority
 * Priority: WhatsApp > SMS > Email
 */
async function sendToRecipients(options: {
  recipients: Recipient[];
  channels: ('sms' | 'whatsapp' | 'email')[];
  message: string;
  subject?: string;
  templateId?: string;
  templateParams?: Record<string, string>;
  jobId: string;
}): Promise<any[]> {
  const {
    recipients,
    channels,
    message,
    subject,
    templateId,
    templateParams,
  } = options;

  const results: any[] = [];

  // Prepare messages for batch sending
  const messages: any[] = [];

  for (const recipient of recipients) {
    // Determine which channel to use (priority order)
    let selectedChannel: 'sms' | 'whatsapp' | 'email' | null = null;

    if (channels.includes('whatsapp') && recipient.phone_number) {
      selectedChannel = 'whatsapp';
    } else if (channels.includes('sms') && recipient.phone_number) {
      selectedChannel = 'sms';
    } else if (channels.includes('email') && recipient.email) {
      selectedChannel = 'email';
    }

    if (!selectedChannel) {
      results.push({
        success: false,
        recipient: recipient.id,
        error: 'No valid contact method available',
      });
      continue;
    }

    // Build message for this recipient
    const personalizedMessage = personalizeMessage(message, recipient);
    const personalizedParams = templateParams ? {
      ...templateParams,
      first_name: recipient.first_name,
      name: `${recipient.first_name} ${recipient.last_name}`.trim(),
    } : undefined;

    // Prepare message payload
    const messagePayload: any = {
      to: selectedChannel === 'email' ? recipient.email : recipient.phone_number,
      channel: selectedChannel,
      content: templateId
        ? { templateId, templateParams: personalizedParams }
        : selectedChannel === 'email'
          ? { subject: subject || 'HakiArdhi Update', html: personalizedMessage }
          : { text: personalizedMessage },
      metadata: {
        jobId: options.jobId,
        recipientId: recipient.id,
        recipientName: `${recipient.first_name} ${recipient.last_name}`,
      },
    };

    messages.push(messagePayload);
  }

  // Send via Bird batch API
  const batchResults = await birdService.sendBulk({
    messages,
    batchSize: 100, // Process 100 at a time
  });

  return batchResults;
}

/**
 * Personalize message with recipient data
 */
function personalizeMessage(message: string, recipient: Recipient): string {
  return message
    .replace(/\{first_name\}/g, recipient.first_name || '')
    .replace(/\{last_name\}/g, recipient.last_name || '')
    .replace(/\{full_name\}/g, `${recipient.first_name} ${recipient.last_name}`.trim())
    .replace(/\{email\}/g, recipient.email || '');
}

/**
 * GET /api/admin/campaigns/send
 *
 * Get campaign send history and statistics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db
      .from('message_jobs')
      .select('*', { count: 'exact' })
      .eq('job_type', 'campaign_message')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error, count } = await query;

    if (error) {
      log.error('Failed to fetch campaign jobs', error, 'CAMPAIGN_SEND');
      return NextResponse.json(
        { message: 'Failed to fetch campaign history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });

  } catch (error) {
    log.error('Campaign history fetch error', error, 'CAMPAIGN_SEND');
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Types
interface Recipient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
}
