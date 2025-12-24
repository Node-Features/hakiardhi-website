/**
 * Donation Notification Service
 * Multi-channel notifications for donations using Bird + QStash + Redis
 * Handles receipts, thank you messages, campaign updates, and donor engagement
 */

import { birdService, BIRD_TEMPLATES } from './bird.service';
import { qstashService } from './qstash.service';
import { redisService } from './redis.service';
import { generateDonationReceipt, type DonationReceiptData } from '@/lib/templates/email/donation-receipt';
import { generateCampaignUpdate, type CampaignUpdateData } from '@/lib/templates/email/campaign-update';
import { supabase } from '../database/supabase_client';

export interface DonationNotificationOptions {
  donationId: string;
  sendEmail?: boolean;
  sendSMS?: boolean;
  sendWhatsApp?: boolean;
  immediate?: boolean; // Send immediately vs queued
}

export interface CampaignUpdateOptions {
  campaignId: string;
  updateData: Omit<CampaignUpdateData, 'recipientName' | 'campaignName'>;
  targetAudience: 'all_donors' | 'recurring_donors' | 'recent_donors' | 'subscribers';
  channels: Array<'email' | 'sms' | 'whatsapp'>;
}

class DonationNotificationService {
  private readonly CACHE_PREFIX = 'donation:notification';
  private readonly db = supabase(false);
  private readonly redis = redisService.getClient();

  /**
   * Send donation receipt and thank you (multi-channel)
   */
  async sendDonationReceipt(options: DonationNotificationOptions): Promise<{
    success: boolean;
    channels: Record<string, boolean>;
    error?: string;
  }> {
    try {
      // Fetch donation details
      const { data: donation, error: donationError } = await this.db
        .from('donations')
        .select(`
          *,
          campaign:donation_campaigns(*)
        `)
        .eq('id', options.donationId)
        .single();

      if (donationError || !donation) {
        return { success: false, channels: {}, error: 'Donation not found' };
      }

      // Check if already sent (idempotency)
      const cacheKey = `${this.CACHE_PREFIX}:${options.donationId}:receipt`;
      const alreadySent = await this.redis.get(cacheKey);

      if (alreadySent) {
        return { success: true, channels: JSON.parse(alreadySent as string) };
      }

      const results: Record<string, boolean> = {};

      // Prepare receipt data
      const receiptData: DonationReceiptData = {
        donorName: donation.donor_name,
        donorEmail: donation.donor_email,
        amount: parseFloat(donation.amount),
        currency: donation.currency,
        transactionRef: donation.transaction_reference,
        campaignName: donation.campaign?.title || 'General Fund',
        campaignUrl: donation.campaign
          ? `${process.env.NEXT_PUBLIC_APP_URL}/campaigns/${donation.campaign.slug}`
          : undefined,
        donationDate: new Date(donation.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        paymentMethod: donation.payment_method,
        isRecurring: donation.is_recurring,
        frequency: donation.frequency,
        taxReceiptNumber: donation.tax_receipt_number,
        impactMetrics: donation.campaign ? await this.getCampaignImpact(donation.campaign.id) : undefined,
      };

      // Send via different channels
      if (options.sendEmail !== false && donation.donor_email) {
        if (options.immediate) {
          results.email = await this.sendReceiptEmail(receiptData);
        } else {
          await this.queueReceiptEmail(receiptData);
          results.email = true;
        }
      }

      if (options.sendSMS && donation.donor_phone) {
        if (options.immediate) {
          results.sms = await this.sendThankYouSMS(donation.donor_name, donation.amount, donation.currency, donation.donor_phone);
        } else {
          await this.queueThankYouSMS(donation.donor_name, donation.amount, donation.currency, donation.donor_phone);
          results.sms = true;
        }
      }

      if (options.sendWhatsApp && donation.donor_phone) {
        if (options.immediate) {
          results.whatsapp = await this.sendThankYouWhatsApp(
            donation.donor_name,
            donation.amount,
            donation.currency,
            donation.campaign?.title || 'General Fund',
            donation.donor_phone
          );
        } else {
          await this.queueThankYouWhatsApp(
            donation.donor_name,
            donation.amount,
            donation.currency,
            donation.campaign?.title || 'General Fund',
            donation.donor_phone
          );
          results.whatsapp = true;
        }
      }

      // Mark receipt as sent
      await this.markReceiptSent(donation.id);

      // Cache results (24 hours)
      await this.redis.setex(cacheKey, 86400, JSON.stringify(results));

      return { success: true, channels: results };

    } catch (error) {
      console.error('[DonationNotificationService] Receipt error:', error);
      return {
        success: false,
        channels: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send campaign update to donors
   */
  async sendCampaignUpdate(options: CampaignUpdateOptions): Promise<{
    success: boolean;
    sent: number;
    failed: number;
  }> {
    try {
      // Fetch campaign details
      const { data: campaign, error: campaignError } = await this.db
        .from('donation_campaigns')
        .select('*')
        .eq('id', options.campaignId)
        .single();

      if (campaignError || !campaign) {
        throw new Error('Campaign not found');
      }

      // Get target donors
      const donors = await this.getTargetDonors(options.campaignId, options.targetAudience);

      if (donors.length === 0) {
        return { success: true, sent: 0, failed: 0 };
      }

      // Prepare campaign data
      const campaignData: CampaignUpdateData = {
        ...options.updateData,
        campaignName: campaign.title,
        campaignUrl: `${process.env.NEXT_PUBLIC_APP_URL}/campaigns/${campaign.slug}`,
      };

      let sent = 0;
      let failed = 0;

      // Process in batches
      const batchSize = 100;
      for (let i = 0; i < donors.length; i += batchSize) {
        const batch = donors.slice(i, i + batchSize);

        // Queue bulk send via QStash
        await qstashService.publishBatchMessageJobs(
          batch.map(donor => ({
            jobId: `${options.campaignId}:${donor.id}`,
            activityId: options.campaignId,
            jobType: 'campaign_update',
            recipients: [
              {
                channel: options.channels.includes('email') && donor.email ? 'email' : options.channels.includes('sms') ? 'sms' : 'whatsapp',
                recipient: donor.email || donor.phone || '',
                message: generateCampaignUpdate({
                  ...campaignData,
                  recipientName: donor.name,
                }),
                entityType: 'campaign_update',
                entityId: options.campaignId,
              },
            ],
          }))
        );

        sent += batch.length;

        // Rate limiting delay
        if (i + batchSize < donors.length) {
          await this.delay(1000);
        }
      }

      // Track analytics
      await this.trackCampaignUpdate(options.campaignId, sent);

      return { success: true, sent, failed };

    } catch (error) {
      console.error('[DonationNotificationService] Campaign update error:', error);
      return {
        success: false,
        sent: 0,
        failed: 0,
      };
    }
  }

  /**
   * Send receipt email
   */
  private async sendReceiptEmail(data: DonationReceiptData): Promise<boolean> {
    try {
      const html = generateDonationReceipt(data);

      const result = await birdService.sendEmail(
        data.donorEmail,
        `Donation Receipt - ${data.campaignName}`,
        html
      );

      return result.success;
    } catch (error) {
      console.error('[DonationNotificationService] Email send error:', error);
      return false;
    }
  }

  /**
   * Queue receipt email via QStash
   */
  private async queueReceiptEmail(data: DonationReceiptData): Promise<void> {
    const jobId = `donation_receipt:${data.transactionRef || data.donorEmail || Date.now().toString()}`;
    await qstashService.publishJob('send_donation_receipt_email', {
      jobId,
      entityType: 'donation_receipt',
      entityId: data.transactionRef || data.donorEmail || '',
      data,
    });
  }

  /**
   * Send thank you SMS
   */
  private async sendThankYouSMS(donorName: string, amount: number, currency: string, phone: string): Promise<boolean> {
    try {
      const message = `Asante ${donorName}! Your ${currency} ${amount.toLocaleString()} donation has been received. You are making a real difference in securing land rights for communities. - HakiArdhi`;

      const result = await birdService.sendSMS(phone, message);
      return result.success;
    } catch (error) {
      console.error('[DonationNotificationService] SMS send error:', error);
      return false;
    }
  }

  /**
   * Queue thank you SMS
   */

  private async queueThankYouSMS(
  donorName: string,
  amount: number,
  currency: string,
  phone: string
): Promise<void> {
  await qstashService.publishJob(
    'send_thank_you_sms',
    {
      jobId: crypto.randomUUID(),   // generate a unique job ID
      entityType: 'donation',       // or whatever fits your domain
      entityId: phone,              // or donationId if available

      // custom fields
      donorName,
      amount,
      currency,
      phone,
    }
  );
}

  /**
   * Send thank you WhatsApp
   */
  private async sendThankYouWhatsApp(
    donorName: string,
    amount: number,
    currency: string,
    campaignName: string,
    phone: string
  ): Promise<boolean> {
    try {
      const message = `🙏 Asante sana ${donorName}!\n\nYour generous donation of *${currency} ${amount.toLocaleString()}* to *${campaignName}* has been successfully received.\n\nYour support is empowering communities to secure their land rights and build sustainable futures.\n\nYou will receive a detailed receipt via email shortly.\n\n- HakiArdhi Team`;

      const result = await birdService.sendWhatsApp(phone, message);
      return result.success;
    } catch (error) {
      console.error('[DonationNotificationService] WhatsApp send error:', error);
      return false;
    }
  }

  /**
   * Queue thank you WhatsApp
   */
 private async queueThankYouWhatsApp(
  donorName: string,
  amount: number,
  currency: string,
  campaignName: string,
  phone: string
): Promise<void> {
  await qstashService.publishJob(
    'send_thank_you_whatsapp',
    {
      jobId: crypto.randomUUID(),        // or your own job ID generator
      entityType: 'donation',
      entityId: phone,                   // or donationId if you have one

      // custom fields
      donorName,
      amount,
      currency,
      campaignName,
      phone,
    }
  );
}


  /**
   * Get campaign impact metrics
   */
  private async getCampaignImpact(campaignId: string): Promise<{
    beneficiariesHelped?: number;
    communitiesReached?: number;
    hectaresProtected?: number;
  }> {
    try {
      // Fetch campaign metadata (stored in campaign.metadata JSON field)
      const { data: campaign } = await this.db
        .from('donation_campaigns')
        .select('metadata')
        .eq('id', campaignId)
        .single();

      if (campaign?.metadata) {
        return {
          beneficiariesHelped: campaign.metadata.beneficiaries_helped,
          communitiesReached: campaign.metadata.communities_reached,
          hectaresProtected: campaign.metadata.hectares_protected,
        };
      }

      return {};
    } catch (error) {
      console.error('[DonationNotificationService] Impact fetch error:', error);
      return {};
    }
  }

  /**
   * Get target donors based on audience criteria
   */
  private async getTargetDonors(
    campaignId: string,
    audience: CampaignUpdateOptions['targetAudience']
  ): Promise<Array<{ id: string; name: string; email?: string; phone?: string }>> {
    try {
      let query = this.db.from('donations').select('donor_name, donor_email, donor_phone').eq('campaign_id', campaignId);

      if (audience === 'recurring_donors') {
        query = query.eq('is_recurring', true);
      } else if (audience === 'recent_donors') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      }

      query = query.eq('status', 'completed');

      const { data, error } = await query;

      if (error || !data) return [];

      // Deduplicate by email/phone
      const unique = new Map<string, any>();
      data.forEach(donor => {
        const key = donor.donor_email || donor.donor_phone;
        if (key && !unique.has(key)) {
          unique.set(key, {
            id: key,
            name: donor.donor_name,
            email: donor.donor_email,
            phone: donor.donor_phone,
          });
        }
      });

      return Array.from(unique.values());

    } catch (error) {
      console.error('[DonationNotificationService] Target donors fetch error:', error);
      return [];
    }
  }

  /**
   * Mark receipt as sent in database
   */
  private async markReceiptSent(donationId: string): Promise<void> {
    try {
      await this.db
        .from('donations')
        .update({
          receipt_sent: true,
          receipt_sent_at: new Date().toISOString(),
        })
        .eq('id', donationId);
    } catch (error) {
      console.error('[DonationNotificationService] Mark sent error:', error);
    }
  }

  /**
   * Track campaign update analytics
   */
  private async trackCampaignUpdate(campaignId: string, recipientCount: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `${this.CACHE_PREFIX}:stats:${today}`;

      await this.redis.hincrby(key, 'campaign_updates_sent', 1);
      await this.redis.hincrby(key, 'recipients_reached', recipientCount);

      await this.redis.expire(key, 7776000); // 90 days
    } catch (error) {
      console.error('[DonationNotificationService] Analytics error:', error);
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const donationNotificationService = new DonationNotificationService();
