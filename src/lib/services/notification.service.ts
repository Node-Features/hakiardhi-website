import { encode } from 'base-64';
import https from 'https';
import fetch from 'node-fetch';

interface SMSRecipient {
  to: string;           // phone number, e.g., "+255712345678"
  message: string;      // message text
  recipientId?: number; // optional, for Beem API tracking
}

interface SMSOptions {
  to: SMSRecipient[];   // array of recipients
  message?: string;     // optional global message if all recipients get the same text
}

interface WhatsAppOptions {
  to: string | string[];
  message: string;
  template?: string;
  data?: Record<string, any>;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private beemApiKey: string;
  private beemApiSecret: string;
  private metaAccessToken: string; // WhatsApp Business API
  private metaPhoneNumberId: string;
  private beemApiEndpoint: string;
  private beemSourceAddr = process.env.BEEM_SENDER_ID || 'INFO';
  private httpAgent = new https.Agent({ keepAlive: true });

  constructor() {
    this.beemApiKey = process.env.BEEM_API_KEY || '';
    this.beemApiSecret = process.env.BEEM_SECRET || '';
    this.beemApiEndpoint = process.env.BEEM_API_URL
      ? process.env.BEEM_API_URL + '/send'
      : 'https://apisms.beem.africa/v1/send';
    this.metaAccessToken = process.env.META_WA_ACCESS_TOKEN || '';
    this.metaPhoneNumberId = process.env.META_WA_PHONE_NUMBER_ID || '';
  }

  /**
   * Send a single SMS using Beem API
   */
  async sendSMS(options: SMSOptions): Promise<boolean> {

    if (!this.beemApiKey || !this.beemApiSecret || !this.beemSourceAddr) {
      console.warn('Beem API credentials or source address not configured. SMS not sent.');
      console.log(options);
      return false;
    }

    // Take the first valid recipient
    const recipient = options.to.find(r => r.to?.trim());
    if (!recipient) {
      console.warn('No valid SMS recipient provided.');
      return false;
    }

    const authHeader = 'Basic ' + encode(this.beemApiKey + ':' + this.beemApiSecret);

    const payload = {
      source_addr: this.beemSourceAddr,
      schedule_time: '',
      encoding: 0,
      message: options.message ?? recipient.message,
      recipients: [
        {
          recipient_id: recipient.recipientId ?? 1,
          dest_addr: recipient.to.replace('+', ''),
        },
      ],
    };

    try {

    console.log('📩 Sending SMS to single recipient with payload:', payload);

      const res = await fetch(this.beemApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(payload),
        // @ts-ignore
        agent: this.httpAgent,
        signal: AbortSignal.timeout(30000),
      });

      const data = await res.json();

      if (!res.ok || data.status !== 'success') {
        console.error('Beem SMS send failed:', data);
        return false;
      }

      console.log(`✅ SMS successfully sent to ${recipient.to}`);
      return true;
    } catch (err: any) {
      console.error('❌ Error sending SMS via Beem:', err.message || err);
      return false;
    }
  }

  /**
   * Send WhatsApp message via Meta Business API
   */
  async sendWhatsApp(options: WhatsAppOptions): Promise<boolean> {
    if (!this.metaAccessToken || !this.metaPhoneNumberId) {
      console.warn('Meta WhatsApp credentials not configured.');
      return false;
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    try {
      for (const to of recipients) {
        const payload = {
          messaging_product: 'whatsapp',
          to: to.replace('+', ''),
          type: 'text',
          text: { body: options.message },
        };

        const res = await fetch(
          `https://graph.facebook.com/v17.0/${this.metaPhoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.metaAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await res.json();
        if (!res.ok) console.error('WhatsApp send failed for', to, data);
      }

      console.log(`💬 WhatsApp sent to ${recipients.length} recipients`);
      return true;
    } catch (err) {
      console.error('❌ Error sending WhatsApp message:', err);
      return false;
    }
  }

  /**
   * Send email (placeholder for SendGrid or other service)
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    console.log('📧 Email would be sent to:', options.to, 'Subject:', options.subject);
    return true;
  }
}

export const notificationService = new NotificationService();
