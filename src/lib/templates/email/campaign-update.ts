/**
 * Campaign Update Email Template
 * For donation campaigns, advocacy campaigns, and mobilization efforts
 */

import {
  generateEmailTemplate,
  heading,
  textBlock,
  statsRow,
  alertBox,
  bulletList,
} from './base-template';

export interface CampaignUpdateData {
  recipientName?: string;
  campaignName: string;
  campaignType: 'donation' | 'advocacy' | 'mobilization' | 'awareness';
  updateTitle: string;
  updateMessage: string;
  progress?: {
    current: number;
    target: number;
    unit: string; // 'TZS', 'people', 'signatures', 'hectares'
    label: string;
  };
  achievements?: string[];
  nextSteps?: string[];
  urgentAction?: {
    title: string;
    description: string;
    deadline?: string;
    actionUrl: string;
    actionText: string;
  };
  imageUrl?: string;
  campaignUrl?: string;
}

export function generateCampaignUpdate(data: CampaignUpdateData): string {
  const {
    recipientName,
    campaignName,
    campaignType,
    updateTitle,
    updateMessage,
    progress,
    achievements,
    nextSteps,
    urgentAction,
    imageUrl,
    campaignUrl,
  } = data;

  // Format progress percentage
  const progressPercent = progress
    ? Math.round((progress.current / progress.target) * 100)
    : 0;

  // Progress bar section
  const progressSection = progress
    ? `
    ${heading('Campaign Progress', 2)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; background-color: #f9fafb; border-radius: 12px; padding: 24px;">
      <tr>
        <td align="center">
          <p style="font-size: 48px; font-weight: 900; color: #D62828; line-height: 1; margin-bottom: 8px;">
            ${progressPercent}%
          </p>
          <p style="font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 16px;">
            ${progress.current.toLocaleString()} of ${progress.target.toLocaleString()} ${progress.unit}
          </p>

          <!-- Progress bar -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 8px;">
            <tr>
              <td style="background-color: #e4e7ec; border-radius: 9999px; height: 12px;">
                <table width="${progressPercent}%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="background: linear-gradient(90deg, #D62828 0%, #b71c1c 100%); border-radius: 9999px; height: 12px;"></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="font-size: 14px; color: #667085; margin: 0;">${progress.label}</p>
        </td>
      </tr>
    </table>
  `
    : '';

  // Achievements section
  const achievementsSection = achievements
    ? `
    ${heading('What We\'ve Accomplished', 2)}
    ${bulletList(achievements)}
  `
    : '';

  // Next steps section
  const nextStepsSection = nextSteps
    ? `
    ${heading('What\'s Next', 2)}
    ${bulletList(nextSteps)}
  `
    : '';

  // Urgent action section
  const urgentActionSection = urgentAction
    ? `
    ${alertBox(
      urgentAction.deadline
        ? `⏰ <strong>Urgent Action Needed by ${urgentAction.deadline}</strong>`
        : '⏰ <strong>Urgent Action Needed</strong>',
      'warning'
    )}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; background: linear-gradient(135deg, #fb6514 0%, #ec4a0a 100%); border-radius: 12px; padding: 32px; text-align: center;">
      <tr>
        <td>
          <h2 style="font-size: 22px; font-weight: 700; color: #FFFFFF; margin-bottom: 12px;">${urgentAction.title}</h2>
          <p style="font-size: 16px; color: #fff; line-height: 1.7; margin-bottom: 24px;">${urgentAction.description}</p>
          <table cellpadding="0" cellspacing="0" role="presentation" align="center">
            <tr>
              <td style="border-radius: 24px; background-color: #FFFFFF;">
                <a href="${urgentAction.actionUrl}" style="display: inline-block; padding: 12px 40px; font-size: 16px; font-weight: 600; color: #fb6514; text-decoration: none; border-radius: 24px;">
                  ${urgentAction.actionText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
    : '';

  const bodyContent = `
    ${heading(updateTitle, 1)}

    ${
      imageUrl
        ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td>
          <img src="${imageUrl}" alt="${updateTitle}" width="100%" style="display: block; border-radius: 8px; height: auto;" />
        </td>
      </tr>
    </table>
    `
        : ''
    }

    ${textBlock(updateMessage)}

    ${progressSection}

    ${achievementsSection}

    ${nextStepsSection}

    ${urgentActionSection}

    ${textBlock('Your support and engagement make this work possible. Together, we are creating lasting change for land rights in Tanzania.')}
  `;

  // Campaign type specific messages
  const footerMessages = {
    donation: 'Every contribution brings us closer to our goal. Share this campaign with your network!',
    advocacy:
      'Your voice matters! Join thousands of others advocating for land rights reform.',
    mobilization:
      'Community action creates change. Thank you for being part of this movement.',
    awareness:
      'Knowledge is power. Help us spread awareness by sharing this update.',
  };

  return generateEmailTemplate({
    logoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo-white.png`,
    preheaderText: `${campaignName}: ${updateTitle}`,
    recipientName,
    bodyContent,
    ctaButton: urgentAction
      ? undefined
      : campaignUrl
      ? {
          text: 'View Full Campaign',
          url: campaignUrl,
        }
      : undefined,
    secondaryButton: {
      text: 'Share on Social Media',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl || process.env.NEXT_PUBLIC_APP_URL!)}`,
    },
    footerText: footerMessages[campaignType],
    socialLinks: {
      facebook: 'https://facebook.com/hakiardhi',
      twitter: 'https://twitter.com/hakiardhi',
      instagram: 'https://instagram.com/hakiardhi',
      linkedin: 'https://linkedin.com/company/hakiardhi',
    },
  });
}
