/**
 * Donation Receipt Email Template
 * Professional email receipt for donations with tax information
 */

import {
  generateEmailTemplate,
  heading,
  textBlock,
  alertBox,
  statsRow,
} from './base-template';

export interface DonationReceiptData {
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  transactionRef: string;
  campaignName: string;
  campaignUrl?: string;
  donationDate: string;
  paymentMethod: string;
  isRecurring: boolean;
  frequency?: string;
  taxReceiptNumber?: string;
  impactMetrics?: {
    beneficiariesHelped?: number;
    communitiesReached?: number;
    hectaresProtected?: number;
  };
}

export function generateDonationReceipt(data: DonationReceiptData): string {
  const {
    donorName,
    amount,
    currency,
    transactionRef,
    campaignName,
    campaignUrl,
    donationDate,
    paymentMethod,
    isRecurring,
    frequency,
    taxReceiptNumber,
    impactMetrics,
  } = data;

  // Format amount with commas
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);

  // Build impact stats if available
  const impactStats = impactMetrics
    ? statsRow([
        {
          number: impactMetrics.beneficiariesHelped?.toString() || '0',
          label: 'Beneficiaries Helped',
        },
        {
          number: impactMetrics.communitiesReached?.toString() || '0',
          label: 'Communities Reached',
        },
        {
          number: impactMetrics.hectaresProtected?.toString() || '0',
          label: 'Hectares Protected',
        },
      ])
    : '';

  const bodyContent = `
    ${heading('Thank You for Your Generous Donation!', 1)}

    ${textBlock(`Your ${isRecurring ? `${frequency} recurring` : 'one-time'} donation of <strong style="color: #D62828;">${formattedAmount}</strong> has been successfully processed. Your support directly empowers communities to secure their land rights and build sustainable futures.`)}

    ${alertBox(
      `This email serves as your official donation receipt. Please keep it for your tax records.${
        taxReceiptNumber ? ` Tax Receipt Number: <strong>${taxReceiptNumber}</strong>` : ''
      }`,
      'success'
    )}

    ${heading('Donation Details', 2)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; background-color: #f9fafb; border-radius: 8px; padding: 24px;">
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40%" style="font-size: 14px; font-weight: 600; color: #667085;">Donor Name:</td>
              <td style="font-size: 14px; color: #101828;">${donorName}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40%" style="font-size: 14px; font-weight: 600; color: #667085;">Amount:</td>
              <td style="font-size: 14px; color: #101828; font-weight: 700;">${formattedAmount}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40%" style="font-size: 14px; font-weight: 600; color: #667085;">Campaign:</td>
              <td style="font-size: 14px; color: #101828;">${campaignName}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40%" style="font-size: 14px; font-weight: 600; color: #667085;">Transaction ID:</td>
              <td style="font-size: 14px; color: #101828; font-family: monospace;">${transactionRef}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40%" style="font-size: 14px; font-weight: 600; color: #667085;">Date:</td>
              <td style="font-size: 14px; color: #101828;">${donationDate}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40%" style="font-size: 14px; font-weight: 600; color: #667085;">Payment Method:</td>
              <td style="font-size: 14px; color: #101828;">${paymentMethod}</td>
            </tr>
          </table>
        </td>
      </tr>
      ${
        isRecurring
          ? `
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40%" style="font-size: 14px; font-weight: 600; color: #667085;">Frequency:</td>
              <td style="font-size: 14px; color: #101828;">${frequency}</td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ''
      }
    </table>

    ${impactStats ? heading('Your Impact', 2) + impactStats : ''}

    ${heading('What Happens Next?', 2)}

    ${textBlock('Your donation will be allocated to support our programs in land rights advocacy, legal aid services, community training, and research initiatives. You will receive quarterly updates on how your contribution is making a difference in the lives of communities across Tanzania.')}

    ${isRecurring ? alertBox('You are now a recurring donor! Your next donation will be processed on the same date next month. You can manage your subscription anytime through your donor portal.', 'info') : ''}

    ${textBlock('<strong>HakiArdhi is a registered non-profit organization (NGO Registration No. 00NGO/R/0142)</strong>. All donations are tax-deductible to the extent allowed by law.')}
  `;

  return generateEmailTemplate({
    logoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo-white.png`,
    preheaderText: `Thank you for your ${formattedAmount} donation to ${campaignName}`,
    recipientName: donorName,
    bodyContent,
    ctaButton: campaignUrl
      ? {
          text: 'View Campaign Progress',
          url: campaignUrl,
        }
      : undefined,
    secondaryButton: {
      text: 'Visit Your Donor Dashboard',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/donor/dashboard`,
    },
    footerText:
      'Questions about your donation? Contact us at donations@hakiardhi.or.tz or call +255 784 646 752.',
    socialLinks: {
      facebook: 'https://facebook.com/hakiardhi',
      twitter: 'https://twitter.com/hakiardhi',
      instagram: 'https://instagram.com/hakiardhi',
      linkedin: 'https://linkedin.com/company/hakiardhi',
    },
  });
}
